/* ================================================================ ROUTER v2 with error boundaries ================================================================ */
TF.Router = (function(){
  'use strict';
  var _routes = {}, _current = null, _history = [];
  var FILE_MODE = window.location.protocol === 'file:';
  var PUBLIC_ROUTES = { onboarding: true, login: true, register: true };
  var perfStore = {};

  function define(name, fn){ _routes[name] = fn; }

  function shouldBlockRoute(route){
    return !PUBLIC_ROUTES[route] && TF.Store && TF.Store.requiresAccount && TF.Store.requiresAccount();
  }

  function resolveRoute(route){
    return shouldBlockRoute(route) ? 'onboarding' : route;
  }

  function navigate(route, replace){
    if (shouldBlockRoute(route)) {
      if (TF.UI && TF.UI.promptAccountRequired) {
        TF.UI.promptAccountRequired();
      }
      route = 'onboarding';
      replace = true;
    }
    if (FILE_MODE) { _render(route, !!replace || route === _current); return; }
    if (replace) { history.replaceState(null, '', '#' + route); _render(route); }
    else {
      if (window.location.hash.slice(1) === route) {
        // Same route - force re-render without hash change
        _render(route, true);
      } else {
        window.location.hash = route;
      }
    }
  }

  function back(){ navigate(_history.length > 1 ? _history[_history.length - 2] : 'dashboard', true); }

  function _render(route, forceRerender){
    var renderStartedAt = performance.now();
    route = resolveRoute(route);
    var fn = _routes[route];
    if (!fn) { route = 'dashboard'; fn = _routes.dashboard; }
    if (route === _current && !forceRerender) return;
    _current = route;
    _history.push(route);
    if (_history.length > 30) _history.shift();

    var root = document.getElementById('screen-root');
    if (!root) return;
    if (typeof root._screenCleanup === 'function') {
      try { root._screenCleanup(); } catch (e) {}
    }
    root._screenCleanup = null;
    root.innerHTML = '';

    try {
      var result = fn(root);
      if (result && typeof result.then === 'function') {
        result.then(function(){
          recordRender(route, performance.now() - renderStartedAt);
        }).catch(function(error){
          console.error('[Router] Async screen error on route "' + route + '":', error);
        });
      } else {
        recordRender(route, performance.now() - renderStartedAt);
      }
    } catch (e) {
      console.error('[Router] Screen error on route "' + route + '":', e);
      root.innerHTML = '<div class="screen"><div class="error-screen">' +
        '<div class="error-icon" style="color:var(--amber)">' + TF.Icon('alert-triangle', 28) + '</div>' +
        '<div class="t-title" style="margin-bottom:8px">Something went wrong</div>' +
        '<div class="t-hint" style="margin-bottom:20px">' + e.message + '</div>' +
        '<button class="btn btn-secondary" style="width:auto;padding:10px 22px" onclick="TF.Router.navigate(\'dashboard\',true)">Go Home</button>' +
        '</div></div>';
      recordRender(route, performance.now() - renderStartedAt);
    }

    document.querySelectorAll('.nav-btn').forEach(function(btn){
      var r = btn.dataset.route;
      var active = r === route || (r === 'more' && ['nutrition', 'progress', 'profile', 'history', 'measurements', 'body-metrics', 'weekly-review', 'achievements', 'coach', 'custom-workouts', 'more'].indexOf(route) >= 0);
      btn.classList.toggle('active', active);
      if (active) {
        btn.setAttribute('aria-current', 'page');
      } else {
        btn.removeAttribute('aria-current');
      }
    });

    requestAnimationFrame(function(){ root.scrollTop = 0; });
  }

  function recordRender(route, durationMs){
    var current = perfStore[route] || {
      count: 0,
      totalMs: 0,
      maxMs: 0,
      lastMs: 0
    };
    current.count += 1;
    current.totalMs += durationMs;
    current.maxMs = Math.max(current.maxMs, durationMs);
    current.lastMs = durationMs;
    perfStore[route] = current;
  }

  function init(initialRoute){
    document.querySelectorAll('.nav-btn[data-route]').forEach(function(btn){
      btn.addEventListener('click', function(){ navigate(btn.dataset.route); });
    });
    if (!FILE_MODE) {
      window.addEventListener('hashchange', function(){
        _render(window.location.hash.slice(1) || 'dashboard');
      });
    }
    var route = resolveRoute(initialRoute || window.location.hash.slice(1) || 'dashboard');
    if (!FILE_MODE && window.location.hash.slice(1) !== route) {
      history.replaceState(null, '', '#' + route);
    }
    _render(route);
  }

  function current(){ return _current; }

  return {
    define: define,
    navigate: navigate,
    back: back,
    init: init,
    current: current,
    getPerf: function(){
      return JSON.parse(JSON.stringify(perfStore));
    }
  };
})();
