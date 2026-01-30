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

import type { Point, Vector } from "../../../core/types";
import type {
  Agent,
  SteeringBehaviorsConfig,
  SeekParams,
  FleeParams,
  PursuitParams,
  EvasionParams,
  WanderParams,
  ObstacleAvoidanceParams,
  FlockingParams,
  SteeringForce,
  SteeringOptions,
} from "./steering-behaviors-types";
import { DEFAULT_STEERING_CONFIG } from "./steering-behaviors-types";

/**
 * Calculate vector length.
 * @param v
 * @example
 */
function vectorLength(v: Vector): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

/**
 * Normalize a vector.
 * @param v
 * @example
 */
function normalize(v: Vector): Vector {
  const len = vectorLength(v);
  if (len < 1e-6) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

/**
 * Scale a vector.
 * @param v
 * @param scalar
 * @example
 */
function scale(v: Vector, scalar: number): Vector {
  return { x: v.x * scalar, y: v.y * scalar };
}

/**
 * Add two vectors.
 * @param v1
 * @param v2
 * @example
 */
function add(v1: Vector, v2: Vector): Vector {
  return { x: v1.x + v2.x, y: v1.y + v2.y };
}

/**
 * Subtract two vectors.
 * @param v1
 * @param v2
 * @example
 */
function subtract(v1: Vector, v2: Vector): Vector {
  return { x: v1.x - v2.x, y: v1.y - v2.y };
}

/**
 * Calculate distance between two points.
 * @param p1
 * @param p2
 * @example
 */
function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Limit vector magnitude.
 * @param v
 * @param max
 * @example
 */
function limit(v: Vector, max: number): Vector {
  const len = vectorLength(v);
  if (len > max) {
    return scale(normalize(v), max);
  }
  return v;
}

/**
 * Calculate desired velocity for seek behavior.
 * @param agent
 * @param target
 * @param maxSpeed
 * @example
 */
function seekDesiredVelocity(agent: Agent, target: Point, maxSpeed: number): Vector {
  const desired = subtract(target, agent.position);
  const dist = vectorLength(desired);
  if (dist < 1e-6) {
    return { x: 0, y: 0 };
  }
  return scale(normalize(desired), maxSpeed);
}

/**
 * Calculate desired velocity for arrival behavior.
 * @param agent
 * @param target
 * @param maxSpeed
 * @param arrivalRadius
 * @param slowRadius
 * @example
 */
function arrivalDesiredVelocity(
  agent: Agent,
  target: Point,
  maxSpeed: number,
  arrivalRadius: number,
  slowRadius: number
): Vector {
  const desired = subtract(target, agent.position);
  const dist = vectorLength(desired);

  if (dist < arrivalRadius) {
    return { x: 0, y: 0 };
  }

  let speed = maxSpeed;
  if (dist < slowRadius) {
    speed = maxSpeed * (dist / slowRadius);
  }

  return scale(normalize(desired), speed);
}

/**
 * Steering Behaviors implementation.
 */
export class SteeringBehaviors {
  private config: Required<SteeringBehaviorsConfig>;

  /**
   * Creates a new SteeringBehaviors instance.
   * @param config Configuration options.
   * @example
   */
  constructor(config: Partial<SteeringBehaviorsConfig> = {}) {
    this.config = { ...DEFAULT_STEERING_CONFIG, ...config };
  }

  /**
   * Calculate seek steering force.
   * @param agent Agent seeking the target.
   * @param params Seek parameters.
   * @param options Steering options.
   * @returns Steering force.
   * @example
   */
  seek(agent: Agent, params: SeekParams, options: Partial<SteeringOptions> = {}): SteeringForce {
    const maxSpeed = agent.maxSpeed ?? this.config.maxSpeed;
    const desired = seekDesiredVelocity(agent, params.target, maxSpeed);
    const steer = subtract(desired, agent.velocity);
    const maxForce = agent.maxForce ?? this.config.maxForce;
    const force = limit(steer, maxForce);
    const weight = options.weight ?? 1.0;

    return {
      force: scale(force, weight),
      behavior: 'seek',
    };
  }

  /**
   * Calculate arrival steering force (seek with slowdown).
   * @param agent Agent arriving at target.
   * @param params Seek parameters (with arrival/slow radii).
   * @param options Steering options.
   * @returns Steering force.
   * @example
   */
  arrival(agent: Agent, params: SeekParams, options: Partial<SteeringOptions> = {}): SteeringForce {
    const maxSpeed = agent.maxSpeed ?? this.config.maxSpeed;
    const arrivalRadius = params.arrivalRadius ?? 20.0;
    const slowRadius = params.slowRadius ?? 100.0;
    const desired = arrivalDesiredVelocity(agent, params.target, maxSpeed, arrivalRadius, slowRadius);
    const steer = subtract(desired, agent.velocity);
    const maxForce = agent.maxForce ?? this.config.maxForce;
    const force = limit(steer, maxForce);
    const weight = options.weight ?? 1.0;

    return {
      force: scale(force, weight),
      behavior: 'arrival',
    };
  }

  /**
   * Calculate flee steering force.
   * @param agent Agent fleeing from threat.
   * @param params Flee parameters.
   * @param options Steering options.
   * @returns Steering force.
   * @example
   */
  flee(agent: Agent, params: FleeParams, options: Partial<SteeringOptions> = {}): SteeringForce {
    const dist = distance(agent.position, params.threat);
    const fleeDistance = params.fleeDistance ?? 100.0;

    if (dist > fleeDistance) {
      return { force: { x: 0, y: 0 }, behavior: 'flee' };
    }

    const maxSpeed = agent.maxSpeed ?? this.config.maxSpeed;
    const desired = subtract(agent.position, params.threat);
    const desiredNorm = normalize(desired);
    const desiredVel = scale(desiredNorm, maxSpeed);
    const steer = subtract(desiredVel, agent.velocity);
    const maxForce = agent.maxForce ?? this.config.maxForce;
    const force = limit(steer, maxForce);
    const weight = options.weight ?? 1.0;

    return {
      force: scale(force, weight),
      behavior: 'flee',
    };
  }

  /**
   * Calculate pursuit steering force.
   * @param agent Agent pursuing target.
   * @param params Pursuit parameters.
   * @param options Steering options.
   * @returns Steering force.
   * @example
   */
  pursuit(agent: Agent, params: PursuitParams, options: Partial<SteeringOptions> = {}): SteeringForce {
    const lookaheadTime = params.lookaheadTime ?? 1.0;
    const futurePosition: Point = {
      x: params.target.position.x + params.target.velocity.x * lookaheadTime,
      y: params.target.position.y + params.target.velocity.y * lookaheadTime,
    };
    return this.seek(agent, { target: futurePosition }, options);
  }

  /**
   * Calculate evasion steering force.
   * @param agent Agent evading threat.
   * @param params Evasion parameters.
   * @param options Steering options.
   * @returns Steering force.
   * @example
   */
  evasion(agent: Agent, params: EvasionParams, options: Partial<SteeringOptions> = {}): SteeringForce {
    const lookaheadTime = params.lookaheadTime ?? 1.0;
    const futurePosition: Point = {
      x: params.threat.position.x + params.threat.velocity.x * lookaheadTime,
      y: params.threat.position.y + params.threat.velocity.y * lookaheadTime,
    };
    return this.flee(agent, { threat: futurePosition }, options);
  }

  /**
   * Calculate wander steering force.
   * @param agent Agent wandering.
   * @param params Wander parameters.
   * @param options Steering options.
   * @returns Steering force.
   * @example
   */
  wander(agent: Agent, params: WanderParams, options: Partial<SteeringOptions> = {}): SteeringForce {
    // Store wander angle in agent if not present (would need to extend Agent type)
    // For now, use a simple random approach
    const circleDistance = params.circleDistance ?? 50.0;
    const circleRadius = params.circleRadius ?? 20.0;

    // Calculate circle center ahead of agent
    const velocityNorm = normalize(agent.velocity);
    const circleCenter = {
      x: agent.position.x + velocityNorm.x * circleDistance,
      y: agent.position.y + velocityNorm.y * circleDistance,
    };

    // Random displacement on circle (simplified - would use stored angle)
    const angle = Math.random() * Math.PI * 2;
    const displacement: Vector = {
      x: Math.cos(angle) * circleRadius,
      y: Math.sin(angle) * circleRadius,
    };

    const target: Point = {
      x: circleCenter.x + displacement.x,
      y: circleCenter.y + displacement.y,
    };

    return this.seek(agent, { target }, options);
  }

  /**
   * Calculate obstacle avoidance steering force.
   * @param agent Agent avoiding obstacles.
   * @param params Obstacle avoidance parameters.
   * @param options Steering options.
   * @returns Steering force.
   * @example
   */
  obstacleAvoidance(
    agent: Agent,
    params: ObstacleAvoidanceParams,
    options: Partial<SteeringOptions> = {}
  ): SteeringForce {
    const lookaheadDistance = params.lookaheadDistance ?? 50.0;
    const velocityNorm = normalize(agent.velocity);
    const lookahead: Point = {
      x: agent.position.x + velocityNorm.x * lookaheadDistance,
      y: agent.position.y + velocityNorm.y * lookaheadDistance,
    };

    let closestObstacle: { center: Point; radius: number } | null = null;
    let closestDist = Infinity;

    for (const obstacle of params.obstacles) {
      const dist = distance(lookahead, obstacle.center);
      if (dist < obstacle.radius && dist < closestDist) {
        closestDist = dist;
        closestObstacle = obstacle;
      }
    }

    if (!closestObstacle) {
      return { force: { x: 0, y: 0 }, behavior: 'obstacle-avoidance' };
    }

    // Steer away from obstacle
    const avoidDirection = subtract(agent.position, closestObstacle.center);
    const avoidNorm = normalize(avoidDirection);
    const maxSpeed = agent.maxSpeed ?? this.config.maxSpeed;
    const desired = scale(avoidNorm, maxSpeed);
    const steer = subtract(desired, agent.velocity);
    const maxForce = agent.maxForce ?? this.config.maxForce;
    const force = limit(steer, maxForce);
    const weight = options.weight ?? 1.0;

    return {
      force: scale(force, weight),
      behavior: 'obstacle-avoidance',
    };
  }

  /**
   * Calculate separation force (steer away from neighbors).
   * @param agent Current agent.
   * @param neighbors Nearby agents.
   * @param separationDistance Separation distance.
   * @returns Separation force.
   * @example
   */
  private separation(
    agent: Agent,
    neighbors: Agent[],
    separationDistance: number
  ): Vector {
    let steer: Vector = { x: 0, y: 0 };
    let count = 0;

    for (const neighbor of neighbors) {
      const dist = distance(agent.position, neighbor.position);
      if (dist > 0 && dist < separationDistance) {
        const diff = subtract(agent.position, neighbor.position);
        const diffNorm = normalize(diff);
        steer = add(steer, scale(diffNorm, 1.0 / dist)); // Weight by distance
        count++;
      }
    }

    if (count > 0) {
      steer = scale(steer, 1.0 / count);
      const maxSpeed = agent.maxSpeed ?? this.config.maxSpeed;
      const desired = scale(normalize(steer), maxSpeed);
      return subtract(desired, agent.velocity);
    }

    return { x: 0, y: 0 };
  }

  /**
   * Calculate alignment force (steer towards average heading).
   * @param agent Current agent.
   * @param neighbors Nearby agents.
   * @param neighborDistance Neighbor distance.
   * @returns Alignment force.
   * @example
   */
  private alignment(agent: Agent, neighbors: Agent[], neighborDistance: number): Vector {
    let sum: Vector = { x: 0, y: 0 };
    let count = 0;

    for (const neighbor of neighbors) {
      const dist = distance(agent.position, neighbor.position);
      if (dist > 0 && dist < neighborDistance) {
        sum = add(sum, neighbor.velocity);
        count++;
      }
    }

    if (count > 0) {
      sum = scale(sum, 1.0 / count);
      const sumNorm = normalize(sum);
      const maxSpeed = agent.maxSpeed ?? this.config.maxSpeed;
      const desired = scale(sumNorm, maxSpeed);
      return subtract(desired, agent.velocity);
    }

    return { x: 0, y: 0 };
  }

  /**
   * Calculate cohesion force (steer towards average position).
   * @param agent Current agent.
   * @param neighbors Nearby agents.
   * @param neighborDistance Neighbor distance.
   * @returns Cohesion force.
   * @example
   */
  private cohesion(agent: Agent, neighbors: Agent[], neighborDistance: number): Vector {
    let sum: Point = { x: 0, y: 0 };
    let count = 0;

    for (const neighbor of neighbors) {
      const dist = distance(agent.position, neighbor.position);
      if (dist > 0 && dist < neighborDistance) {
        sum = add(sum, neighbor.position);
        count++;
      }
    }

    if (count > 0) {
      sum = scale(sum, 1.0 / count);
      return this.seek(agent, { target: sum }, {}).force;
    }

    return { x: 0, y: 0 };
  }

  /**
   * Calculate flocking steering force (combines separation, alignment, cohesion).
   * @param agent Current agent.
   * @param params Flocking parameters.
   * @param options Steering options.
   * @returns Combined steering force.
   * @example
   */
  flocking(agent: Agent, params: FlockingParams, options: Partial<SteeringOptions> = {}): SteeringForce {
    const separationWeight = params.separationWeight ?? 1.5;
    const alignmentWeight = params.alignmentWeight ?? 1.0;
    const cohesionWeight = params.cohesionWeight ?? 1.0;
    const separationDistance = params.separationDistance ?? 30.0;
    const neighborDistance = params.neighborDistance ?? 50.0;

    const sep = this.separation(agent, params.agents, separationDistance);
    const ali = this.alignment(agent, params.agents, neighborDistance);
    const coh = this.cohesion(agent, params.agents, neighborDistance);

    let total: Vector = { x: 0, y: 0 };
    total = add(total, scale(sep, separationWeight));
    total = add(total, scale(ali, alignmentWeight));
    total = add(total, scale(coh, cohesionWeight));

    const maxForce = agent.maxForce ?? this.config.maxForce;
    const force = limit(total, maxForce);
    const weight = options.weight ?? 1.0;

    return {
      force: scale(force, weight),
      behavior: 'flocking',
    };
  }

  /**
   * Blend multiple steering forces.
   * @param forces Array of steering forces.
   * @returns Combined steering force.
   * @example
   */
  blend(forces: SteeringForce[]): Vector {
    let total: Vector = { x: 0, y: 0 };
    for (const force of forces) {
      total = add(total, force.force);
    }
    return total;
  }
}





