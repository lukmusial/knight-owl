/**
 * CemMinimap
 * Small isometric map of the cemetery for the prototype HUD (pure, returns an
 * SVG string): remembered lanes and grass, tombs, lanterns, the gate, visible
 * monsters and Mr Owl. Same CSS hooks as DungeonMap.renderSVG.
 */

var CemMinimap = (function() {
  var S = 7;          // half tile width in map pixels
  var PAD = 8;

  function px(gx, gy) {
    return { x: (gx - gy) * S, y: (gx + gy) * S / 2 };
  }

  function diamond(gx, gy, fill, extra) {
    var c = px(gx, gy);
    return '<polygon points="' +
      c.x + ',' + (c.y - S / 2) + ' ' + (c.x + S) + ',' + c.y + ' ' + c.x + ',' + (c.y + S / 2) + ' ' + (c.x - S) + ',' + c.y +
      '" fill="' + fill + '"' + (extra || '') + '/>';
  }

  /**
   * @param {Object} level - CemModel level
   * @param {Object} opts - { showMonsters: bool }
   * @returns {string} SVG markup
   */
  function render(level, opts) {
    opts = opts || {};
    var W = level.W, H = level.H;
    var left = px(0, H - 1).x - S - PAD;
    var right = px(W - 1, 0).x + S + PAD;
    var top = px(0, 0).y - S - PAD;
    var bottom = px(W - 1, H - 1).y + S + PAD;
    var width = right - left, height = bottom - top;
    var svg = '<svg viewBox="' + left + ' ' + top + ' ' + width + ' ' + height + '" class="dungeon-map-svg cem-map-svg">';
    svg += '<rect x="' + left + '" y="' + top + '" width="' + width + '" height="' + height + '" fill="#0b0f18"/>';
    svg += '<g class="cem-map-ground">';
    var tombsDrawn = {};
    var tombsSvg = '';
    var propsSvg = '';
    for (var i = 0; i < level.tiles.length; i++) {
      var v = level.vis[i];
      if (!v) continue;
      var t = level.tiles[i];
      var dim = v === 1 ? ' opacity="0.55"' : '';
      if (t.tombId && t.kind !== 'tomb_door') {
        if (!tombsDrawn[t.tombId]) {
          tombsDrawn[t.tombId] = true;
          var tomb = null;
          for (var j = 0; j < level.tombs.length; j++) if (level.tombs[j].id === t.tombId) tomb = level.tombs[j];
          if (tomb) {
            var a = px(tomb.x0, tomb.y0), b = px(tomb.x0 + tomb.w, tomb.y0), c = px(tomb.x0 + tomb.w, tomb.y0 + tomb.h), d = px(tomb.x0, tomb.y0 + tomb.h);
            var isLarge = tomb.size === 'large';
            var unlocked = isLarge && level.keyParts.every(function(k) { return k; });
            tombsSvg += '<polygon class="cem-map-tomb' + (isLarge ? ' large' : '') + '" points="' +
              (a.x) + ',' + (a.y - S / 2) + ' ' + (b.x) + ',' + (b.y - S / 2) + ' ' + (c.x) + ',' + (c.y - S / 2) + ' ' + (d.x) + ',' + (d.y - S / 2) +
              '" fill="' + (isLarge ? '#3b2d4f' : '#3a3f4c') + '" stroke="' + (unlocked ? '#ffd166' : (isLarge ? '#8a5cc7' : '#6b7280')) + '" stroke-width="1.5"' + dim + '/>';
          }
        }
        continue;
      }
      switch (t.kind) {
        case 'path':
        case 'tomb_door':
          svg += diamond(t.gx, t.gy, t.plaza ? '#6b5540' : '#5a4634', dim);
          break;
        case 'gate':
          svg += diamond(t.gx, t.gy, '#c9a24a', dim);
          break;
        case 'fence':
          svg += diamond(t.gx, t.gy, '#2a2f3a', dim);
          break;
        case 'lantern':
          svg += diamond(t.gx, t.gy, '#1a2a22', dim);
          var lp = px(t.gx, t.gy);
          propsSvg += '<circle class="cem-map-lantern" cx="' + lp.x + '" cy="' + lp.y + '" r="2.2" fill="#ffd27a"' + dim + '/>';
          break;
        case 'tree':
          svg += diamond(t.gx, t.gy, '#16261e', dim);
          break;
        case 'grave':
          svg += diamond(t.gx, t.gy, '#26303a', dim);
          break;
        default:
          svg += diamond(t.gx, t.gy, '#1a2a22', dim);
      }
    }
    svg += '</g>';
    svg += '<g class="cem-map-crypts">' + tombsSvg + '</g>';
    svg += '<g class="cem-map-props">' + propsSvg + '</g>';
    if (opts.showMonsters !== false) {
      svg += '<g class="cem-map-monsters">';
      for (var m = 0; m < level.monsters.length; m++) {
        var mon = level.monsters[m];
        if (mon.defeated || mon.role === 'boss') continue;
        if (level.vis[mon.gy * W + mon.gx] !== 2) continue;
        var mp = px(mon.gx, mon.gy);
        svg += '<circle class="cem-map-monster" cx="' + mp.x + '" cy="' + mp.y + '" r="2.6" fill="#e14b4b"/>';
      }
      svg += '</g>';
    }
    var op = px(level.owl.gx, level.owl.gy);
    svg += '<circle class="map-node current-room cem-map-owl" cx="' + op.x + '" cy="' + op.y + '" r="3.4" fill="#00bcd4" stroke="#e0f7fa" stroke-width="1"/>';
    svg += '</svg>';
    return svg;
  }

  return { render: render, project: px };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CemMinimap;
}
