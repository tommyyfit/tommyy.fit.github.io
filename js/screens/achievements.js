TF.Screens.achievements = function(root) {
  var all      = TF.Achievements.getAll();
  var unlocked = TF.Store.getUnlockedAchievements();
  var cats = ['consistency','training','nutrition','scores','xp','body','missions'];
  var catLabels = {consistency:'Consistency',training:'Training',nutrition:'Nutrition',scores:'Performance',xp:'XP & Levels',body:'Body',missions:'Missions'};
  var catIcons  = {consistency:'🔥',training:'🏋️',nutrition:'🍽️',scores:'📊',xp:'⚡',body:'⚖️',missions:'🎯'};

  var totalCount    = all.length;
  var unlockedCount = Object.keys(unlocked).length;

  root.innerHTML='<div class="screen">'+
    '<div class="flex-between" style="margin-bottom:4px">'+
      '<div class="t-headline">'+TF.Icon('trophy',20)+' Achievements</div>'+
      '<span class="t-mono" style="font-size:18px;font-weight:800;color:var(--amber)">'+unlockedCount+'/'+totalCount+'</span>'+
    '</div>'+
    '<div class="t-hint" style="margin-bottom:8px">Unlock by completing actions and hitting milestones.</div>'+
    '<div style="margin-bottom:20px">'+TF.UI.bar(unlockedCount/totalCount,'var(--amber)')+'</div>'+

    cats.map(function(cat){
      var catAchs = all.filter(function(a){return a.cat===cat;});
      return'<div class="section">'+
        TF.UI.secHdr(catIcons[cat]+' '+catLabels[cat].toUpperCase())+
        '<div class="ach-grid">'+
        catAchs.map(function(a){
          var isUnlocked = !!unlocked[a.id];
          var unlockedAt = isUnlocked?TF.UI.formatDate(unlocked[a.id].unlockedAt.slice(0,10)):null;
          return'<div class="ach-tile '+(isUnlocked?'unlocked':'')+'" title="'+a.desc+'">'+
            '<div class="ach-icon">'+a.icon+'</div>'+
            '<div class="ach-name">'+a.name+'</div>'+
            '<div class="ach-desc">'+a.desc+'</div>'+
            (unlockedAt?'<div class="ach-date">'+unlockedAt+'</div>':'')+
          '</div>';
        }).join('')+
        '</div></div>';
    }).join('')+
    '<div style="height:8px"></div></div>';
};
