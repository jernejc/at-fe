'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface SecondaryNavItem {
  label: string;
  href: string;
}

interface SecondaryNavProps {
  items: SecondaryNavItem[];
  className?: string;
}

/** Reusable horizontal sub-route navigation with active state detection. */
export function SecondaryNav({ items, className }: SecondaryNavProps) {
  const pathname = usePathname();

  // The first item is treated as the "base" route (e.g. /campaigns/[slug]).
  // It only matches on exact pathname to avoid false positives with sub-routes.
  const baseHref = items[0]?.href;

  return (
    <div className={cn('w-full overflow-x-auto scrollbar-hide', className)}>
      <nav className="max-w-[1600px] mx-auto">
        <div className="flex items-center gap-1 py-2">
          {items.map((item) => {
            const isActive =
              item.href === baseHref
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'shrink-0 px-3 py-1.5 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-muted text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
