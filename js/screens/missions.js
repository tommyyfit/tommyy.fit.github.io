TF.Screens.missions = function(root) {
  function draw() {
    var missions = TF.Store.getTodayMissions();
    var xpDone  = missions.filter(function(m){return m.done;}).reduce(function(s,m){return s+m.xpReward;},0);
    var xpTotal = missions.reduce(function(s,m){return s+m.xpReward;},0);
    var allDone = missions.length>0 && missions.every(function(m){return m.done;});

    function mCard(m) {
      var t = TF.Missions.TYPES[m.type] || TF.Missions.TYPES.habit;
      var colMap = {workout:'var(--lime)',nutrition:'var(--blue)',habit:'var(--amber)',activity:'var(--purple)',mindset:'var(--teal)'};
      var col = colMap[m.type]||'var(--lime)';
      return '<div class="mission-card '+(m.done?'done':'')+'" data-id="'+m.id+'"'+
        (!m.done?' style="border-left:3px solid '+col+'30"':'')+'>'+
        '<div class="m-check" style="'+(m.done?'background:'+col+'22;border-color:transparent':'')+'">'+(m.done?'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="'+col+'" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>':'')+
        '</div>'+
        '<div class="m-body">'+
          '<div class="m-meta"><span class="chip '+t.cls+'">'+t.label+'</span><span class="m-xp">+'+m.xpReward+' XP</span></div>'+
          '<div class="m-title">'+m.title+'</div>'+
          '<div class="m-desc">'+m.desc+'</div>'+
        '</div></div>';
    }

    root.innerHTML = '<div class="screen">'+
      '<div class="hero-img-card" id="mi-hero">'+
        '<div class="skeleton" style="position:absolute;inset:0;border-radius:var(--r-lg)"></div>'+
        '<div class="hero-img-card-content">'+
          '<div class="t-label" style="color:var(--lime);margin-bottom:5px">DAILY MISSIONS</div>'+
          '<div class="t-headline" style="font-size:24px">Execute or<br>stay average.</div>'+
        '</div>'+
      '</div>'+

      '<div class="card card-sm" style="margin-bottom:18px">'+
        '<div class="flex-between" style="margin-bottom:7px">'+
          '<span class="t-label">XP TODAY</span>'+
          '<span class="t-mono" style="font-size:16px;font-weight:800;color:'+(allDone?'var(--lime)':'var(--blue)')+'">'+xpDone+' / '+xpTotal+'</span>'+
        '</div>'+
        TF.UI.bar(xpTotal?xpDone/xpTotal:0, allDone?'var(--lime)':'var(--blue)')+
        (allDone?'<div style="margin-top:8px;font-size:13px;font-weight:600;color:var(--lime)">🏆 All missions complete!</div>':'')+
      '</div>'+

      (missions.length
        ? missions.map(mCard).join('')
        : '<div class="empty-state">'+
            '<div class="empty-icon">⚡</div>'+
            '<div class="empty-title">No missions yet</div>'+
            '<div class="empty-body">Complete your daily check-in to generate today\'s 5 missions.</div>'+
            '<button class="btn btn-primary" id="btn-go-ci" style="margin-top:20px;max-width:200px;margin-left:auto;margin-right:auto">'+TF.Icon('activity',13)+' Check-in Now</button>'+
          '</div>'
      )+
      '<div style="height:8px"></div></div>';

    TF.UI.setHeroImg(root.querySelector('#mi-hero'), TF.Config.Images.missions);

    root.querySelectorAll('.mission-card:not(.done)').forEach(function(card){
      card.addEventListener('click', function(){
        var xp = TF.Store.completeMission(card.dataset.id);
        if(xp===null) return;
        TF.UI.haptic(80);
        TF.UI.toast('+'+xp+' XP — mission complete 🔱', 'success');

        /* Check if all done → confetti */
        var ms = TF.Store.getTodayMissions();
        if(ms.every(function(m){return m.done;})){
          setTimeout(function(){TF.UI.confetti({particleCount:120,spread:80,origin:{y:.5}});},200);
        }

        /* Check achievements */
        var unlocked = TF.Achievements.check({type:'mission'});
        unlocked.forEach(function(id){ setTimeout(function(){ TF.UI.achievementToast(id); },1000); });

        draw();
      });
    });

    var goCI = root.querySelector('#btn-go-ci');
    if(goCI) goCI.addEventListener('click', function(){ TF.Router.navigate('checkin'); });
  }
  draw();
};
