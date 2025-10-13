import { describe, expect, it } from "vitest";
import type {
  SpatialHashConfig,
  SpatialHashStats,
  SpatialObject,
  QueryResult,
} from "../../spatial-structures/spatial-hash/spatial-hash-types";
import type { SpatialObjectData, GameEntityData } from "../../types/spatial-types";

describe("Spatial Hash Types", () => {
  // Helper function to create test spatial data
  function createTestSpatialData(id: string, category: "entity" | "obstacle" | "trigger" | "decoration" = "entity"): SpatialObjectData {
    return {
      id,
      type: "test",
      category,
      properties: { test: true }
    };
  }

  // Helper function to create test game entity data
  function createTestGameEntityData(id: string, entityType: "player" | "enemy" | "npc" | "item" | "projectile" = "player"): GameEntityData {
    return {
      id,
      type: "game-entity",
      entityType,
      health: 100
    };
  }
  describe("SpatialHashConfig interface", () => {
    it("should create a valid spatial hash configuration", () => {
      const config: SpatialHashConfig = {
        cellSize: 64,
        maxObjectsPerCell: 10,
        enableAutoResize: true,
        resizeThreshold: 0.8,
        cleanupInterval: 1000,
      };

      expect(config.cellSize).toBe(64);
      expect(config.maxObjectsPerCell).toBe(10);
      expect(config.enableAutoResize).toBe(true);
      expect(config.resizeThreshold).toBe(0.8);
      expect(config.cleanupInterval).toBe(1000);
    });

    it("should handle disabled auto resize", () => {
      const config: SpatialHashConfig = {
        cellSize: 32,
        maxObjectsPerCell: 5,
        enableAutoResize: false,
        resizeThreshold: 0.5,
        cleanupInterval: 500,
      };

      expect(config.enableAutoResize).toBe(false);
      expect(config.resizeThreshold).toBe(0.5);
      expect(config.cleanupInterval).toBe(500);
    });

    it("should handle edge case values", () => {
      const config: SpatialHashConfig = {
        cellSize: 1,
        maxObjectsPerCell: 1,
        enableAutoResize: true,
        resizeThreshold: 0,
        cleanupInterval: 0,
      };

      expect(config.cellSize).toBe(1);
      expect(config.maxObjectsPerCell).toBe(1);
      expect(config.resizeThreshold).toBe(0);
      expect(config.cleanupInterval).toBe(0);
    });

    it("should handle fractional threshold values", () => {
      const config: SpatialHashConfig = {
        cellSize: 100,
        maxObjectsPerCell: 20,
        enableAutoResize: true,
        resizeThreshold: 0.75,
        cleanupInterval: 2000,
      };

      expect(config.resizeThreshold).toBe(0.75);
    });
  });

  describe("SpatialHashStats interface", () => {
    it("should create spatial hash statistics", () => {
      const stats: SpatialHashStats = {
        totalCells: 100,
        totalObjects: 500,
        averageObjectsPerCell: 5.0,
        maxObjectsInCell: 15,
        emptyCells: 20,
        memoryUsage: 1024,
        queryCount: 1000,
        insertCount: 500,
        removeCount: 50,
      };

      expect(stats.totalCells).toBe(100);
      expect(stats.totalObjects).toBe(500);
      expect(stats.averageObjectsPerCell).toBe(5.0);
      expect(stats.maxObjectsInCell).toBe(15);
      expect(stats.emptyCells).toBe(20);
      expect(stats.memoryUsage).toBe(1024);
      expect(stats.queryCount).toBe(1000);
      expect(stats.insertCount).toBe(500);
      expect(stats.removeCount).toBe(50);
    });

    it("should handle zero values", () => {
      const stats: SpatialHashStats = {
        totalCells: 0,
        totalObjects: 0,
        averageObjectsPerCell: 0,
        maxObjectsInCell: 0,
        emptyCells: 0,
        memoryUsage: 0,
        queryCount: 0,
        insertCount: 0,
        removeCount: 0,
      };

      expect(stats.totalCells).toBe(0);
      expect(stats.totalObjects).toBe(0);
      expect(stats.averageObjectsPerCell).toBe(0);
      expect(stats.maxObjectsInCell).toBe(0);
      expect(stats.emptyCells).toBe(0);
      expect(stats.memoryUsage).toBe(0);
      expect(stats.queryCount).toBe(0);
      expect(stats.insertCount).toBe(0);
      expect(stats.removeCount).toBe(0);
    });

    it("should handle fractional average values", () => {
      const stats: SpatialHashStats = {
        totalCells: 10,
        totalObjects: 33,
        averageObjectsPerCell: 3.3,
        maxObjectsInCell: 7,
        emptyCells: 2,
        memoryUsage: 2048,
        queryCount: 500,
        insertCount: 33,
        removeCount: 5,
      };

      expect(stats.averageObjectsPerCell).toBe(3.3);
    });
  });

  describe("SpatialObject interface", () => {
    it("should create a spatial object with string id", () => {
      const obj: SpatialObject = {
        id: "object-1",
        x: 100,
        y: 200,
        width: 50,
        height: 75,
        data: createTestSpatialData("object-1"),
      };

      expect(obj.id).toBe("object-1");
      expect(obj.x).toBe(100);
      expect(obj.y).toBe(200);
      expect(obj.width).toBe(50);
      expect(obj.height).toBe(75);
      expect(obj.data).toBe("test-data");
    });

    it("should create a spatial object with number id", () => {
      const obj: SpatialObject = {
        id: 123,
        x: 0,
        y: 0,
        data: createTestGameEntityData("player-123", "player"),
      };

      expect(obj.id).toBe(123);
      expect(obj.x).toBe(0);
      expect(obj.y).toBe(0);
      expect(obj.data).toEqual({ type: "player", health: 100 });
    });

    it("should handle objects without dimensions", () => {
      const obj: SpatialObject = {
        id: "point-object",
        x: 50,
        y: 75,
        data: createTestSpatialData("point-data"),
      };

      expect(obj.id).toBe("point-object");
      expect(obj.x).toBe(50);
      expect(obj.y).toBe(75);
      expect(obj.width).toBeUndefined();
      expect(obj.height).toBeUndefined();
      expect(obj.data).toBe("point-data");
    });

    it("should handle negative coordinates", () => {
      const obj: SpatialObject = {
        id: "negative-coords",
        x: -100,
        y: -200,
        width: 50,
        height: 75,
        data: createTestSpatialData("negative-data"),
      };

      expect(obj.x).toBe(-100);
      expect(obj.y).toBe(-200);
      expect(obj.width).toBe(50);
      expect(obj.height).toBe(75);
    });

    it("should handle fractional coordinates", () => {
      const obj: SpatialObject = {
        id: "fractional-coords",
        x: 10.5,
        y: 20.7,
        width: 30.3,
        height: 40.9,
        data: createTestSpatialData("fractional-data"),
      };

      expect(obj.x).toBe(10.5);
      expect(obj.y).toBe(20.7);
      expect(obj.width).toBe(30.3);
      expect(obj.height).toBe(40.9);
    });
  });

  describe("QueryResult interface", () => {
    it("should create a query result", () => {
      const spatialObject: SpatialObject = {
        id: "test-object",
        x: 100,
        y: 200,
        width: 50,
        height: 75,
        data: createTestSpatialData("test-data"),
      };

      const result: QueryResult = {
        object: spatialObject,
        distance: 25.5,
        cellKey: "cell-1-2",
      };

      expect(result.object).toBe(spatialObject);
      expect(result.distance).toBe(25.5);
      expect(result.cellKey).toBe("cell-1-2");
    });

    it("should handle zero distance", () => {
      const spatialObject: SpatialObject = {
        id: "zero-distance",
        x: 0,
        y: 0,
        data: createTestSpatialData("zero-data"),
      };

      const result: QueryResult = {
        object: spatialObject,
        distance: 0,
        cellKey: "cell-0-0",
      };

      expect(result.distance).toBe(0);
      expect(result.cellKey).toBe("cell-0-0");
    });

    it("should handle large distances", () => {
      const spatialObject: SpatialObject = {
        id: "far-object",
        x: 1000,
        y: 2000,
        data: createTestSpatialData("far-data"),
      };

      const result: QueryResult = {
        object: spatialObject,
        distance: Number.MAX_SAFE_INTEGER,
        cellKey: "cell-100-200",
      };

      expect(result.distance).toBe(Number.MAX_SAFE_INTEGER);
      expect(result.cellKey).toBe("cell-100-200");
    });

    it("should handle complex cell keys", () => {
      const spatialObject: SpatialObject = {
        id: "complex-key",
        x: -100,
        y: -200,
        data: createTestSpatialData("complex-data"),
      };

      const result: QueryResult = {
        object: spatialObject,
        distance: 15.7,
        cellKey: "cell--2--4",
      };

      expect(result.cellKey).toBe("cell--2--4");
    });
  });

  describe("Type compatibility", () => {
    it("should allow SpatialObject to be used in QueryResult", () => {
      const spatialObject: SpatialObject = {
        id: "compatibility-test",
        x: 100,
        y: 200,
        data: createTestSpatialData("compatibility-data"),
      };

      const result: QueryResult = {
        object: spatialObject,
        distance: 10,
        cellKey: "test-cell",
      };

      expect(result.object).toBe(spatialObject);
      expect(result.object.id).toBe("compatibility-test");
    });

    it("should handle generic type constraints", () => {
      interface CustomData extends SpatialObjectData {
        value: number;
      }

      const customObject: SpatialObject<CustomData> = {
        id: "custom-object",
        x: 50,
        y: 75,
        data: { 
          id: "custom-object",
          type: "custom", 
          category: "entity" as const,
          value: 42 
        },
      };

      const result: QueryResult<CustomData> = {
        object: customObject,
        distance: 5,
        cellKey: "custom-cell",
      };

      expect(result.object.data.type).toBe("custom");
      expect(result.object.data.value).toBe(42);
    });
  });
});
