/**
 * @module algorithms/procedural-generation/cellular-automata-types
 * @description Type definitions for Cellular Automata algorithms.
 */
/**
 * Cell state value (typically 0 or 1 for binary, but can be any number).
 */
export type CellState = number;
/**
 * Rule function that determines next state based on current state and neighbors.
 */
export type RuleFunction = (currentState: CellState, neighbors: CellState[], position: {
    x: number;
    y: number;
}) => CellState;
/**
 * Boundary condition type.
 */
export type BoundaryCondition = 'wrap' | 'fixed' | 'reflecting';
/**
 * Configuration options for Cellular Automata.
 */
export interface CellularAutomataConfig {
    /**
     * Grid width.
     * @default 50
     */
    width?: number;
    /**
     * Grid height.
     * @default 50
     */
    height?: number;
    /**
     * Initial probability of a cell being alive (for random initialization).
     * @default 0.5
     */
    initialProbability?: number;
    /**
     * Random seed for reproducible results.
     * @default undefined (uses Math.random)
     */
    seed?: number;
    /**
     * Boundary condition type.
     * @default 'wrap'
     */
    boundaryCondition?: BoundaryCondition;
    /**
     * Fixed boundary value (used when boundaryCondition is 'fixed').
     * @default 0
     */
    fixedBoundaryValue?: CellState;
    /**
     * Number of states (for multi-state automata).
     * @default 2
     */
    numStates?: number | undefined;
}
/**
 * Statistics about the cellular automata evolution.
 */
export interface CellularAutomataStats {
    /**
     * Number of generations evolved.
     */
    generations: number;
    /**
     * Execution time in milliseconds.
     */
    executionTime: number;
    /**
     * Current population (number of alive cells).
     */
    population: number;
    /**
     * Population history over generations.
     */
    populationHistory: number[];
}
/**
 * Result of cellular automata evolution.
 */
export interface CellularAutomataResult {
    /**
     * Final grid state.
     */
    grid: CellState[][];
    /**
     * Statistics about the evolution.
     */
    stats: CellularAutomataStats;
    /**
     * History of grid states (if enabled).
     */
    history?: CellState[][][];
}
/**
 * Options for cellular automata evolution.
 */
export interface CellularAutomataOptions extends Partial<CellularAutomataConfig> {
    /**
     * Number of generations to evolve.
     * @default 10
     */
    generations?: number;
    /**
     * Whether to store history of all generations.
     * @default false
     */
    storeHistory?: boolean;
    /**
     * Custom rule function (overrides preset rules).
     */
    ruleFunction?: RuleFunction;
    /**
     * Preset rule name (e.g., 'game-of-life', 'cave-generation').
     */
    presetRule?: string;
}
/**
 * Game of Life specific configuration.
 */
export interface GameOfLifeConfig extends CellularAutomataConfig {
    /**
     * Number of neighbors required for a live cell to survive.
     * @default [2, 3]
     */
    surviveNeighbors?: number[];
    /**
     * Number of neighbors required for a dead cell to become alive.
     * @default [3]
     */
    birthNeighbors?: number[];
}
/**
 * Cave generation specific configuration.
 */
export interface CaveGenerationConfig extends CellularAutomataConfig {
    /**
     * Number of initial smoothing passes.
     * @default 5
     */
    initialSmoothing?: number;
    /**
     * Threshold for wall generation (0-1).
     * @default 0.5
     */
    wallThreshold?: number;
}
/**
 * Default configuration.
 */
export declare const DEFAULT_CELLULAR_AUTOMATA_CONFIG: CellularAutomataConfig;
//# sourceMappingURL=cellular-automata-types.d.ts.map