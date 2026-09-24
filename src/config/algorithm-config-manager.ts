/**
 * @file Configuration manager implementation for algorithm configuration system
 */

import type { AlgorithmConfig, MachineFingerprint } from "./algorithm-config-types";
import { DEFAULT_CONFIG } from "./algorithm-config-defaults";
import { getFs, getPath, isNodeEnvironment } from "./algorithm-config-node-utils";
import { generateMachineFingerprint } from "./algorithm-config-fingerprint";
import { mergeConfigs } from "./algorithm-config-utils";
import { loadMachineConfig, saveMachineConfig as saveMachineConfigUtil } from "./algorithm-config-machine";
import { validateConfig as validateConfigUtil } from "./algorithm-config-utils";

/**
 * Configuration manager class — lazy-loads on first access to avoid breaking browser builds.
 * All I/O operations are deferred until the configuration is actually needed.
 */
export class AlgorithmConfigManager {
  private config: AlgorithmConfig | null = null;
  private _loaded = false;
  private configPath: string;
  private _fingerprintSet = false;
  private machineFingerprint: MachineFingerprint | null;

  /**
   * @param configPath path to config file (default: ./algorithm-config.json)
   * @example
   */
    /**
   * @param configPath path to config file (default: ./algorithm-config.json)
   * @example
   */
  constructor(configPath: string = "./algorithm-config.json") {
    this.configPath = configPath;
    // Defer fingerprint generation — getOs() calls require('os') which fails in browser builds
    this.machineFingerprint = null as unknown as MachineFingerprint | null;
  }

  private ensureFingerprint(): void {
    if (this._fingerprintSet) return;
    this._fingerprintSet = true;
    try { this.machineFingerprint = generateMachineFingerprint(); } catch { /* browser */ }
  }

  private ensureLoaded(): void {
    if (this._loaded) return;
    try {
      this.config = this.loadConfig();
    } catch { /* ignore load errors in browser */ }
    finally {
      this._loaded = true;
    }
  }

  /**
   * Load configuration from file or create default
   *
   * @returns Loaded or default configuration
   * @example
   */
  private loadConfig(): AlgorithmConfig {
    const fs = getFs();
    if (fs && isNodeEnvironment()) {
      try {
        if (fs.existsSync(this.configPath)) {
          const configData = fs.readFileSync(this.configPath, "utf-8");
          const loadedConfig = JSON.parse(configData) as AlgorithmConfig;
          return mergeConfigs(DEFAULT_CONFIG, loadedConfig);
        }
      } catch (error) {
        console.warn(`Failed to load config from ${this.configPath}:`, error);
      }
    }

    return { ...DEFAULT_CONFIG };
  }

  /**
   * Save configuration to file
   * @example
   */
  public saveConfig(): void {
    this.ensureLoaded();
    if (!this._loaded) return; // No-op in browser
    const fs = getFs();
    const path = getPath();
    if (!fs || !path) return; // No-op in browser
    try {
      const configDir = path.dirname(this.configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error(`Failed to save config to ${this.configPath}:`, error);
    }
  }

  /**
   * Get current configuration
   *
   * @returns Current configuration copy
   * @example
   */
  public getConfig(): AlgorithmConfig {
    this.ensureLoaded();
    if (!this._loaded) return { ...DEFAULT_CONFIG };
    return { ...this.config };
  }

  /**
   * Update configuration
   *
   * @param updates - Partial configuration updates
   * @example
   */
  public updateConfig(updates: Partial<AlgorithmConfig>): void {
    this.ensureLoaded();
    if (!this._loaded) return; // No-op in browser
    this.config = mergeConfigs(this.config, updates);
  }

  /**
   * Get machine-specific configuration
   *
   * @returns Machine-specific configuration
   * @example
   */
  public getMachineConfig(): AlgorithmConfig {
    this.ensureLoaded();
    if (!this._loaded) return { ...DEFAULT_CONFIG };
    return loadMachineConfig(this.config!, this.machineFingerprint);
  }

  /**
   * Save machine-specific configuration
   *
   * @param machineConfig - Machine-specific configuration to save
   * @example
   */
  public saveMachineConfig(machineConfig: Partial<AlgorithmConfig>): void {
    this.ensureLoaded();
    if (!this._loaded) return; // No-op in browser
    saveMachineConfigUtil(machineConfig, this.config!, this.machineFingerprint);
  }

  /**
   * Get machine fingerprint
   *
   * @returns Machine fingerprint or null if not available
   * @example
   */
    public getMachineFingerprint(): MachineFingerprint | null {
    this.ensureFingerprint();
    if (this._fingerprintSet) return this.machineFingerprint as MachineFingerprint | null;
    // generateMachineFingerprint returned null — create a basic one
    try { return generateMachineFingerprint() ?? null; } catch { return null; }
  }

  /**
   * Reset configuration to defaults
   * @example
   */
  public resetToDefaults(): void {
    this.ensureLoaded();
    if (!this._loaded) return; // No-op in browser
    this.config = { ...DEFAULT_CONFIG };
  }

  /**
   * Validate configuration
   *
   * @returns Validation result with errors array
   * @example
   */
  public validateConfig(): { isValid: boolean; errors: string[] } {
    this.ensureLoaded();
    if (!this._loaded) return { isValid: true, errors: [] };
    return validateConfigUtil(this.config!);
  }
}
