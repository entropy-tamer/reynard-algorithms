/**
 * @file Configuration manager implementation for algorithm configuration system
 */
import type { AlgorithmConfig, MachineFingerprint } from "./algorithm-config-types";
/**
 * Configuration manager class
 */
export declare class AlgorithmConfigManager {
    private config;
    private configPath;
    private machineFingerprint;
    /**
     *
     * @param configPath
     * @example
     */
    constructor(configPath?: string);
    /**
     * Load configuration from file or create default
     *
     * @returns Loaded or default configuration
     * @example
     */
    private loadConfig;
    /**
     * Save configuration to file
     * @example
     */
    saveConfig(): void;
    /**
     * Get current configuration
     *
     * @returns Current configuration copy
     * @example
     */
    getConfig(): AlgorithmConfig;
    /**
     * Update configuration
     *
     * @param updates - Partial configuration updates
     * @example
     */
    updateConfig(updates: Partial<AlgorithmConfig>): void;
    /**
     * Get machine-specific configuration
     *
     * @returns Machine-specific configuration
     * @example
     */
    getMachineConfig(): AlgorithmConfig;
    /**
     * Save machine-specific configuration
     *
     * @param machineConfig - Machine-specific configuration to save
     * @example
     */
    saveMachineConfig(machineConfig: Partial<AlgorithmConfig>): void;
    /**
     * Get machine fingerprint
     *
     * @returns Machine fingerprint or null if not available
     * @example
     */
    getMachineFingerprint(): MachineFingerprint | null;
    /**
     * Reset configuration to defaults
     * @example
     */
    resetToDefaults(): void;
    /**
     * Validate configuration
     *
     * @returns Validation result with errors array
     * @example
     */
    validateConfig(): {
        isValid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=algorithm-config-manager.d.ts.map