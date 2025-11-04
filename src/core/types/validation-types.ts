/* eslint-disable max-lines */
/**
 * Unified Validation Result Interface
 *
 * Provides a consistent validation result structure across all algorithms
 * in the Reynard algorithms package. This replaces the various validation
 * result types (FlowFieldValidationResult, MinimumBoundingBoxValidationResult, etc.)
 * with a single, comprehensive interface.
 *
 * @module algorithms/validationTypes
 * @file algorithms/validationTypes
 */

/**
 * Severity levels for validation messages
 */
export enum ValidationSeverity {
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
  DEBUG = "debug",
}

/**
 * Individual validation message
 */
export interface ValidationMessage {
  /** Unique identifier for the message */
  id: string;
  /** Severity level */
  severity: ValidationSeverity;
  /** Human-readable message */
  message: string;
  /** Optional field path for structured data */
  field?: string;
  /** Optional additional context */
  context?: Record<string, unknown>;
  /** Optional suggested fix */
  suggestion?: string;
}

/**
 * Detailed validation results for specific components
 */
export interface DetailedValidationResult {
  /** Component name (e.g., 'flowField', 'integrationField', 'aabb') */
  component: string;
  /** Whether this component is valid */
  isValid: boolean;
  /** Component-specific errors */
  errors: ValidationMessage[];
  /** Component-specific warnings */
  warnings: ValidationMessage[];
  /** Component-specific metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Unified validation result interface
 *
 * This is the standard validation result returned by all validation methods
 * across the algorithms package. It provides a consistent structure while
 * accommodating the specific needs of different algorithm types.
 */
export interface UnifiedValidationResult {
  /** Overall validation status */
  isValid: boolean;

  /** All error messages across all components */
  errors: ValidationMessage[];

  /** All warning messages across all components */
  warnings: ValidationMessage[];

  /** All info messages across all components */
  info: ValidationMessage[];

  /** Detailed results for each component */
  detailedResults: DetailedValidationResult[];

  /** Additional metadata about the validation process */
  metadata: {
    /** Timestamp when validation was performed */
    timestamp: number;
    /** Duration of validation in milliseconds */
    duration: number;
    /** Number of components validated */
    componentCount: number;
    /** Validation configuration used */
    config?: Record<string, unknown>;
  };

  /** Summary statistics */
  summary: {
    /** Total number of errors */
    errorCount: number;
    /** Total number of warnings */
    warningCount: number;
    /** Total number of info messages */
    infoCount: number;
    /** Number of valid components */
    validComponentCount: number;
    /** Number of invalid components */
    invalidComponentCount: number;
  };
}

/**
 * Validation configuration options
 */
export interface ValidationOptions {
  /** Whether to include detailed component results */
  includeDetailedResults?: boolean;
  /** Whether to include metadata */
  includeMetadata?: boolean;
  /** Maximum number of messages to include per severity */
  maxMessagesPerSeverity?: number;
  /** Custom validation rules */
  customRules?: Record<string, unknown>;
  /** Whether to stop on first error */
  stopOnFirstError?: boolean;
}

/**
 * Type guard to check if a value is a UnifiedValidationResult
 *
 * @param value - The value to check for UnifiedValidationResult shape
 * @returns True if the provided value conforms to UnifiedValidationResult
 * @example
 * const result = maybeValidate(obj);
 * if (isUnifiedValidationResult(result)) {
 *   console.log(result.isValid);
 * }
 */
export function isUnifiedValidationResult(value: unknown): value is UnifiedValidationResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "isValid" in value &&
    "errors" in value &&
    "warnings" in value &&
    "detailedResults" in value &&
    "metadata" in value &&
    "summary" in value
  );
}

/**
 * Create a new UnifiedValidationResult
 *
 * @param isValid - Overall validation status
 * @param errors - Error messages to include
 * @param warnings - Warning messages to include
 * @param info - Informational messages to include
 * @param detailedResults - Per-component validation results
 * @param metadata - Optional metadata such as duration and config
 * @returns A populated UnifiedValidationResult object
 * @example
 * const aggregate = createUnifiedValidationResult(true, [], [], [], []);
 */
export function createUnifiedValidationResult(
  isValid: boolean,
  errors: ValidationMessage[] = [],
  warnings: ValidationMessage[] = [],
  info: ValidationMessage[] = [],
  detailedResults: DetailedValidationResult[] = [],
  metadata: Partial<UnifiedValidationResult["metadata"]> = {}
): UnifiedValidationResult {
  const timestamp = Date.now();
  const duration = metadata.duration ?? 0;
  const componentCount = detailedResults.length;

  const errorCount = errors.length;
  const warningCount = warnings.length;
  const infoCount = info.length;
  const validComponentCount = detailedResults.filter(r => r.isValid).length;
  const invalidComponentCount = detailedResults.filter(r => !r.isValid).length;

  return {
    isValid,
    errors,
    warnings,
    info,
    detailedResults,
    metadata: {
      timestamp,
      duration,
      componentCount,
      config: metadata.config,
    },
    summary: {
      errorCount,
      warningCount,
      infoCount,
      validComponentCount,
      invalidComponentCount,
    },
  };
}

