'use client';

import { RangeFilter } from '@/components/ui/range-filter';

const sampleFitScores = [
  42, 45, 45, 48, 50, 50, 50, 52, 55, 55, 58, 60, 60, 60, 60,
  62, 65, 65, 65, 68, 68, 70, 70, 70, 72, 72, 75, 75, 78, 80,
  80, 82, 85, 88, 90,
];

const sampleEmployeeCounts: Record<number, number> = {
  100: 3, 200: 8, 300: 12, 400: 15, 500: 10, 600: 7, 700: 4, 800: 2,
};

/** Showcase section for the RangeFilter component. */
export function RangeFilterSection() {
  return (
    <section id="range-filter" className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Range Filter
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Histogram bar chart with dual-thumb range slider for filtering numeric values.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Array input variant */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            From Array (fit scores)
          </h3>
          <RangeFilter
            title="Avg. fit"
            values={sampleFitScores}
            onChange={(range) => console.log('fit range:', range)}
          />
        </div>

        {/* Record input variant */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            From Record (employee counts)
          </h3>
          <RangeFilter
            title="Employees"
            values={sampleEmployeeCounts}
            onChange={(range) => console.log('employee range:', range)}
          />
        </div>
      </div>
    </section>
  );
}
