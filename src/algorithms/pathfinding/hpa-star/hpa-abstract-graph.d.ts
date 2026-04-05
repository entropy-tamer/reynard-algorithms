/**
 * @module algorithms/pathfinding/hpa-star/hpa-abstract-graph
 * @description Abstract graph construction for HPA* hierarchical pathfinding.
 */
import type { AbstractGraphOptions, AbstractGraphResult, Cluster, Entrance, HPAConfig } from "./hpa-star-types";
/**
 * Abstract graph construction utilities for HPA*.
 */
export declare class HPAAbstractGraph {
    /**
     * Constructs an abstract graph from clusters and entrances.
     * @param clusters - Clusters in the hierarchical map.
     * @param entrances - Entrances between clusters.
     * @param config - HPA configuration.
     * @param options - Abstract graph construction options.
     * @returns Abstract graph construction result.
     * @example
     */
    static constructAbstractGraph(clusters: Cluster[], entrances: Entrance[], config: HPAConfig, options?: Partial<AbstractGraphOptions>): AbstractGraphResult;
    /**
     * Creates abstract nodes from clusters and entrances.
     * @param clusters - Clusters in the hierarchical map.
     * @param entrances - Entrances between clusters.
     * @returns Array of abstract nodes.
     * @example
     */
    private static createAbstractNodes;
    /**
     * Creates abstract edges between nodes.
     * @param nodes - Abstract nodes.
     * @param clusters - Clusters in the hierarchical map.
     * @param entrances - Entrances between clusters.
     * @param config - HPA configuration.
     * @param options - Abstract graph construction options.
     * @returns Array of abstract edges.
     * @example
     */
    private static createAbstractEdges;
    /**
     * Creates edges between clusters.
     * @param nodes - Abstract nodes.
     * @param clusters - Clusters in the hierarchical map.
     * @param entrances - Entrances between clusters.
     * @param config - HPA configuration.
     * @param options - Abstract graph construction options.
     * @returns Array of inter-cluster edges.
     * @example
     */
    private static createInterClusterEdges;
    /**
     * Creates edges within clusters.
     * @param nodes - Abstract nodes.
     * @param clusters - Clusters in the hierarchical map.
     * @param config - HPA configuration.
     * @param options - Abstract graph construction options.
     * @returns Array of intra-cluster edges.
     * @example
     */
    private static createIntraClusterEdges;
    /**
     * Creates edges between entrances.
     * @param nodes - Abstract nodes.
     * @param entrances - Entrances between clusters.
     * @param config - HPA configuration.
     * @param options - Abstract graph construction options.
     * @returns Array of entrance edges.
     * @example
     */
    private static createEntranceEdges;
    /**
     * Creates direct connections between clusters.
     * @param nodes - Abstract nodes.
     * @param clusters - Clusters in the hierarchical map.
     * @param config - HPA configuration.
     * @param options - Abstract graph construction options.
     * @returns Array of direct cluster edges.
     * @example
     */
    private static createDirectClusterEdges;
    /**
     * Calculates the cost of an inter-cluster edge.
     * @param cluster1 - First cluster.
     * @param cluster2 - Second cluster.
     * @param entrances - Connecting entrances.
     * @param config - HPA configuration.
     * @param _config
     * @returns Edge cost.
     * @example
     */
    private static calculateInterClusterCost;
    /**
     * Calculates the cost of an intra-cluster edge.
     * @param cluster - Cluster.
     * @param entrance - Entrance.
     * @param config - HPA configuration.
     * @param _config
     * @returns Edge cost.
     * @example
     */
    private static calculateIntraClusterCost;
    /**
     * Calculates the cost of an entrance edge.
     * @param entrance1 - First entrance.
     * @param entrance2 - Second entrance.
     * @param config - HPA configuration.
     * @param _config
     * @returns Edge cost.
     * @example
     */
    private static calculateEntranceCost;
    /**
     * Calculates the cost of a direct cluster edge.
     * @param cluster1 - First cluster.
     * @param cluster2 - Second cluster.
     * @param config - HPA configuration.
     * @param _config
     * @returns Edge cost.
     * @example
     */
    private static calculateDirectClusterCost;
    /**
     * Generates a path for an inter-cluster edge.
     * @param cluster1 - First cluster.
     * @param cluster2 - Second cluster.
     * @param entrances - Connecting entrances.
     * @returns Path points.
     * @example
     */
    private static generateInterClusterPath;
    /**
     * Generates a path for an intra-cluster edge.
     * @param cluster - Cluster.
     * @param entrance - Entrance.
     * @returns Path points.
     * @example
     */
    private static generateIntraClusterPath;
    /**
     * Generates a path for an entrance edge.
     * @param entrance1 - First entrance.
     * @param entrance2 - Second entrance.
     * @returns Path points.
     * @example
     */
    private static generateEntrancePath;
    /**
     * Generates a path for a direct cluster edge.
     * @param cluster1 - First cluster.
     * @param cluster2 - Second cluster.
     * @returns Path points.
     * @example
     */
    private static generateDirectClusterPath;
    /**
     * Checks if two clusters are adjacent.
     * @param cluster1 - First cluster.
     * @param cluster2 - Second cluster.
     * @returns True if clusters are adjacent.
     * @example
     */
    private static areClustersAdjacent;
}
//# sourceMappingURL=hpa-abstract-graph.d.ts.map