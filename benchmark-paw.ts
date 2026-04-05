#!/usr/bin/env tsx

/**
 * PAW (Performance Adaptive Workload) Benchmark Suite
 * 
 * Comprehensive benchmarking tool for PAW optimization that:
 * - Tests various algorithm combinations
 * - Identifies performance bottlenecks
 * - Suggests optimization strategies
 * - Generates detailed performance reports
 */

import { performance } from "node:perf_hooks";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// Import PAW components
import { AlgorithmSelector } from "./src/optimization/core/algorithm-selector";
import { OptimizedMarchingSquaresAdapter } from "./src/optimization/adapters/optimized-marching-squares-adapter";
import { MarchingSquares } from "./src/algorithms/procedural-generation/marching-squares/marching-squares-core";

interface BenchmarkConfig {
  name: string;
  gridSize: number;
  threshold: number;
  iterations: number;
  description: string;
}

interface BenchmarkResult {
  config: BenchmarkConfig;
  standardTime: number;
  optimizedTime: number;
  speedup: number;
  memoryUsage: {
    standard: number;
    optimized: number;
  };
  algorithmSelection: {
    selected: string;
    confidence: number;
    alternatives: string[];
  };
  recommendations: string[];
}

interface BenchmarkReport {
  timestamp: string;
  systemInfo: {
    nodeVersion: string;
    platform: string;
    arch: string;
  };
  results: BenchmarkResult[];
  summary: {
    totalTests: number;
    averageSpeedup: number;
    bestSpeedup: number;
    worstSpeedup: number;
    optimizationOpportunities: string[];
  };
}

class PAWBenchmark {
  private selector: AlgorithmSelector;
  private adapter: OptimizedMarchingSquaresAdapter;
  private standard: MarchingSquares;

  constructor() {
    this.selector = new AlgorithmSelector();
    this.adapter = new OptimizedMarchingSquaresAdapter({
      enableAlgorithmSelection: true,
      enableMemoryPooling: true,
      enablePerformanceMonitoring: true,
      algorithmSelectionStrategy: "adaptive",
    });
    this.standard = new MarchingSquares();
  }

  private generateTestGrid(size: number, threshold: number): number[][] {
    return Array(size)
      .fill(null)
      .map(() =>
        Array(size)
          .fill(0)
          .map(() => Math.random())
      );
  }

