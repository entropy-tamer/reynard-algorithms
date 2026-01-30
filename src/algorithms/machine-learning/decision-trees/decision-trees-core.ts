/**
 * @file decision-trees-core.ts
 * @module algorithms/machine-learning/decision-trees-core
 * @description Decision Tree implementation (C4.5-style).
 *
 * Mathematical Theory:
 * Decision trees recursively split data based on feature values.
 * Split criterion: maximize information gain (entropy) or minimize Gini impurity.
 *
 * Gini: G = 1 - Σ p_i²
 * Entropy: H = -Σ p_i * log2(p_i)
 * Information Gain: IG = H(parent) - Σ (|S_i|/|S|) * H(S_i)
 */

import type {
  DataPoint,
  DecisionTreeNode,
  DecisionTreeConfig,
  DecisionTreeResult,
  FeatureValue,
} from "./decision-trees-types";
import { DEFAULT_DECISION_TREE_CONFIG } from "./decision-trees-types";

/**
 * Calculate Gini impurity.
 * @param labels
 * @example
 */
function giniImpurity(labels: (number | string)[]): number {
  if (labels.length === 0) return 0;
  const counts = new Map<number | string, number>();
  for (const label of labels) {
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  let gini = 1;
  for (const count of counts.values()) {
    const prob = count / labels.length;
    gini -= prob * prob;
  }
  return gini;
}

/**
 * Calculate entropy.
 * @param labels
 * @example
 */
function entropy(labels: (number | string)[]): number {
  if (labels.length === 0) return 0;
  const counts = new Map<number | string, number>();
  for (const label of labels) {
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  let ent = 0;
  for (const count of counts.values()) {
    const prob = count / labels.length;
    if (prob > 0) {
      ent -= prob * Math.log2(prob);
    }
  }
  return ent;
}

/**
 * Calculate impurity (Gini or Entropy).
 * @param labels
 * @param criterion
 * @example
 */
function calculateImpurity(labels: (number | string)[], criterion: 'gini' | 'entropy'): number {
  return criterion === 'gini' ? giniImpurity(labels) : entropy(labels);
}

/**
 * Find best split for a feature.
 * @param data
 * @param featureIndex
 * @param criterion
 * @example
 */
function findBestSplit(
  data: DataPoint[],
  featureIndex: number,
  criterion: 'gini' | 'entropy'
): { threshold?: number; splitValue?: number | string; gain: number } | null {
  if (data.length === 0) return null;

  const featureValues = data.map((d) => d.features[featureIndex]);
  const labels = data.map((d) => d.label);
  const parentImpurity = calculateImpurity(labels, criterion);

  let bestGain = -Infinity;
  let bestThreshold: number | undefined;

  // Try numeric threshold splits
  const uniqueValues = Array.from(new Set(featureValues)).sort((a, b) => {
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(a).localeCompare(String(b));
  });

  for (let i = 0; i < uniqueValues.length - 1; i++) {
    const threshold = typeof uniqueValues[i] === 'number' ? uniqueValues[i] as number : undefined;
    if (threshold === undefined) continue;

    const leftLabels = data.filter((d) => (d.features[featureIndex] as number) <= threshold).map((d) => d.label);
    const rightLabels = data.filter((d) => (d.features[featureIndex] as number) > threshold).map((d) => d.label);

    if (leftLabels.length === 0 || rightLabels.length === 0) continue;

    const leftImpurity = calculateImpurity(leftLabels, criterion);
    const rightImpurity = calculateImpurity(rightLabels, criterion);
    const weightedImpurity = (leftLabels.length / labels.length) * leftImpurity + (rightLabels.length / labels.length) * rightImpurity;
    const gain = parentImpurity - weightedImpurity;

    if (gain > bestGain) {
      bestGain = gain;
      bestThreshold = threshold;
    }
  }

  if (bestGain > 0 && bestThreshold !== undefined) {
    return { threshold: bestThreshold, gain: bestGain };
  }

  return null;
}

/**
 * Get majority class.
 * @param labels
 * @example
 */
function getMajorityClass(labels: (number | string)[]): number | string {
  if (labels.length === 0) {
    throw new Error("Cannot get majority class from empty labels array");
  }
  const firstLabel = labels[0];
  if (firstLabel === undefined) {
    throw new Error("Cannot get majority class from empty labels array");
  }
  const counts = new Map<number | string, number>();
  for (const label of labels) {
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  let maxCount = 0;
  let majority: number | string = firstLabel;
  for (const [label, count] of counts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      majority = label;
    }
  }
  return majority;
}

/**
 * Build decision tree node.
 * @param data
 * @param config
 * @param depth
 * @example
 */
function buildTree(
  data: DataPoint[],
  config: Required<DecisionTreeConfig>,
  depth: number
): DecisionTreeNode {
  const labels = data.map((d) => d.label);

  // Stopping conditions
  if (
    depth >= config.maxDepth ||
    data.length < config.minSamplesSplit ||
    calculateImpurity(labels, config.criterion) === 0
  ) {
    return {
      prediction: getMajorityClass(labels),
      sampleCount: data.length,
    };
  }

  // Find best split
  let bestFeature = -1;
  let bestGain = -Infinity;
  let bestThreshold: number | undefined;

  if (data.length === 0 || data[0] === undefined) {
    return {
      prediction: getMajorityClass(labels),
      sampleCount: data.length,
    };
  }

  for (let i = 0; i < data[0].features.length; i++) {
    const split = findBestSplit(data, i, config.criterion);
    if (split && split.gain > bestGain) {
      bestGain = split.gain;
      bestFeature = i;
      bestThreshold = split.threshold;
    }
  }

  // If no good split found, create leaf
  if (bestFeature === -1 || bestGain <= 0) {
    return {
      prediction: getMajorityClass(labels),
      sampleCount: data.length,
    };
  }

  // Split data
  const leftData = data.filter((d) => (d.features[bestFeature] as number) <= (bestThreshold ?? 0));
  const rightData = data.filter((d) => (d.features[bestFeature] as number) > (bestThreshold ?? 0));

  if (leftData.length < config.minSamplesLeaf || rightData.length < config.minSamplesLeaf) {
    return {
      prediction: getMajorityClass(labels),
      sampleCount: data.length,
    };
  }

  // Recursively build children
  const left = buildTree(leftData, config, depth + 1);
  const right = buildTree(rightData, config, depth + 1);

  if (bestThreshold === undefined) {
    return {
      prediction: getMajorityClass(labels),
      sampleCount: data.length,
    };
  }

  return {
    featureIndex: bestFeature,
    threshold: bestThreshold,
    left,
    right,
    sampleCount: data.length,
  };
}

/**
 * Decision Tree implementation.
 */
export class DecisionTree {
  private config: Required<DecisionTreeConfig>;
  private root: DecisionTreeNode | null = null;

  /**
   * Creates a new DecisionTree instance.
   * @param config Configuration options.
   * @example
   */
  constructor(config: Partial<DecisionTreeConfig> = {}) {
    this.config = { ...DEFAULT_DECISION_TREE_CONFIG, ...config };
  }

  /**
   * Train the decision tree.
   * @param data Training data.
   * @returns Training result.
   * @example
   */
  train(data: DataPoint[]): DecisionTreeResult {
    if (data.length === 0) {
      throw new Error("Training data cannot be empty");
    }

    this.root = buildTree(data, this.config, 0);

    const depth = this.calculateDepth(this.root);
    const nodeCount = this.countNodes(this.root);

    return {
      root: this.root,
      depth,
      nodeCount,
    };
  }

  /**
   * Predict label for a data point.
   * @param features Feature values.
   * @returns Predicted label.
   * @example
   */
  predict(features: FeatureValue[]): number | string {
    if (!this.root) {
      throw new Error("Tree not trained. Call train() first.");
    }

    let node = this.root;
    while (node.featureIndex !== undefined) {
      const featureValue = features[node.featureIndex];
      if (node.threshold !== undefined && (featureValue as number) <= node.threshold) {
        node = node.left!;
      } else {
        node = node.right!;
      }
    }

    return node.prediction!;
  }

  /**
   * Calculate tree depth.
   * @param node
   * @example
   */
  private calculateDepth(node: DecisionTreeNode | null | undefined): number {
    if (!node || node.featureIndex === undefined) return 0;
    return 1 + Math.max(this.calculateDepth(node.left), this.calculateDepth(node.right));
  }

  /**
   * Count nodes in tree.
   * @param node
   * @example
   */
  private countNodes(node: DecisionTreeNode | null | undefined): number {
    if (!node) return 0;
    return 1 + this.countNodes(node.left) + this.countNodes(node.right);
  }
}
