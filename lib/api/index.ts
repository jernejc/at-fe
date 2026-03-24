// Core utilities
export { API_BASE, fetchAPI, buildQueryString } from './core';

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
export { getEmployee } from './employees';

// Fit Scores
export { getFitBreakdown } from './fit-scores';

// Products
export {
    getProducts,
    getProductCandidates,
    exportProductXlsx,
} from './products';

// Playbooks
export {
    getCompanyPlaybooks,
    generateCompanyPlaybookAsync,
    getCompanyPlaybook,
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
    getCampaignCompanies,
    addCompaniesBulk,
    updateMembership,
    removeCompanyFromCampaign,
    exportCampaignCSV,
    exportCampaignContactsCSV,
    getCampaignCompany,
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
    getCampaignPartners,
    bulkAssignPartners,
    assignAllCompaniesToPartners,
    getPartnerCompanies,
    getPartnerAssignedCompanies,
    assignCompanyToPartner,
    bulkAssignCompaniesToPartner,
    unassignCompanyFromPartner,
    removeCampaignPartner,
} from './partners';
