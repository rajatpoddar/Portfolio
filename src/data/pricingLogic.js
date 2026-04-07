// ─── PRICING CONFIG (private — never exposed publicly) ────────────────────────

export const BASE_PRICES = {
  'Landing Page':       15000,
  'Standard App':       35000,
  'E-Commerce':         55000,
  'Business Platform':  80000,
  'AI Application':     70000,
  'Mobile App':         60000,
};

export const FEATURE_PRICES = {
  // Auth & Users
  'User Authentication':        4000,
  'Role-Based Access Control':  6000,
  'Social Login (Google/FB)':   3500,

  // UI/UX
  'Custom Dashboard':           8000,
  'Dark/Light Mode':            2000,
  'Responsive Design':          3000,
  'Animations & Micro-UX':      4000,

  // Backend & Data
  'Database Integration':       5000,
  'REST API Development':       7000,
  'File Upload & Storage':      4000,
  'Real-time Updates':          6000,
  'Search & Filters':           3500,
  'Export (PDF/Excel)':         4000,

  // AI & Automation
  'AI Chatbot Integration':     12000,
  'OpenAI / LLM Integration':   15000,
  'Workflow Automation':        10000,
  'Email Automation':           5000,
  'WhatsApp Integration':       6000,
  'n8n / Make.com Workflows':   8000,

  // E-Commerce
  'Payment Gateway':            7000,
  'Cart & Checkout':            6000,
  'Inventory Management':       8000,
  'Order Tracking':             5000,

  // Business
  'CRM Module':                 10000,
  'Invoice & Billing':          8000,
  'Analytics Dashboard':        9000,
  'Multi-language Support':     5000,
  'SEO Optimization':           4000,
  'Admin Panel':                7000,
};

export const MAINTENANCE_PLANS = {
  basic: {
    label: 'Basic Support',
    price: 3000,
    desc: 'Bug fixes, minor updates, uptime monitoring',
  },
  standard: {
    label: 'Standard Maintenance',
    price: 6000,
    desc: 'Everything in Basic + feature updates, performance tuning',
  },
  premium: {
    label: 'Premium Partnership',
    price: 12000,
    desc: 'Everything in Standard + priority support, monthly strategy call',
  },
};

/**
 * Calculate total project cost
 * @param {string} projectType
 * @param {string[]} features
 * @param {string|null} maintenancePlan
 */
export function calculateTotal(projectType, features = [], maintenancePlan = null) {
  const base = BASE_PRICES[projectType] || 0;
  const featuresTotal = features.reduce((sum, f) => sum + (FEATURE_PRICES[f] || 0), 0);
  const maintenance = maintenancePlan ? (MAINTENANCE_PLANS[maintenancePlan]?.price || 0) : 0;
  const subtotal = base + featuresTotal;

  return { base, featuresTotal, maintenance, subtotal };
}
