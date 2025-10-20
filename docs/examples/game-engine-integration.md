# Game Engine Integration

This guide shows how to integrate reynard-algorithms into a game engine for optimal performance.

## Entity Component System (ECS)

Use Union-Find for efficient entity relationships and component queries.

```typescript
import { UnionFind } from "@entropy-tamer/reynard-algorithms";

class GameEngine {
  private entityManager: UnionFind;
  private entities: Map<number, Entity> = new Map();

  constructor(maxEntities: number) {
    this.entityManager = new UnionFind(maxEntities);
  }

  // Group entities by relationship
  groupEntities(entity1: number, entity2: number) {
    this.entityManager.union(entity1, entity2);
  }

  // Check if entities are in the same group
  areGrouped(entity1: number, entity2: number): boolean {
    return this.entityManager.connected(entity1, entity2);
  }

  // Get all entities in the same group
  getGroupEntities(entityId: number): number[] {
    const root = this.entityManager.find(entityId);
    return Array.from(this.entities.keys()).filter(id => this.entityManager.find(id) === root);
  }
}
```

## Collision Detection System

Implement efficient collision detection using spatial partitioning.

```typescript
import { SpatialHash, AABB, Point } from "@entropy-tamer/reynard-algorithms";

class CollisionSystem {
  private spatialHash: SpatialHash;
  private colliders: Map<number, AABB> = new Map();

  constructor(worldWidth: number, worldHeight: number, cellSize: number = 50) {
    this.spatialHash = new SpatialHash(cellSize);
  }

  addCollider(entityId: number, x: number, y: number, width: number, height: number) {
    const aabb = new AABB(x, y, width, height);
    this.colliders.set(entityId, aabb);
    this.spatialHash.insert({ id: entityId, ...aabb });
  }

  updateCollider(entityId: number, x: number, y: number) {
    const collider = this.colliders.get(entityId);
    if (collider) {
      this.spatialHash.remove({ id: entityId, ...collider });
      collider.x = x;
      collider.y = y;
      this.spatialHash.insert({ id: entityId, ...collider });
    }
  }

  checkCollisions(entityId: number): number[] {
    const collider = this.colliders.get(entityId);
    if (!collider) return [];

    const candidates = this.spatialHash.query(collider.x, collider.y, collider.width, collider.height);

    return candidates
      .filter(candidate => candidate.id !== entityId)
      .filter(candidate => {
        const other = this.colliders.get(candidate.id);
        return other && collider.intersects(other);
      })
      .map(candidate => candidate.id);
  }
}
```

## Pathfinding System

Implement A\* pathfinding for AI and player movement.

```typescript
import { AStar, Point, PriorityQueue } from "@entropy-tamer/reynard-algorithms";

class PathfindingSystem {
  private pathfinder: AStar;
  private grid: number[][];
  private pathCache: Map<string, Point[]> = new Map();

  constructor(gridWidth: number, gridHeight: number) {
    this.pathfinder = new AStar();
    this.grid = Array(gridHeight)
      .fill(null)
      .map(() => Array(gridWidth).fill(0));
  }

  setObstacle(x: number, y: number) {
    if (this.isValidPosition(x, y)) {
      this.grid[y][x] = 1;
    }
  }

  clearObstacle(x: number, y: number) {
    if (this.isValidPosition(x, y)) {
      this.grid[y][x] = 0;
    }
  }

  findPath(start: Point, goal: Point): Point[] {
    const cacheKey = `${start.x},${start.y}-${goal.x},${goal.y}`;

    // Check cache first
    if (this.pathCache.has(cacheKey)) {
      return this.pathCache.get(cacheKey)!;
    }

    // Find path
    const path = this.pathfinder.findPath(start, goal, this.grid);

    // Cache result
    this.pathCache.set(cacheKey, path);

    return path;
  }

  private isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.grid[0].length && y >= 0 && y < this.grid.length;
  }

  clearCache() {
    this.pathCache.clear();
  }
}
```

## Performance Monitoring

Monitor game performance with built-in benchmarking tools.

```typescript
import { Benchmark, MemoryPool } from "@entropy-tamer/reynard-algorithms";

class PerformanceMonitor {
  private benchmarks: Map<string, Benchmark> = new Map();
  private memoryPools: Map<string, MemoryPool<any>> = new Map();

  startBenchmark(name: string): void {
    if (!this.benchmarks.has(name)) {
      this.benchmarks.set(name, new Benchmark(name));
    }
    this.benchmarks.get(name)!.start();
  }

  endBenchmark(name: string): void {
    const benchmark = this.benchmarks.get(name);
    if (benchmark) {
      benchmark.end();
    }
  }

  getBenchmarkResults(name: string) {
    return this.benchmarks.get(name)?.getResults();
  }

  createMemoryPool<T>(name: string, factory: () => T): MemoryPool<T> {
    const pool = new MemoryPool(factory);
    this.memoryPools.set(name, pool);
    return pool;
  }

  getMemoryPoolStats(name: string) {
    return this.memoryPools.get(name)?.getStats();
  }
}

// Usage in game loop
class GameLoop {
  private performanceMonitor: PerformanceMonitor;

  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
  }

  update(deltaTime: number) {
    // Monitor collision detection performance
    this.performanceMonitor.startBenchmark("collision-detection");
    this.updateCollisions();
    this.performanceMonitor.endBenchmark("collision-detection");

    // Monitor pathfinding performance
    this.performanceMonitor.startBenchmark("pathfinding");
    this.updatePathfinding();
    this.performanceMonitor.endBenchmark("pathfinding");

    // Log performance every 60 frames
    if (this.frameCount % 60 === 0) {
      this.logPerformance();
    }
  }

  private logPerformance() {
    const collisionResults = this.performanceMonitor.getBenchmarkResults("collision-detection");
    const pathfindingResults = this.performanceMonitor.getBenchmarkResults("pathfinding");

    console.log("Performance Report:");
    console.log(`Collision Detection: ${collisionResults?.opsPerSecond} ops/sec`);
    console.log(`Pathfinding: ${pathfindingResults?.opsPerSecond} ops/sec`);
  }
}
```

