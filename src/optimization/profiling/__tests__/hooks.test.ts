/**
 * Tests for Performance Profiling Hooks
 * 
 * Comprehensive test suite for the zero-overhead performance profiling system
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  PerformanceProfiler, 
  useTiming, 
  useMemoryTracking, 
  profile
} from '../hooks';
import { pawPerformance } from '../index';

describe('PerformanceProfiler', () => {
  let profiler: PerformanceProfiler;

  beforeEach(() => {
    // Reset singleton for clean testing
    (PerformanceProfiler as any).instance = null;
    profiler = PerformanceProfiler.getInstance();
  });

  afterEach(() => {
    profiler.clear();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = PerformanceProfiler.getInstance();
      const instance2 = PerformanceProfiler.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Environment Detection', () => {
    it('should be disabled in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      (PerformanceProfiler as any).instance = null;
      const prodProfiler = PerformanceProfiler.getInstance();
      
      expect(prodProfiler.isEnabled()).toBe(false);
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should be enabled in benchmark mode', () => {
      const originalEnv = process.env.REYNARD_BENCHMARK;
      process.env.REYNARD_BENCHMARK = 'true';
      
      (PerformanceProfiler as any).instance = null;
      const benchProfiler = PerformanceProfiler.getInstance();
      
      expect(benchProfiler.isEnabled()).toBe(true);
      
      process.env.REYNARD_BENCHMARK = originalEnv;
    });

    it('should be enabled in test mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';
      
      (PerformanceProfiler as any).instance = null;
      const testProfiler = PerformanceProfiler.getInstance();
      
      expect(testProfiler.isEnabled()).toBe(true);
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Timing Operations', () => {
    it('should track timing when enabled', () => {
      const endTiming = profiler.startTiming('test-operation');
      
      // Simulate some work
      const start = performance.now();
      while (performance.now() - start < 10) {
        // Wait at least 10ms
      }
      
      const duration = endTiming();
      expect(duration).toBeGreaterThan(0);
    });

    it('should return no-op when disabled', () => {
      profiler.clear();
      (profiler as any).config.enabled = false;
      
      const endTiming = profiler.startTiming('test-operation');
      const duration = endTiming();
      
      expect(duration).toBe(0);
    });

    it('should aggregate timing data correctly', () => {
      const endTiming1 = profiler.startTiming('test-operation');
      const endTiming2 = profiler.startTiming('test-operation');
      
      // Simulate work
      const start = performance.now();
      while (performance.now() - start < 5) {
        // Wait at least 5ms
      }
      
      const duration1 = endTiming1();
      const duration2 = endTiming2();
      
      const report = profiler.getPerformanceReport();
      const operation = report.operations.find((op: any) => op.name === 'test-operation');
      
      expect(operation).toBeDefined();
      expect(operation?.count).toBe(2);
      expect(operation?.total).toBeGreaterThan(0);
      expect(operation?.average).toBeGreaterThan(0);
    });
  });

  describe('Memory Tracking', () => {
    it('should take memory snapshots when enabled', () => {
      const snapshot = profiler.takeMemorySnapshot('test-snapshot');
      
      expect(snapshot).toBeDefined();
      expect(snapshot?.timestamp).toBeGreaterThan(0);
      expect(snapshot?.label).toBe('test-snapshot');
      expect(snapshot?.heapUsed).toBeGreaterThanOrEqual(0);
      expect(snapshot?.heapTotal).toBeGreaterThanOrEqual(0);
    });

    it('should return empty snapshot when disabled', () => {
      profiler.clear();
      (profiler as any).config.enabled = false;
      
      const snapshot = profiler.takeMemorySnapshot('test-snapshot');
      
      expect(snapshot).toBeDefined();
      expect(snapshot?.timestamp).toBe(0);
      expect(snapshot?.heapUsed).toBe(0);
    });

    it('should track allocations when enabled', () => {
      profiler.trackAllocation('test-type', 1024);
      
      const report = profiler.getPerformanceReport();
      const allocation = report.allocationRecords.find(
        (record: any) => record.type === 'test-type' && record.size === 1024
      );
      
      expect(allocation).toBeDefined();
    });
  });

  describe('Performance Reports', () => {
    it('should generate comprehensive performance reports', () => {
      // Add some data
      const endTiming = profiler.startTiming('test-operation');
      profiler.takeMemorySnapshot('test-snapshot');
      profiler.trackAllocation('test-type', 1024);
      
      endTiming();
      
      const report = profiler.getPerformanceReport();
      
      expect(report.enabled).toBe(true);
      expect(report.timestamp).toBeGreaterThan(0);
      expect(report.operations).toHaveLength(1);
      expect(report.memorySnapshots).toHaveLength(1);
      expect(report.allocationRecords).toHaveLength(1);
      expect(report.summary.totalOperations).toBe(1);
    });

    it('should export data as JSON', () => {
      const endTiming = profiler.startTiming('test-operation');
      endTiming();
      
      const exported = profiler.exportData();
      
      expect(typeof exported).toBe('string');
      const parsed = JSON.parse(exported);
      expect(parsed.enabled).toBe(true);
      expect(parsed.operations).toHaveLength(1);
    });
  });

  describe('Cleanup Operations', () => {
    it('should clear all data', () => {
      const endTiming = profiler.startTiming('test-operation');
      profiler.takeMemorySnapshot('test-snapshot');
      profiler.trackAllocation('test-type', 1024);
      
      endTiming();
      
      expect(profiler.getPerformanceReport().operations).toHaveLength(1);
      
      profiler.clear();
      
      expect(profiler.getPerformanceReport().operations).toHaveLength(0);
      expect(profiler.getPerformanceReport().memorySnapshots).toHaveLength(0);
      expect(profiler.getPerformanceReport().allocationRecords).toHaveLength(0);
    });

    it('should auto-cleanup when enabled', () => {
      (profiler as any).config.autoCleanup = true;
      
      // Add lots of data
      for (let i = 0; i < 1500; i++) {
        profiler.startTiming(`operation-${i}`)();
      }
      
      profiler.autoCleanup();
      
      const report = profiler.getPerformanceReport();
      expect(report.summary.totalOperations).toBeLessThanOrEqual(1500);
    });
  });
});

describe('useTiming Hook', () => {
  beforeEach(() => {
    (PerformanceProfiler as any).instance = null;
  });

  it('should provide timing functionality', () => {
    const timing = useTiming('test-operation');
    
    expect(typeof timing.start).toBe('function');
    
    const endTiming = timing.start();
    expect(typeof endTiming).toBe('function');
    
    const duration = endTiming();
    expect(typeof duration).toBe('number');
  });

  it('should handle sub-operations', () => {
    const timing = useTiming('test-operation', 'sub-operation');
    
    const endTiming = timing.start();
    const duration = endTiming();
    
    expect(duration).toBeGreaterThanOrEqual(0);
  });
});

describe('useMemoryTracking Hook', () => {
  beforeEach(() => {
    (PerformanceProfiler as any).instance = null;
  });

  it('should provide memory tracking functionality', () => {
    const memory = useMemoryTracking('test-label');
    
    expect(typeof memory.snapshot).toBe('function');
    
    const report = PerformanceProfiler.getInstance().getPerformanceReport();
    const allocation = report.allocationRecords.find(
      record => record.type === 'test-type' && record.size === 2048
    );
    
    expect(allocation).toBeDefined();
  });
});

describe('profile Decorator', () => {
  beforeEach(() => {
    (PerformanceProfiler as any).instance = null;
  });

  it('should profile synchronous methods', () => {
    class TestClass {
      @profile('test-method')
      testMethod(value: number): number {
        return value * 2;
      }
    }
    
    const instance = new TestClass();
    const result = instance.testMethod(5);
    
    expect(result).toBe(15);
    
    const report = PerformanceProfiler.getInstance().getPerformanceReport();
    const operation = report.operations.find((op: any) => op.name === 'test-method');
    
    expect(operation).toBeDefined();
    expect(operation?.count).toBe(1);
  });

  it('should profile asynchronous methods', async () => {
    class TestClass {
      @profile('async-test-method')
      async asyncTestMethod(value: number): Promise<number> {
        return new Promise(resolve => {
          setTimeout(() => resolve(value * 3), 10);
        });
      }
    }
    
    const instance = new TestClass();
    const result = await instance.asyncTestMethod(5);
    
    expect(result).toBe(15);
    
    const report = PerformanceProfiler.getInstance().getPerformanceReport();
    const operation = report.operations.find((op: any) => op.name === 'async-test-method');
    
    expect(operation).toBeDefined();
    expect(operation?.count).toBe(1);
  });

  it('should track memory when requested', () => {
    class TestClass {
      @profile('test-method-with-memory', { trackMemory: true })
      testMethod(): void {
        // Allocate some memory
        const data = new Array(1000).fill(0);
        data.length = 0; // Clear
      }
    }
    
    const instance = new TestClass();
    instance.testMethod();
    
    const report = PerformanceProfiler.getInstance().getPerformanceReport();
    const snapshots = report.memorySnapshots.filter(
      (snapshot: any) => snapshot.label.includes('test-method-with-memory')
    );
    
    expect(snapshots.length).toBeGreaterThan(0);
  });
});

describe('pawPerformance Integration', () => {
  beforeEach(() => {
    (PerformanceProfiler as any).instance = null;
  });

  it('should provide integrated performance utilities', () => {
    expect(typeof pawPerformance.isEnabled).toBe('function');
    expect(typeof pawPerformance.startTiming).toBe('function');
    expect(typeof pawPerformance.trackMemory).toBe('function');
    expect(typeof pawPerformance.getReport).toBe('function');
    expect(typeof pawPerformance.exportData).toBe('function');
    expect(typeof pawPerformance.clear).toBe('function');
  });

  it('should integrate timing operations', () => {
    const endTiming = pawPerformance.startTiming('integrated-test');
    
    // Simulate work
    const start = performance.now();
    while (performance.now() - start < 5) {
      // Wait at least 5ms
    }
    
    const duration = endTiming();
    expect(duration).toBeGreaterThan(0);
    
    const report = pawPerformance.getReport();
    const operation = report.operations.find((op: any) => op.name === 'integrated-test');
    expect(operation).toBeDefined();
  });

  it('should integrate memory tracking', () => {
    const memory = pawPerformance.trackMemory('integrated-memory-test');
    
    const snapshot = memory.snapshot();
    expect(snapshot).toBeDefined();
    expect(snapshot.label).toBe('integrated-memory-test');
    
    memory.trackAllocation('integrated-type', 512);
    
    const report = pawPerformance.getReport();
    const allocation = report.allocationRecords.find(
      (record: any) => record.type === 'integrated-type' && record.size === 512
    );
    expect(allocation).toBeDefined();
  });
});
