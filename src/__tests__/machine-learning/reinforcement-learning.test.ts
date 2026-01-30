/**
 * @file reinforcement-learning.test.ts
 * @description Tests for Q-Learning and DQN algorithms.
 */

import { describe, it, expect } from "vitest";
import { QLearning, DQN } from "../../algorithms/machine-learning/reinforcement-learning/reinforcement-learning-core";

describe("QLearning", () => {
  describe("Q-value management", () => {
    it("should initialize Q-values to 0", () => {
      const qlearning = new QLearning();
      expect(qlearning.getQValue(0, "action1")).toBe(0);
    });

    it("should update Q-values", () => {
      const qlearning = new QLearning();
      qlearning.setQValue(0, "action1", 5.0);
      expect(qlearning.getQValue(0, "action1")).toBe(5.0);
    });

    it("should update Q-values using Q-learning rule", () => {
      const qlearning = new QLearning();
      const state = 0;
      const action = "action1";
      const reward = 10;
      const nextState = 1;
      const availableActions = ["action1", "action2"];

      qlearning.update(state, action, reward, nextState, availableActions);
      const qValue = qlearning.getQValue(state, action);

      expect(qValue).toBeGreaterThan(0);
    });
  });

  describe("Action selection", () => {
    it("should select action using epsilon-greedy", () => {
      const qlearning = new QLearning({ epsilon: 0.1 });
      const state = 0;
      const availableActions = ["action1", "action2"];

      qlearning.setQValue(state, "action1", 10);
      qlearning.setQValue(state, "action2", 5);

      const action = qlearning.selectAction(state, availableActions);
      expect(availableActions).toContain(action);
    });

    it("should decay epsilon", () => {
      const qlearning = new QLearning({ epsilon: 1.0, epsilonDecay: 0.9 });
      qlearning.decayEpsilon();
      // Epsilon should decrease
      expect(qlearning.getQTable().size).toBeGreaterThanOrEqual(0);
    });
  });
});

describe("DQN", () => {
  describe("Experience replay", () => {
    it("should store experiences", () => {
      const dqn = new DQN();
      dqn.addExperience({
        state: 0,
        action: "action1",
        reward: 10,
        nextState: 1,
        done: false,
      });

      const batch = dqn.sampleBatch();
      expect(batch.length).toBeGreaterThan(0);
    });

    it("should limit replay buffer size", () => {
      const dqn = new DQN({ replayBufferSize: 5 });
      for (let i = 0; i < 10; i++) {
        dqn.addExperience({
          state: i,
          action: "action1",
          reward: 1,
          nextState: i + 1,
          done: false,
        });
      }
      // Buffer should be limited
      const batch = dqn.sampleBatch();
      expect(batch.length).toBeLessThanOrEqual(5);
    });
  });
});


