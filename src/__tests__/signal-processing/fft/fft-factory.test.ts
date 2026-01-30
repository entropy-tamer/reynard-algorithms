/**
 * FFT Factory Tests
 *
 * Test suite for the FFT Factory and algorithm selection.
 */

import { describe, it, expect } from "vitest";
import { FFTFactory } from "../../../algorithms/signal-processing/fft/fft-factory";
import { FFTAlgorithm } from "../../../algorithms/signal-processing/fft/fft-types";
import type { FFTConfig } from "../../../algorithms/signal-processing/fft/fft-types";

describe("FFTFactory", () => {
  describe("create", () => {
    it("should create Radix-2 FFT with explicit algorithm", () => {
      const config: FFTConfig = { size: 1024, algorithm: FFTAlgorithm.RADIX_2 };
      const fft = FFTFactory.create(config);

      expect(fft).toBeDefined();
      expect(fft.getSize()).toBe(1024);
      // Check if getAlgorithmName exists (Radix2FFT implements it)
      if ("getAlgorithmName" in fft && typeof fft.getAlgorithmName === "function") {
        expect(fft.getAlgorithmName()).toBe("Radix-2 Cooley-Tukey");
      }
    });

    it("should create FFT with AUTO algorithm", () => {
      const config: FFTConfig = { size: 1024, algorithm: FFTAlgorithm.AUTO };
      const fft = FFTFactory.create(config);

      expect(fft).toBeDefined();
      expect(fft.getSize()).toBe(1024);
    });

    it("should default to AUTO algorithm", () => {
      const config: FFTConfig = { size: 1024 };
      const fft = FFTFactory.create(config);

      expect(fft).toBeDefined();
      expect(fft.getSize()).toBe(1024);
    });

    it("should create Radix-4 FFT with explicit algorithm", () => {
      const config: FFTConfig = { size: 256, algorithm: FFTAlgorithm.RADIX_4 }; // 256 is power of 4
      const fft = FFTFactory.create(config);
      expect(fft).toBeDefined();
      expect(fft.getSize()).toBe(256);
      if ("getAlgorithmName" in fft && typeof fft.getAlgorithmName === "function") {
        expect(fft.getAlgorithmName()).toBe("Radix-4 Cooley-Tukey");
      }
    });
  });

  describe("createAuto", () => {
    it("should create Radix-4 FFT for power-of-4 size", () => {
      const fft = FFTFactory.createAuto(256); // 256 is power of 4

      expect(fft).toBeDefined();
      expect(fft.getSize()).toBe(256);
      expect(fft.getAlgorithmName()).toBe("Radix-4 Cooley-Tukey");
    });

    it("should create Radix-2 FFT for power-of-2 but not power-of-4 size", () => {
      const fft = FFTFactory.createAuto(512); // 512 is power of 2 but not 4 (512 = 2^9, not 4^n)

      expect(fft).toBeDefined();
      expect(fft.getSize()).toBe(512);
      expect(fft.getAlgorithmName()).toBe("Radix-2 Cooley-Tukey");
    });

    it("should create Mixed-Radix FFT for non-power-of-2 size", () => {
      const fft = FFTFactory.createAuto(1000);

      expect(fft).toBeDefined();
      expect(fft.getSize()).toBe(1000);
      expect(fft.getAlgorithmName()).toBe("Mixed-Radix (Bluestein)");
    });

    it("should accept partial config", () => {
      const fft = FFTFactory.createAuto(1024, { normalize: false });

      expect(fft).toBeDefined();
      expect(fft.getConfig().normalize).toBe(false);
    });
  });

  describe("createWithAlgorithm", () => {
    it("should create FFT with specific algorithm", () => {
      const fft = FFTFactory.createWithAlgorithm(FFTAlgorithm.RADIX_2, 1024);

      expect(fft).toBeDefined();
      expect(fft.getSize()).toBe(1024);
      expect(fft.getAlgorithmName()).toBe("Radix-2 Cooley-Tukey");
    });

    it("should create Radix-4 FFT with explicit algorithm", () => {
      const fft = FFTFactory.createWithAlgorithm(FFTAlgorithm.RADIX_4, 256); // 256 is power of 4
      expect(fft).toBeDefined();
      expect(fft.getSize()).toBe(256);
      expect(fft.getAlgorithmName()).toBe("Radix-4 Cooley-Tukey");
    });
  });

  describe("getBestAlgorithm", () => {
    it("should return RADIX_4 for power-of-4 size", () => {
      const algorithm = FFTFactory.getBestAlgorithm(256);
      expect(algorithm).toBe(FFTAlgorithm.RADIX_4);
    });

    it("should return RADIX_2 for power-of-2 but not power-of-4 size", () => {
      const algorithm = FFTFactory.getBestAlgorithm(512); // 512 is power of 2 but not 4
      expect(algorithm).toBe(FFTAlgorithm.RADIX_2);
    });

    it("should return MIXED_RADIX for non-power-of-2 size", () => {
      const algorithm = FFTFactory.getBestAlgorithm(1000);
      expect(algorithm).toBe(FFTAlgorithm.MIXED_RADIX);
    });
  });

  describe("getSupportedSizes", () => {
    it("should return power-of-2 sizes for RADIX_2", () => {
      const sizes = FFTFactory.getSupportedSizes(FFTAlgorithm.RADIX_2);
      expect(sizes.length).toBeGreaterThan(0);
      expect(sizes).toContain(1024);
      expect(sizes).toContain(2048);
      expect(sizes).not.toContain(1000);
    });

    it("should return power-of-2 sizes for AUTO", () => {
      const sizes = FFTFactory.getSupportedSizes(FFTAlgorithm.AUTO);
      expect(sizes.length).toBeGreaterThan(0);
      expect(sizes).toContain(1024);
      expect(sizes).toContain(2048);
    });

    it("should return power-of-4 sizes for RADIX_4", () => {
      const sizes = FFTFactory.getSupportedSizes(FFTAlgorithm.RADIX_4);
      expect(Array.isArray(sizes)).toBe(true);
      expect(sizes.length).toBeGreaterThan(0);
      expect(sizes).toContain(16);
      expect(sizes).toContain(64);
      expect(sizes).toContain(256);
    });
  });

  describe("isSizeSupported", () => {
    it("should return true for power-of-2 sizes with RADIX_2", () => {
      expect(FFTFactory.isSizeSupported(FFTAlgorithm.RADIX_2, 1024)).toBe(true);
      expect(FFTFactory.isSizeSupported(FFTAlgorithm.RADIX_2, 2048)).toBe(true);
      expect(FFTFactory.isSizeSupported(FFTAlgorithm.RADIX_2, 512)).toBe(true);
    });

    it("should return false for non-power-of-2 sizes with RADIX_2", () => {
      expect(FFTFactory.isSizeSupported(FFTAlgorithm.RADIX_2, 1000)).toBe(false);
      expect(FFTFactory.isSizeSupported(FFTAlgorithm.RADIX_2, 1023)).toBe(false);
      expect(FFTFactory.isSizeSupported(FFTAlgorithm.RADIX_2, 1025)).toBe(false);
    });

    it("should return true for power-of-2 sizes with AUTO", () => {
      expect(FFTFactory.isSizeSupported(FFTAlgorithm.AUTO, 1024)).toBe(true);
      expect(FFTFactory.isSizeSupported(FFTAlgorithm.AUTO, 512)).toBe(true);
    });

    it("should return true for Radix-4 with power-of-4 sizes", () => {
      expect(FFTFactory.isSizeSupported(FFTAlgorithm.RADIX_4, 16)).toBe(true);
      expect(FFTFactory.isSizeSupported(FFTAlgorithm.RADIX_4, 64)).toBe(true);
      expect(FFTFactory.isSizeSupported(FFTAlgorithm.RADIX_4, 256)).toBe(true);
      expect(FFTFactory.isSizeSupported(FFTAlgorithm.RADIX_4, 512)).toBe(false); // 512 is not power of 4
    });

    it("should return true for Mixed-Radix with any size", () => {
      expect(FFTFactory.isSizeSupported(FFTAlgorithm.MIXED_RADIX, 1000)).toBe(true);
      expect(FFTFactory.isSizeSupported(FFTAlgorithm.MIXED_RADIX, 1024)).toBe(true);
      expect(FFTFactory.isSizeSupported(FFTAlgorithm.MIXED_RADIX, 500)).toBe(true);
    });
  });

  describe("getRecommendations", () => {
    it("should return algorithm recommendations", () => {
      const recommendations = FFTFactory.getRecommendations();

      expect(recommendations).toBeDefined();
      expect(recommendations["power-of-2"]).toBeDefined();
      expect(recommendations["auto-select"]).toBeDefined();
    });

    it("should include correct algorithm types", () => {
      const recommendations = FFTFactory.getRecommendations();

      expect(recommendations).toHaveProperty("power-of-2");
      expect(recommendations).toHaveProperty("auto-select");
      expect(recommendations["power-of-2"].algorithm).toBe(FFTAlgorithm.RADIX_2);
      expect(recommendations["auto-select"].algorithm).toBe(FFTAlgorithm.AUTO);
    });
  });

  describe("getAlgorithmDescription", () => {
    it("should return description for RADIX_2", () => {
      const description = FFTFactory.getAlgorithmDescription(FFTAlgorithm.RADIX_2);
      expect(description).toContain("Cooley-Tukey");
    });

    it("should return description for AUTO", () => {
      const description = FFTFactory.getAlgorithmDescription(FFTAlgorithm.AUTO);
      expect(description).toContain("Automatically");
    });

    it("should indicate implemented algorithms", () => {
      const description = FFTFactory.getAlgorithmDescription(FFTAlgorithm.RADIX_4);
      expect(description).toContain("Radix-4");
      expect(description).not.toContain("not yet implemented");
    });
  });

  describe("getFactoryStats", () => {
    it("should return factory statistics", () => {
      const stats = FFTFactory.getFactoryStats();

      expect(stats).toBeDefined();
      expect(stats.totalAlgorithms).toBeGreaterThan(0);
      expect(stats.implementedAlgorithms).toBeGreaterThan(0);
      expect(stats.supportedSizes).toBeGreaterThan(0);
      expect(stats.recommendations).toBeGreaterThan(0);
    });
  });
});
