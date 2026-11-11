/**
 * Mulberry32 PRNG — canonical form, byte-level deterministic across JS engines.
 *
 * `seed >>> 0` ensures a 32-bit unsigned state regardless of input. This is THE
 * mulberry32 for the whole `~/reynard` tree: the copies that used to live in
 * `r/packages/coding-agent/.../fire.ts`, `r/packages/splash/src/fire.ts` and
 * the procedural-generation modules were all folded into this one.
 * Semantics are identical to every copy it replaced, so golden-frame tests
 * elsewhere are unaffected.
 *
 * @module algorithms/utils/prng/mulberry32
 */

/**
 * Create a mulberry32 generator.
 *
 * @param seed - 32-bit seed (coerced with `>>> 0`)
 * @returns A function returning the next pseudo-random float in [0, 1)
 */
export function mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
