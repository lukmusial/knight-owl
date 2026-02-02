/**
 * Mobile Layout Tests
 * Structural tests for direction bar, collapsible map, and compact quiz modal
 */

TestRunner.suite('Mobile Layout', function() {

  var fs = typeof require !== 'undefined' ? require('fs') : null;
  var path = typeof require !== 'undefined' ? require('path') : null;

  function readFile(relPath) {
    if (!fs || !path) return null;
    return fs.readFileSync(path.resolve(__dirname, relPath), 'utf8');
  }

  TestRunner.test('Direction bar HTML structure is correct in index.html', function() {
    var html = readFile('../www/index.html');
    if (!html) { TestRunner.assert(true, 'Skipped in browser context'); return; }
    TestRunner.assert(html.indexOf('id="direction-bar"') !== -1, 'direction-bar element exists');
    TestRunner.assert(html.indexOf('data-direction="North"') !== -1, 'North button exists');
    TestRunner.assert(html.indexOf('data-direction="South"') !== -1, 'South button exists');
    TestRunner.assert(html.indexOf('data-direction="East"') !== -1, 'East button exists');
    TestRunner.assert(html.indexOf('data-direction="West"') !== -1, 'West button exists');
  });

  TestRunner.test('Map panel collapsed class added via JS on mobile', function() {
    var src = readFile('../www/js/modules/ui.js');
    if (!src) { TestRunner.assert(true, 'Skipped in browser context'); return; }
    TestRunner.assert(src.indexOf("classList.add('collapsed')") !== -1, 'collapsed class added in JS init');
    TestRunner.assert(src.indexOf('innerWidth <= 768') !== -1, 'only on mobile viewport');
  });

  TestRunner.test('UI module has renderDirectionBar function', function() {
    var src = readFile('../www/js/modules/ui.js');
    if (!src) { TestRunner.assert(true, 'Skipped in browser context'); return; }
    TestRunner.assert(src.indexOf('function renderDirectionBar') !== -1, 'renderDirectionBar function exists');
    TestRunner.assert(src.indexOf('function hideDirectionBar') !== -1, 'hideDirectionBar function exists');
  });

  TestRunner.test('Direction bar CSS has fixed positioning and visibility hidden for disabled', function() {
    var css = readFile('../www/css/styles.css');
    if (!css) { TestRunner.assert(true, 'Skipped in browser context'); return; }
    TestRunner.assert(css.indexOf('.direction-bar') !== -1, 'direction-bar CSS exists');
    TestRunner.assert(css.indexOf('.dir-btn[disabled]') !== -1, 'disabled button selector exists');
    TestRunner.assert(css.indexOf('visibility: hidden') !== -1, 'uses visibility hidden');
  });

  TestRunner.test('Direction bar has explored and boss styling', function() {
    var css = readFile('../www/css/styles.css');
    if (!css) { TestRunner.assert(true, 'Skipped in browser context'); return; }
    TestRunner.assert(css.indexOf('.dir-btn.explored') !== -1, 'explored style exists');
    TestRunner.assert(css.indexOf('.dir-btn.boss-btn') !== -1, 'boss-btn style exists');
  });

  TestRunner.test('Map toggle click handler exists in UI', function() {
    var src = readFile('../www/js/modules/ui.js');
    if (!src) { TestRunner.assert(true, 'Skipped in browser context'); return; }
    TestRunner.assert(src.indexOf('map-toggle') !== -1, 'map-toggle handler referenced');
    TestRunner.assert(src.indexOf("toggle('collapsed')") !== -1 || src.indexOf('toggle("collapsed")') !== -1, 'collapsed class toggling exists');
  });

  TestRunner.test('Collapsed map hides dungeon-map-container in CSS', function() {
    var css = readFile('../www/css/styles.css');
    if (!css) { TestRunner.assert(true, 'Skipped in browser context'); return; }
    TestRunner.assert(css.indexOf('.map-panel.collapsed .dungeon-map-container') !== -1, 'collapsed map container rule exists');
  });

  TestRunner.test('Quiz modal mobile sizing reduces monster image height', function() {
    var css = readFile('../www/css/styles.css');
    if (!css) { TestRunner.assert(true, 'Skipped in browser context'); return; }
    TestRunner.assert(css.indexOf('max-height: 120px') !== -1, 'monster image max-height reduced for mobile');
  });

});
