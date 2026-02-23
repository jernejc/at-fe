import { Button } from '@/components/ui/button';
import { Mail, Plus, Trash2 } from 'lucide-react';

const variants = [
  'default',
  'outline',
  'secondary',
  'ghost',
  'destructive',
  'link',
] as const;

const sizes = ['xs', 'sm', 'default', 'lg'] as const;

/** Button variants and sizes showcase. */
export function ButtonSection() {
  return (
    <section id="buttons" className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Button</h2>
        <p className="text-sm text-muted-foreground mt-1">
          All variant and size combinations.
        </p>
      </div>

      {/* Variants */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Variants
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          {variants.map((v) => (
            <Button key={v} variant={v}>
              {v}
            </Button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Sizes
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          {sizes.map((s) => (
            <Button key={s} size={s}>
              {s}
            </Button>
          ))}
        </div>
      </div>

      {/* With Icons */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          With Icons
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <Plus data-icon="inline-start" />
            Create
          </Button>
          <Button variant="outline">
            <Mail data-icon="inline-start" />
            Send Email
          </Button>
          <Button variant="destructive">
            <Trash2 data-icon="inline-start" />
            Delete
          </Button>
          <Button variant="ghost" size="icon">
            <Plus />
          </Button>
          <Button variant="outline" size="icon-sm">
            <Mail />
          </Button>
        </div>
      </div>

      {/* States */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          States
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Enabled</Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>
    </section>
  );
}
