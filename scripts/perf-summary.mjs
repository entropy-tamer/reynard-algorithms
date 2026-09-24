#!/usr/bin/env node
/**
 * Final performance summary — measure actual A* on realistic workloads.
 */
const { AStar } = await import('../dist/index.cjs');

console.log('=== A* Pathfinding Performance Summary ===\n');
console.log('After binary heap optimization (O(log n) per extraction vs O(n))\n');

// Test configurations from the audit report
const configs = [
  { sz: 50, seed: 42, label: 'Small grid (50×50)' },
  { sz: 100, seed: 77, label: 'Medium grid (100×100)' },
  { sz: 200, seed: 131, label: 'Large grid (200×200)' },
];

const astar = new AStar({ enableCaching: false });

for (const cfg of configs) {
  const cells = [];
  for (let y=0; y<cfg.sz; y++) {
    const row = new Array(cfg.sz);
    let s = ((y*97 + cfg.seed*53 + 42) | 0);
    for (let x=0; x<cfg.sz; x++) {
      s = ((s * 1664525 + 1013904223) | 0) >>> 0;
      row[x] = Math.random() > 0.2; // 80% walkable
    }
    cells.push(row);
  }
  
  const grid = { width: cfg.sz, height: cfg.sz, cellSize: 1, cells };
  
  console.log(`\n${cfg.label}: start=(5,5) → goal=(${cfg.sz-6},${cfg.sz-6})`);
  
  // Warmup
  astar.findPath({x:5,y:5}, {x:cfg.sz-6,y:cfg.sz-6}, grid);
  
  let totalTime = 0;
  let totalNodes = 0;
  const results = [];
  
  for (let i=0; i<10; i++) {
    const t = performance.now();
    const r = astar.findPath({x:5,y:5}, {x:cfg.sz-6,y:cfg.sz-6}, grid);
    totalTime += performance.now() - t;
    
    results.push(r.elapsed !== undefined ? r.executionTime : (performance.now() - t));
    totalNodes += r.nodesExplored;
  }
  
  const avgMs = (totalTime / results.length).toFixed(3);
  const maxMs = Math.max(...results.map(r => typeof r === 'number' ? r : performance.now()-r)).toFixed(3);
  
  console.log(`  Avg: ${avgMs}ms | Max: ${maxMs}ms | Nodes explored (avg): ~${Math.round(totalNodes/10)}`);
  
  // For the large grid, show per-node efficiency
  const avgNodes = totalNodes / results.length;
  if (cfg.sz >= 200 && avgNodes > 0) {
    const microPerNode = ((totalTime / results.length) * 1e6 / avgNodes).toFixed(2);
    console.log(`  Per-node overhead: ${microPerNode} µs/node`);
    if (parseFloat(microPerNode) < 10) {
      console.log('  ✓ Under 10µs per node — heap optimization is effective');
    } else {
      console.log('  ⚠ Higher than expected overhead');
    }
  }
}

console.log('\n=== Comparison with benchmark results ===');
console.log('Before fix (Map-based open set, from audit):');
console.log('  100×100: ~6ms median, 819 nodes explored');
console.log('  300×300: ~59ms total, 7436 nodes explored\n');

// Now actually run on 300x300 to compare directly  
const sz = 300;
const cells = [];
for (let y=0; y<sz; y++) {
  const row = new Array(sz);
  let s = ((y*97 + 42*53) | 0);
  for (let x=0; x<sz; x++) {
    s = ((s * 1664525 + 1013904223) | 0) >>> 0;
    row[x] = Math.random() > 0.2; // 80% walkable
  }
  cells.push(row);
}
const grid = { width: sz, height: sz, cellSize: 1, cells };

console.log(`\n300×300 benchmark (fresh run with heap):`);
let totalTime300 = 0;
for (let i=0; i<5; i++) {
  const t = performance.now();
  astar.findPath({x:5,y:5}, {x:sz-6,y:sz-6}, grid);
  totalTime300 += performance.now() - t;
}

console.log(`  Avg time: ${(totalTime300/5).toFixed(2)}ms (vs ~59ms with Map)`);
const speedup = 59 / (totalTime300/5);
console.log(`  Speedup: ${speedup.toFixed(1)}x vs old implementation`);

if (speedup > 1.1) {
  console.log('\n✓ Binary heap optimization is measurably effective');
} else {
  console.log('\n⚠ Not enough improvement for this specific workload — might need denser obstacle environments to see real benefit');
}
