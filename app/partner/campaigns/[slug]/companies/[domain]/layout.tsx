'use client';

import { use } from 'react';
import { CompanyDetailHeader } from '@/components/campaigns/CompanyDetailHeader';
import { SecondaryNav } from '@/components/ui/secondary-nav';
import { Separator } from '@/components/ui/separator';
import { useCampaignDetailHeader } from '@/hooks/useCampaignDetailHeader';
import {
  CampaignCompanyDetailProvider,
  useCampaignCompanyDetail,
} from '@/components/providers/CampaignCompanyDetailProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CompanyDetailLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string; domain: string }>;
}

/** Layout for company detail sub-routes with company header and secondary nav. */
export default function CompanyDetailLayout({ children, params }: CompanyDetailLayoutProps) {
  const { slug, domain } = use(params);
  const decodedDomain = decodeURIComponent(domain);

  return (
    <CampaignCompanyDetailProvider slug={slug} domain={decodedDomain}>
      <CompanyDetailLayoutInner slug={slug} domain={decodedDomain} encodedDomain={domain}>
        {children}
      </CompanyDetailLayoutInner>
    </CampaignCompanyDetailProvider>
  );
}

function CompanyDetailLayoutInner({
  slug,
  domain,
  encodedDomain,
  children,
}: {
  slug: string;
  domain: string;
  encodedDomain: string;
  children: React.ReactNode;
}) {
  const { campaignIcon } = useCampaignDetailHeader();
  const { company, membership, loading } = useCampaignCompanyDetail();

  const companyName = company?.name ?? null;
  const companyLogoUrl = company?.logo_base64
    ? company.logo_base64.startsWith('data:')
      ? company.logo_base64
      : `data:image/png;base64,${company.logo_base64}`
    : company?.logo_url ?? null;

  const basePath = `/partner/campaigns/${slug}/companies/${encodedDomain}`;
  const navItems = [
    { label: 'Overview', href: basePath },
    { label: 'Product Fit', href: `${basePath}/product-fit` },
    { label: 'Playbook', href: `${basePath}/playbook` },
  ];

  return (
    <>
      <div className="relative z-3">
        <CompanyDetailHeader
          slug={slug}
          campaignIcon={campaignIcon}
          companyName={companyName}
          companyLogoUrl={companyLogoUrl}
          loading={loading}
          companyId={membership?.company_id ?? null}
        />
      </div>
      <div className="sticky top-24 h-6 px-4 text-xs font-semibold flex gap-2 items-end z-2 bg-background -mt-6">
        <Avatar className="size-4 rounded">
          {companyLogoUrl && <AvatarImage src={companyLogoUrl} alt={company?.name} className="rounded" />}
          <AvatarFallback className="rounded text-[8px]">
            {company?.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="truncate">{companyName ?? domain}</span>
      </div>
      <div className="sticky top-30 z-10 bg-background">
        <SecondaryNav items={navItems} className="px-4" />
        <Separator />
      </div>
      <div className="max-w-[1600px] mx-auto px-10 py-10">
        {children}
      </div>
    </>
  );
}
