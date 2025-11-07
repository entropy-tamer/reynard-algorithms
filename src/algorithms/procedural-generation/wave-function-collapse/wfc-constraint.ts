/**
 * @file Wave Function Collapse constraint derivation and validation helpers
 *
 * Handles constraint generation, validation, and management
 * for the Wave Function Collapse algorithm.
 *
 * @module algorithms/geometry/algorithms/wave-function-collapse
 */

import type {
  Constraint,
  Pattern,
  Tile,
  Direction2D,
  Direction3D,
  Position2D,
  Position3D,
  Socket3D,
} from "./wave-function-collapse-types";

/**
 * Generate constraints from patterns
 *
 * @param patterns Array of patterns
 * @returns Array of constraints
 * @example
 * const constraints = generateConstraintsFromPatterns(patterns);
 */
export function generateConstraintsFromPatterns(patterns: Pattern[]): Constraint[] {
  const constraints: Constraint[] = [];
  const constraintMap = new Map<string, Constraint>();

  for (const pattern of patterns) {
    const patternConstraints = extractConstraintsFromPattern(pattern);

    for (const constraint of patternConstraints) {
      const key = getConstraintKey(constraint);
      if (!constraintMap.has(key)) {
        constraintMap.set(key, constraint);
        constraints.push(constraint);
      }
    }
  }

  return constraints;
}

/**
 * Extract constraints from a single pattern
 *
 * @param pattern Pattern to extract constraints from
 * @returns Array of constraints
 * @example
 * const constraints = extractConstraintsFromPattern(pattern);
 */
function extractConstraintsFromPattern(pattern: Pattern): Constraint[] {
  const constraints: Constraint[] = [];
  const data: string[][] | string[][][] = pattern.data as string[][] | string[][][];
  const depth = Array.isArray(data[0]?.[0]) ? (data as string[][][]).length : 1;
  const height = depth === 1 ? (data as string[][]).length : (data as string[][][])[0].length;
  const width = depth === 1 ? (data as string[][])[0]?.length || 0 : (data as string[][][])[0][0]?.length || 0;
  const is2D = depth === 1;
  const dirs2D: Direction2D[] = ["north", "south", "east", "west"];
  const dirs3D: Direction3D[] = ["north", "south", "east", "west", "up", "down"];

  for (let z = 0; z < (is2D ? 1 : depth); z++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const currentTile = is2D ? (data as string[][])[y][x] : (data as string[][][])[z][y][x];
        const directions = is2D ? dirs2D : dirs3D;
        for (const direction of directions) {
          const neighborPos = is2D
            ? getNeighborPosition2D({ x, y }, direction as Direction2D)
            : getNeighborPosition3D({ x, y, z }, direction as Direction3D);
          const isValid = is2D
            ? isValidPosition2D(neighborPos as Position2D, width, height)
            : isValidPosition3D(neighborPos as Position3D, width, height, depth);
          if (isValid) {
            const n = neighborPos as Position2D & Position3D;
            const neighborTile = is2D ? (data as string[][])[n.y][n.x] : (data as string[][][])[n.z][n.y][n.x];
            constraints.push({
              tile1: currentTile,
              tile2: neighborTile,
              direction: direction as Direction2D | Direction3D,
            });
          }
        }
      }
    }
  }
  return constraints;
}

/**
 * Get neighbor position in 2D
 *
 * @param pos Current position
 * @param direction Direction to move
 * @returns Neighbor position
 * @example
 * const neighbor = getNeighborPosition2D({ x: 5, y: 5 }, 'north');
 */
function getNeighborPosition2D(pos: Position2D, direction: Direction2D): Position2D {
  const offsets: Record<Direction2D, Position2D> = {
    north: { x: 0, y: -1 },
    south: { x: 0, y: 1 },
    east: { x: 1, y: 0 },
    west: { x: -1, y: 0 },
  };
  const offset = offsets[direction] || { x: 0, y: 0 };
  return { x: pos.x + offset.x, y: pos.y + offset.y };
}

/**
 * Get neighbor position in 3D
 *
 * @param pos Current position
 * @param direction Direction to move
 * @returns Neighbor position
 * @example
 * const neighbor = getNeighborPosition3D({ x: 5, y: 5, z: 2 }, 'up');
 */
function getNeighborPosition3D(pos: Position3D, direction: Direction3D): Position3D {
  const offsets: Record<Direction3D, Position3D> = {
    north: { x: 0, y: -1, z: 0 },
    south: { x: 0, y: 1, z: 0 },
    east: { x: 1, y: 0, z: 0 },
    west: { x: -1, y: 0, z: 0 },
    up: { x: 0, y: 0, z: 1 },
    down: { x: 0, y: 0, z: -1 },
  };
  const offset = offsets[direction] || { x: 0, y: 0, z: 0 };
  return { x: pos.x + offset.x, y: pos.y + offset.y, z: pos.z + offset.z };
}

/**
 * Check if 2D position is valid
 *
 * @param pos Position to check
 * @param width Grid width
 * @param height Grid height
 * @returns True if position is valid
 * @example
 * const isValid = isValidPosition2D({ x: 5, y: 5 }, 10, 10);
 */
function isValidPosition2D(pos: Position2D, width: number, height: number): boolean {
  return pos.x >= 0 && pos.x < width && pos.y >= 0 && pos.y < height;
}

