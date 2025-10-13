/**
 * @module algorithms/geometry/algorithms/poisson-disk/poisson-disk-core
 * @description Implements the Poisson Disk Sampling algorithm for high-quality point distribution.
 */

import {
  Point2D,
  Point3D,
  PoissonDiskConfig,
  PoissonDiskStats,
  PoissonDiskResult,
  PoissonDisk2DOptions,
  PoissonDisk3DOptions,
  PoissonDiskAnalysisOptions,
  PoissonDiskAnalysis,
  AdaptivePoissonDiskOptions,
  AdaptivePoissonDiskResult,
  ConstrainedPoissonDiskOptions,
  ConstrainedPoissonDiskResult,
} from "./poisson-disk-types";

/**
 * The PoissonDisk class provides implementations of Poisson Disk Sampling algorithms
 * for generating high-quality point distributions. It supports both 2D and 3D sampling
 * with multiple algorithms including Bridson's algorithm and dart-throwing.
 *
 * Poisson Disk Sampling ensures that no two points are closer than a specified minimum
 * distance, creating visually pleasing and well-distributed point sets useful for
 * procedural generation, texture synthesis, and computer graphics applications.
 *
 * @example
 * ```typescript
 * const poissonDisk = new PoissonDisk();
 *
 * // Generate 2D points
 * const result2D = poissonDisk.sample2D({ width: 100, height: 100, minDistance: 5 });
 * console.log("Generated points:", result2D.points);
 *
 * // Generate 3D points
 * const result3D = poissonDisk.sample3D({ width: 50, height: 50, depth: 50, minDistance: 3 });
 * console.log("Generated 3D points:", result3D.points);
 *
 * // Analyze the distribution
 * const analysis = poissonDisk.analyzeDistribution(result2D.points, { width: 100, height: 100 });
 * console.log("Coverage:", analysis.coverage.coveragePercentage);
 * ```
 */
export class PoissonDisk {
  private config: PoissonDiskConfig;
  private random: () => number;

  /**
   * Creates an instance of PoissonDisk.
   * @param config - Optional configuration for the sampling process.
   */
  constructor(config: Partial<PoissonDiskConfig> = {}) {
    this.config = {
      minDistance: 1.0,
      maxAttempts: 30,
      width: 100,
      height: 100,
      depth: 100,
      seed: 0,
      useGrid: true,
      allowBoundary: true,
      maxPoints: 10000,
      algorithm: "bridson",
      ...config,
    };

    // Initialize random number generator with seed
    this.random = this.createSeededRandom(this.config.seed!);
  }

