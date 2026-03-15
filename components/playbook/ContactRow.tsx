import { cn } from '@/lib/utils';
import type { PlaybookContactResponse } from '@/lib/schemas';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FitScoreIndicator } from '@/components/ui/fit-score-indicator';

interface ContactRowProps {
  contact: PlaybookContactResponse;
  className?: string;
}

/** Static row displaying a playbook contact with avatar, name, title, role, fit score, and LinkedIn link. */
export function ContactRow({ contact, className }: ContactRowProps) {
  return (
    <div className={cn('flex items-center gap-4 px-6 py-4', className)}>
      {/* Avatar */}
      <Avatar size="sm">
        <AvatarFallback className="text-xs">
          {contact.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Name + title */}
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="text-base font-medium text-foreground truncate leading-tight">
          {contact.name}
        </span>
        {contact.title && (
          <span className="text-xs text-muted-foreground truncate mt-0.5">
            {contact.title}
          </span>
        )}
      </div>

      {/* Metrics */}
      <div className="hidden md:flex items-center gap-7 shrink-0">
        {/* Role category */}
        <span className="text-sm truncate w-34">
          {contact.role_category ?? '\u2013'}
        </span>

        {/* Fit score */}
        {contact.fit_score != null ? (
          <FitScoreIndicator score={Math.round(contact.fit_score * 100)} size={16} showChange={false} className="w-14" />
        ) : (
          <span className="w-14 text-sm text-muted-foreground">{'\u2013'}</span>
        )}

        {/* LinkedIn */}
        {contact.linkedin_url ? (
          <a
            href={contact.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </a>
        ) : (
          <div className="w-4 h-4" />
        )}
      </div>
    </div>
  );
}
