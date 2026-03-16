// Core utilities
export { API_BASE, A2A_API_BASE, APIError, fetchAPI, buildQueryString } from './core';

// Companies
export {
    getCompanies,
    getCompany,
    getCompanyLegacy,
    getCompanyExplainability,
    getSignalProvenance,
    getCompanyEmployees,
    getCompanyJobs,
    getCompanyNews,
    getCompanyPosts,
} from './companies';

// Employees
export {
    getEmployees,
    getEmployee,
    analyzeEmployee,
    getEmployeeByLinkedIn,
} from './employees';

// Signals
export {
    getSignalCategories,
    getCompanySignals,
    getSignalContributors,
    aggregateCompanySignals,
    getSignalStats,
} from './signals';

// Fit Scores
export {
    getFits,
    getFitHealth,
    getFit,
    getFitBreakdown,
    calculateFits,
} from './fit-scores';

// Products
export {
    getProducts,
    getProduct,
    getProductByName,
    createProduct,
    updateProduct,
    deleteProduct,
    calculateProductFit,
    getProductCandidates,
    calculateProductCandidates,
    compareCompanyFits,
    exportProductXlsx,
} from './products';

// Playbooks
export {
    getPlaybooks,
    getPlaybook,
    deletePlaybook,
    getCompanyPlaybooks,
    generateCompanyPlaybook,
    generateCompanyPlaybookAsync,
    getCompanyPlaybook,
    generatePlaybooks,
    generatePlaybooksBulk,
} from './playbooks';
export type { AsyncPlaybookResponse } from './playbooks';

// Search
export { searchCompanies, search } from './search';

// Helpers
export {
    getScoreCategory,
    getScoreLabel,
    getUrgencyLabel,
    formatEmployeeCount,
    PRODUCT_GROUPS,
} from './helpers';
export type { ProductGroupId } from './helpers';

// Processing
export type { ProcessingOptions } from './processing';
export { startProcessing, waitForProcessingComplete } from './processing';

// Campaigns
export {
    getCampaigns,
    getMyCampaigns,
    getCampaign,
    createCampaign,
    updateCampaign,
    publishCampaign,
    unpublishCampaign,
    deleteCampaign,
    getCampaignOverview,
    getCampaignComparison,
    getCampaignCompanies,
    addCompanyToCampaign,
    addCompaniesBulk,
    updateMembership,
    removeCompanyFromCampaign,
    exportCampaign,
    exportCampaignCSV,
    exportCampaignContactsCSV,
    importCampaign,
    refreshCampaignStats,
    processCampaign,
    getCampaignFunnel,
    getCampaignCompany,
    getCompanyProgress,
} from './campaigns';

// Partners
export {
    getPartners,
    getPartner,
    createPartner,
    getCampaignPartners,
    assignPartnerToCampaign,
    bulkAssignPartners,
    unassignPartnerFromCampaign,
    suggestPartnersForCompanies,
    getPartnerAssignedCompanies,
    assignCompanyToPartner,
    bulkAssignCompaniesToPartner,
    unassignCompanyFromPartner,
    updatePartnerCompanyAssignment,
    getCompanyAssignedPartners,
} from './partners';
