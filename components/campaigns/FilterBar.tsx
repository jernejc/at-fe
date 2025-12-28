'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Plus, Search, Building2, Users, MapPin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CampaignFilterUI, CampaignFilterType } from '@/lib/schemas';

interface FilterBarProps {
    filters: CampaignFilterUI[];
    onFiltersChange: (filters: CampaignFilterUI[]) => void;
    disabled?: boolean;
}

const FILTER_OPTIONS: { type: CampaignFilterType; label: string; icon: React.ReactNode; placeholder: string }[] = [
    { type: 'natural_query', label: 'Search', icon: <Search className="w-4 h-4" />, placeholder: 'e.g., "B2B SaaS companies"' },
    { type: 'industry', label: 'Industry', icon: <Building2 className="w-4 h-4" />, placeholder: 'e.g., Technology' },
    { type: 'size_min', label: 'Min Employees', icon: <Users className="w-4 h-4" />, placeholder: 'e.g., 100' },
    { type: 'size_max', label: 'Max Employees', icon: <Users className="w-4 h-4" />, placeholder: 'e.g., 5000' },
    { type: 'country', label: 'Country', icon: <MapPin className="w-4 h-4" />, placeholder: 'e.g., United States' },
    { type: 'domain_list', label: 'Domains', icon: <Globe className="w-4 h-4" />, placeholder: 'e.g., acme.com, example.com' },
];

function getFilterIcon(type: CampaignFilterType) {
    switch (type) {
        case 'natural_query': return <Search className="w-3.5 h-3.5" />;
        case 'industry': return <Building2 className="w-3.5 h-3.5" />;
        case 'size_min':
        case 'size_max': return <Users className="w-3.5 h-3.5" />;
        case 'country': return <MapPin className="w-3.5 h-3.5" />;
        case 'domain_list': return <Globe className="w-3.5 h-3.5" />;
        default: return null;
    }
}

function getFilterTypeLabel(type: CampaignFilterType): string {
    switch (type) {
        case 'natural_query': return 'Search';
        case 'industry': return 'Industry';
        case 'size_min': return 'Min Size';
        case 'size_max': return 'Max Size';
        case 'country': return 'Country';
        case 'domain_list': return 'Domains';
        default: return type;
    }
}

export function FilterBar({ filters, onFiltersChange, disabled }: FilterBarProps) {
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [addingFilterType, setAddingFilterType] = useState<CampaignFilterType | null>(null);
    const [newFilterValue, setNewFilterValue] = useState('');
    const menuRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowAddMenu(false);
                setAddingFilterType(null);
                setNewFilterValue('');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus input when adding filter
    useEffect(() => {
        if (addingFilterType && inputRef.current) {
            inputRef.current.focus();
        }
    }, [addingFilterType]);

    const handleRemoveFilter = (filterId: string) => {
        if (disabled) return;
        const updated = filters.filter(f => f.id !== filterId);
        onFiltersChange(updated);
    };

    const handleSelectFilterType = (type: CampaignFilterType) => {
        setAddingFilterType(type);
        setNewFilterValue('');
    };

    const handleAddFilter = () => {
        if (!addingFilterType || !newFilterValue.trim()) return;

        const newFilter: CampaignFilterUI = {
            id: `${addingFilterType}-${Date.now()}`,
            type: addingFilterType,
            value: newFilterValue.trim(),
            displayLabel: `${getFilterTypeLabel(addingFilterType)}: ${newFilterValue.trim()}`,
        };

        onFiltersChange([...filters, newFilter]);
        setShowAddMenu(false);
        setAddingFilterType(null);
        setNewFilterValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newFilterValue.trim()) {
            e.preventDefault();
            handleAddFilter();
        } else if (e.key === 'Escape') {
            setShowAddMenu(false);
            setAddingFilterType(null);
            setNewFilterValue('');
        }
    };

    const currentOption = FILTER_OPTIONS.find(opt => opt.type === addingFilterType);

    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* Existing Filters */}
            {filters.map((filter) => (
                <div
                    key={filter.id}
                    className="inline-flex items-center gap-1.5 h-8 pl-2.5 pr-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                    <span className="text-slate-400 dark:text-slate-500">
                        {getFilterIcon(filter.type)}
                    </span>
                    <span className="max-w-[200px] truncate">
                        {filter.value}
                    </span>
                    {!disabled && (
                        <button
                            onClick={() => handleRemoveFilter(filter.id)}
                            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            ))}

            {/* Add Filter Button & Dropdown */}
            {!disabled && (
                <div className="relative" ref={menuRef}>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setShowAddMenu(!showAddMenu);
                            setAddingFilterType(null);
                            setNewFilterValue('');
                        }}
                        className="h-8 gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 border-dashed"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Filter
                    </Button>

                    {/* Dropdown Menu */}
                    {showAddMenu && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                            {!addingFilterType ? (
                                // Filter Type Selection
                                <div className="py-1">
                                    <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                        Filter Type
                                    </div>
                                    {FILTER_OPTIONS.map((option) => (
                                        <button
                                            key={option.type}
                                            onClick={() => handleSelectFilterType(option.type)}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                        >
                                            <span className="text-slate-400">{option.icon}</span>
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                // Value Input
                                <div className="p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <button
                                            onClick={() => setAddingFilterType(null)}
                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {currentOption?.label}
                                        </span>
                                    </div>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={newFilterValue}
                                        onChange={(e) => setNewFilterValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={currentOption?.placeholder}
                                        className="w-full h-9 px-3 text-sm rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <div className="flex justify-end gap-2 mt-3">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setShowAddMenu(false);
                                                setAddingFilterType(null);
                                                setNewFilterValue('');
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleAddFilter}
                                            disabled={!newFilterValue.trim()}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {filters.length === 0 && disabled && (
                <span className="text-sm text-slate-400">No filters applied</span>
            )}
        </div>
    );
}
