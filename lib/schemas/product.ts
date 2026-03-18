// Product-related schemas

export interface ProductSummary {
    id: number;
    name: string;
    description: string | null;
    category: string | null;
    interest_count: number;
    event_count: number;
}

export interface ProductInterestWeightSchema {
    interest: string;
    weight: number;
    reasoning: string | null;
}

export interface ProductEventWeightSchema {
    event: string;
    weight: number;
    urgency_multiplier: number;
    reasoning: string | null;
}

export interface ProductRead {
    id: number;
    name: string;
    description: string | null;
    category: string | null;
    value_props: Record<string, unknown> | null;
    common_objections: string[] | null;
    discovery_questions: string[] | null;
    interest_weights: ProductInterestWeightSchema[];
    event_weights: ProductEventWeightSchema[];
}

