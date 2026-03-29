import type { PlaybookDetailSelection } from '../usePlaybookDetail';
import { ContactDetail } from './ContactDetail';
import { ObjectionDetail } from './ObjectionDetail';

interface PlaybookDetailContentProps {
  selection: PlaybookDetailSelection;
}

/** Dispatcher that renders the correct detail component based on selection type. */
export function PlaybookDetailContent({ selection }: PlaybookDetailContentProps) {
  switch (selection.type) {
    case 'contact':
      return <ContactDetail contact={selection.data} />;
    case 'objection':
      return <ObjectionDetail entry={selection.data} />;
  }
}
