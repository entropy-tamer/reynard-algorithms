/**
 * @module algorithms/geometry/algorithms/poisson-disk
 * @description Provides the Poisson Disk Sampling algorithm for high-quality point distribution.
 */

export { PoissonDisk } from "./poisson-disk-core";
export type {
  Point2D,
  Point3D,
  PoissonDiskConfig,
  PoissonDiskStats,
  PoissonDiskResult,
  PoissonDisk2DOptions,
  PoissonDisk3DOptions,
  PoissonDiskAnalysisOptions,
  PoissonDiskAnalysis,
  AdaptivePoissonDiskOptions,
  AdaptivePoissonDiskResult,
  ConstrainedPoissonDiskOptions,
  ConstrainedPoissonDiskResult,
} from "./poisson-disk-types";
