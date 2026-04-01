/* ================================================================
   PROGRESSIVE OVERLOAD ENGINE v2
   Tracks best performance per exercise and suggests weight increments.
   Rule: if user completes all target reps across all sets → add 2.5kg
   Compound lifts: +2.5kg | Isolation: +1.25kg
   ================================================================ */
TF.Overload = (function(){
  'use strict';

  /* Classify compound vs isolation */
  var COMPOUND = ['Bench Press','Overhead Press','Deadlift','Back Squat','Barbell Row','DB Bench Press',
    'DB Shoulder Press','DB Romanian DL','Goblet Squat','Weighted Pull-ups','DB Row (each side)','Romanian Deadlift'];

  function isCompound(name){ return COMPOUND.indexOf(name)>=0; }
  function increment(name){ return isCompound(name)?TF.Config.OverloadKg.compound:TF.Config.OverloadKg.isolation; }

  /* Round to nearest 0.25kg */
  function roundWeight(w){ return Math.round(w*4)/4; }

  /* ── Process completed sets for an exercise ── */
  function processSession(exName, targetReps, completedSets){
    // completedSets: [{weight, reps, done}]
    var doneSets=completedSets.filter(function(s){return s.done;});
    if(!doneSets.length)return;

    // Parse target reps (could be "6-8" or "Max" or "12")
    var minTarget=parseInt(targetReps)||6;

    // Did user hit minimum reps on every completed set?
    var allRepsHit=doneSets.every(function(s){
      var r=parseInt(s.reps)||0;
      return r>=minTarget;
    });

    // Best weight used (max across all done sets)
    var bestWeight=Math.max.apply(null,doneSets.map(function(s){return parseFloat(s.weight)||0;}));
    if(!bestWeight)return;

    var prev=TF.Store.getOverloadEntry(exName);
    var entry={
      lastWeight:bestWeight,
      lastReps:doneSets.map(function(s){return parseInt(s.reps)||0;}),
      lastDate:TF.Store.todayKey(),
      allRepsHit:allRepsHit,
      suggestion:null
    };

    if(allRepsHit){
      entry.suggestion=roundWeight(bestWeight+increment(exName));
    } else if(prev){
      // Deload: if failed to hit reps, suggest same weight
      entry.suggestion=bestWeight;
    }

    TF.Store.saveOverloadEntry(exName,entry);
  }

  /* ── Get suggestion for an exercise ── */
  function getSuggestion(exName){
    var entry=TF.Store.getOverloadEntry(exName);
    if(!entry)return null;
    return{
      weight:entry.suggestion||entry.lastWeight,
      lastWeight:entry.lastWeight,
      lastDate:entry.lastDate,
      allRepsHit:entry.allRepsHit,
      isIncrease:entry.allRepsHit&&entry.suggestion>entry.lastWeight
    };
  }

  /* ── Format suggestion text ── */
  function getSuggestionText(exName){
    var s=getSuggestion(exName);
    if(!s)return null;
    if(s.isIncrease)return '↑ '+s.weight+'kg (was '+s.lastWeight+'kg — all reps hit '+s.lastDate+')';
    if(s.weight===s.lastWeight)return '→ '+s.weight+'kg (missed reps last session)';
    return s.weight+'kg (from '+s.lastDate+')';
  }

  return{processSession:processSession,getSuggestion:getSuggestion,getSuggestionText:getSuggestionText};
})();
