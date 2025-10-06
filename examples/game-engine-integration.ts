/**
 * Game Engine Integration Example
 *
 * This example shows how to integrate reynard-algorithms into a game engine
 * with real-time collision detection, spatial optimization, and performance monitoring.
 */

import {
  detectCollisions,
  createAABB,
  AABB,
  SpatialHash,
  createSpatialHash,
  measurePerformance,
  createOptimizedCollisionAdapter,
  WorkloadAnalyzer,
  Point,
  Circle,
  Rectangle,
} from "../src/index.js";

// ============================================================================
// Game Object Types
// ============================================================================

interface GameObject {
  id: string;
  type: "player" | "enemy" | "bullet" | "powerup" | "obstacle";
  position: Point;
  velocity: Point;
  bounds: AABB;
  radius?: number; // for circular objects
  health?: number;
  damage?: number;
  speed?: number;
}

interface GameState {
  objects: Map<string, GameObject>;
  spatialHash: SpatialHash;
  collisionAdapter: ReturnType<typeof createOptimizedCollisionAdapter>;
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

export class GameEngine {
  private state: GameState;
  private worldWidth: number;
  private worldHeight: number;
  private cellSize: number;
  private frameCount: number = 0;

  constructor(worldWidth: number = 1000, worldHeight: number = 1000, cellSize: number = 50) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.cellSize = cellSize;

    this.state = {
      objects: new Map(),
      spatialHash: createSpatialHash(worldWidth, worldHeight, cellSize),
      collisionAdapter: createOptimizedCollisionAdapter(),
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

  addObject(obj: GameObject): void {
    this.state.objects.set(obj.id, obj);
    this.updateSpatialHash(obj);
  }

  removeObject(id: string): void {
    const obj = this.state.objects.get(id);
    if (obj) {
      this.state.spatialHash.remove(id);
      this.state.objects.delete(id);
    }
  }

  getObject(id: string): GameObject | undefined {
    return this.state.objects.get(id);
  }

  getAllObjects(): GameObject[] {
    return Array.from(this.state.objects.values());
  }

  // ============================================================================
  // Spatial Hash Management
  // ============================================================================

  private updateSpatialHash(obj: GameObject): void {
    this.state.spatialHash.remove(obj.id);
    this.state.spatialHash.insert(obj.id, obj.position.x, obj.position.y, obj.bounds.width, obj.bounds.height);
  }

  private updateAllSpatialHashes(): void {
    const startTime = performance.now();

    // Clear spatial hash
    this.state.spatialHash.clear();

    // Re-insert all objects
    for (const obj of this.state.objects.values()) {
      this.state.spatialHash.insert(obj.id, obj.position.x, obj.position.y, obj.bounds.width, obj.bounds.height);
    }

    this.state.performance.spatialUpdateTime = performance.now() - startTime;
  }

  // ============================================================================
  // Collision Detection
  // ============================================================================

  private detectCollisions(): Array<{ a: GameObject; b: GameObject }> {
    const startTime = performance.now();

    // Get all objects as array for collision detection
    const objects = this.getAllObjects();

    // Use PAW optimization for algorithm selection
    const workload = {
      objectCount: objects.length,
      spatialDensity: this.calculateSpatialDensity(),
      overlapRatio: this.calculateOverlapRatio(),
    };

    const analysis = this.state.workloadAnalyzer.analyzeWorkload(workload);
    const recommendation = this.state.collisionAdapter.getAlgorithmRecommendation(analysis);

    // Perform collision detection
    const collisions = detectCollisions(
      objects.map(obj => ({
        id: obj.id,
        bounds: obj.bounds,
      }))
    );

    // Convert back to GameObject collisions
    const gameObjectCollisions = collisions.map(collision => ({
      a: this.state.objects.get(collision.a.id)!,
      b: this.state.objects.get(collision.b.id)!,
    }));

    this.state.performance.collisionTime = performance.now() - startTime;

    return gameObjectCollisions;
  }

  // ============================================================================
  // Physics and Movement
  // ============================================================================

  updatePhysics(deltaTime: number): void {
    for (const obj of this.state.objects.values()) {
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

  private handlePlayerPowerupCollision(player: GameObject, powerup: GameObject): void {
    // Player gets powerup
    if (player.health !== undefined) {
      player.health += 20; // Heal
    }
    this.removeObject(powerup.id);
    console.log("Powerup collected!");
  }

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

  private calculateSpatialDensity(): number {
    const totalArea = this.worldWidth * this.worldHeight;
    const objectArea = Array.from(this.state.objects.values()).reduce(
      (sum, obj) => sum + obj.bounds.width * obj.bounds.height,
      0
    );
    return objectArea / totalArea;
  }

  private calculateOverlapRatio(): number {
    // Simplified overlap calculation
    const objects = this.getAllObjects();
    let overlaps = 0;
    let totalComparisons = 0;

    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        totalComparisons++;
        if (objects[i].bounds.intersects(objects[j].bounds)) {
          overlaps++;
        }
      }
    }

    return totalComparisons > 0 ? overlaps / totalComparisons : 0;
  }

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

  queryObjects(x: number, y: number, width: number, height: number): GameObject[] {
    const objectIds = this.state.spatialHash.query(x, y, width, height);
    return objectIds.map(id => this.state.objects.get(id)!).filter(Boolean);
  }

  getObjectsNear(point: Point, radius: number): GameObject[] {
    return this.queryObjects(point.x - radius, point.y - radius, radius * 2, radius * 2).filter(obj => {
      const distance = point.distanceTo(obj.position);
      return distance <= radius;
    });
  }
}

// ============================================================================
// Example Usage
// ============================================================================

export function createSampleGame(): GameEngine {
  const game = new GameEngine(800, 600, 40);

  // Create player
  const player = {
    id: "player",
    type: "player" as const,
    position: new Point(400, 500),
    velocity: new Point(0, 0),
    bounds: createAABB(400, 500, 20, 20),
    health: 100,
    speed: 200,
  };

  // Create enemies
  for (let i = 0; i < 10; i++) {
    const enemy = {
      id: `enemy${i}`,
      type: "enemy" as const,
      position: new Point(Math.random() * 800, Math.random() * 300),
      velocity: new Point((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100),
      bounds: createAABB(0, 0, 15, 15),
      health: 50,
      damage: 10,
    };
    enemy.bounds.x = enemy.position.x;
    enemy.bounds.y = enemy.position.y;
    game.addObject(enemy);
  }

  // Create powerups
  for (let i = 0; i < 3; i++) {
    const powerup = {
      id: `powerup${i}`,
      type: "powerup" as const,
      position: new Point(Math.random() * 800, Math.random() * 600),
      velocity: new Point(0, 0),
      bounds: createAABB(0, 0, 10, 10),
    };
    powerup.bounds.x = powerup.position.x;
    powerup.bounds.y = powerup.position.y;
    game.addObject(powerup);
  }

  game.addObject(player);

  return game;
}

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
