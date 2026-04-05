/**
 * @file reinforcement-learning-core.ts
 * @module algorithms/machine-learning/reinforcement-learning-core
 * @description Q-Learning and DQN implementation.
 *
 * Mathematical Theory:
 * Q-Learning: Q(s,a) = Q(s,a) + α[r + γ*max Q(s',a') - Q(s,a)]
 * Bellman equation for optimal Q-values.
 *
 * DQN: Deep Q-Network uses neural network to approximate Q-function.
 * Experience replay and target networks for stability.
 */
import type { State, Action, QLearningConfig, DQNConfig, Experience } from "./reinforcement-learning-types";
/**
 * Q-Learning implementation.
 */
export declare class QLearning {
    private config;
    private qTable;
    private currentEpsilon;
    /**
     * Creates a new QLearning instance.
     * @param config Configuration options.
     * @example
     */
    constructor(config?: Partial<QLearningConfig>);
    /**
     * Get Q-value for state-action pair.
     * @param state
     * @param action
     * @example
     */
    getQValue(state: State, action: Action): number;
    /**
     * Set Q-value for state-action pair.
     * @param state
     * @param action
     * @param value
     * @example
     */
    setQValue(state: State, action: Action, value: number): void;
    /**
     * Update Q-value using Q-learning update rule.
     * @param state
     * @param action
     * @param reward
     * @param nextState
     * @param availableActions
     * @example
     */
    update(state: State, action: Action, reward: number, nextState: State, availableActions: Action[]): void;
    /**
     * Select action using epsilon-greedy policy.
     * @param state
     * @param availableActions
     * @example
     */
    selectAction(state: State, availableActions: Action[]): Action;
    /**
     * Decay epsilon.
     * @example
     */
    decayEpsilon(): void;
    /**
     * Get Q-table.
     * @example
     */
    getQTable(): Map<string, Map<string, number>>;
}
/**
 * DQN (Deep Q-Network) implementation.
 * Note: This is a simplified version. Full DQN requires neural network library.
 */
export declare class DQN {
    private config;
    private replayBuffer;
    private currentEpsilon;
    /**
     * Creates a new DQN instance.
     * @param config Configuration options.
     * @example
     */
    constructor(config?: Partial<DQNConfig>);
    /**
     * Add experience to replay buffer.
     * @param experience
     * @example
     */
    addExperience(experience: Experience): void;
    /**
     * Sample batch from replay buffer.
     * @example
     */
    sampleBatch(): Experience[];
    /**
     * Train on a batch (simplified - would use neural network in full implementation).
     * @example
     */
    train(): void;
    /**
     * Select action using epsilon-greedy policy.
     * @param _state
     * @param availableActions
     * @example
     */
    selectAction(_state: State, availableActions: Action[]): Action;
    /**
     * Decay epsilon.
     * @example
     */
    decayEpsilon(): void;
}
//# sourceMappingURL=reinforcement-learning-core.d.ts.map