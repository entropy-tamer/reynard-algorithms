/**
 * @file Type definitions for algorithm configuration system
 */

/**
 * Machine fingerprint for caching calibration results
 */
export interface MachineFingerprint {
  /** CPU architecture */
  arch: string;
  /** Platform (win32, darwin, linux) */
  platform: string;
  /** Number of CPU cores */
  cores: number;
  /** Total system memory in bytes */
  totalMemory: number;
  /** CPU model string */
  cpuModel: string;
  /** Node.js version */
  nodeVersion: string;
  /** Unique hash of the fingerprint */
  hash: string;
}

/**
 * Algorithm selection thresholds
 */
export interface AlgorithmThresholds {
  /** Threshold for naive → spatial collision detection */
  naiveToSpatial: number;
  /** Threshold for spatial → optimized collision detection */
  spatialToOptimized: number;
  /** Threshold for pathfinding algorithm selection */
  pathfindingThreshold: number;
  /** Threshold for spatial hash cell size optimization */
  spatialHashThreshold: number;
}

/**
 * Performance test configuration
 */
export interface PerformanceTestConfig {
  /** Enable dynamic calibration for performance tests */
  enableDynamicCalibration: boolean;
  /** Statistical parameters for performance assertions */
  statistics: {
    /** Number of samples to run for statistical analysis */
    sampleCount: number;
    /** Maximum coefficient of variation (std dev / mean) */
    maxCoefficientOfVariation: number;
    /** Tolerance factor for performance assertions */
    toleranceFactor: number;
    /** Whether to remove outliers before analysis */
    removeOutliers: boolean;
    /** Outlier detection threshold (standard deviations) */
    outlierThreshold: number;
  };
  /** Baseline performance metrics (ms) */
  baselines: {
    /** Small dataset performance baseline */
    smallDataset: number;
    /** Medium dataset performance baseline */
    mediumDataset: number;
    /** Large dataset performance baseline */
    largeDataset: number;
  };
}

/**
 * Validation configuration
 */
export interface ValidationConfig {
  /** Enable comprehensive input validation */
  enableInputValidation: boolean;
  /** Enable detailed validation results */
  enableDetailedResults: boolean;
  /** Maximum validation depth for recursive structures */
  maxValidationDepth: number;
  /** Timeout for validation operations (ms) */
  validationTimeout: number;
  /** Custom validation rules */
  customRules: Record<string, unknown>;
}

/**
 * Auto-tuning configuration
 */
export interface AutoTuningConfig {
  /** Enable auto-tuning system */
  enabled: boolean;
  /** Directory to store calibration cache */
  calibrationCacheDir: string;
  /** Whether to run calibration on startup */
  runOnStartup: boolean;
  /** Calibration test parameters */
  calibration: {
    /** Number of test iterations per threshold */
    iterationsPerThreshold: number;
    /** Thresholds to test for optimization */
    testThresholds: number[];
    /** Minimum improvement required to update thresholds */
    minImprovementThreshold: number;
    /** Maximum calibration time (ms) */
    maxCalibrationTime: number;
  };
}

/**
 * Main algorithm configuration interface
 */
export interface AlgorithmConfig {
  /** Algorithm selection thresholds */
  thresholds: AlgorithmThresholds;
  /** Performance test configuration */
  performance: PerformanceTestConfig;
  /** Validation configuration */
  validation: ValidationConfig;
  /** Auto-tuning configuration */
  autoTuning: AutoTuningConfig;
  /** Memoization defaults */
  memoization?: {
    enabled: boolean;
    defaults: {
      maxSize: number;
      ttlMs: number;
      minHitRate: number;
      overheadBudgetMs: number;
      windowSize: number;
      minSamples: number;
    };
  };
  /** Machine-specific overrides */
  machineOverrides?: Partial<AlgorithmConfig>;
  /** Configuration version for migration */
  version: string;
}
