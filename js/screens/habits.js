/* ================================================================
   HABITS SCREEN v5.6 - fire streaks, top habit spotlight, all-complete state
   ================================================================ */
TF.Screens.habits = function(root) {
  'use strict';

  function bestStreak(streaks) {
    return Object.values(streaks).reduce(function(best, streak) {
      return Math.max(best, streak.current || 0, streak.best || 0);
    }, 0);
  }

  function topHabitByStreak(streaks) {
    var best = null;
    var bestVal = 0;
    TF.Config.DefaultHabits.forEach(function(habit) {
      var current = (streaks[habit.id] || {}).current || 0;
      if (current > bestVal) {
        bestVal = current;
        best = habit;
      }
    });
    return best && bestVal >= 2 ? { habit: best, streak: bestVal } : null;
  }

  function get30DayGrid(id) {
    var all = TF.Store.getAllHabits();
    var result = [];
    for (var i = 29; i >= 0; i--) {
      var day = new Date();
      day.setDate(day.getDate() - i);
      var key = day.getFullYear() + '-' + String(day.getMonth() + 1).padStart(2, '0') + '-' + String(day.getDate()).padStart(2, '0');
      result.push({ key: key, done: !!(all[key] && all[key][id]) });
    }
    return result;
  }

  function milestoneBadge(current) {
    if (current >= 30) return '<span title="30-day milestone" style="font-size:13px">\u{1F48E}</span>';
    if (current >= 14) return '<span title="14-day milestone" style="font-size:13px">\u{1F389}</span>';
    if (current >= 7) return '<span title="7-day milestone" style="font-size:13px">\u{1F525}</span>';
    return '';
  }

  function renderHabit(habit, streaks) {
    var streak = streaks[habit.id] || { current: 0, best: 0 };
    var grid30 = get30DayGrid(habit.id);
    var weeklyRate = TF.Habits.getWeeklyRate(habit.id);
    var onFire = streak.current >= 7;
    var streakLabel = streak.current > 0 ? (onFire ? 'Hot streak · ' : '') + streak.current + 'd streak' : 'Start streak';
    var streakColor = onFire ? 'var(--amber)' : streak.current >= 3 ? 'var(--blue)' : 'inherit';
    var badge = milestoneBadge(streak.current);

    var dots30 = grid30.map(function(day, idx) {
      var isToday = idx === 29;
      return '<div title="' + day.key + '" style="width:7px;height:7px;border-radius:2px;flex-shrink:0;' +
        (day.done
          ? 'background:var(--lime);opacity:' + (isToday ? '1' : '0.65')
          : 'background:var(--bg-3);border:1px solid var(--border)') +
        '"></div>';
    }).join('');

    return '<button class="habit-row ' + (habit.done ? 'done' : '') + '" data-habit-id="' + habit.id + '" type="button" aria-pressed="' + (habit.done ? 'true' : 'false') + '" aria-label="' + habit.label + '">' +
      '<div class="habit-row-main">' +
        '<div class="habit-check ' + (habit.done ? 'on' : '') + '">' +
          (habit.done ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><polyline points="20 6 9 17 4 12"/></svg>' : '') +
        '</div>' +
        '<div class="habit-emoji">' + TF.UI.escapeHTML(habit.emoji) + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="display:flex;align-items:center;gap:5px">' +
            '<div class="habit-label">' + TF.UI.escapeHTML(habit.label) + '</div>' +
            badge +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:8px;margin-top:3px">' +
            '<span class="t-hint" style="font-size:11px;color:' + streakColor + '">' + streakLabel + '</span>' +
            (streak.best > streak.current && streak.best > 0 ? '<span class="t-hint" style="font-size:10px">(best ' + streak.best + 'd)</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="habit-xp">+' + habit.xp + ' XP</div>' +
      '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:2px;margin:6px 0 2px 0;padding:0 2px">' + dots30 + '</div>' +
      '<div style="display:flex;justify-content:flex-end;padding:0 2px 2px">' +
        '<span class="t-hint" style="font-size:10px">' + weeklyRate + '% this week</span>' +
      '</div>' +
    '</button>';
  }

  function renderTopHabitCard(top) {
    if (!top) return '';
    return '<div class="card card-sm" style="margin-bottom:16px;background:linear-gradient(135deg,rgba(255,170,0,.08),transparent);border-color:rgba(255,170,0,.2)">' +
      '<div style="display:flex;align-items:center;gap:10px">' +
        '<div style="font-size:28px;line-height:1">' + TF.UI.escapeHTML(top.habit.emoji) + '</div>' +
        '<div style="flex:1">' +
          '<div class="t-label" style="color:var(--amber);margin-bottom:2px">TOP STREAK</div>' +
          '<div class="t-title">' + TF.UI.escapeHTML(top.habit.label) + '</div>' +
          '<div class="t-hint" style="margin-top:2px">' + top.streak + ' days in a row. Keep it alive today.</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function draw() {
    var habits = TF.Habits.getTodayStatus();
    var totalDone = habits.filter(function(habit) { return habit.done; }).length;
    var total = habits.length;
    var progress = total > 0 ? totalDone / total : 0;
    var allComplete = totalDone === total && total > 0;
    var streaks = TF.Store.getHabitStreaks();
    var weeklyXP = TF.Habits.getWeeklyHabitXP();
    var top = topHabitByStreak(streaks);

    root.innerHTML = '<div class="screen">' +
      '<div class="hero-img-card" id="hab-hero">' +
        '<div class="skeleton" style="position:absolute;inset:0;border-radius:var(--r-lg)"></div>' +
        '<div class="hero-img-card-content">' +
          '<div class="t-label">DISCIPLINE STACK</div>' +
          '<div class="t-headline">Daily Habits</div>' +
          '<div class="t-hint">Small wins. Compounding identity.</div>' +
        '</div>' +
      '</div>' +
      '<div class="grid-3" style="margin-bottom:20px">' +
        '<div class="stat-tile">' +
          '<div class="stat-val" style="color:' + (allComplete ? 'var(--lime)' : 'var(--txt-1)') + '">' + totalDone + '</div>' +
          '<div class="stat-unit">/' + total + '</div>' +
          '<div class="stat-label">Today done</div>' +
        '</div>' +
        '<div class="stat-tile">' +
          '<div class="stat-val" style="color:var(--amber)">' + (bestStreak(streaks) >= 7 ? '\u{1F525} ' : '') + bestStreak(streaks) + '</div>' +
          '<div class="stat-unit">days</div>' +
          '<div class="stat-label">Best streak</div>' +
        '</div>' +
        '<div class="stat-tile">' +
          '<div class="stat-val" style="color:var(--purple)">' + weeklyXP + '</div>' +
          '<div class="stat-unit">xp</div>' +
          '<div class="stat-label">Week XP</div>' +
        '</div>' +
      '</div>' +
      '<div class="card card-sm" style="margin-bottom:' + (top ? '12px' : '18px') + '">' +
        '<div class="flex-between" style="margin-bottom:6px">' +
          '<span class="t-label">TODAY&#39;S HABITS</span>' +
          '<span class="t-mono" style="font-size:13px;font-weight:700;color:' + (allComplete ? 'var(--lime)' : 'var(--blue)') + '">' + Math.round(progress * 100) + '%</span>' +
        '</div>' +
        TF.UI.bar(progress, allComplete ? 'var(--lime)' : 'var(--blue)') +
        (allComplete ? '<div style="margin-top:8px;font-size:13px;color:var(--lime);font-weight:700">Perfect discipline day. All streaks extended.</div>' : '') +
      '</div>' +
      renderTopHabitCard(top) +
      habits.map(function(habit) {
        return renderHabit(habit, streaks);
      }).join('') +
      '<div class="card card-sm" style="margin-top:16px">' +
        '<div class="t-label" style="margin-bottom:6px">How this works</div>' +
        '<div class="t-hint">Everything is stored locally in your browser. Export a JSON backup regularly from Profile to keep your progress safe.</div>' +
      '</div>' +
      '<div style="height:8px"></div>' +
    '</div>';

    TF.UI.setHeroImg(root.querySelector('#hab-hero'), TF.Config.Images.habits);
  }

  function toggleFromElement(el) {
    var row = el.closest('.habit-row[data-habit-id]');
    if (!row || !root.contains(row)) {
      return;
    }
    var id = row.dataset.habitId;
    var current = !!TF.Store.getTodayHabits()[id];
    var xpEarned = TF.Store.toggleHabit(id, !current);
    var definition = TF.Config.DefaultHabits.find(function(habit) {
      return habit.id === id;
    });

    TF.UI.haptic(50);
    if (!current && xpEarned > 0 && definition) {
      TF.UI.toast(definition.label + ' +' + xpEarned + ' XP', 'success');
    }

    if (!current && definition && TF.Celebrations) {
      var streaks = TF.Store.getHabitStreaks();
      TF.Celebrations.maybeCelebrateHabitMilestone(definition, streaks[id] || { current: 0, best: 0 });
      TF.Celebrations.maybeCelebratePerfectHabits(TF.Habits.getDoneCount(), TF.Config.DefaultHabits.length);
    }

    TF.Achievements.check({ type: 'habit' }).forEach(function(uid) {
      setTimeout(function() {
        TF.UI.achievementToast(uid);
      }, 800);
    });

    draw();
  }

  root.onclick = function(event) {
    if (event.target.closest('.habit-row[data-habit-id]')) {
      toggleFromElement(event.target);
    }
  };

  draw();
};
