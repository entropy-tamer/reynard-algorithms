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
import type { MarkovChainConfig, HMMConfig, MarkovChainResult, HMMForwardResult, HMMViterbiResult } from "./markov-chains-types";
/**
 * Markov Chain implementation for state sequence generation.
 * Implements the memoryless property: P(X_t | X_{t-1}, ..., X_0) = P(X_t | X_{t-1}).
 */
export declare class MarkovChain {
    private config;
    private transitionMatrix;
    private stateNames;
    private initialDistribution;
    private rng;
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
    constructor(config?: Partial<MarkovChainConfig>);
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
    generate(length: number): MarkovChainResult;
}
/**
 * Hidden Markov Model implementation for state inference from observations.
 * Supports forward algorithm for probability calculation and Viterbi algorithm for state decoding.
 */
export declare class HiddenMarkovModel {
    private config;
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
    constructor(config: HMMConfig);
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
    forward(observations: number[]): HMMForwardResult;
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
    private findBestFinalState;
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
    private backtrackStateSequence;
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
    viterbi(observations: number[]): HMMViterbiResult;
}
//# sourceMappingURL=markov-chains-core.d.ts.map