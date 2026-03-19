import { useMemo } from 'react';
import type { CadenceStep, PlaybookContactResponse } from '@/lib/schemas';
import { ChannelIcon } from '../ChannelIcon';
import {
  Dashboard,
  DashboardCell,
  DashboardCellTitle,
  DashboardCellBody,
} from '@/components/ui/dashboard';
import { ContactRow } from '../ContactRow';

interface StepDetailProps {
  step: CadenceStep;
  /** All playbook contacts, used to match step contact names to real data. */
  contacts?: PlaybookContactResponse[];
  /** Called when a matched contact row is clicked. */
  onContactClick?: (contact: PlaybookContactResponse) => void;
}

/** Detail panel content for a selected outreach cadence step using Dashboard cells. */
export function StepDetail({ step, contacts = [], onContactClick }: StepDetailProps) {
  /** Match step contact refs to real PlaybookContactResponse objects. */
  const { matched, unmatched } = useMemo(() => {
    if (!step.contacts?.length) return { matched: [], unmatched: [] };
    const matchedContacts: PlaybookContactResponse[] = [];
    const unmatchedNames: string[] = [];
    for (const stepContact of step.contacts) {
      // Prefer matching by employee_id when available (more reliable than name)
      const found = stepContact.employee_id != null
        ? contacts.find((c) => c.employee_id === stepContact.employee_id)
        : contacts.find((c) => c.name === stepContact.name);
      if (found) matchedContacts.push(found);
      else unmatchedNames.push(stepContact.name);
    }
    return { matched: matchedContacts, unmatched: unmatchedNames };
  }, [step.contacts, contacts]);

  const hasContacts = matched.length > 0 || unmatched.length > 0;

  return (
    <div className="space-y-5">
      <Dashboard>
        {/* Day */}
        <DashboardCell size="half" height="auto">
          <DashboardCellTitle>Day</DashboardCellTitle>
          <DashboardCellBody>{step.day_offset ?? 0}</DashboardCellBody>
        </DashboardCell>

        {/* Channel */}
        <DashboardCell size="half" height="auto">
          <DashboardCellTitle>Channel</DashboardCellTitle>
          <DashboardCellBody size="sm" className="flex items-center justify-between gap-2 capitalize">
            <span>{step.channel.replace(/_/g, ' ')}</span>
            <ChannelIcon channel={step.channel} className="w-8 h-8" />
          </DashboardCellBody>
        </DashboardCell>

        {/* Objective */}
        {step.objective && (
          <DashboardCell size="full" height="auto">
            <DashboardCellTitle>Objective</DashboardCellTitle>
            <DashboardCellBody size="sm" className="text-sm font-sans font-normal leading-relaxed">
              {step.objective}
            </DashboardCellBody>
          </DashboardCell>
        )}

        {/* Notes */}
        {step.notes && (
          <DashboardCell size="full" height="auto">
            <DashboardCellTitle>Notes</DashboardCellTitle>
            <DashboardCellBody size="sm" className="text-sm font-sans font-normal leading-relaxed">
              {step.notes}
            </DashboardCellBody>
          </DashboardCell>
        )}

        {/* Follow-up */}
        {step.follow_up && (
          <DashboardCell size="full" height="auto">
            <DashboardCellTitle>Follow-up</DashboardCellTitle>
            <DashboardCellBody size="sm" className="text-sm font-sans font-normal leading-relaxed">
              {step.follow_up}
            </DashboardCellBody>
          </DashboardCell>
        )}

        {/* Purpose */}
        {step.purpose && (
          <DashboardCell size="full" height="auto">
            <DashboardCellTitle>Purpose</DashboardCellTitle>
            <DashboardCellBody size="sm" className="text-sm font-sans font-normal leading-relaxed capitalize">
              {step.purpose.replaceAll('_', ' ')}
            </DashboardCellBody>
          </DashboardCell>
        )}

        {/* Message Angle */}
        {step.message_angle && (
          <DashboardCell size="full" height="auto">
            <DashboardCellTitle>Message Angle</DashboardCellTitle>
            <DashboardCellBody size="sm" className="text-sm font-sans font-normal leading-relaxed">
              {step.message_angle}
            </DashboardCellBody>
          </DashboardCell>
        )}

        {/* Framework / Technique */}
        {step.framework_technique && (
          <DashboardCell size="full" height="auto">
            <DashboardCellTitle>Framework / Technique</DashboardCellTitle>
            <DashboardCellBody size="sm" className="text-sm font-sans font-normal leading-relaxed">
              {step.framework_technique}
            </DashboardCellBody>
          </DashboardCell>
        )}
      </Dashboard>

      {/* Contacts — matched as clickable rows, unmatched as plain text */}
      {hasContacts && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Contacts</h4>
          <div className="flex flex-col">
            {matched.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                onClick={onContactClick}
                hideMetrics
              />
            ))}
            {unmatched.map((name) => (
              <div key={name} className="flex items-center gap-4 px-6 py-4">
                <span className="text-sm text-muted-foreground">{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
