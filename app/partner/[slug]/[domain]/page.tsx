'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface CompanyDetailPageProps {
    params: Promise<{
        slug: string;
        domain: string;
    }>;
}

export default function CompanyDetailPage({ params }: CompanyDetailPageProps) {
    const { slug, domain } = use(params);
    const router = useRouter();

    return (
        <main className="flex-1 overflow-y-auto">
            <div className="max-w-[1600px] mx-auto px-6 py-6">
                <button
                    onClick={() => router.push(`/partner/${slug}`)}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Campaign
                </button>

                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    {decodeURIComponent(domain)}
                </h1>

                <p className="text-slate-500 dark:text-slate-400">
                    Company details coming soon
                </p>
            </div>
        </main>
    );
}
