/**
 * Adaptive Clustering Implementation
 * 
 * Implements dynamic cluster sizing and optimization for HPA* pathfinding
 * based on grid characteristics and performance history.
 */

import {
  HPAConfig,
  Cluster,
  GridCell,
  ClusterGenerationOptions,
  ClusterGenerationResult,
  EntranceDetectionOptions,
  EntranceDetectionResult,
  Point,
  CellType,
  ClusterType,
  Entrance
} from './hpa-star-types';

/**
 * Grid analysis results
 */
interface GridAnalysis {
  totalCells: number;
  obstacleCells: number;
  obstacleDensity: number;
  complexity: number;
  aspectRatio: number;
  recommendedClusterSize: number;
  optimalClusterCount: number;
}

/**
 * Adaptive clustering configuration
 */
interface AdaptiveClusteringConfig {
  minClusterSize: number;
  maxClusterSize: number;
  densityThreshold: number;
  performanceHistorySize: number;
  enableAdaptiveSizing: boolean;
  enablePerformanceTracking: boolean;
  optimizationTarget: 'speed' | 'quality' | 'balanced';
}

/**
 * Performance metrics for cluster optimization
 */
interface ClusterPerformanceMetrics {
  generationTime: number;
  efficiency: number;
  quality: number;
}

/**
 * Adaptive clustering implementation with dynamic optimization
 */
export class AdaptiveClustering {
  private static config: AdaptiveClusteringConfig = {
    minClusterSize: 5,
    maxClusterSize: 50,
    densityThreshold: 0.3,
    performanceHistorySize: 10,
    enableAdaptiveSizing: true,
    enablePerformanceTracking: true,
    optimizationTarget: 'balanced',
  };

  private static clusteringCache = new Map<string, ClusterGenerationResult>();
  private static performanceCache = new Map<string, ClusterPerformanceMetrics[]>();

