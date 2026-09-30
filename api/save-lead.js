const SUPABASE_URL = 'https://jusytlefuvoyvprwgxph.supabase.co';
const GHL_BASE = 'https://services.leadconnectorhq.com';

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

      // GHL contact upsert + opportunity on form_submit
      if (submissionType === 'form_submit' && resultId) {
        const ghlKey = process.env.GHL_API_KEY;
        const locationId = process.env.GHL_LOCATION_ID || 'CFAAUO2gnPooyim4LdoM';
        const assignedTo = process.env.GHL_ASSIGNED_TO || 'SFwaytDY2HvU0FfEs8LN';
        const pipelineId = process.env.GHL_PIPELINE_ID;
        const stageId = process.env.GHL_STAGE_ID;

        if (ghlKey) {
          const ghlHeaders = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ghlKey}`,
            Version: '2021-07-28',
          };

          let ghlContactId = null;

          // Search existing contact by email
          try {
            const searchRes = await fetch(
              `${GHL_BASE}/contacts/?query=${encodeURIComponent(contactEmail)}&locationId=${locationId}`,
              { headers: ghlHeaders }
            );
            const searchData = await searchRes.json();
            if (searchData.contacts?.length > 0) {
              ghlContactId = searchData.contacts[0].id;
              console.log('[save-lead] GHL existing contact:', ghlContactId);
            }
          } catch (e) {
            console.error('[save-lead] GHL search error:', e.message);
          }

          // Create contact if not found
          if (!ghlContactId) {
            const nameParts = (contactName || '').trim().split(/\s+/);
            try {
              const createRes = await fetch(`${GHL_BASE}/contacts/`, {
                method: 'POST',
                headers: ghlHeaders,
                body: JSON.stringify({
                  firstName: nameParts[0] || '',
                  lastName: nameParts.slice(1).join(' ') || '',
                  email: contactEmail,
                  phone: contactPhone || null,
                  companyName,
                  locationId,
                  source: 'Mverse.AI Diagnostic',
                  assignedTo,
                  tags: ['mverse-ai', 'form_submit'],
                }),
              });
              const createData = await createRes.json();
              // Handle both success and duplicate-contact error
              ghlContactId = createData.contact?.id || createData.meta?.contactId || null;
              console.log('[save-lead] GHL contact created/found:', ghlContactId);
            } catch (e) {
              console.error('[save-lead] GHL create error:', e.message);
            }
          }

          // Create opportunity
          if (ghlContactId && pipelineId) {
            try {
              await fetch(`${GHL_BASE}/opportunities/`, {
                method: 'POST',
                headers: ghlHeaders,
                body: JSON.stringify({
                  pipelineId,
                  pipelineStageId: stageId || undefined,
                  contactId: ghlContactId,
                  name: `AI Automation — ${companyName}`,
                  status: 'open',
                  assignedTo,
                  source: 'Mverse.AI Diagnostic',
                }),
              });
              console.log('[save-lead] GHL opportunity created for contact:', ghlContactId);
            } catch (e) {
              console.error('[save-lead] GHL opportunity error:', e.message);
            }
          }
        }

        // Create proposal row as 'generating' so the proposal page shows the right state
        await fetch(`${SUPABASE_URL}/rest/v1/proposals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({ lead_id: resultId, status: 'generating' }),
        }).catch(e => console.error('[save-lead] Proposal row error:', e.message));

        // Trigger proposal generation server-to-server so the browser navigating away can't cancel it
        const appBase = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'https://proposal.the-marketingverse.com';
        fetch(`${appBase}/api/generate-proposal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId: resultId }),
        }).catch(e => console.error('[save-lead] generate-proposal trigger error:', e.message));
      }
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
