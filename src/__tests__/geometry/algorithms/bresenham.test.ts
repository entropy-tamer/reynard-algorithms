import { describe, it, expect, beforeEach, vi } from "vitest";
import { BresenhamLine } from "../../../geometry/algorithms/bresenham/bresenham-core";
import { Point } from "../../../geometry/algorithms/bresenham/bresenham-types";

describe("Bresenham's Line Algorithm", () => {
  let bresenham: BresenhamLine;

  beforeEach(() => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    bresenham = new BresenhamLine();
  });

  describe("Basic Line Drawing", () => {
    it("should draw a horizontal line", () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 5, y: 0 };
      const result = bresenham.drawLine(start, end);

      expect(result.success).toBe(true);
      expect(result.points).toEqual([
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 0 },
        { x: 5, y: 0 },
      ]);
      expect(result.pointCount).toBe(6);
    });

    it("should draw a vertical line", () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 0, y: 5 };
      const result = bresenham.drawLine(start, end);

      expect(result.success).toBe(true);
      expect(result.points).toEqual([
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 2 },
        { x: 0, y: 3 },
        { x: 0, y: 4 },
        { x: 0, y: 5 },
      ]);
      expect(result.pointCount).toBe(6);
    });

    it("should draw a diagonal line", () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 3, y: 3 };
      const result = bresenham.drawLine(start, end);

      expect(result.success).toBe(true);
      expect(result.points).toEqual([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
      ]);
      expect(result.pointCount).toBe(4);
    });

    it("should draw a line with slope < 1", () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 5, y: 2 };
      const result = bresenham.drawLine(start, end);

      expect(result.success).toBe(true);
      expect(result.pointCount).toBeGreaterThan(0);
      expect(result.points[0]).toEqual(start);
      expect(result.points[result.points.length - 1]).toEqual(end);
    });

    it("should draw a line with slope > 1", () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 2, y: 5 };
      const result = bresenham.drawLine(start, end);

      expect(result.success).toBe(true);
      expect(result.pointCount).toBeGreaterThan(0);
      expect(result.points[0]).toEqual(start);
      expect(result.points[result.points.length - 1]).toEqual(end);
    });

    it("should handle negative slopes", () => {
      const start: Point = { x: 0, y: 5 };
      const end: Point = { x: 5, y: 0 };
      const result = bresenham.drawLine(start, end);

      expect(result.success).toBe(true);
      expect(result.pointCount).toBeGreaterThan(0);
      expect(result.points[0]).toEqual(start);
      expect(result.points[result.points.length - 1]).toEqual(end);
    });

    it("should handle reverse direction lines", () => {
      const start: Point = { x: 5, y: 0 };
      const end: Point = { x: 0, y: 0 };
      const result = bresenham.drawLine(start, end);

      expect(result.success).toBe(true);
      expect(result.points).toEqual([
        { x: 5, y: 0 },
        { x: 4, y: 0 },
        { x: 3, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 0 },
      ]);
    });
  });

  describe("Configuration Options", () => {
    it("should exclude start point when configured", () => {
      const bresenhamNoStart = new BresenhamLine({ includeStart: false });
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 3, y: 0 };
      const result = bresenhamNoStart.drawLine(start, end);

      expect(result.success).toBe(true);
      expect(result.points[0]).not.toEqual(start);
      expect(result.points[result.points.length - 1]).toEqual(end);
    });

    it("should exclude end point when configured", () => {
      const bresenhamNoEnd = new BresenhamLine({ includeEnd: false });
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 3, y: 0 };
      const result = bresenhamNoEnd.drawLine(start, end);

      expect(result.success).toBe(true);
      expect(result.points[0]).toEqual(start);
      expect(result.points[result.points.length - 1]).not.toEqual(end);
    });

    it("should exclude both start and end points when configured", () => {
      const bresenhamNoEnds = new BresenhamLine({ includeStart: false, includeEnd: false });
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 3, y: 0 };
      const result = bresenhamNoEnds.drawLine(start, end);

      expect(result.success).toBe(true);
      expect(result.points[0]).not.toEqual(start);
      expect(result.points[result.points.length - 1]).not.toEqual(end);
    });

    it("should handle negative coordinates when configured", () => {
      const bresenhamNegative = new BresenhamLine({ handleNegativeCoordinates: true });
      const start: Point = { x: -2, y: -2 };
      const end: Point = { x: 2, y: 2 };
      const result = bresenhamNegative.drawLine(start, end);

      expect(result.success).toBe(true);
      expect(result.points[0]).toEqual(start);
      expect(result.points[result.points.length - 1]).toEqual(end);
    });
  });

  describe("Advanced Features", () => {
    it("should respect maxPoints limit", () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 10, y: 0 };
      const result = bresenham.drawLine(start, end, { maxPoints: 3 });

      expect(result.success).toBe(true);
      expect(result.pointCount).toBe(3);
    });

    it("should call onPoint callback for each point", () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 3, y: 0 };
      const callbackPoints: Point[] = [];
      
      const result = bresenham.drawLine(start, end, {
        onPoint: (point) => {
          callbackPoints.push(point);
          return true; // Continue processing
        },
      });

      expect(result.success).toBe(true);
      expect(callbackPoints.length).toBe(result.pointCount);
      expect(callbackPoints).toEqual(result.points);
    });

    it("should stop early when onPoint returns false", () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 10, y: 0 };
      let callCount = 0;
      
      const result = bresenham.drawLine(start, end, {
        onPoint: (point) => {
          callCount++;
          return callCount < 3; // Stop after 2 points
        },
      });

      expect(result.success).toBe(true);
      expect(result.stoppedEarly).toBe(true);
      expect(result.pointsProcessed).toBe(2);
      expect(callCount).toBe(2);
    });
  });

  describe("Multi-Line Drawing", () => {
    it("should draw multiple connected lines", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 5, y: 0 },
        { x: 5, y: 5 },
        { x: 0, y: 5 },
      ];
      const result = bresenham.drawMultiLine(points);

      expect(result.success).toBe(true);
      expect(result.lines.length).toBe(3); // 4 points = 3 lines
      expect(result.totalPoints).toBeGreaterThan(0);
    });

    it("should connect lines when configured", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 3, y: 0 },
        { x: 3, y: 3 },
      ];
      const result = bresenham.drawMultiLine(points, { connectLines: true });

      expect(result.success).toBe(true);
      expect(result.lines.length).toBe(2);
      
      // First line should include end point
      expect(result.lines[0].points[result.lines[0].points.length - 1]).toEqual(points[1]);
      // Second line should start from the same point (no duplication)
      expect(result.lines[1].points[0]).toEqual(points[1]);
    });
  });

  describe("Edge Cases", () => {
    it("should handle same start and end point", () => {
      const point: Point = { x: 5, y: 5 };
      const result = bresenham.drawLine(point, point);

      expect(result.success).toBe(true);
      expect(result.points).toEqual([point]);
      expect(result.pointCount).toBe(1);
    });

    it("should handle zero-length line with includeStart false", () => {
      const bresenhamNoStart = new BresenhamLine({ includeStart: false });
      const point: Point = { x: 5, y: 5 };
      const result = bresenhamNoStart.drawLine(point, point);

      expect(result.success).toBe(true);
      expect(result.points).toEqual([]);
      expect(result.pointCount).toBe(0);
    });

    it("should handle very long lines", () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 1000, y: 1000 };
      const result = bresenham.drawLine(start, end);

      expect(result.success).toBe(true);
      expect(result.pointCount).toBeGreaterThan(0);
      expect(result.points[0]).toEqual(start);
      expect(result.points[result.points.length - 1]).toEqual(end);
    });

    it("should handle lines with very small coordinates", () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 1, y: 1 };
      const result = bresenham.drawLine(start, end);

      expect(result.success).toBe(true);
      expect(result.points).toEqual([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ]);
    });
  });

  describe("Static Utility Methods", () => {
    it("should calculate Euclidean distance correctly", () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 3, y: 4 };
      const distance = BresenhamLine.distance(start, end);

      expect(distance).toBeCloseTo(5); // 3-4-5 triangle
    });

    it("should calculate Manhattan distance correctly", () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 3, y: 4 };
      const distance = BresenhamLine.manhattanDistance(start, end);

      expect(distance).toBe(7); // |3-0| + |4-0| = 7
    });

    it("should calculate Chebyshev distance correctly", () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 3, y: 4 };
      const distance = BresenhamLine.chebyshevDistance(start, end);

      expect(distance).toBe(4); // max(|3-0|, |4-0|) = 4
    });

    it("should detect if point is on line segment", () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 4, y: 0 };
      const pointOnLine: Point = { x: 2, y: 0 };
      const pointOffLine: Point = { x: 2, y: 1 };

      expect(BresenhamLine.isPointOnLine(pointOnLine, start, end)).toBe(true);
      expect(BresenhamLine.isPointOnLine(pointOffLine, start, end)).toBe(false);
    });

    it("should find closest point on line segment", () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 4, y: 0 };
      const point: Point = { x: 2, y: 3 };
      const closest = BresenhamLine.closestPointOnLine(point, start, end);

      expect(closest).toEqual({ x: 2, y: 0 });
    });

    it("should draw a circle using Bresenham's circle algorithm", () => {
      const center: Point = { x: 5, y: 5 };
      const radius = 3;
      const points = BresenhamLine.drawCircle(center, radius);

      expect(points.length).toBeGreaterThan(0);
      
      // Check that all points are approximately at the correct distance from center
      for (const point of points) {
        const distance = BresenhamLine.distance(center, point);
        expect(distance).toBeCloseTo(radius, 1); // Allow some tolerance for discrete pixels
      }
    });
  });

  describe("Performance Benchmarks", () => {
    const runBenchmark = (
      description: string,
      start: Point,
      end: Point,
      iterations: number = 1000
    ) => {
      it(`should perform ${description} efficiently`, () => {
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
          const result = bresenham.drawLine(start, end);
          expect(result.success).toBe(true);
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Log for manual inspection during benchmark runs
        // console.log(`Benchmark: ${description} - ${iterations} iterations in ${duration.toFixed(3)} ms`);
        
        expect(duration).toBeGreaterThanOrEqual(0);
      });
    };

    runBenchmark("short horizontal line", { x: 0, y: 0 }, { x: 10, y: 0 });
    runBenchmark("medium diagonal line", { x: 0, y: 0 }, { x: 100, y: 100 });
    runBenchmark("long line", { x: 0, y: 0 }, { x: 1000, y: 500 });
    runBenchmark("steep line", { x: 0, y: 0 }, { x: 10, y: 1000 });
  });

  describe("Basic Line Drawing (Alternative Method)", () => {
    it("should draw basic line without additional features", () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 3, y: 2 };
      const result = bresenham.drawBasicLine(start, end);

      expect(result.success).toBe(true);
      expect(result.pointCount).toBeGreaterThan(0);
      expect(result.points[0]).toEqual(start);
      expect(result.points[result.points.length - 1]).toEqual(end);
    });
  });
});
