#!/usr/bin/env node
/**
 * Builds the playable Halloween cemetery for GitHub Pages.
 *
 *   node tools/pages/build.js [--out dist/pages]
 *
 * Copies www/ into the output folder without what only the other views use
 * (the 3D view's models and textures, its three.js bundle, the classic
 * launcher's splash video and direction paintings), makes www/halloween.html
 * the site's index.html and locks proto/isometric.html to the cemetery
 * (MROWL_SITE, read by ProtoSession), so neither the level picker nor the
 * dungeon can be reached. The game's links back to the launch screen
 * (../index.html) land on the Halloween start page.
 *
 * .github/workflows/pages.yml runs it and deploys the folder;
 * `npm run pages:serve` serves the result on http://localhost:8090 and
 * `npm run test:pages` plays it through headlessly.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const WWW = path.join(ROOT, 'www');
const args = process.argv.slice(2);
const outArg = args.indexOf('--out') === -1 ? 'dist/pages' : args[args.indexOf('--out') + 1];
const OUT = path.resolve(ROOT, outArg);

// Paths under www/ the cemetery never loads ('-' at the end: a file prefix)
const EXCLUDE = [
  'index.html',                 // the multi-view launcher; halloween.html takes its place
  'halloween.html',             // copied as index.html
  'proto/first-person.html',
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

function lockIsometric(file) {
  let html = fs.readFileSync(file, 'utf8');
  if (html.indexOf('<script') === -1) throw new Error('no script tag in ' + file);
  html = html.replace(/<title>[^<]*<\/title>/, '<title>Mr Owl\'s Halloween Cemetery</title>');
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
  lockIsometric(path.join(OUT, 'proto', 'isometric.html'));
  fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
  console.log('pages: ' + (stats.files + 1) + ' files, ' + (stats.bytes / 1048576).toFixed(1) + ' MB in ' + path.relative(ROOT, OUT));
}

main();
