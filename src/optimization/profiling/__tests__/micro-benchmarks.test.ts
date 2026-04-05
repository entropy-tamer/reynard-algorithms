/**
 * Tests for Micro-Benchmarks
 * 
 * Comprehensive test suite for the micro-benchmark system
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  MicroBenchmarkRunner,
  algorithmSelectionBenchmarks,
  memoryPoolBenchmarks,
  clusteringBenchmarks,
  highComplexityBenchmarks,
  runAllMicroBenchmarks,
  benchmarkRunner,
  pawBenchmarks
} from '../micro-benchmarks';
import type { BenchmarkResult, MicroBenchmarkConfig } from '../profiling-types';

describe('MicroBenchmarkRunner', () => {
  let runner: MicroBenchmarkRunner;

  beforeEach(() => {
    // Reset singleton for clean testing
    (MicroBenchmarkRunner as any).instance = null;
    runner = MicroBenchmarkRunner.getInstance();
  });

  afterEach(() => {
    runner.clearResults();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = MicroBenchmarkRunner.getInstance();
      const instance2 = MicroBenchmarkRunner.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Single Benchmark Execution', () => {
    it('should run a simple synchronous benchmark', async () => {
      const config: MicroBenchmarkConfig = {
        name: 'simple-test',
        iterations: 10,
        warmupIterations: 2,
        trackMemory: false,
        trackAllocations: false
      };

      const result = await runner.runBenchmark('simple-test', () => {
        // Simple computation
        Math.random() * 100;
      }, config);

      expect(result.name).toBe('simple-test');
      expect(result.iterations).toBe(10);
      expect(result.success).toBe(true);
      expect(result.totalTime).toBeGreaterThan(0);
      expect(result.averageTime).toBeGreaterThan(0);
      expect(result.minTime).toBeGreaterThanOrEqual(0);
      expect(result.maxTime).toBeGreaterThanOrEqual(result.minTime);
    });

    it('should run an asynchronous benchmark', async () => {
      const config: MicroBenchmarkConfig = {
        name: 'async-test',
        iterations: 5,
        warmupIterations: 1,
        trackMemory: false,
        trackAllocations: false
      };

      const result = await runner.runBenchmark('async-test', async () => {
        return new Promise(resolve => {
          setTimeout(() => resolve(Math.random() * 100), 1);
        });
      }, config);

      expect(result.name).toBe('async-test');
      expect(result.success).toBe(true);
      expect(result.totalTime).toBeGreaterThan(0);
    });

    it('should handle setup and teardown phases', async () => {
      let setupCalled = false;
      let teardownCalled = false;

      const config: MicroBenchmarkConfig = {
        name: 'setup-teardown-test',
        iterations: 3,
        warmupIterations: 1,
        trackMemory: false,
        trackAllocations: false,
        setup: () => {
          setupCalled = true;
        },
        teardown: () => {
          teardownCalled = true;
        }
      };

      await runner.runBenchmark('setup-teardown-test', () => {
        expect(setupCalled).toBe(true);
        expect(teardownCalled).toBe(false);
      }, config);

      expect(setupCalled).toBe(true);
      expect(teardownCalled).toBe(true);
    });

    it('should track memory when enabled', async () => {
      const config: MicroBenchmarkConfig = {
        name: 'memory-test',
        iterations: 5,
        warmupIterations: 1,
        trackMemory: true,
        trackAllocations: false
      };

      const result = await runner.runBenchmark('memory-test', () => {
        // Allocate some memory
        const data = new Array(1000).fill(Math.random());
        data.length = 0; // Clear
      }, config);

      expect(result.success).toBe(true);
      expect(result.memoryUsage.before.timestamp).toBeGreaterThan(0);
      expect(result.memoryUsage.after.timestamp).toBeGreaterThan(0);
      expect(typeof result.memoryUsage.delta).toBe('number');
    });

    it('should handle benchmark failures gracefully', async () => {
      const config: MicroBenchmarkConfig = {
        name: 'failing-test',
        iterations: 3,
        warmupIterations: 1,
        trackMemory: false,
        trackAllocations: false
      };

      const result = await runner.runBenchmark('failing-test', () => {
        throw new Error('Test error');
      }, config);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error');
      expect(result.totalTime).toBe(0);
      expect(result.averageTime).toBe(0);
    });
  });

  describe('Component Benchmark Execution', () => {
    it('should run component benchmarks successfully', async () => {
      const componentBenchmark = {
        component: 'test-component',
        scenarios: [
          {
            name: 'scenario-1',
            description: 'Test scenario 1',
            config: {
              name: 'scenario-1',
              iterations: 3,
              warmupIterations: 1,
              trackMemory: false,
              trackAllocations: false
            },
            setup: () => ({ value: 42 }),
            test: async (context: any) => {
              expect(context.value).toBe(42);
              Math.random() * context.value;
            }
          },
          {
            name: 'scenario-2',
            description: 'Test scenario 2',
            config: {
              name: 'scenario-2',
              iterations: 2,
              warmupIterations: 1,
              trackMemory: false,
              trackAllocations: false
            },
            setup: () => ({ value: 100 }),
            test: async (context: any) => {
              expect(context.value).toBe(100);
              Math.random() * context.value;
            }
          }
        ]
      };

      const results = await runner.runComponentBenchmarks(componentBenchmark);

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('test-component-scenario-1');
      expect(results[1].name).toBe('test-component-scenario-2');
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
    });

    it('should handle mixed success/failure scenarios', async () => {
      const componentBenchmark = {
        component: 'mixed-component',
        scenarios: [
          {
            name: 'success-scenario',
            description: 'Should succeed',
            config: {
              name: 'success-scenario',
              iterations: 2,
              warmupIterations: 1,
              trackMemory: false,
              trackAllocations: false
            },
            setup: () => ({}),
            test: async () => {
              Math.random();
            }
          },
          {
            name: 'failure-scenario',
            description: 'Should fail',
            config: {
              name: 'failure-scenario',
              iterations: 2,
              warmupIterations: 1,
              trackMemory: false,
              trackAllocations: false
            },
            setup: () => ({}),
            test: async () => {
              throw new Error('Intentional failure');
            }
          }
        ]
      };

      const results = await runner.runComponentBenchmarks(componentBenchmark);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBe('Intentional failure');
    });
  });

  describe('Results Management', () => {
    it('should store and retrieve results', async () => {
      const config: MicroBenchmarkConfig = {
        name: 'storage-test',
        iterations: 2,
        warmupIterations: 1,
        trackMemory: false,
        trackAllocations: false
      };

      await runner.runBenchmark('storage-test', () => Math.random(), config);

      const results = runner.getResults('storage-test');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('storage-test');
    });

    it('should retrieve all results when no name specified', async () => {
      const config1: MicroBenchmarkConfig = {
        name: 'test-1',
        iterations: 2,
        warmupIterations: 1,
        trackMemory: false,
        trackAllocations: false
      };

      const config2: MicroBenchmarkConfig = {
        name: 'test-2',
        iterations: 2,
        warmupIterations: 1,
        trackMemory: false,
        trackAllocations: false
      };

      await runner.runBenchmark('test-1', () => Math.random(), config1);
      await runner.runBenchmark('test-2', () => Math.random(), config2);

      const allResults = runner.getResults();
      expect(allResults).toHaveLength(2);
      expect(allResults.some(r => r.name === 'test-1')).toBe(true);
      expect(allResults.some(r => r.name === 'test-2')).toBe(true);
    });

    it('should clear all results', async () => {
      const config: MicroBenchmarkConfig = {
        name: 'clear-test',
        iterations: 2,
        warmupIterations: 1,
        trackMemory: false,
        trackAllocations: false
      };

      await runner.runBenchmark('clear-test', () => Math.random(), config);
      expect(runner.getResults()).toHaveLength(1);

      runner.clearResults();
      expect(runner.getResults()).toHaveLength(0);
    });
  });
});

describe('Predefined Component Benchmarks', () => {
  beforeEach(() => {
    (MicroBenchmarkRunner as any).instance = null;
  });

  it('should have algorithm selection benchmarks', () => {
    expect(algorithmSelectionBenchmarks.component).toBe('algorithm-selection');
    expect(algorithmSelectionBenchmarks.scenarios).toHaveLength(2);
    expect(algorithmSelectionBenchmarks.scenarios[0].name).toBe('grid-classification');
    expect(algorithmSelectionBenchmarks.scenarios[1].name).toBe('performance-prediction');
  });

  it('should have memory pool benchmarks', () => {
    expect(memoryPoolBenchmarks.component).toBe('memory-pool');
    expect(memoryPoolBenchmarks.scenarios).toHaveLength(2);
    expect(memoryPoolBenchmarks.scenarios[0].name).toBe('pool-allocation');
    expect(memoryPoolBenchmarks.scenarios[1].name).toBe('pool-cleanup');
  });

  it('should have clustering benchmarks', () => {
    expect(clusteringBenchmarks.component).toBe('clustering');
    expect(clusteringBenchmarks.scenarios).toHaveLength(2);
    expect(clusteringBenchmarks.scenarios[0].name).toBe('fixed-clustering');
    expect(clusteringBenchmarks.scenarios[1].name).toBe('adaptive-clustering');
  });

  it('should have high complexity benchmarks', () => {
    expect(highComplexityBenchmarks.component).toBe('high-complexity');
    expect(highComplexityBenchmarks.scenarios).toHaveLength(2);
    expect(highComplexityBenchmarks.scenarios[0].name).toBe('complexity-profiling');
    expect(highComplexityBenchmarks.scenarios[1].name).toBe('specialized-algorithms');
  });

  it('should run algorithm selection benchmarks', async () => {
    const runner = MicroBenchmarkRunner.getInstance();
    const results = await runner.runComponentBenchmarks(algorithmSelectionBenchmarks);

    expect(results).toHaveLength(2);
    expect(results.every(r => r.success)).toBe(true);
    expect(results.every(r => r.totalTime > 0)).toBe(true);
  });

  it('should run memory pool benchmarks', async () => {
    const runner = MicroBenchmarkRunner.getInstance();
    const results = await runner.runComponentBenchmarks(memoryPoolBenchmarks);

    expect(results).toHaveLength(2);
    expect(results.every(r => r.success)).toBe(true);
    expect(results.every(r => r.totalTime > 0)).toBe(true);
  });

  it('should run clustering benchmarks', async () => {
    const runner = MicroBenchmarkRunner.getInstance();
    const results = await runner.runComponentBenchmarks(clusteringBenchmarks);

    expect(results).toHaveLength(2);
    expect(results.every(r => r.success)).toBe(true);
    expect(results.every(r => r.totalTime > 0)).toBe(true);
  });

  it('should run high complexity benchmarks', async () => {
    const runner = MicroBenchmarkRunner.getInstance();
    const results = await runner.runComponentBenchmarks(highComplexityBenchmarks);

    expect(results).toHaveLength(2);
    expect(results.every(r => r.success)).toBe(true);
    expect(results.every(r => r.totalTime > 0)).toBe(true);
  });
});

describe('runAllMicroBenchmarks', () => {
  beforeEach(() => {
    (MicroBenchmarkRunner as any).instance = null;
  });

  it('should run all predefined benchmarks', async () => {
    const results = await runAllMicroBenchmarks();

    expect(results).toHaveProperty('algorithmSelection');
    expect(results).toHaveProperty('memoryPool');
    expect(results).toHaveProperty('clustering');
    expect(results).toHaveProperty('highComplexity');

    expect(results.algorithmSelection).toHaveLength(2);
    expect(results.memoryPool).toHaveLength(2);
    expect(results.clustering).toHaveLength(2);
    expect(results.highComplexity).toHaveLength(2);

    // Check that all benchmarks succeeded
    const allResults = [
      ...results.algorithmSelection,
      ...results.memoryPool,
      ...results.clustering,
      ...results.highComplexity
    ];

    expect(allResults.every((r: any) => r.success)).toBe(true);
    expect(allResults.every((r: any) => r.totalTime > 0)).toBe(true);
  });
});

describe('pawBenchmarks Integration', () => {
  beforeEach(() => {
    (MicroBenchmarkRunner as any).instance = null;
  });

  it('should provide integrated benchmark utilities', () => {
    expect(typeof pawBenchmarks.runAll).toBe('function');
    expect(typeof pawBenchmarks.getResults).toBe('function');
    expect(typeof pawBenchmarks.clearResults).toBe('function');
  });

  it('should integrate with runAllMicroBenchmarks', async () => {
    const results = await pawBenchmarks.runAll();

    expect(results).toHaveProperty('algorithmSelection');
    expect(results).toHaveProperty('memoryPool');
    expect(results).toHaveProperty('clustering');
    expect(results).toHaveProperty('highComplexity');
  });

  it('should integrate results retrieval', async () => {
    await pawBenchmarks.runAll();

    const allResults = pawBenchmarks.getResults();
    expect(allResults.length).toBeGreaterThan(0);

    const algorithmResults = pawBenchmarks.getResults('algorithm-selection-grid-classification');
    expect(algorithmResults.length).toBeGreaterThan(0);
  });

  it('should integrate results clearing', async () => {
    await pawBenchmarks.runAll();

    expect(pawBenchmarks.getResults().length).toBeGreaterThan(0);

    pawBenchmarks.clearResults();

    expect(pawBenchmarks.getResults().length).toBe(0);
  });
});
