TF.Screens.more = function(root) {
  var profile = TF.Store.getProfile();
  var level = TF.Store.getLevel(profile);
  var title = TF.Store.getWarriorTitle(level);
  var safeName = TF.UI.escapeHTML(profile.name);
  var safeBrandUrl = TF.UI.escapeAttr(TF.Config.brandUrl);
  var unlockedCount = Object.keys(TF.Store.getUnlockedAchievements()).length;
  var totalAchievements = TF.Achievements.getAll().length;
  var habitsDone = TF.Habits.getDoneCount();
  var totalHabits = TF.Config.DefaultHabits.length;

  var tiles = [
    { route: 'habits', icon: 'target', title: 'Daily Habits', desc: habitsDone + '/' + totalHabits + ' done today. Build streaks and XP.', bg: 'var(--lime-dim)', col: 'var(--lime)', badge: habitsDone > 0 ? habitsDone : null },
    { route: 'nutrition', icon: 'activity', title: 'Fuel & Nutrition', desc: 'Macro rings, food search, water, and meals.', bg: 'var(--teal-dim)', col: 'var(--teal)' },
    { route: 'progress', icon: 'bar-chart', title: 'Progress & Stats', desc: 'Charts, weight log, weekly radar, and trends.', bg: 'var(--blue-dim)', col: 'var(--blue)' },
    { route: 'history', icon: 'calendar', title: 'Workout History', desc: 'Calendar view of sessions and training volume.', bg: 'var(--purple-dim)', col: 'var(--purple)' },
    { route: 'measurements', icon: 'ruler', title: 'Body Measurements', desc: 'Chest, waist, arms, hips, and body trends.', bg: 'var(--orange-dim)', col: 'var(--orange)' },
    { route: 'weekly-review', icon: 'trending-up', title: 'Weekly Review', desc: 'Compare this week to last week and spot patterns.', bg: 'var(--amber-dim)', col: 'var(--amber)' },
    { route: 'achievements', icon: 'trophy', title: 'Achievements', desc: unlockedCount + '/' + totalAchievements + ' unlocked.', bg: 'rgba(255,184,61,.12)', col: 'var(--amber)', badge: unlockedCount },
    { route: 'coach', icon: 'message-circle', title: 'AI Export', desc: 'Generate copy-ready prompts for any chatbot.', bg: 'var(--teal-dim)', col: 'var(--teal)' },
    { route: 'profile', icon: 'settings', title: 'Profile & Settings', desc: 'Goals, targets, reminders, theme, and backups.', bg: 'var(--bg-3)', col: 'var(--txt-2)' }
  ];

  root.innerHTML = '<div class="screen">' +
    '<div class="t-headline" style="margin-bottom:16px">More</div>' +
    tiles.map(function(tile){
      return '<div class="more-tile" data-goto="' + tile.route + '">' +
        '<div class="more-tile-icon" style="background:' + tile.bg + ';color:' + tile.col + '">' + TF.Icon(tile.icon, 18) + '</div>' +
        '<div style="flex:1">' +
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">' +
            '<div class="t-title">' + tile.title + '</div>' +
            (tile.badge ? '<div class="more-badge">' + tile.badge + '</div>' : '') +
          '</div>' +
          '<div class="t-hint">' + tile.desc + '</div>' +
        '</div>' +
        '<div class="more-tile-arrow">' + TF.Icon('chevron-right', 16) + '</div>' +
      '</div>';
    }).join('') +

    '<div class="card" style="margin-top:8px;display:flex;align-items:center;gap:14px">' +
      '<div style="width:44px;height:44px;border-radius:11px;background:var(--lime-dim);border:1px solid var(--lime-mid);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;flex-shrink:0">LV</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-weight:600;font-size:15px">' + safeName + '</div>' +
        '<div class="t-hint">Lv.' + level + ' ' + title + ' - ' + (profile.streakDays || 0) + 'd streak - ' + profile.xp + ' XP</div>' +
      '</div>' +
    '</div>' +

    TF.UI.bar(TF.Store.getXPProgress(profile), 'var(--lime)') +

    '<div style="margin-top:16px;padding:16px;background:var(--bg-2);border-radius:var(--r-lg);border:1px solid var(--border);text-align:center">' +
      '<div style="font-family:var(--font-d);font-size:24px;font-weight:900;letter-spacing:3px;margin-bottom:4px">TOMMYY<span style="color:var(--lime)">.FIT</span></div>' +
      '<div class="t-hint" style="margin-bottom:12px">Discipline. Performance. Transformation.</div>' +
      '<a href="' + safeBrandUrl + '" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-lime-ghost" style="display:inline-flex;gap:6px;margin-bottom:10px">' + TF.Icon('external-link', 12) + ' beacons.ai/tommyy.fit</a>' +
      '<div class="t-hint" style="font-size:10px;margin-top:6px">' + TF.Config.version + ' - Data stored locally - Static-host friendly</div>' +
    '</div>' +
    '<div style="height:8px"></div></div>';

  root.querySelectorAll('[data-goto]').forEach(function(tile){
    tile.addEventListener('click', function(){
      TF.Router.navigate(tile.dataset.goto);
    });
  });
};
