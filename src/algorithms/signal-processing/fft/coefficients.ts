/**
 * @file Harmonic coefficient extraction helpers
 *
 * Provides utilities for converting complex FFT results into explicit
 * cosine/sine coefficient pairs that match the article-style formulation.
 */

import {
  FFTCoefficientStrategy,
  FFTNormalizationMode,
  type HarmonicCoefficients,
} from "./fft-types";

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
export function extractHarmonicCoefficients(args: CoefficientExtractionArgs): HarmonicCoefficients | undefined {
  const { real, imag, size, normalizationMode, strategy } = args;

  if (strategy !== FFTCoefficientStrategy.ARTICLE) {
    return undefined;
  }

  const cosine = new Float32Array(size);
  const sine = new Float32Array(size);
  const magnitude = new Float32Array(size);
  const phase = new Float32Array(size);

  // Determine scaling factors relative to the current normalization mode.
  // These factors convert the FFT output into the article's regression-style
  // coefficients where:
  //   A_n = (2 / N) * sum(x_i * cos(...))
  //   B_n = (2 / N) * sum(x_i * sin(...))
  const { dcScale, harmonicScale } = getArticleScalingFactors(size, normalizationMode);

  const real0 = real[0];
  if (real0 === undefined) {
    return undefined;
  }
  cosine[0] = real0 * dcScale;
  sine[0] = 0;

  for (let n = 1; n < size; n++) {
    const realN = real[n];
    const imagN = imag[n];
    if (realN === undefined || imagN === undefined) {
      continue;
    }
    const scaledReal = realN * harmonicScale;
    const scaledImag = imagN * harmonicScale;
    cosine[n] = scaledReal;
    sine[n] = -scaledImag; // Imaginary component carries the negative sine term
  }

  for (let n = 0; n < size; n++) {
    const a = cosine[n];
    const b = sine[n];
    if (a === undefined || b === undefined) {
      continue;
    }
    magnitude[n] = Math.hypot(a, b);
    phase[n] = Math.atan2(b, a);
  }

  return {
    cosine,
    sine,
    magnitude,
    phase,
    normalization: normalizationMode,
    strategy,
  };
}

/**
 *
 * @param size
 * @param mode
 * @example
 */
function getArticleScalingFactors(size: number, mode: FFTNormalizationMode): { dcScale: number; harmonicScale: number } {
  switch (mode) {
    case FFTNormalizationMode.ARTICLE:
      return { dcScale: 1, harmonicScale: 1 };
    case FFTNormalizationMode.STANDARD:
      return { dcScale: 1, harmonicScale: 2 };
    case FFTNormalizationMode.NONE:
    default:
      return { dcScale: 1 / size, harmonicScale: 2 / size };
  }
}