/**
 * Create a validation message
 *
 * @param id - Unique identifier for the message
 * @param severity - Severity level for the message
 * @param message - Human-readable message content
 * @param options - Optional fields such as field, context, and suggestion
 * @param options.field - Optional field path for structured data
 * @param options.context - Optional additional context key/values
 * @param options.suggestion - Optional suggested fix message
 * @returns A constructed ValidationMessage
 * @example
 * const msg = createValidationMessage('id-1', ValidationSeverity.ERROR, 'Invalid input');
 */
export function createValidationMessage(
  id: string,
  severity: ValidationSeverity,
  message: string,
  options: {
    field?: string;
    context?: Record<string, unknown>;
    suggestion?: string;
  } = {}
): ValidationMessage {
  return {
    id,
    severity,
    message,
    field: options.field,
    context: options.context,
    suggestion: options.suggestion,
  };
}

/**
 * Create a detailed validation result for a component
 *
 * @param component - The component name (e.g., 'flowField')
 * @param isValid - Whether the component is valid
 * @param errors - Component-specific errors
 * @param warnings - Component-specific warnings
 * @param metadata - Optional component metadata
 * @returns A DetailedValidationResult entry
 * @example
 * const detail = createDetailedValidationResult('core', true);
 */
export function createDetailedValidationResult(
  component: string,
  isValid: boolean,
  errors: ValidationMessage[] = [],
  warnings: ValidationMessage[] = [],
  metadata?: Record<string, unknown>
): DetailedValidationResult {
  return {
    component,
    isValid,
    errors,
    warnings,
    metadata,
  };
}

/**
 * Merge multiple UnifiedValidationResults into one
 *
 * @param results - The list of validation results to merge
 * @returns A single UnifiedValidationResult representing the merged inputs
 * @example
 * const merged = mergeValidationResults([r1, r2]);
 */
export function mergeValidationResults(results: UnifiedValidationResult[]): UnifiedValidationResult {
  const allErrors: ValidationMessage[] = [];
  const allWarnings: ValidationMessage[] = [];
  const allInfo: ValidationMessage[] = [];
  const allDetailedResults: DetailedValidationResult[] = [];

  let overallValid = true;
  let totalDuration = 0;
  let totalComponentCount = 0;

  for (const result of results) {
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
    allInfo.push(...result.info);
    allDetailedResults.push(...result.detailedResults);

    if (!result.isValid) {
      overallValid = false;
    }

    totalDuration += result.metadata.duration;
    totalComponentCount += result.metadata.componentCount;
  }

  return createUnifiedValidationResult(overallValid, allErrors, allWarnings, allInfo, allDetailedResults, {
    duration: totalDuration,
    componentCount: totalComponentCount,
  });
}

/**
 * Convert legacy validation results to UnifiedValidationResult
 *
 * @param legacyResult - The legacy validation result object
 * @param componentName - The component name associated with the legacy result
 * @returns A UnifiedValidationResult converted from the legacy format
 * @example
 * const unified = convertLegacyValidationResult(oldFormat, 'engine');
 */
export function convertLegacyValidationResult(legacyResult: unknown, componentName: string): UnifiedValidationResult {
  const errors: ValidationMessage[] = [];
  const warnings: ValidationMessage[] = [];
  const info: ValidationMessage[] = [];

  // Convert legacy errors
  if (legacyResult && typeof legacyResult === "object") {
    const legacyErrors = (legacyResult as { errors?: unknown }).errors;
    if (Array.isArray(legacyErrors)) {
      for (const error of legacyErrors) {
        errors.push(
          createValidationMessage(
            `legacy-error-${Date.now()}-${Math.random()}`,
            ValidationSeverity.ERROR,
            typeof error === "string" ? error : (error as { message?: string }).message || "Unknown error"
          )
        );
      }
    }

    // Convert legacy warnings
    const legacyWarnings = (legacyResult as { warnings?: unknown }).warnings;
    if (Array.isArray(legacyWarnings)) {
      for (const warning of legacyWarnings) {
        warnings.push(
          createValidationMessage(
            `legacy-warning-${Date.now()}-${Math.random()}`,
            ValidationSeverity.WARNING,
            typeof warning === "string" ? warning : (warning as { message?: string }).message || "Unknown warning"
          )
        );
      }
    }
  }

  const detailedResult = createDetailedValidationResult(
    componentName,
    (legacyResult as { isValid?: boolean }).isValid ?? false,
    errors,
    warnings
  );

  return createUnifiedValidationResult(
    (legacyResult as { isValid?: boolean }).isValid ?? false,
    errors,
    warnings,
    info,
    [detailedResult]
  );
}
