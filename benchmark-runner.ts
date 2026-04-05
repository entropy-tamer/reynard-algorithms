/**
 * PAW Performance Benchmark Runner
 * 
 * Direct execution of micro-benchmarks to collect empirical data
 */

import { performance } from 'perf_hooks';

// Simple benchmark runner without complex imports
class SimpleBenchmarkRunner {
  private results: any[] = [];

  async runBenchmark(
    name: string,
    testFn: () => void,
    config: {
      iterations: number;
      warmupIterations: number;
      trackMemory?: boolean;
    }
  ): Promise<any> {
    const { iterations, warmupIterations, trackMemory = false } = config;
    
    // Warmup phase
    for (let i = 0; i < warmupIterations; i++) {
      testFn();
    }

    // Memory before
    const memBefore = trackMemory ? process.memoryUsage() : null;

    // Benchmark phase
    const times: number[] = [];
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      testFn();
      const end = performance.now();
      times.push(end - start);
    }

    const totalTime = performance.now() - startTime;

    // Memory after
    const memAfter = trackMemory ? process.memoryUsage() : null;

    // Calculate statistics
    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    const result = {
      name,
      iterations,
      totalTime,
      averageTime,
      minTime,
      maxTime,
      memoryUsage: trackMemory && memBefore && memAfter ? {
        before: memBefore,
        after: memAfter,
        delta: memAfter.heapUsed - memBefore.heapUsed
      } : null,
      success: true,
      samples: times
    };

    this.results.push(result);
    return result;
  }

  getResults(): any[] {
    return [...this.results];
  }

  clearResults(): void {
    this.results = [];
  }

  generateReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      totalBenchmarks: this.results.length,
      results: this.results
    };
    
    return JSON.stringify(report, null, 2);
  }
}

// Algorithm Selection Benchmarks
async function runAlgorithmSelectionBenchmarks() {
  const runner = new SimpleBenchmarkRunner();

  // Grid Classification Benchmark
  console.log('🔍 Running Algorithm Selection Benchmarks...');
  
  await runner.runBenchmark('grid-classification', () => {
    const testGrids = [
      { width: 25, height: 25, objectCount: 625 },
      { width: 50, height: 50, objectCount: 2500 },
      { width: 100, height: 100, objectCount: 10000 },
      { width: 200, height: 200, objectCount: 40000 }
    ];

    for (const grid of testGrids) {
      const gridSize = Math.sqrt(grid.objectCount);
      const classification = gridSize < 50 ? 'small' : gridSize < 100 ? 'medium' : 'large';
      // Simulate additional classification work
      Math.random() * gridSize;
    }
  }, {
    iterations: 1000,
    warmupIterations: 100,
    trackMemory: true
  });

  // Performance Prediction Benchmark
  await runner.runBenchmark('performance-prediction', () => {
    const testCases = [
      { gridSize: 25, complexity: 0.5 },
      { gridSize: 50, complexity: 0.8 },
      { gridSize: 100, complexity: 0.9 },
      { gridSize: 200, complexity: 0.7 }
    ];

    for (const testCase of testCases) {
      const baseComplexity = testCase.gridSize * testCase.gridSize;
      const adjustedComplexity = baseComplexity * (testCase.complexity > 0.7 ? 0.8 : 0.9);
      const executionTime = adjustedComplexity * 0.0006;
      const memoryUsage = testCase.gridSize * testCase.gridSize * 40;
      // Simulate calculation overhead
      Math.random() * executionTime + memoryUsage;
    }
  }, {
    iterations: 500,
    warmupIterations: 50,
    trackMemory: true
  });

  return runner.getResults();
}

// Memory Pool Benchmarks
async function runMemoryPoolBenchmarks() {
  const runner = new SimpleBenchmarkRunner();

  console.log('💾 Running Memory Pool Benchmarks...');

  // Pool Allocation Benchmark
  await runner.runBenchmark('pool-allocation', () => {
    const poolSizes = [100, 500, 1000, 5000];
    
    for (const size of poolSizes) {
      const allocations = [];
      for (let i = 0; i < 10; i++) {
        // Simulate allocation
        allocations.push(new Array(size).fill(0));
      }
      // Simulate deallocation
      allocations.length = 0;
    }
  }, {
    iterations: 1000,
    warmupIterations: 100,
    trackMemory: true
  });

  // Pool Cleanup Benchmark
  await runner.runBenchmark('pool-cleanup', () => {
    const poolCount = 100;
    const maxIdleTime = 300000;

    // Simulate pool cleanup logic
    const pools = Array(poolCount).fill(null).map((_, i) => ({
      id: i,
      isInUse: Math.random() > 0.5,
      lastUsed: Date.now() - Math.random() * maxIdleTime
    }));

    const now = Date.now();
    const filtered = pools.filter(p => 
      p.isInUse || now - p.lastUsed <= maxIdleTime
    );
    
    // Simulate cleanup overhead
    filtered.length;
  }, {
    iterations: 100,
    warmupIterations: 10,
    trackMemory: true
  });

  return runner.getResults();
}

