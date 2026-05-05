/* ================================================================
   TRENDS ENGINE v5.8 — Rolling 7-day averages + decline detection
   Pure JS math — no external analytics
   ================================================================ */
var TF = window.TF || {};
TF.Trends = (function () {
  'use strict';

  var METRIC_KEYS = {
    sleep:    function (inp) { return inp.sleepQuality  || null; },
    sleepHrs: function (inp) { return inp.sleepHours    || null; },
    energy:   function (inp) { return inp.energy        || null; },
    focus:    function (inp) { return inp.focus         || null; },
    stress:   function (inp) { return inp.stress        || null; }
  };

  var METRIC_LABELS = {
    sleep:    'Sleep quality',
    sleepHrs: 'Sleep hours',
    energy:   'Energy',
    focus:    'Focus',
    stress:   'Stress'
  };

  function avg(arr) {
    var vals = arr.filter(function (v) { return v !== null && v !== undefined && isFinite(v); });
    if (!vals.length) return null;
    return vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
  }

  /* Returns inputs newest-first */
  function getInputsSorted() {
    var all = TF.Store.getAllInputs ? TF.Store.getAllInputs() : {};
    return Object.keys(all).sort().reverse().map(function (k) {
      return Object.assign({}, all[k], { dateKey: k });
    });
  }

  /* Compute 7-day rolling average for every metric */
  function getRollingAverages(nDays) {
    nDays = nDays || 7;
    var inputs = getInputsSorted().slice(0, nDays).reverse();
    var result = {};
    Object.keys(METRIC_KEYS).forEach(function (m) {
      var vals = inputs.map(function (inp) { return METRIC_KEYS[m](inp); });
      result[m] = avg(vals);
    });
    return result;
  }

  /* Compare last 7 vs prior 7 days for each metric */
  function getTrends() {
    var inputs = getInputsSorted();
    var recent = inputs.slice(0, 7).reverse();
    var prior  = inputs.slice(7, 14).reverse();

    var trends = {};
    Object.keys(METRIC_KEYS).forEach(function (m) {
      var recentAvg = avg(recent.map(function (inp) { return METRIC_KEYS[m](inp); }));
      var priorAvg  = avg(prior.map(function (inp)  { return METRIC_KEYS[m](inp); }));
      if (recentAvg === null) return;
      var delta = priorAvg !== null ? recentAvg - priorAvg : null;
      /* Stress is inverse — higher = worse */
      var isInverse = m === 'stress';
      var declining = delta !== null ? (isInverse ? delta > 0.5 : delta < -0.5) : false;
      trends[m] = {
        label:   METRIC_LABELS[m],
        recent:  recentAvg,
        prior:   priorAvg,
        delta:   delta,
        inverse: isInverse,
        declining: declining
      };
    });
    return trends;
  }

  /* Returns array of declining metric labels */
  function getDecliningMetrics() {
    var trends = getTrends();
    return Object.keys(trends)
      .filter(function (m) { return trends[m].declining; })
      .map(function (m) { return { metric: m, label: trends[m].label, delta: trends[m].delta, recent: trends[m].recent }; });
  }

  /* Per-metric history array for sparklines / charts */
  function getMetricHistory(metric, n) {
    n = n || 30;
    var inputs = getInputsSorted().slice(0, n).reverse();
    return inputs.map(function (inp) {
      var val = METRIC_KEYS[metric] ? METRIC_KEYS[metric](inp) : null;
      return { date: inp.dateKey, value: val };
    }).filter(function (d) { return d.value !== null; });
  }

  /* Mini SVG sparkline for a metric — used in dashboard trend badges */
  function sparkSVG(metric, n, width, height) {
    n = n || 14;
    width = width || 80;
    height = height || 28;
    var data = getMetricHistory(metric, n);
    if (data.length < 2) return '';
    var vals = data.map(function (d) { return d.value; });
    var min  = Math.min.apply(null, vals);
    var max  = Math.max.apply(null, vals);
    var range = max - min || 1;
    var pad = 3;
    var points = vals.map(function (v, i) {
      var x = pad + (i / (vals.length - 1)) * (width - pad * 2);
      var y = height - pad - ((v - min) / range) * (height - pad * 2);
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    var trend = getTrends()[metric];
    var color = trend && trend.declining ? 'var(--red)' : 'var(--lime)';
    return '<svg width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">' +
      '<polyline fill="none" stroke="' + color + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" points="' + points + '"/>' +
    '</svg>';
  }

  return {
    getTrends: getTrends,
    getDecliningMetrics: getDecliningMetrics,
    getMetricHistory: getMetricHistory,
    getRollingAverages: getRollingAverages,
    sparkSVG: sparkSVG,
    METRIC_LABELS: METRIC_LABELS
  };
})();
