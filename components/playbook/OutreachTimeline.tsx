import type { PlaybookContactResponse } from '@/lib/schemas';
import { Separator } from '@/components/ui/separator';
import { OutreachRow } from './OutreachRow';

interface OutreachTimelineProps {
  contacts: PlaybookContactResponse[];
  /** Maximum day_offset across all contacts' sequences. */
  maxDay: number;
  /** Handler to open a contact's detail panel. */
  onContactClick: (contact: PlaybookContactResponse) => void;
  /** Check whether a contact row is currently selected. */
  isContactActive: (id: number) => boolean;
  /** Ref callback for keyboard navigation. */
  getContactRef: (id: number) => React.Ref<HTMLDivElement>;
}

/** Outreach timeline section: horizontally-scrollable day grid with sticky contact column. */
export function OutreachTimeline({
  contacts, maxDay, onContactClick, isContactActive, getContactRef,
}: OutreachTimelineProps) {
  return (
    <section>
      <h3 className="text-lg font-semibold text-foreground mb-2">Outreach</h3>
      <div className="overflow-x-auto -mx-6">
        <div className="min-w-max">
          {/* Header */}
          <div className="flex items-center">
            <div className="w-55 shrink-0 px-6 py-2 text-xs font-medium text-muted-foreground sticky left-0 z-1 bg-background">
              Contact
            </div>
            <div className="flex items-center">
              {Array.from({ length: maxDay }, (_, i) => (
                <div key={i + 1} className="w-20 m-2 shrink-0 text-center text-xs font-medium text-muted-foreground">
                  Day {i + 1}
                </div>
              ))}
            </div>
          </div>
          <Separator className="mx-6" />

          {/* Rows */}
          {contacts.map((contact) => (
            <div key={contact.id}>
              <OutreachRow
                ref={getContactRef(contact.id)}
                contact={contact}
                maxDay={maxDay}
                onClick={onContactClick}
                isActive={isContactActive(contact.id)}
              />
              <Separator className="mx-6" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
