/**
 * @module algorithms/pathfinding/hpa-star/hpa-clustering
 * @description Cluster generation and management for HPA* hierarchical pathfinding.
 */

import type {
  Point,
  GridCell,
  Cluster,
  Entrance,
  HPAConfig,
  ClusterGenerationOptions,
  ClusterGenerationResult,
  EntranceDetectionOptions,
  EntranceDetectionResult,
} from "./hpa-star-types";
import { CellType, ClusterType } from "./hpa-star-types";

/**
 * Cluster generation and management utilities for HPA*.
 */
export class HPAClustering {
  /**
   * Generates clusters from a grid.
   * @param grid - The grid as a 1D array.
   * @param config - HPA configuration.
   * @param options - Cluster generation options.
   * @returns Cluster generation result.
   * @example
   */
  static generateClusters(
    grid: CellType[],
    config: HPAConfig,
    options: Partial<ClusterGenerationOptions> = {}
  ): ClusterGenerationResult {
    const startTime = performance.now();
    const clusterOptions: ClusterGenerationOptions = {
      clusterSize: config.clusterSize,
      useOverlappingClusters: false,
      overlapSize: 0,
      useAdaptiveSizing: false,
      minClusterSize: config.clusterSize,
      maxClusterSize: config.clusterSize,
      mergeSmallClusters: false,
      smallClusterThreshold: config.clusterSize / 2,
      ...options,
    };

    try {
      const clusters: Cluster[] = [];
      const clusterSize = clusterOptions.clusterSize;
      const width = config.width;
      const height = config.height;

      // Generate clusters
      for (let y = 0; y < height; y += clusterSize) {
        for (let x = 0; x < width; x += clusterSize) {
          const clusterWidth = Math.min(clusterSize, width - x);
          const clusterHeight = Math.min(clusterSize, height - y);

          const cluster = this.createCluster(grid, x, y, clusterWidth, clusterHeight, width, height, clusters.length);

          if (cluster) {
            clusters.push(cluster);
          }
        }
      }

      // Post-process clusters
      const processedClusters = this.postProcessClusters(clusters, clusterOptions);

      // Detect entrances
      const entranceResult = this.detectEntrances(processedClusters, grid, config, {});
      const entrances = entranceResult.entrances;

      // Update clusters with entrances
      const finalClusters = this.updateClustersWithEntrances(processedClusters, entrances);

      const endTime = performance.now();
      const generationTime = endTime - startTime;

      return {
        clusters: finalClusters,
        success: true,
        stats: {
          clustersCreated: finalClusters.length,
          entrancesFound: entrances.length,
          averageClusterSize: this.calculateAverageClusterSize(finalClusters),
          generationTime,
        },
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        clusters: [],
        success: false,
        stats: {
          clustersCreated: 0,
          entrancesFound: 0,
          averageClusterSize: 0,
          generationTime: endTime - startTime,
        },
      };
    }
  }

  /**
   * Creates a single cluster.
   * @param grid - The grid.
   * @param x - Cluster x position.
   * @param y - Cluster y position.
   * @param width - Cluster width.
   * @param height - Cluster height.
   * @param gridWidth - Grid width.
   * @param gridHeight - Grid height.
   * @param clusterIndex - Cluster index.
   * @returns Created cluster or null if invalid.
   * @example
   */
  private static createCluster(
    grid: CellType[],
    x: number,
    y: number,
    width: number,
    height: number,
    gridWidth: number,
    gridHeight: number,
    clusterIndex: number
  ): Cluster | null {
    const cells: GridCell[] = [];
    let walkableCells = 0;

    // Extract cells for this cluster
    for (let cy = y; cy < y + height; cy++) {
      for (let cx = x; cx < x + width; cx++) {
        const index = cy * gridWidth + cx;
        if (index >= 0 && index < grid.length) {
          const cell: GridCell = {
            x: cx,
            y: cy,
            type: grid[index],
          };
          cells.push(cell);

          if (grid[index] === CellType.WALKABLE) {
            walkableCells++;
          }
        }
      }
    }

    // Skip clusters with no walkable cells
    if (walkableCells === 0) {
      return null;
    }

    // Determine cluster type
    let clusterType = ClusterType.REGULAR;
    if (x === 0 || y === 0 || x + width >= gridWidth || y + height >= gridHeight) {
      clusterType = ClusterType.BORDER;
    } else if (walkableCells === cells.length) {
      clusterType = ClusterType.INTERIOR;
    }

    const cluster: Cluster = {
      id: `cluster_${clusterIndex}`,
      x,
      y,
      width,
      height,
      type: clusterType,
      cells,
      entrances: [],
      neighbors: [],
    };

    return cluster;
  }