// Clustering Benchmarks
async function runClusteringBenchmarks() {
  const runner = new SimpleBenchmarkRunner();

  console.log('🔗 Running Clustering Benchmarks...');

  // Fixed Clustering Benchmark
  await runner.runBenchmark('fixed-clustering', () => {
    const gridSizes = [50, 100, 200];
    const clusterSize = 10;

    for (const gridSize of gridSizes) {
      const clusters = [];
      for (let y = 0; y < gridSize; y += clusterSize) {
        for (let x = 0; x < gridSize; x += clusterSize) {
          clusters.push({
            x, y,
            width: Math.min(clusterSize, gridSize - x),
            height: Math.min(clusterSize, gridSize - y)
          });
        }
      }
      // Simulate processing overhead
      clusters.length;
    }
  }, {
    iterations: 100,
    warmupIterations: 10,
    trackMemory: true
  });

  // Adaptive Clustering Benchmark
  await runner.runBenchmark('adaptive-clustering', () => {
    const testCases = [
      { width: 50, height: 50, obstacleDensity: 0.3 },
      { width: 100, height: 100, obstacleDensity: 0.5 },
      { width: 200, height: 200, obstacleDensity: 0.7 }
    ];

    for (const testCase of testCases) {
      const totalCells = testCase.width * testCase.height;
      const baseSize = Math.sqrt(totalCells) / 4;
      const densityMultiplier = testCase.obstacleDensity > 0.3 ? 0.7 : 1.2;
      const optimalSize = Math.max(8, Math.min(25, baseSize * densityMultiplier));
      
      // Simulate calculation overhead
      Math.floor(optimalSize);
    }
  }, {
    iterations: 200,
    warmupIterations: 20,
    trackMemory: true
  });

  return runner.getResults();
}

// High Complexity Benchmarks
async function runHighComplexityBenchmarks() {
  const runner = new SimpleBenchmarkRunner();

  console.log('⚡ Running High Complexity Benchmarks...');

  // Complexity Profiling Benchmark
  await runner.runBenchmark('complexity-profiling', () => {
    const complexityLevels = [0.5, 0.7, 0.8, 0.9, 0.95];

    for (const threshold of complexityLevels) {
      let type = 'smooth';
      if (threshold > 0.8) type = 'extreme';
      else if (threshold > 0.6) type = 'high-discontinuous';
      else if (threshold > 0.4) type = 'high-noisy';
      
      // Simulate analysis overhead
      const continuity = Math.random();
      const noise = Math.random();
      const gradient = Math.random();
      [type, continuity, noise, gradient];
    }
  }, {
    iterations: 500,
    warmupIterations: 50,
    trackMemory: true
  });

  // Specialized Algorithms Benchmark
  await runner.runBenchmark('specialized-algorithms', () => {
    const profiles = [
      { type: 'high-discontinuous', gridSize: 100 },
      { type: 'high-noisy', gridSize: 100 },
      { type: 'extreme', gridSize: 100 }
    ];

    for (const profile of profiles) {
      let algorithm = 'standard-lut';
      if (profile.type === 'high-discontinuous') algorithm = 'region-growing';
      else if (profile.type === 'high-noisy') algorithm = 'morphological-adaptive';
      else if (profile.type === 'extreme') algorithm = 'hybrid-multi-pass';
      
      // Simulate selection overhead
      const complexity = profile.gridSize * profile.gridSize;
      const multiplier = algorithm === 'standard-lut' ? 1.0 : 0.8;
      complexity * multiplier;
    }
  }, {
    iterations: 200,
    warmupIterations: 20,
    trackMemory: true
  });

  return runner.getResults();
}

// Main benchmark execution
async function runAllBenchmarks() {
  console.log('🚀 Starting PAW Performance Benchmarks...\n');

  const startTime = performance.now();

  const [
    algorithmSelectionResults,
    memoryPoolResults,
    clusteringResults,
    highComplexityResults
  ] = await Promise.all([
    runAlgorithmSelectionBenchmarks(),
    runMemoryPoolBenchmarks(),
    runClusteringBenchmarks(),
    runHighComplexityBenchmarks()
  ]);

  const endTime = performance.now();
  const totalTime = endTime - startTime;

  // Generate comprehensive report
  const allResults = [
    ...algorithmSelectionResults,
    ...memoryPoolResults,
    ...clusteringResults,
    ...highComplexityResults
  ];

  const report = {
    metadata: {
      timestamp: new Date().toISOString(),
      totalBenchmarkTime: totalTime,
      totalBenchmarks: allResults.length,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: process.memoryUsage()
      }
    },
    categories: {
      algorithmSelection: algorithmSelectionResults,
      memoryPool: memoryPoolResults,
      clustering: clusteringResults,
      highComplexity: highComplexityResults
    },
    summary: {
      fastestBenchmark: allResults.reduce((min, r) => r.averageTime < min.averageTime ? r : min),
      slowestBenchmark: allResults.reduce((max, r) => r.averageTime > max.averageTime ? r : max),
      averageExecutionTime: allResults.reduce((sum, r) => sum + r.averageTime, 0) / allResults.length,
      totalMemoryAllocated: allResults.reduce((sum, r) => sum + (r.memoryUsage?.delta || 0), 0)
    }
  };

  // Save report to file
  const fs = await import('fs');
  const path = await import('path');
  
  const reportPath = path.join(__dirname, '../../../benchmark-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n📊 Benchmark Results Summary:');
  console.log(`⏱️  Total time: ${totalTime.toFixed(2)}ms`);
  console.log(`📈 Total benchmarks: ${allResults.length}`);
  console.log(`🏆 Fastest: ${report.summary.fastestBenchmark.name} (${report.summary.fastestBenchmark.averageTime.toFixed(4)}ms)`);
  console.log(`🐌 Slowest: ${report.summary.slowestBenchmark.name} (${report.summary.slowestBenchmark.averageTime.toFixed(4)}ms)`);
  console.log(`📊 Average time: ${report.summary.averageExecutionTime.toFixed(4)}ms`);
  console.log(`💾 Total memory delta: ${(report.summary.totalMemoryAllocated / 1024 / 1024).toFixed(2)}MB`);
  console.log(`📁 Report saved to: ${reportPath}`);

  return report;
}

// Run benchmarks if this file is executed directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv[1] === __filename) {
  runAllBenchmarks().catch(console.error);
}

export { runAllBenchmarks };
