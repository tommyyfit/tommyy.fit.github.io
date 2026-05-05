/* ================================================================
   BODY METRICS SCREEN v5 - tommyy.fit
   Tab layout: Overview | Log | Progress charts per metric
   ================================================================ */
TF.Screens['body-metrics'] = function(root) {
  'use strict';

  var H = TF.BodyMetricsScreenHelpers;
  var METRICS = H.METRICS;
  var _tab = 'overview';
  var _activeMetric = METRICS[0].id;
  var _draft = {};

  function getRange(metric, value) {
    return H.getRange(metric, value);
  }

  function delta(cur, prev, lowerIsBetter) {
    return H.delta(cur, prev, lowerIsBetter);
  }

  function tabBar() {
    var tabs = [
      { id: 'overview', label: 'Overview', icon: 'bar-chart' },
      { id: 'log', label: 'Log', icon: 'plus' },
      { id: 'progress', label: 'Progress', icon: 'trending-up' }
    ];
    return '<div style="display:flex;gap:6px;margin-bottom:16px;background:var(--bg-3);border-radius:var(--r);padding:4px">' +
      tabs.map(function(tab) {
        var active = _tab === tab.id;
        return '<button class="bm-tab-btn" data-tab="' + tab.id + '" style="flex:1;border:none;cursor:pointer;border-radius:10px;padding:9px 4px;font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;transition:background .15s,color .15s;background:' + (active ? 'var(--bg-2)' : 'transparent') + ';color:' + (active ? 'var(--lime)' : 'var(--txt-3)') + ';box-shadow:' + (active ? 'var(--shadow-sm)' : 'none') + '">' +
          TF.Icon(tab.icon, 12) + ' ' + tab.label + '</button>';
      }).join('') +
    '</div>';
  }

  function latestSnapshot(log) {
    var latest = log.length ? log[0] : null;
    if (!latest) {
      return '<div class="empty-state-card">' +
        '<div class="empty-title">Body composition log</div>' +
        '<div class="empty-body">Log your first body metrics entry to unlock the overview cards, trend bands, and chart history.</div>' +
      '</div>';
    }
    return '<div class="card card-sm" style="margin-bottom:14px">' +
      '<div class="flex-between" style="margin-bottom:10px;gap:12px">' +
        '<div><div class="t-title">Latest scan</div><div class="t-hint">' + TF.UI.formatDate(latest.date) + '</div></div>' +
        '<div class="session-link-row">' +
          '<button class="btn btn-ghost btn-sm" id="bm-fill-last" type="button">Use last values</button>' +
          '<button class="btn btn-ghost btn-sm" id="bm-open-log" type="button">Log new</button>' +
        '</div>' +
      '</div>' +
      '<div class="finish-summary-inline">' +
        METRICS.slice(0, 4).map(function(metric) {
          return '<div class="finish-summary-pill">' +
            '<span>' + metric.label + '</span>' +
            '<strong>' + (latest[metric.id] != null ? latest[metric.id] + (metric.unit ? ' ' + metric.unit : '') : '-') + '</strong>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>';
  }

  function renderOverview(log) {
    var latest = log.length ? log[0] : {};
    var prev = log.length > 1 ? log[1] : {};
    var hasData = METRICS.some(function(metric) { return latest[metric.id] != null; });

    if (!hasData) {
      return '<div class="starter-guide">' +
        '<div class="starter-guide-kicker">FIRST BODY SCAN</div>' +
        '<div class="starter-guide-title">Start with one clean reading</div>' +
        '<div class="starter-guide-copy">Pull the values from your smart scale or app and log what you trust. Once one entry is saved, this screen unlocks the comparison cards and chart view.</div>' +
        '<div class="starter-guide-actions">' +
          '<button class="btn btn-primary btn-sm" id="bm-goto-log" type="button">Log now</button>' +
        '</div>' +
      '</div>';
    }

    return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">' +
      METRICS.map(function(metric) {
        var value = latest[metric.id];
        var range;
        var change;
        if (value == null) {
          return '';
        }
        range = getRange(metric, value);
        change = delta(value, prev[metric.id], metric.lowerIsBetter);
        return '<div style="background:var(--bg-2);border:1px solid var(--border);border-radius:var(--r);padding:14px 13px;cursor:pointer;transition:background .15s,border-color .15s" data-metric-goto="' + metric.id + '">' +
          '<div style="font-size:18px;margin-bottom:4px">' + metric.emoji + '</div>' +
          '<div style="font-family:var(--font-m);font-size:22px;font-weight:800;color:' + (range ? range.color : metric.color) + ';line-height:1.1">' +
            value + (metric.unit ? '<span style="font-size:11px;font-weight:400;margin-left:2px">' + metric.unit + '</span>' : '') + change +
          '</div>' +
          '<div style="font-size:11px;font-weight:600;color:var(--txt-3);margin-top:4px;text-transform:uppercase;letter-spacing:.5px">' + metric.label + '</div>' +
          (range ? '<div style="font-size:10px;color:' + range.color + ';font-weight:700;margin-top:2px">' + range.label + '</div>' : '') +
        '</div>';
      }).filter(Boolean).join('') +
    '</div>' +
    '<div class="t-hint" style="text-align:center;margin-bottom:16px">Last logged: ' + TF.UI.formatDate(latest.date) + ' - tap any tile to open its chart</div>' +
    '<div class="card">' +
      '<div class="t-label" style="margin-bottom:10px">What each metric means</div>' +
      METRICS.map(function(metric) {
        return '<div style="display:flex;gap:10px;align-items:flex-start;padding:7px 0;border-bottom:1px solid var(--border)">' +
          '<span style="font-size:16px;flex-shrink:0">' + metric.emoji + '</span>' +
          '<div><div style="font-size:12px;font-weight:600;color:' + metric.color + '">' + metric.label + (metric.unit ? ' (' + metric.unit + ')' : '') + '</div>' +
          '<div class="t-hint" style="font-size:11px">' + metric.desc + '</div></div>' +
        '</div>';
      }).join('') +
    '</div>';
  }

  function renderLog(log) {
    var latest = log.length ? log[0] : {};
    return '<div class="card" style="margin-bottom:14px">' +
      '<div class="t-title" style="margin-bottom:14px">' + TF.Icon('save', 14) + ' Log today\'s metrics</div>' +
      '<div class="session-link-row" style="margin-bottom:14px">' +
        '<button class="btn btn-ghost btn-sm" id="bm-fill-last-inline" type="button">Use last values</button>' +
        '<button class="btn btn-ghost btn-sm" id="bm-clear-draft" type="button">Clear form</button>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
        METRICS.map(function(metric) {
          return '<div class="field-group">' +
            '<div class="field-label" style="color:' + metric.color + '">' + metric.emoji + ' ' + metric.label + (metric.unit ? ' (' + metric.unit + ')' : '') + '</div>' +
            '<input class="field" id="bm-in-' + metric.id + '" type="number" value="' + (_draft[metric.id] != null ? _draft[metric.id] : '') + '" placeholder="' + (latest[metric.id] != null ? latest[metric.id] : '') + '" inputmode="decimal" step="' + metric.step + '" min="' + metric.min + '" max="' + metric.max + '" style="padding:10px 12px;font-family:var(--font-m)">' +
            '<div class="field-hint">' + metric.desc + (metric.ranges ? ' Tap progress to see healthy bands.' : '') + '</div>' +
          '</div>';
        }).join('') +
      '</div>' +
      '<button class="btn btn-primary" id="bm-btn-save" style="margin-top:14px">' + TF.Icon('save', 13) + ' Save metrics</button>' +
    '</div>' +
    (log.length
      ? '<div class="card">' +
          '<div class="t-label" style="margin-bottom:10px">Recent entries</div>' +
          log.slice(0, 8).map(function(entry, idx) {
            var logged = METRICS.filter(function(metric) { return entry[metric.id] != null; });
            var prev = log[idx + 1] || {};
            return '<div style="padding:10px 0;border-bottom:1px solid var(--border)">' +
              '<div style="font-size:12px;font-weight:700;color:var(--txt-2);margin-bottom:6px">' + TF.UI.formatDate(entry.date) + '</div>' +
              '<div style="display:flex;flex-wrap:wrap;gap:5px">' +
                logged.map(function(metric) {
                  return '<span style="font-size:11px;background:var(--bg-3);border:1px solid var(--border);border-radius:6px;padding:3px 8px;color:var(--txt-2)">' +
                    metric.emoji + ' <strong style="color:' + metric.color + '">' + entry[metric.id] + (metric.unit ? metric.unit : '') + '</strong>' + delta(entry[metric.id], prev[metric.id], metric.lowerIsBetter) + '</span>';
                }).join('') +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>'
      : '');
  }

  function renderProgress(log) {
    var metric = METRICS.find(function(item) { return item.id === _activeMetric; }) || METRICS[0];
    var entries = log.filter(function(entry) { return entry[metric.id] != null; }).slice().reverse();
    var hasData = entries.length > 0;
    var pills = '<div class="scroll-x" style="margin-bottom:14px;padding-bottom:4px">' +
      '<div style="display:flex;gap:6px;width:max-content">' +
        METRICS.map(function(item) {
          var active = _activeMetric === item.id;
          var hasEntries = log.some(function(entry) { return entry[item.id] != null; });
          return '<button class="bm-metric-pill" data-metric="' + item.id + '" style="border:1px solid ' + (active ? item.colorHex : 'var(--border)') + ';background:' + (active ? item.colorHex + '22' : 'var(--bg-3)') + ';color:' + (active ? item.color : 'var(--txt-3)') + ';border-radius:20px;padding:6px 13px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;opacity:' + (hasEntries ? '1' : '.4') + '">' +
            item.emoji + ' ' + item.label + '</button>';
        }).join('') +
      '</div>' +
    '</div>';

    if (!hasData) {
      return pills + '<div class="card" style="text-align:center;padding:28px">' +
        '<div style="font-size:32px;margin-bottom:10px">' + metric.emoji + '</div>' +
        '<div class="t-hint">No ' + metric.label + ' data yet. Log some entries first.</div>' +
      '</div>';
    }

    var values = entries.map(function(entry) { return entry[metric.id]; });
    var minVal = Math.min.apply(null, values);
    var maxVal = Math.max.apply(null, values);
    var latest = entries[entries.length - 1];
    var first = entries[0];
    var totalChange = parseFloat((latest[metric.id] - first[metric.id]).toFixed(2));
    var better = metric.lowerIsBetter ? totalChange < 0 : totalChange > 0;
    var changeCol = Math.abs(totalChange) < 0.01 ? 'var(--txt-3)' : better ? 'var(--lime)' : 'var(--red)';
    var range = getRange(metric, latest[metric.id]);
    var bestVal = metric.lowerIsBetter ? minVal : maxVal;

    var statsRow = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">' +
      [
        { label: 'Current', val: latest[metric.id] + (metric.unit ? ' ' + metric.unit : ''), col: range ? range.color : metric.color },
        { label: 'Best', val: bestVal + (metric.unit ? ' ' + metric.unit : ''), col: 'var(--lime)' },
        { label: 'Change', val: (totalChange > 0 ? '+' : '') + totalChange + (metric.unit ? ' ' + metric.unit : ''), col: changeCol }
      ].map(function(item) {
        return '<div class="stat-tile" style="text-align:center">' +
          '<div style="font-family:var(--font-m);font-size:16px;font-weight:800;color:' + item.col + '">' + item.val + '</div>' +
          '<div class="stat-label">' + item.label + '</div>' +
        '</div>';
      }).join('') +
    '</div>';

    var rangeBadge = range
      ? '<div style="margin-bottom:12px">' +
          '<span style="font-size:12px;font-weight:700;color:' + range.color + ';background:' + range.color + '22;border:1px solid ' + range.color + '44;border-radius:20px;padding:4px 12px">' + range.label + '</span>' +
          (metric.ranges ? '<span class="t-hint" style="font-size:10px;margin-left:8px">' + metric.ranges.map(function(item) { return item.label + ' <=' + item.max + (metric.unit ? metric.unit : ''); }).join(' | ') + '</span>' : '') +
        '</div>'
      : '';

    var tableRows = entries.slice().reverse().map(function(entry, index, arr) {
      var prev = arr[index + 1];
      var itemRange = getRange(metric, entry[metric.id]);
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">' +
        '<div style="font-size:12px;color:var(--txt-3)">' + TF.UI.formatDate(entry.date) + '</div>' +
        '<div style="display:flex;align-items:center;gap:8px">' +
          (itemRange ? '<span style="font-size:10px;color:' + itemRange.color + ';font-weight:600">' + itemRange.label + '</span>' : '') +
          '<div style="font-family:var(--font-m);font-size:14px;font-weight:700;color:' + (itemRange ? itemRange.color : metric.color) + '">' +
            entry[metric.id] + (metric.unit ? ' ' + metric.unit : '') + (prev ? delta(entry[metric.id], prev[metric.id], metric.lowerIsBetter) : '') +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    return pills + statsRow + rangeBadge +
      '<div class="card" style="margin-bottom:12px">' +
        '<div class="flex-between" style="margin-bottom:12px">' +
          '<div class="t-label">' + metric.emoji + ' ' + metric.label + ' over time</div>' +
          '<div class="t-hint" style="font-size:11px">' + entries.length + ' ' + (entries.length === 1 ? 'entry' : 'entries') + '</div>' +
        '</div>' +
        '<div style="height:200px"><canvas id="bm-chart-main"></canvas></div>' +
      '</div>' +
      '<div class="card"><div class="t-label" style="margin-bottom:8px">All entries</div>' + tableRows + '</div>';
  }


  /* ── v5.8 Body Scan CSV Import ──────────────────────────────── */
  function showCSVImportModal() {
    /* Column aliases: what DEXA/InBody might call each metric */
    var ALIASES = {
      bodyFatPct:   ['body fat %','body fat percentage','body fat','%bf','fat%','fat mass%'],
      muscleMassKg: ['lean mass','skeletal muscle mass','muscle mass','lean body mass','lbm','smm'],
      visceralFat:  ['visceral fat','visceral fat rating','vfr','visceral fat level'],
      bmi:          ['bmi','body mass index'],
      waterPct:     ['total body water','tbw%','water','water %'],
      boneMassKg:   ['bone mass','bone mineral content','bmc']
    };

    var modalHTML =
      '<div style="margin-bottom:12px">' +
        '<div class="t-hint" style="margin-bottom:8px">Paste CSV rows from your DEXA or InBody scan. First row should be headers. Supports: muscle mass, body fat %, visceral fat, BMI, water %, bone mass.</div>' +
        '<textarea id="bm-csv-input" class="field" rows="8" style="font-family:var(--font-m);font-size:11px;resize:vertical" placeholder="date,body fat %,lean mass,visceral fat rating&#10;2025-01-15,18.2,62.4,8"></textarea>' +
      '</div>' +
      '<div id="bm-csv-preview" style="display:none">' +
        '<div class="t-label" style="margin-bottom:6px">Preview</div>' +
        '<div id="bm-csv-preview-rows" style="font-size:12px;max-height:160px;overflow-y:auto"></div>' +
      '</div>';

    TF.UI.modal({
      icon: 'upload',
      title: 'Import Body Scan CSV',
      html: modalHTML,
      cancelText: 'Cancel',
      confirmText: 'Import',
      onOpen: function(card) {
        var ta = card.querySelector('#bm-csv-input');
        if (ta) {
          ta.addEventListener('input', function() {
            previewCSV(card, ALIASES, ta.value);
          });
        }
      },
      onConfirm: function() {
        var ta = document.querySelector('#bm-csv-input');
        if (!ta) return;
        var rows = parseCSV(ta.value, ALIASES);
        if (!rows.length) { TF.UI.toast('No valid rows found. Check headers.', 'error'); return; }
        rows.forEach(function(row) {
          if (TF.Store.addBodyMetricEntry) {
            TF.Store.addBodyMetricEntry(row);
          } else {
            /* Fallback: read/patch/write raw array */
            try {
              var arr = JSON.parse(localStorage.getItem('tf_body_metrics') || '[]');
              arr.unshift(row);
              arr.sort(function(a,b){ return b.date > a.date ? 1 : -1; });
              localStorage.setItem('tf_body_metrics', JSON.stringify(arr));
            } catch(e) {}
          }
        });
        TF.UI.toast(rows.length + ' scan' + (rows.length > 1 ? 's' : '') + ' imported successfully!', 'success');
        draw();
      }
    });
  }

  function parseCSV(raw, ALIASES) {
    var lines = raw.trim().split('\n').map(function(l){ return l.trim(); }).filter(Boolean);
    if (lines.length < 2) return [];
    var headers = lines[0].split(',').map(function(h){ return h.trim().toLowerCase().replace(/["\']/g,''); });
    var results = [];

    lines.slice(1).forEach(function(line) {
      var cells = line.split(',').map(function(c){ return c.trim().replace(/["\']/g,''); });
      var obj = {};

      /* Date column */
      var dateIdx = headers.findIndex(function(h){ return h === 'date' || h.includes('date'); });
      if (dateIdx < 0 || !cells[dateIdx]) return;
      var dateVal = cells[dateIdx];
      /* Normalise YYYY-MM-DD */
      if (/\d{4}-\d{2}-\d{2}/.test(dateVal)) { obj.date = dateVal; }
      else if (/\d{2}\/\d{2}\/\d{4}/.test(dateVal)) {
        var p = dateVal.split('/'); obj.date = p[2] + '-' + p[1] + '-' + p[0];
      } else { obj.date = dateVal; }

      /* Metric columns */
      Object.keys(ALIASES).forEach(function(metric) {
        var idx = headers.findIndex(function(h) {
          return ALIASES[metric].some(function(alias){ return h.includes(alias); });
        });
        if (idx >= 0 && cells[idx] !== '' && !isNaN(parseFloat(cells[idx]))) {
          obj[metric] = parseFloat(cells[idx]);
        }
      });

      if (Object.keys(obj).length > 1) results.push(obj);
    });
    return results;
  }

  function previewCSV(card, ALIASES, raw) {
    var preview = card.querySelector('#bm-csv-preview');
    var previewRows = card.querySelector('#bm-csv-preview-rows');
    if (!preview || !previewRows) return;
    var rows = parseCSV(raw, ALIASES);
    if (!rows.length) { preview.style.display = 'none'; return; }
    preview.style.display = 'block';
    previewRows.innerHTML = rows.slice(0,5).map(function(r) {
      return '<div style="padding:6px 0;border-bottom:1px solid var(--border)">' +
        '<strong>' + TF.UI.escapeHTML(r.date) + '</strong> — ' +
        Object.keys(r).filter(function(k){ return k !== 'date'; }).map(function(k) {
          return k + ': ' + r[k];
        }).join(' · ') +
      '</div>';
    }).join('');
  }

  function draw() {
    var log = TF.Store.getBodyMetrics();

    root.innerHTML = '<div class="screen">' +
      '<div class="hero-img-card hero-short" id="bm-hero">' +
        '<div class="skeleton" style="position:absolute;inset:0;border-radius:var(--r-lg)"></div>' +
        '<div class="hero-img-card-content">' +
          '<div class="t-label">BODY COMPOSITION</div>' +
          '<div class="t-headline">Metrics over time.<br>Not just bodyweight.</div>' +
          '<div class="t-hint">Smart-scale data, body composition, and trend bands.</div>' +
        '</div>' +
      '</div>' +
      latestSnapshot(log) +
      tabBar() +
      '<div style="margin-bottom:12px">' +
        '<button class="btn btn-ghost btn-sm" id="bm-csv-import-btn" type="button" style="width:auto;display:inline-flex;gap:6px;padding:7px 14px">' +
          TF.Icon('upload', 13) + ' Import body scan CSV (DEXA / InBody)' +
        '</button>' +
      '</div>' +
      '<div id="bm-tab-content">' +
        (_tab === 'overview' ? renderOverview(log) : _tab === 'log' ? renderLog(log) : renderProgress(log)) +
      '</div>' +
      '<div style="height:8px"></div></div>';

    /* ── v5.8 Body Scan CSV Import button ── */
    var csvImportBtn = root.querySelector('#bm-csv-import-btn');
    if (csvImportBtn) {
      csvImportBtn.addEventListener('click', function() { showCSVImportModal(); });
    }

    TF.UI.setHeroImg(root.querySelector('#bm-hero'), TF.Config.Images.progress);

    root.querySelectorAll('.bm-tab-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        _tab = btn.dataset.tab;
        draw();
      });
    });

    root.querySelectorAll('[data-metric-goto]').forEach(function(el) {
      el.addEventListener('click', function() {
        _activeMetric = el.dataset.metricGoto;
        _tab = 'progress';
        draw();
      });
    });

    var gotoLog = root.querySelector('#bm-goto-log');
    if (gotoLog) gotoLog.addEventListener('click', function() { _tab = 'log'; draw(); });
    var openLog = root.querySelector('#bm-open-log');
    if (openLog) openLog.addEventListener('click', function() { _tab = 'log'; draw(); });
    var fillLast = root.querySelector('#bm-fill-last');
    if (fillLast) fillLast.addEventListener('click', function() {
      var latest = log.length ? log[0] : null;
      if (!latest) return;
      METRICS.forEach(function(metric) {
        if (latest[metric.id] != null) {
          _draft[metric.id] = latest[metric.id];
        }
      });
      _tab = 'log';
      draw();
    });

    root.querySelectorAll('.bm-metric-pill').forEach(function(btn) {
      btn.addEventListener('click', function() {
        _activeMetric = btn.dataset.metric;
        draw();
      });
    });

    var saveBtn = root.querySelector('#bm-btn-save');
    if (saveBtn) {
      root.querySelectorAll('[id^="bm-in-"]').forEach(function(inputEl) {
        inputEl.addEventListener('input', function() {
          var metricId = inputEl.id.replace('bm-in-', '');
          _draft[metricId] = inputEl.value;
        });
      });
      var fillInline = root.querySelector('#bm-fill-last-inline');
      if (fillInline) {
        fillInline.addEventListener('click', function() {
          var latest = log.length ? log[0] : null;
          if (!latest) {
            TF.UI.toast('No previous entry yet.', 'error');
            return;
          }
          METRICS.forEach(function(metric) {
            _draft[metric.id] = latest[metric.id] != null ? latest[metric.id] : '';
          });
          draw();
        });
      }
      var clearDraftBtn = root.querySelector('#bm-clear-draft');
      if (clearDraftBtn) {
        clearDraftBtn.addEventListener('click', function() {
          _draft = {};
          draw();
        });
      }
      saveBtn.addEventListener('click', function() {
        var data = {};
        var hasAny = false;
        METRICS.forEach(function(metric) {
          var el = root.querySelector('#bm-in-' + metric.id);
          var value;
          if (!el) return;
          value = parseFloat(el.value);
          if (!isNaN(value) && value >= metric.min && value <= metric.max) {
            data[metric.id] = Math.round(value * 100) / 100;
            hasAny = true;
          }
        });
        if (!hasAny) {
          TF.UI.toast('Enter at least one metric.', 'error');
          return;
        }
        TF.Store.addBodyMetrics(data);
        TF.UI.haptic(60);
        TF.UI.toast('Body metrics saved!', 'success');
        _draft = {};
        _activeMetric = Object.keys(data)[0] || _activeMetric;
        _tab = 'progress';
        draw();
      });
    }

    if (_tab === 'progress') {
      var metric = METRICS.find(function(item) { return item.id === _activeMetric; }) || METRICS[0];
      var entries = log.filter(function(entry) { return entry[metric.id] != null; }).slice().reverse();
      if (entries.length >= 1) {
        setTimeout(function() { H.drawChart('bm-chart-main', entries, metric); }, 60);
      }
    }
  }

  draw();
};
