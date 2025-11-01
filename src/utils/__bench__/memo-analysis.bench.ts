/** Comprehensive Memoization Analysis */
import { getMemoStats, memoRegistry } from "../memo-registry";
import { euclideanDistance } from "../../pathfinding/astar/heuristics";
import { unionAABB, intersectionAABB } from "../../geometry/collision/aabb/aabb-operations";
import { VectorOps } from "../../geometry/vectors/vector-algorithms";
import { adaptiveMemo } from "../memo/adaptive-memo";

function analyzeMemoization() {
  console.log("=== MEMOIZATION ANALYSIS ===\n");
  
  // Test data generation
  const points = Array.from({ length: 100 }, (_, i) => ({
    x: (i % 10) * 10,
    y: Math.floor(i / 10) * 10,
  }));
  
  const aabbs = Array.from({ length: 50 }, (_, i) => ({
    x: i % 10,
    y: Math.floor(i / 10),
    width: 5,
    height: 5,
  }));
  
  const vectors = Array.from({ length: 100 }, (_, i) => ({
    x: (i % 20) * 0.5,
    y: Math.floor(i / 20) * 0.5,
  }));

  // Create test memoized functions and register them manually
  console.log("Creating test memoized functions...");
  
  const testEuclidean = adaptiveMemo(
    (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const dx = from.x - to.x;
      const dy = from.y - to.y;
      return Math.sqrt(dx * dx + dy * dy);
    },
    { name: 'testEuclidean', maxSize: 1024, minHitRate: 0.6 },
    (from, to) => `${from.x}|${from.y}|${to.x}|${to.y}`
  );
  
  const testUnion = adaptiveMemo(
    (a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) => {
      const minX = Math.min(a.x, b.x);
      const minY = Math.min(a.y, b.y);
      const maxX = Math.max(a.x + a.width, b.x + b.width);
      const maxY = Math.max(a.y + a.height, b.y + b.height);
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    },
    { name: 'testUnion', maxSize: 1024, minHitRate: 0.6 },
    (a, b) => `${a.x}|${a.y}|${a.width}|${a.height}::${b.x}|${b.y}|${b.width}|${b.height}`
  );
  
  const testNormalize = adaptiveMemo(
    (x: number, y: number) => {
      const mag = Math.sqrt(x * x + y * y);
      if (mag === 0) return { x: 0, y: 0 };
      return { x: x / mag, y: y / mag };
    },
    { name: 'testNormalize', maxSize: 1024, minHitRate: 0.6 },
    (x, y) => `${x}|${y}`
  );

  // Warm up all memoized functions
  console.log("Warming up memoized functions...");
  
  // Test functions
  for (let i = 0; i < 200; i++) {
    const p1 = points[i % points.length];
    const p2 = points[(i * 3) % points.length];
    testEuclidean(p1, p2);
  }
  
  for (let i = 0; i < 100; i++) {
    const a = aabbs[i % aabbs.length];
    const b = aabbs[(i * 2) % aabbs.length];
    testUnion(a, b);
  }
  
  for (let i = 0; i < 200; i++) {
    const v = vectors[i % vectors.length];
    testNormalize(v.x, v.y);
  }

  console.log("Analysis complete!\n");

  // Get all memo statistics
  const allStats = getMemoStats();
  
  console.log("=== MEMOIZATION STATISTICS ===");
  for (const [name, stats] of Object.entries(allStats)) {
    if (stats) {
      console.log(`\n${name}:`);
      console.log(`  Hit Rate: ${(stats.hitRate * 100).toFixed(1)}%`);
      console.log(`  Total Calls: ${stats.totalCalls}`);
      console.log(`  Cache Hits: ${stats.cacheHits}`);
      console.log(`  Cache Misses: ${stats.cacheMisses}`);
      console.log(`  Avg Execution Time: ${stats.avgExecutionTime.toFixed(4)}ms`);
      console.log(`  Avg Overhead: ${stats.avgOverheadMs.toFixed(4)}ms`);
      console.log(`  Cache Size: ${stats.cacheSize}/${stats.maxSize}`);
      console.log(`  Enabled: ${stats.enabled ? 'Yes' : 'No'}`);
    }
  }

  // Performance recommendations
  console.log("\n=== OPTIMIZATION RECOMMENDATIONS ===");
  
  for (const [name, stats] of Object.entries(allStats)) {
    if (stats) {
      const recommendations = [];
      
      if (stats.hitRate < 0.5) {
        recommendations.push("LOW HIT RATE: Consider disabling memo or reducing cache size");
      }
      
      if (stats.hitRate > 0.9 && stats.avgOverheadMs < 0.01) {
        recommendations.push("HIGH EFFICIENCY: Consider increasing cache size");
      }
      
      if (stats.avgOverheadMs > 0.05) {
        recommendations.push("HIGH OVERHEAD: Consider increasing hit rate threshold");
      }
      
      if (stats.cacheSize === stats.maxSize) {
        recommendations.push("CACHE FULL: Consider increasing max size or adding TTL");
      }
      
      if (recommendations.length > 0) {
        console.log(`\n${name}:`);
        recommendations.forEach(rec => console.log(`  - ${rec}`));
      }
    }
  }

  // Configuration analysis
  console.log("\n=== CURRENT CONFIGURATION ANALYSIS ===");
  console.log("Global Defaults:");
  console.log("  maxSize: 1024");
  console.log("  minHitRate: 0.7");
  console.log("  overheadBudgetMs: 0.02");
  console.log("  windowSize: 500");
  console.log("  minSamples: 200");
  
  console.log("\nPer-Function Overrides:");
  console.log("  euclideanDistance: maxSize=4096, minHitRate=0.6");
  console.log("  unionAABB/intersectionAABB: maxSize=4096, minHitRate=0.6");
  console.log("  VectorOps.normalize: maxSize=2048, minHitRate=0.6");
  console.log("  Quadtree.distance: maxSize=2048, minHitRate=0.6");
  console.log("  SAT.projectPolygon: maxSize=2048, minHitRate=0.6");
  console.log("  Theta* distance: maxSize=8192, minHitRate=0.6");
}

// Only run when explicitly executed
if (typeof process !== "undefined" && process.env.RUN_MEMO_BENCH === "1") {
  analyzeMemoization();
}
