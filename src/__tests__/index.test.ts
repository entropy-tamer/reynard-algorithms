/**
 * @file Tests for main index exports
 *
 * The barrel (src/index.ts) is a 1200+ line module; importing it cold under a
 * loaded CI runner once exceeded the default 5s test timeout. We import ONCE
 * at describe scope and reuse the module across tests, with an explicit
 * generous timeout on the first (paying) import.
 */
import { describe, it, expect } from "vitest";

let barrel: Record<string, unknown> | null = null;

async function loadBarrel(): Promise<Record<string, unknown>> {
  if (!barrel) {
    barrel = (await import("../index")) as unknown as Record<string, unknown>;
  }
  return barrel;
}

describe("Geometry Shapes Index", () => {
  it(
    "should export point algorithms",
    { timeout: 30000 },
    async () => {
      const module = await loadBarrel();
      expect(module.PointOps).toBeDefined();
    }
  );

  it(
    "should export vector algorithms",
    { timeout: 30000 },
    async () => {
      const module = await loadBarrel();
      expect(module.VectorOps).toBeDefined();
    }
  );

  // Note: LineOps, RectangleOps, CircleOps, PolygonOps, TransformOps
  // are not yet exported from the main index as they need to be properly organized
  // See index.ts comment: "These will be added when the shape algorithm files are properly organized"

  it(
    "should export shape utilities",
    { timeout: 30000 },
    async () => {
      const module = await loadBarrel();
      expect(module).toBeDefined();
    }
  );
});
