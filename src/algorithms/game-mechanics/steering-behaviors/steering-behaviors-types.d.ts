/**
 * @file steering-behaviors-types.ts
 * @module algorithms/game-mechanics/steering-behaviors-types
 * @description Type definitions for Steering Behaviors (Boids/Flocking) algorithms.
 */
import type { Point, Vector } from "../../../core/types";
/**
 * Agent with position, velocity, and steering properties.
 */
export interface Agent {
    /**
     * Current position.
     */
    position: Point;
    /**
     * Current velocity vector.
     */
    velocity: Vector;
    /**
     * Maximum speed.
     */
    maxSpeed: number;
    /**
     * Maximum steering force.
     */
    maxForce: number;
    /**
     * Mass (affects acceleration).
     */
    mass?: number;
    /**
     * Radius for collision detection.
     */
    radius?: number;
}
/**
 * Configuration options for Steering Behaviors.
 */
export interface SteeringBehaviorsConfig {
    /**
     * Maximum speed for agents.
     * @default 5.0
     */
    maxSpeed?: number;
    /**
     * Maximum steering force.
     * @default 0.5
     */
    maxForce?: number;
    /**
     * Default mass for agents.
     * @default 1.0
     */
    defaultMass?: number;
    /**
     * Default radius for agents.
     * @default 10.0
     */
    defaultRadius?: number;
    /**
     * Tolerance for floating point comparisons.
     * @default 1e-6
     */
    tolerance?: number;
}
/**
 * Seek behavior parameters.
 */
export interface SeekParams {
    /**
     * Target position.
     */
    target: Point;
    /**
     * Desired arrival radius (for arrival behavior).
     */
    arrivalRadius?: number;
    /**
     * Slowdown radius (for arrival behavior).
     */
    slowRadius?: number;
}
/**
 * Flee behavior parameters.
 */
export interface FleeParams {
    /**
     * Threat position to flee from.
     */
    threat: Point;
    /**
     * Maximum flee distance.
     */
    fleeDistance?: number;
}
/**
 * Pursuit behavior parameters.
 */
export interface PursuitParams {
    /**
     * Target agent to pursue.
     */
    target: Agent;
    /**
     * Lookahead time for prediction.
     */
    lookaheadTime?: number;
}
/**
 * Evasion behavior parameters.
 */
export interface EvasionParams {
    /**
     * Threat agent to evade.
     */
    threat: Agent;
    /**
     * Lookahead time for prediction.
     */
    lookaheadTime?: number;
}
/**
 * Wander behavior parameters.
 */
export interface WanderParams {
    /**
     * Wander circle distance.
     * @default 50.0
     */
    circleDistance?: number;
    /**
     * Wander circle radius.
     * @default 20.0
     */
    circleRadius?: number;
    /**
     * Maximum angle change per step.
     * @default 0.5
     */
    angleChange?: number;
}
/**
 * Obstacle avoidance parameters.
 */
export interface ObstacleAvoidanceParams {
    /**
     * Obstacles to avoid (circles).
     */
    obstacles: Array<{
        center: Point;
        radius: number;
    }>;
    /**
     * Lookahead distance.
     * @default 50.0
     */
    lookaheadDistance?: number;
}
/**
 * Flocking parameters.
 */
export interface FlockingParams {
    /**
     * All agents in the flock.
     */
    agents: Agent[];
    /**
     * Separation weight.
     * @default 1.5
     */
    separationWeight?: number;
    /**
     * Alignment weight.
     * @default 1.0
     */
    alignmentWeight?: number;
    /**
     * Cohesion weight.
     * @default 1.0
     */
    cohesionWeight?: number;
    /**
     * Separation distance.
     * @default 30.0
     */
    separationDistance?: number;
    /**
     * Neighbor distance for alignment and cohesion.
     * @default 50.0
     */
    neighborDistance?: number;
}
/**
 * Steering force result.
 */
export interface SteeringForce {
    /**
     * Steering force vector.
     */
    force: Vector;
    /**
     * Behavior type that generated the force.
     */
    behavior: string;
}
/**
 * Options for steering behavior calculation.
 */
export interface SteeringOptions {
    /**
     * Whether to normalize the force.
     * @default true
     */
    normalize?: boolean;
    /**
     * Weight for blending multiple behaviors.
     * @default 1.0
     */
    weight?: number;
}
/**
 * Default configuration.
 */
export declare const DEFAULT_STEERING_CONFIG: Required<SteeringBehaviorsConfig>;
//# sourceMappingURL=steering-behaviors-types.d.ts.map