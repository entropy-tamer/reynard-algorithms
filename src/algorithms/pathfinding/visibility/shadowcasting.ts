/**
 * @file Shadowcasting Field of View (FOV)
 * Recursive shadowcasting implementation for grid-based games.
 *
 * Each octant is scanned row by row from the origin outward. Slope bounds
 * (start/end) are maintained ACROSS rows via recursion: when an opaque cell
 * narrows the view, the sub-scan beyond that row continues with the narrowed
 * band, so shadows persist. Octants are disjoint transforms, so no cell is
 * visited by two octants (no bleed).
 */

export type VisibilityMap = Map<string, boolean>;

/** Multiplier table mapping local (col,row) space to each of the 8 octants.
 * Classic recursive-shadowcasting transform (RogueBasin reference):
 *   X = cx + col * xx + row * xy
 *   Y = cy + col * yx + row * yy
 * where row >= 1 is scan depth and col in [-row, 0] is the lateral offset.
 */
const MULTS: ReadonlyArray<readonly [number, number, number, number]> = [
  [1, 0, 0, -1],
  [0, 1, 1, 0],
  [0, -1, 1, 0],
  [-1, 0, 0, 1],
  [-1, 0, 0, -1],
  [0, -1, -1, 0],
  [0, 1, -1, 0],
  [1, 0, 0, 1],
];

/**
 * Compute a visibility map using recursive shadowcasting.
 *
 * Opaque cells block vision for everything directly behind them (relative to
 * the origin) but are themselves marked visible — you can see walls.
 *
 * @param origin The origin cell
 * @param origin.x X coordinate of origin
 * @param origin.y Y coordinate of origin
 * @param radius Maximum Euclidean distance to evaluate
 * @param isTransparent Predicate that returns true if a cell does not block vision.
 *   Only called with cells whose squared distance from origin is <= radius².
 * @returns Map keyed by "x,y" with boolean visibility values
 * @example
 * const vis = shadowcastingFOV({ x: 5, y: 5 }, 8, (x,y) => grid[y][x] !== 'wall')
 */
export function shadowcastingFOV(
  origin: { x: number; y: number },
  radius: number,
  isTransparent: (x: number, y: number) => boolean
): VisibilityMap {
  const visible: VisibilityMap = new Map();
  visible.set(`${origin.x},${origin.y}`, true);

  if (radius < 1) return visible;

  for (const [xx, xy, yx, yy] of MULTS) {
    castLight(origin.x, origin.y, 1, 1.0, 0.0, radius, xx, xy, yx, yy, isTransparent, visible);
  }

  return visible;
}

/**
 * Recursively light one slope-band of an octant, starting at `row` and going
 * out to `radius`.
 *
 * Local space: row = scan depth (>= 1), deltaX in [-row, 0]. Slopes:
 *   leftSlope  = (deltaX - 0.5) / (-row + 0.5)
 *   rightSlope = (deltaX + 0.5) / (-row - 0.5)
 * A cell is lit iff its [rightSlope, leftSlope] interval intersects [end, start].
 */
function castLight(
  cx: number,
  cy: number,
  row: number,
  start: number,
  end: number,
  radius: number,
  xx: number,
  xy: number,
  yx: number,
  yy: number,
  isTransparent: (x: number, y: number) => boolean,
  visible: VisibilityMap
): void {
  if (start < end) return;

  let newStart = 0;
  let blocked = false;

  for (let distance = row; distance <= radius && !blocked; distance++) {
    const deltaY = -distance;
    for (let deltaX = -distance; deltaX <= 0; deltaX++) {
      const currentX = cx + deltaX * xx + distance * xy;
      const currentY = cy + deltaX * yx + distance * yy;

      // Skip cells outside the Euclidean disk without consulting the
      // transparency predicate (it only receives in-range coordinates).
      if (deltaX * deltaX + deltaY * deltaY > radius * radius + 1e-9) continue;

      const leftSlope = (deltaX - 0.5) / (deltaY + 0.5);
      const rightSlope = (deltaX + 0.5) / (deltaY - 0.5);

      if (start < rightSlope) continue;
      if (end > leftSlope) break;

      visible.set(`${currentX},${currentY}`, true);

      if (blocked) {
        // We're inside a shadow band; keep scanning until we find a gap.
        if (!isTransparent(currentX, currentY)) {
          newStart = leftSlope;
          continue;
        }
        // Gap found: resume lighting from the wall's trailing edge.
        blocked = false;
        start = newStart;
      } else {
        if (!isTransparent(currentX, currentY) && distance < radius) {
          // First opaque cell in the lit band: recurse into its shadow with
          // the narrowed band, then remember this edge as the new start.
          blocked = true;
          castLight(cx, cy, distance + 1, start, leftSlope, radius, xx, xy, yx, yy, isTransparent, visible);
          newStart = leftSlope;
        }
      }
    }
  }
}
