/**
 * @file Game Engine Integration Example
 *
 * This example shows how to integrate reynard-algorithms into a game engine
 * with real-time collision detection, spatial optimization, and performance monitoring.
 */
/* eslint-disable max-lines */

import { detectCollisions, SpatialHash, PointOps, checkCollision } from "../src/index.js";
import type { Point, MutablePoint } from "../src/index.js";
import { OptimizedCollisionAdapter } from "../src/optimization/adapters/optimized-collision-adapter.js";
import { WorkloadAnalyzer } from "../src/optimization/core/workload-analyzer.js";

// ============================================================================
// Game Object Types
// ============================================================================

interface GameObject {
  id: string;
  type: "player" | "enemy" | "bullet" | "powerup" | "obstacle";
  position: MutablePoint;
  velocity: MutablePoint;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  radius?: number; // for circular objects
  health?: number;
  damage?: number;
  speed?: number;
}

interface GameState {
  objects: Map<string, GameObject>;
  spatialHash: SpatialHash<GameObject>;
  collisionAdapter: OptimizedCollisionAdapter;
  workloadAnalyzer: WorkloadAnalyzer;
  performance: {
    frameTime: number;
    collisionTime: number;
    spatialUpdateTime: number;
    objectCount: number;
  };
}

// ============================================================================
// Game Engine Class
// ============================================================================

/**
 * Game engine class integrating collision detection and spatial optimization
 */
export class GameEngine {
  private state: GameState;
  private worldWidth: number;
  private worldHeight: number;
  private cellSize: number;
  private frameCount: number = 0;

  /**
   * Create a new game engine instance
   *
   * @param worldWidth - Width of the game world in pixels
   * @param worldHeight - Height of the game world in pixels
   * @param cellSize - Cell size for spatial hashing
   * @example
   * const engine = new GameEngine(800, 600, 40);
   */
  constructor(worldWidth: number = 1000, worldHeight: number = 1000, cellSize: number = 50) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.cellSize = cellSize;

