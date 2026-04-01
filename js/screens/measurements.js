TF.Screens.measurements = function(root) {
  var FIELDS = [
    {id:'chest',    label:'Chest',    emoji:'📏', color:'var(--lime)'},
    {id:'waist',    label:'Waist',    emoji:'⭕', color:'var(--blue)'},
    {id:'hips',     label:'Hips',     emoji:'📐', color:'var(--purple)'},
    {id:'leftArm',  label:'L. Arm',   emoji:'💪', color:'var(--amber)'},
    {id:'rightArm', label:'R. Arm',   emoji:'💪', color:'var(--amber)'},
    {id:'thigh',    label:'Thigh',    emoji:'🦵', color:'var(--teal)'},
    {id:'shoulders',label:'Shoulders',emoji:'🏋️', color:'var(--orange)'}
  ];

  function latestDelta(field){
    var log = TF.Store.getMeasurements();
    if(log.length<2) return null;
    var cur = log[0][field], prev = log[1][field];
    if(!cur||!prev) return null;
    var d = cur-prev;
    return {val:d.toFixed(1),pos:d>0,zero:Math.abs(d)<0.1};
  }

  function draw(){
    var log = TF.Store.getMeasurements();
    root.innerHTML='<div class="screen">'+
      '<div class="t-headline" style="margin-bottom:4px">'+TF.Icon('ruler',20)+' Body Measurements</div>'+
      '<div class="t-hint" style="margin-bottom:20px">Measure consistently — same time of day, same conditions.</div>'+

      /* Latest stats grid */
      (log.length?'<div class="grid-2" style="margin-bottom:18px">'+FIELDS.map(function(f){
        var latest=log[0][f.id], d=latestDelta(f.id);
        if(!latest) return '';
        return'<div class="stat-tile">'+
          '<div class="stat-val" style="color:'+f.color+'">'+latest+'</div>'+
          '<div class="stat-unit">cm'+(!d?'':' '+(d.zero?'→':d.pos?'↑ +'+d.val:'↓ '+d.val)+'cm')+'</div>'+
          '<div class="stat-label">'+f.emoji+' '+f.label+'</div>'+
        '</div>';
      }).filter(Boolean).join('')+'</div>':'<div class="t-hint" style="text-align:center;padding:16px 0;margin-bottom:16px">Log your first measurements to see your baseline.</div>')+

      /* Log new measurement */
      '<div class="card" style="margin-bottom:16px">'+
        '<div class="t-title" style="margin-bottom:12px">Log Measurements (cm)</div>'+
        '<div class="measure-input-grid">'+
        FIELDS.map(function(f){
          var latest=log.length?log[0][f.id]:'';
          return'<div class="field-group">'+
            '<div class="field-label">'+f.emoji+' '+f.label+'</div>'+
            '<input class="field" id="in-'+f.id+'" type="number" placeholder="'+(latest||'cm')+'" inputmode="decimal" step="0.1" min="0" max="300" style="padding:10px 12px;font-family:var(--font-m)">'+
          '</div>';
        }).join('')+
        '</div>'+
        '<button class="btn btn-primary" id="btn-save-measures" style="margin-top:14px">'+TF.Icon('save',13)+' SAVE MEASUREMENTS</button>'+
      '</div>'+

      /* Trend charts */
      (log.length>=2?'<div class="card" style="margin-bottom:16px">'+
        '<div class="t-label" style="margin-bottom:12px">Waist Trend</div>'+
        '<div style="height:140px"><canvas id="chart-waist"></canvas></div>'+
      '</div>':'<div class="t-hint" style="text-align:center;padding:8px 0;margin-bottom:12px">Log 2+ entries to see trend charts.</div>')+

      /* History log */
      (log.length?'<div class="card">'+TF.UI.secHdr('History')+
        log.slice(0,8).map(function(e){
          return'<div class="measure-entry">'+
            '<span class="measure-date">'+TF.UI.formatDate(e.date)+'</span>'+
            '<span class="measure-vals">'+FIELDS.filter(function(f){return e[f.id];}).map(function(f){return f.label+': '+e[f.id];}).join(' · ')+'</span>'+
          '</div>';
        }).join('')+
      '</div>':'')+'<div style="height:8px"></div></div>';

    root.querySelector('#btn-save-measures').addEventListener('click',function(){
      var data={};
      var hasAny=false;
      FIELDS.forEach(function(f){
        var v=parseFloat(root.querySelector('#in-'+f.id).value);
        if(!isNaN(v)&&v>0&&v<300){data[f.id]=v;hasAny=true;}
      });
      if(!hasAny){TF.UI.toast('Enter at least one measurement.','error');return;}
      TF.Store.addMeasurement(data);
      TF.UI.haptic(60);
      TF.UI.toast('Measurements saved ✓','success');
      var unlocked=TF.Achievements.check({type:'measurement'});
      unlocked.forEach(function(id){setTimeout(function(){TF.UI.achievementToast(id);},800);});
      draw();
    });

    if(log.length>=2) setTimeout(function(){ TF.Charts.measurementLine('chart-waist',log,'waist','var(--blue)'); },80);
  }
  draw();
};
