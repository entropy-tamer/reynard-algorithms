/**
 * Validation Types
 * 
 * Common validation types and utilities used across the algorithms package.
 * 
 * @module algorithms/validationTypes
 */

/**
 * Severity levels for validation messages
 */
export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * A validation message with severity and details
 */
export interface ValidationMessage {
  /** The validation message text */
  message: string;
  /** Severity level of the message */
  severity: ValidationSeverity;
  /** Optional field name that the message relates to */
  field?: string;
  /** Optional additional context */
  context?: Record<string, any>;
}

/**
 * Result of a validation operation
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** Array of validation messages */
  messages: ValidationMessage[];
  /** Optional additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Options for validation operations
 */
export interface ValidationOptions {
  /** Whether to include warnings in the result */
  includeWarnings?: boolean;
  /** Whether to include info messages in the result */
  includeInfo?: boolean;
  /** Custom validation rules */
  customRules?: Record<string, any>;
}

/**
 * Create a validation message
 * 
 * @param message The message text
 * @param severity The severity level
 * @param field Optional field name
 * @param context Optional additional context
 * @returns A validation message object
 */
export function createValidationMessage(
  message: string,
  severity: ValidationSeverity = ValidationSeverity.ERROR,
  field?: string,
  context?: Record<string, any>
): ValidationMessage {
  return {
    message,
    severity,
    field,
    context
  };
}

/**
 * Create a validation result
 * 
 * @param isValid Whether validation passed
 * @param messages Array of validation messages
 * @param metadata Optional metadata
 * @returns A validation result object
 */
export function createValidationResult(
  isValid: boolean,
  messages: ValidationMessage[] = [],
  metadata?: Record<string, any>
): ValidationResult {
  return {
    isValid,
    messages,
    metadata
  };
}
