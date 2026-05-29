import { launchConfetti } from './confetti.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://jusytlefuvoyvprwgxph.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1c3l0bGVmdXZveXZwcndneHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMDUxNTgsImV4cCI6MjA5NDg4MTE1OH0.84CATTtrEFehCnynWrK3JMxmZErNnALuMNourzGHkrs'
);

/* ==========================================================================
   WORKFLOW RECOMMENDATION DATA CATALOG
   ========================================================================== */
const WORKFLOWS_CATALOG = [
  {
    id: 'responder',
    name: '24/7 Smart Email Assistant',
    category: 'customer_service',
    icon: '📥',
    tagline: 'Autonomous customer inquiry triage & auto-drafting',
    desc: 'Instantly drafts perfect, polite replies to incoming customer support emails, looks up answers automatically in your business documents, and queues up high-quality drafts in Gmail or Zendesk so you stay in total control.',
    integrations: ['gmail', 'zendesk', 'slack', 'notion'],
    checklist: [
      'Drafts professional email replies automatically',
      'Searches your internal company guidebooks for answers',
      'Flags urgent issues and alerts your team on Slack',
      'Keeps draft messages pending approval in your outbox'
    ],
    hoursSaved: 18,
    price: 299,
    setupFee: 490,
    flow: [
      { label: 'Trigger', text: 'New Support Email', type: 'node-trigger' },
      { label: 'Agent', text: 'Smart FAQ Answerer', type: 'node-agent' },
      { label: 'Action', text: 'Queue Draft & Alert Team', type: 'node-action' }
    ]
  },
  {
    id: 'enrichment',
    name: 'Lead Scout & Automated Outreach',
    category: 'sales',
    icon: '🚀',
    tagline: 'Automated hyper-personalized cold pipeline scaling',
    desc: 'Finds and prepares new customer leads on autopilot. Scans inbound sign-ups or target lists, researches their LinkedIn profiles, writes tailored intro messages, and logs everything in HubSpot or Salesforce.',
    integrations: ['hubspot', 'salesforce', 'gmail', 'slack'],
    checklist: [
      'Researches prospect profiles on LinkedIn automatically',
      'Writes highly personalized email icebreakers',
      'Updates your sales CRM database instantly',
      'Saves hours of copywriting and manual typing'
    ],
    hoursSaved: 22,
    price: 399,
    setupFee: 650,
    flow: [
      { label: 'Trigger', text: 'New Business Lead', type: 'node-trigger' },
      { label: 'Agent', text: 'LinkedIn Research Scout', type: 'node-agent' },
      { label: 'Action', text: 'Log CRM & Draft Intro', type: 'node-action' }
    ]
  },
  {
    id: 'invoicing',
    name: 'Automated Bookkeeper & Receipt Reader',
    category: 'data_operations',
    icon: '🧾',
    tagline: 'Zero-effort invoice parsing & financial logging',
    desc: 'Never key in receipt data again. Scans GSuite folders or email attachments for PDF invoices, extracts totals, taxes, and vendor info, audits them, and syncs them directly to Stripe or QuickBooks.',
    integrations: ['gmail', 'stripe', 'slack'],
    checklist: [
      'Reads PDF invoices and receipts automatically',
      'Extracts totals, line-items, and tax details',
      'Detects duplicate bills and accounting errors',
      'Syncs transactions directly to Stripe or ledger tools'
    ],
    hoursSaved: 12,
    price: 199,
    setupFee: 350,
    flow: [
      { label: 'Trigger', text: 'New Invoice PDF', type: 'node-trigger' },
      { label: 'Agent', text: 'Smart Receipt Scanner', type: 'node-agent' },
      { label: 'Action', text: 'Log Ledger & Post Notification', type: 'node-action' }
    ]
  },
  {
    id: 'meetings',
    name: 'Meeting Secretary & Auto-Tasker',
    category: 'executive_assistant',
    icon: '✍️',
    tagline: 'Turn voice transcriptions into structured dev sprints',
    desc: 'Turns long video calls into organized todo lists. Transcribes your Zoom or Google Meet calls, filters out casual small talk, extracts actual decisions and next steps, and uploads tasks straight into Notion or Trello.',
    integrations: ['notion', 'slack', 'gmail'],
    checklist: [
      'Transcribes calls and filters voice-to-text clutter',
      'Extracts clear action items and deadlines',
      'Assigns tasks to team members based on context',
      'Updates project boards in Notion, Trello, or Jira'
    ],
    hoursSaved: 10,
    price: 149,
    setupFee: 250,
    flow: [
      { label: 'Trigger', text: 'Meeting Concludes', type: 'node-trigger' },
      { label: 'Agent', text: 'Smart Note Taker & Tasker', type: 'node-agent' },
      { label: 'Action', text: 'Upload Tickets to Notion', type: 'node-action' }
    ]
  },
  {
    id: 'seo',
    name: 'AI Product Writer & Social Media Copywriter',
    category: 'marketing',
    icon: '🛍️',
    tagline: 'Dynamic product optimization & social scheduling',
    desc: 'Keep your store fresh and rank high on Google. Automatically drafts SEO-optimized descriptions for new products, generates search tags, and writes engaging marketing posts for social feeds.',
    integrations: ['shopify', 'notion', 'slack'],
    checklist: [
      'Drafts catchy, search-optimized descriptions',
      'Auto-generates Google keywords and product tags',
      'Writes promotional social media posts',
      'Syncs drafts directly into Shopify or your store'
    ],
    hoursSaved: 15,
    price: 249,
    setupFee: 400,
    flow: [
      { label: 'Trigger', text: 'New Product Added', type: 'node-trigger' },
      { label: 'Agent', text: 'Copywriter & SEO Expert', type: 'node-agent' },
      { label: 'Action', text: 'Publish to Shopify & Notify', type: 'node-action' }
    ]
  },
  {
    id: 'chatbot',
    name: '24/7 Smart Web Assistant',
    category: 'customer_service',
    icon: '💬',
    tagline: '24/7 client support agent with semantic search',
    desc: 'An intelligent chatbot for your website that handles client questions instantly around the clock using your company PDFs and guides, with a smooth transfer to human agents for complex matters.',
    integrations: ['zendesk', 'slack', 'notion'],
    checklist: [
      'Answers FAQs in human-like conversational dialogue',
      'Answers accurately using your company docs as a guide',
      'Gently hand-offs complex questions to your support team',
      'Resolves 70% of common questions with no human time needed'
    ],
    hoursSaved: 28,
    price: 449,
    setupFee: 750,
    flow: [
      { label: 'Trigger', text: 'Website visitor types a message', type: 'node-trigger' },
      { label: 'Agent', text: 'Context-Aware Assistant', type: 'node-agent' },
      { label: 'Action', text: 'Reply instantly or alert support rep', type: 'node-action' }
    ]
  }
];

