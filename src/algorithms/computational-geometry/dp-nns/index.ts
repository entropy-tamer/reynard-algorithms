/**
 * DP-NNS: Delaunay-history successor-DAG nearest-neighbor search.
 *
 * @module algorithms/computational-geometry/dp-nns
 */

export { bruteForceNearest, buildDpNnsIndex, computeGridStarts, queryBatchDpNns, queryDpNns } from "./dp-nns-core";
export { generateClusteredManifold3D, generateGaussianHillSurface3D, generateRingManifold3D, generateSaddleSurface3D, generateSphereSurface3D, generateTorusSurface3D, generateVolumeQueries3D, projectPointsXY } from "./dp-nns-generators";
export type { Point3D } from "./dp-nns-generators";
export type {
  Bounds2D,
  DpNnsBatchQueryStats,
  DpNnsBuildOptions,
  DpNnsBuildStats,
  DpNnsIndex,
  DpNnsQueryOptions,
  DpNnsQueryResult,
  DpNnsQueryTraceStep,
  InsertionOrderMode,
  Point2D,
} from "./dp-nns-types";

export { bruteForceNearest3D, buildDpNnsIndex3D, computeGridStarts3D, queryDpNns3D } from "./dp-nns-3d-core";
export type { Bounds3D, DpNnsBuildOptions3D, DpNnsIndex3D, DpNnsQueryResult3D } from "./dp-nns-3d-types";
