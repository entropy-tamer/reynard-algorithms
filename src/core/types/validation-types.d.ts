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
export declare enum ValidationSeverity {
    ERROR = "error",
    WARNING = "warning",
    INFO = "info",
    DEBUG = "debug"
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
export declare function isUnifiedValidationResult(value: unknown): value is UnifiedValidationResult;
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
export declare function createUnifiedValidationResult(isValid: boolean, errors?: ValidationMessage[], warnings?: ValidationMessage[], info?: ValidationMessage[], detailedResults?: DetailedValidationResult[], metadata?: Partial<UnifiedValidationResult["metadata"]>): UnifiedValidationResult;
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
export declare function createValidationMessage(id: string, severity: ValidationSeverity, message: string, options?: {
    field?: string;
    context?: Record<string, unknown>;
    suggestion?: string;
}): ValidationMessage;
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
export declare function createDetailedValidationResult(component: string, isValid: boolean, errors?: ValidationMessage[], warnings?: ValidationMessage[], metadata?: Record<string, unknown>): DetailedValidationResult;
/**
 * Merge multiple UnifiedValidationResults into one
 *
 * @param results - The list of validation results to merge
 * @returns A single UnifiedValidationResult representing the merged inputs
 * @example
 * const merged = mergeValidationResults([r1, r2]);
 */
export declare function mergeValidationResults(results: UnifiedValidationResult[]): UnifiedValidationResult;
/**
 * Convert legacy validation results to UnifiedValidationResult
 *
 * @param legacyResult - The legacy validation result object
 * @param componentName - The component name associated with the legacy result
 * @returns A UnifiedValidationResult converted from the legacy format
 * @example
 * const unified = convertLegacyValidationResult(oldFormat, 'engine');
 */
export declare function convertLegacyValidationResult(legacyResult: unknown, componentName: string): UnifiedValidationResult;
//# sourceMappingURL=validation-types.d.ts.map