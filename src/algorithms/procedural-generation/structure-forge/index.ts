/**
 * StructureForge - Efficient Procedural Generation for Man-Made Structures
 *
 * A layered wave function collapse algorithm optimized for creating artificial
 * buildings, mazes, towers, and other constructed environments. Inspired by
 * the "Layered Wave Function Collapse" approach described in terrain generation
 * research, but specifically tuned for man-made architectural forms.
 *
 * Key Features:
 * - Layered 2D WFC patterns for vertical stacking
 * - Structure-specific optimizations (towers, mazes, dungeons, temples)
 * - Emergent complexity from overlapping pattern layers
 * - Efficient generation suitable for real-time applications
 * - Configurable materials and architectural styles
 */

export { StructureForge } from './structure-forge-core';
export type {
  StructureType,
  MaterialType,
  CellType,
  StructureCell,
  LayerPattern,
  PatternConstraint,
  StructureConfig,
  GenerationResult,
  StructureForgeOptions
} from './structure-forge-types';

// Utility functions for common use cases
export function createBuildingConfig(width: number, height: number, depth: number, seed?: number) {
  return {
    type: 'building' as const,
    width,
    height,
    depth,
    seed,
    complexity: 0.6,
    symmetry: 0.4,
    materialPalette: ['stone', 'brick', 'wood'] as const
  };
}

export function createTowerConfig(radius: number, height: number, seed?: number) {
  return {
    type: 'tower' as const,
    width: radius * 2 + 1,
    height: radius * 2 + 1,
    depth: height,
    seed,
    complexity: 0.3,
    symmetry: 0.9,
    materialPalette: ['stone', 'brick'] as const
  };
}

export function createMazeConfig(width: number, height: number, depth: number, seed?: number) {
  return {
    type: 'maze' as const,
    width,
    height,
    depth,
    seed,
    complexity: 0.8,
    symmetry: 0.1,
    materialPalette: ['stone'] as const
  };
}

export function createDungeonConfig(width: number, height: number, depth: number, seed?: number) {
  return {
    type: 'dungeon' as const,
    width,
    height,
    depth,
    seed,
    complexity: 0.9,
    symmetry: 0.2,
    materialPalette: ['stone', 'metal'] as const
  };
}