/* ==========================================================================
   DYNAMIC SOP TASKS DATABASE
   ========================================================================== */
const TASKS_DATABASE = {
  customer_service: {
    title: 'Customer Service Representative',
    emoji: '🎧',
    tasks: [
      { id: 'task_cs_email', text: 'Responding to customer emails' },
      { id: 'task_cs_chat', text: 'Live chat support' },
      { id: 'task_cs_reviews', text: 'Replying to Google/Yelp reviews' },
      { id: 'task_cs_returns', text: 'Handling returns and refunds' }
    ]
  },
  executive_assistant: {
    title: 'Executive / Virtual Assistant',
    emoji: '👔',
    tasks: [
      { id: 'task_ea_calendar', text: 'Calendar management & scheduling' },
      { id: 'task_ea_inbox', text: 'Inbox triage and management' },
      { id: 'task_ea_transcription', text: 'Meeting transcription and summarization' }
    ]
  },
  data_operations: {
    title: 'Data Handler / Operations',
    emoji: '📊',
    tasks: [
      { id: 'task_ops_data_entry', text: 'Manual data entry' },
      { id: 'task_ops_crm', text: 'CRM updates and maintenance' },
      { id: 'task_ops_reports', text: 'Generating weekly/monthly reports' },
      { id: 'task_ops_invoicing', text: 'Invoicing and expense tracking' }
    ]
  },
  sales: {
    title: 'Sales Person',
    emoji: '💼',
    tasks: [
      { id: 'task_sales_outbound', text: 'Outbound lead generation' },
      { id: 'task_sales_inbound', text: 'Qualifying inbound leads' },
      { id: 'task_sales_followup', text: 'Follow-up email sequences' },
      { id: 'task_sales_booking', text: 'Booking sales calls' }
    ]
  },
  marketing: {
    title: 'Marketing & Content Creator',
    emoji: '🎨',
    tasks: [
      { id: 'task_mkt_strategy', text: 'Marketing campaign strategy' },
      { id: 'task_mkt_social', text: 'Social media caption writing & scheduling' },
      { id: 'task_mkt_dms', text: 'Replying to social media comments/DMs' },
      { id: 'task_mkt_blog', text: 'Blog post / Newsletter writing' },
      { id: 'task_mkt_adcopy', text: 'Ad copy creation' }
    ]
  },
  it_support: {
    title: 'IT & Technical Support',
    emoji: '💻',
    tasks: [
      { id: 'task_it_passwords', text: 'Resetting passwords / basic troubleshooting' },
      { id: 'task_it_onboarding', text: 'Software onboarding/offboarding for employees' },
      { id: 'task_it_monitoring', text: 'System monitoring and alerts' }
    ]
  }
};

/* ==========================================================================
   APP STATE ENGINE
   ========================================================================== */
const state = {
  currentStep: 0,

  // Step 1
  companyName: '',
  industry: '',
  companySize: '',
  goals: [],

  // Step 2
  roles: [],
  tasks: [],
  customRoles: [],

  // Step 3
  softwareUsed: '',
  bottleneck: '',
  security: '',

  // Step 4
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  timeline: '',

  // Cart & Calc
  manualHours: 15,
  hourlyRate: 40,
  cart: new Set(),
  deliveryTimeline: 'standard',

  // Set after successful lead save
  leadId: null
};

const HEADCOUNT_FACTOR = {
  '1-10': 5,
  '11-50': 25,
  '51-200': 100,
  '201+': 250
};

/* ==========================================================================
   DOM ELEMENTS SELECTORS
   ========================================================================== */
