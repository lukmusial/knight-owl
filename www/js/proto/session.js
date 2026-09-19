/**
 * ProtoSession
 * Shared game-session plumbing for the view pages (classic index.html,
 * proto/isometric.html, proto/first-person.html):
 *  - remembers the chosen view (classic / iso / fp) in localStorage,
 *  - builds the page URL to launch a view for a player ("new" or "continue"),
 *  - parses those launch parameters on the target page,
 *  - starts a new game or restores a save the same way main.js does, and
 *  - autosaves so a run can be continued in any view.
 * Levels: the dungeon (every view) and the Halloween cemetery (isometric
 * view only). A save remembers its level; restoring a cemetery save from a
 * view that does not support it reports `unsupportedLevel`.
 */

var ProtoSession = (function() {
  var VIEW_KEY = 'mrowl_dungeon_view';
  var LEVEL_KEY = 'mrowl_dungeon_level';
  var LEVELS = {
    dungeon: { label: 'Dungeon', labelPL: 'Loch', views: ['classic', 'iso', 'fp'] },
    cemetery: { label: 'Halloween Cemetery', labelPL: 'Cmentarz na Halloween', views: ['iso'] }
  };
  // Level of the run in progress ('dungeon' unless a cemetery was started/restored)
  var currentLevel = 'dungeon';
  var cemeteryLevel = null;
  var VIEWS = {
    classic: { page: 'index.html', label: 'Classic', labelPL: 'Klasyczny' },
    iso: { page: 'proto/isometric.html', label: 'Isometric', labelPL: 'Izometryczny' },
    fp: { page: 'proto/first-person.html', label: '3D', labelPL: '3D' }
  };

  function getView() {
    try {
      var v = (typeof localStorage !== 'undefined') ? localStorage.getItem(VIEW_KEY) : null;
      return VIEWS[v] ? v : 'classic';
    } catch (e) {
      return 'classic';
    }
  }

  function setView(view) {
    if (!VIEWS[view]) return false;
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(VIEW_KEY, view);
    } catch (e) { /* storage blocked */ }
    return true;
  }

  function pageFor(view) {
    return (VIEWS[view] || VIEWS.classic).page;
  }

  /** Remembered level choice for new runs */
  function getLevel() {
    try {
      var l = (typeof localStorage !== 'undefined') ? localStorage.getItem(LEVEL_KEY) : null;
      return LEVELS[l] ? l : 'dungeon';
    } catch (e) {
      return 'dungeon';
    }
  }

  function setLevel(level) {
    if (!LEVELS[level]) return false;
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(LEVEL_KEY, level);
    } catch (e) { /* storage blocked */ }
    return true;
  }

  /** Level of the run in progress */
  function currentRunLevel() {
    return currentLevel;
  }

  /** The CemModel level object of the cemetery run in progress (or null) */
  function getCemetery() {
    return cemeteryLevel;
  }

  /** Level a player's save belongs to, or null without a save */
  function savedLevel(name) {
    if (typeof Save === 'undefined' || !Save.hasSave(name)) return null;
    var data = Save.loadGame(name);
    return data ? Save.getLevel(data) : null;
  }

  /**
   * URL that opens a view for a player. Relative to www/ (the classic page);
   * pass fromProto=true when building it from a page under www/proto/.
   */
  function launchUrl(view, name, action, fromProto) {
    var page = pageFor(view);
    if (fromProto) page = '../' + page;
    return page + '?name=' + encodeURIComponent(name || '') + '&action=' + (action === 'continue' ? 'continue' : 'new');
  }

  /**
   * URL of the launch screen when leaving a view: skips the splash video and
   * prefills the player's name. Built relative to www/proto/.
   */
  function launcherUrl(name) {
    return '../index.html?launcher=1' + (name ? '&name=' + encodeURIComponent(name) : '');
  }

  /**
   * Parse ?name=&action= from a query string (defaults to location.search)
   */
  function parseParams(search) {
    if (search === undefined && typeof location !== 'undefined') search = location.search;
    var out = { name: '', action: '' };
    if (!search || search.charAt(0) !== '?') return out;
    search.substring(1).split('&').forEach(function(pair) {
      var kv = pair.split('=');
      var key = decodeURIComponent(kv[0] || '');
      var val = decodeURIComponent((kv[1] || '').replace(/\+/g, ' '));
      if (key === 'name') out.name = val.substring(0, 20);
      if (key === 'action') out.action = val === 'continue' ? 'continue' : 'new';
      if (key === 'launcher') out.launcher = val === '1';
      if (key === 'level' && LEVELS[val]) out.level = val;
    });
    return out;
  }

  function loadProfile(name) {
    if (typeof UserProfile === 'undefined') return;
    UserProfile.load(name);
    if (typeof Questions !== 'undefined' && Questions.setWeightFunction) {
      Questions.setWeightFunction(function(qId) { return UserProfile.getQuestionWeight(qId); });
    }
  }

  /**
   * Start a fresh run for a player (mirrors main.js startNewGame without UI)
   */
  function resetRun(name) {
    Questions.resetUsed();
    if (typeof Matching !== 'undefined') {
      Matching.init();
      Matching.resetUsed();
    }
    Player.reset();
    Player.create(name);
    DungeonMap.init();
    loadProfile(name);
  }

  function startNew(name) {
    resetRun(name);
    currentLevel = 'dungeon';
    cemeteryLevel = null;
    Dungeon.generate();
    DungeonMap.calculateLayout(Dungeon.getEntranceId());
    return { loaded: false, name: name, level: 'dungeon' };
  }

  /**
   * Start a fresh cemetery run (isometric view). The level is seeded from the
   * player's name and the clock; the seed is what the save keeps.
   * @param {string} name - Player name
   * @param {number} seed - Optional fixed seed
   */
  function startNewCemetery(name, seed) {
    resetRun(name);
    currentLevel = 'cemetery';
    if (seed === undefined) seed = (CemModel.seedFromString(name) ^ (Date.now() & 0xffffffff)) >>> 0;
    var t0 = Date.now();
    cemeteryLevel = CemModel.generate(seed);
    if (cemeteryLevel) cemeteryLevel.genMs = Date.now() - t0;
    return { loaded: false, name: name, level: 'cemetery', cemetery: cemeteryLevel };
  }

  /**
   * Restore a saved run (mirrors main.js loadGame without UI).
   * Returns null when there is no save, or { unsupportedLevel } when the
   * save belongs to a level the caller cannot play (opts.levels).
   */
  function restore(name, opts) {
    if (typeof Save === 'undefined' || !Save.hasSave(name)) return null;
    var data = Save.loadGame(name);
    if (!data) return null;
    var level = Save.getLevel(data);
    var allowed = (opts && opts.levels) || ['dungeon'];
    if (allowed.indexOf(level) === -1) return { loaded: false, name: name, level: level, unsupportedLevel: level };
    loadProfile(name);
    Player.loadState(data.player);
    if (data.usedQuestions) Questions.setUsedIds(data.usedQuestions);
    if (typeof Matching !== 'undefined') {
      Matching.init();
      if (data.usedMatchingQuestions) Matching.setUsedIds(data.usedMatchingQuestions);
    }
    if (level === 'cemetery') {
      currentLevel = 'cemetery';
      DungeonMap.init();
      cemeteryLevel = (typeof CemModel !== 'undefined' && data.cemetery) ? CemModel.loadState(data.cemetery) : null;
      if (!cemeteryLevel) return null;
      return { loaded: true, name: name, level: 'cemetery', cemetery: cemeteryLevel };
    }
    currentLevel = 'dungeon';
    cemeteryLevel = null;
    Dungeon.loadState(data.dungeon);
    if (data.mapState) {
      DungeonMap.loadState(data.mapState);
    } else {
      DungeonMap.init();
      DungeonMap.calculateLayout(Dungeon.getEntranceId());
    }
    return { loaded: true, name: name, level: 'dungeon' };
  }

  /**
   * Begin a session from the page's launch parameters.
   * "continue" falls back to a new game when no save exists.
   * @param {string} defaultName - Used when no name was passed
   * @param {Object} opts - { level: 'dungeon'|'cemetery' for a new run,
   *   levels: [...] the caller can play (default ['dungeon']) }
   */
  function begin(defaultName, opts) {
    opts = opts || {};
    var p = parseParams();
    var name = p.name || defaultName || 'Explorer';
    var levels = opts.levels || ['dungeon'];
    if (p.action === 'continue') {
      var restored = restore(name, { levels: levels });
      if (restored) return restored;
    }
    var level = opts.level || p.level || 'dungeon';
    if (level === 'cemetery' && levels.indexOf('cemetery') !== -1 && typeof CemModel !== 'undefined') {
      return startNewCemetery(name);
    }
    return startNew(name);
  }

  function autoSave() {
    if (typeof Save === 'undefined') return false;
    var matchingIds = (typeof Matching !== 'undefined' && Matching.getUsedIds) ? Matching.getUsedIds() : [];
    var extra = { level: currentLevel };
    if (currentLevel === 'cemetery' && cemeteryLevel) extra.cemetery = CemModel.exportState(cemeteryLevel);
    Save.saveGame(Player.exportState(), Dungeon.getState(), Questions.getUsedIds(), DungeonMap.getState(), matchingIds, extra);
    if (typeof UserProfile !== 'undefined') UserProfile.save();
    return true;
  }

  /**
   * Run finished (dragon defeated): record the run and drop the save
   */
  function finishRun() {
    if (typeof UserProfile !== 'undefined') {
      UserProfile.completeRun();
      UserProfile.save();
    }
    if (typeof Save !== 'undefined') Save.deleteSave(Player.getName());
  }

  return {
    VIEWS: VIEWS,
    VIEW_KEY: VIEW_KEY,
    LEVELS: LEVELS,
    LEVEL_KEY: LEVEL_KEY,
    getView: getView,
    setView: setView,
    getLevel: getLevel,
    setLevel: setLevel,
    currentRunLevel: currentRunLevel,
    getCemetery: getCemetery,
    savedLevel: savedLevel,
    startNewCemetery: startNewCemetery,
    pageFor: pageFor,
    launchUrl: launchUrl,
    launcherUrl: launcherUrl,
    parseParams: parseParams,
    startNew: startNew,
    restore: restore,
    begin: begin,
    autoSave: autoSave,
    finishRun: finishRun
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProtoSession;
}
