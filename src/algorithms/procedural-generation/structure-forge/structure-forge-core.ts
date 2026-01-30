/**
 * StructureForge Core Algorithm
 *
 * Efficient layered generation for man-made structures using optimized
 * 2D wave function collapse patterns. Creates buildings, mazes, towers,
 * and other artificial constructs with emergent complexity.
 */

import { CellType, GenerationResult, LayerPattern, MaterialType, PatternConstraint, StructureCell, StructureConfig, StructureForgeOptions } from './structure-forge-types';

export class StructureForge {
  private config: StructureConfig;
  private options: Required<StructureForgeOptions>;
  private random: () => number;

  constructor(config: StructureConfig, options: StructureForgeOptions = {}) {
    this.config = config;
    this.options = {
      maxIterations: 10000,
      backtrackLimit: 100,
      patternSize: 3,
      enableBridges: true,
      enableSkylights: true,
      heightVariation: true,
      ...options
    };

    // Initialize seeded random number generator
    this.random = this.createSeededRandom(config.seed || Math.random());
  }

  /**
   * Generate a complete structure using layered 2D WFC
   */
  generate(): GenerationResult {
    const startTime = performance.now();

    // Generate base layer patterns for different structure types
    const layerPatterns = this.generateLayerPatterns();

    // Create vertical stack with intelligent connections
    const layers = this.generateLayeredStructure(layerPatterns);

    // Apply structure-specific post-processing
    this.applyStructurePostProcessing(layers);

    const generationTime = performance.now() - startTime;

    return {
      layers,
      bounds: this.calculateBounds(layers),
      metadata: {
        generationTime,
        seed: this.config.seed || 0,
        type: this.config.type,
        layerCount: layers.length
      }
    };
  }

  /**
   * Generate tileable 2D patterns for each layer type
   */
  private generateLayerPatterns(): LayerPattern[] {
    const patterns: LayerPattern[] = [];

    // Street/Corridor pattern (horizontal movement)
    patterns.push(this.generateCorridorPattern());

    // Room pattern (vertical containment)
    patterns.push(this.generateRoomPattern());

    // Structural pattern (load-bearing elements)
    patterns.push(this.generateStructuralPattern());

    // Feature pattern (doors, windows, stairs)
    patterns.push(this.generateFeaturePattern());

    return patterns;
  }

  /**
   * Generate horizontal corridor/street pattern
   */
  private generateCorridorPattern(): LayerPattern {
    const size = 16; // Tileable size
    const cells: StructureCell[][] = [];

    for (let y = 0; y < size; y++) {
      cells[y] = new Array(size);
      for (let x = 0; x < size; x++) {
        // Create winding corridors with some regularity
        const noise = this.simplexNoise2D(x * 0.1, y * 0.1);
        const isCorridor = noise > -0.3 && noise < 0.3;
        const isWide = Math.abs(noise) < 0.1;

        cells[y]![x] = {
          type: isCorridor ? 'air' : 'solid',
          material: isCorridor ? 'void' : this.selectMaterial('stone'),
          ...(isWide ? { metadata: { width: 2 } } : {})
        };
      }
    }

    return {
      width: size,
      height: size,
      cells,
      constraints: this.generateCorridorConstraints()
    };
  }

  /**
   * Generate vertical room containment pattern
   */
  private generateRoomPattern(): LayerPattern {
    const size = 16;
    const cells: StructureCell[][] = [];

    for (let y = 0; y < size; y++) {
      cells[y] = new Array(size);
      for (let x = 0; x < size; x++) {
        // Create room-like spaces with walls
        const distanceFromCenter = Math.sqrt(
          Math.pow((x - size/2) / (size/2), 2) +
          Math.pow((y - size/2) / (size/2), 2)
        );

        const isRoom = distanceFromCenter < 0.7 + this.random() * 0.2;
        const isWall = !isRoom || this.random() < this.config.complexity * 0.3;

        cells[y]![x] = {
          type: isWall ? 'solid' : 'air',
          material: isWall ? this.selectMaterial('stone') : 'void'
        };
      }
    }

    return {
      width: size,
      height: size,
      cells,
      constraints: this.generateRoomConstraints()
    };
  }

  /**
   * Generate structural support pattern
   */
  private generateStructuralPattern(): LayerPattern {
    const size = 16;
    const cells: StructureCell[][] = [];

    for (let y = 0; y < size; y++) {
      cells[y] = new Array(size);
      for (let x = 0; x < size; x++) {
        // Create load-bearing structures
        const isSupport = (x % 4 === 0 || y % 4 === 0) && this.random() < 0.8;
        const isArch = this.random() < 0.1;

        cells[y]![x] = {
          type: isSupport ? 'solid' : 'air',
          material: isSupport ? this.selectMaterial('stone') : 'void',
          ...(isArch ? { metadata: { architectural: 'arch' } } : {})
        };
      }
    }

    return {
      width: size,
      height: size,
      cells,
      constraints: this.generateStructuralConstraints()
    };
  }

