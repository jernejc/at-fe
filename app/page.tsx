'use client';

import { useState, useEffect } from 'react';
import { AccountList, AccountDetail } from '@/components/accounts';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Unified account type for display (matches AccountList)
interface AccountItem {
  company_id: number;
  company_domain: string;
  company_name: string;
  industry: string | null;
  employee_count: number | null;
  hq_country: string | null;
  logo_url: string | null;
  combined_score: number | null;
  urgency_score: number | null;
  top_drivers: string[] | null;
  calculated_at: string | null;
  top_contact: {
    full_name: string;
    current_title: string | null;
    avatar_url: string | null;
  } | null;
}

export default function Dashboard() {
  const [selectedAccount, setSelectedAccount] = useState<AccountItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleAccountClick = (account: AccountItem) => {
    setSelectedAccount(account);
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
      {selectedAccount && (
        <AccountDetail
          domain={selectedAccount.company_domain}
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </div>
  );
}
