TF.Rewards = (function() {
  'use strict';

  var CLAIMS_KEY = 'tf_weekly_rewards_claims';

  function getWeekStartKey(date) {
    var value = date ? new Date(date) : new Date();
    var day = value.getDay();
    var diff = day === 0 ? -6 : 1 - day;
    value.setHours(12, 0, 0, 0);
    value.setDate(value.getDate() + diff);
    return value.getFullYear() + '-' + String(value.getMonth() + 1).padStart(2, '0') + '-' + String(value.getDate()).padStart(2, '0');
  }

  function loadClaims() {
    try {
      return JSON.parse(localStorage.getItem(CLAIMS_KEY) || '{}');
    } catch (error) {
      return {};
    }
  }

  function saveClaims(claims) {
    try {
      localStorage.setItem(CLAIMS_KEY, JSON.stringify(claims || {}));
    } catch (error) {}
  }

  function getRecentMissionStats(weekKey) {
    var all = TF.Store.getAllMissions();
    var done = 0;
    var total = 0;
    Object.keys(all || {}).forEach(function(key) {
      if (key < weekKey) {
        return;
      }
      total += (all[key] || []).length;
      done += (all[key] || []).filter(function(mission) {
        return mission.done;
      }).length;
    });
    return { done: done, total: total };
  }

  function getRecentHabitRate(weekKey) {
    var all = TF.Store.getAllHabits();
    var total = 0;
    var done = 0;
    Object.keys(all || {}).forEach(function(key) {
      if (key < weekKey) {
        return;
      }
      Object.keys(all[key] || {}).forEach(function(id) {
        total += 1;
        done += all[key][id] ? 1 : 0;
      });
    });
    return total ? done / total : 0;
  }

  function getCurrentWeekRewardStatus() {
    var weekKey = getWeekStartKey();
    var claims = loadClaims();
    var inputs = TF.Store.getLastNInputs(7).filter(function(entry) {
      return entry.dateKey >= weekKey;
    });
    var avgScore = inputs.length
      ? inputs.reduce(function(sum, item) { return sum + TF.Score.daily(item); }, 0) / inputs.length
      : 0;
    var missionStats = getRecentMissionStats(weekKey);
    var missionRate = missionStats.total ? missionStats.done / missionStats.total : 0;
    var habitRate = getRecentHabitRate(weekKey);
    var reward = {
      weekKey: weekKey,
      claimed: !!claims[weekKey],
      eligible: false,
      xp: 110,
      shields: 0,
      title: 'Consistency reward locked',
      copy: 'Log 5 check-ins this week to unlock your wrap-up reward.',
      progressLabel: inputs.length + '/5 check-ins',
      tier: 'locked'
    };

    if (inputs.length >= 5 && avgScore >= 75) {
      reward.eligible = true;
      reward.xp = 180;
      reward.shields = 1;
      reward.title = 'Elite week reward ready';
      reward.copy = 'You kept the standard high all week. Claim a shield and bonus XP for the next push.';
      reward.progressLabel = Math.round(avgScore) + ' avg score';
      reward.tier = 'elite';
    } else if (inputs.length >= 5) {
      reward.eligible = true;
      reward.xp = 110;
      reward.shields = missionRate >= 0.75 && habitRate >= 0.7 ? 1 : 0;
      reward.title = 'Weekly consistency reward ready';
      reward.copy = reward.shields
        ? 'Five check-ins plus strong mission and habit follow-through earned you a shield too.'
        : 'Five check-ins logged. Keep stacking clean weeks and the rewards get better.';
      reward.progressLabel = Math.round(missionRate * 100) + '% mission completion';
      reward.tier = 'solid';
    } else if (inputs.length >= 3) {
      reward.copy = 'You are halfway there. Two more check-ins this week unlock the weekly reward.';
      reward.progressLabel = inputs.length + '/5 check-ins';
      reward.tier = 'building';
    }

    return reward;
  }

  function claimCurrentWeekReward() {
    var reward = getCurrentWeekRewardStatus();
    var claims;
    if (!reward.eligible || reward.claimed) {
      return {
        ok: false,
        reward: reward
      };
    }
    claims = loadClaims();
    claims[reward.weekKey] = {
      claimedAt: new Date().toISOString(),
      xp: reward.xp,
      shields: reward.shields
    };
    saveClaims(claims);
    TF.Store.grantXP(reward.xp);
    if (reward.shields > 0) {
      TF.Store.setShields(TF.Store.getShields() + reward.shields);
    }
    reward.claimed = true;
    return {
      ok: true,
      reward: reward
    };
  }

  return {
    claimCurrentWeekReward: claimCurrentWeekReward,
    getCurrentWeekRewardStatus: getCurrentWeekRewardStatus
  };
})();
