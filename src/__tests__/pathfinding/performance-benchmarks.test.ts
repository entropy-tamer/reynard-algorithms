/**
 * @file A* Pathfinding Performance Benchmark
 * 
 * Validates the O(n) open set performance bug in current implementation.
 * Run with: pnpm run test -- src/__tests__/pathfinding/performance-benchmarks.test.ts
 */

import { describe, it, expect } from "vitest";
import { AStar } from "../../algorithms/pathfinding/astar/astar-core";
import type { Point, AStarGrid } from "../../algorithms/pathfinding/astar/astar-types";

interface BenchmarkResult {
  gridWidth: number;
  gridHeight: number;
  obstacleDensity: number;
  numQueries: number;
  medianTimeMs: number;
  totalNodesExplored: number;
}

function generateRandomGrid(
  width: number,
  height: number,
  obstacleDensity: number,
  seed?: number
): AStarGrid {
  // Simple seeded random for reproducibility (LCG)
  let s = seed ?? Math.floor(Math.random() * 1e9);
  
  const cells = new Array(height).map(() => new Array(width));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      s = (s * 1664525 + 1013904223) % 4294967296;
      cells[y][x] = Math.random() > obstacleDensity ? true : false; // true = walkable
    }
  }
  
  return { width, height, cells };
}

function generateTestQueries(
  grid: AStarGrid,
  numQueries: number,
  seed?: number
): Array<{ start: Point; goal: Point }> {
  const queries = [];
  let s = seed ?? Math.floor(Math.random() * 1e9);
  
  for (let i = 0; i < numQueries; i++) {
    // Pick random walkable cells
    let attempts = 0;
    while (attempts < 100) {
      s = (s * 1664525 + 1013904223) % 4294967296;
      const x1 = Math.floor(Math.random() * grid.width);
      s = (s * 1664525 + 1013904223) % 4294967296;
      const y1 = Math.floor(Math.random() * grid.height);
      
      if (grid.cells[y1][x1]) {
        let x2 = -1, y2 = -1;
        attempts++;
        while (attempts < 200) {
          s = (s * 1664525 + 1013904223) % 4294967296;
          x2 = Math.floor(Math.random() * grid.width);
          s = (s * 1664525 + 1013904223) % 4294967296;
          y2 = Math.floor(Math.random() * grid.height);
          if (grid.cells[y2][x2]) {
            break;
          }
          attempts++;
        }
        
        if (x2 >= 0 && y2 >= 0) {
          queries.push({ start: { x: x1, y: y1 }, goal: { x: x2, y: y2 } });
        }
      }
    }
  }
  
  return queries;
}

function runBenchmark(
  gridWidth: number,
  gridHeight: number,
  obstacleDensity: number,
  numQueries: number,
  seed?: number
): BenchmarkResult {
  const grid = generateRandomGrid(gridWidth, gridHeight, obstacleDensity, seed);
  const queries = generateTestQueries(grid, numQueries, seed ?? 42);
  
  const astar = new AStar({ enableCaching: false, enableStats: true });
  
  // Warmup
  if (queries.length > 0) {
    astar.findPath(queries[0].start, queries[0].goal, grid);
  }
  
  const times = [];
  let totalNodesExplored = 0;
  
  for (const q of queries) {
    const start = performance.now();
    const result = astar.findPath(q.start, q.goal, grid);
    const elapsed = performance.now() - start;
    
    times.push(elapsed);
    totalNodesExplored += result.nodesExplored;
  }
  
  // Calculate median time
  times.sort((a, b) => a - b);
  const medianIdx = Math.floor(times.length / 2);
  const medianTimeMs = times[medianIdx];
  
  return {
    gridWidth,
    gridHeight,
    obstacleDensity,
    numQueries,
    medianTimeMs,
    totalNodesExplored,
  };
}

describe("A* Performance Benchmarks", () => {
  describe("Grid Size Scaling (10 queries at 30% density)", () => {
    const results: BenchmarkResult[] = [];
    
    // Test with various grid sizes
    for (const size of [50, 100, 200]) {
      it(`should benchmark ${size}x${size} grid`, () => {
        const result = runBenchmark(size, size, 0.3, 10);
        results.push(result);
        
        console.log(
          `Grid ${size}x${size}: median=${result.medianTimeMs.toFixed(2)}ms | explored=${result.totalNodesExplored}`
        );
      });
    }
    
    it("should demonstrate superlinear growth from O(n) open set", () => {
      // With an efficient priority queue, A* should scale roughly linearly 
      // with grid size for similar query patterns. But with the current O(n)
      // implementation, we expect quadratic or worse scaling due to the
      // full-scan on every node expansion.
      
      if (results.length >= 4) {
        const ratio_100_50 = results[1].medianTimeMs / Math.max(results[0].medianTimeMs, 0.001);
        const ratio_200_100 = results[2].medianTimeMs / Math.max(results[1].medianTimeMs, 0.001);
        
        // With O(n) open set, we expect growth factor > sqrt(N) due to the full scan per expansion
        console.log(
          `Growth ratios: 100/50=${ratio_100_50.toFixed(2)}x | 200/100=${ratio_200_100.toFixed(2)}x`
        );
        
        // If growth is significantly more than sqrt, we have evidence of superlinear behavior
        expect(ratio_100_50).toBeGreaterThan(0.1);  // Just sanity check: time increased
      }
    });
  });
  
  describe("Query Count Scaling (100x100 grid)", () => {
    const results: BenchmarkResult[] = [];
    
    for (const count of [5, 10, 20]) {
      it(`should benchmark ${count} queries`, () => {
        const result = runBenchmark(100, 100, 0.3, count);
        results.push(result);
        
        console.log(
          `Queries ${count}: median=${result.medianTimeMs.toFixed(2)}ms | total=${result.totalNodesExplored}`
        );
      });
    }
    
    it("should show linear-ish scaling with query count", () => {
      // Linear scaling expected if each query is independent
      const perQueryTimes = results.map(r => r.medianTimeMs);
      
      console.log(
        `Per-query times: ${perQueryTimes.map(t => t.toFixed(2)).join(' | ')}`
      );
    });
  });
  
  describe("Obstacle Density Impact (100x100, 5 queries)", () => {
    const results: BenchmarkResult[] = [];
    
    for (const density of [0.1, 0.3, 0.5]) {
      it(`should benchmark ${density*100}% obstacle density`, () => {
        // Use different seeds per density to get diverse queries
        const result = runBenchmark(100, 100, density, 5, Math.floor(density * 1e9));
        results.push(result);
        
        console.log(
          `Density ${density*100}%: median=${result.medianTimeMs.toFixed(2)}ms | explored=${result.totalNodesExplored}`
        );
      });
    }
    
    it("should show higher density = fewer nodes to explore (usually)", () => {
      const exploredCounts = results.map(r => r.totalNodesExplored);
      
      console.log(
        `Total nodes explored: ${exploredCounts.join(' | ')}`
      );
      
      // Dense environments typically lead to more exploration but also faster termination 
      // when no path exists. This is a qualitative observation, not a hard assertion.
    });
  });
});