const DOM = {
  // Screens
  welcomeStep: document.getElementById('welcome-step'),
  diagnosticWizard: document.getElementById('diagnostic-wizard'),
  recommendationsContainer: document.getElementById('recommendations-container'),

  // Step 1
  startAuditBtn: document.getElementById('start-audit-btn'),
  companyNameInput: document.getElementById('company-name'),
  industrySelect: document.getElementById('industry-select'),
  companySizeSelect: document.getElementById('company-size'),
  goalsCheckboxes: document.querySelectorAll('input[name="goals"]'),

  // Step 2
  rolesAccordionContainer: document.getElementById('roles-accordion-container'),
  addCustomRoleBtn: document.getElementById('add-custom-role-btn'),

  // Step 3
  softwareChips: document.getElementById('software-chips'),
  softwareOtherCb: document.getElementById('software-other-cb'),
  softwareOtherInput: document.getElementById('software-other-input'),
  bottleneckInput: document.getElementById('biggest-bottleneck'),
  securitySelect: document.getElementById('security-constraints'),

  // Step 4
  contactNameInput: document.getElementById('contact-name'),
  contactEmailInput: document.getElementById('contact-email'),
  contactPhoneInput: document.getElementById('contact-phone'),
  timelineSelect: document.getElementById('implementation-timeline'),

  // Wizard Navigation
  prevStepBtn: document.getElementById('prev-step-btn'),
  nextStepBtn: document.getElementById('next-step-btn'),
  trackerFill: document.querySelector('.tracker-fill'),
  trackerLabels: document.querySelectorAll('.step-label'),

  // Recommendations Panel
  dynCompanyName: document.getElementById('dyn-company-name'),
  circlePercentageText: document.querySelector('.circle-percentage'),
  circleFill: document.querySelector('.circle-fill'),
  workflowsGrid: document.getElementById('workflows-grid'),
  filterBtns: document.querySelectorAll('.filter-btn'),

  // Cart Aside
  cartAside: document.getElementById('cart-aside'),
  cartToggleBtn: document.getElementById('cart-toggle-btn'),
  cartBadgeCount: document.querySelector('.cart-badge-count'),
  cartSidebarCount: document.getElementById('cart-sidebar-count'),
  cartEmptyState: document.getElementById('cart-empty-state'),
  cartFilledState: document.getElementById('cart-filled-state'),
  cartItemsList: document.getElementById('cart-items-list'),
  timelineUrgencyInputs: document.querySelectorAll('input[name="timeline-urgency"]'),

  // Pricing Summaries
  roiHoursSaved: document.getElementById('roi-hours-saved'),
  roiDollarsSaved: document.getElementById('roi-dollars-saved'),
  summaryMonthlySubtotal: document.getElementById('summary-monthly-subtotal'),
  summarySetupSubtotal: document.getElementById('summary-setup-subtotal'),
  summaryExpressRow: document.getElementById('summary-express-row'),
  summaryExpressCharge: document.getElementById('summary-express-charge'),
  summaryFirstMonthTotal: document.getElementById('summary-first-month-total'),

  // Checkout Modal
  checkoutModal: document.getElementById('checkout-modal'),
  checkoutTriggerBtn: document.getElementById('checkout-trigger-btn'),
  checkoutSummaryItemsList: document.getElementById('checkout-summary-items-list'),
  checkoutSummaryTotal: document.getElementById('checkout-summary-total'),
  scheduleTodayCharge: document.getElementById('schedule-today-charge'),
  scheduleBalanceCharge: document.getElementById('schedule-balance-charge'),
  bookStrategyBtn: document.getElementById('book-strategy-btn'),
  paymentForm: document.getElementById('payment-form'),
  btnPaySubmit: document.getElementById('btn-pay-submit'),
  btnPayTotal: document.getElementById('btn-pay-total'),
  btnReturnCart: document.querySelector('.btn-return-cart'),

  // Success Modal
  successModal: document.getElementById('success-modal'),
  receiptId: document.getElementById('receipt-id'),
  receiptClientName: document.getElementById('receipt-client-name'),
  receiptDate: document.getElementById('receipt-date'),
  receiptDeliveryTier: document.getElementById('receipt-delivery-tier'),
  receiptSettledTotal: document.getElementById('receipt-settled-total'),
  receiptItemsList: document.getElementById('receipt-items-list'),
  successDoneBtn: document.getElementById('success-done-btn'),
  confirmBookingBtn: document.getElementById('confirm-booking-btn'),
  calendarDays: document.querySelectorAll('.cal-day'),
  calendarSlots: document.querySelectorAll('.cal-slot')
};

/* ==========================================================================
   INITIALIZATION & EVENT BINDINGS
   ========================================================================== */
function init() {
  generateRolesAccordion();
  bindFormWizard();
  bindCartInteractions();
  bindCheckoutSimulator();
  bindBookingScheduler();
}

/* ==========================================================================
   WIZARD FLOW & STEP SWITCHER
   ========================================================================== */
