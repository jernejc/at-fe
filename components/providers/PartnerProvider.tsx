"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { getPartner } from "@/lib/api/partners";
import { PartnerRead } from "@/lib/schemas/partner";

interface PartnerContextValue {
  partner: PartnerRead | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const PartnerContext = createContext<PartnerContextValue | null>(null);

export function PartnerProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [partner, setPartner] = useState<PartnerRead | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const partnerId = (session?.user as any)?.partner_id;

  const fetchPartner = useCallback(async () => {
    if (!partnerId) {
      setPartner(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getPartner(partnerId);
      setPartner(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch partner"));
      setPartner(null);
    } finally {
      setIsLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    if (status !== "loading") {
      fetchPartner();
    }
  }, [status, fetchPartner]);

  return (
    <PartnerContext.Provider value={{ partner, isLoading, error, refetch: fetchPartner }}>
      {children}
    </PartnerContext.Provider>
  );
}

export function usePartner() {
  const context = useContext(PartnerContext);
  if (!context) {
    throw new Error("usePartner must be used within a PartnerProvider");
  }
  return context;
}
