/**
 * @file Content-aware column width apportionment.
 * @module layout/column-sizing
 *
 * A fixed table layout gives each column a percentage. That works until one
 * cell holds an unbreakable token -- a status badge, a commit SHA, a long
 * identifier -- wider than the slice it was assigned. The token paints past
 * its cell and collides with the next column, which is the visual defect this
 * module exists to prevent.
 *
 * The fix is to treat a measured content width as a floor on the column's
 * percentage, then borrow the added space from columns with slack. Everything
 * here is pure and deterministic: no DOM, no measurement, no randomness. A
 * caller measures its own cells and hands over pixel floors. All arithmetic
 * runs in integer 1/100-percent units so a visible column set always sums to
 * exactly 100 without rounding drift.
 *
 * If the floors themselves exceed the container, no amount of borrowing can
 * help. The widths stay at their floors and `overflowPx` reports the shortfall;
 * the caller's horizontal scroller then does the rest. A table must never
 * silently shrink a column below its content to make a number look tidy.
 */

/** One column as the apportioner needs to see it. */
export interface SizedColumn {
    /** Stable identity, used in the diagnostic list of raised columns. */
    readonly key: string;
    /** Declared percentage width. */
    readonly width: number;
    /** Minimum content width in CSS pixels, excluding the gutter. */
    readonly minWidthPx?: number;
    /** When false, this column donates space only after resizable ones run out. */
    readonly resizable?: boolean;
}

/** Constraints for one apportionment pass. */
export interface FitColumnsOptions {
    /** Measured width of the table in CSS pixels. */
    readonly containerPx: number;
    /** Space reserved around each column's content, in CSS pixels. Default 0. */
    readonly gutterPx?: number;
    /** Smallest share any column may take, in percent. Default 4. */
    readonly floorPct?: number;
    /** Largest share any column may take, in percent. Default 80. */
    readonly ceilPct?: number;
}

/** Result of one apportionment pass. */
export interface FitColumnsResult {
    /** Adjusted percentages, aligned with the input columns. */
    readonly widths: readonly number[];
    /** Positive when the floors cannot fit; 0 otherwise. */
    readonly overflowPx: number;
    /** Keys raised to a content floor, for diagnostics and tests. */
    readonly raised: readonly string[];
}

/** One hundredth of a percent; 10,000 units is the whole table. */
const SCALE = 10_000;

const finitePositive = (value: unknown): value is number =>
    typeof value === "number" && Number.isFinite(value) && value > 0;

const pctToUnits = (pct: number): number =>
    Math.min(SCALE, Math.max(0, Math.round((Number.isFinite(pct) ? pct : 0) * 100)));

/** Largest-remainder apportionment to integer 1/100-percent units. */
function apportion(widths: readonly number[]): number[] {
    if (widths.length === 0) return [];
    const clean = widths.map((value) => (finitePositive(value) ? value : 0));
    const total = clean.reduce((sum, value) => sum + value, 0);
    if (total <= 0) return clean.map(() => 0);
    const exact = clean.map((value) => (value / total) * SCALE);
    const units = exact.map((value) => Math.floor(value));
    let remaining = SCALE - units.reduce((sum, value) => sum + value, 0);
    const byFraction = exact
        .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
        .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
    for (const { index } of byFraction) {
        if (remaining <= 0) break;
        units[index] += 1;
        remaining -= 1;
    }
    for (let index = 0; remaining > 0; index = (index + 1) % units.length) {
        units[index] += 1;
        remaining -= 1;
    }
    return units;
}

/**
 * Convert a measured content width into the smallest percentage that holds it.
 * Returns `floorPct` when the measurement is missing or the container is not a
 * positive finite number, so an unmeasured column behaves exactly as before.
 */
export function contentFloorPct(
    minWidthPx: number | undefined,
    containerPx: number,
    gutterPx = 0,
    floorPct = 4,
    ceilPct = 80,
): number {
    if (!finitePositive(minWidthPx) || !finitePositive(containerPx)) return floorPct;
    const pct = (100 * (minWidthPx + Math.max(0, gutterPx))) / containerPx;
    return Math.min(ceilPct, Math.max(floorPct, pct));
}

/**
 * Fit declared widths to measured content floors.
 *
 * Declared widths are normalized to 100 first. Any column below its floor is
 * raised; the deficit is taken from columns with the most slack, resizable
 * ones first. When no donor has slack the widths stay floored and the excess
 * is reported as `overflowPx` rather than hidden.
 */
export function fitColumnsToContent(
    columns: readonly SizedColumn[],
    options: FitColumnsOptions,
): FitColumnsResult {
    if (columns.length === 0) return { widths: [], overflowPx: 0, raised: [] };
    const { containerPx } = options;
    const gutterPx = Math.max(0, options.gutterPx ?? 0);
    const floorU = pctToUnits(options.floorPct ?? 4);
    const ceilU = pctToUnits(options.ceilPct ?? 80);
    const units = apportion(columns.map((column) => column.width));

    const minU = columns.map((column) => {
        if (!finitePositive(column.minWidthPx) || !finitePositive(containerPx)) return floorU;
        const pct = (100 * (column.minWidthPx + gutterPx)) / containerPx;
        return Math.min(ceilU, Math.max(floorU, Math.round(pct * 100)));
    });

    const raised: string[] = [];
    let deficit = 0;
    for (let index = 0; index < units.length; index += 1) {
        if (units[index] < minU[index]) {
            deficit += minU[index] - units[index];
            units[index] = minU[index];
            raised.push(columns[index].key);
        }
    }

    // Take from the roomiest resizable column first, then from any column with
    // slack. The second pass exists so a content floor always wins over a
    // caller's `resizable: false`, which only governs deliberate user drags.
    let remaining = deficit;
    while (remaining > 0) {
        const pick = (resizableOnly: boolean) => {
            let best = -1;
            let bestSlack = 0;
            for (let index = 0; index < columns.length; index += 1) {
                if (resizableOnly && columns[index].resizable === false) continue;
                const slack = units[index] - minU[index];
                if (slack > bestSlack) {
                    bestSlack = slack;
                    best = index;
                }
            }
            return { best, bestSlack };
        };
        let donor = pick(true);
        if (donor.best === -1) donor = pick(false);
        if (donor.best === -1) break;
        const give = Math.min(remaining, donor.bestSlack);
        units[donor.best] -= give;
        remaining -= give;
    }

    return {
        widths: units.map((value) => value / 100),
        overflowPx: finitePositive(containerPx) ? (remaining / SCALE) * containerPx : 0,
        raised,
    };
}
