TF.Screens['weekly-review'] = function(root) {
  function draw() {
    var inputs7 = TF.Store.getLastNInputs(7).reverse();
    var inputs14 = TF.Store.getLastNInputs(14).reverse();
    var thisWeek = inputs7;
    var thisWeekKeys = inputs7.reduce(function(acc, item) {
      acc[item.dateKey] = true;
      return acc;
    }, {});
    var lastWeek = inputs14.filter(function(item) {
      return !thisWeekKeys[item.dateKey];
    });
    var reward = TF.Rewards.getCurrentWeekRewardStatus();

    function avg(arr, field) {
      if (!arr.length) return 0;
      return arr.reduce(function(sum, item) { return sum + (item[field] || 0); }, 0) / arr.length;
    }

    function dailyScores(arr) {
      return arr.map(function(item) { return TF.Score.daily(item); });
    }

    function recentMissionStats() {
      var all = TF.Store.getAllMissions();
      var done = 0;
      var total = 0;
      Object.keys(all || {}).forEach(function(key) {
        if (key >= reward.weekKey) {
          total += (all[key] || []).length;
          done += (all[key] || []).filter(function(mission) { return mission.done; }).length;
        }
      });
      return { done: done, total: total };
    }

    function metricRow(label, thisVal, lastVal, format, lowerIsBetter) {
      var diff = thisVal - lastVal;
      var improved = lowerIsBetter ? diff < 0 : diff > 0;
      var neutral = Math.abs(diff) < 0.1;
      var arrowColor = neutral ? 'var(--txt-3)' : improved ? 'var(--lime)' : 'var(--red)';
      var arrowSymbol = neutral ? '→' : improved ? '↑' : '↓';
      var diffText = neutral ? 'flat' : (improved ? '+' : '') + (lowerIsBetter && diff > 0 ? '+' : '') + diff.toFixed(1);
      if (lowerIsBetter && diff < 0) diffText = diff.toFixed(1);
      return '<div class="review-metric">' +
        '<span class="t-title">' + label + '</span>' +
        '<div style="display:flex;align-items:center;gap:8px">' +
          '<span style="font-family:var(--font-m);font-size:15px;font-weight:700">' + (format ? format(thisVal) : thisVal.toFixed(1)) + '</span>' +
          (lastVal > 0 ? '<span style="font-size:12px;font-weight:700;color:' + arrowColor + '">' + arrowSymbol + ' ' + Math.abs(diff).toFixed(1) + '</span>' : '') +
        '</div>' +
      '</div>';
    }

    function recommendation(thisAvg) {
      if (!thisWeek.length) return 'Start logging check-ins to unlock a real weekly review and reward.';
      var avgSleep = avg(thisWeek, 'sleepQuality');
      var avgStress = avg(thisWeek, 'stress');
      var avgEnergy = avg(thisWeek, 'energy');
      if (avgSleep < 5) return 'Sleep is still the bottleneck. Protect bedtime first, then chase performance.';
      if (avgStress > 7) return 'Stress is crowding out recovery. Add one deliberate downshift block every day next week.';
      if (avgEnergy < 5) return 'Energy is low enough to justify a lighter training week and cleaner recovery focus.';
      if (thisAvg >= 80) return 'Elite week. Keep the routine stable and push progressive overload where recovery supports it.';
      if (thisAvg >= 65) return 'Solid week. Find the condition behind your best day and recreate it on purpose.';
      return 'Build the floor: daily check-ins, protein, and one clean workout. Consistency first.';
    }

    function rewardCard() {
      var chips = '<div class="reward-chip-row">' +
        '<span class="reward-chip"><strong>' + reward.progressLabel + '</strong></span>' +
        '<span class="reward-chip">XP <strong>' + reward.xp + '</strong></span>' +
        (reward.shields ? '<span class="reward-chip">Shield <strong>+' + reward.shields + '</strong></span>' : '') +
      '</div>';
      return '<div class="reward-card" style="margin-bottom:18px">' +
        '<div class="reward-card-top">' +
          '<div>' +
            '<div class="starter-guide-kicker">WEEKLY WRAP-UP</div>' +
            '<div class="reward-card-title">' + reward.title + '</div>' +
          '</div>' +
          (reward.claimed ? '<span class="chip chip-blue">CLAIMED</span>' : reward.eligible ? '<span class="chip chip-lime">READY</span>' : '<span class="chip chip-amber">IN PROGRESS</span>') +
        '</div>' +
        '<div class="reward-card-copy">' + reward.copy + '</div>' +
        chips +
        (reward.claimed
          ? '<div class="celebration-note">Reward claimed for this week. Keep the streak alive.</div>'
          : reward.eligible
            ? '<button class="btn btn-primary" id="btn-claim-weekly" type="button">Claim weekly reward</button>'
            : '<button class="btn btn-ghost" id="btn-open-checkin" type="button">Log next check-in</button>') +
      '</div>';
    }

    function emptyGuide() {
      return '<div class="starter-guide">' +
        '<div class="starter-guide-kicker">NOT ENOUGH DATA YET</div>' +
        '<div class="starter-guide-title">Your weekly review will show up fast</div>' +
        '<div class="starter-guide-copy">You only need three check-ins this week to unlock the comparison cards below. Five check-ins unlock the weekly reward.</div>' +
        '<div class="starter-guide-list">' +
          '<div class="starter-guide-step"><div class="starter-guide-num">1</div><div><strong>Check in daily</strong> so focus and recovery patterns have enough signal.</div></div>' +
          '<div class="starter-guide-step"><div class="starter-guide-num">2</div><div><strong>Complete missions</strong> to build the wrap-up reward faster.</div></div>' +
          '<div class="starter-guide-step"><div class="starter-guide-num">3</div><div><strong>Review again this weekend</strong> once you have 3-5 entries logged.</div></div>' +
        '</div>' +
        '<div class="starter-guide-actions">' +
          '<button class="btn btn-primary btn-sm" id="wr-cta-checkin" type="button">Check-in</button>' +
          '<button class="btn btn-ghost btn-sm" id="wr-cta-missions" type="button">Missions</button>' +
        '</div>' +
      '</div>';
    }

    var thisScores = dailyScores(thisWeek);
    var lastScores = dailyScores(lastWeek);
    var thisAvg = thisScores.length ? thisScores.reduce(function(sum, value) { return sum + value; }, 0) / thisScores.length : 0;
    var lastAvg = lastScores.length ? lastScores.reduce(function(sum, value) { return sum + value; }, 0) / lastScores.length : 0;
    var bestDay = thisWeek.length ? thisWeek.reduce(function(best, item) { return TF.Score.daily(item) > TF.Score.daily(best) ? item : best; }, thisWeek[0]) : null;
    var worstDay = thisWeek.length ? thisWeek.reduce(function(worst, item) { return TF.Score.daily(item) < TF.Score.daily(worst) ? item : worst; }, thisWeek[0]) : null;
    var allMs7 = recentMissionStats();

    root.innerHTML = '<div class="screen">' +
      '<div class="hero-img-card hero-short" id="wr-hero">' +
        '<div class="skeleton" style="position:absolute;inset:0;border-radius:var(--r-lg)"></div>' +
        '<div class="hero-img-card-content">' +
          '<div class="t-label">WEEKLY REVIEW</div>' +
          '<div class="t-headline">Last 7 days.<br>Real patterns.</div>' +
          '<div class="t-hint">' + (new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })) + ' snapshot</div>' +
        '</div>' +
      '</div>' +

      rewardCard() +

      (thisWeek.length < 3
        ? emptyGuide()
        : '<div class="grid-2" style="margin-bottom:16px">' +
            '<div class="stat-tile"><div class="stat-val" style="color:' + (thisAvg >= 74 ? 'var(--lime)' : thisAvg >= 52 ? 'var(--blue)' : 'var(--red)') + '">' + Math.round(thisAvg) + '</div><div class="stat-unit">avg score</div><div class="stat-label">This week</div></div>' +
            '<div class="stat-tile"><div class="stat-val" style="color:var(--txt-2)">' + Math.round(lastAvg || 0) + '</div><div class="stat-unit">avg score</div><div class="stat-label">Last week</div></div>' +
          '</div>' +

          '<div class="card" style="margin-bottom:16px">' +
            TF.UI.secHdr('Metric Comparison', '<span class="t-hint">this vs last week</span>') +
            (lastWeek.length
              ? metricRow('Focus Score', thisAvg, lastAvg) +
                metricRow('Sleep Quality', avg(thisWeek, 'sleepQuality'), avg(lastWeek, 'sleepQuality')) +
                metricRow('Energy', avg(thisWeek, 'energy'), avg(lastWeek, 'energy')) +
                metricRow('Mood', avg(thisWeek, 'mood'), avg(lastWeek, 'mood')) +
                metricRow('Stress', avg(thisWeek, 'stress'), avg(lastWeek, 'stress'), null, true)
              : '<div class="t-hint" style="padding:8px 0;text-align:center">Need 2 full weeks of data for comparison.</div>') +
          '</div>' +

          (bestDay && worstDay
            ? '<div class="grid-2" style="margin-bottom:16px">' +
                '<div class="card card-sm"><div class="t-label" style="color:var(--lime);margin-bottom:6px">Best day</div><div class="t-title">' + TF.UI.dayLabel(bestDay.dateKey) + '</div><div class="t-mono" style="font-size:24px;font-weight:800;color:var(--lime);margin:4px 0">' + TF.Score.daily(bestDay) + '</div><div class="t-hint" style="font-size:10px">Sleep ' + (bestDay.sleepQuality || '?') + '/10 · Energy ' + (bestDay.energy || '?') + '/10</div></div>' +
                '<div class="card card-sm"><div class="t-label" style="color:var(--red);margin-bottom:6px">Hardest day</div><div class="t-title">' + TF.UI.dayLabel(worstDay.dateKey) + '</div><div class="t-mono" style="font-size:24px;font-weight:800;color:var(--red);margin:4px 0">' + TF.Score.daily(worstDay) + '</div><div class="t-hint" style="font-size:10px">Stress ' + (worstDay.stress || '?') + '/10 · Sleep ' + (worstDay.sleepQuality || '?') + '/10</div></div>' +
              '</div>'
            : '') +

          '<div class="card" style="margin-bottom:16px">' +
            '<div class="t-label" style="margin-bottom:6px">Missions this week</div>' +
            '<div style="font-family:var(--font-m);font-size:28px;font-weight:800;color:var(--lime);margin-bottom:4px">' + allMs7.done + '/' + allMs7.total + '</div>' +
            (allMs7.total ? TF.UI.bar(allMs7.done / allMs7.total, 'var(--lime)') : '<div class="t-hint">No missions this week yet.</div>') +
          '</div>' +

          '<div class="card card-glow">' +
            '<div class="t-label" style="margin-bottom:8px">NEXT-WEEK FOCUS</div>' +
            '<div style="font-size:14px;line-height:1.7">' + recommendation(thisAvg) + '</div>' +
          '</div>') +

      '<div style="height:8px"></div></div>';

    TF.UI.setHeroImg(root.querySelector('#wr-hero'), TF.Config.Images.progress);

    var claimBtn = root.querySelector('#btn-claim-weekly');
    if (claimBtn) {
      claimBtn.addEventListener('click', function() {
        var result = TF.Rewards.claimCurrentWeekReward();
        if (!result.ok) {
          TF.UI.toast('Weekly reward is not ready yet.', 'error');
          return;
        }
        TF.UI.haptic(90);
        TF.UI.confetti({ particleCount: 140, spread: 86, origin: { y: 0.6 } });
        TF.UI.toast('Weekly reward claimed: +' + result.reward.xp + ' XP' + (result.reward.shields ? ' and +' + result.reward.shields + ' shield' : ''), 'success', 3600);
        draw();
      });
    }
    var openCheckinBtn = root.querySelector('#btn-open-checkin');
    if (openCheckinBtn) openCheckinBtn.addEventListener('click', function() {
      TF.Router.navigate('checkin');
    });
    var reviewCheckinBtn = root.querySelector('#wr-cta-checkin');
    if (reviewCheckinBtn) reviewCheckinBtn.addEventListener('click', function() {
      TF.Router.navigate('checkin');
    });
    var reviewMissionsBtn = root.querySelector('#wr-cta-missions');
    if (reviewMissionsBtn) reviewMissionsBtn.addEventListener('click', function() {
      TF.Router.navigate('missions');
    });
  }

  draw();
};
