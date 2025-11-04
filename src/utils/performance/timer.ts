/**
 * Performance Timer Utilities
 *
 * High-precision timing utilities for measuring execution time.
 *
 * @module algorithms/performance/timer
 */

/**
 * High-precision performance timer
 */
export class PerformanceTimer {
  private startTime: number = 0;
  private endTime: number = 0;
  private isRunning: boolean = false;

  /**
   *
   * @example
   */
  start(): void {
    this.startTime = performance.now();
    this.isRunning = true;
  }

  /**
   *
   * @example
   */
  stop(): number {
    if (!this.isRunning) {
      throw new Error("Timer is not running");
    }
    this.endTime = performance.now();
    this.isRunning = false;
    return this.endTime - this.startTime;
  }

  /**
   *
   * @example
   */
  getElapsed(): number {
    if (!this.isRunning) {
      return this.endTime - this.startTime;
    }
    return performance.now() - this.startTime;
  }

  /**
   *
   * @example
   */
  reset(): void {
    this.startTime = 0;
    this.endTime = 0;
    this.isRunning = false;
  }
}
