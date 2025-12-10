// News Tab Component with Pagination

import type { NewsArticleSummary } from '@/lib/schemas';
import { EmptyState } from './components';
import { formatRelativeDate } from './utils';

interface NewsTabProps {
    news: NewsArticleSummary[];
    total: number;
    onLoadMore?: () => void;
    loadingMore?: boolean;
}

export function NewsTab({ news, total, onLoadMore, loadingMore }: NewsTabProps) {
    if (news.length === 0) return <EmptyState>No news articles</EmptyState>;

    // Group by event type
    const eventTypes = [...new Set(news.map(n => n.event_type).filter(Boolean))];

    return (
        <div className="p-6 space-y-6">
            {/* Event type filters/summary */}
            {eventTypes.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                    {eventTypes.map(type => (
                        <span key={type} className="px-3 py-1 text-xs font-medium bg-violet-100 text-violet-700">
                            {type}
                        </span>
                    ))}
                </div>
            )}

            {/* News list - Standardized Container */}
            <div className="rounded-xl border border-border/60 divide-y divide-border/60 overflow-hidden shadow-sm bg-card">
                {news.map((article) => (
                    <article key={article.id} className="group p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex gap-4">
                            {/* Date column */}
                            <div className="shrink-0 w-16 text-right pt-0.5">
                                {article.published_at && (
                                    <div className="text-xs text-muted-foreground font-medium">
                                        {formatRelativeDate(article.published_at)}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                {article.url ? (
                                    <a href={article.url} target="_blank" rel="noopener"
                                        className="text-base font-semibold text-foreground group-hover:text-blue-600 transition-colors leading-tight block">
                                        {article.title || 'Untitled'}
                                        <span className="text-blue-500/50 group-hover:text-blue-600 ml-1.5 inline-block transition-colors">↗</span>
                                    </a>
                                ) : (
                                    <p className="text-base font-semibold text-foreground leading-tight">{article.title || 'Untitled'}</p>
                                )}
                                <div className="flex gap-3 mt-2 text-sm items-center">
                                    {article.source && (
                                        <span className="text-muted-foreground flex items-center gap-1.5">
                                            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                            {article.source}
                                        </span>
                                    )}
                                    {article.event_type && (
                                        <span className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 text-xs font-medium border border-violet-100 dark:border-violet-800">
                                            {article.event_type}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {/* Load More Button */}
            {total > news.length && onLoadMore && (
                <div className="flex flex-col items-center gap-2 pt-4">
                    <p className="text-sm text-muted-foreground">Showing {news.length} of {total} articles</p>
                    <button
                        onClick={onLoadMore}
                        disabled={loadingMore}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loadingMore ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    );
}
