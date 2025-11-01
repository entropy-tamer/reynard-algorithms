/**
 * @file Wave Function Collapse constraint derivation and validation helpers
 */
/* eslint-disable max-lines, max-lines-per-function, @typescript-eslint/no-explicit-any, jsdoc/require-param, jsdoc/require-returns, @typescript-eslint/no-unused-vars */
/**
 * Wave Function Collapse Constraint Operations
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
 */
export function generateConstraintsFromPatterns(
  patterns: Pattern[]
): Constraint[] {
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
 */
function extractConstraintsFromPattern(pattern: Pattern): Constraint[] {
  const constraints: Constraint[] = [];
  const data: any = (pattern as any).data;
  const depth = Array.isArray(data[0]?.[0]) ? (data as string[][][]).length : 1;
  const height = depth === 1 ? (data as string[][]).length : (data as string[][][])[0].length;
  const width = depth === 1 ? (data as string[][])[0]?.length || 0 : (data as string[][][])[0][0]?.length || 0;

  if (depth === 1) {
    // 2D pattern
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const currentTile = data[y][x];
        
        // Check all 4 directions
        const directions: Direction2D[] = ['north', 'south', 'east', 'west'];
        for (const direction of directions) {
          const neighborPos = getNeighborPosition2D({ x, y }, direction);
          if (isValidPosition2D(neighborPos, width, height)) {
            const neighborTile = data[neighborPos.y][neighborPos.x];
            constraints.push({
              tile1: currentTile,
              tile2: neighborTile,
              direction: direction as any,
            });
          }
        }
      }
    }
  } else {
    // 3D pattern
    for (let z = 0; z < depth; z++) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const currentTile = data[z][y][x];
          
          // Check all 6 directions
          const directions: Direction3D[] = ['north', 'south', 'east', 'west', 'up', 'down'];
          for (const direction of directions) {
            const neighborPos = getNeighborPosition3D({ x, y, z }, direction);
            if (isValidPosition3D(neighborPos, width, height, depth)) {
              const neighborTile = data[neighborPos.z][neighborPos.y][neighborPos.x];
              constraints.push({
                tile1: currentTile,
                tile2: neighborTile,
                direction: direction as any,
              });
            }
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
 */
function getNeighborPosition2D(pos: Position2D, direction: Direction2D): Position2D {
  switch (direction) {
    case 'north':
      return { x: pos.x, y: pos.y - 1 };
    case 'south':
      return { x: pos.x, y: pos.y + 1 };
    case 'east':
      return { x: pos.x + 1, y: pos.y };
    case 'west':
      return { x: pos.x - 1, y: pos.y };
    default:
      return pos;
  }
}

/**
 * Get neighbor position in 3D
 *
 * @param pos Current position
 * @param direction Direction to move
 * @returns Neighbor position
 */
function getNeighborPosition3D(pos: Position3D, direction: Direction3D): Position3D {
  switch (direction) {
    case 'north':
      return { x: pos.x, y: pos.y - 1, z: pos.z };
    case 'south':
      return { x: pos.x, y: pos.y + 1, z: pos.z };
    case 'east':
      return { x: pos.x + 1, y: pos.y, z: pos.z };
    case 'west':
      return { x: pos.x - 1, y: pos.y, z: pos.z };
    case 'up':
      return { x: pos.x, y: pos.y, z: pos.z + 1 };
    case 'down':
      return { x: pos.x, y: pos.y, z: pos.z - 1 };
    default:
      return pos;
  }
}

/**
 * Check if 2D position is valid
 *
 * @param pos Position to check
 * @param width Grid width
 * @param height Grid height
 * @returns True if position is valid
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
 */
function isValidPosition3D(pos: Position3D, width: number, height: number, depth: number): boolean {
  return pos.x >= 0 && pos.x < width && 
         pos.y >= 0 && pos.y < height && 
         pos.z >= 0 && pos.z < depth;
}

/**
 * Get constraint key for deduplication
 *
 * @param constraint Constraint
 * @returns Unique key
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
 */
export function validateConstraints(constraints: Constraint[], tiles: Tile[]): boolean {
  const tileIds = new Set(tiles.map(t => t.id));
  
  for (const constraint of constraints) {
    if (!tileIds.has(constraint.tile1) || !tileIds.has(constraint.tile2)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Generate constraints from 2D/3D sockets present in tiles.
 * If tiles provide sockets2D or sockets3D, derive directional adjacency rules.
 */
export function generateConstraintsFromSockets(tiles: Tile[]): Constraint[] {
  const constraints: Constraint[] = [];
  const byId = new Map<string, Tile>();
  for (const t of tiles) byId.set(t.id, t);

  // 2D sockets
  for (const t of tiles) {
    if (t.sockets2D) {
      const s = t.sockets2D;
      if (s.east)
        for (const u of tiles) if (u.sockets2D?.west === s.east) constraints.push({ tile1: t.id, tile2: u.id, direction: "east" });
      if (s.west)
        for (const u of tiles) if (u.sockets2D?.east === s.west) constraints.push({ tile1: t.id, tile2: u.id, direction: "west" });
      if (s.north)
        for (const u of tiles) if (u.sockets2D?.south === s.north) constraints.push({ tile1: t.id, tile2: u.id, direction: "north" });
      if (s.south)
        for (const u of tiles) if (u.sockets2D?.north === s.south) constraints.push({ tile1: t.id, tile2: u.id, direction: "south" });
    }
  }

  // 3D sockets
  const faces: Array<[keyof NonNullable<Tile["sockets3D"]>, keyof NonNullable<Tile["sockets3D"]>, Direction3D]> = [
    ["px", "nx", "east"], ["nx", "px", "west"], ["py", "ny", "up"], ["ny", "py", "down"], ["pz", "nz", "south"], ["nz", "pz", "north"],
  ];

  for (const t of tiles) {
    if (!t.sockets3D) continue;
    for (const [faceA, faceB, dir] of faces) {
      const sa = t.sockets3D[faceA];
      if (!sa) continue;
      for (const u of tiles) {
        const sb = u.sockets3D?.[faceB];
        if (!sb) continue;
        if (socketsAreCompatible(sa, sb, dir)) {
          constraints.push({ tile1: t.id, tile2: u.id, direction: dir });
        }
      }
    }
  }

  return constraints;
}

/** Basic socket compatibility check per Marian's connector idea */
function socketsAreCompatible(a: Socket3D, b: Socket3D, _dir: Direction3D): boolean {
  if (a.id !== b.id) return false;
  // Horizontal faces may require flip matching; vertical faces may require same rotationIndex.
  // Keep minimal rule-set: identical rotationIndex unless one is rotInv; flip pairs must not both be "noflip" vs "flip" unless symmetric.
  const rotOk = a.symmetry === "rotInv" || b.symmetry === "rotInv" || a.rotationIndex === b.rotationIndex;
  const flipOk = a.symmetry === "symmetric" || b.symmetry === "symmetric" || a.symmetry === b.symmetry;
  return rotOk && flipOk;
}

/**
 * Filter constraints by tile
 *
 * @param constraints Array of constraints
 * @param tileId Tile ID to filter by
 * @returns Filtered constraints
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
 */
export function getConstraintsForTileAndDirection(
  constraints: Constraint[],
  tileId: string,
  direction: string
): Constraint[] {
  return constraints.filter(c => 
    c.tile1 === tileId && c.direction === direction
  );
}

/**
 * Get allowed tiles for specific tile and direction
 *
 * @param constraints Array of constraints
 * @param tileId Tile ID
 * @param direction Direction
 * @returns Array of allowed tile IDs
 */
export function getAllowedTilesForDirection(
  constraints: Constraint[],
  tileId: string,
  direction: string
): string[] {
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
 */
export function areTilesCompatible(
  constraints: Constraint[],
  tile1: string,
  tile2: string,
  direction: string
): boolean {
  return constraints.some(c => 
    c.tile1 === tile1 && c.tile2 === tile2 && c.direction === direction
  );
}

