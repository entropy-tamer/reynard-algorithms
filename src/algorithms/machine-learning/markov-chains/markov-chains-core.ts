/**
 * @file markov-chains-core.ts
 * @module algorithms/machine-learning/markov-chains-core
 * @description Implementation of Markov Chains and Hidden Markov Models for probabilistic sequence modeling.
 *
 * Mathematical Theory:
 * - Markov Chain: P(X_t | X_{t-1}, ..., X_0) = P(X_t | X_{t-1})
 * The memoryless property ensures the next state depends only on the current state.
 *
 * - Hidden Markov Model: Models systems with hidden states and observable emissions.
 * Forward algorithm: P(observations) = Σ_α α_T(i) computes observation probability.
 * Viterbi algorithm: Finds the most likely state sequence using dynamic programming.
 */

import type {
  State,
  TransitionMatrix,
  MarkovChainConfig,
  HMMConfig,
  MarkovChainResult,
  HMMForwardResult,
  HMMViterbiResult,
} from "./markov-chains-types";
import { DEFAULT_MARKOV_CHAIN_CONFIG } from "./markov-chains-types";

/**
 * Seeded pseudorandom number generator using a linear congruential generator algorithm.
 * Provides deterministic random number sequences when initialized with a seed value.
 */
class SeededRandom {
  private seed: number;

  /**
   * Creates a new SeededRandom instance.
   * @param seed Optional seed value for reproducible random numbers. If not provided, a random seed is generated.
   * @example
   * const rng = new SeededRandom(42);
   */
  constructor(seed?: number) {
    this.seed = seed ?? Math.random() * 0x7fffffff;
  }

  /**
   * Generates the next pseudorandom number in the sequence.
   * Uses a linear congruential generator algorithm for deterministic randomness.
   * @returns A pseudorandom number between 0 (inclusive) and 1 (exclusive).
   * @example
   * const rng = new SeededRandom(42);
   * const value = rng.next(); // Returns a value between 0 and 1
   */
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

/**
 * Samples an index from a probability distribution using inverse transform sampling.
 * @param probs Array of probabilities that must sum to approximately 1.0.
 * @param rng Seeded random number generator instance.
 * @returns The index of the selected probability bin.
 * @example
 * const probs = [0.5, 0.3, 0.2];
 * const rng = new SeededRandom(42);
 * const index = sampleFromDistribution(probs, rng); // Returns 0, 1, or 2
 */
function sampleFromDistribution(probs: number[], rng: SeededRandom): number {
  const rand = rng.next();
  let sum = 0;
  for (let i = 0; i < probs.length; i++) {
    const prob = probs[i];
    if (prob === undefined) {
      continue;
    }
    sum += prob;
    if (rand <= sum) {
      return i;
    }
  }
  return probs.length - 1;
}

/**
 * Markov Chain implementation for state sequence generation.
 * Implements the memoryless property: P(X_t | X_{t-1}, ..., X_0) = P(X_t | X_{t-1}).
 */
export class MarkovChain {
  private config: MarkovChainConfig;
  private transitionMatrix: TransitionMatrix;
  private stateNames: State[];
  private initialDistribution: number[];
  private rng: SeededRandom;

  /**
   * Creates a new MarkovChain instance.
   * @param config Configuration options for the Markov chain.
   * @example
   * const mc = new MarkovChain({
   *   numStates: 3,
   *   transitionMatrix: [[0.5, 0.3, 0.2], [0.2, 0.5, 0.3], [0.3, 0.2, 0.5]],
   *   seed: 42
   * });
   */
  constructor(config: Partial<MarkovChainConfig> = {}) {
    this.config = { ...DEFAULT_MARKOV_CHAIN_CONFIG, ...config };
    const numStates = this.config.numStates ?? 3;

    this.transitionMatrix = this.config.transitionMatrix ??
      Array(numStates).fill(0).map(() => Array(numStates).fill(1.0 / numStates));
    this.stateNames = this.config.stateNames ?? Array(numStates).fill(0).map((_, i) => i);
    this.initialDistribution = this.config.initialDistribution ?? Array(numStates).fill(1.0 / numStates);

    this.rng = new SeededRandom(this.config.seed);
  }

