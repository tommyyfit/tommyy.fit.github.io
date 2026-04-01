/* ================================================================
   HABITS SCREEN v4 - tommyy.fit
   Daily habit tracker with streaks, weekly grids, and XP
   ================================================================ */
TF.Screens.habits = function(root) {
  'use strict';

  function bestStreak(streaks){
    return Object.values(streaks).reduce(function(best, streak){
      return Math.max(best, streak.current || 0, streak.best || 0);
    }, 0);
  }

  function renderHabit(habit, streaks){
    var streak = streaks[habit.id] || { current: 0, best: 0 };
    var grid = TF.Habits.getWeekGrid(habit.id);
    var weeklyRate = TF.Habits.getWeeklyRate(habit.id);

    return '<div class="habit-row ' + (habit.done ? 'done' : '') + '" data-habit-id="' + habit.id + '" role="button" tabindex="0">' +
      '<div class="habit-row-main">' +
        '<div class="habit-check ' + (habit.done ? 'on' : '') + '">' +
          (habit.done ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><polyline points="20 6 9 17 4 12"/></svg>' : '') +
        '</div>' +
        '<div class="habit-emoji">' + TF.UI.escapeHTML(habit.emoji) + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div class="habit-label">' + TF.UI.escapeHTML(habit.label) + '</div>' +
          '<div style="display:flex;align-items:center;gap:8px;margin-top:3px">' +
            (streak.current > 0
              ? '<span class="t-hint" style="color:var(--amber);font-size:11px">' + streak.current + 'd streak</span>'
              : '<span class="t-hint" style="font-size:11px">Start streak</span>') +
            (streak.best > streak.current ? '<span class="t-hint" style="font-size:10px">(best ' + streak.best + 'd)</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="habit-xp">+' + habit.xp + ' XP</div>' +
      '</div>' +
      '<div class="habit-week-grid">' +
        grid.map(function(day){
          return '<div class="habit-week-dot ' + (day.done ? 'done' : '') + '"></div>';
        }).join('') +
        '<span class="t-hint" style="font-size:10px;margin-left:4px">' + weeklyRate + '%</span>' +
      '</div>' +
    '</div>';
  }

  function draw() {
    var habits = TF.Habits.getTodayStatus();
    var totalDone = habits.filter(function(habit){ return habit.done; }).length;
    var total = habits.length;
    var progress = total > 0 ? totalDone / total : 0;
    var streaks = TF.Store.getHabitStreaks();
    var weeklyXP = TF.Habits.getWeeklyHabitXP();

    root.innerHTML = '<div class="screen">' +
      '<div class="hero-img-card" id="hab-hero" style="margin-bottom:14px">' +
        '<div class="skeleton" style="position:absolute;inset:0;border-radius:var(--r-lg)"></div>' +
        '<div class="hero-img-card-content">' +
          '<div class="t-label" style="color:var(--lime);margin-bottom:5px">DISCIPLINE STACK</div>' +
          '<div class="t-headline" style="font-size:24px">Daily Habits</div>' +
          '<div class="t-hint" style="margin-top:4px">Small wins. Compounding identity.</div>' +
        '</div>' +
      '</div>' +

      '<div class="grid-3" style="margin-bottom:20px">' +
        '<div class="stat-tile">' +
          '<div class="stat-val" style="color:var(--lime)">' + totalDone + '</div>' +
          '<div class="stat-unit">/' + total + '</div>' +
          '<div class="stat-label">Today done</div>' +
        '</div>' +
        '<div class="stat-tile">' +
          '<div class="stat-val" style="color:var(--amber)">' + bestStreak(streaks) + '</div>' +
          '<div class="stat-unit">days</div>' +
          '<div class="stat-label">Best streak</div>' +
        '</div>' +
        '<div class="stat-tile">' +
          '<div class="stat-val" style="color:var(--purple)">' + weeklyXP + '</div>' +
          '<div class="stat-unit">xp</div>' +
          '<div class="stat-label">Week XP</div>' +
        '</div>' +
      '</div>' +

      '<div class="card card-sm" style="margin-bottom:18px">' +
        '<div class="flex-between" style="margin-bottom:6px">' +
          '<span class="t-label">TODAY&#39;S HABITS</span>' +
          '<span class="t-mono" style="font-size:13px;font-weight:700;color:' + (progress === 1 ? 'var(--lime)' : 'var(--blue)') + '">' + Math.round(progress * 100) + '%</span>' +
        '</div>' +
        TF.UI.bar(progress, progress === 1 ? 'var(--lime)' : 'var(--blue)') +
        (progress === 1 ? '<div style="margin-top:8px;font-size:13px;color:var(--lime);font-weight:600">Perfect discipline day.</div>' : '') +
      '</div>' +

      habits.map(function(habit){
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

  function toggleFromElement(el){
    var row = el.closest('.habit-row[data-habit-id]');
    if (!row || !root.contains(row)) {
      return;
    }
    var id = row.dataset.habitId;
    var current = !!TF.Store.getTodayHabits()[id];
    var xpEarned = TF.Store.toggleHabit(id, !current);
    var definition = TF.Config.DefaultHabits.find(function(habit){
      return habit.id === id;
    });

    TF.UI.haptic(50);
    if (!current && xpEarned > 0 && definition) {
      TF.UI.toast(definition.label + ' +' + xpEarned + ' XP', 'success');
    }

    TF.Achievements.check({ type: 'habit' }).forEach(function(uid){
      setTimeout(function(){
        TF.UI.achievementToast(uid);
      }, 800);
    });

    draw();
  }

  root.onclick = function(event){
    if (event.target.closest('.habit-row[data-habit-id]')) {
      toggleFromElement(event.target);
    }
  };

  root.onkeydown = function(event){
    if (event.key === 'Enter' || event.key === ' ') {
      var row = event.target.closest('.habit-row[data-habit-id]');
      if (row) {
        event.preventDefault();
        toggleFromElement(event.target);
      }
    }
  };

  draw();
};
