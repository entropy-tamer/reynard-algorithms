/**
 * Force-Directed Graph Layout Algorithms
 *
 * Implementation of force-directed graph layout algorithms including
 * Fruchterman-Reingold and spring-embedder methods.
 */
import type { Graph, ForceDirectedConfig, ForceDirectedResult, ForceDirectedOptions } from "./force-directed-types.js";
/**
 * Perform force-directed layout on a graph
 * @param graph
 * @param config
 * @param options
 * @example
 */
export declare function performForceDirectedLayout(graph: Graph, config: ForceDirectedConfig, options?: ForceDirectedOptions): ForceDirectedResult;
/**
 * Force-directed layout class for convenient usage
 */
export declare class ForceDirectedLayout {
    private config;
    /**
     *
     * @param config
     * @example
     */
    constructor(config?: Partial<ForceDirectedConfig>);
    /**
     * Layout a graph
     * @param graph
     * @param options
     * @example
     */
    layout(graph: Graph, options?: ForceDirectedOptions): ForceDirectedResult;
    /**
     * Update configuration
     * @param config
     * @example
     */
    updateConfig(config: Partial<ForceDirectedConfig>): void;
}
export { ForceDirectedAlgorithm } from "./force-directed-types.js";
//# sourceMappingURL=force-directed-core.d.ts.map