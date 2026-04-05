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
import type { BehaviorTreeNode, BehaviorTreeConfig, BehaviorTreeResult, Blackboard } from "./behavior-trees-types";
/**
 * Behavior Tree implementation.
 */
export declare class BehaviorTree {
    private config;
    private root;
    private blackboard;
    /**
     * Creates a new BehaviorTree instance with the specified configuration
     * @param config - Partial configuration object that will be merged with defaults
     * @example
     * const tree = new BehaviorTree({ maxDepth: 10, validateInput: true });
     */
    constructor(config?: Partial<BehaviorTreeConfig>);
    /**
     * Sets the root node of the behavior tree
     * @param root - The root behavior tree node that serves as the entry point for execution
     * @example
     * tree.setRoot({ type: 'selector', name: 'root', children: [...] });
     */
    setRoot(root: BehaviorTreeNode): void;
    /**
     * Validates the structure and required properties of a behavior tree node
     * @param node - The behavior tree node to validate
     * @throws {Error} If the node structure is invalid or required properties are missing
     * @example
     * this.validateNode(actionNode);
     */
    private validateNode;
    /**
     * Executes the behavior tree starting from the root node
     * @param blackboard - Optional shared data structure; uses internal blackboard if not provided
     * @returns Execution result containing status, execution path, and node count
     * @throws {Error} If the root node has not been set
     * @example
     * const result = tree.execute({ health: 100, enemyNearby: true });
     */
    execute(blackboard?: Blackboard): BehaviorTreeResult;
    /**
     * Sets a value in the internal blackboard data structure
     * @param key - The key identifier for the blackboard entry
     * @param value - The value to store in the blackboard
     * @example
     * tree.setBlackboard('health', 100);
     */
    setBlackboard(key: string, value: unknown): void;
    /**
     * Retrieves a value from the internal blackboard data structure
     * @param key - The key identifier for the blackboard entry to retrieve
     * @returns The value associated with the key, or undefined if not found
     * @example
     * const health = tree.getBlackboard('health');
     */
    getBlackboard(key: string): unknown;
}
//# sourceMappingURL=behavior-trees-core.d.ts.map