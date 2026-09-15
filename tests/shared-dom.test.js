/**
 * ProtoSharedDom Tests
 */

TestRunner.suite('ProtoSharedDom', () => {
  TestRunner.test('markup contains every id ui.js needs', () => {
    ProtoSharedDom.REQUIRED_IDS.forEach(function(id) {
      TestRunner.assert(ProtoSharedDom.MODAL_HTML.indexOf('id="' + id + '"') !== -1, 'missing id ' + id);
    });
  });

  TestRunner.test('covers the five encounter containers', () => {
    ['quiz-modal', 'matching-modal', 'result-modal', 'treasure-modal', 'victory-screen',
      'monster-image', 'answers-container', 'continue-btn', 'play-again-btn'].forEach(function(id) {
      TestRunner.assert(ProtoSharedDom.REQUIRED_IDS.indexOf(id) !== -1, 'REQUIRED_IDS lacks ' + id);
    });
  });

  TestRunner.test('victory text is preserved for E2E flows', () => {
    TestRunner.assert(ProtoSharedDom.MODAL_HTML.indexOf('VICTORY!') !== -1, 'VICTORY! text');
  });

  TestRunner.test('inject tolerates a missing container', () => {
    ProtoSharedDom.inject(null);
    TestRunner.assert(true, 'no throw');
  });
});
