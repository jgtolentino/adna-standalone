'use client';

/**
 * Scout Dashboard Global Filter Context
 * Provides URL-synced filter state across all pages
 */

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { ScoutFilters } from '@/types/scout';

// ============================================================================
// TYPES
// ============================================================================

export type DateRangePreset = 'today' | 'last7days' | 'last30days' | 'last90days' | 'last365days' | 'custom';

export interface GlobalFilters extends ScoutFilters {
  dateRangePreset: DateRangePreset;
}

interface FilterContextValue {
  filters: GlobalFilters;
  setFilters: (filters: Partial<GlobalFilters>) => void;
  resetFilters: () => void;
  isFiltersActive: boolean;
}

// ============================================================================
// DEFAULTS
// ============================================================================

const DEFAULT_FILTERS: GlobalFilters = {
  dateRangePreset: 'last30days',
  dateRange: undefined,
  regionCodes: [],
  productCategories: [],
  brandNames: [],
};

// ============================================================================
// CONTEXT
// ============================================================================

const FilterContext = createContext<FilterContextValue | undefined>(undefined);

// ============================================================================
// HELPERS
// ============================================================================

function getDateRangeFromPreset(preset: DateRangePreset): { start: string; end: string } | undefined {
  const today = new Date();
  const end = today.toISOString().split('T')[0];

  switch (preset) {
    case 'today':
      return { start: end, end };
    case 'last7days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 7);
      return { start: start.toISOString().split('T')[0], end };
    }
    case 'last30days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 30);
      return { start: start.toISOString().split('T')[0], end };
    }
    case 'last90days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 90);
      return { start: start.toISOString().split('T')[0], end };
    }
    case 'last365days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 365);
      return { start: start.toISOString().split('T')[0], end };
    }
    case 'custom':
      return undefined;
    default:
      return undefined;
  }
}

function parseFiltersFromURL(searchParams: URLSearchParams): Partial<GlobalFilters> {
  const filters: Partial<GlobalFilters> = {};

  const preset = searchParams.get('period') as DateRangePreset | null;
  if (preset) {
    filters.dateRangePreset = preset;
    filters.dateRange = getDateRangeFromPreset(preset);
  }

  const startDate = searchParams.get('start');
  const endDate = searchParams.get('end');
  if (startDate && endDate) {
    filters.dateRange = { start: startDate, end: endDate };
    filters.dateRangePreset = 'custom';
  }

  const regions = searchParams.get('regions');
  if (regions) {
    filters.regionCodes = regions.split(',').filter(Boolean);
  }

  const categories = searchParams.get('categories');
  if (categories) {
    filters.productCategories = categories.split(',').filter(Boolean);
  }

  const brands = searchParams.get('brands');
  if (brands) {
    filters.brandNames = brands.split(',').filter(Boolean);
  }

  return filters;
}

function serializeFiltersToURL(filters: GlobalFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.dateRangePreset && filters.dateRangePreset !== 'last30days') {
    params.set('period', filters.dateRangePreset);
  }

  if (filters.dateRangePreset === 'custom' && filters.dateRange) {
    params.set('start', filters.dateRange.start);
    params.set('end', filters.dateRange.end);
  }

  if (filters.regionCodes && filters.regionCodes.length > 0) {
    params.set('regions', filters.regionCodes.join(','));
  }

  if (filters.productCategories && filters.productCategories.length > 0) {
    params.set('categories', filters.productCategories.join(','));
  }

  if (filters.brandNames && filters.brandNames.length > 0) {
    params.set('brands', filters.brandNames.join(','));
  }

  return params;
}

// ============================================================================
// PROVIDER
// ============================================================================

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize filters from URL or defaults
  const [filters, setFiltersState] = useState<GlobalFilters>(() => {
    const urlFilters = parseFiltersFromURL(searchParams);
    return {
      ...DEFAULT_FILTERS,
      ...urlFilters,
      dateRange: urlFilters.dateRange || getDateRangeFromPreset(urlFilters.dateRangePreset || 'last30days'),
    };
  });

  // Sync URL when filters change
  useEffect(() => {
    const newParams = serializeFiltersToURL(filters);
    const newSearch = newParams.toString();
    const currentSearch = searchParams.toString();

    // Only update if params actually changed
    if (newSearch !== currentSearch) {
      const newUrl = newSearch ? `${pathname}?${newSearch}` : pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [filters, pathname, router, searchParams]);

  // Update filters partially
  const setFilters = useCallback((newFilters: Partial<GlobalFilters>) => {
    setFiltersState(prev => {
      const updated = { ...prev, ...newFilters };

      // Auto-compute dateRange when preset changes
      if (newFilters.dateRangePreset && newFilters.dateRangePreset !== 'custom') {
        updated.dateRange = getDateRangeFromPreset(newFilters.dateRangePreset);
      }

      return updated;
    });
  }, []);

  // Reset to defaults
  const resetFilters = useCallback(() => {
    setFiltersState({
      ...DEFAULT_FILTERS,
      dateRange: getDateRangeFromPreset('last30days'),
    });
  }, []);

  // Check if any filters are active (non-default)
  const isFiltersActive: boolean = Boolean(
    filters.dateRangePreset !== 'last30days' ||
    (filters.regionCodes && filters.regionCodes.length > 0) ||
    (filters.productCategories && filters.productCategories.length > 0) ||
    (filters.brandNames && filters.brandNames.length > 0)
  );

  const value: FilterContextValue = {
    filters,
    setFilters,
    resetFilters,
    isFiltersActive,
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useGlobalFilters(): FilterContextValue {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useGlobalFilters must be used within a FilterProvider');
  }
  return context;
}

// Re-export helper for use in hooks
export { getDateRangeFromPreset };
