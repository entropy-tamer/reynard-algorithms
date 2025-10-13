/**
 * @module algorithms/pathfinding/hpa-star/hpa-abstract-graph
 * @description Abstract graph construction for HPA* hierarchical pathfinding.
 */

import type {
  Point,
  CellType,
  Cluster,
  Entrance,
  AbstractNode,
  AbstractEdge,
  HPAConfig,
  AbstractGraphOptions,
  AbstractGraphResult,
} from "./hpa-star-types";

/**
 * Abstract graph construction utilities for HPA*.
 */
export class HPAAbstractGraph {
  /**
   * Constructs an abstract graph from clusters and entrances.
   * @param clusters - Clusters in the hierarchical map.
   * @param entrances - Entrances between clusters.
   * @param config - HPA configuration.
   * @param options - Abstract graph construction options.
   * @returns Abstract graph construction result.
   */
  static constructAbstractGraph(
    clusters: Cluster[],
    entrances: Entrance[],
    config: HPAConfig,
    options: Partial<AbstractGraphOptions> = {}
  ): AbstractGraphResult {
    const startTime = performance.now();
    const graphOptions: AbstractGraphOptions = {
      useInterClusterEdges: true,
      useIntraClusterEdges: true,
      useEntranceEdges: true,
      useDirectClusterConnections: true,
      maxEdgeCost: 1000,
      useEdgeCaching: true,
      ...options,
    };

    try {
      // Create abstract nodes
      const nodes = this.createAbstractNodes(clusters, entrances);
      
      // Create abstract edges
      const edges = this.createAbstractEdges(
        nodes,
        clusters,
        entrances,
        config,
        graphOptions
      );

      const endTime = performance.now();
      const constructionTime = endTime - startTime;

      const interClusterEdges = edges.filter(edge => edge.isInterCluster).length;
      const intraClusterEdges = edges.filter(edge => !edge.isInterCluster).length;

      return {
        nodes,
        edges,
        success: true,
        stats: {
          nodesCreated: nodes.length,
          edgesCreated: edges.length,
          interClusterEdges,
          intraClusterEdges,
          constructionTime,
        },
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        nodes: [],
        edges: [],
        success: false,
        stats: {
          nodesCreated: 0,
          edgesCreated: 0,
          interClusterEdges: 0,
          intraClusterEdges: 0,
          constructionTime: endTime - startTime,
        },
      };
    }
  }

  /**
   * Creates abstract nodes from clusters and entrances.
   * @param clusters - Clusters in the hierarchical map.
   * @param entrances - Entrances between clusters.
   * @returns Array of abstract nodes.
   */
  private static createAbstractNodes(clusters: Cluster[], entrances: Entrance[]): AbstractNode[] {
    const nodes: AbstractNode[] = [];

    // Create cluster nodes
    for (const cluster of clusters) {
      const clusterNode: AbstractNode = {
        id: `cluster_${cluster.id}`,
        type: "cluster",
        clusterId: cluster.id,
        position: {
          x: cluster.x + cluster.width / 2,
          y: cluster.y + cluster.height / 2,
        },
        g: 0,
        h: 0,
        f: 0,
        visited: false,
        inOpenSet: false,
      };
      nodes.push(clusterNode);
    }

    // Create entrance nodes
    for (const entrance of entrances) {
      const entranceNode: AbstractNode = {
        id: `entrance_${entrance.id}`,
        type: "entrance",
        entranceId: entrance.id,
        position: {
          x: entrance.x,
          y: entrance.y,
        },
        g: 0,
        h: 0,
        f: 0,
        visited: false,
        inOpenSet: false,
      };
      nodes.push(entranceNode);
    }

    return nodes;
  }

