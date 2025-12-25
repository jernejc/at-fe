// Updates Tab Component
import { EmptyState, SectionHeader } from './components';
import { ListCard } from './ListCard';
import { Heart, MessageSquare } from 'lucide-react';

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

    // Sort by date, newest first
    const sortedPosts = [...posts].sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return (
        <div className="space-y-6">
            <SectionHeader title="Recent Updates" count={sortedPosts.length} color="bg-sky-600" />
            <div className="space-y-2">
                {sortedPosts.map((post, i) => (
                    <UpdateCard key={i} post={post} />
                ))}
            </div>
        </div>
    );
}

function UpdateCard({ post }: { post: UpdatePost }) {
    const isReshare = !!post.resharedPostAuthor;
    const linkedInUrl = post.urn ? `https://www.linkedin.com/feed/update/${post.urn}` : null;

    const handleClick = () => {
        if (linkedInUrl) {
            window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <ListCard
            leftColumn={post.date || '—'}
            onClick={linkedInUrl ? handleClick : undefined}
            rightIcon={linkedInUrl ? 'external' : 'none'}
        >
            {/* Content */}
            <p className="text-sm text-foreground/90 line-clamp-2 leading-relaxed">
                {post.description}
            </p>

            {/* Reshared Content */}
            {isReshare && (
                <div className="mt-2 px-3 py-2 bg-muted/30 rounded border border-border/50">
                    <span className="text-[11px] font-medium text-muted-foreground">{post.resharedPostAuthor}</span>
                    {post.resharedPostDescription && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            {post.resharedPostDescription}
                        </p>
                    )}
                </div>
            )}

            {/* Engagement at bottom */}
            <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5 text-rose-500" />
                    <span className="text-xs font-medium text-muted-foreground">{(post.reactionsCount || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-xs font-medium text-muted-foreground">{(post.commentsCount || 0).toLocaleString()}</span>
                </div>
            </div>
        </ListCard>
    );
}
