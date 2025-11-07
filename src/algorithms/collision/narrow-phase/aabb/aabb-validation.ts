/**
 * AABB Validation Functions
 *
 * Provides comprehensive input validation for AABB (Axis-Aligned Bounding Box)
 * objects to prevent invalid data from causing incorrect collision results.
 *
 * @module algorithms/aabbValidation
 */

import { AABB } from "./aabb-types";
import { createValidationMessage, ValidationSeverity } from "../../../../core/types/validation-types";

/**
 * Validation error for AABB objects
 */
export interface AABBValidationError {
  /** Field that has the error */
  field: keyof AABB;
  /** Error message */
  message: string;
  /** Invalid value */
  value: unknown;
  /** Suggested fix */
  suggestion?: string;
}

/**
 * AABB validation result
 */
export interface AABBValidationResult {
  /** Whether the AABB is valid */
  isValid: boolean;
  /** Validation errors */
  errors: AABBValidationError[];
  /** Validation warnings */
  warnings: AABBValidationError[];
  /** Normalized AABB (with corrected values) */
  normalized?: AABB;
}

/**
 * Validate a single AABB object
 * @param aabb
 * @example
 */
export function validateAABB(aabb: unknown): AABBValidationResult {
  const errors: AABBValidationError[] = [];
  const warnings: AABBValidationError[] = [];

  // Check if input is an object
  if (!aabb || typeof aabb !== "object") {
    errors.push({
      field: "x",
      message: "AABB must be an object",
      value: aabb,
      suggestion: "Provide a valid AABB object with x, y, width, height properties",
    });
    return { isValid: false, errors, warnings };
  }

  const aabbObj = aabb as Record<string, unknown>;
  const normalized: Partial<AABB> = {};

  // Validate x coordinate
  if (!("x" in aabbObj)) {
    errors.push({
      field: "x",
      message: "AABB must have x property",
      value: undefined,
      suggestion: "Add x property with a numeric value",
    });
  } else if (typeof aabbObj.x !== "number") {
    errors.push({
      field: "x",
      message: "AABB x must be a number",
      value: aabbObj.x,
      suggestion: "Convert x to a number",
    });
  } else if (!Number.isFinite(aabbObj.x)) {
    errors.push({
      field: "x",
      message: "AABB x must be a finite number",
      value: aabbObj.x,
      suggestion: "Use a finite number for x coordinate",
    });
  } else {
    normalized.x = aabbObj.x;
  }

  // Validate y coordinate
  if (!("y" in aabbObj)) {
    errors.push({
      field: "y",
      message: "AABB must have y property",
      value: undefined,
      suggestion: "Add y property with a numeric value",
    });
  } else if (typeof aabbObj.y !== "number") {
    errors.push({
      field: "y",
      message: "AABB y must be a number",
      value: aabbObj.y,
      suggestion: "Convert y to a number",
    });
  } else if (!Number.isFinite(aabbObj.y)) {
    errors.push({
      field: "y",
      message: "AABB y must be a finite number",
      value: aabbObj.y,
      suggestion: "Use a finite number for y coordinate",
    });
  } else {
    normalized.y = aabbObj.y;
  }

  // Validate width
  if (!("width" in aabbObj)) {
    errors.push({
      field: "width",
      message: "AABB must have width property",
      value: undefined,
      suggestion: "Add width property with a numeric value",
    });
  } else if (typeof aabbObj.width !== "number") {
    errors.push({
      field: "width",
      message: "AABB width must be a number",
      value: aabbObj.width,
      suggestion: "Convert width to a number",
    });
  } else if (!Number.isFinite(aabbObj.width)) {
    errors.push({
      field: "width",
      message: "AABB width must be a finite number",
      value: aabbObj.width,
      suggestion: "Use a finite number for width",
    });
  } else if (aabbObj.width < 0) {
    errors.push({
      field: "width",
      message: "AABB width must be >= 0",
      value: aabbObj.width,
      suggestion: "Use a non-negative width value",
    });
  } else if (aabbObj.width === 0) {
    warnings.push({
      field: "width",
      message: "AABB width is 0, which may cause unexpected behavior",
      value: aabbObj.width,
      suggestion: "Consider using a small positive width if this is intentional",
    });
  } else {
    normalized.width = aabbObj.width;
  }

  // Validate height
  if (!("height" in aabbObj)) {
    errors.push({
      field: "height",
      message: "AABB must have height property",
      value: undefined,
      suggestion: "Add height property with a numeric value",
    });
  } else if (typeof aabbObj.height !== "number") {
    errors.push({
      field: "height",
      message: "AABB height must be a number",
      value: aabbObj.height,
      suggestion: "Convert height to a number",
    });
  } else if (!Number.isFinite(aabbObj.height)) {
    errors.push({
      field: "height",
      message: "AABB height must be a finite number",
      value: aabbObj.height,
      suggestion: "Use a finite number for height",
    });
  } else if (aabbObj.height < 0) {
    errors.push({
      field: "height",
      message: "AABB height must be >= 0",
      value: aabbObj.height,
      suggestion: "Use a non-negative height value",
    });
  } else if (aabbObj.height === 0) {
    warnings.push({
      field: "height",
      message: "AABB height is 0, which may cause unexpected behavior",
      value: aabbObj.height,
      suggestion: "Consider using a small positive height if this is intentional",
    });
  } else {
    normalized.height = aabbObj.height;
  }

  // Check for additional properties (potential typos)
  const validKeys = ["x", "y", "width", "height"];
  const extraKeys = Object.keys(aabbObj).filter(key => !validKeys.includes(key));
  if (extraKeys.length > 0) {
    warnings.push({
      field: "x", // Use x as a generic field indicator
      message: `AABB has unexpected properties: ${extraKeys.join(", ")}`,
      value: extraKeys,
      suggestion: "Remove unexpected properties or check for typos",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    normalized: errors.length === 0 ? (normalized as AABB) : undefined,
  };
}

/**
 * Validate an array of AABBs
 * @param aabbs
 * @example
 */
export function validateAABBArray(aabbs: unknown): {
  isValid: boolean;
  errors: AABBValidationError[];
  warnings: AABBValidationError[];
  validAABBs: AABB[];
  invalidIndices: number[];
} {
  const errors: AABBValidationError[] = [];
  const warnings: AABBValidationError[] = [];
  const validAABBs: AABB[] = [];
  const invalidIndices: number[] = [];

  // Check if input is an array
  if (!Array.isArray(aabbs)) {
    errors.push({
      field: "x",
      message: "Input must be an array of AABBs",
      value: aabbs,
      suggestion: "Provide an array of AABB objects",
    });
    return { isValid: false, errors, warnings, validAABBs, invalidIndices };
  }

  // Validate each AABB in the array
  for (let i = 0; i < aabbs.length; i++) {
    const validation = validateAABB(aabbs[i]);

    if (validation.isValid && validation.normalized) {
      validAABBs.push(validation.normalized);
    } else {
      invalidIndices.push(i);
      errors.push(
        ...validation.errors.map(error => ({
          ...error,
          message: `AABB at index ${i}: ${error.message}`,
        }))
      );
      warnings.push(
        ...validation.warnings.map(warning => ({
          ...warning,
          message: `AABB at index ${i}: ${warning.message}`,
        }))
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    validAABBs,
    invalidIndices,
  };
}

/**
 * Quick validation for AABB (throws on invalid)
 * @param aabb
 * @example
 */
export function assertValidAABB(aabb: unknown): asserts aabb is AABB {
  const validation = validateAABB(aabb);
  if (!validation.isValid) {
    const errorMessage = validation.errors.map(error => `${error.field}: ${error.message}`).join("; ");
    throw new Error(`Invalid AABB: ${errorMessage}`);
  }
}

/**
 * Quick validation for AABB array (throws on invalid)
 * @param aabbs
 * @example
 */
export function assertValidAABBArray(aabbs: unknown): asserts aabbs is AABB[] {
  const validation = validateAABBArray(aabbs);
  if (!validation.isValid) {
    const errorMessage = validation.errors.map(error => error.message).join("; ");
    throw new Error(`Invalid AABB array: ${errorMessage}`);
  }
}

/**
 * Normalize AABB (fix common issues)
 * @param aabb
 * @example
 */
export function normalizeAABB(aabb: unknown): AABB | null {
  const validation = validateAABB(aabb);

  if (validation.isValid && validation.normalized) {
    return validation.normalized;
  }

  // Try to fix common issues
  if (typeof aabb === "object" && aabb !== null) {
    const obj = aabb as Record<string, unknown>;
    const normalized: AABB = {
      x: typeof obj.x === "number" && Number.isFinite(obj.x) ? obj.x : 0,
      y: typeof obj.y === "number" && Number.isFinite(obj.y) ? obj.y : 0,
      width: typeof obj.width === "number" && Number.isFinite(obj.width) && obj.width >= 0 ? obj.width : 0,
      height: typeof obj.height === "number" && Number.isFinite(obj.height) && obj.height >= 0 ? obj.height : 0,
    };

    // Validate the normalized AABB
    const normalizedValidation = validateAABB(normalized);
    if (normalizedValidation.isValid) {
      return normalized;
    }
  }

  return null;
}

/**
 * Check if two AABBs are valid for collision detection
 * @param a
 * @param b
 * @example
 */
export function validateAABBsForCollision(
  a: AABB,
  b: AABB
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate first AABB
  const validationA = validateAABB(a);
  if (!validationA.isValid) {
    errors.push(`First AABB is invalid: ${validationA.errors.map(e => e.message).join(", ")}`);
  }

  // Validate second AABB
  const validationB = validateAABB(b);
  if (!validationB.isValid) {
    errors.push(`Second AABB is invalid: ${validationB.errors.map(e => e.message).join(", ")}`);
  }

  // Check for potential numerical issues
  const maxSafeInteger = Number.MAX_SAFE_INTEGER;
  if (
    Math.abs(a.x) > maxSafeInteger ||
    Math.abs(a.y) > maxSafeInteger ||
    Math.abs(a.width) > maxSafeInteger ||
    Math.abs(a.height) > maxSafeInteger
  ) {
    warnings.push("First AABB has very large coordinate values that may cause precision issues");
  }

  if (
    Math.abs(b.x) > maxSafeInteger ||
    Math.abs(b.y) > maxSafeInteger ||
    Math.abs(b.width) > maxSafeInteger ||
    Math.abs(b.height) > maxSafeInteger
  ) {
    warnings.push("Second AABB has very large coordinate values that may cause precision issues");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
