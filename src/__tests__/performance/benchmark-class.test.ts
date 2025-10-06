import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PerformanceBenchmark } from "../../performance/benchmark";
import {
  mockPerformanceNow,
  originalPerformance,
  setupPerformanceMock,
  teardownPerformanceMock,
  resetPerformanceMock,
} from "../../performance/test-utils";

beforeEach(() => {
  setupPerformanceMock();
});

afterEach(() => {
  teardownPerformanceMock();
});

describe("PerformanceBenchmark Class", () => {
  beforeEach(() => {
    resetPerformanceMock();
  });

  it("should measure async operations", async () => {
    const benchmark = new PerformanceBenchmark();
    let callCount = 0;

    const asyncOperation = async () => {
      callCount++;
      return "result";
    };

    // Set up mock sequence: each iteration gets start=0, end=100
    mockPerformanceNow
      .mockReturnValueOnce(0) // timer start
      .mockReturnValueOnce(0) // iteration 1 start
      .mockReturnValueOnce(100) // iteration 1 end
      .mockReturnValueOnce(0) // iteration 2 start
      .mockReturnValueOnce(100) // iteration 2 end
      .mockReturnValueOnce(200); // timer end

    const metrics = await benchmark.run(asyncOperation, 2);

    expect(callCount).toBe(2);
    expect(metrics.iterations).toBe(2);
    expect(metrics.averageTime).toBe(100);
    expect(metrics.minTime).toBe(100);
    expect(metrics.maxTime).toBe(100);
    expect(metrics.standardDeviation).toBe(0);
  });

  it("should measure sync operations", async () => {
    const benchmark = new PerformanceBenchmark();
    let callCount = 0;

    const syncOperation = () => {
      callCount++;
      return "result";
    };

    // Set up mock sequence: iteration 1: 50ms, iteration 2: 150ms
    mockPerformanceNow
      .mockReturnValueOnce(0) // timer start
      .mockReturnValueOnce(0) // iteration 1 start
      .mockReturnValueOnce(50) // iteration 1 end
      .mockReturnValueOnce(0) // iteration 2 start
      .mockReturnValueOnce(150) // iteration 2 end
      .mockReturnValueOnce(200); // timer end

    const metrics = await benchmark.run(syncOperation, 2);

    expect(callCount).toBe(2);
    expect(metrics.iterations).toBe(2);
    expect(metrics.averageTime).toBe(100);
    expect(metrics.minTime).toBe(50);
    expect(metrics.maxTime).toBe(150);
  });

  it("should calculate standard deviation correctly", async () => {
    const benchmark = new PerformanceBenchmark();

    const operation = () => "result";

    // Mock times: [10, 20, 30] - average 20, variance 66.67, std dev ~8.16
    mockPerformanceNow
      .mockReturnValueOnce(0) // timer start
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(10) // iteration 1
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(20) // iteration 2
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(30) // iteration 3
      .mockReturnValueOnce(60); // timer end

    const metrics = await benchmark.run(operation, 3);

    expect(metrics.iterations).toBe(3);
    expect(metrics.averageTime).toBe(20);
    expect(metrics.minTime).toBe(10);
    expect(metrics.maxTime).toBe(30);
    expect(metrics.standardDeviation).toBeCloseTo(8.16, 1);
  });

  it("should handle performance budget warnings", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const benchmark = new PerformanceBenchmark();

    const slowOperation = () => "result";

    mockPerformanceNow
      .mockReturnValueOnce(0) // timer start
      .mockReturnValueOnce(0) // iteration start
      .mockReturnValueOnce(200) // iteration end - exceeds budget
      .mockReturnValueOnce(200); // timer end

    const budget = { maxDuration: 100 };
    await benchmark.run(slowOperation, 1, budget);

    expect(consoleSpy).toHaveBeenCalledWith("Performance budget exceeded: 200ms > 100ms");

    consoleSpy.mockRestore();
  });

  it("should handle operations that throw errors", async () => {
    const benchmark = new PerformanceBenchmark();

    const failingOperation = () => {
      throw new Error("Test error");
    };

    mockPerformanceNow
      .mockReturnValueOnce(0) // start
      .mockReturnValueOnce(100); // end

    await expect(benchmark.run(failingOperation, 1)).rejects.toThrow("Test error");
  });

  it("should measure memory usage", async () => {
    const benchmark = new PerformanceBenchmark();

    const operation = () => "result";

    mockPerformanceNow
      .mockReturnValueOnce(0) // start
      .mockReturnValueOnce(100); // end

    const metrics = await benchmark.run(operation, 1);

    expect(metrics.memoryBefore).toBe(1000000);
    expect(metrics.memoryAfter).toBe(1000000);
    expect(metrics.memoryDelta).toBe(0);
  });
});
