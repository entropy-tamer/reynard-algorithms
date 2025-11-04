/**
 * Geometry helpers for Spatial Hashing
 *
 * @file Geometry utilities for computing cell coverage and distances
 * @module algorithms/spatialHashGeometry
 */

import type { SpatialObject } from "./spatial-hash-types";

/**
 * Compute cell keys overlapped by a rectangle.
 *
 * @param cellSize Cell size in world units
 * @param x Rectangle left coordinate
 * @param y Rectangle top coordinate
 * @param width Rectangle width
 * @param height Rectangle height
 * @returns Set of cell keys in "x,y" form
 * @example
 */
export function getRectCells(cellSize: number, x: number, y: number, width: number, height: number): Set<string> {
  const minCellX = Math.floor(x / cellSize);
  const maxCellX = Math.floor((x + width) / cellSize);
  const minCellY = Math.floor(y / cellSize);
  const maxCellY = Math.floor((y + height) / cellSize);

  const cellKeys = new Set<string>();
  for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
    for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
      cellKeys.add(`${cellX},${cellY}`);
    }
  }
  return cellKeys;
}

/**
 * Compute cell keys overlapped by a circle.
 *
 * @param cellSize Cell size in world units
 * @param centerX Circle center x
 * @param centerY Circle center y
 * @param radius Circle radius
 * @returns Set of cell keys in "x,y" form
 * @example
 */
export function getRadiusCells(cellSize: number, centerX: number, centerY: number, radius: number): Set<string> {
  const minCellX = Math.floor((centerX - radius) / cellSize);
  const maxCellX = Math.floor((centerX + radius) / cellSize);
  const minCellY = Math.floor((centerY - radius) / cellSize);
  const maxCellY = Math.floor((centerY + radius) / cellSize);

  const cellKeys = new Set<string>();
  for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
    for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
      cellKeys.add(`${cellX},${cellY}`);
    }
  }
  return cellKeys;
}

/**
 * Check if an object intersects a rectangle.
 *
 * @param object Spatial object with position and optional size
 * @param rectX Rectangle left coordinate
 * @param rectY Rectangle top coordinate
 * @param rectWidth Rectangle width
 * @param rectHeight Rectangle height
 * @returns True if any overlap exists
 * @example
 */
export function isObjectInRect(
  object: SpatialObject,
  rectX: number,
  rectY: number,
  rectWidth: number,
  rectHeight: number
): boolean {
  const objWidth = object.width || 0;
  const objHeight = object.height || 0;

  return (
    object.x < rectX + rectWidth &&
    object.x + objWidth > rectX &&
    object.y < rectY + rectHeight &&
    object.y + objHeight > rectY
  );
}

/**
 * Euclidean distance between two points.
 *
 * @param x1 First point x
 * @param y1 First point y
 * @param x2 Second point x
 * @param y2 Second point y
 * @returns Distance between the two points
 * @example
 */
export function getDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
