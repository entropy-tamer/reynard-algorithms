/**
 * @file Immutable Global Configuration System
 *
 * Provides thread-safe, immutable configuration management to prevent race conditions.
 * Addresses Issue #8 - Race Conditions in Global Config.
 *
 * @module algorithmsImmutableConfig
 */
import { AlgorithmConfig, AlgorithmConfigManager } from "./algorithm-config";
import type { ImmutableConfigSnapshot, OptimizedCollisionConfig, ConfigChangeListener } from "./immutable-config-types";
export type { ImmutableConfigSnapshot, OptimizedCollisionConfig, ConfigChangeEvent, ConfigChangeListener, } from "./immutable-config-types";
/**
 * Immutable Global Configuration Manager
 *
 * Provides thread-safe configuration management with immutable snapshots
 * and change event notifications to prevent race conditions.
 */
export declare class ImmutableConfigManager {
    private currentSnapshot;
    private changeListeners;
    private readonly lock;
    private readonly configManager;
    /**
     * Create a new immutable configuration manager
     *
     * @param configManager - The algorithm configuration manager to use
     * @example
     * const configManager = new AlgorithmConfigManager();
     * const immutableManager = new ImmutableConfigManager(configManager);
     */
    constructor(configManager: AlgorithmConfigManager);
    /**
     * Get current immutable configuration snapshot
     *
     * @returns The current immutable configuration snapshot
     * @example
     * const snapshot = manager.getCurrentSnapshot();
     * console.log(snapshot.timestamp, snapshot.version);
     */
    getCurrentSnapshot(): ImmutableConfigSnapshot;
    /**
     * Get algorithm configuration (immutable)
     *
     * @returns The current immutable algorithm configuration
     * @example
     * const config = manager.getAlgorithmConfig();
     * console.log(config.thresholds.naiveToSpatial);
     */
    getAlgorithmConfig(): AlgorithmConfig;
    /**
     * Get optimization configuration (immutable)
     *
     * @returns The current immutable optimization configuration
     * @example
     * const config = manager.getOptimizationConfig();
     * console.log(config.enableMemoryPooling);
     */
    getOptimizationConfig(): OptimizedCollisionConfig;
    /**
     * Update configuration atomically
     *
     * @param algorithmUpdates - Partial algorithm configuration updates
     * @param optimizationUpdates - Partial optimization configuration updates
     * @returns Promise resolving to the new configuration snapshot
     * @example
     * const snapshot = await manager.updateConfig(
     *   { thresholds: { naiveToSpatial: 50 } },
     *   { enableMemoryPooling: false }
     * );
     */
    updateConfig(algorithmUpdates?: Partial<AlgorithmConfig>, optimizationUpdates?: Partial<OptimizedCollisionConfig>): Promise<ImmutableConfigSnapshot>;
    /**
     * Add configuration change listener
     *
     * @param listener - Function to call when configuration changes
     * @example
     * manager.addChangeListener((event) => {
     *   console.log('Config changed:', event.changedKeys);
     * });
     */
    addChangeListener(listener: ConfigChangeListener): void;
    /**
     * Remove configuration change listener
     *
     * @param listener - Function to remove from change listeners
     * @example
     * const listener = (event) => console.log(event);
     * manager.addChangeListener(listener);
     * manager.removeChangeListener(listener);
     */
    removeChangeListener(listener: ConfigChangeListener): void;
    /**
     * Create immutable configuration snapshot
     *
     * @returns A new immutable configuration snapshot
     * @example
     * const snapshot = this.createSnapshot();
     */
    private createSnapshot;
    /**
     * Update algorithm configuration and track changes
     *
     * @param updates - Partial algorithm configuration updates
     * @returns Array of changed key paths
     * @example
     * const changedKeys = this.updateAlgorithmConfig({ thresholds: { naiveToSpatial: 100 } });
     */
    private updateAlgorithmConfig;
    /**
     * Update optimization configuration and track changes
     *
     * @param updates - Partial optimization configuration updates
     * @returns Array of changed key paths
     * @example
     * const changedKeys = this.updateOptimizationConfigInternal({ enableCaching: false });
     */
    private updateOptimizationConfigInternal;
    /**
     * Notify listeners of configuration changes
     *
     * @param oldSnapshot - Previous configuration snapshot
     * @param newSnapshot - New configuration snapshot
     * @param changedKeys - Array of keys that changed
     * @example
     * this.notifyConfigChange(oldSnapshot, newSnapshot, ['algorithm.thresholds']);
     */
    private notifyConfigChange;
    /**
     * Validate configuration consistency
     *
     * @returns Validation result with isValid flag and error messages
     * @example
     * const result = manager.validateConfig();
     * if (!result.isValid) {
     *   console.error('Validation errors:', result.errors);
     * }
     */
    validateConfig(): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Get configuration diff between two snapshots
     *
     * @param oldSnapshot - Previous configuration snapshot
     * @param newSnapshot - New configuration snapshot
     * @returns Object containing algorithm and optimization changes
     * @example
     * const diff = manager.getConfigDiff(oldSnapshot, newSnapshot);
     * console.log('Algorithm changes:', diff.algorithmChanges);
     * console.log('Optimization changes:', diff.optimizationChanges);
     */
    getConfigDiff(oldSnapshot: ImmutableConfigSnapshot, newSnapshot: ImmutableConfigSnapshot): {
        algorithmChanges: Record<string, {
            old: unknown;
            new: unknown;
        }>;
        optimizationChanges: Record<string, {
            old: unknown;
            new: unknown;
        }>;
    };
}
export { getImmutableConfigManager, initializeImmutableConfig, getImmutableAlgorithmConfig, getImmutableOptimizationConfig, updateImmutableConfig, addConfigChangeListener, removeConfigChangeListener, } from "./immutable-config-utils";
//# sourceMappingURL=immutable-config.d.ts.map