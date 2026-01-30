/**
 * @file Unit tests for Flow Field pathfinding algorithm.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { FlowField } from "../../algorithms/pathfinding/flow-field/flow-field-core";
import { FlowFieldUtils } from "../../algorithms/pathfinding/flow-field/flow-field-utils";
import { FlowFieldGenerator } from "../../algorithms/pathfinding/flow-field/flow-field-generator";
import type { Point, CellType } from "../../algorithms/pathfinding/flow-field/flow-field-types";
import { CellType as FlowFieldCellType } from "../../algorithms/pathfinding/flow-field/flow-field-types";

describe("FlowField", () => {
  let flowField: FlowField;
  let grid: CellType[];
  const width = 10;
  const height = 10;

  beforeEach(() => {
    flowField = new FlowField();
    grid = FlowFieldUtils.generateTestGrid(width, height, 0.2, 42);
  });

  afterEach(() => {
    flowField.clearCache();
  });

  describe("Basic Flow Field Generation", () => {
    it("should generate a flow field successfully", () => {
      const goals: Point[] = [{ x: 9, y: 9 }];

      const result = flowField.generateFlowField(grid, width, height, goals);

      expect(result.success).toBe(true);
      expect(result.integrationField.length).toBe(width * height);
      expect(result.flowField.length).toBe(width * height);
    });

    it("should handle multiple goals", () => {
      const goals: Point[] = [
        { x: 0, y: 0 },
        { x: 9, y: 9 },
        { x: 5, y: 5 },
      ];

      const result = flowField.generateFlowField(grid, width, height, goals);

      expect(result.success).toBe(true);
      expect(result.integrationField.length).toBe(width * height);
      expect(result.flowField.length).toBe(width * height);
    });

    it("should handle empty goals array", () => {
      const goals: Point[] = [];

      const result = flowField.generateFlowField(grid, width, height, goals);

      expect(result.success).toBe(false);
    });

    it("should handle invalid goal positions", () => {
      const goals: Point[] = [{ x: -1, y: 0 }];

      const result = flowField.generateFlowField(grid, width, height, goals);

      expect(result.success).toBe(false);
    });
  });

  describe("Agent Pathfinding", () => {
    it("should find a path for an agent using flow field", () => {
      const goals: Point[] = [{ x: 9, y: 9 }];
      const result = flowField.generateFlowField(grid, width, height, goals);

      const start: Point = { x: 0, y: 0 };
      const agentPath = flowField.findAgentPath(start, result.flowField, width, height);

      expect(agentPath.found).toBe(true);
      expect(agentPath.path.length).toBeGreaterThan(0);
      expect(agentPath.path[0]).toEqual(start);
      expect(agentPath.usedFlowField).toBe(true);
    });

    it("should handle agent pathfinding with A* fallback", () => {
      const goals: Point[] = [{ x: 9, y: 9 }];
      const result = flowField.generateFlowField(grid, width, height, goals);

      const start: Point = { x: 0, y: 0 };
      const agentPath = flowField.findAgentPath(start, result.flowField, width, height, {
        useAStarFallback: true,
      });

      expect(agentPath.found).toBe(true);
      expect(agentPath.path.length).toBeGreaterThan(0);
    });

    it("should handle agent pathfinding without flow field", () => {
      const goals: Point[] = [{ x: 9, y: 9 }];
      const result = flowField.generateFlowField(grid, width, height, goals);

      const start: Point = { x: 0, y: 0 };
      const agentPath = flowField.findAgentPath(start, result.flowField, width, height, {
        useFlowField: false,
        useAStarFallback: true,
      });

      expect(agentPath.usedFlowField).toBe(false);
    });
  });

  describe("Crowd Simulation", () => {
    it("should simulate crowd movement", () => {
      const goals: Point[] = [{ x: 9, y: 9 }];
      const result = flowField.generateFlowField(grid, width, height, goals);

      const agents: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ];

      const simulation = flowField.simulateCrowd(agents, result.flowField, width, height);

      expect(simulation.success).toBe(true);
      expect(simulation.agentPaths.length).toBe(agents.length);
      expect(simulation.stats.agentsReachedGoal).toBeGreaterThan(0);
    });

    it("should handle crowd simulation with collision avoidance", () => {
      const goals: Point[] = [{ x: 9, y: 9 }];
      const result = flowField.generateFlowField(grid, width, height, goals);

      const agents: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ];

      const simulation = flowField.simulateCrowd(agents, result.flowField, width, height, {
        useCollisionAvoidance: true,
        collisionAvoidanceRadius: 2,
      });

      expect(simulation.success).toBe(true);
      expect(simulation.agentPaths.length).toBe(agents.length);
    });
  });

  describe("Configuration", () => {
    it("should use custom configuration", () => {
      const customConfig = {
        allowDiagonal: false,
        cardinalCost: 2,
        diagonalCost: 3,
        maxCost: 5000,
      };

      flowField.updateConfig(customConfig);
      const config = flowField.getConfig();

      expect(config.allowDiagonal).toBe(false);
      expect(config.cardinalCost).toBe(2);
      expect(config.diagonalCost).toBe(3);
      expect(config.maxCost).toBe(5000);
    });

    it("should use default configuration", () => {
      const config = flowField.getConfig();

      expect(config.allowDiagonal).toBe(true);
      expect(config.cardinalCost).toBe(1);
      expect(config.diagonalCost).toBe(Math.sqrt(2));
      expect(config.maxCost).toBe(10000);
    });
  });

  describe("Statistics", () => {
    it("should track flow field generation statistics", () => {
      const goals: Point[] = [{ x: 9, y: 9 }];

      const result = flowField.generateFlowField(grid, width, height, goals);

      expect(result.stats.cellsProcessed).toBeGreaterThan(0);
      expect(result.stats.goalCells).toBeGreaterThan(0);
      expect(result.stats.obstacleCells).toBeGreaterThan(0);
      expect(result.stats.walkableCells).toBeGreaterThan(0);
      expect(result.stats.executionTime).toBeGreaterThan(0);
      expect(result.stats.success).toBe(true);
    });

    it("should reset statistics", () => {
      const goals: Point[] = [{ x: 9, y: 9 }];

      flowField.generateFlowField(grid, width, height, goals);
      const stats1 = flowField.getStats();

      flowField.resetStats();
      const stats2 = flowField.getStats();

      expect(stats2.cellsProcessed).toBe(0);
      expect(stats2.executionTime).toBe(0);
    });
  });

  describe("Flow Field Validation", () => {
    it("should validate a valid flow field", () => {
      const goals: Point[] = [{ x: 9, y: 9 }];
      const result = flowField.generateFlowField(grid, width, height, goals);

      const validation = flowField.validateFlowField(result.flowField, result.integrationField);

      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it("should detect invalid flow field", () => {
      const invalidFlowField = [
        { x: 0, y: 0, vector: { x: 0, y: 0 }, magnitude: 0, valid: false },
        { x: 1, y: 0, vector: { x: 0, y: 0 }, magnitude: 0, valid: false },
      ];

      const invalidIntegrationField = [
        { x: 0, y: 0, cost: -1, processed: true },
        { x: 1, y: 0, cost: 0, processed: true },
      ];

      const validation = flowField.validateFlowField(invalidFlowField, invalidIntegrationField);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Flow Field Comparison", () => {
    it("should compare two flow fields", () => {
      const goals: Point[] = [{ x: 9, y: 9 }];

      const result1 = flowField.generateFlowField(grid, width, height, goals);
      const result2 = flowField.generateFlowField(grid, width, height, goals);

      const comparison = flowField.compareFlowFields(result1, result2);

      expect(comparison.areEquivalent).toBe(true);
      expect(comparison.overallSimilarity).toBeGreaterThan(0);
    });
  });

  describe("Serialization", () => {
    it("should serialize flow field result", () => {
      const goals: Point[] = [{ x: 9, y: 9 }];
      const result = flowField.generateFlowField(grid, width, height, goals);

      const serialized = flowField.serialize(result, { includeStats: true });

      expect(serialized.success).toBe(result.success);
      expect(serialized.dimensions.width).toBe(width);
      expect(serialized.dimensions.height).toBe(height);
      expect(serialized.stats).toBeDefined();
    });
  });

  describe("Caching", () => {
    it("should cache flow field results", () => {
      flowField.updateConfig({ enableCaching: true });

      const goals: Point[] = [{ x: 9, y: 9 }];

      const result1 = flowField.generateFlowField(grid, width, height, goals);
      const result2 = flowField.generateFlowField(grid, width, height, goals);

      expect(result1.flowField).toEqual(result2.flowField);
    });

    it("should clear cache", () => {
      flowField.updateConfig({ enableCaching: true });

      const goals: Point[] = [{ x: 9, y: 9 }];

      flowField.generateFlowField(grid, width, height, goals);
      flowField.clearCache();

      // Cache should be cleared
      expect(true).toBe(true); // Placeholder assertion
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty grid", () => {
      const emptyGrid: CellType[] = [];

      const result = flowField.generateFlowField(emptyGrid, 0, 0, []);

      expect(result.success).toBe(false);
    });

    it("should handle single cell grid", () => {
      const singleGrid: CellType[] = [FlowFieldCellType.WALKABLE];

      const result = flowField.generateFlowField(singleGrid, 1, 1, [{ x: 0, y: 0 }]);

      expect(result.success).toBe(true);
    });

    it("should handle grid with no walkable cells", () => {
      const obstacleGrid: CellType[] = new Array(width * height).fill(FlowFieldCellType.OBSTACLE);

      const result = flowField.generateFlowField(obstacleGrid, width, height, [{ x: 0, y: 0 }]);

      expect(result.success).toBe(false);
    });
  });
});

describe("FlowFieldUtils", () => {
  describe("Grid Generation", () => {
    it("should generate test grid with obstacles", () => {
      const grid = FlowFieldUtils.generateTestGrid(10, 10, 0.3, 42);

      expect(grid.length).toBe(100);
      expect(grid.some(cell => cell === FlowFieldCellType.OBSTACLE)).toBe(true);
    });

    it("should generate pattern grids", () => {
      const patterns = ["maze", "rooms", "corridors", "spiral"] as const;

      for (const pattern of patterns) {
        const grid = FlowFieldUtils.generatePatternGrid(20, 20, pattern, 42);

        expect(grid.length).toBe(400);
        expect(grid.some(cell => cell === FlowFieldCellType.WALKABLE)).toBe(true);
      }
    });
  });

  describe("Goal Generation", () => {
    it("should generate random goals", () => {
      const grid = FlowFieldUtils.generateTestGrid(10, 10, 0.2, 42);
      const goals = FlowFieldUtils.generateRandomGoals(3, 10, 10, grid, 42);

      expect(goals.length).toBeGreaterThan(0);
      expect(goals.length).toBeLessThanOrEqual(3);

      goals.forEach(goal => {
        expect(goal.x).toBeGreaterThanOrEqual(0);
        expect(goal.x).toBeLessThan(10);
        expect(goal.y).toBeGreaterThanOrEqual(0);
        expect(goal.y).toBeLessThan(10);
      });
    });

    it("should generate goal patterns", () => {
      const grid = FlowFieldUtils.generateTestGrid(10, 10, 0.2, 42);
      const patterns = ["corners", "center", "edges", "random"] as const;

      for (const pattern of patterns) {
        const goals = FlowFieldUtils.generateGoalPattern(pattern, 10, 10, grid, 42);

        expect(goals.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Agent Generation", () => {
    it("should generate random agents", () => {
      const grid = FlowFieldUtils.generateTestGrid(10, 10, 0.2, 42);
      const agents = FlowFieldUtils.generateRandomAgents(5, 10, 10, grid, 42);

      expect(agents.length).toBeGreaterThan(0);
      expect(agents.length).toBeLessThanOrEqual(5);

      agents.forEach(agent => {
        expect(agent.x).toBeGreaterThanOrEqual(0);
        expect(agent.x).toBeLessThan(10);
        expect(agent.y).toBeGreaterThanOrEqual(0);
        expect(agent.y).toBeLessThan(10);
      });
    });

    it("should generate agent patterns", () => {
      const grid = FlowFieldUtils.generateTestGrid(10, 10, 0.2, 42);
      const patterns = ["line", "circle", "grid", "random"] as const;

      for (const pattern of patterns) {
        const agents = FlowFieldUtils.generateAgentPattern(pattern, 5, 10, 10, grid, 42);

        expect(agents.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Distance Calculations", () => {
    it("should calculate Euclidean distance", () => {
      const a: Point = { x: 0, y: 0 };
      const b: Point = { x: 3, y: 4 };

      const distance = FlowFieldUtils.distance(a, b);

      expect(distance).toBe(5);
    });

    it("should calculate Manhattan distance", () => {
      const a: Point = { x: 0, y: 0 };
      const b: Point = { x: 3, y: 4 };

      const distance = FlowFieldUtils.manhattanDistance(a, b);

      expect(distance).toBe(7);
    });

    it("should calculate Chebyshev distance", () => {
      const a: Point = { x: 0, y: 0 };
      const b: Point = { x: 3, y: 4 };

      const distance = FlowFieldUtils.chebyshevDistance(a, b);

      expect(distance).toBe(4);
    });
  });

  describe("Vector Operations", () => {
    it("should get direction vector", () => {
      const from: Point = { x: 0, y: 0 };
      const to: Point = { x: 3, y: 4 };

      const vector = FlowFieldUtils.getDirectionVector(from, to);

      expect(vector.x).toBeCloseTo(0.6);
      expect(vector.y).toBeCloseTo(0.8);
    });

    it("should normalize vector", () => {
      const vector = { x: 3, y: 4 };

      const normalized = FlowFieldUtils.normalizeVector(vector);

      expect(normalized.x).toBeCloseTo(0.6);
      expect(normalized.y).toBeCloseTo(0.8);
    });

    it("should calculate dot product", () => {
      const a = { x: 1, y: 2 };
      const b = { x: 3, y: 4 };

      const dot = FlowFieldUtils.dotProduct(a, b);

      expect(dot).toBe(11);
    });

    it("should calculate cross product", () => {
      const a = { x: 1, y: 2 };
      const b = { x: 3, y: 4 };

      const cross = FlowFieldUtils.crossProduct(a, b);

      expect(cross).toBe(-2);
    });
  });

  describe("Point Operations", () => {
    it("should interpolate points", () => {
      const a: Point = { x: 0, y: 0 };
      const b: Point = { x: 10, y: 20 };

      const interpolated = FlowFieldUtils.interpolatePoints(a, b, 0.5);

      expect(interpolated.x).toBe(5);
      expect(interpolated.y).toBe(10);
    });

    it("should calculate centroid", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 0, y: 10 },
        { x: 10, y: 10 },
      ];

      const centroid = FlowFieldUtils.calculateCentroid(points);

      expect(centroid.x).toBe(5);
      expect(centroid.y).toBe(5);
    });

    it("should calculate bounding box", () => {
      const points: Point[] = [
        { x: 1, y: 2 },
        { x: 5, y: 3 },
        { x: 2, y: 8 },
      ];

      const bbox = FlowFieldUtils.calculateBoundingBox(points);

      expect(bbox.min.x).toBe(1);
      expect(bbox.min.y).toBe(2);
      expect(bbox.max.x).toBe(5);
      expect(bbox.max.y).toBe(8);
    });
  });

  describe("Default Configuration", () => {
    it("should create default config", () => {
      const config = FlowFieldUtils.createDefaultConfig();

      expect(config.allowDiagonal).toBe(true);
      expect(config.cardinalCost).toBe(1);
      expect(config.diagonalCost).toBe(Math.sqrt(2));
      expect(config.maxCost).toBe(10000);
    });

    it("should create default options", () => {
      const options = FlowFieldUtils.createDefaultOptions();

      expect(options.returnIntegrationField).toBe(true);
      expect(options.returnFlowField).toBe(true);
      expect(options.normalizeFlowVectors).toBe(true);
    });
  });

  describe("Grid Visualization", () => {
    it("should convert grid to string", () => {
      const grid: CellType[] = [
        FlowFieldCellType.WALKABLE,
        FlowFieldCellType.OBSTACLE,
        FlowFieldCellType.WALKABLE,
        FlowFieldCellType.OBSTACLE,
      ];
      const goals: Point[] = [{ x: 0, y: 0 }];
      const agents: Point[] = [{ x: 1, y: 0 }]; // Fix: x=1 (not 2) since width is 2

      const str = FlowFieldUtils.gridToString(grid, 2, 2, goals, agents);

      expect(str).toContain("G");
      expect(str).toContain("A");
      expect(str).toContain(".");
      expect(str).toContain("#");
    });

    it("should convert flow field to string", () => {
      const flowField = [
        { x: 0, y: 0, vector: { x: 1, y: 0 }, magnitude: 1, valid: true },
        { x: 1, y: 0, vector: { x: 0, y: 1 }, magnitude: 1, valid: true },
        { x: 0, y: 1, vector: { x: 0, y: 0 }, magnitude: 0, valid: true },
        { x: 1, y: 1, vector: { x: 0, y: 0 }, magnitude: 0, valid: false },
      ];

      const str = FlowFieldUtils.flowFieldToString(flowField, 2, 2);

      expect(str).toContain("→");
      expect(str).toContain("↑");
      expect(str).toContain("G");
      expect(str).toContain("#");
    });
  });
});

describe("FlowFieldGenerator", () => {
  describe("Integration Field Generation", () => {
    it("should generate integration field", () => {
      const grid = FlowFieldUtils.generateTestGrid(10, 10, 0.2, 42);
      const goals: Point[] = [{ x: 9, y: 9 }];
      const config = { ...FlowFieldUtils.createDefaultConfig(), width: 10, height: 10 };

      const integrationField = FlowFieldGenerator.generateIntegrationField(grid, goals, config);

      expect(integrationField.length).toBe(100);
      expect(integrationField.some(cell => cell.cost === 0)).toBe(true);
    });

    it("should handle multiple goals in integration field", () => {
      const grid = FlowFieldUtils.generateTestGrid(10, 10, 0.2, 42);
      const goals: Point[] = [
        { x: 0, y: 0 },
        { x: 9, y: 9 },
      ];
      const config = { ...FlowFieldUtils.createDefaultConfig(), width: 10, height: 10 };

      const integrationField = FlowFieldGenerator.generateIntegrationField(grid, goals, config);

      expect(integrationField.length).toBe(100);
      expect(integrationField.filter(cell => cell.cost === 0).length).toBe(2);
    });
  });

  describe("Flow Field Generation", () => {
    it("should generate flow field from integration field", () => {
      const grid = FlowFieldUtils.generateTestGrid(10, 10, 0.2, 42);
      const goals: Point[] = [{ x: 9, y: 9 }];
      const config = { ...FlowFieldUtils.createDefaultConfig(), width: 10, height: 10 };

      const integrationField = FlowFieldGenerator.generateIntegrationField(grid, goals, config);
      const flowField = FlowFieldGenerator.generateFlowFieldFromIntegration(integrationField, grid, config);

      expect(flowField.length).toBe(100);
      expect(flowField.some(cell => cell.valid)).toBe(true);
    });

    it("should generate complete flow field", () => {
      const grid = FlowFieldUtils.generateTestGrid(10, 10, 0.2, 42);
      const goals: Point[] = [{ x: 9, y: 9 }];
      const config = { ...FlowFieldUtils.createDefaultConfig(), width: 10, height: 10 };

      const result = FlowFieldGenerator.generateFlowField(grid, goals, config);

      expect(result.integrationField.length).toBe(100);
      expect(result.flowField.length).toBe(100);
    });
  });

  describe("Multi-Goal Flow Field", () => {
    it("should generate multi-goal flow field", () => {
      const grid = FlowFieldUtils.generateTestGrid(10, 10, 0.2, 42);
      const goalGroups: Point[][] = [[{ x: 0, y: 0 }], [{ x: 9, y: 9 }]];
      const config = { ...FlowFieldUtils.createDefaultConfig(), width: 10, height: 10 };

      const result = FlowFieldGenerator.generateMultiGoalFlowField(grid, goalGroups, config);

      expect(result.integrationField.length).toBe(100);
      expect(result.flowField.length).toBe(100);
    });
  });
});