  /**
   * Post-processes clusters based on options.
   * @param clusters - Clusters to process.
   * @param options - Processing options.
   * @returns Processed clusters.
   * @example
   */
  private static postProcessClusters(clusters: Cluster[], options: ClusterGenerationOptions): Cluster[] {
    let processedClusters = [...clusters];

    // Merge small clusters if requested
    if (options.mergeSmallClusters) {
      processedClusters = this.mergeSmallClusters(processedClusters, options);
    }

    // Apply adaptive sizing if requested
    if (options.useAdaptiveSizing) {
      processedClusters = this.applyAdaptiveSizing(processedClusters, options);
    }

    return processedClusters;
  }

  /**
   * Merges small clusters with neighboring clusters.
   * @param clusters - Clusters to process.
   * @param options - Processing options.
   * @returns Clusters with small ones merged.
   * @example
   */
  private static mergeSmallClusters(clusters: Cluster[], options: ClusterGenerationOptions): Cluster[] {
    const mergedClusters: Cluster[] = [];
    const processed = new Set<string>();

    for (const cluster of clusters) {
      if (processed.has(cluster.id)) {
        continue;
      }

      const walkableCells = cluster.cells.filter(cell => cell.type === CellType.WALKABLE).length;

      if (walkableCells < options.smallClusterThreshold) {
        // Find best neighbor to merge with
        const bestNeighbor = this.findBestMergeNeighbor(cluster, clusters, processed);

        if (bestNeighbor) {
          const mergedCluster = this.mergeClusters(cluster, bestNeighbor);
          mergedClusters.push(mergedCluster);
          processed.add(cluster.id);
          processed.add(bestNeighbor.id);
        } else {
          mergedClusters.push(cluster);
          processed.add(cluster.id);
        }
      } else {
        mergedClusters.push(cluster);
        processed.add(cluster.id);
      }
    }

    return mergedClusters;
  }

  /**
   * Finds the best neighbor to merge with.
   * @param cluster - Cluster to find neighbor for.
   * @param clusters - All clusters.
   * @param processed - Processed cluster IDs.
   * @returns Best neighbor or null.
   * @example
   */
  private static findBestMergeNeighbor(cluster: Cluster, clusters: Cluster[], processed: Set<string>): Cluster | null {
    let bestNeighbor: Cluster | null = null;
    let bestScore = -1;

    for (const other of clusters) {
      if (other.id === cluster.id || processed.has(other.id)) {
        continue;
      }

      if (this.areClustersAdjacent(cluster, other)) {
        const score = this.calculateMergeScore(cluster, other);
        if (score > bestScore) {
          bestScore = score;
          bestNeighbor = other;
        }
      }
    }

    return bestNeighbor;
  }

  /**
   * Checks if two clusters are adjacent.
   * @param cluster1 - First cluster.
   * @param cluster2 - Second cluster.
   * @returns True if clusters are adjacent.
   * @example
   */
  private static areClustersAdjacent(cluster1: Cluster, cluster2: Cluster): boolean {
    const dx = Math.abs(cluster1.x - cluster2.x);
    const dy = Math.abs(cluster1.y - cluster2.y);

    return (
      (dx === cluster1.width && dy < cluster1.height + cluster2.height) ||
      (dy === cluster1.height && dx < cluster1.width + cluster2.width)
    );
  }

