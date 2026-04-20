/* ================================================================
   WORKOUT SCREEN v5.6 - richer logging, snapshots, and faster UX
   ================================================================ */
TF.Screens.workout = function(root) {
  'use strict';

  var profile = TF.Store.getProfile();
  var input = TF.Store.getTodayInput();
  var todayKey = TF.Store.todayKey();
  var plan = TF.Workout.getToday(profile, input);
  var todayLog = TF.Store.getTodayWorkoutLog();
  var setLogs = {};
  var expanded = {};
  var newPRs = {};
  var undoState = null;
  var autosaveInterval = null;
  var notesDebounce = null;
  var SWITCH_UNDO_KEY = 'tf_workout_switch_undo';
  var W = TF.WorkoutScreenHelpers;
  var SPLIT_SWITCH_OPTIONS = [
    { key: 'push', label: 'Push', hint: 'Chest + shoulders' },
    { key: 'pull', label: 'Pull', hint: 'Back + biceps' },
    { key: 'legs', label: 'Legs', hint: 'Lower body' },
    { key: 'bodyweight', label: 'Full-body', hint: 'Reset flow' },
    { key: 'recovery', label: 'Recovery', hint: 'Mobility' }
  ];
  var sessionState = {
    notes: todayLog.notes || '',
    bodyweightKg: todayLog.bodyweightKg || '',
    lastSavedAt: todayLog.updatedAt || null,
    startedAt: todayLog.startedAt || null,
    finishedAt: todayLog.finishedAt || null
  };

  function cloneExercise(exercise) {
    return W.cloneExercise(exercise);
  }

  function snapshotExercises(list) {
    return W.snapshotExercises(list);
  }

  function cloneWorkoutDay(day) {
    return W.cloneWorkoutDay(day);
  }

  function loadSwitchUndo() {
    return W.loadSwitchUndo(SWITCH_UNDO_KEY, todayKey);
  }

  function saveSwitchUndo(payload) {
    W.saveSwitchUndo(SWITCH_UNDO_KEY, todayKey, payload);
  }

  function clearSwitchUndo() {
    W.clearSwitchUndo(SWITCH_UNDO_KEY);
  }

  function hasWorkoutActivity(day) {
    return W.hasWorkoutActivity(day);
  }

  function isSameSession(log, currentPlan) {
    return W.isSameSession(log, currentPlan);
  }

  function hydratePlanFromTodayLog() {
    var hydrated = W.hydratePlanFromTodayLog(todayLog, plan);
    if (hydrated && hydrated.length) {
      plan.exercises = hydrated;
    }
  }

  function persistSessionMeta() {
    var day = TF.Store.getWorkoutDay(todayKey);
    var saved;
    day.notes = sessionState.notes || day.notes || '';
    day.bodyweightKg = sessionState.bodyweightKg || day.bodyweightKg || '';
    day.sourceType = plan.sourceType || 'generated';
    day.workoutId = plan.workoutId || null;
    day.workoutName = plan.workoutName || plan.title || '';
    day.splitKey = plan.splitKey || null;
    day.planSnapshot = snapshotExercises(plan.exercises);
    day.startedAt = day.startedAt || sessionState.startedAt || new Date().toISOString();
    day.finishedAt = sessionState.finishedAt || day.finishedAt || null;
    saved = TF.Store.saveWorkoutDay(day, todayKey);
    sessionState.lastSavedAt = saved.updatedAt || sessionState.lastSavedAt;
    sessionState.startedAt = saved.startedAt || sessionState.startedAt;
    sessionState.finishedAt = saved.finishedAt || null;
  }

  function splitColor() {
    if (plan.sourceType === 'custom') return 'var(--teal)';
    if (plan.splitKey === 'push') return 'var(--amber)';
    if (plan.splitKey === 'pull') return 'var(--blue)';
    if (plan.splitKey === 'legs') return 'var(--purple)';
    if (plan.splitKey === 'recovery') return 'var(--teal)';
    return 'var(--lime)';
  }

  function badgeLabel() {
    if (plan.sourceType === 'custom') return 'CUSTOM PLAN';
    if (plan.splitKey === 'push') return 'PUSH DAY';
    if (plan.splitKey === 'pull') return 'PULL DAY';
    if (plan.splitKey === 'legs') return 'LEGS DAY';
    if (plan.splitKey === 'recovery') return 'RECOVERY';
    return (plan.title || 'WORKOUT').toUpperCase();
  }

  function roundWeight(value) {
    return W.roundWeight(value);
  }

  function formatWeight(value) {
    return W.formatWeight(value);
  }

  function buildDefaultSets(exercise) {
    return W.buildDefaultSets(exercise);
  }

  function cloneSet(set) {
    return W.cloneSet(set);
  }

  function ensureExerciseState(exercise) {
    W.ensureExerciseState(exercise, todayLog, setLogs);
  }

  function getCurrentExerciseNames() {
    return plan.exercises.map(function(exercise) {
      return exercise.name;
    });
  }

  function getWorkingSets(exerciseName) {
    return (setLogs[exerciseName] || []).filter(function(set) {
      return set.type !== 'warmup';
    });
  }

  function getWarmupSets(exerciseName) {
    return (setLogs[exerciseName] || []).filter(function(set) {
      return set.type === 'warmup';
    });
  }

  function getDoneWorkingSetCount(exerciseName) {
    return getWorkingSets(exerciseName).filter(function(set) {
      return set.done;
    }).length;
  }

  function getWorkingSetCount(exerciseName) {
    return getWorkingSets(exerciseName).length;
  }

  function isExerciseDone(exerciseName) {
    var sets = getWorkingSets(exerciseName);
    return sets.length > 0 && sets.every(function(set) {
      return set.done;
    });
  }

  function allDone() {
    return plan.exercises.length > 0 && plan.exercises.every(function(exercise) {
      ensureExerciseState(exercise);
      return isExerciseDone(exercise.name);
    });
  }

  function countDoneSets() {
    var done = 0;
    var total = 0;
    plan.exercises.forEach(function(exercise) {
      ensureExerciseState(exercise);
      total += getWorkingSetCount(exercise.name);
      done += getDoneWorkingSetCount(exercise.name);
    });
    return { done: done, total: total };
  }

  function calcTotalVolume() {
    var volume = 0;
    plan.exercises.forEach(function(exercise) {
      ensureExerciseState(exercise);
      getWorkingSets(exercise.name).forEach(function(set) {
        if (set.done && set.weight && set.reps) {
          volume += (parseFloat(set.weight) || 0) * (parseInt(set.reps, 10) || 0);
        }
      });
    });
    return Math.round(volume);
  }

  function calcAverageRpe(sets) {
    var values = (sets || []).map(function(set) {
      return parseFloat(set.rpe);
    }).filter(function(value) {
      return isFinite(value);
    });
    if (!values.length) {
      return null;
    }
    return (values.reduce(function(sum, value) { return sum + value; }, 0) / values.length);
  }

  function calcSetEst1RM(set) {
    if (!set || !set.weight || !set.reps) {
      return 0;
    }
    return TF.Store.calc1RM(parseFloat(set.weight), parseInt(set.reps, 10));
  }

  function getTopWorkingSet() {
    var top = null;
    plan.exercises.forEach(function(exercise) {
      ensureExerciseState(exercise);
      getWorkingSets(exercise.name).forEach(function(set) {
        var estimate = set.done ? calcSetEst1RM(set) : 0;
        if (!estimate) {
          return;
        }
        if (!top || estimate > top.est1RM) {
          top = {
            exerciseName: exercise.name,
            weight: set.weight,
            reps: set.reps,
            est1RM: estimate
          };
        }
      });
    });
    return top;
  }

  function getWorkoutSummary() {
    var allWorkingSets = [];
    plan.exercises.forEach(function(exercise) {
      ensureExerciseState(exercise);
      allWorkingSets = allWorkingSets.concat(getWorkingSets(exercise.name).filter(function(set) {
        return set.done;
      }));
    });
    return {
      volume: calcTotalVolume(),
      avgRpe: calcAverageRpe(allWorkingSets),
      topSet: getTopWorkingSet(),
      bodyweightKg: sessionState.bodyweightKg || '',
      setsDone: countDoneSets(),
      exerciseCount: plan.exercises.length,
      finishedAt: sessionState.finishedAt || null
    };
  }

  function checkPR(exerciseName, set) {
    var estimate;
    var pr;
    if (!set || set.type === 'warmup' || !set.weight || !set.reps) {
      return false;
    }
    estimate = TF.Store.calc1RM(parseFloat(set.weight), parseInt(set.reps, 10));
    pr = TF.Store.getPR(exerciseName);
    return !pr || estimate > pr.est1RM;
  }

  function saveAllLogs() {
    var day = TF.Store.getWorkoutDay(todayKey);
    var exercises = {};
    var saved;
    plan.exercises.forEach(function(exercise) {
      ensureExerciseState(exercise);
      exercises[exercise.name] = (setLogs[exercise.name] || []).map(cloneSet);
    });
    day.exercises = exercises;
    day.notes = sessionState.notes || '';
    day.bodyweightKg = sessionState.bodyweightKg || '';
    day.sourceType = plan.sourceType || 'generated';
    day.workoutId = plan.workoutId || null;
    day.workoutName = plan.workoutName || plan.title || '';
    day.splitKey = plan.splitKey || null;
    day.planSnapshot = snapshotExercises(plan.exercises);
    day.startedAt = day.startedAt || sessionState.startedAt || new Date().toISOString();
    day.finishedAt = sessionState.finishedAt || day.finishedAt || null;
    saved = TF.Store.saveWorkoutSession(day, todayKey);
    sessionState.lastSavedAt = saved.updatedAt || sessionState.lastSavedAt;
    sessionState.startedAt = saved.startedAt || sessionState.startedAt;
    sessionState.finishedAt = saved.finishedAt || null;
    if (sessionState.bodyweightKg) {
      var bodyweightValue = parseFloat(sessionState.bodyweightKg);
      if (isFinite(bodyweightValue) && bodyweightValue >= 20 && bodyweightValue <= 300) {
        TF.Store.addWeight(bodyweightValue, todayKey);
      }
    }
    plan.exercises.forEach(function(exercise) {
      TF.Overload.processSession(exercise.name, exercise.reps, getWorkingSets(exercise.name));
    });
    updateAutosaveStatus();
  }
  function getDisplayLabel(exerciseName, setIndex) {
    var sets = setLogs[exerciseName] || [];
    var set = sets[setIndex];
    if (!set) {
      return '';
    }
    var sameTypeBefore = sets.slice(0, setIndex + 1).filter(function(item) {
      return item.type === set.type;
    }).length;
    return (set.type === 'warmup' ? 'W' : 'S') + sameTypeBefore;
  }

  function getLastSetForPosition(exerciseName, setIndex) {
    var last = TF.Store.getLastWorkoutByExercise(exerciseName);
    var sets = setLogs[exerciseName] || [];
    var target = sets[setIndex];
    var workingIndex = -1;
    if (!last || !last.sets) {
      return null;
    }
    if (!target || target.type === 'warmup') {
      return null;
    }
    sets.slice(0, setIndex + 1).forEach(function(set) {
      if (set.type !== 'warmup') {
        workingIndex += 1;
      }
    });
    return workingIndex >= 0 ? last.sets[workingIndex] : null;
  }

  function getLastHistorySetByType(exerciseName, type) {
    var last = TF.Store.getLastWorkoutByExercise(exerciseName);
    var sets;
    if (!last || !last.allSets) {
      return null;
    }
    sets = (last.allSets || []).filter(function(set) {
      return type === 'warmup' ? set.type === 'warmup' : set.type !== 'warmup';
    });
    return sets.length ? cloneSet(sets[sets.length - 1]) : null;
  }

  function swapExercise(exerciseIndex, nextName) {
    var current = plan.exercises[exerciseIndex];
    var nextDefinition = TF.Workout.getExerciseDefinition(nextName);
    if (!current || !nextDefinition || current.name === nextDefinition.name) {
      return;
    }
    if (getCurrentExerciseNames().indexOf(nextDefinition.name) >= 0) {
      TF.UI.toast('That exercise is already in this workout.', 'error');
      return;
    }

    ensureExerciseState(current);
    setLogs[nextDefinition.name] = (setLogs[current.name] || []).map(cloneSet);
    delete setLogs[current.name];
    if (expanded[current.name]) {
      expanded[nextDefinition.name] = true;
      delete expanded[current.name];
    }
    if (newPRs[current.name]) {
      newPRs[nextDefinition.name] = true;
      delete newPRs[current.name];
    }

    plan.exercises[exerciseIndex] = Object.assign({}, nextDefinition);
    saveAllLogs();
    TF.UI.haptic(35);
    TF.UI.toast('Swapped to ' + nextDefinition.name + '.', 'success');
    render();
  }

  function addSet(exerciseName, type) {
    var previousWorking = getWorkingSets(exerciseName).slice(-1)[0] || {};
    var newSet = {
      weight: type === 'warmup' ? '' : String(previousWorking.weight || ''),
      reps: type === 'warmup' ? '' : String(previousWorking.reps || ''),
      done: false,
      type: type,
      rpe: ''
    };
    setLogs[exerciseName] = setLogs[exerciseName] || [];
    if (type === 'warmup') {
      setLogs[exerciseName].splice(getWarmupSets(exerciseName).length, 0, newSet);
    } else {
      setLogs[exerciseName].push(newSet);
    }
    undoState = null;
    saveAllLogs();
    TF.UI.haptic(25);
    render();
  }

  function copyLastSet(exerciseName, type) {
    var source = type === 'warmup'
      ? (getWarmupSets(exerciseName).slice(-1)[0] || getLastHistorySetByType(exerciseName, 'warmup'))
      : (getWorkingSets(exerciseName).slice(-1)[0] || getLastHistorySetByType(exerciseName, 'working'));
    var newSet = cloneSet(source || {});
    newSet.type = type;
    newSet.done = false;
    newSet.rpe = '';
    newSet.completedAt = null;
    setLogs[exerciseName] = setLogs[exerciseName] || [];
    if (type === 'warmup') {
      setLogs[exerciseName].splice(getWarmupSets(exerciseName).length, 0, newSet);
    } else {
      setLogs[exerciseName].push(newSet);
    }
    undoState = null;
    saveAllLogs();
    TF.UI.haptic(25);
    TF.UI.toast('Copied last ' + (type === 'warmup' ? 'warm-up' : 'working') + ' set.', 'success', 1400);
    render();
  }

  function getWorkingOrdinal(exerciseName, setIndex) {
    var ordinal = 0;
    (setLogs[exerciseName] || []).slice(0, setIndex + 1).forEach(function(set) {
      if (set.type !== 'warmup') {
        ordinal += 1;
      }
    });
    return ordinal;
  }

  function canRemoveSet(exercise, setIndex) {
    var sets = setLogs[exercise.name] || [];
    var set = sets[setIndex];
    if (!set) {
      return false;
    }
    if (set.type === 'warmup') {
      return true;
    }
    return getWorkingOrdinal(exercise.name, setIndex) > exercise.sets;
  }

  function removeSet(exerciseName, setIndex) {
    var removed;
    if (!setLogs[exerciseName] || !setLogs[exerciseName][setIndex]) {
      return;
    }
    removed = cloneSet(setLogs[exerciseName][setIndex]);
    setLogs[exerciseName].splice(setIndex, 1);
    undoState = {
      type: 'remove-set',
      message: 'Set removed from ' + exerciseName + '.',
      payload: {
        exerciseName: exerciseName,
        setIndex: setIndex,
        setData: removed
      }
    };
    saveAllLogs();
    TF.UI.haptic(25);
    render();
  }

  function undoRemoveSet() {
    var payload = undoState && undoState.type === 'remove-set' ? undoState.payload : null;
    if (!payload) {
      return;
    }
    setLogs[payload.exerciseName] = setLogs[payload.exerciseName] || [];
    setLogs[payload.exerciseName].splice(payload.setIndex, 0, cloneSet(payload.setData));
    undoState = null;
    saveAllLogs();
    TF.UI.toast('Set restored.', 'success', 1200);
    render();
  }

  function adjustWeight(exerciseName, setIndex, delta) {
    var set = setLogs[exerciseName] && setLogs[exerciseName][setIndex];
    var current = parseFloat(set && set.weight);
    var next;
    if (!set) {
      return;
    }
    if (!isFinite(current)) {
      current = 0;
    }
    next = roundWeight(Math.max(0, current + delta));
    set.weight = next > 0 ? formatWeight(next) : '';
    saveAllLogs();
    render();
  }

  function getAutosaveText() {
    var diff;
    var minutes;
    var hours;
    if (!sessionState.lastSavedAt) {
      return 'Waiting for your first save.';
    }
    diff = Math.max(0, Math.floor((Date.now() - new Date(sessionState.lastSavedAt).getTime()) / 1000));
    if (diff < 5) return 'Saved just now';
    if (diff < 60) return 'Saved ' + diff + 's ago';
    minutes = Math.floor(diff / 60);
    if (minutes < 60) return 'Saved ' + minutes + 'm ago';
    hours = Math.floor(minutes / 60);
    return 'Saved ' + hours + 'h ago';
  }

  function updateAutosaveStatus() {
    var el = root.querySelector('#wo-autosave-status');
    if (el) {
      el.textContent = getAutosaveText();
    }
  }

  function ensureAutosaveTicker() {
    if (autosaveInterval) {
      return;
    }
    autosaveInterval = setInterval(function() {
      if (TF.Router.current() !== 'workout') {
        clearInterval(autosaveInterval);
        autosaveInterval = null;
        return;
      }
      updateAutosaveStatus();
    }, 1000);
  }

  function showPlateCalculator(exerciseName, setIndex) {
    var set = setLogs[exerciseName] && setLogs[exerciseName][setIndex];
    var total = parseFloat(set && set.weight);
    var barWeight = 20;
    var plates = [25, 20, 15, 10, 5, 2.5, 1.25];
    var perSide;
    var remaining;
    var used = [];
    var unsupported;
    if (!isFinite(total) || total <= 0) {
      TF.UI.toast('Enter a target weight first.', 'error');
      return;
    }
    if (total < barWeight) {
      TF.UI.modal({
        icon: 'scale',
        title: 'Plate calculator',
        cancelText: 'Close',
        confirmText: 'Done',
        html: '<div class="plate-modal-copy">Target weight is below the standard 20 kg bar. Use a lighter setup, dumbbells, or a machine stack for this one.</div>'
      });
      return;
    }
    perSide = (total - barWeight) / 2;
    remaining = perSide;
    plates.forEach(function(plate) {
      while (remaining + 0.001 >= plate) {
        used.push(plate);
        remaining = parseFloat((remaining - plate).toFixed(2));
      }
    });
    unsupported = remaining > 0.01;
    TF.UI.modal({
      icon: 'scale',
      title: 'Plate calculator',
      cancelText: 'Close',
      confirmText: 'Done',
      html:
        '<div class="plate-modal">' +
          '<div class="plate-modal-top">' +
            '<div><div class="plate-modal-label">Target</div><div class="plate-modal-value">' + formatWeight(total) + ' kg</div></div>' +
            '<div><div class="plate-modal-label">Bar</div><div class="plate-modal-value">20 kg</div></div>' +
            '<div><div class="plate-modal-label">Per side</div><div class="plate-modal-value">' + formatWeight(perSide) + ' kg</div></div>' +
          '</div>' +
          '<div class="plate-modal-stack">' +
            (unsupported
              ? '<div class="plate-modal-copy">This target cannot be loaded exactly with standard 1.25 kg increments. Adjust to the nearest exact load.</div>'
              : '<div class="plate-modal-copy">Load each side like this: <strong>' + (used.length ? used.join(' + ') : 'no plates') + '</strong></div>') +
          '</div>' +
          '<div class="plate-chip-row">' +
            (used.length
              ? used.map(function(plate) {
                  return '<span class="plate-chip">' + plate + ' kg</span>';
                }).join('')
              : '<span class="plate-chip">Bar only</span>') +
          '</div>' +
        '</div>'
    });
  }

  function renderExerciseDetailModal(exerciseName) {
    var history = TF.Store.getExerciseHistory(exerciseName, 5);
    var pr = TF.Store.getPR(exerciseName);
    var trend = [];
    var best = null;
    var avgRpeValues = [];
    var maxTrend = 0;
    if (!history.length) {
      TF.UI.modal({
        icon: 'book',
        title: exerciseName,
        cancelText: 'Close',
        confirmText: 'Done',
        html: '<div class="plate-modal-copy">No logged history for this exercise yet. Finish a few sessions and your trend log will show up here.</div>'
      });
      return;
    }
    history.forEach(function(entry) {
      var sets = (entry.allSets || entry.sets || []).filter(function(set) {
        return set.type !== 'warmup' && set.done;
      });
      var sessionBest = null;
      var sessionAvg = calcAverageRpe(sets);
      sets.forEach(function(set) {
        var estimate = calcSetEst1RM(set);
        if (!sessionBest || estimate > sessionBest.est1RM) {
          sessionBest = {
            weight: set.weight,
            reps: set.reps,
            est1RM: estimate
          };
        }
      });
      if (sessionAvg != null) {
        avgRpeValues.push(sessionAvg);
      }
      if (sessionBest) {
        trend.push({
          date: entry.date,
          est1RM: sessionBest.est1RM,
          label: sessionBest.weight + 'kg x ' + sessionBest.reps
        });
        maxTrend = Math.max(maxTrend, sessionBest.est1RM);
        if (!best || sessionBest.est1RM > best.est1RM) {
          best = {
            date: entry.date,
            est1RM: sessionBest.est1RM,
            label: sessionBest.weight + 'kg x ' + sessionBest.reps
          };
        }
      }
    });

    TF.UI.modal({
      icon: 'book',
      title: exerciseName,
      cancelText: 'Close',
      confirmText: 'Done',
      html:
        '<div class="exercise-detail-modal">' +
          '<div class="exercise-detail-top">' +
            '<div class="exercise-detail-stat"><span class="exercise-detail-k">PR</span><strong>' + (pr ? pr.est1RM + ' kg' : '-') + '</strong></div>' +
            '<div class="exercise-detail-stat"><span class="exercise-detail-k">Best set</span><strong>' + (best ? best.label : '-') + '</strong></div>' +
            '<div class="exercise-detail-stat"><span class="exercise-detail-k">Avg RPE</span><strong>' + (avgRpeValues.length ? (avgRpeValues.reduce(function(sum, value) { return sum + value; }, 0) / avgRpeValues.length).toFixed(1) : '-') + '</strong></div>' +
          '</div>' +
          '<div class="exercise-detail-section-title">Estimated 1RM trend</div>' +
          '<div class="exercise-trend-list">' +
            trend.map(function(item) {
              return '<div class="exercise-trend-row">' +
                '<div class="exercise-trend-meta"><strong>' + TF.UI.formatDate(item.date) + '</strong><span>' + item.label + '</span></div>' +
                '<div class="exercise-trend-bar"><div class="exercise-trend-fill" style="width:' + Math.max(14, Math.round((item.est1RM / (maxTrend || item.est1RM || 1)) * 100)) + '%"></div></div>' +
                '<div class="exercise-trend-val">' + item.est1RM + ' kg</div>' +
              '</div>';
            }).join('') +
          '</div>' +
          '<div class="exercise-detail-section-title">Last 5 sessions</div>' +
          '<div class="exercise-history-list">' +
            history.map(function(entry) {
              var sets = (entry.allSets || entry.sets || []).filter(function(set) {
                return set.type !== 'warmup';
              });
              var doneSets = sets.filter(function(set) { return set.done; }).length;
              var entryAvgRpe = calcAverageRpe(sets.filter(function(set) { return set.done; }));
              return '<div class="exercise-history-row">' +
                '<div><strong>' + TF.UI.formatDate(entry.date) + '</strong><span>' + TF.UI.escapeHTML(entry.workoutName || 'Workout') + '</span></div>' +
                '<div class="exercise-history-mini">' + doneSets + '/' + sets.length + ' sets' + (entryAvgRpe != null ? ' · RPE ' + entryAvgRpe.toFixed(1) : '') + '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>'
    });
  }

  function renderFinishSummaryModal() {
    var summary = getWorkoutSummary();
    var title = sessionState.finishedAt ? 'Workout summary' : 'Workout finished';
    var finishTime = sessionState.finishedAt ? new Date(sessionState.finishedAt) : new Date();
    var prCount = Object.keys(newPRs).length;
    var durationMins = null;
    if (sessionState.startedAt) {
      durationMins = Math.round((finishTime - new Date(sessionState.startedAt)) / 60000);
    }
    if (!sessionState.finishedAt) {
      sessionState.finishedAt = finishTime.toISOString();
      saveAllLogs();
      TF.UI.haptic(80);
      TF.UI.confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    }
    TF.UI.modal({
      icon: 'check-circle',
      title: title,
      cancelText: 'Close',
      confirmText: 'Done',
      html:
        '<div class="finish-summary-modal">' +
          '<div class="finish-summary-grid">' +
            '<div class="finish-summary-tile"><span>Working volume</span><strong>' + (summary.volume || 0) + ' kg</strong></div>' +
            '<div class="finish-summary-tile"><span>Avg RPE</span><strong>' + (summary.avgRpe != null ? summary.avgRpe.toFixed(1) : '-') + '</strong></div>' +
            '<div class="finish-summary-tile"><span>Bodyweight</span><strong>' + (summary.bodyweightKg ? summary.bodyweightKg + ' kg' : '-') + '</strong></div>' +
            '<div class="finish-summary-tile"><span>Exercises</span><strong>' + summary.exerciseCount + '</strong></div>' +
            (durationMins != null ? '<div class="finish-summary-tile"><span>Duration</span><strong>' + durationMins + ' min</strong></div>' : '') +
            (prCount > 0 ? '<div class="finish-summary-tile" style="border-color:var(--amber)44"><span style="color:var(--amber)">New PRs</span><strong style="color:var(--amber)">' + prCount + ' 🏆</strong></div>' : '') +
          '</div>' +
          (prCount > 0 ? '<div class="finish-summary-callout" style="border-color:var(--amber)44;background:rgba(255,170,0,.06)">' +
            '<div class="finish-summary-callout-title" style="color:var(--amber)">PRs hit this session</div>' +
            '<div class="finish-summary-callout-copy">' + Object.keys(newPRs).map(function(n) { return TF.UI.escapeHTML(n); }).join(', ') + '</div>' +
          '</div>' : '') +
          '<div class="finish-summary-callout">' +
            '<div class="finish-summary-callout-title">Top set</div>' +
            '<div class="finish-summary-callout-copy">' + (summary.topSet ? (TF.UI.escapeHTML(summary.topSet.exerciseName) + ' · ' + summary.topSet.weight + 'kg x ' + summary.topSet.reps + ' · est. 1RM ' + summary.topSet.est1RM + 'kg') : 'No completed top set logged yet.') + '</div>' +
          '</div>' +
          '<div class="plate-modal-copy">Finished ' + finishTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + '. Notes, RPE, bodyweight, and the session snapshot are all stored in History.</div>' +
        '</div>'
    });
  }

  function renderGlossaryModal() {
    TF.UI.modal({
      icon: 'info',
      title: 'Workout glossary',
      cancelText: 'Close',
      confirmText: 'Got it',
      html:
        '<div class="glossary-list">' +
          '<div class="glossary-row"><strong>RPE</strong><span>Rate of Perceived Exertion. 10 means max effort, 8 means about 2 reps left in the tank.</span></div>' +
          '<div class="glossary-row"><strong>Warm-up set</strong><span>Lighter prep sets before the real work. They do not count toward PRs or tracked volume.</span></div>' +
          '<div class="glossary-row"><strong>Working set</strong><span>Your main logged set that counts for progression, volume, and performance history.</span></div>' +
          '<div class="glossary-row"><strong>Estimated 1RM</strong><span>A calculator-based estimate of your one-rep max from the weight and reps you completed.</span></div>' +
          '<div class="glossary-row"><strong>Volume</strong><span>Total working weight moved: weight × reps across completed working sets.</span></div>' +
          '<div class="glossary-row"><strong>Swap</strong><span>Switches an exercise for a similar movement without wiping the rest of your session.</span></div>' +
          '<div class="glossary-row"><strong>Progressive overload</strong><span>Trying to do a little more over time: more weight, more reps, cleaner reps, or lower effort at the same load.</span></div>' +
        '</div>'
    });
  }
  function buildSwitchUndoBanner() {
    var switchUndo = loadSwitchUndo();
    if (!switchUndo) {
      return '';
    }
    return '<div class="card card-sm workout-undo-card">' +
      '<div><div class="t-title">Workout switched</div><div class="t-hint">' + TF.UI.escapeHTML(switchUndo.message || 'Your workout mode changed for today.') + '</div></div>' +
      '<div class="session-link-row">' +
        '<button class="btn btn-ghost btn-sm" id="btn-undo-switch" type="button">Undo</button>' +
        '<button class="btn btn-ghost btn-sm" id="btn-dismiss-switch-undo" type="button">Dismiss</button>' +
      '</div>' +
    '</div>';
  }

  function buildLocalUndoBanner() {
    if (!undoState) {
      return '';
    }
    return '<div class="card card-sm workout-undo-card">' +
      '<div><div class="t-title">Undo available</div><div class="t-hint">' + TF.UI.escapeHTML(undoState.message) + '</div></div>' +
      '<div class="session-link-row">' +
        '<button class="btn btn-ghost btn-sm" id="btn-undo-local" type="button">Undo</button>' +
        '<button class="btn btn-ghost btn-sm" id="btn-dismiss-local-undo" type="button">Dismiss</button>' +
      '</div>' +
    '</div>';
  }

  function splitOptionLabel(splitKey) {
    var option = SPLIT_SWITCH_OPTIONS.find(function(item){
      return item.key === splitKey;
    });
    return option ? option.label : 'Smart auto';
  }

  function formatLastWorkoutLine(context) {
    var last = context && context.lastWorkout;
    if (!last) {
      return 'No previous completed workout found.';
    }
    return 'Last trained: ' + splitOptionLabel(last.splitKey) + ', ' + last.daysAgo + ' day' + (last.daysAgo === 1 ? '' : 's') + ' ago.';
  }

  function getSwitchContext() {
    return TF.Workout.getTodayContext ? TF.Workout.getTodayContext(profile, input) : {
      note: plan.scheduleNote || 'Smart auto selected today\'s workout.',
      recommendedSplit: plan.splitKey,
      scheduledSplit: plan.scheduledSplit || plan.splitKey,
      warnings: {},
      lastWorkout: plan.lastWorkout || null
    };
  }

  function buildWorkoutSwitchModalHtml() {
    var selection = TF.Store.getWorkoutSelection ? TF.Store.getWorkoutSelection(todayKey) : null;
    var isManual = selection && selection.mode === 'generated';
    var context = getSwitchContext();
    var note = context.note || 'Smart auto watches your last logged workout, recovery, and long breaks so the calendar does not blindly repeat the wrong day.';
    var activeReason = selection && selection.reason ? selection.reason : '';
    function presetCard(key, reason, title, copy, tone) {
      var active = activeReason === reason;
      return '<button class="workout-preset-chip preset-' + tone + (active ? ' active' : '') + '" type="button" data-generated-preset="' + key + '">' +
        '<strong>' + title + '</strong>' +
        '<em>' + copy + '</em>' +
      '</button>';
    }
    var chips = SPLIT_SWITCH_OPTIONS.map(function(option){
      var active = plan.splitKey === option.key;
      var warning = context.warnings && context.warnings[option.key];
      return '<button class="workout-split-chip' + (active ? ' active' : '') + (warning ? ' caution' : '') + '" type="button" data-generated-split="' + option.key + '" data-warning="' + TF.UI.escapeAttr(warning || '') + '">' +
        '<span>' + TF.UI.escapeHTML(option.label) + '</span>' +
        '<small>' + TF.UI.escapeHTML(warning ? 'Caution' : option.hint) + '</small>' +
      '</button>';
    }).join('');
    return '<div class="workout-context-panel">' +
        '<div class="workout-context-stat"><span>Smart choice</span><strong>' + TF.UI.escapeHTML(splitOptionLabel(context.recommendedSplit || plan.splitKey)) + '</strong></div>' +
        '<div class="workout-context-stat"><span>Schedule</span><strong>' + TF.UI.escapeHTML(splitOptionLabel(context.scheduledSplit || plan.scheduledSplit || plan.splitKey)) + '</strong></div>' +
        '<div class="workout-context-stat"><span>Recovery</span><strong>' + (context.recovery || plan.recoveryScore || '--') + '</strong></div>' +
      '</div>' +
      '<div class="workout-smart-note">' + TF.Icon('activity', 12) + '<span>' + TF.UI.escapeHTML(note) + '</span></div>' +
      '<div class="workout-last-line">' + TF.UI.escapeHTML(formatLastWorkoutLine(context)) + '</div>' +
      '<div class="workout-switch-section-head">' +
        '<strong>Choose split</strong>' +
        '<span>Workout names</span>' +
      '</div>' +
      '<div class="workout-split-row workout-split-row-modal">' + chips + '</div>' +
      '<div class="workout-switch-section-head workout-split-section-head">' +
        '<strong>Adjust today</strong>' +
        '<span>Life happens</span>' +
      '</div>' +
      '<div class="workout-preset-grid">' +
        presetCard('sore', 'sore', 'I\'m sore', 'Recovery instead', 'recovery') +
        presetCard('nogym', 'noGym', 'No gym today', 'Bodyweight plan', 'nogym') +
        presetCard('short', 'short', 'Short on time', '20-30 min cap', 'short') +
        presetCard('comeback', 'comeback', 'Missed week', 'Comeback mode', 'comeback') +
      '</div>' +
      (isManual ? '<button class="btn btn-ghost btn-sm workout-auto-btn" type="button" data-generated-auto>Return to Smart auto</button>' : '');
  }

  function renderSetRow(exercise, set, setIndex) {
    var exerciseName = exercise.name;
    var label = getDisplayLabel(exerciseName, setIndex);
    var lastSet = set.type === 'warmup' ? null : getLastSetForPosition(exerciseName, setIndex);
    var showRpe = set.type !== 'warmup';
    var isPotentialPR = !set.done && checkPR(exerciseName, set);
    var removable = canRemoveSet(exercise, setIndex);
    return '<div class="set-row-block' + (set.type === 'warmup' ? ' warmup' : '') + '">' +
      '<div class="set-row-item' + (isPotentialPR ? ' potential-pr' : '') + '">' +
        '<div class="set-num">' + label + '</div>' +
        '<div class="weight-stepper">' +
          '<button class="weight-step-btn" type="button" data-step="-2.5" data-ex="' + TF.UI.escapeAttr(exerciseName) + '" data-set="' + setIndex + '">' + TF.Icon('minus', 12) + '</button>' +
          '<input class="set-input" data-ex="' + TF.UI.escapeAttr(exerciseName) + '" data-set="' + setIndex + '" data-field="weight" type="number" placeholder="' + (lastSet && lastSet.weight ? lastSet.weight : 'kg') + '" value="' + TF.UI.escapeAttr(set.weight || '') + '" inputmode="decimal" step="0.25">' +
          '<button class="weight-step-btn" type="button" data-step="2.5" data-ex="' + TF.UI.escapeAttr(exerciseName) + '" data-set="' + setIndex + '">' + TF.Icon('plus', 12) + '</button>' +
          '<button class="weight-step-btn" type="button" data-plate-ex="' + TF.UI.escapeAttr(exerciseName) + '" data-plate-set="' + setIndex + '" aria-label="Plate calculator">' + TF.Icon('scale', 12) + '</button>' +
        '</div>' +
        '<span class="set-sep">x</span>' +
        '<input class="set-input set-input-reps" data-ex="' + TF.UI.escapeAttr(exerciseName) + '" data-set="' + setIndex + '" data-field="reps" type="number" placeholder="' + (lastSet && lastSet.reps ? lastSet.reps : 'reps') + '" value="' + TF.UI.escapeAttr(set.reps || '') + '" inputmode="numeric">' +
        '<div class="set-done-check' + (set.done ? ' done' : '') + '" data-ex="' + TF.UI.escapeAttr(exerciseName) + '" data-set="' + setIndex + '">' +
          (set.done ? TF.Icon('check', 12) : '') +
        '</div>' +
        (removable ? '<button class="set-remove-btn" type="button" data-remove-ex="' + TF.UI.escapeAttr(exerciseName) + '" data-remove-set="' + setIndex + '" aria-label="Remove set">' + TF.Icon('x', 12) + '</button>' : '') +
        '<div class="set-last-val">' + (set.type === 'warmup' ? 'warm-up' : (lastSet ? ((lastSet.weight || '-') + 'x' + (lastSet.reps || '-')) : '-')) + '</div>' +
      '</div>' +
      (showRpe ? '<div class="set-rpe-row' + (set.done || set.rpe ? ' visible' : '') + '">' +
        '<span class="set-rpe-label">RPE</span>' +
        '<input class="set-rpe-input" data-ex="' + TF.UI.escapeAttr(exerciseName) + '" data-set="' + setIndex + '" data-field="rpe" type="number" min="1" max="10" step="1" placeholder="1-10" value="' + TF.UI.escapeAttr(set.rpe || '') + '">' +
        '<span class="set-rpe-copy">' + (set.done ? 'How hard was it?' : 'Log after the set.') + '</span>' +
      '</div>' : '') +
    '</div>';
  }

  function renderSetPanel(exercise, exerciseIndex) {
    var sets;
    var swapOptions;
    ensureExerciseState(exercise);
    sets = setLogs[exercise.name];
    swapOptions = TF.Workout.getSwapOptions(exercise).filter(function(option) {
      return getCurrentExerciseNames().indexOf(option.name) === -1;
    });
    return '<div class="set-log-panel">' +
      (swapOptions.length ? '<div class="swap-strip">' +
        '<div class="swap-strip-label">Swap with</div>' +
        '<div class="swap-strip-options">' +
          swapOptions.map(function(option) {
            return '<button class="swap-chip" type="button" data-swap-ex="' + exerciseIndex + '" data-swap-name="' + TF.UI.escapeAttr(option.name) + '">' + TF.UI.escapeHTML(option.name) + '</button>';
          }).join('') +
        '</div>' +
      '</div>' : '') +
      '<div class="set-col-header">' +
        '<span class="set-num" style="opacity:0">S1</span>' +
        '<span class="set-col-label">KG</span>' +
        '<span class="set-sep" style="opacity:0">x</span>' +
        '<span class="set-col-label">REPS</span>' +
        '<span style="width:36px"></span>' +
        '<span class="set-col-label last-col">LAST</span>' +
      '</div>' +
      sets.map(function(set, setIndex) {
        return renderSetRow(exercise, set, setIndex);
      }).join('') +
      '<div class="set-panel-actions">' +
        '<button class="btn btn-ghost btn-sm add-set-btn" type="button" data-add-warmup="' + TF.UI.escapeAttr(exercise.name) + '">' + TF.Icon('plus', 10) + ' Warm-up set</button>' +
        '<button class="btn btn-ghost btn-sm add-set-btn" type="button" data-copy-warmup="' + TF.UI.escapeAttr(exercise.name) + '">' + TF.Icon('copy', 10) + ' Copy last warm-up</button>' +
        '<button class="btn btn-ghost btn-sm add-set-btn" type="button" data-add-working="' + TF.UI.escapeAttr(exercise.name) + '">' + TF.Icon('plus', 10) + ' Working set</button>' +
        '<button class="btn btn-ghost btn-sm add-set-btn" type="button" data-copy-working="' + TF.UI.escapeAttr(exercise.name) + '">' + TF.Icon('copy', 10) + ' Copy last working</button>' +
      '</div>' +
    '</div>';
  }

  function renderExerciseCard(exercise, exerciseIndex) {
    var isOpen;
    var isDone;
    var doneSets;
    var workingCount;
    var warmups;
    var suggestion;
    var pr;
    var pillText;
    var pillClass;
    ensureExerciseState(exercise);
    isOpen = !!expanded[exercise.name];
    isDone = isExerciseDone(exercise.name);
    doneSets = getDoneWorkingSetCount(exercise.name);
    workingCount = getWorkingSetCount(exercise.name);
    warmups = getWarmupSets(exercise.name).length;
    suggestion = TF.Overload.getSuggestionText(exercise.name);
    pr = TF.Store.getPR(exercise.name);
    pillText = isDone ? 'DONE' : (doneSets > 0 ? (doneSets + '/' + workingCount) : (workingCount + ' work'));
    pillClass = isDone ? 'pill-done' : (doneSets > 0 ? 'pill-progress' : 'pill-default');

    /* v5.6: collapsed volume summary */
    var collapsedVol = 0;
    if (!isOpen && doneSets > 0) {
      (setLogs[exercise.name] || []).forEach(function(s) {
        if (s.done && s.type !== 'warmup' && s.weight && s.reps) {
          collapsedVol += (parseFloat(s.weight) || 0) * (parseInt(s.reps, 10) || 0);
        }
      });
    }
    var collapsedSummary = (!isOpen && doneSets > 0)
      ? '<div style="font-size:10px;color:var(--txt-3);margin-top:2px;padding:0 14px 8px 52px">' +
          doneSets + '/' + workingCount + ' sets' +
          (collapsedVol > 0 ? ' &middot; ' + Math.round(collapsedVol) + ' kg vol' : '') +
        '</div>'
      : '';

    return '<div class="ex-card' + (isDone ? ' done' : '') + (isOpen ? ' active-logging' : '') + (newPRs[exercise.name] ? ' pr-glow' : '') + '">' +
      '<div class="ex-card-header" data-ex-toggle="' + exerciseIndex + '">' +
        '<div class="ex-idx"><div class="ex-idx-inner" style="' + (isDone ? 'color:var(--lime)' : '') + '">' + (isDone ? TF.Icon('check', 13) : (exerciseIndex + 1)) + '</div></div>' +
        '<div class="ex-info">' +
          '<div class="ex-title-row">' +
            '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">' +
              '<div class="ex-name">' + TF.UI.escapeHTML(exercise.name) + '</div>' +
              (newPRs[exercise.name] ? '<span class="ex-pr-new">' + TF.Icon('zap', 8) + ' PR</span>' : '') +
              (warmups ? '<span class="exercise-micro-chip">' + warmups + ' warm-up</span>' : '') +
            '</div>' +
            '<button class="ex-detail-btn" type="button" data-open-details="' + TF.UI.escapeAttr(exercise.name) + '" aria-label="Exercise details">' + TF.Icon('book', 12) + '</button>' +
          '</div>' +
          (suggestion && !isDone ? '<div class="ex-suggestion">' + TF.Icon('trending-up', 9) + ' ' + TF.UI.escapeHTML(suggestion) + '</div>' : '') +
          (pr ? '<div class="ex-pr-badge">' + TF.Icon('trophy', 9) + ' 1RM: ' + pr.est1RM + 'kg</div>' : '') +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:7px;flex-shrink:0">' +
          '<div class="ex-quick-stats">' +
            '<span class="ex-qs-item" style="color:' + splitColor() + '">' + workingCount + 's</span>' +
            '<span class="ex-qs-sep">.</span>' +
            '<span class="ex-qs-item">' + TF.UI.escapeHTML(exercise.reps) + '</span>' +
            '<span class="ex-qs-sep">.</span>' +
            '<span class="ex-qs-item" style="color:var(--txt-3)">' + TF.UI.escapeHTML(exercise.rest) + '</span>' +
          '</div>' +
          '<div class="ex-status-pill ' + pillClass + '">' + pillText + '</div>' +
          '<div class="ex-chevron' + (isOpen ? ' open' : '') + '">' + TF.Icon('chevron-down', 14) + '</div>' +
        '</div>' +
      '</div>' +
      collapsedSummary +
      (exercise.note ? '<div class="ex-note-row' + (isOpen ? '' : ' ex-note-collapsed') + '">' + TF.Icon('info', 9) + ' ' + TF.UI.escapeHTML(exercise.note) + '</div>' : '') +
      (isOpen ? renderSetPanel(exercise, exerciseIndex) : '') +
    '</div>';
  }

  function renderCompleteBanner(volume) {
    var summary = getWorkoutSummary();
    var prCount = Object.keys(newPRs).length;
    var splitCol = splitColor();
    return '<div id="wo-complete-banner" style="display:' + (allDone() ? 'block' : 'none') + '">' +
      '<div class="workout-complete-v2" style="border-color:' + splitCol + '44">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
          '<div>' +
            '<div class="t-label" style="color:' + splitCol + ';margin-bottom:3px">SESSION COMPLETE</div>' +
            '<div style="font-family:var(--font-m);font-size:22px;font-weight:900;line-height:1">' + TF.UI.escapeHTML(plan.title) + '</div>' +
          '</div>' +
          '<div style="color:' + splitCol + '">' + TF.Icon('check-circle', 28) + '</div>' +
        '</div>' +
        '<div class="finish-summary-grid" style="margin-bottom:12px">' +
          '<div class="finish-summary-tile"><span>Volume</span><strong>' + (volume > 0 ? volume + ' kg' : '—') + '</strong></div>' +
          '<div class="finish-summary-tile"><span>Sets</span><strong>' + countDoneSets().done + '</strong></div>' +
          '<div class="finish-summary-tile"><span>Avg RPE</span><strong>' + (summary.avgRpe != null ? summary.avgRpe.toFixed(1) : '—') + '</strong></div>' +
          (prCount > 0 ? '<div class="finish-summary-tile" style="border-color:var(--amber)55"><span style="color:var(--amber)">New PRs</span><strong style="color:var(--amber)">' + prCount + ' 🏆</strong></div>' : '') +
        '</div>' +
        (summary.topSet ? '<div class="finish-summary-callout" style="margin-bottom:12px"><div class="finish-summary-callout-title">Best set</div><div class="finish-summary-callout-copy">' + TF.UI.escapeHTML(summary.topSet.exerciseName) + ' &middot; ' + summary.topSet.weight + 'kg &times; ' + summary.topSet.reps + ' &middot; est. 1RM ' + summary.topSet.est1RM + 'kg</div></div>' : '') +
        '<button class="btn btn-primary" id="btn-finish-workout" type="button">' + TF.Icon('check-circle', 13) + ' ' + (sessionState.finishedAt ? 'View summary' : 'Finish & save') + '</button>' +
        '<div class="t-hint" style="margin-top:8px;font-size:12px">Notes, RPE, bodyweight, and volume are saved automatically in History.</div>' +
      '</div>' +
    '</div>';
  }

  function render() {
    var progress = countDoneSets();
    var volume = calcTotalVolume();
    var percent = progress.total > 0 ? progress.done / progress.total : 0;
    var recovery = input ? TF.Score.recovery(input) : 68;
    var intensityTag = recovery >= 75 ? 'HIGH INTENSITY' : recovery >= 55 ? 'MODERATE' : 'LOW - RECOVERY FOCUS';
    var intensityColor = recovery >= 75 ? 'var(--lime)' : recovery >= 55 ? 'var(--blue)' : 'var(--amber)';

    root.innerHTML =
      '<div class="screen">' +
        buildSwitchUndoBanner() +
        buildLocalUndoBanner() +
        (plan.sourceType === 'custom' ? '<div class="card card-sm custom-plan-banner">' +
          '<div>' +
            '<div class="t-title">Custom workout active</div>' +
            '<div class="t-hint">Running "' + TF.UI.escapeHTML(plan.workoutName || plan.title) + '" instead of the generated session.</div>' +
          '</div>' +
          '<button class="btn btn-ghost btn-sm" id="btn-reset-generated" type="button">Use generated</button>' +
        '</div>' : '') +

        '<div class="hero-img-card workout-hero" id="wo-hero">' +
          '<div class="skeleton" style="position:absolute;inset:0;border-radius:var(--r-lg)"></div>' +
          '<div class="hero-img-card-content workout-hero-content">' +
            '<div class="workout-hero-copy">' +
              '<div class="workout-hero-meta">' +
                '<span class="workout-hero-pill workout-hero-pill-accent" style="background:' + splitColor() + '22;color:' + splitColor() + ';border:1px solid ' + splitColor() + '44">' + badgeLabel() + '</span>' +
                '<span class="workout-hero-pill">' + plan.estimatedMinutes + ' MIN</span>' +
                '<span class="workout-hero-pill">' + plan.exercises.length + ' EXERCISES</span>' +
              '</div>' +
              '<div class="workout-hero-title">' + TF.UI.escapeHTML(plan.title) + '</div>' +
              '<div style="font-size:12px;color:' + intensityColor + ';font-weight:700;letter-spacing:.5px;margin-top:4px">' + intensityTag + '</div>' +
              (sessionState.startedAt ? '<div id="wo-elapsed-timer" style="font-size:11px;color:var(--txt-3);font-weight:600;letter-spacing:.4px;margin-top:5px">\u23F1 0:00 elapsed</div>' : '<div id="wo-elapsed-timer" style="font-size:11px;color:var(--txt-3);font-weight:600;letter-spacing:.4px;margin-top:5px"></div>') +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="workout-session-card">' +
          '<div class="workout-session-head">' +
            '<div>' +
              '<div class="t-title">Session context</div>' +
              '<div class="t-hint">Notes, bodyweight, and autosave status stay with this workout log.</div>' +
            '</div>' +
            '<div class="session-link-row">' +
              (plan.sourceType !== 'custom' ? '<button class="btn btn-ghost btn-sm" id="btn-open-workout-switcher" type="button">' + TF.Icon('target', 11) + ' Change</button>' : '') +
              '<button class="btn btn-ghost btn-sm" id="btn-logbook" type="button">' + TF.Icon('calendar', 11) + ' Logbook</button>' +
              '<button class="btn btn-ghost btn-sm" id="btn-custom-builder" type="button">' + TF.Icon('dumbbell', 11) + ' Builder</button>' +
            '</div>' +
          '</div>' +
          '<div class="session-input-grid">' +
            '<div class="field-group">' +
              '<div class="field-label">Workout bodyweight</div>' +
              '<div class="session-inline-field">' +
                '<input id="wo-bodyweight" class="field session-compact-input" type="number" inputmode="decimal" step="0.1" min="20" max="300" placeholder="78.4" value="' + TF.UI.escapeAttr(sessionState.bodyweightKg || '') + '">' +
                '<span class="session-inline-unit">kg</span>' +
                '<button class="btn btn-primary btn-sm" id="btn-save-bodyweight" type="button">Log</button>' +
              '</div>' +
            '</div>' +
            '<div class="field-group">' +
              '<div class="field-label">Session notes</div>' +
              '<textarea id="wo-session-notes" class="field session-notes" rows="3" placeholder="Right shoulder tight today. Slept 5h. Felt flat on pressing.">' + TF.UI.escapeHTML(sessionState.notes || '') + '</textarea>' +
            '</div>' +
          '</div>' +
          '<div class="session-save-row"><span id="wo-autosave-status" class="session-save-status"></span></div>' +
        '</div>' +

        '<div class="wo-progress-strip">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
            '<div style="display:flex;align-items:center;gap:8px">' +
              '<span class="t-mono" style="font-size:13px;font-weight:700;color:var(--txt-2)">' + progress.done + '/' + progress.total + ' working sets</span>' +
              (Object.keys(newPRs).length > 0 ? '<span style="font-size:10px;font-weight:800;color:var(--amber);background:rgba(255,170,0,.12);border:1px solid rgba(255,170,0,.3);border-radius:5px;padding:1px 6px">' + TF.Icon('zap', 9) + ' ' + Object.keys(newPRs).length + ' PR' + (Object.keys(newPRs).length > 1 ? 's' : '') + '</span>' : '') +
            '</div>' +
            '<span class="t-mono" style="font-size:13px;font-weight:800;color:' + splitColor() + '">' + Math.round(percent * 100) + '%</span>' +
          '</div>' +
          '<div class="bar-track" style="height:6px;border-radius:3px">' +
            '<div class="bar-fill" style="width:' + Math.round(percent * 100) + '%;background:' + splitColor() + ';transition:width .35s ease;height:6px"></div>' +
          '</div>' +
          '<div style="margin-top:5px;min-height:16px">' +
            '<span class="t-hint" style="font-size:11px;color:var(--txt-3)">' + (volume > 0 ? (volume + ' kg working volume') : 'Warm-ups stay separate from your tracked volume and PRs') + '</span>' +
          '</div>' +
        '</div>' +

        '<div id="wo-exercise-list">' + plan.exercises.map(renderExerciseCard).join('') + '</div>' +
        renderCompleteBanner(volume) +
        '<div class="quote-card" style="margin-top:14px"><div class="quote-text">' + TF.UI.escapeHTML(plan.motivational) + '</div></div>' +
        '<div class="workout-help-row"><button class="btn btn-ghost btn-sm workout-help-btn" id="btn-workout-help" type="button">' + TF.Icon('info', 12) + ' Training terms</button></div>' +
        '<div style="height:16px"></div>' +
      '</div>';

    TF.UI.setHeroImg(root.querySelector('#wo-hero'), plan.image);
    bindEvents();
    updateAutosaveStatus();
    ensureAutosaveTicker();

    // Elapsed timer — updates every 10s, cleared when screen unmounts
    var elapsedInterval = null;
    function updateElapsedTimer() {
      var el = root.querySelector('#wo-elapsed-timer');
      if (!el) { clearInterval(elapsedInterval); return; }
      var start = sessionState.startedAt || (todayLog && todayLog.startedAt);
      if (!start) { el.textContent = ''; return; }
      var elapsed = Math.max(0, Math.floor((Date.now() - new Date(start).getTime()) / 1000));
      var mins = Math.floor(elapsed / 60);
      var secs = elapsed % 60;
      el.textContent = '\u23F1 ' + mins + ':' + String(secs).padStart(2, '0') + ' elapsed';
    }
    updateElapsedTimer();
    elapsedInterval = setInterval(updateElapsedTimer, 10000);
    // Clear interval when router navigates away
    var rootEl = document.getElementById('screen-root');
    if (rootEl) {
      rootEl._screenCleanup = function() { clearInterval(elapsedInterval); };
    }
  }

  function handleSetField(exerciseName, setIndex, field, value) {
    if (!setLogs[exerciseName] || !setLogs[exerciseName][setIndex]) {
      return;
    }
    if (field === 'weight') {
      setLogs[exerciseName][setIndex][field] = formatWeight(value);
    } else if (field === 'rpe') {
      var numeric = parseInt(value, 10);
      setLogs[exerciseName][setIndex][field] = isFinite(numeric) && numeric >= 1 && numeric <= 10 ? String(numeric) : '';
    } else {
      setLogs[exerciseName][setIndex][field] = value != null ? String(value).trim() : '';
    }
    saveAllLogs();
    updateAutosaveStatus();
  }

  function restoreSwitchUndo() {
    var undo = loadSwitchUndo();
    if (!undo) {
      return;
    }
    if (undo.previousSelection && undo.previousSelection.mode === 'custom' && undo.previousSelection.workoutId) {
      TF.Store.selectWorkoutForDate(undo.previousSelection.workoutId, todayKey);
    } else if (undo.previousSelection && undo.previousSelection.mode === 'generated' && undo.previousSelection.splitKey && TF.Store.selectGeneratedWorkoutForDate) {
      TF.Store.selectGeneratedWorkoutForDate(undo.previousSelection.splitKey, todayKey, undo.previousSelection);
    } else {
      TF.Store.clearWorkoutSelection(todayKey);
    }
    TF.Store.saveWorkoutDay(undo.previousDay || {}, todayKey);
    clearSwitchUndo();
    TF.UI.toast('Previous workout restored.', 'success');
    TF.Router.navigate('workout', true);
  }

  function handleSwitchToGenerated() {
    var currentDay = TF.Store.getWorkoutDay(todayKey);
    function performSwitch() {
      saveSwitchUndo({
        message: 'Back on your generated workout. Undo is available if you switched by mistake.',
        previousDay: cloneWorkoutDay(currentDay),
        previousSelection: TF.Store.getWorkoutSelection(todayKey)
      });
      TF.Store.clearWorkoutSelection(todayKey);
      TF.Store.saveWorkoutDay({
        date: todayKey,
        exercises: {},
        notes: '',
        bodyweightKg: '',
        sourceType: 'generated',
        workoutId: null,
        workoutName: '',
        splitKey: null,
        planSnapshot: [],
        startedAt: null,
        finishedAt: null
      }, todayKey);
      TF.UI.toast('Back to your generated workout.', 'success');
      TF.Router.navigate('workout', true);
    }

    if (hasWorkoutActivity(currentDay)) {
      TF.UI.modal({
        icon: 'alert-triangle',
        title: 'Switch to generated workout?',
        copy: 'This will replace today\'s current logged session with the generated workout. You can still undo right after the switch.',
        cancelText: 'Keep current',
        confirmText: 'Switch',
        onConfirm: performSwitch
      });
      return;
    }
    performSwitch();
  }

  function openWorkoutSwitchModal() {
    TF.UI.modal({
      icon: 'target',
      title: 'Change today\'s workout',
      html: buildWorkoutSwitchModalHtml(),
      cancelText: 'Close',
      confirmText: 'Done',
      onOpen: function(card) {
        if (!card) {
          return;
        }
        card.querySelectorAll('[data-generated-split]').forEach(function(button) {
          button.addEventListener('click', function() {
            TF.UI.closeModal();
            handleGeneratedSplitChange(button.dataset.generatedSplit, {
              warning: button.dataset.warning || ''
            });
          });
        });
        card.querySelectorAll('[data-generated-preset]').forEach(function(button) {
          button.addEventListener('click', function() {
            TF.UI.closeModal();
            handleGeneratedPreset(button.dataset.generatedPreset);
          });
        });
        var autoBtn = card.querySelector('[data-generated-auto]');
        if (autoBtn) {
          autoBtn.addEventListener('click', function() {
            TF.UI.closeModal();
            handleSwitchToGenerated();
          });
        }
      }
    });
  }

  function handleGeneratedPreset(preset) {
    var presetMap = {
      sore: {
        splitKey: 'recovery',
        label: 'Soreness recovery',
        reason: 'sore',
        availableMinutes: 25,
        message: 'Soreness mode loaded. Keep it easy today.'
      },
      nogym: {
        splitKey: 'bodyweight',
        label: 'No-gym session',
        reason: 'noGym',
        equipmentOverride: 'none',
        message: 'No-gym bodyweight session loaded.'
      },
      short: {
        splitKey: plan.splitKey === 'custom' ? 'bodyweight' : (plan.splitKey || 'bodyweight'),
        label: 'Short session',
        reason: 'short',
        availableMinutes: 25,
        message: 'Short-time mode loaded.'
      },
      comeback: {
        splitKey: 'bodyweight',
        label: 'Comeback mode',
        reason: 'comeback',
        availableMinutes: 30,
        message: 'Comeback mode loaded for today.'
      }
    };
    var config = presetMap[preset];
    if (!config) {
      return;
    }
    handleGeneratedSplitChange(config.splitKey, config);
  }

  function handleGeneratedSplitChange(splitKey, options) {
    var currentDay = TF.Store.getWorkoutDay(todayKey);
    var currentSelection = TF.Store.getWorkoutSelection ? TF.Store.getWorkoutSelection(todayKey) : null;
    var details = options || {};
    var selectedLabel = details.label || splitOptionLabel(splitKey);
    var warning = details.warning || '';
    var currentReason = currentSelection ? (currentSelection.reason || null) : null;
    var nextReason = details.reason || null;
    var currentMinutes = currentSelection ? (currentSelection.availableMinutes || null) : null;
    var nextMinutes = details.availableMinutes || null;

    if (!TF.Store.selectGeneratedWorkoutForDate) {
      TF.UI.toast('Workout switching is not available in this build.', 'error');
      return;
    }
    if (currentSelection && currentSelection.mode === 'generated' && currentSelection.splitKey === splitKey && currentReason === nextReason && currentMinutes === nextMinutes) {
      TF.UI.toast(selectedLabel + ' is already selected for today.', 'success');
      return;
    }
    if ((!currentSelection || currentSelection.mode !== 'generated') && plan.splitKey === splitKey && !details.reason) {
      TF.UI.toast(selectedLabel + ' is already today\'s smart workout.', 'success');
      return;
    }

    function performSwitch() {
      saveSwitchUndo({
        message: selectedLabel + ' loaded for today. Undo is available if you switched by mistake.',
        previousDay: cloneWorkoutDay(currentDay),
        previousSelection: currentSelection
      });
      TF.Store.selectGeneratedWorkoutForDate(splitKey, todayKey, {
        reason: details.reason || null,
        availableMinutes: details.availableMinutes || null,
        equipmentOverride: details.equipmentOverride || null,
        label: selectedLabel
      });
      TF.Store.saveWorkoutDay({
        date: todayKey,
        exercises: {},
        notes: '',
        bodyweightKg: '',
        sourceType: 'generated',
        workoutId: null,
        workoutName: selectedLabel,
        splitKey: splitKey,
        planSnapshot: [],
        startedAt: null,
        finishedAt: null
      }, todayKey);
      TF.UI.toast(details.message || (selectedLabel + ' loaded for today.'), 'success');
      TF.Router.navigate('workout', true);
    }

    if (hasWorkoutActivity(currentDay)) {
      TF.UI.modal({
        icon: 'alert-triangle',
        title: 'Change today\'s workout?',
        copy: 'Switching to ' + selectedLabel + ' will replace today\'s current logged session. You can undo right after the switch.',
        cancelText: 'Keep current',
        confirmText: 'Switch',
        onConfirm: performSwitch
      });
      return;
    }
    if (warning) {
      TF.UI.modal({
        icon: 'alert-triangle',
        title: 'Still choose ' + selectedLabel + '?',
        copy: warning,
        cancelText: 'Choose another',
        confirmText: 'Use it',
        onConfirm: performSwitch
      });
      return;
    }
    performSwitch();
  }

  function bindEvents() {
    root.querySelectorAll('[data-ex-toggle]').forEach(function(button) {
      button.addEventListener('click', function() {
        var exercise = plan.exercises[parseInt(button.dataset.exToggle, 10)];
        if (!exercise) {
          return;
        }
        expanded[exercise.name] = !expanded[exercise.name];
        TF.UI.haptic(20);
        render();
      });
    });

    root.querySelectorAll('[data-open-details]').forEach(function(button) {
      button.addEventListener('click', function(event) {
        event.stopPropagation();
        renderExerciseDetailModal(button.dataset.openDetails);
      });
    });

    root.querySelectorAll('[data-swap-ex]').forEach(function(button) {
      button.addEventListener('click', function(event) {
        event.stopPropagation();
        swapExercise(parseInt(button.dataset.swapEx, 10), button.dataset.swapName);
      });
    });

    root.querySelectorAll('[data-add-warmup]').forEach(function(button) {
      button.addEventListener('click', function(event) {
        event.stopPropagation();
        addSet(button.dataset.addWarmup, 'warmup');
      });
    });

    root.querySelectorAll('[data-copy-warmup]').forEach(function(button) {
      button.addEventListener('click', function(event) {
        event.stopPropagation();
        copyLastSet(button.dataset.copyWarmup, 'warmup');
      });
    });

    root.querySelectorAll('[data-add-working]').forEach(function(button) {
      button.addEventListener('click', function(event) {
        event.stopPropagation();
        addSet(button.dataset.addWorking, 'working');
      });
    });

    root.querySelectorAll('[data-copy-working]').forEach(function(button) {
      button.addEventListener('click', function(event) {
        event.stopPropagation();
        copyLastSet(button.dataset.copyWorking, 'working');
      });
    });

    root.querySelectorAll('.weight-step-btn[data-step]').forEach(function(button) {
      button.addEventListener('click', function(event) {
        event.stopPropagation();
        adjustWeight(button.dataset.ex, parseInt(button.dataset.set, 10), parseFloat(button.dataset.step));
      });
    });

    root.querySelectorAll('[data-plate-ex]').forEach(function(button) {
      button.addEventListener('click', function(event) {
        event.stopPropagation();
        showPlateCalculator(button.dataset.plateEx, parseInt(button.dataset.plateSet, 10));
      });
    });

    root.querySelectorAll('.set-input, .set-rpe-input').forEach(function(inputEl) {
      function commitField() {
        handleSetField(
          inputEl.dataset.ex,
          parseInt(inputEl.dataset.set, 10),
          inputEl.dataset.field,
          inputEl.value
        );
      }
      inputEl.addEventListener('change', commitField);
      inputEl.addEventListener('blur', commitField);
      inputEl.addEventListener('click', function(event) {
        event.stopPropagation();
      });
    });

    root.querySelectorAll('.set-done-check').forEach(function(button) {
      button.addEventListener('click', function(event) {
        var exerciseName = button.dataset.ex;
        var setIndex = parseInt(button.dataset.set, 10);
        var set = setLogs[exerciseName] && setLogs[exerciseName][setIndex];
        var exercise = plan.exercises.find(function(item) {
          return item.name === exerciseName;
        });
        var rowBlock = button.closest('.set-row-block');
        var wouldBePR;
        if (!set || !exercise) {
          return;
        }
        event.stopPropagation();
        if (rowBlock) {
          var weightInput = rowBlock.querySelector('.set-input[data-field="weight"]');
          var repsInput = rowBlock.querySelector('.set-input[data-field="reps"]');
          var rpeInput = rowBlock.querySelector('.set-rpe-input[data-field="rpe"]');
          if (weightInput) set.weight = formatWeight(weightInput.value);
          if (repsInput) set.reps = String(repsInput.value || '').trim();
          if (rpeInput) set.rpe = String(rpeInput.value || '').trim();
        }
        wouldBePR = !set.done && checkPR(exerciseName, set);
        set.done = !set.done;
        set.completedAt = set.done ? new Date().toISOString() : null;
        if (!set.done && set.type !== 'warmup') {
          set.rpe = '';
        }
        saveAllLogs();
        TF.UI.haptic(50);
        if (set.done) {
          if (wouldBePR) {
            newPRs[exerciseName] = true;
            TF.UI.toast('New PR tracked for ' + exerciseName + '.', 'success', 3200);
            TF.UI.confetti();
          }
          TF.UI.startRestTimer(exercise.restSeconds || 90, exerciseName);
        }
        TF.Achievements.check({ type: 'workout' }).forEach(function(id) {
          setTimeout(function() {
            TF.UI.achievementToast(id);
          }, 900);
        });
        render();
      });
    });

    root.querySelectorAll('[data-remove-ex]').forEach(function(button) {
      button.addEventListener('click', function(event) {
        event.stopPropagation();
        removeSet(button.dataset.removeEx, parseInt(button.dataset.removeSet, 10));
      });
    });

    var notesEl = root.querySelector('#wo-session-notes');
    if (notesEl) {
      notesEl.addEventListener('input', function() {
        clearTimeout(notesDebounce);
        sessionState.notes = notesEl.value.trim();
        notesDebounce = setTimeout(function() {
          saveAllLogs();
          updateAutosaveStatus();
        }, 350);
      });
      notesEl.addEventListener('blur', function() {
        clearTimeout(notesDebounce);
        sessionState.notes = notesEl.value.trim();
        saveAllLogs();
        updateAutosaveStatus();
      });
    }

    var bodyweightEl = root.querySelector('#wo-bodyweight');
    var saveBodyweightBtn = root.querySelector('#btn-save-bodyweight');
    function saveBodyweight() {
      var value = parseFloat(bodyweightEl.value);
      if (!isFinite(value) || value < 20 || value > 300) {
        TF.UI.toast('Enter a valid bodyweight between 20 and 300 kg.', 'error');
        return;
      }
      sessionState.bodyweightKg = formatWeight(value);
      bodyweightEl.value = sessionState.bodyweightKg;
      saveAllLogs();
      TF.UI.haptic(40);
      TF.UI.toast(sessionState.bodyweightKg + ' kg logged for this workout.', 'success');
      updateAutosaveStatus();
    }
    if (saveBodyweightBtn) {
      saveBodyweightBtn.addEventListener('click', saveBodyweight);
    }
    if (bodyweightEl) {
      bodyweightEl.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
          saveBodyweight();
        }
      });
    }

    var customBuilderBtn = root.querySelector('#btn-custom-builder');
    if (customBuilderBtn) {
      customBuilderBtn.addEventListener('click', function() {
        TF.Router.navigate('custom-workouts');
      });
    }

    var logbookBtn = root.querySelector('#btn-logbook');
    if (logbookBtn) {
      logbookBtn.addEventListener('click', function() {
        TF.Router.navigate('history');
      });
    }

    var resetBtn = root.querySelector('#btn-reset-generated');
    if (resetBtn) {
      resetBtn.addEventListener('click', handleSwitchToGenerated);
    }

    var openWorkoutSwitcherBtn = root.querySelector('#btn-open-workout-switcher');
    if (openWorkoutSwitcherBtn) {
      openWorkoutSwitcherBtn.addEventListener('click', openWorkoutSwitchModal);
    }

    var finishBtn = root.querySelector('#btn-finish-workout');
    if (finishBtn) {
      finishBtn.addEventListener('click', function() {
        if (!allDone()) {
          TF.UI.toast('Finish the remaining working sets first.', 'error');
          return;
        }
        renderFinishSummaryModal();
      });
    }

    var helpBtn = root.querySelector('#btn-workout-help');
    if (helpBtn) {
      helpBtn.addEventListener('click', renderGlossaryModal);
    }

    var undoLocalBtn = root.querySelector('#btn-undo-local');
    if (undoLocalBtn) {
      undoLocalBtn.addEventListener('click', undoRemoveSet);
    }

    var dismissLocalBtn = root.querySelector('#btn-dismiss-local-undo');
    if (dismissLocalBtn) {
      dismissLocalBtn.addEventListener('click', function() {
        undoState = null;
        render();
      });
    }

    var undoSwitchBtn = root.querySelector('#btn-undo-switch');
    if (undoSwitchBtn) {
      undoSwitchBtn.addEventListener('click', restoreSwitchUndo);
    }

    var dismissSwitchBtn = root.querySelector('#btn-dismiss-switch-undo');
    if (dismissSwitchBtn) {
      dismissSwitchBtn.addEventListener('click', function() {
        clearSwitchUndo();
        render();
      });
    }
  }

  hydratePlanFromTodayLog();
  plan.exercises = snapshotExercises(plan.exercises);
  plan.exercises.forEach(function(exercise) {
    ensureExerciseState(exercise);
  });
  persistSessionMeta();

  root._screenCleanup = function() {
    clearTimeout(notesDebounce);
    if (autosaveInterval) {
      clearInterval(autosaveInterval);
      autosaveInterval = null;
    }
  };

  render();
};
