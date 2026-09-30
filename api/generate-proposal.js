const SUPABASE_URL = 'https://jusytlefuvoyvprwgxph.supabase.co';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!serviceKey || !anthropicKey) {
    console.error('[generate-proposal] Missing env vars');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const { leadId } = req.body;
  if (!leadId) return res.status(400).json({ error: 'leadId required' });

  const supaHeaders = {
    'Content-Type': 'application/json',
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };

  // Find the 'generating' proposal row created by save-lead
  const existingRes = await fetch(
    `${SUPABASE_URL}/rest/v1/proposals?lead_id=eq.${leadId}&order=created_at.desc&limit=1`,
    { headers: supaHeaders }
  );
  const existing = await existingRes.json();

  let proposalId = existing[0]?.id || null;

  // If it's already ready, nothing to do
  if (existing[0]?.status === 'ready') {
    return res.status(200).json({ proposalId, message: 'Already ready' });
  }

  // Create row if somehow missing
  if (!proposalId) {
    const createRes = await fetch(`${SUPABASE_URL}/rest/v1/proposals?select=id`, {
      method: 'POST',
      headers: { ...supaHeaders, Prefer: 'return=representation' },
      body: JSON.stringify({ lead_id: leadId, status: 'generating' }),
    });
    const rows = await createRes.json();
    proposalId = Array.isArray(rows) ? rows[0]?.id : rows?.id;
  }

  try {
    // Fetch lead data
    const leadRes = await fetch(
      `${SUPABASE_URL}/rest/v1/leads?id=eq.${leadId}&select=*&limit=1`,
      { headers: supaHeaders }
    );
    const leads = await leadRes.json();
    const lead = leads[0];
    if (!lead) throw new Error(`Lead ${leadId} not found`);

    // Call Claude
    const prompt = buildPrompt(lead);
    const anthropicHeaders = {
      'Content-Type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
    };
    if (process.env.ANTHROPIC_WORKSPACE_ID) {
      anthropicHeaders['anthropic-workspace-id'] = process.env.ANTHROPIC_WORKSPACE_ID;
    }

    const claudeRes = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: anthropicHeaders,
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.text();
      throw new Error(`Claude API error ${claudeRes.status}: ${err}`);
    }

    const claudeData = await claudeRes.json();
    const rawText = claudeData.content?.[0]?.text || '';

    // Extract JSON — accept bare object or fenced block
    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) || rawText.match(/(\{[\s\S]*\})/);
    if (!jsonMatch) throw new Error('Claude returned no parseable JSON');
    const proposalJson = JSON.parse(jsonMatch[1]);
    proposalJson.company_name = lead.company_name;

    // Save proposal as ready
    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/proposals?id=eq.${proposalId}`, {
      method: 'PATCH',
      headers: { ...supaHeaders, Prefer: 'return=minimal' },
      body: JSON.stringify({ status: 'ready', proposal_json: proposalJson }),
    });
    if (!patchRes.ok) {
      const errText = await patchRes.text();
      throw new Error(`Supabase PATCH error ${patchRes.status}: ${errText}`);
    }

    console.log('[generate-proposal] Done for lead', leadId);
    return res.status(200).json({ proposalId });
  } catch (err) {
    console.error('[generate-proposal] Error:', err.message);
    if (proposalId) {
      await fetch(`${SUPABASE_URL}/rest/v1/proposals?id=eq.${proposalId}`, {
        method: 'PATCH',
        headers: { ...supaHeaders, Prefer: 'return=minimal' },
        body: JSON.stringify({ status: 'error' }),
      }).catch(() => {});
    }
    return res.status(500).json({ error: err.message });
  }
}

const WORKFLOW_MAP = {
  responder:  { name: '24/7 Smart Email Assistant',            price: 299 },
  enrichment: { name: 'Lead Scout & Automated Outreach',       price: 399 },
  invoicing:  { name: 'Automated Bookkeeper & Receipt Reader', price: 199 },
  meetings:   { name: 'Meeting Secretary & Auto-Tasker',       price: 149 },
  seo:        { name: 'AI Product Writer & Social Copywriter', price: 249 },
  chatbot:    { name: '24/7 Smart Web Assistant',              price: 449 },
};

function buildPrompt(lead) {
  const fmt = v => (Array.isArray(v) ? v.join(', ') : v || 'Not specified');

  const selectedWorkflows = (lead.selected_workflows || []).map(w => ({
    key: w,
    name: WORKFLOW_MAP[w]?.name || w,
    price: WORKFLOW_MAP[w]?.price || 0,
  }));
  const workflowsStr = selectedWorkflows.length
    ? selectedWorkflows.map(w => `${w.name} ($${w.price}/mo)`).join(', ')
    : 'Not specified';

  return `You are a senior AI automation strategist with deep expertise implementing automation stacks for small and mid-size businesses.

