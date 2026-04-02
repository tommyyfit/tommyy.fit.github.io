TF.Screens.dashboard = function (root) {
  var profile = TF.Store.getProfile();
  var input = TF.Store.getTodayInput();
  var missions = TF.Store.getTodayMissions();
  var nutrition = TF.Store.getTodayNutrition();
  var yesterday = TF.Store.getInputForDate(TF.Store.yesterday());
  var safeName = TF.UI.escapeHTML(profile.name);
  var safeBrandUrl = TF.UI.escapeAttr(TF.Config.brandUrl);
  var hour = new Date().getHours();
  var greet = hour < 12 ? 'Good morning,' : hour < 17 ? 'Good afternoon,' : 'Good evening,';
  var done = missions.filter(function (mission) { return mission.done; }).length;
  var totalMissions = missions.length;
  var habitsDone = TF.Habits.getDoneCount();
  var todayWeekday = new Date().toLocaleDateString('en-GB', { weekday: 'long' });
  var todayDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });

  function scoreTrend() {
    if (!input || !yesterday) return '';
    var todayScore = TF.Score.daily(input);
    var yesterdayScore = TF.Score.daily(yesterday);
    var delta = todayScore - yesterdayScore;
    if (Math.abs(delta) < 2) {
      return '<span style="color:var(--txt-3);font-size:12px;font-weight:600">flat</span>';
    }
    var color = delta > 0 ? 'var(--lime)' : 'var(--red)';
    return '<span style="color:' + color + ';font-size:12px;font-weight:700">' +
      (delta > 0 ? '+' : '-') + Math.abs(delta) + ' vs yesterday</span>';
  }

  function sparkline() {
    var inputs = TF.Store.getLastNInputs(7).reverse();
    if (inputs.length < 2) return '';
    var scores = inputs.map(function (item) { return TF.Score.daily(item); });
    var width = 100;
    var height = 28;
    var pad = 3;
    var min = Math.min.apply(null, scores);
    var max = Math.max.apply(null, scores);
    var range = max - min || 1;
    var points = scores.map(function (value, index) {
      var x = pad + (index / (scores.length - 1)) * (width - pad * 2);
      var y = height - pad - ((value - min) / range) * (height - pad * 2);
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    var lastScore = scores[scores.length - 1];
    var color = lastScore >= 74 ? 'var(--lime)' : lastScore >= 52 ? 'var(--blue)' : 'var(--red)';
    return '<svg width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '" style="margin-top:4px">' +
      '<polyline fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="' + points + '"/>' +
      '</svg>';
  }

  function scoreHero() {
    var score = TF.Score.daily(input);
    var recovery = TF.Score.recovery(input);
    var discipline = TF.Score.discipline(input);
    var color = TF.Score.color(score);
    var label = TF.Score.label(score);
    var bg = TF.Score.bg(score);
    var glow = TF.Score.glow(score);

    return '<div class="score-hero" id="score-hero-el">' +
      '<div class="score-hero-glow" style="background:' + glow + '"></div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
      '<div class="t-label">DAILY FOCUS SCORE</div>' +
      scoreTrend() +
      '</div>' +
      '<div style="display:flex;align-items:flex-end;gap:12px">' +
      '<div class="score-num" id="score-num-el" style="color:' + color + '">0</div>' +
      '<div style="padding-bottom:6px">' +
      '<div><span class="score-badge" style="background:' + bg + ';color:' + color + '">' + label + '</span></div>' +
      sparkline() +
      '</div>' +
      '</div>' +
      '<div class="score-subs">' +
      '<div class="score-sub"><div class="score-sub-val" style="color:var(--blue)">' + recovery + '</div><div class="score-sub-label">Recovery</div></div>' +
      '<div class="score-divider"></div>' +
      '<div class="score-sub"><div class="score-sub-val" style="color:var(--amber)">' + discipline + '</div><div class="score-sub-label">Discipline</div></div>' +
      '<div class="score-divider"></div>' +
      '<div class="score-sub"><div class="score-sub-val" style="color:var(--purple)">' + input.sleepQuality + '/10</div><div class="score-sub-label">Sleep</div></div>' +
      '</div>' +
      '</div>';
  }

  function checkinCard() {
    return '<div class="card card-glow" id="cta-checkin" style="cursor:pointer;display:flex;align-items:center;gap:15px;padding:16px">' +
      '<div style="width:50px;height:50px;border-radius:14px;background:var(--lime-dim);border:1px solid var(--lime-mid);display:flex;align-items:center;justify-content:center;flex-shrink:0">' + TF.Icon('zap', 22) + '</div>' +
      '<div style="flex:1">' +
      '<div class="t-title" style="color:var(--lime);margin-bottom:3px">Daily Check-in</div>' +
      '<div class="t-hint">30 seconds to unlock your score and missions</div>' +
      '</div>' +
      '<div style="color:var(--txt-3)">' + TF.Icon('arrow-right', 18) + '</div>' +
      '</div>';
  }

  function missionSummary() {
    if (!totalMissions) {
      return '<div class="card card-sm t-hint" style="text-align:center">Complete Check-in to unlock today\'s missions.</div>';
    }
    var pct = done / totalMissions;
    var allDone = done === totalMissions;
    var xpTotal = missions.reduce(function (sum, mission) { return sum + mission.xpReward; }, 0);
    var xpDone = missions.filter(function (mission) { return mission.done; }).reduce(function (sum, mission) { return sum + mission.xpReward; }, 0);

    return '<div class="card card-sm">' +
      '<div class="flex-between" style="margin-bottom:8px">' +
      '<span class="t-title">' + done + '/' + totalMissions + ' missions</span>' +
      '<span class="t-mono" style="font-size:18px;font-weight:800;color:' + (allDone ? 'var(--lime)' : 'var(--blue)') + '">' + xpDone + ' XP</span>' +
      '</div>' +
      TF.UI.bar(pct, allDone ? 'var(--lime)' : 'var(--blue)') +
      (allDone ? '<div style="margin-top:8px;font-size:13px;color:var(--lime);font-weight:600">Full clear. ' + xpTotal + ' XP earned.</div>' : '') +
      '</div>';
  }

  function splitBadge(plan) {
    if (plan.splitKey === 'push') return 'PU';
    if (plan.splitKey === 'pull') return 'PL';
    if (plan.splitKey === 'legs') return 'LG';
    if (plan.splitKey === 'recovery') return 'RC';
    return 'WK';
  }

  function nextWorkoutCard() {
    var plan = TF.Workout.getToday(profile, input);
    var color = plan.splitKey === 'recovery' ? 'var(--teal)' : plan.splitKey === 'push' ? 'var(--amber)' : plan.splitKey === 'pull' ? 'var(--blue)' : 'var(--purple)';

    return '<div class="card card-sm" id="cta-workout" style="cursor:pointer;display:flex;align-items:center;gap:12px;padding:14px">' +
      '<div style="width:42px;height:42px;border-radius:11px;background:var(--bg-3);border:1px solid ' + color + ';display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:' + color + ';flex-shrink:0">' + splitBadge(plan) + '</div>' +
      '<div style="flex:1">' +
      '<div style="font-size:13px;font-weight:700;color:' + color + ';margin-bottom:2px">' + plan.title + '</div>' +
      '<div class="t-hint">' + plan.estimatedMinutes + ' min - ' + plan.exercises.length + ' exercises</div>' +
      '</div>' +
      TF.Icon('arrow-right', 16) +
      '</div>';
  }

  function habitsSummary() {
    var total = TF.Config.DefaultHabits.length;
    var pct = total > 0 ? habitsDone / total : 0;
    var color = habitsDone === total ? 'var(--lime)' : habitsDone >= total * 0.5 ? 'var(--blue)' : 'var(--txt-3)';

    return '<div class="card card-sm" id="cta-habits" style="cursor:pointer">' +
      '<div class="flex-between" style="margin-bottom:6px">' +
      '<span class="t-title">Daily Habits</span>' +
      '<span class="t-mono" style="font-weight:700;color:' + color + '">' + habitsDone + '/' + total + '</span>' +
      '</div>' +
      TF.UI.bar(pct, habitsDone === total ? 'var(--lime)' : 'var(--blue)') +
      '</div>';
  }

  root.innerHTML = '<div class="screen">' +
    '<div class="flex-between" style="margin-bottom:18px">' +
    '<div><div class="t-hint" style="margin-bottom:2px">' + greet + '</div><div class="t-headline">' + safeName + '</div></div>' +
    '<button class="btn btn-sm btn-lime-ghost" id="btn-checkin-top" style="gap:5px;align-self:flex-start">' + TF.Icon('plus', 12) + ' Check-in</button>' +
    '</div>' +

    '<div class="hero-img-card dashboard-hero" id="dash-hero" style="margin-bottom:14px">' +
    '<div class="skeleton" style="position:absolute;inset:0;border-radius:var(--r-lg)"></div>' +
    '<div class="hero-img-card-content dashboard-hero-content">' +
    '<div class="dashboard-hero-copy">' +
    '<div class="dashboard-hero-badge">DAILY PERFORMANCE</div>' +
    '<div class="dashboard-hero-title">' + todayWeekday + '</div>' +
    '<div class="dashboard-hero-subtitle">' + todayDate + '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +

    (input ? scoreHero() : checkinCard()) +

    '<div style="margin-top:12px">' + TF.UI.xpRow(profile) + '</div>' +

    '<div class="section" style="margin-top:20px">' +
    TF.UI.secHdr("Today's Missions", '<button class="btn btn-sm btn-ghost" id="btn-all-missions" style="padding:5px 10px;font-size:10px">VIEW ALL</button>') +
    missionSummary() +
    '</div>' +

    '<div class="section">' +
    TF.UI.secHdr("Today's Workout") +
    nextWorkoutCard() +
    '</div>' +

    '<div class="section">' +
    TF.UI.secHdr('Habits') +
    habitsSummary() +
    '</div>' +

    (input ? '<div class="section">' + TF.UI.secHdr('Coach Insights') + TF.Score.insights(input, nutrition).slice(0, 3).map(TF.UI.insightCard).join('') + '</div>' : '') +

    '<div class="section">' +
    TF.UI.secHdr('Daily Dispatch') +
    '<div id="quote-card" class="quote-card"><div class="t-hint" style="font-style:italic;animation:pulse 1.4s infinite">Forging today\'s dispatch...</div></div>' +
    '</div>' +


    '</div>';

root.addEventListener('click', function(e){
  var el = e.target.closest('#more-level-card');
  if (el) {
    TF.UI.modal({
      icon: 'trophy',
      title: 'Level Guide',
      html: TF.UI.buildLevelGuide(),
      cancelText: 'Close',
      confirmText: 'Open Profile',
      onConfirm: function() {
        TF.Router.navigate('profile');
      }
    });
  }
});

  var heroEl = root.querySelector('#dash-hero');
  if (heroEl) TF.UI.setHeroImg(heroEl, TF.Config.Images.dashboard);

  if (input) {
    setTimeout(function () {
      TF.UI.animateScore(root.querySelector('#score-num-el'), TF.Score.daily(input), TF.Score.color(TF.Score.daily(input)));
    }, 100);
  }

  var ctaBtn = root.querySelector('#cta-checkin');
  if (ctaBtn) ctaBtn.addEventListener('click', function () { TF.Router.navigate('checkin'); });
  root.querySelector('#btn-checkin-top').addEventListener('click', function () { TF.Router.navigate('checkin'); });
  var allM = root.querySelector('#btn-all-missions');
  if (allM) allM.addEventListener('click', function () { TF.Router.navigate('missions'); });
  var workoutBtn = root.querySelector('#cta-workout');
  if (workoutBtn) workoutBtn.addEventListener('click', function () { TF.Router.navigate('workout'); });
  var habitsBtn = root.querySelector('#cta-habits');
  if (habitsBtn) habitsBtn.addEventListener('click', function () { TF.Router.navigate('habits'); });

  function renderQuote(q) {
    var quoteEl = root.querySelector('#quote-card');
    if (!quoteEl) return;
    quoteEl.innerHTML = '<div class="quote-card-cat">' + TF.UI.escapeHTML((q.cat || 'stoic').toUpperCase()) + '</div>' +
      '<div class="quote-text">"' + TF.UI.escapeHTML(q.text) + '"</div>' +
      '<div class="quote-author">- ' + TF.UI.escapeHTML(q.author) + '</div>' +
      '<button class="quote-copy-btn" id="btn-copy-quote" title="Copy quote">' + TF.Icon('copy', 12) + '</button>';

    quoteEl.querySelector('#btn-copy-quote').addEventListener('click', function () {
      var quoteLine = '"' + q.text + '" - ' + q.author;
      TF.UI.copyText(quoteLine).then(function () {
        TF.UI.toast('Quote copied.', 'success');
      }).catch(function () {
        TF.UI.toast('Clipboard blocked.', 'error');
      });
    });
  }

  function refreshQuote(forceRefresh) {
    TF.Quotes.getCurrent(forceRefresh).then(function (q) {
      renderQuote(TF.Quotes.normalise(q));
    });
  }

  var quoteInterval = null;
  refreshQuote(true);
  quoteInterval = setInterval(function () {
    refreshQuote(true);
  }, 60000);

  root._screenCleanup = function () {
    if (quoteInterval) clearInterval(quoteInterval);
    quoteInterval = null;
  };

  TF.UI.checkStorageAndWarn();
};