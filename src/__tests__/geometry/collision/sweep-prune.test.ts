/**
 * Sweep and Prune Collision Detection Tests
 *
 * Comprehensive test suite for the Sweep and Prune collision detection implementation.
 * Tests mathematical correctness, performance, edge cases, and integration.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  SweepPrune,
  DEFAULT_SWEEP_PRUNE_CONFIG,
  COMMON_AABBS,
  type AABB,
  type SweepPruneResult,
  type SweepPruneConfig,
} from '../../../geometry/collision/sweep-prune';

describe('Sweep and Prune Collision Detection', () => {
  let sweepPrune: SweepPrune;
  let aabb1: AABB;
  let aabb2: AABB;
  let aabb3: AABB;
  let aabb4: AABB;

  beforeEach(() => {
    sweepPrune = new SweepPrune();
    
    // Create test AABBs
    aabb1 = {
      minX: 0,
      minY: 0,
      maxX: 2,
      maxY: 2,
      id: 'aabb1',
    };
    
    aabb2 = {
      minX: 1,
      minY: 1,
      maxX: 3,
      maxY: 3,
      id: 'aabb2',
    };
    
    aabb3 = {
      minX: 4,
      minY: 4,
      maxX: 6,
      maxY: 6,
      id: 'aabb3',
    };
    
    aabb4 = {
      minX: 0.5,
      minY: 0.5,
      maxX: 1.5,
      maxY: 1.5,
      id: 'aabb4',
    };
  });

  describe('Mathematical Theory', () => {
    it('should implement correct sweep and prune algorithm: O(n log n + k)', () => {
      const aabbs = [aabb1, aabb2, aabb3];
      const result = sweepPrune.detectCollisions(aabbs);
      
      expect(result.totalAABBs).toBe(3);
      expect(result.axisSweeps).toBeGreaterThan(0);
      expect(result.endpointsProcessed).toBeGreaterThan(0);
    });

    it('should find overlapping intervals correctly', () => {
      const aabbs = [aabb1, aabb2]; // These overlap
      const result = sweepPrune.detectCollisions(aabbs);
      
      expect(result.collisionPairs.length).toBeGreaterThan(0);
      expect(result.activeCollisions).toBeGreaterThan(0);
    });

    it('should respect the fundamental sweep and prune principle: sort and sweep', () => {
      const aabbs = [aabb1, aabb2, aabb3]; // aabb1 and aabb2 overlap, aabb3 is separate
      const result = sweepPrune.detectCollisions(aabbs);
      
      // Should find collision between aabb1 and aabb2
      const hasCollision = result.collisionPairs.some(pair => 
        (pair.aabb1.id === 'aabb1' && pair.aabb2.id === 'aabb2') ||
        (pair.aabb1.id === 'aabb2' && pair.aabb2.id === 'aabb1')
      );
      
      expect(hasCollision).toBe(true);
    });
  });

  describe('Core Operations', () => {
    it('should detect collision between overlapping AABBs', () => {
      const aabbs = [aabb1, aabb2];
      const result = sweepPrune.detectCollisions(aabbs);
      
      expect(result.collisionPairs.length).toBeGreaterThan(0);
      expect(result.activeCollisions).toBeGreaterThan(0);
    });

    it('should detect no collision between separated AABBs', () => {
      const aabbs = [aabb1, aabb3];
      const result = sweepPrune.detectCollisions(aabbs);
      
      expect(result.collisionPairs.length).toBe(0);
      expect(result.activeCollisions).toBe(0);
    });

    it('should handle multiple overlapping AABBs', () => {
      const aabbs = [aabb1, aabb2, aabb4]; // All overlap with each other
      const result = sweepPrune.detectCollisions(aabbs);
      
      expect(result.collisionPairs.length).toBeGreaterThan(0);
      expect(result.activeCollisions).toBeGreaterThan(0);
    });

    it('should handle empty AABB array', () => {
      const result = sweepPrune.detectCollisions([]);
      
      expect(result.collisionPairs.length).toBe(0);
      expect(result.totalAABBs).toBe(0);
      expect(result.activeCollisions).toBe(0);
    });

    it('should handle single AABB', () => {
      const result = sweepPrune.detectCollisions([aabb1]);
      
      expect(result.collisionPairs.length).toBe(0);
      expect(result.totalAABBs).toBe(1);
      expect(result.activeCollisions).toBe(0);
    });

    it('should handle identical AABBs', () => {
      const result = sweepPrune.detectCollisions([aabb1, aabb1]);
      
      expect(result.collisionPairs.length).toBeGreaterThan(0);
      expect(result.activeCollisions).toBeGreaterThan(0);
    });
  });

  describe('AABB Management', () => {
    it('should add AABBs to the system', () => {
      sweepPrune.addAABB(aabb1);
      sweepPrune.addAABB(aabb2);
      
      const allAABBs = sweepPrune.getAllAABBs();
      expect(allAABBs.length).toBe(2);
      expect(allAABBs.some(aabb => aabb.id === 'aabb1')).toBe(true);
      expect(allAABBs.some(aabb => aabb.id === 'aabb2')).toBe(true);
    });

    it('should remove AABBs from the system', () => {
      sweepPrune.addAABB(aabb1);
      sweepPrune.addAABB(aabb2);
      sweepPrune.removeAABB('aabb1');
      
      const allAABBs = sweepPrune.getAllAABBs();
      expect(allAABBs.length).toBe(1);
      expect(allAABBs.some(aabb => aabb.id === 'aabb1')).toBe(false);
      expect(allAABBs.some(aabb => aabb.id === 'aabb2')).toBe(true);
    });

    it('should update existing AABBs', () => {
      sweepPrune.addAABB(aabb1);
      
      const updatedAABB = { ...aabb1, maxX: 5, maxY: 5 };
      sweepPrune.updateAABB(updatedAABB);
      
      const allAABBs = sweepPrune.getAllAABBs();
      const foundAABB = allAABBs.find(aabb => aabb.id === 'aabb1');
      expect(foundAABB?.maxX).toBe(5);
      expect(foundAABB?.maxY).toBe(5);
    });

    it('should clear all AABBs', () => {
      sweepPrune.addAABB(aabb1);
      sweepPrune.addAABB(aabb2);
      sweepPrune.clear();
      
      const allAABBs = sweepPrune.getAllAABBs();
      expect(allAABBs.length).toBe(0);
    });
  });

  describe('Configuration Options', () => {
    it('should respect epsilon tolerance', () => {
      sweepPrune.updateConfig({ epsilon: 0.1 });
      
      const result = sweepPrune.detectCollisions([aabb1, aabb2]);
      
      expect(result.collisionPairs.length).toBeGreaterThan(0);
    });

    it('should use insertion sort for small arrays', () => {
      sweepPrune.updateConfig({ 
        useInsertionSort: true, 
        insertionSortThreshold: 10 
      });
      
      const result = sweepPrune.detectCollisions([aabb1, aabb2, aabb3]);
      
      expect(result.collisionPairs.length).toBeGreaterThan(0);
    });

    it('should use temporal coherence when enabled', () => {
      sweepPrune.updateConfig({ useTemporalCoherence: true });
      
      const result = sweepPrune.detectCollisions([aabb1, aabb2]);
      
      expect(result.collisionPairs.length).toBeGreaterThan(0);
    });

    it('should use multi-axis optimization when enabled', () => {
      sweepPrune.updateConfig({ useMultiAxisOptimization: true });
      
      const result = sweepPrune.detectCollisions([aabb1, aabb2]);
      
      expect(result.collisionPairs.length).toBeGreaterThan(0);
    });

    it('should enable incremental updates when configured', () => {
      sweepPrune.updateConfig({ enableIncrementalUpdates: true });
      
      sweepPrune.addAABB(aabb1);
      sweepPrune.addAABB(aabb2);
      
      const result = sweepPrune.detectCollisions();
      
      expect(result.collisionPairs.length).toBeGreaterThan(0);
    });

    it('should use spatial partitioning for large datasets', () => {
      sweepPrune.updateConfig({ 
        useSpatialPartitioning: true, 
        spatialCellSize: 10,
        maxAABBs: 5 
      });
      
      const result = sweepPrune.detectCollisions([aabb1, aabb2, aabb3, aabb4]);
      
      expect(result.collisionPairs.length).toBeGreaterThan(0);
    });
  });

  describe('Caching', () => {
    it('should cache collision results', () => {
      const aabbs = [aabb1, aabb2];
      
      const result1 = sweepPrune.detectCollisions(aabbs);
      expect(result1.collisionPairs.length).toBeGreaterThan(0);
      
      const result2 = sweepPrune.detectCollisions(aabbs);
      expect(result2.collisionPairs.length).toBeGreaterThan(0);
      expect(result2.executionTime).toBe(0); // Cached result
    });

    it('should clear cache when requested', () => {
      const aabbs = [aabb1, aabb2];
      
      // Cache a result
      sweepPrune.detectCollisions(aabbs);
      
      // Clear cache
      sweepPrune.clearCache();
      
      // Next call should not use cache
      const result = sweepPrune.detectCollisions(aabbs);
      expect(result.collisionPairs.length).toBeGreaterThan(0);
      expect(result.executionTime).toBeGreaterThan(0);
    });
  });

  describe('Statistics and Performance', () => {
    it('should collect statistics', () => {
      sweepPrune.detectCollisions([aabb1, aabb2]);
      
      const stats = sweepPrune.getStats();
      expect(stats.totalOperations).toBe(1);
      expect(stats.totalAABBsProcessed).toBe(2);
      expect(stats.averageExecutionTime).toBeGreaterThan(0);
    });

    it('should provide performance metrics', () => {
      sweepPrune.detectCollisions([aabb1, aabb2]);
      
      const metrics = sweepPrune.getPerformanceMetrics();
      expect(metrics.performanceScore).toBeGreaterThan(0);
      expect(metrics.cacheSize).toBeGreaterThanOrEqual(0);
      expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0);
    });

    it('should reset statistics', () => {
      sweepPrune.detectCollisions([aabb1, aabb2]);
      sweepPrune.resetStats();
      
      const stats = sweepPrune.getStats();
      expect(stats.totalOperations).toBe(0);
      expect(stats.totalAABBsProcessed).toBe(0);
    });
  });

  describe('Event Handling', () => {
    it('should emit events when debugging is enabled', () => {
      const eventHandler = vi.fn();
      const debugSweepPrune = new SweepPrune({ enableDebug: true, eventHandlers: [eventHandler] });
      
      debugSweepPrune.detectCollisions([aabb1, aabb2]);
      
      expect(eventHandler).toHaveBeenCalled();
    });

    it('should not emit events when debugging is disabled', () => {
      const eventHandler = vi.fn();
      const normalSweepPrune = new SweepPrune({ enableDebug: false, eventHandlers: [eventHandler] });
      
      normalSweepPrune.detectCollisions([aabb1, aabb2]);
      
      expect(eventHandler).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle AABBs with zero area', () => {
      const zeroAABB: AABB = {
        minX: 1,
        minY: 1,
        maxX: 1,
        maxY: 1,
        id: 'zero',
      };
      
      const result = sweepPrune.detectCollisions([aabb1, zeroAABB]);
      
      expect(result.collisionPairs.length).toBeGreaterThan(0);
    });

    it('should handle AABBs with negative coordinates', () => {
      const negativeAABB: AABB = {
        minX: -2,
        minY: -2,
        maxX: -1,
        maxY: -1,
        id: 'negative',
      };
      
      const result = sweepPrune.detectCollisions([aabb1, negativeAABB]);
      
      expect(result.collisionPairs.length).toBe(0);
    });

    it('should handle very large AABBs', () => {
      const largeAABB: AABB = {
        minX: -1000,
        minY: -1000,
        maxX: 1000,
        maxY: 1000,
        id: 'large',
      };
      
      const result = sweepPrune.detectCollisions([aabb1, largeAABB]);
      
      expect(result.collisionPairs.length).toBeGreaterThan(0);
    });

    it('should handle AABBs with floating-point coordinates', () => {
      const floatAABB: AABB = {
        minX: 0.5,
        minY: 0.5,
        maxX: 1.5,
        maxY: 1.5,
        id: 'float',
      };
      
      const result = sweepPrune.detectCollisions([aabb1, floatAABB]);
      
      expect(result.collisionPairs.length).toBeGreaterThan(0);
    });

    it('should handle AABBs that touch but do not overlap', () => {
      const touchingAABB: AABB = {
        minX: 2,
        minY: 0,
        maxX: 4,
        maxY: 2,
        id: 'touching',
      };
      
      const result = sweepPrune.detectCollisions([aabb1, touchingAABB]);
      
      // Touching edges should not be considered collisions
      expect(result.collisionPairs.length).toBe(0);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should complete collision detection within reasonable time', () => {
      const aabbs = [aabb1, aabb2, aabb3, aabb4];
      
      const startTime = performance.now();
      const result = sweepPrune.detectCollisions(aabbs);
      const endTime = performance.now();
      
      expect(result.collisionPairs.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(50); // Should complete within 50ms
    });

    it('should process reasonable number of endpoints', () => {
      const aabbs = [aabb1, aabb2, aabb3];
      
      const result = sweepPrune.detectCollisions(aabbs);
      
      expect(result.endpointsProcessed).toBeGreaterThan(0);
      expect(result.endpointsProcessed).toBeLessThanOrEqual(12); // 2 endpoints per AABB per axis
    });

    it('should perform reasonable number of axis sweeps', () => {
      const aabbs = [aabb1, aabb2, aabb3];
      
      const result = sweepPrune.detectCollisions(aabbs);
      
      expect(result.axisSweeps).toBeGreaterThan(0);
      expect(result.axisSweeps).toBeLessThanOrEqual(2); // X and Y axes
    });

    it('should scale efficiently with number of AABBs', () => {
      const smallAABBs = [aabb1, aabb2];
      const largeAABBs = [aabb1, aabb2, aabb3, aabb4];
      
      const smallResult = sweepPrune.detectCollisions(smallAABBs);
      const largeResult = sweepPrune.detectCollisions(largeAABBs);
      
      expect(largeResult.endpointsProcessed).toBeGreaterThan(smallResult.endpointsProcessed);
      expect(largeResult.axisSweeps).toBeGreaterThanOrEqual(smallResult.axisSweeps);
    });
  });

  describe('Integration', () => {
    it('should work with common AABB shapes', () => {
      const commonAABBs = [
        COMMON_AABBS.UNIT_SQUARE,
        COMMON_AABBS.OFFSET_SQUARE,
        COMMON_AABBS.LARGE_SQUARE,
      ];
      
      const result = sweepPrune.detectCollisions(commonAABBs);
      
      expect(result.collisionPairs.length).toBeGreaterThan(0);
      expect(result.totalAABBs).toBe(3);
    });

    it('should maintain consistency across multiple calls', () => {
      const aabbs = [aabb1, aabb2, aabb3];
      
      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(sweepPrune.detectCollisions(aabbs));
      }
      
      // All results should be identical
      for (let i = 1; i < results.length; i++) {
        expect(results[i].collisionPairs.length).toBe(results[0].collisionPairs.length);
        expect(results[i].activeCollisions).toBe(results[0].activeCollisions);
        expect(results[i].totalAABBs).toBe(results[0].totalAABBs);
      }
    });

    it('should handle complex AABB configurations', () => {
      // Create a complex scenario with multiple overlapping AABBs
      const complexAABBs: AABB[] = [
        { minX: 0, minY: 0, maxX: 2, maxY: 2, id: 'a' },
        { minX: 1, minY: 1, maxX: 3, maxY: 3, id: 'b' },
        { minX: 2, minY: 2, maxX: 4, maxY: 4, id: 'c' },
        { minX: 0.5, minY: 0.5, maxX: 1.5, maxY: 1.5, id: 'd' },
        { minX: 5, minY: 5, maxX: 7, maxY: 7, id: 'e' },
      ];
      
      const result = sweepPrune.detectCollisions(complexAABBs);
      
      expect(result.collisionPairs.length).toBeGreaterThan(0);
      expect(result.totalAABBs).toBe(5);
      expect(result.activeCollisions).toBeGreaterThan(0);
    });

    it('should work with incremental updates', () => {
      sweepPrune.updateConfig({ enableIncrementalUpdates: true });
      
      // Add AABBs incrementally
      sweepPrune.addAABB(aabb1);
      let result = sweepPrune.detectCollisions();
      expect(result.collisionPairs.length).toBe(0);
      
      sweepPrune.addAABB(aabb2);
      result = sweepPrune.detectCollisions();
      expect(result.collisionPairs.length).toBeGreaterThan(0);
      
      sweepPrune.addAABB(aabb3);
      result = sweepPrune.detectCollisions();
      expect(result.collisionPairs.length).toBeGreaterThan(0);
    });
  });
});
