'use client';

import { useMemo } from 'react';
import { Users } from 'lucide-react';
import {
  ExpandableCard,
  ExpandableCardHeader,
  ExpandableCardDetails,
} from '@/components/ui/expandable-card';
import { ContactRow } from '@/components/playbook/ContactRow';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import type { PlaybookContactResponse } from '@/lib/schemas';

interface ContactsCardProps {
  contacts: PlaybookContactResponse[];
  loading: boolean;
}

/** Displays playbook contacts in an expandable card. Each row opens LinkedIn on click. */
export function ContactsCard({ contacts, loading }: ContactsCardProps) {
  const sorted = useMemo(
    () => [...contacts].sort((a, b) => (a.priority_rank ?? Infinity) - (b.priority_rank ?? Infinity)),
    [contacts],
  );

  if (loading) {
    return (
      <ExpandableCard>
        <ExpandableCardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Contacts</h3>
            <Skeleton className="h-5 w-5 rounded" />
          </div>
          <div className="space-y-3 pt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-28 rounded" />
                  <Skeleton className="h-3 w-40 rounded" />
                </div>
              </div>
            ))}
          </div>
        </ExpandableCardHeader>
      </ExpandableCard>
    );
  }

  if (sorted.length === 0) return null;

  const preview = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  const handleContactClick = (contact: PlaybookContactResponse) => {
    if (contact.linkedin_url) {
      window.open(contact.linkedin_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <ExpandableCard>
      <ExpandableCardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Contacts</h3>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-sm">{sorted.length}</span>
          </div>
        </div>

        <div>
          {preview.map((contact, i) => (
            <div key={contact.id}>
              {i > 0 && <Separator />}
              <ContactRow
                contact={contact}
                onClick={handleContactClick}
                hideMetrics
                className="-mx-6"
              />
            </div>
          ))}
        </div>
      </ExpandableCardHeader>

      {rest.length > 0 && (
        <ExpandableCardDetails>
          <div>
            {rest.map((contact) => (
              <div key={contact.id}>
                <Separator />
                <ContactRow
                  contact={contact}
                  onClick={handleContactClick}
                  hideMetrics
                  className="-mx-6"
                />
              </div>
            ))}
          </div>
        </ExpandableCardDetails>
      )}
    </ExpandableCard>
  );
}
