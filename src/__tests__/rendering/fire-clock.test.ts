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
        // The step time is the terminal's frame time: 62.5 ms, one step per
        // frame at the rate the terminal renders at.
        expect(FIRE_STEP_MS).toBe(1000 / 16);
        // 62.5 ms of elapsed time is exactly one step.
        expect(clock.advance(62.5)).toBe(1);
        // Another 62.5 ms is another step, not a partial one.
        expect(clock.advance(125)).toBe(1);
    });

    it("gives sixteen steps a second, on any display", () => {
        const stepsInSecond = (fps: number): number => {
            const clock = new FireClock();
            clock.advance(0);
            let steps = 0;
            for (let i = 1; i <= fps; i++) steps += clock.advance((1000 / fps) * i);
            return steps;
        };
        // The rate is a property of the clock, not of how often it is asked:
        // a 60 Hz display and a 144 Hz display owe the same sixteen steps.
        expect(stepsInSecond(60)).toBe(16);
        expect(stepsInSecond(144)).toBe(16);
        expect(stepsInSecond(30)).toBe(16);
    });

    it("keeps the fractional step, so a fine display does not lose time", () => {
        const clock = new FireClock();
        clock.advance(0);
        // Frames arrive every 6.9 ms (144 Hz); none of them is a full step,
        // but the clock carries them until a step is owed.
        let steps = 0;
        for (let i = 1; i <= 144; i++) steps += clock.advance((1000 / 144) * i);
        expect(steps).toBe(16);
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
        expect(clock.phase(SWEEP_CYCLE_MS)).toBeCloseTo(0, 5);
    });
});
