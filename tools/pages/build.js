#!/usr/bin/env node
/**
 * Builds the playable Halloween cemetery for GitHub Pages.
 *
 *   node tools/pages/build.js [--out dist/pages]
 *
 * Copies www/ into the output folder without what only the other views use
 * (the 3D view's models and textures, its three.js bundle, the classic
 * launcher's splash video and direction paintings), makes www/halloween.html
 * the site's index.html and locks isometric.html to the cemetery
 * (MROWL_SITE, read by ProtoSession), so neither the level picker nor the
 * dungeon can be reached. The game's links back to the launch screen
 * (../index.html) land on the Halloween start page.
 *
 * It is also an installable web app that plays offline: a manifest and icons
 * (tools/pages/icons/), and a service worker (tools/pages/sw.js) that saves
 * every file of the site on the first visit, listed here with a content hash
 * so a new deploy downloads only what changed. The start page's Add to Home
 * Screen button and offline line work from these.
 *
 * .github/workflows/pages.yml runs it and deploys the folder;
 * `npm run pages:serve` serves the result on http://localhost:8090 and
 * `npm run test:pages` plays it through headlessly.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..');
const WWW = path.join(ROOT, 'www');
const args = process.argv.slice(2);
const outArg = args.indexOf('--out') === -1 ? 'dist/pages' : args[args.indexOf('--out') + 1];
const OUT = path.resolve(ROOT, outArg);

// Paths under www/ the cemetery never loads ('-' at the end: a file prefix)
const EXCLUDE = [
  'index.html',                 // the multi-view launcher; halloween.html takes its place
  'halloween.html',             // copied as index.html
  'first-person.html',
  'js/proto/fp-',
  'js/lib/three.bundle.js',
  'js/lib/three-entry.js',
  'js/lib/maze-bundle.js',
  'assets/proto/fp',
  'assets/directions',
  'assets/video',
  'assets/thumbs'
];

const SITE_LOCK = '<script>var MROWL_SITE = { level: \'cemetery\' };</script>';

function excluded(rel) {
  if (/(^|\/)\.DS_Store$/.test(rel) || /(^|\/)README\.md$/.test(rel)) return true;
  return EXCLUDE.some(function(e) {
    if (e.endsWith('-')) return rel.indexOf(e) === 0;
    return rel === e || rel.indexOf(e + '/') === 0;
  });
}

function copyTree(src, dst, rel) {
  let files = 0, bytes = 0;
  for (const name of fs.readdirSync(src)) {
    const r = rel ? rel + '/' + name : name;
    if (excluded(r)) continue;
    const s = path.join(src, name), d = path.join(dst, name);
    const st = fs.statSync(s);
    if (st.isDirectory()) {
      fs.mkdirSync(d, { recursive: true });
      const sub = copyTree(s, d, r);
      files += sub.files; bytes += sub.bytes;
    } else {
      fs.copyFileSync(s, d);
      files++; bytes += st.size;
    }
  }
  return { files, bytes };
}

const REDIRECT = '<!DOCTYPE html><meta charset="UTF-8"><title>Mr Owl\'s Halloween Cemetery</title><link rel="icon" type="image/png" href="../assets/icon.png">' +
  '<script>location.replace(\'../isometric.html\' + location.search);</script>' +
  '<a href="../">Mr Owl\'s Halloween Cemetery</a>\n';

const MANIFEST = {
  name: 'Mr Owl\'s Halloween Cemetery',
  short_name: 'Mr Owl',
  description: 'Learn Polish in a haunted cemetery: beat the monsters with Polish words and face the Grim Reaper.',
  lang: 'en',
  start_url: './',
  scope: './',
  display: 'fullscreen',
  orientation: 'any',
  background_color: '#05060a',
  theme_color: '#05060a',
  icons: [
    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }
  ]
};

// head tags of the installable app, and the service worker for both pages
const APP_HEAD = '<link rel="manifest" href="manifest.webmanifest">\n' +
  '  <meta name="theme-color" content="#05060a">\n' +
  '  <meta name="mobile-web-app-capable" content="yes">\n' +
  '  <meta name="apple-mobile-web-app-capable" content="yes">\n' +
  '  <meta name="apple-mobile-web-app-status-bar-style" content="black">\n' +
  '  <meta name="apple-mobile-web-app-title" content="Mr Owl">\n' +
  '  <link rel="apple-touch-icon" href="icons/apple-touch-icon.png">\n  ';
const SW_REGISTER = '<script>if (\'serviceWorker\' in navigator) navigator.serviceWorker.register(\'sw.js\').catch(function() {});</script>\n  ';

function addAppHead(file) {
  let html = fs.readFileSync(file, 'utf8');
  if (html.indexOf('<title>') === -1) throw new Error('no title in ' + file);
  html = html.replace('<title>', APP_HEAD + SW_REGISTER + '<title>');
  fs.writeFileSync(file, html);
}

function listFiles(dir, rel, out) {
  for (const name of fs.readdirSync(dir).sort()) {
    const r = rel ? rel + '/' + name : name;
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) listFiles(full, r, out);
    else out.push(r);
  }
  return out;
}

/** sw.js with every file of the site and a hash of its content */
function writeServiceWorker() {
  const list = listFiles(OUT, '', []).filter(r => r !== '.nojekyll' && r !== 'sw.js').map(r => ({
    url: r.split('/').map(encodeURIComponent).join('/'),
    rev: crypto.createHash('sha1').update(fs.readFileSync(path.join(OUT, r))).digest('hex').slice(0, 12)
  }));
  const version = crypto.createHash('sha1').update(JSON.stringify(list)).digest('hex').slice(0, 12);
  let sw = fs.readFileSync(path.join(__dirname, 'sw.js'), 'utf8');
  if (sw.indexOf('/*PRECACHE*/[]') === -1 || sw.indexOf('/*VERSION*/') === -1) throw new Error('sw.js lost its placeholders');
  sw = sw.replace('/*PRECACHE*/[]', JSON.stringify(list)).replace('/*VERSION*/', version);
  fs.writeFileSync(path.join(OUT, 'sw.js'), sw);
  return { files: list.length, version: version };
}

