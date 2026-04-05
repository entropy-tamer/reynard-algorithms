/**
 * @module algorithms/pathfinding/hpa-star/hpa-clustering
 * @description Cluster generation and management for HPA* hierarchical pathfinding.
 */
import type { Cluster, ClusterGenerationOptions, ClusterGenerationResult, EntranceDetectionOptions, EntranceDetectionResult, HPAConfig } from "./hpa-star-types";
import { CellType } from "./hpa-star-types";
/**
 * Cluster generation and management utilities for HPA*.
 */
export declare class HPAClustering {
    /**
     * Generates clusters from a grid.
     * @param grid - The grid as a 1D array.
     * @param config - HPA configuration.
     * @param options - Cluster generation options.
     * @returns Cluster generation result.
     * @example
     */
    static generateClusters(grid: CellType[], config: HPAConfig, options?: Partial<ClusterGenerationOptions>): ClusterGenerationResult;
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
    private static createCluster;
    /**
     * Post-processes clusters based on options.
     * @param clusters - Clusters to process.
     * @param options - Processing options.
     * @returns Processed clusters.
     * @example
     */
    private static postProcessClusters;
    /**
     * Merges small clusters with neighboring clusters.
     * @param clusters - Clusters to process.
     * @param options - Processing options.
     * @returns Clusters with small ones merged.
     * @example
     */
    private static mergeSmallClusters;
    /**
     * Finds the best neighbor to merge with.
     * @param cluster - Cluster to find neighbor for.
     * @param clusters - All clusters.
     * @param processed - Processed cluster IDs.
     * @returns Best neighbor or null.
     * @example
     */
    private static findBestMergeNeighbor;
    /**
     * Checks if two clusters are adjacent.
     * @param cluster1 - First cluster.
     * @param cluster2 - Second cluster.
     * @returns True if clusters are adjacent.
     * @example
     */
    private static areClustersAdjacent;
    /**
     * Calculates merge score between two clusters.
     * @param cluster1 - First cluster.
     * @param cluster2 - Second cluster.
     * @returns Merge score.
     * @example
     */
    private static calculateMergeScore;
    /**
     * Merges two clusters.
     * @param cluster1 - First cluster.
     * @param cluster2 - Second cluster.
     * @returns Merged cluster.
     * @example
     */
    private static mergeClusters;
    /**
     * Applies adaptive sizing to clusters.
     * @param clusters - Clusters to process.
     * @param options - Processing options.
     * @param _options
     * @returns Clusters with adaptive sizing applied.
     * @example
     */
    private static applyAdaptiveSizing;
    /**
     * Detects entrances between clusters.
     * @param clusters - Clusters to analyze.
     * @param grid - The grid.
     * @param config - HPA configuration.
     * @param options - Entrance detection options.
     * @returns Entrance detection result.
     * @example
     */
    static detectEntrances(clusters: Cluster[], grid: CellType[], config: HPAConfig, options?: Partial<EntranceDetectionOptions>): EntranceDetectionResult;
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
    private static findEntrancesBetweenClusters;
    /**
     * Finds the boundary between two clusters.
     * @param cluster1 - First cluster.
     * @param cluster2 - Second cluster.
     * @returns Boundary information or null.
     * @example
     */
    private static findClusterBoundary;
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
    private static findWalkableBoundaryCells;
    /**
     * Groups walkable cells into entrance segments.
     * @param walkableCells - Walkable boundary cells.
     * @param options - Entrance detection options.
     * @param _options
     * @returns Array of entrance segments.
     * @example
     */
    private static groupIntoEntranceSegments;
    /**
     * Checks if an entrance is on the border of the grid.
     * @param segment - Entrance segment.
     * @param config - HPA configuration.
     * @returns True if entrance is on border.
     * @example
     */
    private static isEntranceOnBorder;
    /**
     * Calculates the cost of an entrance.
     * @param segment - Entrance segment.
     * @returns Entrance cost.
     * @example
     */
    private static calculateEntranceCost;
    /**
     * Updates clusters with their entrances.
     * @param clusters - Clusters to update.
     * @param entrances - All entrances.
     * @returns Updated clusters.
     * @example
     */
    private static updateClustersWithEntrances;
    /**
     * Calculates the average cluster size.
     * @param clusters - Clusters to analyze.
     * @returns Average cluster size.
     * @example
     */
    private static calculateAverageClusterSize;
}
//# sourceMappingURL=hpa-clustering.d.ts.map