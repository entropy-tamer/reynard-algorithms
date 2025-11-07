/**
 * @file Basic Usage Examples for reynard-algorithms
 *
 * This file demonstrates practical usage of the algorithms package
 * with real-world scenarios and performance considerations.
 */
/* eslint-disable max-lines */

import {
  // Union-Find algorithms
  UnionFind,

  // Collision detection
  detectCollisions,
  type AABB,

  // Spatial hashing
  SpatialHash,

  // Geometry operations
  type Point,
  type Circle,
  type Rectangle,
  PointOps,

  // Performance utilities
  PerformanceBenchmark,
} from "../src/index.js";

// PAW optimization (imported from optimization module)
import { AlgorithmSelector } from "../src/optimization/index.js";
import { WorkloadAnalyzer } from "../src/optimization/core/workload-analyzer.js";

// ============================================================================
// Example 1: Union-Find for Connected Components
// ============================================================================

/**
 * Find connected components using Union-Find algorithm
 *
 * @example
 * findConnectedComponents();
 * // Output: Connected components with their member nodes
 */
export function findConnectedComponents() {
  console.log("🔗 Union-Find: Finding Connected Components");

  // Create a union-find structure for 10 nodes
  const uf = new UnionFind(10);

  // Connect some nodes
  uf.union(0, 1);
  uf.union(1, 2);
  uf.union(3, 4);
  uf.union(4, 5);
  uf.union(6, 7);
  uf.union(8, 9);

  // Check connections
  console.log("Are 0 and 2 connected?", uf.find(0) === uf.find(2)); // true
  console.log("Are 0 and 3 connected?", uf.find(0) === uf.find(3)); // false

  // Find all connected components
  const components = new Map<number, number[]>();
  for (let i = 0; i < 10; i++) {
    const root = uf.find(i);
    if (!components.has(root)) {
      components.set(root, []);
    }
    components.get(root)!.push(i);
  }

  console.log("Connected components:", Array.from(components.values()));
  // Output: [[0, 1, 2], [3, 4, 5], [6, 7], [8, 9]]
}

// ============================================================================
// Example 2: Collision Detection for Game Objects
// ============================================================================

/**
 * Demonstrate collision detection for game objects using AABB
 *
 * @example
 * gameCollisionDetection();
 * // Output: Lists all detected collisions between game objects
 */
export function gameCollisionDetection() {
  console.log("💥 Collision Detection: Game Objects");

  // Create game objects with AABB bounds
  const player: AABB = { x: 10, y: 10, width: 20, height: 20 };
  const enemy1: AABB = { x: 15, y: 15, width: 10, height: 10 };
  const enemy2: AABB = { x: 50, y: 50, width: 15, height: 15 };
  const powerUp: AABB = { x: 12, y: 12, width: 5, height: 5 };

  const aabbs = [player, enemy1, enemy2, powerUp];

  // Detect collisions
  const collisions = detectCollisions(aabbs);

  console.log("Collisions detected:", collisions.length);
  collisions.forEach(collision => {
    const aIndex = collision.a;
    const bIndex = collision.b;
    const names = ["player", "enemy1", "enemy2", "powerUp"];
    console.log(`${names[aIndex]} collides with ${names[bIndex]}`);
  });

  // Output: player collides with enemy1, player collides with powerUp
}

// ============================================================================
// Example 3: Spatial Hashing for Efficient Queries
// ============================================================================

/**
 * Demonstrate spatial hashing for efficient spatial queries
 *
 * @example
 * spatialHashingExample();
 * // Output: Shows objects near a point and in a region
 */
export function spatialHashingExample() {
  console.log("🗺️ Spatial Hashing: Efficient Spatial Queries");

  // Create a spatial hash for a 1000x1000 world
  const spatialHash = new SpatialHash({ cellSize: 50 });

  // Add objects to the spatial hash
  const objects = [
    { id: "obj1", x: 25, y: 25, width: 10, height: 10 },
    { id: "obj2", x: 75, y: 75, width: 15, height: 15 },
    { id: "obj3", x: 125, y: 125, width: 20, height: 20 },
    { id: "obj4", x: 30, y: 30, width: 5, height: 5 },
  ];

  objects.forEach(obj => {
    spatialHash.insert({
      id: obj.id,
      x: obj.x,
      y: obj.y,
      width: obj.width,
      height: obj.height,
      data: { id: obj.id, type: "spatial" as const },
    });
  });

  // Query for objects near a point
  const nearby = spatialHash.queryRect(30, 30, 20, 20);
  console.log(
    "Objects near (30, 30):",
    nearby.map(obj => obj.id)
  );

  // Query for objects in a region
  const inRegion = spatialHash.queryRect(0, 0, 100, 100);
  console.log(
    "Objects in region (0,0) to (100,100):",
    inRegion.map(obj => obj.id)
  );
}

// ============================================================================
// Example 4: Performance Benchmarking
// ============================================================================

/**
 * Run performance benchmarks for collision detection with different dataset sizes
 *
 * @example
 * await performanceBenchmarking();
 * // Output: Performance metrics for small, medium, and large datasets
 */
