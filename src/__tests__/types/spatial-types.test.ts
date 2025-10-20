import { describe, expect, it } from "vitest";
import type {
  SpatialData,
  SpatialObjectData,
  GameEntityData,
  CollisionData,
  RenderData,
  CollisionObjectData,
  SpatialDataType,
  SpatialObject,
  SpatialQueryResult,
  SpatialHashConfig,
  MemoryPoolStats,
} from "../../types/spatial-types";

describe("Spatial Types", () => {
  describe("SpatialData", () => {
    it("should define basic spatial data structure", () => {
      const spatialData: SpatialData = {
        id: "test-1",
        type: "basic",
        metadata: { priority: 1 },
      };

      expect(spatialData.id).toBe("test-1");
      expect(spatialData.type).toBe("basic");
      expect(spatialData.metadata?.priority).toBe(1);
    });

    it("should allow numeric IDs", () => {
      const spatialData: SpatialData = {
        id: 42,
        type: "numbered",
      };

      expect(spatialData.id).toBe(42);
      expect(spatialData.type).toBe("numbered");
    });

    it("should work without optional metadata", () => {
      const spatialData: SpatialData = {
        id: "minimal",
        type: "simple",
      };

      expect(spatialData.metadata).toBeUndefined();
    });
  });

  describe("SpatialObjectData", () => {
    it("should extend SpatialData with category", () => {
      const objectData: SpatialObjectData = {
        id: "entity-1",
        type: "object",
        category: "entity",
        properties: { health: 100 },
      };

      expect(objectData.category).toBe("entity");
      expect(objectData.properties?.health).toBe(100);
    });

    it("should support all category types", () => {
      const categories: SpatialObjectData["category"][] = ["entity", "obstacle", "trigger", "decoration"];

      categories.forEach(category => {
        const data: SpatialObjectData = {
          id: `test-${category}`,
          type: "object",
          category,
        };
        expect(data.category).toBe(category);
      });
    });
  });

  describe("GameEntityData", () => {
    it("should define game entity with all properties", () => {
      const entityData: GameEntityData = {
        id: "player-1",
        type: "entity",
        entityType: "player",
        health: 100,
        damage: 25,
        speed: 5.0,
      };

      expect(entityData.entityType).toBe("player");
      expect(entityData.health).toBe(100);
      expect(entityData.damage).toBe(25);
      expect(entityData.speed).toBe(5.0);
    });

    it("should support all entity types", () => {
      const entityTypes: GameEntityData["entityType"][] = ["player", "enemy", "npc", "item", "projectile"];

      entityTypes.forEach(entityType => {
        const data: GameEntityData = {
          id: `test-${entityType}`,
          type: "entity",
          entityType,
        };
        expect(data.entityType).toBe(entityType);
      });
    });

    it("should work with minimal properties", () => {
      const entityData: GameEntityData = {
        id: "simple-npc",
        type: "entity",
        entityType: "npc",
      };

      expect(entityData.health).toBeUndefined();
      expect(entityData.damage).toBeUndefined();
      expect(entityData.speed).toBeUndefined();
    });
  });

  describe("CollisionData", () => {
    it("should define collision properties", () => {
      const collisionData: CollisionData = {
        id: "wall-1",
        type: "collision",
        collisionType: "solid",
        material: "stone",
        friction: 0.8,
        restitution: 0.2,
      };

      expect(collisionData.collisionType).toBe("solid");
      expect(collisionData.material).toBe("stone");
      expect(collisionData.friction).toBe(0.8);
      expect(collisionData.restitution).toBe(0.2);
    });

    it("should support all collision types", () => {
      const collisionTypes: CollisionData["collisionType"][] = ["solid", "trigger", "platform", "oneway"];

      collisionTypes.forEach(collisionType => {
        const data: CollisionData = {
          id: `test-${collisionType}`,
          type: "collision",
          collisionType,
        };
        expect(data.collisionType).toBe(collisionType);
      });
    });

    it("should support all material types", () => {
      const materials: NonNullable<CollisionData["material"]>[] = ["metal", "wood", "stone", "fabric", "glass"];

      materials.forEach(material => {
        const data: CollisionData = {
          id: `test-${material}`,
          type: "collision",
          collisionType: "solid",
          material,
        };
        expect(data.material).toBe(material);
      });
    });
  });

  describe("RenderData", () => {
    it("should define render properties", () => {
      const renderData: RenderData = {
        id: "sprite-1",
        type: "render",
        sprite: "player.png",
        texture: "metal.jpg",
        color: "#FF0000",
        opacity: 0.8,
        layer: 2,
      };

      expect(renderData.sprite).toBe("player.png");
      expect(renderData.texture).toBe("metal.jpg");
      expect(renderData.color).toBe("#FF0000");
      expect(renderData.opacity).toBe(0.8);
      expect(renderData.layer).toBe(2);
    });

    it("should work with minimal render data", () => {
      const renderData: RenderData = {
        id: "minimal-render",
        type: "render",
      };

      expect(renderData.sprite).toBeUndefined();
      expect(renderData.texture).toBeUndefined();
      expect(renderData.color).toBeUndefined();
    });
  });

  describe("CollisionObjectData", () => {
    it("should define collision object with AABB", () => {
      const collisionObjectData: CollisionObjectData = {
        id: "collision-obj-1",
        type: "collision-object",
        aabb: {
          x: 10,
          y: 20,
          width: 30,
          height: 40,
        },
        index: 5,
      };

      expect(collisionObjectData.aabb.x).toBe(10);
      expect(collisionObjectData.aabb.y).toBe(20);
      expect(collisionObjectData.aabb.width).toBe(30);
      expect(collisionObjectData.aabb.height).toBe(40);
      expect(collisionObjectData.index).toBe(5);
    });

    it("should have readonly AABB properties", () => {
      const data: CollisionObjectData = {
        id: "test",
        type: "collision-object",
        aabb: { x: 0, y: 0, width: 10, height: 10 },
        index: 0,
      };

      // TypeScript compile-time check - readonly properties can't be reassigned
      expect(() => {
        // @ts-expect-error - readonly property
        data.aabb.x = 5;
      }).not.toThrow();
    });
  });

  describe("SpatialDataType union", () => {
    it("should accept all spatial data types", () => {
      const spatialObjectData: SpatialDataType = {
        id: "obj-1",
        type: "object",
        category: "entity",
      };

      const gameEntityData: SpatialDataType = {
        id: "entity-1",
        type: "entity",
        entityType: "player",
      };

      const collisionData: SpatialDataType = {
        id: "collision-1",
        type: "collision",
        collisionType: "solid",
      };

      const renderData: SpatialDataType = {
        id: "render-1",
        type: "render",
      };

      const collisionObjectData: SpatialDataType = {
        id: "col-obj-1",
        type: "collision-object",
        aabb: { x: 0, y: 0, width: 10, height: 10 },
        index: 0,
      };

      expect(spatialObjectData.id).toBe("obj-1");
      expect(gameEntityData.id).toBe("entity-1");
      expect(collisionData.id).toBe("collision-1");
      expect(renderData.id).toBe("render-1");
      expect(collisionObjectData.id).toBe("col-obj-1");
    });
  });

  describe("SpatialObject", () => {
    it("should define spatial object with position and data", () => {
      const spatialObject: SpatialObject = {
        id: "spatial-1",
        x: 100,
        y: 200,
        width: 50,
        height: 75,
        data: {
          id: "data-1",
          type: "entity",
          entityType: "player",
          health: 100,
        },
      };

      expect(spatialObject.x).toBe(100);
      expect(spatialObject.y).toBe(200);
      expect(spatialObject.width).toBe(50);
      expect(spatialObject.height).toBe(75);
      expect((spatialObject.data as GameEntityData).entityType).toBe("player");
    });

    it("should work with typed data", () => {
      const spatialObject: SpatialObject<GameEntityData> = {
        id: "typed-spatial",
        x: 0,
        y: 0,
        width: 32,
        height: 32,
        data: {
          id: "player-data",
          type: "entity",
          entityType: "player",
          health: 100,
          damage: 25,
        },
      };

      expect(spatialObject.data.entityType).toBe("player");
      expect(spatialObject.data.health).toBe(100);
    });
  });

  describe("SpatialQueryResult", () => {
    it("should define query result structure", () => {
      const queryResult: SpatialQueryResult = {
        objects: [
          {
            id: "obj-1",
            x: 10,
            y: 20,
            width: 30,
            height: 40,
            data: {
              id: "data-1",
              type: "entity",
              entityType: "player",
            },
          },
        ],
        queryTime: 1.5,
        totalObjects: 1,
      };

      expect(queryResult.objects.length).toBe(1);
      expect(queryResult.queryTime).toBe(1.5);
      expect(queryResult.totalObjects).toBe(1);
    });

    it("should work with typed results", () => {
      const queryResult: SpatialQueryResult<CollisionData> = {
        objects: [
          {
            id: "collision-obj",
            x: 0,
            y: 0,
            width: 10,
            height: 10,
            data: {
              id: "collision-data",
              type: "collision",
              collisionType: "solid",
              material: "stone",
            },
          },
        ],
        queryTime: 0.8,
        totalObjects: 1,
      };

      expect(queryResult.objects[0].data.collisionType).toBe("solid");
      expect(queryResult.objects[0].data.material).toBe("stone");
    });

    it("should handle empty results", () => {
      const emptyResult: SpatialQueryResult = {
        objects: [],
        queryTime: 0.1,
        totalObjects: 0,
      };

      expect(emptyResult.objects.length).toBe(0);
      expect(emptyResult.totalObjects).toBe(0);
    });
  });

  describe("SpatialHashConfig", () => {
    it("should define spatial hash configuration", () => {
      const config: SpatialHashConfig = {
        cellSize: 64,
        maxObjectsPerCell: 20,
        enableOptimization: true,
      };

      expect(config.cellSize).toBe(64);
      expect(config.maxObjectsPerCell).toBe(20);
      expect(config.enableOptimization).toBe(true);
    });

    it("should handle different configurations", () => {
      const smallConfig: SpatialHashConfig = {
        cellSize: 16,
        maxObjectsPerCell: 5,
        enableOptimization: false,
      };

      const largeConfig: SpatialHashConfig = {
        cellSize: 256,
        maxObjectsPerCell: 100,
        enableOptimization: true,
      };

      expect(smallConfig.cellSize).toBeLessThan(largeConfig.cellSize);
      expect(smallConfig.maxObjectsPerCell).toBeLessThan(largeConfig.maxObjectsPerCell);
    });
  });

  describe("MemoryPoolStats", () => {
    it("should define memory pool statistics", () => {
      const stats: MemoryPoolStats = {
        totalObjects: 1000,
        activeObjects: 750,
        availableObjects: 250,
        peakUsage: 900,
        allocationCount: 5000,
        deallocationCount: 4250,
        averageLifetime: 2500,
      };

      expect(stats.totalObjects).toBe(1000);
      expect(stats.activeObjects).toBe(750);
      expect(stats.availableObjects).toBe(250);
      expect(stats.peakUsage).toBe(900);
      expect(stats.allocationCount).toBe(5000);
      expect(stats.deallocationCount).toBe(4250);
      expect(stats.averageLifetime).toBe(2500);
    });

    it("should maintain logical consistency", () => {
      const stats: MemoryPoolStats = {
        totalObjects: 200,
        activeObjects: 120,
        availableObjects: 80,
        peakUsage: 180,
        allocationCount: 1000,
        deallocationCount: 880,
        averageLifetime: 1500,
      };

      // Active + Available should equal Total
      expect(stats.activeObjects + stats.availableObjects).toBe(stats.totalObjects);

      // Allocation - Deallocation should equal Active
      expect(stats.allocationCount - stats.deallocationCount).toBe(stats.activeObjects);

      // Peak usage should not exceed total capacity
      expect(stats.peakUsage).toBeLessThanOrEqual(stats.totalObjects);
    });
  });

  describe("type compatibility", () => {
    it("should allow using types in function parameters", () => {
      /**
       *
       * @param obj
       * @example
       */
      function processSpatialObject(obj: SpatialObject): number {
        return obj.x + obj.y;
      }

      /**
       *
       * @param result
       * @example
       */
      function analyzeQueryResult(result: SpatialQueryResult): number {
        return result.objects.length;
      }

      const testObject: SpatialObject = {
        id: "test",
        x: 10,
        y: 20,
        width: 30,
        height: 40,
        data: { id: "data", type: "entity", entityType: "player" },
      };

      const testResult: SpatialQueryResult = {
        objects: [testObject],
        queryTime: 1.0,
        totalObjects: 1,
      };

      expect(processSpatialObject(testObject)).toBe(30);
      expect(analyzeQueryResult(testResult)).toBe(1);
    });

    it("should allow using types in generic functions", () => {
      /**
       *
       * @param x
       * @param y
       * @param data
       * @example
       */
      function createTypedSpatialObject<T extends SpatialDataType>(x: number, y: number, data: T): SpatialObject<T> {
        return {
          id: data.id,
          x,
          y,
          width: 32,
          height: 32,
          data,
        };
      }

      const entityData: GameEntityData = {
        id: "player",
        type: "entity",
        entityType: "player",
        health: 100,
      };

      const spatialEntity = createTypedSpatialObject(50, 75, entityData);

      expect(spatialEntity.data.entityType).toBe("player");
      expect(spatialEntity.data.health).toBe(100);
    });
  });
});
