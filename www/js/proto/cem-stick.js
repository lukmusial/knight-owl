/**
 * CemStick
 * Round thumb-stick for the cemetery dock: drag the knob and Mr Owl walks
 * that way. Reports a screen-space vector (x right, y down) with a
 * magnitude of 0..1; the caller turns it into a grid direction.
 */

var CemStick = (function() {
  var DEFAULTS = { radius: 42, dead: 0.15 };

  /**
   * @param {HTMLElement} el - the stick base (a knob child is created if missing)
   * @param {Object} opts - { radius, dead, onChange(x, y) }
   * @returns {Object} { setEnabled, reset, destroy }
   */
  function mount(el, opts) {
    opts = opts || {};
    var radius = opts.radius || DEFAULTS.radius;
    var dead = opts.dead === undefined ? DEFAULTS.dead : opts.dead;
    var onChange = opts.onChange || function() {};
    if (!el) return { setEnabled: function() {}, reset: function() {}, destroy: function() {} };

    var knob = el.querySelector('.hud-stick-knob');
    if (!knob) {
      knob = document.createElement('div');
      knob.className = 'hud-stick-knob';
      el.appendChild(knob);
    }
    var enabled = true;
    var pointerId = null;
    var last = { x: 0, y: 0 };

    function moveKnob(dx, dy) {
      knob.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
    }

    function emit(x, y) {
      if (x === last.x && y === last.y) return;
      last.x = x; last.y = y;
      onChange(x, y);
    }

    function fromEvent(e) {
      var r = el.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2);
      var dy = e.clientY - (r.top + r.height / 2);
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d > radius) { dx = dx / d * radius; dy = dy / d * radius; d = radius; }
      moveKnob(dx, dy);
      var mag = d / radius;
      if (mag < dead) { emit(0, 0); return; }
      // rescale so the dead zone does not eat the low speeds
      var k = (mag - dead) / (1 - dead) / (d || 1);
      emit(dx * k, dy * k);
    }

    function release() {
      pointerId = null;
      moveKnob(0, 0);
      el.classList.remove('active');
      emit(0, 0);
    }

    function down(e) {
      if (!enabled || pointerId !== null) return;
      pointerId = e.pointerId;
      el.classList.add('active');
      if (el.setPointerCapture) { try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } }
      fromEvent(e);
      e.preventDefault();
    }
    function move(e) {
      if (pointerId !== e.pointerId) return;
      fromEvent(e);
      e.preventDefault();
    }
    function up(e) {
      if (pointerId !== e.pointerId) return;
      release();
      e.preventDefault();
    }

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('lostpointercapture', up);

    return {
      setEnabled: function(v) {
        enabled = !!v;
        el.classList.toggle('disabled', !enabled);
        if (!enabled) release();
      },
      reset: release,
      destroy: function() {
        el.removeEventListener('pointerdown', down);
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
        el.removeEventListener('lostpointercapture', up);
      }
    };
  }

  /**
   * Screen vector (x right, y down) to a grid direction for the isometric view.
   * Keeps the magnitude so a small push walks slowly.
   */
  function toGrid(x, y) {
    if (!x && !y) return { x: 0, y: 0 };
    var g = IsoModel.isoToGridExact(x, y);
    var len = Math.sqrt(g.gx * g.gx + g.gy * g.gy);
    if (!len) return { x: 0, y: 0 };
    var mag = Math.min(1, Math.sqrt(x * x + y * y));
    return { x: g.gx / len * mag, y: g.gy / len * mag };
  }

  return { mount: mount, toGrid: toGrid };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CemStick;
}
