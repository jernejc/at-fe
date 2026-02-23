"use client";

import { PartnerSideNav } from "@/components/partner/PartnerSideNav";

export default function PartnerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      <PartnerSideNav
        mobileOpen={false}
        onMobileClose={() => {}}
      />
      <main className="flex flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
