'use client';

import { Input } from '@/components/ui/input';

interface CampaignNameInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
}

/** Centered campaign name text input. */
export function CampaignNameInput({ value, onChange, onSubmit }: CampaignNameInputProps) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && value.trim()) onSubmit?.();
      }}
      placeholder="Campaign name"
      className="text-center text-lg max-w-sm"
      autoFocus
    />
  );
}
