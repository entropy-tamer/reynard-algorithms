/**
 * The clock the fire runs on.
 *
 * The simulation is stepped on a fixed timestep, not once per rendered frame.
 * A page that steps per frame runs its flame at the display's rate: twice as
 * fast on a 120 Hz screen as on a 60 Hz one, and not at all like the terminal,
 * which steps on a 62.5 ms clock. The picture would be the same and the *time*
 * would not, and a flame that runs at the display's rate is not the flame the
 * terminal shows.
 *
 * Every constant in the density-of-gas model is *per step*: the rise, the
 * cooling, the lateral lick, the fuel flicker. A plume is a shape and a speed
 * together, and both are counted in steps, so the step rate is part of the
 * picture. Running the same steps faster gives a different plume, not the same
 * plume in a hurry.
 *
 * The clock is a pure function of the elapsed time, so a late tick does not
 * slow the flame and a stall does not teleport it. A stall is bounded: a
 * suspended laptop resumes a little cooler instead of running a second of
 * simulation inside one repaint.
 *
 * @module algorithms/algorithms/rendering/fox-fire/clock
 */

/**
 * The milliseconds one fire step takes: the terminal's frame time.
 *
 * Sixteen steps a second, which is the rate the model was tuned at and the
 * rate the stored golden frame was captured at. Every surface steps the fire
 * at this rate, so the three of them show one plume rather than three.
 */
export const FIRE_STEP_MS = 1000 / 16;

/**
 * The steps a fresh buffer is stepped before it is first painted.
 *
 * A buffer seeded this instant renders as an empty field, so the splash would
 * open on a black rectangle and grow into a flame while the reader watches.
 * The lock screen warms its buffer by this many steps before its first paint,
 * so the flame opens *burning* rather than cold.
 */
export const FIRE_WARMUP = 24;

/**
 * The most fire steps one advance may take.
 *
 * The fire is a simulation, so it can only be *caught up* to the clock, never
 * derived from it. Past this bound the flame resumes a little cooler than the
 * sweep would suggest, which is the right trade against burning thousands of
 * steps inside a single repaint.
 */
export const FIRE_MAX_CATCH_UP = 8;

/** The milliseconds one sweep cycle takes: the crest's lap. */
export const SWEEP_CYCLE_MS = 6200;

export interface FireClockOptions {
    /** The milliseconds one fire step takes. Defaults to the shared rate. */
    readonly stepMs?: number;
    /** The most steps one advance may take. Defaults to 8. */
    readonly maxCatchUp?: number;
    /** The milliseconds one sweep cycle takes. Defaults to 6200. */
    readonly sweepMs?: number;
}

/**
 * The fire's clock: how many steps to take, and where the sweep's crest is.
 *
 * One instance per animation, never module state: two lock screens sharing a
 * clock is what makes an animation "sometimes starts already burning".
 */
export class FireClock {
    private readonly stepMs: number;
    private readonly maxCatchUp: number;
    private readonly sweepMs: number;
    /** Whether the clock has been armed: the first advance sets the origin. */
    private armed = false;
    /** The time the clock was armed, in milliseconds. */
    private origin = 0;
    /** The time of the last advance, in milliseconds. */
    private last = 0;
    /** The simulation's elapsed time that has not yet become a whole step. */
    private carry = 0;
    /** The steps taken so far. */
    private taken = 0;

    constructor(options: FireClockOptions = {}) {
        this.stepMs = options.stepMs ?? FIRE_STEP_MS;
        this.maxCatchUp = options.maxCatchUp ?? FIRE_MAX_CATCH_UP;
        this.sweepMs = options.sweepMs ?? SWEEP_CYCLE_MS;
    }

    /**
     * The number of fire steps to take at `now`, in milliseconds.
     *
     * The count is the time owed since the last advance, so a slow tick takes
     * more steps and a fast one takes none. The catch-up cap bounds it.
     *
     * The leftover is carried forward between advances, not discarded: the
     * step time is longer than a single repaint's worth of elapsed time on
     * every display but a very coarse one, and dropping the remainder here is
     * what made the old step time (16 ms, below one frame at 60 fps) look right
     * while a 62.5 ms step — the terminal's own frame time — looked like a
     * step the flame could never take.
     */
    advance(now: number): number {
        if (!this.armed) {
            this.armed = true;
            this.origin = now;
            this.last = now;
            this.carry = 0;
            return 0;
        }
        const elapsed = Math.max(0, now - this.last);
        this.last = now;
        this.carry += elapsed;
        const owed = Math.floor(this.carry / this.stepMs);
        // Settle only the sub-step remainder; whole steps the catch-up cap
        // refuses to burn are the flame's to lose, as they are the terminal's.
        this.carry -= owed * this.stepMs;
        const due = Math.min(owed, this.maxCatchUp);
        this.taken += due;
        return due;
    }

    /**
     * The sweep's position, in [0, 1).
     *
     * A pure function of the elapsed time, so the crest travels at the same
     * rate on any display and a late tick does not shift it.
     */
    phase(now: number): number {
        if (this.sweepMs <= 0) return 0;
        const elapsed = Math.max(0, now - this.origin);
        return (elapsed % this.sweepMs) / this.sweepMs;
    }

    /** The steps taken so far. */
    get steps(): number {
        return this.taken;
    }
}