  /**
   * Generates a 2D Poisson Disk Sampling.
   * @param options - Options for 2D sampling.
   * @returns A PoissonDiskResult object with the generated points and statistics.
   */
  sample2D(options: PoissonDisk2DOptions): PoissonDiskResult {
    const startTime = performance.now();
    const mergedConfig = { ...this.config, ...options };

    try {
      let points: Point2D[];
      let stats: PoissonDiskStats;

      if (mergedConfig.algorithm === "bridson") {
        const result = this.bridson2D(mergedConfig);
        points = result.points;
        stats = result.stats;
      } else {
        const result = this.dartThrowing2D(mergedConfig);
        points = result.points;
        stats = result.stats;
      }

      const executionTime = performance.now() - startTime;
      stats.executionTime = executionTime;

      return {
        points,
        stats,
        success: true,
        message: `Successfully generated ${points.length} points in 2D space.`,
      };
    } catch (error) {
      return {
        points: [],
        stats: {
          pointsPlaced: 0,
          attemptsMade: 0,
          failedAttempts: 0,
          executionTime: performance.now() - startTime,
          coveragePercentage: 0,
          averageDistance: 0,
          actualMinDistance: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        success: false,
        message: `Failed to generate 2D Poisson Disk Sampling: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Generates a 3D Poisson Disk Sampling.
   * @param options - Options for 3D sampling.
   * @returns A PoissonDiskResult object with the generated points and statistics.
   */
  sample3D(options: PoissonDisk3DOptions): PoissonDiskResult {
    const startTime = performance.now();
    const mergedConfig = { ...this.config, ...options };

    try {
      let points: Point3D[];
      let stats: PoissonDiskStats;

      if (mergedConfig.algorithm === "bridson") {
        const result = this.bridson3D(mergedConfig);
        points = result.points;
        stats = result.stats;
      } else {
        const result = this.dartThrowing3D(mergedConfig);
        points = result.points;
        stats = result.stats;
      }

      const executionTime = performance.now() - startTime;
      stats.executionTime = executionTime;

      return {
        points,
        stats,
        success: true,
        message: `Successfully generated ${points.length} points in 3D space.`,
      };
    } catch (error) {
      return {
        points: [],
        stats: {
          pointsPlaced: 0,
          attemptsMade: 0,
          failedAttempts: 0,
          executionTime: performance.now() - startTime,
          coveragePercentage: 0,
          averageDistance: 0,
          actualMinDistance: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        success: false,
        message: `Failed to generate 3D Poisson Disk Sampling: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Performs adaptive Poisson Disk Sampling that adjusts the minimum distance
   * to achieve better coverage.
   * @param options - Options for adaptive sampling.
   * @returns An AdaptivePoissonDiskResult object.
   */
  adaptiveSample2D(options: AdaptivePoissonDiskOptions): AdaptivePoissonDiskResult {
    const startTime = performance.now();
    let currentMinDistance = options.baseMinDistance;
    let iterations = 0;
    let bestResult: PoissonDiskResult | null = null;
    let bestCoverage = 0;

    try {
      while (iterations < options.maxIterations!) {
        const result = this.sample2D({
          width: this.config.width!,
          height: this.config.height!,
          minDistance: currentMinDistance,
          maxAttempts: this.config.maxAttempts,
          algorithm: this.config.algorithm,
        });

        if (result.success) {
          const analysis = this.analyzeDistribution(result.points as Point2D[], {
            width: this.config.width!,
            height: this.config.height!,
          });

          if (analysis.coverage.coveragePercentage > bestCoverage) {
            bestCoverage = analysis.coverage.coveragePercentage;
            bestResult = result;
          }

          if (analysis.coverage.coveragePercentage >= options.targetCoverage! * 100) {
            break;
          }
        }

        // Adjust minimum distance
        if (bestCoverage < options.targetCoverage! * 100) {
          currentMinDistance *= 1 - options.adaptationFactor!;
          currentMinDistance = Math.max(currentMinDistance, options.minMinDistance);
        } else {
          currentMinDistance *= 1 + options.adaptationFactor!;
          currentMinDistance = Math.min(currentMinDistance, options.maxMinDistance);
        }

        iterations++;
      }

      if (!bestResult) {
        throw new Error("Failed to generate any valid sampling");
      }

      return {
        points: bestResult.points,
        finalMinDistance: currentMinDistance,
        iterations,
        finalCoverage: bestCoverage,
        stats: bestResult.stats,
        success: true,
        message: `Adaptive sampling completed in ${iterations} iterations with ${bestCoverage.toFixed(2)}% coverage.`,
      };
    } catch (error) {
      return {
        points: [],
        finalMinDistance: currentMinDistance,
        iterations,
        finalCoverage: 0,
        stats: {
          pointsPlaced: 0,
          attemptsMade: 0,
          failedAttempts: 0,
          executionTime: performance.now() - startTime,
          coveragePercentage: 0,
          averageDistance: 0,
          actualMinDistance: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        success: false,
        message: `Adaptive sampling failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Performs constrained Poisson Disk Sampling with custom validation.
   * @param options - Options for constrained sampling.
   * @returns A ConstrainedPoissonDiskResult object.
   */
  constrainedSample2D(options: ConstrainedPoissonDiskOptions): ConstrainedPoissonDiskResult {
    const startTime = performance.now();
    let rejectedPoints = 0;
    const points: Point2D[] = [];
    let attemptsMade = 0;
    let failedAttempts = 0;

    try {
      const maxAttempts = options.maxAttempts! * 2; // Allow more attempts for constrained sampling
      const maxPoints = options.maxPoints!;

      while (points.length < maxPoints && attemptsMade < maxAttempts) {
        const candidate = this.generateRandomPoint2D(options);
        attemptsMade++;

        if (!options.isValidPoint(candidate)) {
          rejectedPoints++;
          continue;
        }

        const isValid = this.isValidPoint2D(candidate, points, options);
        if (isValid) {
          points.push(candidate);
        } else {
          failedAttempts++;
        }
      }

      const stats: PoissonDiskStats = {
        pointsPlaced: points.length,
        attemptsMade,
        failedAttempts,
        executionTime: performance.now() - startTime,
        coveragePercentage: this.calculateCoverage2D(points, options),
        averageDistance: this.calculateAverageDistance2D(points),
        actualMinDistance: this.calculateActualMinDistance2D(points),
        success: true,
      };

      return {
        points,
        rejectedPoints,
        stats,
        success: true,
        message: `Constrained sampling generated ${points.length} points with ${rejectedPoints} rejections.`,
      };
    } catch (error) {
      return {
        points: [],
        rejectedPoints,
        stats: {
          pointsPlaced: 0,
          attemptsMade,
          failedAttempts,
          executionTime: performance.now() - startTime,
          coveragePercentage: 0,
          averageDistance: 0,
          actualMinDistance: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        success: false,
        message: `Constrained sampling failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Analyzes the quality of a Poisson Disk Sampling distribution.
   * @param points - The points to analyze.
   * @param bounds - The bounds of the sampling area.
   * @param options - Analysis options.
   * @returns A PoissonDiskAnalysis object.
   */
  analyzeDistribution(
    points: Point2D[] | Point3D[],
    bounds: { width: number; height: number; depth?: number },
    options: Partial<PoissonDiskAnalysisOptions> = {}
  ): PoissonDiskAnalysis {
    const startTime = performance.now();
    const analysisOptions: PoissonDiskAnalysisOptions = {
      computeDistanceStats: true,
      computeCoverage: true,
      computeUniformity: true,
      computeSpatialDistribution: false,
      ...options,
    };

    const analysis: PoissonDiskAnalysis = {
      distanceStats: {
        minDistance: 0,
        maxDistance: 0,
        averageDistance: 0,
        medianDistance: 0,
        standardDeviation: 0,
      },
      coverage: {
        totalArea: 0,
        coveredArea: 0,
        coveragePercentage: 0,
        uncoveredRegions: 0,
      },
      uniformity: {
        coefficientOfVariation: 0,
        uniformityIndex: 0,
        clusteringIndex: 0,
      },
      executionTime: 0,
    };

    if (points.length === 0) {
      analysis.executionTime = performance.now() - startTime;
      return analysis;
    }

    if (analysisOptions.computeDistanceStats) {
      analysis.distanceStats = this.computeDistanceStats(points);
    }

    if (analysisOptions.computeCoverage) {
      analysis.coverage = this.computeCoverage(points, bounds);
    }

    if (analysisOptions.computeUniformity) {
      analysis.uniformity = this.computeUniformity(points);
    }

    if (analysisOptions.computeSpatialDistribution) {
      analysis.spatialDistribution = this.computeSpatialDistribution(points, bounds);
    }

    analysis.executionTime = performance.now() - startTime;
    return analysis;
  }

  // Private helper methods

  private createSeededRandom(seed: number): () => number {
    let currentSeed = seed;
    return () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }

  private bridson2D(config: PoissonDiskConfig): { points: Point2D[]; stats: PoissonDiskStats } {
    const points: Point2D[] = [];
    const activeList: Point2D[] = [];
    let attemptsMade = 0;
    let failedAttempts = 0;

    // Calculate grid cell size
    const cellSize = config.gridCellSize || config.minDistance! / Math.sqrt(2);
    const gridWidth = Math.ceil(config.width! / cellSize);
    const gridHeight = Math.ceil(config.height! / cellSize);
    const grid: (Point2D | null)[][] = Array(gridHeight)
      .fill(null)
      .map(() => Array(gridWidth).fill(null));

    // Add first point
    const firstPoint = this.generateRandomPoint2D(config);
    points.push(firstPoint);
    activeList.push(firstPoint);
    this.addToGrid(firstPoint, grid, cellSize);

    while (activeList.length > 0 && points.length < config.maxPoints!) {
      const randomIndex = Math.floor(this.random() * activeList.length);
      const point = activeList[randomIndex];
      let found = false;

      for (let i = 0; i < config.maxAttempts!; i++) {
        const candidate = this.generateCandidate2D(point, config.minDistance!);
        attemptsMade++;

        if (this.isValidCandidate2D(candidate, grid, cellSize, config)) {
          points.push(candidate);
          activeList.push(candidate);
          this.addToGrid(candidate, grid, cellSize);
          found = true;
          break;
        } else {
          failedAttempts++;
        }
      }

      if (!found) {
        activeList.splice(randomIndex, 1);
      }
    }

    const stats: PoissonDiskStats = {
      pointsPlaced: points.length,
      attemptsMade,
      failedAttempts,
      executionTime: 0, // Will be set by caller
      coveragePercentage: this.calculateCoverage2D(points, config),
      averageDistance: this.calculateAverageDistance2D(points),
      actualMinDistance: this.calculateActualMinDistance2D(points),
      success: true,
    };

    return { points, stats };
  }

  private bridson3D(config: PoissonDiskConfig): { points: Point3D[]; stats: PoissonDiskStats } {
    const points: Point3D[] = [];
    const activeList: Point3D[] = [];
    let attemptsMade = 0;
    let failedAttempts = 0;

    // Calculate grid cell size
    const cellSize = config.gridCellSize || config.minDistance! / Math.sqrt(3);
    const gridWidth = Math.ceil(config.width! / cellSize);
    const gridHeight = Math.ceil(config.height! / cellSize);
    const gridDepth = Math.ceil(config.depth! / cellSize);
    const grid: (Point3D | null)[][][] = Array(gridDepth)
      .fill(null)
      .map(() =>
        Array(gridHeight)
          .fill(null)
          .map(() => Array(gridWidth).fill(null))
      );

    // Add first point
    const firstPoint = this.generateRandomPoint3D(config);
    points.push(firstPoint);
    activeList.push(firstPoint);
    this.addToGrid3D(firstPoint, grid, cellSize);

    while (activeList.length > 0 && points.length < config.maxPoints!) {
      const randomIndex = Math.floor(this.random() * activeList.length);
      const point = activeList[randomIndex];
      let found = false;

      for (let i = 0; i < config.maxAttempts!; i++) {
        const candidate = this.generateCandidate3D(point, config.minDistance!);
        attemptsMade++;

        if (this.isValidCandidate3D(candidate, grid, cellSize, config)) {
          points.push(candidate);
          activeList.push(candidate);
          this.addToGrid3D(candidate, grid, cellSize);
          found = true;
          break;
        } else {
          failedAttempts++;
        }
      }

      if (!found) {
        activeList.splice(randomIndex, 1);
      }
    }

    const stats: PoissonDiskStats = {
      pointsPlaced: points.length,
      attemptsMade,
      failedAttempts,
      executionTime: 0, // Will be set by caller
      coveragePercentage: this.calculateCoverage3D(points, config),
      averageDistance: this.calculateAverageDistance3D(points),
      actualMinDistance: this.calculateActualMinDistance3D(points),
      success: true,
    };

    return { points, stats };
  }

  private dartThrowing2D(config: PoissonDiskConfig): { points: Point2D[]; stats: PoissonDiskStats } {
    const points: Point2D[] = [];
    let attemptsMade = 0;
    let failedAttempts = 0;

    while (points.length < config.maxPoints! && attemptsMade < config.maxAttempts! * 100) {
      const candidate = this.generateRandomPoint2D(config);
      attemptsMade++;

      if (this.isValidPoint2D(candidate, points, config)) {
        points.push(candidate);
      } else {
        failedAttempts++;
      }
    }

    const stats: PoissonDiskStats = {
      pointsPlaced: points.length,
      attemptsMade,
      failedAttempts,
      executionTime: 0, // Will be set by caller
      coveragePercentage: this.calculateCoverage2D(points, config),
      averageDistance: this.calculateAverageDistance2D(points),
      actualMinDistance: this.calculateActualMinDistance2D(points),
      success: true,
    };

    return { points, stats };
  }

  private dartThrowing3D(config: PoissonDiskConfig): { points: Point3D[]; stats: PoissonDiskStats } {
    const points: Point3D[] = [];
    let attemptsMade = 0;
    let failedAttempts = 0;

    while (points.length < config.maxPoints! && attemptsMade < config.maxAttempts! * 100) {
      const candidate = this.generateRandomPoint3D(config);
      attemptsMade++;

      if (this.isValidPoint3D(candidate, points, config)) {
        points.push(candidate);
      } else {
        failedAttempts++;
      }
    }

    const stats: PoissonDiskStats = {
      pointsPlaced: points.length,
      attemptsMade,
      failedAttempts,
      executionTime: 0, // Will be set by caller
      coveragePercentage: this.calculateCoverage3D(points, config),
      averageDistance: this.calculateAverageDistance3D(points),
      actualMinDistance: this.calculateActualMinDistance3D(points),
      success: true,
    };

    return { points, stats };
  }

  private generateRandomPoint2D(config: PoissonDiskConfig): Point2D {
    const margin = config.allowBoundary ? 0 : config.minDistance! / 2;
    return {
      x: margin + this.random() * (config.width! - 2 * margin),
      y: margin + this.random() * (config.height! - 2 * margin),
    };
  }

  private generateRandomPoint3D(config: PoissonDiskConfig): Point3D {
    const margin = config.allowBoundary ? 0 : config.minDistance! / 2;
    return {
      x: margin + this.random() * (config.width! - 2 * margin),
      y: margin + this.random() * (config.height! - 2 * margin),
      z: margin + this.random() * (config.depth! - 2 * margin),
    };
  }

  private generateCandidate2D(point: Point2D, minDistance: number): Point2D {
    const angle = this.random() * 2 * Math.PI;
    const distance = minDistance + this.random() * minDistance;
    return {
      x: point.x + Math.cos(angle) * distance,
      y: point.y + Math.sin(angle) * distance,
    };
  }

  private generateCandidate3D(point: Point3D, minDistance: number): Point3D {
    const angle1 = this.random() * 2 * Math.PI;
    const angle2 = this.random() * Math.PI;
    const distance = minDistance + this.random() * minDistance;
    return {
      x: point.x + Math.sin(angle2) * Math.cos(angle1) * distance,
      y: point.y + Math.sin(angle2) * Math.sin(angle1) * distance,
      z: point.z + Math.cos(angle2) * distance,
    };
  }

  private isValidPoint2D(candidate: Point2D, points: Point2D[], config: PoissonDiskConfig): boolean {
    if (!config.allowBoundary) {
      const margin = config.minDistance! / 2;
      if (
        candidate.x < margin ||
        candidate.x > config.width! - margin ||
        candidate.y < margin ||
        candidate.y > config.height! - margin
      ) {
        return false;
      }
    }

    for (const point of points) {
      if (this.distance2D(candidate, point) < config.minDistance!) {
        return false;
      }
    }

    return true;
  }

  private isValidPoint3D(candidate: Point3D, points: Point3D[], config: PoissonDiskConfig): boolean {
    if (!config.allowBoundary) {
      const margin = config.minDistance! / 2;
      if (
        candidate.x < margin ||
        candidate.x > config.width! - margin ||
        candidate.y < margin ||
        candidate.y > config.height! - margin ||
        candidate.z < margin ||
        candidate.z > config.depth! - margin
      ) {
        return false;
      }
    }

    for (const point of points) {
      if (this.distance3D(candidate, point) < config.minDistance!) {
        return false;
      }
    }

    return true;
  }

  private isValidCandidate2D(
    candidate: Point2D,
    grid: (Point2D | null)[][],
    cellSize: number,
    config: PoissonDiskConfig
  ): boolean {
    if (!config.allowBoundary) {
      const margin = config.minDistance! / 2;
      if (
        candidate.x < margin ||
        candidate.x > config.width! - margin ||
        candidate.y < margin ||
        candidate.y > config.height! - margin
      ) {
        return false;
      }
    }

    const gridX = Math.floor(candidate.x / cellSize);
    const gridY = Math.floor(candidate.y / cellSize);
    const searchRadius = Math.ceil(config.minDistance! / cellSize);

    for (let dy = -searchRadius; dy <= searchRadius; dy++) {
      for (let dx = -searchRadius; dx <= searchRadius; dx++) {
        const checkX = gridX + dx;
        const checkY = gridY + dy;
        if (checkX >= 0 && checkX < grid[0].length && checkY >= 0 && checkY < grid.length) {
          const existingPoint = grid[checkY][checkX];
          if (existingPoint && this.distance2D(candidate, existingPoint) < config.minDistance!) {
            return false;
          }
        }
      }
    }

    return true;
  }

  private isValidCandidate3D(
    candidate: Point3D,
    grid: (Point3D | null)[][][],
    cellSize: number,
    config: PoissonDiskConfig
  ): boolean {
    if (!config.allowBoundary) {
      const margin = config.minDistance! / 2;
      if (
        candidate.x < margin ||
        candidate.x > config.width! - margin ||
        candidate.y < margin ||
        candidate.y > config.height! - margin ||
        candidate.z < margin ||
        candidate.z > config.depth! - margin
      ) {
        return false;
      }
    }

    const gridX = Math.floor(candidate.x / cellSize);
    const gridY = Math.floor(candidate.y / cellSize);
    const gridZ = Math.floor(candidate.z / cellSize);
    const searchRadius = Math.ceil(config.minDistance! / cellSize);

    for (let dz = -searchRadius; dz <= searchRadius; dz++) {
      for (let dy = -searchRadius; dy <= searchRadius; dy++) {
        for (let dx = -searchRadius; dx <= searchRadius; dx++) {
          const checkX = gridX + dx;
          const checkY = gridY + dy;
          const checkZ = gridZ + dz;
          if (
            checkX >= 0 &&
            checkX < grid[0][0].length &&
            checkY >= 0 &&
            checkY < grid[0].length &&
            checkZ >= 0 &&
            checkZ < grid.length
          ) {
            const existingPoint = grid[checkZ][checkY][checkX];
            if (existingPoint && this.distance3D(candidate, existingPoint) < config.minDistance!) {
              return false;
            }
          }
        }
      }
    }

    return true;
  }

  private addToGrid(point: Point2D, grid: (Point2D | null)[][], cellSize: number): void {
    const gridX = Math.floor(point.x / cellSize);
    const gridY = Math.floor(point.y / cellSize);
    if (gridX >= 0 && gridX < grid[0].length && gridY >= 0 && gridY < grid.length) {
      grid[gridY][gridX] = point;
    }
  }

  private addToGrid3D(point: Point3D, grid: (Point3D | null)[][][], cellSize: number): void {
    const gridX = Math.floor(point.x / cellSize);
    const gridY = Math.floor(point.y / cellSize);
    const gridZ = Math.floor(point.z / cellSize);
    if (
      gridX >= 0 &&
      gridX < grid[0][0].length &&
      gridY >= 0 &&
      gridY < grid[0].length &&
      gridZ >= 0 &&
      gridZ < grid.length
    ) {
      grid[gridZ][gridY][gridX] = point;
    }
  }

  private distance2D(p1: Point2D, p2: Point2D): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private distance3D(p1: Point3D, p2: Point3D): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = p1.z - p2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  private calculateCoverage2D(points: Point2D[], config: PoissonDiskConfig): number {
    if (points.length === 0) return 0;
    const totalArea = config.width! * config.height!;
    const coveredArea = points.length * Math.PI * Math.pow(config.minDistance! / 2, 2);
    return Math.min(100, (coveredArea / totalArea) * 100);
  }

  private calculateCoverage3D(points: Point3D[], config: PoissonDiskConfig): number {
    if (points.length === 0) return 0;
    const totalVolume = config.width! * config.height! * config.depth!;
    const coveredVolume = points.length * (4 / 3) * Math.PI * Math.pow(config.minDistance! / 2, 3);
    return Math.min(100, (coveredVolume / totalVolume) * 100);
  }

  private calculateAverageDistance2D(points: Point2D[]): number {
    if (points.length < 2) return 0;
    let totalDistance = 0;
    let count = 0;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        totalDistance += this.distance2D(points[i], points[j]);
        count++;
      }
    }
    return count > 0 ? totalDistance / count : 0;
  }

  private calculateAverageDistance3D(points: Point3D[]): number {
    if (points.length < 2) return 0;
    let totalDistance = 0;
    let count = 0;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        totalDistance += this.distance3D(points[i], points[j]);
        count++;
      }
    }
    return count > 0 ? totalDistance / count : 0;
  }

  private calculateActualMinDistance2D(points: Point2D[]): number {
    if (points.length < 2) return 0;
    let minDistance = Infinity;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dist = this.distance2D(points[i], points[j]);
        if (dist < minDistance) {
          minDistance = dist;
        }
      }
    }
    return minDistance === Infinity ? 0 : minDistance;
  }

  private calculateActualMinDistance3D(points: Point3D[]): number {
    if (points.length < 2) return 0;
    let minDistance = Infinity;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dist = this.distance3D(points[i], points[j]);
        if (dist < minDistance) {
          minDistance = dist;
        }
      }
    }
    return minDistance === Infinity ? 0 : minDistance;
  }

