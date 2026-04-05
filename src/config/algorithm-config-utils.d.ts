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
export declare function mergeConfigs(base: AlgorithmConfig | Partial<AlgorithmConfig> | Record<string, unknown>, override: Partial<AlgorithmConfig> | Record<string, unknown>): AlgorithmConfig;
/**
 * Validate configuration
 *
 * @param config - Configuration to validate
 * @returns Validation result with errors array
 * @example
 */
export declare function validateConfig(config: AlgorithmConfig): {
    isValid: boolean;
    errors: string[];
};
//# sourceMappingURL=algorithm-config-utils.d.ts.map