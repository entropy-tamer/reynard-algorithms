/**
 * FFT Factory
 *
 * Factory class for creating FFT instances with automatic algorithm selection
 * based on size and performance requirements.
 */

import { BitReversal } from "./core/bit-reversal";
import { FFTAlgorithm, type FFTConfig } from "./fft-types";
import { FFTBase } from "./fft-base";
import { Radix2FFT } from "./radix2-fft";
import { Radix4FFT } from "./radix4-fft";
import { MixedRadixFFT } from "./mixed-radix-fft";
import { RealFFT } from "./real-fft";

/**
 * FFT Factory class
 */
export class FFTFactory {
  /**
   * Create FFT instance based on configuration
   */
  static create(config: FFTConfig): FFTBase {
    const algorithm = config.algorithm || FFTAlgorithm.AUTO;

    switch (algorithm) {
      case FFTAlgorithm.RADIX_2:
        return new Radix2FFT(config);

      case FFTAlgorithm.RADIX_4:
        return new Radix4FFT(config);

      case FFTAlgorithm.MIXED_RADIX:
        return new MixedRadixFFT(config);

      case FFTAlgorithm.REAL_FFT:
        return new RealFFT(config);

      case FFTAlgorithm.AUTO:
      default:
        return this.createAuto(config.size, config);
    }
  }

  /**
   * Create FFT with automatic algorithm selection
   */
  static createAuto(size: number, baseConfig: Partial<FFTConfig> = {}): FFTBase {
    const config: FFTConfig = {
      size,
      algorithm: FFTAlgorithm.AUTO,
      normalize: true,
      ...baseConfig,
    };

    // Auto-selection logic
    if (BitReversal.isPowerOf4(size)) {
      // Power of 4: use Radix-4 (faster than Radix-2)
      return new Radix4FFT(config);
    } else if (BitReversal.isPowerOf2(size)) {
      // Power of 2: use Radix-2 (fast)
      return new Radix2FFT(config);
    } else {
      // Arbitrary size: use Mixed-Radix (Bluestein's algorithm)
      return new MixedRadixFFT(config);
    }
  }

  /**
   * Create FFT with specific algorithm
   */
  static createWithAlgorithm(algorithm: FFTAlgorithm, size: number, baseConfig: Partial<FFTConfig> = {}): FFTBase {
    const config: FFTConfig = {
      size,
      algorithm,
      normalize: true,
      ...baseConfig,
    };

    return this.create(config);
  }

  /**
   * Get best algorithm for given size
   */
  static getBestAlgorithm(size: number): FFTAlgorithm {
    if (BitReversal.isPowerOf4(size)) {
      return FFTAlgorithm.RADIX_4;
    } else if (BitReversal.isPowerOf2(size)) {
      return FFTAlgorithm.RADIX_2;
    } else {
      return FFTAlgorithm.MIXED_RADIX;
    }
  }

  /**
   * Get supported sizes for each algorithm
   */
  static getSupportedSizes(algorithm: FFTAlgorithm): number[] {
    switch (algorithm) {
      case FFTAlgorithm.RADIX_2:
      case FFTAlgorithm.REAL_FFT:
        return this.getPowerOf2Sizes();

      case FFTAlgorithm.RADIX_4:
        return this.getPowerOf4Sizes();

      case FFTAlgorithm.MIXED_RADIX:
        // Mixed-radix supports any size
        return [100, 256, 512, 1000, 1024, 2048, 4096, 8192];

      case FFTAlgorithm.AUTO:
        // Return all supported sizes
        return [...this.getPowerOf4Sizes(), ...this.getPowerOf2Sizes()];

      default:
        return [];
    }
  }

  /**
   * Get power-of-2 sizes
   */
  private static getPowerOf2Sizes(): number[] {
    const sizes: number[] = [];
    for (let i = 1; i <= 16; i++) {
      sizes.push(1 << i); // 2, 4, 8, 16, ..., 65536
    }
    return sizes;
  }

