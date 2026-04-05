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
import type { DataPoint, DecisionTreeConfig, DecisionTreeResult, FeatureValue } from "./decision-trees-types";
/**
 * Decision Tree implementation.
 */
export declare class DecisionTree {
    private config;
    private root;
    /**
     * Creates a new DecisionTree instance.
     * @param config Configuration options.
     * @example
     */
    constructor(config?: Partial<DecisionTreeConfig>);
    /**
     * Train the decision tree.
     * @param data Training data.
     * @returns Training result.
     * @example
     */
    train(data: DataPoint[]): DecisionTreeResult;
    /**
     * Predict label for a data point.
     * @param features Feature values.
     * @returns Predicted label.
     * @example
     */
    predict(features: FeatureValue[]): number | string;
    /**
     * Calculate tree depth.
     * @param node
     * @example
     */
    private calculateDepth;
    /**
     * Count nodes in tree.
     * @param node
     * @example
     */
    private countNodes;
}
//# sourceMappingURL=decision-trees-core.d.ts.map