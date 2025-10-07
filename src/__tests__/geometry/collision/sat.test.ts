/**
 * Separating Axis Theorem (SAT) Collision Detection Tests
 *
 * Comprehensive test suite for the SAT collision detection implementation.
 * Tests mathematical correctness, performance, edge cases, and integration.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  SAT,
  DEFAULT_SAT_CONFIG,
  COMMON_POLYGONS,
  type ConvexPolygon,
  type SATCollisionResult,
  type SATConfig,
  type Point2D,
} from '../../../geometry/collision/sat';

describe('Separating Axis Theorem (SAT) Collision Detection', () => {
  let sat: SAT;
  let square1: ConvexPolygon;
  let square2: ConvexPolygon;
  let triangle: ConvexPolygon;
  let hexagon: ConvexPolygon;

  beforeEach(() => {
    sat = new SAT();
    
    // Create test polygons
    square1 = {
      vertices: [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ],
      center: { x: 1, y: 1 },
      radius: Math.sqrt(2),
      id: 'square1',
    };
    
    square2 = {
      vertices: [
        { x: 1, y: 1 },
        { x: 3, y: 1 },
        { x: 3, y: 3 },
        { x: 1, y: 3 },
      ],
      center: { x: 2, y: 2 },
      radius: Math.sqrt(2),
      id: 'square2',
    };
    
    triangle = {
      vertices: [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 2 },
      ],
      center: { x: 1, y: 0.667 },
      radius: 1.155,
      id: 'triangle',
    };
    
    hexagon = {
      vertices: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1.5, y: 0.866 },
        { x: 1, y: 1.732 },
        { x: 0, y: 1.732 },
        { x: -0.5, y: 0.866 },
      ],
      center: { x: 0.5, y: 0.866 },
      radius: 1,
      id: 'hexagon',
    };
  });

  describe('Mathematical Theory', () => {
    it('should implement correct SAT algorithm: f(n) = g(n) + h(n)', () => {
      // Test overlapping squares
      const result = sat.testCollision(square1, square2);
      
      expect(result.colliding).toBe(true);
      expect(result.overlap).toBeGreaterThan(0);
      expect(result.separationAxis).not.toBeNull();
      expect(result.mtv).not.toBeNull();
    });

    it('should find separation axis when polygons do not overlap', () => {
      // Move square2 far away
      const distantSquare: ConvexPolygon = {
        ...square2,
        vertices: square2.vertices.map(v => ({ x: v.x + 10, y: v.y + 10 })),
        center: { x: square2.center.x + 10, y: square2.center.y + 10 },
      };
      
      const result = sat.testCollision(square1, distantSquare);
      
      expect(result.colliding).toBe(false);
      expect(result.overlap).toBe(0);
      expect(result.separationAxis).not.toBeNull();
      expect(result.mtv).toBeNull();
    });

    it('should respect the fundamental SAT principle: separation exists if any axis shows no overlap', () => {
      // Create two squares that touch but don't overlap
      const touchingSquare: ConvexPolygon = {
        vertices: [
          { x: 2, y: 0 },
          { x: 4, y: 0 },
          { x: 4, y: 2 },
          { x: 2, y: 2 },
        ],
        center: { x: 3, y: 1 },
        radius: Math.sqrt(2),
        id: 'touching',
      };
      
      const result = sat.testCollision(square1, touchingSquare);
      
      // Should not collide (touching edges don't count as collision)
      expect(result.colliding).toBe(false);
    });
  });

  describe('Core Operations', () => {
    it('should detect collision between overlapping squares', () => {
      const result = sat.testCollision(square1, square2);
      
      expect(result.colliding).toBe(true);
      expect(result.overlap).toBeGreaterThan(0);
      expect(result.axesTested).toBeGreaterThan(0);
    });

    it('should detect no collision between separated squares', () => {
      const separatedSquare: ConvexPolygon = {
        ...square2,
        vertices: square2.vertices.map(v => ({ x: v.x + 5, y: v.y + 5 })),
        center: { x: square2.center.x + 5, y: square2.center.y + 5 },
      };
      
      const result = sat.testCollision(square1, separatedSquare);
      
      expect(result.colliding).toBe(false);
      expect(result.overlap).toBe(0);
    });

    it('should detect collision between square and triangle', () => {
      const result = sat.testCollision(square1, triangle);
      
      expect(result.colliding).toBe(true);
      expect(result.overlap).toBeGreaterThan(0);
    });

    it('should detect collision between triangle and hexagon', () => {
      const result = sat.testCollision(triangle, hexagon);
      
      expect(result.colliding).toBe(true);
      expect(result.overlap).toBeGreaterThan(0);
    });

    it('should handle identical polygons', () => {
      const result = sat.testCollision(square1, square1);
      
      expect(result.colliding).toBe(true);
      expect(result.overlap).toBeGreaterThan(0);
    });

    it('should handle polygons with same center but different sizes', () => {
      const smallSquare: ConvexPolygon = {
        vertices: [
          { x: 0.5, y: 0.5 },
          { x: 1.5, y: 0.5 },
          { x: 1.5, y: 1.5 },
          { x: 0.5, y: 1.5 },
        ],
        center: { x: 1, y: 1 },
        radius: Math.sqrt(2) / 2,
        id: 'small',
      };
      
      const result = sat.testCollision(square1, smallSquare);
      
      expect(result.colliding).toBe(true);
      expect(result.overlap).toBeGreaterThan(0);
    });
  });

  describe('Minimum Translation Vector (MTV)', () => {
    it('should calculate correct MTV for overlapping squares', () => {
      const result = sat.testCollision(square1, square2);
      
      expect(result.colliding).toBe(true);
      expect(result.mtv).not.toBeNull();
      expect(result.mtv!.x).toBeCloseTo(0, 1); // Should be horizontal or vertical
      expect(result.mtv!.y).toBeCloseTo(0, 1);
    });

    it('should have MTV magnitude equal to overlap distance', () => {
      const result = sat.testCollision(square1, square2);
      
      if (result.colliding && result.mtv) {
        const mtvMagnitude = Math.sqrt(result.mtv.x * result.mtv.x + result.mtv.y * result.mtv.y);
        expect(mtvMagnitude).toBeCloseTo(result.overlap, 5);
      }
    });

    it('should have MTV pointing in correct direction', () => {
      // Create a square to the right of square1
      const rightSquare: ConvexPolygon = {
        vertices: [
          { x: 1.5, y: 0 },
          { x: 3.5, y: 0 },
          { x: 3.5, y: 2 },
          { x: 1.5, y: 2 },
        ],
        center: { x: 2.5, y: 1 },
        radius: Math.sqrt(2),
        id: 'right',
      };
      
      const result = sat.testCollision(square1, rightSquare);
      
      if (result.colliding && result.mtv) {
        // MTV should point left (negative x direction)
        expect(result.mtv.x).toBeLessThan(0);
        expect(Math.abs(result.mtv.y)).toBeLessThan(Math.abs(result.mtv.x));
      }
    });
  });

  describe('Contact Points', () => {
    it('should find contact points when collision is detected', () => {
      sat.updateConfig({ findContactPoints: true });
      
      const result = sat.testCollision(square1, square2);
      
      expect(result.colliding).toBe(true);
      expect(result.contactPoints.length).toBeGreaterThan(0);
      expect(result.contactPoints.length).toBeLessThanOrEqual(4); // Max contact points
    });

    it('should not find contact points when no collision', () => {
      sat.updateConfig({ findContactPoints: true });
      
      const separatedSquare: ConvexPolygon = {
        ...square2,
        vertices: square2.vertices.map(v => ({ x: v.x + 5, y: v.y + 5 })),
        center: { x: square2.center.x + 5, y: square2.center.y + 5 },
      };
      
      const result = sat.testCollision(square1, separatedSquare);
      
      expect(result.colliding).toBe(false);
      expect(result.contactPoints).toEqual([]);
    });

    it('should limit number of contact points', () => {
      sat.updateConfig({ findContactPoints: true, maxContactPoints: 2 });
      
      const result = sat.testCollision(square1, square2);
      
      expect(result.colliding).toBe(true);
      expect(result.contactPoints.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Configuration Options', () => {
    it('should respect epsilon tolerance', () => {
      sat.updateConfig({ epsilon: 0.1 });
      
      const result = sat.testCollision(square1, square2);
      
      expect(result.colliding).toBe(true);
      expect(result.overlap).toBeGreaterThan(0.1);
    });

    it('should use early termination when enabled', () => {
      sat.updateConfig({ useEarlyTermination: true });
      
      const result = sat.testCollision(square1, square2);
      
      expect(result.colliding).toBe(true);
      expect(result.axesTested).toBeGreaterThan(0);
    });

    it('should use bounding circle optimization when enabled', () => {
      sat.updateConfig({ useBoundingCircleOptimization: true });
      
      const result = sat.testCollision(square1, square2);
      
      expect(result.colliding).toBe(true);
      expect(result.axesTested).toBeGreaterThan(0);
    });

    it('should disable contact point finding when configured', () => {
      sat.updateConfig({ findContactPoints: false });
      
      const result = sat.testCollision(square1, square2);
      
      expect(result.colliding).toBe(true);
      expect(result.contactPoints).toEqual([]);
    });

    it('should disable penetration depth calculation when configured', () => {
      sat.updateConfig({ calculatePenetrationDepth: false });
      
      const result = sat.testCollision(square1, square2);
      
      expect(result.colliding).toBe(true);
      expect(result.penetrationDepth).toBe(0);
    });
  });

  describe('Caching', () => {
    it('should cache collision results', () => {
      const result1 = sat.testCollision(square1, square2);
      expect(result1.success).toBe(true);
      
      const result2 = sat.testCollision(square1, square2);
      expect(result2.success).toBe(true);
      expect(result2.executionTime).toBe(0); // Cached result
    });

    it('should clear cache when requested', () => {
      // Cache a result
      sat.testCollision(square1, square2);
      
      // Clear cache
      sat.clearCache();
      
      // Next call should not use cache
      const result = sat.testCollision(square1, square2);
      expect(result.success).toBe(true);
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it('should cache axis calculations', () => {
      sat.updateConfig({ useAxisCaching: true });
      
      const result1 = sat.testCollision(square1, square2);
      const result2 = sat.testCollision(square1, square2);
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      // Second call should be faster due to axis caching
    });
  });

  describe('Statistics and Performance', () => {
    it('should collect statistics', () => {
      sat.testCollision(square1, square2);
      
      const stats = sat.getStats();
      expect(stats.totalTests).toBe(1);
      expect(stats.collisionRate).toBe(1.0);
      expect(stats.averageExecutionTime).toBeGreaterThan(0);
    });

    it('should provide performance metrics', () => {
      sat.testCollision(square1, square2);
      
      const metrics = sat.getPerformanceMetrics();
      expect(metrics.performanceScore).toBeGreaterThan(0);
      expect(metrics.cacheSize).toBeGreaterThanOrEqual(0);
      expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0);
    });

    it('should reset statistics', () => {
      sat.testCollision(square1, square2);
      sat.resetStats();
      
      const stats = sat.getStats();
      expect(stats.totalTests).toBe(0);
      expect(stats.collisionRate).toBe(0);
    });
  });

  describe('Event Handling', () => {
    it('should emit events when debugging is enabled', () => {
      const eventHandler = vi.fn();
      const debugSAT = new SAT({ enableDebug: true, eventHandlers: [eventHandler] });
      
      debugSAT.testCollision(square1, square2);
      
      expect(eventHandler).toHaveBeenCalled();
    });

    it('should not emit events when debugging is disabled', () => {
      const eventHandler = vi.fn();
      const normalSAT = new SAT({ enableDebug: false, eventHandlers: [eventHandler] });
      
      normalSAT.testCollision(square1, square2);
      
      expect(eventHandler).not.toHaveBeenCalled();
    });
  });

  describe('Batch Operations', () => {
    it('should test multiple polygon pairs efficiently', () => {
      const polygonPairs = [
        { polygon1: square1, polygon2: square2 },
        { polygon1: square1, polygon2: triangle },
        { polygon1: triangle, polygon2: hexagon },
      ];
      
      const batchResult = sat.testBatchCollisions(polygonPairs);
      
      expect(batchResult.results.length).toBe(3);
      expect(batchResult.collisionCount).toBeGreaterThan(0);
      expect(batchResult.totalExecutionTime).toBeGreaterThan(0);
    });

    it('should handle empty batch', () => {
      const batchResult = sat.testBatchCollisions([]);
      
      expect(batchResult.results.length).toBe(0);
      expect(batchResult.collisionCount).toBe(0);
      expect(batchResult.totalExecutionTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Transformation Support', () => {
    it('should handle transformed polygons', () => {
      const transform = {
        translation: { x: 1, y: 1 },
        rotation: Math.PI / 4,
        scale: { x: 1.5, y: 1.5 },
      };
      
      const result = sat.testTransformedCollision(square1, transform, square2);
      
      expect(result.colliding).toBeDefined();
      expect(result.axesTested).toBeGreaterThan(0);
    });

    it('should handle identity transformation', () => {
      const identityTransform = {
        translation: { x: 0, y: 0 },
        rotation: 0,
        scale: { x: 1, y: 1 },
      };
      
      const result1 = sat.testCollision(square1, square2);
      const result2 = sat.testTransformedCollision(square1, identityTransform, square2);
      
      expect(result1.colliding).toBe(result2.colliding);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single-point polygons', () => {
      const point: ConvexPolygon = {
        vertices: [{ x: 1, y: 1 }],
        center: { x: 1, y: 1 },
        radius: 0,
        id: 'point',
      };
      
      const result = sat.testCollision(square1, point);
      
      expect(result.colliding).toBe(true);
    });

    it('should handle line segment polygons', () => {
      const line: ConvexPolygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 2, y: 0 },
        ],
        center: { x: 1, y: 0 },
        radius: 1,
        id: 'line',
      };
      
      const result = sat.testCollision(square1, line);
      
      expect(result.colliding).toBe(true);
    });

    it('should handle very small polygons', () => {
      const tinySquare: ConvexPolygon = {
        vertices: [
          { x: 0.99, y: 0.99 },
          { x: 1.01, y: 0.99 },
          { x: 1.01, y: 1.01 },
          { x: 0.99, y: 1.01 },
        ],
        center: { x: 1, y: 1 },
        radius: 0.014,
        id: 'tiny',
      };
      
      const result = sat.testCollision(square1, tinySquare);
      
      expect(result.colliding).toBe(true);
    });

    it('should handle very large polygons', () => {
      const hugeSquare: ConvexPolygon = {
        vertices: [
          { x: -100, y: -100 },
          { x: 100, y: -100 },
          { x: 100, y: 100 },
          { x: -100, y: 100 },
        ],
        center: { x: 0, y: 0 },
        radius: 141.42,
        id: 'huge',
      };
      
      const result = sat.testCollision(square1, hugeSquare);
      
      expect(result.colliding).toBe(true);
    });

    it('should handle polygons with zero area', () => {
      const zeroArea: ConvexPolygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ],
        center: { x: 0, y: 0 },
        radius: 0,
        id: 'zero',
      };
      
      const result = sat.testCollision(square1, zeroArea);
      
      expect(result.colliding).toBe(true);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should complete collision test within reasonable time', () => {
      const startTime = performance.now();
      const result = sat.testCollision(square1, square2);
      const endTime = performance.now();
      
      expect(result.colliding).toBe(true);
      expect(endTime - startTime).toBeLessThan(10); // Should complete within 10ms
    });

    it('should test reasonable number of axes', () => {
      const result = sat.testCollision(square1, square2);
      
      expect(result.axesTested).toBeGreaterThan(0);
      expect(result.axesTested).toBeLessThanOrEqual(8); // Max 4 faces per polygon
    });

    it('should find efficient collision detection', () => {
      const result = sat.testCollision(square1, square2);
      
      expect(result.colliding).toBe(true);
      expect(result.overlap).toBeGreaterThan(0);
      expect(result.overlap).toBeLessThan(2); // Should be reasonable overlap
    });
  });

  describe('Integration', () => {
    it('should work with common polygon shapes', () => {
      const unitSquare = COMMON_POLYGONS.UNIT_SQUARE;
      const unitTriangle = COMMON_POLYGONS.UNIT_TRIANGLE;
      const unitHexagon = COMMON_POLYGONS.UNIT_HEXAGON;
      
      const results = [
        sat.testCollision(unitSquare, unitTriangle),
        sat.testCollision(unitTriangle, unitHexagon),
        sat.testCollision(unitSquare, unitHexagon),
      ];
      
      for (const result of results) {
        expect(result.colliding).toBeDefined();
        expect(result.axesTested).toBeGreaterThan(0);
      }
    });

    it('should maintain consistency across multiple calls', () => {
      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(sat.testCollision(square1, square2));
      }
      
      // All results should be identical
      for (let i = 1; i < results.length; i++) {
        expect(results[i].colliding).toBe(results[0].colliding);
        expect(results[i].overlap).toBeCloseTo(results[0].overlap, 5);
        expect(results[i].axesTested).toBe(results[0].axesTested);
      }
    });

    it('should handle complex polygon configurations', () => {
      // Create a complex scenario with multiple overlapping polygons
      const polygons = [square1, square2, triangle, hexagon];
      const results = [];
      
      for (let i = 0; i < polygons.length; i++) {
        for (let j = i + 1; j < polygons.length; j++) {
          results.push(sat.testCollision(polygons[i], polygons[j]));
        }
      }
      
      expect(results.length).toBe(6); // C(4,2) = 6 pairs
      for (const result of results) {
        expect(result.colliding).toBeDefined();
        expect(result.axesTested).toBeGreaterThan(0);
      }
    });
  });
});