  private computeDistanceStats(points: Point2D[] | Point3D[]): any {
    if (points.length < 2) {
      return {
        minDistance: 0,
        maxDistance: 0,
        averageDistance: 0,
        medianDistance: 0,
        standardDeviation: 0,
      };
    }

    const distances: number[] = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dist = this.isPoint2D(points[i])
          ? this.distance2D(points[i] as Point2D, points[j] as Point2D)
          : this.distance3D(points[i] as Point3D, points[j] as Point3D);
        distances.push(dist);
      }
    }

    distances.sort((a, b) => a - b);
    const mean = distances.reduce((sum, d) => sum + d, 0) / distances.length;
    const variance = distances.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / distances.length;

    return {
      minDistance: distances[0],
      maxDistance: distances[distances.length - 1],
      averageDistance: mean,
      medianDistance: distances[Math.floor(distances.length / 2)],
      standardDeviation: Math.sqrt(variance),
    };
  }

  private computeCoverage(
    points: Point2D[] | Point3D[],
    bounds: { width: number; height: number; depth?: number }
  ): any {
    const totalArea = bounds.width * bounds.height * (bounds.depth || 1);
    const pointRadius = this.config.minDistance! / 2;
    const coveredArea = points.length * Math.PI * Math.pow(pointRadius, 2) * (bounds.depth ? 4 / 3 : 1);

    return {
      totalArea,
      coveredArea,
      coveragePercentage: Math.min(100, (coveredArea / totalArea) * 100),
      uncoveredRegions: Math.max(0, totalArea - coveredArea),
    };
  }

  private computeUniformity(points: Point2D[] | Point3D[]): any {
    if (points.length < 3) {
      return {
        coefficientOfVariation: 0,
        uniformityIndex: 0,
        clusteringIndex: 0,
      };
    }

    const distances = this.computeDistanceStats(points);
    const coefficientOfVariation = distances.standardDeviation / distances.averageDistance;

    // Simplified uniformity and clustering indices
    const uniformityIndex = 1 / (1 + coefficientOfVariation);
    const clusteringIndex = coefficientOfVariation;

    return {
      coefficientOfVariation,
      uniformityIndex,
      clusteringIndex,
    };
  }

  private computeSpatialDistribution(
    points: Point2D[] | Point3D[],
    bounds: { width: number; height: number; depth?: number }
  ): any {
    // Simplified spatial distribution analysis
    const gridSize = 10;
    const densityMap: number[][] = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(0));

    for (const point of points) {
      const gridX = Math.floor((point.x / bounds.width) * gridSize);
      const gridY = Math.floor((point.y / bounds.height) * gridSize);
      if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
        densityMap[gridY][gridX]++;
      }
    }

    const densities = densityMap.flat();
    const mean = densities.reduce((sum, d) => sum + d, 0) / densities.length;
    const variance = densities.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / densities.length;
    const skewness =
      densities.reduce((sum, d) => sum + Math.pow((d - mean) / Math.sqrt(variance), 3), 0) / densities.length;

    return {
      densityMap,
      densityVariance: variance,
      densitySkewness: skewness,
    };
  }

  private isPoint2D(point: Point2D | Point3D): point is Point2D {
    return "z" in point === false;
  }
}
