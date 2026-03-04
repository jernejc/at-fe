'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getProducts } from '@/lib/api';
import type { ProductSummary } from '@/lib/schemas';
import { Loader2 } from 'lucide-react';
import { NewCampaignFlow } from '@/components/campaigns/new/NewCampaignFlow';

function FullPageLoader() {
  return (
    <div className="h-screen bg-background overflow-hidden flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function NewCampaignContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productIdParam = searchParams.get('product');
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

  if (status === 'loading' || loading) return <FullPageLoader />;
  if (!session) return null;

  if (error) {
    return (
      <div className="h-screen bg-background overflow-hidden flex flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold text-foreground">{error}</p>
        <button
          onClick={() => router.push('/campaigns')}
          className="px-6 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
        >
          Back to Campaigns
        </button>
      </div>
    );
  }

  return (
    <NewCampaignFlow
      products={products}
      preselectedProductId={productIdParam ? parseInt(productIdParam) : null}
    />
  );
}

export default function NewCampaignPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <NewCampaignContent />
    </Suspense>
  );
}
