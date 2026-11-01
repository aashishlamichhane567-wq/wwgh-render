import React from "react";

/**
 * Claymation look for any SVG scene, in one filter:
 * - lumpy edges: low-frequency noise displaces the art a few px (re-seeded every 2 frames = stop-motion "boil")
 * - sculpted relief: the picture's own luminance is the height map, so every shape gets rounded shading,
 *   outlines become pressed seams, plus fine noise for fingerprints/clay grain
 * - diffuse + specular light from the upper left, multiplied back over the colours
 */
export const ClayDefs: React.FC<{ seed: number; light?: number }> = ({ seed, light = 1 }) => (
  <defs>
    {/* whole frame: boiling lumpy edges + fine clay grain / fingerprints (no luminance emboss) */}
    <filter id="clay" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves={2} seed={seed} result="lump" />
      <feDisplacementMap in="SourceGraphic" in2="lump" scale={7} xChannelSelector="R" yChannelSelector="G" result="src" />
      <feTurbulence type="fractalNoise" baseFrequency="0.32" numOctaves={3} seed={seed + 11} result="fine" />
      <feColorMatrix in="fine" type="luminanceToAlpha" result="grain" />
      <feDiffuseLighting in="grain" surfaceScale={1.6} diffuseConstant={1} lightingColor="#FFFFFF" result="gl">
        <feDistantLight azimuth={225} elevation={60} />
      </feDiffuseLighting>
      <feComposite in="src" in2="gl" operator="arithmetic" k1={1.08} k2={0.0} result="out" />
      <feComposite in="out" in2="src" operator="in" />
    </filter>
    {/* per object: height from the object's own blurred silhouette = puffy, sculpted clay volume */}
    {[["inflate", 14, 10], ["inflateS", 9, 6]].map(([id, blur, scale]) => (
      <filter key={id as string} id={id as string} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation={blur as number} result="h" />
        <feDiffuseLighting in="h" surfaceScale={scale as number} diffuseConstant={1.15 * light} lightingColor="#FFF2E2" result="d">
          <feDistantLight azimuth={225} elevation={48} />
        </feDiffuseLighting>
        <feSpecularLighting in="h" surfaceScale={scale as number} specularConstant={0.55} specularExponent={18} lightingColor="#FFFFFF" result="sp">
          <feDistantLight azimuth={225} elevation={48} />
        </feSpecularLighting>
        <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1={1.2} result="lit" />
        <feComposite in="sp" in2="SourceAlpha" operator="in" result="sp2" />
        <feComposite in="lit" in2="sp2" operator="arithmetic" k2={1} k3={0.5} result="o" />
        <feComposite in="o" in2="SourceAlpha" operator="in" />
      </filter>
    ))}
  </defs>
);

/** Stop-motion timing: animate on twos (12 poses per second at 24 fps feel, from a 30 fps timeline). */
export const onTwos = (f: number) => Math.floor(f / 2) * 2;
export const boilSeed = (f: number) => Math.floor(f / 2) % 6;
