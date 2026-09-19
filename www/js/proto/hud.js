/**
 * ProtoHud
 * Shared 1990s-style heads-up display for the prototype pages: stone-framed
 * top bar (portrait, stat icons, sound/map toggles), framed minimap, parchment
 * room ribbon and a bottom control dock. Also swaps the modal monster images
 * to the extracted sprites (assets/proto/monsters/<id>.png) when available.
 *
 * Usage (after ProtoSharedDom.inject):
 *   ProtoHud.mount({ root: document.body, controlsHtml: '<div class="hud-dpad">...</div>',
 *                    note: { en: '...', pl: '...' }, compass: true,
 *                    extraDockHtml: '<button class="hud-btn" id="new-game">⟳</button>' });
 *   ProtoHud.updateStats({ monstersDefeated, questionsCorrect, questionsTotal, totalLoot });
 *   ProtoHud.setRoom(room);           // bilingual ribbon via Descriptions.getRoomTitle
 *   ProtoHud.setMinimap(svgMarkup);   // DungeonMap.renderSVG output
 *   ProtoHud.setCompass('N');
 *   ProtoHud.loadSprites().then(...)  // manifest of cutout sprites
 */

var ProtoHud = (function() {
  var SPRITE_DIR = 'assets/proto/monsters/';
  var els = {};
  var spriteIndex = null;      // { id: {w,h,bbox} } or {} when unavailable
  var spritePromise = null;

  var ICONS = {
    skull: '<svg class="hud-icon" viewBox="0 0 24 24"><path fill="#e8d9b0" d="M12 2a8 8 0 0 0-8 8c0 2.7 1.3 4.6 3 5.8V19a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3.2c1.7-1.2 3-3.1 3-5.8a8 8 0 0 0-8-8zm-3 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm6 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm-4 4h2l-1 2-1-2z"/></svg>',
    scroll: '<svg class="hud-icon" viewBox="0 0 24 24"><path fill="#e6d3a3" d="M6 3h11a3 3 0 0 1 3 3v2h-4V6H8v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2h4v2h1V6a3 3 0 0 1 1-3z"/><path fill="#8a6a2a" d="M9 8h7v2H9zm0 4h7v2H9z"/></svg>',
    coins: '<svg class="hud-icon" viewBox="0 0 24 24"><ellipse cx="12" cy="7" rx="7" ry="3" fill="#ffd97a"/><path fill="#d9a441" d="M5 9c0 1.7 3.1 3 7 3s7-1.3 7-3v3c0 1.7-3.1 3-7 3s-7-1.3-7-3z"/><path fill="#b8860b" d="M5 14c0 1.7 3.1 3 7 3s7-1.3 7-3v3c0 1.7-3.1 3-7 3s-7-1.3-7-3z"/></svg>'
  };

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  /**
   * Build the HUD DOM. Returns the root element.
   */
  function mount(opts) {
    opts = opts || {};
    var root = opts.root || document.body;
    document.documentElement.classList.add('proto');
    document.body.classList.add('proto');

    var hud = el('div');
    hud.id = 'hud-root';
    if (opts.view) document.body.classList.add('view-' + opts.view);

    // --- top bar
    var top = el('div', 'hud-top hud-frame');
    top.appendChild(el('span', 'hud-rivet-tr'));
    top.appendChild(el('span', 'hud-rivet-bl'));
    var identity = el('div', 'hud-identity');
    var portrait = el('div', 'hud-portrait', '<img alt="Mr Owl" src="assets/knight_owl.png">');
    identity.appendChild(portrait);
    els.portraitImg = portrait.querySelector('img');
    els.name = el('div', 'hud-name', opts.name || 'Mr Owl');
    els.name.title = opts.name || 'Mr Owl';
    identity.appendChild(els.name);
    top.appendChild(identity);
    var stats = el('div', 'hud-stats');
    stats.innerHTML =
      '<span class="hud-stat" title="Monsters defeated / Pokonane potwory">' + ICONS.skull + '<b data-stat="monsters">0</b></span>' +
      '<span class="hud-stat" title="Questions / Pytania">' + ICONS.scroll + '<b data-stat="questions">0/0</b></span>' +
      '<span class="hud-stat" title="Gold / Złoto">' + ICONS.coins + '<b data-stat="gold">0</b></span>';
    top.appendChild(stats);
    els.stats = stats;
    var btns = el('div', 'hud-iconbtns');
    var mapBtn = el('button', 'hud-btn', '&#x1f5fa;');
    mapBtn.type = 'button';
    mapBtn.setAttribute('aria-label', 'Toggle map');
    btns.appendChild(mapBtn);
    var sfx = document.getElementById('sfx-toggle');
    if (sfx) btns.appendChild(sfx);
    var back = el('a', 'hud-btn', '&#x2716;');
    back.href = 'index.html';
    back.addEventListener('click', function(e) {
      // Straight to the launch screen (no splash video), name prefilled
      if (typeof ProtoSession === 'undefined') return;
      e.preventDefault();
      var name = (typeof Player !== 'undefined' && Player.getName) ? Player.getName() : '';
      if (typeof ProtoSession.autoSave === 'function' && name) {
        try { ProtoSession.autoSave(); } catch (err) { /* ignore */ }
      }
      window.location.href = ProtoSession.launcherUrl(name);
    });
    back.setAttribute('aria-label', 'Back to classic view');
    btns.appendChild(back);
    top.appendChild(btns);
    hud.appendChild(top);

    // --- minimap
    var mini = el('div', 'hud-minimap hud-frame');
    mini.appendChild(el('span', 'hud-rivet-tr'));
    mini.appendChild(el('span', 'hud-rivet-bl'));
    var miniToggle = el('button', 'hud-minimap-toggle', '&#x25BE;');
    miniToggle.type = 'button';
    mini.appendChild(miniToggle);
    var mapContainer = el('div', 'dungeon-map-container');
    mapContainer.id = 'dungeon-map';
    mini.appendChild(mapContainer);
    hud.appendChild(mini);
    els.minimap = mini;
    els.mapContainer = mapContainer;
    mapContainer.setAttribute('role', 'button');
    mapContainer.title = 'Open the map / Otw\u00f3rz map\u0119';
    mapContainer.addEventListener('click', function() { if (els.onMapTap) els.onMapTap(); });
    function toggleMap() {
      mini.classList.toggle('collapsed');
      miniToggle.innerHTML = mini.classList.contains('collapsed') ? '&#x1f5fa;' : '&#x25BE;';
    }
    mapBtn.addEventListener('click', toggleMap);
    miniToggle.addEventListener('click', toggleMap);

    // --- compass (optional)
    if (opts.compass) {
      els.compass = el('div', 'hud-compass hud-frame', 'N');
      hud.appendChild(els.compass);
    }

    hud.appendChild(el('div', 'hud-spacer'));

    // --- room ribbon
    els.ribbon = el('div', 'hud-ribbon');
    els.ribbon.id = 'room-description';
    hud.appendChild(els.ribbon);

    // --- dock
    var dock = el('div', 'hud-dock hud-frame');
    dock.appendChild(el('span', 'hud-rivet-tr'));
    dock.appendChild(el('span', 'hud-rivet-bl'));
    var side = el('div', 'hud-dock-side');
    if (opts.note) {
      side.appendChild(el('div', 'hud-dock-note',
        '<span class="label-en">' + (opts.note.en || '') + '</span><span class="label-pl">' + (opts.note.pl || '') + '</span>'));
    }
    els.loot = el('div', 'hud-loot');
    els.loot.id = 'inventory-panel';
    side.appendChild(els.loot);
    if (opts.extraDockHtml) {
      side.appendChild(el('div', 'hud-dock-extra', opts.extraDockHtml));
    }
    dock.appendChild(side);
    var controls = el('div', 'hud-dock-controls', opts.controlsHtml || '');
    dock.appendChild(controls);
    hud.appendChild(dock);
    els.dock = dock;
    els.controls = controls;

    root.appendChild(hud);
    els.root = hud;

    // Hidden stats panel so UI.renderStats keeps working if a page calls it
    return hud;
  }

  function updateStats(s) {
    if (!els.stats) return;
    var total = s.questionsTotal || 0;
    var correct = s.questionsCorrect || 0;
    els.stats.querySelector('[data-stat="monsters"]').textContent = s.monstersDefeated || 0;
    els.stats.querySelector('[data-stat="questions"]').textContent = correct + '/' + total;
    els.stats.querySelector('[data-stat="gold"]').textContent = s.totalLoot || 0;
  }

  function setName(name) {
    if (els.name) {
      els.name.textContent = name;
      els.name.title = name;
    }
  }

  /**
   * Bilingual room title in the ribbon
   * @param {Object} room - Dungeon room
   */
  function setRoom(room) {
    if (!els.ribbon || !room) return;
    var title = (typeof Descriptions !== 'undefined' && Descriptions.getRoomTitle)
      ? Descriptions.getRoomTitle(room)
      : { en: room.type, pl: room.type };
    setRibbon(title);
  }

  /**
   * Any bilingual title in the ribbon
   * @param {Object} title - { en, pl }
   */
  function setRibbon(title) {
    if (!els.ribbon || !title) return;
    els.ribbon.innerHTML = '<span class="title-en">' + title.en + '</span><span class="title-pl">' + title.pl + '</span>';
  }

  /**
   * Replace the dock note (hint text)
   * @param {Object} note - { en, pl }
   */
  function setNote(note) {
    var el = els.root && els.root.querySelector('.hud-dock-note');
    if (!el || !note) return;
    el.innerHTML = '<span class="label-en">' + (note.en || '') + '</span><span class="label-pl">' + (note.pl || '') + '</span>';
  }

  var KEY_ICON = '<svg viewBox="0 0 24 24"><path d="M7 3a5 5 0 1 0 4.6 7H14v3h3v-3h4V7h-9.4A5 5 0 0 0 7 3zm0 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/></svg>';

  /**
   * Skeleton key fragments in the dock (cemetery level): `have` of `total`
   * lit up. The row is created on first use and hidden when total is 0.
   */
  function setKeyParts(have, total) {
    if (!els.root) return;
    var row = els.keys;
    if (!row) {
      row = el('div', 'hud-keys');
      row.setAttribute('title', 'Skeleton key / Szkieletowy klucz');
      var side = els.root.querySelector('.hud-dock-side');
      if (side) side.insertBefore(row, side.firstChild);
      els.keys = row;
    }
    if (!total) { row.style.display = 'none'; return; }
    row.style.display = '';
    var html = '';
    for (var i = 0; i < total; i++) html += '<span class="hud-key' + (i < have ? ' have' : '') + '">' + KEY_ICON + '</span>';
    var prev = row.getAttribute('data-have');
    row.innerHTML = html;
    row.setAttribute('data-have', String(have));
    if (prev !== null && Number(prev) < have) {
      var gained = row.querySelectorAll('.hud-key')[have - 1];
      if (gained) { gained.classList.add('gained'); setTimeout(function() { gained.classList.remove('gained'); }, 1200); }
    }
  }

  var facingDir = null;

  /**
   * Canvas for the cemetery map (the dungeon keeps the SVG); created once and
   * reused, so the HUD never reparses markup while Mr Owl walks.
   */
  function minimapCanvas(w, h) {
    if (!els.mapContainer) return null;
    if (!els.mapCanvas) {
      els.mapContainer.innerHTML = '';
      var c = el('canvas', 'dungeon-map-canvas');
      c.width = w || 360;
      c.height = h || 200;
      els.mapContainer.appendChild(c);
      els.mapCanvas = c;
    }
    return els.mapCanvas;
  }

  function setMinimap(svg) {
    if (els.mapContainer) {
      els.mapContainer.innerHTML = svg;
      els.mapCanvas = null;
    }
    drawFacingArrow();
  }

  function setCompass(facing) {
    if (els.compass) els.compass.textContent = facing;
    facingDir = facing;
    drawFacingArrow();
  }

  /**
   * Arrow on the current room of the minimap pointing where the player faces
   * (map +y is South, so N points up). Only drawn when a facing was set.
   */
  function drawFacingArrow() {
    if (!els.mapContainer || !facingDir) return;
    var svg = els.mapContainer.querySelector('svg');
    var node = svg && svg.querySelector('.current-room');
    if (!node) return;
    var old = svg.querySelector('.facing-arrow');
    if (old) old.parentNode.removeChild(old);
    // Pad the viewBox once so an arrow on an edge room is not clipped
    if (!svg.getAttribute('data-arrow-pad')) {
      var vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(parseFloat);
      if (vb.length === 4 && !vb.some(isNaN)) {
        var pad = 60;
        svg.setAttribute('viewBox', (vb[0] - pad) + ' ' + (vb[1] - pad) + ' ' + (vb[2] + pad * 2) + ' ' + (vb[3] + pad * 2));
        svg.setAttribute('data-arrow-pad', '1');
      }
    }
    var cx = parseFloat(node.getAttribute('cx'));
    var cy = parseFloat(node.getAttribute('cy'));
    var r = parseFloat(node.getAttribute('r')) || 20;
    var angle = { N: 0, E: 90, S: 180, W: 270 }[facingDir];
    if (angle === undefined || isNaN(cx) || isNaN(cy)) return;
    var ns = 'http://www.w3.org/2000/svg';
    var g = document.createElementNS(ns, 'g');
    g.setAttribute('class', 'facing-arrow');
    g.setAttribute('transform', 'translate(' + cx + ',' + cy + ') rotate(' + angle + ')');
    // The minimap SVG is shown heavily scaled down, so the arrow is drawn large
    var tip = r + 46, base = r + 6, half = 22;
    var path = document.createElementNS(ns, 'path');
    path.setAttribute('d', 'M 0 ' + (-tip) + ' L ' + half + ' ' + (-base) + ' L 0 ' + (-base - 10) + ' L ' + (-half) + ' ' + (-base) + ' Z');
    path.setAttribute('fill', '#e8452f');
    path.setAttribute('stroke', '#3a2a12');
    path.setAttribute('stroke-width', '5');
    path.setAttribute('stroke-linejoin', 'round');
    g.appendChild(path);
    svg.appendChild(g);
  }

  /**
   * Show the last few loot items in the dock
   */
  function setLoot(items) {
    if (!els.loot) return;
    if (els.dock) els.dock.classList.toggle('has-loot', !!(items && items.length));
    if (!items || !items.length) { els.loot.innerHTML = ''; return; }
    var last = items.slice(-3).reverse();
    els.loot.innerHTML = last.map(function(it) {
      return '<div>' + (it.namePL || it.name) + ' <b>' + it.value + 'g</b></div>';
    }).join('');
  }

  // ---------------------------------------------------------------------------
  // Sprites (extracted monsters)
  // ---------------------------------------------------------------------------

  /**
   * Load the sprite manifest once. Resolves to {} when unavailable (file://).
   */
  function loadSprites() {
    if (spritePromise) return spritePromise;
    spritePromise = new Promise(function(resolve) {
      if (typeof fetch !== 'function') { spriteIndex = {}; resolve(spriteIndex); return; }
      fetch(SPRITE_DIR + 'index.json').then(function(r) {
        return r.ok ? r.json() : {};
      }).then(function(json) {
        spriteIndex = json || {};
        resolve(spriteIndex);
      }).catch(function() {
        spriteIndex = {};
        resolve(spriteIndex);
      });
    });
    return spritePromise;
  }

  function hasSprite(id) {
    return !!(spriteIndex && spriteIndex[id]);
  }

  function spriteUrl(id) {
    return hasSprite(id) ? SPRITE_DIR + id + '.png' : null;
  }

  function spriteInfo(id) {
    return hasSprite(id) ? spriteIndex[id] : null;
  }

  /**
   * Apply sprites where the HUD wants them. The encounter modals keep the
   * full illustrations (the painted scenes are part of the combat look);
   * only the HUD portrait uses the cutout.
   */
  function useSpritesInModals() {
    if (els.portraitImg && hasSprite('knight_owl')) {
      els.portraitImg.src = spriteUrl('knight_owl');
      els.portraitImg.style.objectPosition = '50% 0%';
    }
  }

  return {
    mount: mount,
    updateStats: updateStats,
    setName: setName,
    setRoom: setRoom,
    setRibbon: setRibbon,
    setNote: setNote,
    setKeyParts: setKeyParts,
    setMinimap: setMinimap,
    minimapCanvas: minimapCanvas,
    /** Called when the little map is tapped */
    onMinimapTap: function(fn) { els.onMapTap = fn; },
    setCompass: setCompass,
    setLoot: setLoot,
    loadSprites: loadSprites,
    hasSprite: hasSprite,
    spriteUrl: spriteUrl,
    spriteInfo: spriteInfo,
    useSpritesInModals: useSpritesInModals,
    SPRITE_DIR: SPRITE_DIR
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProtoHud;
}
