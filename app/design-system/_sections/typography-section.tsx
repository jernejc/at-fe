import { Separator } from '@/components/ui/separator';

const sizes = [
  { class: 'text-4xl', label: '4xl', px: '36px' },
  { class: 'text-3xl', label: '3xl', px: '30px' },
  { class: 'text-2xl', label: '2xl', px: '24px' },
  { class: 'text-xl', label: 'xl', px: '20px' },
  { class: 'text-lg', label: 'lg', px: '18px' },
  { class: 'text-base', label: 'base', px: '16px' },
  { class: 'text-sm', label: 'sm', px: '14px' },
  { class: 'text-xs', label: 'xs', px: '12px' },
];

const weights = [
  { class: 'font-normal', label: 'Normal (400)' },
  { class: 'font-medium', label: 'Medium (500)' },
  { class: 'font-semibold', label: 'Semibold (600)' },
  { class: 'font-bold', label: 'Bold (700)' },
];

/** Typography scale and font family showcase. */
export function TypographySection() {
  return (
    <section id="typography" className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Typography</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Font families, size scale, and weight variations.
        </p>
      </div>

      {/* Font Families */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Font Families
        </h3>
        <div className="grid gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Sans — Inter (--font-sans)
            </p>
            <p className="font-sans text-2xl">
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Display — Exo 2 (--font-display)
            </p>
            <p className="font-display text-2xl font-medium">
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Size Scale */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Size Scale
        </h3>
        <div className="space-y-3">
          {sizes.map((s) => (
            <div key={s.label} className="flex items-baseline gap-4">
              <span className="w-20 shrink-0 text-xs text-muted-foreground tabular-nums">
                {s.label} / {s.px}
              </span>
              <span className={`${s.class} text-foreground truncate`}>
                Account Intelligence Platform
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Weights */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Font Weights
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {weights.map((w) => (
            <div key={w.label} className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-2">{w.label}</p>
              <p className={`text-lg ${w.class} text-foreground`}>Aa</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
