// Barrel export for all schemas

// Common types
export type {
    PaginatedResponse,
    Technology,
    Location,
    SocialProfile,
    FundingRound,
} from './common';

// Company types
export type {
    CompanySummary,
    CompanySummaryWithFit,
    CompanyRead,
    CompanyDetailResponse,
    CompanyInclude,
    CompanyRowData,
    CompanyFilters,
    DataDepth,
} from './company';

// Employee types
export type {
    EmployeeSummary,
    EmployeeSummaryWithWeight,
    EmployeeRead,
    EmployeeWithPosts,
    EmployeeDetailResponse,
    EmployeeFilters,
    WorkExperience,
    Education,
} from './employee';

// Content types
export type {
    PostSummary,
    JobPostingSummary,
} from './content';

// Playbook types
export type {
    PlaybookSummary,
    PlaybookRead,
    PlaybookContact,
    PlaybookContactResponse,
    OutreachTemplateResponse,
    OutreachMessage,
    OutreachMessageType,
    CadenceStep,
    CadenceStepContact,
    CommitteeCoverage,
    CompanyPlaybooksResponse,
    ObjectionHandlingEntry,
    ApproachNotes,
} from './playbook';

// Signal types
export type {
    SignalDetail,
    SignalContributor,
} from './signal';

// Fit score types
export type {
    SignalContribution,
    FitScore,
    FitScoreSummary,
    FitInclude,
    CandidateFitSummary,
    ProductCandidatesResponse,
} from './fit';

// Product types
export type {
    ProductSummary,
    ProductRead,
} from './product';

// Search types
export type {
    SearchResults,
    WSSearchPhase,
    WSSearchRequest,
    WSSearchInterpretation,
    WSTopInterest,
    WSCompanyResult,
    WSPartnerResult,
    WSPartnerSuggestion,
    WSSearchInsights,
    WSInterestFrequency,
    WSSearchMessage,
} from './search';

// Campaign types
export type {
    CampaignSummary,
    CampaignRowData,
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
    CampaignFilters,
    CampaignFilterType,
    CampaignFilterUI,
    Partner,
    PartnerType,
    CampaignCompanyRead,
} from './campaign';

// Partner types
export type {
    PartnerSummary,
    PartnerRead,
    CampaignAssignmentSummary,
    BulkAssignResult as PartnerBulkAssignResult,
    PartnerFilters,
    PartnerAssignmentSummary,
    PartnerCompanyAssignmentCreate,
    PartnerCompanyAssignmentRead,
    PartnerCompanyAssignmentWithCompany,
    PartnerCompanyItem,
    BulkCompanyAssignResult,
    AssignAllResult,
} from './partner';

// Explainability types
export type {
    CompanyExplainabilityResponse,
    SignalInterest,
    SignalEvent,
    SignalComponent,
    FitSummaryFit,
    ProductRowData,
} from './explainability';

// Filter & Sort types
export type {
    FilterOperator,
    FilterOption,
    FilterDefinition,
    ActiveFilter,
    SortOptionDefinition,
    SortState,
} from './filter';

export { FILTER_OPERATOR_LABELS } from './filter';

// Notification types
export type {
    NotificationData,
    Notification,
    UnreadCountResponse,
} from './notification';

