/**
 * @module algorithms/pathfinding/hpa-star/hpa-star-utils
 * @description Utility functions for HPA* hierarchical pathfinding algorithm.
 */

import type {
  Point,
  CellType,
  HPAConfig,
  HPAOptions,
  ClusterGenerationOptions,
  EntranceDetectionOptions,
  AbstractGraphOptions,
  PathRefinementOptions,
  HPAValidationOptions,
} from "./hpa-star-types";

/**
 * Utility functions for HPA* pathfinding.
 */
export class HPAStarUtils {
  /**
   * Generates a test grid with random obstacles.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param obstacleRatio - Ratio of obstacles (0-1).
   * @param seed - Random seed for reproducible results.
   * @returns Generated grid.
   * @example
   */
  static generateTestGrid(width: number, height: number, obstacleRatio: number = 0.3, seed?: number): CellType[] {
    const grid: CellType[] = new Array(width * height).fill(CellType.WALKABLE);

    if (seed !== undefined) {
      this.seedRandom(seed);
    }

    for (let i = 0; i < grid.length; i++) {
      if (Math.random() < obstacleRatio) {
        grid[i] = CellType.OBSTACLE;
      }
    }

    return grid;
  }

  /**
   * Generates a grid with a specific pattern.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param pattern - Pattern type.
   * @param seed - Random seed for reproducible results.
   * @returns Generated grid.
   * @example
   */
  static generatePatternGrid(
    width: number,
    height: number,
    pattern: "maze" | "rooms" | "corridors" | "spiral",
    seed?: number
  ): CellType[] {
    if (seed !== undefined) {
      this.seedRandom(seed);
    }

    switch (pattern) {
      case "maze":
        return this.generateMazeGrid(width, height);
      case "rooms":
        return this.generateRoomGrid(width, height);
      case "corridors":
        return this.generateCorridorGrid(width, height);
      case "spiral":
        return this.generateSpiralGrid(width, height);
      default:
        return this.generateTestGrid(width, height, 0.3, seed);
    }
  }

