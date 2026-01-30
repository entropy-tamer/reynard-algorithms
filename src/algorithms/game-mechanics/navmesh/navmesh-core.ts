/**
 * @file navmesh-core.ts
 * @module algorithms/game-mechanics/navmesh-core
 * @description Navmesh generation and pathfinding implementation.
 *
 * Mathematical Theory:
 * A navmesh is a graph of walkable polygons used for pathfinding.
 * Generation involves:
 * 1. Decomposing geometry into convex polygons
 * 2. Triangulating walkable areas
 * 3. Building connectivity graph
 *
 * Pathfinding uses A* on the navmesh graph.
 */

import type { Point3D, Polygon } from "../../../core/types";
import type {
  NavmeshPolygon,
  NavmeshConfig,
  NavmeshResult,
  NavmeshPathfindingOptions,
  NavmeshPathfindingResult,
} from "./navmesh-types";
import { DEFAULT_NAVMESH_CONFIG } from "./navmesh-types";
import { DelaunayTriangulation } from "../../computational-geometry/delaunay/delaunay-core";

/**
 * Calculate polygon center.
 * @param vertices
 * @example
 */
function calculatePolygonCenter(vertices: Point3D[]): Point3D {
  let sumX = 0, sumY = 0, sumZ = 0;
  for (const v of vertices) {
    sumX += v.x;
    sumY += v.y;
    sumZ += v.z;
  }
  const n = vertices.length;
  return { x: sumX / n, y: sumY / n, z: sumZ / n };
}

/**
 * Check if two polygons share an edge.
 * @param poly1
 * @param poly2
 * @param tolerance
 * @example
 */
