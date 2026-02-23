'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getProducts } from '@/lib/api';
import type { ProductSummary } from '@/lib/schemas';
import { Loader2 } from 'lucide-react';
import { CampaignCreateWizard } from '@/components/campaigns';
import { Suspense } from 'react';

function NewCampaignContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const productParam = searchParams.get('product');
    const [products, setProducts] = useState<ProductSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'loading') return;
        if (!session) {
            router.replace('/signin');
            return;
        }

        async function fetchProducts() {
            try {
                const data = await getProducts();
                setProducts(data.items);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load products');
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, [session, status, router]);

    if (status === 'loading' || loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!session) {
        return null;
    }

    if (error) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">{error}</p>
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                >
                    Go Home
                </button>
            </div>
        );
    }

    const preselectedProductId = productParam ? parseInt(productParam) : null;

    return (
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
            <CampaignCreateWizard
                products={products}
                preselectedProductId={preselectedProductId}
            />
        </main>
    );
}

export default function NewCampaignPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        }>
            <NewCampaignContent />
        </Suspense>
    );
}
