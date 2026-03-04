'use client';

import { X, RotateCcw, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CampaignInput } from './CampaignInput';
import type { TopBarProps } from './useNewCampaignFlow.types';

/** Three-section responsive header for the campaign creation wizard. */
export function TopBar({
  step,
  products,
  selectedProduct,
  onProductSelect,
  onSubmit,
  searchPhase,
  isSearching,
  inputResetKey,
  externalSubmitRef,
  onClose,
  onRestart,
  onSelectPartners,
  hasCompanies,
  canContinue,
  onBack,
  onContinue,
}: TopBarProps) {
  const showInput = step === 'search' || step === 'results';

  return (
    <header className="shrink-0 bg-background">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 pt-3 sm:pt-0">
        {/* Left section */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center md:min-w-40">
          <Button variant="outline" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
          {step !== 'search' && (
            <Button variant="outline" onClick={onRestart}>
              <RotateCcw data-icon="inline-start" className="size-4" />
              Restart
            </Button>
          )}
        </div>

        {/* Center section — CampaignInput with absolute dropdown */}
        <div className="flex-1 max-w-2xl w-full relative z-10 h-22">
          {showInput && (
            <CampaignInput
              key={inputResetKey}
              products={products}
              selectedProduct={selectedProduct}
              onProductSelect={onProductSelect}
              onSubmit={onSubmit}
              searchPhase={searchPhase}
              isSearching={isSearching}
              externalSubmitRef={externalSubmitRef}
              className="sm:absolute sm:rounded-t-none sm:border-t-0 top-0 left-0 right-0"
            />
          )}
        </div>

        {/* Right section — step-dependent actions */}
        <div className="flex items-center justify-end gap-2 shrink-0 self-end sm:self-center md:min-w-40">
          {step === 'results' && (
            <Button variant="secondary" onClick={onSelectPartners} disabled={!hasCompanies || isSearching}>
              Select partners
              <ArrowRight data-icon="inline-end" className="size-4" />
            </Button>
          )}
          {step === 'partners' && (
            <>
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft data-icon="inline-start" className="size-4" />
                Back
              </Button>
              <Button variant="secondary" onClick={onContinue} disabled={!canContinue}>
                Continue
                <ArrowRight data-icon="inline-end" className="size-4" />
              </Button>
            </>
          )}
          {step === 'create' && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft data-icon="inline-start" className="size-4" />
              Back
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
