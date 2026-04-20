/* ================================================================
   MISSIONS SCREEN v5.6 - richer cards, type icons, all-complete state
   ================================================================ */
TF.Screens.missions = function(root) {
  var TYPE_META = {
    workout:   { label: 'Workout',   icon: 'dumbbell',       col: 'var(--lime)'   },
    nutrition: { label: 'Nutrition', icon: 'activity',       col: 'var(--blue)'   },
    habit:     { label: 'Habit',     icon: 'target',         col: 'var(--amber)'  },
    activity:  { label: 'Activity',  icon: 'trending-up',    col: 'var(--purple)' },
    mindset:   { label: 'Mindset',   icon: 'message-circle', col: 'var(--teal)'   }
  };

  function draw() {
    var input = TF.Store.getTodayInput();
    var missions = TF.Missions.ensureToday
      ? TF.Missions.ensureToday(TF.Store.getProfile(), input)
      : TF.Store.getTodayMissions();
    var xpDone  = missions.filter(function(m){return m.done;}).reduce(function(s,m){return s+m.xpReward;},0);
    var xpTotal = missions.reduce(function(s,m){return s+m.xpReward;},0);
    var allDone = missions.length > 0 && missions.every(function(m){return m.done;});

    function mCard(m) {
      var meta = TYPE_META[m.type] || TYPE_META.habit;
      var col  = meta.col;
      var t    = TF.Missions.TYPES[m.type] || TF.Missions.TYPES.habit;
      return '<div class="mission-card ' + (m.done ? 'done' : '') + '" data-id="' + m.id + '" style="' +
        'border-left:3px solid ' + col + (m.done ? 'cc' : '44') + ';display:flex;align-items:flex-start;gap:12px">' +
        '<div style="width:36px;height:36px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;margin-top:2px;' +
          (m.done ? 'background:' + col + '22;color:' + col : 'background:var(--bg-3);color:var(--txt-3)') + '">' +
          TF.Icon(meta.icon, 15) +
        '</div>' +
        '<div class="m-body" style="flex:1;min-width:0">' +
          '<div class="m-meta">' +
            '<span class="chip ' + t.cls + '" style="color:' + col + ';background:' + col + '18;border-color:' + col + '35">' + meta.label + '</span>' +
            '<span class="m-xp" style="color:' + (m.done ? col : 'var(--txt-3)') + '">+' + m.xpReward + ' XP</span>' +
          '</div>' +
          '<div class="m-title">' + m.title + '</div>' +
          '<div class="m-desc">' + m.desc + '</div>' +
        '</div>' +
        '<div class="m-check" style="flex-shrink:0;' + (m.done ? 'background:' + col + '22;border-color:' + col + '88' : '') + '">' +
          (m.done ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="' + col + '" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : '') +
        '</div>' +
      '</div>';
    }

    function allDoneCard() {
      return '<div class="card" style="margin-bottom:16px;background:linear-gradient(135deg,rgba(200,255,0,.07),transparent);border-color:var(--lime-mid);text-align:center;padding:24px 16px">' +
        '<div style="font-size:36px;margin-bottom:10px">🏆</div>' +
        '<div style="font-family:var(--font-d);font-size:17px;font-weight:900;letter-spacing:1px;color:var(--lime);margin-bottom:6px">ALL MISSIONS COMPLETE</div>' +
        '<div class="t-hint" style="margin-bottom:14px">' + xpTotal + ' XP earned today. The standard has been kept.</div>' +
        '<div style="display:flex;justify-content:center;gap:8px">' +
          '<button class="btn btn-sm btn-lime-ghost" id="btn-go-checkin-done" type="button">' + TF.Icon('activity', 11) + ' Check-in</button>' +
          '<button class="btn btn-sm btn-ghost" id="btn-go-habits-done" type="button">' + TF.Icon('target', 11) + ' Habits</button>' +
        '</div>' +
      '</div>';
    }

    var progressStrip = missions.map(function(m) {
      var col = (TYPE_META[m.type] || TYPE_META.habit).col;
      return '<div title="' + TF.UI.escapeAttr(m.title) + '" style="flex:1;height:4px;border-radius:2px;background:' +
        (m.done ? col : 'var(--bg-3)') + ';transition:background .3s"></div>';
    }).join('');

    root.innerHTML = '<div class="screen">' +
      '<div class="hero-img-card" id="mi-hero">' +
        '<div class="skeleton" style="position:absolute;inset:0;border-radius:var(--r-lg)"></div>' +
        '<div class="hero-img-card-content">' +
          '<div class="t-label">DAILY MISSIONS</div>' +
          '<div class="t-headline">Execute or<br>stay average.</div>' +
          '<div class="t-hint">5 daily challenges. Bend reality.</div>' +
        '</div>' +
      '</div>' +

      '<div class="card card-sm" style="margin-bottom:18px">' +
        '<div class="flex-between" style="margin-bottom:7px">' +
          '<span class="t-label">XP TODAY</span>' +
          '<span class="t-mono" style="font-size:16px;font-weight:800;color:' + (allDone ? 'var(--lime)' : 'var(--blue)') + '">' + xpDone + ' / ' + xpTotal + '</span>' +
        '</div>' +
        TF.UI.bar(xpTotal ? xpDone / xpTotal : 0, allDone ? 'var(--lime)' : 'var(--blue)') +
        (missions.length ? '<div style="display:flex;gap:4px;margin-top:8px">' + progressStrip + '</div>' : '') +
      '</div>' +

      (allDone ? allDoneCard() : '') +

      (missions.length
        ? missions.map(mCard).join('')
        : '<div class="empty-state">' +
            '<div class="empty-icon">⚡</div>' +
            '<div class="empty-title">No missions yet</div>' +
            '<div class="empty-body">Complete your daily check-in to generate today\'s 5 missions.</div>' +
            '<button class="btn btn-primary" id="btn-go-ci" style="margin-top:20px;max-width:200px;margin-left:auto;margin-right:auto">' + TF.Icon('activity', 13) + ' Check-in Now</button>' +
          '</div>'
      ) +
      '<div style="height:8px"></div></div>';

    TF.UI.setHeroImg(root.querySelector('#mi-hero'), TF.Config.Images.missions);

    root.querySelectorAll('.mission-card:not(.done)').forEach(function(card) {
      card.addEventListener('click', function() {
        var xp = TF.Store.completeMission(card.dataset.id);
        if (xp === null) return;
        TF.UI.haptic(80);
        TF.UI.toast('+' + xp + ' XP — mission complete 🔱', 'success');
        var ms = TF.Store.getTodayMissions();
        if (ms.every(function(m) { return m.done; })) {
          setTimeout(function() { TF.UI.confetti({ particleCount: 140, spread: 85, origin: { y: 0.5 } }); }, 200);
        }
        var unlocked = TF.Achievements.check({ type: 'mission' });
        unlocked.forEach(function(id) { setTimeout(function() { TF.UI.achievementToast(id); }, 1000); });
        draw();
      });
    });

    var goCI = root.querySelector('#btn-go-ci');
    if (goCI) goCI.addEventListener('click', function() { TF.Router.navigate('checkin'); });
    var goCIDone = root.querySelector('#btn-go-checkin-done');
    if (goCIDone) goCIDone.addEventListener('click', function() { TF.Router.navigate('checkin'); });
    var goHabitsDone = root.querySelector('#btn-go-habits-done');
    if (goHabitsDone) goHabitsDone.addEventListener('click', function() { TF.Router.navigate('habits'); });
  }

  draw();
};
