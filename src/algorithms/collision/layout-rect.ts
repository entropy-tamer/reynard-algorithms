/**
 * 2D rect/AABB primitives for UI and chart layout bounds.
 *
 * Rects use the DOMRect-like contract `{ x, y, width, height }` in CSS pixels
 * or chart-local coordinates, where `x`/`y` are the top-left corner.
 *
 * Overlap semantics are explicit: by default edge-touching rects do not count
 * as overlap (`includeTouch=false`). Pass `includeTouch=true` to treat touching
 * as overlap/intersection.
 *
 * @module algorithms/collision/layout-rect
 */

/** Axis-aligned 2D rectangle using top-left origin and size. */
export interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Rect-like input accepted by helper functions. */
export type LayoutRectLike = LayoutRect | { x: number; y: number; width: number; height: number };

/** Policy for edge-touching rectangles. */
export interface RectPolicy {
  /** When true, edge or corner contact counts as overlap/intersection. */
  includeTouch?: boolean;
}

/** Axis-aligned gap between two rects on each side (0 when overlapping/touching on that axis). */
export interface RectGap {
  left: number;
  right: number;
  top: number;
  bottom: number;
  /** Minimum horizontal gap (max of left/right separation, 0 if horizontally overlapping). */
  horizontal: number;
  /** Minimum vertical gap (max of top/bottom separation, 0 if vertically overlapping). */
  vertical: number;
}

