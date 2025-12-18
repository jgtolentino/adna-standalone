/**
 * Data Validation Layer
 * Schema validation for API responses and data integrity
 */

import { z } from 'zod';
import { logStructured } from '@/lib/observability';

// ============================================================================
// SCHEMA DEFINITIONS
// ============================================================================

/**
 * Transaction schema - matches scout.transactions table
 */
export const TransactionSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime().or(z.string()), // Allow ISO string
  store_id: z.string(),
  region_code: z.string(),
  province: z.string(),
  city: z.string(),
  brand_name: z.string(),
  product_category: z.string(),
  quantity: z.number().int().positive(),
  unit_price: z.number().nonnegative(),
  gross_amount: z.number().nonnegative(),
  net_amount: z.number().nonnegative(),
  payment_method: z.enum(['cash', 'gcash', 'maya', 'card', 'other']),
});

export type Transaction = z.infer<typeof TransactionSchema>;

/**
 * KPI Summary schema - matches scout_stats_summary view
 */
export const KPISummarySchema = z.object({
  total_transactions: z.number().int().nonnegative(),
  total_revenue: z.number().nonnegative(),
  avg_basket_value: z.number().nonnegative(),
  active_stores: z.number().int().nonnegative(),
  unique_customers: z.number().int().nonnegative(),
  total_brands: z.number().int().nonnegative(),
  total_skus: z.number().int().nonnegative(),
  total_categories: z.number().int().nonnegative(),
});

export type KPISummary = z.infer<typeof KPISummarySchema>;

/**
 * Transaction trend row schema
 */
export const TrendRowSchema = z.object({
  tx_date: z.string(),
  tx_count: z.number().int().nonnegative(),
  total_revenue: z.number().nonnegative(),
  avg_basket_value: z.number().nonnegative(),
});

export type TrendRow = z.infer<typeof TrendRowSchema>;

/**
 * Product mix row schema
 */
export const ProductMixRowSchema = z.object({
  product_category: z.string(),
  tx_count: z.number().int().nonnegative(),
  revenue: z.number().nonnegative(),
  units_sold: z.number().int().nonnegative(),
});

export type ProductMixRow = z.infer<typeof ProductMixRowSchema>;

/**
 * Geographic region schema
 */
export const GeoRegionSchema = z.object({
  region_code: z.string(),
  region_name: z.string(),
  stores_count: z.number().int().nonnegative(),
  tx_count: z.number().int().nonnegative(),
  revenue: z.number().nonnegative(),
});

export type GeoRegion = z.infer<typeof GeoRegionSchema>;

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Result of a validation operation
 */
export type ValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; errors: string[] };

/**
 * Validate data against a schema
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);

    logStructured('data_validation_failed', {
      component: 'validation',
      action: 'validate',
      context,
      errorCount: errors.length,
      errors: errors.slice(0, 5), // Limit logged errors
    }, 'warn');

    return { valid: false, errors };
  }

  return { valid: true, data: result.data };
}

/**
 * Validate an array of items, returning valid items and logging invalid ones
 */
export function validateArray<T>(
  schema: z.ZodSchema<T>,
  data: unknown[],
  context: string
): { valid: T[]; invalid: number } {
  const valid: T[] = [];
  let invalid = 0;

  for (const item of data) {
    const result = schema.safeParse(item);
    if (result.success) {
      valid.push(result.data);
    } else {
      invalid++;
    }
  }

  if (invalid > 0) {
    logStructured('data_validation_partial', {
      component: 'validation',
      action: 'validate_array',
      context,
      totalItems: data.length,
      validItems: valid.length,
      invalidItems: invalid,
    }, 'warn');
  }

  return { valid, invalid };
}

/**
 * Create a partial schema for optional fields
 */
export function createPartialSchema<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
): z.ZodObject<{ [K in keyof T]: z.ZodOptional<T[K]> }> {
  return schema.partial();
}

/**
 * Sanitize string input (prevent XSS, SQL injection patterns)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/['";]/g, '') // Remove SQL injection characters
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Validate and sanitize NLQ query input
 */
export const NLQQuerySchema = z.object({
  query: z
    .string()
    .min(1, 'Query cannot be empty')
    .max(500, 'Query too long')
    .transform(sanitizeString),
  userId: z.string().uuid().optional(),
  context: z.record(z.unknown()).optional(),
});

export type NLQQuery = z.infer<typeof NLQQuerySchema>;

// ============================================================================
// DATA INTEGRITY CHECKS
// ============================================================================

/**
 * Check for data anomalies (sudden spikes, zeros, etc.)
 */
export function detectAnomalies(
  values: number[],
  options: {
    minSamples?: number;
    zScoreThreshold?: number;
  } = {}
): { index: number; value: number; zscore: number }[] {
  const { minSamples = 10, zScoreThreshold = 3 } = options;

  if (values.length < minSamples) {
    return [];
  }

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) {
    return [];
  }

  const anomalies: { index: number; value: number; zscore: number }[] = [];

  values.forEach((value, index) => {
    const zscore = Math.abs((value - mean) / stdDev);
    if (zscore > zScoreThreshold) {
      anomalies.push({ index, value, zscore: Math.round(zscore * 100) / 100 });
    }
  });

  return anomalies;
}

/**
 * Check for missing data in a time series
 */
export function detectMissingDates(
  dates: string[],
  expectedFrequency: 'daily' | 'weekly' = 'daily'
): string[] {
  if (dates.length < 2) {
    return [];
  }

  const sortedDates = [...dates].sort();
  const missing: string[] = [];
  const interval = expectedFrequency === 'daily' ? 1 : 7;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);

    if (diffDays > interval) {
      // Generate missing dates
      for (let d = 1; d < diffDays; d += interval) {
        const missingDate = new Date(prev);
        missingDate.setDate(missingDate.getDate() + d);
        missing.push(missingDate.toISOString().split('T')[0]);
      }
    }
  }

  return missing;
}
