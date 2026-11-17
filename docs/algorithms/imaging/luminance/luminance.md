# Perceptual luminance and contrast

**Source:** `src/algorithms/imaging/luminance.ts`

Pure color arithmetic over already-sampled pixels. There is no canvas, no CSS
and no page state here. A caller samples the pixels behind its text (from an
image, a canvas or a screenshot) and this module answers how bright they are and
what contrast a given ink would have against them.

`srgbChannel` linearizes one 0-255 channel. `relativeLuminance` applies the
WCAG 2.1 weights (0.2126, 0.7152, 0.0722). `contrastRatio` returns the usual
`(lighter + 0.05) / (darker + 0.05)`. `requiredAlpha` binary-searches the
weakest veil that clears a contrast floor over the worst sampled pixel.

These were previously duplicated in a site's hero module. Keeping them here
means the placement solver and the ink chooser cannot disagree about what 4.5:1
means. The site re-exports its own names but imports the arithmetic.

## Pitfalls

- Contrast is defined for opaque colors. Composite semi-transparent pixels onto
  their backdrop with `compositeChannels` before measuring.
- `pixelsOf` drops fully transparent samples. For a cutout, supply the page
  color for those pixels instead of skipping them when placing text.
- `requiredAlpha` returns 1 when even an opaque veil cannot clear the floor.
  Treat that as a design signal, not a value to clamp lower.
