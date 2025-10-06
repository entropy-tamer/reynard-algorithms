/**
 * Test setup for reynard-algorithms
 * Using 2025 best practices for performance API mocking
 */
import { vi } from "vitest";
// Simple performance API mocking that works with vitest fake timers
if (typeof globalThis.performance === "undefined") {
    globalThis.performance = {
        now: vi.fn(() => Date.now()),
        mark: vi.fn(),
        measure: vi.fn(),
        getEntriesByName: vi.fn(() => []),
        getEntriesByType: vi.fn(() => []),
        clearMarks: vi.fn(),
        clearMeasures: vi.fn(),
        clearResourceTimings: vi.fn(),
        getEntries: vi.fn(() => []),
        toJSON: vi.fn(() => ({})),
        timeOrigin: Date.now(),
    };
}
// Ensure performance.now is available
if (typeof performance.now !== "function") {
    performance.now = vi.fn(() => Date.now());
}
