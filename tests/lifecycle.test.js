/**
 * AppLifecycle tests
 */

TestRunner.suite('AppLifecycle', () => {
  function fakeTarget() {
    var handlers = {};
    return {
      hidden: false,
      addEventListener: function(type, fn) { (handlers[type] = handlers[type] || []).push(fn); },
      fire: function(type) { (handlers[type] || []).forEach(function(fn) { fn({ type: type }); }); }
    };
  }

  function setup() {
    AppLifecycle.reset();
    var doc = fakeTarget(), win = fakeTarget();
    AppLifecycle.attach(doc, win);
    var log = [];
    AppLifecycle.on({ pause: function() { log.push('pause'); }, resume: function() { log.push('resume'); } });
    return { doc: doc, win: win, log: log };
  }

  TestRunner.test('document hidden pauses and visible resumes, once each', () => {
    var t = setup();
    t.doc.hidden = true;
    t.doc.fire('visibilitychange');
    t.win.fire('pagehide');
    t.win.fire('app-pause');
    TestRunner.assertEqual(t.log.join(','), 'pause', 'repeated background signals collapse into one pause');
    TestRunner.assertEqual(AppLifecycle.isPaused(), true, 'paused');
    t.doc.hidden = false;
    t.doc.fire('visibilitychange');
    t.win.fire('app-resume');
    TestRunner.assertEqual(t.log.join(','), 'pause,resume', 'one resume');
    TestRunner.assertEqual(AppLifecycle.isPaused(), false, 'running again');
  });

  TestRunner.test('native Android app-pause/app-resume events drive the state', () => {
    var t = setup();
    t.win.fire('app-pause');
    TestRunner.assertEqual(AppLifecycle.isPaused(), true, 'app-pause pauses while the document still looks visible');
    t.win.fire('app-resume');
    TestRunner.assertEqual(t.log.join(','), 'pause,resume', 'app-resume resumes');
  });

  TestRunner.test('pageshow does not resume while the document is hidden', () => {
    var t = setup();
    t.doc.hidden = true;
    t.win.fire('pagehide');
    t.win.fire('pageshow');
    TestRunner.assertEqual(AppLifecycle.isPaused(), true, 'still paused');
  });

  TestRunner.test('unsubscribe and failing listeners do not break others', () => {
    var t = setup();
    var calls = 0;
    var off = AppLifecycle.on({ pause: function() { calls++; } });
    AppLifecycle.on({ pause: function() { throw new Error('boom'); } });
    var origError = console.error;
    console.error = function() {};
    try {
      AppLifecycle.pause();
      AppLifecycle.resume();
      off();
      AppLifecycle.pause();
    } finally {
      console.error = origError;
    }
    TestRunner.assertEqual(calls, 1, 'unsubscribed listener not called again');
    TestRunner.assertEqual(t.log.join(','), 'pause,resume,pause', 'other listener still notified');
  });

  TestRunner.test('defaults suspend and resume Music and SFX', () => {
    AppLifecycle.reset();
    AppLifecycle.installDefaults();
    AppLifecycle.pause();
    TestRunner.assertEqual(Music.isSuspended(), true, 'music suspended');
    TestRunner.assertEqual(SFX.isSuspended(), true, 'sfx suspended');
    TestRunner.assertEqual(SFX.play('tap'), false, 'no sound effects in the background');
    AppLifecycle.resume();
    TestRunner.assertEqual(Music.isSuspended(), false, 'music back');
    TestRunner.assertEqual(SFX.isSuspended(), false, 'sfx back');
    AppLifecycle.reset();
    AppLifecycle.installDefaults();
  });
});
