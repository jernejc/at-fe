'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createCampaign, getCompanies, getPartners, bulkAssignPartners, suggestPartnersForCompanies } from '@/lib/api';
import type { CampaignFilterUI, ProductSummary, Partner, CompanyFilters, CompanySummary, CompanySummaryWithFit, PartnerSuggestion, WSCompanyResult, WSPartnerSuggestion } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import {
    Check,
    ChevronRight,
    Loader2,
    Building2,
    MapPin,
    X,
    ArrowLeft,
    Sparkles,
    Users,
    User,
    Package,
    Briefcase,
    Cpu,
    ShoppingBag,
    Wand2,
    MousePointerClick,
    Clock,
    Zap,
    Globe,
    Target,
    Award,
} from 'lucide-react';
import { CompanyRowCompact } from './CompanyRowCompact';
import { AccountDetail } from '@/components/accounts';
import { useAgenticSearch } from '@/hooks/useAgenticSearch';
import { SearchPhaseIndicator } from './SearchPhaseIndicator';
import { InterpretationCard } from './InterpretationCard';
import { SearchInsightsPanel } from './SearchInsightsPanel';

interface CampaignCreateWizardProps {
    products: ProductSummary[];
    preselectedProductId?: number | null;
}

type ConversationStep = 
    | 'welcome' 
    | 'product' 
    | 'name' 
    | 'audience' 
    | 'preview' 
    | 'partners' 
    | 'review' 
    | 'creating';

interface Message {
    id: string;
    type: 'system' | 'user';
    content: React.ReactNode;
    timestamp: Date;
}

// Typing indicator component with polished bounce animation
function TypingIndicator() {
    return (
        <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-100 dark:bg-slate-800/50 rounded-2xl rounded-tl-md w-fit">
            <motion.div
                className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500"
                animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0 }}
            />
            <motion.div
                className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500"
                animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
            />
            <motion.div
                className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500"
                animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            />
        </div>
    );
}

// Enhanced animation variants
const messageVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    show: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { 
            type: "spring", 
            stiffness: 400, 
            damping: 30,
            duration: 0.4 
        } 
    },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
};

const avatarVariants = {
    hidden: { scale: 0, rotate: -180 },
    show: { 
        scale: 1, 
        rotate: 0,
        transition: { 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.1 
        } 
    }
};

