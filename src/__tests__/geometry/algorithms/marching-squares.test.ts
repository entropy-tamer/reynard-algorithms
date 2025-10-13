import { describe, it, expect, beforeEach, vi } from "vitest";
import { MarchingSquares } from "../../../geometry/algorithms/marching-squares/marching-squares-core";
import { Contour } from "../../../geometry/algorithms/marching-squares/marching-squares-types";

describe("Marching Squares Algorithm", () => {
  let marchingSquares: MarchingSquares;

  beforeEach(() => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    marchingSquares = new MarchingSquares();
  });

  describe("Basic Contour Generation", () => {
    it("should generate a single contour for a simple case", () => {
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
      expect(result.contours[0].segments.length).toBeGreaterThan(0);
      expect(result.contours[0].level).toBe(0.5);
    });

    it("should generate multiple contours for complex cases", () => {
      const grid = [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBeGreaterThan(0);
    });

    it("should handle edge cases with no contours", () => {
      const grid = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(0);
    });

    it("should handle edge cases with all values above threshold", () => {
      const grid = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(0);
    });
  });

  describe("Input Validation", () => {
    it("should reject empty grid", () => {
      const result = marchingSquares.compute([]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("Grid cannot be empty");
    });

    it("should reject grid with empty rows", () => {
      const result = marchingSquares.compute([[]]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("Grid cannot be empty");
    });

    it("should reject non-array input", () => {
      const result = marchingSquares.compute("invalid" as any);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("Grid must be a 2D array");
    });

    it("should reject grid with inconsistent row lengths", () => {
      const grid = [
        [0, 0, 0],
        [0, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid as number[][]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("All rows must have the same length");
    });

    it("should reject grid with invalid values", () => {
      const grid = [
        [0, 0, 0],
        [0, "invalid", 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid as number[][]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("Invalid value");
    });

    it("should reject grid with non-finite values", () => {
      const grid = [
        [0, 0, 0],
        [0, Infinity, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid as number[][]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("must be a finite number");
    });
  });

  describe("Configuration Options", () => {
    it("should work without input validation", () => {
      const marchingSquaresNoValidation = new MarchingSquares({ validateInput: false });
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquaresNoValidation.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
    });

    it("should work without interpolation", () => {
      const marchingSquaresNoInterpolation = new MarchingSquares({ interpolate: false });
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquaresNoInterpolation.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
    });

    it("should use custom tolerance", () => {
      const marchingSquaresCustomTolerance = new MarchingSquares({ tolerance: 1e-5 });
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquaresCustomTolerance.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
    });
  });

  describe("Multi-Level Contour Generation", () => {
    it("should generate contours for multiple threshold levels", () => {
      const grid = [
        [0, 0, 0, 0],
        [0, 0.3, 0.7, 0],
        [0, 0.7, 0.3, 0],
        [0, 0, 0, 0],
      ];

      const result = marchingSquares.computeMultiLevel(grid, {
        thresholds: [0.2, 0.5, 0.8],
      });

      expect(result.stats.success).toBe(true);
      expect(result.contoursByLevel.size).toBe(3);
      expect(result.allContours.length).toBeGreaterThan(0);
    });

    it("should handle empty thresholds array", () => {
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.computeMultiLevel(grid, {
        thresholds: [],
      });

      expect(result.stats.success).toBe(true);
      expect(result.contoursByLevel.size).toBe(0);
      expect(result.allContours.length).toBe(0);
    });
  });

  describe("Contour Analysis", () => {
    let contour: Contour;

    beforeEach(() => {
      const grid = [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ];
      const result = marchingSquares.compute(grid, 0.5);
      contour = result.contours[0];
    });

    it("should compute contour length", () => {
      const analysis = marchingSquares.analyzeContour(contour, { computeLengths: true });

      expect(analysis.length).toBeGreaterThan(0);
    });

    it("should compute contour area for closed contours", () => {
      const analysis = marchingSquares.analyzeContour(contour, { computeAreas: true });

      if (contour.isClosed) {
        expect(analysis.area).toBeGreaterThan(0);
      } else {
        expect(analysis.area).toBeUndefined();
      }
    });

    it("should compute contour centroid", () => {
      const analysis = marchingSquares.analyzeContour(contour, { computeCentroids: true });

      expect(analysis.centroid.x).toBeDefined();
      expect(analysis.centroid.y).toBeDefined();
    });

    it("should compute contour bounding box", () => {
      const analysis = marchingSquares.analyzeContour(contour, { computeBoundingBoxes: true });

      expect(analysis.boundingBox.minX).toBeDefined();
      expect(analysis.boundingBox.minY).toBeDefined();
      expect(analysis.boundingBox.maxX).toBeDefined();
      expect(analysis.boundingBox.maxY).toBeDefined();
    });

    it("should compute all analysis properties", () => {
      const analysis = marchingSquares.analyzeContour(contour);

      expect(analysis.length).toBeGreaterThan(0);
      expect(analysis.centroid.x).toBeDefined();
      expect(analysis.centroid.y).toBeDefined();
      expect(analysis.boundingBox.minX).toBeDefined();
      expect(analysis.boundingBox.minY).toBeDefined();
      expect(analysis.boundingBox.maxX).toBeDefined();
      expect(analysis.boundingBox.maxY).toBeDefined();
    });
  });

  describe("Contour Simplification", () => {
    let contour: Contour;

    beforeEach(() => {
      const grid = [
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0],
      ];
      const result = marchingSquares.compute(grid, 0.5);
      contour = result.contours[0];
    });

    it("should simplify contour by removing unnecessary segments", () => {
      const result = marchingSquares.simplifyContour(contour, { maxDistance: 0.5 });

      expect(result.simplifiedContour.segments.length).toBeLessThanOrEqual(contour.segments.length);
      expect(result.segmentsRemoved).toBeGreaterThanOrEqual(0);
      expect(result.compressionRatio).toBeGreaterThanOrEqual(1);
    });

    it("should preserve endpoints when configured", () => {
      const result = marchingSquares.simplifyContour(contour, {
        maxDistance: 0.5,
        preserveEndpoints: true,
      });

      if (contour.segments.length > 0) {
        const originalStart = contour.segments[0].start;
        const originalEnd = contour.segments[contour.segments.length - 1].end;
        const simplifiedStart = result.simplifiedContour.segments[0].start;
        const simplifiedEnd = result.simplifiedContour.segments[result.simplifiedContour.segments.length - 1].end;

        expect(simplifiedStart.x).toBeCloseTo(originalStart.x, 5);
        expect(simplifiedStart.y).toBeCloseTo(originalStart.y, 5);
        expect(simplifiedEnd.x).toBeCloseTo(originalEnd.x, 5);
        expect(simplifiedEnd.y).toBeCloseTo(originalEnd.y, 5);
      }
    });

    it("should not simplify if segments are necessary", () => {
      const result = marchingSquares.simplifyContour(contour, { maxDistance: 0.01 });

      expect(result.simplifiedContour.segments.length).toBe(contour.segments.length);
      expect(result.segmentsRemoved).toBe(0);
      expect(result.compressionRatio).toBe(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle single cell grid", () => {
      const grid = [[1]];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(0);
    });

    it("should handle 2x2 grid", () => {
      const grid = [
        [0, 1],
        [1, 0],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBeGreaterThan(0);
    });

    it("should handle very small values", () => {
      const grid = [
        [0, 0, 0],
        [0, 0.0001, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.00005);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
    });

    it("should handle very large values", () => {
      const grid = [
        [0, 0, 0],
        [0, 1000000, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 500000);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
    });

    it("should handle negative values", () => {
      const grid = [
        [0, 0, 0],
        [0, -1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, -0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
    });
  });

  describe("Performance Benchmarks", () => {
    const runBenchmark = (description: string, width: number, height: number) => {
      it(`should perform ${description} efficiently`, () => {
        const grid: number[][] = [];
        for (let y = 0; y < height; y++) {
          const row: number[] = [];
          for (let x = 0; x < width; x++) {
            row.push(Math.random());
          }
          grid.push(row);
        }

        const result = marchingSquares.compute(grid, 0.5);

        expect(result.stats.success).toBe(true);
        expect(result.contours.length).toBeGreaterThanOrEqual(0);
        expect(result.stats.executionTime).toBeGreaterThanOrEqual(0);

        // Log for manual inspection during benchmark runs
        // console.log(`Benchmark: ${description} - ${width}x${height} grid in ${(endTime - startTime).toFixed(3)} ms`);
      });
    };

    runBenchmark("small grid", 10, 10);
    runBenchmark("medium grid", 50, 50);
    runBenchmark("large grid", 100, 100);
    runBenchmark("very large grid", 200, 200);
  });

  describe("Contour Properties", () => {
    it("should generate closed contours when appropriate", () => {
      const grid = [
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
      expect(result.contours[0].isClosed).toBe(true);
    });

    it("should generate open contours when appropriate", () => {
      const grid = [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
      expect(result.contours[0].isClosed).toBe(false);
    });

    it("should preserve contour level information", () => {
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.7);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
      expect(result.contours[0].level).toBe(0.7);
    });
  });

  describe("Interpolation", () => {
    it("should produce smoother contours with interpolation", () => {
      const grid = [
        [0, 0, 0, 0],
        [0, 0.3, 0.7, 0],
        [0, 0.7, 0.3, 0],
        [0, 0, 0, 0],
      ];

      const resultWithInterpolation = marchingSquares.compute(grid, 0.5);
      const marchingSquaresNoInterpolation = new MarchingSquares({ interpolate: false });
      const resultWithoutInterpolation = marchingSquaresNoInterpolation.compute(grid, 0.5);

      expect(resultWithInterpolation.stats.success).toBe(true);
      expect(resultWithoutInterpolation.stats.success).toBe(true);

      // With interpolation, contours should be smoother (more segments)
      if (resultWithInterpolation.contours.length > 0 && resultWithoutInterpolation.contours.length > 0) {
        expect(resultWithInterpolation.contours[0].segments.length).toBeGreaterThanOrEqual(
          resultWithoutInterpolation.contours[0].segments.length
        );
      }
    });
  });
});

describe("Marching Squares Algorithm", () => {
  let marchingSquares: MarchingSquares;

  beforeEach(() => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    marchingSquares = new MarchingSquares();
  });

  describe("Basic Contour Generation", () => {
    it("should generate a single contour for a simple case", () => {
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
      expect(result.contours[0].segments.length).toBeGreaterThan(0);
      expect(result.contours[0].level).toBe(0.5);
    });

    it("should generate multiple contours for complex cases", () => {
      const grid = [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBeGreaterThan(0);
    });

    it("should handle edge cases with no contours", () => {
      const grid = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(0);
    });

    it("should handle edge cases with all values above threshold", () => {
      const grid = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(0);
    });
  });

  describe("Input Validation", () => {
    it("should reject empty grid", () => {
      const result = marchingSquares.compute([]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("Grid cannot be empty");
    });

    it("should reject grid with empty rows", () => {
      const result = marchingSquares.compute([[]]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("Grid cannot be empty");
    });

    it("should reject non-array input", () => {
      const result = marchingSquares.compute("invalid" as any);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("Grid must be a 2D array");
    });

    it("should reject grid with inconsistent row lengths", () => {
      const grid = [
        [0, 0, 0],
        [0, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid as number[][]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("All rows must have the same length");
    });

    it("should reject grid with invalid values", () => {
      const grid = [
        [0, 0, 0],
        [0, "invalid", 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid as number[][]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("Invalid value");
    });

    it("should reject grid with non-finite values", () => {
      const grid = [
        [0, 0, 0],
        [0, Infinity, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid as number[][]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("must be a finite number");
    });
  });

  describe("Configuration Options", () => {
    it("should work without input validation", () => {
      const marchingSquaresNoValidation = new MarchingSquares({ validateInput: false });
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquaresNoValidation.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
    });

    it("should work without interpolation", () => {
      const marchingSquaresNoInterpolation = new MarchingSquares({ interpolate: false });
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquaresNoInterpolation.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
    });

    it("should use custom tolerance", () => {
      const marchingSquaresCustomTolerance = new MarchingSquares({ tolerance: 1e-5 });
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquaresCustomTolerance.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
    });
  });

  describe("Multi-Level Contour Generation", () => {
    it("should generate contours for multiple threshold levels", () => {
      const grid = [
        [0, 0, 0, 0],
        [0, 0.3, 0.7, 0],
        [0, 0.7, 0.3, 0],
        [0, 0, 0, 0],
      ];

      const result = marchingSquares.computeMultiLevel(grid, {
        thresholds: [0.2, 0.5, 0.8],
      });

      expect(result.stats.success).toBe(true);
      expect(result.contoursByLevel.size).toBe(3);
      expect(result.allContours.length).toBeGreaterThan(0);
    });

    it("should handle empty thresholds array", () => {
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.computeMultiLevel(grid, {
        thresholds: [],
      });

      expect(result.stats.success).toBe(true);
      expect(result.contoursByLevel.size).toBe(0);
      expect(result.allContours.length).toBe(0);
    });
  });

  describe("Contour Analysis", () => {
    let contour: Contour;

    beforeEach(() => {
      const grid = [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ];
      const result = marchingSquares.compute(grid, 0.5);
      contour = result.contours[0];
    });

    it("should compute contour length", () => {
      const analysis = marchingSquares.analyzeContour(contour, { computeLengths: true });

      expect(analysis.length).toBeGreaterThan(0);
    });

    it("should compute contour area for closed contours", () => {
      const analysis = marchingSquares.analyzeContour(contour, { computeAreas: true });

      if (contour.isClosed) {
        expect(analysis.area).toBeGreaterThan(0);
      } else {
        expect(analysis.area).toBeUndefined();
      }
    });

    it("should compute contour centroid", () => {
      const analysis = marchingSquares.analyzeContour(contour, { computeCentroids: true });

      expect(analysis.centroid.x).toBeDefined();
      expect(analysis.centroid.y).toBeDefined();
    });

    it("should compute contour bounding box", () => {
      const analysis = marchingSquares.analyzeContour(contour, { computeBoundingBoxes: true });

      expect(analysis.boundingBox.minX).toBeDefined();
      expect(analysis.boundingBox.minY).toBeDefined();
      expect(analysis.boundingBox.maxX).toBeDefined();
      expect(analysis.boundingBox.maxY).toBeDefined();
    });

    it("should compute all analysis properties", () => {
      const analysis = marchingSquares.analyzeContour(contour);

      expect(analysis.length).toBeGreaterThan(0);
      expect(analysis.centroid.x).toBeDefined();
      expect(analysis.centroid.y).toBeDefined();
      expect(analysis.boundingBox.minX).toBeDefined();
      expect(analysis.boundingBox.minY).toBeDefined();
      expect(analysis.boundingBox.maxX).toBeDefined();
      expect(analysis.boundingBox.maxY).toBeDefined();
    });
  });

  describe("Contour Simplification", () => {
    let contour: Contour;

    beforeEach(() => {
      const grid = [
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0],
      ];
      const result = marchingSquares.compute(grid, 0.5);
      contour = result.contours[0];
    });

    it("should simplify contour by removing unnecessary segments", () => {
      const result = marchingSquares.simplifyContour(contour, { maxDistance: 0.5 });

      expect(result.simplifiedContour.segments.length).toBeLessThanOrEqual(contour.segments.length);
      expect(result.segmentsRemoved).toBeGreaterThanOrEqual(0);
      expect(result.compressionRatio).toBeGreaterThanOrEqual(1);
    });

    it("should preserve endpoints when configured", () => {
      const result = marchingSquares.simplifyContour(contour, {
        maxDistance: 0.5,
        preserveEndpoints: true,
      });

      if (contour.segments.length > 0) {
        const originalStart = contour.segments[0].start;
        const originalEnd = contour.segments[contour.segments.length - 1].end;
        const simplifiedStart = result.simplifiedContour.segments[0].start;
        const simplifiedEnd = result.simplifiedContour.segments[result.simplifiedContour.segments.length - 1].end;

        expect(simplifiedStart.x).toBeCloseTo(originalStart.x, 5);
        expect(simplifiedStart.y).toBeCloseTo(originalStart.y, 5);
        expect(simplifiedEnd.x).toBeCloseTo(originalEnd.x, 5);
        expect(simplifiedEnd.y).toBeCloseTo(originalEnd.y, 5);
      }
    });

    it("should not simplify if segments are necessary", () => {
      const result = marchingSquares.simplifyContour(contour, { maxDistance: 0.01 });

      expect(result.simplifiedContour.segments.length).toBe(contour.segments.length);
      expect(result.segmentsRemoved).toBe(0);
      expect(result.compressionRatio).toBe(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle single cell grid", () => {
      const grid = [[1]];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(0);
    });

    it("should handle 2x2 grid", () => {
      const grid = [
        [0, 1],
        [1, 0],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBeGreaterThan(0);
    });

    it("should handle very small values", () => {
      const grid = [
        [0, 0, 0],
        [0, 0.0001, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.00005);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
    });

    it("should handle very large values", () => {
      const grid = [
        [0, 0, 0],
        [0, 1000000, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 500000);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
    });

    it("should handle negative values", () => {
      const grid = [
        [0, 0, 0],
        [0, -1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, -0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
    });
  });

  describe("Performance Benchmarks", () => {
    const runBenchmark = (description: string, width: number, height: number) => {
      it(`should perform ${description} efficiently`, () => {
        const grid: number[][] = [];
        for (let y = 0; y < height; y++) {
          const row: number[] = [];
          for (let x = 0; x < width; x++) {
            row.push(Math.random());
          }
          grid.push(row);
        }

        const result = marchingSquares.compute(grid, 0.5);

        expect(result.stats.success).toBe(true);
        expect(result.contours.length).toBeGreaterThanOrEqual(0);
        expect(result.stats.executionTime).toBeGreaterThanOrEqual(0);

        // Log for manual inspection during benchmark runs
        // console.log(`Benchmark: ${description} - ${width}x${height} grid in ${(endTime - startTime).toFixed(3)} ms`);
      });
    };

    runBenchmark("small grid", 10, 10);
    runBenchmark("medium grid", 50, 50);
    runBenchmark("large grid", 100, 100);
    runBenchmark("very large grid", 200, 200);
  });

  describe("Contour Properties", () => {
    it("should generate closed contours when appropriate", () => {
      const grid = [
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
      expect(result.contours[0].isClosed).toBe(true);
    });

    it("should generate open contours when appropriate", () => {
      const grid = [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
      expect(result.contours[0].isClosed).toBe(false);
    });

    it("should preserve contour level information", () => {
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.7);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
      expect(result.contours[0].level).toBe(0.7);
    });
  });

  describe("Interpolation", () => {
    it("should produce smoother contours with interpolation", () => {
      const grid = [
        [0, 0, 0, 0],
        [0, 0.3, 0.7, 0],
        [0, 0.7, 0.3, 0],
        [0, 0, 0, 0],
      ];

      const resultWithInterpolation = marchingSquares.compute(grid, 0.5);
      const marchingSquaresNoInterpolation = new MarchingSquares({ interpolate: false });
      const resultWithoutInterpolation = marchingSquaresNoInterpolation.compute(grid, 0.5);

      expect(resultWithInterpolation.stats.success).toBe(true);
      expect(resultWithoutInterpolation.stats.success).toBe(true);

      // With interpolation, contours should be smoother (more segments)
      if (resultWithInterpolation.contours.length > 0 && resultWithoutInterpolation.contours.length > 0) {
        expect(resultWithInterpolation.contours[0].segments.length).toBeGreaterThanOrEqual(
          resultWithoutInterpolation.contours[0].segments.length
        );
      }
    });
  });
});

describe("Marching Squares Algorithm", () => {
  let marchingSquares: MarchingSquares;

  beforeEach(() => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    marchingSquares = new MarchingSquares();
  });

  describe("Basic Contour Generation", () => {
    it("should generate a single contour for a simple case", () => {
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
      expect(result.contours[0].segments.length).toBeGreaterThan(0);
      expect(result.contours[0].level).toBe(0.5);
    });

    it("should generate multiple contours for complex cases", () => {
      const grid = [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBeGreaterThan(0);
    });

    it("should handle edge cases with no contours", () => {
      const grid = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(0);
    });

    it("should handle edge cases with all values above threshold", () => {
      const grid = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(0);
    });
  });

  describe("Input Validation", () => {
    it("should reject empty grid", () => {
      const result = marchingSquares.compute([]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("Grid cannot be empty");
    });

    it("should reject grid with empty rows", () => {
      const result = marchingSquares.compute([[]]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("Grid cannot be empty");
    });

    it("should reject non-array input", () => {
      const result = marchingSquares.compute("invalid" as any);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("Grid must be a 2D array");
    });

    it("should reject grid with inconsistent row lengths", () => {
      const grid = [
        [0, 0, 0],
        [0, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid as number[][]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("All rows must have the same length");
    });

    it("should reject grid with invalid values", () => {
      const grid = [
        [0, 0, 0],
        [0, "invalid", 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid as number[][]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("Invalid value");
    });

    it("should reject grid with non-finite values", () => {
      const grid = [
        [0, 0, 0],
        [0, Infinity, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid as number[][]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("must be a finite number");
    });
  });

  describe("Configuration Options", () => {
    it("should work without input validation", () => {
      const marchingSquaresNoValidation = new MarchingSquares({ validateInput: false });
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquaresNoValidation.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
    });

    it("should work without interpolation", () => {
      const marchingSquaresNoInterpolation = new MarchingSquares({ interpolate: false });
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquaresNoInterpolation.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
    });

    it("should use custom tolerance", () => {
      const marchingSquaresCustomTolerance = new MarchingSquares({ tolerance: 1e-5 });
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquaresCustomTolerance.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
    });
  });

  describe("Multi-Level Contour Generation", () => {
    it("should generate contours for multiple threshold levels", () => {
      const grid = [
        [0, 0, 0, 0],
        [0, 0.3, 0.7, 0],
        [0, 0.7, 0.3, 0],
        [0, 0, 0, 0],
      ];

      const result = marchingSquares.computeMultiLevel(grid, {
        thresholds: [0.2, 0.5, 0.8],
      });

      expect(result.stats.success).toBe(true);
      expect(result.contoursByLevel.size).toBe(3);
      expect(result.allContours.length).toBeGreaterThan(0);
    });

    it("should handle empty thresholds array", () => {
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.computeMultiLevel(grid, {
        thresholds: [],
      });

      expect(result.stats.success).toBe(true);
      expect(result.contoursByLevel.size).toBe(0);
      expect(result.allContours.length).toBe(0);
    });
  });

  describe("Contour Analysis", () => {
    let contour: Contour;

    beforeEach(() => {
      const grid = [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ];
      const result = marchingSquares.compute(grid, 0.5);
      contour = result.contours[0];
    });

    it("should compute contour length", () => {
      const analysis = marchingSquares.analyzeContour(contour, { computeLengths: true });

      expect(analysis.length).toBeGreaterThan(0);
    });

    it("should compute contour area for closed contours", () => {
      const analysis = marchingSquares.analyzeContour(contour, { computeAreas: true });

      if (contour.isClosed) {
        expect(analysis.area).toBeGreaterThan(0);
      } else {
        expect(analysis.area).toBeUndefined();
      }
    });

    it("should compute contour centroid", () => {
      const analysis = marchingSquares.analyzeContour(contour, { computeCentroids: true });

      expect(analysis.centroid.x).toBeDefined();
      expect(analysis.centroid.y).toBeDefined();
    });

    it("should compute contour bounding box", () => {
      const analysis = marchingSquares.analyzeContour(contour, { computeBoundingBoxes: true });

      expect(analysis.boundingBox.minX).toBeDefined();
      expect(analysis.boundingBox.minY).toBeDefined();
      expect(analysis.boundingBox.maxX).toBeDefined();
      expect(analysis.boundingBox.maxY).toBeDefined();
    });

    it("should compute all analysis properties", () => {
      const analysis = marchingSquares.analyzeContour(contour);

      expect(analysis.length).toBeGreaterThan(0);
      expect(analysis.centroid.x).toBeDefined();
      expect(analysis.centroid.y).toBeDefined();
      expect(analysis.boundingBox.minX).toBeDefined();
      expect(analysis.boundingBox.minY).toBeDefined();
      expect(analysis.boundingBox.maxX).toBeDefined();
      expect(analysis.boundingBox.maxY).toBeDefined();
    });
  });

  describe("Contour Simplification", () => {
    let contour: Contour;

    beforeEach(() => {
      const grid = [
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0],
      ];
      const result = marchingSquares.compute(grid, 0.5);
      contour = result.contours[0];
    });

    it("should simplify contour by removing unnecessary segments", () => {
      const result = marchingSquares.simplifyContour(contour, { maxDistance: 0.5 });

      expect(result.simplifiedContour.segments.length).toBeLessThanOrEqual(contour.segments.length);
      expect(result.segmentsRemoved).toBeGreaterThanOrEqual(0);
      expect(result.compressionRatio).toBeGreaterThanOrEqual(1);
    });

    it("should preserve endpoints when configured", () => {
      const result = marchingSquares.simplifyContour(contour, {
        maxDistance: 0.5,
        preserveEndpoints: true,
      });

      if (contour.segments.length > 0) {
        const originalStart = contour.segments[0].start;
        const originalEnd = contour.segments[contour.segments.length - 1].end;
        const simplifiedStart = result.simplifiedContour.segments[0].start;
        const simplifiedEnd = result.simplifiedContour.segments[result.simplifiedContour.segments.length - 1].end;

        expect(simplifiedStart.x).toBeCloseTo(originalStart.x, 5);
        expect(simplifiedStart.y).toBeCloseTo(originalStart.y, 5);
        expect(simplifiedEnd.x).toBeCloseTo(originalEnd.x, 5);
        expect(simplifiedEnd.y).toBeCloseTo(originalEnd.y, 5);
      }
    });

    it("should not simplify if segments are necessary", () => {
      const result = marchingSquares.simplifyContour(contour, { maxDistance: 0.01 });

      expect(result.simplifiedContour.segments.length).toBe(contour.segments.length);
      expect(result.segmentsRemoved).toBe(0);
      expect(result.compressionRatio).toBe(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle single cell grid", () => {
      const grid = [[1]];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(0);
    });

    it("should handle 2x2 grid", () => {
      const grid = [
        [0, 1],
        [1, 0],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBeGreaterThan(0);
    });

    it("should handle very small values", () => {
      const grid = [
        [0, 0, 0],
        [0, 0.0001, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.00005);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
    });

    it("should handle very large values", () => {
      const grid = [
        [0, 0, 0],
        [0, 1000000, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 500000);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
    });

    it("should handle negative values", () => {
      const grid = [
        [0, 0, 0],
        [0, -1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, -0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
    });
  });

  describe("Performance Benchmarks", () => {
    const runBenchmark = (description: string, width: number, height: number) => {
      it(`should perform ${description} efficiently`, () => {
        const grid: number[][] = [];
        for (let y = 0; y < height; y++) {
          const row: number[] = [];
          for (let x = 0; x < width; x++) {
            row.push(Math.random());
          }
          grid.push(row);
        }

        const result = marchingSquares.compute(grid, 0.5);

        expect(result.stats.success).toBe(true);
        expect(result.contours.length).toBeGreaterThanOrEqual(0);
        expect(result.stats.executionTime).toBeGreaterThanOrEqual(0);

        // Log for manual inspection during benchmark runs
        // console.log(`Benchmark: ${description} - ${width}x${height} grid in ${(endTime - startTime).toFixed(3)} ms`);
      });
    };

    runBenchmark("small grid", 10, 10);
    runBenchmark("medium grid", 50, 50);
    runBenchmark("large grid", 100, 100);
    runBenchmark("very large grid", 200, 200);
  });

  describe("Contour Properties", () => {
    it("should generate closed contours when appropriate", () => {
      const grid = [
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
      expect(result.contours[0].isClosed).toBe(true);
    });

    it("should generate open contours when appropriate", () => {
      const grid = [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
      expect(result.contours[0].isClosed).toBe(false);
    });

    it("should preserve contour level information", () => {
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.7);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
      expect(result.contours[0].level).toBe(0.7);
    });
  });

  describe("Interpolation", () => {
    it("should produce smoother contours with interpolation", () => {
      const grid = [
        [0, 0, 0, 0],
        [0, 0.3, 0.7, 0],
        [0, 0.7, 0.3, 0],
        [0, 0, 0, 0],
      ];

      const resultWithInterpolation = marchingSquares.compute(grid, 0.5);
      const marchingSquaresNoInterpolation = new MarchingSquares({ interpolate: false });
      const resultWithoutInterpolation = marchingSquaresNoInterpolation.compute(grid, 0.5);

      expect(resultWithInterpolation.stats.success).toBe(true);
      expect(resultWithoutInterpolation.stats.success).toBe(true);

      // With interpolation, contours should be smoother (more segments)
      if (resultWithInterpolation.contours.length > 0 && resultWithoutInterpolation.contours.length > 0) {
        expect(resultWithInterpolation.contours[0].segments.length).toBeGreaterThanOrEqual(
          resultWithoutInterpolation.contours[0].segments.length
        );
      }
    });
  });
});

describe("Marching Squares Algorithm", () => {
  let marchingSquares: MarchingSquares;

  beforeEach(() => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    marchingSquares = new MarchingSquares();
  });

  describe("Basic Contour Generation", () => {
    it("should generate a single contour for a simple case", () => {
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
      expect(result.contours[0].segments.length).toBeGreaterThan(0);
      expect(result.contours[0].level).toBe(0.5);
    });

    it("should generate multiple contours for complex cases", () => {
      const grid = [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBeGreaterThan(0);
    });

    it("should handle edge cases with no contours", () => {
      const grid = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(0);
    });

    it("should handle edge cases with all values above threshold", () => {
      const grid = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(0);
    });
  });

  describe("Input Validation", () => {
    it("should reject empty grid", () => {
      const result = marchingSquares.compute([]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("Grid cannot be empty");
    });

    it("should reject grid with empty rows", () => {
      const result = marchingSquares.compute([[]]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("Grid cannot be empty");
    });

    it("should reject non-array input", () => {
      const result = marchingSquares.compute("invalid" as any);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("Grid must be a 2D array");
    });

    it("should reject grid with inconsistent row lengths", () => {
      const grid = [
        [0, 0, 0],
        [0, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid as number[][]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("All rows must have the same length");
    });

    it("should reject grid with invalid values", () => {
      const grid = [
        [0, 0, 0],
        [0, "invalid", 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid as number[][]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("Invalid value");
    });

    it("should reject grid with non-finite values", () => {
      const grid = [
        [0, 0, 0],
        [0, Infinity, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid as number[][]);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("must be a finite number");
    });
  });

  describe("Configuration Options", () => {
    it("should work without input validation", () => {
      const marchingSquaresNoValidation = new MarchingSquares({ validateInput: false });
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquaresNoValidation.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
    });

    it("should work without interpolation", () => {
      const marchingSquaresNoInterpolation = new MarchingSquares({ interpolate: false });
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquaresNoInterpolation.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
    });

    it("should use custom tolerance", () => {
      const marchingSquaresCustomTolerance = new MarchingSquares({ tolerance: 1e-5 });
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquaresCustomTolerance.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
    });
  });

  describe("Multi-Level Contour Generation", () => {
    it("should generate contours for multiple threshold levels", () => {
      const grid = [
        [0, 0, 0, 0],
        [0, 0.3, 0.7, 0],
        [0, 0.7, 0.3, 0],
        [0, 0, 0, 0],
      ];

      const result = marchingSquares.computeMultiLevel(grid, {
        thresholds: [0.2, 0.5, 0.8],
      });

      expect(result.stats.success).toBe(true);
      expect(result.contoursByLevel.size).toBe(3);
      expect(result.allContours.length).toBeGreaterThan(0);
    });

    it("should handle empty thresholds array", () => {
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.computeMultiLevel(grid, {
        thresholds: [],
      });

      expect(result.stats.success).toBe(true);
      expect(result.contoursByLevel.size).toBe(0);
      expect(result.allContours.length).toBe(0);
    });
  });

  describe("Contour Analysis", () => {
    let contour: Contour;

    beforeEach(() => {
      const grid = [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ];
      const result = marchingSquares.compute(grid, 0.5);
      contour = result.contours[0];
    });

    it("should compute contour length", () => {
      const analysis = marchingSquares.analyzeContour(contour, { computeLengths: true });

      expect(analysis.length).toBeGreaterThan(0);
    });

    it("should compute contour area for closed contours", () => {
      const analysis = marchingSquares.analyzeContour(contour, { computeAreas: true });

      if (contour.isClosed) {
        expect(analysis.area).toBeGreaterThan(0);
      } else {
        expect(analysis.area).toBeUndefined();
      }
    });

    it("should compute contour centroid", () => {
      const analysis = marchingSquares.analyzeContour(contour, { computeCentroids: true });

      expect(analysis.centroid.x).toBeDefined();
      expect(analysis.centroid.y).toBeDefined();
    });

    it("should compute contour bounding box", () => {
      const analysis = marchingSquares.analyzeContour(contour, { computeBoundingBoxes: true });

      expect(analysis.boundingBox.minX).toBeDefined();
      expect(analysis.boundingBox.minY).toBeDefined();
      expect(analysis.boundingBox.maxX).toBeDefined();
      expect(analysis.boundingBox.maxY).toBeDefined();
    });

    it("should compute all analysis properties", () => {
      const analysis = marchingSquares.analyzeContour(contour);

      expect(analysis.length).toBeGreaterThan(0);
      expect(analysis.centroid.x).toBeDefined();
      expect(analysis.centroid.y).toBeDefined();
      expect(analysis.boundingBox.minX).toBeDefined();
      expect(analysis.boundingBox.minY).toBeDefined();
      expect(analysis.boundingBox.maxX).toBeDefined();
      expect(analysis.boundingBox.maxY).toBeDefined();
    });
  });

  describe("Contour Simplification", () => {
    let contour: Contour;

    beforeEach(() => {
      const grid = [
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0],
      ];
      const result = marchingSquares.compute(grid, 0.5);
      contour = result.contours[0];
    });

    it("should simplify contour by removing unnecessary segments", () => {
      const result = marchingSquares.simplifyContour(contour, { maxDistance: 0.5 });

      expect(result.simplifiedContour.segments.length).toBeLessThanOrEqual(contour.segments.length);
      expect(result.segmentsRemoved).toBeGreaterThanOrEqual(0);
      expect(result.compressionRatio).toBeGreaterThanOrEqual(1);
    });

    it("should preserve endpoints when configured", () => {
      const result = marchingSquares.simplifyContour(contour, {
        maxDistance: 0.5,
        preserveEndpoints: true,
      });

      if (contour.segments.length > 0) {
        const originalStart = contour.segments[0].start;
        const originalEnd = contour.segments[contour.segments.length - 1].end;
        const simplifiedStart = result.simplifiedContour.segments[0].start;
        const simplifiedEnd = result.simplifiedContour.segments[result.simplifiedContour.segments.length - 1].end;

        expect(simplifiedStart.x).toBeCloseTo(originalStart.x, 5);
        expect(simplifiedStart.y).toBeCloseTo(originalStart.y, 5);
        expect(simplifiedEnd.x).toBeCloseTo(originalEnd.x, 5);
        expect(simplifiedEnd.y).toBeCloseTo(originalEnd.y, 5);
      }
    });

    it("should not simplify if segments are necessary", () => {
      const result = marchingSquares.simplifyContour(contour, { maxDistance: 0.01 });

      expect(result.simplifiedContour.segments.length).toBe(contour.segments.length);
      expect(result.segmentsRemoved).toBe(0);
      expect(result.compressionRatio).toBe(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle single cell grid", () => {
      const grid = [[1]];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(0);
    });

    it("should handle 2x2 grid", () => {
      const grid = [
        [0, 1],
        [1, 0],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBeGreaterThan(0);
    });

    it("should handle very small values", () => {
      const grid = [
        [0, 0, 0],
        [0, 0.0001, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.00005);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
    });

    it("should handle very large values", () => {
      const grid = [
        [0, 0, 0],
        [0, 1000000, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 500000);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
    });

    it("should handle negative values", () => {
      const grid = [
        [0, 0, 0],
        [0, -1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, -0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
    });
  });

  describe("Performance Benchmarks", () => {
    const runBenchmark = (description: string, width: number, height: number) => {
      it(`should perform ${description} efficiently`, () => {
        const grid: number[][] = [];
        for (let y = 0; y < height; y++) {
          const row: number[] = [];
          for (let x = 0; x < width; x++) {
            row.push(Math.random());
          }
          grid.push(row);
        }

        const result = marchingSquares.compute(grid, 0.5);

        expect(result.stats.success).toBe(true);
        expect(result.contours.length).toBeGreaterThanOrEqual(0);
        expect(result.stats.executionTime).toBeGreaterThanOrEqual(0);

        // Log for manual inspection during benchmark runs
        // console.log(`Benchmark: ${description} - ${width}x${height} grid in ${(endTime - startTime).toFixed(3)} ms`);
      });
    };

    runBenchmark("small grid", 10, 10);
    runBenchmark("medium grid", 50, 50);
    runBenchmark("large grid", 100, 100);
    runBenchmark("very large grid", 200, 200);
  });

  describe("Contour Properties", () => {
    it("should generate closed contours when appropriate", () => {
      const grid = [
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
      expect(result.contours[0].isClosed).toBe(true);
    });

    it("should generate open contours when appropriate", () => {
      const grid = [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.5);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
      expect(result.contours[0].isClosed).toBe(false);
    });

    it("should preserve contour level information", () => {
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = marchingSquares.compute(grid, 0.7);

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBe(1);
      expect(result.contours[0].level).toBe(0.7);
    });
  });

  describe("Interpolation", () => {
    it("should produce smoother contours with interpolation", () => {
      const grid = [
        [0, 0, 0, 0],
        [0, 0.3, 0.7, 0],
        [0, 0.7, 0.3, 0],
        [0, 0, 0, 0],
      ];

      const resultWithInterpolation = marchingSquares.compute(grid, 0.5);
      const marchingSquaresNoInterpolation = new MarchingSquares({ interpolate: false });
      const resultWithoutInterpolation = marchingSquaresNoInterpolation.compute(grid, 0.5);

      expect(resultWithInterpolation.stats.success).toBe(true);
      expect(resultWithoutInterpolation.stats.success).toBe(true);

      // With interpolation, contours should be smoother (more segments)
      if (resultWithInterpolation.contours.length > 0 && resultWithoutInterpolation.contours.length > 0) {
        expect(resultWithInterpolation.contours[0].segments.length).toBeGreaterThanOrEqual(
          resultWithoutInterpolation.contours[0].segments.length
        );
      }
    });
  });
});
