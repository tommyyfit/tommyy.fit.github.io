/* ================================================================
   HABITS ENGINE v4 — tommyy.fit
   Per-habit streaks, XP bonuses, weekly completion rates
   ================================================================ */
TF.Habits = (function(){
  'use strict';

  function getAll(){ return TF.Config.DefaultHabits; }

  function getTodayStatus(){
    var today = TF.Store.getTodayHabits();
    return TF.Config.DefaultHabits.map(function(h){
      return Object.assign({}, h, { done: !!today[h.id], streak: TF.Store.getHabitStreak(h.id) });
    });
  }

  function getDoneCount(){
    var today = TF.Store.getTodayHabits();
    return Object.values(today).filter(Boolean).length;
  }

  function getWeeklyRate(id){
    var all = TF.Store.getAllHabits();
    var days = [];
    for(var i=6;i>=0;i--){
      var d = new Date(); d.setDate(d.getDate()-i);
      var k = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
      if(all[k]) days.push(all[k][id]?1:0);
    }
    if(!days.length)return 0;
    return Math.round(days.reduce(function(s,v){return s+v;},0)/days.length*100);
  }

  /* Get 7-day grid for a habit: [{key,done}] */
  function getWeekGrid(id){
    var all = TF.Store.getAllHabits();
    var result = [];
    for(var i=6;i>=0;i--){
      var d = new Date(); d.setDate(d.getDate()-i);
      var k = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
      result.push({ key:k, done: !!(all[k]&&all[k][id]) });
    }
    return result;
  }

  /* Weekly XP from habits */
  function getWeeklyHabitXP(){
    var all = TF.Store.getAllHabits();
    var total = 0;
    for(var i=6;i>=0;i--){
      var d = new Date(); d.setDate(d.getDate()-i);
      var k = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
      if(all[k]){
        TF.Config.DefaultHabits.forEach(function(h){
          if(all[k][h.id]) total+=h.xp;
        });
      }
    }
    return total;
  }

  return { getAll:getAll, getTodayStatus:getTodayStatus, getDoneCount:getDoneCount, getWeeklyRate:getWeeklyRate, getWeekGrid:getWeekGrid, getWeeklyHabitXP:getWeeklyHabitXP };
})();
