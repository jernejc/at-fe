'use client';

import { cn } from '@/lib/utils';

interface IconProps {
    className?: string;
}

/**
 * LinkedIn brand icon
 */
export function LinkedInIcon({ className }: IconProps) {
    return (
        <svg className={cn("w-4 h-4", className)} fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
    );
}

/**
 * Twitter/X brand icon
 */
export function TwitterIcon({ className }: IconProps) {
    return (
        <svg className={cn("w-4 h-4", className)} fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

/**
 * External link icon (for website links)
 */
export function ExternalLinkIcon({ className }: IconProps) {
    return (
        <svg className={cn("w-3.5 h-3.5", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
    );
}

interface SocialIconLinkProps {
    platform: 'linkedin' | 'twitter';
    url: string;
    className?: string;
}

/**
 * Clickable social media icon with hover effect
 */
export function SocialIconLink({ platform, url, className }: SocialIconLinkProps) {
    const Icon = platform === 'linkedin' ? LinkedInIcon : TwitterIcon;
    const hoverColor = platform === 'linkedin'
        ? "hover:text-[#0077b5]"
        : "hover:text-foreground";
    const title = platform === 'linkedin' ? 'LinkedIn' : 'Twitter/X';

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener"
            className={cn(
                "text-muted-foreground transition-colors",
                hoverColor,
                className
            )}
            title={title}
        >
            <Icon />
        </a>
    );
}