  /**
   * Calculates merge score between two clusters.
   * @param cluster1 - First cluster.
   * @param cluster2 - Second cluster.
   * @returns Merge score.
   * @example
   */
  private static calculateMergeScore(cluster1: Cluster, cluster2: Cluster): number {
    const walkable1 = cluster1.cells.filter(cell => cell.type === CellType.WALKABLE).length;
    const walkable2 = cluster2.cells.filter(cell => cell.type === CellType.WALKABLE).length;

    // Prefer merging with clusters that have similar walkable cell counts
    const similarity = 1 - Math.abs(walkable1 - walkable2) / Math.max(walkable1, walkable2);

    // Prefer merging with smaller clusters
    const sizeRatio =
      Math.min(cluster1.cells.length, cluster2.cells.length) / Math.max(cluster1.cells.length, cluster2.cells.length);

    return similarity * 0.7 + sizeRatio * 0.3;
  }

  /**
   * Merges two clusters.
   * @param cluster1 - First cluster.
   * @param cluster2 - Second cluster.
   * @returns Merged cluster.
   * @example
   */
  private static mergeClusters(cluster1: Cluster, cluster2: Cluster): Cluster {
    const minX = Math.min(cluster1.x, cluster2.x);
    const minY = Math.min(cluster1.y, cluster2.y);
    const maxX = Math.max(cluster1.x + cluster1.width, cluster2.x + cluster2.width);
    const maxY = Math.max(cluster1.y + cluster1.height, cluster2.y + cluster2.height);

    const mergedCells = [...cluster1.cells, ...cluster2.cells];

    return {
      id: `merged_${cluster1.id}_${cluster2.id}`,
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      type: ClusterType.REGULAR,
      cells: mergedCells,
      entrances: [],
      neighbors: [],
    };
  }

  /**
   * Applies adaptive sizing to clusters.
   * @param clusters - Clusters to process.
   * @param options - Processing options.
   * @returns Clusters with adaptive sizing applied.
   * @example
   */
  private static applyAdaptiveSizing(clusters: Cluster[], options: ClusterGenerationOptions): Cluster[] {
    // Simple adaptive sizing based on obstacle density
    return clusters.map(cluster => {
      const obstacleCount = cluster.cells.filter(cell => cell.type === CellType.OBSTACLE).length;
      const obstacleRatio = obstacleCount / cluster.cells.length;

      // If obstacle ratio is high, consider it a small cluster
      if (obstacleRatio > 0.5) {
        return {
          ...cluster,
          type: ClusterType.BORDER,
        };
      }

      return cluster;
    });
  }

  /**
   * Detects entrances between clusters.
   * @param clusters - Clusters to analyze.
   * @param grid - The grid.
   * @param config - HPA configuration.
   * @param options - Entrance detection options.
   * @returns Entrance detection result.
   * @example
   */
  static detectEntrances(
    clusters: Cluster[],
    grid: CellType[],
    config: HPAConfig,
    options: Partial<EntranceDetectionOptions> = {}
  ): EntranceDetectionResult {
    const startTime = performance.now();
    const entranceOptions: EntranceDetectionOptions = {
      detectBorderEntrances: true,
      detectInteriorEntrances: true,
      minEntranceWidth: 1,
      maxEntranceWidth: 3,
      useAdaptiveDetection: false,
      detectionThreshold: 0.5,
      ...options,
    };

    try {
      const entrances: Entrance[] = [];
      let entranceIndex = 0;

      // Detect entrances between adjacent clusters
      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          const cluster1 = clusters[i];
          const cluster2 = clusters[j];

          if (this.areClustersAdjacent(cluster1, cluster2)) {
            const clusterEntrances = this.findEntrancesBetweenClusters(
              cluster1,
              cluster2,
              grid,
              config,
              entranceOptions,
              entranceIndex
            );

            entrances.push(...clusterEntrances);
            entranceIndex += clusterEntrances.length;
          }
        }
      }

      const endTime = performance.now();
      const detectionTime = endTime - startTime;

