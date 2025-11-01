/**
 * Configuration manager implementation for algorithm configuration system
 * 
 * @file
 */

import type {
  AlgorithmConfig,
  MachineFingerprint,
} from './algorithm-config-types';
import { DEFAULT_CONFIG } from './algorithm-config-defaults';
import { getFs, getPath, isNodeEnvironment } from './algorithm-config-node-utils';
import { generateMachineFingerprint } from './algorithm-config-fingerprint';
import { mergeConfigs } from './algorithm-config-utils';
import { loadMachineConfig, saveMachineConfig as saveMachineConfigUtil } from './algorithm-config-machine';
import { validateConfig as validateConfigUtil } from './algorithm-config-utils';

/**
 * Configuration manager class
 */
export class AlgorithmConfigManager {
  private config: AlgorithmConfig;
  private configPath: string;
  private machineFingerprint: MachineFingerprint | null = null;

  constructor(configPath: string = './algorithm-config.json') {
    this.configPath = configPath;
    this.config = this.loadConfig();
    this.machineFingerprint = generateMachineFingerprint();
  }

  /**
   * Load configuration from file or create default
   * 
   * @returns Loaded or default configuration
   */
  private loadConfig(): AlgorithmConfig {
    const fs = getFs();
    if (fs && isNodeEnvironment()) {
      try {
        if (fs.existsSync(this.configPath)) {
          const configData = fs.readFileSync(this.configPath, 'utf-8');
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
   */
  public saveConfig(): void {
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
   */
  public getConfig(): AlgorithmConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   * 
   * @param updates - Partial configuration updates
   */
  public updateConfig(updates: Partial<AlgorithmConfig>): void {
    this.config = mergeConfigs(this.config, updates);
  }

  /**
   * Get machine-specific configuration
   * 
   * @returns Machine-specific configuration
   */
  public getMachineConfig(): AlgorithmConfig {
    return loadMachineConfig(this.config, this.machineFingerprint);
  }

  /**
   * Save machine-specific configuration
   * 
   * @param machineConfig - Machine-specific configuration to save
   */
  public saveMachineConfig(machineConfig: Partial<AlgorithmConfig>): void {
    saveMachineConfigUtil(machineConfig, this.config, this.machineFingerprint);
  }

  /**
   * Get machine fingerprint
   * 
   * @returns Machine fingerprint or null if not available
   */
  public getMachineFingerprint(): MachineFingerprint | null {
    return this.machineFingerprint;
  }


  /**
   * Reset configuration to defaults
   */
  public resetToDefaults(): void {
    this.config = { ...DEFAULT_CONFIG };
  }

  /**
   * Validate configuration
   * 
   * @returns Validation result with errors array
   */
  public validateConfig(): { isValid: boolean; errors: string[] } {
    return validateConfigUtil(this.config);
  }
}