  /**
   * Generate feature placement pattern (doors, windows, stairs)
   */
  private generateFeaturePattern(): LayerPattern {
    const size = 16;
    const cells: StructureCell[][] = [];

    for (let y = 0; y < size; y++) {
      cells[y] = new Array(size);
      for (let x = 0; x < size; x++) {
        let cellType: CellType = 'air';
        let material: MaterialType = 'void';

        // Place features based on position and randomness
        if (this.random() < 0.05) {
          cellType = this.random() < 0.5 ? 'door' : 'window';
          material = 'wood';
        } else if (this.random() < 0.03) {
          cellType = this.random() < 0.5 ? 'stair_up' : 'stair_down';
          material = 'stone';
        }

        cells[y]![x] = {
          type: cellType,
          material
        };
      }
    }

    return {
      width: size,
      height: size,
      cells,
      constraints: this.generateFeatureConstraints()
    };
  }

  /**
   * Stack layers vertically with intelligent connections
   */
  private generateLayeredStructure(patterns: LayerPattern[]): StructureCell[][][] {
    const layers: StructureCell[][][] = [];

    for (let z = 0; z < this.config.depth; z++) {
      const layer = this.generateSingleLayer(patterns, z);
      layers.push(layer);

      // Add vertical connections between layers
      if (z > 0) {
        this.connectLayers(layers[z - 1]!, layer, z);
      }
    }

    return layers;
  }

  /**
   * Generate a single layer by combining patterns
   */
  private generateSingleLayer(patterns: LayerPattern[], layerIndex: number): StructureCell[][] {
    const layer: StructureCell[][] = [];

    for (let y = 0; y < this.config.height; y++) {
      layer[y] = [];
      for (let x = 0; x < this.config.width; x++) {
        // Sample from different patterns based on layer and position
        const corridorCell = this.samplePattern(patterns[0]!, x, y, layerIndex);
        const roomCell = this.samplePattern(patterns[1]!, x, y, layerIndex);
        const structuralCell = this.samplePattern(patterns[2]!, x, y, layerIndex);
        const featureCell = this.samplePattern(patterns[3]!, x, y, layerIndex);

        // Combine cells with priority: structural > features > rooms > corridors
        let finalCell = corridorCell;

        if (roomCell.type !== 'air') finalCell = roomCell;
        if (structuralCell.type !== 'air') finalCell = structuralCell;
        if (featureCell.type !== 'air') finalCell = featureCell;

        // Apply height variation
        if (this.options.heightVariation && finalCell.type === 'solid') {
          finalCell.height = 1 + Math.floor(this.random() * 2);
        }

        layer[y]![x] = finalCell;
      }
    }

    return layer;
  }

  /**
   * Sample a pattern at given coordinates with offset
   */
  private samplePattern(pattern: LayerPattern, x: number, y: number, layerIndex: number): StructureCell {
    // Add layer-based offset for variation
    const offsetX = layerIndex * 3;
    const offsetY = layerIndex * 2;

    const sampleX = (x + offsetX) % pattern.width;
    const sampleY = (y + offsetY) % pattern.height;

    return pattern.cells[sampleY]![sampleX]!;
  }

  /**
   * Connect layers with stairs, ladders, and openings
   */
  private connectLayers(lowerLayer: StructureCell[][], upperLayer: StructureCell[][], layerIndex: number): void {
    const connections = Math.max(1, Math.floor(this.config.width * this.config.height * 0.02));

    for (let i = 0; i < connections; i++) {
      const x = Math.floor(this.random() * this.config.width);
      const y = Math.floor(this.random() * this.config.height);

      // Check if both positions are solid (walls) for stair placement
      if (lowerLayer[y]![x]!.type === 'solid' && upperLayer[y]![x]!.type === 'solid') {
        // Create stair connection
        lowerLayer[y]![x] = { type: 'stair_up', material: 'stone' };
        upperLayer[y]![x] = { type: 'stair_down', material: 'stone' };
      } else if (this.options.enableBridges && lowerLayer[y]![x]!.type === 'air' && upperLayer[y]![x]!.type === 'air') {
        // Create bridge between floors
        lowerLayer[y]![x] = { type: 'bridge', material: 'wood' };
        upperLayer[y]![x] = { type: 'bridge', material: 'wood' };
      }
    }

    // Add skylights/openings
    if (this.options.enableSkylights && layerIndex > 1) {
      const skylights = Math.floor(this.config.width * this.config.height * 0.01);
      for (let i = 0; i < skylights; i++) {
        const x = Math.floor(this.random() * this.config.width);
        const y = Math.floor(this.random() * this.config.height);

        if (upperLayer[y]![x]!.type === 'solid') {
          upperLayer[y]![x] = { type: 'air', material: 'void', metadata: { skylight: true } };
        }
      }
    }
  }

  /**
   * Apply structure-specific post-processing
   */
  private applyStructurePostProcessing(layers: StructureCell[][][]): void {
    switch (this.config.type) {
      case 'tower':
        this.applyTowerProcessing(layers);
        break;
      case 'maze':
        this.applyMazeProcessing(layers);
        break;
      case 'dungeon':
        this.applyDungeonProcessing(layers);
        break;
      case 'temple':
        this.applyTempleProcessing(layers);
        break;
    }
  }

