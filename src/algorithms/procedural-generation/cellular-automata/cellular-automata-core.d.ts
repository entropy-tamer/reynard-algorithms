/**
 * @module algorithms/procedural-generation/cellular-automata-core
 * @description Cellular Automata implementation for procedural generation.
 *
 * Mathematical Theory:
 * Cellular Automata are discrete dynamical systems where cells on a grid
 * evolve according to rules based on their current state and neighbors.
 *
 * Common rules:
 * - Game of Life: Conway's rules (B3/S23)
 * - Cave Generation: Smoothing rules for terrain
 * - Fire Simulation: State transitions based on fuel and neighbors
 *
 * The evolution follows: s(t+1) = f(s(t), N(s(t)))
 * where s is state, N are neighbors, and f is the rule function.
 */
import type { CellState, CellularAutomataConfig, CellularAutomataResult, CellularAutomataOptions, GameOfLifeConfig, CaveGenerationConfig } from "./cellular-automata-types";
/**
 * Cellular Automata implementation.
 */
export declare class CellularAutomata {
    private config;
    private rng;
    /**
     * Creates a new CellularAutomata instance.
     * @param config Configuration options.
     * @example
     */
    constructor(config?: Partial<CellularAutomataConfig>);
    /**
     * Evolve the grid for specified number of generations.
     * @param grid Initial grid state (optional).
     * @param options Evolution options.
     * @returns Evolution result.
     * @example
     */
    evolve(grid?: CellState[][], options?: Partial<CellularAutomataOptions>): CellularAutomataResult;
    /**
     * Generate cave-like terrain using cellular automata.
     * @param width Grid width.
     * @param height Grid height.
     * @param config Cave generation configuration.
     * @returns Generated cave grid.
     * @example
     */
    generateCave(width: number, height: number, config?: Partial<CaveGenerationConfig>): CellState[][];
    /**
     * Run Game of Life simulation.
     * @param grid Initial grid state.
     * @param generations Number of generations.
     * @param config Game of Life configuration.
     * @returns Evolution result.
     * @example
     */
    gameOfLife(grid: CellState[][], generations: number, config?: Partial<GameOfLifeConfig>): CellularAutomataResult;
}
//# sourceMappingURL=cellular-automata-core.d.ts.map