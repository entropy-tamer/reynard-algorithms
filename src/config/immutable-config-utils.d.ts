/**
 * @file Global utility functions for immutable configuration management
 */
import { AlgorithmConfig } from "./algorithm-config";
import { ImmutableConfigManager } from "./immutable-config";
import type { ImmutableConfigSnapshot, OptimizedCollisionConfig, ConfigChangeListener } from "./immutable-config-types";
/**
 * Get the global immutable configuration manager
 *
 * @returns The global immutable configuration manager instance
 * @example
 * const manager = getImmutableConfigManager();
 * const config = manager.getAlgorithmConfig();
 */
export declare function getImmutableConfigManager(): ImmutableConfigManager;
/**
 * Initialize immutable configuration with custom path
 *
 * @param configPath - Optional path to configuration file
 * @returns The initialized immutable configuration manager
 * @example
 * const manager = initializeImmutableConfig('/path/to/config.json');
 */
export declare function initializeImmutableConfig(configPath?: string): ImmutableConfigManager;
/**
 * Get current immutable algorithm configuration
 *
 * @returns The current immutable algorithm configuration
 * @example
 * const config = getImmutableAlgorithmConfig();
 * console.log(config.thresholds);
 */
export declare function getImmutableAlgorithmConfig(): AlgorithmConfig;
/**
 * Get current immutable optimization configuration
 *
 * @returns The current immutable optimization configuration
 * @example
 * const config = getImmutableOptimizationConfig();
 * console.log(config.enableMemoryPooling);
 */
export declare function getImmutableOptimizationConfig(): OptimizedCollisionConfig;
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
export declare function updateImmutableConfig(algorithmUpdates?: Partial<AlgorithmConfig>, optimizationUpdates?: Partial<OptimizedCollisionConfig>): Promise<ImmutableConfigSnapshot>;
/**
 * Add configuration change listener
 *
 * @param listener - Function to call when configuration changes
 * @example
 * addConfigChangeListener((event) => {
 *   console.log('Config changed:', event.changedKeys);
 * });
 */
export declare function addConfigChangeListener(listener: ConfigChangeListener): void;
/**
 * Remove configuration change listener
 *
 * @param listener - Function to remove from change listeners
 * @example
 * const listener = (event) => console.log(event);
 * addConfigChangeListener(listener);
 * removeConfigChangeListener(listener);
 */
export declare function removeConfigChangeListener(listener: ConfigChangeListener): void;
//# sourceMappingURL=immutable-config-utils.d.ts.map