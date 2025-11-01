/**
 * Global utility functions for immutable configuration management
 * 
 * @file
 */

import { AlgorithmConfig, AlgorithmConfigManager } from './algorithm-config';
import { ImmutableConfigManager } from './immutable-config';
import type {
  ImmutableConfigSnapshot,
  OptimizedCollisionConfig,
  ConfigChangeListener,
} from './immutable-config-types';

/**
 * Global immutable configuration manager instance
 */
let globalImmutableConfigManager: ImmutableConfigManager | null = null;

/**
 * Get the global immutable configuration manager
 * 
 * @returns The global immutable configuration manager instance
 * @example
 * const manager = getImmutableConfigManager();
 * const config = manager.getAlgorithmConfig();
 */
export function getImmutableConfigManager(): ImmutableConfigManager {
  if (!globalImmutableConfigManager) {
    const configManager = new AlgorithmConfigManager();
    globalImmutableConfigManager = new ImmutableConfigManager(configManager);
  }
  return globalImmutableConfigManager;
}

/**
 * Initialize immutable configuration with custom path
 * 
 * @param configPath - Optional path to configuration file
 * @returns The initialized immutable configuration manager
 * @example
 * const manager = initializeImmutableConfig('/path/to/config.json');
 */
export function initializeImmutableConfig(configPath?: string): ImmutableConfigManager {
  const configManager = new AlgorithmConfigManager(configPath);
  globalImmutableConfigManager = new ImmutableConfigManager(configManager);
  return globalImmutableConfigManager;
}

/**
 * Get current immutable algorithm configuration
 * 
 * @returns The current immutable algorithm configuration
 * @example
 * const config = getImmutableAlgorithmConfig();
 * console.log(config.thresholds);
 */
export function getImmutableAlgorithmConfig(): AlgorithmConfig {
  return getImmutableConfigManager().getAlgorithmConfig();
}

/**
 * Get current immutable optimization configuration
 * 
 * @returns The current immutable optimization configuration
 * @example
 * const config = getImmutableOptimizationConfig();
 * console.log(config.enableMemoryPooling);
 */
export function getImmutableOptimizationConfig(): OptimizedCollisionConfig {
  return getImmutableConfigManager().getOptimizationConfig();
}

/**
 * Update configuration atomically
 * 
 * @param algorithmUpdates - Partial algorithm configuration updates
 * @param optimizationUpdates - Partial optimization configuration updates
 * @returns Promise resolving to the new configuration snapshot
 * @example
 * await updateImmutableConfig(
 *   { thresholds: { naiveToSpatial: 50 } },
 *   { enableMemoryPooling: false }
 * );
 */
export async function updateImmutableConfig(
  algorithmUpdates?: Partial<AlgorithmConfig>,
  optimizationUpdates?: Partial<OptimizedCollisionConfig>
): Promise<ImmutableConfigSnapshot> {
  return getImmutableConfigManager().updateConfig(algorithmUpdates, optimizationUpdates);
}

/**
 * Add configuration change listener
 * 
 * @param listener - Function to call when configuration changes
 * @example
 * addConfigChangeListener((event) => {
 *   console.log('Config changed:', event.changedKeys);
 * });
 */
export function addConfigChangeListener(listener: ConfigChangeListener): void {
  getImmutableConfigManager().addChangeListener(listener);
}

/**
 * Remove configuration change listener
 * 
 * @param listener - Function to remove from change listeners
 * @example
 * const listener = (event) => console.log(event);
 * addConfigChangeListener(listener);
 * removeConfigChangeListener(listener);
 */
export function removeConfigChangeListener(listener: ConfigChangeListener): void {
  getImmutableConfigManager().removeChangeListener(listener);
}


