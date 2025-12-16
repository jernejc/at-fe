'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { createCampaign } from '@/lib/api';
import type { CampaignCreate } from '@/lib/schemas';
import { ArrowLeft, Loader2 } from 'lucide-react';

function NewCampaignContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get pre-selected domains from URL query params
    const domainsParam = searchParams.get('domains');
    const [domains, setDomains] = useState<string[]>(
        domainsParam ? domainsParam.split(',').filter(d => d.trim()) : []
    );

    const [formData, setFormData] = useState<CampaignCreate>({
        name: '',
        description: '',
        owner: '',
        tags: [],
        domains: domains,
    });

    // Update domains when URL param changes
    useEffect(() => {
        if (domainsParam) {
            const domainList = domainsParam.split(',').filter(d => d.trim());
            setDomains(domainList);
            setFormData(prev => ({ ...prev, domains: domainList }));
        }
    }, [domainsParam]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const campaign = await createCampaign({
                ...formData,
                domains: domains,
            });

            // Redirect to the newly created campaign
            router.push(`/campaigns/${campaign.slug}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create campaign');
            console.error('Error creating campaign:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-border">
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4 -ml-2"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-3xl font-bold">Create New Campaign</h1>
                    <p className="text-muted-foreground mt-2">
                        Organize and manage a collection of target accounts
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info Card */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Campaign Details</h2>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Campaign Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Q1 Enterprise Targets"
                                    required
                                    className="mt-1.5"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the purpose and goals of this campaign..."
                                    rows={3}
                                    className="mt-1.5"
                                />
                            </div>

                            <div>
                                <Label htmlFor="owner">Owner</Label>
                                <Input
                                    id="owner"
                                    value={formData.owner || ''}
                                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                                    placeholder="Campaign owner or team"
                                    className="mt-1.5"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Companies Card */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Companies
                            {domains.length > 0 && (
                                <span className="ml-2 text-sm font-normal text-muted-foreground">
                                    ({domains.length} selected)
                                </span>
                            )}
                        </h2>

                        {domains.length > 0 ? (
                            <div className="space-y-3">
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Selected accounts from your list:
                                    </p>
                                    <div className="flex flex-wrap gap-2 max-h-48 overflow-auto">
                                        {domains.map((domain, index) => (
                                            <div
                                                key={index}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-border rounded-md text-sm"
                                            >
                                                <span className="font-medium">{domain}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setDomains(domains.filter((_, i) => i !== index))}
                                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground">
                                    You can add more companies after creating the campaign
                                </p>
                            </div>
                        ) : (
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 text-center">
                                <p className="text-muted-foreground">
                                    No companies selected. You can add companies after creating the campaign.
                                </p>
                            </div>
                        )}
                    </Card>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !formData.name}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Campaign'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <div className="bg-white dark:bg-slate-900 border-b border-border">
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <div className="h-10 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
                    <div className="h-9 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-5 w-96 bg-slate-200 dark:bg-slate-700 rounded mt-2 animate-pulse" />
                </div>
            </div>
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="h-64 bg-white dark:bg-slate-800 rounded-lg animate-pulse" />
            </div>
        </div>
    );
}

export default function NewCampaignPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <NewCampaignContent />
        </Suspense>
    );
}
