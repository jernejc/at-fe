"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export interface NavRoute {
  label: string;
  href: string;
}

const pdmRoutes: NavRoute[] = [
  { label: "Campaigns", href: "/" },
  { label: "Partners", href: "/partner-portal" },
  { label: "Discovery", href: "/discovery" },
];

const partnerRoutes: NavRoute[] = [
  { label: "Campaigns", href: "/partner" },
];

/** Returns route tabs and active route based on user role and current pathname. */
export function useNavRoutes(): { routes: NavRoute[]; activeHref: string } {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isPartner = session?.user?.role === "partner";
  const routes = isPartner ? partnerRoutes : pdmRoutes;

  let activeHref = "";
  if (isPartner) {
    activeHref = "/partner";
  } else if (pathname === "/" || pathname.startsWith("/campaigns")) {
    activeHref = "/";
  } else if (pathname.startsWith("/partner-portal")) {
    activeHref = "/partner-portal";
  } else if (pathname.startsWith("/discovery")) {
    activeHref = "/discovery";
  }

  return { routes, activeHref };
}
