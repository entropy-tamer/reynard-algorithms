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
export declare function shadowcastingFOV(origin: {
    x: number;
    y: number;
}, radius: number, isTransparent: (x: number, y: number) => boolean): VisibilityMap;
//# sourceMappingURL=shadowcasting.d.ts.map