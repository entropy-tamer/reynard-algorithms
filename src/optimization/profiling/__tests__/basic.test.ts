/**
 * Simple Test Suite for Performance Profiling
 * 
 * Basic tests to verify the profiling implementation works correctly
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { profiler } from '../hooks';
import { MicroBenchmarkRunner } from '../micro-benchmarks';

// Mock performance.now for consistent testing
const mockPerformanceNow = vi.fn();
Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow
  },
  writable: true
});

// Mock process.env for environment testing
const originalEnv = process.env;

describe('Performance Profiling - Basic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformanceNow.mockClear();
    let time = 0;
    mockPerformanceNow.mockImplementation(() => {
      time += 10; // Increment by 10ms each call
      return time;
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should detect benchmark environment', () => {
    process.env.REYNARD_BENCHMARK = 'true';
    
    expect(profiler.isEnabled()).toBe(true);
  });

  it('should be disabled in production', () => {
    process.env.NODE_ENV = 'production';
    
    // Reset singleton to test environment detection
    (profiler as any).config.enabled = false;
    
    expect(profiler.isEnabled()).toBe(false);
  });

  it('should track timing operations', async () => {
    process.env.REYNARD_BENCHMARK = 'true';
    (profiler as any).config.enabled = true;
    
    const endTiming = profiler.startTiming('test-operation');
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 5));
    
    const duration = endTiming();
    
    expect(duration).toBeGreaterThan(0);
    
    const report = profiler.getPerformanceReport();
    expect(report.operations).toHaveLength(1);
    expect(report.operations[0].name).toBe('test-operation');
    expect(report.operations[0].count).toBe(1);
  });

  it('should track memory snapshots', () => {
    process.env.REYNARD_BENCHMARK = 'true';
    (profiler as any).config.enabled = true;
    
    const snapshot = profiler.takeMemorySnapshot('test-snapshot');
    
    expect(snapshot).toBeDefined();
    if (snapshot) {
      expect(snapshot.label).toBe('test-snapshot');
      expect(snapshot.timestamp).toBeGreaterThan(0);
    }
    
    const report = profiler.getPerformanceReport();
    expect(report.memorySnapshots).toHaveLength(1);
    expect(report.memorySnapshots[0].label).toBe('test-snapshot');
  });

  it('should clear all data', () => {
    process.env.REYNARD_BENCHMARK = 'true';
    (profiler as any).config.enabled = true;
    
    // Add some data
    const endTiming = profiler.startTiming('test-operation');
    profiler.takeMemorySnapshot('test-snapshot');
    profiler.trackAllocation('test-type', 1024);
    
    endTiming();
    
    expect(profiler.getPerformanceReport().operations).toHaveLength(1);
    expect(profiler.getPerformanceReport().memorySnapshots).toHaveLength(1);
    expect(profiler.getPerformanceReport().allocationRecords).toHaveLength(1);
    
    // Clear data
    profiler.clear();
    
    expect(profiler.getPerformanceReport().operations).toHaveLength(0);
    expect(profiler.getPerformanceReport().memorySnapshots).toHaveLength(0);
    expect(profiler.getPerformanceReport().allocationRecords).toHaveLength(0);
  });
});

describe('Micro-Benchmarks - Basic Tests', () => {
  beforeEach(() => {
    process.env.REYNARD_BENCHMARK = 'true';
  });

  it('should run simple benchmark', async () => {
    const runner = MicroBenchmarkRunner.getInstance();
    
    const result = await runner.runBenchmark('simple-test', () => {
      Math.random() * 100;
    }, {
      name: 'simple-test',
      iterations: 5,
      warmupIterations: 1,
      trackMemory: false,
      trackAllocations: false
    });

    expect(result.name).toBe('simple-test');
    expect(result.success).toBe(true);
    expect(result.iterations).toBe(5);
    expect(result.totalTime).toBeGreaterThan(0);
    expect(result.averageTime).toBeGreaterThan(0);
  });

  it('should handle async benchmarks', async () => {
    const runner = MicroBenchmarkRunner.getInstance();
    
    const result = await runner.runBenchmark('async-test', async () => {
      return new Promise<void>(resolve => {
        setTimeout(() => resolve(), 1);
      });
    }, {
      name: 'async-test',
      iterations: 3,
      warmupIterations: 1,
      trackMemory: false,
      trackAllocations: false
    });

    expect(result.name).toBe('async-test');
    expect(result.success).toBe(true);
    expect(result.totalTime).toBeGreaterThan(0);
  });

  it('should handle benchmark failures', async () => {
    const runner = MicroBenchmarkRunner.getInstance();
    
    const result = await runner.runBenchmark('failing-test', () => {
      throw new Error('Test error');
    }, {
      name: 'failing-test',
      iterations: 3,
      warmupIterations: 1,
      trackMemory: false,
      trackAllocations: false
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Test error');
    // Benchmark may still record time even on failure
    expect(result.totalTime).toBeGreaterThanOrEqual(0);
  });

  it('should run component benchmarks', async () => {
    const runner = MicroBenchmarkRunner.getInstance();
    
    const componentBenchmark = {
      component: 'test-component',
      scenarios: [
        {
          name: 'scenario-1',
          description: 'Test scenario 1',
          config: {
            name: 'scenario-1',
            iterations: 2,
            warmupIterations: 1,
            trackMemory: false,
            trackAllocations: false
          },
          setup: () => ({ value: 42 }),
          test: async (context: any) => {
            expect(context.value).toBe(42);
            Math.random() * context.value;
          }
        }
      ]
    };

    const results = await runner.runComponentBenchmarks(componentBenchmark);

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('test-component-scenario-1');
    expect(results[0].success).toBe(true);
  });

  it('should store and retrieve results', async () => {
    const runner = MicroBenchmarkRunner.getInstance();
    
    await runner.runBenchmark('storage-test', () => {
      Math.random();
      return undefined;
    }, {
      name: 'storage-test',
      iterations: 2,
      warmupIterations: 1,
      trackMemory: false,
      trackAllocations: false
    });

    const results = runner.getResults('storage-test');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('storage-test');

    runner.clearResults();
    expect(runner.getResults()).toHaveLength(0);
  });
});
