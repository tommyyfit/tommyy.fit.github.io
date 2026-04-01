TF.Screens.checkin = function(root) {
  var METRICS = [
    {id:'sleep',    emoji:'🌙',label:'Sleep quality',        min:'Terrible',   max:'Incredible', def:7},
    {id:'sleepHrs', emoji:'⏰',label:'Sleep hours',          min:'< 4h',       max:'10h+',       def:8, step:0.5, min_v:2, max_v:12},
    {id:'energy',   emoji:'⚡',label:'Energy level',         min:'Drained',    max:'Explosive',  def:7},
    {id:'mood',     emoji:'🧠',label:'Mood',                 min:'Dark',       max:'Excellent',  def:7},
    {id:'focus',    emoji:'🎯',label:'Mental focus',         min:'Foggy',      max:'Laser',      def:7},
    {id:'stress',   emoji:'🔥',label:'Stress (low is good)', min:'Zero',       max:'Maxed',      def:4}
  ];

  function sliderColor(id,v){
    if(id==='sleepHrs'){
      if(v>=7.5&&v<=9)return'var(--lime)';
      if(v>=6)return'var(--blue)';
      return'var(--amber)';
    }
    var s=id==='stress'?(11-v):v;
    if(s>=8)return'var(--lime)'; if(s>=6)return'var(--blue)'; if(s>=4)return'var(--amber)'; return'var(--red)';
  }

  var existing = TF.Store.getTodayInput();
  var defaults = existing ? {
    sleep:existing.sleepQuality||7, sleepHrs:existing.sleepHours||8,
    energy:existing.energy||7, mood:existing.mood||7,
    focus:existing.focus||7, stress:existing.stress||4,
    disc: existing.disciplineYesterday!==false
  } : {sleep:7,sleepHrs:8,energy:7,mood:7,focus:7,stress:4,disc:true};

  root.innerHTML = '<div class="screen">'+
    '<div class="hero-img-card" id="ci-hero" style="margin-bottom:16px">'+
      '<div class="skeleton" style="position:absolute;inset:0;border-radius:var(--r-lg)"></div>'+
      '<div class="hero-img-card-content">'+
        '<div class="t-label" style="color:var(--lime);margin-bottom:5px">30-SECOND CHECK-IN</div>'+
        '<div class="t-headline" style="font-size:24px">How are you<br>today?</div>'+
      '</div>'+
    '</div>'+
    '<div class="t-body" style="margin-bottom:24px">Honest inputs = better guidance. Data stays on your device only.</div>'+

    METRICS.map(function(m){
      var isHrs = m.id==='sleepHrs';
      var defVal = defaults[m.id==='sleep'?'sleep':m.id==='sleepHrs'?'sleepHrs':m.id];
      var col = sliderColor(m.id, defVal||m.def);
      var valDisplay = isHrs ? (defVal||m.def)+'h' : (defVal||m.def);
      return '<div class="slider-row">'+
        '<div class="slider-header">'+
          '<div class="slider-emoji-label"><span style="font-size:20px">'+m.emoji+'</span> '+m.label+'</div>'+
          '<div class="slider-badge" id="val-'+m.id+'" style="color:'+col+';min-width:42px">'+valDisplay+'</div>'+
        '</div>'+
        '<input type="range" id="sl-'+m.id+'" min="'+(m.min_v||1)+'" max="'+(m.max_v||10)+'" step="'+(m.step||1)+'" value="'+(defVal||m.def)+'" style="accent-color:'+col+'">'+
        '<div class="slider-foot"><span class="t-hint">'+m.min+'</span><span class="t-hint">'+m.max+'</span></div>'+
      '</div>';
    }).join('')+

    '<div class="card" style="margin-bottom:14px">'+
      '<div class="t-title" style="margin-bottom:4px">Did you execute yesterday?</div>'+
      '<div class="t-hint" style="margin-bottom:12px">Workout + nutrition + habits fully completed.</div>'+
      '<div class="toggle-row" id="disc-toggle">'+
        '<div class="toggle-chip '+(defaults.disc?'on':'')+'\" data-val="true">✓ Yes — executed</div>'+
        '<div class="toggle-chip '+(defaults.disc?'':'on')+'\" data-val="false">✗ No — missed it</div>'+
      '</div>'+
    '</div>'+

    /* v4 NEW: Quick habit log */
    '<div class="card" style="margin-bottom:22px">'+
      '<div class="t-title" style="margin-bottom:4px">Quick habit log <span class="chip chip-lime" style="font-size:10px;margin-left:6px">NEW</span></div>'+
      '<div class="t-hint" style="margin-bottom:12px">Tick what you did today. Each earns XP.</div>'+
      TF.Config.DefaultHabits.map(function(h){
        var done = !!(TF.Store.getTodayHabits()[h.id]);
        return '<div class="quick-habit '+(done?'on':'')+'\" data-hid="'+h.id+'">'+
          '<span style="font-size:18px">'+h.emoji+'</span>'+
          '<span style="flex:1;font-size:13px">'+h.label+'</span>'+
          '<span class="quick-habit-xp">+'+h.xp+'</span>'+
          '<div class="quick-habit-check '+(done?'on':'')+'">'+
            (done?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px"><polyline points="20 6 9 17 4 12"/></svg>':'')+
          '</div>'+
        '</div>';
      }).join('')+
    '</div>'+

    '<button class="btn btn-primary" id="btn-submit">'+TF.Icon('zap',14)+' LOG &amp; GENERATE MISSIONS</button>'+
    '<div style="height:16px"></div>'+
  '</div>';

  TF.UI.setHeroImg(root.querySelector('#ci-hero'), TF.Config.Images.checkin);
  TF.UI.initToggle(root, 'disc-toggle');

  METRICS.forEach(function(m){
    var sl = root.querySelector('#sl-'+m.id);
    var vl = root.querySelector('#val-'+m.id);
    var isHrs = m.id==='sleepHrs';
    function upd(){
      var v=parseFloat(sl.value), col=sliderColor(m.id,v);
      vl.textContent = isHrs?v+'h':v;
      vl.style.color = col; sl.style.accentColor = col;
    }
    sl.addEventListener('input', upd); upd();
  });

  /* Quick habit toggles */
  root.querySelectorAll('.quick-habit').forEach(function(el){
    el.addEventListener('click', function(){
      var id = el.dataset.hid;
      var current = !!(TF.Store.getTodayHabits()[id]);
      TF.Store.toggleHabit(id, !current);
      TF.UI.haptic(40);
      el.classList.toggle('on', !current);
      var chk = el.querySelector('.quick-habit-check');
      if(chk){
        chk.classList.toggle('on', !current);
        chk.innerHTML = !current?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px"><polyline points="20 6 9 17 4 12"/></svg>':'';
      }
    });
  });

  root.querySelector('#btn-submit').addEventListener('click', function(){
    var input = {
      dateKey:     TF.Store.todayKey(),
      sleepQuality:parseInt(root.querySelector('#sl-sleep').value),
      sleepHours:  parseFloat(root.querySelector('#sl-sleepHrs').value),
      energy:      parseInt(root.querySelector('#sl-energy').value),
      mood:        parseInt(root.querySelector('#sl-mood').value),
      focus:       parseInt(root.querySelector('#sl-focus').value),
      stress:      parseInt(root.querySelector('#sl-stress').value),
      disciplineYesterday: root.querySelector('#disc-toggle .toggle-chip.on').dataset.val === 'true'
    };

    TF.Store.saveDailyInput(input);
    var ms = TF.Missions.generate(TF.Store.getProfile(), input);
    TF.Store.saveTodayMissions(ms);

    var unlocked = TF.Achievements.check({type:'checkin'});
    unlocked.forEach(function(id){ setTimeout(function(){ TF.UI.achievementToast(id); }, 800); });

    TF.UI.haptic(60);
    TF.UI.toast('✓ Check-in saved · '+ms.length+' missions ready', 'success');
    TF.Router.navigate('dashboard');
  });
};
