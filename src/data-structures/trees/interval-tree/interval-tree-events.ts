import type { IntervalTreeEventHandler } from "./interval-tree-types";
import { IntervalTreeEventType } from "./interval-tree-types";

/**
 * Notifies every registered handler of a tree event, ignoring handlers that throw.
 *
 * @param eventHandlers Handlers to invoke.
 * @param type Event type to dispatch.
 * @param data Payload attached to the event.
 * Complexity: see `catalog-data-structures-trees-interval-tree` in ~/src/foxtools/registry/algorithms/ (unknown — no machine-readable bound recorded).
 */
export function emitEvent(eventHandlers: IntervalTreeEventHandler[], type: IntervalTreeEventType, data: any): void {
  for (const handler of eventHandlers) {
    try {
      handler({ type, data, timestamp: Date.now() });
    } catch {
      // Ignore handler errors
    }
  }
}

export { IntervalTreeEventType };
