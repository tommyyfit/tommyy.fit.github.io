/* ================================================================
   CHARTS — Lazy-loads Chart.js only when needed (saves 200KB)
   ================================================================ */
TF.Charts = (function(){
  'use strict';
  var _loaded=false, _loading=false, _queue=[], _instances={};

  function cssVar(name, fallback){
    var value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }

  function chartDefaults(){
    var txt = cssVar('--txt', '#ECEEF8');
    var txt2 = cssVar('--txt-2', '#B4B9D0');
    var txt3 = cssVar('--txt-3', '#8B92AC');
    var bg2 = cssVar('--bg-2', '#15151C');
    var border = cssVar('--border', '#22222E');
    var grid = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'rgba(15,15,26,.08)'
      : 'rgba(255,255,255,.06)';

    if (document.documentElement.getAttribute('data-theme') === 'light') {
      grid = 'rgba(15,15,26,.08)';
    }

    return {
      plugins:{
        legend:{display:false},
        tooltip:{
          backgroundColor:bg2,
          borderColor:border,
          borderWidth:1,
          titleColor:txt,
          bodyColor:txt2,
          padding:10
        }
      },
      scales:{
        x:{grid:{color:grid},ticks:{color:txt3,font:{family:"'JetBrains Mono'",size:11}}},
        y:{grid:{color:grid},ticks:{color:txt3,font:{family:"'JetBrains Mono'",size:11}},border:{display:false}}
      },
      animation:{duration:600,easing:'easeOutQuart'}
    };
  }

  function load(cb){
    if(_loaded){cb();return;}
    _queue.push(cb);
    if(_loading)return;
    _loading=true;
    var s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js';
    s.onload=function(){ _loaded=true; _loading=false; _queue.forEach(function(fn){fn();}); _queue=[]; };
    s.onerror=function(){ _loading=false; console.warn('[Charts] Failed to load Chart.js'); };
    document.head.appendChild(s);
  }

  function destroy(id){ if(_instances[id]){try{_instances[id].destroy();}catch(e){} delete _instances[id];} }

  function focusLine(canvasId,inputs){
    destroy(canvasId);
    load(function(){
      var defaults = chartDefaults();
      var canvas=document.getElementById(canvasId);
      if(!canvas||!inputs.length)return;
      var labels=inputs.map(function(i){return TF.UI.dayLabel(i.dateKey);});
      var scores=inputs.map(function(i){return TF.Score.daily(i);});
      var colors=scores.map(function(s){return s>=74?'#C8FF00':s>=52?'#4EBFF5':'#FF5C5C';});
      _instances[canvasId]=new Chart(canvas,{type:'bar',data:{labels:labels,datasets:[{data:scores,backgroundColor:colors.map(function(c){return c+'33';}),borderColor:colors,borderWidth:2,borderRadius:6,borderSkipped:false}]},options:Object.assign({},defaults,{responsive:true,maintainAspectRatio:false,plugins:Object.assign({},defaults.plugins,{tooltip:Object.assign({},defaults.plugins.tooltip,{callbacks:{label:function(ctx){return' Score: '+ctx.parsed.y+'/100';}}})}),scales:Object.assign({},defaults.scales,{y:{...defaults.scales.y,min:0,max:100}})})});
    });
  }

  function weightLine(canvasId,log){
    destroy(canvasId);
    load(function(){
      var defaults = chartDefaults();
      var canvas=document.getElementById(canvasId);
      if(!canvas||log.length<2)return;
      var rev=log.slice().reverse();
      _instances[canvasId]=new Chart(canvas,{type:'line',data:{labels:rev.map(function(e){return TF.UI.formatDate(e.date);}),datasets:[{data:rev.map(function(e){return e.kg;}),borderColor:'#C8FF00',backgroundColor:'rgba(200,255,0,.06)',borderWidth:2,pointBackgroundColor:'#C8FF00',pointRadius:4,pointHoverRadius:6,fill:true,tension:.35}]},options:Object.assign({},defaults,{responsive:true,maintainAspectRatio:false,scales:Object.assign({},defaults.scales,{x:Object.assign({},defaults.scales.x,{ticks:{...defaults.scales.x.ticks,maxTicksLimit:7}}),y:{...defaults.scales.y,ticks:{...defaults.scales.y.ticks,callback:function(v){return v+'kg';}}}})})});
    });
  }

  function weeklyRadar(canvasId,inputs){
    destroy(canvasId);
    load(function(){
      var txt3 = cssVar('--txt-3', '#8B92AC');
      var grid = document.documentElement.getAttribute('data-theme') === 'light'
        ? 'rgba(15,15,26,.08)'
        : 'rgba(255,255,255,.06)';
      var canvas=document.getElementById(canvasId);
      if(!canvas||inputs.length<2)return;
      function avg(f){return parseFloat((inputs.reduce(function(s,i){return s+(i[f]||0);},0)/inputs.length).toFixed(1));}
      _instances[canvasId]=new Chart(canvas,{type:'radar',data:{labels:['Sleep','Energy','Mood','Focus','Low Stress'],datasets:[{data:[avg('sleepQuality'),avg('energy'),avg('mood'),avg('focus'),parseFloat((10-avg('stress')).toFixed(1))],borderColor:'#C8FF00',backgroundColor:'rgba(200,255,0,.08)',borderWidth:2,pointBackgroundColor:'#C8FF00',pointRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{r:{min:0,max:10,grid:{color:grid},angleLines:{color:grid},pointLabels:{color:txt3,font:{family:"'DM Sans'",size:11}},ticks:{display:false}}},animation:{duration:600}}});
    });
  }

  function measurementLine(canvasId,log,field,color){
    destroy(canvasId);
    load(function(){
      var defaults = chartDefaults();
      var canvas=document.getElementById(canvasId);
      if(!canvas||log.length<2)return;
      var rev=log.slice().reverse().filter(function(e){return e[field];});
      if(rev.length<2)return;
      _instances[canvasId]=new Chart(canvas,{type:'line',data:{labels:rev.map(function(e){return TF.UI.formatDate(e.date);}),datasets:[{data:rev.map(function(e){return e[field];}),borderColor:color||'#4EBFF5',backgroundColor:(color||'#4EBFF5')+'22',borderWidth:2,pointBackgroundColor:color||'#4EBFF5',pointRadius:3,fill:true,tension:.35}]},options:Object.assign({},defaults,{responsive:true,maintainAspectRatio:false})});
    });
  }

  return{focusLine:focusLine,weightLine:weightLine,weeklyRadar:weeklyRadar,measurementLine:measurementLine,destroy:destroy};
})();
