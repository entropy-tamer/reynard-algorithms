/**
 * Force-Directed Graph Layout Algorithms
 *
 * Implementation of force-directed graph layout algorithms including
 * Fruchterman-Reingold and spring-embedder methods.
 */

import type { Point } from "../../core/types/index.js";
import type {
  Graph,
  GraphNode,
  GraphEdge,
  ForceDirectedConfig,
  ForceDirectedResult,
  ForceDirectedOptions,
} from "./force-directed-types.js";
import { ForceDirectedAlgorithm } from "./force-directed-types.js";

/**
 * Calculate distance between two points
 */
function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Fruchterman-Reingold force-directed layout
 */
function fruchtermanReingold(
  graph: Graph,
  config: ForceDirectedConfig,
  options: ForceDirectedOptions
): ForceDirectedResult {
  const width = config.width ?? 800;
  const height = config.height ?? 600;
  const attractionStrength = config.attractionStrength ?? 1.0;
  const repulsionStrength = config.repulsionStrength ?? 100.0;
  const idealEdgeLength = config.idealEdgeLength ?? 50.0;
  const damping = config.damping ?? 0.9;
  const maxVelocity = config.maxVelocity ?? 10.0;
  const minDistance = config.minDistance ?? 1.0;

  const maxIterations = options.maxIterations ?? 100;
  const convergenceThreshold = options.convergenceThreshold ?? 0.1;
  let temperature = options.temperature ?? Math.sqrt(width * height) / 10;
  const coolingRate = options.coolingRate ?? 0.95;

  // Initialize positions if not set
  const nodes = graph.nodes.map(node => ({
    ...node,
    position: node.fixed
      ? node.position
      : ({
          x: node.position.x || Math.random() * width,
          y: node.position.y || Math.random() * height,
        } as Point),
  }));

  // Initialize velocities
  const velocities: Array<{ x: number; y: number }> = nodes.map(() => ({ x: 0, y: 0 }));

  let converged = false;
  let iterations = 0;

  for (let iter = 0; iter < maxIterations; iter++) {
    iterations = iter + 1;

    // Calculate repulsion forces (between all nodes)
    const repulsionForces: Array<{ x: number; y: number }> = nodes.map(() => ({ x: 0, y: 0 }));

    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].fixed) continue;

      for (let j = i + 1; j < nodes.length; j++) {
        const dist = distance(nodes[i].position, nodes[j].position);
        if (dist < minDistance) continue;

        const force = repulsionStrength / (dist * dist);
        const dx = nodes[j].position.x - nodes[i].position.x;
        const dy = nodes[j].position.y - nodes[i].position.y;

        repulsionForces[i].x -= (force * dx) / dist;
        repulsionForces[i].y -= (force * dy) / dist;
        repulsionForces[j].x += (force * dx) / dist;
        repulsionForces[j].y += (force * dy) / dist;
      }
    }

    // Calculate attraction forces (along edges)
    const attractionForces: Array<{ x: number; y: number }> = nodes.map(() => ({ x: 0, y: 0 }));

    for (const edge of graph.edges) {
      const sourceIdx = nodes.findIndex(n => n.id === edge.source);
      const targetIdx = nodes.findIndex(n => n.id === edge.target);

      if (sourceIdx === -1 || targetIdx === -1) continue;

      const source = nodes[sourceIdx];
      const target = nodes[targetIdx];

      const dist = distance(source.position, target.position);
      const desiredLength = edge.length ?? idealEdgeLength;
      const force = (attractionStrength * (dist - desiredLength)) / dist;

      const dx = target.position.x - source.position.x;
      const dy = target.position.y - source.position.y;

      if (!source.fixed) {
        attractionForces[sourceIdx].x += (force * dx) / dist;
        attractionForces[sourceIdx].y += (force * dy) / dist;
      }
      if (!target.fixed) {
        attractionForces[targetIdx].x -= (force * dx) / dist;
        attractionForces[targetIdx].y -= (force * dy) / dist;
      }
    }

    // Update velocities and positions
    let maxDisplacement = 0;

    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].fixed) continue;

      const totalForceX = repulsionForces[i].x + attractionForces[i].x;
      const totalForceY = repulsionForces[i].y + attractionForces[i].y;

      // Limit force by temperature
      const forceMagnitude = Math.sqrt(totalForceX * totalForceX + totalForceY * totalForceY);
      const limitedForceX = forceMagnitude > temperature ? (totalForceX / forceMagnitude) * temperature : totalForceX;
      const limitedForceY = forceMagnitude > temperature ? (totalForceY / forceMagnitude) * temperature : totalForceY;

      // Update velocity
      velocities[i].x = (velocities[i].x + limitedForceX) * damping;
      velocities[i].y = (velocities[i].y + limitedForceY) * damping;

      // Limit velocity
      const velMagnitude = Math.sqrt(velocities[i].x * velocities[i].x + velocities[i].y * velocities[i].y);
      if (velMagnitude > maxVelocity) {
        velocities[i].x = (velocities[i].x / velMagnitude) * maxVelocity;
        velocities[i].y = (velocities[i].y / velMagnitude) * maxVelocity;
      }

      // Update position
      const oldX = nodes[i].position.x;
      const oldY = nodes[i].position.y;

      const newX = Math.max(0, Math.min(width, nodes[i].position.x + velocities[i].x));
      const newY = Math.max(0, Math.min(height, nodes[i].position.y + velocities[i].y));

      nodes[i] = {
        ...nodes[i],
        position: { x: newX, y: newY } as Point,
      };

      const displacement = Math.sqrt((nodes[i].position.x - oldX) ** 2 + (nodes[i].position.y - oldY) ** 2);
      maxDisplacement = Math.max(maxDisplacement, displacement);
    }

    // Cool down
    temperature *= coolingRate;

    // Check convergence
    if (maxDisplacement < convergenceThreshold) {
      converged = true;
      break;
    }
  }

  // Calculate total energy
  let energy = 0;
  for (const edge of graph.edges) {
    const source = nodes.find(n => n.id === edge.source);
    const target = nodes.find(n => n.id === edge.target);
    if (source && target) {
      const dist = distance(source.position, target.position);
      const desiredLength = edge.length ?? idealEdgeLength;
      energy += (dist - desiredLength) ** 2;
    }
  }

  return {
    nodes,
    edges: graph.edges,
    energy,
    iterations,
    converged,
  };
}

