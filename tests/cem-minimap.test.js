/**
 * CemMinimap tests (SVG string minimap of the cemetery)
 */

TestRunner.suite('CemMinimap', () => {
  function countOf(svg, needle) {
    return svg.split(needle).length - 1;
  }

  TestRunner.test('renders an SVG with the owl marker and only remembered tiles', () => {
    var L = CemModel.generate(31);
    var svg = CemMinimap.render(L);
    TestRunner.assert(svg.indexOf('<svg') === 0 && svg.indexOf('</svg>') === svg.length - 6, 'svg wrapper');
    TestRunner.assert(svg.indexOf('class="dungeon-map-svg') !== -1, 'shares the HUD map class');
    TestRunner.assertEqual(countOf(svg, 'current-room'), 1, 'one owl marker');
    var seen = 0, tombTiles = 0;
    for (var i = 0; i < L.tiles.length; i++) {
      if (!L.vis[i]) continue;
      if (L.tiles[i].tombId && L.tiles[i].kind !== 'tomb_door') tombTiles++; else seen++;
    }
    TestRunner.assertEqual(countOf(svg, '<polygon points='), seen, 'one diamond per remembered non-tomb tile');
    TestRunner.assert(countOf(svg, 'cem-map-tomb') <= 5, 'tombs drawn at most once each');
  });

  TestRunner.test('gridAt inverts the map projection under any fit', () => {
    const L = CemModel.generate(24);
    const t = CemMinimap.fit(L, 1400, 800);
    [[0, 0], [L.W - 1, L.H - 1], [30, 12], [L.owl.gx, L.owl.gy]].forEach(function(g) {
      const p = CemMinimap.project(g[0], g[1]);
      const x = (p.x - t.left) * t.scale + t.ox, y = (p.y - t.top) * t.scale + t.oy;
      const back = CemMinimap.gridAt(t, x, y);
      TestRunner.assertEqual(back.gx, g[0], 'gx back for ' + g);
      TestRunner.assertEqual(back.gy, g[1], 'gy back for ' + g);
    });
    TestRunner.assert(t.ox >= 0 && t.oy >= 0, 'the map is centred, never cut');
  });

  TestRunner.test('shows everything once all tiles are seen, marks the unlocked great tomb', () => {
    var L = CemModel.generate(32);
    for (var i = 0; i < L.seen.length; i++) L.seen[i] = 1;
    CemModel.updateVisibility(L);
    var svg = CemMinimap.render(L);
    TestRunner.assertEqual(countOf(svg, 'class="cem-map-tomb'), 5, 'five tombs');
    TestRunner.assertEqual(countOf(svg, 'cem-map-lantern'), L.lights.length, 'every lantern');
    TestRunner.assert(svg.indexOf('#ffd166') === -1, 'great tomb locked');
    L.keyParts = [true, true, true, true];
    TestRunner.assert(CemMinimap.render(L).indexOf('#ffd166') !== -1, 'great tomb unlocked outline');
    var visibleMonsters = CemModel.monstersVisible(L).filter(function(m) { return m.role !== 'boss'; }).length;
    TestRunner.assertEqual(countOf(svg, 'cem-map-monster"'), visibleMonsters, 'visible monsters marked');
    TestRunner.assertEqual(countOf(CemMinimap.render(L, { showMonsters: false }), 'cem-map-monster"'), 0, 'monsters can be hidden');
  });

  TestRunner.test('tells visited tombs from the ones still to visit', () => {
    var L = CemModel.generate(33);
    for (var i = 0; i < L.seen.length; i++) L.seen[i] = 1;
    CemModel.updateVisibility(L);
    var before = CemMinimap.render(L);
    TestRunner.assertEqual(countOf(before, ' visited"'), 0, 'nothing visited at the start');
    TestRunner.assertEqual(countOf(before, 'cem-map-tick'), 0, 'no ticks at the start');
    TestRunner.assertEqual(countOf(before, 'stroke="#ffd08a"'), 4, 'the four small tombs outlined gold, like their door light');
    var key0 = CemMinimap.stateKey(L);
    CemModel.defeatMonster(L, 'g1');
    var after = CemMinimap.render(L);
    TestRunner.assertEqual(countOf(after, 'class="cem-map-tomb visited"'), 1, 'the first tomb is marked visited');
    TestRunner.assertEqual(countOf(after, 'cem-map-tick'), 1, 'and gets a tick');
    TestRunner.assertEqual(countOf(after, 'stroke="#ffd08a"'), 3, 'three still to visit');
    TestRunner.assert(CemMinimap.stateKey(L) !== key0, 'the HUD map redraws when a tomb is done');
    var large = L.tombs.filter(function(t) { return t.size === 'large'; })[0];
    TestRunner.assert(!CemMinimap.tombVisited(L, large), 'the great tomb waits for the Reaper');
    ['g2', 'g3', 'g4', 'boss'].forEach(function(uid) { CemModel.defeatMonster(L, uid); });
    TestRunner.assert(CemMinimap.tombVisited(L, large), 'beaten Reaper: the great tomb is done');
    TestRunner.assertEqual(countOf(CemMinimap.render(L), 'cem-map-tick'), 5, 'all five ticked');
  });
});
