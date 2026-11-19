/**
 * Regression: insert() used to call countNodes() and calculateAverageWordLength()
 * on every insert. Both helpers walk the whole trie, so inserting n keys grew
 * quadratically. The measurement harness uses the default enableStats: true,
 * so the fix has to make the stats themselves incremental, not just skip them.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { Trie } from "../../data-structures/basic/trie/trie-core";

type Traversal = "countNodes" | "calculateAverageWordLength";

function spyOnTraversals() {
  const proto = Trie.prototype as unknown as Record<Traversal, () => unknown>;
  return {
    countNodes: vi.spyOn(proto, "countNodes"),
    averageWordLength: vi.spyOn(proto, "calculateAverageWordLength"),
  };
}

function words(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `word${i}`);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("trie insert without a full traversal", () => {
  it("never walks the whole trie per insert with default options", () => {
    const spies = spyOnTraversals();
    const trie = new Trie();

    for (const word of words(500)) trie.insert(word);

    expect(spies.countNodes).not.toHaveBeenCalled();
    expect(spies.averageWordLength).not.toHaveBeenCalled();
    expect(trie.getStats().totalWords).toBe(500);
  });

  it("never walks the whole trie per insert when stats are disabled", () => {
    const spies = spyOnTraversals();
    const trie = new Trie({ enableStats: false });

    for (const word of words(500)) trie.insert(word);

    expect(spies.countNodes).not.toHaveBeenCalled();
    expect(spies.averageWordLength).not.toHaveBeenCalled();
  });

  it("inserts 10k keys under a 2s budget", () => {
    const trie = new Trie();
    const input = words(10_000);

    const start = performance.now();
    for (const word of input) trie.insert(word);
    const elapsed = performance.now() - start;

    expect(elapsed, `10k inserts took ${elapsed.toFixed(1)}ms`).toBeLessThan(2000);
  });

  it("keeps node count and average length exact through insert and delete", () => {
    const trie = new Trie();

    trie.insert("cat");
    trie.insert("catalog");
    expect(trie.getStats().totalNodes).toBe(8); // root + c, a, t + a, l, o, g
    expect(trie.getStats().averageWordLength).toBe(5); // (3 + 7) / 2

    trie.delete("catalog");
    expect(trie.getStats().totalNodes).toBe(4); // root + c, a, t
    expect(trie.getStats().averageWordLength).toBe(3);
  });
});
