'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface DiscoveryDetailHeaderProps {
  companyName: string | null;
  logoSrc?: string;
  domain: string | null;
  industry: string | null;
  loading?: boolean;
}

/** Discovery detail page header with back button, company logo, name, and industry label. */
export function DiscoveryDetailHeader({
  companyName,
  logoSrc,
  domain,
  industry,
  loading = false,
}: DiscoveryDetailHeaderProps) {
  if (loading) {
    return <DiscoveryDetailHeaderSkeleton />;
  }

  return (
    <div className="bg-background">
      <div className="max-w-[1600px] mx-auto px-10 pt-7 pb-4">
        <div className="flex items-center -ml-10">
          {/* Back button */}
          <Link href="/discovery" className="shrink-0 mx-1">
            <Button variant="ghost" size="icon-sm" aria-label="Back to discovery">
              <ChevronLeft className="size-5" />
            </Button>
          </Link>

          {/* Company logo */}
          <Avatar className="size-16 rounded-xl mr-4 shrink-0 bg-card">
            {logoSrc && <AvatarImage src={logoSrc} alt={companyName ?? undefined} className="rounded-xl" />}
            <AvatarFallback className="rounded-xl text-xl font-semibold">
              {companyName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Text content */}
          <div className="min-w-0 flex-1">
            {/* Label row */}
            <div className="flex items-center gap-4">
              <span className="text-sm uppercase text-muted-foreground">
                Company
              </span>
              {industry && (
                <span className="text-sm text-muted-foreground truncate">
                  {industry}
                </span>
              )}
            </div>

            {/* Company name */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-semibold tracking-tight text-foreground">
              {companyName ?? domain ?? 'Unknown Company'}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton placeholder while company data loads. */
function DiscoveryDetailHeaderSkeleton() {
  return (
    <div className="bg-background">
      <div className="max-w-[1600px] mx-auto px-10 pt-7 pb-4">
        <div className="flex items-center -ml-10 mb-1">
          {/* Back button */}
          <Link href="/discovery" className="shrink-0 mx-1">
            <Button variant="ghost" size="icon-sm" aria-label="Back to discovery">
              <ChevronLeft className="size-5" />
            </Button>
          </Link>

          {/* Logo placeholder */}
          <div className="size-16 rounded-xl bg-muted animate-pulse mr-4 shrink-0" />

          {/* Text content placeholder */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-4">
              <div className="w-20 h-4 bg-muted rounded animate-pulse" />
              <div className="w-36 h-4 bg-muted rounded animate-pulse" />
            </div>
            <div className="w-96 h-10 bg-muted rounded animate-pulse mt-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
