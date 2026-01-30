/**
 * Force-Directed Graph Layout Algorithms
 *
 * Implementation of force-directed graph layout algorithms including
 * Fruchterman-Reingold and spring-embedder methods.
 */

import type { Point } from "../../core/types/index.js";
import type {
  Graph,
  ForceDirectedConfig,
  ForceDirectedResult,
  ForceDirectedOptions,
} from "./force-directed-types.js";
import { ForceDirectedAlgorithm } from "./force-directed-types.js";

/**
 * Calculate distance between two points
 * @param p1
 * @param p2
 * @example
 */
function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Fruchterman-Reingold force-directed layout
 * @param graph
 * @param config
 * @param options
 * @example
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
      const nodeI = nodes[i];
      if (!nodeI || nodeI.fixed) continue;

      for (let j = i + 1; j < nodes.length; j++) {
        const nodeJ = nodes[j];
        if (!nodeJ) continue;

        const dist = distance(nodeI.position, nodeJ.position);
        if (dist < minDistance) continue;

        const force = repulsionStrength / (dist * dist);
        const dx = nodeJ.position.x - nodeI.position.x;
        const dy = nodeJ.position.y - nodeI.position.y;

        const forceI = repulsionForces[i];
        const forceJ = repulsionForces[j];
        if (forceI && forceJ) {
          forceI.x -= (force * dx) / dist;
          forceI.y -= (force * dy) / dist;
          forceJ.x += (force * dx) / dist;
          forceJ.y += (force * dy) / dist;
        }
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

      if (!source || !target) continue;

      const dist = distance(source.position, target.position);
      const desiredLength = edge.length ?? idealEdgeLength;
      const force = (attractionStrength * (dist - desiredLength)) / dist;

      const dx = target.position.x - source.position.x;
      const dy = target.position.y - source.position.y;

      if (!source.fixed) {
        const sourceForce = attractionForces[sourceIdx];
        if (sourceForce) {
          sourceForce.x += (force * dx) / dist;
          sourceForce.y += (force * dy) / dist;
        }
      }
      if (!target.fixed) {
        const targetForce = attractionForces[targetIdx];
        if (targetForce) {
          targetForce.x -= (force * dx) / dist;
          targetForce.y -= (force * dy) / dist;
        }
      }
    }

    // Update velocities and positions
    let maxDisplacement = 0;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node || node.fixed) continue;

      const repulsionForce = repulsionForces[i];
      const attractionForce = attractionForces[i];
      const velocity = velocities[i];

      if (!repulsionForce || !attractionForce || !velocity) continue;

      const totalForceX = repulsionForce.x + attractionForce.x;
      const totalForceY = repulsionForce.y + attractionForce.y;

      // Limit force by temperature
      const forceMagnitude = Math.sqrt(totalForceX * totalForceX + totalForceY * totalForceY);
      const limitedForceX = forceMagnitude > temperature ? (totalForceX / forceMagnitude) * temperature : totalForceX;
      const limitedForceY = forceMagnitude > temperature ? (totalForceY / forceMagnitude) * temperature : totalForceY;

      // Update velocity
      velocity.x = (velocity.x + limitedForceX) * damping;
      velocity.y = (velocity.y + limitedForceY) * damping;

      // Limit velocity
      const velMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      if (velMagnitude > maxVelocity) {
        velocity.x = (velocity.x / velMagnitude) * maxVelocity;
        velocity.y = (velocity.y / velMagnitude) * maxVelocity;
      }

      // Update position
      const oldX = node.position.x;
      const oldY = node.position.y;

      const newX = Math.max(0, Math.min(width, node.position.x + velocity.x));
      const newY = Math.max(0, Math.min(height, node.position.y + velocity.y));

      nodes[i] = {
        ...node,
        id: node.id,
        position: { x: newX, y: newY } as Point,
      };

      const updatedNode = nodes[i];
      if (updatedNode) {
        const displacement = Math.sqrt((updatedNode.position.x - oldX) ** 2 + (updatedNode.position.y - oldY) ** 2);
        maxDisplacement = Math.max(maxDisplacement, displacement);
      }
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
 * @param graph
 * @param config
 * @param options
 * @example
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

  /**
   *
   * @param config
   * @example
   */
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
   * @param graph
   * @param options
   * @example
   */
  layout(graph: Graph, options?: ForceDirectedOptions): ForceDirectedResult {
    return performForceDirectedLayout(graph, this.config, options ?? {});
  }

  /**
   * Update configuration
   * @param config
   * @example
   */
  updateConfig(config: Partial<ForceDirectedConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Re-export ForceDirectedAlgorithm enum for use as a value
export { ForceDirectedAlgorithm } from "./force-directed-types.js";
