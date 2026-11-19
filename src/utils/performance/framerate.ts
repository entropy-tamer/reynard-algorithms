/**
 * Frame Rate Monitoring Utilities
 *
 * Frame rate monitoring and performance tracking utilities.
 *
 * @module algorithms/performance/framerate
 */

import type { FrameRateMetrics } from "./types";

/**
 * Frame rate monitor
 */
export class FrameRateMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private frameTimes: number[] = [];
  private droppedFrames = 0;
  private isMonitoring = false;
  private animationFrameId: number | null = null;

  /**
   * Resets counters and begins sampling frames on the animation-frame loop.
   *
   * Calling this while monitoring is active is a no-op.
   */
  start(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.frameTimes = [];
    this.droppedFrames = 0;

    this.monitorFrame();
  }

  /**
   * Stops monitoring and cancels the pending animation-frame callback.
   */
  stop(): void {
    this.isMonitoring = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Samples one frame interval, counts drops against a 60fps baseline, and schedules the next sample.
   *
   * Only the last 60 frame times are retained for the rolling average.
   */
  private monitorFrame(): void {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const frameTime = currentTime - this.lastTime;

    this.frameTimes.push(frameTime);
    this.frameCount++;

    // Detect dropped frames (assuming 60fps = 16.67ms per frame)
    if (frameTime > 20) {
      this.droppedFrames += Math.floor(frameTime / 16.67) - 1;
    }

    // Keep only last 60 frame times for average calculation
    if (this.frameTimes.length > 60) {
      this.frameTimes.shift();
    }

    this.lastTime = currentTime;
    this.animationFrameId = requestAnimationFrame(() => this.monitorFrame());
  }

  /**
   * Computes current fps, average frame time, and dropped frames from the rolling sample window.
   *
   * @returns Frame-rate metrics with a capture timestamp.
   */
  getMetrics(): FrameRateMetrics {
    const averageFrameTime =
      this.frameTimes.length > 0 ? this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length : 0;

    const fps = averageFrameTime > 0 ? 1000 / averageFrameTime : 0;

    return {
      fps,
      frameTime: averageFrameTime,
      droppedFrames: this.droppedFrames,
      averageFrameTime,
      timestamp: Date.now(),
    };
  }
}