  /**
   * Generates a sequence of states following the Markov chain transition probabilities.
   * @param length The desired length of the generated sequence.
   * @returns An object containing the generated state sequence and its probability.
   * @example
   * const mc = new MarkovChain({ numStates: 3, transitionMatrix: [...] });
   * const result = mc.generate(10);
   * console.log(result.sequence); // [0, 1, 2, 0, ...]
   * console.log(result.probability); // 0.00123...
   */
  generate(length: number): MarkovChainResult {
    const sequence: State[] = [];
    let currentState = sampleFromDistribution(this.initialDistribution, this.rng);
    const initialProb = this.initialDistribution[currentState];
    if (initialProb === undefined) {
      throw new Error(`Invalid initial state index: ${currentState}`);
    }
    let probability = initialProb;

    const initialStateName = this.stateNames[currentState];
    if (initialStateName === undefined) {
      throw new Error(`Invalid state name index: ${currentState}`);
    }
    sequence.push(initialStateName);

    for (let i = 1; i < length; i++) {
      const transitionRow = this.transitionMatrix[currentState];
      if (transitionRow === undefined) {
        throw new Error(`Invalid transition matrix row index: ${currentState}`);
      }
      const nextState = sampleFromDistribution(transitionRow, this.rng);
      const transitionProb = transitionRow[nextState];
      if (transitionProb === undefined) {
        throw new Error(`Invalid transition matrix column index: ${nextState}`);
      }
      probability *= transitionProb;
      currentState = nextState;
      const stateName = this.stateNames[currentState];
      if (stateName === undefined) {
        throw new Error(`Invalid state name index: ${currentState}`);
      }
      sequence.push(stateName);
    }

    return {
      sequence,
      probability,
    };
  }
}

/**
 * Hidden Markov Model implementation for state inference from observations.
 * Supports forward algorithm for probability calculation and Viterbi algorithm for state decoding.
 */
export class HiddenMarkovModel {
  private config: HMMConfig;

  /**
   * Creates a new HiddenMarkovModel instance.
   * @param config Configuration options including transition matrix, emission matrix, and initial distribution.
   * @example
   * const hmm = new HiddenMarkovModel({
   *   numStates: 2,
   *   numObservations: 2,
   *   transitionMatrix: [[0.7, 0.3], [0.4, 0.6]],
   *   emissionMatrix: [[0.5, 0.5], [0.3, 0.7]],
   *   initialDistribution: [0.6, 0.4]
   * });
   */
  constructor(config: HMMConfig) {
    this.config = config;
  }