function bindFormWizard() {
  DOM.startAuditBtn.addEventListener('click', () => {
    DOM.welcomeStep.classList.remove('active-step');
    DOM.welcomeStep.classList.add('hidden-step');
    DOM.diagnosticWizard.classList.remove('hidden-step');
    DOM.diagnosticWizard.classList.add('active-step');
    state.currentStep = 1;
    updateWizardUI();
  });

  DOM.nextStepBtn.addEventListener('click', () => {
    if (validateStep(state.currentStep)) {
      if (state.currentStep === 4) {
        submitDiagnostics();
      } else {
        state.currentStep++;
        updateWizardUI();
      }
    }
  });

  DOM.prevStepBtn.addEventListener('click', () => {
    if (state.currentStep > 1) {
      state.currentStep--;
      updateWizardUI();
    }
  });

  DOM.goalsCheckboxes = document.querySelectorAll('input[name="goals"]');

  DOM.softwareOtherCb.addEventListener('change', (e) => {
    if (e.target.checked) {
      DOM.softwareOtherInput.classList.remove('hidden-element');
      DOM.softwareOtherInput.focus();
    } else {
      DOM.softwareOtherInput.classList.add('hidden-element');
      DOM.softwareOtherInput.value = '';
    }
  });

  DOM.addCustomRoleBtn.addEventListener('click', () => {
    const customId = `custom_role_${Date.now()}`;
    const html = `
      <div class="role-accordion-item">
        <label class="role-accordion-header custom-role-header">
          <input type="checkbox" name="roles" value="${customId}" checked>
          <span class="role-emoji">✨</span>
          <input type="text" class="custom-role-input" placeholder="Type Custom Role Name..." style="flex:1; border:none; background:transparent; font-size:16px; outline:none; color:inherit;">
        </label>
        <div class="role-tasks-drawer expanded">
          <p style="margin-bottom:10px; font-size:0.9rem; color:var(--text-secondary);">List the repetitive tasks for this role:</p>
          <textarea class="form-input textarea-input custom-role-tasks-textarea" placeholder="e.g. Data entry, filing forms..."></textarea>
        </div>
      </div>
    `;
    DOM.rolesAccordionContainer.insertAdjacentHTML('beforeend', html);
  });
}

function generateRolesAccordion() {
  let html = '';
  Object.keys(TASKS_DATABASE).forEach(roleKey => {
    const role = TASKS_DATABASE[roleKey];
    html += `
      <div class="role-accordion-item" data-role="${roleKey}">
        <label class="role-accordion-header">
          <input type="checkbox" name="roles" value="${roleKey}">
          <span class="role-emoji">${role.emoji}</span>
          <span class="role-title">${role.title}</span>
          <svg class="chevron-icon" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </label>
        <div class="role-tasks-drawer">
          <p style="margin-bottom:15px; font-size:0.9rem; color:var(--text-secondary);">Select the tasks you want to automate:</p>
          ${role.tasks.map(t => `
            <label class="task-checkbox-row">
              <input type="checkbox" name="tasks" value="${t.id}" data-parent-role="${roleKey}">
              <span>${t.text}</span>
            </label>
          `).join('')}
          <label class="task-checkbox-row">
            <input type="checkbox" class="other-task-trigger">
            <span>Other (specify below)</span>
          </label>
          <input type="text" class="form-input other-task-input hidden-element" placeholder="Type specific task...">
        </div>
      </div>
    `;
  });
  DOM.rolesAccordionContainer.innerHTML = html;

  const headers = DOM.rolesAccordionContainer.querySelectorAll('.role-accordion-header input[type="checkbox"]');
  headers.forEach(cb => {
    cb.addEventListener('change', (e) => {
      const drawer = e.target.closest('.role-accordion-item').querySelector('.role-tasks-drawer');
      const chevron = e.target.closest('.role-accordion-header').querySelector('.chevron-icon');
      if (e.target.checked) {
        drawer.classList.add('expanded');
        if (chevron) chevron.style.transform = 'rotate(180deg)';
      } else {
        drawer.classList.remove('expanded');
        if (chevron) chevron.style.transform = 'rotate(0deg)';
        drawer.querySelectorAll('input[type="checkbox"]').forEach(childCb => childCb.checked = false);
      }
    });
  });

  const otherTriggers = DOM.rolesAccordionContainer.querySelectorAll('.other-task-trigger');
  otherTriggers.forEach(trigger => {
    trigger.addEventListener('change', (e) => {
      const input = e.target.closest('.role-tasks-drawer').querySelector('.other-task-input');
      if (e.target.checked) {
        input.classList.remove('hidden-element');
      } else {
        input.classList.add('hidden-element');
        input.value = '';
      }
    });
  });
}

function updateWizardUI() {
  for (let i = 1; i <= 4; i++) {
    const container = document.getElementById(`wizard-step-${i}`);
    if (container) {
      if (i === state.currentStep) {
        container.classList.remove('hidden-step');
        container.classList.add('active-step');
      } else {
        container.classList.remove('active-step');
        container.classList.add('hidden-step');
      }
    }
  }

  if (state.currentStep === 1) {
    DOM.prevStepBtn.setAttribute('disabled', 'true');
    DOM.prevStepBtn.classList.add('disabled');
  } else {
    DOM.prevStepBtn.removeAttribute('disabled');
    DOM.prevStepBtn.classList.remove('disabled');
  }

  if (state.currentStep === 4) {
    DOM.nextStepBtn.querySelector('span').textContent = 'Submit Request & Generate Blueprint';
  } else {
    DOM.nextStepBtn.querySelector('span').textContent = 'Continue';
  }

  const percentage = (state.currentStep / 4) * 100;
  DOM.trackerFill.style.width = `${percentage}%`;

  DOM.trackerLabels.forEach(lbl => {
    const stepNum = parseInt(lbl.getAttribute('data-step'));
    lbl.classList.remove('active', 'completed');
    if (stepNum === state.currentStep) {
      lbl.classList.add('active');
    } else if (stepNum < state.currentStep) {
      lbl.classList.add('completed');
    }
  });
}

