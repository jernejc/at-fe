'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { SettingsSection } from './SettingsSection';

interface NameSectionProps {
  name: string;
  isSaving: boolean;
  onSave: (name: string) => Promise<void>;
}

/** Editable campaign name field that saves on Enter or blur. */
export function NameSection({ name, isSaving, onSave }: NameSectionProps) {
  const [value, setValue] = useState(name);
  const [prevName, setPrevName] = useState(name);

  if (name !== prevName) {
    setPrevName(name);
    setValue(name);
  }

  const save = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === name) return;
    await onSave(trimmed);
  }, [value, name, onSave]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <SettingsSection title="Name" description="Give your campaign a unique name">
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          className="w-60"
        />
        {isSaving && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>
    </SettingsSection>
  );
}
