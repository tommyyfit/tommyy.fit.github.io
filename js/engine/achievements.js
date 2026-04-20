/* ================================================================
   ACHIEVEMENTS ENGINE v2 - expanded achievement ladder
   ================================================================ */
TF.Achievements = (function(){
  'use strict';

  var DEFS = [
    /* Consistency */
    {id:'first_checkin',  name:'First Blood',        icon:'\u{1F7E2}', desc:'Log your first daily check-in.', cat:'consistency'},
    {id:'streak_3',       name:'3-Day Warrior',      icon:'\u{1F525}', desc:'Maintain a 3-day streak.', cat:'consistency'},
    {id:'streak_7',       name:'Week of Fire',       icon:'\u{2694}', desc:'7-day streak without breaking.', cat:'consistency'},
    {id:'streak_14',      name:'Iron Fortnight',     icon:'\u{1F6E1}', desc:'14 consecutive days logged.', cat:'consistency'},
    {id:'streak_30',      name:'30-Day Spartan',     icon:'\u{1F3DB}', desc:'30-day streak. Few reach this.', cat:'consistency'},
    {id:'streak_100',     name:'100-Day Legend',     icon:'\u{1F48E}', desc:'100 days straight. You are the 1%.', cat:'consistency'},
    {id:'habit_25',       name:'Habit Stack',        icon:'\u{1F9F1}', desc:'Complete 25 total habits.', cat:'consistency'},
    {id:'habit_100',      name:'Discipline Machine', icon:'\u{2699}', desc:'Complete 100 total habits.', cat:'consistency'},
    {id:'all_habits_day', name:'Clean Day',          icon:'\u{2708}', desc:'Complete every daily habit in one day.', cat:'consistency'},
    {id:'streak_50',      name:'50-Day Unstoppable', icon:'\u{1F4A8}', desc:'50 consecutive days. Unstoppable force.', cat:'consistency'},
    {id:'streak_60',      name:'60-Day Master',      icon:'\u{1F947}', desc:'2 months straight. True dedication.', cat:'consistency'},
    {id:'perfect_day',    name:'Perfect Discipline', icon:'\u{2B50}', desc:'Complete habits, workout, and nutrition target same day.', cat:'consistency'},

    /* Training */
    {id:'first_workout',  name:'First Rep',          icon:'\u{1F4AA}', desc:'Complete your first workout session.', cat:'training'},
    {id:'workouts_10',    name:'10 Sessions',        icon:'\u{1F3CB}', desc:'Log 10 workout sessions.', cat:'training'},
    {id:'workouts_50',    name:'50 Sessions',        icon:'\u{26A1}', desc:'50 workouts completed.', cat:'training'},
    {id:'workouts_100',   name:'Century',            icon:'\u{1F396}', desc:'100 workouts. This is who you are now.', cat:'training'},
    {id:'workouts_250',   name:'Iron Calendar',      icon:'\u{1F5D3}', desc:'Log 250 workout sessions.', cat:'training'},
    {id:'first_pr',       name:'New Record',         icon:'\u{1F4C8}', desc:'Hit a progressive overload suggestion.', cat:'training'},
    {id:'full_workout',   name:'Full Execution',     icon:'\u{2705}', desc:'Mark every exercise done in a session.', cat:'training'},
    {id:'warmup_25',      name:'Prep Matters',       icon:'\u{1F321}', desc:'Log 25 warm-up sets.', cat:'training'},
    {id:'rpe_100',        name:'Effort Scientist',   icon:'\u{1F9EA}', desc:'Log RPE on 100 completed working sets.', cat:'training'},
    {id:'notes_10',       name:'Training Journal',   icon:'\u{1F4DD}', desc:'Save workout notes on 10 sessions.', cat:'training'},
    {id:'volume_10000',   name:'Ton Moved',          icon:'\u{1F4E6}', desc:'Move 10,000 kg of working volume.', cat:'training'},
    {id:'volume_50000',   name:'Steel Moved',        icon:'\u{1F3D7}', desc:'Move 50,000 kg of working volume.', cat:'training'},
    {id:'custom_session', name:'Built Not Bought',   icon:'\u{1F6E0}', desc:'Complete a session from a custom workout.', cat:'training'},
    {id:'custom_saved_1', name:'Architect',          icon:'\u{1F3DB}', desc:'Save your first custom workout.', cat:'training'},
    {id:'custom_saved_5', name:'Program Designer',   icon:'\u{1F4D0}', desc:'Save 5 custom workouts.', cat:'training'},
    {id:'workouts_150',   name:'150 Sessions',       icon:'\u{1F4A3}', desc:'Log 150 workout sessions. Relentless.', cat:'training'},
    {id:'workouts_300',   name:'300 Sessions',       icon:'\u{1F31F}', desc:'300 workouts. You ARE the gym.', cat:'training'},
    {id:'volume_100000',  name:'Titan Moved',        icon:'\u{1F4F2}', desc:'Move 100,000 kg of working volume.', cat:'training'},
    {id:'workout_streak_7', name:'Consistent Grinder', icon:'\u{1F62E}', desc:'7 workouts in 7 consecutive days.', cat:'training'},
    {id:'rpe_250',        name:'Effort Master',      icon:'\u{1F9EE}', desc:'Log RPE on 250 completed working sets.', cat:'training'},

    /* Nutrition */
    {id:'first_nutrition',name:'First Fuel',         icon:'\u{1F37D}', desc:'Log nutrition for the first time.', cat:'nutrition'},
    {id:'protein_7',      name:'Protein King',       icon:'\u{1F969}', desc:'Hit protein target 7 days in a row.', cat:'nutrition'},
    {id:'macro_master',   name:'Macro Master',       icon:'\u{1F3AF}', desc:'Hit calories and protein target on the same day.', cat:'nutrition'},
    {id:'macro_master_7', name:'Locked In Fuel',     icon:'\u{1F6E1}', desc:'Hit calories and protein target 7 days in a row.', cat:'nutrition'},
    {id:'food_search_25', name:'Food Scout',         icon:'\u{1F50D}', desc:'Log 25 food-search additions.', cat:'nutrition'},
    {id:'carbs_master',   name:'Carb Balance',       icon:'\u{1F48C}', desc:'Hit carbs and protein target on same day 5 times.', cat:'nutrition'},
    {id:'protein_20',     name:'Protein Prophet',    icon:'\u{1F957}', desc:'Hit protein target 20 days total.', cat:'nutrition'},
    {id:'food_search_50', name:'Food Database Master', icon:'\u{1F4DA}', desc:'Log 50 food-search additions.', cat:'nutrition'},

    /* Scores */
    {id:'first_score',    name:'First Score',        icon:'\u{1F4CA}', desc:'Complete a check-in and see your focus score.', cat:'scores'},
    {id:'score_elite',    name:'Elite Day',          icon:'\u{1F31F}', desc:'Score 88+ on daily focus score.', cat:'scores'},
    {id:'score_95',       name:'Near Perfect',       icon:'\u{2728}', desc:'Score 95+ on daily focus score.', cat:'scores'},
    {id:'score_week',     name:'Perfect Week',       icon:'\u{1F3C6}', desc:'Average 75+ for 7 consecutive check-ins.', cat:'scores'},
    {id:'score_month',    name:'Month of Intent',    icon:'\u{1F4C5}', desc:'Average 75+ across your last 30 check-ins.', cat:'scores'},
    {id:'perfect_month',  name:'Perfect Month',      icon:'\u{1F50A}', desc:'Average 85+ for 30 consecutive check-ins.', cat:'scores'},
    {id:'elite_month',    name:'Elite Consistency',  icon:'\u{1F4DC}', desc:'Log 30+ consecutive days with 80+ score.', cat:'scores'},

    /* XP & Levels */
    {id:'level_5',        name:'Champion',           icon:'\u{1F3C5}', desc:'Reach Level 5.', cat:'xp'},
    {id:'level_10',       name:'Spartan',            icon:'\u{1F981}', desc:'Reach Level 10.', cat:'xp'},
    {id:'level_15',       name:'Titan',              icon:'\u{1F9BF}', desc:'Reach Level 15.', cat:'xp'},
    {id:'level_20',       name:'Immortal',           icon:'\u{1F451}', desc:'Reach Level 20.', cat:'xp'},
    {id:'xp_5000',        name:'5000 XP',            icon:'\u{26A1}', desc:'Accumulate 5,000 total XP.', cat:'xp'},
    {id:'xp_10000',       name:'10,000 XP',          icon:'\u{1F4A5}', desc:'Accumulate 10,000 XP. Unstoppable.', cat:'xp'},
    {id:'xp_20000',       name:'20,000 XP',          icon:'\u{1F525}', desc:'Accumulate 20,000 total XP.', cat:'xp'},
    {id:'level_25',       name:'Godlike',            icon:'\u{1F47F}', desc:'Reach Level 25. Almost there.', cat:'xp'},
    {id:'level_30',       name:'Transcendent',       icon:'\u{1F4AB}', desc:'Reach Level 30. Peak performance.', cat:'xp'},
    {id:'xp_50000',       name:'50,000 XP',          icon:'\u{1F4A9}', desc:'Accumulate 50,000 total XP. Living legend.', cat:'xp'},

    /* Body */
    {id:'first_weight',   name:'Weigh In',           icon:'\u{2696}', desc:'Log your first weight entry.', cat:'body'},
    {id:'weight_10',      name:'10 Weigh-ins',       icon:'\u{1F4C9}', desc:'Log your weight 10 times.', cat:'body'},
    {id:'weight_30',      name:'Scale Discipline',   icon:'\u{1F4C8}', desc:'Log your weight 30 times.', cat:'body'},
    {id:'first_measure',  name:'Measured',           icon:'\u{1F4CF}', desc:'Log your first body measurements.', cat:'body'},
    {id:'bodymetrics_1',  name:'Deep Scan',          icon:'\u{1F9EC}', desc:'Log your first body metrics entry.', cat:'body'},
    {id:'bodymetrics_10', name:'Composition Tracker',icon:'\u{1F52C}', desc:'Log body metrics 10 times.', cat:'body'},
    {id:'weight_50',      name:'50 Weigh-ins',       icon:'\u{1F4CA}', desc:'Log your weight 50 times. That\'s dedication.', cat:'body'},
    {id:'weight_100',     name:'100 Weigh-ins',      icon:'\u{1F4D9}', desc:'Log your weight 100 times. Complete habit.', cat:'body'},

    /* Missions */
    {id:'first_mission',  name:'Mission Possible',   icon:'\u{1F3AF}', desc:'Complete your first mission.', cat:'missions'},
    {id:'full_clear',     name:'Full Clear',         icon:'\u{1F319}', desc:'Complete all missions in a single day.', cat:'missions'},
    {id:'missions_50',    name:'50 Missions',        icon:'\u{1F539}', desc:'Complete 50 total missions.', cat:'missions'},
    {id:'missions_100',   name:'100 Missions',       icon:'\u{2694}', desc:'100 missions completed. A true warrior.', cat:'missions'},
    {id:'missions_250',   name:'250 Missions',       icon:'\u{1F48A}', desc:'250 missions completed. You are unstoppable.', cat:'missions'}
  ];

  var DEFS_MAP = {};
  DEFS.forEach(function(d){ DEFS_MAP[d.id] = d; });

  function getAll(){ return DEFS; }
  function getDef(id){ return DEFS_MAP[id] || null; }

  function check(context){
    var p = TF.Store.getProfile();
    var ms = TF.Store.getMissionStats();
    var wDates = TF.Store.getWorkoutDates();
    var wLog = TF.Store.getWeightLog();
    var measurements = TF.Store.getMeasurements();
    var bodyMetrics = TF.Store.getBodyMetrics ? TF.Store.getBodyMetrics() : [];
    var inputs7 = TF.Store.getLastNInputs(7);
    var inputs30 = TF.Store.getLastNInputs ? TF.Store.getLastNInputs(30) : [];
    var allWorkoutLogs = TF.Store.getAllWorkoutLogs ? TF.Store.getAllWorkoutLogs() : {};
    var allNutrition = TF.Store.getAllNutrition ? TF.Store.getAllNutrition() : {};
    var allHabits = TF.Store.getAllHabits ? TF.Store.getAllHabits() : {};
    var todayHabits = TF.Store.getTodayHabits ? TF.Store.getTodayHabits() : {};
    var customWorkouts = TF.Store.getCustomWorkouts ? TF.Store.getCustomWorkouts() : [];
    var nut = TF.Store.getTodayNutrition();
    var unlocked = [];
    var todayKey = TF.Store.todayKey ? TF.Store.todayKey() : (new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0'));
    var todayWorkout = allWorkoutLogs[todayKey] || null;

    function tryUnlock(id){
      if (TF.Store.unlockAchievement(id)) {
        unlocked.push(id);
        return true;
      }
      return false;
    }

    function hasCompletedWorkout(day){
      if (!day || !day.exercises) {
        return false;
      }
      return Object.keys(day.exercises).some(function(name){
        return (day.exercises[name] || []).some(function(set){
          return set && set.type !== 'warmup' && set.done;
        });
      });
    }

    function calcCarbTarget(){
      var fatTarget = Math.max(40, Math.round((p.bodyWeightKg || 75) * 0.9));
      var carbTarget = Math.round(((p.targetCalories || 0) - ((p.targetProtein || 0) * 4) - (fatTarget * 9)) / 4);
      return Math.max(carbTarget, 50);
    }

    if(p.streakDays >= 1) tryUnlock('first_checkin');
    if(p.streakDays >= 3) tryUnlock('streak_3');
    if(p.streakDays >= 7) tryUnlock('streak_7');
    if(p.streakDays >= 14) tryUnlock('streak_14');
    if(p.streakDays >= 30) tryUnlock('streak_30');
    if(p.streakDays >= 50) tryUnlock('streak_50');
    if(p.streakDays >= 60) tryUnlock('streak_60');
    if(p.streakDays >= 100) tryUnlock('streak_100');

    if(wDates.length >= 1) tryUnlock('first_workout');
    if(wDates.length >= 10) tryUnlock('workouts_10');
    if(wDates.length >= 50) tryUnlock('workouts_50');
    if(wDates.length >= 100) tryUnlock('workouts_100');
    if(wDates.length >= 150) tryUnlock('workouts_150');
    if(wDates.length >= 250) tryUnlock('workouts_250');
    if(wDates.length >= 300) tryUnlock('workouts_300');

    if((nut.calories > 0 || nut.protein > 0)) tryUnlock('first_nutrition');
    if(nut.calories >= p.targetCalories * 0.9 && nut.protein >= p.targetProtein * 0.9) tryUnlock('macro_master');

    if(inputs7.length >= 1) tryUnlock('first_score');
    if(inputs7.length >= 1 && TF.Score.daily(inputs7[0]) >= 88) tryUnlock('score_elite');
    if(inputs7.length >= 1 && TF.Score.daily(inputs7[0]) >= 95) tryUnlock('score_95');
    if(inputs7.length >= 7){
      var avg7 = inputs7.reduce(function(sum, entry){ return sum + TF.Score.daily(entry); }, 0) / inputs7.length;
      if(avg7 >= 75) tryUnlock('score_week');
    }
    if(inputs30.length >= 30){
      var avg30 = inputs30.reduce(function(sum, entry){ return sum + TF.Score.daily(entry); }, 0) / inputs30.length;
      if(avg30 >= 75) tryUnlock('score_month');
      if(avg30 >= 85) tryUnlock('perfect_month');
    }
    if(inputs30.length >= 30){
      var eliteCount = 0;
      for(var ei = 0; ei < inputs30.length; ei++) {
        if(TF.Score.daily(inputs30[ei]) >= 80) eliteCount += 1;
      }
      if(eliteCount >= 30) tryUnlock('elite_month');
    }

    var lvl = TF.Store.getLevel(p);
    if(lvl >= 5) tryUnlock('level_5');
    if(lvl >= 10) tryUnlock('level_10');
    if(lvl >= 15) tryUnlock('level_15');
    if(lvl >= 20) tryUnlock('level_20');
    if(lvl >= 25) tryUnlock('level_25');
    if(lvl >= 30) tryUnlock('level_30');
    if(p.xp >= 5000) tryUnlock('xp_5000');
    if(p.xp >= 10000) tryUnlock('xp_10000');
    if(p.xp >= 20000) tryUnlock('xp_20000');
    if(p.xp >= 50000) tryUnlock('xp_50000');

    if(wLog.length >= 1) tryUnlock('first_weight');
    if(wLog.length >= 10) tryUnlock('weight_10');
    if(wLog.length >= 30) tryUnlock('weight_30');
    if(wLog.length >= 50) tryUnlock('weight_50');
    if(wLog.length >= 100) tryUnlock('weight_100');
    if(measurements.length >= 1) tryUnlock('first_measure');
    if(bodyMetrics.length >= 1) tryUnlock('bodymetrics_1');
    if(bodyMetrics.length >= 10) tryUnlock('bodymetrics_10');

    if(ms.totalCompleted >= 1) tryUnlock('first_mission');
    if(ms.totalCompleted >= 50) tryUnlock('missions_50');
    if(ms.totalCompleted >= 100) tryUnlock('missions_100');
    if(ms.totalCompleted >= 250) tryUnlock('missions_250');
    var todayMs = TF.Store.getTodayMissions();
    if(todayMs.length > 0 && todayMs.every(function(m){ return m.done; })) tryUnlock('full_clear');

    var totalHabitCompletions = 0;
    Object.keys(allHabits).forEach(function(dayKey){
      TF.Config.DefaultHabits.forEach(function(habit){
        if(allHabits[dayKey] && allHabits[dayKey][habit.id]) totalHabitCompletions += 1;
      });
    });
    if(totalHabitCompletions >= 25) tryUnlock('habit_25');
    if(totalHabitCompletions >= 100) tryUnlock('habit_100');
    if(TF.Config.DefaultHabits.length && TF.Config.DefaultHabits.every(function(habit){ return !!todayHabits[habit.id]; })) tryUnlock('all_habits_day');
    var hasTodayWorkout = hasCompletedWorkout(todayWorkout);
    if(TF.Config.DefaultHabits.length && TF.Config.DefaultHabits.every(function(habit){ return !!todayHabits[habit.id]; }) && nut.calories >= p.targetCalories * 0.9 && nut.protein >= p.targetProtein * 0.9 && hasTodayWorkout) tryUnlock('perfect_day');

    if(customWorkouts.length >= 1) tryUnlock('custom_saved_1');
    if(customWorkouts.length >= 5) tryUnlock('custom_saved_5');

    var overloadData = TF.Store.getOverloadData ? TF.Store.getOverloadData() : {};
    var hasAnyPR = Object.keys(overloadData).some(function(key){
      return overloadData[key] && overloadData[key].allRepsHit;
    });
    if(hasAnyPR) tryUnlock('first_pr');

    var proteinStreakDays = 0;
    var macroStreakDays = 0;
    for(var i = 0; i < 7; i += 1){
      var day = new Date();
      day.setDate(day.getDate() - i);
      var key = day.getFullYear() + '-' + String(day.getMonth() + 1).padStart(2, '0') + '-' + String(day.getDate()).padStart(2, '0');
      var log = allNutrition[key];
      if(i === proteinStreakDays && log && log.protein >= p.targetProtein * 0.9) proteinStreakDays += 1;
      if(i === macroStreakDays && log && log.calories >= p.targetCalories * 0.9 && log.protein >= p.targetProtein * 0.9) macroStreakDays += 1;
    }
    if(proteinStreakDays >= 7) tryUnlock('protein_7');
    if(macroStreakDays >= 7) tryUnlock('macro_master_7');
    var proteinTargetDays = Object.keys(allNutrition).reduce(function(total, key){
      var log = allNutrition[key];
      return total + (log && log.protein >= p.targetProtein * 0.9 ? 1 : 0);
    }, 0);
    if(proteinTargetDays >= 20) tryUnlock('protein_20');
    var carbTarget = calcCarbTarget();
    var carbsTargetDays = Object.keys(allNutrition).reduce(function(total, key){
      var log = allNutrition[key];
      return total + (log && log.carbs >= carbTarget * 0.9 && log.protein >= p.targetProtein * 0.9 ? 1 : 0);
    }, 0);
    if(carbsTargetDays >= 5) tryUnlock('carbs_master');

    var totalVolume = 0;
    var totalWarmups = 0;
    var totalRpeLogged = 0;
    var notesSessions = 0;
    var customSessions = 0;
    Object.keys(allWorkoutLogs).forEach(function(dateKey){
      var day = allWorkoutLogs[dateKey];
      if(String(day.notes || '').trim()) notesSessions += 1;
      if(day.sourceType === 'custom') customSessions += 1;
      Object.keys(day.exercises || {}).forEach(function(name){
        (day.exercises[name] || []).forEach(function(set){
          if(set.type === 'warmup'){
            totalWarmups += 1;
            return;
          }
          if(set.done && set.weight && set.reps){
            totalVolume += (parseFloat(set.weight) || 0) * (parseInt(set.reps, 10) || 0);
          }
          if(set.done && set.rpe){
            totalRpeLogged += 1;
          }
        });
      });
    });
    if(totalWarmups >= 25) tryUnlock('warmup_25');
    if(totalRpeLogged >= 100) tryUnlock('rpe_100');
    if(totalRpeLogged >= 250) tryUnlock('rpe_250');
    if(notesSessions >= 10) tryUnlock('notes_10');
    if(totalVolume >= 10000) tryUnlock('volume_10000');
    if(totalVolume >= 50000) tryUnlock('volume_50000');
    if(totalVolume >= 100000) tryUnlock('volume_100000');
    if(customSessions >= 1) tryUnlock('custom_session');
    var workoutDays7 = 0;
    for(var wi = 0; wi < 7; wi += 1){
      var wday = new Date();
      wday.setDate(wday.getDate() - wi);
      var wkey = wday.getFullYear() + '-' + String(wday.getMonth() + 1).padStart(2, '0') + '-' + String(wday.getDate()).padStart(2, '0');
      if(allWorkoutLogs[wkey]) workoutDays7 += 1;
    }
    if(workoutDays7 >= 7) tryUnlock('workout_streak_7');

    var searchAdds = Object.keys(allNutrition).reduce(function(sum, key){
      return sum + (allNutrition[key] && allNutrition[key].searchAdds || 0);
    }, 0);
    if(searchAdds >= 25) tryUnlock('food_search_25');
    if(searchAdds >= 50) tryUnlock('food_search_50');

    return unlocked;
  }

  return { getAll:getAll, getDef:getDef, check:check };
})();
