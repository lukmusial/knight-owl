/**
 * FpQuality
 * Rendering quality tiers for the first-person prototype and a frame-time
 * monitor that steps the tier down when the device cannot keep up.
 * Pure logic (no DOM, no three.js): the renderer passes in the environment.
 *
 *   low    - no shadows, 2 torch lights, 1 lava light, no head light, no normal maps, 1x pixel ratio
 *   medium - 4 torch lights (2 casting shadows, 256px cube faces), 1 lava light, <=1.5x
 *   high   - 6 torch lights (4 casting shadows, 512px cube faces), 2 lava lights, <=2x
 *
 * Override with ?quality=low|medium|high (disables auto-downgrade).
 */

var FpQuality = (function() {
  var TIERS = ['low', 'medium', 'high'];

  var SETTINGS = {
    low: { tier: 'low', maxDpr: 1, lights: 2, lavaLights: 1, headLight: false, shadowLights: 0, shadowMapSize: 0, normalMaps: false, props: true, step: 0.9, wallRows: 4, vaultRows: 4 },
    medium: { tier: 'medium', maxDpr: 1.5, lights: 4, lavaLights: 1, headLight: true, shadowLights: 2, shadowMapSize: 256, normalMaps: true, props: true, step: 0.6, wallRows: 6, vaultRows: 6 },
    high: { tier: 'high', maxDpr: 2, lights: 6, lavaLights: 2, headLight: true, shadowLights: 4, shadowMapSize: 512, normalMaps: true, props: true, step: 0.45, wallRows: 7, vaultRows: 7 }
  };

  function isTier(t) { return TIERS.indexOf(t) !== -1; }

  /**
   * Pick a tier for an environment
   * @param {Object} env - { override, stored, width, height, dpr, cores, memory, touch }
   * @returns {string} tier name
   */
  function pick(env) {
    env = env || {};
    if (isTier(env.override)) return env.override;
    if (isTier(env.stored)) return env.stored;
    var shortSide = Math.min(env.width || 0, env.height || 0);
    var phoneLike = !!env.touch && shortSide > 0 && shortSide < 700;
    var weak = (typeof env.cores === 'number' && env.cores > 0 && env.cores <= 4) ||
      (typeof env.memory === 'number' && env.memory > 0 && env.memory <= 3);
    if (phoneLike) return weak ? 'low' : 'medium';
    if (env.touch) return weak ? 'low' : 'medium';
    return weak ? 'medium' : 'high';
  }

  function settings(tier) {
    var s = SETTINGS[isTier(tier) ? tier : 'medium'];
    var copy = {};
    Object.keys(s).forEach(function(k) { copy[k] = s[k]; });
    return copy;
  }

  /** Next lower tier, or null at the bottom */
  function lower(tier) {
    var i = TIERS.indexOf(tier);
    return i > 0 ? TIERS[i - 1] : null;
  }

  /**
   * Frame-time monitor: feed frame durations while the scene animates;
   * returns true once the average over `windowMs` exceeds `slowMs`.
   * Frames longer than `ignoreMs` (tab switches, shader compiles, shadow
   * map refreshes) are skipped.
   */
  function createMonitor(opts) {
    opts = opts || {};
    var windowMs = opts.windowMs || 3000;
    var slowMs = opts.slowMs || 42;
    var ignoreMs = opts.ignoreMs || 250;
    var total = 0, frames = 0;
    return {
      sample: function(dtMs) {
        if (!(dtMs > 0) || dtMs > ignoreMs) return false;
        total += dtMs;
        frames++;
        if (total < windowMs) return false;
        var avg = total / frames;
        total = 0;
        frames = 0;
        return avg > slowMs;
      },
      reset: function() { total = 0; frames = 0; }
    };
  }

  return {
    TIERS: TIERS,
    pick: pick,
    settings: settings,
    lower: lower,
    createMonitor: createMonitor
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FpQuality;
}
