import type { LatLng } from '@/lib/geo';

export type CompetitorBrand =
  | 'Oracle'
  | 'Microsoft'
  | 'Anthropic'
  | 'OpenAI'
  | 'AWS'
  | 'Salesforce';

export interface CompetitorEvent {
  id: string;
  name: string;
  brand: CompetitorBrand;
  type: 'in-person' | 'virtual' | 'hybrid';
  date: string;
  dateEnd?: string;
  city: string;
  state: string;
  country: string;
  position: LatLng;
  description: string;
  expectedAttendees?: number;
  url?: string;
}

/**
 * Brand colors for map pins and sidebar dots.
 * Chosen to be mutually distinct AND avoid the four existing marker hues:
 *   yellow (companies), medium-blue #0072B2 (Google events),
 *   green #009E73 (partner events), light-blue #56B4E9 (offices).
 */
export const COMPETITOR_BRAND_COLORS: Record<CompetitorBrand, string> = {
  Oracle: '#DC2626',
  Microsoft: '#7C3AED',
  Anthropic: '#EC4899',
  OpenAI: '#4F46E5',
  AWS: '#EA580C',
  Salesforce: '#0891B2',
};

/**
 * Upcoming competitor events sourced from public event listings.
 * Last updated: April 2026.
 */
export const COMPETITOR_EVENTS: CompetitorEvent[] = [
  // ── Oracle — Flagship ──────────────────────────────────
  {
    id: 'oracle-ai-world-2026',
    name: 'Oracle AI World 2026',
    brand: 'Oracle',
    type: 'in-person',
    date: '2026-10-25',
    dateEnd: '2026-10-29',
    city: 'Las Vegas',
    state: 'NV',
    country: 'US',
    position: { lat: 36.1699, lng: -115.1398 },
    description:
      'Oracle\'s flagship conference (formerly CloudWorld) — 2,000+ sessions, product demos, AI & cloud innovations at The Venetian',
    expectedAttendees: 20000,
    url: 'https://www.oracle.com/cloudworld/',
  },

  // ── Oracle — AI World Tour (North America) ─────────────
  {
    id: 'oracle-tour-chicago',
    name: 'Oracle AI World Tour',
    brand: 'Oracle',
    type: 'in-person',
    date: '2026-04-07',
    city: 'Chicago',
    state: 'IL',
    country: 'US',
    position: { lat: 41.8789, lng: -87.6359 },
    description:
      'Regional tour stop — keynotes, hands-on labs, demos at Willis Tower',
    expectedAttendees: 2000,
    url: 'https://www.oracle.com/ai-world-tour/',
  },
  {
    id: 'oracle-tour-nyc',
    name: 'Oracle AI World Tour',
    brand: 'Oracle',
    type: 'in-person',
    date: '2026-04-09',
    city: 'New York',
    state: 'NY',
    country: 'US',
    position: { lat: 40.7575, lng: -74.0023 },
    description:
      'Regional tour stop — keynotes, hands-on labs, demos at Javits Center',
    expectedAttendees: 3000,
    url: 'https://www.oracle.com/ai-world-tour/new-york/',
  },

  // ── Oracle — AI World Tour (Europe) ────────────────────
  {
    id: 'oracle-tour-frankfurt',
    name: 'Oracle AI World Tour',
    brand: 'Oracle',
    type: 'in-person',
    date: '2026-03-12',
    city: 'Frankfurt',
    state: '',
    country: 'DE',
    position: { lat: 50.1109, lng: 8.6821 },
    description:
      'Regional tour stop — keynotes, sessions, labs at Kap Europa / Messe Frankfurt',
    expectedAttendees: 2000,
    url: 'https://www.oracle.com/ai-world-tour/',
  },
  {
    id: 'oracle-tour-zurich',
    name: 'Oracle AI World Tour',
    brand: 'Oracle',
    type: 'in-person',
    date: '2026-03-17',
    city: 'Zurich',
    state: '',
    country: 'CH',
    position: { lat: 47.3769, lng: 8.5417 },
    description:
      'Regional tour stop — keynotes, sessions, hands-on labs',
    expectedAttendees: 1500,
    url: 'https://www.oracle.com/ai-world-tour/',
  },
  {
    id: 'oracle-tour-paris',
    name: 'Oracle AI World Tour',
    brand: 'Oracle',
    type: 'in-person',
    date: '2026-03-19',
    city: 'Paris',
    state: '',
    country: 'FR',
    position: { lat: 48.8566, lng: 2.3522 },
    description:
      'Regional tour stop — keynotes, sessions, demos at CNIT Forest',
    expectedAttendees: 2500,
    url: 'https://www.oracle.com/ai-world-tour/',
  },
  {
    id: 'oracle-tour-london',
    name: 'Oracle AI World Tour',
    brand: 'Oracle',
    type: 'in-person',
    date: '2026-03-24',
    city: 'London',
    state: '',
    country: 'UK',
    position: { lat: 51.5085, lng: 0.0556 },
    description:
      'Regional tour stop — keynotes, sessions, hands-on labs at ExCeL London',
    expectedAttendees: 3000,
    url: 'https://www.oracle.com/ai-world-tour/',
  },
  {
    id: 'oracle-tour-milan',
    name: 'Oracle AI World Tour',
    brand: 'Oracle',
    type: 'in-person',
    date: '2026-04-01',
    city: 'Milan',
    state: '',
    country: 'IT',
    position: { lat: 45.4642, lng: 9.19 },
    description:
      'Regional tour stop — keynotes, sessions, demos at Allianz MiCo',
    expectedAttendees: 2000,
    url: 'https://www.oracle.com/ai-world-tour/',
  },

  // ── Oracle — AI World Tour (Asia-Pacific) ──────────────
  {
    id: 'oracle-tour-sydney',
    name: 'Oracle AI World Tour',
    brand: 'Oracle',
    type: 'in-person',
    date: '2026-03-24',
    city: 'Sydney',
    state: 'NSW',
    country: 'AU',
    position: { lat: -33.8688, lng: 151.2093 },
    description:
      'Regional tour stop — keynotes, sessions, labs at ICC Sydney',
    expectedAttendees: 2000,
    url: 'https://www.oracle.com/ai-world-tour/',
  },
  {
    id: 'oracle-tour-singapore',
    name: 'Oracle AI World Tour',
    brand: 'Oracle',
    type: 'in-person',
    date: '2026-04-14',
    city: 'Singapore',
    state: '',
    country: 'SG',
    position: { lat: 1.2838, lng: 103.8591 },
    description:
      'Regional tour stop — keynotes, sessions, demos at Marina Bay Sands',
    expectedAttendees: 2500,
    url: 'https://www.oracle.com/ai-world-tour/',
  },
  {
    id: 'oracle-tour-tokyo',
    name: 'Oracle AI World Tour',
    brand: 'Oracle',
    type: 'in-person',
    date: '2026-04-16',
    city: 'Tokyo',
    state: '',
    country: 'JP',
    position: { lat: 35.6585, lng: 139.7454 },
    description:
      'Regional tour stop — keynotes, sessions, demos at Prince Park Tower',
    expectedAttendees: 2500,
    url: 'https://www.oracle.com/ai-world-tour/',
  },

  // ── Microsoft — Flagship conferences ───────────────────
  {
    id: 'ms-build-2026',
    name: 'Microsoft Build 2026',
    brand: 'Microsoft',
    type: 'hybrid',
    date: '2026-06-02',
    dateEnd: '2026-06-03',
    city: 'San Francisco',
    state: 'CA',
    country: 'US',
    position: { lat: 37.8061, lng: -122.4326 },
    description:
      'Microsoft\'s flagship developer conference — AI, Copilot, Azure at Fort Mason Center',
    expectedAttendees: 2500,
    url: 'https://build.microsoft.com/',
  },
  {
    id: 'ms-ignite-2026',
    name: 'Microsoft Ignite 2026',
    brand: 'Microsoft',
    type: 'hybrid',
    date: '2026-11-17',
    dateEnd: '2026-11-20',
    city: 'San Francisco',
    state: 'CA',
    country: 'US',
    position: { lat: 37.7841, lng: -122.4005 },
    description:
      'Microsoft\'s IT pro & enterprise conference — AI, cloud, security sessions at Moscone Center',
    expectedAttendees: 25000,
    url: 'https://ignite.microsoft.com/',
  },

  // ── Microsoft — AI Tour ────────────────────────────────
  {
    id: 'ms-ai-tour-nyc',
    name: 'Microsoft AI Tour',
    brand: 'Microsoft',
    type: 'in-person',
    date: '2026-01-21',
    city: 'New York',
    state: 'NY',
    country: 'US',
    position: { lat: 40.7575, lng: -74.0023 },
    description:
      'AI Tour stop at Javits Center — enterprise AI, Copilot, Azure sessions',
    expectedAttendees: 3000,
    url: 'https://msaitour.microsoft.com/',
  },
  {
    id: 'ms-ai-tour-london',
    name: 'Microsoft AI Tour',
    brand: 'Microsoft',
    type: 'in-person',
    date: '2026-02-24',
    city: 'London',
    state: '',
    country: 'UK',
    position: { lat: 51.5074, lng: -0.1278 },
    description:
      'AI Tour stop — enterprise AI, Copilot, Azure sessions',
    expectedAttendees: 3000,
    url: 'https://msaitour.microsoft.com/',
  },
  {
    id: 'ms-ai-tour-munich',
    name: 'Microsoft AI Tour',
    brand: 'Microsoft',
    type: 'in-person',
    date: '2026-02-25',
    city: 'Munich',
    state: '',
    country: 'DE',
    position: { lat: 48.1351, lng: 11.582 },
    description:
      'AI Tour stop — enterprise AI, Copilot, Azure sessions',
    expectedAttendees: 2000,
    url: 'https://msaitour.microsoft.com/',
  },
  {
    id: 'ms-ai-tour-milan',
    name: 'Microsoft AI Tour',
    brand: 'Microsoft',
    type: 'in-person',
    date: '2026-03-10',
    city: 'Milan',
    state: '',
    country: 'IT',
    position: { lat: 45.4642, lng: 9.19 },
    description:
      'AI Tour stop — enterprise AI, Copilot, Azure sessions',
    expectedAttendees: 2000,
    url: 'https://msaitour.microsoft.com/',
  },
  {
    id: 'ms-ai-tour-brussels',
    name: 'Microsoft AI Tour',
    brand: 'Microsoft',
    type: 'in-person',
    date: '2026-03-26',
    city: 'Brussels',
    state: '',
    country: 'BE',
    position: { lat: 50.8503, lng: 4.3517 },
    description:
      'AI Tour stop — enterprise AI, Copilot, Azure sessions',
    expectedAttendees: 1500,
    url: 'https://msaitour.microsoft.com/',
  },

  // ── Microsoft — Copilot events ─────────────────────────
  {
    id: 'ms-copilot-chicago',
    name: 'Copilot Symposium',
    brand: 'Microsoft',
    type: 'in-person',
    date: '2026-02-11',
    dateEnd: '2026-02-12',
    city: 'Chicago',
    state: 'IL',
    country: 'US',
    position: { lat: 41.8855, lng: -87.6187 },
    description:
      'ILTA-hosted hands-on Copilot symposium at Microsoft Technology Center',
    expectedAttendees: 200,
    url: 'https://iltanet.org/',
  },
  {
    id: 'ms-copilot-gov-dallas',
    name: 'M365 Copilot Gov Roadshow',
    brand: 'Microsoft',
    type: 'in-person',
    date: '2026-04-01',
    city: 'Dallas',
    state: 'TX',
    country: 'US',
    position: { lat: 32.7767, lng: -96.797 },
    description:
      'Full-day Copilot hands-on experience for government — Prompt-a-thon & Agent-a-thon',
    expectedAttendees: 150,
  },
  {
    id: 'ms-copilot-gov-boston',
    name: 'M365 Copilot Gov Roadshow',
    brand: 'Microsoft',
    type: 'in-person',
    date: '2026-04-08',
    city: 'Boston',
    state: 'MA',
    country: 'US',
    position: { lat: 42.3601, lng: -71.0589 },
    description:
      'Full-day Copilot hands-on experience for government — Prompt-a-thon & Agent-a-thon',
    expectedAttendees: 150,
  },
  {
    id: 'ms-copilot-gov-ftlauderdale',
    name: 'M365 Copilot Gov Roadshow',
    brand: 'Microsoft',
    type: 'in-person',
    date: '2026-04-16',
    city: 'Fort Lauderdale',
    state: 'FL',
    country: 'US',
    position: { lat: 26.1224, lng: -80.1373 },
    description:
      'Full-day Copilot hands-on experience for government — Prompt-a-thon & Agent-a-thon',
    expectedAttendees: 150,
  },
  {
    id: 'ms-copilot-gov-nyc',
    name: 'M365 Copilot Gov Roadshow',
    brand: 'Microsoft',
    type: 'in-person',
    date: '2026-05-07',
    city: 'New York',
    state: 'NY',
    country: 'US',
    position: { lat: 40.7128, lng: -74.006 },
    description:
      'Full-day Copilot hands-on experience for government — Prompt-a-thon & Agent-a-thon',
    expectedAttendees: 150,
  },

  // ── Anthropic ───────────────────────────────────────────
  {
    id: 'anthropic-responsible-agents-london',
    name: 'Responsible Agents & Future of AI',
    brand: 'Anthropic',
    type: 'hybrid',
    date: '2026-03-17',
    city: 'London',
    state: '',
    country: 'UK',
    position: { lat: 51.5074, lng: -0.1278 },
    description:
      'Invite-only event with policymakers and industry leaders discussing agentic AI developments',
    expectedAttendees: 300,
    url: 'https://www.anthropic.com/events/agentic-ai-in-action',
  },
  {
    id: 'anthropic-gcn-lasvegas',
    name: 'Anthropic at Google Cloud Next',
    brand: 'Anthropic',
    type: 'in-person',
    date: '2026-04-22',
    city: 'Las Vegas',
    state: 'NV',
    country: 'US',
    position: { lat: 36.1699, lng: -115.1398 },
    description:
      'Booth #2021 — enterprise-ready AI demos for long-running agents on Vertex AI',
    expectedAttendees: 1000,
    url: 'https://www.anthropic.com/events/anthropic-at-google-cloud-next-2026',
  },
  {
    id: 'anthropic-code-claude-sf',
    name: 'Code with Claude — SF',
    brand: 'Anthropic',
    type: 'in-person',
    date: '2026-05-06',
    city: 'San Francisco',
    state: 'CA',
    country: 'US',
    position: { lat: 37.7749, lng: -122.4194 },
    description:
      'Anthropic developer conference — hands-on workshops, live demos, and office hours',
    expectedAttendees: 500,
    url: 'https://www.claude.com/blog/code-with-claude-san-francisco-london-tokyo',
  },
  {
    id: 'anthropic-code-claude-london',
    name: 'Code with Claude — London',
    brand: 'Anthropic',
    type: 'in-person',
    date: '2026-05-19',
    city: 'London',
    state: '',
    country: 'UK',
    position: { lat: 51.5074, lng: -0.1278 },
    description:
      'Anthropic developer conference — hands-on workshops, live demos, and office hours',
    expectedAttendees: 500,
    url: 'https://www.claude.com/blog/code-with-claude-san-francisco-london-tokyo',
  },
  {
    id: 'anthropic-code-claude-tokyo',
    name: 'Code with Claude — Tokyo',
    brand: 'Anthropic',
    type: 'in-person',
    date: '2026-06-10',
    city: 'Tokyo',
    state: '',
    country: 'JP',
    position: { lat: 35.6762, lng: 139.6503 },
    description:
      'Anthropic developer conference — hands-on workshops, live demos, and office hours',
    expectedAttendees: 500,
    url: 'https://www.claude.com/blog/code-with-claude-san-francisco-london-tokyo',
  },

  // ── OpenAI ──────────────────────────────────────────────
  {
    id: 'openai-builder-nyc',
    name: 'OpenAI Builder Lounge — NYC',
    brand: 'OpenAI',
    type: 'in-person',
    date: '2026-03-18',
    city: 'New York',
    state: 'NY',
    country: 'US',
    position: { lat: 40.7128, lng: -74.006 },
    description:
      'Co-working, networking, AMA with OpenAI team, and dinner',
    expectedAttendees: 100,
    url: 'https://www.openai.com/startups/',
  },
  {
    id: 'openai-builder-sf',
    name: 'OpenAI Builder Lounge — SF',
    brand: 'OpenAI',
    type: 'in-person',
    date: '2026-03-24',
    city: 'San Francisco',
    state: 'CA',
    country: 'US',
    position: { lat: 37.7749, lng: -122.4194 },
    description:
      'Co-working, networking, AMA with OpenAI team, and dinner',
    expectedAttendees: 100,
    url: 'https://www.openai.com/startups/',
  },
  {
    id: 'openai-builder-adelaide',
    name: 'OpenAI Builder Lounge — Adelaide',
    brand: 'OpenAI',
    type: 'in-person',
    date: '2026-03-17',
    city: 'Adelaide',
    state: 'SA',
    country: 'AU',
    position: { lat: -34.9285, lng: 138.6007 },
    description:
      'Builder session — frontier model updates, founder demos, technical deep dive at Stone & Chalk',
    expectedAttendees: 80,
    url: 'https://www.openai.com/startups/',
  },
  {
    id: 'openai-builder-singapore',
    name: 'OpenAI Builder Lounge — Singapore',
    brand: 'OpenAI',
    type: 'in-person',
    date: '2026-02-04',
    city: 'Singapore',
    state: '',
    country: 'SG',
    position: { lat: 1.2838, lng: 103.8591 },
    description:
      'Coworking, direct access to OpenAI tools and team, AMA, dinner, and open demos',
    expectedAttendees: 80,
    url: 'https://www.openai.com/startups/',
  },
  {
    id: 'openai-devday-2026',
    name: 'OpenAI DevDay 2026',
    brand: 'OpenAI',
    type: 'hybrid',
    date: '2026-10-06',
    city: 'San Francisco',
    state: 'CA',
    country: 'US',
    position: { lat: 37.7749, lng: -122.4194 },
    description:
      'OpenAI\'s annual developer conference — expected Fall 2026 based on prior editions',
    expectedAttendees: 3000,
    url: 'https://openai.com/devday/',
  },

  // ── AWS — Flagship ─────────────────────────────────────
  {
    id: 'aws-reinvent-2026',
    name: 'AWS re:Invent 2026',
    brand: 'AWS',
    type: 'in-person',
    date: '2026-11-30',
    dateEnd: '2026-12-04',
    city: 'Las Vegas',
    state: 'NV',
    country: 'US',
    position: { lat: 36.1699, lng: -115.1398 },
    description:
      'AWS flagship conference — 1,000+ sessions, keynotes, hands-on labs across multiple Strip venues',
    expectedAttendees: 60000,
    url: 'https://aws.amazon.com/reinvent/',
  },

  // ── AWS — Summits (global) ─────────────────────────────
  {
    id: 'aws-summit-paris',
    name: 'AWS Summit Paris',
    brand: 'AWS',
    type: 'in-person',
    date: '2026-04-01',
    city: 'Paris',
    state: '',
    country: 'FR',
    position: { lat: 48.8783, lng: 2.2831 },
    description:
      'Free one-day summit — 150+ sessions, keynotes, hands-on labs at Palais des Congrès',
    expectedAttendees: 10000,
    url: 'https://aws.amazon.com/events/summits/paris/',
  },
  {
    id: 'aws-summit-london',
    name: 'AWS Summit London',
    brand: 'AWS',
    type: 'in-person',
    date: '2026-04-22',
    city: 'London',
    state: '',
    country: 'UK',
    position: { lat: 51.5085, lng: 0.0556 },
    description:
      'Free one-day summit — 200+ sessions, keynotes, hands-on labs at ExCeL London',
    expectedAttendees: 15000,
    url: 'https://aws.amazon.com/events/summits/london/',
  },
  {
    id: 'aws-summit-toronto',
    name: 'AWS Summit Toronto',
    brand: 'AWS',
    type: 'in-person',
    date: '2026-06-03',
    city: 'Toronto',
    state: 'ON',
    country: 'CA',
    position: { lat: 43.6445, lng: -79.3871 },
    description:
      'Free one-day summit at Metro Toronto Convention Centre — cloud & AI sessions',
    expectedAttendees: 8000,
    url: 'https://aws.amazon.com/events/summits/',
  },
  {
    id: 'aws-summit-la',
    name: 'AWS Summit Los Angeles',
    brand: 'AWS',
    type: 'in-person',
    date: '2026-06-10',
    city: 'Los Angeles',
    state: 'CA',
    country: 'US',
    position: { lat: 34.0407, lng: -118.2668 },
    description:
      'Free one-day summit — 120+ sessions, keynotes, hands-on labs at LA Convention Center',
    expectedAttendees: 10000,
    url: 'https://aws.amazon.com/events/summits/los-angeles/',
  },
  {
    id: 'aws-summit-dc',
    name: 'AWS Summit Washington D.C.',
    brand: 'AWS',
    type: 'in-person',
    date: '2026-06-30',
    dateEnd: '2026-07-01',
    city: 'Washington',
    state: 'DC',
    country: 'US',
    position: { lat: 38.9047, lng: -77.0164 },
    description:
      'Two-day public-sector summit at Walter E. Washington Convention Center',
    expectedAttendees: 15000,
    url: 'https://aws.amazon.com/events/summits/washington-dc/',
  },

  // ── Salesforce — Flagship ──────────────────────────────
  {
    id: 'salesforce-dreamforce-2026',
    name: 'Dreamforce 2026',
    brand: 'Salesforce',
    type: 'hybrid',
    date: '2026-09-15',
    dateEnd: '2026-09-17',
    city: 'San Francisco',
    state: 'CA',
    country: 'US',
    position: { lat: 37.7841, lng: -122.4005 },
    description:
      'Salesforce\'s mega-conference — AI, CRM, and Agentforce at Moscone Center',
    expectedAttendees: 40000,
    url: 'https://www.salesforce.com/dreamforce/',
  },

  // ── Salesforce — TDX & Tableau ─────────────────────────
  {
    id: 'salesforce-tdx-2026',
    name: 'TrailblazerDX (TDX) 2026',
    brand: 'Salesforce',
    type: 'hybrid',
    date: '2026-04-15',
    dateEnd: '2026-04-16',
    city: 'San Francisco',
    state: 'CA',
    country: 'US',
    position: { lat: 37.7841, lng: -122.4005 },
    description:
      '400+ technical sessions, hackathon, demos, and certification at Moscone West',
    expectedAttendees: 10000,
    url: 'https://www.salesforce.com/trailblazerdx/',
  },
  {
    id: 'salesforce-tableau-conf-2026',
    name: 'Tableau Conference 2026',
    brand: 'Salesforce',
    type: 'hybrid',
    date: '2026-05-05',
    dateEnd: '2026-05-07',
    city: 'San Diego',
    state: 'CA',
    country: 'US',
    position: { lat: 32.7076, lng: -117.1628 },
    description:
      'Data & analytics conference — sessions, bootcamp, certification at San Diego Convention Center',
    expectedAttendees: 8000,
    url: 'https://www.tableau.com/events/conference',
  },

  // ── Salesforce — Agentforce World Tour ─────────────────
  {
    id: 'salesforce-tour-nyc',
    name: 'Agentforce World Tour — NYC',
    brand: 'Salesforce',
    type: 'in-person',
    date: '2026-04-29',
    city: 'New York',
    state: 'NY',
    country: 'US',
    position: { lat: 40.7128, lng: -74.006 },
    description:
      'Regional Agentforce World Tour stop — AI, CRM, Agentforce demos and sessions',
    expectedAttendees: 3000,
    url: 'https://www.salesforce.com/events/',
  },
  {
    id: 'salesforce-tour-toronto',
    name: 'Agentforce World Tour — Toronto',
    brand: 'Salesforce',
    type: 'in-person',
    date: '2026-05-07',
    city: 'Toronto',
    state: 'ON',
    country: 'CA',
    position: { lat: 43.6532, lng: -79.3832 },
    description:
      'Regional Agentforce World Tour stop — AI, CRM, Agentforce demos and sessions',
    expectedAttendees: 2000,
    url: 'https://www.salesforce.com/events/',
  },
  {
    id: 'salesforce-tour-paris',
    name: 'Agentforce World Tour — Paris',
    brand: 'Salesforce',
    type: 'in-person',
    date: '2026-05-21',
    city: 'Paris',
    state: '',
    country: 'FR',
    position: { lat: 48.8566, lng: 2.3522 },
    description:
      'Regional Agentforce World Tour stop — AI, CRM, Agentforce demos and sessions',
    expectedAttendees: 3000,
    url: 'https://www.salesforce.com/events/',
  },
  {
    id: 'salesforce-tour-dallas',
    name: 'Agentforce World Tour — Dallas',
    brand: 'Salesforce',
    type: 'in-person',
    date: '2026-06-03',
    city: 'Dallas',
    state: 'TX',
    country: 'US',
    position: { lat: 32.7767, lng: -96.797 },
    description:
      'Regional Agentforce World Tour stop — AI, CRM, Agentforce demos and sessions',
    expectedAttendees: 2500,
    url: 'https://www.salesforce.com/events/',
  },
  {
    id: 'salesforce-tour-london',
    name: 'Agentforce World Tour — London',
    brand: 'Salesforce',
    type: 'in-person',
    date: '2026-06-18',
    city: 'London',
    state: '',
    country: 'UK',
    position: { lat: 51.5074, lng: -0.1278 },
    description:
      'Regional Agentforce World Tour stop — AI, CRM, Agentforce demos and sessions',
    expectedAttendees: 3000,
    url: 'https://www.salesforce.com/events/',
  },
  {
    id: 'salesforce-tour-boston',
    name: 'Agentforce World Tour — Boston',
    brand: 'Salesforce',
    type: 'in-person',
    date: '2026-06-24',
    city: 'Boston',
    state: 'MA',
    country: 'US',
    position: { lat: 42.3601, lng: -71.0589 },
    description:
      'Regional Agentforce World Tour stop — AI, CRM, Agentforce demos and sessions',
    expectedAttendees: 2000,
    url: 'https://www.salesforce.com/events/',
  },
  {
    id: 'salesforce-tour-dc',
    name: 'Agentforce World Tour — D.C.',
    brand: 'Salesforce',
    type: 'in-person',
    date: '2026-06-11',
    city: 'Washington',
    state: 'DC',
    country: 'US',
    position: { lat: 38.9072, lng: -77.0369 },
    description:
      'Regional Agentforce World Tour stop — AI, CRM, Agentforce demos and sessions',
    expectedAttendees: 2500,
    url: 'https://www.salesforce.com/events/world-tour/dc/',
  },
];
