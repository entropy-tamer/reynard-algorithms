/**
 * Supercover Line Rasterization
 *
 * Every grid cell the segment intersects, including both cells at a corner
 * crossing, which is what coverage and line-of-sight tests need.
 */

export { SupercoverLine } from "./supercover-core";
export type { Point2D, SupercoverLineResult } from "./supercover-core";
