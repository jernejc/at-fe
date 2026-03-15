import type { PlaybookContactResponse } from '@/lib/schemas';
import type { PlaybookDetailSelection } from '../usePlaybookDetail';
import { ContactDetail } from './ContactDetail';
import { StepDetail } from './StepDetail';
import { ObjectionDetail } from './ObjectionDetail';

interface PlaybookDetailContentProps {
  selection: PlaybookDetailSelection;
  /** All playbook contacts, passed to StepDetail for name matching. */
  contacts?: PlaybookContactResponse[];
  /** Called when a contact is clicked inside StepDetail. */
  onContactClick?: (contact: PlaybookContactResponse) => void;
}

/** Dispatcher that renders the correct detail component based on selection type. */
export function PlaybookDetailContent({ selection, contacts, onContactClick }: PlaybookDetailContentProps) {
  switch (selection.type) {
    case 'contact':
      return <ContactDetail contact={selection.data} />;
    case 'step':
      return <StepDetail step={selection.data} contacts={contacts} onContactClick={onContactClick} />;
    case 'objection':
      return <ObjectionDetail entry={selection.data} />;
  }
}
