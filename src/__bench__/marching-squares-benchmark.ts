/**
 * Marching Squares Benchmark Suite
 *
 * Collects empirical performance data comparing refined LUT vs legacy implementation.
 */

import { MarchingSquares } from "../algorithms/procedural-generation/marching-squares/marching-squares-core";
import { MarchingSquaresLegacy } from "../algorithms/procedural-generation/marching-squares/marching-squares-legacy";

interface BenchmarkResult {
  gridSize: number;
  iterations: number;
  refinedLUT: {
    avgTime: number;
    minTime: number;
    maxTime: number;
    totalTime: number;
    avgMemory: number;
    contourCount: number;
    segmentCount: number;
  };
  legacy: {
    avgTime: number;
    minTime: number;
    maxTime: number;
    totalTime: number;
    avgMemory: number;
    contourCount: number;
    segmentCount: number;
  };
  improvement: {
    timeImprovement: number;
    speedup: number;
  };
}

function generateRandomGrid(size: number): number[][] {
  return Array(size)
    .fill(null)
    .map(() =>
      Array(size)
        .fill(0)
        .map(() => Math.random())
    );
}

function generatePatternGrid(size: number, pattern: "circle" | "gradient" | "noise"): number[][] {
  const grid: number[][] = [];
  const center = size / 2;
  const radius = size / 4;

  for (let y = 0; y < size; y++) {
    const row: number[] = [];
    for (let x = 0; x < size; x++) {
      let value = 0;

      if (pattern === "circle") {
        const dx = x - center;
        const dy = y - center;
        const dist = Math.sqrt(dx * dx + dy * dy);
        value = dist < radius ? 1 : 0;
      } else if (pattern === "gradient") {
        value = (x + y) / (size * 2);
      } else {
        // noise
        value = Math.random();
      }

      row.push(value);
    }
    grid.push(row);
  }

  return grid;
}

function measureMemory(): number {
  if (typeof performance !== "undefined" && (performance as any).memory) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return 0;
}

function benchmarkImplementation(
  grid: number[][],
  threshold: number,
  implementation: "refined" | "legacy",
  iterations: number
): {
  avgTime: number;
  minTime: number;
  maxTime: number;
  totalTime: number;
  avgMemory: number;
  contourCount: number;
  segmentCount: number;
} {
  const ms = implementation === "refined" ? new MarchingSquares() : new MarchingSquaresLegacy();

  const times: number[] = [];
  const memories: number[] = [];
  let totalContours = 0;
  let totalSegments = 0;

  for (let i = 0; i < iterations; i++) {
    const startMemory = measureMemory();
    const startTime = performance.now();

    const result = ms.compute(grid, threshold);

    const endTime = performance.now();
    const endMemory = measureMemory();

    times.push(endTime - startTime);
    memories.push(Math.max(0, endMemory - startMemory));

    if (i === 0) {
      // Use first result for contour/segment counts
      totalContours = result.contours.length;
      totalSegments = result.stats.segmentCount;
    }
  }

  const totalTime = times.reduce((sum, t) => sum + t, 0);
  const avgTime = totalTime / iterations;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const avgMemory = memories.reduce((sum, m) => sum + m, 0) / iterations;

  return {
    avgTime,
    minTime,
    maxTime,
    totalTime,
    avgMemory,
    contourCount: totalContours,
    segmentCount: totalSegments,
  };
}

function runBenchmark(
  gridSize: number,
  pattern: "random" | "circle" | "gradient" | "noise",
  iterations: number = 10
): BenchmarkResult {
  const grid =
    pattern === "random" ? generateRandomGrid(gridSize) : generatePatternGrid(gridSize, pattern);

  const refinedResult = benchmarkImplementation(grid, 0.5, "refined", iterations);
  const legacyResult = benchmarkImplementation(grid, 0.5, "legacy", iterations);

  const timeImprovement = ((legacyResult.avgTime - refinedResult.avgTime) / legacyResult.avgTime) * 100;
  const speedup = legacyResult.avgTime / refinedResult.avgTime;

  return {
    gridSize,
    iterations,
    refinedLUT: refinedResult,
    legacy: legacyResult,
    improvement: {
      timeImprovement,
      speedup,
    },
  };
}

function formatResults(results: BenchmarkResult[]): string {
  let output = "# Marching Squares Performance Benchmarks\n\n";
  output += "## Summary\n\n";
  output += "| Grid Size | Pattern | Refined LUT (ms) | Legacy (ms) | Improvement | Speedup |\n";
  output += "|-----------|---------|------------------|-------------|-------------|----------|\n";

  let totalImprovement = 0;
  let totalSpeedup = 0;
  let count = 0;

  for (const result of results) {
    const pattern = "random"; // Default for now
    output += `| ${result.gridSize}x${result.gridSize} | ${pattern} | `;
    output += `${result.refinedLUT.avgTime.toFixed(3)} | `;
    output += `${result.legacy.avgTime.toFixed(3)} | `;
    output += `${result.improvement.timeImprovement.toFixed(1)}% | `;
    output += `${result.improvement.speedup.toFixed(2)}x |\n`;

    totalImprovement += result.improvement.timeImprovement;
    totalSpeedup += result.improvement.speedup;
    count++;
  }

  output += `\n**Average Improvement**: ${(totalImprovement / count).toFixed(1)}%\n`;
  output += `**Average Speedup**: ${(totalSpeedup / count).toFixed(2)}x\n\n`;

  output += "## Detailed Results\n\n";
  for (const result of results) {
    output += `### ${result.gridSize}x${result.gridSize} Grid\n\n`;
    output += `**Iterations**: ${result.iterations}\n\n`;
    output += `**Refined LUT**:\n`;
    output += `- Average: ${result.refinedLUT.avgTime.toFixed(3)}ms\n`;
    output += `- Min: ${result.refinedLUT.minTime.toFixed(3)}ms\n`;
    output += `- Max: ${result.refinedLUT.maxTime.toFixed(3)}ms\n`;
    output += `- Contours: ${result.refinedLUT.contourCount}\n`;
    output += `- Segments: ${result.refinedLUT.segmentCount}\n\n`;
    output += `**Legacy**:\n`;
    output += `- Average: ${result.legacy.avgTime.toFixed(3)}ms\n`;
    output += `- Min: ${result.legacy.minTime.toFixed(3)}ms\n`;
    output += `- Max: ${result.legacy.maxTime.toFixed(3)}ms\n`;
    output += `- Contours: ${result.legacy.contourCount}\n`;
    output += `- Segments: ${result.legacy.segmentCount}\n\n`;
    output += `**Improvement**: ${result.improvement.timeImprovement.toFixed(1)}% faster (${result.improvement.speedup.toFixed(2)}x speedup)\n\n`;
  }

  return output;
}

// Run benchmarks
const gridSizes = [10, 25, 50, 75, 100];
const results: BenchmarkResult[] = [];

console.log("Running Marching Squares benchmarks...\n");

for (const size of gridSizes) {
  console.log(`Benchmarking ${size}x${size} grid...`);
  const iterations = size <= 25 ? 50 : size <= 50 ? 20 : 10;
  const result = runBenchmark(size, "random", iterations);
  results.push(result);
  console.log(
    `  Refined LUT: ${result.refinedLUT.avgTime.toFixed(3)}ms | Legacy: ${result.legacy.avgTime.toFixed(3)}ms | Improvement: ${result.improvement.timeImprovement.toFixed(1)}%`
  );
}

console.log("\n" + formatResults(results));

// Export results as JSON for programmatic use
const jsonResults = JSON.stringify(results, null, 2);
console.log("\n## JSON Results\n");
console.log(jsonResults);

