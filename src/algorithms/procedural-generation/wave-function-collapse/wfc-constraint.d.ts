/**
 * @file Wave Function Collapse constraint derivation and validation helpers
 *
 * Handles constraint generation, validation, and management
 * for the Wave Function Collapse algorithm.
 *
 * @module algorithms/geometry/algorithms/wave-function-collapse
 */
import type { Constraint, Pattern, Tile } from "./wave-function-collapse-types";
/**
 * Generate constraints from patterns
 *
 * @param patterns Array of patterns
 * @returns Array of constraints
 * @example
 * const constraints = generateConstraintsFromPatterns(patterns);
 */
export declare function generateConstraintsFromPatterns(patterns: Pattern[]): Constraint[];
/**
 * Validate constraints
 *
 * @param constraints Array of constraints
 * @param tiles Available tiles
 * @returns True if all constraints are valid
 * @example
 * const isValid = validateConstraints(constraints, tiles);
 */
export declare function validateConstraints(constraints: Constraint[], tiles: Tile[]): boolean;
/**
 * Generate constraints from 2D/3D sockets present in tiles.
 * If tiles provide sockets2D or sockets3D, derive directional adjacency rules.
 *
 * @param tiles Array of tiles with socket definitions
 * @returns Array of constraints derived from sockets
 * @example
 * const constraints = generateConstraintsFromSockets(tiles);
 */
export declare function generateConstraintsFromSockets(tiles: Tile[]): Constraint[];
/**
 * Filter constraints by tile
 *
 * @param constraints Array of constraints
 * @param tileId Tile ID to filter by
 * @returns Filtered constraints
 * @example
 * const filtered = filterConstraintsByTile(constraints, 'tile-1');
 */
export declare function filterConstraintsByTile(constraints: Constraint[], tileId: string): Constraint[];
/**
 * Get constraints for specific tile and direction
 *
 * @param constraints Array of constraints
 * @param tileId Tile ID
 * @param direction Direction
 * @returns Matching constraints
 * @example
 * const matching = getConstraintsForTileAndDirection(constraints, 'tile-1', 'east');
 */
export declare function getConstraintsForTileAndDirection(constraints: Constraint[], tileId: string, direction: string): Constraint[];
/**
 * Get allowed tiles for specific tile and direction
 *
 * @param constraints Array of constraints
 * @param tileId Tile ID
 * @param direction Direction
 * @returns Array of allowed tile IDs
 * @example
 * const allowed = getAllowedTilesForDirection(constraints, 'tile-1', 'east');
 */
export declare function getAllowedTilesForDirection(constraints: Constraint[], tileId: string, direction: string): string[];
/**
 * Check if two tiles are compatible
 *
 * @param constraints Array of constraints
 * @param tile1 First tile ID
 * @param tile2 Second tile ID
 * @param direction Direction
 * @returns True if tiles are compatible
 * @example
 * const compatible = areTilesCompatible(constraints, 'tile-1', 'tile-2', 'east');
 */
export declare function areTilesCompatible(constraints: Constraint[], tile1: string, tile2: string, direction: string): boolean;
//# sourceMappingURL=wfc-constraint.d.ts.map