'use client';

import type { OutreachTemplateResponse } from '@/lib/schemas';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface OutreachTemplateCardsProps {
  template: OutreachTemplateResponse;
}

interface TemplateField {
  label: string;
  content: string | string[];
}

/** Collects non-null message fields from a template into a renderable list. */
function buildTemplateFields(template: OutreachTemplateResponse): TemplateField[] {
  const fields: TemplateField[] = [];
  if (template.draft_message) fields.push({ label: 'Draft Message', content: template.draft_message });
  if (template.linkedin_connection_note) fields.push({ label: 'LinkedIn Note', content: template.linkedin_connection_note });
  if (template.follow_up_email) fields.push({ label: 'Follow-up Email', content: template.follow_up_email });
  if (template.phone_script) fields.push({ label: 'Phone Script', content: template.phone_script });
  if (template.phone_talking_points?.length) fields.push({ label: 'Talking Points', content: template.phone_talking_points });
  if (template.voicemail_script) fields.push({ label: 'Voicemail', content: template.voicemail_script });
  return fields;
}

/** Copies field content to clipboard and shows a toast notification. */
function handleCopy(content: string | string[]) {
  const text = typeof content === 'string' ? content : content.join('\n');
  copyToClipboard(text);
  toast.success('Copied to clipboard');
}

/** Single card with tab navigation for each outreach template field. */
export function OutreachTemplateCards({ template }: OutreachTemplateCardsProps) {
  const fields = buildTemplateFields(template);
  if (fields.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Outreach Template</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={0}>
          <TabsList variant="line" className="flex-wrap">
            {fields.map(({ label }, i) => (
              <TabsTrigger key={label} value={i}>{label}</TabsTrigger>
            ))}
          </TabsList>
          <Separator className="-mt-2 mx-1" />
          {fields.map(({ label, content }, i) => (
            <TabsContent key={label} value={i} className="pt-4">
              <div className='bg-background rounded-lg px-4 py-3'>
                {typeof content === 'string' ? (
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{content}</p>
                ) : (
                  <ul className="list-disc list-inside text-sm text-muted-foreground leading-relaxed space-y-1">
                    {content.map((point, j) => <li key={j}>{point}</li>)}
                  </ul>
                )}
              </div>
              <div className='text-center'>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3"
                  onClick={() => handleCopy(content)}
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Copy
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
