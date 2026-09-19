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

  /**
   * Same picture on a 2D canvas context: the HUD redraws this at most once a
   * second instead of reparsing an SVG string.
   */
  /**
   * The map's fit inside a canvas: map px are scaled by `scale` after
   * subtracting `left`/`top`, and the drawing is centred.
   */
  function fit(level, cw, ch) {
    var W = level.W, H = level.H;
    var left = px(0, H - 1).x - S - PAD;
    var top = px(0, 0).y - S - PAD;
    var width = (px(W - 1, 0).x + S + PAD) - left;
    var height = (px(W - 1, H - 1).y + S + PAD) - top;
    var scale = Math.min((cw || width) / width, (ch || height) / height);
    var ox = ((cw || width) - width * scale) / 2, oy = ((ch || height) - height * scale) / 2;
    return { scale: scale, left: left, top: top, ox: ox, oy: oy, width: width, height: height };
  }

  /** Grid coordinates (rounded) under a canvas pixel, given the fit draw() returned */
  function gridAt(t, x, y) {
    var mx = (x - t.ox) / t.scale + t.left;
    var my = (y - t.oy) / t.scale + t.top;
    var a = mx / S, b = 2 * my / S;      // a = gx - gy, b = gx + gy
    return { gx: Math.round((a + b) / 2), gy: Math.round((b - a) / 2) };
  }

  /**
   * @param {Object} opts - { showMonsters, markerScale (1 = HUD size) }
   * @returns {Object} the fit used, for gridAt
   */
  function draw(level, ctx, opts) {
    opts = opts || {};
    var W = level.W, H = level.H;
    var mk = opts.markerScale || 1;
    var t = fit(level, ctx.canvas.width, ctx.canvas.height);
    var left = t.left, top = t.top, scale = t.scale;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0b0f18';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.translate(t.ox, t.oy);
    ctx.scale(scale, scale);
    ctx.translate(-left, -top);

    function diamondPath(gx, gy) {
      var c = px(gx, gy);
      ctx.beginPath();
      ctx.moveTo(c.x, c.y - S / 2);
      ctx.lineTo(c.x + S, c.y);
      ctx.lineTo(c.x, c.y + S / 2);
      ctx.lineTo(c.x - S, c.y);
      ctx.closePath();
    }
    var tombsDrawn = {};
    var i, t;
    for (i = 0; i < level.tiles.length; i++) {
      if (!level.vis[i]) continue;
      t = level.tiles[i];
      if (t.tombId && t.kind !== 'tomb_door') continue;
      ctx.globalAlpha = level.vis[i] === 1 ? 0.55 : 1;
      var fill = '#1a2a22';
      switch (t.kind) {
        case 'path': case 'tomb_door': fill = t.plaza ? '#6b5540' : '#5a4634'; break;
        case 'gate': fill = '#c9a24a'; break;
        case 'fence': fill = '#2a2f3a'; break;
        case 'tree': fill = '#16261e'; break;
        case 'grave': fill = '#26303a'; break;
        case 'lantern': fill = '#1a2a22'; break;
      }
      ctx.fillStyle = fill;
      diamondPath(t.gx, t.gy);
      ctx.fill();
      if (t.kind === 'lantern') {
        var lp = px(t.gx, t.gy);
        ctx.fillStyle = '#ffd27a';
        ctx.beginPath();
        ctx.arc(lp.x, lp.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    for (var j = 0; j < level.tombs.length; j++) {
      var tomb = level.tombs[j];
      var seen = false;
      for (var yy = tomb.y0; yy < tomb.y0 + tomb.h && !seen; yy++) {
        for (var xx = tomb.x0; xx < tomb.x0 + tomb.w && !seen; xx++) {
          if (level.vis[yy * W + xx]) seen = true;
        }
      }
      if (!seen || tombsDrawn[tomb.id]) continue;
      tombsDrawn[tomb.id] = true;
      var isLarge = tomb.size === 'large';
      var unlocked = isLarge && level.keyParts.every(function(k) { return k; });
      var a = px(tomb.x0, tomb.y0), b = px(tomb.x0 + tomb.w, tomb.y0);
      var c2 = px(tomb.x0 + tomb.w, tomb.y0 + tomb.h), d = px(tomb.x0, tomb.y0 + tomb.h);
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y - S / 2);
      ctx.lineTo(b.x, b.y - S / 2);
      ctx.lineTo(c2.x, c2.y - S / 2);
      ctx.lineTo(d.x, d.y - S / 2);
      ctx.closePath();
      ctx.fillStyle = isLarge ? '#3b2d4f' : '#3a3f4c';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = unlocked ? '#ffd166' : (isLarge ? '#8a5cc7' : '#6b7280');
      ctx.stroke();
    }
    if (opts.showMonsters !== false) {
      ctx.fillStyle = '#e14b4b';
      for (var m = 0; m < level.monsters.length; m++) {
        var mon = level.monsters[m];
        if (mon.defeated || mon.role === 'boss') continue;
        if (level.vis[mon.gy * W + mon.gx] !== 2) continue;
        var mp = px(mon.gx, mon.gy);
        ctx.beginPath();
        ctx.arc(mp.x, mp.y, 2.6 * mk, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    var o = level.owl;
    var op = px(typeof o.x === 'number' ? o.x : o.gx, typeof o.y === 'number' ? o.y : o.gy);
    ctx.globalAlpha = 1;
    if (mk > 1) {
      // a halo so you find yourself at a glance on the big map
      ctx.fillStyle = 'rgba(0,188,212,0.25)';
      ctx.beginPath();
      ctx.arc(op.x, op.y, 3.4 * mk * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#00bcd4';
    ctx.strokeStyle = '#e0f7fa';
    ctx.lineWidth = 1 * mk;
    ctx.beginPath();
    ctx.arc(op.x, op.y, 3.4 * mk, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return t;
  }

  /** Cheap signature of everything the map shows, so it only redraws on change */
  function stateKey(level) {
    var mons = '';
    for (var i = 0; i < level.monsters.length; i++) {
      var m = level.monsters[i];
      if (m.defeated || m.role === 'boss') continue;
      if (level.vis[m.gy * level.W + m.gx] !== 2) continue;
      mons += m.gx + ',' + m.gy + ';';
    }
    return level.seenVersion + '|' + level.owl.gx + ',' + level.owl.gy + '|' + CemModelKeyParts(level) + '|' + mons;
  }

  function CemModelKeyParts(level) {
    var n = 0;
    for (var i = 0; i < level.keyParts.length; i++) if (level.keyParts[i]) n++;
    return n;
  }

  return { render: render, draw: draw, fit: fit, gridAt: gridAt, stateKey: stateKey, project: px };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CemMinimap;
}