// System message component with enhanced animations
function SystemMessage({ children, showAvatar = true }: { children: React.ReactNode; showAvatar?: boolean }) {
    // Only show bubble background for actual messages (with avatar), not for interactive content
    const hasBubble = showAvatar;
    
    return (
        <motion.div
            variants={messageVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="flex gap-3 max-w-2xl"
        >
            {showAvatar && (
                <motion.div variants={avatarVariants} initial="hidden" animate="show">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    </div>
                </motion.div>
            )}
            <motion.div 
                className={cn(
                    "flex-1",
                    hasBubble && "bg-white dark:bg-slate-800/60 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-slate-100 dark:border-slate-700/50",
                    !showAvatar && "ml-11"
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.3 }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
}

// User message component with slide-in animation
function UserMessage({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="flex gap-3 justify-end"
        >
            <div className="bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2.5 rounded-2xl rounded-br-md shadow-sm">
                <span className="text-sm font-medium">{children}</span>
            </div>
            <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-200 dark:to-slate-300 border border-slate-500 dark:border-slate-400 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-200 dark:text-slate-600" />
            </div>
        </motion.div>
    );
}

function filtersToCompanyFilters(filters: CampaignFilterUI[], productId?: number | null): CompanyFilters {
    const companyFilters: CompanyFilters = { 
        page: 1, 
        page_size: 20,
        sort_by: 'combined_score',
        sort_order: 'desc'
    };
    if (productId) companyFilters.product_id = productId;

    for (const filter of filters) {
        switch (filter.type) {
            case 'industry': companyFilters.industry = filter.value; break;
            case 'country': companyFilters.country = filter.value; break;
            case 'size_min': companyFilters.min_employees = parseInt(filter.value) || undefined; break;
            case 'size_max': companyFilters.max_employees = parseInt(filter.value) || undefined; break;
            case 'fit_min': companyFilters.min_fit_score = parseInt(filter.value) || undefined; break;
        }
    }
    return companyFilters;
}

export function CampaignCreateWizard({ products, preselectedProductId }: CampaignCreateWizardProps) {
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);
    
    // Conversation state
    const [currentStep, setCurrentStep] = useState<ConversationStep>('welcome');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Campaign data
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [showDescription, setShowDescription] = useState(false);
    const [productId, setProductId] = useState<number | null>(preselectedProductId || null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<CampaignFilterUI[]>([]);
    const [activeFilterType, setActiveFilterType] = useState<string | null>(null);
    const [filterInputValue, setFilterInputValue] = useState('');

    // Preview data
    const [previewCompanies, setPreviewCompanies] = useState<(CompanySummary | CompanySummaryWithFit)[]>([]);
    const [previewTotal, setPreviewTotal] = useState<number>(0);
    const [loadingPreview, setLoadingPreview] = useState(false);

    // Account detail
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // Partners
    const [partners, setPartners] = useState<Partner[]>([]);
    const [suggestedPartners, setSuggestedPartners] = useState<PartnerSuggestion[]>([]);
    const [loadingPartners, setLoadingPartners] = useState(false);
    const [selectedPartnerIds, setSelectedPartnerIds] = useState<Set<string>>(new Set());
    const [assignmentMode, setAssignmentMode] = useState<'auto' | 'manual' | 'skip'>('auto');

    // Agentic search
    const [useAgenticMode, setUseAgenticMode] = useState(true);
    const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
    
    const {
        state: agenticState,
        search: triggerAgenticSearch,
        reset: resetAgenticSearch,
        isSearching: isAgenticSearching,
    } = useAgenticSearch({
        onComplete: (state) => {
            // Normalize score: if > 1, it's already 0-100; if <= 1, multiply by 100
            const normalizeScore = (score: number) => score > 1 ? Math.round(score) : Math.round(score * 100);

            // Convert WS companies to preview format
            const wsCompanies: (CompanySummary | CompanySummaryWithFit)[] = state.companies.map(c => ({
                id: c.company_id,
                domain: c.domain,
                name: c.name,
                description: c.description,
                industry: c.industry || null,
                logo_base64: c.logo_base64 || null,
                employee_count: c.employee_count || null,
                combined_score: normalizeScore(c.match_score),
            }));
            setPreviewCompanies(wsCompanies);
            setPreviewTotal(state.totalResults);

            // Convert WS partner suggestions
            if (state.partnerSuggestions.length > 0) {
                const wsSuggestions: PartnerSuggestion[] = state.partnerSuggestions.map(s => ({
                    partner: {
                        id: s.partner_id,
                        name: s.name,
                        slug: s.slug,
                        description: s.description,
                        status: 'active' as const,
                        logo_url: s.logo_url || null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                    match_score: normalizeScore(s.match_score),
                    match_reasons: s.matched_interests.map(i => i.reasoning).filter(Boolean),
                    industry_overlap: s.matched_interests.map(i => i.interest),
                }));
                setSuggestedPartners(wsSuggestions);

                // Auto-select top 3
                if (wsSuggestions.length > 0) {
                    const topIds = wsSuggestions.slice(0, 3).map(s => s.partner.slug || String(s.partner.id));
                    setSelectedPartnerIds(new Set(topIds));
                }
            }
        },
    });

    const selectedProduct = products.find(p => p.id === productId);
    const hasAudience = searchQuery.trim() || filters.length > 0;
    
    // Derived state for agentic search
    const isAgenticPhaseActive = agenticState.phase !== 'idle' && agenticState.phase !== 'complete' && agenticState.phase !== 'error';
    const hasAgenticResults = agenticState.companies.length > 0 || agenticState.phase === 'complete';


    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping, currentStep]);

    // Simulate typing delay then show content
    const addSystemMessage = useCallback((content: React.ReactNode, delay = 800) => {
        setIsTyping(true);
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                setIsTyping(false);
                setMessages(prev => [...prev, {
                    id: `msg-${Date.now()}`,
                    type: 'system',
                    content,
                    timestamp: new Date(),
                }]);
                resolve();
            }, delay);
        });
    }, []);

    const addUserMessage = useCallback((content: React.ReactNode) => {
        setMessages(prev => [...prev, {
            id: `msg-${Date.now()}`,
            type: 'user',
            content,
            timestamp: new Date(),
        }]);
    }, []);

    // Initialize conversation - use ref to prevent duplicate runs in StrictMode
    const hasInitialized = useRef(false);
    
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        
        const initConversation = async () => {
            await addSystemMessage(
                <div className="space-y-2">
                    <p className="text-slate-900 dark:text-white font-medium text-sm">
                        Let&apos;s create your campaign
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                        I&apos;ll help you define your target audience and find the best partners. This should only take a minute.
                    </p>
                </div>,
                600
            );
            setCurrentStep('product');
        };
        initConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch company preview - uses agentic search for NL queries, REST for filters
    const fetchCompanyPreview = useCallback(async () => {
        if (!hasAudience) {
            setPreviewCompanies([]);
            setPreviewTotal(0);
            resetAgenticSearch();
            return;
        }
        
        // Use agentic search for natural language queries
        if (useAgenticMode && searchQuery.trim()) {
            // Clear previous results when starting new search
            setPreviewCompanies([]);
            setPreviewTotal(0);
            triggerAgenticSearch(searchQuery, {
                entity_types: ['companies', 'partners'],
                limit: 20,
                include_partner_suggestions: true,
                partner_suggestion_limit: 5,
            });
            return;
        }
        
        // Fallback to REST API for filter-only queries
        setLoadingPreview(true);
        try {
            const result = await getCompanies(filtersToCompanyFilters(filters, productId));
            // Sort by fit score descending
            const sorted = [...result.items].sort((a, b) => {
                const scoreA = 'combined_score' in a ? (a.combined_score ?? 0) : 0;
                const scoreB = 'combined_score' in b ? (b.combined_score ?? 0) : 0;
                return scoreB - scoreA;
            });
            setPreviewCompanies(sorted);
            setPreviewTotal(result.total);
        } catch {
            setPreviewCompanies([]);
            setPreviewTotal(0);
        } finally {
            setLoadingPreview(false);
        }
    }, [filters, productId, hasAudience, useAgenticMode, searchQuery, triggerAgenticSearch, resetAgenticSearch]);

    // Debounced search trigger
    useEffect(() => {
        if (currentStep === 'audience' || currentStep === 'preview') {
            // Clear previous debounce
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
            }
            
            // Debounce the search
            searchDebounceRef.current = setTimeout(() => {
                fetchCompanyPreview();
            }, useAgenticMode && searchQuery.trim() ? 600 : 400);
            
            return () => {
                if (searchDebounceRef.current) {
                    clearTimeout(searchDebounceRef.current);
                }
            };
        }
    }, [filters, productId, currentStep, fetchCompanyPreview, searchQuery, useAgenticMode]);

    // Fetch partners on mount
    useEffect(() => {
        async function fetchPartners() {
            setLoadingPartners(true);
            try {
                const response = await getPartners({ page_size: 50 });
                const mappedPartners: Partner[] = response.items.map(p => ({
                    id: p.slug || String(p.id),
                    name: p.name,
                    type: 'consulting' as const,
                    description: p.description || '',
                    status: p.status === 'active' ? 'active' : 'inactive',
                    match_score: 90,
                    logo_url: p.logo_url || undefined,
                    capacity: undefined,
                    assigned_count: 0,
                    industries: [],
                }));
                setPartners(mappedPartners);
            } catch {
                setPartners([]);
            } finally {
                setLoadingPartners(false);
            }
        }
        fetchPartners();
    }, []);

    // Fetch partner suggestions when we have companies
    const fetchPartnerSuggestions = useCallback(async () => {
        if (previewCompanies.length === 0) return;
        
        setLoadingPartners(true);
        try {
            const domains = previewCompanies.slice(0, 20).map(c => c.domain);
            const suggestions = await suggestPartnersForCompanies(domains, 5);
            setSuggestedPartners(suggestions);
            
            // Auto-select top 3 suggested partners
            if (suggestions.length > 0) {
                const topPartnerIds = suggestions
                    .slice(0, 3)
                    .map(s => s.partner.slug || String(s.partner.id));
                setSelectedPartnerIds(new Set(topPartnerIds));
            }
        } catch {
            // If the API isn't available, use mock suggestions based on existing partners
            const mockSuggestions: PartnerSuggestion[] = partners.slice(0, 3).map((p, i) => ({
                partner: {
                    id: parseInt(p.id) || i + 1,
                    name: p.name,
                    slug: p.id,
                    description: p.description,
                    status: p.status,
                    logo_url: p.logo_url || null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                match_score: 95 - (i * 5),
                match_reasons: ['Industry expertise', 'Regional coverage', 'Past performance'],
                industry_overlap: ['Technology', 'SaaS'],
            }));
            setSuggestedPartners(mockSuggestions);
            
            if (mockSuggestions.length > 0) {
                const topIds = mockSuggestions.map(s => s.partner.slug || String(s.partner.id));
                setSelectedPartnerIds(new Set(topIds));
            }
        } finally {
            setLoadingPartners(false);
        }
    }, [previewCompanies, partners]);

    // Handle product selection
    const handleProductSelect = async (product: ProductSummary) => {
        setProductId(product.id);
        addUserMessage(
            <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>{product.name}</span>
            </div>
        );

        await addSystemMessage(
            <div className="space-y-2">
                <p className="text-slate-900 dark:text-white text-sm">
                    Great choice! Now, what would you like to call this campaign?
                </p>
            </div>,
            500
        );
        setCurrentStep('name');
    };

    // Handle name submission
    const handleNameSubmit = async () => {
        if (!name.trim()) return;
        
        addUserMessage(<span className="font-medium">{name}</span>);

        await addSystemMessage(
            <div className="space-y-2">
                <p className="text-slate-900 dark:text-white text-sm">
                    Perfect! Now let&apos;s define your target audience.
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Describe who you&apos;re looking for in natural language, or use filters to narrow down your search.
                </p>
            </div>,
            600
        );
        setCurrentStep('audience');
    };

    // Handle audience confirmation
    const handleAudienceConfirm = async () => {
        if (!hasAudience) return;

        const audienceDesc = searchQuery.trim() 
            ? searchQuery 
            : filters.map(f => f.displayLabel).join(', ');
        
        addUserMessage(
            <div className="space-y-1">
                <span className="font-medium">{audienceDesc}</span>
                <div className="text-sm opacity-80">
                    {previewTotal.toLocaleString()} companies
                </div>
            </div>
        );

        // Check if WebSocket search completed and if we have partner suggestions
        const wsSearchCompleted = agenticState.phase === 'complete';
        const hasWsSuggestions = suggestedPartners.length > 0;

        if (hasWsSuggestions) {
            // We have partners from WebSocket - go straight to partner selection
            await addSystemMessage(
                <div className="space-y-2">
                    <p className="text-slate-900 dark:text-white text-sm">
                        I&apos;ve found <span className="font-semibold">{suggestedPartners.length}</span> recommended partners for these {previewTotal.toLocaleString()} companies.
                    </p>
                </div>,
                500
            );
            setCurrentStep('partners');
        } else if (wsSearchCompleted && previewCompanies.length > 0) {
            // WebSocket completed but returned no partners - fall back to REST API
            await addSystemMessage(
                <div className="space-y-2">
                    <p className="text-slate-900 dark:text-white text-sm">
                        Finding the best partners for {previewTotal.toLocaleString()} companies...
                    </p>
                </div>,
                400
            );
            
            setCurrentStep('partners');
            
            // Fetch partner suggestions via REST API as fallback
            await fetchPartnerSuggestions();
        } else {
            // No WebSocket search or no companies yet - fetch partners normally
            await addSystemMessage(
                <div className="space-y-2">
                    <p className="text-slate-900 dark:text-white text-sm">
                        Finding the best partners for {previewTotal.toLocaleString()} companies...
                    </p>
                </div>,
                400
            );
            
            setCurrentStep('partners');
            
            // Fetch partner suggestions via REST API
            await fetchPartnerSuggestions();
        }
    };

    // Handle final creation
    const handleCreate = async () => {
        if (!name.trim() || !productId) return;
        setCreating(true);
        setError(null);
        setCurrentStep('creating');

        addUserMessage(
            <span>Create campaign with {selectedPartnerIds.size} partners</span>
        );

        await addSystemMessage(
            <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating your campaign...</span>
            </div>,
            300
        );

        const allFilters = searchQuery.trim()
            ? [{ id: 'search', type: 'natural_query' as const, value: searchQuery, displayLabel: searchQuery }, ...filters]
            : filters;

        try {
            const campaign = await createCampaign({
                name: name.trim(),
                description: description.trim() || undefined,
                target_product_id: productId,
                target_criteria: { filters: allFilters },
            });

            // Assign partners
            if (assignmentMode !== 'skip' && selectedPartnerIds.size > 0) {
                try {
                    const partnerResponse = await getPartners({ page_size: 100 });
                    const selectedIds = partnerResponse.items
                        .filter(p => selectedPartnerIds.has(p.slug || String(p.id)))
                        .map(p => p.id);
                    
                    if (selectedIds.length > 0) {
                        await bulkAssignPartners(campaign.slug, selectedIds);
                    }
                } catch (partnerErr) {
                    console.warn('Failed to assign partners:', partnerErr);
                }
            }

            await addSystemMessage(
                <div className="space-y-2">
                    <p className="text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <Check className="w-5 h-5 text-emerald-500" />
                        Campaign created successfully!
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                        Redirecting you to your new campaign...
                    </p>
                </div>,
                500
            );

            setTimeout(() => {
                router.push(`/campaigns/${campaign.slug}`);
            }, 1000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create campaign');
            setCreating(false);
            setCurrentStep('review');
        }
    };

    // Add filter helper
    const addFilter = (type: string, value: string) => {
        if (!value.trim()) return;
        const labels: Record<string, string> = {
            industry: 'Industry',
            country: 'Location',
            size_min: 'Min employees',
            size_max: 'Max employees',
            fit_min: 'Min fit score',
        };
        const newFilter: CampaignFilterUI = {
            id: `${type}-${Date.now()}`,
            type: type as CampaignFilterUI['type'],
            value: value.trim(),
            displayLabel: `${labels[type] || type}: ${value.trim()}`,
        };
        setFilters([...filters, newFilter]);
        setActiveFilterType(null);
        setFilterInputValue('');
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex flex-col">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/campaigns')}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>

                    {/* Progress indicator */}
                    <div className="flex items-center gap-1.5">
                        {['product', 'name', 'audience', 'partners', 'review'].map((step, index) => {
                            const steps: ConversationStep[] = ['product', 'name', 'audience', 'partners', 'review'];
                            const currentIndex = steps.indexOf(currentStep);
                            const isComplete = index < currentIndex || currentStep === 'creating';
                            const isCurrent = step === currentStep;

                            return (
                                <motion.div
                                    key={step}
                                    initial={false}
                                    animate={{
                                        width: isCurrent ? 24 : 8,
                                        backgroundColor: isComplete || isCurrent 
                                            ? 'var(--primary)' 
                                            : 'var(--muted)',
                                    }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    className="h-2 rounded-full"
                                />
                            );
                        })}
                    </div>

                    <div className="w-9" />
                </div>
            </div>

            {/* Conversation Area */}
            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <div ref={scrollRef} className="max-w-3xl mx-auto px-6 py-8 space-y-6">
                        {/* Rendered messages */}
                        <AnimatePresence mode="popLayout">
                            {messages.map((msg) => (
                                <div key={msg.id}>
                                    {msg.type === 'system' ? (
                                        <SystemMessage>{msg.content}</SystemMessage>
                                    ) : (
                                        <UserMessage>{msg.content}</UserMessage>
                                    )}
                                </div>
                            ))}
                        </AnimatePresence>

                        {/* Typing indicator */}
                        {isTyping && (
                            <SystemMessage>
                                <TypingIndicator />
                            </SystemMessage>
                        )}

                        {/* Interactive content based on current step */}
                        {!isTyping && (
                            <motion.div
                                key={currentStep}
                                variants={fadeInUp}
                                initial="hidden"
                                animate="show"
                                className="space-y-4"
                            >
                                {/* Product Selection */}
                                {currentStep === 'product' && (
                                    <SystemMessage showAvatar={false}>
                                        <div className="space-y-4">
                                            <motion.p 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                                className="text-sm text-slate-600 dark:text-slate-400"
                                            >
                                                Which product is this campaign for?
                                            </motion.p>
                                            <motion.div
                                                variants={staggerContainer}
                                                initial="hidden"
                                                animate="show"
                                                className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                                            >
                                                {products.map((product, index) => (
                                                    <motion.button
                                                        key={product.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ 
                                                            delay: 0.3 + (index * 0.08),
                                                            type: "spring",
                                                            stiffness: 400,
                                                            damping: 25
                                                        }}
                                                        onClick={() => handleProductSelect(product)}
                                                        className={cn(
                                                            "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                                            "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
                                                            "hover:border-primary hover:shadow-lg hover:shadow-primary/5",
                                                            productId === product.id && "border-primary ring-2 ring-primary/20"
                                                        )}
                                                    >
                                                        <div 
                                                            className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"
                                                        >
                                                            <Package className="w-5 h-5 text-primary" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-slate-900 dark:text-white text-sm truncate">
                                                                {product.name}
                                                            </div>
                                                            {product.category && (
                                                                <div className="text-xs text-slate-500 truncate">
                                                                    {product.category}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                                                    </motion.button>
                                                ))}
                                            </motion.div>
                                        </div>
                                    </SystemMessage>
                                )}

                                {/* Campaign Name Input */}
                                {currentStep === 'name' && (
                                    <SystemMessage showAvatar={false}>
                                        <motion.div
                                            className="space-y-4"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                                className="space-y-3"
                                            >
                                                <input
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && name.trim() && handleNameSubmit()}
                                                    placeholder="Campaign name"
                                                    autoFocus
                                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300/50 focus:border-slate-300 dark:focus:border-slate-600 transition-all duration-200"
                                                />
                                                
                                                {/* Description - shown on demand */}
                                                <AnimatePresence>
                                                    {showDescription ? (
                                                        <motion.textarea
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            value={description}
                                                            onChange={(e) => setDescription(e.target.value)}
                                                            placeholder="Add a description..."
                                                            rows={2}
                                                            autoFocus
                                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300/50 focus:border-slate-300 dark:focus:border-slate-600 transition-all duration-200 resize-none"
                                                        />
                                                    ) : (
                                                        <motion.button
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            onClick={() => setShowDescription(true)}
                                                            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center gap-1"
                                                        >
                                                            <span>+ Add description</span>
                                                        </motion.button>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.4 }}
                                            >
                                                <Button
                                                    size="lg"
                                                    onClick={handleNameSubmit}
                                                    disabled={!name.trim()}
                                                    className="w-full h-11 rounded-xl gap-2"
                                                >
                                                    Continue
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    </SystemMessage>
                                )}

                                {/* Audience Definition */}
                                {currentStep === 'audience' && (
                                    <SystemMessage showAvatar={false}>
                                        {/* AI Search - clean layout without extra container */}
                                        <motion.div 
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.15, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                            className="space-y-4"
                                        >
                                            {/* Search Input Section */}
                                            <div className="space-y-3">
                                                {/* Main search input */}
                                                <div className={cn(
                                                    "relative group rounded-xl transition-all duration-300",
                                                    isAgenticPhaseActive && "ring-2 ring-slate-300/50 dark:ring-slate-600/30"
                                                )}>
                                                    <div className={cn(
                                                        "absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200",
                                                        searchQuery.trim() ? "text-slate-600 dark:text-slate-300" : "text-slate-400"
                                                    )}>
                                                        <Sparkles className="w-4 h-4" />
                                                    </div>
                                                    <input
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        placeholder="Describe your ideal customer... e.g., B2B SaaS in healthcare"
                                                        autoFocus
                                                        className={cn(
                                                            "w-full h-12 pl-11 pr-4 rounded-xl text-sm transition-all duration-200",
                                                            "bg-white dark:bg-slate-800",
                                                            "border border-slate-200 dark:border-slate-700",
                                                            "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                                                            "focus:outline-none focus:ring-2 focus:ring-slate-300/50 focus:border-slate-300 dark:focus:border-slate-600",
                                                            "group-hover:border-slate-300 dark:group-hover:border-slate-600"
                                                        )}
                                                    />
                                                        {/* Inline status indicator */}
                                                        {isAgenticPhaseActive && (
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                                <SearchPhaseIndicator phase={agenticState.phase} showElapsedTime />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Filter chips row */}
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {/* Active filters */}
                                                        <AnimatePresence mode="popLayout">
                                                            {filters.map(f => (
                                                                <motion.span
                                                                    key={f.id}
                                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                                    transition={{ duration: 0.2 }}
                                                                    className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700"
                                                                >
                                                                    {f.displayLabel}
                                                                    <button
                                                                        onClick={() => setFilters(filters.filter(x => x.id !== f.id))}
                                                                        className="p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </motion.span>
                                                            ))}
                                                        </AnimatePresence>
                                                        
                                                        {/* Filter buttons */}
                                                        {['industry', 'location', 'size_min'].map(type => {
                                                            const config: Record<string, { label: string; icon: React.ReactNode; placeholder: string; suggestions?: string[] }> = {
                                                                industry: { 
                                                                    label: 'Industry', 
                                                                    icon: <Building2 className="w-3.5 h-3.5" />, 
                                                                    placeholder: 'e.g., Technology',
                                                                    suggestions: ['Technology', 'Healthcare', 'Financial Services', 'Manufacturing', 'Retail']
                                                                },
                                                                location: { 
                                                                    label: 'Location', 
                                                                    icon: <MapPin className="w-3.5 h-3.5" />, 
                                                                    placeholder: 'e.g., United States',
                                                                    suggestions: ['United States', 'United Kingdom', 'Germany', 'Canada', 'Australia']
                                                                },
                                                                size_min: { 
                                                                    label: 'Size', 
                                                                    icon: <Users className="w-3.5 h-3.5" />, 
                                                                    placeholder: 'Min employees',
                                                                    suggestions: ['50', '100', '500', '1000']
                                                                },
                                                            };
                                                            const c = config[type];
                                                            const isActive = activeFilterType === type;
                                                            const hasFilter = filters.some(f => f.type === type || (type === 'location' && f.type === 'country'));

                                                            if (hasFilter) return null;

                                                            return (
                                                                <div key={type} className="relative">
                                                                    <button
                                                                        onClick={() => setActiveFilterType(isActive ? null : type)}
                                                                        className={cn(
                                                                            "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                                                                            isActive
                                                                                ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                                                                                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
                                                                        )}
                                                                    >
                                                                        {c.icon}
                                                                        {c.label}
                                                                    </button>

                                                                    {isActive && (
                                                                        <>
                                                                            <div className="fixed inset-0 z-40" onClick={() => { setActiveFilterType(null); setFilterInputValue(''); }} />
                                                                            <motion.div 
                                                                                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                                                className="absolute z-50 top-full left-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 min-w-[220px]"
                                                                            >
                                                                                {/* Quick suggestions */}
                                                                                <div className="flex flex-wrap gap-1.5 mb-3">
                                                                                {c.suggestions?.map((suggestion) => (
                                                                                    <button
                                                                                        key={suggestion}
                                                                                        onClick={() => addFilter(type === 'location' ? 'country' : type, suggestion)}
                                                                                        className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                                                                                    >
                                                                                        {type === 'size_min' ? `${suggestion}+` : suggestion}
                                                                                    </button>
                                                                                ))}
                                                                                </div>
                                                                                
                                                                                {/* Custom input */}
                                                                                <div className="flex gap-2">
                                                                                    <input
                                                                                        autoFocus
                                                                                        value={filterInputValue}
                                                                                        onChange={(e) => setFilterInputValue(e.target.value)}
                                                                                        onKeyDown={(e) => {
                                                                                            if (e.key === 'Enter' && filterInputValue.trim()) {
                                                                                                addFilter(type === 'location' ? 'country' : type, filterInputValue);
                                                                                            }
                                                                                            if (e.key === 'Escape') {
                                                                                                setActiveFilterType(null);
                                                                                                setFilterInputValue('');
                                                                                            }
                                                                                        }}
                                                                                        placeholder={c.placeholder}
                                                                                        className="flex-1 h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300/50 focus:border-slate-300 dark:focus:border-slate-600 transition-all duration-200"
                                                                                    />
                                                                                    <Button
                                                                                        size="sm"
                                                                                        onClick={() => addFilter(type === 'location' ? 'country' : type, filterInputValue)}
                                                                                        disabled={!filterInputValue.trim()}
                                                                                        className="h-8 px-3 text-xs rounded-lg"
                                                                                    >
                                                                                        Add
                                                                                    </Button>
                                                                                </div>
                                                                            </motion.div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* AI Interpretation - integrated styling */}
                                                <AnimatePresence mode="wait">
                                                    {useAgenticMode && searchQuery.trim() && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                        >
                                                            <InterpretationCard
                                                                interpretation={agenticState.interpretation}
                                                                isLoading={agenticState.phase === 'interpreting' || agenticState.phase === 'connecting'}
                                                            />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {/* Results Section */}
                                                <AnimatePresence mode="wait">
                                                    {hasAudience && (previewCompanies.length > 0 || agenticState.companies.length > 0 || isAgenticSearching) && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 8 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -8 }}
                                                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                                                        >
                                                            <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/40 backdrop-blur-sm overflow-hidden">
                                                                {/* Results Header */}
                                                                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100/80 dark:border-slate-700/30 bg-slate-50/50 dark:bg-slate-800/30">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                                                                            <Building2 className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                                                                        </div>
                                                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                                            Matching Companies
                                                                        </span>
                                                                    </div>
                                                                    <AnimatePresence mode="wait">
                                                                        {(loadingPreview || isAgenticSearching) ? (
                                                                            <motion.div
                                                                                key="loading"
                                                                                initial={{ opacity: 0 }}
                                                                                animate={{ opacity: 1 }}
                                                                                exit={{ opacity: 0 }}
                                                                                className="flex items-center gap-2 text-xs"
                                                                            >
                                                                                <div className="flex items-center gap-0.5">
                                                                                    {[0, 1, 2].map((i) => (
                                                                                        <motion.div
                                                                                            key={i}
                                                                                            className="w-1 h-1 rounded-full bg-blue-400"
                                                                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                                                                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }}
                                                                                        />
                                                                                    ))}
                                                                                </div>
                                                                                {isAgenticSearching && agenticState.companies.length > 0 && (
                                                                                    <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                                                                                        {agenticState.companies.length} found
                                                                                    </span>
                                                                                )}
                                                                            </motion.div>
                                                                        ) : (
                                                                            <motion.div
                                                                                key="count"
                                                                                initial={{ opacity: 0 }}
                                                                                animate={{ opacity: 1 }}
                                                                                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium"
                                                                            >
                                                                                <span className="tabular-nums">{previewTotal.toLocaleString()}</span>
                                                                                <span className="text-emerald-500/70 dark:text-emerald-500/50">matches</span>
                                                                            </motion.div>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </div>

                                                                {/* Results list with reveal animation */}
                                                                <div className="divide-y divide-slate-100/80 dark:divide-slate-700/30 max-h-[220px] overflow-y-auto">
                                                                    {isAgenticSearching && agenticState.companies.length > 0 ? (
                                                                        agenticState.companies.slice(0, 5).map((company, idx) => (
                                                                            <motion.div
                                                                                key={company.domain}
                                                                                initial={{ opacity: 0, x: -12 }}
                                                                                animate={{ opacity: 1, x: 0 }}
                                                                                transition={{ duration: 0.25, delay: idx * 0.05, ease: [0.23, 1, 0.32, 1] }}
                                                                            >
                                                                                <CompanyRowCompact
                                                                                    name={company.name}
                                                                                    domain={company.domain}
                                                                                    industry={company.industry}
                                                                                    fitScore={company.match_score > 1 ? company.match_score / 100 : company.match_score}
                                                                                    logoBase64={company.logo_base64}
                                                                                    logoUrl={!company.logo_base64 ? `https://www.google.com/s2/favicons?domain=${company.domain}&sz=64` : undefined}
                                                                                    onClick={() => { setSelectedDomain(company.domain); setDetailOpen(true); }}
                                                                                    className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                                                                />
                                                                            </motion.div>
                                                                        ))
                                                                    ) : previewCompanies.slice(0, 5).map((company, idx) => (
                                                                        <motion.div
                                                                            key={company.domain}
                                                                            initial={{ opacity: 0 }}
                                                                            animate={{ opacity: 1 }}
                                                                            transition={{ delay: idx * 0.03 }}
                                                                        >
                                                                            <CompanyRowCompact
                                                                                name={company.name}
                                                                                domain={company.domain}
                                                                                industry={company.industry}
                                                                                fitScore={'combined_score' in company ? company.combined_score : null}
                                                                                logoBase64={company.logo_base64}
                                                                                onClick={() => { setSelectedDomain(company.domain); setDetailOpen(true); }}
                                                                                className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                                                            />
                                                                        </motion.div>
                                                                    ))}

                                                                    {/* Empty state */}
                                                                    {previewCompanies.length === 0 && !loadingPreview && !isAgenticSearching && agenticState.companies.length === 0 && (
                                                                        <div className="px-4 py-10 text-center">
                                                                            <Building2 className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                                                No companies match your criteria yet
                                                                            </p>
                                                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                                                Try adjusting your search or filters
                                                                            </p>
                                                                        </div>
                                                                    )}

                                                                    {/* Enhanced loading skeleton */}
                                                                    {isAgenticSearching && agenticState.companies.length === 0 && (
                                                                        <div className="p-4 space-y-3">
                                                                            {[1, 2, 3].map((i) => (
                                                                                <motion.div
                                                                                    key={i}
                                                                                    className="flex items-center gap-3"
                                                                                    initial={{ opacity: 0, x: -8 }}
                                                                                    animate={{ opacity: 1, x: 0 }}
                                                                                    transition={{ delay: i * 0.1, duration: 0.3 }}
                                                                                >
                                                                                    <motion.div
                                                                                        className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700"
                                                                                        animate={{ opacity: [0.5, 0.8, 0.5] }}
                                                                                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                                                                                    />
                                                                                    <div className="flex-1 space-y-2">
                                                                                        <motion.div
                                                                                            className="h-3.5 rounded-md bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700"
                                                                                            style={{ width: `${55 + i * 12}%` }}
                                                                                            animate={{ opacity: [0.5, 0.8, 0.5] }}
                                                                                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                                                                                        />
                                                                                        <motion.div
                                                                                            className="h-2.5 rounded-md bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 w-1/3"
                                                                                            animate={{ opacity: [0.4, 0.6, 0.4] }}
                                                                                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                                                                                        />
                                                                                    </div>
                                                                                    <motion.div
                                                                                        className="w-10 h-5 rounded-md bg-slate-100 dark:bg-slate-800"
                                                                                        animate={{ opacity: [0.4, 0.7, 0.4] }}
                                                                                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                                                                    />
                                                                                </motion.div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {/* AI Insights Panel - integrated with container */}
                                                <AnimatePresence mode="wait">
                                                    {agenticState.phase === 'complete' && (agenticState.insights || agenticState.suggestedQueries.length > 0) && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                        >
                                                            <SearchInsightsPanel
                                                                insights={agenticState.insights}
                                                                suggestedQueries={agenticState.suggestedQueries}
                                                                refinementTips={agenticState.refinementTips}
                                                                interestSummary={agenticState.interestSummary}
                                                                searchTimeMs={agenticState.searchTimeMs}
                                                                totalResults={agenticState.totalResults}
                                                                onQueryClick={(query) => {
                                                                    setSearchQuery(query);
                                                                    setTimeout(() => triggerAgenticSearch(query), 100);
                                                                }}
                                                            />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                            {/* Continue button */}
                                            <AnimatePresence>
                                                {hasAudience && previewTotal > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 10 }}
                                                        transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 28 }}
                                                    >
                                                        <motion.div
                                                            whileHover={{ scale: 1.01, y: -1 }}
                                                            whileTap={{ scale: 0.99 }}
                                                        >
                                                            <Button
                                                                size="lg"
                                                                onClick={handleAudienceConfirm}
                                                                className="w-full h-12 rounded-xl gap-2 font-medium"
                                                            >
                                                                <motion.span
                                                                    key={previewTotal}
                                                                    initial={{ opacity: 0, y: 8 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                                                >
                                                                    Continue with {previewTotal.toLocaleString()} companies
                                                                </motion.span>
                                                                <ChevronRight className="w-4 h-4" />
                                                            </Button>
                                                        </motion.div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    </SystemMessage>
                                )}

                                {/* Partner Selection */}
                                {(currentStep === 'partners' || currentStep === 'review') && (
                                    <SystemMessage showAvatar={false}>
                                        <div className="space-y-4">
                                            {/* Suggested partners */}
                                            {loadingPartners ? (
                                                <motion.div 
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="flex flex-col items-center justify-center py-10 gap-3"
                                                >
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    >
                                                        <Loader2 className="w-8 h-8 text-primary" />
                                                    </motion.div>
                                                    <motion.p
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.5 }}
                                                        className="text-sm text-slate-500 dark:text-slate-400"
                                                    >
                                                        Analyzing best partner matches...
                                                    </motion.p>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    variants={staggerContainer}
                                                    initial="hidden"
                                                    animate="show"
                                                    className="space-y-2"
                                                >
                                                    {/* Show suggested partners first with match info */}
                                                    {suggestedPartners.length > 0 && (
                                                        <div className="mb-6">
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <Sparkles className="w-4 h-4 text-primary" />
                                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                                    AI Recommended
                                                                </span>
                                                            </div>
                                                            <div className="space-y-3">
                                                            {suggestedPartners.map((suggestion, index) => {
                                                                const partner = suggestion.partner;
                                                                const isSelected = selectedPartnerIds.has(partner.slug || String(partner.id));
                                                                // Check if this came from WebSocket with detailed matching
                                                                const wsMatch = agenticState.partnerSuggestions.find(s => s.partner_id === partner.id);
                                                                const hasDetailedMatch = wsMatch && wsMatch.matched_interests && wsMatch.matched_interests.length > 0;
                                                                
                                                                return (
                                                                    <motion.button
                                                                        key={partner.id}
                                                                        initial={{ opacity: 0, x: -20 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ 
                                                                            delay: 0.1 + (index * 0.1),
                                                                            type: "spring",
                                                                            stiffness: 400,
                                                                            damping: 25
                                                                        }}
                                                                        whileHover={{ scale: 1.01, x: 4 }}
                                                                        whileTap={{ scale: 0.99 }}
                                                                        onClick={() => {
                                                                            const next = new Set(selectedPartnerIds);
                                                                            const key = partner.slug || String(partner.id);
                                                                            if (isSelected) next.delete(key);
                                                                            else next.add(key);
                                                                            setSelectedPartnerIds(next);
                                                                        }}
                                                                        className={cn(
                                                                            "w-full rounded-xl border p-4 text-left transition-all",
                                                                            isSelected
                                                                                ? "bg-white dark:bg-slate-900 border-primary ring-2 ring-primary/20"
                                                                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                                                        )}
                                                                    >
                                                                        <div className="flex items-start gap-3">
                                                                            <motion.div 
                                                                                className={cn(
                                                                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 mt-0.5",
                                                                                    isSelected
                                                                                        ? "bg-primary border-primary"
                                                                                        : "border-slate-300 dark:border-slate-600"
                                                                                )}
                                                                                animate={{ scale: isSelected ? [1, 1.2, 1] : 1 }}
                                                                                transition={{ duration: 0.2 }}
                                                                            >
                                                                                <AnimatePresence>
                                                                                    {isSelected && (
                                                                                        <motion.div
                                                                                            initial={{ scale: 0 }}
                                                                                            animate={{ scale: 1 }}
                                                                                            exit={{ scale: 0 }}
                                                                                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                                                                        >
                                                                                            <Check className="w-3 h-3 text-white" />
                                                                                        </motion.div>
                                                                                    )}
                                                                                </AnimatePresence>
                                                                            </motion.div>
                                                                            
                                                                            <div className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                                                                                {partner.logo_url ? (
                                                                                    <img src={partner.logo_url} alt="" className="w-6 h-6 object-contain" />
                                                                                ) : (
                                                                                    <span className="text-sm font-bold text-slate-500">
                                                                                        {partner.name.charAt(0)}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-center justify-between mb-1">
                                                                                    <div className="font-medium text-slate-900 dark:text-white text-sm">
                                                                                        {partner.name}
                                                                                    </div>
                                                                                    <motion.div 
                                                                                        className="shrink-0 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold"
                                                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                                                        animate={{ scale: 1, opacity: 1 }}
                                                                                        transition={{ delay: 0.2 + (index * 0.1), type: "spring", stiffness: 400, damping: 20 }}
                                                                                    >
                                                                                        {suggestion.match_score}%
                                                                                    </motion.div>
                                                                                </div>
                                                                                
                                                                                {/* Match reasons */}
                                                                                <div className="text-xs text-slate-500 mb-2">
                                                                                    {suggestion.match_reasons.slice(0, 2).join(' • ')}
                                                                                </div>
                                                                                
                                                                                {/* Enhanced matching info from WebSocket */}
                                                                                {hasDetailedMatch && wsMatch && (
                                                                                    <div className="space-y-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                                                                        {/* Interest Coverage Bar */}
                                                                                        {wsMatch.interest_coverage > 0 && (
                                                                                            <div className="flex items-center gap-2">
                                                                                                <span className="text-xs text-slate-400 whitespace-nowrap">Coverage</span>
                                                                                                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                                                    <motion.div
                                                                                                        initial={{ width: 0 }}
                                                                                                        animate={{ width: `${Math.min(wsMatch.interest_coverage * 100, 100)}%` }}
                                                                                                        transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                                                                                                        className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full"
                                                                                                    />
                                                                                                </div>
                                                                                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                                                                                    {Math.round(wsMatch.interest_coverage * 100)}%
                                                                                                </span>
                                                                                            </div>
                                                                                        )}
                                                                                        
                                                                                        {/* Matched Interests */}
                                                                                        <div className="flex flex-wrap gap-1">
                                                                                            {wsMatch.matched_interests.slice(0, 3).map((mi, i) => (
                                                                                                <span
                                                                                                    key={mi.interest}
                                                                                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-primary/10 text-primary"
                                                                                                >
                                                                                                    <Target className="w-2.5 h-2.5" />
                                                                                                    {mi.interest.replace(/_/g, ' ')}
                                                                                                </span>
                                                                                            ))}
                                                                                        </div>
                                                                                        
                                                                                        {/* Certifications */}
                                                                                        {wsMatch.matched_interests.some(mi => mi.certifications?.length > 0) && (
                                                                                            <div className="flex flex-wrap gap-1">
                                                                                                {wsMatch.matched_interests
                                                                                                    .flatMap(mi => mi.certifications || [])
                                                                                                    .filter((v, i, a) => a.indexOf(v) === i)
                                                                                                    .slice(0, 4)
                                                                                                    .map((cert) => (
                                                                                                        <span
                                                                                                            key={cert}
                                                                                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                                                                                                        >
                                                                                                            <Award className="w-2.5 h-2.5" />
                                                                                                            {cert}
                                                                                                        </span>
                                                                                                    ))}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </motion.button>
                                                                );
                                                            })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Other partners */}
                                                    {partners.length > 0 && (
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <Globe className="w-4 h-4 text-slate-400" />
                                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                                    All Partners
                                                                </span>
                                                            </div>
                                                            <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-1">
                                                                {partners
                                                                    .filter(p => !suggestedPartners.some(s => (s.partner.slug || String(s.partner.id)) === p.id))
                                                                    .map((partner) => {
                                                                        const isSelected = selectedPartnerIds.has(partner.id);
                                                                        const TypeIcon = partner.type === 'consulting' ? Briefcase : partner.type === 'technology' ? Cpu : ShoppingBag;

                                                                        return (
                                                                            <motion.button
                                                                                key={partner.id}
                                                                                variants={fadeInUp}
                                                                                onClick={() => {
                                                                                    const next = new Set(selectedPartnerIds);
                                                                                    if (isSelected) next.delete(partner.id);
                                                                                    else next.add(partner.id);
                                                                                    setSelectedPartnerIds(next);
                                                                                }}
                                                                                className={cn(
                                                                                    "w-full rounded-lg border p-3 text-left transition-all",
                                                                                    isSelected
                                                                                        ? "bg-slate-50 dark:bg-slate-800/50 border-primary/50"
                                                                                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                                                                )}
                                                                            >
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className={cn(
                                                                                        "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0",
                                                                                        isSelected
                                                                                            ? "bg-primary border-primary"
                                                                                            : "border-slate-300 dark:border-slate-600"
                                                                                    )}>
                                                                                        {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                                                                                    </div>
                                                                                    
                                                                                    <div className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                                                        {partner.logo_url ? (
                                                                                            <img src={partner.logo_url} alt="" className="w-5 h-5 object-contain" />
                                                                                        ) : (
                                                                                            <span className="text-xs font-bold text-slate-500">
                                                                                                {partner.name.charAt(0)}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <div className="font-medium text-sm text-slate-900 dark:text-white">
                                                                                            {partner.name}
                                                                                        </div>
                                                                                    </div>

                                                                                    <Badge variant="secondary" className="text-xs">
                                                                                        <TypeIcon className="w-3 h-3 mr-1" />
                                                                                        {partner.type}
                                                                                    </Badge>
                                                                                </div>
                                                                            </motion.button>
                                                                        );
                                                                    })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Empty state - no partners available */}
                                                    {suggestedPartners.length === 0 && partners.length === 0 && (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="py-8 text-center"
                                                        >
                                                            <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                                No partners available yet
                                                            </p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                                                You can skip this step and assign partners later
                                                            </p>
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            )}

                                            {/* Distribution mode */}
                                            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                                    How should we distribute companies?
                                                </p>
                                                <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-full">
                                                    {[
                                                        { id: 'auto', label: 'Auto-assign', icon: Wand2 },
                                                        { id: 'manual', label: 'Manual', icon: MousePointerClick },
                                                        { id: 'skip', label: 'Later', icon: Clock },
                                                    ].map(mode => {
                                                        const isSelected = assignmentMode === mode.id;
                                                        const Icon = mode.icon;
                                                        return (
                                                            <button
                                                                key={mode.id}
                                                                onClick={() => setAssignmentMode(mode.id as 'auto' | 'manual' | 'skip')}
                                                                className={cn(
                                                                    "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all",
                                                                    isSelected
                                                                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                                                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                                                                )}
                                                            >
                                                                <Icon className="w-3.5 h-3.5" />
                                                                {mode.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Error display */}
                                            {error && (
                                                <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-400">
                                                    {error}
                                                </div>
                                            )}

                                            {/* Create button */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4, type: "spring", stiffness: 400, damping: 25 }}
                                            >
                                                <motion.div
                                                    whileHover={{ scale: creating ? 1 : 1.01 }}
                                                    whileTap={{ scale: creating ? 1 : 0.99 }}
                                                >
                                                    <Button
                                                        size="lg"
                                                        onClick={handleCreate}
                                                        disabled={creating || (assignmentMode !== 'skip' && selectedPartnerIds.size === 0)}
                                                        className="w-full h-11 rounded-xl gap-2"
                                                    >
                                                        {creating ? (
                                                            <>
                                                                <motion.div
                                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                                                    animate={{ x: ['-100%', '100%'] }}
                                                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                                                />
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            </>
                                                        ) : (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </motion.div>
                                                        )}
                                                        Create Campaign
                                                    </Button>
                                                </motion.div>
                                            </motion.div>
                                        </div>
                                    </SystemMessage>
                                )}
                            </motion.div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Account Detail Sheet */}
            {selectedDomain && (
                <AccountDetail domain={selectedDomain} open={detailOpen} onClose={() => setDetailOpen(false)} />
            )}
        </div>
    );
}
