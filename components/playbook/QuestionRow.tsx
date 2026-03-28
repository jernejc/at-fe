import { cn } from '@/lib/utils';
import { ShieldQuestionMark } from 'lucide-react';
import { MarkdownContent } from '@/components/ui/markdown-content';

interface QuestionRowProps {
  question: string;
  className?: string;
}

/** Static row displaying a discovery question with an icon. */
export function QuestionRow({ question, className }: QuestionRowProps) {
  return (
    <div className={cn('flex items-start gap-4 px-6 py-4', className)}>
      <div className="shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
        <ShieldQuestionMark className="w-4 h-4" />
      </div>
      <MarkdownContent content={question} className="text-sm text-foreground" />
    </div>
  );
}
