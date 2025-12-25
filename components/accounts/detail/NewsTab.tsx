// News Tab Component with Pagination

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { NewsArticleSummary } from '@/lib/schemas';
import { formatRelativeDate } from '@/lib/utils';
import { EmptyState, SectionHeader } from './components';
import { LoadMoreSection } from './LoadMoreSection';

interface NewsTabProps {
    news: NewsArticleSummary[];
    total: number;
    onLoadMore?: () => void;
    loadingMore?: boolean;
}

export function NewsTab({ news, total, onLoadMore, loadingMore }: NewsTabProps) {
    if (news.length === 0) return <EmptyState>No news articles</EmptyState>;

    return (
        <div className="space-y-6">
            <SectionHeader title="News" count={news.length} color="bg-violet-600" />

            {/* News list - Standardized Container */}
            <Card className="overflow-hidden shadow-sm">
                <div className="divide-y divide-border/60">
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
                                            <Badge variant="outline" className="bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-100 dark:border-violet-800 font-medium">
                                                {article.event_type}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </Card>

            {/* Load More Button */}
            {onLoadMore && (
                <LoadMoreSection
                    currentCount={news.length}
                    totalCount={total}
                    onLoadMore={onLoadMore}
                    loadingMore={loadingMore ?? false}
                    itemLabel="articles"
                />
            )}
        </div>
    );
}
