import { describe, expect, it } from "vitest";
import type { UnionFindNode, UnionFindStats } from "../../data-structures/union-find/union-find-types";

describe("Union-Find Types", () => {
  describe("UnionFindNode", () => {
    it("should define data-structures/union-find node structure", () => {
      const node: UnionFindNode = {
        parent: 5,
        rank: 2,
      };

      expect(node.parent).toBe(5);
      expect(node.rank).toBe(2);
    });

    it("should represent root nodes", () => {
      const rootNode: UnionFindNode = {
        parent: 0, // Points to itself (index 0)
        rank: 3,
      };

      expect(rootNode.parent).toBe(0);
      expect(rootNode.rank).toBe(3);
    });

    it("should represent leaf nodes", () => {
      const leafNode: UnionFindNode = {
        parent: 7, // Points to another node
        rank: 0, // Leaf has rank 0
      };

      expect(leafNode.parent).toBe(7);
      expect(leafNode.rank).toBe(0);
    });

    it("should handle various rank values", () => {
      const nodes: UnionFindNode[] = [
        { parent: 0, rank: 0 },
        { parent: 1, rank: 1 },
        { parent: 2, rank: 2 },
        { parent: 3, rank: 5 },
      ];

      nodes.forEach((node, index) => {
        expect(node.parent).toBe(index);
        expect(node.rank).toBeGreaterThanOrEqual(0);
      });
    });

    it("should support high rank values for deep trees", () => {
      const deepNode: UnionFindNode = {
        parent: 42,
        rank: 10,
      };

      expect(deepNode.rank).toBe(10);
      expect(deepNode.parent).toBe(42);
    });
  });

  describe("UnionFindStats", () => {
    it("should define comprehensive statistics", () => {
      const stats: UnionFindStats = {
        totalNodes: 1000,
        totalSets: 25,
        maxRank: 8,
        averageRank: 2.5,
        compressionCount: 150,
        unionCount: 975,
      };

      expect(stats.totalNodes).toBe(1000);
      expect(stats.totalSets).toBe(25);
      expect(stats.maxRank).toBe(8);
      expect(stats.averageRank).toBe(2.5);
      expect(stats.compressionCount).toBe(150);
      expect(stats.unionCount).toBe(975);
    });

    it("should maintain logical consistency", () => {
      const stats: UnionFindStats = {
        totalNodes: 100,
        totalSets: 10,
        maxRank: 4,
        averageRank: 1.8,
        compressionCount: 50,
        unionCount: 90,
      };

      // Total sets should be less than or equal to total nodes
      expect(stats.totalSets).toBeLessThanOrEqual(stats.totalNodes);

      // Union count should be less than total nodes (since we start with n sets)
      expect(stats.unionCount).toBeLessThan(stats.totalNodes);

      // Average rank should be less than or equal to max rank
      expect(stats.averageRank).toBeLessThanOrEqual(stats.maxRank);

      // In a well-connected structure: totalNodes - unionCount ≈ totalSets
      expect(stats.totalNodes - stats.unionCount).toBe(stats.totalSets);
    });

    it("should handle edge cases", () => {
      // Single node case
      const singleNodeStats: UnionFindStats = {
        totalNodes: 1,
        totalSets: 1,
        maxRank: 0,
        averageRank: 0,
        compressionCount: 0,
        unionCount: 0,
      };

      expect(singleNodeStats.totalSets).toBe(1);
      expect(singleNodeStats.unionCount).toBe(0);

      // Fully connected case (all nodes in one set)
      const fullyConnectedStats: UnionFindStats = {
        totalNodes: 50,
        totalSets: 1,
        maxRank: 6,
        averageRank: 1.2,
        compressionCount: 25,
        unionCount: 49,
      };

      expect(fullyConnectedStats.totalSets).toBe(1);
      expect(fullyConnectedStats.unionCount).toBe(fullyConnectedStats.totalNodes - 1);

      // No connections case
      const disconnectedStats: UnionFindStats = {
        totalNodes: 20,
        totalSets: 20,
        maxRank: 0,
        averageRank: 0,
        compressionCount: 0,
        unionCount: 0,
      };

      expect(disconnectedStats.totalSets).toBe(disconnectedStats.totalNodes);
      expect(disconnectedStats.unionCount).toBe(0);
      expect(disconnectedStats.maxRank).toBe(0);
    });

    it("should track optimization metrics", () => {
      const optimizedStats: UnionFindStats = {
        totalNodes: 500,
        totalSets: 5,
        maxRank: 3, // Low max rank indicates good path compression
        averageRank: 1.1, // Low average rank
        compressionCount: 200, // High compression count shows optimization
        unionCount: 495,
      };

      // High compression relative to operations shows good optimization
      const compressionRatio = optimizedStats.compressionCount / optimizedStats.unionCount;
      expect(compressionRatio).toBeGreaterThan(0.3); // More than 30% compression

      // Low average rank shows flat trees
      expect(optimizedStats.averageRank).toBeLessThan(2);
    });

    it("should handle performance analysis", () => {
      // Scenario: Large dataset with good performance characteristics
      const performanceStats: UnionFindStats = {
        totalNodes: 10000,
        totalSets: 100,
        maxRank: 5, // Logarithmic height
        averageRank: 2.1,
        compressionCount: 3000,
        unionCount: 9900,
      };

      // Calculate performance indicators
      const setReductionRatio =
        (performanceStats.totalNodes - performanceStats.totalSets) / performanceStats.totalNodes;
      const rankEfficiency = performanceStats.maxRank / Math.log2(performanceStats.totalNodes);

      expect(setReductionRatio).toBeGreaterThan(0.9); // 90%+ reduction in sets
      expect(rankEfficiency).toBeLessThan(1); // Better than simple tree
      expect(performanceStats.maxRank).toBeLessThan(15); // Reasonable height for 10k nodes
    });
  });

  describe("type usage patterns", () => {
    it("should support node creation patterns", () => {
      function createUnionFindNode(parent: number, rank: number = 0): UnionFindNode {
        return { parent, rank };
      }

      const node1 = createUnionFindNode(5);
      const node2 = createUnionFindNode(3, 2);

      expect(node1.parent).toBe(5);
      expect(node1.rank).toBe(0);
      expect(node2.parent).toBe(3);
      expect(node2.rank).toBe(2);
    });

    it("should support statistics aggregation", () => {
      function aggregateStats(statsArray: UnionFindStats[]): UnionFindStats {
        const total = statsArray.length;

        return {
          totalNodes: statsArray.reduce((sum, s) => sum + s.totalNodes, 0),
          totalSets: statsArray.reduce((sum, s) => sum + s.totalSets, 0),
          maxRank: Math.max(...statsArray.map(s => s.maxRank)),
          averageRank: statsArray.reduce((sum, s) => sum + s.averageRank, 0) / total,
          compressionCount: statsArray.reduce((sum, s) => sum + s.compressionCount, 0),
          unionCount: statsArray.reduce((sum, s) => sum + s.unionCount, 0),
        };
      }

      const stats1: UnionFindStats = {
        totalNodes: 100,
        totalSets: 10,
        maxRank: 3,
        averageRank: 1.5,
        compressionCount: 30,
        unionCount: 90,
      };

      const stats2: UnionFindStats = {
        totalNodes: 200,
        totalSets: 15,
        maxRank: 4,
        averageRank: 2.0,
        compressionCount: 50,
        unionCount: 185,
      };

      const aggregated = aggregateStats([stats1, stats2]);

      expect(aggregated.totalNodes).toBe(300);
      expect(aggregated.totalSets).toBe(25);
      expect(aggregated.maxRank).toBe(4);
      expect(aggregated.averageRank).toBe(1.75);
      expect(aggregated.compressionCount).toBe(80);
      expect(aggregated.unionCount).toBe(275);
    });

    it("should support tree analysis functions", () => {
      function analyzeTreeHealth(stats: UnionFindStats): {
        isWellOptimized: boolean;
        compressionEfficiency: number;
        setConsolidation: number;
      } {
        const compressionEfficiency = stats.compressionCount / Math.max(stats.unionCount, 1);
        const setConsolidation = 1 - stats.totalSets / stats.totalNodes;
        const isWellOptimized = stats.averageRank < 3 && compressionEfficiency > 0.2;

        return {
          isWellOptimized,
          compressionEfficiency,
          setConsolidation,
        };
      }

      const goodStats: UnionFindStats = {
        totalNodes: 1000,
        totalSets: 50,
        maxRank: 4,
        averageRank: 2.1,
        compressionCount: 250,
        unionCount: 950,
      };

      const analysis = analyzeTreeHealth(goodStats);

      expect(analysis.isWellOptimized).toBe(true);
      expect(analysis.compressionEfficiency).toBeGreaterThan(0.2);
      expect(analysis.setConsolidation).toBeGreaterThan(0.9);
    });

    it("should support array operations", () => {
      function createNodeArray(size: number): UnionFindNode[] {
        return Array.from({ length: size }, (_, i) => ({
          parent: i, // Initially each node is its own parent
          rank: 0, // Initially all ranks are 0
        }));
      }

      const nodes = createNodeArray(5);

      expect(nodes.length).toBe(5);
      nodes.forEach((node, index) => {
        expect(node.parent).toBe(index);
        expect(node.rank).toBe(0);
      });
    });
  });

  describe("validation patterns", () => {
    it("should validate node consistency", () => {
      function isValidNode(node: UnionFindNode, maxIndex: number): boolean {
        return node.parent >= 0 && node.parent <= maxIndex && node.rank >= 0;
      }

      const validNode: UnionFindNode = { parent: 5, rank: 2 };
      const invalidNode1: UnionFindNode = { parent: -1, rank: 2 }; // Invalid parent
      const invalidNode2: UnionFindNode = { parent: 5, rank: -1 }; // Invalid rank

      expect(isValidNode(validNode, 10)).toBe(true);
      expect(isValidNode(invalidNode1, 10)).toBe(false);
      expect(isValidNode(invalidNode2, 10)).toBe(false);
    });

    it("should validate statistics consistency", () => {
      function isValidStats(stats: UnionFindStats): boolean {
        return (
          stats.totalNodes >= 0 &&
          stats.totalSets >= 0 &&
          stats.totalSets <= stats.totalNodes &&
          stats.maxRank >= 0 &&
          stats.averageRank >= 0 &&
          stats.averageRank <= stats.maxRank &&
          stats.compressionCount >= 0 &&
          stats.unionCount >= 0 &&
          stats.unionCount < stats.totalNodes
        );
      }

      const validStats: UnionFindStats = {
        totalNodes: 100,
        totalSets: 10,
        maxRank: 4,
        averageRank: 2.1,
        compressionCount: 30,
        unionCount: 90,
      };

      const invalidStats: UnionFindStats = {
        totalNodes: 100,
        totalSets: 150,
        maxRank: 4,
        averageRank: 2.1, // totalSets > totalNodes
        compressionCount: 30,
        unionCount: 90,
      };

      expect(isValidStats(validStats)).toBe(true);
      expect(isValidStats(invalidStats)).toBe(false);
    });
  });
});
