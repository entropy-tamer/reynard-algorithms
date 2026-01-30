/**
 * StructureForge - Efficient procedural generation for man-made structures
 *
 * Types and interfaces for the StructureForge algorithm, optimized for creating
 * buildings, mazes, towers, and other artificial constructs using layered
 * 2D wave function collapse patterns.
 */

export type StructureType =
  | 'building'
  | 'tower'
  | 'maze'
  | 'dungeon'
  | 'fortress'
  | 'temple';

export type MaterialType =
  | 'stone'
  | 'brick'
  | 'wood'
  | 'metal'
  | 'crystal'
  | 'void';

export type CellType =
  | 'air'
  | 'solid'
  | 'door'
  | 'window'
  | 'stair_up'
  | 'stair_down'
  | 'ladder'
  | 'bridge';

export interface StructureCell {
  type: CellType;
  material: MaterialType;
  height?: number; // For varying floor heights
  metadata?: Record<string, any>;
}

export interface LayerPattern {
  width: number;
  height: number;
  cells: StructureCell[][];
  constraints: PatternConstraint[];
}

export interface PatternConstraint {
  position: { x: number; y: number };
  allowedNeighbors: {
    north?: CellType[];
    south?: CellType[];
    east?: CellType[];
    west?: CellType[];
  };
}

export interface StructureConfig {
  type: StructureType;
  width: number;
  height: number;
  depth: number; // Vertical layers
  seed?: number;
  complexity: number; // 0-1, affects pattern density
  symmetry: number; // 0-1, affects structural regularity
  materialPalette: MaterialType[];
}

export interface GenerationResult {
  layers: StructureCell[][][];
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    minZ: number;
    maxZ: number;
  };
  metadata: {
    generationTime: number;
    seed: number;
    type: StructureType;
    layerCount: number;
  };
}

export interface StructureForgeOptions {
  maxIterations?: number;
  backtrackLimit?: number;
  patternSize?: number;
  enableBridges?: boolean;
  enableSkylights?: boolean;
  heightVariation?: boolean;
}
