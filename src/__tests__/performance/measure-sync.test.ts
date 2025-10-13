import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { measureSync } from "../../performance/benchmark";
import {
  mockPerformanceNow,
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

describe("measureSync Function", () => {
  beforeEach(() => {
    resetPerformanceMock();
  });

  it("should measure sync operation and return result with metrics", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const syncOperation = () => {
      return "sync result";
    };

    mockPerformanceNow
      .mockReturnValueOnce(0) // start
      .mockReturnValueOnce(50); // end

    const result = await measureSync(syncOperation, "test operation", 1);

    expect(result.result).toBe("sync result");
    expect(result.metrics).toBeDefined();
    expect(result.metrics.iterations).toBe(1);
    expect(consoleSpy).toHaveBeenCalledWith("Performance measurement for test operation:", expect.any(Object));

    consoleSpy.mockRestore();
  });

  it("should work with multiple iterations", async () => {
    const syncOperation = () => {
      return "sync result";
    };

    mockPerformanceNow
      .mockReturnValueOnce(0) // start
      .mockReturnValueOnce(50) // end
      .mockReturnValueOnce(0) // start
      .mockReturnValueOnce(100); // end

    const result = await measureSync(syncOperation, undefined, 2);

    expect(result.result).toBe("sync result");
    expect(result.metrics.iterations).toBe(2);
  });

  it("should work without operation name", async () => {
    const syncOperation = () => {
      return "sync result";
    };

    mockPerformanceNow
      .mockReturnValueOnce(0) // start
      .mockReturnValueOnce(50); // end

    const result = await measureSync(syncOperation);

    expect(result.result).toBe("sync result");
    expect(result.metrics).toBeDefined();
  });

  it("should handle sync operations that throw", async () => {
    const failingSyncOperation = () => {
      throw new Error("Sync error");
    };

    mockPerformanceNow
      .mockReturnValueOnce(0) // start
      .mockReturnValueOnce(50); // end

    await expect(measureSync(failingSyncOperation)).rejects.toThrow("Sync error");
  });
});
