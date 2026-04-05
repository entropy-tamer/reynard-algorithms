/**
 * AABB Validation Functions
 *
 * Provides comprehensive input validation for AABB (Axis-Aligned Bounding Box)
 * objects to prevent invalid data from causing incorrect collision results.
 *
 * @module algorithms/aabbValidation
 */
import { AABB } from "./aabb-types";
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
export declare function validateAABB(aabb: unknown): AABBValidationResult;
/**
 * Validate an array of AABBs
 * @param aabbs
 * @example
 */
export declare function validateAABBArray(aabbs: unknown): {
    isValid: boolean;
    errors: AABBValidationError[];
    warnings: AABBValidationError[];
    validAABBs: AABB[];
    invalidIndices: number[];
};
/**
 * Quick validation for AABB (throws on invalid)
 * @param aabb
 * @example
 */
export declare function assertValidAABB(aabb: unknown): asserts aabb is AABB;
/**
 * Quick validation for AABB array (throws on invalid)
 * @param aabbs
 * @example
 */
export declare function assertValidAABBArray(aabbs: unknown): asserts aabbs is AABB[];
/**
 * Normalize AABB (fix common issues)
 * @param aabb
 * @example
 */
export declare function normalizeAABB(aabb: unknown): AABB | null;
/**
 * Check if two AABBs are valid for collision detection
 * @param a
 * @param b
 * @example
 */
export declare function validateAABBsForCollision(a: AABB, b: AABB): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
};
//# sourceMappingURL=aabb-validation.d.ts.map