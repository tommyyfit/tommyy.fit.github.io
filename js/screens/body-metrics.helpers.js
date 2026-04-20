TF.BodyMetricsScreenHelpers = (function() {
  'use strict';

  var METRICS = [
    {
      id: 'bodyFat', label: 'Body Fat', unit: '%', emoji: '🔥',
      color: 'var(--red)', colorHex: '#FF5050',
      min: 3, max: 60, step: 0.1,
      desc: 'The total mass of fat divided by total body mass.',
      lowerIsBetter: true,
      ranges: [
        { label: 'Essential', max: 6, color: 'var(--blue)' },
        { label: 'Athletic', max: 14, color: 'var(--lime)' },
        { label: 'Fitness', max: 20, color: 'var(--teal)' },
        { label: 'Average', max: 25, color: 'var(--amber)' },
        { label: 'High', max: 60, color: 'var(--red)' }
      ]
    },
    {
      id: 'muscleMass', label: 'Muscle Mass', unit: 'kg', emoji: '💪',
      color: 'var(--lime)', colorHex: '#C8FF00',
      min: 10, max: 120, step: 0.1,
      desc: 'The weight of the muscles in your body.',
      lowerIsBetter: false
    },
    {
      id: 'bmi', label: 'BMI', unit: '', emoji: '📊',
      color: 'var(--blue)', colorHex: '#4DBFF5',
      min: 10, max: 50, step: 0.1,
      desc: 'A value derived from mass and height.',
      lowerIsBetter: true,
      ranges: [
        { label: 'Underweight', max: 18.5, color: 'var(--blue)' },
        { label: 'Normal', max: 25, color: 'var(--lime)' },
        { label: 'Overweight', max: 30, color: 'var(--amber)' },
        { label: 'Obese', max: 50, color: 'var(--red)' }
      ]
    },
    {
      id: 'visceralFat', label: 'Visceral Fat', unit: '', emoji: '⚠️',
      color: 'var(--amber)', colorHex: '#FFB830',
      min: 1, max: 30, step: 1,
      desc: 'Fat stored around internal organs. Scale: 1-12 healthy.',
      lowerIsBetter: true,
      ranges: [
        { label: 'Healthy', max: 12, color: 'var(--lime)' },
        { label: 'High', max: 30, color: 'var(--red)' }
      ]
    },
    {
      id: 'bodyWater', label: 'Body Water', unit: '%', emoji: '💧',
      color: 'var(--teal)', colorHex: '#38D4BC',
      min: 30, max: 80, step: 0.1,
      desc: 'Total fluid in the body as a percentage of weight.',
      lowerIsBetter: false,
      ranges: [
        { label: 'Low', max: 50, color: 'var(--amber)' },
        { label: 'Normal', max: 65, color: 'var(--lime)' },
        { label: 'High', max: 80, color: 'var(--blue)' }
      ]
    },
    {
      id: 'boneMass', label: 'Bone Mass', unit: 'kg', emoji: '🦴',
      color: 'var(--purple)', colorHex: '#B29EFF',
      min: 0.5, max: 8, step: 0.1,
      desc: 'Estimated weight of bone mineral in your body.',
      lowerIsBetter: false
    },
    {
      id: 'bmr', label: 'BMR', unit: 'kcal', emoji: '⚡',
      color: 'var(--orange)', colorHex: '#FF8830',
      min: 800, max: 5000, step: 1,
      desc: 'Calories your body burns at complete rest.',
      lowerIsBetter: false
    },
    {
      id: 'leanMass', label: 'Lean Body Mass', unit: 'kg', emoji: '🏋️',
      color: 'var(--green)', colorHex: '#46DC78',
      min: 10, max: 120, step: 0.1,
      desc: 'Total body weight minus fat mass.',
      lowerIsBetter: false
    }
  ];

  function getRange(metric, value) {
    if (!metric.ranges || value == null) return null;
    for (var i = 0; i < metric.ranges.length; i++) {
      if (value <= metric.ranges[i].max) return metric.ranges[i];
    }
    return metric.ranges[metric.ranges.length - 1];
  }

  function delta(cur, prev, lowerIsBetter) {
    if (cur == null || prev == null) return '';
    var d = parseFloat((cur - prev).toFixed(2));
    if (Math.abs(d) < 0.01) return '<span style="color:var(--txt-3);font-size:11px"> =</span>';
    var better = lowerIsBetter ? d < 0 : d > 0;
    var col = better ? 'var(--lime)' : 'var(--red)';
    return '<span style="color:' + col + ';font-size:11px;font-weight:700"> ' + (d > 0 ? '+' : '') + d + '</span>';
  }

  function cssVal(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function drawChart(canvasId, entries, metric) {
    function render() {
      var canvas = document.getElementById(canvasId);
      if (!canvas || typeof Chart === 'undefined') return;

      if (Chart.getChart) {
        var existing = Chart.getChart(canvas);
        if (existing) existing.destroy();
      }

      var labels = entries.map(function(entry) { return TF.UI.formatDate(entry.date); });
      var data = entries.map(function(entry) { return entry[metric.id]; });
      var hex = metric.colorHex || '#C8FF00';
      var bg2 = cssVal('--bg-2') || '#15151C';
      var border = cssVal('--border') || '#22222E';
      var txt3 = cssVal('--txt-3') || '#8B92AC';
      var grid = document.documentElement.getAttribute('data-theme') === 'light'
        ? 'rgba(15,15,26,.08)'
        : 'rgba(255,255,255,.06)';
      var pointColors = data.map(function(value) {
        var range = getRange(metric, value);
        if (!range) return hex;
        var name = range.color.replace(/var\(--/, '').replace(/\)/, '');
        return cssVal('--' + name) || hex;
      });
      var ctx = canvas.getContext('2d');
      var grad = ctx.createLinearGradient(0, 0, 0, 200);
      grad.addColorStop(0, hex + '55');
      grad.addColorStop(1, hex + '08');

      new Chart(canvas, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            borderColor: hex,
            backgroundColor: grad,
            borderWidth: 2.5,
            pointBackgroundColor: pointColors,
            pointBorderColor: 'transparent',
            pointRadius: entries.length <= 12 ? 5 : 3,
            pointHoverRadius: 7,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: bg2,
              borderColor: border,
              borderWidth: 1,
              titleColor: '#ffffff',
              bodyColor: hex,
              padding: 10,
              callbacks: {
                label: function(ctx) {
                  return ' ' + ctx.parsed.y + (metric.unit ? ' ' + metric.unit : '');
                }
              }
            }
          },
          scales: {
            x: {
              grid: { color: grid },
              ticks: { color: txt3, font: { family: "'JetBrains Mono'", size: 10 }, maxTicksLimit: 7, maxRotation: 30 }
            },
            y: {
              grid: { color: grid },
              border: { display: false },
              ticks: {
                color: txt3,
                font: { family: "'JetBrains Mono'", size: 10 },
                callback: function(v) { return v + (metric.unit ? metric.unit : ''); }
              }
            }
          },
          animation: { duration: 500, easing: 'easeOutQuart' }
        }
      });
    }

    if (typeof Chart !== 'undefined') {
      render();
      return;
    }

    var dummy = document.createElement('canvas');
    dummy.id = '_bm_init_';
    dummy.style.display = 'none';
    document.body.appendChild(dummy);
    TF.Charts.measurementLine('_bm_init_', [{ date: '2000-01-01', v: 0 }, { date: '2000-01-02', v: 1 }], 'v', '#000');
    var tries = 0;
    var poll = setInterval(function() {
      tries += 1;
      if (typeof Chart !== 'undefined') {
        clearInterval(poll);
        var el = document.getElementById('_bm_init_');
        if (el) el.parentNode.removeChild(el);
        render();
      } else if (tries > 60) {
        clearInterval(poll);
      }
    }, 100);
  }

  return {
    METRICS: METRICS,
    delta: delta,
    drawChart: drawChart,
    getRange: getRange
  };
})();
