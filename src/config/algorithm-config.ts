/**
 * @file Algorithm Configuration System
 *
 * Provides centralized configuration management for all algorithms in the
 * Reynard algorithms package. Supports both static configuration files and
 * dynamic calibration with machine-specific optimization profiles.
 *
 * @module algorithms/algorithmConfig
 */

import type {
  AlgorithmConfig,
  AlgorithmThresholds,
  AutoTuningConfig,
  MachineFingerprint,
  PerformanceTestConfig,
  ValidationConfig,
} from "./algorithm-config-types";
import { AlgorithmConfigManager } from "./algorithm-config-manager";

export type {
  AlgorithmConfig,
  AlgorithmThresholds,
  AutoTuningConfig,
  MachineFingerprint,
  PerformanceTestConfig,
  ValidationConfig,
};

export { AlgorithmConfigManager };

/**
 * Global configuration manager instance
 */
let globalConfigManager: AlgorithmConfigManager | null = null;

/**
 * Get the global configuration manager
 *
 * @returns Global configuration manager instance
 * @example
 */
export function getConfigManager(): AlgorithmConfigManager {
  if (!globalConfigManager) {
    globalConfigManager = new AlgorithmConfigManager();
  }
  return globalConfigManager;
}

/**
 * Initialize configuration with custom path
 *
 * @param configPath - Optional custom configuration file path
 * @returns Configuration manager instance
 * @example
 */
export function initializeConfig(configPath?: string): AlgorithmConfigManager {
  globalConfigManager = new AlgorithmConfigManager(configPath);
  return globalConfigManager;
}

/**
 * Get current algorithm configuration
 *
 * @returns Current algorithm configuration
 * @example
 */
export function getAlgorithmConfig(): AlgorithmConfig {
  return getConfigManager().getConfig();
}

/**
 * Update algorithm configuration
 *
 * @param updates - Partial configuration updates
 * @example
 */
export function updateAlgorithmConfig(updates: Partial<AlgorithmConfig>): void {
  getConfigManager().updateConfig(updates);
}

/**
 * Get machine-specific configuration
 *
 * @returns Machine-specific algorithm configuration
 * @example
 */
export function getMachineAlgorithmConfig(): AlgorithmConfig {
  return getConfigManager().getMachineConfig();
}