/**
 * Check if 3D position is valid
 *
 * @param pos Position to check
 * @param width Grid width
 * @param height Grid height
 * @param depth Grid depth
 * @returns True if position is valid
 * @example
 * const isValid = isValidPosition3D({ x: 5, y: 5, z: 2 }, 10, 10, 5);
 */
function isValidPosition3D(pos: Position3D, width: number, height: number, depth: number): boolean {
  return pos.x >= 0 && pos.x < width && pos.y >= 0 && pos.y < height && pos.z >= 0 && pos.z < depth;
}

/**
 * Get constraint key for deduplication
 *
 * @param constraint Constraint
 * @returns Unique key
 * @example
 * const key = getConstraintKey({ tile1: 'A', tile2: 'B', direction: 'east' });
 */
function getConstraintKey(constraint: Constraint): string {
  return `${constraint.tile1}-${constraint.tile2}-${constraint.direction}`;
}

/**
 * Validate constraints
 *
 * @param constraints Array of constraints
 * @param tiles Available tiles
 * @returns True if all constraints are valid
 * @example
 * const isValid = validateConstraints(constraints, tiles);
 */
export function validateConstraints(constraints: Constraint[], tiles: Tile[]): boolean {
  const tileIds = new Set(tiles.map(t => t.id));
  return constraints.every(c => tileIds.has(c.tile1) && tileIds.has(c.tile2));
}

/**
 * Generate constraints from 2D/3D sockets present in tiles.
 * If tiles provide sockets2D or sockets3D, derive directional adjacency rules.
 *
 * @param tiles Array of tiles with socket definitions
 * @returns Array of constraints derived from sockets
 * @example
 * const constraints = generateConstraintsFromSockets(tiles);
 */
export function generateConstraintsFromSockets(tiles: Tile[]): Constraint[] {
  const constraints: Constraint[] = [];
  const dirs2D: Array<[keyof NonNullable<Tile["sockets2D"]>, keyof NonNullable<Tile["sockets2D"]>, Direction2D]> = [
    ["east", "west", "east"],
    ["west", "east", "west"],
    ["north", "south", "north"],
    ["south", "north", "south"],
  ];
  const faces3D: Array<[keyof NonNullable<Tile["sockets3D"]>, keyof NonNullable<Tile["sockets3D"]>, Direction3D]> = [
    ["px", "nx", "east"],
    ["nx", "px", "west"],
    ["py", "ny", "up"],
    ["ny", "py", "down"],
    ["pz", "nz", "south"],
    ["nz", "pz", "north"],
  ];

  for (const t of tiles) {
    if (t.sockets2D) {
      for (const [socketA, socketB, dir] of dirs2D) {
        const sa = t.sockets2D[socketA];
        if (sa)
          for (const u of tiles)
            if (u.sockets2D?.[socketB] === sa) constraints.push({ tile1: t.id, tile2: u.id, direction: dir });
      }
    }
    if (t.sockets3D) {
      for (const [faceA, faceB, dir] of faces3D) {
        const sa = t.sockets3D[faceA];
        if (sa)
          for (const u of tiles) {
            const sb = u.sockets3D?.[faceB];
            if (sb && socketsAreCompatible(sa, sb, dir)) constraints.push({ tile1: t.id, tile2: u.id, direction: dir });
          }
      }
    }
  }
  return constraints;
}

/**
 * Basic socket compatibility check per Marian's connector idea
 *
 * @param a First socket
 * @param b Second socket
 * @param _dir Direction (currently unused)
 * @returns True if sockets are compatible
 * @example
 * const compatible = socketsAreCompatible(socketA, socketB, 'east');
 */
function socketsAreCompatible(a: Socket3D, b: Socket3D, _dir: Direction3D): boolean {
  if (a.id !== b.id) return false;
  // Horizontal faces may require flip matching; vertical faces may require same rotationIndex.
  // Keep minimal rule-set: identical rotationIndex unless one is rotInv; flip pairs must not both be "noflip" vs "flip" unless symmetric.
  const isRotInv = a.symmetry === "rotInv" || b.symmetry === "rotInv";
  const isSymmetric = a.symmetry === "symmetric" || b.symmetry === "symmetric";
  return (isRotInv || a.rotationIndex === b.rotationIndex) && (isSymmetric || a.symmetry === b.symmetry);
}

/**
 * Filter constraints by tile
 *
 * @param constraints Array of constraints
 * @param tileId Tile ID to filter by
 * @returns Filtered constraints
 * @example
 * const filtered = filterConstraintsByTile(constraints, 'tile-1');
 */
export function filterConstraintsByTile(constraints: Constraint[], tileId: string): Constraint[] {
  return constraints.filter(c => c.tile1 === tileId || c.tile2 === tileId);
}

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
export function getConstraintsForTileAndDirection(
  constraints: Constraint[],
  tileId: string,
  direction: string
): Constraint[] {
  return constraints.filter(c => c.tile1 === tileId && c.direction === direction);
}

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
export function getAllowedTilesForDirection(constraints: Constraint[], tileId: string, direction: string): string[] {
  const matchingConstraints = getConstraintsForTileAndDirection(constraints, tileId, direction);
  return matchingConstraints.map(c => c.tile2);
}

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
export function areTilesCompatible(
  constraints: Constraint[],
  tile1: string,
  tile2: string,
  direction: string
): boolean {
  return constraints.some(c => c.tile1 === tile1 && c.tile2 === tile2 && c.direction === direction);
}
