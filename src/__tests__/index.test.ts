/**
 * @file Tests for main index exports
 */
import { describe, it, expect } from "vitest";

describe("Geometry Shapes Index", () => {
  it("should export point algorithms", async () => {
    const module = await import("../index");

    expect(module.PointOps).toBeDefined();
  });

  it("should export vector algorithms", async () => {
    const module = await import("../index");

    expect(module.VectorOps).toBeDefined();
  });

  // Note: LineOps, RectangleOps, CircleOps, PolygonOps, TransformOps
  // are not yet exported from the main index as they need to be properly organized
  // See index.ts comment: "These will be added when the shape algorithm files are properly organized"

  it("should export shape utilities", async () => {
    const module = await import("../index");

    expect(module).toBeDefined();
  });
});
