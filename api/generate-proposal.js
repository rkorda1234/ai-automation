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
    const claudeRes = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
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

function buildPrompt(lead) {
  const fmt = v => (Array.isArray(v) ? v.join(', ') : v || 'Not specified');

  return `You are a senior AI automation consultant at Marketingverse. Analyse the business profile below and output a single JSON object — no markdown, no commentary, just the raw JSON.

## Business Profile
- Company: ${lead.company_name}
- Industry: ${lead.industry}
- Company Size: ${lead.company_size}
- Goals: ${fmt(lead.goals)}
- Team Roles: ${fmt(lead.roles)}
- Key Tasks / Processes: ${fmt(lead.tasks)}
- Current Software Stack: ${fmt(lead.software_used)}
- Main Bottleneck: ${fmt(lead.bottleneck)}
- Security Constraints: ${fmt(lead.security_constraints)}
- Implementation Timeline: ${fmt(lead.implementation_timeline)}

## Required JSON Schema
{
  "executiveSummary": "2-3 sentences summarising their biggest automation opportunity and expected impact",
  "readinessScore": <integer 1-10>,
  "readinessDiagnosis": "short label e.g. 'Strong Foundation' | 'Early Stage' | 'Ready to Scale'",
  "totalTimeSavedPerWeek": <integer hours saved across all recommendations>,
  "totalMonthlyValue": <integer dollar value of time saved + revenue impact>,
  "totalROI": "<string e.g. '8x' or '340%'>",
  "paybackPeriodDays": <integer>,
  "industryBenchmark": "one sentence comparing their score to similar ${lead.industry} businesses",
  "painPoints": [
    {
      "urgency": "high | medium | low",
      "title": "Short pain point title",
      "description": "Specific description tied to their answers"
    }
  ],
  "recommendations": [
    {
      "key": "responder | enrichment | invoicing | meetings | seo | chatbot",
      "name": "Automation name",
      "tagline": "One-line value tagline",
      "description": "What the automation does day-to-day",
      "whyThisMatters": "Why this is especially valuable for ${lead.company_name}",
      "toolsUsed": "Comma-separated tools from their stack or logical additions",
      "implementationWeek": <1-4>,
      "complexity": "easy | medium | advanced",
      "quickWin": <true | false>,
      "timeSavedPerWeek": <integer hours>,
      "monthlyValue": <integer dollars>,
      "roi": "<string e.g. '5x'>",
      "monthlyCost": <integer dollars>
    }
  ],
  "beforeAfter": {
    "before": "Vivid description of their current manual, painful state",
    "after": "Vivid description of their transformed, automated state"
  },
  "implementationRoadmap": [
    {
      "week": <1-4>,
      "name": "Phase name",
      "description": "What gets built and delivered this week"
    }
  ],
  "riskReversal": "Our concrete guarantee to ${lead.company_name}"
}

## Rules
- Include 3-5 pain points grounded in their specific answers
- Include 3-5 recommendations that match tools in their stack (${fmt(lead.software_used)})
- timeSavedPerWeek values must sum to totalTimeSavedPerWeek
- monthlyValue values must sum to totalMonthlyValue
- Keep all figures realistic and defensible for a ${lead.company_size} company in ${lead.industry}
- Output ONLY the JSON object — no other text`;
}
