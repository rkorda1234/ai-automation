import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://jusytlefuvoyvprwgxph.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1c3l0bGVmdXZveXZwcndneHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMDUxNTgsImV4cCI6MjA5NDg4MTE1OH0.84CATTtrEFehCnynWrK3JMxmZErNnALuMNourzGHkrs'
);

const URGENCY_COLOR = { high: 'urgency-high', medium: 'urgency-medium', low: 'urgency-low' };
const COMPLEXITY_LABEL = { easy: '🟢 Quick Win', medium: '🟡 Medium', advanced: '🔴 Advanced' };

const WORKFLOW_ICONS = {
  responder: '📥', enrichment: '🚀', invoicing: '🧾',
  meetings: '✍️', seo: '🛍️', chatbot: '💬'
};

let pollTimer = null;

async function init() {
  const leadId = getLeadId();

  if (!leadId) {
    showError('No proposal ID found.', 'Make sure you followed the correct link from your email or Slack notification.');
    return;
  }

  await loadProposal(leadId);
}

function getLeadId() {
  // Support both /[uuid] path and ?id=[uuid] query param
  const params = new URLSearchParams(window.location.search);
  if (params.get('id')) return params.get('id');

  const path = window.location.pathname.replace(/^\//, '').trim();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(path)) return path;

  return null;
}

async function loadProposal(leadId) {
  show('state-loading');

  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    showError(
      'Proposal not found.',
      'This proposal link may be invalid or expired. Contact hello@the-marketingverse.com.'
    );
    return;
  }

  if (data.status === 'generating') {
    show('state-generating');
    startPolling(leadId);
    return;
  }

  if (data.status === 'error') {
    showError(
      'Proposal generation failed.',
      'Our AI agents encountered an issue. Please contact hello@the-marketingverse.com and we will regenerate your proposal.'
    );
    return;
  }

  if (data.status === 'ready' && data.proposal_json) {
    stopPolling();
    // Merge top-level row fields (company_name, etc.) into the JSON so the
    // renderer can display them without needing a second leads table query.
    const merged = { ...data.proposal_json };
    if (!merged.company_name && data.company_name) merged.company_name = data.company_name;
    renderProposal(merged);
    return;
  }

  showError('Unexpected proposal state.', 'Please contact hello@the-marketingverse.com.');
}