      const borderEntrances = entrances.filter(e => e.isBorder).length;
      const interiorEntrances = entrances.filter(e => !e.isBorder).length;

      return {
        entrances,
        success: true,
        stats: {
          entrancesFound: entrances.length,
          borderEntrances,
          interiorEntrances,
          detectionTime,
        },
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        entrances: [],
        success: false,
        stats: {
          entrancesFound: 0,
          borderEntrances: 0,
          interiorEntrances: 0,
          detectionTime: endTime - startTime,
        },
      };
    }
  }

  /**
   * Finds entrances between two clusters.
   * @param cluster1 - First cluster.
   * @param cluster2 - Second cluster.
   * @param grid - The grid.
   * @param config - HPA configuration.
   * @param options - Entrance detection options.
   * @param startIndex - Starting entrance index.
   * @returns Array of entrances.
   * @example
   */
  private static findEntrancesBetweenClusters(
    cluster1: Cluster,
    cluster2: Cluster,
    grid: CellType[],
    config: HPAConfig,
    options: EntranceDetectionOptions,
    startIndex: number
  ): Entrance[] {
    const entrances: Entrance[] = [];
    let entranceIndex = startIndex;

    // Find the boundary between clusters
    const boundary = this.findClusterBoundary(cluster1, cluster2);

    if (!boundary) {
      return entrances;
    }

    // Find walkable cells along the boundary
    const walkableBoundaryCells = this.findWalkableBoundaryCells(boundary, grid, config.width, config.height);

    // Group walkable cells into entrance segments
    const entranceSegments = this.groupIntoEntranceSegments(walkableBoundaryCells, options);

    // Create entrances from segments
    for (const segment of entranceSegments) {
      if (segment.length >= options.minEntranceWidth && segment.length <= options.maxEntranceWidth) {
        const entrance: Entrance = {
          id: `entrance_${entranceIndex}`,
          x: segment[0].x,
          y: segment[0].y,
          clusterId: cluster1.id,
          connectedClusters: [cluster1.id, cluster2.id],
          isBorder: this.isEntranceOnBorder(segment, config),
          cost: this.calculateEntranceCost(segment),
        };

        entrances.push(entrance);
        entranceIndex++;
      }
    }

    return entrances;
  }

  /**
   * Finds the boundary between two clusters.
   * @param cluster1 - First cluster.
   * @param cluster2 - Second cluster.
   * @returns Boundary information or null.
   * @example
   */
  private static findClusterBoundary(
    cluster1: Cluster,
    cluster2: Cluster
  ): { x1: number; y1: number; x2: number; y2: number; direction: "horizontal" | "vertical" } | null {
    const dx = Math.abs(cluster1.x - cluster2.x);
    const dy = Math.abs(cluster1.y - cluster2.y);

    if (dx === cluster1.width && dy < cluster1.height + cluster2.height) {
      // Vertical boundary
      const x = Math.max(cluster1.x, cluster2.x);
      const y1 = Math.max(cluster1.y, cluster2.y);
      const y2 = Math.min(cluster1.y + cluster1.height, cluster2.y + cluster2.height);

      return { x1: x, y1, x2: x, y2, direction: "vertical" };
    } else if (dy === cluster1.height && dx < cluster1.width + cluster2.width) {
      // Horizontal boundary
      const y = Math.max(cluster1.y, cluster2.y);
      const x1 = Math.max(cluster1.x, cluster2.x);
      const x2 = Math.min(cluster1.x + cluster1.width, cluster2.x + cluster2.width);

      return { x1, y1: y, x2, y2: y, direction: "horizontal" };
    }

    return null;
  }

  /**
   * Finds walkable cells along a boundary.
   * @param boundary - Boundary information.
   * @param boundary.x1
   * @param grid - The grid.
   * @param boundary.y1
   * @param gridWidth - Grid width.
   * @param boundary.x2
   * @param gridHeight - Grid height.
   * @param boundary.y2
   * @param boundary.direction
   * @returns Array of walkable boundary cells.
   * @example
   */
  private static findWalkableBoundaryCells(
    boundary: { x1: number; y1: number; x2: number; y2: number; direction: "horizontal" | "vertical" },
    grid: CellType[],
    gridWidth: number,
    gridHeight: number
  ): Point[] {
    const walkableCells: Point[] = [];

    if (boundary.direction === "horizontal") {
      for (let x = boundary.x1; x <= boundary.x2; x++) {
        if (x >= 0 && x < gridWidth && boundary.y1 >= 0 && boundary.y1 < gridHeight) {
          const index = boundary.y1 * gridWidth + x;
          if (index >= 0 && index < grid.length && grid[index] === CellType.WALKABLE) {
            walkableCells.push({ x, y: boundary.y1 });
          }
        }
      }
    } else {
      for (let y = boundary.y1; y <= boundary.y2; y++) {
        if (boundary.x1 >= 0 && boundary.x1 < gridWidth && y >= 0 && y < gridHeight) {
          const index = y * gridWidth + boundary.x1;
          if (index >= 0 && index < grid.length && grid[index] === CellType.WALKABLE) {
            walkableCells.push({ x: boundary.x1, y });
          }
        }
      }
    }

    return walkableCells;
  }

  /**
   * Groups walkable cells into entrance segments.
   * @param walkableCells - Walkable boundary cells.
   * @param options - Entrance detection options.
   * @returns Array of entrance segments.
   * @example
   */
  private static groupIntoEntranceSegments(walkableCells: Point[], options: EntranceDetectionOptions): Point[][] {
    if (walkableCells.length === 0) {
      return [];
    }

    // Sort cells by position
    walkableCells.sort((a, b) => {
      if (a.x !== b.x) return a.x - b.x;
      return a.y - b.y;
    });

    const segments: Point[][] = [];
    let currentSegment: Point[] = [walkableCells[0]];

    for (let i = 1; i < walkableCells.length; i++) {
      const current = walkableCells[i];
      const previous = walkableCells[i - 1];

      // Check if cells are adjacent
      const isAdjacent = Math.abs(current.x - previous.x) <= 1 && Math.abs(current.y - previous.y) <= 1;

      if (isAdjacent) {
        currentSegment.push(current);
      } else {
        segments.push(currentSegment);
        currentSegment = [current];
      }
    }

    segments.push(currentSegment);

    return segments;
  }

  /**
   * Checks if an entrance is on the border of the grid.
   * @param segment - Entrance segment.
   * @param config - HPA configuration.
   * @returns True if entrance is on border.
   * @example
   */
  private static isEntranceOnBorder(segment: Point[], config: HPAConfig): boolean {
    return segment.some(
      point => point.x === 0 || point.x === config.width - 1 || point.y === 0 || point.y === config.height - 1
    );
  }

  /**
   * Calculates the cost of an entrance.
   * @param segment - Entrance segment.
   * @returns Entrance cost.
   * @example
   */
  private static calculateEntranceCost(segment: Point[]): number {
    // Simple cost based on segment length
    return segment.length;
  }

  /**
   * Updates clusters with their entrances.
   * @param clusters - Clusters to update.
   * @param entrances - All entrances.
   * @returns Updated clusters.
   * @example
   */
  private static updateClustersWithEntrances(clusters: Cluster[], entrances: Entrance[]): Cluster[] {
    return clusters.map(cluster => {
      const clusterEntrances = entrances.filter(entrance => entrance.connectedClusters.includes(cluster.id));

      return {
        ...cluster,
        entrances: clusterEntrances,
        neighbors: clusterEntrances.flatMap(entrance => entrance.connectedClusters.filter(id => id !== cluster.id)),
      };
    });
  }

  /**
   * Calculates the average cluster size.
   * @param clusters - Clusters to analyze.
   * @returns Average cluster size.
   * @example
   */
  private static calculateAverageClusterSize(clusters: Cluster[]): number {
    if (clusters.length === 0) {
      return 0;
    }

    const totalSize = clusters.reduce((sum, cluster) => sum + cluster.cells.length, 0);
    return totalSize / clusters.length;
  }
}
