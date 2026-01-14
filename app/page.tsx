"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/ui/Header";
import { CampaignsList } from "@/components/campaigns/CampaignsList";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/signin");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return null;
  }

  if (!session) {
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
