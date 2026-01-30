/**
 * @file Configuration utility functions for algorithm configuration system
 */

import type { AlgorithmConfig } from "./algorithm-config-types";

/**
 * Deep merge two configuration objects
 *
 * @param base - Base configuration object
 * @param override - Override configuration object
 * @returns Merged configuration
 * @example
 */
export function mergeConfigs(
  base: AlgorithmConfig | Partial<AlgorithmConfig> | Record<string, unknown>,
  override: Partial<AlgorithmConfig> | Record<string, unknown>
): AlgorithmConfig {
  const baseRecord = base as Record<string, unknown>;
  const overrideRecord = override as Record<string, unknown>;
  const result = { ...baseRecord };

  for (const key in overrideRecord) {
    const overrideValue = overrideRecord[key];
    if (overrideValue !== null && typeof overrideValue === "object" && !Array.isArray(overrideValue)) {
      result[key] = mergeConfigs(
        (baseRecord[key] as Record<string, unknown>) || {},
        overrideValue as Record<string, unknown>
      );
    } else {
      result[key] = overrideValue;
    }
  }

  return result as unknown as AlgorithmConfig;
}

/**
 * Validate configuration
 *
 * @param config - Configuration to validate
 * @returns Validation result with errors array
 * @example
 */
export function validateConfig(config: AlgorithmConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate thresholds
  if (config.thresholds.naiveToSpatial < 0) {
    errors.push("naiveToSpatial threshold must be >= 0");
  }
  if (config.thresholds.spatialToOptimized < config.thresholds.naiveToSpatial) {
    errors.push("spatialToOptimized must be >= naiveToSpatial");
  }

  // Validate performance config
  if (config.performance.statistics.sampleCount < 1) {
    errors.push("sampleCount must be >= 1");
  }
  if (config.performance.statistics.maxCoefficientOfVariation < 0) {
    errors.push("maxCoefficientOfVariation must be >= 0");
  }

  // Validate validation config
  if (config.validation.maxValidationDepth < 1) {
    errors.push("maxValidationDepth must be >= 1");
  }
  if (config.validation.validationTimeout < 0) {
    errors.push("validationTimeout must be >= 0");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
