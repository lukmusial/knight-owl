/**
 * ProtoSharedDom
 * Shared modal markup for the standalone prototype pages (www/proto/*.html).
 * Mirrors the modal/victory markup of www/index.html so the prototypes can
 * reuse UI.showQuizModal / showResultModal / showMatchingModal /
 * showTreasureModal / showVictoryScreen unchanged. Injected as a JS string
 * (no fetch) so it works on file://, capacitor:// and http alike.
 *
 * Keep in sync with www/index.html (ids are the contract with ui.js).
 */

var ProtoSharedDom = (function() {
  var MODAL_HTML = [
    "<!-- Quiz Modal -->",
    "<div id=\"quiz-modal\" class=\"modal hidden\">",
    "  <div class=\"modal-content quiz-content\">",
    "    <div class=\"monster-display\">",
    "      <img id=\"monster-image\" src=\"assets/placeholder.svg\" alt=\"Monster\">",
    "      <h2 id=\"monster-name\">Monster</h2>",
    "      <p id=\"monster-description\" class=\"monster-description\">Monster description</p>",
    "    </div>",
    "",
    "    <div id=\"dragon-progress\" class=\"dragon-progress hidden\">",
    "      <!-- Dragon streak indicator -->",
    "    </div>",
    "",
    "    <div class=\"question-section\">",
    "      <p id=\"question-text\" class=\"question-text\">Question goes here</p>",
    "      <button id=\"speak-word-btn\" class=\"btn-speak hidden\" title=\"Listen to pronunciation\">",
    "        <span class=\"speak-icon\">🔊</span>",
    "        <span class=\"speak-text\">Listen</span>",
    "      </button>",
    "      <p id=\"sentence-text\" class=\"sentence-text hidden\">Sentence goes here</p>",
    "      <p id=\"hint-text\" class=\"hint-text\">Hint goes here</p>",
    "    </div>",
    "",
    "    <div id=\"answers-container\" class=\"answers-container\">",
    "      <!-- Answer buttons populated by JavaScript -->",
    "    </div>",
    "  </div>",
    "</div>",
    "",
    "<!-- Matching Modal -->",
    "<div id=\"matching-modal\" class=\"modal hidden\">",
    "  <div class=\"modal-content matching-content\">",
    "    <div class=\"monster-display\">",
    "      <img id=\"matching-monster-image\" src=\"assets/placeholder.svg\" alt=\"Monster\">",
    "      <h2 id=\"matching-monster-name\">Monster</h2>",
    "      <p id=\"matching-monster-description\" class=\"monster-description\">Description</p>",
    "    </div>",
    "",
    "    <p id=\"matching-instruction\" class=\"matching-instruction\">",
    "      <span class=\"label-en\">Match the pairs!</span>",
    "      <span class=\"label-pl\">Dopasuj pary!</span>",
    "    </p>",
    "",
    "    <div class=\"matching-columns\">",
    "      <div id=\"matching-left\" class=\"matching-column\">",
    "        <!-- Left column items -->",
    "      </div>",
    "      <div id=\"matching-right\" class=\"matching-column\">",
    "        <!-- Right column items -->",
    "      </div>",
    "    </div>",
    "  </div>",
    "</div>",
    "",
    "<!-- Result Modal -->",
    "<div id=\"result-modal\" class=\"modal hidden\">",
    "  <div class=\"modal-content result-content\">",
    "    <h2 id=\"result-title\" class=\"result-title\">Result</h2>",
    "    <p id=\"result-message\" class=\"result-message\">Message</p>",
    "    <p id=\"result-explanation\" class=\"result-explanation\">Explanation</p>",
    "",
    "    <div id=\"loot-container\" class=\"loot-container hidden\">",
    "      <!-- Loot display populated by JavaScript -->",
    "    </div>",
    "",
    "    <button id=\"continue-btn\" class=\"btn btn-primary\">Continue</button>",
    "  </div>",
    "</div>",
    "",
    "<!-- Treasure Modal -->",
    "<div id=\"treasure-modal\" class=\"modal hidden\">",
    "  <div class=\"modal-content treasure-content\">",
    "    <div class=\"treasure-display\">",
    "      <img id=\"treasure-image\" data-src=\"assets/treasure.jpg\" alt=\"Treasure\">",
    "      <h2 id=\"treasure-title\">",
    "        <span class=\"title-en\">Treasure Found!</span>",
    "        <span class=\"title-pl\">Znaleziono Skarb!</span>",
    "      </h2>",
    "      <p id=\"treasure-description\" class=\"treasure-description\">",
    "        <span class=\"desc-en\">You discovered a hidden treasure chest!</span>",
    "        <span class=\"desc-pl\">Odkryłeś ukrytą skrzynię ze skarbami!</span>",
    "      </p>",
    "    </div>",
    "",
    "    <div id=\"treasure-loot-container\" class=\"loot-container\">",
    "      <!-- Treasure items populated by JavaScript -->",
    "    </div>",
    "",
    "    <button id=\"treasure-continue-btn\" class=\"btn btn-primary\">",
    "      <span class=\"btn-en\">Collect Treasure</span>",
    "      <span class=\"btn-pl\">Zbierz Skarb</span>",
    "    </button>",
    "  </div>",
    "</div>",
    "",
    "<!-- Victory Screen -->",
    "<div id=\"victory-screen\" class=\"screen hidden\">",
    "  <div class=\"victory-content\">",
    "    <div class=\"victory-banner\">",
    "      <h1>VICTORY!</h1>",
    "      <div class=\"victory-owl\">",
    "        <img data-src=\"assets/victory.jpg\" alt=\"Victorious Mr Owl\" class=\"victory-image\">",
    "      </div>",
    "    </div>",
    "",
    "    <div id=\"victory-stats\" class=\"victory-stats\">",
    "      <!-- Stats populated by JavaScript -->",
    "    </div>",
    "",
    "    <button id=\"play-again-btn\" class=\"btn btn-primary btn-large\">Play Again</button>",
    "  </div>",
    ""
  ].join('\n');

  var SFX_TOGGLE_HTML = '<button id="sfx-toggle" class="sfx-toggle" type="button" aria-label="Sound on/off" aria-pressed="false">&#x1f50a;</button>';

  // Every id ui.js caches for the modals and victory screen
  var REQUIRED_IDS = ["quiz-modal", "monster-image", "monster-name", "monster-description", "dragon-progress", "question-text", "speak-word-btn", "sentence-text", "hint-text", "answers-container", "matching-modal", "matching-monster-image", "matching-monster-name", "matching-monster-description", "matching-instruction", "matching-left", "matching-right", "result-modal", "result-title", "result-message", "result-explanation", "loot-container", "continue-btn", "treasure-modal", "treasure-image", "treasure-title", "treasure-description", "treasure-loot-container", "treasure-continue-btn", "victory-screen", "victory-stats", "play-again-btn"];

  /**
   * Inject the shared markup into a container and initialize the UI module
   * @param {Element} container - Empty element that receives the markup
   * @param {Object} [opts] - { sfxToggle: boolean } also add the sound toggle
   */
  function inject(container, opts) {
    if (!container) return;
    opts = opts || {};
    container.innerHTML = MODAL_HTML + (opts.sfxToggle === false ? '' : SFX_TOGGLE_HTML);
    if (typeof UI !== 'undefined' && typeof UI.init === 'function') {
      UI.init();
    }
  }

  return {
    MODAL_HTML: MODAL_HTML,
    SFX_TOGGLE_HTML: SFX_TOGGLE_HTML,
    REQUIRED_IDS: REQUIRED_IDS,
    inject: inject
  };
})();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProtoSharedDom;
}
