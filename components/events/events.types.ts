import type { PartnerEvent } from '@/data/partner-events';
import type { CompetitorEvent } from '@/data/competitor-events';

export type SidebarTab = 'companies' | 'events';

export type AnyEvent =
  | (PartnerEvent & { _kind: 'partner' })
  | (CompetitorEvent & { _kind: 'competitor' });
