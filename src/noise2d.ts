/**
 * The 2D noise entry point.
 *
 * `@entropy-tamer/reynard-algorithms/noise2d` exists so a consumer that wants a
 * noise field does not link the class facade and its 3D, 4D, multiscale and
 * analysis machinery. Importing this subpath costs about 3 KiB minified; the
 * same call through the package barrel cost 15.5 KiB on sly.so's /start chunk.
 *
 * The numeric behaviour is identical -- the test compares it against both
 * `SimplexNoise.noise2D` and `generateNoise2D`.
 *
 * @module noise2d
 */

export { createNoise2D, type CreateNoise2DOptions, type Noise2D } from "./algorithms/procedural-generation/simplex-noise/simplex-noise-2d-factory";
