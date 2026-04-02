/* ================================================================
   STORE v4 - localStorage management
   Static-first, GitHub Pages-safe data model
   ================================================================ */
TF.Store = (function(){
  'use strict';

  var K = {
    PROFILE: 'tf_profile',
    INPUTS: 'tf_inputs',
    MISSIONS: 'tf_missions',
    NUTRITION: 'tf_nutrition',
    WEIGHT: 'tf_weight',
    QUOTES: 'tf_quotes_cache',
    WORKOUT_LOG: 'tf_workout_log',
    OVERLOAD: 'tf_overload',
    MEASUREMENTS: 'tf_measurements',
    ACHIEVEMENTS: 'tf_achievements',
    SHIELDS: 'tf_shields',
    THEME: 'tf_theme',
    SETTINGS: 'tf_settings',
    HABITS: 'tf_habits',
    HABIT_STREAKS: 'tf_habit_streaks',
    PRS: 'tf_prs'
  };

  var PROFILE_DEF = {
    name: 'Warrior',
    goal: 'muscle',
    experience: 'beginner',
    equipment: 'minimal',
    availableMinutes: 45,
    bodyWeightKg: 75,
    targetCalories: 2400,
    targetProtein: 150,
    xp: 0,
    streakDays: 0,
    lastActiveDate: null,
    createdAt: null
  };

  var SETTINGS_DEF = {
    backupReminderDays: 7,
    browserNotifications: false,
    lastBackupExportAt: null,
    lastBackupReminderAt: null
  };

  function load(key, fallback){
    try{
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){
      return fallback;
    }
  }

  function save(key, value){
    try{
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    }catch(e){
      console.warn('[Store] Write failed', e);
      return false;
    }
  }

  function todayKey(){
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function yesterday(){
    var d = new Date();
    d.setDate(d.getDate() - 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function keyFromDate(date){
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return null;
    }
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }

  function keyFromIso(iso){
    if (!iso) {
      return null;
    }
    return keyFromDate(new Date(iso));
  }

  function daysBetweenKeys(startKey, endKey){
    if (!startKey || !endKey) {
      return 0;
    }
    var start = new Date(startKey + 'T12:00:00');
    var end = new Date(endKey + 'T12:00:00');
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 0;
    }
    return Math.max(0, Math.floor((end - start) / 86400000));
  }

  function getStorageUsedKB(){
    var total = 0;
    try{
      Object.keys(localStorage).forEach(function(key){
        var value = localStorage.getItem(key) || '';
        total += value.length;
      });
    }catch(e){}
    return Math.round(total / 1024);
  }

  function isStorageNearLimit(){
    return getStorageUsedKB() > 4000;
  }

  function rotateOldData(){
    var cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - TF.Config.DataRetentionDays);
    var cutoffKey = keyFromDate(cutoff);
    [K.INPUTS, K.MISSIONS, K.NUTRITION, K.WORKOUT_LOG, K.HABITS].forEach(function(key){
      var value = load(key, {});
      var pruned = Object.fromEntries(Object.entries(value).filter(function(entry){
        return entry[0] >= cutoffKey;
      }));
      save(key, pruned);
    });
  }

  function getProfile(){
    return Object.assign({}, PROFILE_DEF, load(K.PROFILE, {}));
  }

  function saveProfile(patch){
    var profile = Object.assign({}, getProfile(), patch);
    if (!profile.createdAt) {
      profile.createdAt = new Date().toISOString();
    }
    save(K.PROFILE, profile);
    return profile;
  }

  function isAccountReady(){
    var profile = getProfile();
    return localStorage.getItem('tf_onboarded') === '1' || profile.name !== PROFILE_DEF.name;
  }

  function requiresAccount(){
    return !isAccountReady();
  }

  function markOnboarded(){
    localStorage.setItem('tf_onboarded', '1');
  }

  function addXP(amount){
    var profile = getProfile();
    var today = todayKey();
    var yd = yesterday();
    var isConsecutive = profile.lastActiveDate === yd || profile.lastActiveDate === today;
    var streak = isConsecutive ? (profile.lastActiveDate === today ? profile.streakDays : profile.streakDays + 1) : 1;
    return saveProfile({
      xp: profile.xp + amount,
      streakDays: streak,
      lastActiveDate: today
    });
  }

  function breakStreak(){
    var shields = getShields();
    if (shields > 0) {
      setShields(shields - 1);
      return false;
    }
    saveProfile({ streakDays: 0 });
    return true;
  }

  function getLevel(profile){
    profile = profile || getProfile();
    return Math.floor(profile.xp / TF.Config.XP.perLevel) + 1;
  }

  function getXPProgress(profile){
    profile = profile || getProfile();
    return (profile.xp % TF.Config.XP.perLevel) / TF.Config.XP.perLevel;
  }

  function getXPToNext(profile){
    profile = profile || getProfile();
    return TF.Config.XP.perLevel - (profile.xp % TF.Config.XP.perLevel);
  }

  function getWarriorTitle(level){
    var titles = TF.Config.WarriorTitles;
    return titles[Math.min(level, titles.length - 1)] || 'Legend';
  }

  function getShields(){
    return load(K.SHIELDS, 0);
  }

  function setShields(count){
    save(K.SHIELDS, Math.max(0, count));
  }

  function addShield(){
    setShields(getShields() + 1);
  }

  function getAllInputs(){
    return load(K.INPUTS, {});
  }

  function getTodayInput(){
    return getAllInputs()[todayKey()] || null;
  }

  function getInputForDate(key){
    return getAllInputs()[key] || null;
  }

  function saveDailyInput(data){
    var all = getAllInputs();
    var key = data.dateKey || todayKey();
    all[key] = Object.assign({}, data, { dateKey: key, savedAt: new Date().toISOString() });
    save(K.INPUTS, all);
    return all[key];
  }

  function getLastNInputs(count){
    return Object.values(getAllInputs()).sort(function(a, b){
      return b.dateKey.localeCompare(a.dateKey);
    }).slice(0, count);
  }

  function getAllMissions(){
    return load(K.MISSIONS, {});
  }

  function getTodayMissions(){
    return getAllMissions()[todayKey()] || [];
  }

  function saveTodayMissions(missions){
    var all = getAllMissions();
    all[todayKey()] = missions;
    save(K.MISSIONS, all);
  }

  function completeMission(id){
    var missions = getTodayMissions();
    var index = missions.findIndex(function(mission){
      return mission.id === id;
    });
    if (index === -1 || missions[index].done) {
      return null;
    }
    missions[index].done = true;
    missions[index].completedAt = new Date().toISOString();
    saveTodayMissions(missions);
    addXP(missions[index].xpReward);
    return missions[index].xpReward;
  }

  function getMissionStats(){
    var all = getAllMissions();
    var totalDays = Object.keys(all).length;
    var totalCompleted = 0;
    var totalMissions = 0;
    Object.values(all).forEach(function(missions){
      totalMissions += missions.length;
      totalCompleted += missions.filter(function(mission){
        return mission.done;
      }).length;
    });
    return {
      totalDays: totalDays,
      totalCompleted: totalCompleted,
      totalMissions: totalMissions
    };
  }

  function getAllNutrition(){
    return load(K.NUTRITION, {});
  }

  function getTodayNutrition(){
    return getAllNutrition()[todayKey()] || { calories: 0, protein: 0, water: 0, fat: 0, carbs: 0 };
  }

  function saveTodayNutrition(data){
    var all = getAllNutrition();
    all[todayKey()] = Object.assign({}, getTodayNutrition(), data, { updatedAt: new Date().toISOString() });
    save(K.NUTRITION, all);
    return all[todayKey()];
  }

  function getWeightLog(){
    return load(K.WEIGHT, []);
  }

  function addWeight(kg){
    var log = getWeightLog();
    var today = todayKey();
    var entry = { date: today, kg: parseFloat(parseFloat(kg).toFixed(1)) };
    var index = log.findIndex(function(item){
      return item.date === today;
    });
    if (index >= 0) {
      log[index] = entry;
    } else {
      log.unshift(entry);
    }
    save(K.WEIGHT, log);
    return log;
  }

  function getAllWorkoutLogs(){
    return load(K.WORKOUT_LOG, {});
  }

  function getTodayWorkoutLog(){
    return getAllWorkoutLogs()[todayKey()] || {};
  }

  function saveExerciseLog(name, sets){
    var all = getAllWorkoutLogs();
    var today = todayKey();
    if (!all[today]) {
      all[today] = { date: today, exercises: {} };
    }
    all[today].exercises[name] = sets;
    save(K.WORKOUT_LOG, all);
    _trackPR(name, sets);
  }

  function getExerciseLog(name, dateKey){
    dateKey = dateKey || todayKey();
    var day = getAllWorkoutLogs()[dateKey];
    return (day && day.exercises && day.exercises[name]) || null;
  }

  function getLastWorkoutByExercise(name){
    var all = getAllWorkoutLogs();
    var today = todayKey();
    var sorted = Object.keys(all).filter(function(key){
      return key < today;
    }).sort().reverse();
    for (var i = 0; i < sorted.length; i++) {
      var log = all[sorted[i]];
      if (log.exercises && log.exercises[name]) {
        return { date: sorted[i], sets: log.exercises[name] };
      }
    }
    return null;
  }

  function getWorkoutDates(){
    return Object.keys(getAllWorkoutLogs()).filter(function(key){
      var day = getAllWorkoutLogs()[key];
      return day && day.exercises && Object.keys(day.exercises).length > 0;
    });
  }

  function _calc1RM(weight, reps){
    if (!weight || !reps || reps < 1) {
      return 0;
    }
    if (reps === 1) {
      return weight;
    }
    return Math.round(weight * (1 + reps / 30));
  }

  function _trackPR(name, sets){
    var best = 0;
    sets.forEach(function(set){
      if (set.done && set.weight && set.reps) {
        var estimate = _calc1RM(parseFloat(set.weight), parseInt(set.reps, 10));
        if (estimate > best) {
          best = estimate;
        }
      }
    });
    if (!best) {
      return false;
    }
    var prs = load(K.PRS, {});
    if (!prs[name] || best > prs[name].est1RM) {
      prs[name] = {
        est1RM: best,
        date: todayKey(),
        weight: sets[0] && sets[0].weight,
        reps: sets[0] && sets[0].reps
      };
      save(K.PRS, prs);
      return true;
    }
    return false;
  }

  function getPRs(){
    return load(K.PRS, {});
  }

  function getPR(name){
    return load(K.PRS, {})[name] || null;
  }

  function calc1RM(weight, reps){
    return _calc1RM(weight, reps);
  }

  function getOverloadData(){
    return load(K.OVERLOAD, {});
  }

  function saveOverloadEntry(name, entry){
    var data = getOverloadData();
    data[name] = entry;
    save(K.OVERLOAD, data);
  }

  function getOverloadEntry(name){
    return getOverloadData()[name] || null;
  }

  function getMeasurements(){
    return load(K.MEASUREMENTS, []);
  }

  function addMeasurement(data){
    var log = getMeasurements();
    var today = todayKey();
    var entry = Object.assign({}, data, { date: today });
    var index = log.findIndex(function(item){
      return item.date === today;
    });
    if (index >= 0) {
      log[index] = entry;
    } else {
      log.unshift(entry);
    }
    save(K.MEASUREMENTS, log);
    return log;
  }

  function getAllHabits(){
    return load(K.HABITS, {});
  }

  function ensureHabitDay(dayKey){
    var all = getAllHabits();
    if (!all[dayKey]) {
      all[dayKey] = {};
      TF.Config.DefaultHabits.forEach(function(habit){
        all[dayKey][habit.id] = false;
      });
      save(K.HABITS, all);
    }
    return all[dayKey];
  }

  function getTodayHabits(){
    return ensureHabitDay(todayKey());
  }

  function toggleHabit(id, done){
    var all = getAllHabits();
    var today = todayKey();
    if (!all[today]) {
      ensureHabitDay(today);
      all = getAllHabits();
    }
    var wasDone = !!all[today][id];
    all[today][id] = !!done;
    save(K.HABITS, all);
    _updateHabitStreak(id, !!done);
    if (done && !wasDone) {
      var definition = TF.Config.DefaultHabits.find(function(habit){
        return habit.id === id;
      });
      if (definition) {
        addXP(definition.xp);
      }
      return definition ? definition.xp : 0;
    }
    return 0;
  }

  function _updateHabitStreak(id, done){
    var streaks = load(K.HABIT_STREAKS, {});
    if (!streaks[id]) {
      streaks[id] = { current: 0, best: 0, lastDate: null };
    }
    var streak = streaks[id];
    var today = todayKey();
    var yd = yesterday();
    if (done) {
      if (streak.lastDate === yd) {
        streak.current += 1;
      } else if (streak.lastDate !== today) {
        streak.current = 1;
      }
      streak.lastDate = today;
      streak.best = Math.max(streak.best, streak.current);
    } else if (streak.lastDate === today) {
      streak.current = Math.max(0, streak.current - 1);
      if (streak.current === 0) {
        streak.lastDate = null;
      }
    }
    streaks[id] = streak;
    save(K.HABIT_STREAKS, streaks);
  }

  function getHabitStreaks(){
    return load(K.HABIT_STREAKS, {});
  }

  function getHabitStreak(id){
    return (load(K.HABIT_STREAKS, {})[id] || { current: 0, best: 0 }).current;
  }

  function getHabitStats(){
    var all = getAllHabits();
    var counts = {};
    TF.Config.DefaultHabits.forEach(function(habit){
      counts[habit.id] = 0;
    });
    Object.values(all).forEach(function(day){
      Object.keys(day).forEach(function(id){
        if (day[id]) {
          counts[id] = (counts[id] || 0) + 1;
        }
      });
    });
    return {
      days: Object.keys(all).length,
      counts: counts
    };
  }

  function getUnlockedAchievements(){
    return load(K.ACHIEVEMENTS, {});
  }

  function unlockAchievement(id){
    var unlocked = getUnlockedAchievements();
    if (unlocked[id]) {
      return false;
    }
    unlocked[id] = { unlockedAt: new Date().toISOString() };
    save(K.ACHIEVEMENTS, unlocked);
    return true;
  }

  function isAchievementUnlocked(id){
    return !!getUnlockedAchievements()[id];
  }

  function getTheme(){
    return load(K.THEME, 'dark');
  }

  function setTheme(theme){
    save(K.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  function getCachedQuotes(){
    return load(K.QUOTES, null);
  }

  function cacheQuotes(data){
    save(K.QUOTES, { quotes: data, cachedAt: new Date().toISOString() });
  }

  function getSettings(){
    var settings = Object.assign({}, SETTINGS_DEF, load(K.SETTINGS, {}));
    if (TF.Config.BackupReminderOptions.indexOf(settings.backupReminderDays) === -1) {
      settings.backupReminderDays = SETTINGS_DEF.backupReminderDays;
    }
    settings.browserNotifications = !!settings.browserNotifications;
    return settings;
  }

  function saveSettings(patch){
    var settings = Object.assign({}, getSettings(), patch);
    if (TF.Config.BackupReminderOptions.indexOf(settings.backupReminderDays) === -1) {
      settings.backupReminderDays = SETTINGS_DEF.backupReminderDays;
    }
    settings.browserNotifications = !!settings.browserNotifications;
    save(K.SETTINGS, settings);
    return settings;
  }

  function markBackupReminderShown(){
    return saveSettings({ lastBackupReminderAt: new Date().toISOString() });
  }

  function markBackupExported(){
    return saveSettings({
      lastBackupExportAt: new Date().toISOString(),
      lastBackupReminderAt: new Date().toISOString()
    });
  }

  function getBackupReminderState(){
    var settings = getSettings();
    var today = todayKey();
    var reminderDay = keyFromIso(settings.lastBackupReminderAt);
    var exportDay = keyFromIso(settings.lastBackupExportAt);
    var createdDay = keyFromIso(getProfile().createdAt);
    if (!createdDay) {
      return {
        due: false,
        reason: null,
        interval: settings.backupReminderDays,
        hasBackup: !!exportDay,
        daysSince: 0
      };
    }
    if (reminderDay === today) {
      return {
        due: false,
        reason: null,
        interval: settings.backupReminderDays,
        hasBackup: !!exportDay,
        daysSince: exportDay ? daysBetweenKeys(exportDay, today) : daysBetweenKeys(createdDay, today)
      };
    }
    if (!exportDay) {
      return {
        due: true,
        reason: 'first_backup',
        interval: settings.backupReminderDays,
        hasBackup: false,
        daysSince: daysBetweenKeys(createdDay, today)
      };
    }
    var daysSinceExport = daysBetweenKeys(exportDay, today);
    return {
      due: daysSinceExport >= settings.backupReminderDays,
      reason: 'scheduled_backup',
      interval: settings.backupReminderDays,
      hasBackup: true,
      daysSince: daysSinceExport
    };
  }

  function exportAllData(){
    var snapshot = {
      version: TF.Config.version,
      exportedAt: new Date().toISOString(),
      data: {}
    };
    Object.entries(K).forEach(function(entry){
      try{
        snapshot.data[entry[0]] = JSON.parse(localStorage.getItem(entry[1]) || 'null');
      }catch(_){}
    });
    var blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'tommyy-backup-' + todayKey() + '.json';
    link.click();
    markBackupExported();
    setTimeout(function(){
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function importData(jsonStr){
    try{
      var snapshot = JSON.parse(jsonStr);
      if (!snapshot.data) {
        throw new Error('Invalid backup file');
      }
      Object.entries(K).forEach(function(entry){
        var value = snapshot.data[entry[0]];
        if (value !== null && value !== undefined) {
          save(entry[1], value);
        }
      });
      return true;
    }catch(e){
      return false;
    }
  }

  function clearAllData(){
    Object.values(K).forEach(function(key){
      localStorage.removeItem(key);
    });
    localStorage.removeItem('tf_onboarded');
  }

  return {
    todayKey: todayKey,
    yesterday: yesterday,
    getStorageUsedKB: getStorageUsedKB,
    isStorageNearLimit: isStorageNearLimit,
    rotateOldData: rotateOldData,
    getProfile: getProfile,
    saveProfile: saveProfile,
    isAccountReady: isAccountReady,
    requiresAccount: requiresAccount,
    markOnboarded: markOnboarded,
    addXP: addXP,
    breakStreak: breakStreak,
    getLevel: getLevel,
    getXPProgress: getXPProgress,
    getXPToNext: getXPToNext,
    getWarriorTitle: getWarriorTitle,
    getShields: getShields,
    setShields: setShields,
    addShield: addShield,
    getAllInputs: getAllInputs,
    getTodayInput: getTodayInput,
    getInputForDate: getInputForDate,
    saveDailyInput: saveDailyInput,
    getLastNInputs: getLastNInputs,
    getAllMissions: getAllMissions,
    getTodayMissions: getTodayMissions,
    saveTodayMissions: saveTodayMissions,
    completeMission: completeMission,
    getMissionStats: getMissionStats,
    getAllNutrition: getAllNutrition,
    getTodayNutrition: getTodayNutrition,
    saveTodayNutrition: saveTodayNutrition,
    getWeightLog: getWeightLog,
    addWeight: addWeight,
    getAllWorkoutLogs: getAllWorkoutLogs,
    getTodayWorkoutLog: getTodayWorkoutLog,
    saveExerciseLog: saveExerciseLog,
    getExerciseLog: getExerciseLog,
    getLastWorkoutByExercise: getLastWorkoutByExercise,
    getWorkoutDates: getWorkoutDates,
    getPRs: getPRs,
    getPR: getPR,
    calc1RM: calc1RM,
    getOverloadEntry: getOverloadEntry,
    saveOverloadEntry: saveOverloadEntry,
    getMeasurements: getMeasurements,
    addMeasurement: addMeasurement,
    getAllHabits: getAllHabits,
    getTodayHabits: getTodayHabits,
    toggleHabit: toggleHabit,
    getHabitStreaks: getHabitStreaks,
    getHabitStreak: getHabitStreak,
    getHabitStats: getHabitStats,
    getUnlockedAchievements: getUnlockedAchievements,
    unlockAchievement: unlockAchievement,
    isAchievementUnlocked: isAchievementUnlocked,
    getTheme: getTheme,
    setTheme: setTheme,
    getCachedQuotes: getCachedQuotes,
    cacheQuotes: cacheQuotes,
    getSettings: getSettings,
    saveSettings: saveSettings,
    markBackupReminderShown: markBackupReminderShown,
    markBackupExported: markBackupExported,
    getBackupReminderState: getBackupReminderState,
    exportAllData: exportAllData,
    importData: importData,
    clearAllData: clearAllData
  };
})();
