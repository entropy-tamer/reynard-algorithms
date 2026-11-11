import { mulberry32 } from "../../../utils/prng/mulberry32";

/**
 * Density-of-gas fire, as a pure state machine.
 *
 * No theme imports and no TUI: this module owns the simulation and the glyph
 * packing, and the caller owns colour. That split is deliberate -- it makes the
 * animation testable without a terminal, and it keeps the one expensive thing
 * (the buffer) free of anything that could go stale.
 *
 * It lives in this package because the picture lives here: the terminal's lock
 * screen, the `r` command's splash screen and the site's `/r` page all draw
 * the same flame, and there is one simulation.
 *
 * The vertical resolution comes from the glyph, not from the buffer: braille
 * gives four sub-rows per terminal cell (`BRAILLE_GEOMETRY`), so a 50-row
 * frame is a 200-row fire at no extra byte cost. One SGR foreground per cell
 * colours every lit sub-pixel in it, which is what keeps the cost at 24 B/cell
 * instead of the 48 B/cell a half-block `▀` would need.
 *
 * Braille rather than sextants or octants: same 2x4 sub-grid, but U+2800 has
 * universal font coverage where the exotic tables do not, and single-unit in
 * `String.length`, so it cannot trip the codepoint-vs-cell width trap.
 */

/**
 * Sub-rows per terminal cell.
 *
 * Braille is four rows tall, and the fire's vertical resolution IS the glyph's
 * resolution, so this is braille's geometry and not a number of its own.
 */
export const SUB_ROWS = 4;

/** Sub-columns per terminal cell. Braille is 2 wide, like every pixel table. */
const SUB_COLS = 2;

/** Intensity scale. 64 steps is enough resolution to quantise a ramp onto. */
export const MAX_INTENSITY = 64;

/**
 * Sub-rows a parcel of heat climbs per frame.
 *
 * **This constant replaced a decay term, and the reason is the whole redesign.**
 * The first version modelled the flame as pure diffusion -- each sub-row took
 * the average of itself and its neighbours and lost `DECAY`. Measured, that
 * produced a ~13-sub-row flame at *every* decay from 0.02 to 0.3, because
 * sideways diffusion bleeds heat away far faster than decay removes it. The
 * flame could not be made tall by tuning, only short.
 *
 * Diffusion is the wrong transport for fire. Diffusion is isotropic: it spreads
 * heat in all directions equally, so it makes a *blob*. A flame is a *plume*,
 * and a plume is directional -- heat goes up and mostly does not come back
 * down. Advection says so explicitly: each sub-row samples the one `RISE`
 * sub-rows below it, offset sideways by the wind. That buys a flame whose
 * height is a ratio you control (initial heat / COOLING, times RISE) instead of
 * an emergent property you can only observe.
 */
const RISE = 3.1;

/**
 * Heat lost per frame by a rising parcel.
 *
 * With advection, flame height in sub-rows is roughly `initialHeat / COOLING *
 * RISE`, so this and RISE are the two halves of one knob. Together they were
 * swept against measured flame depth across the three tier heights; see the
 * note for the table. The pair is deliberately the same shape of relationship
 * the old decay term had, except that now moving it actually moves the flame.
 */
const COOLING = 0.25;

/**
 * How much faster heat is lost the further it has risen from the fuel.
 *
 * Uniform cooling was the second half of why the first plume looked wrong.
 * A parcel loses the same heat per frame wherever it is, so the far field
 * survives as a wide, dim, slow-dying shelf -- measured as a flat band of
 * ramp-0 cells about 33 columns across sitting above the flame, which reads as
 * a horizontal bar rather than as the top of a fire.
 *
 * Real plumes entrain cold air continuously, so a rising parcel loses heat
 * faster the further it gets from its source. Modelling that is one extra term
 * and it is what lets the flame *end* crisply instead of smearing.
 */
const COOL_RAMP = 6;

/**
 * Sub-columns of sideways drift, at full amplitude.
 *
 * Fire does not rise in straight lines. The shear is what turns a rising
 * column into a licking tongue, and it is the difference between the old
 * output (a static symmetric blob) and anything that reads as a flame. Large
 * enough to be obvious, small enough that a tongue stays recognisable as it
 * bends -- past about 2 the plume shears past the point of looking like fire
 * and starts looking like noise being blown sideways.
 */
