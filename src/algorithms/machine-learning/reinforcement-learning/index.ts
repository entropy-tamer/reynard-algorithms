/**
 * Reinforcement Learning
 *
 * @file index.ts
 * @module algorithms/machine-learning/reinforcement-learning
 * @description Reinforcement Learning algorithm exports.
 */

export { QLearning, DQN } from "./reinforcement-learning-core";
export type {
  State,
  Action,
  QLearningConfig,
  QLearningResult,
  DQNConfig,
  Experience,
} from "./reinforcement-learning-types";
export {
  DEFAULT_QLEARNING_CONFIG,
  DEFAULT_DQN_CONFIG,
} from "./reinforcement-learning-types";
