/**
 * @file markov-chains.test.ts
 * @description Tests for Markov Chains and HMM algorithms.
 */

import { describe, it, expect } from "vitest";
import { MarkovChain, HiddenMarkovModel } from "../../algorithms/machine-learning/markov-chains/markov-chains-core";

describe("MarkovChain", () => {
  describe("Sequence generation", () => {
    it("should generate sequence of specified length", () => {
      const mc = new MarkovChain({
        numStates: 3,
        transitionMatrix: [
          [0.5, 0.3, 0.2],
          [0.2, 0.5, 0.3],
          [0.3, 0.2, 0.5],
        ],
        seed: 42,
      });

      const result = mc.generate(10);

      expect(result.sequence).toHaveLength(10);
      expect(result.probability).toBeGreaterThan(0);
      expect(result.probability).toBeLessThanOrEqual(1);
    });
  });
});

describe("HiddenMarkovModel", () => {
  describe("Forward algorithm", () => {
    it("should compute forward probabilities", () => {
      const hmm = new HiddenMarkovModel({
        numStates: 2,
        numObservations: 2,
        transitionMatrix: [
          [0.7, 0.3],
          [0.4, 0.6],
        ],
        emissionMatrix: [
          [0.5, 0.5],
          [0.3, 0.7],
        ],
        initialDistribution: [0.6, 0.4],
      });

      const observations = [0, 1, 0];
      const result = hmm.forward(observations);

      expect(result.forwardProbabilities).toBeDefined();
      expect(result.forwardProbabilities.length).toBe(observations.length);
      expect(result.probability).toBeGreaterThanOrEqual(0);
      expect(result.probability).toBeLessThanOrEqual(1);
    });
  });

  describe("Viterbi algorithm", () => {
    it("should find most likely state sequence", () => {
      const hmm = new HiddenMarkovModel({
        numStates: 2,
        numObservations: 2,
        transitionMatrix: [
          [0.7, 0.3],
          [0.4, 0.6],
        ],
        emissionMatrix: [
          [0.5, 0.5],
          [0.3, 0.7],
        ],
        initialDistribution: [0.6, 0.4],
      });

      const observations = [0, 1, 0];
      const result = hmm.viterbi(observations);

      expect(result.stateSequence).toHaveLength(observations.length);
      expect(result.stateSequence.every((s) => s >= 0 && s < 2)).toBe(true);
      expect(result.probability).toBeGreaterThanOrEqual(0);
    });
  });
});


