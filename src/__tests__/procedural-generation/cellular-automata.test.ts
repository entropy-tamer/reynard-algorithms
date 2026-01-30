/**
 * @file cellular-automata.test.ts
 * @description Tests for Cellular Automata algorithm.
 */

import { describe, it, expect } from "vitest";
import { CellularAutomata } from "../../algorithms/procedural-generation/cellular-automata/cellular-automata-core";
import type { CellState } from "../../algorithms/procedural-generation/cellular-automata/cellular-automata-types";

describe("CellularAutomata", () => {
  describe("Basic evolution", () => {
    it("should evolve grid for specified generations", () => {
      const ca = new CellularAutomata({ width: 10, height: 10, seed: 42 });
      const result = ca.evolve(undefined, { generations: 5 });

      expect(result.grid).toBeDefined();
      expect(result.grid.length).toBe(10);
      expect(result.grid[0].length).toBe(10);
      expect(result.stats.generations).toBe(5);
      expect(result.stats.populationHistory.length).toBe(6); // Initial + 5 generations
    });

    it("should use provided initial grid", () => {
      const initialGrid: CellState[][] = Array(5)
        .fill(0)
        .map(() => Array(5).fill(0));
      initialGrid[2][2] = 1;

      const ca = new CellularAutomata({ width: 5, height: 5 });
      const result = ca.evolve(initialGrid, { generations: 1 });

      expect(result.grid.length).toBe(5);
      expect(result.grid[0].length).toBe(5);
    });
  });

  describe("Game of Life", () => {
    it("should run Game of Life simulation", () => {
      const grid: CellState[][] = [
        [0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0],
      ];

      const ca = new CellularAutomata();
      const result = ca.gameOfLife(grid, 1);

      expect(result.grid).toBeDefined();
      expect(result.stats.generations).toBe(1);
    });
  });

  describe("Cave generation", () => {
    it("should generate cave-like terrain", () => {
      const ca = new CellularAutomata({ width: 20, height: 20, seed: 42 });
      const cave = ca.generateCave(20, 20, { initialSmoothing: 3 });

      expect(cave.length).toBe(20);
      expect(cave[0].length).toBe(20);
      expect(cave.some((row) => row.some((cell) => cell === 1))).toBe(true);
    });
  });

  describe("Boundary conditions", () => {
    it("should handle wrap boundary condition", () => {
      const ca = new CellularAutomata({
        width: 5,
        height: 5,
        boundaryCondition: "wrap",
        seed: 42,
      });
      const result = ca.evolve(undefined, { generations: 1 });
      expect(result.grid).toBeDefined();
    });

    it("should handle fixed boundary condition", () => {
      const ca = new CellularAutomata({
        width: 5,
        height: 5,
        boundaryCondition: "fixed",
        fixedBoundaryValue: 0,
        seed: 42,
      });
      const result = ca.evolve(undefined, { generations: 1 });
      expect(result.grid).toBeDefined();
    });
  });
});


