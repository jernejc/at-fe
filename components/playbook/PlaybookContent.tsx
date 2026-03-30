'use client';

import { Suspense, useMemo } from 'react';
import type { PlaybookRead } from '@/lib/schemas';
import { Separator } from '@/components/ui/separator';
import { DetailSidePanel } from '@/components/ui/detail-side-panel/DetailSidePanel';
import { useListKeyboardNav } from '@/hooks/useListKeyboardNav';
import {
  Dashboard,
  DashboardCell,
  DashboardCellTitle,
  DashboardCellBody,
} from '@/components/ui/dashboard';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { Badge } from '@/components/ui/badge';
import { FitScoreIndicator } from '@/components/ui/fit-score-indicator';
import { normalizeScoreNullable } from '@/lib/utils';
import { ContactRow } from './ContactRow';
import { QuestionRow } from './QuestionRow';
import { ObjectionRow } from './ObjectionRow';
import { usePlaybookDetail } from './usePlaybookDetail';
import { PlaybookDetailContent } from './detail';

interface PlaybookContentProps {
  playbook: PlaybookRead;
}

/** Renders all playbook sections with row-based lists, table headers, and separators. */
export function PlaybookContent({ playbook }: PlaybookContentProps) {
  return (
    <Suspense>
      <PlaybookContentInner playbook={playbook} />
    </Suspense>
  );
}

