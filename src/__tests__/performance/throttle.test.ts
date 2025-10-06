import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { throttle, debounce } from "../../performance/throttle";

describe("throttle", () => {
  beforeEach(() => {
    // Use real timers instead of fake timers for now
    // vi.useFakeTimers();
  });

  afterEach(() => {
    // vi.useRealTimers();
  });

  it("should throttle function calls", async () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100);

    // Call multiple times rapidly
    throttledFn();
    throttledFn();
    throttledFn();

    // Only first call should execute immediately
    expect(mockFn).toHaveBeenCalledTimes(1);

    // Wait for throttle delay
    await new Promise(resolve => setTimeout(resolve, 110));
    expect(mockFn).toHaveBeenCalledTimes(2);

    // Call again after throttle period
    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it("should pass arguments to throttled function", () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100);

    throttledFn("arg1", "arg2");
    expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
  });

  it("should maintain context (this)", () => {
    const obj = {
      value: 42,
      method: function () {
        return this.value;
      },
    };

    const throttledMethod = throttle(obj.method.bind(obj), 100);
    const result = throttledMethod();
    expect(result).toBe(42);
  });

  it("should handle immediate execution option", async () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100, {
      leading: true,
      trailing: false,
    });

    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    throttledFn();
    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    // Wait for throttle delay
    await new Promise(resolve => setTimeout(resolve, 110));
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should handle trailing execution option", async () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100, {
      leading: false,
      trailing: true,
    });

    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(0);

    throttledFn();
    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(0);

    // Wait for throttle delay
    await new Promise(resolve => setTimeout(resolve, 110));
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});

describe("debounce", () => {
  beforeEach(() => {
    // Use real timers instead of fake timers for now
    // vi.useFakeTimers();
  });

  afterEach(() => {
    // vi.useRealTimers();
  });

  it("should debounce function calls", async () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    // Call multiple times rapidly
    debouncedFn();
    debouncedFn();
    debouncedFn();

    // Function should not be called yet
    expect(mockFn).toHaveBeenCalledTimes(0);

    // Wait for debounce delay
    await new Promise(resolve => setTimeout(resolve, 110));
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should pass arguments to debounced function", async () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn("arg1", "arg2");
    await new Promise(resolve => setTimeout(resolve, 110));
    expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
  });

  it("should maintain context (this)", async () => {
    const obj = {
      value: 42,
      method: vi.fn(function () {
        return this.value;
      }),
    };

    const debouncedMethod = debounce(obj.method.bind(obj), 100);
    debouncedMethod();
    await new Promise(resolve => setTimeout(resolve, 110));
    expect(obj.method).toHaveBeenCalled();
  });

  it("should handle immediate execution option", async () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100, {
      leading: true,
      trailing: false,
    });

    debouncedFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    debouncedFn();
    debouncedFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    await new Promise(resolve => setTimeout(resolve, 110));
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should handle trailing execution option", async () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100, {
      leading: false,
      trailing: true,
    });

    debouncedFn();
    expect(mockFn).toHaveBeenCalledTimes(0);

    debouncedFn();
    debouncedFn();
    expect(mockFn).toHaveBeenCalledTimes(0);

    await new Promise(resolve => setTimeout(resolve, 110));
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should cancel previous calls when new call is made", async () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    await new Promise(resolve => setTimeout(resolve, 50));

    debouncedFn(); // This should cancel the previous call and start a new timer
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(mockFn).toHaveBeenCalledTimes(0); // Still shouldn't be called yet

    await new Promise(resolve => setTimeout(resolve, 60)); // Wait for the new timer
    expect(mockFn).toHaveBeenCalledTimes(1); // Now it should be called
  });
});
