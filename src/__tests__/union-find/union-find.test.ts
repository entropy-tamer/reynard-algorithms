import { describe, it, expect } from "vitest";
import { UnionFind, detectCycle, findConnectedComponents } from "../../data-structures/union-find";

describe("UnionFind", () => {
  it("should create a UnionFind with correct initial state", () => {
    const uf = new UnionFind(5);
    expect(uf.connected(0, 1)).toBe(false);
    expect(uf.connected(0, 0)).toBe(true);
  });

  it("should union and find connected components", () => {
    const uf = new UnionFind(5);

    uf.union(0, 1);
    expect(uf.connected(0, 1)).toBe(true);

    uf.union(1, 2);
    expect(uf.connected(0, 2)).toBe(true);
    expect(uf.connected(1, 2)).toBe(true);
  });

  it("should get set size correctly", () => {
    const uf = new UnionFind(5);
    uf.union(0, 1);
    uf.union(1, 2);

    expect(uf.getSetSize(0)).toBe(3);
    expect(uf.getSetSize(3)).toBe(1);
  });

  it("should get set members correctly", () => {
    const uf = new UnionFind(5);
    uf.union(0, 1);
    uf.union(1, 2);

    const members = uf.getSetMembers(0);
    expect(members).toContain(0);
    expect(members).toContain(1);
    expect(members).toContain(2);
    expect(members).toHaveLength(3);
  });

  it("should provide statistics", () => {
    const uf = new UnionFind(5);
    uf.union(0, 1);
    uf.union(1, 2);

    const stats = uf.getStats();
    expect(stats.totalNodes).toBe(5);
    expect(stats.totalSets).toBe(3); // {0,1,2}, {3}, {4}
    expect(stats.unionCount).toBe(2);
  });

  it("should reset correctly", () => {
    const uf = new UnionFind(5);
    uf.union(0, 1);
    uf.union(1, 2);

    uf.reset();
    expect(uf.connected(0, 1)).toBe(false);
    expect(uf.connected(0, 2)).toBe(false);
  });

  it("should clone correctly", () => {
    const uf = new UnionFind(5);
    uf.union(0, 1);

    const clone = uf.clone();
    expect(clone.connected(0, 1)).toBe(true);

    // Modifying clone shouldn't affect original
    clone.union(1, 2);
    expect(uf.connected(1, 2)).toBe(false);
    expect(clone.connected(1, 2)).toBe(true);
  });
});

describe("detectCycle", () => {
  it("should detect cycles in a graph", () => {
    const edges: Array<[number, number]> = [
      [0, 1],
      [1, 2],
      [2, 0], // This creates a cycle
    ];

    expect(detectCycle(edges)).toBe(true);
  });

  it("should not detect cycles in a tree", () => {
    const edges: Array<[number, number]> = [
      [0, 1],
      [1, 2],
      [0, 3],
    ];

    expect(detectCycle(edges)).toBe(false);
  });
});

describe("findConnectedComponents", () => {
  it("should find connected components correctly", () => {
    const edges: Array<[number, number]> = [
      [0, 1],
      [1, 2],
      [3, 4],
    ];

    const components = findConnectedComponents(edges);
    expect(components).toHaveLength(2); // {0,1,2}, {3,4}

    // Check that components are sorted
    const componentWith012 = components.find(comp => comp.includes(0));
    expect(componentWith012).toContain(0);
    expect(componentWith012).toContain(1);
    expect(componentWith012).toContain(2);
  });
});
