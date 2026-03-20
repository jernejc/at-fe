import type { PlaybookContactResponse } from '@/lib/schemas';
import { Mail, Phone } from 'lucide-react';
import { LinkedinIcon } from '@/components/ui/icons/linkedin-icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FitScoreIndicator } from '@/components/ui/fit-score-indicator';
import { CircularProgress } from '@/components/ui/circular-progress';
import {
  Dashboard,
  DashboardCell,
  DashboardCellTitle,
  DashboardCellBody,
} from '@/components/ui/dashboard';
import { EngagementStrategyCard } from './EngagementStrategyCard';
import { OutreachTemplateCards } from './OutreachTemplateCard';

interface ContactDetailProps {
  contact: PlaybookContactResponse;
}

/** Detail panel content for a selected playbook contact using Dashboard cells. */
export function ContactDetail({ contact }: ContactDetailProps) {
  const fitScore = contact.fit_score != null ? Math.round(contact.fit_score * 100) : null;
  const urgencyValue = contact.fit_urgency != null ? contact.fit_urgency * 10 : null;

  return (
    <div className="space-y-5">
      <Dashboard>
        {/* Header: avatar, name, title, contact links */}
        <DashboardCell size="full" height="auto">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarFallback>{contact.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <DashboardCellTitle>{contact.name}</DashboardCellTitle>
              {contact.title && (
                <p className="mt-1 text-sm text-muted-foreground">{contact.title}</p>
              )}
            </div>
            <ContactLinks contact={contact} />
          </div>
        </DashboardCell>

        {/* Fit Score */}
        {fitScore != null && (
          <DashboardCell size="half" height="auto" gradient={fitScore > 75 ? 'green' : 'none'}>
            <DashboardCellTitle>Fit Score</DashboardCellTitle>
            <DashboardCellBody size="sm" className="flex items-center gap-3">
              <FitScoreIndicator score={fitScore} size={32} showChange={false} showValue={false} />
              <span>{fitScore}</span>
            </DashboardCellBody>
          </DashboardCell>
        )}

        {/* Urgency */}
        {urgencyValue != null && (
          <DashboardCell size="half" height="auto" gradient={contact.fit_urgency! > 7 ? 'green' : 'none'}>
            <DashboardCellTitle>Urgency</DashboardCellTitle>
            <DashboardCellBody size="sm" className="flex items-center gap-3">
              <CircularProgress value={urgencyValue} size={32} />
              <span>{contact.fit_urgency}/10</span>
            </DashboardCellBody>
          </DashboardCell>
        )}

        {/* Priority */}
        {contact.priority_rank != null && (
          <DashboardCell size="half" height="auto">
            <DashboardCellTitle>Priority</DashboardCellTitle>
            <DashboardCellBody><span className='text-2xl'>#</span> <span>{contact.priority_rank}</span></DashboardCellBody>
          </DashboardCell>
        )}

        {/* Roles */}
        {(contact.role_category || contact.committee_role) && (
          <DashboardCell size="half" height="auto">
            <DashboardCellTitle>Role</DashboardCellTitle>
            <DashboardCellBody size="sm" className="flex items-center gap-2 flex-wrap">
              {contact.committee_role || contact.role_category}
            </DashboardCellBody>
          </DashboardCell>
        )}

        {/* Fit Reasoning */}
        {(contact.fit_reasoning || contact.fit_assessment?.reasoning) && (
          <DashboardCell size="full" height="auto">
            <DashboardCellTitle>Fit Reasoning</DashboardCellTitle>
            <DashboardCellBody size="sm" className="text-sm font-sans font-normal leading-relaxed">
              {contact.fit_reasoning ?? contact.fit_assessment?.reasoning}
            </DashboardCellBody>
          </DashboardCell>
        )}

        {/* Priority Reasoning */}
        {contact.priority_reasoning && (
          <DashboardCell size="full" height="auto">
            <DashboardCellTitle>Priority Reasoning</DashboardCellTitle>
            <DashboardCellBody size="sm" className="text-sm font-sans font-normal leading-relaxed">
              {contact.priority_reasoning}
            </DashboardCellBody>
          </DashboardCell>
        )}
      </Dashboard>

      {/* Engagement Strategy */}
      <EngagementStrategyCard contact={contact} />

      {/* Outreach Templates */}
      {contact.outreach_templates && contact.outreach_templates.length > 0 && (
        <div className="space-y-3">
          {contact.outreach_templates.map((template) => (
            <OutreachTemplateCards key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Row of contact link icons (LinkedIn, email, phone). */
function ContactLinks({ contact }: { contact: PlaybookContactResponse }) {
  const hasLinks = contact.linkedin_url || contact.email || contact.phone;
  if (!hasLinks) return null;

  return (
    <div className="flex items-center gap-3">
      {contact.linkedin_url && (
        <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
          <LinkedinIcon className="w-6 h-6" />
        </a>
      )}
      {contact.email && (
        <a href={`mailto:${contact.email}`} className="text-muted-foreground hover:text-foreground transition-colors">
          <Mail className="w-6 h-6" />
        </a>
      )}
      {contact.phone && (
        <a href={`tel:${contact.phone}`} className="text-muted-foreground hover:text-foreground transition-colors">
          <Phone className="w-6 h-6" />
        </a>
      )}
    </div>
  );
}
