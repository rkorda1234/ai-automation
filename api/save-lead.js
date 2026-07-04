const SUPABASE_URL = 'https://jusytlefuvoyvprwgxph.supabase.co';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const slackUrl = process.env.SLACK_WEBHOOK_URL;

  if (!serviceKey) {
    console.error('[save-lead] SUPABASE_SERVICE_ROLE_KEY not set');
    return res.status(500).json({ error: 'Server configuration error: missing Supabase key' });
  }

  const {
    leadId,
    submissionType,
    companyName,
    industry,
    companySize,
    goals,
    roles,
    tasks,
    softwareUsed,
    bottleneck,
    securityConstraints,
    contactName,
    contactEmail,
    contactPhone,
    implementationTimeline,
    selectedWorkflows,
    deliveryTimeline,
    monthlyTotal,
    setupTotal,
    firstMonthTotal,
  } = req.body;

  try {
    let resultId = leadId || null;

    if (leadId && submissionType !== 'form_submit') {
      // Update existing lead row with cart/checkout data
      const updateRes = await fetch(
        `${SUPABASE_URL}/rest/v1/leads?id=eq.${leadId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            selected_workflows: selectedWorkflows,
            delivery_timeline: deliveryTimeline,
            monthly_total: monthlyTotal,
            setup_total: setupTotal,
            first_month_total: firstMonthTotal,
            submission_type: submissionType,
          }),
        }
      );
      if (!updateRes.ok) {
        const errText = await updateRes.text();
        console.error('[save-lead] Supabase PATCH error:', updateRes.status, errText);
      }
    } else {
      // Insert new lead row
      const insertRes = await fetch(
        `${SUPABASE_URL}/rest/v1/leads?select=id`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            company_name: companyName,
            industry,
            company_size: companySize,
            goals,
            roles,
            tasks,
            software_used: softwareUsed,
            bottleneck,
            security_constraints: securityConstraints,
            contact_name: contactName,
            contact_email: contactEmail,
            contact_phone: contactPhone || null,
            implementation_timeline: implementationTimeline,
            selected_workflows: selectedWorkflows,
            delivery_timeline: deliveryTimeline,
            monthly_total: monthlyTotal,
            setup_total: setupTotal,
            first_month_total: firstMonthTotal,
            submission_type: submissionType,
          }),
        }
      );
      if (insertRes.ok) {
        const rows = await insertRes.json();
        resultId = Array.isArray(rows) ? rows[0]?.id : rows?.id;
      } else {
        const errText = await insertRes.text();
        console.error('[save-lead] Supabase INSERT error:', insertRes.status, errText);
      }
    }

    // Trigger n8n proposal generation after a new form_submit lead is saved
    if (submissionType === 'form_submit' && resultId) {
      await fetch(
        `https://marketingverse.app.n8n.cloud/webhook/generate-proposal?leadId=${encodeURIComponent(resultId)}`,
        { method: 'GET' }
      ).catch(e => console.error('[save-lead] n8n proposal webhook error:', e.message));
    }

    // Slack notification on diagnostics form submit
    if (submissionType === 'form_submit' && slackUrl) {
      const goalsText = Array.isArray(goals) ? goals.join(', ') : (goals || '—');
      const tasksText = Array.isArray(tasks) ? tasks.join(', ') : (tasks || '—');

      await fetch(slackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocks: [
            {
              type: 'header',
              text: { type: 'plain_text', text: '🚀 New AI Automation Lead!', emoji: true },
            },
            {
              type: 'section',
              fields: [
                { type: 'mrkdwn', text: `*Company:*\n${companyName || '—'}` },
                { type: 'mrkdwn', text: `*Industry:*\n${industry || '—'}` },
                { type: 'mrkdwn', text: `*Contact:*\n${contactName || '—'}` },
                { type: 'mrkdwn', text: `*Email:*\n${contactEmail || '—'}` },
                { type: 'mrkdwn', text: `*Company Size:*\n${companySize || '—'}` },
                { type: 'mrkdwn', text: `*Timeline:*\n${implementationTimeline || '—'}` },
              ],
            },
            {
              type: 'section',
              text: { type: 'mrkdwn', text: `*Goals:* ${goalsText}` },
            },
            {
              type: 'section',
              text: { type: 'mrkdwn', text: `*Key Tasks:* ${tasksText}` },
            },
            ...(bottleneck ? [{
              type: 'section',
              text: { type: 'mrkdwn', text: `*Bottleneck:* ${bottleneck}` },
            }] : []),
          ],
        }),
      }).catch(e => console.error('[save-lead] Slack notification error:', e.message));
    }

    return res.status(200).json({ id: resultId });
  } catch (err) {
    console.error('[save-lead] Unexpected error:', err.message);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
