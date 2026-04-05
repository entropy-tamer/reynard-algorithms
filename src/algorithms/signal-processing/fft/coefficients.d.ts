/**
 * @file Harmonic coefficient extraction helpers
 *
 * Provides utilities for converting complex FFT results into explicit
 * cosine/sine coefficient pairs that match the article-style formulation.
 */
import { FFTCoefficientStrategy, FFTNormalizationMode, type HarmonicCoefficients } from "./fft-types";
interface CoefficientExtractionArgs {
    real: Float32Array;
    imag: Float32Array;
    size: number;
    normalizationMode: FFTNormalizationMode;
    strategy: FFTCoefficientStrategy;
}
/**
 * Extract harmonic coefficients based on the configured strategy.
 * @param args
 * @example
 */
export declare function extractHarmonicCoefficients(args: CoefficientExtractionArgs): HarmonicCoefficients | undefined;
export {};
//# sourceMappingURL=coefficients.d.ts.map