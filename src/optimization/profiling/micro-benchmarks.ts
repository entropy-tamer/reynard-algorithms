/**
 * Micro-Benchmarks for PAW Components
 * 
 * Component-level performance tests that isolate and measure specific
 * PAW functionality. Only active during benchmarking, zero overhead in production.
 * 
 * @module profiling/micro-benchmarks
 */

import { useTiming, useMemoryTracking } from './hooks';
import type { 
  BenchmarkResult, 
  MicroBenchmarkConfig, 
  ComponentBenchmark,
  MemorySnapshot 
} from './profiling-types';

/**
 * Micro-benchmark runner for component-level testing
 */
export class MicroBenchmarkRunner {
  private static instance: MicroBenchmarkRunner;
  private results: Map<string, BenchmarkResult[]> = new Map();

  static getInstance(): MicroBenchmarkRunner {
    if (!MicroBenchmarkRunner.instance) {
      MicroBenchmarkRunner.instance = new MicroBenchmarkRunner();
    }
    return MicroBenchmarkRunner.instance;
  }

  /**
   * Run a single benchmark
   */
  async runBenchmark(
    name: string,
    testFn: () => void | Promise<void>,
    config: MicroBenchmarkConfig
  ): Promise<BenchmarkResult> {
    const timing = useTiming(name);
    const memory = useMemoryTracking(name);

    // Warmup phase
    for (let i = 0; i < config.warmupIterations; i++) {
      await testFn();
    }

    // Setup phase
    if (config.setup) {
      await config.setup();
    }

    // Memory snapshot before
    const memoryBefore = config.trackMemory ? memory.snapshot() : null;

    // Benchmark phase
    const times: number[] = [];
    const startTime = performance.now();

    for (let i = 0; i < config.iterations; i++) {
      const endTiming = timing.start();
      await testFn();
      const iterationTime = endTiming();
      times.push(iterationTime);
    }

    const totalTime = performance.now() - startTime;

    // Memory snapshot after
    const memoryAfter = config.trackMemory ? memory.snapshot() : null;

    // Teardown phase
    if (config.teardown) {
      await config.teardown();
    }

    // Calculate statistics
    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    const result: BenchmarkResult = {
      name,
      iterations: config.iterations,
      totalTime,
      averageTime,
      minTime,
      maxTime,
      memoryUsage: {
        before: memoryBefore || this.createEmptyMemorySnapshot(),
        after: memoryAfter || this.createEmptyMemorySnapshot(),
        delta: memoryBefore && memoryAfter ? memoryAfter.heapUsed - memoryBefore.heapUsed : 0
      },
      success: true
    };

    // Store result
    const existing = this.results.get(name) || [];
    existing.push(result);
    this.results.set(name, existing);

    return result;
  }

  /**
   * Run component benchmarks
   */
  async runComponentBenchmarks(component: ComponentBenchmark): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];

    for (const scenario of component.scenarios) {
      try {
        const result = await this.runBenchmark(
          `${component.component}-${scenario.name}`,
          async () => {
            const context = scenario.setup();
            await scenario.test(context);
          },
          scenario.config
        );
        results.push(result);
      } catch (error) {
        const failedResult: BenchmarkResult = {
          name: `${component.component}-${scenario.name}`,
          iterations: scenario.config.iterations,
          totalTime: 0,
          averageTime: 0,
          minTime: 0,
          maxTime: 0,
          memoryUsage: {
            before: this.createEmptyMemorySnapshot(),
            after: this.createEmptyMemorySnapshot(),
            delta: 0
          },
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
        results.push(failedResult);
      }
    }

    return results;
  }

  /**
   * Get benchmark results
   */
  getResults(name?: string): BenchmarkResult[] {
    if (name) {
      return this.results.get(name) || [];
    }
    return Array.from(this.results.values()).flat();
  }

  /**
   * Clear all results
   */
  clearResults(): void {
    this.results.clear();
  }

  /**
   * Create empty memory snapshot
   */
  private createEmptyMemorySnapshot(): MemorySnapshot {
    return {
      timestamp: performance.now(),
      label: 'empty',
      heapUsed: 0,
      heapTotal: 0,
      external: 0,
      rss: 0,
      arrayBuffers: 0
    };
  }
}

/**
 * Algorithm Selection Benchmarks
 */
