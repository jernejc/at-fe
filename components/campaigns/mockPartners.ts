// Real Google Cloud Partners - Mock data for demo purposes
// Using Google's favicon service as a reliable fallback

import { Partner } from '@/lib/schemas/campaign';

// Google Cloud Premier Partners with real company information
export const MOCK_PARTNERS: Partner[] = [
    {
        id: 'sada',
        name: 'SADA',
        type: 'consulting',
        description: 'Multiple-time Google Cloud Partner of the Year. Specializes in AI/ML, security, data analytics, and cloud migration.',
        status: 'active',
        match_score: 98,
        logo_url: 'https://www.google.com/s2/favicons?domain=sada.com&sz=64',
        capacity: 25,
        assigned_count: 0,
        industries: ['Technology', 'Healthcare', 'Retail', 'Financial Services'],
    },
    {
        id: 'accenture',
        name: 'Accenture',
        type: 'consulting',
        description: 'Global professional services company providing strategy, consulting, digital, technology and operations services.',
        status: 'active',
        match_score: 96,
        logo_url: 'https://www.google.com/s2/favicons?domain=accenture.com&sz=64',
        capacity: 50,
        assigned_count: 0,
        industries: ['Enterprise', 'Financial Services', 'Healthcare', 'Automotive'],
    },
    {
        id: 'slalom',
        name: 'Slalom',
        type: 'consulting',
        description: 'Modern consulting firm focused on technology-enabled transformation. Expertise in Vertex AI and data analytics.',
        status: 'active',
        match_score: 94,
        logo_url: 'https://www.google.com/s2/favicons?domain=slalom.com&sz=64',
        capacity: 20,
        assigned_count: 0,
        industries: ['Technology', 'Retail', 'Media'],
    },
    {
        id: 'datatonic',
        name: 'Datatonic',
        type: 'technology',
        description: 'Data & AI consultancy specializing in BigQuery, Generative AI projects, and machine learning implementations.',
        status: 'active',
        match_score: 92,
        logo_url: 'https://www.google.com/s2/favicons?domain=datatonic.com&sz=64',
        capacity: 15,
        assigned_count: 0,
        industries: ['Technology', 'E-commerce', 'Media'],
    },
    {
        id: 'searce',
        name: 'Searce',
        type: 'technology',
        description: 'Cloud-native tech consulting firm focused on Cloud, AI, and Analytics. Premier Google Cloud Partner.',
        status: 'active',
        match_score: 90,
        logo_url: 'https://www.google.com/s2/favicons?domain=searce.com&sz=64',
        capacity: 18,
        assigned_count: 0,
        industries: ['Startups', 'SaaS', 'Fintech'],
    },
    {
        id: 'doit',
        name: 'DoiT International',
        type: 'reseller',
        description: 'Cloud optimization experts specializing in cost-optimized analytics architectures and multi-cloud environments.',
        status: 'active',
        match_score: 88,
        logo_url: 'https://www.google.com/s2/favicons?domain=doit.com&sz=64',
        capacity: 30,
        assigned_count: 0,
        industries: ['Technology', 'SaaS', 'Startups'],
    },
];

// Smaller subset for PartnerTab (campaign-level assigned partners)
export const DEFAULT_CAMPAIGN_PARTNERS = MOCK_PARTNERS.slice(0, 3);
