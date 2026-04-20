TF.Missions=(function(){
  'use strict';

  var _uid=Date.now();
  function uid(){return 'm_'+(++_uid);}
  function pick(arr){return arr[Math.floor(Math.random()*arr.length)];}

  var TYPES={
    workout:{label:'WORKOUT',cls:'chip-lime'},
    nutrition:{label:'NUTRITION',cls:'chip-blue'},
    habit:{label:'HABIT',cls:'chip-amber'},
    activity:{label:'ACTIVITY',cls:'chip-purple'},
    mindset:{label:'MINDSET',cls:'chip-teal'}
  };

  var POOL={
    workout_high:[
      {title:'Own the main lift',desc:'Complete today\'s workout and make the first compound lift your focus. Warm up well, then finish the last working set with 1-2 reps in reserve.',xp:105},
      {title:'Performance set',desc:'Pick one key exercise and beat the logbook by one clean rep, better tempo, or a small weight jump. No sloppy PR hunting.',xp:115},
      {title:'Full session clear',desc:'Finish every programmed working set today. If form breaks, lower the load and keep the standard high.',xp:100}
    ],
    workout_moderate:[
      {title:'Quality volume',desc:'Complete the workout at controlled intensity. Smooth reps, full range, and no ego sets today.',xp:80},
      {title:'Tempo discipline',desc:'Use a 3-second lower on the first two exercises. Better control turns moderate days into growth days.',xp:75},
      {title:'Leave two reps',desc:'Train today, but stop every final set with about two reps left. Build momentum without draining tomorrow.',xp:70}
    ],
    workout_low:[
      {title:'Recovery session',desc:'Do the recovery workout or a 20-minute easy walk. The win today is restoring readiness, not proving toughness.',xp:45},
      {title:'Mobility reset',desc:'Spend 20 minutes on hips, thoracic spine, shoulders, and easy breathing. Keep it gentle and deliberate.',xp:45},
      {title:'Minimum viable training',desc:'Complete the first 2-3 movements only. Clean reps, low stress, then get out before fatigue wins.',xp:50}
    ],
    workout_comeback:[
      {title:'Comeback session',desc:'You have been away from logged workouts. Do the return session at 70% effort and leave the gym feeling better than when you entered.',xp:90},
      {title:'Restart the chain',desc:'No PRs today. Complete a light full-body session or recovery flow and rebuild the training rhythm.',xp:80},
      {title:'First brick back',desc:'Finish 25-35 minutes of easy training. The mission is showing up again, not making up for missed time.',xp:85}
    ],
    nutrition_protein:[
      {title:'Protein anchor',desc:'Hit at least 40g protein in your next meal. Anchor the day before snacks and cravings start negotiating.',xp:55},
      {title:'Protein checkpoint',desc:'Get to 70% of your protein target before dinner. Late-night protein panic is not a strategy.',xp:60},
      {title:'Lean protein first',desc:'Build one meal around a lean protein source, then add carbs and fats around it. Order matters.',xp:50}
    ],
    nutrition_calories:[
      {title:'Calorie guardrails',desc:'Log food before eating it for the next two meals. Decisions are cleaner before hunger gets a vote.',xp:55},
      {title:'Controlled dinner',desc:'Keep dinner simple: protein, plants, and one measured carb or fat source. No mystery calories.',xp:55},
      {title:'Macro audit',desc:'Open nutrition and check calories, protein, carbs, and fats. Adjust the next meal based on the numbers.',xp:50},
      {title:'No liquid calories',desc:'Keep drinks calorie-free today unless they are part of a planned protein shake. Save calories for food.',xp:45}
    ],
    habit_sleep:[
      {title:'Sleep protection',desc:'Set a hard screen cutoff 45 minutes before bed. Tomorrow\'s recovery score starts tonight.',xp:55},
      {title:'Bedroom reset',desc:'Cool room, dark room, phone away from the bed. Make sleep easy before willpower runs out.',xp:50}
    ],
    habit_morning:[
      {title:'No-phone morning',desc:'First 30 minutes after waking: no scrolling. Light, movement, and one clear priority before inputs.',xp:50},
      {title:'Morning sunlight',desc:'Get 10 minutes of outdoor light within 60 minutes of waking. Set the rhythm before the day gets loud.',xp:45}
    ],
    habit_standard:[
      {title:'Deep work block',desc:'One uninterrupted 60-90 minute block. Phone away, one target, finish something real.',xp:60},
      {title:'Environment clean-up',desc:'Reset one space that affects your discipline: desk, kitchen, gym bag, or bedroom. Friction down, standards up.',xp:45},
      {title:'Evening shutdown',desc:'Write tomorrow\'s first task, prep one useful thing, then shut the day down without doom-scrolling.',xp:50}
    ],
    activity_high:[
      {title:'10k step pressure',desc:'Hit 10,000 steps today. Park further, take stairs, and turn dead time into movement.',xp:40},
      {title:'Post-meal walk',desc:'Walk 10 minutes after two meals. Low drama, high return for energy and digestion.',xp:40}
    ],
    activity_low:[
      {title:'6k recovery steps',desc:'Hit 6,000 easy steps. Keep the pace conversational and let the body recover.',xp:30},
      {title:'Nasal walk',desc:'Take a 15-minute walk breathing only through your nose. If you cannot, slow down.',xp:35}
    ],
    mindset_stress:[
      {title:'Downshift now',desc:'Do 10 rounds of box breathing: 4 in, 4 hold, 4 out, 4 hold. Bring the nervous system back online.',xp:45},
      {title:'Stress inventory',desc:'Write the top 3 stressors and one controllable action for each. If it is not controllable, stop feeding it attention.',xp:45}
    ],
    mindset_focus:[
      {title:'Single target',desc:'Choose one non-negotiable task for the next hour. No tabs, no switching, no fake productivity.',xp:45},
      {title:'Execution sentence',desc:'Write one sentence: "Today I will win by..." Then do that thing before comfort gets clever.',xp:35}
    ],
    mindset_standard:[
      {title:'Identity rep',desc:'Write one sentence about the person you are becoming, then complete one action that proves it.',xp:35},
      {title:'Gratitude plus action',desc:'Write 3 genuine gratitudes and one action you will take because you still get to try today.',xp:35},
      {title:'Five-minute visualisation',desc:'Close your eyes and rehearse today\'s hardest moment going well. Then make the first move.',xp:35}
    ]
  };

  function make(type,t){
    return {id:uid(),type:type,title:t.title,desc:t.desc,xpReward:t.xp,done:false};
  }

  function isValidMissionList(missions){
    return Array.isArray(missions) && missions.length >= 5 && missions.every(function(mission){
      return mission && mission.id && mission.type && mission.title && mission.desc && isFinite(mission.xpReward);
    });
  }

  function recentTitles(){
    var all=TF.Store.getAllMissions?TF.Store.getAllMissions():{};
    var titles={};
    Object.keys(all||{}).sort().reverse().slice(0,5).forEach(function(key){
      (all[key]||[]).forEach(function(mission){
        if(mission&&mission.title) titles[mission.title]=true;
      });
    });
    return titles;
  }

  function pickFresh(pool,recent){
    var fresh=(pool||[]).filter(function(item){return !recent[item.title];});
    return pick(fresh.length?fresh:pool);
  }

  function completedWorkoutDaysAgo(){
    if(!TF.Store.getAllWorkoutLogs||!TF.Store.todayKey) return null;
    var today=TF.Store.todayKey();
    var logs=TF.Store.getAllWorkoutLogs();
    var keys=Object.keys(logs||{}).filter(function(key){return key<today;}).sort().reverse();
    function parse(key){
      var parts=String(key||'').split('-').map(function(part){return parseInt(part,10);});
      return parts.length===3?Date.UTC(parts[0],parts[1]-1,parts[2]):null;
    }
    function hasWork(day){
      if(!day) return false;
      if(day.finishedAt) return true;
      return Object.keys(day.exercises||{}).some(function(name){
        return (day.exercises[name]||[]).some(function(set){return set&&set.done&&set.type!=='warmup';});
      });
    }
    for(var i=0;i<keys.length;i+=1){
      if(hasWork(logs[keys[i]])){
        return Math.max(0,Math.round((parse(today)-parse(keys[i]))/86400000));
      }
    }
    return null;
  }

  function generate(profile,input){
    profile=profile||TF.Store.getProfile();
    input=input||TF.Store.getTodayInput();
    var nutrition=TF.Store.getTodayNutrition?TF.Store.getTodayNutrition():{};
    var habits=TF.Store.getTodayHabits?TF.Store.getTodayHabits():{};
    var recent=recentTitles();
    var recovery=input?TF.Score.recovery(input):65;
    var stress=input?input.stress:5;
    var sleep=input?input.sleepQuality:7;
    var focus=input?input.focus:7;
    var daysAgo=completedWorkoutDaysAgo();
    var out=[];
    var workoutPool=daysAgo!==null&&daysAgo>=7?POOL.workout_comeback:(recovery>=70?POOL.workout_high:recovery>=48?POOL.workout_moderate:POOL.workout_low);
    var nutritionPool;
    var habitPool;
    var activityPool=recovery>=55?POOL.activity_high:POOL.activity_low;
    var mindsetPool=stress>=7?POOL.mindset_stress:focus<=5?POOL.mindset_focus:POOL.mindset_standard;

    if((nutrition.protein||0)<(profile.targetProtein||150)*0.55){
      nutritionPool=POOL.nutrition_protein;
    }else if((nutrition.calories||0)>(profile.targetCalories||2400)*0.78){
      nutritionPool=POOL.nutrition_calories;
    }else{
      nutritionPool=POOL.nutrition_calories;
    }

    if(sleep<=5){
      habitPool=POOL.habit_sleep;
    }else if(!habits.no_phone_morning&&!habits.sunlight){
      habitPool=POOL.habit_morning;
    }else{
      habitPool=POOL.habit_standard;
    }

    out.push(make('workout',pickFresh(workoutPool,recent)));
    out.push(make('nutrition',pickFresh(nutritionPool,recent)));
    out.push(make('habit',pickFresh(habitPool,recent)));
    out.push(make('activity',pickFresh(activityPool,recent)));
    out.push(make('mindset',pickFresh(mindsetPool,recent)));
    return out;
  }

  function ensureToday(profile,input){
    var existing=TF.Store.getTodayMissions();
    var missions;
    if(isValidMissionList(existing)) return existing;
    if(!input) return Array.isArray(existing)?existing:[];
    missions=generate(profile||TF.Store.getProfile(),input);
    TF.Store.saveTodayMissions(missions);
    return missions;
  }

  return {generate:generate,ensureToday:ensureToday,isValidMissionList:isValidMissionList,TYPES:TYPES};
})();