  /**
   * Computes the probability of an observation sequence using the forward algorithm.
   * Implements the forward recursion: α_t(i) = Σ_j α_{t-1}(j) * a_{ji} * b_i(o_t).
   * @param observations Array of observation indices.
   * @returns An object containing forward probabilities (alpha values) and the total probability.
   * @example
   * const hmm = new HiddenMarkovModel({ ... });
   * const result = hmm.forward([0, 1, 0]);
   * console.log(result.probability); // Probability of observing [0, 1, 0]
   */
  forward(observations: number[]): HMMForwardResult {
    const T = observations.length;
    const N = this.config.numStates;
    const alpha: number[][] = Array(T).fill(0).map(() => Array(N).fill(0));
    const firstObservation = observations[0];
    if (firstObservation === undefined) {
      throw new Error("Observations array cannot be empty");
    }
    for (let i = 0; i < N; i++) {
      const initialDist = this.config.initialDistribution[i];
      const emissionRow = this.config.emissionMatrix[i];
      if (initialDist === undefined || emissionRow === undefined) {
        throw new Error(`Invalid initial distribution or emission matrix at index ${i}`);
      }
      const emissionProb = emissionRow[firstObservation];
      if (emissionProb === undefined) {
        throw new Error(`Invalid emission matrix column index: ${firstObservation}`);
      }
      const alphaRow = alpha[0];
      if (alphaRow === undefined) {
        throw new Error("Invalid alpha matrix initialization");
      }
      alphaRow[i] = initialDist * emissionProb;
    }

    for (let t = 1; t < T; t++) {
      const observation = observations[t];
      if (observation === undefined) {
        throw new Error(`Invalid observation at index ${t}`);
      }
      for (let i = 0; i < N; i++) {
        let sum = 0;
        for (let j = 0; j < N; j++) {
          const prevAlphaRow = alpha[t - 1];
          if (prevAlphaRow === undefined) {
            throw new Error(`Invalid alpha matrix at time step ${t - 1}`);
          }
          const prevAlpha = prevAlphaRow[j];
          if (prevAlpha === undefined) {
            continue;
          }
          const transitionRow = this.config.transitionMatrix[j];
          if (transitionRow === undefined) {
            throw new Error(`Invalid transition matrix row index: ${j}`);
          }
          const transitionProb = transitionRow[i];
          if (transitionProb === undefined) {
            throw new Error(`Invalid transition matrix column index: ${i}`);
          }
          sum += prevAlpha * transitionProb;
        }
        const emissionRow = this.config.emissionMatrix[i];
        if (emissionRow === undefined) {
          throw new Error(`Invalid emission matrix row index: ${i}`);
        }
        const emissionProb = emissionRow[observation];
        if (emissionProb === undefined) {
          throw new Error(`Invalid emission matrix column index: ${observation}`);
        }
        const alphaRow = alpha[t];
        if (alphaRow === undefined) {
          throw new Error(`Invalid alpha matrix at time step ${t}`);
        }
        alphaRow[i] = sum * emissionProb;
      }
    }
    const finalAlphaRow = alpha[T - 1];
    if (finalAlphaRow === undefined) {
      throw new Error(`Invalid alpha matrix at final time step ${T - 1}`);
    }
    return {
      forwardProbabilities: alpha,
      probability: finalAlphaRow.reduce((sum, val) => sum + val, 0),
    };
  }

  /**
   * Finds the optimal final state and its probability from the Viterbi delta matrix.
   * This method identifies the state with the highest probability at the final time step,
   * which is used as the starting point for backtracking in the Viterbi algorithm.
   * @param delta The Viterbi probability matrix containing maximum path probabilities for each state at each time step.
   * @param T The length of the observation sequence.
   * @param N The number of hidden states in the model.
   * @returns An object containing the index of the best final state and its corresponding maximum probability.
   * @example
   * const result = this.findBestFinalState(delta, 10, 3);
   * // Returns { bestState: 1, maxProb: 0.0234 }
   */
  private findBestFinalState(delta: number[][], T: number, N: number): { bestState: number; maxProb: number } {
    let maxProb = -Infinity;
    let bestState = 0;
    const finalDeltaRow = delta[T - 1];
    if (finalDeltaRow === undefined) {
      throw new Error(`Invalid delta matrix at final time step ${T - 1}`);
    }
    for (let i = 0; i < N; i++) {
      const deltaVal = finalDeltaRow[i];
      if (deltaVal === undefined) {
        continue;
      }
      if (deltaVal > maxProb) {
        maxProb = deltaVal;
        bestState = i;
      }
    }
    if (maxProb === -Infinity) {
      throw new Error("No valid final state found");
    }
    return { bestState, maxProb };
  }
  /**
   * Reconstructs the most likely state sequence using backtracking through the psi matrix.
   * This method traces back through the optimal path by following the stored predecessor states,
   * building the complete state sequence from the final state back to the initial state.
   * @param psi The backtracking matrix storing the optimal previous state index for each state at each time step.
   * @param bestState The index of the optimal final state from which backtracking begins.
   * @param T The length of the observation sequence.
   * @returns An array representing the reconstructed most likely sequence of hidden states.
   * @example
   * const sequence = this.backtrackStateSequence(psi, 1, 10);
   * // Returns [0, 1, 0, 2, 1, 0, 1, 2, 0, 1]
   */
  private backtrackStateSequence(psi: number[][], bestState: number, T: number): number[] {
    const stateSequence: number[] = [bestState];
    for (let t = T - 1; t > 0; t--) {
      const psiRow = psi[t];
      if (psiRow === undefined) {
        throw new Error(`Invalid psi matrix at time step ${t}`);
      }
      const nextState = psiRow[bestState];
      if (nextState === undefined) {
        throw new Error(`Invalid psi matrix column index: ${bestState}`);
      }
      bestState = nextState;
      stateSequence.unshift(bestState);
    }
    return stateSequence;
  }

