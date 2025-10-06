import { describe, it, expect } from "vitest";
import type {
  PerformanceMetrics,
  PerformanceBudget,
  PerformanceWarning,
  ThrottleOptions,
  DebounceOptions,
  FrameRateMetrics,
} from "../../types";

describe("Performance Types", () => {
  describe("PerformanceMetrics", () => {
    it("should allow creating valid PerformanceMetrics objects", () => {
      const metrics: PerformanceMetrics = {
        duration: 100,
        memoryBefore: 1024,
        memoryAfter: 2048,
        memoryDelta: 1024,
        timestamp: Date.now(),
        iterations: 1000,
        averageTime: 0.1,
        minTime: 0.05,
        maxTime: 0.15,
        standardDeviation: 0.02,
      };

      expect(metrics.duration).toBe(100);
      expect(metrics.memoryDelta).toBe(1024);
      expect(metrics.iterations).toBe(1000);
      expect(typeof metrics.timestamp).toBe("number");
    });

    it("should allow creating PerformanceMetrics with edge case values", () => {
      const metrics: PerformanceMetrics = {
        duration: 0,
        memoryBefore: 0,
        memoryAfter: 0,
        memoryDelta: 0,
        timestamp: 0,
        iterations: 0,
        averageTime: 0,
        minTime: 0,
        maxTime: 0,
        standardDeviation: 0,
      };

      expect(metrics.duration).toBe(0);
      expect(metrics.memoryDelta).toBe(0);
      expect(metrics.iterations).toBe(0);
    });
  });

  describe("PerformanceBudget", () => {
    it("should allow creating valid PerformanceBudget objects", () => {
      const budget: PerformanceBudget = {
        maxDuration: 100,
        maxMemoryUsage: 1024,
        maxIterations: 1000,
        warningThreshold: 0.8,
      };

      expect(budget.maxDuration).toBe(100);
      expect(budget.maxMemoryUsage).toBe(1024);
      expect(budget.maxIterations).toBe(1000);
      expect(budget.warningThreshold).toBe(0.8);
    });

    it("should allow creating PerformanceBudget with high values", () => {
      const budget: PerformanceBudget = {
        maxDuration: 10000,
        maxMemoryUsage: 1024 * 1024 * 1024, // 1GB
        maxIterations: 1000000,
        warningThreshold: 0.95,
      };

      expect(budget.maxDuration).toBe(10000);
      expect(budget.maxMemoryUsage).toBe(1024 * 1024 * 1024);
      expect(budget.maxIterations).toBe(1000000);
      expect(budget.warningThreshold).toBe(0.95);
    });
  });

  describe("PerformanceWarning", () => {
    it("should allow creating valid PerformanceWarning objects", () => {
      const warning: PerformanceWarning = {
        type: "memory",
        severity: "high",
        message: "Memory usage exceeded threshold",
        value: 1024,
        threshold: 512,
        timestamp: Date.now(),
      };

      expect(warning.type).toBe("memory");
      expect(warning.severity).toBe("high");
      expect(warning.message).toBe("Memory usage exceeded threshold");
      expect(warning.value).toBe(1024);
      expect(warning.threshold).toBe(512);
      expect(typeof warning.timestamp).toBe("number");
    });

    it("should allow all warning types", () => {
      const types: PerformanceWarning["type"][] = ["memory", "css", "dom", "rendering", "freeze"];
      const severities: PerformanceWarning["severity"][] = ["low", "medium", "high", "critical"];

      types.forEach(type => {
        severities.forEach(severity => {
          const warning: PerformanceWarning = {
            type,
            severity,
            message: `Test ${type} warning`,
            value: 100,
            threshold: 50,
            timestamp: Date.now(),
          };

          expect(warning.type).toBe(type);
          expect(warning.severity).toBe(severity);
        });
      });
    });
  });

  describe("ThrottleOptions", () => {
    it("should allow creating valid ThrottleOptions objects", () => {
      const options: ThrottleOptions = {
        leading: true,
        trailing: false,
        maxWait: 1000,
      };

      expect(options.leading).toBe(true);
      expect(options.trailing).toBe(false);
      expect(options.maxWait).toBe(1000);
    });

    it("should allow creating ThrottleOptions with all optional properties", () => {
      const options: ThrottleOptions = {
        leading: false,
        trailing: true,
        maxWait: 500,
      };

      expect(options.leading).toBe(false);
      expect(options.trailing).toBe(true);
      expect(options.maxWait).toBe(500);
    });

    it("should allow creating empty ThrottleOptions", () => {
      const options: ThrottleOptions = {};

      expect(options.leading).toBeUndefined();
      expect(options.trailing).toBeUndefined();
      expect(options.maxWait).toBeUndefined();
    });
  });

  describe("DebounceOptions", () => {
    it("should allow creating valid DebounceOptions objects", () => {
      const options: DebounceOptions = {
        leading: true,
        trailing: false,
        maxWait: 1000,
      };

      expect(options.leading).toBe(true);
      expect(options.trailing).toBe(false);
      expect(options.maxWait).toBe(1000);
    });

    it("should allow creating DebounceOptions with all optional properties", () => {
      const options: DebounceOptions = {
        leading: false,
        trailing: true,
        maxWait: 500,
      };

      expect(options.leading).toBe(false);
      expect(options.trailing).toBe(true);
      expect(options.maxWait).toBe(500);
    });

    it("should allow creating empty DebounceOptions", () => {
      const options: DebounceOptions = {};

      expect(options.leading).toBeUndefined();
      expect(options.trailing).toBeUndefined();
      expect(options.maxWait).toBeUndefined();
    });
  });

  describe("FrameRateMetrics", () => {
    it("should allow creating valid FrameRateMetrics objects", () => {
      const metrics: FrameRateMetrics = {
        fps: 60,
        frameTime: 16.67,
        droppedFrames: 2,
        averageFrameTime: 16.67,
        timestamp: Date.now(),
      };

      expect(metrics.fps).toBe(60);
      expect(metrics.frameTime).toBe(16.67);
      expect(metrics.droppedFrames).toBe(2);
      expect(metrics.averageFrameTime).toBe(16.67);
      expect(typeof metrics.timestamp).toBe("number");
    });

    it("should allow creating FrameRateMetrics with edge case values", () => {
      const metrics: FrameRateMetrics = {
        fps: 0,
        frameTime: 0,
        droppedFrames: 0,
        averageFrameTime: 0,
        timestamp: 0,
      };

      expect(metrics.fps).toBe(0);
      expect(metrics.frameTime).toBe(0);
      expect(metrics.droppedFrames).toBe(0);
      expect(metrics.averageFrameTime).toBe(0);
      expect(metrics.timestamp).toBe(0);
    });

    it("should allow creating FrameRateMetrics with high values", () => {
      const metrics: FrameRateMetrics = {
        fps: 120,
        frameTime: 8.33,
        droppedFrames: 100,
        averageFrameTime: 8.33,
        timestamp: Date.now(),
      };

      expect(metrics.fps).toBe(120);
      expect(metrics.frameTime).toBe(8.33);
      expect(metrics.droppedFrames).toBe(100);
      expect(metrics.averageFrameTime).toBe(8.33);
    });
  });

  describe("Type compatibility", () => {
    it("should allow using types in function parameters", () => {
      function processMetrics(metrics: PerformanceMetrics): number {
        return metrics.duration + metrics.memoryDelta;
      }

      function checkBudget(budget: PerformanceBudget, metrics: PerformanceMetrics): boolean {
        return metrics.duration <= budget.maxDuration;
      }

      const metrics: PerformanceMetrics = {
        duration: 50,
        memoryBefore: 0,
        memoryAfter: 100,
        memoryDelta: 100,
        timestamp: Date.now(),
        iterations: 100,
        averageTime: 0.5,
        minTime: 0.4,
        maxTime: 0.6,
        standardDeviation: 0.05,
      };

      const budget: PerformanceBudget = {
        maxDuration: 100,
        maxMemoryUsage: 1000,
        maxIterations: 1000,
        warningThreshold: 0.8,
      };

      expect(processMetrics(metrics)).toBe(150);
      expect(checkBudget(budget, metrics)).toBe(true);
    });

    it("should allow using types in function return values", () => {
      function createMetrics(): PerformanceMetrics {
        return {
          duration: 100,
          memoryBefore: 0,
          memoryAfter: 200,
          memoryDelta: 200,
          timestamp: Date.now(),
          iterations: 200,
          averageTime: 0.5,
          minTime: 0.4,
          maxTime: 0.6,
          standardDeviation: 0.05,
        };
      }

      function createBudget(): PerformanceBudget {
        return {
          maxDuration: 200,
          maxMemoryUsage: 2000,
          maxIterations: 2000,
          warningThreshold: 0.9,
        };
      }

      const metrics = createMetrics();
      const budget = createBudget();

      expect(metrics.duration).toBe(100);
      expect(budget.maxDuration).toBe(200);
    });
  });
});
