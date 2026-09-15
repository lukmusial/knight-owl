/**
 * ProtoSession + Music tests
 */

TestRunner.suite('ProtoSession', () => {
  TestRunner.test('view choice persists and rejects unknown views', () => {
    TestRunner.assertEqual(ProtoSession.setView('iso'), true, 'iso accepted');
    TestRunner.assertEqual(ProtoSession.getView(), 'iso', 'iso stored');
    TestRunner.assertEqual(ProtoSession.setView('bogus'), false, 'unknown rejected');
    TestRunner.assertEqual(ProtoSession.getView(), 'iso', 'unchanged after rejection');
    ProtoSession.setView('classic');
  });

  TestRunner.test('pages and launch URLs', () => {
    TestRunner.assertEqual(ProtoSession.pageFor('fp'), 'proto/first-person.html', 'fp page');
    TestRunner.assertEqual(ProtoSession.pageFor('nope'), 'index.html', 'fallback page');
    TestRunner.assertEqual(ProtoSession.launchUrl('iso', 'Zosia Ł', 'continue'),
      'proto/isometric.html?name=Zosia%20%C5%81&action=continue', 'encoded url');
    TestRunner.assertEqual(ProtoSession.launchUrl('classic', 'Bob', 'new', true),
      '../index.html?name=Bob&action=new', 'relative from proto');
  });

  TestRunner.test('parseParams reads name and action', () => {
    var p = ProtoSession.parseParams('?name=Zosia%20%C5%81&action=continue');
    TestRunner.assertEqual(p.name, 'Zosia Ł', 'decoded name');
    TestRunner.assertEqual(p.action, 'continue', 'action');
    var q = ProtoSession.parseParams('?name=Bob&action=whatever');
    TestRunner.assertEqual(q.action, 'new', 'unknown action becomes new');
    TestRunner.assertEqual(ProtoSession.parseParams('').name, '', 'empty query');
    TestRunner.assertEqual(ProtoSession.parseParams('?name=' + encodeURIComponent('x'.repeat(40))).name.length, 20, 'name capped');
  });

  TestRunner.test('startNew, autoSave and restore round-trip', () => {
    Questions.init();
    var fresh = ProtoSession.startNew('Tester');
    TestRunner.assertEqual(fresh.loaded, false, 'new run');
    TestRunner.assertEqual(Player.getName(), 'Tester', 'player created');
    var entrance = Dungeon.getEntranceId();
    var next = Dungeon.getConnectedRooms(entrance)[0].id;
    Player.moveTo(next);
    DungeonMap.exploreRoom(entrance);
    DungeonMap.exploreRoom(next);
    TestRunner.assertEqual(ProtoSession.autoSave(), true, 'saved');
    TestRunner.assert(Save.hasSave('Tester'), 'save exists');

    // Wipe in-memory state, then restore
    ProtoSession.startNew('Someone Else');
    var restored = ProtoSession.restore('Tester');
    TestRunner.assertTruthy(restored, 'restored');
    TestRunner.assertEqual(restored.loaded, true, 'loaded flag');
    TestRunner.assertEqual(Player.getName(), 'Tester', 'name restored');
    TestRunner.assertEqual(Player.getCurrentRoom(), next, 'room restored');
    TestRunner.assert(DungeonMap.isExplored(next), 'explored state restored');
    TestRunner.assertEqual(ProtoSession.restore('Nobody'), null, 'no save returns null');
    Save.deleteSave('Tester');
    Save.deleteSave('Someone Else');
  });
});

TestRunner.suite('Music Module', () => {
  TestRunner.test('is a no-op without a DOM', () => {
    Music.init();
    TestRunner.assertEqual(Music.play(), false, 'no Audio in node');
    Music.stop();
    Music.setMuted(true);
    TestRunner.assertEqual(Music.isMuted(), true, 'mute flag');
    TestRunner.assertEqual(Music.isPlaying(), false, 'not playing');
    Music.setMuted(false);
  });
});
