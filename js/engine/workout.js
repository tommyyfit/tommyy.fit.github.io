TF.Workout = (function() {
  'use strict';

  var LIB = {
    push: [
      [
        { name: 'Bench Press', sets: 4, reps: '5-6', rest: '3 min', note: 'Drive feet into floor and keep the press tight.', restSeconds: 180 },
        { name: 'Overhead Press', sets: 3, reps: '6-8', rest: '2 min', note: 'Brace hard and finish with a full lockout.', restSeconds: 120 },
        { name: 'Incline DB Press', sets: 3, reps: '8-10', rest: '90 sec', note: 'Control the stretch and keep the path smooth.', restSeconds: 90 },
        { name: 'Tricep Pushdown', sets: 3, reps: '12-15', rest: '60 sec', note: 'Pin elbows and squeeze through the finish.', restSeconds: 60 },
        { name: 'Lateral Raises', sets: 4, reps: '15-20', rest: '45 sec', note: 'Lead with elbows and pause briefly at the top.', restSeconds: 45 }
      ],
      [
        { name: 'Incline Bench Press', sets: 4, reps: '6-8', rest: '3 min', note: 'Upper chest bias with a strong leg drive.', restSeconds: 180 },
        { name: 'Seated DB Shoulder Press', sets: 3, reps: '8-10', rest: '90 sec', note: 'Stay stacked and avoid a loose lower back.', restSeconds: 90 },
        { name: 'Weighted Dips', sets: 3, reps: '8-10', rest: '2 min', note: 'Shoulders down and chest proud on every rep.', restSeconds: 120 },
        { name: 'Cable Fly', sets: 3, reps: '12-15', rest: '60 sec', note: 'Bring the handles together under full control.', restSeconds: 60 },
        { name: 'Skull Crushers', sets: 3, reps: '10-12', rest: '60 sec', note: 'Lower behind the forehead and keep elbows steady.', restSeconds: 60 }
      ],
      [
        { name: 'Close-Grip Bench Press', sets: 4, reps: '6-8', rest: '2 min', note: 'Tuck elbows slightly and stay explosive.', restSeconds: 120 },
        { name: 'Arnold Press', sets: 3, reps: '8-10', rest: '90 sec', note: 'Rotate smoothly and keep the shoulders packed.', restSeconds: 90 },
        { name: 'Machine Chest Press', sets: 3, reps: '10-12', rest: '90 sec', note: 'Drive with intent and own the eccentric.', restSeconds: 90 },
        { name: 'Overhead Rope Extension', sets: 3, reps: '12-15', rest: '60 sec', note: 'Full stretch overhead and strong lockout.', restSeconds: 60 },
        { name: 'Lean-Away Raise', sets: 3, reps: '15-18', rest: '45 sec', note: 'Small arc, no swing, constant delt tension.', restSeconds: 45 }
      ]
    ],
    pull: [
      [
        { name: 'Deadlift', sets: 4, reps: '4-5', rest: '3 min', note: 'Brace before every pull and keep the bar close.', restSeconds: 180 },
        { name: 'Weighted Pull-ups', sets: 4, reps: 'Max', rest: '2 min', note: 'Full dead hang and smooth chest-up finish.', restSeconds: 120 },
        { name: 'Barbell Row', sets: 3, reps: '6-8', rest: '2 min', note: 'Keep the hinge fixed and row to the lower chest.', restSeconds: 120 },
        { name: 'Face Pulls', sets: 3, reps: '15-20', rest: '60 sec', note: 'Lead high and rotate through the end range.', restSeconds: 60 },
        { name: 'Hammer Curl', sets: 3, reps: '10-12', rest: '60 sec', note: 'Neutral grip and slow lowering every rep.', restSeconds: 60 }
      ],
      [
        { name: 'Rack Pull', sets: 4, reps: '5-6', rest: '3 min', note: 'Stay wedged and finish by driving hips through.', restSeconds: 180 },
        { name: 'Chest-Supported Row', sets: 4, reps: '8-10', rest: '90 sec', note: 'Pull toward the lower ribs and pause hard.', restSeconds: 90 },
        { name: 'Lat Pulldown', sets: 3, reps: '10-12', rest: '75 sec', note: 'Elbows to hips and no torso swinging.', restSeconds: 75 },
        { name: 'Rear Delt Fly', sets: 3, reps: '15-18', rest: '45 sec', note: 'Think wide, not high, and keep traps quiet.', restSeconds: 45 },
        { name: 'EZ-Bar Curl', sets: 3, reps: '10-12', rest: '60 sec', note: 'Keep shoulders down and finish through the pinkies.', restSeconds: 60 }
      ],
      [
        { name: 'Trap Bar Deadlift', sets: 4, reps: '4-6', rest: '3 min', note: 'Push the floor away and keep your chest tall.', restSeconds: 180 },
        { name: 'Neutral-Grip Pulldown', sets: 4, reps: '8-10', rest: '90 sec', note: 'Drive elbows down and keep ribs stacked.', restSeconds: 90 },
        { name: 'One-Arm Cable Row', sets: 3, reps: '10-12', rest: '75 sec', note: 'Reach long, then row tight to the hip.', restSeconds: 75 },
        { name: 'Cable Face Pull', sets: 3, reps: '15-20', rest: '45 sec', note: 'Finish with clean external rotation.', restSeconds: 45 },
        { name: 'Incline DB Curl', sets: 3, reps: '10-12', rest: '60 sec', note: 'Stay stretched at the bottom and avoid swinging.', restSeconds: 60 }
      ]
    ],
    legs: [
      [
        { name: 'Back Squat', sets: 4, reps: '5-6', rest: '3 min', note: 'Brace first, hit depth, and drive evenly through the floor.', restSeconds: 180 },
        { name: 'Romanian Deadlift', sets: 3, reps: '8-10', rest: '2 min', note: 'Keep the hinge clean and own the hamstring stretch.', restSeconds: 120 },
        { name: 'Leg Press', sets: 3, reps: '10-12', rest: '90 sec', note: 'Full range and smooth lockout without bouncing.', restSeconds: 90 },
        { name: 'Leg Curl', sets: 3, reps: '10-12', rest: '60 sec', note: 'Pause in the squeeze and stay in control.', restSeconds: 60 },
        { name: 'Calf Raises', sets: 4, reps: '15-20', rest: '30 sec', note: 'Full stretch low and a hard pause at the top.', restSeconds: 30 }
      ],
      [
        { name: 'Front Squat', sets: 4, reps: '5-7', rest: '3 min', note: 'Elbows high and torso tall all the way down.', restSeconds: 180 },
        { name: 'Barbell Hip Thrust', sets: 4, reps: '8-10', rest: '90 sec', note: 'Posterior pelvic tilt and hard glute lockout.', restSeconds: 90 },
        { name: 'Walking Lunge', sets: 3, reps: '10 ea', rest: '90 sec', note: 'Long stride and stable trunk through every step.', restSeconds: 90 },
        { name: 'Leg Extension', sets: 3, reps: '12-15', rest: '60 sec', note: 'Smooth squeeze at the top and no momentum.', restSeconds: 60 },
        { name: 'Seated Calf Raise', sets: 4, reps: '15-20', rest: '30 sec', note: 'Pause deep at the bottom before driving up.', restSeconds: 30 }
      ],
      [
        { name: 'Hack Squat', sets: 4, reps: '8-10', rest: '2 min', note: 'Drive knees forward and keep pressure mid-foot.', restSeconds: 120 },
        { name: 'Good Morning', sets: 3, reps: '8-10', rest: '2 min', note: 'Soft knees, strong brace, and a clean hip hinge.', restSeconds: 120 },
        { name: 'Bulgarian Split Squat', sets: 3, reps: '10 ea', rest: '90 sec', note: 'Stay stacked and sink straight down.', restSeconds: 90 },
        { name: 'Lying Leg Curl', sets: 3, reps: '12-15', rest: '60 sec', note: 'Control the negative and keep hips heavy.', restSeconds: 60 },
        { name: 'Standing Calf Raise', sets: 4, reps: '15-18', rest: '30 sec', note: 'Let the heel drop and finish every rep tall.', restSeconds: 30 }
      ]
    ],
    push_min: [
      [
        { name: 'DB Bench Press', sets: 4, reps: '8-10', rest: '90 sec', note: 'Use full range and keep the dumbbells stable.', restSeconds: 90 },
        { name: 'DB Shoulder Press', sets: 3, reps: '8-10', rest: '90 sec', note: 'Press straight up and avoid flaring early.', restSeconds: 90 },
        { name: 'DB Incline Press', sets: 3, reps: '10-12', rest: '90 sec', note: 'Slight incline and slow lowering.', restSeconds: 90 },
        { name: 'DB Lateral Raise', sets: 3, reps: '15', rest: '45 sec', note: 'Control the top and keep traps relaxed.', restSeconds: 45 },
        { name: 'DB Tricep Extension', sets: 3, reps: '12-15', rest: '60 sec', note: 'Deep stretch overhead and full extension.', restSeconds: 60 }
      ],
      [
        { name: 'DB Floor Press', sets: 4, reps: '8-10', rest: '90 sec', note: 'Pause on the floor and drive hard each rep.', restSeconds: 90 },
        { name: 'Arnold Press', sets: 3, reps: '8-10', rest: '75 sec', note: 'Rotate smoothly and stay stacked.', restSeconds: 75 },
        { name: 'Deficit Push-ups', sets: 3, reps: '12-15', rest: '60 sec', note: 'Deeper range and controlled chest touch.', restSeconds: 60 },
        { name: 'DB Fly', sets: 3, reps: '12-15', rest: '60 sec', note: 'Open wide and keep the elbow angle fixed.', restSeconds: 60 },
        { name: 'DB Kickback', sets: 3, reps: '12-15', rest: '45 sec', note: 'Upper arm still, full squeeze at lockout.', restSeconds: 45 }
      ],
      [
        { name: 'Neutral-Grip DB Press', sets: 4, reps: '8-10', rest: '90 sec', note: 'Press in a narrow path and stay smooth.', restSeconds: 90 },
        { name: 'Half-Kneeling DB Press', sets: 3, reps: '8 ea', rest: '75 sec', note: 'Brace glutes and keep the rib cage down.', restSeconds: 75 },
        { name: 'Close-Grip Push-ups', sets: 3, reps: 'Max', rest: '60 sec', note: 'Stay rigid and keep elbows tracking back.', restSeconds: 60 },
        { name: 'Lean Lateral Raise', sets: 3, reps: '15-18', rest: '45 sec', note: 'Short arc with constant shoulder tension.', restSeconds: 45 },
        { name: 'Overhead DB Extension', sets: 3, reps: '12-15', rest: '60 sec', note: 'Long range and a strong finish overhead.', restSeconds: 60 }
      ]
    ],
    pull_min: [
      [
        { name: 'One-Arm DB Row', sets: 4, reps: '8-10', rest: '90 sec', note: 'Row toward the hip and pause the top.', restSeconds: 90 },
        { name: 'Pull-ups or Rows', sets: 4, reps: 'Max', rest: '2 min', note: 'Pull-ups first, rows if no bar is available.', restSeconds: 120 },
        { name: 'DB Rear Delt Fly', sets: 3, reps: '15', rest: '45 sec', note: 'Think wide and back through the shoulder.', restSeconds: 45 },
        { name: 'DB Shrug', sets: 3, reps: '15', rest: '45 sec', note: 'Straight up, brief pause, then slow down.', restSeconds: 45 },
        { name: 'DB Curl', sets: 3, reps: '10-12', rest: '60 sec', note: 'Curl clean and lower slower than you lift.', restSeconds: 60 }
      ],
      [
        { name: 'Chest-Supported DB Row', sets: 4, reps: '10-12', rest: '75 sec', note: 'Stay glued to the bench and pull to the ribs.', restSeconds: 75 },
        { name: 'Chin-ups or Inverted Rows', sets: 4, reps: 'Max', rest: '90 sec', note: 'Use a full range and avoid bouncing.', restSeconds: 90 },
        { name: 'DB Pullover', sets: 3, reps: '12-15', rest: '60 sec', note: 'Long stretch and steady rib position.', restSeconds: 60 },
        { name: 'Reverse Fly', sets: 3, reps: '15-18', rest: '45 sec', note: 'Move through the shoulder, not the lower back.', restSeconds: 45 },
        { name: 'Hammer Curl', sets: 3, reps: '10-12', rest: '60 sec', note: 'Neutral grip and tight elbows.', restSeconds: 60 }
      ],
      [
        { name: 'Bent-Over DB Row', sets: 4, reps: '10-12', rest: '75 sec', note: 'Lock the hinge in place and row hard.', restSeconds: 75 },
        { name: 'Renegade Row', sets: 3, reps: '8 ea', rest: '75 sec', note: 'Stay square and brace through the floor.', restSeconds: 75 },
        { name: 'Towel Row', sets: 3, reps: '12-15', rest: '60 sec', note: 'Pull elbows close and keep tension constant.', restSeconds: 60 },
        { name: 'DB Shrug', sets: 3, reps: '15', rest: '45 sec', note: 'Heavy and crisp through the top.', restSeconds: 45 },
        { name: 'Zottman Curl', sets: 3, reps: '10-12', rest: '60 sec', note: 'Control the lowering on the pronated side.', restSeconds: 60 }
      ]
    ],
    legs_min: [
      [
        { name: 'Goblet Squat', sets: 4, reps: '10-12', rest: '90 sec', note: 'Stay tall and sink between the knees.', restSeconds: 90 },
        { name: 'DB Romanian Deadlift', sets: 3, reps: '10-12', rest: '90 sec', note: 'Soft knees and a clean hinge path.', restSeconds: 90 },
        { name: 'DB Split Squat', sets: 3, reps: '10 ea', rest: '90 sec', note: 'Drop straight down and keep front foot rooted.', restSeconds: 90 },
        { name: 'DB Hip Thrust', sets: 3, reps: '15', rest: '60 sec', note: 'Pause hard at the top without overextending.', restSeconds: 60 },
        { name: 'Calf Raises', sets: 4, reps: '20', rest: '30 sec', note: 'Full range and no rushing the bottom stretch.', restSeconds: 30 }
      ],
      [
        { name: 'Front Rack DB Squat', sets: 4, reps: '8-10', rest: '90 sec', note: 'Elbows forward and a stable trunk.', restSeconds: 90 },
        { name: 'Staggered-Stance RDL', sets: 3, reps: '10 ea', rest: '75 sec', note: 'Bias the front leg and keep hips square.', restSeconds: 75 },
        { name: 'Reverse Lunge', sets: 3, reps: '10 ea', rest: '75 sec', note: 'Step back long and stay tall through the torso.', restSeconds: 75 },
        { name: 'Glute Bridge March', sets: 3, reps: '12 ea', rest: '45 sec', note: 'Keep hips level while driving through the heel.', restSeconds: 45 },
        { name: 'Single-Leg Calf Raise', sets: 4, reps: '15 ea', rest: '30 sec', note: 'Pause high and control the heel drop.', restSeconds: 30 }
      ],
      [
        { name: 'Tempo Goblet Squat', sets: 4, reps: '8-10', rest: '90 sec', note: '3-second lower, short pause, drive up fast.', restSeconds: 90 },
        { name: 'DB Step-Up', sets: 3, reps: '10 ea', rest: '75 sec', note: 'Control the descent and own the top position.', restSeconds: 75 },
        { name: 'Single-Leg RDL', sets: 3, reps: '8 ea', rest: '75 sec', note: 'Reach long and stay square through the hips.', restSeconds: 75 },
        { name: 'DB Sumo Squat', sets: 3, reps: '12-15', rest: '60 sec', note: 'Push knees out and keep chest lifted.', restSeconds: 60 },
        { name: 'Calf Raises', sets: 4, reps: '18-20', rest: '30 sec', note: 'Slow down the lower half of every rep.', restSeconds: 30 }
      ]
    ],
    bodyweight: [
      [
        { name: 'Push-ups', sets: 4, reps: 'Max', rest: '90 sec', note: 'Chest to floor and a full lockout every time.', restSeconds: 90 },
        { name: 'Pike Push-ups', sets: 3, reps: '10-12', rest: '60 sec', note: 'Keep hips high and drive vertically.', restSeconds: 60 },
        { name: 'Bulgarian Split Squat', sets: 3, reps: '10 ea', rest: '90 sec', note: 'Use a chair and stay tall through the torso.', restSeconds: 90 },
        { name: 'Glute Bridge', sets: 3, reps: '20', rest: '60 sec', note: 'Squeeze at the top without flaring the ribs.', restSeconds: 60 },
        { name: 'Plank', sets: 3, reps: '60 sec', rest: '45 sec', note: 'Brace hard and keep hips level.', restSeconds: 45 },
        { name: 'Chair Dips', sets: 3, reps: 'Max', rest: '90 sec', note: 'Shoulders down and elbows tracking back.', restSeconds: 90 }
      ],
      [
        { name: 'Decline Push-ups', sets: 4, reps: 'Max', rest: '75 sec', note: 'Feet elevated and body rigid through the set.', restSeconds: 75 },
        { name: 'Chair Tricep Dip', sets: 3, reps: '12-15', rest: '60 sec', note: 'Lower with control and keep chest proud.', restSeconds: 60 },
        { name: 'Reverse Lunge', sets: 3, reps: '12 ea', rest: '75 sec', note: 'Step back long and stay balanced.', restSeconds: 75 },
        { name: 'Single-Leg Hip Bridge', sets: 3, reps: '12 ea', rest: '45 sec', note: 'Drive through the heel and keep hips level.', restSeconds: 45 },
        { name: 'Hollow Hold', sets: 3, reps: '30-40 sec', rest: '45 sec', note: 'Lower back down and keep ribs tucked.', restSeconds: 45 },
        { name: 'Superman Row', sets: 3, reps: '15', rest: '45 sec', note: 'Lift chest slightly and pull elbows back.', restSeconds: 45 }
      ],
      [
        { name: 'Diamond Push-ups', sets: 4, reps: 'Max', rest: '75 sec', note: 'Stay tight and control the lower phase.', restSeconds: 75 },
        { name: 'Hand-Release Push-ups', sets: 3, reps: '10-15', rest: '60 sec', note: 'Dead-stop every rep and explode up.', restSeconds: 60 },
        { name: 'Walking Lunge', sets: 3, reps: '12 ea', rest: '75 sec', note: 'Long stride and soft landing every step.', restSeconds: 75 },
        { name: 'Squat Jump', sets: 3, reps: '10', rest: '60 sec', note: 'Land softly and reset between reps.', restSeconds: 60 },
        { name: 'Side Plank', sets: 3, reps: '30 sec ea', rest: '30 sec', note: 'Long line from shoulder through heel.', restSeconds: 30 },
        { name: 'Mountain Climbers', sets: 3, reps: '30 sec', rest: '30 sec', note: 'Fast feet with a stable torso.', restSeconds: 30 }
      ]
    ],
    recovery: [
      [
        { name: 'Hip Flexor Stretch', sets: 2, reps: '60 sec ea', rest: '20 sec', note: 'Breathe deep and gently squeeze the back glute.', restSeconds: 20 },
        { name: 'Cat-Cow', sets: 2, reps: '12 reps', rest: '20 sec', note: 'Move one segment at a time and match the breath.', restSeconds: 20 },
        { name: 'Worlds Greatest Stretch', sets: 2, reps: '5 ea', rest: '30 sec', note: 'Reach long, rotate slow, and exhale fully.', restSeconds: 30 },
        { name: 'Thoracic Rotation', sets: 2, reps: '10 ea', rest: '30 sec', note: 'Rotate through the upper back, not the low back.', restSeconds: 30 },
        { name: 'Box Breathing', sets: 1, reps: '10 cycles', rest: '0 sec', note: '4 in, 4 hold, 4 out, 4 hold.', restSeconds: 0 }
      ],
      [
        { name: 'Couch Stretch', sets: 2, reps: '45 sec ea', rest: '20 sec', note: 'Stay tall and do not arch through the low back.', restSeconds: 20 },
        { name: 'Child Pose to Cobra', sets: 2, reps: '8 reps', rest: '20 sec', note: 'Move smoothly and breathe through the transition.', restSeconds: 20 },
        { name: '90/90 Switch', sets: 2, reps: '10 ea', rest: '20 sec', note: 'Stay upright and rotate from the hips.', restSeconds: 20 },
        { name: 'Wall Slide', sets: 2, reps: '12 reps', rest: '20 sec', note: 'Keep ribs down and let the shoulder blades move.', restSeconds: 20 },
        { name: 'Nasal Breathing Walk', sets: 1, reps: '8 min', rest: '0 sec', note: 'Easy pace with quiet nose breathing only.', restSeconds: 0 }
      ]
    ]
  };

  var SCHEDULES = {
    muscle: [
      { 1: 'push', 2: 'pull', 3: 'legs', 4: null, 5: 'push', 6: 'pull', 0: 'legs' },
      { 1: 'legs', 2: 'push', 3: 'pull', 4: null, 5: 'legs', 6: 'push', 0: 'pull' }
    ],
    fatLoss: [
      { 1: 'push', 2: 'legs', 3: 'pull', 4: 'bodyweight', 5: 'push', 6: 'legs', 0: 'bodyweight' },
      { 1: 'pull', 2: 'legs', 3: 'push', 4: 'bodyweight', 5: 'pull', 6: 'legs', 0: 'bodyweight' }
    ],
    discipline: [
      { 1: 'bodyweight', 2: 'push', 3: 'pull', 4: null, 5: 'legs', 6: 'bodyweight', 0: null },
      { 1: 'push', 2: 'bodyweight', 3: 'legs', 4: null, 5: 'pull', 6: 'bodyweight', 0: null }
    ],
    none: [
      { 1: 'bodyweight', 2: 'bodyweight', 3: 'bodyweight', 4: null, 5: 'bodyweight', 6: 'bodyweight', 0: null },
      { 1: 'bodyweight', 2: 'bodyweight', 3: null, 4: 'bodyweight', 5: 'bodyweight', 6: 'bodyweight', 0: null }
    ]
  };

  var TITLES = {
    push: 'Push Day',
    pull: 'Pull Day',
    legs: 'Leg Day',
    bodyweight: 'Personal Full-Body',
    recovery: 'Active Recovery'
  };

  var FOCUS_LABELS = {
    push: 'Push day focused on pressing strength, shoulders, and triceps.',
    pull: 'Pull day focused on back thickness, lats, and biceps.',
    legs: 'Leg day focused on lower-body strength and stability.',
    bodyweight: 'Full-body work tuned to your setup and consistency goal.',
    recovery: 'Recovery flow for mobility, breathing, and restoring readiness.'
  };

  var MOTIVATIONAL = {
    push: 'Own the press. Clean reps beat sloppy ego every time.',
    pull: 'Strong backs are built by patience, tension, and perfect pulls.',
    legs: 'Lower-body work is where discipline becomes visible.',
    bodyweight: 'No machine needed. Your consistency is the real equipment.',
    recovery: 'Recovery is part of the program, not a day off from it.'
  };

  var IMAGES = {
    push: TF.Config.Images.push,
    pull: TF.Config.Images.pull,
    legs: TF.Config.Images.legs,
    bodyweight: TF.Config.Images.workoutHero,
    recovery: TF.Config.Images.mindset
  };

  function cloneExercises(list) {
    return list.map(function(ex) {
      return Object.assign({}, ex);
    });
  }

  function hashString(value) {
    var hash = 2166136261;
    var i;
    for (i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return Math.abs(hash >>> 0);
  }

  function profileSeed(profile) {
    var raw = [
      profile.name || 'warrior',
      profile.goal || 'muscle',
      profile.equipment || 'minimal',
      profile.experience || 'beginner',
      profile.availableMinutes || 45,
      profile.createdAt || 'seed'
    ].join('|');
    return hashString(raw);
  }

  function weekBucket() {
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 1);
    return Math.floor((now - start) / 604800000);
  }

  function formatRest(seconds) {
    if (!seconds) {
      return '0 sec';
    }
    if (seconds % 60 === 0 && seconds >= 120) {
      return (seconds / 60) + ' min';
    }
    return seconds + ' sec';
  }

  function estimateMinutes(exercises, fallbackMinutes) {
    var total = 8;
    exercises.forEach(function(ex) {
      total += ex.sets * 2;
      total += Math.max(0, Math.round((ex.restSeconds || 0) / 60) * ex.sets);
    });
    total = Math.round(total / 5) * 5;
    return Math.max(15, Math.min(fallbackMinutes || 45, total));
  }

  function chooseSchedule(profile) {
    var family = profile.equipment === 'none' ? 'none' : (profile.goal || 'muscle');
    var options = SCHEDULES[family] || SCHEDULES.muscle;
    var bias = profile.experience === 'advanced' ? 1 : profile.experience === 'intermediate' ? 0 : 2;
    return options[(profileSeed(profile) + bias) % options.length];
  }

  function selectPoolKey(split, equipment) {
    if (split === 'recovery') {
      return 'recovery';
    }
    if (split === 'bodyweight') {
      return 'bodyweight';
    }
    if (equipment === 'none') {
      return 'bodyweight';
    }
    if (equipment === 'minimal') {
      return LIB[split + '_min'] ? split + '_min' : 'bodyweight';
    }
    return LIB[split] ? split : 'bodyweight';
  }

  function chooseVariant(profile, poolKey, recovery) {
    var variants = LIB[poolKey] || LIB.bodyweight;
    var goalBias = profile.goal === 'fatLoss' ? 1 : profile.goal === 'discipline' ? 2 : 0;
    var expBias = profile.experience === 'advanced' ? 2 : profile.experience === 'intermediate' ? 1 : 0;
    var minutesBias = Math.max(0, Math.floor((profile.availableMinutes || 45) / 15));
    var recoveryBias = Math.max(0, Math.floor(recovery / 15));
    var index = (profileSeed(profile) + weekBucket() + goalBias + expBias + minutesBias + recoveryBias + poolKey.length) % variants.length;
    return cloneExercises(variants[index]);
  }

  function limitExerciseCount(exercises, minutes, recovery) {
    var target = exercises.length;
    if (minutes <= 30) {
      target = Math.min(target, 3);
    } else if (minutes <= 45) {
      target = Math.min(target, 4);
    }

    if (recovery < 50) {
      target = Math.min(target, 3);
    } else if (recovery < 65) {
      target = Math.min(target, 4);
    }

    return Math.max(2, target);
  }

  function tuneExercises(exercises, profile, recovery) {
    var minutes = profile.availableMinutes || 45;
    var targetCount = limitExerciseCount(exercises, minutes, recovery);

    return exercises.slice(0, targetCount).map(function(ex, index) {
      var tuned = Object.assign({}, ex);

      if (profile.experience === 'beginner' && index >= 2 && tuned.sets > 3) {
        tuned.sets -= 1;
      }

      if (minutes <= 30 && tuned.sets > 2) {
        tuned.sets -= 1;
      }

      if (minutes >= 60 && recovery >= 70 && profile.experience !== 'beginner' && index < 2) {
        tuned.sets += 1;
      }

      if (profile.goal === 'fatLoss' && tuned.restSeconds >= 75) {
        tuned.restSeconds = Math.max(45, tuned.restSeconds - 15);
      }

      if (profile.goal === 'discipline' && recovery >= 60 && index === targetCount - 1 && tuned.sets < 4) {
        tuned.sets += 1;
      }

      tuned.rest = formatRest(tuned.restSeconds);
      return tuned;
    });
  }

  function intensityLabel(recovery) {
    if (recovery >= 75) {
      return 'High - push hard while keeping 1-2 reps in reserve on the final working set.';
    }
    if (recovery >= 55) {
      return 'Moderate - smooth reps, clean tempo, and strong positions throughout.';
    }
    return 'Low - leave at least 3 reps in reserve and keep the session crisp.';
  }

  function focusLabel(split, poolKey, profile) {
    if (split === 'bodyweight' || poolKey === 'bodyweight') {
      return profile.equipment === 'none'
        ? 'Bodyweight training shaped around your setup and consistency.'
        : FOCUS_LABELS.bodyweight;
    }
    return FOCUS_LABELS[split] || FOCUS_LABELS.bodyweight;
  }

  function volumeNote(profile, recovery, exerciseCount) {
    if (recovery < 50) {
      return 'Volume auto-reduced to protect recovery today.';
    }
    if ((profile.availableMinutes || 45) <= 30) {
      return 'Short-session mode active so you can finish strong.';
    }
    if (exerciseCount <= 3) {
      return 'Focused session with fewer movements and higher intent.';
    }
    return null;
  }

  function buildPlan(profile, title, focus, splitKey, exercises, recovery) {
    return {
      title: title,
      focus: focus,
      splitKey: splitKey,
      exercises: exercises,
      estimatedMinutes: estimateMinutes(exercises, profile.availableMinutes || 45),
      intensity: intensityLabel(recovery),
      recoveryScore: recovery,
      volumeNote: volumeNote(profile, recovery, exercises.length),
      motivational: MOTIVATIONAL[splitKey] || MOTIVATIONAL.bodyweight,
      image: IMAGES[splitKey] || TF.Config.Images.workoutHero
    };
  }

  function getToday(profile, input) {
    var recovery = input ? TF.Score.recovery(input) : 68;
    var schedule;
    var split;
    var poolKey;
    var selected;

    profile = profile || TF.Store.getProfile();

    if (recovery < 32) {
      selected = tuneExercises(chooseVariant(profile, 'recovery', recovery), profile, recovery).slice(0, 4);
      return buildPlan(profile, TITLES.recovery, FOCUS_LABELS.recovery, 'recovery', selected, recovery);
    }

    schedule = chooseSchedule(profile);
    split = schedule[new Date().getDay()];

    if (!split) {
      if (recovery < 58) {
        selected = chooseVariant(profile, 'recovery', recovery).slice(0, 3);
        return buildPlan(profile, 'Rest Day', 'Scheduled rest with a short recovery flow.', 'recovery', selected, recovery);
      }
      split = 'bodyweight';
    }

    poolKey = selectPoolKey(split, profile.equipment);
    selected = tuneExercises(chooseVariant(profile, poolKey, recovery), profile, recovery);

    return buildPlan(
      profile,
      TITLES[split] || TITLES.bodyweight,
      focusLabel(split, poolKey, profile),
      split === 'bodyweight' ? 'bodyweight' : split,
      selected,
      recovery
    );
  }

  return {
    getToday: getToday,
    LIB: LIB
  };
})();
