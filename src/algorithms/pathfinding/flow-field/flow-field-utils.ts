/**
 * @module algorithms/pathfinding/flow-field/flow-field-utils
 * @description Utility functions for Flow Field pathfinding algorithm.
 */

import type {
  Point,
  Vector,
  FlowFieldConfig,
  FlowFieldOptions,
  AgentPathfindingOptions,
  MultiGoalOptions,
  DynamicObstacleOptions,
  FlowFieldValidationOptions,
} from "./flow-field-types";
import { CellType } from "./flow-field-types";

/**
 * Utility functions for Flow Field pathfinding.
 */
export class FlowFieldUtils {
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
   * Gets the direction vector between two points.
   * @param from - Starting point.
   * @param to - Ending point.
   * @returns Direction vector.
   * @example
   */
  static getDirectionVector(from: Point, to: Point): Vector {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) {
      return { x: 0, y: 0 };
    }

    return { x: dx / length, y: dy / length };
  }

  /**
   * Normalizes a direction vector.
   * @param vector - Vector to normalize.
   * @returns Normalized vector.
   * @example
   */
  static normalizeVector(vector: Vector): Vector {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

    if (length === 0) {
      return { x: 0, y: 0 };
    }

    return { x: vector.x / length, y: vector.y / length };
  }

  /**
   * Calculates the dot product of two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Dot product.
   * @example
   */
  static dotProduct(a: Vector, b: Vector): number {
    return a.x * b.x + a.y * b.y;
  }

  /**
   * Calculates the cross product of two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Cross product (scalar in 2D).
   * @example
   */
  static crossProduct(a: Vector, b: Vector): number {
    return a.x * b.y - a.y * b.x;
  }

  /**
   * Calculates the angle between two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Angle in radians.
   * @example
   */
  static angleBetweenVectors(a: Vector, b: Vector): number {
    const dot = this.dotProduct(a, b);
    const magA = Math.sqrt(a.x * a.x + a.y * a.y);
    const magB = Math.sqrt(b.x * b.x + b.y * b.y);

    if (magA === 0 || magB === 0) {
      return 0;
    }

    return Math.acos(Math.max(-1, Math.min(1, dot / (magA * magB))));
  }

  /**
   * Rotates a vector by an angle.
   * @param vector - Vector to rotate.
   * @param angle - Angle in radians.
   * @returns Rotated vector.
   * @example
   */
  static rotateVector(vector: Vector, angle: number): Vector {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    return {
      x: vector.x * cos - vector.y * sin,
      y: vector.x * sin + vector.y * cos,
    };
  }

  /**
   * Interpolates between two points.
   * @param a - First point.
   * @param b - Second point.
   * @param t - Interpolation factor (0-1).
   * @returns Interpolated point.
   * @example
   */
  static interpolatePoints(a: Point, b: Point, t: number): Point {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    };
  }

  /**
   * Calculates the centroid of a set of points.
   * @param points - Array of points.
   * @returns Centroid point.
   * @example
   */
  static calculateCentroid(points: Point[]): Point {
    if (points.length === 0) {
      return { x: 0, y: 0 };
    }

    const sum = points.reduce((acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }), { x: 0, y: 0 });

    return {
      x: sum.x / points.length,
      y: sum.y / points.length,
    };
  }

  /**
   * Calculates the bounding box of a set of points.
   * @param points - Array of points.
   * @returns Bounding box.
   * @example
   */
  static calculateBoundingBox(points: Point[]): { min: Point; max: Point } {
    if (points.length === 0) {
      return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    }

    let minX = points[0].x;
    let minY = points[0].y;
    let maxX = points[0].x;
    let maxY = points[0].y;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    return {
      min: { x: minX, y: minY },
      max: { x: maxX, y: maxY },
    };
  }

  /**
   * Generates random agent positions.
   * @param count - Number of agents to generate.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param grid - The grid.
   * @param seed - Random seed.
   * @returns Array of agent positions.
   * @example
   */
  static generateRandomAgents(count: number, width: number, height: number, grid: CellType[], seed?: number): Point[] {
    if (seed !== undefined) {
      this.seedRandom(seed);
    }

    const agents: Point[] = [];
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

    // Select random agents
    for (let i = 0; i < Math.min(count, walkableCells.length); i++) {
      const randomIndex = Math.floor(Math.random() * walkableCells.length);
      agents.push(walkableCells.splice(randomIndex, 1)[0]);
    }

    return agents;
  }

  /**
   * Generates agent positions in a specific pattern.
   * @param pattern - Agent pattern.
   * @param count - Number of agents.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param grid - The grid.
   * @param seed - Random seed.
   * @returns Array of agent positions.
   * @example
   */
  static generateAgentPattern(
    pattern: "line" | "circle" | "grid" | "random",
    count: number,
    width: number,
    height: number,
    grid: CellType[],
    seed?: number
  ): Point[] {
    if (seed !== undefined) {
      this.seedRandom(seed);
    }

    const agents: Point[] = [];

    switch (pattern) {
      case "line":
        // Line along the left edge
        for (let i = 0; i < count; i++) {
          const y = Math.floor((i * height) / count);
          agents.push({ x: 0, y });
        }
        break;
      case "circle":
        // Circle around the center
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 4;
        for (let i = 0; i < count; i++) {
          const angle = (i * 2 * Math.PI) / count;
          const x = Math.round(centerX + radius * Math.cos(angle));
          const y = Math.round(centerY + radius * Math.sin(angle));
          agents.push({ x, y });
        }
        break;
      case "grid":
        // Grid pattern
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);
        const cellWidth = width / cols;
        const cellHeight = height / rows;
        for (let i = 0; i < count; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = Math.round(col * cellWidth + cellWidth / 2);
          const y = Math.round(row * cellHeight + cellHeight / 2);
          agents.push({ x, y });
        }
        break;
      case "random":
        return this.generateRandomAgents(count, width, height, grid, seed);
    }

    // Filter out agents that are on obstacles
    return agents.filter(agent => {
      const index = agent.y * width + agent.x;
      return grid[index] === CellType.WALKABLE;
    });
  }

  /**
   * Creates a default configuration for Flow Field.
   * @returns Default configuration.
   * @example
   */
  static createDefaultConfig(): FlowFieldConfig {
    return {
      width: 100,
      height: 100,
      allowDiagonal: true,
      diagonalOnlyWhenClear: true,
      cardinalCost: 1,
      diagonalCost: Math.sqrt(2),
      maxCost: 10000,
      useManhattanDistance: false,
      useEuclideanDistance: true,
      validateInput: true,
      enableCaching: true,
      tolerance: 1e-10,
    };
  }

  /**
   * Creates a default options object for flow field generation.
   * @returns Default options.
   * @example
   */
  static createDefaultOptions(): FlowFieldOptions {
    return {
      returnIntegrationField: true,
      returnFlowField: true,
      normalizeFlowVectors: true,
      useEarlyTermination: true,
      maxIterations: 10000,
      useGoalBounding: false,
      useMultiGoal: false,
    };
  }

  /**
   * Creates a default agent pathfinding options object.
   * @returns Default agent pathfinding options.
   * @example
   */
  static createDefaultAgentPathfindingOptions(): AgentPathfindingOptions {
    return {
      useFlowField: true,
      useIntegrationField: false,
      useAStarFallback: true,
      maxPathLength: 10000,
      smoothPath: false,
      smoothingFactor: 0.5,
      useEarlyTermination: true,
    };
  }

  /**
   * Creates a default multi-goal options object.
   * @returns Default multi-goal options.
   * @example
   */
  static createDefaultMultiGoalOptions(): MultiGoalOptions {
    return {
      useMultiGoal: true,
      goalWeights: [1.0],
      useWeightedAverage: false,
      useMinimumCost: true,
      useMaximumCost: false,
      compositionMethod: "minimum",
    };
  }

  /**
   * Creates a default dynamic obstacle options object.
   * @returns Default dynamic obstacle options.
   * @example
   */
  static createDefaultDynamicObstacleOptions(): DynamicObstacleOptions {
    return {
      enableDynamicUpdates: true,
      useIncrementalUpdates: true,
      useFullRecomputation: false,
      updateRadius: 5,
      useObstacleInfluence: true,
      obstacleInfluenceRadius: 3,
      obstacleInfluenceStrength: 2.0,
    };
  }

  /**
   * Creates a default flow field validation options object.
   * @returns Default flow field validation options.
   * @example
   */
  static createDefaultFlowFieldValidationOptions(): FlowFieldValidationOptions {
    return {
      checkFlowFieldValidity: true,
      checkIntegrationFieldValidity: true,
      checkUnreachableAreas: true,
      checkInvalidFlowVectors: true,
      maxFlowVectorMagnitude: 2.0,
      minFlowVectorMagnitude: 0.0,
      checkCircularFlows: true,
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
   * Converts a flow field to a visual string representation.
   * @param flowField - The flow field.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Visual string representation.
   * @example
   */
  static flowFieldToString(flowField: any[], width: number, height: number): string {
    let result = "";

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        const cell = flowField[index];

        if (!cell.valid) {
          result += "#";
        } else if (cell.magnitude === 0) {
          result += "G";
        } else {
          // Use arrow characters to show direction
          const angle = Math.atan2(cell.vector.y, cell.vector.x);
          const normalizedAngle = (angle + Math.PI * 2) % (Math.PI * 2);

          if (normalizedAngle < Math.PI / 8 || normalizedAngle > (15 * Math.PI) / 8) {
            result += "→";
          } else if (normalizedAngle < (3 * Math.PI) / 8) {
            result += "↗";
          } else if (normalizedAngle < (5 * Math.PI) / 8) {
            result += "↑";
          } else if (normalizedAngle < (7 * Math.PI) / 8) {
            result += "↖";
          } else if (normalizedAngle < (9 * Math.PI) / 8) {
            result += "←";
          } else if (normalizedAngle < (11 * Math.PI) / 8) {
            result += "↙";
          } else if (normalizedAngle < (13 * Math.PI) / 8) {
            result += "↓";
          } else if (normalizedAngle < (15 * Math.PI) / 8) {
            result += "↘";
          } else {
            result += "·";
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
