// Updates Tab Component
import { EmptyState } from './components';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import { formatRelativeDate } from './utils'; // reuse util if available

// UpdatePost interface matches the schema structure
interface UpdatePost {
    urn?: string;
    followers?: number;
    date?: string;
    description?: string;
    reactionsCount?: number;
    commentsCount?: number;
    resharedPostAuthor?: string | null;
    resharedPostAuthorUrl?: string | null;
    resharedPostAuthorHeadline?: string | null;
    resharedPostDescription?: string | null;
    resharedPostDate?: string | null;
    resharedPostFollowers?: number | null;
}

interface UpdatesTabProps {
    updates: unknown[];
}

export function UpdatesTab({ updates }: UpdatesTabProps) {
    const posts = updates as UpdatePost[];

    if (posts.length === 0) return <EmptyState>No recent updates</EmptyState>;

    return (
        <div className="space-y-4 p-6 bg-muted/5">
            {posts.map((post, i) => (
                <UpdateCard key={i} post={post} />
            ))}
        </div>
    );
}

function UpdateCard({ post }: { post: UpdatePost }) {
    const isReshare = !!post.resharedPostAuthor;

    return (
        <article className="bg-card p-4 rounded-xl border border-border/60 shadow-sm">
            {/* Header */}
            <div className="flex flex-col gap-1 mb-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                        Company Update
                    </span>
                    {post.date && (
                        <span className="text-xs text-muted-foreground">{post.date}</span>
                    )}
                </div>
                {post.followers && (
                    <p className="text-xs text-muted-foreground">
                        {post.followers.toLocaleString()} followers
                    </p>
                )}
            </div>

            {/* Content */}
            <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {post.description}
            </div>

            {/* Reshared Content */}
            {isReshare && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-xs">{post.resharedPostAuthor}</span>
                    </div>
                    {post.resharedPostDescription && (
                        <p className="text-xs text-muted-foreground line-clamp-3 italic">
                            {post.resharedPostDescription}
                        </p>
                    )}
                </div>
            )}

            {/* Actions Toolbar */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/30">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span role="img" aria-label="likes">👍</span>
                    <span>{(post.reactionsCount || 0).toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span role="img" aria-label="comments">💬</span>
                    <span>{(post.commentsCount || 0).toLocaleString()}</span>
                </div>

                {post.urn && (
                    <a
                        href={`https://www.linkedin.com/feed/update/${post.urn}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                        View Post
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                )}
            </div>
        </article>
    );
}
