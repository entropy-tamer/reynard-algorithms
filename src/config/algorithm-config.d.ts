/**
 * @file Algorithm Configuration System
 *
 * Provides centralized configuration management for all algorithms in the
 * Reynard algorithms package. Supports both static configuration files and
 * dynamic calibration with machine-specific optimization profiles.
 *
 * @module algorithms/algorithmConfig
 */
import type { AlgorithmConfig, AlgorithmThresholds, AutoTuningConfig, MachineFingerprint, PerformanceTestConfig, ValidationConfig } from "./algorithm-config-types";
import { AlgorithmConfigManager } from "./algorithm-config-manager";
export type { AlgorithmConfig, AlgorithmThresholds, AutoTuningConfig, MachineFingerprint, PerformanceTestConfig, ValidationConfig, };
export { AlgorithmConfigManager };
/**
 * Get the global configuration manager
 *
 * @returns Global configuration manager instance
 * @example
 */
export declare function getConfigManager(): AlgorithmConfigManager;
/**
 * Initialize configuration with custom path
 *
 * @param configPath - Optional custom configuration file path
 * @returns Configuration manager instance
 * @example
 */
export declare function initializeConfig(configPath?: string): AlgorithmConfigManager;
/**
 * Get current algorithm configuration
 *
 * @returns Current algorithm configuration
 * @example
 */
export declare function getAlgorithmConfig(): AlgorithmConfig;
/**
 * Update algorithm configuration
 *
 * @param updates - Partial configuration updates
 * @example
 */
export declare function updateAlgorithmConfig(updates: Partial<AlgorithmConfig>): void;
/**
 * Get machine-specific configuration
 *
 * @returns Machine-specific algorithm configuration
 * @example
 */
export declare function getMachineAlgorithmConfig(): AlgorithmConfig;
//# sourceMappingURL=algorithm-config.d.ts.map