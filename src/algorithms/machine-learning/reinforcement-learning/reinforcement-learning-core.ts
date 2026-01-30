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

import type {
  State,
  Action,
  QLearningConfig,
  DQNConfig,
  Experience,
} from "./reinforcement-learning-types";
import {
  DEFAULT_QLEARNING_CONFIG,
  DEFAULT_DQN_CONFIG,
} from "./reinforcement-learning-types";

/**
 * Convert state to string key.
 * @param state
 * @example
 */
function stateToKey(state: State): string {
  if (Array.isArray(state)) {
    return state.join(',');
  }
  return String(state);
}

/**
 * Q-Learning implementation.
 */
export class QLearning {
  private config: Required<QLearningConfig>;
  private qTable: Map<string, Map<string, number>> = new Map();
  private currentEpsilon: number;

  /**
   * Creates a new QLearning instance.
   * @param config Configuration options.
   * @example
   */
  constructor(config: Partial<QLearningConfig> = {}) {
    this.config = { ...DEFAULT_QLEARNING_CONFIG, ...config };
    this.currentEpsilon = this.config.epsilon;
  }

  /**
   * Get Q-value for state-action pair.
   * @param state
   * @param action
   * @example
   */
  getQValue(state: State, action: Action): number {
    const stateKey = stateToKey(state);
    const actionKey = String(action);
    const stateTable = this.qTable.get(stateKey);
    if (!stateTable) return 0;
    return stateTable.get(actionKey) ?? 0;
  }

  /**
   * Set Q-value for state-action pair.
   * @param state
   * @param action
   * @param value
   * @example
   */
  setQValue(state: State, action: Action, value: number): void {
    const stateKey = stateToKey(state);
    const actionKey = String(action);
    if (!this.qTable.has(stateKey)) {
      this.qTable.set(stateKey, new Map());
    }
    this.qTable.get(stateKey)!.set(actionKey, value);
  }

  /**
   * Update Q-value using Q-learning update rule.
   * @param state
   * @param action
   * @param reward
   * @param nextState
   * @param availableActions
   * @example
   */
  update(
    state: State,
    action: Action,
    reward: number,
    nextState: State,
    availableActions: Action[]
  ): void {
    const currentQ = this.getQValue(state, action);
    const maxNextQ = Math.max(...availableActions.map((a) => this.getQValue(nextState, a)));
    const newQ =
      currentQ + this.config.learningRate * (reward + this.config.discountFactor * maxNextQ - currentQ);
    this.setQValue(state, action, newQ);
  }

  /**
   * Select action using epsilon-greedy policy.
   * @param state
   * @param availableActions
   * @example
   */
  selectAction(state: State, availableActions: Action[]): Action {
    if (availableActions.length === 0) {
      throw new Error("No available actions");
    }

    // Exploration
    if (Math.random() < this.currentEpsilon) {
      const randomIndex = Math.floor(Math.random() * availableActions.length);
      const action = availableActions[randomIndex];
      if (action === undefined) {
        throw new Error("Invalid action index");
      }
      return action;
    }

    // Exploitation
    const firstAction = availableActions[0];
    if (firstAction === undefined) {
      throw new Error("No available actions");
    }
    let bestAction: Action = firstAction;
    let bestQ = this.getQValue(state, bestAction);
    for (const action of availableActions) {
      const q = this.getQValue(state, action);
      if (q > bestQ) {
        bestQ = q;
        bestAction = action;
      }
    }
    return bestAction;
  }

  /**
   * Decay epsilon.
   * @example
   */
  decayEpsilon(): void {
    this.currentEpsilon = Math.max(
      this.config.minEpsilon,
      this.currentEpsilon * this.config.epsilonDecay
    );
  }

  /**
   * Get Q-table.
   * @example
   */
  getQTable(): Map<string, Map<string, number>> {
    return this.qTable;
  }
}

/**
 * DQN (Deep Q-Network) implementation.
 * Note: This is a simplified version. Full DQN requires neural network library.
 */
export class DQN {
  private config: Required<DQNConfig>;
  private replayBuffer: Experience[] = [];
  private currentEpsilon: number;

  /**
   * Creates a new DQN instance.
   * @param config Configuration options.
   * @example
   */
  constructor(config: Partial<DQNConfig> = {}) {
    this.config = { ...DEFAULT_DQN_CONFIG, ...config };
    this.currentEpsilon = this.config.epsilon;
  }

  /**
   * Add experience to replay buffer.
   * @param experience
   * @example
   */
  addExperience(experience: Experience): void {
    this.replayBuffer.push(experience);
    if (this.replayBuffer.length > this.config.replayBufferSize) {
      this.replayBuffer.shift();
    }
  }

  /**
   * Sample batch from replay buffer.
   * @example
   */
  sampleBatch(): Experience[] {
    const batchSize = Math.min(this.config.batchSize, this.replayBuffer.length);
    const batch: Experience[] = [];
    for (let i = 0; i < batchSize; i++) {
      const idx = Math.floor(Math.random() * this.replayBuffer.length);
      const experience = this.replayBuffer[idx];
      if (experience === undefined) {
        throw new Error("Invalid replay buffer index");
      }
      batch.push(experience);
    }
    return batch;
  }

  /**
   * Train on a batch (simplified - would use neural network in full implementation).
   * @example
   */
  train(): void {
    if (this.replayBuffer.length < this.config.batchSize) {
      return;
    }

    // In full implementation, would:
    // 1. Sample batch: const batch = this.sampleBatch();
    // 2. Compute Q-values for current states
    // 3. Compute target Q-values: r + γ * max Q(s', a')
    // 4. Update network weights using gradient descent
    // This is a placeholder
  }

  /**
   * Select action using epsilon-greedy policy.
   * @param _state
   * @param availableActions
   * @example
   */
  selectAction(_state: State, availableActions: Action[]): Action {
    if (availableActions.length === 0) {
      throw new Error("No available actions");
    }

    // Exploration
    if (Math.random() < this.currentEpsilon) {
      const randomIndex = Math.floor(Math.random() * availableActions.length);
      const action = availableActions[randomIndex];
      if (action === undefined) {
        throw new Error("Invalid action index");
      }
      return action;
    }

    // Exploitation (would use neural network to predict Q-values)
    // For now, return random action
    const randomIndex = Math.floor(Math.random() * availableActions.length);
    const action = availableActions[randomIndex];
    if (action === undefined) {
      throw new Error("Invalid action index");
    }
    return action;
  }

  /**
   * Decay epsilon.
   * @example
   */
  decayEpsilon(): void {
    this.currentEpsilon *= this.config.epsilonDecay;
  }
}
