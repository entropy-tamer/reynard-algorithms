/**
 * @file FFT validation utilities
 *
 * Provides heuristics for detecting integer-cycle alignment issues and
 * low-frequency transients in FFT results.
 */
import type { FFTResult, FFTValidationWarning, FFTValidationIntegerCyclesOptions, FFTValidationTransientOptions } from "./fft-types";
/**
 * Validate whether the analyzed window contains an integer number of cycles
 * for the dominant frequency.
 * @param args
 * @param args.result
 * @param args.sampleRate
 * @param args.size
 * @param args.options
 * @example
 */
export declare function validateIntegerCycles(args: {
    result: FFTResult;
    sampleRate: number;
    size: number;
    options?: FFTValidationIntegerCyclesOptions;
}): FFTValidationWarning | undefined;
/**
 * Validate the amount of low-frequency energy that may indicate transient drift.
 * @param args
 * @param args.result
 * @param args.options
 * @example
 */
export declare function validateTransients(args: {
    result: FFTResult;
    options?: FFTValidationTransientOptions;
}): FFTValidationWarning | undefined;
//# sourceMappingURL=validation.d.ts.map