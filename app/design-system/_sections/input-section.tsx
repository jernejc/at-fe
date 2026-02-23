import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/** Form input controls showcase. */
export function InputSection() {
  return (
    <section id="inputs" className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Inputs</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Form controls: text input, textarea, select, and labels.
        </p>
      </div>

      <div className="grid gap-6 max-w-md">
        {/* Text Input */}
        <div className="space-y-2">
          <Label htmlFor="demo-input">Text Input</Label>
          <Input id="demo-input" placeholder="Enter a value..." />
        </div>

        {/* Disabled Input */}
        <div className="space-y-2">
          <Label htmlFor="demo-disabled">Disabled Input</Label>
          <Input id="demo-disabled" placeholder="Disabled..." disabled />
        </div>

        {/* Textarea */}
        <div className="space-y-2">
          <Label htmlFor="demo-textarea">Textarea</Label>
          <Textarea id="demo-textarea" placeholder="Write something..." />
        </div>

        {/* Select */}
        <div className="space-y-2">
          <Label>Select</Label>
          <Select defaultValue="warm">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hot">Hot (≥80)</SelectItem>
              <SelectItem value="warm">Warm (60–80)</SelectItem>
              <SelectItem value="cold">Cold (&lt;60)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Small Select */}
        <div className="space-y-2">
          <Label>Small Select</Label>
          <Select defaultValue="7d">
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}
