/**
 * @file behavior-trees.test.ts
 * @description Tests for Behavior Trees algorithm.
 */

import { describe, it, expect } from "vitest";
import { BehaviorTree } from "../../algorithms/machine-learning/behavior-trees/behavior-trees-core";
import type { BehaviorTreeNode } from "../../algorithms/machine-learning/behavior-trees/behavior-trees-types";

describe("BehaviorTree", () => {
  describe("Node execution", () => {
    it("should execute action node", () => {
      const tree = new BehaviorTree();
      const root: BehaviorTreeNode = {
        type: "action",
        name: "test-action",
        action: () => "success",
      };

      tree.setRoot(root);
      const result = tree.execute();

      expect(result.status).toBe("success");
      expect(result.executionPath).toContain("test-action");
    });

    it("should execute condition node", () => {
      const tree = new BehaviorTree();
      const root: BehaviorTreeNode = {
        type: "condition",
        name: "test-condition",
        condition: () => true,
      };

      tree.setRoot(root);
      const result = tree.execute();

      expect(result.status).toBe("success");
    });

    it("should execute selector node (OR)", () => {
      const tree = new BehaviorTree();
      const root: BehaviorTreeNode = {
        type: "selector",
        name: "selector",
        children: [
          { type: "action", name: "fail", action: () => "failure" },
          { type: "action", name: "succeed", action: () => "success" },
        ],
      };

      tree.setRoot(root);
      const result = tree.execute();

      expect(result.status).toBe("success");
    });

    it("should execute sequence node (AND)", () => {
      const tree = new BehaviorTree();
      const root: BehaviorTreeNode = {
        type: "sequence",
        name: "sequence",
        children: [
          { type: "action", name: "succeed1", action: () => "success" },
          { type: "action", name: "succeed2", action: () => "success" },
        ],
      };

      tree.setRoot(root);
      const result = tree.execute();

      expect(result.status).toBe("success");
    });
  });

  describe("Blackboard", () => {
    it("should store and retrieve blackboard values", () => {
      const tree = new BehaviorTree();
      tree.setBlackboard("test", 42);
      expect(tree.getBlackboard("test")).toBe(42);
    });
  });
});


