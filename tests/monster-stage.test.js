/**
 * MonsterStage tests: the pure layout helpers of the encounter card
 */

TestRunner.suite('MonsterStage', () => {
  const entry = { bbox: [300, 100, 500, 500], w: 200, h: 400 };   // character painted at x 300..500, y 100..500
  const meta = { pivot: { x: 0.5, y: 0.9 }, figureHeight: 120, frameW: 100, frameH: 140 };

  TestRunner.test('layout puts the sheet feet on the painted feet', () => {
    const box = MonsterStage.layout(entry, 800, 600, meta);
    const feet = (box.ay + box.ah * meta.pivot.y) / 100 * 600;
    TestRunner.assert(Math.abs(feet - 500) < 0.01, 'feet at the bottom of the painted character');
    TestRunner.assert(Math.abs((box.ax + box.aw / 2) / 100 * 800 - 400) < 0.01, 'centred on it');
  });

  TestRunner.test('a species scale grows or shrinks the figure about its feet', () => {
    const one = MonsterStage.layout(entry, 800, 600, meta, 1);
    const half = MonsterStage.layout(entry, 800, 600, meta, 0.5);
    const big = MonsterStage.layout(entry, 800, 600, meta, 1.4);
    TestRunner.assert(Math.abs(half.ah - one.ah / 2) < 1e-9, 'half as tall');
    TestRunner.assert(Math.abs(big.ah - one.ah * 1.4) < 1e-9, 'bigger');
    [one, half, big].forEach(function(b) {
      const feet = (b.ay + b.ah * meta.pivot.y) / 100 * 600;
      TestRunner.assert(Math.abs(feet - 500) < 0.01, 'feet stay put');
    });
    const cut = MonsterStage.layout(entry, 800, 600, null, 0.5);
    TestRunner.assert(Math.abs((cut.ay + cut.ah) / 100 * 600 - 500) < 0.01, 'a cutout scales about its bottom too');
    TestRunner.assert(Math.abs(cut.ah / 100 * 600 - 200) < 0.01, 'to half its painted height');
  });

  TestRunner.test('the spider is small on the card and the Reaper towers', () => {
    TestRunner.assert(MonsterStage.cardScale('spider') < 0.5, 'spider well under half');
    TestRunner.assert(MonsterStage.cardScale('grim_reaper') > 1.2, 'reaper over the painting size');
    TestRunner.assertEqual(MonsterStage.cardScale('zombie'), 1, 'others as painted');
  });
});
