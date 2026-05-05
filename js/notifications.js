/* ================================================================
   NOTIFICATIONS v5.7 — In-App Notification Center
   Pure localStorage, zero external deps.
   ================================================================ */
var TF = window.TF || {};
window.TF = TF;

TF.Notifications = (function () {
  'use strict';
  var KEY = 'tf_notif_v1';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  }
  function save(arr) {
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (e) {}
  }

  function add(n) {
    var items = load();
    if (n.id && items.some(function (x) { return x.id === n.id; })) return;
    items.unshift({ id: n.id || ('n_' + Date.now()), type: n.type || 'info', title: n.title || '', body: n.body || '', ts: Date.now(), read: false });
    save(items.slice(0, 50));
  }

  function dismiss(id) {
    save(load().filter(function (n) { return n.id !== id; }));
    updateBadge();
  }

  function clearAll() { save([]); updateBadge(); }

  function markAllRead() {
    save(load().map(function (n) { return Object.assign({}, n, { read: true }); }));
    updateBadge();
  }

  function getUnreadCount() {
    return load().filter(function (n) { return !n.read; }).length;
  }

  function updateBadge() {
    var badge = document.getElementById('notif-badge');
    var count = getUnreadCount();
    if (!badge) return;
    badge.textContent = count > 9 ? '9+' : String(count);
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  /* ── Auto-generate smart notifications ── */
  function generateAutoNotifications() {
    var today = TF.Store.todayKey();
    var hour = new Date().getHours();

    /* Check-in reminder */
    if (!TF.Store.getTodayInput() && hour >= 7) {
      add({ id: 'checkin_' + today, type: 'reminder', title: 'Daily check-in pending', body: 'Log your metrics to unlock today\'s score, missions, and training recommendation.' });
    }

    /* Streak warnings — habits with streak ≥ 3 not done today */
    if (TF.Habits && TF.Store) {
      var streaks = TF.Store.getHabitStreaks ? TF.Store.getHabitStreaks() : {};
      var todayHabits = TF.Store.getTodayHabits ? TF.Store.getTodayHabits() : {};
      var atRisk = TF.Config.DefaultHabits.filter(function (h) {
        return (streaks[h.id] || {}).current >= 3 && !todayHabits[h.id];
      });
      if (atRisk.length > 0) {
        add({
          id: 'streak_' + today,
          type: 'warning',
          title: atRisk.length + ' streak' + (atRisk.length > 1 ? 's' : '') + ' at risk',
          body: atRisk.slice(0, 3).map(function (h) { return h.emoji + ' ' + h.label; }).join(' · ') + (atRisk.length > 3 ? ' +' + (atRisk.length - 3) + ' more' : '')
        });
      }
    }

    /* v5.8 — Smart Goal Nudges: Calories / Protein off-track */
    var todayNutrition = TF.Store.getTodayNutrition ? TF.Store.getTodayNutrition() : {};
    var profile = TF.Store.getProfile ? TF.Store.getProfile() : {};
    if (hour >= 15 && todayNutrition) {
      var loggedCal = todayNutrition.calories || 0;
      var loggedPro = todayNutrition.protein || 0;
      var targetCal = profile.targetCalories || 0;
      var targetPro = profile.targetProtein || 0;

      if (targetCal > 0 && loggedCal > 0) {
        var calPct = loggedCal / targetCal;
        if (calPct < 0.6) {
          add({
            id: 'cal_low_' + today,
            type: 'warning',
            title: 'Calories well below target',
            body: 'Logged: ' + loggedCal + ' kcal vs target ' + targetCal + ' kcal. Under-eating slows recovery and muscle growth.'
          });
        } else if (calPct > 1.3) {
          add({
            id: 'cal_high_' + today,
            type: 'info',
            title: 'Calories above target today',
            body: 'Logged: ' + loggedCal + ' kcal vs target ' + targetCal + ' kcal. Check if this fits your weekly average.'
          });
        }
      }

      if (targetPro > 0 && loggedPro > 0 && loggedPro < targetPro * 0.7) {
        /* Find highest-leverage habit for protein */
        add({
          id: 'protein_low_' + today,
          type: 'warning',
          title: 'Protein behind target',
          body: 'Only ' + loggedPro + 'g logged vs ' + targetPro + 'g target. Add a protein shake or lean meal before end of day.'
        });
      }
    }

    /* v5.8 — Highest-leverage habit nudge (if habit streak at risk, suggest best correlated habit) */
    if (TF.Trends && hour >= 12) {
      var declining = TF.Trends.getDecliningMetrics();
      if (declining.length > 0) {
        var worst = declining[0];
        var suggestion = worst.metric === 'sleep' || worst.metric === 'sleepHrs'
          ? '🌙 Early bed (22:00) + No screens 1h before'
          : worst.metric === 'energy'
          ? '☀️ Morning walk / sunlight + Cold shower'
          : worst.metric === 'focus'
          ? '🧘 Meditation / breathwork + Gratitude journal'
          : '🔄 Review your recovery habits';
        add({
          id: 'trend_nudge_' + today + '_' + worst.metric,
          type: 'info',
          title: worst.label + ' declining — highest leverage fix',
          body: suggestion
        });
      }
    }

    /* PR alerts from today's workout */
    var wLog = TF.Store.getTodayWorkoutLog ? TF.Store.getTodayWorkoutLog() : null;
    if (wLog && wLog.exercises) {
      Object.keys(wLog.exercises).forEach(function (exName) {
        (wLog.exercises[exName] || []).forEach(function (set) {
          if (set.done && set.pr) {
            add({ id: 'pr_' + today + '_' + exName.replace(/\W/g, ''), type: 'success', title: '🏆 New PR — ' + exName, body: (set.weight || '?') + ' kg × ' + (set.reps || '?') + ' reps. New personal record logged.' });
          }
        });
      });
    }

    updateBadge();
  }

  /* ── Time helper ── */
  function timeAgo(ts) {
    var d = Math.floor((Date.now() - ts) / 1000);
    if (d < 60) return 'just now';
    if (d < 3600) return Math.floor(d / 60) + 'm ago';
    if (d < 86400) return Math.floor(d / 3600) + 'h ago';
    return Math.floor(d / 86400) + 'd ago';
  }

  /* ── Render dropdown panel ── */
  function renderPanel() {
    var existing = document.getElementById('notif-panel');
    if (existing) { existing.remove(); return; }

    markAllRead();
    updateBadge();

    var items = load();
    var typeIcon = { reminder: '🔔', warning: '⚠️', success: '✅', info: 'ℹ️' };
    var typeClr  = { reminder: 'var(--blue)', warning: 'var(--amber)', success: 'var(--lime)', info: 'var(--txt-3)' };

    var listHTML = items.length === 0
      ? '<div style="padding:32px 20px;text-align:center;color:var(--txt-3);font-size:13px">All clear — no notifications</div>'
      : items.map(function (n) {
          return '<div class="notif-item" data-notif-id="' + n.id + '">' +
            '<div class="notif-item-icon" style="color:' + (typeClr[n.type] || 'var(--txt-3)') + '">' + (typeIcon[n.type] || 'ℹ️') + '</div>' +
            '<div class="notif-item-body">' +
              '<div class="notif-item-title">' + (TF.UI ? TF.UI.escapeHTML(n.title) : n.title) + '</div>' +
              '<div class="notif-item-text">' + (TF.UI ? TF.UI.escapeHTML(n.body) : n.body) + '</div>' +
              '<div class="notif-item-time">' + timeAgo(n.ts) + '</div>' +
            '</div>' +
            '<button class="notif-dismiss" data-dismiss-id="' + n.id + '" type="button" aria-label="Dismiss notification" title="Dismiss">' +
              (TF.Icon ? TF.Icon('x', 11) : '×') +
            '</button>' +
          '</div>';
        }).join('');

    var panel = document.createElement('div');
    panel.id = 'notif-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-label', 'Notifications');
    panel.innerHTML =
      '<div class="notif-panel-head">' +
        '<span class="t-label" style="letter-spacing:.8px">NOTIFICATIONS</span>' +
        (items.length > 0 ? '<button id="notif-clear-all" class="btn btn-ghost btn-sm" type="button" style="padding:4px 10px;font-size:10px;width:auto">Clear all</button>' : '') +
      '</div>' +
      '<div class="notif-list">' + listHTML + '</div>';

    document.body.appendChild(panel);

    /* Animate in */
    requestAnimationFrame(function () { panel.classList.add('notif-panel-visible'); });

    /* Dismiss single */
    panel.querySelectorAll('[data-dismiss-id]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = btn.dataset.dismissId;
        var row = panel.querySelector('[data-notif-id="' + id + '"]');
        if (row) {
          row.classList.add('notif-item-exit');
          setTimeout(function () { dismiss(id); panel.remove(); renderPanel(); }, 280);
        }
      });
    });

    /* Swipe-right to dismiss on touch */
    panel.querySelectorAll('.notif-item').forEach(function (row) {
      var sx = 0;
      row.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
      row.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - sx;
        if (dx > 55) {
          var id = row.dataset.notifId;
          row.classList.add('notif-item-exit');
          setTimeout(function () { dismiss(id); panel.remove(); renderPanel(); }, 280);
        }
      }, { passive: true });
    });

    /* Clear all */
    var clearBtn = panel.querySelector('#notif-clear-all');
    if (clearBtn) clearBtn.addEventListener('click', function () { clearAll(); panel.remove(); });

    /* Click-outside to close */
    setTimeout(function () {
      function outside(e) {
        var bell = document.getElementById('btn-notif');
        if (panel && !panel.contains(e.target) && (!bell || !bell.contains(e.target))) {
          panel.remove();
          document.removeEventListener('click', outside);
        }
      }
      document.addEventListener('click', outside);
    }, 0);
  }

  return { add: add, dismiss: dismiss, clearAll: clearAll, load: load, getUnreadCount: getUnreadCount, updateBadge: updateBadge, generateAutoNotifications: generateAutoNotifications, renderPanel: renderPanel };
})();
