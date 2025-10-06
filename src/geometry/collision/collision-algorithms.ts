/**
 * Collision Algorithms
 *
 * Specialized algorithms for collision detection, intersection testing,
 * and spatial relationship calculations between geometric shapes.
 *
 * @module algorithms/collision-algorithms
 */

// Re-export all shape interfaces
export type { Line, Rectangle, Circle, Polygon } from "../shapes/shapes";

// Re-export all algorithm classes
export { LineOps } from "../shapes/line-algorithms";
export { RectangleOps } from "../shapes/rectangle-algorithms";
export { CircleOps } from "../shapes/circle-algorithms";
export { PolygonOps } from "../shapes/polygon-algorithms";
