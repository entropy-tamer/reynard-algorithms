const fs = require('fs');
const path = require('path');

// Get all source files
const sourceFiles = `src/exports.ts
src/geometry/circle.ts
src/geometry/collision/aabb-batch-collision.ts
src/geometry/collision/aabb-collision.ts
src/geometry/collision/aabb-index.ts
src/geometry/collision/aabb-operations.ts
src/geometry/collision/aabb-spatial-hash.ts
src/geometry/collision/aabb-types.ts
src/geometry/collision/aabb-utils.ts
src/geometry/collision/collision-algorithms.ts
src/geometry/collision/collision-detection-core.ts
src/geometry/collision/index.ts
src/geometry/collision/spatial-collision-optimizer.ts
src/geometry/collision/spatial-collision-stats.ts
src/geometry/index.ts
src/geometry/point.ts
src/geometry/polygon.ts
src/geometry/rectangle.ts
src/geometry/shapes/circle-algorithms.ts
src/geometry/shapes/index.ts
src/geometry/shapes/line-algorithms.ts
src/geometry/shapes/point-algorithms.ts
src/geometry/shapes/polygon-algorithms.ts
src/geometry/shapes/rectangle-advanced.ts
src/geometry/shapes/rectangle-algorithms.ts
src/geometry/shapes/rectangle-basic.ts
src/geometry/shapes/shapes.ts
src/geometry/transformations/index.ts
src/geometry/transformations/transformation-algorithms.ts
src/geometry.ts
src/geometry/vectors/index.ts
src/geometry/vectors/vector-algorithms.ts
src/index.ts
src/optimization/adapters/collision-algorithms.ts
src/optimization/adapters/index.ts
src/optimization/adapters/optimized-collision-adapter.ts
src/optimization/adapters/performance-monitor.ts
src/optimization/adapters/workload-analyzer.ts
src/optimization/core/algorithm-selector.ts
src/optimization/core/enhanced-memory-pool.ts
src/optimization/index.ts
src/optimized.ts
src/performance/benchmark.ts
src/performance/budget.ts
src/performance/framerate.ts
src/performance/index.ts
src/performance/memory-pool-core.ts
src/performance/memory-pool-utils.ts
src/performance/memory.ts
src/performance/throttle.ts
src/performance/timer.ts
src/performance/types.ts
src/spatial-hash/index.ts
src/spatial-hash/spatial-hash-core.ts
src/spatial-hash/spatial-hash.ts
src/spatial-hash/spatial-hash-types.ts
src/spatial-hash/spatial-hash-utils.ts
src/test-setup.ts
src/types/performance-types.ts
src/types/spatial-types.ts
src/union-find/index.ts
src/union-find/union-find-batch-operations.ts
src/union-find/union-find-core.ts
src/union-find/union-find-set-operations.ts
src/union-find/union-find.ts
src/union-find/union-find-types.ts
src/union-find/union-find-utils.ts`.split('\n');

