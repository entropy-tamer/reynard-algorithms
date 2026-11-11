/**
 * The clock the fire runs on.
 *
 * The simulation is stepped on a fixed timestep, not once per rendered frame.
 * A page that steps per frame runs its flame at the display's rate: twice as
 * fast on a 120 Hz screen as on a 60 Hz one, and not at all like the terminal,
 * which steps on a 16 ms clock. The picture would be the same and the *time*
 * would not, and a flame that runs at the display's rate is not the flame the
 * terminal shows.
 *
 * The clock is a pure function of the elapsed time, so a late tick does not
 * slow the flame and a stall does not teleport it. A stall is bounded: a
 * suspended laptop resumes a little cooler instead of running a second of
 * simulation inside one repaint.
 *
 * @module algorithms/algorithms/rendering/fox-fire/clock
 */

/** The milliseconds one fire step takes. The terminal's frame time. */
export const FIRE_STEP_MS = 16;

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
    /** The milliseconds one fire step takes. Defaults to 16. */
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
     */
    advance(now: number): number {
        if (!this.armed) {
            this.armed = true;
            this.origin = now;
            this.last = now;
            return 0;
        }
        const elapsed = Math.max(0, now - this.last);
        this.last = now;
        const due = Math.min(Math.floor(elapsed / this.stepMs), this.maxCatchUp);
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
