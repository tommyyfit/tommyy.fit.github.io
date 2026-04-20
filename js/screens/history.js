TF.Screens.history = function(root) {
  'use strict';

  var today = TF.Store.todayKey();
  var viewDate = new Date();
  var selectedDate = today;
  var selectedExercise = getExerciseNames()[0] || '';

  function getExerciseNames() {
    var names = {};
    Object.keys(TF.Store.getAllWorkoutLogs()).forEach(function(dateKey) {
      var session = TF.Store.getWorkoutDay(dateKey);
      Object.keys(session.exercises || {}).forEach(function(name) {
        names[name] = true;
      });
    });
    return Object.keys(names).sort();
  }

  function buildCalendar(year, month) {
    var workoutDates = TF.Store.getWorkoutDates();
    var inputDates = Object.keys(TF.Store.getAllInputs());
    var firstDay = new Date(year, month, 1);
    var lastDay = new Date(year, month + 1, 0);
    var startDow = firstDay.getDay();
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var dows = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    var html = '<div style="font-family:var(--font-d);font-size:20px;font-weight:800;text-align:center;margin-bottom:12px;letter-spacing:1px">' + months[month] + ' ' + year + '</div>';
    html += '<div class="calendar-grid">' + dows.map(function(day) {
      return '<div class="cal-header">' + day + '</div>';
    }).join('') + '</div>';
    html += '<div class="calendar-grid">';
    for (var i = 0; i < startDow; i += 1) {
      html += '<div class="cal-day empty"></div>';
    }
    for (var date = 1; date <= lastDay.getDate(); date += 1) {
      var key = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(date).padStart(2, '0');
      var hasWorkout = workoutDates.indexOf(key) >= 0;
      var hasInput = inputDates.indexOf(key) >= 0;
      var classes = 'cal-day' + (hasWorkout && hasInput ? ' both' : hasWorkout ? ' has-workout' : hasInput ? ' has-checkin' : '');
      if (key === today) classes += ' today';
      if (key === selectedDate) classes += ' selected';
      html += '<button class="' + classes + '" type="button" data-date="' + key + '">' + date + '</button>';
    }
    html += '</div>';
    html += '<div style="display:flex;gap:14px;justify-content:center;margin-top:12px">' +
      '<div style="display:flex;align-items:center;gap:5px"><div style="width:10px;height:10px;border-radius:3px;background:var(--lime-dim);border:1px solid var(--lime)"></div><span class="t-hint">Workout</span></div>' +
      '<div style="display:flex;align-items:center;gap:5px"><div style="width:10px;height:10px;border-radius:3px;background:var(--blue-dim);border:1px solid var(--blue)"></div><span class="t-hint">Check-in</span></div>' +
      '<div style="display:flex;align-items:center;gap:5px"><div style="width:10px;height:10px;border-radius:3px;background:linear-gradient(135deg,var(--lime-dim),var(--blue-dim));border:1px solid var(--lime)"></div><span class="t-hint">Both</span></div>' +
    '</div>';
    return html;
  }

  function getWorkingSets(sets) {
    return (sets || []).filter(function(set) {
      return set.type !== 'warmup';
    });
  }

  function getWarmupSets(sets) {
    return (sets || []).filter(function(set) {
      return set.type === 'warmup';
    });
  }

  function getAverageRpe(sets) {
    var values = getWorkingSets(sets).map(function(set) {
      return parseFloat(set.rpe);
    }).filter(function(value) {
      return isFinite(value);
    });
    if (!values.length) {
      return null;
    }
    return (values.reduce(function(sum, value) { return sum + value; }, 0) / values.length).toFixed(1);
  }

  function bestWorkingSet(sets) {
    var completed = getWorkingSets(sets).filter(function(set) {
      return set.done && set.weight;
    });
    if (!completed.length) {
      return null;
    }
    return completed.sort(function(a, b) {
      return (parseFloat(b.weight) || 0) - (parseFloat(a.weight) || 0);
    })[0];
  }

  function selectedDaySummary() {
    var input = TF.Store.getInputForDate(selectedDate);
    var workout = TF.Store.getWorkoutDay(selectedDate);
    var exerciseNames = Object.keys(workout.exercises || {});
    if (!input && !exerciseNames.length) {
      return '<div class="card card-sm t-hint" style="text-align:center">No check-in or workout logged for ' + TF.UI.formatDate(selectedDate) + '.</div>';
    }

    var blocks = [];
    if (input) {
      blocks.push(
        '<div class="card card-sm" style="margin-bottom:' + (exerciseNames.length ? '10px' : '0') + '">' +
          '<div class="flex-between" style="margin-bottom:8px">' +
            '<div><div class="t-title">' + TF.UI.formatDate(selectedDate) + '</div><div class="t-hint">Daily check-in logged</div></div>' +
            '<span class="chip chip-lime">' + TF.Score.daily(input) + '/100</span>' +
          '</div>' +
          '<div class="t-hint">Sleep ' + input.sleepQuality + '/10 . ' + input.sleepHours + 'h . Energy ' + input.energy + '/10 . Focus ' + input.focus + '/10</div>' +
        '</div>'
      );
    }

    if (exerciseNames.length) {
      var totalWorking = exerciseNames.reduce(function(sum, name) {
        return sum + getWorkingSets(workout.exercises[name]).length;
      }, 0);
      var doneWorking = exerciseNames.reduce(function(sum, name) {
        return sum + getWorkingSets(workout.exercises[name]).filter(function(set) { return set.done; }).length;
      }, 0);

      blocks.push(
        '<div class="card card-sm">' +
          '<div class="flex-between" style="margin-bottom:8px">' +
            '<div>' +
              '<div class="t-title">' + TF.UI.escapeHTML(workout.workoutName || 'Workout session') + '</div>' +
              '<div class="t-hint">' + exerciseNames.length + ' exercises . ' + doneWorking + '/' + totalWorking + ' working sets done</div>' +
            '</div>' +
            '<div style="text-align:right">' +
              (workout.bodyweightKg ? '<div class="chip chip-lime" style="margin-bottom:4px">' + workout.bodyweightKg + ' kg BW</div>' : '') +
              '<span class="chip chip-blue">' + doneWorking + '/' + totalWorking + '</span>' +
            '</div>' +
          '</div>' +
          (workout.notes ? '<div class="session-note-bubble">' + TF.UI.escapeHTML(workout.notes) + '</div>' : '') +
          exerciseNames.map(function(name) {
            var sets = workout.exercises[name] || [];
            var best = bestWorkingSet(sets);
            var avgRpe = getAverageRpe(sets);
            return '<div class="history-exercise-line">' +
              '<div>' +
                '<div style="font-size:13px;font-weight:700;color:var(--txt)">' + TF.UI.escapeHTML(name) + '</div>' +
                '<div class="t-hint">' + getWarmupSets(sets).length + ' warm-ups . ' + getWorkingSets(sets).filter(function(set) { return set.done; }).length + '/' + getWorkingSets(sets).length + ' working sets</div>' +
              '</div>' +
              '<div style="text-align:right">' +
                (best ? '<div class="t-mono" style="font-size:12px;color:var(--txt)">' + best.weight + 'kg x ' + best.reps + '</div>' : '<div class="t-hint">No completed work set</div>') +
                (avgRpe ? '<div class="t-hint">Avg RPE ' + avgRpe + '</div>' : '') +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>'
      );
    }

    return blocks.join('');
  }

  function recentSessions() {
    var all = TF.Store.getAllWorkoutLogs();
    var sorted = Object.keys(all).sort().reverse().slice(0, 10);
    if (!sorted.length) {
      return '<div class="empty-state"><div class="empty-title">No workout history yet</div><div class="empty-body">Complete your first session and log your sets to see history here.</div></div>';
    }
    return sorted.map(function(dateKey) {
      var workout = TF.Store.getWorkoutDay(dateKey);
      var exerciseNames = Object.keys(workout.exercises || {});
      var totalWorking = exerciseNames.reduce(function(sum, name) {
        return sum + getWorkingSets(workout.exercises[name]).length;
      }, 0);
      var doneWorking = exerciseNames.reduce(function(sum, name) {
        return sum + getWorkingSets(workout.exercises[name]).filter(function(set) { return set.done; }).length;
      }, 0);
      return '<div class="card card-sm" style="margin-bottom:8px">' +
        '<div class="flex-between" style="margin-bottom:8px">' +
          '<div>' +
            '<div class="t-title">' + TF.UI.formatDate(dateKey) + '</div>' +
            '<div class="t-hint">' + TF.UI.escapeHTML(workout.workoutName || 'Workout') + ' . ' + exerciseNames.length + ' exercises</div>' +
          '</div>' +
          '<div style="text-align:right">' +
            (workout.bodyweightKg ? '<div class="chip chip-lime" style="margin-bottom:4px">' + workout.bodyweightKg + ' kg BW</div>' : '') +
            '<span class="chip chip-' + (doneWorking === totalWorking ? 'lime' : 'blue') + '">' + doneWorking + '/' + totalWorking + '</span>' +
          '</div>' +
        '</div>' +
        (workout.notes ? '<div class="session-note-bubble compact">' + TF.UI.escapeHTML(workout.notes) + '</div>' : '') +
        exerciseNames.map(function(name) {
          var best = bestWorkingSet(workout.exercises[name]);
          var avgRpe = getAverageRpe(workout.exercises[name]);
          return '<div class="history-exercise-line compact">' +
            '<div style="font-size:12px;color:var(--txt-2)">' + TF.UI.escapeHTML(name) + '</div>' +
            '<div style="text-align:right">' +
              (best ? '<div class="t-mono" style="font-size:11px;color:var(--txt)">' + best.weight + 'kg x ' + best.reps + '</div>' : '') +
              (avgRpe ? '<div class="t-hint">RPE ' + avgRpe + '</div>' : '') +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>';
    }).join('');
  }

  function exerciseLogbook() {
    if (!selectedExercise) {
      return '<div class="card card-sm t-hint" style="text-align:center">Log a few sessions and your movement trend logbook will show up here.</div>';
    }
    var history = TF.Store.getExerciseHistory(selectedExercise, 5);
    if (!history.length) {
      return '<div class="card card-sm t-hint" style="text-align:center">No logged history for this exercise yet.</div>';
    }
    return '<div class="card">' +
      '<div class="field-group" style="margin-bottom:12px">' +
        '<div class="field-label">Exercise logbook</div>' +
        '<select id="history-exercise-picker" class="field">' +
          getExerciseNames().map(function(name) {
            return '<option value="' + TF.UI.escapeAttr(name) + '"' + (name === selectedExercise ? ' selected' : '') + '>' + TF.UI.escapeHTML(name) + '</option>';
          }).join('') +
        '</select>' +
      '</div>' +
      history.map(function(entry) {
        var best = bestWorkingSet(entry.allSets || entry.sets || []);
        var avgRpe = getAverageRpe(entry.allSets || entry.sets || []);
        var totalDone = getWorkingSets(entry.allSets || entry.sets || []).filter(function(set) { return set.done; }).length;
        var totalWork = getWorkingSets(entry.allSets || entry.sets || []).length;
        return '<div class="logbook-entry">' +
          '<div class="flex-between" style="margin-bottom:6px">' +
            '<div>' +
              '<div class="t-title">' + TF.UI.formatDate(entry.date) + '</div>' +
              '<div class="t-hint">' + TF.UI.escapeHTML(entry.workoutName || 'Workout') + '</div>' +
            '</div>' +
            '<div style="text-align:right">' +
              (entry.bodyweightKg ? '<div class="chip chip-lime" style="margin-bottom:4px">' + entry.bodyweightKg + ' kg BW</div>' : '') +
              '<div class="t-hint">' + totalDone + '/' + totalWork + ' work sets</div>' +
            '</div>' +
          '</div>' +
          '<div class="history-exercise-line compact" style="border-bottom:none;padding-bottom:0">' +
            '<div>' +
              (best ? '<div class="t-mono" style="font-size:12px;color:var(--txt)">' + best.weight + 'kg x ' + best.reps + '</div>' : '<div class="t-hint">No completed working set</div>') +
              (entry.notes ? '<div class="t-hint" style="margin-top:4px">' + TF.UI.escapeHTML(entry.notes) + '</div>' : '') +
            '</div>' +
            '<div style="text-align:right">' +
              (avgRpe ? '<div class="t-hint">Avg RPE ' + avgRpe + '</div>' : '') +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>';
  }

  /* ── v5.7 Weekly Volume Bar Chart ── */
  function weeklyVolumeChart() {
    var allLogs = TF.Store.getAllWorkoutLogs();
    var today = new Date();

    /* Build 8 weeks of data */
    var weeks = [];
    for (var w = 7; w >= 0; w--) {
      var weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() - w * 7);
      var weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      var volume = 0;
      var dates  = [];
      for (var d = 0; d < 7; d++) {
        var day = new Date(weekStart);
        day.setDate(weekStart.getDate() + d);
        var key = day.getFullYear() + '-' +
          String(day.getMonth() + 1).padStart(2, '0') + '-' +
          String(day.getDate()).padStart(2, '0');
        dates.push(key);
        var log = allLogs[key];
        if (log && log.exercises) {
          Object.values(log.exercises).forEach(function (sets) {
            (sets || []).forEach(function (set) {
              if (set.done && set.type !== 'warmup' && set.weight && set.reps) {
                volume += (parseFloat(set.weight) || 0) * (parseInt(set.reps, 10) || 0);
              }
            });
          });
        }
      }

      var mon  = new Date(weekStart);
      mon.setDate(weekStart.getDate() + (mon.getDay() === 0 ? 1 : 8 - mon.getDay()));
      var label = String(mon.getDate()) + '/' + String(mon.getMonth() + 1);
      weeks.push({ label: label, volume: Math.round(volume), dates: dates });
    }

    var hasData = weeks.some(function (w) { return w.volume > 0; });
    if (!hasData) {
      return '<div class="vol-chart-empty">No workout volume logged yet. Complete sets with weight and reps to see your weekly chart.</div>';
    }

    var maxVol  = Math.max.apply(null, weeks.map(function (w) { return w.volume; }));
    var peakIdx = weeks.reduce(function (best, w, i) { return w.volume > weeks[best].volume ? i : best; }, 0);

    /* SVG bar chart */
    var svgW = 320, svgH = 120, padL = 8, padR = 8, padT = 24, padB = 28;
    var chartW = svgW - padL - padR;
    var chartH = svgH - padT - padB;
    var barW   = Math.floor(chartW / weeks.length) - 4;
    var barGap  = 4;

    var bars = weeks.map(function (week, i) {
      var barH   = maxVol > 0 ? Math.round((week.volume / maxVol) * chartH) : 0;
      var x      = padL + i * (barW + barGap);
      var y      = padT + chartH - barH;
      var isPeak = i === peakIdx && week.volume > 0;
      var clr    = isPeak ? 'var(--lime)' : 'var(--bg-5)';
      var volLabel = week.volume > 0
        ? (week.volume >= 1000 ? (week.volume / 1000).toFixed(1) + 'k' : String(week.volume))
        : '';

      return '<g class="vol-bar-group' + (isPeak ? ' vol-bar-peak' : '') + '" data-dates="' + week.dates.join(',') + '" data-week-idx="' + i + '">' +
        '<rect class="vol-bar-rect" x="' + x + '" y="' + y + '" width="' + barW + '" height="' + (barH || 2) + '" rx="3" fill="' + clr + '"/>' +
        (volLabel ? '<text class="vol-bar-val" x="' + (x + barW / 2) + '" y="' + (y - 4) + '" text-anchor="middle" fill="' + clr + '">' + volLabel + '</text>' : '') +
        '<text class="vol-week-label" x="' + (x + barW / 2) + '" y="' + (padT + chartH + 14) + '" text-anchor="middle">' + week.label + '</text>' +
      '</g>';
    }).join('');

    return '<div class="volume-chart-wrap">' +
      '<svg class="vol-chart-svg" viewBox="0 0 ' + svgW + ' ' + svgH + '" width="100%" style="max-height:' + svgH + 'px">' +
        bars +
      '</svg>' +
      '<div style="font-size:10px;color:var(--txt-3);text-align:right;margin-top:4px;letter-spacing:.4px">kg lifted per week — tap a bar to view that session</div>' +
    '</div>';
  }

  function render() {
    if (!selectedExercise) {
      selectedExercise = getExerciseNames()[0] || '';
    }
    root.innerHTML = '<div class="screen">' +
      '<div class="t-headline" style="margin-bottom:4px">' + TF.Icon('calendar', 20) + ' Workout History</div>' +
      '<div class="t-hint" style="margin-bottom:20px">Calendar view for sessions, notes, bodyweight, warm-ups, RPE, and your last-5 movement trend logbook.</div>' +

      '<div class="card" style="margin-bottom:18px">' +
        '<div class="flex-between" style="margin-bottom:14px">' +
          '<button class="topbar-btn" id="cal-prev">' + TF.Icon('chevron-left', 15) + '</button>' +
          '<div id="cal-body"></div>' +
          '<button class="topbar-btn" id="cal-next">' + TF.Icon('chevron-right', 15) + '</button>' +
        '</div>' +
      '</div>' +

      '<div class="section">' +
        TF.UI.secHdr('Weekly Volume') +
        '<div class="card card-sm" id="vol-chart-section">' + weeklyVolumeChart() + '</div>' +
      '</div>' +

      '<div class="section">' + TF.UI.secHdr('Selected Day') + selectedDaySummary() + '</div>' +
      '<div class="section">' + TF.UI.secHdr('Exercise Logbook') + exerciseLogbook() + '</div>' +
      '<div class="section">' + TF.UI.secHdr('Recent Sessions') + recentSessions() + '</div>' +
      '<div style="height:8px"></div>' +
    '</div>';

    root.querySelector('#cal-body').innerHTML = buildCalendar(viewDate.getFullYear(), viewDate.getMonth());
    bindEvents();
  }

  function bindEvents() {
    root.querySelector('#cal-prev').addEventListener('click', function() {
      viewDate.setMonth(viewDate.getMonth() - 1);
      render();
    });

    root.querySelector('#cal-next').addEventListener('click', function() {
      var currentMonth = new Date().getFullYear() * 12 + new Date().getMonth();
      var viewedMonth = viewDate.getFullYear() * 12 + viewDate.getMonth();
      if (viewedMonth < currentMonth) {
        viewDate.setMonth(viewDate.getMonth() + 1);
        render();
      }
    });

    root.querySelectorAll('.cal-day[data-date]').forEach(function(day) {
      day.addEventListener('click', function() {
        selectedDate = day.dataset.date;
        render();
      });
    });

    var picker = root.querySelector('#history-exercise-picker');
    if (picker) {
      picker.addEventListener('change', function() {
        selectedExercise = picker.value;
        render();
      });
    }

    /* v5.7 — Volume chart bar click: jump to that week's first session with data */
    root.querySelectorAll('.vol-bar-group').forEach(function(bar) {
      bar.addEventListener('click', function() {
        var datesStr = bar.dataset.dates;
        if (!datesStr) return;
        var dates = datesStr.split(',');
        var workoutDates = TF.Store.getWorkoutDates ? TF.Store.getWorkoutDates() : [];
        var hit = dates.find(function(d) { return workoutDates.indexOf(d) >= 0; });
        if (hit) {
          selectedDate = hit;
          /* Sync calendar to that month */
          var parts = hit.split('-');
          viewDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
          render();
          /* Scroll selected day into view */
          setTimeout(function() {
            var el = root.querySelector('.cal-day.selected');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 80);
        }
      });
    });
  }

  render();
};
