/**
 * @file Extended tests for throttle utilities
 */
// @vitest-environment happy-dom

import { describe, it, expect, vi } from "vitest";
import { throttle, debounce } from "../../utils/performance/throttle";

describe("Throttle Extended Coverage", () => {
  // Note: These tests use real timers because throttle/debounce functions
  // are designed to work with real setTimeout/clearTimeout

  describe("throttle - Advanced Scenarios", () => {
    it("should handle leading edge execution with immediate call", () => {
      const mockFn = vi.fn().mockReturnValue("result");
      const throttled = throttle(mockFn, 100, {
        leading: true,
        trailing: false,
      });

      const result = throttled("arg1");

      expect(result).toBe("result");
      expect(mockFn).toHaveBeenCalledWith("arg1");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should handle trailing edge execution only", async () => {
      const mockFn = vi.fn().mockReturnValue("result");
      const throttled = throttle(mockFn, 100, {
        leading: false,
        trailing: true,
      });

      const result1 = throttled("arg1");
      const result2 = throttled("arg2");

      expect(result1).toBeUndefined();
      expect(result2).toBeUndefined();
      expect(mockFn).not.toHaveBeenCalled();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockFn).toHaveBeenCalledWith("arg2");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should handle maxWait option", async () => {
      const mockFn = vi.fn().mockReturnValue("result");
      const throttled = throttle(mockFn, 100, {
        leading: true,
        trailing: true,
        maxWait: 50,
      });

      throttled("arg1");
      await new Promise(resolve => setTimeout(resolve, 30));
      throttled("arg2");

      expect(mockFn).toHaveBeenCalledWith("arg1");
      expect(mockFn).toHaveBeenCalledTimes(1);

      await new Promise(resolve => setTimeout(resolve, 20)); // Total 50ms, should trigger maxWait

      expect(mockFn).toHaveBeenCalledWith("arg2");
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it("should handle cancel method", async () => {
      const mockFn = vi.fn().mockReturnValue("result");
      const throttled = throttle(mockFn, 100, {
        leading: false,
        trailing: true,
      });

      throttled("arg1");
      throttled.cancel();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockFn).not.toHaveBeenCalled();
    });

    it("should handle flush method with pending calls", () => {
      const mockFn = vi.fn().mockReturnValue("result");
      const throttled = throttle(mockFn, 100, {
        leading: false,
        trailing: true,
      });

      throttled("arg1");
      const result = throttled.flush();

      expect(result).toBe("result");
      expect(mockFn).toHaveBeenCalledWith("arg1");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should handle flush method without pending calls", () => {
      const mockFn = vi.fn().mockReturnValue("result");
      const throttled = throttle(mockFn, 100, {
        leading: true,
        trailing: true,
      });

      const result1 = throttled("arg1");
      const result2 = throttled.flush();

      expect(result1).toBe("result");
      expect(result2).toBe("result");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple rapid calls with leading and trailing", async () => {
      const mockFn = vi.fn().mockReturnValue("result");
      const throttled = throttle(mockFn, 100, {
        leading: true,
        trailing: true,
      });

      const result1 = throttled("arg1");
      const result2 = throttled("arg2");
      const result3 = throttled("arg3");

      expect(result1).toBe("result");
      expect(result2).toBe("result");
      expect(result3).toBe("result");
      expect(mockFn).toHaveBeenCalledWith("arg1");
      expect(mockFn).toHaveBeenCalledTimes(1);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockFn).toHaveBeenCalledWith("arg3");
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it("should handle edge case with zero wait time", () => {
      const mockFn = vi.fn().mockReturnValue("result");
      const throttled = throttle(mockFn, 0, { leading: true, trailing: true });

      const result1 = throttled("arg1");
      const result2 = throttled("arg2");

      expect(result1).toBe("result");
      expect(result2).toBe("result");
      expect(mockFn).toHaveBeenCalledWith("arg1");
      // With zero wait time, both leading and trailing can execute
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("debounce - Advanced Scenarios", () => {
    it("should handle leading edge execution with immediate call", () => {
      const mockFn = vi.fn().mockReturnValue("result");
      const debounced = debounce(mockFn, 100, {
        leading: true,
        trailing: false,
      });

      const result = debounced("arg1");

      expect(result).toBe("result");
      expect(mockFn).toHaveBeenCalledWith("arg1");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should handle trailing edge execution only", async () => {
      const mockFn = vi.fn().mockReturnValue("result");
      const debounced = debounce(mockFn, 100, {
        leading: false,
        trailing: true,
      });

      const result1 = debounced("arg1");
      const result2 = debounced("arg2");

      expect(result1).toBeUndefined();
      expect(result2).toBeUndefined();
      expect(mockFn).not.toHaveBeenCalled();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockFn).toHaveBeenCalledWith("arg2");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should handle maxWait option", async () => {
      const mockFn = vi.fn().mockReturnValue("result");
      const debounced = debounce(mockFn, 100, {
        leading: true,
        trailing: true,
        maxWait: 50,
      });

      debounced("arg1");
      await new Promise(resolve => setTimeout(resolve, 30));
      debounced("arg2");

      expect(mockFn).toHaveBeenCalledWith("arg1");
      expect(mockFn).toHaveBeenCalledTimes(1);

      await new Promise(resolve => setTimeout(resolve, 20)); // Total 50ms, should trigger maxWait

      expect(mockFn).toHaveBeenCalledWith("arg2");
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it("should handle cancel method", async () => {
      const mockFn = vi.fn().mockReturnValue("result");
      const debounced = debounce(mockFn, 100, {
        leading: false,
        trailing: true,
      });

      debounced("arg1");
      debounced.cancel();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockFn).not.toHaveBeenCalled();
    });

    it("should handle flush method with pending calls", () => {
      const mockFn = vi.fn().mockReturnValue("result");
      const debounced = debounce(mockFn, 100, {
        leading: false,
        trailing: true,
      });

      debounced("arg1");
      const result = debounced.flush();

      expect(result).toBe("result");
      expect(mockFn).toHaveBeenCalledWith("arg1");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should handle flush method without pending calls", () => {
      const mockFn = vi.fn().mockReturnValue("result");
      const debounced = debounce(mockFn, 100, {
        leading: true,
        trailing: true,
      });

      const result1 = debounced("arg1");
      const result2 = debounced.flush();

      expect(result1).toBe("result");
      expect(result2).toBe("result");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple rapid calls with leading and trailing", async () => {
      const mockFn = vi.fn().mockReturnValue("result");
      const debounced = debounce(mockFn, 100, {
        leading: true,
        trailing: true,
      });

      const result1 = debounced("arg1");
      const result2 = debounced("arg2");
      const result3 = debounced("arg3");

      expect(result1).toBe("result");
      expect(result2).toBe("result");
      expect(result3).toBe("result");
      expect(mockFn).toHaveBeenCalledWith("arg1");
      expect(mockFn).toHaveBeenCalledTimes(1);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockFn).toHaveBeenCalledWith("arg3");
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it("should handle edge case with zero wait time", () => {
      const mockFn = vi.fn().mockReturnValue("result");
      const debounced = debounce(mockFn, 0, { leading: true, trailing: true });

      const result1 = debounced("arg1");
      const result2 = debounced("arg2");

      expect(result1).toBe("result");
      expect(result2).toBe("result");
      expect(mockFn).toHaveBeenCalledWith("arg1");
      // With zero wait time, both leading and trailing can execute
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it("should handle complex timing scenarios", async () => {
      const mockFn = vi.fn().mockReturnValue("result");
      const debounced = debounce(mockFn, 100, {
        leading: true,
        trailing: true,
        maxWait: 150,
      });

      // First call - should execute immediately (leading)
      const result1 = debounced("arg1");
      expect(result1).toBe("result");
      expect(mockFn).toHaveBeenCalledWith("arg1");
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Rapid calls within wait period
      await new Promise(resolve => setTimeout(resolve, 50));
      debounced("arg2");
      await new Promise(resolve => setTimeout(resolve, 30));
      debounced("arg3");

      // Should not execute yet (leading edge may have triggered)
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Advance to trigger maxWait
      await new Promise(resolve => setTimeout(resolve, 70)); // Total 150ms
      expect(mockFn).toHaveBeenCalledWith("arg3");
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle function that throws", () => {
      const mockFn = vi.fn().mockImplementation(() => {
        throw new Error("Test error");
      });
      const throttled = throttle(mockFn, 100, { leading: true });

      expect(() => throttled("arg1")).toThrow("Test error");
    });

    it("should handle function that returns undefined", () => {
      const mockFn = vi.fn().mockReturnValue(undefined);
      const throttled = throttle(mockFn, 100, { leading: true });

      const result = throttled("arg1");
      expect(result).toBeUndefined();
      expect(mockFn).toHaveBeenCalledWith("arg1");
    });

    it("should handle function that returns null", () => {
      const mockFn = vi.fn().mockReturnValue(null);
      const throttled = throttle(mockFn, 100, { leading: true });

      const result = throttled("arg1");
      expect(result).toBeNull();
      expect(mockFn).toHaveBeenCalledWith("arg1");
    });

    it("should handle function with multiple arguments", () => {
      const mockFn = vi.fn().mockReturnValue("result");
      const throttled = throttle(mockFn, 100, { leading: true });

      const result = throttled("arg1", "arg2", "arg3");
      expect(result).toBe("result");
      expect(mockFn).toHaveBeenCalledWith("arg1", "arg2", "arg3");
    });

    it("should handle function with no arguments", () => {
      const mockFn = vi.fn().mockReturnValue("result");
      const throttled = throttle(mockFn, 100, { leading: true });

      const result = throttled();
      expect(result).toBe("result");
      expect(mockFn).toHaveBeenCalledWith();
    });
  });
});
