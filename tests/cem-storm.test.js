/**
 * CemStorm tests (thunderstorm scheduling, strike target, bolt shape, timing curves)
 */

TestRunner.suite('CemStorm', () => {
  var D = CemStorm.DEFAULTS;

  function litLevel(seed) {
    var L = CemModel.generate(seed || 11);
    CemModel.updateVisibility(L);
    return L;
  }

  function dist(a, b) { return Math.sqrt((a.gx - b.gx) * (a.gx - b.gx) + (a.gy - b.gy) * (a.gy - b.gy)); }

  TestRunner.test('the first strike comes after firstDelayMs, the rest 25-60 s apart, skipped ones retry soon', () => {
    var storm = CemStorm.create({ rng: CemModel.makeRng(5) });
    TestRunner.assertEqual(storm.next(), D.firstDelayMs, 'first strike waits the short delay');
    var lo = Infinity, hi = -Infinity;
    for (var i = 0; i < 200; i++) {
      var ms = storm.next();
      lo = Math.min(lo, ms); hi = Math.max(hi, ms);
      TestRunner.assert(ms >= D.minGapMs && ms <= D.maxGapMs, 'gap in range: ' + ms);
    }
    TestRunner.assert(hi - lo > (D.maxGapMs - D.minGapMs) * 0.5, 'gaps spread over the range');
    TestRunner.assertEqual(storm.retry(), D.retryMs, 'retry delay');
    TestRunner.assertEqual(storm.count, 201, 'counts the strikes it scheduled');
  });

  TestRunner.test('the schedule is deterministic for a seed and takes overrides', () => {
    var a = CemStorm.create({ rng: CemModel.makeRng(9) }), b = CemStorm.create({ rng: CemModel.makeRng(9) });
    for (var i = 0; i < 20; i++) TestRunner.assertEqual(a.next(), b.next(), 'same gaps');
    var c = CemStorm.create({ rng: CemModel.makeRng(9), firstDelayMs: 100, minGapMs: 200, maxGapMs: 200 });
    TestRunner.assertEqual(c.next(), 100, 'override first delay');
    TestRunner.assertEqual(c.next(), 200, 'override gap');
    TestRunner.assertEqual(c.cfg.totalMinMs, D.totalMinMs, 'untouched settings keep their defaults');
    TestRunner.assertEqual(CemStorm.config().flashPeak, D.flashPeak, 'config with nothing is the defaults');
  });

  TestRunner.test('picks a lit tile at least two tiles from Mr Owl', () => {
    var L = litLevel(11);
    var rng = CemModel.makeRng(3);
    var owl = CemModel.owlPos(L);
    var seen = {};
    for (var i = 0; i < 300; i++) {
      var t = CemStorm.pickTarget(L, rng);
      TestRunner.assertTruthy(t, 'a target in sight');
      TestRunner.assertEqual(L.vis[CemModel.index(L, t.gx, t.gy)], 2, 'the tile is lit');
      var d = Math.sqrt((t.gx - owl.x) * (t.gx - owl.x) + (t.gy - owl.y) * (t.gy - owl.y));
      TestRunner.assert(d >= D.minDist, 'at least minDist away: ' + d);
      TestRunner.assert(d <= D.maxDist, 'no farther than maxDist, so it is on screen: ' + d);
      TestRunner.assert(Math.abs(t.dist - d) < 1e-9, 'reports its distance');
      seen[t.gx + ',' + t.gy] = true;
    }
    TestRunner.assert(Object.keys(seen).length > 5, 'spreads over the lit tiles, not one spot');
  });

  TestRunner.test('finds nothing when no lit tile is far enough, and never the owl tile', () => {
    var L = litLevel(12);
    var owl = CemModel.owlPos(L);
    for (var i = 0; i < L.vis.length; i++) L.vis[i] = 0;
    TestRunner.assertEqual(CemStorm.pickTarget(L, CemModel.makeRng(1)), null, 'nothing lit');
    L.vis[CemModel.index(L, owl.gx, owl.gy)] = 2;
    TestRunner.assertEqual(CemStorm.pickTarget(L, CemModel.makeRng(1)), null, 'only the owl tile lit');
    var far = CemModel.index(L, owl.gx + 3, owl.gy);
    L.vis[far] = 1;
    TestRunner.assertEqual(CemStorm.pickTarget(L, CemModel.makeRng(1)), null, 'remembered tiles do not count');
    L.vis[far] = 2;
    var t = CemStorm.pickTarget(L, CemModel.makeRng(1));
    TestRunner.assert(t && t.gx === owl.gx + 3 && t.gy === owl.gy, 'the one lit tile far enough');
    TestRunner.assert(Math.abs(t.dist - 3) < 1e-9, 'three tiles away');
    // a lantern lights tiles across the grounds: those out of his sight are not struck
    L.vis[far] = 0;
    L.vis[CemModel.index(L, owl.gx + D.maxDist + 2, owl.gy)] = 2;
    TestRunner.assertEqual(CemStorm.pickTarget(L, CemModel.makeRng(1)), null, 'a lit tile beyond maxDist is out of range');
  });

  TestRunner.test('the bolt starts above the view and ends exactly on the tile', () => {
    var rng = CemModel.makeRng(21);
    var target = { x: 500, y: 900 };
    var from = CemStorm.origin(rng, target, 300, 120);
    TestRunner.assert(from.y < 300, 'starts above the top of the view');
    TestRunner.assert(Math.abs(from.x - target.x) <= 0.35 * (target.y - from.y) / 2 + 1e-9, 'leans but does not come in sideways');
    var b = CemStorm.bolt(rng, from, target);
    var m = b.main;
    TestRunner.assertEqual(m.length, Math.pow(2, D.boltDetail) + 1, 'one point per segment end');
    TestRunner.assert(m[0].x === from.x && m[0].y === from.y, 'starts at the origin');
    var last = m[m.length - 1];
    TestRunner.assert(last.x === target.x && last.y === target.y, 'ends on the tile');
  });

  TestRunner.test('the bolt is jagged but stays in a corridor and comes down', () => {
    var rng = CemModel.makeRng(22);
    var from = { x: 400, y: -200 }, to = { x: 520, y: 700 };
    var b = CemStorm.bolt(rng, from, to);
    var m = b.main;
    var dx = to.x - from.x, dy = to.y - from.y, len = Math.sqrt(dx * dx + dy * dy);
    var nx = -dy / len, ny = dx / len;
    var maxOff = 0, turns = 0;
    for (var i = 0; i < m.length; i++) {
      var off = Math.abs((m[i].x - from.x) * nx + (m[i].y - from.y) * ny);
      maxOff = Math.max(maxOff, off);
      if (i > 0) TestRunner.assert(m[i].y > m[i - 1].y, 'every point lower than the last (' + i + ')');
      if (i > 1) {
        var d1 = m[i - 1].x - m[i - 2].x, d2 = m[i].x - m[i - 1].x;
        if (d1 * d2 < 0) turns++;
      }
    }
    TestRunner.assert(maxOff > len * 0.02, 'not a straight line: ' + maxOff);
    TestRunner.assert(maxOff <= len * 0.25, 'stays near the chord: ' + maxOff);
    TestRunner.assert(turns >= 6, 'zigzags: ' + turns + ' turns');
  });

  TestRunner.test('the bolt grows two or three branches that fork off the main path and head down', () => {
    for (var seed = 1; seed <= 12; seed++) {
      var rng = CemModel.makeRng(seed);
      var from = { x: 300, y: -100 }, to = { x: 360, y: 800 };
      var b = CemStorm.bolt(rng, from, to);
      TestRunner.assert(b.branches.length >= D.branches[0] && b.branches.length <= D.branches[1], 'branch count ' + b.branches.length);
      b.branches.forEach(function(br, k) {
        var root = br[0];
        var onMain = b.main.some(function(p) { return p.x === root.x && p.y === root.y; });
        TestRunner.assert(onMain, 'branch ' + k + ' forks off a point of the main path');
        var tip = br[br.length - 1];
        TestRunner.assert(tip.y > root.y, 'branch ' + k + ' heads down');
        TestRunner.assert(br.length >= 5, 'branch ' + k + ' is jagged too');
        var bl = Math.sqrt((tip.x - root.x) * (tip.x - root.x) + (tip.y - root.y) * (tip.y - root.y));
        TestRunner.assert(bl < 900 * 0.4, 'branch ' + k + ' is shorter than the bolt');
      });
    }
  });

  TestRunner.test('the same seed draws the same bolt, another seed a different one', () => {
    var from = { x: 0, y: 0 }, to = { x: 50, y: 600 };
    var a = CemStorm.bolt(CemModel.makeRng(77), from, to), b = CemStorm.bolt(CemModel.makeRng(77), from, to);
    TestRunner.assertEqual(JSON.stringify(a), JSON.stringify(b), 'replayable');
    var c = CemStorm.bolt(CemModel.makeRng(78), from, to);
    TestRunner.assert(JSON.stringify(a) !== JSON.stringify(c), 'seed matters');
  });

  function sampled(fn, seq, step) {
    var vals = [];
    for (var t = 0; t < seq.endMs + 50; t += step || 2) vals.push(fn(seq, t));
    return vals;
  }
  function localMaxima(vals) {
    var n = 0;
    for (var i = 1; i < vals.length - 1; i++) if (vals[i] > vals[i - 1] && vals[i] >= vals[i + 1] && vals[i] > 0) n++;
    return n;
  }

  TestRunner.test('a strike is a leader, a main stroke and two to four weaker re-strikes, 0.8-1.5 s in all', () => {
    for (var seed = 1; seed <= 40; seed++) {
      var seq = CemStorm.sequence(CemModel.makeRng(seed));
      var st = seq.strokes;
      TestRunner.assertEqual(st[0].kind, 'leader', 'starts with the leader');
      TestRunner.assertEqual(st[0].at, 0, 'the leader starts the strike');
      TestRunner.assert(st[0].peak < 0.5, 'the leader is dim');
      TestRunner.assertEqual(st[1].kind, 'main', 'then the main stroke');
      TestRunner.assertEqual(st[1].at, st[0].ms, 'straight after the leader');
      TestRunner.assertEqual(st[1].peak, 1, 'the main stroke is full brightness');
      TestRunner.assertEqual(seq.mainAt, st[1].at, 'mainAt is the main stroke (thunder counts from it)');
      var re = st.slice(2);
      TestRunner.assert(re.length >= D.restrikes[0] && re.length <= D.restrikes[1], re.length + ' re-strikes');
      for (var i = 0; i < re.length; i++) {
        TestRunner.assertEqual(re[i].kind, 'restrike', 'a re-strike');
        var prevEnd = st[i + 1].at + st[i + 1].ms;
        TestRunner.assert(re[i].at >= prevEnd, 're-strike ' + i + ' waits for a dark gap');
        TestRunner.assert(re[i].peak < 1, 'weaker than the main stroke');
        if (i) TestRunner.assert(re[i].peak < re[i - 1].peak, 'and weaker than the one before');
        TestRunner.assert(re[i].ms > 20, 'long enough to see: ' + re[i].ms);
      }
      TestRunner.assert(seq.totalMs >= D.totalMinMs && seq.totalMs <= D.totalMaxMs, 'total ' + seq.totalMs + ' ms in range');
      TestRunner.assert(seq.endMs - seq.totalMs === D.glowLingerMs, 'the glow lingers after the last stroke');
      TestRunner.assert(seq.noise.length * D.noiseStepMs >= seq.endMs, 'noise covers the whole strike');
    }
  });

  TestRunner.test('the sequence is deterministic for a seed and takes overrides', () => {
    var a = CemStorm.sequence(CemModel.makeRng(8)), b = CemStorm.sequence(CemModel.makeRng(8));
    TestRunner.assertEqual(JSON.stringify(a), JSON.stringify(b), 'replayable');
    var c = CemStorm.sequence(CemModel.makeRng(9));
    TestRunner.assert(JSON.stringify(a) !== JSON.stringify(c), 'seed matters');
    var cfg = CemStorm.config({ totalMinMs: 1000, totalMaxMs: 1000, restrikes: [3, 3] });
    var d = CemStorm.sequence(CemModel.makeRng(8), cfg);
    TestRunner.assertEqual(d.totalMs, 1000, 'override total');
    TestRunner.assertEqual(d.strokes.length, 5, 'override re-strike count');
  });

  TestRunner.test('the core flutters: never negative, never over one, many local maxima, no smooth fade', () => {
    for (var seed = 1; seed <= 20; seed++) {
      var seq = CemStorm.sequence(CemModel.makeRng(seed));
      var core = sampled(CemStorm.coreAlpha, seq);
      core.forEach(function(v) { TestRunner.assert(v >= 0 && v <= 1, 'core in [0,1]: ' + v); });
      TestRunner.assertEqual(CemStorm.coreAlpha(seq, -1), 0, 'nothing before the strike');
      TestRunner.assertEqual(CemStorm.coreAlpha(seq, seq.totalMs), 0, 'gone at totalMs');
      TestRunner.assert(localMaxima(core) >= 8, 'flutters: ' + localMaxima(core) + ' local maxima');
      // the main stroke's plateau is not flat: it jitters between the floor and full
      var main = seq.strokes[1];
      var hi = 0, lo = 1, fhi = 0, flo = 1;
      for (var t = main.at; t < main.at + main.ms; t += 2) {
        var f = CemStorm.flutter(seq, t); fhi = Math.max(fhi, f); flo = Math.min(flo, f);
        if (t < main.at + main.ms * 0.3) { var v = CemStorm.coreAlpha(seq, t); hi = Math.max(hi, v); lo = Math.min(lo, v); }
      }
      TestRunner.assert(fhi - flo > 0.15, 'the main stroke flutters (' + flo.toFixed(2) + '..' + fhi.toFixed(2) + ')');
      TestRunner.assert(hi > 0.95, 'and opens at full: ' + hi);
      TestRunner.assert(lo >= D.flutterFloor - 1e-9 && flo >= D.flutterFloor - 1e-9, 'never below the flutter floor');
      // the leader is dimmer than the main stroke, and each re-strike is weaker
      var peakOf = function(s) { var m = 0; for (var t = s.at; t < s.at + s.ms; t += 2) m = Math.max(m, CemStorm.coreAlpha(seq, t)); return m; };
      TestRunner.assert(peakOf(seq.strokes[0]) < peakOf(main), 'leader dimmer than the main stroke');
      var last = seq.strokes[seq.strokes.length - 1], first = seq.strokes[2];
      TestRunner.assert(peakOf(last) < peakOf(first), 'the last re-strike is the weakest');
      // dark gaps between strokes
      var gapT = seq.strokes[2].at - 1;
      TestRunner.assertEqual(CemStorm.coreAlpha(seq, gapT), 0, 'dark just before the first re-strike');
    }
  });

  TestRunner.test('the glow follows the core, lingers after it and is gone at endMs', () => {
    var seq = CemStorm.sequence(CemModel.makeRng(4));
    for (var t = 0; t < seq.endMs; t += 3) {
      var c = CemStorm.coreAlpha(seq, t), g = CemStorm.glowAlpha(seq, t);
      TestRunner.assert(g >= 0 && g <= 1, 'glow in [0,1]');
      if (c > 0) TestRunner.assert(g > 0, 'glow wherever the core is lit');
    }
    var afterCore = seq.totalMs + 20;
    TestRunner.assertEqual(CemStorm.coreAlpha(seq, afterCore), 0, 'core gone after the last stroke');
    TestRunner.assert(CemStorm.glowAlpha(seq, afterCore) > 0, 'the glow lingers');
    TestRunner.assert(CemStorm.glowAlpha(seq, afterCore) < 0.5, 'but faintly');
    TestRunner.assertEqual(CemStorm.glowAlpha(seq, seq.endMs), 0, 'and is gone at endMs');
    TestRunner.assertEqual(CemStorm.glowAlpha(seq, -1), 0, 'nothing before');
  });

  TestRunner.test('the view flash is the same flutter scaled to flashPeak, and brightest finds the main stroke', () => {
    var seq = CemStorm.sequence(CemModel.makeRng(6));
    var peak = 0;
    for (var t = 0; t < seq.endMs; t += 2) {
      var f = CemStorm.flashAlpha(seq, t), c = CemStorm.coreAlpha(seq, t);
      TestRunner.assert(Math.abs(f - D.flashPeak * c) < 1e-12, 'flash = flashPeak * core');
      peak = Math.max(peak, f);
    }
    TestRunner.assert(peak <= D.flashPeak && peak > D.flashPeak * 0.8, 'peaks near flashPeak: ' + peak);
    TestRunner.assert(D.flashPeak >= 0.4 && D.flashPeak <= 0.5, 'a flash of 0.4-0.5, not a grey wash');
    var b = CemStorm.brightest(seq);
    var main = seq.strokes[1];
    TestRunner.assert(b.t >= main.at && b.t < main.at + main.ms, 'the brightest moment is in the main stroke: ' + b.t);
    TestRunner.assert(b.alpha > 0.8, 'and nearly full: ' + b.alpha);
  });

  TestRunner.test('thunder trails a far strike longer and sounds quieter', () => {
    TestRunner.assertEqual(CemStorm.thunderDelay(D.minDist), D.thunderMinMs, 'nearest: shortest lag');
    TestRunner.assertEqual(CemStorm.thunderDelay(D.maxDist), D.thunderMaxMs, 'farthest: longest lag');
    TestRunner.assertEqual(CemStorm.thunderDelay(0), D.thunderMinMs, 'clamped below');
    TestRunner.assertEqual(CemStorm.thunderDelay(50), D.thunderMaxMs, 'clamped above');
    var mid = CemStorm.thunderDelay((D.minDist + D.maxDist) / 2);
    TestRunner.assert(mid > D.thunderMinMs && mid < D.thunderMaxMs, 'in between: ' + mid);
    TestRunner.assert(CemStorm.thunderDelay(3) < CemStorm.thunderDelay(5), 'monotone');
    TestRunner.assertEqual(CemStorm.thunderVolume(D.minDist), 1, 'full volume close by');
    TestRunner.assert(CemStorm.thunderVolume(D.maxDist) < 0.7 && CemStorm.thunderVolume(D.maxDist) > 0.5, 'quieter far off');
  });

  TestRunner.test('litTiles is the disc of tiles around the strike, clipped to the level', () => {
    var L = litLevel(13);
    var tiles = CemStorm.litTiles(L, { gx: 10, gy: 10 }, 3);
    TestRunner.assertEqual(tiles.length, 29, 'a radius-3 disc holds 29 tiles');
    tiles.forEach(function(i) {
      var gx = i % L.W, gy = Math.floor(i / L.W);
      TestRunner.assert(dist({ gx: gx, gy: gy }, { gx: 10, gy: 10 }) <= 3, 'inside the disc');
    });
    var corner = CemStorm.litTiles(L, { gx: 0, gy: 0 }, 3);
    TestRunner.assert(corner.length < 29 && corner.length > 0, 'clipped at the corner: ' + corner.length);
    corner.forEach(function(i) { TestRunner.assert(i >= 0 && i < L.tiles.length, 'valid index'); });
  });
});
