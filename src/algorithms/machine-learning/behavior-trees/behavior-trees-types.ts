/**
 * @file behavior-trees-types.ts
 * @module algorithms/machine-learning/behavior-trees-types
 * @description Type definitions for Behavior Trees.
 */

/**
 * Node execution status.
 */
export type NodeStatus = 'success' | 'failure' | 'running';

/**
 * Behavior tree node type.
 */
export type NodeType = 'selector' | 'sequence' | 'decorator' | 'action' | 'condition';

/**
 * Blackboard for shared data.
 */
export interface Blackboard {
  [key: string]: any;
}

/**
 * Behavior tree node.
 */
export interface BehaviorTreeNode {
  /**
   * Node type.
   */
  type: NodeType;
  /**
   * Node name/identifier.
   */
  name: string;
  /**
   * Child nodes.
   */
  children?: BehaviorTreeNode[];
  /**
   * Action function (for action nodes).
   */
  action?: (blackboard: Blackboard) => NodeStatus;
  /**
   * Condition function (for condition nodes).
   */
  condition?: (blackboard: Blackboard) => boolean;
  /**
   * Decorator function (for decorator nodes).
   */
  decorator?: (child: BehaviorTreeNode, blackboard: Blackboard) => NodeStatus;
}

/**
 * Behavior tree configuration.
 */
export interface BehaviorTreeConfig {
  /**
   * Whether to validate tree structure.
   * @default true
   */
  validateInput?: boolean;
}

/**
 * Behavior tree execution result.
 */
export interface BehaviorTreeResult {
  /**
   * Final execution status.
   */
  status: NodeStatus;
  /**
   * Execution path (nodes visited).
   */
  executionPath: string[];
  /**
   * Number of nodes executed.
   */
  nodesExecuted: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_BEHAVIOR_TREE_CONFIG: Required<BehaviorTreeConfig> = {
  validateInput: true,
};





