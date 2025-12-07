// Common types used across multiple schemas

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}

export interface Technology {
    technology: string;
    lastVerifiedAt: string | null;
}

export interface Location {
    address: string | null;
    street: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
    country_code: string | null;
    regions: string[];
    is_headquarters: boolean;
}

export interface SocialProfile {
    platform: string;
    url: string;
    username: string | null;
    is_primary: boolean;
}

export interface FundingRound {
    round_type: string | null;
    amount: number | null;
    currency: string | null;
    date: string | null;
    investors: string[];
}

export interface ValidationError {
    loc: (string | number)[];
    msg: string;
    type: string;
}

export interface HTTPValidationError {
    detail: ValidationError[];
}
