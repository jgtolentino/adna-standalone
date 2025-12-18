/**
 * Data Quality Module Exports
 * Centralized export for data validation, freshness, and quality utilities
 */

export {
  checkDataFreshness,
  isDataFresh,
  getFreshnessMetadata,
  FRESHNESS_SLAS,
  type FreshnessReport,
} from './freshness';

export {
  // Schemas
  TransactionSchema,
  KPISummarySchema,
  TrendRowSchema,
  ProductMixRowSchema,
  GeoRegionSchema,
  NLQQuerySchema,

  // Types
  type Transaction,
  type KPISummary,
  type TrendRow,
  type ProductMixRow,
  type GeoRegion,
  type NLQQuery,
  type ValidationResult,

  // Utilities
  validateData,
  validateArray,
  createPartialSchema,
  sanitizeString,
  detectAnomalies,
  detectMissingDates,
} from './validation';