    this.state = {
      objects: new Map(),
      spatialHash: new SpatialHash({
        cellSize,
        maxObjectsPerCell: 50,
        enableAutoResize: true,
        resizeThreshold: 0.8,
        cleanupInterval: 60000,
      }),
      collisionAdapter: new OptimizedCollisionAdapter({
        enableMemoryPooling: true,
        enableAlgorithmSelection: true,
        enablePerformanceMonitoring: true,
        algorithmSelectionStrategy: "adaptive",
        performanceThresholds: {
          maxExecutionTime: 16,
          maxMemoryUsage: 100 * 1024 * 1024,
          minHitRate: 0.95,
        },
      }),
      workloadAnalyzer: new WorkloadAnalyzer(),
      performance: {
        frameTime: 0,
        collisionTime: 0,
        spatialUpdateTime: 0,
        objectCount: 0,
      },
    };
  }

  // ============================================================================
  // Object Management
  // ============================================================================

  /**
   * Add a game object to the engine
   *
   * @param obj - GameObject to add
   * @example
   * engine.addObject({ id: 'player', type: 'player', ... });
   */
  addObject(obj: GameObject): void {
    this.state.objects.set(obj.id, obj);
    this.updateSpatialHash(obj);
  }

  /**
   * Remove a game object by ID
   *
   * @param id - ID of object to remove
   * @example
   * engine.removeObject('enemy1');
   */
  removeObject(id: string): void {
    const obj = this.state.objects.get(id);
    if (obj) {
      this.state.spatialHash.remove(id);
      this.state.objects.delete(id);
    }
  }

  /**
   * Get a game object by ID
   *
   * @param id - ID of object to retrieve
   * @returns GameObject or undefined if not found
   * @example
   * const player = engine.getObject('player');
   */
  getObject(id: string): GameObject | undefined {
    return this.state.objects.get(id);
  }

  /**
   * Get all game objects
   *
   * @returns Array of all game objects
   * @example
   * const allObjects = engine.getAllObjects();
   */
  getAllObjects(): GameObject[] {
    return Array.from(this.state.objects.values());
  }

  // ============================================================================
  // Spatial Hash Management
  // ============================================================================

  /**
   * Update spatial hash for a game object
   *
   * @param obj - GameObject to update in spatial hash
   * @example
   * engine.updateSpatialHash(gameObject);
   */
  private updateSpatialHash(obj: GameObject): void {
    this.state.spatialHash.remove(obj.id);
    this.state.spatialHash.insert({
      id: obj.id,
      x: obj.position.x,
      y: obj.position.y,
      width: obj.bounds.width,
      height: obj.bounds.height,
      data: obj,
    });
  }

  /**
   * Update spatial hash for all game objects
   *
   * @example
   * engine.updateAllSpatialHashes();
   */
  private updateAllSpatialHashes(): void {
    const startTime = performance.now();

    // Clear spatial hash
    this.state.spatialHash.clear();

    // Re-insert all objects
    for (const obj of Array.from(this.state.objects.values())) {
      this.state.spatialHash.insert({
        id: obj.id,
        x: obj.position.x,
        y: obj.position.y,
        width: obj.bounds.width,
        height: obj.bounds.height,
        data: obj,
      });
    }

    this.state.performance.spatialUpdateTime = performance.now() - startTime;
  }

  // ============================================================================
  // Collision Detection
  // ============================================================================

  /**
   * Detect collisions between all game objects
   *
   * @returns Array of collision pairs
   * @example
   * const collisions = engine.detectCollisions();
   */
  private detectCollisions(): Array<{ a: GameObject; b: GameObject }> {
    const startTime = performance.now();

    // Get all objects as array for collision detection
    const objects = this.getAllObjects();

    // Perform collision detection using optimized adapter
    const aabbs = objects.map(obj => obj.bounds);
    const collisions = detectCollisions(aabbs);

    // Convert back to GameObject collisions
    const gameObjectCollisions = collisions.map(collision => ({
      a: objects[collision.a],
      b: objects[collision.b],
    }));

    this.state.performance.collisionTime = performance.now() - startTime;

    return gameObjectCollisions;
  }

  // ============================================================================
  // Physics and Movement
  // ============================================================================

  /**
   * Update physics for all game objects
   *
   * @param deltaTime - Time elapsed since last update in seconds
   * @example
   * engine.updatePhysics(0.016); // Update for 16ms (60 FPS)
   */
  updatePhysics(deltaTime: number): void {
    for (const obj of Array.from(this.state.objects.values())) {
      // Update position based on velocity
      obj.position.x += obj.velocity.x * deltaTime;
      obj.position.y += obj.velocity.y * deltaTime;

      // Update bounds
      obj.bounds.x = obj.position.x;
      obj.bounds.y = obj.position.y;

      // Keep objects within world bounds
      this.constrainToWorld(obj);
    }

    // Update spatial hash after all movements
    this.updateAllSpatialHashes();
  }

  /**
   * Constrain object to world boundaries with bouncing
   *
   * @param obj - GameObject to constrain
   * @example
   * engine.constrainToWorld(gameObject);
   */
  private constrainToWorld(obj: GameObject): void {
    // Constrain to world bounds
    if (obj.position.x < 0) {
      obj.position.x = 0;
      obj.velocity.x = Math.abs(obj.velocity.x); // Bounce
    }
    if (obj.position.x + obj.bounds.width > this.worldWidth) {
      obj.position.x = this.worldWidth - obj.bounds.width;
      obj.velocity.x = -Math.abs(obj.velocity.x); // Bounce
    }

    if (obj.position.y < 0) {
      obj.position.y = 0;
      obj.velocity.y = Math.abs(obj.velocity.y); // Bounce
    }
    if (obj.position.y + obj.bounds.height > this.worldHeight) {
      obj.position.y = this.worldHeight - obj.bounds.height;
      obj.velocity.y = -Math.abs(obj.velocity.y); // Bounce
    }
  }

  // ============================================================================
  // Game Logic
  // ============================================================================

  /**
   * Handle collision events between game objects
   *
   * @param collisions - Array of collision pairs to handle
   * @example
   * engine.handleCollisions(collisions);
   */
  handleCollisions(collisions: Array<{ a: GameObject; b: GameObject }>): void {
    for (const collision of collisions) {
      const { a, b } = collision;

      // Handle different collision types
      if (a.type === "player" && b.type === "enemy") {
        this.handlePlayerEnemyCollision(a, b);
      } else if (a.type === "player" && b.type === "powerup") {
        this.handlePlayerPowerupCollision(a, b);
      } else if (a.type === "bullet" && b.type === "enemy") {
        this.handleBulletEnemyCollision(a, b);
      } else if (a.type === "enemy" && b.type === "bullet") {
        this.handleBulletEnemyCollision(b, a);
      }
    }
  }

  /**
   * Handle collision between player and enemy
   *
   * @param player - Player game object
   * @param enemy - Enemy game object
   * @example
   * engine.handlePlayerEnemyCollision(player, enemy);
   */
  private handlePlayerEnemyCollision(player: GameObject, enemy: GameObject): void {
    // Player takes damage
    if (player.health !== undefined) {
      player.health -= enemy.damage || 10;
      if (player.health <= 0) {
        this.removeObject(player.id);
        console.log("Player destroyed!");
      }
    }
  }

  /**
   * Handle collision between player and powerup
   *
   * @param player - Player game object
   * @param powerup - Powerup game object
   * @example
   * engine.handlePlayerPowerupCollision(player, powerup);
   */
  private handlePlayerPowerupCollision(player: GameObject, powerup: GameObject): void {
    // Player gets powerup
    if (player.health !== undefined) {
      player.health += 20; // Heal
    }
    this.removeObject(powerup.id);
    console.log("Powerup collected!");
  }

  /**
   * Handle collision between bullet and enemy
   *
   * @param bullet - Bullet game object
   * @param enemy - Enemy game object
   * @example
   * engine.handleBulletEnemyCollision(bullet, enemy);
   */
  private handleBulletEnemyCollision(bullet: GameObject, enemy: GameObject): void {
    // Enemy takes damage
    if (enemy.health !== undefined) {
      enemy.health -= bullet.damage || 25;
      if (enemy.health <= 0) {
        this.removeObject(enemy.id);
        console.log("Enemy destroyed!");
      }
    }
    this.removeObject(bullet.id);
  }

  // ============================================================================
  // Performance Monitoring
  // ============================================================================

  /**
   * Calculate spatial density of objects in the world
   *
   * @returns Density ratio (0-1)
   * @example
   * const density = engine.calculateSpatialDensity();
   */
  private calculateSpatialDensity(): number {
    const totalArea = this.worldWidth * this.worldHeight;
    const objectArea = Array.from(this.state.objects.values()).reduce(
      (sum, obj) => sum + obj.bounds.width * obj.bounds.height,
      0
    );
    return objectArea / totalArea;
  }

  /**
   * Calculate ratio of overlapping objects
   *
   * @returns Overlap ratio (0-1)
   * @example
   * const overlap = engine.calculateOverlapRatio();
   */
  private calculateOverlapRatio(): number {
    // Simplified overlap calculation
    const objects = this.getAllObjects();
    let overlaps = 0;
    let totalComparisons = 0;

    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        totalComparisons++;
        if (checkCollision(objects[i].bounds, objects[j].bounds).colliding) {
          overlaps++;
        }
      }
    }

    return totalComparisons > 0 ? overlaps / totalComparisons : 0;
  }

  /**
   * Get current performance statistics
   *
   * @returns Performance stats object
   * @example
   * const stats = engine.getPerformanceStats();
   */
  getPerformanceStats() {
    return {
      ...this.state.performance,
      objectCount: this.state.objects.size,
      spatialDensity: this.calculateSpatialDensity(),
      overlapRatio: this.calculateOverlapRatio(),
      frameCount: this.frameCount,
    };
  }

  // ============================================================================
  // Main Game Loop
  // ============================================================================

  /**
   * Main update loop for the game engine
   *
   * @param deltaTime - Time elapsed since last update in seconds
   * @example
   * engine.update(0.016); // Update for 16ms (60 FPS)
   */
  update(deltaTime: number): void {
    const frameStartTime = performance.now();

    // Update physics
    this.updatePhysics(deltaTime);

    // Detect collisions
    const collisions = this.detectCollisions();

    // Handle collisions
    this.handleCollisions(collisions);

    // Update performance stats
    this.state.performance.frameTime = performance.now() - frameStartTime;
    this.state.performance.objectCount = this.state.objects.size;
    this.frameCount++;
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Query objects in a rectangular region
   *
   * @param x - Left position of query region
   * @param y - Top position of query region
   * @param width - Width of query region
   * @param height - Height of query region
   * @returns Array of game objects in the region
   * @example
   * const objects = engine.queryObjects(0, 0, 100, 100);
   */
  queryObjects(x: number, y: number, width: number, height: number): GameObject[] {
    const results = this.state.spatialHash.queryRect(x, y, width, height);
    return results.map(result => result.data);
  }

  /**
   * Get objects near a point within a radius
   *
   * @param point - Center point for query
   * @param radius - Search radius
   * @returns Array of game objects within radius
   * @example
   * const nearby = engine.getObjectsNear({ x: 100, y: 100 }, 50);
   */
  getObjectsNear(point: Point, radius: number): GameObject[] {
    return this.queryObjects(point.x - radius, point.y - radius, radius * 2, radius * 2).filter(obj => {
      const distance = PointOps.distance(point, obj.position);
      return distance <= radius;
    });
  }
}