/**
 * Perform force-directed layout on a graph
 */
export function performForceDirectedLayout(
  graph: Graph,
  config: ForceDirectedConfig,
  options: ForceDirectedOptions = {}
): ForceDirectedResult {
  const algorithm = config.algorithm ?? ForceDirectedAlgorithm.FRUCHTERMAN_REINGOLD;

  switch (algorithm) {
    case ForceDirectedAlgorithm.FRUCHTERMAN_REINGOLD:
      return fruchtermanReingold(graph, config, options);
    case ForceDirectedAlgorithm.SPRING_EMBEDDER:
      // Spring-embedder is similar to F-R, use same implementation
      return fruchtermanReingold(graph, config, options);
    case ForceDirectedAlgorithm.BARNES_HUT:
      // Barnes-Hut would require quadtree implementation
      // For now, fall back to F-R
      return fruchtermanReingold(graph, config, options);
    default:
      return fruchtermanReingold(graph, config, options);
  }
}

/**
 * Force-directed layout class for convenient usage
 */
export class ForceDirectedLayout {
  private config: ForceDirectedConfig;

  constructor(config: Partial<ForceDirectedConfig> = {}) {
    this.config = {
      width: 800,
      height: 600,
      attractionStrength: 1.0,
      repulsionStrength: 100.0,
      idealEdgeLength: 50.0,
      damping: 0.9,
      maxVelocity: 10.0,
      minDistance: 1.0,
      algorithm: ForceDirectedAlgorithm.FRUCHTERMAN_REINGOLD,
      ...config,
    };
  }

  /**
   * Layout a graph
   */
  layout(graph: Graph, options?: ForceDirectedOptions): ForceDirectedResult {
    return performForceDirectedLayout(graph, this.config, options ?? {});
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ForceDirectedConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Re-export ForceDirectedAlgorithm enum for use as a value
export { ForceDirectedAlgorithm } from "./force-directed-types.js";
