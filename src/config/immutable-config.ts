/**
 * Immutable Global Configuration System
 * 
 * Provides thread-safe, immutable configuration management to prevent race conditions.
 * Addresses Issue #8 - Race Conditions in Global Config.
 * 
 * @file
 * @module algorithmsImmutableConfig
 */

import { AlgorithmConfig, AlgorithmConfigManager } from './algorithm-config';
import type {
  ImmutableConfigSnapshot,
  OptimizedCollisionConfig,
  ConfigChangeEvent,
  ConfigChangeListener,
} from './immutable-config-types';
import {
  getConfigDiff as getConfigDiffHelper,
  validateConfig as validateConfigHelper,
  createSnapshot as createSnapshotHelper,
  DEFAULT_OPTIMIZATION_CONFIG,
  trackChanges,
} from './immutable-config-helpers';

// Re-export types for backwards compatibility
export type {
  ImmutableConfigSnapshot,
  OptimizedCollisionConfig,
  ConfigChangeEvent,
  ConfigChangeListener,
} from './immutable-config-types';

/**
 * Immutable Global Configuration Manager
 * 
 * Provides thread-safe configuration management with immutable snapshots
 * and change event notifications to prevent race conditions.
 */
export class ImmutableConfigManager {
  private currentSnapshot: ImmutableConfigSnapshot;
  private changeListeners: Set<ConfigChangeListener> = new Set();
  private readonly lock = new Map<string, boolean>();
  private readonly configManager: AlgorithmConfigManager;

  /**
   * Create a new immutable configuration manager
   * 
   * @param configManager - The algorithm configuration manager to use
   * @example
   * const configManager = new AlgorithmConfigManager();
   * const immutableManager = new ImmutableConfigManager(configManager);
   */
  constructor(configManager: AlgorithmConfigManager) {
    this.configManager = configManager;
    this.currentSnapshot = this.createSnapshot();
  }

  /**
   * Get current immutable configuration snapshot
   * 
   * @returns The current immutable configuration snapshot
   * @example
   * const snapshot = manager.getCurrentSnapshot();
   * console.log(snapshot.timestamp, snapshot.version);
   */
  getCurrentSnapshot(): ImmutableConfigSnapshot {
    return this.currentSnapshot;
  }

  /**
   * Get algorithm configuration (immutable)
   * 
   * @returns The current immutable algorithm configuration
   * @example
   * const config = manager.getAlgorithmConfig();
   * console.log(config.thresholds.naiveToSpatial);
   */
  getAlgorithmConfig(): AlgorithmConfig {
    return this.currentSnapshot.algorithmConfig;
  }

  /**
   * Get optimization configuration (immutable)
   * 
   * @returns The current immutable optimization configuration
   * @example
   * const config = manager.getOptimizationConfig();
   * console.log(config.enableMemoryPooling);
   */
  getOptimizationConfig(): OptimizedCollisionConfig {
    return this.currentSnapshot.optimizationConfig;
  }

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
  async updateConfig(
    algorithmUpdates?: Partial<AlgorithmConfig>,
    optimizationUpdates?: Partial<OptimizedCollisionConfig>
  ): Promise<ImmutableConfigSnapshot> {
    const lockKey = 'config_update';
    
    // Acquire lock to prevent race conditions
    if (this.lock.get(lockKey)) {
      throw new Error('Configuration update already in progress');
    }

    try {
      this.lock.set(lockKey, true);

      const oldSnapshot = this.currentSnapshot;
      const changedKeys: string[] = [];

      // Update algorithm config if provided
      if (algorithmUpdates) {
        changedKeys.push(...this.updateAlgorithmConfig(algorithmUpdates));
      }

      // Update optimization config if provided
      if (optimizationUpdates) {
        changedKeys.push(...this.updateOptimizationConfigInternal(optimizationUpdates));
      }

      // Create new snapshot
      const newSnapshot = this.createSnapshot();

      // Only update if there were actual changes
      if (changedKeys.length > 0) {
        this.currentSnapshot = newSnapshot;

        // Notify listeners
        this.notifyConfigChange(oldSnapshot, newSnapshot, changedKeys);
      }

      return newSnapshot;
    } finally {
      this.lock.delete(lockKey);
    }
  }

