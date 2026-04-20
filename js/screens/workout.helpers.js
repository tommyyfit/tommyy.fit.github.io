TF.WorkoutScreenHelpers = (function() {
  'use strict';

  function cloneExercise(exercise) {
    var definition = TF.Workout.getExerciseDefinition(exercise && exercise.name);
    var merged = Object.assign({}, definition, exercise || {});
    merged.sets = Math.max(1, parseInt(merged.sets, 10) || 3);
    merged.reps = String(merged.reps || '8-10');
    merged.restSeconds = Math.max(0, parseInt(merged.restSeconds, 10) || 90);
    merged.rest = merged.rest || (merged.restSeconds >= 120 && merged.restSeconds % 60 === 0 ? (merged.restSeconds / 60) + ' min' : merged.restSeconds + ' sec');
    merged.note = merged.note || '';
    merged.swapGroup = merged.swapGroup || definition.swapGroup || '';
    return merged;
  }

  function snapshotExercises(list) {
    return (list || []).map(cloneExercise);
  }

  function cloneWorkoutDay(day) {
    return JSON.parse(JSON.stringify(day || {}));
  }

  function loadSwitchUndo(storageKey, todayKey) {
    try {
      var raw = sessionStorage.getItem(storageKey);
      var parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || parsed.dateKey !== todayKey) {
        sessionStorage.removeItem(storageKey);
        return null;
      }
      return parsed;
    } catch (error) {
      sessionStorage.removeItem(storageKey);
      return null;
    }
  }

  function saveSwitchUndo(storageKey, todayKey, payload) {
    sessionStorage.setItem(storageKey, JSON.stringify(Object.assign({
      dateKey: todayKey,
      createdAt: new Date().toISOString()
    }, payload || {})));
  }

  function clearSwitchUndo(storageKey) {
    sessionStorage.removeItem(storageKey);
  }

  function hasWorkoutActivity(day) {
    if (!day) {
      return false;
    }
    if (String(day.notes || '').trim() || String(day.bodyweightKg || '').trim()) {
      return true;
    }
    return Object.keys(day.exercises || {}).some(function(name) {
      return (day.exercises[name] || []).some(function(set) {
        return !!(set.done || set.weight || set.reps || set.rpe);
      });
    });
  }

  function isSameSession(log, currentPlan) {
    if (!log || !log.sourceType) {
      return false;
    }
    if (log.sourceType !== (currentPlan.sourceType || 'generated')) {
      return false;
    }
    if (currentPlan.sourceType === 'custom') {
      return !!currentPlan.workoutId && log.workoutId === currentPlan.workoutId;
    }
    if (log.splitKey && currentPlan.splitKey && log.splitKey !== currentPlan.splitKey) {
      return false;
    }
    return true;
  }

  function hydratePlanFromTodayLog(todayLog, plan) {
    var currentMap;
    if (!isSameSession(todayLog, plan)) {
      return null;
    }
    if (todayLog.planSnapshot && todayLog.planSnapshot.length) {
      return snapshotExercises(todayLog.planSnapshot);
    }
    if (!todayLog.exercises || !Object.keys(todayLog.exercises).length) {
      return null;
    }
    currentMap = {};
    plan.exercises.forEach(function(exercise) {
      currentMap[exercise.name] = exercise;
    });
    return Object.keys(todayLog.exercises).map(function(name) {
      return currentMap[name] ? cloneExercise(currentMap[name]) : TF.Workout.getExerciseDefinition(name);
    });
  }

  function roundWeight(value) {
    return Math.round(value * 4) / 4;
  }

  function formatWeight(value) {
    var numeric = parseFloat(value);
    if (!isFinite(numeric) || numeric <= 0) {
      return '';
    }
    return String(parseFloat(numeric.toFixed(2)));
  }

  function buildDefaultSets(exercise) {
    var last = TF.Store.getLastWorkoutByExercise(exercise.name);
    return Array.from({ length: exercise.sets }, function(_, index) {
      var lastSet = last && last.sets && last.sets[index];
      return {
        weight: lastSet ? String(lastSet.weight || '') : '',
        reps: lastSet ? String(lastSet.reps || '') : '',
        done: false,
        type: 'working',
        rpe: ''
      };
    });
  }

  function cloneSet(set) {
    return {
      weight: set.weight != null ? String(set.weight) : '',
      reps: set.reps != null ? String(set.reps) : '',
      done: !!set.done,
      type: set.type === 'warmup' ? 'warmup' : 'working',
      rpe: set.rpe != null && set.rpe !== '' ? String(set.rpe) : '',
      completedAt: set.completedAt || null
    };
  }

  function ensureExerciseState(exercise, todayLog, setLogs) {
    var existing = todayLog.exercises && todayLog.exercises[exercise.name];
    if (setLogs[exercise.name]) {
      return;
    }
    if (existing && existing.length) {
      setLogs[exercise.name] = existing.map(cloneSet);
      return;
    }
    setLogs[exercise.name] = buildDefaultSets(exercise);
  }

  return {
    buildDefaultSets: buildDefaultSets,
    clearSwitchUndo: clearSwitchUndo,
    cloneExercise: cloneExercise,
    cloneSet: cloneSet,
    cloneWorkoutDay: cloneWorkoutDay,
    ensureExerciseState: ensureExerciseState,
    formatWeight: formatWeight,
    hasWorkoutActivity: hasWorkoutActivity,
    hydratePlanFromTodayLog: hydratePlanFromTodayLog,
    isSameSession: isSameSession,
    loadSwitchUndo: loadSwitchUndo,
    roundWeight: roundWeight,
    saveSwitchUndo: saveSwitchUndo,
    snapshotExercises: snapshotExercises
  };
})();
