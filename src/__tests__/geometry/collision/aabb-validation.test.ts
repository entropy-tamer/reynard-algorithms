/**
 * AABB Validation Tests
 * 
 * Comprehensive tests for AABB input validation, including the fix
 * for Issue #2 - AABB Validation Missing.
 * 
 * @module algorithms/aabbValidationTests
 */

import { validateAABB, validateAABBArray, assertValidAABB, normalizeAABB } from '../../geometry/collision/aabb/aabb-validation';
import { checkCollision, createCollisionResult, executeNaiveCollisionDetection } from '../../optimization/adapters/collision-algorithms';
import { runBenchmark, assertPerformance } from '../utils/benchmark-utils';

describe('AABB Validation', () => {
  describe('Issue #2: AABB Validation Missing', () => {
    it('should validate AABB objects correctly', () => {
      // Valid AABB
      const validAABB = { x: 0, y: 0, width: 10, height: 10 };
      const validation = validateAABB(validAABB);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.normalized).toEqual(validAABB);
    });

    it('should detect negative dimensions', () => {
      const invalidAABB = { x: 0, y: 0, width: -10, height: 10 };
      const validation = validateAABB(invalidAABB);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(1);
      expect(validation.errors[0].field).toBe('width');
      expect(validation.errors[0].message).toContain('width must be >= 0');
    });

    it('should detect NaN values', () => {
      const invalidAABB = { x: NaN, y: 0, width: 10, height: 10 };
      const validation = validateAABB(invalidAABB);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(1);
      expect(validation.errors[0].field).toBe('x');
      expect(validation.errors[0].message).toContain('x must be a finite number');
    });

    it('should detect Infinity values', () => {
      const invalidAABB = { x: 0, y: Infinity, width: 10, height: 10 };
      const validation = validateAABB(invalidAABB);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(1);
      expect(validation.errors[0].field).toBe('y');
      expect(validation.errors[0].message).toContain('y must be a finite number');
    });

    it('should detect missing properties', () => {
      const invalidAABB = { x: 0, y: 0, width: 10 }; // missing height
      const validation = validateAABB(invalidAABB);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(1);
      expect(validation.errors[0].field).toBe('height');
      expect(validation.errors[0].message).toContain('AABB must have height property');
    });

    it('should detect wrong property types', () => {
      const invalidAABB = { x: '0', y: 0, width: 10, height: 10 };
      const validation = validateAABB(invalidAABB);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(1);
      expect(validation.errors[0].field).toBe('x');
      expect(validation.errors[0].message).toContain('AABB x must be a number');
    });

    it('should warn about zero dimensions', () => {
      const aabbWithZeroWidth = { x: 0, y: 0, width: 0, height: 10 };
      const validation = validateAABB(aabbWithZeroWidth);
      
      expect(validation.isValid).toBe(true); // Zero width is valid but warned
      expect(validation.warnings).toHaveLength(1);
      expect(validation.warnings[0].field).toBe('width');
      expect(validation.warnings[0].message).toContain('width is 0');
    });

    it('should warn about extra properties', () => {
      const aabbWithExtra = { x: 0, y: 0, width: 10, height: 10, extra: 'value' };
      const validation = validateAABB(aabbWithExtra);
      
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toHaveLength(1);
      expect(validation.warnings[0].message).toContain('unexpected properties');
    });
  });

  describe('AABB Array Validation', () => {
    it('should validate arrays of AABBs', () => {
      const validAABBs = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 10, y: 10, width: 5, height: 5 },
      ];
      
      const validation = validateAABBArray(validAABBs);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.validAABBs).toHaveLength(2);
      expect(validation.invalidIndices).toHaveLength(0);
    });

    it('should identify invalid AABBs in array', () => {
      const mixedAABBs = [
        { x: 0, y: 0, width: 10, height: 10 }, // valid
        { x: 10, y: 10, width: -5, height: 5 }, // invalid
        { x: 20, y: 20, width: 5, height: 5 }, // valid
      ];
      
      const validation = validateAABBArray(mixedAABBs);
      
      expect(validation.isValid).toBe(false);
      expect(validation.validAABBs).toHaveLength(2);
      expect(validation.invalidIndices).toEqual([1]);
      expect(validation.errors).toHaveLength(1);
      expect(validation.errors[0].message).toContain('AABB at index 1');
    });

    it('should handle non-array input', () => {
      const validation = validateAABBArray('not an array');
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(1);
      expect(validation.errors[0].message).toContain('must be an array');
    });
  });

  describe('Assertion Functions', () => {
    it('should throw on invalid AABB', () => {
      expect(() => {
        assertValidAABB({ x: 0, y: 0, width: -10, height: 10 });
      }).toThrow('Invalid AABB');
    });

    it('should not throw on valid AABB', () => {
      expect(() => {
        assertValidAABB({ x: 0, y: 0, width: 10, height: 10 });
      }).not.toThrow();
    });

    it('should throw on invalid AABB array', () => {
      expect(() => {
        assertValidAABBArray([{ x: 0, y: 0, width: -10, height: 10 }]);
      }).toThrow('Invalid AABB array');
    });
  });

  describe('Normalization', () => {
    it('should normalize AABBs with fixable issues', () => {
      const invalidAABB = { x: '0', y: 0, width: -10, height: 10 };
      const normalized = normalizeAABB(invalidAABB);
      
      expect(normalized).toEqual({
        x: 0,
        y: 0,
        width: 0, // Negative width becomes 0
        height: 10,
      });
    });

    it('should return null for unfixable AABBs', () => {
      const unfixableAABB = { x: 0, y: 0, width: 10 }; // missing height
      const normalized = normalizeAABB(unfixableAABB);
      
      expect(normalized).toBeNull();
    });
  });

  describe('Collision Detection Integration', () => {
    it('should validate AABBs in checkCollision', () => {
      const validA = { x: 0, y: 0, width: 10, height: 10 };
      const validB = { x: 5, y: 5, width: 10, height: 10 };
      
      expect(() => {
        checkCollision(validA, validB);
      }).not.toThrow();
    });

    it('should throw on invalid AABBs in checkCollision', () => {
      const validA = { x: 0, y: 0, width: 10, height: 10 };
      const invalidB = { x: 5, y: 5, width: -10, height: 10 };
      
      expect(() => {
        checkCollision(validA, invalidB);
      }).toThrow('Invalid AABBs for collision detection');
    });

    it('should validate AABBs in createCollisionResult', () => {
      const validA = { x: 0, y: 0, width: 10, height: 10 };
      const validB = { x: 5, y: 5, width: 10, height: 10 };
      
      expect(() => {
        createCollisionResult(validA, validB);
      }).not.toThrow();
    });

    it('should throw on invalid AABBs in createCollisionResult', () => {
      const validA = { x: 0, y: 0, width: 10, height: 10 };
      const invalidB = { x: 5, y: 5, width: -10, height: 10 };
      
      expect(() => {
        createCollisionResult(validA, invalidB);
      }).toThrow('Invalid AABBs for collision result');
    });

    it('should validate AABB arrays in executeNaiveCollisionDetection', () => {
      const validAABBs = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: 10, height: 10 },
      ];
      
      expect(() => {
        executeNaiveCollisionDetection(validAABBs);
      }).not.toThrow();
    });

    it('should throw on invalid AABB arrays in executeNaiveCollisionDetection', () => {
      const invalidAABBs = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: -10, height: 10 }, // invalid
      ];
      
      expect(() => {
        executeNaiveCollisionDetection(invalidAABBs);
      }).toThrow('Invalid AABB at index 1');
    });

    it('should handle empty arrays', () => {
      expect(() => {
        executeNaiveCollisionDetection([]);
      }).not.toThrow();
    });

    it('should handle single AABB arrays', () => {
      expect(() => {
        executeNaiveCollisionDetection([{ x: 0, y: 0, width: 10, height: 10 }]);
      }).not.toThrow();
    });

    it('should throw on non-array input', () => {
      expect(() => {
        executeNaiveCollisionDetection('not an array' as any);
      }).toThrow('AABBs must be provided as an array');
    });
  });

  describe('Performance Impact', () => {
    it('should have minimal performance impact on valid AABBs', async () => {
      const validAABBs = Array.from({ length: 100 }, (_, i) => ({
        x: i * 10,
        y: i * 10,
        width: 10,
        height: 10,
      }));

      const report = await runBenchmark(
        'aabb-validation-performance',
        () => executeNaiveCollisionDetection(validAABBs),
        { samples: 20 }
      );

      // Should complete in reasonable time
      assertPerformance(report, {
        maxTime: 50, // Should handle 100 AABBs in under 50ms
        maxCoefficientOfVariation: 0.3,
      });

      expect(report.statistics.median).toBeLessThan(50);
    });

    it('should fail fast on invalid AABBs', async () => {
      const invalidAABBs = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: -10, height: 10 }, // invalid
      ];

      const startTime = performance.now();
      
      try {
        executeNaiveCollisionDetection(invalidAABBs);
      } catch (error) {
        // Expected to throw
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should fail quickly (within 1ms)
      expect(duration).toBeLessThan(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large coordinate values', () => {
      const largeAABB = {
        x: Number.MAX_SAFE_INTEGER,
        y: Number.MAX_SAFE_INTEGER,
        width: 10,
        height: 10,
      };
      
      const validation = validateAABB(largeAABB);
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toHaveLength(1);
      expect(validation.warnings[0].message).toContain('very large coordinate values');
    });

    it('should handle very small coordinate values', () => {
      const smallAABB = {
        x: Number.MIN_VALUE,
        y: Number.MIN_VALUE,
        width: 10,
        height: 10,
      };
      
      const validation = validateAABB(smallAABB);
      expect(validation.isValid).toBe(true);
    });

    it('should handle zero dimensions', () => {
      const zeroAABB = { x: 0, y: 0, width: 0, height: 0 };
      const validation = validateAABB(zeroAABB);
      
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toHaveLength(2); // width and height warnings
    });

    it('should handle null and undefined', () => {
      expect(validateAABB(null).isValid).toBe(false);
      expect(validateAABB(undefined).isValid).toBe(false);
    });
  });
});



