/**
 * ProtoSession
 * Shared game-session plumbing for the view pages (classic index.html,
 * proto/isometric.html, proto/first-person.html):
 *  - remembers the chosen view (classic / iso / fp) in localStorage,
 *  - builds the page URL to launch a view for a player ("new" or "continue"),
 *  - parses those launch parameters on the target page,
 *  - starts a new game or restores a save the same way main.js does, and
 *  - autosaves so a run can be continued in any view.
 */

var ProtoSession = (function() {
  var VIEW_KEY = 'mrowl_dungeon_view';
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
  function startNew(name) {
    Questions.resetUsed();
    if (typeof Matching !== 'undefined') {
      Matching.init();
      Matching.resetUsed();
    }
    Player.reset();
    Player.create(name);
    DungeonMap.init();
    loadProfile(name);
    Dungeon.generate();
    DungeonMap.calculateLayout(Dungeon.getEntranceId());
    return { loaded: false, name: name };
  }

  /**
   * Restore a saved run (mirrors main.js loadGame without UI).
   * Returns null when there is no save.
   */
  function restore(name) {
    if (typeof Save === 'undefined' || !Save.hasSave(name)) return null;
    var data = Save.loadGame(name);
    if (!data) return null;
    loadProfile(name);
    Player.loadState(data.player);
    Dungeon.loadState(data.dungeon);
    if (data.usedQuestions) Questions.setUsedIds(data.usedQuestions);
    if (typeof Matching !== 'undefined') {
      Matching.init();
      if (data.usedMatchingQuestions) Matching.setUsedIds(data.usedMatchingQuestions);
    }
    if (data.mapState) {
      DungeonMap.loadState(data.mapState);
    } else {
      DungeonMap.init();
      DungeonMap.calculateLayout(Dungeon.getEntranceId());
    }
    return { loaded: true, name: name };
  }

  /**
   * Begin a session from the page's launch parameters.
   * "continue" falls back to a new game when no save exists.
   * @param {string} defaultName - Used when no name was passed
   */
  function begin(defaultName) {
    var p = parseParams();
    var name = p.name || defaultName || 'Explorer';
    if (p.action === 'continue') {
      var restored = restore(name);
      if (restored) return restored;
    }
    return startNew(name);
  }

  function autoSave() {
    if (typeof Save === 'undefined') return false;
    var matchingIds = (typeof Matching !== 'undefined' && Matching.getUsedIds) ? Matching.getUsedIds() : [];
    Save.saveGame(Player.exportState(), Dungeon.getState(), Questions.getUsedIds(), DungeonMap.getState(), matchingIds);
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
    getView: getView,
    setView: setView,
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
