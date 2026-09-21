/**
 * CemReveal tests (the night reveal that follows Mr Owl's float position)
 */

TestRunner.suite('CemReveal', () => {
  const C = CemReveal.CONFIG;

  function gen(seed) {
    return CemModel.generate(seed);
  }

  /**
   * A level with nothing remembered yet whose owl stands on a lane tile that
   * no lantern lights (there is a lamp post every 8 tiles, so lamps are never
   * far; the tests pick unlit tiles explicitly)
   */
  function darkLevel(seed) {
    var L = gen(seed);
    var spot = null;
    for (var i = 0; i < L.tiles.length && !spot; i++) {
      var t = L.tiles[i];
      if (t.kind !== CemModel.KIND.path || t.gx < 10 || t.gy < 10 || t.gx > L.W - 10 || t.gy > L.H - 10) continue;
      var ok = L.lights.every(function(l) {
        var dx = l.gx - t.gx, dy = l.gy - t.gy;
        return Math.sqrt(dx * dx + dy * dy) > L.cfg.VIS_LANTERN + 1.5;
      });
      if (ok) spot = t;
    }
    TestRunner.assertTruthy(spot, 'a lane tile no lantern lights');
    for (var s = 0; s < L.seen.length; s++) L.seen[s] = 0;
    L.owl = { gx: spot.gx, gy: spot.gy, x: spot.gx, y: spot.gy, path: [] };
    return L;
  }

  /** An unlit tile `dist` tiles from the owl along one of the four axes: { idx, dx, dy } */
  function unlitAt(L, R, dist) {
    var o = L.owl;
    var dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (var d = 0; d < dirs.length; d++) {
      var gx = o.gx + dirs[d][0] * dist, gy = o.gy + dirs[d][1] * dist;
      if (!CemModel.tileAt(L, gx, gy)) continue;
      var idx = CemModel.index(L, gx, gy);
      if (!R.lamp[idx]) return { idx: idx, dx: dirs[d][0], dy: dirs[d][1] };
    }
    TestRunner.assert(false, 'an unlit tile ' + dist + ' tiles off');
    return null;
  }

  function fresh() {
    return { changed: [] };
  }

  TestRunner.test('the factor is 1 inside INNER, 0 beyond OUTER and falls smoothly between', () => {
    TestRunner.assertEqual(CemReveal.factorAt(0), 1, 'on top of him');
    TestRunner.assertEqual(CemReveal.factorAt(C.INNER), 1, 'at the inner edge');
    TestRunner.assertEqual(CemReveal.factorAt(C.OUTER), 0, 'at the outer edge');
    TestRunner.assertEqual(CemReveal.factorAt(C.OUTER + 5), 0, 'far away');
    var mid = CemReveal.factorAt((C.INNER + C.OUTER) / 2);
    TestRunner.assert(mid > 0.45 && mid < 0.55, 'half way is about a half: ' + mid);
    var last = 1;
    for (var d = C.INNER; d <= C.OUTER; d += 0.1) {
      var f = CemReveal.factorAt(d);
      TestRunner.assert(f <= last + 1e-9, 'never rises with distance');
      last = f;
    }
  });

  TestRunner.test('props turn solid before they turn warm', () => {
    TestRunner.assertEqual(CemReveal.alphaOf(0), 0, 'dark is invisible');
    TestRunner.assertEqual(CemReveal.alphaOf(C.ALPHA_FULL_AT), 1, 'solid from ALPHA_FULL_AT');
    TestRunner.assertEqual(CemReveal.alphaOf(1), 1, 'and stays solid');
    TestRunner.assertEqual(CemReveal.litOf(C.LIT_FROM), 0, 'still the remembered blue at LIT_FROM');
    TestRunner.assert(CemReveal.litOf(0.5) > 0 && CemReveal.litOf(0.5) < 1, 'warming half way');
    TestRunner.assertEqual(CemReveal.litOf(1), 1, 'lantern light when fully revealed');
    // nothing is shown at the outer edge: the curve starts from 0
    TestRunner.assertEqual(CemReveal.alphaOf(CemReveal.factorAt(C.OUTER)), 0, 'invisible at OUTER');
    TestRunner.assert(CemReveal.alphaOf(CemReveal.factorAt(C.OUTER - 0.05)) < 0.01, 'and barely there a hair inside it');
  });

  TestRunner.test('reduced motion steps instead of ramping', () => {
    TestRunner.assertEqual(CemReveal.alphaOf(0.05, C, true), 1, 'anything revealed is solid');
    TestRunner.assertEqual(CemReveal.alphaOf(0, C, true), 0, 'dark stays dark');
    TestRunner.assertEqual(CemReveal.litOf(0.9, C, true), 0, 'blue until fully revealed');
    TestRunner.assertEqual(CemReveal.litOf(1, C, true), 1, 'then lit');
    TestRunner.assertEqual(CemReveal.approach(0.2, 1, 2.5, 16, true), 1, 'no easing: the value snaps');
  });

  TestRunner.test('lantern-lit and remembered tiles start fully revealed, the rest dark', () => {
    var L = gen(51);
    var R = CemReveal.create(L);
    var lamp = L.lights[0];
    var li = CemModel.index(L, lamp.gx, lamp.gy);
    TestRunner.assertEqual(R.lamp[li], 1, 'the lamp post tile is lantern-lit');
    TestRunner.assertEqual(R.peak[li], 1, 'and fully revealed');
    TestRunner.assertEqual(CemReveal.alphaAt(R, li), 1, 'with solid ground');
    TestRunner.assertEqual(CemReveal.factor(R, li), 1, 'live factor 1 without Mr Owl');
    var dark = 0, seenOk = true;
    for (var i = 0; i < L.tiles.length; i++) {
      if (L.seen[i] && R.peak[i] !== 1) seenOk = false;
      if (!L.seen[i] && !R.lamp[i]) { dark++; if (R.peak[i] !== 0) seenOk = false; }
    }
    TestRunner.assert(seenOk, 'seen tiles at 1, unseen unlit tiles at 0');
    TestRunner.assert(dark > 1000, 'most of the grounds are still dark');
  });

  TestRunner.test('walking toward a tile brings it up a little at a time and the ground level only rises', () => {
    var L = darkLevel(52);
    var R = CemReveal.create(L);
    var o = L.owl;
    var out = fresh();
    CemReveal.update(R, o.x, o.y, out);
    var at = unlitAt(L, R, 7);
    var target = at.idx;
    TestRunner.assertEqual(R.f[target], 0, 'seven tiles off: still dark');
    var lastF = 0, lastA = 0, steps = 0, biggest = 0;
    for (var k = 1; k <= 60; k++) {
      CemReveal.update(R, o.x + at.dx * k * 0.1, o.y + at.dy * k * 0.1, out);
      var f = R.f[target];
      TestRunner.assert(f >= lastF - 1e-6, 'factor never falls while approaching');
      var a = CemReveal.alphaAt(R, target);
      biggest = Math.max(biggest, a - lastA);
      if (f > lastF) steps++;
      lastF = f; lastA = a;
    }
    TestRunner.assert(steps >= 8, 'the factor climbed in many small steps: ' + steps);
    TestRunner.assert(lastF > 0.5, 'and he got it well out of the dark: ' + lastF);
    TestRunner.assert(biggest < 0.12, 'a tenth of a tile never moved the alpha by more than a little: ' + biggest.toFixed(3));
    TestRunner.assertEqual(R.peak[target], lastF, 'the peak is where he got it to');
  });

  TestRunner.test('what he walks away from stays remembered: the live factor drops, the peak does not', () => {
    var L = darkLevel(53);
    var R = CemReveal.create(L);
    var o = L.owl;
    var out = fresh();
    CemReveal.update(R, o.x, o.y, out);
    var here = CemModel.index(L, o.gx, o.gy);
    TestRunner.assertEqual(R.lamp[here], 0, 'no lantern on his tile');
    TestRunner.assertEqual(R.f[here], 1, 'his own tile is lit');
    TestRunner.assertEqual(R.peak[here], 1, 'and remembered');
    // step away along the row (the window follows him, so the tile falls to 0 inside it)
    for (var k = 1; k <= 100; k++) CemReveal.update(R, o.x + k * 0.1, o.y, out);
    TestRunner.assertEqual(R.f[here], 0, 'ten tiles later the live factor is 0');
    TestRunner.assertEqual(R.peak[here], 1, 'the peak stays');
    TestRunner.assertEqual(CemReveal.alphaAt(R, here), 1, 'so its props stay solid');
    TestRunner.assertEqual(CemReveal.litAt(R, here), 0, 'in the remembered blue');
    TestRunner.assertEqual(CemReveal.alphaAt(R, here), 1, 'and its ground stays');
  });

  TestRunner.test('only the window around him is looked at, and nothing changes while he stands still', () => {
    var L = darkLevel(54);
    var R = CemReveal.create(L);
    var o = L.owl;
    var out = fresh();
    CemReveal.update(R, o.x, o.y, out);
    TestRunner.assert(out.changed.length > 0, 'the first frame lights the window');
    var maxD = 0;
    out.changed.forEach(function(idx) {
      var t = L.tiles[idx];
      maxD = Math.max(maxD, Math.abs(t.gx - o.gx), Math.abs(t.gy - o.gy));
    });
    TestRunner.assert(maxD <= R.half, 'nothing further than the window half-size changed: ' + maxD);
    TestRunner.assert(R.active.length <= (2 * R.half + 1) * (2 * R.half + 1), 'active list bounded by the window');
    CemReveal.update(R, o.x, o.y, out);
    TestRunner.assertEqual(out.changed.length, 0, 'a still owl changes nothing');
    var far = 0;
    for (var i = 0; i < R.n; i++) {
      var t = L.tiles[i];
      if (Math.abs(t.gx - o.gx) > R.half || Math.abs(t.gy - o.gy) > R.half) { if (R.f[i] !== 0) far++; }
    }
    TestRunner.assertEqual(far, 0, 'no live factor outside the window');
  });

  TestRunner.test('a teleport puts the old window back in the dark', () => {
    var L = darkLevel(55);
    var R = CemReveal.create(L);
    var o = L.owl;
    var out = fresh();
    CemReveal.update(R, o.x, o.y, out);
    var here = CemModel.index(L, o.gx, o.gy);
    var gate = L.gate;
    TestRunner.assert(Math.abs(gate.gx - o.gx) > R.half || Math.abs(gate.gy - o.gy) > R.half, 'the gate is out of his window');
    CemReveal.update(R, gate.gx, gate.gy, out);
    TestRunner.assertEqual(R.f[here], 0, 'where he stood is dark again');
    TestRunner.assert(out.changed.indexOf(here) !== -1, 'and reported as changed');
    TestRunner.assertEqual(R.f[CemModel.index(L, gate.gx, gate.gy)], 1, 'the gate tile is lit');
  });

  TestRunner.test('a lantern keeps its tiles lit whatever Mr Owl does', () => {
    var L = gen(56);
    var R = CemReveal.create(L);
    var lamp = L.lights[0];
    var li = CemModel.index(L, lamp.gx, lamp.gy);
    var out = fresh();
    CemReveal.update(R, lamp.gx + 20, lamp.gy + 20, out);
    TestRunner.assertEqual(CemReveal.factor(R, li), 1, 'lit from afar');
    TestRunner.assertEqual(CemReveal.litAt(R, li), 1, 'warm from afar');
    TestRunner.assertEqual(CemReveal.alphaAt(R, li), 1, 'solid from afar');
  });

  TestRunner.test('reduced motion: tiles step between dark, remembered and lit', () => {
    var L = darkLevel(57);
    var R = CemReveal.create(L, { instant: true });
    var o = L.owl;
    var out = fresh();
    CemReveal.update(R, o.x, o.y, out);
    var values = {};
    for (var i = 0; i < out.changed.length; i++) values[R.f[out.changed[i]]] = true;
    var keys = Object.keys(values).sort();
    TestRunner.assert(keys.every(function(k) { return k === '0' || k === '0.5' || k === '1'; }), 'only 0, 0.5 and 1: ' + keys.join(','));
    TestRunner.assert(values['1'] && values['0.5'], 'both lit and remembered tiles around him');
    CemReveal.update(R, o.x + 0.2, o.y, out);
    TestRunner.assert(out.changed.length < 40, 'a small move changes only the tiles that crossed a step: ' + out.changed.length);
  });

  TestRunner.test('a moving thing takes the curve from its float position, with lantern light fading past the disc', () => {
    var L = gen(58);
    var R = CemReveal.create(L);
    var ox = 20, oy = 20;
    TestRunner.assertEqual(CemReveal.pointFactor(R, ox, oy, ox, oy, []), 1, 'on top of Mr Owl');
    TestRunner.assertEqual(CemReveal.pointFactor(R, ox, oy, ox + C.OUTER + 1, oy, []), 0, 'beyond OUTER, no lantern: dark');
    // walk a point from 8 tiles off to 2 tiles off: the factor never jumps
    var last = 0, biggest = 0;
    for (var d = 8; d >= 2; d -= 0.05) {
      var f = CemReveal.pointFactor(R, ox, oy, ox + d, oy, []);
      biggest = Math.max(biggest, f - last);
      last = f;
    }
    TestRunner.assert(biggest < 0.03, 'a twentieth of a tile never moved it by more than a little: ' + biggest.toFixed(3));
    var lamp = { gx: 40, gy: 40 };
    var r = R.lampRadius;
    TestRunner.assertEqual(CemReveal.pointFactor(R, ox, oy, lamp.gx + r, lamp.gy, [lamp]), 1, 'lit at the edge of the disc');
    TestRunner.assertEqual(CemReveal.pointFactor(R, ox, oy, lamp.gx + r + C.LAMP_FADE, lamp.gy, [lamp]), 0, 'dark past the fade');
    last = 1; biggest = 0;
    for (var e = 0; e <= C.LAMP_FADE + 0.5; e += 0.05) {
      var lf = CemReveal.pointFactor(R, ox, oy, lamp.gx + r + e, lamp.gy, [lamp]);
      biggest = Math.max(biggest, last - lf);
      last = lf;
    }
    TestRunner.assert(biggest < 0.06, 'leaving the light is gradual: ' + biggest.toFixed(3));
  });

  TestRunner.test('a tile in the camera view comes up to the remembered level over VIEW_FADE_MS, once', () => {
    var L = darkLevel(59);
    var R = CemReveal.create(L);
    var at = unlitAt(L, R, 7);
    var idx = at.idx;
    var out = fresh();
    TestRunner.assertEqual(R.peak[idx], 0, 'dark before the camera reaches it');
    TestRunner.assert(CemReveal.enterView(R, idx), 'the first look starts the fade');
    TestRunner.assert(!CemReveal.enterView(R, idx), 'a second look does not restart it');
    TestRunner.assertEqual(R.fading.length, 1, 'one fade running');
    var last = 0, biggest = 0, frames = 0;
    while (R.fading.length) {
      out.changed.length = 0;
      CemReveal.advanceView(R, 16, out);
      frames++;
      TestRunner.assert(R.peak[idx] >= last, 'the peak never falls');
      biggest = Math.max(biggest, R.peak[idx] - last);
      last = R.peak[idx];
      if (frames > 1000) break;
    }
    var expect = Math.round(C.VIEW_FADE_MS / 16);
    TestRunner.assert(Math.abs(frames - expect) <= 1, 'the fade takes VIEW_FADE_MS: ' + frames + ' frames of 16 ms');
    TestRunner.assert(Math.abs(R.peak[idx] - C.VIEW_PEAK) < 1e-6, 'and ends at VIEW_PEAK: ' + R.peak[idx]);
    TestRunner.assertEqual(CemReveal.alphaAt(R, idx), 1, 'which is solid');
    TestRunner.assertEqual(CemReveal.litAt(R, idx), 0, 'but still the remembered blue');
    TestRunner.assert(biggest < 0.02, 'no frame moved it by more than a little: ' + biggest.toFixed(4));
    TestRunner.assertEqual(R.fading.length, 0, 'the fade list drains');
    out.changed.length = 0;
    CemReveal.advanceView(R, 16, out);
    TestRunner.assertEqual(out.changed.length, 0, 'and nothing changes after');
  });

  TestRunner.test('the distance curve lifts a viewed tile past the remembered level, and a tile already brighter is left alone', () => {
    var L = darkLevel(60);
    var R = CemReveal.create(L);
    var o = L.owl;
    var out = fresh();
    CemReveal.update(R, o.x, o.y, out);
    var here = CemModel.index(L, o.gx, o.gy);
    TestRunner.assertEqual(R.peak[here], 1, 'his own tile is at 1');
    CemReveal.enterView(R, here);
    for (var k = 0; k < 200; k++) CemReveal.advanceView(R, 16, out);
    TestRunner.assertEqual(R.peak[here], 1, 'the view fade never lowers it');
    var at = unlitAt(L, R, 7);
    CemReveal.enterView(R, at.idx);
    for (var j = 0; j < 200; j++) CemReveal.advanceView(R, 16, out);
    TestRunner.assert(Math.abs(R.peak[at.idx] - C.VIEW_PEAK) < 1e-6, 'a far tile rests at the remembered level');
    for (var m = 1; m <= 60; m++) CemReveal.update(R, o.x + at.dx * m * 0.1, o.y + at.dy * m * 0.1, out);
    TestRunner.assert(R.peak[at.idx] > C.VIEW_PEAK + 0.1, 'and walking up to it lifts it on: ' + R.peak[at.idx].toFixed(2));
  });

  TestRunner.test('reduced motion: a viewed tile is remembered at once', () => {
    var L = darkLevel(61);
    var R = CemReveal.create(L, { instant: true });
    var at = unlitAt(L, R, 7);
    var out = fresh();
    CemReveal.enterView(R, at.idx);
    CemReveal.advanceView(R, 16, out);
    TestRunner.assert(Math.abs(R.peak[at.idx] - C.VIEW_PEAK) < 1e-6, 'at the remembered level after one frame');
    TestRunner.assertEqual(R.fading.length, 0, 'nothing left fading');
  });

  TestRunner.test('approach eases toward a target by a rate, in either direction', () => {
    TestRunner.assertEqual(CemReveal.approach(0, 1, 2.5, 100), 0.25, 'a tenth of a second at 2.5 per second');
    TestRunner.assertEqual(CemReveal.approach(0.9, 1, 2.5, 100), 1, 'never overshoots');
    TestRunner.assertEqual(CemReveal.approach(1, 0, 2.5, 100), 0.75, 'and eases down too');
    TestRunner.assertEqual(CemReveal.approach(0.1, 0, 2.5, 100), 0, 'to exactly the target');
  });
});
