import { describe, it, expect, beforeEach } from "vitest";
import { MemoryMonitor } from "../../performance/memory";

describe("MemoryMonitor", () => {
  let monitor: MemoryMonitor;

  beforeEach(() => {
    monitor = new MemoryMonitor();
  });

  describe("measure", () => {
    it("should measure memory usage", () => {
      const usage = monitor.measure();

      expect(typeof usage).toBe("number");
      expect(usage).toBeGreaterThanOrEqual(0);
    });

    it("should track memory usage over time", () => {
      const usage1 = monitor.measure();

      // Create some objects to potentially increase memory usage
      const objects = [];
      for (let i = 0; i < 1000; i++) {
        objects.push({ data: new Array(100).fill(i) });
      }

      const usage2 = monitor.measure();

      expect(usage2).toBeGreaterThanOrEqual(usage1);
    });
  });

  describe("getDelta", () => {
    it("should return 0 for single measurement", () => {
      monitor.measure();
      const delta = monitor.getDelta();
      expect(delta).toBe(0);
    });

    it("should calculate delta between measurements", () => {
      monitor.measure();
      monitor.measure();
      const delta = monitor.getDelta();
      expect(typeof delta).toBe("number");
    });
  });

  describe("getAverageUsage", () => {
    it("should return 0 for no measurements", () => {
      const average = monitor.getAverageUsage();
      expect(average).toBe(0);
    });

    it("should calculate average usage", () => {
      monitor.measure();
      monitor.measure();
      const average = monitor.getAverageUsage();
      expect(typeof average).toBe("number");
      expect(average).toBeGreaterThanOrEqual(0);
    });
  });

  describe("clear", () => {
    it("should clear measurements", () => {
      monitor.measure();
      monitor.measure();

      monitor.clear();
      const average = monitor.getAverageUsage();
      expect(average).toBe(0);
    });
  });
});

// Note: MemoryLeakDetector methods are not fully implemented in the current version
