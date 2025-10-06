import { describe, it, expect, beforeEach } from "vitest";
import { SpatialHash } from "../../spatial-hash/spatial-hash-core";
import type { SpatialObject } from "../../spatial-hash/spatial-hash-types";

describe("SpatialHash", () => {
  let spatialHash: SpatialHash<{ name: string }>;

  beforeEach(() => {
    spatialHash = new SpatialHash({ cellSize: 100 });
  });

  describe("constructor", () => {
    it("should create spatial hash with default config", () => {
      const hash = new SpatialHash();
      expect(hash).toBeDefined();
    });

    it("should create spatial hash with custom config", () => {
      const hash = new SpatialHash({ cellSize: 50, maxObjectsPerCell: 25 });
      expect(hash).toBeDefined();
    });
  });

  describe("insert", () => {
    it("should insert an object into the spatial hash", () => {
      const obj: SpatialObject & { data: { name: string } } = {
        id: "1",
        x: 50,
        y: 50,
        data: { name: "test" },
      };

      spatialHash.insert(obj);
      const results = spatialHash.queryRect(0, 0, 100, 100);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("1");
    });

    it("should handle multiple objects in same cell", () => {
      const obj1: SpatialObject & { data: { name: string } } = {
        id: "1",
        x: 50,
        y: 50,
        data: { name: "test1" },
      };
      const obj2: SpatialObject & { data: { name: string } } = {
        id: "2",
        x: 75,
        y: 75,
        data: { name: "test2" },
      };

      spatialHash.insert(obj1);
      spatialHash.insert(obj2);
      const results = spatialHash.queryRect(0, 0, 100, 100);
      expect(results).toHaveLength(2);
    });
  });

  describe("remove", () => {
    it("should remove an object from the spatial hash", () => {
      const obj: SpatialObject & { data: { name: string } } = {
        id: "1",
        x: 50,
        y: 50,
        data: { name: "test" },
      };

      spatialHash.insert(obj);
      expect(spatialHash.remove("1")).toBe(true);

      const results = spatialHash.queryRect(0, 0, 100, 100);
      expect(results).toHaveLength(0);
    });

    it("should return false when removing non-existent object", () => {
      expect(spatialHash.remove("nonexistent")).toBe(false);
    });
  });

  describe("update", () => {
    it("should update an object position", () => {
      const obj: SpatialObject & { data: { name: string } } = {
        id: "1",
        x: 50,
        y: 50,
        data: { name: "test" },
      };

      spatialHash.insert(obj);

      const updatedObj = { ...obj, x: 150, y: 150 };
      expect(spatialHash.update(updatedObj)).toBe(true);

      const results = spatialHash.queryRect(100, 100, 100, 100);
      expect(results).toHaveLength(1);
      expect(results[0].x).toBe(150);
    });

    it("should return false when updating non-existent object", () => {
      const obj: SpatialObject & { data: { name: string } } = {
        id: "1",
        x: 50,
        y: 50,
        data: { name: "test" },
      };

      expect(spatialHash.update(obj)).toBe(false);
    });
  });

  describe("queryRect", () => {
    it("should query objects in rectangular area", () => {
      const obj1: SpatialObject & { data: { name: string } } = {
        id: "1",
        x: 50,
        y: 50,
        data: { name: "test1" },
      };
      const obj2: SpatialObject & { data: { name: string } } = {
        id: "2",
        x: 150,
        y: 150,
        data: { name: "test2" },
      };

      spatialHash.insert(obj1);
      spatialHash.insert(obj2);

      const results = spatialHash.queryRect(0, 0, 100, 100);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("1");
    });

    it("should return empty array for empty query area", () => {
      const results = spatialHash.queryRect(0, 0, 100, 100);
      expect(results).toHaveLength(0);
    });
  });

  describe("queryRadius", () => {
    it("should query objects within radius", () => {
      const obj1: SpatialObject & { data: { name: string } } = {
        id: "1",
        x: 50,
        y: 50,
        data: { name: "test1" },
      };
      const obj2: SpatialObject & { data: { name: string } } = {
        id: "2",
        x: 200,
        y: 200,
        data: { name: "test2" },
      };

      spatialHash.insert(obj1);
      spatialHash.insert(obj2);

      const results = spatialHash.queryRadius(0, 0, 100);
      expect(results).toHaveLength(1);
      expect(results[0].object.id).toBe("1");
    });
  });

  describe("findNearest", () => {
    it("should find nearest object to a point", () => {
      const obj1: SpatialObject & { data: { name: string } } = {
        id: "1",
        x: 50,
        y: 50,
        data: { name: "test1" },
      };
      const obj2: SpatialObject & { data: { name: string } } = {
        id: "2",
        x: 200,
        y: 200,
        data: { name: "test2" },
      };

      spatialHash.insert(obj1);
      spatialHash.insert(obj2);

      const nearest = spatialHash.findNearest(0, 0);
      expect(nearest).toBeDefined();
      expect(nearest?.object.id).toBe("1");
    });

    it("should return null when no objects exist", () => {
      const nearest = spatialHash.findNearest(0, 0);
      expect(nearest).toBeNull();
    });
  });

  describe("clear", () => {
    it("should clear all objects from spatial hash", () => {
      const obj: SpatialObject & { data: { name: string } } = {
        id: "1",
        x: 50,
        y: 50,
        data: { name: "test" },
      };

      spatialHash.insert(obj);
      spatialHash.clear();

      const results = spatialHash.queryRect(0, 0, 100, 100);
      expect(results).toHaveLength(0);
    });
  });

  describe("getStats", () => {
    it("should return statistics about the spatial hash", () => {
      const obj: SpatialObject & { data: { name: string } } = {
        id: "1",
        x: 50,
        y: 50,
        data: { name: "test" },
      };

      spatialHash.insert(obj);
      const stats = spatialHash.getStats();

      expect(stats.insertCount).toBe(1);
      expect(stats.queryCount).toBe(0);
      expect(stats.removeCount).toBe(0);
    });
  });

  describe("getAllObjects", () => {
    it("should return all objects in the spatial hash", () => {
      expect(spatialHash.getAllObjects()).toHaveLength(0);

      const obj: SpatialObject & { data: { name: string } } = {
        id: "1",
        x: 50,
        y: 50,
        data: { name: "test" },
      };

      spatialHash.insert(obj);
      const allObjects = spatialHash.getAllObjects();
      expect(allObjects).toHaveLength(1);
      expect(allObjects[0].id).toBe("1");
    });
  });
});
