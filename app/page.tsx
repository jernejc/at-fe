'use client';

import { useState, useEffect } from 'react';
import { AccountList, AccountDetail } from '@/components/accounts';
import type { CompanySummary } from '@/lib/schemas';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [selectedCompany, setSelectedCompany] = useState<CompanySummary | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleAccountClick = (company: CompanySummary) => {
    setSelectedCompany(company);
    setDetailOpen(true);
  };

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
    <div className="h-screen bg-background overflow-hidden">
      {/* Main Content - Full Height */}
      <main className="h-full">
        <AccountList
          productGroup="all"
          onAccountClick={handleAccountClick}
        />
      </main>

      {/* Account Detail Dialog */}
      {selectedCompany && (
        <AccountDetail
          domain={selectedCompany.domain}
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </div>
  );
}
