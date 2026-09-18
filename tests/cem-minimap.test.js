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
});
