/**
 * Grid line of sight and fog of war for small deterministic boards.
 *
 * The chase fields this serves are tens of cells across, so a direct line test per
 * candidate costs less than the bookkeeping a full shadowcast needs. The rule that
 * matters is shared by both entry points: a cell is seen only when every cell the
 * ray crosses is transparent, and a diagonal may not slip between two opaque
 * corners. Explored memory is an array the caller can carry between frames.
 *
 * Guide: docs/guides/field-of-view.md
 */

export interface VisionCell {
    readonly x: number;
    readonly y: number;
}

export interface VisionGrid {
    readonly width: number;
    readonly height: number;
    /** Opaque ground: a wall, or in a chase field, a cell no sprite can stand in. */
    isOpaque(x: number, y: number): boolean;
}

export interface FieldOfView {
    readonly width: number;
    readonly height: number;
    /** 1 for cells lit in this frame. */
    readonly visible: Uint8Array;
    /** 1 for cells lit now or in any frame represented by `explored`. */
    readonly explored: Uint8Array;
    isVisible(x: number, y: number): boolean;
    isExplored(x: number, y: number): boolean;
}

function inside(grid: VisionGrid, x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < grid.width && y < grid.height;
}

/** Out-of-board space is opaque, so rays stop at the boundary. */
export function isOpaqueAt(grid: VisionGrid, x: number, y: number): boolean {
    return !inside(grid, x, y) || grid.isOpaque(x, y);
}

/**
 * Walk a Bresenham line and report every cell after the origin.
 *
 * Diagonal steps expose both corners they pass between; `hasLineOfSight` treats
 * two opaque corners as a closed gap.
 */
export interface LineStep extends VisionCell {
    readonly fromX: number;
    readonly fromY: number;
}

export function* lineCells(from: VisionCell, to: VisionCell): Generator<LineStep> {
    let x = from.x;
    let y = from.y;
    const dx = Math.abs(to.x - x);
    const dy = Math.abs(to.y - y);
    const stepX = x < to.x ? 1 : -1;
    const stepY = y < to.y ? 1 : -1;
    let error = dx - dy;
    while (x !== to.x || y !== to.y) {
        const doubled = 2 * error;
        const fromX = x;
        const fromY = y;
        if (doubled > -dy) {
            error -= dy;
            x += stepX;
        }
        if (doubled < dx) {
            error += dx;
            y += stepY;
        }
        yield { x, y, fromX, fromY };
    }
}

/** Direct sight between two cells. The target itself may be opaque. */
export function hasLineOfSight(
    grid: VisionGrid,
    from: VisionCell,
    to: VisionCell,
): boolean {
    if (!inside(grid, from.x, from.y) || !inside(grid, to.x, to.y)) return false;
    if (from.x === to.x && from.y === to.y) return true;
    for (const step of lineCells(from, to)) {
        const last = step.x === to.x && step.y === to.y;
        const diagonal = step.x !== step.fromX && step.y !== step.fromY;
        if (diagonal) {
            const sideA = isOpaqueAt(grid, step.x, step.fromY);
            const sideB = isOpaqueAt(grid, step.fromX, step.y);
            if (sideA && sideB) return false;
        }
        if (!last && isOpaqueAt(grid, step.x, step.y)) return false;
    }
    return true;
}

function index(width: number, x: number, y: number): number {
    return y * width + x;
}

function read(flag: Uint8Array | undefined, width: number, x: number, y: number): boolean {
    return flag !== undefined && flag[index(width, x, y)] === 1;
}

/**
 * Compute what `origin` can see in this frame and what it has ever seen.
 *
 * `explored` is copied, never mutated: a caller that keeps memory across ticks
 * passes the previous array and gets a new one, so a redraw cannot rewrite history.
 */
export function computeFov(
    grid: VisionGrid,
    origin: VisionCell,
    radius: number,
    explored?: Uint8Array,
): FieldOfView {
    const size = grid.width * grid.height;
    const lit = new Uint8Array(size);
    const memory = new Uint8Array(size);
    if (explored !== undefined) memory.set(explored.subarray(0, Math.min(explored.length, size)));

    if (inside(grid, origin.x, origin.y) && radius >= 0) {
        const steps = Math.floor(radius);
        const reach = steps * steps;
        // A terminal field can be tens of thousands of cells. Walk only the square
        // the radius can reach; scanning the whole board once per fox per tick is
        // the sort of cost that hides in a profile and never in a unit test.
        const minY = Math.max(0, origin.y - steps);
        const maxY = Math.min(grid.height - 1, origin.y + steps);
        const minX = Math.max(0, origin.x - steps);
        const maxX = Math.min(grid.width - 1, origin.x + steps);
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const distance = (x - origin.x) ** 2 + (y - origin.y) ** 2;
                if (distance > reach) continue;
                if (!hasLineOfSight(grid, origin, { x, y })) continue;
                lit[index(grid.width, x, y)] = 1;
                memory[index(grid.width, x, y)] = 1;
            }
        }
    }

    return {
        width: grid.width,
        height: grid.height,
        visible: lit,
        explored: memory,
        isVisible: (x, y) => read(lit, grid.width, x, y),
        isExplored: (x, y) => read(memory, grid.width, x, y),
    };
}
