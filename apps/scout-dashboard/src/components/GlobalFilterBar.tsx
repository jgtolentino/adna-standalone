'use client';

/**
 * Global Filter Bar Component
 * Displays and controls global filters with URL sync
 */

import { useGlobalFilters, DateRangePreset } from '@/contexts/FilterContext';
import { Calendar, MapPin, Package, Tag, X, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSupabaseSchema, isSupabaseConfigured } from '@/lib/supabaseClient';

interface FilterOption {
  value: string;
  label: string;
}

// Date range presets
const DATE_RANGE_OPTIONS: FilterOption[] = [
  { value: 'today', label: 'Today' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'last90days', label: 'Last 90 Days' },
  { value: 'last365days', label: 'Last Year' },
];

// Philippine region groupings
const REGION_GROUPS: FilterOption[] = [
  { value: 'NCR', label: 'Metro Manila (NCR)' },
  { value: 'CAR', label: 'CAR' },
  { value: 'I', label: 'Ilocos Region' },
  { value: 'II', label: 'Cagayan Valley' },
  { value: 'III', label: 'Central Luzon' },
  { value: 'IV-A', label: 'CALABARZON' },
  { value: 'IV-B', label: 'MIMAROPA' },
  { value: 'V', label: 'Bicol Region' },
  { value: 'VI', label: 'Western Visayas' },
  { value: 'VII', label: 'Central Visayas' },
  { value: 'VIII', label: 'Eastern Visayas' },
  { value: 'IX', label: 'Zamboanga Peninsula' },
  { value: 'X', label: 'Northern Mindanao' },
  { value: 'XI', label: 'Davao Region' },
  { value: 'XII', label: 'SOCCSKSARGEN' },
  { value: 'XIII', label: 'Caraga' },
  { value: 'BARMM', label: 'BARMM' },
];

export function GlobalFilterBar() {
  const { filters, setFilters, resetFilters, isFiltersActive } = useGlobalFilters();
  const [categories, setCategories] = useState<FilterOption[]>([]);
  const [brands, setBrands] = useState<FilterOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Fetch unique categories and brands from database
  useEffect(() => {
    async function fetchFilterOptions() {
      if (!isSupabaseConfigured()) {
        setLoadingOptions(false);
        return;
      }

      try {
        const supabase = getSupabaseSchema('scout');

        // Fetch unique categories
        const { data: catData } = await supabase
          .from('v_product_mix')
          .select('product_category');

        if (catData) {
          setCategories(
            catData.map(c => ({
              value: c.product_category,
              label: c.product_category,
            }))
          );
        }

        // Fetch top brands (limit for performance)
        const { data: brandData } = await supabase
          .from('v_brand_performance')
          .select('brand_name, tbwa_client_brand')
          .order('revenue', { ascending: false })
          .limit(30);

        if (brandData) {
          setBrands(
            brandData.map(b => ({
              value: b.brand_name,
              label: b.tbwa_client_brand ? `${b.brand_name} (TBWA)` : b.brand_name,
            }))
          );
        }
      } catch (err) {
        console.error('[GlobalFilterBar] Failed to fetch options:', err);
      } finally {
        setLoadingOptions(false);
      }
    }

    fetchFilterOptions();
  }, []);

  const handleDateRangeChange = (preset: DateRangePreset) => {
    setFilters({ dateRangePreset: preset });
  };

  const handleRegionToggle = (regionCode: string) => {
    const current = filters.regionCodes || [];
    const updated = current.includes(regionCode)
      ? current.filter(r => r !== regionCode)
      : [...current, regionCode];
    setFilters({ regionCodes: updated });
  };

  const handleCategoryToggle = (category: string) => {
    const current = filters.productCategories || [];
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    setFilters({ productCategories: updated });
  };

  const handleBrandToggle = (brand: string) => {
    const current = filters.brandNames || [];
    const updated = current.includes(brand)
      ? current.filter(b => b !== brand)
      : [...current, brand];
    setFilters({ brandNames: updated });
  };

  const activeFilterCount =
    (filters.regionCodes?.length || 0) +
    (filters.productCategories?.length || 0) +
    (filters.brandNames?.length || 0) +
    (filters.dateRangePreset !== 'last30days' ? 1 : 0);

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Icon & Label */}
          <div className="flex items-center gap-2 text-gray-500">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                {activeFilterCount}
              </span>
            )}
          </div>

          <div className="h-6 w-px bg-gray-300" />

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={filters.dateRangePreset}
              onChange={(e) => handleDateRangeChange(e.target.value as DateRangePreset)}
              className="block w-36 rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 py-1.5"
            >
              {DATE_RANGE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Region Dropdown */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <select
              value={(filters.regionCodes && filters.regionCodes[0]) || ''}
              onChange={(e) => {
                if (e.target.value === '') {
                  setFilters({ regionCodes: [] });
                } else {
                  handleRegionToggle(e.target.value);
                }
              }}
              className="block w-40 rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 py-1.5"
            >
              <option value="">All Regions</option>
              {REGION_GROUPS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-400" />
            <select
              value={(filters.productCategories && filters.productCategories[0]) || ''}
              onChange={(e) => {
                if (e.target.value === '') {
                  setFilters({ productCategories: [] });
                } else {
                  setFilters({ productCategories: [e.target.value] });
                }
              }}
              className="block w-36 rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 py-1.5"
              disabled={loadingOptions || categories.length === 0}
            >
              <option value="">All Categories</option>
              {categories.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Dropdown */}
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-400" />
            <select
              value={(filters.brandNames && filters.brandNames[0]) || ''}
              onChange={(e) => {
                if (e.target.value === '') {
                  setFilters({ brandNames: [] });
                } else {
                  setFilters({ brandNames: [e.target.value] });
                }
              }}
              className="block w-36 rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 py-1.5"
              disabled={loadingOptions || brands.length === 0}
            >
              <option value="">All Brands</option>
              {brands.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {isFiltersActive && (
            <>
              <div className="h-6 w-px bg-gray-300" />
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            </>
          )}
        </div>

        {/* Active Filter Pills */}
        {isFiltersActive && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
            {filters.dateRangePreset !== 'last30days' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Calendar className="h-3 w-3" />
                {DATE_RANGE_OPTIONS.find(o => o.value === filters.dateRangePreset)?.label}
                <button
                  onClick={() => setFilters({ dateRangePreset: 'last30days' })}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.regionCodes?.map(code => (
              <span key={code} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <MapPin className="h-3 w-3" />
                {REGION_GROUPS.find(r => r.value === code)?.label || code}
                <button
                  onClick={() => handleRegionToggle(code)}
                  className="ml-1 hover:text-green-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {filters.productCategories?.map(cat => (
              <span key={cat} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <Package className="h-3 w-3" />
                {cat}
                <button
                  onClick={() => handleCategoryToggle(cat)}
                  className="ml-1 hover:text-purple-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {filters.brandNames?.map(brand => (
              <span key={brand} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                <Tag className="h-3 w-3" />
                {brand.length > 20 ? brand.slice(0, 20) + '...' : brand}
                <button
                  onClick={() => handleBrandToggle(brand)}
                  className="ml-1 hover:text-orange-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
