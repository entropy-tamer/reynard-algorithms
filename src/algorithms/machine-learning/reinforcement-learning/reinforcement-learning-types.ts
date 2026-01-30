/**
 * @file reinforcement-learning-types.ts
 * @module algorithms/machine-learning/reinforcement-learning-types
 * @description Type definitions for Reinforcement Learning (Q-Learning, DQN).
 */

/**
 * State representation.
 */
export type State = number | string | number[];

/**
 * Action representation.
 */
export type Action = number | string;

/**
 * Q-Learning configuration.
 */
export interface QLearningConfig {
  /**
   * Learning rate (alpha).
   * @default 0.1
   */
  learningRate?: number;
  /**
   * Discount factor (gamma).
   * @default 0.9
   */
  discountFactor?: number;
  /**
   * Epsilon for epsilon-greedy exploration.
   * @default 0.1
   */
  epsilon?: number;
  /**
   * Epsilon decay rate.
   * @default 0.995
   */
  epsilonDecay?: number;
  /**
   * Minimum epsilon.
   * @default 0.01
   */
  minEpsilon?: number;
}

/**
 * Q-Learning result.
 */
export interface QLearningResult {
  /**
   * Q-table (state -> action -> Q-value).
   */
  qTable: Map<string, Map<string, number>>;
  /**
   * Number of episodes trained.
   */
  episodes: number;
  /**
   * Average reward.
   */
  averageReward: number;
}

/**
 * DQN configuration.
 */
export interface DQNConfig {
  /**
   * Learning rate.
   * @default 0.001
   */
  learningRate?: number;
  /**
   * Discount factor.
   * @default 0.99
   */
  discountFactor?: number;
  /**
   * Epsilon for exploration.
   * @default 1.0
   */
  epsilon?: number;
  /**
   * Epsilon decay.
   * @default 0.995
   */
  epsilonDecay?: number;
  /**
   * Experience replay buffer size.
   * @default 10000
   */
  replayBufferSize?: number;
  /**
   * Batch size for training.
   * @default 32
   */
  batchSize?: number;
}

/**
 * Experience tuple (state, action, reward, nextState, done).
 */
export interface Experience {
  state: State;
  action: Action;
  reward: number;
  nextState: State;
  done: boolean;
}

/**
 * Default configurations.
 */
export const DEFAULT_QLEARNING_CONFIG: Required<QLearningConfig> = {
  learningRate: 0.1,
  discountFactor: 0.9,
  epsilon: 0.1,
  epsilonDecay: 0.995,
  minEpsilon: 0.01,
};

export const DEFAULT_DQN_CONFIG: Required<DQNConfig> = {
  learningRate: 0.001,
  discountFactor: 0.99,
  epsilon: 1.0,
  epsilonDecay: 0.995,
  replayBufferSize: 10000,
  batchSize: 32,
};

