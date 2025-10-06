import { describe, expect, it } from "vitest";
import type {
  PerformanceMetrics,
  PerformanceBudget,
  PerformanceWarning,
  ThrottleOptions,
  DebounceOptions,
  FrameRateMetrics,
} from "../../performance/types";

describe("Performance Types", () => {
  describe("PerformanceMetrics interface", () => {
    it("should create performance metrics", () => {
      const metrics: PerformanceMetrics = {
        duration: 100.5,
        memoryBefore: 1024,
        memoryAfter: 2048,
        memoryDelta: 1024,
        timestamp: Date.now(),
        iterations: 1000,
        averageTime: 0.1,
        minTime: 0.05,
        maxTime: 0.2,
        standardDeviation: 0.02,
      };

      expect(metrics.duration).toBe(100.5);
      expect(metrics.memoryBefore).toBe(1024);
      expect(metrics.memoryAfter).toBe(2048);
      expect(metrics.memoryDelta).toBe(1024);
      expect(typeof metrics.timestamp).toBe("number");
      expect(metrics.iterations).toBe(1000);
      expect(metrics.averageTime).toBe(0.1);
      expect(metrics.minTime).toBe(0.05);
      expect(metrics.maxTime).toBe(0.2);
      expect(metrics.standardDeviation).toBe(0.02);
    });

    it("should handle zero values", () => {
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
      expect(metrics.memoryBefore).toBe(0);
      expect(metrics.memoryAfter).toBe(0);
      expect(metrics.memoryDelta).toBe(0);
      expect(metrics.timestamp).toBe(0);
      expect(metrics.iterations).toBe(0);
      expect(metrics.averageTime).toBe(0);
      expect(metrics.minTime).toBe(0);
      expect(metrics.maxTime).toBe(0);
      expect(metrics.standardDeviation).toBe(0);
    });

    it("should handle negative memory delta", () => {
      const metrics: PerformanceMetrics = {
        duration: 50,
        memoryBefore: 2048,
        memoryAfter: 1024,
        memoryDelta: -1024,
        timestamp: Date.now(),
        iterations: 500,
        averageTime: 0.1,
        minTime: 0.05,
        maxTime: 0.15,
        standardDeviation: 0.01,
      };

      expect(metrics.memoryDelta).toBe(-1024);
    });
  });

  describe("PerformanceBudget interface", () => {
    it("should create a performance budget", () => {
      const budget: PerformanceBudget = {
        maxDuration: 16.67, // 60fps
        maxMemoryUsage: 50 * 1024 * 1024, // 50MB
        maxIterations: 10000,
        warningThreshold: 0.8,
      };

      expect(budget.maxDuration).toBe(16.67);
      expect(budget.maxMemoryUsage).toBe(50 * 1024 * 1024);
      expect(budget.maxIterations).toBe(10000);
      expect(budget.warningThreshold).toBe(0.8);
    });

    it("should handle strict budgets", () => {
      const budget: PerformanceBudget = {
        maxDuration: 8.33, // 120fps
        maxMemoryUsage: 10 * 1024 * 1024, // 10MB
        maxIterations: 1000,
        warningThreshold: 0.9,
      };

      expect(budget.maxDuration).toBe(8.33);
      expect(budget.maxMemoryUsage).toBe(10 * 1024 * 1024);
      expect(budget.maxIterations).toBe(1000);
      expect(budget.warningThreshold).toBe(0.9);
    });

    it("should handle loose budgets", () => {
      const budget: PerformanceBudget = {
        maxDuration: 33.33, // 30fps
        maxMemoryUsage: 100 * 1024 * 1024, // 100MB
        maxIterations: 100000,
        warningThreshold: 0.5,
      };

      expect(budget.maxDuration).toBe(33.33);
      expect(budget.maxMemoryUsage).toBe(100 * 1024 * 1024);
      expect(budget.maxIterations).toBe(100000);
      expect(budget.warningThreshold).toBe(0.5);
    });
  });

  describe("PerformanceWarning interface", () => {
    it("should create a memory warning", () => {
      const warning: PerformanceWarning = {
        type: "memory",
        severity: "high",
        message: "Memory usage exceeded threshold",
        value: 60 * 1024 * 1024,
        threshold: 50 * 1024 * 1024,
        timestamp: Date.now(),
      };

      expect(warning.type).toBe("memory");
      expect(warning.severity).toBe("high");
      expect(warning.message).toBe("Memory usage exceeded threshold");
      expect(warning.value).toBe(60 * 1024 * 1024);
      expect(warning.threshold).toBe(50 * 1024 * 1024);
      expect(typeof warning.timestamp).toBe("number");
    });

    it("should create a CSS warning", () => {
      const warning: PerformanceWarning = {
        type: "css",
        severity: "medium",
        message: "CSS processing time exceeded",
        value: 20,
        threshold: 16.67,
        timestamp: Date.now(),
      };

      expect(warning.type).toBe("css");
      expect(warning.severity).toBe("medium");
      expect(warning.message).toBe("CSS processing time exceeded");
      expect(warning.value).toBe(20);
      expect(warning.threshold).toBe(16.67);
    });

    it("should create a DOM warning", () => {
      const warning: PerformanceWarning = {
        type: "dom",
        severity: "low",
        message: "DOM manipulation slow",
        value: 10,
        threshold: 8,
        timestamp: Date.now(),
      };

      expect(warning.type).toBe("dom");
      expect(warning.severity).toBe("low");
      expect(warning.message).toBe("DOM manipulation slow");
      expect(warning.value).toBe(10);
      expect(warning.threshold).toBe(8);
    });

    it("should create a rendering warning", () => {
      const warning: PerformanceWarning = {
        type: "rendering",
        severity: "critical",
        message: "Rendering performance critical",
        value: 50,
        threshold: 16.67,
        timestamp: Date.now(),
      };

      expect(warning.type).toBe("rendering");
      expect(warning.severity).toBe("critical");
      expect(warning.message).toBe("Rendering performance critical");
      expect(warning.value).toBe(50);
      expect(warning.threshold).toBe(16.67);
    });

    it("should create a freeze warning", () => {
      const warning: PerformanceWarning = {
        type: "freeze",
        severity: "critical",
        message: "Main thread frozen",
        value: 100,
        threshold: 50,
        timestamp: Date.now(),
      };

      expect(warning.type).toBe("freeze");
      expect(warning.severity).toBe("critical");
      expect(warning.message).toBe("Main thread frozen");
      expect(warning.value).toBe(100);
      expect(warning.threshold).toBe(50);
    });
  });

  describe("ThrottleOptions interface", () => {
    it("should create throttle options with all properties", () => {
      const options: ThrottleOptions = {
        leading: true,
        trailing: false,
        maxWait: 1000,
      };

      expect(options.leading).toBe(true);
      expect(options.trailing).toBe(false);
      expect(options.maxWait).toBe(1000);
    });

    it("should handle minimal throttle options", () => {
      const options: ThrottleOptions = {};

      expect(options.leading).toBeUndefined();
      expect(options.trailing).toBeUndefined();
      expect(options.maxWait).toBeUndefined();
    });

    it("should handle partial throttle options", () => {
      const options: ThrottleOptions = {
        leading: false,
        maxWait: 500,
      };

      expect(options.leading).toBe(false);
      expect(options.trailing).toBeUndefined();
      expect(options.maxWait).toBe(500);
    });
  });

  describe("DebounceOptions interface", () => {
    it("should create debounce options with all properties", () => {
      const options: DebounceOptions = {
        leading: false,
        trailing: true,
        maxWait: 2000,
      };

      expect(options.leading).toBe(false);
      expect(options.trailing).toBe(true);
      expect(options.maxWait).toBe(2000);
    });

    it("should handle minimal debounce options", () => {
      const options: DebounceOptions = {};

      expect(options.leading).toBeUndefined();
      expect(options.trailing).toBeUndefined();
      expect(options.maxWait).toBeUndefined();
    });

    it("should handle partial debounce options", () => {
      const options: DebounceOptions = {
        trailing: false,
      };

      expect(options.leading).toBeUndefined();
      expect(options.trailing).toBe(false);
      expect(options.maxWait).toBeUndefined();
    });
  });

  describe("FrameRateMetrics interface", () => {
    it("should create frame rate metrics", () => {
      const metrics: FrameRateMetrics = {
        fps: 60,
        frameTime: 16.67,
        droppedFrames: 2,
        averageFrameTime: 16.5,
        timestamp: Date.now(),
      };

      expect(metrics.fps).toBe(60);
      expect(metrics.frameTime).toBe(16.67);
      expect(metrics.droppedFrames).toBe(2);
      expect(metrics.averageFrameTime).toBe(16.5);
      expect(typeof metrics.timestamp).toBe("number");
    });

    it("should handle low frame rate", () => {
      const metrics: FrameRateMetrics = {
        fps: 30,
        frameTime: 33.33,
        droppedFrames: 10,
        averageFrameTime: 35,
        timestamp: Date.now(),
      };

      expect(metrics.fps).toBe(30);
      expect(metrics.frameTime).toBe(33.33);
      expect(metrics.droppedFrames).toBe(10);
      expect(metrics.averageFrameTime).toBe(35);
    });

    it("should handle high frame rate", () => {
      const metrics: FrameRateMetrics = {
        fps: 120,
        frameTime: 8.33,
        droppedFrames: 0,
        averageFrameTime: 8.2,
        timestamp: Date.now(),
      };

      expect(metrics.fps).toBe(120);
      expect(metrics.frameTime).toBe(8.33);
      expect(metrics.droppedFrames).toBe(0);
      expect(metrics.averageFrameTime).toBe(8.2);
    });

    it("should handle zero dropped frames", () => {
      const metrics: FrameRateMetrics = {
        fps: 60,
        frameTime: 16.67,
        droppedFrames: 0,
        averageFrameTime: 16.67,
        timestamp: Date.now(),
      };

      expect(metrics.droppedFrames).toBe(0);
    });
  });

  describe("Type compatibility", () => {
    it("should allow PerformanceMetrics to work with PerformanceBudget", () => {
      const budget: PerformanceBudget = {
        maxDuration: 16.67,
        maxMemoryUsage: 50 * 1024 * 1024,
        maxIterations: 10000,
        warningThreshold: 0.8,
      };

      const metrics: PerformanceMetrics = {
        duration: 15,
        memoryBefore: 1024,
        memoryAfter: 2048,
        memoryDelta: 1024,
        timestamp: Date.now(),
        iterations: 5000,
        averageTime: 0.003,
        minTime: 0.002,
        maxTime: 0.005,
        standardDeviation: 0.001,
      };

      expect(metrics.duration).toBeLessThan(budget.maxDuration);
      expect(metrics.memoryAfter).toBeLessThan(budget.maxMemoryUsage);
      expect(metrics.iterations).toBeLessThan(budget.maxIterations);
    });

    it("should allow PerformanceWarning to reference PerformanceBudget thresholds", () => {
      const budget: PerformanceBudget = {
        maxDuration: 16.67,
        maxMemoryUsage: 50 * 1024 * 1024,
        maxIterations: 10000,
        warningThreshold: 0.8,
      };

      const warning: PerformanceWarning = {
        type: "memory",
        severity: "high",
        message: "Memory usage exceeded",
        value: 60 * 1024 * 1024,
        threshold: budget.maxMemoryUsage,
        timestamp: Date.now(),
      };

      expect(warning.value).toBeGreaterThan(warning.threshold);
      expect(warning.threshold).toBe(budget.maxMemoryUsage);
    });
  });
});
