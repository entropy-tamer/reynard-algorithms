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

class MemoRegistry {
  private entries = new Map<string, MemoEntry>();

  register(name: string, controller: AdaptiveMemoController<any[], any>): void {
    this.entries.set(name, { name, controller, enabled: true });
  }

  getStats(name: string) {
    const entry = this.entries.get(name);
    if (!entry) return null;
    return entry.controller.getStats();
  }

  getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    for (const [name, entry] of this.entries) {
      stats[name] = entry.controller.getStats();
    }
    return stats;
  }

  setPolicy(name: string, policy: Partial<MemoTuningPolicy>): boolean {
    const entry = this.entries.get(name);
    if (!entry) return false;
    entry.controller.setPolicy(policy);
    return true;
  }

  enable(name: string): boolean {
    const entry = this.entries.get(name);
    if (!entry) return false;
    entry.enabled = true;
    return true;
  }

  disable(name: string): boolean {
    const entry = this.entries.get(name);
    if (!entry) return false;
    entry.enabled = false;
    return true;
  }

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

  listEntries(): string[] {
    return Array.from(this.entries.keys());
  }
}

export const memoRegistry = new MemoRegistry();

// Convenience functions
export function getMemoStats(name?: string) {
  return name ? memoRegistry.getStats(name) : memoRegistry.getAllStats();
}

export function setMemoPolicy(name: string, policy: Partial<MemoTuningPolicy>) {
  return memoRegistry.setPolicy(name, policy);
}

export function resetMemoStats(name?: string) {
  memoRegistry.resetStats(name);
}

export function enableMemo(name: string) {
  return memoRegistry.enable(name);
}

export function disableMemo(name: string) {
  return memoRegistry.disable(name);
}