/* ==========================================================================
   WIZARD INPUT VALIDATORS
   ========================================================================== */
function validateStep(step) {
  let isValid = true;

  if (step === 1) {
    state.companyName = DOM.companyNameInput.value.trim();
    if (!state.companyName) {
      document.getElementById('name-error').style.display = 'block';
      isValid = false;
    } else {
      document.getElementById('name-error').style.display = 'none';
    }

    state.industry = DOM.industrySelect.value;
    if (!state.industry) {
      document.getElementById('industry-error').style.display = 'block';
      isValid = false;
    } else {
      document.getElementById('industry-error').style.display = 'none';
    }

    state.companySize = DOM.companySizeSelect.value;
    if (!state.companySize) {
      document.getElementById('size-error').style.display = 'block';
      isValid = false;
    } else {
      document.getElementById('size-error').style.display = 'none';
    }

    state.goals = [];
    DOM.goalsCheckboxes.forEach(cb => {
      if (cb.checked) state.goals.push(cb.value);
    });
    if (state.goals.length === 0) {
      document.getElementById('goals-error').style.display = 'block';
      isValid = false;
    } else {
      document.getElementById('goals-error').style.display = 'none';
    }
  }

  if (step === 2) {
    state.roles = [];
    state.tasks = [];

    const roleChecks = document.querySelectorAll('input[name="roles"]:checked');
    roleChecks.forEach(rc => state.roles.push(rc.value));

    const taskChecks = document.querySelectorAll('input[name="tasks"]:checked');
    taskChecks.forEach(tc => state.tasks.push(tc.value));

    if (state.roles.length === 0) {
      document.getElementById('roles-error').style.display = 'block';
      isValid = false;
    } else {
      document.getElementById('roles-error').style.display = 'none';
    }
  }

  if (step === 3) {
    const checkedTools = [...document.querySelectorAll('input[name="software"]:checked')]
      .filter(cb => cb.value !== 'other')
      .map(cb => cb.value);
    const otherText = DOM.softwareOtherCb.checked ? DOM.softwareOtherInput.value.trim() : '';
    if (otherText) checkedTools.push(otherText);
    state.softwareUsed = checkedTools.join(', ');
    if (!state.softwareUsed) {
      document.getElementById('software-error').style.display = 'block';
      isValid = false;
    } else {
      document.getElementById('software-error').style.display = 'none';
    }

    state.bottleneck = DOM.bottleneckInput.value.trim();
    if (!state.bottleneck) {
      document.getElementById('bottleneck-error').style.display = 'block';
      isValid = false;
    } else {
      document.getElementById('bottleneck-error').style.display = 'none';
    }

    state.security = DOM.securitySelect.value;
    if (!state.security) {
      document.getElementById('security-error').style.display = 'block';
      isValid = false;
    } else {
      document.getElementById('security-error').style.display = 'none';
    }
  }

  if (step === 4) {
    state.contactName = DOM.contactNameInput.value.trim();
    if (!state.contactName) {
      document.getElementById('contact-name-error').style.display = 'block';
      isValid = false;
    } else {
      document.getElementById('contact-name-error').style.display = 'none';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    state.contactEmail = DOM.contactEmailInput.value.trim();
    if (!emailRegex.test(state.contactEmail)) {
      document.getElementById('contact-email-error').style.display = 'block';
      isValid = false;
    } else {
      document.getElementById('contact-email-error').style.display = 'none';
    }

    state.contactPhone = DOM.contactPhoneInput.value.trim();

    state.timeline = DOM.timelineSelect.value;
    if (!state.timeline) {
      document.getElementById('timeline-error').style.display = 'block';
      isValid = false;
    } else {
      document.getElementById('timeline-error').style.display = 'none';
    }
  }

  return isValid;
}

/* ==========================================================================
   SUBMIT DIAGNOSTICS & RECOMMENDATIONS ENGINE
   ========================================================================== */
async function submitDiagnostics() {
  // Save lead immediately so n8n Workflow 1 fires straight away
  await saveLead('form_submit');

  // Populate banner email
  const bannerEmail = document.getElementById('banner-email');
  if (bannerEmail) bannerEmail.textContent = state.contactEmail || 'your email';

  let baseScore = 65;
  baseScore += state.goals.length * 5;
  baseScore += state.roles.length * 4;
  baseScore += state.tasks.length * 3;
  const viabilityScore = Math.min(baseScore, 98);

  DOM.circlePercentageText.textContent = `${viabilityScore}%`;
  DOM.circleFill.setAttribute('stroke-dasharray', `${viabilityScore}, 100`);
  DOM.dynCompanyName.textContent = state.companyName;

  renderRecommendedWorkflows();

  DOM.diagnosticWizard.classList.remove('active-step');
  DOM.diagnosticWizard.classList.add('hidden-step');
  DOM.recommendationsContainer.classList.remove('hidden-step');
  DOM.recommendationsContainer.classList.add('active-step');
}

function renderRecommendedWorkflows() {
  DOM.workflowsGrid.innerHTML = '';

  const categoryMap = {
    'task_cs_email': 'customer_service',
    'task_cs_chat': 'customer_service',
    'task_sales_outbound': 'sales',
    'task_sales_inbound': 'sales',
    'task_ops_data_entry': 'data_operations',
    'task_ops_invoicing': 'data_operations',
    'task_ea_transcription': 'executive_assistant',
    'task_mkt_strategy': 'marketing',
    'task_mkt_social': 'marketing'
  };

  WORKFLOWS_CATALOG.forEach(wf => {
    const isRecommended = state.roles.includes(wf.category) || state.tasks.some(task => categoryMap[task] === wf.category);

    const card = document.createElement('article');
    card.className = `workflow-card ${isRecommended ? 'recommended-highlight' : ''}`;
    card.setAttribute('data-category', wf.category);

    const isAdded = state.cart.has(wf.id);

    card.innerHTML = `
      <div class="wf-header">
        <div class="wf-title-group">
          <div class="wf-icon-box">${wf.icon}</div>
          <div class="wf-headline-box">
            <h4>${wf.name}</h4>
            <div class="wf-meta-stats">
              <span class="wf-stat-chip">⏱️ saves <strong>${wf.hoursSaved} hrs/wk</strong></span>
              <span class="wf-stat-chip">⚡ setup <strong>${isRecommended ? 'Standard' : 'Flexible'}</strong></span>
            </div>
          </div>
        </div>
        ${isRecommended ? '<span class="badge-recommended-pulse">High Match</span>' : ''}
      </div>

      <div class="wf-body-details">
        <p class="wf-desc">${wf.desc}</p>
        <ul class="wf-bullet-checklist">
          ${wf.checklist.map(item => `<li>${item}</li>`).join('')}
        </ul>

        <div class="wf-integration-row">
          <span class="wf-integration-label">Ecosystem Links</span>
          <div class="wf-integration-icons-list">
            ${wf.integrations.map(tool => `<span class="wf-int-icon-badge">${tool}</span>`).join('')}
          </div>
        </div>
      </div>

      <div class="wf-footer-actions">
        <div class="wf-pricing-block">
          <div class="wf-price-monthly">$${wf.price}<span>/mo</span></div>
          <span class="wf-setup-fee">Build setup: <strong>$${wf.setupFee}</strong> one-time</span>
        </div>

        <button type="button" class="btn-toggle-cart-item ${isAdded ? 'item-selected' : ''}" data-id="${wf.id}">
          <span class="toggle-plus-icon">+</span>
          <span>${isAdded ? 'Selected' : 'Build Suite'}</span>
        </button>
      </div>
    `;

    DOM.workflowsGrid.appendChild(card);
  });

  document.querySelectorAll('.btn-toggle-cart-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      toggleCartItem(id);

      const isAdded = state.cart.has(id);
      if (isAdded) {
        e.currentTarget.classList.add('item-selected');
        e.currentTarget.querySelector('span:nth-child(2)').textContent = 'Selected';
      } else {
        e.currentTarget.classList.remove('item-selected');
        e.currentTarget.querySelector('span:nth-child(2)').textContent = 'Build Suite';
      }
    });
  });
}

