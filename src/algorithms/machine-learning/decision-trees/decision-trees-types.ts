/**
 * @file decision-trees-types.ts
 * @module algorithms/machine-learning/decision-trees-types
 * @description Type definitions for Decision Trees.
 */

/**
 * Feature value (can be number or string).
 */
export type FeatureValue = number | string;

/**
 * Data point with features and label.
 */
export interface DataPoint {
  /**
   * Feature values.
   */
  features: FeatureValue[];
  /**
   * Class label (for classification) or value (for regression).
   */
  label: number | string;
}

/**
 * Decision tree node.
 */
export interface DecisionTreeNode {
  /**
   * Feature index to split on (undefined for leaf).
   */
  featureIndex?: number;
  /**
   * Split threshold (for numeric features).
   */
  threshold?: number;
  /**
   * Split value (for categorical features).
   */
  splitValue?: FeatureValue;
  /**
   * Left child (values <= threshold or == splitValue).
   */
  left?: DecisionTreeNode;
  /**
   * Right child (values > threshold or != splitValue).
   */
  right?: DecisionTreeNode;
  /**
   * Predicted label (for leaf nodes).
   */
  prediction?: number | string;
  /**
   * Number of samples in this node.
   */
  sampleCount?: number;
}

/**
 * Decision tree configuration.
 */
export interface DecisionTreeConfig {
  /**
   * Maximum depth of the tree.
   * @default 10
   */
  maxDepth?: number;
  /**
   * Minimum samples required to split a node.
   * @default 2
   */
  minSamplesSplit?: number;
  /**
   * Minimum samples required in a leaf node.
   * @default 1
   */
  minSamplesLeaf?: number;
  /**
   * Whether to use information gain (entropy) or Gini impurity.
   * @default 'gini'
   */
  criterion?: 'gini' | 'entropy';
}

/**
 * Decision tree result.
 */
export interface DecisionTreeResult {
  /**
   * Root node of the tree.
   */
  root: DecisionTreeNode;
  /**
   * Tree depth.
   */
  depth: number;
  /**
   * Number of nodes.
   */
  nodeCount: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_DECISION_TREE_CONFIG: Required<DecisionTreeConfig> = {
  maxDepth: 10,
  minSamplesSplit: 2,
  minSamplesLeaf: 1,
  criterion: 'gini',
};





