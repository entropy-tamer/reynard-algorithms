/**
 * Space Colonization -- Post-processing
 *
 * The raw skeleton is a set of straight unit segments meeting at hard angles.
 * Turning it into something that reads as a tree takes two steps, and both live
 * here: Murray's law for how thick each branch is, and a subdivision scheme for
 * how smoothly it bends.
 *
 * @module algorithms/procedural-generation/space-colonization/postprocess
 */

import type {
  BranchRadiusOptions,
  SpaceColonizationNode,
  SpaceColonizationVector,
} from "./space-colonization-types";

/**
 * Assign a `radius` to every node, leaves first, using Murray's law:
 *
 *     r_parent ^ e = sum over children of ( r_child ^ e )
 *
 * The exponent `e` is 3 in Murray's derivation (a minimum-volume vessel
 * network under fixed flow), 2 for the area-preserving case, and something
 * between 2 and 3 in most graphics code. With `e = 2` a parent's cross-section
 * is exactly its children's, so flow is conserved, which is the intuition the
 * rule is usually quoted for: "a parent is as thick as its children together".
 *
 * **Precondition:** every child appears after its parent in `nodes`. Space
 * colonization spawns children after parents, so the array it returns satisfies
 * this; a hand-built tree must too. The pass walks the array backwards, so a
 * child is always resolved before its parent is asked for it.
 *
 * Mutates `nodes` in place and returns it.
 *
 * @example
 * ```ts
 * const result = grower.run();
 * computeBranchRadii(result.nodes, { exponent: 2, leafRadius: 0.6 });
 * // result.nodes[i].radius is now set for every i
 * ```
 */
export function computeBranchRadii(
  nodes: SpaceColonizationNode[],
  options: BranchRadiusOptions = {},
): SpaceColonizationNode[] {
  const exponent = options.exponent ?? 2;
  const leafRadius = options.leafRadius ?? 0.5;
  if (!(exponent > 0)) {
    throw new Error("computeBranchRadii: exponent must be > 0");
  }
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i]!;
    if (node.children.length === 0) {
      node.radius = leafRadius;
      continue;
    }
    let sum = 0;
    for (let c = 0; c < node.children.length; c++) {
      const childRadius = nodes[node.children[c]!]!.radius ?? leafRadius;
      sum += Math.pow(childRadius, exponent);
    }
    node.radius = Math.pow(sum, 1 / exponent);
  }
  return nodes;
}

/** Linear blend of two vectors. */
function lerp(
  a: SpaceColonizationVector,
  b: SpaceColonizationVector,
  t: number,
): SpaceColonizationVector {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

/**
 * Chaikin's corner-cutting subdivision: replace each segment with two points at
 * the quarter marks, so the polyline's corners are planed off. Each pass
 * roughly doubles the point count and converges to a quadratic B-spline of the
 * original control polygon.
 *
 * It is a *subdivision* scheme, not an interpolation: the result does not pass
 * through the original interior points. For a skeleton that is the point -- the
 * straight node segments become a curve that visually commits to the same
 * branch without the hard elbows.
 *
 * @param points - The polyline to smooth.
 * @param iterations - Number of subdivision passes. Each doubles the length.
 * @param closed - Whether the polyline is a loop. Closed loops refine every
 *   segment; open ones pin their two endpoints.
 */
export function chaikinSubdivide(
  points: SpaceColonizationVector[],
  iterations: number,
  closed = false,
): SpaceColonizationVector[] {
  let current = points.map((p) => ({ x: p.x, y: p.y, z: p.z }));
  for (let pass = 0; pass < iterations; pass++) {
    if (current.length < 2) break;
    const next: SpaceColonizationVector[] = [];
    const segmentCount = closed ? current.length : current.length - 1;
    if (!closed && current.length > 0) next.push(current[0]!);
    for (let i = 0; i < segmentCount; i++) {
      const a = current[i]!;
      const b = current[(i + 1) % current.length]!;
      next.push(lerp(a, b, 0.25));
      next.push(lerp(a, b, 0.75));
    }
    if (!closed && current.length > 0) next.push(current[current.length - 1]!);
    current = next;
  }
  return current;
}

/**
 * Every root-to-tip path in the skeleton, as polylines of node positions.
 *
 * A path ends at a leaf (a node with no children). A skeleton whose growth
 * stalled mid-branch has tips too, and they are leaves in the graph sense, so
 * they end paths as well.
 */
export function extractPaths(nodes: SpaceColonizationNode[]): SpaceColonizationVector[][] {
  const paths: SpaceColonizationVector[][] = [];
  const byId = new Map<number, SpaceColonizationNode>();
  for (let i = 0; i < nodes.length; i++) byId.set(nodes[i]!.id, nodes[i]!);

  const walk = (node: SpaceColonizationNode, trail: SpaceColonizationVector[]): void => {
    const next = trail.concat(node.position);
    if (node.children.length === 0) {
      paths.push(next);
      return;
    }
    for (let c = 0; c < node.children.length; c++) {
      const child = byId.get(node.children[c]!);
      if (child) walk(child, next);
    }
  };

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]!;
    if (node.parent === -1) walk(node, []);
  }
  return paths;
}

/**
 * Smooth every root-to-tip path with {@link chaikinSubdivide}.
 *
 * Caveat worth knowing before using it: paths are smoothed *independently*, so
 * two paths that share a trunk are cut slightly differently on that shared
 * span, and drawn as separate curves they can part by a fraction of a segment
 * near a fork. For a single-colour line drawing that is invisible; for
 * thickness-varying geometry, subdivide once and offset the shared span by the
 * node radius instead.
 *
 * @param nodes - The skeleton.
 * @param iterations - Chaikin passes per path.
 */
export function smoothPaths(
  nodes: SpaceColonizationNode[],
  iterations: number,
): SpaceColonizationVector[][] {
  return extractPaths(nodes).map((path) => chaikinSubdivide(path, iterations));
}
