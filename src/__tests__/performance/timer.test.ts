import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PerformanceTimer } from "../../performance/timer";

describe("PerformanceTimer", () => {
  let timer: PerformanceTimer;

  beforeEach(() => {
    // Note: Using real timers for PerformanceTimer tests
    timer = new PerformanceTimer();
  });

  describe("start", () => {
    it("should start the timer", () => {
      timer.start();
      expect(timer.getElapsed()).toBeGreaterThanOrEqual(0);
    });
  });

  describe("stop", () => {
    it("should stop the timer and return elapsed time", async () => {
      timer.start();

      // Wait for real time to pass
      await new Promise(resolve => setTimeout(resolve, 10));

      const elapsed = timer.stop();
      expect(elapsed).toBeGreaterThanOrEqual(9); // Allow some timing variance with real timers
    });

    it("should throw error when stopping a timer that is not running", () => {
      expect(() => timer.stop()).toThrow("Timer is not running");
    });

    it("should throw error when stopping a timer that was already stopped", () => {
      timer.start();
      timer.stop();
      expect(() => timer.stop()).toThrow("Timer is not running");
    });
  });

  describe("getElapsed", () => {
    it("should return elapsed time while timer is running", async () => {
      timer.start();

      // Wait for real time to pass
      await new Promise(resolve => setTimeout(resolve, 5));

      const elapsed = timer.getElapsed();
      expect(elapsed).toBeGreaterThanOrEqual(4); // Allow some timing variance with real timers
    });

    it("should return final elapsed time when timer is stopped", async () => {
      timer.start();

      // Wait for real time to pass
      await new Promise(resolve => setTimeout(resolve, 10));

      const finalElapsed = timer.stop();
      const elapsed = timer.getElapsed();

      expect(elapsed).toBe(finalElapsed);
      expect(elapsed).toBeGreaterThanOrEqual(5);
    });

    it("should return 0 when timer has not been started", () => {
      expect(timer.getElapsed()).toBe(0);
    });
  });

  describe("reset", () => {
    it("should reset the timer to initial state", () => {
      timer.start();
      timer.stop();

      timer.reset();

      expect(timer.getElapsed()).toBe(0);
      expect(() => timer.stop()).toThrow("Timer is not running");
    });

    it("should allow starting after reset", () => {
      timer.start();
      timer.stop();
      timer.reset();

      timer.start();
      expect(timer.getElapsed()).toBeGreaterThanOrEqual(0);
    });
  });

  describe("integration", () => {
    it("should work correctly for multiple start/stop cycles", async () => {
      // First cycle
      timer.start();
      await new Promise(resolve => setTimeout(resolve, 5));
      const firstElapsed = timer.stop();

      // Reset and second cycle
      timer.reset();
      timer.start();
      await new Promise(resolve => setTimeout(resolve, 5));
      const secondElapsed = timer.stop();

      expect(firstElapsed).toBeGreaterThanOrEqual(5);
      expect(secondElapsed).toBeGreaterThanOrEqual(5);
    });

    it("should maintain precision for very short durations", async () => {
      timer.start();
      await new Promise(resolve => setTimeout(resolve, 5));
      const elapsed = timer.stop();

      expect(elapsed).toBeGreaterThanOrEqual(1);
    });
  });
});
