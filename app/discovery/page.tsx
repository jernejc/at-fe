'use client';

import { useState } from 'react';
import { AccountList, AccountDetail } from '@/components/accounts';
import { useSession } from 'next-auth/react';

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

export default function DiscoveryPage() {
  const [selectedAccount, setSelectedAccount] = useState<AccountItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { data: session, status } = useSession();

  const handleAccountClick = (account: AccountItem) => {
    setSelectedAccount(account);
    setDetailOpen(true);
  };

  // Show nothing while loading or if not authenticated (middleware handles redirects)
  if (status === "loading" || !session) {
    return null;
  }

  return (
    <div className="h-[100dvh] bg-background overflow-hidden">
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
