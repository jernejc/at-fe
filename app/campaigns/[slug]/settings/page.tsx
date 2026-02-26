'use client';

import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useCampaignSettings } from '@/hooks/useCampaignSettings';
import { NameSection } from '@/components/campaigns/settings/NameSection';
import { IconSection } from '@/components/campaigns/settings/IconSection';
import { StatusSection } from '@/components/campaigns/settings/StatusSection';
import { DangerZoneSection } from '@/components/campaigns/settings/DangerZoneSection';

/** Campaign settings page — name, icon, status, and danger zone. */
export default function CampaignSettingsPage() {
  const {
    name,
    icon,
    status,
    loading,
    isSavingName,
    isSavingIcon,
    isDeleting,
    handleNameSave,
    handleIconSave,
    handleDelete,
  } = useCampaignSettings();

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div>
      <div className='pb-12 pt-2'>
        <h2 className="text-2xl font-semibold text-foreground">Basic settings</h2>
      </div>
      <Separator />

      <NameSection name={name} isSaving={isSavingName} onSave={handleNameSave} />
      <Separator />

      <IconSection icon={icon} isSaving={isSavingIcon} onSave={handleIconSave} />
      <Separator />

      <StatusSection status={status} />
      <Separator />

      <div className='py-12'>
        <h2 className="text-2xl font-semibold text-destructive">Danger zone</h2>
      </div>
      <Separator />

      <DangerZoneSection
        campaignName={name}
        isDeleting={isDeleting}
        onDelete={handleDelete}
      />
      <Separator />
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div>
      <div className="pb-12 pt-2">
        <Skeleton className="h-8 w-48" />
      </div>
      <Separator />

      {/* Name row */}
      <div className="md:flex items-center gap-8 py-10">
        <div className="md:w-2/5 shrink-0 space-y-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-60" />
      </div>
      <Separator />

      {/* Icon row */}
      <div className="md:flex items-center gap-8 py-10">
        <div className="md:w-2/5 shrink-0 space-y-2">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
      <Separator />

      {/* Status row */}
      <div className="md:flex items-center gap-8 py-10">
        <div className="md:w-2/5 shrink-0 space-y-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <Separator />

      <div className="py-12">
        <Skeleton className="h-8 w-44" />
      </div>
      <Separator />

      {/* Delete row */}
      <div className="md:flex items-center gap-8 py-10">
        <div className="md:w-2/5 shrink-0 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-20" />
      </div>
      <Separator />
    </div>
  );
}
