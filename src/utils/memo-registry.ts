/**
 * Memo Registry
 *
 * Lightweight registry for managing adaptive memo instances across the codebase.
 * Provides runtime inspection and policy updates for PAW integration.
 */

import { AdaptiveMemoController, MemoTuningPolicy } from "./memo/adaptive-memo";

interface MemoEntry {
  name: string;
  controller: AdaptiveMemoController<any[], any>;
  enabled: boolean;
}

/**
 *
 */
class MemoRegistry {
  private entries = new Map<string, MemoEntry>();

  /**
   *
   * @param name
   * @param controller
   * @example
   */
  register(name: string, controller: AdaptiveMemoController<any[], any>): void {
    this.entries.set(name, { name, controller, enabled: true });
  }

  /**
   *
   * @param name
   * @example
   */
  getStats(name: string) {
    const entry = this.entries.get(name);
    if (!entry) return null;
    return entry.controller.getStats();
  }

  /**
   *
   * @example
   */
  getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    for (const [name, entry] of this.entries) {
      stats[name] = entry.controller.getStats();
    }
    return stats;
  }

  /**
   *
   * @param name
   * @param policy
   * @example
   */
  setPolicy(name: string, policy: Partial<MemoTuningPolicy>): boolean {
    const entry = this.entries.get(name);
    if (!entry) return false;
    entry.controller.setPolicy(policy);
    return true;
  }

  /**
   *
   * @param name
   * @example
   */
  enable(name: string): boolean {
    const entry = this.entries.get(name);
    if (!entry) return false;
    entry.enabled = true;
    return true;
  }

  /**
   *
   * @param name
   * @example
   */
  disable(name: string): boolean {
    const entry = this.entries.get(name);
    if (!entry) return false;
    entry.enabled = false;
    return true;
  }

  /**
   *
   * @param name
   * @example
   */
  resetStats(name?: string): void {
    if (name) {
      const entry = this.entries.get(name);
      if (entry) {
        // Reset by creating new controller with same config
        entry.controller.setPolicy({});
      }
    } else {
      for (const entry of this.entries.values()) {
        entry.controller.setPolicy({});
      }
    }
  }

  /**
   *
   * @example
   */
  listEntries(): string[] {
    return Array.from(this.entries.keys());
  }
}

export const memoRegistry = new MemoRegistry();

// Convenience functions
/**
 *
 * @param name
 * @example
 */
export function getMemoStats(name?: string) {
  return name ? memoRegistry.getStats(name) : memoRegistry.getAllStats();
}

/**
 *
 * @param name
 * @param policy
 * @example
 */
export function setMemoPolicy(name: string, policy: Partial<MemoTuningPolicy>) {
  return memoRegistry.setPolicy(name, policy);
}

/**
 *
 * @param name
 * @example
 */
export function resetMemoStats(name?: string) {
  memoRegistry.resetStats(name);
}

/**
 *
 * @param name
 * @example
 */
export function enableMemo(name: string) {
  return memoRegistry.enable(name);
}

/**
 *
 * @param name
 * @example
 */
export function disableMemo(name: string) {
  return memoRegistry.disable(name);
}
