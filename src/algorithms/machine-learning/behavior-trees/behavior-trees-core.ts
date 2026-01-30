/**
 * @file behavior-trees-core.ts
 * @module algorithms/machine-learning/behavior-trees-core
 * @description Behavior Tree implementation for AI decision-making.
 *
 * Mathematical Theory:
 * Behavior trees are hierarchical state machines for AI.
 * Node types:
 * - Selector: Returns success if any child succeeds (OR)
 * - Sequence: Returns success if all children succeed (AND)
 * - Decorator: Modifies child behavior
 * - Action: Performs an action, returns success/failure/running
 * - Condition: Tests a condition, returns success/failure
 */

import type {
  NodeStatus,
  BehaviorTreeNode,
  BehaviorTreeConfig,
  BehaviorTreeResult,
  Blackboard,
} from "./behavior-trees-types";
import { DEFAULT_BEHAVIOR_TREE_CONFIG } from "./behavior-trees-types";

/**
 * Executes a behavior tree node and returns its execution status
 * @param node - The behavior tree node to execute
 * @param blackboard - Shared data structure accessible to all nodes during execution
 * @param executionPath - Array tracking the sequence of node names executed during traversal
 * @returns The execution status of the node (success, failure, or running)
 * @example
 * const status = executeNode(actionNode, blackboard, []);
 */
function executeNode(
  node: BehaviorTreeNode,
  blackboard: Blackboard,
  executionPath: string[]
): NodeStatus {
  executionPath.push(node.name);

  switch (node.type) {
    case 'action':
      if (node.action) {
        return node.action(blackboard);
      }
      return 'failure';

    case 'condition':
      if (node.condition) {
        return node.condition(blackboard) ? 'success' : 'failure';
      }
      return 'failure';

    case 'selector':
      // Return success if any child succeeds
      if (node.children) {
        for (const child of node.children) {
          const status = executeNode(child, blackboard, executionPath);
          if (status === 'success' || status === 'running') {
            return status;
          }
        }
      }
      return 'failure';

    case 'sequence':
      // Return success if all children succeed
      if (node.children) {
        for (const child of node.children) {
          const status = executeNode(child, blackboard, executionPath);
          if (status === 'failure' || status === 'running') {
            return status;
          }
        }
      }
      return 'success';

    case 'decorator':
      // Apply decorator to first child
      if (node.children && node.children.length > 0) {
        const firstChild = node.children[0];
        if (firstChild) {
          if (node.decorator) {
            return node.decorator(firstChild, blackboard);
          }
          return executeNode(firstChild, blackboard, executionPath);
        }
      }
      return 'failure';

    default:
      return 'failure';
  }
}

/**
 * Behavior Tree implementation.
 */
export class BehaviorTree {
  private config: Required<BehaviorTreeConfig>;
  private root: BehaviorTreeNode | null = null;
  private blackboard: Blackboard = {};

  /**
   * Creates a new BehaviorTree instance with the specified configuration
   * @param config - Partial configuration object that will be merged with defaults
   * @example
   * const tree = new BehaviorTree({ maxDepth: 10, validateInput: true });
   */
  constructor(config: Partial<BehaviorTreeConfig> = {}) {
    this.config = { ...DEFAULT_BEHAVIOR_TREE_CONFIG, ...config };
  }

  /**
   * Sets the root node of the behavior tree
   * @param root - The root behavior tree node that serves as the entry point for execution
   * @example
   * tree.setRoot({ type: 'selector', name: 'root', children: [...] });
   */
  setRoot(root: BehaviorTreeNode): void {
    if (this.config.validateInput) {
      this.validateNode(root);
    }
    this.root = root;
  }

  /**
   * Validates the structure and required properties of a behavior tree node
   * @param node - The behavior tree node to validate
   * @throws {Error} If the node structure is invalid or required properties are missing
   * @example
   * this.validateNode(actionNode);
   */
  private validateNode(node: BehaviorTreeNode): void {
    if (node.type === 'action' && !node.action) {
      throw new Error(`Action node "${node.name}" must have an action function`);
    }
    if (node.type === 'condition' && !node.condition) {
      throw new Error(`Condition node "${node.name}" must have a condition function`);
    }
    if ((node.type === 'selector' || node.type === 'sequence') && (!node.children || node.children.length === 0)) {
      throw new Error(`${node.type} node "${node.name}" must have children`);
    }
    if (node.children) {
      for (const child of node.children) {
        this.validateNode(child);
      }
    }
  }

  /**
   * Executes the behavior tree starting from the root node
   * @param blackboard - Optional shared data structure; uses internal blackboard if not provided
   * @returns Execution result containing status, execution path, and node count
   * @throws {Error} If the root node has not been set
   * @example
   * const result = tree.execute({ health: 100, enemyNearby: true });
   */
  execute(blackboard?: Blackboard): BehaviorTreeResult {
    if (!this.root) {
      throw new Error("Behavior tree root not set. Call setRoot() first.");
    }

    const executionPath: string[] = [];
    const bb = blackboard ?? this.blackboard;
    const status = executeNode(this.root, bb, executionPath);

    return {
      status,
      executionPath,
      nodesExecuted: executionPath.length,
    };
  }

  /**
   * Sets a value in the internal blackboard data structure
   * @param key - The key identifier for the blackboard entry
   * @param value - The value to store in the blackboard
   * @example
   * tree.setBlackboard('health', 100);
   */
  setBlackboard(key: string, value: unknown): void {
    this.blackboard[key] = value;
  }

  /**
   * Retrieves a value from the internal blackboard data structure
   * @param key - The key identifier for the blackboard entry to retrieve
   * @returns The value associated with the key, or undefined if not found
   * @example
   * const health = tree.getBlackboard('health');
   */
  getBlackboard(key: string): unknown {
    return this.blackboard[key];
  }
}


