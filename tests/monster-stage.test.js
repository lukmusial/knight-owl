/**
 * MonsterStage tests: the pure layout helpers of the encounter card
 */

TestRunner.suite('MonsterStage', () => {
  const meta = { pivot: { x: 0.5, y: 0.9 }, figureHeight: 120, frameW: 100, frameH: 140 };
  const CARD = 4 / 3;

  function feetOf(box, pivotY) {
    return box.ay + box.ah * pivotY;
  }

  TestRunner.test('the figure stands on the ground line, centred', () => {
    const box = MonsterStage.stand('zombie', meta, CARD);
    TestRunner.assert(Math.abs(feetOf(box, meta.pivot.y) - MonsterStage.GROUND * 100) < 0.01, 'feet on the ground line');
    TestRunner.assert(Math.abs(box.ax + box.aw / 2 - 50) < 0.01, 'centred in the frame');
  });

  TestRunner.test('a species scale grows or shrinks the figure about its feet', () => {
    const plain = MonsterStage.stand('zombie', meta, CARD);
    const spider = MonsterStage.stand('spider', meta, CARD);
    const reaper = MonsterStage.stand('grim_reaper', meta, CARD);
    TestRunner.assert(spider.ah < plain.ah, 'the spider is smaller than an ordinary monster');
    TestRunner.assert(reaper.ah > plain.ah, 'the Reaper towers');
    [plain, spider, reaper].forEach(function(b) {
      TestRunner.assert(Math.abs(feetOf(b, meta.pivot.y) - MonsterStage.GROUND * 100) < 0.01, 'feet stay put');
    });
  });

  TestRunner.test('nothing sticks out of the picture', () => {
    ['zombie', 'spider', 'grim_reaper', 'dragon', 'troll'].forEach(function(id) {
      [MonsterStage.stand(id, meta, CARD), MonsterStage.stand(id, { aspect: 1.8 }, CARD)].forEach(function(b) {
        TestRunner.assert(b.ay >= -0.01, id + ' head inside the top edge');
        TestRunner.assert(b.ax >= -0.01, id + ' inside the left edge');
        TestRunner.assert(b.ax + b.aw <= 100.01, id + ' inside the right edge');
        TestRunner.assert(b.ay + b.ah <= 100.01, id + ' inside the bottom edge');
      });
    });
  });

  TestRunner.test('a wide cutout is fitted by its width, still on the ground', () => {
    const wide = MonsterStage.stand('dragon', { aspect: 2.4 }, CARD);
    TestRunner.assert(wide.aw <= 100.01, 'fits across the card');
    TestRunner.assert(wide.ay + wide.ah <= MonsterStage.GROUND * 100 + 0.01, 'never below the ground line');
  });

  TestRunner.test('each monster gets a backdrop that suits it', () => {
    TestRunner.assert(/^dungeon_hoard_\d\.jpg$/.test(MonsterStage.backdropFor('dragon', 'dungeon', 0)), 'the dragon sits on gold');
    TestRunner.assert(/^dungeon_throne_\d\.jpg$/.test(MonsterStage.backdropFor('dark_knight', 'dungeon', 0)), 'the dark knight in a throne hall');
    TestRunner.assert(MonsterStage.backdropFor('grim_reaper', 'cemetery', 0).indexOf('cemetery_') === 0, 'the Reaper in the cemetery');
    TestRunner.assert(MonsterStage.backdropFor('skeleton', 'cemetery', 0).indexOf('cemetery_') === 0, 'a cemetery skeleton outdoors');
    TestRunner.assert(MonsterStage.backdropFor('skeleton', 'dungeon', 0).indexOf('dungeon_') === 0, 'the same skeleton underground in the dungeon');
  });

  TestRunner.test('monsters with no scene of their own get one of the level rooms', () => {
    const pool = MonsterStage.THEME_SCENES.dungeon;
    for (let i = 0; i < pool.length; i++) {
      const name = MonsterStage.backdropFor('no_such_monster', 'dungeon', i / pool.length);
      TestRunner.assert(pool.indexOf(name.replace(/_\d+\.jpg$/, '')) !== -1, name + ' is a dungeon room');
      TestRunner.assert(/_[12]\.jpg$/.test(name), 'one of the painted variants');
    }
  });

  TestRunner.test('the theme follows the level', () => {
    MonsterStage.setTheme('cemetery');
    TestRunner.assert(MonsterStage.backdropFor('zombie').indexOf('cemetery_') === 0, 'cemetery cards use cemetery rooms');
    MonsterStage.setTheme('dungeon');
    TestRunner.assert(MonsterStage.backdropFor('zombie').indexOf('dungeon_') === 0, 'dungeon cards use dungeon rooms');
  });

  // Math.random pinned so a re-roll is visible: a cached room is the second
  // variant, a fresh roll with random 0 is the first
  function withRandom(value, fn) {
    const real = Math.random;
    Math.random = function() { return value; };
    try { fn(); } finally { Math.random = real; }
  }

  TestRunner.test('the room is rolled once per fight, not per question', () => {
    MonsterStage.setTheme('dungeon');
    MonsterStage.forgetBackdrop();
    TestRunner.assertEqual(MonsterStage.roomFor('giant_rat', 'dungeon', 0.99), 'dungeon_mine_2.jpg', 'the fight opens in a room');
    withRandom(0, () => {
      for (let i = 0; i < 5; i++) {
        TestRunner.assertEqual(MonsterStage.roomFor('giant_rat'), 'dungeon_mine_2.jpg', 'the same room for every question');
      }
      MonsterStage.forgetBackdrop('giant_rat');
      TestRunner.assertEqual(MonsterStage.roomFor('giant_rat'), 'dungeon_mine_1.jpg', 'the next fight rolls again');
    });
    MonsterStage.forgetBackdrop();
  });

  TestRunner.test('a room remembered in the dungeon does not follow the monster to the cemetery', () => {
    MonsterStage.forgetBackdrop();
    MonsterStage.roomFor('zombie', 'dungeon', 0);
    withRandom(0, () => {
      TestRunner.assert(/^cemetery_/.test(MonsterStage.roomFor('zombie', 'cemetery')), 'the cemetery zombie stands in the cemetery');
      TestRunner.assert(/^dungeon_/.test(MonsterStage.roomFor('zombie', 'dungeon')), 'and the dungeon one is still remembered');
    });
    MonsterStage.forgetBackdrop();
  });

  TestRunner.test('every room and every variant can come up', () => {
    const seen = {};
    for (let i = 0; i < 400; i++) seen[MonsterStage.backdropFor('no_such_monster', 'dungeon', i / 400)] = true;
    TestRunner.assertEqual(Object.keys(seen).length, MonsterStage.THEME_SCENES.dungeon.length * MonsterStage.BACKDROP_VARIANTS,
      'rooms x variants all reachable');
  });

  TestRunner.test('every room the cards can ask for is painted', () => {
    const fs = typeof require !== 'undefined' ? require('fs') : null;
    const path = typeof require !== 'undefined' ? require('path') : null;
    if (!fs) return;
    const dir = path.resolve(__dirname || '.', '..', 'www', MonsterStage.BACKDROP_DIR);
    const scenes = {};
    Object.keys(MonsterStage.THEME_SCENES).forEach(function(t) {
      MonsterStage.THEME_SCENES[t].forEach(function(sc) { scenes[sc] = true; });
      Object.keys(MonsterStage.SCENE_FOR[t] || {}).forEach(function(id) { scenes[MonsterStage.SCENE_FOR[t][id]] = true; });
    });
    Object.keys(scenes).forEach(function(sc) {
      for (let n = 1; n <= MonsterStage.BACKDROP_VARIANTS; n++) {
        TestRunner.assert(fs.existsSync(path.join(dir, sc + '_' + n + '.jpg')), sc + '_' + n + '.jpg exists');
      }
    });
  });

  TestRunner.test('card sheets carry the whole idle loop only for the facing the fight is played in', () => {
    const fs = typeof require !== 'undefined' ? require('fs') : null;
    const path = typeof require !== 'undefined' ? require('path') : null;
    if (!fs) return;
    const dir = path.resolve(__dirname || '.', '..', 'www', MonsterStage.ANIM_DIR);
    const index = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
    TestRunner.assert(index.monsters.length >= 30, 'a card sheet for nearly every monster');
    index.monsters.forEach(function(id) {
      const frames = JSON.parse(fs.readFileSync(path.join(dir, id + '.json'), 'utf8')).frames;
      TestRunner.assert(frames.down_idle_0 && frames.down_idle_5, id + ' idles facing the player');
      TestRunner.assert(frames.up_idle_0 && frames.right_idle_0, id + ' can turn round');
      TestRunner.assert(!frames.up_idle_1 && !frames.right_idle_1, id + ' carries no idle frames the card never shows');
      TestRunner.assert(frames.down_attack_0 && frames.down_hit_0 && frames.up_walk_0, id + ' attacks, flinches and leaves');
    });
  });

  TestRunner.test('a wide figure keeps clear of the sides', () => {
    const wide = MonsterStage.stand('dragon', { aspect: 2.4 }, CARD);
    TestRunner.assert(wide.ax >= MonsterStage.SIDE * 100 - 0.01, 'room on the left');
    TestRunner.assert(wide.ax + wide.aw <= 100 - MonsterStage.SIDE * 100 + 0.01, 'room on the right');
  });

  TestRunner.test('a frame hanging far below the feet is kept off the bottom edge', () => {
    const low = MonsterStage.stand('troll', { pivot: { x: 0.5, y: 0.5 }, figureHeight: 100, frameW: 100, frameH: 400 }, CARD);
    TestRunner.assert(low.ay + low.ah <= 100.01, 'the frame ends inside the picture');
    TestRunner.assert(Math.abs(low.ay + low.ah * 0.5 - MonsterStage.GROUND * 100) < 0.01, 'feet still on the ground line');
  });
});
