#!/usr/bin/env node
/**
 * Close-up of a cemetery lantern in headless Chrome.
 *
 *   node tools/smoke/cem-lantern-shot.js [--port 8094] [--shot out.png] [--zoom 2.5] [--lantern 0]
 *
 * Boots the isometric page on the cemetery, teleports Mr Owl onto the lane
 * tile next to a lamp post (`--lantern` picks which of `level.lights`), zooms
 * the camera in and saves the view around him. It also prints where the
 * scene put the post sprite, the flame and the glow, so the flame can be
 * checked against the lamp head of the sprite by number as well as by eye.
 */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
function opt(name, def) { const i = args.indexOf(name); return i === -1 ? def : args[i + 1]; }
const PORT = Number(opt('--port', 8096));
const SHOT = opt('--shot', path.join(ROOT, 'docs', 'screenshots', 'cem-lantern.png'));
const ZOOM = Number(opt('--zoom', 2.5));
const WHICH = Number(opt('--lantern', 0));
const WWW = path.resolve(opt('--www', path.join(ROOT, 'www')));   // serve another checkout's www for a before/after

const wait = ms => new Promise(r => setTimeout(r, ms));

/** Refuse a port something else already serves on: the page would silently come from that server, not from WWW */
function assertPortFree(port) {
  return new Promise((resolve, reject) => {
    const probe = require('net').createServer();
    probe.once('error', e => reject(new Error('port ' + port + ' is taken (' + e.code + '); pass --port')));
    probe.once('listening', () => probe.close(resolve));
    probe.listen(port);
  });
}

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
  await assertPortFree(PORT);
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '-d', WWW], { stdio: 'ignore' });
  await wait(600);
  const browser = await puppeteer.launch({
    executablePath: opt('--chrome', findChrome()),
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
           '--window-size=1200,860', '--autoplay-policy=no-user-gesture-required']
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 860 });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto('http://localhost:' + PORT + '/proto/isometric.html?name=Lantern&action=new&level=cemetery&music=none',
      { waitUntil: 'load' });
    await page.waitForFunction(() => window.ProtoCem && ProtoCem.getScene() && !ProtoCem.isBusy(), { timeout: 30000 });

    const info = await page.evaluate(async (which, zoom) => {
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const L = ProtoCem.getLevel(), S = ProtoCem.getScene();
      L.graceMs = 1e9;
      // a lamp post with a lane tile beside it, on its screen-left side when there is one
      const K = CemModel.KIND;
      let pick = null;
      for (let i = which; i < L.lights.length && !pick; i++) {
        const lt = L.lights[i];
        const around = [[0, 1], [-1, 0], [1, 0], [0, -1], [-1, 1], [1, 1]];
        for (const [dx, dy] of around) {
          const t = CemModel.tileAt(L, lt.gx + dx, lt.gy + dy);
          if (t && t.kind === K.path) { pick = { light: lt, gx: t.gx, gy: t.gy, i }; break; }
        }
      }
      ProtoCem.teleport(pick.gx, pick.gy);
      await wait(1500);
      const idx = CemModel.index(L, pick.light.gx, pick.light.gy);
      const post = (S.tileProps[idx] || [])[0];
      // frame the post itself, halfway up, rather than Mr Owl beside it
      const cam = S.cameras.main;
      cam.stopFollow();
      cam.setZoom(zoom);
      const pp = IsoModel.gridToIso(pick.light.gx, pick.light.gy);
      cam.centerOn(pp.x, pp.y - 60);
      await wait(300);
      const lights = S.tileLights[idx] || [];
      const rec = o => o ? { x: Math.round(o.x * 10) / 10, y: Math.round(o.y * 10) / 10, key: o.texture && o.texture.key, ox: o.originX, oy: o.originY, w: o.width, h: o.height, scale: o.scaleX } : null;
      return {
        lantern: pick.i, at: [pick.light.gx, pick.light.gy], owl: [pick.gx, pick.gy],
        post: rec(post),
        glow: rec(lights.find(o => o.texture && o.texture.key === 'glow_warm')),
        flame: rec(lights.find(o => o.texture && /^flame_/.test(o.texture.key)))
      };
    }, WHICH, ZOOM);

    fs.mkdirSync(path.dirname(SHOT), { recursive: true });
    // the post is at the viewport centre (600, 430), between the top and bottom panels
    await page.screenshot({ path: SHOT, clip: { x: 280, y: 100, width: 640, height: 560 } });
    console.log(JSON.stringify(info, null, 1));
    if (info.post && info.flame) {
      // the sprite's top-left corner in world px, from its anchor
      const left = info.post.x - info.post.ox * info.post.w * info.post.scale;
      const top = info.post.y - info.post.oy * info.post.h * info.post.scale;
      console.log('flame inside sprite at fraction x=%s y=%s',
        ((info.flame.x - left) / (info.post.w * info.post.scale)).toFixed(3),
        ((info.flame.y - top) / (info.post.h * info.post.scale)).toFixed(3));
    }
    console.log('shot', SHOT);
    if (errors.length) { console.log('page errors:', errors); process.exitCode = 1; }
  } finally {
    await browser.close();
    server.kill();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
