TF.Screens.progress = function(root) {
  function draw() {
    var profile = TF.Store.getProfile();
    var inputs = TF.Store.getLastNInputs(7).reverse();
    var weightLog = TF.Store.getWeightLog().slice(0, 14);
    var missionStats = TF.Store.getMissionStats();
    var level = TF.Store.getLevel(profile);
    var warnings = TF.Score.weeklyInsights(inputs);
    var prs = TF.Store.getPRs();
    var prKeys = Object.keys(prs);
    var habitStats = TF.Store.getHabitStats();
    var latestBodyweight = weightLog.length ? weightLog[0].kg : null;
    var hasCoreProgress = inputs.length > 0 || weightLog.length > 0 || prKeys.length > 0;

    function avgRows() {
      if (inputs.length < 2) return '<div class="t-hint" style="text-align:center;padding:16px">Log 2+ check-ins to see averages.</div>';
      function avg(field) { return inputs.reduce(function(sum, item) { return sum + (item[field] || 0); }, 0) / inputs.length; }
      function color(value, invert) {
        var score = invert ? 10 - value : value;
        if (score >= 7.5) return 'var(--lime)';
        if (score >= 5.5) return 'var(--blue)';
        return 'var(--red)';
      }
      return '<div class="card">' + [
        { emoji: 'Sleep', label: 'Sleep quality', val: avg('sleepQuality'), inv: false },
        { emoji: 'Hours', label: 'Sleep hours', val: avg('sleepHours') || 0, inv: false, max: 12 },
        { emoji: 'Energy', label: 'Energy', val: avg('energy'), inv: false },
        { emoji: 'Mood', label: 'Mood', val: avg('mood'), inv: false },
        { emoji: 'Focus', label: 'Focus', val: avg('focus'), inv: false },
        { emoji: 'Stress', label: 'Stress', val: avg('stress'), inv: true }
      ].map(function(row) {
        return '<div class="avg-row">' +
          '<div class="avg-emoji">' + row.emoji + '</div>' +
          '<div class="avg-label">' + row.label + '</div>' +
          '<div class="avg-val" style="color:' + color(row.val, row.inv) + '">' + row.val.toFixed(1) + '</div>' +
          '<div class="avg-denom">' + (row.max ? '/' + row.max : '/10') + '</div>' +
        '</div>';
      }).join('') + '</div>';
    }

    function weightSection() {
      return '<div class="card">' +
        '<div style="display:flex;gap:8px;margin-bottom:' + (weightLog.length ? '14px' : '0') + '">' +
          '<input type="number" id="in-weight" class="field" placeholder="e.g. 78.5" inputmode="decimal" step="0.1" min="20" max="300" style="flex:1;font-family:var(--font-m);font-size:15px;padding:10px 13px">' +
          '<span style="display:flex;align-items:center;color:var(--txt-3);font-size:13px;font-weight:600;flex-shrink:0">kg</span>' +
          '<button class="btn btn-primary btn-sm" id="btn-log-w" style="flex-shrink:0">' + TF.Icon('plus', 11) + ' LOG</button>' +
        '</div>' +
        (weightLog.length >= 2 ? '<div style="height:160px;margin-bottom:14px"><canvas id="chart-weight"></canvas></div>' : '') +
        (weightLog.length ? weightLog.slice(0, 8).map(function(entry, index) {
          var prev = weightLog[index + 1];
          var delta = prev ? (entry.kg - prev.kg) : 0;
          var deltaColor = delta > 0.05 ? 'var(--amber)' : delta < -0.05 ? 'var(--green)' : 'var(--txt-3)';
          return '<div class="weight-entry">' +
            '<span class="weight-date">' + TF.UI.formatDate(entry.date) + '</span>' +
            '<span class="weight-kg">' + entry.kg.toFixed(1) + ' kg</span>' +
            (Math.abs(delta) > 0.05 ? '<span class="weight-delta" style="color:' + deltaColor + '">' + (delta > 0 ? '+' : '') + delta.toFixed(1) + 'kg</span>' : '<span></span>') +
          '</div>';
        }).join('') : '<div class="t-hint" style="text-align:center;padding:12px 0">Log your weight daily or right inside workouts to track body composition trends.</div>') +
        '<div class="t-hint" style="margin-top:10px">Workout-day bodyweight entries feed this same chart automatically.</div>' +
      '</div>';
    }

    function prBoard() {
      if (!prKeys.length) return '<div class="card card-sm t-hint" style="text-align:center">Log workouts to track PRs.</div>';
      return '<div class="card">' +
        prKeys.slice(0, 8).map(function(name) {
          var pr = prs[name];
          var setDetail = (pr.weight && pr.reps) ? (pr.weight + 'kg x ' + pr.reps) : '';
          var ratio = latestBodyweight ? (pr.est1RM / latestBodyweight).toFixed(2) : null;
          return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">' +
            '<div>' +
              '<div style="font-size:13px;font-weight:600">' + name + '</div>' +
              '<div class="t-hint" style="font-size:11px">' + TF.UI.formatDate(pr.date) + (setDetail ? ' . ' + setDetail : '') + '</div>' +
            '</div>' +
            '<div style="text-align:right">' +
              '<div style="font-family:var(--font-m);font-size:15px;font-weight:700;color:var(--amber)">' + pr.est1RM + 'kg</div>' +
              '<div class="t-hint" style="font-size:10px">' + (ratio ? (ratio + 'x BW') : 'est. 1RM') + '</div>' +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>';
    }

    function ratioBoard() {
      if (!latestBodyweight || !prKeys.length) {
        return '<div class="card card-sm t-hint" style="text-align:center">Log bodyweight in workouts or in the weight log to unlock strength-to-bodyweight ratios.</div>';
      }
      return '<div class="card">' +
        prKeys.map(function(name) {
          return {
            name: name,
            ratio: prs[name].est1RM / latestBodyweight,
            est1RM: prs[name].est1RM,
            date: prs[name].date
          };
        }).sort(function(a, b) {
          return b.ratio - a.ratio;
        }).slice(0, 5).map(function(item) {
          return '<div class="history-exercise-line compact">' +
            '<div>' +
              '<div style="font-size:13px;font-weight:700;color:var(--txt)">' + item.name + '</div>' +
              '<div class="t-hint">' + item.est1RM + 'kg est. 1RM on ' + TF.UI.formatDate(item.date) + '</div>' +
            '</div>' +
            '<div class="t-mono" style="font-size:14px;color:var(--lime)">' + item.ratio.toFixed(2) + 'x BW</div>' +
          '</div>';
        }).join('') +
      '</div>';
    }

    function habitSection() {
      var top = TF.Config.DefaultHabits.map(function(habit) {
        return {
          id: habit.id,
          emoji: habit.emoji,
          label: habit.label,
          streak: TF.Store.getHabitStreak(habit.id),
          count: habitStats.counts[habit.id] || 0
        };
      }).sort(function(a, b) {
        return b.streak - a.streak;
      }).slice(0, 5);

      return '<div class="card">' +
        top.map(function(habit) {
          var pct = habitStats.days > 0 ? habit.count / habitStats.days : 0;
          return '<div class="avg-row">' +
            '<div class="avg-emoji">' + habit.emoji + '</div>' +
            '<div class="avg-label">' + habit.label + '</div>' +
            '<div style="flex:1;margin:0 10px">' + TF.UI.bar(pct, 'var(--lime)') + '</div>' +
            '<div style="font-size:11px;font-weight:600;color:var(--amber);white-space:nowrap">' + (habit.streak > 0 ? (habit.streak + 'd') : '-') + '</div>' +
          '</div>';
        }).join('') +
      '</div>';
    }

    function starterGuide() {
      if (hasCoreProgress) {
        return '';
      }
      return '<div class="starter-guide">' +
        '<div class="starter-guide-kicker">PROGRESS UNLOCK</div>' +
        '<div class="starter-guide-title">You need a little data first</div>' +
        '<div class="starter-guide-copy">This screen becomes powerful after your first few logs. Check in, train, and record bodyweight so the charts have something real to work with.</div>' +
        '<div class="starter-guide-list">' +
          '<div class="starter-guide-step"><div class="starter-guide-num">1</div><div><strong>Log 2+ check-ins</strong> to unlock trends, radar, and weekly averages.</div></div>' +
          '<div class="starter-guide-step"><div class="starter-guide-num">2</div><div><strong>Finish 1 workout</strong> to start building your PR board.</div></div>' +
          '<div class="starter-guide-step"><div class="starter-guide-num">3</div><div><strong>Record bodyweight</strong> to unlock strength-to-bodyweight ratios.</div></div>' +
        '</div>' +
        '<div class="starter-guide-actions">' +
          '<button class="btn btn-primary btn-sm" id="pr-cta-checkin" type="button">Check-in</button>' +
          '<button class="btn btn-ghost btn-sm" id="pr-cta-workout" type="button">Workout</button>' +
          '<button class="btn btn-ghost btn-sm" id="pr-cta-weight" type="button">Log weight</button>' +
        '</div>' +
      '</div>';
    }

    root.innerHTML = '<div class="screen">' +
      '<div class="hero-img-card" id="pr-hero">' +
        '<div class="skeleton" style="position:absolute;inset:0;border-radius:var(--r-lg)"></div>' +
        '<div class="hero-img-card-content">' +
          '<div class="t-label">YOUR PROGRESS</div>' +
          '<div class="t-headline">7-day view.<br>Patterns do not lie.</div>' +
        '</div>' +
      '</div>' +

      '<div class="grid-3" style="margin-bottom:20px">' +
        '<div class="stat-tile"><div class="stat-val" style="color:var(--amber)">' + (profile.streakDays || 0) + '</div><div class="stat-unit">days</div><div class="stat-label">Streak</div></div>' +
        '<div class="stat-tile"><div class="stat-val" style="color:var(--lime)">' + level + '</div><div class="stat-unit">level</div><div class="stat-label">Warrior</div></div>' +
        '<div class="stat-tile"><div class="stat-val" style="color:var(--blue)">' + profile.xp + '</div><div class="stat-unit">xp</div><div class="stat-label">Total</div></div>' +
      '</div>' +

      starterGuide() +

      (inputs.length >= 2 ? '<div class="section">' + TF.UI.secHdr('7-Day Focus Score') + '<div class="card card-sm"><div style="height:180px"><canvas id="chart-focus"></canvas></div></div></div>' : '<div class="card card-sm t-hint" style="text-align:center;margin-bottom:20px">Log 2+ check-ins to see your chart.</div>') +
      (inputs.length >= 2 ? '<div class="section">' + TF.UI.secHdr('Weekly Radar') + '<div class="card card-sm"><div style="height:200px"><canvas id="chart-radar"></canvas></div></div></div>' : '') +
      (inputs.length >= 2 ? '<div class="section">' + TF.UI.secHdr('Weekly Averages') + avgRows() + '</div>' : '') +
      (warnings.length ? '<div class="section">' + TF.UI.secHdr('Warnings') + warnings.map(TF.UI.insightCard).join('') + '</div>' : '') +

      '<div class="section">' + TF.UI.secHdr('Personal Records') + prBoard() + '</div>' +
      '<div class="section">' + TF.UI.secHdr('Strength / Bodyweight') + ratioBoard() + '</div>' +
      '<div class="section">' + TF.UI.secHdr('Top Habits') + habitSection() + '</div>' +

      '<div class="section">' + TF.UI.secHdr('Mission Stats') +
        '<div class="card card-sm"><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">' +
          '<div><div class="t-mono" style="font-size:22px;font-weight:800;color:var(--purple)">' + missionStats.totalCompleted + '</div><div class="t-hint">done</div></div>' +
          '<div><div class="t-mono" style="font-size:22px;font-weight:800;color:var(--teal)">' + missionStats.totalDays + '</div><div class="t-hint">active days</div></div>' +
          '<div><div class="t-mono" style="font-size:22px;font-weight:800;color:var(--lime)">' + (missionStats.totalMissions > 0 ? Math.round(missionStats.totalCompleted / missionStats.totalMissions * 100) : 0) + '%</div><div class="t-hint">completion</div></div>' +
        '</div></div>' +
      '</div>' +

      '<div class="section">' + TF.UI.secHdr('Weight Log') + weightSection() + '</div>' +
      '<div style="height:8px"></div>' +
    '</div>';

    TF.UI.setHeroImg(root.querySelector('#pr-hero'), TF.Config.Images.progress);

    var weightButton = root.querySelector('#btn-log-w');
    var weightInput = root.querySelector('#in-weight');
    function logWeight() {
      var value = parseFloat(weightInput.value);
      if (isNaN(value) || value < 20 || value > 300) {
        TF.UI.toast('Enter a valid weight (20-300 kg).', 'error');
        return;
      }
      TF.Store.addWeight(value);
      TF.UI.haptic(60);
      TF.UI.toast(value.toFixed(1) + ' kg logged.', 'success');
      TF.Achievements.check({ type: 'weight' }).forEach(function(id) {
        setTimeout(function() { TF.UI.achievementToast(id); }, 800);
      });
      draw();
    }
    if (weightButton) weightButton.addEventListener('click', logWeight);
    if (weightInput) weightInput.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') logWeight();
    });
    var checkinCta = root.querySelector('#pr-cta-checkin');
    if (checkinCta) checkinCta.addEventListener('click', function() {
      TF.Router.navigate('checkin');
    });
    var workoutCta = root.querySelector('#pr-cta-workout');
    if (workoutCta) workoutCta.addEventListener('click', function() {
      TF.Router.navigate('workout');
    });
    var weightCta = root.querySelector('#pr-cta-weight');
    if (weightCta) weightCta.addEventListener('click', function() {
      if (weightInput) {
        weightInput.focus();
      }
    });

    setTimeout(function() {
      if (inputs.length >= 2) {
        TF.Charts.focusLine('chart-focus', inputs);
        TF.Charts.weeklyRadar('chart-radar', inputs);
      }
      if (weightLog.length >= 2) {
        TF.Charts.weightLine('chart-weight', weightLog.slice(0, 10));
      }
    }, 80);
  }

  draw();
};
