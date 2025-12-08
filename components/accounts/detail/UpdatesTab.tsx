// Updates Tab Component
import { EmptyState } from './components';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

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
        <div className="p-6 space-y-6 bg-muted/5">
            {posts.map((post, i) => (
                <UpdateCard key={i} post={post} />
            ))}
        </div>
    );
}

function UpdateCard({ post }: { post: UpdatePost }) {
    const isReshare = !!post.resharedPostAuthor;

    return (
        <article className="border bg-background rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="p-4 flex gap-3">
                <Avatar className="w-10 h-10 border">
                    <AvatarFallback className="text-xs bg-blue-50 text-blue-700">
                        LN
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold truncate text-foreground">
                            Company Update
                        </p>
                        {post.date && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {post.date}
                            </span>
                        )}
                    </div>
                    {post.followers && (
                        <p className="text-xs text-muted-foreground">
                            {post.followers.toLocaleString()} followers
                        </p>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-2">
                {post.description && (
                    <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {post.description}
                    </div>
                )}
            </div>

            {/* Reshared Content Content */}
            {isReshare && (
                <div className="mx-4 mb-4 mt-2 border rounded-lg p-3 bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-8 bg-muted-foreground/20 rounded-full" />
                        <div>
                            <p className="text-sm font-medium">{post.resharedPostAuthor}</p>
                            {post.resharedPostAuthorHeadline && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                    {post.resharedPostAuthorHeadline}
                                </p>
                            )}
                        </div>
                    </div>
                    {post.resharedPostDescription && (
                        <p className="text-sm text-muted-foreground line-clamp-3 pl-3">
                            {post.resharedPostDescription}
                        </p>
                    )}
                </div>
            )}

            {/* Engagement Footer */}
            <div className="bg-muted/5 px-4 py-3 border-t flex items-center justify-between gap-4 mt-2">
                <div className="flex items-center gap-4">
                    {/* Reactions */}
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground group cursor-default">
                        <div className="p-1 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                            </svg>
                        </div>
                        <span className="font-medium">{(post.reactionsCount || 0).toLocaleString()}</span>
                    </div>

                    {/* Comments */}
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground group cursor-default">
                        <div className="p-1 rounded-full group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <span className="font-medium">{(post.commentsCount || 0).toLocaleString()}</span>
                    </div>
                </div>

                {/* Link */}
                {post.urn && (
                    <a
                        href={`https://www.linkedin.com/feed/update/${post.urn}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                    >
                        View Post
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                )}
            </div>
        </article>
    );
}
