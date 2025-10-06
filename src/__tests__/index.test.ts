import { describe, it, expect } from "vitest";

describe("Geometry Shapes Index", () => {
  it("should export point algorithms", async () => {
    const module = await import("../index");

    expect(module.PointOps).toBeDefined();
  });

  it("should export line algorithms", async () => {
    const module = await import("../index");

    expect(module.LineOps).toBeDefined();
  });

  it("should export circle algorithms", async () => {
    const module = await import("../index");

    expect(module.CircleOps).toBeDefined();
  });

  it("should export rectangle algorithms", async () => {
    const module = await import("../index");

    expect(module.RectangleOps).toBeDefined();
  });

  it("should export polygon algorithms", async () => {
    const module = await import("../index");

    expect(module.PolygonOps).toBeDefined();
  });

  it("should export shape utilities", async () => {
    const module = await import("../index");

    expect(module).toBeDefined();
  });
});
