import type { PlaybookContactResponse } from '@/lib/schemas';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EngagementStrategyCardProps {
  contact: PlaybookContactResponse;
}

/** Static card displaying engagement strategy details for a contact. */
export function EngagementStrategyCard({ contact }: EngagementStrategyCardProps) {
  const hasData =
    contact.value_prop || contact.approach_notes || contact.channel_sequence?.length ||
    contact.preferred_channel || contact.persona_type;
  if (!hasData) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Strategy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {contact.preferred_channel && (
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Preferred Channel</span>
            <div className="mt-1.5">
              <Badge variant="green" size="sm">{contact.preferred_channel}</Badge>
            </div>
          </div>
        )}

        {contact.persona_type && (
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Persona Type</span>
            <div className="mt-1.5">
              <Badge variant="purple" size="sm">{contact.persona_type}</Badge>
            </div>
          </div>
        )}

        {contact.value_prop && (
          <LabeledField label="Value Proposition" value={contact.value_prop} />
        )}

        {contact.approach_notes && (
          <LabeledField label="Approach" value={contact.approach_notes} />
        )}

        {contact.channel_sequence && contact.channel_sequence.length > 0 && (
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Channel Sequence
            </span>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {contact.channel_sequence.map((ch, i) => (
                <Badge key={i} variant="grey" size="sm">{ch.replace(/_/g, ' ')}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Labeled text block for a strategy field. */
function LabeledField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      <p className="text-sm text-foreground leading-relaxed mt-1">{value}</p>
    </div>
  );
}
