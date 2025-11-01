/**
 * Flow Field Pathfinding Operations
 *
 * Handles agent pathfinding using flow fields, including
 * A* pathfinding and crowd simulation.
 *
 * @module algorithms/pathfinding/flow-field
 */

import type {
  Point,
  FlowCell,
  AgentPathfindingOptions,
  AgentPathfindingResult,
  CrowdSimulationOptions,
  CrowdSimulationResult,
} from "./flow-field-types";

/**
 * Find agent path using flow field
 *
 * @param start Starting point
 * @param flowField Flow field array
 * @param width Grid width
 * @param height Grid height
 * @param options Pathfinding options
 * @returns Agent pathfinding result
 */
export function findAgentPath(
  start: Point,
  flowField: FlowCell[],
  width: number,
  height: number,
  options: Partial<AgentPathfindingOptions> = {}
): AgentPathfindingResult {
  const startTime = performance.now();
  const pathOptions: AgentPathfindingOptions = {
    useFlowField: true,
    useIntegrationField: false,
    useAStarFallback: false,
    maxPathLength: width * height,
    smoothPath: true,
    smoothingFactor: 0.5,
    useEarlyTermination: false,
    ...options,
  };

  try {
    if (!isValidPoint(start, width, height)) {
      return {
        found: false,
        path: [],
        cost: 0,
        length: 0,
        usedFlowField: false,
        usedAStarFallback: false,
        stats: {
          flowFieldLookups: 0,
          integrationFieldLookups: 0,
          aStarNodes: 0,
          executionTime: performance.now() - startTime,
        },
      };
    }

    let path: Point[];
    let cost: number;

    if (pathOptions.useAStar) {
      const aStarResult = findAStarPath(start, flowField, width, height);
      path = aStarResult.path;
      cost = aStarResult.cost;
    } else {
      path = followFlowField(start, flowField, width, height, pathOptions);
      cost = calculatePathCost(path);
    }

    if (pathOptions.smoothPath) {
      path = smoothPath(path, flowField, width, height);
    }

    return {
      found: path.length > 0,
      path,
      cost,
      length: path.length,
      usedFlowField: !pathOptions.useAStarFallback,
      usedAStarFallback: pathOptions.useAStarFallback,
      stats: {
        flowFieldLookups: path.length,
        integrationFieldLookups: 0,
        aStarNodes: 0,
        executionTime: performance.now() - startTime,
      },
    };
  } catch (error) {
    return {
      found: false,
      path: [],
      cost: 0,
      length: 0,
      usedFlowField: false,
      usedAStarFallback: false,
      stats: {
        flowFieldLookups: 0,
        integrationFieldLookups: 0,
        aStarNodes: 0,
        executionTime: performance.now() - startTime,
      },
    };
  }
}

/**
 * Follow flow field to generate path
 *
 * @param start Starting point
 * @param flowField Flow field array
 * @param width Grid width
 * @param height Grid height
 * @param options Pathfinding options
 * @returns Path array
 */
function followFlowField(
  start: Point,
  flowField: FlowCell[],
  width: number,
  height: number,
  options: AgentPathfindingOptions
): Point[] {
  const path: Point[] = [start];
  const visited = new Set<string>();
  let current = start;
  let steps = 0;

  visited.add(pointToKey(current));

  while (steps < options.maxPathLength) {
    const currentIndex = current.y * width + current.x;
    const flowVector = flowField[currentIndex];

    if (flowVector.magnitude === 0) {
      break; // Reached goal or obstacle
    }

    const nextPoint = {
      x: Math.round(current.x + flowVector.x),
      y: Math.round(current.y + flowVector.y),
    };

    if (!isValidPoint(nextPoint, width, height) || visited.has(pointToKey(nextPoint))) {
      break; // Invalid or already visited
    }

    current = nextPoint;
    path.push(current);
    visited.add(pointToKey(current));
    steps++;
  }

  return path;
}

/**
 * Find path using A* algorithm
 *
 * @param start Starting point
 * @param flowField Flow field array
 * @param width Grid width
 * @param height Grid height
 * @returns A* pathfinding result
 */
function findAStarPath(
  start: Point,
  flowField: FlowCell[],
  width: number,
  height: number
): { path: Point[]; cost: number } {
  const openSet: Array<{ point: Point; f: number; g: number; h: number; parent?: Point }> = [];
  const closedSet = new Set<string>();
  const cameFrom = new Map<string, Point>();

  openSet.push({ point: start, f: 0, g: 0, h: 0 });

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;
    const currentKey = pointToKey(current.point);

    if (closedSet.has(currentKey)) {
      continue;
    }

    closedSet.add(currentKey);

    // Check if reached goal (flow vector magnitude is 0)
    const currentIndex = current.point.y * width + current.point.x;
    if (flowField[currentIndex].magnitude === 0) {
      const path = reconstructPath(current.point, cameFrom);
      return { path, cost: current.g };
    }

    const neighbors = getNeighbors(current.point, width, height);
    for (const neighbor of neighbors) {
      const neighborKey = pointToKey(neighbor);
      if (closedSet.has(neighborKey)) {
        continue;
      }

      const tentativeG = current.g + 1;
      const h = calculateHeuristic(neighbor, flowField, width, height);
      const f = tentativeG + h;

      const existingIndex = openSet.findIndex(node => pointToKey(node.point) === neighborKey);
      if (existingIndex === -1 || tentativeG < openSet[existingIndex].g) {
        if (existingIndex !== -1) {
          openSet.splice(existingIndex, 1);
        }
        openSet.push({ point: neighbor, f, g: tentativeG, h, parent: current.point });
        cameFrom.set(neighborKey, current.point);
      }
    }
  }

  return { path: [start], cost: 0 };
}

