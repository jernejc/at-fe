// Content-related schemas (posts, jobs, news)

export interface PostSummary {
    id: number;
    external_id: string | null;
    text: string | null;
    post_type: string | null;
    posted_at: string | null;
    likes_count: number | null;
    comments_count: number | null;
    author_name: string | null;
}

export interface JobPostingSummary {
    id: number;
    title: string;
    location: string | null;
    department: string | null;
    employment_type: string | null;
    posted_at: string | null;
    is_remote: boolean | null;
}

export interface NewsArticleSummary {
    id: number;
    title: string | null;
    source: string | null;
    published_at: string | null;
    event_type: string | null;
    url: string | null;
}
