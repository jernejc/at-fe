'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCampaignDetail } from '@/components/providers/CampaignDetailProvider';
import { updateCampaign, deleteCampaign } from '@/lib/api';

interface UseCampaignSettingsReturn {
  /** Current campaign slug. */
  slug: string | null;
  /** Current campaign name. */
  name: string;
  /** Current campaign icon name. */
  icon: string | null;
  /** Current campaign status. */
  status: string;
  /** Whether campaign data is still loading. */
  loading: boolean;
  /** Saving-state flags. */
  isSavingName: boolean;
  isSavingIcon: boolean;
  isDeleting: boolean;
  /** Persist a new campaign name. */
  handleNameSave: (name: string) => Promise<void>;
  /** Persist a new campaign icon. */
  handleIconSave: (icon: string) => Promise<void>;
  /** Delete the campaign and navigate away. */
  handleDelete: () => Promise<void>;
}

/** Encapsulates all state and handlers for the campaign settings page. */
export function useCampaignSettings(): UseCampaignSettingsReturn {
  const router = useRouter();
  const { campaign, loading, setCampaign } = useCampaignDetail();

  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingIcon, setIsSavingIcon] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const slug = campaign?.slug ?? null;

  const handleNameSave = useCallback(async (name: string) => {
    if (!slug) return;
    setIsSavingName(true);
    try {
      const updated = await updateCampaign(slug, { name });
      setCampaign(updated);
      toast.success('Campaign name updated');
    } catch (err) {
      toast.error('Failed to update name', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    } finally {
      setIsSavingName(false);
    }
  }, [slug, setCampaign]);

  const handleIconSave = useCallback(async (icon: string) => {
    if (!slug) return;
    setIsSavingIcon(true);
    try {
      const updated = await updateCampaign(slug, { icon });
      setCampaign(updated);
      toast.success('Campaign icon updated');
    } catch (err) {
      toast.error('Failed to update icon', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    } finally {
      setIsSavingIcon(false);
    }
  }, [slug, setCampaign]);

  const handleDelete = useCallback(async () => {
    if (!slug) return;
    setIsDeleting(true);
    try {
      await deleteCampaign(slug);
      toast.success('Campaign deleted');
      router.push('/campaigns');
    } catch (err) {
      toast.error('Failed to delete campaign', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
      setIsDeleting(false);
    }
  }, [slug, router]);

  return {
    slug,
    name: campaign?.name ?? '',
    icon: campaign?.icon ?? null,
    status: campaign?.status ?? 'draft',
    loading,
    isSavingName,
    isSavingIcon,
    isDeleting,
    handleNameSave,
    handleIconSave,
    handleDelete,
  };
}
