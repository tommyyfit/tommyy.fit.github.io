TF.Screens.profile = function(root) {
  function formatStamp(iso){
    if (!iso) {
      return 'Not exported yet';
    }
    var date = new Date(iso);
    if (isNaN(date.getTime())) {
      return 'Unknown';
    }
    return date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function calcTargets(bodyWeight, goal){
    bodyWeight = parseFloat(bodyWeight) || 75;
    return {
      cal: Math.round(bodyWeight * (TF.Config.CalorieMultipliers[goal] || 33)),
      prot: Math.round(bodyWeight * (TF.Config.ProteinPerKg[goal] || 2.0))
    };
  }

  function draw(){
    var profile = TF.Store.getProfile();
    var level = TF.Store.getLevel(profile);
    var title = TF.Store.getWarriorTitle(level);
    var theme = TF.Store.getTheme();
    var kb = TF.Store.getStorageUsedKB();
    var shields = TF.Store.getShields();
    var settings = TF.Store.getSettings();
    var reminder = TF.Store.getBackupReminderState();
    var notificationSupported = 'Notification' in window;
    var notificationPermission = notificationSupported ? Notification.permission : 'unsupported';
    var safeName = TF.UI.escapeAttr(profile.name);
    var safeBrandUrl = TF.UI.escapeAttr(TF.Config.brandUrl);

    root.innerHTML = '<div class="screen">' +
      '<div class="profile-badge">' +
        '<div class="profile-badge-bg" style="background-image:url(\'' + TF.Config.Images.workoutHero + '\')"></div>' +
        '<div class="profile-badge-content">' +
          '<div style="font-size:38px;margin-bottom:10px">LV</div>' +
          '<div class="profile-warrior-title">' + title.toUpperCase() + '</div>' +
          '<div class="t-hint mt-1">Level ' + level + ' · ' + profile.xp + ' XP · ' + (profile.streakDays || 0) + '-day streak' + (shields > 0 ? ' · ' + shields + ' shield' + (shields > 1 ? 's' : '') : '') + '</div>' +
          '<div style="margin-top:12px">' + TF.UI.bar(TF.Store.getXPProgress(profile), 'var(--lime)') + '</div>' +
          '<div class="t-hint" style="margin-top:5px">' + TF.Store.getXPToNext(profile) + ' XP to level ' + (level + 1) + '</div>' +
        '</div>' +
      '</div>' +

      '<div class="card" style="margin-bottom:12px">' +
        '<div class="t-label" style="margin-bottom:12px">Identity</div>' +
        '<div class="field-group"><div class="field-label">Your name</div><input class="field" id="in-name" type="text" value="' + safeName + '" placeholder="Your name" maxlength="30"></div>' +
      '</div>' +

      '<div class="card" style="margin-bottom:12px">' +
        '<div class="t-label" style="margin-bottom:12px">Primary Goal</div>' +
        '<div class="toggle-row" id="tgl-goal">' +
          [['muscle', 'Build Muscle'], ['fatLoss', 'Lose Fat'], ['discipline', 'Build Discipline']].map(function(goal){
            return '<div class="toggle-chip ' + (profile.goal === goal[0] ? 'on' : '') + '" data-val="' + goal[0] + '">' + goal[1] + '</div>';
          }).join('') +
        '</div>' +
      '</div>' +

      '<div class="card" style="margin-bottom:12px">' +
        '<div class="t-label" style="margin-bottom:12px">Equipment</div>' +
        '<div class="toggle-row" id="tgl-equip">' +
          [['none', 'Bodyweight'], ['minimal', 'Dumbbells'], ['full', 'Full Gym']].map(function(option){
            return '<div class="toggle-chip ' + (profile.equipment === option[0] ? 'on' : '') + '" data-val="' + option[0] + '">' + option[1] + '</div>';
          }).join('') +
        '</div>' +
      '</div>' +

      '<div class="card" style="margin-bottom:12px">' +
        '<div class="flex-between" style="margin-bottom:12px">' +
          '<div class="t-label">Daily Targets</div>' +
          '<button class="btn btn-sm btn-ghost" id="btn-auto-calc" style="font-size:10px;padding:5px 10px">' + TF.Icon('sparkles', 10) + ' AUTO-CALC</button>' +
        '</div>' +
        '<div class="field-group" style="margin-bottom:10px">' +
          '<div class="field-label">Body weight (kg)</div>' +
          '<input class="field" id="in-bw" type="number" value="' + profile.bodyWeightKg + '" inputmode="decimal" step="0.1" min="30" max="250">' +
        '</div>' +
        '<div class="field-group" style="margin-bottom:10px">' +
          '<div class="field-label">Calorie target (kcal)</div>' +
          '<input class="field" id="in-cal" type="number" value="' + profile.targetCalories + '" inputmode="numeric" min="1000" max="6000">' +
        '</div>' +
        '<div class="field-group">' +
          '<div class="field-label">Protein target (g) - optimal: ' + Math.round(profile.bodyWeightKg * 1.6) + '-' + Math.round(profile.bodyWeightKg * 2.2) + 'g</div>' +
          '<input class="field" id="in-prot" type="number" value="' + profile.targetProtein + '" inputmode="numeric" min="50" max="400">' +
        '</div>' +
      '</div>' +

      '<div class="card" style="margin-bottom:12px">' +
        '<div class="field-group"><div class="field-label">Session length (minutes)</div><input class="field" id="in-mins" type="number" value="' + profile.availableMinutes + '" inputmode="numeric" min="15" max="180"></div>' +
      '</div>' +

      '<button class="btn btn-primary" id="btn-save">' + TF.Icon('save', 14) + ' SAVE PROFILE</button>' +

      '<div class="card" style="margin-top:12px;margin-bottom:12px">' +
        '<div class="flex-between">' +
          '<div><div class="t-title">' + TF.Icon('sun', 14) + ' Theme</div><div class="t-hint">Switch between dark and light mode</div></div>' +
          '<div class="toggle-row" id="tgl-theme" style="flex-wrap:nowrap">' +
            '<div class="toggle-chip ' + (theme === 'dark' ? 'on' : '') + '" data-val="dark">Dark</div>' +
            '<div class="toggle-chip ' + (theme === 'light' ? 'on' : '') + '" data-val="light">Light</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="card" style="margin-bottom:12px">' +
        '<div class="t-label" style="margin-bottom:10px">Data & Backup</div>' +
        '<div class="t-hint" style="margin-bottom:8px">Storage used: ' + kb + 'KB / ~5000KB. Data rotates after 90 days.</div>' +
        '<div class="t-hint" style="margin-bottom:12px">Last JSON export: ' + formatStamp(settings.lastBackupExportAt) + '</div>' +
        '<div style="display:flex;gap:8px">' +
          '<button class="btn btn-secondary btn-sm" id="btn-export" style="flex:1">' + TF.Icon('download', 12) + ' Export JSON</button>' +
          '<button class="btn btn-ghost btn-sm" id="btn-import" style="flex:1">' + TF.Icon('upload', 12) + ' Import</button>' +
        '</div>' +
        '<input type="file" id="import-file" accept=".json" style="display:none">' +
      '</div>' +

      '<div class="card" style="margin-bottom:12px">' +
        '<div class="t-label" style="margin-bottom:8px">Backup reminders</div>' +
        '<div class="t-hint" style="margin-bottom:12px">Static mode only: reminders are shown when you open the app or come back to it. No service worker is used.</div>' +
        '<div class="field-group" style="margin-bottom:10px">' +
          '<div class="field-label">Reminder cadence</div>' +
          '<div class="toggle-row" id="tgl-reminder">' +
            TF.Config.BackupReminderOptions.map(function(days){
              return '<div class="toggle-chip ' + (settings.backupReminderDays === days ? 'on' : '') + '" data-val="' + days + '">Every ' + days + ' days</div>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="field-group" style="margin-bottom:12px">' +
          '<div class="field-label">Browser notifications</div>' +
          '<div class="t-hint" style="margin-bottom:8px">Status: ' + (notificationPermission === 'granted' ? 'enabled' : notificationPermission === 'denied' ? 'blocked in browser' : notificationPermission === 'default' ? 'not enabled yet' : 'not supported') + '</div>' +
          '<div style="display:flex;gap:8px">' +
            '<button class="btn btn-ghost btn-sm" id="btn-notifs" style="flex:1">' + TF.Icon('bell', 12) + ' ' + (settings.browserNotifications ? 'Update notifications' : 'Enable notifications') + '</button>' +
            '<button class="btn btn-secondary btn-sm" id="btn-test-reminder" style="flex:1">' + TF.Icon('message-circle', 12) + ' Test reminder</button>' +
          '</div>' +
        '</div>' +
        '<div style="padding:10px 12px;background:' + (reminder.due ? 'var(--amber-dim)' : 'var(--bg-3)') + ';border:1px solid var(--border);border-radius:var(--r-sm)">' +
          '<div style="font-size:11px;font-weight:700;color:' + (reminder.due ? 'var(--amber)' : 'var(--txt-1)') + ';margin-bottom:5px">Reminder state</div>' +
          '<div style="font-size:11px;color:var(--txt-2)">' +
            (reminder.due
              ? 'A backup reminder is due now. Export your JSON save so you have a recovery point.'
              : 'No backup reminder due right now. Your cadence is every ' + settings.backupReminderDays + ' days.') +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div style="margin-top:4px;padding:14px;background:var(--bg-2);border-radius:var(--r-sm);border:1px solid var(--border);text-align:center">' +
        '<div style="font-family:var(--font-d);font-size:22px;font-weight:900;letter-spacing:3px;margin-bottom:4px">TOMMYY<span style="color:var(--lime)">.FIT</span></div>' +
        '<div class="t-hint" style="margin-bottom:10px">' + TF.Config.version + ' · local browser storage · GitHub Pages friendly</div>' +
        '<a href="' + safeBrandUrl + '" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-ghost" style="display:inline-flex;gap:6px">' + TF.Icon('external-link', 12) + ' Visit tommyy.fit</a>' +
      '</div>' +

      '<div style="margin-top:12px">' +
        '<button class="btn btn-danger" id="btn-reset">' + TF.Icon('trash', 12) + ' Reset all data</button>' +
      '</div>' +
      '<div style="height:16px"></div></div>';

    TF.UI.initToggle(root, 'tgl-goal');
    TF.UI.initToggle(root, 'tgl-equip');
    TF.UI.initToggle(root, 'tgl-theme');
    TF.UI.initToggle(root, 'tgl-reminder');

    root.querySelectorAll('#tgl-theme .toggle-chip').forEach(function(chip){
      chip.addEventListener('click', function(){
        TF.Store.setTheme(chip.dataset.val);
        draw();
      });
    });

    root.querySelectorAll('#tgl-reminder .toggle-chip').forEach(function(chip){
      chip.addEventListener('click', function(){
        TF.Store.saveSettings({ backupReminderDays: parseInt(chip.dataset.val, 10) });
        TF.UI.toast('Backup reminder interval updated.', 'success');
        draw();
      });
    });

    root.querySelector('#btn-auto-calc').addEventListener('click', function(){
      var bodyWeight = parseFloat(root.querySelector('#in-bw').value) || profile.bodyWeightKg;
      var goal = (root.querySelector('#tgl-goal .toggle-chip.on') || { dataset: {} }).dataset.val || profile.goal;
      var targets = calcTargets(bodyWeight, goal);
      root.querySelector('#in-cal').value = targets.cal;
      root.querySelector('#in-prot').value = targets.prot;
      TF.UI.toast('Targets auto-calculated.', 'success');
    });

    root.querySelector('#btn-save').addEventListener('click', function(){
      var name = (root.querySelector('#in-name').value || '').trim() || 'Warrior';
      var calories = parseInt(root.querySelector('#in-cal').value, 10);
      var protein = parseInt(root.querySelector('#in-prot').value, 10);
      var bodyWeight = parseFloat(root.querySelector('#in-bw').value);
      var minutes = parseInt(root.querySelector('#in-mins').value, 10);

      if (calories < 1000 || calories > 6000) { TF.UI.toast('Calories must be 1000-6000.', 'error'); return; }
      if (protein < 50 || protein > 400) { TF.UI.toast('Protein must be 50-400g.', 'error'); return; }
      if (bodyWeight < 30 || bodyWeight > 250) { TF.UI.toast('Weight must be 30-250kg.', 'error'); return; }
      if (minutes < 15 || minutes > 180) { TF.UI.toast('Session length must be 15-180 minutes.', 'error'); return; }

      TF.Store.saveProfile({
        name: name,
        goal: (root.querySelector('#tgl-goal .toggle-chip.on') || { dataset: {} }).dataset.val || profile.goal,
        equipment: (root.querySelector('#tgl-equip .toggle-chip.on') || { dataset: {} }).dataset.val || profile.equipment,
        targetCalories: calories,
        targetProtein: protein,
        bodyWeightKg: bodyWeight,
        availableMinutes: minutes
      });

      TF.UI.haptic(60);
      TF.UI.toast('Profile saved.', 'success');
      if (!TF.Store.getSettings().lastBackupExportAt && TF.App && TF.App.maybeShowBackupReminder) {
        TF.App.maybeShowBackupReminder(true);
      }
      draw();
    });

    root.querySelector('#btn-export').addEventListener('click', function(){
      TF.Store.exportAllData();
      TF.UI.toast('Backup exported.', 'success');
      draw();
    });

    root.querySelector('#btn-import').addEventListener('click', function(){
      root.querySelector('#import-file').click();
    });

    root.querySelector('#import-file').addEventListener('change', function(event){
      var file = event.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(loadEvent){
        var ok = TF.Store.importData(loadEvent.target.result);
        if (ok) {
          TF.UI.toast('Data imported. Reloading...', 'success');
          setTimeout(function(){ location.reload(); }, 1200);
        } else {
          TF.UI.toast('Import failed - invalid file.', 'error');
        }
      };
      reader.readAsText(file);
    });

    root.querySelector('#btn-notifs').addEventListener('click', function(){
      if (!notificationSupported) {
        TF.UI.toast('Notifications are not supported in this browser.');
        return;
      }
      Notification.requestPermission().then(function(permission){
        if (permission === 'granted') {
          TF.Store.saveSettings({ browserNotifications: true });
          TF.UI.notify('tommyy.fit reminders enabled', {
            body: 'You will get backup reminders when the app is open and a reminder is due.',
            icon: './assets/icon.svg',
            tag: 'reminders-enabled'
          });
          TF.UI.toast('Browser notifications enabled.', 'success');
        } else {
          TF.Store.saveSettings({ browserNotifications: false });
          TF.UI.toast('Notification permission not granted.');
        }
        draw();
      });
    });

    root.querySelector('#btn-test-reminder').addEventListener('click', function(){
      var message = 'Export a JSON backup from Profile so your progress stays safe.';
      TF.UI.toast(message, null, 4200);
      if (TF.Store.getSettings().browserNotifications) {
        TF.UI.notify('tommyy.fit test reminder', {
          body: message,
          icon: './assets/icon.svg',
          tag: 'test-reminder'
        });
      }
    });

    root.querySelector('#btn-reset').addEventListener('click', function(){
      if (confirm('Reset ALL data? This cannot be undone.')) {
        TF.Store.clearAllData();
        TF.UI.toast('All data cleared. Reloading...');
        setTimeout(function(){
          window.location.hash = 'dashboard';
          location.reload();
        }, 900);
      }
    });
  }

  draw();
};
