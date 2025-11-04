/**
 * Performance Budget Setup Tests
 *
 * Tests for setting and configuring performance budgets.
 *
 * @module algorithms/performance/__tests__/budget-setup
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PerformanceBudgetChecker } from "../../utils/performance/budget";
import { createTestBudget, createTestMetrics } from "../../utils/performance/test-utils";

describe("PerformanceBudgetChecker - Setup", () => {
  let checker: PerformanceBudgetChecker;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    checker = new PerformanceBudgetChecker();
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe("setBudget", () => {
    it("should set a performance budget", () => {
      const budget = createTestBudget();
      const metrics = createTestMetrics();

      checker.setBudget("test-budget", budget);
      // No direct way to verify, but checkBudget will confirm it's set
      expect(checker.checkBudget("test-budget", metrics)).toBe(true);
    });

    it("should allow multiple budgets with different names", () => {
      const budget1 = createTestBudget({ maxDuration: 100 });
      const budget2 = createTestBudget({ maxDuration: 200 });
      const metrics = createTestMetrics({ duration: 150 });

      checker.setBudget("budget1", budget1);
      checker.setBudget("budget2", budget2);

      // budget1 should fail (150 > 100)
      expect(checker.checkBudget("budget1", metrics)).toBe(false);
      // budget2 should pass (150 <= 200)
      expect(checker.checkBudget("budget2", metrics)).toBe(true);
    });

    it("should overwrite existing budget with same name", () => {
      const budget1 = createTestBudget({ maxDuration: 100 });
      const budget2 = createTestBudget({ maxDuration: 200 });
      const metrics = createTestMetrics({ duration: 150 });

      checker.setBudget("test-budget", budget1);
      checker.setBudget("test-budget", budget2);

      // Should use the second budget (150 <= 200)
      expect(checker.checkBudget("test-budget", metrics)).toBe(true);
    });
  });
});