  /**
   * Creates abstract edges between nodes.
   * @param nodes - Abstract nodes.
   * @param clusters - Clusters in the hierarchical map.
   * @param entrances - Entrances between clusters.
   * @param config - HPA configuration.
   * @param options - Abstract graph construction options.
   * @returns Array of abstract edges.
   */
  private static createAbstractEdges(
    nodes: AbstractNode[],
    clusters: Cluster[],
    entrances: Entrance[],
    config: HPAConfig,
    options: AbstractGraphOptions
  ): AbstractEdge[] {
    const edges: AbstractEdge[] = [];

    // Create inter-cluster edges
    if (options.useInterClusterEdges) {
      const interClusterEdges = this.createInterClusterEdges(
        nodes,
        clusters,
        entrances,
        config,
        options
      );
      edges.push(...interClusterEdges);
    }

    // Create intra-cluster edges
    if (options.useIntraClusterEdges) {
      const intraClusterEdges = this.createIntraClusterEdges(
        nodes,
        clusters,
        config,
        options
      );
      edges.push(...intraClusterEdges);
    }

    // Create entrance edges
    if (options.useEntranceEdges) {
      const entranceEdges = this.createEntranceEdges(
        nodes,
        entrances,
        config,
        options
      );
      edges.push(...entranceEdges);
    }

    // Create direct cluster connections
    if (options.useDirectClusterConnections) {
      const directEdges = this.createDirectClusterEdges(
        nodes,
        clusters,
        config,
        options
      );
      edges.push(...directEdges);
    }

    return edges;
  }

