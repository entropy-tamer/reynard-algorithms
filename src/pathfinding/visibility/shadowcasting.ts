/**
 * @file Shadowcasting Field of View (FOV)
 * Simple permissive shadowcasting implementation suitable for grid-based games.
 */

export type VisibilityMap = Map<string, boolean>;

/**
 * Compute a visibility map using permissive shadowcasting.
 *
 * @param origin The origin cell
 * @param origin.x X coordinate of origin
 * @param origin.y Y coordinate of origin
 * @param radius Maximum distance to evaluate
 * @param isTransparent Predicate that returns true if a cell does not block vision
 * @returns Map keyed by "x,y" with boolean visibility values
 * @example
 * const vis = shadowcastingFOV({ x: 5, y: 5 }, 8, (x,y) => grid[y][x] !== 'wall')
 */
export function shadowcastingFOV(
  origin: { x: number; y: number },
  radius: number,
  isTransparent: (x: number, y: number) => boolean
): VisibilityMap {
  const visible = new Map<string, boolean>();
  visible.set(`${origin.x},${origin.y}`, true);

  for (let octant = 0; octant < 8; octant++) {
    castShadow(origin, radius, octant, isTransparent, visible);
  }

  return visible;
}

/**
 * Cast shadows for a given octant and accumulate visible tiles.
 *
 * @param origin The origin cell
 * @param origin.x X coordinate of origin
 * @param origin.y Y coordinate of origin
 * @param radius Maximum distance
 * @param octant Octant index [0..7]
 * @param isTransparent Transparency predicate
 * @param visible Accumulator map
 */
function castShadow(
  origin: { x: number; y: number },
  radius: number,
  octant: number,
  isTransparent: (x: number, y: number) => boolean,
  visible: VisibilityMap
): void {
  for (let row = 1; row <= radius; row++) {
    let startSlope = -1;
    let endSlope = 1;

    for (let col = 0; col <= row; col++) {
      const [x, y] = transformOctant(origin.x, origin.y, col, row, octant);

      const distance = Math.sqrt(col * col + row * row);
      if (distance > radius) continue;

      const slope = row === 0 ? 0 : col / row;

      if (slope >= startSlope && slope <= endSlope) {
        visible.set(`${x},${y}`, true);

        if (!isTransparent(x, y)) {
          if (slope < endSlope) endSlope = slope;
        } else {
          if (slope > startSlope) startSlope = slope;
        }
      }
    }
  }
}

/**
 * Transform local (col,row) into global coordinates for the given octant.
 *
 * @param originX Origin X
 * @param originY Origin Y
 * @param col Local column (x)
 * @param row Local row (y)
 * @param octant Octant index [0..7]
 * @returns Transformed [x, y]
 */
function transformOctant(
  originX: number,
  originY: number,
  col: number,
  row: number,
  octant: number
): [number, number] {
  switch (octant) {
    case 0: return [originX + col, originY - row];
    case 1: return [originX + row, originY - col];
    case 2: return [originX + row, originY + col];
    case 3: return [originX + col, originY + row];
    case 4: return [originX - col, originY + row];
    case 5: return [originX - row, originY + col];
    case 6: return [originX - row, originY - col];
    case 7: return [originX - col, originY - row];
    default: return [originX + col, originY - row];
  }
}


