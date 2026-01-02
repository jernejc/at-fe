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
    CompanySummaryWithFit,
    CompanyRead,
    CompanyDetailResponse,
    CompanyInclude,
    StatsResponse,
    CompanyFilters,
    DataDepth,
} from './company';

// Domain types
export type { DomainResult } from './domain';

// Employee types
export type {
    EmployeeSummary,
    EmployeeSummaryWithWeight,
    EmployeeRead,
    EmployeeWithPosts,
    EmployeeDetailResponse,
    EmployeeFilters,
    AnalyzeEmployeeRequest,
    AnalyzeEmployeeResponse,
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
    PlaybookRegenerateRequest,
    PlaybookRegenerateResponse,
    BulkPlaybookGenerationResponse,
    PlaybookContext,
} from './playbook';

// Signal types
export type {
    SignalDetail,
    SignalsInclude,
    CompanySignalsResponse,
    SignalContributor,
    SignalContributorsResponse,
    SignalCategoryInfo,
    SignalCategoriesResponse,
    SignalStatsResponse,
    EmployeeDetectedInterest,
    EmployeeDetectedEvent,
    EmployeeSignalsInclude,
    AggregateRequest,
    AggregateResponse,
    // Legacy types for backward compatibility
    CompanySignal,
    CompanySignalResponse,
    EmployeeSignalResponse,
    EmployeeSignalsListResponse,
    SignalAggregationResponse,
    AggregatedSignal,
    CompanySignalAggregationResult,
    AggregationResultResponse,
    AnalysisStatusResponse,
} from './signal';

// Fit score types
export type {
    SignalContribution,
    FitScore,
    FitScoreSummary,
    FitInclude,
    FitCacheInfo,
    FitCacheHealth,
    CandidateFitSummary,
    ProductCandidatesResponse,
    FitCalculateRequest,
    FitCalculateResponse,
    CompanyFitComparisonResponse,
    ProductFitScore,
    SignalMatch,
} from './fit';

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

// Campaign types
export type {
    CampaignSummary,
    CampaignRead,
    CampaignCreate,
    CampaignUpdate,
    CampaignSegment,
    FitDistribution,
    CampaignOverview,
    MembershipRead,
    MembershipCreate,
    MembershipUpdate,
    BulkAddResult,
    CompanyComparison,
    CampaignComparison,
    ProcessRequest,
    ProcessResult,
    CampaignExport,
    ImportResult,
    CampaignImport,
    CampaignFilters,
    FunnelStage,
    CampaignFunnel,
    CampaignFilterType,
    CampaignFilterUI,
    Partner,
    PartnerType,
} from './campaign';

// Partner types
export type {
    PartnerSummary,
    PartnerRead,
    PartnerWithRelations,
    CampaignAssignmentSummary,
    PartnerCreate,
    PartnerUpdate,
    CampaignPartnerRead,
    CampaignPartnerCreate,
    CampaignPartnerUpdate,
    BulkAssignResult as PartnerBulkAssignResult,
    PartnerFilters,
    PartnerAssignmentSummary,
    PartnerSuggestion,
} from './partner';

// Explainability types
export type {
    CompanyExplainabilityResponse,
    SignalsSummary,
    SignalInterest,
    SignalEvent,
    FitSummaryFit,
    DataCoverage,
    Freshness,
} from './explainability';

// A2A types
export type {
    AgentCard,
    Invocation,
} from './a2a';

