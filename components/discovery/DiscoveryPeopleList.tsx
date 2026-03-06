'use client';

import type { EmployeeSummary } from '@/lib/schemas';
import { PersonRow, PersonRowSkeleton } from '@/components/ui/person-row';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface DiscoveryPeopleListProps {
  keyContacts: EmployeeSummary[];
  team: EmployeeSummary[];
  teamTotal: number;
  loading: boolean;
  error: string | null;
  loadingMore: boolean;
  loadMore: () => Promise<void>;
}

/** Renders the people list for a discovery company detail page. */
export function DiscoveryPeopleList({
  keyContacts, team, teamTotal, loading, error, loadingMore, loadMore,
}: DiscoveryPeopleListProps) {
  if (loading) return <PeopleListSkeleton />;

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (keyContacts.length === 0 && team.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-muted-foreground">No people found.</p>
      </div>
    );
  }

  const hasMore = team.length < teamTotal;

  return (
    <div className="space-y-10">
      {keyContacts.length > 0 && (
        <section>
          <h3 className="text-base font-medium text-foreground mb-3">
            Key Contacts <span className="text-muted-foreground font-normal">({keyContacts.length})</span>
          </h3>
          {keyContacts.map(person => (
            <PersonRow key={person.id} person={person} keyContact />
          ))}
        </section>
      )}

      {team.length > 0 && (
        <section>
          <h3 className="text-base font-medium text-foreground mb-3">
            Team <span className="text-muted-foreground font-normal">({teamTotal})</span>
          </h3>
          {team.map(person => (
            <PersonRow key={person.id} person={person} />
          ))}

          {hasMore && (
            <div className="space-y-4 mt-4">
              <Separator />
              <div className="flex justify-center">
                <Button variant="ghost" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading...' : 'Load more'}
                </Button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function PeopleListSkeleton() {
  return (
    <div className="space-y-10">
      <div>
        <div className="h-5 w-32 bg-muted rounded animate-pulse mb-3" />
        {Array.from({ length: 3 }).map((_, i) => (
          <PersonRowSkeleton key={i} />
        ))}
      </div>
      <div>
        <div className="h-5 w-20 bg-muted rounded animate-pulse mb-3" />
        {Array.from({ length: 5 }).map((_, i) => (
          <PersonRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