  /**
   * Specialized processing for towers (circular, tapering)
   */
  private applyTowerProcessing(layers: StructureCell[][][]): void {
    const centerX = Math.floor(this.config.width / 2);
    const centerY = Math.floor(this.config.height / 2);

    for (let z = 0; z < layers.length; z++) {
      const radius = Math.max(2, this.config.width / 2 - z * 0.5);

      for (let y = 0; y < this.config.height; y++) {
        for (let x = 0; x < this.config.width; x++) {
          const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          if (distance > radius) {
            layers[z]![y]![x] = { type: 'air', material: 'void' };
          }
        }
      }
    }
  }

  /**
   * Specialized processing for mazes (dense corridors)
   */
  private applyMazeProcessing(layers: StructureCell[][][]): void {
    // Ensure connected corridors with dead ends
    for (let z = 0; z < layers.length; z++) {
      for (let y = 0; y < this.config.height; y++) {
        for (let x = 0; x < this.config.width; x++) {
          if (layers[z]![y]![x]!.type === 'solid' && this.random() < 0.7) {
            // Remove some walls to create more open maze
            layers[z]![y]![x] = { type: 'air', material: 'void' };
          }
        }
      }
    }
  }

  /**
   * Specialized processing for dungeons (dark, enclosed spaces)
   */
  private applyDungeonProcessing(layers: StructureCell[][][]): void {
    // Add more enclosed spaces and fewer openings
    for (let z = 0; z < layers.length; z++) {
      for (let y = 0; y < this.config.height; y++) {
        for (let x = 0; x < this.config.width; x++) {
          if (layers[z]![y]![x]!.type === 'air' && this.random() < 0.3) {
            // Add more walls for dungeon feel
            layers[z]![y]![x] = { type: 'solid', material: 'stone' };
          }
        }
      }
    }
  }

  /**
   * Specialized processing for temples (symmetrical, ornate)
   */
  private applyTempleProcessing(layers: StructureCell[][][]): void {
    const centerX = Math.floor(this.config.width / 2);

    // Create symmetrical structure
    for (let z = 0; z < layers.length; z++) {
      for (let y = 0; y < this.config.height; y++) {
        for (let x = 0; x < centerX; x++) {
          const mirrorX = this.config.width - 1 - x;
          layers[z]![y]![mirrorX] = { ...layers[z]![y]![x] };
        }
      }
    }
  }

  /**
   * Generate constraint patterns for different layer types
   */
  private generateCorridorConstraints(): PatternConstraint[] {
    return [
      {
        position: { x: 0, y: 0 },
        allowedNeighbors: {
          south: ['air', 'solid'] as CellType[],
          east: ['air', 'solid'] as CellType[]
        }
      }
    ];
  }

  private generateRoomConstraints(): PatternConstraint[] {
    return [
      {
        position: { x: 0, y: 0 },
        allowedNeighbors: {
          north: ['solid'] as CellType[],
          south: ['solid'] as CellType[],
          east: ['solid'] as CellType[],
          west: ['solid'] as CellType[]
        }
      }
    ];
  }

  private generateStructuralConstraints(): PatternConstraint[] {
    return [
      {
        position: { x: 0, y: 0 },
        allowedNeighbors: {
          north: ['solid', 'air'] as CellType[],
          south: ['solid', 'air'] as CellType[],
          east: ['solid', 'air'] as CellType[],
          west: ['solid', 'air'] as CellType[]
        }
      }
    ];
  }

  private generateFeatureConstraints(): PatternConstraint[] {
    return [
      {
        position: { x: 0, y: 0 },
        allowedNeighbors: {
          north: ['solid', 'air'] as CellType[],
          south: ['solid', 'air'] as CellType[],
          east: ['solid', 'air'] as CellType[],
          west: ['solid', 'air'] as CellType[]
        }
      }
    ];
  }

  /**
   * Select appropriate material based on structure type
   */
  private selectMaterial(baseMaterial: MaterialType): MaterialType {
    if (this.config.materialPalette.length === 0) {
      return baseMaterial;
    }

    const palette = this.config.materialPalette.includes(baseMaterial)
      ? this.config.materialPalette
      : [baseMaterial, ...this.config.materialPalette];

    return palette[Math.floor(this.random() * palette.length)]!;
  }

  /**
   * Calculate bounding box of the generated structure
   */
  private calculateBounds(layers: StructureCell[][][]) {
    return {
      minX: 0,
      maxX: this.config.width - 1,
      minY: 0,
      maxY: this.config.height - 1,
      minZ: 0,
      maxZ: this.config.depth - 1
    };
  }

  /**
   * Simple seeded random number generator
   */
  private createSeededRandom(seed: number): () => number {
    let x = Math.sin(seed) * 10000;
    return () => {
      x = Math.sin(x) * 10000;
      return x - Math.floor(x);
    };
  }

  /**
   * Simple 2D simplex noise for pattern generation
   */
  private simplexNoise2D(x: number, y: number): number {
    // Simple noise implementation for pattern generation
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
  }
}