/** Inner component that uses useSearchParams (requires Suspense boundary). */
function PlaybookContentInner({ playbook }: PlaybookContentProps) {
  const {
    selected, handleContactClick, handleObjectionClick,
    navigateToContact, navigateToObjection,
    handleClose, isContactActive, isObjectionActive,
  } = usePlaybookDetail(playbook);

  const contacts = useMemo(
    () => [...(playbook.contacts ?? [])].sort((a, b) => (a.priority_rank ?? Infinity) - (b.priority_rank ?? Infinity)),
    [playbook.contacts],
  );
  const objections = useMemo(() => playbook.objection_handling ?? [], [playbook.objection_handling]);

  // Keyboard navigation — one per section, enabled only when that type is selected
  const { getItemRef: getContactRef } = useListKeyboardNav({
    items: contacts,
    selectedItem: selected?.type === 'contact' ? selected.data : null,
    getKey: (c) => c.id,
    onSelect: navigateToContact,
    enabled: selected?.type === 'contact',
  });

  const { getItemRef: getObjectionRef } = useListKeyboardNav({
    items: objections,
    selectedItem: selected?.type === 'objection' ? selected.data : null,
    getKey: (o) => objections.indexOf(o),
    onSelect: (o) => navigateToObjection(o, objections.indexOf(o)),
    enabled: selected?.type === 'objection',
  });

  const channelCount = playbook.recommended_channels?.length ?? 0;
  const contactCount = contacts.length;
  const normalizedScore = Math.round(normalizeScoreNullable(playbook.fit_score));

  return (
    <DetailSidePanel
      open={!!selected}
      onClose={handleClose}
      detail={selected ? (
        <PlaybookDetailContent selection={selected} />
      ) : null}
    >
      <div className="space-y-10">
        {/* Dashboard Summary */}
        <Dashboard>
          <DashboardCell size="quarter">
            <DashboardCellTitle>Contacts</DashboardCellTitle>
            <DashboardCellBody>{contactCount}</DashboardCellBody>
          </DashboardCell>

          <DashboardCell size="quarter">
            <DashboardCellTitle>Channels</DashboardCellTitle>
            <DashboardCellBody size="sm" className="flex flex-wrap gap-1.5">
              {channelCount > 0
                ? (playbook.recommended_channels as string[]).map((ch) => (
                  <Badge key={ch} variant="grey">
                    {ch.replace(/_/g, ' ')}
                  </Badge>
                ))
                : '—'}
            </DashboardCellBody>
          </DashboardCell>

          <DashboardCell size="quarter" gradient={normalizedScore > 75 ? 'green' : undefined}>
            <DashboardCellTitle>Product fit</DashboardCellTitle>
            <Badge variant="grey" className="mt-2">{playbook.product_name ?? '—'}</Badge>
            <DashboardCellBody className="flex items-end justify-between">
              <span>{normalizedScore}%</span>
              <FitScoreIndicator score={normalizedScore} size={56} showChange={false} showValue={false} />
            </DashboardCellBody>
          </DashboardCell>

          <DashboardCell size="quarter">
            <DashboardCellTitle>Last Generated</DashboardCellTitle>
            <DashboardCellBody size="sm">
              {playbook.regenerated_at
                ? new Date(playbook.regenerated_at).toLocaleDateString()
                : '—'}
            </DashboardCellBody>
          </DashboardCell>

          <DashboardCell size="half" height="auto" justify="start">
            <DashboardCellTitle>Elevator Pitch</DashboardCellTitle>
            <DashboardCellBody className="text-sm font-light font-sans">
              <MarkdownContent content={playbook.elevator_pitch} />
            </DashboardCellBody>
          </DashboardCell>

          <DashboardCell size="half" height="auto" justify="start">
            <DashboardCellTitle>Value Proposition</DashboardCellTitle>
            <DashboardCellBody className="text-sm font-light font-sans">
              <MarkdownContent content={playbook.value_proposition} />
            </DashboardCellBody>
          </DashboardCell>
        </Dashboard>

        {/* Contacts */}
        {contacts.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">Contacts</h3>
            <div className="flex flex-col">
              <ContactsTableHeader />
              <Separator />
              {contacts.map((contact) => (
                <div key={contact.id}>
                  <ContactRow
                    ref={getContactRef(contact.id)}
                    contact={contact}
                    onClick={handleContactClick}
                    isActive={isContactActive(contact.id)}
                    className='-mx-6'
                  />
                  <Separator />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Objection Handling */}
        {playbook.objection_handling && playbook.objection_handling.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">Objection Handling</h3>
            <div className="flex flex-col">
              <ObjectionsTableHeader />
              <Separator />
              {playbook.objection_handling.map((entry, i) => (
                <div key={i}>
                  <ObjectionRow
                    ref={getObjectionRef(i)}
                    objection={entry.objection}
                    response={entry.response}
                    onClick={() => handleObjectionClick(entry, i)}
                    isActive={isObjectionActive(i)}
                    className='-mx-6'
                  />
                  <Separator />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Discovery Questions */}
        {playbook.discovery_questions && playbook.discovery_questions.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-2">Discovery Questions</h3>
            <div className="flex flex-col">
              <QuestionsTableHeader />
              <Separator />
              {playbook.discovery_questions.map((q, i) => (
                <div key={i}>
                  <QuestionRow question={q} className='-mx-6' />
                  <Separator />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </DetailSidePanel>
  );
}

/** Column headers for the contacts table. */
function ContactsTableHeader() {
  return (
    <div className="flex items-center gap-4 px-6 py-2 text-xs font-medium text-muted-foreground -mx-6">
      <div className="w-8 shrink-0" />
      <div className="flex-1 min-w-0">Contact</div>
      <div className="hidden md:flex items-center gap-7 shrink-0">
        <span className="w-42">Role</span>
        {/* <span className="w-14">Fit</span> */}
        <span className="w-4" />
      </div>
    </div>
  );
}

/** Column header for the discovery questions table. */
function QuestionsTableHeader() {
  return (
    <div className="flex items-center gap-4 px-6 py-2 text-xs font-medium text-muted-foreground -mx-6">
      <div className="w-8 shrink-0" />
      <div className="flex-1 min-w-0">Question</div>
    </div>
  );
}

/** Column header for the objection handling table. */
function ObjectionsTableHeader() {
  return (
    <div className="flex items-center gap-4 px-6 py-2 text-xs font-medium text-muted-foreground -mx-6">
      <div className="w-8 shrink-0" />
      <div className="flex-1 min-w-0">Objection</div>
    </div>
  );
}

/** Skeleton loader matching the PlaybookContent dashboard layout. */
export function PlaybookContentSkeleton() {
  return (
    <div className="space-y-10">
      <Dashboard>
        {/* 4 quarter cells */}
        {Array.from({ length: 4 }, (_, i) => (
          <DashboardCell key={i} size="quarter">
            <div className="w-24 h-3 bg-muted rounded animate-pulse" />
            <div className="w-16 h-8 bg-muted rounded animate-pulse mt-auto" />
          </DashboardCell>
        ))}

        {/* 2 half cells */}
        {Array.from({ length: 2 }, (_, i) => (
          <DashboardCell key={`half-${i}`} size="half" height="auto">
            <div className="w-32 h-3 bg-muted rounded animate-pulse mb-3" />
            <div className="space-y-2">
              <div className="w-full h-3 bg-muted rounded animate-pulse" />
              <div className="w-3/4 h-3 bg-muted rounded animate-pulse" />
              <div className="w-1/2 h-3 bg-muted rounded animate-pulse" />
            </div>
          </DashboardCell>
        ))}
      </Dashboard>
    </div>
  );
}