  private measureMemoryUsage(): number {
    if (typeof process !== "undefined" && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  private async runBenchmark(config: BenchmarkConfig): Promise<BenchmarkResult> {
    console.log(`Running benchmark: ${config.name}...`);
    
    const grid = this.generateTestGrid(config.gridSize, config.threshold);
    
    // Standard implementation
    const memBeforeStandard = this.measureMemoryUsage();
    const standardStart = performance.now();
    
    for (let i = 0; i < config.iterations; i++) {
      this.standard.compute(grid, config.threshold);
    }
    
    const standardTime = performance.now() - standardStart;
    const memAfterStandard = this.measureMemoryUsage();
    
    // Optimized implementation
    const memBeforeOptimized = this.measureMemoryUsage();
    const optimizedStart = performance.now();
    
    for (let i = 0; i < config.iterations; i++) {
      this.adapter.compute(grid, config.threshold);
    }
    
    const optimizedTime = performance.now() - optimizedStart;
    const memAfterOptimized = this.measureMemoryUsage();
    
    // Get algorithm selection info
    const workload = {
      objectCount: config.gridSize * config.gridSize,
      spatialDensity: 0.5,
      overlapRatio: 0.1,
      updateFrequency: 1,
      queryPattern: "random" as const,
    };
    
    const selection = this.selector.selectProceduralAlgorithm(workload);
    const recommendations = this.adapter.getOptimizationRecommendations();
    
    return {
      config,
      standardTime,
      optimizedTime,
      speedup: standardTime / optimizedTime,
      memoryUsage: {
        standard: memAfterStandard - memBeforeStandard,
        optimized: memAfterOptimized - memBeforeOptimized,
      },
      algorithmSelection: {
        selected: selection.algorithm,
        confidence: selection.confidence,
        alternatives: [], // Would need to extend selector to get this
      },
      recommendations: recommendations.slice(0, 3).map(r => r.description), // Top 3 recommendations
    };
  }

  private generateBenchmarkConfigs(): BenchmarkConfig[] {
    return [
      {
        name: "Small Grid - Low Complexity",
        gridSize: 25,
        threshold: 0.3,
        iterations: 50,
        description: "Small grid with simple threshold",
      },
      {
        name: "Small Grid - High Complexity",
        gridSize: 25,
        threshold: 0.7,
        iterations: 50,
        description: "Small grid with complex threshold",
      },
      {
        name: "Medium Grid - Standard",
        gridSize: 50,
        threshold: 0.5,
        iterations: 20,
        description: "Medium grid with standard threshold",
      },
      {
        name: "Medium Grid - High Complexity",
        gridSize: 50,
        threshold: 0.8,
        iterations: 15,
        description: "Medium grid with high complexity",
      },
      {
        name: "Large Grid - Standard",
        gridSize: 100,
        threshold: 0.5,
        iterations: 5,
        description: "Large grid with standard threshold",
      },
      {
        name: "Large Grid - High Complexity",
        gridSize: 100,
        threshold: 0.9,
        iterations: 3,
        description: "Large grid with maximum complexity",
      },
      {
        name: "Very Large Grid - Stress Test",
        gridSize: 200,
        threshold: 0.6,
        iterations: 2,
        description: "Very large grid stress test",
      },
      {
        name: "Micro Grid - Rapid Fire",
        gridSize: 10,
        threshold: 0.4,
        iterations: 200,
        description: "Very small grid with many iterations",
      },
    ];
  }

  private analyzeOptimizationOpportunities(results: BenchmarkResult[]): string[] {
    const opportunities: string[] = [];
    
    // Analyze speedup patterns
    const lowSpeedupTests = results.filter(r => r.speedup < 1.1);
    if (lowSpeedupTests.length > results.length / 2) {
      opportunities.push("Consider improving algorithm selection logic - many tests show minimal speedup");
    }
    
    // Analyze memory usage
    const highMemoryTests = results.filter(r => 
      r.memoryUsage.optimized > r.memoryUsage.standard * 1.5
    );
    if (highMemoryTests.length > 0) {
      opportunities.push("Memory pooling may be inefficient for certain workloads");
    }
    
    // Analyze grid size patterns
    const largeGridTests = results.filter(r => r.config.gridSize >= 100);
    const largeGridAvgSpeedup = largeGridTests.reduce((sum, r) => sum + r.speedup, 0) / largeGridTests.length;
    if (largeGridAvgSpeedup < 1.2) {
      opportunities.push("Large grid performance could be improved with better clustering");
    }
    
    // Analyze complexity patterns
    const highComplexityTests = results.filter(r => r.config.threshold >= 0.7);
    const highComplexityAvgSpeedup = highComplexityTests.reduce((sum, r) => sum + r.speedup, 0) / highComplexityTests.length;
    if (highComplexityAvgSpeedup < 1.15) {
      opportunities.push("High complexity workloads need specialized algorithms");
    }
    
    return opportunities;
  }

  public async runFullBenchmark(): Promise<BenchmarkReport> {
    console.log("🚀 Starting PAW Benchmark Suite...\n");
    
    const configs = this.generateBenchmarkConfigs();
    const results: BenchmarkResult[] = [];
    
    for (const config of configs) {
      try {
        const result = await this.runBenchmark(config);
        results.push(result);
        
        console.log(`✅ ${config.name}: ${result.speedup.toFixed(2)}x speedup`);
        console.log(`   Standard: ${result.standardTime.toFixed(2)}ms`);
        console.log(`   Optimized: ${result.optimizedTime.toFixed(2)}ms`);
        console.log(`   Memory: ${(result.memoryUsage.optimized / 1024).toFixed(1)}KB\n`);
      } catch (error) {
        console.error(`❌ ${config.name} failed:`, error);
      }
    }
    
    const summary = {
      totalTests: results.length,
      averageSpeedup: results.reduce((sum, r) => sum + r.speedup, 0) / results.length,
      bestSpeedup: Math.max(...results.map(r => r.speedup)),
      worstSpeedup: Math.min(...results.map(r => r.speedup)),
      optimizationOpportunities: this.analyzeOptimizationOpportunities(results),
    };
    
    const report: BenchmarkReport = {
      timestamp: new Date().toISOString(),
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      results,
      summary,
    };
    
    return report;
  }

  public saveReport(report: BenchmarkReport, filename?: string): void {
    const reportsDir = join(process.cwd(), "benchmark-reports");
    mkdirSync(reportsDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const defaultFilename = `paw-benchmark-${timestamp}.json`;
    const finalFilename = filename || defaultFilename;
    
    const filepath = join(reportsDir, finalFilename);
    writeFileSync(filepath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Benchmark report saved to: ${filepath}`);
  }

  public printSummary(report: BenchmarkReport): void {
    console.log("\n" + "=".repeat(60));
    console.log("📈 PAW BENCHMARK SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Average Speedup: ${report.summary.averageSpeedup.toFixed(2)}x`);
    console.log(`Best Speedup: ${report.summary.bestSpeedup.toFixed(2)}x`);
    console.log(`Worst Speedup: ${report.summary.worstSpeedup.toFixed(2)}x`);
    
    if (report.summary.optimizationOpportunities.length > 0) {
      console.log("\n🎯 OPTIMIZATION OPPORTUNITIES:");
      report.summary.optimizationOpportunities.forEach((opportunity, i) => {
        console.log(`${i + 1}. ${opportunity}`);
      });
    }
    
    console.log("\n🏆 TOP PERFORMING TESTS:");
    const topResults = report.results
      .sort((a, b) => b.speedup - a.speedup)
      .slice(0, 3);
    
    topResults.forEach((result, i) => {
      console.log(`${i + 1}. ${result.config.name}: ${result.speedup.toFixed(2)}x`);
    });
    
    console.log("=".repeat(60));
  }
}

// CLI interface
async function main() {
  const benchmark = new PAWBenchmark();
  
  try {
    const report = await benchmark.runFullBenchmark();
    benchmark.printSummary(report);
    benchmark.saveReport(report);
    
    // Exit with appropriate code based on performance
    if (report.summary.averageSpeedup < 1.1) {
      console.log("\n⚠️  Warning: Average speedup is below expectations");
      process.exit(1);
    } else {
      console.log("\n✅ Benchmark completed successfully");
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Benchmark failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { PAWBenchmark, type BenchmarkReport, type BenchmarkResult };
