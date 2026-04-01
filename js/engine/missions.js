TF.Missions=(function(){
  'use strict';
  var _uid=Date.now();
  function uid(){return 'm_'+(++_uid);}
  function pick(arr){return arr[Math.floor(Math.random()*arr.length)];}
  var TYPES={
    workout:{label:'WORKOUT',cls:'chip-lime'},nutrition:{label:'NUTRITION',cls:'chip-blue'},
    habit:{label:'HABIT',cls:'chip-amber'},activity:{label:'ACTIVITY',cls:'chip-purple'},mindset:{label:'MINDSET',cls:'chip-teal'}
  };
  var POOL={
    workout_high:[
      {title:'Heavy session',desc:'Complete today\'s strength workout at full intensity. Warm up properly. Push to within 1–2 reps of failure on the last set of each exercise.',xp:100},
      {title:'PR attempt day',desc:'Pick your primary compound lift. After a thorough warm-up, attempt a personal record. Log the result every time.',xp:120}
    ],
    workout_moderate:[
      {title:'Moderate session',desc:'Complete the workout at 80% intensity. Perfect form on every single rep — technique compounds over years.',xp:75},
      {title:'Time under tension',desc:'3-second eccentric on every rep of every set. Slower tempo = more mechanical tension = more adaptation.',xp:75}
    ],
    workout_low:[
      {title:'Active recovery',desc:'20–30 min walk or light mobility work. No loaded barbell today. Movement accelerates recovery — do not skip.',xp:40},
      {title:'Mobility protocol',desc:'Hip flexors, thoracic spine, shoulder external rotation. 25 minutes. Your future self will thank you.',xp:40}
    ],
    habit_sleep:[{title:'Sleep protocol tonight',desc:'Lights out by 22:00. Phone charging in another room. Room temperature 18–19°C. This is your number one recovery tool.',xp:55}],
    habit_morning:[
      {title:'No-phone morning',desc:'First 30 minutes after waking: phone in another room. Own the first hour before the world demands your attention.',xp:50},
      {title:'Morning sunlight',desc:'10 min of direct outdoor light within 30 min of waking. No sunglasses. Sets circadian rhythm and cortisol timing for the whole day.',xp:45}
    ],
    habit_standard:[
      {title:'Morning protocol',desc:'Cold shower (2 min) + 5 min journaling (3 things you\'ll execute) before you open any app. Own the morning.',xp:55},
      {title:'Deep work block',desc:'One uninterrupted 90-minute block. Phone in another room. One goal. The people who build things do this daily.',xp:60},
      {title:'Evening wind-down',desc:'By 21:00: no bright screens, no heavy food. Read or stretch. Sleep quality starts 2 hours before bed.',xp:45}
    ],
    mindset_stress:[{title:'Box breathing protocol',desc:'Now: 4s inhale → 4s hold → 4s exhale → 4s hold. 10 rounds. Vagus nerve activates, cortisol drops within minutes.',xp:45}],
    mindset_standard:[
      {title:'Box breathing',desc:'4s in → 4s hold → 4s out → 4s hold. 10 rounds. Parasympathetic NS activation. Non-optional on high-stress days.',xp:40},
      {title:'Visualisation',desc:'5 min: close your eyes, picture your physique goal already achieved in precise detail. Same motor pathways as physical training.',xp:35},
      {title:'Stoic practice',desc:'Write 3 things within your complete control today. Write next to each one exactly how you will execute. Actions only.',xp:45},
      {title:'Cold exposure',desc:'2-minute cold shower from the start — not warm fading to cold. Controlled breathing throughout. Builds willpower and norepinephrine.',xp:55},
      {title:'Gratitude + identity',desc:'Write 3 genuine gratitudes + 1 sentence describing the person you are becoming. Identity reinforcement outlasts motivation.',xp:35}
    ]
  };
  function make(type,t){return{id:uid(),type:type,title:t.title,desc:t.desc,xpReward:t.xp,done:false};}
  function generate(profile,input){
    var r=input?TF.Score.recovery(input):65, stress=input?input.stress:5, sleep=input?input.sleepQuality:7, out=[];
    var wTier=r>=70?'high':r>=48?'moderate':'low';
    out.push(make('workout',pick(POOL['workout_'+wTier])));
    out.push(make('nutrition',{title:'Hit your daily macros',desc:'Target: '+profile.targetCalories+' kcal and '+profile.targetProtein+'g protein. Log every meal — tracking creates awareness, awareness drives compliance.',xp:60}));
    var hPool=sleep<=5?POOL.habit_sleep:r<50?POOL.habit_morning:POOL.habit_standard;
    out.push(make('habit',pick(hPool)));
    out.push(make('activity',{title:r>=55?'10,000 steps today':'6,000 steps minimum',desc:r>=55?'Hit 10k steps. Park further, take stairs. NEAT contributes significantly to daily energy expenditure.':'6k steps minimum. Light movement improves recovery markers and insulin sensitivity on rest days.',xp:r>=55?35:25}));
    var mPool=stress>=7?POOL.mindset_stress:POOL.mindset_standard;
    out.push(make('mindset',pick(mPool)));
    return out;
  }
  return{generate:generate,TYPES:TYPES};
})();
