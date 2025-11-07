/**
 * Event system for Sweep and Prune algorithm
 *
 * Provides event emission and handling utilities.
 *
 * @module algorithms/collision/broad-phase/sweep-prune/sweep-prune-events
 */

import type { SweepPruneEvent, SweepPruneEventType, SweepPruneEventHandler } from "./sweep-prune-types";

/**
 * Emit event to registered handlers
 */
export function emitEvent(
  type: SweepPruneEventType,
  data: any,
  handlers: SweepPruneEventHandler[],
  enableDebug: boolean
): void {
  if (!enableDebug) return;

  const event: SweepPruneEvent = {
    type,
    timestamp: Date.now(),
    data,
  };

  for (const handler of handlers) {
    try {
      handler(event);
    } catch (error) {
      console.error("Error in SweepPrune event handler:", error);
    }
  }
}












