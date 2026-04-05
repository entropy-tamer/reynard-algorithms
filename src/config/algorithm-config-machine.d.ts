/**
 * @file Machine-specific configuration utilities for algorithm configuration system
 */
import type { AlgorithmConfig, MachineFingerprint } from "./algorithm-config-types";
/**
 * Get machine-specific configuration from file
 *
 * @param baseConfig - Base configuration to merge with
 * @param machineFingerprint - Machine fingerprint for file lookup
 * @returns Machine-specific configuration or base config if unavailable
 * @example
 */
export declare function loadMachineConfig(baseConfig: AlgorithmConfig, machineFingerprint: MachineFingerprint | null): AlgorithmConfig;
/**
 * Save machine-specific configuration to file
 *
 * @param machineConfig - Machine-specific configuration to save
 * @param baseConfig - Base configuration for cache directory
 * @param machineFingerprint - Machine fingerprint for file naming
 * @example
 */
export declare function saveMachineConfig(machineConfig: Partial<AlgorithmConfig>, baseConfig: AlgorithmConfig, machineFingerprint: MachineFingerprint | null): void;
//# sourceMappingURL=algorithm-config-machine.d.ts.map