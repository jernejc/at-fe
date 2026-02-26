'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getCampaign, getCampaignOverview, publishCampaign, unpublishCampaign } from '@/lib/api';
import type { CampaignRead, CampaignOverview } from '@/lib/schemas';
import { toast } from 'sonner';

interface CampaignDetailContextValue {
  campaign: CampaignRead | null;
  overview: CampaignOverview | null;
  loading: boolean;
  error: string | null;
  isPublishing: boolean;
  isUnpublishing: boolean;
  handlePublish: () => Promise<void>;
  handleUnpublish: () => Promise<void>;
  /** Update campaign state in-place without a full refetch (avoids skeleton flash). */
  setCampaign: React.Dispatch<React.SetStateAction<CampaignRead | null>>;
  refreshData: () => Promise<void>;
}

const CampaignDetailContext = createContext<CampaignDetailContextValue | null>(null);

interface CampaignDetailProviderProps {
  slug: string;
  children: ReactNode;
}

/** Fetches campaign + overview once and shares with all child pages via context. */
export function CampaignDetailProvider({ slug, children }: CampaignDetailProviderProps) {
  const [campaign, setCampaign] = useState<CampaignRead | null>(null);
  const [overview, setOverview] = useState<CampaignOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [campaignData, overviewData] = await Promise.all([
        getCampaign(slug),
        getCampaignOverview(slug),
      ]);
      setCampaign(campaignData);
      setOverview(overviewData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaign');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePublish = useCallback(async () => {
    setIsPublishing(true);
    try {
      const updated = await publishCampaign(slug);
      setCampaign(updated);
      toast.success('Campaign published', {
        description: 'Notifications have been sent to partners.',
      });
    } catch (err) {
      toast.error('Failed to publish campaign', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    } finally {
      setIsPublishing(false);
    }
  }, [slug]);

  const handleUnpublish = useCallback(async () => {
    setIsUnpublishing(true);
    try {
      const updated = await unpublishCampaign(slug);
      setCampaign(updated);
      toast.success('Campaign unpublished', {
        description: 'Campaign is now in draft mode.',
      });
    } catch (err) {
      toast.error('Failed to unpublish campaign', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    } finally {
      setIsUnpublishing(false);
    }
  }, [slug]);

  return (
    <CampaignDetailContext.Provider
      value={{
        campaign,
        overview,
        loading,
        error,
        isPublishing,
        isUnpublishing,
        handlePublish,
        handleUnpublish,
        setCampaign,
        refreshData: fetchData,
      }}
    >
      {children}
    </CampaignDetailContext.Provider>
  );
}

/** Access campaign detail data from the nearest CampaignDetailProvider. */
export function useCampaignDetail() {
  const context = useContext(CampaignDetailContext);
  if (!context) {
    throw new Error('useCampaignDetail must be used within a CampaignDetailProvider');
  }
  return context;
}
