"use client";

import { useState } from "react";
import { Header } from "@/components/ui/Header";
import { PartnerSideNav } from "@/components/partner/PartnerSideNav";

export default function PartnerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden font-sans">
      <Header
        showMenuButton={true}
        onMenuClick={() => setMobileMenuOpen(true)}
      />
      <div className="flex-1 flex overflow-hidden">
        <PartnerSideNav
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
