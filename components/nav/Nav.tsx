"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useNavRoutes } from "./useNavRoutes";
import { NavNotifications } from "./NavNotifications";
import { NavUserMenu } from "./NavUserMenu";
import { usePartner } from "@/components/providers/PartnerProvider";
import { NavSkeleton } from "./NavSkeleton";

/** Global navigation bar rendered once in the root layout. */
export function Nav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { routes, activeHref } = useNavRoutes();
  const { partner } = usePartner();

  if (pathname.startsWith("/signin")) return null;
  if (status === "loading") return <NavSkeleton />;
  if (!session?.user) return null;

  return (
    <nav
      className="bg-background h-24 shrink-0 z-20 sticky top-0 border-b-[0.5px] border-border-d"
    >
      {/* Row 1: Logo + Actions */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo.svg"
            alt="LookAcross"
            width={20}
            height={20}
            className="dark:invert"
          />
          <span className="font-display text-[18px] font-medium text-foreground">
            LookAcross
          </span>
          {partner && (
            <div className="flex items-center" style={{ gap: 15, marginLeft: 7 }}>
              <svg width="8" height="20" viewBox="0 0 8 20" fill="none">
                <line x1="0" y1="0" x2="8" y2="20" stroke="currentColor" strokeWidth="1" />
              </svg>
              <div
                className="flex items-center justify-center overflow-hidden shrink-0"
                style={{ width: 20, height: 20, borderRadius: 5 }}
              >
                {partner.logo_url ? (
                  <Image src={partner.logo_url} alt={partner.name} width={20} height={20} unoptimized className="h-full w-full object-contain" />
                ) : null}
              </div>
            </div>
          )}
        </Link>

        <div className="flex items-center gap-3">
          <NavNotifications />
          <NavUserMenu />
        </div>
      </div>

      {/* Row 2: Route Tabs */}
      <div className="px-5 overflow-x-auto scrollbar-hide">
        <div className="flex items-end" style={{ gap: 30 }}>
          {routes.map((route) => {
            const isActive = route.href === activeHref;
            return (
              <Link
                key={route.href}
                href={route.href}
                className={`pb-2.5 text-[14px] font-medium whitespace-nowrap transition-colors ${isActive
                  ? "text-foreground border-b-[3px] border-foreground"
                  : "text-muted-foreground hover:text-foreground/80 border-b-[3px] border-transparent"
                  }`}
              >
                {route.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