  /**
   * Generates a maze-like grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Generated maze grid.
   * @example
   */
  private static generateMazeGrid(width: number, height: number): CellType[] {
    const grid: CellType[] = new Array(width * height).fill(CellType.OBSTACLE);

    // Start from (1, 1)
    const stack: Point[] = [{ x: 1, y: 1 }];
    grid[1 * width + 1] = CellType.WALKABLE;

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(current, grid, width, height);

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        const wall = this.getWallBetween(current, next);

        grid[next.y * width + next.x] = CellType.WALKABLE;
        grid[wall.y * width + wall.x] = CellType.WALKABLE;

        stack.push(next);
      } else {
        stack.pop();
      }
    }

    return grid;
  }

  /**
   * Generates a room-based grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Generated room grid.
   * @example
   */
  private static generateRoomGrid(width: number, height: number): CellType[] {
    const grid: CellType[] = new Array(width * height).fill(CellType.OBSTACLE);
    const roomCount = Math.floor(Math.random() * 5) + 3;
    const rooms: Array<{ x: number; y: number; width: number; height: number }> = [];

    // Generate rooms
    for (let i = 0; i < roomCount; i++) {
      const roomWidth = 3 + Math.floor(Math.random() * 6);
      const roomHeight = 3 + Math.floor(Math.random() * 6);
      const x = 1 + Math.floor(Math.random() * (width - roomWidth - 2));
      const y = 1 + Math.floor(Math.random() * (height - roomHeight - 2));

      // Check for overlap
      let overlaps = false;
      for (const room of rooms) {
        if (x < room.x + room.width && x + roomWidth > room.x && y < room.y + room.height && y + roomHeight > room.y) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        // Create room
        for (let ry = y; ry < y + roomHeight; ry++) {
          for (let rx = x; rx < x + roomWidth; rx++) {
            grid[ry * width + rx] = CellType.WALKABLE;
          }
        }
        rooms.push({ x, y, width: roomWidth, height: roomHeight });
      }
    }

    // Connect rooms with corridors
    for (let i = 1; i < rooms.length; i++) {
      const room1 = rooms[i - 1];
      const room2 = rooms[i];

      const center1 = {
        x: room1.x + Math.floor(room1.width / 2),
        y: room1.y + Math.floor(room1.height / 2),
      };
      const center2 = {
        x: room2.x + Math.floor(room2.width / 2),
        y: room2.y + Math.floor(room2.height / 2),
      };

      this.createCorridor(grid, width, height, center1, center2);
    }

    return grid;
  }

  /**
   * Generates a corridor-based grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Generated corridor grid.
   * @example
   */
  private static generateCorridorGrid(width: number, height: number): CellType[] {
    const grid: CellType[] = new Array(width * height).fill(CellType.OBSTACLE);

    // Create main corridors
    const corridorWidth = 2;
    const corridorSpacing = 8;

    // Horizontal corridors
    for (let y = corridorSpacing; y < height - corridorSpacing; y += corridorSpacing) {
      for (let x = 0; x < width; x++) {
        for (let w = 0; w < corridorWidth; w++) {
          if (y + w < height) {
            grid[(y + w) * width + x] = CellType.WALKABLE;
          }
        }
      }
    }

    // Vertical corridors
    for (let x = corridorSpacing; x < width - corridorSpacing; x += corridorSpacing) {
      for (let y = 0; y < height; y++) {
        for (let w = 0; w < corridorWidth; w++) {
          if (x + w < width) {
            grid[y * width + (x + w)] = CellType.WALKABLE;
          }
        }
      }
    }

    return grid;
  }

  /**
   * Generates a spiral grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Generated spiral grid.
   * @example
   */
  private static generateSpiralGrid(width: number, height: number): CellType[] {
    const grid: CellType[] = new Array(width * height).fill(CellType.OBSTACLE);

    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);

    let x = centerX;
    let y = centerY;
    let dx = 0;
    let dy = -1;
    let step = 1;
    let stepCount = 0;

    for (let i = 0; i < width * height; i++) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        grid[y * width + x] = CellType.WALKABLE;
      }

      x += dx;
      y += dy;
      stepCount++;

      if (stepCount === step) {
        stepCount = 0;
        const temp = dx;
        dx = -dy;
        dy = temp;

        if (dy === 0) {
          step++;
        }
      }
    }

    return grid;
  }

  /**
   * Creates a corridor between two points.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param from - Starting point.
   * @param to - Ending point.
   * @example
   */
  private static createCorridor(grid: CellType[], width: number, height: number, from: Point, to: Point): void {
    // Horizontal corridor
    const startX = Math.min(from.x, to.x);
    const endX = Math.max(from.x, to.x);
    for (let x = startX; x <= endX; x++) {
      if (x >= 0 && x < width && from.y >= 0 && from.y < height) {
        grid[from.y * width + x] = CellType.WALKABLE;
      }
    }

    // Vertical corridor
    const startY = Math.min(from.y, to.y);
    const endY = Math.max(from.y, to.y);
    for (let y = startY; y <= endY; y++) {
      if (to.x >= 0 && to.x < width && y >= 0 && y < height) {
        grid[y * width + to.x] = CellType.WALKABLE;
      }
    }
  }

  /**
   * Gets unvisited neighbors for maze generation.
   * @param point - Current point.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Array of unvisited neighbors.
   * @example
   */
  private static getUnvisitedNeighbors(point: Point, grid: CellType[], width: number, height: number): Point[] {
    const neighbors: Point[] = [];
    const directions = [
      { x: 0, y: -2 }, // North
      { x: 2, y: 0 }, // East
      { x: 0, y: 2 }, // South
      { x: -2, y: 0 }, // West
    ];

    for (const dir of directions) {
      const neighbor = { x: point.x + dir.x, y: point.y + dir.y };
      if (
        neighbor.x >= 0 &&
        neighbor.x < width &&
        neighbor.y >= 0 &&
        neighbor.y < height &&
        grid[neighbor.y * width + neighbor.x] === CellType.OBSTACLE
      ) {
        neighbors.push(neighbor);
      }
    }

    return neighbors;
  }

  /**
   * Gets the wall between two points for maze generation.
   * @param from - First point.
   * @param to - Second point.
   * @returns Wall point.
   * @example
   */
  private static getWallBetween(from: Point, to: Point): Point {
    return {
      x: from.x + (to.x - from.x) / 2,
      y: from.y + (to.y - from.y) / 2,
    };
  }

  /**
   * Generates random goal points.
   * @param count - Number of goals to generate.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param grid - The grid.
   * @param seed - Random seed.
   * @returns Array of goal points.
   * @example
   */
  static generateRandomGoals(count: number, width: number, height: number, grid: CellType[], seed?: number): Point[] {
    if (seed !== undefined) {
      this.seedRandom(seed);
    }

    const goals: Point[] = [];
    const walkableCells: Point[] = [];

    // Find all walkable cells
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        if (grid[index] === CellType.WALKABLE) {
          walkableCells.push({ x, y });
        }
      }
    }

    // Select random goals
    for (let i = 0; i < Math.min(count, walkableCells.length); i++) {
      const randomIndex = Math.floor(Math.random() * walkableCells.length);
      goals.push(walkableCells.splice(randomIndex, 1)[0]);
    }

    return goals;
  }

  /**
   * Generates goal points in a specific pattern.
   * @param pattern - Goal pattern.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param grid - The grid.
   * @param seed - Random seed.
   * @returns Array of goal points.
   * @example
   */
  static generateGoalPattern(
    pattern: "corners" | "center" | "edges" | "random",
    width: number,
    height: number,
    grid: CellType[],
    seed?: number
  ): Point[] {
    if (seed !== undefined) {
      this.seedRandom(seed);
    }

    const goals: Point[] = [];

    switch (pattern) {
      case "corners":
        goals.push({ x: 0, y: 0 }, { x: width - 1, y: 0 }, { x: 0, y: height - 1 }, { x: width - 1, y: height - 1 });
        break;
      case "center":
        goals.push({
          x: Math.floor(width / 2),
          y: Math.floor(height / 2),
        });
        break;
      case "edges":
        // Top and bottom edges
        for (let x = 0; x < width; x++) {
          goals.push({ x, y: 0 });
          goals.push({ x, y: height - 1 });
        }
        // Left and right edges
        for (let y = 1; y < height - 1; y++) {
          goals.push({ x: 0, y });
          goals.push({ x: width - 1, y });
        }
        break;
      case "random":
        return this.generateRandomGoals(5, width, height, grid, seed);
    }

    // Filter out goals that are obstacles
    return goals.filter(goal => {
      const index = goal.y * width + goal.x;
      return grid[index] === CellType.WALKABLE;
    });
  }

  /**
   * Calculates the distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Distance.
   * @example
   */
  static distance(a: Point, b: Point): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculates the Manhattan distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Manhattan distance.
   * @example
   */
  static manhattanDistance(a: Point, b: Point): number {
    return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
  }

  /**
   * Calculates the Chebyshev distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Chebyshev distance.
   * @example
   */
  static chebyshevDistance(a: Point, b: Point): number {
    return Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
  }

  /**
   * Creates a default configuration for HPA*.
   * @returns Default configuration.
   * @example
   */
  static createDefaultConfig(): HPAConfig {
    return {
      width: 100,
      height: 100,
      clusterSize: 10,
      allowDiagonal: true,
      diagonalOnlyWhenClear: true,
      cardinalCost: 1,
      diagonalCost: Math.sqrt(2),
      maxPathLength: 10000,
      usePathSmoothing: true,
      smoothingFactor: 0.5,
      useEarlyTermination: true,
      validateInput: true,
      enableCaching: true,
      tolerance: 1e-10,
    };
  }

  /**
   * Creates a default options object for HPA* pathfinding.
   * @returns Default options.
   * @example
   */
  static createDefaultOptions(): HPAOptions {
    return {
      returnAbstractPath: true,
      returnRefinedPath: true,
      usePathSmoothing: true,
      useEarlyTermination: true,
      maxIterations: 10000,
      useGoalBounding: false,
      useHierarchicalAbstraction: true,
    };
  }

  /**
   * Creates a default cluster generation options object.
   * @returns Default cluster generation options.
   * @example
   */
  static createDefaultClusterGenerationOptions(): ClusterGenerationOptions {
    return {
      clusterSize: 10,
      useOverlappingClusters: false,
      overlapSize: 0,
      useAdaptiveSizing: false,
      minClusterSize: 5,
      maxClusterSize: 20,
      mergeSmallClusters: true,
      smallClusterThreshold: 5,
    };
  }

  /**
   * Creates a default entrance detection options object.
   * @returns Default entrance detection options.
   * @example
   */
  static createDefaultEntranceDetectionOptions(): EntranceDetectionOptions {
    return {
      detectBorderEntrances: true,
      detectInteriorEntrances: true,
      minEntranceWidth: 1,
      maxEntranceWidth: 3,
      useAdaptiveDetection: false,
      detectionThreshold: 0.5,
    };
  }

  /**
   * Creates a default abstract graph options object.
   * @returns Default abstract graph options.
   * @example
   */
  static createDefaultAbstractGraphOptions(): AbstractGraphOptions {
    return {
      useInterClusterEdges: true,
      useIntraClusterEdges: true,
      useEntranceEdges: true,
      useDirectClusterConnections: true,
      maxEdgeCost: 1000,
      useEdgeCaching: true,
    };
  }

  /**
   * Creates a default path refinement options object.
   * @returns Default path refinement options.
   * @example
   */
  static createDefaultPathRefinementOptions(): PathRefinementOptions {
    return {
      useAStarRefinement: true,
      useJPSRefinement: false,
      useThetaStarRefinement: false,
      usePathSmoothing: true,
      smoothingFactor: 0.5,
      useEarlyTermination: true,
      maxRefinementIterations: 1000,
    };
  }

  /**
   * Creates a default HPA* validation options object.
   * @returns Default HPA* validation options.
   * @example
   */
  static createDefaultHPAValidationOptions(): HPAValidationOptions {
    return {
      checkClusterValidity: true,
      checkEntranceValidity: true,
      checkAbstractGraphValidity: true,
      checkPathValidity: true,
      checkUnreachableAreas: true,
      checkInvalidConnections: true,
      maxPathLength: 10000,
      minPathLength: 1,
    };
  }

  /**
   * Seeds the random number generator for reproducible results.
   * @param seed - Random seed.
   * @example
   */
  private static seedRandom(seed: number): void {
    // Simple linear congruential generator for seeding
    let currentSeed = seed;
    Math.random = () => {
      currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
      return currentSeed / 4294967296;
    };
  }

  /**
   * Converts a grid to a visual string representation.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param goals - Optional goal points.
   * @param agents - Optional agent points.
   * @returns Visual string representation.
   * @example
   */
  static gridToString(
    grid: CellType[],
    width: number,
    height: number,
    goals: Point[] = [],
    agents: Point[] = []
  ): string {
    let result = "";

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const point = { x, y };

        if (goals.some(g => this.pointsEqual(g, point))) {
          result += "G";
        } else if (agents.some(a => this.pointsEqual(a, point))) {
          result += "A";
        } else {
          switch (grid[y * width + x]) {
            case CellType.WALKABLE:
              result += ".";
              break;
            case CellType.OBSTACLE:
              result += "#";
              break;
            case CellType.GOAL:
              result += "G";
              break;
            case CellType.AGENT:
              result += "A";
              break;
            default:
              result += "?";
          }
        }
      }
      result += "\n";
    }

    return result;
  }

  /**
   * Checks if two points are equal.
   * @param a - First point.
   * @param b - Second point.
   * @param tolerance - Numerical tolerance.
   * @returns True if points are equal.
   * @example
   */
  private static pointsEqual(a: Point, b: Point, tolerance: number = 1e-10): boolean {
    return Math.abs(a.x - b.x) < tolerance && Math.abs(a.y - b.y) < tolerance;
  }
}
