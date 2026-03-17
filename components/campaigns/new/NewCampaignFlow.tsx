'use client';

import { useNewCampaignFlow } from './useNewCampaignFlow';
import { TopBar } from './TopBar';
import { StepTransition } from './StepTransition';
import { SearchStep } from './steps/SearchStep';
import { ResultsStep } from './steps/ResultsStep';
import { PartnersStep } from './steps/PartnersStep';
import { CreateStep } from './steps/CreateStep';
import type { NewCampaignFlowProps } from './useNewCampaignFlow.types';

/** Root component for the new campaign creation wizard. */
export function NewCampaignFlow({ products, preselectedProductId }: NewCampaignFlowProps) {
  const flow = useNewCampaignFlow({ products, preselectedProductId });

  return (
    <div className="sm:h-[calc(100vh-6rem)] flex flex-col overflow-hidden bg-background">
      <TopBar
        step={flow.step}
        products={flow.products}
        selectedProduct={flow.selectedProduct}
        onProductSelect={flow.handleProductSelect}
        onSubmit={flow.handleSubmit}
        searchPhase={flow.agenticState.phase}
        isSearching={flow.isSearching}
        interpretation={flow.agenticState.interpretation}
        inputResetKey={flow.inputResetKey}
        externalSubmitRef={flow.externalSubmitRef}
        onClose={flow.handleClose}
        onRestart={flow.handleRestart}
        onSelectPartners={flow.handleSelectPartners}
        hasCompanies={flow.filteredCompanies.length > 0}
        canContinue={flow.partnerSelection.selectedPartnerSlugs.size > 0}
        selectedCapacity={flow.partnerSelection.selectedCapacity}
        targetCompanyCount={flow.filteredCompanies.length}
        onBack={flow.handleBack}
        onContinue={flow.handleContinue}
      />

      <StepTransition stepKey={flow.step} direction={flow.direction}>
        {flow.step === 'search' && <SearchStep />}

        {flow.step === 'results' && (
          <ResultsStep
            companies={flow.filteredCompanies}
            totalCompanies={flow.agenticState.companies.length}
            selectedCompanyDomain={flow.selectedCompanyDomain}
            onSelectCompany={flow.handleSelectCompany}
            productId={flow.selectedProduct?.id ?? null}
            resultsFilters={flow.resultsFilters}
            insights={flow.agenticState.insights}
            suggestedQueries={flow.agenticState.suggestedQueries}
            onSuggestedQueryClick={flow.handleSuggestedQuery}
            isSearching={flow.isSearching}
          />
        )}

        {flow.step === 'partners' && (
          <PartnersStep
            partners={flow.partnerSelection.partners}
            selectedSlugs={flow.partnerSelection.selectedPartnerSlugs}
            onToggle={flow.partnerSelection.togglePartner}
            loading={flow.partnerSelection.loading}
            hasMore={flow.partnerSelection.hasMore}
            loadingMore={flow.partnerSelection.loadingMore}
            onLoadMore={flow.partnerSelection.loadMore}
          />
        )}

        {flow.step === 'create' && (
          <CreateStep
            campaignName={flow.creation.campaignName}
            onNameChange={flow.creation.setCampaignName}
            campaignIcon={flow.creation.campaignIcon}
            onIconChange={flow.creation.setCampaignIcon}
            isCreating={flow.creation.isCreating}
            createError={flow.creation.createError}
            onCreate={flow.handleCreate}
          />
        )}
      </StepTransition>
    </div>
  );
}
