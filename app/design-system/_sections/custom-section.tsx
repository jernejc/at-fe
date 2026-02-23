import { FitScoreIndicator } from '@/components/ui/fit-score-indicator';
import { TrendIndicator } from '@/components/ui/trend-indicator';
import { Separator } from '@/components/ui/separator';

const fitScoreSamples = [
  { score: 0, label: 'No data' },
  { score: 30, change: 2, label: 'Low' },
  { score: 60, change: -4, label: 'Moderate' },
  { score: 80, label: 'High' },
  { score: 95, change: 5, label: 'Very high' },
];

/** Custom project components: FitScoreIndicator and TrendIndicator. */
export function CustomSection() {
  return (
    <section id="custom" className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Custom Components
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Project-specific UI primitives.
        </p>
      </div>

      {/* Fit Score Indicator */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          FitScoreIndicator
        </h3>
        <div className="space-y-4">
          {fitScoreSamples.map((s) => (
            <div key={s.score} className="flex items-center gap-4">
              <span className="w-20 text-xs text-muted-foreground">
                {s.label}
              </span>
              <FitScoreIndicator score={s.score} change={s.change} />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 pt-2">
          <span className="w-20 text-xs text-muted-foreground">
            Large (32px)
          </span>
          <FitScoreIndicator score={75} change={3} size={32} />
        </div>
      </div>

      <Separator />

      {/* Trend Indicator */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          TrendIndicator
        </h3>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Positive:</span>
            <TrendIndicator change={5} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Negative:</span>
            <TrendIndicator change={-3} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Large:</span>
            <TrendIndicator change={12} />
          </div>
        </div>
      </div>
    </section>
  );
}
