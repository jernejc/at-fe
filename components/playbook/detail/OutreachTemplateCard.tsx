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
  subject?: string | null;
  content: string | string[];
}

/** Human-readable labels for outreach message types. */
const MESSAGE_TYPE_LABELS: Record<string, string> = {
  anchor_artifact: 'Anchor Artifact',
  initial_email: 'Initial Email',
  linkedin_note: 'LinkedIn Note',
  cold_call_script: 'Cold Call Script',
  insight_email: 'Insight Email',
  linkedin_value_message: 'LinkedIn Value',
  case_proof_email: 'Case Proof Email',
  followup_call_script: 'Follow-up Call',
  linkedin_followup_message: 'LinkedIn Follow-up',
  breakup_email: 'Breakup Email',
  voicemail_script: 'Voicemail Script',
};

/** Collects non-null message fields from a template into a renderable list. */
function buildTemplateFields(template: OutreachTemplateResponse): TemplateField[] {
  // Use structured messages array when available (new API schema)
  if (template.messages && template.messages.length > 0) {
    return [...template.messages]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((msg) => ({
        label: MESSAGE_TYPE_LABELS[msg.message_type] ?? msg.message_type.replace(/_/g, ' '),
        subject: msg.subject,
        content: msg.body,
      }));
  }

  // Legacy fallback: use top-level fields
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
          <TabsList variant="line" className="overflow-x-auto w-[stretch] justify-start pb-1 -mx-6 px-6">
            {fields.map(({ label }, i) => (
              <TabsTrigger key={label} value={i}>{label}</TabsTrigger>
            ))}
          </TabsList>
          <Separator className="-mt-2" />
          {fields.map(({ label, subject, content }, i) => (
            <TabsContent key={label} value={i} className="pt-4">
              <div className='bg-background rounded-lg px-4 py-3'>
                {subject && (
                  <>
                    <p className="text-sm font-semibold text-muted-foreground">Subject: {subject}</p>
                    <Separator className="my-2" />
                  </>
                )}
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
