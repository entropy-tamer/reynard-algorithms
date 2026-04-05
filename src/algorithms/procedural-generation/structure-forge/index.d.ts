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
export type { StructureType, MaterialType, CellType, StructureCell, LayerPattern, PatternConstraint, StructureConfig, GenerationResult, StructureForgeOptions } from './structure-forge-types';
export declare function createBuildingConfig(width: number, height: number, depth: number, seed?: number): {
    type: "building";
    width: number;
    height: number;
    depth: number;
    seed: number | undefined;
    complexity: number;
    symmetry: number;
    materialPalette: readonly ["stone", "brick", "wood"];
};
export declare function createTowerConfig(radius: number, height: number, seed?: number): {
    type: "tower";
    width: number;
    height: number;
    depth: number;
    seed: number | undefined;
    complexity: number;
    symmetry: number;
    materialPalette: readonly ["stone", "brick"];
};
export declare function createMazeConfig(width: number, height: number, depth: number, seed?: number): {
    type: "maze";
    width: number;
    height: number;
    depth: number;
    seed: number | undefined;
    complexity: number;
    symmetry: number;
    materialPalette: readonly ["stone"];
};
export declare function createDungeonConfig(width: number, height: number, depth: number, seed?: number): {
    type: "dungeon";
    width: number;
    height: number;
    depth: number;
    seed: number | undefined;
    complexity: number;
    symmetry: number;
    materialPalette: readonly ["stone", "metal"];
};
//# sourceMappingURL=index.d.ts.map