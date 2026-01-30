/**
 * @file Tests for force-directed graph layout algorithms
 */
import { describe, expect, it } from "vitest";
import { ForceDirectedLayout, performForceDirectedLayout } from "../algorithms/graph/force-directed-core";
import { ForceDirectedAlgorithm } from "../algorithms/graph/force-directed-types";
import type { Graph } from "../algorithms/graph/force-directed-types";

describe("Force-Directed Layout", () => {
  it("should layout a simple graph", () => {
    const graph: Graph = {
      nodes: [
        { id: 1, position: { x: 0, y: 0 } },
        { id: 2, position: { x: 0, y: 0 } },
        { id: 3, position: { x: 0, y: 0 } },
      ],
      edges: [
        { source: 1, target: 2 },
        { source: 2, target: 3 },
      ],
    };

    const result = performForceDirectedLayout(
      graph,
      {
        width: 800,
        height: 600,
        algorithm: ForceDirectedAlgorithm.FRUCHTERMAN_REINGOLD,
      },
      {
        maxIterations: 10,
      }
    );

    expect(result.nodes.length).toBe(3);
    expect(result.edges.length).toBe(2);
    expect(result.iterations).toBeGreaterThan(0);
  });

  it("should use ForceDirectedLayout class", () => {
    const layout = new ForceDirectedLayout({
      width: 800,
      height: 600,
    });

    const graph: Graph = {
      nodes: [
        { id: 1, position: { x: 0, y: 0 } },
        { id: 2, position: { x: 0, y: 0 } },
      ],
      edges: [{ source: 1, target: 2 }],
    };

    const result = layout.layout(graph, { maxIterations: 5 });
    expect(result.nodes.length).toBe(2);
  });
});
