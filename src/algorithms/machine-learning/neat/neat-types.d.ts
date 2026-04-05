/**
 * @file neat-types.ts
 * @module algorithms/machine-learning/neat-types
 * @description Type definitions for NEAT (NeuroEvolution of Augmenting Topologies).
 */
/**
 * Neural network connection.
 */
export interface Connection {
    /**
     * Source node index.
     */
    from: number;
    /**
     * Target node index.
     */
    to: number;
    /**
     * Connection weight.
     */
    weight: number;
    /**
     * Whether connection is enabled.
     */
    enabled: boolean;
    /**
     * Innovation number (for historical marking).
     */
    innovation: number;
}
/**
 * Neural network node.
 */
export interface Node {
    /**
     * Node index.
     */
    id: number;
    /**
     * Node type (input, hidden, output).
     */
    type: 'input' | 'hidden' | 'output';
    /**
     * Node activation value.
     */
    value?: number;
}
/**
 * Neural network genome.
 */
export interface Genome {
    /**
     * Nodes in the network.
     */
    nodes: Node[];
    /**
     * Connections in the network.
     */
    connections: Connection[];
    /**
     * Fitness score.
     */
    fitness: number;
}
/**
 * NEAT configuration.
 */
export interface NEATConfig {
    /**
     * Population size.
     * @default 50
     */
    populationSize?: number;
    /**
     * Number of input nodes.
     */
    numInputs: number;
    /**
     * Number of output nodes.
     */
    numOutputs: number;
    /**
     * Mutation rate for weights.
     * @default 0.1
     */
    weightMutationRate?: number;
    /**
     * Mutation rate for adding connections.
     * @default 0.05
     */
    addConnectionRate?: number;
    /**
     * Mutation rate for adding nodes.
     * @default 0.03
     */
    addNodeRate?: number;
    /**
     * Crossover rate.
     * @default 0.75
     */
    crossoverRate?: number;
    /**
     * Compatibility threshold for speciation.
     * @default 3.0
     */
    compatibilityThreshold?: number;
}
/**
 * NEAT evolution result.
 */
export interface NEATEvolutionResult {
    /**
     * Best genome in population.
     */
    bestGenome: Genome;
    /**
     * Average fitness.
     */
    averageFitness: number;
    /**
     * Generation number.
     */
    generation: number;
}
/**
 * Default configuration.
 */
export declare const DEFAULT_NEAT_CONFIG: Partial<NEATConfig>;
//# sourceMappingURL=neat-types.d.ts.map