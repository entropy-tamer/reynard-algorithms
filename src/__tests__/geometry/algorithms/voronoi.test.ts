/**
 * @module algorithms/geometry/algorithms/voronoi/tests
 * @description Unit tests for Voronoi diagram implementation.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { VoronoiDiagram } from "../../../geometry/algorithms/voronoi/voronoi-core";
import type { Point } from "../../../geometry/algorithms/delaunay/delaunay-types";
import type { VoronoiConfig } from "../../../geometry/algorithms/voronoi/voronoi-types";
import {
  calculateCircumcenter,
  calculatePolygonArea,
  calculatePolygonCentroid,
  isPointInPolygon,
  findNearestSite,
  distance,
  validatePointsForTriangulation,
  createBoundingBox,
  pointsEqual,
} from "../../../geometry/algorithms/voronoi/voronoi-utils";

describe("VoronoiDiagram", () => {
  let voronoi: VoronoiDiagram;

  beforeEach(() => {
    voronoi = new VoronoiDiagram();
  });

  describe("Basic Functionality", () => {
    it("should create an instance with default configuration", () => {
      expect(voronoi).toBeInstanceOf(VoronoiDiagram);
      const config = voronoi.getConfig();
      expect(config.includeUnbounded).toBe(true);
      expect(config.calculateProperties).toBe(true);
      expect(config.tolerance).toBe(1e-10);
    });

    it("should create an instance with custom configuration", () => {
      const customConfig: Partial<VoronoiConfig> = {
        includeUnbounded: false,
        calculateProperties: false,
        tolerance: 1e-6,
      };
      const customVoronoi = new VoronoiDiagram(customConfig);
      const config = customVoronoi.getConfig();
      expect(config.includeUnbounded).toBe(false);
      expect(config.calculateProperties).toBe(false);
      expect(config.tolerance).toBe(1e-6);
    });

    it("should update configuration", () => {
      voronoi.updateConfig({ tolerance: 1e-8 });
      const config = voronoi.getConfig();
      expect(config.tolerance).toBe(1e-8);
    });
  });

  describe("Input Validation", () => {
    it("should throw error for empty sites array", () => {
      expect(() => voronoi.generate([])).toThrow("At least 2 sites are required");
    });

    it("should throw error for single site", () => {
      const sites: Point[] = [{ x: 0, y: 0 }];
      expect(() => voronoi.generate(sites)).toThrow("At least 2 sites are required");
    });

    it("should throw error for invalid site format", () => {
      const invalidSites = [
        { x: 0, y: 0 },
        { x: "invalid", y: 0 } as any,
      ];
      expect(() => voronoi.generate(invalidSites)).toThrow("Invalid site at index 1");
    });

    it("should throw error for non-finite coordinates", () => {
      const invalidSites: Point[] = [
        { x: 0, y: 0 },
        { x: Infinity, y: 0 },
      ];
      expect(() => voronoi.generate(invalidSites)).toThrow("Invalid site at index 1");
    });

    it("should throw error for duplicate sites", () => {
      const duplicateSites: Point[] = [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ];
      expect(() => voronoi.generate(duplicateSites)).toThrow("Duplicate sites at indices 0 and 1");
    });

    it("should handle validation disabled", () => {
      const voronoiNoValidation = new VoronoiDiagram({ validateInput: false });
      const sites: Point[] = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
      const result = voronoiNoValidation.generate(sites);
      expect(result.stats.success).toBe(true);
    });
  });

  describe("Two Sites", () => {
    it("should generate correct Voronoi diagram for two sites", () => {
      const sites: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
      ];
      const result = voronoi.generate(sites);

      expect(result.stats.success).toBe(true);
      expect(result.stats.siteCount).toBe(2);
      expect(result.stats.cellCount).toBe(2);
      expect(result.stats.edgeCount).toBe(2);
      expect(result.stats.vertexCount).toBe(1);
      expect(result.stats.unboundedCellCount).toBe(2);
      expect(result.stats.boundedCellCount).toBe(0);

      // Check that cells are unbounded
      expect(result.cells[0].bounded).toBe(false);
      expect(result.cells[1].bounded).toBe(false);

      // Check that edges are infinite
      expect(result.edges[0].infinite).toBe(true);
      expect(result.edges[1].infinite).toBe(true);

      // Check that the vertex is at the midpoint
      const vertex = result.vertices[0];
      expect(vertex.position.x).toBeCloseTo(1, 10);
      expect(vertex.position.y).toBeCloseTo(0, 10);
    });

    it("should handle two sites that are too close", () => {
      const sites: Point[] = [
        { x: 0, y: 0 },
        { x: 1e-12, y: 0 },
      ];
      const result = voronoi.generate(sites);
      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("too close together");
    });
  });

  describe("Three Sites", () => {
    it("should generate correct Voronoi diagram for three sites", () => {
      const sites: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 2 },
      ];
      const result = voronoi.generate(sites);

      expect(result.stats.success).toBe(true);
      expect(result.stats.siteCount).toBe(3);
      expect(result.stats.cellCount).toBe(3);
      expect(result.stats.edgeCount).toBeGreaterThan(0);
      expect(result.stats.vertexCount).toBeGreaterThan(0);

      // Check that all sites have corresponding cells
      const sitePositions = sites.map(site => `${site.x},${site.y}`);
      const cellSites = result.cells.map((cell: any) => `${cell.site.x},${cell.site.y}`);
      
      for (const sitePos of sitePositions) {
        expect(cellSites).toContain(sitePos);
      }
    });

    it("should handle three collinear sites", () => {
      const sites: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ];
      const result = voronoi.generate(sites);

      expect(result.stats.success).toBe(true);
      expect(result.stats.cellCount).toBe(3);
    });
  });

  describe("Multiple Sites", () => {
    it("should generate Voronoi diagram for square of sites", () => {
      const sites: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ];
      const result = voronoi.generate(sites);

      expect(result.stats.success).toBe(true);
      expect(result.stats.siteCount).toBe(4);
      expect(result.stats.cellCount).toBe(4);
      expect(result.stats.edgeCount).toBeGreaterThan(0);
      expect(result.stats.vertexCount).toBeGreaterThan(0);
    });

    it("should generate Voronoi diagram for random sites", () => {
      const sites: Point[] = [];
      for (let i = 0; i < 10; i++) {
        sites.push({
          x: Math.random() * 10,
          y: Math.random() * 10,
        });
      }
      const result = voronoi.generate(sites);

      expect(result.stats.success).toBe(true);
      expect(result.stats.siteCount).toBe(10);
      expect(result.stats.cellCount).toBe(10);
    });
  });

  describe("Cell Properties", () => {
    it("should calculate cell areas and centroids when enabled", () => {
      const voronoiWithProps = new VoronoiDiagram({ calculateProperties: true });
      const sites: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 2 },
      ];
      const result = voronoiWithProps.generate(sites);

      expect(result.stats.success).toBe(true);
      
      for (const cell of result.cells) {
        if (cell.bounded) {
          expect(typeof cell.area).toBe("number");
          expect(cell.area).toBeGreaterThan(0);
          expect(typeof cell.centroid.x).toBe("number");
          expect(typeof cell.centroid.y).toBe("number");
        }
      }
    });

    it("should not calculate cell properties when disabled", () => {
      const voronoiWithoutProps = new VoronoiDiagram({ calculateProperties: false });
      const sites: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 2 },
      ];
      const result = voronoiWithoutProps.generate(sites);

      expect(result.stats.success).toBe(true);
      
      for (const cell of result.cells) {
        expect(cell.area).toBe(0);
        expect(cell.centroid).toEqual(cell.site);
      }
    });
  });

  describe("Bounding Box", () => {
    it("should work with bounding box configuration", () => {
      const voronoiWithBounds = new VoronoiDiagram({
        boundingBox: {
          min: { x: -1, y: -1 },
          max: { x: 3, y: 3 },
        },
      });
      const sites: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 2 },
      ];
      const result = voronoiWithBounds.generate(sites);

      expect(result.stats.success).toBe(true);
    });
  });

  describe("Lloyd's Relaxation", () => {
    it("should perform Lloyd's relaxation when enabled", () => {
      const voronoiWithLloyd = new VoronoiDiagram({
        lloydRelaxation: {
          enabled: true,
          iterations: 3,
          tolerance: 1e-6,
        },
      });
      const sites: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 2 },
      ];
      const result = voronoiWithLloyd.generate(sites);

      expect(result.stats.success).toBe(true);
    });

    it("should perform manual Lloyd's relaxation", () => {
      const sites: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 2 },
      ];
      const relaxationResult = voronoi.performLloydRelaxation(sites, {
        maxIterations: 5,
        tolerance: 1e-6,
      });

      expect(relaxationResult.relaxedSites).toHaveLength(3);
      expect(relaxationResult.iterations).toBeGreaterThan(0);
      expect(relaxationResult.iterations).toBeLessThanOrEqual(5);
      expect(typeof relaxationResult.convergence).toBe("number");
      expect(typeof relaxationResult.converged).toBe("boolean");
      expect(relaxationResult.executionTime).toBeGreaterThan(0);
    });
  });

  describe("Serialization", () => {
    it("should serialize Voronoi diagram", () => {
      const sites: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 2 },
      ];
      const result = voronoi.generate(sites);
      const serialized = voronoi.serialize(result);

      expect(serialized.voronoi.cells).toHaveLength(3);
      expect(serialized.voronoi.edges.length).toBeGreaterThan(0);
      expect(serialized.voronoi.vertices.length).toBeGreaterThan(0);
      expect(serialized.stats).toEqual(result.stats);
      expect(serialized.config).toEqual(voronoi.getConfig());
    });

    it("should serialize with custom options", () => {
      const sites: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 2 },
      ];
      const result = voronoi.generate(sites);
      const serialized = voronoi.serialize(result, {
        includeProperties: false,
        includeDelaunay: true,
        precision: 3,
      });

      expect(serialized.voronoi.cells[0]).not.toHaveProperty("area");
      expect(serialized.voronoi.cells[0]).not.toHaveProperty("centroid");
      expect(serialized.delaunay).toBeDefined();
    });
  });

  describe("Query Operations", () => {
    it("should perform basic queries", () => {
      const sites: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 2 },
      ];
      voronoi.generate(sites);
      const queryResult = voronoi.query({ x: 1, y: 1 });

      expect(queryResult.executionTime).toBeGreaterThan(0);
      expect(Array.isArray(queryResult.cellsInRadius)).toBe(true);
    });
  });
});

describe("Voronoi Utils", () => {
  describe("calculateCircumcenter", () => {
    it("should calculate circumcenter for equilateral triangle", () => {
      const triangle = {
        a: { x: 0, y: 0 },
        b: { x: 2, y: 0 },
        c: { x: 1, y: Math.sqrt(3) },
      };
      const circumcenter = calculateCircumcenter(triangle);
      
      expect(circumcenter.x).toBeCloseTo(1, 10);
      expect(circumcenter.y).toBeCloseTo(Math.sqrt(3) / 3, 10);
    });

    it("should handle degenerate triangle", () => {
      const triangle = {
        a: { x: 0, y: 0 },
        b: { x: 1, y: 0 },
        c: { x: 2, y: 0 },
      };
      const circumcenter = calculateCircumcenter(triangle);
      
      expect(circumcenter.x).toBeCloseTo(1, 10);
      expect(circumcenter.y).toBeCloseTo(0, 10);
    });
  });

  describe("calculatePolygonArea", () => {
    it("should calculate area of square", () => {
      const vertices = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ];
      const area = calculatePolygonArea(vertices);
      expect(area).toBeCloseTo(4, 10);
    });

    it("should return 0 for less than 3 vertices", () => {
      expect(calculatePolygonArea([])).toBe(0);
      expect(calculatePolygonArea([{ x: 0, y: 0 }])).toBe(0);
      expect(calculatePolygonArea([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBe(0);
    });
  });

  describe("calculatePolygonCentroid", () => {
    it("should calculate centroid of square", () => {
      const vertices = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ];
      const centroid = calculatePolygonCentroid(vertices);
      expect(centroid.x).toBeCloseTo(1, 10);
      expect(centroid.y).toBeCloseTo(1, 10);
    });

    it("should handle empty vertices", () => {
      const centroid = calculatePolygonCentroid([]);
      expect(centroid.x).toBe(0);
      expect(centroid.y).toBe(0);
    });
  });

  describe("isPointInPolygon", () => {
    it("should detect point inside square", () => {
      const vertices = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ];
      expect(isPointInPolygon({ x: 1, y: 1 }, vertices)).toBe(true);
      expect(isPointInPolygon({ x: 0.5, y: 0.5 }, vertices)).toBe(true);
    });

    it("should detect point outside square", () => {
      const vertices = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ];
      expect(isPointInPolygon({ x: 3, y: 1 }, vertices)).toBe(false);
      expect(isPointInPolygon({ x: -1, y: 1 }, vertices)).toBe(false);
    });
  });

  describe("findNearestSite", () => {
    it("should find nearest site", () => {
      const sites = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 2 },
      ];
      const result = findNearestSite({ x: 0.1, y: 0.1 }, sites);
      
      expect(result.site).toEqual({ x: 0, y: 0 });
      expect(result.index).toBe(0);
      expect(result.distance).toBeCloseTo(Math.sqrt(0.02), 10);
    });

    it("should throw error for empty sites", () => {
      expect(() => findNearestSite({ x: 0, y: 0 }, [])).toThrow("No sites provided");
    });
  });

  describe("distance", () => {
    it("should calculate distance between points", () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 3, y: 4 };
      const dist = distance(p1, p2);
      expect(dist).toBe(5);
    });
  });

  describe("validatePointsForTriangulation", () => {
    it("should validate good points", () => {
      const points = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0.5, y: 1 },
      ];
      expect(validatePointsForTriangulation(points)).toBe(true);
    });

    it("should reject duplicate points", () => {
      const points = [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ];
      expect(validatePointsForTriangulation(points)).toBe(false);
    });

    it("should reject collinear points", () => {
      const points = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ];
      expect(validatePointsForTriangulation(points)).toBe(false);
    });
  });

  describe("createBoundingBox", () => {
    it("should create bounding box for points", () => {
      const points = [
        { x: 0, y: 0 },
        { x: 2, y: 1 },
        { x: 1, y: 3 },
      ];
      const bbox = createBoundingBox(points);
      
      expect(bbox.min.x).toBe(0);
      expect(bbox.min.y).toBe(0);
      expect(bbox.max.x).toBe(2);
      expect(bbox.max.y).toBe(3);
    });

    it("should handle empty points", () => {
      const bbox = createBoundingBox([]);
      expect(bbox.min.x).toBe(0);
      expect(bbox.min.y).toBe(0);
      expect(bbox.max.x).toBe(0);
      expect(bbox.max.y).toBe(0);
    });
  });

  describe("pointsEqual", () => {
    it("should detect equal points", () => {
      const p1 = { x: 1.0, y: 2.0 };
      const p2 = { x: 1.0, y: 2.0 };
      expect(pointsEqual(p1, p2)).toBe(true);
    });

    it("should detect unequal points", () => {
      const p1 = { x: 1.0, y: 2.0 };
      const p2 = { x: 1.1, y: 2.0 };
      expect(pointsEqual(p1, p2)).toBe(false);
    });

    it("should respect tolerance", () => {
      const p1 = { x: 1.0, y: 2.0 };
      const p2 = { x: 1.0001, y: 2.0 };
      expect(pointsEqual(p1, p2, 1e-3)).toBe(true);
      expect(pointsEqual(p1, p2, 1e-5)).toBe(false);
    });
  });
});

