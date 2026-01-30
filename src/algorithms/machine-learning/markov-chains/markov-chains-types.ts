/**
 * @file markov-chains-types.ts
 * @module algorithms/machine-learning/markov-chains-types
 * @description Type definitions and interfaces for Markov Chains and Hidden Markov Models.
 */

/**
 * Represents a state in a Markov chain, which can be either a string identifier or numeric index.
 */
export type State = string | number;

/**
 * State transition probability matrix where rows represent source states and columns represent destination states.
 * Each row must sum to 1.0 (representing a probability distribution).
 */
export type TransitionMatrix = number[][];

/**
 * Configuration options for initializing a Markov Chain instance.
 */
export interface MarkovChainConfig {
  /**
   * The number of states in the Markov chain.
   */
  numStates?: number;
  /**
   * Optional array of state names or identifiers. If not provided, states are represented by numeric indices.
   */
  stateNames?: State[];
  /**
   * Transition probability matrix defining state transition probabilities.
   * If not provided, a uniform transition matrix is generated.
   */
  transitionMatrix?: TransitionMatrix;
  /**
   * Initial probability distribution over states. Must sum to 1.0.
   * If not provided, a uniform distribution is used.
   */
  initialDistribution?: number[];
  /**
   * Random seed value for reproducible sequence generation.
   * If not provided, sequences will be non-deterministic.
   */
  seed?: number;
}

/**
 * Configuration options for initializing a Hidden Markov Model instance.
 */
export interface HMMConfig {
  /**
   * The number of hidden states in the model.
   */
  numStates: number;
  /**
   * The number of possible observation symbols.
   */
  numObservations: number;
  /**
   * State transition probability matrix (N x N) where N is the number of states.
   */
  transitionMatrix: TransitionMatrix;
  /**
   * Observation emission probability matrix (N x M) where N is the number of states
   * and M is the number of observations. Each row represents the emission probabilities for a state.
   */
  emissionMatrix: number[][];
  /**
   * Initial probability distribution over hidden states. Must sum to 1.0.
   */
  initialDistribution: number[];
}

/**
 * Result object returned by Markov Chain sequence generation.
 */
export interface MarkovChainResult {
  /**
   * The generated sequence of states following the Markov chain transition probabilities.
   */
  sequence: State[];
  /**
   * The probability of generating this specific sequence given the transition matrix and initial distribution.
   */
  probability: number;
}

/**
 * Result object returned by the HMM forward algorithm.
 */
export interface HMMForwardResult {
  /**
   * Forward probabilities (alpha values) for each time step and state.
   * Dimensions: [time_steps][states]
   */
  forwardProbabilities: number[][];
  /**
   * The total probability of observing the given observation sequence.
   */
  probability: number;
}

/**
 * Result object returned by the HMM Viterbi decoding algorithm.
 */
export interface HMMViterbiResult {
  /**
   * The most likely sequence of hidden states given the observations.
   */
  stateSequence: number[];
  /**
   * The probability of the most likely state sequence.
   */
  probability: number;
}

/**
 * Default configuration values for Markov Chain initialization.
 */
export const DEFAULT_MARKOV_CHAIN_CONFIG: Partial<MarkovChainConfig> = {
  numStates: 3,
};
