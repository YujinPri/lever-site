// Site content — ported verbatim from design_handoff/reference/app.jsx.

export type Service = {
  num: string;
  name: string;
  tag: string;
  includes: string[];
  stack: string[];
};

export const SERVICES: Service[] = [
  {
    num: '01',
    name: 'Voice Agents',
    tag: 'AI that picks up the phone, qualifies, books, follows up — in your voice, on your script, 24/7.',
    includes: ['Inbound call handling', 'Outbound campaigns', 'Lead qualification', 'Appointment booking', 'Multi-language support', 'CRM logging'],
    stack: ['Vapi', 'Retell', 'Twilio', 'ElevenLabs', 'Deepgram', 'OpenAI Realtime'],
  },
  {
    num: '02',
    name: 'Workflow Automations',
    tag: 'The plumbing that connects every tool you already pay for — so manual handoffs stop happening.',
    includes: ['Lead → CRM pipelines', 'Invoice & ops automation', 'Slack / email triggers', 'Data sync between SaaS', 'Scheduled reports', 'Error monitoring'],
    stack: ['n8n', 'Make', 'Zapier', 'Pipedream', 'Workato'],
  },
  {
    num: '03',
    name: 'Custom AI Agents',
    tag: 'Chatbots, copilots, and back-office agents trained on your data — not a generic GPT wrapper.',
    includes: ['RAG over your docs', 'Customer support copilot', 'Internal knowledge agent', 'Multi-step task agents', 'Human-in-the-loop review', 'Eval & monitoring'],
    stack: ['Claude', 'GPT-5', 'Pinecone', 'Supabase', 'LangGraph'],
  },
  {
    num: '04',
    name: 'CRM & Integrations',
    tag: 'Make HubSpot, GoHighLevel, Salesforce or your custom DB actually talk to the rest of your stack.',
    includes: ['HubSpot / GHL setup', 'Custom integrations', 'Webhook wiring', 'Data migration', 'Pipeline architecture', 'Reporting dashboards'],
    stack: ['HubSpot', 'GoHighLevel', 'Salesforce', 'Airtable', 'Notion'],
  },
  {
    num: '05',
    name: 'Internal Tools',
    tag: 'Lightweight dashboards and ops apps your team will actually use — built in days, not quarters.',
    includes: ['Admin dashboards', 'Approval workflows', 'Client portals', 'Reporting UIs', 'Mobile-friendly forms', 'Role-based access'],
    stack: ['Retool', 'Next.js', 'Supabase', 'Vercel', 'Tailwind'],
  },
  {
    num: '06',
    name: 'Web & App Development',
    tag: 'Marketing sites, web apps and mobile apps — designed and built end-to-end. AI-native where it makes sense.',
    includes: ['Marketing & landing sites', 'Web apps (SaaS, portals)', 'Mobile apps (iOS / Android)', 'Design + build', 'Stripe, auth & analytics', 'Launch + ongoing support'],
    stack: ['Next.js', 'React Native', 'Expo', 'Supabase', 'Vercel', 'Framer'],
  },
];

export type ProcessStep = { num: string; name: string; meta: string; body: string };

export const PROCESS: ProcessStep[] = [
  { num: '01', name: 'Audit', meta: 'Week 0 · Free', body: 'A free 30-minute call. We map one workflow live and tell you exactly what is worth automating — and just as honestly, what is not.' },
  { num: '02', name: 'Build', meta: 'Weeks 1–2', body: 'We build it in days, not quarters. You watch progress as it ships — no three-month silence, no surprise invoice at the end.' },
  { num: '03', name: 'Handoff', meta: 'Yours to keep', body: 'It is yours. We document everything, train your team, and hand over every account and line of code. No lock-in, ever.' },
];

export const STACK_LOGOS = [
  'n8n', 'Make', 'Zapier', 'Twilio', 'OpenAI', 'Anthropic', 'Vapi', 'Retell',
  'Next.js', 'React Native', 'Supabase', 'Airtable', 'HubSpot', 'GoHighLevel',
  'Vercel', 'Slack', 'Notion', 'Pipedream', 'Deepgram', 'Stripe', 'Framer',
];

// Headline: [plain part, italic-accent part] — rendered on two lines.
export type Headline = { plain: string; italic: string };

export const HEADLINES: Headline[] = [
  { plain: 'Work should', italic: 'run itself.' },
  { plain: 'Replace busywork.', italic: 'Keep the team.' },
  { plain: 'More output.', italic: 'Less overhead.' },
  { plain: 'Automate', italic: 'the boring parts.' },
];
