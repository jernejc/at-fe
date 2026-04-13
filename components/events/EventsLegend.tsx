import { Loader2 } from 'lucide-react';

export interface LayerToggle {
  id: string;
  color: string;
  label: string;
  count: number;
  inView?: number;
  active: boolean;
  onToggle: () => void;
}

interface EventsLegendProps {
  layers: LayerToggle[];
  companiesCount: number;
  companiesLoading: boolean;
  loadedCompanies: number;
  totalCompanies: number;
}

/** Pill-style layer toggles with active/inactive visual states and in-view counts. */
export function EventsLegend({
  layers,
  companiesCount,
  companiesLoading,
  loadedCompanies,
  totalCompanies,
}: EventsLegendProps) {
  return (
    <div className="flex items-center gap-2 text-xs flex-wrap">
      <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-foreground">
        <span className="inline-block size-2 rounded-full bg-[var(--accent-yellow)]" />
        {companiesLoading ? (
          <span className="inline-flex items-center gap-1">
            <Loader2 className="size-3 animate-spin" />
            {loadedCompanies}/{totalCompanies || '…'}
          </span>
        ) : (
          <span>{companiesCount} companies</span>
        )}
      </div>

      {layers.map((layer) => (
        <button
          key={layer.id}
          type="button"
          onClick={layer.onToggle}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 transition-all ${
            layer.active
              ? 'bg-muted/50 text-foreground border-border'
              : 'bg-transparent text-muted-foreground/50 border-dashed border-border/50 hover:text-muted-foreground hover:border-border'
          }`}
        >
          <span
            className={`inline-block size-2 rounded-full transition-opacity ${layer.active ? '' : 'opacity-40'}`}
            style={{ backgroundColor: layer.color }}
          />
          <span>
            {layer.inView != null && layer.active
              ? `${layer.inView} of ${layer.count}`
              : layer.count}
          </span>
          <span>{layer.label}</span>
        </button>
      ))}
    </div>
  );
}
