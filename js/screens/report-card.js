/* ================================================================
   MONTHLY REPORT CARD v5.8
   Auto-generated on 1st of each month (or on-demand).
   Covers: workouts, nutrition avg, habits, score.
   PNG export via html2canvas (CDN). Share to Instagram/WhatsApp.
   ================================================================ */
TF.Screens['report-card'] = function (root) {
  'use strict';

  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function getMonthOptions() {
    /* Build list of months we have data for, up to last 6 */
    var all = TF.Store.getAllInputs ? TF.Store.getAllInputs() : {};
    var keys = Object.keys(all).sort().reverse();
    var seen = {};
    keys.forEach(function (k) {
      var m = k.slice(0, 7); // "YYYY-MM"
      seen[m] = true;
    });
    var now = new Date();
    /* Always include current month */
    var cur = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    seen[cur] = true;
    return Object.keys(seen).sort().reverse().slice(0, 6);
  }

  var state = {
    month: (function () {
      var n = new Date();
      return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0');
    })()
  };

  function monthLabel(ym) {
    var parts = ym.split('-');
    return MONTHS[parseInt(parts[1], 10) - 1] + ' ' + parts[0];
  }

  function getDatesInMonth(ym) {
    var parts = ym.split('-');
    var year  = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10) - 1;
    var days  = new Date(year, month + 1, 0).getDate();
    var dates = [];
    for (var d = 1; d <= days; d++) {
      dates.push(ym + '-' + String(d).padStart(2, '0'));
    }
    return dates;
  }

  function computeReport(ym) {
    var dates      = getDatesInMonth(ym);
    var allInputs  = TF.Store.getAllInputs ? TF.Store.getAllInputs() : {};
    var allNutrition = TF.Store.getAllNutrition ? TF.Store.getAllNutrition() : {};
    var allWorkouts  = TF.Store.getAllWorkoutLogs ? TF.Store.getAllWorkoutLogs() : {};
    var allHabits    = TF.Store.getAllHabits ? TF.Store.getAllHabits() :
      (function () { try { return JSON.parse(localStorage.getItem('tf_habits') || '{}'); } catch (e) { return {}; } })();

    var checkinDays   = 0;
    var scoreSum      = 0;
    var scoreCount    = 0;
    var workoutDays   = 0;
    var caloriesSum   = 0;
    var caloriesCount = 0;
    var proteinSum    = 0;
    var proteinCount  = 0;
    var bestScore     = 0;
    var bestScoreDate = null;
    var totalHabitDone = 0;
    var totalHabitPossible = 0;
    var habitCounts = {};
    TF.Config.DefaultHabits.forEach(function (h) { habitCounts[h.id] = 0; });

    dates.forEach(function (key) {
      var inp  = allInputs[key];
      var nutr = allNutrition[key];
      var wlog = allWorkouts[key];
      var hab  = allHabits[key] || {};

      if (inp) {
        checkinDays++;
        var s = TF.Score.daily(inp);
        scoreSum += s;
        scoreCount++;
        if (s > bestScore) { bestScore = s; bestScoreDate = key; }
      }

      if (wlog && wlog.exercises && Object.keys(wlog.exercises).length) {
        workoutDays++;
      }

      if (nutr && nutr.calories) {
        caloriesSum += nutr.calories;
        caloriesCount++;
      }
      if (nutr && nutr.protein) {
        proteinSum += nutr.protein;
        proteinCount++;
      }

      TF.Config.DefaultHabits.forEach(function (h) {
        totalHabitPossible++;
        if (hab[h.id]) {
          totalHabitDone++;
          habitCounts[h.id]++;
        }
      });
    });

    var avgScore   = scoreCount > 0 ? Math.round(scoreSum / scoreCount) : null;
    var avgCal     = caloriesCount > 0 ? Math.round(caloriesSum / caloriesCount) : null;
    var avgProtein = proteinCount > 0 ? Math.round(proteinSum / proteinCount) : null;
    var habitRate  = totalHabitPossible > 0 ? Math.round((totalHabitDone / totalHabitPossible) * 100) : 0;
    var daysInMonth = dates.length;

    /* Top habit of the month */
    var topHabit = TF.Config.DefaultHabits.map(function (h) {
      return { id: h.id, emoji: h.emoji, label: h.label, count: habitCounts[h.id] };
    }).sort(function (a, b) { return b.count - a.count; })[0];

    var profile = TF.Store.getProfile();

    /* Grade */
    function getGrade(score) {
      if (score === null) return '—';
      if (score >= 80) return 'A+';
      if (score >= 70) return 'A';
      if (score >= 62) return 'B+';
      if (score >= 54) return 'B';
      if (score >= 46) return 'C+';
      if (score >= 38) return 'C';
      return 'D';
    }

    return {
      ym: ym, label: monthLabel(ym), daysInMonth: daysInMonth,
      checkinDays: checkinDays, workoutDays: workoutDays,
      avgScore: avgScore, bestScore: bestScore, bestScoreDate: bestScoreDate,
      avgCal: avgCal, avgProtein: avgProtein,
      habitRate: habitRate, topHabit: topHabit,
      grade: getGrade(avgScore),
      profileName: profile ? profile.name : 'Warrior'
    };
  }

  function gradeColor(grade) {
    if (grade.startsWith('A')) return 'var(--lime)';
    if (grade.startsWith('B')) return 'var(--blue)';
    if (grade.startsWith('C')) return 'var(--amber)';
    return 'var(--red)';
  }

  function statCard(label, val, unit, color) {
    return '<div style="background:var(--bg-2);border:1px solid var(--border);border-radius:var(--r-lg);padding:14px;text-align:center">' +
      '<div style="font-family:var(--font-d);font-size:26px;font-weight:900;color:' + (color || 'var(--txt-1)') + '">' + (val !== null ? val : '—') + (unit ? '<span style="font-size:14px;color:var(--txt-3)">' + unit + '</span>' : '') + '</div>' +
      '<div class="t-hint" style="margin-top:3px;font-size:11px">' + label + '</div>' +
    '</div>';
  }

  function formatDate(key) {
    if (!key) return '';
    try {
      var d = new Date(key + 'T12:00:00');
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch (e) { return key; }
  }

  /* ── Card HTML for export/share ── */
  function buildShareCard(report) {
    var gc = gradeColor(report.grade);
    return '<div id="rc-export-card" style="' +
      'width:400px;padding:28px;background:var(--bg-1);border-radius:20px;' +
      'border:2px solid var(--border);font-family:var(--font-d);">' +

      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">' +
        '<div>' +
          '<div style="font-size:11px;letter-spacing:2px;color:var(--txt-3);text-transform:uppercase;margin-bottom:4px">Monthly Report Card</div>' +
          '<div style="font-size:24px;font-weight:900;letter-spacing:1px">' + report.label + '</div>' +
          '<div style="font-size:12px;color:var(--txt-3);margin-top:2px">' + report.profileName + ' · TOMMYY.FIT</div>' +
        '</div>' +
        '<div style="font-size:52px;font-weight:900;color:' + gc + ';line-height:1">' + report.grade + '</div>' +
      '</div>' +

      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;margin-bottom:20px">' +
        '<div style="background:var(--bg-2);border-radius:12px;padding:12px;text-align:center">' +
          '<div style="font-size:22px;font-weight:900;color:var(--lime)">' + report.workoutDays + '</div>' +
          '<div style="font-size:10px;color:var(--txt-3);margin-top:2px">Workouts</div>' +
        '</div>' +
        '<div style="background:var(--bg-2);border-radius:12px;padding:12px;text-align:center">' +
          '<div style="font-size:22px;font-weight:900;color:var(--blue)">' + (report.avgScore !== null ? report.avgScore : '—') + '</div>' +
          '<div style="font-size:10px;color:var(--txt-3);margin-top:2px">Avg Score</div>' +
        '</div>' +
        '<div style="background:var(--bg-2);border-radius:12px;padding:12px;text-align:center">' +
          '<div style="font-size:22px;font-weight:900;color:var(--amber)">' + report.habitRate + '%</div>' +
          '<div style="font-size:10px;color:var(--txt-3);margin-top:2px">Habit Rate</div>' +
        '</div>' +
        '<div style="background:var(--bg-2);border-radius:12px;padding:12px;text-align:center">' +
          '<div style="font-size:22px;font-weight:900;color:var(--teal)">' + (report.avgProtein !== null ? report.avgProtein + 'g' : '—') + '</div>' +
          '<div style="font-size:10px;color:var(--txt-3);margin-top:2px">Avg Protein</div>' +
        '</div>' +
      '</div>' +

      (report.topHabit ? '<div style="background:var(--lime-dim);border:1px solid var(--lime)44;border-radius:12px;padding:10px 14px;display:flex;align-items:center;gap:10px;margin-bottom:14px">' +
        '<span style="font-size:22px">' + report.topHabit.emoji + '</span>' +
        '<div>' +
          '<div style="font-size:10px;color:var(--txt-3);text-transform:uppercase;letter-spacing:.8px">Top habit</div>' +
          '<div style="font-weight:700;font-size:13px">' + TF.UI.escapeHTML(report.topHabit.label) + ' — ' + report.topHabit.count + ' days</div>' +
        '</div>' +
      '</div>' : '') +

      '<div style="font-size:10px;color:var(--txt-3);text-align:center;margin-top:4px">' +
        report.checkinDays + '/' + report.daysInMonth + ' check-ins · Best score: ' + report.bestScore + (report.bestScoreDate ? ' on ' + formatDate(report.bestScoreDate) : '') +
      '</div>' +
    '</div>';
  }

  function exportPNG(report) {
    if (typeof html2canvas === 'undefined') {
      TF.UI.toast('html2canvas not loaded yet. Try again in a moment.', 'error');
      return;
    }
    var card = document.getElementById('rc-export-card');
    if (!card) { TF.UI.toast('Card not found', 'error'); return; }
    TF.UI.toast('Generating PNG…');
    html2canvas(card, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false
    }).then(function (canvas) {
      canvas.toBlob(function (blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'tommyy-fit-' + report.ym + '.png';
        a.click();
        setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
        TF.UI.toast('PNG saved! Open your Downloads to share.', 'success');
      }, 'image/png');
    }).catch(function (err) {
      TF.UI.toast('Export failed: ' + err.message, 'error');
    });
  }

  function render() {
    var options = getMonthOptions();
    var report  = computeReport(state.month);
    var gc      = gradeColor(report.grade);

    root.innerHTML = '<div class="screen">' +

      '<div class="t-headline" style="margin-bottom:4px">Report Card</div>' +
      '<div class="t-hint" style="margin-bottom:16px">Auto-generated monthly performance summary</div>' +

      /* Month picker */
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px" id="rc-month-picker">' +
        options.map(function (ym) {
          var active = ym === state.month;
          return '<button class="toggle-chip' + (active ? ' on' : '') + '" data-ym="' + ym + '" type="button" style="width:auto;padding:6px 14px;font-size:12px">' +
            monthLabel(ym) +
          '</button>';
        }).join('') +
      '</div>' +

      /* Grade hero */
      '<div class="card" style="text-align:center;margin-bottom:14px;padding:24px;border-color:' + gc + '44">' +
        '<div style="font-size:11px;letter-spacing:2px;color:var(--txt-3);margin-bottom:8px;text-transform:uppercase">' + report.label + ' · Monthly Grade</div>' +
        '<div style="font-family:var(--font-d);font-size:80px;font-weight:900;color:' + gc + ';line-height:1;margin-bottom:8px">' + report.grade + '</div>' +
        '<div class="t-hint">Based on avg score of ' + (report.avgScore !== null ? report.avgScore : '—') + ' across ' + report.checkinDays + ' check-in days</div>' +
      '</div>' +

      /* Stats grid */
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">' +
        statCard('Workouts', report.workoutDays, '', 'var(--lime)') +
        statCard('Avg Daily Score', report.avgScore, '', 'var(--blue)') +
        statCard('Habit Rate', report.habitRate, '%', 'var(--amber)') +
        statCard('Avg Calories', report.avgCal, ' kcal', 'var(--orange)') +
        statCard('Avg Protein', report.avgProtein, 'g', 'var(--teal)') +
        statCard('Best Score', report.bestScore || '—', '', 'var(--purple)') +
      '</div>' +

      /* Top habit */
      (report.topHabit ? '<div class="card card-sm" style="margin-bottom:14px;display:flex;align-items:center;gap:12px;border-color:var(--lime)44">' +
        '<span style="font-size:28px">' + report.topHabit.emoji + '</span>' +
        '<div>' +
          '<div class="t-label" style="margin-bottom:2px">Top habit this month</div>' +
          '<div style="font-weight:700">' + TF.UI.escapeHTML(report.topHabit.label) + '</div>' +
          '<div class="t-hint">Done on ' + report.topHabit.count + ' / ' + report.daysInMonth + ' days</div>' +
        '</div>' +
      '</div>' : '') +

      /* Share card */
      '<div class="card" style="margin-bottom:14px">' +
        '<div class="t-label" style="margin-bottom:12px">Share card</div>' +
        buildShareCard(report) +
        '<div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">' +
          '<button class="btn btn-primary" id="rc-export-png" type="button" style="flex:1">' + TF.Icon('download', 14) + ' Save as PNG</button>' +
          '<button class="btn btn-secondary" id="rc-copy-text" type="button" style="flex:1">' + TF.Icon('copy', 14) + ' Copy summary</button>' +
        '</div>' +
      '</div>' +

    '<div style="height:8px"></div></div>';

    /* Month picker */
    root.querySelectorAll('#rc-month-picker .toggle-chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.month = btn.dataset.ym;
        render();
      });
    });

    /* Export PNG */
    root.querySelector('#rc-export-png').addEventListener('click', function () {
      exportPNG(report);
    });

    /* Copy text summary */
    root.querySelector('#rc-copy-text').addEventListener('click', function () {
      var text = [
        'TOMMYY.FIT — ' + report.label + ' Report Card',
        'Grade: ' + report.grade,
        'Check-ins: ' + report.checkinDays + '/' + report.daysInMonth,
        'Workouts: ' + report.workoutDays,
        'Avg score: ' + (report.avgScore !== null ? report.avgScore : '—'),
        'Habit rate: ' + report.habitRate + '%',
        'Avg calories: ' + (report.avgCal !== null ? report.avgCal + ' kcal' : '—'),
        'Avg protein: ' + (report.avgProtein !== null ? report.avgProtein + 'g' : '—'),
        report.topHabit ? 'Top habit: ' + report.topHabit.label + ' (' + report.topHabit.count + ' days)' : '',
        '#tommyyfit #fitness #discipline'
      ].filter(Boolean).join('\n');

      TF.UI.copyText(text).then(function () {
        TF.UI.toast('Summary copied — paste into Instagram, WhatsApp, or anywhere!', 'success');
      }).catch(function () {
        TF.UI.toast('Copy failed — try long-pressing the text.', 'error');
      });
    });
  }

  render();
};
