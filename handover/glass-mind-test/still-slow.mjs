// still.mjs with no screenshot timeout (software WebGL on a GPU-less machine is slow)
import path from 'path'; import fs from 'fs';
import { openDemo, closeServer } from '../../core/render/page.mjs';
const [dir, out, ...times] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const { browser, page } = await openDemo(dir, { w: 1920, h: 1080, q: process.env.Q || '', warnings: true });
for (const ts of times) { const t0 = Date.now();
  await page.evaluate(t => window.render(t), parseFloat(ts));
  const f = path.join(out, `t_${ts}.jpg`); await page.screenshot({ path: f, type: 'jpeg', quality: 93, timeout: 0 }); console.log(f, Date.now() - t0, 'ms'); }
await browser.close(); closeServer();
