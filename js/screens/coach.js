/* ================================================================
   AI EXPORT SCREEN v4 - prompt builder for any LLM
   No built-in model calls, just copy-ready context
   ================================================================ */
TF.Screens.coach = function(root) {
  'use strict';

  var MODES = {
    daily: {
      label: 'Daily review',
      goal: 'Review today\'s recovery, discipline, nutrition, and habits.',
      output: 'Return: 1. top observations, 2. immediate corrections for today, 3. tomorrow plan.'
    },
    weekly: {
      label: 'Weekly review',
      goal: 'Review the last 7 days and identify patterns, momentum, and weak spots.',
      output: 'Return: 1. weekly wins, 2. repeating issues, 3. next-week adjustments.'
    },
    training: {
      label: 'Training plan',
      goal: 'Use the profile, recovery, recent workouts, and PRs to advise training.',
      output: 'Return: 1. what to train next, 2. volume/intensity advice, 3. overload suggestion.'
    },
    nutrition: {
      label: 'Nutrition audit',
      goal: 'Review calorie, protein, water, and goal alignment.',
      output: 'Return: 1. nutrition gaps, 2. protein/calorie targets, 3. one-day food strategy.'
    },
    habits: {
      label: 'Habit coaching',
      goal: 'Review habit consistency, streaks, and identity-based behavior.',
      output: 'Return: 1. highest-value habit, 2. easiest win, 3. accountability plan.'
    }
  };

  var state = {
    mode: 'daily'
  };

  function goalLabel(goal){
    if (goal === 'muscle') return 'Build muscle';
    if (goal === 'fatLoss') return 'Lose fat';
    return 'Build discipline';
  }

  function exerciseSummary(log){
    if (!log || !log.exercises) {
      return [];
    }
    return Object.keys(log.exercises).map(function(name){
      var sets = log.exercises[name] || [];
      var completedSets = sets.filter(function(set){ return set.done; }).length;
      return name + ': ' + completedSets + ' completed sets';
    });
  }

  function buildSnapshot(){
    var profile = TF.Store.getProfile();
    var todayInput = TF.Store.getTodayInput();
    var yesterdayInput = TF.Store.getInputForDate(TF.Store.yesterday());
    var todayNutrition = TF.Store.getTodayNutrition();
    var todayMissions = TF.Store.getTodayMissions();
    var todayHabits = TF.Habits.getTodayStatus();
    var habitStreaks = TF.Store.getHabitStreaks();
    var lastInputs = TF.Store.getLastNInputs(7);
    var weightLog = TF.Store.getWeightLog().slice(0, 5);
    var measurements = TF.Store.getMeasurements().slice(0, 3);
    var workoutDates = TF.Store.getWorkoutDates().sort().reverse().slice(0, 5);
    var recentWorkouts = workoutDates.map(function(dateKey){
      var log = TF.Store.getAllWorkoutLogs()[dateKey];
      return {
        date: dateKey,
        exercises: exerciseSummary(log)
      };
    });
    var prs = TF.Store.getPRs();
    var missionStats = TF.Store.getMissionStats();

    return {
      exportedAt: new Date().toISOString(),
      profile: {
        name: profile.name,
        goal: goalLabel(profile.goal),
        experience: profile.experience,
        equipment: profile.equipment,
        bodyWeightKg: profile.bodyWeightKg,
        targetCalories: profile.targetCalories,
        targetProtein: profile.targetProtein,
        availableMinutes: profile.availableMinutes,
        xp: profile.xp,
        level: TF.Store.getLevel(profile),
        streakDays: profile.streakDays || 0
      },
      todayCheckin: todayInput ? {
        dailyScore: TF.Score.daily(todayInput),
        recoveryScore: TF.Score.recovery(todayInput),
        disciplineScore: TF.Score.discipline(todayInput),
        sleepHours: todayInput.sleepHours,
        sleepQuality: todayInput.sleepQuality,
        energy: todayInput.energy,
        mood: todayInput.mood,
        focus: todayInput.focus,
        stress: todayInput.stress,
        disciplineYesterday: !!todayInput.disciplineYesterday,
        trainingRecommendation: TF.Score.trainingRec(TF.Score.recovery(todayInput))
      } : null,
      yesterdayCheckin: yesterdayInput ? {
        dailyScore: TF.Score.daily(yesterdayInput),
        recoveryScore: TF.Score.recovery(yesterdayInput),
        disciplineScore: TF.Score.discipline(yesterdayInput)
      } : null,
      todayNutrition: todayNutrition,
      todayMissions: todayMissions.map(function(mission){
        return {
          title: mission.title,
          done: !!mission.done,
          xpReward: mission.xpReward
        };
      }),
      missionStats: missionStats,
      todayHabits: todayHabits.map(function(habit){
        var streak = habitStreaks[habit.id] || { current: 0, best: 0 };
        return {
          id: habit.id,
          label: habit.label,
          done: !!habit.done,
          xp: habit.xp,
          streakCurrent: streak.current,
          streakBest: streak.best,
          weeklyRate: TF.Habits.getWeeklyRate(habit.id)
        };
      }),
      last7Checkins: lastInputs.map(function(input){
        return {
          date: input.dateKey,
          dailyScore: TF.Score.daily(input),
          recoveryScore: TF.Score.recovery(input),
          disciplineScore: TF.Score.discipline(input),
          sleepHours: input.sleepHours,
          energy: input.energy,
          stress: input.stress
        };
      }),
      weightLog: weightLog,
      measurements: measurements,
      recentWorkouts: recentWorkouts,
      prs: prs
    };
  }

  function buildPrompt(mode, userQuestion){
    var modeConfig = MODES[mode] || MODES.daily;
    var snapshot = buildSnapshot();
    var promptLines = [
      'You are a direct, evidence-based performance coach.',
      'Use only the data below. If something is missing, say it is missing instead of inventing it.',
      'Focus: ' + modeConfig.goal,
      modeConfig.output,
      'Keep the response practical and specific.',
      userQuestion ? 'User question: ' + userQuestion : 'User question: Give the best next actions based on this snapshot.',
      'Data snapshot:',
      JSON.stringify(snapshot, null, 2)
    ];
    return promptLines.join('\n\n');
  }

  function buildRawData(){
    return JSON.stringify(buildSnapshot(), null, 2);
  }

  function render(){
    root.innerHTML = '<div class="screen">' +
      '<div class="hero-img-card" id="ai-export-hero" style="margin-bottom:14px">' +
        '<div class="skeleton" style="position:absolute;inset:0;border-radius:var(--r-lg)"></div>' +
        '<div class="hero-img-card-content">' +
          '<div class="t-label" style="color:var(--lime);margin-bottom:5px">AI EXPORT</div>' +
          '<div class="t-headline" style="font-size:24px">Prompt Builder</div>' +
          '<div class="t-hint" style="margin-top:4px">Package your data, then paste it into ChatGPT, Gemini, Claude, or any other LLM.</div>' +
        '</div>' +
      '</div>' +

      '<div class="card card-sm" style="margin-bottom:14px">' +
        '<div class="t-label" style="margin-bottom:8px">How it works</div>' +
        '<div class="t-hint">This screen does not call any built-in AI. It generates a copy-ready prompt and a raw JSON snapshot from your local data only.</div>' +
      '</div>' +

      '<div class="card" style="margin-bottom:12px">' +
        '<div class="t-label" style="margin-bottom:10px">Prompt type</div>' +
        '<div class="toggle-row" id="llm-mode">' +
          Object.keys(MODES).map(function(key){
            return '<div class="toggle-chip ' + (state.mode === key ? 'on' : '') + '" data-mode="' + key + '">' + MODES[key].label + '</div>';
          }).join('') +
        '</div>' +
      '</div>' +

      '<div class="card" style="margin-bottom:12px">' +
        '<div class="field-group">' +
          '<div class="field-label">Optional question for the external AI</div>' +
          '<textarea class="field" id="llm-question" rows="3" placeholder="Example: What should I focus on for the next 3 days?"></textarea>' +
        '</div>' +
      '</div>' +

      '<div class="card" style="margin-bottom:12px">' +
        '<div class="flex-between" style="margin-bottom:10px">' +
          '<div class="t-label">Copy-ready prompt</div>' +
          '<button class="btn btn-sm btn-ghost" id="btn-refresh-prompt" style="width:auto;padding:6px 10px">' + TF.Icon('rotate-ccw', 12) + ' Refresh</button>' +
        '</div>' +
        '<textarea class="field" id="llm-output" rows="18" readonly style="font-family:var(--font-m);font-size:12px;line-height:1.45;resize:vertical"></textarea>' +
        '<div style="display:flex;gap:8px;margin-top:12px">' +
          '<button class="btn btn-primary" id="btn-copy-prompt">' + TF.Icon('copy', 14) + ' Copy prompt</button>' +
          '<button class="btn btn-secondary" id="btn-copy-json">' + TF.Icon('download', 14) + ' Copy raw JSON</button>' +
        '</div>' +
      '</div>' +

      '<div class="card card-sm">' +
        '<div class="t-label" style="margin-bottom:8px">Paste tip</div>' +
        '<div class="t-hint">Paste the prompt first, then ask follow-up questions in the same chat so the LLM keeps your context.</div>' +
      '</div>' +
      '<div style="height:8px"></div>' +
    '</div>';

    TF.UI.setHeroImg(root.querySelector('#ai-export-hero'), TF.Config.Images.mindset);

    TF.UI.initToggle(root, 'llm-mode');

    var questionEl = root.querySelector('#llm-question');
    var outputEl = root.querySelector('#llm-output');

    function syncOutput(){
      outputEl.value = buildPrompt(state.mode, (questionEl.value || '').trim());
    }

    root.querySelectorAll('#llm-mode .toggle-chip').forEach(function(chip){
      chip.addEventListener('click', function(){
        state.mode = chip.dataset.mode;
        syncOutput();
      });
    });

    questionEl.addEventListener('input', syncOutput);

    root.querySelector('#btn-refresh-prompt').addEventListener('click', function(){
      syncOutput();
      TF.UI.toast('Prompt refreshed.');
    });

    root.querySelector('#btn-copy-prompt').addEventListener('click', function(){
      TF.UI.copyText(outputEl.value).then(function(){
        TF.UI.toast('Prompt copied.', 'success');
      }).catch(function(){
        TF.UI.toast('Clipboard blocked.', 'error');
      });
    });

    root.querySelector('#btn-copy-json').addEventListener('click', function(){
      TF.UI.copyText(buildRawData()).then(function(){
        TF.UI.toast('Raw JSON copied.', 'success');
      }).catch(function(){
        TF.UI.toast('Clipboard blocked.', 'error');
      });
    });

    syncOutput();
  }

  render();
};
