/**
 * @file visibility-graph-core.ts
 * @module algorithms/pathfinding/visibility-graph-core
 * @description Visibility Graph construction and pathfinding.
 *
 * Mathematical Theory:
 * A visibility graph connects all pairs of vertices that can "see" each other
 * (line of sight not blocked by obstacles). Used for any-angle pathfinding.
 *
 * Construction: For each pair of vertices, check if line segment intersects
 * any obstacle edge. If not, add edge to graph.
 *
 * Pathfinding: Use A* on the visibility graph.
 */

import type { Point } from "../../../core/types";
import type {
  Obstacle,
  VisibilityEdge,
  VisibilityGraphConfig,
  VisibilityGraphPathfindingOptions,
  VisibilityGraphPathfindingResult,
  VisibilityGraphResult,
} from "./visibility-graph-types";
import { DEFAULT_VISIBILITY_GRAPH_CONFIG } from "./visibility-graph-types";

/**
 * Calculate distance between two points.
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
 * Check if two line segments intersect.
 * @param p1
 * @param p2
 * @param p3
 * @param p4
 * @param tolerance
 * @example
 */
function segmentsIntersect(p1: Point, p2: Point, p3: Point, p4: Point, tolerance: number): boolean {
  const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
  if (Math.abs(d) < tolerance) return false; // Parallel

  const t = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
  const u = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;

  return t >= tolerance && t <= 1 - tolerance && u >= tolerance && u <= 1 - tolerance;
}

/**
 * Check if a point lies on segment a-b (within tolerance).
 * Used to exempt polygon-boundary points from the inside test.
 */
function pointOnSegment(p: Point, a: Point, b: Point, tolerance: number): boolean {
  const cross = (p.x - a.x) * (b.y - a.y) - (p.y - a.y) * (b.x - a.x);
  if (Math.abs(cross) > tolerance * Math.max(distance(a, b), tolerance)) return false;
  return (
    p.x >= Math.min(a.x, b.x) - tolerance &&
    p.x <= Math.max(a.x, b.x) + tolerance &&
    p.y >= Math.min(a.y, b.y) - tolerance &&
    p.y <= Math.max(a.y, b.y) + tolerance
  );
}

/**
 * Check if a point is strictly inside a polygon (even-odd ray casting).
 * Points on the polygon boundary count as OUTSIDE — visibility-graph edges
 * legitimately run along obstacle boundaries and between their vertices.
 */
function pointInPolygon(p: Point, vertices: Point[], tolerance: number): boolean {
  for (let i = 0; i < vertices.length; i++) {
    const v1 = vertices[i]!;
    const v2 = vertices[(i + 1) % vertices.length]!;
    if (pointOnSegment(p, v1, v2, tolerance)) {
      return false;
    }
  }

  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const vi = vertices[i]!;
    const vj = vertices[j]!;
    if (vi.y > p.y !== vj.y > p.y) {
      const xIntersect = ((vj.x - vi.x) * (p.y - vi.y)) / (vj.y - vi.y) + vi.x;
      if (p.x < xIntersect) {
        inside = !inside;
      }
    }
  }
  return inside;
}

/**
 * Check if line segment intersects obstacle.
 * @param p1
 * @param p2
 * @param obstacle
 * @param tolerance
 * @example
 */
