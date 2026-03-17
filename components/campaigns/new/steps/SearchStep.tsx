import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SUGGESTED_QUERIES = [
  'US financial services SMBs under $500M showing Generative AI or automation adoption signals',
  'California healthcare companies hiring for data, AI, or digital transformation roles',
  'US manufacturers with legacy back-office systems that may need workflow automation, ERP modernization, or data integration',
  'Texas logistics companies using modern data infrastructure and showing automation or optimization signals',
];

interface SearchStepProps {
  /** Called when the user clicks a suggested query to prefill the input. */
  onSuggestionClick: (query: string) => void;
}

/** Initial search step — shows a centered title prompting the user to start. */
export function SearchStep({ onSuggestionClick }: SearchStepProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-between px-4">
      <div />
      <div />
      <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground text-center leading-tight">
        Let&apos;s make a new
        <br />
        campaign!
      </h1>
      <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
        {SUGGESTED_QUERIES.map((query) => (
          <Button
            key={query}
            variant="outline"
            className="text-left text-xs h-auto py-2 whitespace-normal basis-[calc(50%-0.25rem)]"
            onClick={() => onSuggestionClick(query)}
          >
            <Send data-icon="inline-start" className="size-3 shrink-0" />
            {query}
          </Button>
        ))}
      </div>
      <div />
    </div>
  );
}
