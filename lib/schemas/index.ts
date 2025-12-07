// Barrel export for all schemas

// Common types
export type {
    PaginatedResponse,
    Technology,
    Location,
    SocialProfile,
    FundingRound,
    ValidationError,
    HTTPValidationError,
} from './common';

// Company types
export type {
    CompanySummary,
    CompanyRead,
    StatsResponse,
    CompanyFilters,
} from './company';

// Domain types
export type { DomainResult } from './domain';

// Employee types
export type {
    EmployeeSummary,
    EmployeeRead,
    EmployeeWithPosts,
    WorkExperience,
    Education,
    Certification,
    Publication,
    Patent,
    Award,
} from './employee';

// Content types
export type {
    PostSummary,
    JobPostingSummary,
    NewsArticleSummary,
} from './content';

// Playbook types
export type {
    PlaybookSummary,
    PlaybookRead,
    PlaybookContact,
    PlaybookContactResponse,
    OutreachTemplateResponse,
    CompanyPlaybooksResponse,
    PlaybookFilters,
} from './playbook';

// Signal types
export type {
    CompanySignal,
    CompanySignalResponse,
    CompanySignalsResponse,
    EmployeeSignalResponse,
    EmployeeSignalsListResponse,
    SignalCategoryInfo,
    SignalCategoriesResponse,
    SignalAggregationResponse,
    AggregatedSignal,
    CompanySignalAggregationResult,
    AggregationResultResponse,
    AnalysisStatusResponse,
} from './signal';

// Product types
export type {
    ProductSummary,
    ProductRead,
    ProductCreate,
    ProductUpdate,
    ProductInterestWeightSchema,
    ProductEventWeightSchema,
    ProductFitResponse,
} from './product';

// Search types
export type { SearchResults } from './search';
