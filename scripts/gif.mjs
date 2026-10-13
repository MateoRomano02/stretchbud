// Renders docs/demo.gif frames: a few exercises, each frozen at evenly spaced points of its cycle.
// Usage: node scripts/gif.mjs <baseUrl> <framesDir> [framesPerExercise] [id ...]
// Then: ffmpeg -framerate 12 -i <framesDir>/%04d.png -vf "scale=480:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse" docs/demo.gif
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const [base, out, perArg, ...ids] = process.argv.slice(2);
if (!base || !out) { console.error('usage: node scripts/gif.mjs <baseUrl> <framesDir> [framesPerExercise] [id ...]'); process.exit(2); }
const per = Number(perArg) || 24;
const list = ids.length ? ids : ['chin-tuck', 'bodyweight-squat', 'desk-push-up', 'shoulder-rolls'];
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROME || undefined,
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 640, height: 760 }, deviceScaleFactor: 1 });
let n = 0;
for (const id of list) {
  for (let i = 0; i < per; i++) {
    await page.goto(`${base}/index.html?demo&capture&ex=${id}&t=${(i / per).toFixed(3)}`);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${out}/${String(n++).padStart(4, '0')}.png` });
  }
  console.log(id, 'done');
}
await browser.close();
