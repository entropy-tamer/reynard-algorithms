/**
 * @file steering-behaviors-core.ts
 * @module algorithms/game-mechanics/steering-behaviors-core
 * @description Steering Behaviors implementation (Boids/Flocking).
 *
 * Mathematical Theory:
 * Steering behaviors generate forces that guide agent movement.
 * Each behavior calculates a desired velocity, then returns a steering force:
 * steering = desired_velocity - current_velocity
 *
 * The force is clamped to maxForce and applied to the agent's acceleration.
 * Final velocity is clamped to maxSpeed.
 *
 * Flocking combines three behaviors:
 * - Separation: Steer away from nearby neighbors
 * - Alignment: Steer towards average heading of neighbors
 * - Cohesion: Steer towards average position of neighbors
 */
import type { Vector } from "../../../core/types";
import type { Agent, SteeringBehaviorsConfig, SeekParams, FleeParams, PursuitParams, EvasionParams, WanderParams, ObstacleAvoidanceParams, FlockingParams, SteeringForce, SteeringOptions } from "./steering-behaviors-types";
/**
 * Steering Behaviors implementation.
 */
export declare class SteeringBehaviors {
    private config;
    /**
     * Creates a new SteeringBehaviors instance.
     * @param config Configuration options.
     * @example
     */
    constructor(config?: Partial<SteeringBehaviorsConfig>);
    /**
     * Calculate seek steering force.
     * @param agent Agent seeking the target.
     * @param params Seek parameters.
     * @param options Steering options.
     * @returns Steering force.
     * @example
     */
    seek(agent: Agent, params: SeekParams, options?: Partial<SteeringOptions>): SteeringForce;
    /**
     * Calculate arrival steering force (seek with slowdown).
     * @param agent Agent arriving at target.
     * @param params Seek parameters (with arrival/slow radii).
     * @param options Steering options.
     * @returns Steering force.
     * @example
     */
    arrival(agent: Agent, params: SeekParams, options?: Partial<SteeringOptions>): SteeringForce;
    /**
     * Calculate flee steering force.
     * @param agent Agent fleeing from threat.
     * @param params Flee parameters.
     * @param options Steering options.
     * @returns Steering force.
     * @example
     */
    flee(agent: Agent, params: FleeParams, options?: Partial<SteeringOptions>): SteeringForce;
    /**
     * Calculate pursuit steering force.
     * @param agent Agent pursuing target.
     * @param params Pursuit parameters.
     * @param options Steering options.
     * @returns Steering force.
     * @example
     */
    pursuit(agent: Agent, params: PursuitParams, options?: Partial<SteeringOptions>): SteeringForce;
    /**
     * Calculate evasion steering force.
     * @param agent Agent evading threat.
     * @param params Evasion parameters.
     * @param options Steering options.
     * @returns Steering force.
     * @example
     */
    evasion(agent: Agent, params: EvasionParams, options?: Partial<SteeringOptions>): SteeringForce;
    /**
     * Calculate wander steering force.
     * @param agent Agent wandering.
     * @param params Wander parameters.
     * @param options Steering options.
     * @returns Steering force.
     * @example
     */
    wander(agent: Agent, params: WanderParams, options?: Partial<SteeringOptions>): SteeringForce;
    /**
     * Calculate obstacle avoidance steering force.
     * @param agent Agent avoiding obstacles.
     * @param params Obstacle avoidance parameters.
     * @param options Steering options.
     * @returns Steering force.
     * @example
     */
    obstacleAvoidance(agent: Agent, params: ObstacleAvoidanceParams, options?: Partial<SteeringOptions>): SteeringForce;
    /**
     * Calculate separation force (steer away from neighbors).
     * @param agent Current agent.
     * @param neighbors Nearby agents.
     * @param separationDistance Separation distance.
     * @returns Separation force.
     * @example
     */
    private separation;
    /**
     * Calculate alignment force (steer towards average heading).
     * @param agent Current agent.
     * @param neighbors Nearby agents.
     * @param neighborDistance Neighbor distance.
     * @returns Alignment force.
     * @example
     */
    private alignment;
    /**
     * Calculate cohesion force (steer towards average position).
     * @param agent Current agent.
     * @param neighbors Nearby agents.
     * @param neighborDistance Neighbor distance.
     * @returns Cohesion force.
     * @example
     */
    private cohesion;
    /**
     * Calculate flocking steering force (combines separation, alignment, cohesion).
     * @param agent Current agent.
     * @param params Flocking parameters.
     * @param options Steering options.
     * @returns Combined steering force.
     * @example
     */
    flocking(agent: Agent, params: FlockingParams, options?: Partial<SteeringOptions>): SteeringForce;
    /**
     * Blend multiple steering forces.
     * @param forces Array of steering forces.
     * @returns Combined steering force.
     * @example
     */
    blend(forces: SteeringForce[]): Vector;
}
//# sourceMappingURL=steering-behaviors-core.d.ts.map