/**
 * @file Machine-specific configuration utilities for algorithm configuration system
 */

import type { AlgorithmConfig, MachineFingerprint } from "./algorithm-config-types";
import { getFs, getPath } from "./algorithm-config-node-utils";
import { mergeConfigs } from "./algorithm-config-utils";

/**
 * Get machine-specific configuration from file
 *
 * @param baseConfig - Base configuration to merge with
 * @param machineFingerprint - Machine fingerprint for file lookup
 * @returns Machine-specific configuration or base config if unavailable
 * @example
 */
export function loadMachineConfig(
  baseConfig: AlgorithmConfig,
  machineFingerprint: MachineFingerprint | null
): AlgorithmConfig {
  if (!machineFingerprint) {
    return baseConfig;
  }

  const path = getPath();
  const fs = getFs();
  if (!path || !fs) return baseConfig;

  const machineConfigPath = path.join(
    baseConfig.autoTuning.calibrationCacheDir,
    `config-${machineFingerprint.hash}.json`
  );

  try {
    if (fs.existsSync(machineConfigPath)) {
      const machineData = fs.readFileSync(machineConfigPath, "utf-8");
      const machineConfig = JSON.parse(machineData) as Partial<AlgorithmConfig>;
      return mergeConfigs(baseConfig, machineConfig);
    }
  } catch (error) {
    console.warn(`Failed to load machine config from ${machineConfigPath}:`, error);
  }

  return baseConfig;
}

/**
 * Save machine-specific configuration to file
 *
 * @param machineConfig - Machine-specific configuration to save
 * @param baseConfig - Base configuration for cache directory
 * @param machineFingerprint - Machine fingerprint for file naming
 * @example
 */
export function saveMachineConfig(
  machineConfig: Partial<AlgorithmConfig>,
  baseConfig: AlgorithmConfig,
  machineFingerprint: MachineFingerprint | null
): void {
  if (!machineFingerprint) {
    return;
  }

  const fs = getFs();
  if (!fs) return; // No-op in browser

  const cacheDir = baseConfig.autoTuning.calibrationCacheDir;
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const path = getPath();
  const machineConfigPath = path
    ? path.join(cacheDir, `config-${machineFingerprint.hash}.json`)
    : `${cacheDir}/config-${machineFingerprint.hash}.json`;

  try {
    fs.writeFileSync(machineConfigPath, JSON.stringify(machineConfig, null, 2));
  } catch (error) {
    console.error(`Failed to save machine config to ${machineConfigPath}:`, error);
  }
}