const TURBULENCE = 0.55;

/**
 * Sub-columns of random lateral scatter per frame, per cell.
 *
 * **This is what makes it fire rather than smoke.** The coherent wind above is
 * smooth and low-frequency, and smooth low-frequency transport produces
 * billows: measured, it smeared the plume into wide uniform blobs roughly the
 * width of the frame, because a steady lateral drift of even one sub-column
 * accumulates over the twenty-odd frames a parcel is aloft until the whole
 * plume has been blown sideways as far as it rose.
 *
 * Real flame is turbulent at the scale of its licks, not at the scale of its
 * eddies, so the dominant term has to be per-cell and per-frame. Over the same
 * twenty frames this random walk spreads a parcel only about two sub-columns --
 * fine licking texture rather than a sideways smear -- while the coherent wind
 * above still supplies the large-scale lean that makes different tongues tip
 * different ways.
 */
const LICK = 1.6;

/**
 * Sub-rows of fuel at the bottom of the buffer.
 *
 * **Thin on purpose, and this is the second half of the redesign.** The first
 * version seeded 15% of the *whole* buffer -- 30 of 200 sub-rows at the large
 * tier -- and the flame that resulted stood 32 sub-rows tall. Ninety-four
 * percent of the flame was therefore the seed bed, not fire: a 7-row horizontal
 * bar of near-maximum intensity sitting at the bottom of the frame.
 *
 * That is what "the white stuff" was. The ramp peaks at white, the bed is
 * uniformly hot, so the bed painted itself white -- 23% of every lit cell was
 * ramp 7 and a further 14% was ramp 6. No palette change fixes that, because
 * the problem is that there was no flame to look at: the bed *was* the fire.
 * A fuel bed a few sub-rows deep lets the advection above it do the work.
 */
const FUEL_ROWS = 4;

/**
 * Per-column fuel strength, and how fast it breathes.
 *
 * The envelope is a low-frequency wave along x so that neighbouring columns
 * draw similar fuel while distant ones differ: a per-cell random draw gives
 * grain, an envelope gives tongues of *different heights*, which is most of
 * what separates a flame from a glow. The time term is the flicker. Both are
 * sine rather than PRNG so the flame breathes instead of hisses.
 */
const FUEL_WAVELENGTH = 0.31;
const FLICKER_RATE = 0.09;
const FUEL_FLOOR = 0.55;

/**
 * Lateral drift at a point in the buffer.
 *
 * Two waves at deliberately different scales: a short, fast one for the fine
 * lick at a tongue's tip, and a long, slow one that carries a whole tongue
 * sideways. The `y` term in the second is a vertical shear -- the same column
 * leans further over as it rises, which is what stops the flame looking like it
 * was extruded from a slot.
 *
 * The short wave's frequency and time rate are both higher than the obvious
 * choice. A slow, long wave is a *standing* field: its wavelength sets a fixed
 * convergence pattern, heat piles into those bands, and the flame grows a flat
 * bar with a period equal to that wavelength. (Measured: `sin(x * 0.21)` has a
 * 30-column period, and the shelf that came out was 33 columns wide.) Fast
 * evolution is not decoration here -- it is what keeps the field from having a
 * fixed wavelength at all.
 */
function windAt(x: number, y: number, t: number): number {
    return (
        TURBULENCE *
        (Math.sin(x * 0.38 + t * 0.26) + 0.55 * Math.sin(x * 0.11 - t * 0.19 + y * 0.045))
    );
}

/**
 * Intensity at which a sub-row starts drawing a dot.
 *
 * Measured, not guessed. With 0 the flame base is a solid slab; the values in
 * between trade slab for height, since raising the threshold removes dots from
 * the fuel band and the flame gets shorter as well as sparser. The stored
 * golden was made at this value; see the note for the sweep.
 */
const LIT_THRESHOLD = 16;

/** A packed cell from the fox art: bit 5 is ink. */
const INK_BIT = 32;