  /**
   * Get power-of-4 sizes
   */
  private static getPowerOf4Sizes(): number[] {
    const sizes: number[] = [];
    for (let i = 1; i <= 8; i++) {
      const size = Math.pow(4, i); // 4, 16, 64, 256, 1024, 4096, 16384, 65536
      if (size <= 65536) {
        sizes.push(size);
      }
    }
    return sizes;
  }

  /**
   * Check if size is supported by algorithm
   */
  static isSizeSupported(algorithm: FFTAlgorithm, size: number): boolean {
    switch (algorithm) {
      case FFTAlgorithm.RADIX_2:
      case FFTAlgorithm.REAL_FFT:
        return BitReversal.isPowerOf2(size);

      case FFTAlgorithm.RADIX_4:
        return BitReversal.isPowerOf4(size);

      case FFTAlgorithm.MIXED_RADIX:
        return size > 0 && Number.isInteger(size);

      case FFTAlgorithm.AUTO:
        return size > 0 && Number.isInteger(size);

      default:
        return false;
    }
  }

  /**
   * Get algorithm recommendations for different use cases
   */
  static getRecommendations(): {
    [key: string]: {
      algorithm: FFTAlgorithm;
      description: string;
      bestFor: string[];
    };
  } {
    return {
      "power-of-4": {
        algorithm: FFTAlgorithm.RADIX_4,
        description: "Fastest algorithm for power-of-4 sizes",
        bestFor: ["Maximum performance", "Power-of-4 sizes", "Reduced stages"],
      },
      "power-of-2": {
        algorithm: FFTAlgorithm.RADIX_2,
        description: "Fast Cooley-Tukey algorithm for power-of-2 sizes",
        bestFor: ["General purpose", "Balanced performance", "Memory efficiency"],
      },
      "real-signals": {
        algorithm: FFTAlgorithm.REAL_FFT,
        description: "Optimized for real-valued input signals",
        bestFor: ["Real signals only", "Audio processing", "Reduced computation"],
      },
      "arbitrary-size": {
        algorithm: FFTAlgorithm.MIXED_RADIX,
        description: "Bluestein's algorithm for arbitrary sizes",
        bestFor: ["Non-power-of-2 sizes", "Flexible input", "General purpose"],
      },
      "auto-select": {
        algorithm: FFTAlgorithm.AUTO,
        description: "Automatically selects best algorithm based on size",
        bestFor: ["General use", "Unknown requirements", "Default choice"],
      },
    };
  }

  /**
   * Get algorithm description
   */
  static getAlgorithmDescription(algorithm: FFTAlgorithm): string {
    switch (algorithm) {
      case FFTAlgorithm.RADIX_2:
        return "Cooley-Tukey algorithm for power-of-2 sizes";
      case FFTAlgorithm.RADIX_4:
        return "Radix-4 Cooley-Tukey algorithm for power-of-4 sizes";
      case FFTAlgorithm.MIXED_RADIX:
        return "Bluestein's algorithm for arbitrary sizes";
      case FFTAlgorithm.REAL_FFT:
        return "Optimized FFT for real-valued signals";
      case FFTAlgorithm.AUTO:
        return "Automatically selects best algorithm based on size";
      default:
        return "Unknown algorithm";
    }
  }

  /**
   * Get factory statistics
   */
  static getFactoryStats(): {
    totalAlgorithms: number;
    implementedAlgorithms: number;
    supportedSizes: number;
    recommendations: number;
  } {
    return {
      totalAlgorithms: 5, // RADIX_2, RADIX_4, MIXED_RADIX, REAL_FFT, AUTO
      implementedAlgorithms: 4, // RADIX_2, RADIX_4, MIXED_RADIX, REAL_FFT
      supportedSizes: this.getPowerOf2Sizes().length + this.getPowerOf4Sizes().length,
      recommendations: Object.keys(this.getRecommendations()).length,
    };
  }
}

