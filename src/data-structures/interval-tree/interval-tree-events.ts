import type { IntervalTreeEventHandler } from "./interval-tree-types";
import { IntervalTreeEventType } from "./interval-tree-types";

export function emitEvent(
  eventHandlers: IntervalTreeEventHandler[],
  type: IntervalTreeEventType,
  data: any
): void {
  for (const handler of eventHandlers) {
    try {
      handler({ type, data, timestamp: Date.now() });
    } catch (error) {
      // Ignore handler errors
    }
  }
}

export { IntervalTreeEventType };



