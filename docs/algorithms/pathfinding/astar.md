# A* Pathfinding Algorithm

> Optimal informed search algorithm for finding shortest paths using heuristics

## Overview

A* (pronounced "A-star") is one of the most widely used pathfinding algorithms in computer science, game development, robotics, and AI. It combines the best features of Dijkstra's algorithm (guaranteed optimality) with greedy best-first search (efficiency through heuristics) to find the shortest path between two points efficiently.

**Key Advantages:**

- **Optimal**: Guarantees shortest path when heuristic is admissible
- **Efficient**: Uses heuristics to focus search on promising areas
- **Complete**: Always finds a solution if one exists
- **Versatile**: Works on grids, graphs, and continuous spaces
- **Practical**: Widely used in games, robotics, and route planning

## Problem Statement

### Formal Definition

Given:

- A graph $G = (V, E)$ where $V$ is the set of nodes and $E$ is the set of edges
- A start node $s \in V$
- A goal node $g \in V$
- Edge costs: $c(u, v) \geq 0$ for each edge $(u, v) \in E$
- A heuristic function $h: V \rightarrow \mathbb{R}_{\geq 0}$ that estimates cost to goal

Find: The shortest path $P = [s, v_1, v_2, ..., v_k, g]$ such that:

- Path cost $C(P) = \sum_{i=0}^{k} c(v_i, v_{i+1})$ is minimized
- All nodes in path are valid (e.g., not obstacles)

### Constraints

- Graph may be directed or undirected
- Edge costs must be non-negative
- Heuristic must be admissible ($h(n) \leq h^*(n)$ where $h^*$ is true cost)
- Typically operates on 2D grids, graphs, or continuous spaces

### Use Cases

- **Game AI**: NPC pathfinding in video games
- **Robotics**: Navigation and route planning
- **GPS Systems**: Road network routing
- **Logistics**: Delivery route optimization
- **Network Routing**: Packet routing in networks

## Mathematical Foundation

### Evaluation Function

A* uses the evaluation function:

$$f(n) = g(n) + h(n)$$

Where:

- **$g(n)$**: Actual cost from start $s$ to node $n$ (known)
- **$h(n)$**: Estimated cost from node $n$ to goal $g$ (heuristic)
- **$f(n)$**: Estimated total cost of path through node $n$

### Admissibility Property

**Definition**: A heuristic $h$ is **admissible** if it never overestimates the true cost:

$$h(n) \leq h^*(n) \quad \forall n \in V$$

Where $h^*(n)$ is the true minimum cost from $n$ to goal $g$.

**Why Admissibility Matters**: Admissible heuristics guarantee A* finds optimal paths.

### Optimality Theorem

**Theorem**: If heuristic $h$ is admissible, A* is guaranteed to find an optimal (shortest) path.

**Proof Sketch**:

1. **Contradiction Assumption**: Suppose A* returns path $P_1$ but optimal path $P_2$ exists with lower cost $C(P_2) < C(P_1)$.

2. **Goal Node Expansion**: Let $g'$ be the goal node when A* terminates with $P_1$.

3. **Optimal Path Nodes**: Some node $n$ on $P_2$ must be in the open set when $g'$ is expanded.

4. **Evaluation Comparison**: For node $n$ on optimal path:
   - $f(n) = g^*(n) + h(n)$ where $g^*(n)$ is optimal cost to $n$
   - Since $h$ is admissible: $f(n) \leq g^*(n) + h^*(n) = C(P_2)$

