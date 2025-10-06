/**
 * Test utilities for performance tests
 *
 * Shared test data, helper functions, and mocking utilities for performance testing.
 *
 * @module algorithms/performance/__tests__/test-utils
 */

import { vi } from "vitest";
import type { PerformanceBudget, PerformanceMetrics } from "./types";

// ============================================================================
// Performance Budget Testing Utilities
// ============================================================================

/**
 * Creates a standard performance budget for testing
 */
export function createTestBudget(overrides: Partial<PerformanceBudget> = {}): PerformanceBudget {
  return {
    maxDuration: 100,
    maxMemoryUsage: 1024,
    maxIterations: 1000,
    warningThreshold: 0.8,
    ...overrides,
  };
}

/**
 * Creates standard performance metrics for testing
 */
export function createTestMetrics(overrides: Partial<PerformanceMetrics> = {}): PerformanceMetrics {
  return {
    duration: 50,
    memoryBefore: 0,
    memoryAfter: 512,
    memoryDelta: 512,
    timestamp: Date.now(),
    iterations: 500,
    averageTime: 0.1,
    minTime: 0.05,
    maxTime: 0.15,
    standardDeviation: 0.02,
    ...overrides,
  };
}

/**
 * Creates metrics that exceed budget limits
 */
export function createExceedingMetrics(): PerformanceMetrics {
  return createTestMetrics({
    duration: 150,
    memoryAfter: 2048,
    memoryDelta: 2048,
    iterations: 1500,
  });
}

/**
 * Creates metrics that are exactly at budget limits
 */
export function createAtLimitMetrics(): PerformanceMetrics {
  return createTestMetrics({
    duration: 100,
    memoryAfter: 1024,
    memoryDelta: 1024,
    iterations: 1000,
  });
}

// ============================================================================
// Performance Mocking Utilities
// ============================================================================

// Mock performance.now for consistent testing
export const mockPerformanceNow = vi.fn();
export const originalPerformance = global.performance;

export const setupPerformanceMock = () => {
  Object.defineProperty(global, "performance", {
    value: {
      now: mockPerformanceNow,
      memory: {
        usedJSHeapSize: 1000000,
      },
    },
    writable: true,
  });
};

export const teardownPerformanceMock = () => {
  Object.defineProperty(global, "performance", {
    value: originalPerformance,
    writable: true,
  });
};

export const resetPerformanceMock = () => {
  vi.clearAllMocks();
  mockPerformanceNow.mockReturnValue(0);
};
