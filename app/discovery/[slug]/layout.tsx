'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SecondaryNav } from '@/components/ui/secondary-nav';
import { DiscoveryDetailProvider, useDiscoveryDetail } from '@/components/providers/DiscoveryDetailProvider';
import { DiscoveryDetailHeader } from '@/components/discovery/DiscoveryDetailHeader';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface DiscoveryDetailLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default function DiscoveryDetailLayout({ children, params }: DiscoveryDetailLayoutProps) {
  const { slug } = use(params);

  return (
    <DiscoveryDetailProvider domain={slug}>
      <DiscoveryDetailLayoutInner slug={slug}>{children}</DiscoveryDetailLayoutInner>
    </DiscoveryDetailProvider>
  );
}

function DiscoveryDetailLayoutInner({ slug, children }: { slug: string; children: React.ReactNode }) {
  const router = useRouter();
  const { data, loading, error } = useDiscoveryDetail();

  const navItems = [
    { label: 'Overview', href: `/discovery/${slug}` },
    { label: 'Product fits', href: `/discovery/${slug}/products` },
    { label: 'Interests', href: `/discovery/${slug}/interests` },
    { label: 'Events', href: `/discovery/${slug}/events` },
    { label: 'Playbooks', href: `/discovery/${slug}/playbooks` },
    // { label: 'People', href: `/discovery/${slug}/people` },
    // { label: 'Jobs', href: `/discovery/${slug}/jobs` },
  ];

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-lg font-semibold text-foreground">{error}</p>
        <Button onClick={() => router.push('/discovery')} size="lg" className="h-10 px-6 rounded-lg">
          Back to Discovery
        </Button>
      </div>
    );
  }

  const company = data?.company;
  const logoSrc = company?.logo_base64
    ? `data:image/png;base64,${company.logo_base64}`
    : company?.logo_url ?? undefined;

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="flex-1">
        <div className="relative z-2">
          <DiscoveryDetailHeader
            companyName={company?.name ?? null}
            logoSrc={logoSrc}
            domain={company?.domain ?? slug}
            industry={company?.industry ?? null}
            loading={loading}
          />
        </div>
        <div className="sticky top-24 h-6 px-4 text-xs font-semibold flex gap-2 items-end z-1 bg-background -mt-6">
          <Avatar className="size-4 rounded">
            {logoSrc && <AvatarImage src={logoSrc} alt={company?.name} className="rounded" />}
            <AvatarFallback className="rounded text-[8px]">
              {company?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {company?.name ?? slug}
        </div>
        <div className="sticky top-30 z-10 bg-background">
          <SecondaryNav items={navItems} className="px-4" />
          <Separator />
        </div>
        <div className="max-w-[1600px] mx-auto px-10 py-10">
          {children}
        </div>
      </div>
    </div>
  );
}
