TF.Screens.checkin = function(root) {
  var METRICS = [
    { id: 'sleep', emoji: '\u{1F319}', label: 'Sleep quality', min: 'Terrible', max: 'Incredible', def: 7 },
    { id: 'sleepHrs', emoji: '\u23F0', label: 'Sleep hours', min: '< 4h', max: '10h+', def: 8, step: 0.5, min_v: 2, max_v: 12 },
    { id: 'energy', emoji: '\u26A1', label: 'Energy level', min: 'Drained', max: 'Explosive', def: 7 },
    { id: 'mood', emoji: '\u{1F9E0}', label: 'Mood', min: 'Dark', max: 'Excellent', def: 7 },
    { id: 'focus', emoji: '\u{1F3AF}', label: 'Mental focus', min: 'Foggy', max: 'Laser', def: 7 },
    { id: 'stress', emoji: '\u{1F525}', label: 'Stress (low is good)', min: 'Zero', max: 'Maxed', def: 4 }
  ];

  function sliderColor(id, v) {
    if (id === 'sleepHrs') {
      if (v >= 7.5 && v <= 9) return 'var(--lime)';
      if (v >= 6) return 'var(--blue)';
      return 'var(--amber)';
    }
    var score = id === 'stress' ? (11 - v) : v;
    if (score >= 8) return 'var(--lime)';
    if (score >= 6) return 'var(--blue)';
    if (score >= 4) return 'var(--amber)';
    return 'var(--red)';
  }

  var existing = TF.Store.getTodayInput();
  var firstCheckin = TF.Store.getLastNInputs(2).length === 0;
  var defaults = existing ? {
    sleep: existing.sleepQuality || 7,
    sleepHrs: existing.sleepHours || 8,
    energy: existing.energy || 7,
    mood: existing.mood || 7,
    focus: existing.focus || 7,
    stress: existing.stress || 4,
    disc: existing.disciplineYesterday !== false
  } : { sleep: 7, sleepHrs: 8, energy: 7, mood: 7, focus: 7, stress: 4, disc: true };

  function existingCheckinSummary() {
    var score;
    var recovery;
    var discipline;
    var color;
    var missions;
    var done;
    var total;
    if (!existing) {
      return '';
    }
    score = TF.Score.daily(existing);
    recovery = TF.Score.recovery(existing);
    discipline = TF.Score.discipline(existing);
    color = TF.Score.color(score);
    missions = TF.Missions.ensureToday ? TF.Missions.ensureToday(TF.Store.getProfile(), existing) : TF.Store.getTodayMissions();
    total = missions.length;
    done = missions.filter(function(mission) { return mission.done; }).length;
    return '<div class="checkin-complete-card">' +
      '<div class="checkin-complete-top">' +
        '<div>' +
          '<div class="checkin-complete-kicker">CHECK-IN COMPLETE</div>' +
          '<div class="checkin-complete-title">Today is already logged.</div>' +
          '<div class="checkin-complete-copy">You can update your answers below if the day changed. Updating will refresh today&#39;s missions.</div>' +
        '</div>' +
        '<div class="checkin-score-orb" style="color:' + color + ';border-color:' + color + '55;background:' + color + '12">' + score + '</div>' +
      '</div>' +
      '<div class="checkin-complete-grid">' +
        '<div><span>Recovery</span><strong style="color:var(--blue)">' + recovery + '</strong></div>' +
        '<div><span>Discipline</span><strong style="color:var(--amber)">' + discipline + '</strong></div>' +
        '<div><span>Missions</span><strong style="color:var(--lime)">' + done + '/' + total + '</strong></div>' +
      '</div>' +
      '<div class="checkin-complete-actions">' +
        '<button class="btn btn-primary btn-sm" id="btn-view-missions" type="button">' + TF.Icon('target', 11) + ' View missions</button>' +
        '<button class="btn btn-ghost btn-sm" id="btn-view-dashboard" type="button">' + TF.Icon('home', 11) + ' Home</button>' +
      '</div>' +
    '</div>';
  }

  root.innerHTML = '<div class="screen">' +
    '<div class="hero-img-card hero-short" id="ci-hero">' +
      '<div class="skeleton" style="position:absolute;inset:0;border-radius:var(--r-lg)"></div>' +
      '<div class="hero-img-card-content">' +
        '<div class="t-label">' + (existing ? 'TODAY IS LOGGED' : '30-SECOND CHECK-IN') + '</div>' +
        '<div class="t-headline">' + (existing ? 'Update your<br>check-in?' : 'How are you<br>today?') + '</div>' +
        '<div class="t-hint" style="margin-top:4px">' + (existing ? 'Your score and missions are already live. Edit only if the day changed.' : 'Sleep, energy, focus, stress, and yesterday&#39;s execution.') + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="t-body" style="margin-bottom:24px">' + (existing ? 'Today&#39;s check-in is saved. Adjusting these sliders will overwrite today&#39;s score and regenerate missions.' : 'Honest inputs = better guidance. Data stays on your device only.') + '</div>' +
    existingCheckinSummary() +
    (firstCheckin ? '<div class="starter-guide">' +
      '<div class="starter-guide-kicker">FIRST CHECK-IN</div>' +
      '<div class="starter-guide-title">Keep it honest from day one</div>' +
      '<div class="starter-guide-copy">Your answers shape today&#39;s score, missions, and coaching. A rough day logged honestly is more useful than a perfect score guessed.</div>' +
    '</div>' : '') +
    METRICS.map(function(m) {
      var isHours = m.id === 'sleepHrs';
      var defaultValue = defaults[m.id === 'sleep' ? 'sleep' : m.id === 'sleepHrs' ? 'sleepHrs' : m.id];
      var color = sliderColor(m.id, defaultValue || m.def);
      var displayValue = isHours ? (defaultValue || m.def) + 'h' : (defaultValue || m.def);
      return '<div class="slider-row">' +
        '<div class="slider-header">' +
          '<div class="slider-emoji-label"><span style="font-size:20px">' + m.emoji + '</span> ' + m.label + '</div>' +
          '<div class="slider-badge" id="val-' + m.id + '" style="color:' + color + ';min-width:42px">' + displayValue + '</div>' +
        '</div>' +
        '<input type="range" id="sl-' + m.id + '" min="' + (m.min_v || 1) + '" max="' + (m.max_v || 10) + '" step="' + (m.step || 1) + '" value="' + (defaultValue || m.def) + '" style="accent-color:' + color + '" aria-label="' + m.label + '">' +
        '<div class="slider-foot"><span class="t-hint">' + m.min + '</span><span class="t-hint">' + m.max + '</span></div>' +
      '</div>';
    }).join('') +
    '<div class="card" style="margin-bottom:14px">' +
      '<div class="t-title" style="margin-bottom:4px">Did you execute yesterday?</div>' +
      '<div class="t-hint" style="margin-bottom:12px">Workout + nutrition + habits fully completed.</div>' +
      '<div class="toggle-row" id="disc-toggle">' +
        '<button class="toggle-chip ' + (defaults.disc ? 'on' : '') + '" type="button" data-val="true" aria-pressed="' + (defaults.disc ? 'true' : 'false') + '">Yes - executed</button>' +
        '<button class="toggle-chip ' + (defaults.disc ? '' : 'on') + '" type="button" data-val="false" aria-pressed="' + (defaults.disc ? 'false' : 'true') + '">No - missed it</button>' +
      '</div>' +
    '</div>' +
    '<div class="card" style="margin-bottom:22px">' +
      '<div class="t-title" style="margin-bottom:4px">Quick habit log <span class="chip chip-lime" style="font-size:10px;margin-left:6px">NEW</span></div>' +
      '<div class="t-hint" style="margin-bottom:12px">Tick what you did today. Each earns XP.</div>' +
      TF.Config.DefaultHabits.map(function(habit) {
        var done = !!TF.Store.getTodayHabits()[habit.id];
        return '<button class="quick-habit ' + (done ? 'on' : '') + '" type="button" data-hid="' + habit.id + '" aria-pressed="' + (done ? 'true' : 'false') + '" aria-label="' + habit.label + ', ' + habit.xp + ' XP">' +
          '<span style="font-size:18px">' + habit.emoji + '</span>' +
          '<span style="flex:1;font-size:13px">' + habit.label + '</span>' +
          '<span class="quick-habit-xp">+' + habit.xp + '</span>' +
          '<div class="quick-habit-check ' + (done ? 'on' : '') + '">' +
            (done ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px"><polyline points="20 6 9 17 4 12"/></svg>' : '') +
          '</div>' +
        '</button>';
      }).join('') +
    '</div>' +
    '<div id="ci-score-preview" class="card card-sm" style="margin-bottom:18px;transition:border-color .2s"></div>' +
    '<button class="btn btn-primary" id="btn-submit">' + TF.Icon(existing ? 'check-circle' : 'zap', 14) + (existing ? ' UPDATE CHECK-IN' : ' LOG &amp; GENERATE MISSIONS') + '</button>' +
    '<div style="height:16px"></div>' +
  '</div>';

  TF.UI.setHeroImg(root.querySelector('#ci-hero'), TF.Config.Images.checkin);
  TF.UI.initToggle(root, 'disc-toggle');
  var viewMissionsBtn = root.querySelector('#btn-view-missions');
  if (viewMissionsBtn) {
    viewMissionsBtn.addEventListener('click', function() {
      TF.Router.navigate('missions');
    });
  }
  var viewDashboardBtn = root.querySelector('#btn-view-dashboard');
  if (viewDashboardBtn) {
    viewDashboardBtn.addEventListener('click', function() {
      TF.Router.navigate('dashboard');
    });
  }

  function calcPreviewScore() {
    var sleep = parseFloat(root.querySelector('#sl-sleep').value) || 7;
    var hours = parseFloat(root.querySelector('#sl-sleepHrs').value) || 8;
    var energy = parseFloat(root.querySelector('#sl-energy').value) || 7;
    var mood = parseFloat(root.querySelector('#sl-mood').value) || 7;
    var focus = parseFloat(root.querySelector('#sl-focus').value) || 7;
    var stress = parseFloat(root.querySelector('#sl-stress').value) || 4;
    var discChip = root.querySelector('#disc-toggle .toggle-chip.on');
    var discipline = discChip ? discChip.dataset.val === 'true' : true;
    var input = {
      sleepQuality: sleep,
      sleepHours: hours,
      energy: energy,
      mood: mood,
      focus: focus,
      stress: stress,
      disciplineYesterday: discipline
    };

    return {
      score: TF.Score.daily(input),
      recovery: TF.Score.recovery(input),
      discipline: TF.Score.discipline(input),
      label: TF.Score.label(TF.Score.daily(input)),
      color: TF.Score.color(TF.Score.daily(input))
    };
  }

  function updatePreview() {
    var preview = calcPreviewScore();
    var el = root.querySelector('#ci-score-preview');
    if (!el) return;
    el.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between">' +
        '<div class="t-label">SCORE PREVIEW</div>' +
        '<span style="font-size:10px;font-weight:700;color:' + preview.color + ';background:rgba(0,0,0,.25);border-radius:6px;padding:2px 8px;letter-spacing:.5px">' + preview.label + '</span>' +
      '</div>' +
      '<div style="display:flex;align-items:flex-end;gap:10px;margin-top:6px">' +
        '<div style="font-family:var(--font-m);font-size:42px;font-weight:900;line-height:1;color:' + preview.color + '">' + preview.score + '</div>' +
        '<div style="padding-bottom:6px;display:flex;gap:12px">' +
          '<div><div style="font-size:13px;font-weight:700;color:var(--blue)">' + preview.recovery + '</div><div class="t-hint" style="font-size:10px">Recovery</div></div>' +
          '<div><div style="font-size:13px;font-weight:700;color:var(--amber)">' + preview.discipline + '</div><div class="t-hint" style="font-size:10px">Discipline</div></div>' +
        '</div>' +
      '</div>';
    el.style.borderColor = preview.color + '44';
  }

  METRICS.forEach(function(metric) {
    var slider = root.querySelector('#sl-' + metric.id);
    var valueLabel = root.querySelector('#val-' + metric.id);
    var isHours = metric.id === 'sleepHrs';

    function updateSlider() {
      var value = parseFloat(slider.value);
      var color = sliderColor(metric.id, value);
      valueLabel.textContent = isHours ? value + 'h' : value;
      valueLabel.style.color = color;
      slider.style.accentColor = color;
      updatePreview();
    }

    slider.addEventListener('input', updateSlider);
    updateSlider();
  });

  root.querySelector('#disc-toggle').addEventListener('click', function() {
    setTimeout(updatePreview, 10);
  });

  updatePreview();

  root.querySelectorAll('.quick-habit').forEach(function(el) {
    el.addEventListener('click', function() {
      var id = el.dataset.hid;
      var current = !!TF.Store.getTodayHabits()[id];
      var definition = TF.Config.DefaultHabits.find(function(habit) { return habit.id === id; });
      TF.Store.toggleHabit(id, !current);
      TF.UI.haptic(40);
      el.classList.toggle('on', !current);
      el.setAttribute('aria-pressed', !current ? 'true' : 'false');
      var check = el.querySelector('.quick-habit-check');
      if (check) {
        check.classList.toggle('on', !current);
        check.innerHTML = !current ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px"><polyline points="20 6 9 17 4 12"/></svg>' : '';
      }
      if (!current && definition && TF.Celebrations) {
        var streaks = TF.Store.getHabitStreaks();
        TF.Celebrations.maybeCelebrateHabitMilestone(definition, streaks[id] || { current: 0, best: 0 });
        TF.Celebrations.maybeCelebratePerfectHabits(TF.Habits.getDoneCount(), TF.Config.DefaultHabits.length);
      }
    });
  });

  root.querySelector('#btn-submit').addEventListener('click', function() {
    var discChip = root.querySelector('#disc-toggle .toggle-chip.on');
    var input = {
      dateKey: TF.Store.todayKey(),
      sleepQuality: parseInt(root.querySelector('#sl-sleep').value, 10),
      sleepHours: parseFloat(root.querySelector('#sl-sleepHrs').value),
      energy: parseInt(root.querySelector('#sl-energy').value, 10),
      mood: parseInt(root.querySelector('#sl-mood').value, 10),
      focus: parseInt(root.querySelector('#sl-focus').value, 10),
      stress: parseInt(root.querySelector('#sl-stress').value, 10),
      disciplineYesterday: discChip ? discChip.dataset.val === 'true' : true
    };

    input = TF.Store.saveDailyInput(input);
    var missions = TF.Missions.generate(TF.Store.getProfile(), input);
    TF.Store.saveTodayMissions(missions);

    TF.Achievements.check({ type: 'checkin' }).forEach(function(id) {
      setTimeout(function() {
        TF.UI.achievementToast(id);
      }, 800);
    });

    TF.UI.haptic(60);
    TF.UI.toast((existing ? 'Check-in updated · ' : 'Check-in saved · ') + missions.length + ' missions ready', 'success');
    if (TF.Celebrations) {
      TF.Celebrations.maybeCelebrateCheckinStreak(TF.Store.getProfile().streakDays || 0);
    }
    TF.Router.navigate('missions');
  });
};
