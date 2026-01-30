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

import type {
  CellState,
  RuleFunction,
  BoundaryCondition,
  CellularAutomataConfig,
  CellularAutomataResult,
  CellularAutomataStats,
  CellularAutomataOptions,
  GameOfLifeConfig,
  CaveGenerationConfig,
} from "./cellular-automata-types";
import { DEFAULT_CELLULAR_AUTOMATA_CONFIG } from "./cellular-automata-types";

/**
 * Seeded random number generator.
 */
class SeededRandom {
  private seed: number;

  /**
   *
   * @param seed
   * @example
   */
  constructor(seed?: number) {
    this.seed = seed ?? Math.random() * 0x7fffffff;
  }

  /**
   *
   * @example
   */
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

/**
 * Get neighbor states for a cell at position (x, y).
 * @param grid
 * @param x
 * @param y
 * @param width
 * @param height
 * @param boundaryCondition
 * @param fixedBoundaryValue
 * @example
 */
function getNeighbors(
  grid: CellState[][],
  x: number,
  y: number,
  width: number,
  height: number,
  boundaryCondition: BoundaryCondition,
  fixedBoundaryValue: CellState
): CellState[] {
  const neighbors: CellState[] = [];
  const offsets = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0],           [1, 0],
    [-1, 1],  [0, 1],  [1, 1],
  ];

  for (const offset of offsets) {
    const [dx, dy] = offset;
    if (dx === undefined || dy === undefined) continue;
    let nx = x + dx;
    let ny = y + dy;

    // Handle boundary conditions
    switch (boundaryCondition) {
      case 'wrap':
        nx = ((nx % width) + width) % width;
        ny = ((ny % height) + height) % height;
        const wrappedCell = grid[ny]?.[nx];
        if (wrappedCell !== undefined) {
          neighbors.push(wrappedCell);
        }
        break;
      case 'fixed':
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
          neighbors.push(fixedBoundaryValue);
        } else {
          const fixedCell = grid[ny]?.[nx];
          if (fixedCell !== undefined) {
            neighbors.push(fixedCell);
          }
        }
        break;
      case 'reflecting':
        if (nx < 0) nx = 0;
        if (nx >= width) nx = width - 1;
        if (ny < 0) ny = 0;
        if (ny >= height) ny = height - 1;
        const reflectedCell = grid[ny]?.[nx];
        if (reflectedCell !== undefined) {
          neighbors.push(reflectedCell);
        }
        break;
    }
  }

  return neighbors;
}

/**
 * Count alive neighbors (state > 0).
 * @param neighbors
 * @example
 */
function countAliveNeighbors(neighbors: CellState[]): number {
  return neighbors.filter((n) => n > 0).length;
}

/**
 * Game of Life rule function.
 * @param currentState
 * @param neighbors
 * @param config
 * @param config.surviveNeighbors
 * @param config.birthNeighbors
 * @example
 */
function gameOfLifeRule(
  currentState: CellState,
  neighbors: CellState[],
  config: { surviveNeighbors: number[]; birthNeighbors: number[] }
): CellState {
  const alive = countAliveNeighbors(neighbors);
  const isAlive = currentState > 0;

  if (isAlive) {
    // Survive if neighbors in survive list
    return config.surviveNeighbors.includes(alive) ? 1 : 0;
  } else {
    // Birth if neighbors in birth list
    return config.birthNeighbors.includes(alive) ? 1 : 0;
  }
}

/**
 * Cave generation rule function (smoothing).
 * @param _currentState
 * @param neighbors
 * @param _config
 * @param _config.wallThreshold
 * @example
 */
function caveGenerationRule(
  _currentState: CellState,
  neighbors: CellState[],
  _config: { wallThreshold: number }
): CellState {
  const alive = countAliveNeighbors(neighbors);
  // If 5 or more neighbors are walls, become wall; otherwise become floor
  return alive >= 5 ? 1 : 0;
}

/**
 * Initialize grid randomly.
 * @param width
 * @param height
 * @param initialProbability
 * @param rng
 * @example
 */
function initializeGrid(
  width: number,
  height: number,
  initialProbability: number,
  rng: SeededRandom
): CellState[][] {
  const grid: CellState[][] = [];
  for (let y = 0; y < height; y++) {
    const row: CellState[] = [];
    for (let x = 0; x < width; x++) {
      row.push(rng.next() < initialProbability ? 1 : 0);
    }
    grid.push(row);
  }
  return grid;
}

/**
 * Count population (alive cells).
 * @param grid
 * @example
 */
function countPopulation(grid: CellState[][]): number {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell > 0) count++;
    }
  }
  return count;
}

/**
 * Cellular Automata implementation.
 */
export class CellularAutomata {
  private config: {
    width: number;
    height: number;
    initialProbability: number;
    seed?: number;
    boundaryCondition: BoundaryCondition;
    fixedBoundaryValue: CellState;
    numStates: number;
  };
  private rng: SeededRandom;

  /**
   * Creates a new CellularAutomata instance.
   * @param config Configuration options.
   * @example
   */
  constructor(config: Partial<CellularAutomataConfig> = {}) {
    const defaultConfig = DEFAULT_CELLULAR_AUTOMATA_CONFIG;
    const seed = config.seed ?? defaultConfig.seed;
    this.config = {
      width: config.width ?? defaultConfig.width ?? 50,
      height: config.height ?? defaultConfig.height ?? 50,
      initialProbability: config.initialProbability ?? defaultConfig.initialProbability ?? 0.5,
      ...(seed !== undefined && { seed }),
      boundaryCondition: config.boundaryCondition ?? defaultConfig.boundaryCondition ?? 'wrap',
      fixedBoundaryValue: config.fixedBoundaryValue ?? defaultConfig.fixedBoundaryValue ?? 0,
      numStates: (config.numStates ?? defaultConfig.numStates ?? 2) as number,
    };
    this.rng = new SeededRandom(seed);
  }

