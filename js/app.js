/* ================================================================
   APP.JS v6.0-alpha - boot sequence
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
          TF.UI.bar(prog, 'var(--lime)', false, 'xp-animate') +
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

  function lazyScreen(routeName, scriptUrl, screenKey) {
    return function(root) {
      root.innerHTML = '<div class="screen"><div class="card" style="text-align:center;padding:28px 18px">' +
        '<div class="t-title" style="margin-bottom:8px">Loading ' + TF.UI.escapeHTML(routeName) + '</div>' +
        '<div class="t-hint">This screen is lazy-loaded to keep the startup path lighter.</div>' +
      '</div></div>';

      return TF.Assets.loadScript(scriptUrl).then(function(){
        if (TF.Router.current() !== routeName) {
          return;
        }
        if (!TF.Screens[screenKey]) {
          throw new Error('Missing screen: ' + screenKey);
        }
        root.innerHTML = '';
        TF.Screens[screenKey](root);
      }).catch(function(error){
        root.innerHTML = '<div class="screen"><div class="error-screen">' +
          '<div class="error-icon" style="color:var(--amber)">' + TF.Icon('alert-triangle', 28) + '</div>' +
          '<div class="t-title" style="margin-bottom:8px">Could not load this screen</div>' +
          '<div class="t-hint">' + TF.UI.escapeHTML(error.message) + '</div>' +
        '</div></div>';
      });
    };
  }

  function finishBoot(){
    var initialRoute = TF.Store.requiresAccount() ? 'register' : (window.location.hash.slice(1) || 'dashboard');
    TF.Router.init(initialRoute);

    if (isFileProtocol()) {
      TF.UI.toast('Opened from a local file. GitHub Pages or localhost is recommended.', null, 4200);
    }

    if (TF.Store.isAccountReady()) {
      maybeShowBackupReminder(false);
      if (TF.Notifications) {
        setTimeout(function(){ TF.Notifications.generateAutoNotifications(); }, 1200);
      }
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

    document.addEventListener('visibilitychange', function(){
      if (document.visibilityState === 'visible' && TF.Store.isAccountReady()) {
        maybeShowBackupReminder(false);
        if (TF.Sync && navigator.onLine) {
          TF.Sync.drainQueue();
        }
      }
    });

    if (TF.Sync && navigator.onLine) {
      TF.Sync.drainQueue();
    }

    if (TF.PWA) {
      TF.PWA.updateSyncSurface();
    }

    TF.Quotes.load();
  }

  function boot(){
    enhanceUIHelpers();

    var savedTheme = TF.Store.getTheme();
    if (!savedTheme) {
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      savedTheme = prefersDark ? 'dark' : 'light';
      TF.Store.setTheme(savedTheme);
    }
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (isFileProtocol()) {
      console.info('[Static mode] Use a local server or GitHub Pages for the best browser support.');
    }

    TF.Store.rotateOldData();

    TF.Router.define('login', TF.Screens.login);
    TF.Router.define('register', TF.Screens.register);
    TF.Router.define('onboarding', TF.Screens.onboarding);
    TF.Router.define('dashboard', TF.Screens.dashboard);
    TF.Router.define('checkin', TF.Screens.checkin);
    TF.Router.define('missions', TF.Screens.missions);
    TF.Router.define('workout', TF.Screens.workout);
    TF.Router.define('habits', TF.Screens.habits);
    TF.Router.define('nutrition', TF.Screens.nutrition);
    TF.Router.define('progress', lazyScreen('progress', 'js/screens/progress.js', 'progress'));
    TF.Router.define('history', lazyScreen('history', 'js/screens/history.js', 'history'));
    TF.Router.define('custom-workouts', TF.Screens['custom-workouts']);
    TF.Router.define('measurements', TF.Screens.measurements);
    TF.Router.define('body-metrics', TF.Screens['body-metrics']);
    TF.Router.define('weekly-review', TF.Screens['weekly-review']);
    TF.Router.define('achievements', TF.Screens.achievements);
    TF.Router.define('coach', TF.Screens.coach);
    TF.Router.define('pr-history', TF.Screens['pr-history']);
    TF.Router.define('habit-heatmap', TF.Screens['habit-heatmap']);
    TF.Router.define('report-card', TF.Screens['report-card']);
    TF.Router.define('profile', TF.Screens.profile);
    TF.Router.define('more', TF.Screens.more);

    function applyThemeToggle(nextTheme, themeBtnMobile, themeBtnDesktop) {
      var html = document.documentElement;
      html.classList.add('theme-switching');
      html.setAttribute('data-theme', nextTheme);
      TF.Store.setTheme(nextTheme);
      TF.UI.toast((nextTheme === 'light' ? 'Light' : 'Dark') + ' mode on');
      var icon = nextTheme === 'light' ? TF.Icon('moon', 15) : TF.Icon('sun', 15);
      if (themeBtnMobile) themeBtnMobile.innerHTML = icon;
      if (themeBtnDesktop) themeBtnDesktop.innerHTML = icon;
      setTimeout(function () { html.classList.remove('theme-switching'); }, 320);
    }

    var actions = document.getElementById('topbar-actions');
    if (actions) {
      var currentTheme = TF.Store.getTheme() || 'dark';
      actions.innerHTML =
        '<div class="notif-bell-wrap">' +
          '<button class="topbar-btn" id="btn-notif" title="Notifications" aria-label="Open notifications">' +
            TF.Icon('bell', 15) +
          '</button>' +
          '<span id="notif-badge" aria-label="Unread notifications"></span>' +
        '</div>' +
        '<button class="topbar-btn" id="btn-theme-mobile" title="Toggle theme" aria-label="Toggle theme">' +
          (currentTheme === 'light' ? TF.Icon('moon', 15) : TF.Icon('sun', 15)) +
        '</button>' +
        '<button class="topbar-btn" id="btn-profile-mobile" title="Profile" aria-label="Open profile">' + TF.Icon('user', 15) + '</button>';

      document.getElementById('btn-profile-mobile').addEventListener('click', function(){
        if (TF.Store.requiresAccount()) { TF.UI.promptAccountRequired(); return; }
        TF.Router.navigate('profile');
      });

      document.getElementById('btn-theme-mobile').addEventListener('click', function(){
        var next = TF.Store.getTheme() === 'dark' ? 'light' : 'dark';
        applyThemeToggle(next,
          document.getElementById('btn-theme-mobile'),
          document.getElementById('btn-theme-desktop'));
      });

      document.getElementById('btn-notif').addEventListener('click', function(e){
        e.stopPropagation();
        if (TF.Notifications) TF.Notifications.renderPanel();
      });
    }

    var bottomNav = document.getElementById('bottom-nav');
    if (bottomNav) {
      var sidebarActions = document.createElement('div');
      sidebarActions.className = 'sidebar-topbar-actions';
      var currentThemeD = TF.Store.getTheme() || 'dark';
      sidebarActions.innerHTML =
        '<button class="topbar-btn" id="btn-theme-desktop" title="Toggle theme" aria-label="Toggle theme">' +
          (currentThemeD === 'light' ? TF.Icon('moon', 15) : TF.Icon('sun', 15)) +
        '</button>' +
        '<button class="topbar-btn" id="btn-profile-desktop" title="Profile" aria-label="Open profile">' + TF.Icon('user', 15) + '</button>';

      var footer = bottomNav.querySelector('.sidebar-footer');
      if (footer) bottomNav.insertBefore(sidebarActions, footer);
      else bottomNav.appendChild(sidebarActions);

      document.getElementById('btn-profile-desktop').addEventListener('click', function(){
        if (TF.Store.requiresAccount()) { TF.UI.promptAccountRequired(); return; }
        TF.Router.navigate('profile');
      });

      document.getElementById('btn-theme-desktop').addEventListener('click', function(){
        var next = TF.Store.getTheme() === 'dark' ? 'light' : 'dark';
        applyThemeToggle(next,
          document.getElementById('btn-theme-mobile'),
          document.getElementById('btn-theme-desktop'));
      });
    }

    document.getElementById('topbar').classList.remove('hidden');
    document.getElementById('screen-root').classList.remove('hidden');
    document.getElementById('bottom-nav').classList.remove('hidden');

    Promise.resolve().then(function(){
      if (TF.Sync && TF.API && TF.API.isLoggedIn && TF.API.isLoggedIn()) {
        return TF.Sync.restoreIfLoggedIn({ rerender: false });
      }
      return null;
    }).catch(function(error){
      console.warn('[App] Startup cloud restore failed.', error);
    }).finally(function(){
      finishBoot();
    });
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

  function initOfflineBanner() {
    var banner = document.getElementById('offline-banner');
    if (!banner) return;
    function update() {
      if (navigator.onLine) {
        banner.classList.remove('visible');
      } else {
        banner.classList.add('visible');
      }
    }
    window.addEventListener('online',  function () { banner.classList.remove('visible'); });
    window.addEventListener('offline', function () { banner.classList.add('visible'); });
    update();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (TF.PWA) {
      TF.PWA.init();
    }
    initOfflineBanner();
    runLoader();
  });
})();
