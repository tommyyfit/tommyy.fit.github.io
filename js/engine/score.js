/* ================================================================ SCORE ENGINE v2 — includes sleep duration ================================================================ */
TF.Score=(function(){
  'use strict';
  function clamp(v,lo,hi){return Math.min(Math.max(v,lo),hi);}

  /* sleep duration bonus: 8h = optimal, <6h or >10h penalised */
  function sleepDurationBonus(hours){
    if(!hours)return 0;
    if(hours>=7.5&&hours<=9)return 0.8;
    if(hours>=6.5)return 0.4;
    if(hours>=5)return 0;
    return -0.5;
  }

  /* Focus: sleep 30% + energy 25% + focus 25% + mood 10% + low-stress 5% + duration 5% */
  function focus(inp){
    var dur=sleepDurationBonus(inp.sleepHours);
    var raw=inp.sleepQuality*0.30+inp.energy*0.25+inp.focus*0.25+inp.mood*0.10+(10-inp.stress)*0.05+dur*0.05;
    return Math.round(clamp(raw*10,0,100));
  }
  /* Recovery: sleep 45% + energy 30% + low-stress 20% + duration 5% */
  function recovery(inp){
    var dur=sleepDurationBonus(inp.sleepHours);
    var raw=inp.sleepQuality*0.45+inp.energy*0.30+(10-inp.stress)*0.20+dur*0.05;
    return Math.round(clamp(raw*10,0,100));
  }
  /* Discipline: focus 30% + energy 25% + mood 20% + low-stress 20% + yesterday bonus */
  function discipline(inp){
    var raw=inp.focus*0.30+inp.energy*0.25+inp.mood*0.20+(10-inp.stress)*0.20+(inp.disciplineYesterday?0.8:0);
    return Math.round(clamp(raw*10,0,100));
  }
  /* Daily headline: focus 40% + recovery 30% + discipline 30% */
  function daily(inp){ return Math.round(focus(inp)*0.40+recovery(inp)*0.30+discipline(inp)*0.30); }

  function label(s){if(s>=88)return'ELITE';if(s>=74)return'SHARP';if(s>=58)return'SOLID';if(s>=42)return'LOW';return'RECOVER';}
  function color(s){if(s>=74)return'var(--lime)';if(s>=52)return'var(--blue)';return'var(--red)';}
  function bg(s){if(s>=74)return'var(--lime-dim)';if(s>=52)return'var(--blue-dim)';return'var(--red-dim)';}
  function glow(s){if(s>=74)return'radial-gradient(circle,rgba(200,255,0,.12) 0%,transparent 70%)';if(s>=52)return'radial-gradient(circle,rgba(78,191,245,.10) 0%,transparent 70%)';return'radial-gradient(circle,rgba(255,92,92,.10) 0%,transparent 70%)';}
  function trainingRec(r){if(r>=75)return'Full intensity — push to 1–2 reps shy of failure on last set.';if(r>=55)return'Moderate — controlled reps, prioritise form over load.';if(r>=35)return'Light only — zone-2 cardio, mobility, or a 30-min walk.';return'Rest day — CNS depleted. Training today costs more than it builds.';}

  function insights(inp,nutrition){
    var list=[],r=recovery(inp);
    if(inp.sleepHours&&inp.sleepHours<5&&inp.sleepQuality>5)list.push({level:'warning',icon:'⏰',title:'Short sleep despite good quality',body:'Only '+inp.sleepHours+'h logged. Duration matters as much as quality — aim for 7.5–9h consistently.'});
    if(inp.sleepQuality<=3)list.push({level:'danger',icon:'🌙',title:'Critical sleep deficit',body:'Quality at '+inp.sleepQuality+'/10. Lights out by 21:30. Phone out of the bedroom. Non-negotiable.'});
    else if(inp.sleepQuality<=5)list.push({level:'warning',icon:'🌙',title:'Poor sleep',body:'No caffeine after 13:00. Room at 18°C. Phone charging outside the room tonight.'});
    if(inp.stress>=8)list.push({level:'danger',icon:'🔥',title:'Stress spike — '+inp.stress+'/10',body:'Box breathing now: 4s in → 4s hold → 4s out → 4s hold. 5 rounds. Vagal brake activated.'});
    else if(inp.stress>=6)list.push({level:'warning',icon:'🔥',title:'Elevated stress',body:'Stress at '+inp.stress+'/10. Single priority today. Limit decisions. Protect energy.'});
    if(inp.energy<=3)list.push({level:'danger',icon:'⚡',title:'Energy critically low',body:'Check hydration and food first. If both are fine — honour the signal. Your body needs rest.'});
    if(r<40)list.push({level:'warning',icon:'🧠',title:'Overreaching risk',body:'Recovery at '+r+'/100. Swap today\'s session for mobility. Underrecovery kills gains.'});
    if(nutrition&&nutrition.protein>0&&nutrition.protein<80)list.push({level:'warning',icon:'🥩',title:'Protein too low',body:nutrition.protein+'g logged. Minimum 1.6g/kg for muscle protein synthesis. Add a shake.'});
    if(nutrition&&nutrition.water>0&&nutrition.water<1.5)list.push({level:'info',icon:'💧',title:'Hydration low',body:'Only '+nutrition.water.toFixed(1)+'L. Dehydration drops cognition 10–15%. Drink 500ml now.'});
    if(inp.disciplineYesterday)list.push({level:'success',icon:'🔱',title:'Consistency chain active',body:'You executed yesterday. The compound effect is building. Don\'t break the chain.'});
    if(!list.length)list.push({level:'success',icon:'⚔️',title:'All systems optimal',body:'Metrics are clean. Execute the plan without hesitation. Today is a green-light day.'});
    return list;
  }

  function weeklyInsights(inputs){
    if(!inputs.length)return[];
    var w=[];
    function avg(f){return inputs.reduce(function(s,i){return s+(i[f]||0);},0)/inputs.length;}
    var sl=avg('sleepQuality'),st=avg('stress'),en=avg('energy');
    if(sl<5)w.push({level:'danger',icon:'🌙',title:'Chronic sleep deficit',body:'7-day avg: '+sl.toFixed(1)+'/10. Sleep is the highest-ROI recovery intervention. Fix this first.'});
    if(st>7)w.push({level:'danger',icon:'🔥',title:'Sustained high stress',body:'Avg '+st.toFixed(1)+'/10 this week. Consider a deload. Daily breathing practice. Reduce external load.'});
    if(en<4.5)w.push({level:'warning',icon:'⚡',title:'Overtraining pattern',body:'Energy averaging '+en.toFixed(1)+'/10. Add 1–2 rest days. Prioritise 9h sleep this week.'});
    return w;
  }

  return{focus:focus,recovery:recovery,discipline:discipline,daily:daily,label:label,color:color,bg:bg,glow:glow,trainingRec:trainingRec,insights:insights,weeklyInsights:weeklyInsights};
})();
