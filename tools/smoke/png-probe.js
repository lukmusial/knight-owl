#!/usr/bin/env node
/**
 * Measure a sprite PNG through headless Chrome (no PIL here): prints the
 * alpha extent and the bright (lamp glass) columns of every row, and saves an
 * enlarged, gridded copy with marker points drawn on it.
 *
 *   node tools/smoke/png-probe.js <png> <out.png> [x,y,label ...]
 *
 * Marker points are fractions of the image (the manifest's anchor/light form).
 */
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-core');

function findChrome() {
  const cands = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'
  ];
  const cache = path.join(process.env.HOME || '', '.cache', 'puppeteer', 'chrome');
  if (fs.existsSync(cache)) {
    for (const v of fs.readdirSync(cache)) {
      cands.unshift(
        path.join(cache, v, 'chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'),
        path.join(cache, v, 'chrome-mac-x64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'));
    }
  }
  return cands.find(fs.existsSync);
}

async function main() {
  const [src, out, ...marks] = process.argv.slice(2);
  const data = 'data:image/png;base64,' + fs.readFileSync(src).toString('base64');
  const markers = marks.map(m => { const [x, y, label] = m.split(','); return { x: Number(x), y: Number(y), label: label || '' }; });
  const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true, args: ['--no-sandbox', '--disable-gpu'] });
  try {
    const page = await browser.newPage();
    await page.setContent('<canvas id=c></canvas><canvas id=b></canvas>');
    const res = await page.evaluate(async (data, markers) => {
      const img = new Image(); img.src = data; await img.decode();
      const w = img.width, h = img.height;
      const c = document.getElementById('c'); c.width = w; c.height = h;
      const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
      const px = ctx.getImageData(0, 0, w, h).data;
      const rows = [];
      for (let y = 0; y < h; y++) {
        let x0 = -1, x1 = -1; const bright = [];
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          if (px[i + 3] > 30) {
            if (x0 < 0) x0 = x; x1 = x;
            const lum = (px[i] + px[i + 1] + px[i + 2]) / 3;
            if (lum > 150) bright.push(x);
          }
        }
        rows.push({ y, x0, x1, bright });
      }
      const S = 6;
      const b = document.getElementById('b'); b.width = w * S; b.height = h * S;
      const bx = b.getContext('2d');
      bx.fillStyle = '#28283c'; bx.fillRect(0, 0, b.width, b.height);
      bx.imageSmoothingEnabled = false; bx.drawImage(img, 0, 0, w * S, h * S);
      bx.strokeStyle = 'rgba(255,0,0,0.35)'; bx.fillStyle = '#ff0'; bx.font = '10px monospace';
      for (let x = 0; x < w; x += 10) { bx.beginPath(); bx.moveTo(x * S, 0); bx.lineTo(x * S, h * S); bx.stroke(); bx.fillText(String(x), x * S + 1, 10); }
      for (let y = 0; y < h; y += 10) { bx.beginPath(); bx.moveTo(0, y * S); bx.lineTo(w * S, y * S); bx.stroke(); bx.fillText(String(y), 1, y * S + 10); }
      const cols = ['#0ff', '#0f0', '#f0f', '#fa0'];
      markers.forEach((m, i) => {
        bx.strokeStyle = cols[i % cols.length]; bx.lineWidth = 2;
        bx.beginPath(); bx.arc(m.x * w * S, m.y * h * S, 8, 0, Math.PI * 2); bx.stroke();
        bx.fillStyle = cols[i % cols.length]; bx.fillText(m.label, m.x * w * S + 10, m.y * h * S + 4);
      });
      return { w, h, rows, png: b.toDataURL('image/png') };
    }, data, markers);
    fs.writeFileSync(out, Buffer.from(res.png.split(',')[1], 'base64'));
    console.log('size', res.w, 'x', res.h);
    for (const r of res.rows) {
      if (r.x0 < 0) continue;
      console.log(String(r.y).padStart(3), 'alpha', r.x0, '-', r.x1, r.bright.length ? 'bright ' + r.bright.join(',') : '');
    }
  } finally {
    await browser.close();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
