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
   * Starts or restarts timing from the current high-resolution clock value.
   */
  start(): void {
    this.startTime = performance.now();
    this.isRunning = true;
  }

  /**
   * Stops the timer and returns the elapsed milliseconds.
   *
   * @returns Duration from `start` to `stop`.
   * @throws When the timer was not running.
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
   * Returns elapsed milliseconds: the frozen duration when stopped, or the live interval when running.
   *
   * @returns Elapsed time in milliseconds.
   */
  getElapsed(): number {
    if (!this.isRunning) {
      return this.endTime - this.startTime;
    }
    return performance.now() - this.startTime;
  }

  /**
   * Clears the recorded timestamps and returns the timer to the stopped state.
   */
  reset(): void {
    this.startTime = 0;
    this.endTime = 0;
    this.isRunning = false;
  }
}
