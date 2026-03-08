'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  ExpandableCard,
  ExpandableCardHeader,
  ExpandableCardDetails,
} from '@/components/ui/expandable-card';
import { Separator } from '@/components/ui/separator';
import type { EmployeeDetailResponse, WorkExperience, Education } from '@/lib/schemas';
import { Briefcase, GraduationCap, MapPin, Mail, Phone } from 'lucide-react';

interface EmployeeProfileDetailProps {
  employee: EmployeeDetailResponse | null;
  isLoading?: boolean;
}

/** Standalone employee profile detail content. Usable inside DetailSidePanel. */
export function EmployeeProfileDetail({ employee, isLoading }: EmployeeProfileDetailProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-card rounded-xl ring-1 ring-foreground/10 px-6 py-5 space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-40 bg-muted rounded animate-pulse" />
              <div className="h-3 w-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl ring-1 ring-foreground/10 px-6 py-5 space-y-3">
          <div className="h-5 w-28 bg-muted rounded animate-pulse" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2 pl-6 border-l-2 border-muted">
              <div className="h-4 w-36 bg-muted rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Failed to load employee profile.
      </div>
    );
  }

  const e = employee.employee;
  const location = [e.city, e.state, e.country].filter(Boolean).join(', ');

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="bg-card rounded-xl ring-1 ring-foreground/10 px-6 py-5">
        <div className="flex items-start gap-4">
          <Avatar className="w-14 h-14 shrink-0">
            {e.avatar_url && <AvatarImage src={e.avatar_url} />}
            <AvatarFallback className="text-lg font-bold">
              {(e.full_name || '??').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground truncate">{e.full_name}</h2>
            </div>
            {e.current_title && (
              <p className="text-sm text-muted-foreground mt-0.5 truncate">{e.current_title}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {e.is_decision_maker && <Badge variant="orange">Decision Maker</Badge>}
              {e.department && <Badge variant="grey">{e.department}</Badge>}
              {e.management_level && <Badge variant="grey">{e.management_level}</Badge>}
            </div>
          </div>
          {e.profile_url && (
            <a
              href={e.profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center justify-center h-9 w-9 rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          )}
        </div>

        {/* Bio */}
        {e.bio && (
          <>
            <Separator className="my-4" />
            <p className="text-sm leading-relaxed text-muted-foreground">{e.bio}</p>
          </>
        )}

        {/* Contact info */}
        {(location || (e.emails && e.emails.length > 0) || (e.phones && e.phones.length > 0)) && (
          <>
            <Separator className="my-4" />
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {location}
                </span>
              )}
              {e.emails?.map((email, i) => (
                <a key={i} href={`mailto:${email}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                  <Mail className="h-3.5 w-3.5" />
                  {email}
                </a>
              ))}
              {e.phones?.map((phone, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {phone}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Experience */}
      {e.experience && e.experience.length > 0 && (
        <ExperienceCard experience={e.experience} />
      )}

      {/* Education */}
      {e.education && e.education.length > 0 && (
        <EducationCard education={e.education} />
      )}

      {/* Skills */}
      {e.skills && e.skills.length > 0 && (
        <div className="bg-card rounded-xl ring-1 ring-foreground/10 px-6 py-5">
          <h3 className="text-lg font-semibold text-foreground mb-3">Skills</h3>
          <div className="flex flex-wrap gap-1.5">
            {e.skills.map((skill, i) => (
              <Badge key={i} variant="purple" className="px-2.5 py-1">{skill}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {e.certifications && e.certifications.length > 0 && (
        <div className="bg-card rounded-xl ring-1 ring-foreground/10 px-6 py-5">
          <h3 className="text-lg font-semibold text-foreground mb-3">Certifications</h3>
          <div className="space-y-2">
            {e.certifications.map((cert, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-amber-500 shrink-0 mt-0.5">
                  <GraduationCap className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium text-sm">{cert.name}</p>
                  {cert.issuing_authority && (
                    <p className="text-xs text-muted-foreground">{cert.issuing_authority}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {e.languages && e.languages.length > 0 && (
        <div className="bg-card rounded-xl ring-1 ring-foreground/10 px-6 py-5">
          <h3 className="text-lg font-semibold text-foreground mb-3">Languages</h3>
          <div className="flex flex-wrap gap-1.5">
            {e.languages.map((lang, i) => (
              <Badge key={i} variant="grey">{lang}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Sub-components ---------- */

function ExperienceCard({ experience }: { experience: WorkExperience[] }) {
  const preview = experience.slice(0, 3);
  const remaining = experience.slice(3);

  return (
    <ExpandableCard>
      <ExpandableCardHeader className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" />
          Experience ({experience.length})
        </h3>
        <div className="relative border-l-2 border-border ml-1 space-y-5">
          {preview.map((exp, i) => (
            <ExperienceItem key={i} exp={exp} />
          ))}
        </div>
      </ExpandableCardHeader>

      {remaining.length > 0 && (
        <ExpandableCardDetails>
          <div className="relative border-l-2 border-border ml-1 space-y-5">
            {remaining.map((exp, i) => (
              <ExperienceItem key={i} exp={exp} />
            ))}
          </div>
        </ExpandableCardDetails>
      )}
    </ExpandableCard>
  );
}

function ExperienceItem({ exp }: { exp: WorkExperience }) {
  return (
    <div className="pl-5 relative">
      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-muted-foreground/50" />
      <h4 className="font-medium text-sm text-foreground">{exp.title || 'Unknown Title'}</h4>
      {exp.company_name && <p className="text-sm text-foreground/80">{exp.company_name}</p>}
      <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground mt-0.5">
        <span>{exp.start_date || '?'} - {exp.end_date || 'Present'}</span>
        {exp.duration_months != null && <span>· {exp.duration_months}mo</span>}
        {exp.location && <span>· {exp.location}</span>}
      </div>
      {exp.description && (
        <p className="text-sm mt-1.5 text-muted-foreground line-clamp-3">{exp.description}</p>
      )}
    </div>
  );
}

function EducationCard({ education }: { education: Education[] }) {
  return (
    <div className="bg-card rounded-xl ring-1 ring-foreground/10 px-6 py-5">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-3">
        <GraduationCap className="h-4 w-4 text-primary" />
        Education ({education.length})
      </h3>
      <div className="space-y-3">
        {education.map((edu, i) => (
          <div key={i}>
            <h4 className="font-medium text-sm">{edu.school_name || 'Unknown Institution'}</h4>
            <p className="text-sm text-muted-foreground">
              {edu.degree && edu.field_of_study
                ? `${edu.degree} in ${edu.field_of_study}`
                : edu.degree || edu.field_of_study || 'Degree not specified'}
            </p>
            {(edu.start_year || edu.end_year) && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {edu.start_year} {edu.end_year && `- ${edu.end_year}`}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
