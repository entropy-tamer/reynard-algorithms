/**
 * @file Spatial Data Types
 * Comprehensive type definitions for spatial algorithms and data structures.
 */

export interface SpatialData {
  readonly id: string | number;
  readonly type: string;
  readonly metadata?: Record<string, unknown>;
}

export interface SpatialObjectData extends SpatialData {
  readonly category: "entity" | "obstacle" | "trigger" | "decoration";
  readonly properties?: Record<string, unknown>;
}

export interface GameEntityData extends SpatialData {
  readonly entityType: "player" | "enemy" | "npc" | "item" | "projectile";
  readonly health?: number;
  readonly damage?: number;
  readonly speed?: number;
}

export interface CollisionData extends SpatialData {
  readonly collisionType: "solid" | "trigger" | "platform" | "oneway";
  readonly material?: "metal" | "wood" | "stone" | "fabric" | "glass";
  readonly friction?: number;
  readonly restitution?: number;
}

export interface RenderData extends SpatialData {
  readonly sprite?: string;
  readonly texture?: string;
  readonly color?: string;
  readonly opacity?: number;
  readonly layer?: number;
}

export interface CollisionObjectData extends SpatialData {
  readonly aabb: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
  readonly index: number;
}

export type SpatialDataType = SpatialObjectData | GameEntityData | CollisionData | RenderData | CollisionObjectData;

export interface SpatialObject<T extends SpatialDataType = SpatialDataType> {
  readonly id: string | number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly data: T;
}

export interface SpatialQueryResult<T extends SpatialDataType = SpatialDataType> {
  readonly objects: readonly SpatialObject<T>[];
  readonly queryTime: number;
  readonly totalObjects: number;
}

export interface SpatialHashConfig {
  readonly cellSize: number;
  readonly maxObjectsPerCell: number;
  readonly enableOptimization: boolean;
}

export interface MemoryPoolStats {
  readonly totalObjects: number;
  readonly activeObjects: number;
  readonly availableObjects: number;
  readonly peakUsage: number;
  readonly allocationCount: number;
  readonly deallocationCount: number;
  readonly averageLifetime: number;
}
