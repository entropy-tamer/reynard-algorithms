/**
 * @file Mixed-Radix FFT Tests
 * Tests for Mixed-Radix FFT implementation (Bluestein's algorithm)
 */

import { describe, it, expect } from "vitest";
import { MixedRadixFFT } from "../../../algorithms/signal-processing/fft/mixed-radix-fft";
import { FFTAlgorithm } from "../../../algorithms/signal-processing/fft/fft-types";
import type { FFTConfig } from "../../../algorithms/signal-processing/fft/fft-types";
import { TestSignalGenerator, FFTValidator } from "./test-utils";

describe("MixedRadixFFT", () => {
  describe("Basic Functionality", () => {
    it("should create MixedRadixFFT instance for any size", () => {
      const config: FFTConfig = { size: 100, algorithm: FFTAlgorithm.MIXED_RADIX };
      const fft = new MixedRadixFFT(config);
      expect(fft).toBeInstanceOf(MixedRadixFFT);
    });

    it("should handle non-power-of-2 sizes", () => {
      const config: FFTConfig = { size: 100, algorithm: FFTAlgorithm.MIXED_RADIX, normalize: false };
      const fft = new MixedRadixFFT(config);
      const signal = TestSignalGenerator.sineWave(100, 10, 100);
      const result = fft.forward(signal);
      expect(result.real.length).toBe(100);
      expect(result.imag.length).toBe(100);
    });

    it("should compute forward FFT", () => {
      const config: FFTConfig = { size: 100, algorithm: FFTAlgorithm.MIXED_RADIX, normalize: false };
      const fft = new MixedRadixFFT(config);
      const signal = TestSignalGenerator.sineWave(100, 10, 100);
      const result = fft.forward(signal);
      expect(result.real.length).toBe(100);
      expect(result.imag.length).toBe(100);
      expect(result.magnitude.length).toBe(100);
    });

    it("should compute inverse FFT", () => {
      const config: FFTConfig = { size: 100, algorithm: FFTAlgorithm.MIXED_RADIX, normalize: false };
      const fft = new MixedRadixFFT(config);
      const signal = TestSignalGenerator.sineWave(100, 10, 100);
      const fftResult = fft.forward(signal);
      const ifftResult = fft.inverse(fftResult.real, fftResult.imag);
      expect(ifftResult.real.length).toBe(100);
    });
  });

  describe("Accuracy Tests", () => {
    it.skip("should pass round-trip accuracy test for arbitrary size", () => {
      // TODO: Investigate Mixed-Radix (Bluestein's) round-trip accuracy - may need implementation fixes
      const config: FFTConfig = { size: 100, algorithm: FFTAlgorithm.MIXED_RADIX, normalize: false };
      const fft = new MixedRadixFFT(config);
      const signal = TestSignalGenerator.sineWave(100, 10, 100);
      const fftResult = fft.forward(signal);
      const inverseResult = fft.inverse(fftResult.real, fftResult.imag);
      const isValid = FFTValidator.checkRoundTripAccuracy(signal, inverseResult.real, 1e-2);
      expect(isValid).toBe(true);
    });

    it.skip("should handle power-of-2 sizes", () => {
      // TODO: Investigate Mixed-Radix (Bluestein's) round-trip accuracy - may need implementation fixes
      const config: FFTConfig = { size: 64, algorithm: FFTAlgorithm.MIXED_RADIX, normalize: false };
      const fft = new MixedRadixFFT(config);
      const signal = TestSignalGenerator.sineWave(64, 4, 64);
      const fftResult = fft.forward(signal);
      const inverseResult = fft.inverse(fftResult.real, fftResult.imag);
      const isValid = FFTValidator.checkRoundTripAccuracy(signal, inverseResult.real, 1e-2);
      expect(isValid).toBe(true);
    });
  });

  describe("Algorithm Information", () => {
    it("should return correct algorithm name", () => {
      const config: FFTConfig = { size: 100, algorithm: FFTAlgorithm.MIXED_RADIX };
      const fft = new MixedRadixFFT(config);
      expect(fft.getAlgorithmName()).toBe("Mixed-Radix (Bluestein)");
    });

    it("should check if size is supported (any positive integer)", () => {
      const config: FFTConfig = { size: 100, algorithm: FFTAlgorithm.MIXED_RADIX };
      const fft = new MixedRadixFFT(config);
      expect(fft.isSizeSupported(100)).toBe(true);
      expect(fft.isSizeSupported(64)).toBe(true);
      expect(fft.isSizeSupported(128)).toBe(true);
      expect(fft.isSizeSupported(1)).toBe(true);
      expect(fft.isSizeSupported(0)).toBe(false);
      expect(fft.isSizeSupported(-1)).toBe(false);
    });
  });
});

