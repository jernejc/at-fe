'use client';

import { use } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CampaignDetailHeader } from '@/components/campaigns/CampaignDetailHeader';
import { SecondaryNav } from '@/components/ui/secondary-nav';
import { CampaignDetailProvider } from '@/components/providers/CampaignDetailProvider';
import { useCampaignDetailHeader } from '@/hooks/useCampaignDetailHeader';
import { Separator } from '@/components/ui/separator';
import { StatusIndicator } from '@/components/ui/status-indicator';

interface PartnerCampaignLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default function PartnerCampaignLayout({ children, params }: PartnerCampaignLayoutProps) {
  const { slug } = use(params);

  return (
    <CampaignDetailProvider slug={slug} skipPartners>
      <PartnerCampaignLayoutInner slug={slug}>{children}</PartnerCampaignLayoutInner>
    </CampaignDetailProvider>
  );
}

function PartnerCampaignLayoutInner({ slug, children }: { slug: string; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { campaignName, campaignIcon, campaignStatus, productName, loading, error } =
    useCampaignDetailHeader();

  // Company detail routes have their own layout with header and nav
  const companiesBase = `/partner/campaigns/${slug}/companies/`;
  const isCompanyDetail = pathname.startsWith(companiesBase) && pathname.length > companiesBase.length;

  const navItems = [
    { label: 'Overview', href: `/partner/campaigns/${slug}` },
    { label: 'Companies', href: `/partner/campaigns/${slug}/companies` },
    // { label: 'Materials', href: `/partner/campaigns/${slug}/materials` },
  ];

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-lg font-semibold text-foreground">{error}</p>
        <Button
          onClick={() => router.push('/partner')}
          size="lg"
          className="h-10 px-6 rounded-lg"
        >
          Go Back
        </Button>
      </div>
    );
  }

  if (isCompanyDetail) {
    return (
      <div className="flex-1 flex flex-col bg-background">
        <div className="flex-1">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="flex-1">
        <div className='relative z-3'>
          <CampaignDetailHeader
            campaignName={campaignName}
            campaignIcon={campaignIcon}
            campaignStatus={campaignStatus}
            productName={productName}
            loading={loading}
            slug={slug}
            exportActions={['companies', 'contacts']}
            showImport
          />
        </div>
        <div className="sticky top-24 h-6 px-4 text-xs font-semibold flex gap-2 items-end z-2 bg-background -mt-6 min-w-0">
          <StatusIndicator
            status={campaignStatus ?? 'draft'}
            size={8}
            className='mb-1'
          />
          <span className='truncate'>{campaignName}</span>
        </div>
        <div className="sticky top-30 z-10 bg-background">
          <SecondaryNav items={navItems} className='px-4' />
          <Separator />
        </div>
        <div className="max-w-[1600px] mx-auto px-10 py-10">
          {children}
        </div>
      </div>
    </div>
  );
}
