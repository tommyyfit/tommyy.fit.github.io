/* ================================================================
   APP.JS v5.6 - boot sequence
   ================================================================ */
(function(){
  'use strict';

  function isFileProtocol(){
    return window.location.protocol === 'file:';
  }

  function maybeShowBackupReminder(force){
    var state = TF.Store.getBackupReminderState();
    var settings = TF.Store.getSettings();
    var shouldShow = force || state.due;
    var message;

    if (!shouldShow) {
      return;
    }

    message = state.reason === 'first_backup'
      ? 'Export a JSON backup in Profile so your progress is safe.'
      : 'Backup reminder: export a fresh JSON save from Profile.';

    TF.UI.toast(message, null, 5200);

    if (settings.browserNotifications && document.visibilityState === 'visible') {
      TF.UI.notify('tommyy.fit backup reminder', {
        body: message,
        icon: './assets/icon.svg',
        tag: 'backup-reminder'
      });
    }

    TF.Store.markBackupReminderShown();
  }

  TF.App = TF.App || {};
  TF.App.maybeShowBackupReminder = maybeShowBackupReminder;

  function enhanceUIHelpers() {
    if (!TF.UI) {
      return;
    }

    TF.UI.xpRow = function(profile) {
      var p = profile || TF.Store.getProfile();
      var level = TF.Store.getLevel(p);
      var prog = TF.Store.getXPProgress(p);
      var toNext = TF.Store.getXPToNext(p);
      var shields = TF.Store.getShields();

      return '<div class="xp-row" id="more-level-card" style="cursor:pointer" role="button" tabindex="0" aria-label="Open level guide">' +
        '<div class="xp-level-badge">' + level + '</div>' +
        '<div class="xp-details">' +
          '<div class="xp-top">' +
            '<span class="xp-name">Lv.' + level + ' &middot; ' + TF.Store.getWarriorTitle(level) + '</span>' +
            '<span class="xp-pts t-mono">' + p.xp + ' XP</span>' +
          '</div>' +
          TF.UI.bar(prog, 'var(--lime)') +
          '<div class="t-hint mt-1">' +
            toNext + ' XP to level ' + (level + 1) +
            (shields > 0
              ? ' &nbsp;&middot;&nbsp; <span style="color:var(--blue)">' + shields + ' shield' + (shields > 1 ? 's' : '') + '</span>'
              : ''
            ) +
          '</div>' +
        '</div>' +
        '<div class="streak-box">' +
          '<div class="streak-num">' + (p.streakDays || 0) + '</div>' +
          '<div class="streak-label">streak</div>' +
        '</div>' +
      '</div>';
    };

    TF.UI.initToggle = function(root, groupId) {
      root.querySelectorAll('#' + groupId + ' .toggle-chip').forEach(function(chip) {
        chip.addEventListener('click', function() {
          root.querySelectorAll('#' + groupId + ' .toggle-chip').forEach(function(c) {
            c.classList.remove('on');
            c.setAttribute('aria-pressed', 'false');
          });
          chip.classList.add('on');
          chip.setAttribute('aria-pressed', 'true');
        });
      });
    };

    TF.UI.checkStorageAndWarn = function() {
      if (TF.Store.isStorageNearLimit()) {
        TF.UI.toast('Storage almost full. Export your data in Profile.', null, 5000);
      }
    };
  }

  function boot(){
    enhanceUIHelpers();
    var theme = TF.Store.getTheme() || 'dark';
    document.documentElement.setAttribute('data-theme', theme);

    if (isFileProtocol()) {
      console.info('[Static mode] Use a local server or GitHub Pages for the best browser support.');
    }

    TF.Store.rotateOldData();

    TF.Router.define('onboarding', TF.Screens.onboarding);
    TF.Router.define('dashboard', TF.Screens.dashboard);
    TF.Router.define('checkin', TF.Screens.checkin);
    TF.Router.define('missions', TF.Screens.missions);
    TF.Router.define('workout', TF.Screens.workout);
    TF.Router.define('habits', TF.Screens.habits);
    TF.Router.define('nutrition', TF.Screens.nutrition);
    TF.Router.define('progress', TF.Screens.progress);
    TF.Router.define('history', TF.Screens.history);
    TF.Router.define('custom-workouts', TF.Screens['custom-workouts']);
    TF.Router.define('measurements', TF.Screens.measurements);
    TF.Router.define('body-metrics', TF.Screens['body-metrics']);
    TF.Router.define('weekly-review', TF.Screens['weekly-review']);
    TF.Router.define('achievements', TF.Screens.achievements);
    TF.Router.define('coach', TF.Screens.coach);
    TF.Router.define('profile', TF.Screens.profile);
    TF.Router.define('more', TF.Screens.more);

    var actions = document.getElementById('topbar-actions');
    
    // Populate topbar-actions for mobile only
    if (actions) {
      actions.innerHTML =
        '<button class="topbar-btn" id="btn-theme-mobile" title="Toggle theme" aria-label="Toggle theme">' +
          (TF.Store.getTheme() === 'light' ? TF.Icon('moon', 15) : TF.Icon('sun', 15)) +
        '</button>' +
        '<button class="topbar-btn" id="btn-profile-mobile" title="Profile" aria-label="Open profile">' + TF.Icon('user', 15) + '</button>';

      document.getElementById('btn-profile-mobile').addEventListener('click', function(){
        if (TF.Store.requiresAccount()) {
          TF.UI.promptAccountRequired();
          return;
        }
        TF.Router.navigate('profile');
      });

      document.getElementById('btn-theme-mobile').addEventListener('click', function(){
        var current = TF.Store.getTheme();
        var next = current === 'dark' ? 'light' : 'dark';
        TF.Store.setTheme(next);
        TF.UI.toast((next === 'light' ? 'Light mode' : 'Dark mode') + ' on');
        var themeBtn = document.getElementById('btn-theme-mobile');
        if (themeBtn) {
          themeBtn.innerHTML = next === 'light' ? TF.Icon('moon', 15) : TF.Icon('sun', 15);
        }
      });
    }
    
    // Add theme and profile buttons to sidebar (desktop)
    var bottomNav = document.getElementById('bottom-nav');
    if (bottomNav) {
      var sidebarActions = document.createElement('div');
      sidebarActions.className = 'sidebar-topbar-actions';
      sidebarActions.innerHTML =
        '<button class="topbar-btn" id="btn-theme-desktop" title="Toggle theme" aria-label="Toggle theme">' +
          (TF.Store.getTheme() === 'light' ? TF.Icon('moon', 15) : TF.Icon('sun', 15)) +
        '</button>' +
        '<button class="topbar-btn" id="btn-profile-desktop" title="Profile" aria-label="Open profile">' + TF.Icon('user', 15) + '</button>';
      
      // Insert before sidebar footer
      var footer = bottomNav.querySelector('.sidebar-footer');
      if (footer) {
        bottomNav.insertBefore(sidebarActions, footer);
      } else {
        bottomNav.appendChild(sidebarActions);
      }

      document.getElementById('btn-profile-desktop').addEventListener('click', function(){
        if (TF.Store.requiresAccount()) {
          TF.UI.promptAccountRequired();
          return;
        }
        TF.Router.navigate('profile');
      });

      document.getElementById('btn-theme-desktop').addEventListener('click', function(){
        var current = TF.Store.getTheme();
        var next = current === 'dark' ? 'light' : 'dark';
        TF.Store.setTheme(next);
        TF.UI.toast((next === 'light' ? 'Light mode' : 'Dark mode') + ' on');
        var themeBtn = document.getElementById('btn-theme-desktop');
        if (themeBtn) {
          themeBtn.innerHTML = next === 'light' ? TF.Icon('moon', 15) : TF.Icon('sun', 15);
        }
      });
    }

    document.getElementById('topbar').classList.remove('hidden');
    document.getElementById('screen-root').classList.remove('hidden');
    document.getElementById('bottom-nav').classList.remove('hidden');

    var initialRoute = TF.Store.requiresAccount() ? 'onboarding' : (window.location.hash.slice(1) || 'dashboard');
    TF.Router.init(initialRoute);

    if (isFileProtocol()) {
      TF.UI.toast('Opened from a local file. GitHub Pages or localhost is recommended.', null, 4200);
    }

    if (TF.Store.isAccountReady()) {
      maybeShowBackupReminder(false);
    }

    var lastInput = TF.Store.getTodayInput();
    if (!lastInput) {
      var profile = TF.Store.getProfile();
      var createdAt = profile.createdAt ? new Date(profile.createdAt) : null;
      var appAgeDays = createdAt ? Math.floor((Date.now() - createdAt.getTime()) / 86400000) : 0;
      if (appAgeDays >= 3) {
        var now = new Date();
        var target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
        var ms = now < target ? target - now : 24 * 60 * 60 * 1000 - (now - target);
        setTimeout(function(){
          if (TF.Store.isAccountReady() && !TF.Store.getTodayInput()) {
            TF.UI.toast('You have not checked in today. Open Check-in to unlock your score.', null, 5000);
          }
        }, Math.min(ms, 3 * 60 * 60 * 1000));
      }
    }

    // Note: loader background image is set inline in HTML - no need to update here

    document.addEventListener('visibilitychange', function(){
      if (document.visibilityState === 'visible' && TF.Store.isAccountReady()) {
        maybeShowBackupReminder(false);
      }
    });

    TF.Quotes.load();
  }

  function runLoader(){
    var loader = document.getElementById('loader');
    if (!loader) {
      boot();
      return;
    }
    setTimeout(function(){
      loader.style.transition = 'opacity 0.5s ease';
      loader.style.opacity = '0';
      setTimeout(function(){
        loader.style.display = 'none';
        boot();
      }, 520);
    }, 1700);
  }

  document.addEventListener('DOMContentLoaded', runLoader);
})();
