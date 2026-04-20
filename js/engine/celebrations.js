TF.Celebrations = (function() {
  'use strict';

  var STORAGE_KEY = 'tf_celebrations';
  var STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

  function loadSeen() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (error) {
      return {};
    }
  }

  function saveSeen(seen) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seen || {}));
    } catch (error) {}
  }

  function markOnce(token) {
    var today = TF.Store.todayKey();
    var seen = loadSeen();
    if (seen[token] === today) {
      return false;
    }
    seen[token] = today;
    saveSeen(seen);
    return true;
  }

  function maybeCelebrateCheckinStreak(streakDays) {
    if (STREAK_MILESTONES.indexOf(streakDays) === -1) {
      return;
    }
    if (!markOnce('checkin_streak_' + streakDays)) {
      return;
    }
    TF.UI.haptic(90);
    TF.UI.confetti({ particleCount: 90, spread: 72, origin: { y: 0.62 } });
    TF.UI.toast(streakDays + '-day streak locked in.', 'success', 3200);
  }

  function maybeCelebrateHabitMilestone(habit, streakInfo) {
    var streak = streakInfo && streakInfo.current || 0;
    if (!habit || STREAK_MILESTONES.indexOf(streak) === -1) {
      return;
    }
    if (!markOnce('habit_' + habit.id + '_' + streak)) {
      return;
    }
    TF.UI.haptic(70);
    TF.UI.confetti({ particleCount: 55, spread: 54, origin: { y: 0.72 } });
    TF.UI.toast(habit.label + ': ' + streak + '-day streak.', 'success', 2600);
  }

  function maybeCelebratePerfectHabits(done, total) {
    if (!total || done !== total) {
      return;
    }
    if (!markOnce('perfect_habits_day')) {
      return;
    }
    TF.UI.haptic(85);
    TF.UI.confetti({ particleCount: 110, spread: 78, origin: { y: 0.62 } });
    TF.UI.toast('Perfect habits day. Every box checked.', 'success', 3200);
  }

  return {
    maybeCelebrateCheckinStreak: maybeCelebrateCheckinStreak,
    maybeCelebrateHabitMilestone: maybeCelebrateHabitMilestone,
    maybeCelebratePerfectHabits: maybeCelebratePerfectHabits
  };
})();
