/**
 * DDA Line Rasterization
 *
 * Walks the longer axis in unit steps and accumulates a floating-point increment
 * on the other axis, with the samples exposed as well as the rounded cells.
 */

export { DDALine } from "./dda-core";
export type { DDALineResult, Point2D } from "./dda-core";
