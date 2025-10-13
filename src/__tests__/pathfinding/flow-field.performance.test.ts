/**
 * @fileoverview Performance tests for Flow Field pathfinding algorithm.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { FlowField, FlowFieldUtils } from "../../pathfinding/flow-field/flow-field-core";
import type { Point, CellType } from "../../pathfinding/flow-field/flow-field-types";
import { CellType as FlowFieldCellType } from "../../pathfinding/flow-field/flow-field-types";

describe("FlowField Performance", () => {
  let flowField: FlowField;

  beforeEach(() => {
    flowField = new FlowField();
  });

  afterEach(() => {
    flowField.clearCache();
  });

  describe("Basic Performance", () => {
    it("should generate flow field efficiently for small grids", () => {
      const sizes = [10, 20, 50];
      
      for (const size of sizes) {
        const grid = FlowFieldUtils.generateTestGrid(size, size, 0.2, 42);
        const goals: Point[] = [{ x: size - 1, y: size - 1 }];
        
        const startTime = performance.now();
        const result = flowField.generateFlowField(grid, size, size, goals);
        const endTime = performance.now();
        
        expect(result.success).toBe(true);
        expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
      }
    });

    it("should generate flow field efficiently for medium grids", () => {
      const sizes = [100, 200];
      
      for (const size of sizes) {
        const grid = FlowFieldUtils.generateTestGrid(size, size, 0.2, 42);
        const goals: Point[] = [{ x: size - 1, y: size - 1 }];
        
        const startTime = performance.now();
        const result = flowField.generateFlowField(grid, size, size, goals);
        const endTime = performance.now();
        
        expect(result.success).toBe(true);
        expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1s
      }
    });

    it("should generate flow field efficiently for large grids", () => {
      const sizes = [500, 1000];
      
      for (const size of sizes) {
        const grid = FlowFieldUtils.generateTestGrid(size, size, 0.2, 42);
        const goals: Point[] = [{ x: size - 1, y: size - 1 }];
        
        const startTime = performance.now();
        const result = flowField.generateFlowField(grid, size, size, goals);
        const endTime = performance.now();
        
        expect(result.success).toBe(true);
        expect(endTime - startTime).toBeLessThan(5000); // Should complete in under 5s
      }
    });
  });

  describe("Obstacle Density Impact", () => {
    it("should handle low obstacle density efficiently", () => {
      const grid = FlowFieldUtils.generateTestGrid(100, 100, 0.1, 42);
      const goals: Point[] = [{ x: 99, y: 99 }];
      
      const startTime = performance.now();
      const result = flowField.generateFlowField(grid, 100, 100, goals);
      const endTime = performance.now();
      
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it("should handle medium obstacle density efficiently", () => {
      const grid = FlowFieldUtils.generateTestGrid(100, 100, 0.3, 42);
      const goals: Point[] = [{ x: 99, y: 99 }];
      
      const startTime = performance.now();
      const result = flowField.generateFlowField(grid, 100, 100, goals);
      const endTime = performance.now();
      
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it("should handle high obstacle density efficiently", () => {
      const grid = FlowFieldUtils.generateTestGrid(100, 100, 0.5, 42);
      const goals: Point[] = [{ x: 99, y: 99 }];
      
      const startTime = performance.now();
      const result = flowField.generateFlowField(grid, 100, 100, goals);
      const endTime = performance.now();
      
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe("Multiple Goals Performance", () => {
    it("should handle single goal efficiently", () => {
      const grid = FlowFieldUtils.generateTestGrid(100, 100, 0.2, 42);
      const goals: Point[] = [{ x: 99, y: 99 }];
      
      const startTime = performance.now();
      const result = flowField.generateFlowField(grid, 100, 100, goals);
      const endTime = performance.now();
      
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it("should handle multiple goals efficiently", () => {
      const grid = FlowFieldUtils.generateTestGrid(100, 100, 0.2, 42);
      const goals: Point[] = [
        { x: 0, y: 0 },
        { x: 99, y: 0 },
        { x: 0, y: 99 },
        { x: 99, y: 99 },
        { x: 50, y: 50 },
      ];
      
      const startTime = performance.now();
      const result = flowField.generateFlowField(grid, 100, 100, goals);
      const endTime = performance.now();
      
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000);
    });

    it("should handle many goals efficiently", () => {
      const grid = FlowFieldUtils.generateTestGrid(100, 100, 0.2, 42);
      const goals: Point[] = FlowFieldUtils.generateRandomGoals(20, 100, 100, grid, 42);
      
      const startTime = performance.now();
      const result = flowField.generateFlowField(grid, 100, 100, goals);
      const endTime = performance.now();
      
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(3000);
    });
  });

  describe("Agent Pathfinding Performance", () => {
    it("should find agent paths efficiently", () => {
      const grid = FlowFieldUtils.generateTestGrid(100, 100, 0.2, 42);
      const goals: Point[] = [{ x: 99, y: 99 }];
      const result = flowField.generateFlowField(grid, 100, 100, goals);
      
      const agents: Point[] = FlowFieldUtils.generateRandomAgents(100, 100, 100, grid, 42);
      
      const startTime = performance.now();
      for (const agent of agents) {
        const agentPath = flowField.findAgentPath(agent, result.flowField, 100, 100);
        expect(agentPath.found).toBe(true);
      }
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1s
    });

    it("should handle agent pathfinding with A* fallback efficiently", () => {
      const grid = FlowFieldUtils.generateTestGrid(100, 100, 0.2, 42);
      const goals: Point[] = [{ x: 99, y: 99 }];
      const result = flowField.generateFlowField(grid, 100, 100, goals);
      
      const agents: Point[] = FlowFieldUtils.generateRandomAgents(50, 100, 100, grid, 42);
      
      const startTime = performance.now();
      for (const agent of agents) {
        const agentPath = flowField.findAgentPath(agent, result.flowField, 100, 100, {
          useAStarFallback: true,
        });
        expect(agentPath.found).toBe(true);
      }
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(2000); // Should complete in under 2s
    });
  });

  describe("Crowd Simulation Performance", () => {
    it("should simulate small crowds efficiently", () => {
      const grid = FlowFieldUtils.generateTestGrid(100, 100, 0.2, 42);
      const goals: Point[] = [{ x: 99, y: 99 }];
      const result = flowField.generateFlowField(grid, 100, 100, goals);
      
      const agents: Point[] = FlowFieldUtils.generateRandomAgents(10, 100, 100, grid, 42);
      
      const startTime = performance.now();
      const simulation = flowField.simulateCrowd(agents, result.flowField, 100, 100);
      const endTime = performance.now();
      
      expect(simulation.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(500);
    });

    it("should simulate medium crowds efficiently", () => {
      const grid = FlowFieldUtils.generateTestGrid(100, 100, 0.2, 42);
      const goals: Point[] = [{ x: 99, y: 99 }];
      const result = flowField.generateFlowField(grid, 100, 100, goals);
      
      const agents: Point[] = FlowFieldUtils.generateRandomAgents(100, 100, 100, grid, 42);
      
      const startTime = performance.now();
      const simulation = flowField.simulateCrowd(agents, result.flowField, 100, 100);
      const endTime = performance.now();
      
      expect(simulation.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000);
    });

    it("should simulate large crowds efficiently", () => {
      const grid = FlowFieldUtils.generateTestGrid(100, 100, 0.2, 42);
      const goals: Point[] = [{ x: 99, y: 99 }];
      const result = flowField.generateFlowField(grid, 100, 100, goals);
      
      const agents: Point[] = FlowFieldUtils.generateRandomAgents(500, 100, 100, grid, 42);
      
      const startTime = performance.now();
      const simulation = flowField.simulateCrowd(agents, result.flowField, 100, 100);
      const endTime = performance.now();
      
      expect(simulation.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it("should handle crowd simulation with collision avoidance efficiently", () => {
      const grid = FlowFieldUtils.generateTestGrid(100, 100, 0.2, 42);
      const goals: Point[] = [{ x: 99, y: 99 }];
      const result = flowField.generateFlowField(grid, 100, 100, goals);
      
      const agents: Point[] = FlowFieldUtils.generateRandomAgents(100, 100, 100, grid, 42);
      
      const startTime = performance.now();
      const simulation = flowField.simulateCrowd(agents, result.flowField, 100, 100, {
        useCollisionAvoidance: true,
        collisionAvoidanceRadius: 2,
      });
      const endTime = performance.now();
      
      expect(simulation.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(3000);
    });
  });

  describe("Caching Performance", () => {
    it("should benefit from caching", () => {
      flowField.updateConfig({ enableCaching: true });
      
      const grid = FlowFieldUtils.generateTestGrid(100, 100, 0.2, 42);
      const goals: Point[] = [{ x: 99, y: 99 }];
      
      // First generation (no cache)
      const startTime1 = performance.now();
      const result1 = flowField.generateFlowField(grid, 100, 100, goals);
      const endTime1 = performance.now();
      
      // Second generation (with cache)
      const startTime2 = performance.now();
      const result2 = flowField.generateFlowField(grid, 100, 100, goals);
      const endTime2 = performance.now();
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(endTime2 - startTime2).toBeLessThan(endTime1 - startTime1);
    });

    it("should handle cache invalidation efficiently", () => {
      flowField.updateConfig({ enableCaching: true });
      
      const grid = FlowFieldUtils.generateTestGrid(100, 100, 0.2, 42);
      const goals: Point[] = [{ x: 99, y: 99 }];
      
      // Generate and cache
      flowField.generateFlowField(grid, 100, 100, goals);
      
      // Clear cache
      const startTime = performance.now();
      flowField.clearCache();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(10); // Should be very fast
    });
  });

  describe("Memory Usage", () => {
    it("should handle memory efficiently for small grids", () => {
      const grid = FlowFieldUtils.generateTestGrid(50, 50, 0.2, 42);
      const goals: Point[] = [{ x: 49, y: 49 }];
      
      const startTime = performance.now();
      const result = flowField.generateFlowField(grid, 50, 50, goals);
      const endTime = performance.now();
      
      expect(result.success).toBe(true);
      expect(result.integrationField.length).toBe(2500);
      expect(result.flowField.length).toBe(2500);
      expect(endTime - startTime).toBeLessThan(500);
    });

    it("should handle memory efficiently for medium grids", () => {
      const grid = FlowFieldUtils.generateTestGrid(200, 200, 0.2, 42);
      const goals: Point[] = [{ x: 199, y: 199 }];
      
      const startTime = performance.now();
      const result = flowField.generateFlowField(grid, 200, 200, goals);
      const endTime = performance.now();
      
      expect(result.success).toBe(true);
      expect(result.integrationField.length).toBe(40000);
      expect(result.flowField.length).toBe(40000);
      expect(endTime - startTime).toBeLessThan(2000);
    });

    it("should handle memory efficiently for large grids", () => {
      const grid = FlowFieldUtils.generateTestGrid(500, 500, 0.2, 42);
      const goals: Point[] = [{ x: 499, y: 499 }];
      
      const startTime = performance.now();
      const result = flowField.generateFlowField(grid, 500, 500, goals);
      const endTime = performance.now();
      
      expect(result.success).toBe(true);
      expect(result.integrationField.length).toBe(250000);
      expect(result.flowField.length).toBe(250000);
      expect(endTime - startTime).toBeLessThan(10000);
    });
  });

  describe("Stress Tests", () => {
    it("should handle maximum grid size", () => {
      const maxSize = 1000;
      const grid = FlowFieldUtils.generateTestGrid(maxSize, maxSize, 0.1, 42);
      const goals: Point[] = [{ x: maxSize - 1, y: maxSize - 1 }];
      
      const startTime = performance.now();
      const result = flowField.generateFlowField(grid, maxSize, maxSize, goals);
      const endTime = performance.now();
      
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(30000); // Should complete in under 30s
    });

    it("should handle maximum number of goals", () => {
      const grid = FlowFieldUtils.generateTestGrid(100, 100, 0.2, 42);
      const goals: Point[] = FlowFieldUtils.generateRandomGoals(100, 100, 100, grid, 42);
      
      const startTime = performance.now();
      const result = flowField.generateFlowField(grid, 100, 100, goals);
      const endTime = performance.now();
      
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it("should handle maximum number of agents", () => {
      const grid = FlowFieldUtils.generateTestGrid(100, 100, 0.2, 42);
      const goals: Point[] = [{ x: 99, y: 99 }];
      const result = flowField.generateFlowField(grid, 100, 100, goals);
      
      const agents: Point[] = FlowFieldUtils.generateRandomAgents(1000, 100, 100, grid, 42);
      
      const startTime = performance.now();
      const simulation = flowField.simulateCrowd(agents, result.flowField, 100, 100);
      const endTime = performance.now();
      
      expect(simulation.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(10000);
    });

    it("should handle complex grid patterns", () => {
      const patterns = ["maze", "rooms", "corridors", "spiral"] as const;
      
      for (const pattern of patterns) {
        const grid = FlowFieldUtils.generatePatternGrid(100, 100, pattern, 42);
        const goals: Point[] = [{ x: 99, y: 99 }];
        
        const startTime = performance.now();
        const result = flowField.generateFlowField(grid, 100, 100, goals);
        const endTime = performance.now();
        
        expect(result.success).toBe(true);
        expect(endTime - startTime).toBeLessThan(2000);
      }
    });

    it("should handle rapid successive generations", () => {
      const grid = FlowFieldUtils.generateTestGrid(100, 100, 0.2, 42);
      const goals: Point[] = [{ x: 99, y: 99 }];
      
      const startTime = performance.now();
      for (let i = 0; i < 10; i++) {
        const result = flowField.generateFlowField(grid, 100, 100, goals);
        expect(result.success).toBe(true);
      }
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });

  describe("Configuration Impact", () => {
    it("should handle diagonal movement efficiently", () => {
      const grid = FlowFieldUtils.generateTestGrid(100, 100, 0.2, 42);
      const goals: Point[] = [{ x: 99, y: 99 }];
      
      // With diagonal movement
      flowField.updateConfig({ allowDiagonal: true });
      const startTime1 = performance.now();
      const result1 = flowField.generateFlowField(grid, 100, 100, goals);
      const endTime1 = performance.now();
      
      // Without diagonal movement
      flowField.updateConfig({ allowDiagonal: false });
      const startTime2 = performance.now();
      const result2 = flowField.generateFlowField(grid, 100, 100, goals);
      const endTime2 = performance.now();
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(endTime1 - startTime1).toBeLessThan(1000);
      expect(endTime2 - startTime2).toBeLessThan(1000);
    });

    it("should handle different cost configurations efficiently", () => {
      const grid = FlowFieldUtils.generateTestGrid(100, 100, 0.2, 42);
      const goals: Point[] = [{ x: 99, y: 99 }];
      
      const costConfigs = [
        { cardinalCost: 1, diagonalCost: 1 },
        { cardinalCost: 1, diagonalCost: Math.sqrt(2) },
        { cardinalCost: 2, diagonalCost: 3 },
      ];
      
      for (const config of costConfigs) {
        flowField.updateConfig(config);
        
        const startTime = performance.now();
        const result = flowField.generateFlowField(grid, 100, 100, goals);
        const endTime = performance.now();
        
        expect(result.success).toBe(true);
        expect(endTime - startTime).toBeLessThan(1000);
      }
    });
  });
});
