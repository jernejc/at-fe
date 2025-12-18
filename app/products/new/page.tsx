'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createProduct } from '@/lib/api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Header } from '@/components/ui/Header';

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [formErrors, setFormErrors] = useState<{ name?: string }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!name.trim()) {
            setFormErrors({ name: 'Product name is required' });
            return;
        }

        setLoading(true);
        setError(null);
        setFormErrors({});

        try {
            await createProduct({
                name: name,
                description: description || null,
                category: category || null,
                interest_weights: [],
                event_weights: [],
                value_props: {},
                common_objections: [],
                discovery_questions: [],
            });
            router.push('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create product');
            console.error('Error creating product:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900/10">
            <Header />

            <div className="max-w-2xl mx-auto px-6 py-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 pl-0 hover:bg-transparent hover:text-blue-600"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Accounts
                </Button>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                            Add New Product
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Create a new product to start tracking fit scores for your accounts.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {error && (
                            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Product Name
                                </label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Enterprise CRM"
                                    className="bg-white dark:bg-slate-950"
                                />
                                {formErrors.name && (
                                    <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Category / Group
                                </label>
                                <Input
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="e.g. sales_tools"
                                    className="bg-white dark:bg-slate-950"
                                />
                                <p className="mt-1 text-xs text-slate-500">
                                    Optional. Use a category ID to group products (e.g. 'gen_ai', 'database').
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="flex w-full rounded-md border border-input bg-white dark:bg-slate-950 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Brief description of the product..."
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
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
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Create Product
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