function shareEdge(poly1: Point3D[], poly2: Point3D[], tolerance: number): boolean {
  for (let i = 0; i < poly1.length; i++) {
    const v1 = poly1[i];
    const v2 = poly1[(i + 1) % poly1.length];
    if (!v1 || !v2) continue;
    for (let j = 0; j < poly2.length; j++) {
      const u1 = poly2[j];
      const u2 = poly2[(j + 1) % poly2.length];
      if (!u1 || !u2) continue;
      // Check if edges match (in either direction)
      if (
        (Math.abs(v1.x - u1.x) < tolerance && Math.abs(v1.y - u1.y) < tolerance &&
         Math.abs(v2.x - u2.x) < tolerance && Math.abs(v2.y - u2.y) < tolerance) ||
        (Math.abs(v1.x - u2.x) < tolerance && Math.abs(v1.y - u2.y) < tolerance &&
         Math.abs(v2.x - u1.x) < tolerance && Math.abs(v2.y - u1.y) < tolerance)
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Navmesh implementation.
 */
export class Navmesh {
  private config: Required<NavmeshConfig>;
  private polygons: NavmeshPolygon[] = [];

  /**
   * Creates a new Navmesh instance.
   * @param config Configuration options.
   * @example
   */
  constructor(config: Partial<NavmeshConfig> = {}) {
    this.config = { ...DEFAULT_NAVMESH_CONFIG, ...config };
  }

  /**
   * Generate navmesh from geometry.
   * @param walkableAreas Array of walkable polygons.
   * @returns Navmesh generation result.
   * @example
   */
  generate(walkableAreas: Polygon[]): NavmeshResult {
    const delaunay = new DelaunayTriangulation();
    const polygons: NavmeshPolygon[] = [];

    // Triangulate each walkable area
    for (const area of walkableAreas) {
      const result = delaunay.triangulate([...area.points]);

      for (const triangle of result.triangles) {
        const vertices: Point3D[] = [
          { x: triangle.a.x, y: triangle.a.y, z: 0 },
          { x: triangle.b.x, y: triangle.b.y, z: 0 },
          { x: triangle.c.x, y: triangle.c.y, z: 0 },
        ];
        polygons.push({
          vertices,
          neighbors: [],
          center: calculatePolygonCenter(vertices),
        });
      }
    }

    // Build neighbor connections
    for (let i = 0; i < polygons.length; i++) {
      const polyI = polygons[i];
      if (!polyI) continue;
      for (let j = i + 1; j < polygons.length; j++) {
        const polyJ = polygons[j];
        if (!polyJ) continue;
        if (shareEdge(polyI.vertices, polyJ.vertices, this.config.tolerance)) {
          polyI.neighbors.push(j);
          polyJ.neighbors.push(i);
        }
      }
    }

    this.polygons = polygons;

    return {
      polygons,
      polygonCount: polygons.length,
    };
  }

  /**
   * Find path on navmesh using A*.
   * @param options Pathfinding options.
   * @returns Pathfinding result.
   * @example
   */
  findPath(options: NavmeshPathfindingOptions): NavmeshPathfindingResult {
    if (this.polygons.length === 0) {
      return { path: [], found: false, cost: 0 };
    }

    // Find start and goal polygons
    const startPoly = this.findContainingPolygon(options.start);
    const goalPoly = this.findContainingPolygon(options.goal);

    if (startPoly === -1 || goalPoly === -1) {
      return { path: [], found: false, cost: 0 };
    }

    if (startPoly === goalPoly) {
      return {
        path: [options.start, options.goal],
        found: true,
        cost: this.distance3D(options.start, options.goal),
      };
    }

    // Use A* on navmesh graph
    const heuristic = options.heuristic ?? this.distance3D;
    const path = this.astarOnNavmesh(startPoly, goalPoly, options.start, options.goal, heuristic);

    return {
      path: path.length > 0 ? path : [],
      found: path.length > 0,
      cost: path.length > 0 ? this.calculatePathCost(path) : 0,
    };
  }

  /**
   * Find polygon containing a point.
   * @param point
   * @example
   */
  private findContainingPolygon(point: Point3D): number {
    for (let i = 0; i < this.polygons.length; i++) {
      const poly = this.polygons[i];
      if (poly && this.pointInPolygon(point, poly.vertices)) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Check if point is in polygon (2D projection).
   * @param point
   * @param vertices
   * @example
   */
  private pointInPolygon(point: Point3D, vertices: Point3D[]): boolean {
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const vi = vertices[i];
      const vj = vertices[j];
      if (!vi || !vj) continue;
      if (
        vi.y > point.y !== vj.y > point.y &&
        point.x < ((vj.x - vi.x) * (point.y - vi.y)) / (vj.y - vi.y) + vi.x
      ) {
        inside = !inside;
      }
    }
    return inside;
  }

  /**
   * A* pathfinding on navmesh graph.
   * @param start
   * @param goal
   * @param startPos
   * @param goalPos
   * @param heuristic
   * @example
   */
  private astarOnNavmesh(
    start: number,
    goal: number,
    startPos: Point3D,
    goalPos: Point3D,
    heuristic: (a: Point3D, b: Point3D) => number
  ): Point3D[] {
    const openSet: number[] = [start];
    const cameFrom: Map<number, number> = new Map();
    const gScore: Map<number, number> = new Map();
    const fScore: Map<number, number> = new Map();

    gScore.set(start, 0);
    fScore.set(start, heuristic(startPos, goalPos));

    while (openSet.length > 0) {
      let current = openSet[0];
      if (current === undefined) break;
      let currentIdx = 0;
      for (let i = 1; i < openSet.length; i++) {
        const candidate = openSet[i];
        if (candidate === undefined) continue;
        const candidateScore = fScore.get(candidate) ?? Infinity;
        const currentScore = fScore.get(current) ?? Infinity;
        if (candidateScore < currentScore) {
          current = candidate;
          currentIdx = i;
        }
      }

      if (current === goal) {
        // Reconstruct path
        const path: Point3D[] = [goalPos];
        let node = goal;
        while (cameFrom.has(node)) {
          const prevNode = cameFrom.get(node);
          if (prevNode === undefined) break;
          node = prevNode;
          const poly = this.polygons[node];
          if (poly) {
            path.unshift(poly.center);
          }
        }
        path.unshift(startPos);
        return path;
      }

      openSet.splice(currentIdx, 1);

      const currentPoly = this.polygons[current];
      if (!currentPoly) continue;

      for (const neighbor of currentPoly.neighbors) {
        const neighborPoly = this.polygons[neighbor];
        if (!neighborPoly) continue;

        const currentG = gScore.get(current) ?? Infinity;
        const tentativeG = currentG + this.distance3D(
          currentPoly.center,
          neighborPoly.center
        );

        const neighborG = gScore.get(neighbor) ?? Infinity;
        if (tentativeG < neighborG) {
          cameFrom.set(neighbor, current);
          gScore.set(neighbor, tentativeG);
          fScore.set(neighbor, tentativeG + heuristic(neighborPoly.center, goalPos));

          if (!openSet.includes(neighbor)) {
            openSet.push(neighbor);
          }
        }
      }
    }

    return [];
  }

  /**
   * Calculate 3D distance.
   * @param a
   * @param b
   * @example
   */
  private distance3D(a: Point3D, b: Point3D): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Calculate path cost.
   * @param path
   * @example
   */
  private calculatePathCost(path: Point3D[]): number {
    let cost = 0;
    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      if (prev && curr) {
        cost += this.distance3D(prev, curr);
      }
    }
    return cost;
  }
}

