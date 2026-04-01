TF.Screens.progress = function(root) {
  function draw(){
    var profile  = TF.Store.getProfile();
    var inputs   = TF.Store.getLastNInputs(7).reverse();
    var weightLog= TF.Store.getWeightLog().slice(0,14);
    var mStats   = TF.Store.getMissionStats();
    var level    = TF.Store.getLevel(profile);
    var warnings = TF.Score.weeklyInsights(inputs);
    var prs      = TF.Store.getPRs();
    var prKeys   = Object.keys(prs);
    var habitStats = TF.Store.getHabitStats();

    function avgRows(){
      if(inputs.length<2)return'<div class="t-hint" style="text-align:center;padding:16px">Log 2+ check-ins to see averages.</div>';
      function avg(f){return(inputs.reduce(function(s,i){return s+(i[f]||0);},0)/inputs.length);}
      function col(v,inv){var s=inv?10-v:v;if(s>=7.5)return'var(--lime)';if(s>=5.5)return'var(--blue)';return'var(--red)';}
      return'<div class="card">'+[
        {emoji:'🌙',label:'Sleep quality',val:avg('sleepQuality'),inv:false},
        {emoji:'⏰',label:'Sleep hours',  val:avg('sleepHours')||0,inv:false,max:12},
        {emoji:'⚡',label:'Energy',       val:avg('energy'),      inv:false},
        {emoji:'🧠',label:'Mood',         val:avg('mood'),        inv:false},
        {emoji:'🎯',label:'Focus',        val:avg('focus'),       inv:false},
        {emoji:'🔥',label:'Stress',       val:avg('stress'),      inv:true}
      ].map(function(r){
        return'<div class="avg-row">'+
          '<div class="avg-emoji">'+r.emoji+'</div>'+
          '<div class="avg-label">'+r.label+'</div>'+
          '<div class="avg-val" style="color:'+col(r.val,r.inv)+'">'+r.val.toFixed(1)+'</div>'+
          '<div class="avg-denom">'+(r.max?'/'+r.max:'/10')+'</div></div>';
      }).join('')+'</div>';
    }

    function weightSection(){
      return'<div class="card">'+
        '<div style="display:flex;gap:8px;margin-bottom:'+(weightLog.length?'14px':'0')+'">'+
          '<input type="number" id="in-weight" class="field" placeholder="e.g. 78.5" inputmode="decimal" step="0.1" min="20" max="300" style="flex:1;font-family:var(--font-m);font-size:15px;padding:10px 13px">'+
          '<span style="display:flex;align-items:center;color:var(--txt-3);font-size:13px;font-weight:600;flex-shrink:0">kg</span>'+
          '<button class="btn btn-primary btn-sm" id="btn-log-w" style="flex-shrink:0">'+TF.Icon('plus',11)+' LOG</button>'+
        '</div>'+
        (weightLog.length>=2?'<div style="height:160px;margin-bottom:14px"><canvas id="chart-weight"></canvas></div>':'')+
        (weightLog.length?weightLog.slice(0,8).map(function(e,i){
          var prev=weightLog[i+1],delta=prev?(e.kg-prev.kg):0;
          var dc=delta>0.05?'var(--amber)':delta<-0.05?'var(--green)':'var(--txt-3)';
          return'<div class="weight-entry">'+
            '<span class="weight-date">'+TF.UI.formatDate(e.date)+'</span>'+
            '<span class="weight-kg">'+e.kg.toFixed(1)+' kg</span>'+
            (Math.abs(delta)>0.05?'<span class="weight-delta" style="color:'+dc+'">'+(delta>0?'+':'')+delta.toFixed(1)+'kg</span>':'<span></span>')+
          '</div>';
        }).join(''):'<div class="t-hint" style="text-align:center;padding:12px 0">Log your weight daily to track body composition trends.</div>')+
      '</div>';
    }

    /* v4: PR board */
    function prBoard(){
      if(!prKeys.length) return '<div class="card card-sm t-hint" style="text-align:center">Log workouts to track PRs.</div>';
      return '<div class="card">'+
        prKeys.slice(0,8).map(function(name){
          var pr = prs[name];
          return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">'+
            '<div>'+
              '<div style="font-size:13px;font-weight:600">'+name+'</div>'+
              '<div class="t-hint" style="font-size:11px">'+TF.UI.formatDate(pr.date)+'</div>'+
            '</div>'+
            '<div style="text-align:right">'+
              '<div style="font-family:var(--font-m);font-size:15px;font-weight:700;color:var(--amber)">'+pr.est1RM+'kg</div>'+
              '<div class="t-hint" style="font-size:10px">est. 1RM</div>'+
            '</div>'+
          '</div>';
        }).join('')+
      '</div>';
    }

    /* v4: Habit stats */
    function habitSection(){
      var top = TF.Config.DefaultHabits.map(function(h){
        return {id:h.id,emoji:h.emoji,label:h.label,streak:TF.Store.getHabitStreak(h.id),count:habitStats.counts[h.id]||0};
      }).sort(function(a,b){return b.streak-a.streak;}).slice(0,5);

      return '<div class="card">'+
        top.map(function(h){
          var pct = habitStats.days>0?h.count/habitStats.days:0;
          return '<div class="avg-row">'+
            '<div class="avg-emoji">'+h.emoji+'</div>'+
            '<div class="avg-label">'+h.label+'</div>'+
            '<div style="flex:1;margin:0 10px">'+TF.UI.bar(pct,'var(--lime)')+'</div>'+
            '<div style="font-size:11px;font-weight:600;color:var(--amber);white-space:nowrap">'+
              (h.streak>0?'🔥'+h.streak+'d':'—')+
            '</div>'+
          '</div>';
        }).join('')+
      '</div>';
    }

    root.innerHTML='<div class="screen">'+
      '<div class="hero-img-card" id="pr-hero">'+
        '<div class="skeleton" style="position:absolute;inset:0;border-radius:var(--r-lg)"></div>'+
        '<div class="hero-img-card-content">'+
          '<div class="t-label" style="color:var(--lime);margin-bottom:5px">YOUR PROGRESS</div>'+
          '<div class="t-headline" style="font-size:24px">7-day view.<br>Patterns don\'t lie.</div>'+
        '</div>'+
      '</div>'+

      '<div class="grid-3" style="margin-bottom:20px">'+
        '<div class="stat-tile"><div class="stat-val" style="color:var(--amber)">'+(profile.streakDays||0)+'</div><div class="stat-unit">days</div><div class="stat-label">Streak 🔥</div></div>'+
        '<div class="stat-tile"><div class="stat-val" style="color:var(--lime)">'+level+'</div><div class="stat-unit">level</div><div class="stat-label">Warrior</div></div>'+
        '<div class="stat-tile"><div class="stat-val" style="color:var(--blue)">'+profile.xp+'</div><div class="stat-unit">xp</div><div class="stat-label">Total ⚡</div></div>'+
      '</div>'+

      (inputs.length>=2?'<div class="section">'+TF.UI.secHdr('7-Day Focus Score')+'<div class="card card-sm"><div style="height:180px"><canvas id="chart-focus"></canvas></div></div></div>':
       '<div class="card card-sm t-hint" style="text-align:center;margin-bottom:20px">Log 2+ check-ins to see your chart.</div>')+

      (inputs.length>=2?'<div class="section">'+TF.UI.secHdr('Weekly Radar')+'<div class="card card-sm"><div style="height:200px"><canvas id="chart-radar"></canvas></div></div></div>':'')+
      (inputs.length>=2?'<div class="section">'+TF.UI.secHdr('Weekly Averages')+avgRows()+'</div>':'')+
      (warnings.length?'<div class="section">'+TF.UI.secHdr('⚠ Warnings')+warnings.map(TF.UI.insightCard).join('')+'</div>':'')+

      /* v4 new sections */
      '<div class="section">'+TF.UI.secHdr('Personal Records 🏆')+prBoard()+'</div>'+
      '<div class="section">'+TF.UI.secHdr('Top Habits')+habitSection()+'</div>'+

      '<div class="section">'+TF.UI.secHdr('Mission Stats')+
        '<div class="card card-sm"><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">'+
          '<div><div class="t-mono" style="font-size:22px;font-weight:800;color:var(--purple)">'+mStats.totalCompleted+'</div><div class="t-hint">done</div></div>'+
          '<div><div class="t-mono" style="font-size:22px;font-weight:800;color:var(--teal)">'+mStats.totalDays+'</div><div class="t-hint">active days</div></div>'+
          '<div><div class="t-mono" style="font-size:22px;font-weight:800;color:var(--lime)">'+(mStats.totalMissions>0?Math.round(mStats.totalCompleted/mStats.totalMissions*100):0)+'%</div><div class="t-hint">completion</div></div>'+
        '</div></div>'+
      '</div>'+

      '<div class="section">'+TF.UI.secHdr('Weight Log')+weightSection()+'</div>'+
      '<div style="height:8px"></div></div>';

    TF.UI.setHeroImg(root.querySelector('#pr-hero'), TF.Config.Images.progress);

    var wBtn=root.querySelector('#btn-log-w'), wInp=root.querySelector('#in-weight');
    function doLog(){
      var v=parseFloat(wInp.value);
      if(isNaN(v)||v<20||v>300){TF.UI.toast('Enter a valid weight (20–300 kg).','error');return;}
      TF.Store.addWeight(v); TF.UI.haptic(60); TF.UI.toast(v.toFixed(1)+' kg logged ✓','success');
      var unlocked=TF.Achievements.check({type:'weight'});
      unlocked.forEach(function(id){setTimeout(function(){TF.UI.achievementToast(id);},800);});
      draw();
    }
    if(wBtn) wBtn.addEventListener('click',doLog);
    if(wInp) wInp.addEventListener('keydown',function(e){if(e.key==='Enter')doLog();});

    setTimeout(function(){
      if(inputs.length>=2){TF.Charts.focusLine('chart-focus',inputs);TF.Charts.weeklyRadar('chart-radar',inputs);}
      if(weightLog.length>=2)TF.Charts.weightLine('chart-weight',weightLog.slice(0,10));
    },80);
  }
  draw();
};