export async function performanceBenchmarking() {
  console.log("⚡ Performance Benchmarking");

  // Benchmark collision detection with different dataset sizes
  const benchmark = new PerformanceBenchmark();

  // Small dataset
  const smallObjects: AABB[] = Array.from({ length: 50 }, (_, i) => ({
    x: i * 10,
    y: i * 10,
    width: 5,
    height: 5,
  }));

  // Medium dataset
  const mediumObjects: AABB[] = Array.from({ length: 200 }, (_, i) => ({
    x: i * 5,
    y: i * 5,
    width: 3,
    height: 3,
  }));

  // Large dataset
  const largeObjects: AABB[] = Array.from({ length: 1000 }, (_, i) => ({
    x: i * 2,
    y: i * 2,
    width: 2,
    height: 2,
  }));

  // Run benchmarks
  const smallMetrics = await benchmark.run(() => {
    detectCollisions(smallObjects);
  }, 10);
  console.log("Small Dataset (50 objects):", smallMetrics);

  const mediumMetrics = await benchmark.run(() => {
    detectCollisions(mediumObjects);
  }, 10);
  console.log("Medium Dataset (200 objects):", mediumMetrics);

  const largeMetrics = await benchmark.run(() => {
    detectCollisions(largeObjects);
  }, 10);
  console.log("Large Dataset (1000 objects):", largeMetrics);
}

// ============================================================================
// Example 5: PAW Optimization Framework
// ============================================================================

/**
 * Demonstrate PAW (Performance-Aware Workload) optimization framework
 *
 * @example
 * pawOptimizationExample();
 * // Output: Shows algorithm recommendations for different workloads
 */
export function pawOptimizationExample() {
  console.log("🔧 PAW Optimization: Adaptive Algorithm Selection");

  // Create a workload analyzer and algorithm selector
  const analyzer = new WorkloadAnalyzer();
  const selector = new AlgorithmSelector();

  // Simulate different workloads
  const workloads = [
    { objectCount: 20, spatialDensity: 0.1, overlapRatio: 0.05, updateFrequency: 60, queryPattern: "random" as const },
    { objectCount: 200, spatialDensity: 0.5, overlapRatio: 0.1, updateFrequency: 60, queryPattern: "random" as const },
    { objectCount: 1000, spatialDensity: 1.0, overlapRatio: 0.2, updateFrequency: 60, queryPattern: "random" as const },
  ];

  workloads.forEach((workload, index) => {
    console.log(`\nWorkload ${index + 1}:`, workload);

    // Analyze workload
    const analysis = analyzer.analyzeWorkload(workload);
    console.log("Analysis:", analysis);

    // Get algorithm recommendation
    const recommendation = selector.selectCollisionAlgorithm(workload);
    console.log("Recommended algorithm:", recommendation.algorithm);
    console.log("Confidence:", recommendation.confidence);
    console.log("Expected performance:", recommendation.expectedPerformance);
  });
}

// ============================================================================
// Example 6: Geometry Operations
// ============================================================================

/**
 * Demonstrate various geometry operations with shapes
 *
 * @example
 * geometryOperationsExample();
 * // Output: Tests point containment, distances, and intersections
 */
export function geometryOperationsExample() {
  console.log("📐 Geometry Operations");

  // Create geometric shapes (using type interfaces)
  const point: Point = { x: 10, y: 20 };
  const circle: Circle = { center: { x: 15, y: 25 }, radius: 5 };
  const rectangle: Rectangle = { x: 5, y: 15, width: 20, height: 10 };
  // Use PointOps for distance calculations
  const centerPoint: Point = circle.center;
  const distance = PointOps.distance(point, centerPoint);
  console.log("Distance from point to circle center:", distance);

  // Calculate distance to rectangle center
  const rectCenter: Point = { x: rectangle.x + rectangle.width / 2, y: rectangle.y + rectangle.height / 2 };
  const distanceToRect = PointOps.distance(point, rectCenter);
  console.log("Distance from point to rectangle center:", distanceToRect);

  // Basic point-in-rectangle check
  const pointInRect =
    point.x >= rectangle.x &&
    point.x <= rectangle.x + rectangle.width &&
    point.y >= rectangle.y &&
    point.y <= rectangle.y + rectangle.height;
  console.log("Point in rectangle:", pointInRect);

  // Distance from point to circle edge
  const distanceToCircleEdge = Math.abs(distance - circle.radius);
  console.log("Distance from point to circle edge:", distanceToCircleEdge);
}

// ============================================================================
// Run All Examples
// ============================================================================

/**
 * Run all example functions sequentially
 *
 * @example
 * await runAllExamples();
 * // Output: Executes all examples and logs results
 */
export async function runAllExamples() {
  console.log("🦊 Reynard Algorithms - Practical Examples\n");

  try {
    findConnectedComponents();
    console.log();

    gameCollisionDetection();
    console.log();

    spatialHashingExample();
    console.log();

    await performanceBenchmarking();
    console.log();

    pawOptimizationExample();
    console.log();

    geometryOperationsExample();

    console.log("\n✅ All examples completed successfully!");
  } catch (error) {
    console.error("❌ Error running examples:", error);
  }
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}
