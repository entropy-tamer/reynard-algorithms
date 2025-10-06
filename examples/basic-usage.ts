/**
 * Basic Usage Examples for reynard-algorithms
 *
 * This file demonstrates practical usage of the algorithms package
 * with real-world scenarios and performance considerations.
 */

import {
  // Union-Find algorithms
  UnionFind,
  UnionFindWithPathCompression,

  // Collision detection
  detectCollisions,
  AABB,
  createAABB,

  // Spatial hashing
  SpatialHash,
  createSpatialHash,

  // Geometry operations
  Point,
  Circle,
  Rectangle,
  Polygon,

  // Performance utilities
  measurePerformance,
  createBenchmark,

  // PAW optimization
  createOptimizedCollisionAdapter,
  WorkloadAnalyzer,
} from "../src/index.js";

// ============================================================================
// Example 1: Union-Find for Connected Components
// ============================================================================

export function findConnectedComponents() {
  console.log("🔗 Union-Find: Finding Connected Components");

  // Create a union-find structure for 10 nodes
  const uf = new UnionFindWithPathCompression(10);

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

export function gameCollisionDetection() {
  console.log("💥 Collision Detection: Game Objects");

  // Create game objects with AABB bounds
  const player = createAABB(10, 10, 20, 20); // x, y, width, height
  const enemy1 = createAABB(15, 15, 10, 10);
  const enemy2 = createAABB(50, 50, 15, 15);
  const powerUp = createAABB(12, 12, 5, 5);

  const objects = [
    { id: "player", bounds: player },
    { id: "enemy1", bounds: enemy1 },
    { id: "enemy2", bounds: enemy2 },
    { id: "powerUp", bounds: powerUp },
  ];

  // Detect collisions
  const collisions = detectCollisions(objects);

  console.log("Collisions detected:", collisions.length);
  collisions.forEach(collision => {
    console.log(`${collision.a.id} collides with ${collision.b.id}`);
  });

  // Output: player collides with enemy1, player collides with powerUp
}

// ============================================================================
// Example 3: Spatial Hashing for Efficient Queries
// ============================================================================

export function spatialHashingExample() {
  console.log("🗺️ Spatial Hashing: Efficient Spatial Queries");

  // Create a spatial hash for a 1000x1000 world
  const spatialHash = createSpatialHash(1000, 1000, 50); // cell size: 50

  // Add objects to the spatial hash
  const objects = [
    { id: "obj1", x: 25, y: 25, width: 10, height: 10 },
    { id: "obj2", x: 75, y: 75, width: 15, height: 15 },
    { id: "obj3", x: 125, y: 125, width: 20, height: 20 },
    { id: "obj4", x: 30, y: 30, width: 5, height: 5 },
  ];

  objects.forEach(obj => {
    spatialHash.insert(obj.id, obj.x, obj.y, obj.width, obj.height);
  });

  // Query for objects near a point
  const nearby = spatialHash.query(30, 30, 20, 20);
  console.log("Objects near (30, 30):", nearby);

  // Query for objects in a region
  const inRegion = spatialHash.query(0, 0, 100, 100);
  console.log("Objects in region (0,0) to (100,100):", inRegion);
}

// ============================================================================
// Example 4: Performance Benchmarking
// ============================================================================

export async function performanceBenchmarking() {
  console.log("⚡ Performance Benchmarking");

  // Benchmark collision detection with different dataset sizes
  const benchmark = createBenchmark("Collision Detection Performance");

  // Small dataset
  const smallObjects = Array.from({ length: 50 }, (_, i) => ({
    id: `obj${i}`,
    bounds: createAABB(i * 10, i * 10, 5, 5),
  }));

  // Medium dataset
  const mediumObjects = Array.from({ length: 200 }, (_, i) => ({
    id: `obj${i}`,
    bounds: createAABB(i * 5, i * 5, 3, 3),
  }));

  // Large dataset
  const largeObjects = Array.from({ length: 1000 }, (_, i) => ({
    id: `obj${i}`,
    bounds: createAABB(i * 2, i * 2, 2, 2),
  }));

  // Run benchmarks
  await benchmark.measure("Small Dataset (50 objects)", () => {
    detectCollisions(smallObjects);
  });

  await benchmark.measure("Medium Dataset (200 objects)", () => {
    detectCollisions(mediumObjects);
  });

  await benchmark.measure("Large Dataset (1000 objects)", () => {
    detectCollisions(largeObjects);
  });

  // Get results
  const results = benchmark.getResults();
  console.log("Benchmark Results:", results);
}

// ============================================================================
// Example 5: PAW Optimization Framework
// ============================================================================

export function pawOptimizationExample() {
  console.log("🔧 PAW Optimization: Adaptive Algorithm Selection");

  // Create an optimized collision adapter
  const adapter = createOptimizedCollisionAdapter();

  // Create a workload analyzer
  const analyzer = new WorkloadAnalyzer();

  // Simulate different workloads
  const workloads = [
    { objectCount: 20, spatialDensity: 0.1, overlapRatio: 0.05 },
    { objectCount: 200, spatialDensity: 0.5, overlapRatio: 0.1 },
    { objectCount: 1000, spatialDensity: 1.0, overlapRatio: 0.2 },
  ];

  workloads.forEach((workload, index) => {
    console.log(`\nWorkload ${index + 1}:`, workload);

    // Analyze workload
    const analysis = analyzer.analyzeWorkload(workload);
    console.log("Analysis:", analysis);

    // Get algorithm recommendation
    const recommendation = adapter.getAlgorithmRecommendation(analysis);
    console.log("Recommended algorithm:", recommendation.algorithm);
    console.log("Confidence:", recommendation.confidence);
    console.log("Expected performance:", recommendation.expectedPerformance);
  });
}

// ============================================================================
// Example 6: Geometry Operations
// ============================================================================

export function geometryOperationsExample() {
  console.log("📐 Geometry Operations");

  // Create geometric shapes
  const point = new Point(10, 20);
  const circle = new Circle(15, 25, 5);
  const rectangle = new Rectangle(5, 15, 20, 10);
  const polygon = new Polygon([new Point(0, 0), new Point(10, 0), new Point(10, 10), new Point(0, 10)]);

  // Test point-in-shape operations
  console.log("Point in circle:", circle.containsPoint(point));
  console.log("Point in rectangle:", rectangle.containsPoint(point));
  console.log("Point in polygon:", polygon.containsPoint(point));

  // Calculate distances
  console.log("Distance from point to circle center:", point.distanceTo(circle.center));
  console.log("Distance from point to rectangle:", point.distanceToRectangle(rectangle));

  // Test intersections
  console.log("Circle intersects rectangle:", circle.intersects(rectangle));
  console.log("Rectangle intersects polygon:", rectangle.intersects(polygon));
}

// ============================================================================
// Run All Examples
// ============================================================================

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
