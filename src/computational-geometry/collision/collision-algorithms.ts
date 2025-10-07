/**
 * Collision Algorithms
 *
 * Specialized algorithms for collision detection, intersection testing,
 * and spatial relationship calculations between geometric shapes.
 *
 * @module algorithms/collision-algorithms
 */

// Re-export all shape interfaces
export type { Line, Rectangle, Circle, Polygon } from "../../geometry/shapes/shapes";

// Re-export all algorithm classes
export { LineOps } from "../../geometry/shapes/line-algorithms";
export { RectangleOps } from "../../geometry/shapes/rectangle-algorithms";
export { CircleOps } from "../../geometry/shapes/circle-algorithms";
export { PolygonOps } from "../../geometry/shapes/polygon-algorithms";
