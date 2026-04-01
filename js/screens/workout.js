TF.Screens.workout = function(root) {
  var profile = TF.Store.getProfile();
  var input = TF.Store.getTodayInput();
  var plan = TF.Workout.getToday(profile, input);
  var setLogs = {};
  var expanded = {};
  var newPRs = {};

  var todayLog = TF.Store.getTodayWorkoutLog();
  if (todayLog && todayLog.exercises) {
    setLogs = JSON.parse(JSON.stringify(todayLog.exercises));
  }

  function buildDefaultSets(ex) {
    var last = TF.Store.getLastWorkoutByExercise(ex.name);
    return Array.from({ length: ex.sets }, function(_, i) {
      var lastSet = last && last.sets && last.sets[i];
      return { weight: lastSet ? lastSet.weight : '', reps: lastSet ? lastSet.reps : '', done: false };
    });
  }

  function saveAllLogs() {
    Object.entries(setLogs).forEach(function(entry) {
      TF.Store.saveExerciseLog(entry[0], entry[1]);
    });
    plan.exercises.forEach(function(ex) {
      if (setLogs[ex.name]) TF.Overload.processSession(ex.name, ex.reps, setLogs[ex.name]);
    });
  }

  function checkPR(exName, weight, reps) {
    if (!weight || !reps) return false;
    var est = TF.Store.calc1RM(parseFloat(weight), parseInt(reps, 10));
    var pr = TF.Store.getPR(exName);
    return !pr || est > pr.est1RM;
  }

  function getWorkoutDescription() {
    var desc = plan.focus || '';
    var shortDashPrefix = plan.title + ' - ';
    var longDashPrefix = plan.title + ' \u2014 ';
    if (desc.indexOf(longDashPrefix) === 0) return desc.slice(longDashPrefix.length);
    if (desc.indexOf(shortDashPrefix) === 0) return desc.slice(shortDashPrefix.length);
    return desc;
  }

  function getPlanBadgeLabel() {
    if (plan.splitKey === 'push') return 'PUSH DAY';
    if (plan.splitKey === 'pull') return 'PULL DAY';
    if (plan.splitKey === 'legs') return 'LEGS DAY';
    if (plan.splitKey === 'recovery') return 'RECOVERY';
    return (plan.title || 'WORKOUT').toUpperCase();
  }

  function formatSubtitle(text) {
    if (!text) return '';
    return text
      .split(',')
      .map(function(part) {
        return part.trim().replace(/\b([a-z])/g, function(match) { return match.toUpperCase(); });
      })
      .filter(Boolean)
      .join(' &bull; ');
  }

  function render() {
    var allExDone = plan.exercises.length > 0 && plan.exercises.every(function(ex) {
      var log = setLogs[ex.name];
      return log && log.every(function(set) { return set.done; });
    });

    var totalVolume = 0;
    Object.entries(setLogs).forEach(function(entry) {
      entry[1].forEach(function(set) {
        if (set.done && set.weight && set.reps) totalVolume += parseFloat(set.weight) * parseInt(set.reps, 10);
      });
    });

    var workoutDesc = getWorkoutDescription();
    var workoutSubtitle = formatSubtitle(workoutDesc);
    var badgeLabel = getPlanBadgeLabel();
    var workoutDetails = plan.volumeNote ? plan.intensity + ' ' + plan.volumeNote : plan.intensity;

    root.innerHTML = '<div class="screen">' +
      '<div class="hero-img-card workout-hero" id="wo-hero">' +
        '<div class="skeleton" style="position:absolute;inset:0;border-radius:var(--r-lg)"></div>' +
        '<div class="hero-img-card-content workout-hero-content">' +
          '<div class="workout-hero-copy">' +
            '<div class="workout-hero-labels">' +
              '<span class="workout-hero-label">' + badgeLabel + '</span>' +
              '<span class="workout-hero-divider">|</span>' +
              '<span class="workout-hero-label">' + plan.estimatedMinutes + ' MIN</span>' +
            '</div>' +
            '<div class="workout-hero-title">' + plan.title + '</div>' +
            (workoutSubtitle ? '<div class="workout-hero-subtitle">' + workoutSubtitle + '</div>' : '') +
            '<div class="workout-hero-desc">' + workoutDetails + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      plan.exercises.map(function(ex, i) {
        if (!setLogs[ex.name]) setLogs[ex.name] = buildDefaultSets(ex);
        var sets = setLogs[ex.name];
        var isExpanded = !!expanded[ex.name];
        var exDone = sets.every(function(set) { return set.done; });
        var suggestion = TF.Overload.getSuggestionText(ex.name);
        var pr = TF.Store.getPR(ex.name);
        var isPRExercise = newPRs[ex.name];

        return '<div class="ex-row ' + (exDone ? 'done' : '') + (isExpanded ? ' active-logging' : '') + (isPRExercise ? ' pr-glow' : '') + '" data-ex="' + i + '" style="flex-direction:column;align-items:stretch;gap:0">' +
          '<div style="display:flex;align-items:center;gap:10px">' +
            '<div class="ex-idx">' + (exDone ? TF.Icon('check', 13) : '<span>' + (i + 1) + '</span>') + '</div>' +
            '<div class="ex-info" style="flex:1">' +
              '<div class="ex-name">' + ex.name + '</div>' +
              (ex.note ? '<div class="ex-note">' + ex.note + '</div>' : '') +
              (suggestion && !exDone ? '<div class="ex-suggestion">' + TF.Icon('trending-up', 10) + ' ' + suggestion + '</div>' : '') +
              (pr ? '<div class="ex-pr-badge">' + TF.Icon('trophy', 10) + ' est. 1RM: ' + pr.est1RM + 'kg</div>' : '') +
              (isPRExercise ? '<div style="font-size:11px;color:var(--amber);font-weight:700;margin-top:2px">' + TF.Icon('zap', 10) + ' NEW PR!</div>' : '') +
            '</div>' +
            '<div class="ex-sets">' + ex.sets + '</div>' +
            '<div class="ex-reps">' + ex.reps + '</div>' +
            '<div class="ex-rest">' + ex.rest + '</div>' +
          '</div>' +
          (isExpanded ? '<div class="set-log-panel" id="panel-' + i + '">' +
            sets.map(function(set, setIndex) {
              var lastLog = TF.Store.getLastWorkoutByExercise(ex.name);
              var lastSet = lastLog && lastLog.sets && lastLog.sets[setIndex];
              var isPRSet = set.weight && set.reps && checkPR(ex.name, set.weight, set.reps);
              return '<div class="set-row ' + (isPRSet && !set.done ? 'potential-pr' : '') + '">' +
                '<div class="set-num">SET ' + (setIndex + 1) + '</div>' +
                '<input class="set-input" data-ex="' + i + '" data-set="' + setIndex + '" data-field="weight" type="number" placeholder="' + (lastSet && lastSet.weight ? lastSet.weight : 'kg') + '" value="' + (set.weight || '') + '" inputmode="decimal" step="0.25">' +
                '<span class="set-sep">&times;</span>' +
                '<input class="set-input" data-ex="' + i + '" data-set="' + setIndex + '" data-field="reps" type="number" placeholder="' + (lastSet && lastSet.reps ? lastSet.reps : 'reps') + '" value="' + (set.reps || '') + '" inputmode="numeric">' +
                '<div class="set-done-check ' + (set.done ? 'done' : '') + '" data-ex="' + i + '" data-set="' + setIndex + '">' + TF.Icon('check', 12) + '</div>' +
                (lastSet ? '<div class="set-last">' + (lastSet.weight || '?') + 'kg x ' + (lastSet.reps || '?') + '</div>' : '') +
              '</div>';
            }).join('') +
          '</div>' : '') +
        '</div>';
      }).join('') +

      (allExDone ?
        '<div class="workout-complete">' +
          '<div style="font-family:var(--font-d);font-size:22px;font-weight:800;color:var(--lime);letter-spacing:1px">SESSION COMPLETE</div>' +
          (totalVolume > 0 ? '<div style="font-size:13px;color:var(--txt-2);margin-top:4px">Total volume: ' + Math.round(totalVolume) + 'kg lifted</div>' : '') +
          '<div class="t-hint mt-1">Well done. Recover, eat, sleep.</div>' +
        '</div>' : '') +

      '<div class="quote-card" style="margin-top:18px">' +
        '<div class="quote-text">' + plan.motivational + '</div>' +
      '</div>' +
      '<div style="height:8px"></div></div>';

    TF.UI.setHeroImg(root.querySelector('#wo-hero'), plan.image);

    root.querySelectorAll('.ex-row').forEach(function(row) {
      var topBar = row.querySelector('div:first-child');
      topBar.addEventListener('click', function() {
        var idx = parseInt(row.dataset.ex, 10);
        var ex = plan.exercises[idx];
        if (!ex) return;
        expanded[ex.name] = !expanded[ex.name];
        TF.UI.haptic(30);
        render();
      });
    });

    root.querySelectorAll('.set-input').forEach(function(inputEl) {
      inputEl.addEventListener('change', function() {
        var exIndex = parseInt(inputEl.dataset.ex, 10);
        var setIndex = parseInt(inputEl.dataset.set, 10);
        var field = inputEl.dataset.field;
        var ex = plan.exercises[exIndex];
        if (!ex || !setLogs[ex.name]) return;
        setLogs[ex.name][setIndex][field] = inputEl.value;
        saveAllLogs();

        var set = setLogs[ex.name][setIndex];
        if (set.weight && set.reps && checkPR(ex.name, set.weight, set.reps)) {
          var panel = document.getElementById('panel-' + exIndex);
          if (panel) {
            var rows = panel.querySelectorAll('.set-row');
            if (rows[setIndex]) rows[setIndex].classList.add('potential-pr');
          }
        }
      });
      inputEl.addEventListener('click', function(e) { e.stopPropagation(); });
    });

    root.querySelectorAll('.set-done-check').forEach(function(button) {
      button.addEventListener('click', function(e) {
        e.stopPropagation();
        var exIndex = parseInt(button.dataset.ex, 10);
        var setIndex = parseInt(button.dataset.set, 10);
        var ex = plan.exercises[exIndex];
        if (!ex || !setLogs[ex.name]) return;

        setLogs[ex.name][setIndex].done = !setLogs[ex.name][setIndex].done;
        TF.UI.haptic(50);
        saveAllLogs();

        if (setLogs[ex.name][setIndex].done) {
          var set = setLogs[ex.name][setIndex];
          if (set.weight && set.reps && checkPR(ex.name, set.weight, set.reps)) {
            newPRs[ex.name] = true;
            TF.UI.toast('NEW PR on ' + ex.name + '!', 'success', 3500);
            TF.UI.confetti();
          }
          TF.UI.startRestTimer(ex.restSeconds || 90);
        }

        var unlocked = TF.Achievements.check({ type: 'workout' });
        unlocked.forEach(function(id) {
          setTimeout(function() { TF.UI.achievementToast(id); }, 800);
        });
        render();
      });
    });
  }

  var skipBtn = document.getElementById('rt-skip');
  if (skipBtn) skipBtn.onclick = TF.UI.stopRestTimer;

  render();
};
