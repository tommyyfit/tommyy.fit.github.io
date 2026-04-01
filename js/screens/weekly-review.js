TF.Screens['weekly-review'] = function(root) {
  var inputs7  = TF.Store.getLastNInputs(7).reverse();
  var inputs14 = TF.Store.getLastNInputs(14).reverse();
  var thisWeek = inputs7;
  var lastWeek = inputs14.slice(0,7);

  function avg(arr,field){ if(!arr.length)return 0; return arr.reduce(function(s,i){return s+(i[field]||0);},0)/arr.length; }
  function dailyScores(arr){ return arr.map(function(i){return TF.Score.daily(i);}); }

  var thisScores = dailyScores(thisWeek);
  var lastScores = dailyScores(lastWeek);
  var thisAvg = thisScores.length?thisScores.reduce(function(s,v){return s+v;},0)/thisScores.length:0;
  var lastAvg = lastScores.length?lastScores.reduce(function(s,v){return s+v;},0)/lastScores.length:0;
  var bestDay  = thisWeek.length?thisWeek.reduce(function(best,i){ return TF.Score.daily(i)>TF.Score.daily(best)?i:best;},thisWeek[0]):null;
  var worstDay = thisWeek.length?thisWeek.reduce(function(worst,i){return TF.Score.daily(i)<TF.Score.daily(worst)?i:worst;},thisWeek[0]):null;

  var mStats   = TF.Store.getMissionStats();
  var allMs7   = (function(){
    var all=JSON.parse(localStorage.getItem('tf_missions')||'{}');
    var keys=Object.keys(all).filter(function(k){
      var d=new Date(); d.setDate(d.getDate()-7);
      return k>=d.toISOString().slice(0,10);
    });
    var done=0,total=0;
    keys.forEach(function(k){total+=all[k].length;done+=all[k].filter(function(m){return m.done;}).length;});
    return{done:done,total:total};
  })();

  function metricRow(label,thisVal,lastVal,format,lowerIsBetter){
    var diff = thisVal-lastVal;
    var improved = lowerIsBetter?diff<0:diff>0;
    var neutral = Math.abs(diff)<0.1;
    var cls = neutral?'review-change-neu':improved?'review-change-pos':'review-change-neg';
    var arrow = neutral?'→':improved?'↑':'↓';
    return'<div class="review-metric">'+
      '<span class="t-title">'+label+'</span>'+
      '<div style="display:flex;align-items:center;gap:8px">'+
        '<span style="font-family:var(--font-m);font-size:15px;font-weight:700">'+(format?format(thisVal):thisVal.toFixed(1))+'</span>'+
        (lastVal>0?'<span class="'+cls+'">'+arrow+' '+Math.abs(diff).toFixed(1)+'</span>':'')+
      '</div>'+
    '</div>';
  }

  /* Recommendation for next week */
  function aiRec(){
    if(!thisWeek.length) return'Start logging check-ins to get weekly recommendations.';
    var avgSleep=avg(thisWeek,'sleepQuality'),avgStress=avg(thisWeek,'stress'),avgEnergy=avg(thisWeek,'energy');
    if(avgSleep<5) return'🌙 Priority: fix sleep. Everything else compounds on sleep quality. Target 7.5–9h, room at 18°C, phone out of bedroom by 21:00.';
    if(avgStress>7) return'🔥 Stress is the bottleneck. Add one 5-min box breathing session daily. Reduce decision fatigue — plan the day the night before.';
    if(avgEnergy<5) return'⚡ Energy is low. Consider a deload week — reduce training volume by 40%, prioritise 9h sleep, increase calories by 200kcal/day.';
    if(thisAvg>=80) return'🔱 Elite performance maintained. Focus on progressive overload — add 2.5kg to your main compound lifts this week.';
    if(thisAvg>=65) return'⚔️ Solid week. Identify your worst day and the pattern behind it. Replicate your best-day conditions consistently.';
    return'📈 Build the foundation: check-in every day, hit protein target, complete the workout. Consistency beats intensity every week.';
  }

  root.innerHTML='<div class="screen">'+
    '<div class="t-headline" style="margin-bottom:4px">'+TF.Icon('bar-chart',20)+' Weekly Review</div>'+
    '<div class="t-hint" style="margin-bottom:20px">'+(new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long'})+' — last 7 days')+'</div>'+

    (thisWeek.length<3?'<div class="card"><div class="t-hint" style="text-align:center;padding:16px">Log at least 3 check-ins this week to see your review.</div></div>':
      '<div class="grid-2" style="margin-bottom:16px">'+
        '<div class="stat-tile"><div class="stat-val" style="color:'+(thisAvg>=74?'var(--lime)':thisAvg>=52?'var(--blue)':'var(--red)')+'">'+Math.round(thisAvg)+'</div><div class="stat-unit">avg score</div><div class="stat-label">This week</div></div>'+
        '<div class="stat-tile"><div class="stat-val" style="color:var(--txt-2)">'+Math.round(lastAvg||0)+'</div><div class="stat-unit">avg score</div><div class="stat-label">Last week</div></div>'+
      '</div>'+

      '<div class="card" style="margin-bottom:16px">'+
        TF.UI.secHdr('Metric Comparison','<span class="t-hint">this vs last week</span>')+
        (lastWeek.length?
          metricRow('Focus Score',thisAvg,lastAvg)+
          metricRow('Sleep Quality',avg(thisWeek,'sleepQuality'),avg(lastWeek,'sleepQuality'))+
          metricRow('Energy',avg(thisWeek,'energy'),avg(lastWeek,'energy'))+
          metricRow('Mood',avg(thisWeek,'mood'),avg(lastWeek,'mood'))+
          metricRow('Stress',avg(thisWeek,'stress'),avg(lastWeek,'stress'),null,true):
          '<div class="t-hint" style="padding:8px 0;text-align:center">Need 2 full weeks of data for comparison.</div>')+
      '</div>'+

      (bestDay&&worstDay?
        '<div class="grid-2" style="margin-bottom:16px">'+
          '<div class="card card-sm"><div class="t-label" style="color:var(--lime);margin-bottom:6px">Best Day 🔱</div><div class="t-title">'+TF.UI.dayLabel(bestDay.dateKey)+'</div><div class="t-mono" style="font-size:24px;font-weight:800;color:var(--lime)">'+TF.Score.daily(bestDay)+'</div></div>'+
          '<div class="card card-sm"><div class="t-label" style="color:var(--red);margin-bottom:6px">Hardest Day</div><div class="t-title">'+TF.UI.dayLabel(worstDay.dateKey)+'</div><div class="t-mono" style="font-size:24px;font-weight:800;color:var(--red)">'+TF.Score.daily(worstDay)+'</div></div>'+
        '</div>':'')+

      '<div class="card" style="margin-bottom:16px">'+
        '<div class="t-label" style="margin-bottom:6px">Missions This Week</div>'+
        '<div style="font-family:var(--font-m);font-size:28px;font-weight:800;color:var(--lime);margin-bottom:4px">'+allMs7.done+'/'+allMs7.total+'</div>'+
        (allMs7.total?TF.UI.bar(allMs7.done/allMs7.total,'var(--lime)'):'<div class="t-hint">No missions this week yet.</div>')+
      '</div>'+

      '<div class="card card-glow">'+
        '<div class="t-label" style="margin-bottom:8px">RECOMMENDATION FOR NEXT WEEK</div>'+
        '<div style="font-size:14px;line-height:1.7">'+aiRec()+'</div>'+
      '</div>'
    )+

    '<div style="height:8px"></div></div>';
};
