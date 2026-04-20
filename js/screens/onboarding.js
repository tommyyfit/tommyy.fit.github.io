/* ================================================================
   ONBOARDING v5.7 — 4-step flow with progress bar,
   inline calorie/protein calculator, equipment picker, skip
   ================================================================ */
TF.Screens.onboarding = function(root) {
  var step = 0;
  var TOTAL_STEPS = 4;
  var data = { name: '', goal: 'muscle', equipment: 'minimal', experience: 'beginner', weightKg: '' };

  /* ── Helpers ── */
  function progressBar() {
    var pct = Math.round(((step) / TOTAL_STEPS) * 100);
    return '<div class="ob-step-counter">STEP ' + (step + 1) + ' OF ' + TOTAL_STEPS + '</div>' +
      '<div class="ob-progress-bar-track"><div class="ob-progress-bar-fill" style="width:' + pct + '%"></div></div>';
  }

  function stepBadge(icon, bg, border, color) {
    return '<div style="width:64px;height:64px;border-radius:18px;background:' + bg + ';border:1px solid ' + border + ';color:' + color + ';display:flex;align-items:center;justify-content:center;margin-bottom:16px">' +
      TF.Icon(icon, 30) +
    '</div>';
  }

  function choiceBadge(icon, bg, border, color, size) {
    return '<div style="width:42px;height:42px;border-radius:12px;background:' + bg + ';border:1px solid ' + border + ';color:' + color + ';display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
      TF.Icon(icon, size || 22) +
    '</div>';
  }

  /* ── Calorie/Protein calculator ── */
  function calcTargets(weightKg, goal) {
    var wKg = parseFloat(weightKg) || 75;
    var cal = Math.round(wKg * (TF.Config.CalorieMultipliers[goal] || 33));
    var pro = Math.round(wKg * (TF.Config.ProteinPerKg[goal] || 2.0));
    return { cal: cal, pro: pro };
  }

  function calcWidget() {
    var t = calcTargets(data.weightKg, data.goal);
    return '<div class="ob-calc-box">' +
      '<div class="t-label" style="margin-bottom:10px">Calorie & Protein Calculator</div>' +
      '<div class="field-row">' +
        '<div class="field-group" style="flex:1">' +
          '<label class="field-label" for="ob-weight">Bodyweight (kg)</label>' +
          '<input class="field" id="ob-weight" type="number" inputmode="decimal" placeholder="e.g. 80" min="30" max="250" value="' + TF.UI.escapeAttr(data.weightKg) + '">' +
        '</div>' +
      '</div>' +
      '<div class="ob-calc-result" id="ob-calc-result">' +
        '<div class="ob-calc-chip">' +
          '<div class="ob-calc-chip-val" id="ob-cal-val">' + (data.weightKg ? t.cal : '--') + '</div>' +
          '<div class="ob-calc-chip-label">kcal / day</div>' +
        '</div>' +
        '<div class="ob-calc-chip">' +
          '<div class="ob-calc-chip-val" id="ob-pro-val">' + (data.weightKg ? t.pro : '--') + '</div>' +
          '<div class="ob-calc-chip-label">protein g</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function skipBtn(label) {
    return '<button class="ob-skip-btn" id="ob-skip" type="button">' + (label || 'Skip for now') + '</button>';
  }

  /* ── Step renderers ── */
  var STEPS = [
    /* Step 0 — Name */
    function() {
      var isReturning = TF.Store.isAccountReady && TF.Store.isAccountReady();
      return '<div class="onboard-step">' +
        progressBar() +
        stepBadge('user', 'var(--blue-dim)', 'var(--blue)', 'var(--blue)') +
        '<div class="t-headline" style="font-size:28px;margin-bottom:8px">What is your name,<br>warrior?</div>' +
        '<div class="t-body" style="margin-bottom:32px">This is your transformation. Let\'s make it personal.</div>' +
        '<input class="field" id="ob-name" type="text" placeholder="Enter your name" maxlength="30" value="' + TF.UI.escapeAttr(data.name) + '" autocomplete="name" style="font-size:18px;padding:16px;text-align:center;margin-bottom:24px">' +
        '<button class="btn btn-primary" id="ob-next">NEXT ' + TF.Icon('arrow-right', 14) + '</button>' +
        (isReturning ? skipBtn('Already set up — skip to app') : '') +
      '</div>';
    },

    /* Step 1 — Goal + Calorie Calculator */
    function() {
      return '<div class="onboard-step">' +
        progressBar() +
        stepBadge('target', 'var(--lime-dim)', 'var(--lime)', 'var(--lime)') +
        '<div class="t-headline" style="font-size:28px;margin-bottom:8px">What is your<br>primary goal?</div>' +
        '<div class="t-body" style="margin-bottom:20px">This shapes your missions, nutrition targets, and training plan.</div>' +

        ['muscle', 'fatLoss', 'discipline'].map(function(goal) {
          var labels  = { muscle: 'Build Muscle', fatLoss: 'Lose Fat', discipline: 'Build Discipline' };
          var descs   = { muscle: 'Progressive overload, high protein, caloric surplus.', fatLoss: 'Caloric deficit, high protein, conditioning focus.', discipline: 'Consistency, habits, and mental performance.' };
          var icons   = { muscle: 'dumbbell', fatLoss: 'trending-down', discipline: 'shield' };
          var colors  = { muscle: 'var(--lime)', fatLoss: 'var(--red)', discipline: 'var(--blue)' };
          var bgs     = { muscle: 'var(--lime-dim)', fatLoss: 'var(--red-dim)', discipline: 'var(--blue-dim)' };
          return '<div class="card card-hover onboard-choice' + (data.goal === goal ? ' selected' : '') + '" data-goal="' + goal + '">' +
            '<div style="display:flex;align-items:center;gap:14px">' +
              choiceBadge(icons[goal], bgs[goal], colors[goal], colors[goal], 22) +
              '<div><div class="t-title">' + labels[goal] + '</div><div class="t-hint">' + descs[goal] + '</div></div>' +
              '<div class="onboard-choice-check">' + TF.Icon('check-circle', 18) + '</div>' +
            '</div>' +
          '</div>';
        }).join('') +

        calcWidget() +

        '<div style="height:12px"></div>' +
        '<button class="btn btn-primary" id="ob-next">NEXT ' + TF.Icon('arrow-right', 14) + '</button>' +
      '</div>';
    },

    /* Step 2 — Equipment + Experience */
    function() {
      return '<div class="onboard-step">' +
        progressBar() +
        stepBadge('dumbbell', 'var(--amber-dim)', 'var(--amber)', 'var(--amber)') +
        '<div class="t-headline" style="font-size:28px;margin-bottom:8px">What equipment<br>do you have?</div>' +
        '<div class="t-body" style="margin-bottom:24px">We\'ll build a workout plan around what you actually have access to.</div>' +

        '<div class="toggle-row" id="tgl-equip" style="flex-direction:column;gap:10px">' +
          [['none', 'No equipment', 'Bodyweight only', 'activity', 'var(--teal)', 'var(--teal-dim)'],
           ['minimal', 'Dumbbells / home gym', 'Adjustable dumbbells, bench, pull-up bar', 'dumbbell', 'var(--amber)', 'var(--amber-dim)'],
           ['full', 'Full gym access', 'Barbells, machines, cables — full commercial gym', 'target', 'var(--blue)', 'var(--blue-dim)']
          ].map(function(opt) {
            return '<div class="toggle-chip ' + (data.equipment === opt[0] ? 'on' : '') + '" data-val="' + opt[0] + '" style="text-align:left;padding:14px;display:flex;align-items:center;gap:12px">' +
              choiceBadge(opt[3], opt[5], opt[4], opt[4], 20) +
              '<div><div style="font-size:13px;font-weight:700">' + opt[1] + '</div><div class="t-hint" style="font-size:11px">' + opt[2] + '</div></div>' +
            '</div>';
          }).join('') +
        '</div>' +

        '<div style="margin:20px 0;padding:14px;background:var(--bg-2);border-radius:var(--r-sm);border:1px solid var(--border)">' +
          '<div class="t-label" style="margin-bottom:8px">Experience Level</div>' +
          '<div class="toggle-row" id="tgl-exp">' +
            [['beginner', 'Beginner'], ['intermediate', 'Intermediate'], ['advanced', 'Advanced']].map(function(o) {
              return '<div class="toggle-chip ' + (data.experience === o[0] ? 'on' : '') + '" data-val="' + o[0] + '">' + o[1] + '</div>';
            }).join('') +
          '</div>' +
        '</div>' +

        '<button class="btn btn-primary" id="ob-next">NEXT ' + TF.Icon('arrow-right', 14) + '</button>' +
      '</div>';
    },

    /* Step 3 — Summary + Start */
    function() {
      var t = calcTargets(data.weightKg, data.goal);
      var goalLabels = { muscle: 'Build Muscle', fatLoss: 'Lose Fat', discipline: 'Build Discipline' };
      var equipLabels = { none: 'Bodyweight', minimal: 'Home Gym', full: 'Full Gym' };

      return '<div class="onboard-step">' +
        progressBar() +
        stepBadge('zap', 'var(--lime-dim)', 'var(--lime)', 'var(--lime)') +
        '<div class="t-headline" style="font-size:28px;margin-bottom:8px">Ready, ' + TF.UI.escapeHTML(data.name || 'Warrior') + '.</div>' +
        '<div class="t-body" style="margin-bottom:24px">Here\'s your personalised starting setup. You can adjust everything in Profile.</div>' +

        '<div class="card card-sm" style="margin-bottom:12px">' +
          '<div style="display:flex;flex-direction:column;gap:10px">' +
            summaryRow('Goal', goalLabels[data.goal] || data.goal, 'var(--lime)') +
            summaryRow('Equipment', equipLabels[data.equipment] || data.equipment, 'var(--amber)') +
            summaryRow('Level', data.experience.charAt(0).toUpperCase() + data.experience.slice(1), 'var(--blue)') +
            (data.weightKg ? summaryRow('Daily Target', t.cal + ' kcal · ' + t.pro + 'g protein', 'var(--teal)') : '') +
          '</div>' +
        '</div>' +

        '<button class="btn btn-primary" id="ob-next" style="margin-top:8px">' + TF.Icon('zap', 14) + ' START MY JOURNEY</button>' +
      '</div>';
    }
  ];

  function summaryRow(label, value, color) {
    return '<div style="display:flex;justify-content:space-between;align-items:center">' +
      '<span class="t-hint">' + label + '</span>' +
      '<span style="font-size:13px;font-weight:700;color:' + color + '">' + value + '</span>' +
    '</div>';
  }

  /* ── Render ── */
  function render() {
    root.innerHTML = '<div class="screen-full" style="background:var(--bg-base);overflow:auto;min-height:100dvh">' +
      '<div style="max-width:440px;margin:0 auto">' +
        STEPS[step]() +
      '</div>' +
    '</div>';

    bindStepEvents();
  }

  function bindStepEvents() {
    /* Goal chooser */
    root.querySelectorAll('[data-goal]').forEach(function(el) {
      el.addEventListener('click', function() {
        data.goal = el.dataset.goal;
        root.querySelectorAll('[data-goal]').forEach(function(c) { c.classList.toggle('selected', c === el); });
        /* Live update calculator */
        if (data.weightKg) updateCalc();
      });
    });

    /* Calorie calculator live update */
    var weightInput = root.querySelector('#ob-weight');
    if (weightInput) {
      weightInput.addEventListener('input', function() {
        data.weightKg = weightInput.value;
        updateCalc();
      });
    }

    /* Equipment toggle */
    TF.UI.initToggle(root, 'tgl-equip');
    root.querySelectorAll('#tgl-equip .toggle-chip').forEach(function(chip) {
      chip.addEventListener('click', function() { data.equipment = chip.dataset.val; });
    });

    /* Experience toggle */
    TF.UI.initToggle(root, 'tgl-exp');
    root.querySelectorAll('#tgl-exp .toggle-chip').forEach(function(chip) {
      chip.addEventListener('click', function() { data.experience = chip.dataset.val; });
    });

    /* Skip */
    var skipButton = root.querySelector('#ob-skip');
    if (skipButton) {
      skipButton.addEventListener('click', function() {
        if (TF.Store.isAccountReady && TF.Store.isAccountReady()) {
          TF.Router.navigate('dashboard', true);
        } else {
          step = TOTAL_STEPS - 1;
          render();
        }
      });
    }

    /* Next / Finish */
    var nextBtn = root.querySelector('#ob-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        if (!validateStep()) return;
        advanceStep();
      });
    }
  }

  function updateCalc() {
    var t = calcTargets(data.weightKg, data.goal);
    var calEl = root.querySelector('#ob-cal-val');
    var proEl = root.querySelector('#ob-pro-val');
    if (calEl) calEl.textContent = data.weightKg ? t.cal : '--';
    if (proEl) proEl.textContent = data.weightKg ? t.pro : '--';
  }

  function validateStep() {
    if (step === 0) {
      var nameInput = root.querySelector('#ob-name');
      var name = nameInput ? (nameInput.value || '').trim() : data.name;
      if (!name) { TF.UI.toast('Enter your name to continue.', 'error'); return false; }
      data.name = name;
    }
    if (step === 1) {
      var weightInput = root.querySelector('#ob-weight');
      if (weightInput) data.weightKg = weightInput.value;
    }
    if (step === 2) {
      var equipOn = root.querySelector('#tgl-equip .toggle-chip.on');
      var expOn   = root.querySelector('#tgl-exp .toggle-chip.on');
      if (equipOn) data.equipment = equipOn.dataset.val;
      if (expOn)   data.experience = expOn.dataset.val;
    }
    return true;
  }

  function advanceStep() {
    if (step < TOTAL_STEPS - 1) {
      step++;
      render();
      TF.UI.haptic(30);
    } else {
      finish();
    }
  }

  function finish() {
    var t = calcTargets(data.weightKg, data.goal);
    var profile = TF.Store.getProfile();
    var bodyWeight = parseFloat(data.weightKg) || profile.bodyWeightKg || 75;

    TF.Store.saveProfile({
      name: data.name,
      goal: data.goal,
      equipment: data.equipment,
      experience: data.experience,
      bodyWeightKg: bodyWeight,
      targetCalories: data.weightKg ? t.cal : Math.round(bodyWeight * (TF.Config.CalorieMultipliers[data.goal] || 33)),
      targetProtein:  data.weightKg ? t.pro : Math.round(bodyWeight * (TF.Config.ProteinPerKg[data.goal] || 2.0)),
      createdAt: new Date().toISOString()
    });

    TF.Store.markOnboarded();
    TF.UI.haptic(100);
    TF.UI.confetti();
    TF.UI.toast('Welcome, ' + data.name + '. Export a backup soon from Profile.', 'success');
    TF.Router.navigate('checkin', true);

    setTimeout(function() {
      if (TF.App && TF.App.maybeShowBackupReminder) {
        TF.App.maybeShowBackupReminder(true);
      }
    }, 250);
  }

  render();
};
