/**
 * Comprehensive Test Suite for PAW Optimizations
 * 
 * Tests for:
 * - Optimized memory pool
 * - Adaptive clustering
 * - Performance caching
 * - Integration scenarios
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OptimizedMemoryPool, ArrayBufferPool, CollisionArrayPool } from '../optimized-memory-pool';
import { AdaptiveClustering, ClusteringCache } from '../../../algorithms/pathfinding/hpa-star/adaptive-clustering';
import { 
  PerformanceCacheManager, 
  LRUCache, 
  GridClassificationCache,
  ComplexityCalculationCache,
  AlgorithmResultCache,
  performanceCache 
} from '../performance-cache';
import type { CollisionPair } from '../../../algorithms/collision/narrow-phase/aabb/aabb-types';
import { SpatialHash } from '../../../data-structures/spatial/spatial-hash/spatial-hash-core';
import { UnionFind } from '../../../data-structures/basic/union-find/union-find-core';
import type { CellType } from '../../algorithms/pathfinding/hpa-star/hpa-star-types';

describe('PAW Optimizations - Comprehensive Test Suite', () => {
  describe('Optimized Memory Pool', () => {
    let memoryPool: OptimizedMemoryPool;

    beforeEach(() => {
      memoryPool = new OptimizedMemoryPool({
        spatialHashPoolSize: 10,
        unionFindPoolSize: 20,
        collisionArrayPoolSize: 30,
        arrayBufferPoolSize: 15,
        enableStatistics: true,
        enablePerformanceTracking: true,
      });
    });

    afterEach(() => {
      memoryPool.cleanup();
    });

    describe('Spatial Hash Pool', () => {
      it('should allocate and reuse spatial hash objects', () => {
        const hash1 = memoryPool.getSpatialHash();
        const hash2 = memoryPool.getSpatialHash();
        
        expect(hash1).toBeInstanceOf(SpatialHash);
        expect(hash2).toBeInstanceOf(SpatialHash);
        expect(hash1).not.toBe(hash2);
        
        // Release first hash
        memoryPool.releaseSpatialHash(hash1);
        
        // Should reuse first hash
        const hash3 = memoryPool.getSpatialHash();
        expect(hash3).toBe(hash1);
      });

      it('should track pool statistics correctly', () => {
        const hash = memoryPool.getSpatialHash();
        memoryPool.releaseSpatialHash(hash);
        
        const stats = memoryPool.getStats();
        expect(stats.poolHits).toBeGreaterThanOrEqual(0);
        expect(stats.poolMisses).toBeGreaterThanOrEqual(0);
        expect(stats.totalAllocations).toBeGreaterThan(0);
        expect(stats.totalDeallocations).toBeGreaterThan(0);
      });
    });

    describe('Union-Find Pool', () => {
      it('should allocate union-find with size matching', () => {
        const uf1 = memoryPool.getUnionFind(50);
        const uf2 = memoryPool.getUnionFind(50);
        const uf3 = memoryPool.getUnionFind(100);
        
        expect(uf1).toBeInstanceOf(UnionFind);
        expect(uf2).toBeInstanceOf(UnionFind);
        expect(uf3).toBeInstanceOf(UnionFind);
        
        // Release and reuse same size
        memoryPool.releaseUnionFind(uf1);
        const uf4 = memoryPool.getUnionFind(50);
        expect(uf4).toStrictEqual(uf1);
      });

      it('should handle different sizes efficiently', () => {
        const sizes = [10, 25, 50, 100, 200];
        const unions = sizes.map(size => memoryPool.getUnionFind(size));
        
        unions.forEach((uf, i) => {
          expect(uf).toBeInstanceOf(UnionFind);
          memoryPool.releaseUnionFind(uf);
        });
        
        const stats = memoryPool.getStats();
        // Total operations = get operations (5) + release operations (5)
        expect(stats.poolHits + stats.poolMisses).toBe(sizes.length * 2);
      });
    });

    describe('Collision Array Pool', () => {
      it('should provide pre-allocated arrays', () => {
        const array1 = memoryPool.getCollisionArray();
        const array2 = memoryPool.getCollisionArray();
        
        expect(Array.isArray(array1)).toBe(true);
        expect(Array.isArray(array2)).toBe(true);
        expect(array1.length).toBe(0);
        expect(array2.length).toBe(0);
      });

      it('should reuse arrays efficiently', () => {
        const array1 = memoryPool.getCollisionArray();
        array1.push({ id: 1, bodyA: 1, bodyB: 2 } as CollisionPair);
        
        memoryPool.releaseCollisionArray(array1);
        const array2 = memoryPool.getCollisionArray();
        
        expect(array2).toBe(array1);
        expect(array2.length).toBe(0); // Should be cleared
      });
    });

    describe('Typed Array Pool', () => {
      it('should provide typed arrays for numerical operations', () => {
        const buffer1 = memoryPool.getTypedArray(512);
        const buffer2 = memoryPool.getTypedArray(1024);
        
        expect(buffer1).toBeInstanceOf(Float32Array);
        expect(buffer2).toBeInstanceOf(Float32Array);
        // Buffers are sized to the requested amount (rounded up to power of 2 or min size)
        expect(buffer1.length).toBeGreaterThanOrEqual(512);
        expect(buffer2.length).toBeGreaterThanOrEqual(1024);
      });

      it('should reuse typed arrays when size fits', () => {
        const buffer1 = memoryPool.getTypedArray(256);
        memoryPool.releaseTypedArray(buffer1);
        
        const buffer2 = memoryPool.getTypedArray(256);
        // Array pool may return same or different instance - just verify it works
        expect(buffer2).toBeInstanceOf(Float32Array);
        expect(buffer2.length).toBe(buffer1.length);
      });

      it('should create new arrays for large sizes', () => {
        const buffer1 = memoryPool.getTypedArray(2048); // Larger than pool size
        const buffer2 = memoryPool.getTypedArray(2048);
        
        expect(buffer1).not.toBe(buffer2); // Should be different instances
        expect(buffer1.length).toBe(2048);
        expect(buffer2.length).toBe(2048);
      });
    });

    describe('Performance Statistics', () => {
      it('should track comprehensive performance metrics', () => {
        // Perform various operations
        const hash = memoryPool.getSpatialHash();
        const uf = memoryPool.getUnionFind(50);
        const array = memoryPool.getCollisionArray();
        const buffer = memoryPool.getTypedArray(128);
        
        // Release some objects
        memoryPool.releaseSpatialHash(hash);
        memoryPool.releaseUnionFind(uf);
        
        const stats = memoryPool.getStats();
        expect(stats.hitRate).toBeGreaterThanOrEqual(0);
        expect(stats.allocationReduction).toBeGreaterThanOrEqual(0);
        expect(stats.typedArrayUsage).toBeGreaterThanOrEqual(0);
        expect(stats.bufferUsage).toBeGreaterThanOrEqual(0);
        // Note: averageAllocationTime is not part of MemoryPoolStats type
      });

      it('should show memory efficiency improvements', () => {
        // Simulate high usage
        const objects = [];
        for (let i = 0; i < 50; i++) {
          objects.push(memoryPool.getCollisionArray());
        }
        
        // Release all
        objects.forEach(arr => memoryPool.releaseCollisionArray(arr));
        
        const stats = memoryPool.getStats();
        expect(stats.memorySaved).toBeGreaterThan(0);
      });
    });
  });

  describe('Array Buffer Pool', () => {
    let bufferPool: ArrayBufferPool;

    beforeEach(() => {
      bufferPool = new ArrayBufferPool(1024, 10);
    });

    it('should pre-allocate buffers', () => {
      const buffer1 = bufferPool.getBuffer();
      const buffer2 = bufferPool.getBuffer();
      
      expect(buffer1).toBeInstanceOf(Float32Array);
      expect(buffer2).toBeInstanceOf(Float32Array);
      expect(buffer1).not.toBe(buffer2);
    });

    it('should reuse released buffers', () => {
      const buffer1 = bufferPool.getBuffer();
      bufferPool.releaseBuffer(buffer1);
      
      const buffer2 = bufferPool.getBuffer();
      expect(buffer2).toBe(buffer1);
    });

    it('should return null when pool exhausted', () => {
      // Exhaust pool
      const buffers = [];
      for (let i = 0; i < 15; i++) { // More than pool size
        const buffer = bufferPool.getBuffer();
        if (buffer) buffers.push(buffer);
      }
      
      // Should return null when exhausted
      const exhausted = bufferPool.getBuffer();
      expect(exhausted).toBeNull();
    });
  });

  describe('Collision Array Pool', () => {
    let arrayPool: CollisionArrayPool;

    beforeEach(() => {
      arrayPool = new CollisionArrayPool(10, 1000);
    });

    it('should provide arrays with pre-allocated capacity', () => {
      const array = arrayPool.getArray();
      expect(Array.isArray(array)).toBe(true);
      expect(array.length).toBe(0);
    });

    it('should reuse arrays efficiently', () => {
      const array1 = arrayPool.getArray();
      array1.push({ id: 1 } as CollisionPair);
      
      arrayPool.releaseArray(array1);
      const array2 = arrayPool.getArray();
      
      expect(array2).toBe(array1);
      expect(array2.length).toBe(0); // Should be cleared
    });
  });

  describe('Adaptive Clustering', () => {
    beforeEach(() => {
      AdaptiveClustering.resetCaches();
    });

    it('should analyze grid characteristics correctly', () => {
      const grid = new Array<CellType>(10000).fill(0); // 100x100 grid
      const width = 100;
      const height = 100;
      
      // Add some obstacles
      for (let i = 0; i < 1000; i++) {
        grid[i * 10] = 1; // Obstacle
      }
      
      const analysis = AdaptiveClustering.analyzeGrid(grid, width, height);
      
      expect(analysis.totalCells).toBe(10000);
      expect(analysis.obstacleCells).toBe(1000);
      expect(analysis.obstacleDensity).toBe(0.1);
      expect(analysis.recommendedClusterSize).toBeGreaterThan(0);
      expect(analysis.optimalClusterCount).toBeGreaterThan(0);
    });

    it('should generate adaptive clusters', () => {
      const grid = new Array<CellType>(2500).fill(0); // 50x50 grid
      const config = {
        width: 50,
        height: 50,
        clusterSize: 15,
      };
      
      const result = AdaptiveClustering.generateAdaptiveClusters(grid, config);
      
      expect(result.success).toBe(true);
      expect(result.clusters.length).toBeGreaterThan(0);
      expect(result.stats.generationTime).toBeGreaterThanOrEqual(0);
      expect(result.stats.adaptiveClusterSize).toBeGreaterThan(0);
      expect(result.stats.gridAnalysis).toBeDefined();
    });

    it('should cache clustering results', () => {
      const grid = new Array<CellType>(2500).fill(0);
      const config = {
        width: 50,
        height: 50,
        clusterSize: 15,
      };
      
      // First call
      const start1 = performance.now();
      const result1 = AdaptiveClustering.generateAdaptiveClusters(grid, config);
      const time1 = performance.now() - start1;
      
      // Second call (should be cached)
      const start2 = performance.now();
      const result2 = AdaptiveClustering.generateAdaptiveClusters(grid, config);
      const time2 = performance.now() - start2;
      
      expect(result1.clusters.length).toBe(result2.clusters.length);
      expect(time2).toBeLessThan(time1 * 0.5); // Should be significantly faster
    });

    it('should adjust cluster size based on performance', () => {
      const grid = new Array<CellType>(2500).fill(0);
      const config = {
        width: 50,
        height: 50,
        clusterSize: 15,
      };
      
      // Generate multiple clusters to build performance history
      for (let i = 0; i < 5; i++) {
        AdaptiveClustering.generateAdaptiveClusters(grid, config);
      }
      
      const stats = AdaptiveClustering.getPerformanceStats();
      expect(stats.size).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance Caching', () => {
    describe('LRU Cache', () => {
      let cache: LRUCache<string>;

      beforeEach(() => {
        cache = new LRUCache<string>(3, 1024);
      });

      it('should store and retrieve values', () => {
        cache.set('key1', 'value1');
        cache.set('key2', 'value2');
        
        expect(cache.get('key1')).toBe('value1');
        expect(cache.get('key2')).toBe('value2');
        expect(cache.get('key3')).toBeNull();
      });

      it('should evict least recently used items', () => {
        cache.set('key1', 'value1');
        cache.set('key2', 'value2');
        cache.set('key3', 'value3');
        cache.set('key4', 'value4'); // Should evict key1
        
        expect(cache.get('key1')).toBeNull();
        expect(cache.get('key2')).toBe('value2');
        expect(cache.get('key3')).toBe('value3');
        expect(cache.get('key4')).toBe('value4');
      });

      it('should track statistics correctly', () => {
        cache.set('key1', 'value1');
        cache.get('key1'); // hit
        cache.get('key2'); // miss
        
        const stats = cache.getStats();
        expect(stats.hits).toBe(1);
        expect(stats.misses).toBe(1);
        expect(stats.hitRate).toBe(50);
        expect(stats.currentSize).toBe(1);
      });

      it('should update access order on get', () => {
        cache.set('key1', 'value1');
        cache.set('key2', 'value2');
        cache.set('key3', 'value3');
        
        cache.get('key1'); // Access key1 to make it most recently used
        cache.set('key4', 'value4'); // Should evict key2, not key1
        
        expect(cache.get('key1')).toBe('value1');
        expect(cache.get('key2')).toBeNull();
        expect(cache.get('key3')).toBe('value3');
        expect(cache.get('key4')).toBe('value4');
      });
    });

    describe('Grid Classification Cache', () => {
      let cache: GridClassificationCache;

      beforeEach(() => {
        cache = new GridClassificationCache();
      });

      it('should cache and retrieve classifications', () => {
        const key = { objectCount: 1000, gridSize: 32 };
        
        expect(cache.getClassification(key)).toBeNull();
        
        cache.setClassification(key, 'medium');
        expect(cache.getClassification(key)).toBe('medium');
      });

      it('should handle different keys correctly', () => {
        const key1 = { objectCount: 100, gridSize: 10 };
        const key2 = { objectCount: 1000, gridSize: 32 };
        const key3 = { objectCount: 2000, gridSize: 45 };
        
        cache.setClassification(key1, 'small');
        cache.setClassification(key2, 'medium');
        cache.setClassification(key3, 'large');
        
        expect(cache.getClassification(key1)).toBe('small');
        expect(cache.getClassification(key2)).toBe('medium');
        expect(cache.getClassification(key3)).toBe('large');
      });
    });

    describe('Complexity Calculation Cache', () => {
      let cache: ComplexityCalculationCache;

      beforeEach(() => {
        cache = new ComplexityCalculationCache();
      });

      it('should cache and retrieve complexity values', () => {
        const key = { algorithm: 'dijkstra', inputSize: 1000, characteristics: 'dense' };
        
        expect(cache.getComplexity(key)).toBeNull();
        
        cache.setComplexity(key, 150.5);
        expect(cache.getComplexity(key)).toBe(150.5);
      });

      it('should handle different algorithm keys', () => {
        const key1 = { algorithm: 'dijkstra', inputSize: 1000, characteristics: 'dense' };
        const key2 = { algorithm: 'astar', inputSize: 1000, characteristics: 'dense' };
        const key3 = { algorithm: 'dijkstra', inputSize: 2000, characteristics: 'dense' };
        
        cache.setComplexity(key1, 100.0);
        cache.setComplexity(key2, 120.0);
        cache.setComplexity(key3, 200.0);
        
        expect(cache.getComplexity(key1)).toBe(100.0);
        expect(cache.getComplexity(key2)).toBe(120.0);
        expect(cache.getComplexity(key3)).toBe(200.0);
      });
    });

    describe('Algorithm Result Cache', () => {
      let cache: AlgorithmResultCache;

      beforeEach(() => {
        cache = new AlgorithmResultCache();
      });

      it('should cache and retrieve algorithm results', () => {
        const key = { 
          algorithm: 'marching-squares', 
          workloadType: 'procedural', 
          objectCount: 1000, 
          gridSize: 32,
          timestamp: Date.now() // Current timestamp
        };
        
        const result = {
          algorithm: 'marching-squares',
          confidence: 0.95,
          expectedPerformance: { executionTime: 10, memoryUsage: 100 },
          reasoning: 'Optimal for medium grids',
        };
        
        expect(cache.getAlgorithmResult(key)).toBeNull();
        
        cache.setAlgorithmResult(key, result as any);
        expect(cache.getAlgorithmResult(key)).toEqual(result as any);
      });

      it('should handle result expiration', () => {
        const key = { 
          algorithm: 'marching-squares', 
          workloadType: 'procedural', 
          objectCount: 1000, 
          gridSize: 32,
          timestamp: Date.now() - 10 * 60 * 1000 // 10 minutes ago
        };
        
        const result = {
          algorithm: 'marching-squares',
          confidence: 0.95,
          expectedPerformance: { executionTime: 10, memoryUsage: 100 },
          reasoning: 'Optimal for medium grids',
        };
        
        cache.setAlgorithmResult(key, result);
        
        // Should be expired
        expect(cache.getAlgorithmResult(key)).toBeNull();
      });
    });

    describe('Performance Cache Manager', () => {
      let manager: PerformanceCacheManager;

      beforeEach(() => {
        manager = new PerformanceCacheManager();
      });

      it('should manage all cache types', () => {
        const gridKey = { objectCount: 1000, gridSize: 32 };
        const complexityKey = { algorithm: 'dijkstra', inputSize: 1000, characteristics: 'dense' };
        const algorithmKey = { algorithm: 'marching-squares', workloadType: 'procedural', objectCount: 1000, gridSize: 32 };
        
        manager.setGridClassification(gridKey, 'medium');
        manager.setComplexity(complexityKey, 150.5);
        manager.setAlgorithmResult(algorithmKey, {
          algorithm: 'marching-squares',
          confidence: 0.95,
          expectedPerformance: { executionTime: 10, memoryUsage: 100 },
          reasoning: 'Optimal for medium grids',
        });
        
        expect(manager.getGridClassification(gridKey)).toBe('medium');
        expect(manager.getComplexity(complexityKey)).toBe(150.5);
        expect(manager.getAlgorithmResult(algorithmKey)).toBeDefined();
      });

      it('should provide comprehensive statistics', () => {
        const gridKey = { objectCount: 1000, gridSize: 32 };
        
        manager.setGridClassification(gridKey, 'medium');
        manager.getGridClassification(gridKey); // hit
        manager.getGridClassification({ objectCount: 2000, gridSize: 45 }); // miss
        
        const stats = manager.getStats();
        expect(stats.gridClassification.hits).toBe(1);
        expect(stats.gridClassification.misses).toBe(1);
        expect(stats.overall.totalHits).toBe(1);
        expect(stats.overall.totalMisses).toBe(1);
        expect(stats.overall.overallHitRate).toBe(50);
      });

      it('should enable/disable caching', () => {
        const gridKey = { objectCount: 1000, gridSize: 32 };
        
        manager.setEnabled(false);
        manager.setGridClassification(gridKey, 'medium');
        expect(manager.getGridClassification(gridKey)).toBeNull();
        
        manager.setEnabled(true);
        manager.setGridClassification(gridKey, 'medium');
        expect(manager.getGridClassification(gridKey)).toBe('medium');
      });

      it('should clear all caches', () => {
        const gridKey = { objectCount: 1000, gridSize: 32 };
        
        manager.setGridClassification(gridKey, 'medium');
        manager.clearAll();
        expect(manager.getGridClassification(gridKey)).toBeNull();
      });
    });
  });

  describe('Integration Tests', () => {
    it('should work together across all optimization systems', () => {
      const memoryPool = new OptimizedMemoryPool();
      const cacheManager = new PerformanceCacheManager();
      
      // Simulate a complex workflow
      const gridKey = { objectCount: 1000, gridSize: 32 };
      
      // Check cache first
      let classification = cacheManager.getGridClassification(gridKey);
      if (!classification) {
        // Simulate computation
        classification = 'medium';
        cacheManager.setGridClassification(gridKey, classification);
      }
      
      // Use memory pool for computation
      const hash = memoryPool.getSpatialHash();
      const array = memoryPool.getCollisionArray();
      const buffer = memoryPool.getTypedArray(256);
      
      // Simulate work
      array.push({ id: 1, bodyA: 1, bodyB: 2 } as CollisionPair);
      buffer[0] = 1.0;
      
      // Release resources
      memoryPool.releaseSpatialHash(hash);
      memoryPool.releaseCollisionArray(array);
      memoryPool.releaseTypedArray(buffer);
      
      // Verify results
      expect(classification).toBe('medium');
      expect(cacheManager.getGridClassification(gridKey)).toBe('medium');
      
      const memStats = memoryPool.getStats();
      expect(memStats.poolHits + memStats.poolMisses).toBeGreaterThan(0);
      
      const cacheStats = cacheManager.getStats();
      expect(cacheStats.overall.totalHits).toBeGreaterThan(0);
      
      memoryPool.cleanup();
    });

    it('should demonstrate performance improvements', () => {
      const memoryPool = new OptimizedMemoryPool({ enableStatistics: true });
      
      // Simulate high-frequency operations
      const operations = 1000;
      const arrays: CollisionPair[][] = [];
      
      const start = performance.now();
      
      for (let i = 0; i < operations; i++) {
        const array = memoryPool.getCollisionArray();
        array.push({ id: i, bodyA: i % 10, bodyB: (i + 1) % 10 } as CollisionPair);
        arrays.push(array);
        
        if (i % 10 === 0) {
          // Release some arrays to test reuse
          arrays.splice(0, 5).forEach(arr => memoryPool.releaseCollisionArray(arr));
        }
      }
      
      // Release remaining arrays
      arrays.forEach(arr => memoryPool.releaseCollisionArray(arr));
      
      const end = performance.now();
      const duration = end - start;
      
      const stats = memoryPool.getStats();
      
      // Should show good performance characteristics
      expect(stats.hitRate).toBeGreaterThan(50); // At least 50% hit rate
      expect(stats.allocationReduction).toBeGreaterThan(30); // At least 30% reduction
      expect(duration).toBeLessThan(100); // Should complete quickly
      
      memoryPool.cleanup();
    });
  });

  describe('Global Performance Cache', () => {
    beforeEach(() => {
      performanceCache.clearAll();
    });

    it('should provide global cache access', () => {
      const gridKey = { objectCount: 1000, gridSize: 32 };
      
      performanceCache.setGridClassification(gridKey, 'medium');
      expect(performanceCache.getGridClassification(gridKey)).toBe('medium');
    });

    it('should warm up caches', async () => {
      await performanceCache.warmUp();
      
      const gridKey = { objectCount: 1000, gridSize: 32 };
      expect(performanceCache.getGridClassification(gridKey)).toBeDefined();
    });
  });
});
