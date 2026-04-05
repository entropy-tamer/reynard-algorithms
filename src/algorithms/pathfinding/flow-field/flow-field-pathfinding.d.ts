/**
 * Flow Field Pathfinding Operations
 *
 * Handles agent pathfinding using flow fields, including
 * A* pathfinding and crowd simulation.
 *
 * @module algorithms/pathfinding/flow-field
 */
import type { AgentPathfindingOptions, AgentPathfindingResult, CrowdSimulationOptions, CrowdSimulationResult, FlowCell, Point } from "./flow-field-types";
/**
 * Find agent path using flow field
 *
 * @param start Starting point
 * @param flowField Flow field array
 * @param width Grid width
 * @param height Grid height
 * @param options Pathfinding options
 * @returns Agent pathfinding result
 * @example
 */
export declare function findAgentPath(start: Point, flowField: FlowCell[], width: number, height: number, options?: Partial<AgentPathfindingOptions>): AgentPathfindingResult;
/**
 * Simulate crowd movement
 *
 * @param agents Array of agent starting positions
 * @param flowField Flow field array
 * @param width Grid width
 * @param height Grid height
 * @param options Simulation options
 * @returns Crowd simulation result
 * @example
 */
export declare function simulateCrowd(agents: Point[], flowField: FlowCell[], width: number, height: number, options?: Partial<CrowdSimulationOptions>): CrowdSimulationResult;
//# sourceMappingURL=flow-field-pathfinding.d.ts.map