export const algorithmSelectionBenchmarks: ComponentBenchmark = {
  component: 'algorithm-selection',
  scenarios: [
    {
      name: 'grid-classification',
      description: 'Test grid size classification performance',
      config: {
        name: 'grid-classification',
        iterations: 1000,
        warmupIterations: 100,
        trackMemory: true,
        trackAllocations: false
      },
      setup: () => ({
        testGrids: [
          { width: 25, height: 25, objectCount: 625 },
          { width: 50, height: 50, objectCount: 2500 },
          { width: 100, height: 100, objectCount: 10000 },
          { width: 200, height: 200, objectCount: 40000 }
        ]
      }),
      test: async (context) => {
        // Simulate grid classification logic
        for (const grid of context.testGrids) {
          const gridSize = Math.sqrt(grid.objectCount);
          // Simulate additional classification work
          Math.random() * gridSize;
        }
      }
    },
    {
      name: 'performance-prediction',
      description: 'Test performance prediction calculation',
      config: {
        name: 'performance-prediction',
        iterations: 500,
        warmupIterations: 50,
        trackMemory: true,
        trackAllocations: false
      },
      setup: () => ({
        testCases: [
          { gridSize: 25, complexity: 0.5 },
          { gridSize: 50, complexity: 0.8 },
          { gridSize: 100, complexity: 0.9 },
          { gridSize: 200, complexity: 0.7 }
        ]
      }),
      test: async (context) => {
        // Simulate performance prediction logic
        for (const testCase of context.testCases) {
          const baseComplexity = testCase.gridSize * testCase.gridSize;
          const adjustedComplexity = baseComplexity * (testCase.complexity > 0.7 ? 0.8 : 0.9);
          const executionTime = adjustedComplexity * 0.0006;
          const memoryUsage = testCase.gridSize * testCase.gridSize * 40;
          // Simulate calculation overhead
          Math.random() * executionTime + memoryUsage;
        }
      }
    }
  ]
};

/**
 * Memory Pool Benchmarks
 */
export const memoryPoolBenchmarks: ComponentBenchmark = {
  component: 'memory-pool',
  scenarios: [
    {
      name: 'pool-allocation',
      description: 'Test memory pool allocation performance',
      config: {
        name: 'pool-allocation',
        iterations: 1000,
        warmupIterations: 100,
        trackMemory: true,
        trackAllocations: true
      },
      setup: () => ({
        poolSizes: [100, 500, 1000, 5000],
        allocationPattern: 'sequential'
      }),
      test: async (context) => {
        // Simulate pool allocation
        for (const size of context.poolSizes) {
          const allocations = [];
          for (let i = 0; i < 10; i++) {
            // Simulate allocation
            allocations.push(new Array(size).fill(0));
          }
          // Simulate deallocation
          allocations.length = 0;
        }
      }
    },
    {
      name: 'pool-cleanup',
      description: 'Test memory pool cleanup performance',
      config: {
        name: 'pool-cleanup',
        iterations: 100,
        warmupIterations: 10,
        trackMemory: true,
        trackAllocations: false
      },
      setup: () => ({
        poolCount: 100,
        maxIdleTime: 300000
      }),
      test: async (context) => {
        // Simulate pool cleanup logic
        const pools = Array(context.poolCount).fill(null).map((_, i) => ({
          id: i,
          isInUse: Math.random() > 0.5,
          lastUsed: Date.now() - Math.random() * context.maxIdleTime
        }));

        const now = Date.now();
        const filtered = pools.filter(p => 
          p.isInUse || now - p.lastUsed <= context.maxIdleTime
        );
        
        // Simulate cleanup overhead
        filtered.length;
      }
    }
  ]
};

/**
 * Clustering Benchmarks
 */
