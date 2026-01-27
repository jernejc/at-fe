'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { FilterIcon, Loader2 } from 'lucide-react';
import { PartnerPortalHeader } from '@/components/partner/PartnerPortalHeader';
import { CampaignRow } from '@/components/partner/CampaignRow';
import { getCampaigns, getCampaignCompanies, getProducts } from '@/lib/api';
import type { CampaignSummary, MembershipRead, ProductSummary } from '@/lib/schemas';

export default function PartnerPage() {
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

    const allOpportunities = useMemo(() => {
        const all: MembershipRead[] = [];
        companiesMap.forEach(companies => all.push(...companies));
        return all;
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
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <div className="px-6 pt-8 pb-6 max-w-[1600px] mx-auto w-full">
            <PartnerPortalHeader
              partner={null}
              opportunities={allOpportunities}
              campaigns={campaigns}
              newOpportunitiesCount={0}
              hidePartnerInfo={true}
            />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-4">
          <h2 className='font-medium text-lg'>Campaigns</h2>
          {/* Filters */}
          <div className="flex items-center gap-4">
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

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <div className="col-span-4">Campaign Name</div>
            <div className="col-span-2">Pipeline Value</div>
            <div className="col-span-2"># Companies</div>
            <div className="col-span-2">Deadline</div>
            <div className="col-span-2">Status</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-2">
            {filteredCampaigns.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                <p className="text-slate-500 dark:text-slate-400">No campaigns match the selected filters.</p>
              </div>
            ) : (
              filteredCampaigns.map(campaign => {
                const companies = companiesMap.get(campaign.id) || [];
                const product = campaign.target_product_id ? productLookup.get(campaign.target_product_id) : undefined;
                return (
                  <CampaignRow
                    key={campaign.id}
                    campaign={campaign}
                    productName={product?.name || null}
                    companies={companies}
                    pipelineValue={computePipelineValue(companies)}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    );
}