function startPolling(leadId) {
  if (pollTimer) return;
  pollTimer = setInterval(() => loadProposal(leadId), 6000);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function renderProposal(json) {
  show('state-ready');

  // Hero — company_name can live inside the JSON or at the top-level row
  setText('prop-company-name', json.company_name || json.companyName || 'Your Company');
  setText('prop-executive-summary', json.executiveSummary || '');
  setText('prop-date', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));

  // Readiness score
  const score = json.readinessScore || 7;
  const pct = Math.round((score / 10) * 100);
  setText('prop-score-text', `${score}/10`);
  document.getElementById('prop-circle-fill').setAttribute('stroke-dasharray', `${pct}, 100`);
  setText('prop-readiness-diagnosis', json.readinessDiagnosis || '');

  // ROI bar — totalROI comes pre-formatted from Claude (e.g. "8x"), don't append %
  setText('roi-time-saved', json.totalTimeSavedPerWeek != null ? `${json.totalTimeSavedPerWeek} hrs` : '—');
  setText('roi-monthly-value', json.totalMonthlyValue != null ? `$${json.totalMonthlyValue.toLocaleString()}` : '—');
  setText('roi-total-roi', json.totalROI != null ? String(json.totalROI) : '—');
  setText('roi-payback', json.paybackPeriodDays != null ? `${json.paybackPeriodDays} days` : '—');
  setText('roi-benchmark', json.industryBenchmark || '');

  // Pain points
  const ppGrid = document.getElementById('pain-points-grid');
  (json.painPoints || []).forEach(pp => {
    const card = document.createElement('div');
    card.className = `pain-point-card ${URGENCY_COLOR[pp.urgency] || ''}`;
    card.innerHTML = `
      <div class="pp-urgency-badge">${pp.urgency || 'medium'} priority</div>
      <h4>${pp.title}</h4>
      <p>${pp.description}</p>
    `;
    ppGrid.appendChild(card);
  });

  // Recommendations
  const recList = document.getElementById('recommendations-list');
  (json.recommendations || []).forEach((rec, i) => {
    const icon = WORKFLOW_ICONS[rec.key] || '⚡';
    const complexity = COMPLEXITY_LABEL[rec.complexity] || rec.complexity;
    const card = document.createElement('div');
    card.className = 'prop-rec-card';
    card.innerHTML = `
      <div class="rec-card-header">
        <div class="rec-title-group">
          <div class="wf-icon-box">${icon}</div>
          <div>
            <div class="rec-week-badge">Week ${rec.implementationWeek || i + 1}</div>
            <h3>${rec.name}</h3>
            <p class="rec-tagline">${rec.tagline}</p>
          </div>
        </div>
        <div class="rec-badges">
          ${rec.quickWin ? '<span class="badge-quick-win">⚡ Quick Win</span>' : ''}
          <span class="badge-complexity">${complexity}</span>
        </div>
      </div>

      <div class="rec-body">
        <p class="rec-desc">${rec.description}</p>
        <div class="rec-why-box">
          <strong>Why this matters for you:</strong>
          <p>${rec.whyThisMatters}</p>
        </div>
        ${rec.toolsUsed ? `
        <div class="rec-tools-row">
          <span class="rec-tools-label">Integrates with</span>
          <div class="wf-integration-icons-list">
            ${rec.toolsUsed.split(',').map(t => `<span class="wf-int-icon-badge">${t.trim()}</span>`).join('')}
          </div>
        </div>` : ''}
      </div>

      <div class="rec-metrics-grid">
        <div class="rec-metric">
          <span class="rec-metric-val">${rec.timeSavedPerWeek || 0} hrs/wk</span>
          <span class="rec-metric-label">Time Saved</span>
        </div>
        <div class="rec-metric">
          <span class="rec-metric-val gradient-text">$${(rec.monthlyValue || 0).toLocaleString()}/mo</span>
          <span class="rec-metric-label">Monthly Value</span>
        </div>
        <div class="rec-metric">
          <span class="rec-metric-val">${rec.roi || '—'}</span>
          <span class="rec-metric-label">ROI</span>
        </div>
        <div class="rec-metric">
          <span class="rec-metric-val">$${(rec.monthlyCost || 0).toLocaleString()}/mo</span>
          <span class="rec-metric-label">Monthly Cost</span>
        </div>
      </div>
    `;
    recList.appendChild(card);
  });

  // Before / After
  setText('prop-before', json.beforeAfter?.before || '');
  setText('prop-after', json.beforeAfter?.after || '');

  // Roadmap — accept both key names the n8n prompt may produce
  const roadmapList = document.getElementById('roadmap-list');
  const roadmapSteps = json.implementationRoadmap || json.implementationTimeline || [];
  roadmapSteps.forEach(step => {
    const item = document.createElement('div');
    item.className = 'roadmap-item';
    item.innerHTML = `
      <div class="roadmap-week">Week ${step.week}</div>
      <div class="roadmap-content">
        <h4>${step.name || step.title || ''}</h4>
        <p>${step.description}</p>
      </div>
    `;
    roadmapList.appendChild(item);
  });

  // Risk section — accept both riskReversal string OR riskLevel+riskNote pair
  const riskText = json.riskReversal
    || (json.riskNote ? `${json.riskLevel ? `[${json.riskLevel} risk] ` : ''}${json.riskNote}` : '');
  setText('prop-risk-reversal', riskText);
}

function show(id) {
  ['state-loading', 'state-generating', 'state-error', 'state-ready'].forEach(s => {
    const el = document.getElementById(s);
    if (!el) return;
    if (s === id) {
      el.classList.remove('hidden-element');
    } else {
      el.classList.add('hidden-element');
    }
  });
}

function showError(title, detail) {
  show('state-error');
  setText('error-title', title);
  setText('error-detail', detail);
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

document.addEventListener('DOMContentLoaded', init);
