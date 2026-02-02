'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { FilterIcon, Loader2 } from 'lucide-react';
import { CampaignCard } from '@/components/partner/CampaignCard';
import { getCampaigns, getCampaignCompanies, getProducts } from '@/lib/api';
import type { CampaignSummary, MembershipRead, ProductSummary } from '@/lib/schemas';

export default function CampaignsPage() {
    const { status: sessionStatus } = useSession();

    const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
    const [products, setProducts] = useState<ProductSummary[]>([]);
    const [companiesMap, setCompaniesMap] = useState<Map<number, MembershipRead[]>>(new Map());
    const [loading, setLoading] = useState(true);
    const [productFilter, setProductFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        async function fetchData() {
            if (sessionStatus === 'loading') return;
            try {
                setLoading(true);

                const [campaignsRes, productsRes] = await Promise.all([
                    getCampaigns(),
                    getProducts(),
                ]);

                setCampaigns(campaignsRes.items);
                setProducts(productsRes.items);

                const cMap = new Map<number, MembershipRead[]>();
                for (const campaign of campaignsRes.items) {
                    try {
                        const res = await getCampaignCompanies(campaign.slug, { page_size: 100 });
                        cMap.set(campaign.id, res.items);
                    } catch (e) {
                        console.error(`Failed to fetch companies for ${campaign.slug}:`, e);
                        cMap.set(campaign.id, []);
                    }
                }
                setCompaniesMap(cMap);
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [sessionStatus]);

    const productLookup = useMemo(() => {
        const map = new Map<number, ProductSummary>();
        products.forEach(p => map.set(p.id, p));
        return map;
    }, [products]);

    const newDomains = useMemo(() => {
        const seen = new Set<string>();
        const result = new Set<string>();
        let count = 0;
        const allOpps = Array.from(companiesMap.values()).flat();
        for (const opp of allOpps) {
            if (!seen.has(opp.domain)) {
                seen.add(opp.domain);
                if (count < 5) {
                    result.add(opp.domain);
                    count++;
                }
            }
        }
        return result;
    }, [companiesMap]);

    const uniqueStatuses = useMemo(() => {
        return Array.from(new Set(campaigns.map(c => c.status)));
    }, [campaigns]);

    const filteredCampaigns = useMemo(() => {
        return campaigns.filter(c => {
            if (productFilter !== 'all' && String(c.target_product_id) !== productFilter) return false;
            if (statusFilter !== 'all' && c.status !== statusFilter) return false;
            return true;
        });
    }, [campaigns, productFilter, statusFilter]);

    function computePipelineValue(companies: MembershipRead[]): number {
        return companies.reduce((sum, o) => {
            const employees = o.employee_count || 0;
            if (employees > 10000) return sum + 500000;
            if (employees > 1000) return sum + 150000;
            if (employees > 100) return sum + 50000;
            return sum + 15000;
        }, 0);
    }

    if (loading) {
        return (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        );
    }

    return (
      <div className='flex-1'>
        <div className="max-w-[1600px] mx-auto px-8 py-8">
          <h2 className='font-bold text-3xl mb-8'>Campaigns</h2>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-4">
            <FilterIcon size={16} />
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="appearance-none px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Products</option>
              {products.map(p => (
                <option key={p.id} value={String(p.id)}>{p.name}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              {uniqueStatuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Campaign Cards Grid */}
          {filteredCampaigns.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400">No campaigns match the selected filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCampaigns.map(campaign => {
                const companies = companiesMap.get(campaign.id) || [];
                const product = campaign.target_product_id ? productLookup.get(campaign.target_product_id) : undefined;
                return (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    product={product}
                    companies={companies}
                    pipelineValue={computePipelineValue(companies)}
                    newOpportunities={companies.filter(c => newDomains.has(c.domain))}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
}
