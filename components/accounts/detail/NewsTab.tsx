// News Tab Component with Pagination

import type { NewsArticleSummary } from '@/lib/api';
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

            {/* News list */}
            <div className="space-y-4">
                {news.map((article) => (
                    <article key={article.id} className="group">
                        <div className="flex gap-4">
                            {/* Date column */}
                            <div className="shrink-0 w-16 text-right">
                                {article.published_at && (
                                    <div className="text-xs text-muted-foreground">
                                        {formatRelativeDate(article.published_at)}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 pb-4 border-b">
                                {article.url ? (
                                    <a href={article.url} target="_blank" rel="noopener"
                                        className="font-medium text-foreground group-hover:text-violet-600 transition-colors">
                                        {article.title || 'Untitled'}
                                        <span className="text-violet-500 ml-1">↗</span>
                                    </a>
                                ) : (
                                    <p className="font-medium">{article.title || 'Untitled'}</p>
                                )}
                                <div className="flex gap-3 mt-1 text-sm">
                                    {article.source && (
                                        <span className="text-muted-foreground">{article.source}</span>
                                    )}
                                    {article.event_type && (
                                        <span className="text-violet-600 font-medium">{article.event_type}</span>
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
