'use client';

import type { PlaybookContactResponse } from '@/lib/schemas';
import { Badge } from '@/components/ui/badge';
import {
  Dashboard,
  DashboardCell,
  DashboardCellTitle,
  DashboardCellBody,
} from '@/components/ui/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface EngagementStrategyCardProps {
  contact: PlaybookContactResponse;
}

interface StrategyTab {
  label: string;
  value: string;
}

/** Builds the list of available tabs from approach notes. */
function buildTabs(contact: PlaybookContactResponse): StrategyTab[] {
  const notes = contact.approach_notes;
  const tabs: StrategyTab[] = [];
  if (contact.value_prop) tabs.push({ label: 'Value Proposition', value: 'value_prop' });
  if (notes?.opening_approach) tabs.push({ label: 'Opening Approach', value: 'opening_approach' });
  if (notes?.resistance_strategy) tabs.push({ label: 'Resistance Strategy', value: 'resistance_strategy' });
  if (notes?.meeting_value_exchange) tabs.push({ label: 'Meeting Value Exchange', value: 'meeting_value_exchange' });
  return tabs;
}

/** Returns the tab content string for a given tab value. */
function getTabContent(contact: PlaybookContactResponse, value: string): string {
  const notes = contact.approach_notes;
  switch (value) {
    case 'value_prop': return contact.value_prop ?? '';
    case 'opening_approach': return notes?.opening_approach ?? '';
    case 'resistance_strategy': return notes?.resistance_strategy ?? '';
    case 'meeting_value_exchange': return notes?.meeting_value_exchange ?? '';
    default: return '';
  }
}

/** Card displaying engagement strategy details for a contact with tabbed content. */
export function EngagementStrategyCard({ contact }: EngagementStrategyCardProps) {
  const hasData =
    contact.value_prop || contact.approach_notes?.opening_approach ||
    contact.channel_sequence?.length || contact.preferred_channel || contact.persona_type;
  if (!hasData) return null;

  const tabs = buildTabs(contact);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Strategy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(contact.preferred_channel || contact.persona_type || contact.channel_sequence?.length) && (
          <Dashboard>
            {contact.preferred_channel && (
              <DashboardCell size="half" height="auto">
                <DashboardCellTitle>Preferred Channel</DashboardCellTitle>
                <DashboardCellBody size="sm" className="mt-1">
                  {contact.preferred_channel}
                </DashboardCellBody>
              </DashboardCell>
            )}
            {contact.persona_type && (
              <DashboardCell size="half" height="auto">
                <DashboardCellTitle>Persona Type</DashboardCellTitle>
                <DashboardCellBody size="sm" className="mt-1">
                  {contact.persona_type}
                </DashboardCellBody>
              </DashboardCell>
            )}
            {contact.channel_sequence && contact.channel_sequence.length > 0 && (
              <DashboardCell size="full" height="auto">
                <DashboardCellTitle>Channel Sequence</DashboardCellTitle>
                <DashboardCellBody size="sm" className="flex items-center gap-2 mt-3 flex-wrap">
                  {contact.channel_sequence.map((ch, i) => (
                    <Badge key={i} variant="grey">{ch.replace(/_/g, ' ')}</Badge>
                  ))}
                </DashboardCellBody>
              </DashboardCell>
            )}
          </Dashboard>
        )}

        {tabs.length > 0 && (
          <Tabs defaultValue={tabs[0].value}>
            <TabsList variant="line" className="overflow-x-auto w-[stretch] justify-start pb-1 -mx-6 px-6">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
              ))}
            </TabsList>
            <Separator className="-mt-2" />
            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="pt-4">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                  {getTabContent(contact, tab.value)}
                </p>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
