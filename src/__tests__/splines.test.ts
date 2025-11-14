/**
 * @file Tests for spline algorithms (B-Splines, NURBS, Hermite)
 */
import { describe, expect, it } from "vitest";
import {
  BSplineCurve,
  evaluateBSpline,
  generateUniformKnotVector,
} from "../algorithms/computational-geometry/splines/b-spline-core";
import { NURBSCurve, evaluateNURBS } from "../algorithms/computational-geometry/splines/nurbs-core";
import {
  HermiteSpline,
  evaluateHermiteSegment,
  createHermiteSegments,
} from "../algorithms/computational-geometry/splines/hermite-core";

describe("B-Splines", () => {
  it("should generate uniform knot vector", () => {
    const knots = generateUniformKnotVector({
      degree: 3,
      numControlPoints: 5,
      closed: false,
    });

    expect(knots.length).toBeGreaterThan(0);
    expect(knots[0]).toBe(0);
  });

  it("should evaluate B-spline curve", () => {
    const controlPoints = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 0 },
      { x: 3, y: 1 },
    ];

    const spline = {
      controlPoints,
      degree: 3,
      closed: false,
    };

    const point = evaluateBSpline(spline, 0.5);
    expect(point).toHaveProperty("x");
    expect(point).toHaveProperty("y");
  });

  it("should create and use BSplineCurve class", () => {
    const controlPoints = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 0 },
    ];

    const curve = new BSplineCurve(controlPoints, { degree: 2 });
    const point = curve.evaluate(0.5);

    expect(point).toHaveProperty("x");
    expect(point).toHaveProperty("y");
  });
});

describe("NURBS", () => {
  it("should evaluate NURBS curve", () => {
    const controlPoints = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 0 },
    ];
    const weights = [1, 1, 1];

    const nurbs = {
      controlPoints,
      weights,
      degree: 2,
      closed: false,
    };

    const point = evaluateNURBS(nurbs, 0.5);
    expect(point).toHaveProperty("x");
    expect(point).toHaveProperty("y");
  });

  it("should create and use NURBSCurve class", () => {
    const controlPoints = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 0 },
    ];
    const weights = [1, 1, 1];

    const curve = new NURBSCurve(controlPoints, weights, { degree: 2 });
    const point = curve.evaluate(0.5);

    expect(point).toHaveProperty("x");
    expect(point).toHaveProperty("y");
  });
});

describe("Hermite Splines", () => {
  it("should evaluate Hermite segment", () => {
    const segment = {
      p0: { x: 0, y: 0 },
      p1: { x: 1, y: 1 },
      t0: { x: 1, y: 0 },
      t1: { x: 0, y: 1 },
    };

    const point = evaluateHermiteSegment(segment, 0.5);
    expect(point).toHaveProperty("x");
    expect(point).toHaveProperty("y");
  });

  it("should create Hermite segments from points and tangents", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 0 },
    ];
    const tangents = [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ];

    const segments = createHermiteSegments(points, tangents);
    expect(segments.length).toBe(2);
  });

  it("should create and use HermiteSpline class", () => {
    const segments = [
      {
        p0: { x: 0, y: 0 },
        p1: { x: 1, y: 1 },
        t0: { x: 1, y: 0 },
        t1: { x: 0, y: 1 },
      },
    ];

    const spline = new HermiteSpline(segments);
    const point = spline.evaluate(0.5);

    expect(point).toHaveProperty("x");
    expect(point).toHaveProperty("y");
  });
});
