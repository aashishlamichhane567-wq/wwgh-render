// node stills.mjs <outdir> <comp> frame1 frame2 ...  — bundles once, renders each frame as a half-size jpeg.
// Run from the repo root.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
const [out, comp, ...frames] = process.argv.slice(2);
const root = process.cwd();
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), rspack: true, publicDir: path.join(root, "public") });
const browser = await openBrowser("chrome", { browserExecutable: "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell" });
const composition = await selectComposition({ serveUrl, id: comp, puppeteerInstance: browser });
for (const fr of frames) {
  await renderStill({ composition, serveUrl, frame: Number(fr), output: path.join(out, `f${String(fr).padStart(6, "0")}.jpeg`), imageFormat: "jpeg", scale: 0.5, puppeteerInstance: browser });
}
await browser.close({ silent: true });
console.log("done", frames.length);