export const clusteringBenchmarks: ComponentBenchmark = {
  component: 'clustering',
  scenarios: [
    {
      name: 'fixed-clustering',
      description: 'Test fixed cluster size generation',
      config: {
        name: 'fixed-clustering',
        iterations: 100,
        warmupIterations: 10,
        trackMemory: true,
        trackAllocations: false
      },
      setup: () => ({
        gridSizes: [50, 100, 200],
        clusterSize: 10
      }),
      test: async (context) => {
        // Simulate fixed clustering
        for (const gridSize of context.gridSizes) {
          const clusters = [];
          for (let y = 0; y < gridSize; y += context.clusterSize) {
            for (let x = 0; x < gridSize; x += context.clusterSize) {
              clusters.push({
                x, y,
                width: Math.min(context.clusterSize, gridSize - x),
                height: Math.min(context.clusterSize, gridSize - y)
              });
            }
          }
          // Simulate processing overhead
          clusters.length;
        }
      }
    },
    {
      name: 'adaptive-clustering',
      description: 'Test adaptive cluster size calculation',
      config: {
        name: 'adaptive-clustering',
        iterations: 200,
        warmupIterations: 20,
        trackMemory: true,
        trackAllocations: false
      },
      setup: () => ({
        testCases: [
          { width: 50, height: 50, obstacleDensity: 0.3 },
          { width: 100, height: 100, obstacleDensity: 0.5 },
          { width: 200, height: 200, obstacleDensity: 0.7 }
        ]
      }),
      test: async (context) => {
        // Simulate adaptive clustering
        for (const testCase of context.testCases) {
          const totalCells = testCase.width * testCase.height;
          const baseSize = Math.sqrt(totalCells) / 4;
          const densityMultiplier = testCase.obstacleDensity > 0.3 ? 0.7 : 1.2;
          const optimalSize = Math.max(8, Math.min(25, baseSize * densityMultiplier));
          
          // Simulate calculation overhead
          Math.floor(optimalSize);
        }
      }
    }
  ]
};

/**
 * High Complexity Algorithm Benchmarks
 */
export const highComplexityBenchmarks: ComponentBenchmark = {
  component: 'high-complexity',
  scenarios: [
    {
      name: 'complexity-profiling',
      description: 'Test complexity profile analysis',
      config: {
        name: 'complexity-profiling',
        iterations: 500,
        warmupIterations: 50,
        trackMemory: true,
        trackAllocations: false
      },
      setup: () => ({
        complexityLevels: [0.5, 0.7, 0.8, 0.9, 0.95]
      }),
      test: async (context) => {
        // Simulate complexity profiling
        for (const threshold of context.complexityLevels) {
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
      }
    },
    {
      name: 'specialized-algorithms',
      description: 'Test specialized algorithm selection',
      config: {
        name: 'specialized-algorithms',
        iterations: 200,
        warmupIterations: 20,
        trackMemory: true,
        trackAllocations: false
      },
      setup: () => ({
        profiles: [
          { type: 'high-discontinuous', gridSize: 100 },
          { type: 'high-noisy', gridSize: 100 },
          { type: 'extreme', gridSize: 100 }
        ]
      }),
      test: async (context) => {
        // Simulate specialized algorithm selection
        for (const profile of context.profiles) {
          let algorithm = 'standard-lut';
          if (profile.type === 'high-discontinuous') algorithm = 'region-growing';
          else if (profile.type === 'high-noisy') algorithm = 'morphological-adaptive';
          else if (profile.type === 'extreme') algorithm = 'hybrid-multi-pass';
          
          // Simulate selection overhead
          const complexity = profile.gridSize * profile.gridSize;
          const multiplier = algorithm === 'standard-lut' ? 1.0 : 0.8;
          complexity * multiplier;
        }
      }
    }
  ]
};

/**
 * Run all micro-benchmarks
 */
export async function runAllMicroBenchmarks(): Promise<{
  algorithmSelection: BenchmarkResult[];
  memoryPool: BenchmarkResult[];
  clustering: BenchmarkResult[];
  highComplexity: BenchmarkResult[];
}> {
  const runner = MicroBenchmarkRunner.getInstance();

  const [algorithmSelection, memoryPool, clustering, highComplexity] = await Promise.all([
    runner.runComponentBenchmarks(algorithmSelectionBenchmarks),
    runner.runComponentBenchmarks(memoryPoolBenchmarks),
    runner.runComponentBenchmarks(clusteringBenchmarks),
    runner.runComponentBenchmarks(highComplexityBenchmarks)
  ]);

  return {
    algorithmSelection,
    memoryPool,
    clustering,
    highComplexity
  };
}

/**
 * Export benchmark runner instance
 */
export const benchmarkRunner = MicroBenchmarkRunner.getInstance();

/**
 * Integrated PAW benchmark utilities
 * Provides a convenient interface for running and managing PAW benchmarks
 */
export const pawBenchmarks = {
  /**
   * Run all PAW micro-benchmarks
   */
  runAll: runAllMicroBenchmarks,
  
  /**
   * Get benchmark results
   */
  getResults: (name?: string) => benchmarkRunner.getResults(name),
  
  /**
   * Clear all benchmark results
   */
  clearResults: () => benchmarkRunner.clearResults()
};