  /**
   * Evolve the grid for specified number of generations.
   * @param grid Initial grid state (optional).
   * @param options Evolution options.
   * @returns Evolution result.
   * @example
   */
  evolve(
    grid?: CellState[][],
    options: Partial<CellularAutomataOptions> = {}
  ): CellularAutomataResult {
    const startTime = performance.now();
    const generations = options.generations ?? 10;
    const storeHistory = options.storeHistory ?? false;
    const ruleFunction = options.ruleFunction;
    const presetRule = options.presetRule;

    // Initialize grid if not provided
    if (!grid) {
      grid = initializeGrid(
        this.config.width,
        this.config.height,
        this.config.initialProbability,
        this.rng
      );
    }

    if (grid.length === 0 || grid[0] === undefined) {
      throw new Error('Grid must have at least one row');
    }

    const width = grid[0].length;
    const height = grid.length;
    const history: CellState[][][] = storeHistory ? [grid.map((row) => [...row])] : [];

    let currentGrid = grid.map((row) => [...row]);
    const populationHistory: number[] = [countPopulation(currentGrid)];

    // Determine rule function
    let rule: RuleFunction;
    if (ruleFunction) {
      rule = ruleFunction;
    } else if (presetRule === 'game-of-life') {
      const golConfig = options as Partial<GameOfLifeConfig>;
      const surviveNeighbors = golConfig.surviveNeighbors ?? [2, 3];
      const birthNeighbors = golConfig.birthNeighbors ?? [3];
      rule = (state, neighbors) =>
        gameOfLifeRule(state, neighbors, {
          surviveNeighbors,
          birthNeighbors,
        });
    } else if (presetRule === 'cave-generation') {
      const caveConfig = options as Partial<CaveGenerationConfig>;
      const wallThreshold = caveConfig.wallThreshold ?? 0.5;
      rule = (state, neighbors) =>
        caveGenerationRule(state, neighbors, {
          wallThreshold,
        });
    } else {
      // Default: Game of Life
      rule = (state, neighbors) =>
        gameOfLifeRule(state, neighbors, {
          surviveNeighbors: [2, 3],
          birthNeighbors: [3],
        });
    }

    // Evolve for specified generations
    for (let gen = 0; gen < generations; gen++) {
      const newGrid: CellState[][] = [];

      for (let y = 0; y < height; y++) {
        const newRow: CellState[] = [];
        for (let x = 0; x < width; x++) {
          const neighbors = getNeighbors(
            currentGrid,
            x,
            y,
            width,
            height,
            this.config.boundaryCondition,
            this.config.fixedBoundaryValue
          );
          const currentCell = currentGrid[y]?.[x];
          if (currentCell === undefined) {
            throw new Error(`Cell at position (${x}, ${y}) is undefined`);
          }
          const newState = rule(currentCell, neighbors, { x, y });
          newRow.push(newState);
        }
        newGrid.push(newRow);
      }

      currentGrid = newGrid;
      populationHistory.push(countPopulation(currentGrid));

      if (storeHistory) {
        history.push(currentGrid.map((row) => [...row]));
      }
    }

    const stats: CellularAutomataStats = {
      generations,
      executionTime: performance.now() - startTime,
      population: countPopulation(currentGrid),
      populationHistory,
    };

    const result: CellularAutomataResult = {
      grid: currentGrid,
      stats,
    };

    if (storeHistory) {
      result.history = history;
    }

    return result;
  }

  /**
   * Generate cave-like terrain using cellular automata.
   * @param width Grid width.
   * @param height Grid height.
   * @param config Cave generation configuration.
   * @returns Generated cave grid.
   * @example
   */
  generateCave(
    width: number,
    height: number,
    config: Partial<CaveGenerationConfig> = {}
  ): CellState[][] {
    const initialSmoothing = config.initialSmoothing ?? 5;
    const wallThreshold = config.wallThreshold ?? 0.5;

    // Initialize with random noise
    const initialGrid = initializeGrid(width, height, wallThreshold, this.rng);

    // Apply initial smoothing passes
    let grid = initialGrid;
    for (let i = 0; i < initialSmoothing; i++) {
      const result = this.evolve(grid, {
        generations: 1,
        presetRule: 'cave-generation',
        ...({ wallThreshold } as Partial<CaveGenerationConfig>),
      });
      grid = result.grid;
    }

    return grid;
  }

  /**
   * Run Game of Life simulation.
   * @param grid Initial grid state.
   * @param generations Number of generations.
   * @param config Game of Life configuration.
   * @returns Evolution result.
   * @example
   */
  gameOfLife(
    grid: CellState[][],
    generations: number,
    config: Partial<GameOfLifeConfig> = {}
  ): CellularAutomataResult {
    return this.evolve(grid, {
      generations,
      presetRule: 'game-of-life',
      ...({
        surviveNeighbors: config.surviveNeighbors ?? [2, 3],
        birthNeighbors: config.birthNeighbors ?? [3],
      } as Partial<GameOfLifeConfig>),
    });
  }
}
