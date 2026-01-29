export interface ConnectionField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'url';
  placeholder?: string;
  required: boolean;
  helpText?: string;
}

export interface Integration {
  id: string;
  name: string;
  category: 'crm' | 'sales-engagement' | 'communication' | 'data-enrichment' | 'calendar';
  description: string;
  keywords: string[];
  logoUrl: string;
  website: string;
  connectionFields: ConnectionField[];
}

export const CATEGORY_LABELS: Record<Integration['category'], string> = {
  'crm': 'CRM',
  'sales-engagement': 'Sales Engagement',
  'communication': 'Communication',
  'data-enrichment': 'Data Enrichment',
  'calendar': 'Calendar',
};

export const integrations: Integration[] = [
  // CRM
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'crm',
    description: 'Sync leads, contacts, and opportunities with your Salesforce CRM instance.',
    keywords: ['CRM', 'Leads', 'Opportunities'],
    logoUrl: 'https://www.google.com/s2/favicons?domain=salesforce.com&sz=64',
    website: 'https://salesforce.com',
    connectionFields: [
      { name: 'instanceUrl', label: 'Instance URL', type: 'url', placeholder: 'https://your-instance.salesforce.com', required: true, helpText: 'Your Salesforce instance URL' },
      { name: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Enter your Client ID', required: true },
      { name: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Enter your Client Secret', required: true },
    ],
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'crm',
    description: 'Connect your HubSpot CRM to sync contacts, deals, and company data.',
    keywords: ['CRM', 'Marketing', 'Sales'],
    logoUrl: 'https://www.google.com/s2/favicons?domain=hubspot.com&sz=64',
    website: 'https://hubspot.com',
    connectionFields: [
      { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your HubSpot API key', required: true, helpText: 'Found in Settings > Integrations > API key' },
    ],
  },
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    category: 'crm',
    description: 'Integrate with Pipedrive to manage deals and sales pipeline data.',
    keywords: ['CRM', 'Pipeline', 'Deals'],
    logoUrl: 'https://www.google.com/s2/favicons?domain=pipedrive.com&sz=64',
    website: 'https://pipedrive.com',
    connectionFields: [
      { name: 'apiToken', label: 'API Token', type: 'password', placeholder: 'Enter your Pipedrive API token', required: true, helpText: 'Found in Settings > Personal preferences > API' },
    ],
  },

  // Sales Engagement
  {
    id: 'apollo',
    name: 'Apollo.io',
    category: 'sales-engagement',
    description: 'Access prospect data and automate outreach sequences with Apollo.',
    keywords: ['Prospecting', 'Outreach', 'Sequences'],
    logoUrl: 'https://www.google.com/s2/favicons?domain=apollo.io&sz=64',
    website: 'https://apollo.io',
    connectionFields: [
      { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your Apollo API key', required: true, helpText: 'Found in Settings > Integrations > API Keys' },
    ],
  },
  {
    id: 'outreach',
    name: 'Outreach',
    category: 'sales-engagement',
    description: 'Connect Outreach to sync sequences, tasks, and engagement data.',
    keywords: ['Sequences', 'Engagement', 'Automation'],
    logoUrl: 'https://www.google.com/s2/favicons?domain=outreach.io&sz=64',
    website: 'https://outreach.io',
    connectionFields: [
      { name: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Enter your Client ID', required: true },
      { name: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Enter your Client Secret', required: true },
      { name: 'redirectUri', label: 'Redirect URI', type: 'url', placeholder: 'https://your-app.com/callback', required: true, helpText: 'Must match the URI configured in your Outreach app' },
    ],
  },
  {
    id: 'salesloft',
    name: 'Salesloft',
    category: 'sales-engagement',
    description: 'Integrate with Salesloft for cadence management and call tracking.',
    keywords: ['Cadences', 'Calls', 'Tracking'],
    logoUrl: 'https://www.google.com/s2/favicons?domain=salesloft.com&sz=64',
    website: 'https://salesloft.com',
    connectionFields: [
      { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your Salesloft API key', required: true, helpText: 'Found in Settings > API' },
    ],
  },

  // Communication
  {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    description: 'Receive notifications and updates directly in your Slack workspace.',
    keywords: ['Notifications', 'Messaging', 'Alerts'],
    logoUrl: 'https://www.google.com/s2/favicons?domain=slack.com&sz=64',
    website: 'https://slack.com',
    connectionFields: [
      { name: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://hooks.slack.com/services/...', required: true, helpText: 'Create an incoming webhook in your Slack workspace' },
      { name: 'channel', label: 'Default Channel', type: 'text', placeholder: '#general', required: false, helpText: 'Optional default channel for notifications' },
    ],
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    category: 'communication',
    description: 'Send notifications and updates to your Microsoft Teams channels.',
    keywords: ['Notifications', 'Messaging', 'Microsoft'],
    logoUrl: 'https://www.google.com/s2/favicons?domain=teams.microsoft.com&sz=64',
    website: 'https://teams.microsoft.com',
    connectionFields: [
      { name: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://outlook.office.com/webhook/...', required: true, helpText: 'Create an incoming webhook connector in your Teams channel' },
      { name: 'channel', label: 'Default Channel', type: 'text', placeholder: 'General', required: false, helpText: 'Optional channel name for reference' },
    ],
  },

  // Data Enrichment
  {
    id: 'zoominfo',
    name: 'ZoomInfo',
    category: 'data-enrichment',
    description: 'Enrich your data with company and contact intelligence from ZoomInfo.',
    keywords: ['Enrichment', 'Intelligence', 'Data'],
    logoUrl: 'https://www.google.com/s2/favicons?domain=zoominfo.com&sz=64',
    website: 'https://zoominfo.com',
    connectionFields: [
      { name: 'username', label: 'Username', type: 'text', placeholder: 'Enter your ZoomInfo username', required: true },
      { name: 'password', label: 'Password', type: 'password', placeholder: 'Enter your password', required: true },
    ],
  },
  {
    id: 'linkedin-sales-navigator',
    name: 'LinkedIn Sales Navigator',
    category: 'data-enrichment',
    description: 'Connect LinkedIn Sales Navigator for lead insights and social selling.',
    keywords: ['LinkedIn', 'Social Selling', 'Leads'],
    logoUrl: 'https://www.google.com/s2/favicons?domain=linkedin.com&sz=64',
    website: 'https://linkedin.com/sales',
    connectionFields: [
      { name: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Enter your access token', required: true, helpText: 'OAuth access token from LinkedIn Developer Portal' },
    ],
  },

  // Calendar
  {
    id: 'calendly',
    name: 'Calendly',
    category: 'calendar',
    description: 'Sync meeting bookings and availability with your Calendly account.',
    keywords: ['Scheduling', 'Meetings', 'Bookings'],
    logoUrl: 'https://www.google.com/s2/favicons?domain=calendly.com&sz=64',
    website: 'https://calendly.com',
    connectionFields: [
      { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your Calendly API key', required: true, helpText: 'Found in Account Settings > Integrations' },
    ],
  },
];

export function getIntegrationsByCategory(): Map<Integration['category'], Integration[]> {
  const map = new Map<Integration['category'], Integration[]>();
  for (const integration of integrations) {
    const existing = map.get(integration.category) || [];
    existing.push(integration);
    map.set(integration.category, existing);
  }
  return map;
}