/**
 * Bitmask for one sub-pixel of braille output.
 *
 * Braille dots are numbered down the left column first (1,2,3,7) then down the
 * right (4,5,6,8):
 *
 *     1 4        row 0
 *     2 5        row 1
 *     3 6        row 2
 *     7 8        row 3
 *
 * So the dot number is *not* a simple offset of the row -- the bottom row of
 * each column jumps, which is exactly why this is written as a table and not as
 * arithmetic. Derived from the chart, and checked against the real glyph table
 * in the unit tests: getting it wrong yields a flame that is subtly, silently
 * upside down, with no error anywhere.
 */
export function glyphDotBit(subCol: number, subRow: number): number {
    const DOT_NUMBERS = [
        [1, 2, 3, 7],
        [4, 5, 6, 8],
    ];
    const row = subRow < 0 || subRow > 3 ? 0 : subRow;
    const col = subCol === 0 ? 0 : 1;
    return 1 << (DOT_NUMBERS[col][row] - 1);
}

/**
 * Length of the quantised ramp. Small on purpose: fewer distinct indices make
 * the caller's run-length colouring emit fewer SGR pairs.
 *
 * There are no theme slots in this module. An earlier revision carried a
 * `FIRE_RAMP_SLOTS` table of slot names, which put a theme decision inside a
 * module that deliberately imports nothing but the braille geometry; and the
 * slot list was wrong anyway, opening on `error` for the coolest ember. The
 * caller now maps the index onto its own palette stops.
 */
export const RAMP_STEPS = 8;

/**
 * Intensity range the colour ramp spans.
 *
 * Measured, not assumed. With `LIT_THRESHOLD` at 16, the distribution of
 * intensities across lit cells is steeply decaying -- 55% of them land in
 * 16-23 and only 0.4% reach 56-63. So a ramp anchored at 0 and ending at 64
 * spends four of its eight steps on intensities that essentially never occur,
 * and four fifths of the flame collapses into the darkest step. That is what
 * made the fire read as a bed of embers rather than as a flame: it was
 * quantising a distribution into the wrong window.
 *
 * The window starts at the lit threshold because nothing below it is drawn,
 * and ends at 48 because 99.6% of lit cells fall below it.
 */
const RAMP_LO = LIT_THRESHOLD;
const RAMP_HI = 48;

/**
 * Curve across the ramp, below 1.
 *
 * The intensity distribution decays exponentially with height -- correctly, a
 * flame really is mostly cooler than its core -- so a *linear* ramp still
 * leaves the bulk of the flame in the dark half. Exponenting below 1 expands
 * the crowded low end and gives the body of the flame the mid-to-bright stops
 * where orange lives, while leaving the top of the window alone. This is the
 * opposite correction to the `n * n` curve this replaced, which compressed
 * exactly the range that needed expanding.
 */
const RAMP_GAMMA = 0.7;

/**
 * Map an intensity to a ramp index in [0, RAMP_STEPS).
 *
 * See RAMP_LO/RAMP_HI for why the window is not 0..MAX_INTENSITY, and
 * RAMP_GAMMA for why the curve is concave.
 */
export function rampIndex(value: number): number {
    if (value <= RAMP_LO) return 0;
    const n = Math.min(1, (value - RAMP_LO) / (RAMP_HI - RAMP_LO));
    const idx = Math.floor(n ** RAMP_GAMMA * RAMP_STEPS);
    return idx >= RAMP_STEPS ? RAMP_STEPS - 1 : idx;
}

/**
 * The intensity arriving at a sub-row, traced backwards along the flow.
 *
 * Semi-Lagrangian: instead of pushing heat out of four neighbours, ask where
 * this parcel came from and read there. The source is `RISE` sub-rows *below*
 * (heat travels up, so the previous position is below) and offset sideways by
 * the wind, because the parcel drifts as it climbs.
 *
 * Bilinear, not nearest. The wind offset is fractional almost every time, and
 * rounding it to a whole sub-column turns the plume into a staircase of hard
 * diagonal steps -- visible as a row of identical glyphs marching sideways.
 * Interpolating between the four surrounding sub-rows is what lets a tongue
 * bend smoothly, and it blurs the per-cell fuel noise into texture on the way
 * up, which is most of why the flame reads as gas rather than as static.
 */
