import { describe, it, expect, beforeEach } from "vitest";
import { MemoryMonitor, MemoryLeakDetector } from "../../utils/memory/memory";

// Mock performance.memory
const mockMemory = {
  usedJSHeapSize: 1000000,
};

Object.defineProperty(global, "performance", {
  value: {
    memory: mockMemory,
  },
  writable: true,
});

describe("Memory Monitoring Extended", () => {
  beforeEach(() => {
    mockMemory.usedJSHeapSize = 1000000;
  });

  describe("MemoryMonitor", () => {
    it("should measure memory usage", () => {
      const monitor = new MemoryMonitor();
      const usage = monitor.measure();

      expect(usage).toBe(1000000);
    });

    it("should track multiple measurements", () => {
      const monitor = new MemoryMonitor();

      mockMemory.usedJSHeapSize = 1000000;
      monitor.measure();

      mockMemory.usedJSHeapSize = 1200000;
      monitor.measure();

      mockMemory.usedJSHeapSize = 1500000;
      monitor.measure();

      expect(monitor.getAverageUsage()).toBeCloseTo(1233333.33, 1);
    });

    it("should calculate memory delta", () => {
      const monitor = new MemoryMonitor();

      mockMemory.usedJSHeapSize = 1000000;
      monitor.measure();

      mockMemory.usedJSHeapSize = 1200000;
      monitor.measure();

      const delta = monitor.getDelta();
      expect(delta).toBe(200000);
    });

    it("should return 0 delta for single measurement", () => {
      const monitor = new MemoryMonitor();
      monitor.measure();

      const delta = monitor.getDelta();
      expect(delta).toBe(0);
    });

    it("should return 0 average for no measurements", () => {
      const monitor = new MemoryMonitor();
      const average = monitor.getAverageUsage();
      expect(average).toBe(0);
    });

    it("should clear measurements", () => {
      const monitor = new MemoryMonitor();

      monitor.measure();
      monitor.measure();

      expect(monitor.getAverageUsage()).toBeGreaterThan(0);

      monitor.clear();
      expect(monitor.getAverageUsage()).toBe(0);
    });

    it("should handle environment without memory API", () => {
      // Temporarily remove memory API
      const originalMemory = (global as any).performance.memory;
      delete (global as any).performance.memory;

      const monitor = new MemoryMonitor();
      const usage = monitor.measure();

      expect(usage).toBe(0);

      // Restore memory API
      (global as any).performance.memory = originalMemory;
    });
  });

  describe("MemoryLeakDetector", () => {
    it("should take snapshots", () => {
      const detector = new MemoryLeakDetector();

      mockMemory.usedJSHeapSize = 1000000;
      detector.takeSnapshot();

      mockMemory.usedJSHeapSize = 1200000;
      detector.takeSnapshot();

      // Should have 2 snapshots
      expect(detector["snapshots"]).toHaveLength(2);
    });

    it("should limit snapshots to 10", () => {
      const detector = new MemoryLeakDetector();

      // Take 12 snapshots
      for (let i = 0; i < 12; i++) {
        mockMemory.usedJSHeapSize = 1000000 + i * 100000;
        detector.takeSnapshot();
      }

      expect(detector["snapshots"]).toHaveLength(10);
    });

    it("should detect memory leak with consistent growth", () => {
      const detector = new MemoryLeakDetector();

      // Simulate consistent memory growth - need much higher growth rate
      const baseTime = Date.now();
      detector["snapshots"] = [
        { timestamp: baseTime, usage: 1000000, count: 0 },
        { timestamp: baseTime + 1000, usage: 3000000, count: 0 }, // 2MB growth in 1s = 2000 bytes/ms
        { timestamp: baseTime + 2000, usage: 5000000, count: 0 }, // 2MB growth in 1s = 2000 bytes/ms
      ];

      const result = detector.detectLeak();

      expect(result.isLeaking).toBe(true);
      expect(result.growthRate).toBeGreaterThan(1000); // 1000 bytes per ms threshold
      expect(result.confidence).toBeGreaterThan(0);
    });

    it("should not detect leak with stable memory", () => {
      const detector = new MemoryLeakDetector();

      // Simulate stable memory usage
      const baseTime = Date.now();
      detector["snapshots"] = [
        { timestamp: baseTime, usage: 1000000, count: 0 },
        { timestamp: baseTime + 1000, usage: 1001000, count: 0 },
        { timestamp: baseTime + 2000, usage: 1002000, count: 0 },
      ];

      const result = detector.detectLeak();

      expect(result.isLeaking).toBe(false);
      expect(result.growthRate).toBeLessThan(1000);
    });

    it("should return no leak for insufficient snapshots", () => {
      const detector = new MemoryLeakDetector();

      // Only 2 snapshots
      const baseTime = Date.now();
      detector["snapshots"] = [
        { timestamp: baseTime, usage: 1000000, count: 0 },
        { timestamp: baseTime + 1000, usage: 2000000, count: 0 },
      ];

      const result = detector.detectLeak();

      expect(result.isLeaking).toBe(false);
      expect(result.growthRate).toBe(0);
      expect(result.confidence).toBe(0);
    });

    it("should calculate confidence based on variance", () => {
      const detector = new MemoryLeakDetector();

      // Simulate consistent growth (low variance = high confidence)
      const baseTime = Date.now();
      detector["snapshots"] = [
        { timestamp: baseTime, usage: 1000000, count: 0 },
        { timestamp: baseTime + 1000, usage: 2000000, count: 0 },
        { timestamp: baseTime + 2000, usage: 3000000, count: 0 },
      ];

      const result = detector.detectLeak();
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("should handle decreasing memory usage", () => {
      const detector = new MemoryLeakDetector();

      // Simulate memory cleanup
      const baseTime = Date.now();
      detector["snapshots"] = [
        { timestamp: baseTime, usage: 3000000, count: 0 },
        { timestamp: baseTime + 1000, usage: 2000000, count: 0 },
        { timestamp: baseTime + 2000, usage: 1000000, count: 0 },
      ];

      const result = detector.detectLeak();

      expect(result.isLeaking).toBe(false);
      expect(result.growthRate).toBeLessThan(0);
    });

    it("should clear snapshots", () => {
      const detector = new MemoryLeakDetector();

      detector.takeSnapshot();
      detector.takeSnapshot();

      expect(detector["snapshots"]).toHaveLength(2);

      detector.clear();
      expect(detector["snapshots"]).toHaveLength(0);
    });

    it("should handle environment without memory API", () => {
      // Temporarily remove memory API
      const originalMemory = (global as any).performance.memory;
      delete (global as any).performance.memory;

      const detector = new MemoryLeakDetector();
      detector.takeSnapshot();

      const result = detector.detectLeak();
      expect(result.isLeaking).toBe(false);

      // Restore memory API
      (global as any).performance.memory = originalMemory;
    });

    it("should handle edge case with zero time difference", () => {
      const detector = new MemoryLeakDetector();

      // Same timestamp for all snapshots
      const baseTime = Date.now();
      detector["snapshots"] = [
        { timestamp: baseTime, usage: 1000000, count: 0 },
        { timestamp: baseTime, usage: 2000000, count: 0 },
        { timestamp: baseTime, usage: 3000000, count: 0 },
      ];

      const result = detector.detectLeak();

      // Should handle division by zero gracefully
      expect(result).toBeDefined();
      expect(typeof result.isLeaking).toBe("boolean");
    });
  });
});
