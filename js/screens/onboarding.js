TF.Screens.onboarding = function(root) {
  var step = 0;
  var data = { name: '', goal: 'muscle', equipment: 'minimal', experience: 'beginner' };

  function stepNav() {
    if (step === 0) {
      return '';
    }

    return '<div class="onboard-nav">' +
      '<button class="onboard-nav-btn" id="ob-back" type="button" aria-label="Go back">' +
        TF.Icon('chevron-left', 18) +
      '</button>' +
      (step === 2
        ? '<button class="onboard-nav-btn" id="ob-back-start" type="button" aria-label="Go back to step 1">' +
            TF.Icon('chevron-left', 18) +
            TF.Icon('chevron-left', 18) +
          '</button>'
        : '<span class="onboard-nav-spacer" aria-hidden="true"></span>') +
    '</div>';
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

  var STEPS = [
    function(){
      return '<div class="onboard-step">' +
        stepNav() +
        '<div class="onboard-step-num">STEP 1 OF 3</div>' +
        '<div class="onboard-dots"><div class="onboard-dot active"></div><div class="onboard-dot"></div><div class="onboard-dot"></div></div>' +
        stepBadge('user', 'var(--blue-dim)', 'var(--blue)', 'var(--blue)') +
        '<div class="t-headline" style="font-size:28px;margin-bottom:8px">What is your name,<br>warrior?</div>' +
        '<div class="t-body" style="margin-bottom:32px">This is your transformation. Let us make it personal.</div>' +
        '<input class="field" id="ob-name" type="text" placeholder="Enter your name" maxlength="30" value="' + TF.UI.escapeAttr(data.name) + '" autocomplete="name" style="font-size:18px;padding:16px;text-align:center;margin-bottom:24px">' +
        '<button class="btn btn-primary" id="ob-next">NEXT ' + TF.Icon('arrow-right', 14) + '</button>' +
      '</div>';
    },
    function(){
      return '<div class="onboard-step">' +
        stepNav() +
        '<div class="onboard-step-num">STEP 2 OF 3</div>' +
        '<div class="onboard-dots"><div class="onboard-dot"></div><div class="onboard-dot active"></div><div class="onboard-dot"></div></div>' +
        stepBadge('target', 'var(--lime-dim)', 'var(--lime)', 'var(--lime)') +
        '<div class="t-headline" style="font-size:28px;margin-bottom:8px">What is your<br>primary goal?</div>' +
        '<div class="t-body" style="margin-bottom:28px">This shapes your missions, nutrition targets, and training plan.</div>' +
        ['muscle', 'fatLoss', 'discipline'].map(function(goal){
          var labels = { muscle: 'Build Muscle', fatLoss: 'Lose Fat', discipline: 'Build Discipline' };
          var descriptions = {
            muscle: 'Progressive overload, high protein, caloric surplus.',
            fatLoss: 'Caloric deficit, high protein, conditioning focus.',
            discipline: 'Consistency, habits, and mental performance.'
          };
          var icons = { muscle: 'dumbbell', fatLoss: 'trending-down', discipline: 'shield' };
          var colors = { muscle: 'var(--lime)', fatLoss: 'var(--red)', discipline: 'var(--blue)' };
          var backgrounds = { muscle: 'var(--lime-dim)', fatLoss: 'var(--red-dim)', discipline: 'var(--blue-dim)' };
          return '<div class="card card-hover onboard-choice' + (data.goal === goal ? ' selected' : '') + '" data-goal="' + goal + '">' +
            '<div style="display:flex;align-items:center;gap:14px">' +
              choiceBadge(icons[goal], backgrounds[goal], colors[goal], colors[goal], 22) +
              '<div><div class="t-title">' + labels[goal] + '</div><div class="t-hint">' + descriptions[goal] + '</div></div>' +
              '<div class="onboard-choice-check">' + TF.Icon('check-circle', 18) + '</div>' +
            '</div>' +
          '</div>';
        }).join('') +
        '<div style="height:16px"></div>' +
        '<button class="btn btn-primary" id="ob-next">NEXT ' + TF.Icon('arrow-right', 14) + '</button>' +
      '</div>';
    },
    function(){
      return '<div class="onboard-step">' +
        stepNav() +
        '<div class="onboard-step-num">STEP 3 OF 3</div>' +
        '<div class="onboard-dots"><div class="onboard-dot"></div><div class="onboard-dot"></div><div class="onboard-dot active"></div></div>' +
        stepBadge('dumbbell', 'var(--amber-dim)', 'var(--amber)', 'var(--amber)') +
        '<div class="t-headline" style="font-size:28px;margin-bottom:8px">What equipment<br>do you have?</div>' +
        '<div class="t-body" style="margin-bottom:28px">We will build a workout plan around what you actually have access to.</div>' +
        '<div class="toggle-row" id="tgl-equip" style="flex-direction:column;gap:10px">' +
          ['none', 'minimal', 'full'].map(function(option){
            var labels = {
              none: 'No equipment (bodyweight only)',
              minimal: 'Dumbbells / home gym',
              full: 'Full gym access'
            };
            var icons = { none: 'activity', minimal: 'dumbbell', full: 'target' };
            var colors = { none: 'var(--teal)', minimal: 'var(--amber)', full: 'var(--blue)' };
            var backgrounds = { none: 'var(--teal-dim)', minimal: 'var(--amber-dim)', full: 'var(--blue-dim)' };
            return '<div class="toggle-chip ' + (data.equipment === option ? 'on' : '') + '" data-val="' + option + '" style="text-align:left;padding:14px;display:flex;align-items:center;gap:12px">' +
              choiceBadge(icons[option], backgrounds[option], colors[option], colors[option], 20) +
              '<span>' + labels[option] + '</span>' +
            '</div>';
          }).join('') +
        '</div>' +
        '<div style="margin:20px 0;padding:14px;background:var(--bg-2);border-radius:var(--r-sm);border:1px solid var(--border)">' +
          '<div class="t-label" style="margin-bottom:8px">Experience Level</div>' +
          '<div class="toggle-row" id="tgl-exp">' +
            [['beginner', 'Beginner'], ['intermediate', 'Intermediate'], ['advanced', 'Advanced']].map(function(option){
              return '<div class="toggle-chip ' + (data.experience === option[0] ? 'on' : '') + '" data-val="' + option[0] + '">' + option[1] + '</div>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<button class="btn btn-primary" id="ob-next">' + TF.Icon('zap', 14) + ' START MY JOURNEY</button>' +
      '</div>';
    }
  ];

  function render() {
    root.innerHTML = '<div class="screen-full" style="background:var(--bg-base);overflow:auto;min-height:100dvh">' +
      '<div style="max-width:440px;margin:0 auto">' + STEPS[step]() + '</div></div>';

    var back = root.querySelector('#ob-back');
    if (back) {
      back.addEventListener('click', function() {
        step = Math.max(0, step - 1);
        render();
        TF.UI.haptic(20);
      });
    }

    var backStart = root.querySelector('#ob-back-start');
    if (backStart) {
      backStart.addEventListener('click', function() {
        step = 0;
        render();
        TF.UI.haptic(20);
      });
    }

    root.querySelectorAll('[data-goal]').forEach(function(el){
      el.addEventListener('click', function(){
        data.goal = el.dataset.goal;
        root.querySelectorAll('[data-goal]').forEach(function(card){
          card.classList.toggle('selected', card === el);
        });
      });
    });

    TF.UI.initToggle(root, 'tgl-equip');
    TF.UI.initToggle(root, 'tgl-exp');

    root.querySelectorAll('#tgl-equip .toggle-chip').forEach(function(chip){
      chip.addEventListener('click', function(){
        data.equipment = chip.dataset.val;
      });
    });

    root.querySelectorAll('#tgl-exp .toggle-chip').forEach(function(chip){
      chip.addEventListener('click', function(){
        data.experience = chip.dataset.val;
      });
    });

    var next = root.querySelector('#ob-next');
    if (next) {
      next.addEventListener('click', function() {
        if (step === 0) {
          var name = (root.querySelector('#ob-name').value || '').trim();
          if (!name) {
            TF.UI.toast('Enter your name to continue.', 'error');
            return;
          }
          data.name = name;
        }

        if (step === 2) {
          var equipment = root.querySelector('#tgl-equip .toggle-chip.on');
          var experience = root.querySelector('#tgl-exp .toggle-chip.on');
          var profile = TF.Store.getProfile();
          var bodyWeight = profile.bodyWeightKg || 75;
          var calorieMultiplier = TF.Config.CalorieMultipliers[data.goal] || 33;
          var proteinMultiplier = TF.Config.ProteinPerKg[data.goal] || 2.0;

          if (equipment) data.equipment = equipment.dataset.val;
          if (experience) data.experience = experience.dataset.val;

          TF.Store.saveProfile({
            name: data.name,
            goal: data.goal,
            equipment: data.equipment,
            experience: data.experience,
            targetCalories: Math.round(bodyWeight * calorieMultiplier),
            targetProtein: Math.round(bodyWeight * proteinMultiplier),
            createdAt: new Date().toISOString()
          });

          TF.Store.markOnboarded();
          TF.UI.haptic(100);
          TF.UI.confetti();
          TF.UI.toast('Welcome, ' + data.name + '. Export a backup soon from Profile.', 'success');
          TF.Router.navigate('checkin', true);
          setTimeout(function(){
            if (TF.App && TF.App.maybeShowBackupReminder) {
              TF.App.maybeShowBackupReminder(true);
            }
          }, 250);
          return;
        }

        step += 1;
        render();
        TF.UI.haptic(30);
      });
    }
  }

  render();
};
