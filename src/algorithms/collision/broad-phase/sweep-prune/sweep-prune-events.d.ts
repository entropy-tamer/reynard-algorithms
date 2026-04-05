/**
 * Event system for Sweep and Prune algorithm
 *
 * Provides event emission and handling utilities.
 *
 * @module algorithms/collision/broad-phase/sweep-prune/sweep-prune-events
 */
import type { SweepPruneEventType, SweepPruneEventHandler } from "./sweep-prune-types";
/**
 * Emit event to registered handlers
 * @param type
 * @param data
 * @param handlers
 * @param enableDebug
 * @example
 */
export declare function emitEvent(type: SweepPruneEventType, data: any, handlers: SweepPruneEventHandler[], enableDebug: boolean): void;
//# sourceMappingURL=sweep-prune-events.d.ts.map