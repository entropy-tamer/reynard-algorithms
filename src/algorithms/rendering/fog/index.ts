/**
 * @module algorithms/rendering/fog
 * @description Fog rendering algorithms for atmospheric effects.
 */

export {
  calculateFogDensity,
  calculateFog,
  calculateDistanceFog,
} from "./fog-core";
export type { FogConfig, FogResult } from "./fog-types";
export { DEFAULT_FOG_CONFIG } from "./fog-types";

