'use client';

import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface MarkdownContentProps {
  /** The markdown string to render. */
  content: string | null | undefined;
  /** Additional classes for the wrapper div. */
  className?: string;
  /** Fallback text when content is nullish or empty. Defaults to '—'. */
  fallback?: string;
}

/** Renders a markdown string with Tailwind-styled elements. Falls back to plain text if content is empty. */
export function MarkdownContent({ content, className, fallback = '—' }: MarkdownContentProps) {
  if (!content) {
    return <span>{fallback}</span>;
  }

  return (
    <div className={cn('space-y-2 [&>*:last-child]:mb-0', className)}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p>{children}</p>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80 transition-colors"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