function lockPage(file, title) {
  let html = fs.readFileSync(file, 'utf8');
  if (html.indexOf('<script') === -1) throw new Error('no script tag in ' + file);
  if (title) html = html.replace(/<title>[^<]*<\/title>/, '<title>' + title + '</title>');
  // before the first script, so ProtoSession sees it when it loads
  html = html.replace('<script', SITE_LOCK + '\n  <script');
  fs.writeFileSync(file, html);
}

function main() {
  if (!OUT.startsWith(ROOT + path.sep) || OUT === WWW || WWW.startsWith(OUT)) throw new Error('refusing to build into ' + OUT);
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const stats = copyTree(WWW, OUT, '');
  fs.copyFileSync(path.join(WWW, 'halloween.html'), path.join(OUT, 'index.html'));
  lockPage(path.join(OUT, 'isometric.html'), 'Mr Owl\'s Halloween Cemetery');
  lockPage(path.join(OUT, 'index.html'));
  // the pages lived under proto/ when the site first went up: keep those links working
  fs.mkdirSync(path.join(OUT, 'proto'), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'proto', 'isometric.html'), REDIRECT);
  fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
  fs.mkdirSync(path.join(OUT, 'icons'));
  for (const icon of fs.readdirSync(path.join(__dirname, 'icons'))) fs.copyFileSync(path.join(__dirname, 'icons', icon), path.join(OUT, 'icons', icon));
  fs.writeFileSync(path.join(OUT, 'manifest.webmanifest'), JSON.stringify(MANIFEST, null, 2) + '\n');
  addAppHead(path.join(OUT, 'index.html'));
  addAppHead(path.join(OUT, 'isometric.html'));
  const sw = writeServiceWorker();
  console.log('pages: service worker ' + sw.version + ' saves ' + sw.files + ' files for offline play');
  console.log('pages: ' + (stats.files + 1) + ' files, ' + (stats.bytes / 1048576).toFixed(1) + ' MB in ' + path.relative(ROOT, OUT));
}

main();
