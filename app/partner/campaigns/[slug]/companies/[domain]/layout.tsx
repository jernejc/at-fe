'use client';

import { use } from 'react';
import { CompanyDetailHeader } from '@/components/campaigns/CompanyDetailHeader';
import { SecondaryNav } from '@/components/ui/secondary-nav';
import { Separator } from '@/components/ui/separator';
import { useCampaignDetailHeader } from '@/hooks/useCampaignDetailHeader';
import { useCompanyDetailHeader } from '@/hooks/useCompanyDetailHeader';

interface CompanyDetailLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string; domain: string }>;
}

/** Layout for company detail sub-routes with company header and secondary nav. */
export default function CompanyDetailLayout({ children, params }: CompanyDetailLayoutProps) {
  const { slug, domain } = use(params);
  const decodedDomain = decodeURIComponent(domain);

  return (
    <CompanyDetailLayoutInner slug={slug} domain={decodedDomain} encodedDomain={domain}>
      {children}
    </CompanyDetailLayoutInner>
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
  const { companyName, companyLogoUrl, loading } = useCompanyDetailHeader(domain);

  const basePath = `/partner/campaigns/${slug}/companies/${encodedDomain}`;
  const navItems = [
    { label: 'Overview', href: basePath },
    { label: 'Product Fit', href: `${basePath}/product-fit` },
    { label: 'Playbook', href: `${basePath}/playbook` },
  ];

  return (
    <>
      <div className="relative z-2">
        <CompanyDetailHeader
          slug={slug}
          campaignIcon={campaignIcon}
          companyName={companyName}
          companyLogoUrl={companyLogoUrl}
          loading={loading}
        />
      </div>
      <div className="sticky top-24 h-6 px-4 text-xs font-semibold flex gap-2 items-end z-1 bg-background -mt-6 min-w-0">
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