/* ==========================================================================
   CART SYSTEM ENGINE
   ========================================================================== */
function bindCartInteractions() {
  DOM.cartToggleBtn.addEventListener('click', () => {
    DOM.cartAside.classList.toggle('cart-open');
  });

  DOM.timelineUrgencyInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      state.deliveryTimeline = e.target.value;
      updateCartTotalsUI();
    });
  });

  DOM.checkoutTriggerBtn.addEventListener('click', () => {
    populateCheckoutSummary();
    DOM.checkoutModal.showModal();
  });

  if (DOM.bookStrategyBtn) {
    DOM.bookStrategyBtn.addEventListener('click', () => {
      showStrategySuccessModal();
    });
  }
}

function toggleCartItem(id) {
  if (state.cart.has(id)) {
    state.cart.delete(id);
  } else {
    state.cart.add(id);
  }
  updateCartTotalsUI();
}

function updateCartTotalsUI() {
  const cartSize = state.cart.size;
  DOM.cartBadgeCount.textContent = cartSize;
  DOM.cartSidebarCount.textContent = cartSize;

  if (cartSize === 0) {
    DOM.cartEmptyState.classList.remove('hidden-element');
    DOM.cartFilledState.classList.add('hidden-element');
    return;
  } else {
    DOM.cartEmptyState.classList.add('hidden-element');
    DOM.cartFilledState.classList.remove('hidden-element');
  }

  DOM.cartItemsList.innerHTML = '';

  let totalHoursSaved = 0;
  let totalMonthly = 0;
  let totalSetup = 0;

  state.cart.forEach(id => {
    const wf = WORKFLOWS_CATALOG.find(item => item.id === id);
    if (!wf) return;

    totalHoursSaved += wf.hoursSaved;
    totalMonthly += wf.price;
    totalSetup += wf.setupFee;

    const row = document.createElement('li');
    row.className = 'cart-item-row';
    row.innerHTML = `
      <div class="cart-item-info">
        <span class="cart-item-name">${wf.name}</span>
        <span class="cart-item-setup-detail">Setup: $${wf.setupFee} one-time</span>
      </div>
      <div class="cart-item-price-block">
        <span class="cart-item-price">$${wf.price}/mo</span>
        <button type="button" class="btn-remove-cart-item" data-id="${wf.id}" aria-label="Remove item">×</button>
      </div>
    `;
    DOM.cartItemsList.appendChild(row);
  });

  DOM.cartItemsList.querySelectorAll('.btn-remove-cart-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      toggleCartItem(id);

      const recBtn = document.querySelector(`.btn-toggle-cart-item[data-id="${id}"]`);
      if (recBtn) {
        recBtn.classList.remove('item-selected');
        recBtn.querySelector('span:nth-child(2)').textContent = 'Build Suite';
      }
    });
  });

  const headcount = HEADCOUNT_FACTOR[state.companySize] || 15;
  const weeklyDollarsSaved = totalHoursSaved * state.hourlyRate * headcount;
  const monthlyDollarsSaved = Math.round(weeklyDollarsSaved * 4.3);
  const monthlyHoursSaved = Math.round(totalHoursSaved * headcount * 4.3);

  DOM.roiHoursSaved.textContent = monthlyHoursSaved;
  DOM.roiDollarsSaved.textContent = `$${monthlyDollarsSaved.toLocaleString()}`;

  let expressCharge = 0;
  if (state.deliveryTimeline === 'express') {
    expressCharge = Math.round(totalSetup * 0.2);
    DOM.summaryExpressRow.classList.remove('hidden-element');
    DOM.summaryExpressCharge.textContent = expressCharge;
  } else {
    DOM.summaryExpressRow.classList.add('hidden-element');
  }

  DOM.summaryMonthlySubtotal.textContent = totalMonthly;
  DOM.summarySetupSubtotal.textContent = totalSetup;
  DOM.summaryFirstMonthTotal.textContent = totalMonthly + totalSetup + expressCharge;
}