/** Detailed relationship between two rects. */
export interface RectRelation {
  intersects: boolean;
  touches: boolean;
  containsA: boolean;
  containsB: boolean;
  intersection: LayoutRect | null;
  intersectionArea: number;
  gap: RectGap;
  a: LayoutRect;
  b: LayoutRect;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Validate that a value is a finite layout rect. */
export function isValidLayoutRect(value: unknown): value is LayoutRect {
  if (!value || typeof value !== "object") return false;
  const rect = value as Record<string, unknown>;
  return (
    isFiniteNumber(rect.x) &&
    isFiniteNumber(rect.y) &&
    isFiniteNumber(rect.width) &&
    isFiniteNumber(rect.height)
  );
}

/** Convert rect-like input to a LayoutRect. */
export function toLayoutRect(value: LayoutRectLike): LayoutRect {
  return { x: value.x, y: value.y, width: value.width, height: value.height };
}

/**
 * Return a rect with non-negative width/height.
 *
 * DOM/canvas measurements should not produce negative sizes, but normalization
 * keeps geometry predictable.
 */
export function normalizeLayoutRect(value: LayoutRectLike): LayoutRect {
  const rect = toLayoutRect(value);
  let { x, y, width, height } = rect;
  if (width < 0) {
    x += width;
    width = -width;
  }
  if (height < 0) {
    y += height;
    height = -height;
  }
  return { x, y, width, height };
}

/** Right edge (x + width) of a normalized rect. */
export function rectRight(value: LayoutRectLike): number {
  const rect = normalizeLayoutRect(value);
  return rect.x + rect.width;
}

/** Bottom edge (y + height) of a normalized rect. */
export function rectBottom(value: LayoutRectLike): number {
  const rect = normalizeLayoutRect(value);
  return rect.y + rect.height;
}

/** Area of a rect (never negative). */
export function rectArea(value: LayoutRectLike): number {
  const rect = normalizeLayoutRect(value);
  return rect.width * rect.height;
}

/**
 * Compute the intersection rectangle of two AABBs.
 * Returns null when there is no overlap (or only touch when includeTouch=false).
 */
export function intersectionRect(
  a: LayoutRectLike,
  b: LayoutRectLike,
  policy: RectPolicy = {},
): LayoutRect | null {
  const ra = normalizeLayoutRect(a);
  const rb = normalizeLayoutRect(b);
  const left = Math.max(ra.x, rb.x);
  const top = Math.max(ra.y, rb.y);
  const right = Math.min(ra.x + ra.width, rb.x + rb.width);
  const bottom = Math.min(ra.y + ra.height, rb.y + rb.height);
  const includeTouch = policy.includeTouch === true;

  if (includeTouch) {
    if (right < left || bottom < top) return null;
  } else if (right <= left || bottom <= top) {
    return null;
  }

  return { x: left, y: top, width: right - left, height: bottom - top };
}

/** True when rects overlap according to the touch policy. */
export function rectsIntersect(a: LayoutRectLike, b: LayoutRectLike, policy: RectPolicy = {}): boolean {
  return intersectionRect(a, b, policy) !== null;
}

/** True when rects touch at an edge/corner but do not overlap by area. */
export function rectsTouch(a: LayoutRectLike, b: LayoutRectLike): boolean {
  const ra = normalizeLayoutRect(a);
  const rb = normalizeLayoutRect(b);
  const left = Math.max(ra.x, rb.x);
  const top = Math.max(ra.y, rb.y);
  const right = Math.min(ra.x + ra.width, rb.x + rb.width);
  const bottom = Math.min(ra.y + ra.height, rb.y + rb.height);
  if (right < left || bottom < top) return false;
  return right === left || bottom === top;
}

/** Intersection area (0 when no overlap under policy). */
export function intersectionArea(a: LayoutRectLike, b: LayoutRectLike, policy: RectPolicy = {}): number {
  const rect = intersectionRect(a, b, policy);
  if (!rect) return 0;
  return rect.width * rect.height;
}

/** True when `inner` is fully contained within `outer` (edges allowed). */
export function rectContains(outer: LayoutRectLike, inner: LayoutRectLike): boolean {
  const o = normalizeLayoutRect(outer);
  const i = normalizeLayoutRect(inner);
  return (
    i.x >= o.x &&
    i.y >= o.y &&
    i.x + i.width <= o.x + o.width &&
    i.y + i.height <= o.y + o.height
  );
}

/** Compute per-side and axis gaps between two rects. */
export function rectGap(a: LayoutRectLike, b: LayoutRectLike): RectGap {
  const ra = normalizeLayoutRect(a);
  const rb = normalizeLayoutRect(b);
  const left = Math.max(0, rb.x - (ra.x + ra.width));
  const right = Math.max(0, ra.x - (rb.x + rb.width));
  const top = Math.max(0, rb.y - (ra.y + ra.height));
  const bottom = Math.max(0, ra.y - (rb.y + rb.height));
  return {
    left,
    right,
    top,
    bottom,
    horizontal: Math.max(left, right),
    vertical: Math.max(top, bottom),
  };
}

/** Compute a full relation snapshot between two rects. */
export function rectRelation(a: LayoutRectLike, b: LayoutRectLike, policy: RectPolicy = {}): RectRelation {
  const ra = normalizeLayoutRect(a);
  const rb = normalizeLayoutRect(b);
  const intersection = intersectionRect(ra, rb, policy);
  return {
    intersects: intersection !== null,
    touches: rectsTouch(ra, rb),
    containsA: rectContains(ra, rb),
    containsB: rectContains(rb, ra),
    intersection,
    intersectionArea: intersection ? intersection.width * intersection.height : 0,
    gap: rectGap(ra, rb),
    a: ra,
    b: rb,
  };
}

/** Expand/contract a rect by an inset margin (positive inset shrinks). */
export function insetRect(value: LayoutRectLike, inset: number | { top?: number; right?: number; bottom?: number; left?: number }): LayoutRect {
  const rect = normalizeLayoutRect(value);
  const top = typeof inset === "number" ? inset : (inset.top ?? 0);
  const right = typeof inset === "number" ? inset : (inset.right ?? 0);
  const bottom = typeof inset === "number" ? inset : (inset.bottom ?? 0);
  const left = typeof inset === "number" ? inset : (inset.left ?? 0);
  return {
    x: rect.x + left,
    y: rect.y + top,
    width: Math.max(0, rect.width - left - right),
    height: Math.max(0, rect.height - top - bottom),
  };
}

/** Convert a min/max AABB to a layout rect. */
export function aabbMinMaxToRect(aabb: { min: { x: number; y: number }; max: { x: number; y: number } }): LayoutRect {
  return {
    x: aabb.min.x,
    y: aabb.min.y,
    width: aabb.max.x - aabb.min.x,
    height: aabb.max.y - aabb.min.y,
  };
}

/** Convert a layout rect to a min/max AABB. */
export function rectToAabbMinMax(rect: LayoutRectLike): { min: { x: number; y: number }; max: { x: number; y: number } } {
  const r = normalizeLayoutRect(rect);
  return { min: { x: r.x, y: r.y }, max: { x: r.x + r.width, y: r.y + r.height } };
}
