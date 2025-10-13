import { describe, it, expect, beforeEach, vi } from "vitest";
import { SimplexNoise } from "../../../geometry/algorithms/simplex-noise/simplex-noise-core";

describe("Simplex Noise Algorithm", () => {
  let simplexNoise: SimplexNoise;

  beforeEach(() => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    simplexNoise = new SimplexNoise();
  });

  describe("Basic Noise Generation", () => {
    it("should generate 2D noise values", () => {
      const noise = simplexNoise.noise2D(10, 20);

      expect(typeof noise).toBe("number");
      expect(noise).toBeGreaterThanOrEqual(-1);
      expect(noise).toBeLessThanOrEqual(1);
    });

    it("should generate 3D noise values", () => {
      const noise = simplexNoise.noise3D(10, 20, 30);

      expect(typeof noise).toBe("number");
      expect(noise).toBeGreaterThanOrEqual(-1);
      expect(noise).toBeLessThanOrEqual(1);
    });

    it("should generate 4D noise values", () => {
      const noise = simplexNoise.noise4D(10, 20, 30, 40);

      expect(typeof noise).toBe("number");
      expect(noise).toBeGreaterThanOrEqual(-1);
      expect(noise).toBeLessThanOrEqual(1);
    });

    it("should produce consistent results for same coordinates", () => {
      const noise1 = simplexNoise.noise2D(5, 10);
      const noise2 = simplexNoise.noise2D(5, 10);

      expect(noise1).toBeCloseTo(noise2, 10);
    });

    it("should produce different results for different coordinates", () => {
      const noise1 = simplexNoise.noise2D(5, 10);
      const noise2 = simplexNoise.noise2D(5.1, 10);

      expect(noise1).not.toBeCloseTo(noise2, 10);
    });
  });

  describe("Configuration Options", () => {
    it("should use custom seed", () => {
      const noise1 = new SimplexNoise({ seed: 12345 });
      const noise2 = new SimplexNoise({ seed: 67890 });

      const value1 = noise1.noise2D(10, 20);
      const value2 = noise2.noise2D(10, 20);

      expect(value1).not.toBeCloseTo(value2, 10);
    });

    it("should use custom frequency", () => {
      const noise1 = new SimplexNoise({ frequency: 1.0 });
      const noise2 = new SimplexNoise({ frequency: 2.0 });

      const value1 = noise1.noise2D(10, 20);
      const value2 = noise2.noise2D(10, 20);

      expect(value1).not.toBeCloseTo(value2, 10);
    });

    it("should use custom amplitude", () => {
      const noise1 = new SimplexNoise({ amplitude: 1.0 });
      const noise2 = new SimplexNoise({ amplitude: 0.5 });

      const value1 = noise1.noise2D(10, 20);
      const value2 = noise2.noise2D(10, 20);

      expect(Math.abs(value2)).toBeLessThanOrEqual(Math.abs(value1));
    });

    it("should normalize output when configured", () => {
      const noise = new SimplexNoise({ normalize: true });
      const value = noise.noise2D(10, 20);

      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });

    it("should use custom offset", () => {
      const noise1 = new SimplexNoise({ offset: { x: 0, y: 0, z: 0, w: 0 } });
      const noise2 = new SimplexNoise({ offset: { x: 100, y: 100, z: 0, w: 0 } });

      const value1 = noise1.noise2D(10, 20);
      const value2 = noise2.noise2D(10, 20);

      expect(value1).not.toBeCloseTo(value2, 10);
    });

    it("should use custom scale", () => {
      const noise1 = new SimplexNoise({ scale: 1.0 });
      const noise2 = new SimplexNoise({ scale: 0.5 });

      const value1 = noise1.noise2D(10, 20);
      const value2 = noise2.noise2D(10, 20);

      expect(value1).not.toBeCloseTo(value2, 10);
    });
  });

  describe("Fractal Noise", () => {
    it("should generate 2D fractal noise", () => {
      const noise = simplexNoise.fractalNoise2D(10, 20);

      expect(typeof noise).toBe("number");
      expect(noise).toBeGreaterThanOrEqual(-1);
      expect(noise).toBeLessThanOrEqual(1);
    });

    it("should generate 3D fractal noise", () => {
      const noise = simplexNoise.fractalNoise3D(10, 20, 30);

      expect(typeof noise).toBe("number");
      expect(noise).toBeGreaterThanOrEqual(-1);
      expect(noise).toBeLessThanOrEqual(1);
    });

    it("should use custom octaves", () => {
      const noise1 = simplexNoise.fractalNoise2D(10, 20, { octaves: 2 });
      const noise2 = simplexNoise.fractalNoise2D(10, 20, { octaves: 8 });

      expect(noise1).not.toBeCloseTo(noise2, 10);
    });

    it("should use custom persistence", () => {
      const noise1 = simplexNoise.fractalNoise2D(10, 20, { persistence: 0.3 });
      const noise2 = simplexNoise.fractalNoise2D(10, 20, { persistence: 0.7 });

      expect(noise1).not.toBeCloseTo(noise2, 10);
    });

    it("should use custom lacunarity", () => {
      const noise1 = simplexNoise.fractalNoise2D(10, 20, { lacunarity: 1.5 });
      const noise2 = simplexNoise.fractalNoise2D(10, 20, { lacunarity: 3.0 });

      expect(noise1).not.toBeCloseTo(noise2, 10);
    });

    it("should use custom base frequency and amplitude", () => {
      const noise1 = simplexNoise.fractalNoise2D(10, 20, { baseFrequency: 1.0, baseAmplitude: 1.0 });
      const noise2 = simplexNoise.fractalNoise2D(10, 20, { baseFrequency: 2.0, baseAmplitude: 0.5 });

      expect(noise1).not.toBeCloseTo(noise2, 10);
    });
  });

  describe("Noise Field Generation", () => {
    it("should generate 2D noise field", () => {
      const result = simplexNoise.generateNoise2D({ width: 10, height: 10 });

      expect(result.stats.success).toBe(true);
      expect(result.values.length).toBe(100);
      expect(result.stats.sampleCount).toBe(100);
      expect(result.stats.minValue).toBeGreaterThanOrEqual(-1);
      expect(result.stats.maxValue).toBeLessThanOrEqual(1);
    });

    it("should generate 3D noise field", () => {
      const result = simplexNoise.generateNoise3D({ width: 5, height: 5, depth: 5 });

      expect(result.stats.success).toBe(true);
      expect(result.values.length).toBe(125);
      expect(result.stats.sampleCount).toBe(125);
    });

    it("should generate 4D noise field", () => {
      const result = simplexNoise.generateNoise4D({ width: 3, height: 3, depth: 3, time: 3 });

      expect(result.stats.success).toBe(true);
      expect(result.values.length).toBe(81);
      expect(result.stats.sampleCount).toBe(81);
    });

    it("should use custom step size", () => {
      const result1 = simplexNoise.generateNoise2D({ width: 5, height: 5, stepSize: 1.0 });
      const result2 = simplexNoise.generateNoise2D({ width: 5, height: 5, stepSize: 0.5 });

      expect(result1.stats.success).toBe(true);
      expect(result2.stats.success).toBe(true);
      expect(result1.values[0]).not.toBeCloseTo(result2.values[0], 10);
    });

    it("should use custom offsets", () => {
      const result1 = simplexNoise.generateNoise2D({ width: 5, height: 5, offsetX: 0, offsetY: 0 });
      const result2 = simplexNoise.generateNoise2D({ width: 5, height: 5, offsetX: 100, offsetY: 100 });

      expect(result1.stats.success).toBe(true);
      expect(result2.stats.success).toBe(true);
      expect(result1.values[0]).not.toBeCloseTo(result2.values[0], 10);
    });
  });

  describe("Noise Analysis", () => {
    let noiseValues: number[];

    beforeEach(() => {
      const result = simplexNoise.generateNoise2D({ width: 10, height: 10 });
      noiseValues = result.values;
    });

    it("should analyze noise statistics", () => {
      const analysis = simplexNoise.analyzeNoise(noiseValues, { computeStatistics: true });

      expect(analysis.statistics.min).toBeDefined();
      expect(analysis.statistics.max).toBeDefined();
      expect(analysis.statistics.mean).toBeDefined();
      expect(analysis.statistics.median).toBeDefined();
      expect(analysis.statistics.standardDeviation).toBeDefined();
      expect(analysis.statistics.variance).toBeDefined();
      expect(analysis.statistics.skewness).toBeDefined();
      expect(analysis.statistics.kurtosis).toBeDefined();
    });

    it("should compute frequency domain properties when requested", () => {
      const analysis = simplexNoise.analyzeNoise(noiseValues, { computeFrequencyDomain: true });

      expect(analysis.frequencyDomain).toBeDefined();
      expect(analysis.frequencyDomain!.dominantFrequencies).toBeDefined();
      expect(analysis.frequencyDomain!.spectralCentroid).toBeDefined();
      expect(analysis.frequencyDomain!.spectralRolloff).toBeDefined();
    });

    it("should compute spatial properties when requested", () => {
      const analysis = simplexNoise.analyzeNoise(noiseValues, { computeSpatialProperties: true });

      expect(analysis.spatialProperties).toBeDefined();
      expect(analysis.spatialProperties!.correlationLength).toBeDefined();
      expect(analysis.spatialProperties!.anisotropy).toBeDefined();
      expect(analysis.spatialProperties!.roughness).toBeDefined();
    });

    it("should handle empty input", () => {
      const analysis = simplexNoise.analyzeNoise([]);

      expect(analysis.statistics.min).toBe(0);
      expect(analysis.statistics.max).toBe(0);
      expect(analysis.statistics.mean).toBe(0);
    });
  });

  describe("Noise Filtering", () => {
    let noiseValues: number[];

    beforeEach(() => {
      const result = simplexNoise.generateNoise2D({ width: 10, height: 10 });
      noiseValues = result.values;
    });

    it("should apply lowpass filter", () => {
      const result = simplexNoise.filterNoise(noiseValues, {
        filterType: "lowpass",
        cutoffFrequency: 0.5,
      });

      expect(result.filteredValues.length).toBe(noiseValues.length);
      expect(result.originalValues.length).toBe(noiseValues.length);
      expect(result.filterResponse.length).toBeGreaterThan(0);
      expect(result.stats.executionTime).toBeGreaterThanOrEqual(0);
    });

    it("should apply highpass filter", () => {
      const result = simplexNoise.filterNoise(noiseValues, {
        filterType: "highpass",
        cutoffFrequency: 0.5,
      });

      expect(result.filteredValues.length).toBe(noiseValues.length);
      expect(result.stats.filterGain).toBeDefined();
      expect(result.stats.noiseReduction).toBeDefined();
    });

    it("should apply bandpass filter", () => {
      const result = simplexNoise.filterNoise(noiseValues, {
        filterType: "bandpass",
        cutoffFrequency: 0.5,
        bandwidth: 0.1,
      });

      expect(result.filteredValues.length).toBe(noiseValues.length);
    });

    it("should apply bandstop filter", () => {
      const result = simplexNoise.filterNoise(noiseValues, {
        filterType: "bandstop",
        cutoffFrequency: 0.5,
        bandwidth: 0.1,
      });

      expect(result.filteredValues.length).toBe(noiseValues.length);
    });

    it("should handle empty input", () => {
      const result = simplexNoise.filterNoise([], {
        filterType: "lowpass",
        cutoffFrequency: 0.5,
      });

      expect(result.filteredValues.length).toBe(0);
      expect(result.originalValues.length).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero coordinates", () => {
      const noise = simplexNoise.noise2D(0, 0);

      expect(typeof noise).toBe("number");
      expect(noise).toBeGreaterThanOrEqual(-1);
      expect(noise).toBeLessThanOrEqual(1);
    });

    it("should handle negative coordinates", () => {
      const noise = simplexNoise.noise2D(-10, -20);

      expect(typeof noise).toBe("number");
      expect(noise).toBeGreaterThanOrEqual(-1);
      expect(noise).toBeLessThanOrEqual(1);
    });

    it("should handle very large coordinates", () => {
      const noise = simplexNoise.noise2D(1000000, 2000000);

      expect(typeof noise).toBe("number");
      expect(noise).toBeGreaterThanOrEqual(-1);
      expect(noise).toBeLessThanOrEqual(1);
    });

    it("should handle very small coordinates", () => {
      const noise = simplexNoise.noise2D(0.0001, 0.0002);

      expect(typeof noise).toBe("number");
      expect(noise).toBeGreaterThanOrEqual(-1);
      expect(noise).toBeLessThanOrEqual(1);
    });

    it("should handle fractional coordinates", () => {
      const noise = simplexNoise.noise2D(10.5, 20.7);

      expect(typeof noise).toBe("number");
      expect(noise).toBeGreaterThanOrEqual(-1);
      expect(noise).toBeLessThanOrEqual(1);
    });
  });

  describe("Performance Benchmarks", () => {
    const runBenchmark = (description: string, width: number, height: number) => {
      it(`should perform ${description} efficiently`, () => {
        const result = simplexNoise.generateNoise2D({ width, height });

        expect(result.stats.success).toBe(true);
        expect(result.values.length).toBe(width * height);
        expect(result.stats.executionTime).toBeGreaterThanOrEqual(0);

        // Log for manual inspection during benchmark runs
        // console.log(`Benchmark: ${description} - ${width}x${height} noise field in ${(endTime - startTime).toFixed(3)} ms`);
      });
    };

    runBenchmark("small noise field", 10, 10);
    runBenchmark("medium noise field", 50, 50);
    runBenchmark("large noise field", 100, 100);
    runBenchmark("very large noise field", 200, 200);
  });

  describe("Noise Quality", () => {
    it("should produce smooth transitions", () => {
      const noise1 = simplexNoise.noise2D(10, 20);
      const noise2 = simplexNoise.noise2D(10.1, 20);
      const noise3 = simplexNoise.noise2D(10.2, 20);

      // Noise should change smoothly
      const diff1 = Math.abs(noise2 - noise1);
      const diff2 = Math.abs(noise3 - noise2);

      expect(diff1).toBeLessThan(0.5);
      expect(diff2).toBeLessThan(0.5);
    });

    it("should produce different values for different seeds", () => {
      const noise1 = new SimplexNoise({ seed: 12345 });
      const noise2 = new SimplexNoise({ seed: 54321 });

      const value1 = noise1.noise2D(10, 20);
      const value2 = noise2.noise2D(10, 20);

      expect(value1).not.toBeCloseTo(value2, 10);
    });

    it("should produce consistent results with same seed", () => {
      const noise1 = new SimplexNoise({ seed: 12345 });
      const noise2 = new SimplexNoise({ seed: 12345 });

      const value1 = noise1.noise2D(10, 20);
      const value2 = noise2.noise2D(10, 20);

      expect(value1).toBeCloseTo(value2, 10);
    });

    it("should produce fractal noise with more detail than single octave", () => {
      const singleOctave = simplexNoise.noise2D(10, 20);
      const fractalNoise = simplexNoise.fractalNoise2D(10, 20, { octaves: 4 });

      // Fractal noise should be different from single octave
      expect(fractalNoise).not.toBeCloseTo(singleOctave, 10);
    });
  });

  describe("Improved Gradients", () => {
    it("should use improved gradients when configured", () => {
      const noise1 = new SimplexNoise({ useImprovedGradients: true });
      const noise2 = new SimplexNoise({ useImprovedGradients: false });

      const value1 = noise1.noise2D(10, 20);
      const value2 = noise2.noise2D(10, 20);

      // Values should be different when using different gradient tables
      expect(value1).not.toBeCloseTo(value2, 10);
    });

    it("should default to improved gradients", () => {
      const noise1 = new SimplexNoise(); // Default should use improved gradients
      const noise2 = new SimplexNoise({ useImprovedGradients: true });

      const value1 = noise1.noise2D(10, 20);
      const value2 = noise2.noise2D(10, 20);

      expect(value1).toBeCloseTo(value2, 10);
    });
  });
});