/* ==========================================================================
   CHECKOUT SIMULATOR & SUCCESS
   ========================================================================== */
function populateCheckoutSummary() {
  DOM.checkoutSummaryItemsList.innerHTML = '';
  let totalMonthly = 0;
  let totalSetup = 0;

  state.cart.forEach(id => {
    const wf = WORKFLOWS_CATALOG.find(item => item.id === id);
    if (!wf) return;
    totalMonthly += wf.price;
    totalSetup += wf.setupFee;

    const li = document.createElement('li');
    li.className = 'checkout-summary-item';
    li.innerHTML = `
      <span class="checkout-summary-item-name">${wf.name}</span>
      <span class="checkout-summary-item-price">$${wf.price}/mo</span>
    `;
    DOM.checkoutSummaryItemsList.appendChild(li);
  });

  let setupPremium = 0;
  if (state.deliveryTimeline === 'express') {
    setupPremium = Math.round(totalSetup * 0.2);
  }

  const depositCharged = totalMonthly + Math.round((totalSetup + setupPremium) * 0.5);
  const remainingBalance = Math.round((totalSetup + setupPremium) * 0.5);

  DOM.checkoutSummaryTotal.textContent = depositCharged;
  DOM.btnPayTotal.textContent = depositCharged;
  DOM.scheduleTodayCharge.textContent = depositCharged;
  DOM.scheduleBalanceCharge.textContent = remainingBalance;
}

function bindCheckoutSimulator() {
  if (DOM.btnReturnCart) {
    DOM.btnReturnCart.addEventListener('click', () => {
      DOM.checkoutModal.close();
    });
  }

  if (DOM.paymentForm) {
    DOM.paymentForm.addEventListener('submit', (e) => {
      e.preventDefault();

      DOM.btnPaySubmit.setAttribute('disabled', 'true');
      DOM.btnPaySubmit.querySelector('span').textContent = 'Authorizing Escrow Lock... 🔒';

      setTimeout(async () => {
        DOM.checkoutModal.close();
        populateSuccessReceipt(false);
        await saveLead('checkout');
        DOM.successModal.showModal();
        launchConfetti();
        showProposalLink();
        DOM.btnPaySubmit.removeAttribute('disabled');
      }, 2000);
    });
  }
}

