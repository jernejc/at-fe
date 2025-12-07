// Company-related schemas

import type { Technology, Location, SocialProfile, FundingRound } from './common';

export interface CompanySummary {
    id: number;
    domain: string;
    name: string;
    industry: string | null;
    employee_count: number | null;
    hq_city: string | null;
    hq_country: string | null;
    linkedin_id: string | null;
    rating_overall: number | null;
    logo_url: string | null;
    logo_base64: string | null;
    data_sources: string[];
    updated_at: string;
}

export interface CompanyRead {
    id: number;
    domain: string;
    name: string;
    linkedin_id: string | null;
    description: string | null;
    industry: string | null;
    category: string | null;
    specialties: string[];
    technologies: Technology[];
    keywords: string[];
    employee_count: number | null;
    employee_count_range: string | null;
    company_type: string | null;
    founded_year: string | null;
    hq_address: string | null;
    hq_city: string | null;
    hq_state: string | null;
    hq_country: string | null;
    hq_country_code: string | null;
    locations: Location[];
    website_url: string | null;
    emails: string[];
    phones: string[];
    social_profiles: SocialProfile[];
    ticker: string | null;
    stock_exchange: string | null;
    revenue: string | null;
    funding_rounds: FundingRound[];
    rating_overall: number | null;
    rating_culture: number | null;
    rating_compensation: number | null;
    rating_work_life: number | null;
    rating_career: number | null;
    rating_management: number | null;
    reviews_count: number | null;
    reviews_url: string | null;
    has_pricing_page: boolean | null;
    has_free_trial: boolean | null;
    has_demo: boolean | null;
    has_api_docs: boolean | null;
    has_mobile_app: boolean | null;
    logo_url: string | null;
    logo_base64: string | null;
    meta_title: string | null;
    meta_description: string | null;
    followers_count: number | null;
    updates: unknown[];
    coresignal_id: string | null;
    linkedin_source_id: string | null;
    data_sources: string[];
    created_at: string;
    updated_at: string;
}

export interface StatsResponse {
    total_companies: number;
    total_employees: number;
    total_posts: number;
    total_job_postings: number;
    total_news_articles: number;
    companies_by_industry: Record<string, number>;
    companies_by_country: Record<string, number>;
    employees_by_department: Record<string, number>;
    avg_rating: number | null;
    last_updated: string | null;
}

export interface CompanyFilters {
    [key: string]: string | number | boolean | undefined;
    page?: number;
    page_size?: number;
    industry?: string;
    country?: string;
    min_employees?: number;
    max_employees?: number;
    has_rating?: boolean;
    sort_by?: 'domain' | 'name' | 'employee_count' | 'rating_overall' | 'updated_at';
    sort_order?: 'asc' | 'desc';
}