// Get all test files
const testFiles = `src/__tests__/geometry/collision/aabb-batch-collision.test.ts
src/__tests__/geometry/collision/aabb-collision.test.ts
src/__tests__/geometry/collision/aabb-operations.test.ts
src/__tests__/geometry/collision/aabb-spatial-hash.test.ts
src/__tests__/geometry/collision/aabb-utils.test.ts
src/__tests__/geometry/collision/are-aabbs-touching.test.ts
src/__tests__/geometry/collision/contains-aabb.test.ts
src/__tests__/geometry/collision/expand-aabb.test.ts
src/__tests__/geometry/collision/intersection-aabb.test.ts
src/__tests__/geometry/collision/point-in-aabb.test.ts
src/__tests__/geometry/collision/spatial-collision-optimizer.test.ts
src/__tests__/geometry/collision/union-aabb.test.ts
src/__tests__/geometry/shapes/circle-algorithms.test.ts
src/__tests__/geometry/shapes/circle-basic-operations.test.ts
src/__tests__/geometry/shapes/circle-geometric-operations.test.ts
src/__tests__/geometry/shapes/circle-transformations.test.ts
src/__tests__/geometry/shapes/line-basic-operations.test.ts
src/__tests__/geometry/shapes/line-geometric-operations.test.ts
src/__tests__/geometry/shapes/line-intersection-distance.test.ts
src/__tests__/geometry/shapes/point-algorithms.basic.test.ts
src/__tests__/geometry/shapes/point-algorithms.geometry.test.ts
src/__tests__/geometry/shapes/point-algorithms.test.ts
src/__tests__/geometry/shapes/point-algorithms.utility.test.ts
src/__tests__/geometry/shapes/polygon-algorithms-creation.test.ts
src/__tests__/geometry/shapes/polygon-algorithms-geometry.test.ts
src/__tests__/geometry/shapes/polygon-algorithms-spatial.test.ts
src/__tests__/geometry/shapes/polygon-algorithms-transformations.test.ts
src/__tests__/geometry/shapes/rectangle-advanced.test.ts
src/__tests__/geometry/shapes/rectangle-algorithms.test.ts
src/__tests__/geometry/shapes/rectangle-basic.test.ts
src/__tests__/geometry/transformations/transform-apply.test.ts
src/__tests__/geometry/transformations/transformation-algorithms.test.ts
src/__tests__/geometry/transformations/transform-basic.test.ts
src/__tests__/geometry/transformations/transform-combine.test.ts
src/__tests__/geometry/transformations/transform-inverse.test.ts
src/__tests__/geometry/vectors/basic-operations.test.ts
src/__tests__/geometry/vectors/geometric-operations.test.ts
src/__tests__/geometry/vectors/mathematical-operations.test.ts
src/__tests__/geometry/vectors/scalar-operations.test.ts
src/__tests__/geometry/vectors/vector-algorithms.test.ts
src/__tests__/index.test.ts
src/__tests__/optimization/optimized.test.ts
src/__tests__/paw-debug.test.ts
src/__tests__/paw-optimization-benchmark.test.ts
src/__tests__/performance/benchmark-class.test.ts
src/__tests__/performance/benchmark.test.ts
src/__tests__/performance/budget-check.test.ts
src/__tests__/performance/budget-clear.test.ts
src/__tests__/performance/budget-setup.test.ts
src/__tests__/performance/framerate.test.ts
src/__tests__/performance/measure-async.test.ts
src/__tests__/performance/measure-sync.test.ts
src/__tests__/performance/memory-extended.test.ts
src/__tests__/performance/memory-pool.test.ts
src/__tests__/performance/memory.test.ts
src/__tests__/performance/test-utils.ts
src/__tests__/performance/throttle.test.ts
src/__tests__/performance/timer.test.ts
src/__tests__/spatial-hash/spatial-hash.test.ts
src/__tests__/spatial-hash/spatial-hash-utils.test.ts
src/__tests__/types.test.ts
src/__tests__/union-find/union-find-batch-operations.test.ts
src/__tests__/union-find/union-find.test.ts`.split('\n');

console.log("=== COVERAGE ANALYSIS ===\n");

// Exclude certain files that don't need direct testing
const excludePatterns = [
  /\/index\.ts$/,     // Index files (just exports)
  /\/types\.ts$/,     // Type definition files
  /test-setup\.ts$/,  // Test setup files
  /exports\.ts$/      // Export files
];

const shouldExclude = (file) => {
  return excludePatterns.some(pattern => pattern.test(file));
};

// Map source files to potential test files
const sourceToTestMap = new Map();
sourceFiles.forEach(sourceFile => {
  if (shouldExclude(sourceFile)) return;
  
  const withoutSrc = sourceFile.replace('src/', '');
  const possibleTestFiles = [
    `src/__tests__/${withoutSrc.replace('.ts', '.test.ts')}`,
    `src/__tests__/${withoutSrc.replace('.ts', '')}.test.ts`,
  ];
  
  const hasTest = possibleTestFiles.some(testFile => testFiles.includes(testFile));
  sourceToTestMap.set(sourceFile, { hasTest, possibleTests: possibleTestFiles });
});

// Find files without tests
const filesWithoutTests = [];
const filesWithTests = [];

sourceToTestMap.forEach((testInfo, sourceFile) => {
  if (testInfo.hasTest) {
    filesWithTests.push(sourceFile);
  } else {
    filesWithoutTests.push(sourceFile);
  }
});

console.log(`Files WITH tests: ${filesWithTests.length}`);
console.log(`Files WITHOUT tests: ${filesWithoutTests.length}`);
console.log(`Excluded files: ${sourceFiles.filter(shouldExclude).length}`);
console.log(`Total coverage estimate: ${Math.round((filesWithTests.length / (filesWithTests.length + filesWithoutTests.length)) * 100)}%`);

console.log("\n=== FILES WITHOUT TESTS ===");
filesWithoutTests.forEach(file => {
  console.log(`❌ ${file}`);
});

console.log("\n=== FILES WITH TESTS ===");
filesWithTests.slice(0, 10).forEach(file => {
  console.log(`✅ ${file}`);
});
if (filesWithTests.length > 10) {
  console.log(`... and ${filesWithTests.length - 10} more`);
}
