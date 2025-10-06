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

  start(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.frameTimes = [];
    this.droppedFrames = 0;

    this.monitorFrame();
  }

  stop(): void {
    this.isMonitoring = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

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
