TF.Screens.history = function(root) {
  var today = TF.Store.todayKey();
  var viewDate = new Date();
  var selectedDate = today;

  function buildCalendar(year, month){
    var workoutDates = TF.Store.getWorkoutDates();
    var inputDates   = Object.keys(TF.Store.getAllInputs());

    var firstDay = new Date(year, month, 1);
    var lastDay  = new Date(year, month+1, 0);
    var startDow = firstDay.getDay(); // 0=Sun
    var MONTHS   = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var DOWS     = ['Su','Mo','Tu','We','Th','Fr','Sa'];

    var html = '<div style="font-family:var(--font-d);font-size:20px;font-weight:800;text-align:center;margin-bottom:12px;letter-spacing:1px">'+MONTHS[month]+' '+year+'</div>';
    html += '<div class="calendar-grid">'+DOWS.map(function(d){return'<div class="cal-header">'+d+'</div>';}).join('')+'</div>';
    html += '<div class="calendar-grid">';

    for(var i=0;i<startDow;i++) html+='<div class="cal-day empty"></div>';
    for(var d=1;d<=lastDay.getDate();d++){
      var key=year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
      var hasW = workoutDates.indexOf(key)>=0;
      var hasI = inputDates.indexOf(key)>=0;
      var isT  = key===today;
      var isS  = key===selectedDate;
      var cls  = 'cal-day'+(hasW&&hasI?' both':hasW?' has-workout':hasI?' has-checkin':'');
      if(isT) cls+=' today';
      if(isS) cls+=' selected';
      html += '<button class="'+cls+'" type="button" data-date="'+key+'" aria-label="View '+key+'" title="'+key+'">'+d+'</button>';
    }
    html += '</div>';

    /* Legend */
    html += '<div style="display:flex;gap:14px;justify-content:center;margin-top:12px">'+
      '<div style="display:flex;align-items:center;gap:5px"><div style="width:10px;height:10px;border-radius:3px;background:var(--lime-dim);border:1px solid var(--lime)"></div><span class="t-hint">Workout</span></div>'+
      '<div style="display:flex;align-items:center;gap:5px"><div style="width:10px;height:10px;border-radius:3px;background:var(--blue-dim);border:1px solid var(--blue)"></div><span class="t-hint">Check-in</span></div>'+
      '<div style="display:flex;align-items:center;gap:5px"><div style="width:10px;height:10px;border-radius:3px;background:linear-gradient(135deg,var(--lime-dim),var(--blue-dim));border:1px solid var(--lime)"></div><span class="t-hint">Both</span></div>'+
    '</div>';
    return html;
  }

  function selectedDaySummary(){
    var input = TF.Store.getInputForDate(selectedDate);
    var workout = TF.Store.getAllWorkoutLogs()[selectedDate];
    var exNames = workout && workout.exercises ? Object.keys(workout.exercises) : [];

    if(!input && !exNames.length){
      return '<div class="card card-sm t-hint" style="text-align:center">No check-in or workout logged for '+TF.UI.formatDate(selectedDate)+'.</div>';
    }

    var blocks = [];
    if(input){
      var score = TF.Score.daily(input);
      blocks.push(
        '<div class="card card-sm" style="margin-bottom:'+(exNames.length?'10px':'0')+'">'+
          '<div class="flex-between" style="margin-bottom:8px">'+
            '<div><div class="t-title">'+TF.UI.formatDate(selectedDate)+'</div><div class="t-hint">Daily check-in logged</div></div>'+
            '<span class="chip chip-lime">'+score+'/100</span>'+
          '</div>'+
          '<div class="t-hint">Sleep '+input.sleepQuality+'/10 · '+input.sleepHours+'h · Energy '+input.energy+'/10 · Focus '+input.focus+'/10</div>'+
        '</div>'
      );
    }

    if(exNames.length){
      var totalSets = exNames.reduce(function(sum, name){
        return sum + (workout.exercises[name] || []).length;
      }, 0);
      var completedSets = exNames.reduce(function(sum, name){
        return sum + (workout.exercises[name] || []).filter(function(set){ return set.done; }).length;
      }, 0);

      blocks.push(
        '<div class="card card-sm">'+
          '<div class="flex-between" style="margin-bottom:8px">'+
            '<div><div class="t-title">Workout session</div><div class="t-hint">'+exNames.length+' exercises · '+completedSets+'/'+totalSets+' sets completed</div></div>'+
            '<span class="chip chip-blue">'+completedSets+'/'+totalSets+'</span>'+
          '</div>'+
          exNames.map(function(name){
            var completed = (workout.exercises[name] || []).filter(function(set){ return set.done; });
            if(!completed.length){
              return '<div style="font-size:12px;color:var(--txt-3);margin-bottom:2px">'+TF.UI.escapeHTML(name)+'</div>';
            }
            var best = Math.max.apply(null, completed.map(function(set){ return parseFloat(set.weight) || 0; }));
            return '<div style="font-size:12px;color:var(--txt-2);margin-bottom:2px">'+TF.UI.escapeHTML(name)+' — best: <strong style="font-family:var(--font-m);color:var(--txt)">'+best+'kg</strong></div>';
          }).join('')+
        '</div>'
      );
    }

    return blocks.join('');
  }

  function recentSessions(){
    var all = TF.Store.getAllWorkoutLogs();
    var sorted = Object.keys(all).sort().reverse().slice(0,10);
    if(!sorted.length) return '<div class="empty-state"><div class="empty-icon">🏋️</div><div class="empty-title">No workout history yet</div><div class="empty-body">Complete your first session and log your sets to see history here.</div></div>';
    return sorted.map(function(dateKey){
      var session = all[dateKey];
      var exNames = session.exercises ? Object.keys(session.exercises) : [];
      var totalSets = exNames.reduce(function(s,n){return s+(session.exercises[n]||[]).length;},0);
      var totalDone = exNames.reduce(function(s,n){return s+(session.exercises[n]||[]).filter(function(st){return st.done;}).length;},0);
      return '<div class="card card-sm" style="margin-bottom:8px">'+
        '<div class="flex-between" style="margin-bottom:8px">'+
          '<div><div class="t-title">'+TF.UI.formatDate(dateKey)+'</div><div class="t-hint">'+exNames.length+' exercises · '+totalDone+'/'+totalSets+' sets logged</div></div>'+
          '<span class="chip chip-'+(totalDone===totalSets?'lime':'blue')+'">'+totalDone+'/'+totalSets+'</span>'+
        '</div>'+
        exNames.map(function(n){
          var sets=(session.exercises[n]||[]).filter(function(s){return s.done&&s.weight;});
          if(!sets.length)return'<div style="font-size:12px;color:var(--txt-3);margin-bottom:2px">'+TF.UI.escapeHTML(n)+'</div>';
          var best=Math.max.apply(null,sets.map(function(s){return parseFloat(s.weight)||0;}));
          return'<div style="font-size:12px;color:var(--txt-2);margin-bottom:2px">'+TF.UI.escapeHTML(n)+' — best: <strong style="font-family:var(--font-m);color:var(--txt)">'+best+'kg</strong></div>';
        }).join('')+
      '</div>';
    }).join('');
  }

  function render(){
    root.innerHTML='<div class="screen">'+
      '<div class="t-headline" style="margin-bottom:4px">'+TF.Icon('calendar',20)+' Workout History</div>'+
      '<div class="t-hint" style="margin-bottom:20px">Tap any date to review your logged check-in and workout data.</div>'+

      /* Calendar navigation */
      '<div class="card" style="margin-bottom:18px">'+
        '<div class="flex-between" style="margin-bottom:14px">'+
          '<button class="topbar-btn" id="cal-prev">'+TF.Icon('chevron-left',15)+'</button>'+
          '<div id="cal-body"></div>'+
          '<button class="topbar-btn" id="cal-next">'+TF.Icon('chevron-right',15)+'</button>'+
        '</div>'+
      '</div>'+

      '<div class="section">'+TF.UI.secHdr('Selected Day')+selectedDaySummary()+'</div>'+

      TF.UI.secHdr('Recent Sessions')+
      recentSessions()+
      '<div style="height:8px"></div></div>';

    /* Render calendar inline */
    root.querySelector('#cal-body').innerHTML = buildCalendar(viewDate.getFullYear(), viewDate.getMonth());

    root.querySelector('#cal-prev').addEventListener('click',function(){
      viewDate.setMonth(viewDate.getMonth()-1); render();
    });
    root.querySelector('#cal-next').addEventListener('click',function(){
      if(viewDate.getFullYear()*12+viewDate.getMonth() < new Date().getFullYear()*12+new Date().getMonth()){
        viewDate.setMonth(viewDate.getMonth()+1); render();
      }
    });
    root.querySelectorAll('.cal-day[data-date]').forEach(function(day){
      day.addEventListener('click',function(){
        selectedDate = day.dataset.date;
        render();
      });
    });
  }
  render();
};
