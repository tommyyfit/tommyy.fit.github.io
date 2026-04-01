/* ================================================================
   ACHIEVEMENTS ENGINE v2 — 30 achievements
   ================================================================ */
TF.Achievements = (function(){
  'use strict';

  var DEFS = [
    /* Consistency */
    {id:'first_checkin',  name:'First Blood',       icon:'🩸', desc:'Log your first daily check-in.',                  cat:'consistency'},
    {id:'streak_3',       name:'3-Day Warrior',     icon:'🔥', desc:'Maintain a 3-day streak.',                        cat:'consistency'},
    {id:'streak_7',       name:'Week of Fire',       icon:'⚔️', desc:'7-day streak without breaking.',                  cat:'consistency'},
    {id:'streak_14',      name:'Iron Fortnight',    icon:'🛡️', desc:'14 consecutive days logged.',                     cat:'consistency'},
    {id:'streak_30',      name:'30-Day Spartan',    icon:'🏛️', desc:'30-day streak. Few reach this.',                  cat:'consistency'},
    {id:'streak_100',     name:'100-Day Legend',    icon:'💎', desc:'100 days straight. You are the 1%.',              cat:'consistency'},

    /* Training */
    {id:'first_workout',  name:'First Rep',          icon:'💪', desc:'Complete your first workout session.',            cat:'training'},
    {id:'workouts_10',    name:'10 Sessions',        icon:'🏋️', desc:'Log 10 workout sessions.',                       cat:'training'},
    {id:'workouts_50',    name:'50 Sessions',        icon:'⚡', desc:'50 workouts completed.',                          cat:'training'},
    {id:'workouts_100',   name:'Century',            icon:'🎖️', desc:'100 workouts. This is who you are now.',          cat:'training'},
    {id:'first_pr',       name:'New Record',         icon:'📈', desc:'Hit a progressive overload suggestion.',          cat:'training'},
    {id:'full_workout',   name:'Full Execution',     icon:'✅', desc:'Mark every exercise done in a session.',          cat:'training'},

    /* Nutrition */
    {id:'first_nutrition',name:'First Fuel',         icon:'🍽️', desc:'Log nutrition for the first time.',              cat:'nutrition'},
    {id:'protein_7',      name:'Protein King',       icon:'🥩', desc:'Hit protein target 7 days in a row.',            cat:'nutrition'},
    {id:'water_3L',       name:'Hydrated',           icon:'💧', desc:'Log 3L+ water in a single day.',                 cat:'nutrition'},
    {id:'macro_master',   name:'Macro Master',       icon:'🎯', desc:'Hit calories AND protein target on the same day.',cat:'nutrition'},

    /* Scores */
    {id:'first_score',    name:'First Score',        icon:'📊', desc:'Complete a check-in and see your focus score.',  cat:'scores'},
    {id:'score_elite',    name:'Elite Day',          icon:'🌟', desc:'Score 88+ on daily focus score.',                cat:'scores'},
    {id:'score_week',     name:'Perfect Week',       icon:'🏆', desc:'Average 75+ for 7 consecutive check-ins.',       cat:'scores'},

    /* XP & Levels */
    {id:'level_5',        name:'Champion',           icon:'🏅', desc:'Reach Level 5.',                                  cat:'xp'},
    {id:'level_10',       name:'Spartan',            icon:'🦁', desc:'Reach Level 10.',                                 cat:'xp'},
    {id:'xp_5000',        name:'5000 XP',            icon:'⚡', desc:'Accumulate 5,000 total XP.',                     cat:'xp'},
    {id:'xp_10000',       name:'10,000 XP',          icon:'💥', desc:'Accumulate 10,000 XP. Unstoppable.',             cat:'xp'},

    /* Body */
    {id:'first_weight',   name:'Weigh In',           icon:'⚖️', desc:'Log your first weight entry.',                   cat:'body'},
    {id:'weight_10',      name:'10 Weigh-ins',       icon:'📉', desc:'Log your weight 10 times.',                      cat:'body'},
    {id:'first_measure',  name:'Measured',           icon:'📏', desc:'Log your first body measurements.',              cat:'body'},

    /* Missions */
    {id:'first_mission',  name:'Mission Possible',   icon:'🎯', desc:'Complete your first mission.',                    cat:'missions'},
    {id:'full_clear',     name:'Full Clear',         icon:'🌙', desc:'Complete ALL missions in a single day.',          cat:'missions'},
    {id:'missions_50',    name:'50 Missions',        icon:'🔱', desc:'Complete 50 total missions.',                     cat:'missions'},
    {id:'missions_100',   name:'100 Missions',       icon:'⚔️', desc:'100 missions completed. A true warrior.',        cat:'missions'}
  ];

  var DEFS_MAP = {};
  DEFS.forEach(function(d){ DEFS_MAP[d.id]=d; });

  function getAll(){ return DEFS; }
  function getDef(id){ return DEFS_MAP[id]||null; }

  /* ── Check and unlock relevant achievements after an action ── */
  function check(context){
    // context: { type: 'checkin'|'mission'|'workout'|'nutrition'|'weight'|'measurement' }
    var p=TF.Store.getProfile();
    var ms=TF.Store.getMissionStats();
    var wDates=TF.Store.getWorkoutDates();
    var wLog=TF.Store.getWeightLog();
    var measurements=TF.Store.getMeasurements();
    var inputs=TF.Store.getLastNInputs(7);
    var unlocked=[];

    function tryUnlock(id){
      if(TF.Store.unlockAchievement(id)){
        unlocked.push(id); return true;
      }
      return false;
    }

    /* Streaks */
    if(p.streakDays>=1) tryUnlock('first_checkin');
    if(p.streakDays>=3) tryUnlock('streak_3');
    if(p.streakDays>=7) tryUnlock('streak_7');
    if(p.streakDays>=14)tryUnlock('streak_14');
    if(p.streakDays>=30)tryUnlock('streak_30');
    if(p.streakDays>=100)tryUnlock('streak_100');

    /* Training */
    if(wDates.length>=1) tryUnlock('first_workout');
    if(wDates.length>=10)tryUnlock('workouts_10');
    if(wDates.length>=50)tryUnlock('workouts_50');
    if(wDates.length>=100)tryUnlock('workouts_100');

    /* Nutrition */
    var nut=TF.Store.getTodayNutrition();
    if((nut.calories>0||nut.protein>0))tryUnlock('first_nutrition');
    if(nut.water>=3)tryUnlock('water_3L');
    if(nut.calories>=p.targetCalories*0.9&&nut.protein>=p.targetProtein*0.9)tryUnlock('macro_master');

    /* Scores */
    if(inputs.length>=1)tryUnlock('first_score');
    if(inputs.length>=1&&TF.Score.daily(inputs[0])>=88)tryUnlock('score_elite');
    if(inputs.length>=7){
      var avg7=inputs.reduce(function(s,i){return s+TF.Score.daily(i);},0)/7;
      if(avg7>=75)tryUnlock('score_week');
    }

    /* XP / levels */
    var lvl=TF.Store.getLevel(p);
    if(lvl>=5)tryUnlock('level_5');
    if(lvl>=10)tryUnlock('level_10');
    if(p.xp>=5000)tryUnlock('xp_5000');
    if(p.xp>=10000)tryUnlock('xp_10000');

    /* Body */
    if(wLog.length>=1)tryUnlock('first_weight');
    if(wLog.length>=10)tryUnlock('weight_10');
    if(measurements.length>=1)tryUnlock('first_measure');

    /* Missions */
    if(ms.totalCompleted>=1)tryUnlock('first_mission');
    if(ms.totalCompleted>=50)tryUnlock('missions_50');
    if(ms.totalCompleted>=100)tryUnlock('missions_100');
    var todayMs=TF.Store.getTodayMissions();
    if(todayMs.length>0&&todayMs.every(function(m){return m.done;}))tryUnlock('full_clear');

    /* Overload PR */
    var overloadData=TF.Store.getOverloadEntry&&Object.keys(TF.Store.getOverloadData?TF.Store.getOverloadData():{});
    // Check via a simple flag in overload data — if any entry has allRepsHit=true
    return unlocked;
  }

  return{getAll:getAll,getDef:getDef,check:check};
})();

/* Patch store to expose overload data getter */
if(TF.Store&&!TF.Store.getOverloadData){
  TF.Store.getOverloadData=function(){
    try{return JSON.parse(localStorage.getItem('tf_overload')||'{}');}catch(e){return{};}
  };
}
