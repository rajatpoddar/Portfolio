import { FEATURE_PRICES } from './pricingLogic';

export const PROJECT_TYPES = [
  'Landing Page',
  'Standard App',
  'E-Commerce',
  'Business Platform',
  'AI Application',
  'Mobile App',
];

// Group features by category for the selector UI
export const FEATURE_GROUPS = [
  {
    label: 'Auth & Users',
    features: ['User Authentication', 'Role-Based Access Control', 'Social Login (Google/FB)'],
  },
  {
    label: 'UI/UX',
    features: ['Custom Dashboard', 'Dark/Light Mode', 'Responsive Design', 'Animations & Micro-UX'],
  },
  {
    label: 'Backend & Data',
    features: ['Database Integration', 'REST API Development', 'File Upload & Storage', 'Real-time Updates', 'Search & Filters', 'Export (PDF/Excel)'],
  },
  {
    label: 'AI & Automation',
    features: ['AI Chatbot Integration', 'OpenAI / LLM Integration', 'Workflow Automation', 'Email Automation', 'WhatsApp Integration', 'n8n / Make.com Workflows'],
  },
  {
    label: 'E-Commerce',
    features: ['Payment Gateway', 'Cart & Checkout', 'Inventory Management', 'Order Tracking'],
  },
  {
    label: 'Business',
    features: ['CRM Module', 'Invoice & Billing', 'Analytics Dashboard', 'Multi-language Support', 'SEO Optimization', 'Admin Panel'],
  },
];

export { FEATURE_PRICES };
