/**
 * @module algorithms/geometry/algorithms/voronoi/performance-tests
 * @description Performance tests for Voronoi diagram implementation.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { VoronoiDiagram } from "../../../geometry/algorithms/voronoi/voronoi-core";
import type { Point } from "../../../geometry/algorithms/delaunay/delaunay-types";

describe("VoronoiDiagram Performance Tests", () => {
  let voronoi: VoronoiDiagram;

  beforeEach(() => {
    voronoi = new VoronoiDiagram();
  });

  describe("Generation Performance", () => {
    it("should generate Voronoi diagram for 100 sites efficiently", () => {
      const sites = generateRandomSites(100);
      const startTime = performance.now();
      
      const result = voronoi.generate(sites);
      
      const executionTime = performance.now() - startTime;
      
      expect(result.stats.success).toBe(true);
      expect(result.stats.siteCount).toBe(100);
      expect(result.stats.cellCount).toBe(100);
      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.stats.executionTime).toBeLessThan(1000);
    });

    it("should generate Voronoi diagram for 500 sites efficiently", () => {
      const sites = generateRandomSites(500);
      const startTime = performance.now();
      
      const result = voronoi.generate(sites);
      
      const executionTime = performance.now() - startTime;
      
      expect(result.stats.success).toBe(true);
      expect(result.stats.siteCount).toBe(500);
      expect(result.stats.cellCount).toBe(500);
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.stats.executionTime).toBeLessThan(5000);
    });

    it("should generate Voronoi diagram for 1000 sites efficiently", () => {
      const sites = generateRandomSites(1000);
      const startTime = performance.now();
      
      const result = voronoi.generate(sites);
      
      const executionTime = performance.now() - startTime;
      
      expect(result.stats.success).toBe(true);
      expect(result.stats.siteCount).toBe(1000);
      expect(result.stats.cellCount).toBe(1000);
      expect(executionTime).toBeLessThan(10000); // Should complete within 10 seconds
      expect(result.stats.executionTime).toBeLessThan(10000);
    });

    it("should handle worst-case input (collinear points)", () => {
      const sites = generateCollinearSites(100);
      const startTime = performance.now();
      
      const result = voronoi.generate(sites);
      
      const executionTime = performance.now() - startTime;
      
      expect(result.stats.success).toBe(true);
      expect(executionTime).toBeLessThan(2000); // Should still be reasonably fast
    });

    it("should handle regular grid input efficiently", () => {
      const sites = generateGridSites(10, 10); // 100 sites in grid
      const startTime = performance.now();
      
      const result = voronoi.generate(sites);
      
      const executionTime = performance.now() - startTime;
      
      expect(result.stats.success).toBe(true);
      expect(result.stats.siteCount).toBe(100);
      expect(executionTime).toBeLessThan(1000);
    });
  });

  describe("Lloyd's Relaxation Performance", () => {
    it("should perform Lloyd's relaxation efficiently", () => {
      const sites = generateRandomSites(50);
      const startTime = performance.now();
      
      const relaxationResult = voronoi.performLloydRelaxation(sites, {
        maxIterations: 10,
        tolerance: 1e-6,
      });
      
      const executionTime = performance.now() - startTime;
      
      expect(relaxationResult.relaxedSites).toHaveLength(50);
      expect(relaxationResult.iterations).toBeGreaterThan(0);
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(relaxationResult.executionTime).toBeLessThan(5000);
    });

    it("should converge quickly for well-distributed sites", () => {
      const sites = generateGridSites(5, 5); // 25 sites in regular grid
      const relaxationResult = voronoi.performLloydRelaxation(sites, {
        maxIterations: 20,
        tolerance: 1e-6,
      });
      
      expect(relaxationResult.converged).toBe(true);
      expect(relaxationResult.iterations).toBeLessThan(10);
    });
  });

  describe("Serialization Performance", () => {
    it("should serialize large Voronoi diagram efficiently", () => {
      const sites = generateRandomSites(200);
      const result = voronoi.generate(sites);
      
      const startTime = performance.now();
      const serialized = voronoi.serialize(result);
      const executionTime = performance.now() - startTime;
      
      expect(serialized.voronoi.cells).toHaveLength(200);
      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it("should serialize with Delaunay data efficiently", () => {
      const sites = generateRandomSites(100);
      const result = voronoi.generate(sites);
      
      const startTime = performance.now();
      const serialized = voronoi.serialize(result, {
        includeDelaunay: true,
        includeProperties: true,
      });
      const executionTime = performance.now() - startTime;
      
      expect(serialized.delaunay).toBeDefined();
      expect(executionTime).toBeLessThan(500);
    });
  });

  describe("Memory Usage", () => {
    it("should not leak memory with repeated generations", () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Generate multiple Voronoi diagrams
      for (let i = 0; i < 10; i++) {
        const sites = generateRandomSites(100);
        const result = voronoi.generate(sites);
        expect(result.stats.success).toBe(true);
      }
      
      // Force garbage collection if available
      if ((global as any).gc) {
        (global as any).gc();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 50MB)
      if (initialMemory > 0 && finalMemory > 0) {
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      }
    });
  });

  describe("Scalability", () => {
    it("should scale linearly with number of sites", () => {
      const sizes = [50, 100, 200];
      const times: number[] = [];
      
      for (const size of sizes) {
        const sites = generateRandomSites(size);
        const startTime = performance.now();
        
        const result = voronoi.generate(sites);
        
        const executionTime = performance.now() - startTime;
        times.push(executionTime);
        
        expect(result.stats.success).toBe(true);
      }
      
      // Check that execution time doesn't grow too rapidly
      // O(n log n) algorithm should not grow quadratically
      const ratio1 = times[1] / times[0]; // 100 vs 50
      const ratio2 = times[2] / times[1]; // 200 vs 100
      
      expect(ratio1).toBeLessThan(3); // Should not be more than 3x slower
      expect(ratio2).toBeLessThan(3); // Should not be more than 3x slower
    });
  });

  describe("Edge Cases Performance", () => {
    it("should handle many duplicate sites efficiently", () => {
      const sites: Point[] = [];
      for (let i = 0; i < 100; i++) {
        sites.push({ x: 0, y: 0 });
        sites.push({ x: 1, y: 1 });
      }
      
      const startTime = performance.now();
      
      // This should fail validation, but should fail quickly
      expect(() => voronoi.generate(sites)).toThrow();
      
      const executionTime = performance.now() - startTime;
      expect(executionTime).toBeLessThan(100); // Should fail quickly
    });

    it("should handle sites in very small area efficiently", () => {
      const sites: Point[] = [];
      for (let i = 0; i < 100; i++) {
        sites.push({
          x: 0 + Math.random() * 1e-6,
          y: 0 + Math.random() * 1e-6,
        });
      }
      
      const startTime = performance.now();
      const result = voronoi.generate(sites);
      const executionTime = performance.now() - startTime;
      
      expect(result.stats.success).toBe(true);
      expect(executionTime).toBeLessThan(2000);
    });
  });
});

// Helper functions for generating test data

function generateRandomSites(count: number): Point[] {
  const sites: Point[] = [];
  for (let i = 0; i < count; i++) {
    sites.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
    });
  }
  return sites;
}

function generateCollinearSites(count: number): Point[] {
  const sites: Point[] = [];
  for (let i = 0; i < count; i++) {
    sites.push({
      x: i,
      y: 0,
    });
  }
  return sites;
}

function generateGridSites(width: number, height: number): Point[] {
  const sites: Point[] = [];
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      sites.push({
        x: x * 2,
        y: y * 2,
      });
    }
  }
  return sites;
}