  /**
   * Finds the most likely hidden state sequence given observations using the Viterbi algorithm.
   * Implements dynamic programming: δ_t(i) = max_j [δ_{t-1}(j) * a_{ji}] * b_i(o_t).
   * @param observations Array of observation indices.
   * @returns An object containing the most likely state sequence and its probability.
   * @example
   * const hmm = new HiddenMarkovModel({ ... });
   * const result = hmm.viterbi([0, 1, 0]);
   * console.log(result.stateSequence); // [0, 1, 0] - most likely hidden states
   * console.log(result.probability); // Probability of this state sequence
   */
  viterbi(observations: number[]): HMMViterbiResult {
    const T = observations.length;
    const N = this.config.numStates;
    const delta: number[][] = Array(T).fill(0).map(() => Array(N).fill(0));
    const psi: number[][] = Array(T).fill(0).map(() => Array(N).fill(0));

    const firstObservation = observations[0];
    if (firstObservation === undefined) {
      throw new Error("Observations array cannot be empty");
    }
    for (let i = 0; i < N; i++) {
      const initialDist = this.config.initialDistribution[i];
      const emissionRow = this.config.emissionMatrix[i];
      if (initialDist === undefined || emissionRow === undefined) {
        throw new Error(`Invalid initial distribution or emission matrix at index ${i}`);
      }
      const emissionProb = emissionRow[firstObservation];
      if (emissionProb === undefined) {
        throw new Error(`Invalid emission matrix column index: ${firstObservation}`);
      }
      const deltaRow = delta[0];
      const psiRow = psi[0];
      if (deltaRow === undefined || psiRow === undefined) {
        throw new Error("Invalid delta or psi matrix initialization");
      }
      deltaRow[i] = initialDist * emissionProb;
      psiRow[i] = 0;
    }
    for (let t = 1; t < T; t++) {
      const observation = observations[t];
      if (observation === undefined) {
        throw new Error(`Invalid observation at index ${t}`);
      }
      for (let i = 0; i < N; i++) {
        let maxVal = -Infinity;
        let maxIdx = 0;
        for (let j = 0; j < N; j++) {
          const prevDeltaRow = delta[t - 1];
          if (prevDeltaRow === undefined) {
            throw new Error(`Invalid delta matrix at time step ${t - 1}`);
          }
          const prevDelta = prevDeltaRow[j];
          if (prevDelta === undefined) {
            continue;
          }
          const transitionRow = this.config.transitionMatrix[j];
          if (transitionRow === undefined) {
            throw new Error(`Invalid transition matrix row index: ${j}`);
          }
          const transitionProb = transitionRow[i];
          if (transitionProb === undefined) {
            throw new Error(`Invalid transition matrix column index: ${i}`);
          }
          const val = prevDelta * transitionProb;
          if (val > maxVal) {
            maxVal = val;
            maxIdx = j;
          }
        }
        const emissionRow = this.config.emissionMatrix[i];
        if (emissionRow === undefined) {
          throw new Error(`Invalid emission matrix row index: ${i}`);
        }
        const emissionProb = emissionRow[observation];
        if (emissionProb === undefined) {
          throw new Error(`Invalid emission matrix column index: ${observation}`);
        }
        const deltaRow = delta[t];
        const psiRow = psi[t];
        if (deltaRow === undefined || psiRow === undefined) {
          throw new Error(`Invalid delta or psi matrix at time step ${t}`);
        }
        deltaRow[i] = maxVal * emissionProb;
        psiRow[i] = maxIdx;
      }
    }

    const { bestState, maxProb } = this.findBestFinalState(delta, T, N);
    const stateSequence = this.backtrackStateSequence(psi, bestState, T);

    return {
      stateSequence,
      probability: maxProb,
    };
  }
}
