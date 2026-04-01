/* ================================================================
   APP.JS v4 - boot sequence
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

  function boot(){
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
    TF.Router.define('measurements', TF.Screens.measurements);
    TF.Router.define('weekly-review', TF.Screens['weekly-review']);
    TF.Router.define('achievements', TF.Screens.achievements);
    TF.Router.define('coach', TF.Screens.coach);
    TF.Router.define('profile', TF.Screens.profile);
    TF.Router.define('more', TF.Screens.more);

    var actions = document.getElementById('topbar-actions');
    if (actions) {
      actions.innerHTML =
        '<button class="topbar-btn" id="btn-theme" title="Toggle theme">' +
          (TF.Store.getTheme() === 'light' ? TF.Icon('moon', 15) : TF.Icon('sun', 15)) +
        '</button>' +
        '<button class="topbar-btn" id="btn-profile" title="Profile">' + TF.Icon('user', 15) + '</button>';

      document.getElementById('btn-profile').addEventListener('click', function(){
        TF.Router.navigate('profile');
      });

      document.getElementById('btn-theme').addEventListener('click', function(){
        var current = TF.Store.getTheme();
        var next = current === 'dark' ? 'light' : 'dark';
        TF.Store.setTheme(next);
        TF.UI.toast((next === 'light' ? 'Light mode' : 'Dark mode') + ' on');
        var themeBtn = document.getElementById('btn-theme');
        if (themeBtn) {
          themeBtn.innerHTML = next === 'light' ? TF.Icon('moon', 15) : TF.Icon('sun', 15);
        }
      });
    }

    document.getElementById('topbar').classList.remove('hidden');
    document.getElementById('screen-root').classList.remove('hidden');
    document.getElementById('bottom-nav').classList.remove('hidden');

    TF.Router.init();

    if (isFileProtocol()) {
      TF.UI.toast('Opened from a local file. GitHub Pages or localhost is recommended.', null, 4200);
    }

    var profile = TF.Store.getProfile();
    var onboarded = localStorage.getItem('tf_onboarded');
    if (!onboarded && profile.name === 'Warrior') {
      TF.Router.navigate('onboarding', true);
    } else {
      maybeShowBackupReminder(false);
    }

    var lastInput = TF.Store.getTodayInput();
    if (!lastInput) {
      var now = new Date();
      var target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
      var ms = now < target ? target - now : 24 * 60 * 60 * 1000 - (now - target);
      setTimeout(function(){
        if (!TF.Store.getTodayInput()) {
          TF.UI.toast('You have not checked in today. Open Check-in to unlock your score.', null, 5000);
        }
      }, Math.min(ms, 3 * 60 * 60 * 1000));
    }

    var loaderBg = document.getElementById('loader-bg');
    if (loaderBg) {
      loaderBg.style.backgroundImage = "url('" + TF.Config.Images.loader + "')";
    }

    document.addEventListener('visibilitychange', function(){
      if (document.visibilityState === 'visible') {
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
