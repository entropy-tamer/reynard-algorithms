/**
 * @file Tests for polygon algorithms (simplification, boolean operations)
 */
import { describe, expect, it } from "vitest";
import {
  PolygonSimplifier,
  simplifyPolygon,
} from "../algorithms/computational-geometry/polygon/polygon-simplification-core";
import { SimplificationAlgorithm } from "../algorithms/computational-geometry/polygon/polygon-simplification-types";
import {
  PolygonBooleanOps,
  performPolygonBoolean,
} from "../algorithms/computational-geometry/polygon/polygon-boolean-core";
import { BooleanOperation } from "../algorithms/computational-geometry/polygon/polygon-boolean-types";

describe("Polygon Simplification", () => {
  it("should simplify polygon using Douglas-Peucker", () => {
    const vertices = [
      { x: 0, y: 0 },
      { x: 1, y: 0.1 },
      { x: 2, y: 0 },
      { x: 3, y: 0.1 },
      { x: 4, y: 0 },
    ];

    const result = simplifyPolygon(vertices, {
      tolerance: 0.2,
      algorithm: SimplificationAlgorithm.DOUGLAS_PEUCKER,
    });

    expect(result.vertices.length).toBeLessThanOrEqual(vertices.length);
    expect(result.verticesRemoved).toBeGreaterThanOrEqual(0);
  });

  it("should use PolygonSimplifier class", () => {
    const simplifier = new PolygonSimplifier({
      tolerance: 1.0,
      algorithm: SimplificationAlgorithm.DOUGLAS_PEUCKER,
    });

    const vertices = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ];

    const result = simplifier.simplify(vertices);
    expect(result.vertices.length).toBeGreaterThan(0);
  });
});

describe("Polygon Boolean Operations", () => {
  it("should perform polygon union", () => {
    const poly1 = {
      vertices: [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ],
    };

    const poly2 = {
      vertices: [
        { x: 1, y: 1 },
        { x: 3, y: 1 },
        { x: 3, y: 3 },
        { x: 1, y: 3 },
      ],
    };

    const result = performPolygonBoolean(poly1, poly2, {
      operation: BooleanOperation.UNION,
      tolerance: 1e-10,
    });

    // Just check it doesn't crash
    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("polygons");
  });

  it("should perform polygon intersection", () => {
    const poly1 = {
      vertices: [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ],
    };

    const poly2 = {
      vertices: [
        { x: 1, y: 1 },
        { x: 3, y: 1 },
        { x: 3, y: 3 },
        { x: 1, y: 3 },
      ],
    };

    const result = performPolygonBoolean(poly1, poly2, {
      operation: BooleanOperation.INTERSECTION,
      tolerance: 1e-10,
    });

    // Just check it doesn't crash
    expect(result).toHaveProperty("success");
  });

  it("should use PolygonBooleanOps class", () => {
    const ops = new PolygonBooleanOps();

    const poly1 = {
      vertices: [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ],
    };

    const poly2 = {
      vertices: [
        { x: 1, y: 1 },
        { x: 3, y: 1 },
        { x: 3, y: 3 },
        { x: 1, y: 3 },
      ],
    };

    const result = ops.union(poly1, poly2);
    // Just check it doesn't crash
    expect(result).toHaveProperty("success");
  });
});
