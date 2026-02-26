const coreTokens = [
  { name: 'background', tw: 'bg-background' },
  { name: 'foreground', tw: 'bg-foreground' },
  { name: 'card', tw: 'bg-card' },
  { name: 'card-foreground', tw: 'bg-card-foreground' },
  { name: 'primary', tw: 'bg-primary' },
  { name: 'primary-foreground', tw: 'bg-primary-foreground' },
  { name: 'secondary', tw: 'bg-secondary' },
  { name: 'secondary-foreground', tw: 'bg-secondary-foreground' },
  { name: 'muted', tw: 'bg-muted' },
  { name: 'muted-foreground', tw: 'bg-muted-foreground' },
  { name: 'accent', tw: 'bg-accent' },
  { name: 'accent-foreground', tw: 'bg-accent-foreground' },
  { name: 'destructive', tw: 'bg-destructive' },
  { name: 'border', tw: 'bg-border' },
  { name: 'input', tw: 'bg-input' },
  { name: 'ring', tw: 'bg-ring' },
];

const chartTokens = [
  { name: 'chart-1', tw: 'bg-chart-1' },
  { name: 'chart-2', tw: 'bg-chart-2' },
  { name: 'chart-3', tw: 'bg-chart-3' },
  { name: 'chart-4', tw: 'bg-chart-4' },
  { name: 'chart-5', tw: 'bg-chart-5' },
];

const scoreTokens = [
  { name: 'score-hot', tw: 'bg-score-hot' },
  { name: 'score-hot-bg', tw: 'bg-score-hot-bg' },
  { name: 'score-warm', tw: 'bg-score-warm' },
  { name: 'score-warm-bg', tw: 'bg-score-warm-bg' },
  { name: 'score-cold', tw: 'bg-score-cold' },
  { name: 'score-cold-bg', tw: 'bg-score-cold-bg' },
];

const accentGreenTokens = [
  { name: 'accent-green', tw: 'bg-accent-green' },
  { name: 'accent-green-dark', tw: 'bg-accent-green-dark' },
  { name: 'accent-yellow', tw: 'bg-accent-yellow' },
  { name: 'accent-dark-red', tw: 'bg-accent-dark-red' },
];

function Swatch({ name, tw }: { name: string; tw: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`size-10 shrink-0 rounded-md border border-border ${tw}`}
      />
      <div>
        <p className="text-sm font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{tw}</p>
      </div>
    </div>
  );
}

/** Semantic color token swatches. */
export function ColorSection() {
  return (
    <section id="colors" className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Colors</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Semantic color tokens. Swatches reflect the active theme.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Core
          </h3>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {coreTokens.map((t) => (
              <Swatch key={t.name} {...t} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Charts
          </h3>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {chartTokens.map((t) => (
              <Swatch key={t.name} {...t} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Score
          </h3>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
            {scoreTokens.map((t) => (
              <Swatch key={t.name} {...t} />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Accent Colors
          </h3>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
            {accentGreenTokens.map((t) => (
              <Swatch key={t.name} {...t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