## Memory Management

Use memory pooling for high-frequency game objects.

```typescript
import { MemoryPool } from "@entropy-tamer/reynard-algorithms";

class GameObjectManager {
  private aabbPool: MemoryPool<AABB>;
  private pointPool: MemoryPool<Point>;
  private vectorPool: MemoryPool<Vector>;

  constructor() {
    this.aabbPool = new MemoryPool(() => new AABB(0, 0, 0, 0));
    this.pointPool = new MemoryPool(() => new Point(0, 0));
    this.vectorPool = new MemoryPool(() => new Vector(0, 0));
  }

  createAABB(x: number, y: number, width: number, height: number): AABB {
    const aabb = this.aabbPool.get();
    aabb.x = x;
    aabb.y = y;
    aabb.width = width;
    aabb.height = height;
    return aabb;
  }

  releaseAABB(aabb: AABB): void {
    this.aabbPool.release(aabb);
  }

  createPoint(x: number, y: number): Point {
    const point = this.pointPool.get();
    point.x = x;
    point.y = y;
    return point;
  }

  releasePoint(point: Point): void {
    this.pointPool.release(point);
  }

  getMemoryStats() {
    return {
      aabbPool: this.aabbPool.getStats(),
      pointPool: this.pointPool.getStats(),
      vectorPool: this.vectorPool.getStats(),
    };
  }
}
```

## Game State Management

Use LRU Cache for efficient game state caching.

```typescript
import { LRUCache } from "@entropy-tamer/reynard-algorithms";

class GameStateManager {
  private stateCache: LRUCache<string, any>;
  private undoStack: LRUCache<number, GameState>;

  constructor() {
    // Cache up to 100 game states
    this.stateCache = new LRUCache<string, any>(100);

    // Keep last 50 undo states
    this.undoStack = new LRUCache<number, GameState>(50);
  }

  saveState(key: string, state: any): void {
    this.stateCache.set(key, state);
  }

  loadState(key: string): any | undefined {
    return this.stateCache.get(key);
  }

  saveUndoState(frame: number, state: GameState): void {
    this.undoStack.set(frame, state);
  }

  getUndoState(frame: number): GameState | undefined {
    return this.undoStack.get(frame);
  }

  getCacheStats() {
    return {
      stateCache: this.stateCache.getStats(),
      undoStack: this.undoStack.getStats(),
    };
  }
}
```

## Best Practices for Game Development

1. **Use spatial partitioning** for collision detection in large worlds
2. **Implement memory pooling** for frequently created/destroyed objects
3. **Cache pathfinding results** to avoid redundant calculations
4. **Monitor performance** continuously during development
5. **Use appropriate data structures** for different game systems
6. **Implement object pooling** for particles, bullets, and other short-lived objects
7. **Profile memory usage** regularly to prevent memory leaks
8. **Use Union-Find** for efficient entity grouping and queries

## Integration with Popular Game Engines

### Three.js Integration

```typescript
import { SpatialHash, AABB } from "@entropy-tamer/reynard-algorithms";
import * as THREE from "three";

class ThreeJSIntegration {
  private spatialHash: SpatialHash;
  private meshColliders: Map<THREE.Mesh, AABB> = new Map();

  constructor() {
    this.spatialHash = new SpatialHash(50);
  }

  addMeshCollider(mesh: THREE.Mesh) {
    const box = new THREE.Box3().setFromObject(mesh);
    const aabb = new AABB(box.min.x, box.min.y, box.max.x - box.min.x, box.max.y - box.min.y);

    this.meshColliders.set(mesh, aabb);
    this.spatialHash.insert({ mesh, ...aabb });
  }

  updateMeshCollider(mesh: THREE.Mesh) {
    const collider = this.meshColliders.get(mesh);
    if (collider) {
      this.spatialHash.remove({ mesh, ...collider });

      const box = new THREE.Box3().setFromObject(mesh);
      collider.x = box.min.x;
      collider.y = box.min.y;
      collider.width = box.max.x - box.min.x;
      collider.height = box.max.y - box.min.y;

      this.spatialHash.insert({ mesh, ...collider });
    }
  }
}
```

This integration approach ensures optimal performance while maintaining clean, maintainable code architecture.