function sampleAdvected(
    buf: Uint8Array,
    w: number,
    h: number,
    x: number,
    y: number,
    vx: number,
): number {
    const sx = x - vx;
    const sy = y + RISE;
    // Clamp, not wrap. Wrapping the left edge into the right edge would smear
    // the flame across the whole frame; clamping reflects flow off the border,
    // which is a smaller lie than teleporting the heat to the other side.
    const cx0 = Math.min(w - 1, Math.max(0, Math.floor(sx)));
    const cx1 = Math.min(w - 1, cx0 + 1);
    const cy0 = Math.min(h - 1, Math.max(0, Math.floor(sy)));
    const cy1 = Math.min(h - 1, cy0 + 1);
    const fx = Math.min(1, Math.max(0, sx - cx0));
    const fy = Math.min(1, Math.max(0, sy - cy0));

    const topRow = cy0 * w;
    const botRow = cy1 * w;
    const top = buf[topRow + cx0] + (buf[topRow + cx1] - buf[topRow + cx0]) * fx;
    const bot = buf[botRow + cx0] + (buf[botRow + cx1] - buf[botRow + cx0]) * fx;
    return top + (bot - top) * fy;
}

export interface FireCell {
    /** Ramp index, or -1 when the cell is dark. */
    readonly ramp: number;
    /** Packed braille bitmask; 0 when dark. */
    readonly packed: number;
}

export interface FireOptions {
    cols: number;
    rows: number;
    /** PRNG seed. Same seed and step count must give byte-identical frames. */
    seed?: number;
}

/**
 * One instance per renderer instance, never module state: two lock screens (or
 * a test beside one) sharing a buffer is what makes an animation "sometimes
 * starts already burning".
 */
export class FireBuffer {
    private readonly cols: number;
    private readonly rows: number;
    /** Sub-row buffer, row-major, `SUB_ROWS` entries per terminal row. */
    private readonly buf: Uint8Array;
    private readonly scratch: Uint8Array;
    private readonly rand: () => number;
    /** Frame counter, the time axis for the wind and the fuel flicker. */
    private t = 0;

    constructor(opts: FireOptions) {
        this.cols = Math.max(3, Math.floor(opts.cols));
        this.rows = Math.max(1, Math.floor(opts.rows));
        const w = this.cols;
        const h = this.rows * SUB_ROWS;
        this.buf = new Uint8Array(w * h);
        this.scratch = new Uint8Array(w * h);
        this.rand = mulberry32(opts.seed ?? 0x5eed);
    }

    /**
     * A copy of the raw sub-row intensities, row-major.
     *
     * Exposed so a test can assert the *algorithm* -- that each value was
     * derived from the previous frame's four neighbours -- instead of pinning a
     * golden blob. A golden would catch a regression but would not say which
     * part of the simulation moved, and would be rewritten by anyone who
     * changed a constant on purpose.
     */
    snapshot(): Uint8Array {
        return this.buf.slice();
    }

    /** True when this buffer's dimensions match, so the caller can reuse it. */
    matches(opts: FireOptions): boolean {
        return (
            this.cols === Math.max(3, Math.floor(opts.cols)) &&
            this.rows === Math.max(1, Math.floor(opts.rows))
        );
    }

    get width(): number {
        return this.cols;
    }

    get height(): number {
        return this.rows;
    }

