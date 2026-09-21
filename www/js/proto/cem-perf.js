/**
 * CemPerf
 * `?perf=1` corner readout for the cemetery: frame rate, how long the game
 * logic takes, how many sprites the camera actually draws, draw calls, and
 * how many ground chunks are live. Off unless the parameter is present.
 */

var CemPerf = (function() {
  function enabled() {
    return typeof location !== 'undefined' && /[?&]perf=1/.test(location.search);
  }

  /**
   * @param {Phaser.Scene} scene - the cemetery scene (needs scene.world)
   * @returns {Object|null} { frame, mark } or null when the overlay is off
   */
  function attach(scene) {
    if (!enabled()) return null;
    var text = scene.add.text(0, 0, '', {
      fontFamily: 'monospace', fontSize: '12px', color: '#9df5d0',
      backgroundColor: 'rgba(5,8,16,0.72)', padding: { x: 6, y: 4 }
    }).setScrollFactor(0).setDepth(1e7);

    var draws = 0;
    var renderer = scene.sys.game.renderer;
    if (renderer && renderer.pipelines && renderer.pipelines.get) {
      var pipe = renderer.pipelines.get('MultiPipeline');
      if (pipe && pipe.flush) {
        var origFlush = pipe.flush.bind(pipe);
        pipe.flush = function(postPipe) { draws++; return origFlush(postPipe); };
      }
    }

    var at = 0;
    var frames = 0;
    var drawSum = 0;
    var logicMs = 0;
    var logicSum = 0;
    var revealMs = 0;
    var revealSum = 0;
    var revealMax = 0;

    function countVisible() {
      var n = 0;
      var cam = scene.cameras.main;
      function walk(list) {
        for (var i = 0; i < list.length; i++) {
          var o = list[i];
          if (o.type === 'Layer') { walk(o.list); continue; }
          if (o.willRender && o.willRender(cam)) n++;
        }
      }
      walk(scene.children.list);
      return n;
    }

    return {
      /** Time spent in the game logic this frame */
      mark: function(ms) { logicMs = ms; },

      /** Time spent moving the night reveal this frame (CemeteryScene.updateReveal) */
      markReveal: function(ms) { revealMs = ms; },

      frame: function() {
        frames++;
        drawSum += draws;
        logicSum += logicMs;
        revealSum += revealMs;
        if (revealMs > revealMax) revealMax = revealMs;
        draws = 0;
        var now = scene.time.now;
        if (now < at) return;
        at = now + 500;
        var st = scene.world ? scene.world.stats() : {};
        var fps = Math.round(scene.sys.game.loop.actualFps);
        text.setText([
          'fps ' + fps + '   logic ' + (logicSum / Math.max(1, frames)).toFixed(2) + ' ms',
          'reveal ' + (revealSum / Math.max(1, frames)).toFixed(2) + ' ms (max ' + revealMax.toFixed(2) + ')',
          'draws ' + Math.round(drawSum / Math.max(1, frames)) + '   sprites ' + countVisible(),
          'chunks ' + st.chunks + '/' + st.pool + ' (' + st.bakes + ' bakes)',
          'cells ' + st.visibleCells + '/' + st.cells + '   bands ' + st.bands,
          'grid ' + scene.level.W + 'x' + scene.level.H + '   gen ' + (scene.level.genMs || '?') + ' ms'
        ].join('\n'));
        var view = scene.cameras.main.worldView;
        text.setPosition(8, 8);
        frames = 0; drawSum = 0; logicSum = 0; revealSum = 0; revealMax = 0;
        void view;
      }
    };
  }

  return { attach: attach, enabled: enabled };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CemPerf;
}
