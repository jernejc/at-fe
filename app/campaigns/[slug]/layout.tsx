'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CampaignDetailHeader } from '@/components/campaigns/CampaignDetailHeader';
import { SecondaryNav } from '@/components/ui/secondary-nav';
import { CampaignDetailProvider } from '@/components/providers/CampaignDetailProvider';
import { useCampaignDetailHeader } from '@/hooks/useCampaignDetailHeader';
import { Separator } from '@/components/ui/separator';
import { StatusIndicator } from '@/components/ui/status-indicator';

interface CampaignLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default function CampaignLayout({ children, params }: CampaignLayoutProps) {
  const { slug } = use(params);

  return (
    <CampaignDetailProvider slug={slug}>
      <CampaignLayoutInner slug={slug}>{children}</CampaignLayoutInner>
    </CampaignDetailProvider>
  );
}

function CampaignLayoutInner({ slug, children }: { slug: string; children: React.ReactNode }) {
  const router = useRouter();
  const { campaignName, campaignIcon, campaignStatus, productName, loading, error } =
    useCampaignDetailHeader();

  const navItems = [
    { label: 'Overview', href: `/campaigns/${slug}` },
    { label: 'Companies', href: `/campaigns/${slug}/companies` },
    { label: 'Partners', href: `/campaigns/${slug}/partners` },
    { label: 'Settings', href: `/campaigns/${slug}/settings` },
  ];

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-lg font-semibold text-foreground">{error}</p>
        <Button
          onClick={() => router.push('/campaigns')}
          size="lg"
          className="h-10 px-6 rounded-lg"
        >
          Go Home
        </Button>
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
