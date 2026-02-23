import { Badge } from '@/components/ui/badge';
import { Circle, Zap } from 'lucide-react';

const variants = [
  'default',
  'secondary',
  'destructive',
  'outline',
  'ghost',
  'link',
] as const;

/** Badge variants showcase. */
export function BadgeSection() {
  return (
    <section id="badges" className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Badge</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Inline status and label indicators.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Variants
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          {variants.map((v) => (
            <Badge key={v} variant={v}>
              {v}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          With Icons
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Badge>
            <Circle data-icon="inline-start" />
            Status
          </Badge>
          <Badge variant="outline">
            <Zap data-icon="inline-start" />
            Signal
          </Badge>
        </div>
      </div>
    </section>
  );
}