// ============================================================================
// Example Usage
// ============================================================================

/**
 * Create a sample game with player, enemies, and powerups
 *
 * @returns Initialized game engine with sample objects
 * @example
 * const game = createSampleGame();
 */
export function createSampleGame(): GameEngine {
  const game = new GameEngine(800, 600, 40);

  // Create player
  const player = {
    id: "player",
    type: "player" as const,
    position: { x: 400, y: 500 },
    velocity: { x: 0, y: 0 },
    bounds: { x: 400, y: 500, width: 20, height: 20 },
    health: 100,
    speed: 200,
  };

  // Create enemies
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * 800;
    const y = Math.random() * 300;
    const enemy = {
      id: `enemy${i}`,
      type: "enemy" as const,
      position: { x, y },
      velocity: { x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100 },
      bounds: { x, y, width: 15, height: 15 },
      health: 50,
      damage: 10,
    };
    game.addObject(enemy);
  }

  // Create powerups
  for (let i = 0; i < 3; i++) {
    const x = Math.random() * 800;
    const y = Math.random() * 600;
    const powerup = {
      id: `powerup${i}`,
      type: "powerup" as const,
      position: { x, y },
      velocity: { x: 0, y: 0 },
      bounds: { x, y, width: 10, height: 10 },
    };
    game.addObject(powerup);
  }

  game.addObject(player);

  return game;
}

