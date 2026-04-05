/**
 * StructureForge Core Algorithm
 *
 * Efficient layered generation for man-made structures using optimized
 * 2D wave function collapse patterns. Creates buildings, mazes, towers,
 * and other artificial constructs with emergent complexity.
 */
import { GenerationResult, StructureConfig, StructureForgeOptions } from './structure-forge-types';
export declare class StructureForge {
    private config;
    private options;
    private random;
    constructor(config: StructureConfig, options?: StructureForgeOptions);
    /**
     * Generate a complete structure using layered 2D WFC
     */
    generate(): GenerationResult;
    /**
     * Generate tileable 2D patterns for each layer type
     */
    private generateLayerPatterns;
    /**
     * Generate horizontal corridor/street pattern
     */
    private generateCorridorPattern;
    /**
     * Generate vertical room containment pattern
     */
    private generateRoomPattern;
    /**
     * Generate structural support pattern
     */
    private generateStructuralPattern;
    /**
     * Generate feature placement pattern (doors, windows, stairs)
     */
    private generateFeaturePattern;
    /**
     * Stack layers vertically with intelligent connections
     */
    private generateLayeredStructure;
    /**
     * Generate a single layer by combining patterns
     */
    private generateSingleLayer;
    /**
     * Sample a pattern at given coordinates with offset
     */
    private samplePattern;
    /**
     * Connect layers with stairs, ladders, and openings
     */
    private connectLayers;
    /**
     * Apply structure-specific post-processing
     */
    private applyStructurePostProcessing;
    /**
     * Specialized processing for towers (circular, tapering)
     */
    private applyTowerProcessing;
    /**
     * Specialized processing for mazes (dense corridors)
     */
    private applyMazeProcessing;
    /**
     * Specialized processing for dungeons (dark, enclosed spaces)
     */
    private applyDungeonProcessing;
    /**
     * Specialized processing for temples (symmetrical, ornate)
     */
    private applyTempleProcessing;
    /**
     * Generate constraint patterns for different layer types
     */
    private generateCorridorConstraints;
    private generateRoomConstraints;
    private generateStructuralConstraints;
    private generateFeatureConstraints;
    /**
     * Select appropriate material based on structure type
     */
    private selectMaterial;
    /**
     * Calculate bounding box of the generated structure
     */
    private calculateBounds;
    /**
     * Simple seeded random number generator
     */
    private createSeededRandom;
    /**
     * Simple 2D simplex noise for pattern generation
     */
    private simplexNoise2D;
}
//# sourceMappingURL=structure-forge-core.d.ts.map