    /**
     * Advance the simulation one frame.
     *
     * Two phases: lay a thin bed of fuel, then advect everything above it
     * upward through a shearing wind while cooling it.
     *
     * Bottom-up with a scratch buffer, never in place. Advection reads
     * `y + RISE` -- the parcel that arrives here came from below, and reading
     * the row *above* instead is the mirror image of the right answer: it looks
     * plausible, decays smoothly, and never lifts anything off the fuel.
     *
     * The `x` loop runs `1..cols-2`. The wind offset samples `x - 1` or more,
     * so letting the edges participate is what produces a permanent bright
     * border -- the outermost columns average against a constant zero column
     * forever and burn brighter with every frame.
     */
    step(): void {
        const { cols, buf, scratch, rand } = this;
        const h = this.rows * SUB_ROWS;
        const t = this.t++;

        // Phase 1: the fuel bed. Edges are seeded dark so the "outer columns
        // stay unlit" invariant holds here too, not just on the advected rows.
        for (let k = 0; k < FUEL_ROWS; k++) {
            const rowStart = (h - 1 - k) * cols;
            for (let x = 1; x < cols - 1; x++) {
                const env =
                    FUEL_FLOOR +
                    (1 - FUEL_FLOOR) *
                        (0.5 + 0.5 * Math.sin(x * FUEL_WAVELENGTH + t * FLICKER_RATE));
                buf[rowStart + x] = Math.floor(rand() * MAX_INTENSITY * env);
            }
        }

        // Phase 2: advection, bottom-up, from just above the bed.
        for (let y = h - FUEL_ROWS - 1; y >= 0; y--) {
            const rowStart = y * cols;
            scratch[rowStart] = 0;
            scratch[rowStart + cols - 1] = 0;
            for (let x = 1; x < cols - 1; x++) {
                const i = rowStart + x;
                const vx = windAt(x, y, t) + (rand() - 0.5) * LICK;
                // Height-dependent cooling. `depth` is 0 at the fuel bed and 1
                // at the top of the buffer, so the ramp is normalised: the same
                // flame shape comes out of a 16-row tier and a 50-row one
                // instead of the top tier's flame being squashed flat.
                const depth = (h - 1 - y) / h;
                const v =
                    sampleAdvected(buf, cols, h, x, y, vx) - COOLING * (1 + COOL_RAMP * depth);
                scratch[i] = Math.max(v, 0);
            }
        }
        // Carry the freshly laid bed through unchanged; phase 2 deliberately
        // stops above it so the fuel it just wrote is not overwritten by a
        // value advected out of itself.
        for (let k = 0; k < FUEL_ROWS; k++) {
            const rowStart = (h - 1 - k) * cols;
            scratch.set(buf.subarray(rowStart, rowStart + cols), rowStart);
        }

        buf.set(scratch);
    }

    /**
     * Pack one terminal cell into a glyph and a ramp index.
     *
     * Returns an empty cell when the region is dark so the caller can emit a
     * plain space rather than a styled blank -- the byte difference across a
     * whole frame is not negligible at 16fps.
     */
    cell(x: number, y: number): FireCell {
        const { cols, buf } = this;
        // Bounds-checked, not clamped: a resize mid-splash can leave the caller
        // asking about a cell this buffer does not have, and an out-of-range
        // read there is a wrong glyph, not an exception.
        if (x < 0 || x >= cols || y < 0 || y >= this.rows) return { ramp: -1, packed: 0 };

        let peak = 0;
        let packed = 0;
        const top = y * SUB_ROWS;
        for (let sub = 0; sub < SUB_ROWS; sub++) {
            const v = buf[(top + sub) * cols + x];
            // Dead zone, not `v !== 0`. At zero threshold a sub-row holding a
            // single unit of heat draws a dot as large as one holding 64, and
            // since the seed is spread over the full 0..64 scale almost every
            // sub-row clears a `> 0` test -- the cells came out ~94% full and
            // the flame base rendered as a solid slab of `⢸⡇⢸⡇` rather than
            // as fire. Intensity still drives colour through `peak`; this only
            // decides whether the sub-row contributes a dot at all.
            if (v < LIT_THRESHOLD) continue;
            packed |= glyphDotBit(x % SUB_COLS, sub);
            if (v > peak) peak = v;
        }
        if (packed === 0) return { ramp: -1, packed: 0 };
        return { ramp: rampIndex(peak), packed };
    }

    /**
     * The glyph for a packed cell.
     *
     * The braille bit order is 1, 2, 3, 7 then 4, 5, 6, 8, which is exactly
     * the Unicode braille bit order, so the packed mask *is* the code point's
     * offset and no lookup table is needed. (The terminal's own table says the
     * same thing in 256 lines.)
     */
    glyphFor(packed: number): string {
        if (packed <= 0 || packed > 0xff) return " ";
        return String.fromCodePoint(0x2800 + packed);
    }

    /**
     * Whether a packed art cell should be skipped so the fire does not paint
     * over the fox stroke. Art cells are bit 5 of their packed code.
     */
    static isInk(code: number): boolean {
        return (code & INK_BIT) !== 0;
    }

    /** Reset to a cold buffer, so a resized renderer starts unlit. */
    clear(): void {
        this.buf.fill(0);
    }
}
