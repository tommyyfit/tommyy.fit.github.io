/* ================================================================
   HABIT CORRELATION HEATMAP v5.8
   30-day grid: habit columns × daily score rows
   Green = habit done on high-score day. SVG table — zero cost.
   ================================================================ */
TF.Screens['habit-heatmap'] = function (root) {
  'use strict';

  var DAYS = 30;

  function getDates(n) {
    var dates = [];
    for (var i = n - 1; i >= 0; i--) {
      var d = new Date();
      d.setDate(d.getDate() - i);
      var key = d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
      dates.push(key);
    }
    return dates;
  }

  function getHabitIds() {
    return TF.Config.DefaultHabits.map(function (h) { return h.id; });
  }

  function scoreColor(score) {
    if (score >= 74) return 'var(--lime)';
    if (score >= 52) return 'var(--blue)';
    if (score >= 36) return 'var(--amber)';
    return 'var(--red)';
  }

  /* Compute correlation: for each habit, what % of its "done" days
     were also high-score days (≥74)? */
  function computeCorrelations(dates, allInputs, allHabitsData) {
    var habits = TF.Config.DefaultHabits;
    return habits.map(function (h) {
      var doneDays = 0;
      var doneHighScore = 0;
      dates.forEach(function (key) {
        var inp  = allInputs[key];
        var hab  = allHabitsData[key] || {};
        if (hab[h.id]) {
          doneDays++;
          if (inp) {
            var score = TF.Score.daily(inp);
            if (score >= 74) doneHighScore++;
          }
        }
      });
      return {
        id: h.id,
        emoji: h.emoji,
        label: h.label,
        doneDays: doneDays,
        doneHighScore: doneHighScore,
        rate: doneDays > 0 ? doneHighScore / doneDays : 0
      };
    }).sort(function (a, b) { return b.rate - a.rate; });
  }

  function render() {
    var dates      = getDates(DAYS);
    var allInputs  = TF.Store.getAllInputs ? TF.Store.getAllInputs() : {};
    var allHabits  = TF.Store.getAllHabits ? TF.Store.getAllHabits() :
                     (function () {
                       try { return JSON.parse(localStorage.getItem('tf_habits') || '{}'); } catch (e) { return {}; }
                     })();
    var habits     = TF.Config.DefaultHabits;
    var corr       = computeCorrelations(dates, allInputs, allHabits);

    /* ── Heatmap grid ──────────────────────────────────────────── */
    /* For mobile: limit to top 8 habits */
    var visibleHabits = habits.slice(0, 8);

    var cellW = 26;
    var cellH = 22;
    var labelW = 48;
    var headerH = 86;
    var totalW = labelW + visibleHabits.length * cellW + 8;
    var totalH = headerH + dates.length * cellH + 8;

    var svgParts = ['<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ' + totalW + ' ' + totalH + '" style="font-family:var(--font-m)">'];

    /* Column headers (habit emojis rotated) */
    visibleHabits.forEach(function (h, ci) {
      var x = labelW + ci * cellW + cellW / 2;
      svgParts.push('<text x="' + x + '" y="' + (headerH - 6) + '" text-anchor="middle" font-size="14">' + h.emoji + '</text>');
    });

    /* Row: each date */
    dates.forEach(function (key, ri) {
      var y = headerH + ri * cellH;
      var inp   = allInputs[key];
      var score = inp ? TF.Score.daily(inp) : null;
      var sCol  = score !== null ? scoreColor(score) : 'transparent';

      /* Date label */
      var d = new Date(key + 'T12:00:00');
      var dayLabel = String(d.getDate()).padStart(2, ' ');
      var isFirst  = d.getDate() === 1;
      var monthLabel = isFirst ? d.toLocaleDateString('en-GB', { month: 'short' }) : '';
      svgParts.push(
        '<text x="' + (labelW - 6) + '" y="' + (y + cellH / 2 + 4) + '" text-anchor="end" font-size="9" fill="var(--txt-3)">' +
          (isFirst ? monthLabel : dayLabel) +
        '</text>'
      );

      /* Score dot */
      if (score !== null) {
        svgParts.push('<rect x="2" y="' + (y + 3) + '" width="' + (labelW - 10) + '" height="' + (cellH - 6) + '" rx="3" fill="' + sCol + '" opacity="0.25"/>');
        svgParts.push('<text x="' + ((labelW - 10) / 2 + 2) + '" y="' + (y + cellH / 2 + 4) + '" text-anchor="middle" font-size="8" fill="' + sCol + '" font-weight="700">' + score + '</text>');
      }

      /* Habit cells */
      var habDay = allHabits[key] || {};
      visibleHabits.forEach(function (h, ci) {
        var x   = labelW + ci * cellW;
        var done = !!habDay[h.id];
        var highScore = score !== null && score >= 74;
        var fill;
        if (done && highScore)   fill = 'var(--lime)';
        else if (done)           fill = 'var(--blue)';
        else                     fill = 'var(--bg-3)';
        var opacity = done ? (highScore ? '0.85' : '0.5') : '1';
        svgParts.push(
          '<rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="' + (cellW - 4) + '" height="' + (cellH - 4) + '" rx="4" fill="' + fill + '" opacity="' + opacity + '"/>'
        );
        if (done) {
          svgParts.push('<text x="' + (x + cellW / 2) + '" y="' + (y + cellH / 2 + 4) + '" text-anchor="middle" font-size="8" fill="var(--bg-1)" font-weight="700">✓</text>');
        }
      });
    });

    svgParts.push('</svg>');
    var heatmapSVG = svgParts.join('');

    /* ── Top habit correlations ranked ─────────────────────────── */
    var topCorrHTML = corr.slice(0, 5).map(function (c, i) {
      var pct = Math.round(c.rate * 100);
      var medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.';
      return '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">' +
        '<div style="width:28px;text-align:center;font-size:14px;flex-shrink:0">' + medal + '</div>' +
        '<div style="font-size:16px;flex-shrink:0">' + c.emoji + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + TF.UI.escapeHTML(c.label) + '</div>' +
          '<div class="t-hint">' + c.doneDays + ' days done · ' + c.doneHighScore + ' on high-score days</div>' +
        '</div>' +
        '<div style="font-family:var(--font-d);font-size:18px;font-weight:900;color:' + (pct >= 60 ? 'var(--lime)' : pct >= 30 ? 'var(--blue)' : 'var(--txt-3)') + '">' + pct + '%</div>' +
      '</div>';
    }).join('');

    /* ── Legend ─────────────────────────────────────────────────── */
    var legendHTML =
      '<div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:10px">' +
        '<div style="display:flex;align-items:center;gap:5px"><div style="width:14px;height:14px;border-radius:3px;background:var(--lime);opacity:.85"></div><span class="t-hint">Done + High score</span></div>' +
        '<div style="display:flex;align-items:center;gap:5px"><div style="width:14px;height:14px;border-radius:3px;background:var(--blue);opacity:.5"></div><span class="t-hint">Done (avg score)</span></div>' +
        '<div style="display:flex;align-items:center;gap:5px"><div style="width:14px;height:14px;border-radius:3px;background:var(--bg-3)"></div><span class="t-hint">Missed</span></div>' +
      '</div>';

    root.innerHTML = '<div class="screen">' +

      '<div class="t-headline" style="margin-bottom:4px">Habit Heatmap</div>' +
      '<div class="t-hint" style="margin-bottom:16px">30-day grid — green = habit done on a high-score day (≥74)</div>' +

      /* Heatmap */
      '<div class="card" style="overflow-x:auto;padding:12px;margin-bottom:14px">' +
        '<div style="min-width:' + (totalW) + 'px">' + heatmapSVG + '</div>' +
        legendHTML +
      '</div>' +

      /* Correlation ranking */
      '<div class="card" style="margin-bottom:14px">' +
        '<div class="t-label" style="margin-bottom:4px">Highest-leverage habits</div>' +
        '<div class="t-hint" style="margin-bottom:10px">% of times you did this habit that were also high-score days</div>' +
        topCorrHTML +
      '</div>' +

      /* Habit emoji key */
      '<div class="card card-sm">' +
        '<div class="t-label" style="margin-bottom:8px">Habit key (left → right)</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
          visibleHabits.map(function (h) {
            return '<div style="display:flex;align-items:center;gap:5px;background:var(--bg-3);border-radius:8px;padding:4px 8px">' +
              '<span>' + h.emoji + '</span><span class="t-hint" style="font-size:11px">' + TF.UI.escapeHTML(h.label) + '</span>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>' +

    '<div style="height:8px"></div></div>';
  }

  render();
};
