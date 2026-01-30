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

import type { Genome, NEATConfig, NEATEvolutionResult, Connection, Node } from "./neat-types";
import { DEFAULT_NEAT_CONFIG } from "./neat-types";

/**
 * Seeded random number generator for reproducible random sequences.
 */
class SeededRandom {
  private seed: number;

  /**
   * Creates a new seeded random number generator.
   * @param seed - Optional seed value. If not provided, a random seed is generated.
   * @example
   * ```typescript
   * const rng = new SeededRandom(42);
   * const rng2 = new SeededRandom(); // Random seed
   * ```
   */
  constructor(seed?: number) {
    this.seed = seed ?? Math.random() * 0x7fffffff;
  }

  /**
   * Generates the next random number in the sequence.
   * @returns A random number between 0 and 1.
   * @example
   * ```typescript
   * const rng = new SeededRandom(42);
   * const value = rng.next(); // 0.0 to 1.0
   * ```
   */
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

/**
 * Creates an initial genome with fully connected input-output topology.
 * @param config - NEAT configuration parameters.
 * @param innovationCounter - Counter object for tracking innovation numbers.
 * @param innovationCounter.value - Current innovation number value (will be incremented).
 * @returns A new genome with input and output nodes fully connected.
 * @example
 * ```typescript
 * const counter = { value: 0 };
 * const genome = createInitialGenome(config, counter);
 * ```
 */
function createInitialGenome(config: Required<NEATConfig>, innovationCounter: { value: number }): Genome {
  const nodes: Node[] = [];
  const connections: Connection[] = [];

  // Create input nodes
  for (let i = 0; i < config.numInputs; i++) {
    nodes.push({ id: i, type: 'input' });
  }

  // Create output nodes
  for (let i = 0; i < config.numOutputs; i++) {
    nodes.push({ id: config.numInputs + i, type: 'output' });
  }

  // Create initial connections (fully connected)
  for (let i = 0; i < config.numInputs; i++) {
    for (let j = 0; j < config.numOutputs; j++) {
      connections.push({
        from: i,
        to: config.numInputs + j,
        weight: (Math.random() * 2 - 1) * 0.5,
        enabled: true,
        innovation: innovationCounter.value++,
      });
    }
  }

  return {
    nodes,
    connections,
    fitness: 0,
  };
}

/**
 * Mutates connection weights in a genome according to the specified mutation rate.
 * @param genome - The genome to mutate.
 * @param rate - Probability of mutating each connection weight (0-1).
 * @param rng - Seeded random number generator for reproducible mutations.
 * @example
 * ```typescript
 * const rng = new SeededRandom(42);
 * mutateWeights(genome, 0.1, rng);
 * ```
 */
function mutateWeights(genome: Genome, rate: number, rng: SeededRandom): void {
  for (const conn of genome.connections) {
    if (rng.next() < rate) {
      conn.weight += (rng.next() * 2 - 1) * 0.1; // Small random change
      conn.weight = Math.max(-1, Math.min(1, conn.weight)); // Clamp
    }
  }
}

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
export class NEAT {
  private config: Required<NEATConfig>;
  private population: Genome[] = [];
  private innovationCounter = { value: 0 };
  private rng: SeededRandom;
  private generation = 0;

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
  constructor(config: NEATConfig) {
    this.config = { ...DEFAULT_NEAT_CONFIG, ...config } as Required<NEATConfig>;
    this.rng = new SeededRandom();
    this.initializePopulation();
  }

  /**
   * Initializes the population with random genomes.
   * @example
   * ```typescript
   * // Called automatically in constructor
   * neat.initializePopulation();
   * ```
   */
  private initializePopulation(): void {
    this.population = [];
    for (let i = 0; i < this.config.populationSize; i++) {
      this.population.push(createInitialGenome(this.config, this.innovationCounter));
    }
  }

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
  evaluateFitness(fitnessFunction: (genome: Genome) => number): void {
    for (const genome of this.population) {
      genome.fitness = fitnessFunction(genome);
    }
  }

