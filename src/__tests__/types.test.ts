import { describe, it, expect } from "vitest";
import type { ThrottleOptions, DebounceOptions } from "../core/types/performance-types";

describe("Performance Types", () => {
  describe("ThrottleOptions", () => {
    it("should allow creating valid ThrottleOptions objects", () => {
      const options: ThrottleOptions = {
        maxWait: 100,
        leading: true,
        trailing: false,
      };

      expect(options.maxWait).toBe(100);
      expect(options.leading).toBe(true);
      expect(options.trailing).toBe(false);
    });
  });

  describe("DebounceOptions", () => {
    it("should allow creating valid DebounceOptions objects", () => {
      const options: DebounceOptions = {
        maxWait: 200,
        leading: false,
        trailing: true,
      };

      expect(options.maxWait).toBe(200);
      expect(options.leading).toBe(false);
      expect(options.trailing).toBe(true);
    });
  });
});