/**
 * Run a game simulation for demonstration
 *
 * @example
 * await runGameSimulation();
 * // Runs simulation and logs performance stats
 */
export async function runGameSimulation(): Promise<void> {
  console.log("🎮 Game Engine Integration Example");

  const game = createSampleGame();
  const targetFPS = 60;
  const frameTime = 1000 / targetFPS;

  console.log("Starting game simulation...");
  console.log("Initial objects:", game.getAllObjects().length);

  // Run simulation for 5 seconds
  const simulationTime = 5000;
  const startTime = Date.now();

  while (Date.now() - startTime < simulationTime) {
    const frameStart = performance.now();

    // Update game
    game.update(frameTime / 1000);

    // Log performance every 60 frames (1 second at 60 FPS)
    if (game["frameCount"] % 60 === 0) {
      const stats = game.getPerformanceStats();
      console.log(`Frame ${game["frameCount"]}:`, {
        objects: stats.objectCount,
        frameTime: `${stats.frameTime.toFixed(2)}ms`,
        collisionTime: `${stats.collisionTime.toFixed(2)}ms`,
        spatialUpdateTime: `${stats.spatialUpdateTime.toFixed(2)}ms`,
        spatialDensity: stats.spatialDensity.toFixed(3),
        overlapRatio: stats.overlapRatio.toFixed(3),
      });
    }

    // Maintain target frame rate
    const frameDuration = performance.now() - frameStart;
    const sleepTime = Math.max(0, frameTime - frameDuration);
    if (sleepTime > 0) {
      await new Promise(resolve => setTimeout(resolve, sleepTime));
    }
  }

  console.log("Simulation completed!");
  console.log("Final objects:", game.getAllObjects().length);

  const finalStats = game.getPerformanceStats();
  console.log("Final performance stats:", finalStats);
}

// Run simulation if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runGameSimulation().catch(console.error);
}