CRITICAL RULES:
- ONLY recommend automations that integrate with the tools the business already uses (listed under "Current Software"). Do NOT suggest tools or platforms they did not mention.
- Base every recommendation on evidence from their actual answers — their specific bottleneck, goals, roles, and tasks.
- Do not use generic recommendations. Every section must reference their company name, industry, or stated problems.

BUSINESS PROFILE:
- Company: ${lead.company_name}
- Industry: ${lead.industry}
- Size: ${lead.company_size}
- Goals: ${fmt(lead.goals)}
- Key Roles affected: ${fmt(lead.roles)}
- Current Tasks to automate: ${fmt(lead.tasks)}
- Current Software (ONLY build recommendations around these tools): ${fmt(lead.software_used)}
- Main Bottleneck: ${fmt(lead.bottleneck)}
- Security Requirements: ${fmt(lead.security_constraints)}
- Implementation Timeline: ${fmt(lead.implementation_timeline)}
- Selected Automations: ${workflowsStr}
- Monthly Budget: $${lead.monthly_total || 0}/mo

Before generating the proposal, internally reason through:
1. What are their 3-5 biggest time/money drains based on their bottleneck, tasks, and roles?
2. Which of their selected automations directly address those drains?
3. What ROI is realistic given their size and budget?
4. How does their existing software stack (and ONLY that stack) shape the implementation?

Generate a detailed, personalized proposal as a JSON object with EXACTLY this structure (no markdown, pure JSON):

{
  "readinessScore": <number 1-10, based on how ready they are for AI automation>,
  "readinessDiagnosis": "<2 sentences explaining the score>",
  "executiveSummary": "<3-4 sentences personalised to their company, bottleneck and goals>",
  "painPoints": [
    { "title": "<pain point title>", "description": "<why this hurts their business>", "urgency": "high|medium|low" }
  ],
  "recommendations": [
    {
      "key": "<workflow key from: responder|enrichment|invoicing|meetings|seo|chatbot>",
      "name": "<automation name>",
      "tagline": "<punchy one-liner>",
      "description": "<what it does in plain english, 2 sentences>",
      "whyThisMatters": "<specific to their company and bottleneck, 2 sentences>",
      "toolsUsed": "<only tools from their Current Software list>",
      "timeSavedPerWeek": <hours as number>,
      "monthlyCost": <price as number>,
      "monthlyValue": <estimated dollar value generated or saved as number>,
      "roi": "<e.g. 8x>",
      "paybackDays": <number>,
      "complexity": "easy|medium|advanced",
      "implementationWeek": <1|2|3|4>,
      "quickWin": <true if high impact + easy>
    }
  ],
  "totalTimeSavedPerWeek": <sum of all timeSavedPerWeek>,
  "totalMonthlyValue": <sum of all monthlyValue>,
  "totalROI": "<overall ROI multiplier e.g. '8x'>",
  "paybackPeriodDays": <average payback across recommendations>,
  "industryBenchmark": "<one sentence: what companies like theirs typically achieve with this stack>",
  "beforeAfter": {
    "before": "<describe their biggest workflow pain point as it is today>",
    "after": "<describe that same workflow after automation, specific and vivid>"
  },
  "implementationRoadmap": [
    { "week": <number>, "name": "<milestone title>", "description": "<what gets done>" }
  ],
  "riskLevel": "low|medium|high",
  "riskReversal": "<one sentence guarantee specific to their situation>"
}`;
}
