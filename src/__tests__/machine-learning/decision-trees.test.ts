/**
 * @file decision-trees.test.ts
 * @description Tests for Decision Trees algorithm.
 */

import { describe, it, expect } from "vitest";
import { DecisionTree } from "../../algorithms/machine-learning/decision-trees/decision-trees-core";
import type { DataPoint } from "../../algorithms/machine-learning/decision-trees/decision-trees-types";

describe("DecisionTree", () => {
  describe("Training and prediction", () => {
    it("should train on simple dataset", () => {
      const data: DataPoint[] = [
        { features: [1, 1], label: "A" },
        { features: [1, 2], label: "A" },
        { features: [2, 1], label: "B" },
        { features: [2, 2], label: "B" },
      ];

      const tree = new DecisionTree({ maxDepth: 5 });
      const result = tree.train(data);

      expect(result.root).toBeDefined();
      expect(result.depth).toBeGreaterThan(0);
      expect(result.nodeCount).toBeGreaterThan(0);
    });

    it("should make predictions", () => {
      const data: DataPoint[] = [
        { features: [1, 1], label: "A" },
        { features: [1, 2], label: "A" },
        { features: [2, 1], label: "B" },
        { features: [2, 2], label: "B" },
      ];

      const tree = new DecisionTree();
      tree.train(data);

      const prediction = tree.predict([1, 1]);
      expect(prediction).toBeDefined();
      expect(typeof prediction === "string" || typeof prediction === "number").toBe(true);
    });
  });

  describe("Gini vs Entropy", () => {
    it("should work with Gini criterion", () => {
      const data: DataPoint[] = [
        { features: [1], label: "A" },
        { features: [2], label: "B" },
      ];

      const tree = new DecisionTree({ criterion: "gini" });
      const result = tree.train(data);
      expect(result.root).toBeDefined();
    });

    it("should work with Entropy criterion", () => {
      const data: DataPoint[] = [
        { features: [1], label: "A" },
        { features: [2], label: "B" },
      ];

      const tree = new DecisionTree({ criterion: "entropy" });
      const result = tree.train(data);
      expect(result.root).toBeDefined();
    });
  });
});


