import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FrameRateMonitor } from "../../performance/framerate";

// Mock performance.now and requestAnimationFrame
const mockPerformanceNow = vi.fn();
const mockRequestAnimationFrame = vi.fn();
const mockCancelAnimationFrame = vi.fn();

// Mock global objects
Object.defineProperty(global, "performance", {
  value: {
    now: mockPerformanceNow,
  },
  writable: true,
});

Object.defineProperty(global, "requestAnimationFrame", {
  value: mockRequestAnimationFrame,
  writable: true,
});

Object.defineProperty(global, "cancelAnimationFrame", {
  value: mockCancelAnimationFrame,
  writable: true,
});

Object.defineProperty(global, "Date", {
  value: {
    now: vi.fn(() => 1234567890),
  },
  writable: true,
});

describe("FrameRateMonitor", () => {
  let monitor: FrameRateMonitor;

  beforeEach(() => {
    monitor = new FrameRateMonitor();
    vi.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
    // Reset the monitor's internal state
    monitor["frameCount"] = 0;
    monitor["frameTimes"] = [];
    monitor["droppedFrames"] = 0;
    monitor["isMonitoring"] = false;
    monitor["animationFrameId"] = null;
  });

  afterEach(() => {
    monitor.stop();
  });

  describe("start", () => {
    it("should start monitoring and request animation frame", () => {
      monitor.start();

      expect(mockRequestAnimationFrame).toHaveBeenCalled();
      expect(monitor["isMonitoring"]).toBe(true);
      // frameCount will be 1 because start() calls monitorFrame() which increments it
      expect(monitor["frameCount"]).toBe(1);
      expect(monitor["frameTimes"]).toHaveLength(1);
      expect(monitor["droppedFrames"]).toBe(0);
    });

    it("should not start monitoring if already monitoring", () => {
      monitor.start();
      const firstCallCount = mockRequestAnimationFrame.mock.calls.length;

      monitor.start();
      const secondCallCount = mockRequestAnimationFrame.mock.calls.length;

      expect(secondCallCount).toBe(firstCallCount);
    });

    it("should reset counters when starting", () => {
      // Simulate some previous state
      monitor["frameCount"] = 10;
      monitor["frameTimes"] = [16, 17, 18];
      monitor["droppedFrames"] = 5;

      monitor.start();

      // frameCount will be 1 because start() calls monitorFrame() which increments it
      expect(monitor["frameCount"]).toBe(1);
      expect(monitor["frameTimes"]).toHaveLength(1);
      expect(monitor["droppedFrames"]).toBe(0);
    });
  });

  describe("stop", () => {
    it("should stop monitoring and cancel animation frame", () => {
      monitor.start();
      const animationFrameId = 123;
      mockRequestAnimationFrame.mockReturnValue(animationFrameId);
      monitor["animationFrameId"] = animationFrameId;

      monitor.stop();

      expect(monitor["isMonitoring"]).toBe(false);
      expect(mockCancelAnimationFrame).toHaveBeenCalledWith(animationFrameId);
      expect(monitor["animationFrameId"]).toBeNull();
    });

    it("should handle stop when not monitoring", () => {
      monitor.stop();

      expect(monitor["isMonitoring"]).toBe(false);
      expect(mockCancelAnimationFrame).not.toHaveBeenCalled();
    });

    it("should handle stop when animationFrameId is null", () => {
      monitor.start();
      monitor["animationFrameId"] = null;

      monitor.stop();

      expect(monitor["isMonitoring"]).toBe(false);
      expect(mockCancelAnimationFrame).not.toHaveBeenCalled();
    });
  });

  describe("monitorFrame", () => {
    it("should track frame times and increment frame count", () => {
      monitor.start();
      monitor["isMonitoring"] = true;

      // Simulate first frame
      mockPerformanceNow.mockReturnValue(16.67);
      const callback = mockRequestAnimationFrame.mock.calls[0][0];
      callback();

      // frameCount will be 2 because start() already called monitorFrame() once
      expect(monitor["frameCount"]).toBe(2);
      expect(monitor["frameTimes"]).toHaveLength(2);
      expect(monitor["frameTimes"][1]).toBeCloseTo(16.67, 2);
    });

    it("should detect dropped frames", () => {
      monitor.start();
      monitor["isMonitoring"] = true;
      monitor["lastTime"] = 0;

      // Simulate a dropped frame (50ms frame time)
      mockPerformanceNow.mockReturnValue(50);
      const callback = mockRequestAnimationFrame.mock.calls[0][0];
      callback();

      expect(monitor["droppedFrames"]).toBe(1); // 50ms / 16.67ms - 1 = 1 dropped frame (rounded down)
    });

    it("should limit frame times array to 60 entries", () => {
      monitor.start();
      monitor["isMonitoring"] = true;
      monitor["frameTimes"] = new Array(60).fill(16.67);

      mockPerformanceNow.mockReturnValue(1000);
      const callback = mockRequestAnimationFrame.mock.calls[0][0];
      callback();

      expect(monitor["frameTimes"]).toHaveLength(60);
      expect(monitor["frameTimes"][0]).toBe(16.67); // First entry should be shifted out
    });

    it("should not monitor when not monitoring", () => {
      monitor["isMonitoring"] = false;
      monitor["frameCount"] = 5;

      // Call monitorFrame directly
      monitor["monitorFrame"]();

      expect(monitor["frameCount"]).toBe(5); // Should not increment
      expect(mockRequestAnimationFrame).not.toHaveBeenCalled();
    });

    it("should request next animation frame", () => {
      monitor.start();
      monitor["isMonitoring"] = true;

      const callback = mockRequestAnimationFrame.mock.calls[0][0];
      callback();

      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(2); // Initial + callback
    });
  });

  describe("getMetrics", () => {
    it("should return metrics with zero values when no frames recorded", () => {
      const metrics = monitor.getMetrics();

      expect(metrics.fps).toBe(0);
      expect(metrics.frameTime).toBe(0);
      expect(metrics.droppedFrames).toBe(0);
      expect(metrics.averageFrameTime).toBe(0);
      expect(metrics.timestamp).toBe(1234567890);
    });

    it("should calculate correct metrics from frame times", () => {
      monitor["frameTimes"] = [16.67, 16.67, 16.67]; // 3 frames at 60fps
      monitor["droppedFrames"] = 2;

      const metrics = monitor.getMetrics();

      expect(metrics.fps).toBeCloseTo(60, 1);
      expect(metrics.frameTime).toBeCloseTo(16.67, 2);
      expect(metrics.droppedFrames).toBe(2);
      expect(metrics.averageFrameTime).toBeCloseTo(16.67, 2);
      expect(metrics.timestamp).toBe(1234567890);
    });

    it("should handle mixed frame times", () => {
      monitor["frameTimes"] = [16.67, 33.33, 16.67]; // Mixed frame times
      monitor["droppedFrames"] = 1;

      const metrics = monitor.getMetrics();

      expect(metrics.fps).toBeCloseTo(45, 1); // Average of 22.22ms = ~45fps
      expect(metrics.frameTime).toBeCloseTo(22.22, 2);
      expect(metrics.droppedFrames).toBe(1);
      expect(metrics.averageFrameTime).toBeCloseTo(22.22, 2);
    });

    it("should handle single frame time", () => {
      monitor["frameTimes"] = [16.67];
      monitor["droppedFrames"] = 0;

      const metrics = monitor.getMetrics();

      expect(metrics.fps).toBeCloseTo(60, 1);
      expect(metrics.frameTime).toBeCloseTo(16.67, 2);
      expect(metrics.droppedFrames).toBe(0);
      expect(metrics.averageFrameTime).toBeCloseTo(16.67, 2);
    });

    it("should handle very slow frame times", () => {
      monitor["frameTimes"] = [100, 100, 100]; // Very slow frames
      monitor["droppedFrames"] = 0;

      const metrics = monitor.getMetrics();

      expect(metrics.fps).toBeCloseTo(10, 1); // 100ms = 10fps
      expect(metrics.frameTime).toBe(100);
      expect(metrics.droppedFrames).toBe(0);
      expect(metrics.averageFrameTime).toBe(100);
    });
  });

  describe("integration", () => {
    it("should work end-to-end with mocked animation frames", () => {
      let frameCallback: (() => void) | null = null;
      mockRequestAnimationFrame.mockImplementation(callback => {
        frameCallback = callback;
        return 1;
      });

      monitor.start();

      // Simulate first frame
      mockPerformanceNow.mockReturnValue(16.67);
      frameCallback!();

      // Simulate second frame
      mockPerformanceNow.mockReturnValue(33.34);
      frameCallback!();

      const metrics = monitor.getMetrics();

      expect(metrics.fps).toBeCloseTo(90, 1); // Two frames at 16.67ms each = ~90fps average
      expect(metrics.frameTime).toBeCloseTo(11.11, 2); // Average of 16.67 and 16.67 = 16.67, but with different timing
      expect(metrics.droppedFrames).toBe(0);
      expect(metrics.averageFrameTime).toBeCloseTo(11.11, 2);

      monitor.stop();
      expect(mockCancelAnimationFrame).toHaveBeenCalledWith(1);
    });
  });
});
