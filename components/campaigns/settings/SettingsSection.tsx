import type { ReactNode } from 'react';

interface SettingsSectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

/** Row layout for a settings field: label + description on the left, control on the right. */
export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="md:flex items-center gap-8 py-10">
      <div className="md:w-2/5 shrink-0">
        <p className="text-lg font-medium text-foreground">{title}</p>
        <p className="text-base text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="flex items-center py-2">{children}</div>
    </div>
  );
}
