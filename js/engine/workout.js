TF.Workout=(function(){
  'use strict';
  var LIB={
    push:[
      {name:'Bench Press',sets:4,reps:'5–6',rest:'3 min',note:'Drive feet into floor. Full arch. Bar touches sternum.',restSeconds:180},
      {name:'Overhead Press',sets:3,reps:'6–8',rest:'2 min',note:'Brace hard. Elbows slightly forward. Full lockout.',restSeconds:120},
      {name:'Incline DB Press',sets:3,reps:'8–10',rest:'90 sec',note:'30° incline. Deep stretch at bottom. Control negative.',restSeconds:90},
      {name:'Tricep Pushdown',sets:3,reps:'12–15',rest:'60 sec',note:'Lock elbows at sides. Squeeze hard at bottom.',restSeconds:60},
      {name:'Lateral Raises',sets:4,reps:'15–20',rest:'45 sec',note:'Lead with elbows. No swinging. 2s hold at top.',restSeconds:45}
    ],
    pull:[
      {name:'Deadlift',sets:4,reps:'4–5',rest:'3 min',note:'Bar over mid-foot. Brace before pulling. Hips rise with shoulders.',restSeconds:180},
      {name:'Weighted Pull-ups',sets:4,reps:'Max',rest:'2 min',note:'Full dead-hang to chin over bar. No kipping.',restSeconds:120},
      {name:'Barbell Row',sets:3,reps:'6–8',rest:'2 min',note:'45° hinge. Row to lower chest. Squeeze lats at top.',restSeconds:120},
      {name:'Face Pulls',sets:3,reps:'15–20',rest:'60 sec',note:'High anchor. External rotation at end range.',restSeconds:60},
      {name:'Hammer Curl',sets:3,reps:'10–12',rest:'60 sec',note:'Neutral grip. No elbow drift. 3s negative.',restSeconds:60}
    ],
    legs:[
      {name:'Back Squat',sets:4,reps:'5–6',rest:'3 min',note:'Below parallel. Knees track toes. Brace thorax.',restSeconds:180},
      {name:'Romanian Deadlift',sets:3,reps:'8–10',rest:'2 min',note:'Hip hinge. Stretch hamstrings at bottom. Neutral spine.',restSeconds:120},
      {name:'Leg Press',sets:3,reps:'10–12',rest:'90 sec',note:'Shoulder-width. Full depth — no quarter reps.',restSeconds:90},
      {name:'Leg Curl',sets:3,reps:'10–12',rest:'60 sec',note:'Hamstrings only. No momentum. Pause at full contraction.',restSeconds:60},
      {name:'Calf Raises',sets:4,reps:'15–20',rest:'30 sec',note:'Full stretch at bottom. 2s pause at top.',restSeconds:30}
    ],
    push_min:[
      {name:'DB Bench Press',sets:4,reps:'8–10',rest:'90 sec',note:'Deeper stretch than barbell. Control every inch.',restSeconds:90},
      {name:'DB Shoulder Press',sets:3,reps:'8–10',rest:'90 sec',note:'Seated or standing. Full lockout overhead.',restSeconds:90},
      {name:'DB Incline Press',sets:3,reps:'10–12',rest:'90 sec',note:'Use a chair or surface angled 30°.',restSeconds:90},
      {name:'DB Lateral Raise',sets:3,reps:'15',rest:'45 sec',note:'Slight elbow bend. Lead with elbows wide.',restSeconds:45},
      {name:'DB Tricep Ext.',sets:3,reps:'12–15',rest:'60 sec',note:'Overhead. Both hands on one DB. Full ROM.',restSeconds:60}
    ],
    pull_min:[
      {name:'DB Row (each side)',sets:4,reps:'8–10',rest:'90 sec',note:'Brace on bench. Row to hip. Slow negative.',restSeconds:90},
      {name:'Pull-ups / Rows',sets:4,reps:'Max',rest:'2 min',note:'Pull-ups preferred. Ring rows if no bar.',restSeconds:120},
      {name:'DB Rear Delt Fly',sets:3,reps:'15',rest:'45 sec',note:'45° hinge. Lead elbows wide and back.',restSeconds:45},
      {name:'DB Shrug',sets:3,reps:'15',rest:'45 sec',note:'Heavy. Straight up. 2s pause at peak.',restSeconds:45},
      {name:'DB Curl',sets:3,reps:'10–12',rest:'60 sec',note:'Supinate at top. 3s negative. No swinging.',restSeconds:60}
    ],
    legs_min:[
      {name:'Goblet Squat',sets:4,reps:'10–12',rest:'90 sec',note:'Elbow between knees at depth. Upright torso.',restSeconds:90},
      {name:'DB Romanian DL',sets:3,reps:'10–12',rest:'90 sec',note:'Two DBs. Hip hinge. Keep back neutral.',restSeconds:90},
      {name:'DB Split Squat',sets:3,reps:'10 ea',rest:'90 sec',note:'Rear foot elevated. Front shin stays vertical.',restSeconds:90},
      {name:'DB Hip Thrust',sets:3,reps:'15',rest:'60 sec',note:'Shoulders on bench. DB on hips. Squeeze at lockout.',restSeconds:60},
      {name:'Calf Raises',sets:4,reps:'20',rest:'30 sec',note:'Hold DB or bodyweight. Full ROM every rep.',restSeconds:30}
    ],
    bodyweight:[
      {name:'Push-ups',sets:4,reps:'Max',rest:'90 sec',note:'Full lockout top. Chest to floor. Elbows 45°.',restSeconds:90},
      {name:'Pike Push-ups',sets:3,reps:'10–12',rest:'60 sec',note:'Hips high. Vertical torso mimics OHP.',restSeconds:60},
      {name:'Bulgarian Squat',sets:3,reps:'10 ea',rest:'90 sec',note:'Rear foot on chair. Upright torso.',restSeconds:90},
      {name:'Glute Bridge',sets:3,reps:'20',rest:'60 sec',note:'Feet flat. Drive hips up. 2s squeeze at top.',restSeconds:60},
      {name:'Plank',sets:3,reps:'60 sec',rest:'45 sec',note:'Neutral hips. Squeeze everything. Breathe slowly.',restSeconds:45},
      {name:'Dips (2 chairs)',sets:3,reps:'Max',rest:'90 sec',note:'Two sturdy chairs. Elbows back, not flared.',restSeconds:90}
    ],
    recovery:[
      {name:'Hip Flexor Stretch',sets:2,reps:'60s ea',rest:'20 sec',note:'Deep lunge or 90/90. Breathe into the stretch.',restSeconds:20},
      {name:'Cat-Cow',sets:2,reps:'12 reps',rest:'20 sec',note:'Breathe in on arch, breathe out on round.',restSeconds:20},
      {name:"World's Greatest",sets:2,reps:'5 ea',rest:'30 sec',note:'Elbow to ground → rotate skyward. Slow.',restSeconds:30},
      {name:'Thoracic Rotation',sets:2,reps:'10 ea',rest:'30 sec',note:'Open rib cage not lower back. Exhale into rotation.',restSeconds:30},
      {name:'Box Breathing',sets:1,reps:'10 cycles',rest:'0',note:'4s in → 4s hold → 4s out → 4s hold. Eyes closed.',restSeconds:0}
    ]
  };
  var FOCUS_LABELS={push:'Push Day — chest, shoulders, triceps',pull:'Pull Day — back, biceps, rear delts',legs:'Legs Day — quads, hamstrings, glutes',bodyweight:'Bodyweight Full-Body',recovery:'Active Recovery — mobility & breath'};
  var MOTIVATIONAL={push:'The bench doesn\'t care about your mood. Get under it.',pull:'The muscles you can\'t see in the mirror build the foundation of everything.',legs:'Everyone skips legs. That\'s exactly why legs are your edge.',bodyweight:'No equipment. No excuse. Gravity is always available.',recovery:'Recovery is training. Muscle is built while you rest — not while you grind.'};
  var IMAGES={push:TF.Config.Images.push,pull:TF.Config.Images.pull,legs:TF.Config.Images.legs,bodyweight:TF.Config.Images.workoutHero,recovery:TF.Config.Images.mindset};
  function selectPool(split,equipment){if(equipment==='none')return LIB.bodyweight;if(equipment==='minimal')return LIB[split+'_min']||LIB.bodyweight;return LIB[split]||LIB.bodyweight;}
  function intensityLabel(r){if(r>=75)return'High — push to 1–2 reps shy of failure on the last working set.';if(r>=55)return'Moderate — controlled reps, prioritise form and mind-muscle connection.';return'Low — 3+ reps in reserve every set. No grinding. Form is king today.';}
  function build(title,focus,splitKey,exercises,r,minutes){return{title:title,focus:focus,splitKey:splitKey,exercises:exercises,estimatedMinutes:minutes,intensity:intensityLabel(r),recoveryScore:r,volumeNote:r<50?'⚡ Volume auto-reduced — recovery score is low.':null,motivational:MOTIVATIONAL[splitKey]||'Show up. Execute. Repeat.',image:IMAGES[splitKey]||TF.Config.Images.workoutHero};}
  function getToday(profile,input){
    var r=input?TF.Score.recovery(input):68;
    if(r<32)return build('Active Recovery',FOCUS_LABELS.recovery,'recovery',LIB.recovery,r,20);
    var day=new Date().getDay(),split=TF.Config.PPLSchedule[day];
    if(!split){if(r<58)return build('Rest Day','Scheduled rest — recovery focus','recovery',LIB.recovery.slice(0,3),r,15);return build('Bonus Session',FOCUS_LABELS.bodyweight,'bodyweight',LIB.bodyweight,r,30);}
    var pool=selectPool(split,profile.equipment),exercises=r<50?pool.slice(0,3):pool;
    var titles={push:'Push Day',pull:'Pull Day',legs:'Legs Day'};
    return build(titles[split],FOCUS_LABELS[split],split,exercises,r,profile.availableMinutes);
  }
  return{getToday:getToday,LIB:LIB};
})();
