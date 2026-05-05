TF.Screens.dashboard = function(root) {
  var profile = TF.Store.getProfile();
  var input = TF.Store.getTodayInput();
  var nutrition = TF.Store.getTodayNutrition();
  var yesterday = TF.Store.getInputForDate(TF.Store.yesterday());
  var safeName = TF.UI.escapeHTML(profile.name);
  var hour = new Date().getHours();
  var greet = hour < 12 ? 'Good morning,' : hour < 17 ? 'Good afternoon,' : 'Good evening,';
  var habitsDone = TF.Habits.getDoneCount();
  var todayWeekday = new Date().toLocaleDateString('en-GB', { weekday: 'long' });
  var todayDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  var workoutDay = TF.Store.getTodayWorkoutLog();
  var hasWorkoutData = !!(workoutDay && (Object.keys(workoutDay.exercises || {}).length || workoutDay.notes || workoutDay.bodyweightKg));
  var hasNutritionData = !!((nutrition.calories || 0) || (nutrition.protein || 0) || (nutrition.fat || 0) || (nutrition.carbs || 0));
  var hasFirstCheckin = Object.keys(TF.Store.getAllInputs()).length > 0;
  var hasFirstNutrition = Object.values(TF.Store.getAllNutrition()).some(function(day) {
    return !!((day.calories || 0) || (day.protein || 0) || (day.fat || 0) || (day.carbs || 0));
  });
  var hasFirstWorkout = Object.values(TF.Store.getAllWorkoutLogs()).some(function(day) {
    return !!(day && (Object.keys(day.exercises || {}).length || day.startedAt || day.finishedAt || day.notes || day.bodyweightKg));
  });

  function getDashboardMissions() {
    return TF.Missions.ensureToday
      ? TF.Missions.ensureToday(profile, input)
      : TF.Store.getTodayMissions();
  }

  function getMissionSummaryState() {
    var list = getDashboardMissions();
    return {
      missions: list,
      done: list.filter(function(mission) { return mission.done; }).length,
      total: list.length,
      xpDone: list.filter(function(mission) { return mission.done; }).reduce(function(sum, mission) { return sum + mission.xpReward; }, 0),
      xpTotal: list.reduce(function(sum, mission) { return sum + mission.xpReward; }, 0)
    };
  }

  function workoutDoneSetCount() {
    var exercises = workoutDay && workoutDay.exercises ? workoutDay.exercises : {};
    var doneSets = 0;
    var totalSets = 0;
    Object.values(exercises).forEach(function(sets) {
      (sets || []).forEach(function(set) {
        if (set.type !== 'warmup') {
          totalSets += 1;
          if (set.done) doneSets += 1;
        }
      });
    });
    return { done: doneSets, total: totalSets };
  }

  function workoutVolume() {
    var exercises = workoutDay && workoutDay.exercises ? workoutDay.exercises : {};
    var volume = 0;
    Object.values(exercises).forEach(function(sets) {
      (sets || []).forEach(function(set) {
        if (set.done && set.type !== 'warmup' && set.weight && set.reps) {
          volume += (parseFloat(set.weight) || 0) * (parseInt(set.reps, 10) || 0);
        }
      });
    });
    return Math.round(volume);
  }

  function scoreTrend() {
    if (!input || !yesterday) return '';
    var todayScore = TF.Score.daily(input);
    var yesterdayScore = TF.Score.daily(yesterday);
    var delta = todayScore - yesterdayScore;
    if (Math.abs(delta) < 2) {
      return '<span style="color:var(--txt-3);font-size:12px;font-weight:600">flat</span>';
    }
    var color = delta > 0 ? 'var(--lime)' : 'var(--red)';
    return '<span style="color:' + color + ';font-size:12px;font-weight:700">' +
      (delta > 0 ? '+' : '-') + Math.abs(delta) + ' vs yesterday</span>';
  }

  function sparkline() {
    var inputs = TF.Store.getLastNInputs(7).reverse();
    if (inputs.length < 2) return '';
    var scores = inputs.map(function(item) { return TF.Score.daily(item); });
    var width = 100;
    var height = 28;
    var pad = 3;
    var min = Math.min.apply(null, scores);
    var max = Math.max.apply(null, scores);
    var range = max - min || 1;
    var points = scores.map(function(value, index) {
      var x = pad + (index / (scores.length - 1)) * (width - pad * 2);
      var y = height - pad - ((value - min) / range) * (height - pad * 2);
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    var lastScore = scores[scores.length - 1];
    var color = lastScore >= 74 ? 'var(--lime)' : lastScore >= 52 ? 'var(--blue)' : 'var(--red)';
    return '<svg width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '" style="margin-top:4px">' +
      '<polyline fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="' + points + '"/>' +
    '</svg>';
  }

  function heroMetric(label, value, tone) {
    return '<div class="dashboard-hero-metric">' +
      '<span>' + label + '</span>' +
      '<strong style="color:' + tone + '">' + value + '</strong>' +
    '</div>';
  }

  function dashboardHero() {
    var missionState = getMissionSummaryState();
    var focusValue = input ? TF.Score.daily(input) : '--';
    var focusTone = input ? TF.Score.color(focusValue) : 'var(--txt-2)';
    var missionValue = missionState.total ? missionState.done + '/' + missionState.total : 'Locked';
    var workoutProgress = workoutDoneSetCount();
    var workoutValue = workoutProgress.total ? workoutProgress.done + '/' + workoutProgress.total : 'Plan';
    var habitValue = habitsDone + '/' + TF.Config.DefaultHabits.length;
    var readiness = input ? TF.Score.label(focusValue) + ' readiness' : 'check in to unlock today&#39;s score';

    return '<div class="dashboard-hero hero-img-card" id="dash-hero">' +
      '<div class="skeleton" style="position:absolute;inset:0;border-radius:var(--r-lg)"></div>' +
      '<div class="dashboard-hero-content hero-img-card-content">' +
        '<div class="dashboard-hero-top">' +
          '<div>' +
            '<div class="dashboard-hero-title">' + greet + '<br>' + safeName + '</div>' +
            '<div class="dashboard-hero-copy">' + todayWeekday + ' &middot; ' + todayDate + ' &middot; ' + readiness + '</div>' +
          '</div>' +
          '<button class="btn btn-primary btn-sm dashboard-hero-cta" id="btn-checkin-top" type="button">' + TF.Icon('plus', 12) + (input ? ' Update' : ' Check-in') + '</button>' +
        '</div>' +
        '<div class="dashboard-hero-strip">' +
          heroMetric('Focus', focusValue, focusTone) +
          heroMetric('Missions', missionValue, 'var(--blue)') +
          heroMetric('Workout', workoutValue, 'var(--amber)') +
          heroMetric('Habits', habitValue, 'var(--lime)') +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function scoreHero() {
    var score      = TF.Score.daily(input);
    var recovery   = TF.Score.recovery(input);
    var discipline = TF.Score.discipline(input);
    var focus      = TF.Score.focus(input);
    var label      = TF.Score.label(score);
    var glow       = TF.Score.glow(score);

    /* SVG ring geometry */
    var size   = 180, stroke = 12;
    var r      = (size - stroke) / 2;
    var circ   = 2 * Math.PI * r;

    return '<div class="score-hero dashboard-score-panel" id="score-hero-el">' +
      '<div class="score-hero-glow" style="background:' + glow + '"></div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">' +
        '<div class="t-label">DAILY FOCUS SCORE</div>' +
        scoreTrend() +
      '</div>' +

      /* ── Animated Ring ── */
      '<div class="score-ring-wrap" id="score-ring-wrap" role="button" tabindex="0" aria-label="View score breakdown">' +
        '<div class="score-ring-inner">' +
          '<svg class="score-ring-svg" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" aria-hidden="true">' +
            '<circle class="score-ring-track" fill="none"' +
              ' cx="' + (size/2) + '" cy="' + (size/2) + '" r="' + r + '"' +
              ' stroke="var(--bg-5)" stroke-width="' + stroke + '"/>' +
            '<circle id="score-ring-fill" class="score-ring-fill" fill="none"' +
              ' cx="' + (size/2) + '" cy="' + (size/2) + '" r="' + r + '"' +
              ' stroke="var(--lime)" stroke-width="' + stroke + '"' +
              ' stroke-linecap="round"' +
              ' stroke-dasharray="' + circ.toFixed(2) + '"' +
              ' stroke-dashoffset="' + circ.toFixed(2) + '"/>' +
          '</svg>' +
          '<div class="score-ring-label">' +
            '<div class="score-ring-num" id="score-ring-num">0</div>' +
            '<div class="score-ring-sub">' + label + '</div>' +
            '<div class="score-ring-tap-hint">tap to expand</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="score-subs" style="margin-top:16px">' +
        '<div class="score-sub"><div class="score-sub-val" style="color:var(--blue)">'   + recovery   + '</div><div class="score-sub-label">Recovery</div></div>' +
        '<div class="score-divider"></div>' +
        '<div class="score-sub"><div class="score-sub-val" style="color:var(--amber)">'  + discipline + '</div><div class="score-sub-label">Discipline</div></div>' +
        '<div class="score-divider"></div>' +
        '<div class="score-sub"><div class="score-sub-val" style="color:var(--purple)">' + input.sleepQuality + '/10</div><div class="score-sub-label">Sleep</div></div>' +
      '</div>' +
      '<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);font-size:11px;font-weight:700;letter-spacing:.4px;color:' + TF.Score.color(score) + '">' +
        'Next move: ' + TF.Score.trainingRec(recovery) +
      '</div>' +
    '</div>';
  }

  function openScoreBreakdownModal() {
    if (!input) return;
    var score      = TF.Score.daily(input);
    var recovery   = TF.Score.recovery(input);
    var discipline = TF.Score.discipline(input);
    var focus      = TF.Score.focus(input);
    var sleepQ     = input.sleepQuality || 0;
    var color      = TF.Score.color(score);

    function brow(label, val, maxVal, clr) {
      var pct = Math.round((val / maxVal) * 100);
      return '<div class="score-breakdown-row">' +
        '<div>' +
          '<div class="score-breakdown-label">' + label + '</div>' +
          '<div class="score-breakdown-bar"><div class="score-breakdown-bar-fill" style="width:' + pct + '%;background:' + clr + '"></div></div>' +
        '</div>' +
        '<div class="score-breakdown-val" style="color:' + clr + '">' + val + '</div>' +
      '</div>';
    }

    var content = '<div class="score-breakdown-modal">' +
      '<div style="text-align:center;margin-bottom:20px">' +
        '<div style="font-family:var(--font-d);font-size:64px;font-weight:900;line-height:.9;color:' + color + '">' + score + '</div>' +
        '<div style="margin-top:6px"><span class="score-badge" style="background:' + TF.Score.bg(score) + ';color:' + color + '">' + TF.Score.label(score) + '</span></div>' +
        sparkline() +
      '</div>' +
      brow('Daily Score',  score,      100, color) +
      brow('Focus',        focus,      100, 'var(--lime)') +
      brow('Recovery',     recovery,   100, 'var(--blue)') +
      brow('Discipline',   discipline, 100, 'var(--amber)') +
      brow('Sleep Quality', sleepQ,    10,  'var(--purple)') +
      '<div style="margin-top:16px;padding:12px;background:var(--bg-3);border-radius:var(--r-sm);font-size:12px;color:var(--txt-2);line-height:1.5">' +
        '<strong style="color:' + color + '">Training recommendation:</strong><br>' +
        TF.Score.trainingRec(recovery) +
      '</div>' +
    '</div>';

    TF.UI.modal({ title: 'Score Breakdown', content: content, confirmText: 'Close', onConfirm: function() { TF.UI.closeModal(); } });
  }

  function checkinCard() {
    return '<div class="card card-glow dashboard-action-card" id="cta-checkin" style="cursor:pointer;display:flex;align-items:center;gap:15px;padding:16px" role="button" tabindex="0" aria-label="Open daily check-in">' +
      '<div class="dashboard-action-icon">' + TF.Icon('zap', 22) + '</div>' +
      '<div style="flex:1">' +
        '<div class="t-title" style="color:var(--lime);margin-bottom:3px">Daily Check-in</div>' +
        '<div class="t-hint">30 seconds to unlock your score and missions</div>' +
      '</div>' +
      '<div style="color:var(--txt-3)">' + TF.Icon('arrow-right', 18) + '</div>' +
    '</div>';
  }

  function missionSummary() {
    var missionState = getMissionSummaryState();
    var missions = missionState.missions;
    if (!missionState.total) {
      return '<div class="card card-sm dashboard-summary-card dashboard-mission-card dashboard-locked-card" id="cta-missions-locked" style="cursor:pointer" role="button" tabindex="0" aria-label="Open check-in to unlock missions">' +
        '<div class="dashboard-card-icon dashboard-locked-icon">' + TF.Icon('zap', 13) + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div class="dashboard-card-title-row">' +
            '<span class="t-title">Daily Missions</span>' +
            '<span class="dashboard-lock-badge">LOCKED</span>' +
          '</div>' +
          '<div class="t-hint">Complete Check-in to unlock today&#39;s missions.</div>' +
          '<div class="dashboard-locked-action">Start check-in</div>' +
        '</div>' +
        '<div style="color:var(--txt-3);flex-shrink:0">' + TF.Icon('arrow-right', 14) + '</div>' +
      '</div>';
    }
    var pct = missionState.done / missionState.total;
    var allDone = missionState.done === missionState.total;
    var colMap = { workout: 'var(--lime)', nutrition: 'var(--blue)', habit: 'var(--amber)', activity: 'var(--purple)', mindset: 'var(--teal)' };
    var chips = missions.map(function(mission) {
      var color = colMap[mission.type] || 'var(--lime)';
      return '<div title="' + TF.UI.escapeAttr(mission.title) + '" style="width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;' +
        (mission.done ? 'background:' + color + '22;border:1.5px solid ' + color + '88' : 'background:var(--bg-3);border:1.5px solid var(--border);opacity:.4') +
        '">' +
        (mission.done ? '<svg viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px"><polyline points="20 6 9 17 4 12"/></svg>' : '<div style="width:6px;height:6px;border-radius:50%;background:' + color + '60"></div>') +
      '</div>';
    }).join('');
    var preview = missions.slice(0, 3).map(function(mission) {
      var color = colMap[mission.type] || 'var(--lime)';
      return '<div class="dashboard-mission-preview-row">' +
        '<span style="background:' + color + '"></span>' +
        '<strong>' + TF.UI.escapeHTML(mission.title) + '</strong>' +
        '<em>' + (mission.done ? 'Done' : '+' + mission.xpReward + ' XP') + '</em>' +
      '</div>';
    }).join('');

    return '<div class="card card-sm dashboard-summary-card dashboard-mission-card" id="cta-missions" style="cursor:pointer" role="button" tabindex="0" aria-label="Open daily missions">' +
      '<div class="flex-between" style="margin-bottom:8px">' +
        '<span class="t-title">' + missionState.done + '/' + missionState.total + ' missions</span>' +
        '<span class="t-mono" style="font-size:18px;font-weight:800;color:' + (allDone ? 'var(--lime)' : 'var(--blue)') + '">' + missionState.xpDone + '/' + missionState.xpTotal + ' XP</span>' +
      '</div>' +
      '<div style="display:flex;gap:6px;margin-bottom:8px">' + chips + '</div>' +
      '<div class="dashboard-mission-preview-list">' + preview + '</div>' +
      TF.UI.bar(pct, allDone ? 'var(--lime)' : 'var(--blue)') +
      (allDone ? '<div style="margin-top:8px;font-size:13px;color:var(--lime);font-weight:700">Full clear. ' + missionState.xpTotal + ' XP earned.</div>' : '<div style="margin-top:8px;font-size:12px;color:var(--txt-3);font-weight:700">Tap to open all missions.</div>') +
    '</div>';
  }

  function splitBadge(plan) {
    if (plan.splitKey === 'push') return 'PU';
    if (plan.splitKey === 'pull') return 'PL';
    if (plan.splitKey === 'legs') return 'LG';
    if (plan.splitKey === 'recovery') return 'RC';
    return 'WK';
  }

  function nextWorkoutCard() {
    var plan = TF.Workout.getToday(profile, input);
    var color = plan.splitKey === 'recovery' ? 'var(--teal)' : plan.splitKey === 'push' ? 'var(--amber)' : plan.splitKey === 'pull' ? 'var(--blue)' : 'var(--purple)';
    var progress = workoutDoneSetCount();
    var volume = workoutVolume();
    var isFinished = !!(workoutDay && workoutDay.finishedAt);
    var isInProgress = !isFinished && progress.done > 0;
    var statusLine = plan.estimatedMinutes + ' min &middot; ' + plan.exercises.length + ' exercises';
    if (isFinished) {
      statusLine = (volume > 0 ? volume + ' kg &middot; ' : '') + progress.done + ' sets done';
    } else if (isInProgress) {
      statusLine = progress.done + '/' + progress.total + ' sets &middot; ' + (volume > 0 ? volume + ' kg' : 'in progress');
    }
    var statusBadge = isFinished
      ? '<span style="font-size:10px;font-weight:800;color:var(--lime);background:var(--lime-dim);border:1px solid var(--lime-mid);border-radius:6px;padding:2px 7px;letter-spacing:.4px">DONE</span>'
      : isInProgress
        ? '<span style="font-size:10px;font-weight:800;color:var(--amber);background:rgba(255,170,0,.1);border:1px solid rgba(255,170,0,.25);border-radius:6px;padding:2px 7px;letter-spacing:.4px">IN PROGRESS</span>'
        : TF.Icon('arrow-right', 16);

    return '<div class="card card-sm dashboard-summary-card dashboard-workout-card" id="cta-workout" style="cursor:pointer;display:flex;align-items:center;gap:12px;padding:14px" role="button" tabindex="0" aria-label="Open today&#39;s workout">' +
      '<div style="width:42px;height:42px;border-radius:11px;background:var(--bg-3);border:1px solid ' + color + ';display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:' + color + ';flex-shrink:0">' + splitBadge(plan) + '</div>' +
      '<div style="flex:1">' +
        '<div style="font-size:13px;font-weight:700;color:' + color + ';margin-bottom:2px">' + TF.UI.escapeHTML(plan.title) + '</div>' +
        '<div class="t-hint">' + statusLine + '</div>' +
        (isInProgress ? '<div style="margin-top:5px">' + TF.UI.bar(progress.total > 0 ? progress.done / progress.total : 0, color) + '</div>' : '') +
      '</div>' +
      statusBadge +
    '</div>';
  }

  function habitsSummary() {
    var habits = TF.Habits.getTodayStatus();
    var total = habits.length;
    var pct = total > 0 ? habitsDone / total : 0;
    var allComplete = habitsDone === total && total > 0;
    var color = allComplete ? 'var(--lime)' : habitsDone >= total * 0.5 ? 'var(--blue)' : 'var(--txt-3)';
    var streaks = TF.Store.getHabitStreaks();
    var bestHabitStreak = Object.values(streaks).reduce(function(best, streak) {
      return Math.max(best, streak.current || 0);
    }, 0);
    var tiles = habits.map(function(habit) {
      var streak = streaks[habit.id] || { current: 0 };
      var onFire = streak.current >= 7;
      return '<div title="' + TF.UI.escapeAttr(habit.label) + (streak.current > 0 ? ' &middot; ' + streak.current + 'd streak' : '') + '" style="display:flex;flex-direction:column;align-items:center;gap:2px;min-width:0">' +
        '<div style="width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;' +
          (habit.done ? 'background:var(--lime-dim);border:1.5px solid var(--lime-mid)' : 'background:var(--bg-3);border:1.5px solid var(--border);opacity:.45') + '">' +
          TF.UI.escapeHTML(habit.emoji) +
        '</div>' +
        (onFire && habit.done ? '<span style="font-size:9px;line-height:1">\u{1F525}</span>' : '<div style="height:13px"></div>') +
      '</div>';
    }).join('');

    return '<div class="card card-sm dashboard-summary-card dashboard-habits-card" id="cta-habits" style="cursor:pointer" role="button" tabindex="0" aria-label="Open habits">' +
      '<div class="flex-between" style="margin-bottom:8px">' +
        '<span class="t-title">Daily Habits</span>' +
        '<div style="display:flex;align-items:center;gap:6px">' +
          (bestHabitStreak >= 3 ? '<span class="t-hint" style="font-size:11px;color:var(--amber)">' + (bestHabitStreak >= 7 ? '\u{1F525}' : '\u26A1') + ' ' + bestHabitStreak + 'd</span>' : '') +
          '<span class="t-mono" style="font-weight:700;color:' + color + '">' + habitsDone + '/' + total + '</span>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">' + tiles + '</div>' +
      TF.UI.bar(pct, allComplete ? 'var(--lime)' : 'var(--blue)') +
      (allComplete ? '<div style="margin-top:6px;font-size:12px;color:var(--lime);font-weight:700">Perfect discipline day.</div>' : '') +
    '</div>';
  }

  /* ── v5.8 — 7-Day Trend Badges ──────────────────────────────── */
  function trendBadgesSection() {
    if (!TF.Trends) return '';
    var declining = TF.Trends.getDecliningMetrics();
    if (!declining.length) return '';
    var badges = declining.map(function (d) {
      var icon = d.metric === 'sleep' || d.metric === 'sleepHrs' ? '🌙' :
                 d.metric === 'energy' ? '⚡' :
                 d.metric === 'focus'  ? '🎯' : '🔥';
      return '<div style="display:inline-flex;align-items:center;gap:6px;' +
        'background:var(--red-dim);border:1px solid var(--red)44;' +
        'border-radius:20px;padding:5px 12px;font-size:12px;font-weight:600;color:var(--red)">' +
        icon + ' ' + d.label + ' declining' +
      '</div>';
    }).join('');
    return '<div class="section stagger-card">' +
      TF.UI.secHdr('7-Day Trend Alert') +
      '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px">' + badges + '</div>' +
      '<div class="t-hint">Rolling 7-day average is down vs the prior 7 days. Tap Check-in to investigate.</div>' +
    '</div>';
  }

  function starterGuide() {
    if (hasFirstCheckin && hasFirstNutrition && hasFirstWorkout) return '';
    return '<div class="starter-guide dashboard-starter">' +
      '<div class="starter-guide-kicker">START HERE</div>' +
      '<div class="starter-guide-title">Build your first clean day</div>' +
      '<div class="starter-guide-copy">The app gets much smarter after your first check-in, workout, and nutrition entry. These three actions unlock the core loop.</div>' +
      '<div class="starter-guide-list">' +
        '<div class="starter-guide-step"><div class="starter-guide-num">1</div><div><strong>' + (hasFirstCheckin ? 'Check-in done' : 'Check in') + '</strong> ' + (hasFirstCheckin ? 'Your first score and missions are unlocked.' : 'Generate your score and daily missions.') + '</div></div>' +
        '<div class="starter-guide-step"><div class="starter-guide-num">2</div><div><strong>' + (hasFirstNutrition ? 'Nutrition logged' : 'Log food') + '</strong> ' + (hasFirstNutrition ? 'Macro tracking has its first baseline.' : 'Start tracking calories, protein, and macros.') + '</div></div>' +
        '<div class="starter-guide-step"><div class="starter-guide-num">3</div><div><strong>' + (hasFirstWorkout ? 'Workout started' : 'Finish a workout') + '</strong> ' + (hasFirstWorkout ? 'Training history has started saving.' : 'Unlock PR history and progress charts.') + '</div></div>' +
      '</div>' +
      '<div class="starter-guide-actions">' +
        '<button class="btn btn-primary btn-sm" id="cta-start-checkin" type="button">Check-in</button>' +
        '<button class="btn btn-ghost btn-sm" id="cta-start-nutrition" type="button">Nutrition</button>' +
        '<button class="btn btn-ghost btn-sm" id="cta-start-workout" type="button">Workout</button>' +
      '</div>' +
    '</div>';
  }

  root.innerHTML = '<div class="screen dashboard-screen">' +
    dashboardHero() +
    '<div class="dashboard-overview-grid">' +
      '<div class="dashboard-main-stack">' +
        '<div class="stagger-card">' + (input ? scoreHero() : checkinCard()) + '</div>' +
        '<div class="stagger-card dashboard-xp-wrap">' + TF.UI.xpRow(profile) + '</div>' +
      '</div>' +
      '<div class="dashboard-side-stack">' +
        '<div class="stagger-card">' + missionSummary()   + '</div>' +
        '<div class="stagger-card">' + nextWorkoutCard()  + '</div>' +
        '<div class="stagger-card">' + habitsSummary()    + '</div>' +
      '</div>' +
    '</div>' +
    starterGuide() +
    trendBadgesSection() +
    (input ? '<div class="section stagger-card">' + TF.UI.secHdr('Coach Insights') + TF.Score.insights(input, nutrition).slice(0, 3).map(TF.UI.insightCard).join('') + '</div>' : '') +
    '<div class="section stagger-card">' +
      TF.UI.secHdr('Daily Dispatch') +
      '<div id="quote-card" class="quote-card"><div class="t-hint" style="font-style:italic;animation:pulse 1.4s infinite">Forging today&#39;s dispatch...</div></div>' +
    '</div>' +
  '</div>';

  function handleRootClick(e) {
    var levelCard = e.target.closest('#more-level-card');
    if (levelCard) {
      TF.UI.modal({
        icon: 'trophy',
        title: 'Level Guide',
        html: TF.UI.buildLevelGuide(),
        cancelText: 'Close',
        confirmText: 'Open Profile',
        onOpen: function(card) {
          var current = card && card.querySelector('#level-guide-current');
          if (current) current.scrollIntoView({ block: 'center', behavior: 'auto' });
        },
        onConfirm: function() { TF.Router.navigate('profile'); }
      });
    }
  }

  function handleRootKeydown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var target = e.target.closest('#more-level-card, #cta-checkin, #cta-missions, #cta-missions-locked, #cta-workout, #cta-habits');
    if (!target) return;
    e.preventDefault();
    target.click();
  }

  root.addEventListener('click', handleRootClick);
  root.addEventListener('keydown', handleRootKeydown);

  var heroEl = root.querySelector('#dash-hero');
  if (heroEl) TF.UI.setHeroImg(heroEl, TF.Config.Images.dashboard);

  if (input) {
    setTimeout(function() {
      TF.UI.animateScoreRing(TF.Score.daily(input));
    }, 120);

    /* Tap ring → score breakdown modal */
    var ringWrap = root.querySelector('#score-ring-wrap');
    if (ringWrap) {
      ringWrap.addEventListener('click', openScoreBreakdownModal);
      ringWrap.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openScoreBreakdownModal(); }
      });
    }
  }

  var topCheckinBtn = root.querySelector('#btn-checkin-top');
  if (topCheckinBtn) topCheckinBtn.addEventListener('click', function() { TF.Router.navigate('checkin'); });
  var ctaBtn = root.querySelector('#cta-checkin');
  if (ctaBtn) ctaBtn.addEventListener('click', function() { TF.Router.navigate('checkin'); });
  var lockedMissionsBtn = root.querySelector('#cta-missions-locked');
  if (lockedMissionsBtn) lockedMissionsBtn.addEventListener('click', function() { TF.Router.navigate('checkin'); });
  var missionsBtn = root.querySelector('#cta-missions');
  if (missionsBtn) missionsBtn.addEventListener('click', function() { TF.Router.navigate('missions'); });
  var workoutBtn = root.querySelector('#cta-workout');
  if (workoutBtn) workoutBtn.addEventListener('click', function() { TF.Router.navigate('workout'); });
  var habitsBtn = root.querySelector('#cta-habits');
  if (habitsBtn) habitsBtn.addEventListener('click', function() { TF.Router.navigate('habits'); });
  var startCheckinBtn = root.querySelector('#cta-start-checkin');
  if (startCheckinBtn) startCheckinBtn.addEventListener('click', function() { TF.Router.navigate('checkin'); });
  var startNutritionBtn = root.querySelector('#cta-start-nutrition');
  if (startNutritionBtn) startNutritionBtn.addEventListener('click', function() { TF.Router.navigate('nutrition'); });
  var startWorkoutBtn = root.querySelector('#cta-start-workout');
  if (startWorkoutBtn) startWorkoutBtn.addEventListener('click', function() { TF.Router.navigate('workout'); });

  function renderQuote(quote) {
    var quoteEl = root.querySelector('#quote-card');
    if (!quoteEl) return;
    quoteEl.innerHTML = '<div class="quote-card-cat">' + TF.UI.escapeHTML((quote.cat || 'stoic').toUpperCase()) + '</div>' +
      '<div class="quote-text">"' + TF.UI.escapeHTML(quote.text) + '"</div>' +
      '<div class="quote-author">- ' + TF.UI.escapeHTML(quote.author) + '</div>' +
      '<button class="quote-copy-btn" id="btn-copy-quote" type="button" title="Copy quote" aria-label="Copy quote">' + TF.Icon('copy', 12) + '</button>';

    quoteEl.querySelector('#btn-copy-quote').addEventListener('click', function() {
      var quoteLine = '"' + quote.text + '" - ' + quote.author;
      TF.UI.copyText(quoteLine).then(function() {
        TF.UI.toast('Quote copied.', 'success');
      }).catch(function() {
        TF.UI.toast('Clipboard blocked.', 'error');
      });
    });
  }

  function refreshQuote(forceRefresh) {
    TF.Quotes.getCurrent(forceRefresh).then(function(quote) {
      renderQuote(TF.Quotes.normalise(quote));
    });
  }

  var quoteInterval = null;
  refreshQuote(true);
  quoteInterval = setInterval(function() {
    refreshQuote(true);
  }, 60000);

  root._screenCleanup = function() {
    root.removeEventListener('click', handleRootClick);
    root.removeEventListener('keydown', handleRootKeydown);
    if (quoteInterval) clearInterval(quoteInterval);
    quoteInterval = null;
  };

  TF.UI.checkStorageAndWarn();
};