async function saveLead(submissionType) {
  const cartItems = [...state.cart];
  let totalMonthly = 0;
  let totalSetup = 0;
  cartItems.forEach(id => {
    const wf = WORKFLOWS_CATALOG.find(w => w.id === id);
    if (wf) { totalMonthly += wf.price; totalSetup += wf.setupFee; }
  });
  const expressCharge = state.deliveryTimeline === 'express' ? Math.round(totalSetup * 0.2) : 0;

  // If lead already saved on form submit, update the row with cart data
  if (state.leadId && submissionType !== 'form_submit') {
    await supabase.from('leads').update({
      selected_workflows: cartItems,
      delivery_timeline: state.deliveryTimeline,
      monthly_total: totalMonthly,
      setup_total: totalSetup,
      first_month_total: totalMonthly + totalSetup + expressCharge,
      submission_type: submissionType
    }).eq('id', state.leadId);
    return state.leadId;
  }

  // First save — on form submission
  const { data, error } = await supabase.from('leads').insert({
    company_name: state.companyName,
    industry: state.industry,
    company_size: state.companySize,
    goals: state.goals,
    roles: state.roles,
    tasks: state.tasks,
    software_used: state.softwareUsed,
    bottleneck: state.bottleneck,
    security_constraints: state.security,
    contact_name: state.contactName,
    contact_email: state.contactEmail,
    contact_phone: state.contactPhone || null,
    implementation_timeline: state.timeline,
    selected_workflows: cartItems,
    delivery_timeline: state.deliveryTimeline,
    monthly_total: totalMonthly,
    setup_total: totalSetup,
    first_month_total: totalMonthly + totalSetup + expressCharge,
    submission_type: submissionType
  }).select('id').single();

  if (error) console.error('[saveLead] Supabase error:', error?.status, error?.code, error?.message, error?.hint, JSON.stringify(error));
  if (!error && data?.id) state.leadId = data.id;
  return state.leadId;
}

async function showStrategySuccessModal() {
  populateSuccessReceipt(true);
  await saveLead('strategy_call');
  DOM.successModal.showModal();
  launchConfetti();
  showProposalLink();
}

function populateSuccessReceipt(isStrategySession) {
  const successTitle = document.querySelector('#success-modal .success-header h2');
  const successDesc = document.querySelector('#success-modal .success-header p');

  if (isStrategySession) {
    successTitle.textContent = "Thank you! Blueprint Requested.";
    successDesc.textContent = `Our team is analyzing your workflows. We will reach out within 48 hours to ${state.contactEmail} with a customized blueprint on how AI agents can optimize ${state.companyName}'s operations.`;
    DOM.receiptSettledTotal.textContent = "$0 (Consultation)";
    DOM.receiptId.textContent = `#MVR-${Math.floor(Math.random() * 8999 + 1000)}-LEAD`;
  } else {
    successTitle.textContent = "Escrow Deposit Locked Successfully";
    successDesc.textContent = "Your secure deposit has been held in escrow. Engineering kickoff will commence at our scheduled session below.";
    DOM.receiptSettledTotal.textContent = `$${DOM.scheduleTodayCharge.textContent}`;
    DOM.receiptId.textContent = `#MVR-${Math.floor(Math.random() * 8999 + 1000)}-X`;
  }

  DOM.receiptClientName.textContent = state.companyName;
  DOM.receiptDate.textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  DOM.receiptDeliveryTier.textContent = state.deliveryTimeline === 'express' ? '🚀 Express Delivery (3 days)' : '📅 Standard (14 days)';
}

function bindBookingScheduler() {
  DOM.calendarDays.forEach(day => {
    day.addEventListener('click', (e) => {
      DOM.calendarDays.forEach(d => d.classList.remove('active-day'));
      e.currentTarget.classList.add('active-day');
      updateBookingConfirmBtnText();
    });
  });

  DOM.calendarSlots.forEach(slot => {
    slot.addEventListener('click', (e) => {
      DOM.calendarSlots.forEach(s => s.classList.remove('active-slot'));
      e.currentTarget.classList.add('active-slot');
      updateBookingConfirmBtnText();
    });
  });

  DOM.confirmBookingBtn.addEventListener('click', () => {
    DOM.confirmBookingBtn.setAttribute('disabled', 'true');
    DOM.confirmBookingBtn.querySelector('span').textContent = 'Session Confirmed! Invitation Sent. 📅';
  });

  DOM.successDoneBtn.addEventListener('click', () => {
    DOM.successModal.close();
    window.location.reload();
  });
}

function updateBookingConfirmBtnText() {
  const activeDay = document.querySelector('.cal-day.active-day');
  const activeSlot = document.querySelector('.cal-slot.active-slot');
  if (activeDay && activeSlot) {
    DOM.confirmBookingBtn.removeAttribute('disabled');
    DOM.confirmBookingBtn.querySelector('span').textContent = `Confirm Session: ${activeDay.querySelector('.day-lbl').textContent} ${activeDay.querySelector('.day-num').textContent} @ ${activeSlot.textContent}`;
  }
}

function showProposalLink() {
  if (!state.leadId) return;
  const existing = document.getElementById('proposal-link-btn');
  if (existing) return;

  const proposalUrl = `${window.location.origin}/${state.leadId}`;
  const btn = document.createElement('a');
  btn.id = 'proposal-link-btn';
  btn.href = proposalUrl;
  btn.target = '_blank';
  btn.className = 'btn btn-outline';
  btn.style.cssText = 'width:100%; max-width:320px; padding:0.85rem; margin-top:0.75rem; display:flex; justify-content:center; gap:0.5rem; text-decoration:none;';
  btn.innerHTML = '<span>🔗 View Your AI Proposal</span>';

  DOM.successDoneBtn.parentElement.appendChild(btn);
}

document.addEventListener('DOMContentLoaded', init);