/**
 * Simulate crowd movement
 *
 * @param agents Array of agent starting positions
 * @param flowField Flow field array
 * @param width Grid width
 * @param height Grid height
 * @param options Simulation options
 * @returns Crowd simulation result
 */
export function simulateCrowd(
  agents: Point[],
  flowField: FlowCell[],
  width: number,
  height: number,
  options: Partial<CrowdSimulationOptions> = {}
): CrowdSimulationResult {
  const startTime = performance.now();
  const simOptions: CrowdSimulationOptions = {
    agentCount: agents.length,
    useFlowFieldForAll: true,
    useAStarForSome: false,
    aStarPercentage: 0,
    useCollisionAvoidance: true,
    collisionAvoidanceRadius: 1.0,
    useFlockingBehavior: false,
    flockingParameters: {
      separationWeight: 1.0,
      alignmentWeight: 1.0,
      cohesionWeight: 1.0,
    },
    ...options,
  };

  const paths: Point[][] = [];
  const collisions: Array<{ agent1: number; agent2: number; step: number }> = [];

  for (let i = 0; i < agents.length; i++) {
    const agentPath = findAgentPath(agents[i], flowField, width, height);
    paths.push(agentPath.path);
  }

  // Check for collisions
  for (let step = 0; step < Math.min(...paths.map(p => p.length)); step++) {
    for (let i = 0; i < paths.length; i++) {
      for (let j = i + 1; j < paths.length; j++) {
        if (step < paths[i].length && step < paths[j].length) {
          const distance = calculateDistance(paths[i][step], paths[j][step]);
          if (distance < simOptions.collisionAvoidanceRadius * 2) {
            collisions.push({ agent1: i, agent2: j, step });
          }
        }
      }
    }
  }

  const execTime = performance.now() - startTime;
  return {
    agentPaths: paths,
    success: true,
    stats: {
      agentsReachedGoal: paths.filter(p => p.length > 0).length,
      agentsStuck: paths.filter(p => p.length === 0).length,
      averagePathLength: paths.reduce((sum, path) => sum + path.length, 0) / paths.length,
      averageExecutionTime: execTime / Math.max(1, paths.length),
      totalExecutionTime: execTime,
      collisionCount: collisions.length,
    },
  };
}

/**
 * Smooth a path by removing redundant points
 *
 * @param path Original path
 * @param flowField Flow field array
 * @param width Grid width
 * @param height Grid height
 * @returns Smoothed path
 */
function smoothPath(
  path: Point[],
  flowField: FlowCell[],
  width: number,
  height: number
): Point[] {
  if (path.length <= 2) {
    return path;
  }

  const smoothed: Point[] = [path[0]];

  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const current = path[i];
    const next = path[i + 1];

    // Check if current point is necessary
    const direction1 = { x: current.x - prev.x, y: current.y - prev.y };
    const direction2 = { x: next.x - current.x, y: next.y - current.y };

    // If directions are the same, skip current point
    if (direction1.x === direction2.x && direction1.y === direction2.y) {
      continue;
    }

    smoothed.push(current);
  }

  smoothed.push(path[path.length - 1]);
  return smoothed;
}

/**
 * Calculate path cost
 *
 * @param path Path array
 * @returns Total cost
 */
function calculatePathCost(path: Point[]): number {
  let cost = 0;
  for (let i = 1; i < path.length; i++) {
    cost += calculateDistance(path[i - 1], path[i]);
  }
  return cost;
}

/**
 * Calculate distance between two points
 *
 * @param a First point
 * @param b Second point
 * @returns Distance
 */
function calculateDistance(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate heuristic for A* algorithm
 *
 * @param point Current point
 * @param flowField Flow field array
 * @param width Grid width
 * @param height Grid height
 * @returns Heuristic value
 */
function calculateHeuristic(
  point: Point,
  flowField: FlowCell[],
  width: number,
  height: number
): number {
  const index = point.y * width + point.x;
  return flowField[index].magnitude;
}

/**
 * Reconstruct path from A* search
 *
 * @param goal Goal point
 * @param cameFrom Map of parent relationships
 * @returns Reconstructed path
 */
function reconstructPath(goal: Point, cameFrom: Map<string, Point>): Point[] {
  const path: Point[] = [goal];
  let current = goal;

  while (cameFrom.has(pointToKey(current))) {
    current = cameFrom.get(pointToKey(current))!;
    path.unshift(current);
  }

  return path;
}

/**
 * Get valid neighbors for a point
 *
 * @param point Current point
 * @param width Grid width
 * @param height Grid height
 * @returns Array of valid neighbor points
 */
function getNeighbors(point: Point, width: number, height: number): Point[] {
  const neighbors: Point[] = [];
  const directions = [
    { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 },
    { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: 1 },
  ];

  for (const direction of directions) {
    const neighbor = {
      x: point.x + direction.x,
      y: point.y + direction.y,
    };

    if (isValidPoint(neighbor, width, height)) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
}

/**
 * Check if a point is valid
 *
 * @param point Point to check
 * @param width Grid width
 * @param height Grid height
 * @returns True if point is valid
 */
function isValidPoint(point: Point, width: number, height: number): boolean {
  return point.x >= 0 && point.x < width && point.y >= 0 && point.y < height;
}

/**
 * Convert point to string key
 *
 * @param point Point to convert
 * @returns String key
 */
function pointToKey(point: Point): string {
  return `${point.x},${point.y}`;
}

