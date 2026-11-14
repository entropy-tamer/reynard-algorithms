import type { Point3D } from "./dp-nns-generators";

export interface Bounds3D {
  minX: number; minY: number; minZ: number;
  maxX: number; maxY: number; maxZ: number;
}

export interface DpNnsBuildOptions3D {
  order?: "input" | "random" | "brio-levels";
  seed?: number;
  brioRatio?: number;
  gridResolution?: number;
  queryBounds?: Bounds3D;
  jitter?: number;
}

export interface DpNnsIndex3D {
  points: Point3D[];
  insertionRanks: number[];
  pointsByRank: number[];
  successors: number[][];
  finalNeighbors: number[][];
  bounds: Bounds3D;
  queryBounds: Bounds3D;
  gridResolution: number;
  gridStarts: Int32Array | null;
  stats: {
    pointCount: number;
    successorEdgeCount: number;
    tetrahedraInFinal?: number;
    gridCells: number;
    buildMs: number;
  };
}

export interface DpNnsQueryResult3D {
  nearestIndex: number;
  nearestDistance: number;
  path: number[];
  distanceEvaluations: number;
  hops: number;
  startIndex: number;
  usedGridInit: boolean;
}
