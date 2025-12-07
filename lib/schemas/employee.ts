// Employee-related schemas

import type { SocialProfile } from './common';
import type { PostSummary } from './content';

export interface EmployeeSummary {
    id: number;
    full_name: string;
    headline: string | null;
    current_title: string | null;
    department: string | null;
    company_id: number;
    city: string | null;
    country: string | null;
    profile_url: string | null;
    avatar_url: string | null;
    is_decision_maker: boolean;
    is_currently_employed: boolean;
}

export interface WorkExperience {
    title: string;
    company_name: string;
    company_id: number | null;
    company_url: string | null;
    company_logo_url: string | null;
    company_industry: string | null;
    company_size: string | null;
    location: string | null;
    start_date: string | null;
    end_date: string | null;
    duration_months: number | null;
    description: string | null;
    is_current: boolean;
}

export interface Education {
    school_name: string;
    school_id: number | null;
    school_url: string | null;
    school_logo_url: string | null;
    degree: string | null;
    field_of_study: string | null;
    start_year: number | null;
    end_year: number | null;
    grade: string | null;
    activities: string | null;
    description: string | null;
}

export interface Certification {
    name: string;
    issuing_authority: string | null;
    license_number: string | null;
    url: string | null;
    issue_date: string | null;
    expiry_date: string | null;
}

export interface Publication {
    title: string;
    publisher: string | null;
    url: string | null;
    date: string | null;
    description: string | null;
}

export interface Patent {
    title: string;
    patent_number: string | null;
    url: string | null;
    issue_date: string | null;
    description: string | null;
}

export interface Award {
    title: string;
    issuer: string | null;
    date: string | null;
    description: string | null;
}

export interface EmployeeRead {
    id: number;
    company_id: number;
    linkedin_id: string | null;
    full_name: string;
    first_name: string | null;
    last_name: string | null;
    headline: string | null;
    bio: string | null;
    profile_url: string | null;
    avatar_url: string | null;
    banner_url: string | null;
    current_title: string | null;
    department: string | null;
    management_level: string | null;
    is_decision_maker: boolean;
    is_currently_employed: boolean;
    city: string | null;
    state: string | null;
    country: string | null;
    country_code: string | null;
    emails: string[];
    phones: string[];
    social_profiles: SocialProfile[];
    gender: string | null;
    age_range: string | null;
    experience: WorkExperience[];
    education: Education[];
    skills: string[];
    certifications: Certification[];
    languages: string[];
    total_experience_months: number | null;
    publications: Publication[];
    patents: Patent[];
    awards: Award[];
    connections_count: number | null;
    followers_count: number | null;
    recommendations_count: number | null;
    recommendations: unknown[];
    organizations: unknown[];
    current_job_description: string | null;
    activity: unknown[];
    is_active: boolean;
    coresignal_id: string | null;
    public_profile_id: string | null;
    data_sources: string[];
    created_at: string;
    updated_at: string;
}

export interface EmployeeWithPosts extends EmployeeRead {
    posts: PostSummary[];
}