  /**
   * Analyze grid characteristics for optimal clustering
   */
  static analyzeGrid(grid: number[], width: number, height: number): GridAnalysis {
    const totalCells = width * height;
    let obstacleCells = 0;
    let complexitySum = 0;

    // Analyze grid characteristics
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] === 1) {
        obstacleCells++;
      }
      
      // Calculate local complexity (simplified)
      const x = i % width;
      const y = Math.floor(i / width);
      const neighbors = this.getNeighborCount(grid, x, y, width, height);
      complexitySum += neighbors;
    }

    const obstacleDensity = obstacleCells / totalCells;
    const complexity = complexitySum / grid.length;
    const aspectRatio = width / height;
    
    // Calculate recommended cluster size based on analysis
    const recommendedClusterSize = this.calculateOptimalClusterSize({
      totalCells,
      obstacleDensity,
      complexity,
      aspectRatio,
    });
    
    const optimalClusterCount = Math.ceil(totalCells / (recommendedClusterSize * recommendedClusterSize));

    return {
      totalCells,
      obstacleCells,
      obstacleDensity,
      complexity,
      aspectRatio,
      recommendedClusterSize,
      optimalClusterCount,
    };
  }

  /**
   * Calculate optimal cluster size based on grid characteristics
   */
  private static calculateOptimalClusterSize(analysis: {
    totalCells: number;
    obstacleDensity: number;
    complexity: number;
    aspectRatio: number;
  }): number {
    const { totalCells, obstacleDensity, complexity } = analysis;
    // Calculate optimal cluster size
    let optimalSize = Math.sqrt(totalCells / 100); // Target ~100 clusters

    // Adjust for obstacle density
    if (obstacleDensity > this.config.densityThreshold) {
      // High density - smaller clusters for better granularity
      optimalSize *= 0.7;
    } else if (obstacleDensity < 0.1) {
      // Low density - larger clusters for efficiency
      optimalSize *= 1.3;
    }

    // Adjust for complexity
    if (complexity > 0.7) {
      // High complexity - smaller clusters
      optimalSize *= 0.8;
    }

    return Math.max(
      this.config.minClusterSize,
      Math.min(this.config.maxClusterSize, Math.round(optimalSize))
    );
  }

  /**
   * Generate adaptive clusters
   */
  static generateAdaptiveClusters(
    grid: number[],
    config: HPAConfig,
    options: Partial<ClusterGenerationOptions> = {}
  ): ClusterGenerationResult {
    const startTime = performance.now();

    // Create cache key
    const cacheKey = this.createCacheKey(grid, config, options);
    
    // Check cache first
    const cached = this.clusteringCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Analyze grid characteristics
    const analysis = this.analyzeGrid(grid, config.width, config.height);
    
    // Calculate optimal cluster size
    const optimalClusterSize = this.calculateOptimalClusterSize(analysis);

    // Generate clusters with adaptive sizing
    const clusters: Cluster[] = [];
    const clusterOptions: ClusterGenerationOptions = {
      clusterSize: optimalClusterSize,
      minClusterSize: this.config.minClusterSize,
      maxClusterSize: this.config.maxClusterSize,
      useOverlappingClusters: false,
      overlapSize: 0,
      useAdaptiveSizing: true,
      mergeSmallClusters: true,
      smallClusterThreshold: 0.1,
    };

    for (let y = 0; y < config.height; y += optimalClusterSize) {
      for (let x = 0; x < config.width; x += optimalClusterSize) {
        const cluster = this.createAdaptiveCluster(
          grid, x, y, optimalClusterSize, optimalClusterSize,
          config.width, config.height, clusters.length, analysis
        );
        if (cluster) {
          clusters.push(cluster);
        }
      }
    }

    // Post-process clusters
    const processedClusters = this.postProcessClusters(clusters, clusterOptions, analysis);

    // Detect entrances
    const entranceResult = this.detectAdaptiveEntrances(
      processedClusters, grid, config, {
        detectBorderEntrances: true,
        detectInteriorEntrances: true,
        minEntranceWidth: 1,
        maxEntranceWidth: 10,
        useAdaptiveDetection: true,
        detectionThreshold: 0.5
      }, analysis
    );
    const entrances = entranceResult.entrances;

    // Update clusters with entrances
    const finalClusters = this.updateClustersWithEntrances(processedClusters, entrances);

    const endTime = performance.now();
    const generationTime = endTime - startTime;

    // Cache result
    const result = {
      clusters: finalClusters,
      success: true,
      stats: {
        clustersCreated: finalClusters.length,
        entrancesFound: entrances.length,
        averageClusterSize: this.calculateAverageClusterSize(finalClusters),
        generationTime,
        adaptiveClusterSize: optimalClusterSize,
        gridAnalysis: analysis,
      },
    };

    this.clusteringCache.set(cacheKey, result);
    return result;
  }

  /**
   * Create adaptive cluster with grid-aware properties
   */
  private static createAdaptiveCluster(
    grid: number[],
    x: number,
    y: number,
    width: number,
    height: number,
    gridWidth: number,
    gridHeight: number,
    id: number,
    analysis: GridAnalysis
  ): Cluster | null {
    // Validate cluster bounds
    if (x < 0 || y < 0 || x + width > gridWidth || y + height > gridHeight) {
      return null;
    }

    // Calculate cluster properties
    const cells: GridCell[] = [];
    let obstacleCount = 0;

    for (let cy = y; cy < y + height && cy < gridHeight; cy++) {
      for (let cx = x; cx < x + width && cx < gridWidth; cx++) {
        const index = cy * gridWidth + cx;
        if (index < grid.length) {
          const cellType: CellType = grid[index] === 0 ? CellType.WALKABLE : CellType.OBSTACLE;
          cells.push({
            x: cx,
            y: cy,
            type: cellType,
          });

          if (cellType === CellType.OBSTACLE) {
            obstacleCount++;
          }
        }
      }
    }

    // Determine cluster type based on characteristics
    const density = obstacleCount / cells.length;
    let clusterType: ClusterType = ClusterType.REGULAR;
    
    if (density > 0.8) {
      clusterType = ClusterType.BORDER;
    } else if (density < 0.1) {
      clusterType = ClusterType.INTERIOR;
    } else if (analysis.complexity > 0.7) {
      clusterType = ClusterType.ENTRANCE;
    }

    return {
      id: id.toString(),
      x,
      y,
      width,
      height,
      cells,
      type: clusterType,
      entrances: [],
      neighbors: [],
    };
  }

  /**
   * Adaptive post-processing of clusters
   */
  private static postProcessClusters(
    clusters: Cluster[],
    options: ClusterGenerationOptions,
    analysis: GridAnalysis
  ): Cluster[] {
    let processedClusters = [...clusters];

    // Merge small clusters if enabled
    if (options.mergeSmallClusters) {
      processedClusters = this.filterClustersByThreshold(processedClusters, options.smallClusterThreshold);
    }

    // Optimize cluster boundaries
    processedClusters = this.optimizeClusterBoundaries(processedClusters, analysis);

    return processedClusters;
  }

  /**
   * Adaptive entrance detection
   */
  private static detectAdaptiveEntrances(
    clusters: Cluster[],
    grid: number[],
    config: HPAConfig,
    _options: EntranceDetectionOptions,
    _analysis: GridAnalysis
  ): EntranceDetectionResult {
    const startTime = performance.now();
    const entrances: Entrance[] = [];

    // Enhanced entrance detection based on cluster types
    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i];
      if (!cluster) continue;
      
      const neighborClusters = this.findNeighborClusters(clusters, cluster, config.width, config.height);
      
      // Detect entrances between this cluster and neighbors
      for (const neighbor of neighborClusters) {
        if (neighbor && cluster) {
          const sharedEntrances = this.findSharedEntrances(cluster, neighbor, grid, config);
          entrances.push(...sharedEntrances);
        }
      }
    }

    const endTime = performance.now();
    return {
      entrances,
      success: true,
      stats: {
        entrancesFound: entrances.length,
        borderEntrances: entrances.filter(e => e.isBorder).length,
        interiorEntrances: entrances.filter(e => !e.isBorder).length,
        detectionTime: endTime - startTime,
      },
    };
  }

  
  /**
   * Helper methods (simplified implementations)
   */
  private static getNeighborCount(
    grid: number[], x: number, y: number, width: number, height: number
  ): number {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const index = ny * width + nx;
          if (grid[index] === 1) count++;
        }
      }
    }
    return count;
  }

  private static createCacheKey(
    grid: number[], config: HPAConfig, options: Partial<ClusterGenerationOptions>
  ): string {
    // Create a hash of input for caching
    const gridHash = grid.slice(0, 100).join(''); // Sample first 100 cells
    const optionsHash = JSON.stringify(options);
    return `${config.width}x${config.height}-${gridHash}-${optionsHash}`;
  }

  private static calculateAverageClusterSize(clusters: Cluster[]): number {
    if (clusters.length === 0) return 0;
    const totalSize = clusters.reduce((sum: number, cluster) => sum + cluster.width * cluster.height, 0);
    return totalSize / clusters.length;
  }

  private static findNeighborClusters(
    clusters: Cluster[], cluster: Cluster, _width: number, _height: number
  ): Cluster[] {
    const neighbors: Cluster[] = [];
    const margin = 2; // 2 cell margin

    for (const other of clusters) {
      const distance = Math.abs(cluster.x - other.x) + Math.abs(cluster.y - other.y);
      
      if (distance <= (cluster.width + other.width) * margin) {
        neighbors.push(other);
      }
    }

    return neighbors;
  }

  private static findSharedEntrances(
    cluster: Cluster, neighbor: Cluster, grid: number[], config: HPAConfig
  ): Entrance[] {
    // Simplified entrance detection
    const entrances: Entrance[] = [];

    // Check for adjacent cells that are free
    const edges = [
      { x: cluster.x + cluster.width, y: cluster.y },
      { x: cluster.x, y: cluster.y + cluster.height },
    ];

    for (const edge of edges) {
      if (this.isValidEntrance(edge, grid, config)) {
        entrances.push({
          id: `entrance-${cluster.id}-${neighbor.id}`,
          x: edge.x,
          y: edge.y,
          clusterId: cluster.id,
          connectedClusters: [cluster.id, neighbor.id],
          isBorder: true,
          cost: 1.0,
        });
      }
    }

    return entrances;
  }

  private static isValidEntrance(
    position: Point, grid: number[], config: HPAConfig
  ): boolean {
    const index = position.y * config.width + position.x;
    return index >= 0 && index < grid.length && grid[index] === 0;
  }

  private static filterClustersByThreshold(_clusters: Cluster[], _threshold: number): Cluster[] {
    // Simplified merging logic
    return _clusters; // Placeholder for now
  }

  private static optimizeClusterBoundaries(_clusters: Cluster[], _analysis: GridAnalysis): Cluster[] {
    // Simplified boundary optimization
    return _clusters; // Placeholder for now
  }

  private static updateClustersWithEntrances(
    clusters: Cluster[], entrances: Entrance[]
  ): Cluster[] {
    // Update clusters with entrance information
    const clusterMap = new Map(clusters.map(c => [c.id, c]));

    for (const entrance of entrances) {
      const cluster = clusterMap.get(entrance.clusterId);
      if (cluster) {
        cluster.entrances.push(entrance);
      }
    }

    return clusters;
  }

  /**
   * Get performance statistics
   */
  static getPerformanceStats(): { size: number } {
    const results: ClusterPerformanceMetrics[] = [];
    for (const metrics of this.performanceCache.values()) {
      results.push(...metrics);
    }
    return { size: results.length };
  }

  /**
   * Clear all caches
   */
  static resetCaches(): void {
    this.clusteringCache.clear();
    this.performanceCache.clear();
  }

  /**
   * Configure adaptive clustering
   */
  static configure(config: Partial<AdaptiveClusteringConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
