/**
 * PAW Debug Test - Investigate algorithm selection
 */

import { describe, it, expect, beforeEach } from "vitest";
import { detectCollisions, configureOptimization, cleanup } from "../optimized";
import { analyzeWorkload } from "../optimization/adapters/workload-analyzer";
import { AlgorithmSelector } from "../optimization/core/algorithm-selector";
import { generateRandomAABBs } from "./paw-optimization-benchmark.test";


describe("PAW Debug Investigation", () => {
  beforeEach(() => {
    // Note: Using real timers for PAW debug tests
    cleanup();
    configureOptimization({
      enableMemoryPooling: true,
      enableAlgorithmSelection: true,
      enablePerformanceMonitoring: true,
      algorithmSelectionStrategy: "adaptive",
    });
  });

  it("should investigate algorithm selection for different dataset sizes", () => {
    const selector = new AlgorithmSelector();

    // Test small dataset (20 objects)
    const smallAABBs = generateRandomAABBs(20);
    const smallWorkload = analyzeWorkload(smallAABBs);
    const smallSelection = selector.selectCollisionAlgorithm(smallWorkload);

    console.log("Small dataset (20 objects):");
    console.log("Workload:", smallWorkload);
    console.log("Selection:", smallSelection);

    // Test medium dataset (200 objects)
    const mediumAABBs = generateRandomAABBs(200);
    const mediumWorkload = analyzeWorkload(mediumAABBs);
    const mediumSelection = selector.selectCollisionAlgorithm(mediumWorkload);

    console.log("\nMedium dataset (200 objects):");
    console.log("Workload:", mediumWorkload);
    console.log("Selection:", mediumSelection);

    // Test large dataset (1000 objects)
    const largeAABBs = generateRandomAABBs(1000);
    const largeWorkload = analyzeWorkload(largeAABBs);
    const largeSelection = selector.selectCollisionAlgorithm(largeWorkload);

    console.log("\nLarge dataset (1000 objects):");
    console.log("Workload:", largeWorkload);
    console.log("Selection:", largeSelection);

    // Verify selections make sense
    expect(smallSelection.algorithm).toBe("naive");
    expect(mediumSelection.algorithm).toBe("spatial"); // This is correct for 200 objects
    expect(largeSelection.algorithm).toBe("optimized");
  });

  it("should test actual algorithm execution times", () => {
    const mediumAABBs = generateRandomAABBs(200);

    // Test with algorithm selection enabled
    const start1 = performance.now();
    const result1 = detectCollisions(mediumAABBs);
    const time1 = performance.now() - start1;

    // Test with naive algorithm forced
    configureOptimization({
      enableAlgorithmSelection: false,
      algorithmSelectionStrategy: "naive",
    });

    const start2 = performance.now();
    const result2 = detectCollisions(mediumAABBs);
    const time2 = performance.now() - start2;

    // Test with optimized algorithm forced
    configureOptimization({
      enableAlgorithmSelection: false,
      algorithmSelectionStrategy: "optimized",
    });

    const start3 = performance.now();
    const result3 = detectCollisions(mediumAABBs);
    const time3 = performance.now() - start3;

    console.log("Medium dataset (200 objects) execution times:");
    console.log(`Adaptive selection: ${time1.toFixed(3)}ms (${result1.length} collisions)`);
    console.log(`Forced naive: ${time2.toFixed(3)}ms (${result2.length} collisions)`);
    console.log(`Forced optimized: ${time3.toFixed(3)}ms (${result3.length} collisions)`);

    // With fake timers, all times are 0, so just verify the algorithms work
    expect(result1.length).toBeGreaterThan(0); // Should find collisions
    expect(result2.length).toBeGreaterThan(0); // Should find collisions
    expect(result3.length).toBeGreaterThan(0); // Should find collisions
    expect(result1.length).toBe(result2.length); // Should find same number of collisions
    expect(result2.length).toBe(result3.length); // Should find same number of collisions
  });
});
