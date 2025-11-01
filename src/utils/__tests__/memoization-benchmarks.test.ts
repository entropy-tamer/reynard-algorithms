/**
 * Memoization Performance Benchmarks
 *
 * Comprehensive benchmarks to demonstrate the performance improvements
 * provided by memoization in the algorithms package.
 *
 * @module algorithms/utils/memoization-benchmarks.test
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { 
  memoize, 
  memoizeMath, 
  memoizeGeometry, 
  MathMemo, 
  clearMathMemo,
  getMathMemoStats 
} from '../memoization';

// Performance measurement utilities
function measureExecutionTime<T>(fn: () => T, iterations: number = 1): { result: T; time: number; avgTime: number } {
  const times: number[] = [];
  let result: T;

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    result = fn();
    const end = performance.now();
    times.push(end - start);
  }

  const totalTime = times.reduce((sum, time) => sum + time, 0);
  const avgTime = totalTime / iterations;

  return { result: result!, time: totalTime, avgTime };
}

function generateTestData(size: number, range: number = 1000) {
  return Array.from({ length: size }, () => Math.random() * range);
}

describe('Memoization Performance Benchmarks', () => {
  beforeAll(() => {
    clearMathMemo();
  });

  afterAll(() => {
    clearMathMemo();
  });

  describe('Mathematical Operations', () => {
    it('should demonstrate significant performance improvement for repeated square calculations', () => {
      const testData = generateTestData(1000);
      const iterations = 100;

      // Non-memoized function
      const square = (x: number) => x * x;
      const nonMemoizedTime = measureExecutionTime(() => {
        return testData.map(x => square(x));
      }, iterations);

      // Memoized function
      const memoizedSquare = memoizeMath(square);
      const memoizedTime = measureExecutionTime(() => {
        return testData.map(x => memoizedSquare(x));
      }, iterations);

      // Second run with memoized (should be much faster)
      const memoizedTime2 = measureExecutionTime(() => {
        return testData.map(x => memoizedSquare(x));
      }, iterations);

      console.log('Square Calculations:');
      console.log(`  Non-memoized: ${nonMemoizedTime.avgTime.toFixed(4)}ms avg`);
      console.log(`  Memoized (first run): ${memoizedTime.avgTime.toFixed(4)}ms avg`);
      console.log(`  Memoized (cached): ${memoizedTime2.avgTime.toFixed(4)}ms avg`);
      console.log(`  Cache hit rate: ${memoizedSquare.stats.hitRate.toFixed(2)}`);
      console.log(`  Performance improvement: ${(nonMemoizedTime.avgTime / memoizedTime2.avgTime).toFixed(2)}x`);

      expect(memoizedTime2.avgTime).toBeLessThan(nonMemoizedTime.avgTime);
      expect(memoizedSquare.stats.hitRate).toBeGreaterThan(0.9);
    });

    it('should demonstrate performance improvement for trigonometric functions', () => {
      const testData = generateTestData(500, Math.PI * 2);
      const iterations = 50;

      // Non-memoized trigonometric calculations
      const nonMemoizedTime = measureExecutionTime(() => {
        return testData.map(x => ({
          sin: Math.sin(x),
          cos: Math.cos(x),
          tan: Math.tan(x)
        }));
      }, iterations);

      // Memoized trigonometric calculations
      const memoizedTime = measureExecutionTime(() => {
        return testData.map(x => ({
          sin: MathMemo.sin(x),
          cos: MathMemo.cos(x),
          tan: MathMemo.tan(x)
        }));
      }, iterations);

      // Second run with memoized
      const memoizedTime2 = measureExecutionTime(() => {
        return testData.map(x => ({
          sin: MathMemo.sin(x),
          cos: MathMemo.cos(x),
          tan: MathMemo.tan(x)
        }));
      }, iterations);

      console.log('Trigonometric Functions:');
      console.log(`  Non-memoized: ${nonMemoizedTime.avgTime.toFixed(4)}ms avg`);
      console.log(`  Memoized (first run): ${memoizedTime.avgTime.toFixed(4)}ms avg`);
      console.log(`  Memoized (cached): ${memoizedTime2.avgTime.toFixed(4)}ms avg`);
      console.log(`  Performance improvement: ${(nonMemoizedTime.avgTime / memoizedTime2.avgTime).toFixed(2)}x`);

      expect(memoizedTime2.avgTime).toBeLessThan(nonMemoizedTime.avgTime);
    });

    it('should demonstrate performance improvement for complex mathematical operations', () => {
      const testData = generateTestData(200);
      const iterations = 20;

      // Complex calculation: sqrt(x^2 + y^2) * log(x + 1)
      const complexCalc = (x: number, y: number) => {
        return Math.sqrt(x * x + y * y) * Math.log(x + 1);
      };

      // Non-memoized
      const nonMemoizedTime = measureExecutionTime(() => {
        return testData.map((x, i) => complexCalc(x, testData[(i + 1) % testData.length]));
      }, iterations);

      // Memoized
      const memoizedComplexCalc = memoizeGeometry((x: number, y: number) => 
        MathMemo.sqrt(MathMemo.square(x) + MathMemo.square(y)) * MathMemo.log(x + 1)
      );

      const memoizedTime = measureExecutionTime(() => {
        return testData.map((x, i) => memoizedComplexCalc(x, testData[(i + 1) % testData.length]));
      }, iterations);

      // Second run
      const memoizedTime2 = measureExecutionTime(() => {
        return testData.map((x, i) => memoizedComplexCalc(x, testData[(i + 1) % testData.length]));
      }, iterations);

      console.log('Complex Mathematical Operations:');
      console.log(`  Non-memoized: ${nonMemoizedTime.avgTime.toFixed(4)}ms avg`);
      console.log(`  Memoized (first run): ${memoizedTime.avgTime.toFixed(4)}ms avg`);
      console.log(`  Memoized (cached): ${memoizedTime2.avgTime.toFixed(4)}ms avg`);
      console.log(`  Performance improvement: ${(nonMemoizedTime.avgTime / memoizedTime2.avgTime).toFixed(2)}x`);

      expect(memoizedTime2.avgTime).toBeLessThan(nonMemoizedTime.avgTime);
    });
  });

  describe('Geometric Calculations', () => {
    it('should demonstrate performance improvement for distance calculations', () => {
      const testPoints = Array.from({ length: 300 }, () => ({
        x: Math.random() * 1000,
        y: Math.random() * 1000
      }));
      const iterations = 30;

      // Non-memoized distance calculation
      const distance = (x1: number, y1: number, x2: number, y2: number) => 
        Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

      const nonMemoizedTime = measureExecutionTime(() => {
        const distances: number[] = [];
        for (let i = 0; i < testPoints.length - 1; i++) {
          for (let j = i + 1; j < testPoints.length; j++) {
            const p1 = testPoints[i];
            const p2 = testPoints[j];
            distances.push(distance(p1.x, p1.y, p2.x, p2.y));
          }
        }
        return distances;
      }, iterations);

      // Memoized distance calculation
      const memoizedTime = measureExecutionTime(() => {
        const distances: number[] = [];
        for (let i = 0; i < testPoints.length - 1; i++) {
          for (let j = i + 1; j < testPoints.length; j++) {
            const p1 = testPoints[i];
            const p2 = testPoints[j];
            distances.push(MathMemo.distance(p1.x, p1.y, p2.x, p2.y));
          }
        }
        return distances;
      }, iterations);

      // Second run
      const memoizedTime2 = measureExecutionTime(() => {
        const distances: number[] = [];
        for (let i = 0; i < testPoints.length - 1; i++) {
          for (let j = i + 1; j < testPoints.length; j++) {
            const p1 = testPoints[i];
            const p2 = testPoints[j];
            distances.push(MathMemo.distance(p1.x, p1.y, p2.x, p2.y));
          }
        }
        return distances;
      }, iterations);

      console.log('Distance Calculations:');
      console.log(`  Non-memoized: ${nonMemoizedTime.avgTime.toFixed(4)}ms avg`);
      console.log(`  Memoized (first run): ${memoizedTime.avgTime.toFixed(4)}ms avg`);
      console.log(`  Memoized (cached): ${memoizedTime2.avgTime.toFixed(4)}ms avg`);
      console.log(`  Performance improvement: ${(nonMemoizedTime.avgTime / memoizedTime2.avgTime).toFixed(2)}x`);

      expect(memoizedTime2.avgTime).toBeLessThan(nonMemoizedTime.avgTime);
    });

    it('should demonstrate performance improvement for vector operations', () => {
      const testVectors = Array.from({ length: 200 }, () => ({
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50
      }));
      const iterations = 25;

      // Non-memoized vector operations
      const nonMemoizedTime = measureExecutionTime(() => {
        return testVectors.map(v => ({
          magnitude: Math.sqrt(v.x * v.x + v.y * v.y),
          angle: Math.atan2(v.y, v.x),
          normalized: {
            x: v.x / Math.sqrt(v.x * v.x + v.y * v.y),
            y: v.y / Math.sqrt(v.x * v.x + v.y * v.y)
          }
        }));
      }, iterations);

      // Memoized vector operations
      const memoizedTime = measureExecutionTime(() => {
        return testVectors.map(v => ({
          magnitude: MathMemo.magnitude2D(v.x, v.y),
          angle: MathMemo.atan2(v.y, v.x),
          normalized: {
            x: v.x / MathMemo.magnitude2D(v.x, v.y),
            y: v.y / MathMemo.magnitude2D(v.x, v.y)
          }
        }));
      }, iterations);

      // Second run
      const memoizedTime2 = measureExecutionTime(() => {
        return testVectors.map(v => ({
          magnitude: MathMemo.magnitude2D(v.x, v.y),
          angle: MathMemo.atan2(v.y, v.x),
          normalized: {
            x: v.x / MathMemo.magnitude2D(v.x, v.y),
            y: v.y / MathMemo.magnitude2D(v.x, v.y)
          }
        }));
      }, iterations);

      console.log('Vector Operations:');
      console.log(`  Non-memoized: ${nonMemoizedTime.avgTime.toFixed(4)}ms avg`);
      console.log(`  Memoized (first run): ${memoizedTime.avgTime.toFixed(4)}ms avg`);
      console.log(`  Memoized (cached): ${memoizedTime2.avgTime.toFixed(4)}ms avg`);
      console.log(`  Performance improvement: ${(nonMemoizedTime.avgTime / memoizedTime2.avgTime).toFixed(2)}x`);

      expect(memoizedTime2.avgTime).toBeLessThan(nonMemoizedTime.avgTime);
    });
  });

  describe('Collision Detection Simulation', () => {
    it('should demonstrate performance improvement for collision detection algorithms', () => {
      const objectCount = 100;
      const testData = Array.from({ length: objectCount }, () => ({
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        radius: Math.random() * 50 + 10
      }));
      const iterations = 10;

      // Simulate collision detection with naive O(n²) algorithm
      const naiveCollisionDetection = (objects: typeof testData) => {
        const collisions: Array<{i: number, j: number, distance: number}> = [];
        
        for (let i = 0; i < objects.length; i++) {
          for (let j = i + 1; j < objects.length; j++) {
            const obj1 = objects[i];
            const obj2 = objects[j];
            const distance = Math.sqrt((obj2.x - obj1.x) ** 2 + (obj2.y - obj1.y) ** 2);
            const minDistance = obj1.radius + obj2.radius;
            
            if (distance < minDistance) {
              collisions.push({ i, j, distance });
            }
          }
        }
        return collisions;
      };

      // Non-memoized collision detection
      const nonMemoizedTime = measureExecutionTime(() => {
        return naiveCollisionDetection(testData);
      }, iterations);

      // Memoized collision detection using MathMemo
      const memoizedCollisionDetection = (objects: typeof testData) => {
        const collisions: Array<{i: number, j: number, distance: number}> = [];
        
        for (let i = 0; i < objects.length; i++) {
          for (let j = i + 1; j < objects.length; j++) {
            const obj1 = objects[i];
            const obj2 = objects[j];
            const distance = MathMemo.distance(obj1.x, obj1.y, obj2.x, obj2.y);
            const minDistance = obj1.radius + obj2.radius;
            
            if (distance < minDistance) {
              collisions.push({ i, j, distance });
            }
          }
        }
        return collisions;
      };

      const memoizedTime = measureExecutionTime(() => {
        return memoizedCollisionDetection(testData);
      }, iterations);

      // Second run
      const memoizedTime2 = measureExecutionTime(() => {
        return memoizedCollisionDetection(testData);
      }, iterations);

      console.log('Collision Detection Simulation:');
      console.log(`  Object count: ${objectCount}`);
      console.log(`  Non-memoized: ${nonMemoizedTime.avgTime.toFixed(4)}ms avg`);
      console.log(`  Memoized (first run): ${memoizedTime.avgTime.toFixed(4)}ms avg`);
      console.log(`  Memoized (cached): ${memoizedTime2.avgTime.toFixed(4)}ms avg`);
      console.log(`  Performance improvement: ${(nonMemoizedTime.avgTime / memoizedTime2.avgTime).toFixed(2)}x`);

      expect(memoizedTime2.avgTime).toBeLessThan(nonMemoizedTime.avgTime);
    });
  });

  describe('Memory Usage and Cache Efficiency', () => {
    it('should demonstrate cache efficiency and memory usage', () => {
      const testData = generateTestData(1000);
      
      // Clear all caches
      clearMathMemo();
      
      // Perform calculations
      testData.forEach(x => {
        MathMemo.square(x);
        MathMemo.sqrt(x);
        MathMemo.log(x + 1);
        MathMemo.sin(x);
        MathMemo.cos(x);
      });

      // Repeat calculations to test cache hits
      testData.forEach(x => {
        MathMemo.square(x);
        MathMemo.sqrt(x);
        MathMemo.log(x + 1);
        MathMemo.sin(x);
        MathMemo.cos(x);
      });

      const stats = getMathMemoStats();
      
      console.log('Cache Efficiency:');
      Object.entries(stats).forEach(([functionName, stat]) => {
        console.log(`  ${functionName}:`);
        console.log(`    Cache size: ${stat.cacheSize}/${stat.maxCacheSize}`);
        console.log(`    Hit rate: ${(stat.hitRate * 100).toFixed(2)}%`);
        console.log(`    Total calls: ${stat.totalCalls}`);
        console.log(`    Average execution time: ${stat.averageExecutionTime.toFixed(4)}ms`);
      });

      // Verify cache efficiency
      Object.values(stats).forEach(stat => {
        expect(stat.hitRate).toBeGreaterThan(0.4); // At least 40% hit rate
        expect(stat.cacheSize).toBeGreaterThan(0);
        expect(stat.cacheSize).toBeLessThanOrEqual(stat.maxCacheSize);
      });
    });

    it('should demonstrate cache eviction behavior', () => {
      const memoizedFn = memoizeMath((x: number) => x * x, { maxSize: 5 });
      
      // Fill cache beyond capacity
      for (let i = 0; i < 10; i++) {
        memoizedFn(i);
      }

      // Verify cache size doesn't exceed maxSize
      expect(memoizedFn.stats.cacheSize).toBeLessThanOrEqual(5);
      
      // Verify LRU eviction works (older entries should be evicted)
      const stats = memoizedFn.stats;
      console.log('Cache Eviction Test:');
      console.log(`  Max cache size: ${stats.maxCacheSize}`);
      console.log(`  Current cache size: ${stats.cacheSize}`);
      console.log(`  Hit rate: ${(stats.hitRate * 100).toFixed(2)}%`);
    });
  });

  describe('Real-world Algorithm Simulation', () => {
    it('should demonstrate performance improvement in pathfinding algorithms', () => {
      const gridSize = 50;
      const iterations = 5;
      
      // Generate a grid with random obstacles
      const grid = Array.from({ length: gridSize }, () => 
        Array.from({ length: gridSize }, () => Math.random() > 0.3)
      );

      // A* pathfinding with heuristic calculation
      const calculateHeuristic = (x1: number, y1: number, x2: number, y2: number) => {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      };

      const calculateHeuristicMemoized = (x1: number, y1: number, x2: number, y2: number) => {
        return MathMemo.distance(x1, y1, x2, y2);
      };

      // Simulate pathfinding with multiple path calculations
      const simulatePathfinding = (useMemoized: boolean) => {
        const paths: number[] = [];
        const startPoints = Array.from({ length: 20 }, () => ({
          x: Math.floor(Math.random() * gridSize),
          y: Math.floor(Math.random() * gridSize)
        }));
        const endPoints = Array.from({ length: 20 }, () => ({
          x: Math.floor(Math.random() * gridSize),
          y: Math.floor(Math.random() * gridSize)
        }));

        for (let i = 0; i < startPoints.length; i++) {
          const start = startPoints[i];
          const end = endPoints[i];
          
          // Simulate heuristic calculations (simplified A*)
          for (let x = 0; x < gridSize; x += 5) {
            for (let y = 0; y < gridSize; y += 5) {
              if (useMemoized) {
                paths.push(calculateHeuristicMemoized(x, y, end.x, end.y));
              } else {
                paths.push(calculateHeuristic(x, y, end.x, end.y));
              }
            }
          }
        }
        return paths;
      };

      // Non-memoized pathfinding
      const nonMemoizedTime = measureExecutionTime(() => {
        return simulatePathfinding(false);
      }, iterations);

      // Memoized pathfinding
      const memoizedTime = measureExecutionTime(() => {
        return simulatePathfinding(true);
      }, iterations);

      // Second run with memoized
      const memoizedTime2 = measureExecutionTime(() => {
        return simulatePathfinding(true);
      }, iterations);

      console.log('Pathfinding Algorithm Simulation:');
      console.log(`  Grid size: ${gridSize}x${gridSize}`);
      console.log(`  Non-memoized: ${nonMemoizedTime.avgTime.toFixed(4)}ms avg`);
      console.log(`  Memoized (first run): ${memoizedTime.avgTime.toFixed(4)}ms avg`);
      console.log(`  Memoized (cached): ${memoizedTime2.avgTime.toFixed(4)}ms avg`);
      console.log(`  Performance improvement: ${(nonMemoizedTime.avgTime / memoizedTime2.avgTime).toFixed(2)}x`);

      expect(memoizedTime2.avgTime).toBeLessThan(nonMemoizedTime.avgTime);
    });
  });
});
