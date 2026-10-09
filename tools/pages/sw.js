/**
 * Service worker of the Halloween cemetery site (GitHub Pages).
 *
 * tools/pages/build.js copies this file to the site root and fills in
 * PRECACHE: every file of the site with a content hash. On install the whole
 * game is saved (a level loads monsters, cards, backdrops and music while it
 * is played, so caching only what the first visit fetched would not do), so
 * it plays offline once the first visit has finished saving. Files whose hash
 * did not change are copied from the previous version's cache instead of
 * downloaded again. Requests are answered from the cache first, the network
 * second. Pages get progress as { type: 'offline-progress', done, total } and
 * { type: 'offline-ready' } messages.
 */
var PRECACHE = /*PRECACHE*/[];
var VERSION = '/*VERSION*/';
var PREFIX = 'mrowl-cem-';
var CACHE = PREFIX + VERSION;
var REVS = '__revs__';
var PARALLEL = 6;

function tell(msg) {
  return self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(function(list) {
    list.forEach(function(c) { c.postMessage(msg); });
  });
}

/** url -> rev map stored in each version's cache, to copy what is unchanged */
function readRevs(cache) {
  return cache.match(REVS).then(function(r) { return r ? r.json() : {}; }).catch(function() { return {}; });
}

function previousCaches() {
  return caches.keys().then(function(keys) {
    return keys.filter(function(k) { return k.indexOf(PREFIX) === 0 && k !== CACHE; });
  });
}

/** An unchanged file from an older version's cache, or null */
function fromOld(olds, url, rev) {
  var i = 0;
  function next() {
    if (i >= olds.length) return Promise.resolve(null);
    var o = olds[i++];
    if (o.revs[url] !== rev) return next();
    return o.cache.match(url).then(function(r) { return r || next(); });
  }
  return next();
}

self.addEventListener('install', function(event) {
  event.waitUntil(caches.open(CACHE).then(function(cache) {
    return previousCaches().then(function(keys) {
      return Promise.all(keys.map(function(k) {
        return caches.open(k).then(function(c) { return readRevs(c).then(function(revs) { return { cache: c, revs: revs }; }); });
      }));
    }).then(function(olds) {
      var queue = PRECACHE.slice(), done = 0, total = PRECACHE.length;
      function one() {
        var item = queue.shift();
        if (!item) return Promise.resolve();
        return cache.match(item.url).then(function(have) {
          if (have) return null;
          return fromOld(olds, item.url, item.rev).then(function(old) {
            if (old) return cache.put(item.url, old);
            return fetch(item.url, { cache: 'no-cache' }).then(function(r) {
              if (!r.ok) throw new Error(item.url + ': ' + r.status);
              return cache.put(item.url, r);
            });
          });
        }).then(function() {
          done++;
          if (done % 20 === 0 || done === total) tell({ type: 'offline-progress', done: done, total: total });
          return one();
        });
      }
      var workers = [];
      for (var i = 0; i < PARALLEL; i++) workers.push(one());
      return Promise.all(workers).then(function() {
        var revs = {};
        PRECACHE.forEach(function(p) { revs[p.url] = p.rev; });
        return cache.put(REVS, new Response(JSON.stringify(revs), { headers: { 'Content-Type': 'application/json' } }));
      });
    });
  }).then(function() { return self.skipWaiting(); }));
});

self.addEventListener('activate', function(event) {
  event.waitUntil(previousCaches().then(function(keys) {
    return Promise.all(keys.map(function(k) { return caches.delete(k); }));
  }).then(function() { return self.clients.claim(); }).then(function() { return tell({ type: 'offline-ready' }); }));
});

self.addEventListener('message', function(event) {
  // a page asking whether the game is already saved for offline play
  if (event.data && event.data.type === 'offline-status') {
    caches.open(CACHE).then(function(c) { return c.match(REVS); }).then(function(r) {
      if (r && self.registration.active === self) event.source.postMessage({ type: 'offline-ready' });
    });
  }
});

self.addEventListener('fetch', function(event) {
  var req = event.request;
  var url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  // the site root is index.html; launch parameters do not make another file
  var key = url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname;
  event.respondWith(caches.open(CACHE).then(function(cache) {
    return cache.match(key, { ignoreSearch: true }).then(function(hit) {
      return hit || fetch(req);
    });
  }));
});
