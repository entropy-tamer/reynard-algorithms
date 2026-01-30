import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { measureAsync } from "../../utils/performance/benchmark";
import {
  mockPerformanceNow,
  setupPerformanceMock,
  teardownPerformanceMock,
  resetPerformanceMock,
} from "../../utils/performance/test-utils";

beforeEach(() => {
  setupPerformanceMock();
});

afterEach(() => {
  teardownPerformanceMock();
});

describe("measureAsync Function", () => {
  beforeEach(() => {
    resetPerformanceMock();
  });

  it("should measure async operation and return result with metrics", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const asyncOperation = async () => {
      return "async result";
    };

    mockPerformanceNow
      .mockReturnValueOnce(0) // start
      .mockReturnValueOnce(100); // end

    const result = await measureAsync(asyncOperation, "test operation");

    expect(result.result).toBe("async result");
    expect(result.metrics).toBeDefined();
    expect(result.metrics.iterations).toBe(1);
    expect(consoleSpy).toHaveBeenCalledWith("Performance measurement for test operation:", expect.any(Object));

    consoleSpy.mockRestore();
  });

  it("should work without operation name", async () => {
    const asyncOperation = async () => {
      return "async result";
    };

    mockPerformanceNow
      .mockReturnValueOnce(0) // start
      .mockReturnValueOnce(100); // end

    const result = await measureAsync(asyncOperation);

    expect(result.result).toBe("async result");
    expect(result.metrics).toBeDefined();
  });

  it("should handle async operations that throw", async () => {
    const failingAsyncOperation = async () => {
      throw new Error("Async error");
    };

    mockPerformanceNow
      .mockReturnValueOnce(0) // start
      .mockReturnValueOnce(100); // end

    await expect(measureAsync(failingAsyncOperation)).rejects.toThrow("Async error");
  });
});
