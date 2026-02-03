"use client";

import { useSession } from "next-auth/react";
import { Header } from "@/components/ui/Header";
import { CampaignsList } from "@/components/campaigns/CampaignsList";

export default function Dashboard() {
  const { data: session, status } = useSession();

  // Show nothing while loading or if user shouldn't be here (middleware handles redirects)
  if (status === "loading" || !session || session.user?.role === 'partner') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      <Header />
      <main className="flex flex-1 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto px-6 py-8 flex flex-1">
          <CampaignsList />
        </div>
      </main>
    </div>
  );
}