  /**
   * Add configuration change listener
   * 
   * @param listener - Function to call when configuration changes
   * @example
   * manager.addChangeListener((event) => {
   *   console.log('Config changed:', event.changedKeys);
   * });
   */
  addChangeListener(listener: ConfigChangeListener): void {
    this.changeListeners.add(listener);
  }

  /**
   * Remove configuration change listener
   * 
   * @param listener - Function to remove from change listeners
   * @example
   * const listener = (event) => console.log(event);
   * manager.addChangeListener(listener);
   * manager.removeChangeListener(listener);
   */
  removeChangeListener(listener: ConfigChangeListener): void {
    this.changeListeners.delete(listener);
  }

  /**
   * Create immutable configuration snapshot
   * 
   * @returns A new immutable configuration snapshot
   * @example
   * const snapshot = this.createSnapshot();
   */
  private createSnapshot(): ImmutableConfigSnapshot {
    return createSnapshotHelper(
      this.configManager.getConfig(),
      this.currentSnapshot?.optimizationConfig ?? DEFAULT_OPTIMIZATION_CONFIG
    );
  }

  /**
   * Update algorithm configuration and track changes
   * 
   * @param updates - Partial algorithm configuration updates
   * @returns Array of changed key paths
   * @example
   * const changedKeys = this.updateAlgorithmConfig({ thresholds: { naiveToSpatial: 100 } });
   */
  private updateAlgorithmConfig(updates: Partial<AlgorithmConfig>): string[] {
    const current = this.configManager.getConfig();
    const updated = { ...current, ...updates };
    const currentRecord = current as unknown as Record<string, unknown>;
    const newRecord = updated as unknown as Record<string, unknown>;
    const changedKeys = trackChanges(updates, currentRecord, newRecord, 'algorithm');
    this.configManager.updateConfig(updated);
    return changedKeys;
  }

  /**
   * Update optimization configuration and track changes
   * 
   * @param updates - Partial optimization configuration updates
   * @returns Array of changed key paths
   * @example
   * const changedKeys = this.updateOptimizationConfigInternal({ enableCaching: false });
   */
  private updateOptimizationConfigInternal(updates: Partial<OptimizedCollisionConfig>): string[] {
    const current = this.currentSnapshot.optimizationConfig;
    const updated = { ...current, ...updates };
    const currentRecord = current as unknown as Record<string, unknown>;
    const newRecord = updated as unknown as Record<string, unknown>;
    const changedKeys = trackChanges(updates, currentRecord, newRecord, 'optimization');
    this.currentSnapshot = {
      ...this.currentSnapshot,
      optimizationConfig: Object.freeze(updated),
    };
    return changedKeys;
  }

  /**
   * Notify listeners of configuration changes
   * 
   * @param oldSnapshot - Previous configuration snapshot
   * @param newSnapshot - New configuration snapshot
   * @param changedKeys - Array of keys that changed
   * @example
   * this.notifyConfigChange(oldSnapshot, newSnapshot, ['algorithm.thresholds']);
   */
  private notifyConfigChange(
    oldSnapshot: ImmutableConfigSnapshot,
    newSnapshot: ImmutableConfigSnapshot,
    changedKeys: string[]
  ): void {
    const event: ConfigChangeEvent = {
      type: 'config_changed',
      oldSnapshot,
      newSnapshot,
      changedKeys,
      timestamp: Date.now(),
    };

    for (const listener of this.changeListeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in configuration change listener:', error);
      }
    }
  }

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
  validateConfig(): { isValid: boolean; errors: string[] } {
    return validateConfigHelper(this.currentSnapshot.algorithmConfig);
  }

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
    algorithmChanges: Record<string, { old: unknown; new: unknown }>;
    optimizationChanges: Record<string, { old: unknown; new: unknown }>;
  } {
    return getConfigDiffHelper(oldSnapshot, newSnapshot);
  }
}

// Re-export utility functions for backwards compatibility
export {
  getImmutableConfigManager,
  initializeImmutableConfig,
  getImmutableAlgorithmConfig,
  getImmutableOptimizationConfig,
  updateImmutableConfig,
  addConfigChangeListener,
  removeConfigChangeListener,
} from './immutable-config-utils';