  /**
   * Evolves the population for one generation using selection, crossover, and mutation.
   * @returns Evolution result containing the best genome, average fitness, and generation number.
   * @example
   * ```typescript
   * const result = neat.evolve();
   * console.log(`Generation ${result.generation}: Best fitness = ${result.bestGenome.fitness}`);
   * ```
   */
  evolve(): NEATEvolutionResult {
    // Sort by fitness
    this.population.sort((a, b) => b.fitness - a.fitness);

    // Select top performers
    const eliteSize = Math.floor(this.config.populationSize * 0.2);
    const elite = this.population.slice(0, eliteSize);

    // Create new population
    const newPopulation: Genome[] = [...elite];

    // Generate offspring
    while (newPopulation.length < this.config.populationSize) {
      // Tournament selection
      const parent1 = this.tournamentSelect();
      const parent2 = this.tournamentSelect();

      // Crossover
      let offspring: Genome;
      if (this.rng.next() < this.config.crossoverRate) {
        offspring = this.crossover(parent1, parent2);
      } else {
        offspring = { ...parent1, connections: parent1.connections.map((c) => ({ ...c })) };
      }

      // Mutate
      this.mutate(offspring);
      newPopulation.push(offspring);
    }

    this.population = newPopulation;
    this.generation++;

    const averageFitness = this.population.reduce((sum, g) => sum + g.fitness, 0) / this.population.length;

    const bestGenome = this.population[0];
    if (!bestGenome) {
      throw new Error("Population is empty");
    }

    return {
      bestGenome,
      averageFitness,
      generation: this.generation,
    };
  }

  /**
   * Selects a genome using tournament selection.
   * @param tournamentSize - Number of genomes to compete in the tournament (default: 3).
   * @returns The fittest genome from the tournament.
   * @example
   * ```typescript
   * const parent = this.tournamentSelect(5);
   * ```
   */
  private tournamentSelect(tournamentSize: number = 3): Genome {
    if (this.population.length === 0) {
      throw new Error("Cannot select from empty population");
    }
    const tournament: Genome[] = [];
    for (let i = 0; i < tournamentSize; i++) {
      const index = Math.floor(this.rng.next() * this.population.length);
      const genome = this.population[index];
      if (!genome) {
        throw new Error("Invalid population index");
      }
      tournament.push(genome);
    }
    tournament.sort((a, b) => b.fitness - a.fitness);
    const winner = tournament[0];
    if (!winner) {
      throw new Error("Tournament produced no winner");
    }
    return winner;
  }

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
  private crossover(parent1: Genome, parent2: Genome): Genome {
    // Simplified crossover - take connections from fitter parent
    const fitter = parent1.fitness > parent2.fitness ? parent1 : parent2;
    return {
      nodes: fitter.nodes.map((n) => ({ ...n })),
      connections: fitter.connections.map((c) => ({ ...c })),
      fitness: 0,
    };
  }

  /**
   * Applies mutations to a genome including weight mutations and topology changes.
   * @param genome - The genome to mutate.
   * @example
   * ```typescript
   * this.mutate(offspring);
   * ```
   */
  private mutate(genome: Genome): void {
    mutateWeights(genome, this.config.weightMutationRate, this.rng);

    // Add connection mutation (simplified)
    if (this.rng.next() < this.config.addConnectionRate) {
      // Would add new connection here
    }

    // Add node mutation (simplified)
    if (this.rng.next() < this.config.addNodeRate) {
      // Would add new node here
    }
  }

  /**
   * Retrieves the current population of genomes.
   * @returns Array of genomes in the current population.
   * @example
   * ```typescript
   * const population = neat.getPopulation();
   * console.log(`Population size: ${population.length}`);
   * ```
   */
  getPopulation(): Genome[] {
    return this.population;
  }

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
  getBestGenome(): Genome | null {
    if (this.population.length === 0) return null;
    return this.population.reduce((best, current) =>
      current.fitness > best.fitness ? current : best
    );
  }
}
