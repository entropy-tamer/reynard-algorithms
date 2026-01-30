/**
 * @file Pattern Extraction Utilities
 *
 * Extracts patterns from 2D and 3D input data for Wave Function Collapse.
 *
 * @module algorithms/geometry/algorithms/wave-function-collapse
 */

import type { Pattern } from "./wave-function-collapse-types";

/**
 * Extract patterns from 2D input data
 *
 * @param inputData 2D input data
 * @param patternSize Size of patterns to extract
 * @returns Array of extracted patterns
 * @example
 */
export function extractPatterns2D(inputData: string[][], patternSize: number): Pattern[] {
  const patterns: Pattern[] = [];
  const height = inputData.length;
  const width = inputData[0]?.length || 0;

  for (let y = 0; y <= height - patternSize; y++) {
    for (let x = 0; x <= width - patternSize; x++) {
      const pattern = extractPatternAt2D(inputData, x, y, patternSize);
      patterns.push(pattern);
    }
  }

  return patterns;
}

/**
 * Extract patterns from 3D input data
 *
 * @param inputData 3D input data
 * @param patternSize Size of patterns to extract
 * @returns Array of extracted patterns
 * @example
 */
export function extractPatterns3D(inputData: string[][][], patternSize: number): Pattern[] {
  const patterns: Pattern[] = [];
  const depth = inputData.length;
  const height = inputData[0]?.length || 0;
  const width = inputData[0]?.[0]?.length || 0;

  for (let z = 0; z <= depth - patternSize; z++) {
    for (let y = 0; y <= height - patternSize; y++) {
      for (let x = 0; x <= width - patternSize; x++) {
        const pattern = extractPatternAt3D(inputData, x, y, z, patternSize);
        patterns.push(pattern);
      }
    }
  }

  return patterns;
}

/**
 * Extract pattern at specific 2D position
 *
 * @param inputData 2D input data
 * @param x X position
 * @param y Y position
 * @param patternSize Size of pattern
 * @returns Extracted pattern
 * @example
 */
function extractPatternAt2D(inputData: string[][], x: number, y: number, patternSize: number): Pattern {
  const data: string[][] = [];

  for (let dy = 0; dy < patternSize; dy++) {
    const row: string[] = [];
    for (let dx = 0; dx < patternSize; dx++) {
      const value = inputData[y + dy]?.[x + dx];
      row.push(value ?? "");
    }
    data.push(row);
  }

  return {
    data: data as any,
    width: patternSize,
    height: patternSize,
    depth: 1,
    frequency: 1,
  };
}

/**
 * Extract pattern at specific 3D position
 *
 * @param inputData 3D input data
 * @param x X position
 * @param y Y position
 * @param z Z position
 * @param patternSize Size of pattern
 * @returns Extracted pattern
 * @example
 */
function extractPatternAt3D(inputData: string[][][], x: number, y: number, z: number, patternSize: number): Pattern {
  const data: string[][][] = [];

  for (let dz = 0; dz < patternSize; dz++) {
    const layer: string[][] = [];
    for (let dy = 0; dy < patternSize; dy++) {
      const row: string[] = [];
      for (let dx = 0; dx < patternSize; dx++) {
        const value = inputData[z + dz]?.[y + dy]?.[x + dx];
        row.push(value ?? "");
      }
      layer.push(row);
    }
    data.push(layer);
  }

  return {
    data: data as any,
    width: patternSize,
    height: patternSize,
    depth: patternSize,
    frequency: 1,
  };
}

/**
 * Extract pattern as string for comparison
 *
 * @param grid Grid data
 * @param x X position
 * @param y Y position
 * @param z Z position
 * @param patternSize Size of pattern
 * @returns Pattern as string
 * @example
 */
export function extractPatternString(grid: any[][][], x: number, y: number, z: number, patternSize: number): string {
  const parts: string[] = [];

  for (let dz = 0; dz < patternSize; dz++) {
    for (let dy = 0; dy < patternSize; dy++) {
      for (let dx = 0; dx < patternSize; dx++) {
        const value = grid[z + dz]?.[y + dy]?.[x + dx];
        parts.push(value || "");
      }
    }
  }

  return parts.join(",");
}
