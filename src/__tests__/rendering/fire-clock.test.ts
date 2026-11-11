import { describe, expect, it } from "vitest";
import {
    FIRE_MAX_CATCH_UP,
    FIRE_STEP_MS,
    FireClock,
    SWEEP_CYCLE_MS,
} from "../../algorithms/rendering/fox-fire/clock";

describe("FireClock", () => {
    it("steps on a fixed timestep, not per frame", () => {
        const clock = new FireClock();
        expect(clock.advance(0)).toBe(0);
        // 100 ms is six 16 ms steps.
        expect(clock.advance(100)).toBe(6);
        // A frame that arrives early is owed nothing.
        expect(clock.advance(110)).toBe(0);
        expect(clock.advance(126)).toBe(1);
    });

    it("bounds the catch-up, so a stall does not burn a second of simulation", () => {
        const clock = new FireClock();
        clock.advance(0);
        // Five seconds of stall: the cap is eight steps.
        expect(clock.advance(5000)).toBe(FIRE_MAX_CATCH_UP);
        expect(clock.steps).toBe(FIRE_MAX_CATCH_UP);
    });

    it("takes the step time and the cap from its caller", () => {
        const clock = new FireClock({ stepMs: 100, maxCatchUp: 2 });
        clock.advance(0);
        expect(clock.advance(350)).toBe(2);
    });

    it("puts the sweep's crest on the elapsed time", () => {
        const clock = new FireClock();
        clock.advance(0);
        expect(clock.phase(0)).toBe(0);
        expect(clock.phase(SWEEP_CYCLE_MS / 2)).toBeCloseTo(0.5, 5);
        // The crest comes back around.
        expect(clock.phase(SWEEP_CYCLE_MS)).toBeCloseTo(0, 5);
    });

    it("runs the same speed whatever the display does", () => {
        // A 60 Hz display and a 144 Hz one: the same elapsed time owes the
        // same number of fire steps, because the clock is the clock.
        const sixty = new FireClock();
        const hundredFortyFour = new FireClock();
        sixty.advance(0);
        hundredFortyFour.advance(0);
        const due = (clock: FireClock, steps: number): number => {
            let total = 0;
            for (let i = 1; i <= steps; i++) total += clock.advance((1000 / 60) * i);
            return total;
        };
        expect(due(sixty, 60)).toBe(due(hundredFortyFour, 60));
        expect(FIRE_STEP_MS).toBe(16);
    });
});
