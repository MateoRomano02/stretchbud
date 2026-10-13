// Captures demo screenshots of Bud with a real WebGL context.
// Usage: node scripts/shots.mjs <baseUrl> <outDir> [id[@t[@side]] ...]
// Needs playwright-core (devDependency) and a Chromium; set CHROME=/path/to/chrome
// or it uses Playwright's cached Chromium.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const [base, out, ...specs] = process.argv.slice(2);
if (!base || !out) { console.error('usage: node scripts/shots.mjs <baseUrl> <outDir> [id@t ...]'); process.exit(2); }
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROME || undefined,
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 640, height: 760 }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/GL Driver Message|GPU stall/.test(m.text())) errors.push(`[${m.type()}] ${m.text()}`); });
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));

const list = specs.length ? specs : ['__routine'];
for (const spec of list) {
  const [id, t, side] = spec.split('@');
  const url = id === '__routine'
    ? `${base}/index.html?demo&capture`
    : `${base}/index.html?demo&capture&ex=${id}${t ? `&t=${t}` : ''}${side ? `&side=${side}` : ''}`;
  await page.goto(url);
  await page.waitForTimeout(id === '__routine' ? 1500 : 1800);
  const info = await page.evaluate(() => (window.__budInfo ? window.__budInfo() : null));
  const file = `${out}/${id}${t ? '-' + t : ''}${side ? '-' + side : ''}.png`;
  await page.screenshot({ path: file });
  console.log(file, info ? JSON.stringify(info) : '');
}
await browser.close();
if (errors.length) { console.log('CONSOLE:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('no console errors');
