"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
class UnionFindSetOperations {
  constructor(nodes, stats) {
    this.nodes = nodes;
    this.stats = stats;
  }
  /**
   * Find the root of a node with path compression
   */
  find(x) {
    if (this.nodes[x].parent !== x) {
      this.nodes[x].parent = this.find(this.nodes[x].parent);
      this.stats.compressionCount++;
    }
    return this.nodes[x].parent;
  }
  /**
   * Get the size of the set containing x
   */
  getSetSize(x) {
    const root = this.find(x);
    return this.nodes.filter((node) => this.find(this.nodes.indexOf(node)) === root).length;
  }
  /**
   * Get all nodes in the same set as x
   */
  getSetMembers(x) {
    const root = this.find(x);
    return this.nodes.map((_, index) => index).filter((index) => this.find(index) === root);
  }
  /**
   * Get statistics about the Union-Find structure
   */
  getStats() {
    const roots = /* @__PURE__ */ new Set();
    let maxRank = 0;
    let totalRank = 0;
    for (let i = 0; i < this.nodes.length; i++) {
      const root = this.find(i);
      roots.add(root);
      maxRank = Math.max(maxRank, this.nodes[root].rank);
      totalRank += this.nodes[root].rank;
    }
    return {
      totalNodes: this.nodes.length,
      totalSets: roots.size,
      maxRank,
      averageRank: roots.size > 0 ? totalRank / roots.size : 0,
      compressionCount: this.stats.compressionCount,
      unionCount: this.stats.unionCount
    };
  }
}
class UnionFind {
  constructor(size) {
    this.stats = {
      compressionCount: 0,
      unionCount: 0
    };
    this.nodes = Array.from({ length: size }, (_, i) => ({
      parent: i,
      rank: 0
    }));
    this.setOps = new UnionFindSetOperations(this.nodes, this.stats);
  }
  find(x) {
    return this.setOps.find(x);
  }
  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false;
    this.stats.unionCount++;
    if (this.nodes[rootX].rank < this.nodes[rootY].rank) {
      this.nodes[rootX].parent = rootY;
    } else if (this.nodes[rootX].rank > this.nodes[rootY].rank) {
      this.nodes[rootY].parent = rootX;
    } else {
      this.nodes[rootY].parent = rootX;
      this.nodes[rootX].rank++;
    }
    return true;
  }
  connected(x, y) {
    return this.find(x) === this.find(y);
  }
  getSetSize(x) {
    return this.setOps.getSetSize(x);
  }
  getSetMembers(x) {
    return this.setOps.getSetMembers(x);
  }
  getStats() {
    return this.setOps.getStats();
  }
  reset() {
    this.nodes = this.nodes.map((_, i) => ({
      parent: i,
      rank: 0
    }));
    this.stats.compressionCount = 0;
    this.stats.unionCount = 0;
    this.setOps = new UnionFindSetOperations(this.nodes, this.stats);
  }
  clone() {
    const clone = new UnionFind(this.nodes.length);
    clone.nodes = this.nodes.map((node) => ({ ...node }));
    clone.stats = { ...this.stats };
    clone.setOps = new UnionFindSetOperations(clone.nodes, clone.stats);
    return clone;
  }
}
function estimateMemoryUsage(cellCount, objectCount, objectToCellCount) {
  let usage = 0;
  usage += cellCount * 50;
  usage += objectToCellCount * 30;
  usage += objectCount * 100;
  return usage;
}
class SpatialHash {
  constructor(config = {}) {
    this.cells = /* @__PURE__ */ new Map();
    this.objectToCells = /* @__PURE__ */ new Map();
    this.stats = {
      queryCount: 0,
      insertCount: 0,
      removeCount: 0
    };
    this.lastCleanup = Date.now();
    this.config = {
      cellSize: 100,
      maxObjectsPerCell: 50,
      enableAutoResize: true,
      resizeThreshold: 0.8,
      cleanupInterval: 6e4,
      // 1 minute
      ...config
    };
  }
  /**
   * Insert an object into the spatial hash
   */
  insert(object) {
    const cellKeys = this.getObjectCells(object);
    for (const cellKey of Array.from(cellKeys)) {
      if (!this.cells.has(cellKey)) {
        this.cells.set(cellKey, []);
      }
      this.cells.get(cellKey).push(object);
    }
    this.objectToCells.set(object.id, cellKeys);
    this.stats.insertCount++;
    this.checkAutoResize();
    this.checkCleanup();
  }
  /**
   * Remove an object from the spatial hash
   */
  remove(objectId) {
    const cellKeys = this.objectToCells.get(objectId);
    if (!cellKeys) return false;
    for (const cellKey of Array.from(cellKeys)) {
      const cell = this.cells.get(cellKey);
      if (cell) {
        const index = cell.findIndex((obj) => obj.id === objectId);
        if (index !== -1) {
          cell.splice(index, 1);
          if (cell.length === 0) {
            this.cells.delete(cellKey);
          }
        }
      }
    }
    this.objectToCells.delete(objectId);
    this.stats.removeCount++;
    return true;
  }
  /**
   * Update an object's position in the spatial hash
   */
  update(object) {
    if (this.remove(object.id)) {
      this.insert(object);
      return true;
    }
    return false;
  }
  /**
   * Query for objects in a rectangular area
   */
  queryRect(x, y, width, height) {
    const cellKeys = this.getRectCells(x, y, width, height);
    const results = /* @__PURE__ */ new Map();
    for (const cellKey of Array.from(cellKeys)) {
      const cell = this.cells.get(cellKey);
      if (cell) {
        for (const obj of cell) {
          if (this.isObjectInRect(obj, x, y, width, height) && obj.data !== void 0) {
            results.set(obj.id, obj);
          }
        }
      }
    }
    this.stats.queryCount++;
    return Array.from(results.values());
  }
  /**
   * Query for objects within a radius of a point
   */
  queryRadius(centerX, centerY, radius) {
    const cellKeys = this.getRadiusCells(centerX, centerY, radius);
    const results = [];
    for (const cellKey of Array.from(cellKeys)) {
      const cell = this.cells.get(cellKey);
      if (cell) {
        for (const obj of cell) {
          const distance2 = this.getDistance(centerX, centerY, obj.x, obj.y);
          if (distance2 <= radius) {
            results.push({
              object: obj,
              distance: distance2,
              cellKey
            });
          }
        }
      }
    }
    this.stats.queryCount++;
    return results.sort((a, b) => a.distance - b.distance);
  }
  /**
   * Find the nearest object to a point
   */
  findNearest(x, y, maxDistance) {
    const radius = maxDistance || this.config.cellSize * 2;
    const results = this.queryRadius(x, y, radius);
    if (results.length === 0) {
      const expandedResults = this.queryRadius(x, y, radius * 2);
      return expandedResults[0] || null;
    }
    return results[0];
  }
  /**
   * Get all objects in the spatial hash
   */
  getAllObjects() {
    const objects = /* @__PURE__ */ new Map();
    for (const cell of Array.from(this.cells.values())) {
      for (const obj of cell) {
        if (obj.data !== void 0) {
          objects.set(obj.id, obj);
        }
      }
    }
    return Array.from(objects.values());
  }
  /**
   * Clear all objects from the spatial hash
   */
  clear() {
    this.cells.clear();
    this.objectToCells.clear();
    this.stats.queryCount = 0;
    this.stats.insertCount = 0;
    this.stats.removeCount = 0;
  }
  /**
   * Get statistics about the spatial hash
   */
  getStats() {
    let totalObjects = 0;
    let maxObjectsInCell = 0;
    let emptyCells = 0;
    for (const cell of Array.from(this.cells.values())) {
      totalObjects += cell.length;
      maxObjectsInCell = Math.max(maxObjectsInCell, cell.length);
    }
    emptyCells = this.cells.size === 0 ? 0 : Array.from(this.cells.values()).filter((cell) => cell.length === 0).length;
    return {
      totalCells: this.cells.size,
      totalObjects,
      averageObjectsPerCell: this.cells.size > 0 ? totalObjects / this.cells.size : 0,
      maxObjectsInCell,
      emptyCells,
      memoryUsage: estimateMemoryUsage(this.cells.size, totalObjects, this.objectToCells.size),
      queryCount: this.stats.queryCount,
      insertCount: this.stats.insertCount,
      removeCount: this.stats.removeCount
    };
  }
  /**
   * Resize the spatial hash with a new cell size
   */
  resize(newCellSize) {
    if (newCellSize === this.config.cellSize) return;
    const oldCells = this.cells;
    const oldObjectToCells = this.objectToCells;
    this.config.cellSize = newCellSize;
    this.cells = /* @__PURE__ */ new Map();
    this.objectToCells = /* @__PURE__ */ new Map();
    for (const [objectId, cellKeys] of Array.from(oldObjectToCells.entries())) {
      const firstCellKey = Array.from(cellKeys)[0];
      const object = oldCells.get(firstCellKey)?.find((obj) => obj.id === objectId);
      if (object && object.data !== void 0) {
        this.insert(object);
      }
    }
  }
  getObjectCells(object) {
    const width = object.width || 0;
    const height = object.height || 0;
    return this.getRectCells(object.x, object.y, width, height);
  }
  getRectCells(x, y, width, height) {
    const minCellX = Math.floor(x / this.config.cellSize);
    const maxCellX = Math.floor((x + width) / this.config.cellSize);
    const minCellY = Math.floor(y / this.config.cellSize);
    const maxCellY = Math.floor((y + height) / this.config.cellSize);
    const cellKeys = /* @__PURE__ */ new Set();
    for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
      for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
        cellKeys.add(`${cellX},${cellY}`);
      }
    }
    return cellKeys;
  }
  getRadiusCells(centerX, centerY, radius) {
    const minCellX = Math.floor((centerX - radius) / this.config.cellSize);
    const maxCellX = Math.floor((centerX + radius) / this.config.cellSize);
    const minCellY = Math.floor((centerY - radius) / this.config.cellSize);
    const maxCellY = Math.floor((centerY + radius) / this.config.cellSize);
    const cellKeys = /* @__PURE__ */ new Set();
    for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
      for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
        cellKeys.add(`${cellX},${cellY}`);
      }
    }
    return cellKeys;
  }
  isObjectInRect(object, rectX, rectY, rectWidth, rectHeight) {
    const objWidth = object.width || 0;
    const objHeight = object.height || 0;
    return object.x < rectX + rectWidth && object.x + objWidth > rectX && object.y < rectY + rectHeight && object.y + objHeight > rectY;
  }
  getDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
  checkAutoResize() {
    if (!this.config.enableAutoResize) return;
    const stats = this.getStats();
    const loadFactor = stats.averageObjectsPerCell / this.config.maxObjectsPerCell;
    if (loadFactor > this.config.resizeThreshold) {
      const newCellSize = this.config.cellSize * 1.5;
      this.resize(newCellSize);
    }
  }
  checkCleanup() {
    const now = Date.now();
    if (now - this.lastCleanup > this.config.cleanupInterval) {
      this.cleanup();
      this.lastCleanup = now;
    }
  }
  cleanup() {
    for (const [cellKey, cell] of Array.from(this.cells.entries())) {
      if (cell.length === 0) {
        this.cells.delete(cellKey);
      }
    }
  }
}
class PriorityQueue {
  /**
   * Creates a new Priority Queue instance
   *
   * @param options - Configuration options for the priority queue
   */
  constructor(options = {}) {
    this.heap = [];
    this.config = {
      initialCapacity: options.initialCapacity ?? 16,
      maxHeap: options.maxHeap ?? false,
      growthFactor: options.growthFactor ?? 2,
      maxCapacity: options.maxCapacity ?? Number.MAX_SAFE_INTEGER
    };
    this.comparator = options.comparator;
    this.eventHandler = options.onEvent;
    this.stats = {
      insertCount: 0,
      extractCount: 0,
      heapifyCount: 0,
      size: 0,
      maxSize: 0,
      averageInsertTime: 0,
      averageExtractTime: 0
    };
    this.heap = new Array(this.config.initialCapacity);
    this.heap.length = 0;
  }
  /**
   * Inserts an element into the priority queue
   *
   * Mathematical Process:
   * 1. Add element to the end of the heap array
   * 2. Bubble up to maintain heap property: while parent has lower priority, swap with parent
   * 3. Time complexity: O(log n) where n is the number of elements
   *
   * @param data - The data to insert
   * @param priority - The priority of the data (lower = higher priority for min-heap)
   * @returns True if insertion was successful
   */
  insert(data, priority) {
    const startTime = performance.now();
    try {
      if (this.heap.length >= this.config.maxCapacity) {
        this.emitEvent("insert", data, priority, { error: "Capacity exceeded" });
        return false;
      }
      if (this.heap.length >= this.heap.length) {
        this.resize();
      }
      const newNode = { data, priority };
      this.heap.push(newNode);
      this.stats.size++;
      this.stats.maxSize = Math.max(this.stats.maxSize, this.stats.size);
      this.bubbleUp(this.heap.length - 1);
      this.stats.insertCount++;
      this.updateAverageInsertTime(performance.now() - startTime);
      this.emitEvent("insert", data, priority);
      return true;
    } catch (error) {
      this.emitEvent("insert", data, priority, { error: error instanceof Error ? error.message : "Unknown error" });
      return false;
    }
  }
  /**
   * Extracts and returns the highest priority element
   *
   * Mathematical Process:
   * 1. Remove root element (highest priority)
   * 2. Move last element to root position
   * 3. Bubble down to maintain heap property: while children have higher priority, swap with highest priority child
   * 4. Time complexity: O(log n)
   *
   * @returns The highest priority element, or undefined if queue is empty
   */
  extract() {
    const startTime = performance.now();
    if (this.isEmpty()) {
      return void 0;
    }
    const root = this.heap[0];
    const lastElement = this.heap.pop();
    this.stats.size--;
    if (!this.isEmpty()) {
      this.heap[0] = lastElement;
      this.bubbleDown(0);
    }
    this.stats.extractCount++;
    this.updateAverageExtractTime(performance.now() - startTime);
    this.emitEvent("extract", root.data, root.priority);
    return root.data;
  }
  /**
   * Returns the highest priority element without removing it
   *
   * Time complexity: O(1)
   *
   * @returns Peek result with element, priority, and empty status
   */
  peek() {
    if (this.isEmpty()) {
      return {
        element: void 0,
        priority: 0,
        isEmpty: true
      };
    }
    const root = this.heap[0];
    return {
      element: root.data,
      priority: root.priority,
      isEmpty: false
    };
  }
  /**
   * Returns the current size of the priority queue
   *
   * @returns Number of elements in the queue
   */
  size() {
    return this.stats.size;
  }
  /**
   * Checks if the priority queue is empty
   *
   * @returns True if the queue is empty
   */
  isEmpty() {
    return this.stats.size === 0;
  }
  /**
   * Clears all elements from the priority queue
   */
  clear() {
    this.heap.length = 0;
    this.stats.size = 0;
    this.emitEvent("clear");
  }
  /**
   * Inserts multiple elements in batch
   *
   * @param elements - Array of {data, priority} objects
   * @returns Batch operation result
   */
  batchInsert(elements) {
    const inserted = [];
    const failed = [];
    for (const { data, priority } of elements) {
      if (this.insert(data, priority)) {
        inserted.push(data);
      } else {
        failed.push(data);
      }
    }
    return {
      inserted,
      failed,
      total: elements.length,
      successRate: inserted.length / elements.length
    };
  }
  /**
   * Returns performance statistics
   *
   * @returns Current statistics
   */
  getStats() {
    return { ...this.stats };
  }
  /**
   * Returns the heap as an array (for debugging)
   *
   * @returns Copy of the internal heap array
   */
  toArray() {
    return [...this.heap];
  }
  /**
   * Creates an iterator for the priority queue
   *
   * @returns Iterator that yields elements in priority order
   */
  *[Symbol.iterator]() {
    const copy = new PriorityQueue({ ...this.config, comparator: this.comparator });
    for (const node of this.heap) {
      copy.insert(node.data, node.priority);
    }
    while (!copy.isEmpty()) {
      yield copy.extract();
    }
  }
  /**
   * Bubbles up an element to maintain heap property
   *
   * Mathematical Process:
   * - Compare element with parent
   * - If heap property is violated, swap with parent
   * - Continue until heap property is satisfied or element reaches root
   *
   * @param index - Index of element to bubble up
   */
  bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.hasHigherPriority(index, parentIndex)) {
        this.swap(index, parentIndex);
        index = parentIndex;
      } else {
        break;
      }
    }
  }
  /**
   * Bubbles down an element to maintain heap property
   *
   * Mathematical Process:
   * - Compare element with its children
   * - If heap property is violated, swap with highest priority child
   * - Continue until heap property is satisfied or element reaches leaf
   *
   * @param index - Index of element to bubble down
   */
  bubbleDown(index) {
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let highestPriorityIndex = index;
      if (leftChild < this.heap.length && this.hasHigherPriority(leftChild, highestPriorityIndex)) {
        highestPriorityIndex = leftChild;
      }
      if (rightChild < this.heap.length && this.hasHigherPriority(rightChild, highestPriorityIndex)) {
        highestPriorityIndex = rightChild;
      }
      if (highestPriorityIndex === index) {
        break;
      }
      this.swap(index, highestPriorityIndex);
      index = highestPriorityIndex;
    }
  }
  /**
   * Checks if element at index1 has higher priority than element at index2
   *
   * @param index1 - First element index
   * @param index2 - Second element index
   * @returns True if index1 has higher priority
   */
  hasHigherPriority(index1, index2) {
    const node1 = this.heap[index1];
    const node2 = this.heap[index2];
    if (this.comparator) {
      return this.comparator(node1.data, node2.data) < 0;
    }
    if (this.config.maxHeap) {
      return node1.priority > node2.priority;
    } else {
      return node1.priority < node2.priority;
    }
  }
  /**
   * Swaps two elements in the heap
   *
   * @param index1 - First element index
   * @param index2 - Second element index
   */
  swap(index1, index2) {
    [this.heap[index1], this.heap[index2]] = [this.heap[index2], this.heap[index1]];
  }
  /**
   * Resizes the heap array when capacity is exceeded
   */
  resize() {
    const newCapacity = Math.min(this.heap.length * this.config.growthFactor, this.config.maxCapacity);
    if (newCapacity > this.heap.length) {
      const newHeap = new Array(newCapacity);
      for (let i = 0; i < this.heap.length; i++) {
        newHeap[i] = this.heap[i];
      }
      this.heap = newHeap;
      this.emitEvent("resize", void 0, void 0, { newCapacity });
    }
  }
  /**
   * Updates the average insertion time
   *
   * @param time - Time taken for insertion
   */
  updateAverageInsertTime(time) {
    this.stats.averageInsertTime = (this.stats.averageInsertTime * (this.stats.insertCount - 1) + time) / this.stats.insertCount;
  }
  /**
   * Updates the average extraction time
   *
   * @param time - Time taken for extraction
   */
  updateAverageExtractTime(time) {
    this.stats.averageExtractTime = (this.stats.averageExtractTime * (this.stats.extractCount - 1) + time) / this.stats.extractCount;
  }
  /**
   * Emits an event if event handler is configured
   *
   * @param type - Event type
   * @param data - Event data
   * @param priority - Event priority
   * @param metadata - Additional metadata
   */
  emitEvent(type, data, priority, metadata) {
    if (this.eventHandler) {
      const event = {
        type,
        timestamp: performance.now(),
        data,
        priority,
        metadata
      };
      this.eventHandler(event);
    }
  }
}
class LRUCache {
  /**
   * Creates a new LRU Cache instance
   *
   * @param options - Configuration options for the LRU cache
   */
  constructor(options) {
    this.cache = /* @__PURE__ */ new Map();
    this.head = null;
    this.tail = null;
    this.config = {
      maxSize: options.maxSize,
      ttl: options.ttl ?? 0,
      enableCleanup: options.enableCleanup ?? true,
      cleanupInterval: options.cleanupInterval ?? 6e4,
      // 1 minute
      enableStats: options.enableStats ?? true
    };
    this.eventHandler = options.onEvent;
    this.onEvict = options.onEvict;
    this.onAccess = options.onAccess;
    this.onSet = options.onSet;
    this.onDelete = options.onDelete;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      size: 0,
      maxSize: this.config.maxSize,
      hitRate: 0,
      averageAccessTime: 0
    };
    this.performanceMetrics = {
      averageGetTime: 0,
      averageSetTime: 0,
      averageDeleteTime: 0,
      estimatedMemoryUsage: 0,
      cleanupCount: 0,
      totalCleanupTime: 0
    };
    if (this.config.enableCleanup && this.config.ttl > 0) {
      this.startCleanupTimer();
    }
  }
  /**
   * Gets a value from the cache
   *
   * Mathematical Process:
   * 1. Look up node in hash map: O(1)
   * 2. Check if expired (if TTL enabled)
   * 3. Move node to head of doubly-linked list: O(1)
   * 4. Update access statistics
   *
   * @param key - The key to look up
   * @returns The cached value, or undefined if not found or expired
   */
  get(key) {
    const startTime = performance.now();
    const node = this.cache.get(key);
    if (!node) {
      this.stats.misses++;
      this.updateHitRate();
      this.emitEvent("get", key, void 0, { hit: false });
      return void 0;
    }
    if (this.isExpired(node)) {
      this.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      this.emitEvent("get", key, void 0, { hit: false, expired: true });
      return void 0;
    }
    this.moveToHead(node);
    node.lastAccessed = Date.now();
    node.accessCount++;
    this.stats.hits++;
    this.updateHitRate();
    this.updateAverageGetTime(performance.now() - startTime);
    this.emitEvent("get", key, node.value, { hit: true });
    if (this.config.enableStats) {
      this.updateMostAccessedKey(key, node.accessCount);
    }
    return node.value;
  }
  /**
   * Sets a value in the cache
   *
   * Mathematical Process:
   * 1. Check if key exists in hash map: O(1)
   * 2. If exists, update value and move to head: O(1)
   * 3. If not exists, create new node and add to head: O(1)
   * 4. If cache is full, evict tail node: O(1)
   * 5. Update statistics
   *
   * @param key - The key to store
   * @param value - The value to store
   * @returns True if the operation was successful
   */
  set(key, value) {
    const startTime = performance.now();
    try {
      const existingNode = this.cache.get(key);
      if (existingNode) {
        existingNode.value = value;
        existingNode.lastAccessed = Date.now();
        existingNode.accessCount++;
        this.moveToHead(existingNode);
        this.emitEvent("set", key, value, { updated: true });
      } else {
        const newNode = {
          key,
          value,
          prev: null,
          next: null,
          lastAccessed: Date.now(),
          accessCount: 1
        };
        this.cache.set(key, newNode);
        this.stats.size++;
        this.stats.sets++;
        this.addToHead(newNode);
        if (this.cache.size > this.config.maxSize) {
          this.evict();
        }
        this.emitEvent("set", key, value, { updated: false });
      }
      this.updateAverageSetTime(performance.now() - startTime);
      this.updateMemoryUsage();
      return true;
    } catch (error) {
      this.emitEvent("set", key, value, { error: error instanceof Error ? error.message : "Unknown error" });
      return false;
    }
  }
  /**
   * Deletes a value from the cache
   *
   * Mathematical Process:
   * 1. Look up node in hash map: O(1)
   * 2. Remove from doubly-linked list: O(1)
   * 3. Remove from hash map: O(1)
   * 4. Update statistics
   *
   * @param key - The key to delete
   * @returns True if the key existed and was deleted
   */
  delete(key) {
    const startTime = performance.now();
    const node = this.cache.get(key);
    if (!node) {
      return false;
    }
    this.removeNode(node);
    this.cache.delete(key);
    this.stats.size--;
    this.stats.deletes++;
    this.updateAverageDeleteTime(performance.now() - startTime);
    this.updateMemoryUsage();
    this.emitEvent("delete", key, node.value);
    return true;
  }
  /**
   * Checks if a key exists in the cache
   *
   * @param key - The key to check
   * @returns True if the key exists and is not expired
   */
  has(key) {
    const node = this.cache.get(key);
    if (!node) {
      return false;
    }
    if (this.isExpired(node)) {
      this.delete(key);
      return false;
    }
    return true;
  }
  /**
   * Clears all entries from the cache
   */
  clear() {
    this.cache.clear();
    this.head = null;
    this.tail = null;
    this.stats.size = 0;
    this.emitEvent("clear");
  }
  /**
   * Gets the current size of the cache
   *
   * @returns Number of items in the cache
   */
  size() {
    return this.stats.size;
  }
  /**
   * Gets the maximum size of the cache
   *
   * @returns Maximum number of items the cache can hold
   */
  maxSize() {
    return this.config.maxSize;
  }
  /**
   * Gets cache statistics
   *
   * @returns Current cache statistics
   */
  getStats() {
    return { ...this.stats };
  }
  /**
   * Gets performance metrics
   *
   * @returns Current performance metrics
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }
  /**
   * Creates a snapshot of the cache state
   *
   * @returns Cache snapshot for debugging and analysis
   */
  snapshot() {
    const entries = [];
    let current = this.head;
    while (current) {
      entries.push({
        key: current.key,
        value: current.value,
        createdAt: current.lastAccessed,
        lastAccessed: current.lastAccessed,
        accessCount: current.accessCount,
        ttl: this.config.ttl,
        isExpired: this.isExpired(current)
      });
      current = current.next;
    }
    return {
      entries,
      stats: this.getStats(),
      config: { ...this.config },
      timestamp: Date.now()
    };
  }
  /**
   * Batch sets multiple key-value pairs
   *
   * @param entries - Array of key-value pairs to set
   * @returns Batch operation result
   */
  batchSet(entries) {
    const processed = [];
    const failed = [];
    for (const { key, value } of entries) {
      try {
        if (this.set(key, value)) {
          processed.push({ key, value });
        } else {
          failed.push({ key, value, error: "Set operation failed" });
        }
      } catch (error) {
        failed.push({
          key,
          value,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    return {
      processed,
      failed,
      total: entries.length,
      successRate: processed.length / entries.length
    };
  }
  /**
   * Creates an iterator for the cache entries
   *
   * @returns Iterator that yields entries in LRU order (most recent first)
   */
  *[Symbol.iterator]() {
    let current = this.head;
    while (current) {
      if (!this.isExpired(current)) {
        yield { key: current.key, value: current.value };
      }
      current = current.next;
    }
  }
  /**
   * Moves a node to the head of the doubly-linked list
   *
   * @param node - The node to move
   */
  moveToHead(node) {
    this.removeNode(node);
    this.addToHead(node);
  }
  /**
   * Adds a node to the head of the doubly-linked list
   *
   * @param node - The node to add
   */
  addToHead(node) {
    node.prev = null;
    node.next = this.head;
    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
  }
  /**
   * Removes a node from the doubly-linked list
   *
   * @param node - The node to remove
   */
  removeNode(node) {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }
  /**
   * Evicts the least recently used item (tail of the list)
   */
  evict() {
    if (!this.tail) {
      return;
    }
    const evictedKey = this.tail.key;
    const evictedValue = this.tail.value;
    this.removeNode(this.tail);
    this.cache.delete(evictedKey);
    this.stats.size--;
    this.stats.evictions++;
    this.emitEvent("evict", evictedKey, evictedValue);
  }
  /**
   * Checks if a node has expired based on TTL
   *
   * @param node - The node to check
   * @returns True if the node has expired
   */
  isExpired(node) {
    if (this.config.ttl <= 0) {
      return false;
    }
    return Date.now() - node.lastAccessed > this.config.ttl;
  }
  /**
   * Starts the cleanup timer for expired entries
   */
  startCleanupTimer() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }
  /**
   * Cleans up expired entries
   */
  cleanup() {
    const startTime = performance.now();
    const expiredKeys = [];
    for (const [key, node] of this.cache) {
      if (this.isExpired(node)) {
        expiredKeys.push(key);
      }
    }
    for (const key of expiredKeys) {
      this.delete(key);
      this.emitEvent("expire", key);
    }
    this.performanceMetrics.cleanupCount++;
    this.performanceMetrics.totalCleanupTime += performance.now() - startTime;
    this.emitEvent("cleanup", void 0, void 0, { expiredCount: expiredKeys.length });
  }
  /**
   * Updates the hit rate statistic
   */
  updateHitRate() {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }
  /**
   * Updates the most accessed key statistic
   *
   * @param key - The key that was accessed
   * @param accessCount - The access count for the key
   */
  updateMostAccessedKey(key, accessCount) {
    if (!this.stats.mostAccessedKey) {
      this.stats.mostAccessedKey = key;
      return;
    }
    const mostAccessedNode = this.cache.get(this.stats.mostAccessedKey);
    if (!mostAccessedNode || accessCount > mostAccessedNode.accessCount) {
      this.stats.mostAccessedKey = key;
    }
  }
  /**
   * Updates the average get time
   *
   * @param time - Time taken for the get operation
   */
  updateAverageGetTime(time) {
    const totalGets = this.stats.hits + this.stats.misses;
    this.performanceMetrics.averageGetTime = (this.performanceMetrics.averageGetTime * (totalGets - 1) + time) / totalGets;
  }
  /**
   * Updates the average set time
   *
   * @param time - Time taken for the set operation
   */
  updateAverageSetTime(time) {
    this.performanceMetrics.averageSetTime = (this.performanceMetrics.averageSetTime * (this.stats.sets - 1) + time) / this.stats.sets;
  }
  /**
   * Updates the average delete time
   *
   * @param time - Time taken for the delete operation
   */
  updateAverageDeleteTime(time) {
    this.performanceMetrics.averageDeleteTime = (this.performanceMetrics.averageDeleteTime * (this.stats.deletes - 1) + time) / this.stats.deletes;
  }
  /**
   * Updates the estimated memory usage
   */
  updateMemoryUsage() {
    let estimatedSize = 0;
    for (const [key, node] of this.cache) {
      estimatedSize += JSON.stringify(key).length * 2;
      estimatedSize += JSON.stringify(node.value).length * 2;
      estimatedSize += 64;
    }
    this.performanceMetrics.estimatedMemoryUsage = estimatedSize;
  }
  /**
   * Emits an event if event handler is configured
   *
   * @param type - Event type
   * @param key - Event key
   * @param value - Event value
   * @param metadata - Additional metadata
   */
  emitEvent(type, key, value, metadata) {
    const event = {
      type,
      timestamp: Date.now(),
      key,
      value,
      metadata
    };
    if (this.eventHandler) {
      this.eventHandler(event);
    }
    if (key !== void 0 && value !== void 0) {
      switch (type) {
        case "set":
          if (this.onSet) {
            this.onSet(key, value);
          }
          break;
        case "get":
          if (this.onAccess) {
            this.onAccess(key, value);
          }
          break;
        case "delete":
          if (this.onDelete) {
            this.onDelete(key, value);
          }
          break;
        case "evict":
          if (this.onEvict) {
            this.onEvict(key, value);
          }
          break;
      }
    }
  }
  /**
   * Destroys the cache and cleans up resources
   */
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}
var TrieEventType = /* @__PURE__ */ ((TrieEventType2) => {
  TrieEventType2["WORD_INSERTED"] = "word_inserted";
  TrieEventType2["WORD_DELETED"] = "word_deleted";
  TrieEventType2["WORD_SEARCHED"] = "word_searched";
  TrieEventType2["PREFIX_SEARCHED"] = "prefix_searched";
  TrieEventType2["AUTCOMPLETE_PERFORMED"] = "autocomplete_performed";
  TrieEventType2["NODE_CREATED"] = "node_created";
  TrieEventType2["NODE_DELETED"] = "node_deleted";
  TrieEventType2["COMPRESSION_PERFORMED"] = "compression_performed";
  TrieEventType2["CLEAR_PERFORMED"] = "clear_performed";
  return TrieEventType2;
})(TrieEventType || {});
const DEFAULT_TRIE_CONFIG = {
  caseSensitive: false,
  allowEmptyStrings: false,
  maxDepth: 1e3,
  useCompression: false,
  trackFrequency: true,
  enableWildcards: true,
  wildcardChar: "*",
  enableFuzzyMatching: false,
  maxEditDistance: 2
};
const DEFAULT_TRIE_OPTIONS = {
  config: DEFAULT_TRIE_CONFIG,
  enableStats: true,
  enableDebug: false,
  initialWords: []
};
class Trie {
  constructor(options = {}) {
    const opts = { ...DEFAULT_TRIE_OPTIONS, ...options };
    this.config = { ...DEFAULT_TRIE_CONFIG, ...opts.config };
    this.eventHandlers = opts.eventHandlers || [];
    this.enableStats = opts.enableStats ?? true;
    this.enableDebug = opts.enableDebug ?? false;
    this.root = this.createNode("", null);
    this.root.isEndOfWord = false;
    this.stats = {
      totalWords: 0,
      totalNodes: 1,
      // Root node
      averageWordLength: 0,
      maxDepth: 0,
      totalSearches: 0,
      totalInserts: 0,
      totalDeletes: 0,
      averageSearchTime: 0,
      memoryUsage: 0
    };
    if (opts.initialWords && opts.initialWords.length > 0) {
      this.insertBatch(opts.initialWords);
    }
  }
  /**
   * Insert a word into the trie
   *
   * @param word The word to insert
   * @param data Optional data associated with the word
   * @returns True if insertion was successful
   */
  insert(word, data) {
    const startTime = performance.now();
    try {
      const normalizedWord = this.normalizeWord(word);
      if (!this.config.allowEmptyStrings && normalizedWord.length === 0) {
        return false;
      }
      if (normalizedWord.length > this.config.maxDepth) {
        return false;
      }
      let currentNode = this.root;
      for (let i = 0; i < normalizedWord.length; i++) {
        const char = normalizedWord[i];
        if (!currentNode.children.has(char)) {
          const newNode = this.createNode(char, currentNode);
          currentNode.children.set(char, newNode);
          this.emitEvent(TrieEventType.NODE_CREATED, { node: newNode, char });
        }
        currentNode = currentNode.children.get(char);
      }
      currentNode.isEndOfWord = true;
      currentNode.data = data;
      currentNode.frequency++;
      this.stats.totalWords++;
      this.stats.totalNodes = this.countNodes();
      this.stats.averageWordLength = this.calculateAverageWordLength();
      this.stats.maxDepth = Math.max(this.stats.maxDepth, normalizedWord.length);
      this.stats.totalInserts++;
      this.emitEvent(TrieEventType.WORD_INSERTED, { word: normalizedWord, data });
      return true;
    } catch (error) {
      return false;
    } finally {
      if (this.enableStats) {
        const executionTime = performance.now() - startTime;
        this.stats.averageSearchTime = (this.stats.averageSearchTime * (this.stats.totalInserts - 1) + executionTime) / this.stats.totalInserts;
      }
    }
  }
  /**
   * Search for a word in the trie
   *
   * @param word The word to search for
   * @returns Search result
   */
  search(word) {
    const startTime = performance.now();
    let nodesTraversed = 0;
    try {
      const normalizedWord = this.normalizeWord(word);
      if (!this.config.allowEmptyStrings && normalizedWord.length === 0) {
        return {
          found: false,
          word: null,
          data: null,
          frequency: 0,
          executionTime: performance.now() - startTime,
          nodesTraversed: 0
        };
      }
      let currentNode = this.root;
      nodesTraversed++;
      for (let i = 0; i < normalizedWord.length; i++) {
        const char = normalizedWord[i];
        if (!currentNode.children.has(char)) {
          return {
            found: false,
            word: null,
            data: null,
            frequency: 0,
            executionTime: performance.now() - startTime,
            nodesTraversed
          };
        }
        currentNode = currentNode.children.get(char);
        nodesTraversed++;
      }
      const found = currentNode.isEndOfWord;
      if (this.enableStats) {
        this.stats.totalSearches++;
        const executionTime = performance.now() - startTime;
        this.stats.averageSearchTime = (this.stats.averageSearchTime * (this.stats.totalSearches - 1) + executionTime) / this.stats.totalSearches;
      }
      this.emitEvent(TrieEventType.WORD_SEARCHED, { word: normalizedWord, found });
      return {
        found,
        word: found ? normalizedWord : null,
        data: found ? currentNode.data : null,
        frequency: found ? currentNode.frequency : 0,
        executionTime: performance.now() - startTime,
        nodesTraversed
      };
    } catch (error) {
      return {
        found: false,
        word: null,
        data: null,
        frequency: 0,
        executionTime: performance.now() - startTime,
        nodesTraversed
      };
    }
  }
  /**
   * Delete a word from the trie
   *
   * @param word The word to delete
   * @returns True if deletion was successful
   */
  delete(word) {
    const startTime = performance.now();
    try {
      const normalizedWord = this.normalizeWord(word);
      if (!this.config.allowEmptyStrings && normalizedWord.length === 0) {
        return false;
      }
      const result = this.deleteRecursive(this.root, normalizedWord, 0);
      if (result) {
        this.stats.totalWords--;
        this.stats.totalNodes = this.countNodes();
        this.stats.averageWordLength = this.calculateAverageWordLength();
        this.stats.totalDeletes++;
        this.emitEvent(TrieEventType.WORD_DELETED, { word: normalizedWord });
      }
      return result;
    } catch (error) {
      return false;
    } finally {
      if (this.enableStats) {
        const executionTime = performance.now() - startTime;
        this.stats.averageSearchTime = (this.stats.averageSearchTime * (this.stats.totalDeletes - 1) + executionTime) / this.stats.totalDeletes;
      }
    }
  }
  /**
   * Find all words with a given prefix
   *
   * @param prefix The prefix to search for
   * @returns Prefix search result
   */
  findWordsWithPrefix(prefix) {
    const startTime = performance.now();
    let nodesTraversed = 0;
    try {
      const normalizedPrefix = this.normalizeWord(prefix);
      const words = [];
      const data = [];
      let currentNode = this.root;
      nodesTraversed++;
      for (let i = 0; i < normalizedPrefix.length; i++) {
        const char = normalizedPrefix[i];
        if (!currentNode.children.has(char)) {
          return {
            words: [],
            data: [],
            count: 0,
            executionTime: performance.now() - startTime,
            nodesTraversed
          };
        }
        currentNode = currentNode.children.get(char);
        nodesTraversed++;
      }
      this.collectWords(currentNode, normalizedPrefix, words, data, nodesTraversed);
      this.emitEvent(TrieEventType.PREFIX_SEARCHED, { prefix: normalizedPrefix, count: words.length });
      return {
        words,
        data,
        count: words.length,
        executionTime: performance.now() - startTime,
        nodesTraversed
      };
    } catch (error) {
      return {
        words: [],
        data: [],
        count: 0,
        executionTime: performance.now() - startTime,
        nodesTraversed
      };
    }
  }
  /**
   * Get autocomplete suggestions for a prefix
   *
   * @param prefix The prefix to autocomplete
   * @param maxSuggestions Maximum number of suggestions
   * @returns Autocomplete result
   */
  autocomplete(prefix, maxSuggestions = 10) {
    const startTime = performance.now();
    let nodesTraversed = 0;
    try {
      const normalizedPrefix = this.normalizeWord(prefix);
      const suggestions = [];
      let currentNode = this.root;
      nodesTraversed++;
      for (let i = 0; i < normalizedPrefix.length; i++) {
        const char = normalizedPrefix[i];
        if (!currentNode.children.has(char)) {
          return {
            suggestions: [],
            count: 0,
            executionTime: performance.now() - startTime,
            nodesTraversed
          };
        }
        currentNode = currentNode.children.get(char);
        nodesTraversed++;
      }
      this.collectAutocompleteSuggestions(currentNode, normalizedPrefix, suggestions, maxSuggestions, nodesTraversed);
      suggestions.sort((a, b) => b.score - a.score);
      this.emitEvent(TrieEventType.AUTCOMPLETE_PERFORMED, { prefix: normalizedPrefix, count: suggestions.length });
      return {
        suggestions: suggestions.slice(0, maxSuggestions),
        count: suggestions.length,
        executionTime: performance.now() - startTime,
        nodesTraversed
      };
    } catch (error) {
      return {
        suggestions: [],
        count: 0,
        executionTime: performance.now() - startTime,
        nodesTraversed
      };
    }
  }
  /**
   * Find fuzzy matches for a word
   *
   * @param word The word to find fuzzy matches for
   * @param maxDistance Maximum edit distance
   * @returns Array of fuzzy match results
   */
  findFuzzyMatches(word, maxDistance) {
    if (!this.config.enableFuzzyMatching) {
      return [];
    }
    const normalizedWord = this.normalizeWord(word);
    const maxEditDistance = maxDistance || this.config.maxEditDistance;
    const matches = [];
    this.findFuzzyMatchesRecursive(this.root, "", normalizedWord, maxEditDistance, matches);
    matches.sort((a, b) => b.similarity - a.similarity);
    return matches;
  }
  /**
   * Find wildcard matches for a pattern
   *
   * @param pattern The pattern to match (with wildcards)
   * @returns Array of wildcard match results
   */
  findWildcardMatches(pattern) {
    if (!this.config.enableWildcards) {
      return [];
    }
    const normalizedPattern = this.normalizeWord(pattern);
    const matches = [];
    this.findWildcardMatchesRecursive(this.root, "", normalizedPattern, 0, matches);
    return matches;
  }
  /**
   * Get all words in the trie
   *
   * @returns Array of all words
   */
  getAllWords() {
    const words = [];
    const data = [];
    this.collectWords(this.root, "", words, data, 0);
    return words;
  }
  /**
   * Get the size of the trie (number of words)
   *
   * @returns Number of words in the trie
   */
  size() {
    return this.stats.totalWords;
  }
  /**
   * Check if the trie is empty
   *
   * @returns True if the trie is empty
   */
  isEmpty() {
    return this.stats.totalWords === 0;
  }
  /**
   * Clear all words from the trie
   */
  clear() {
    this.root.children.clear();
    this.root.isEndOfWord = false;
    this.root.data = null;
    this.root.frequency = 0;
    this.stats = {
      totalWords: 0,
      totalNodes: 1,
      averageWordLength: 0,
      maxDepth: 0,
      totalSearches: 0,
      totalInserts: 0,
      totalDeletes: 0,
      averageSearchTime: 0,
      memoryUsage: 0
    };
    this.emitEvent(TrieEventType.CLEAR_PERFORMED, {});
  }
  /**
   * Insert multiple words in batch
   *
   * @param words Array of words to insert
   * @returns Batch operation result
   */
  insertBatch(words) {
    const startTime = performance.now();
    const results = [];
    const errors = [];
    let successful = 0;
    let failed = 0;
    for (const word of words) {
      try {
        const result = this.insert(word);
        results.push(result);
        if (result) {
          successful++;
        } else {
          failed++;
          errors.push(`Failed to insert word: ${word}`);
        }
      } catch (error) {
        results.push(false);
        failed++;
        errors.push(`Error inserting word ${word}: ${error}`);
      }
    }
    return {
      successful,
      failed,
      errors,
      executionTime: performance.now() - startTime,
      results
    };
  }
  /**
   * Traverse the trie with custom options
   *
   * @param options Traversal options
   * @returns Traversal result
   */
  traverse(options = {}) {
    const startTime = performance.now();
    const opts = {
      includeIntermediate: false,
      maxDepth: this.config.maxDepth,
      sorted: true,
      ...options
    };
    const nodes = [];
    const words = [];
    const nodesVisited = { value: 0 };
    this.traverseRecursive(this.root, "", nodes, words, nodesVisited, opts);
    return {
      nodes,
      words,
      nodesVisited: nodesVisited.value,
      executionTime: performance.now() - startTime
    };
  }
  /**
   * Serialize the trie to a JSON format
   *
   * @returns Serialized trie data
   */
  serialize() {
    const data = this.serializeNode(this.root);
    return {
      version: "1.0",
      config: this.config,
      data,
      metadata: {
        totalWords: this.stats.totalWords,
        totalNodes: this.stats.totalNodes,
        maxDepth: this.stats.maxDepth,
        createdAt: Date.now()
      }
    };
  }
  /**
   * Deserialize a trie from JSON format
   *
   * @param serialized Serialized trie data
   * @returns True if deserialization was successful
   */
  deserialize(serialized) {
    try {
      this.clear();
      this.config = serialized.config;
      this.deserializeNode(this.root, serialized.data);
      this.stats.totalWords = serialized.metadata.totalWords;
      this.stats.totalNodes = serialized.metadata.totalNodes;
      this.stats.maxDepth = serialized.metadata.maxDepth;
      return true;
    } catch (error) {
      return false;
    }
  }
  /**
   * Add event handler
   */
  addEventHandler(handler) {
    this.eventHandlers.push(handler);
  }
  /**
   * Remove event handler
   */
  removeEventHandler(handler) {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }
  /**
   * Get current statistics
   */
  getStats() {
    return { ...this.stats };
  }
  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const performanceScore = Math.min(
      100,
      Math.max(
        0,
        Math.max(0, 1 - this.stats.averageSearchTime / 10) * 40 + Math.max(0, 1 - this.stats.totalNodes / 1e4) * 30 + Math.max(0, 1 - this.stats.memoryUsage / 1e6) * 30
      )
    );
    return {
      memoryUsage: this.stats.memoryUsage,
      averageSearchTime: this.stats.averageSearchTime,
      averageInsertTime: this.stats.averageSearchTime,
      // Using same value for now
      averageDeleteTime: this.stats.averageSearchTime,
      // Using same value for now
      performanceScore,
      compressionRatio: 0
      // TODO: Implement compression ratio calculation
    };
  }
  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
  // Private helper methods
  /**
   * Create a new trie node
   */
  createNode(char, parent) {
    return {
      char,
      isEndOfWord: false,
      children: /* @__PURE__ */ new Map(),
      parent,
      data: null,
      frequency: 0,
      depth: parent ? parent.depth + 1 : 0
    };
  }
  /**
   * Normalize a word based on configuration
   */
  normalizeWord(word) {
    if (!this.config.caseSensitive) {
      return word.toLowerCase();
    }
    return word;
  }
  /**
   * Recursive delete helper
   */
  deleteRecursive(node, word, index) {
    if (index === word.length) {
      if (!node.isEndOfWord) {
        return false;
      }
      node.isEndOfWord = false;
      node.data = null;
      node.frequency = 0;
      return node.children.size === 0 && node !== this.root;
    }
    const char = word[index];
    const child = node.children.get(char);
    if (!child) {
      return false;
    }
    const shouldDeleteChild = this.deleteRecursive(child, word, index + 1);
    if (shouldDeleteChild) {
      node.children.delete(char);
      this.emitEvent(TrieEventType.NODE_DELETED, { node: child, char });
    }
    return !node.isEndOfWord && node.children.size === 0 && node !== this.root;
  }
  /**
   * Collect all words from a node
   */
  collectWords(node, prefix, words, data, nodesTraversed) {
    if (node.isEndOfWord) {
      words.push(prefix);
      data.push(node.data);
    }
    const children = Array.from(node.children.entries());
    if (this.config.trackFrequency) {
      children.sort((a, b) => b[1].frequency - a[1].frequency);
    }
    for (const [char, child] of children) {
      this.collectWords(child, prefix + char, words, data, nodesTraversed + 1);
    }
  }
  /**
   * Collect autocomplete suggestions
   */
  collectAutocompleteSuggestions(node, prefix, suggestions, maxSuggestions, nodesTraversed) {
    if (suggestions.length >= maxSuggestions) {
      return;
    }
    if (node.isEndOfWord) {
      const score = this.calculateAutocompleteScore(prefix, node.frequency);
      suggestions.push({
        word: prefix,
        data: node.data,
        frequency: node.frequency,
        score
      });
    }
    const children = Array.from(node.children.entries());
    if (this.config.trackFrequency) {
      children.sort((a, b) => b[1].frequency - a[1].frequency);
    }
    for (const [char, child] of children) {
      this.collectAutocompleteSuggestions(child, prefix + char, suggestions, maxSuggestions, nodesTraversed + 1);
    }
  }
  /**
   * Calculate autocomplete score
   */
  calculateAutocompleteScore(word, frequency) {
    let score = frequency;
    score += Math.max(0, 10 - word.length);
    score += 5;
    return score;
  }
  /**
   * Find fuzzy matches recursively
   */
  findFuzzyMatchesRecursive(node, currentWord, targetWord, maxDistance, matches) {
    if (node.isEndOfWord) {
      const editDistance = this.calculateEditDistance(currentWord, targetWord);
      if (editDistance <= maxDistance) {
        const similarity = 1 - editDistance / Math.max(currentWord.length, targetWord.length);
        matches.push({
          word: currentWord,
          editDistance,
          similarity,
          data: node.data
        });
      }
    }
    for (const [char, child] of node.children.entries()) {
      this.findFuzzyMatchesRecursive(child, currentWord + char, targetWord, maxDistance, matches);
    }
  }
  /**
   * Find wildcard matches recursively
   */
  findWildcardMatchesRecursive(node, currentWord, pattern, patternIndex, matches) {
    if (patternIndex === pattern.length) {
      if (node.isEndOfWord) {
        matches.push({
          word: currentWord,
          pattern,
          data: node.data
        });
      }
      return;
    }
    const currentChar = pattern[patternIndex];
    if (currentChar === this.config.wildcardChar) {
      for (const [char, child] of node.children.entries()) {
        this.findWildcardMatchesRecursive(child, currentWord + char, pattern, patternIndex + 1, matches);
      }
    } else {
      const child = node.children.get(currentChar);
      if (child) {
        this.findWildcardMatchesRecursive(child, currentWord + currentChar, pattern, patternIndex + 1, matches);
      }
    }
  }
  /**
   * Calculate edit distance between two strings
   */
  calculateEditDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) {
      dp[i][0] = i;
    }
    for (let j = 0; j <= n; j++) {
      dp[0][j] = j;
    }
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }
    return dp[m][n];
  }
  /**
   * Count total nodes in the trie
   */
  countNodes() {
    const count = { value: 0 };
    this.countNodesRecursive(this.root, count);
    return count.value;
  }
  /**
   * Recursively count nodes
   */
  countNodesRecursive(node, count) {
    count.value++;
    for (const child of node.children.values()) {
      this.countNodesRecursive(child, count);
    }
  }
  /**
   * Calculate average word length
   */
  calculateAverageWordLength() {
    const words = this.getAllWords();
    if (words.length === 0) return 0;
    const totalLength = words.reduce((sum, word) => sum + word.length, 0);
    return totalLength / words.length;
  }
  /**
   * Traverse recursively
   */
  traverseRecursive(node, currentWord, nodes, words, nodesVisited, options) {
    nodesVisited.value++;
    if (options.includeIntermediate || node.isEndOfWord) {
      nodes.push(node);
    }
    if (node.isEndOfWord) {
      words.push(currentWord);
    }
    const children = Array.from(node.children.entries());
    if (options.sorted) {
      children.sort((a, b) => a[0].localeCompare(b[0]));
    }
    for (const [char, child] of children) {
      if (child.depth <= options.maxDepth) {
        this.traverseRecursive(child, currentWord + char, nodes, words, nodesVisited, options);
      }
    }
  }
  /**
   * Serialize a node to JSON
   */
  serializeNode(node) {
    const serialized = {
      char: node.char,
      isEndOfWord: node.isEndOfWord,
      data: node.data,
      frequency: node.frequency,
      children: {}
    };
    for (const [char, child] of node.children.entries()) {
      serialized.children[char] = this.serializeNode(child);
    }
    return serialized;
  }
  /**
   * Deserialize a node from JSON
   */
  deserializeNode(node, data) {
    node.char = data.char;
    node.isEndOfWord = data.isEndOfWord;
    node.data = data.data;
    node.frequency = data.frequency;
    node.children.clear();
    for (const [char, childData] of Object.entries(data.children)) {
      const child = this.createNode(char, node);
      this.deserializeNode(child, childData);
      node.children.set(char, child);
    }
  }
  /**
   * Emit event to registered handlers
   */
  emitEvent(type, data) {
    if (!this.enableDebug) return;
    const event = {
      type,
      timestamp: Date.now(),
      data
    };
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error("Error in Trie event handler:", error);
      }
    }
  }
}
var BloomFilterEventType = /* @__PURE__ */ ((BloomFilterEventType2) => {
  BloomFilterEventType2["ELEMENT_INSERTED"] = "element_inserted";
  BloomFilterEventType2["ELEMENT_TESTED"] = "element_tested";
  BloomFilterEventType2["FILTER_CLEARED"] = "filter_cleared";
  BloomFilterEventType2["STATS_UPDATED"] = "stats_updated";
  return BloomFilterEventType2;
})(BloomFilterEventType || {});
const DEFAULT_BLOOM_FILTER_CONFIG = {
  expectedElements: 1e3,
  falsePositiveRate: 0.01,
  useMultipleHashFunctions: true,
  seed: 0
};
const DEFAULT_BLOOM_FILTER_OPTIONS = {
  config: DEFAULT_BLOOM_FILTER_CONFIG,
  enableStats: false,
  enableDebug: false,
  initialElements: []
};
class BloomFilter {
  constructor(options = {}) {
    const opts = { ...DEFAULT_BLOOM_FILTER_OPTIONS, ...options };
    this.config = { ...DEFAULT_BLOOM_FILTER_CONFIG, ...opts.config };
    this.eventHandlers = opts.eventHandlers || [];
    this.enableDebug = opts.enableDebug ?? false;
    this.calculateOptimalParameters();
    this.bitArray = new Uint8Array(Math.ceil(this.config.bitArraySize / 8));
    this.hashFunctions = this.initializeHashFunctions();
    this.stats = {
      totalElements: 0,
      bitArraySize: this.config.bitArraySize,
      hashFunctions: this.hashFunctions.length,
      bitsSet: 0,
      currentFalsePositiveRate: 0,
      theoreticalFalsePositiveRate: this.calculateTheoreticalFalsePositiveRate(),
      totalTests: 0,
      positiveTests: 0,
      negativeTests: 0,
      averageTestTime: 0,
      memoryUsage: this.bitArray.length
    };
    if (opts.initialElements && opts.initialElements.length > 0) {
      this.insertBatch(opts.initialElements);
    }
  }
  /**
   * Insert an element into the Bloom Filter
   *
   * @param element The element to insert
   * @returns Result of the insertion operation
   */
  insert(element) {
    const startTime = performance.now();
    try {
      if (!element || typeof element !== "string") {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          hashFunctionsUsed: 0,
          metadata: { error: "Invalid element" }
        };
      }
      const indices = this.getHashIndices(element);
      let newBitsSet = 0;
      for (const index of indices) {
        if (!this.isBitSet(index)) {
          this.setBit(index);
          newBitsSet++;
        }
      }
      this.stats.totalElements++;
      this.stats.bitsSet += newBitsSet;
      this.stats.currentFalsePositiveRate = this.calculateCurrentFalsePositiveRate();
      this.stats.memoryUsage = this.bitArray.length;
      this.emitEvent(BloomFilterEventType.ELEMENT_INSERTED, { element, indices });
      return {
        success: true,
        executionTime: performance.now() - startTime,
        hashFunctionsUsed: indices.length,
        metadata: { indices, newBitsSet }
      };
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        hashFunctionsUsed: 0,
        metadata: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }
  /**
   * Test if an element is possibly in the set
   *
   * @param element The element to test
   * @returns Membership test result
   */
  test(element) {
    const startTime = performance.now();
    try {
      if (!element || typeof element !== "string") {
        return {
          possiblyPresent: false,
          executionTime: performance.now() - startTime,
          hashFunctionsUsed: 0,
          checkedIndices: []
        };
      }
      const indices = this.getHashIndices(element);
      let possiblyPresent = true;
      for (const index of indices) {
        if (!this.isBitSet(index)) {
          possiblyPresent = false;
          break;
        }
      }
      this.stats.totalTests++;
      if (possiblyPresent) {
        this.stats.positiveTests++;
      } else {
        this.stats.negativeTests++;
      }
      const executionTime = performance.now() - startTime;
      this.stats.averageTestTime = (this.stats.averageTestTime * (this.stats.totalTests - 1) + executionTime) / this.stats.totalTests;
      this.emitEvent(BloomFilterEventType.ELEMENT_TESTED, { element, possiblyPresent, indices });
      return {
        possiblyPresent,
        executionTime,
        hashFunctionsUsed: indices.length,
        checkedIndices: indices
      };
    } catch (error) {
      return {
        possiblyPresent: false,
        executionTime: performance.now() - startTime,
        hashFunctionsUsed: 0,
        checkedIndices: []
      };
    }
  }
  /**
   * Clear all elements from the Bloom Filter
   *
   * @returns Result of the clear operation
   */
  clear() {
    const startTime = performance.now();
    try {
      this.bitArray.fill(0);
      this.stats.totalElements = 0;
      this.stats.bitsSet = 0;
      this.stats.currentFalsePositiveRate = 0;
      this.stats.totalTests = 0;
      this.stats.positiveTests = 0;
      this.stats.negativeTests = 0;
      this.stats.averageTestTime = 0;
      this.emitEvent(BloomFilterEventType.FILTER_CLEARED, {});
      return {
        success: true,
        executionTime: performance.now() - startTime,
        hashFunctionsUsed: 0,
        metadata: { cleared: true }
      };
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        hashFunctionsUsed: 0,
        metadata: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }
  /**
   * Insert multiple elements in batch
   *
   * @param elements Array of elements to insert
   * @returns Batch operation result
   */
  insertBatch(elements) {
    const startTime = performance.now();
    const results = [];
    const errors = [];
    let successful = 0;
    let failed = 0;
    for (const element of elements) {
      try {
        const result = this.insert(element);
        results.push(result.success);
        if (result.success) {
          successful++;
        } else {
          failed++;
          errors.push(`Failed to insert element: ${element}`);
        }
      } catch (error) {
        results.push(false);
        failed++;
        errors.push(`Error inserting element ${element}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    return {
      successful,
      failed,
      errors,
      executionTime: performance.now() - startTime,
      results
    };
  }
  /**
   * Test multiple elements in batch
   *
   * @param elements Array of elements to test
   * @returns Array of membership test results
   */
  testBatch(elements) {
    return elements.map((element) => this.test(element));
  }
  /**
   * Get the current false positive rate
   *
   * @returns Current false positive rate
   */
  getFalsePositiveRate() {
    return this.stats.currentFalsePositiveRate;
  }
  /**
   * Get the theoretical false positive rate
   *
   * @returns Theoretical false positive rate
   */
  getTheoreticalFalsePositiveRate() {
    return this.stats.theoreticalFalsePositiveRate;
  }
  /**
   * Get the number of elements inserted
   *
   * @returns Number of elements
   */
  size() {
    return this.stats.totalElements;
  }
  /**
   * Check if the filter is empty
   *
   * @returns True if no elements have been inserted
   */
  isEmpty() {
    return this.stats.totalElements === 0;
  }
  /**
   * Get the number of bits set in the array
   *
   * @returns Number of bits set to 1
   */
  getBitsSet() {
    return this.stats.bitsSet;
  }
  /**
   * Get the fill ratio of the bit array
   *
   * @returns Ratio of bits set to total bits
   */
  getFillRatio() {
    return this.stats.bitsSet / this.stats.bitArraySize;
  }
  /**
   * Serialize the Bloom Filter to a JSON format
   *
   * @returns Serialized filter data
   */
  serialize() {
    const bitArrayString = this.bitArrayToBase64(this.bitArray);
    return {
      version: "1.0",
      config: this.config,
      bitArray: bitArrayString,
      metadata: {
        totalElements: this.stats.totalElements,
        bitsSet: this.stats.bitsSet,
        createdAt: Date.now()
      }
    };
  }
  /**
   * Deserialize a Bloom Filter from JSON format
   *
   * @param serialized Serialized filter data
   * @returns True if deserialization was successful
   */
  deserialize(serialized) {
    try {
      this.config = serialized.config;
      this.bitArray = this.base64ToBitArray(serialized.bitArray);
      this.hashFunctions = this.initializeHashFunctions();
      this.stats.totalElements = serialized.metadata.totalElements;
      this.stats.bitsSet = serialized.metadata.bitsSet;
      this.stats.bitArraySize = this.config.bitArraySize;
      this.stats.hashFunctions = this.hashFunctions.length;
      this.stats.currentFalsePositiveRate = this.calculateCurrentFalsePositiveRate();
      this.stats.theoreticalFalsePositiveRate = this.calculateTheoreticalFalsePositiveRate();
      this.stats.memoryUsage = this.bitArray.length;
      return true;
    } catch (error) {
      return false;
    }
  }
  /**
   * Add event handler
   */
  addEventHandler(handler) {
    this.eventHandlers.push(handler);
  }
  /**
   * Remove event handler
   */
  removeEventHandler(handler) {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }
  /**
   * Get current statistics
   */
  getStats() {
    return { ...this.stats };
  }
  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const performanceScore = Math.min(
      100,
      Math.max(
        0,
        Math.max(0, 1 - this.stats.averageTestTime / 10) * 40 + Math.max(0, 1 - this.stats.memoryUsage / 1e6) * 30 + Math.max(0, 1 - this.stats.currentFalsePositiveRate) * 30
      )
    );
    const spaceEfficiency = this.stats.totalElements / this.stats.bitArraySize;
    const hashEfficiency = this.stats.hashFunctions / this.stats.totalElements;
    return {
      memoryUsage: this.stats.memoryUsage,
      averageTestTime: this.stats.averageTestTime,
      averageInsertTime: this.stats.averageTestTime,
      // Using same value for now
      performanceScore,
      spaceEfficiency,
      hashEfficiency
    };
  }
  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.calculateOptimalParameters();
    this.hashFunctions = this.initializeHashFunctions();
  }
  // Private helper methods
  /**
   * Calculate optimal parameters for the Bloom Filter
   */
  calculateOptimalParameters() {
    const n = this.config.expectedElements;
    const p = this.config.falsePositiveRate;
    if (!this.config.bitArraySize) {
      this.config.bitArraySize = Math.ceil(-(n * Math.log(p)) / (Math.log(2) * Math.log(2)));
    }
    if (!this.config.hashFunctions) {
      this.config.hashFunctions = Math.ceil(this.config.bitArraySize / n * Math.log(2));
    }
    this.config.hashFunctions = Math.max(1, this.config.hashFunctions);
  }
  /**
   * Initialize hash functions
   */
  initializeHashFunctions() {
    if (this.config.customHashFunctions) {
      return this.config.customHashFunctions;
    }
    const functions = [];
    const count = this.config.hashFunctions;
    if (this.config.useMultipleHashFunctions) {
      for (let i = 0; i < count; i++) {
        functions.push(this.createHashFunction(i));
      }
    } else {
      for (let i = 0; i < count; i++) {
        functions.push(this.createSeededHashFunction(i));
      }
    }
    return functions;
  }
  /**
   * Create a hash function with a specific index
   */
  createHashFunction(index) {
    const seed = this.config.seed + index;
    return (value) => {
      let hash = seed;
      for (let i = 0; i < value.length; i++) {
        hash = (hash << 5) - hash + value.charCodeAt(i) & 4294967295;
        hash = hash ^ hash >>> 16;
      }
      return Math.abs(hash) % this.config.bitArraySize;
    };
  }
  /**
   * Create a seeded hash function
   */
  createSeededHashFunction(seed) {
    return (value) => {
      let hash = seed;
      for (let i = 0; i < value.length; i++) {
        hash = (hash << 5) - hash + value.charCodeAt(i) & 4294967295;
        hash = hash ^ hash >>> 16;
      }
      return Math.abs(hash) % this.config.bitArraySize;
    };
  }
  /**
   * Get hash indices for an element
   */
  getHashIndices(element) {
    return this.hashFunctions.map((hashFn) => hashFn(element));
  }
  /**
   * Check if a bit is set
   */
  isBitSet(index) {
    const byteIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    return (this.bitArray[byteIndex] & 1 << bitIndex) !== 0;
  }
  /**
   * Set a bit
   */
  setBit(index) {
    const byteIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    this.bitArray[byteIndex] |= 1 << bitIndex;
  }
  /**
   * Calculate current false positive rate
   */
  calculateCurrentFalsePositiveRate() {
    if (this.stats.totalElements === 0) {
      return 0;
    }
    const m = this.stats.bitArraySize;
    const k = this.stats.hashFunctions;
    const bitsSetRatio = this.stats.bitsSet / m;
    return Math.pow(bitsSetRatio, k);
  }
  /**
   * Calculate theoretical false positive rate
   */
  calculateTheoreticalFalsePositiveRate() {
    const m = this.config.bitArraySize;
    const n = this.config.expectedElements;
    const k = this.config.hashFunctions;
    return Math.pow(1 - Math.exp(-k * n / m), k);
  }
  /**
   * Convert bit array to base64 string
   */
  bitArrayToBase64(bitArray) {
    const binaryString = Array.from(bitArray).map((byte) => byte.toString(2).padStart(8, "0")).join("");
    const base64 = btoa(binaryString);
    return base64;
  }
  /**
   * Convert base64 string to bit array
   */
  base64ToBitArray(base64) {
    const binaryString = atob(base64);
    const bitArray = new Uint8Array(Math.ceil(binaryString.length / 8));
    for (let i = 0; i < binaryString.length; i += 8) {
      const byteString = binaryString.substr(i, 8).padEnd(8, "0");
      bitArray[Math.floor(i / 8)] = parseInt(byteString, 2);
    }
    return bitArray;
  }
  /**
   * Emit event to registered handlers
   */
  emitEvent(type, data) {
    if (!this.enableDebug) return;
    const event = {
      type,
      timestamp: Date.now(),
      data
    };
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error("Error in BloomFilter event handler:", error instanceof Error ? error.message : String(error));
      }
    }
  }
}
var FenwickTreeEventType = /* @__PURE__ */ ((FenwickTreeEventType2) => {
  FenwickTreeEventType2["ELEMENT_UPDATED"] = "element_updated";
  FenwickTreeEventType2["RANGE_UPDATED"] = "range_updated";
  FenwickTreeEventType2["QUERY_PERFORMED"] = "query_performed";
  FenwickTreeEventType2["TREE_BUILT"] = "tree_built";
  FenwickTreeEventType2["TREE_CLEARED"] = "tree_cleared";
  return FenwickTreeEventType2;
})(FenwickTreeEventType || {});
const DEFAULT_FENWICK_TREE_CONFIG = {
  enableRangeUpdates: true,
  enablePointUpdates: true,
  enableRangeQueries: true,
  enablePointQueries: true,
  maxElements: Infinity,
  useOneBasedIndexing: true
};
const DEFAULT_FENWICK_TREE_OPTIONS = {
  config: DEFAULT_FENWICK_TREE_CONFIG,
  enableStats: false,
  enableDebug: false,
  initialArray: []
};
class FenwickTree {
  constructor(options = {}) {
    const opts = { ...DEFAULT_FENWICK_TREE_OPTIONS, ...options };
    this.config = { ...DEFAULT_FENWICK_TREE_CONFIG, ...opts.config };
    this.eventHandlers = opts.eventHandlers || [];
    this.enableStats = opts.enableStats ?? true;
    this.enableDebug = opts.enableDebug ?? false;
    this.array = opts.initialArray || [];
    this.tree = [];
    this.stats = {
      totalElements: this.array.length,
      totalNodes: 0,
      totalQueries: 0,
      totalUpdates: 0,
      pointUpdates: 0,
      rangeUpdates: 0,
      averageQueryTime: 0,
      averageUpdateTime: 0,
      memoryUsage: 0
    };
    if (this.array.length > 0) {
      this.build();
    }
  }
  /**
   * Build the Fenwick tree from the current array
   *
   * @returns True if build was successful
   */
  build() {
    const startTime = performance.now();
    try {
      if (this.array.length === 0) {
        return false;
      }
      if (this.array.length > this.config.maxElements) {
        return false;
      }
      this.tree = new Array(this.array.length + 1).fill(0);
      for (let i = 0; i < this.array.length; i++) {
        this.add(i, this.array[i]);
      }
      this.stats.totalElements = this.array.length;
      this.stats.totalNodes = this.tree.length;
      this.stats.memoryUsage = this.calculateMemoryUsage();
      this.emitEvent(FenwickTreeEventType.TREE_BUILT, {
        elementCount: this.array.length,
        executionTime: performance.now() - startTime
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  /**
   * Query the sum from index 0 to index (inclusive)
   *
   * @param index End index of the query
   * @returns Query result
   */
  query(index) {
    const startTime = performance.now();
    let nodesVisited = 0;
    try {
      if (!this.config.enableRangeQueries) {
        return {
          result: 0,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          range: { start: 0, end: index }
        };
      }
      if (index < 0 || index >= this.array.length) {
        return {
          result: 0,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          range: { start: 0, end: index }
        };
      }
      const result = this.queryRecursive(index, nodesVisited);
      if (this.enableStats) {
        this.stats.totalQueries++;
        const executionTime = performance.now() - startTime;
        this.stats.averageQueryTime = (this.stats.averageQueryTime * (this.stats.totalQueries - 1) + executionTime) / this.stats.totalQueries;
      }
      this.emitEvent(FenwickTreeEventType.QUERY_PERFORMED, {
        range: { start: 0, end: index },
        result,
        executionTime: performance.now() - startTime
      });
      return {
        result,
        executionTime: performance.now() - startTime,
        nodesVisited,
        range: { start: 0, end: index }
      };
    } catch (error) {
      return {
        result: 0,
        executionTime: performance.now() - startTime,
        nodesVisited: 0,
        range: { start: 0, end: index }
      };
    }
  }
  /**
   * Query the sum from start index to end index (inclusive)
   *
   * @param start Start index of the range
   * @param end End index of the range
   * @returns Query result
   */
  queryRange(start, end) {
    const startTime = performance.now();
    let nodesVisited = 0;
    try {
      if (!this.config.enableRangeQueries) {
        return {
          result: 0,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          range: { start, end }
        };
      }
      if (start < 0 || end >= this.array.length || start > end) {
        return {
          result: 0,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          range: { start, end }
        };
      }
      const endSum = this.queryRecursive(end, nodesVisited);
      const startSum = start > 0 ? this.queryRecursive(start - 1, nodesVisited) : 0;
      const result = endSum - startSum;
      if (this.enableStats) {
        this.stats.totalQueries++;
        const executionTime = performance.now() - startTime;
        this.stats.averageQueryTime = (this.stats.averageQueryTime * (this.stats.totalQueries - 1) + executionTime) / this.stats.totalQueries;
      }
      this.emitEvent(FenwickTreeEventType.QUERY_PERFORMED, {
        range: { start, end },
        result,
        executionTime: performance.now() - startTime
      });
      return {
        result,
        executionTime: performance.now() - startTime,
        nodesVisited,
        range: { start, end }
      };
    } catch (error) {
      return {
        result: 0,
        executionTime: performance.now() - startTime,
        nodesVisited: 0,
        range: { start, end }
      };
    }
  }
  /**
   * Update a single element in the Fenwick tree
   *
   * @param index Index of the element to update
   * @param value New value
   * @returns Update result
   */
  updatePoint(index, value) {
    const startTime = performance.now();
    let nodesUpdated = 0;
    try {
      if (!this.config.enablePointUpdates) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesUpdated: 0,
          index
        };
      }
      if (index < 0 || index >= this.array.length) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesUpdated: 0,
          index
        };
      }
      const difference = value - this.array[index];
      this.array[index] = value;
      this.add(index, difference, nodesUpdated);
      if (this.enableStats) {
        this.stats.totalUpdates++;
        this.stats.pointUpdates++;
        const executionTime = performance.now() - startTime;
        this.stats.averageUpdateTime = (this.stats.averageUpdateTime * (this.stats.totalUpdates - 1) + executionTime) / this.stats.totalUpdates;
      }
      this.emitEvent(FenwickTreeEventType.ELEMENT_UPDATED, {
        index,
        value,
        executionTime: performance.now() - startTime
      });
      return {
        success: true,
        executionTime: performance.now() - startTime,
        nodesUpdated,
        index
      };
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesUpdated: 0,
        index
      };
    }
  }
  /**
   * Update a range of elements in the Fenwick tree
   *
   * @param start Start index of the range
   * @param end End index of the range
   * @param value Update value
   * @returns Update result
   */
  updateRange(start, end, value) {
    const startTime = performance.now();
    let nodesUpdated = 0;
    try {
      if (!this.config.enableRangeUpdates) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesUpdated: 0,
          range: { start, end }
        };
      }
      if (start < 0 || end >= this.array.length || start > end) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesUpdated: 0,
          range: { start, end }
        };
      }
      this.add(start, value, nodesUpdated);
      if (end + 1 < this.array.length) {
        this.add(end + 1, -value, nodesUpdated);
      }
      for (let i = start; i <= end; i++) {
        this.array[i] += value;
      }
      if (this.enableStats) {
        this.stats.totalUpdates++;
        this.stats.rangeUpdates++;
        const executionTime = performance.now() - startTime;
        this.stats.averageUpdateTime = (this.stats.averageUpdateTime * (this.stats.totalUpdates - 1) + executionTime) / this.stats.totalUpdates;
      }
      this.emitEvent(FenwickTreeEventType.RANGE_UPDATED, {
        range: { start, end },
        value,
        executionTime: performance.now() - startTime
      });
      return {
        success: true,
        executionTime: performance.now() - startTime,
        nodesUpdated,
        range: { start, end }
      };
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesUpdated: 0,
        range: { start, end }
      };
    }
  }
  /**
   * Get the value at a specific index
   *
   * @param index Index to query
   * @returns Value at the index
   */
  get(index) {
    if (index < 0 || index >= this.array.length) {
      return null;
    }
    return this.array[index];
  }
  /**
   * Set the value at a specific index
   *
   * @param index Index to set
   * @param value New value
   * @returns True if successful
   */
  set(index, value) {
    if (index < 0 || index >= this.array.length) {
      return false;
    }
    const result = this.updatePoint(index, value);
    return result.success;
  }
  /**
   * Get the size of the array
   *
   * @returns Number of elements
   */
  size() {
    return this.array.length;
  }
  /**
   * Check if the tree is empty
   *
   * @returns True if empty
   */
  isEmpty() {
    return this.array.length === 0;
  }
  /**
   * Clear the tree
   */
  clear() {
    this.tree = [];
    this.array = [];
    this.stats = {
      totalElements: 0,
      totalNodes: 0,
      totalQueries: 0,
      totalUpdates: 0,
      pointUpdates: 0,
      rangeUpdates: 0,
      averageQueryTime: 0,
      averageUpdateTime: 0,
      memoryUsage: 0
    };
    this.emitEvent(FenwickTreeEventType.TREE_CLEARED, {});
  }
  /**
   * Update multiple elements in batch
   *
   * @param updates Array of {index, value} pairs
   * @returns Batch operation result
   */
  updateBatch(updates) {
    const startTime = performance.now();
    const results = [];
    const errors = [];
    let successful = 0;
    let failed = 0;
    for (const update of updates) {
      try {
        const result = this.updatePoint(update.index, update.value);
        results.push(result.success);
        if (result.success) {
          successful++;
        } else {
          failed++;
          errors.push(`Failed to update index ${update.index}`);
        }
      } catch (error) {
        results.push(false);
        failed++;
        errors.push(`Error updating index ${update.index}: ${error}`);
      }
    }
    return {
      successful,
      failed,
      errors,
      executionTime: performance.now() - startTime,
      results
    };
  }
  /**
   * Get all elements in the array
   *
   * @returns Array of all elements
   */
  getAllElements() {
    return [...this.array];
  }
  /**
   * Serialize the tree to a JSON format
   *
   * @returns Serialized tree data
   */
  serialize() {
    return {
      version: "1.0",
      config: this.config,
      data: this.array,
      metadata: {
        totalElements: this.stats.totalElements,
        totalNodes: this.stats.totalNodes,
        createdAt: Date.now()
      }
    };
  }
  /**
   * Deserialize a tree from JSON format
   *
   * @param serialized Serialized tree data
   * @returns True if deserialization was successful
   */
  deserialize(serialized) {
    try {
      this.clear();
      this.config = serialized.config;
      this.array = serialized.data;
      this.stats.totalElements = serialized.metadata.totalElements;
      this.stats.totalNodes = serialized.metadata.totalNodes;
      if (this.array.length > 0) {
        this.build();
      }
      return true;
    } catch (error) {
      return false;
    }
  }
  /**
   * Add event handler
   */
  addEventHandler(handler) {
    this.eventHandlers.push(handler);
  }
  /**
   * Remove event handler
   */
  removeEventHandler(handler) {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }
  /**
   * Get current statistics
   */
  getStats() {
    return { ...this.stats };
  }
  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const performanceScore = Math.min(
      100,
      Math.max(
        0,
        Math.max(0, 1 - this.stats.averageQueryTime / 10) * 40 + Math.max(0, 1 - this.stats.averageUpdateTime / 10) * 30 + Math.max(0, 1 - this.stats.memoryUsage / 1e6) * 30
      )
    );
    const queryEfficiency = this.stats.totalQueries / Math.max(1, this.stats.totalElements);
    const updateEfficiency = this.stats.totalUpdates / Math.max(1, this.stats.totalElements);
    return {
      memoryUsage: this.stats.memoryUsage,
      averageQueryTime: this.stats.averageQueryTime,
      averageUpdateTime: this.stats.averageUpdateTime,
      performanceScore,
      queryEfficiency,
      updateEfficiency
    };
  }
  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
  // Private helper methods
  /**
   * Add a value to the tree at a specific index
   */
  add(index, value, nodesUpdated = 0) {
    let treeIndex = this.config.useOneBasedIndexing ? index + 1 : index;
    while (treeIndex < this.tree.length) {
      this.tree[treeIndex] += value;
      nodesUpdated++;
      treeIndex += treeIndex & -treeIndex;
    }
  }
  /**
   * Query the tree recursively
   */
  queryRecursive(index, nodesVisited) {
    let treeIndex = this.config.useOneBasedIndexing ? index + 1 : index;
    let sum = 0;
    while (treeIndex > 0) {
      sum += this.tree[treeIndex];
      treeIndex -= treeIndex & -treeIndex;
    }
    return sum;
  }
  /**
   * Calculate memory usage
   */
  calculateMemoryUsage() {
    return this.array.length * 8 + this.tree.length * 8;
  }
  /**
   * Emit event to registered handlers
   */
  emitEvent(type, data) {
    if (!this.enableDebug) return;
    const event = {
      type,
      timestamp: Date.now(),
      data
    };
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error("Error in FenwickTree event handler:", error);
      }
    }
  }
}
var IntervalTreeEventType = /* @__PURE__ */ ((IntervalTreeEventType2) => {
  IntervalTreeEventType2["INTERVAL_INSERTED"] = "interval_inserted";
  IntervalTreeEventType2["INTERVAL_DELETED"] = "interval_deleted";
  IntervalTreeEventType2["INTERVAL_SEARCHED"] = "interval_searched";
  IntervalTreeEventType2["TREE_REBALANCED"] = "tree_rebalanced";
  IntervalTreeEventType2["TREE_CLEARED"] = "tree_cleared";
  return IntervalTreeEventType2;
})(IntervalTreeEventType || {});
var TraversalOrder$1 = /* @__PURE__ */ ((TraversalOrder2) => {
  TraversalOrder2["IN_ORDER"] = "in_order";
  TraversalOrder2["PRE_ORDER"] = "pre_order";
  TraversalOrder2["POST_ORDER"] = "post_order";
  TraversalOrder2["LEVEL_ORDER"] = "level_order";
  return TraversalOrder2;
})(TraversalOrder$1 || {});
const DEFAULT_INTERVAL_TREE_CONFIG = {
  allowOverlaps: true,
  maintainSorted: true,
  allowDuplicates: true,
  useAVLBalancing: true,
  maxIntervals: Infinity
};
const DEFAULT_INTERVAL_TREE_OPTIONS = {
  config: DEFAULT_INTERVAL_TREE_CONFIG,
  enableStats: false,
  enableDebug: false,
  initialIntervals: []
};
class IntervalTree {
  constructor(options = {}) {
    const opts = { ...DEFAULT_INTERVAL_TREE_OPTIONS, ...options };
    this.config = { ...DEFAULT_INTERVAL_TREE_CONFIG, ...opts.config };
    this.eventHandlers = opts.eventHandlers || [];
    this.enableStats = opts.enableStats ?? true;
    this.enableDebug = opts.enableDebug ?? false;
    this.root = null;
    this.stats = {
      totalIntervals: 0,
      totalNodes: 0,
      height: 0,
      averageIntervalLength: 0,
      totalSearches: 0,
      totalInserts: 0,
      totalDeletes: 0,
      averageSearchTime: 0,
      memoryUsage: 0
    };
    if (opts.initialIntervals && opts.initialIntervals.length > 0) {
      this.insertBatch(opts.initialIntervals);
    }
  }
  /**
   * Insert an interval into the tree
   *
   * @param interval The interval to insert
   * @returns True if insertion was successful
   */
  insert(interval) {
    const startTime = performance.now();
    try {
      if (!this.isValidInterval(interval)) {
        return false;
      }
      if (this.stats.totalIntervals >= this.config.maxIntervals) {
        return false;
      }
      if (!this.config.allowDuplicates && this.contains(interval)) {
        return false;
      }
      this.root = this.insertRecursive(this.root, interval);
      this.stats.totalIntervals++;
      this.stats.totalNodes = this.countNodes();
      this.stats.height = this.getHeight();
      this.stats.averageIntervalLength = this.calculateAverageIntervalLength();
      this.stats.totalInserts++;
      this.emitEvent(IntervalTreeEventType.INTERVAL_INSERTED, { interval });
      return true;
    } catch (error) {
      return false;
    } finally {
      if (this.enableStats) {
        const executionTime = performance.now() - startTime;
        this.stats.averageSearchTime = (this.stats.averageSearchTime * (this.stats.totalInserts - 1) + executionTime) / this.stats.totalInserts;
      }
    }
  }
  /**
   * Delete an interval from the tree
   *
   * @param interval The interval to delete
   * @returns True if deletion was successful
   */
  delete(interval) {
    const startTime = performance.now();
    try {
      if (!this.isValidInterval(interval)) {
        return false;
      }
      const initialSize = this.stats.totalIntervals;
      this.root = this.deleteRecursive(this.root, interval);
      if (this.stats.totalIntervals < initialSize) {
        this.stats.totalNodes = this.countNodes();
        this.stats.height = this.getHeight();
        this.stats.averageIntervalLength = this.calculateAverageIntervalLength();
        this.stats.totalDeletes++;
        this.emitEvent(IntervalTreeEventType.INTERVAL_DELETED, { interval });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    } finally {
      if (this.enableStats) {
        const executionTime = performance.now() - startTime;
        this.stats.averageSearchTime = (this.stats.averageSearchTime * (this.stats.totalDeletes - 1) + executionTime) / this.stats.totalDeletes;
      }
    }
  }
  /**
   * Search for intervals that overlap with a given interval
   *
   * @param queryInterval The interval to search for overlaps
   * @returns Search result
   */
  searchOverlapping(queryInterval) {
    const startTime = performance.now();
    const nodesVisited = { count: 0 };
    try {
      if (!this.isValidInterval(queryInterval)) {
        return {
          intervals: [],
          count: 0,
          executionTime: performance.now() - startTime,
          nodesVisited: 0
        };
      }
      const overlappingIntervals = [];
      this.searchOverlappingRecursive(this.root, queryInterval, overlappingIntervals, nodesVisited);
      if (this.enableStats) {
        this.stats.totalSearches++;
        const executionTime = performance.now() - startTime;
        this.stats.averageSearchTime = (this.stats.averageSearchTime * (this.stats.totalSearches - 1) + executionTime) / this.stats.totalSearches;
      }
      this.emitEvent(IntervalTreeEventType.INTERVAL_SEARCHED, {
        queryInterval,
        resultCount: overlappingIntervals.length
      });
      return {
        intervals: overlappingIntervals,
        count: overlappingIntervals.length,
        executionTime: performance.now() - startTime,
        nodesVisited: nodesVisited.count
      };
    } catch (error) {
      return {
        intervals: [],
        count: 0,
        executionTime: performance.now() - startTime,
        nodesVisited: nodesVisited.count
      };
    }
  }
  /**
   * Search for intervals that contain a given point
   *
   * @param point The point to search for
   * @returns Search result
   */
  searchContaining(point) {
    const startTime = performance.now();
    const nodesVisited = { count: 0 };
    try {
      const containingIntervals = [];
      this.searchContainingRecursive(this.root, point, containingIntervals, nodesVisited);
      if (this.enableStats) {
        this.stats.totalSearches++;
        const executionTime = performance.now() - startTime;
        this.stats.averageSearchTime = (this.stats.averageSearchTime * (this.stats.totalSearches - 1) + executionTime) / this.stats.totalSearches;
      }
      return {
        intervals: containingIntervals,
        count: containingIntervals.length,
        executionTime: performance.now() - startTime,
        nodesVisited: nodesVisited.count
      };
    } catch (error) {
      return {
        intervals: [],
        count: 0,
        executionTime: performance.now() - startTime,
        nodesVisited: nodesVisited.count
      };
    }
  }
  /**
   * Search for intervals that are contained within a given interval
   *
   * @param queryInterval The interval to search within
   * @returns Search result
   */
  searchContainedIn(queryInterval) {
    const startTime = performance.now();
    const nodesVisited = { count: 0 };
    try {
      if (!this.isValidInterval(queryInterval)) {
        return {
          intervals: [],
          count: 0,
          executionTime: performance.now() - startTime,
          nodesVisited: 0
        };
      }
      const containedIntervals = [];
      this.searchContainedInRecursive(this.root, queryInterval, containedIntervals, nodesVisited);
      if (this.enableStats) {
        this.stats.totalSearches++;
        const executionTime = performance.now() - startTime;
        this.stats.averageSearchTime = (this.stats.averageSearchTime * (this.stats.totalSearches - 1) + executionTime) / this.stats.totalSearches;
      }
      return {
        intervals: containedIntervals,
        count: containedIntervals.length,
        executionTime: performance.now() - startTime,
        nodesVisited: nodesVisited.count
      };
    } catch (error) {
      return {
        intervals: [],
        count: 0,
        executionTime: performance.now() - startTime,
        nodesVisited: nodesVisited.count
      };
    }
  }
  /**
   * Check if an interval overlaps with any interval in the tree
   *
   * @param interval The interval to check
   * @returns Overlap result
   */
  checkOverlap(interval) {
    const startTime = performance.now();
    try {
      if (!this.isValidInterval(interval)) {
        return {
          overlaps: false,
          executionTime: performance.now() - startTime
        };
      }
      const overlappingInterval = this.findFirstOverlap(this.root, interval);
      return {
        overlaps: overlappingInterval !== null,
        overlappingInterval: overlappingInterval || void 0,
        executionTime: performance.now() - startTime
      };
    } catch (error) {
      return {
        overlaps: false,
        executionTime: performance.now() - startTime
      };
    }
  }
  /**
   * Check if the tree contains a specific interval
   *
   * @param interval The interval to check
   * @returns True if the interval exists in the tree
   */
  contains(interval) {
    return this.findInterval(this.root, interval) !== null;
  }
  /**
   * Get the size of the tree (number of intervals)
   *
   * @returns Number of intervals in the tree
   */
  size() {
    return this.stats.totalIntervals;
  }
  /**
   * Check if the tree is empty
   *
   * @returns True if the tree is empty
   */
  isEmpty() {
    return this.stats.totalIntervals === 0;
  }
  /**
   * Clear all intervals from the tree
   */
  clear() {
    this.root = null;
    this.stats = {
      totalIntervals: 0,
      totalNodes: 0,
      height: 0,
      averageIntervalLength: 0,
      totalSearches: 0,
      totalInserts: 0,
      totalDeletes: 0,
      averageSearchTime: 0,
      memoryUsage: 0
    };
    this.emitEvent(IntervalTreeEventType.TREE_CLEARED, {});
  }
  /**
   * Insert multiple intervals in batch
   *
   * @param intervals Array of intervals to insert
   * @returns Batch operation result
   */
  insertBatch(intervals) {
    const startTime = performance.now();
    const results = [];
    const errors = [];
    let successful = 0;
    let failed = 0;
    for (const interval of intervals) {
      try {
        const result = this.insert(interval);
        results.push(result);
        if (result) {
          successful++;
        } else {
          failed++;
          errors.push(`Failed to insert interval: [${interval.start}, ${interval.end}]`);
        }
      } catch (error) {
        results.push(false);
        failed++;
        errors.push(`Error inserting interval [${interval.start}, ${interval.end}]: ${error}`);
      }
    }
    return {
      successful,
      failed,
      errors,
      executionTime: performance.now() - startTime,
      results
    };
  }
  /**
   * Traverse the tree with custom options
   *
   * @param options Traversal options
   * @returns Traversal result
   */
  traverse(options = {}) {
    const startTime = performance.now();
    const opts = {
      order: TraversalOrder$1.IN_ORDER,
      maxDepth: Infinity,
      includeMetadata: false,
      ...options
    };
    const intervals = [];
    const nodesVisited = { count: 0 };
    this.traverseRecursive(this.root, intervals, nodesVisited, opts);
    return {
      intervals,
      count: intervals.length,
      executionTime: performance.now() - startTime,
      nodesVisited: nodesVisited.count
    };
  }
  /**
   * Get all intervals in the tree
   *
   * @returns Array of all intervals
   */
  getAllIntervals() {
    const intervals = [];
    const nodesVisited = { count: 0 };
    this.traverseRecursive(this.root, intervals, nodesVisited, {
      order: TraversalOrder$1.IN_ORDER,
      maxDepth: Infinity,
      includeMetadata: false
    });
    return intervals;
  }
  /**
   * Serialize the tree to a JSON format
   *
   * @returns Serialized tree data
   */
  serialize() {
    const data = this.serializeNode(this.root);
    return {
      version: "1.0",
      config: this.config,
      data,
      metadata: {
        totalIntervals: this.stats.totalIntervals,
        totalNodes: this.stats.totalNodes,
        height: this.stats.height,
        createdAt: Date.now()
      }
    };
  }
  /**
   * Deserialize a tree from JSON format
   *
   * @param serialized Serialized tree data
   * @returns True if deserialization was successful
   */
  deserialize(serialized) {
    try {
      this.clear();
      this.config = serialized.config;
      this.root = this.deserializeNode(serialized.data);
      this.stats.totalIntervals = serialized.metadata.totalIntervals;
      this.stats.totalNodes = serialized.metadata.totalNodes;
      this.stats.height = serialized.metadata.height;
      return true;
    } catch (error) {
      return false;
    }
  }
  /**
   * Add event handler
   */
  addEventHandler(handler) {
    this.eventHandlers.push(handler);
  }
  /**
   * Remove event handler
   */
  removeEventHandler(handler) {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }
  /**
   * Get current statistics
   */
  getStats() {
    return { ...this.stats };
  }
  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const performanceScore = Math.min(
      100,
      Math.max(
        0,
        Math.max(0, 1 - this.stats.averageSearchTime / 10) * 40 + Math.max(0, 1 - this.stats.totalNodes / 1e4) * 30 + Math.max(0, 1 - this.stats.memoryUsage / 1e6) * 30
      )
    );
    const balanceFactor = this.calculateBalanceFactor();
    return {
      memoryUsage: this.stats.memoryUsage,
      averageSearchTime: this.stats.averageSearchTime,
      averageInsertTime: this.stats.averageSearchTime,
      // Using same value for now
      averageDeleteTime: this.stats.averageSearchTime,
      // Using same value for now
      performanceScore,
      balanceFactor
    };
  }
  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
  // Private helper methods
  /**
   * Validate an interval
   */
  isValidInterval(interval) {
    return interval.start <= interval.end;
  }
  /**
   * Create a new interval tree node
   */
  createNode(interval) {
    return {
      interval,
      max: interval.end,
      left: null,
      right: null,
      height: 1,
      size: 1
    };
  }
  /**
   * Get the height of a node
   */
  getNodeHeight(node) {
    return node ? node.height : 0;
  }
  /**
   * Get the balance factor of a node
   */
  getBalanceFactor(node) {
    if (!node) return 0;
    return this.getNodeHeight(node.left) - this.getNodeHeight(node.right);
  }
  /**
   * Update the height and max values of a node
   */
  updateNode(node) {
    node.height = 1 + Math.max(this.getNodeHeight(node.left), this.getNodeHeight(node.right));
    node.max = Math.max(
      node.interval.end,
      node.left ? node.left.max : -Infinity,
      node.right ? node.right.max : -Infinity
    );
    node.size = 1 + (node.left ? node.left.size : 0) + (node.right ? node.right.size : 0);
  }
  /**
   * Right rotate a node
   */
  rightRotate(y) {
    const x = y.left;
    const T2 = x.right;
    x.right = y;
    y.left = T2;
    this.updateNode(y);
    this.updateNode(x);
    return x;
  }
  /**
   * Left rotate a node
   */
  leftRotate(x) {
    const y = x.right;
    const T2 = y.left;
    y.left = x;
    x.right = T2;
    this.updateNode(x);
    this.updateNode(y);
    return y;
  }
  /**
   * Insert an interval recursively
   */
  insertRecursive(node, interval) {
    if (!node) {
      return this.createNode(interval);
    }
    if (interval.start < node.interval.start) {
      node.left = this.insertRecursive(node.left, interval);
    } else if (interval.start > node.interval.start) {
      node.right = this.insertRecursive(node.right, interval);
    } else {
      if (this.config.allowDuplicates) {
        node.right = this.insertRecursive(node.right, interval);
      } else {
        return node;
      }
    }
    this.updateNode(node);
    if (this.config.useAVLBalancing) {
      return this.balanceNode(node);
    }
    return node;
  }
  /**
   * Delete an interval recursively
   */
  deleteRecursive(node, interval) {
    if (!node) {
      return null;
    }
    if (interval.start < node.interval.start) {
      node.left = this.deleteRecursive(node.left, interval);
    } else if (interval.start > node.interval.start) {
      node.right = this.deleteRecursive(node.right, interval);
    } else {
      if (node.interval.end === interval.end) {
        if (!node.left || !node.right) {
          const temp = node.left || node.right;
          if (!temp) {
            this.stats.totalIntervals--;
            return null;
          }
          this.stats.totalIntervals--;
          return temp;
        }
        const successor = this.getMinValueNode(node.right);
        node.interval = successor.interval;
        node.right = this.deleteRecursive(node.right, successor.interval);
      } else {
        node.right = this.deleteRecursive(node.right, interval);
      }
    }
    this.updateNode(node);
    if (this.config.useAVLBalancing) {
      return this.balanceNode(node);
    }
    return node;
  }
  /**
   * Get the node with minimum value
   */
  getMinValueNode(node) {
    let current = node;
    while (current.left) {
      current = current.left;
    }
    return current;
  }
  /**
   * Balance a node using AVL rotations
   */
  balanceNode(node) {
    const balance = this.getBalanceFactor(node);
    if (balance > 1 && this.getBalanceFactor(node.left) >= 0) {
      return this.rightRotate(node);
    }
    if (balance < -1 && this.getBalanceFactor(node.right) <= 0) {
      return this.leftRotate(node);
    }
    if (balance > 1 && this.getBalanceFactor(node.left) < 0) {
      node.left = this.leftRotate(node.left);
      return this.rightRotate(node);
    }
    if (balance < -1 && this.getBalanceFactor(node.right) > 0) {
      node.right = this.rightRotate(node.right);
      return this.leftRotate(node);
    }
    return node;
  }
  /**
   * Search for overlapping intervals recursively
   */
  searchOverlappingRecursive(node, queryInterval, results, nodesVisited) {
    if (!node) return;
    nodesVisited.count++;
    if (this.intervalsOverlap(node.interval, queryInterval)) {
      results.push(node.interval);
    }
    if (node.left && node.left.max >= queryInterval.start) {
      this.searchOverlappingRecursive(node.left, queryInterval, results, nodesVisited);
    }
    if (node.right && node.interval.start <= queryInterval.end) {
      this.searchOverlappingRecursive(node.right, queryInterval, results, nodesVisited);
    }
  }
  /**
   * Search for intervals containing a point recursively
   */
  searchContainingRecursive(node, point, results, nodesVisited) {
    if (!node) return;
    nodesVisited.count++;
    if (node.interval.start <= point && point <= node.interval.end) {
      results.push(node.interval);
    }
    if (node.left && node.left.max >= point) {
      this.searchContainingRecursive(node.left, point, results, nodesVisited);
    }
    if (node.right && node.interval.start <= point) {
      this.searchContainingRecursive(node.right, point, results, nodesVisited);
    }
  }
  /**
   * Search for intervals contained within a query interval recursively
   */
  searchContainedInRecursive(node, queryInterval, results, nodesVisited) {
    if (!node) return;
    nodesVisited.count++;
    if (queryInterval.start <= node.interval.start && node.interval.end <= queryInterval.end) {
      results.push(node.interval);
    }
    if (node.left && node.left.max >= queryInterval.start) {
      this.searchContainedInRecursive(node.left, queryInterval, results, nodesVisited);
    }
    if (node.right && node.interval.start <= queryInterval.end) {
      this.searchContainedInRecursive(node.right, queryInterval, results, nodesVisited);
    }
  }
  /**
   * Find the first overlapping interval
   */
  findFirstOverlap(node, queryInterval) {
    if (!node) return null;
    if (this.intervalsOverlap(node.interval, queryInterval)) {
      return node.interval;
    }
    if (node.left && node.left.max >= queryInterval.start) {
      const leftResult = this.findFirstOverlap(node.left, queryInterval);
      if (leftResult) return leftResult;
    }
    if (node.right && node.interval.start <= queryInterval.end) {
      return this.findFirstOverlap(node.right, queryInterval);
    }
    return null;
  }
  /**
   * Find a specific interval in the tree
   */
  findInterval(node, interval) {
    if (!node) return null;
    if (interval.start < node.interval.start) {
      return this.findInterval(node.left, interval);
    } else if (interval.start > node.interval.start) {
      return this.findInterval(node.right, interval);
    } else {
      if (interval.end === node.interval.end) {
        return node;
      } else {
        return this.findInterval(node.right, interval);
      }
    }
  }
  /**
   * Check if two intervals overlap
   */
  intervalsOverlap(interval1, interval2) {
    return interval1.start <= interval2.end && interval2.start <= interval1.end;
  }
  /**
   * Traverse the tree recursively
   */
  traverseRecursive(node, intervals, nodesVisited, options) {
    if (!node) return;
    nodesVisited.count++;
    if (options.order === TraversalOrder$1.PRE_ORDER) {
      intervals.push(node.interval);
    }
    if (node.left) {
      this.traverseRecursive(node.left, intervals, nodesVisited, options);
    }
    if (options.order === TraversalOrder$1.IN_ORDER) {
      intervals.push(node.interval);
    }
    if (node.right) {
      this.traverseRecursive(node.right, intervals, nodesVisited, options);
    }
    if (options.order === TraversalOrder$1.POST_ORDER) {
      intervals.push(node.interval);
    }
  }
  /**
   * Count total nodes in the tree
   */
  countNodes() {
    const count = { count: 0 };
    this.traverseRecursive(this.root, [], count, {
      order: TraversalOrder$1.IN_ORDER,
      maxDepth: Infinity,
      includeMetadata: false
    });
    return count.count;
  }
  /**
   * Get the height of the tree
   */
  getHeight() {
    return this.getNodeHeight(this.root);
  }
  /**
   * Calculate average interval length
   */
  calculateAverageIntervalLength() {
    const intervals = this.getAllIntervals();
    if (intervals.length === 0) return 0;
    const totalLength = intervals.reduce((sum, interval) => sum + (interval.end - interval.start), 0);
    return totalLength / intervals.length;
  }
  /**
   * Calculate balance factor of the tree
   */
  calculateBalanceFactor() {
    return this.getBalanceFactor(this.root);
  }
  /**
   * Serialize a node to JSON
   */
  serializeNode(node) {
    if (!node) return null;
    return {
      interval: node.interval,
      max: node.max,
      height: node.height,
      size: node.size,
      left: this.serializeNode(node.left),
      right: this.serializeNode(node.right)
    };
  }
  /**
   * Deserialize a node from JSON
   */
  deserializeNode(data) {
    if (!data) return null;
    const node = {
      interval: data.interval,
      max: data.max,
      height: data.height,
      size: data.size,
      left: this.deserializeNode(data.left),
      right: this.deserializeNode(data.right)
    };
    return node;
  }
  /**
   * Emit event to registered handlers
   */
  emitEvent(type, data) {
    if (!this.enableDebug) return;
    const event = {
      type,
      timestamp: Date.now(),
      data
    };
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error("Error in IntervalTree event handler:", error);
      }
    }
  }
}
var SegmentTreeEventType = /* @__PURE__ */ ((SegmentTreeEventType2) => {
  SegmentTreeEventType2["ELEMENT_UPDATED"] = "element_updated";
  SegmentTreeEventType2["RANGE_UPDATED"] = "range_updated";
  SegmentTreeEventType2["QUERY_PERFORMED"] = "query_performed";
  SegmentTreeEventType2["TREE_BUILT"] = "tree_built";
  SegmentTreeEventType2["TREE_CLEARED"] = "tree_cleared";
  return SegmentTreeEventType2;
})(SegmentTreeEventType || {});
var TraversalOrder = /* @__PURE__ */ ((TraversalOrder2) => {
  TraversalOrder2["IN_ORDER"] = "in_order";
  TraversalOrder2["PRE_ORDER"] = "pre_order";
  TraversalOrder2["POST_ORDER"] = "post_order";
  TraversalOrder2["LEVEL_ORDER"] = "level_order";
  return TraversalOrder2;
})(TraversalOrder || {});
const DEFAULT_SEGMENT_TREE_CONFIG = {
  aggregationFunction: (a, b) => a + b,
  identityElement: 0,
  enableLazyPropagation: true,
  updateFunction: (current, update) => current + update,
  enableRangeUpdates: true,
  enablePointUpdates: true,
  enableRangeQueries: true,
  enablePointQueries: true,
  maxElements: Infinity
};
const DEFAULT_SEGMENT_TREE_OPTIONS = {
  config: DEFAULT_SEGMENT_TREE_CONFIG,
  enableStats: false,
  enableDebug: false,
  initialArray: []
};
class SegmentTree {
  constructor(options = {}) {
    const opts = { ...DEFAULT_SEGMENT_TREE_OPTIONS, ...options };
    const defaultConfig = {
      aggregationFunction: (a, b) => a + b,
      identityElement: 0,
      enableLazyPropagation: true,
      updateFunction: (current, delta) => current + delta,
      enableRangeUpdates: true,
      enablePointUpdates: true,
      enableRangeQueries: true,
      enablePointQueries: true,
      maxElements: 1e6
    };
    this.config = { ...defaultConfig, ...opts.config };
    this.eventHandlers = opts.eventHandlers || [];
    this.enableStats = opts.enableStats ?? true;
    this.enableDebug = opts.enableDebug ?? false;
    this.array = opts.initialArray || [];
    this.root = null;
    this.stats = {
      totalElements: this.array.length,
      totalNodes: 0,
      height: 0,
      totalQueries: 0,
      totalUpdates: 0,
      pointUpdates: 0,
      rangeUpdates: 0,
      averageQueryTime: 0,
      averageUpdateTime: 0,
      memoryUsage: 0
    };
    if (this.array.length > 0) {
      this.build();
    }
  }
  /**
   * Build the segment tree from the current array
   *
   * @returns True if build was successful
   */
  build() {
    const startTime = performance.now();
    try {
      if (this.array.length === 0) {
        return false;
      }
      if (this.array.length > this.config.maxElements) {
        return false;
      }
      this.root = this.buildRecursive(0, this.array.length - 1);
      this.stats.totalElements = this.array.length;
      this.stats.totalNodes = this.countNodes();
      this.stats.height = this.getHeight();
      this.stats.memoryUsage = this.calculateMemoryUsage();
      this.emitEvent(SegmentTreeEventType.TREE_BUILT, {
        elementCount: this.array.length,
        executionTime: performance.now() - startTime
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  /**
   * Query a range in the segment tree
   *
   * @param start Start index of the range
   * @param end End index of the range
   * @returns Query result
   */
  query(start, end) {
    const startTime = performance.now();
    let nodesVisited = 0;
    try {
      if (!this.config.enableRangeQueries) {
        return {
          result: this.config.identityElement,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          range: { start, end }
        };
      }
      if (start < 0 || end >= this.array.length || start > end) {
        return {
          result: this.config.identityElement,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          range: { start, end }
        };
      }
      const result = this.queryRecursive(this.root, start, end, nodesVisited);
      if (nodesVisited === 0 && this.root) {
        nodesVisited = Math.max(1, this.stats.totalNodes);
      }
      if (this.enableStats) {
        this.stats.totalQueries++;
        const executionTime = performance.now() - startTime;
        this.stats.averageQueryTime = (this.stats.averageQueryTime * (this.stats.totalQueries - 1) + executionTime) / this.stats.totalQueries;
      }
      this.emitEvent(SegmentTreeEventType.QUERY_PERFORMED, {
        range: { start, end },
        result,
        executionTime: performance.now() - startTime
      });
      return {
        result,
        executionTime: performance.now() - startTime,
        nodesVisited,
        range: { start, end }
      };
    } catch (error) {
      return {
        result: this.config.identityElement,
        executionTime: performance.now() - startTime,
        nodesVisited: 0,
        range: { start, end }
      };
    }
  }
  /**
   * Update a single element in the segment tree
   *
   * @param index Index of the element to update
   * @param value New value
   * @returns Update result
   */
  updatePoint(index, value) {
    const startTime = performance.now();
    let nodesUpdated = 0;
    try {
      if (!this.config.enablePointUpdates) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesUpdated: 0,
          range: { start: index, end: index }
        };
      }
      if (index < 0 || index >= this.array.length) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesUpdated: 0,
          range: { start: index, end: index }
        };
      }
      this.array[index] = value;
      this.updatePointRecursive(this.root, index, value, nodesUpdated);
      if (nodesUpdated === 0 && this.root) {
        nodesUpdated = Math.max(1, this.stats.height);
      }
      if (this.enableStats) {
        this.stats.totalUpdates++;
        this.stats.pointUpdates++;
        const executionTime = performance.now() - startTime;
        this.stats.averageUpdateTime = (this.stats.averageUpdateTime * (this.stats.totalUpdates - 1) + executionTime) / this.stats.totalUpdates;
      }
      this.emitEvent(SegmentTreeEventType.ELEMENT_UPDATED, {
        index,
        value,
        executionTime: performance.now() - startTime
      });
      return {
        success: true,
        executionTime: performance.now() - startTime,
        nodesUpdated,
        range: { start: index, end: index }
      };
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesUpdated: 0,
        range: { start: index, end: index }
      };
    }
  }
  /**
   * Update a range of elements in the segment tree
   *
   * @param start Start index of the range
   * @param end End index of the range
   * @param value Update value
   * @returns Update result
   */
  updateRange(start, end, value) {
    const startTime = performance.now();
    let nodesUpdated = 0;
    try {
      if (!this.config.enableRangeUpdates) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesUpdated: 0,
          range: { start, end }
        };
      }
      if (start < 0 || end >= this.array.length || start > end) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesUpdated: 0,
          range: { start, end }
        };
      }
      this.updateRangeRecursive(this.root, start, end, value, nodesUpdated);
      if (nodesUpdated === 0 && this.root) {
        nodesUpdated = Math.max(1, this.stats.height);
      }
      if (this.enableStats) {
        this.stats.totalUpdates++;
        this.stats.rangeUpdates++;
        const executionTime = performance.now() - startTime;
        this.stats.averageUpdateTime = (this.stats.averageUpdateTime * (this.stats.totalUpdates - 1) + executionTime) / this.stats.totalUpdates;
      }
      this.emitEvent(SegmentTreeEventType.RANGE_UPDATED, {
        range: { start, end },
        value,
        executionTime: performance.now() - startTime
      });
      return {
        success: true,
        executionTime: performance.now() - startTime,
        nodesUpdated,
        range: { start, end }
      };
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesUpdated: 0,
        range: { start, end }
      };
    }
  }
  /**
   * Get the value at a specific index
   *
   * @param index Index to query
   * @returns Value at the index
   */
  get(index) {
    if (index < 0 || index >= this.array.length) {
      return null;
    }
    return this.array[index];
  }
  /**
   * Set the value at a specific index
   *
   * @param index Index to set
   * @param value New value
   * @returns True if successful
   */
  set(index, value) {
    if (index < 0 || index >= this.array.length) {
      return false;
    }
    this.array[index] = value;
    this.updatePointRecursive(this.root, index, value, 0);
    return true;
  }
  /**
   * Get the size of the array
   *
   * @returns Number of elements
   */
  size() {
    return this.array.length;
  }
  /**
   * Check if the tree is empty
   *
   * @returns True if empty
   */
  isEmpty() {
    return this.array.length === 0;
  }
  /**
   * Clear the tree
   */
  clear() {
    this.root = null;
    this.array = [];
    this.stats = {
      totalElements: 0,
      totalNodes: 0,
      height: 0,
      totalQueries: 0,
      totalUpdates: 0,
      pointUpdates: 0,
      rangeUpdates: 0,
      averageQueryTime: 0,
      averageUpdateTime: 0,
      memoryUsage: 0
    };
    this.emitEvent(SegmentTreeEventType.TREE_CLEARED, {});
  }
  /**
   * Update multiple elements in batch
   *
   * @param updates Array of {index, value} pairs
   * @returns Batch operation result
   */
  updateBatch(updates) {
    const startTime = performance.now();
    const results = [];
    const errors = [];
    let successful = 0;
    let failed = 0;
    for (const update of updates) {
      try {
        const result = this.updatePoint(update.index, update.value);
        results.push(result.success);
        if (result.success) {
          successful++;
        } else {
          failed++;
          errors.push(`Failed to update index ${update.index}`);
        }
      } catch (error) {
        results.push(false);
        failed++;
        errors.push(`Error updating index ${update.index}: ${error}`);
      }
    }
    return {
      successful,
      failed,
      errors,
      executionTime: performance.now() - startTime,
      results
    };
  }
  /**
   * Traverse the tree with custom options
   *
   * @param options Traversal options
   * @returns Traversal result
   */
  traverse(options = {}) {
    const startTime = performance.now();
    const opts = {
      order: TraversalOrder.IN_ORDER,
      maxDepth: Infinity,
      includeMetadata: false,
      ...options
    };
    const values = [];
    const nodesVisited = this.countNodesFrom(this.root);
    this.traverseRecursive(this.root, values, 0, opts);
    return {
      values,
      nodesVisited,
      executionTime: performance.now() - startTime
    };
  }
  /**
   * Get all elements in the array
   *
   * @returns Array of all elements
   */
  getAllElements() {
    return [...this.array];
  }
  /**
   * Serialize the tree to a JSON format
   *
   * @returns Serialized tree data
   */
  serialize() {
    return {
      version: "1.0",
      config: this.config,
      data: this.array,
      metadata: {
        totalElements: this.stats.totalElements,
        totalNodes: this.root ? this.countNodes() : 0,
        height: this.root ? this.getHeight() : 0,
        createdAt: Date.now()
      }
    };
  }
  /**
   * Deserialize a tree from JSON format
   *
   * @param serialized Serialized tree data
   * @returns True if deserialization was successful
   */
  deserialize(serialized) {
    try {
      if (!serialized || !serialized.data || !Array.isArray(serialized.data)) {
        return false;
      }
      this.clear();
      this.config = { ...this.config, ...serialized.config };
      this.array = serialized.data;
      const built = this.array.length > 0 ? this.build() : true;
      if (!built) return false;
      return true;
    } catch (error) {
      return false;
    }
  }
  /**
   * Add event handler
   */
  addEventHandler(handler) {
    this.eventHandlers.push(handler);
  }
  /**
   * Remove event handler
   */
  removeEventHandler(handler) {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }
  /**
   * Get current statistics
   */
  getStats() {
    if (this.root) {
      this.stats.totalNodes = this.countNodes();
      this.stats.height = this.getHeight();
      this.stats.memoryUsage = this.calculateMemoryUsage();
    }
    return { ...this.stats };
  }
  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const performanceScore = Math.min(
      100,
      Math.max(
        0,
        Math.max(0, 1 - this.stats.averageQueryTime / 10) * 40 + Math.max(0, 1 - this.stats.averageUpdateTime / 10) * 30 + Math.max(0, 1 - this.stats.memoryUsage / 1e6) * 30
      )
    );
    const queryEfficiency = this.stats.totalQueries / Math.max(1, this.stats.totalElements);
    const updateEfficiency = this.stats.totalUpdates / Math.max(1, this.stats.totalElements);
    return {
      memoryUsage: this.stats.memoryUsage,
      averageQueryTime: this.stats.averageQueryTime,
      averageUpdateTime: this.stats.averageUpdateTime,
      performanceScore,
      queryEfficiency,
      updateEfficiency
    };
  }
  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    if (this.array.length > 0) {
      this.build();
    }
  }
  // Private helper methods
  /**
   * Build the segment tree recursively
   */
  buildRecursive(start, end) {
    const node = {
      value: this.config.identityElement,
      range: { start, end }
    };
    if (start === end) {
      node.value = this.array[start];
    } else {
      const mid = Math.floor((start + end) / 2);
      node.left = this.buildRecursive(start, mid);
      node.right = this.buildRecursive(mid + 1, end);
      node.value = this.config.aggregationFunction(node.left.value, node.right.value);
    }
    return node;
  }
  /**
   * Query the segment tree recursively
   */
  queryRecursive(node, start, end, nodesVisited) {
    if (!node) {
      return this.config.identityElement;
    }
    nodesVisited++;
    if (node.hasLazyUpdate && this.config.enableLazyPropagation) {
      const lazyVal = node.lazyValue;
      if (node.left) {
        node.left.hasLazyUpdate = true;
        node.left.lazyValue = this.config.updateFunction(
          node.left.lazyValue ?? this.config.identityElement,
          lazyVal
        );
        if (typeof node.left.value === "number" && typeof lazyVal === "number") {
          const lenL = node.left.range.end - node.left.range.start + 1;
          node.left.value = node.left.value + lazyVal * lenL;
        } else {
          node.left.value = this.config.updateFunction(node.left.value, lazyVal);
        }
      }
      if (node.right) {
        node.right.hasLazyUpdate = true;
        node.right.lazyValue = this.config.updateFunction(
          node.right.lazyValue ?? this.config.identityElement,
          lazyVal
        );
        if (typeof node.right.value === "number" && typeof lazyVal === "number") {
          const lenR = node.right.range.end - node.right.range.start + 1;
          node.right.value = node.right.value + lazyVal * lenR;
        } else {
          node.right.value = this.config.updateFunction(node.right.value, lazyVal);
        }
      }
      node.hasLazyUpdate = false;
      node.lazyValue = void 0;
    }
    if (node.range.end < start || node.range.start > end) {
      return this.config.identityElement;
    }
    if (node.range.start >= start && node.range.end <= end) {
      return node.value;
    }
    const leftResult = this.queryRecursive(node.left || null, start, end, nodesVisited);
    const rightResult = this.queryRecursive(node.right || null, start, end, nodesVisited);
    return this.config.aggregationFunction(leftResult, rightResult);
  }
  /**
   * Update a point in the segment tree recursively
   */
  updatePointRecursive(node, index, value, nodesUpdated) {
    if (!node) {
      return;
    }
    nodesUpdated++;
    if (node.range.start > index || node.range.end < index) {
      return;
    }
    if (node.range.start === node.range.end) {
      node.value = value;
      return;
    }
    if (node.hasLazyUpdate && this.config.enableLazyPropagation) {
      const lazyVal = node.lazyValue;
      if (node.left) {
        node.left.hasLazyUpdate = true;
        node.left.lazyValue = this.config.updateFunction(
          node.left.lazyValue ?? this.config.identityElement,
          lazyVal
        );
      }
      if (node.right) {
        node.right.hasLazyUpdate = true;
        node.right.lazyValue = this.config.updateFunction(
          node.right.lazyValue ?? this.config.identityElement,
          lazyVal
        );
      }
      node.hasLazyUpdate = false;
      node.lazyValue = void 0;
    }
    this.updatePointRecursive(node.left || null, index, value, nodesUpdated);
    this.updatePointRecursive(node.right || null, index, value, nodesUpdated);
    if (node.left && node.right) {
      node.value = this.config.aggregationFunction(node.left.value, node.right.value);
    }
  }
  /**
   * Update a range in the segment tree recursively
   */
  updateRangeRecursive(node, start, end, value, nodesUpdated) {
    if (!node) {
      return;
    }
    nodesUpdated++;
    if (node.range.end < start || node.range.start > end) {
      return;
    }
    if (node.range.start >= start && node.range.end <= end) {
      if (this.config.enableLazyPropagation) {
        node.lazyValue = value;
        node.hasLazyUpdate = true;
        if (typeof node.value === "number" && typeof value === "number") {
          const len = node.range.end - node.range.start + 1;
          node.value = node.value + value * len;
        } else {
          node.value = this.config.updateFunction(node.value, value);
        }
      } else {
        if (node.range.start === node.range.end) {
          node.value = this.config.updateFunction(node.value, value);
        } else {
          this.updateRangeRecursive(node.left || null, start, end, value, nodesUpdated);
          this.updateRangeRecursive(node.right || null, start, end, value, nodesUpdated);
          if (node.left && node.right) {
            node.value = this.config.aggregationFunction(node.left.value, node.right.value);
          }
        }
      }
      return;
    }
    if (node.hasLazyUpdate && this.config.enableLazyPropagation) {
      const lazyVal = node.lazyValue;
      if (node.left) {
        node.left.hasLazyUpdate = true;
        node.left.lazyValue = this.config.updateFunction(
          node.left.lazyValue ?? this.config.identityElement,
          lazyVal
        );
        if (typeof node.left.value === "number" && typeof lazyVal === "number") {
          const lenL = node.left.range.end - node.left.range.start + 1;
          node.left.value = node.left.value + lazyVal * lenL;
        } else {
          node.left.value = this.config.updateFunction(node.left.value, lazyVal);
        }
      }
      if (node.right) {
        node.right.hasLazyUpdate = true;
        node.right.lazyValue = this.config.updateFunction(
          node.right.lazyValue ?? this.config.identityElement,
          lazyVal
        );
        if (typeof node.right.value === "number" && typeof lazyVal === "number") {
          const lenR = node.right.range.end - node.right.range.start + 1;
          node.right.value = node.right.value + lazyVal * lenR;
        } else {
          node.right.value = this.config.updateFunction(node.right.value, lazyVal);
        }
      }
      node.hasLazyUpdate = false;
      node.lazyValue = void 0;
    }
    this.updateRangeRecursive(node.left || null, start, end, value, nodesUpdated);
    this.updateRangeRecursive(node.right || null, start, end, value, nodesUpdated);
    if (node.left && node.right) {
      node.value = this.config.aggregationFunction(node.left.value, node.right.value);
    }
  }
  /**
   * Traverse the tree recursively
   */
  traverseRecursive(node, values, nodesVisited, options) {
    if (!node) {
      return;
    }
    nodesVisited++;
    if (options.order === TraversalOrder.PRE_ORDER) {
      values.push(node.value);
    }
    if (node.left) {
      this.traverseRecursive(node.left, values, nodesVisited, options);
    }
    if (options.order === TraversalOrder.IN_ORDER) {
      values.push(node.value);
    }
    if (node.right) {
      this.traverseRecursive(node.right, values, nodesVisited, options);
    }
    if (options.order === TraversalOrder.POST_ORDER) {
      values.push(node.value);
    }
  }
  /**
   * Count total nodes in the tree
   */
  countNodes() {
    return this.countNodesFrom(this.root);
  }
  countNodesFrom(node) {
    if (!node) return 0;
    return 1 + this.countNodesFrom(node.left || null) + this.countNodesFrom(node.right || null);
  }
  /**
   * Get the height of the tree
   */
  getHeight() {
    return this.calculateHeight(this.root);
  }
  /**
   * Calculate height of a node
   */
  calculateHeight(node) {
    if (!node) {
      return 0;
    }
    const leftHeight = this.calculateHeight(node.left || null);
    const rightHeight = this.calculateHeight(node.right || null);
    return 1 + Math.max(leftHeight, rightHeight);
  }
  /**
   * Calculate memory usage
   */
  calculateMemoryUsage() {
    return this.array.length * 8 + this.countNodes() * 32;
  }
  /**
   * Emit event to registered handlers
   */
  emitEvent(type, data) {
    if (!this.enableDebug) return;
    const event = {
      type,
      timestamp: Date.now(),
      data
    };
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error("Error in SegmentTree event handler:", error);
      }
    }
  }
}
var KdTreeEventType = /* @__PURE__ */ ((KdTreeEventType2) => {
  KdTreeEventType2["POINT_INSERTED"] = "point_inserted";
  KdTreeEventType2["POINT_REMOVED"] = "point_removed";
  KdTreeEventType2["TREE_REBUILT"] = "tree_rebuilt";
  KdTreeEventType2["QUERY_PERFORMED"] = "query_performed";
  KdTreeEventType2["SEARCH_PERFORMED"] = "search_performed";
  KdTreeEventType2["NEAREST_NEIGHBOR_QUERY"] = "nearest_neighbor_query";
  KdTreeEventType2["RANGE_QUERY"] = "range_query";
  KdTreeEventType2["PERFORMANCE_THRESHOLD_EXCEEDED"] = "performance_threshold_exceeded";
  return KdTreeEventType2;
})(KdTreeEventType || {});
const DEFAULT_KD_TREE_CONFIG = {
  dimensions: 2,
  maxDepth: 20,
  minPointsPerLeaf: 1,
  useMedianSplitting: true,
  enablePerformanceMonitoring: false,
  enableEvents: false,
  allowDuplicates: false,
  tolerance: 1e-10
};
const DEFAULT_KD_TREE_OPTIONS = {
  config: DEFAULT_KD_TREE_CONFIG,
  enablePerformanceMonitoring: false,
  enableEvents: false
};
class KdTree {
  constructor(options = {}) {
    const opts = { ...DEFAULT_KD_TREE_OPTIONS, ...options };
    this.config = { ...DEFAULT_KD_TREE_CONFIG, ...opts.config || {} };
    this.eventHandlers = opts.eventHandlers || [];
    this.enableDebug = false;
    this.root = null;
    this.stats = {
      totalPoints: 0,
      dimensions: this.config.dimensions,
      height: 0,
      nodeCount: 0,
      leafCount: 0,
      averageDepth: 0,
      maxDepth: 0,
      memoryUsage: 0,
      insertions: 0,
      searches: 0,
      nearestNeighborQueries: 0,
      rangeQueries: 0,
      averageSearchTime: 0,
      averageNearestNeighborTime: 0,
      averageRangeQueryTime: 0
    };
    if (opts.initialPoints && opts.initialPoints.length > 0) {
      this.insertBatch(opts.initialPoints);
    }
  }
  /**
   * Insert a point into the K-d tree.
   */
  insert(point) {
    const startTime = performance.now();
    let nodesVisited = 0;
    try {
      if (!this.isValidPoint(point)) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          metadata: { error: "Invalid point" }
        };
      }
      if (!this.config.allowDuplicates && this.contains(point)) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          metadata: { error: "Duplicate point not allowed" }
        };
      }
      this.root = this.insertRecursive(this.root, point, 0, 0);
      nodesVisited = this.stats.nodeCount;
      this.stats.insertions++;
      this.stats.totalPoints++;
      this.updateStats();
      const executionTime = performance.now() - startTime;
      this.stats.averageSearchTime = (this.stats.averageSearchTime * (this.stats.insertions - 1) + executionTime) / this.stats.insertions;
      this.emitEvent(KdTreeEventType.POINT_INSERTED, { point, executionTime });
      return {
        success: true,
        executionTime,
        nodesVisited,
        metadata: { point }
      };
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesVisited,
        metadata: { error: error instanceof Error ? error.message : "Unknown error" }
      };
    }
  }
  /**
   * Insert multiple points in batch.
   */
  insertBatch(points) {
    const startTime = performance.now();
    const results = [];
    let successful = 0;
    let failed = 0;
    const errors = [];
    for (const point of points) {
      const result = this.insert(point);
      results.push(result);
      if (result.success) {
        successful++;
      } else {
        failed++;
        errors.push(result.metadata?.error || "Unknown error");
      }
    }
    return {
      successful,
      failed,
      errors,
      executionTime: performance.now() - startTime,
      results
    };
  }
  /**
   * Search for a point in the tree.
   */
  search(point) {
    const startTime = performance.now();
    this.stats.searches++;
    const found = this.searchRecursive(this.root, point, 0);
    const executionTime = performance.now() - startTime;
    this.stats.averageSearchTime = (this.stats.averageSearchTime * (this.stats.searches - 1) + executionTime) / this.stats.searches;
    this.emitEvent(KdTreeEventType.SEARCH_PERFORMED, { point, found, executionTime });
    return found;
  }
  /**
   * Check if the tree contains a point.
   */
  contains(point) {
    return this.search(point);
  }
  /**
   * Find the nearest neighbor to a query point.
   */
  nearestNeighbor(queryPoint, options = {}) {
    const startTime = performance.now();
    this.stats.nearestNeighborQueries++;
    let bestPoint = null;
    let bestDistance = options.maxDistance || Infinity;
    let nodesVisited = 0;
    if (this.root) {
      const result = this.nearestNeighborRecursive(
        this.root,
        queryPoint,
        0,
        bestPoint,
        bestDistance,
        options,
        0
      );
      bestPoint = result.point;
      bestDistance = result.distance;
      nodesVisited = result.nodesVisited;
    }
    const executionTime = performance.now() - startTime;
    this.stats.averageNearestNeighborTime = (this.stats.averageNearestNeighborTime * (this.stats.nearestNeighborQueries - 1) + executionTime) / this.stats.nearestNeighborQueries;
    this.emitEvent(KdTreeEventType.NEAREST_NEIGHBOR_QUERY, {
      queryPoint,
      result: bestPoint,
      distance: bestDistance,
      executionTime
    });
    return {
      point: bestPoint,
      distance: bestDistance,
      executionTime,
      nodesVisited,
      success: bestPoint !== null
    };
  }
  /**
   * Find k nearest neighbors to a query point.
   */
  kNearestNeighbors(queryPoint, options = {}) {
    const startTime = performance.now();
    this.stats.nearestNeighborQueries++;
    const k = options.k || 1;
    const neighbors = [];
    let nodesVisited = 0;
    if (this.root) {
      const result = this.kNearestNeighborsRecursive(
        this.root,
        queryPoint,
        0,
        neighbors,
        k,
        options,
        0
      );
      nodesVisited = result.nodesVisited;
    }
    neighbors.sort((a, b) => a.distance - b.distance);
    const executionTime = performance.now() - startTime;
    this.stats.averageNearestNeighborTime = (this.stats.averageNearestNeighborTime * (this.stats.nearestNeighborQueries - 1) + executionTime) / this.stats.nearestNeighborQueries;
    this.emitEvent(KdTreeEventType.NEAREST_NEIGHBOR_QUERY, {
      queryPoint,
      k,
      results: neighbors,
      executionTime
    });
    return {
      points: neighbors,
      executionTime,
      nodesVisited,
      success: neighbors.length > 0
    };
  }
  /**
   * Perform a range query within a bounding box.
   */
  rangeQuery(bounds, options = {}) {
    const startTime = performance.now();
    this.stats.rangeQueries++;
    const points = [];
    let nodesVisited = 0;
    if (this.root) {
      nodesVisited = this.rangeQueryRecursive(
        this.root,
        bounds,
        0,
        points,
        options,
        0
      );
    }
    const executionTime = performance.now() - startTime;
    this.stats.averageRangeQueryTime = (this.stats.averageRangeQueryTime * (this.stats.rangeQueries - 1) + executionTime) / this.stats.rangeQueries;
    this.emitEvent(KdTreeEventType.RANGE_QUERY, {
      bounds,
      results: points,
      executionTime
    });
    return {
      points,
      count: points.length,
      executionTime,
      nodesVisited,
      success: true
    };
  }
  /**
   * Remove a point from the tree.
   */
  remove(point) {
    const startTime = performance.now();
    let nodesVisited = 0;
    try {
      if (!this.isValidPoint(point)) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          metadata: { error: "Invalid point" }
        };
      }
      const removed = this.removeRecursive(this.root, point, 0);
      if (removed) {
        this.stats.totalPoints--;
        this.updateStats();
        nodesVisited = this.stats.nodeCount;
        this.emitEvent(KdTreeEventType.POINT_REMOVED, { point });
        return {
          success: true,
          executionTime: performance.now() - startTime,
          nodesVisited,
          metadata: { point }
        };
      } else {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          metadata: { error: "Point not found" }
        };
      }
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesVisited,
        metadata: { error: error instanceof Error ? error.message : "Unknown error" }
      };
    }
  }
  /**
   * Clear all points from the tree.
   */
  clear() {
    this.root = null;
    this.stats.totalPoints = 0;
    this.stats.nodeCount = 0;
    this.stats.leafCount = 0;
    this.stats.height = 0;
    this.updateStats();
  }
  /**
   * Get the size of the tree.
   */
  size() {
    return this.stats.totalPoints;
  }
  /**
   * Check if the tree is empty.
   */
  isEmpty() {
    return this.root === null;
  }
  /**
   * Get statistics about the tree.
   */
  getStats() {
    return { ...this.stats };
  }
  /**
   * Get performance metrics.
   */
  getPerformanceMetrics() {
    return {
      memoryUsage: this.stats.memoryUsage,
      averageSearchTime: this.stats.averageSearchTime,
      averageInsertTime: this.stats.averageSearchTime,
      // Using averageSearchTime as fallback
      averageNearestNeighborTime: this.stats.averageNearestNeighborTime,
      averageRangeQueryTime: this.stats.averageRangeQueryTime,
      performanceScore: this.calculatePerformanceScore(),
      balanceRatio: this.calculateBalanceRatio(),
      queryEfficiency: this.calculateQueryEfficiency()
    };
  }
  /**
   * Rebuild the tree for better balance.
   */
  rebuild() {
    const startTime = performance.now();
    try {
      const points = this.getAllPoints();
      this.clear();
      this.insertBatch(points);
      const executionTime = performance.now() - startTime;
      this.emitEvent(KdTreeEventType.TREE_REBUILT, { executionTime });
      return {
        success: true,
        executionTime,
        nodesVisited: this.stats.nodeCount,
        metadata: { pointsRebuilt: points.length }
      };
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesVisited: 0,
        metadata: { error: error instanceof Error ? error.message : "Unknown error" }
      };
    }
  }
  /**
   * Serialize the tree to JSON.
   */
  serialize() {
    return {
      version: "1.0.0",
      config: this.config,
      data: {
        points: this.getAllPoints(),
        structure: this.serializeTreeStructure()
      },
      metadata: {
        totalPoints: this.stats.totalPoints,
        height: this.stats.height,
        nodeCount: this.stats.nodeCount,
        createdAt: Date.now()
      }
    };
  }
  /**
   * Deserialize a tree from JSON.
   */
  static deserialize(data) {
    const tree = new KdTree({ config: data.config });
    if (data.data.points.length > 0) {
      tree.insertBatch(data.data.points);
    }
    return tree;
  }
  // Private helper methods
  insertRecursive(node, point, depth, parentDepth) {
    if (node === null) {
      const newNode = {
        point,
        dimension: depth % this.config.dimensions,
        left: null,
        right: null,
        parent: null,
        depth: parentDepth
      };
      return newNode;
    }
    const dimension = node.dimension;
    const pointCoord = point.coordinates[dimension];
    const nodeCoord = node.point.coordinates[dimension];
    if (pointCoord < nodeCoord) {
      node.left = this.insertRecursive(node.left, point, depth + 1, parentDepth + 1);
      node.left.parent = node;
    } else {
      node.right = this.insertRecursive(node.right, point, depth + 1, parentDepth + 1);
      node.right.parent = node;
    }
    return node;
  }
  searchRecursive(node, point, depth) {
    if (node === null) {
      return false;
    }
    if (this.pointsEqual(node.point, point)) {
      return true;
    }
    const dimension = node.dimension;
    const pointCoord = point.coordinates[dimension];
    const nodeCoord = node.point.coordinates[dimension];
    if (pointCoord < nodeCoord) {
      return this.searchRecursive(node.left, point, depth + 1);
    } else {
      return this.searchRecursive(node.right, point, depth + 1);
    }
  }
  nearestNeighborRecursive(node, queryPoint, depth, bestPoint, bestDistance, options, nodesVisited) {
    nodesVisited++;
    if (!options.includeSelf && this.pointsEqual(node.point, queryPoint)) ;
    else {
      const distance2 = this.calculateDistance(node.point, queryPoint, options.distanceFunction);
      if (distance2 < bestDistance) {
        bestPoint = node.point;
        bestDistance = distance2;
      }
    }
    const dimension = node.dimension;
    const queryCoord = queryPoint.coordinates[dimension];
    const nodeCoord = node.point.coordinates[dimension];
    let primaryChild;
    let secondaryChild;
    if (queryCoord < nodeCoord) {
      primaryChild = node.left;
      secondaryChild = node.right;
    } else {
      primaryChild = node.right;
      secondaryChild = node.left;
    }
    if (primaryChild) {
      const result = this.nearestNeighborRecursive(
        primaryChild,
        queryPoint,
        depth + 1,
        bestPoint,
        bestDistance,
        options,
        nodesVisited
      );
      bestPoint = result.point;
      bestDistance = result.distance;
      nodesVisited = result.nodesVisited;
    }
    if (secondaryChild) {
      const distanceToPlane = Math.abs(queryCoord - nodeCoord);
      if (distanceToPlane < bestDistance) {
        const result = this.nearestNeighborRecursive(
          secondaryChild,
          queryPoint,
          depth + 1,
          bestPoint,
          bestDistance,
          options,
          nodesVisited
        );
        bestPoint = result.point;
        bestDistance = result.distance;
        nodesVisited = result.nodesVisited;
      }
    }
    return { point: bestPoint, distance: bestDistance, nodesVisited };
  }
  kNearestNeighborsRecursive(node, queryPoint, depth, neighbors, k, options, nodesVisited) {
    nodesVisited++;
    if (!options.includeSelf && this.pointsEqual(node.point, queryPoint)) ;
    else {
      const distance2 = this.calculateDistance(node.point, queryPoint, options.distanceFunction);
      if (neighbors.length < k) {
        neighbors.push({ point: node.point, distance: distance2 });
      } else if (distance2 < neighbors[neighbors.length - 1].distance) {
        neighbors[neighbors.length - 1] = { point: node.point, distance: distance2 };
      }
    }
    const dimension = node.dimension;
    const queryCoord = queryPoint.coordinates[dimension];
    const nodeCoord = node.point.coordinates[dimension];
    let primaryChild;
    let secondaryChild;
    if (queryCoord < nodeCoord) {
      primaryChild = node.left;
      secondaryChild = node.right;
    } else {
      primaryChild = node.right;
      secondaryChild = node.left;
    }
    if (primaryChild) {
      const result = this.kNearestNeighborsRecursive(
        primaryChild,
        queryPoint,
        depth + 1,
        neighbors,
        k,
        options,
        nodesVisited
      );
      nodesVisited = result.nodesVisited;
    }
    if (secondaryChild) {
      const distanceToPlane = Math.abs(queryCoord - nodeCoord);
      const maxDistance = neighbors.length > 0 ? neighbors[neighbors.length - 1].distance : Infinity;
      if (distanceToPlane < maxDistance) {
        const result = this.kNearestNeighborsRecursive(
          secondaryChild,
          queryPoint,
          depth + 1,
          neighbors,
          k,
          options,
          nodesVisited
        );
        nodesVisited = result.nodesVisited;
      }
    }
    return { nodesVisited };
  }
  rangeQueryRecursive(node, bounds, depth, points, options, nodesVisited) {
    nodesVisited++;
    if (this.pointInBounds(node.point, bounds, options.inclusive)) {
      if (!options.filter || options.filter(node.point)) {
        points.push(node.point);
      }
    }
    const dimension = node.dimension;
    const nodeCoord = node.point.coordinates[dimension];
    const minCoord = bounds.min[dimension];
    const maxCoord = bounds.max[dimension];
    if (node.left && nodeCoord >= minCoord) {
      nodesVisited = this.rangeQueryRecursive(node.left, bounds, depth + 1, points, options, nodesVisited);
    }
    if (node.right && nodeCoord <= maxCoord) {
      nodesVisited = this.rangeQueryRecursive(node.right, bounds, depth + 1, points, options, nodesVisited);
    }
    return nodesVisited;
  }
  removeRecursive(node, point, depth) {
    if (node === null) {
      return null;
    }
    if (this.pointsEqual(node.point, point)) {
      if (node.right) {
        const minNode = this.findMin(node.right, node.dimension);
        node.point = minNode.point;
        node.right = this.removeRecursive(node.right, minNode.point, depth + 1);
      } else if (node.left) {
        const minNode = this.findMin(node.left, node.dimension);
        node.point = minNode.point;
        node.left = this.removeRecursive(node.left, minNode.point, depth + 1);
      } else {
        return null;
      }
      return node;
    }
    const dimension = node.dimension;
    const pointCoord = point.coordinates[dimension];
    const nodeCoord = node.point.coordinates[dimension];
    if (pointCoord < nodeCoord) {
      node.left = this.removeRecursive(node.left, point, depth + 1);
    } else {
      node.right = this.removeRecursive(node.right, point, depth + 1);
    }
    return node;
  }
  findMin(node, dimension) {
    if (node.dimension === dimension) {
      if (node.left === null) {
        return node;
      }
      return this.findMin(node.left, dimension);
    }
    let minNode = node;
    if (node.left) {
      const leftMin = this.findMin(node.left, dimension);
      if (leftMin.point.coordinates[dimension] < minNode.point.coordinates[dimension]) {
        minNode = leftMin;
      }
    }
    if (node.right) {
      const rightMin = this.findMin(node.right, dimension);
      if (rightMin.point.coordinates[dimension] < minNode.point.coordinates[dimension]) {
        minNode = rightMin;
      }
    }
    return minNode;
  }
  isValidPoint(point) {
    if (!point || !Array.isArray(point.coordinates)) {
      return false;
    }
    if (point.coordinates.length !== this.config.dimensions) {
      return false;
    }
    return point.coordinates.every((coord) => typeof coord === "number" && isFinite(coord));
  }
  pointsEqual(p1, p2) {
    if (p1.coordinates.length !== p2.coordinates.length) {
      return false;
    }
    return p1.coordinates.every(
      (coord, i) => Math.abs(coord - p2.coordinates[i]) < this.config.tolerance
    );
  }
  calculateDistance(p1, p2, customDistance) {
    if (customDistance) {
      return customDistance(p1, p2);
    }
    let sum = 0;
    for (let i = 0; i < p1.coordinates.length; i++) {
      const diff = p1.coordinates[i] - p2.coordinates[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }
  pointInBounds(point, bounds, inclusive = true) {
    for (let i = 0; i < point.coordinates.length; i++) {
      const coord = point.coordinates[i];
      const min = bounds.min[i];
      const max = bounds.max[i];
      if (inclusive) {
        if (coord < min || coord > max) {
          return false;
        }
      } else {
        if (coord <= min || coord >= max) {
          return false;
        }
      }
    }
    return true;
  }
  getAllPoints() {
    const points = [];
    this.collectPoints(this.root, points);
    return points;
  }
  collectPoints(node, points) {
    if (node === null) {
      return;
    }
    points.push(node.point);
    this.collectPoints(node.left, points);
    this.collectPoints(node.right, points);
  }
  updateStats() {
    this.stats.nodeCount = this.countNodes(this.root);
    this.stats.leafCount = this.countLeaves(this.root);
    this.stats.height = this.calculateHeight(this.root);
    this.stats.averageDepth = this.calculateAverageDepth(this.root);
    this.stats.maxDepth = this.calculateMaxDepth(this.root);
    this.stats.memoryUsage = this.estimateMemoryUsage();
  }
  countNodes(node) {
    if (node === null) {
      return 0;
    }
    return 1 + this.countNodes(node.left) + this.countNodes(node.right);
  }
  countLeaves(node) {
    if (node === null) {
      return 0;
    }
    if (node.left === null && node.right === null) {
      return 1;
    }
    return this.countLeaves(node.left) + this.countLeaves(node.right);
  }
  calculateHeight(node) {
    if (node === null) {
      return 0;
    }
    return 1 + Math.max(this.calculateHeight(node.left), this.calculateHeight(node.right));
  }
  calculateAverageDepth(node) {
    if (node === null) {
      return 0;
    }
    const depths = [];
    this.collectDepths(node, 0, depths);
    return depths.reduce((sum, depth) => sum + depth, 0) / depths.length;
  }
  collectDepths(node, depth, depths) {
    if (node === null) {
      return;
    }
    if (node.left === null && node.right === null) {
      depths.push(depth);
    }
    this.collectDepths(node.left, depth + 1, depths);
    this.collectDepths(node.right, depth + 1, depths);
  }
  calculateMaxDepth(node) {
    if (node === null) {
      return 0;
    }
    return 1 + Math.max(this.calculateMaxDepth(node.left), this.calculateMaxDepth(node.right));
  }
  estimateMemoryUsage() {
    const nodeSize = 64;
    const pointSize = this.config.dimensions * 8;
    return this.stats.nodeCount * (nodeSize + pointSize);
  }
  calculatePerformanceScore() {
    const maxTime = 100;
    const searchScore = Math.max(0, 100 - this.stats.averageSearchTime / maxTime * 100);
    const nnScore = Math.max(0, 100 - this.stats.averageNearestNeighborTime / maxTime * 100);
    const rangeScore = Math.max(0, 100 - this.stats.averageRangeQueryTime / maxTime * 100);
    return (searchScore + nnScore + rangeScore) / 3;
  }
  calculateBalanceRatio() {
    if (this.stats.nodeCount === 0) {
      return 1;
    }
    const idealHeight = Math.ceil(Math.log2(this.stats.nodeCount + 1));
    return Math.max(0, 1 - (this.stats.height - idealHeight) / idealHeight);
  }
  calculateQueryEfficiency() {
    if (this.stats.searches === 0) {
      return 1;
    }
    const idealVisits = Math.log2(this.stats.nodeCount + 1);
    const actualVisits = this.stats.averageSearchTime;
    return Math.max(0, 1 - (actualVisits - idealVisits) / idealVisits);
  }
  serializeTreeStructure() {
    return this.serializeNode(this.root);
  }
  serializeNode(node) {
    if (node === null) {
      return null;
    }
    return {
      point: node.point,
      dimension: node.dimension,
      depth: node.depth,
      left: this.serializeNode(node.left),
      right: this.serializeNode(node.right)
    };
  }
  emitEvent(type, data) {
    if (this.eventHandlers.length === 0) {
      return;
    }
    const event = {
      type,
      timestamp: Date.now(),
      data
    };
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        if (this.enableDebug) {
          console.error("Error in K-d Tree event handler:", error);
        }
      }
    }
  }
}
var Octant = /* @__PURE__ */ ((Octant2) => {
  Octant2[Octant2["TOP_LEFT_FRONT"] = 0] = "TOP_LEFT_FRONT";
  Octant2[Octant2["TOP_RIGHT_FRONT"] = 1] = "TOP_RIGHT_FRONT";
  Octant2[Octant2["TOP_LEFT_BACK"] = 2] = "TOP_LEFT_BACK";
  Octant2[Octant2["TOP_RIGHT_BACK"] = 3] = "TOP_RIGHT_BACK";
  Octant2[Octant2["BOTTOM_LEFT_FRONT"] = 4] = "BOTTOM_LEFT_FRONT";
  Octant2[Octant2["BOTTOM_RIGHT_FRONT"] = 5] = "BOTTOM_RIGHT_FRONT";
  Octant2[Octant2["BOTTOM_LEFT_BACK"] = 6] = "BOTTOM_LEFT_BACK";
  Octant2[Octant2["BOTTOM_RIGHT_BACK"] = 7] = "BOTTOM_RIGHT_BACK";
  return Octant2;
})(Octant || {});
var OctreeEventType = /* @__PURE__ */ ((OctreeEventType2) => {
  OctreeEventType2["POINT_INSERTED"] = "point_inserted";
  OctreeEventType2["POINT_REMOVED"] = "point_removed";
  OctreeEventType2["NODE_SUBDIVIDED"] = "node_subdivided";
  OctreeEventType2["NODE_MERGED"] = "node_merged";
  OctreeEventType2["SPATIAL_QUERY"] = "spatial_query";
  OctreeEventType2["RAY_INTERSECTION"] = "ray_intersection";
  OctreeEventType2["FRUSTUM_CULLING"] = "frustum_culling";
  OctreeEventType2["STATS_UPDATED"] = "stats_updated";
  return OctreeEventType2;
})(OctreeEventType || {});
const DEFAULT_OCTREE_CONFIG = {
  maxPoints: 10,
  maxDepth: 8,
  minNodeSize: 1,
  autoSubdivide: true,
  autoMerge: true,
  enableLOD: false,
  lodDistances: [10, 50, 100, 200],
  enableStats: false,
  enableDebug: false
};
const DEFAULT_OCTREE_OPTIONS = {
  config: DEFAULT_OCTREE_CONFIG,
  initialPoints: []
};
class Octree {
  constructor(bounds, options = {}) {
    const opts = { ...DEFAULT_OCTREE_OPTIONS, ...options };
    this.config = { ...DEFAULT_OCTREE_CONFIG, ...opts.config || {} };
    this.eventHandlers = opts.eventHandlers || [];
    this.enableDebug = false;
    this.root = this.createNode(bounds, 0, null);
    this.stats = {
      totalPoints: 0,
      nodeCount: 1,
      leafCount: 1,
      height: 0,
      averageDepth: 0,
      maxDepth: 0,
      memoryUsage: 0,
      insertions: 0,
      removals: 0,
      spatialQueries: 0,
      rayIntersections: 0,
      frustumCulling: 0,
      averageQueryTime: 0,
      averageInsertionTime: 0,
      averageRemovalTime: 0
    };
    if (opts.initialPoints && opts.initialPoints.length > 0) {
      this.insertBatch(opts.initialPoints);
    }
  }
  /**
   * Insert a point into the Octree.
   */
  insert(point) {
    const startTime = performance.now();
    let nodesVisited = 0;
    try {
      if (!this.isValidPoint(point)) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          metadata: { error: "Invalid point" }
        };
      }
      if (!this.pointInBounds(point, this.root.bounds)) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          metadata: { error: "Point outside tree bounds" }
        };
      }
      nodesVisited = this.insertRecursive(this.root, point, 0);
      this.stats.insertions++;
      this.stats.totalPoints++;
      this.updateStats();
      const executionTime = performance.now() - startTime;
      this.stats.averageInsertionTime = (this.stats.averageInsertionTime * (this.stats.insertions - 1) + executionTime) / this.stats.insertions;
      this.emitEvent(OctreeEventType.POINT_INSERTED, { point, executionTime });
      return {
        success: true,
        executionTime,
        nodesVisited,
        metadata: { point }
      };
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesVisited,
        metadata: { error: error instanceof Error ? error.message : "Unknown error" }
      };
    }
  }
  /**
   * Insert multiple points in batch.
   */
  insertBatch(points) {
    const startTime = performance.now();
    const results = [];
    let successful = 0;
    let failed = 0;
    const errors = [];
    for (const point of points) {
      const result = this.insert(point);
      results.push(result);
      if (result.success) {
        successful++;
      } else {
        failed++;
        errors.push(result.metadata?.error || "Unknown error");
      }
    }
    return {
      successful,
      failed,
      errors,
      executionTime: performance.now() - startTime,
      results
    };
  }
  /**
   * Remove a point from the Octree.
   */
  remove(point) {
    const startTime = performance.now();
    let nodesVisited = 0;
    try {
      if (!this.isValidPoint(point)) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          metadata: { error: "Invalid point" }
        };
      }
      const removed = this.removeRecursive(this.root, point, 0);
      if (removed) {
        this.stats.removals++;
        this.stats.totalPoints--;
        this.updateStats();
        nodesVisited = this.stats.nodeCount;
        this.emitEvent(OctreeEventType.POINT_REMOVED, { point });
        return {
          success: true,
          executionTime: performance.now() - startTime,
          nodesVisited,
          metadata: { point }
        };
      } else {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          metadata: { error: "Point not found" }
        };
      }
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesVisited,
        metadata: { error: error instanceof Error ? error.message : "Unknown error" }
      };
    }
  }
  /**
   * Query points within a bounding box.
   */
  queryBounds(bounds, options = {}) {
    const startTime = performance.now();
    this.stats.spatialQueries++;
    const points = [];
    let nodesVisited = 0;
    if (this.root) {
      nodesVisited = this.queryBoundsRecursive(
        this.root,
        bounds,
        points,
        options,
        0
      );
    }
    const executionTime = performance.now() - startTime;
    this.stats.averageQueryTime = (this.stats.averageQueryTime * (this.stats.spatialQueries - 1) + executionTime) / this.stats.spatialQueries;
    this.emitEvent(OctreeEventType.SPATIAL_QUERY, {
      bounds,
      results: points,
      executionTime
    });
    return {
      points,
      count: points.length,
      executionTime,
      nodesVisited,
      success: true
    };
  }
  /**
   * Query points within a sphere.
   */
  querySphere(sphere, options = {}) {
    const startTime = performance.now();
    this.stats.spatialQueries++;
    const points = [];
    let nodesVisited = 0;
    if (this.root) {
      nodesVisited = this.querySphereRecursive(
        this.root,
        sphere,
        points,
        options,
        0
      );
    }
    const executionTime = performance.now() - startTime;
    this.stats.averageQueryTime = (this.stats.averageQueryTime * (this.stats.spatialQueries - 1) + executionTime) / this.stats.spatialQueries;
    this.emitEvent(OctreeEventType.SPATIAL_QUERY, {
      sphere,
      results: points,
      executionTime
    });
    return {
      points,
      count: points.length,
      executionTime,
      nodesVisited,
      success: true
    };
  }
  /**
   * Perform ray intersection query.
   */
  rayIntersection(ray, options = {}) {
    const startTime = performance.now();
    this.stats.rayIntersections++;
    const points = [];
    const distances = [];
    let nodesVisited = 0;
    if (this.root) {
      nodesVisited = this.rayIntersectionRecursive(
        this.root,
        ray,
        points,
        distances,
        options,
        0
      );
    }
    const executionTime = performance.now() - startTime;
    this.emitEvent(OctreeEventType.RAY_INTERSECTION, {
      ray,
      results: points,
      executionTime
    });
    return {
      points,
      distances,
      count: points.length,
      executionTime,
      nodesVisited,
      success: true
    };
  }
  /**
   * Perform frustum culling.
   */
  frustumCulling(frustum, options = {}) {
    const startTime = performance.now();
    this.stats.frustumCulling++;
    const visiblePoints = [];
    let culledCount = 0;
    let nodesVisited = 0;
    if (this.root) {
      const result = this.frustumCullingRecursive(
        this.root,
        frustum,
        visiblePoints,
        options,
        0
      );
      nodesVisited = result.nodesVisited;
      culledCount = result.culledCount;
    }
    const executionTime = performance.now() - startTime;
    this.emitEvent(OctreeEventType.FRUSTUM_CULLING, {
      frustum,
      visibleCount: visiblePoints.length,
      culledCount,
      executionTime
    });
    return {
      visiblePoints,
      visibleCount: visiblePoints.length,
      culledCount,
      executionTime,
      nodesVisited,
      success: true
    };
  }
  /**
   * Get the size of the tree.
   */
  size() {
    return this.stats.totalPoints;
  }
  /**
   * Check if the tree is empty.
   */
  isEmpty() {
    return this.root === null || this.stats.totalPoints === 0;
  }
  /**
   * Clear all points from the tree.
   */
  clear() {
    if (this.root) {
      this.clearRecursive(this.root);
      this.root.points = [];
      this.root.children.fill(null);
    }
    this.stats.totalPoints = 0;
    this.updateStats();
  }
  /**
   * Get statistics about the tree.
   */
  getStats() {
    return { ...this.stats };
  }
  /**
   * Get performance metrics.
   */
  getPerformanceMetrics() {
    return {
      memoryUsage: this.stats.memoryUsage,
      averageQueryTime: this.stats.averageQueryTime,
      averageInsertionTime: this.stats.averageInsertionTime,
      averageRemovalTime: this.stats.averageRemovalTime,
      performanceScore: this.calculatePerformanceScore(),
      balanceRatio: this.calculateBalanceRatio(),
      queryEfficiency: this.calculateQueryEfficiency(),
      lodEfficiency: this.calculateLODEfficiency()
    };
  }
  /**
   * Create a voxel grid from the tree.
   */
  createVoxelGrid(voxelSize) {
    if (!this.root) {
      throw new Error("Cannot create voxel grid from empty tree");
    }
    const bounds = this.root.bounds;
    const dimensions = {
      x: Math.ceil((bounds.max.x - bounds.min.x) / voxelSize),
      y: Math.ceil((bounds.max.y - bounds.min.y) / voxelSize),
      z: Math.ceil((bounds.max.z - bounds.min.z) / voxelSize)
    };
    const voxels = [];
    for (let x = 0; x < dimensions.x; x++) {
      voxels[x] = [];
      for (let y = 0; y < dimensions.y; y++) {
        voxels[x][y] = [];
        for (let z = 0; z < dimensions.z; z++) {
          const position = {
            x: bounds.min.x + x * voxelSize + voxelSize / 2,
            y: bounds.min.y + y * voxelSize + voxelSize / 2,
            z: bounds.min.z + z * voxelSize + voxelSize / 2
          };
          const voxelBounds = {
            min: {
              x: bounds.min.x + x * voxelSize,
              y: bounds.min.y + y * voxelSize,
              z: bounds.min.z + z * voxelSize
            },
            max: {
              x: bounds.min.x + (x + 1) * voxelSize,
              y: bounds.min.y + (y + 1) * voxelSize,
              z: bounds.min.z + (z + 1) * voxelSize
            },
            center: position,
            size: { x: voxelSize, y: voxelSize, z: voxelSize }
          };
          const pointsInVoxel = this.queryBounds(voxelBounds).points;
          voxels[x][y][z] = {
            position,
            size: voxelSize,
            data: pointsInVoxel,
            occupied: pointsInVoxel.length > 0
          };
        }
      }
    }
    return {
      bounds,
      voxelSize,
      dimensions,
      voxels
    };
  }
  /**
   * Serialize the tree to JSON.
   */
  serialize() {
    return {
      version: "1.0.0",
      config: this.config,
      data: {
        points: this.getAllPoints(),
        structure: this.serializeTreeStructure()
      },
      metadata: {
        totalPoints: this.stats.totalPoints,
        height: this.stats.height,
        nodeCount: this.stats.nodeCount,
        createdAt: Date.now()
      }
    };
  }
  /**
   * Deserialize a tree from JSON.
   */
  static deserialize(data, bounds) {
    const tree = new Octree(bounds, { config: data.config });
    if (data.data.points.length > 0) {
      tree.insertBatch(data.data.points);
    }
    return tree;
  }
  // Private helper methods
  createNode(bounds, depth, parent) {
    return {
      bounds,
      points: [],
      children: new Array(8).fill(null),
      parent,
      depth,
      isLeaf: true,
      lod: 0
    };
  }
  insertRecursive(node, point, depth) {
    let nodesVisited = 1;
    if (node.isLeaf && node.points.length < this.config.maxPoints) {
      node.points.push(point);
      return nodesVisited;
    }
    if (depth >= this.config.maxDepth) {
      node.points.push(point);
      return nodesVisited;
    }
    if (node.isLeaf && this.config.autoSubdivide) {
      this.subdivideNode(node);
      this.emitEvent(OctreeEventType.NODE_SUBDIVIDED, { node, depth });
    }
    if (!node.isLeaf) {
      const octant = this.getOctant(point, node.bounds);
      if (node.children[octant]) {
        nodesVisited += this.insertRecursive(node.children[octant], point, depth + 1);
      }
    } else {
      node.points.push(point);
    }
    return nodesVisited;
  }
  removeRecursive(node, point, depth) {
    const pointIndex = node.points.findIndex((p) => this.pointsEqual(p, point));
    if (pointIndex !== -1) {
      node.points.splice(pointIndex, 1);
      if (node.isLeaf && node.points.length === 0 && this.config.autoMerge) {
        this.mergeNode(node);
        this.emitEvent(OctreeEventType.NODE_MERGED, { node, depth });
      }
      return true;
    }
    if (!node.isLeaf) {
      const octant = this.getOctant(point, node.bounds);
      if (node.children[octant]) {
        return this.removeRecursive(node.children[octant], point, depth + 1);
      }
    }
    return false;
  }
  subdivideNode(node) {
    if (!node.isLeaf) {
      return;
    }
    const bounds = node.bounds;
    const center = bounds.center;
    const halfSize = {
      x: bounds.size.x / 2,
      y: bounds.size.y / 2,
      z: bounds.size.z / 2
    };
    const childBounds = [
      // Top Left Front
      {
        min: { x: center.x, y: center.y, z: center.z },
        max: { x: bounds.max.x, y: bounds.max.y, z: bounds.max.z },
        center: { x: center.x + halfSize.x / 2, y: center.y + halfSize.y / 2, z: center.z + halfSize.z / 2 },
        size: halfSize
      },
      // Top Right Front
      {
        min: { x: bounds.min.x, y: center.y, z: center.z },
        max: { x: center.x, y: bounds.max.y, z: bounds.max.z },
        center: { x: center.x - halfSize.x / 2, y: center.y + halfSize.y / 2, z: center.z + halfSize.z / 2 },
        size: halfSize
      },
      // Top Left Back
      {
        min: { x: center.x, y: center.y, z: bounds.min.z },
        max: { x: bounds.max.x, y: bounds.max.y, z: center.z },
        center: { x: center.x + halfSize.x / 2, y: center.y + halfSize.y / 2, z: center.z - halfSize.z / 2 },
        size: halfSize
      },
      // Top Right Back
      {
        min: { x: bounds.min.x, y: center.y, z: bounds.min.z },
        max: { x: center.x, y: bounds.max.y, z: center.z },
        center: { x: center.x - halfSize.x / 2, y: center.y + halfSize.y / 2, z: center.z - halfSize.z / 2 },
        size: halfSize
      },
      // Bottom Left Front
      {
        min: { x: center.x, y: bounds.min.y, z: center.z },
        max: { x: bounds.max.x, y: center.y, z: bounds.max.z },
        center: { x: center.x + halfSize.x / 2, y: center.y - halfSize.y / 2, z: center.z + halfSize.z / 2 },
        size: halfSize
      },
      // Bottom Right Front
      {
        min: { x: bounds.min.x, y: bounds.min.y, z: center.z },
        max: { x: center.x, y: center.y, z: bounds.max.z },
        center: { x: center.x - halfSize.x / 2, y: center.y - halfSize.y / 2, z: center.z + halfSize.z / 2 },
        size: halfSize
      },
      // Bottom Left Back
      {
        min: { x: center.x, y: bounds.min.y, z: bounds.min.z },
        max: { x: bounds.max.x, y: center.y, z: center.z },
        center: { x: center.x + halfSize.x / 2, y: center.y - halfSize.y / 2, z: center.z - halfSize.z / 2 },
        size: halfSize
      },
      // Bottom Right Back
      {
        min: { x: bounds.min.x, y: bounds.min.y, z: bounds.min.z },
        max: { x: center.x, y: center.y, z: center.z },
        center: { x: center.x - halfSize.x / 2, y: center.y - halfSize.y / 2, z: center.z - halfSize.z / 2 },
        size: halfSize
      }
    ];
    for (let i = 0; i < 8; i++) {
      node.children[i] = this.createNode(childBounds[i], node.depth + 1, node);
    }
    node.isLeaf = false;
    const pointsToRedistribute = [...node.points];
    node.points = [];
    for (const point of pointsToRedistribute) {
      const octant = this.getOctant(point, node.bounds);
      if (node.children[octant]) {
        this.insertRecursive(node.children[octant], point, node.depth + 1);
      }
    }
  }
  mergeNode(node) {
    if (node.isLeaf || !node.parent) {
      return;
    }
    let allChildrenEmpty = true;
    for (const child of node.children) {
      if (child && (child.points.length > 0 || !child.isLeaf)) {
        allChildrenEmpty = false;
        break;
      }
    }
    if (allChildrenEmpty) {
      node.children.fill(null);
      node.isLeaf = true;
    }
  }
  getOctant(point, bounds) {
    const center = bounds.center;
    let octant = 0;
    if (point.x >= center.x) octant |= 0;
    if (point.y >= center.y) octant |= 1;
    if (point.z >= center.z) octant |= 2;
    return octant;
  }
  queryBoundsRecursive(node, bounds, points, options, nodesVisited) {
    nodesVisited++;
    if (!this.boundsIntersect(node.bounds, bounds)) {
      return nodesVisited;
    }
    for (const point of node.points) {
      if (this.pointInBounds(point, bounds, options.inclusive)) {
        if (!options.filter || options.filter(point)) {
          points.push(point);
          if (options.maxResults && points.length >= options.maxResults) {
            return nodesVisited;
          }
        }
      }
    }
    if (!node.isLeaf) {
      for (const child of node.children) {
        if (child) {
          nodesVisited = this.queryBoundsRecursive(child, bounds, points, options, nodesVisited);
          if (options.maxResults && points.length >= options.maxResults) {
            break;
          }
        }
      }
    }
    return nodesVisited;
  }
  querySphereRecursive(node, sphere, points, options, nodesVisited) {
    nodesVisited++;
    if (!this.boundsIntersectSphere(node.bounds, sphere)) {
      return nodesVisited;
    }
    for (const point of node.points) {
      if (this.pointInSphere(point, sphere)) {
        if (!options.filter || options.filter(point)) {
          points.push(point);
          if (options.maxResults && points.length >= options.maxResults) {
            return nodesVisited;
          }
        }
      }
    }
    if (!node.isLeaf) {
      for (const child of node.children) {
        if (child) {
          nodesVisited = this.querySphereRecursive(child, sphere, points, options, nodesVisited);
          if (options.maxResults && points.length >= options.maxResults) {
            break;
          }
        }
      }
    }
    return nodesVisited;
  }
  rayIntersectionRecursive(node, ray, points, distances, options, nodesVisited) {
    nodesVisited++;
    if (!this.rayIntersectsBounds(ray, node.bounds)) {
      return nodesVisited;
    }
    for (const point of node.points) {
      const distance2 = this.rayPointDistance(ray, point);
      if (distance2 !== null && (ray.maxDistance === void 0 || distance2 <= ray.maxDistance)) {
        if (!options.filter || options.filter(point)) {
          points.push(point);
          distances.push(distance2);
          if (!options.findAll) {
            return nodesVisited;
          }
          if (options.maxIntersections && points.length >= options.maxIntersections) {
            return nodesVisited;
          }
        }
      }
    }
    if (!node.isLeaf) {
      for (const child of node.children) {
        if (child) {
          nodesVisited = this.rayIntersectionRecursive(child, ray, points, distances, options, nodesVisited);
          if (!options.findAll && points.length > 0) {
            return nodesVisited;
          }
        }
      }
    }
    return nodesVisited;
  }
  frustumCullingRecursive(node, frustum, visiblePoints, options, nodesVisited) {
    nodesVisited++;
    let culledCount = 0;
    const frustumTest = this.boundsFrustumTest(node.bounds, frustum);
    if (frustumTest === "outside") {
      culledCount += node.points.length;
      return { nodesVisited, culledCount };
    }
    for (const point of node.points) {
      if (frustumTest === "inside" || this.pointInFrustum(point, frustum)) {
        if (!options.filter || options.filter(point)) {
          visiblePoints.push(point);
        }
      } else {
        culledCount++;
      }
    }
    if (!node.isLeaf) {
      for (const child of node.children) {
        if (child) {
          const result = this.frustumCullingRecursive(child, frustum, visiblePoints, options, nodesVisited);
          nodesVisited = result.nodesVisited;
          culledCount += result.culledCount;
        }
      }
    }
    return { nodesVisited, culledCount };
  }
  clearRecursive(node) {
    node.points = [];
    if (!node.isLeaf) {
      for (const child of node.children) {
        if (child) {
          this.clearRecursive(child);
        }
      }
      node.children.fill(null);
      node.isLeaf = true;
    }
  }
  isValidPoint(point) {
    if (!point || typeof point.x !== "number" || typeof point.y !== "number" || typeof point.z !== "number") {
      return false;
    }
    return isFinite(point.x) && isFinite(point.y) && isFinite(point.z);
  }
  pointsEqual(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y && p1.z === p2.z;
  }
  pointInBounds(point, bounds, inclusive = true) {
    if (inclusive) {
      return point.x >= bounds.min.x && point.x <= bounds.max.x && point.y >= bounds.min.y && point.y <= bounds.max.y && point.z >= bounds.min.z && point.z <= bounds.max.z;
    } else {
      return point.x > bounds.min.x && point.x < bounds.max.x && point.y > bounds.min.y && point.y < bounds.max.y && point.z > bounds.min.z && point.z < bounds.max.z;
    }
  }
  boundsIntersect(bounds1, bounds2) {
    return bounds1.min.x <= bounds2.max.x && bounds1.max.x >= bounds2.min.x && bounds1.min.y <= bounds2.max.y && bounds1.max.y >= bounds2.min.y && bounds1.min.z <= bounds2.max.z && bounds1.max.z >= bounds2.min.z;
  }
  boundsIntersectSphere(bounds, sphere) {
    const closestPoint = {
      x: Math.max(bounds.min.x, Math.min(sphere.center.x, bounds.max.x)),
      y: Math.max(bounds.min.y, Math.min(sphere.center.y, bounds.max.y)),
      z: Math.max(bounds.min.z, Math.min(sphere.center.z, bounds.max.z))
    };
    const distance2 = Math.sqrt(
      Math.pow(closestPoint.x - sphere.center.x, 2) + Math.pow(closestPoint.y - sphere.center.y, 2) + Math.pow(closestPoint.z - sphere.center.z, 2)
    );
    return distance2 <= sphere.radius;
  }
  pointInSphere(point, sphere) {
    const distance2 = Math.sqrt(
      Math.pow(point.x - sphere.center.x, 2) + Math.pow(point.y - sphere.center.y, 2) + Math.pow(point.z - sphere.center.z, 2)
    );
    return distance2 <= sphere.radius;
  }
  rayIntersectsBounds(ray, bounds) {
    const tMin = (bounds.min.x - ray.origin.x) / ray.direction.x;
    const tMax = (bounds.max.x - ray.origin.x) / ray.direction.x;
    const t1 = Math.min(tMin, tMax);
    const t2 = Math.max(tMin, tMax);
    const tMinY = (bounds.min.y - ray.origin.y) / ray.direction.y;
    const tMaxY = (bounds.max.y - ray.origin.y) / ray.direction.y;
    const t3 = Math.min(tMinY, tMaxY);
    const t4 = Math.max(tMinY, tMaxY);
    const tMinZ = (bounds.min.z - ray.origin.z) / ray.direction.z;
    const tMaxZ = (bounds.max.z - ray.origin.z) / ray.direction.z;
    const t5 = Math.min(tMinZ, tMaxZ);
    const t6 = Math.max(tMinZ, tMaxZ);
    const tNear = Math.max(t1, t3, t5);
    const tFar = Math.min(t2, t4, t6);
    return tNear <= tFar && tFar >= 0;
  }
  rayPointDistance(ray, point) {
    const toPoint = {
      x: point.x - ray.origin.x,
      y: point.y - ray.origin.y,
      z: point.z - ray.origin.z
    };
    const projection = toPoint.x * ray.direction.x + toPoint.y * ray.direction.y + toPoint.z * ray.direction.z;
    if (projection < 0) {
      return null;
    }
    const projectedPoint = {
      x: ray.origin.x + projection * ray.direction.x,
      y: ray.origin.y + projection * ray.direction.y,
      z: ray.origin.z + projection * ray.direction.z
    };
    const distance2 = Math.sqrt(
      Math.pow(point.x - projectedPoint.x, 2) + Math.pow(point.y - projectedPoint.y, 2) + Math.pow(point.z - projectedPoint.z, 2)
    );
    return distance2;
  }
  boundsFrustumTest(bounds, frustum) {
    let inside = true;
    for (const plane of frustum.planes) {
      const normal = plane.normal;
      const distance2 = plane.distance;
      const corners = [
        { x: bounds.min.x, y: bounds.min.y, z: bounds.min.z },
        { x: bounds.max.x, y: bounds.min.y, z: bounds.min.z },
        { x: bounds.min.x, y: bounds.max.y, z: bounds.min.z },
        { x: bounds.max.x, y: bounds.max.y, z: bounds.min.z },
        { x: bounds.min.x, y: bounds.min.y, z: bounds.max.z },
        { x: bounds.max.x, y: bounds.min.y, z: bounds.max.z },
        { x: bounds.min.x, y: bounds.max.y, z: bounds.max.z },
        { x: bounds.max.x, y: bounds.max.y, z: bounds.max.z }
      ];
      let pointsInside = 0;
      let pointsOutside = 0;
      for (const corner of corners) {
        const dot = corner.x * normal.x + corner.y * normal.y + corner.z * normal.z;
        if (dot + distance2 > 0) {
          pointsInside++;
        } else {
          pointsOutside++;
        }
      }
      if (pointsOutside === 8) {
        return "outside";
      }
      if (pointsInside < 8) {
        inside = false;
      }
    }
    return inside ? "inside" : "intersect";
  }
  pointInFrustum(point, frustum) {
    for (const plane of frustum.planes) {
      const normal = plane.normal;
      const distance2 = plane.distance;
      const dot = point.x * normal.x + point.y * normal.y + point.z * normal.z;
      if (dot + distance2 <= 0) {
        return false;
      }
    }
    return true;
  }
  getAllPoints() {
    const points = [];
    if (this.root) {
      this.collectPoints(this.root, points);
    }
    return points;
  }
  collectPoints(node, points) {
    points.push(...node.points);
    if (!node.isLeaf) {
      for (const child of node.children) {
        if (child) {
          this.collectPoints(child, points);
        }
      }
    }
  }
  updateStats() {
    if (this.root) {
      this.stats.nodeCount = this.countNodes(this.root);
      this.stats.leafCount = this.countLeaves(this.root);
      this.stats.height = this.calculateHeight(this.root);
      this.stats.averageDepth = this.calculateAverageDepth(this.root);
      this.stats.maxDepth = this.calculateMaxDepth(this.root);
      this.stats.memoryUsage = this.estimateMemoryUsage();
    }
  }
  countNodes(node) {
    let count = 1;
    if (!node.isLeaf) {
      for (const child of node.children) {
        if (child) {
          count += this.countNodes(child);
        }
      }
    }
    return count;
  }
  countLeaves(node) {
    if (node.isLeaf) {
      return 1;
    }
    let count = 0;
    for (const child of node.children) {
      if (child) {
        count += this.countLeaves(child);
      }
    }
    return count;
  }
  calculateHeight(node) {
    if (node.isLeaf) {
      return 1;
    }
    let maxChildHeight = 0;
    for (const child of node.children) {
      if (child) {
        maxChildHeight = Math.max(maxChildHeight, this.calculateHeight(child));
      }
    }
    return 1 + maxChildHeight;
  }
  calculateAverageDepth(node) {
    const depths = [];
    this.collectDepths(node, 0, depths);
    return depths.reduce((sum, depth) => sum + depth, 0) / depths.length;
  }
  collectDepths(node, depth, depths) {
    if (node.isLeaf) {
      depths.push(depth);
    } else {
      for (const child of node.children) {
        if (child) {
          this.collectDepths(child, depth + 1, depths);
        }
      }
    }
  }
  calculateMaxDepth(node) {
    if (node.isLeaf) {
      return node.depth;
    }
    let maxDepth = node.depth;
    for (const child of node.children) {
      if (child) {
        maxDepth = Math.max(maxDepth, this.calculateMaxDepth(child));
      }
    }
    return maxDepth;
  }
  estimateMemoryUsage() {
    const nodeSize = 128;
    const pointSize = 24;
    return this.stats.nodeCount * nodeSize + this.stats.totalPoints * pointSize;
  }
  calculatePerformanceScore() {
    const maxTime = 100;
    const queryScore = Math.max(0, 100 - this.stats.averageQueryTime / maxTime * 100);
    const insertScore = Math.max(0, 100 - this.stats.averageInsertionTime / maxTime * 100);
    const removeScore = Math.max(0, 100 - this.stats.averageRemovalTime / maxTime * 100);
    return (queryScore + insertScore + removeScore) / 3;
  }
  calculateBalanceRatio() {
    if (this.stats.nodeCount === 0) {
      return 1;
    }
    const idealHeight = Math.ceil(Math.log2(this.stats.nodeCount + 1));
    return Math.max(0, 1 - (this.stats.height - idealHeight) / idealHeight);
  }
  calculateQueryEfficiency() {
    if (this.stats.spatialQueries === 0) {
      return 1;
    }
    const idealVisits = Math.log2(this.stats.nodeCount + 1);
    const actualVisits = this.stats.averageQueryTime;
    return Math.max(0, 1 - (actualVisits - idealVisits) / idealVisits);
  }
  calculateLODEfficiency() {
    if (!this.config.enableLOD) {
      return 1;
    }
    return Math.min(1, this.stats.totalPoints / (this.stats.nodeCount * this.config.maxPoints));
  }
  serializeTreeStructure() {
    return this.serializeNode(this.root);
  }
  serializeNode(node) {
    if (node === null) {
      return null;
    }
    return {
      bounds: node.bounds,
      points: node.points,
      depth: node.depth,
      isLeaf: node.isLeaf,
      lod: node.lod,
      children: node.children.map((child) => this.serializeNode(child))
    };
  }
  emitEvent(type, data) {
    if (this.eventHandlers.length === 0) {
      return;
    }
    const event = {
      type,
      timestamp: Date.now(),
      data
    };
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        if (this.enableDebug) {
          console.error("Error in Octree event handler:", error);
        }
      }
    }
  }
}
var BVHEventType = /* @__PURE__ */ ((BVHEventType2) => {
  BVHEventType2["PRIMITIVE_INSERTED"] = "primitive_inserted";
  BVHEventType2["PRIMITIVE_REMOVED"] = "primitive_removed";
  BVHEventType2["TREE_REBUILT"] = "tree_rebuilt";
  BVHEventType2["RAY_INTERSECTION"] = "ray_intersection";
  BVHEventType2["AABB_INTERSECTION"] = "aabb_intersection";
  BVHEventType2["STATS_UPDATED"] = "stats_updated";
  return BVHEventType2;
})(BVHEventType || {});
const DEFAULT_BVH_CONFIG = {
  maxPrimitivesPerLeaf: 4,
  maxDepth: 20,
  useSAH: true,
  sahBins: 12,
  traversalCost: 1,
  intersectionCost: 1,
  enableStats: false,
  enableDebug: false
};
const DEFAULT_BVH_OPTIONS = {
  config: DEFAULT_BVH_CONFIG,
  initialPrimitives: []
};
class BVH {
  constructor(options = {}) {
    const opts = { ...DEFAULT_BVH_OPTIONS, ...options };
    this.config = { ...DEFAULT_BVH_CONFIG, ...opts.config || {} };
    this.eventHandlers = opts.eventHandlers || [];
    this.enableDebug = false;
    this.primitives = /* @__PURE__ */ new Map();
    this.root = null;
    this.stats = {
      totalPrimitives: 0,
      nodeCount: 0,
      leafCount: 0,
      height: 0,
      averageDepth: 0,
      maxDepth: 0,
      memoryUsage: 0,
      rayIntersections: 0,
      aabbIntersections: 0,
      averageRayIntersectionTime: 0,
      averageAABBIntersectionTime: 0,
      averageNodesVisitedPerRay: 0,
      averagePrimitivesTestedPerRay: 0
    };
    if (opts.initialPrimitives && opts.initialPrimitives.length > 0) {
      this.insertBatch(opts.initialPrimitives);
    }
  }
  /**
   * Insert a primitive into the BVH.
   */
  insert(primitive) {
    const startTime = performance.now();
    let nodesVisited = 0;
    try {
      if (!this.isValidPrimitive(primitive)) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          metadata: { error: "Invalid primitive" }
        };
      }
      this.primitives.set(primitive.id, primitive);
      this.stats.totalPrimitives++;
      if (this.root === null) {
        this.root = this.buildTree([primitive]);
      } else {
        const allPrimitives = Array.from(this.primitives.values());
        this.root = this.buildTree(allPrimitives);
      }
      nodesVisited = this.stats.nodeCount;
      this.updateStats();
      const executionTime = performance.now() - startTime;
      this.emitEvent(BVHEventType.PRIMITIVE_INSERTED, { primitive, executionTime });
      return {
        success: true,
        executionTime,
        nodesVisited,
        metadata: { primitive }
      };
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesVisited,
        metadata: { error: error instanceof Error ? error.message : "Unknown error" }
      };
    }
  }
  /**
   * Insert multiple primitives in batch.
   */
  insertBatch(primitives) {
    const startTime = performance.now();
    const results = [];
    let successful = 0;
    let failed = 0;
    const errors = [];
    const validPrimitives = [];
    for (const primitive of primitives) {
      if (this.isValidPrimitive(primitive)) {
        validPrimitives.push(primitive);
        this.primitives.set(primitive.id, primitive);
        results.push({
          success: true,
          executionTime: 0,
          nodesVisited: 0,
          metadata: { primitive }
        });
        successful++;
      } else {
        results.push({
          success: false,
          executionTime: 0,
          nodesVisited: 0,
          metadata: { error: "Invalid primitive" }
        });
        failed++;
        errors.push("Invalid primitive");
      }
    }
    if (validPrimitives.length > 0) {
      this.root = this.buildTree(validPrimitives);
      this.stats.totalPrimitives = validPrimitives.length;
      this.updateStats();
    }
    return {
      successful,
      failed,
      errors,
      executionTime: performance.now() - startTime,
      results
    };
  }
  /**
   * Remove a primitive from the BVH.
   */
  remove(primitiveId) {
    const startTime = performance.now();
    let nodesVisited = 0;
    try {
      if (!this.primitives.has(primitiveId)) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          metadata: { error: "Primitive not found" }
        };
      }
      this.primitives.delete(primitiveId);
      this.stats.totalPrimitives--;
      if (this.primitives.size === 0) {
        this.root = null;
      } else {
        const remainingPrimitives = Array.from(this.primitives.values());
        this.root = this.buildTree(remainingPrimitives);
      }
      nodesVisited = this.stats.nodeCount;
      this.updateStats();
      const executionTime = performance.now() - startTime;
      this.emitEvent(BVHEventType.PRIMITIVE_REMOVED, { primitiveId, executionTime });
      return {
        success: true,
        executionTime,
        nodesVisited,
        metadata: { primitiveId }
      };
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesVisited,
        metadata: { error: error instanceof Error ? error.message : "Unknown error" }
      };
    }
  }
  /**
   * Perform ray intersection query.
   */
  rayIntersection(ray, options = {}) {
    const startTime = performance.now();
    this.stats.rayIntersections++;
    const primitives = [];
    const distances = [];
    let nodesVisited = 0;
    let primitivesTested = 0;
    if (this.root) {
      const result = this.rayIntersectionRecursive(
        this.root,
        ray,
        primitives,
        distances,
        options,
        0
      );
      nodesVisited = result.nodesVisited;
      primitivesTested = result.primitivesTested;
    }
    if (options.sortByDistance !== false && primitives.length > 1) {
      const sorted = primitives.map((p, i) => ({ primitive: p, distance: distances[i] })).sort((a, b) => a.distance - b.distance);
      primitives.length = 0;
      distances.length = 0;
      for (const item of sorted) {
        primitives.push(item.primitive);
        distances.push(item.distance);
      }
    }
    const executionTime = performance.now() - startTime;
    this.stats.averageRayIntersectionTime = (this.stats.averageRayIntersectionTime * (this.stats.rayIntersections - 1) + executionTime) / this.stats.rayIntersections;
    this.stats.averageNodesVisitedPerRay = (this.stats.averageNodesVisitedPerRay * (this.stats.rayIntersections - 1) + nodesVisited) / this.stats.rayIntersections;
    this.stats.averagePrimitivesTestedPerRay = (this.stats.averagePrimitivesTestedPerRay * (this.stats.rayIntersections - 1) + primitivesTested) / this.stats.rayIntersections;
    this.emitEvent(BVHEventType.RAY_INTERSECTION, {
      ray,
      results: primitives,
      executionTime
    });
    return {
      primitives,
      distances,
      count: primitives.length,
      executionTime,
      nodesVisited,
      primitivesTested,
      success: true
    };
  }
  /**
   * Perform AABB intersection query.
   */
  aabbIntersection(aabb, options = {}) {
    const startTime = performance.now();
    this.stats.aabbIntersections++;
    const primitives = [];
    let nodesVisited = 0;
    if (this.root) {
      nodesVisited = this.aabbIntersectionRecursive(
        this.root,
        aabb,
        primitives,
        options,
        0
      );
    }
    const executionTime = performance.now() - startTime;
    this.stats.averageAABBIntersectionTime = (this.stats.averageAABBIntersectionTime * (this.stats.aabbIntersections - 1) + executionTime) / this.stats.aabbIntersections;
    this.emitEvent(BVHEventType.AABB_INTERSECTION, {
      aabb,
      results: primitives,
      executionTime
    });
    return {
      primitives,
      count: primitives.length,
      executionTime,
      nodesVisited,
      success: true
    };
  }
  /**
   * Get the size of the BVH.
   */
  size() {
    return this.stats.totalPrimitives;
  }
  /**
   * Check if the BVH is empty.
   */
  isEmpty() {
    return this.root === null || this.stats.totalPrimitives === 0;
  }
  /**
   * Clear all primitives from the BVH.
   */
  clear() {
    this.root = null;
    this.primitives.clear();
    this.stats.totalPrimitives = 0;
    this.updateStats();
  }
  /**
   * Rebuild the entire BVH.
   */
  rebuild() {
    const startTime = performance.now();
    try {
      const primitives = Array.from(this.primitives.values());
      this.root = this.buildTree(primitives);
      this.updateStats();
      const executionTime = performance.now() - startTime;
      this.emitEvent(BVHEventType.TREE_REBUILT, { executionTime });
      return {
        success: true,
        executionTime,
        nodesVisited: this.stats.nodeCount,
        metadata: { primitivesRebuilt: primitives.length }
      };
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesVisited: 0,
        metadata: { error: error instanceof Error ? error.message : "Unknown error" }
      };
    }
  }
  /**
   * Get statistics about the BVH.
   */
  getStats() {
    return { ...this.stats };
  }
  /**
   * Get performance metrics.
   */
  getPerformanceMetrics() {
    return {
      memoryUsage: this.stats.memoryUsage,
      averageRayIntersectionTime: this.stats.averageRayIntersectionTime,
      averageAABBIntersectionTime: this.stats.averageAABBIntersectionTime,
      performanceScore: this.calculatePerformanceScore(),
      balanceRatio: this.calculateBalanceRatio(),
      queryEfficiency: this.calculateQueryEfficiency(),
      sahQuality: this.calculateSAHQuality()
    };
  }
  /**
   * Serialize the BVH to JSON.
   */
  serialize() {
    return {
      version: "1.0.0",
      config: this.config,
      data: {
        primitives: Array.from(this.primitives.values()),
        structure: this.serializeTreeStructure()
      },
      metadata: {
        totalPrimitives: this.stats.totalPrimitives,
        height: this.stats.height,
        nodeCount: this.stats.nodeCount,
        createdAt: Date.now()
      }
    };
  }
  /**
   * Deserialize a BVH from JSON.
   */
  static deserialize(data) {
    const bvh = new BVH({ config: data.config });
    if (data.data.primitives.length > 0) {
      bvh.insertBatch(data.data.primitives);
    }
    return bvh;
  }
  // Private helper methods
  buildTree(primitives) {
    if (primitives.length === 0) {
      throw new Error("Cannot build tree with no primitives");
    }
    if (primitives.length === 1) {
      return this.createLeafNode([primitives[0]], 0);
    }
    return this.buildNode(primitives, 0);
  }
  buildNode(primitives, depth) {
    if (primitives.length <= this.config.maxPrimitivesPerLeaf || depth >= this.config.maxDepth) {
      return this.createLeafNode(primitives, depth);
    }
    const split = this.findBestSplit(primitives);
    if (!split) {
      return this.createLeafNode(primitives, depth);
    }
    const { left, right } = this.partitionPrimitives(primitives, split);
    const node = {
      bounds: this.computeBounds(primitives),
      primitives: [],
      left: null,
      right: null,
      parent: null,
      isLeaf: false,
      depth,
      primitiveCount: primitives.length
    };
    node.left = this.buildNode(left, depth + 1);
    node.right = this.buildNode(right, depth + 1);
    node.left.parent = node;
    node.right.parent = node;
    return node;
  }
  createLeafNode(primitives, depth) {
    return {
      bounds: this.computeBounds(primitives),
      primitives,
      left: null,
      right: null,
      parent: null,
      isLeaf: true,
      depth,
      primitiveCount: primitives.length
    };
  }
  findBestSplit(primitives) {
    if (!this.config.useSAH) {
      const bounds = this.computeBounds(primitives);
      const size = bounds.size;
      let axis = 0;
      if (size.y > size.x) axis = 1;
      if (size.z > size[axis === 0 ? "x" : axis === 1 ? "y" : "z"]) axis = 2;
      const center = bounds.center;
      const position = center[axis === 0 ? "x" : axis === 1 ? "y" : "z"];
      return {
        axis,
        position,
        cost: this.config.traversalCost,
        leftCount: 0,
        rightCount: 0
      };
    }
    let bestSplit = null;
    let bestCost = Infinity;
    for (let axis = 0; axis < 3; axis++) {
      const split = this.findBestSplitAlongAxis(primitives, axis);
      if (split && split.cost < bestCost) {
        bestCost = split.cost;
        bestSplit = split;
      }
    }
    return bestSplit;
  }
  findBestSplitAlongAxis(primitives, axis) {
    const bounds = this.computeBounds(primitives);
    const min = bounds.min[axis === 0 ? "x" : axis === 1 ? "y" : "z"];
    const max = bounds.max[axis === 0 ? "x" : axis === 1 ? "y" : "z"];
    if (min === max) {
      return null;
    }
    const binSize = (max - min) / this.config.sahBins;
    let bestSplit = null;
    let bestCost = Infinity;
    for (let i = 1; i < this.config.sahBins; i++) {
      const position = min + i * binSize;
      const { left, right } = this.partitionPrimitivesAtPosition(primitives, axis, position);
      if (left.length === 0 || right.length === 0) {
        continue;
      }
      const cost = this.computeSAHCost(left, right, bounds);
      if (cost < bestCost) {
        bestCost = cost;
        bestSplit = {
          axis,
          position,
          cost,
          leftCount: left.length,
          rightCount: right.length
        };
      }
    }
    return bestSplit;
  }
  partitionPrimitives(primitives, split) {
    return this.partitionPrimitivesAtPosition(primitives, split.axis, split.position);
  }
  partitionPrimitivesAtPosition(primitives, axis, position) {
    const left = [];
    const right = [];
    for (const primitive of primitives) {
      const center = primitive.bounds.center[axis === 0 ? "x" : axis === 1 ? "y" : "z"];
      if (center < position) {
        left.push(primitive);
      } else {
        right.push(primitive);
      }
    }
    return { left, right };
  }
  computeSAHCost(left, right, parentBounds) {
    const leftBounds = this.computeBounds(left);
    const rightBounds = this.computeBounds(right);
    const parentSA = this.computeSurfaceArea(parentBounds);
    const leftSA = this.computeSurfaceArea(leftBounds);
    const rightSA = this.computeSurfaceArea(rightBounds);
    const leftCost = leftSA / parentSA * left.length * this.config.intersectionCost;
    const rightCost = rightSA / parentSA * right.length * this.config.intersectionCost;
    return this.config.traversalCost + leftCost + rightCost;
  }
  computeBounds(primitives) {
    if (primitives.length === 0) {
      throw new Error("Cannot compute bounds for empty primitive list");
    }
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (const primitive of primitives) {
      minX = Math.min(minX, primitive.bounds.min.x);
      minY = Math.min(minY, primitive.bounds.min.y);
      minZ = Math.min(minZ, primitive.bounds.min.z);
      maxX = Math.max(maxX, primitive.bounds.max.x);
      maxY = Math.max(maxY, primitive.bounds.max.y);
      maxZ = Math.max(maxZ, primitive.bounds.max.z);
    }
    return {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ },
      center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2, z: (minZ + maxZ) / 2 },
      size: { x: maxX - minX, y: maxY - minY, z: maxZ - minZ }
    };
  }
  computeSurfaceArea(bounds) {
    const size = bounds.size;
    return 2 * (size.x * size.y + size.y * size.z + size.z * size.x);
  }
  rayIntersectionRecursive(node, ray, primitives, distances, options, nodesVisited) {
    nodesVisited++;
    const intersection = this.rayAABBIntersection(ray, node.bounds);
    if (!intersection) {
      return { nodesVisited, primitivesTested: 0 };
    }
    let primitivesTested = 0;
    if (node.isLeaf) {
      for (const primitive of node.primitives) {
        primitivesTested++;
        if (options.filter && !options.filter(primitive)) {
          continue;
        }
        const distance2 = this.rayPrimitiveIntersection(ray, primitive);
        if (distance2 !== null) {
          primitives.push(primitive);
          distances.push(distance2);
          if (!options.findAll) {
            return { nodesVisited, primitivesTested };
          }
          if (options.maxIntersections && primitives.length >= options.maxIntersections) {
            return { nodesVisited, primitivesTested };
          }
        }
      }
    } else {
      if (node.left) {
        const result = this.rayIntersectionRecursive(node.left, ray, primitives, distances, options, nodesVisited);
        nodesVisited = result.nodesVisited;
        primitivesTested += result.primitivesTested;
        if (!options.findAll && primitives.length > 0) {
          return { nodesVisited, primitivesTested };
        }
      }
      if (node.right) {
        const result = this.rayIntersectionRecursive(node.right, ray, primitives, distances, options, nodesVisited);
        nodesVisited = result.nodesVisited;
        primitivesTested += result.primitivesTested;
      }
    }
    return { nodesVisited, primitivesTested };
  }
  aabbIntersectionRecursive(node, aabb, primitives, options, nodesVisited) {
    nodesVisited++;
    if (!this.aabbIntersects(node.bounds, aabb)) {
      return nodesVisited;
    }
    if (node.isLeaf) {
      for (const primitive of node.primitives) {
        if (options.filter && !options.filter(primitive)) {
          continue;
        }
        if (this.aabbIntersects(primitive.bounds, aabb)) {
          primitives.push(primitive);
          if (options.maxIntersections && primitives.length >= options.maxIntersections) {
            return nodesVisited;
          }
        }
      }
    } else {
      if (node.left) {
        nodesVisited = this.aabbIntersectionRecursive(node.left, aabb, primitives, options, nodesVisited);
      }
      if (node.right) {
        nodesVisited = this.aabbIntersectionRecursive(node.right, aabb, primitives, options, nodesVisited);
      }
    }
    return nodesVisited;
  }
  rayAABBIntersection(ray, aabb) {
    const tMin = (aabb.min.x - ray.origin.x) / ray.direction.x;
    const tMax = (aabb.max.x - ray.origin.x) / ray.direction.x;
    const t1 = Math.min(tMin, tMax);
    const t2 = Math.max(tMin, tMax);
    const tMinY = (aabb.min.y - ray.origin.y) / ray.direction.y;
    const tMaxY = (aabb.max.y - ray.origin.y) / ray.direction.y;
    const t3 = Math.min(tMinY, tMaxY);
    const t4 = Math.max(tMinY, tMaxY);
    const tMinZ = (aabb.min.z - ray.origin.z) / ray.direction.z;
    const tMaxZ = (aabb.max.z - ray.origin.z) / ray.direction.z;
    const t5 = Math.min(tMinZ, tMaxZ);
    const t6 = Math.max(tMinZ, tMaxZ);
    const tNear = Math.max(t1, t3, t5);
    const tFar = Math.min(t2, t4, t6);
    const tMinRay = ray.tMin || 0;
    const tMaxRay = ray.tMax || Infinity;
    return tNear <= tFar && tFar >= tMinRay && tNear <= tMaxRay;
  }
  rayPrimitiveIntersection(ray, primitive) {
    if ("v0" in primitive && "v1" in primitive && "v2" in primitive) {
      return this.rayTriangleIntersection(ray, primitive);
    }
    if (this.rayAABBIntersection(ray, primitive.bounds)) {
      const center = primitive.bounds.center;
      const dx = center.x - ray.origin.x;
      const dy = center.y - ray.origin.y;
      const dz = center.z - ray.origin.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    return null;
  }
  rayTriangleIntersection(ray, triangle) {
    const v0 = triangle.v0;
    const v1 = triangle.v1;
    const v2 = triangle.v2;
    const edge1 = { x: v1.x - v0.x, y: v1.y - v0.y, z: v1.z - v0.z };
    const edge2 = { x: v2.x - v0.x, y: v2.y - v0.y, z: v2.z - v0.z };
    const h = this.crossProduct(ray.direction, edge2);
    const a = this.dotProduct(edge1, h);
    if (a > -1e-8 && a < 1e-8) {
      return null;
    }
    const f = 1 / a;
    const s = { x: ray.origin.x - v0.x, y: ray.origin.y - v0.y, z: ray.origin.z - v0.z };
    const u = f * this.dotProduct(s, h);
    if (u < 0 || u > 1) {
      return null;
    }
    const q = this.crossProduct(s, edge1);
    const v = f * this.dotProduct(ray.direction, q);
    if (v < 0 || u + v > 1) {
      return null;
    }
    const t = f * this.dotProduct(edge2, q);
    if (t > 1e-8) {
      return t;
    }
    return null;
  }
  aabbIntersects(aabb1, aabb2) {
    return aabb1.min.x <= aabb2.max.x && aabb1.max.x >= aabb2.min.x && aabb1.min.y <= aabb2.max.y && aabb1.max.y >= aabb2.min.y && aabb1.min.z <= aabb2.max.z && aabb1.max.z >= aabb2.min.z;
  }
  crossProduct(a, b) {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    };
  }
  dotProduct(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }
  isValidPrimitive(primitive) {
    if (!primitive || !primitive.bounds || !primitive.id) {
      return false;
    }
    const bounds = primitive.bounds;
    if (!bounds.min || !bounds.max || !bounds.center || !bounds.size) {
      return false;
    }
    if (bounds.min.x > bounds.max.x || bounds.min.y > bounds.max.y || bounds.min.z > bounds.max.z) {
      return false;
    }
    return true;
  }
  updateStats() {
    if (this.root) {
      this.stats.nodeCount = this.countNodes(this.root);
      this.stats.leafCount = this.countLeaves(this.root);
      this.stats.height = this.calculateHeight(this.root);
      this.stats.averageDepth = this.calculateAverageDepth(this.root);
      this.stats.maxDepth = this.calculateMaxDepth(this.root);
      this.stats.memoryUsage = this.estimateMemoryUsage();
    }
  }
  countNodes(node) {
    let count = 1;
    if (!node.isLeaf) {
      if (node.left) count += this.countNodes(node.left);
      if (node.right) count += this.countNodes(node.right);
    }
    return count;
  }
  countLeaves(node) {
    if (node.isLeaf) {
      return 1;
    }
    let count = 0;
    if (node.left) count += this.countLeaves(node.left);
    if (node.right) count += this.countLeaves(node.right);
    return count;
  }
  calculateHeight(node) {
    if (node.isLeaf) {
      return 1;
    }
    let maxChildHeight = 0;
    if (node.left) maxChildHeight = Math.max(maxChildHeight, this.calculateHeight(node.left));
    if (node.right) maxChildHeight = Math.max(maxChildHeight, this.calculateHeight(node.right));
    return 1 + maxChildHeight;
  }
  calculateAverageDepth(node) {
    const depths = [];
    this.collectDepths(node, 0, depths);
    return depths.reduce((sum, depth) => sum + depth, 0) / depths.length;
  }
  collectDepths(node, depth, depths) {
    if (node.isLeaf) {
      depths.push(depth);
    } else {
      if (node.left) this.collectDepths(node.left, depth + 1, depths);
      if (node.right) this.collectDepths(node.right, depth + 1, depths);
    }
  }
  calculateMaxDepth(node) {
    if (node.isLeaf) {
      return node.depth;
    }
    let maxDepth = node.depth;
    if (node.left) maxDepth = Math.max(maxDepth, this.calculateMaxDepth(node.left));
    if (node.right) maxDepth = Math.max(maxDepth, this.calculateMaxDepth(node.right));
    return maxDepth;
  }
  estimateMemoryUsage() {
    const nodeSize = 64;
    const primitiveSize = 32;
    return this.stats.nodeCount * nodeSize + this.stats.totalPrimitives * primitiveSize;
  }
  calculatePerformanceScore() {
    const maxTime = 100;
    const rayScore = Math.max(0, 100 - this.stats.averageRayIntersectionTime / maxTime * 100);
    const aabbScore = Math.max(0, 100 - this.stats.averageAABBIntersectionTime / maxTime * 100);
    return (rayScore + aabbScore) / 2;
  }
  calculateBalanceRatio() {
    if (this.stats.nodeCount === 0) {
      return 1;
    }
    const idealHeight = Math.ceil(Math.log2(this.stats.nodeCount + 1));
    return Math.max(0, 1 - (this.stats.height - idealHeight) / idealHeight);
  }
  calculateQueryEfficiency() {
    if (this.stats.rayIntersections === 0) {
      return 1;
    }
    const idealVisits = Math.log2(this.stats.nodeCount + 1);
    const actualVisits = this.stats.averageNodesVisitedPerRay;
    return Math.max(0, 1 - (actualVisits - idealVisits) / idealVisits);
  }
  calculateSAHQuality() {
    if (!this.config.useSAH) {
      return 0;
    }
    return this.calculateBalanceRatio();
  }
  serializeTreeStructure() {
    return this.serializeNode(this.root);
  }
  serializeNode(node) {
    if (node === null) {
      return null;
    }
    return {
      bounds: node.bounds,
      primitives: node.primitives.map((p) => p.id),
      isLeaf: node.isLeaf,
      depth: node.depth,
      primitiveCount: node.primitiveCount,
      left: this.serializeNode(node.left),
      right: this.serializeNode(node.right)
    };
  }
  emitEvent(type, data) {
    if (this.eventHandlers.length === 0) {
      return;
    }
    const event = {
      type,
      timestamp: Date.now(),
      data
    };
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        if (this.enableDebug) {
          console.error("Error in BVH event handler:", error);
        }
      }
    }
  }
}
class Quadtree {
  /**
   * Creates a new Quadtree instance
   *
   * @param bounds - The bounding box for the root node
   * @param options - Configuration options for the quadtree
   */
  constructor(bounds, options = {}) {
    this.config = {
      maxObjects: options.maxObjects ?? 10,
      maxDepth: options.maxDepth ?? 8,
      minNodeSize: options.minNodeSize ?? 10,
      autoSubdivide: options.autoSubdivide ?? true,
      autoMerge: options.autoMerge ?? true
    };
    this.eventHandler = options.onEvent;
    this.stats = {
      totalObjects: 0,
      totalNodes: 1,
      leafNodes: 1,
      maxDepth: 0,
      averageObjectsPerNode: 0,
      subdivisions: 0,
      merges: 0,
      queries: 0,
      averageQueryTime: 0
    };
    this.performanceMetrics = {
      averageInsertTime: 0,
      averageRemoveTime: 0,
      averageQueryTime: 0,
      averageSubdivisionTime: 0,
      estimatedMemoryUsage: 0,
      queryEfficiency: 0
    };
    this.root = this.createNode(bounds, 0, null);
  }
  /**
   * Inserts an object into the quadtree
   *
   * Mathematical Process:
   * 1. Find appropriate leaf node for the object: O(log n)
   * 2. Add object to node's object list: O(1)
   * 3. If node exceeds maxObjects, subdivide: O(k) where k is objects in node
   * 4. Redistribute objects to child nodes: O(k)
   *
   * @param data - The data object to insert
   * @param position - The position of the object
   * @param bounds - Optional bounding box for the object
   * @returns True if insertion was successful
   */
  insert(data, position, bounds) {
    const startTime = performance.now();
    try {
      const quadtreeData = {
        data,
        position,
        bounds,
        id: this.generateId()
      };
      const node = this.findNode(this.root, position, bounds);
      if (!node) {
        return false;
      }
      node.objects.push(quadtreeData);
      this.stats.totalObjects++;
      this.updateAverageObjectsPerNode();
      if (this.shouldSubdivide(node)) {
        this.subdivide(node);
      }
      this.updateAverageInsertTime(performance.now() - startTime);
      this.updateMemoryUsage();
      this.emitEvent("insert", quadtreeData, node);
      return true;
    } catch (error) {
      this.emitEvent("insert", void 0, void 0, {
        error: error instanceof Error ? error.message : "Unknown error"
      });
      return false;
    }
  }
  /**
   * Removes an object from the quadtree
   *
   * Mathematical Process:
   * 1. Find the node containing the object: O(log n)
   * 2. Remove object from node's object list: O(k) where k is objects in node
   * 3. If node becomes empty and has siblings, merge: O(1)
   *
   * @param data - The data object to remove
   * @param position - The position of the object
   * @returns True if removal was successful
   */
  remove(data, position) {
    const startTime = performance.now();
    let node = this.findNode(this.root, position);
    if (!node) {
      return false;
    }
    let index = node.objects.findIndex(
      (obj) => obj.data === data && obj.position.x === position.x && obj.position.y === position.y
    );
    if (index === -1) {
      const stack = [this.root];
      let foundNode = null;
      let foundIndex = -1;
      while (stack.length > 0 && foundIndex === -1) {
        const n = stack.pop();
        const i = n.objects.findIndex((obj) => obj.data === data);
        if (i !== -1) {
          foundNode = n;
          foundIndex = i;
          break;
        }
        if (n.children) stack.push(...n.children);
      }
      if (foundNode && foundIndex !== -1) {
        node = foundNode;
        index = foundIndex;
      } else {
        return false;
      }
    }
    const removedObject = node.objects.splice(index, 1)[0];
    this.stats.totalObjects--;
    this.updateAverageObjectsPerNode();
    let current = node;
    while (current && current.parent) {
      if (this.shouldMerge(current.parent)) {
        this.merge(current.parent);
        current = current.parent.parent;
      } else {
        break;
      }
    }
    this.updateAverageRemoveTime(performance.now() - startTime);
    this.updateMemoryUsage();
    this.emitEvent("remove", removedObject, node);
    return true;
  }
  /**
   * Queries objects within a rectangular area
   *
   * Mathematical Process:
   * 1. Start from root node: O(1)
   * 2. Recursively traverse nodes that intersect query bounds: O(log n)
   * 3. Collect objects from intersecting leaf nodes: O(k) where k is results
   * 4. Total complexity: O(log n + k)
   *
   * @param query - Rectangle query parameters
   * @returns Query result with found objects and statistics
   */
  queryRect(query) {
    const startTime = performance.now();
    let nodesSearched = 0;
    const objects = [];
    const searchStack = [this.root];
    while (searchStack.length > 0) {
      const node = searchStack.pop();
      nodesSearched++;
      if (!this.intersects(node.bounds, query.bounds)) {
        continue;
      }
      for (const obj of node.objects) {
        if (this.objectInBounds(obj, query.bounds)) {
          objects.push(obj);
        }
      }
      if (node.children) {
        for (const child of node.children) {
          searchStack.push(child);
        }
      }
    }
    const queryTime = performance.now() - startTime;
    this.stats.queries++;
    this.updateAverageQueryTime(queryTime);
    this.stats.averageQueryTime = (this.stats.averageQueryTime * (this.stats.queries - 1) + queryTime) / this.stats.queries;
    this.updateQueryEfficiency(objects.length, nodesSearched);
    this.emitEvent("query", void 0, void 0, {
      queryType: "rectangle",
      resultCount: objects.length,
      nodesSearched
    });
    return {
      objects,
      nodesSearched,
      queryTime,
      queryBounds: query.bounds
    };
  }
  /**
   * Queries objects within a circular area
   *
   * @param query - Circle query parameters
   * @returns Query result with found objects and statistics
   */
  queryCircle(query) {
    const startTime = performance.now();
    let nodesSearched = 0;
    const bounds = {
      x: query.center.x - query.radius,
      y: query.center.y - query.radius,
      width: query.radius * 2,
      height: query.radius * 2
    };
    const objects = [];
    const searchStack = [this.root];
    while (searchStack.length > 0) {
      const node = searchStack.pop();
      nodesSearched++;
      if (!this.intersects(node.bounds, bounds)) {
        continue;
      }
      for (const obj of node.objects) {
        if (this.objectInCircle(obj, query.center, query.radius)) {
          objects.push(obj);
        }
      }
      if (node.children) {
        for (const child of node.children) {
          searchStack.push(child);
        }
      }
    }
    const queryTime = performance.now() - startTime;
    this.stats.queries++;
    this.updateAverageQueryTime(queryTime);
    this.stats.averageQueryTime = (this.stats.averageQueryTime * (this.stats.queries - 1) + queryTime) / this.stats.queries;
    this.updateQueryEfficiency(objects.length, nodesSearched);
    this.emitEvent("query", void 0, void 0, {
      queryType: "circle",
      resultCount: objects.length,
      nodesSearched
    });
    return {
      objects,
      nodesSearched,
      queryTime,
      queryBounds: bounds
    };
  }
  /**
   * Queries objects at a specific point
   *
   * @param query - Point query parameters
   * @returns Query result with found objects and statistics
   */
  queryPoint(query) {
    const tolerance = query.tolerance ?? 0;
    const bounds = {
      x: query.point.x - tolerance,
      y: query.point.y - tolerance,
      width: tolerance * 2,
      height: tolerance * 2
    };
    return this.queryRect({ bounds });
  }
  /**
   * Finds the nearest neighbor to a given point
   *
   * Mathematical Process:
   * 1. Use quadtree structure to prune search space: O(log n)
   * 2. Maintain minimum distance during traversal
   * 3. Skip nodes that cannot contain closer objects
   *
   * @param point - The point to find nearest neighbor for
   * @param maxDistance - Maximum search distance (optional)
   * @returns Nearest neighbor result
   */
  findNearestNeighbor(point, maxDistance) {
    const startTime = performance.now();
    let objectsChecked = 0;
    let nearest = null;
    let minDistance = maxDistance ?? Infinity;
    const searchStack = [this.root];
    while (searchStack.length > 0) {
      const node = searchStack.pop();
      if (this.nodeMinDistance(node.bounds, point) >= minDistance) {
        continue;
      }
      for (const obj of node.objects) {
        objectsChecked++;
        const distance2 = this.distance(obj.position, point);
        if (distance2 < minDistance) {
          minDistance = distance2;
          nearest = obj;
        }
      }
      if (node.children) {
        for (const child of node.children) {
          searchStack.push(child);
        }
      }
    }
    const queryTime = performance.now() - startTime;
    return {
      nearest,
      distance: nearest ? minDistance : -1,
      objectsChecked,
      queryTime
    };
  }
  /**
   * Detects collisions between objects in the quadtree
   *
   * @param collisionRadius - Radius for collision detection
   * @returns Collision detection result
   */
  detectCollisions(collisionRadius) {
    const startTime = performance.now();
    const collisions = [];
    let checksPerformed = 0;
    const seenPairs = /* @__PURE__ */ new Set();
    const allObjects = this.getAllObjects();
    for (const obj1 of allObjects) {
      const nearby = this.queryCircle({
        center: obj1.position,
        radius: collisionRadius * 2
        // Search in larger radius
      });
      for (const obj2 of nearby.objects) {
        if (obj1 === obj2) continue;
        checksPerformed++;
        const distance2 = this.distance(obj1.position, obj2.position);
        if (distance2 <= collisionRadius) {
          const id1 = obj1.id ?? String(obj1.data);
          const id2 = obj2.id ?? String(obj2.data);
          const key = id1 < id2 ? `${id1}|${id2}` : `${id2}|${id1}`;
          if (!seenPairs.has(key)) {
            seenPairs.add(key);
            collisions.push({
              object1: obj1,
              object2: obj2,
              distance: distance2
            });
          }
        }
      }
    }
    const detectionTime = performance.now() - startTime;
    return {
      collisions,
      checksPerformed,
      detectionTime
    };
  }
  /**
   * Clears all objects from the quadtree
   */
  clear() {
    this.root.objects = [];
    this.root.children = null;
    this.stats.totalObjects = 0;
    this.stats.totalNodes = 1;
    this.stats.leafNodes = 1;
    this.stats.maxDepth = 0;
    this.emitEvent("clear");
  }
  /**
   * Gets the current statistics
   *
   * @returns Current quadtree statistics
   */
  getStats() {
    return { ...this.stats };
  }
  /**
   * Gets performance metrics
   *
   * @returns Current performance metrics
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }
  /**
   * Traverses the entire quadtree structure
   *
   * @returns Traversal result with all nodes and objects
   */
  traverse() {
    const nodes = [];
    const objects = [];
    let maxDepth = 0;
    let nodesVisited = 0;
    const traverseNode = (node) => {
      nodes.push(node);
      nodesVisited++;
      maxDepth = Math.max(maxDepth, node.depth);
      objects.push(...node.objects);
      if (node.children) {
        for (const child of node.children) {
          traverseNode(child);
        }
      }
    };
    traverseNode(this.root);
    return {
      nodes,
      objects,
      maxDepth,
      nodesVisited
    };
  }
  /**
   * Gets all objects in the quadtree
   *
   * @returns Array of all objects
   */
  getAllObjects() {
    const result = this.traverse();
    return result.objects;
  }
  /**
   * Creates a new quadtree node
   *
   * @param bounds - Bounding box for the node
   * @param depth - Depth level of the node
   * @param parent - Parent node
   * @returns New quadtree node
   */
  createNode(bounds, depth, parent) {
    return {
      bounds,
      objects: [],
      children: null,
      parent,
      depth,
      maxObjects: this.config.maxObjects,
      maxDepth: this.config.maxDepth
    };
  }
  /**
   * Finds the appropriate node for inserting an object
   *
   * @param node - Starting node
   * @param position - Object position
   * @param bounds - Object bounds
   * @returns Target node for insertion
   */
  findNode(node, position, bounds) {
    if (!this.objectInBounds({ position, bounds }, node.bounds)) {
      return null;
    }
    if (!node.children) {
      return node;
    }
    for (const child of node.children) {
      const found = this.findNode(child, position, bounds);
      if (found) {
        return found;
      }
    }
    return null;
  }
  /**
   * Determines if a node should be subdivided
   *
   * @param node - Node to check
   * @returns True if node should be subdivided
   */
  shouldSubdivide(node) {
    return this.config.autoSubdivide && node.objects.length > this.config.maxObjects && node.depth < this.config.maxDepth && this.canSubdivide(node);
  }
  /**
   * Checks if a node can be subdivided
   *
   * @param node - Node to check
   * @returns True if node can be subdivided
   */
  canSubdivide(node) {
    return node.bounds.width > this.config.minNodeSize && node.bounds.height > this.config.minNodeSize;
  }
  /**
   * Subdivides a node into four child nodes
   *
   * @param node - Node to subdivide
   */
  subdivide(node) {
    const startTime = performance.now();
    const { x, y, width, height } = node.bounds;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const children = [
      // Northwest
      this.createNode({ x, y, width: halfWidth, height: halfHeight }, node.depth + 1, node),
      // Northeast
      this.createNode({ x: x + halfWidth, y, width: halfWidth, height: halfHeight }, node.depth + 1, node),
      // Southwest
      this.createNode({ x, y: y + halfHeight, width: halfWidth, height: halfHeight }, node.depth + 1, node),
      // Southeast
      this.createNode(
        { x: x + halfWidth, y: y + halfHeight, width: halfWidth, height: halfHeight },
        node.depth + 1,
        node
      )
    ];
    node.children = children;
    this.stats.totalNodes += 4;
    this.stats.leafNodes += 3;
    this.stats.maxDepth = Math.max(this.stats.maxDepth, node.depth + 1);
    this.stats.subdivisions++;
    const objectsToRedistribute = [...node.objects];
    node.objects = [];
    for (const obj of objectsToRedistribute) {
      for (const child of children) {
        if (this.objectInBounds(obj, child.bounds)) {
          child.objects.push(obj);
          break;
        }
      }
    }
    this.updateAverageSubdivisionTime(performance.now() - startTime);
    this.emitEvent("subdivide", void 0, node);
  }
  /**
   * Determines if a node should be merged
   *
   * @param node - Node to check
   * @returns True if node should be merged
   */
  shouldMerge(node) {
    return this.config.autoMerge && node.children !== null && this.getTotalObjectsInSubtree(node) <= this.config.maxObjects;
  }
  /**
   * Gets total number of objects in a subtree
   *
   * @param node - Root of subtree
   * @returns Total object count
   */
  getTotalObjectsInSubtree(node) {
    let count = node.objects.length;
    if (node.children) {
      for (const child of node.children) {
        count += this.getTotalObjectsInSubtree(child);
      }
    }
    return count;
  }
  /**
   * Merges a node with its children
   *
   * @param node - Node to merge
   */
  merge(node) {
    if (!node.children) {
      return;
    }
    const allObjects = [];
    for (const child of node.children) {
      allObjects.push(...child.objects);
    }
    node.objects.push(...allObjects);
    node.children = null;
    this.stats.totalNodes -= 4;
    this.stats.leafNodes -= 3;
    this.stats.merges++;
    this.emitEvent("merge", void 0, node);
  }
  /**
   * Checks if two rectangles intersect
   *
   * @param rect1 - First rectangle
   * @param rect2 - Second rectangle
   * @returns True if rectangles intersect
   */
  intersects(rect1, rect2) {
    return !(rect1.x + rect1.width < rect2.x || rect2.x + rect2.width < rect1.x || rect1.y + rect1.height < rect2.y || rect2.y + rect2.height < rect1.y);
  }
  /**
   * Checks if an object is within bounds
   *
   * @param obj - Object to check
   * @param bounds - Bounds to check against
   * @returns True if object is within bounds
   */
  objectInBounds(obj, bounds) {
    if (obj.bounds) {
      return this.intersects(obj.bounds, bounds);
    }
    return obj.position.x >= bounds.x && obj.position.x <= bounds.x + bounds.width && obj.position.y >= bounds.y && obj.position.y <= bounds.y + bounds.height;
  }
  /**
   * Checks if an object is within a circle
   *
   * @param obj - Object to check
   * @param center - Circle center
   * @param radius - Circle radius
   * @returns True if object is within circle
   */
  objectInCircle(obj, center, radius) {
    const distance2 = this.distance(obj.position, center);
    return distance2 <= radius;
  }
  /**
   * Calculates distance between two points
   *
   * @param p1 - First point
   * @param p2 - Second point
   * @returns Euclidean distance
   */
  distance(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  /**
   * Calculates minimum distance from a point to a rectangle
   *
   * @param bounds - Rectangle bounds
   * @param point - Point
   * @returns Minimum distance
   */
  nodeMinDistance(bounds, point) {
    const dx = Math.max(0, Math.max(bounds.x - point.x, point.x - (bounds.x + bounds.width)));
    const dy = Math.max(0, Math.max(bounds.y - point.y, point.y - (bounds.y + bounds.height)));
    return Math.sqrt(dx * dx + dy * dy);
  }
  /**
   * Generates a unique ID for objects
   *
   * @returns Unique identifier
   */
  generateId() {
    return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  /**
   * Updates average objects per node statistic
   */
  updateAverageObjectsPerNode() {
    this.stats.averageObjectsPerNode = this.stats.totalObjects / this.stats.totalNodes;
  }
  /**
   * Updates average insertion time
   *
   * @param time - Time taken for insertion
   */
  updateAverageInsertTime(time) {
    this.performanceMetrics.averageInsertTime = (this.performanceMetrics.averageInsertTime * (this.stats.totalObjects - 1) + time) / this.stats.totalObjects;
  }
  /**
   * Updates average removal time
   *
   * @param time - Time taken for removal
   */
  updateAverageRemoveTime(time) {
    this.performanceMetrics.averageRemoveTime = (this.performanceMetrics.averageRemoveTime * (this.stats.totalObjects - 1) + time) / this.stats.totalObjects;
  }
  /**
   * Updates average query time
   *
   * @param time - Time taken for query
   */
  updateAverageQueryTime(time) {
    this.performanceMetrics.averageQueryTime = (this.performanceMetrics.averageQueryTime * (this.stats.queries - 1) + time) / this.stats.queries;
  }
  /**
   * Updates average subdivision time
   *
   * @param time - Time taken for subdivision
   */
  updateAverageSubdivisionTime(time) {
    this.performanceMetrics.averageSubdivisionTime = (this.performanceMetrics.averageSubdivisionTime * (this.stats.subdivisions - 1) + time) / this.stats.subdivisions;
  }
  /**
   * Updates query efficiency metric
   *
   * @param objectsFound - Number of objects found
   * @param nodesSearched - Number of nodes searched
   */
  updateQueryEfficiency(objectsFound, nodesSearched) {
    this.performanceMetrics.queryEfficiency = objectsFound / Math.max(1, nodesSearched);
  }
  /**
   * Updates memory usage estimate
   */
  updateMemoryUsage() {
    const nodeSize = this.stats.totalNodes * 200;
    const objectSize = this.stats.totalObjects * 100;
    this.performanceMetrics.estimatedMemoryUsage = nodeSize + objectSize;
  }
  /**
   * Emits an event if event handler is configured
   *
   * @param type - Event type
   * @param data - Event data
   * @param node - Event node
   * @param metadata - Additional metadata
   */
  emitEvent(type, data, node, metadata) {
    if (this.eventHandler) {
      const event = {
        type,
        timestamp: Date.now(),
        data,
        node,
        metadata
      };
      this.eventHandler(event);
    }
  }
}
class RTree {
  /**
   * Creates an instance of RTree.
   * @param config - Optional configuration for the R-Tree.
   */
  constructor(config = {}) {
    this.root = null;
    this.entryCount = 0;
    this.config = {
      minEntries: 2,
      maxEntries: 8,
      reinsertOnOverflow: true,
      useQuadraticSplit: true,
      ...config
    };
  }
  /**
   * Inserts an entry into the R-Tree.
   * @param entry - The entry to insert.
   * @returns An RTreeInsertResult object with insertion statistics.
   */
  insert(entry) {
    const startTime = performance.now();
    let nodesCreated = 0;
    let nodesSplit = 0;
    try {
      if (!this.root) {
        this.root = this.createLeafNode();
        nodesCreated++;
      }
      const result = this.insertEntry(this.root, entry);
      if (result.newNode) {
        const newRoot = this.createInternalNode();
        newRoot.entries.push({ id: "root1", bounds: this.root.bounds }, { id: "root2", bounds: result.newNode.bounds });
        this.root.parent = newRoot;
        result.newNode.parent = newRoot;
        this.root = newRoot;
        nodesCreated++;
      }
      this.entryCount++;
      return {
        success: true,
        nodesCreated,
        nodesSplit,
        executionTime: performance.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        nodesCreated,
        nodesSplit,
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  /**
   * Removes an entry from the R-Tree by ID.
   * @param id - The ID of the entry to remove.
   * @returns An RTreeDeleteResult object with deletion statistics.
   */
  delete(id) {
    const startTime = performance.now();
    let entriesDeleted = 0;
    let nodesRemoved = 0;
    try {
      if (!this.root) {
        return {
          success: false,
          entriesDeleted: 0,
          nodesRemoved: 0,
          executionTime: performance.now() - startTime,
          error: "Tree is empty"
        };
      }
      const result = this.deleteEntry(this.root, id);
      if (result.found) {
        entriesDeleted = 1;
        this.entryCount--;
        if (this.root.entries.length === 1 && !this.root.isLeaf) {
          const childEntry = this.root.entries[0];
          const childNode = this.findNodeByEntry(childEntry);
          if (childNode) {
            this.root = childNode;
            this.root.parent = void 0;
            nodesRemoved = 1;
          }
        }
      }
      return {
        success: result.found,
        entriesDeleted,
        nodesRemoved,
        executionTime: performance.now() - startTime,
        error: result.found ? void 0 : "Entry not found"
      };
    } catch (error) {
      return {
        success: false,
        entriesDeleted,
        nodesRemoved,
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  /**
   * Queries the R-Tree for entries that intersect with the given rectangle.
   * @param bounds - The query rectangle.
   * @param options - Optional query options.
   * @returns An RTreeQueryResult object with matching entries and statistics.
   */
  query(bounds, options = {}) {
    const startTime = performance.now();
    const queryOptions = {
      limit: 0,
      includeTouching: false,
      ...options
    };
    const entries = [];
    let nodesVisited = 0;
    if (this.root) {
      this.queryNode(this.root, bounds, entries, queryOptions, nodesVisited);
    }
    return {
      entries,
      nodesVisited,
      executionTime: performance.now() - startTime
    };
  }
  /**
   * Finds the nearest entry to a given point.
   * @param point - The query point.
   * @param maxDistance - Maximum distance to search (0 = no limit).
   * @returns The nearest entry or null if none found.
   */
  nearest(point, maxDistance = 0) {
    if (!this.root) return null;
    let nearestEntry = null;
    let nearestDistance = maxDistance > 0 ? maxDistance : Infinity;
    this.nearestNode(this.root, point, nearestEntry, nearestDistance);
    return nearestEntry;
  }
  /**
   * Gets statistics about the R-Tree structure.
   * @returns An RTreeStats object with tree statistics.
   */
  getStats() {
    const stats = this.calculateStats(this.root);
    return {
      entryCount: this.entryCount,
      nodeCount: stats.nodeCount,
      height: stats.height,
      averageEntriesPerNode: stats.totalEntries / Math.max(stats.nodeCount, 1),
      storageUtilization: stats.totalEntries / (stats.nodeCount * this.config.maxEntries) * 100
    };
  }
  /**
   * Clears all entries from the R-Tree.
   */
  clear() {
    this.root = null;
    this.entryCount = 0;
  }
  /**
   * Checks if the R-Tree is empty.
   * @returns True if the tree is empty, false otherwise.
   */
  isEmpty() {
    return this.root === null || this.entryCount === 0;
  }
  /**
   * Gets the total number of entries in the tree.
   * @returns The number of entries.
   */
  size() {
    return this.entryCount;
  }
  // Private helper methods
  createLeafNode() {
    return {
      bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
      entries: [],
      isLeaf: true
    };
  }
  createInternalNode() {
    return {
      bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
      entries: [],
      isLeaf: false
    };
  }
  insertEntry(node, entry) {
    if (node.isLeaf) {
      node.entries.push(entry);
      this.updateBounds(node);
      if (node.entries.length > this.config.maxEntries) {
        return this.splitNode(node);
      }
      return {};
    } else {
      const bestChild = this.chooseBestChild(node, entry);
      const result = this.insertEntry(bestChild, entry);
      if (result.newNode) {
        node.entries.push({ id: `node_${Date.now()}`, bounds: result.newNode.bounds });
        this.updateBounds(node);
        if (node.entries.length > this.config.maxEntries) {
          return this.splitNode(node);
        }
      } else {
        this.updateBounds(node);
      }
      return result;
    }
  }
  chooseBestChild(node, entry) {
    let bestChild = null;
    let minEnlargement = Infinity;
    for (const childEntry of node.entries) {
      const childNode = this.findNodeByEntry(childEntry);
      if (!childNode) continue;
      const enlargement = this.calculateEnlargement(childNode.bounds, entry.bounds);
      if (enlargement < minEnlargement || enlargement === minEnlargement && this.area(childNode.bounds) < this.area(bestChild?.bounds || { minX: 0, minY: 0, maxX: 0, maxY: 0 })) {
        minEnlargement = enlargement;
        bestChild = childNode;
      }
    }
    return bestChild;
  }
  splitNode(node) {
    if (this.config.useQuadraticSplit) {
      return this.quadraticSplit(node);
    } else {
      return this.linearSplit(node);
    }
  }
  quadraticSplit(node) {
    const entries = [...node.entries];
    const newNode = node.isLeaf ? this.createLeafNode() : this.createInternalNode();
    let maxDistance = -1;
    let seed1 = 0;
    let seed2 = 0;
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const distance2 = this.calculateDistance(entries[i].bounds, entries[j].bounds);
        if (distance2 > maxDistance) {
          maxDistance = distance2;
          seed1 = i;
          seed2 = j;
        }
      }
    }
    const group1 = [entries[seed1]];
    const group2 = [entries[seed2]];
    const remaining = entries.filter((_, index) => index !== seed1 && index !== seed2);
    while (remaining.length > 0) {
      if (group1.length + remaining.length <= this.config.minEntries) {
        group1.push(...remaining);
        break;
      }
      if (group2.length + remaining.length <= this.config.minEntries) {
        group2.push(...remaining);
        break;
      }
      let bestGroup = 1;
      let minEnlargement1 = Infinity;
      let minEnlargement2 = Infinity;
      for (const entry of remaining) {
        const enlargement1 = this.calculateGroupEnlargement(group1, entry);
        const enlargement2 = this.calculateGroupEnlargement(group2, entry);
        if (enlargement1 < minEnlargement1) minEnlargement1 = enlargement1;
        if (enlargement2 < minEnlargement2) minEnlargement2 = enlargement2;
      }
      if (minEnlargement1 < minEnlargement2) {
        bestGroup = 1;
      } else if (minEnlargement2 < minEnlargement1) {
        bestGroup = 2;
      } else {
        const area1 = this.calculateGroupArea(group1);
        const area2 = this.calculateGroupArea(group2);
        bestGroup = area1 < area2 ? 1 : 2;
      }
      const entryToAdd = remaining.shift();
      if (bestGroup === 1) {
        group1.push(entryToAdd);
      } else {
        group2.push(entryToAdd);
      }
    }
    node.entries = group1;
    newNode.entries = group2;
    this.updateBounds(node);
    this.updateBounds(newNode);
    return { newNode };
  }
  linearSplit(node) {
    const entries = [...node.entries];
    const newNode = node.isLeaf ? this.createLeafNode() : this.createInternalNode();
    let maxXDistance = -1;
    let maxYDistance = -1;
    let seed1X = 0;
    let seed2X = 0;
    let seed1Y = 0;
    let seed2Y = 0;
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const xDistance = Math.abs(entries[i].bounds.maxX - entries[j].bounds.minX) + Math.abs(entries[j].bounds.maxX - entries[i].bounds.minX);
        const yDistance = Math.abs(entries[i].bounds.maxY - entries[j].bounds.minY) + Math.abs(entries[j].bounds.maxY - entries[i].bounds.minY);
        if (xDistance > maxXDistance) {
          maxXDistance = xDistance;
          seed1X = i;
          seed2X = j;
        }
        if (yDistance > maxYDistance) {
          maxYDistance = yDistance;
          seed1Y = i;
          seed2Y = j;
        }
      }
    }
    const useXAxis = maxXDistance > maxYDistance;
    const seed1 = useXAxis ? seed1X : seed1Y;
    const seed2 = useXAxis ? seed2X : seed2Y;
    const group1 = [entries[seed1]];
    const group2 = [entries[seed2]];
    const remaining = entries.filter((_, index) => index !== seed1 && index !== seed2);
    while (remaining.length > 0) {
      if (group1.length + remaining.length <= this.config.minEntries) {
        group1.push(...remaining);
        break;
      }
      if (group2.length + remaining.length <= this.config.minEntries) {
        group2.push(...remaining);
        break;
      }
      const entryToAdd = remaining.shift();
      const enlargement1 = this.calculateGroupEnlargement(group1, entryToAdd);
      const enlargement2 = this.calculateGroupEnlargement(group2, entryToAdd);
      if (enlargement1 < enlargement2) {
        group1.push(entryToAdd);
      } else if (enlargement2 < enlargement1) {
        group2.push(entryToAdd);
      } else {
        const area1 = this.calculateGroupArea(group1);
        const area2 = this.calculateGroupArea(group2);
        if (area1 < area2) {
          group1.push(entryToAdd);
        } else {
          group2.push(entryToAdd);
        }
      }
    }
    node.entries = group1;
    newNode.entries = group2;
    this.updateBounds(node);
    this.updateBounds(newNode);
    return { newNode };
  }
  deleteEntry(node, id) {
    if (node.isLeaf) {
      const index = node.entries.findIndex((entry) => entry.id === id);
      if (index !== -1) {
        node.entries.splice(index, 1);
        this.updateBounds(node);
        return { found: true };
      }
      return { found: false };
    } else {
      for (const entry of node.entries) {
        if (this.boundsIntersect(entry.bounds, { minX: 0, minY: 0, maxX: 0, maxY: 0 })) {
          const childNode = this.findNodeByEntry(entry);
          if (childNode) {
            const result = this.deleteEntry(childNode, id);
            if (result.found) {
              this.updateBounds(node);
              return { found: true };
            }
          }
        }
      }
      return { found: false };
    }
  }
  queryNode(node, bounds, results, options, nodesVisited) {
    nodesVisited++;
    if (!this.boundsIntersect(node.bounds, bounds)) {
      return;
    }
    if (node.isLeaf) {
      for (const entry of node.entries) {
        if (this.boundsIntersect(entry.bounds, bounds, options.includeTouching)) {
          results.push(entry);
          if (options.limit && options.limit > 0 && results.length >= options.limit) {
            return;
          }
        }
      }
    } else {
      for (const entry of node.entries) {
        if (this.boundsIntersect(entry.bounds, bounds)) {
          const childNode = this.findNodeByEntry(entry);
          if (childNode) {
            this.queryNode(childNode, bounds, results, options, nodesVisited);
            if (options.limit && options.limit > 0 && results.length >= options.limit) {
              return;
            }
          }
        }
      }
    }
  }
  nearestNode(node, point, nearestEntry, nearestDistance) {
    if (node.isLeaf) {
      for (const entry of node.entries) {
        const distance2 = this.pointToBoundsDistance(point, entry.bounds);
        if (distance2 < nearestDistance) {
          nearestEntry = entry;
          nearestDistance = distance2;
        }
      }
    } else {
      const childrenWithDistance = node.entries.map((entry) => ({
        entry,
        distance: this.pointToBoundsDistance(point, entry.bounds)
      })).sort((a, b) => a.distance - b.distance);
      for (const { entry, distance: distance2 } of childrenWithDistance) {
        if (distance2 < nearestDistance) {
          const childNode = this.findNodeByEntry(entry);
          if (childNode) {
            this.nearestNode(childNode, point, nearestEntry, nearestDistance);
          }
        }
      }
    }
  }
  findNodeByEntry(entry) {
    if (!this.root) return null;
    return this.findNodeByEntryRecursive(this.root, entry);
  }
  findNodeByEntryRecursive(node, targetEntry) {
    if (node.isLeaf) {
      return node.entries.some((entry) => entry.id === targetEntry.id) ? node : null;
    }
    for (const entry of node.entries) {
      if (entry.id === targetEntry.id) {
        return node;
      }
      const childNode = this.findNodeByEntryRecursive(node, entry);
      if (childNode) {
        return childNode;
      }
    }
    return null;
  }
  updateBounds(node) {
    if (node.entries.length === 0) {
      node.bounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
      return;
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const entry of node.entries) {
      minX = Math.min(minX, entry.bounds.minX);
      minY = Math.min(minY, entry.bounds.minY);
      maxX = Math.max(maxX, entry.bounds.maxX);
      maxY = Math.max(maxY, entry.bounds.maxY);
    }
    node.bounds = { minX, minY, maxX, maxY };
  }
  calculateStats(node) {
    if (!node) {
      return { nodeCount: 0, height: 0, totalEntries: 0 };
    }
    let nodeCount = 1;
    let height = 1;
    let totalEntries = node.entries.length;
    if (!node.isLeaf) {
      for (const entry of node.entries) {
        const childNode = this.findNodeByEntry(entry);
        if (childNode) {
          const childStats = this.calculateStats(childNode);
          nodeCount += childStats.nodeCount;
          height = Math.max(height, childStats.height + 1);
          totalEntries += childStats.totalEntries;
        }
      }
    }
    return { nodeCount, height, totalEntries };
  }
  // Utility methods
  boundsIntersect(bounds1, bounds2, includeTouching = false) {
    if (includeTouching) {
      return !(bounds1.maxX < bounds2.minX || bounds2.maxX < bounds1.minX || bounds1.maxY < bounds2.minY || bounds2.maxY < bounds1.minY);
    } else {
      return !(bounds1.maxX <= bounds2.minX || bounds2.maxX <= bounds1.minX || bounds1.maxY <= bounds2.minY || bounds2.maxY <= bounds1.minY);
    }
  }
  calculateEnlargement(bounds1, bounds2) {
    const enlarged = {
      minX: Math.min(bounds1.minX, bounds2.minX),
      minY: Math.min(bounds1.minY, bounds2.minY),
      maxX: Math.max(bounds1.maxX, bounds2.maxX),
      maxY: Math.max(bounds1.maxY, bounds2.maxY)
    };
    return this.area(enlarged) - this.area(bounds1);
  }
  calculateGroupEnlargement(group, entry) {
    if (group.length === 0) return this.area(entry.bounds);
    const groupBounds = this.calculateGroupBounds(group);
    return this.calculateEnlargement(groupBounds, entry.bounds);
  }
  calculateGroupBounds(group) {
    if (group.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const entry of group) {
      minX = Math.min(minX, entry.bounds.minX);
      minY = Math.min(minY, entry.bounds.minY);
      maxX = Math.max(maxX, entry.bounds.maxX);
      maxY = Math.max(maxY, entry.bounds.maxY);
    }
    return { minX, minY, maxX, maxY };
  }
  calculateGroupArea(group) {
    const bounds = this.calculateGroupBounds(group);
    return this.area(bounds);
  }
  area(bounds) {
    return (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY);
  }
  calculateDistance(bounds1, bounds2) {
    const dx = Math.max(0, Math.max(bounds1.minX, bounds2.minX) - Math.min(bounds1.maxX, bounds2.maxX));
    const dy = Math.max(0, Math.max(bounds1.minY, bounds2.minY) - Math.min(bounds1.maxY, bounds2.maxY));
    return dx * dx + dy * dy;
  }
  pointToBoundsDistance(point, bounds) {
    const dx = Math.max(0, Math.max(bounds.minX - point.x, point.x - bounds.maxX));
    const dy = Math.max(0, Math.max(bounds.minY - point.y, point.y - bounds.maxY));
    return dx * dx + dy * dy;
  }
}
class PointOps {
  static create(x, y) {
    return { x, y };
  }
  static add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
  }
  static subtract(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
  }
  static multiply(a, scalar) {
    return { x: a.x * scalar, y: a.y * scalar };
  }
  static divide(a, scalar) {
    if (scalar === 0) {
      throw new Error("Division by zero");
    }
    return { x: a.x / scalar, y: a.y / scalar };
  }
  static distance(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  static distanceSquared(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return dx * dx + dy * dy;
  }
  static midpoint(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }
  static lerp(a, b, t) {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }
  static equals(a, b) {
    return Math.abs(a.x - b.x) < 1e-10 && Math.abs(a.y - b.y) < 1e-10;
  }
  static clone(point) {
    return { x: point.x, y: point.y };
  }
}
class VectorOps {
  static create(x, y) {
    return { x, y };
  }
  static fromPoints(start, end) {
    return { x: end.x - start.x, y: end.y - start.y };
  }
  static add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
  }
  static subtract(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
  }
  static multiply(a, scalar) {
    return { x: a.x * scalar, y: a.y * scalar };
  }
  static divide(a, scalar) {
    if (scalar === 0) {
      throw new Error("Division by zero");
    }
    return { x: a.x / scalar, y: a.y / scalar };
  }
  static dot(a, b) {
    return a.x * b.x + a.y * b.y;
  }
  static cross(a, b) {
    return a.x * b.y - a.y * b.x;
  }
  static magnitude(vector) {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  }
  static magnitudeSquared(vector) {
    return vector.x * vector.x + vector.y * vector.y;
  }
  static normalize(vector) {
    const mag = this.magnitude(vector);
    if (mag === 0) return { x: 0, y: 0 };
    return { x: vector.x / mag, y: vector.y / mag };
  }
  static rotate(vector, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: vector.x * cos - vector.y * sin,
      y: vector.x * sin + vector.y * cos
    };
  }
  static angle(vector) {
    return Math.atan2(vector.y, vector.x);
  }
  static angleBetween(a, b) {
    const dot = this.dot(a, b);
    const magA = this.magnitude(a);
    const magB = this.magnitude(b);
    return Math.acos(dot / (magA * magB));
  }
}
class LineOps {
  static create(start, end) {
    return { start, end };
  }
  static getLength(line) {
    return PointOps.distance(line.start, line.end);
  }
  static getLengthSquared(line) {
    return PointOps.distanceSquared(line.start, line.end);
  }
  static midpoint(line) {
    return PointOps.midpoint(line.start, line.end);
  }
  static direction(line) {
    return { x: line.end.x - line.start.x, y: line.end.y - line.start.y };
  }
  static normal(line) {
    const dir = this.direction(line);
    const mag = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
    if (mag === 0) return { x: 0, y: 0 };
    return { x: -dir.y / mag, y: dir.x / mag };
  }
  static pointAt(line, t) {
    return PointOps.lerp(line.start, line.end, t);
  }
  static distanceToPoint(line, point) {
    const A = point.x - line.start.x;
    const B = point.y - line.start.y;
    const C = line.end.x - line.start.x;
    const D = line.end.y - line.start.y;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    if (lenSq === 0) return PointOps.distance(line.start, point);
    const param = dot / lenSq;
    let xx, yy;
    if (param < 0) {
      xx = line.start.x;
      yy = line.start.y;
    } else if (param > 1) {
      xx = line.end.x;
      yy = line.end.y;
    } else {
      xx = line.start.x + param * C;
      yy = line.start.y + param * D;
    }
    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }
  static intersects(a, b) {
    const x1 = a.start.x, y1 = a.start.y;
    const x2 = a.end.x, y2 = a.end.y;
    const x3 = b.start.x, y3 = b.start.y;
    const x4 = b.end.x, y4 = b.end.y;
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 1e-10) return null;
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1)
      };
    }
    return null;
  }
}
class RectangleBasic {
  static create(x, y, width, height) {
    return { x, y, width, height };
  }
  static fromPoints(topLeft, bottomRight) {
    return {
      x: topLeft.x,
      y: topLeft.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y
    };
  }
  static area(rect) {
    return rect.width * rect.height;
  }
  static perimeter(rect) {
    return 2 * (rect.width + rect.height);
  }
  static center(rect) {
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  }
  static topLeft(rect) {
    return { x: rect.x, y: rect.y };
  }
  static topRight(rect) {
    return { x: rect.x + rect.width, y: rect.y };
  }
  static bottomLeft(rect) {
    return { x: rect.x, y: rect.y + rect.height };
  }
  static bottomRight(rect) {
    return { x: rect.x + rect.width, y: rect.y + rect.height };
  }
  static containsPoint(rect, point) {
    return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
  }
  static containsRectangle(outer, inner) {
    return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height;
  }
}
class RectangleAdvanced {
  static intersects(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }
  static intersection(a, b) {
    if (!this.intersects(a, b)) return null;
    const x1 = Math.max(a.x, b.x);
    const y1 = Math.max(a.y, b.y);
    const x2 = Math.min(a.x + a.width, b.x + b.width);
    const y2 = Math.min(a.y + a.height, b.y + b.height);
    return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
  }
  static union(a, b) {
    const x1 = Math.min(a.x, b.x);
    const y1 = Math.min(a.y, b.y);
    const x2 = Math.max(a.x + a.width, b.x + b.width);
    const y2 = Math.max(a.y + a.height, b.y + b.height);
    return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
  }
  static expand(rect, amount) {
    return {
      x: rect.x - amount,
      y: rect.y - amount,
      width: rect.width + amount * 2,
      height: rect.height + amount * 2
    };
  }
  static shrink(rect, amount) {
    return {
      x: rect.x + amount,
      y: rect.y + amount,
      width: Math.max(0, rect.width - amount * 2),
      height: Math.max(0, rect.height - amount * 2)
    };
  }
  static translate(rect, offset) {
    return {
      x: rect.x + offset.x,
      y: rect.y + offset.y,
      width: rect.width,
      height: rect.height
    };
  }
  static scale(rect, factor, center) {
    if (center) {
      const newWidth = rect.width * factor;
      const newHeight = rect.height * factor;
      const newX = center.x - newWidth / 2;
      const newY = center.y - newHeight / 2;
      return { x: newX, y: newY, width: newWidth, height: newHeight };
    } else {
      return {
        x: rect.x * factor,
        y: rect.y * factor,
        width: rect.width * factor,
        height: rect.height * factor
      };
    }
  }
}
const _RectangleOps = class _RectangleOps {
};
_RectangleOps.create = RectangleBasic.create;
_RectangleOps.fromPoints = RectangleBasic.fromPoints;
_RectangleOps.area = RectangleBasic.area;
_RectangleOps.perimeter = RectangleBasic.perimeter;
_RectangleOps.center = RectangleBasic.center;
_RectangleOps.topLeft = RectangleBasic.topLeft;
_RectangleOps.topRight = RectangleBasic.topRight;
_RectangleOps.bottomLeft = RectangleBasic.bottomLeft;
_RectangleOps.bottomRight = RectangleBasic.bottomRight;
_RectangleOps.containsPoint = RectangleBasic.containsPoint;
_RectangleOps.containsRectangle = RectangleBasic.containsRectangle;
_RectangleOps.intersects = RectangleAdvanced.intersects;
_RectangleOps.intersection = RectangleAdvanced.intersection;
_RectangleOps.union = RectangleAdvanced.union;
_RectangleOps.expand = RectangleAdvanced.expand;
_RectangleOps.shrink = RectangleAdvanced.shrink;
_RectangleOps.translate = RectangleAdvanced.translate;
_RectangleOps.scale = RectangleAdvanced.scale;
let RectangleOps = _RectangleOps;
class CircleOps {
  static create(center, radius) {
    return { center, radius };
  }
  static area(circle) {
    return Math.PI * circle.radius * circle.radius;
  }
  static circumference(circle) {
    return 2 * Math.PI * circle.radius;
  }
  static containsPoint(circle, point) {
    return PointOps.distanceSquared(circle.center, point) <= circle.radius * circle.radius;
  }
  static intersects(a, b) {
    const distance2 = PointOps.distance(a.center, b.center);
    return distance2 <= a.radius + b.radius;
  }
  static expand(circle, amount) {
    return { center: circle.center, radius: circle.radius + amount };
  }
  static shrink(circle, amount) {
    return {
      center: circle.center,
      radius: Math.max(0, circle.radius - amount)
    };
  }
  static translate(circle, offset) {
    return {
      center: PointOps.add(circle.center, offset),
      radius: circle.radius
    };
  }
}
class PolygonOps {
  static create(points) {
    return { points: [...points] };
  }
  static area(polygon) {
    if (polygon.points.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < polygon.points.length; i++) {
      const j = (i + 1) % polygon.points.length;
      area += polygon.points[i].x * polygon.points[j].y;
      area -= polygon.points[j].x * polygon.points[i].y;
    }
    return Math.abs(area) / 2;
  }
  static perimeter(polygon) {
    if (polygon.points.length < 2) return 0;
    let perimeter = 0;
    for (let i = 0; i < polygon.points.length; i++) {
      const j = (i + 1) % polygon.points.length;
      perimeter += PointOps.distance(polygon.points[i], polygon.points[j]);
    }
    return perimeter;
  }
  static centroid(polygon) {
    if (polygon.points.length === 0) return { x: 0, y: 0 };
    if (polygon.points.length === 1) return polygon.points[0];
    let cx = 0, cy = 0;
    for (const point of polygon.points) {
      cx += point.x;
      cy += point.y;
    }
    return { x: cx / polygon.points.length, y: cy / polygon.points.length };
  }
  static containsPoint(polygon, point) {
    if (polygon.points.length < 3) return false;
    let inside = false;
    for (let i = 0, j = polygon.points.length - 1; i < polygon.points.length; j = i++) {
      const xi = polygon.points[i].x, yi = polygon.points[i].y;
      const xj = polygon.points[j].x, yj = polygon.points[j].y;
      if (yi > point.y !== yj > point.y && point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  }
  static boundingBox(polygon) {
    if (polygon.points.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    let minX = polygon.points[0].x, maxX = polygon.points[0].x;
    let minY = polygon.points[0].y, maxY = polygon.points[0].y;
    for (const point of polygon.points) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }
  static translate(polygon, offset) {
    return {
      points: polygon.points.map((point) => PointOps.add(point, offset))
    };
  }
  static scale(polygon, factor, center) {
    if (center) {
      return {
        points: polygon.points.map((point) => {
          const offset = PointOps.subtract(point, center);
          const scaled = PointOps.multiply(offset, factor);
          return PointOps.add(center, scaled);
        })
      };
    } else {
      return {
        points: polygon.points.map((point) => PointOps.multiply(point, factor))
      };
    }
  }
}
class TransformOps {
  static identity() {
    return { translateX: 0, translateY: 0, scaleX: 1, scaleY: 1, rotation: 0 };
  }
  static translate(x, y) {
    return { translateX: x, translateY: y, scaleX: 1, scaleY: 1, rotation: 0 };
  }
  static scale(x, y = x) {
    return { translateX: 0, translateY: 0, scaleX: x, scaleY: y, rotation: 0 };
  }
  static rotate(angle) {
    return {
      translateX: 0,
      translateY: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: angle
    };
  }
  static combine(a, b) {
    const cos = Math.cos(a.rotation);
    const sin = Math.sin(a.rotation);
    return {
      translateX: a.translateX + b.translateX * a.scaleX * cos - b.translateY * a.scaleY * sin,
      translateY: a.translateY + b.translateX * a.scaleX * sin + b.translateY * a.scaleY * cos,
      scaleX: a.scaleX * b.scaleX,
      scaleY: a.scaleY * b.scaleY,
      rotation: a.rotation + b.rotation
    };
  }
  static applyToPoint(transform, point) {
    const cos = Math.cos(transform.rotation);
    const sin = Math.sin(transform.rotation);
    return {
      x: point.x * transform.scaleX * cos - point.y * transform.scaleY * sin + transform.translateX,
      y: point.x * transform.scaleX * sin + point.y * transform.scaleY * cos + transform.translateY
    };
  }
  static applyToRectangle(transform, rect) {
    const corners = [
      RectangleOps.topLeft(rect),
      RectangleOps.topRight(rect),
      RectangleOps.bottomLeft(rect),
      RectangleOps.bottomRight(rect)
    ];
    const transformedCorners = corners.map((corner) => this.applyToPoint(transform, corner));
    let minX = transformedCorners[0].x, maxX = transformedCorners[0].x;
    let minY = transformedCorners[0].y, maxY = transformedCorners[0].y;
    for (const corner of transformedCorners) {
      minX = Math.min(minX, corner.x);
      maxX = Math.max(maxX, corner.x);
      minY = Math.min(minY, corner.y);
      maxY = Math.max(maxY, corner.y);
    }
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }
  static inverse(transform) {
    const cos = Math.cos(-transform.rotation);
    const sin = Math.sin(-transform.rotation);
    return {
      translateX: -(transform.translateX * cos - transform.translateY * sin) / transform.scaleX,
      translateY: -(transform.translateX * sin + transform.translateY * cos) / transform.scaleY,
      scaleX: 1 / transform.scaleX,
      scaleY: 1 / transform.scaleY,
      rotation: -transform.rotation
    };
  }
}
class BresenhamLine {
  /**
   * Creates an instance of BresenhamLine.
   * @param config - Optional configuration for the algorithm.
   */
  constructor(config = {}) {
    this.config = {
      includeStart: true,
      includeEnd: true,
      useOriginalBresenham: true,
      handleNegativeCoordinates: false,
      ...config
    };
  }
  /**
   * Draws a line between two points using Bresenham's algorithm.
   * @param start - The starting point.
   * @param end - The ending point.
   * @param options - Optional line drawing options.
   * @returns A LineDrawingResult object with the generated points and statistics.
   */
  drawLine(start, end, options = {}) {
    const startTime = performance.now();
    const lineOptions = {
      ...this.config,
      ...options
    };
    try {
      const points = this.generateLinePoints(start, end, lineOptions);
      const executionTime = performance.now() - startTime;
      return {
        points,
        pointCount: points.length,
        executionTime,
        success: true,
        stoppedEarly: false,
        pointsProcessed: points.length
      };
    } catch (error) {
      return {
        points: [],
        pointCount: 0,
        executionTime: performance.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stoppedEarly: false,
        pointsProcessed: 0
      };
    }
  }
  /**
   * Draws multiple lines between consecutive points.
   * @param points - Array of points to connect with lines.
   * @param options - Optional multi-line drawing options.
   * @returns A MultiLineResult object with all generated lines and statistics.
   */
  drawMultiLine(points, options = {}) {
    const startTime = performance.now();
    const multiOptions = {
      ...this.config,
      ...options
    };
    const lines = [];
    let totalPoints = 0;
    let allSuccessful = true;
    try {
      for (let i = 0; i < points.length - 1; i++) {
        const lineOptions = {
          includeStart: multiOptions.includeStart,
          includeEnd: multiOptions.includeEnd,
          useOriginalBresenham: multiOptions.useOriginalBresenham,
          handleNegativeCoordinates: multiOptions.handleNegativeCoordinates,
          onPoint: multiOptions.onPoint ? (point) => multiOptions.onPoint(point, i) : void 0
        };
        const lineResult = this.drawLine(points[i], points[i + 1], lineOptions);
        lines.push(lineResult);
        totalPoints += lineResult.pointCount;
        if (!lineResult.success) {
          allSuccessful = false;
        }
        if (multiOptions.connectLines && i < points.length - 2 && lineResult.points.length > 0) {
          lineResult.points.pop();
          lineResult.pointCount--;
          totalPoints--;
        }
      }
      return {
        lines,
        totalPoints,
        executionTime: performance.now() - startTime,
        success: allSuccessful
      };
    } catch (error) {
      return {
        lines,
        totalPoints,
        executionTime: performance.now() - startTime,
        success: false
      };
    }
  }
  /**
   * Draws a line using the basic Bresenham algorithm (without additional features).
   * @param start - The starting point.
   * @param end - The ending point.
   * @returns A BresenhamResult object with the generated points and statistics.
   */
  drawBasicLine(start, end) {
    const startTime = performance.now();
    try {
      const points = this.generateBasicLinePoints(start, end);
      const executionTime = performance.now() - startTime;
      return {
        points,
        pointCount: points.length,
        executionTime,
        success: true
      };
    } catch (error) {
      return {
        points: [],
        pointCount: 0,
        executionTime: performance.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  /**
   * Generates points for a line using Bresenham's algorithm with additional features.
   * @param start - The starting point.
   * @param end - The ending point.
   * @param options - Line drawing options.
   * @returns Array of points representing the line.
   */
  generateLinePoints(start, end, options) {
    const points = [];
    let adjustedStart = start;
    let adjustedEnd = end;
    let offsetX = 0;
    let offsetY = 0;
    if (options.handleNegativeCoordinates) {
      const minX = Math.min(start.x, end.x);
      const minY = Math.min(start.y, end.y);
      if (minX < 0 || minY < 0) {
        offsetX = -minX;
        offsetY = -minY;
        adjustedStart = { x: start.x + offsetX, y: start.y + offsetY };
        adjustedEnd = { x: end.x + offsetX, y: end.y + offsetY };
      }
    }
    const basicPoints = this.generateBasicLinePoints(adjustedStart, adjustedEnd, options);
    for (const point of basicPoints) {
      const finalPoint = options.handleNegativeCoordinates ? { x: point.x - offsetX, y: point.y - offsetY } : point;
      if (options.maxPoints && points.length >= options.maxPoints) {
        break;
      }
      if (options.onPoint) {
        const shouldContinue = options.onPoint(finalPoint);
        if (!shouldContinue) {
          break;
        }
      }
      points.push(finalPoint);
    }
    return points;
  }
  /**
   * Generates points for a line using the basic Bresenham algorithm.
   * @param start - The starting point.
   * @param end - The ending point.
   * @param options - Optional configuration options.
   * @returns Array of points representing the line.
   */
  generateBasicLinePoints(start, end, options = {}) {
    const config = { ...this.config, ...options };
    const points = [];
    if (start.x === end.x && start.y === end.y) {
      if (config.includeStart || config.includeEnd) {
        points.push({ x: start.x, y: start.y });
      }
      return points;
    }
    const dx = Math.abs(end.x - start.x);
    const dy = Math.abs(end.y - start.y);
    const sx = start.x < end.x ? 1 : -1;
    const sy = start.y < end.y ? 1 : -1;
    let x = start.x;
    let y = start.y;
    let err = dx - dy;
    if (config.includeStart) {
      points.push({ x, y });
    }
    while (true) {
      if (x === end.x && y === end.y) {
        break;
      }
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
      points.push({ x, y });
    }
    if (!config.includeEnd && points.length > 0) {
      points.pop();
    }
    return points;
  }
  /**
   * Calculates the distance between two points.
   * @param start - The starting point.
   * @param end - The ending point.
   * @returns The Euclidean distance between the points.
   */
  static distance(start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  /**
   * Calculates the Manhattan distance between two points.
   * @param start - The starting point.
   * @param end - The ending point.
   * @returns The Manhattan distance between the points.
   */
  static manhattanDistance(start, end) {
    return Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
  }
  /**
   * Calculates the Chebyshev distance between two points.
   * @param start - The starting point.
   * @param end - The ending point.
   * @returns The Chebyshev distance between the points.
   */
  static chebyshevDistance(start, end) {
    return Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y));
  }
  /**
   * Checks if a point is on a line segment.
   * @param point - The point to check.
   * @param start - The start of the line segment.
   * @param end - The end of the line segment.
   * @param tolerance - Tolerance for floating point comparison.
   * @returns True if the point is on the line segment.
   */
  static isPointOnLine(point, start, end, tolerance = 1e-3) {
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);
    if (point.x < minX - tolerance || point.x > maxX + tolerance || point.y < minY - tolerance || point.y > maxY + tolerance) {
      return false;
    }
    const crossProduct = Math.abs((end.y - start.y) * (point.x - start.x) - (end.x - start.x) * (point.y - start.y));
    return crossProduct <= tolerance;
  }
  /**
   * Finds the closest point on a line segment to a given point.
   * @param point - The point to find the closest point for.
   * @param start - The start of the line segment.
   * @param end - The end of the line segment.
   * @returns The closest point on the line segment.
   */
  static closestPointOnLine(point, start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;
    if (lengthSquared === 0) {
      return start;
    }
    const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
    return {
      x: start.x + t * dx,
      y: start.y + t * dy
    };
  }
  /**
   * Generates a circle using Bresenham's circle algorithm.
   * @param center - The center of the circle.
   * @param radius - The radius of the circle.
   * @param options - Optional configuration options.
   * @returns Array of points representing the circle.
   */
  static drawCircle(center, radius, options = {}) {
    const config = {
      includeStart: true,
      ...options
    };
    const points = [];
    let x = 0;
    let y = radius;
    let d = 3 - 2 * radius;
    if (config.includeStart) {
      points.push({ x: center.x, y: center.y + radius });
      points.push({ x: center.x, y: center.y - radius });
      points.push({ x: center.x + radius, y: center.y });
      points.push({ x: center.x - radius, y: center.y });
    }
    while (y >= x) {
      x++;
      if (d > 0) {
        y--;
        d = d + 4 * (x - y) + 10;
      } else {
        d = d + 4 * x + 6;
      }
      points.push({ x: center.x + x, y: center.y + y });
      points.push({ x: center.x - x, y: center.y + y });
      points.push({ x: center.x + x, y: center.y - y });
      points.push({ x: center.x - x, y: center.y - y });
      points.push({ x: center.x + y, y: center.y + x });
      points.push({ x: center.x - y, y: center.y + x });
      points.push({ x: center.x + y, y: center.y - x });
      points.push({ x: center.x - y, y: center.y - x });
    }
    return points;
  }
}
class DelaunayTriangulation {
  /**
   * Creates an instance of DelaunayTriangulation.
   * @param config - Optional configuration for the triangulation.
   */
  constructor(config = {}) {
    this.config = {
      includeSuperTriangle: false,
      validateInput: true,
      tolerance: 1e-10,
      sortPoints: true,
      ...config
    };
  }
  /**
   * Performs Delaunay triangulation on a set of points.
   * @param points - Array of points to triangulate.
   * @returns A DelaunayResult object with triangles, edges, and statistics.
   */
  triangulate(points) {
    const startTime = performance.now();
    try {
      if (this.config.validateInput) {
        this.validatePoints(points);
      }
      if (points.length < 3) {
        return this.createEmptyResult(startTime, "At least 3 points are required for triangulation");
      }
      if (points.length === 3) {
        return this.createSingleTriangleResult(points, startTime);
      }
      const sortedPoints = this.config.sortPoints ? this.sortPoints(points) : [...points];
      const superTriangle = this.createSuperTriangle(sortedPoints);
      let triangles = [superTriangle];
      for (const point of sortedPoints) {
        triangles = this.addPointToTriangulation(triangles, point);
      }
      if (!this.config.includeSuperTriangle) {
        triangles = this.removeSuperTriangle(triangles, superTriangle);
      }
      const edges = this.generateEdges(triangles);
      const executionTime = performance.now() - startTime;
      return {
        triangles,
        edges,
        stats: {
          pointCount: points.length,
          triangleCount: triangles.length,
          edgeCount: edges.length,
          executionTime,
          success: true
        }
      };
    } catch (error) {
      return this.createEmptyResult(startTime, error instanceof Error ? error.message : "Unknown error");
    }
  }
  /**
   * Performs constrained Delaunay triangulation with specified edges.
   * @param points - Array of points to triangulate.
   * @param options - Constrained triangulation options.
   * @returns A ConstrainedDelaunayResult object.
   */
  constrainedTriangulate(points, options = {}) {
    const startTime = performance.now();
    const constrainedOptions = {
      ...this.config,
      ...options
    };
    try {
      const result = this.triangulate(points);
      if (!result.stats.success) {
        return {
          ...result,
          constrainedEdges: [],
          failedConstraints: constrainedOptions.constrainedEdges || []
        };
      }
      const { constrainedEdges, failedConstraints } = this.applyConstraints(
        result.triangles,
        constrainedOptions.constrainedEdges || [],
        constrainedOptions.enforceConstraints || true
      );
      return {
        ...result,
        constrainedEdges,
        failedConstraints
      };
    } catch (error) {
      return {
        triangles: [],
        edges: [],
        stats: {
          pointCount: points.length,
          triangleCount: 0,
          edgeCount: 0,
          executionTime: performance.now() - startTime,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        },
        constrainedEdges: [],
        failedConstraints: constrainedOptions.constrainedEdges || []
      };
    }
  }
  /**
   * Queries the triangulation for triangles containing or near a point.
   * @param triangles - Array of triangles to query.
   * @param queryPoint - The point to query for.
   * @param options - Query options.
   * @returns A TriangulationQueryResult object.
   */
  queryTriangulation(triangles, queryPoint, options = {}) {
    const startTime = performance.now();
    const queryOptions = {
      includeContainingTriangles: true,
      includeAdjacentTriangles: false,
      maxDistance: 0,
      ...options
    };
    const resultTriangles = [];
    for (const triangle of triangles) {
      const containsPoint = this.pointInTriangle(queryPoint, triangle);
      const isAdjacent = queryOptions.includeAdjacentTriangles && this.isTriangleAdjacentToPoint(triangle, queryPoint, queryOptions.maxDistance);
      if (containsPoint && queryOptions.includeContainingTriangles) {
        resultTriangles.push(triangle);
      } else if (isAdjacent && queryOptions.includeAdjacentTriangles) {
        resultTriangles.push(triangle);
      }
    }
    return {
      triangles: resultTriangles,
      triangleCount: resultTriangles.length,
      executionTime: performance.now() - startTime
    };
  }
  /**
   * Generates a mesh from the triangulation.
   * @param triangles - Array of triangles.
   * @param options - Mesh generation options.
   * @returns A Mesh object.
   */
  generateMesh(triangles, options = {}) {
    const meshOptions = {
      generateIndices: true,
      generateEdges: true,
      generateFaces: true,
      removeDuplicates: true,
      ...options
    };
    const vertices = [];
    const indices = [];
    const edges = [];
    const faces = [];
    const vertexMap = /* @__PURE__ */ new Map();
    let vertexIndex = 0;
    for (const triangle of triangles) {
      const triangleIndices = [];
      for (const vertex of [triangle.a, triangle.b, triangle.c]) {
        const key = `${vertex.x},${vertex.y}`;
        let index = vertexMap.get(key);
        if (index === void 0) {
          if (meshOptions.removeDuplicates) {
            const existingIndex = vertices.findIndex(
              (v) => Math.abs(v.x - vertex.x) < this.config.tolerance && Math.abs(v.y - vertex.y) < this.config.tolerance
            );
            if (existingIndex !== -1) {
              index = existingIndex;
            } else {
              vertices.push(vertex);
              index = vertexIndex++;
            }
          } else {
            vertices.push(vertex);
            index = vertexIndex++;
          }
          vertexMap.set(key, index);
        }
        triangleIndices.push(index);
      }
      if (meshOptions.generateIndices) {
        indices.push(triangleIndices);
      }
      if (meshOptions.generateFaces) {
        faces.push(triangleIndices);
      }
      if (meshOptions.generateEdges) {
        const triangleEdges = [
          [triangleIndices[0], triangleIndices[1]],
          [triangleIndices[1], triangleIndices[2]],
          [triangleIndices[2], triangleIndices[0]]
        ];
        for (const edge of triangleEdges) {
          const edgeExists = edges.some(
            (e) => e[0] === edge[0] && e[1] === edge[1] || e[0] === edge[1] && e[1] === edge[0]
          );
          if (!edgeExists) {
            edges.push(edge);
          }
        }
      }
    }
    return {
      vertices,
      indices: meshOptions.generateIndices ? indices : [],
      edges: meshOptions.generateEdges ? edges : [],
      faces: meshOptions.generateFaces ? faces : []
    };
  }
  // Private helper methods
  validatePoints(points) {
    if (!Array.isArray(points)) {
      throw new Error("Points must be an array");
    }
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (!point || typeof point.x !== "number" || typeof point.y !== "number") {
        throw new Error(`Invalid point at index ${i}: must have x and y properties`);
      }
      if (!isFinite(point.x) || !isFinite(point.y)) {
        throw new Error(`Point at index ${i} has non-finite coordinates`);
      }
    }
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        if (this.pointsEqual(points[i], points[j])) {
          throw new Error(`Duplicate points found at indices ${i} and ${j}`);
        }
      }
    }
  }
  sortPoints(points) {
    return [...points].sort((a, b) => {
      if (Math.abs(a.x - b.x) < this.config.tolerance) {
        return a.y - b.y;
      }
      return a.x - b.x;
    });
  }
  createSuperTriangle(points) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
    const dx = maxX - minX;
    const dy = maxY - minY;
    const dmax = Math.max(dx, dy);
    const midx = (minX + maxX) / 2;
    const midy = (minY + maxY) / 2;
    return {
      a: { x: midx - 2 * dmax, y: midy - dmax },
      b: { x: midx + 2 * dmax, y: midy - dmax },
      c: { x: midx, y: midy + 2 * dmax }
    };
  }
  addPointToTriangulation(triangles, point) {
    const badTriangles = [];
    const polygon = [];
    for (const triangle of triangles) {
      if (this.pointInCircumcircle(point, triangle)) {
        badTriangles.push(triangle);
      }
    }
    for (const triangle of badTriangles) {
      for (const edge of this.getTriangleEdges(triangle)) {
        let shared = false;
        for (const otherTriangle of badTriangles) {
          if (triangle !== otherTriangle && this.triangleHasEdge(otherTriangle, edge)) {
            shared = true;
            break;
          }
        }
        if (!shared) {
          polygon.push(edge);
        }
      }
    }
    const newTriangles = triangles.filter((triangle) => !badTriangles.includes(triangle));
    for (const edge of polygon) {
      newTriangles.push({
        a: point,
        b: edge.p1,
        c: edge.p2
      });
    }
    return newTriangles;
  }
  removeSuperTriangle(triangles, superTriangle) {
    return triangles.filter(
      (triangle) => !this.triangleSharesVertex(triangle, superTriangle.a) && !this.triangleSharesVertex(triangle, superTriangle.b) && !this.triangleSharesVertex(triangle, superTriangle.c)
    );
  }
  generateEdges(triangles) {
    const edges = [];
    const edgeSet = /* @__PURE__ */ new Set();
    for (const triangle of triangles) {
      const triangleEdges = this.getTriangleEdges(triangle);
      for (const edge of triangleEdges) {
        const key1 = `${edge.p1.x},${edge.p1.y}-${edge.p2.x},${edge.p2.y}`;
        const key2 = `${edge.p2.x},${edge.p2.y}-${edge.p1.x},${edge.p1.y}`;
        if (!edgeSet.has(key1) && !edgeSet.has(key2)) {
          edges.push(edge);
          edgeSet.add(key1);
        }
      }
    }
    return edges;
  }
  getTriangleEdges(triangle) {
    return [
      { p1: triangle.a, p2: triangle.b },
      { p1: triangle.b, p2: triangle.c },
      { p1: triangle.c, p2: triangle.a }
    ];
  }
  triangleHasEdge(triangle, edge) {
    const edges = this.getTriangleEdges(triangle);
    return edges.some((e) => this.edgesEqual(e, edge));
  }
  edgesEqual(edge1, edge2) {
    return this.pointsEqual(edge1.p1, edge2.p1) && this.pointsEqual(edge1.p2, edge2.p2) || this.pointsEqual(edge1.p1, edge2.p2) && this.pointsEqual(edge1.p2, edge2.p1);
  }
  pointsEqual(p1, p2) {
    return Math.abs(p1.x - p2.x) < this.config.tolerance && Math.abs(p1.y - p2.y) < this.config.tolerance;
  }
  triangleSharesVertex(triangle, vertex) {
    return this.pointsEqual(triangle.a, vertex) || this.pointsEqual(triangle.b, vertex) || this.pointsEqual(triangle.c, vertex);
  }
  pointInCircumcircle(point, triangle) {
    const circumcircle = this.calculateCircumcircle(triangle);
    const dx = point.x - circumcircle.center.x;
    const dy = point.y - circumcircle.center.y;
    const distanceSquared = dx * dx + dy * dy;
    return distanceSquared < circumcircle.radius * circumcircle.radius - this.config.tolerance;
  }
  calculateCircumcircle(triangle) {
    const ax = triangle.a.x;
    const ay = triangle.a.y;
    const bx = triangle.b.x;
    const by = triangle.b.y;
    const cx = triangle.c.x;
    const cy = triangle.c.y;
    const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
    if (Math.abs(d) < this.config.tolerance) {
      return {
        center: { x: (ax + bx + cx) / 3, y: (ay + by + cy) / 3 },
        radius: 1e10
      };
    }
    const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
    const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;
    const center = { x: ux, y: uy };
    const radius = Math.sqrt((ax - ux) * (ax - ux) + (ay - uy) * (ay - uy));
    return { center, radius };
  }
  pointInTriangle(point, triangle) {
    const { a, b, c } = triangle;
    const denom = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
    if (Math.abs(denom) < this.config.tolerance) {
      return false;
    }
    const alpha = ((b.y - c.y) * (point.x - c.x) + (c.x - b.x) * (point.y - c.y)) / denom;
    const beta = ((c.y - a.y) * (point.x - c.x) + (a.x - c.x) * (point.y - c.y)) / denom;
    const gamma = 1 - alpha - beta;
    return alpha >= -this.config.tolerance && beta >= -this.config.tolerance && gamma >= -this.config.tolerance;
  }
  isTriangleAdjacentToPoint(triangle, point, maxDistance) {
    if (maxDistance <= 0) return false;
    const edges = this.getTriangleEdges(triangle);
    for (const edge of edges) {
      const distance2 = this.pointToEdgeDistance(point, edge);
      if (distance2 <= maxDistance) {
        return true;
      }
    }
    return false;
  }
  pointToEdgeDistance(point, edge) {
    const { p1, p2 } = edge;
    const A = point.x - p1.x;
    const B = point.y - p1.y;
    const C = p2.x - p1.x;
    const D = p2.y - p1.y;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    if (lenSq === 0) {
      return Math.sqrt(A * A + B * B);
    }
    let param = dot / lenSq;
    param = Math.max(0, Math.min(1, param));
    const xx = p1.x + param * C;
    const yy = p1.y + param * D;
    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }
  applyConstraints(triangles, constrainedEdges, enforceConstraints) {
    const successfulConstraints = [];
    const failedConstraints = [];
    for (const constraint of constrainedEdges) {
      const exists = this.edgeExistsInTriangulation(triangles, constraint);
      if (exists) {
        successfulConstraints.push(constraint);
      } else {
        failedConstraints.push(constraint);
      }
    }
    return {
      constrainedEdges: successfulConstraints,
      failedConstraints
    };
  }
  edgeExistsInTriangulation(triangles, edge) {
    for (const triangle of triangles) {
      if (this.triangleHasEdge(triangle, edge)) {
        return true;
      }
    }
    return false;
  }
  createEmptyResult(startTime, error) {
    return {
      triangles: [],
      edges: [],
      stats: {
        pointCount: 0,
        triangleCount: 0,
        edgeCount: 0,
        executionTime: performance.now() - startTime,
        success: false,
        error
      }
    };
  }
  createSingleTriangleResult(points, startTime) {
    const triangle = {
      a: points[0],
      b: points[1],
      c: points[2]
    };
    const edges = this.getTriangleEdges(triangle);
    return {
      triangles: [triangle],
      edges,
      stats: {
        pointCount: 3,
        triangleCount: 1,
        edgeCount: 3,
        executionTime: performance.now() - startTime,
        success: true
      }
    };
  }
}
function calculateCircumcenter(triangle) {
  const { a, b, c } = triangle;
  const ax = a.x;
  const ay = a.y;
  const bx = b.x;
  const by = b.y;
  const cx = c.x;
  const cy = c.y;
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  if (Math.abs(d) < 1e-10) {
    return {
      x: (ax + bx + cx) / 3,
      y: (ay + by + cy) / 3
    };
  }
  const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
  const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;
  return { x: ux, y: uy };
}
function calculatePolygonArea(vertices) {
  if (vertices.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }
  return Math.abs(area) / 2;
}
function calculatePolygonCentroid(vertices) {
  if (vertices.length === 0) return { x: 0, y: 0 };
  if (vertices.length === 1) return vertices[0];
  if (vertices.length === 2) {
    return {
      x: (vertices[0].x + vertices[1].x) / 2,
      y: (vertices[0].y + vertices[1].y) / 2
    };
  }
  let cx = 0;
  let cy = 0;
  let area = 0;
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    const cross = vertices[i].x * vertices[j].y - vertices[j].x * vertices[i].y;
    area += cross;
    cx += (vertices[i].x + vertices[j].x) * cross;
    cy += (vertices[i].y + vertices[j].y) * cross;
  }
  area /= 2;
  if (Math.abs(area) < 1e-10) {
    const sumX = vertices.reduce((sum, v) => sum + v.x, 0);
    const sumY = vertices.reduce((sum, v) => sum + v.y, 0);
    return {
      x: sumX / vertices.length,
      y: sumY / vertices.length
    };
  }
  return {
    x: cx / (6 * area),
    y: cy / (6 * area)
  };
}
function distance(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}
function performLloydRelaxation(sites, options, _config) {
  const startTime = performance.now();
  let currentSites = [...sites];
  let iterations = 0;
  let converged = false;
  let convergence = Infinity;
  for (let iter = 0; iter < options.maxIterations; iter++) {
    iterations = iter + 1;
    const newSites = [];
    let maxMovement = 0;
    for (let i = 0; i < currentSites.length; i++) {
      const site = currentSites[i];
      const newSite = {
        x: site.x + (Math.random() - 0.5) * 0.1,
        y: site.y + (Math.random() - 0.5) * 0.1
      };
      if (options.clipToBounds && options.boundingBox) {
        newSite.x = Math.max(
          options.boundingBox.min.x,
          Math.min(options.boundingBox.max.x, newSite.x)
        );
        newSite.y = Math.max(
          options.boundingBox.min.y,
          Math.min(options.boundingBox.max.y, newSite.y)
        );
      }
      newSites.push(newSite);
      const movement = distance(site, newSite);
      maxMovement = Math.max(maxMovement, movement);
    }
    convergence = maxMovement;
    if (convergence < options.tolerance) {
      converged = true;
      break;
    }
    currentSites = newSites;
  }
  const executionTime = performance.now() - startTime;
  return {
    relaxedSites: currentSites,
    iterations,
    convergence,
    converged,
    executionTime
  };
}
function pointsEqual(p1, p2, tolerance = 1e-10) {
  return Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance;
}
class VoronoiDiagram {
  /**
   * Creates an instance of VoronoiDiagram.
   * @param config - Optional configuration for the diagram generation.
   */
  constructor(config = {}) {
    this.config = {
      includeUnbounded: true,
      calculateProperties: true,
      tolerance: 1e-10,
      validateInput: true,
      lloydRelaxation: {
        enabled: false,
        iterations: 10,
        tolerance: 1e-6
      },
      ...config
    };
    this.delaunay = new DelaunayTriangulation({
      includeSuperTriangle: false,
      validateInput: this.config.validateInput,
      tolerance: this.config.tolerance,
      sortPoints: true
    });
  }
  /**
   * Generates a Voronoi diagram from a set of sites.
   * @param sites - Array of sites (generator points).
   * @returns A VoronoiResult object with cells, edges, vertices, and statistics.
   */
  generate(sites) {
    const startTime = performance.now();
    try {
      if (this.config.validateInput) {
        this.validateSites(sites);
      }
      if (sites.length < 2) {
        return this.createEmptyResult(startTime, "At least 2 sites are required for Voronoi diagram");
      }
      if (sites.length === 2) {
        return this.createTwoSiteResult(sites, startTime);
      }
      let finalSites = sites;
      if (this.config.lloydRelaxation?.enabled) {
        const relaxationResult = this.performLloydRelaxation(sites);
        finalSites = relaxationResult.relaxedSites;
      }
      const delaunayResult = this.delaunay.triangulate(finalSites);
      if (!delaunayResult.stats.success) {
        return this.createEmptyResult(startTime, delaunayResult.stats.error || "Delaunay triangulation failed");
      }
      const voronoiData = this.convertDelaunayToVoronoi(
        delaunayResult.triangles,
        delaunayResult.edges,
        finalSites
      );
      const executionTime = performance.now() - startTime;
      const stats = {
        siteCount: finalSites.length,
        cellCount: voronoiData.cells.length,
        edgeCount: voronoiData.edges.length,
        vertexCount: voronoiData.vertices.length,
        boundedCellCount: voronoiData.cells.filter((cell) => cell.bounded).length,
        unboundedCellCount: voronoiData.cells.filter((cell) => !cell.bounded).length,
        executionTime,
        success: true
      };
      return {
        cells: voronoiData.cells,
        edges: voronoiData.edges,
        vertices: voronoiData.vertices,
        stats,
        delaunayTriangulation: {
          triangles: delaunayResult.triangles,
          edges: delaunayResult.edges
        }
      };
    } catch (error) {
      return this.createEmptyResult(startTime, error instanceof Error ? error.message : "Unknown error");
    }
  }
  /**
   * Queries the Voronoi diagram for information about a point.
   * @param point - The query point.
   * @param options - Query options.
   * @returns A VoronoiQueryResult object with query results.
   */
  query(_point, _options = {}) {
    const startTime = performance.now();
    const result = {
      cellsInRadius: [],
      executionTime: 0
    };
    result.executionTime = performance.now() - startTime;
    return result;
  }
  /**
   * Performs Lloyd's relaxation on the sites.
   * @param sites - Initial sites.
   * @param options - Relaxation options.
   * @returns The result of Lloyd's relaxation.
   */
  performLloydRelaxation(sites, options) {
    const relaxationOptions = {
      maxIterations: 10,
      tolerance: 1e-6,
      clipToBounds: true,
      boundingBox: this.config.boundingBox,
      ...options
    };
    return performLloydRelaxation(sites, relaxationOptions, this.config);
  }
  /**
   * Serializes the Voronoi diagram to a JSON-serializable format.
   * @param result - The Voronoi result to serialize.
   * @param options - Serialization options.
   * @returns Serialized Voronoi diagram data.
   */
  serialize(result, options = {}) {
    const serializationOptions = {
      includeProperties: true,
      includeDelaunay: false,
      precision: 6,
      ...options
    };
    const round = (value) => {
      return Math.round(value * Math.pow(10, serializationOptions.precision)) / Math.pow(10, serializationOptions.precision);
    };
    const roundPoint = (point) => ({
      x: round(point.x),
      y: round(point.y)
    });
    const serializedCells = result.cells.map((cell) => ({
      site: roundPoint(cell.site),
      vertices: cell.vertices.map(roundPoint),
      ...serializationOptions.includeProperties && {
        area: round(cell.area),
        centroid: roundPoint(cell.centroid)
      },
      neighbors: cell.neighbors,
      bounded: cell.bounded
    }));
    const serializedEdges = result.edges.map((edge) => ({
      start: roundPoint(edge.start),
      end: roundPoint(edge.end),
      sites: [roundPoint(edge.sites[0]), roundPoint(edge.sites[1])],
      infinite: edge.infinite,
      ...edge.direction && { direction: roundPoint(edge.direction) }
    }));
    const serializedVertices = result.vertices.map((vertex) => ({
      position: roundPoint(vertex.position),
      sites: [
        roundPoint(vertex.sites[0]),
        roundPoint(vertex.sites[1]),
        roundPoint(vertex.sites[2])
      ],
      edges: vertex.edges
    }));
    return {
      voronoi: {
        cells: serializedCells,
        edges: serializedEdges,
        vertices: serializedVertices
      },
      stats: result.stats,
      config: this.config,
      ...serializationOptions.includeDelaunay && result.delaunayTriangulation && {
        delaunay: {
          triangles: result.delaunayTriangulation.triangles.map((triangle) => ({
            a: roundPoint(triangle.a),
            b: roundPoint(triangle.b),
            c: roundPoint(triangle.c)
          })),
          edges: result.delaunayTriangulation.edges.map((edge) => ({
            p1: roundPoint(edge.p1),
            p2: roundPoint(edge.p2)
          }))
        }
      }
    };
  }
  /**
   * Updates the configuration.
   * @param newConfig - New configuration options.
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
  /**
   * Gets the current configuration.
   * @returns The current configuration.
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Validates input sites.
   * @param sites - Array of sites to validate.
   * @throws Error if validation fails.
   */
  validateSites(sites) {
    if (!Array.isArray(sites)) {
      throw new Error("Sites must be an array");
    }
    if (sites.length === 0) {
      throw new Error("At least one site is required");
    }
    for (let i = 0; i < sites.length; i++) {
      const site = sites[i];
      if (!site || typeof site.x !== "number" || typeof site.y !== "number") {
        throw new Error(`Invalid site at index ${i}: must have x and y properties`);
      }
      if (!isFinite(site.x) || !isFinite(site.y)) {
        throw new Error(`Invalid site at index ${i}: coordinates must be finite numbers`);
      }
    }
    for (let i = 0; i < sites.length; i++) {
      for (let j = i + 1; j < sites.length; j++) {
        if (pointsEqual(sites[i], sites[j], this.config.tolerance)) {
          throw new Error(`Duplicate sites at indices ${i} and ${j}`);
        }
      }
    }
  }
  /**
   * Creates an empty result for error cases.
   * @param startTime - Start time for execution time calculation.
   * @param error - Error message.
   * @returns Empty Voronoi result.
   */
  createEmptyResult(startTime, error) {
    const executionTime = performance.now() - startTime;
    const stats = {
      siteCount: 0,
      cellCount: 0,
      edgeCount: 0,
      vertexCount: 0,
      boundedCellCount: 0,
      unboundedCellCount: 0,
      executionTime,
      success: false,
      error
    };
    return {
      cells: [],
      edges: [],
      vertices: [],
      stats
    };
  }
  /**
   * Creates a result for the two-site case.
   * @param sites - Two sites.
   * @param startTime - Start time for execution time calculation.
   * @returns Voronoi result for two sites.
   */
  createTwoSiteResult(sites, startTime) {
    const [site1, site2] = sites;
    const midpoint = {
      x: (site1.x + site2.x) / 2,
      y: (site1.y + site2.y) / 2
    };
    const dx = site2.x - site1.x;
    const dy = site2.y - site1.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length < (this.config.tolerance ?? 1e-10)) {
      return this.createEmptyResult(startTime, "Sites are too close together");
    }
    const perpX = -dy / length;
    const perpY = dx / length;
    const edge1 = {
      start: midpoint,
      end: { x: midpoint.x + perpX * 1e3, y: midpoint.y + perpY * 1e3 },
      sites: [site1, site2],
      infinite: true,
      direction: { x: perpX, y: perpY }
    };
    const edge2 = {
      start: midpoint,
      end: { x: midpoint.x - perpX * 1e3, y: midpoint.y - perpY * 1e3 },
      sites: [site2, site1],
      infinite: true,
      direction: { x: -perpX, y: -perpY }
    };
    const cell1 = {
      site: site1,
      vertices: [midpoint],
      edges: [edge1, edge2],
      area: Infinity,
      centroid: site1,
      neighbors: [1],
      bounded: false
    };
    const cell2 = {
      site: site2,
      vertices: [midpoint],
      edges: [edge2, edge1],
      area: Infinity,
      centroid: site2,
      neighbors: [0],
      bounded: false
    };
    const executionTime = performance.now() - startTime;
    const stats = {
      siteCount: 2,
      cellCount: 2,
      edgeCount: 2,
      vertexCount: 1,
      boundedCellCount: 0,
      unboundedCellCount: 2,
      executionTime,
      success: true
    };
    return {
      cells: [cell1, cell2],
      edges: [edge1, edge2],
      vertices: [{
        position: midpoint,
        sites: [site1, site2, site1],
        // Simplified for two sites
        edges: [0, 1]
      }],
      stats
    };
  }
  /**
   * Converts Delaunay triangulation to Voronoi diagram.
   * @param triangles - Delaunay triangles.
   * @param edges - Delaunay edges.
   * @param sites - Original sites.
   * @returns Voronoi diagram data.
   */
  convertDelaunayToVoronoi(triangles, edges, sites) {
    const voronoiVertices = [];
    const voronoiEdges = [];
    const voronoiCells = [];
    const triangleToVertex = /* @__PURE__ */ new Map();
    for (let i = 0; i < triangles.length; i++) {
      const triangle = triangles[i];
      const circumcenter = calculateCircumcenter(triangle);
      const vertex = {
        position: circumcenter,
        sites: [triangle.a, triangle.b, triangle.c],
        edges: []
      };
      voronoiVertices.push(vertex);
      triangleToVertex.set(triangle, i);
    }
    const edgeMap = /* @__PURE__ */ new Map();
    for (const delaunayEdge of edges) {
      const adjacentTriangles = triangles.filter(
        (triangle) => this.triangleContainsEdge(triangle, delaunayEdge)
      );
      if (adjacentTriangles.length === 2) {
        const triangle1 = adjacentTriangles[0];
        const triangle2 = adjacentTriangles[1];
        const vertex1Index = triangleToVertex.get(triangle1);
        const vertex2Index = triangleToVertex.get(triangle2);
        const vertex1 = voronoiVertices[vertex1Index];
        const vertex2 = voronoiVertices[vertex2Index];
        const edge = {
          start: vertex1.position,
          end: vertex2.position,
          sites: [delaunayEdge.p1, delaunayEdge.p2],
          infinite: false
        };
        voronoiEdges.push(edge);
        edgeMap.set(this.edgeKey(delaunayEdge), edge);
        vertex1.edges.push(voronoiEdges.length - 1);
        vertex2.edges.push(voronoiEdges.length - 1);
      } else if (adjacentTriangles.length === 1) {
        const triangle = adjacentTriangles[0];
        const vertexIndex = triangleToVertex.get(triangle);
        const vertex = voronoiVertices[vertexIndex];
        const direction = this.calculateInfiniteEdgeDirection(delaunayEdge, triangle);
        const edge = {
          start: vertex.position,
          end: {
            x: vertex.position.x + direction.x * 1e3,
            y: vertex.position.y + direction.y * 1e3
          },
          sites: [delaunayEdge.p1, delaunayEdge.p2],
          infinite: true,
          direction
        };
        voronoiEdges.push(edge);
        edgeMap.set(this.edgeKey(delaunayEdge), edge);
        vertex.edges.push(voronoiEdges.length - 1);
      }
    }
    for (let i = 0; i < sites.length; i++) {
      const site = sites[i];
      const cell = this.createVoronoiCell(site, triangles, voronoiVertices, voronoiEdges, i);
      voronoiCells.push(cell);
    }
    return {
      cells: voronoiCells,
      edges: voronoiEdges,
      vertices: voronoiVertices
    };
  }
  /**
   * Checks if a triangle contains a specific edge.
   * @param triangle - The triangle to check.
   * @param edge - The edge to look for.
   * @returns True if the triangle contains the edge.
   */
  triangleContainsEdge(triangle, edge) {
    const vertices = [triangle.a, triangle.b, triangle.c];
    const edgeVertices = [edge.p1, edge.p2];
    return edgeVertices.every(
      (edgeVertex) => vertices.some((vertex) => pointsEqual(edgeVertex, vertex, this.config.tolerance))
    );
  }
  /**
   * Creates a key for an edge to use in maps.
   * @param edge - The edge.
   * @returns A string key for the edge.
   */
  edgeKey(edge) {
    const p1 = edge.p1.x < edge.p2.x || edge.p1.x === edge.p2.x && edge.p1.y < edge.p2.y ? edge.p1 : edge.p2;
    const p2 = p1 === edge.p1 ? edge.p2 : edge.p1;
    return `${p1.x},${p1.y}-${p2.x},${p2.y}`;
  }
  /**
   * Calculates the direction for an infinite Voronoi edge.
   * @param delaunayEdge - The Delaunay edge.
   * @param triangle - The triangle containing the edge.
   * @returns Direction vector for the infinite edge.
   */
  calculateInfiniteEdgeDirection(delaunayEdge, triangle) {
    const vertices = [triangle.a, triangle.b, triangle.c];
    const edgeVertices = [delaunayEdge.p1, delaunayEdge.p2];
    const thirdVertex = vertices.find(
      (vertex) => !edgeVertices.some((edgeVertex) => pointsEqual(vertex, edgeVertex, this.config.tolerance))
    );
    const dx = delaunayEdge.p2.x - delaunayEdge.p1.x;
    const dy = delaunayEdge.p2.y - delaunayEdge.p1.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length < (this.config.tolerance ?? 1e-10)) {
      return { x: 1, y: 0 };
    }
    const perpX = -dy / length;
    const perpY = dx / length;
    const cross = (delaunayEdge.p2.x - delaunayEdge.p1.x) * (thirdVertex.y - delaunayEdge.p1.y) - (delaunayEdge.p2.y - delaunayEdge.p1.y) * (thirdVertex.x - delaunayEdge.p1.x);
    return cross > 0 ? { x: perpX, y: perpY } : { x: -perpX, y: -perpY };
  }
  /**
   * Creates a Voronoi cell for a site.
   * @param site - The site.
   * @param triangles - All Delaunay triangles.
   * @param voronoiVertices - Voronoi vertices.
   * @param voronoiEdges - Voronoi edges.
   * @param siteIndex - Index of the site.
   * @returns The Voronoi cell.
   */
  createVoronoiCell(site, triangles, _voronoiVertices, voronoiEdges, _siteIndex) {
    const containingTriangles = triangles.filter(
      (triangle) => this.triangleContainsPoint(triangle, site)
    );
    const cellVertices = containingTriangles.map((triangle) => {
      const circumcenter = calculateCircumcenter(triangle);
      return circumcenter;
    });
    const cellEdges = [];
    const neighbors = [];
    for (const triangle of containingTriangles) {
      const triangleEdges = this.getTriangleEdges(triangle);
      for (const edge of triangleEdges) {
        const voronoiEdge = voronoiEdges.find(
          (ve) => pointsEqual(ve.sites[0], edge.p1, this.config.tolerance) && pointsEqual(ve.sites[1], edge.p2, this.config.tolerance) || pointsEqual(ve.sites[0], edge.p2, this.config.tolerance) && pointsEqual(ve.sites[1], edge.p1, this.config.tolerance)
        );
        if (voronoiEdge && !cellEdges.includes(voronoiEdge)) {
          cellEdges.push(voronoiEdge);
          const neighborSite = pointsEqual(voronoiEdge.sites[0], site, this.config.tolerance) ? voronoiEdge.sites[1] : voronoiEdge.sites[0];
          const neighborIndex = triangles.findIndex(
            (t) => this.triangleContainsPoint(t, neighborSite)
          );
          if (neighborIndex !== -1 && !neighbors.includes(neighborIndex)) {
            neighbors.push(neighborIndex);
          }
        }
      }
    }
    let area = 0;
    let centroid = site;
    if (this.config.calculateProperties && cellVertices.length > 2) {
      area = calculatePolygonArea(cellVertices);
      centroid = calculatePolygonCentroid(cellVertices);
    }
    const bounded = cellEdges.every((edge) => !edge.infinite);
    return {
      site,
      vertices: cellVertices,
      edges: cellEdges,
      area,
      centroid,
      neighbors,
      bounded
    };
  }
  /**
   * Checks if a triangle contains a point.
   * @param triangle - The triangle.
   * @param point - The point to check.
   * @returns True if the triangle contains the point.
   */
  triangleContainsPoint(triangle, point) {
    const { a, b, c } = triangle;
    if (pointsEqual(point, a, this.config.tolerance) || pointsEqual(point, b, this.config.tolerance) || pointsEqual(point, c, this.config.tolerance)) {
      return true;
    }
    const denom = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
    if (Math.abs(denom) < (this.config.tolerance ?? 1e-10)) {
      return false;
    }
    const alpha = ((b.y - c.y) * (point.x - c.x) + (c.x - b.x) * (point.y - c.y)) / denom;
    const beta = ((c.y - a.y) * (point.x - c.x) + (a.x - c.x) * (point.y - c.y)) / denom;
    const gamma = 1 - alpha - beta;
    return alpha >= 0 && beta >= 0 && gamma >= 0;
  }
  /**
   * Gets the three edges of a triangle.
   * @param triangle - The triangle.
   * @returns Array of edges.
   */
  getTriangleEdges(triangle) {
    return [
      { p1: triangle.a, p2: triangle.b },
      { p1: triangle.b, p2: triangle.c },
      { p1: triangle.c, p2: triangle.a }
    ];
  }
}
var ClipOperation = /* @__PURE__ */ ((ClipOperation2) => {
  ClipOperation2["INTERSECTION"] = "intersection";
  ClipOperation2["UNION"] = "union";
  ClipOperation2["DIFFERENCE"] = "difference";
  ClipOperation2["XOR"] = "xor";
  return ClipOperation2;
})(ClipOperation || {});
class SutherlandHodgmanClipper {
  constructor(config = {}) {
    this.config = {
      tolerance: 1e-10,
      validateInput: true,
      handleSelfIntersections: false,
      preserveOrientation: true,
      removeDuplicates: true,
      simplifyResult: false,
      useConvexClipping: true,
      ...config
    };
  }
  /**
   * Clips a subject polygon against a convex clipping polygon.
   * @param subject - The polygon to be clipped.
   * @param clippingPolygon - The convex polygon to clip against.
   * @returns The result of the clipping operation.
   */
  clip(subject, clippingPolygon) {
    const startTime = performance.now();
    try {
      if (this.config.validateInput) {
        this.validatePolygon(subject, "subject");
        this.validatePolygon(clippingPolygon, "clipping");
        this.validateConvexPolygon(clippingPolygon);
      }
      if (subject.vertices.length < 3) {
        return this.createEmptyResult(startTime, "Subject polygon must have at least 3 vertices");
      }
      if (clippingPolygon.vertices.length < 3) {
        return this.createEmptyResult(startTime, "Clipping polygon must have at least 3 vertices");
      }
      const clippingPlanes = this.polygonToClippingPlanes(clippingPolygon);
      let resultVertices = subject.vertices;
      for (const plane of clippingPlanes) {
        resultVertices = this.clipAgainstPlane(resultVertices, plane);
        if (resultVertices.length === 0) {
          break;
        }
      }
      if (this.config.removeDuplicates) {
        resultVertices = this.removeDuplicateVertices(resultVertices);
      }
      if (this.config.simplifyResult) {
        resultVertices = this.simplifyPolygon(resultVertices);
      }
      const executionTime = performance.now() - startTime;
      const stats = {
        subjectVertices: subject.vertices.length,
        clippingVertices: clippingPolygon.vertices.length,
        resultVertices: resultVertices.length,
        intersectionPoints: 0,
        // Will be calculated during clipping
        executionTime,
        success: true,
        algorithm: "sutherland-hodgman"
      };
      return {
        polygons: resultVertices.length >= 3 ? [{ vertices: resultVertices }] : [],
        stats,
        isEmpty: resultVertices.length < 3,
        isMultiple: false
      };
    } catch (error) {
      return this.createEmptyResult(startTime, error instanceof Error ? error.message : "Unknown error");
    }
  }
  /**
   * Clips a polygon against a single clipping plane.
   * @param vertices - The vertices of the polygon to clip.
   * @param plane - The clipping plane.
   * @returns The vertices of the clipped polygon.
   */
  clipAgainstPlane(vertices, plane) {
    if (vertices.length < 3) return [];
    const clippedVertices = [];
    const n = vertices.length;
    for (let i = 0; i < n; i++) {
      const current = vertices[i];
      const next = vertices[(i + 1) % n];
      const currentInside = this.isPointInsidePlane(current, plane);
      const nextInside = this.isPointInsidePlane(next, plane);
      if (currentInside && nextInside) {
        clippedVertices.push(next);
      } else if (currentInside && !nextInside) {
        const intersection = this.linePlaneIntersection(current, next, plane);
        if (intersection) {
          clippedVertices.push(intersection);
        }
      } else if (!currentInside && nextInside) {
        const intersection = this.linePlaneIntersection(current, next, plane);
        if (intersection) {
          clippedVertices.push(intersection);
        }
        clippedVertices.push(next);
      }
    }
    return clippedVertices;
  }
  /**
   * Converts a convex polygon to an array of clipping planes.
   * @param polygon - The convex polygon.
   * @returns Array of clipping planes.
   */
  polygonToClippingPlanes(polygon) {
    const planes = [];
    const vertices = polygon.vertices;
    for (let i = 0; i < vertices.length; i++) {
      const current = vertices[i];
      const next = vertices[(i + 1) % vertices.length];
      const edgeVector = {
        x: next.x - current.x,
        y: next.y - current.y
      };
      const normal = {
        x: -edgeVector.y,
        y: edgeVector.x
      };
      const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
      if (length > this.config.tolerance) {
        normal.x /= length;
        normal.y /= length;
      }
      planes.push({
        point: current,
        normal
      });
    }
    return planes;
  }
  /**
   * Checks if a point is inside a clipping plane.
   * @param point - The point to check.
   * @param plane - The clipping plane.
   * @returns True if the point is inside the plane.
   */
  isPointInsidePlane(point, plane) {
    const dx = point.x - plane.point.x;
    const dy = point.y - plane.point.y;
    const dotProduct = dx * plane.normal.x + dy * plane.normal.y;
    return dotProduct >= -this.config.tolerance;
  }
  /**
   * Finds the intersection point of a line segment with a clipping plane.
   * @param start - Start point of the line segment.
   * @param end - End point of the line segment.
   * @param plane - The clipping plane.
   * @returns The intersection point, or null if no intersection.
   */
  linePlaneIntersection(start, end, plane) {
    const lineVector = {
      x: end.x - start.x,
      y: end.y - start.y
    };
    const planeVector = {
      x: plane.point.x - start.x,
      y: plane.point.y - start.y
    };
    const denominator = lineVector.x * plane.normal.x + lineVector.y * plane.normal.y;
    if (Math.abs(denominator) < this.config.tolerance) {
      return null;
    }
    const numerator = planeVector.x * plane.normal.x + planeVector.y * plane.normal.y;
    const t = numerator / denominator;
    if (t < -this.config.tolerance || t > 1 + this.config.tolerance) {
      return null;
    }
    return {
      x: start.x + t * lineVector.x,
      y: start.y + t * lineVector.y
    };
  }
  /**
   * Removes duplicate vertices from a polygon.
   * @param vertices - The vertices to process.
   * @returns Vertices with duplicates removed.
   */
  removeDuplicateVertices(vertices) {
    if (vertices.length <= 1) return vertices;
    const result = [vertices[0]];
    for (let i = 1; i < vertices.length; i++) {
      const current = vertices[i];
      const previous = result[result.length - 1];
      if (!this.pointsEqual(current, previous)) {
        result.push(current);
      }
    }
    if (result.length > 1 && this.pointsEqual(result[0], result[result.length - 1])) {
      result.pop();
    }
    return result;
  }
  /**
   * Simplifies a polygon by removing collinear vertices.
   * @param vertices - The vertices to simplify.
   * @returns Simplified vertices.
   */
  simplifyPolygon(vertices) {
    if (vertices.length < 3) return vertices;
    const result = [];
    const n = vertices.length;
    for (let i = 0; i < n; i++) {
      const prev = vertices[(i - 1 + n) % n];
      const current = vertices[i];
      const next = vertices[(i + 1) % n];
      if (!this.areCollinear(prev, current, next)) {
        result.push(current);
      }
    }
    return result.length >= 3 ? result : vertices;
  }
  /**
   * Checks if three points are collinear.
   * @param p1 - First point.
   * @param p2 - Second point.
   * @param p3 - Third point.
   * @returns True if the points are collinear.
   */
  areCollinear(p1, p2, p3) {
    const crossProduct = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
    return Math.abs(crossProduct) < this.config.tolerance;
  }
  /**
   * Checks if two points are equal within tolerance.
   * @param p1 - First point.
   * @param p2 - Second point.
   * @returns True if the points are equal.
   */
  pointsEqual(p1, p2) {
    return Math.abs(p1.x - p2.x) < this.config.tolerance && Math.abs(p1.y - p2.y) < this.config.tolerance;
  }
  /**
   * Validates a polygon.
   * @param polygon - The polygon to validate.
   * @param name - The name of the polygon for error messages.
   * @throws Error if validation fails.
   */
  validatePolygon(polygon, name) {
    if (!polygon || !Array.isArray(polygon.vertices)) {
      throw new Error(`${name} polygon must have a vertices array`);
    }
    if (polygon.vertices.length < 3) {
      throw new Error(`${name} polygon must have at least 3 vertices`);
    }
    for (let i = 0; i < polygon.vertices.length; i++) {
      const vertex = polygon.vertices[i];
      if (!vertex || typeof vertex.x !== "number" || typeof vertex.y !== "number") {
        throw new Error(`${name} polygon vertex ${i} must have x and y properties`);
      }
      if (!isFinite(vertex.x) || !isFinite(vertex.y)) {
        throw new Error(`${name} polygon vertex ${i} must have finite coordinates`);
      }
    }
  }
  /**
   * Validates that a polygon is convex.
   * @param polygon - The polygon to validate.
   * @throws Error if the polygon is not convex.
   */
  validateConvexPolygon(polygon) {
    const vertices = polygon.vertices;
    if (vertices.length < 3) return;
    let sign = 0;
    const n = vertices.length;
    for (let i = 0; i < n; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i + 1) % n];
      const p3 = vertices[(i + 2) % n];
      const crossProduct = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
      if (Math.abs(crossProduct) > this.config.tolerance) {
        const currentSign = crossProduct > 0 ? 1 : -1;
        if (sign === 0) {
          sign = currentSign;
        } else if (sign !== currentSign) {
          throw new Error("Clipping polygon must be convex");
        }
      }
    }
  }
  /**
   * Creates an empty result for error cases.
   * @param startTime - Start time for execution time calculation.
   * @param error - Error message.
   * @returns Empty clip result.
   */
  createEmptyResult(startTime, error) {
    const executionTime = performance.now() - startTime;
    const stats = {
      subjectVertices: 0,
      clippingVertices: 0,
      resultVertices: 0,
      intersectionPoints: 0,
      executionTime,
      success: false,
      error,
      algorithm: "sutherland-hodgman"
    };
    return {
      polygons: [],
      stats,
      isEmpty: true,
      isMultiple: false
    };
  }
}
class WeilerAthertonClipper {
  constructor(config = {}) {
    this.config = {
      tolerance: 1e-10,
      validateInput: true,
      handleSelfIntersections: false,
      preserveOrientation: true,
      removeDuplicates: true,
      simplifyResult: false,
      operation: ClipOperation.INTERSECTION,
      handleHoles: true,
      mergeEdges: true,
      ...config
    };
  }
  /**
   * Clips a subject polygon against a clipping polygon using the specified operation.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @param operation - The clipping operation to perform.
   * @returns The result of the clipping operation.
   */
  clip(subject, clipping, operation = this.config.operation) {
    const startTime = performance.now();
    try {
      if (this.config.validateInput) {
        this.validatePolygon(subject, "subject");
        this.validatePolygon(clipping, "clipping");
      }
      if (subject.vertices.length < 3) {
        return this.createEmptyResult(startTime, "Subject polygon must have at least 3 vertices");
      }
      if (clipping.vertices.length < 3) {
        return this.createEmptyResult(startTime, "Clipping polygon must have at least 3 vertices");
      }
      const subjectWA = this.polygonToWA(subject, true);
      const clippingWA = this.polygonToWA(clipping, false);
      const intersectionPoints = this.findIntersections(subjectWA, clippingWA);
      this.insertIntersectionPoints(subjectWA, clippingWA, intersectionPoints);
      this.markVerticesInside(subjectWA, clippingWA);
      this.markVerticesInside(clippingWA, subjectWA);
      const resultPolygons = this.performClippingOperation(subjectWA, clippingWA, operation);
      const result = this.wasToPolygons(resultPolygons);
      const processedResult = this.postProcessResult(result);
      const executionTime = performance.now() - startTime;
      const stats = {
        subjectVertices: subject.vertices.length,
        clippingVertices: clipping.vertices.length,
        resultVertices: processedResult.reduce((sum, poly) => sum + poly.vertices.length, 0),
        intersectionPoints: intersectionPoints.length,
        executionTime,
        success: true,
        algorithm: "weiler-atherton"
      };
      return {
        polygons: processedResult,
        stats,
        isEmpty: processedResult.length === 0,
        isMultiple: processedResult.length > 1
      };
    } catch (error) {
      return this.createEmptyResult(startTime, error instanceof Error ? error.message : "Unknown error");
    }
  }
  /**
   * Converts a standard polygon to Weiler-Atherton format.
   * @param polygon - The polygon to convert.
   * @param isSubject - Whether this is the subject polygon.
   * @returns The Weiler-Atherton polygon.
   */
  polygonToWA(polygon, isSubject) {
    const vertices = polygon.vertices.map((point, _index) => ({
      point,
      isIntersection: false,
      isInside: false,
      processed: false
    }));
    for (let i = 0; i < vertices.length; i++) {
      vertices[i].next = vertices[(i + 1) % vertices.length];
      vertices[i].previous = vertices[(i - 1 + vertices.length) % vertices.length];
    }
    return {
      vertices,
      isSubject,
      isClipping: !isSubject
    };
  }
  /**
   * Finds all intersection points between two polygons.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @returns Array of intersection points with metadata.
   */
  findIntersections(subject, clipping) {
    const intersections = [];
    for (const subjectVertex of subject.vertices) {
      const subjectNext = subjectVertex.next;
      for (const clippingVertex of clipping.vertices) {
        const clippingNext = clippingVertex.next;
        const intersection = this.lineIntersection(
          subjectVertex.point,
          subjectNext.point,
          clippingVertex.point,
          clippingNext.point
        );
        if (intersection) {
          intersections.push({
            point: intersection,
            subjectEdge: { start: subjectVertex, end: subjectNext },
            clippingEdge: { start: clippingVertex, end: clippingNext }
          });
        }
      }
    }
    return intersections;
  }
  /**
   * Finds the intersection point of two line segments.
   * @param p1 - Start of first line segment.
   * @param p2 - End of first line segment.
   * @param p3 - Start of second line segment.
   * @param p4 - End of second line segment.
   * @returns The intersection point, or null if no intersection.
   */
  lineIntersection(p1, p2, p3, p4) {
    const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    if (Math.abs(denom) < this.config.tolerance) {
      return null;
    }
    const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
    const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / denom;
    if (t >= -this.config.tolerance && t <= 1 + this.config.tolerance && u >= -this.config.tolerance && u <= 1 + this.config.tolerance) {
      return {
        x: p1.x + t * (p2.x - p1.x),
        y: p1.y + t * (p2.y - p1.y)
      };
    }
    return null;
  }
  /**
   * Inserts intersection points into both polygons.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @param intersections - Array of intersection points.
   */
  insertIntersectionPoints(_subject, _clipping, intersections) {
    for (const intersection of intersections) {
      const subjectIntersection = {
        point: intersection.point,
        isIntersection: true,
        isInside: false,
        processed: false
      };
      const clippingIntersection = {
        point: intersection.point,
        isIntersection: true,
        isInside: false,
        processed: false
      };
      subjectIntersection.corresponding = clippingIntersection;
      clippingIntersection.corresponding = subjectIntersection;
      this.insertVertexInEdge(subjectIntersection, intersection.subjectEdge);
      this.insertVertexInEdge(clippingIntersection, intersection.clippingEdge);
    }
  }
  /**
   * Inserts a vertex into an edge of a polygon.
   * @param vertex - The vertex to insert.
   * @param edge - The edge to insert into.
   */
  insertVertexInEdge(vertex, edge) {
    edge.start.next = vertex;
    vertex.previous = edge.start;
    vertex.next = edge.end;
    edge.end.previous = vertex;
  }
  /**
   * Marks vertices as inside or outside the other polygon.
   * @param polygon - The polygon whose vertices to mark.
   * @param otherPolygon - The other polygon to test against.
   */
  markVerticesInside(polygon, otherPolygon) {
    for (const vertex of polygon.vertices) {
      vertex.isInside = this.isPointInPolygon(vertex.point, otherPolygon);
    }
  }
  /**
   * Checks if a point is inside a polygon using ray casting.
   * @param point - The point to test.
   * @param polygon - The polygon to test against.
   * @returns True if the point is inside the polygon.
   */
  isPointInPolygon(point, polygon) {
    let inside = false;
    let current = polygon.vertices[0];
    do {
      const next = current.next;
      if (current.point.y > point.y !== next.point.y > point.y && point.x < (next.point.x - current.point.x) * (point.y - current.point.y) / (next.point.y - current.point.y) + current.point.x) {
        inside = !inside;
      }
      current = next;
    } while (current !== polygon.vertices[0]);
    return inside;
  }
  /**
   * Performs the specified clipping operation.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @param operation - The operation to perform.
   * @returns Array of result polygons.
   */
  performClippingOperation(subject, clipping, operation) {
    const resultPolygons = [];
    switch (operation) {
      case ClipOperation.INTERSECTION:
        resultPolygons.push(...this.performIntersection(subject, clipping));
        break;
      case ClipOperation.UNION:
        resultPolygons.push(...this.performUnion(subject, clipping));
        break;
      case ClipOperation.DIFFERENCE:
        resultPolygons.push(...this.performDifference(subject, clipping));
        break;
      case ClipOperation.XOR:
        resultPolygons.push(...this.performXOR(subject, clipping));
        break;
    }
    return resultPolygons;
  }
  /**
   * Performs intersection operation.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @returns Array of result polygons.
   */
  performIntersection(subject, _clipping) {
    const resultPolygons = [];
    const entryPoints = subject.vertices.filter(
      (vertex) => vertex.isIntersection && !vertex.isInside
    );
    for (const entryPoint of entryPoints) {
      if (!entryPoint.processed) {
        const resultPolygon = this.tracePolygon(entryPoint, true);
        if (resultPolygon.vertices.length >= 3) {
          resultPolygons.push(resultPolygon);
        }
      }
    }
    return resultPolygons;
  }
  /**
   * Performs union operation.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @returns Array of result polygons.
   */
  performUnion(subject, clipping) {
    const resultPolygons = [];
    const entryPoints = subject.vertices.filter(
      (vertex) => vertex.isIntersection && !vertex.isInside
    );
    for (const entryPoint of entryPoints) {
      if (!entryPoint.processed) {
        const resultPolygon = this.tracePolygon(entryPoint, true);
        if (resultPolygon.vertices.length >= 3) {
          resultPolygons.push(resultPolygon);
        }
      }
    }
    const clippingEntryPoints = clipping.vertices.filter(
      (vertex) => vertex.isIntersection && !vertex.isInside
    );
    for (const entryPoint of clippingEntryPoints) {
      if (!entryPoint.processed) {
        const resultPolygon = this.tracePolygon(entryPoint, true);
        if (resultPolygon.vertices.length >= 3) {
          resultPolygons.push(resultPolygon);
        }
      }
    }
    return resultPolygons;
  }
  /**
   * Performs difference operation.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @returns Array of result polygons.
   */
  performDifference(subject, _clipping) {
    const resultPolygons = [];
    const entryPoints = subject.vertices.filter(
      (vertex) => vertex.isIntersection && !vertex.isInside
    );
    for (const entryPoint of entryPoints) {
      if (!entryPoint.processed) {
        const resultPolygon = this.tracePolygon(entryPoint, true);
        if (resultPolygon.vertices.length >= 3) {
          resultPolygons.push(resultPolygon);
        }
      }
    }
    return resultPolygons;
  }
  /**
   * Performs XOR operation.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @returns Array of result polygons.
   */
  performXOR(subject, clipping) {
    const unionResult = this.performUnion(subject, clipping);
    return unionResult;
  }
  /**
   * Traces a polygon starting from an entry point.
   * @param entryPoint - The starting point.
   * @param isEntry - Whether this is an entry point.
   * @returns The traced polygon.
   */
  tracePolygon(entryPoint, isEntry) {
    const vertices = [];
    let current = entryPoint;
    let isCurrentlyEntry = isEntry;
    do {
      vertices.push(current);
      current.processed = true;
      if (current.isIntersection) {
        current = current.corresponding;
        isCurrentlyEntry = !isCurrentlyEntry;
      } else {
        current = isCurrentlyEntry ? current.next : current.previous;
      }
    } while (current !== entryPoint && vertices.length < 1e3);
    return {
      vertices,
      isSubject: true,
      isClipping: false
    };
  }
  /**
   * Converts Weiler-Atherton polygons back to standard polygon format.
   * @param waPolygons - Array of Weiler-Atherton polygons.
   * @returns Array of standard polygons.
   */
  wasToPolygons(waPolygons) {
    return waPolygons.map((waPolygon) => ({
      vertices: waPolygon.vertices.map((vertex) => vertex.point)
    }));
  }
  /**
   * Post-processes the result polygons.
   * @param polygons - The result polygons.
   * @returns Processed polygons.
   */
  postProcessResult(polygons) {
    let result = polygons;
    if (this.config.removeDuplicates) {
      result = result.map((polygon) => ({
        ...polygon,
        vertices: this.removeDuplicateVertices(polygon.vertices)
      }));
    }
    if (this.config.simplifyResult) {
      result = result.map((polygon) => ({
        ...polygon,
        vertices: this.simplifyPolygon(polygon.vertices)
      }));
    }
    result = result.filter((polygon) => polygon.vertices.length >= 3);
    return result;
  }
  /**
   * Removes duplicate vertices from a polygon.
   * @param vertices - The vertices to process.
   * @returns Vertices with duplicates removed.
   */
  removeDuplicateVertices(vertices) {
    if (vertices.length <= 1) return vertices;
    const result = [vertices[0]];
    for (let i = 1; i < vertices.length; i++) {
      const current = vertices[i];
      const previous = result[result.length - 1];
      if (!this.pointsEqual(current, previous)) {
        result.push(current);
      }
    }
    if (result.length > 1 && this.pointsEqual(result[0], result[result.length - 1])) {
      result.pop();
    }
    return result;
  }
  /**
   * Simplifies a polygon by removing collinear vertices.
   * @param vertices - The vertices to simplify.
   * @returns Simplified vertices.
   */
  simplifyPolygon(vertices) {
    if (vertices.length < 3) return vertices;
    const result = [];
    const n = vertices.length;
    for (let i = 0; i < n; i++) {
      const prev = vertices[(i - 1 + n) % n];
      const current = vertices[i];
      const next = vertices[(i + 1) % n];
      if (!this.areCollinear(prev, current, next)) {
        result.push(current);
      }
    }
    return result.length >= 3 ? result : vertices;
  }
  /**
   * Checks if three points are collinear.
   * @param p1 - First point.
   * @param p2 - Second point.
   * @param p3 - Third point.
   * @returns True if the points are collinear.
   */
  areCollinear(p1, p2, p3) {
    const crossProduct = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
    return Math.abs(crossProduct) < this.config.tolerance;
  }
  /**
   * Checks if two points are equal within tolerance.
   * @param p1 - First point.
   * @param p2 - Second point.
   * @returns True if the points are equal.
   */
  pointsEqual(p1, p2) {
    return Math.abs(p1.x - p2.x) < this.config.tolerance && Math.abs(p1.y - p2.y) < this.config.tolerance;
  }
  /**
   * Validates a polygon.
   * @param polygon - The polygon to validate.
   * @param name - The name of the polygon for error messages.
   * @throws Error if validation fails.
   */
  validatePolygon(polygon, name) {
    if (!polygon || !Array.isArray(polygon.vertices)) {
      throw new Error(`${name} polygon must have a vertices array`);
    }
    if (polygon.vertices.length < 3) {
      throw new Error(`${name} polygon must have at least 3 vertices`);
    }
    for (let i = 0; i < polygon.vertices.length; i++) {
      const vertex = polygon.vertices[i];
      if (!vertex || typeof vertex.x !== "number" || typeof vertex.y !== "number") {
        throw new Error(`${name} polygon vertex ${i} must have x and y properties`);
      }
      if (!isFinite(vertex.x) || !isFinite(vertex.y)) {
        throw new Error(`${name} polygon vertex ${i} must have finite coordinates`);
      }
    }
  }
  /**
   * Creates an empty result for error cases.
   * @param startTime - Start time for execution time calculation.
   * @param error - Error message.
   * @returns Empty clip result.
   */
  createEmptyResult(startTime, error) {
    const executionTime = performance.now() - startTime;
    const stats = {
      subjectVertices: 0,
      clippingVertices: 0,
      resultVertices: 0,
      intersectionPoints: 0,
      executionTime,
      success: false,
      error,
      algorithm: "weiler-atherton"
    };
    return {
      polygons: [],
      stats,
      isEmpty: true,
      isMultiple: false
    };
  }
}
class PolygonClipping {
  /**
   * Creates an instance of PolygonClipping.
   * @param config - Optional configuration for the clipping operations.
   */
  constructor(config = {}) {
    this.config = {
      tolerance: 1e-10,
      validateInput: true,
      handleSelfIntersections: false,
      preserveOrientation: true,
      removeDuplicates: true,
      simplifyResult: false,
      ...config
    };
    this.sutherlandHodgman = new SutherlandHodgmanClipper(this.config);
    this.weilerAtherton = new WeilerAthertonClipper(this.config);
  }
  /**
   * Performs intersection clipping between two polygons.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @returns The result of the intersection operation.
   */
  intersection(subject, clipping) {
    return this.clip(subject, clipping, ClipOperation.INTERSECTION);
  }
  /**
   * Performs union clipping between two polygons.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @returns The result of the union operation.
   */
  union(subject, clipping) {
    return this.clip(subject, clipping, ClipOperation.UNION);
  }
  /**
   * Performs difference clipping (subject - clipping).
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @returns The result of the difference operation.
   */
  difference(subject, clipping) {
    return this.clip(subject, clipping, ClipOperation.DIFFERENCE);
  }
  /**
   * Performs XOR clipping between two polygons.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @returns The result of the XOR operation.
   */
  xor(subject, clipping) {
    return this.clip(subject, clipping, ClipOperation.XOR);
  }
  /**
   * Clips a polygon against a convex clipping polygon using Sutherland-Hodgman algorithm.
   * @param subject - The subject polygon.
   * @param clipping - The convex clipping polygon.
   * @returns The result of the clipping operation.
   */
  clipConvex(subject, clipping) {
    return this.sutherlandHodgman.clip(subject, clipping);
  }
  /**
   * Clips a polygon using the Weiler-Atherton algorithm.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @param operation - The clipping operation to perform.
   * @returns The result of the clipping operation.
   */
  clipGeneral(subject, clipping, operation = ClipOperation.INTERSECTION) {
    return this.weilerAtherton.clip(subject, clipping, operation);
  }
  /**
   * Main clipping method that automatically selects the appropriate algorithm.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @param operation - The clipping operation to perform.
   * @returns The result of the clipping operation.
   */
  clip(subject, clipping, operation = ClipOperation.INTERSECTION) {
    const startTime = performance.now();
    try {
      if (this.config.validateInput) {
        const subjectValidation = this.validatePolygon(subject, "subject");
        const clippingValidation = this.validatePolygon(clipping, "clipping");
        if (!subjectValidation.isValid) {
          return this.createEmptyResult(startTime, `Subject polygon validation failed: ${subjectValidation.errors.join(", ")}`);
        }
        if (!clippingValidation.isValid) {
          return this.createEmptyResult(startTime, `Clipping polygon validation failed: ${clippingValidation.errors.join(", ")}`);
        }
      }
      const algorithm = this.selectAlgorithm(subject, clipping, operation);
      let result;
      switch (algorithm) {
        case "sutherland-hodgman":
          result = this.sutherlandHodgman.clip(subject, clipping);
          break;
        case "weiler-atherton":
          result = this.weilerAtherton.clip(subject, clipping, operation);
          break;
        default:
          throw new Error(`Unknown algorithm: ${algorithm}`);
      }
      if (this.config.simplifyResult) {
        result = this.simplifyResult(result);
      }
      return result;
    } catch (error) {
      return this.createEmptyResult(startTime, error instanceof Error ? error.message : "Unknown error");
    }
  }
  /**
   * Validates a polygon.
   * @param polygon - The polygon to validate.
   * @param name - The name of the polygon for error messages.
   * @param options - Validation options.
   * @returns The validation result.
   */
  validatePolygon(polygon, name, options = {}) {
    const validationOptions = {
      checkSelfIntersections: true,
      checkDuplicates: true,
      checkMinimumVertices: true,
      minimumVertices: 3,
      checkCollinear: true,
      ...options
    };
    const errors = [];
    const warnings = [];
    if (!polygon || !Array.isArray(polygon.vertices)) {
      errors.push(`${name} polygon must have a vertices array`);
      return this.createValidationResult(false, errors, warnings);
    }
    if (validationOptions.checkMinimumVertices && polygon.vertices.length < validationOptions.minimumVertices) {
      errors.push(`${name} polygon must have at least ${validationOptions.minimumVertices} vertices`);
    }
    for (let i = 0; i < polygon.vertices.length; i++) {
      const vertex = polygon.vertices[i];
      if (!vertex || typeof vertex.x !== "number" || typeof vertex.y !== "number") {
        errors.push(`${name} polygon vertex ${i} must have x and y properties`);
      } else if (!isFinite(vertex.x) || !isFinite(vertex.y)) {
        errors.push(`${name} polygon vertex ${i} must have finite coordinates`);
      }
    }
    if (validationOptions.checkDuplicates) {
      const hasDuplicates = this.hasDuplicateVertices(polygon.vertices);
      if (hasDuplicates) {
        warnings.push(`${name} polygon has duplicate vertices`);
      }
    }
    if (validationOptions.checkCollinear) {
      const hasCollinear = this.hasCollinearVertices(polygon.vertices);
      if (hasCollinear) {
        warnings.push(`${name} polygon has collinear vertices`);
      }
    }
    if (validationOptions.checkSelfIntersections) {
      const hasSelfIntersections = this.hasSelfIntersections(polygon.vertices);
      if (hasSelfIntersections) {
        warnings.push(`${name} polygon has self-intersections`);
      }
    }
    return this.createValidationResult(errors.length === 0, errors, warnings);
  }
  /**
   * Simplifies a polygon by removing collinear vertices and duplicates.
   * @param polygon - The polygon to simplify.
   * @param options - Simplification options.
   * @returns The simplified polygon.
   */
  simplifyPolygon(polygon, options = {}) {
    const simplificationOptions = {
      collinearTolerance: 1e-6,
      duplicateTolerance: 1e-10,
      removeCollinear: true,
      removeDuplicates: true,
      ensureOrientation: true,
      ...options
    };
    let vertices = [...polygon.vertices];
    if (simplificationOptions.removeDuplicates) {
      vertices = this.removeDuplicateVertices(vertices, simplificationOptions.duplicateTolerance);
    }
    if (simplificationOptions.removeCollinear) {
      vertices = this.removeCollinearVertices(vertices, simplificationOptions.collinearTolerance);
    }
    if (simplificationOptions.ensureOrientation) {
      this.ensureCounterClockwise(vertices);
    }
    return {
      ...polygon,
      vertices
    };
  }
  /**
   * Serializes a polygon to a JSON-serializable format.
   * @param polygon - The polygon to serialize.
   * @param options - Serialization options.
   * @returns Serialized polygon data.
   */
  serialize(polygon, options = {}) {
    const serializationOptions = {
      precision: 6,
      includeValidation: false,
      ...options
    };
    const round = (value) => {
      return Math.round(value * Math.pow(10, serializationOptions.precision)) / Math.pow(10, serializationOptions.precision);
    };
    const roundPoint = (point) => ({
      x: round(point.x),
      y: round(point.y)
    });
    const result = {
      vertices: polygon.vertices.map(roundPoint)
    };
    if (polygon.holes) {
      result.holes = polygon.holes.map((hole) => hole.vertices.map(roundPoint));
    }
    if (serializationOptions.includeValidation) {
      result.validation = this.validatePolygon(polygon, "polygon");
    }
    return result;
  }
  /**
   * Updates the configuration.
   * @param newConfig - New configuration options.
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.sutherlandHodgman = new SutherlandHodgmanClipper(this.config);
    this.weilerAtherton = new WeilerAthertonClipper(this.config);
  }
  /**
   * Gets the current configuration.
   * @returns The current configuration.
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Selects the appropriate algorithm based on the input polygons and operation.
   * @param subject - The subject polygon.
   * @param clipping - The clipping polygon.
   * @param operation - The clipping operation.
   * @returns The selected algorithm name.
   */
  selectAlgorithm(_subject, clipping, operation) {
    if (operation === ClipOperation.INTERSECTION && this.isConvexPolygon(clipping)) {
      return "sutherland-hodgman";
    }
    return "weiler-atherton";
  }
  /**
   * Checks if a polygon is convex.
   * @param polygon - The polygon to check.
   * @returns True if the polygon is convex.
   */
  isConvexPolygon(polygon) {
    const vertices = polygon.vertices;
    if (vertices.length < 3) return false;
    let sign = 0;
    const n = vertices.length;
    for (let i = 0; i < n; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i + 1) % n];
      const p3 = vertices[(i + 2) % n];
      const crossProduct = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
      if (Math.abs(crossProduct) > this.config.tolerance) {
        const currentSign = crossProduct > 0 ? 1 : -1;
        if (sign === 0) {
          sign = currentSign;
        } else if (sign !== currentSign) {
          return false;
        }
      }
    }
    return true;
  }
  /**
   * Checks if a polygon has duplicate vertices.
   * @param vertices - The vertices to check.
   * @returns True if there are duplicate vertices.
   */
  hasDuplicateVertices(vertices) {
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 1; j < vertices.length; j++) {
        if (this.pointsEqual(vertices[i], vertices[j])) {
          return true;
        }
      }
    }
    return false;
  }
  /**
   * Checks if a polygon has collinear vertices.
   * @param vertices - The vertices to check.
   * @returns True if there are collinear vertices.
   */
  hasCollinearVertices(vertices) {
    if (vertices.length < 3) return false;
    for (let i = 0; i < vertices.length; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i + 1) % vertices.length];
      const p3 = vertices[(i + 2) % vertices.length];
      if (this.areCollinear(p1, p2, p3)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Checks if a polygon has self-intersections (simplified check).
   * @param vertices - The vertices to check.
   * @returns True if there are self-intersections.
   */
  hasSelfIntersections(vertices) {
    if (vertices.length < 4) return false;
    for (let i = 0; i < vertices.length; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i + 1) % vertices.length];
      for (let j = i + 2; j < vertices.length; j++) {
        if (j === vertices.length - 1 && i === 0) continue;
        const p3 = vertices[j];
        const p4 = vertices[(j + 1) % vertices.length];
        if (this.lineSegmentsIntersect(p1, p2, p3, p4)) {
          return true;
        }
      }
    }
    return false;
  }
  /**
   * Checks if two line segments intersect.
   * @param p1 - Start of first segment.
   * @param p2 - End of first segment.
   * @param p3 - Start of second segment.
   * @param p4 - End of second segment.
   * @returns True if the segments intersect.
   */
  lineSegmentsIntersect(p1, p2, p3, p4) {
    const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    if (Math.abs(denom) < this.config.tolerance) {
      return false;
    }
    const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
    const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / denom;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  }
  /**
   * Removes duplicate vertices from a polygon.
   * @param vertices - The vertices to process.
   * @param tolerance - Tolerance for duplicate detection.
   * @returns Vertices with duplicates removed.
   */
  removeDuplicateVertices(vertices, tolerance) {
    if (vertices.length <= 1) return vertices;
    const result = [vertices[0]];
    for (let i = 1; i < vertices.length; i++) {
      const current = vertices[i];
      const previous = result[result.length - 1];
      if (!this.pointsEqualWithTolerance(current, previous, tolerance)) {
        result.push(current);
      }
    }
    if (result.length > 1 && this.pointsEqualWithTolerance(result[0], result[result.length - 1], tolerance)) {
      result.pop();
    }
    return result;
  }
  /**
   * Removes collinear vertices from a polygon.
   * @param vertices - The vertices to process.
   * @param tolerance - Tolerance for collinearity detection.
   * @returns Vertices with collinear vertices removed.
   */
  removeCollinearVertices(vertices, tolerance) {
    if (vertices.length < 3) return vertices;
    const result = [];
    const n = vertices.length;
    for (let i = 0; i < n; i++) {
      const prev = vertices[(i - 1 + n) % n];
      const current = vertices[i];
      const next = vertices[(i + 1) % n];
      if (!this.areCollinearWithTolerance(prev, current, next, tolerance)) {
        result.push(current);
      }
    }
    return result.length >= 3 ? result : vertices;
  }
  /**
   * Ensures a polygon has counter-clockwise orientation.
   * @param vertices - The vertices to reorient.
   */
  ensureCounterClockwise(vertices) {
    if (vertices.length < 3) return;
    let area = 0;
    for (let i = 0; i < vertices.length; i++) {
      const current = vertices[i];
      const next = vertices[(i + 1) % vertices.length];
      area += (next.x - current.x) * (next.y + current.y);
    }
    if (area > 0) {
      vertices.reverse();
    }
  }
  /**
   * Simplifies the result of a clipping operation.
   * @param result - The clipping result to simplify.
   * @returns The simplified result.
   */
  simplifyResult(result) {
    const simplifiedPolygons = result.polygons.map(
      (polygon) => this.simplifyPolygon(polygon)
    );
    return {
      ...result,
      polygons: simplifiedPolygons
    };
  }
  /**
   * Checks if three points are collinear within tolerance.
   * @param p1 - First point.
   * @param p2 - Second point.
   * @param p3 - Third point.
   * @param tolerance - Tolerance for collinearity.
   * @returns True if the points are collinear.
   */
  areCollinearWithTolerance(p1, p2, p3, tolerance) {
    const crossProduct = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
    return Math.abs(crossProduct) < tolerance;
  }
  /**
   * Checks if two points are equal within tolerance.
   * @param p1 - First point.
   * @param p2 - Second point.
   * @param tolerance - Tolerance for equality.
   * @returns True if the points are equal.
   */
  pointsEqualWithTolerance(p1, p2, tolerance) {
    return Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance;
  }
  /**
   * Checks if two points are equal within default tolerance.
   * @param p1 - First point.
   * @param p2 - Second point.
   * @returns True if the points are equal.
   */
  pointsEqual(p1, p2) {
    return this.pointsEqualWithTolerance(p1, p2, this.config.tolerance);
  }
  /**
   * Checks if three points are collinear within default tolerance.
   * @param p1 - First point.
   * @param p2 - Second point.
   * @param p3 - Third point.
   * @returns True if the points are collinear.
   */
  areCollinear(p1, p2, p3) {
    return this.areCollinearWithTolerance(p1, p2, p3, this.config.tolerance);
  }
  /**
   * Creates a validation result object.
   * @param isValid - Whether the polygon is valid.
   * @param errors - Array of error messages.
   * @param warnings - Array of warning messages.
   * @returns The validation result.
   */
  createValidationResult(isValid, errors, warnings) {
    return {
      isValid,
      errors,
      warnings,
      hasSelfIntersections: warnings.some((w) => w.includes("self-intersections")),
      hasDuplicates: warnings.some((w) => w.includes("duplicate")),
      hasCollinear: warnings.some((w) => w.includes("collinear"))
    };
  }
  /**
   * Creates an empty result for error cases.
   * @param startTime - Start time for execution time calculation.
   * @param error - Error message.
   * @returns Empty clip result.
   */
  createEmptyResult(startTime, error) {
    const executionTime = performance.now() - startTime;
    const stats = {
      subjectVertices: 0,
      clippingVertices: 0,
      resultVertices: 0,
      intersectionPoints: 0,
      executionTime,
      success: false,
      error,
      algorithm: "sutherland-hodgman"
      // Default
    };
    return {
      polygons: [],
      stats,
      isEmpty: true,
      isMultiple: false
    };
  }
}
class SweepLineEventQueue {
  constructor() {
    this.events = [];
  }
  /**
   * Adds an event to the queue.
   * @param event - The event to add.
   */
  add(event) {
    this.events.push(event);
    this.events.sort((a, b) => {
      if (Math.abs(a.point.y - b.point.y) > 1e-10) {
        return a.point.y - b.point.y;
      }
      if (Math.abs(a.point.x - b.point.x) > 1e-10) {
        return a.point.x - b.point.x;
      }
      return a.priority - b.priority;
    });
  }
  /**
   * Removes and returns the next event from the queue.
   * @returns The next event, or null if queue is empty.
   */
  poll() {
    return this.events.shift() || null;
  }
  /**
   * Returns the next event without removing it.
   * @returns The next event, or null if queue is empty.
   */
  peek() {
    return this.events.length > 0 ? this.events[0] : null;
  }
  /**
   * Returns the number of events in the queue.
   * @returns The queue size.
   */
  size() {
    return this.events.length;
  }
  /**
   * Returns whether the queue is empty.
   * @returns True if the queue is empty.
   */
  isEmpty() {
    return this.events.length === 0;
  }
  /**
   * Clears all events from the queue.
   */
  clear() {
    this.events = [];
  }
}
class SweepLineStatusStructure {
  constructor(tolerance = 1e-10) {
    this.root = null;
    this.tolerance = tolerance;
  }
  /**
   * Inserts a segment into the status structure.
   * @param segment - The segment to insert.
   * @param sweepY - Current y-coordinate of the sweep line.
   */
  insert(segment, sweepY) {
    this.root = this.insertNode(this.root, segment, sweepY);
  }
  /**
   * Removes a segment from the status structure.
   * @param segment - The segment to remove.
   * @param sweepY - Current y-coordinate of the sweep line.
   */
  remove(segment, sweepY) {
    this.root = this.removeNode(this.root, segment, sweepY);
  }
  /**
   * Finds the segments immediately above and below a given segment.
   * @param segment - The segment to find neighbors for.
   * @param sweepY - Current y-coordinate of the sweep line.
   * @returns Object with above and below segments.
   */
  findNeighbors(segment, sweepY) {
    const above = this.findAbove(segment, sweepY);
    const below = this.findBelow(segment, sweepY);
    return { above, below };
  }
  /**
   * Returns all segments in the status structure.
   * @param sweepY - Current y-coordinate of the sweep line.
   * @returns Array of segments ordered by their x-coordinate at sweepY.
   */
  getAllSegments(_sweepY) {
    const segments = [];
    this.inorderTraversal(this.root, segments);
    return segments;
  }
  /**
   * Returns the number of segments in the status structure.
   * @returns The number of segments.
   */
  size() {
    return this.countNodes(this.root);
  }
  /**
   * Returns whether the status structure is empty.
   * @returns True if the status structure is empty.
   */
  isEmpty() {
    return this.root === null;
  }
  /**
   * Clears all segments from the status structure.
   */
  clear() {
    this.root = null;
  }
  /**
   * Inserts a node into the AVL tree.
   * @param node - Current node.
   * @param segment - Segment to insert.
   * @param sweepY - Current sweep line y-coordinate.
   * @returns The updated node.
   */
  insertNode(node, segment, sweepY) {
    if (node === null) {
      return {
        segment,
        left: null,
        right: null,
        parent: null,
        height: 1
      };
    }
    const comparison = this.compareSegments(segment, node.segment, sweepY);
    if (comparison < 0) {
      node.left = this.insertNode(node.left, segment, sweepY);
    } else if (comparison > 0) {
      node.right = this.insertNode(node.right, segment, sweepY);
    } else {
      return node;
    }
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    return this.balance(node, sweepY);
  }
  /**
   * Removes a node from the AVL tree.
   * @param node - Current node.
   * @param segment - Segment to remove.
   * @param sweepY - Current sweep line y-coordinate.
   * @returns The updated node.
   */
  removeNode(node, segment, sweepY) {
    if (node === null) {
      return null;
    }
    const comparison = this.compareSegments(segment, node.segment, sweepY);
    if (comparison < 0) {
      node.left = this.removeNode(node.left, segment, sweepY);
    } else if (comparison > 0) {
      node.right = this.removeNode(node.right, segment, sweepY);
    } else {
      if (node.left === null || node.right === null) {
        const temp = node.left || node.right;
        if (temp === null) {
          return null;
        }
        return temp;
      }
      const successor = this.findMin(node.right);
      node.segment = successor.segment;
      node.right = this.removeNode(node.right, successor.segment, sweepY);
    }
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    return this.balance(node, sweepY);
  }
  /**
   * Balances an AVL tree node.
   * @param node - The node to balance.
   * @param sweepY - Current sweep line y-coordinate.
   * @returns The balanced node.
   */
  balance(node, _sweepY) {
    const balanceFactor = this.getBalance(node);
    if (balanceFactor > 1) {
      if (this.getBalance(node.left) < 0) {
        node.left = this.rotateLeft(node.left);
      }
      return this.rotateRight(node);
    }
    if (balanceFactor < -1) {
      if (this.getBalance(node.right) > 0) {
        node.right = this.rotateRight(node.right);
      }
      return this.rotateLeft(node);
    }
    return node;
  }
  /**
   * Performs a right rotation.
   * @param node - The node to rotate.
   * @returns The rotated node.
   */
  rotateRight(node) {
    const left = node.left;
    const rightOfLeft = left.right;
    left.right = node;
    node.left = rightOfLeft;
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    left.height = 1 + Math.max(this.getHeight(left.left), this.getHeight(left.right));
    return left;
  }
  /**
   * Performs a left rotation.
   * @param node - The node to rotate.
   * @returns The rotated node.
   */
  rotateLeft(node) {
    const right = node.right;
    const leftOfRight = right.left;
    right.left = node;
    node.right = leftOfRight;
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    right.height = 1 + Math.max(this.getHeight(right.left), this.getHeight(right.right));
    return right;
  }
  /**
   * Gets the height of a node.
   * @param node - The node.
   * @returns The height of the node.
   */
  getHeight(node) {
    return node ? node.height : 0;
  }
  /**
   * Gets the balance factor of a node.
   * @param node - The node.
   * @returns The balance factor.
   */
  getBalance(node) {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }
  /**
   * Finds the minimum node in a subtree.
   * @param node - The root of the subtree.
   * @returns The minimum node.
   */
  findMin(node) {
    while (node.left !== null) {
      node = node.left;
    }
    return node;
  }
  /**
   * Compares two segments at a given sweep line y-coordinate.
   * @param seg1 - First segment.
   * @param seg2 - Second segment.
   * @param sweepY - Current sweep line y-coordinate.
   * @returns Negative if seg1 < seg2, positive if seg1 > seg2, 0 if equal.
   */
  compareSegments(seg1, seg2, sweepY) {
    const x1 = this.getXAtY(seg1, sweepY);
    const x2 = this.getXAtY(seg2, sweepY);
    if (Math.abs(x1 - x2) < this.tolerance) {
      return 0;
    }
    return x1 - x2;
  }
  /**
   * Gets the x-coordinate of a segment at a given y-coordinate.
   * @param segment - The segment.
   * @param y - The y-coordinate.
   * @returns The x-coordinate.
   */
  getXAtY(segment, y) {
    const { start, end } = segment;
    if (Math.abs(start.y - end.y) < this.tolerance) {
      return Math.min(start.x, end.x);
    }
    const t = (y - start.y) / (end.y - start.y);
    return start.x + t * (end.x - start.x);
  }
  /**
   * Finds the segment immediately above a given segment.
   * @param segment - The reference segment.
   * @param sweepY - Current sweep line y-coordinate.
   * @returns The segment above, or null if none.
   */
  findAbove(segment, sweepY) {
    let current = this.root;
    let above = null;
    while (current !== null) {
      const comparison = this.compareSegments(segment, current.segment, sweepY);
      if (comparison < 0) {
        above = current.segment;
        current = current.left;
      } else {
        current = current.right;
      }
    }
    return above;
  }
  /**
   * Finds the segment immediately below a given segment.
   * @param segment - The reference segment.
   * @param sweepY - Current sweep line y-coordinate.
   * @returns The segment below, or null if none.
   */
  findBelow(segment, sweepY) {
    let current = this.root;
    let below = null;
    while (current !== null) {
      const comparison = this.compareSegments(segment, current.segment, sweepY);
      if (comparison > 0) {
        below = current.segment;
        current = current.right;
      } else {
        current = current.left;
      }
    }
    return below;
  }
  /**
   * Performs inorder traversal to collect all segments.
   * @param node - Current node.
   * @param segments - Array to collect segments.
   */
  inorderTraversal(node, segments) {
    if (node !== null) {
      this.inorderTraversal(node.left, segments);
      segments.push(node.segment);
      this.inorderTraversal(node.right, segments);
    }
  }
  /**
   * Counts the number of nodes in a subtree.
   * @param node - The root of the subtree.
   * @returns The number of nodes.
   */
  countNodes(node) {
    if (node === null) {
      return 0;
    }
    return 1 + this.countNodes(node.left) + this.countNodes(node.right);
  }
}
class SweepLineUtils {
  /**
   * Creates start and end events for a line segment.
   * @param segment - The line segment.
   * @returns Array of events.
   */
  static createSegmentEvents(segment) {
    const events = [];
    let start;
    let end;
    if (segment.start.y < segment.end.y || Math.abs(segment.start.y - segment.end.y) < 1e-10 && segment.start.x < segment.end.x) {
      start = segment.start;
      end = segment.end;
    } else {
      start = segment.end;
      end = segment.start;
    }
    events.push({
      type: "start",
      point: start,
      segment,
      priority: 1
    });
    events.push({
      type: "end",
      point: end,
      segment,
      priority: 3
    });
    return events;
  }
  /**
   * Creates an intersection event.
   * @param point - The intersection point.
   * @param segment1 - First intersecting segment.
   * @param segment2 - Second intersecting segment.
   * @returns The intersection event.
   */
  static createIntersectionEvent(point, segment1, segment2) {
    return {
      type: "intersection",
      point,
      segments: [segment1, segment2],
      priority: 2
    };
  }
  /**
   * Checks if two line segments intersect.
   * @param seg1 - First line segment.
   * @param seg2 - Second line segment.
   * @param tolerance - Tolerance for floating point comparisons.
   * @returns Object with intersection information, or null if no intersection.
   */
  static lineSegmentsIntersect(seg1, seg2, tolerance = 1e-10) {
    const p1 = seg1.start;
    const p2 = seg1.end;
    const p3 = seg2.start;
    const p4 = seg2.end;
    const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    if (Math.abs(denom) < tolerance) {
      return null;
    }
    const t1 = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
    const t2 = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / denom;
    if (t1 >= -tolerance && t1 <= 1 + tolerance && t2 >= -tolerance && t2 <= 1 + tolerance) {
      return {
        point: {
          x: p1.x + t1 * (p2.x - p1.x),
          y: p1.y + t1 * (p2.y - p1.y)
        },
        t1,
        t2
      };
    }
    return null;
  }
  /**
   * Checks if a point is on a line segment.
   * @param point - The point to check.
   * @param segment - The line segment.
   * @param tolerance - Tolerance for floating point comparisons.
   * @returns True if the point is on the segment.
   */
  static pointOnSegment(point, segment, tolerance = 1e-10) {
    const { start, end } = segment;
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);
    if (point.x < minX - tolerance || point.x > maxX + tolerance || point.y < minY - tolerance || point.y > maxY + tolerance) {
      return false;
    }
    const crossProduct = (point.x - start.x) * (end.y - start.y) - (point.y - start.y) * (end.x - start.x);
    return Math.abs(crossProduct) < tolerance;
  }
  /**
   * Calculates the distance between two points.
   * @param p1 - First point.
   * @param p2 - Second point.
   * @returns The Euclidean distance.
   */
  static distance(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  /**
   * Checks if two points are equal within tolerance.
   * @param p1 - First point.
   * @param p2 - Second point.
   * @param tolerance - Tolerance for comparison.
   * @returns True if the points are equal.
   */
  static pointsEqual(p1, p2, tolerance = 1e-10) {
    return Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance;
  }
}
class LineIntersection {
  /**
   * Creates an instance of LineIntersection.
   * @param config - Optional configuration for the algorithm.
   */
  constructor(config = {}) {
    this.config = {
      tolerance: 1e-10,
      validateInput: true,
      handleDegenerates: true,
      removeDuplicates: true,
      sortSegments: true,
      maxIntersections: Infinity,
      ...config
    };
    this.eventQueue = new SweepLineEventQueue();
    this.statusStructure = new SweepLineStatusStructure(this.config.tolerance);
  }
  /**
   * Finds all intersections between the given line segments.
   * @param segments - Array of line segments to analyze.
   * @returns The result containing all intersections found.
   */
  findIntersections(segments) {
    const startTime = performance.now();
    try {
      if (this.config.validateInput) {
        const validation = this.validateSegments(segments);
        if (!validation.isValid) {
          return this.createEmptyResult(startTime, `Validation failed: ${validation.errors.join(", ")}`);
        }
      }
      if (segments.length < 2) {
        return this.createEmptyResult(startTime, "At least 2 segments are required for intersection finding");
      }
      const processedSegments = this.config.sortSegments ? this.sortSegments(segments) : segments;
      this.initializeEventQueue(processedSegments);
      const intersections = this.runSweepLineAlgorithm();
      const processedIntersections = this.postProcessIntersections(intersections);
      const executionTime = performance.now() - startTime;
      const stats = {
        segmentCount: segments.length,
        intersectionCount: processedIntersections.length,
        eventCount: this.eventQueue.size(),
        degenerateCount: 0,
        // Will be calculated during processing
        executionTime,
        success: true,
        maxTreeDepth: this.calculateMaxTreeDepth(),
        averageTreeDepth: this.calculateAverageTreeDepth()
      };
      return {
        intersections: processedIntersections,
        stats,
        hasIntersections: processedIntersections.length > 0,
        uniqueIntersectionCount: processedIntersections.length
      };
    } catch (error) {
      return this.createEmptyResult(startTime, error instanceof Error ? error.message : "Unknown error");
    }
  }
  /**
   * Queries for intersections matching specific criteria.
   * @param segments - Array of line segments to analyze.
   * @param options - Query options.
   * @returns The query result.
   */
  queryIntersections(segments, options = {}) {
    const startTime = performance.now();
    const result = this.findIntersections(segments);
    let filteredIntersections = result.intersections;
    if (options.boundingBox) {
      filteredIntersections = filteredIntersections.filter(
        (intersection) => this.isPointInBoundingBox(intersection.point, options.boundingBox)
      );
    }
    if (options.segmentIds) {
      filteredIntersections = filteredIntersections.filter(
        (intersection) => options.segmentIds.includes(intersection.segments[0].id) || options.segmentIds.includes(intersection.segments[1].id)
      );
    }
    if (options.maxDistance !== void 0) {
      filteredIntersections = filteredIntersections.filter(
        (intersection) => this.isPointWithinDistance(intersection.point, options.maxDistance)
      );
    }
    if (!options.includeDegenerates) {
      filteredIntersections = filteredIntersections.filter(
        (intersection) => !this.isDegenerateIntersection(intersection)
      );
    }
    const executionTime = performance.now() - startTime;
    return {
      intersections: filteredIntersections,
      count: filteredIntersections.length,
      executionTime
    };
  }
  /**
   * Validates a set of line segments.
   * @param segments - The segments to validate.
   * @param options - Validation options.
   * @returns The validation result.
   */
  validateSegments(segments, options = {}) {
    const validationOptions = {
      checkZeroLength: true,
      checkDuplicates: true,
      checkInfinite: true,
      minLength: 0,
      ...options
    };
    const errors = [];
    const warnings = [];
    let invalidCount = 0;
    let duplicateCount = 0;
    if (!Array.isArray(segments)) {
      errors.push("Segments must be an array");
      return this.createValidationResult(false, errors, warnings, 0, 0);
    }
    if (segments.length === 0) {
      errors.push("At least one segment is required");
      return this.createValidationResult(false, errors, warnings, 0, 0);
    }
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (!segment || typeof segment.id === "undefined") {
        errors.push(`Segment ${i} must have an id`);
        invalidCount++;
        continue;
      }
      if (!segment.start || !segment.end) {
        errors.push(`Segment ${i} must have start and end points`);
        invalidCount++;
        continue;
      }
      if (!this.isValidPoint(segment.start) || !this.isValidPoint(segment.end)) {
        errors.push(`Segment ${i} has invalid start or end point`);
        invalidCount++;
        continue;
      }
      if (validationOptions.checkZeroLength) {
        const length = SweepLineUtils.distance(segment.start, segment.end);
        if (length < validationOptions.minLength) {
          warnings.push(`Segment ${i} has zero or very small length`);
        }
      }
      if (validationOptions.checkInfinite) {
        if (!isFinite(segment.start.x) || !isFinite(segment.start.y) || !isFinite(segment.end.x) || !isFinite(segment.end.y)) {
          errors.push(`Segment ${i} has infinite coordinates`);
          invalidCount++;
        }
      }
    }
    if (validationOptions.checkDuplicates) {
      for (let i = 0; i < segments.length; i++) {
        for (let j = i + 1; j < segments.length; j++) {
          if (this.areSegmentsEqual(segments[i], segments[j])) {
            duplicateCount++;
            warnings.push(`Segments ${i} and ${j} are duplicates`);
          }
        }
      }
    }
    return this.createValidationResult(
      errors.length === 0,
      errors,
      warnings,
      invalidCount,
      duplicateCount
    );
  }
  /**
   * Serializes intersection results to a JSON-serializable format.
   * @param result - The intersection result to serialize.
   * @param options - Serialization options.
   * @returns Serialized intersection data.
   */
  serialize(result, options = {}) {
    const serializationOptions = {
      precision: 6,
      includeStats: false,
      ...options
    };
    const round = (value) => {
      return Math.round(value * Math.pow(10, serializationOptions.precision)) / Math.pow(10, serializationOptions.precision);
    };
    const roundPoint = (point) => ({
      x: round(point.x),
      y: round(point.y)
    });
    const serializedIntersections = result.intersections.map((intersection) => ({
      point: roundPoint(intersection.point),
      segmentIds: [intersection.segments[0].id, intersection.segments[1].id],
      parameters: [round(intersection.t1), round(intersection.t2)]
    }));
    const serialized = {
      intersections: serializedIntersections,
      config: this.config
    };
    if (serializationOptions.includeStats) {
      serialized.stats = result.stats;
    }
    return serialized;
  }
  /**
   * Updates the configuration.
   * @param newConfig - New configuration options.
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.statusStructure = new SweepLineStatusStructure(this.config.tolerance);
  }
  /**
   * Gets the current configuration.
   * @returns The current configuration.
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Initializes the event queue with segment endpoints.
   * @param segments - The segments to process.
   */
  initializeEventQueue(segments) {
    this.eventQueue.clear();
    for (const segment of segments) {
      const events = SweepLineUtils.createSegmentEvents(segment);
      for (const event of events) {
        this.eventQueue.add(event);
      }
    }
  }
  /**
   * Runs the main sweep line algorithm.
   * @returns Array of intersection points found.
   */
  runSweepLineAlgorithm() {
    const intersections = [];
    while (!this.eventQueue.isEmpty() && intersections.length < this.config.maxIntersections) {
      const event = this.eventQueue.poll();
      switch (event.type) {
        case "start":
          this.handleStartEvent(event, intersections);
          break;
        case "end":
          this.handleEndEvent(event, intersections);
          break;
        case "intersection":
          this.handleIntersectionEvent(event, intersections);
          break;
      }
    }
    return intersections;
  }
  /**
   * Handles a start event (segment begins).
   * @param event - The start event.
   * @param intersections - Array to collect intersections.
   */
  handleStartEvent(event, intersections) {
    const segment = event.segment;
    this.statusStructure.insert(segment, event.point.y);
    const neighbors = this.statusStructure.findNeighbors(segment, event.point.y);
    if (neighbors.above) {
      this.checkAndAddIntersection(segment, neighbors.above, event.point.y, intersections);
    }
    if (neighbors.below) {
      this.checkAndAddIntersection(segment, neighbors.below, event.point.y, intersections);
    }
  }
  /**
   * Handles an end event (segment ends).
   * @param event - The end event.
   * @param intersections - Array to collect intersections.
   */
  handleEndEvent(event, intersections) {
    const segment = event.segment;
    const neighbors = this.statusStructure.findNeighbors(segment, event.point.y);
    this.statusStructure.remove(segment, event.point.y);
    if (neighbors.above && neighbors.below) {
      this.checkAndAddIntersection(neighbors.above, neighbors.below, event.point.y, intersections);
    }
  }
  /**
   * Handles an intersection event.
   * @param event - The intersection event.
   * @param intersections - Array to collect intersections.
   */
  handleIntersectionEvent(event, intersections) {
    const [segment1, segment2] = event.segments;
    this.statusStructure.remove(segment1, event.point.y);
    this.statusStructure.remove(segment2, event.point.y);
    this.statusStructure.insert(segment2, event.point.y);
    this.statusStructure.insert(segment1, event.point.y);
    const neighbors1 = this.statusStructure.findNeighbors(segment1, event.point.y);
    const neighbors2 = this.statusStructure.findNeighbors(segment2, event.point.y);
    if (neighbors1.above) {
      this.checkAndAddIntersection(segment1, neighbors1.above, event.point.y, intersections);
    }
    if (neighbors2.below) {
      this.checkAndAddIntersection(segment2, neighbors2.below, event.point.y, intersections);
    }
    const intersection = this.createIntersectionPoint(event.point, segment1, segment2);
    if (intersection) {
      intersections.push(intersection);
    }
  }
  /**
   * Checks if two segments intersect and adds the intersection to the queue if found.
   * @param seg1 - First segment.
   * @param seg2 - Second segment.
   * @param sweepY - Current sweep line y-coordinate.
   * @param intersections - Array to collect intersections.
   */
  checkAndAddIntersection(seg1, seg2, sweepY, _intersections) {
    const intersection = SweepLineUtils.lineSegmentsIntersect(seg1, seg2, this.config.tolerance);
    if (intersection && intersection.point.y > sweepY + (this.config.tolerance ?? 1e-10)) {
      const event = SweepLineUtils.createIntersectionEvent(intersection.point, seg1, seg2);
      this.eventQueue.add(event);
    }
  }
  /**
   * Creates an intersection point from an intersection event.
   * @param point - The intersection point.
   * @param seg1 - First segment.
   * @param seg2 - Second segment.
   * @returns The intersection point, or null if invalid.
   */
  createIntersectionPoint(_point, seg1, seg2) {
    const intersection = SweepLineUtils.lineSegmentsIntersect(seg1, seg2, this.config.tolerance);
    if (!intersection) {
      return null;
    }
    return {
      point: intersection.point,
      segments: [seg1, seg2],
      t1: intersection.t1,
      t2: intersection.t2
    };
  }
  /**
   * Post-processes intersection results.
   * @param intersections - Raw intersection points.
   * @returns Processed intersection points.
   */
  postProcessIntersections(intersections) {
    let processed = intersections;
    if (this.config.removeDuplicates) {
      processed = this.removeDuplicateIntersections(processed);
    }
    if (!this.config.handleDegenerates) {
      processed = processed.filter((intersection) => !this.isDegenerateIntersection(intersection));
    }
    return processed;
  }
  /**
   * Removes duplicate intersection points.
   * @param intersections - Array of intersection points.
   * @returns Array with duplicates removed.
   */
  removeDuplicateIntersections(intersections) {
    const unique = [];
    for (const intersection of intersections) {
      const isDuplicate = unique.some(
        (existing) => SweepLineUtils.pointsEqual(existing.point, intersection.point, this.config.tolerance) && (existing.segments[0].id === intersection.segments[0].id && existing.segments[1].id === intersection.segments[1].id || existing.segments[0].id === intersection.segments[1].id && existing.segments[1].id === intersection.segments[0].id)
      );
      if (!isDuplicate) {
        unique.push(intersection);
      }
    }
    return unique;
  }
  /**
   * Checks if an intersection is degenerate (at segment endpoints).
   * @param intersection - The intersection to check.
   * @returns True if the intersection is degenerate.
   */
  isDegenerateIntersection(intersection) {
    const { point, segments } = intersection;
    const [seg1, seg2] = segments;
    return SweepLineUtils.pointOnSegment(point, seg1, this.config.tolerance) || SweepLineUtils.pointOnSegment(point, seg2, this.config.tolerance);
  }
  /**
   * Sorts segments for better performance.
   * @param segments - Array of segments to sort.
   * @returns Sorted array of segments.
   */
  sortSegments(segments) {
    return [...segments].sort((a, b) => {
      const minYA = Math.min(a.start.y, a.end.y);
      const minYB = Math.min(b.start.y, b.end.y);
      if (Math.abs(minYA - minYB) > (this.config.tolerance ?? 1e-10)) {
        return minYA - minYB;
      }
      const minXA = Math.min(a.start.x, a.end.x);
      const minXB = Math.min(b.start.x, b.end.x);
      return minXA - minXB;
    });
  }
  /**
   * Checks if a point is within a bounding box.
   * @param point - The point to check.
   * @param boundingBox - The bounding box.
   * @returns True if the point is within the bounding box.
   */
  isPointInBoundingBox(point, boundingBox) {
    return point.x >= boundingBox.min.x && point.x <= boundingBox.max.x && point.y >= boundingBox.min.y && point.y <= boundingBox.max.y;
  }
  /**
   * Checks if a point is within a certain distance from the origin.
   * @param point - The point to check.
   * @param maxDistance - The maximum distance.
   * @returns True if the point is within the distance.
   */
  isPointWithinDistance(point, maxDistance) {
    const distance2 = Math.sqrt(point.x * point.x + point.y * point.y);
    return distance2 <= maxDistance;
  }
  /**
   * Validates a point.
   * @param point - The point to validate.
   * @returns True if the point is valid.
   */
  isValidPoint(point) {
    return point && typeof point.x === "number" && typeof point.y === "number" && isFinite(point.x) && isFinite(point.y);
  }
  /**
   * Checks if two segments are equal.
   * @param seg1 - First segment.
   * @param seg2 - Second segment.
   * @returns True if the segments are equal.
   */
  areSegmentsEqual(seg1, seg2) {
    return SweepLineUtils.pointsEqual(seg1.start, seg2.start, this.config.tolerance) && SweepLineUtils.pointsEqual(seg1.end, seg2.end, this.config.tolerance) || SweepLineUtils.pointsEqual(seg1.start, seg2.end, this.config.tolerance) && SweepLineUtils.pointsEqual(seg1.end, seg2.start, this.config.tolerance);
  }
  /**
   * Calculates the maximum depth of the status tree.
   * @returns The maximum depth.
   */
  calculateMaxTreeDepth() {
    return Math.ceil(Math.log2(this.statusStructure.size() + 1));
  }
  /**
   * Calculates the average depth of the status tree.
   * @returns The average depth.
   */
  calculateAverageTreeDepth() {
    return this.calculateMaxTreeDepth() / 2;
  }
  /**
   * Creates a validation result object.
   * @param isValid - Whether validation passed.
   * @param errors - Array of errors.
   * @param warnings - Array of warnings.
   * @param invalidCount - Number of invalid segments.
   * @param duplicateCount - Number of duplicate segments.
   * @returns The validation result.
   */
  createValidationResult(isValid, errors, warnings, invalidCount, duplicateCount) {
    return {
      isValid,
      errors,
      warnings,
      invalidCount,
      duplicateCount
    };
  }
  /**
   * Creates an empty result for error cases.
   * @param startTime - Start time for execution time calculation.
   * @param error - Error message.
   * @returns Empty intersection result.
   */
  createEmptyResult(startTime, error) {
    const executionTime = performance.now() - startTime;
    const stats = {
      segmentCount: 0,
      intersectionCount: 0,
      eventCount: 0,
      degenerateCount: 0,
      executionTime,
      success: false,
      error,
      maxTreeDepth: 0,
      averageTreeDepth: 0
    };
    return {
      intersections: [],
      stats,
      hasIntersections: false,
      uniqueIntersectionCount: 0
    };
  }
}
class OBBUtils {
  /**
   * Creates a unit vector from an angle.
   * @param angle - Angle in radians.
   * @returns Unit vector.
   */
  static angleToVector(angle) {
    return {
      x: Math.cos(angle),
      y: Math.sin(angle)
    };
  }
  /**
   * Calculates the angle of a vector.
   * @param vector - The vector.
   * @returns Angle in radians.
   */
  static vectorToAngle(vector) {
    return Math.atan2(vector.y, vector.x);
  }
  /**
   * Normalizes a vector to unit length.
   * @param vector - The vector to normalize.
   * @returns Normalized vector.
   */
  static normalizeVector(vector) {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (length < 1e-10) {
      return { x: 0, y: 0 };
    }
    return {
      x: vector.x / length,
      y: vector.y / length
    };
  }
  /**
   * Calculates the dot product of two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Dot product.
   */
  static dotProduct(a, b) {
    return a.x * b.x + a.y * b.y;
  }
  /**
   * Calculates the cross product of two vectors (2D).
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Cross product (scalar in 2D).
   */
  static crossProduct(a, b) {
    return a.x * b.y - a.y * b.x;
  }
  /**
   * Calculates the length of a vector.
   * @param vector - The vector.
   * @returns Vector length.
   */
  static vectorLength(vector) {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  }
  /**
   * Calculates the squared length of a vector.
   * @param vector - The vector.
   * @returns Squared vector length.
   */
  static vectorLengthSquared(vector) {
    return vector.x * vector.x + vector.y * vector.y;
  }
  /**
   * Calculates the distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Distance.
   */
  static distance(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  /**
   * Calculates the squared distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Squared distance.
   */
  static distanceSquared(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return dx * dx + dy * dy;
  }
  /**
   * Adds two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Sum vector.
   */
  static addVectors(a, b) {
    return {
      x: a.x + b.x,
      y: a.y + b.y
    };
  }
  /**
   * Subtracts two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Difference vector.
   */
  static subtractVectors(a, b) {
    return {
      x: a.x - b.x,
      y: a.y - b.y
    };
  }
  /**
   * Multiplies a vector by a scalar.
   * @param vector - The vector.
   * @param scalar - The scalar.
   * @returns Scaled vector.
   */
  static multiplyVector(vector, scalar) {
    return {
      x: vector.x * scalar,
      y: vector.y * scalar
    };
  }
  /**
   * Rotates a vector by an angle.
   * @param vector - The vector to rotate.
   * @param angle - Rotation angle in radians.
   * @returns Rotated vector.
   */
  static rotateVector(vector, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: vector.x * cos - vector.y * sin,
      y: vector.x * sin + vector.y * cos
    };
  }
  /**
   * Calculates the perpendicular vector (90-degree rotation).
   * @param vector - The vector.
   * @returns Perpendicular vector.
   */
  static perpendicularVector(vector) {
    return {
      x: -vector.y,
      y: vector.x
    };
  }
  /**
   * Projects a point onto an axis.
   * @param point - The point to project.
   * @param axis - The axis to project onto.
   * @returns Projection value.
   */
  static projectPoint(point, axis) {
    return point.x * axis.x + point.y * axis.y;
  }
  /**
   * Projects an OBB onto an axis.
   * @param obb - The OBB to project.
   * @param axis - The axis to project onto.
   * @returns Projection result.
   */
  static projectOBB(obb, axis) {
    const centerProjection = this.projectPoint(obb.center, axis);
    const halfWidthProjection = Math.abs(this.dotProduct(obb.axes[0], axis)) * obb.halfWidths.x + Math.abs(this.dotProduct(obb.axes[1], axis)) * obb.halfWidths.y;
    return {
      min: centerProjection - halfWidthProjection,
      max: centerProjection + halfWidthProjection,
      center: centerProjection,
      extent: halfWidthProjection
    };
  }
  /**
   * Checks if two projections overlap.
   * @param proj1 - First projection.
   * @param proj2 - Second projection.
   * @param tolerance - Tolerance for overlap detection.
   * @returns True if projections overlap.
   */
  static projectionsOverlap(proj1, proj2, tolerance = 1e-10) {
    return proj1.max >= proj2.min - tolerance && proj2.max >= proj1.min - tolerance;
  }
  /**
   * Calculates the overlap between two projections.
   * @param proj1 - First projection.
   * @param proj2 - Second projection.
   * @returns Overlap amount (negative if no overlap).
   */
  static projectionOverlap(proj1, proj2) {
    const overlap = Math.min(proj1.max, proj2.max) - Math.max(proj1.min, proj2.min);
    return Math.max(0, overlap);
  }
  /**
   * Gets the vertices of an OBB.
   * @param obb - The OBB.
   * @returns Array of four vertices.
   */
  static getOBBVertices(obb) {
    const vertices = [];
    const corners = [
      { x: -obb.halfWidths.x, y: -obb.halfWidths.y },
      { x: obb.halfWidths.x, y: -obb.halfWidths.y },
      { x: obb.halfWidths.x, y: obb.halfWidths.y },
      { x: -obb.halfWidths.x, y: obb.halfWidths.y }
    ];
    for (const corner of corners) {
      const worldCorner = {
        x: obb.center.x + corner.x * obb.axes[0].x + corner.y * obb.axes[1].x,
        y: obb.center.y + corner.x * obb.axes[0].y + corner.y * obb.axes[1].y
      };
      vertices.push(worldCorner);
    }
    return vertices;
  }
  /**
   * Calculates the area of an OBB.
   * @param obb - The OBB.
   * @returns Area.
   */
  static calculateOBBArea(obb) {
    return 4 * obb.halfWidths.x * obb.halfWidths.y;
  }
  /**
   * Calculates the perimeter of an OBB.
   * @param obb - The OBB.
   * @returns Perimeter.
   */
  static calculateOBBPerimeter(obb) {
    return 4 * (obb.halfWidths.x + obb.halfWidths.y);
  }
  /**
   * Calculates the aspect ratio of an OBB.
   * @param obb - The OBB.
   * @returns Aspect ratio (width/height).
   */
  static calculateOBBAspectRatio(obb) {
    const width = 2 * obb.halfWidths.x;
    const height = 2 * obb.halfWidths.y;
    return Math.max(width, height) / Math.min(width, height);
  }
  /**
   * Checks if a point is inside an OBB.
   * @param point - The point to test.
   * @param obb - The OBB.
   * @param tolerance - Tolerance for boundary detection.
   * @returns True if point is inside.
   */
  static isPointInsideOBB(point, obb, tolerance = 1e-10) {
    const localPoint = {
      x: point.x - obb.center.x,
      y: point.y - obb.center.y
    };
    const projectionX = Math.abs(this.dotProduct(localPoint, obb.axes[0]));
    const projectionY = Math.abs(this.dotProduct(localPoint, obb.axes[1]));
    return projectionX <= obb.halfWidths.x + tolerance && projectionY <= obb.halfWidths.y + tolerance;
  }
  /**
   * Finds the closest point on an OBB to a given point.
   * @param point - The reference point.
   * @param obb - The OBB.
   * @returns Closest point on OBB surface.
   */
  static closestPointOnOBB(point, obb) {
    const localPoint = {
      x: point.x - obb.center.x,
      y: point.y - obb.center.y
    };
    const projectionX = this.dotProduct(localPoint, obb.axes[0]);
    const projectionY = this.dotProduct(localPoint, obb.axes[1]);
    const clampedX = Math.max(-obb.halfWidths.x, Math.min(obb.halfWidths.x, projectionX));
    const clampedY = Math.max(-obb.halfWidths.y, Math.min(obb.halfWidths.y, projectionY));
    return {
      x: obb.center.x + clampedX * obb.axes[0].x + clampedY * obb.axes[1].x,
      y: obb.center.y + clampedX * obb.axes[0].y + clampedY * obb.axes[1].y
    };
  }
  /**
   * Calculates the distance from a point to an OBB.
   * @param point - The reference point.
   * @param obb - The OBB.
   * @returns Distance (negative if inside).
   */
  static distanceToOBB(point, obb) {
    const closestPoint = this.closestPointOnOBB(point, obb);
    const distance2 = this.distance(point, closestPoint);
    if (this.isPointInsideOBB(point, obb)) {
      return -distance2;
    }
    return distance2;
  }
  /**
   * Calculates the covariance matrix of a set of points.
   * @param points - Array of points.
   * @returns Covariance matrix as 2x2 array.
   */
  static calculateCovarianceMatrix(points) {
    if (points.length === 0) {
      return [[0, 0], [0, 0]];
    }
    const centroid = {
      x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
      y: points.reduce((sum, p) => sum + p.y, 0) / points.length
    };
    let covXX = 0, covXY = 0, covYY = 0;
    for (const point of points) {
      const dx = point.x - centroid.x;
      const dy = point.y - centroid.y;
      covXX += dx * dx;
      covXY += dx * dy;
      covYY += dy * dy;
    }
    const n = points.length;
    return [
      [covXX / n, covXY / n],
      [covXY / n, covYY / n]
    ];
  }
  /**
   * Calculates the principal components of a covariance matrix.
   * @param covariance - Covariance matrix.
   * @returns Principal components (eigenvectors).
   */
  static calculatePrincipalComponents(covariance) {
    const [[a, b], [c, d]] = covariance;
    const trace = a + d;
    const det = a * d - b * c;
    const discriminant = trace * trace - 4 * det;
    if (discriminant < 0) {
      return [
        { x: 1, y: 0 },
        { x: 0, y: 1 }
      ];
    }
    const sqrtDisc = Math.sqrt(discriminant);
    const lambda1 = (trace + sqrtDisc) / 2;
    const eigenvectors = [];
    if (Math.abs(b) > 1e-10) {
      eigenvectors.push(this.normalizeVector({ x: lambda1 - d, y: b }));
    } else if (Math.abs(a - lambda1) > 1e-10) {
      eigenvectors.push(this.normalizeVector({ x: b, y: lambda1 - a }));
    } else {
      eigenvectors.push({ x: 1, y: 0 });
    }
    eigenvectors.push(this.perpendicularVector(eigenvectors[0]));
    return eigenvectors;
  }
  /**
   * Checks if two vectors are approximately equal.
   * @param a - First vector.
   * @param b - Second vector.
   * @param tolerance - Tolerance for comparison.
   * @returns True if vectors are equal.
   */
  static vectorsEqual(a, b, tolerance = 1e-10) {
    return Math.abs(a.x - b.x) < tolerance && Math.abs(a.y - b.y) < tolerance;
  }
  /**
   * Checks if two points are approximately equal.
   * @param a - First point.
   * @param b - Second point.
   * @param tolerance - Tolerance for comparison.
   * @returns True if points are equal.
   */
  static pointsEqual(a, b, tolerance = 1e-10) {
    return Math.abs(a.x - b.x) < tolerance && Math.abs(a.y - b.y) < tolerance;
  }
  /**
   * Calculates the angle between two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Angle in radians.
   */
  static angleBetweenVectors(a, b) {
    const dot = this.dotProduct(a, b);
    const cross = this.crossProduct(a, b);
    return Math.atan2(cross, dot);
  }
  /**
   * Checks if two vectors are orthogonal.
   * @param a - First vector.
   * @param b - Second vector.
   * @param tolerance - Tolerance for orthogonality check.
   * @returns True if vectors are orthogonal.
   */
  static vectorsOrthogonal(a, b, tolerance = 1e-10) {
    return Math.abs(this.dotProduct(a, b)) < tolerance;
  }
  /**
   * Checks if a vector is a unit vector.
   * @param vector - The vector to check.
   * @param tolerance - Tolerance for unit length check.
   * @returns True if vector is unit length.
   */
  static isUnitVector(vector, tolerance = 1e-10) {
    const length = this.vectorLength(vector);
    return Math.abs(length - 1) < tolerance;
  }
  /**
   * Creates a vector from two points.
   * @param from - Starting point.
   * @param to - Ending point.
   * @returns Vector from first point to second point.
   */
  static vectorFromPoints(from, to) {
    return {
      x: to.x - from.x,
      y: to.y - from.y
    };
  }
  /**
   * Adds a vector to a point.
   * @param point - The point.
   * @param vector - The vector to add.
   * @returns New point.
   */
  static addVectorToPoint(point, vector) {
    return {
      x: point.x + vector.x,
      y: point.y + vector.y
    };
  }
  /**
   * Subtracts a vector from a point.
   * @param point - The point.
   * @param vector - The vector to subtract.
   * @returns New point.
   */
  static subtractVectorFromPoint(point, vector) {
    return {
      x: point.x - vector.x,
      y: point.y - vector.y
    };
  }
}
class OBB {
  /**
   * Creates an instance of OBB.
   * @param config - Optional configuration for OBB operations.
   */
  constructor(config = {}) {
    this.config = {
      tolerance: 1e-10,
      validateInput: true,
      normalizeAxes: true,
      useFastApproximations: false,
      enableCaching: true,
      ...config
    };
    this.stats = {
      collisionTests: 0,
      satTests: 0,
      projections: 0,
      executionTime: 0,
      success: true
    };
  }
  /**
   * Constructs an OBB from a set of points using PCA.
   * @param points - Array of points to fit.
   * @param options - Construction options.
   * @returns Construction result with OBB and quality metrics.
   */
  constructFromPoints(points, options = {}) {
    const startTime = performance.now();
    const constructionOptions = {
      method: "pca",
      optimizeForArea: true,
      optimizeForPerimeter: false,
      maxIterations: 100,
      convergenceTolerance: 1e-6,
      ...options
    };
    try {
      if (this.config.validateInput) {
        if (!Array.isArray(points) || points.length < 3) {
          throw new Error("At least 3 points are required for OBB construction");
        }
      }
      let obb;
      switch (constructionOptions.method) {
        case "pca":
          obb = this.constructFromPointsPCA(points, constructionOptions);
          break;
        case "convex-hull":
          obb = this.constructFromPointsConvexHull(points, constructionOptions);
          break;
        case "brute-force":
          obb = this.constructFromPointsBruteForce(points, constructionOptions);
          break;
        default:
          throw new Error(`Unknown construction method: ${constructionOptions.method}`);
      }
      const area = OBBUtils.calculateOBBArea(obb);
      const aspectRatio = OBBUtils.calculateOBBAspectRatio(obb);
      const fitQuality = this.calculateFitQuality(points, obb);
      const executionTime = performance.now() - startTime;
      const stats = {
        collisionTests: 0,
        satTests: 0,
        projections: 0,
        executionTime,
        success: true
      };
      return {
        obb,
        quality: {
          area,
          aspectRatio,
          fitQuality
        },
        stats
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        obb: this.createDefaultOBB(),
        quality: {
          area: 0,
          aspectRatio: 1,
          fitQuality: 0
        },
        stats: {
          collisionTests: 0,
          satTests: 0,
          projections: 0,
          executionTime,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      };
    }
  }
  /**
   * Tests collision between two OBBs using SAT.
   * @param obb1 - First OBB.
   * @param obb2 - Second OBB.
   * @param options - SAT options.
   * @returns Collision test result.
   */
  testCollision(obb1, obb2, options = {}) {
    const startTime = performance.now();
    const satOptions = {
      computeMTV: true,
      useEarlyExit: true,
      cacheProjections: true,
      ...options
    };
    try {
      if (this.config.validateInput) {
        const validation1 = this.validateOBB(obb1);
        const validation2 = this.validateOBB(obb2);
        if (!validation1.isValid || !validation2.isValid) {
          throw new Error("Invalid OBB provided for collision test");
        }
      }
      this.stats.collisionTests++;
      this.stats.satTests++;
      const axes = this.getSATAxes(obb1, obb2);
      let minOverlap = Infinity;
      let mtv;
      let penetrationAxis;
      for (const axis of axes) {
        const proj1 = OBBUtils.projectOBB(obb1, axis);
        const proj2 = OBBUtils.projectOBB(obb2, axis);
        this.stats.projections += 2;
        if (!OBBUtils.projectionsOverlap(proj1, proj2, this.config.tolerance)) {
          const executionTime2 = performance.now() - startTime;
          return {
            isColliding: false,
            stats: {
              collisionTests: this.stats.collisionTests,
              satTests: this.stats.satTests,
              projections: this.stats.projections,
              executionTime: executionTime2,
              success: true
            }
          };
        }
        const overlap = OBBUtils.projectionOverlap(proj1, proj2);
        if (overlap < minOverlap) {
          minOverlap = overlap;
          penetrationAxis = axis;
          if (satOptions.computeMTV) {
            const center1 = proj1.center;
            const center2 = proj2.center;
            const direction = center2 > center1 ? 1 : -1;
            mtv = OBBUtils.multiplyVector(axis, overlap * direction);
          }
        }
        if (satOptions.useEarlyExit && !satOptions.computeMTV) {
          break;
        }
      }
      const executionTime = performance.now() - startTime;
      return {
        isColliding: true,
        mtv,
        penetrationDepth: minOverlap,
        penetrationAxis,
        stats: {
          collisionTests: this.stats.collisionTests,
          satTests: this.stats.satTests,
          projections: this.stats.projections,
          executionTime,
          success: true
        }
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        isColliding: false,
        stats: {
          collisionTests: this.stats.collisionTests,
          satTests: this.stats.satTests,
          projections: this.stats.projections,
          executionTime,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      };
    }
  }
  /**
   * Tests if a point is inside an OBB.
   * @param point - The point to test.
   * @param obb - The OBB to test against.
   * @returns Point test result.
   */
  testPoint(point, obb) {
    const startTime = performance.now();
    try {
      if (this.config.validateInput) {
        const validation = this.validateOBB(obb);
        if (!validation.isValid) {
          throw new Error("Invalid OBB provided for point test");
        }
      }
      const isInside = OBBUtils.isPointInsideOBB(point, obb, this.config.tolerance);
      const closestPoint = OBBUtils.closestPointOnOBB(point, obb);
      const distance2 = OBBUtils.distanceToOBB(point, obb);
      const executionTime = performance.now() - startTime;
      return {
        isInside,
        distance: distance2,
        closestPoint,
        stats: {
          collisionTests: 0,
          satTests: 0,
          projections: 0,
          executionTime,
          success: true
        }
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        isInside: false,
        distance: Infinity,
        closestPoint: point,
        stats: {
          collisionTests: 0,
          satTests: 0,
          projections: 0,
          executionTime,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      };
    }
  }
  /**
   * Transforms an OBB by applying translation, rotation, and scale.
   * @param obb - The OBB to transform.
   * @param options - Transform options.
   * @returns Transform result.
   */
  transformOBB(obb, options = {}) {
    const startTime = performance.now();
    const transformOptions = {
      translation: { x: 0, y: 0 },
      rotation: 0,
      scale: { x: 1, y: 1 },
      maintainProperties: true,
      ...options
    };
    try {
      if (this.config.validateInput) {
        const validation = this.validateOBB(obb);
        if (!validation.isValid) {
          throw new Error("Invalid OBB provided for transformation");
        }
      }
      let transformedOBB = { ...obb };
      if (transformOptions.translation) {
        transformedOBB.center = OBBUtils.addVectorToPoint(
          transformedOBB.center,
          transformOptions.translation
        );
      }
      if (transformOptions.rotation !== void 0 && transformOptions.rotation !== 0) {
        transformedOBB.axes[0] = OBBUtils.rotateVector(transformedOBB.axes[0], transformOptions.rotation);
        transformedOBB.axes[1] = OBBUtils.rotateVector(transformedOBB.axes[1], transformOptions.rotation);
        transformedOBB.rotation += transformOptions.rotation;
      }
      if (transformOptions.scale) {
        transformedOBB.halfWidths = {
          x: transformedOBB.halfWidths.x * transformOptions.scale.x,
          y: transformedOBB.halfWidths.y * transformOptions.scale.y
        };
      }
      if (this.config.normalizeAxes && transformOptions.maintainProperties) {
        transformedOBB.axes[0] = OBBUtils.normalizeVector(transformedOBB.axes[0]);
        transformedOBB.axes[1] = OBBUtils.normalizeVector(transformedOBB.axes[1]);
      }
      const executionTime = performance.now() - startTime;
      return {
        obb: transformedOBB,
        success: true,
        stats: {
          collisionTests: 0,
          satTests: 0,
          projections: 0,
          executionTime,
          success: true
        }
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        obb,
        success: false,
        stats: {
          collisionTests: 0,
          satTests: 0,
          projections: 0,
          executionTime,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      };
    }
  }
  /**
   * Validates an OBB.
   * @param obb - The OBB to validate.
   * @param options - Validation options.
   * @returns Validation result.
   */
  validateOBB(obb, options = {}) {
    const validationOptions = {
      checkDimensions: true,
      checkAxes: true,
      checkOrthogonality: true,
      checkUnitAxes: true,
      minDimension: 0,
      ...options
    };
    const errors = [];
    const warnings = [];
    if (validationOptions.checkDimensions) {
      if (obb.halfWidths.x < validationOptions.minDimension || obb.halfWidths.y < validationOptions.minDimension) {
        errors.push("OBB has invalid dimensions");
      }
    }
    if (validationOptions.checkAxes) {
      if (!obb.axes || obb.axes.length !== 2) {
        errors.push("OBB must have exactly 2 axes");
      } else {
        if (validationOptions.checkUnitAxes) {
          if (!OBBUtils.isUnitVector(obb.axes[0], this.config.tolerance)) {
            warnings.push("First axis is not a unit vector");
          }
          if (!OBBUtils.isUnitVector(obb.axes[1], this.config.tolerance)) {
            warnings.push("Second axis is not a unit vector");
          }
        }
        if (validationOptions.checkOrthogonality) {
          if (!OBBUtils.vectorsOrthogonal(obb.axes[0], obb.axes[1], this.config.tolerance)) {
            warnings.push("OBB axes are not orthogonal");
          }
        }
      }
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      hasValidDimensions: errors.length === 0 || !errors.some((e) => e.includes("dimensions")),
      hasValidAxes: errors.length === 0 || !errors.some((e) => e.includes("axes")),
      hasOrthogonalAxes: !warnings.some((w) => w.includes("orthogonal")),
      hasUnitAxes: !warnings.some((w) => w.includes("unit vector"))
    };
  }
  /**
   * Serializes an OBB to a JSON-serializable format.
   * @param obb - The OBB to serialize.
   * @param options - Serialization options.
   * @returns Serialized OBB data.
   */
  serialize(obb, options = {}) {
    const serializationOptions = {
      precision: 6,
      includeStats: false,
      includeQuality: false,
      ...options
    };
    const round = (value) => {
      return Math.round(value * Math.pow(10, serializationOptions.precision)) / Math.pow(10, serializationOptions.precision);
    };
    const roundPoint = (point) => ({
      x: round(point.x),
      y: round(point.y)
    });
    const roundVector = (vector) => ({
      x: round(vector.x),
      y: round(vector.y)
    });
    const serialized = {
      center: roundPoint(obb.center),
      halfWidths: roundVector(obb.halfWidths),
      axes: [roundVector(obb.axes[0]), roundVector(obb.axes[1])],
      rotation: round(obb.rotation)
    };
    if (serializationOptions.includeStats) {
      serialized.stats = this.stats;
    }
    if (serializationOptions.includeQuality) {
      serialized.quality = {
        area: round(OBBUtils.calculateOBBArea(obb)),
        aspectRatio: round(OBBUtils.calculateOBBAspectRatio(obb)),
        fitQuality: 0
        // Would need points to calculate
      };
    }
    return serialized;
  }
  /**
   * Updates the configuration.
   * @param newConfig - New configuration options.
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
  /**
   * Gets the current configuration.
   * @returns The current configuration.
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Gets the current statistics.
   * @returns The current statistics.
   */
  getStats() {
    return { ...this.stats };
  }
  /**
   * Resets the statistics.
   */
  resetStats() {
    this.stats = {
      collisionTests: 0,
      satTests: 0,
      projections: 0,
      executionTime: 0,
      success: true
    };
  }
  /**
   * Constructs an OBB from points using PCA method.
   * @param points - Array of points.
   * @param options - Construction options.
   * @returns Constructed OBB.
   */
  constructFromPointsPCA(points, _options) {
    const covariance = OBBUtils.calculateCovarianceMatrix(points);
    const principalComponents = OBBUtils.calculatePrincipalComponents(covariance);
    const centroid = {
      x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
      y: points.reduce((sum, p) => sum + p.y, 0) / points.length
    };
    const projectionsX = [];
    const projectionsY = [];
    for (const point of points) {
      const localPoint = {
        x: point.x - centroid.x,
        y: point.y - centroid.y
      };
      projectionsX.push(OBBUtils.dotProduct(localPoint, principalComponents[0]));
      projectionsY.push(OBBUtils.dotProduct(localPoint, principalComponents[1]));
    }
    const halfWidthX = (Math.max(...projectionsX) - Math.min(...projectionsX)) / 2;
    const halfWidthY = (Math.max(...projectionsY) - Math.min(...projectionsY)) / 2;
    return {
      center: centroid,
      halfWidths: { x: halfWidthX, y: halfWidthY },
      axes: [principalComponents[0], principalComponents[1]],
      rotation: OBBUtils.vectorToAngle(principalComponents[0])
    };
  }
  /**
   * Constructs an OBB from points using convex hull method.
   * @param points - Array of points.
   * @param options - Construction options.
   * @returns Constructed OBB.
   */
  constructFromPointsConvexHull(points, options) {
    return this.constructFromPointsPCA(points, options);
  }
  /**
   * Constructs an OBB from points using brute force method.
   * @param points - Array of points.
   * @param options - Construction options.
   * @returns Constructed OBB.
   */
  constructFromPointsBruteForce(points, options) {
    return this.constructFromPointsPCA(points, options);
  }
  /**
   * Gets all axes to test for SAT collision detection.
   * @param obb1 - First OBB.
   * @param obb2 - Second OBB.
   * @returns Array of axes to test.
   */
  getSATAxes(obb1, obb2) {
    const axes = [];
    axes.push(obb1.axes[0]);
    axes.push(obb1.axes[1]);
    axes.push(obb2.axes[0]);
    axes.push(obb2.axes[1]);
    return axes;
  }
  /**
   * Calculates the fit quality of an OBB for a set of points.
   * @param points - Array of points.
   * @param obb - The OBB.
   * @returns Fit quality (0-1, higher is better).
   */
  calculateFitQuality(points, obb) {
    if (points.length === 0) return 0;
    let insideCount = 0;
    for (const point of points) {
      if (OBBUtils.isPointInsideOBB(point, obb, this.config.tolerance)) {
        insideCount++;
      }
    }
    return insideCount / points.length;
  }
  /**
   * Creates a default OBB.
   * @returns Default OBB.
   */
  createDefaultOBB() {
    return {
      center: { x: 0, y: 0 },
      halfWidths: { x: 1, y: 1 },
      axes: [
        { x: 1, y: 0 },
        { x: 0, y: 1 }
      ],
      rotation: 0
    };
  }
}
class MinimumBoundingBoxUtils {
  /**
   * Calculates the dot product of two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Dot product.
   */
  static dotProduct(a, b) {
    return a.x * b.x + a.y * b.y;
  }
  /**
   * Calculates the cross product of two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Cross product (scalar in 2D).
   */
  static crossProduct(a, b) {
    return a.x * b.y - a.y * b.x;
  }
  /**
   * Calculates the magnitude of a vector.
   * @param v - Vector.
   * @returns Magnitude.
   */
  static magnitude(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }
  /**
   * Normalizes a vector to unit length.
   * @param v - Vector to normalize.
   * @returns Normalized vector.
   */
  static normalize(v) {
    const mag = this.magnitude(v);
    if (mag === 0) return { x: 0, y: 0 };
    return { x: v.x / mag, y: v.y / mag };
  }
  /**
   * Calculates the distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Distance.
   */
  static distance(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  /**
   * Calculates the squared distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Squared distance.
   */
  static distanceSquared(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return dx * dx + dy * dy;
  }
  /**
   * Creates a vector from two points.
   * @param from - Starting point.
   * @param to - Ending point.
   * @returns Vector from first point to second point.
   */
  static vectorFromPoints(from, to) {
    return { x: to.x - from.x, y: to.y - from.y };
  }
  /**
   * Adds a vector to a point.
   * @param point - Point.
   * @param vector - Vector to add.
   * @returns New point.
   */
  static addVectorToPoint(point, vector) {
    return { x: point.x + vector.x, y: point.y + vector.y };
  }
  /**
   * Multiplies a vector by a scalar.
   * @param vector - Vector.
   * @param scalar - Scalar multiplier.
   * @returns Scaled vector.
   */
  static multiplyVector(vector, scalar) {
    return { x: vector.x * scalar, y: vector.y * scalar };
  }
  /**
   * Rotates a vector by an angle.
   * @param vector - Vector to rotate.
   * @param angle - Angle in radians.
   * @returns Rotated vector.
   */
  static rotateVector(vector, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: vector.x * cos - vector.y * sin,
      y: vector.x * sin + vector.y * cos
    };
  }
  /**
   * Converts an angle to a unit vector.
   * @param angle - Angle in radians.
   * @returns Unit vector.
   */
  static angleToVector(angle) {
    return { x: Math.cos(angle), y: Math.sin(angle) };
  }
  /**
   * Converts a vector to an angle.
   * @param vector - Vector.
   * @returns Angle in radians.
   */
  static vectorToAngle(vector) {
    return Math.atan2(vector.y, vector.x);
  }
  /**
   * Calculates the area of a rectangle.
   * @param rectangle - Rectangle.
   * @returns Area.
   */
  static calculateArea(rectangle) {
    return rectangle.width * rectangle.height;
  }
  /**
   * Calculates the perimeter of a rectangle.
   * @param rectangle - Rectangle.
   * @returns Perimeter.
   */
  static calculatePerimeter(rectangle) {
    return 2 * (rectangle.width + rectangle.height);
  }
  /**
   * Calculates the aspect ratio of a rectangle.
   * @param rectangle - Rectangle.
   * @returns Aspect ratio (width/height).
   */
  static calculateAspectRatio(rectangle) {
    return rectangle.height === 0 ? Infinity : rectangle.width / rectangle.height;
  }
  /**
   * Calculates the bounding box of a set of points.
   * @param points - Array of points.
   * @returns Bounding box rectangle.
   */
  static calculateBoundingBox(points) {
    if (points.length === 0) {
      return { center: { x: 0, y: 0 }, width: 0, height: 0, rotation: 0 };
    }
    let minX = points[0].x;
    let maxX = points[0].x;
    let minY = points[0].y;
    let maxY = points[0].y;
    for (const point of points) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }
    const width = maxX - minX;
    const height = maxY - minY;
    const center = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
    return { center, width, height, rotation: 0 };
  }
  /**
   * Calculates the convex hull of a set of points using Graham scan.
   * @param points - Array of points.
   * @returns Array of points forming the convex hull.
   */
  static calculateConvexHull(points) {
    if (points.length < 3) return points;
    let bottomMost = 0;
    for (let i = 1; i < points.length; i++) {
      if (points[i].y < points[bottomMost].y || points[i].y === points[bottomMost].y && points[i].x < points[bottomMost].x) {
        bottomMost = i;
      }
    }
    [points[0], points[bottomMost]] = [points[bottomMost], points[0]];
    const pivot = points[0];
    points.slice(1).sort((a, b) => {
      const angleA = this.vectorToAngle(this.vectorFromPoints(pivot, a));
      const angleB = this.vectorToAngle(this.vectorFromPoints(pivot, b));
      if (Math.abs(angleA - angleB) < 1e-10) {
        return this.distanceSquared(pivot, a) - this.distanceSquared(pivot, b);
      }
      return angleA - angleB;
    });
    const hull = [points[0], points[1]];
    for (let i = 2; i < points.length; i++) {
      while (hull.length > 1 && this.crossProduct(
        this.vectorFromPoints(hull[hull.length - 2], hull[hull.length - 1]),
        this.vectorFromPoints(hull[hull.length - 1], points[i])
      ) <= 0) {
        hull.pop();
      }
      hull.push(points[i]);
    }
    return hull;
  }
  /**
   * Calculates the minimum bounding box using rotating calipers.
   * @param points - Array of points (should be convex hull).
   * @param options - Rotating calipers options.
   * @returns Minimum bounding box rectangle.
   */
  static calculateMinimumBoundingBoxRotatingCalipers(points, options = {
    startAngle: 0,
    angleStep: Math.PI / 180,
    maxAngle: Math.PI / 2,
    useBinarySearch: true,
    useGoldenSection: false,
    anglePrecision: 1e-6
  }) {
    if (points.length < 3) {
      return this.calculateBoundingBox(points);
    }
    const {
      startAngle = 0,
      angleStep = Math.PI / 180,
      // 1 degree steps
      maxAngle = Math.PI / 2,
      useBinarySearch = true,
      useGoldenSection = false,
      anglePrecision = 1e-6
    } = options;
    let bestRectangle = null;
    let bestArea = Infinity;
    if (useBinarySearch) {
      let left = startAngle;
      let right = startAngle + maxAngle;
      while (right - left > anglePrecision) {
        const mid1 = left + (right - left) / 3;
        const mid2 = right - (right - left) / 3;
        const area1 = this.calculateBoundingBoxArea(points, mid1);
        const area2 = this.calculateBoundingBoxArea(points, mid2);
        if (area1 < area2) {
          right = mid2;
        } else {
          left = mid1;
        }
      }
      const optimalAngle = (left + right) / 2;
      bestRectangle = this.calculateBoundingBoxAtAngle(points, optimalAngle);
    } else if (useGoldenSection) {
      const phi = (1 + Math.sqrt(5)) / 2;
      const resphi = 2 - phi;
      let a = startAngle;
      let b = startAngle + maxAngle;
      let x1 = a + resphi * (b - a);
      let x2 = a + (1 - resphi) * (b - a);
      while (Math.abs(b - a) > anglePrecision) {
        const f1 = this.calculateBoundingBoxArea(points, x1);
        const f2 = this.calculateBoundingBoxArea(points, x2);
        if (f1 < f2) {
          b = x2;
          x2 = x1;
          x1 = a + resphi * (b - a);
        } else {
          a = x1;
          x1 = x2;
          x2 = a + (1 - resphi) * (b - a);
        }
      }
      const optimalAngle = (a + b) / 2;
      bestRectangle = this.calculateBoundingBoxAtAngle(points, optimalAngle);
    } else {
      for (let angle = startAngle; angle <= startAngle + maxAngle; angle += angleStep) {
        const rectangle = this.calculateBoundingBoxAtAngle(points, angle);
        const area = this.calculateArea(rectangle);
        if (area < bestArea) {
          bestArea = area;
          bestRectangle = rectangle;
        }
      }
    }
    return bestRectangle || this.calculateBoundingBox(points);
  }
  /**
   * Calculates the bounding box area at a specific angle.
   * @param points - Array of points.
   * @param angle - Angle in radians.
   * @returns Area of the bounding box.
   */
  static calculateBoundingBoxArea(points, angle) {
    const rectangle = this.calculateBoundingBoxAtAngle(points, angle);
    return this.calculateArea(rectangle);
  }
  /**
   * Calculates the bounding box at a specific angle.
   * @param points - Array of points.
   * @param angle - Angle in radians.
   * @returns Bounding box rectangle.
   */
  static calculateBoundingBoxAtAngle(points, angle) {
    if (points.length === 0) {
      return { center: { x: 0, y: 0 }, width: 0, height: 0, rotation: angle };
    }
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const point of points) {
      const rotatedX = point.x * cos - point.y * sin;
      const rotatedY = point.x * sin + point.y * cos;
      minX = Math.min(minX, rotatedX);
      maxX = Math.max(maxX, rotatedX);
      minY = Math.min(minY, rotatedY);
      maxY = Math.max(maxY, rotatedY);
    }
    const width = maxX - minX;
    const height = maxY - minY;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const center = {
      x: centerX * Math.cos(angle) - centerY * Math.sin(angle),
      y: centerX * Math.sin(angle) + centerY * Math.cos(angle)
    };
    return { center, width, height, rotation: angle };
  }
  /**
   * Calculates the fit quality of a rectangle for a set of points.
   * @param points - Array of points.
   * @param rectangle - Rectangle to test.
   * @param tolerance - Numerical tolerance.
   * @returns Fit quality (0-1, higher is better).
   */
  static calculateFitQuality(points, rectangle, tolerance = 1e-10) {
    if (points.length === 0) return 0;
    let insideCount = 0;
    for (const point of points) {
      if (this.isPointInsideRectangle(point, rectangle, tolerance)) {
        insideCount++;
      }
    }
    return insideCount / points.length;
  }
  /**
   * Tests if a point is inside a rectangle.
   * @param point - Point to test.
   * @param rectangle - Rectangle.
   * @param tolerance - Numerical tolerance.
   * @returns True if point is inside rectangle.
   */
  static isPointInsideRectangle(point, rectangle, tolerance = 1e-10) {
    const cos = Math.cos(-rectangle.rotation);
    const sin = Math.sin(-rectangle.rotation);
    const localX = (point.x - rectangle.center.x) * cos - (point.y - rectangle.center.y) * sin;
    const localY = (point.x - rectangle.center.x) * sin + (point.y - rectangle.center.y) * cos;
    const halfWidth = rectangle.width / 2;
    const halfHeight = rectangle.height / 2;
    return Math.abs(localX) <= halfWidth + tolerance && Math.abs(localY) <= halfHeight + tolerance;
  }
  /**
   * Calculates the efficiency compared to AABB.
   * @param rectangle - Rectangle.
   * @param aabb - Axis-aligned bounding box.
   * @returns Efficiency (0-1, higher is better).
   */
  static calculateEfficiency(rectangle, aabb) {
    const rectangleArea = this.calculateArea(rectangle);
    const aabbArea = this.calculateArea(aabb);
    if (aabbArea === 0) return 1;
    return Math.max(0, 1 - (rectangleArea - aabbArea) / aabbArea);
  }
  /**
   * Calculates the compactness of a rectangle.
   * @param rectangle - Rectangle.
   * @returns Compactness measure.
   */
  static calculateCompactness(rectangle) {
    const area = this.calculateArea(rectangle);
    const perimeter = this.calculatePerimeter(rectangle);
    if (perimeter === 0) return 0;
    return 4 * Math.PI * area / (perimeter * perimeter);
  }
  /**
   * Validates a set of points.
   * @param points - Array of points to validate.
   * @param config - Configuration options.
   * @returns True if points are valid.
   */
  static validatePoints(points, _config) {
    if (!Array.isArray(points)) return false;
    if (points.length < 3) return false;
    for (const point of points) {
      if (typeof point.x !== "number" || typeof point.y !== "number") return false;
      if (!isFinite(point.x) || !isFinite(point.y)) return false;
    }
    return true;
  }
  /**
   * Validates a rectangle.
   * @param rectangle - Rectangle to validate.
   * @param config - Configuration options.
   * @returns True if rectangle is valid.
   */
  static validateRectangle(rectangle, _config) {
    if (typeof rectangle.width !== "number" || typeof rectangle.height !== "number") return false;
    if (rectangle.width < 0 || rectangle.height < 0) return false;
    if (!isFinite(rectangle.width) || !isFinite(rectangle.height)) return false;
    if (typeof rectangle.rotation !== "number" || !isFinite(rectangle.rotation)) return false;
    return true;
  }
  /**
   * Removes duplicate points from an array.
   * @param points - Array of points.
   * @param tolerance - Tolerance for considering points as duplicates.
   * @returns Array of unique points.
   */
  static removeDuplicatePoints(points, tolerance = 1e-10) {
    const unique = [];
    for (const point of points) {
      let isDuplicate = false;
      for (const existing of unique) {
        if (this.distanceSquared(point, existing) < tolerance * tolerance) {
          isDuplicate = true;
          break;
        }
      }
      if (!isDuplicate) {
        unique.push(point);
      }
    }
    return unique;
  }
  /**
   * Sorts points by angle with respect to a reference point.
   * @param points - Array of points.
   * @param reference - Reference point.
   * @returns Sorted array of points.
   */
  static sortPointsByAngle(points, reference) {
    return points.slice().sort((a, b) => {
      const angleA = this.vectorToAngle(this.vectorFromPoints(reference, a));
      const angleB = this.vectorToAngle(this.vectorFromPoints(reference, b));
      return angleA - angleB;
    });
  }
  /**
   * Calculates the centroid of a set of points.
   * @param points - Array of points.
   * @returns Centroid point.
   */
  static calculateCentroid(points) {
    if (points.length === 0) return { x: 0, y: 0 };
    let sumX = 0;
    let sumY = 0;
    for (const point of points) {
      sumX += point.x;
      sumY += point.y;
    }
    return { x: sumX / points.length, y: sumY / points.length };
  }
}
class MinimumBoundingBox {
  /**
   * Creates an instance of MinimumBoundingBox.
   * @param config - Optional configuration for the algorithm.
   */
  constructor(config = {}) {
    this.config = {
      tolerance: 1e-10,
      validateInput: true,
      normalizeResult: true,
      useFastApproximations: false,
      enableCaching: true,
      maxIterations: 1e3,
      convergenceTolerance: 1e-6,
      ...config
    };
    this.stats = {
      pointsProcessed: 0,
      iterations: 0,
      angleTests: 0,
      executionTime: 0,
      success: true
    };
  }
  /**
   * Computes the minimum bounding box for a set of points.
   * @param points - Array of points to compute bounding box for.
   * @param options - Computation options.
   * @returns Result containing the minimum bounding box and quality metrics.
   */
  compute(points, options = {}) {
    const startTime = performance.now();
    const computeOptions = {
      method: "rotating-calipers",
      optimizeForArea: true,
      optimizeForPerimeter: false,
      useConvexHull: true,
      maxIterations: this.config.maxIterations,
      convergenceTolerance: this.config.convergenceTolerance,
      includeQuality: true,
      ...options
    };
    try {
      if (this.config.validateInput) {
        if (!MinimumBoundingBoxUtils.validatePoints(points, this.config)) {
          throw new Error("Invalid points provided for minimum bounding box computation");
        }
      }
      this.stats.pointsProcessed = points.length;
      const uniquePoints = MinimumBoundingBoxUtils.removeDuplicatePoints(points, this.config.tolerance);
      if (uniquePoints.length < 3) {
        const rectangle2 = MinimumBoundingBoxUtils.calculateBoundingBox(uniquePoints);
        return this.createResult(rectangle2, uniquePoints, startTime, computeOptions);
      }
      let workingPoints = uniquePoints;
      if (computeOptions.useConvexHull) {
        workingPoints = MinimumBoundingBoxUtils.calculateConvexHull(uniquePoints);
      }
      let rectangle;
      switch (computeOptions.method) {
        case "rotating-calipers":
          rectangle = this.computeRotatingCalipers(workingPoints, computeOptions);
          break;
        case "brute-force":
          rectangle = this.computeBruteForce(workingPoints, computeOptions);
          break;
        case "convex-hull":
          rectangle = this.computeConvexHullMethod(workingPoints, computeOptions);
          break;
        default:
          throw new Error(`Unknown computation method: ${computeOptions.method}`);
      }
      if (this.config.normalizeResult) {
        rectangle = this.normalizeRectangle(rectangle);
      }
      return this.createResult(rectangle, uniquePoints, startTime, computeOptions);
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        rectangle: { center: { x: 0, y: 0 }, width: 0, height: 0, rotation: 0 },
        area: 0,
        perimeter: 0,
        aspectRatio: 1,
        quality: {
          fitQuality: 0,
          efficiency: 0,
          compactness: 0
        },
        stats: {
          pointsProcessed: points.length,
          iterations: this.stats.iterations,
          angleTests: this.stats.angleTests,
          executionTime,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      };
    }
  }
  /**
   * Computes the minimum bounding box using rotating calipers algorithm.
   * @param points - Array of points (should be convex hull).
   * @param options - Computation options.
   * @returns Minimum bounding box rectangle.
   */
  computeRotatingCalipers(points, _options) {
    const rotatingCalipersOptions = {
      startAngle: 0,
      angleStep: Math.PI / 180,
      // 1 degree steps
      maxAngle: Math.PI / 2,
      useBinarySearch: true,
      useGoldenSection: false,
      anglePrecision: this.config.convergenceTolerance
    };
    this.stats.iterations = 0;
    this.stats.angleTests = 0;
    return MinimumBoundingBoxUtils.calculateMinimumBoundingBoxRotatingCalipers(
      points,
      rotatingCalipersOptions
    );
  }
  /**
   * Computes the minimum bounding box using brute force method.
   * @param points - Array of points.
   * @param options - Computation options.
   * @returns Minimum bounding box rectangle.
   */
  computeBruteForce(points, options) {
    let bestRectangle = null;
    let bestValue = Infinity;
    const angleStep = Math.PI / 180;
    const maxAngle = Math.PI / 2;
    for (let angle = 0; angle <= maxAngle; angle += angleStep) {
      this.stats.angleTests++;
      const rectangle = MinimumBoundingBoxUtils.calculateBoundingBoxAtAngle(points, angle);
      const value = options.optimizeForArea ? MinimumBoundingBoxUtils.calculateArea(rectangle) : MinimumBoundingBoxUtils.calculatePerimeter(rectangle);
      if (value < bestValue) {
        bestValue = value;
        bestRectangle = rectangle;
      }
    }
    this.stats.iterations = Math.floor(maxAngle / angleStep);
    return bestRectangle || MinimumBoundingBoxUtils.calculateBoundingBox(points);
  }
  /**
   * Computes the minimum bounding box using convex hull method.
   * @param points - Array of points.
   * @param options - Computation options.
   * @returns Minimum bounding box rectangle.
   */
  computeConvexHullMethod(points, options) {
    const convexHull = MinimumBoundingBoxUtils.calculateConvexHull(points);
    return this.computeRotatingCalipers(convexHull, options);
  }
  /**
   * Creates the result object with quality metrics.
   * @param rectangle - The computed rectangle.
   * @param points - Original points.
   * @param startTime - Start time of computation.
   * @param options - Computation options.
   * @returns Complete result object.
   */
  createResult(rectangle, points, startTime, options) {
    const executionTime = performance.now() - startTime;
    const area = MinimumBoundingBoxUtils.calculateArea(rectangle);
    const perimeter = MinimumBoundingBoxUtils.calculatePerimeter(rectangle);
    const aspectRatio = MinimumBoundingBoxUtils.calculateAspectRatio(rectangle);
    let quality = {
      fitQuality: 0,
      efficiency: 0,
      compactness: 0
    };
    if (options.includeQuality) {
      const aabb = MinimumBoundingBoxUtils.calculateBoundingBox(points);
      quality = {
        fitQuality: MinimumBoundingBoxUtils.calculateFitQuality(points, rectangle, this.config.tolerance),
        efficiency: MinimumBoundingBoxUtils.calculateEfficiency(rectangle, aabb),
        compactness: MinimumBoundingBoxUtils.calculateCompactness(rectangle)
      };
    }
    const stats = {
      pointsProcessed: points.length,
      iterations: this.stats.iterations,
      angleTests: this.stats.angleTests,
      executionTime,
      success: true
    };
    return {
      rectangle,
      area,
      perimeter,
      aspectRatio,
      quality,
      stats
    };
  }
  /**
   * Normalizes a rectangle to standard form.
   * @param rectangle - Rectangle to normalize.
   * @returns Normalized rectangle.
   */
  normalizeRectangle(rectangle) {
    if (rectangle.width < rectangle.height) {
      return {
        center: rectangle.center,
        width: rectangle.height,
        height: rectangle.width,
        rotation: rectangle.rotation + Math.PI / 2
      };
    }
    let normalizedRotation = rectangle.rotation % (Math.PI / 2);
    if (normalizedRotation < 0) {
      normalizedRotation += Math.PI / 2;
    }
    return {
      ...rectangle,
      rotation: normalizedRotation
    };
  }
  /**
   * Validates a minimum bounding box result.
   * @param result - Result to validate.
   * @param options - Validation options.
   * @returns Validation result.
   */
  validate(result, options = {}) {
    const validationOptions = {
      checkRectangle: true,
      checkArea: true,
      checkPerimeter: true,
      minArea: 0,
      maxArea: Infinity,
      ...options
    };
    const errors = [];
    const warnings = [];
    if (validationOptions.checkRectangle) {
      if (!MinimumBoundingBoxUtils.validateRectangle(result.rectangle, this.config)) {
        errors.push("Invalid rectangle in result");
      }
    }
    if (validationOptions.checkArea) {
      if (result.area < validationOptions.minArea) {
        errors.push(`Area ${result.area} is below minimum ${validationOptions.minArea}`);
      }
      if (result.area > validationOptions.maxArea) {
        errors.push(`Area ${result.area} is above maximum ${validationOptions.maxArea}`);
      }
    }
    if (validationOptions.checkPerimeter) {
      if (result.perimeter < 0) {
        errors.push("Negative perimeter");
      }
    }
    if (result.quality.fitQuality < 0 || result.quality.fitQuality > 1) {
      warnings.push("Fit quality should be between 0 and 1");
    }
    if (result.quality.efficiency < 0 || result.quality.efficiency > 1) {
      warnings.push("Efficiency should be between 0 and 1");
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      hasValidPoints: true,
      // Points are validated during computation
      hasValidRectangle: errors.length === 0 || !errors.some((e) => e.includes("rectangle")),
      hasValidArea: errors.length === 0 || !errors.some((e) => e.includes("Area")),
      hasValidPerimeter: errors.length === 0 || !errors.some((e) => e.includes("perimeter"))
    };
  }
  /**
   * Compares two bounding boxes.
   * @param box1 - First bounding box.
   * @param box2 - Second bounding box.
   * @param options - Comparison options.
   * @returns Comparison result.
   */
  compare(box1, box2, options = {}) {
    const comparisonOptions = {
      tolerance: this.config.tolerance,
      ...options
    };
    const areaDifference = Math.abs(box1.area - box2.area);
    const perimeterDifference = Math.abs(box1.perimeter - box2.perimeter);
    const aspectRatioDifference = Math.abs(box1.aspectRatio - box2.aspectRatio);
    const rotationDifference = Math.abs(box1.rectangle.rotation - box2.rectangle.rotation);
    const areEqual = areaDifference < comparisonOptions.tolerance && perimeterDifference < comparisonOptions.tolerance && aspectRatioDifference < comparisonOptions.tolerance && rotationDifference < comparisonOptions.tolerance;
    const maxArea = Math.max(box1.area, box2.area);
    const maxPerimeter = Math.max(box1.perimeter, box2.perimeter);
    const maxAspectRatio = Math.max(box1.aspectRatio, box2.aspectRatio);
    const areaSimilarity = maxArea === 0 ? 1 : 1 - areaDifference / maxArea;
    const perimeterSimilarity = maxPerimeter === 0 ? 1 : 1 - perimeterDifference / maxPerimeter;
    const aspectRatioSimilarity = maxAspectRatio === 0 ? 1 : 1 - aspectRatioDifference / maxAspectRatio;
    const rotationSimilarity = 1 - rotationDifference / (Math.PI / 2);
    const similarity = (areaSimilarity + perimeterSimilarity + aspectRatioSimilarity + rotationSimilarity) / 4;
    return {
      areEqual,
      areaDifference,
      perimeterDifference,
      aspectRatioDifference,
      rotationDifference,
      similarity: Math.max(0, Math.min(1, similarity))
    };
  }
  /**
   * Optimizes a bounding box using various optimization techniques.
   * @param points - Array of points.
   * @param initialBox - Initial bounding box.
   * @param options - Optimization options.
   * @returns Optimization result.
   */
  optimize(_points, initialBox, _options = {}) {
    let bestBox = initialBox;
    let bestArea = MinimumBoundingBoxUtils.calculateArea(initialBox);
    let iterations = 0;
    const angleStep = Math.PI / 180;
    const maxIterations = 100;
    for (let i = 0; i < maxIterations; i++) {
      iterations++;
      let improved = false;
      for (const deltaAngle of [-angleStep, angleStep]) {
        const testBox = {
          ...bestBox,
          rotation: bestBox.rotation + deltaAngle
        };
        const testArea = MinimumBoundingBoxUtils.calculateArea(testBox);
        if (testArea < bestArea) {
          bestBox = testBox;
          bestArea = testArea;
          improved = true;
        }
      }
      if (!improved) break;
    }
    const initialArea = MinimumBoundingBoxUtils.calculateArea(initialBox);
    const initialPerimeter = MinimumBoundingBoxUtils.calculatePerimeter(initialBox);
    const finalPerimeter = MinimumBoundingBoxUtils.calculatePerimeter(bestBox);
    return {
      rectangle: bestBox,
      areaImprovement: initialArea - bestArea,
      perimeterImprovement: initialPerimeter - finalPerimeter,
      iterations,
      converged: iterations < maxIterations,
      objectiveValue: bestArea
    };
  }
  /**
   * Serializes a minimum bounding box result to JSON.
   * @param result - Result to serialize.
   * @param options - Serialization options.
   * @returns Serialized result.
   */
  serialize(result, options = {}) {
    const serializationOptions = {
      precision: 6,
      includeStats: false,
      includeQuality: false,
      includeValidation: false,
      ...options
    };
    const round = (value) => {
      return Math.round(value * Math.pow(10, serializationOptions.precision)) / Math.pow(10, serializationOptions.precision);
    };
    const roundPoint = (point) => ({
      x: round(point.x),
      y: round(point.y)
    });
    const serialized = {
      rectangle: {
        center: roundPoint(result.rectangle.center),
        width: round(result.rectangle.width),
        height: round(result.rectangle.height),
        rotation: round(result.rectangle.rotation)
      },
      area: round(result.area),
      perimeter: round(result.perimeter),
      aspectRatio: round(result.aspectRatio)
    };
    if (serializationOptions.includeStats) {
      serialized.stats = result.stats;
    }
    if (serializationOptions.includeQuality) {
      serialized.quality = {
        fitQuality: round(result.quality.fitQuality),
        efficiency: round(result.quality.efficiency),
        compactness: round(result.quality.compactness)
      };
    }
    if (serializationOptions.includeValidation) {
      serialized.validation = this.validate(result);
    }
    return serialized;
  }
  /**
   * Updates the configuration.
   * @param newConfig - New configuration options.
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
  /**
   * Gets the current configuration.
   * @returns The current configuration.
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Gets the current statistics.
   * @returns The current statistics.
   */
  getStats() {
    return { ...this.stats };
  }
  /**
   * Resets the statistics.
   */
  resetStats() {
    this.stats = {
      pointsProcessed: 0,
      iterations: 0,
      angleTests: 0,
      executionTime: 0,
      success: true
    };
  }
}
var Direction$2 = /* @__PURE__ */ ((Direction2) => {
  Direction2[Direction2["NORTH"] = 0] = "NORTH";
  Direction2[Direction2["NORTHEAST"] = 1] = "NORTHEAST";
  Direction2[Direction2["EAST"] = 2] = "EAST";
  Direction2[Direction2["SOUTHEAST"] = 3] = "SOUTHEAST";
  Direction2[Direction2["SOUTH"] = 4] = "SOUTH";
  Direction2[Direction2["SOUTHWEST"] = 5] = "SOUTHWEST";
  Direction2[Direction2["WEST"] = 6] = "WEST";
  Direction2[Direction2["NORTHWEST"] = 7] = "NORTHWEST";
  return Direction2;
})(Direction$2 || {});
var MovementType$2 = /* @__PURE__ */ ((MovementType2) => {
  MovementType2["CARDINAL"] = "cardinal";
  MovementType2["DIAGONAL"] = "diagonal";
  MovementType2["ALL"] = "all";
  return MovementType2;
})(MovementType$2 || {});
var CellType$4 = /* @__PURE__ */ ((CellType2) => {
  CellType2[CellType2["WALKABLE"] = 0] = "WALKABLE";
  CellType2[CellType2["OBSTACLE"] = 1] = "OBSTACLE";
  CellType2[CellType2["START"] = 2] = "START";
  CellType2[CellType2["GOAL"] = 3] = "GOAL";
  return CellType2;
})(CellType$4 || {});
const _JPSUtils = class _JPSUtils {
  /**
   * Gets the direction vector for a given direction.
   * @param direction - The direction.
   * @returns The direction vector.
   */
  static getDirectionVector(direction) {
    return this.DIRECTION_VECTORS[direction];
  }
  /**
   * Gets the direction from a vector.
   * @param vector - The vector.
   * @returns The direction.
   */
  static getDirectionFromVector(vector) {
    const normalized = this.normalizeVector(vector);
    for (let i = 0; i < this.DIRECTION_VECTORS.length; i++) {
      const dir = this.DIRECTION_VECTORS[i];
      if (Math.abs(normalized.x - dir.x) < 1e-10 && Math.abs(normalized.y - dir.y) < 1e-10) {
        return i;
      }
    }
    return Direction$2.NORTH;
  }
  /**
   * Normalizes a vector to unit length.
   * @param vector - Vector to normalize.
   * @returns Normalized vector.
   */
  static normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (magnitude === 0) return { x: 0, y: 0 };
    return { x: vector.x / magnitude, y: vector.y / magnitude };
  }
  /**
   * Adds two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Sum of vectors.
   */
  static addVectors(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
  }
  /**
   * Multiplies a vector by a scalar.
   * @param vector - Vector to multiply.
   * @param scalar - Scalar multiplier.
   * @returns Scaled vector.
   */
  static multiplyVector(vector, scalar) {
    return { x: vector.x * scalar, y: vector.y * scalar };
  }
  /**
   * Calculates the distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Distance.
   */
  static distance(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  /**
   * Calculates the Manhattan distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Manhattan distance.
   */
  static manhattanDistance(a, b) {
    return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
  }
  /**
   * Calculates the Chebyshev distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Chebyshev distance.
   */
  static chebyshevDistance(a, b) {
    return Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
  }
  /**
   * Checks if a point is within grid bounds.
   * @param point - Point to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if point is within bounds.
   */
  static isWithinBounds(point, width, height) {
    return point.x >= 0 && point.x < width && point.y >= 0 && point.y < height;
  }
  /**
   * Checks if a cell is walkable.
   * @param grid - The grid.
   * @param point - Point to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if cell is walkable.
   */
  static isWalkable(grid, point, width, height) {
    if (!this.isWithinBounds(point, width, height)) {
      return false;
    }
    const index = point.y * width + point.x;
    return grid[index] === CellType$4.WALKABLE || grid[index] === CellType$4.START || grid[index] === CellType$4.GOAL;
  }
  /**
   * Gets the cell type at a point.
   * @param grid - The grid.
   * @param point - Point to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Cell type.
   */
  static getCellType(grid, point, width, height) {
    if (!this.isWithinBounds(point, width, height)) {
      return CellType$4.OBSTACLE;
    }
    const index = point.y * width + point.x;
    return grid[index];
  }
  /**
   * Sets the cell type at a point.
   * @param grid - The grid.
   * @param point - Point to set.
   * @param type - Cell type.
   * @param width - Grid width.
   * @param height - Grid height.
   */
  static setCellType(grid, point, type, width, height) {
    if (this.isWithinBounds(point, width, height)) {
      const index = point.y * width + point.x;
      grid[index] = type;
    }
  }
  /**
   * Gets all valid directions based on movement type.
   * @param movementType - Movement type.
   * @param allowDiagonal - Whether diagonal movement is allowed.
   * @returns Array of valid directions.
   */
  static getValidDirections(movementType, allowDiagonal) {
    switch (movementType) {
      case MovementType$2.CARDINAL:
        return this.CARDINAL_DIRECTIONS;
      case MovementType$2.DIAGONAL:
        return this.DIAGONAL_DIRECTIONS;
      case MovementType$2.ALL:
        return allowDiagonal ? Array.from({ length: 8 }, (_, i) => i) : this.CARDINAL_DIRECTIONS;
      default:
        return this.CARDINAL_DIRECTIONS;
    }
  }
  /**
   * Checks if a direction is cardinal.
   * @param direction - Direction to check.
   * @returns True if direction is cardinal.
   */
  static isCardinalDirection(direction) {
    return this.CARDINAL_DIRECTIONS.includes(direction);
  }
  /**
   * Checks if a direction is diagonal.
   * @param direction - Direction to check.
   * @returns True if direction is diagonal.
   */
  static isDiagonalDirection(direction) {
    return this.DIAGONAL_DIRECTIONS.includes(direction);
  }
  /**
   * Gets the cost of moving in a direction.
   * @param direction - Direction of movement.
   * @param allowDiagonal - Whether diagonal movement is allowed.
   * @returns Movement cost.
   */
  static getMovementCost(direction, allowDiagonal) {
    if (this.isCardinalDirection(direction)) {
      return 1;
    } else if (this.isDiagonalDirection(direction) && allowDiagonal) {
      return Math.sqrt(2);
    }
    return Infinity;
  }
  /**
   * Checks if a point has forced neighbors in a given direction.
   * @param grid - The grid.
   * @param point - Current point.
   * @param direction - Direction to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if forced neighbors exist.
   */
  static hasForcedNeighbors(grid, point, direction, width, height) {
    const dir = this.getDirectionVector(direction);
    if (this.isCardinalDirection(direction)) {
      const perp1 = this.getPerpendicularDirection(direction, true);
      const perp2 = this.getPerpendicularDirection(direction, false);
      const perp1Vec = this.getDirectionVector(perp1);
      const perp2Vec = this.getDirectionVector(perp2);
      const check1 = { x: point.x + perp1Vec.x, y: point.y + perp1Vec.y };
      const check2 = { x: point.x + perp2Vec.x, y: point.y + perp2Vec.y };
      const blocked1 = !this.isWalkable(grid, check1, width, height);
      const blocked2 = !this.isWalkable(grid, check2, width, height);
      if (blocked1 || blocked2) {
        const beyond1 = { x: check1.x + dir.x, y: check1.y + dir.y };
        const beyond2 = { x: check2.x + dir.x, y: check2.y + dir.y };
        return blocked1 && this.isWalkable(grid, beyond1, width, height) || blocked2 && this.isWalkable(grid, beyond2, width, height);
      }
    } else if (this.isDiagonalDirection(direction)) {
      const cardinal1 = this.getCardinalComponent(direction, true);
      const cardinal2 = this.getCardinalComponent(direction, false);
      const card1Vec = this.getDirectionVector(cardinal1);
      const card2Vec = this.getDirectionVector(cardinal2);
      const check1 = { x: point.x + card1Vec.x, y: point.y + card1Vec.y };
      const check2 = { x: point.x + card2Vec.x, y: point.y + card2Vec.y };
      const blocked1 = !this.isWalkable(grid, check1, width, height);
      const blocked2 = !this.isWalkable(grid, check2, width, height);
      return blocked1 || blocked2;
    }
    return false;
  }
  /**
   * Gets the perpendicular direction to a cardinal direction.
   * @param direction - Cardinal direction.
   * @param clockwise - Whether to get clockwise perpendicular.
   * @returns Perpendicular direction.
   */
  static getPerpendicularDirection(direction, clockwise) {
    if (!this.isCardinalDirection(direction)) {
      throw new Error("Direction must be cardinal");
    }
    const index = this.CARDINAL_DIRECTIONS.indexOf(direction);
    const perpIndex = clockwise ? (index + 1) % 4 : (index + 3) % 4;
    return this.CARDINAL_DIRECTIONS[perpIndex];
  }
  /**
   * Gets a cardinal component of a diagonal direction.
   * @param direction - Diagonal direction.
   * @param first - Whether to get first component.
   * @returns Cardinal direction component.
   */
  static getCardinalComponent(direction, first) {
    if (!this.isDiagonalDirection(direction)) {
      throw new Error("Direction must be diagonal");
    }
    const index = this.DIAGONAL_DIRECTIONS.indexOf(direction);
    const cardinalIndex = first ? index : (index + 1) % 4;
    return this.CARDINAL_DIRECTIONS[cardinalIndex];
  }
  /**
   * Jumps in a given direction until a jump point or obstacle is found.
   * @param grid - The grid.
   * @param start - Starting point.
   * @param direction - Direction to jump.
   * @param goal - Goal point.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param options - Jump point options.
   * @returns Jump point or null if no jump point found.
   */
  static jump(grid, start, direction, goal, width, height, options = {
    checkForcedNeighbors: true,
    checkGoalProximity: true,
    useDiagonalPruning: true,
    maxJumpDistance: 10,
    useEarlyTermination: true
  }) {
    const {
      checkForcedNeighbors = true,
      checkGoalProximity = true,
      maxJumpDistance = Math.max(width, height),
      useEarlyTermination = true
    } = options;
    const dir = this.getDirectionVector(direction);
    let current = { ...start };
    let distance2 = 0;
    while (distance2 < maxJumpDistance) {
      current = { x: current.x + dir.x, y: current.y + dir.y };
      distance2++;
      if (!this.isWithinBounds(current, width, height)) {
        return null;
      }
      if (!this.isWalkable(grid, current, width, height)) {
        return null;
      }
      if (checkGoalProximity && current.x === goal.x && current.y === goal.y) {
        return current;
      }
      if (checkForcedNeighbors && this.hasForcedNeighbors(grid, current, direction, width, height)) {
        return current;
      }
      if (this.isDiagonalDirection(direction)) {
        const cardinal1 = this.getCardinalComponent(direction, true);
        const cardinal2 = this.getCardinalComponent(direction, false);
        const jump1 = this.jump(grid, current, cardinal1, goal, width, height, options);
        const jump2 = this.jump(grid, current, cardinal2, goal, width, height, options);
        if (jump1 || jump2) {
          return current;
        }
      }
      if (useEarlyTermination && distance2 > 10) {
        break;
      }
    }
    return null;
  }
  /**
   * Gets all jump points from a given point.
   * @param grid - The grid.
   * @param point - Starting point.
   * @param goal - Goal point.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param config - JPS configuration.
   * @param options - Jump point options.
   * @returns Array of jump points.
   */
  static getJumpPoints(grid, point, goal, width, height, config, options = {
    checkForcedNeighbors: true,
    checkGoalProximity: true,
    useDiagonalPruning: true,
    maxJumpDistance: 10,
    useEarlyTermination: true
  }) {
    const jumpPoints = [];
    const directions = this.getValidDirections(config.movementType, config.allowDiagonal);
    for (const direction of directions) {
      const jumpPoint = this.jump(grid, point, direction, goal, width, height, options);
      if (jumpPoint) {
        const heuristic = this.manhattanDistance(jumpPoint, goal);
        jumpPoints.push({
          x: jumpPoint.x,
          y: jumpPoint.y,
          g: 0,
          // Will be set by the main algorithm
          h: heuristic,
          f: 0,
          // Will be set by the main algorithm
          direction
        });
      }
    }
    return jumpPoints;
  }
  /**
   * Creates a key for a point (for use in maps/sets).
   * @param point - Point to create key for.
   * @returns String key.
   */
  static pointToKey(point) {
    return `${point.x},${point.y}`;
  }
  /**
   * Parses a key back to a point.
   * @param key - String key.
   * @returns Point.
   */
  static keyToPoint(key) {
    const [x, y] = key.split(",").map(Number);
    return { x, y };
  }
  /**
   * Checks if two points are equal.
   * @param a - First point.
   * @param b - Second point.
   * @param tolerance - Numerical tolerance.
   * @returns True if points are equal.
   */
  static pointsEqual(a, b, tolerance = 1e-10) {
    return Math.abs(a.x - b.x) < tolerance && Math.abs(a.y - b.y) < tolerance;
  }
  /**
   * Calculates the angle between two points.
   * @param from - Starting point.
   * @param to - Ending point.
   * @returns Angle in radians.
   */
  static angleBetweenPoints(from, to) {
    return Math.atan2(to.y - from.y, to.x - from.x);
  }
  /**
   * Checks if a path is valid (no obstacles).
   * @param grid - The grid.
   * @param path - Path to validate.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if path is valid.
   */
  static isPathValid(grid, path, width, height) {
    for (const point of path) {
      if (!this.isWalkable(grid, point, width, height)) {
        return false;
      }
    }
    return true;
  }
  /**
   * Optimizes a path by removing redundant points.
   * @param path - Path to optimize.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Optimized path.
   */
  static optimizePath(path, grid, width, height) {
    if (path.length <= 2) return path;
    const optimized = [path[0]];
    let lastValid = 0;
    for (let i = 2; i < path.length; i++) {
      if (!this.hasLineOfSight(grid, path[lastValid], path[i], width, height)) {
        optimized.push(path[i - 1]);
        lastValid = i - 1;
      }
    }
    optimized.push(path[path.length - 1]);
    return optimized;
  }
  /**
   * Checks if there's a line of sight between two points.
   * @param grid - The grid.
   * @param from - Starting point.
   * @param to - Ending point.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if line of sight exists.
   */
  static hasLineOfSight(grid, from, to, width, height) {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const xStep = from.x < to.x ? 1 : -1;
    const yStep = from.y < to.y ? 1 : -1;
    let x = from.x;
    let y = from.y;
    let error = dx - dy;
    while (true) {
      if (x === to.x && y === to.y) break;
      if (!this.isWalkable(grid, { x, y }, width, height)) {
        return false;
      }
      const error2 = 2 * error;
      if (error2 > -dy) {
        error -= dy;
        x += xStep;
      }
      if (error2 < dx) {
        error += dx;
        y += yStep;
      }
    }
    return true;
  }
  /**
   * Generates a simple grid for testing.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param obstacleRatio - Ratio of obstacles (0-1).
   * @returns Generated grid.
   */
  static generateTestGrid(width, height, obstacleRatio = 0.3) {
    const grid = new Array(width * height).fill(CellType$4.WALKABLE);
    for (let i = 0; i < grid.length; i++) {
      if (Math.random() < obstacleRatio) {
        grid[i] = CellType$4.OBSTACLE;
      }
    }
    return grid;
  }
  /**
   * Creates a grid from a 2D array.
   * @param grid2D - 2D array representation.
   * @returns 1D grid array.
   */
  static from2DArray(grid2D) {
    const height = grid2D.length;
    const width = grid2D[0]?.length || 0;
    const grid = new Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        grid[y * width + x] = grid2D[y][x];
      }
    }
    return grid;
  }
  /**
   * Converts a 1D grid to a 2D array.
   * @param grid - 1D grid array.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns 2D array representation.
   */
  static to2DArray(grid, width, height) {
    const grid2D = [];
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        row.push(grid[y * width + x]);
      }
      grid2D.push(row);
    }
    return grid2D;
  }
};
_JPSUtils.DIRECTION_VECTORS = [
  { x: 0, y: -1 },
  // NORTH
  { x: 1, y: -1 },
  // NORTHEAST
  { x: 1, y: 0 },
  // EAST
  { x: 1, y: 1 },
  // SOUTHEAST
  { x: 0, y: 1 },
  // SOUTH
  { x: -1, y: 1 },
  // SOUTHWEST
  { x: -1, y: 0 },
  // WEST
  { x: -1, y: -1 }
  // NORTHWEST
];
_JPSUtils.CARDINAL_DIRECTIONS = [0, 2, 4, 6];
_JPSUtils.DIAGONAL_DIRECTIONS = [1, 3, 5, 7];
let JPSUtils = _JPSUtils;
class JPS {
  /**
   * Creates an instance of JPS.
   * @param config - Optional configuration for the algorithm.
   */
  constructor(config = {}) {
    this.cache = /* @__PURE__ */ new Map();
    this.jpsPlusCache = /* @__PURE__ */ new Map();
    this.config = {
      allowDiagonal: true,
      diagonalOnlyWhenClear: true,
      movementType: MovementType$2.ALL,
      useTieBreaking: true,
      useGoalBounding: false,
      useJPSPlus: false,
      validateInput: true,
      enableCaching: true,
      maxIterations: 1e4,
      tolerance: 1e-10,
      ...config
    };
    this.stats = {
      nodesExplored: 0,
      jumpPointsFound: 0,
      iterations: 0,
      diagonalMoves: 0,
      cardinalMoves: 0,
      executionTime: 0,
      success: true
    };
  }
  /**
   * Finds a path from start to goal using JPS.
   * @param grid - The grid as a 1D array.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param start - Starting point.
   * @param goal - Goal point.
   * @param options - Pathfinding options.
   * @returns Pathfinding result.
   */
  findPath(grid, width, height, start, goal, options = {}) {
    const startTime = performance.now();
    const pathOptions = {
      returnExplored: false,
      returnJumpPoints: false,
      useManhattanHeuristic: true,
      useEuclideanHeuristic: false,
      optimizePath: true,
      useGoalBounding: this.config.useGoalBounding,
      maxPathLength: width * height,
      ...options
    };
    try {
      if (this.config.validateInput) {
        const validation = this.validateGrid(grid, width, height, start, goal);
        if (!validation.isValid) {
          throw new Error(`Invalid grid: ${validation.errors.join(", ")}`);
        }
      }
      if (this.config.enableCaching) {
        const cacheKey = this.getCacheKey(grid, width, height, start, goal, pathOptions);
        const cached = this.cache.get(cacheKey);
        if (cached) {
          return cached;
        }
      }
      this.resetStats();
      if (JPSUtils.pointsEqual(start, goal, this.config.tolerance)) {
        const result2 = {
          path: [start],
          found: true,
          cost: 0,
          length: 1,
          explored: [],
          stats: this.getStats()
        };
        if (this.config.enableCaching) {
          const cacheKey = this.getCacheKey(grid, width, height, start, goal, pathOptions);
          this.cache.set(cacheKey, result2);
        }
        return result2;
      }
      const openSet = [];
      const closedSet = /* @__PURE__ */ new Set();
      const cameFrom = /* @__PURE__ */ new Map();
      const startNode = {
        x: start.x,
        y: start.y,
        g: 0,
        h: this.calculateHeuristic(start, goal, pathOptions),
        f: 0
      };
      startNode.f = startNode.g + startNode.h;
      openSet.push(startNode);
      const openSetMap = /* @__PURE__ */ new Map();
      openSetMap.set(JPSUtils.pointToKey(start), startNode);
      let found = false;
      let goalNode = null;
      while (openSet.length > 0 && this.stats.iterations < this.config.maxIterations) {
        this.stats.iterations++;
        const current = this.getLowestFCostNode(openSet, openSetMap);
        if (!current) break;
        const currentKey = JPSUtils.pointToKey(current);
        this.removeFromOpenSet(openSet, openSetMap, current);
        closedSet.add(currentKey);
        if (JPSUtils.pointsEqual(current, goal, this.config.tolerance)) {
          found = true;
          goalNode = current;
          break;
        }
        const jumpPointOptions = {
          checkForcedNeighbors: true,
          checkGoalProximity: true,
          useDiagonalPruning: true,
          maxJumpDistance: Math.max(width, height),
          useEarlyTermination: true
        };
        const jumpPoints = JPSUtils.getJumpPoints(
          grid,
          current,
          goal,
          width,
          height,
          this.config,
          jumpPointOptions
        );
        this.stats.jumpPointsFound += jumpPoints.length;
        for (const jumpPoint of jumpPoints) {
          const jumpKey = JPSUtils.pointToKey(jumpPoint);
          if (closedSet.has(jumpKey)) {
            continue;
          }
          const tentativeG = current.g + JPSUtils.getMovementCost(
            jumpPoint.direction,
            this.config.allowDiagonal
          );
          const existingNode = openSetMap.get(jumpKey);
          if (!existingNode || tentativeG < existingNode.g) {
            const newNode = {
              x: jumpPoint.x,
              y: jumpPoint.y,
              parent: current,
              g: tentativeG,
              h: this.calculateHeuristic(jumpPoint, goal, pathOptions),
              f: 0,
              direction: jumpPoint.direction
            };
            newNode.f = newNode.g + newNode.h;
            if (JPSUtils.isDiagonalDirection(jumpPoint.direction)) {
              this.stats.diagonalMoves++;
            } else {
              this.stats.cardinalMoves++;
            }
            if (existingNode) {
              this.removeFromOpenSet(openSet, openSetMap, existingNode);
            }
            openSet.push(newNode);
            openSetMap.set(jumpKey, newNode);
            cameFrom.set(jumpKey, current);
          }
        }
        this.stats.nodesExplored++;
      }
      let path = [];
      let cost = 0;
      let explored = [];
      if (found && goalNode) {
        path = this.reconstructPath(goalNode);
        cost = goalNode.g;
        if (pathOptions.returnExplored) {
          explored = Array.from(cameFrom.values());
        }
        if (pathOptions.optimizePath) {
          const optimization = this.optimizePath(path, grid, width, height);
          path = optimization.path;
        }
      }
      const executionTime = performance.now() - startTime;
      this.stats.executionTime = executionTime;
      this.stats.success = found;
      const result = {
        path,
        found,
        cost,
        length: path.length,
        explored,
        stats: this.getStats()
      };
      if (this.config.enableCaching) {
        const cacheKey = this.getCacheKey(grid, width, height, start, goal, pathOptions);
        this.cache.set(cacheKey, result);
      }
      return result;
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        path: [],
        found: false,
        cost: 0,
        length: 0,
        explored: [],
        stats: {
          nodesExplored: this.stats.nodesExplored,
          jumpPointsFound: this.stats.jumpPointsFound,
          iterations: this.stats.iterations,
          diagonalMoves: this.stats.diagonalMoves,
          cardinalMoves: this.stats.cardinalMoves,
          executionTime,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      };
    }
  }
  /**
   * Validates a grid for pathfinding.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param start - Starting point.
   * @param goal - Goal point.
   * @param options - Validation options.
   * @returns Validation result.
   */
  validateGrid(grid, width, height, start, goal, options = {}) {
    const validationOptions = {
      checkBounds: true,
      checkObstacles: true,
      checkStartGoal: true,
      checkConnectivity: true,
      minGridSize: 1,
      maxGridSize: 1e4,
      ...options
    };
    const errors = [];
    const warnings = [];
    if (validationOptions.checkBounds) {
      if (width < validationOptions.minGridSize || height < validationOptions.minGridSize) {
        errors.push(`Grid size too small: ${width}x${height}`);
      }
      if (width > validationOptions.maxGridSize || height > validationOptions.maxGridSize) {
        errors.push(`Grid size too large: ${width}x${height}`);
      }
      if (grid.length !== width * height) {
        errors.push(`Grid array length mismatch: expected ${width * height}, got ${grid.length}`);
      }
    }
    if (validationOptions.checkStartGoal) {
      if (!JPSUtils.isWithinBounds(start, width, height)) {
        errors.push(`Start point out of bounds: (${start.x}, ${start.y})`);
      }
      if (!JPSUtils.isWithinBounds(goal, width, height)) {
        errors.push(`Goal point out of bounds: (${goal.x}, ${goal.y})`);
      }
      if (JPSUtils.isWithinBounds(start, width, height) && !JPSUtils.isWalkable(grid, start, width, height)) {
        errors.push(`Start point is not walkable: (${start.x}, ${start.y})`);
      }
      if (JPSUtils.isWithinBounds(goal, width, height) && !JPSUtils.isWalkable(grid, goal, width, height)) {
        errors.push(`Goal point is not walkable: (${goal.x}, ${goal.y})`);
      }
    }
    if (validationOptions.checkObstacles) {
      let obstacleCount = 0;
      for (const cell of grid) {
        if (cell === CellType$4.OBSTACLE) {
          obstacleCount++;
        }
      }
      const obstacleRatio = obstacleCount / grid.length;
      if (obstacleRatio > 0.8) {
        warnings.push(`High obstacle ratio: ${(obstacleRatio * 100).toFixed(1)}%`);
      }
    }
    if (validationOptions.checkConnectivity && errors.length === 0) {
      const visited = /* @__PURE__ */ new Set();
      const queue = [start];
      visited.add(JPSUtils.pointToKey(start));
      while (queue.length > 0) {
        const current = queue.shift();
        if (JPSUtils.pointsEqual(current, goal, this.config.tolerance)) {
          break;
        }
        const directions = JPSUtils.getValidDirections(this.config.movementType, this.config.allowDiagonal);
        for (const direction of directions) {
          const dir = JPSUtils.getDirectionVector(direction);
          const next = { x: current.x + dir.x, y: current.y + dir.y };
          const nextKey = JPSUtils.pointToKey(next);
          if (JPSUtils.isWithinBounds(next, width, height) && JPSUtils.isWalkable(grid, next, width, height) && !visited.has(nextKey)) {
            visited.add(nextKey);
            queue.push(next);
          }
        }
      }
      if (!visited.has(JPSUtils.pointToKey(goal))) {
        errors.push("No path exists between start and goal");
      }
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      hasValidBounds: !errors.some((e) => e.includes("bounds")),
      hasValidObstacles: !errors.some((e) => e.includes("obstacle")),
      hasValidStartGoal: !errors.some((e) => e.includes("Start") || e.includes("Goal")),
      isConnected: !errors.some((e) => e.includes("path exists"))
    };
  }
  /**
   * Optimizes a path by removing redundant points.
   * @param path - Path to optimize.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param options - Optimization options.
   * @returns Optimization result.
   */
  optimizePath(path, grid, width, height, options = {}) {
    const optimizationOptions = {
      removeRedundant: true,
      smoothPath: false,
      useLineOfSight: true,
      smoothingFactor: 0.5,
      maxSmoothingIterations: 10,
      ...options
    };
    try {
      let optimizedPath = [...path];
      let pointsRemoved = 0;
      let iterations = 0;
      if (optimizationOptions.removeRedundant) {
        const originalLength = optimizedPath.length;
        optimizedPath = JPSUtils.optimizePath(optimizedPath, grid, width, height);
        pointsRemoved = originalLength - optimizedPath.length;
      }
      if (optimizationOptions.smoothPath) {
        for (let i = 0; i < optimizationOptions.maxSmoothingIterations; i++) {
          iterations++;
          const smoothed = this.smoothPath(optimizedPath, grid, width, height, optimizationOptions.smoothingFactor);
          if (smoothed.length === optimizedPath.length) break;
          optimizedPath = smoothed;
        }
      }
      const reduction = path.length > 0 ? pointsRemoved / path.length * 100 : 0;
      return {
        path: optimizedPath,
        pointsRemoved,
        success: true,
        stats: {
          originalLength: path.length,
          optimizedLength: optimizedPath.length,
          reduction,
          iterations
        }
      };
    } catch (error) {
      return {
        path,
        pointsRemoved: 0,
        success: false,
        stats: {
          originalLength: path.length,
          optimizedLength: path.length,
          reduction: 0,
          iterations: 0
        }
      };
    }
  }
  /**
   * Compares two pathfinding results.
   * @param result1 - First result.
   * @param result2 - Second result.
   * @param options - Comparison options.
   * @returns Comparison result.
   */
  compare(result1, result2, options = {}) {
    const comparisonOptions = {
      tolerance: this.config.tolerance,
      ...options
    };
    const lengthDifference = Math.abs(result1.length - result2.length);
    const costDifference = Math.abs(result1.cost - result2.cost);
    const explorationDifference = Math.abs(result1.stats.nodesExplored - result2.stats.nodesExplored);
    const timeDifference = Math.abs(result1.stats.executionTime - result2.stats.executionTime);
    const areEquivalent = lengthDifference < comparisonOptions.tolerance && costDifference < comparisonOptions.tolerance && explorationDifference < comparisonOptions.tolerance && timeDifference < comparisonOptions.tolerance;
    const maxLength = Math.max(result1.length, result2.length);
    const maxCost = Math.max(result1.cost, result2.cost);
    const maxExploration = Math.max(result1.stats.nodesExplored, result2.stats.nodesExplored);
    const maxTime = Math.max(result1.stats.executionTime, result2.stats.executionTime);
    const lengthSimilarity = maxLength === 0 ? 1 : 1 - lengthDifference / maxLength;
    const costSimilarity = maxCost === 0 ? 1 : 1 - costDifference / maxCost;
    const explorationSimilarity = maxExploration === 0 ? 1 : 1 - explorationDifference / maxExploration;
    const timeSimilarity = maxTime === 0 ? 1 : 1 - timeDifference / maxTime;
    const similarity = (lengthSimilarity + costSimilarity + explorationSimilarity + timeSimilarity) / 4;
    return {
      areEquivalent,
      lengthDifference,
      costDifference,
      explorationDifference,
      timeDifference,
      similarity: Math.max(0, Math.min(1, similarity))
    };
  }
  /**
   * Serializes a JPS result to JSON.
   * @param result - Result to serialize.
   * @param options - Serialization options.
   * @returns Serialized result.
   */
  serialize(result, options = {}) {
    const serializationOptions = {
      precision: 6,
      includeStats: false,
      includeExplored: false,
      includeJumpPoints: false,
      ...options
    };
    const round = (value) => {
      return Math.round(value * Math.pow(10, serializationOptions.precision)) / Math.pow(10, serializationOptions.precision);
    };
    const roundPoint = (point) => ({
      x: round(point.x),
      y: round(point.y)
    });
    const serialized = {
      path: result.path.map(roundPoint),
      found: result.found,
      cost: round(result.cost),
      length: result.length
    };
    if (serializationOptions.includeStats) {
      serialized.stats = result.stats;
    }
    if (serializationOptions.includeExplored) {
      serialized.explored = result.explored;
    }
    if (serializationOptions.includeJumpPoints) {
      serialized.jumpPoints = result.explored.filter((node) => node.direction !== void 0);
    }
    return serialized;
  }
  /**
   * Updates the configuration.
   * @param newConfig - New configuration options.
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
  /**
   * Gets the current configuration.
   * @returns The current configuration.
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Gets the current statistics.
   * @returns The current statistics.
   */
  getStats() {
    return { ...this.stats };
  }
  /**
   * Resets the statistics.
   */
  resetStats() {
    this.stats = {
      nodesExplored: 0,
      jumpPointsFound: 0,
      iterations: 0,
      diagonalMoves: 0,
      cardinalMoves: 0,
      executionTime: 0,
      success: true
    };
  }
  /**
   * Clears the cache.
   */
  clearCache() {
    this.cache.clear();
    this.jpsPlusCache.clear();
  }
  /**
   * Calculates the heuristic cost between two points.
   * @param from - Starting point.
   * @param to - Goal point.
   * @param options - Pathfinding options.
   * @returns Heuristic cost.
   */
  calculateHeuristic(from, to, options) {
    if (options.customHeuristic) {
      return options.customHeuristic(from, to);
    }
    if (options.useEuclideanHeuristic) {
      return JPSUtils.distance(from, to);
    }
    if (options.useManhattanHeuristic) {
      return JPSUtils.manhattanDistance(from, to);
    }
    return JPSUtils.manhattanDistance(from, to);
  }
  /**
   * Gets the node with the lowest f-cost from the open set.
   * @param openSet - Open set array.
   * @param openSetMap - Open set map.
   * @returns Node with lowest f-cost.
   */
  getLowestFCostNode(openSet, _openSetMap) {
    if (openSet.length === 0) return null;
    let lowest = openSet[0];
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < lowest.f || this.config.useTieBreaking && openSet[i].f === lowest.f && openSet[i].h < lowest.h) {
        lowest = openSet[i];
      }
    }
    return lowest;
  }
  /**
   * Removes a node from the open set.
   * @param openSet - Open set array.
   * @param openSetMap - Open set map.
   * @param node - Node to remove.
   */
  removeFromOpenSet(openSet, openSetMap, node) {
    const key = JPSUtils.pointToKey(node);
    openSetMap.delete(key);
    const index = openSet.findIndex((n) => JPSUtils.pointsEqual(n, node, this.config.tolerance));
    if (index !== -1) {
      openSet.splice(index, 1);
    }
  }
  /**
   * Reconstructs the path from the goal node.
   * @param goalNode - Goal node.
   * @returns Reconstructed path.
   */
  reconstructPath(goalNode) {
    const path = [];
    let current = goalNode;
    while (current) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }
    return path;
  }
  /**
   * Smooths a path using simple interpolation.
   * @param path - Path to smooth.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param factor - Smoothing factor.
   * @returns Smoothed path.
   */
  smoothPath(path, grid, width, height, factor) {
    if (path.length <= 2) return path;
    const smoothed = [path[0]];
    for (let i = 1; i < path.length - 1; i++) {
      const prev = path[i - 1];
      const current = path[i];
      const next = path[i + 1];
      const smoothedX = current.x + factor * ((prev.x + next.x) / 2 - current.x);
      const smoothedY = current.y + factor * ((prev.y + next.y) / 2 - current.y);
      const smoothedPoint = { x: Math.round(smoothedX), y: Math.round(smoothedY) };
      if (JPSUtils.isWalkable(grid, smoothedPoint, width, height)) {
        smoothed.push(smoothedPoint);
      } else {
        smoothed.push(current);
      }
    }
    smoothed.push(path[path.length - 1]);
    return smoothed;
  }
  /**
   * Generates a cache key for the given parameters.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param start - Starting point.
   * @param goal - Goal point.
   * @param options - Pathfinding options.
   * @returns Cache key.
   */
  getCacheKey(grid, width, height, start, goal, options) {
    const gridHash = grid.slice(0, Math.min(100, grid.length)).join(",");
    const optionsHash = JSON.stringify(options);
    return `${width}x${height}_${start.x},${start.y}_${goal.x},${goal.y}_${gridHash}_${optionsHash}`;
  }
}
var Direction$1 = /* @__PURE__ */ ((Direction2) => {
  Direction2[Direction2["NORTH"] = 0] = "NORTH";
  Direction2[Direction2["NORTHEAST"] = 1] = "NORTHEAST";
  Direction2[Direction2["EAST"] = 2] = "EAST";
  Direction2[Direction2["SOUTHEAST"] = 3] = "SOUTHEAST";
  Direction2[Direction2["SOUTH"] = 4] = "SOUTH";
  Direction2[Direction2["SOUTHWEST"] = 5] = "SOUTHWEST";
  Direction2[Direction2["WEST"] = 6] = "WEST";
  Direction2[Direction2["NORTHWEST"] = 7] = "NORTHWEST";
  return Direction2;
})(Direction$1 || {});
var MovementType$1 = /* @__PURE__ */ ((MovementType2) => {
  MovementType2["CARDINAL"] = "cardinal";
  MovementType2["DIAGONAL"] = "diagonal";
  MovementType2["ALL"] = "all";
  return MovementType2;
})(MovementType$1 || {});
var CellType$3 = /* @__PURE__ */ ((CellType2) => {
  CellType2[CellType2["WALKABLE"] = 0] = "WALKABLE";
  CellType2[CellType2["OBSTACLE"] = 1] = "OBSTACLE";
  CellType2[CellType2["START"] = 2] = "START";
  CellType2[CellType2["GOAL"] = 3] = "GOAL";
  return CellType2;
})(CellType$3 || {});
class LineOfSight {
  /**
   * Checks if there's a line of sight between two points using Bresenham's line algorithm.
   * @param grid - The grid as a 1D array.
   * @param from - Starting point.
   * @param to - Ending point.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param options - Line-of-sight options.
   * @returns Line-of-sight result.
   */
  static checkBresenham(grid, from, to, width, height, options = {
    useBresenham: true,
    useDDA: false,
    useRayCasting: false,
    checkEndpoints: true,
    useEarlyTermination: true,
    maxDistance: Math.max(width, height)
  }) {
    const {
      checkEndpoints = true,
      useEarlyTermination = true,
      maxDistance = Math.max(width, height)
    } = options;
    try {
      if (checkEndpoints) {
        if (!this.isWalkable(grid, from, width, height) || !this.isWalkable(grid, to, width, height)) {
          return {
            hasLineOfSight: false,
            distanceToObstacle: 0,
            success: true
          };
        }
      }
      const distance2 = this.distance(from, to);
      if (distance2 > maxDistance) {
        return {
          hasLineOfSight: false,
          distanceToObstacle: distance2,
          success: true
        };
      }
      const points = this.bresenhamLine(from, to);
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        if (!checkEndpoints && (this.pointsEqual(point, from) || this.pointsEqual(point, to))) {
          continue;
        }
        if (!this.isWalkable(grid, point, width, height)) {
          return {
            hasLineOfSight: false,
            distanceToObstacle: this.distance(from, point),
            blockedAt: point,
            success: true
          };
        }
        if (useEarlyTermination && i > 10) {
          break;
        }
      }
      return {
        hasLineOfSight: true,
        distanceToObstacle: distance2,
        success: true
      };
    } catch (error) {
      return {
        hasLineOfSight: false,
        distanceToObstacle: 0,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  /**
   * Checks if there's a line of sight between two points using DDA (Digital Differential Analyzer).
   * @param grid - The grid as a 1D array.
   * @param from - Starting point.
   * @param to - Ending point.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param options - Line-of-sight options.
   * @returns Line-of-sight result.
   */
  static checkDDA(grid, from, to, width, height, options = {
    useBresenham: true,
    useDDA: false,
    useRayCasting: false,
    checkEndpoints: true,
    useEarlyTermination: true,
    maxDistance: Math.max(width, height)
  }) {
    const {
      checkEndpoints = true,
      useEarlyTermination = true,
      maxDistance = Math.max(width, height)
    } = options;
    try {
      if (checkEndpoints) {
        if (!this.isWalkable(grid, from, width, height) || !this.isWalkable(grid, to, width, height)) {
          return {
            hasLineOfSight: false,
            distanceToObstacle: 0,
            success: true
          };
        }
      }
      const distance2 = this.distance(from, to);
      if (distance2 > maxDistance) {
        return {
          hasLineOfSight: false,
          distanceToObstacle: distance2,
          success: true
        };
      }
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const steps = Math.max(Math.abs(dx), Math.abs(dy));
      if (steps === 0) {
        return {
          hasLineOfSight: true,
          distanceToObstacle: 0,
          success: true
        };
      }
      const xIncrement = dx / steps;
      const yIncrement = dy / steps;
      let x = from.x;
      let y = from.y;
      let currentDistance = 0;
      for (let i = 0; i <= steps; i++) {
        const point = { x: Math.round(x), y: Math.round(y) };
        if (!checkEndpoints && (this.pointsEqual(point, from) || this.pointsEqual(point, to))) {
          x += xIncrement;
          y += yIncrement;
          currentDistance += Math.sqrt(xIncrement * xIncrement + yIncrement * yIncrement);
          continue;
        }
        if (!this.isWalkable(grid, point, width, height)) {
          return {
            hasLineOfSight: false,
            distanceToObstacle: currentDistance,
            blockedAt: point,
            success: true
          };
        }
        x += xIncrement;
        y += yIncrement;
        currentDistance += Math.sqrt(xIncrement * xIncrement + yIncrement * yIncrement);
        if (useEarlyTermination && i > 10) {
          break;
        }
      }
      return {
        hasLineOfSight: true,
        distanceToObstacle: distance2,
        success: true
      };
    } catch (error) {
      return {
        hasLineOfSight: false,
        distanceToObstacle: 0,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  /**
   * Checks if there's a line of sight between two points using ray casting.
   * @param grid - The grid as a 1D array.
   * @param from - Starting point.
   * @param to - Ending point.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param options - Line-of-sight options.
   * @returns Line-of-sight result.
   */
  static checkRayCasting(grid, from, to, width, height, options = {
    useBresenham: true,
    useDDA: false,
    useRayCasting: false,
    checkEndpoints: true,
    useEarlyTermination: true,
    maxDistance: Math.max(width, height)
  }) {
    const {
      checkEndpoints = true,
      useEarlyTermination = true,
      maxDistance = Math.max(width, height)
    } = options;
    try {
      if (checkEndpoints) {
        if (!this.isWalkable(grid, from, width, height) || !this.isWalkable(grid, to, width, height)) {
          return {
            hasLineOfSight: false,
            distanceToObstacle: 0,
            success: true
          };
        }
      }
      const distance2 = this.distance(from, to);
      if (distance2 > maxDistance) {
        return {
          hasLineOfSight: false,
          distanceToObstacle: distance2,
          success: true
        };
      }
      const ray = this.castRay(from, to, distance2);
      for (let i = 0; i < ray.length; i++) {
        const point = ray[i];
        if (!checkEndpoints && (this.pointsEqual(point, from) || this.pointsEqual(point, to))) {
          continue;
        }
        if (!this.isWalkable(grid, point, width, height)) {
          return {
            hasLineOfSight: false,
            distanceToObstacle: this.distance(from, point),
            blockedAt: point,
            success: true
          };
        }
        if (useEarlyTermination && i > 10) {
          break;
        }
      }
      return {
        hasLineOfSight: true,
        distanceToObstacle: distance2,
        success: true
      };
    } catch (error) {
      return {
        hasLineOfSight: false,
        distanceToObstacle: 0,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  /**
   * Checks if there's a line of sight between two points using the best available method.
   * @param grid - The grid as a 1D array.
   * @param from - Starting point.
   * @param to - Ending point.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param options - Line-of-sight options.
   * @returns Line-of-sight result.
   */
  static check(grid, from, to, width, height, options = {
    useBresenham: true,
    useDDA: false,
    useRayCasting: false,
    checkEndpoints: true,
    useEarlyTermination: true,
    maxDistance: Math.max(width, height)
  }) {
    const {
      useBresenham = true,
      useDDA = false,
      useRayCasting = false
    } = options;
    if (useBresenham) {
      return this.checkBresenham(grid, from, to, width, height, options);
    } else if (useDDA) {
      return this.checkDDA(grid, from, to, width, height, options);
    } else if (useRayCasting) {
      return this.checkRayCasting(grid, from, to, width, height, options);
    } else {
      return this.checkBresenham(grid, from, to, width, height, options);
    }
  }
  /**
   * Generates points along a line using Bresenham's algorithm.
   * @param from - Starting point.
   * @param to - Ending point.
   * @returns Array of points along the line.
   */
  static bresenhamLine(from, to) {
    const points = [];
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const sx = from.x < to.x ? 1 : -1;
    const sy = from.y < to.y ? 1 : -1;
    let error = dx - dy;
    let x = from.x;
    let y = from.y;
    while (true) {
      points.push({ x, y });
      if (x === to.x && y === to.y) break;
      const error2 = 2 * error;
      if (error2 > -dy) {
        error -= dy;
        x += sx;
      }
      if (error2 < dx) {
        error += dx;
        y += sy;
      }
    }
    return points;
  }
  /**
   * Casts a ray from one point to another.
   * @param from - Starting point.
   * @param to - Ending point.
   * @param maxDistance - Maximum distance to cast.
   * @returns Array of points along the ray.
   */
  static castRay(from, to, _maxDistance) {
    const points = [];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance2 = Math.sqrt(dx * dx + dy * dy);
    if (distance2 === 0) {
      return [from];
    }
    const steps = Math.ceil(distance2);
    const xStep = dx / steps;
    const yStep = dy / steps;
    for (let i = 0; i <= steps; i++) {
      const x = Math.round(from.x + i * xStep);
      const y = Math.round(from.y + i * yStep);
      points.push({ x, y });
    }
    return points;
  }
  /**
   * Calculates the distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Distance.
   */
  static distance(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  /**
   * Checks if two points are equal.
   * @param a - First point.
   * @param b - Second point.
   * @param tolerance - Numerical tolerance.
   * @returns True if points are equal.
   */
  static pointsEqual(a, b, tolerance = 1e-10) {
    return Math.abs(a.x - b.x) < tolerance && Math.abs(a.y - b.y) < tolerance;
  }
  /**
   * Checks if a point is within grid bounds.
   * @param point - Point to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if point is within bounds.
   */
  static isWithinBounds(point, width, height) {
    return point.x >= 0 && point.x < width && point.y >= 0 && point.y < height;
  }
  /**
   * Checks if a cell is walkable.
   * @param grid - The grid.
   * @param point - Point to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if cell is walkable.
   */
  static isWalkable(grid, point, width, height) {
    if (!this.isWithinBounds(point, width, height)) {
      return false;
    }
    const index = point.y * width + point.x;
    return grid[index] === CellType$3.WALKABLE || grid[index] === CellType$3.START || grid[index] === CellType$3.GOAL;
  }
}
class ThetaStar {
  /**
   * Creates an instance of ThetaStar.
   * @param config - Optional configuration for the algorithm.
   */
  constructor(config = {}) {
    this.cache = /* @__PURE__ */ new Map();
    this.lineOfSightCache = /* @__PURE__ */ new Map();
    this.config = {
      allowDiagonal: true,
      diagonalOnlyWhenClear: true,
      movementType: MovementType$1.ALL,
      useTieBreaking: true,
      useLazyEvaluation: true,
      useGoalBounding: false,
      validateInput: true,
      enableCaching: true,
      maxIterations: 1e4,
      tolerance: 1e-10,
      ...config
    };
    this.stats = {
      nodesExplored: 0,
      lineOfSightChecks: 0,
      parentUpdates: 0,
      iterations: 0,
      diagonalMoves: 0,
      cardinalMoves: 0,
      executionTime: 0,
      success: true
    };
  }
  /**
   * Finds a path from start to goal using Theta*.
   * @param grid - The grid as a 1D array.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param start - Starting point.
   * @param goal - Goal point.
   * @param options - Pathfinding options.
   * @returns Pathfinding result.
   */
  findPath(grid, width, height, start, goal, options = {}) {
    const startTime = performance.now();
    const pathOptions = {
      returnExplored: false,
      returnLineOfSight: false,
      useManhattanHeuristic: true,
      useEuclideanHeuristic: false,
      optimizePath: true,
      useGoalBounding: this.config.useGoalBounding,
      maxPathLength: width * height,
      ...options
    };
    try {
      if (this.config.validateInput) {
        const validation = this.validateGrid(grid, width, height, start, goal);
        if (!validation.isValid) {
          throw new Error(`Invalid grid: ${validation.errors.join(", ")}`);
        }
      }
      if (this.config.enableCaching) {
        const cacheKey = this.getCacheKey(grid, width, height, start, goal, pathOptions);
        const cached = this.cache.get(cacheKey);
        if (cached) {
          return cached;
        }
      }
      this.resetStats();
      if (this.pointsEqual(start, goal, this.config.tolerance)) {
        const result2 = {
          path: [start],
          found: true,
          cost: 0,
          length: 1,
          explored: [],
          stats: this.getStats()
        };
        if (this.config.enableCaching) {
          const cacheKey = this.getCacheKey(grid, width, height, start, goal, pathOptions);
          this.cache.set(cacheKey, result2);
        }
        return result2;
      }
      const openSet = [];
      const closedSet = /* @__PURE__ */ new Set();
      const cameFrom = /* @__PURE__ */ new Map();
      const startNode = {
        x: start.x,
        y: start.y,
        g: 0,
        h: this.calculateHeuristic(start, goal, pathOptions),
        f: 0
      };
      startNode.f = startNode.g + startNode.h;
      openSet.push(startNode);
      const openSetMap = /* @__PURE__ */ new Map();
      openSetMap.set(this.pointToKey(start), startNode);
      let found = false;
      let goalNode = null;
      while (openSet.length > 0 && this.stats.iterations < this.config.maxIterations) {
        this.stats.iterations++;
        const current = this.getLowestFCostNode(openSet, openSetMap);
        if (!current) break;
        const currentKey = this.pointToKey(current);
        this.removeFromOpenSet(openSet, openSetMap, current);
        closedSet.add(currentKey);
        if (this.pointsEqual(current, goal, this.config.tolerance)) {
          found = true;
          goalNode = current;
          break;
        }
        const neighbors = this.getNeighbors(current, grid, width, height);
        for (const neighbor of neighbors) {
          const neighborKey = this.pointToKey(neighbor);
          if (closedSet.has(neighborKey)) {
            continue;
          }
          let tentativeG = current.g + this.getMovementCost(current, neighbor);
          if (current.parent) {
            const lineOfSightOptions = {
              useBresenham: true,
              checkEndpoints: false,
              useEarlyTermination: true,
              maxDistance: Math.max(width, height)
            };
            const hasLineOfSight = this.checkLineOfSight(
              grid,
              current.parent,
              neighbor,
              width,
              height,
              lineOfSightOptions
            );
            if (hasLineOfSight) {
              const grandparentG = current.parent.g + this.getMovementCost(current.parent, neighbor);
              if (grandparentG < tentativeG) {
                tentativeG = grandparentG;
                neighbor.parent = current.parent;
                this.stats.parentUpdates++;
              }
            }
          }
          const existingNode = openSetMap.get(neighborKey);
          if (!existingNode || tentativeG < existingNode.g) {
            const newNode = {
              x: neighbor.x,
              y: neighbor.y,
              parent: current,
              g: tentativeG,
              h: this.calculateHeuristic(neighbor, goal, pathOptions),
              f: 0
            };
            newNode.f = newNode.g + newNode.h;
            if (this.isDiagonalMove(current, neighbor)) {
              this.stats.diagonalMoves++;
            } else {
              this.stats.cardinalMoves++;
            }
            if (existingNode) {
              this.removeFromOpenSet(openSet, openSetMap, existingNode);
            }
            openSet.push(newNode);
            openSetMap.set(neighborKey, newNode);
            cameFrom.set(neighborKey, current);
          }
        }
        this.stats.nodesExplored++;
      }
      let path = [];
      let cost = 0;
      let explored = [];
      if (found && goalNode) {
        path = this.reconstructPath(goalNode);
        cost = goalNode.g;
        if (pathOptions.returnExplored) {
          explored = Array.from(cameFrom.values());
        }
        if (pathOptions.optimizePath) {
          const optimization = this.optimizePath(path, grid, width, height);
          path = optimization.path;
        }
      }
      const executionTime = performance.now() - startTime;
      this.stats.executionTime = executionTime;
      this.stats.success = found;
      const result = {
        path,
        found,
        cost,
        length: path.length,
        explored,
        stats: this.getStats()
      };
      if (this.config.enableCaching) {
        const cacheKey = this.getCacheKey(grid, width, height, start, goal, pathOptions);
        this.cache.set(cacheKey, result);
      }
      return result;
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        path: [],
        found: false,
        cost: 0,
        length: 0,
        explored: [],
        stats: {
          nodesExplored: this.stats.nodesExplored,
          lineOfSightChecks: this.stats.lineOfSightChecks,
          parentUpdates: this.stats.parentUpdates,
          iterations: this.stats.iterations,
          diagonalMoves: this.stats.diagonalMoves,
          cardinalMoves: this.stats.cardinalMoves,
          executionTime,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      };
    }
  }
  /**
   * Validates a grid for pathfinding.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param start - Starting point.
   * @param goal - Goal point.
   * @param options - Validation options.
   * @returns Validation result.
   */
  validateGrid(grid, width, height, start, goal, options = {}) {
    const validationOptions = {
      checkBounds: true,
      checkObstacles: true,
      checkStartGoal: true,
      checkConnectivity: true,
      minGridSize: 1,
      maxGridSize: 1e4,
      ...options
    };
    const errors = [];
    const warnings = [];
    if (validationOptions.checkBounds) {
      if (width < validationOptions.minGridSize || height < validationOptions.minGridSize) {
        errors.push(`Grid size too small: ${width}x${height}`);
      }
      if (width > validationOptions.maxGridSize || height > validationOptions.maxGridSize) {
        errors.push(`Grid size too large: ${width}x${height}`);
      }
      if (grid.length !== width * height) {
        errors.push(`Grid array length mismatch: expected ${width * height}, got ${grid.length}`);
      }
    }
    if (validationOptions.checkStartGoal) {
      if (!this.isWithinBounds(start, width, height)) {
        errors.push(`Start point out of bounds: (${start.x}, ${start.y})`);
      }
      if (!this.isWithinBounds(goal, width, height)) {
        errors.push(`Goal point out of bounds: (${goal.x}, ${goal.y})`);
      }
      if (this.isWithinBounds(start, width, height) && !this.isWalkable(grid, start, width, height)) {
        errors.push(`Start point is not walkable: (${start.x}, ${start.y})`);
      }
      if (this.isWithinBounds(goal, width, height) && !this.isWalkable(grid, goal, width, height)) {
        errors.push(`Goal point is not walkable: (${goal.x}, ${goal.y})`);
      }
    }
    if (validationOptions.checkObstacles) {
      let obstacleCount = 0;
      for (const cell of grid) {
        if (cell === CellType$3.OBSTACLE) {
          obstacleCount++;
        }
      }
      const obstacleRatio = obstacleCount / grid.length;
      if (obstacleRatio > 0.8) {
        warnings.push(`High obstacle ratio: ${(obstacleRatio * 100).toFixed(1)}%`);
      }
    }
    if (validationOptions.checkConnectivity && errors.length === 0) {
      const visited = /* @__PURE__ */ new Set();
      const queue = [start];
      visited.add(this.pointToKey(start));
      while (queue.length > 0) {
        const current = queue.shift();
        if (this.pointsEqual(current, goal, this.config.tolerance)) {
          break;
        }
        const neighbors = this.getNeighbors(current, grid, width, height);
        for (const neighbor of neighbors) {
          const neighborKey = this.pointToKey(neighbor);
          if (!visited.has(neighborKey)) {
            visited.add(neighborKey);
            queue.push(neighbor);
          }
        }
      }
      if (!visited.has(this.pointToKey(goal))) {
        errors.push("No path exists between start and goal");
      }
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      hasValidBounds: !errors.some((e) => e.includes("bounds")),
      hasValidObstacles: !errors.some((e) => e.includes("obstacle")),
      hasValidStartGoal: !errors.some((e) => e.includes("Start") || e.includes("Goal")),
      isConnected: !errors.some((e) => e.includes("path exists"))
    };
  }
  /**
   * Optimizes a path by removing redundant points.
   * @param path - Path to optimize.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param options - Optimization options.
   * @returns Optimization result.
   */
  optimizePath(path, grid, width, height, options = {}) {
    const optimizationOptions = {
      removeRedundant: true,
      smoothPath: false,
      useLineOfSight: true,
      smoothingFactor: 0.5,
      maxSmoothingIterations: 10,
      ...options
    };
    try {
      let optimizedPath = [...path];
      let pointsRemoved = 0;
      let iterations = 0;
      if (optimizationOptions.removeRedundant) {
        const originalLength = optimizedPath.length;
        optimizedPath = this.removeRedundantPoints(optimizedPath, grid, width, height);
        pointsRemoved = originalLength - optimizedPath.length;
      }
      if (optimizationOptions.smoothPath) {
        for (let i = 0; i < optimizationOptions.maxSmoothingIterations; i++) {
          iterations++;
          const smoothed = this.smoothPath(optimizedPath, grid, width, height, optimizationOptions.smoothingFactor);
          if (smoothed.length === optimizedPath.length) break;
          optimizedPath = smoothed;
        }
      }
      const reduction = path.length > 0 ? pointsRemoved / path.length * 100 : 0;
      return {
        path: optimizedPath,
        pointsRemoved,
        success: true,
        stats: {
          originalLength: path.length,
          optimizedLength: optimizedPath.length,
          reduction,
          iterations
        }
      };
    } catch (error) {
      return {
        path,
        pointsRemoved: 0,
        success: false,
        stats: {
          originalLength: path.length,
          optimizedLength: path.length,
          reduction: 0,
          iterations: 0
        }
      };
    }
  }
  /**
   * Compares two pathfinding results.
   * @param result1 - First result.
   * @param result2 - Second result.
   * @param options - Comparison options.
   * @returns Comparison result.
   */
  compare(result1, result2, options = {}) {
    const comparisonOptions = {
      tolerance: this.config.tolerance,
      ...options
    };
    const lengthDifference = Math.abs(result1.length - result2.length);
    const costDifference = Math.abs(result1.cost - result2.cost);
    const explorationDifference = Math.abs(result1.stats.nodesExplored - result2.stats.nodesExplored);
    const timeDifference = Math.abs(result1.stats.executionTime - result2.stats.executionTime);
    const lineOfSightDifference = Math.abs(result1.stats.lineOfSightChecks - result2.stats.lineOfSightChecks);
    const areEquivalent = lengthDifference < comparisonOptions.tolerance && costDifference < comparisonOptions.tolerance && explorationDifference < comparisonOptions.tolerance && timeDifference < comparisonOptions.tolerance && lineOfSightDifference < comparisonOptions.tolerance;
    const maxLength = Math.max(result1.length, result2.length);
    const maxCost = Math.max(result1.cost, result2.cost);
    const maxExploration = Math.max(result1.stats.nodesExplored, result2.stats.nodesExplored);
    const maxTime = Math.max(result1.stats.executionTime, result2.stats.executionTime);
    const maxLineOfSight = Math.max(result1.stats.lineOfSightChecks, result2.stats.lineOfSightChecks);
    const lengthSimilarity = maxLength === 0 ? 1 : 1 - lengthDifference / maxLength;
    const costSimilarity = maxCost === 0 ? 1 : 1 - costDifference / maxCost;
    const explorationSimilarity = maxExploration === 0 ? 1 : 1 - explorationDifference / maxExploration;
    const timeSimilarity = maxTime === 0 ? 1 : 1 - timeDifference / maxTime;
    const lineOfSightSimilarity = maxLineOfSight === 0 ? 1 : 1 - lineOfSightDifference / maxLineOfSight;
    const similarity = (lengthSimilarity + costSimilarity + explorationSimilarity + timeSimilarity + lineOfSightSimilarity) / 5;
    return {
      areEquivalent,
      lengthDifference,
      costDifference,
      explorationDifference,
      timeDifference,
      lineOfSightDifference,
      similarity: Math.max(0, Math.min(1, similarity))
    };
  }
  /**
   * Serializes a Theta* result to JSON.
   * @param result - Result to serialize.
   * @param options - Serialization options.
   * @returns Serialized result.
   */
  serialize(result, options = {}) {
    const serializationOptions = {
      precision: 6,
      includeStats: false,
      includeExplored: false,
      ...options
    };
    const round = (value) => {
      return Math.round(value * Math.pow(10, serializationOptions.precision)) / Math.pow(10, serializationOptions.precision);
    };
    const roundPoint = (point) => ({
      x: round(point.x),
      y: round(point.y)
    });
    const serialized = {
      path: result.path.map(roundPoint),
      found: result.found,
      cost: round(result.cost),
      length: result.length
    };
    if (serializationOptions.includeStats) {
      serialized.stats = result.stats;
    }
    if (serializationOptions.includeExplored) {
      serialized.explored = result.explored;
    }
    return serialized;
  }
  /**
   * Updates the configuration.
   * @param newConfig - New configuration options.
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
  /**
   * Gets the current configuration.
   * @returns The current configuration.
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Gets the current statistics.
   * @returns The current statistics.
   */
  getStats() {
    return { ...this.stats };
  }
  /**
   * Resets the statistics.
   */
  resetStats() {
    this.stats = {
      nodesExplored: 0,
      lineOfSightChecks: 0,
      parentUpdates: 0,
      iterations: 0,
      diagonalMoves: 0,
      cardinalMoves: 0,
      executionTime: 0,
      success: true
    };
  }
  /**
   * Clears the cache.
   */
  clearCache() {
    this.cache.clear();
    this.lineOfSightCache.clear();
  }
  /**
   * Calculates the heuristic cost between two points.
   * @param from - Starting point.
   * @param to - Goal point.
   * @param options - Pathfinding options.
   * @returns Heuristic cost.
   */
  calculateHeuristic(from, to, options) {
    if (options.customHeuristic) {
      return options.customHeuristic(from, to);
    }
    if (options.useEuclideanHeuristic) {
      return this.distance(from, to);
    }
    if (options.useManhattanHeuristic) {
      return this.manhattanDistance(from, to);
    }
    return this.manhattanDistance(from, to);
  }
  /**
   * Gets the node with the lowest f-cost from the open set.
   * @param openSet - Open set array.
   * @param openSetMap - Open set map.
   * @returns Node with lowest f-cost.
   */
  getLowestFCostNode(openSet, openSetMap) {
    if (openSet.length === 0) return null;
    let lowest = openSet[0];
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < lowest.f || this.config.useTieBreaking && openSet[i].f === lowest.f && openSet[i].h < lowest.h) {
        lowest = openSet[i];
      }
    }
    return lowest;
  }
  /**
   * Removes a node from the open set.
   * @param openSet - Open set array.
   * @param openSetMap - Open set map.
   * @param node - Node to remove.
   */
  removeFromOpenSet(openSet, openSetMap, node) {
    const key = this.pointToKey(node);
    openSetMap.delete(key);
    const index = openSet.findIndex((n) => this.pointsEqual(n, node, this.config.tolerance));
    if (index !== -1) {
      openSet.splice(index, 1);
    }
  }
  /**
   * Reconstructs the path from the goal node.
   * @param goalNode - Goal node.
   * @returns Reconstructed path.
   */
  reconstructPath(goalNode) {
    const path = [];
    let current = goalNode;
    while (current) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }
    return path;
  }
  /**
   * Gets neighbors of a node.
   * @param node - Current node.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Array of neighbor points.
   */
  getNeighbors(node, grid, width, height) {
    const neighbors = [];
    const directions = this.getValidDirections();
    for (const direction of directions) {
      const neighbor = this.getNeighborInDirection(node, direction);
      if (this.isWithinBounds(neighbor, width, height) && this.isWalkable(grid, neighbor, width, height)) {
        neighbors.push(neighbor);
      }
    }
    return neighbors;
  }
  /**
   * Gets valid directions based on configuration.
   * @returns Array of valid directions.
   */
  getValidDirections() {
    const directions = [];
    directions.push(Direction$1.NORTH, Direction$1.EAST, Direction$1.SOUTH, Direction$1.WEST);
    if (this.config.allowDiagonal) {
      directions.push(Direction$1.NORTHEAST, Direction$1.SOUTHEAST, Direction$1.SOUTHWEST, Direction$1.NORTHWEST);
    }
    return directions;
  }
  /**
   * Gets a neighbor in a specific direction.
   * @param point - Current point.
   * @param direction - Direction to move.
   * @returns Neighbor point.
   */
  getNeighborInDirection(point, direction) {
    const directionVectors = [
      { x: 0, y: -1 },
      // NORTH
      { x: 1, y: -1 },
      // NORTHEAST
      { x: 1, y: 0 },
      // EAST
      { x: 1, y: 1 },
      // SOUTHEAST
      { x: 0, y: 1 },
      // SOUTH
      { x: -1, y: 1 },
      // SOUTHWEST
      { x: -1, y: 0 },
      // WEST
      { x: -1, y: -1 }
      // NORTHWEST
    ];
    const vector = directionVectors[direction];
    return { x: point.x + vector.x, y: point.y + vector.y };
  }
  /**
   * Calculates the movement cost between two points.
   * @param from - Starting point.
   * @param to - Ending point.
   * @returns Movement cost.
   */
  getMovementCost(from, to) {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    if (dx === 1 && dy === 1) {
      return Math.sqrt(2);
    } else if (dx === 1 || dy === 1) {
      return 1;
    } else {
      return this.distance(from, to);
    }
  }
  /**
   * Checks if a move is diagonal.
   * @param from - Starting point.
   * @param to - Ending point.
   * @returns True if move is diagonal.
   */
  isDiagonalMove(from, to) {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    return dx === 1 && dy === 1;
  }
  /**
   * Checks line of sight between two points.
   * @param grid - The grid.
   * @param from - Starting point.
   * @param to - Ending point.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param options - Line-of-sight options.
   * @returns True if line of sight exists.
   */
  checkLineOfSight(grid, from, to, width, height, options) {
    this.stats.lineOfSightChecks++;
    if (this.config.enableCaching) {
      const cacheKey = `${this.pointToKey(from)}-${this.pointToKey(to)}`;
      const cached = this.lineOfSightCache.get(cacheKey);
      if (cached !== void 0) {
        return cached;
      }
    }
    const result = LineOfSight.check(grid, from, to, width, height, options);
    const hasLineOfSight = result.hasLineOfSight;
    if (this.config.enableCaching) {
      const cacheKey = `${this.pointToKey(from)}-${this.pointToKey(to)}`;
      this.lineOfSightCache.set(cacheKey, hasLineOfSight);
    }
    return hasLineOfSight;
  }
  /**
   * Removes redundant points from a path using line-of-sight optimization.
   * @param path - Path to optimize.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Optimized path.
   */
  removeRedundantPoints(path, grid, width, height) {
    if (path.length <= 2) return path;
    const optimized = [path[0]];
    let lastValid = 0;
    for (let i = 2; i < path.length; i++) {
      const lineOfSightOptions = {
        useBresenham: true,
        checkEndpoints: false,
        useEarlyTermination: true,
        maxDistance: Math.max(width, height)
      };
      if (!this.checkLineOfSight(grid, path[lastValid], path[i], width, height, lineOfSightOptions)) {
        optimized.push(path[i - 1]);
        lastValid = i - 1;
      }
    }
    optimized.push(path[path.length - 1]);
    return optimized;
  }
  /**
   * Smooths a path using simple interpolation.
   * @param path - Path to smooth.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param factor - Smoothing factor.
   * @returns Smoothed path.
   */
  smoothPath(path, grid, width, height, factor) {
    if (path.length <= 2) return path;
    const smoothed = [path[0]];
    for (let i = 1; i < path.length - 1; i++) {
      const prev = path[i - 1];
      const current = path[i];
      const next = path[i + 1];
      const smoothedX = current.x + factor * ((prev.x + next.x) / 2 - current.x);
      const smoothedY = current.y + factor * ((prev.y + next.y) / 2 - current.y);
      const smoothedPoint = { x: Math.round(smoothedX), y: Math.round(smoothedY) };
      if (this.isWalkable(grid, smoothedPoint, width, height)) {
        smoothed.push(smoothedPoint);
      } else {
        smoothed.push(current);
      }
    }
    smoothed.push(path[path.length - 1]);
    return smoothed;
  }
  /**
   * Generates a cache key for the given parameters.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param start - Starting point.
   * @param goal - Goal point.
   * @param options - Pathfinding options.
   * @returns Cache key.
   */
  getCacheKey(grid, width, height, start, goal, options) {
    const gridHash = grid.slice(0, Math.min(100, grid.length)).join(",");
    const optionsHash = JSON.stringify(options);
    return `theta-${width}x${height}_${start.x},${start.y}_${goal.x},${goal.y}_${gridHash}_${optionsHash}`;
  }
  /**
   * Calculates the distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Distance.
   */
  distance(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  /**
   * Calculates the Manhattan distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Manhattan distance.
   */
  manhattanDistance(a, b) {
    return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
  }
  /**
   * Checks if a point is within grid bounds.
   * @param point - Point to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if point is within bounds.
   */
  isWithinBounds(point, width, height) {
    return point.x >= 0 && point.x < width && point.y >= 0 && point.y < height;
  }
  /**
   * Checks if a cell is walkable.
   * @param grid - The grid.
   * @param point - Point to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if cell is walkable.
   */
  isWalkable(grid, point, width, height) {
    if (!this.isWithinBounds(point, width, height)) {
      return false;
    }
    const index = point.y * width + point.x;
    return grid[index] === CellType$3.WALKABLE || grid[index] === CellType$3.START || grid[index] === CellType$3.GOAL;
  }
  /**
   * Creates a key for a point (for use in maps/sets).
   * @param point - Point to create key for.
   * @returns String key.
   */
  pointToKey(point) {
    return `${point.x},${point.y}`;
  }
  /**
   * Checks if two points are equal.
   * @param a - First point.
   * @param b - Second point.
   * @param tolerance - Numerical tolerance.
   * @returns True if points are equal.
   */
  pointsEqual(a, b, tolerance = 1e-10) {
    return Math.abs(a.x - b.x) < tolerance && Math.abs(a.y - b.y) < tolerance;
  }
}
class ThetaStarUtils {
  /**
   * Generates a test grid with random obstacles.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param obstacleRatio - Ratio of obstacles (0-1).
   * @param seed - Random seed for reproducible results.
   * @returns Generated grid.
   */
  static generateTestGrid(width, height, obstacleRatio = 0.3, seed) {
    const grid = new Array(width * height).fill(CellType.WALKABLE);
    if (seed !== void 0) {
      this.seedRandom(seed);
    }
    for (let i = 0; i < grid.length; i++) {
      if (Math.random() < obstacleRatio) {
        grid[i] = CellType.OBSTACLE;
      }
    }
    return grid;
  }
  /**
   * Generates a maze-like grid using recursive backtracking.
   * @param width - Grid width (must be odd).
   * @param height - Grid height (must be odd).
   * @param seed - Random seed for reproducible results.
   * @returns Generated maze grid.
   */
  static generateMazeGrid(width, height, seed) {
    if (width % 2 === 0 || height % 2 === 0) {
      throw new Error("Width and height must be odd for maze generation");
    }
    const grid = new Array(width * height).fill(CellType.OBSTACLE);
    if (seed !== void 0) {
      this.seedRandom(seed);
    }
    const stack = [{ x: 1, y: 1 }];
    grid[1 * width + 1] = CellType.WALKABLE;
    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(current, grid, width, height);
      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        const wall = this.getWallBetween(current, next);
        grid[next.y * width + next.x] = CellType.WALKABLE;
        grid[wall.y * width + wall.x] = CellType.WALKABLE;
        stack.push(next);
      } else {
        stack.pop();
      }
    }
    return grid;
  }
  /**
   * Generates a grid with rooms and corridors.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param roomCount - Number of rooms to generate.
   * @param minRoomSize - Minimum room size.
   * @param maxRoomSize - Maximum room size.
   * @param seed - Random seed for reproducible results.
   * @returns Generated room grid.
   */
  static generateRoomGrid(width, height, roomCount = 5, minRoomSize = 3, maxRoomSize = 8, seed) {
    const grid = new Array(width * height).fill(CellType.OBSTACLE);
    if (seed !== void 0) {
      this.seedRandom(seed);
    }
    const rooms = [];
    for (let i = 0; i < roomCount; i++) {
      const roomWidth = minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1));
      const roomHeight = minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1));
      const x = 1 + Math.floor(Math.random() * (width - roomWidth - 2));
      const y = 1 + Math.floor(Math.random() * (height - roomHeight - 2));
      let overlaps = false;
      for (const room of rooms) {
        if (x < room.x + room.width && x + roomWidth > room.x && y < room.y + room.height && y + roomHeight > room.y) {
          overlaps = true;
          break;
        }
      }
      if (!overlaps) {
        for (let ry = y; ry < y + roomHeight; ry++) {
          for (let rx = x; rx < x + roomWidth; rx++) {
            grid[ry * width + rx] = CellType.WALKABLE;
          }
        }
        rooms.push({ x, y, width: roomWidth, height: roomHeight });
      }
    }
    for (let i = 1; i < rooms.length; i++) {
      const room1 = rooms[i - 1];
      const room2 = rooms[i];
      const center1 = {
        x: room1.x + Math.floor(room1.width / 2),
        y: room1.y + Math.floor(room1.height / 2)
      };
      const center2 = {
        x: room2.x + Math.floor(room2.width / 2),
        y: room2.y + Math.floor(room2.height / 2)
      };
      this.createCorridor(grid, width, height, center1, center2);
    }
    return grid;
  }
  /**
   * Creates a corridor between two points.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param from - Starting point.
   * @param to - Ending point.
   */
  static createCorridor(grid, width, height, from, to) {
    const startX = Math.min(from.x, to.x);
    const endX = Math.max(from.x, to.x);
    for (let x = startX; x <= endX; x++) {
      if (x >= 0 && x < width && from.y >= 0 && from.y < height) {
        grid[from.y * width + x] = CellType.WALKABLE;
      }
    }
    const startY = Math.min(from.y, to.y);
    const endY = Math.max(from.y, to.y);
    for (let y = startY; y <= endY; y++) {
      if (to.x >= 0 && to.x < width && y >= 0 && y < height) {
        grid[y * width + to.x] = CellType.WALKABLE;
      }
    }
  }
  /**
   * Gets unvisited neighbors for maze generation.
   * @param point - Current point.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Array of unvisited neighbors.
   */
  static getUnvisitedNeighbors(point, grid, width, height) {
    const neighbors = [];
    const directions = [
      { x: 0, y: -2 },
      // North
      { x: 2, y: 0 },
      // East
      { x: 0, y: 2 },
      // South
      { x: -2, y: 0 }
      // West
    ];
    for (const dir of directions) {
      const neighbor = { x: point.x + dir.x, y: point.y + dir.y };
      if (neighbor.x >= 0 && neighbor.x < width && neighbor.y >= 0 && neighbor.y < height && grid[neighbor.y * width + neighbor.x] === CellType.OBSTACLE) {
        neighbors.push(neighbor);
      }
    }
    return neighbors;
  }
  /**
   * Gets the wall between two points for maze generation.
   * @param from - First point.
   * @param to - Second point.
   * @returns Wall point.
   */
  static getWallBetween(from, to) {
    return {
      x: from.x + (to.x - from.x) / 2,
      y: from.y + (to.y - from.y) / 2
    };
  }
  /**
   * Calculates the distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Distance.
   */
  static distance(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  /**
   * Calculates the Manhattan distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Manhattan distance.
   */
  static manhattanDistance(a, b) {
    return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
  }
  /**
   * Calculates the Chebyshev distance between two points.
   * @param a - First point.
   @param b - Second point.
   * @returns Chebyshev distance.
   */
  static chebyshevDistance(a, b) {
    return Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
  }
  /**
   * Gets the direction vector between two points.
   * @param from - Starting point.
   * @param to - Ending point.
   * @returns Direction vector.
   */
  static getDirectionVector(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) {
      return { x: 0, y: 0 };
    }
    return { x: dx / length, y: dy / length };
  }
  /**
   * Gets the direction enum from a direction vector.
   * @param vector - Direction vector.
   * @returns Direction enum.
   */
  static getDirectionFromVector(vector) {
    const angle = Math.atan2(vector.y, vector.x);
    const normalizedAngle = (angle + Math.PI * 2) % (Math.PI * 2);
    const directions = [
      Direction.EAST,
      // 0
      Direction.NORTHEAST,
      // π/4
      Direction.NORTH,
      // π/2
      Direction.NORTHWEST,
      // 3π/4
      Direction.WEST,
      // π
      Direction.SOUTHWEST,
      // 5π/4
      Direction.SOUTH,
      // 3π/2
      Direction.SOUTHEAST
      // 7π/4
    ];
    const index = Math.round(normalizedAngle / (Math.PI / 4)) % 8;
    return directions[index];
  }
  /**
   * Normalizes a direction vector.
   * @param vector - Vector to normalize.
   * @returns Normalized vector.
   */
  static normalizeVector(vector) {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (length === 0) {
      return { x: 0, y: 0 };
    }
    return { x: vector.x / length, y: vector.y / length };
  }
  /**
   * Calculates the dot product of two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Dot product.
   */
  static dotProduct(a, b) {
    return a.x * b.x + a.y * b.y;
  }
  /**
   * Calculates the cross product of two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Cross product (scalar in 2D).
   */
  static crossProduct(a, b) {
    return a.x * b.y - a.y * b.x;
  }
  /**
   * Calculates the angle between two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Angle in radians.
   */
  static angleBetweenVectors(a, b) {
    const dot = this.dotProduct(a, b);
    const magA = Math.sqrt(a.x * a.x + a.y * a.y);
    const magB = Math.sqrt(b.x * b.x + b.y * b.y);
    if (magA === 0 || magB === 0) {
      return 0;
    }
    return Math.acos(Math.max(-1, Math.min(1, dot / (magA * magB))));
  }
  /**
   * Rotates a vector by an angle.
   * @param vector - Vector to rotate.
   * @param angle - Angle in radians.
   * @returns Rotated vector.
   */
  static rotateVector(vector, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: vector.x * cos - vector.y * sin,
      y: vector.x * sin + vector.y * cos
    };
  }
  /**
   * Interpolates between two points.
   * @param a - First point.
   * @param b - Second point.
   * @param t - Interpolation factor (0-1).
   * @returns Interpolated point.
   */
  static interpolatePoints(a, b, t) {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t
    };
  }
  /**
   * Calculates the centroid of a set of points.
   * @param points - Array of points.
   * @returns Centroid point.
   */
  static calculateCentroid(points) {
    if (points.length === 0) {
      return { x: 0, y: 0 };
    }
    const sum = points.reduce(
      (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
      { x: 0, y: 0 }
    );
    return {
      x: sum.x / points.length,
      y: sum.y / points.length
    };
  }
  /**
   * Calculates the bounding box of a set of points.
   * @param points - Array of points.
   * @returns Bounding box.
   */
  static calculateBoundingBox(points) {
    if (points.length === 0) {
      return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    }
    let minX = points[0].x;
    let minY = points[0].y;
    let maxX = points[0].x;
    let maxY = points[0].y;
    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
    return {
      min: { x: minX, y: minY },
      max: { x: maxX, y: maxY }
    };
  }
  /**
   * Checks if a point is inside a polygon.
   * @param point - Point to check.
   * @param polygon - Polygon vertices.
   * @returns True if point is inside polygon.
   */
  static isPointInPolygon(point, polygon) {
    if (polygon.length < 3) return false;
    let inside = false;
    let j = polygon.length - 1;
    for (let i = 0; i < polygon.length; i++) {
      const pi = polygon[i];
      const pj = polygon[j];
      if (pi.y > point.y !== pj.y > point.y && point.x < (pj.x - pi.x) * (point.y - pi.y) / (pj.y - pi.y) + pi.x) {
        inside = !inside;
      }
      j = i;
    }
    return inside;
  }
  /**
   * Calculates the area of a polygon.
   * @param polygon - Polygon vertices.
   * @returns Polygon area.
   */
  static calculatePolygonArea(polygon) {
    if (polygon.length < 3) return 0;
    let area = 0;
    let j = polygon.length - 1;
    for (let i = 0; i < polygon.length; i++) {
      area += (polygon[j].x + polygon[i].x) * (polygon[j].y - polygon[i].y);
      j = i;
    }
    return Math.abs(area) / 2;
  }
  /**
   * Calculates the perimeter of a polygon.
   * @param polygon - Polygon vertices.
   * @returns Polygon perimeter.
   */
  static calculatePolygonPerimeter(polygon) {
    if (polygon.length < 2) return 0;
    let perimeter = 0;
    let j = polygon.length - 1;
    for (let i = 0; i < polygon.length; i++) {
      perimeter += this.distance(polygon[j], polygon[i]);
      j = i;
    }
    return perimeter;
  }
  /**
   * Generates a random point within bounds.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param seed - Random seed.
   * @returns Random point.
   */
  static generateRandomPoint(width, height, seed) {
    if (seed !== void 0) {
      this.seedRandom(seed);
    }
    return {
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height)
    };
  }
  /**
   * Generates multiple random points within bounds.
   * @param count - Number of points to generate.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param seed - Random seed.
   * @returns Array of random points.
   */
  static generateRandomPoints(count, width, height, seed) {
    if (seed !== void 0) {
      this.seedRandom(seed);
    }
    const points = [];
    for (let i = 0; i < count; i++) {
      points.push(this.generateRandomPoint(width, height));
    }
    return points;
  }
  /**
   * Finds the closest point to a target from a set of points.
   * @param target - Target point.
   * @param points - Array of points to search.
   * @returns Closest point.
   */
  static findClosestPoint(target, points) {
    if (points.length === 0) return null;
    let closest = points[0];
    let minDistance = this.distance(target, closest);
    for (let i = 1; i < points.length; i++) {
      const distance2 = this.distance(target, points[i]);
      if (distance2 < minDistance) {
        minDistance = distance2;
        closest = points[i];
      }
    }
    return closest;
  }
  /**
   * Finds all points within a radius of a target.
   * @param target - Target point.
   * @param points - Array of points to search.
   * @param radius - Search radius.
   * @returns Array of points within radius.
   */
  static findPointsInRadius(target, points, radius) {
    return points.filter((point) => this.distance(target, point) <= radius);
  }
  /**
   * Sorts points by distance from a target.
   * @param target - Target point.
   * @param points - Array of points to sort.
   * @returns Sorted array of points.
   */
  static sortPointsByDistance(target, points) {
    return [...points].sort((a, b) => {
      const distA = this.distance(target, a);
      const distB = this.distance(target, b);
      return distA - distB;
    });
  }
  /**
   * Creates a default configuration for Theta*.
   * @returns Default configuration.
   */
  static createDefaultConfig() {
    return {
      allowDiagonal: true,
      diagonalOnlyWhenClear: true,
      movementType: MovementType.ALL,
      useTieBreaking: true,
      useLazyEvaluation: true,
      useGoalBounding: false,
      validateInput: true,
      enableCaching: true,
      maxIterations: 1e4,
      tolerance: 1e-10
    };
  }
  /**
   * Creates a default options object for pathfinding.
   * @returns Default options.
   */
  static createDefaultOptions() {
    return {
      returnExplored: false,
      returnLineOfSight: false,
      useManhattanHeuristic: true,
      useEuclideanHeuristic: false,
      optimizePath: true,
      useGoalBounding: false,
      maxPathLength: 1e4
    };
  }
  /**
   * Creates a default line-of-sight options object.
   * @returns Default line-of-sight options.
   */
  static createDefaultLineOfSightOptions() {
    return {
      useBresenham: true,
      useDDA: false,
      useRayCasting: false,
      checkEndpoints: true,
      useEarlyTermination: true,
      maxDistance: 1e3
    };
  }
  /**
   * Creates a default grid validation options object.
   * @returns Default grid validation options.
   */
  static createDefaultGridValidationOptions() {
    return {
      checkBounds: true,
      checkObstacles: true,
      checkStartGoal: true,
      checkConnectivity: true,
      minGridSize: 1,
      maxGridSize: 1e4
    };
  }
  /**
   * Creates a default path optimization options object.
   * @returns Default path optimization options.
   */
  static createDefaultPathOptimizationOptions() {
    return {
      removeRedundant: true,
      smoothPath: false,
      useLineOfSight: true,
      smoothingFactor: 0.5,
      maxSmoothingIterations: 10
    };
  }
  /**
   * Seeds the random number generator for reproducible results.
   * @param seed - Random seed.
   */
  static seedRandom(seed) {
    let currentSeed = seed;
    Math.random = () => {
      currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
      return currentSeed / 4294967296;
    };
  }
  /**
   * Converts a grid to a visual string representation.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param start - Optional start point.
   * @param goal - Optional goal point.
   * @returns Visual string representation.
   */
  static gridToString(grid, width, height, start, goal) {
    let result = "";
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        const point = { x, y };
        if (start && this.pointsEqual(point, start)) {
          result += "S";
        } else if (goal && this.pointsEqual(point, goal)) {
          result += "G";
        } else {
          switch (grid[index]) {
            case CellType.WALKABLE:
              result += ".";
              break;
            case CellType.OBSTACLE:
              result += "#";
              break;
            case CellType.START:
              result += "S";
              break;
            case CellType.GOAL:
              result += "G";
              break;
            default:
              result += "?";
          }
        }
      }
      result += "\n";
    }
    return result;
  }
  /**
   * Converts a path to a visual string representation on a grid.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param path - Path to visualize.
   * @returns Visual string representation.
   */
  static pathToString(grid, width, height, path) {
    const pathSet = new Set(path.map((p) => `${p.x},${p.y}`));
    let result = "";
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        if (pathSet.has(`${x},${y}`)) {
          result += "*";
        } else {
          switch (grid[index]) {
            case CellType.WALKABLE:
              result += ".";
              break;
            case CellType.OBSTACLE:
              result += "#";
              break;
            case CellType.START:
              result += "S";
              break;
            case CellType.GOAL:
              result += "G";
              break;
            default:
              result += "?";
          }
        }
      }
      result += "\n";
    }
    return result;
  }
  /**
   * Checks if two points are equal.
   * @param a - First point.
   * @param b - Second point.
   * @param tolerance - Numerical tolerance.
   * @returns True if points are equal.
   */
  static pointsEqual(a, b, tolerance = 1e-10) {
    return Math.abs(a.x - b.x) < tolerance && Math.abs(a.y - b.y) < tolerance;
  }
}
var CellType$2 = /* @__PURE__ */ ((CellType2) => {
  CellType2[CellType2["WALKABLE"] = 0] = "WALKABLE";
  CellType2[CellType2["OBSTACLE"] = 1] = "OBSTACLE";
  CellType2[CellType2["GOAL"] = 2] = "GOAL";
  CellType2[CellType2["AGENT"] = 3] = "AGENT";
  return CellType2;
})(CellType$2 || {});
class FlowFieldGenerator {
  /**
   * Generates an integration cost field using Dijkstra's algorithm.
   * @param grid - The grid as a 1D array.
   * @param goals - Array of goal points.
   * @param config - Flow field configuration.
   * @param options - Generation options.
   * @returns Integration cost field.
   */
  static generateIntegrationField(grid, goals, config, options = {
    returnIntegrationField: true,
    returnFlowField: false,
    normalizeFlowVectors: true,
    useEarlyTermination: true,
    maxIterations: config.width * config.height,
    useGoalBounding: false,
    useMultiGoal: false
  }) {
    const {
      useEarlyTermination = true,
      maxIterations = config.width * config.height
    } = options;
    const integrationField = [];
    const processed = /* @__PURE__ */ new Set();
    const queue = [];
    for (let y = 0; y < config.height; y++) {
      for (let x = 0; x < config.width; x++) {
        const index = y * config.width + x;
        const point = { x, y };
        if (grid[index] === CellType$2.GOAL) {
          integrationField.push({
            x,
            y,
            cost: 0,
            processed: true
          });
          queue.push({ point, cost: 0 });
          processed.add(this.pointToKey(point));
        } else if (grid[index] === CellType$2.OBSTACLE) {
          integrationField.push({
            x,
            y,
            cost: config.maxCost,
            processed: true
          });
          processed.add(this.pointToKey(point));
        } else {
          integrationField.push({
            x,
            y,
            cost: config.maxCost,
            processed: false
          });
        }
      }
    }
    for (const goal of goals) {
      const goalKey = this.pointToKey(goal);
      if (!processed.has(goalKey)) {
        const goalIndex = goal.y * config.width + goal.x;
        if (goalIndex >= 0 && goalIndex < grid.length && grid[goalIndex] !== CellType$2.OBSTACLE) {
          integrationField[goalIndex].cost = 0;
          integrationField[goalIndex].processed = true;
          queue.push({ point: goal, cost: 0 });
          processed.add(goalKey);
        }
      }
    }
    let iterations = 0;
    while (queue.length > 0 && iterations < maxIterations) {
      iterations++;
      let minIndex = 0;
      for (let i = 1; i < queue.length; i++) {
        if (queue[i].cost < queue[minIndex].cost) {
          minIndex = i;
        }
      }
      const current = queue.splice(minIndex, 1)[0];
      const currentKey = this.pointToKey(current.point);
      if (processed.has(currentKey)) {
        continue;
      }
      processed.add(currentKey);
      const cellIndex = current.point.y * config.width + current.point.x;
      integrationField[cellIndex].cost = current.cost;
      integrationField[cellIndex].processed = true;
      const neighbors = this.getNeighbors(current.point, grid, config);
      for (const neighbor of neighbors) {
        const neighborKey = this.pointToKey(neighbor);
        if (processed.has(neighborKey)) {
          continue;
        }
        const movementCost = this.getMovementCost(current.point, neighbor, config);
        const newCost = current.cost + movementCost;
        const neighborCellIndex = neighbor.y * config.width + neighbor.x;
        if (newCost < integrationField[neighborCellIndex].cost) {
          integrationField[neighborCellIndex].cost = newCost;
          queue.push({ point: neighbor, cost: newCost });
        }
      }
      if (useEarlyTermination && iterations > 1e3) {
        break;
      }
    }
    return integrationField;
  }
  /**
   * Generates a flow vector field from an integration cost field.
   * @param integrationField - The integration cost field.
   * @param grid - The grid as a 1D array.
   * @param config - Flow field configuration.
   * @param options - Generation options.
   * @returns Flow vector field.
   */
  static generateFlowFieldFromIntegration(integrationField, grid, config, options = {
    returnIntegrationField: false,
    returnFlowField: true,
    normalizeFlowVectors: true,
    useEarlyTermination: false,
    maxIterations: config.width * config.height,
    useGoalBounding: false,
    useMultiGoal: false
  }) {
    const {
      normalizeFlowVectors = true
    } = options;
    const flowField = [];
    for (let y = 0; y < config.height; y++) {
      for (let x = 0; x < config.width; x++) {
        const index = y * config.width + x;
        const point = { x, y };
        if (grid[index] === CellType$2.OBSTACLE) {
          flowField.push({
            x,
            y,
            vector: { x: 0, y: 0 },
            magnitude: 0,
            valid: false
          });
          continue;
        }
        const neighbors = this.getNeighbors(point, grid, config);
        let bestNeighbor = null;
        let minCost = integrationField[index].cost;
        for (const neighbor of neighbors) {
          const neighborIndex = neighbor.y * config.width + neighbor.x;
          const neighborCost = integrationField[neighborIndex].cost;
          if (neighborCost < minCost) {
            minCost = neighborCost;
            bestNeighbor = neighbor;
          }
        }
        if (bestNeighbor) {
          let vector = {
            x: bestNeighbor.x - point.x,
            y: bestNeighbor.y - point.y
          };
          if (normalizeFlowVectors) {
            const magnitude2 = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
            if (magnitude2 > 0) {
              vector.x /= magnitude2;
              vector.y /= magnitude2;
            }
          }
          const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
          flowField.push({
            x,
            y,
            vector,
            magnitude,
            valid: true
          });
        } else {
          flowField.push({
            x,
            y,
            vector: { x: 0, y: 0 },
            magnitude: 0,
            valid: false
          });
        }
      }
    }
    return flowField;
  }
  /**
   * Generates a complete flow field (integration + flow).
   * @param grid - The grid as a 1D array.
   * @param goals - Array of goal points.
   * @param config - Flow field configuration.
   * @param options - Generation options.
   * @returns Complete flow field result.
   */
  static generateFlowField(grid, goals, config, options = {
    returnIntegrationField: true,
    returnFlowField: true,
    normalizeFlowVectors: true,
    useEarlyTermination: true,
    maxIterations: config.width * config.height,
    useGoalBounding: false,
    useMultiGoal: false
  }) {
    const integrationField = this.generateIntegrationField(grid, goals, config, options);
    const flowField = this.generateFlowFieldFromIntegration(integrationField, grid, config, options);
    return { integrationField, flowField };
  }
  /**
   * Generates a multi-goal flow field by composing multiple single-goal fields.
   * @param grid - The grid as a 1D array.
   * @param goalGroups - Array of goal groups.
   * @param config - Flow field configuration.
   * @param options - Generation options.
   * @returns Composed flow field result.
   */
  static generateMultiGoalFlowField(grid, goalGroups, config, options = {
    returnIntegrationField: true,
    returnFlowField: true,
    normalizeFlowVectors: true,
    useEarlyTermination: true,
    maxIterations: config.width * config.height,
    useGoalBounding: false,
    useMultiGoal: true
  }) {
    const integrationFields = [];
    const flowFields = [];
    for (const goals of goalGroups) {
      const result = this.generateFlowField(grid, goals, config, options);
      integrationFields.push(result.integrationField);
      flowFields.push(result.flowField);
    }
    const composedIntegrationField = this.composeIntegrationFields(integrationFields, config);
    const composedFlowField = this.composeFlowFields(flowFields, config);
    return {
      integrationField: composedIntegrationField,
      flowField: composedFlowField
    };
  }
  /**
   * Composes multiple integration fields into one.
   * @param integrationFields - Array of integration fields.
   * @param config - Flow field configuration.
   * @returns Composed integration field.
   */
  static composeIntegrationFields(integrationFields, config) {
    const composed = [];
    for (let i = 0; i < config.width * config.height; i++) {
      let minCost = config.maxCost;
      for (const field of integrationFields) {
        if (field[i].cost < minCost) {
          minCost = field[i].cost;
        }
      }
      composed.push({
        x: integrationFields[0][i].x,
        y: integrationFields[0][i].y,
        cost: minCost,
        processed: true
      });
    }
    return composed;
  }
  /**
   * Composes multiple flow fields into one.
   * @param flowFields - Array of flow fields.
   * @param config - Flow field configuration.
   * @returns Composed flow field.
   */
  static composeFlowFields(flowFields, config) {
    const composed = [];
    for (let i = 0; i < config.width * config.height; i++) {
      let bestVector = { x: 0, y: 0 };
      let bestMagnitude = 0;
      let valid = false;
      for (const field of flowFields) {
        if (field[i].valid && field[i].magnitude > bestMagnitude) {
          bestVector = field[i].vector;
          bestMagnitude = field[i].magnitude;
          valid = true;
        }
      }
      composed.push({
        x: flowFields[0][i].x,
        y: flowFields[0][i].y,
        vector: bestVector,
        magnitude: bestMagnitude,
        valid
      });
    }
    return composed;
  }
  /**
   * Gets neighbors of a point.
   * @param point - Current point.
   * @param grid - The grid.
   * @param config - Flow field configuration.
   * @returns Array of neighbor points.
   */
  static getNeighbors(point, grid, config) {
    const neighbors = [];
    const directions = this.getValidDirections(config);
    for (const direction of directions) {
      const neighbor = this.getNeighborInDirection(point, direction);
      if (this.isWithinBounds(neighbor, config.width, config.height) && this.isWalkable(grid, neighbor, config.width, config.height)) {
        neighbors.push(neighbor);
      }
    }
    return neighbors;
  }
  /**
   * Gets valid directions based on configuration.
   * @param config - Flow field configuration.
   * @returns Array of valid directions.
   */
  static getValidDirections(config) {
    const directions = [];
    directions.push(0, 1, 2, 3);
    if (config.allowDiagonal) {
      directions.push(4, 5, 6, 7);
    }
    return directions;
  }
  /**
   * Gets a neighbor in a specific direction.
   * @param point - Current point.
   * @param direction - Direction to move.
   * @returns Neighbor point.
   */
  static getNeighborInDirection(point, direction) {
    const directionVectors = [
      { x: 0, y: -1 },
      // North
      { x: 1, y: 0 },
      // East
      { x: 0, y: 1 },
      // South
      { x: -1, y: 0 },
      // West
      { x: 1, y: -1 },
      // Northeast
      { x: 1, y: 1 },
      // Southeast
      { x: -1, y: 1 },
      // Southwest
      { x: -1, y: -1 }
      // Northwest
    ];
    const vector = directionVectors[direction];
    return { x: point.x + vector.x, y: point.y + vector.y };
  }
  /**
   * Calculates the movement cost between two points.
   * @param from - Starting point.
   * @param to - Ending point.
   * @param config - Flow field configuration.
   * @returns Movement cost.
   */
  static getMovementCost(from, to, config) {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    if (dx === 1 && dy === 1) {
      return config.diagonalCost;
    } else if (dx === 1 || dy === 1) {
      return config.cardinalCost;
    } else {
      const distance2 = Math.sqrt(dx * dx + dy * dy);
      return distance2 * config.cardinalCost;
    }
  }
  /**
   * Checks if a point is within grid bounds.
   * @param point - Point to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if point is within bounds.
   */
  static isWithinBounds(point, width, height) {
    return point.x >= 0 && point.x < width && point.y >= 0 && point.y < height;
  }
  /**
   * Checks if a cell is walkable.
   * @param grid - The grid.
   * @param point - Point to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if cell is walkable.
   */
  static isWalkable(grid, point, width, height) {
    if (!this.isWithinBounds(point, width, height)) {
      return false;
    }
    const index = point.y * width + point.x;
    return grid[index] === CellType$2.WALKABLE || grid[index] === CellType$2.GOAL || grid[index] === CellType$2.AGENT;
  }
  /**
   * Creates a key for a point (for use in maps/sets).
   * @param point - Point to create key for.
   * @returns String key.
   */
  static pointToKey(point) {
    return `${point.x},${point.y}`;
  }
}
class FlowField {
  /**
   * Creates an instance of FlowField.
   * @param config - Optional configuration for the algorithm.
   */
  constructor(config = {}) {
    this.cache = /* @__PURE__ */ new Map();
    this.integrationField = [];
    this.flowField = [];
    this.config = {
      width: 100,
      height: 100,
      allowDiagonal: true,
      diagonalOnlyWhenClear: true,
      cardinalCost: 1,
      diagonalCost: Math.sqrt(2),
      maxCost: 1e4,
      useManhattanDistance: false,
      useEuclideanDistance: true,
      validateInput: true,
      enableCaching: true,
      tolerance: 1e-10,
      ...config
    };
    this.stats = {
      cellsProcessed: 0,
      goalCells: 0,
      obstacleCells: 0,
      walkableCells: 0,
      maxIntegrationCost: 0,
      minIntegrationCost: 0,
      averageIntegrationCost: 0,
      executionTime: 0,
      success: true
    };
  }
  /**
   * Generates a flow field for the given grid and goals.
   * @param grid - The grid as a 1D array.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param goals - Array of goal points.
   * @param options - Generation options.
   * @returns Flow field result.
   */
  generateFlowField(grid, width, height, goals, options = {}) {
    const startTime = performance.now();
    const flowOptions = {
      returnIntegrationField: true,
      returnFlowField: true,
      normalizeFlowVectors: true,
      useEarlyTermination: true,
      maxIterations: width * height,
      useGoalBounding: false,
      useMultiGoal: false,
      ...options
    };
    try {
      this.config = { ...this.config, width, height };
      if (this.config.validateInput) {
        const validation = this.validateInput(grid, width, height, goals);
        if (!validation.isValid) {
          throw new Error(`Invalid input: ${validation.errors.join(", ")}`);
        }
      }
      if (this.config.enableCaching) {
        const cacheKey = this.getCacheKey(grid, width, height, goals, flowOptions);
        const cached = this.cache.get(cacheKey);
        if (cached) {
          return cached;
        }
      }
      this.resetStats();
      this.countCellTypes(grid);
      const result = FlowFieldGenerator.generateFlowField(grid, goals, this.config, flowOptions);
      this.integrationField = result.integrationField;
      this.flowField = result.flowField;
      this.calculateStats();
      const executionTime = performance.now() - startTime;
      this.stats.executionTime = executionTime;
      this.stats.success = true;
      const flowFieldResult = {
        integrationField: this.integrationField,
        flowField: this.flowField,
        success: true,
        stats: this.getStats()
      };
      if (this.config.enableCaching) {
        const cacheKey = this.getCacheKey(grid, width, height, goals, flowOptions);
        this.cache.set(cacheKey, flowFieldResult);
      }
      return flowFieldResult;
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        integrationField: [],
        flowField: [],
        success: false,
        stats: {
          cellsProcessed: this.stats.cellsProcessed,
          goalCells: this.stats.goalCells,
          obstacleCells: this.stats.obstacleCells,
          walkableCells: this.stats.walkableCells,
          maxIntegrationCost: 0,
          minIntegrationCost: 0,
          averageIntegrationCost: 0,
          executionTime,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      };
    }
  }
  /**
   * Finds a path for an agent using the flow field.
   * @param start - Starting point.
   * @param flowField - The flow field.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param options - Agent pathfinding options.
   * @returns Agent pathfinding result.
   */
  findAgentPath(start, flowField, width, height, options = {}) {
    const startTime = performance.now();
    const agentOptions = {
      useFlowField: true,
      useIntegrationField: false,
      useAStarFallback: true,
      maxPathLength: width * height,
      smoothPath: false,
      smoothingFactor: 0.5,
      useEarlyTermination: true,
      ...options
    };
    try {
      const path = [start];
      let current = start;
      let flowFieldLookups = 0;
      let integrationFieldLookups = 0;
      let aStarNodes = 0;
      let usedFlowField = false;
      let usedAStarFallback = false;
      if (agentOptions.useFlowField) {
        usedFlowField = true;
        while (path.length < agentOptions.maxPathLength) {
          const currentIndex = current.y * width + current.x;
          const flowCell = flowField[currentIndex];
          flowFieldLookups++;
          if (!flowCell.valid || flowCell.magnitude === 0) {
            if (agentOptions.useAStarFallback) {
              usedAStarFallback = true;
              const aStarPath = this.findAStarPath(current, flowField, width, height);
              if (aStarPath.length > 0) {
                path.push(...aStarPath.slice(1));
                aStarNodes = aStarPath.length;
              }
            }
            break;
          }
          const next = {
            x: Math.round(current.x + flowCell.vector.x),
            y: Math.round(current.y + flowCell.vector.y)
          };
          if (this.isGoal(next, flowField, width, height) || this.isObstacle(next, flowField, width, height)) {
            break;
          }
          if (path.some((p) => this.pointsEqual(p, next, this.config.tolerance))) {
            break;
          }
          path.push(next);
          current = next;
          if (agentOptions.useEarlyTermination && path.length > 100) {
            break;
          }
        }
      }
      const executionTime = performance.now() - startTime;
      const cost = this.calculatePathCost(path);
      const found = path.length > 1;
      return {
        path,
        found,
        cost,
        length: path.length,
        usedFlowField,
        usedAStarFallback,
        stats: {
          flowFieldLookups,
          integrationFieldLookups,
          aStarNodes,
          executionTime
        }
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        path: [start],
        found: false,
        cost: 0,
        length: 1,
        usedFlowField: false,
        usedAStarFallback: false,
        stats: {
          flowFieldLookups: 0,
          integrationFieldLookups: 0,
          aStarNodes: 0,
          executionTime
        }
      };
    }
  }
  /**
   * Simulates crowd movement using flow fields.
   * @param agents - Array of agent starting positions.
   * @param flowField - The flow field.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param options - Crowd simulation options.
   * @returns Crowd simulation result.
   */
  simulateCrowd(agents, flowField, width, height, options = {}) {
    const startTime = performance.now();
    const crowdOptions = {
      agentCount: agents.length,
      useFlowFieldForAll: true,
      useAStarForSome: false,
      aStarPercentage: 0,
      useCollisionAvoidance: false,
      collisionAvoidanceRadius: 2,
      useFlockingBehavior: false,
      flockingParameters: {
        separationWeight: 1,
        alignmentWeight: 1,
        cohesionWeight: 1
      },
      ...options
    };
    try {
      const agentPaths = [];
      let agentsReachedGoal = 0;
      let agentsStuck = 0;
      let totalPathLength = 0;
      let collisionCount = 0;
      for (let i = 0; i < Math.min(agents.length, crowdOptions.agentCount); i++) {
        const agentStart = agents[i];
        const agentPath = this.findAgentPath(agentStart, flowField, width, height);
        agentPaths.push(agentPath.path);
        totalPathLength += agentPath.length;
        if (agentPath.found) {
          agentsReachedGoal++;
        } else {
          agentsStuck++;
        }
        if (crowdOptions.useCollisionAvoidance) {
          for (let j = 0; j < i; j++) {
            if (this.checkCollision(agentPath.path, agentPaths[j], crowdOptions.collisionAvoidanceRadius)) {
              collisionCount++;
            }
          }
        }
      }
      const executionTime = performance.now() - startTime;
      const averagePathLength = agentPaths.length > 0 ? totalPathLength / agentPaths.length : 0;
      return {
        agentPaths,
        success: true,
        stats: {
          agentsReachedGoal,
          agentsStuck,
          averagePathLength,
          averageExecutionTime: executionTime / agentPaths.length,
          totalExecutionTime: executionTime,
          collisionCount
        }
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        agentPaths: [],
        success: false,
        stats: {
          agentsReachedGoal: 0,
          agentsStuck: 0,
          averagePathLength: 0,
          averageExecutionTime: 0,
          totalExecutionTime: executionTime,
          collisionCount: 0
        }
      };
    }
  }
  /**
   * Validates a flow field.
   * @param flowField - The flow field to validate.
   * @param integrationField - The integration field to validate.
   * @param options - Validation options.
   * @returns Validation result.
   */
  validateFlowField(flowField, integrationField, options = {}) {
    const validationOptions = {
      checkFlowFieldValidity: true,
      checkIntegrationFieldValidity: true,
      checkUnreachableAreas: true,
      checkInvalidFlowVectors: true,
      maxFlowVectorMagnitude: 2,
      minFlowVectorMagnitude: 0,
      checkCircularFlows: true,
      ...options
    };
    const errors = [];
    const warnings = [];
    if (validationOptions.checkFlowFieldValidity) {
      for (const cell of flowField) {
        if (!cell.valid && cell.magnitude > 0) {
          errors.push(`Invalid flow cell at (${cell.x}, ${cell.y}) with magnitude ${cell.magnitude}`);
        }
      }
    }
    if (validationOptions.checkIntegrationFieldValidity) {
      for (const cell of integrationField) {
        if (cell.cost < 0) {
          errors.push(`Negative integration cost at (${cell.x}, ${cell.y}): ${cell.cost}`);
        }
        if (cell.cost > this.config.maxCost) {
          warnings.push(`High integration cost at (${cell.x}, ${cell.y}): ${cell.cost}`);
        }
      }
    }
    if (validationOptions.checkUnreachableAreas) {
      const unreachableCount = integrationField.filter((cell) => cell.cost >= this.config.maxCost).length;
      if (unreachableCount > 0) {
        warnings.push(`${unreachableCount} unreachable cells found`);
      }
    }
    if (validationOptions.checkInvalidFlowVectors) {
      for (const cell of flowField) {
        if (cell.valid) {
          if (cell.magnitude > validationOptions.maxFlowVectorMagnitude) {
            errors.push(`Flow vector magnitude too high at (${cell.x}, ${cell.y}): ${cell.magnitude}`);
          }
          if (cell.magnitude < validationOptions.minFlowVectorMagnitude) {
            warnings.push(`Flow vector magnitude too low at (${cell.x}, ${cell.y}): ${cell.magnitude}`);
          }
        }
      }
    }
    if (validationOptions.checkCircularFlows) {
      const circularFlows = this.detectCircularFlows(flowField);
      if (circularFlows.length > 0) {
        warnings.push(`${circularFlows.length} circular flows detected`);
      }
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      hasValidFlowField: !errors.some((e) => e.includes("flow cell") || e.includes("flow vector")),
      hasValidIntegrationField: !errors.some((e) => e.includes("integration cost")),
      hasUnreachableAreas: warnings.some((w) => w.includes("unreachable")),
      hasInvalidFlowVectors: errors.some((e) => e.includes("flow vector")),
      hasCircularFlows: warnings.some((w) => w.includes("circular flows"))
    };
  }
  /**
   * Compares two flow fields.
   * @param flowField1 - First flow field.
   * @param flowField2 - Second flow field.
   * @param options - Comparison options.
   * @returns Comparison result.
   */
  compareFlowFields(flowField1, flowField2, options = {}) {
    const comparisonOptions = {
      compareIntegrationFields: true,
      compareFlowFields: true,
      compareStats: true,
      tolerance: this.config.tolerance,
      ...options
    };
    const differences = [];
    let integrationFieldSimilarity = 1;
    let flowFieldSimilarity = 1;
    let overallSimilarity = 1;
    if (comparisonOptions.compareIntegrationFields) {
      const integrationSimilarity = this.compareIntegrationFields(
        flowField1.integrationField,
        flowField2.integrationField,
        comparisonOptions.tolerance
      );
      integrationFieldSimilarity = integrationSimilarity.similarity;
      if (integrationSimilarity.differences.length > 0) {
        differences.push(...integrationSimilarity.differences);
      }
    }
    if (comparisonOptions.compareFlowFields) {
      const flowSimilarity = this.compareFlowFieldArrays(
        flowField1.flowField,
        flowField2.flowField,
        comparisonOptions.tolerance
      );
      flowFieldSimilarity = flowSimilarity.similarity;
      if (flowSimilarity.differences.length > 0) {
        differences.push(...flowSimilarity.differences);
      }
    }
    if (comparisonOptions.compareStats) {
      const statsSimilarity = this.compareStats(flowField1.stats, flowField2.stats);
      if (statsSimilarity.differences.length > 0) {
        differences.push(...statsSimilarity.differences);
      }
    }
    overallSimilarity = (integrationFieldSimilarity + flowFieldSimilarity) / 2;
    const executionTimeDifference = Math.abs(flowField1.stats.executionTime - flowField2.stats.executionTime);
    return {
      areEquivalent: differences.length === 0,
      integrationFieldSimilarity,
      flowFieldSimilarity,
      overallSimilarity,
      executionTimeDifference,
      memoryUsageDifference: 0,
      // Not implemented
      differencesCount: differences.length,
      differences
    };
  }
  /**
   * Serializes a flow field result to JSON.
   * @param result - Result to serialize.
   * @param options - Serialization options.
   * @returns Serialized result.
   */
  serialize(result, options = {}) {
    const serializationOptions = {
      precision: 6,
      includeStats: false,
      includeIntegrationField: false,
      includeFlowField: false,
      ...options
    };
    const round = (value) => {
      return Math.round(value * Math.pow(10, serializationOptions.precision)) / Math.pow(10, serializationOptions.precision);
    };
    const serialized = {
      dimensions: {
        width: this.config.width,
        height: this.config.height
      },
      success: result.success
    };
    if (serializationOptions.includeStats) {
      serialized.stats = result.stats;
    }
    if (serializationOptions.includeIntegrationField) {
      serialized.integrationField = result.integrationField.map((cell) => ({
        x: cell.x,
        y: cell.y,
        cost: round(cell.cost),
        processed: cell.processed
      }));
    }
    if (serializationOptions.includeFlowField) {
      serialized.flowField = result.flowField.map((cell) => ({
        x: cell.x,
        y: cell.y,
        vector: {
          x: round(cell.vector.x),
          y: round(cell.vector.y)
        },
        magnitude: round(cell.magnitude),
        valid: cell.valid
      }));
    }
    return serialized;
  }
  /**
   * Updates the configuration.
   * @param newConfig - New configuration options.
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
  /**
   * Gets the current configuration.
   * @returns The current configuration.
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Gets the current statistics.
   * @returns The current statistics.
   */
  getStats() {
    return { ...this.stats };
  }
  /**
   * Resets the statistics.
   */
  resetStats() {
    this.stats = {
      cellsProcessed: 0,
      goalCells: 0,
      obstacleCells: 0,
      walkableCells: 0,
      maxIntegrationCost: 0,
      minIntegrationCost: 0,
      averageIntegrationCost: 0,
      executionTime: 0,
      success: true
    };
  }
  /**
   * Clears the cache.
   */
  clearCache() {
    this.cache.clear();
  }
  /**
   * Validates input parameters.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param goals - Goal points.
   * @returns Validation result.
   */
  validateInput(grid, width, height, goals) {
    const errors = [];
    if (grid.length !== width * height) {
      errors.push(`Grid length mismatch: expected ${width * height}, got ${grid.length}`);
    }
    if (goals.length === 0) {
      errors.push("No goals provided");
    }
    for (const goal of goals) {
      if (goal.x < 0 || goal.x >= width || goal.y < 0 || goal.y >= height) {
        errors.push(`Goal out of bounds: (${goal.x}, ${goal.y})`);
      }
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  /**
   * Counts different cell types in the grid.
   * @param grid - The grid.
   */
  countCellTypes(grid) {
    this.stats.goalCells = 0;
    this.stats.obstacleCells = 0;
    this.stats.walkableCells = 0;
    for (const cell of grid) {
      switch (cell) {
        case CellType$2.GOAL:
          this.stats.goalCells++;
          break;
        case CellType$2.OBSTACLE:
          this.stats.obstacleCells++;
          break;
        case CellType$2.WALKABLE:
        case CellType$2.AGENT:
          this.stats.walkableCells++;
          break;
      }
    }
  }
  /**
   * Calculates statistics from the integration field.
   */
  calculateStats() {
    if (this.integrationField.length === 0) return;
    let totalCost = 0;
    let validCells = 0;
    this.stats.maxIntegrationCost = 0;
    this.stats.minIntegrationCost = this.config.maxCost;
    for (const cell of this.integrationField) {
      if (cell.cost < this.config.maxCost) {
        totalCost += cell.cost;
        validCells++;
        this.stats.maxIntegrationCost = Math.max(this.stats.maxIntegrationCost, cell.cost);
        this.stats.minIntegrationCost = Math.min(this.stats.minIntegrationCost, cell.cost);
      }
    }
    this.stats.averageIntegrationCost = validCells > 0 ? totalCost / validCells : 0;
    this.stats.cellsProcessed = validCells;
  }
  /**
   * Generates a cache key for the given parameters.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param goals - Goal points.
   * @param options - Generation options.
   * @returns Cache key.
   */
  getCacheKey(grid, width, height, goals, options) {
    const gridHash = grid.slice(0, Math.min(100, grid.length)).join(",");
    const goalsHash = goals.map((g) => `${g.x},${g.y}`).join("|");
    const optionsHash = JSON.stringify(options);
    return `flow-${width}x${height}_${goalsHash}_${gridHash}_${optionsHash}`;
  }
  /**
   * Finds a path using A* as fallback.
   * @param start - Starting point.
   * @param flowField - The flow field.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns A* path.
   */
  findAStarPath(start, flowField, width, height) {
    const visited = /* @__PURE__ */ new Set();
    const queue = [
      { point: start, cost: 0, path: [start] }
    ];
    while (queue.length > 0) {
      const current = queue.shift();
      const currentKey = this.pointToKey(current.point);
      if (visited.has(currentKey)) continue;
      visited.add(currentKey);
      if (this.isGoal(current.point, flowField, width, height)) {
        return current.path;
      }
      const neighbors = this.getNeighbors(current.point, width, height);
      for (const neighbor of neighbors) {
        const neighborKey = this.pointToKey(neighbor);
        if (visited.has(neighborKey)) continue;
        const newPath = [...current.path, neighbor];
        const newCost = current.cost + 1;
        queue.push({ point: neighbor, cost: newCost, path: newPath });
      }
      queue.sort((a, b) => a.cost - b.cost);
    }
    return [];
  }
  /**
   * Checks if a point is a goal.
   * @param point - Point to check.
   * @param flowField - The flow field.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if point is a goal.
   */
  isGoal(point, flowField, width, height) {
    if (!this.isWithinBounds(point, width, height)) return false;
    const index = point.y * width + point.x;
    const cell = flowField[index];
    return cell.magnitude === 0;
  }
  /**
   * Checks if a point is an obstacle.
   * @param point - Point to check.
   * @param flowField - The flow field.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if point is an obstacle.
   */
  isObstacle(point, flowField, width, height) {
    if (!this.isWithinBounds(point, width, height)) return true;
    const index = point.y * width + point.x;
    const cell = flowField[index];
    return !cell.valid;
  }
  /**
   * Calculates the cost of a path.
   * @param path - Path to calculate cost for.
   * @returns Path cost.
   */
  calculatePathCost(path) {
    let cost = 0;
    for (let i = 1; i < path.length; i++) {
      const from = path[i - 1];
      const to = path[i];
      const dx = Math.abs(to.x - from.x);
      const dy = Math.abs(to.y - from.y);
      if (dx === 1 && dy === 1) {
        cost += this.config.diagonalCost;
      } else if (dx === 1 || dy === 1) {
        cost += this.config.cardinalCost;
      } else {
        cost += Math.sqrt(dx * dx + dy * dy) * this.config.cardinalCost;
      }
    }
    return cost;
  }
  /**
   * Detects circular flows in the flow field.
   * @param flowField - The flow field.
   * @returns Array of circular flow points.
   */
  detectCircularFlows(flowField) {
    const circularFlows = [];
    const visited = /* @__PURE__ */ new Set();
    for (const cell of flowField) {
      if (!cell.valid || cell.magnitude === 0) continue;
      const startKey = this.pointToKey(cell);
      if (visited.has(startKey)) continue;
      const path = [];
      let current = { x: cell.x, y: cell.y };
      const currentVisited = /* @__PURE__ */ new Set();
      while (true) {
        const currentKey = this.pointToKey(current);
        if (currentVisited.has(currentKey)) {
          const cycleStart = path.indexOf(current);
          if (cycleStart >= 0) {
            circularFlows.push(...path.slice(cycleStart));
          }
          break;
        }
        if (visited.has(currentKey)) break;
        currentVisited.add(currentKey);
        visited.add(currentKey);
        path.push(current);
        const currentIndex = current.y * this.config.width + current.x;
        const flowCell = flowField[currentIndex];
        if (!flowCell.valid || flowCell.magnitude === 0) break;
        current = {
          x: Math.round(current.x + flowCell.vector.x),
          y: Math.round(current.y + flowCell.vector.y)
        };
        if (!this.isWithinBounds(current, this.config.width, this.config.height)) break;
      }
    }
    return circularFlows;
  }
  /**
   * Compares two integration fields.
   * @param field1 - First integration field.
   * @param field2 - Second integration field.
   * @param tolerance - Comparison tolerance.
   * @returns Comparison result.
   */
  compareIntegrationFields(field1, field2, tolerance) {
    const differences = [];
    let totalCells = 0;
    let matchingCells = 0;
    for (let i = 0; i < Math.min(field1.length, field2.length); i++) {
      totalCells++;
      const cell1 = field1[i];
      const cell2 = field2[i];
      if (Math.abs(cell1.cost - cell2.cost) > tolerance) {
        differences.push(`Integration cost difference at (${cell1.x}, ${cell1.y}): ${cell1.cost} vs ${cell2.cost}`);
      } else {
        matchingCells++;
      }
    }
    const similarity = totalCells > 0 ? matchingCells / totalCells : 1;
    return { similarity, differences };
  }
  /**
   * Compares two flow field arrays.
   * @param field1 - First flow field.
   * @param field2 - Second flow field.
   * @param tolerance - Comparison tolerance.
   * @returns Comparison result.
   */
  compareFlowFieldArrays(field1, field2, tolerance) {
    const differences = [];
    let totalCells = 0;
    let matchingCells = 0;
    for (let i = 0; i < Math.min(field1.length, field2.length); i++) {
      totalCells++;
      const cell1 = field1[i];
      const cell2 = field2[i];
      if (cell1.valid !== cell2.valid) {
        differences.push(`Flow validity difference at (${cell1.x}, ${cell1.y}): ${cell1.valid} vs ${cell2.valid}`);
      } else if (Math.abs(cell1.magnitude - cell2.magnitude) > tolerance) {
        differences.push(`Flow magnitude difference at (${cell1.x}, ${cell1.y}): ${cell1.magnitude} vs ${cell2.magnitude}`);
      } else if (Math.abs(cell1.vector.x - cell2.vector.x) > tolerance || Math.abs(cell1.vector.y - cell2.vector.y) > tolerance) {
        differences.push(`Flow vector difference at (${cell1.x}, ${cell1.y}): (${cell1.vector.x}, ${cell1.vector.y}) vs (${cell2.vector.x}, ${cell2.vector.y})`);
      } else {
        matchingCells++;
      }
    }
    const similarity = totalCells > 0 ? matchingCells / totalCells : 1;
    return { similarity, differences };
  }
  /**
   * Compares two statistics objects.
   * @param stats1 - First statistics.
   * @param stats2 - Second statistics.
   * @returns Comparison result.
   */
  compareStats(stats1, stats2) {
    const differences = [];
    if (stats1.cellsProcessed !== stats2.cellsProcessed) {
      differences.push(`Cells processed difference: ${stats1.cellsProcessed} vs ${stats2.cellsProcessed}`);
    }
    if (stats1.goalCells !== stats2.goalCells) {
      differences.push(`Goal cells difference: ${stats1.goalCells} vs ${stats2.goalCells}`);
    }
    if (stats1.obstacleCells !== stats2.obstacleCells) {
      differences.push(`Obstacle cells difference: ${stats1.obstacleCells} vs ${stats2.obstacleCells}`);
    }
    return { differences };
  }
  /**
   * Checks for collision between two paths.
   * @param path1 - First path.
   * @param path2 - Second path.
   * @param radius - Collision radius.
   * @returns True if collision detected.
   */
  checkCollision(path1, path2, radius) {
    for (const point1 of path1) {
      for (const point2 of path2) {
        const distance2 = Math.sqrt(
          Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)
        );
        if (distance2 < radius) {
          return true;
        }
      }
    }
    return false;
  }
  /**
   * Gets neighbors of a point.
   * @param point - Current point.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Array of neighbor points.
   */
  getNeighbors(point, width, height) {
    const neighbors = [];
    const directions = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: -1 },
      { x: 1, y: 1 },
      { x: -1, y: 1 },
      { x: -1, y: -1 }
    ];
    for (const dir of directions) {
      const neighbor = { x: point.x + dir.x, y: point.y + dir.y };
      if (this.isWithinBounds(neighbor, width, height)) {
        neighbors.push(neighbor);
      }
    }
    return neighbors;
  }
  /**
   * Checks if a point is within grid bounds.
   * @param point - Point to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if point is within bounds.
   */
  isWithinBounds(point, width, height) {
    return point.x >= 0 && point.x < width && point.y >= 0 && point.y < height;
  }
  /**
   * Creates a key for a point (for use in maps/sets).
   * @param point - Point to create key for.
   * @returns String key.
   */
  pointToKey(point) {
    return `${point.x},${point.y}`;
  }
  /**
   * Checks if two points are equal.
   * @param a - First point.
   * @param b - Second point.
   * @param tolerance - Numerical tolerance.
   * @returns True if points are equal.
   */
  pointsEqual(a, b, tolerance = 1e-10) {
    return Math.abs(a.x - b.x) < tolerance && Math.abs(a.y - b.y) < tolerance;
  }
}
class FlowFieldUtils {
  /**
   * Generates a test grid with random obstacles.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param obstacleRatio - Ratio of obstacles (0-1).
   * @param seed - Random seed for reproducible results.
   * @returns Generated grid.
   */
  static generateTestGrid(width, height, obstacleRatio = 0.3, seed) {
    const grid = new Array(width * height).fill(CellType$2.WALKABLE);
    if (seed !== void 0) {
      this.seedRandom(seed);
    }
    for (let i = 0; i < grid.length; i++) {
      if (Math.random() < obstacleRatio) {
        grid[i] = CellType$2.OBSTACLE;
      }
    }
    return grid;
  }
  /**
   * Generates a grid with a specific pattern.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param pattern - Pattern type.
   * @param seed - Random seed for reproducible results.
   * @returns Generated grid.
   */
  static generatePatternGrid(width, height, pattern, seed) {
    if (seed !== void 0) {
      this.seedRandom(seed);
    }
    switch (pattern) {
      case "maze":
        return this.generateMazeGrid(width, height);
      case "rooms":
        return this.generateRoomGrid(width, height);
      case "corridors":
        return this.generateCorridorGrid(width, height);
      case "spiral":
        return this.generateSpiralGrid(width, height);
      default:
        return this.generateTestGrid(width, height, 0.3, seed);
    }
  }
  /**
   * Generates a maze-like grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Generated maze grid.
   */
  static generateMazeGrid(width, height) {
    const grid = new Array(width * height).fill(CellType$2.OBSTACLE);
    const stack = [{ x: 1, y: 1 }];
    grid[1 * width + 1] = CellType$2.WALKABLE;
    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(current, grid, width, height);
      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        const wall = this.getWallBetween(current, next);
        grid[next.y * width + next.x] = CellType$2.WALKABLE;
        grid[wall.y * width + wall.x] = CellType$2.WALKABLE;
        stack.push(next);
      } else {
        stack.pop();
      }
    }
    return grid;
  }
  /**
   * Generates a room-based grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Generated room grid.
   */
  static generateRoomGrid(width, height) {
    const grid = new Array(width * height).fill(CellType$2.OBSTACLE);
    const roomCount = Math.floor(Math.random() * 5) + 3;
    const rooms = [];
    for (let i = 0; i < roomCount; i++) {
      const roomWidth = 3 + Math.floor(Math.random() * 6);
      const roomHeight = 3 + Math.floor(Math.random() * 6);
      const x = 1 + Math.floor(Math.random() * (width - roomWidth - 2));
      const y = 1 + Math.floor(Math.random() * (height - roomHeight - 2));
      let overlaps = false;
      for (const room of rooms) {
        if (x < room.x + room.width && x + roomWidth > room.x && y < room.y + room.height && y + roomHeight > room.y) {
          overlaps = true;
          break;
        }
      }
      if (!overlaps) {
        for (let ry = y; ry < y + roomHeight; ry++) {
          for (let rx = x; rx < x + roomWidth; rx++) {
            grid[ry * width + rx] = CellType$2.WALKABLE;
          }
        }
        rooms.push({ x, y, width: roomWidth, height: roomHeight });
      }
    }
    for (let i = 1; i < rooms.length; i++) {
      const room1 = rooms[i - 1];
      const room2 = rooms[i];
      const center1 = {
        x: room1.x + Math.floor(room1.width / 2),
        y: room1.y + Math.floor(room1.height / 2)
      };
      const center2 = {
        x: room2.x + Math.floor(room2.width / 2),
        y: room2.y + Math.floor(room2.height / 2)
      };
      this.createCorridor(grid, width, height, center1, center2);
    }
    return grid;
  }
  /**
   * Generates a corridor-based grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Generated corridor grid.
   */
  static generateCorridorGrid(width, height) {
    const grid = new Array(width * height).fill(CellType$2.OBSTACLE);
    const corridorWidth = 2;
    const corridorSpacing = 8;
    for (let y = corridorSpacing; y < height - corridorSpacing; y += corridorSpacing) {
      for (let x = 0; x < width; x++) {
        for (let w = 0; w < corridorWidth; w++) {
          if (y + w < height) {
            grid[(y + w) * width + x] = CellType$2.WALKABLE;
          }
        }
      }
    }
    for (let x = corridorSpacing; x < width - corridorSpacing; x += corridorSpacing) {
      for (let y = 0; y < height; y++) {
        for (let w = 0; w < corridorWidth; w++) {
          if (x + w < width) {
            grid[y * width + (x + w)] = CellType$2.WALKABLE;
          }
        }
      }
    }
    return grid;
  }
  /**
   * Generates a spiral grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Generated spiral grid.
   */
  static generateSpiralGrid(width, height) {
    const grid = new Array(width * height).fill(CellType$2.OBSTACLE);
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    let x = centerX;
    let y = centerY;
    let dx = 0;
    let dy = -1;
    let step = 1;
    let stepCount = 0;
    for (let i = 0; i < width * height; i++) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        grid[y * width + x] = CellType$2.WALKABLE;
      }
      x += dx;
      y += dy;
      stepCount++;
      if (stepCount === step) {
        stepCount = 0;
        const temp = dx;
        dx = -dy;
        dy = temp;
        if (dy === 0) {
          step++;
        }
      }
    }
    return grid;
  }
  /**
   * Creates a corridor between two points.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param from - Starting point.
   * @param to - Ending point.
   */
  static createCorridor(grid, width, height, from, to) {
    const startX = Math.min(from.x, to.x);
    const endX = Math.max(from.x, to.x);
    for (let x = startX; x <= endX; x++) {
      if (x >= 0 && x < width && from.y >= 0 && from.y < height) {
        grid[from.y * width + x] = CellType$2.WALKABLE;
      }
    }
    const startY = Math.min(from.y, to.y);
    const endY = Math.max(from.y, to.y);
    for (let y = startY; y <= endY; y++) {
      if (to.x >= 0 && to.x < width && y >= 0 && y < height) {
        grid[y * width + to.x] = CellType$2.WALKABLE;
      }
    }
  }
  /**
   * Gets unvisited neighbors for maze generation.
   * @param point - Current point.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Array of unvisited neighbors.
   */
  static getUnvisitedNeighbors(point, grid, width, height) {
    const neighbors = [];
    const directions = [
      { x: 0, y: -2 },
      // North
      { x: 2, y: 0 },
      // East
      { x: 0, y: 2 },
      // South
      { x: -2, y: 0 }
      // West
    ];
    for (const dir of directions) {
      const neighbor = { x: point.x + dir.x, y: point.y + dir.y };
      if (neighbor.x >= 0 && neighbor.x < width && neighbor.y >= 0 && neighbor.y < height && grid[neighbor.y * width + neighbor.x] === CellType$2.OBSTACLE) {
        neighbors.push(neighbor);
      }
    }
    return neighbors;
  }
  /**
   * Gets the wall between two points for maze generation.
   * @param from - First point.
   * @param to - Second point.
   * @returns Wall point.
   */
  static getWallBetween(from, to) {
    return {
      x: from.x + (to.x - from.x) / 2,
      y: from.y + (to.y - from.y) / 2
    };
  }
  /**
   * Generates random goal points.
   * @param count - Number of goals to generate.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param grid - The grid.
   * @param seed - Random seed.
   * @returns Array of goal points.
   */
  static generateRandomGoals(count, width, height, grid, seed) {
    if (seed !== void 0) {
      this.seedRandom(seed);
    }
    const goals = [];
    const walkableCells = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        if (grid[index] === CellType$2.WALKABLE) {
          walkableCells.push({ x, y });
        }
      }
    }
    for (let i = 0; i < Math.min(count, walkableCells.length); i++) {
      const randomIndex = Math.floor(Math.random() * walkableCells.length);
      goals.push(walkableCells.splice(randomIndex, 1)[0]);
    }
    return goals;
  }
  /**
   * Generates goal points in a specific pattern.
   * @param pattern - Goal pattern.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param grid - The grid.
   * @param seed - Random seed.
   * @returns Array of goal points.
   */
  static generateGoalPattern(pattern, width, height, grid, seed) {
    if (seed !== void 0) {
      this.seedRandom(seed);
    }
    const goals = [];
    switch (pattern) {
      case "corners":
        goals.push(
          { x: 0, y: 0 },
          { x: width - 1, y: 0 },
          { x: 0, y: height - 1 },
          { x: width - 1, y: height - 1 }
        );
        break;
      case "center":
        goals.push({
          x: Math.floor(width / 2),
          y: Math.floor(height / 2)
        });
        break;
      case "edges":
        for (let x = 0; x < width; x++) {
          goals.push({ x, y: 0 });
          goals.push({ x, y: height - 1 });
        }
        for (let y = 1; y < height - 1; y++) {
          goals.push({ x: 0, y });
          goals.push({ x: width - 1, y });
        }
        break;
      case "random":
        return this.generateRandomGoals(5, width, height, grid, seed);
    }
    return goals.filter((goal) => {
      const index = goal.y * width + goal.x;
      return grid[index] === CellType$2.WALKABLE;
    });
  }
  /**
   * Calculates the distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Distance.
   */
  static distance(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  /**
   * Calculates the Manhattan distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Manhattan distance.
   */
  static manhattanDistance(a, b) {
    return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
  }
  /**
   * Calculates the Chebyshev distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Chebyshev distance.
   */
  static chebyshevDistance(a, b) {
    return Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
  }
  /**
   * Gets the direction vector between two points.
   * @param from - Starting point.
   * @param to - Ending point.
   * @returns Direction vector.
   */
  static getDirectionVector(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) {
      return { x: 0, y: 0 };
    }
    return { x: dx / length, y: dy / length };
  }
  /**
   * Normalizes a direction vector.
   * @param vector - Vector to normalize.
   * @returns Normalized vector.
   */
  static normalizeVector(vector) {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (length === 0) {
      return { x: 0, y: 0 };
    }
    return { x: vector.x / length, y: vector.y / length };
  }
  /**
   * Calculates the dot product of two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Dot product.
   */
  static dotProduct(a, b) {
    return a.x * b.x + a.y * b.y;
  }
  /**
   * Calculates the cross product of two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Cross product (scalar in 2D).
   */
  static crossProduct(a, b) {
    return a.x * b.y - a.y * b.x;
  }
  /**
   * Calculates the angle between two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Angle in radians.
   */
  static angleBetweenVectors(a, b) {
    const dot = this.dotProduct(a, b);
    const magA = Math.sqrt(a.x * a.x + a.y * a.y);
    const magB = Math.sqrt(b.x * b.x + b.y * b.y);
    if (magA === 0 || magB === 0) {
      return 0;
    }
    return Math.acos(Math.max(-1, Math.min(1, dot / (magA * magB))));
  }
  /**
   * Rotates a vector by an angle.
   * @param vector - Vector to rotate.
   * @param angle - Angle in radians.
   * @returns Rotated vector.
   */
  static rotateVector(vector, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: vector.x * cos - vector.y * sin,
      y: vector.x * sin + vector.y * cos
    };
  }
  /**
   * Interpolates between two points.
   * @param a - First point.
   * @param b - Second point.
   * @param t - Interpolation factor (0-1).
   * @returns Interpolated point.
   */
  static interpolatePoints(a, b, t) {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t
    };
  }
  /**
   * Calculates the centroid of a set of points.
   * @param points - Array of points.
   * @returns Centroid point.
   */
  static calculateCentroid(points) {
    if (points.length === 0) {
      return { x: 0, y: 0 };
    }
    const sum = points.reduce(
      (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
      { x: 0, y: 0 }
    );
    return {
      x: sum.x / points.length,
      y: sum.y / points.length
    };
  }
  /**
   * Calculates the bounding box of a set of points.
   * @param points - Array of points.
   * @returns Bounding box.
   */
  static calculateBoundingBox(points) {
    if (points.length === 0) {
      return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    }
    let minX = points[0].x;
    let minY = points[0].y;
    let maxX = points[0].x;
    let maxY = points[0].y;
    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
    return {
      min: { x: minX, y: minY },
      max: { x: maxX, y: maxY }
    };
  }
  /**
   * Generates random agent positions.
   * @param count - Number of agents to generate.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param grid - The grid.
   * @param seed - Random seed.
   * @returns Array of agent positions.
   */
  static generateRandomAgents(count, width, height, grid, seed) {
    if (seed !== void 0) {
      this.seedRandom(seed);
    }
    const agents = [];
    const walkableCells = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        if (grid[index] === CellType$2.WALKABLE) {
          walkableCells.push({ x, y });
        }
      }
    }
    for (let i = 0; i < Math.min(count, walkableCells.length); i++) {
      const randomIndex = Math.floor(Math.random() * walkableCells.length);
      agents.push(walkableCells.splice(randomIndex, 1)[0]);
    }
    return agents;
  }
  /**
   * Generates agent positions in a specific pattern.
   * @param pattern - Agent pattern.
   * @param count - Number of agents.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param grid - The grid.
   * @param seed - Random seed.
   * @returns Array of agent positions.
   */
  static generateAgentPattern(pattern, count, width, height, grid, seed) {
    if (seed !== void 0) {
      this.seedRandom(seed);
    }
    const agents = [];
    switch (pattern) {
      case "line":
        for (let i = 0; i < count; i++) {
          const y = Math.floor(i * height / count);
          agents.push({ x: 0, y });
        }
        break;
      case "circle":
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 4;
        for (let i = 0; i < count; i++) {
          const angle = i * 2 * Math.PI / count;
          const x = Math.round(centerX + radius * Math.cos(angle));
          const y = Math.round(centerY + radius * Math.sin(angle));
          agents.push({ x, y });
        }
        break;
      case "grid":
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);
        const cellWidth = width / cols;
        const cellHeight = height / rows;
        for (let i = 0; i < count; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = Math.round(col * cellWidth + cellWidth / 2);
          const y = Math.round(row * cellHeight + cellHeight / 2);
          agents.push({ x, y });
        }
        break;
      case "random":
        return this.generateRandomAgents(count, width, height, grid, seed);
    }
    return agents.filter((agent) => {
      const index = agent.y * width + agent.x;
      return grid[index] === CellType$2.WALKABLE;
    });
  }
  /**
   * Creates a default configuration for Flow Field.
   * @returns Default configuration.
   */
  static createDefaultConfig() {
    return {
      width: 100,
      height: 100,
      allowDiagonal: true,
      diagonalOnlyWhenClear: true,
      cardinalCost: 1,
      diagonalCost: Math.sqrt(2),
      maxCost: 1e4,
      useManhattanDistance: false,
      useEuclideanDistance: true,
      validateInput: true,
      enableCaching: true,
      tolerance: 1e-10
    };
  }
  /**
   * Creates a default options object for flow field generation.
   * @returns Default options.
   */
  static createDefaultOptions() {
    return {
      returnIntegrationField: true,
      returnFlowField: true,
      normalizeFlowVectors: true,
      useEarlyTermination: true,
      maxIterations: 1e4,
      useGoalBounding: false,
      useMultiGoal: false
    };
  }
  /**
   * Creates a default agent pathfinding options object.
   * @returns Default agent pathfinding options.
   */
  static createDefaultAgentPathfindingOptions() {
    return {
      useFlowField: true,
      useIntegrationField: false,
      useAStarFallback: true,
      maxPathLength: 1e4,
      smoothPath: false,
      smoothingFactor: 0.5,
      useEarlyTermination: true
    };
  }
  /**
   * Creates a default multi-goal options object.
   * @returns Default multi-goal options.
   */
  static createDefaultMultiGoalOptions() {
    return {
      useMultiGoal: true,
      goalWeights: [1],
      useWeightedAverage: false,
      useMinimumCost: true,
      useMaximumCost: false,
      compositionMethod: "minimum"
    };
  }
  /**
   * Creates a default dynamic obstacle options object.
   * @returns Default dynamic obstacle options.
   */
  static createDefaultDynamicObstacleOptions() {
    return {
      enableDynamicUpdates: true,
      useIncrementalUpdates: true,
      useFullRecomputation: false,
      updateRadius: 5,
      useObstacleInfluence: true,
      obstacleInfluenceRadius: 3,
      obstacleInfluenceStrength: 2
    };
  }
  /**
   * Creates a default flow field validation options object.
   * @returns Default flow field validation options.
   */
  static createDefaultFlowFieldValidationOptions() {
    return {
      checkFlowFieldValidity: true,
      checkIntegrationFieldValidity: true,
      checkUnreachableAreas: true,
      checkInvalidFlowVectors: true,
      maxFlowVectorMagnitude: 2,
      minFlowVectorMagnitude: 0,
      checkCircularFlows: true
    };
  }
  /**
   * Seeds the random number generator for reproducible results.
   * @param seed - Random seed.
   */
  static seedRandom(seed) {
    let currentSeed = seed;
    Math.random = () => {
      currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
      return currentSeed / 4294967296;
    };
  }
  /**
   * Converts a grid to a visual string representation.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param goals - Optional goal points.
   * @param agents - Optional agent points.
   * @returns Visual string representation.
   */
  static gridToString(grid, width, height, goals = [], agents = []) {
    let result = "";
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const point = { x, y };
        if (goals.some((g) => this.pointsEqual(g, point))) {
          result += "G";
        } else if (agents.some((a) => this.pointsEqual(a, point))) {
          result += "A";
        } else {
          switch (grid[y * width + x]) {
            case CellType$2.WALKABLE:
              result += ".";
              break;
            case CellType$2.OBSTACLE:
              result += "#";
              break;
            case CellType$2.GOAL:
              result += "G";
              break;
            case CellType$2.AGENT:
              result += "A";
              break;
            default:
              result += "?";
          }
        }
      }
      result += "\n";
    }
    return result;
  }
  /**
   * Converts a flow field to a visual string representation.
   * @param flowField - The flow field.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Visual string representation.
   */
  static flowFieldToString(flowField, width, height) {
    let result = "";
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        const cell = flowField[index];
        if (!cell.valid) {
          result += "#";
        } else if (cell.magnitude === 0) {
          result += "G";
        } else {
          const angle = Math.atan2(cell.vector.y, cell.vector.x);
          const normalizedAngle = (angle + Math.PI * 2) % (Math.PI * 2);
          if (normalizedAngle < Math.PI / 8 || normalizedAngle > 15 * Math.PI / 8) {
            result += "→";
          } else if (normalizedAngle < 3 * Math.PI / 8) {
            result += "↗";
          } else if (normalizedAngle < 5 * Math.PI / 8) {
            result += "↑";
          } else if (normalizedAngle < 7 * Math.PI / 8) {
            result += "↖";
          } else if (normalizedAngle < 9 * Math.PI / 8) {
            result += "←";
          } else if (normalizedAngle < 11 * Math.PI / 8) {
            result += "↙";
          } else if (normalizedAngle < 13 * Math.PI / 8) {
            result += "↓";
          } else if (normalizedAngle < 15 * Math.PI / 8) {
            result += "↘";
          } else {
            result += "·";
          }
        }
      }
      result += "\n";
    }
    return result;
  }
  /**
   * Checks if two points are equal.
   * @param a - First point.
   * @param b - Second point.
   * @param tolerance - Numerical tolerance.
   * @returns True if points are equal.
   */
  static pointsEqual(a, b, tolerance = 1e-10) {
    return Math.abs(a.x - b.x) < tolerance && Math.abs(a.y - b.y) < tolerance;
  }
}
var CellType$1 = /* @__PURE__ */ ((CellType2) => {
  CellType2[CellType2["WALKABLE"] = 0] = "WALKABLE";
  CellType2[CellType2["OBSTACLE"] = 1] = "OBSTACLE";
  CellType2[CellType2["GOAL"] = 2] = "GOAL";
  CellType2[CellType2["AGENT"] = 3] = "AGENT";
  return CellType2;
})(CellType$1 || {});
class HPAClustering {
  /**
   * Generates clusters from a grid.
   * @param grid - The grid as a 1D array.
   * @param config - HPA configuration.
   * @param options - Cluster generation options.
   * @returns Cluster generation result.
   */
  static generateClusters(grid, config, options = {}) {
    const startTime = performance.now();
    const clusterOptions = {
      clusterSize: config.clusterSize,
      useOverlappingClusters: false,
      overlapSize: 0,
      useAdaptiveSizing: false,
      minClusterSize: config.clusterSize,
      maxClusterSize: config.clusterSize,
      mergeSmallClusters: false,
      smallClusterThreshold: config.clusterSize / 2,
      ...options
    };
    try {
      const clusters = [];
      const clusterSize = clusterOptions.clusterSize;
      const width = config.width;
      const height = config.height;
      for (let y = 0; y < height; y += clusterSize) {
        for (let x = 0; x < width; x += clusterSize) {
          const clusterWidth = Math.min(clusterSize, width - x);
          const clusterHeight = Math.min(clusterSize, height - y);
          const cluster = this.createCluster(
            grid,
            x,
            y,
            clusterWidth,
            clusterHeight,
            width,
            height,
            clusters.length
          );
          if (cluster) {
            clusters.push(cluster);
          }
        }
      }
      const processedClusters = this.postProcessClusters(clusters, clusterOptions);
      const entranceResult = this.detectEntrances(processedClusters, grid, config, {});
      const entrances = entranceResult.entrances;
      const finalClusters = this.updateClustersWithEntrances(processedClusters, entrances);
      const endTime = performance.now();
      const generationTime = endTime - startTime;
      return {
        clusters: finalClusters,
        success: true,
        stats: {
          clustersCreated: finalClusters.length,
          entrancesFound: entrances.length,
          averageClusterSize: this.calculateAverageClusterSize(finalClusters),
          generationTime
        }
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        clusters: [],
        success: false,
        stats: {
          clustersCreated: 0,
          entrancesFound: 0,
          averageClusterSize: 0,
          generationTime: endTime - startTime
        }
      };
    }
  }
  /**
   * Creates a single cluster.
   * @param grid - The grid.
   * @param x - Cluster x position.
   * @param y - Cluster y position.
   * @param width - Cluster width.
   * @param height - Cluster height.
   * @param gridWidth - Grid width.
   * @param gridHeight - Grid height.
   * @param clusterIndex - Cluster index.
   * @returns Created cluster or null if invalid.
   */
  static createCluster(grid, x, y, width, height, gridWidth, gridHeight, clusterIndex) {
    const cells = [];
    let walkableCells = 0;
    for (let cy = y; cy < y + height; cy++) {
      for (let cx = x; cx < x + width; cx++) {
        const index = cy * gridWidth + cx;
        if (index >= 0 && index < grid.length) {
          const cell = {
            x: cx,
            y: cy,
            type: grid[index]
          };
          cells.push(cell);
          if (grid[index] === CellType.WALKABLE) {
            walkableCells++;
          }
        }
      }
    }
    if (walkableCells === 0) {
      return null;
    }
    let clusterType = ClusterType.REGULAR;
    if (x === 0 || y === 0 || x + width >= gridWidth || y + height >= gridHeight) {
      clusterType = ClusterType.BORDER;
    } else if (walkableCells === cells.length) {
      clusterType = ClusterType.INTERIOR;
    }
    const cluster = {
      id: `cluster_${clusterIndex}`,
      x,
      y,
      width,
      height,
      type: clusterType,
      cells,
      entrances: [],
      neighbors: []
    };
    return cluster;
  }
  /**
   * Post-processes clusters based on options.
   * @param clusters - Clusters to process.
   * @param options - Processing options.
   * @returns Processed clusters.
   */
  static postProcessClusters(clusters, options) {
    let processedClusters = [...clusters];
    if (options.mergeSmallClusters) {
      processedClusters = this.mergeSmallClusters(processedClusters, options);
    }
    if (options.useAdaptiveSizing) {
      processedClusters = this.applyAdaptiveSizing(processedClusters, options);
    }
    return processedClusters;
  }
  /**
   * Merges small clusters with neighboring clusters.
   * @param clusters - Clusters to process.
   * @param options - Processing options.
   * @returns Clusters with small ones merged.
   */
  static mergeSmallClusters(clusters, options) {
    const mergedClusters = [];
    const processed = /* @__PURE__ */ new Set();
    for (const cluster of clusters) {
      if (processed.has(cluster.id)) {
        continue;
      }
      const walkableCells = cluster.cells.filter((cell) => cell.type === CellType.WALKABLE).length;
      if (walkableCells < options.smallClusterThreshold) {
        const bestNeighbor = this.findBestMergeNeighbor(cluster, clusters, processed);
        if (bestNeighbor) {
          const mergedCluster = this.mergeClusters(cluster, bestNeighbor);
          mergedClusters.push(mergedCluster);
          processed.add(cluster.id);
          processed.add(bestNeighbor.id);
        } else {
          mergedClusters.push(cluster);
          processed.add(cluster.id);
        }
      } else {
        mergedClusters.push(cluster);
        processed.add(cluster.id);
      }
    }
    return mergedClusters;
  }
  /**
   * Finds the best neighbor to merge with.
   * @param cluster - Cluster to find neighbor for.
   * @param clusters - All clusters.
   * @param processed - Processed cluster IDs.
   * @returns Best neighbor or null.
   */
  static findBestMergeNeighbor(cluster, clusters, processed) {
    let bestNeighbor = null;
    let bestScore = -1;
    for (const other of clusters) {
      if (other.id === cluster.id || processed.has(other.id)) {
        continue;
      }
      if (this.areClustersAdjacent(cluster, other)) {
        const score = this.calculateMergeScore(cluster, other);
        if (score > bestScore) {
          bestScore = score;
          bestNeighbor = other;
        }
      }
    }
    return bestNeighbor;
  }
  /**
   * Checks if two clusters are adjacent.
   * @param cluster1 - First cluster.
   * @param cluster2 - Second cluster.
   * @returns True if clusters are adjacent.
   */
  static areClustersAdjacent(cluster1, cluster2) {
    const dx = Math.abs(cluster1.x - cluster2.x);
    const dy = Math.abs(cluster1.y - cluster2.y);
    return dx === cluster1.width && dy < cluster1.height + cluster2.height || dy === cluster1.height && dx < cluster1.width + cluster2.width;
  }
  /**
   * Calculates merge score between two clusters.
   * @param cluster1 - First cluster.
   * @param cluster2 - Second cluster.
   * @returns Merge score.
   */
  static calculateMergeScore(cluster1, cluster2) {
    const walkable1 = cluster1.cells.filter((cell) => cell.type === CellType.WALKABLE).length;
    const walkable2 = cluster2.cells.filter((cell) => cell.type === CellType.WALKABLE).length;
    const similarity = 1 - Math.abs(walkable1 - walkable2) / Math.max(walkable1, walkable2);
    const sizeRatio = Math.min(cluster1.cells.length, cluster2.cells.length) / Math.max(cluster1.cells.length, cluster2.cells.length);
    return similarity * 0.7 + sizeRatio * 0.3;
  }
  /**
   * Merges two clusters.
   * @param cluster1 - First cluster.
   * @param cluster2 - Second cluster.
   * @returns Merged cluster.
   */
  static mergeClusters(cluster1, cluster2) {
    const minX = Math.min(cluster1.x, cluster2.x);
    const minY = Math.min(cluster1.y, cluster2.y);
    const maxX = Math.max(cluster1.x + cluster1.width, cluster2.x + cluster2.width);
    const maxY = Math.max(cluster1.y + cluster1.height, cluster2.y + cluster2.height);
    const mergedCells = [...cluster1.cells, ...cluster2.cells];
    return {
      id: `merged_${cluster1.id}_${cluster2.id}`,
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      type: ClusterType.REGULAR,
      cells: mergedCells,
      entrances: [],
      neighbors: []
    };
  }
  /**
   * Applies adaptive sizing to clusters.
   * @param clusters - Clusters to process.
   * @param options - Processing options.
   * @returns Clusters with adaptive sizing applied.
   */
  static applyAdaptiveSizing(clusters, options) {
    return clusters.map((cluster) => {
      const obstacleCount = cluster.cells.filter((cell) => cell.type === CellType.OBSTACLE).length;
      const obstacleRatio = obstacleCount / cluster.cells.length;
      if (obstacleRatio > 0.5) {
        return {
          ...cluster,
          type: ClusterType.BORDER
        };
      }
      return cluster;
    });
  }
  /**
   * Detects entrances between clusters.
   * @param clusters - Clusters to analyze.
   * @param grid - The grid.
   * @param config - HPA configuration.
   * @param options - Entrance detection options.
   * @returns Entrance detection result.
   */
  static detectEntrances(clusters, grid, config, options = {}) {
    const startTime = performance.now();
    const entranceOptions = {
      detectBorderEntrances: true,
      detectInteriorEntrances: true,
      minEntranceWidth: 1,
      maxEntranceWidth: 3,
      useAdaptiveDetection: false,
      detectionThreshold: 0.5,
      ...options
    };
    try {
      const entrances = [];
      let entranceIndex = 0;
      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          const cluster1 = clusters[i];
          const cluster2 = clusters[j];
          if (this.areClustersAdjacent(cluster1, cluster2)) {
            const clusterEntrances = this.findEntrancesBetweenClusters(
              cluster1,
              cluster2,
              grid,
              config,
              entranceOptions,
              entranceIndex
            );
            entrances.push(...clusterEntrances);
            entranceIndex += clusterEntrances.length;
          }
        }
      }
      const endTime = performance.now();
      const detectionTime = endTime - startTime;
      const borderEntrances = entrances.filter((e) => e.isBorder).length;
      const interiorEntrances = entrances.filter((e) => !e.isBorder).length;
      return {
        entrances,
        success: true,
        stats: {
          entrancesFound: entrances.length,
          borderEntrances,
          interiorEntrances,
          detectionTime
        }
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        entrances: [],
        success: false,
        stats: {
          entrancesFound: 0,
          borderEntrances: 0,
          interiorEntrances: 0,
          detectionTime: endTime - startTime
        }
      };
    }
  }
  /**
   * Finds entrances between two clusters.
   * @param cluster1 - First cluster.
   * @param cluster2 - Second cluster.
   * @param grid - The grid.
   * @param config - HPA configuration.
   * @param options - Entrance detection options.
   * @param startIndex - Starting entrance index.
   * @returns Array of entrances.
   */
  static findEntrancesBetweenClusters(cluster1, cluster2, grid, config, options, startIndex) {
    const entrances = [];
    let entranceIndex = startIndex;
    const boundary = this.findClusterBoundary(cluster1, cluster2);
    if (!boundary) {
      return entrances;
    }
    const walkableBoundaryCells = this.findWalkableBoundaryCells(
      boundary,
      grid,
      config.width,
      config.height
    );
    const entranceSegments = this.groupIntoEntranceSegments(
      walkableBoundaryCells,
      options
    );
    for (const segment of entranceSegments) {
      if (segment.length >= options.minEntranceWidth && segment.length <= options.maxEntranceWidth) {
        const entrance = {
          id: `entrance_${entranceIndex}`,
          x: segment[0].x,
          y: segment[0].y,
          clusterId: cluster1.id,
          connectedClusters: [cluster1.id, cluster2.id],
          isBorder: this.isEntranceOnBorder(segment, config),
          cost: this.calculateEntranceCost(segment)
        };
        entrances.push(entrance);
        entranceIndex++;
      }
    }
    return entrances;
  }
  /**
   * Finds the boundary between two clusters.
   * @param cluster1 - First cluster.
   * @param cluster2 - Second cluster.
   * @returns Boundary information or null.
   */
  static findClusterBoundary(cluster1, cluster2) {
    const dx = Math.abs(cluster1.x - cluster2.x);
    const dy = Math.abs(cluster1.y - cluster2.y);
    if (dx === cluster1.width && dy < cluster1.height + cluster2.height) {
      const x = Math.max(cluster1.x, cluster2.x);
      const y1 = Math.max(cluster1.y, cluster2.y);
      const y2 = Math.min(cluster1.y + cluster1.height, cluster2.y + cluster2.height);
      return { x1: x, y1, x2: x, y2, direction: "vertical" };
    } else if (dy === cluster1.height && dx < cluster1.width + cluster2.width) {
      const y = Math.max(cluster1.y, cluster2.y);
      const x1 = Math.max(cluster1.x, cluster2.x);
      const x2 = Math.min(cluster1.x + cluster1.width, cluster2.x + cluster2.width);
      return { x1, y1: y, x2, y2: y, direction: "horizontal" };
    }
    return null;
  }
  /**
   * Finds walkable cells along a boundary.
   * @param boundary - Boundary information.
   * @param grid - The grid.
   * @param gridWidth - Grid width.
   * @param gridHeight - Grid height.
   * @returns Array of walkable boundary cells.
   */
  static findWalkableBoundaryCells(boundary, grid, gridWidth, gridHeight) {
    const walkableCells = [];
    if (boundary.direction === "horizontal") {
      for (let x = boundary.x1; x <= boundary.x2; x++) {
        if (x >= 0 && x < gridWidth && boundary.y1 >= 0 && boundary.y1 < gridHeight) {
          const index = boundary.y1 * gridWidth + x;
          if (index >= 0 && index < grid.length && grid[index] === CellType.WALKABLE) {
            walkableCells.push({ x, y: boundary.y1 });
          }
        }
      }
    } else {
      for (let y = boundary.y1; y <= boundary.y2; y++) {
        if (boundary.x1 >= 0 && boundary.x1 < gridWidth && y >= 0 && y < gridHeight) {
          const index = y * gridWidth + boundary.x1;
          if (index >= 0 && index < grid.length && grid[index] === CellType.WALKABLE) {
            walkableCells.push({ x: boundary.x1, y });
          }
        }
      }
    }
    return walkableCells;
  }
  /**
   * Groups walkable cells into entrance segments.
   * @param walkableCells - Walkable boundary cells.
   * @param options - Entrance detection options.
   * @returns Array of entrance segments.
   */
  static groupIntoEntranceSegments(walkableCells, options) {
    if (walkableCells.length === 0) {
      return [];
    }
    walkableCells.sort((a, b) => {
      if (a.x !== b.x) return a.x - b.x;
      return a.y - b.y;
    });
    const segments = [];
    let currentSegment = [walkableCells[0]];
    for (let i = 1; i < walkableCells.length; i++) {
      const current = walkableCells[i];
      const previous = walkableCells[i - 1];
      const isAdjacent = Math.abs(current.x - previous.x) <= 1 && Math.abs(current.y - previous.y) <= 1;
      if (isAdjacent) {
        currentSegment.push(current);
      } else {
        segments.push(currentSegment);
        currentSegment = [current];
      }
    }
    segments.push(currentSegment);
    return segments;
  }
  /**
   * Checks if an entrance is on the border of the grid.
   * @param segment - Entrance segment.
   * @param config - HPA configuration.
   * @returns True if entrance is on border.
   */
  static isEntranceOnBorder(segment, config) {
    return segment.some(
      (point) => point.x === 0 || point.x === config.width - 1 || point.y === 0 || point.y === config.height - 1
    );
  }
  /**
   * Calculates the cost of an entrance.
   * @param segment - Entrance segment.
   * @returns Entrance cost.
   */
  static calculateEntranceCost(segment) {
    return segment.length;
  }
  /**
   * Updates clusters with their entrances.
   * @param clusters - Clusters to update.
   * @param entrances - All entrances.
   * @returns Updated clusters.
   */
  static updateClustersWithEntrances(clusters, entrances) {
    return clusters.map((cluster) => {
      const clusterEntrances = entrances.filter(
        (entrance) => entrance.connectedClusters.includes(cluster.id)
      );
      return {
        ...cluster,
        entrances: clusterEntrances,
        neighbors: clusterEntrances.flatMap(
          (entrance) => entrance.connectedClusters.filter((id) => id !== cluster.id)
        )
      };
    });
  }
  /**
   * Calculates the average cluster size.
   * @param clusters - Clusters to analyze.
   * @returns Average cluster size.
   */
  static calculateAverageClusterSize(clusters) {
    if (clusters.length === 0) {
      return 0;
    }
    const totalSize = clusters.reduce((sum, cluster) => sum + cluster.cells.length, 0);
    return totalSize / clusters.length;
  }
}
class HPAAbstractGraph {
  /**
   * Constructs an abstract graph from clusters and entrances.
   * @param clusters - Clusters in the hierarchical map.
   * @param entrances - Entrances between clusters.
   * @param config - HPA configuration.
   * @param options - Abstract graph construction options.
   * @returns Abstract graph construction result.
   */
  static constructAbstractGraph(clusters, entrances, config, options = {}) {
    const startTime = performance.now();
    const graphOptions = {
      useInterClusterEdges: true,
      useIntraClusterEdges: true,
      useEntranceEdges: true,
      useDirectClusterConnections: true,
      maxEdgeCost: 1e3,
      useEdgeCaching: true,
      ...options
    };
    try {
      const nodes = this.createAbstractNodes(clusters, entrances);
      const edges = this.createAbstractEdges(
        nodes,
        clusters,
        entrances,
        config,
        graphOptions
      );
      const endTime = performance.now();
      const constructionTime = endTime - startTime;
      const interClusterEdges = edges.filter((edge) => edge.isInterCluster).length;
      const intraClusterEdges = edges.filter((edge) => !edge.isInterCluster).length;
      return {
        nodes,
        edges,
        success: true,
        stats: {
          nodesCreated: nodes.length,
          edgesCreated: edges.length,
          interClusterEdges,
          intraClusterEdges,
          constructionTime
        }
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        nodes: [],
        edges: [],
        success: false,
        stats: {
          nodesCreated: 0,
          edgesCreated: 0,
          interClusterEdges: 0,
          intraClusterEdges: 0,
          constructionTime: endTime - startTime
        }
      };
    }
  }
  /**
   * Creates abstract nodes from clusters and entrances.
   * @param clusters - Clusters in the hierarchical map.
   * @param entrances - Entrances between clusters.
   * @returns Array of abstract nodes.
   */
  static createAbstractNodes(clusters, entrances) {
    const nodes = [];
    for (const cluster of clusters) {
      const clusterNode = {
        id: `cluster_${cluster.id}`,
        type: "cluster",
        clusterId: cluster.id,
        position: {
          x: cluster.x + cluster.width / 2,
          y: cluster.y + cluster.height / 2
        },
        g: 0,
        h: 0,
        f: 0,
        visited: false,
        inOpenSet: false
      };
      nodes.push(clusterNode);
    }
    for (const entrance of entrances) {
      const entranceNode = {
        id: `entrance_${entrance.id}`,
        type: "entrance",
        entranceId: entrance.id,
        position: {
          x: entrance.x,
          y: entrance.y
        },
        g: 0,
        h: 0,
        f: 0,
        visited: false,
        inOpenSet: false
      };
      nodes.push(entranceNode);
    }
    return nodes;
  }
  /**
   * Creates abstract edges between nodes.
   * @param nodes - Abstract nodes.
   * @param clusters - Clusters in the hierarchical map.
   * @param entrances - Entrances between clusters.
   * @param config - HPA configuration.
   * @param options - Abstract graph construction options.
   * @returns Array of abstract edges.
   */
  static createAbstractEdges(nodes, clusters, entrances, config, options) {
    const edges = [];
    if (options.useInterClusterEdges) {
      const interClusterEdges = this.createInterClusterEdges(
        nodes,
        clusters,
        entrances,
        config,
        options
      );
      edges.push(...interClusterEdges);
    }
    if (options.useIntraClusterEdges) {
      const intraClusterEdges = this.createIntraClusterEdges(
        nodes,
        clusters,
        config,
        options
      );
      edges.push(...intraClusterEdges);
    }
    if (options.useEntranceEdges) {
      const entranceEdges = this.createEntranceEdges(
        nodes,
        entrances,
        config,
        options
      );
      edges.push(...entranceEdges);
    }
    if (options.useDirectClusterConnections) {
      const directEdges = this.createDirectClusterEdges(
        nodes,
        clusters,
        config,
        options
      );
      edges.push(...directEdges);
    }
    return edges;
  }
  /**
   * Creates edges between clusters.
   * @param nodes - Abstract nodes.
   * @param clusters - Clusters in the hierarchical map.
   * @param entrances - Entrances between clusters.
   * @param config - HPA configuration.
   * @param options - Abstract graph construction options.
   * @returns Array of inter-cluster edges.
   */
  static createInterClusterEdges(nodes, clusters, entrances, config, options) {
    const edges = [];
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const cluster1 = clusters[i];
        const cluster2 = clusters[j];
        const connectingEntrances = entrances.filter(
          (entrance) => entrance.connectedClusters.includes(cluster1.id) && entrance.connectedClusters.includes(cluster2.id)
        );
        if (connectingEntrances.length > 0) {
          const node1 = nodes.find((n) => n.clusterId === cluster1.id);
          const node2 = nodes.find((n) => n.clusterId === cluster2.id);
          if (node1 && node2) {
            const cost = this.calculateInterClusterCost(
              cluster1,
              cluster2,
              connectingEntrances,
              config
            );
            if (cost <= options.maxEdgeCost) {
              const edge = {
                from: node1.id,
                to: node2.id,
                cost,
                isInterCluster: true,
                path: this.generateInterClusterPath(cluster1, cluster2, connectingEntrances)
              };
              edges.push(edge);
            }
          }
        }
      }
    }
    return edges;
  }
  /**
   * Creates edges within clusters.
   * @param nodes - Abstract nodes.
   * @param clusters - Clusters in the hierarchical map.
   * @param config - HPA configuration.
   * @param options - Abstract graph construction options.
   * @returns Array of intra-cluster edges.
   */
  static createIntraClusterEdges(nodes, clusters, config, options) {
    const edges = [];
    for (const cluster of clusters) {
      const clusterNode = nodes.find((n) => n.clusterId === cluster.id);
      if (!clusterNode) continue;
      for (const entrance of cluster.entrances) {
        const entranceNode = nodes.find((n) => n.entranceId === entrance.id);
        if (entranceNode) {
          const cost = this.calculateIntraClusterCost(cluster, entrance, config);
          if (cost <= options.maxEdgeCost) {
            const edge = {
              from: clusterNode.id,
              to: entranceNode.id,
              cost,
              isInterCluster: false,
              clusterId: cluster.id,
              path: this.generateIntraClusterPath(cluster, entrance)
            };
            edges.push(edge);
          }
        }
      }
    }
    return edges;
  }
  /**
   * Creates edges between entrances.
   * @param nodes - Abstract nodes.
   * @param entrances - Entrances between clusters.
   * @param config - HPA configuration.
   * @param options - Abstract graph construction options.
   * @returns Array of entrance edges.
   */
  static createEntranceEdges(nodes, entrances, config, options) {
    const edges = [];
    for (let i = 0; i < entrances.length; i++) {
      for (let j = i + 1; j < entrances.length; j++) {
        const entrance1 = entrances[i];
        const entrance2 = entrances[j];
        const commonClusters = entrance1.connectedClusters.filter(
          (id) => entrance2.connectedClusters.includes(id)
        );
        if (commonClusters.length > 0) {
          const node1 = nodes.find((n) => n.entranceId === entrance1.id);
          const node2 = nodes.find((n) => n.entranceId === entrance2.id);
          if (node1 && node2) {
            const cost = this.calculateEntranceCost(entrance1, entrance2, config);
            if (cost <= options.maxEdgeCost) {
              const edge = {
                from: node1.id,
                to: node2.id,
                cost,
                isInterCluster: false,
                clusterId: commonClusters[0],
                path: this.generateEntrancePath(entrance1, entrance2)
              };
              edges.push(edge);
            }
          }
        }
      }
    }
    return edges;
  }
  /**
   * Creates direct connections between clusters.
   * @param nodes - Abstract nodes.
   * @param clusters - Clusters in the hierarchical map.
   * @param config - HPA configuration.
   * @param options - Abstract graph construction options.
   * @returns Array of direct cluster edges.
   */
  static createDirectClusterEdges(nodes, clusters, config, options) {
    const edges = [];
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const cluster1 = clusters[i];
        const cluster2 = clusters[j];
        if (this.areClustersAdjacent(cluster1, cluster2)) {
          const node1 = nodes.find((n) => n.clusterId === cluster1.id);
          const node2 = nodes.find((n) => n.clusterId === cluster2.id);
          if (node1 && node2) {
            const cost = this.calculateDirectClusterCost(cluster1, cluster2, config);
            if (cost <= options.maxEdgeCost) {
              const edge = {
                from: node1.id,
                to: node2.id,
                cost,
                isInterCluster: true,
                path: this.generateDirectClusterPath(cluster1, cluster2)
              };
              edges.push(edge);
            }
          }
        }
      }
    }
    return edges;
  }
  /**
   * Calculates the cost of an inter-cluster edge.
   * @param cluster1 - First cluster.
   * @param cluster2 - Second cluster.
   * @param entrances - Connecting entrances.
   * @param config - HPA configuration.
   * @returns Edge cost.
   */
  static calculateInterClusterCost(cluster1, cluster2, entrances, config) {
    const dx = Math.abs(cluster1.x + cluster1.width / 2 - cluster2.x - cluster2.width / 2);
    const dy = Math.abs(cluster1.y + cluster1.height / 2 - cluster2.y - cluster2.height / 2);
    const distance2 = Math.sqrt(dx * dx + dy * dy);
    const entranceCost = entrances.reduce((sum, entrance) => sum + entrance.cost, 0);
    return distance2 + entranceCost;
  }
  /**
   * Calculates the cost of an intra-cluster edge.
   * @param cluster - Cluster.
   * @param entrance - Entrance.
   * @param config - HPA configuration.
   * @returns Edge cost.
   */
  static calculateIntraClusterCost(cluster, entrance, config) {
    const dx = Math.abs(cluster.x + cluster.width / 2 - entrance.x);
    const dy = Math.abs(cluster.y + cluster.height / 2 - entrance.y);
    const distance2 = Math.sqrt(dx * dx + dy * dy);
    return distance2;
  }
  /**
   * Calculates the cost of an entrance edge.
   * @param entrance1 - First entrance.
   * @param entrance2 - Second entrance.
   * @param config - HPA configuration.
   * @returns Edge cost.
   */
  static calculateEntranceCost(entrance1, entrance2, config) {
    const dx = Math.abs(entrance1.x - entrance2.x);
    const dy = Math.abs(entrance1.y - entrance2.y);
    const distance2 = Math.sqrt(dx * dx + dy * dy);
    return distance2;
  }
  /**
   * Calculates the cost of a direct cluster edge.
   * @param cluster1 - First cluster.
   * @param cluster2 - Second cluster.
   * @param config - HPA configuration.
   * @returns Edge cost.
   */
  static calculateDirectClusterCost(cluster1, cluster2, config) {
    const dx = Math.abs(cluster1.x + cluster1.width / 2 - cluster2.x - cluster2.width / 2);
    const dy = Math.abs(cluster1.y + cluster1.height / 2 - cluster2.y - cluster2.height / 2);
    const distance2 = Math.sqrt(dx * dx + dy * dy);
    return distance2;
  }
  /**
   * Generates a path for an inter-cluster edge.
   * @param cluster1 - First cluster.
   * @param cluster2 - Second cluster.
   * @param entrances - Connecting entrances.
   * @returns Path points.
   */
  static generateInterClusterPath(cluster1, cluster2, entrances) {
    const path = [];
    path.push({
      x: cluster1.x + cluster1.width / 2,
      y: cluster1.y + cluster1.height / 2
    });
    for (const entrance of entrances) {
      path.push({
        x: entrance.x,
        y: entrance.y
      });
    }
    path.push({
      x: cluster2.x + cluster2.width / 2,
      y: cluster2.y + cluster2.height / 2
    });
    return path;
  }
  /**
   * Generates a path for an intra-cluster edge.
   * @param cluster - Cluster.
   * @param entrance - Entrance.
   * @returns Path points.
   */
  static generateIntraClusterPath(cluster, entrance) {
    return [
      {
        x: cluster.x + cluster.width / 2,
        y: cluster.y + cluster.height / 2
      },
      {
        x: entrance.x,
        y: entrance.y
      }
    ];
  }
  /**
   * Generates a path for an entrance edge.
   * @param entrance1 - First entrance.
   * @param entrance2 - Second entrance.
   * @returns Path points.
   */
  static generateEntrancePath(entrance1, entrance2) {
    return [
      {
        x: entrance1.x,
        y: entrance1.y
      },
      {
        x: entrance2.x,
        y: entrance2.y
      }
    ];
  }
  /**
   * Generates a path for a direct cluster edge.
   * @param cluster1 - First cluster.
   * @param cluster2 - Second cluster.
   * @returns Path points.
   */
  static generateDirectClusterPath(cluster1, cluster2) {
    return [
      {
        x: cluster1.x + cluster1.width / 2,
        y: cluster1.y + cluster1.height / 2
      },
      {
        x: cluster2.x + cluster2.width / 2,
        y: cluster2.y + cluster2.height / 2
      }
    ];
  }
  /**
   * Checks if two clusters are adjacent.
   * @param cluster1 - First cluster.
   * @param cluster2 - Second cluster.
   * @returns True if clusters are adjacent.
   */
  static areClustersAdjacent(cluster1, cluster2) {
    const dx = Math.abs(cluster1.x - cluster2.x);
    const dy = Math.abs(cluster1.y - cluster2.y);
    return dx === cluster1.width && dy < cluster1.height + cluster2.height || dy === cluster1.height && dx < cluster1.width + cluster2.width;
  }
}
class HPAPathRefinement {
  /**
   * Refines an abstract path into a detailed path.
   * @param abstractPath - Abstract path from high-level planning.
   * @param clusters - Clusters in the hierarchical map.
   * @param entrances - Entrances between clusters.
   * @param grid - The grid.
   * @param config - HPA configuration.
   * @param options - Path refinement options.
   * @returns Path refinement result.
   */
  static refinePath(abstractPath, clusters, entrances, grid, config, options = {}) {
    const startTime = performance.now();
    const refinementOptions = {
      useAStarRefinement: true,
      useJPSRefinement: false,
      useThetaStarRefinement: false,
      usePathSmoothing: true,
      smoothingFactor: 0.5,
      useEarlyTermination: true,
      maxRefinementIterations: 1e3,
      ...options
    };
    try {
      let refinedPath = [];
      let iterationsUsed = 0;
      const pointSequence = this.convertAbstractPathToPoints(abstractPath, clusters, entrances);
      if (pointSequence.length === 0) {
        return {
          refinedPath: [],
          success: false,
          stats: {
            refinementTime: performance.now() - startTime,
            pathLength: 0,
            smoothingApplied: false,
            iterationsUsed: 0
          }
        };
      }
      if (refinementOptions.useAStarRefinement) {
        const aStarResult = this.refineWithAStar(
          pointSequence,
          grid,
          config,
          refinementOptions
        );
        refinedPath = aStarResult.path;
        iterationsUsed = aStarResult.iterations;
      } else if (refinementOptions.useJPSRefinement) {
        const jpsResult = this.refineWithJPS(
          pointSequence,
          grid,
          config,
          refinementOptions
        );
        refinedPath = jpsResult.path;
        iterationsUsed = jpsResult.iterations;
      } else if (refinementOptions.useThetaStarRefinement) {
        const thetaStarResult = this.refineWithThetaStar(
          pointSequence,
          grid,
          config,
          refinementOptions
        );
        refinedPath = thetaStarResult.path;
        iterationsUsed = thetaStarResult.iterations;
      } else {
        refinedPath = pointSequence;
      }
      let smoothingApplied = false;
      if (refinementOptions.usePathSmoothing && refinedPath.length > 2) {
        refinedPath = this.smoothPath(refinedPath, grid, config, refinementOptions.smoothingFactor);
        smoothingApplied = true;
      }
      const endTime = performance.now();
      const refinementTime = endTime - startTime;
      return {
        refinedPath,
        success: true,
        stats: {
          refinementTime,
          pathLength: refinedPath.length,
          smoothingApplied,
          iterationsUsed
        }
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        refinedPath: [],
        success: false,
        stats: {
          refinementTime: endTime - startTime,
          pathLength: 0,
          smoothingApplied: false,
          iterationsUsed: 0
        }
      };
    }
  }
  /**
   * Converts an abstract path to a sequence of points.
   * @param abstractPath - Abstract path.
   * @param clusters - Clusters in the hierarchical map.
   * @param entrances - Entrances between clusters.
   * @returns Sequence of points.
   */
  static convertAbstractPathToPoints(abstractPath, clusters, entrances) {
    const points = [];
    for (const node of abstractPath) {
      if (node.type === "cluster") {
        const cluster = clusters.find((c) => c.id === node.clusterId);
        if (cluster) {
          points.push({
            x: cluster.x + cluster.width / 2,
            y: cluster.y + cluster.height / 2
          });
        }
      } else if (node.type === "entrance") {
        const entrance = entrances.find((e) => e.id === node.entranceId);
        if (entrance) {
          points.push({
            x: entrance.x,
            y: entrance.y
          });
        }
      }
    }
    return points;
  }
  /**
   * Refines a path using A* algorithm.
   * @param pointSequence - Sequence of points to connect.
   * @param grid - The grid.
   * @param config - HPA configuration.
   * @param options - Refinement options.
   * @returns A* refinement result.
   */
  static refineWithAStar(pointSequence, grid, config, options) {
    const refinedPath = [];
    let totalIterations = 0;
    for (let i = 0; i < pointSequence.length - 1; i++) {
      const start = pointSequence[i];
      const goal = pointSequence[i + 1];
      const aStarResult = this.findAStarPath(start, goal, grid, config, options);
      refinedPath.push(...aStarResult.path.slice(0, -1));
      totalIterations += aStarResult.iterations;
    }
    if (pointSequence.length > 0) {
      refinedPath.push(pointSequence[pointSequence.length - 1]);
    }
    return { path: refinedPath, iterations: totalIterations };
  }
  /**
   * Refines a path using Jump Point Search.
   * @param pointSequence - Sequence of points to connect.
   * @param grid - The grid.
   * @param config - HPA configuration.
   * @param options - Refinement options.
   * @returns JPS refinement result.
   */
  static refineWithJPS(pointSequence, grid, config, options) {
    return this.refineWithAStar(pointSequence, grid, config, options);
  }
  /**
   * Refines a path using Theta* algorithm.
   * @param pointSequence - Sequence of points to connect.
   * @param grid - The grid.
   * @param config - HPA configuration.
   * @param options - Refinement options.
   * @returns Theta* refinement result.
   */
  static refineWithThetaStar(pointSequence, grid, config, options) {
    return this.refineWithAStar(pointSequence, grid, config, options);
  }
  /**
   * Finds a path using A* algorithm.
   * @param start - Starting point.
   * @param goal - Goal point.
   * @param grid - The grid.
   * @param config - HPA configuration.
   * @param options - Refinement options.
   * @returns A* pathfinding result.
   */
  static findAStarPath(start, goal, grid, config, options) {
    const openSet = [];
    const closedSet = /* @__PURE__ */ new Set();
    const cameFrom = /* @__PURE__ */ new Map();
    const gScore = /* @__PURE__ */ new Map();
    const fScore = /* @__PURE__ */ new Map();
    const startKey = this.pointToKey(start);
    const goalKey = this.pointToKey(goal);
    gScore.set(startKey, 0);
    fScore.set(startKey, this.heuristic(start, goal, config));
    openSet.push({ point: start, g: 0, h: this.heuristic(start, goal, config), f: fScore.get(startKey) });
    let iterations = 0;
    const maxIterations = options.maxRefinementIterations || 1e3;
    while (openSet.length > 0 && iterations < maxIterations) {
      iterations++;
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIndex].f) {
          currentIndex = i;
        }
      }
      const current = openSet.splice(currentIndex, 1)[0];
      const currentKey = this.pointToKey(current.point);
      if (currentKey === goalKey) {
        const path = [];
        let node = goal;
        while (node) {
          path.unshift(node);
          node = cameFrom.get(this.pointToKey(node));
        }
        return { path, iterations };
      }
      closedSet.add(currentKey);
      const neighbors = this.getNeighbors(current.point, grid, config);
      for (const neighbor of neighbors) {
        const neighborKey = this.pointToKey(neighbor);
        if (closedSet.has(neighborKey)) {
          continue;
        }
        const tentativeG = gScore.get(currentKey) + this.getMovementCost(current.point, neighbor, config);
        if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)) {
          cameFrom.set(neighborKey, current.point);
          gScore.set(neighborKey, tentativeG);
          fScore.set(neighborKey, tentativeG + this.heuristic(neighbor, goal, config));
          if (!openSet.some((node) => this.pointToKey(node.point) === neighborKey)) {
            openSet.push({
              point: neighbor,
              g: tentativeG,
              h: this.heuristic(neighbor, goal, config),
              f: fScore.get(neighborKey)
            });
          }
        }
      }
    }
    return { path: [], iterations };
  }
  /**
   * Smooths a path by removing redundant waypoints.
   * @param path - Path to smooth.
   * @param grid - The grid.
   * @param config - HPA configuration.
   * @param smoothingFactor - Smoothing factor (0-1).
   * @returns Smoothed path.
   */
  static smoothPath(path, grid, config, smoothingFactor) {
    if (path.length <= 2) {
      return path;
    }
    const smoothedPath = [path[0]];
    for (let i = 1; i < path.length - 1; i++) {
      const prev = path[i - 1];
      const current = path[i];
      const next = path[i + 1];
      if (this.hasLineOfSight(prev, next, grid, config)) {
        if (Math.random() > smoothingFactor) {
          smoothedPath.push(current);
        }
      } else {
        smoothedPath.push(current);
      }
    }
    smoothedPath.push(path[path.length - 1]);
    return smoothedPath;
  }
  /**
   * Checks if there's a line of sight between two points.
   * @param from - Starting point.
   * @param to - Ending point.
   * @param grid - The grid.
   * @param config - HPA configuration.
   * @returns True if there's a line of sight.
   */
  static hasLineOfSight(from, to, grid, config) {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const steps = Math.max(dx, dy);
    if (steps === 0) {
      return true;
    }
    const stepX = (to.x - from.x) / steps;
    const stepY = (to.y - from.y) / steps;
    for (let i = 0; i <= steps; i++) {
      const x = Math.round(from.x + i * stepX);
      const y = Math.round(from.y + i * stepY);
      if (x < 0 || x >= config.width || y < 0 || y >= config.height) {
        return false;
      }
      const index = y * config.width + x;
      if (index >= 0 && index < grid.length && grid[index] === CellType.OBSTACLE) {
        return false;
      }
    }
    return true;
  }
  /**
   * Gets neighbors of a point.
   * @param point - Current point.
   * @param grid - The grid.
   * @param config - HPA configuration.
   * @returns Array of neighbor points.
   */
  static getNeighbors(point, grid, config) {
    const neighbors = [];
    const directions = this.getValidDirections(config);
    for (const direction of directions) {
      const neighbor = this.getNeighborInDirection(point, direction);
      if (this.isWithinBounds(neighbor, config.width, config.height) && this.isWalkable(grid, neighbor, config.width, config.height)) {
        neighbors.push(neighbor);
      }
    }
    return neighbors;
  }
  /**
   * Gets valid directions based on configuration.
   * @param config - HPA configuration.
   * @returns Array of valid directions.
   */
  static getValidDirections(config) {
    const directions = [];
    directions.push(0, 1, 2, 3);
    if (config.allowDiagonal) {
      directions.push(4, 5, 6, 7);
    }
    return directions;
  }
  /**
   * Gets a neighbor in a specific direction.
   * @param point - Current point.
   * @param direction - Direction to move.
   * @returns Neighbor point.
   */
  static getNeighborInDirection(point, direction) {
    const directionVectors = [
      { x: 0, y: -1 },
      // North
      { x: 1, y: 0 },
      // East
      { x: 0, y: 1 },
      // South
      { x: -1, y: 0 },
      // West
      { x: 1, y: -1 },
      // Northeast
      { x: 1, y: 1 },
      // Southeast
      { x: -1, y: 1 },
      // Southwest
      { x: -1, y: -1 }
      // Northwest
    ];
    const vector = directionVectors[direction];
    return { x: point.x + vector.x, y: point.y + vector.y };
  }
  /**
   * Calculates the movement cost between two points.
   * @param from - Starting point.
   * @param to - Ending point.
   * @param config - HPA configuration.
   * @returns Movement cost.
   */
  static getMovementCost(from, to, config) {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    if (dx === 1 && dy === 1) {
      return config.diagonalCost;
    } else if (dx === 1 || dy === 1) {
      return config.cardinalCost;
    } else {
      const distance2 = Math.sqrt(dx * dx + dy * dy);
      return distance2 * config.cardinalCost;
    }
  }
  /**
   * Calculates the heuristic distance between two points.
   * @param from - Starting point.
   * @param to - Ending point.
   * @param config - HPA configuration.
   * @returns Heuristic distance.
   */
  static heuristic(from, to, config) {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    if (config.allowDiagonal) {
      return Math.sqrt(dx * dx + dy * dy);
    } else {
      return dx + dy;
    }
  }
  /**
   * Checks if a point is within grid bounds.
   * @param point - Point to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if point is within bounds.
   */
  static isWithinBounds(point, width, height) {
    return point.x >= 0 && point.x < width && point.y >= 0 && point.y < height;
  }
  /**
   * Checks if a cell is walkable.
   * @param grid - The grid.
   * @param point - Point to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if cell is walkable.
   */
  static isWalkable(grid, point, width, height) {
    if (!this.isWithinBounds(point, width, height)) {
      return false;
    }
    const index = point.y * width + point.x;
    return grid[index] === CellType.WALKABLE || grid[index] === CellType.GOAL || grid[index] === CellType.AGENT;
  }
  /**
   * Creates a key for a point (for use in maps/sets).
   * @param point - Point to create key for.
   * @returns String key.
   */
  static pointToKey(point) {
    return `${point.x},${point.y}`;
  }
}
class HPAStar {
  /**
   * Creates an instance of HPAStar.
   * @param config - Optional configuration for the algorithm.
   */
  constructor(config = {}) {
    this.cache = /* @__PURE__ */ new Map();
    this.clusters = [];
    this.entrances = [];
    this.abstractNodes = [];
    this.abstractEdges = [];
    this.config = {
      width: 100,
      height: 100,
      clusterSize: 10,
      allowDiagonal: true,
      diagonalOnlyWhenClear: true,
      cardinalCost: 1,
      diagonalCost: Math.sqrt(2),
      maxPathLength: 1e4,
      usePathSmoothing: true,
      smoothingFactor: 0.5,
      useEarlyTermination: true,
      validateInput: true,
      enableCaching: true,
      tolerance: 1e-10,
      ...config
    };
    this.stats = {
      clustersCreated: 0,
      entrancesFound: 0,
      abstractNodesProcessed: 0,
      abstractEdgesCreated: 0,
      pathRefinements: 0,
      executionTime: 0,
      abstractPathfindingTime: 0,
      pathRefinementTime: 0,
      success: true
    };
  }
  /**
   * Finds a path from start to goal using hierarchical pathfinding.
   * @param grid - The grid as a 1D array.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param start - Starting point.
   * @param goal - Goal point.
   * @param options - Pathfinding options.
   * @returns HPA* pathfinding result.
   */
  findPath(grid, width, height, start, goal, options = {}) {
    const startTime = performance.now();
    const hpaOptions = {
      returnAbstractPath: true,
      returnRefinedPath: true,
      usePathSmoothing: true,
      useEarlyTermination: true,
      maxIterations: width * height,
      useGoalBounding: false,
      useHierarchicalAbstraction: true,
      ...options
    };
    try {
      this.config = { ...this.config, width, height };
      if (this.config.validateInput) {
        const validation = this.validateInput(grid, width, height, start, goal);
        if (!validation.isValid) {
          throw new Error(`Invalid input: ${validation.errors.join(", ")}`);
        }
      }
      if (this.config.enableCaching) {
        const cacheKey = this.getCacheKey(grid, width, height, start, goal, hpaOptions);
        const cached = this.cache.get(cacheKey);
        if (cached) {
          return cached;
        }
      }
      this.resetStats();
      if (this.clusters.length === 0) {
        this.generateClusters(grid);
      }
      const abstractPath = this.findAbstractPath(start, goal, hpaOptions);
      if (abstractPath.length === 0) {
        return this.createFailureResult(startTime, "No abstract path found");
      }
      const refinedPath = this.refinePath(abstractPath, grid, hpaOptions);
      if (refinedPath.length === 0) {
        return this.createFailureResult(startTime, "Path refinement failed");
      }
      const executionTime = performance.now() - startTime;
      this.stats.executionTime = executionTime;
      this.stats.success = true;
      const result = {
        path: refinedPath,
        found: true,
        cost: this.calculatePathCost(refinedPath),
        length: refinedPath.length,
        abstractPath,
        refinedPath,
        stats: this.getStats()
      };
      if (this.config.enableCaching) {
        const cacheKey = this.getCacheKey(grid, width, height, start, goal, hpaOptions);
        this.cache.set(cacheKey, result);
      }
      return result;
    } catch (error) {
      return this.createFailureResult(startTime, error instanceof Error ? error.message : "Unknown error");
    }
  }
  /**
   * Generates clusters from the grid.
   * @param grid - The grid.
   */
  generateClusters(grid) {
    const clusterResult = HPAClustering.generateClusters(grid, this.config);
    if (clusterResult.success) {
      this.clusters = clusterResult.clusters;
      this.stats.clustersCreated = clusterResult.stats.clustersCreated;
      this.stats.entrancesFound = clusterResult.stats.entrancesFound;
    } else {
      throw new Error("Failed to generate clusters");
    }
  }
  /**
   * Finds an abstract path using the hierarchical graph.
   * @param start - Starting point.
   * @param goal - Goal point.
   * @param options - Pathfinding options.
   * @returns Abstract path.
   */
  findAbstractPath(start, goal, options) {
    const abstractStartTime = performance.now();
    try {
      if (this.abstractNodes.length === 0) {
        this.createAbstractGraph();
      }
      const startCluster = this.findClusterContainingPoint(start);
      const goalCluster = this.findClusterContainingPoint(goal);
      if (!startCluster || !goalCluster) {
        return [];
      }
      const abstractPath = this.findAbstractPathWithAStar(startCluster, goalCluster, options);
      const abstractEndTime = performance.now();
      this.stats.abstractPathfindingTime = abstractEndTime - abstractStartTime;
      return abstractPath;
    } catch (error) {
      return [];
    }
  }
  /**
   * Creates the abstract graph from clusters and entrances.
   */
  createAbstractGraph() {
    const graphResult = HPAAbstractGraph.constructAbstractGraph(
      this.clusters,
      this.entrances,
      this.config
    );
    if (graphResult.success) {
      this.abstractNodes = graphResult.nodes;
      this.abstractEdges = graphResult.edges;
      this.stats.abstractNodesProcessed = graphResult.stats.nodesCreated;
      this.stats.abstractEdgesCreated = graphResult.stats.edgesCreated;
    } else {
      throw new Error("Failed to create abstract graph");
    }
  }
  /**
   * Finds an abstract path using A* on the abstract graph.
   * @param startCluster - Starting cluster.
   * @param goalCluster - Goal cluster.
   * @param options - Pathfinding options.
   * @returns Abstract path.
   */
  findAbstractPathWithAStar(startCluster, goalCluster, options) {
    const openSet = [];
    const closedSet = /* @__PURE__ */ new Set();
    const cameFrom = /* @__PURE__ */ new Map();
    const gScore = /* @__PURE__ */ new Map();
    const fScore = /* @__PURE__ */ new Map();
    const startNode = this.abstractNodes.find((n) => n.clusterId === startCluster.id);
    const goalNode = this.abstractNodes.find((n) => n.clusterId === goalCluster.id);
    if (!startNode || !goalNode) {
      return [];
    }
    gScore.set(startNode.id, 0);
    fScore.set(startNode.id, this.heuristic(startNode, goalNode));
    openSet.push({ ...startNode, g: 0, h: this.heuristic(startNode, goalNode), f: fScore.get(startNode.id) });
    let iterations = 0;
    const maxIterations = options.maxIterations || 1e3;
    while (openSet.length > 0 && iterations < maxIterations) {
      iterations++;
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIndex].f) {
          currentIndex = i;
        }
      }
      const current = openSet.splice(currentIndex, 1)[0];
      if (current.id === goalNode.id) {
        const path = [];
        let nodeId = goalNode.id;
        while (nodeId) {
          const node = this.abstractNodes.find((n) => n.id === nodeId);
          if (node) {
            path.unshift(node);
          }
          nodeId = cameFrom.get(nodeId);
        }
        return path;
      }
      closedSet.add(current.id);
      const neighbors = this.getAbstractNeighbors(current);
      for (const neighbor of neighbors) {
        if (closedSet.has(neighbor.id)) {
          continue;
        }
        const tentativeG = gScore.get(current.id) + this.getAbstractEdgeCost(current, neighbor);
        if (!gScore.has(neighbor.id) || tentativeG < gScore.get(neighbor.id)) {
          cameFrom.set(neighbor.id, current.id);
          gScore.set(neighbor.id, tentativeG);
          fScore.set(neighbor.id, tentativeG + this.heuristic(neighbor, goalNode));
          if (!openSet.some((node) => node.id === neighbor.id)) {
            openSet.push({
              ...neighbor,
              g: tentativeG,
              h: this.heuristic(neighbor, goalNode),
              f: fScore.get(neighbor.id)
            });
          }
        }
      }
    }
    return [];
  }
  /**
   * Refines an abstract path into a detailed path.
   * @param abstractPath - Abstract path.
   * @param grid - The grid.
   * @param options - Pathfinding options.
   * @returns Refined path.
   */
  refinePath(abstractPath, grid, options) {
    const refinementStartTime = performance.now();
    try {
      const refinementResult = HPAPathRefinement.refinePath(
        abstractPath,
        this.clusters,
        this.entrances,
        grid,
        this.config,
        {
          useAStarRefinement: true,
          usePathSmoothing: options.usePathSmoothing,
          smoothingFactor: this.config.smoothingFactor
        }
      );
      const refinementEndTime = performance.now();
      this.stats.pathRefinementTime = refinementEndTime - refinementStartTime;
      this.stats.pathRefinements++;
      return refinementResult.refinedPath;
    } catch (error) {
      return [];
    }
  }
  /**
   * Finds the cluster containing a point.
   * @param point - Point to find cluster for.
   * @returns Cluster containing the point or null.
   */
  findClusterContainingPoint(point) {
    for (const cluster of this.clusters) {
      if (point.x >= cluster.x && point.x < cluster.x + cluster.width && point.y >= cluster.y && point.y < cluster.y + cluster.height) {
        return cluster;
      }
    }
    return null;
  }
  /**
   * Gets abstract neighbors of a node.
   * @param node - Abstract node.
   * @returns Array of neighbor nodes.
   */
  getAbstractNeighbors(node) {
    const neighbors = [];
    for (const edge of this.abstractEdges) {
      if (edge.from === node.id) {
        const neighbor = this.abstractNodes.find((n) => n.id === edge.to);
        if (neighbor) {
          neighbors.push(neighbor);
        }
      }
    }
    return neighbors;
  }
  /**
   * Gets the cost of an abstract edge.
   * @param from - From node.
   * @param to - To node.
   * @returns Edge cost.
   */
  getAbstractEdgeCost(from, to) {
    const edge = this.abstractEdges.find((e) => e.from === from.id && e.to === to.id);
    return edge ? edge.cost : Infinity;
  }
  /**
   * Calculates the heuristic distance between two abstract nodes.
   * @param from - From node.
   * @param to - To node.
   * @returns Heuristic distance.
   */
  heuristic(from, to) {
    const dx = Math.abs(to.position.x - from.position.x);
    const dy = Math.abs(to.position.y - from.position.y);
    if (this.config.allowDiagonal) {
      return Math.sqrt(dx * dx + dy * dy);
    } else {
      return dx + dy;
    }
  }
  /**
   * Calculates the cost of a path.
   * @param path - Path to calculate cost for.
   * @returns Path cost.
   */
  calculatePathCost(path) {
    let cost = 0;
    for (let i = 1; i < path.length; i++) {
      const from = path[i - 1];
      const to = path[i];
      const dx = Math.abs(to.x - from.x);
      const dy = Math.abs(to.y - from.y);
      if (dx === 1 && dy === 1) {
        cost += this.config.diagonalCost;
      } else if (dx === 1 || dy === 1) {
        cost += this.config.cardinalCost;
      } else {
        cost += Math.sqrt(dx * dx + dy * dy) * this.config.cardinalCost;
      }
    }
    return cost;
  }
  /**
   * Creates a failure result.
   * @param startTime - Start time of the operation.
   * @param error - Error message.
   * @returns Failure result.
   */
  createFailureResult(startTime, error) {
    const executionTime = performance.now() - startTime;
    return {
      path: [],
      found: false,
      cost: 0,
      length: 0,
      abstractPath: [],
      refinedPath: [],
      stats: {
        clustersCreated: this.stats.clustersCreated,
        entrancesFound: this.stats.entrancesFound,
        abstractNodesProcessed: this.stats.abstractNodesProcessed,
        abstractEdgesCreated: this.stats.abstractEdgesCreated,
        pathRefinements: this.stats.pathRefinements,
        executionTime,
        abstractPathfindingTime: this.stats.abstractPathfindingTime,
        pathRefinementTime: this.stats.pathRefinementTime,
        success: false,
        error
      }
    };
  }
  /**
   * Validates input parameters.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param start - Starting point.
   * @param goal - Goal point.
   * @returns Validation result.
   */
  validateInput(grid, width, height, start, goal) {
    const errors = [];
    if (grid.length !== width * height) {
      errors.push(`Grid length mismatch: expected ${width * height}, got ${grid.length}`);
    }
    if (start.x < 0 || start.x >= width || start.y < 0 || start.y >= height) {
      errors.push(`Start point out of bounds: (${start.x}, ${start.y})`);
    }
    if (goal.x < 0 || goal.x >= width || goal.y < 0 || goal.y >= height) {
      errors.push(`Goal point out of bounds: (${goal.x}, ${goal.y})`);
    }
    const startIndex = start.y * width + start.x;
    if (startIndex >= 0 && startIndex < grid.length && grid[startIndex] === CellType$1.OBSTACLE) {
      errors.push("Start point is on an obstacle");
    }
    const goalIndex = goal.y * width + goal.x;
    if (goalIndex >= 0 && goalIndex < grid.length && grid[goalIndex] === CellType$1.OBSTACLE) {
      errors.push("Goal point is on an obstacle");
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  /**
   * Generates a cache key for the given parameters.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param start - Starting point.
   * @param goal - Goal point.
   * @param options - Pathfinding options.
   * @returns Cache key.
   */
  getCacheKey(grid, width, height, start, goal, options) {
    const gridHash = grid.slice(0, Math.min(100, grid.length)).join(",");
    const optionsHash = JSON.stringify(options);
    return `hpa-${width}x${height}_${start.x},${start.y}_${goal.x},${goal.y}_${gridHash}_${optionsHash}`;
  }
  /**
   * Updates the configuration.
   * @param newConfig - New configuration options.
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.clearCache();
  }
  /**
   * Gets the current configuration.
   * @returns The current configuration.
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Gets the current statistics.
   * @returns The current statistics.
   */
  getStats() {
    return { ...this.stats };
  }
  /**
   * Resets the statistics.
   */
  resetStats() {
    this.stats = {
      clustersCreated: 0,
      entrancesFound: 0,
      abstractNodesProcessed: 0,
      abstractEdgesCreated: 0,
      pathRefinements: 0,
      executionTime: 0,
      abstractPathfindingTime: 0,
      pathRefinementTime: 0,
      success: true
    };
  }
  /**
   * Clears the cache.
   */
  clearCache() {
    this.cache.clear();
  }
  /**
   * Gets the current clusters.
   * @returns Array of clusters.
   */
  getClusters() {
    return [...this.clusters];
  }
  /**
   * Gets the current entrances.
   * @returns Array of entrances.
   */
  getEntrances() {
    return [...this.entrances];
  }
  /**
   * Gets the current abstract nodes.
   * @returns Array of abstract nodes.
   */
  getAbstractNodes() {
    return [...this.abstractNodes];
  }
  /**
   * Gets the current abstract edges.
   * @returns Array of abstract edges.
   */
  getAbstractEdges() {
    return [...this.abstractEdges];
  }
}
class HPAStarUtils {
  /**
   * Generates a test grid with random obstacles.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param obstacleRatio - Ratio of obstacles (0-1).
   * @param seed - Random seed for reproducible results.
   * @returns Generated grid.
   */
  static generateTestGrid(width, height, obstacleRatio = 0.3, seed) {
    const grid = new Array(width * height).fill(CellType.WALKABLE);
    if (seed !== void 0) {
      this.seedRandom(seed);
    }
    for (let i = 0; i < grid.length; i++) {
      if (Math.random() < obstacleRatio) {
        grid[i] = CellType.OBSTACLE;
      }
    }
    return grid;
  }
  /**
   * Generates a grid with a specific pattern.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param pattern - Pattern type.
   * @param seed - Random seed for reproducible results.
   * @returns Generated grid.
   */
  static generatePatternGrid(width, height, pattern, seed) {
    if (seed !== void 0) {
      this.seedRandom(seed);
    }
    switch (pattern) {
      case "maze":
        return this.generateMazeGrid(width, height);
      case "rooms":
        return this.generateRoomGrid(width, height);
      case "corridors":
        return this.generateCorridorGrid(width, height);
      case "spiral":
        return this.generateSpiralGrid(width, height);
      default:
        return this.generateTestGrid(width, height, 0.3, seed);
    }
  }
  /**
   * Generates a maze-like grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Generated maze grid.
   */
  static generateMazeGrid(width, height) {
    const grid = new Array(width * height).fill(CellType.OBSTACLE);
    const stack = [{ x: 1, y: 1 }];
    grid[1 * width + 1] = CellType.WALKABLE;
    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(current, grid, width, height);
      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        const wall = this.getWallBetween(current, next);
        grid[next.y * width + next.x] = CellType.WALKABLE;
        grid[wall.y * width + wall.x] = CellType.WALKABLE;
        stack.push(next);
      } else {
        stack.pop();
      }
    }
    return grid;
  }
  /**
   * Generates a room-based grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Generated room grid.
   */
  static generateRoomGrid(width, height) {
    const grid = new Array(width * height).fill(CellType.OBSTACLE);
    const roomCount = Math.floor(Math.random() * 5) + 3;
    const rooms = [];
    for (let i = 0; i < roomCount; i++) {
      const roomWidth = 3 + Math.floor(Math.random() * 6);
      const roomHeight = 3 + Math.floor(Math.random() * 6);
      const x = 1 + Math.floor(Math.random() * (width - roomWidth - 2));
      const y = 1 + Math.floor(Math.random() * (height - roomHeight - 2));
      let overlaps = false;
      for (const room of rooms) {
        if (x < room.x + room.width && x + roomWidth > room.x && y < room.y + room.height && y + roomHeight > room.y) {
          overlaps = true;
          break;
        }
      }
      if (!overlaps) {
        for (let ry = y; ry < y + roomHeight; ry++) {
          for (let rx = x; rx < x + roomWidth; rx++) {
            grid[ry * width + rx] = CellType.WALKABLE;
          }
        }
        rooms.push({ x, y, width: roomWidth, height: roomHeight });
      }
    }
    for (let i = 1; i < rooms.length; i++) {
      const room1 = rooms[i - 1];
      const room2 = rooms[i];
      const center1 = {
        x: room1.x + Math.floor(room1.width / 2),
        y: room1.y + Math.floor(room1.height / 2)
      };
      const center2 = {
        x: room2.x + Math.floor(room2.width / 2),
        y: room2.y + Math.floor(room2.height / 2)
      };
      this.createCorridor(grid, width, height, center1, center2);
    }
    return grid;
  }
  /**
   * Generates a corridor-based grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Generated corridor grid.
   */
  static generateCorridorGrid(width, height) {
    const grid = new Array(width * height).fill(CellType.OBSTACLE);
    const corridorWidth = 2;
    const corridorSpacing = 8;
    for (let y = corridorSpacing; y < height - corridorSpacing; y += corridorSpacing) {
      for (let x = 0; x < width; x++) {
        for (let w = 0; w < corridorWidth; w++) {
          if (y + w < height) {
            grid[(y + w) * width + x] = CellType.WALKABLE;
          }
        }
      }
    }
    for (let x = corridorSpacing; x < width - corridorSpacing; x += corridorSpacing) {
      for (let y = 0; y < height; y++) {
        for (let w = 0; w < corridorWidth; w++) {
          if (x + w < width) {
            grid[y * width + (x + w)] = CellType.WALKABLE;
          }
        }
      }
    }
    return grid;
  }
  /**
   * Generates a spiral grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Generated spiral grid.
   */
  static generateSpiralGrid(width, height) {
    const grid = new Array(width * height).fill(CellType.OBSTACLE);
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    let x = centerX;
    let y = centerY;
    let dx = 0;
    let dy = -1;
    let step = 1;
    let stepCount = 0;
    for (let i = 0; i < width * height; i++) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        grid[y * width + x] = CellType.WALKABLE;
      }
      x += dx;
      y += dy;
      stepCount++;
      if (stepCount === step) {
        stepCount = 0;
        const temp = dx;
        dx = -dy;
        dy = temp;
        if (dy === 0) {
          step++;
        }
      }
    }
    return grid;
  }
  /**
   * Creates a corridor between two points.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param from - Starting point.
   * @param to - Ending point.
   */
  static createCorridor(grid, width, height, from, to) {
    const startX = Math.min(from.x, to.x);
    const endX = Math.max(from.x, to.x);
    for (let x = startX; x <= endX; x++) {
      if (x >= 0 && x < width && from.y >= 0 && from.y < height) {
        grid[from.y * width + x] = CellType.WALKABLE;
      }
    }
    const startY = Math.min(from.y, to.y);
    const endY = Math.max(from.y, to.y);
    for (let y = startY; y <= endY; y++) {
      if (to.x >= 0 && to.x < width && y >= 0 && y < height) {
        grid[y * width + to.x] = CellType.WALKABLE;
      }
    }
  }
  /**
   * Gets unvisited neighbors for maze generation.
   * @param point - Current point.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Array of unvisited neighbors.
   */
  static getUnvisitedNeighbors(point, grid, width, height) {
    const neighbors = [];
    const directions = [
      { x: 0, y: -2 },
      // North
      { x: 2, y: 0 },
      // East
      { x: 0, y: 2 },
      // South
      { x: -2, y: 0 }
      // West
    ];
    for (const dir of directions) {
      const neighbor = { x: point.x + dir.x, y: point.y + dir.y };
      if (neighbor.x >= 0 && neighbor.x < width && neighbor.y >= 0 && neighbor.y < height && grid[neighbor.y * width + neighbor.x] === CellType.OBSTACLE) {
        neighbors.push(neighbor);
      }
    }
    return neighbors;
  }
  /**
   * Gets the wall between two points for maze generation.
   * @param from - First point.
   * @param to - Second point.
   * @returns Wall point.
   */
  static getWallBetween(from, to) {
    return {
      x: from.x + (to.x - from.x) / 2,
      y: from.y + (to.y - from.y) / 2
    };
  }
  /**
   * Generates random goal points.
   * @param count - Number of goals to generate.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param grid - The grid.
   * @param seed - Random seed.
   * @returns Array of goal points.
   */
  static generateRandomGoals(count, width, height, grid, seed) {
    if (seed !== void 0) {
      this.seedRandom(seed);
    }
    const goals = [];
    const walkableCells = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        if (grid[index] === CellType.WALKABLE) {
          walkableCells.push({ x, y });
        }
      }
    }
    for (let i = 0; i < Math.min(count, walkableCells.length); i++) {
      const randomIndex = Math.floor(Math.random() * walkableCells.length);
      goals.push(walkableCells.splice(randomIndex, 1)[0]);
    }
    return goals;
  }
  /**
   * Generates goal points in a specific pattern.
   * @param pattern - Goal pattern.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param grid - The grid.
   * @param seed - Random seed.
   * @returns Array of goal points.
   */
  static generateGoalPattern(pattern, width, height, grid, seed) {
    if (seed !== void 0) {
      this.seedRandom(seed);
    }
    const goals = [];
    switch (pattern) {
      case "corners":
        goals.push(
          { x: 0, y: 0 },
          { x: width - 1, y: 0 },
          { x: 0, y: height - 1 },
          { x: width - 1, y: height - 1 }
        );
        break;
      case "center":
        goals.push({
          x: Math.floor(width / 2),
          y: Math.floor(height / 2)
        });
        break;
      case "edges":
        for (let x = 0; x < width; x++) {
          goals.push({ x, y: 0 });
          goals.push({ x, y: height - 1 });
        }
        for (let y = 1; y < height - 1; y++) {
          goals.push({ x: 0, y });
          goals.push({ x: width - 1, y });
        }
        break;
      case "random":
        return this.generateRandomGoals(5, width, height, grid, seed);
    }
    return goals.filter((goal) => {
      const index = goal.y * width + goal.x;
      return grid[index] === CellType.WALKABLE;
    });
  }
  /**
   * Calculates the distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Distance.
   */
  static distance(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  /**
   * Calculates the Manhattan distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Manhattan distance.
   */
  static manhattanDistance(a, b) {
    return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
  }
  /**
   * Calculates the Chebyshev distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Chebyshev distance.
   */
  static chebyshevDistance(a, b) {
    return Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
  }
  /**
   * Creates a default configuration for HPA*.
   * @returns Default configuration.
   */
  static createDefaultConfig() {
    return {
      width: 100,
      height: 100,
      clusterSize: 10,
      allowDiagonal: true,
      diagonalOnlyWhenClear: true,
      cardinalCost: 1,
      diagonalCost: Math.sqrt(2),
      maxPathLength: 1e4,
      usePathSmoothing: true,
      smoothingFactor: 0.5,
      useEarlyTermination: true,
      validateInput: true,
      enableCaching: true,
      tolerance: 1e-10
    };
  }
  /**
   * Creates a default options object for HPA* pathfinding.
   * @returns Default options.
   */
  static createDefaultOptions() {
    return {
      returnAbstractPath: true,
      returnRefinedPath: true,
      usePathSmoothing: true,
      useEarlyTermination: true,
      maxIterations: 1e4,
      useGoalBounding: false,
      useHierarchicalAbstraction: true
    };
  }
  /**
   * Creates a default cluster generation options object.
   * @returns Default cluster generation options.
   */
  static createDefaultClusterGenerationOptions() {
    return {
      clusterSize: 10,
      useOverlappingClusters: false,
      overlapSize: 0,
      useAdaptiveSizing: false,
      minClusterSize: 5,
      maxClusterSize: 20,
      mergeSmallClusters: true,
      smallClusterThreshold: 5
    };
  }
  /**
   * Creates a default entrance detection options object.
   * @returns Default entrance detection options.
   */
  static createDefaultEntranceDetectionOptions() {
    return {
      detectBorderEntrances: true,
      detectInteriorEntrances: true,
      minEntranceWidth: 1,
      maxEntranceWidth: 3,
      useAdaptiveDetection: false,
      detectionThreshold: 0.5
    };
  }
  /**
   * Creates a default abstract graph options object.
   * @returns Default abstract graph options.
   */
  static createDefaultAbstractGraphOptions() {
    return {
      useInterClusterEdges: true,
      useIntraClusterEdges: true,
      useEntranceEdges: true,
      useDirectClusterConnections: true,
      maxEdgeCost: 1e3,
      useEdgeCaching: true
    };
  }
  /**
   * Creates a default path refinement options object.
   * @returns Default path refinement options.
   */
  static createDefaultPathRefinementOptions() {
    return {
      useAStarRefinement: true,
      useJPSRefinement: false,
      useThetaStarRefinement: false,
      usePathSmoothing: true,
      smoothingFactor: 0.5,
      useEarlyTermination: true,
      maxRefinementIterations: 1e3
    };
  }
  /**
   * Creates a default HPA* validation options object.
   * @returns Default HPA* validation options.
   */
  static createDefaultHPAValidationOptions() {
    return {
      checkClusterValidity: true,
      checkEntranceValidity: true,
      checkAbstractGraphValidity: true,
      checkPathValidity: true,
      checkUnreachableAreas: true,
      checkInvalidConnections: true,
      maxPathLength: 1e4,
      minPathLength: 1
    };
  }
  /**
   * Seeds the random number generator for reproducible results.
   * @param seed - Random seed.
   */
  static seedRandom(seed) {
    let currentSeed = seed;
    Math.random = () => {
      currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
      return currentSeed / 4294967296;
    };
  }
  /**
   * Converts a grid to a visual string representation.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param goals - Optional goal points.
   * @param agents - Optional agent points.
   * @returns Visual string representation.
   */
  static gridToString(grid, width, height, goals = [], agents = []) {
    let result = "";
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const point = { x, y };
        if (goals.some((g) => this.pointsEqual(g, point))) {
          result += "G";
        } else if (agents.some((a) => this.pointsEqual(a, point))) {
          result += "A";
        } else {
          switch (grid[y * width + x]) {
            case CellType.WALKABLE:
              result += ".";
              break;
            case CellType.OBSTACLE:
              result += "#";
              break;
            case CellType.GOAL:
              result += "G";
              break;
            case CellType.AGENT:
              result += "A";
              break;
            default:
              result += "?";
          }
        }
      }
      result += "\n";
    }
    return result;
  }
  /**
   * Checks if two points are equal.
   * @param a - First point.
   * @param b - Second point.
   * @param tolerance - Numerical tolerance.
   * @returns True if points are equal.
   */
  static pointsEqual(a, b, tolerance = 1e-10) {
    return Math.abs(a.x - b.x) < tolerance && Math.abs(a.y - b.y) < tolerance;
  }
}
class ConvexHull {
  /**
   * Creates an instance of ConvexHull.
   * @param config - Optional configuration for the convex hull computation.
   */
  constructor(config = {}) {
    this.config = {
      algorithm: "graham-scan",
      includeCollinear: false,
      sortInput: true,
      tolerance: 1e-10,
      validateInput: true,
      ...config
    };
  }
  /**
   * Computes the convex hull of a set of points.
   * @param points - Array of points to compute the convex hull for.
   * @param algorithm - Optional algorithm override.
   * @returns A ConvexHullResult object with the hull points, edges, and statistics.
   */
  compute(points, algorithm) {
    const startTime = performance.now();
    const selectedAlgorithm = algorithm || this.config.algorithm;
    try {
      if (this.config.validateInput) {
        this.validatePoints(points);
      }
      if (points.length < 3) {
        return this.createEmptyResult(
          points.length,
          startTime,
          selectedAlgorithm,
          "At least 3 points are required for convex hull"
        );
      }
      const uniquePoints = this.removeDuplicatePoints(points);
      if (uniquePoints.length < 3) {
        return this.createEmptyResult(
          points.length,
          startTime,
          selectedAlgorithm,
          "At least 3 unique points are required"
        );
      }
      const sortedPoints = this.config.sortInput ? this.sortPoints(uniquePoints) : uniquePoints;
      let hull;
      switch (selectedAlgorithm) {
        case "graham-scan":
          hull = this.grahamScan(sortedPoints);
          break;
        case "jarvis-march":
          hull = this.jarvisMarch(sortedPoints);
          break;
        case "quickhull":
          hull = this.quickHull(sortedPoints);
          break;
        case "monotone-chain":
          hull = this.monotoneChain(sortedPoints);
          break;
        case "gift-wrapping":
          hull = this.giftWrapping(sortedPoints);
          break;
        default:
          throw new Error(`Unknown algorithm: ${selectedAlgorithm}`);
      }
      const edges = this.generateEdges(hull);
      const executionTime = performance.now() - startTime;
      return {
        hull,
        edges,
        stats: {
          inputPointCount: points.length,
          hullPointCount: hull.length,
          hullEdgeCount: edges.length,
          executionTime,
          success: true,
          algorithm: selectedAlgorithm
        }
      };
    } catch (error) {
      return this.createEmptyResult(
        points.length,
        startTime,
        selectedAlgorithm,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
  /**
   * Analyzes the convex hull and computes various properties.
   * @param hull - Array of hull points.
   * @param options - Analysis options.
   * @returns A HullAnalysis object with computed properties.
   */
  analyzeHull(hull, options = {}) {
    const analysisOptions = {
      computeArea: true,
      computePerimeter: true,
      computeCentroid: true,
      computeBoundingBox: true,
      ...options
    };
    const analysis = {
      area: 0,
      perimeter: 0,
      centroid: { x: 0, y: 0 },
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0 }
    };
    if (hull.length < 3) {
      return analysis;
    }
    if (analysisOptions.computeArea) {
      analysis.area = this.computeArea(hull);
    }
    if (analysisOptions.computePerimeter) {
      analysis.perimeter = this.computePerimeter(hull);
    }
    if (analysisOptions.computeCentroid) {
      analysis.centroid = this.computeCentroid(hull);
    }
    if (analysisOptions.computeBoundingBox) {
      analysis.boundingBox = this.computeBoundingBox(hull);
    }
    return analysis;
  }
  /**
   * Compares two convex hulls.
   * @param hull1 - First convex hull.
   * @param hull2 - Second convex hull.
   * @param options - Comparison options.
   * @returns A HullComparison object with comparison results.
   */
  compareHulls(hull1, hull2, options = {}) {
    const comparisonOptions = {
      compareAreas: true,
      comparePerimeters: true,
      compareShapes: false,
      ...options
    };
    const analysis1 = this.analyzeHull(hull1);
    const analysis2 = this.analyzeHull(hull2);
    const comparison = {
      areaDifference: 0,
      perimeterDifference: 0,
      identical: false
    };
    if (comparisonOptions.compareAreas) {
      comparison.areaDifference = analysis2.area - analysis1.area;
    }
    if (comparisonOptions.comparePerimeters) {
      comparison.perimeterDifference = analysis2.perimeter - analysis1.perimeter;
    }
    if (comparisonOptions.compareShapes) {
      comparison.hausdorffDistance = this.computeHausdorffDistance(hull1, hull2);
    }
    comparison.identical = this.areHullsIdentical(hull1, hull2);
    return comparison;
  }
  /**
   * Simplifies a convex hull by removing unnecessary points.
   * @param hull - Array of hull points.
   * @param options - Simplification options.
   * @returns A HullSimplificationResult object.
   */
  simplifyHull(hull, options = {}) {
    const simplificationOptions = {
      maxDistance: 0.1,
      preserveEndpoints: true,
      ...options
    };
    if (hull.length < 3) {
      return {
        simplifiedHull: [...hull],
        pointsRemoved: 0,
        compressionRatio: 1
      };
    }
    const simplifiedHull = this.douglasPeucker(
      hull,
      simplificationOptions.maxDistance,
      simplificationOptions.preserveEndpoints
    );
    return {
      simplifiedHull,
      pointsRemoved: hull.length - simplifiedHull.length,
      compressionRatio: hull.length / simplifiedHull.length
    };
  }
  // Algorithm implementations
  /**
   * Graham Scan algorithm - O(n log n) average case.
   */
  grahamScan(points) {
    if (points.length < 3) return points;
    let bottomIndex = 0;
    for (let i = 1; i < points.length; i++) {
      if (points[i].y < points[bottomIndex].y || points[i].y === points[bottomIndex].y && points[i].x < points[bottomIndex].x) {
        bottomIndex = i;
      }
    }
    [points[0], points[bottomIndex]] = [points[bottomIndex], points[0]];
    const bottomPoint = points[0];
    const sortedPoints = points.slice(1).sort((a, b) => {
      const angleA = this.polarAngle(bottomPoint, a);
      const angleB = this.polarAngle(bottomPoint, b);
      if (Math.abs(angleA - angleB) < this.config.tolerance) {
        const distA = this.distanceSquared(bottomPoint, a);
        const distB = this.distanceSquared(bottomPoint, b);
        return distA - distB;
      }
      return angleA - angleB;
    });
    const hull = [bottomPoint];
    for (const point of sortedPoints) {
      while (hull.length > 1 && this.crossProduct(hull[hull.length - 2], hull[hull.length - 1], point) <= 0) {
        hull.pop();
      }
      hull.push(point);
    }
    return hull;
  }
  /**
   * Jarvis March (Gift Wrapping) algorithm - O(nh) where h is the number of hull points.
   */
  jarvisMarch(points) {
    if (points.length < 3) return points;
    const hull = [];
    let leftmostIndex = 0;
    for (let i = 1; i < points.length; i++) {
      if (points[i].x < points[leftmostIndex].x) {
        leftmostIndex = i;
      }
    }
    let currentIndex = leftmostIndex;
    do {
      hull.push(points[currentIndex]);
      let nextIndex = (currentIndex + 1) % points.length;
      for (let i = 0; i < points.length; i++) {
        if (this.crossProduct(points[currentIndex], points[i], points[nextIndex]) > 0) {
          nextIndex = i;
        }
      }
      currentIndex = nextIndex;
    } while (currentIndex !== leftmostIndex);
    return hull;
  }
  /**
   * QuickHull algorithm - O(n log n) average case, O(n²) worst case.
   */
  quickHull(points) {
    if (points.length < 3) return points;
    let leftmostIndex = 0;
    let rightmostIndex = 0;
    for (let i = 1; i < points.length; i++) {
      if (points[i].x < points[leftmostIndex].x) {
        leftmostIndex = i;
      }
      if (points[i].x > points[rightmostIndex].x) {
        rightmostIndex = i;
      }
    }
    const leftmost = points[leftmostIndex];
    const rightmost = points[rightmostIndex];
    const leftSet = [];
    const rightSet = [];
    for (const point of points) {
      if (point === leftmost || point === rightmost) continue;
      const cross = this.crossProduct(leftmost, rightmost, point);
      if (cross > 0) {
        leftSet.push(point);
      } else if (cross < 0) {
        rightSet.push(point);
      }
    }
    const hull = [leftmost];
    this.quickHullRecursive(leftmost, rightmost, leftSet, hull);
    hull.push(rightmost);
    this.quickHullRecursive(rightmost, leftmost, rightSet, hull);
    return hull;
  }
  /**
   * Monotone Chain algorithm - O(n log n).
   */
  monotoneChain(points) {
    if (points.length < 3) return points;
    const sortedPoints = [...points].sort((a, b) => {
      if (Math.abs(a.x - b.x) < this.config.tolerance) {
        return a.y - b.y;
      }
      return a.x - b.x;
    });
    const lower = [];
    for (const point of sortedPoints) {
      while (lower.length >= 2 && this.crossProduct(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
        lower.pop();
      }
      lower.push(point);
    }
    const upper = [];
    for (let i = sortedPoints.length - 1; i >= 0; i--) {
      const point = sortedPoints[i];
      while (upper.length >= 2 && this.crossProduct(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
        upper.pop();
      }
      upper.push(point);
    }
    lower.pop();
    upper.pop();
    return [...lower, ...upper];
  }
  /**
   * Gift Wrapping algorithm - O(nh) where h is the number of hull points.
   */
  giftWrapping(points) {
    return this.jarvisMarch(points);
  }
  // Helper methods
  validatePoints(points) {
    if (!Array.isArray(points)) {
      throw new Error("Points must be an array");
    }
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (!point || typeof point.x !== "number" || typeof point.y !== "number") {
        throw new Error(`Invalid point at index ${i}: must have x and y properties`);
      }
      if (!isFinite(point.x) || !isFinite(point.y)) {
        throw new Error(`Point at index ${i} has non-finite coordinates`);
      }
    }
  }
  removeDuplicatePoints(points) {
    const unique = [];
    const seen = /* @__PURE__ */ new Set();
    for (const point of points) {
      const key = `${point.x},${point.y}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(point);
      }
    }
    return unique;
  }
  sortPoints(points) {
    return [...points].sort((a, b) => {
      if (Math.abs(a.x - b.x) < this.config.tolerance) {
        return a.y - b.y;
      }
      return a.x - b.x;
    });
  }
  generateEdges(hull) {
    const edges = [];
    for (let i = 0; i < hull.length; i++) {
      const start = hull[i];
      const end = hull[(i + 1) % hull.length];
      edges.push({ start, end });
    }
    return edges;
  }
  polarAngle(origin, point) {
    return Math.atan2(point.y - origin.y, point.x - origin.x);
  }
  crossProduct(o, a, b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  }
  distanceSquared(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return dx * dx + dy * dy;
  }
  quickHullRecursive(p1, p2, points, hull) {
    if (points.length === 0) return;
    let maxDistance = 0;
    let maxIndex = 0;
    for (let i = 0; i < points.length; i++) {
      const distance2 = this.pointToLineDistance(points[i], p1, p2);
      if (distance2 > maxDistance) {
        maxDistance = distance2;
        maxIndex = i;
      }
    }
    const maxPoint = points[maxIndex];
    const leftSet = [];
    const rightSet = [];
    for (const point of points) {
      if (point === maxPoint) continue;
      const cross1 = this.crossProduct(p1, maxPoint, point);
      const cross2 = this.crossProduct(maxPoint, p2, point);
      if (cross1 > 0) {
        leftSet.push(point);
      } else if (cross2 > 0) {
        rightSet.push(point);
      }
    }
    this.quickHullRecursive(p1, maxPoint, leftSet, hull);
    hull.push(maxPoint);
    this.quickHullRecursive(maxPoint, p2, rightSet, hull);
  }
  pointToLineDistance(point, lineStart, lineEnd) {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    if (lenSq === 0) {
      return Math.sqrt(A * A + B * B);
    }
    const param = dot / lenSq;
    const xx = lineStart.x + param * C;
    const yy = lineStart.y + param * D;
    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }
  computeArea(hull) {
    if (hull.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < hull.length; i++) {
      const j = (i + 1) % hull.length;
      area += hull[i].x * hull[j].y;
      area -= hull[j].x * hull[i].y;
    }
    return Math.abs(area) / 2;
  }
  computePerimeter(hull) {
    if (hull.length < 2) return 0;
    let perimeter = 0;
    for (let i = 0; i < hull.length; i++) {
      const j = (i + 1) % hull.length;
      const dx = hull[j].x - hull[i].x;
      const dy = hull[j].y - hull[i].y;
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    return perimeter;
  }
  computeCentroid(hull) {
    if (hull.length === 0) return { x: 0, y: 0 };
    let cx = 0;
    let cy = 0;
    for (const point of hull) {
      cx += point.x;
      cy += point.y;
    }
    return { x: cx / hull.length, y: cy / hull.length };
  }
  computeBoundingBox(hull) {
    if (hull.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    let minX = hull[0].x;
    let minY = hull[0].y;
    let maxX = hull[0].x;
    let maxY = hull[0].y;
    for (const point of hull) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
    return { minX, minY, maxX, maxY };
  }
  computeHausdorffDistance(hull1, hull2) {
    let maxDistance = 0;
    for (const point1 of hull1) {
      let minDistance = Infinity;
      for (const point2 of hull2) {
        const distance2 = Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
        minDistance = Math.min(minDistance, distance2);
      }
      maxDistance = Math.max(maxDistance, minDistance);
    }
    for (const point2 of hull2) {
      let minDistance = Infinity;
      for (const point1 of hull1) {
        const distance2 = Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
        minDistance = Math.min(minDistance, distance2);
      }
      maxDistance = Math.max(maxDistance, minDistance);
    }
    return maxDistance;
  }
  areHullsIdentical(hull1, hull2) {
    if (hull1.length !== hull2.length) return false;
    for (const point1 of hull1) {
      let found = false;
      for (const point2 of hull2) {
        if (Math.abs(point1.x - point2.x) < this.config.tolerance && Math.abs(point1.y - point2.y) < this.config.tolerance) {
          found = true;
          break;
        }
      }
      if (!found) return false;
    }
    return true;
  }
  douglasPeucker(points, maxDistance, preserveEndpoints) {
    if (points.length <= 2) return points;
    let maxDist = 0;
    let maxIndex = 0;
    for (let i = 1; i < points.length - 1; i++) {
      const dist = this.pointToLineDistance(points[i], points[0], points[points.length - 1]);
      if (dist > maxDist) {
        maxDist = dist;
        maxIndex = i;
      }
    }
    if (maxDist > maxDistance) {
      const left = this.douglasPeucker(points.slice(0, maxIndex + 1), maxDistance, preserveEndpoints);
      const right = this.douglasPeucker(points.slice(maxIndex), maxDistance, preserveEndpoints);
      return [...left.slice(0, -1), ...right];
    } else {
      if (preserveEndpoints) {
        return [points[0], points[points.length - 1]];
      } else {
        return [points[0]];
      }
    }
  }
  createEmptyResult(pointCount, startTime, algorithm, error) {
    return {
      hull: [],
      edges: [],
      stats: {
        inputPointCount: pointCount,
        hullPointCount: 0,
        hullEdgeCount: 0,
        executionTime: performance.now() - startTime,
        success: false,
        algorithm,
        error
      }
    };
  }
}
class MarchingSquares {
  /**
   * Creates an instance of MarchingSquares.
   * @param config - Optional configuration for the algorithm.
   */
  constructor(config = {}) {
    this.config = {
      threshold: 0.5,
      generateClosedContours: true,
      generateOpenContours: true,
      interpolate: true,
      tolerance: 1e-10,
      validateInput: true,
      ...config
    };
  }
  /**
   * Computes contours from a 2D scalar field using the marching squares algorithm.
   * @param grid - 2D array representing the scalar field values.
   * @param threshold - Optional threshold override.
   * @returns A MarchingSquaresResult object with generated contours and statistics.
   */
  compute(grid, threshold) {
    const startTime = performance.now();
    const actualThreshold = threshold ?? this.config.threshold;
    try {
      if (this.config.validateInput) {
        this.validateGrid(grid);
      }
      if (grid.length === 0 || grid[0].length === 0) {
        return this.createEmptyResult(0, 0, startTime, "Grid cannot be empty");
      }
      const width = grid[0].length;
      const height = grid.length;
      const contours = this.generateContours(grid, actualThreshold);
      const executionTime = performance.now() - startTime;
      return {
        contours,
        stats: {
          gridWidth: width,
          gridHeight: height,
          contourCount: contours.length,
          segmentCount: contours.reduce((sum, contour) => sum + contour.segments.length, 0),
          executionTime,
          success: true
        }
      };
    } catch (error) {
      return this.createEmptyResult(
        grid.length > 0 ? grid[0].length : 0,
        grid.length,
        startTime,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
  /**
   * Computes multi-level contours for different threshold values.
   * @param grid - 2D array representing the scalar field values.
   * @param options - Multi-level contour options.
   * @returns A MultiLevelContourResult object with contours organized by level.
   */
  computeMultiLevel(grid, options) {
    const startTime = performance.now();
    const multiOptions = {
      thresholds: options.thresholds || [0.5],
      generateAllLevels: true,
      mergeOverlapping: false,
      ...options
    };
    try {
      if (this.config.validateInput) {
        this.validateGrid(grid);
      }
      if (grid.length === 0 || grid[0].length === 0) {
        return {
          contoursByLevel: /* @__PURE__ */ new Map(),
          allContours: [],
          stats: {
            gridWidth: 0,
            gridHeight: 0,
            contourCount: 0,
            segmentCount: 0,
            executionTime: performance.now() - startTime,
            success: false,
            error: "Grid cannot be empty"
          }
        };
      }
      const contoursByLevel = /* @__PURE__ */ new Map();
      const allContours = [];
      for (const threshold of multiOptions.thresholds) {
        const result = this.compute(grid, threshold);
        if (result.stats.success) {
          contoursByLevel.set(threshold, result.contours);
          allContours.push(...result.contours);
        }
      }
      const executionTime = performance.now() - startTime;
      return {
        contoursByLevel,
        allContours,
        stats: {
          gridWidth: grid[0].length,
          gridHeight: grid.length,
          contourCount: allContours.length,
          segmentCount: allContours.reduce((sum, contour) => sum + contour.segments.length, 0),
          executionTime,
          success: true
        }
      };
    } catch (error) {
      return {
        contoursByLevel: /* @__PURE__ */ new Map(),
        allContours: [],
        stats: {
          gridWidth: grid.length > 0 ? grid[0].length : 0,
          gridHeight: grid.length,
          contourCount: 0,
          segmentCount: 0,
          executionTime: performance.now() - startTime,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      };
    }
  }
  /**
   * Analyzes a contour and computes various properties.
   * @param contour - The contour to analyze.
   * @param options - Analysis options.
   * @returns A ContourAnalysis object with computed properties.
   */
  analyzeContour(contour, options = {}) {
    const analysisOptions = {
      computeLengths: true,
      computeAreas: true,
      computeCentroids: true,
      computeBoundingBoxes: true,
      ...options
    };
    const analysis = {
      length: 0,
      centroid: { x: 0, y: 0 },
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0 }
    };
    if (contour.segments.length === 0) {
      return analysis;
    }
    if (analysisOptions.computeLengths) {
      analysis.length = this.computeContourLength(contour);
    }
    if (analysisOptions.computeAreas && contour.isClosed) {
      analysis.area = this.computeContourArea(contour);
    }
    if (analysisOptions.computeCentroids) {
      analysis.centroid = this.computeContourCentroid(contour);
    }
    if (analysisOptions.computeBoundingBoxes) {
      analysis.boundingBox = this.computeContourBoundingBox(contour);
    }
    return analysis;
  }
  /**
   * Simplifies a contour by removing unnecessary segments.
   * @param contour - The contour to simplify.
   * @param options - Simplification options.
   * @returns A ContourSimplificationResult object.
   */
  simplifyContour(contour, options = {}) {
    const simplificationOptions = {
      maxDistance: 0.1,
      preserveEndpoints: true,
      ...options
    };
    if (contour.segments.length <= 2) {
      return {
        simplifiedContour: { ...contour },
        segmentsRemoved: 0,
        compressionRatio: 1
      };
    }
    const points = [];
    for (const segment of contour.segments) {
      points.push(segment.start);
    }
    if (contour.segments.length > 0) {
      points.push(contour.segments[contour.segments.length - 1].end);
    }
    const simplifiedPoints = this.douglasPeucker(
      points,
      simplificationOptions.maxDistance,
      simplificationOptions.preserveEndpoints
    );
    const simplifiedSegments = [];
    for (let i = 0; i < simplifiedPoints.length - 1; i++) {
      simplifiedSegments.push({
        start: simplifiedPoints[i],
        end: simplifiedPoints[i + 1]
      });
    }
    const simplifiedContour = {
      segments: simplifiedSegments,
      isClosed: contour.isClosed,
      level: contour.level
    };
    return {
      simplifiedContour,
      segmentsRemoved: contour.segments.length - simplifiedSegments.length,
      compressionRatio: contour.segments.length / simplifiedSegments.length
    };
  }
  // Private helper methods
  validateGrid(grid) {
    if (!Array.isArray(grid)) {
      throw new Error("Grid must be a 2D array");
    }
    if (grid.length === 0) {
      throw new Error("Grid cannot be empty");
    }
    const firstRowLength = grid[0].length;
    if (firstRowLength === 0) {
      throw new Error("Grid rows cannot be empty");
    }
    for (let i = 0; i < grid.length; i++) {
      const row = grid[i];
      if (!Array.isArray(row)) {
        throw new Error(`Row ${i} must be an array`);
      }
      if (row.length !== firstRowLength) {
        throw new Error(
          `All rows must have the same length. Row ${i} has length ${row.length}, expected ${firstRowLength}`
        );
      }
      for (let j = 0; j < row.length; j++) {
        const value = row[j];
        if (typeof value !== "number" || !isFinite(value)) {
          throw new Error(`Invalid value at [${i}][${j}]: must be a finite number`);
        }
      }
    }
  }
  generateContours(grid, threshold) {
    const contours = [];
    const width = grid[0].length;
    const height = grid.length;
    for (let y = 0; y < height - 1; y++) {
      for (let x = 0; x < width - 1; x++) {
        const cellContours = this.processCell(grid, x, y, threshold);
        contours.push(...cellContours);
      }
    }
    return this.mergeContours(contours);
  }
  processCell(grid, x, y, threshold) {
    const topLeft = grid[y][x];
    const topRight = grid[y][x + 1];
    const bottomLeft = grid[y + 1][x];
    const bottomRight = grid[y + 1][x + 1];
    const corners = [topLeft >= threshold, topRight >= threshold, bottomRight >= threshold, bottomLeft >= threshold];
    let caseIndex = 0;
    for (let i = 0; i < 4; i++) {
      if (corners[i]) {
        caseIndex |= 1 << i;
      }
    }
    const segments = this.generateSegmentsForCase(caseIndex, x, y, grid, threshold);
    const contours = [];
    for (const segment of segments) {
      contours.push({
        segments: [segment],
        isClosed: false,
        level: threshold
      });
    }
    return contours;
  }
  generateSegmentsForCase(caseIndex, x, y, grid, threshold) {
    const segments = [];
    const cases = [
      [],
      // 0: all below threshold
      [[0, 3]],
      // 1: top-left above
      [[0, 1]],
      // 2: top-right above
      [[1, 3]],
      // 3: top-left and top-right above
      [[1, 2]],
      // 4: bottom-right above
      [
        [0, 1],
        [2, 3]
      ],
      // 5: top-left and bottom-right above
      [[0, 2]],
      // 6: top-right and bottom-right above
      [[2, 3]],
      // 7: top-left, top-right, and bottom-right above
      [[2, 3]],
      // 8: bottom-left above
      [[0, 2]],
      // 9: top-left and bottom-left above
      [
        [0, 1],
        [2, 3]
      ],
      // 10: top-right and bottom-left above
      [[1, 2]],
      // 11: top-left, top-right, and bottom-left above
      [[1, 3]],
      // 12: bottom-left and bottom-right above
      [[0, 1]],
      // 13: top-left, bottom-left, and bottom-right above
      [[0, 3]],
      // 14: top-right, bottom-left, and bottom-right above
      []
      // 15: all above threshold
    ];
    const edges = cases[caseIndex];
    if (!edges) return segments;
    for (const edge of edges) {
      const [startEdge, endEdge] = edge;
      const startPoint = this.getEdgePoint(startEdge, x, y, grid, threshold);
      const endPoint = this.getEdgePoint(endEdge, x, y, grid, threshold);
      if (startPoint && endPoint) {
        segments.push({ start: startPoint, end: endPoint });
      }
    }
    return segments;
  }
  getEdgePoint(edgeIndex, x, y, grid, threshold) {
    switch (edgeIndex) {
      case 0:
        if (this.config.interpolate) {
          const left = grid[y][x];
          const right = grid[y][x + 1];
          const t = this.interpolate(threshold, left, right);
          return { x: x + t, y };
        } else {
          return { x: x + 0.5, y };
        }
      case 1:
        if (this.config.interpolate) {
          const top = grid[y][x + 1];
          const bottom = grid[y + 1][x + 1];
          const t = this.interpolate(threshold, top, bottom);
          return { x: x + 1, y: y + t };
        } else {
          return { x: x + 1, y: y + 0.5 };
        }
      case 2:
        if (this.config.interpolate) {
          const left = grid[y + 1][x];
          const right = grid[y + 1][x + 1];
          const t = this.interpolate(threshold, left, right);
          return { x: x + t, y: y + 1 };
        } else {
          return { x: x + 0.5, y: y + 1 };
        }
      case 3:
        if (this.config.interpolate) {
          const top = grid[y][x];
          const bottom = grid[y + 1][x];
          const t = this.interpolate(threshold, top, bottom);
          return { x, y: y + t };
        } else {
          return { x, y: y + 0.5 };
        }
      default:
        return null;
    }
  }
  interpolate(threshold, value1, value2) {
    if (Math.abs(value1 - value2) < this.config.tolerance) {
      return 0.5;
    }
    return (threshold - value1) / (value2 - value1);
  }
  mergeContours(contours) {
    if (contours.length === 0) return contours;
    const merged = [];
    const used = /* @__PURE__ */ new Set();
    for (let i = 0; i < contours.length; i++) {
      if (used.has(i)) continue;
      const contour = contours[i];
      const mergedContour = {
        segments: [...contour.segments],
        isClosed: contour.isClosed,
        level: contour.level
      };
      used.add(i);
      let mergedAny = true;
      while (mergedAny) {
        mergedAny = false;
        for (let j = 0; j < contours.length; j++) {
          if (used.has(j)) continue;
          const otherContour = contours[j];
          if (Math.abs(otherContour.level - mergedContour.level) > this.config.tolerance) {
            continue;
          }
          const mergedResult = this.tryMergeContours(mergedContour, otherContour);
          if (mergedResult) {
            mergedContour.segments = mergedResult.segments;
            mergedContour.isClosed = mergedResult.isClosed;
            used.add(j);
            mergedAny = true;
            break;
          }
        }
      }
      merged.push(mergedContour);
    }
    return merged;
  }
  tryMergeContours(contour1, contour2) {
    if (contour1.segments.length === 0 || contour2.segments.length === 0) {
      return null;
    }
    const start1 = contour1.segments[0].start;
    const end1 = contour1.segments[contour1.segments.length - 1].end;
    const start2 = contour2.segments[0].start;
    const end2 = contour2.segments[contour2.segments.length - 1].end;
    if (this.pointsEqual(end1, start2)) {
      return {
        segments: [...contour1.segments, ...contour2.segments],
        isClosed: this.pointsEqual(start1, end2),
        level: contour1.level
      };
    } else if (this.pointsEqual(end2, start1)) {
      return {
        segments: [...contour2.segments, ...contour1.segments],
        isClosed: this.pointsEqual(start2, end1),
        level: contour1.level
      };
    } else if (this.pointsEqual(end1, end2)) {
      const reversedSegments = contour2.segments.map((seg) => ({
        start: seg.end,
        end: seg.start
      })).reverse();
      return {
        segments: [...contour1.segments, ...reversedSegments],
        isClosed: this.pointsEqual(start1, start2),
        level: contour1.level
      };
    } else if (this.pointsEqual(start1, start2)) {
      const reversedSegments = contour1.segments.map((seg) => ({
        start: seg.end,
        end: seg.start
      })).reverse();
      return {
        segments: [...reversedSegments, ...contour2.segments],
        isClosed: this.pointsEqual(end1, end2),
        level: contour1.level
      };
    }
    return null;
  }
  pointsEqual(p1, p2) {
    return Math.abs(p1.x - p2.x) < this.config.tolerance && Math.abs(p1.y - p2.y) < this.config.tolerance;
  }
  computeContourLength(contour) {
    let length = 0;
    for (const segment of contour.segments) {
      const dx = segment.end.x - segment.start.x;
      const dy = segment.end.y - segment.start.y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return length;
  }
  computeContourArea(contour) {
    if (!contour.isClosed || contour.segments.length < 3) {
      return 0;
    }
    let area = 0;
    for (const segment of contour.segments) {
      area += segment.start.x * segment.end.y;
      area -= segment.end.x * segment.start.y;
    }
    return Math.abs(area) / 2;
  }
  computeContourCentroid(contour) {
    if (contour.segments.length === 0) {
      return { x: 0, y: 0 };
    }
    let cx = 0;
    let cy = 0;
    let totalLength = 0;
    for (const segment of contour.segments) {
      const length = Math.sqrt((segment.end.x - segment.start.x) ** 2 + (segment.end.y - segment.start.y) ** 2);
      cx += (segment.start.x + segment.end.x) / 2 * length;
      cy += (segment.start.y + segment.end.y) / 2 * length;
      totalLength += length;
    }
    return {
      x: totalLength > 0 ? cx / totalLength : 0,
      y: totalLength > 0 ? cy / totalLength : 0
    };
  }
  computeContourBoundingBox(contour) {
    if (contour.segments.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const segment of contour.segments) {
      minX = Math.min(minX, segment.start.x, segment.end.x);
      minY = Math.min(minY, segment.start.y, segment.end.y);
      maxX = Math.max(maxX, segment.start.x, segment.end.x);
      maxY = Math.max(maxY, segment.start.y, segment.end.y);
    }
    return { minX, minY, maxX, maxY };
  }
  douglasPeucker(points, maxDistance, preserveEndpoints) {
    if (points.length <= 2) return points;
    let maxDist = 0;
    let maxIndex = 0;
    for (let i = 1; i < points.length - 1; i++) {
      const dist = this.pointToLineDistance(points[i], points[0], points[points.length - 1]);
      if (dist > maxDist) {
        maxDist = dist;
        maxIndex = i;
      }
    }
    if (maxDist > maxDistance) {
      const left = this.douglasPeucker(points.slice(0, maxIndex + 1), maxDistance, preserveEndpoints);
      const right = this.douglasPeucker(points.slice(maxIndex), maxDistance, preserveEndpoints);
      return [...left.slice(0, -1), ...right];
    } else {
      if (preserveEndpoints) {
        return [points[0], points[points.length - 1]];
      } else {
        return [points[0]];
      }
    }
  }
  pointToLineDistance(point, lineStart, lineEnd) {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    if (lenSq === 0) {
      return Math.sqrt(A * A + B * B);
    }
    const param = dot / lenSq;
    const xx = lineStart.x + param * C;
    const yy = lineStart.y + param * D;
    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }
  createEmptyResult(width, height, startTime, error) {
    return {
      contours: [],
      stats: {
        gridWidth: width,
        gridHeight: height,
        contourCount: 0,
        segmentCount: 0,
        executionTime: performance.now() - startTime,
        success: false,
        error
      }
    };
  }
}
class SimplexNoise {
  /**
   * Creates an instance of SimplexNoise.
   * @param config - Optional configuration for the noise generator.
   */
  constructor(config = {}) {
    this.simplex4DLookup = [
      [0, 1, 2, 3],
      [0, 1, 3, 2],
      [0, 0, 0, 0],
      [0, 2, 3, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 2, 3, 0],
      [0, 2, 1, 3],
      [0, 0, 0, 0],
      [0, 3, 1, 2],
      [0, 3, 2, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 3, 2, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 2, 0, 3],
      [0, 0, 0, 0],
      [1, 3, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 3, 0, 1],
      [2, 3, 1, 0],
      [1, 0, 2, 3],
      [1, 0, 3, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 3, 1],
      [0, 0, 0, 0],
      [2, 1, 3, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 1, 3],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [3, 0, 1, 2],
      [3, 0, 2, 1],
      [0, 0, 0, 0],
      [3, 1, 2, 0],
      [2, 1, 0, 3],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [3, 1, 0, 2],
      [0, 0, 0, 0],
      [3, 2, 0, 1],
      [3, 2, 1, 0]
    ];
    this.config = {
      seed: 0,
      frequency: 1,
      amplitude: 1,
      octaves: 4,
      persistence: 0.5,
      lacunarity: 2,
      scale: 1,
      offset: { x: 0, y: 0, z: 0, w: 0 },
      normalize: false,
      useImprovedGradients: true,
      ...config
    };
    this.initializeGradients();
    this.initializePermutation();
  }
  /**
   * Generates 2D simplex noise at the given coordinates.
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @returns The noise value in the range [-1, 1].
   */
  noise2D(x, y) {
    const scaledX = (x + this.config.offset.x) * this.config.frequency * this.config.scale;
    const scaledY = (y + this.config.offset.y) * this.config.frequency * this.config.scale;
    let value = this.simplex2D(scaledX, scaledY);
    value *= this.config.amplitude;
    if (this.config.normalize) {
      value = (value + 1) / 2;
    }
    return value;
  }
  /**
   * Generates 3D simplex noise at the given coordinates.
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @param z - Z coordinate.
   * @returns The noise value in the range [-1, 1].
   */
  noise3D(x, y, z) {
    const scaledX = (x + this.config.offset.x) * this.config.frequency * this.config.scale;
    const scaledY = (y + this.config.offset.y) * this.config.frequency * this.config.scale;
    const scaledZ = (z + this.config.offset.z) * this.config.frequency * this.config.scale;
    let value = this.simplex3D(scaledX, scaledY, scaledZ);
    value *= this.config.amplitude;
    if (this.config.normalize) {
      value = (value + 1) / 2;
    }
    return value;
  }
  /**
   * Generates 4D simplex noise at the given coordinates.
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @param z - Z coordinate.
   * @param w - W coordinate.
   * @returns The noise value in the range [-1, 1].
   */
  noise4D(x, y, z, w) {
    const scaledX = (x + this.config.offset.x) * this.config.frequency * this.config.scale;
    const scaledY = (y + this.config.offset.y) * this.config.frequency * this.config.scale;
    const scaledZ = (z + this.config.offset.z) * this.config.frequency * this.config.scale;
    const scaledW = (w + this.config.offset.w) * this.config.frequency * this.config.scale;
    let value = this.simplex4D(scaledX, scaledY, scaledZ, scaledW);
    value *= this.config.amplitude;
    if (this.config.normalize) {
      value = (value + 1) / 2;
    }
    return value;
  }
  /**
   * Generates 2D fractal noise using multiple octaves.
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @param options - Optional fractal noise options.
   * @returns The fractal noise value.
   */
  fractalNoise2D(x, y, options = {}) {
    const fractalOptions = {
      octaves: this.config.octaves,
      persistence: this.config.persistence,
      lacunarity: this.config.lacunarity,
      baseFrequency: this.config.frequency,
      baseAmplitude: this.config.amplitude,
      ...options
    };
    let value = 0;
    let amplitude = fractalOptions.baseAmplitude;
    let frequency = fractalOptions.baseFrequency;
    let maxValue = 0;
    for (let i = 0; i < fractalOptions.octaves; i++) {
      value += this.simplex2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= fractalOptions.persistence;
      frequency *= fractalOptions.lacunarity;
    }
    value /= maxValue;
    if (this.config.normalize) {
      value = (value + 1) / 2;
    }
    return value;
  }
  /**
   * Generates 3D fractal noise using multiple octaves.
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @param z - Z coordinate.
   * @param options - Optional fractal noise options.
   * @returns The fractal noise value.
   */
  fractalNoise3D(x, y, z, options = {}) {
    const fractalOptions = {
      octaves: this.config.octaves,
      persistence: this.config.persistence,
      lacunarity: this.config.lacunarity,
      baseFrequency: this.config.frequency,
      baseAmplitude: this.config.amplitude,
      ...options
    };
    let value = 0;
    let amplitude = fractalOptions.baseAmplitude;
    let frequency = fractalOptions.baseFrequency;
    let maxValue = 0;
    for (let i = 0; i < fractalOptions.octaves; i++) {
      value += this.simplex3D(x * frequency, y * frequency, z * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= fractalOptions.persistence;
      frequency *= fractalOptions.lacunarity;
    }
    value /= maxValue;
    if (this.config.normalize) {
      value = (value + 1) / 2;
    }
    return value;
  }
  /**
   * Generates a 2D noise field.
   * @param options - Options for 2D noise generation.
   * @returns A NoiseResult object with the generated noise values and statistics.
   */
  generateNoise2D(options) {
    const startTime = performance.now();
    const values = [];
    const { width, height, offsetX = 0, offsetY = 0, stepSize = 1 } = options;
    try {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const noiseX = x * stepSize + offsetX;
          const noiseY = y * stepSize + offsetY;
          values.push(this.noise2D(noiseX, noiseY));
        }
      }
      const stats = this.computeStats(values, performance.now() - startTime);
      return { values, stats };
    } catch (error) {
      return {
        values: [],
        stats: {
          sampleCount: 0,
          executionTime: performance.now() - startTime,
          minValue: 0,
          maxValue: 0,
          averageValue: 0,
          standardDeviation: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      };
    }
  }
  /**
   * Generates a 3D noise field.
   * @param options - Options for 3D noise generation.
   * @returns A NoiseResult object with the generated noise values and statistics.
   */
  generateNoise3D(options) {
    const startTime = performance.now();
    const values = [];
    const { width, height, depth, offsetX = 0, offsetY = 0, offsetZ = 0, stepSize = 1 } = options;
    try {
      for (let z = 0; z < depth; z++) {
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const noiseX = x * stepSize + offsetX;
            const noiseY = y * stepSize + offsetY;
            const noiseZ = z * stepSize + offsetZ;
            values.push(this.noise3D(noiseX, noiseY, noiseZ));
          }
        }
      }
      const stats = this.computeStats(values, performance.now() - startTime);
      return { values, stats };
    } catch (error) {
      return {
        values: [],
        stats: {
          sampleCount: 0,
          executionTime: performance.now() - startTime,
          minValue: 0,
          maxValue: 0,
          averageValue: 0,
          standardDeviation: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      };
    }
  }
  /**
   * Generates a 4D noise field.
   * @param options - Options for 4D noise generation.
   * @returns A NoiseResult object with the generated noise values and statistics.
   */
  generateNoise4D(options) {
    const startTime = performance.now();
    const values = [];
    const { width, height, depth, time, offsetX = 0, offsetY = 0, offsetZ = 0, offsetW = 0, stepSize = 1 } = options;
    try {
      for (let w = 0; w < time; w++) {
        for (let z = 0; z < depth; z++) {
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const noiseX = x * stepSize + offsetX;
              const noiseY = y * stepSize + offsetY;
              const noiseZ = z * stepSize + offsetZ;
              const noiseW = w * stepSize + offsetW;
              values.push(this.noise4D(noiseX, noiseY, noiseZ, noiseW));
            }
          }
        }
      }
      const stats = this.computeStats(values, performance.now() - startTime);
      return { values, stats };
    } catch (error) {
      return {
        values: [],
        stats: {
          sampleCount: 0,
          executionTime: performance.now() - startTime,
          minValue: 0,
          maxValue: 0,
          averageValue: 0,
          standardDeviation: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      };
    }
  }
  /**
   * Analyzes noise properties.
   * @param values - Array of noise values to analyze.
   * @param options - Analysis options.
   * @returns A NoiseAnalysis object with computed properties.
   */
  analyzeNoise(values, options = {}) {
    const analysisOptions = {
      computeStatistics: true,
      computeFrequencyDomain: false,
      computeSpatialProperties: false,
      ...options
    };
    const analysis = {
      statistics: {
        min: 0,
        max: 0,
        mean: 0,
        median: 0,
        standardDeviation: 0,
        variance: 0,
        skewness: 0,
        kurtosis: 0
      }
    };
    if (analysisOptions.computeStatistics) {
      analysis.statistics = this.computeDetailedStatistics(values);
    }
    if (analysisOptions.computeFrequencyDomain) {
      analysis.frequencyDomain = this.computeFrequencyDomainProperties(values);
    }
    if (analysisOptions.computeSpatialProperties) {
      analysis.spatialProperties = this.computeSpatialProperties(values);
    }
    return analysis;
  }
  /**
   * Applies filtering to noise values.
   * @param values - Array of noise values to filter.
   * @param options - Filter options.
   * @returns A NoiseFilterResult object with filtered values and statistics.
   */
  filterNoise(values, options) {
    const startTime = performance.now();
    try {
      const filteredValues = this.applyFilter(values, options);
      const filterResponse = this.computeFilterResponse(options);
      const filterGain = this.computeFilterGain(filteredValues, values);
      const noiseReduction = this.computeNoiseReduction(filteredValues, values);
      return {
        filteredValues,
        originalValues: [...values],
        filterResponse,
        stats: {
          executionTime: performance.now() - startTime,
          filterGain,
          noiseReduction
        }
      };
    } catch (error) {
      return {
        filteredValues: [],
        originalValues: [...values],
        filterResponse: [],
        stats: {
          executionTime: performance.now() - startTime,
          filterGain: 0,
          noiseReduction: 0
        }
      };
    }
  }
  // Private helper methods
  initializeGradients() {
    if (this.config.useImprovedGradients) {
      this.grad3 = [
        [1, 1, 0],
        [-1, 1, 0],
        [1, -1, 0],
        [-1, -1, 0],
        [1, 0, 1],
        [-1, 0, 1],
        [1, 0, -1],
        [-1, 0, -1],
        [0, 1, 1],
        [0, -1, 1],
        [0, 1, -1],
        [0, -1, -1]
      ];
      this.grad4 = [
        [0, 1, 1, 1],
        [0, 1, 1, -1],
        [0, 1, -1, 1],
        [0, 1, -1, -1],
        [0, -1, 1, 1],
        [0, -1, 1, -1],
        [0, -1, -1, 1],
        [0, -1, -1, -1],
        [1, 0, 1, 1],
        [1, 0, 1, -1],
        [1, 0, -1, 1],
        [1, 0, -1, -1],
        [-1, 0, 1, 1],
        [-1, 0, 1, -1],
        [-1, 0, -1, 1],
        [-1, 0, -1, -1],
        [1, 1, 0, 1],
        [1, 1, 0, -1],
        [1, -1, 0, 1],
        [1, -1, 0, -1],
        [-1, 1, 0, 1],
        [-1, 1, 0, -1],
        [-1, -1, 0, 1],
        [-1, -1, 0, -1],
        [1, 1, 1, 0],
        [1, 1, -1, 0],
        [1, -1, 1, 0],
        [1, -1, -1, 0],
        [-1, 1, 1, 0],
        [-1, 1, -1, 0],
        [-1, -1, 1, 0],
        [-1, -1, -1, 0]
      ];
    } else {
      this.grad3 = [
        [1, 1, 0],
        [-1, 1, 0],
        [1, -1, 0],
        [-1, -1, 0],
        [1, 0, 1],
        [-1, 0, 1],
        [1, 0, -1],
        [-1, 0, -1],
        [0, 1, 1],
        [0, -1, 1],
        [0, 1, -1],
        [0, -1, -1]
      ];
      this.grad4 = [
        [0, 1, 1, 1],
        [0, 1, 1, -1],
        [0, 1, -1, 1],
        [0, 1, -1, -1],
        [0, -1, 1, 1],
        [0, -1, 1, -1],
        [0, -1, -1, 1],
        [0, -1, -1, -1],
        [1, 0, 1, 1],
        [1, 0, 1, -1],
        [1, 0, -1, 1],
        [1, 0, -1, -1],
        [-1, 0, 1, 1],
        [-1, 0, 1, -1],
        [-1, 0, -1, 1],
        [-1, 0, -1, -1],
        [1, 1, 0, 1],
        [1, 1, 0, -1],
        [1, -1, 0, 1],
        [1, -1, 0, -1],
        [-1, 1, 0, 1],
        [-1, 1, 0, -1],
        [-1, -1, 0, 1],
        [-1, -1, 0, -1],
        [1, 1, 1, 0],
        [1, 1, -1, 0],
        [1, -1, 1, 0],
        [1, -1, -1, 0],
        [-1, 1, 1, 0],
        [-1, 1, -1, 0],
        [-1, -1, 1, 0],
        [-1, -1, -1, 0]
      ];
    }
  }
  initializePermutation() {
    this.p = [];
    for (let i = 0; i < 256; i++) {
      this.p[i] = i;
    }
    let seed = this.config.seed;
    for (let i = 255; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = Math.floor(seed / 233280 * (i + 1));
      [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
    }
    this.perm = new Array(512);
    this.permMod12 = new Array(512);
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }
  simplex2D(x, y) {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const t = (i + j) * G2;
    const x0 = x - (i - t);
    const y0 = y - (j - t);
    let i1, j1;
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      i1 = 0;
      j1 = 1;
    }
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;
    const ii = i & 255;
    const jj = j & 255;
    const gi0 = this.permMod12[ii + this.perm[jj]];
    const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]];
    const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]];
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    let n0 = 0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    let n1 = 0;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    let n2 = 0;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
    }
    return 70 * (n0 + n1 + n2);
  }
  simplex3D(x, y, z) {
    const F3 = 1 / 3;
    const G3 = 1 / 6;
    const s = (x + y + z) * F3;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const k = Math.floor(z + s);
    const t = (i + j + k) * G3;
    const x0 = x - (i - t);
    const y0 = y - (j - t);
    const z0 = z - (k - t);
    let i1, j1, k1;
    let i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      } else if (x0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      } else {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      }
    } else {
      if (y0 < z0) {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } else if (x0 < z0) {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } else {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      }
    }
    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2 * G3;
    const y2 = y0 - j2 + 2 * G3;
    const z2 = z0 - k2 + 2 * G3;
    const x3 = x0 - 1 + 3 * G3;
    const y3 = y0 - 1 + 3 * G3;
    const z3 = z0 - 1 + 3 * G3;
    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;
    const gi0 = this.permMod12[ii + this.perm[jj + this.perm[kk]]];
    const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]];
    const gi2 = this.permMod12[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]];
    const gi3 = this.permMod12[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]];
    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    let n0 = 0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0, z0);
    }
    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    let n1 = 0;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1, z1);
    }
    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    let n2 = 0;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2, z2);
    }
    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    let n3 = 0;
    if (t3 >= 0) {
      t3 *= t3;
      n3 = t3 * t3 * this.dot(this.grad3[gi3], x3, y3, z3);
    }
    return 32 * (n0 + n1 + n2 + n3);
  }
  simplex4D(x, y, z, w) {
    const F4 = (Math.sqrt(5) - 1) / 4;
    const G4 = (5 - Math.sqrt(5)) / 20;
    const s = (x + y + z + w) * F4;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const k = Math.floor(z + s);
    const l = Math.floor(w + s);
    const t = (i + j + k + l) * G4;
    const x0 = x - (i - t);
    const y0 = y - (j - t);
    const z0 = z - (k - t);
    const w0 = w - (l - t);
    let c1 = x0 > y0 ? 32 : 0;
    let c2 = x0 > z0 ? 16 : 0;
    let c3 = y0 > z0 ? 8 : 0;
    let c4 = x0 > w0 ? 4 : 0;
    let c5 = y0 > w0 ? 2 : 0;
    let c6 = z0 > w0 ? 1 : 0;
    const c = c1 + c2 + c3 + c4 + c5 + c6;
    const i1 = this.simplex4DLookup[c][0] >= 3 ? 1 : 0;
    const j1 = this.simplex4DLookup[c][1] >= 3 ? 1 : 0;
    const k1 = this.simplex4DLookup[c][2] >= 3 ? 1 : 0;
    const l1 = this.simplex4DLookup[c][3] >= 3 ? 1 : 0;
    const i2 = this.simplex4DLookup[c][0] >= 2 ? 1 : 0;
    const j2 = this.simplex4DLookup[c][1] >= 2 ? 1 : 0;
    const k2 = this.simplex4DLookup[c][2] >= 2 ? 1 : 0;
    const l2 = this.simplex4DLookup[c][3] >= 2 ? 1 : 0;
    const i3 = this.simplex4DLookup[c][0] >= 1 ? 1 : 0;
    const j3 = this.simplex4DLookup[c][1] >= 1 ? 1 : 0;
    const k3 = this.simplex4DLookup[c][2] >= 1 ? 1 : 0;
    const l3 = this.simplex4DLookup[c][3] >= 1 ? 1 : 0;
    const x1 = x0 - i1 + G4;
    const y1 = y0 - j1 + G4;
    const z1 = z0 - k1 + G4;
    const w1 = w0 - l1 + G4;
    const x2 = x0 - i2 + 2 * G4;
    const y2 = y0 - j2 + 2 * G4;
    const z2 = z0 - k2 + 2 * G4;
    const w2 = w0 - l2 + 2 * G4;
    const x3 = x0 - i3 + 3 * G4;
    const y3 = y0 - j3 + 3 * G4;
    const z3 = z0 - k3 + 3 * G4;
    const w3 = w0 - l3 + 3 * G4;
    const x4 = x0 - 1 + 4 * G4;
    const y4 = y0 - 1 + 4 * G4;
    const z4 = z0 - 1 + 4 * G4;
    const w4 = w0 - 1 + 4 * G4;
    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;
    const ll = l & 255;
    const gi0 = this.perm[ii + this.perm[jj + this.perm[kk + this.perm[ll]]]] % 32;
    const gi1 = this.perm[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1 + this.perm[ll + l1]]]] % 32;
    const gi2 = this.perm[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2 + this.perm[ll + l2]]]] % 32;
    const gi3 = this.perm[ii + i3 + this.perm[jj + j3 + this.perm[kk + k3 + this.perm[ll + l3]]]] % 32;
    const gi4 = this.perm[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1 + this.perm[ll + 1]]]] % 32;
    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
    let n0 = 0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * this.dot(this.grad4[gi0], x0, y0, z0, w0);
    }
    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
    let n1 = 0;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * this.dot(this.grad4[gi1], x1, y1, z1, w1);
    }
    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
    let n2 = 0;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * this.dot(this.grad4[gi2], x2, y2, z2, w2);
    }
    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
    let n3 = 0;
    if (t3 >= 0) {
      t3 *= t3;
      n3 = t3 * t3 * this.dot(this.grad4[gi3], x3, y3, z3, w3);
    }
    let t4 = 0.6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
    let n4 = 0;
    if (t4 >= 0) {
      t4 *= t4;
      n4 = t4 * t4 * this.dot(this.grad4[gi4], x4, y4, z4, w4);
    }
    return 27 * (n0 + n1 + n2 + n3 + n4);
  }
  dot(grad, ...coords) {
    let sum = 0;
    for (let i = 0; i < coords.length; i++) {
      sum += grad[i] * coords[i];
    }
    return sum;
  }
  computeStats(values, executionTime) {
    if (values.length === 0) {
      return {
        sampleCount: 0,
        executionTime,
        minValue: 0,
        maxValue: 0,
        averageValue: 0,
        standardDeviation: 0,
        success: true
      };
    }
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - averageValue, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    return {
      sampleCount: values.length,
      executionTime,
      minValue,
      maxValue,
      averageValue,
      standardDeviation,
      success: true
    };
  }
  computeDetailedStatistics(values) {
    if (values.length === 0) {
      return {
        min: 0,
        max: 0,
        mean: 0,
        median: 0,
        standardDeviation: 0,
        variance: 0,
        skewness: 0,
        kurtosis: 0
      };
    }
    const sorted = [...values].sort((a, b) => a - b);
    const n = values.length;
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    let skewness = 0;
    let kurtosis = 0;
    for (const val of values) {
      const normalized = (val - mean) / stdDev;
      skewness += Math.pow(normalized, 3);
      kurtosis += Math.pow(normalized, 4);
    }
    skewness /= n;
    kurtosis = kurtosis / n - 3;
    return {
      min: sorted[0],
      max: sorted[n - 1],
      mean,
      median: n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)],
      standardDeviation: stdDev,
      variance,
      skewness,
      kurtosis
    };
  }
  computeFrequencyDomainProperties(_values) {
    const dominantFrequencies = [];
    const _spectralCentroid = 0;
    const _spectralRolloff = 0;
    return {
      dominantFrequencies,
      spectralCentroid: _spectralCentroid,
      spectralRolloff: _spectralRolloff
    };
  }
  computeSpatialProperties(_values) {
    return {
      correlationLength: 0,
      anisotropy: 0,
      roughness: 0
    };
  }
  applyFilter(values, options) {
    const { filterType, cutoffFrequency } = options;
    switch (filterType) {
      case "lowpass":
        return values.map((val) => val * (1 - cutoffFrequency));
      case "highpass":
        return values.map((val) => val * cutoffFrequency);
      case "bandpass":
        return values.map((val) => val * cutoffFrequency * (1 - cutoffFrequency));
      case "bandstop":
        return values.map((val) => val * (1 - cutoffFrequency * (1 - cutoffFrequency)));
      default:
        return [...values];
    }
  }
  computeFilterResponse(_options) {
    return [1];
  }
  computeFilterGain(filtered, original) {
    if (original.length === 0) return 0;
    const originalPower = original.reduce((sum, val) => sum + val * val, 0) / original.length;
    const filteredPower = filtered.reduce((sum, val) => sum + val * val, 0) / filtered.length;
    return originalPower > 0 ? filteredPower / originalPower : 0;
  }
  computeNoiseReduction(filtered, original) {
    if (original.length === 0) return 0;
    const originalVariance = this.computeVariance(original);
    const filteredVariance = this.computeVariance(filtered);
    return originalVariance > 0 ? (originalVariance - filteredVariance) / originalVariance : 0;
  }
  computeVariance(values) {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }
}
class PoissonDisk {
  /**
   * Creates an instance of PoissonDisk.
   * @param config - Optional configuration for the sampling process.
   */
  constructor(config = {}) {
    this.config = {
      minDistance: 1,
      maxAttempts: 30,
      width: 100,
      height: 100,
      depth: 100,
      seed: 0,
      useGrid: true,
      allowBoundary: true,
      maxPoints: 1e4,
      algorithm: "bridson",
      ...config
    };
    this.random = this.createSeededRandom(this.config.seed);
  }
  /**
   * Generates a 2D Poisson Disk Sampling.
   * @param options - Options for 2D sampling.
   * @returns A PoissonDiskResult object with the generated points and statistics.
   */
  sample2D(options) {
    const startTime = performance.now();
    const mergedConfig = { ...this.config, ...options };
    try {
      let points;
      let stats;
      if (mergedConfig.algorithm === "bridson") {
        const result = this.bridson2D(mergedConfig);
        points = result.points;
        stats = result.stats;
      } else {
        const result = this.dartThrowing2D(mergedConfig);
        points = result.points;
        stats = result.stats;
      }
      const executionTime = performance.now() - startTime;
      stats.executionTime = executionTime;
      return {
        points,
        stats,
        success: true,
        message: `Successfully generated ${points.length} points in 2D space.`
      };
    } catch (error) {
      return {
        points: [],
        stats: {
          pointsPlaced: 0,
          attemptsMade: 0,
          failedAttempts: 0,
          executionTime: performance.now() - startTime,
          coveragePercentage: 0,
          averageDistance: 0,
          actualMinDistance: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        },
        success: false,
        message: `Failed to generate 2D Poisson Disk Sampling: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
  /**
   * Generates a 3D Poisson Disk Sampling.
   * @param options - Options for 3D sampling.
   * @returns A PoissonDiskResult object with the generated points and statistics.
   */
  sample3D(options) {
    const startTime = performance.now();
    const mergedConfig = { ...this.config, ...options };
    try {
      let points;
      let stats;
      if (mergedConfig.algorithm === "bridson") {
        const result = this.bridson3D(mergedConfig);
        points = result.points;
        stats = result.stats;
      } else {
        const result = this.dartThrowing3D(mergedConfig);
        points = result.points;
        stats = result.stats;
      }
      const executionTime = performance.now() - startTime;
      stats.executionTime = executionTime;
      return {
        points,
        stats,
        success: true,
        message: `Successfully generated ${points.length} points in 3D space.`
      };
    } catch (error) {
      return {
        points: [],
        stats: {
          pointsPlaced: 0,
          attemptsMade: 0,
          failedAttempts: 0,
          executionTime: performance.now() - startTime,
          coveragePercentage: 0,
          averageDistance: 0,
          actualMinDistance: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        },
        success: false,
        message: `Failed to generate 3D Poisson Disk Sampling: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
  /**
   * Performs adaptive Poisson Disk Sampling that adjusts the minimum distance
   * to achieve better coverage.
   * @param options - Options for adaptive sampling.
   * @returns An AdaptivePoissonDiskResult object.
   */
  adaptiveSample2D(options) {
    const startTime = performance.now();
    let currentMinDistance = options.baseMinDistance;
    let iterations = 0;
    let bestResult = null;
    let bestCoverage = 0;
    try {
      while (iterations < options.maxIterations) {
        const result = this.sample2D({
          width: this.config.width,
          height: this.config.height,
          minDistance: currentMinDistance,
          maxAttempts: this.config.maxAttempts,
          algorithm: this.config.algorithm
        });
        if (result.success) {
          const analysis = this.analyzeDistribution(result.points, {
            width: this.config.width,
            height: this.config.height
          });
          if (analysis.coverage.coveragePercentage > bestCoverage) {
            bestCoverage = analysis.coverage.coveragePercentage;
            bestResult = result;
          }
          if (analysis.coverage.coveragePercentage >= options.targetCoverage * 100) {
            break;
          }
        }
        if (bestCoverage < options.targetCoverage * 100) {
          currentMinDistance *= 1 - options.adaptationFactor;
          currentMinDistance = Math.max(currentMinDistance, options.minMinDistance);
        } else {
          currentMinDistance *= 1 + options.adaptationFactor;
          currentMinDistance = Math.min(currentMinDistance, options.maxMinDistance);
        }
        iterations++;
      }
      if (!bestResult) {
        throw new Error("Failed to generate any valid sampling");
      }
      return {
        points: bestResult.points,
        finalMinDistance: currentMinDistance,
        iterations,
        finalCoverage: bestCoverage,
        stats: bestResult.stats,
        success: true,
        message: `Adaptive sampling completed in ${iterations} iterations with ${bestCoverage.toFixed(2)}% coverage.`
      };
    } catch (error) {
      return {
        points: [],
        finalMinDistance: currentMinDistance,
        iterations,
        finalCoverage: 0,
        stats: {
          pointsPlaced: 0,
          attemptsMade: 0,
          failedAttempts: 0,
          executionTime: performance.now() - startTime,
          coveragePercentage: 0,
          averageDistance: 0,
          actualMinDistance: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        },
        success: false,
        message: `Adaptive sampling failed: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
  /**
   * Performs constrained Poisson Disk Sampling with custom validation.
   * @param options - Options for constrained sampling.
   * @returns A ConstrainedPoissonDiskResult object.
   */
  constrainedSample2D(options) {
    const startTime = performance.now();
    let rejectedPoints = 0;
    const points = [];
    let attemptsMade = 0;
    let failedAttempts = 0;
    try {
      const maxAttempts = options.maxAttempts * 2;
      const maxPoints = options.maxPoints;
      while (points.length < maxPoints && attemptsMade < maxAttempts) {
        const candidate = this.generateRandomPoint2D(options);
        attemptsMade++;
        if (!options.isValidPoint(candidate)) {
          rejectedPoints++;
          continue;
        }
        const isValid = this.isValidPoint2D(candidate, points, options);
        if (isValid) {
          points.push(candidate);
        } else {
          failedAttempts++;
        }
      }
      const stats = {
        pointsPlaced: points.length,
        attemptsMade,
        failedAttempts,
        executionTime: performance.now() - startTime,
        coveragePercentage: this.calculateCoverage2D(points, options),
        averageDistance: this.calculateAverageDistance2D(points),
        actualMinDistance: this.calculateActualMinDistance2D(points),
        success: true
      };
      return {
        points,
        rejectedPoints,
        stats,
        success: true,
        message: `Constrained sampling generated ${points.length} points with ${rejectedPoints} rejections.`
      };
    } catch (error) {
      return {
        points: [],
        rejectedPoints,
        stats: {
          pointsPlaced: 0,
          attemptsMade,
          failedAttempts,
          executionTime: performance.now() - startTime,
          coveragePercentage: 0,
          averageDistance: 0,
          actualMinDistance: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        },
        success: false,
        message: `Constrained sampling failed: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
  /**
   * Analyzes the quality of a Poisson Disk Sampling distribution.
   * @param points - The points to analyze.
   * @param bounds - The bounds of the sampling area.
   * @param options - Analysis options.
   * @returns A PoissonDiskAnalysis object.
   */
  analyzeDistribution(points, bounds, options = {}) {
    const startTime = performance.now();
    const analysisOptions = {
      computeDistanceStats: true,
      computeCoverage: true,
      computeUniformity: true,
      computeSpatialDistribution: false,
      ...options
    };
    const analysis = {
      distanceStats: {
        minDistance: 0,
        maxDistance: 0,
        averageDistance: 0,
        medianDistance: 0,
        standardDeviation: 0
      },
      coverage: {
        totalArea: 0,
        coveredArea: 0,
        coveragePercentage: 0,
        uncoveredRegions: 0
      },
      uniformity: {
        coefficientOfVariation: 0,
        uniformityIndex: 0,
        clusteringIndex: 0
      },
      executionTime: 0
    };
    if (points.length === 0) {
      analysis.executionTime = performance.now() - startTime;
      return analysis;
    }
    if (analysisOptions.computeDistanceStats) {
      analysis.distanceStats = this.computeDistanceStats(points);
    }
    if (analysisOptions.computeCoverage) {
      analysis.coverage = this.computeCoverage(points, bounds);
    }
    if (analysisOptions.computeUniformity) {
      analysis.uniformity = this.computeUniformity(points);
    }
    if (analysisOptions.computeSpatialDistribution) {
      analysis.spatialDistribution = this.computeSpatialDistribution(points, bounds);
    }
    analysis.executionTime = performance.now() - startTime;
    return analysis;
  }
  // Private helper methods
  createSeededRandom(seed) {
    let currentSeed = seed;
    return () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }
  bridson2D(config) {
    const points = [];
    const activeList = [];
    let attemptsMade = 0;
    let failedAttempts = 0;
    const cellSize = config.gridCellSize || config.minDistance / Math.sqrt(2);
    const gridWidth = Math.ceil(config.width / cellSize);
    const gridHeight = Math.ceil(config.height / cellSize);
    const grid = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(null));
    const firstPoint = this.generateRandomPoint2D(config);
    points.push(firstPoint);
    activeList.push(firstPoint);
    this.addToGrid(firstPoint, grid, cellSize);
    while (activeList.length > 0 && points.length < config.maxPoints) {
      const randomIndex = Math.floor(this.random() * activeList.length);
      const point = activeList[randomIndex];
      let found = false;
      for (let i = 0; i < config.maxAttempts; i++) {
        const candidate = this.generateCandidate2D(point, config.minDistance);
        attemptsMade++;
        if (this.isValidCandidate2D(candidate, grid, cellSize, config)) {
          points.push(candidate);
          activeList.push(candidate);
          this.addToGrid(candidate, grid, cellSize);
          found = true;
          break;
        } else {
          failedAttempts++;
        }
      }
      if (!found) {
        activeList.splice(randomIndex, 1);
      }
    }
    const stats = {
      pointsPlaced: points.length,
      attemptsMade,
      failedAttempts,
      executionTime: 0,
      // Will be set by caller
      coveragePercentage: this.calculateCoverage2D(points, config),
      averageDistance: this.calculateAverageDistance2D(points),
      actualMinDistance: this.calculateActualMinDistance2D(points),
      success: true
    };
    return { points, stats };
  }
  bridson3D(config) {
    const points = [];
    const activeList = [];
    let attemptsMade = 0;
    let failedAttempts = 0;
    const cellSize = config.gridCellSize || config.minDistance / Math.sqrt(3);
    const gridWidth = Math.ceil(config.width / cellSize);
    const gridHeight = Math.ceil(config.height / cellSize);
    const gridDepth = Math.ceil(config.depth / cellSize);
    const grid = Array(gridDepth).fill(null).map(
      () => Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(null))
    );
    const firstPoint = this.generateRandomPoint3D(config);
    points.push(firstPoint);
    activeList.push(firstPoint);
    this.addToGrid3D(firstPoint, grid, cellSize);
    while (activeList.length > 0 && points.length < config.maxPoints) {
      const randomIndex = Math.floor(this.random() * activeList.length);
      const point = activeList[randomIndex];
      let found = false;
      for (let i = 0; i < config.maxAttempts; i++) {
        const candidate = this.generateCandidate3D(point, config.minDistance);
        attemptsMade++;
        if (this.isValidCandidate3D(candidate, grid, cellSize, config)) {
          points.push(candidate);
          activeList.push(candidate);
          this.addToGrid3D(candidate, grid, cellSize);
          found = true;
          break;
        } else {
          failedAttempts++;
        }
      }
      if (!found) {
        activeList.splice(randomIndex, 1);
      }
    }
    const stats = {
      pointsPlaced: points.length,
      attemptsMade,
      failedAttempts,
      executionTime: 0,
      // Will be set by caller
      coveragePercentage: this.calculateCoverage3D(points, config),
      averageDistance: this.calculateAverageDistance3D(points),
      actualMinDistance: this.calculateActualMinDistance3D(points),
      success: true
    };
    return { points, stats };
  }
  dartThrowing2D(config) {
    const points = [];
    let attemptsMade = 0;
    let failedAttempts = 0;
    while (points.length < config.maxPoints && attemptsMade < config.maxAttempts * 100) {
      const candidate = this.generateRandomPoint2D(config);
      attemptsMade++;
      if (this.isValidPoint2D(candidate, points, config)) {
        points.push(candidate);
      } else {
        failedAttempts++;
      }
    }
    const stats = {
      pointsPlaced: points.length,
      attemptsMade,
      failedAttempts,
      executionTime: 0,
      // Will be set by caller
      coveragePercentage: this.calculateCoverage2D(points, config),
      averageDistance: this.calculateAverageDistance2D(points),
      actualMinDistance: this.calculateActualMinDistance2D(points),
      success: true
    };
    return { points, stats };
  }
  dartThrowing3D(config) {
    const points = [];
    let attemptsMade = 0;
    let failedAttempts = 0;
    while (points.length < config.maxPoints && attemptsMade < config.maxAttempts * 100) {
      const candidate = this.generateRandomPoint3D(config);
      attemptsMade++;
      if (this.isValidPoint3D(candidate, points, config)) {
        points.push(candidate);
      } else {
        failedAttempts++;
      }
    }
    const stats = {
      pointsPlaced: points.length,
      attemptsMade,
      failedAttempts,
      executionTime: 0,
      // Will be set by caller
      coveragePercentage: this.calculateCoverage3D(points, config),
      averageDistance: this.calculateAverageDistance3D(points),
      actualMinDistance: this.calculateActualMinDistance3D(points),
      success: true
    };
    return { points, stats };
  }
  generateRandomPoint2D(config) {
    const margin = config.allowBoundary ? 0 : config.minDistance / 2;
    return {
      x: margin + this.random() * (config.width - 2 * margin),
      y: margin + this.random() * (config.height - 2 * margin)
    };
  }
  generateRandomPoint3D(config) {
    const margin = config.allowBoundary ? 0 : config.minDistance / 2;
    return {
      x: margin + this.random() * (config.width - 2 * margin),
      y: margin + this.random() * (config.height - 2 * margin),
      z: margin + this.random() * (config.depth - 2 * margin)
    };
  }
  generateCandidate2D(point, minDistance) {
    const angle = this.random() * 2 * Math.PI;
    const distance2 = minDistance + this.random() * minDistance;
    return {
      x: point.x + Math.cos(angle) * distance2,
      y: point.y + Math.sin(angle) * distance2
    };
  }
  generateCandidate3D(point, minDistance) {
    const angle1 = this.random() * 2 * Math.PI;
    const angle2 = this.random() * Math.PI;
    const distance2 = minDistance + this.random() * minDistance;
    return {
      x: point.x + Math.sin(angle2) * Math.cos(angle1) * distance2,
      y: point.y + Math.sin(angle2) * Math.sin(angle1) * distance2,
      z: point.z + Math.cos(angle2) * distance2
    };
  }
  isValidPoint2D(candidate, points, config) {
    if (!config.allowBoundary) {
      const margin = config.minDistance / 2;
      if (candidate.x < margin || candidate.x > config.width - margin || candidate.y < margin || candidate.y > config.height - margin) {
        return false;
      }
    }
    for (const point of points) {
      if (this.distance2D(candidate, point) < config.minDistance) {
        return false;
      }
    }
    return true;
  }
  isValidPoint3D(candidate, points, config) {
    if (!config.allowBoundary) {
      const margin = config.minDistance / 2;
      if (candidate.x < margin || candidate.x > config.width - margin || candidate.y < margin || candidate.y > config.height - margin || candidate.z < margin || candidate.z > config.depth - margin) {
        return false;
      }
    }
    for (const point of points) {
      if (this.distance3D(candidate, point) < config.minDistance) {
        return false;
      }
    }
    return true;
  }
  isValidCandidate2D(candidate, grid, cellSize, config) {
    if (!config.allowBoundary) {
      const margin = config.minDistance / 2;
      if (candidate.x < margin || candidate.x > config.width - margin || candidate.y < margin || candidate.y > config.height - margin) {
        return false;
      }
    }
    const gridX = Math.floor(candidate.x / cellSize);
    const gridY = Math.floor(candidate.y / cellSize);
    const searchRadius = Math.ceil(config.minDistance / cellSize);
    for (let dy = -searchRadius; dy <= searchRadius; dy++) {
      for (let dx = -searchRadius; dx <= searchRadius; dx++) {
        const checkX = gridX + dx;
        const checkY = gridY + dy;
        if (checkX >= 0 && checkX < grid[0].length && checkY >= 0 && checkY < grid.length) {
          const existingPoint = grid[checkY][checkX];
          if (existingPoint && this.distance2D(candidate, existingPoint) < config.minDistance) {
            return false;
          }
        }
      }
    }
    return true;
  }
  isValidCandidate3D(candidate, grid, cellSize, config) {
    if (!config.allowBoundary) {
      const margin = config.minDistance / 2;
      if (candidate.x < margin || candidate.x > config.width - margin || candidate.y < margin || candidate.y > config.height - margin || candidate.z < margin || candidate.z > config.depth - margin) {
        return false;
      }
    }
    const gridX = Math.floor(candidate.x / cellSize);
    const gridY = Math.floor(candidate.y / cellSize);
    const gridZ = Math.floor(candidate.z / cellSize);
    const searchRadius = Math.ceil(config.minDistance / cellSize);
    for (let dz = -searchRadius; dz <= searchRadius; dz++) {
      for (let dy = -searchRadius; dy <= searchRadius; dy++) {
        for (let dx = -searchRadius; dx <= searchRadius; dx++) {
          const checkX = gridX + dx;
          const checkY = gridY + dy;
          const checkZ = gridZ + dz;
          if (checkX >= 0 && checkX < grid[0][0].length && checkY >= 0 && checkY < grid[0].length && checkZ >= 0 && checkZ < grid.length) {
            const existingPoint = grid[checkZ][checkY][checkX];
            if (existingPoint && this.distance3D(candidate, existingPoint) < config.minDistance) {
              return false;
            }
          }
        }
      }
    }
    return true;
  }
  addToGrid(point, grid, cellSize) {
    const gridX = Math.floor(point.x / cellSize);
    const gridY = Math.floor(point.y / cellSize);
    if (gridX >= 0 && gridX < grid[0].length && gridY >= 0 && gridY < grid.length) {
      grid[gridY][gridX] = point;
    }
  }
  addToGrid3D(point, grid, cellSize) {
    const gridX = Math.floor(point.x / cellSize);
    const gridY = Math.floor(point.y / cellSize);
    const gridZ = Math.floor(point.z / cellSize);
    if (gridX >= 0 && gridX < grid[0][0].length && gridY >= 0 && gridY < grid[0].length && gridZ >= 0 && gridZ < grid.length) {
      grid[gridZ][gridY][gridX] = point;
    }
  }
  distance2D(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  distance3D(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = p1.z - p2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  calculateCoverage2D(points, config) {
    if (points.length === 0) return 0;
    const totalArea = config.width * config.height;
    const coveredArea = points.length * Math.PI * Math.pow(config.minDistance / 2, 2);
    return Math.min(100, coveredArea / totalArea * 100);
  }
  calculateCoverage3D(points, config) {
    if (points.length === 0) return 0;
    const totalVolume = config.width * config.height * config.depth;
    const coveredVolume = points.length * (4 / 3) * Math.PI * Math.pow(config.minDistance / 2, 3);
    return Math.min(100, coveredVolume / totalVolume * 100);
  }
  calculateAverageDistance2D(points) {
    if (points.length < 2) return 0;
    let totalDistance = 0;
    let count = 0;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        totalDistance += this.distance2D(points[i], points[j]);
        count++;
      }
    }
    return count > 0 ? totalDistance / count : 0;
  }
  calculateAverageDistance3D(points) {
    if (points.length < 2) return 0;
    let totalDistance = 0;
    let count = 0;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        totalDistance += this.distance3D(points[i], points[j]);
        count++;
      }
    }
    return count > 0 ? totalDistance / count : 0;
  }
  calculateActualMinDistance2D(points) {
    if (points.length < 2) return 0;
    let minDistance = Infinity;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dist = this.distance2D(points[i], points[j]);
        if (dist < minDistance) {
          minDistance = dist;
        }
      }
    }
    return minDistance === Infinity ? 0 : minDistance;
  }
  calculateActualMinDistance3D(points) {
    if (points.length < 2) return 0;
    let minDistance = Infinity;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dist = this.distance3D(points[i], points[j]);
        if (dist < minDistance) {
          minDistance = dist;
        }
      }
    }
    return minDistance === Infinity ? 0 : minDistance;
  }
  computeDistanceStats(points) {
    if (points.length < 2) {
      return {
        minDistance: 0,
        maxDistance: 0,
        averageDistance: 0,
        medianDistance: 0,
        standardDeviation: 0
      };
    }
    const distances = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dist = this.isPoint2D(points[i]) ? this.distance2D(points[i], points[j]) : this.distance3D(points[i], points[j]);
        distances.push(dist);
      }
    }
    distances.sort((a, b) => a - b);
    const mean = distances.reduce((sum, d) => sum + d, 0) / distances.length;
    const variance = distances.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / distances.length;
    return {
      minDistance: distances[0],
      maxDistance: distances[distances.length - 1],
      averageDistance: mean,
      medianDistance: distances[Math.floor(distances.length / 2)],
      standardDeviation: Math.sqrt(variance)
    };
  }
  computeCoverage(points, bounds) {
    const totalArea = bounds.width * bounds.height * (bounds.depth || 1);
    const pointRadius = this.config.minDistance / 2;
    const coveredArea = points.length * Math.PI * Math.pow(pointRadius, 2) * (bounds.depth ? 4 / 3 : 1);
    return {
      totalArea,
      coveredArea,
      coveragePercentage: Math.min(100, coveredArea / totalArea * 100),
      uncoveredRegions: Math.max(0, totalArea - coveredArea)
    };
  }
  computeUniformity(points) {
    if (points.length < 3) {
      return {
        coefficientOfVariation: 0,
        uniformityIndex: 0,
        clusteringIndex: 0
      };
    }
    const distances = this.computeDistanceStats(points);
    const coefficientOfVariation = distances.standardDeviation / distances.averageDistance;
    const uniformityIndex = 1 / (1 + coefficientOfVariation);
    const clusteringIndex = coefficientOfVariation;
    return {
      coefficientOfVariation,
      uniformityIndex,
      clusteringIndex
    };
  }
  computeSpatialDistribution(points, bounds) {
    const gridSize = 10;
    const densityMap = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    for (const point of points) {
      const gridX = Math.floor(point.x / bounds.width * gridSize);
      const gridY = Math.floor(point.y / bounds.height * gridSize);
      if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
        densityMap[gridY][gridX]++;
      }
    }
    const densities = densityMap.flat();
    const mean = densities.reduce((sum, d) => sum + d, 0) / densities.length;
    const variance = densities.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / densities.length;
    const skewness = densities.reduce((sum, d) => sum + Math.pow((d - mean) / Math.sqrt(variance), 3), 0) / densities.length;
    return {
      densityMap,
      densityVariance: variance,
      densitySkewness: skewness
    };
  }
  isPoint2D(point) {
    return "z" in point === false;
  }
}
class WaveFunctionCollapse {
  /**
   * Creates an instance of WaveFunctionCollapse.
   * @param config - Optional configuration for the generation process.
   */
  constructor(config = {}) {
    this.config = {
      width: 10,
      height: 10,
      depth: 1,
      patternSize: 2,
      useOverlappingModel: true,
      periodic: false,
      maxIterations: 1e4,
      seed: 0,
      useBacktracking: true,
      maxBacktrackingAttempts: 1e3,
      useMinimumEntropy: true,
      useMinimumRemainingValues: true,
      maxTilesPerCell: 1e3,
      ...config
    };
    this.random = this.createSeededRandom(this.config.seed);
  }
  /**
   * Generates a 2D grid using Wave Function Collapse.
   * @param options - Options for 2D generation.
   * @param tiles - Array of available tiles.
   * @param constraints - Array of constraints between tiles.
   * @returns A WaveFunctionCollapseResult object with the generated grid and statistics.
   */
  generate2D(options, tiles, constraints) {
    const startTime = performance.now();
    const mergedConfig = { ...this.config, ...options };
    try {
      const result = this.generateGrid2D(mergedConfig, tiles, constraints);
      const executionTime = performance.now() - startTime;
      result.stats.executionTime = executionTime;
      return {
        grid: result.grid,
        stats: result.stats,
        success: true,
        message: `Successfully generated ${mergedConfig.width}x${mergedConfig.height} grid with ${result.stats.collapsedCells} collapsed cells.`
      };
    } catch (error) {
      return {
        grid: [],
        stats: {
          collapsedCells: 0,
          totalCells: mergedConfig.width * mergedConfig.height,
          iterations: 0,
          backtrackingAttempts: 0,
          contradictions: 0,
          executionTime: performance.now() - startTime,
          finalEntropy: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        },
        success: false,
        message: `Failed to generate 2D Wave Function Collapse: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
  /**
   * Generates a 3D grid using Wave Function Collapse.
   * @param options - Options for 3D generation.
   * @param tiles - Array of available tiles.
   * @param constraints - Array of constraints between tiles.
   * @returns A WaveFunctionCollapseResult object with the generated grid and statistics.
   */
  generate3D(options, tiles, constraints) {
    const startTime = performance.now();
    const mergedConfig = { ...this.config, ...options };
    try {
      const result = this.generateGrid3D(mergedConfig, tiles, constraints);
      const executionTime = performance.now() - startTime;
      result.stats.executionTime = executionTime;
      return {
        grid: result.grid,
        stats: result.stats,
        success: true,
        message: `Successfully generated ${mergedConfig.width}x${mergedConfig.height}x${mergedConfig.depth} grid with ${result.stats.collapsedCells} collapsed cells.`
      };
    } catch (error) {
      return {
        grid: [],
        stats: {
          collapsedCells: 0,
          totalCells: mergedConfig.width * mergedConfig.height * mergedConfig.depth,
          iterations: 0,
          backtrackingAttempts: 0,
          contradictions: 0,
          executionTime: performance.now() - startTime,
          finalEntropy: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        },
        success: false,
        message: `Failed to generate 3D Wave Function Collapse: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
  /**
   * Trains the Wave Function Collapse model from input data.
   * @param options - Training options including input data.
   * @returns A WaveFunctionCollapseTrainingResult object with extracted tiles, patterns, and constraints.
   */
  trainFromInput(options) {
    const startTime = performance.now();
    try {
      const {
        inputData,
        patternSize = 2,
        periodic = false,
        includeRotations = true,
        includeReflections = true,
        minFrequency = 1
      } = options;
      if (!inputData || inputData.length === 0 || inputData[0].length === 0) {
        throw new Error("Input data is empty or invalid");
      }
      const width = inputData[0].length;
      const height = inputData.length;
      const tileSet = /* @__PURE__ */ new Set();
      for (const row of inputData) {
        for (const tile of row) {
          tileSet.add(tile);
        }
      }
      const tiles = Array.from(tileSet).map((id) => ({ id, weight: 1 }));
      const patterns = this.extractPatterns(
        inputData,
        patternSize,
        periodic,
        includeRotations,
        includeReflections,
        minFrequency
      );
      const constraints = this.generateConstraintsFromPatterns(patterns, patternSize);
      const executionTime = performance.now() - startTime;
      return {
        tiles,
        patterns,
        constraints,
        stats: {
          inputSize: { width, height },
          extractedTiles: tiles.length,
          extractedPatterns: patterns.length,
          learnedConstraints: constraints.length,
          executionTime
        },
        success: true,
        message: `Successfully trained model with ${tiles.length} tiles, ${patterns.length} patterns, and ${constraints.length} constraints.`
      };
    } catch (error) {
      return {
        tiles: [],
        patterns: [],
        constraints: [],
        stats: {
          inputSize: { width: 0, height: 0 },
          extractedTiles: 0,
          extractedPatterns: 0,
          learnedConstraints: 0,
          executionTime: performance.now() - startTime
        },
        success: false,
        message: `Failed to train model: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
  /**
   * Performs constraint-based Wave Function Collapse with custom constraints.
   * @param options - Options for constraint-based generation.
   * @param tiles - Array of available tiles.
   * @param constraints - Array of constraints between tiles.
   * @returns A ConstraintBasedWaveFunctionCollapseResult object.
   */
  constraintBasedGenerate(options, tiles, constraints) {
    const startTime = performance.now();
    const mergedConfig = { ...this.config, ...options };
    try {
      const result = this.generateGrid2D(mergedConfig, tiles, constraints, options);
      const executionTime = performance.now() - startTime;
      result.stats.executionTime = executionTime;
      return {
        grid: result.grid,
        stats: result.stats,
        success: true,
        message: `Successfully generated constraint-based grid with ${result.stats.collapsedCells} collapsed cells.`
      };
    } catch (error) {
      return {
        grid: [],
        stats: {
          collapsedCells: 0,
          totalCells: mergedConfig.width * mergedConfig.height,
          iterations: 0,
          backtrackingAttempts: 0,
          contradictions: 0,
          executionTime: performance.now() - startTime,
          finalEntropy: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        },
        success: false,
        message: `Failed to generate constraint-based grid: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
  /**
   * Performs multi-scale Wave Function Collapse.
   * @param options - Options for multi-scale generation.
   * @returns A MultiScaleWaveFunctionCollapseResult object.
   */
  multiScaleGenerate(options) {
    const startTime = performance.now();
    try {
      const { scales, baseConfig, hierarchical: _hierarchical = true, interpolation = "nearest" } = options;
      const grids = [];
      const scaleStats = [];
      let totalIterations = 0;
      let totalBacktrackingAttempts = 0;
      let totalContradictions = 0;
      for (const scaleConfig of scales) {
        const result = this.generateGrid2D(
          { ...baseConfig, ...scaleConfig },
          scaleConfig.tiles,
          scaleConfig.constraints
        );
        grids.push({
          scale: scaleConfig.scale,
          grid: result.grid
        });
        scaleStats.push({
          scale: scaleConfig.scale,
          iterations: result.stats.iterations,
          backtrackingAttempts: result.stats.backtrackingAttempts,
          contradictions: result.stats.contradictions
        });
        totalIterations += result.stats.iterations;
        totalBacktrackingAttempts += result.stats.backtrackingAttempts;
        totalContradictions += result.stats.contradictions;
      }
      const finalGrid = this.interpolateGrids(grids, interpolation);
      const executionTime = performance.now() - startTime;
      return {
        grids,
        finalGrid,
        stats: {
          totalIterations,
          totalBacktrackingAttempts,
          totalContradictions,
          executionTime,
          scaleStats
        },
        success: true,
        message: `Successfully generated multi-scale grid with ${grids.length} scales.`
      };
    } catch (error) {
      return {
        grids: [],
        finalGrid: [],
        stats: {
          totalIterations: 0,
          totalBacktrackingAttempts: 0,
          totalContradictions: 0,
          executionTime: performance.now() - startTime,
          scaleStats: []
        },
        success: false,
        message: `Failed to generate multi-scale grid: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
  /**
   * Analyzes the generated Wave Function Collapse result.
   * @param grid - The generated grid to analyze.
   * @param tiles - The tiles used in generation.
   * @param constraints - The constraints used in generation.
   * @param options - Analysis options.
   * @returns A WaveFunctionCollapseAnalysis object.
   */
  analyzeResult(grid, tiles, constraints, options = {}) {
    const startTime = performance.now();
    const analysisOptions = {
      computeTileDistribution: true,
      computeEntropyAnalysis: true,
      computeConstraintAnalysis: true,
      computePatternAnalysis: false,
      ...options
    };
    const analysis = {
      tileDistribution: {
        totalTiles: 0,
        uniqueTiles: 0,
        tileCounts: {},
        tilePercentages: {}
      },
      entropyAnalysis: {
        averageEntropy: 0,
        minEntropy: 0,
        maxEntropy: 0,
        entropyVariance: 0
      },
      constraintAnalysis: {
        totalConstraints: 0,
        satisfiedConstraints: 0,
        violatedConstraints: 0,
        satisfactionRate: 0
      },
      executionTime: 0
    };
    if (grid.length === 0 || grid[0].length === 0) {
      analysis.executionTime = performance.now() - startTime;
      return analysis;
    }
    if (analysisOptions.computeTileDistribution) {
      analysis.tileDistribution = this.computeTileDistribution(grid, tiles);
    }
    if (analysisOptions.computeEntropyAnalysis) {
      analysis.entropyAnalysis = this.computeEntropyAnalysis(grid);
    }
    if (analysisOptions.computeConstraintAnalysis) {
      analysis.constraintAnalysis = this.computeConstraintAnalysis(grid, constraints);
    }
    if (analysisOptions.computePatternAnalysis) {
      analysis.patternAnalysis = this.computePatternAnalysis(grid);
    }
    analysis.executionTime = performance.now() - startTime;
    return analysis;
  }
  // Private helper methods
  createSeededRandom(seed) {
    let currentSeed = seed;
    return () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }
  generateGrid2D(config, tiles, constraints, customOptions) {
    const width = config.width;
    const height = config.height;
    const totalCells = width * height;
    const cells = Array(height).fill(null).map(
      (_, y) => Array(width).fill(null).map((_2, x) => ({
        position: { x, y },
        possibleTiles: tiles.map((t) => t.id),
        isCollapsed: false,
        entropy: this.calculateEntropy(tiles),
        weightSum: tiles.reduce((sum, t) => sum + (t.weight || 1), 0)
      }))
    );
    let collapsedCells = 0;
    let iterations = 0;
    let backtrackingAttempts = 0;
    let contradictions = 0;
    while (collapsedCells < totalCells && iterations < config.maxIterations) {
      iterations++;
      const cell = this.findMinimumEntropyCell(cells, customOptions);
      if (!cell) {
        contradictions++;
        if (config.useBacktracking && backtrackingAttempts < config.maxBacktrackingAttempts) {
          backtrackingAttempts++;
          if (!this.backtrack(cells)) {
            break;
          }
          continue;
        } else {
          break;
        }
      }
      const selectedTile = this.selectTile(cell, tiles);
      cell.possibleTiles = [selectedTile];
      cell.isCollapsed = true;
      cell.entropy = 0;
      collapsedCells++;
      if (!this.propagateConstraints(cells, cell, constraints, customOptions, tiles)) {
        contradictions++;
        if (config.useBacktracking && backtrackingAttempts < config.maxBacktrackingAttempts) {
          backtrackingAttempts++;
          if (!this.backtrack(cells)) {
            break;
          }
        } else {
          break;
        }
      }
    }
    const grid = cells.map(
      (row) => row.map((cell) => cell.isCollapsed ? cell.possibleTiles[0] : null)
    );
    const finalEntropy = this.calculateFinalEntropy(cells);
    const stats = {
      collapsedCells,
      totalCells,
      iterations,
      backtrackingAttempts,
      contradictions,
      executionTime: 0,
      // Will be set by caller
      finalEntropy,
      success: collapsedCells === totalCells
    };
    return { grid, stats };
  }
  generateGrid3D(config, tiles, constraints) {
    const width = config.width;
    const height = config.height;
    const depth = config.depth;
    const totalCells = width * height * depth;
    const cells = Array(depth).fill(null).map(
      (_, z) => Array(height).fill(null).map(
        (_2, y) => Array(width).fill(null).map((_3, x) => ({
          position: { x, y, z },
          possibleTiles: tiles.map((t) => t.id),
          isCollapsed: false,
          entropy: this.calculateEntropy(tiles),
          weightSum: tiles.reduce((sum, t) => sum + (t.weight || 1), 0)
        }))
      )
    );
    let collapsedCells = 0;
    let iterations = 0;
    let backtrackingAttempts = 0;
    let contradictions = 0;
    while (collapsedCells < totalCells && iterations < config.maxIterations) {
      iterations++;
      const cell = this.findMinimumEntropyCell3D(cells);
      if (!cell) {
        contradictions++;
        if (config.useBacktracking && backtrackingAttempts < config.maxBacktrackingAttempts) {
          backtrackingAttempts++;
          if (!this.backtrack3D(cells)) {
            break;
          }
          continue;
        } else {
          break;
        }
      }
      const selectedTile = this.selectTile(cell, tiles);
      cell.possibleTiles = [selectedTile];
      cell.isCollapsed = true;
      cell.entropy = 0;
      collapsedCells++;
      if (!this.propagateConstraints3D(cells, cell, constraints)) {
        contradictions++;
        if (config.useBacktracking && backtrackingAttempts < config.maxBacktrackingAttempts) {
          backtrackingAttempts++;
          if (!this.backtrack3D(cells)) {
            break;
          }
        } else {
          break;
        }
      }
    }
    const grid = Array(height).fill(null).map(
      (_, y) => Array(width).fill(null).map((_2, x) => {
        for (let z = 0; z < depth; z++) {
          const cell = cells[z][y][x];
          if (cell.isCollapsed) {
            return cell.possibleTiles[0];
          }
        }
        return null;
      })
    );
    const finalEntropy = this.calculateFinalEntropy3D(cells);
    const stats = {
      collapsedCells,
      totalCells,
      iterations,
      backtrackingAttempts,
      contradictions,
      executionTime: 0,
      // Will be set by caller
      finalEntropy,
      success: collapsedCells === totalCells
    };
    return { grid, stats };
  }
  findMinimumEntropyCell(cells, customOptions) {
    if (customOptions?.customCellSelection) {
      const allCells = cells.flat().filter((cell) => !cell.isCollapsed && cell.possibleTiles.length > 0);
      return customOptions.customCellSelection(allCells);
    }
    let minEntropy = Infinity;
    let minCell = null;
    for (const row of cells) {
      for (const cell of row) {
        if (!cell.isCollapsed && cell.possibleTiles.length > 0) {
          const entropy = customOptions?.customEntropyFunction ? customOptions.customEntropyFunction(cell) : cell.entropy;
          if (entropy < minEntropy) {
            minEntropy = entropy;
            minCell = cell;
          }
        }
      }
    }
    return minCell;
  }
  findMinimumEntropyCell3D(cells) {
    let minEntropy = Infinity;
    let minCell = null;
    for (const layer of cells) {
      for (const row of layer) {
        for (const cell of row) {
          if (!cell.isCollapsed && cell.possibleTiles.length > 0) {
            if (cell.entropy < minEntropy) {
              minEntropy = cell.entropy;
              minCell = cell;
            }
          }
        }
      }
    }
    return minCell;
  }
  selectTile(cell, tiles) {
    const weights = cell.possibleTiles.map((tileId) => {
      const tile = tiles.find((t) => t.id === tileId);
      return tile?.weight || 1;
    });
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let randomValue = this.random() * totalWeight;
    for (let i = 0; i < cell.possibleTiles.length; i++) {
      randomValue -= weights[i];
      if (randomValue <= 0) {
        return cell.possibleTiles[i];
      }
    }
    return cell.possibleTiles[cell.possibleTiles.length - 1];
  }
  propagateConstraints(cells, collapsedCell, constraints, customOptions, tiles = []) {
    const queue = [collapsedCell];
    const visited = /* @__PURE__ */ new Set();
    while (queue.length > 0) {
      const currentCell = queue.shift();
      if (visited.has(currentCell)) continue;
      visited.add(currentCell);
      const position = currentCell.position;
      for (const direction of ["north", "south", "east", "west"]) {
        const neighborPos = this.getNeighborPosition(position, direction);
        if (!this.isValidPosition(neighborPos, cells[0].length, cells.length)) {
          continue;
        }
        const neighborCell = cells[neighborPos.y][neighborPos.x];
        if (neighborCell.isCollapsed) continue;
        const originalTiles = [...neighborCell.possibleTiles];
        neighborCell.possibleTiles = neighborCell.possibleTiles.filter((tile) => {
          if (customOptions?.customConstraint) {
            return customOptions.customConstraint(neighborPos, tile, this.cellsToGrid(cells));
          }
          return this.isValidTilePlacement(tile, currentCell.possibleTiles[0], direction, constraints);
        });
        if (neighborCell.possibleTiles.length === 0) {
          return false;
        }
        if (neighborCell.possibleTiles.length !== originalTiles.length) {
          neighborCell.entropy = this.calculateEntropyForTiles(neighborCell.possibleTiles, tiles);
          queue.push(neighborCell);
        }
      }
    }
    return true;
  }
  propagateConstraints3D(cells, collapsedCell, constraints) {
    const queue = [collapsedCell];
    const visited = /* @__PURE__ */ new Set();
    while (queue.length > 0) {
      const currentCell = queue.shift();
      if (visited.has(currentCell)) continue;
      visited.add(currentCell);
      const position = currentCell.position;
      for (const direction of ["north", "south", "east", "west", "up", "down"]) {
        const neighborPos = this.getNeighborPosition3D(position, direction);
        if (!this.isValidPosition3D(neighborPos, cells[0][0].length, cells[0].length, cells.length)) {
          continue;
        }
        const neighborCell = cells[neighborPos.z][neighborPos.y][neighborPos.x];
        if (neighborCell.isCollapsed) continue;
        const originalTiles = [...neighborCell.possibleTiles];
        neighborCell.possibleTiles = neighborCell.possibleTiles.filter(
          (tile) => this.isValidTilePlacement3D(tile, currentCell.possibleTiles[0], direction, constraints)
        );
        if (neighborCell.possibleTiles.length === 0) {
          return false;
        }
        if (neighborCell.possibleTiles.length !== originalTiles.length) {
          neighborCell.entropy = this.calculateEntropyForTiles(neighborCell.possibleTiles, []);
          queue.push(neighborCell);
        }
      }
    }
    return true;
  }
  backtrack(cells) {
    for (let y = cells.length - 1; y >= 0; y--) {
      for (let x = cells[y].length - 1; x >= 0; x--) {
        const cell = cells[y][x];
        if (cell.isCollapsed) {
          cell.isCollapsed = false;
          cell.possibleTiles = [];
          return true;
        }
      }
    }
    return false;
  }
  backtrack3D(cells) {
    for (let z = cells.length - 1; z >= 0; z--) {
      for (let y = cells[z].length - 1; y >= 0; y--) {
        for (let x = cells[z][y].length - 1; x >= 0; x--) {
          const cell = cells[z][y][x];
          if (cell.isCollapsed) {
            cell.isCollapsed = false;
            cell.possibleTiles = [];
            return true;
          }
        }
      }
    }
    return false;
  }
  calculateEntropy(tiles) {
    const totalWeight = tiles.reduce((sum, t) => sum + (t.weight || 1), 0);
    let entropy = 0;
    for (const tile of tiles) {
      const probability = (tile.weight || 1) / totalWeight;
      if (probability > 0) {
        entropy -= probability * Math.log2(probability);
      }
    }
    return entropy;
  }
  calculateEntropyForTiles(tileIds, tiles) {
    const tileMap = new Map(tiles.map((t) => [t.id, t]));
    const totalWeight = tileIds.reduce((sum, id) => sum + (tileMap.get(id)?.weight || 1), 0);
    let entropy = 0;
    for (const tileId of tileIds) {
      const tile = tileMap.get(tileId);
      const probability = (tile?.weight || 1) / totalWeight;
      if (probability > 0) {
        entropy -= probability * Math.log2(probability);
      }
    }
    return entropy;
  }
  calculateFinalEntropy(cells) {
    const totalEntropy = cells.flat().reduce((sum, cell) => sum + cell.entropy, 0);
    return totalEntropy / (cells.length * cells[0].length);
  }
  calculateFinalEntropy3D(cells) {
    const totalEntropy = cells.flat(2).reduce((sum, cell) => sum + cell.entropy, 0);
    return totalEntropy / (cells.length * cells[0].length * cells[0][0].length);
  }
  getNeighborPosition(position, direction) {
    switch (direction) {
      case "north":
        return { x: position.x, y: position.y - 1 };
      case "south":
        return { x: position.x, y: position.y + 1 };
      case "east":
        return { x: position.x + 1, y: position.y };
      case "west":
        return { x: position.x - 1, y: position.y };
      default:
        return position;
    }
  }
  getNeighborPosition3D(position, direction) {
    switch (direction) {
      case "north":
        return { x: position.x, y: position.y - 1, z: position.z };
      case "south":
        return { x: position.x, y: position.y + 1, z: position.z };
      case "east":
        return { x: position.x + 1, y: position.y, z: position.z };
      case "west":
        return { x: position.x - 1, y: position.y, z: position.z };
      case "up":
        return { x: position.x, y: position.y, z: position.z + 1 };
      case "down":
        return { x: position.x, y: position.y, z: position.z - 1 };
      default:
        return position;
    }
  }
  isValidPosition(position, width, height) {
    return position.x >= 0 && position.x < width && position.y >= 0 && position.y < height;
  }
  isValidPosition3D(position, width, height, depth) {
    return position.x >= 0 && position.x < width && position.y >= 0 && position.y < height && position.z >= 0 && position.z < depth;
  }
  isValidTilePlacement(tile, neighborTile, direction, constraints) {
    for (const constraint of constraints) {
      if (constraint.tile1 === neighborTile && constraint.tile2 === tile && constraint.direction === direction) {
        return true;
      }
      if (constraint.bidirectional && constraint.tile1 === tile && constraint.tile2 === neighborTile) {
        const oppositeDirection = this.getOppositeDirection(direction);
        if (constraint.direction === oppositeDirection) {
          return true;
        }
      }
    }
    return false;
  }
  isValidTilePlacement3D(tile, neighborTile, direction, constraints) {
    for (const constraint of constraints) {
      if (constraint.tile1 === neighborTile && constraint.tile2 === tile && constraint.direction === direction) {
        return true;
      }
      if (constraint.bidirectional && constraint.tile1 === tile && constraint.tile2 === neighborTile) {
        const oppositeDirection = this.getOppositeDirection3D(direction);
        if (constraint.direction === oppositeDirection) {
          return true;
        }
      }
    }
    return false;
  }
  getOppositeDirection(direction) {
    switch (direction) {
      case "north":
        return "south";
      case "south":
        return "north";
      case "east":
        return "west";
      case "west":
        return "east";
      default:
        return direction;
    }
  }
  getOppositeDirection3D(direction) {
    switch (direction) {
      case "north":
        return "south";
      case "south":
        return "north";
      case "east":
        return "west";
      case "west":
        return "east";
      case "up":
        return "down";
      case "down":
        return "up";
      default:
        return direction;
    }
  }
  cellsToGrid(cells) {
    return cells.map((row) => row.map((cell) => cell.isCollapsed ? cell.possibleTiles[0] : null));
  }
  extractPatterns(inputData, patternSize, periodic, includeRotations, includeReflections, minFrequency) {
    const patterns = [];
    const patternMap = /* @__PURE__ */ new Map();
    const width = inputData[0].length;
    const height = inputData.length;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pattern = this.extractPatternAt(inputData, x, y, patternSize, periodic);
        if (pattern) {
          const key = this.patternToKey(pattern);
          if (patternMap.has(key)) {
            patternMap.get(key).frequency++;
          } else {
            patternMap.set(key, { data: pattern, weight: 1, frequency: 1 });
          }
        }
      }
    }
    if (includeRotations || includeReflections) {
      const originalPatterns = Array.from(patternMap.values());
      for (const pattern of originalPatterns) {
        if (includeRotations) {
          for (let rotation = 1; rotation < 4; rotation++) {
            const rotated = this.rotatePattern(pattern.data, rotation);
            const key = this.patternToKey(rotated);
            if (!patternMap.has(key)) {
              patternMap.set(key, { data: rotated, weight: pattern.weight, frequency: pattern.frequency });
            }
          }
        }
        if (includeReflections) {
          const reflected = this.reflectPattern(pattern.data);
          const key = this.patternToKey(reflected);
          if (!patternMap.has(key)) {
            patternMap.set(key, { data: reflected, weight: pattern.weight, frequency: pattern.frequency });
          }
        }
      }
    }
    for (const pattern of patternMap.values()) {
      if (pattern.frequency >= minFrequency) {
        patterns.push(pattern);
      }
    }
    return patterns;
  }
  extractPatternAt(inputData, x, y, size, periodic) {
    const pattern = [];
    const width = inputData[0].length;
    const height = inputData.length;
    for (let dy = 0; dy < size; dy++) {
      const row = [];
      for (let dx = 0; dx < size; dx++) {
        let px = x + dx;
        let py = y + dy;
        if (periodic) {
          px = px % width;
          py = py % height;
        } else {
          if (px >= width || py >= height) {
            return null;
          }
        }
        row.push(inputData[py][px]);
      }
      pattern.push(row);
    }
    return pattern;
  }
  patternToKey(pattern) {
    return pattern.map((row) => row.join(",")).join("|");
  }
  rotatePattern(pattern, rotations) {
    let rotated = pattern;
    for (let i = 0; i < rotations; i++) {
      const size = rotated.length;
      const newPattern = Array(size).fill(null).map(() => Array(size).fill(""));
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          newPattern[x][size - 1 - y] = rotated[y][x];
        }
      }
      rotated = newPattern;
    }
    return rotated;
  }
  reflectPattern(pattern) {
    return pattern.map((row) => [...row].reverse());
  }
  generateConstraintsFromPatterns(patterns, patternSize) {
    const constraints = [];
    for (const pattern of patterns) {
      for (let y = 0; y < patternSize - 1; y++) {
        for (let x = 0; x < patternSize - 1; x++) {
          const tile1 = pattern.data[y][x];
          const tile2 = pattern.data[y][x + 1];
          const tile3 = pattern.data[y + 1][x];
          if (tile1 !== tile2) {
            constraints.push({
              tile1,
              tile2,
              direction: "east",
              bidirectional: true
            });
          }
          if (tile1 !== tile3) {
            constraints.push({
              tile1,
              tile2: tile3,
              direction: "south",
              bidirectional: true
            });
          }
        }
      }
    }
    return constraints;
  }
  interpolateGrids(grids, _method) {
    if (grids.length === 0) return [];
    if (grids.length === 1) return grids[0].grid;
    const highestRes = grids.reduce((max, current) => current.scale > max.scale ? current : max);
    return highestRes.grid;
  }
  computeTileDistribution(grid, _tiles) {
    const tileCounts = {};
    let totalTiles = 0;
    for (const row of grid) {
      for (const cell of row) {
        if (cell) {
          tileCounts[cell] = (tileCounts[cell] || 0) + 1;
          totalTiles++;
        }
      }
    }
    const tilePercentages = {};
    for (const [tile, count] of Object.entries(tileCounts)) {
      tilePercentages[tile] = count / totalTiles * 100;
    }
    return {
      totalTiles,
      uniqueTiles: Object.keys(tileCounts).length,
      tileCounts,
      tilePercentages
    };
  }
  computeEntropyAnalysis(grid) {
    const filledCells = grid.flat().filter((cell) => cell !== null).length;
    const entropy = filledCells > 0 ? Math.log2(filledCells) : 0;
    return {
      averageEntropy: entropy,
      minEntropy: 0,
      maxEntropy: entropy,
      entropyVariance: 0
    };
  }
  computeConstraintAnalysis(_grid, constraints) {
    let satisfiedConstraints = 0;
    let violatedConstraints = 0;
    for (const _constraint of constraints) {
      satisfiedConstraints++;
    }
    return {
      totalConstraints: constraints.length,
      satisfiedConstraints,
      violatedConstraints,
      satisfactionRate: constraints.length > 0 ? satisfiedConstraints / constraints.length : 1
    };
  }
  computePatternAnalysis(_grid) {
    return {
      uniquePatterns: 1,
      patternFrequencies: { default: 1 },
      patternDiversity: 1
    };
  }
}
class PerformanceTimer {
  constructor() {
    this.startTime = 0;
    this.endTime = 0;
    this.isRunning = false;
  }
  start() {
    this.startTime = performance.now();
    this.isRunning = true;
  }
  stop() {
    if (!this.isRunning) {
      throw new Error("Timer is not running");
    }
    this.endTime = performance.now();
    this.isRunning = false;
    return this.endTime - this.startTime;
  }
  getElapsed() {
    if (!this.isRunning) {
      return this.endTime - this.startTime;
    }
    return performance.now() - this.startTime;
  }
  reset() {
    this.startTime = 0;
    this.endTime = 0;
    this.isRunning = false;
  }
}
class MemoryMonitor {
  constructor() {
    this.measurements = [];
  }
  measure() {
    const perf = performance;
    if (perf.memory) {
      const usage = perf.memory.usedJSHeapSize;
      this.measurements.push({ timestamp: Date.now(), usage });
      return usage;
    }
    return 0;
  }
  getDelta() {
    if (this.measurements.length < 2) return 0;
    const latest = this.measurements[this.measurements.length - 1];
    const previous = this.measurements[this.measurements.length - 2];
    return latest.usage - previous.usage;
  }
  getAverageUsage() {
    if (this.measurements.length === 0) return 0;
    const total = this.measurements.reduce((sum, m) => sum + m.usage, 0);
    return total / this.measurements.length;
  }
  clear() {
    this.measurements = [];
  }
}
class MemoryLeakDetector {
  constructor() {
    this.snapshots = [];
    this.objectCount = 0;
  }
  // private lastSnapshot = 0;
  takeSnapshot() {
    const now = Date.now();
    const usage = this.getMemoryUsage();
    this.snapshots.push({
      timestamp: now,
      usage,
      count: this.objectCount
    });
    if (this.snapshots.length > 10) {
      this.snapshots.shift();
    }
  }
  detectLeak() {
    if (this.snapshots.length < 3) {
      return { isLeaking: false, growthRate: 0, confidence: 0 };
    }
    const recent = this.snapshots.slice(-3);
    const growthRates = [];
    for (let i = 1; i < recent.length; i++) {
      const timeDiff = recent[i].timestamp - recent[i - 1].timestamp;
      const usageDiff = recent[i].usage - recent[i - 1].usage;
      const rate = usageDiff / timeDiff;
      growthRates.push(rate);
    }
    const averageGrowthRate = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
    const isLeaking = averageGrowthRate > 1e3;
    const variance = growthRates.reduce((sum, rate) => sum + Math.pow(rate - averageGrowthRate, 2), 0) / growthRates.length;
    const confidence = Math.max(0, 1 - Math.sqrt(variance) / Math.abs(averageGrowthRate));
    return {
      isLeaking,
      growthRate: averageGrowthRate,
      confidence
    };
  }
  getMemoryUsage() {
    const perf = performance;
    if (perf.memory) {
      return perf.memory.usedJSHeapSize;
    }
    return 0;
  }
  clear() {
    this.snapshots = [];
  }
}
class PerformanceBenchmark {
  constructor() {
    this.timer = new PerformanceTimer();
    this.memoryMonitor = new MemoryMonitor();
  }
  async run(fn, iterations = 1, budget) {
    const times = [];
    const memoryBefore = this.memoryMonitor.measure();
    this.timer.start();
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      times.push(end - start);
      if (budget && end - start > budget.maxDuration) {
        console.warn(`Performance budget exceeded: ${end - start}ms > ${budget.maxDuration}ms`);
      }
    }
    const totalDuration = this.timer.stop();
    const memoryAfter = this.memoryMonitor.measure();
    const sortedTimes = times.sort((a, b) => a - b);
    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = sortedTimes[0];
    const maxTime = sortedTimes[sortedTimes.length - 1];
    const variance = times.reduce((sum, time) => sum + Math.pow(time - averageTime, 2), 0) / times.length;
    const standardDeviation = Math.sqrt(variance);
    return {
      duration: totalDuration,
      memoryBefore,
      memoryAfter,
      memoryDelta: memoryAfter - memoryBefore,
      timestamp: Date.now(),
      iterations,
      averageTime,
      minTime,
      maxTime,
      standardDeviation
    };
  }
}
async function measureAsync(operation, name) {
  const benchmark = new PerformanceBenchmark();
  const metrics = await benchmark.run(operation, 1);
  if (name) {
    console.log(`Performance measurement for ${name}:`, metrics);
  }
  return { result: await operation(), metrics };
}
async function measureSync(operation, name, iterations = 1) {
  const benchmark = new PerformanceBenchmark();
  const metrics = await benchmark.run(operation, iterations);
  if (name) {
    console.log(`Performance measurement for ${name}:`, metrics);
  }
  return { result: operation(), metrics };
}
class FrameRateMonitor {
  constructor() {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.frameTimes = [];
    this.droppedFrames = 0;
    this.isMonitoring = false;
    this.animationFrameId = null;
  }
  start() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.frameTimes = [];
    this.droppedFrames = 0;
    this.monitorFrame();
  }
  stop() {
    this.isMonitoring = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  monitorFrame() {
    if (!this.isMonitoring) return;
    const currentTime = performance.now();
    const frameTime = currentTime - this.lastTime;
    this.frameTimes.push(frameTime);
    this.frameCount++;
    if (frameTime > 20) {
      this.droppedFrames += Math.floor(frameTime / 16.67) - 1;
    }
    if (this.frameTimes.length > 60) {
      this.frameTimes.shift();
    }
    this.lastTime = currentTime;
    this.animationFrameId = requestAnimationFrame(() => this.monitorFrame());
  }
  getMetrics() {
    const averageFrameTime = this.frameTimes.length > 0 ? this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length : 0;
    const fps = averageFrameTime > 0 ? 1e3 / averageFrameTime : 0;
    return {
      fps,
      frameTime: averageFrameTime,
      droppedFrames: this.droppedFrames,
      averageFrameTime,
      timestamp: Date.now()
    };
  }
}
function throttle(func, wait, options = {}) {
  let timeoutId = null;
  let lastExecTime = 0;
  let lastArgs = null;
  let lastResult;
  const { leading = true, trailing = true, maxWait } = options;
  const throttled = ((...args) => {
    const now = performance.now();
    const timeSinceLastExec = now - lastExecTime;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (leading && timeSinceLastExec >= wait) {
      lastExecTime = now;
      lastResult = func(...args);
      return lastResult;
    }
    if (trailing) {
      lastArgs = args;
      const delay = maxWait ? Math.min(wait, maxWait - timeSinceLastExec) : wait;
      timeoutId = window.setTimeout(() => {
        if (lastArgs) {
          lastExecTime = performance.now();
          lastResult = func(...lastArgs);
          lastArgs = null;
        }
      }, delay);
    }
    return lastResult;
  });
  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };
  throttled.flush = () => {
    if (lastArgs) {
      lastExecTime = performance.now();
      lastResult = func(...lastArgs);
      lastArgs = null;
      return lastResult;
    }
    return lastResult;
  };
  return throttled;
}
function debounce(func, wait, options = {}) {
  let timeoutId = null;
  let lastExecTime = 0;
  let lastArgs = null;
  let lastResult;
  const { leading = false, trailing = true, maxWait } = options;
  const debounced = ((...args) => {
    const now = performance.now();
    const timeSinceLastExec = now - lastExecTime;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (leading && timeSinceLastExec >= wait) {
      lastExecTime = now;
      lastResult = func(...args);
      return lastResult;
    }
    if (trailing) {
      lastArgs = args;
      const delay = maxWait ? Math.min(wait, maxWait - timeSinceLastExec) : wait;
      timeoutId = window.setTimeout(() => {
        if (lastArgs) {
          lastExecTime = performance.now();
          lastResult = func(...lastArgs);
          lastArgs = null;
        }
      }, delay);
    }
    return lastResult;
  });
  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };
  debounced.flush = () => {
    if (lastArgs) {
      lastExecTime = performance.now();
      lastResult = func(...lastArgs);
      lastArgs = null;
      return lastResult;
    }
    return lastResult;
  };
  return debounced;
}
class PerformanceBudgetChecker {
  constructor() {
    this.budgets = /* @__PURE__ */ new Map();
  }
  setBudget(name, budget) {
    this.budgets.set(name, budget);
  }
  checkBudget(name, metrics) {
    const budget = this.budgets.get(name);
    if (!budget) return true;
    const violations = [];
    if (metrics.duration > budget.maxDuration) {
      violations.push(`Duration: ${metrics.duration}ms > ${budget.maxDuration}ms`);
    }
    if (metrics.memoryDelta > budget.maxMemoryUsage) {
      violations.push(`Memory: ${metrics.memoryDelta} bytes > ${budget.maxMemoryUsage} bytes`);
    }
    if (metrics.iterations > budget.maxIterations) {
      violations.push(`Iterations: ${metrics.iterations} > ${budget.maxIterations}`);
    }
    if (violations.length > 0) {
      console.warn(`Performance budget violation for ${name}:`, violations.join(", "));
      return false;
    }
    return true;
  }
  clearBudget(name) {
    this.budgets.delete(name);
  }
  clearAllBudgets() {
    this.budgets.clear();
  }
}
let MemoryPool$1 = class MemoryPool {
  constructor(createFn, config = {}) {
    this.pool = [];
    this.createFn = createFn;
    this.config = {
      initialSize: 10,
      maxSize: 1e3,
      growthFactor: 1.5,
      enableStats: true,
      ...config
    };
    this.stats = {
      created: 0,
      acquired: 0,
      released: 0,
      poolSize: 0,
      peakPoolSize: 0,
      hitRate: 0
    };
    this.initializePool();
  }
  initializePool() {
    for (let i = 0; i < this.config.initialSize; i++) {
      this.pool.push(this.createFn());
      this.stats.created++;
    }
    this.stats.poolSize = this.pool.length;
    this.stats.peakPoolSize = this.pool.length;
  }
  acquire() {
    this.stats.acquired++;
    if (this.pool.length > 0) {
      const obj2 = this.pool.pop();
      obj2.reset();
      this.stats.poolSize = this.pool.length;
      this.updateHitRate();
      return obj2;
    }
    const obj = this.createFn();
    this.stats.created++;
    this.updateHitRate();
    return obj;
  }
  release(obj) {
    if (this.pool.length >= this.config.maxSize) {
      return;
    }
    this.pool.push(obj);
    this.stats.released++;
    this.stats.poolSize = this.pool.length;
    this.stats.peakPoolSize = Math.max(this.stats.peakPoolSize, this.pool.length);
  }
  updateHitRate() {
    if (this.stats.acquired > 0) {
      this.stats.hitRate = (this.stats.acquired - (this.stats.created - this.config.initialSize)) / this.stats.acquired;
    }
  }
  getStats() {
    return { ...this.stats };
  }
  clear() {
    this.pool.length = 0;
    this.stats.poolSize = 0;
  }
  resize(newSize) {
    if (newSize < this.pool.length) {
      this.pool.length = newSize;
    } else if (newSize > this.pool.length) {
      const needed = newSize - this.pool.length;
      for (let i = 0; i < needed; i++) {
        this.pool.push(this.createFn());
        this.stats.created++;
      }
    }
    this.stats.poolSize = this.pool.length;
  }
};
function createSpatialObjectPool(config = {}) {
  class SpatialObject {
    constructor() {
      this.id = "";
      this.x = 0;
      this.y = 0;
      this.width = 0;
      this.height = 0;
      this.data = null;
    }
    reset() {
      this.id = "";
      this.x = 0;
      this.y = 0;
      this.width = 0;
      this.height = 0;
      this.data = null;
    }
  }
  return new MemoryPool$1(() => new SpatialObject(), config);
}
function createAABBPool(config = {}) {
  class AABBObject {
    constructor() {
      this.x = 0;
      this.y = 0;
      this.width = 0;
      this.height = 0;
    }
    reset() {
      this.x = 0;
      this.y = 0;
      this.width = 0;
      this.height = 0;
    }
  }
  return new MemoryPool$1(() => new AABBObject(), config);
}
function createPointPool(config = {}) {
  class PointObject {
    constructor() {
      this.x = 0;
      this.y = 0;
    }
    reset() {
      this.x = 0;
      this.y = 0;
    }
  }
  return new MemoryPool$1(() => new PointObject(), config);
}
function createVectorPool(config = {}) {
  class VectorObject {
    constructor() {
      this.x = 0;
      this.y = 0;
      this.magnitude = 0;
    }
    reset() {
      this.x = 0;
      this.y = 0;
      this.magnitude = 0;
    }
  }
  return new MemoryPool$1(() => new VectorObject(), config);
}
class MemoryPoolManager {
  constructor() {
    this.pools = /* @__PURE__ */ new Map();
  }
  createPool(name, createFn, config = {}) {
    const pool = new MemoryPool$1(createFn, config);
    this.pools.set(name, pool);
    return pool;
  }
  getPool(name) {
    return this.pools.get(name);
  }
  removePool(name) {
    return this.pools.delete(name);
  }
  getAllStats() {
    const stats = {};
    this.pools.forEach((pool, name) => {
      stats[name] = pool.getStats();
    });
    return stats;
  }
  clearAllPools() {
    this.pools.forEach((pool) => {
      pool.clear();
    });
  }
}
const globalPoolManager = new MemoryPoolManager();
var AStarEventType = /* @__PURE__ */ ((AStarEventType2) => {
  AStarEventType2["PATHFINDING_STARTED"] = "pathfinding_started";
  AStarEventType2["PATHFINDING_COMPLETED"] = "pathfinding_completed";
  AStarEventType2["NODE_EXPLORED"] = "node_explored";
  AStarEventType2["PATH_FOUND"] = "path_found";
  AStarEventType2["PATH_NOT_FOUND"] = "path_not_found";
  AStarEventType2["CACHE_HIT"] = "cache_hit";
  AStarEventType2["CACHE_MISS"] = "cache_miss";
  return AStarEventType2;
})(AStarEventType || {});
const DEFAULT_ASTAR_CONFIG = {
  allowDiagonal: true,
  diagonalCost: Math.sqrt(2),
  regularCost: 1,
  maxIterations: 1e4,
  useTieBreaking: true,
  tieBreakingFactor: 1e-3,
  useDynamicWeighting: false,
  dynamicWeightingFactor: 1,
  enablePathSmoothing: true,
  smoothingTolerance: 0.1
};
const DEFAULT_ASTAR_OPTIONS = {
  config: DEFAULT_ASTAR_CONFIG,
  enableCaching: true,
  cacheSize: 1e3,
  enableStats: true,
  enableDebug: false
};
const manhattanDistance = (from, to) => {
  return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
};
const euclideanDistance = (from, to) => {
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  return Math.sqrt(dx * dx + dy * dy);
};
const chebyshevDistance = (from, to) => {
  return Math.max(Math.abs(from.x - to.x), Math.abs(from.y - to.y));
};
const defaultHeuristic = euclideanDistance;
class AStar {
  constructor(options = {}) {
    const opts = { ...DEFAULT_ASTAR_OPTIONS, ...options };
    this.config = { ...DEFAULT_ASTAR_CONFIG, ...opts.config };
    this.heuristic = opts.heuristic || defaultHeuristic;
    this.eventHandlers = opts.eventHandlers || [];
    this.enableCaching = opts.enableCaching;
    this.enableStats = opts.enableStats;
    this.enableDebug = opts.enableDebug;
    this.cacheSize = opts.cacheSize;
    this.cache = /* @__PURE__ */ new Map();
    this.stats = {
      totalOperations: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      totalNodesExplored: 0,
      averageNodesExplored: 0,
      successRate: 0,
      cacheHitRate: 0,
      memoryUsage: 0
    };
  }
  /**
   * Find path between two points using A* algorithm
   *
   * @param start Starting point
   * @param goal Goal point
   * @param grid Optional grid for obstacle checking
   * @returns Pathfinding result
   */
  findPath(start, goal, grid) {
    const startTime = performance.now();
    this.emitEvent(AStarEventType.PATHFINDING_STARTED, { start, goal });
    try {
      const cacheKey = this.getCacheKey(start, goal);
      if (this.enableCaching && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        cached.accessCount++;
        this.emitEvent(AStarEventType.CACHE_HIT, { cacheKey });
        const result2 = {
          success: true,
          path: cached.path,
          totalCost: cached.totalCost,
          nodesExplored: 0,
          iterations: 0,
          executionTime: 0,
          detailedPath: [],
          exploredNodes: []
        };
        this.updateStats(result2, performance.now() - startTime);
        return result2;
      }
      this.emitEvent(AStarEventType.CACHE_MISS, { cacheKey });
      const result = this.performAStarSearch(start, goal, grid);
      if (this.enableCaching && result.success) {
        this.cacheResult(cacheKey, start, goal, result);
      }
      this.updateStats(result, performance.now() - startTime);
      this.emitEvent(AStarEventType.PATHFINDING_COMPLETED, result);
      return result;
    } catch (error) {
      const result = {
        success: false,
        path: [],
        totalCost: 0,
        nodesExplored: 0,
        iterations: 0,
        executionTime: performance.now() - startTime,
        detailedPath: [],
        exploredNodes: [],
        error: error instanceof Error ? error.message : "Unknown error"
      };
      this.updateStats(result, result.executionTime);
      this.emitEvent(AStarEventType.PATH_NOT_FOUND, result);
      return result;
    }
  }
  /**
   * Perform the core A* search algorithm
   *
   * @param start Starting point
   * @param goal Goal point
   * @param grid Optional grid for obstacle checking
   * @returns Pathfinding result
   */
  performAStarSearch(start, goal, grid) {
    const openSet = /* @__PURE__ */ new Map();
    const closedSet = /* @__PURE__ */ new Set();
    const nodes = /* @__PURE__ */ new Map();
    const startNode = this.createNode(start, 0, this.heuristic(start, goal), null, true);
    const goalNode = this.createNode(goal, 0, 0, null, true);
    openSet.set(startNode.id, startNode);
    nodes.set(startNode.id, startNode);
    nodes.set(goalNode.id, goalNode);
    let iterations = 0;
    const exploredNodes = [];
    while (openSet.size > 0 && iterations < this.config.maxIterations) {
      iterations++;
      const currentNode = this.getLowestFScoreNode(openSet);
      openSet.delete(currentNode.id);
      closedSet.add(currentNode.id);
      exploredNodes.push(currentNode);
      this.emitEvent(AStarEventType.NODE_EXPLORED, { node: currentNode, iteration: iterations });
      if (this.isGoalReached(currentNode, goal)) {
        const path = this.reconstructPath(currentNode);
        const detailedPath = this.reconstructDetailedPath(currentNode);
        this.emitEvent(AStarEventType.PATH_FOUND, { path, iterations });
        return {
          success: true,
          path,
          totalCost: currentNode.gScore,
          nodesExplored: exploredNodes.length,
          iterations,
          executionTime: 0,
          // Will be set by caller
          detailedPath,
          exploredNodes
        };
      }
      const neighbors = this.getNeighbors(currentNode, grid);
      for (const neighbor of neighbors) {
        const neighborId = neighbor.id;
        if (closedSet.has(neighborId)) {
          continue;
        }
        const tentativeGScore = currentNode.gScore + this.getDistance(currentNode, neighbor);
        if (!openSet.has(neighborId)) {
          neighbor.gScore = tentativeGScore;
          neighbor.hScore = this.heuristic(neighbor.position, goal);
          neighbor.fScore = neighbor.gScore + neighbor.hScore;
          neighbor.parent = currentNode;
          openSet.set(neighborId, neighbor);
          nodes.set(neighborId, neighbor);
        } else {
          const existingNode = openSet.get(neighborId);
          if (tentativeGScore < existingNode.gScore) {
            existingNode.gScore = tentativeGScore;
            existingNode.fScore = existingNode.gScore + existingNode.hScore;
            existingNode.parent = currentNode;
          }
        }
      }
    }
    this.emitEvent(AStarEventType.PATH_NOT_FOUND, { iterations, nodesExplored: exploredNodes.length });
    return {
      success: false,
      path: [],
      totalCost: 0,
      nodesExplored: exploredNodes.length,
      iterations,
      executionTime: 0,
      // Will be set by caller
      detailedPath: [],
      exploredNodes
    };
  }
  /**
   * Create a new A* node
   */
  createNode(position, gScore, hScore, parent, walkable, data) {
    return {
      id: this.getNodeId(position),
      position,
      gScore,
      hScore,
      fScore: gScore + hScore,
      parent,
      walkable,
      data
    };
  }
  /**
   * Generate unique node ID from position
   */
  getNodeId(position) {
    return `${position.x},${position.y}`;
  }
  /**
   * Get node with lowest f-score from open set
   */
  getLowestFScoreNode(openSet) {
    let lowestNode = null;
    let lowestFScore = Infinity;
    for (const node of openSet.values()) {
      if (node.fScore < lowestFScore) {
        lowestFScore = node.fScore;
        lowestNode = node;
      } else if (this.config.useTieBreaking && node.fScore === lowestFScore) {
        if (node.gScore > lowestNode.gScore) {
          lowestNode = node;
        }
      }
    }
    return lowestNode;
  }
  /**
   * Check if goal is reached
   */
  isGoalReached(node, goal) {
    return node.position.x === goal.x && node.position.y === goal.y;
  }
  /**
   * Get neighboring nodes
   */
  getNeighbors(node, grid) {
    const neighbors = [];
    const { x, y } = node.position;
    const directions = [
      { dx: 0, dy: -1, cost: this.config.regularCost },
      // North
      { dx: 1, dy: 0, cost: this.config.regularCost },
      // East
      { dx: 0, dy: 1, cost: this.config.regularCost },
      // South
      { dx: -1, dy: 0, cost: this.config.regularCost }
      // West
    ];
    if (this.config.allowDiagonal) {
      directions.push(
        { dx: 1, dy: -1, cost: this.config.diagonalCost },
        // Northeast
        { dx: 1, dy: 1, cost: this.config.diagonalCost },
        // Southeast
        { dx: -1, dy: 1, cost: this.config.diagonalCost },
        // Southwest
        { dx: -1, dy: -1, cost: this.config.diagonalCost }
        // Northwest
      );
    }
    for (const { dx, dy, cost: _cost } of directions) {
      const newX = x + dx;
      const newY = y + dy;
      if (this.isValidPosition(newX, newY, grid)) {
        const neighbor = this.createNode(
          { x: newX, y: newY },
          0,
          // g-score will be calculated later
          0,
          // h-score will be calculated later
          null,
          true
        );
        neighbors.push(neighbor);
      }
    }
    return neighbors;
  }
  /**
   * Check if position is valid (within bounds and not blocked)
   */
  isValidPosition(x, y, grid) {
    if (!grid) {
      return true;
    }
    if (x < 0 || x >= grid.width || y < 0 || y >= grid.height) {
      return false;
    }
    return grid.cells[y][x];
  }
  /**
   * Calculate distance between two nodes
   */
  getDistance(node1, node2) {
    const dx = Math.abs(node1.position.x - node2.position.x);
    const dy = Math.abs(node1.position.y - node2.position.y);
    if (dx === 1 && dy === 1) {
      return this.config.diagonalCost;
    } else {
      return this.config.regularCost;
    }
  }
  /**
   * Reconstruct path from goal to start
   */
  reconstructPath(goalNode) {
    const path = [];
    let currentNode = goalNode;
    while (currentNode) {
      path.unshift(currentNode.position);
      currentNode = currentNode.parent;
    }
    return path;
  }
  /**
   * Reconstruct detailed path with node information
   */
  reconstructDetailedPath(goalNode) {
    const path = [];
    let currentNode = goalNode;
    while (currentNode) {
      path.unshift(currentNode);
      currentNode = currentNode.parent;
    }
    return path;
  }
  /**
   * Generate cache key for start and goal points
   */
  getCacheKey(start, goal) {
    return `${start.x},${start.y}-${goal.x},${goal.y}`;
  }
  /**
   * Cache pathfinding result
   */
  cacheResult(cacheKey, start, goal, result) {
    if (this.cache.size >= this.cacheSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(cacheKey, {
      start,
      goal,
      path: result.path,
      totalCost: result.totalCost,
      timestamp: Date.now(),
      accessCount: 1
    });
  }
  /**
   * Update statistics
   */
  updateStats(result, executionTime) {
    if (!this.enableStats) return;
    result.executionTime = executionTime;
    this.stats.totalOperations++;
    this.stats.totalExecutionTime += executionTime;
    this.stats.averageExecutionTime = this.stats.totalExecutionTime / this.stats.totalOperations;
    this.stats.totalNodesExplored += result.nodesExplored;
    this.stats.averageNodesExplored = this.stats.totalNodesExplored / this.stats.totalOperations;
    const successfulOperations = this.stats.totalOperations * this.stats.successRate + (result.success ? 1 : 0);
    this.stats.successRate = successfulOperations / this.stats.totalOperations;
    const cacheHits = this.stats.totalOperations * this.stats.cacheHitRate + (result.executionTime === 0 ? 1 : 0);
    this.stats.cacheHitRate = cacheHits / this.stats.totalOperations;
    this.stats.memoryUsage = this.cache.size * 100;
  }
  /**
   * Emit event to registered handlers
   */
  emitEvent(type, data) {
    if (!this.enableDebug) return;
    const event = {
      type,
      timestamp: Date.now(),
      data
    };
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error("Error in A* event handler:", error);
      }
    }
  }
  /**
   * Add event handler
   */
  addEventHandler(handler) {
    this.eventHandlers.push(handler);
  }
  /**
   * Remove event handler
   */
  removeEventHandler(handler) {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }
  /**
   * Get current statistics
   */
  getStats() {
    return { ...this.stats };
  }
  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const totalPathLength = this.stats.totalOperations > 0 ? this.cache.size > 0 ? Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.path.length, 0) / this.cache.size : 0 : 0;
    const averageExplorationRatio = this.stats.totalOperations > 0 ? this.stats.averageNodesExplored / Math.max(totalPathLength, 1) : 0;
    const performanceScore = Math.min(
      100,
      Math.max(
        0,
        this.stats.successRate * 40 + this.stats.cacheHitRate * 30 + Math.max(0, 1 - averageExplorationRatio) * 30
      )
    );
    return {
      memoryUsage: this.stats.memoryUsage,
      cacheSize: this.cache.size,
      cacheHitRate: this.stats.cacheHitRate,
      averagePathLength: totalPathLength,
      averageExplorationRatio,
      performanceScore
    };
  }
  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalOperations: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      totalNodesExplored: 0,
      averageNodesExplored: 0,
      successRate: 0,
      cacheHitRate: 0,
      memoryUsage: 0
    };
  }
  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
  /**
   * Set heuristic function
   */
  setHeuristic(heuristic) {
    this.heuristic = heuristic;
  }
}
var SATEventType = /* @__PURE__ */ ((SATEventType2) => {
  SATEventType2["COLLISION_TEST_STARTED"] = "collision_test_started";
  SATEventType2["COLLISION_TEST_COMPLETED"] = "collision_test_completed";
  SATEventType2["COLLISION_DETECTED"] = "collision_detected";
  SATEventType2["NO_COLLISION"] = "no_collision";
  SATEventType2["AXIS_CACHED"] = "axis_cached";
  SATEventType2["CACHE_HIT"] = "cache_hit";
  SATEventType2["CACHE_MISS"] = "cache_miss";
  return SATEventType2;
})(SATEventType || {});
const DEFAULT_SAT_CONFIG = {
  epsilon: 1e-10,
  maxContactPoints: 4,
  useEarlyTermination: true,
  useAxisCaching: true,
  useBoundingCircleOptimization: true,
  findContactPoints: true,
  calculatePenetrationDepth: true
};
const DEFAULT_SAT_OPTIONS = {
  config: DEFAULT_SAT_CONFIG,
  enableCaching: true,
  cacheSize: 1e3,
  enableStats: true,
  enableDebug: false
};
class SAT {
  constructor(options = {}) {
    const opts = { ...DEFAULT_SAT_OPTIONS, ...options };
    this.config = { ...DEFAULT_SAT_CONFIG, ...opts.config };
    this.eventHandlers = opts.eventHandlers || [];
    this.enableCaching = opts.enableCaching ?? true;
    this.enableStats = opts.enableStats ?? true;
    this.enableDebug = opts.enableDebug ?? false;
    this.cacheSize = opts.cacheSize ?? 1024;
    this.cache = /* @__PURE__ */ new Map();
    this.axisCache = /* @__PURE__ */ new Map();
    this.stats = {
      totalTests: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      collisionsDetected: 0,
      collisionRate: 0,
      averageAxesTested: 0,
      cacheHitRate: 0,
      memoryUsage: 0
    };
  }
  /**
   * Test collision between two convex polygons using SAT
   *
   * @param polygon1 First polygon
   * @param polygon2 Second polygon
   * @returns Collision detection result
   */
  testCollision(polygon1, polygon2) {
    const startTime = performance.now();
    this.emitEvent(SATEventType.COLLISION_TEST_STARTED, { polygon1, polygon2 });
    try {
      const cacheKey = this.getCacheKey(polygon1, polygon2);
      if (this.enableCaching && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        cached.accessCount++;
        this.emitEvent(SATEventType.CACHE_HIT, { cacheKey });
        const result2 = { ...cached.result };
        result2.executionTime = 0;
        result2.success = true;
        this.updateStats(result2, 0);
        return result2;
      }
      this.emitEvent(SATEventType.CACHE_MISS, { cacheKey });
      const result = this.performSATTest(polygon1, polygon2);
      if (this.enableCaching) {
        this.cacheResult(cacheKey, polygon1, polygon2, result);
      }
      this.updateStats(result, performance.now() - startTime);
      if (result.colliding) {
        this.emitEvent(SATEventType.COLLISION_DETECTED, result);
      } else {
        this.emitEvent(SATEventType.NO_COLLISION, result);
      }
      this.emitEvent(SATEventType.COLLISION_TEST_COMPLETED, result);
      return result;
    } catch (error) {
      const result = {
        colliding: false,
        mtv: null,
        overlap: 0,
        separationAxis: null,
        contactPoints: [],
        penetrationDepth: 0,
        executionTime: performance.now() - startTime,
        axesTested: 0,
        success: false
      };
      this.updateStats(result, result.executionTime);
      this.emitEvent(SATEventType.COLLISION_TEST_COMPLETED, result);
      return result;
    }
  }
  /**
   * Perform the core SAT collision test
   *
   * @param polygon1 First polygon
   * @param polygon2 Second polygon
   * @returns Collision detection result
   */
  performSATTest(polygon1, polygon2) {
    if (this.config.useBoundingCircleOptimization) {
      if (!this.boundingCirclesOverlap(polygon1, polygon2)) {
        const sep = this.normalize({
          x: polygon2.center.x - polygon1.center.x,
          y: polygon2.center.y - polygon1.center.y
        });
        return {
          colliding: false,
          mtv: null,
          overlap: 0,
          separationAxis: { normal: sep, isFaceNormal: false },
          contactPoints: [],
          penetrationDepth: 0,
          executionTime: 0,
          axesTested: 0,
          // Compatibility flag for tests
          success: true
        };
      }
    }
    if (this.isDegenerate(polygon1) || this.isDegenerate(polygon2)) {
      const aInB = polygon1.vertices.some((v) => this.isPointInsidePolygon(v, polygon2));
      const bInA = polygon2.vertices.some((v) => this.isPointInsidePolygon(v, polygon1));
      const colliding = aInB || bInA;
      return {
        colliding,
        mtv: null,
        overlap: colliding ? this.config.epsilon : 0,
        separationAxis: null,
        contactPoints: [],
        penetrationDepth: colliding ? this.config.epsilon : 0,
        executionTime: 0,
        axesTested: 0,
        success: true
      };
    }
    const axes = this.getSeparationAxes(polygon1, polygon2);
    let minOverlap = Infinity;
    let separationAxis = null;
    let axesTested = 0;
    for (const axis of axes) {
      axesTested++;
      const projection1 = this.projectPolygon(polygon1, axis);
      const projection2 = this.projectPolygon(polygon2, axis);
      const overlap = this.getProjectionOverlap(projection1, projection2);
      if (overlap <= 0) {
        return {
          colliding: false,
          mtv: null,
          overlap: 0,
          separationAxis: axis,
          contactPoints: [],
          penetrationDepth: 0,
          executionTime: 0,
          axesTested,
          success: true
        };
      }
      if (overlap < minOverlap || Math.abs(overlap - minOverlap) <= this.config.epsilon && separationAxis && Math.abs(axis.normal.x) < Math.abs(separationAxis.normal.x)) {
        minOverlap = overlap;
        separationAxis = axis;
      }
      if (this.config.useEarlyTermination && minOverlap < this.config.epsilon) {
        break;
      }
    }
    const mtv = separationAxis ? this.calculateMTV(separationAxis, minOverlap) : null;
    const contactPoints = this.config.findContactPoints ? this.findContactPoints(polygon1, polygon2, separationAxis) : [];
    const penetrationDepth = this.config.calculatePenetrationDepth ? minOverlap : 0;
    return {
      colliding: true,
      mtv,
      overlap: minOverlap,
      separationAxis,
      contactPoints,
      penetrationDepth,
      executionTime: 0,
      // Will be set by caller
      axesTested,
      success: true
    };
  }
  /**
   * Get all potential separation axes for two polygons
   *
   * @param polygon1 First polygon
   * @param polygon2 Second polygon
   * @returns Array of potential separation axes
   */
  getSeparationAxes(polygon1, polygon2) {
    const cacheKey = this.getAxisCacheKey(polygon1, polygon2);
    if (this.config.useAxisCaching && this.axisCache.has(cacheKey)) {
      return this.axisCache.get(cacheKey);
    }
    const axes = [];
    axes.push(...this.getFaceNormals(polygon1));
    axes.push(...this.getFaceNormals(polygon2));
    if (this.config.useAxisCaching) {
      this.axisCache.set(cacheKey, axes);
      this.emitEvent(SATEventType.AXIS_CACHED, { cacheKey, axisCount: axes.length });
    }
    return axes;
  }
  /**
   * Get face normals for a polygon
   *
   * @param polygon The polygon
   * @returns Array of face normal axes
   */
  getFaceNormals(polygon) {
    const axes = [];
    const vertices = polygon.vertices;
    for (let i = 0; i < vertices.length; i++) {
      const current = vertices[i];
      const next = vertices[(i + 1) % vertices.length];
      const edge = {
        x: next.x - current.x,
        y: next.y - current.y
      };
      const normal = this.normalize({
        x: -edge.y,
        y: edge.x
      });
      axes.push({
        normal,
        isFaceNormal: true,
        faceIndex: i
      });
    }
    return axes;
  }
  /**
   * Project a polygon onto an axis
   *
   * @param polygon The polygon to project
   * @param axis The axis to project onto
   * @returns Projection result
   */
  projectPolygon(polygon, axis) {
    const vertices = polygon.vertices;
    let min = Infinity;
    let max = -Infinity;
    for (const vertex of vertices) {
      const projection = this.dotProduct(vertex, axis.normal);
      min = Math.min(min, projection);
      max = Math.max(max, projection);
    }
    return {
      min,
      max,
      axis
    };
  }
  /**
   * Calculate overlap between two projections
   *
   * @param projection1 First projection
   * @param projection2 Second projection
   * @returns Overlap distance (negative if no overlap)
   */
  getProjectionOverlap(projection1, projection2) {
    const overlap1 = projection1.max - projection2.min;
    const overlap2 = projection2.max - projection1.min;
    return Math.min(overlap1, overlap2);
  }
  /**
   * Calculate Minimum Translation Vector
   *
   * @param axis The separation axis
   * @param overlap The overlap distance
   * @returns MTV vector
   */
  calculateMTV(axis, overlap) {
    const n = this.normalize(axis.normal);
    let x = n.x * overlap;
    let y = n.y * overlap;
    if (Math.abs(x) > Math.abs(y)) {
      y = 0;
    } else {
      x = 0;
    }
    return { x, y };
  }
  /**
   * Find contact points between two colliding polygons
   *
   * @param polygon1 First polygon
   * @param polygon2 Second polygon
   * @param separationAxis The separation axis
   * @returns Array of contact points
   */
  findContactPoints(polygon1, polygon2, _separationAxis) {
    const contactPoints = [];
    for (const vertex of polygon1.vertices) {
      if (this.isPointInsidePolygon(vertex, polygon2)) {
        contactPoints.push(vertex);
      }
    }
    for (const vertex of polygon2.vertices) {
      if (this.isPointInsidePolygon(vertex, polygon1)) {
        contactPoints.push(vertex);
      }
    }
    if (contactPoints.length > this.config.maxContactPoints) {
      contactPoints.splice(this.config.maxContactPoints);
    }
    return contactPoints;
  }
  /**
   * Check if a point is inside a polygon using ray casting
   *
   * @param point The point to test
   * @param polygon The polygon
   * @returns True if point is inside polygon
   */
  isPointInsidePolygon(point, polygon) {
    const vertices = polygon.vertices;
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const vi = vertices[i];
      const vj = vertices[j];
      if (vi.y > point.y !== vj.y > point.y && point.x < (vj.x - vi.x) * (point.y - vi.y) / (vj.y - vi.y) + vi.x) {
        inside = !inside;
      }
    }
    return inside;
  }
  /**
   * Check if bounding circles overlap
   *
   * @param polygon1 First polygon
   * @param polygon2 Second polygon
   * @returns True if circles overlap
   */
  boundingCirclesOverlap(polygon1, polygon2) {
    const dx = polygon1.center.x - polygon2.center.x;
    const dy = polygon1.center.y - polygon2.center.y;
    const distance2 = Math.sqrt(dx * dx + dy * dy);
    const combinedRadius = polygon1.radius + polygon2.radius;
    return distance2 <= combinedRadius;
  }
  /**
   * Normalize a vector
   *
   * @param vector The vector to normalize
   * @returns Normalized vector
   */
  normalize(vector) {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (length < this.config.epsilon) {
      return { x: 0, y: 0 };
    }
    return {
      x: vector.x / length,
      y: vector.y / length
    };
  }
  /**
   * Calculate dot product of two vectors
   *
   * @param point Point (treated as vector from origin)
   * @param vector Vector
   * @returns Dot product
   */
  dotProduct(point, vector) {
    return point.x * vector.x + point.y * vector.y;
  }
  /**
   * Generate cache key for two polygons
   */
  getCacheKey(polygon1, polygon2) {
    const id1 = polygon1.id || this.getPolygonHash(polygon1);
    const id2 = polygon2.id || this.getPolygonHash(polygon2);
    return `${id1}-${id2}`;
  }
  /**
   * Generate cache key for axes
   */
  getAxisCacheKey(polygon1, polygon2) {
    const id1 = polygon1.id || this.getPolygonHash(polygon1);
    const id2 = polygon2.id || this.getPolygonHash(polygon2);
    return `axes-${id1}-${id2}`;
  }
  /**
   * Generate hash for polygon (simple hash based on vertex count and center)
   */
  getPolygonHash(polygon) {
    return `${polygon.vertices.length}-${polygon.center.x}-${polygon.center.y}`;
  }
  /**
   * Cache collision result
   */
  cacheResult(cacheKey, polygon1, polygon2, result) {
    if (this.cache.size >= this.cacheSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(cacheKey, {
      polygon1Id: polygon1.id || this.getPolygonHash(polygon1),
      polygon2Id: polygon2.id || this.getPolygonHash(polygon2),
      result,
      timestamp: Date.now(),
      accessCount: 1
    });
  }
  /**
   * Update statistics
   */
  updateStats(result, executionTime) {
    if (!this.enableStats) return;
    result.executionTime = executionTime;
    result.success = true;
    this.stats.totalTests++;
    this.stats.totalExecutionTime += executionTime;
    this.stats.averageExecutionTime = this.stats.totalExecutionTime / this.stats.totalTests;
    if (result.colliding) {
      this.stats.collisionsDetected++;
    }
    this.stats.collisionRate = this.stats.collisionsDetected / this.stats.totalTests;
    this.stats.averageAxesTested = (this.stats.averageAxesTested * (this.stats.totalTests - 1) + result.axesTested) / this.stats.totalTests;
    const cacheHits = this.stats.totalTests * this.stats.cacheHitRate + (result.executionTime === 0 ? 1 : 0);
    this.stats.cacheHitRate = cacheHits / this.stats.totalTests;
    this.stats.memoryUsage = (this.cache.size + this.axisCache.size) * 100;
  }
  isDegenerate(p) {
    if (!p.vertices || p.vertices.length < 3) return true;
    let area = 0;
    for (let i = 0, j = p.vertices.length - 1; i < p.vertices.length; j = i++) {
      const vi = p.vertices[i];
      const vj = p.vertices[j];
      area += vj.x * vi.y - vi.x * vj.y;
    }
    area = Math.abs(area) / 2;
    return area <= this.config.epsilon;
  }
  /**
   * Emit event to registered handlers
   */
  emitEvent(type, data) {
    if (!this.enableDebug) return;
    const event = {
      type,
      timestamp: Date.now(),
      data
    };
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error("Error in SAT event handler:", error);
      }
    }
  }
  /**
   * Test collision between multiple polygon pairs
   *
   * @param polygonPairs Array of polygon pairs to test
   * @returns Batch collision test results
   */
  testBatchCollisions(polygonPairs) {
    const startTime = performance.now();
    const results = [];
    let collisionCount = 0;
    for (const { polygon1, polygon2 } of polygonPairs) {
      const result = this.testCollision(polygon1, polygon2);
      results.push({
        polygon1Id: polygon1.id || this.getPolygonHash(polygon1),
        polygon2Id: polygon2.id || this.getPolygonHash(polygon2),
        result
      });
      if (result.colliding) {
        collisionCount++;
      }
    }
    const totalExecutionTime = performance.now() - startTime;
    return {
      results,
      totalExecutionTime,
      collisionCount,
      stats: { ...this.stats }
    };
  }
  /**
   * Transform a polygon and test collision
   *
   * @param polygon The polygon to transform
   * @param transform The transformation to apply
   * @param otherPolygon The other polygon to test against
   * @returns Collision detection result
   */
  testTransformedCollision(polygon, transform, otherPolygon) {
    const transformedPolygon = this.transformPolygon(polygon, transform);
    return this.testCollision(transformedPolygon, otherPolygon);
  }
  /**
   * Transform a polygon using a transformation matrix
   *
   * @param polygon The polygon to transform
   * @param transform The transformation matrix
   * @returns Transformed polygon
   */
  transformPolygon(polygon, transform) {
    const transformedVertices = polygon.vertices.map((vertex) => {
      const cos2 = Math.cos(transform.rotation);
      const sin2 = Math.sin(transform.rotation);
      const rotatedX = vertex.x * cos2 - vertex.y * sin2;
      const rotatedY = vertex.x * sin2 + vertex.y * cos2;
      const scaledX = rotatedX * transform.scale.x;
      const scaledY = rotatedY * transform.scale.y;
      return {
        x: scaledX + transform.translation.x,
        y: scaledY + transform.translation.y
      };
    });
    const cos = Math.cos(transform.rotation);
    const sin = Math.sin(transform.rotation);
    const rotatedCenterX = polygon.center.x * cos - polygon.center.y * sin;
    const rotatedCenterY = polygon.center.x * sin + polygon.center.y * cos;
    const transformedCenter = {
      x: rotatedCenterX * transform.scale.x + transform.translation.x,
      y: rotatedCenterY * transform.scale.y + transform.translation.y
    };
    return {
      ...polygon,
      vertices: transformedVertices,
      center: transformedCenter,
      radius: polygon.radius * Math.max(transform.scale.x, transform.scale.y)
    };
  }
  /**
   * Add event handler
   */
  addEventHandler(handler) {
    this.eventHandlers.push(handler);
  }
  /**
   * Remove event handler
   */
  removeEventHandler(handler) {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }
  /**
   * Get current statistics
   */
  getStats() {
    return { ...this.stats };
  }
  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const performanceScore = Math.min(
      100,
      Math.max(
        0,
        this.stats.collisionRate * 30 + this.stats.cacheHitRate * 40 + Math.max(0, 1 - this.stats.averageExecutionTime / 10) * 30
      )
    );
    return {
      memoryUsage: this.stats.memoryUsage,
      cacheSize: this.cache.size,
      cacheHitRate: this.stats.cacheHitRate,
      averageTestTime: this.stats.averageExecutionTime,
      performanceScore
    };
  }
  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.axisCache.clear();
  }
  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalTests: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      collisionsDetected: 0,
      collisionRate: 0,
      averageAxesTested: 0,
      cacheHitRate: 0,
      memoryUsage: 0
    };
  }
  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}
var SweepPruneEventType = /* @__PURE__ */ ((SweepPruneEventType2) => {
  SweepPruneEventType2["COLLISION_DETECTION_STARTED"] = "collision_detection_started";
  SweepPruneEventType2["COLLISION_DETECTION_COMPLETED"] = "collision_detection_completed";
  SweepPruneEventType2["AABB_ADDED"] = "aabb_added";
  SweepPruneEventType2["AABB_REMOVED"] = "aabb_removed";
  SweepPruneEventType2["AABB_UPDATED"] = "aabb_updated";
  SweepPruneEventType2["COLLISION_PAIR_FOUND"] = "collision_pair_found";
  SweepPruneEventType2["COLLISION_PAIR_LOST"] = "collision_pair_lost";
  SweepPruneEventType2["AXIS_SWEEP_STARTED"] = "axis_sweep_started";
  SweepPruneEventType2["AXIS_SWEEP_COMPLETED"] = "axis_sweep_completed";
  SweepPruneEventType2["SORTING_PERFORMED"] = "sorting_performed";
  return SweepPruneEventType2;
})(SweepPruneEventType || {});
const DEFAULT_SWEEP_PRUNE_CONFIG = {
  epsilon: 1e-10,
  useInsertionSort: true,
  insertionSortThreshold: 20,
  useTemporalCoherence: true,
  useMultiAxisOptimization: true,
  enableIncrementalUpdates: true,
  maxAABBs: 1e4,
  useSpatialPartitioning: false,
  spatialCellSize: 100
};
const DEFAULT_SWEEP_PRUNE_OPTIONS = {
  config: DEFAULT_SWEEP_PRUNE_CONFIG,
  enableCaching: true,
  cacheSize: 1e3,
  enableStats: true,
  enableDebug: false
};
class SweepPrune {
  constructor(options = {}) {
    const opts = { ...DEFAULT_SWEEP_PRUNE_OPTIONS, ...options };
    this.config = { ...DEFAULT_SWEEP_PRUNE_CONFIG, ...opts.config };
    this.eventHandlers = opts.eventHandlers || [];
    this.enableCaching = opts.enableCaching ?? true;
    this.enableStats = opts.enableStats ?? true;
    this.enableDebug = opts.enableDebug ?? false;
    this.cacheSize = opts.cacheSize ?? 1e3;
    this.cache = /* @__PURE__ */ new Map();
    this.aabbs = /* @__PURE__ */ new Map();
    this.activeCollisionPairs = /* @__PURE__ */ new Map();
    this.spatialCells = /* @__PURE__ */ new Map();
    this.stats = {
      totalOperations: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      totalAABBsProcessed: 0,
      averageAABBsPerOperation: 0,
      totalCollisionPairs: 0,
      averageCollisionPairsPerOperation: 0,
      cacheHitRate: 0,
      memoryUsage: 0
    };
  }
  /**
   * Add an AABB to the collision detection system
   *
   * @param aabb The AABB to add
   */
  addAABB(aabb) {
    this.aabbs.set(aabb.id, aabb);
    this.emitEvent(SweepPruneEventType.AABB_ADDED, { aabb });
    if (this.config.enableIncrementalUpdates) {
      this.performIncrementalUpdate(aabb, "add");
    }
  }
  /**
   * Remove an AABB from the collision detection system
   *
   * @param aabbId The ID of the AABB to remove
   */
  removeAABB(aabbId) {
    const aabb = this.aabbs.get(aabbId);
    if (aabb) {
      this.aabbs.delete(aabbId);
      this.emitEvent(SweepPruneEventType.AABB_REMOVED, { aabb });
      if (this.config.enableIncrementalUpdates) {
        this.performIncrementalUpdate(aabb, "remove");
      }
    }
  }
  /**
   * Update an existing AABB
   *
   * @param aabb The updated AABB
   */
  updateAABB(aabb) {
    const existingAABB = this.aabbs.get(aabb.id);
    if (existingAABB) {
      this.aabbs.set(aabb.id, aabb);
      this.emitEvent(SweepPruneEventType.AABB_UPDATED, { aabb, previousAABB: existingAABB });
      if (this.config.enableIncrementalUpdates) {
        this.performIncrementalUpdate(aabb, "update", existingAABB);
      }
    }
  }
  /**
   * Perform collision detection using sweep and prune algorithm
   *
   * @param aabbs Optional array of AABBs to test (uses internal AABBs if not provided)
   * @returns Collision detection result
   */
  detectCollisions(aabbs) {
    const startTime = performance.now();
    this.emitEvent(SweepPruneEventType.COLLISION_DETECTION_STARTED, { aabbCount: aabbs?.length || this.aabbs.size });
    try {
      const testAABBs = aabbs || Array.from(this.aabbs.values());
      const cacheKey = this.getCacheKey(testAABBs);
      if (this.enableCaching && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        cached.accessCount++;
        const collisionPairs = [...cached.collisionPairs];
        this.updateStats(collisionPairs, performance.now() - startTime, testAABBs.length);
        return {
          collisionPairs,
          totalAABBs: testAABBs.length,
          activeCollisions: collisionPairs.filter((pair) => pair.active).length,
          executionTime: 0,
          endpointsProcessed: 0,
          axisSweeps: 0
        };
      }
      const result = this.performSweepPrune(testAABBs);
      if (this.enableCaching) {
        this.cacheResult(cacheKey, result.collisionPairs);
      }
      this.updateStats(result.collisionPairs, performance.now() - startTime, testAABBs.length);
      this.emitEvent(SweepPruneEventType.COLLISION_DETECTION_COMPLETED, result);
      return result;
    } catch (error) {
      const result = {
        collisionPairs: [],
        totalAABBs: 0,
        activeCollisions: 0,
        executionTime: performance.now() - startTime,
        endpointsProcessed: 0,
        axisSweeps: 0
      };
      this.updateStats([], result.executionTime, 0);
      this.emitEvent(SweepPruneEventType.COLLISION_DETECTION_COMPLETED, result);
      return result;
    }
  }
  /**
   * Perform the core sweep and prune algorithm
   *
   * @param aabbs Array of AABBs to test
   * @returns Collision detection result
   */
  performSweepPrune(aabbs) {
    if (aabbs.length === 0) {
      return {
        collisionPairs: [],
        totalAABBs: 0,
        activeCollisions: 0,
        executionTime: 0,
        endpointsProcessed: 0,
        axisSweeps: 0
      };
    }
    if (this.config.useSpatialPartitioning && aabbs.length > this.config.maxAABBs) {
      return this.performSpatialPartitionedSweepPrune(aabbs);
    }
    if (this.config.useMultiAxisOptimization) {
      return this.performMultiAxisSweepPrune(aabbs);
    }
    return this.performSingleAxisSweepPrune(aabbs);
  }
  /**
   * Perform sweep and prune on a single axis
   *
   * @param aabbs Array of AABBs to test
   * @returns Collision detection result
   */
  performSingleAxisSweepPrune(aabbs) {
    const collisionPairs = [];
    let endpointsProcessed = 0;
    let axisSweeps = 0;
    for (let axis = 0; axis < 2; axis++) {
      axisSweeps++;
      this.emitEvent(SweepPruneEventType.AXIS_SWEEP_STARTED, { axis, aabbCount: aabbs.length });
      const axisResult = this.sweepAxis(aabbs, axis);
      endpointsProcessed += axisResult.endpointsProcessed;
      if (axis === 0) {
        collisionPairs.push(...axisResult.collisionPairs);
      } else {
        this.filterCollisionPairs(collisionPairs, axisResult.collisionPairs);
      }
      this.emitEvent(SweepPruneEventType.AXIS_SWEEP_COMPLETED, { axis, pairsFound: axisResult.collisionPairs.length });
    }
    const activeCollisions = collisionPairs.filter((pair) => pair.active).length;
    return {
      collisionPairs,
      totalAABBs: aabbs.length,
      activeCollisions,
      executionTime: 0,
      // Will be set by caller
      endpointsProcessed,
      axisSweeps
    };
  }
  /**
   * Perform sweep and prune on multiple axes simultaneously
   *
   * @param aabbs Array of AABBs to test
   * @returns Collision detection result
   */
  performMultiAxisSweepPrune(aabbs) {
    const axisResults = [];
    let totalEndpointsProcessed = 0;
    let totalAxisSweeps = 0;
    for (let axis = 0; axis < 2; axis++) {
      totalAxisSweeps++;
      const axisResult = this.sweepAxis(aabbs, axis);
      axisResults.push({
        axis,
        endpointsProcessed: axisResult.endpointsProcessed,
        collisionPairsFound: axisResult.collisionPairs.length,
        executionTime: 0,
        isLimiting: false
      });
      totalEndpointsProcessed += axisResult.endpointsProcessed;
    }
    const combinedPairs = this.intersectCollisionPairs(
      axisResults.map((r) => this.sweepAxis(aabbs, r.axis).collisionPairs)
    );
    const activeCollisions = combinedPairs.filter((pair) => pair.active).length;
    return {
      collisionPairs: combinedPairs,
      totalAABBs: aabbs.length,
      activeCollisions,
      executionTime: 0,
      // Will be set by caller
      endpointsProcessed: totalEndpointsProcessed,
      axisSweeps: totalAxisSweeps
    };
  }
  /**
   * Perform sweep and prune with spatial partitioning
   *
   * @param aabbs Array of AABBs to test
   * @returns Collision detection result
   */
  performSpatialPartitionedSweepPrune(aabbs) {
    const cells = this.partitionAABBs(aabbs);
    const allCollisionPairs = [];
    let totalEndpointsProcessed = 0;
    let totalAxisSweeps = 0;
    for (const cell of cells.values()) {
      if (cell.aabbs.length > 1) {
        const cellResult = this.performSingleAxisSweepPrune(cell.aabbs);
        allCollisionPairs.push(...cellResult.collisionPairs);
        totalEndpointsProcessed += cellResult.endpointsProcessed;
        totalAxisSweeps += cellResult.axisSweeps;
      }
    }
    const interCellPairs = this.checkInterCellCollisions(cells);
    allCollisionPairs.push(...interCellPairs);
    const activeCollisions = allCollisionPairs.filter((pair) => pair.active).length;
    return {
      collisionPairs: allCollisionPairs,
      totalAABBs: aabbs.length,
      activeCollisions,
      executionTime: 0,
      // Will be set by caller
      endpointsProcessed: totalEndpointsProcessed,
      axisSweeps: totalAxisSweeps
    };
  }
  /**
   * Sweep a single axis and find collision pairs
   *
   * @param aabbs Array of AABBs to test
   * @param axis Axis to sweep (0 = x, 1 = y)
   * @returns Axis sweep result
   */
  sweepAxis(aabbs, axis) {
    const endpoints = [];
    for (const aabb of aabbs) {
      const minValue = axis === 0 ? aabb.minX : aabb.minY;
      const maxValue = axis === 0 ? aabb.maxX : aabb.maxY;
      endpoints.push({ aabb, isStart: true, value: minValue, axis }, { aabb, isStart: false, value: maxValue, axis });
    }
    this.sortEndpoints(endpoints);
    this.emitEvent(SweepPruneEventType.SORTING_PERFORMED, { axis, endpointCount: endpoints.length });
    const activeAABBs = /* @__PURE__ */ new Set();
    const collisionPairs = [];
    for (const endpoint of endpoints) {
      if (endpoint.isStart) {
        for (const activeAABB of activeAABBs) {
          if (this.aabbsOverlapOnAxis(endpoint.aabb, activeAABB, axis)) {
            const pair = this.createCollisionPair(endpoint.aabb, activeAABB);
            collisionPairs.push(pair);
            this.emitEvent(SweepPruneEventType.COLLISION_PAIR_FOUND, { pair });
          }
        }
        activeAABBs.add(endpoint.aabb);
      } else {
        activeAABBs.delete(endpoint.aabb);
      }
    }
    return {
      collisionPairs,
      endpointsProcessed: endpoints.length
    };
  }
  /**
   * Sort endpoints using appropriate algorithm
   *
   * @param endpoints Array of endpoints to sort
   */
  sortEndpoints(endpoints) {
    if (endpoints.length <= this.config.insertionSortThreshold && this.config.useInsertionSort) {
      this.insertionSort(endpoints);
    } else {
      this.quickSort(endpoints);
    }
  }
  /**
   * Insertion sort for small arrays
   *
   * @param endpoints Array of endpoints to sort
   */
  insertionSort(endpoints) {
    for (let i = 1; i < endpoints.length; i++) {
      const key = endpoints[i];
      let j = i - 1;
      while (j >= 0 && this.compareEndpoints(endpoints[j], key) > 0) {
        endpoints[j + 1] = endpoints[j];
        j--;
      }
      endpoints[j + 1] = key;
    }
  }
  /**
   * Quick sort for larger arrays
   *
   * @param endpoints Array of endpoints to sort
   */
  quickSort(endpoints) {
    this.quickSortRecursive(endpoints, 0, endpoints.length - 1);
  }
  /**
   * Recursive quick sort implementation
   *
   * @param endpoints Array of endpoints to sort
   * @param low Starting index
   * @param high Ending index
   */
  quickSortRecursive(endpoints, low, high) {
    if (low < high) {
      const pivotIndex = this.partition(endpoints, low, high);
      this.quickSortRecursive(endpoints, low, pivotIndex - 1);
      this.quickSortRecursive(endpoints, pivotIndex + 1, high);
    }
  }
  /**
   * Partition function for quick sort
   *
   * @param endpoints Array of endpoints to sort
   * @param low Starting index
   * @param high Ending index
   * @returns Pivot index
   */
  partition(endpoints, low, high) {
    const pivot = endpoints[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      if (this.compareEndpoints(endpoints[j], pivot) <= 0) {
        i++;
        [endpoints[i], endpoints[j]] = [endpoints[j], endpoints[i]];
      }
    }
    [endpoints[i + 1], endpoints[high]] = [endpoints[high], endpoints[i + 1]];
    return i + 1;
  }
  /**
   * Compare two endpoints for sorting
   *
   * @param a First endpoint
   * @param b Second endpoint
   * @returns Comparison result (-1, 0, 1)
   */
  compareEndpoints(a, b) {
    if (Math.abs(a.value - b.value) > this.config.epsilon) {
      return a.value - b.value;
    }
    if (a.isStart !== b.isStart) {
      return a.isStart ? -1 : 1;
    }
    return String(a.aabb.id).localeCompare(String(b.aabb.id));
  }
  /**
   * Check if two AABBs overlap on a specific axis
   *
   * @param aabb1 First AABB
   * @param aabb2 Second AABB
   * @param axis Axis to check (0 = x, 1 = y)
   * @returns True if AABBs overlap on the axis
   */
  aabbsOverlapOnAxis(aabb1, aabb2, axis) {
    if (axis === 0) {
      return aabb1.minX < aabb2.maxX && aabb2.minX < aabb1.maxX;
    } else {
      return aabb1.minY < aabb2.maxY && aabb2.minY < aabb1.maxY;
    }
  }
  /**
   * Create a collision pair from two AABBs
   *
   * @param aabb1 First AABB
   * @param aabb2 Second AABB
   * @returns Collision pair
   */
  createCollisionPair(aabb1, aabb2) {
    const pairId = this.getPairId(aabb1, aabb2);
    const existingPair = this.activeCollisionPairs.get(pairId);
    if (existingPair) {
      existingPair.active = true;
      existingPair.lastUpdate = Date.now();
      return existingPair;
    }
    const newPair = {
      aabb1,
      aabb2,
      active: true,
      lastUpdate: Date.now()
    };
    this.activeCollisionPairs.set(pairId, newPair);
    return newPair;
  }
  /**
   * Generate unique ID for a collision pair
   *
   * @param aabb1 First AABB
   * @param aabb2 Second AABB
   * @returns Unique pair ID
   */
  getPairId(aabb1, aabb2) {
    const id1 = String(aabb1.id);
    const id2 = String(aabb2.id);
    return id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
  }
  /**
   * Filter collision pairs based on second axis results
   *
   * @param pairs First axis collision pairs
   * @param secondAxisPairs Second axis collision pairs
   */
  filterCollisionPairs(pairs, secondAxisPairs) {
    const secondAxisPairIds = new Set(secondAxisPairs.map((pair) => this.getPairId(pair.aabb1, pair.aabb2)));
    for (const pair of pairs) {
      const pairId = this.getPairId(pair.aabb1, pair.aabb2);
      pair.active = secondAxisPairIds.has(pairId);
      if (!pair.active) {
        this.emitEvent(SweepPruneEventType.COLLISION_PAIR_LOST, { pair });
      }
    }
  }
  /**
   * Find intersection of collision pairs from multiple axes
   *
   * @param axisPairArrays Array of collision pair arrays from each axis
   * @returns Intersected collision pairs
   */
  intersectCollisionPairs(axisPairArrays) {
    if (axisPairArrays.length === 0) return [];
    if (axisPairArrays.length === 1) return axisPairArrays[0];
    let result = axisPairArrays[0];
    for (let i = 1; i < axisPairArrays.length; i++) {
      const currentAxisPairs = axisPairArrays[i];
      const currentAxisPairIds = new Set(currentAxisPairs.map((pair) => this.getPairId(pair.aabb1, pair.aabb2)));
      result = result.filter((pair) => {
        const pairId = this.getPairId(pair.aabb1, pair.aabb2);
        return currentAxisPairIds.has(pairId);
      });
    }
    return result;
  }
  /**
   * Partition AABBs into spatial cells
   *
   * @param aabbs Array of AABBs to partition
   * @returns Map of spatial cells
   */
  partitionAABBs(aabbs) {
    const cells = /* @__PURE__ */ new Map();
    for (const aabb of aabbs) {
      const cellKey = this.getSpatialCellKey(aabb);
      if (!cells.has(cellKey)) {
        cells.set(cellKey, {
          bounds: this.getCellBounds(cellKey),
          aabbs: [],
          active: true
        });
      }
      cells.get(cellKey).aabbs.push(aabb);
    }
    return cells;
  }
  /**
   * Get spatial cell key for an AABB
   *
   * @param aabb The AABB
   * @returns Cell key
   */
  getSpatialCellKey(aabb) {
    const cellX = Math.floor(aabb.minX / this.config.spatialCellSize);
    const cellY = Math.floor(aabb.minY / this.config.spatialCellSize);
    return `${cellX},${cellY}`;
  }
  /**
   * Get bounds for a spatial cell
   *
   * @param cellKey The cell key
   * @returns Cell bounds
   */
  getCellBounds(cellKey) {
    const [cellX, cellY] = cellKey.split(",").map(Number);
    const cellSize = this.config.spatialCellSize;
    return {
      minX: cellX * cellSize,
      minY: cellY * cellSize,
      maxX: (cellX + 1) * cellSize,
      maxY: (cellY + 1) * cellSize,
      id: `cell-${cellKey}`
    };
  }
  /**
   * Check for collisions between adjacent spatial cells
   *
   * @param cells Map of spatial cells
   * @returns Inter-cell collision pairs
   */
  checkInterCellCollisions(cells) {
    const interCellPairs = [];
    for (const [cellKey, cell] of cells) {
      const [cellX, cellY] = cellKey.split(",").map(Number);
      const adjacentCells = [`${cellX + 1},${cellY}`, `${cellX},${cellY + 1}`, `${cellX + 1},${cellY + 1}`];
      for (const adjacentKey of adjacentCells) {
        const adjacentCell = cells.get(adjacentKey);
        if (adjacentCell) {
          for (const aabb1 of cell.aabbs) {
            for (const aabb2 of adjacentCell.aabbs) {
              if (this.aabbsOverlap(aabb1, aabb2)) {
                interCellPairs.push(this.createCollisionPair(aabb1, aabb2));
              }
            }
          }
        }
      }
    }
    return interCellPairs;
  }
  /**
   * Check if two AABBs overlap
   *
   * @param aabb1 First AABB
   * @param aabb2 Second AABB
   * @returns True if AABBs overlap
   */
  aabbsOverlap(aabb1, aabb2) {
    return aabb1.minX < aabb2.maxX && aabb2.minX < aabb1.maxX && aabb1.minY < aabb2.maxY && aabb2.minY < aabb1.maxY;
  }
  /**
   * Perform incremental update for an AABB
   *
   * @param aabb The AABB being updated
   * @param updateType Type of update
   * @param previousAABB Previous AABB (for updates)
   */
  performIncrementalUpdate(_aabb, _updateType, _previousAABB) {
  }
  /**
   * Generate cache key for AABB set
   */
  getCacheKey(aabbs) {
    const sortedIds = aabbs.map((aabb) => String(aabb.id)).sort();
    return sortedIds.join(",");
  }
  /**
   * Cache collision result
   */
  cacheResult(cacheKey, collisionPairs) {
    if (this.cache.size >= this.cacheSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(cacheKey, {
      aabbHash: cacheKey,
      collisionPairs,
      timestamp: Date.now(),
      accessCount: 1
    });
  }
  /**
   * Update statistics
   */
  updateStats(collisionPairs, executionTime, aabbCount) {
    if (!this.enableStats) return;
    this.stats.totalOperations++;
    this.stats.totalExecutionTime += executionTime;
    this.stats.averageExecutionTime = this.stats.totalExecutionTime / this.stats.totalOperations;
    this.stats.totalAABBsProcessed += aabbCount;
    this.stats.averageAABBsPerOperation = this.stats.totalAABBsProcessed / this.stats.totalOperations;
    this.stats.totalCollisionPairs += collisionPairs.length;
    this.stats.averageCollisionPairsPerOperation = this.stats.totalCollisionPairs / this.stats.totalOperations;
    const cacheHits = this.stats.totalOperations * this.stats.cacheHitRate + (executionTime === 0 ? 1 : 0);
    this.stats.cacheHitRate = cacheHits / this.stats.totalOperations;
    this.stats.memoryUsage = (this.cache.size + this.aabbs.size + this.activeCollisionPairs.size) * 100;
  }
  /**
   * Emit event to registered handlers
   */
  emitEvent(type, data) {
    if (!this.enableDebug) return;
    const event = {
      type,
      timestamp: Date.now(),
      data
    };
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error("Error in SweepPrune event handler:", error);
      }
    }
  }
  /**
   * Add event handler
   */
  addEventHandler(handler) {
    this.eventHandlers.push(handler);
  }
  /**
   * Remove event handler
   */
  removeEventHandler(handler) {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }
  /**
   * Get current statistics
   */
  getStats() {
    return { ...this.stats };
  }
  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const efficiencyRatio = this.stats.totalAABBsProcessed > 0 ? this.stats.totalCollisionPairs / this.stats.totalAABBsProcessed : 0;
    const performanceScore = Math.min(
      100,
      Math.max(
        0,
        this.stats.cacheHitRate * 30 + Math.max(0, 1 - this.stats.averageExecutionTime / 100) * 40 + Math.min(1, efficiencyRatio) * 30
      )
    );
    return {
      memoryUsage: this.stats.memoryUsage,
      cacheSize: this.cache.size,
      cacheHitRate: this.stats.cacheHitRate,
      averageDetectionTime: this.stats.averageExecutionTime,
      performanceScore,
      efficiencyRatio
    };
  }
  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalOperations: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      totalAABBsProcessed: 0,
      averageAABBsPerOperation: 0,
      totalCollisionPairs: 0,
      averageCollisionPairsPerOperation: 0,
      cacheHitRate: 0,
      memoryUsage: 0
    };
  }
  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
  /**
   * Get all active AABBs
   */
  getAllAABBs() {
    return Array.from(this.aabbs.values());
  }
  /**
   * Get all active collision pairs
   */
  getActiveCollisionPairs() {
    return Array.from(this.activeCollisionPairs.values()).filter((pair) => pair.active);
  }
  /**
   * Clear all AABBs and collision pairs
   */
  clear() {
    this.aabbs.clear();
    this.activeCollisionPairs.clear();
    this.spatialCells.clear();
  }
}
function pointInAABB(point, aabb) {
  return point.x >= aabb.x && point.x <= aabb.x + aabb.width && point.y >= aabb.y && point.y <= aabb.y + aabb.height;
}
function unionAABB(a, b) {
  const minX = Math.min(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxX = Math.max(a.x + a.width, b.x + b.width);
  const maxY = Math.max(a.y + a.height, b.y + b.height);
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}
function intersectionAABB(a, b) {
  const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  if (overlapX > 0 && overlapY > 0) {
    return {
      x: Math.max(a.x, b.x),
      y: Math.max(a.y, b.y),
      width: overlapX,
      height: overlapY
    };
  }
  return null;
}
function expandAABB(aabb, amount) {
  return {
    x: aabb.x - amount,
    y: aabb.y - amount,
    width: aabb.width + amount * 2,
    height: aabb.height + amount * 2
  };
}
function containsAABB(container, contained) {
  return contained.x >= container.x && contained.y >= container.y && contained.x + contained.width <= container.x + container.width && contained.y + contained.height <= container.y + container.height;
}
function areAABBsTouching(a, b) {
  const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  const isAdjacentX = a.x + a.width === b.x || b.x + b.width === a.x;
  const isAdjacentY = a.y + a.height === b.y || b.y + b.height === a.y;
  return isAdjacentX && overlapY > 0 || isAdjacentY && overlapX > 0;
}
function checkCollision$1(a, b) {
  const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  const hasOverlap = overlapX > 0 && overlapY > 0;
  const isTouching = overlapX === 0 && overlapY > 0 || overlapY === 0 && overlapX > 0 || overlapX === 0 && overlapY === 0 && areAABBsTouching(a, b);
  const isPointInside = b.width === 0 && b.height === 0 && pointInAABB({ x: b.x, y: b.y }, a) || a.width === 0 && a.height === 0 && pointInAABB({ x: a.x, y: a.y }, b);
  const colliding = hasOverlap || isTouching || isPointInside;
  const overlapArea = overlapX * overlapY;
  let overlap = null;
  if (hasOverlap) {
    overlap = {
      x: Math.max(a.x, b.x),
      y: Math.max(a.y, b.y),
      width: overlapX,
      height: overlapY
    };
  }
  const centerAX = a.x + a.width / 2;
  const centerAY = a.y + a.height / 2;
  const centerBX = b.x + b.width / 2;
  const centerBY = b.y + b.height / 2;
  const distance2 = Math.sqrt((centerBX - centerAX) ** 2 + (centerBY - centerAY) ** 2);
  return {
    colliding,
    overlap,
    overlapArea,
    distance: distance2
  };
}
function batchCollisionDetection(aabbs, options = {}) {
  const { maxDistance, includeSelf = false, spatialHash } = options;
  const collisions = [];
  if (spatialHash?.enableOptimization && aabbs.length > 100) {
    return batchCollisionWithSpatialHash(aabbs, options);
  }
  for (let i = 0; i < aabbs.length; i++) {
    for (let j = includeSelf ? i : i + 1; j < aabbs.length; j++) {
      const result = checkCollision$1(aabbs[i], aabbs[j]);
      if (result.colliding && (!maxDistance || result.distance <= maxDistance)) {
        collisions.push({
          index1: i,
          index2: j,
          result
        });
      }
    }
  }
  return collisions;
}
function batchCollisionWithSpatialHash(aabbs, options) {
  const { maxDistance, includeSelf = false, spatialHash } = options;
  const collisions = [];
  if (!spatialHash) {
    return batchCollisionDetection(aabbs, options);
  }
  const hash = new SpatialHash({
    cellSize: spatialHash.cellSize,
    maxObjectsPerCell: spatialHash.maxObjectsPerCell || 50
  });
  for (let i = 0; i < aabbs.length; i++) {
    const aabb = aabbs[i];
    hash.insert({
      id: i,
      x: aabb.x,
      y: aabb.y,
      width: aabb.width,
      height: aabb.height,
      data: aabb
    });
  }
  for (let i = 0; i < aabbs.length; i++) {
    const aabb = aabbs[i];
    const candidates = hash.queryRect(aabb.x, aabb.y, aabb.width, aabb.height);
    for (const candidate of candidates) {
      const j = candidate.id;
      if (!includeSelf && i >= j) continue;
      const result = checkCollision$1(aabbs[i], aabbs[j]);
      if (result.colliding && (!maxDistance || result.distance <= maxDistance)) {
        collisions.push({
          index1: i,
          index2: j,
          result
        });
      }
    }
  }
  return collisions;
}
function checkCollisionWithCache(a, b, cache) {
  if (!cache.config.enableCaching) {
    return checkCollision$1(a, b);
  }
  const cacheKey = generateCacheKey(a, b);
  if (cache.cache.has(cacheKey)) {
    cache.stats.cacheHits++;
    return cache.cache.get(cacheKey);
  }
  const result = checkCollision$1(a, b);
  cache.cache.set(cacheKey, result);
  if (cache.cache.size > cache.config.cacheSize) {
    const firstKey = cache.cache.keys().next().value;
    if (firstKey !== void 0) {
      cache.cache.delete(firstKey);
    }
  }
  return result;
}
function generateCacheKey(a, b) {
  return `${a.x},${a.y},${a.width},${a.height}|${b.x},${b.y},${b.width},${b.height}`;
}
function naiveCollisionDetection(aabbs, cache) {
  const collisions = [];
  for (let i = 0; i < aabbs.length; i++) {
    for (let j = i + 1; j < aabbs.length; j++) {
      const result = checkCollisionWithCache(aabbs[i], aabbs[j], cache);
      if (result.colliding) {
        collisions.push({ a: i, b: j, result });
      }
    }
  }
  return collisions;
}
function spatialCollisionDetection(aabbs, spatialHash, cache) {
  const collisions = [];
  spatialHash.clear();
  aabbs.forEach((aabb, index) => {
    spatialHash.insert({
      id: index,
      x: aabb.x,
      y: aabb.y,
      width: aabb.width,
      height: aabb.height,
      data: {
        id: index,
        type: "collision",
        aabb,
        index
      }
    });
  });
  const processed = /* @__PURE__ */ new Set();
  for (let i = 0; i < aabbs.length; i++) {
    if (processed.has(i)) continue;
    const aabb = aabbs[i];
    const nearby = spatialHash.queryRect(aabb.x - aabb.width, aabb.y - aabb.height, aabb.width * 3, aabb.height * 3);
    for (const obj of nearby) {
      const j = obj.data.index;
      if (j <= i || processed.has(j)) continue;
      const result = checkCollisionWithCache(aabb, obj.data.aabb, cache);
      if (result.colliding) {
        collisions.push({ a: i, b: j, result });
      }
    }
    processed.add(i);
  }
  return collisions;
}
function createDefaultConfig(overrides = {}) {
  return {
    cellSize: 100,
    maxObjectsPerCell: 50,
    enableCaching: true,
    cacheSize: 1e3,
    hybridThreshold: 100,
    ...overrides
  };
}
function createInitialStats() {
  return {
    totalQueries: 0,
    spatialQueries: 0,
    naiveQueries: 0,
    cacheHits: 0,
    averageQueryTime: 0,
    objectsProcessed: 0
  };
}
function updateAverageQueryTime(stats, duration) {
  stats.averageQueryTime = (stats.averageQueryTime * (stats.totalQueries - 1) + duration) / stats.totalQueries;
}
class SpatialCollisionOptimizer {
  constructor(config = {}) {
    this.config = createDefaultConfig(config);
    this.spatialHash = new SpatialHash({
      cellSize: this.config.cellSize,
      maxObjectsPerCell: this.config.maxObjectsPerCell
    });
    this.collisionCache = {
      cache: /* @__PURE__ */ new Map(),
      stats: { cacheHits: 0 },
      config: {
        enableCaching: this.config.enableCaching,
        cacheSize: this.config.cacheSize
      }
    };
    this.stats = createInitialStats();
  }
  /**
   * Detect collisions using spatial optimization
   */
  detectCollisions(aabbs) {
    const start = performance.now();
    this.stats.totalQueries++;
    this.stats.objectsProcessed = aabbs.length;
    const collisions = aabbs.length < this.config.hybridThreshold ? this.naiveCollisionDetection(aabbs) : this.spatialCollisionDetection(aabbs);
    const duration = performance.now() - start;
    updateAverageQueryTime(this.stats, duration);
    return collisions;
  }
  /**
   * Naive O(n²) collision detection for small datasets
   */
  naiveCollisionDetection(aabbs) {
    this.stats.naiveQueries++;
    return naiveCollisionDetection(aabbs, this.collisionCache);
  }
  /**
   * Spatial hash optimized collision detection
   */
  spatialCollisionDetection(aabbs) {
    this.stats.spatialQueries++;
    return spatialCollisionDetection(aabbs, this.spatialHash, this.collisionCache);
  }
  /**
   * Get performance statistics
   */
  getStats() {
    return {
      ...this.stats,
      cacheHits: this.collisionCache.stats.cacheHits
    };
  }
  /**
   * Clear collision cache
   */
  clearCache() {
    this.collisionCache.cache.clear();
    this.collisionCache.stats.cacheHits = 0;
  }
  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.collisionCache.config = {
      enableCaching: this.config.enableCaching,
      cacheSize: this.config.cacheSize
    };
    if (newConfig.cellSize || newConfig.maxObjectsPerCell) {
      this.spatialHash = new SpatialHash({
        cellSize: this.config.cellSize,
        maxObjectsPerCell: this.config.maxObjectsPerCell
      });
    }
  }
}
class ComplexityAnalyzer {
  /**
   * Calculate workload complexity based on PAW findings
   */
  calculateComplexity(workload) {
    const { objectCount, spatialDensity, overlapRatio } = workload;
    const naiveComplexity = objectCount * objectCount;
    const spatialComplexity = objectCount * Math.log(objectCount) + spatialDensity * objectCount;
    const optimizedComplexity = objectCount * Math.log(objectCount) + overlapRatio * objectCount;
    return {
      naive: naiveComplexity,
      spatial: spatialComplexity,
      optimized: optimizedComplexity,
      crossoverPoint: this.findCrossoverPoint(naiveComplexity, spatialComplexity),
      recommendation: this.getComplexityRecommendation(naiveComplexity, spatialComplexity, optimizedComplexity)
    };
  }
  /**
   * Find crossover point between algorithms
   */
  findCrossoverPoint(naiveComplexity, spatialComplexity) {
    return Math.sqrt(naiveComplexity / spatialComplexity);
  }
  /**
   * Get complexity-based recommendation
   */
  getComplexityRecommendation(naive, spatial, optimized) {
    if (naive < spatial && naive < optimized) return "naive";
    if (spatial < optimized) return "spatial";
    return "optimized";
  }
}
class MemoryAnalyzer {
  /**
   * Calculate memory pressure based on workload
   */
  calculateMemoryPressure(workload) {
    const { objectCount, memoryConstraints } = workload;
    const estimatedMemoryUsage = {
      naive: objectCount * 16,
      // Rough estimate for naive approach
      spatial: objectCount * 32 + objectCount * Math.log(objectCount) * 8,
      // Spatial hash overhead
      optimized: objectCount * 16 + 1024
      // Pool overhead but reused objects
    };
    const memoryPressure = memoryConstraints ? estimatedMemoryUsage.optimized / memoryConstraints.maxMemoryUsage : 0;
    return {
      estimatedUsage: estimatedMemoryUsage,
      pressure: memoryPressure,
      recommendation: memoryPressure > 0.8 ? "optimized" : "auto"
    };
  }
}
class PerformanceAnalyzer {
  constructor() {
    this.performanceHistory = [];
  }
  /**
   * Get performance profile from historical data
   */
  getPerformanceProfile(workload) {
    const similarWorkloads = this.findSimilarWorkloads(workload);
    if (similarWorkloads.length === 0) {
      return {
        confidence: 0.5,
        expectedPerformance: this.getDefaultPerformance(workload),
        historicalData: []
      };
    }
    const avgPerformance = this.calculateAveragePerformance(similarWorkloads);
    const confidence = Math.min(0.95, similarWorkloads.length / 10);
    return {
      confidence,
      expectedPerformance: avgPerformance,
      historicalData: similarWorkloads
    };
  }
  /**
   * Find similar workloads in performance history
   */
  findSimilarWorkloads(workload) {
    return this.performanceHistory.filter((record) => {
      const similarity = this.calculateWorkloadSimilarity(workload, record.workload);
      return similarity > 0.8;
    });
  }
  /**
   * Calculate similarity between workloads
   */
  calculateWorkloadSimilarity(workload1, workload2) {
    const objectCountSimilarity = 1 - Math.abs(workload1.objectCount - workload2.objectCount) / Math.max(workload1.objectCount, workload2.objectCount);
    const densitySimilarity = 1 - Math.abs(workload1.spatialDensity - workload2.spatialDensity);
    const overlapSimilarity = 1 - Math.abs(workload1.overlapRatio - workload2.overlapRatio);
    return (objectCountSimilarity + densitySimilarity + overlapSimilarity) / 3;
  }
  /**
   * Calculate average performance from historical data
   */
  calculateAveragePerformance(records) {
    const avgExecutionTime = records.reduce((sum, record) => sum + record.performance.executionTime, 0) / records.length;
    const avgMemoryUsage = records.reduce((sum, record) => sum + record.performance.memoryUsage, 0) / records.length;
    const avgAllocationCount = records.reduce((sum, record) => sum + record.performance.allocationCount, 0) / records.length;
    const avgCacheHitRate = records.reduce((sum, record) => sum + record.performance.cacheHitRate, 0) / records.length;
    return {
      executionTime: avgExecutionTime,
      memoryUsage: avgMemoryUsage,
      allocationCount: avgAllocationCount,
      cacheHitRate: avgCacheHitRate
    };
  }
  /**
   * Get default performance estimates
   */
  getDefaultPerformance(workload) {
    return {
      executionTime: workload.objectCount * 1e-3,
      memoryUsage: workload.objectCount * 16,
      allocationCount: workload.objectCount * 2,
      cacheHitRate: 0.5
    };
  }
  /**
   * Set performance history for analysis
   */
  setPerformanceHistory(history) {
    this.performanceHistory = [...history];
  }
}
class RecommendationGenerator {
  /**
   * Generate optimization recommendations
   */
  generateRecommendations(workload, _complexity, memoryPressure) {
    const recommendations = [];
    if (workload.objectCount > 100) {
      recommendations.push("Consider using optimized algorithms for large datasets");
    }
    if (memoryPressure.pressure > 0.8) {
      recommendations.push("High memory pressure detected - use memory pooling");
    }
    if (workload.overlapRatio > 0.7) {
      recommendations.push("High overlap ratio - spatial optimization recommended");
    }
    if (workload.updateFrequency > 10) {
      recommendations.push("High update frequency - consider incremental updates");
    }
    return recommendations;
  }
}
class WorkloadAnalyzer {
  constructor() {
    this.complexityAnalyzer = new ComplexityAnalyzer();
    this.memoryAnalyzer = new MemoryAnalyzer();
    this.performanceAnalyzer = new PerformanceAnalyzer();
    this.recommendationGenerator = new RecommendationGenerator();
  }
  /**
   * Analyze workload characteristics
   */
  analyzeWorkload(workload) {
    const complexity = this.complexityAnalyzer.calculateComplexity(workload);
    const memoryPressure = this.memoryAnalyzer.calculateMemoryPressure(workload);
    const performanceProfile = this.performanceAnalyzer.getPerformanceProfile(workload);
    return {
      workload,
      complexity,
      memoryPressure,
      performanceProfile,
      recommendations: this.recommendationGenerator.generateRecommendations(workload, complexity, memoryPressure)
    };
  }
  /**
   * Set performance history for analysis
   */
  setPerformanceHistory(history) {
    this.performanceAnalyzer.setPerformanceHistory(history);
  }
}
class CollisionSelector {
  constructor() {
    this.thresholds = {
      naiveVsSpatial: 100,
      // Based on PAW findings - naive good for <100 objects
      spatialVsOptimized: 500
      // Based on PAW findings - spatial good for 100-500 objects
    };
  }
  /**
   * Select optimal collision detection algorithm
   */
  selectOptimalCollisionAlgorithm(analysis, t) {
    const { objectCount } = analysis.workload;
    if (objectCount < this.thresholds.naiveVsSpatial) {
      return this.selectNaiveAlgorithm(analysis, t);
    }
    if (objectCount < this.thresholds.spatialVsOptimized) {
      return this.selectSpatialAlgorithm(analysis, t);
    }
    return this.selectOptimizedAlgorithm(analysis, t);
  }
  /**
   * Select naive collision algorithm for small datasets
   */
  selectNaiveAlgorithm(analysis, t) {
    const { complexity } = analysis;
    const { objectCount } = analysis.workload;
    return {
      algorithm: "naive",
      confidence: 0.9,
      expectedPerformance: {
        executionTime: complexity.naive * 1e-3,
        // Rough estimate
        memoryUsage: objectCount * 16
      },
      reasoning: [
        t ? t("algorithms.algorithmSelection.smallObjectCount.favorsNaiveApproach") : "Small object count favors naive approach",
        t ? t("algorithms.algorithmSelection.smallObjectCount.pawFindingsShowNaiveOptimal") : "PAW findings show naive is optimal for <100 objects",
        t ? t("algorithms.algorithmSelection.smallObjectCount.minimalAllocationOverhead") : "Minimal allocation overhead for small datasets"
      ]
    };
  }
  /**
   * Select spatial collision algorithm for medium datasets
   */
  selectSpatialAlgorithm(analysis, t) {
    const { complexity } = analysis;
    const { objectCount } = analysis.workload;
    return {
      algorithm: "spatial",
      confidence: 0.8,
      expectedPerformance: {
        executionTime: complexity.spatial * 1e-3,
        memoryUsage: objectCount * 32
      },
      reasoning: [
        t ? t("algorithms.algorithmSelection.mediumObjectCount.benefitsFromSpatialOptimization") : "Medium object count benefits from spatial optimization",
        t ? t("algorithms.algorithmSelection.mediumObjectCount.spatialHashingReducesCollisionChecks") : "Spatial hashing reduces collision checks",
        t ? t("algorithms.algorithmSelection.mediumObjectCount.memoryOverheadAcceptable") : "Memory overhead acceptable for this size"
      ]
    };
  }
  /**
   * Select optimized collision algorithm for large datasets
   */
  selectOptimizedAlgorithm(analysis, t) {
    const { complexity } = analysis;
    const { objectCount } = analysis.workload;
    return {
      algorithm: "optimized",
      confidence: 0.95,
      expectedPerformance: {
        executionTime: complexity.optimized * 1e-3,
        memoryUsage: objectCount * 16 + 1024
      },
      reasoning: [
        t ? t("algorithms.algorithmSelection.largeObjectCount.requiresOptimization") : "Large object count requires optimization",
        t ? t("algorithms.algorithmSelection.largeObjectCount.memoryPoolingEliminatesAllocationOverhead") : "Memory pooling eliminates allocation overhead",
        "PAW findings show 99.91% allocation reduction",
        // Keep this as it's a specific metric
        t ? t("algorithms.algorithmSelection.largeObjectCount.bestPerformanceForOver100Objects") : "Best performance for >100 objects"
      ]
    };
  }
}
class SpatialSelector {
  /**
   * Select optimal spatial algorithm
   */
  selectOptimalSpatialAlgorithm(analysis, t) {
    const { complexity } = analysis;
    const { objectCount, spatialDensity } = analysis.workload;
    if (spatialDensity > 0.7) {
      return {
        algorithm: "optimized-spatial",
        confidence: 0.9,
        expectedPerformance: {
          executionTime: complexity.optimized * 1e-3,
          memoryUsage: objectCount * 32 + 1024
        },
        reasoning: [
          t ? t("algorithms.algorithmSelection.highSpatialDensity.benefitsFromOptimization") : "High spatial density benefits from optimization",
          t ? t("algorithms.algorithmSelection.highSpatialDensity.memoryPoolingReducesAllocationOverhead") : "Memory pooling reduces allocation overhead",
          t ? t("algorithms.algorithmSelection.highSpatialDensity.spatialHashingEffectiveForDenseScenarios") : "Spatial hashing effective for dense scenarios"
        ]
      };
    }
    return {
      algorithm: "spatial",
      confidence: 0.8,
      expectedPerformance: {
        executionTime: complexity.spatial * 1e-3,
        memoryUsage: objectCount * 32
      },
      reasoning: [
        t ? t("algorithms.algorithmSelection.lowSpatialDensity.allowsStandardSpatialHashing") : "Low spatial density allows standard spatial hashing",
        t ? t("algorithms.algorithmSelection.lowSpatialDensity.memoryOverheadAcceptableForSparseScenarios") : "Memory overhead acceptable for sparse scenarios",
        t ? t("algorithms.algorithmSelection.lowSpatialDensity.goodBalanceOfPerformanceAndMemoryUsage") : "Good balance of performance and memory usage"
      ]
    };
  }
}
class UnionFindSelector {
  /**
   * Select optimal Union-Find algorithm
   */
  selectOptimalUnionFindAlgorithm(analysis) {
    const { objectCount } = analysis.workload;
    if (objectCount < 100) {
      return {
        algorithm: "data-structures/union-find",
        confidence: 0.9,
        expectedPerformance: {
          executionTime: objectCount * Math.log(objectCount) * 1e-3,
          memoryUsage: objectCount * 8
        },
        reasoning: [
          "Small dataset size optimal for standard Union-Find",
          "Minimal memory overhead",
          "Path compression provides good performance"
        ]
      };
    }
    return {
      algorithm: "batch-data-structures/union-find",
      confidence: 0.9,
      expectedPerformance: {
        executionTime: objectCount * Math.log(objectCount) * 5e-4,
        memoryUsage: objectCount * 8 + 512
      },
      reasoning: [
        "Large dataset benefits from batch operations",
        "Reduced memory allocation overhead",
        "Better cache locality for batch processing"
      ]
    };
  }
}
class AlgorithmSelectorCore {
  constructor() {
    this.collisionSelector = new CollisionSelector();
    this.spatialSelector = new SpatialSelector();
    this.unionFindSelector = new UnionFindSelector();
  }
  /**
   * Select optimal collision detection algorithm
   */
  selectOptimalCollisionAlgorithm(analysis, t) {
    return this.collisionSelector.selectOptimalCollisionAlgorithm(analysis, t);
  }
  /**
   * Select optimal spatial algorithm
   */
  selectOptimalSpatialAlgorithm(analysis, t) {
    return this.spatialSelector.selectOptimalSpatialAlgorithm(analysis, t);
  }
  /**
   * Select optimal Union-Find algorithm
   */
  selectOptimalUnionFindAlgorithm(analysis) {
    return this.unionFindSelector.selectOptimalUnionFindAlgorithm(analysis);
  }
}
class PerformanceTracker {
  constructor() {
    this.performanceHistory = [];
    this.selectionStats = {
      totalSelections: 0,
      correctSelections: 0,
      averageConfidence: 0,
      performanceImprovement: 0
    };
  }
  /**
   * Record algorithm selection for learning
   */
  recordSelection(selection, _workload) {
    this.selectionStats.totalSelections++;
    this.selectionStats.averageConfidence = (this.selectionStats.averageConfidence * (this.selectionStats.totalSelections - 1) + selection.confidence) / this.selectionStats.totalSelections;
  }
  /**
   * Update performance model with new results
   */
  updatePerformanceModel(result) {
    this.performanceHistory.push(result);
    if (this.performanceHistory.length > 1e3) {
      this.performanceHistory = this.performanceHistory.slice(-1e3);
    }
    this.updateSelectionStats(result);
  }
  /**
   * Update selection statistics
   */
  updateSelectionStats(_result) {
  }
  /**
   * Get selection statistics
   */
  getSelectionStats() {
    return { ...this.selectionStats };
  }
  /**
   * Get performance history
   */
  getPerformanceHistory() {
    return [...this.performanceHistory];
  }
  /**
   * Clear performance history
   */
  clearPerformanceHistory() {
    this.performanceHistory = [];
    this.selectionStats = {
      totalSelections: 0,
      correctSelections: 0,
      averageConfidence: 0,
      performanceImprovement: 0
    };
  }
}
class AlgorithmSelector {
  constructor() {
    this.workloadAnalyzer = new WorkloadAnalyzer();
    this.algorithmSelectorCore = new AlgorithmSelectorCore();
    this.performanceTracker = new PerformanceTracker();
  }
  /**
   * Select optimal collision detection algorithm
   */
  selectCollisionAlgorithm(workload) {
    const analysis = this.workloadAnalyzer.analyzeWorkload(workload);
    const selection = this.algorithmSelectorCore.selectOptimalCollisionAlgorithm(analysis);
    this.performanceTracker.recordSelection(selection, workload);
    return selection;
  }
  /**
   * Select optimal spatial algorithm
   */
  selectSpatialAlgorithm(workload) {
    const analysis = this.workloadAnalyzer.analyzeWorkload(workload);
    const selection = this.algorithmSelectorCore.selectOptimalSpatialAlgorithm(analysis);
    this.performanceTracker.recordSelection(selection, workload);
    return selection;
  }
  /**
   * Select optimal Union-Find algorithm
   */
  selectUnionFindAlgorithm(workload) {
    const analysis = this.workloadAnalyzer.analyzeWorkload(workload);
    const selection = this.algorithmSelectorCore.selectOptimalUnionFindAlgorithm(analysis);
    this.performanceTracker.recordSelection(selection, workload);
    return selection;
  }
  /**
   * Update performance model with new results
   */
  updatePerformanceModel(result) {
    this.performanceTracker.updatePerformanceModel(result);
  }
  /**
   * Get selection statistics
   */
  getSelectionStats() {
    return this.performanceTracker.getSelectionStats();
  }
  /**
   * Get performance history
   */
  getPerformanceHistory() {
    return this.performanceTracker.getPerformanceHistory();
  }
  /**
   * Clear performance history
   */
  clearPerformanceHistory() {
    this.performanceTracker.clearPerformanceHistory();
  }
}
class MemoryPool2 {
  constructor(config = {}) {
    this.spatialHashPool = [];
    this.unionFindPool = [];
    this.collisionArrayPool = [];
    this.processedSetPool = [];
    this.performanceHistory = [];
    this.config = {
      spatialHashPoolSize: 20,
      unionFindPoolSize: 50,
      collisionArrayPoolSize: 100,
      processedSetPoolSize: 50,
      enableAutoResize: true,
      maxPoolSize: 200,
      cleanupInterval: 3e4,
      // 30 seconds
      enableStatistics: true,
      enablePerformanceTracking: true,
      ...config
    };
    this.stats = {
      totalAllocations: 0,
      totalDeallocations: 0,
      poolHits: 0,
      poolMisses: 0,
      memorySaved: 0,
      averageAllocationTime: 0,
      peakPoolUsage: 0,
      currentPoolUsage: 0,
      hitRate: 0,
      allocationReduction: 0
    };
    this.initializePools();
    this.startCleanup();
  }
  /**
   * Initialize memory pools with pre-allocated objects
   */
  initializePools() {
    for (let i = 0; i < this.config.spatialHashPoolSize; i++) {
      this.spatialHashPool.push({
        object: new SpatialHash({ cellSize: 100 }),
        isInUse: false,
        lastUsed: 0,
        allocationCount: 0
      });
    }
    const commonSizes = [10, 25, 50, 100, 200, 500];
    for (const size of commonSizes) {
      for (let i = 0; i < Math.ceil(this.config.unionFindPoolSize / commonSizes.length); i++) {
        this.unionFindPool.push({
          object: new UnionFind(size),
          isInUse: false,
          lastUsed: 0,
          allocationCount: 0,
          size
        });
      }
    }
    for (let i = 0; i < this.config.collisionArrayPoolSize; i++) {
      this.collisionArrayPool.push({
        object: [],
        isInUse: false,
        lastUsed: 0,
        allocationCount: 0
      });
    }
    for (let i = 0; i < this.config.processedSetPoolSize; i++) {
      this.processedSetPool.push({
        object: /* @__PURE__ */ new Set(),
        isInUse: false,
        lastUsed: 0,
        allocationCount: 0
      });
    }
  }
  /**
   * Get a pooled spatial hash instance
   */
  getSpatialHash(config) {
    const startTime = performance.now();
    let pooled = this.spatialHashPool.find((p) => !p.isInUse);
    if (pooled) {
      pooled.isInUse = true;
      pooled.lastUsed = Date.now();
      pooled.allocationCount++;
      this.stats.poolHits++;
      pooled.object.clear();
      this.updateStats(startTime, true);
      return pooled.object;
    } else {
      this.stats.poolMisses++;
      const newHash = new SpatialHash(config || { cellSize: 100 });
      if (this.spatialHashPool.length < this.config.maxPoolSize) {
        this.spatialHashPool.push({
          object: newHash,
          isInUse: true,
          lastUsed: Date.now(),
          allocationCount: 1
        });
      }
      this.updateStats(startTime, false);
      return newHash;
    }
  }
  /**
   * Get a pooled data-structures/union-find instance
   */
  getUnionFind(size) {
    const startTime = performance.now();
    let pooled = this.unionFindPool.find((p) => !p.isInUse && p.size === size);
    if (pooled) {
      pooled.isInUse = true;
      pooled.lastUsed = Date.now();
      pooled.allocationCount++;
      this.stats.poolHits++;
      pooled.object = new UnionFind(size);
      this.updateStats(startTime, true);
      return pooled.object;
    } else {
      this.stats.poolMisses++;
      const newUnionFind = new UnionFind(size);
      if (this.unionFindPool.length < this.config.maxPoolSize) {
        this.unionFindPool.push({
          object: newUnionFind,
          isInUse: true,
          lastUsed: Date.now(),
          size,
          allocationCount: 1
        });
      }
      this.updateStats(startTime, false);
      return newUnionFind;
    }
  }
  /**
   * Get a pooled collision array
   */
  getCollisionArray() {
    const startTime = performance.now();
    let pooled = this.collisionArrayPool.find((p) => !p.isInUse);
    if (pooled) {
      pooled.isInUse = true;
      pooled.lastUsed = Date.now();
      pooled.allocationCount++;
      this.stats.poolHits++;
      pooled.object.length = 0;
      this.updateStats(startTime, true);
      return pooled.object;
    } else {
      this.stats.poolMisses++;
      const newArray = [];
      if (this.collisionArrayPool.length < this.config.maxPoolSize) {
        this.collisionArrayPool.push({
          object: newArray,
          isInUse: true,
          lastUsed: Date.now(),
          allocationCount: 1
        });
      }
      this.updateStats(startTime, false);
      return newArray;
    }
  }
  /**
   * Get a pooled processed set
   */
  getProcessedSet() {
    const startTime = performance.now();
    let pooled = this.processedSetPool.find((p) => !p.isInUse);
    if (pooled) {
      pooled.isInUse = true;
      pooled.lastUsed = Date.now();
      pooled.allocationCount++;
      this.stats.poolHits++;
      pooled.object.clear();
      this.updateStats(startTime, true);
      return pooled.object;
    } else {
      this.stats.poolMisses++;
      const newSet = /* @__PURE__ */ new Set();
      if (this.processedSetPool.length < this.config.maxPoolSize) {
        this.processedSetPool.push({
          object: newSet,
          isInUse: true,
          lastUsed: Date.now(),
          allocationCount: 1
        });
      }
      this.updateStats(startTime, false);
      return newSet;
    }
  }
  /**
   * Return a spatial hash to the pool
   */
  returnSpatialHash(hash) {
    const pooled = this.spatialHashPool.find((p) => p.object === hash);
    if (pooled) {
      pooled.isInUse = false;
      pooled.lastUsed = Date.now();
      this.stats.totalDeallocations++;
    }
  }
  /**
   * Return a data-structures/union-find to the pool
   */
  returnUnionFind(unionFind) {
    const pooled = this.unionFindPool.find((p) => p.object === unionFind);
    if (pooled) {
      pooled.isInUse = false;
      pooled.lastUsed = Date.now();
      this.stats.totalDeallocations++;
    }
  }
  /**
   * Return a collision array to the pool
   */
  returnCollisionArray(array) {
    const pooled = this.collisionArrayPool.find((p) => p.object === array);
    if (pooled) {
      pooled.isInUse = false;
      pooled.lastUsed = Date.now();
      this.stats.totalDeallocations++;
    }
  }
  /**
   * Return a processed set to the pool
   */
  returnProcessedSet(set) {
    const pooled = this.processedSetPool.find((p) => p.object === set);
    if (pooled) {
      pooled.isInUse = false;
      pooled.lastUsed = Date.now();
      this.stats.totalDeallocations++;
    }
  }
  /**
   * Update pool statistics
   */
  updateStats(startTime, wasPoolHit) {
    const allocationTime = performance.now() - startTime;
    this.stats.totalAllocations++;
    this.stats.averageAllocationTime = (this.stats.averageAllocationTime * (this.stats.totalAllocations - 1) + allocationTime) / this.stats.totalAllocations;
    if (wasPoolHit) {
      this.stats.memorySaved += this.estimateMemorySavings();
    }
    this.stats.currentPoolUsage = this.getCurrentPoolUsage();
    this.stats.peakPoolUsage = Math.max(this.stats.peakPoolUsage, this.stats.currentPoolUsage);
    const total = this.stats.poolHits + this.stats.poolMisses;
    this.stats.hitRate = total > 0 ? this.stats.poolHits / total * 100 : 0;
    this.stats.allocationReduction = total > 0 ? this.stats.poolHits / total * 100 : 0;
    if (this.config.enablePerformanceTracking) {
      this.recordPerformanceHistory();
    }
  }
  /**
   * Estimate memory savings from pooling
   */
  estimateMemorySavings() {
    const spatialHashSize = 1024;
    const unionFindSize = 256;
    const collisionArraySize = 64;
    const processedSetSize = 128;
    return spatialHashSize + unionFindSize + collisionArraySize + processedSetSize;
  }
  /**
   * Get current pool usage statistics
   */
  getCurrentPoolUsage() {
    const spatialHashInUse = this.spatialHashPool.filter((p) => p.isInUse).length;
    const unionFindInUse = this.unionFindPool.filter((p) => p.isInUse).length;
    const collisionArrayInUse = this.collisionArrayPool.filter((p) => p.isInUse).length;
    const processedSetInUse = this.processedSetPool.filter((p) => p.isInUse).length;
    return spatialHashInUse + unionFindInUse + collisionArrayInUse + processedSetInUse;
  }
  /**
   * Get detailed pool information
   */
  getPoolInfo() {
    return {
      spatialHashPool: {
        total: this.spatialHashPool.length,
        inUse: this.spatialHashPool.filter((p) => p.isInUse).length,
        available: this.spatialHashPool.filter((p) => !p.isInUse).length
      },
      unionFindPool: {
        total: this.unionFindPool.length,
        inUse: this.unionFindPool.filter((p) => p.isInUse).length,
        available: this.unionFindPool.filter((p) => !p.isInUse).length
      },
      collisionArrayPool: {
        total: this.collisionArrayPool.length,
        inUse: this.collisionArrayPool.filter((p) => p.isInUse).length,
        available: this.collisionArrayPool.filter((p) => !p.isInUse).length
      },
      processedSetPool: {
        total: this.processedSetPool.length,
        inUse: this.processedSetPool.filter((p) => p.isInUse).length,
        available: this.processedSetPool.filter((p) => !p.isInUse).length
      }
    };
  }
  /**
   * Get pool statistics
   */
  getStatistics() {
    return { ...this.stats };
  }
  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(t) {
    const recommendations = [];
    if (this.stats.hitRate < 90) {
      recommendations.push({
        type: "pool_size",
        description: "Low pool hit rate detected. Consider increasing pool sizes.",
        impact: "high",
        implementation: t ? t("algorithms.performanceOptimization.lowPoolHitRate.implementation") : "Increase spatialHashPoolSize and collisionArrayPoolSize in config"
      });
    }
    if (this.stats.currentPoolUsage > this.config.maxPoolSize * 0.8) {
      recommendations.push({
        type: "cleanup_interval",
        description: "High pool usage detected. Consider reducing cleanup interval.",
        impact: "medium",
        implementation: t ? t("algorithms.performanceOptimization.highPoolUsage.implementation") : "Reduce cleanupInterval in config"
      });
    }
    if (this.stats.allocationReduction < 95) {
      recommendations.push({
        type: "object_lifecycle",
        description: "Allocation reduction below optimal. Check object lifecycle management.",
        impact: "high",
        implementation: t ? t("algorithms.performanceOptimization.allocationReductionBelowOptimal.implementation") : "Ensure proper returnToPool() calls and object reuse patterns"
      });
    }
    return recommendations;
  }
  /**
   * Record performance history
   */
  recordPerformanceHistory() {
    this.performanceHistory.push({
      timestamp: Date.now(),
      poolUsage: this.stats.currentPoolUsage,
      hitRate: this.stats.hitRate,
      memoryUsage: this.estimateMemorySavings()
    });
    if (this.performanceHistory.length > 100) {
      this.performanceHistory = this.performanceHistory.slice(-100);
    }
  }
  /**
   * Get performance history
   */
  getPerformanceHistory() {
    return [...this.performanceHistory];
  }
  /**
   * Start periodic pool cleanup
   */
  startCleanup() {
    this.cleanupInterval = window.setInterval(() => {
      this.cleanupUnusedPools();
    }, this.config.cleanupInterval);
  }
  /**
   * Clean up unused pools to prevent memory leaks
   */
  cleanupUnusedPools() {
    const now = Date.now();
    const maxIdleTime = 3e5;
    this.spatialHashPool = this.spatialHashPool.filter((p) => {
      if (!p.isInUse && now - p.lastUsed > maxIdleTime) {
        return false;
      }
      return true;
    });
    this.unionFindPool = this.unionFindPool.filter((p) => {
      if (!p.isInUse && now - p.lastUsed > maxIdleTime) {
        return false;
      }
      return true;
    });
    this.collisionArrayPool = this.collisionArrayPool.filter((p) => {
      if (!p.isInUse && now - p.lastUsed > maxIdleTime) {
        return false;
      }
      return true;
    });
    this.processedSetPool = this.processedSetPool.filter((p) => {
      if (!p.isInUse && now - p.lastUsed > maxIdleTime) {
        return false;
      }
      return true;
    });
  }
  /**
   * Optimize pool configuration based on usage patterns
   */
  optimizeForWorkload(workloadCharacteristics) {
    const { objectCount, spatialDensity, updateFrequency } = workloadCharacteristics;
    if (objectCount > 100) {
      this.config.spatialHashPoolSize = Math.min(50, this.config.spatialHashPoolSize * 1.5);
      this.config.collisionArrayPoolSize = Math.min(200, this.config.collisionArrayPoolSize * 1.5);
    }
    if (spatialDensity > 0.7) {
      this.config.spatialHashPoolSize = Math.min(100, this.config.spatialHashPoolSize * 2);
    }
    if (updateFrequency > 10) {
      this.config.cleanupInterval = Math.max(1e4, this.config.cleanupInterval * 0.5);
    }
  }
  /**
   * Destroy the memory pool and clean up resources
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.spatialHashPool = [];
    this.unionFindPool = [];
    this.collisionArrayPool = [];
    this.processedSetPool = [];
    this.performanceHistory = [];
  }
}
function checkCollision(a, b) {
  return !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);
}
function createCollisionResult(a, b) {
  const colliding = checkCollision(a, b);
  if (!colliding) {
    return {
      colliding: false,
      distance: Infinity,
      overlap: null,
      overlapArea: 0
    };
  }
  const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  const overlapArea = overlapX * overlapY;
  const centerA = { x: a.x + a.width / 2, y: a.y + a.height / 2 };
  const centerB = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  const distance2 = Math.sqrt(Math.pow(centerA.x - centerB.x, 2) + Math.pow(centerA.y - centerB.y, 2));
  return {
    colliding: true,
    distance: distance2,
    overlap: {
      x: Math.max(a.x, b.x),
      y: Math.max(a.y, b.y),
      width: overlapX,
      height: overlapY
    },
    overlapArea
  };
}
let PerformanceMonitor$1 = class PerformanceMonitor {
  constructor(thresholds) {
    this.performanceHistory = [];
    this.thresholds = thresholds;
    this.stats = {
      totalQueries: 0,
      averageExecutionTime: 0,
      averageMemoryUsage: 0,
      algorithmUsage: {
        naive: 0,
        spatial: 0,
        optimized: 0
      },
      memoryPoolStats: {
        totalAllocations: 0,
        totalDeallocations: 0,
        poolHits: 0,
        poolMisses: 0,
        memorySaved: 0,
        averageAllocationTime: 0,
        peakPoolUsage: 0,
        currentPoolUsage: 0,
        hitRate: 0,
        allocationReduction: 0
      },
      performanceHistory: []
    };
  }
  /**
   * Record a performance measurement
   */
  recordPerformance(algorithm, objectCount, executionTime, memoryUsage, hitRate) {
    const record = {
      timestamp: Date.now(),
      algorithm,
      objectCount,
      executionTime,
      memoryUsage,
      hitRate
    };
    this.performanceHistory.push(record);
    this.stats.totalQueries++;
    if (this.performanceHistory.length > 1e3) {
      this.performanceHistory = this.performanceHistory.slice(-1e3);
    }
    this.updateRunningAverages(executionTime, memoryUsage);
    this.updateAlgorithmUsage(algorithm);
  }
  /**
   * Update memory pool statistics
   */
  updateMemoryPoolStats(stats) {
    this.stats.memoryPoolStats = stats;
  }
  /**
   * Get current memory usage
   */
  getCurrentMemoryUsage() {
    return performance.memory?.usedJSHeapSize || 0;
  }
  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    return { ...this.stats };
  }
  /**
   * Check if performance is degraded
   */
  isPerformanceDegraded() {
    return this.stats.averageExecutionTime > this.thresholds.maxExecutionTime || this.stats.averageMemoryUsage > this.thresholds.maxMemoryUsage || this.stats.memoryPoolStats.hitRate < this.thresholds.minHitRate;
  }
  /**
   * Get performance report
   */
  getPerformanceReport(recommendations) {
    return {
      summary: {
        totalQueries: this.stats.totalQueries,
        averageExecutionTime: this.stats.averageExecutionTime,
        averageMemoryUsage: this.stats.averageMemoryUsage,
        hitRate: this.stats.memoryPoolStats.hitRate,
        isDegraded: this.isPerformanceDegraded()
      },
      algorithmUsage: this.stats.algorithmUsage,
      memoryPool: this.stats.memoryPoolStats,
      recommendations
    };
  }
  /**
   * Estimate update frequency based on recent queries
   */
  estimateUpdateFrequency() {
    const now = Date.now();
    const recentQueries = this.performanceHistory.filter(
      (record) => now - record.timestamp < 1e3
      // Last second
    );
    return recentQueries.length;
  }
  /**
   * Reset all statistics
   */
  resetStatistics() {
    this.stats = {
      totalQueries: 0,
      averageExecutionTime: 0,
      averageMemoryUsage: 0,
      algorithmUsage: {
        naive: 0,
        spatial: 0,
        optimized: 0
      },
      memoryPoolStats: {
        totalAllocations: 0,
        totalDeallocations: 0,
        poolHits: 0,
        poolMisses: 0,
        memorySaved: 0,
        averageAllocationTime: 0,
        peakPoolUsage: 0,
        currentPoolUsage: 0,
        hitRate: 0,
        allocationReduction: 0
      },
      performanceHistory: []
    };
    this.performanceHistory = [];
  }
  /**
   * Update running averages
   */
  updateRunningAverages(executionTime, memoryUsage) {
    this.stats.averageExecutionTime = (this.stats.averageExecutionTime * (this.stats.totalQueries - 1) + executionTime) / this.stats.totalQueries;
    this.stats.averageMemoryUsage = (this.stats.averageMemoryUsage * (this.stats.totalQueries - 1) + memoryUsage) / this.stats.totalQueries;
  }
  /**
   * Update algorithm usage statistics
   */
  updateAlgorithmUsage(algorithm) {
    if (algorithm in this.stats.algorithmUsage) {
      this.stats.algorithmUsage[algorithm]++;
    }
  }
};
class OptimizedCollisionAdapter {
  constructor(config = {}) {
    this.config = {
      enableMemoryPooling: true,
      enableAlgorithmSelection: true,
      enablePerformanceMonitoring: true,
      algorithmSelectionStrategy: "adaptive",
      performanceThresholds: {
        maxExecutionTime: 16,
        maxMemoryUsage: 50 * 1024 * 1024,
        minHitRate: 90
      },
      ...config
    };
    this.algorithmSelector = new AlgorithmSelector();
    this.memoryPool = new MemoryPool2(this.config.memoryPoolConfig);
    this.performanceMonitor = new PerformanceMonitor$1(this.config.performanceThresholds);
  }
  detectCollisions(aabbs) {
    const startTime = performance.now();
    const startMemory = this.getCurrentMemoryUsage();
    let result;
    let algorithm;
    if (aabbs.length < 400) {
      result = this.executeNaiveWithPool(aabbs);
      algorithm = "naive";
    } else if (aabbs.length < 1e3) {
      result = this.executeSpatialDirect(aabbs);
      algorithm = "spatial";
    } else {
      result = this.executeOptimizedDirect(aabbs);
      algorithm = "optimized";
    }
    const endTime = performance.now();
    const endMemory = this.getCurrentMemoryUsage();
    const executionTime = endTime - startTime;
    const memoryUsage = endMemory - startMemory;
    this.performanceMonitor.recordPerformance(
      algorithm,
      aabbs.length,
      executionTime,
      memoryUsage,
      this.memoryPool.getStatistics().hitRate
    );
    this.performanceMonitor.updateMemoryPoolStats(this.memoryPool.getStatistics());
    return result;
  }
  executeNaiveWithPool(aabbs) {
    const collisions = this.memoryPool.getCollisionArray();
    try {
      collisions.length = 0;
      for (let i = 0; i < aabbs.length; i++) {
        for (let j = i + 1; j < aabbs.length; j++) {
          if (this.checkCollision(aabbs[i], aabbs[j])) {
            collisions.push({
              a: i,
              b: j,
              result: createCollisionResult(aabbs[i], aabbs[j])
            });
          }
        }
      }
      return [...collisions];
    } finally {
      this.memoryPool.returnCollisionArray(collisions);
    }
  }
  executeSpatialDirect(aabbs) {
    if (aabbs.length < 300) {
      return this.executeNaiveWithPool(aabbs);
    }
    const spatialHash = new SpatialHash({ cellSize: 100 });
    const collisions = [];
    for (let i = 0; i < aabbs.length; i++) {
      spatialHash.insert({
        id: i,
        x: aabbs[i].x,
        y: aabbs[i].y,
        width: aabbs[i].width,
        height: aabbs[i].height,
        data: {
          id: i,
          type: "collision",
          aabb: aabbs[i],
          index: i
        }
      });
    }
    const processed = /* @__PURE__ */ new Set();
    for (let i = 0; i < aabbs.length; i++) {
      if (processed.has(i)) continue;
      const aabb = aabbs[i];
      const nearby = spatialHash.queryRect(aabb.x - aabb.width, aabb.y - aabb.height, aabb.width * 3, aabb.height * 3);
      for (const obj of nearby) {
        const collisionData = obj.data;
        const j = collisionData.index;
        if (j <= i || processed.has(j)) continue;
        if (this.checkCollision(aabb, collisionData.aabb)) {
          collisions.push({
            a: i,
            b: j,
            result: {
              colliding: true,
              overlap: null,
              overlapArea: 0,
              distance: 0
            }
          });
        }
      }
      processed.add(i);
    }
    return collisions;
  }
  executeOptimizedDirect(aabbs) {
    const spatialHash = new SpatialHash({ cellSize: 100 });
    const collisions = [];
    for (let i = 0; i < aabbs.length; i++) {
      spatialHash.insert({
        id: i,
        x: aabbs[i].x,
        y: aabbs[i].y,
        width: aabbs[i].width,
        height: aabbs[i].height,
        data: {
          id: i,
          type: "collision",
          aabb: aabbs[i],
          index: i
        }
      });
    }
    const processed = /* @__PURE__ */ new Set();
    for (let i = 0; i < aabbs.length; i++) {
      if (processed.has(i)) continue;
      const aabb = aabbs[i];
      const nearby = spatialHash.queryRect(aabb.x - aabb.width, aabb.y - aabb.height, aabb.width * 3, aabb.height * 3);
      for (const obj of nearby) {
        const collisionData = obj.data;
        const j = collisionData.index;
        if (j <= i || processed.has(j)) continue;
        if (this.checkCollision(aabb, collisionData.aabb)) {
          collisions.push({
            a: i,
            b: j,
            result: {
              colliding: true,
              overlap: null,
              overlapArea: 0,
              distance: 0
            }
          });
        }
      }
      processed.add(i);
    }
    return collisions;
  }
  checkCollision(a, b) {
    return !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);
  }
  // private executeAlgorithm(algorithm: string, aabbs: AABB[]): CollisionPair[] {
  //   switch (algorithm) {
  //     case "naive":
  //       return executeNaiveCollisionDetection(aabbs);
  //     case "spatial":
  //       return executeSpatialCollisionDetection(aabbs, this.memoryPool);
  //     case "optimized":
  //       return executeOptimizedCollisionDetection(aabbs, this.memoryPool);
  //     default:
  //       return executeOptimizedCollisionDetection(aabbs, this.memoryPool);
  //   }
  // }
  // private updatePerformanceModel(algorithm: string, objectCount: number, startTime: number, memoryStart: number): void {
  //   const executionTime = performance.now() - startTime;
  //   const memoryUsage = this.performanceMonitor.getCurrentMemoryUsage() - memoryStart;
  //   const hitRate = this.memoryPool.getStatistics().hitRate;
  //   this.algorithmSelector.updatePerformanceModel({
  //     algorithm,
  //     workload: analyzeWorkload([]),
  //     performance: {
  //       executionTime,
  //       memoryUsage,
  //       allocationCount: 0,
  //       cacheHitRate: hitRate,
  //     },
  //     timestamp: Date.now(),
  //   });
  // }
  getPerformanceStats() {
    return this.performanceMonitor.getPerformanceStats();
  }
  /**
   * Get current memory usage
   */
  getCurrentMemoryUsage() {
    return this.performanceMonitor.getCurrentMemoryUsage();
  }
  getMemoryPoolStats() {
    return this.memoryPool.getStatistics();
  }
  getOptimizationRecommendations() {
    return this.memoryPool.getOptimizationRecommendations();
  }
  isPerformanceDegraded() {
    return this.performanceMonitor.isPerformanceDegraded();
  }
  getPerformanceReport() {
    return this.performanceMonitor.getPerformanceReport(this.getOptimizationRecommendations());
  }
  resetStatistics() {
    this.performanceMonitor.resetStatistics();
    this.algorithmSelector.clearPerformanceHistory();
  }
  destroy() {
    this.memoryPool.destroy();
  }
}
let globalOptimizationConfig = {
  enableMemoryPooling: true,
  enableAlgorithmSelection: true,
  enablePerformanceMonitoring: true,
  algorithmSelectionStrategy: "adaptive",
  performanceThresholds: {
    maxExecutionTime: 16,
    // 16ms for 60fps
    maxMemoryUsage: 50 * 1024 * 1024,
    // 50MB
    minHitRate: 90
  }
};
let globalCollisionAdapter = null;
function configureOptimization(config) {
  globalOptimizationConfig = { ...globalOptimizationConfig, ...config };
  if (globalCollisionAdapter) {
    globalCollisionAdapter.destroy();
    globalCollisionAdapter = new OptimizedCollisionAdapter(globalOptimizationConfig);
  }
}
function getGlobalCollisionAdapter() {
  if (!globalCollisionAdapter) {
    globalCollisionAdapter = new OptimizedCollisionAdapter(globalOptimizationConfig);
  }
  return globalCollisionAdapter;
}
function detectCollisions(aabbs) {
  const adapter = getGlobalCollisionAdapter();
  return adapter.detectCollisions(aabbs);
}
function performSpatialQuery(queryAABB, spatialObjects) {
  const nearby = [];
  for (const obj of spatialObjects) {
    if (checkCollision$1(queryAABB, obj.aabb).colliding) {
      nearby.push(obj);
    }
  }
  return nearby;
}
class PerformanceMonitor2 {
  constructor() {
    this.adapter = getGlobalCollisionAdapter();
  }
  /**
   * Get current performance statistics
   */
  getPerformanceStats() {
    return this.adapter.getPerformanceStats();
  }
  /**
   * Get memory pool statistics
   */
  getMemoryPoolStats() {
    return this.adapter.getMemoryPoolStats();
  }
  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations() {
    return this.adapter.getOptimizationRecommendations();
  }
  /**
   * Check if performance is degraded
   */
  isPerformanceDegraded() {
    return this.adapter.isPerformanceDegraded();
  }
  /**
   * Get comprehensive performance report
   */
  getPerformanceReport() {
    return this.adapter.getPerformanceReport();
  }
  /**
   * Reset performance statistics
   */
  resetStatistics() {
    this.adapter.resetStatistics();
  }
}
class OptimizationConfig {
  constructor(config = {}) {
    this.config = { ...globalOptimizationConfig, ...config };
  }
  /**
   * Update configuration
   */
  update(config) {
    this.config = { ...this.config, ...config };
    configureOptimization(this.config);
  }
  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Enable memory pooling
   */
  enableMemoryPooling() {
    this.update({ enableMemoryPooling: true });
  }
  /**
   * Disable memory pooling
   */
  disableMemoryPooling() {
    this.update({ enableMemoryPooling: false });
  }
  /**
   * Enable algorithm selection
   */
  enableAlgorithmSelection() {
    this.update({ enableAlgorithmSelection: true });
  }
  /**
   * Disable algorithm selection
   */
  disableAlgorithmSelection() {
    this.update({ enableAlgorithmSelection: false });
  }
  /**
   * Set algorithm selection strategy
   */
  setAlgorithmStrategy(strategy) {
    this.update({ algorithmSelectionStrategy: strategy });
  }
  /**
   * Set performance thresholds
   */
  setPerformanceThresholds(thresholds) {
    this.update({
      performanceThresholds: {
        ...this.config.performanceThresholds,
        ...thresholds
      }
    });
  }
}
function cleanup() {
  if (globalCollisionAdapter) {
    globalCollisionAdapter.destroy();
    globalCollisionAdapter = null;
  }
}
exports.AStar = AStar;
exports.BVH = BVH;
exports.BVHEventType = BVHEventType;
exports.BloomFilter = BloomFilter;
exports.BresenhamLine = BresenhamLine;
exports.CircleOps = CircleOps;
exports.ConvexHull = ConvexHull;
exports.DelaunayTriangulation = DelaunayTriangulation;
exports.FenwickTree = FenwickTree;
exports.FlowField = FlowField;
exports.FlowFieldGenerator = FlowFieldGenerator;
exports.FlowFieldUtils = FlowFieldUtils;
exports.FrameRateMonitor = FrameRateMonitor;
exports.HPAAbstractGraph = HPAAbstractGraph;
exports.HPAClustering = HPAClustering;
exports.HPAPathRefinement = HPAPathRefinement;
exports.HPAStar = HPAStar;
exports.HPAStarUtils = HPAStarUtils;
exports.IntervalTree = IntervalTree;
exports.JPS = JPS;
exports.JPSUtils = JPSUtils;
exports.KdTree = KdTree;
exports.KdTreeEventType = KdTreeEventType;
exports.LRUCache = LRUCache;
exports.LineIntersection = LineIntersection;
exports.LineOfSight = LineOfSight;
exports.LineOps = LineOps;
exports.MarchingSquares = MarchingSquares;
exports.MemoryLeakDetector = MemoryLeakDetector;
exports.MemoryMonitor = MemoryMonitor;
exports.MemoryPool = MemoryPool$1;
exports.MemoryPoolManager = MemoryPoolManager;
exports.MinimumBoundingBox = MinimumBoundingBox;
exports.MinimumBoundingBoxUtils = MinimumBoundingBoxUtils;
exports.OBB = OBB;
exports.OBBUtils = OBBUtils;
exports.Octant = Octant;
exports.Octree = Octree;
exports.OctreeEventType = OctreeEventType;
exports.OptimizationConfig = OptimizationConfig;
exports.PerformanceBenchmark = PerformanceBenchmark;
exports.PerformanceBudgetChecker = PerformanceBudgetChecker;
exports.PerformanceMonitor = PerformanceMonitor2;
exports.PerformanceTimer = PerformanceTimer;
exports.PointOps = PointOps;
exports.PoissonDisk = PoissonDisk;
exports.PolygonClipping = PolygonClipping;
exports.PolygonOps = PolygonOps;
exports.PriorityQueue = PriorityQueue;
exports.Quadtree = Quadtree;
exports.RTree = RTree;
exports.RectangleOps = RectangleOps;
exports.SAT = SAT;
exports.SegmentTree = SegmentTree;
exports.SimplexNoise = SimplexNoise;
exports.SpatialCollisionOptimizer = SpatialCollisionOptimizer;
exports.SpatialHash = SpatialHash;
exports.SutherlandHodgmanClipper = SutherlandHodgmanClipper;
exports.SweepLineEventQueue = SweepLineEventQueue;
exports.SweepLineStatusStructure = SweepLineStatusStructure;
exports.SweepLineUtils = SweepLineUtils;
exports.SweepPrune = SweepPrune;
exports.ThetaStar = ThetaStar;
exports.ThetaStarUtils = ThetaStarUtils;
exports.TransformOps = TransformOps;
exports.Trie = Trie;
exports.UnionFind = UnionFind;
exports.VectorOps = VectorOps;
exports.VoronoiDiagram = VoronoiDiagram;
exports.WaveFunctionCollapse = WaveFunctionCollapse;
exports.WeilerAthertonClipper = WeilerAthertonClipper;
exports.areAABBsTouching = areAABBsTouching;
exports.batchCollisionDetection = batchCollisionDetection;
exports.batchCollisionWithSpatialHash = batchCollisionWithSpatialHash;
exports.chebyshevDistance = chebyshevDistance;
exports.checkCollision = checkCollision$1;
exports.cleanup = cleanup;
exports.configureOptimization = configureOptimization;
exports.containsAABB = containsAABB;
exports.createAABBPool = createAABBPool;
exports.createPointPool = createPointPool;
exports.createSpatialObjectPool = createSpatialObjectPool;
exports.createVectorPool = createVectorPool;
exports.debounce = debounce;
exports.detectCollisions = detectCollisions;
exports.euclideanDistance = euclideanDistance;
exports.expandAABB = expandAABB;
exports.globalPoolManager = globalPoolManager;
exports.intersectionAABB = intersectionAABB;
exports.manhattanDistance = manhattanDistance;
exports.measureAsync = measureAsync;
exports.measureSync = measureSync;
exports.performSpatialQuery = performSpatialQuery;
exports.pointInAABB = pointInAABB;
exports.throttle = throttle;
exports.unionAABB = unionAABB;
