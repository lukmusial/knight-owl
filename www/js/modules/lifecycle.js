/**
 * AppLifecycle
 * Keeps the game idle while the app is in the background: stops speech,
 * suspends music and sound effects, and tells the pages to stop their render
 * loops; everything comes back when the app returns to the foreground.
 *
 * Background is detected from any of:
 * - document visibilitychange (browsers, iOS WKWebView)
 * - pagehide / pageshow (bfcache, iOS)
 * - 'app-pause' / 'app-resume' window events dispatched by the native Android
 *   activity (MainActivity.onPause/onResume), because the WebView keeps
 *   playing Web Audio when the activity goes to the background
 * Repeated signals are collapsed, so listeners see one pause per background trip.
 */

var AppLifecycle = (function() {
  var paused = false;
  var listeners = [];
  var attached = [];

  function notify(kind) {
    listeners.slice().forEach(function(l) {
      var fn = l[kind];
      if (typeof fn !== 'function') return;
      try { fn(); } catch (e) { console.error('AppLifecycle: ' + kind + ' listener failed:', e); }
    });
  }

  function pause() {
    if (paused) return false;
    paused = true;
    notify('pause');
    return true;
  }

  function resume() {
    if (!paused) return false;
    paused = false;
    notify('resume');
    return true;
  }

  function isPaused() {
    return paused;
  }

  /**
   * Register { pause: fn, resume: fn }; returns an unsubscribe function
   */
  function on(handlers) {
    var entry = handlers || {};
    listeners.push(entry);
    return function() {
      var i = listeners.indexOf(entry);
      if (i !== -1) listeners.splice(i, 1);
    };
  }

  /**
   * Listen for background/foreground signals on a document and window
   * (injectable for tests). Safe to call once per pair.
   */
  function attach(doc, win) {
    for (var i = 0; i < attached.length; i++) {
      if (attached[i].doc === doc && attached[i].win === win) return;
    }
    attached.push({ doc: doc, win: win });
    if (doc && typeof doc.addEventListener === 'function') {
      doc.addEventListener('visibilitychange', function() {
        if (doc.hidden) pause(); else resume();
      });
    }
    if (win && typeof win.addEventListener === 'function') {
      win.addEventListener('pagehide', pause);
      win.addEventListener('pageshow', function() {
        if (!doc || !doc.hidden) resume();
      });
      win.addEventListener('app-pause', pause);
      win.addEventListener('app-resume', resume);
    }
  }

  /**
   * Built-in reactions for the shared modules; pages add their render loops
   */
  function installDefaults() {
    on({
      pause: function() {
        if (typeof AudioAdapter !== 'undefined' && AudioAdapter.stopSpeaking) {
          try {
            var p = AudioAdapter.stopSpeaking();
            if (p && typeof p.catch === 'function') p.catch(function() {});
          } catch (e) { /* adapter not initialised */ }
        }
        if (typeof Music !== 'undefined' && Music.suspend) Music.suspend();
        if (typeof SFX !== 'undefined' && SFX.suspend) SFX.suspend();
      },
      resume: function() {
        if (typeof SFX !== 'undefined' && SFX.resumeFromBackground) SFX.resumeFromBackground();
        if (typeof Music !== 'undefined' && Music.resumeFromBackground) Music.resumeFromBackground();
      }
    });
  }

  /**
   * Test helper: forget listeners and attachments
   */
  function reset() {
    paused = false;
    listeners = [];
    attached = [];
  }

  installDefaults();
  if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    attach(document, window);
  }

  return {
    on: on,
    attach: attach,
    pause: pause,
    resume: resume,
    isPaused: isPaused,
    reset: reset,
    installDefaults: installDefaults
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppLifecycle;
}
