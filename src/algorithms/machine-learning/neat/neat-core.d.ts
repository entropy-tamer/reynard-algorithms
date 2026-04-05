/**
 * @file neat-core.ts
 * @module algorithms/machine-learning/neat-core
 * @description NEAT (NeuroEvolution of Augmenting Topologies) implementation.
 *
 * Mathematical Theory:
 * NEAT evolves neural network topologies and weights simultaneously.
 * Key features:
 * - Historical marking (innovation numbers) for crossover
 * - Speciation to protect innovation
 * - Complexification (adding nodes/connections)
 *
 * Fitness: Evaluated by user-provided fitness function
 * Selection: Tournament or fitness-proportional
 * Crossover: Align genomes by innovation numbers
 * Mutation: Weight mutation, add connection, add node
 */
import type { Genome, NEATConfig, NEATEvolutionResult } from "./neat-types";
/**
 * NEAT (NeuroEvolution of Augmenting Topologies) implementation.
 * Evolves neural network topologies and weights simultaneously using genetic algorithms.
 * @example
 * ```typescript
 * const neat = new NEAT({ numInputs: 2, numOutputs: 1 });
 * neat.evaluateFitness((genome) => calculateFitness(genome));
 * const result = neat.evolve();
 * ```
 */
export declare class NEAT {
    private config;
    private population;
    private innovationCounter;
    private rng;
    private generation;
    /**
     * Creates a new NEAT instance with the specified configuration.
     * @param config - Configuration options for the NEAT algorithm.
     * @example
     * ```typescript
     * const neat = new NEAT({
     *   numInputs: 2,
     *   numOutputs: 1,
     *   populationSize: 100
     * });
     * ```
     */
    constructor(config: NEATConfig);
    /**
     * Initializes the population with random genomes.
     * @example
     * ```typescript
     * // Called automatically in constructor
     * neat.initializePopulation();
     * ```
     */
    private initializePopulation;
    /**
     * Evaluates fitness for all genomes in the population.
     * @param fitnessFunction - Function that evaluates a genome and returns its fitness score.
     * @example
     * ```typescript
     * neat.evaluateFitness((genome) => {
     *   // Calculate fitness based on genome performance
     *   return performanceScore;
     * });
     * ```
     */
    evaluateFitness(fitnessFunction: (genome: Genome) => number): void;
    /**
     * Evolves the population for one generation using selection, crossover, and mutation.
     * @returns Evolution result containing the best genome, average fitness, and generation number.
     * @example
     * ```typescript
     * const result = neat.evolve();
     * console.log(`Generation ${result.generation}: Best fitness = ${result.bestGenome.fitness}`);
     * ```
     */
    evolve(): NEATEvolutionResult;
    /**
     * Selects a genome using tournament selection.
     * @param tournamentSize - Number of genomes to compete in the tournament (default: 3).
     * @returns The fittest genome from the tournament.
     * @example
     * ```typescript
     * const parent = this.tournamentSelect(5);
     * ```
     */
    private tournamentSelect;
    /**
     * Performs crossover between two parent genomes to create an offspring.
     * @param parent1 - First parent genome.
     * @param parent2 - Second parent genome.
     * @returns A new genome created from the crossover operation.
     * @example
     * ```typescript
     * const offspring = this.crossover(parent1, parent2);
     * ```
     */
    private crossover;
    /**
     * Applies mutations to a genome including weight mutations and topology changes.
     * @param genome - The genome to mutate.
     * @example
     * ```typescript
     * this.mutate(offspring);
     * ```
     */
    private mutate;
    /**
     * Retrieves the current population of genomes.
     * @returns Array of genomes in the current population.
     * @example
     * ```typescript
     * const population = neat.getPopulation();
     * console.log(`Population size: ${population.length}`);
     * ```
     */
    getPopulation(): Genome[];
    /**
     * Retrieves the genome with the highest fitness in the current population.
     * @returns The best genome, or null if the population is empty.
     * @example
     * ```typescript
     * const best = neat.getBestGenome();
     * if (best) {
     *   console.log(`Best fitness: ${best.fitness}`);
     * }
     * ```
     */
    getBestGenome(): Genome | null;
}
//# sourceMappingURL=neat-core.d.ts.map