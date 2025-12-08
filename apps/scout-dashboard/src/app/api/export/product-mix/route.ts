/**
 * Product Mix Export API
 *
 * Exports product category and brand performance data in CSV/XLSX/JSON format
 * Respects filter query parameters for date range, region, category, brand
 *
 * Query Parameters:
 * - format: csv | xlsx | json (default: csv)
 * - type: category | brand (default: category)
 * - period: last7days | last30days | last90days | last365days | custom
 * - start: YYYY-MM-DD (for custom period)
 * - end: YYYY-MM-DD (for custom period)
 * - regions: comma-separated region codes
 * - categories: comma-separated product categories
 * - brands: comma-separated brand names
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSchema } from '@/lib/supabaseClient';
import type { ScoutFilters } from '@/types/scout';

// Date range preset helper
function getDateRangeFromPreset(preset: string): { start: string; end: string } {
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
    default:
      return { start: end, end };
  }
}

// Parse filters from URL search params
function parseFiltersFromURL(searchParams: URLSearchParams): Partial<ScoutFilters> {
  const filters: Partial<ScoutFilters> = {};

  const preset = searchParams.get('period');
  if (preset) {
    filters.dateRange = getDateRangeFromPreset(preset);
  }

  const startDate = searchParams.get('start');
  const endDate = searchParams.get('end');
  if (startDate && endDate) {
    filters.dateRange = { start: startDate, end: endDate };
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

// CSV converter
function toCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(header => {
      const value = row[header];
      // Escape values containing commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'csv';
    const type = searchParams.get('type') || 'category';
    const filters = parseFiltersFromURL(searchParams);

    // Choose view based on type
    const viewName = type === 'brand' ? 'v_brand_performance' : 'v_product_mix';
    const orderColumn = 'revenue';

    // Fetch data from Supabase
    const supabase = getSupabaseSchema('scout');
    let query = supabase
      .from(viewName)
      .select('*')
      .order(orderColumn, { ascending: false });

    // Apply filters
    if (filters.dateRange) {
      query = query
        .gte('tx_date', filters.dateRange.start)
        .lte('tx_date', filters.dateRange.end);
    }

    if (filters.regionCodes && filters.regionCodes.length > 0) {
      query = query.in('region_code', filters.regionCodes);
    }

    if (filters.productCategories && filters.productCategories.length > 0) {
      query = query.in('product_category', filters.productCategories);
    }

    if (filters.brandNames && filters.brandNames.length > 0) {
      query = query.in('brand_name', filters.brandNames);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Return in requested format
    switch (format) {
      case 'json':
        return NextResponse.json(data);

      case 'csv': {
        const csv = toCSV(data || []);
        const filename = type === 'brand'
          ? `brand_performance_export_${new Date().toISOString().split('T')[0]}.csv`
          : `product_mix_export_${new Date().toISOString().split('T')[0]}.csv`;

        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }

      case 'xlsx':
        // XLSX would require a library like xlsx or exceljs
        // For now, return JSON with note
        return NextResponse.json({
          message: 'XLSX format not yet implemented. Use CSV or JSON.',
          data,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid format. Use csv, xlsx, or json.' },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error('[API /api/export/product-mix]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Export failed' },
      { status: 500 }
    );
  }
}