  /**
   * Creates edges between clusters.
   * @param nodes - Abstract nodes.
   * @param clusters - Clusters in the hierarchical map.
   * @param entrances - Entrances between clusters.
   * @param config - HPA configuration.
   * @param options - Abstract graph construction options.
   * @returns Array of inter-cluster edges.
   */
  private static createInterClusterEdges(
    nodes: AbstractNode[],
    clusters: Cluster[],
    entrances: Entrance[],
    config: HPAConfig,
    options: AbstractGraphOptions
  ): AbstractEdge[] {
    const edges: AbstractEdge[] = [];

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const cluster1 = clusters[i];
        const cluster2 = clusters[j];
        
        // Check if clusters are connected via entrances
        const connectingEntrances = entrances.filter(entrance =>
          entrance.connectedClusters.includes(cluster1.id) &&
          entrance.connectedClusters.includes(cluster2.id)
        );

        if (connectingEntrances.length > 0) {
          const node1 = nodes.find(n => n.clusterId === cluster1.id);
          const node2 = nodes.find(n => n.clusterId === cluster2.id);
          
          if (node1 && node2) {
            const cost = this.calculateInterClusterCost(
              cluster1,
              cluster2,
              connectingEntrances,
              config
            );
            
            if (cost <= options.maxEdgeCost) {
              const edge: AbstractEdge = {
                from: node1.id,
                to: node2.id,
                cost,
                isInterCluster: true,
                path: this.generateInterClusterPath(cluster1, cluster2, connectingEntrances),
              };
              edges.push(edge);
            }
          }
        }
      }
    }

    return edges;
  }

  /**
   * Creates edges within clusters.
   * @param nodes - Abstract nodes.
   * @param clusters - Clusters in the hierarchical map.
   * @param config - HPA configuration.
   * @param options - Abstract graph construction options.
   * @returns Array of intra-cluster edges.
   */
  private static createIntraClusterEdges(
    nodes: AbstractNode[],
    clusters: Cluster[],
    config: HPAConfig,
    options: AbstractGraphOptions
  ): AbstractEdge[] {
    const edges: AbstractEdge[] = [];

    for (const cluster of clusters) {
      const clusterNode = nodes.find(n => n.clusterId === cluster.id);
      if (!clusterNode) continue;

      // Create edges from cluster to its entrances
      for (const entrance of cluster.entrances) {
        const entranceNode = nodes.find(n => n.entranceId === entrance.id);
        if (entranceNode) {
          const cost = this.calculateIntraClusterCost(cluster, entrance, config);
          
          if (cost <= options.maxEdgeCost) {
            const edge: AbstractEdge = {
              from: clusterNode.id,
              to: entranceNode.id,
              cost,
              isInterCluster: false,
              clusterId: cluster.id,
              path: this.generateIntraClusterPath(cluster, entrance),
            };
            edges.push(edge);
          }
        }
      }
    }

    return edges;
  }

  /**
   * Creates edges between entrances.
   * @param nodes - Abstract nodes.
   * @param entrances - Entrances between clusters.
   * @param config - HPA configuration.
   * @param options - Abstract graph construction options.
   * @returns Array of entrance edges.
   */
  private static createEntranceEdges(
    nodes: AbstractNode[],
    entrances: Entrance[],
    config: HPAConfig,
    options: AbstractGraphOptions
  ): AbstractEdge[] {
    const edges: AbstractEdge[] = [];

    for (let i = 0; i < entrances.length; i++) {
      for (let j = i + 1; j < entrances.length; j++) {
        const entrance1 = entrances[i];
        const entrance2 = entrances[j];
        
        // Check if entrances are in the same cluster
        const commonClusters = entrance1.connectedClusters.filter(id =>
          entrance2.connectedClusters.includes(id)
        );

        if (commonClusters.length > 0) {
          const node1 = nodes.find(n => n.entranceId === entrance1.id);
          const node2 = nodes.find(n => n.entranceId === entrance2.id);
          
          if (node1 && node2) {
            const cost = this.calculateEntranceCost(entrance1, entrance2, config);
            
            if (cost <= options.maxEdgeCost) {
              const edge: AbstractEdge = {
                from: node1.id,
                to: node2.id,
                cost,
                isInterCluster: false,
                clusterId: commonClusters[0],
                path: this.generateEntrancePath(entrance1, entrance2),
              };
              edges.push(edge);
            }
          }
        }
      }
    }

    return edges;
  }

  /**
   * Creates direct connections between clusters.
   * @param nodes - Abstract nodes.
   * @param clusters - Clusters in the hierarchical map.
   * @param config - HPA configuration.
   * @param options - Abstract graph construction options.
   * @returns Array of direct cluster edges.
   */
  private static createDirectClusterEdges(
    nodes: AbstractNode[],
    clusters: Cluster[],
    config: HPAConfig,
    options: AbstractGraphOptions
  ): AbstractEdge[] {
    const edges: AbstractEdge[] = [];

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const cluster1 = clusters[i];
        const cluster2 = clusters[j];
        
        // Check if clusters are adjacent
        if (this.areClustersAdjacent(cluster1, cluster2)) {
          const node1 = nodes.find(n => n.clusterId === cluster1.id);
          const node2 = nodes.find(n => n.clusterId === cluster2.id);
          
          if (node1 && node2) {
            const cost = this.calculateDirectClusterCost(cluster1, cluster2, config);
            
            if (cost <= options.maxEdgeCost) {
              const edge: AbstractEdge = {
                from: node1.id,
                to: node2.id,
                cost,
                isInterCluster: true,
                path: this.generateDirectClusterPath(cluster1, cluster2),
              };
              edges.push(edge);
            }
          }
        }
      }
    }

    return edges;
  }

  /**
   * Calculates the cost of an inter-cluster edge.
   * @param cluster1 - First cluster.
   * @param cluster2 - Second cluster.
   * @param entrances - Connecting entrances.
   * @param config - HPA configuration.
   * @returns Edge cost.
   */
  private static calculateInterClusterCost(
    cluster1: Cluster,
    cluster2: Cluster,
    entrances: Entrance[],
    config: HPAConfig
  ): number {
    // Base cost is the distance between cluster centers
    const dx = Math.abs(cluster1.x + cluster1.width / 2 - cluster2.x - cluster2.width / 2);
    const dy = Math.abs(cluster1.y + cluster1.height / 2 - cluster2.y - cluster2.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Add entrance costs
    const entranceCost = entrances.reduce((sum, entrance) => sum + entrance.cost, 0);
    
    return distance + entranceCost;
  }

  /**
   * Calculates the cost of an intra-cluster edge.
   * @param cluster - Cluster.
   * @param entrance - Entrance.
   * @param config - HPA configuration.
   * @returns Edge cost.
   */
  private static calculateIntraClusterCost(
    cluster: Cluster,
    entrance: Entrance,
    config: HPAConfig
  ): number {
    // Cost is the distance from cluster center to entrance
    const dx = Math.abs(cluster.x + cluster.width / 2 - entrance.x);
    const dy = Math.abs(cluster.y + cluster.height / 2 - entrance.y);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance;
  }

  /**
   * Calculates the cost of an entrance edge.
   * @param entrance1 - First entrance.
   * @param entrance2 - Second entrance.
   * @param config - HPA configuration.
   * @returns Edge cost.
   */
  private static calculateEntranceCost(
    entrance1: Entrance,
    entrance2: Entrance,
    config: HPAConfig
  ): number {
    // Cost is the distance between entrances
    const dx = Math.abs(entrance1.x - entrance2.x);
    const dy = Math.abs(entrance1.y - entrance2.y);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance;
  }

  /**
   * Calculates the cost of a direct cluster edge.
   * @param cluster1 - First cluster.
   * @param cluster2 - Second cluster.
   * @param config - HPA configuration.
   * @returns Edge cost.
   */
  private static calculateDirectClusterCost(
    cluster1: Cluster,
    cluster2: Cluster,
    config: HPAConfig
  ): number {
    // Cost is the distance between cluster centers
    const dx = Math.abs(cluster1.x + cluster1.width / 2 - cluster2.x - cluster2.width / 2);
    const dy = Math.abs(cluster1.y + cluster1.height / 2 - cluster2.y - cluster2.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance;
  }

  /**
   * Generates a path for an inter-cluster edge.
   * @param cluster1 - First cluster.
   * @param cluster2 - Second cluster.
   * @param entrances - Connecting entrances.
   * @returns Path points.
   */
  private static generateInterClusterPath(
    cluster1: Cluster,
    cluster2: Cluster,
    entrances: Entrance[]
  ): Point[] {
    const path: Point[] = [];
    
    // Start from cluster1 center
    path.push({
      x: cluster1.x + cluster1.width / 2,
      y: cluster1.y + cluster1.height / 2,
    });
    
    // Add entrance points
    for (const entrance of entrances) {
      path.push({
        x: entrance.x,
        y: entrance.y,
      });
    }
    
    // End at cluster2 center
    path.push({
      x: cluster2.x + cluster2.width / 2,
      y: cluster2.y + cluster2.height / 2,
    });
    
    return path;
  }

  /**
   * Generates a path for an intra-cluster edge.
   * @param cluster - Cluster.
   * @param entrance - Entrance.
   * @returns Path points.
   */
  private static generateIntraClusterPath(cluster: Cluster, entrance: Entrance): Point[] {
    return [
      {
        x: cluster.x + cluster.width / 2,
        y: cluster.y + cluster.height / 2,
      },
      {
        x: entrance.x,
        y: entrance.y,
      },
    ];
  }

  /**
   * Generates a path for an entrance edge.
   * @param entrance1 - First entrance.
   * @param entrance2 - Second entrance.
   * @returns Path points.
   */
  private static generateEntrancePath(entrance1: Entrance, entrance2: Entrance): Point[] {
    return [
      {
        x: entrance1.x,
        y: entrance1.y,
      },
      {
        x: entrance2.x,
        y: entrance2.y,
      },
    ];
  }

  /**
   * Generates a path for a direct cluster edge.
   * @param cluster1 - First cluster.
   * @param cluster2 - Second cluster.
   * @returns Path points.
   */
  private static generateDirectClusterPath(cluster1: Cluster, cluster2: Cluster): Point[] {
    return [
      {
        x: cluster1.x + cluster1.width / 2,
        y: cluster1.y + cluster1.height / 2,
      },
      {
        x: cluster2.x + cluster2.width / 2,
        y: cluster2.y + cluster2.height / 2,
      },
    ];
  }

  /**
   * Checks if two clusters are adjacent.
   * @param cluster1 - First cluster.
   * @param cluster2 - Second cluster.
   * @returns True if clusters are adjacent.
   */
  private static areClustersAdjacent(cluster1: Cluster, cluster2: Cluster): boolean {
    const dx = Math.abs(cluster1.x - cluster2.x);
    const dy = Math.abs(cluster1.y - cluster2.y);
    
    return (dx === cluster1.width && dy < cluster1.height + cluster2.height) ||
           (dy === cluster1.height && dx < cluster1.width + cluster2.width);
  }
}
