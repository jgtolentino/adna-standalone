/**
 * Scout Dashboard Export Client
 *
 * Handles CSV/JSON export downloads from /api/export/* endpoints
 * with automatic filter parameter conversion and file download trigger.
 */

import type { ScoutFilters } from '@/types/scout';

export type ExportRoute = 'trends' | 'product-mix' | 'geography';
export type ExportFormat = 'csv' | 'json' | 'xlsx';
export type ProductMixType = 'category' | 'brand';

export interface ExportOptions {
  route: ExportRoute;
  filters: ScoutFilters;
  format?: ExportFormat;
  type?: ProductMixType; // For product-mix exports only
}

/**
 * Convert ScoutFilters to URL search params for export API
 */
function filtersToParams(filters: ScoutFilters): URLSearchParams {
  const params = new URLSearchParams();

  // Date range
  if (filters.dateRange) {
    params.set('start', filters.dateRange.start);
    params.set('end', filters.dateRange.end);
  }

  // Region codes
  if (filters.regionCodes && filters.regionCodes.length > 0) {
    params.set('regions', filters.regionCodes.join(','));
  }

  // Product categories
  if (filters.productCategories && filters.productCategories.length > 0) {
    params.set('categories', filters.productCategories.join(','));
  }

  // Brand names
  if (filters.brandNames && filters.brandNames.length > 0) {
    params.set('brands', filters.brandNames.join(','));
  }

  return params;
}

/**
 * Trigger file download for CSV/JSON export
 *
 * @param options Export configuration
 * @returns Promise that resolves when download is triggered
 *
 * @example
 * ```ts
 * const { filters } = useGlobalFilters();
 * await exportScoutData({
 *   route: 'trends',
 *   filters,
 *   format: 'csv'
 * });
 * ```
 */
export async function exportScoutData(options: ExportOptions): Promise<void> {
  const { route, filters, format = 'csv', type } = options;

  // Build URL
  const baseUrl = `/api/export/${route}`;
  const params = filtersToParams(filters);
  params.set('format', format);

  if (type && route === 'product-mix') {
    params.set('type', type);
  }

  const url = `${baseUrl}?${params.toString()}`;

  // Trigger download
  try {
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Export failed' }));
      throw new Error(error.error || `Export failed with status ${response.status}`);
    }

    // For CSV, trigger file download
    if (format === 'csv') {
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
      link.download = filenameMatch?.[1] || `scout_${route}_export.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    }

    // For JSON, open in new tab
    if (format === 'json') {
      const data = await response.json();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `scout_${route}_export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    }
  } catch (error) {
    console.error('[exportScoutData]', error);
    throw error;
  }
}

/**
 * Hook wrapper for export with loading state
 *
 * @example
 * ```tsx
 * const { exportData, isExporting } = useExport();
 *
 * <button
 *   onClick={() => exportData({ route: 'trends', filters, format: 'csv' })}
 *   disabled={isExporting}
 * >
 *   {isExporting ? 'Exporting...' : 'Export CSV'}
 * </button>
 * ```
 */
import { useState } from 'react';

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = async (options: ExportOptions) => {
    setIsExporting(true);
    setError(null);

    try {
      await exportScoutData(options);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed';
      setError(message);
      throw err;
    } finally {
      setIsExporting(false);
    }
  };

  return { exportData, isExporting, error };
}