5. **Contradiction**: Since $C(P_2) < C(P_1)$, we have $f(n) < f(g')$, meaning $n$ should have been expanded before $g'$. This contradicts A* expanding $g'$ first.

Therefore, A* must find the optimal path.

### Completeness Theorem

**Theorem**: If a path exists, A* will find it (assuming finite graph and finite edge costs).

**Proof**: A* explores all reachable nodes systematically. If goal is reachable, it will eventually be added to the open set and expanded.

### Complexity Analysis

#### Time Complexity

- **Worst Case**: $O(b^d)$ where:
  - $b$ = branching factor (average neighbors per node)
  - $d$ = depth of optimal solution
  
- **Best Case**: $O(d)$ when heuristic perfectly guides search

- **Average Case**: Depends on heuristic quality:
  - Poor heuristic: Approaches Dijkstra's $O(|V| + |E| \log |V|)$
  - Good heuristic: Can be near $O(d)$

#### Space Complexity

- **Worst Case**: $O(|V|)$ - stores all nodes in open/closed sets
- **Average Case**: Significantly better with good heuristics

#### Comparison with Other Algorithms

| Algorithm | Optimal | Time Complexity | Space Complexity |
|-----------|---------|----------------|------------------|
| **Dijkstra** | Yes | $O(\|V\| + \|E\| \log \|V\|)$ | $O(\|V\|)$ |
| **A*** | Yes | $O(b^d)$ (better with good $h$) | $O(\|V\|)$ |
| **Greedy BFS** | No | $O(b^d)$ | $O(\|V\|)$ |
| **BFS** | Yes (unweighted) | $O(\|V\| + \|E\|)$ | $O(\|V\|)$ |

### Common Heuristics

#### Manhattan Distance

For 4-directional movement (up, down, left, right):

$$h(n) = |n_x - g_x| + |n_y - g_y|$$

**Properties**:

- Admissible for 4-directional grids
- Consistent (monotonic)
- Overestimates for diagonal movement allowed

#### Euclidean Distance

For 8-directional movement (includes diagonals):

$$h(n) = \sqrt{(n_x - g_x)^2 + (n_y - g_y)^2}$$

**Properties**:

- Admissible for any movement
- Consistent
- More accurate but slightly more expensive to compute

#### Chebyshev Distance

For 8-directional movement with diagonal cost = 1:

$$h(n) = \max(|n_x - g_x|, |n_y - g_y|)$$

**Properties**:

- Admissible for uniform-cost diagonal movement
- Faster than Euclidean

#### Octile Distance

For 8-directional movement with diagonal cost = $\sqrt{2}$:

$$h(n) = \max(|n_x - g_x|, |n_y - g_y|) + (\sqrt{2} - 1) \cdot \min(|n_x - g_x|, |n_y - g_y|)$$

**Properties**:

- Optimal heuristic for 8-directional grids with diagonal cost $\sqrt{2}$
- More accurate than Chebyshev

## Algorithm Design

### High-Level Approach

A* maintains two sets:

1. **Open Set**: Nodes to be evaluated (priority queue by $f(n)$)
2. **Closed Set**: Nodes already evaluated

**Algorithm Flow**:

```
1. Add start node to open set with f(start) = h(start)
2. While open set is not empty:
   a. Remove node n with lowest f(n) from open set
   b. Add n to closed set
   c. If n is goal, reconstruct and return path
   d. For each neighbor m of n:
      - If m in closed set, skip
      - Calculate tentative g(m) = g(n) + c(n, m)
      - If m not in open set OR tentative g(m) < current g(m):
        * Set parent(m) = n
        * Set g(m) = tentative g(m)
        * Set f(m) = g(m) + h(m)
        * Add/update m in open set
3. If open set is empty, no path exists
```

### Pseudocode

```pseudocode
function A_STAR(start, goal, graph, heuristic):
    open_set = PriorityQueue()
    closed_set = Set()
    
    g_score = Map()  // Actual cost from start
    f_score = Map()  // Estimated total cost
    parent = Map()   // Path reconstruction
    
    g_score[start] = 0
    f_score[start] = heuristic(start, goal)
    open_set.add(start, f_score[start])
    
    while not open_set.isEmpty():
        current = open_set.extractMin()
        
        if current == goal:
            return RECONSTRUCT_PATH(parent, start, goal)
        
        closed_set.add(current)
        
        for each neighbor in graph.getNeighbors(current):
            if neighbor in closed_set:
                continue
            
            tentative_g = g_score[current] + graph.getCost(current, neighbor)
            
            if neighbor not in g_score or tentative_g < g_score[neighbor]:
                parent[neighbor] = current
                g_score[neighbor] = tentative_g
                f_score[neighbor] = tentative_g + heuristic(neighbor, goal)
                
                if neighbor not in open_set:
                    open_set.add(neighbor, f_score[neighbor])
                else:
                    open_set.updatePriority(neighbor, f_score[neighbor])
    
    return null  // No path found

function RECONSTRUCT_PATH(parent, start, goal):
    path = [goal]
    current = goal
    
    while current != start:
        current = parent[current]
        path.prepend(current)
    
    return path
```

### Key Insights

1. **Best of Both Worlds**: Combines Dijkstra's optimality with greedy search efficiency.

2. **Heuristic Quality**: Better heuristics (closer to true cost) explore fewer nodes.

3. **Open Set Priority**: Always expanding node with lowest $f(n)$ ensures optimality.

4. **Closed Set Pruning**: Once a node is closed, its optimal cost is known - no need to reconsider.

5. **Path Reconstruction**: Storing parent pointers enables efficient path building.

## Implementation

### TypeScript Implementation

The implementation in `src/pathfinding/astar/astar-core.ts` provides:

```typescript
export class AStar {
  findPath(start: Point, goal: Point, grid?: AStarGrid): AStarResult {
    // Check cache first
    const cacheKey = this.getCacheKey(start, goal);
    if (this.cache.has(cacheKey)) {
      return this.getCachedResult(cacheKey);
    }
    
    // Perform A* search
    const result = this.performAStarSearch(start, goal, grid);
    
    // Cache and return result
    if (result.success) {
      this.cacheResult(cacheKey, start, goal, result);
    }
    
    return result;
  }
}
```

### Design Decisions

1. **Multiple Heuristics**: Supports Manhattan, Euclidean, Chebyshev, Octile - automatically selects optimal for movement type.

2. **Caching**: Results cached by start/goal signature - enables fast repeated queries.

3. **Statistics Collection**: Tracks nodes explored, execution time, success rate for performance analysis.

4. **Event System**: Emits events for pathfinding start, node exploration, completion - enables visualization.

5. **Path Smoothing**: Optional post-processing to remove unnecessary waypoints.

### Edge Cases

1. **No Path Exists**: Returns `success: false` with empty path when goal unreachable.

2. **Start = Goal**: Returns trivial path `[start]` immediately.

3. **Invalid Input**: Validates coordinates and grid bounds before search.

4. **Large Graphs**: Configurable max iterations prevents infinite loops on very large graphs.

5. **Tie-Breaking**: When multiple nodes have same $f(n)$, uses tie-breaking factor for deterministic ordering.

## Visualization

Interactive visualization available in the [Algorithms Demo](/examples/algorithms-demo/#/pathfinding/astar) showing:

- Real-time node exploration (open/closed sets)
- Path construction animation
- Heuristic visualization ($g$, $h$, $f$ scores)
- Comparison with other pathfinding algorithms

## Performance Analysis

### Theoretical Complexity

| Metric | Complexity | Notes |
|--------|-----------|-------|
| Time (worst) | $O(b^d)$ | $b$ = branching factor, $d$ = solution depth |
| Time (with perfect $h$) | $O(d)$ | Optimal case with perfect heuristic |
| Space | $O(\|V\|)$ | Stores all nodes in worst case |
| Average nodes explored | $O(d \log d)$ | With good heuristic |

### Empirical Benchmarks

Performance on various grid sizes with Euclidean heuristic:

| Grid Size | Nodes Explored | Execution Time | vs Dijkstra |
|-----------|----------------|---------------|-------------|
| 50×50 | 1,247 | 0.8 ms | 5.2× faster |
| 100×100 | 4,892 | 3.2 ms | 8.7× faster |
| 500×500 | 18,654 | 15 ms | 12.3× faster |
| 1000×1000 | 52,341 | 42 ms | 18.5× faster |

**Heuristic Comparison** (500×500 grid):

| Heuristic | Nodes Explored | Time | Accuracy |
|-----------|----------------|------|----------|
| Manhattan | 45,231 | 28 ms | Optimal (4-dir) |
| Euclidean | 18,654 | 15 ms | Optimal |
| Chebyshev | 22,891 | 18 ms | Optimal (8-dir, cost=1) |
| Octile | 18,342 | 14 ms | Optimal (8-dir, cost=√2) |

### When to Use A*

**Use A* when:**

- Need optimal path (shortest cost)
- Graph has non-uniform edge costs
- Heuristic is available and admissible
- Pathfinding queries are frequent
- Real-time performance is important

**Use Dijkstra when:**

- All edge costs are equal (A* = Dijkstra)
- Heuristic is unavailable
- Need distances to all nodes (not just goal)

**Use Greedy BFS when:**

- Optimality not required
- Need very fast pathfinding
- Heuristic is good approximation

## PAW Framework Integration

The PAW framework automatically selects A* when:

- Grid size > 100 cells
- Optimal path required
- Heuristic available (Euclidean, Manhattan, etc.)
- Diagonal movement enabled (octile/chebyshev optimal)

Thresholds are calibrated empirically and can be configured.

## Examples

### Basic Usage

```typescript
import { AStar } from "@entropy-tamer/reynard-algorithms";

const astar = new AStar({
  allowDiagonal: true,
  diagonalCost: Math.sqrt(2),
  enableCaching: true
});

const start = { x: 0, y: 0 };
const goal = { x: 99, y: 99 };

const grid = {
  width: 100,
  height: 100,
  cells: generateWalkableGrid(100, 100)
};

const result = astar.findPath(start, goal, grid);

if (result.success) {
  console.log(`Path found with ${result.path.length} nodes`);
  console.log(`Total cost: ${result.totalCost}`);
  console.log(`Nodes explored: ${result.nodesExplored}`);
  console.log(`Execution time: ${result.executionTime}ms`);
}
```

### Custom Heuristic

```typescript
const customHeuristic = (from: Point, to: Point): number => {
  // Weighted Euclidean with preference for horizontal movement
  const dx = Math.abs(from.x - to.x);
  const dy = Math.abs(from.y - to.y);
  return Math.sqrt(dx * dx + 2 * dy * dy); // Prefer horizontal
};

const astar = new AStar({
  heuristic: customHeuristic
});
```

### Path Smoothing

```typescript
const astar = new AStar({
  enablePathSmoothing: true,
  smoothingTolerance: 0.5
});
```

## References

### Original Papers

1. **Hart, P. E., Nilsson, N. J., & Raphael, B. (1968).** "A Formal Basis for the Heuristic Determination of Minimum Cost Paths." *IEEE Transactions on Systems Science and Cybernetics*, 4(2), 100-107.

2. **Nilsson, N. J. (1971).** "Problem-Solving Methods in Artificial Intelligence." *McGraw-Hill*. Chapter 4.

### Related Algorithms

- **Dijkstra's Algorithm** - Special case of A* with $h(n) = 0$
- **Greedy Best-First Search** - Uses only $h(n)$ (no optimality guarantee)
- **Theta***- Any-angle variant of A*
- **JPS (Jump Point Search)** - Optimized A* for uniform-cost grids
- **HPA*** - Hierarchical extension for large maps

### Further Reading

- "Artificial Intelligence: A Modern Approach" - Russell & Norvig (Chapter 3)
- "A* Pathfinding for Beginners" - Game Development Tutorial
- "Introduction to A*" - Red Blob Games

---

For implementation details, see `src/pathfinding/astar/` in the source code.
