// Core utilities
export { API_BASE, A2A_API_BASE, APIError, fetchAPI, buildQueryString } from './core';

// Companies
export {
    getCompanies,
    getCompany,
    getCompanyExplainability,
    getSignalProvenance,
    getCompanyEmployees,
    getCompanyJobs,
} from './companies';

// Employees
export {
    getEmployees,
    getEmployee,
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
    createProduct,
    updateProduct,
    deleteProduct,
    calculateProductFit,
    getProductCandidates,
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

// Campaigns
export {
    getCampaigns,
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

// Notifications
export {
    getUnreadCount,
    getNotifications,
    markAllRead,
} from './notifications';

// Partners
export {
    getPartners,
    getPartner,
    createPartner,
    getCampaignPartners,
    assignPartnerToCampaign,
    bulkAssignPartners,
    assignAllCompaniesToPartners,
    unassignPartnerFromCampaign,
    getPartnerAssignedCompanies,
    assignCompanyToPartner,
    bulkAssignCompaniesToPartner,
    unassignCompanyFromPartner,
} from './partners';
