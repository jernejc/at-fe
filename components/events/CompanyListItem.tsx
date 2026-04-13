import Link from 'next/link';
import { ExternalLink, User, Linkedin } from 'lucide-react';
import type { EventCompanyMarker } from './EventsMap';

interface CompanyListItemProps {
  company: EventCompanyMarker;
}

/** Single company row with favicon, name, domain link, and contact info. */
export function CompanyListItem({ company }: CompanyListItemProps) {
  return (
    <Link
      href={`/discovery/${company.domain}`}
      className="flex items-start gap-2.5 w-full text-left px-4 py-2.5 border-b border-border/50 hover:bg-muted/50 transition-colors"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://www.google.com/s2/favicons?domain=${company.domain}&sz=32`}
        alt=""
        width={16}
        height={16}
        className="size-4 rounded-sm mt-0.5 shrink-0"
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">{company.name}</span>
          <span
            role="link"
            tabIndex={0}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(`https://${company.domain}`, '_blank', 'noopener,noreferrer'); }}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ExternalLink className="size-3" />
          </span>
        </div>
        {company.contactName && (
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-sky-600 dark:text-sky-400 truncate">
            <User className="size-3 shrink-0" />
            <span className="shrink-0">{company.contactName}</span>
            {company.contactLinkedIn && (
              <span
                role="link"
                tabIndex={0}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(company.contactLinkedIn!, '_blank', 'noopener,noreferrer'); }}
                className="text-muted-foreground hover:text-blue-500 transition-colors cursor-pointer"
              >
                <Linkedin className="size-3.5" />
              </span>
            )}
            {company.contactTitle && (
              <span className="truncate max-w-[140px] text-muted-foreground">· {company.contactTitle}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
