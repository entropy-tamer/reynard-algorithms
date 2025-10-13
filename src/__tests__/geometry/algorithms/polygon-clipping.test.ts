/**
 * @module algorithms/geometry/algorithms/polygon-clipping/tests
 * @description Unit tests for polygon clipping algorithms.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { PolygonClipping, SutherlandHodgmanClipper, WeilerAthertonClipper } from "../../../geometry/algorithms/polygon-clipping/polygon-clipping-core";
import { ClipOperation } from "../../../geometry/algorithms/polygon-clipping/polygon-clipping-types";
import type { Polygon } from "../../../geometry/algorithms/polygon-clipping/polygon-clipping-types";

describe("PolygonClipping", () => {
  let clipper: PolygonClipping;

  beforeEach(() => {
    clipper = new PolygonClipping();
  });

  describe("Basic Functionality", () => {
    it("should create an instance with default configuration", () => {
      expect(clipper).toBeInstanceOf(PolygonClipping);
      const config = clipper.getConfig();
      expect(config.tolerance).toBe(1e-10);
      expect(config.validateInput).toBe(true);
      expect(config.removeDuplicates).toBe(true);
    });

    it("should create an instance with custom configuration", () => {
      const customClipper = new PolygonClipping({
        tolerance: 1e-6,
        validateInput: false,
        simplifyResult: true,
      });
      const config = customClipper.getConfig();
      expect(config.tolerance).toBe(1e-6);
      expect(config.validateInput).toBe(false);
      expect(config.simplifyResult).toBe(true);
    });

    it("should update configuration", () => {
      clipper.updateConfig({ tolerance: 1e-8 });
      const config = clipper.getConfig();
      expect(config.tolerance).toBe(1e-8);
    });
  });

  describe("Input Validation", () => {
    it("should validate polygon structure", () => {
      const invalidPolygon = { vertices: [] } as Polygon;
      const result = clipper.validatePolygon(invalidPolygon, "test");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("test polygon must have at least 3 vertices");
    });

    it("should validate vertex properties", () => {
      const invalidPolygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: "invalid", y: 0 } as any,
        ],
      } as Polygon;
      const result = clipper.validatePolygon(invalidPolygon, "test");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("test polygon vertex 1 must have x and y properties");
    });

    it("should detect duplicate vertices", () => {
      const polygonWithDuplicates = {
        vertices: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: 0 }, // Duplicate
        ],
      } as Polygon;
      const result = clipper.validatePolygon(polygonWithDuplicates, "test");
      expect(result.hasDuplicates).toBe(true);
      expect(result.warnings).toContain("test polygon has duplicate vertices");
    });

    it("should detect collinear vertices", () => {
      const collinearPolygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 }, // Collinear
        ],
      } as Polygon;
      const result = clipper.validatePolygon(collinearPolygon, "test");
      expect(result.hasCollinear).toBe(true);
      expect(result.warnings).toContain("test polygon has collinear vertices");
    });
  });

  describe("Sutherland-Hodgman Clipping", () => {
    it("should clip triangle against square (intersection)", () => {
      const subject: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 2, y: 0 },
          { x: 1, y: 2 },
        ],
      };
      const clipping: Polygon = {
        vertices: [
          { x: 0.5, y: 0.5 },
          { x: 1.5, y: 0.5 },
          { x: 1.5, y: 1.5 },
          { x: 0.5, y: 1.5 },
        ],
      };

      const result = clipper.clipConvex(subject, clipping);

      expect(result.stats.success).toBe(true);
      expect(result.stats.algorithm).toBe("sutherland-hodgman");
      expect(result.polygons.length).toBeGreaterThan(0);
    });

    it("should handle no intersection case", () => {
      const subject: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0.5, y: 1 },
        ],
      };
      const clipping: Polygon = {
        vertices: [
          { x: 5, y: 5 },
          { x: 6, y: 5 },
          { x: 6, y: 6 },
          { x: 5, y: 6 },
        ],
      };

      const result = clipper.clipConvex(subject, clipping);

      expect(result.stats.success).toBe(true);
      expect(result.isEmpty).toBe(true);
      expect(result.polygons.length).toBe(0);
    });

    it("should handle complete containment", () => {
      const subject: Polygon = {
        vertices: [
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 1.5, y: 2 },
        ],
      };
      const clipping: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 3, y: 0 },
          { x: 3, y: 3 },
          { x: 0, y: 3 },
        ],
      };

      const result = clipper.clipConvex(subject, clipping);

      expect(result.stats.success).toBe(true);
      expect(result.polygons.length).toBe(1);
      expect(result.polygons[0].vertices.length).toBe(3);
    });

    it("should throw error for non-convex clipping polygon", () => {
      const subject: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 2, y: 0 },
          { x: 1, y: 2 },
        ],
      };
      const nonConvexClipping: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 2, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 2 },
          { x: 0, y: 2 },
        ],
      };

      expect(() => clipper.clipConvex(subject, nonConvexClipping)).toThrow("Clipping polygon must be convex");
    });
  });

  describe("Weiler-Atherton Clipping", () => {
    it("should perform intersection operation", () => {
      const subject: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 3, y: 0 },
          { x: 3, y: 3 },
          { x: 0, y: 3 },
        ],
      };
      const clipping: Polygon = {
        vertices: [
          { x: 1, y: 1 },
          { x: 4, y: 1 },
          { x: 4, y: 4 },
          { x: 1, y: 4 },
        ],
      };

      const result = clipper.clipGeneral(subject, clipping, ClipOperation.INTERSECTION);

      expect(result.stats.success).toBe(true);
      expect(result.stats.algorithm).toBe("weiler-atherton");
      expect(result.polygons.length).toBeGreaterThan(0);
    });

    it("should perform union operation", () => {
      const subject: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 2, y: 0 },
          { x: 2, y: 2 },
          { x: 0, y: 2 },
        ],
      };
      const clipping: Polygon = {
        vertices: [
          { x: 1, y: 1 },
          { x: 3, y: 1 },
          { x: 3, y: 3 },
          { x: 1, y: 3 },
        ],
      };

      const result = clipper.clipGeneral(subject, clipping, ClipOperation.UNION);

      expect(result.stats.success).toBe(true);
      expect(result.polygons.length).toBeGreaterThan(0);
    });

    it("should perform difference operation", () => {
      const subject: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 3, y: 0 },
          { x: 3, y: 3 },
          { x: 0, y: 3 },
        ],
      };
      const clipping: Polygon = {
        vertices: [
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 2, y: 2 },
          { x: 1, y: 2 },
        ],
      };

      const result = clipper.clipGeneral(subject, clipping, ClipOperation.DIFFERENCE);

      expect(result.stats.success).toBe(true);
      expect(result.polygons.length).toBeGreaterThan(0);
    });

    it("should perform XOR operation", () => {
      const subject: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 2, y: 0 },
          { x: 2, y: 2 },
          { x: 0, y: 2 },
        ],
      };
      const clipping: Polygon = {
        vertices: [
          { x: 1, y: 1 },
          { x: 3, y: 1 },
          { x: 3, y: 3 },
          { x: 1, y: 3 },
        ],
      };

      const result = clipper.clipGeneral(subject, clipping, ClipOperation.XOR);

      expect(result.stats.success).toBe(true);
      expect(result.polygons.length).toBeGreaterThan(0);
    });
  });

  describe("Automatic Algorithm Selection", () => {
    it("should select Sutherland-Hodgman for convex intersection", () => {
      const subject: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 2, y: 0 },
          { x: 1, y: 2 },
        ],
      };
      const convexClipping: Polygon = {
        vertices: [
          { x: 0.5, y: 0.5 },
          { x: 1.5, y: 0.5 },
          { x: 1.5, y: 1.5 },
          { x: 0.5, y: 1.5 },
        ],
      };

      const result = clipper.intersection(subject, convexClipping);

      expect(result.stats.success).toBe(true);
      expect(result.stats.algorithm).toBe("sutherland-hodgman");
    });

    it("should select Weiler-Atherton for non-convex clipping", () => {
      const subject: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 2, y: 0 },
          { x: 1, y: 2 },
        ],
      };
      const nonConvexClipping: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 2, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 2 },
          { x: 0, y: 2 },
        ],
      };

      const result = clipper.intersection(subject, nonConvexClipping);

      expect(result.stats.success).toBe(true);
      expect(result.stats.algorithm).toBe("weiler-atherton");
    });

    it("should select Weiler-Atherton for union operation", () => {
      const subject: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 2, y: 0 },
          { x: 1, y: 2 },
        ],
      };
      const clipping: Polygon = {
        vertices: [
          { x: 1, y: 1 },
          { x: 3, y: 1 },
          { x: 2, y: 3 },
        ],
      };

      const result = clipper.union(subject, clipping);

      expect(result.stats.success).toBe(true);
      expect(result.stats.algorithm).toBe("weiler-atherton");
    });
  });

  describe("Convenience Methods", () => {
    it("should provide intersection method", () => {
      const subject: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 2, y: 0 },
          { x: 1, y: 2 },
        ],
      };
      const clipping: Polygon = {
        vertices: [
          { x: 0.5, y: 0.5 },
          { x: 1.5, y: 0.5 },
          { x: 1.5, y: 1.5 },
          { x: 0.5, y: 1.5 },
        ],
      };

      const result = clipper.intersection(subject, clipping);

      expect(result.stats.success).toBe(true);
    });

    it("should provide union method", () => {
      const subject: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 2, y: 0 },
          { x: 1, y: 2 },
        ],
      };
      const clipping: Polygon = {
        vertices: [
          { x: 1, y: 1 },
          { x: 3, y: 1 },
          { x: 2, y: 3 },
        ],
      };

      const result = clipper.union(subject, clipping);

      expect(result.stats.success).toBe(true);
    });

    it("should provide difference method", () => {
      const subject: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 3, y: 0 },
          { x: 3, y: 3 },
          { x: 0, y: 3 },
        ],
      };
      const clipping: Polygon = {
        vertices: [
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 2, y: 2 },
          { x: 1, y: 2 },
        ],
      };

      const result = clipper.difference(subject, clipping);

      expect(result.stats.success).toBe(true);
    });

    it("should provide XOR method", () => {
      const subject: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 2, y: 0 },
          { x: 2, y: 2 },
          { x: 0, y: 2 },
        ],
      };
      const clipping: Polygon = {
        vertices: [
          { x: 1, y: 1 },
          { x: 3, y: 1 },
          { x: 3, y: 3 },
          { x: 1, y: 3 },
        ],
      };

      const result = clipper.xor(subject, clipping);

      expect(result.stats.success).toBe(true);
    });
  });

  describe("Polygon Simplification", () => {
    it("should simplify polygon by removing duplicates", () => {
      const polygonWithDuplicates: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 1, y: 0 }, // Duplicate
          { x: 1, y: 1 },
          { x: 0, y: 1 },
        ],
      };

      const simplified = clipper.simplifyPolygon(polygonWithDuplicates);

      expect(simplified.vertices.length).toBe(4);
      expect(simplified.vertices).toEqual([
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ]);
    });

    it("should simplify polygon by removing collinear vertices", () => {
      const collinearPolygon: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 }, // Collinear
          { x: 2, y: 1 },
          { x: 0, y: 1 },
        ],
      };

      const simplified = clipper.simplifyPolygon(collinearPolygon, {
        removeCollinear: true,
        collinearTolerance: 1e-6,
      });

      expect(simplified.vertices.length).toBe(4);
    });

    it("should ensure counter-clockwise orientation", () => {
      const clockwisePolygon: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
          { x: 1, y: 0 },
        ],
      };

      const reoriented = clipper.simplifyPolygon(clockwisePolygon, {
        ensureOrientation: true,
      });

      // The polygon should be reoriented to counter-clockwise
      expect(reoriented.vertices).toEqual([
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ]);
    });
  });

  describe("Serialization", () => {
    it("should serialize polygon", () => {
      const polygon: Polygon = {
        vertices: [
          { x: 0.123456789, y: 0.987654321 },
          { x: 1.111111111, y: 0.222222222 },
          { x: 0.555555555, y: 1.777777777 },
        ],
      };

      const serialized = clipper.serialize(polygon, { precision: 3 });

      expect(serialized.vertices[0].x).toBe(0.123);
      expect(serialized.vertices[0].y).toBe(0.988);
      expect(serialized.vertices[1].x).toBe(1.111);
      expect(serialized.vertices[1].y).toBe(0.222);
    });

    it("should include validation in serialization", () => {
      const polygon: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: 0 }, // Duplicate
        ],
      };

      const serialized = clipper.serialize(polygon, {
        includeValidation: true,
      });

      expect(serialized.validation).toBeDefined();
      expect(serialized.validation!.hasDuplicates).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty result", () => {
      const subject: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0.5, y: 1 },
        ],
      };
      const clipping: Polygon = {
        vertices: [
          { x: 5, y: 5 },
          { x: 6, y: 5 },
          { x: 5.5, y: 6 },
        ],
      };

      const result = clipper.intersection(subject, clipping);

      expect(result.stats.success).toBe(true);
      expect(result.isEmpty).toBe(true);
      expect(result.polygons.length).toBe(0);
    });

    it("should handle single vertex result", () => {
      const subject: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 2, y: 0 },
          { x: 1, y: 2 },
        ],
      };
      const clipping: Polygon = {
        vertices: [
          { x: 1, y: 0 },
          { x: 3, y: 0 },
          { x: 2, y: 2 },
        ],
      };

      const result = clipper.intersection(subject, clipping);

      expect(result.stats.success).toBe(true);
      // Result might be empty or have very few vertices
    });

    it("should handle validation disabled", () => {
      const clipperNoValidation = new PolygonClipping({ validateInput: false });
      const invalidPolygon = { vertices: [] } as Polygon;
      const clipping = {
        vertices: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0.5, y: 1 },
        ],
      } as Polygon;

      const result = clipperNoValidation.intersection(invalidPolygon, clipping);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("Subject polygon must have at least 3 vertices");
    });
  });
});

describe("SutherlandHodgmanClipper", () => {
  let clipper: SutherlandHodgmanClipper;

  beforeEach(() => {
    clipper = new SutherlandHodgmanClipper();
  });

  describe("Basic Functionality", () => {
    it("should create an instance", () => {
      expect(clipper).toBeInstanceOf(SutherlandHodgmanClipper);
    });

    it("should clip triangle against square", () => {
      const subject: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 2, y: 0 },
          { x: 1, y: 2 },
        ],
      };
      const clipping: Polygon = {
        vertices: [
          { x: 0.5, y: 0.5 },
          { x: 1.5, y: 0.5 },
          { x: 1.5, y: 1.5 },
          { x: 0.5, y: 1.5 },
        ],
      };

      const result = clipper.clip(subject, clipping);

      expect(result.stats.success).toBe(true);
      expect(result.stats.algorithm).toBe("sutherland-hodgman");
    });
  });
});

describe("WeilerAthertonClipper", () => {
  let clipper: WeilerAthertonClipper;

  beforeEach(() => {
    clipper = new WeilerAthertonClipper();
  });

  describe("Basic Functionality", () => {
    it("should create an instance", () => {
      expect(clipper).toBeInstanceOf(WeilerAthertonClipper);
    });

    it("should perform intersection operation", () => {
      const subject: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 3, y: 0 },
          { x: 3, y: 3 },
          { x: 0, y: 3 },
        ],
      };
      const clipping: Polygon = {
        vertices: [
          { x: 1, y: 1 },
          { x: 4, y: 1 },
          { x: 4, y: 4 },
          { x: 1, y: 4 },
        ],
      };

      const result = clipper.clip(subject, clipping, ClipOperation.INTERSECTION);

      expect(result.stats.success).toBe(true);
      expect(result.stats.algorithm).toBe("weiler-atherton");
    });
  });
});