function lineIntersectsObstacle(p1: Point, p2: Point, obstacle: Obstacle, tolerance: number): boolean {
  // Edge-crossing check alone misses segments that ENTER/EXIT through
  // vertices or lie fully inside: probe interior sample points as well.
  // Three samples (not just the midpoint) are needed because a midpoint can
  // land exactly ON a boundary vertex (boundary counts as outside) while
  // part of the segment still passes through the interior.
  const vertices = obstacle.vertices;
  for (const t of [0.25, 0.5, 0.75]) {
    const sample = { x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t };
    if (pointInPolygon(sample, vertices, tolerance)) {
      return true;
    }
  }
  for (let i = 0; i < vertices.length; i++) {
    const v1 = vertices[i]!;
    const v2 = vertices[(i + 1) % vertices.length]!;
    if (segmentsIntersect(p1, p2, v1, v2, tolerance)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if two vertices have line of sight.
 * @param v1
 * @param v2
 * @param obstacles
 * @param tolerance
 * @example
 */
function hasLineOfSight(v1: Point, v2: Point, obstacles: Obstacle[], tolerance: number): boolean {
  for (const obstacle of obstacles) {
    if (lineIntersectsObstacle(v1, v2, obstacle, tolerance)) {
      return false;
    }
  }
  return true;
}

/**
 * Visibility Graph implementation.
 */
export class VisibilityGraph {
  private config: Required<VisibilityGraphConfig>;
  private vertices: Point[] = [];
  private edges: VisibilityEdge[] = [];

  /**
   * Creates a new VisibilityGraph instance.
   * @param config Configuration options.
   * @example
   */
  constructor(config: Partial<VisibilityGraphConfig> = {}) {
    this.config = { ...DEFAULT_VISIBILITY_GRAPH_CONFIG, ...config };
  }

  /**
   * Build visibility graph from obstacles.
   * @param obstacles Array of obstacle polygons.
   * @returns Visibility graph result.
   * @example
   */
  build(obstacles: Obstacle[]): VisibilityGraphResult {
    // Collect all obstacle vertices
    const allVertices: Point[] = [];
    for (const obstacle of obstacles) {
      for (const vertex of obstacle.vertices) {
        allVertices.push(vertex);
      }
    }

    this.vertices = allVertices;
    this.edges = [];

    // Check visibility between all pairs of vertices
    for (let i = 0; i < allVertices.length; i++) {
      for (let j = i + 1; j < allVertices.length; j++) {
        const v1 = allVertices[i]!;
        const v2 = allVertices[j]!;
        if (hasLineOfSight(v1, v2, obstacles, this.config.tolerance)) {
          const weight = distance(v1, v2);
          this.edges.push({ from: i, to: j, weight });
          this.edges.push({ from: j, to: i, weight }); // Bidirectional
        }
      }
    }

    return {
      vertices: this.vertices,
      edges: this.edges,
      vertexCount: this.vertices.length,
      edgeCount: this.edges.length,
    };
  }

  /**
   * Find path using visibility graph.
   * @param options Pathfinding options.
   * @param obstacles Obstacles (for line of sight checks).
   * @returns Pathfinding result.
   * @example
   */
  findPath(options: VisibilityGraphPathfindingOptions, obstacles: Obstacle[]): VisibilityGraphPathfindingResult {
    // Add start and goal to graph
    const startIdx = this.vertices.length;
    const goalIdx = startIdx + 1;
    const allVertices = [...this.vertices, options.start, options.goal];

    // Find visible vertices from start and goal
    const startEdges: VisibilityEdge[] = [];
    const goalEdges: VisibilityEdge[] = [];

    for (let i = 0; i < this.vertices.length; i++) {
      const vertex = this.vertices[i]!;
      if (hasLineOfSight(options.start, vertex, obstacles, this.config.tolerance)) {
        const weight = distance(options.start, vertex);
        startEdges.push({ from: startIdx, to: i, weight });
      }
      if (hasLineOfSight(options.goal, vertex, obstacles, this.config.tolerance)) {
        const weight = distance(options.goal, vertex);
        goalEdges.push({ from: i, to: goalIdx, weight });
      }
    }

    // Check direct path from start to goal
    if (hasLineOfSight(options.start, options.goal, obstacles, this.config.tolerance)) {
      return {
        path: [options.start, options.goal],
        found: true,
        cost: distance(options.start, options.goal),
      };
    }

    // Use A* on visibility graph
    const path = this.astarOnVisibilityGraph(startIdx, goalIdx, allVertices, [
      ...this.edges,
      ...startEdges,
      ...goalEdges,
    ]);

    if (path.length === 0) {
      return { path: [], found: false, cost: 0 };
    }

    // Convert indices to points
    const pointPath = path.map(idx => allVertices[idx]!).filter((p): p is Point => p !== undefined);

    return {
      path: pointPath,
      found: true,
      cost: this.calculatePathCost(pointPath),
    };
  }

  /**
   * A* pathfinding on visibility graph.
   * @param start
   * @param goal
   * @param vertices
   * @param edges
   * @example
   */
  private astarOnVisibilityGraph(start: number, goal: number, vertices: Point[], edges: VisibilityEdge[]): number[] {
    const openSet: number[] = [start];
    const cameFrom: Map<number, number> = new Map();
    const gScore: Map<number, number> = new Map();
    const fScore: Map<number, number> = new Map();

    gScore.set(start, 0);
    fScore.set(start, distance(vertices[start]!, vertices[goal]!));

    while (openSet.length > 0) {
      let current = openSet[0];
      if (current === undefined) {
        break;
      }
      let currentIdx = 0;
      for (let i = 1; i < openSet.length; i++) {
        const candidate = openSet[i];
        if (candidate === undefined) {
          continue;
        }
        const candidateF = fScore.get(candidate) ?? Infinity;
        const currentF = fScore.get(current) ?? Infinity;
        if (candidateF < currentF) {
          current = candidate;
          currentIdx = i;
        }
      }

      if (current === goal) {
        // Reconstruct path
        const path: number[] = [goal];
        let node = goal;
        while (cameFrom.has(node)) {
          node = cameFrom.get(node)!;
          path.unshift(node);
        }
        return path;
      }

      openSet.splice(currentIdx, 1);

      // Check neighbors
      for (const edge of edges) {
        if (edge.from === current) {
          const neighbor = edge.to;
          const tentativeG = (gScore.get(current) ?? Infinity) + edge.weight;

          if (tentativeG < (gScore.get(neighbor) ?? Infinity)) {
            cameFrom.set(neighbor, current);
            gScore.set(neighbor, tentativeG);
            fScore.set(neighbor, tentativeG + distance(vertices[neighbor]!, vertices[goal]!));

            if (!openSet.includes(neighbor)) {
              openSet.push(neighbor);
            }
          }
        }
      }
    }

    return [];
  }

  /**
   * Calculate path cost.
   * @param path
   * @example
   */
  private calculatePathCost(path: Point[]): number {
    let cost = 0;
    for (let i = 1; i < path.length; i++) {
      cost += distance(path[i - 1]!, path[i]!);
    }
    return cost;
  }
}
