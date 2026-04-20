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

  var VALID_GENERATED_SPLITS = ['push', 'pull', 'legs', 'bodyweight', 'recovery'];
  var NEXT_SPLIT = {
    push: 'pull',
    pull: 'legs',
    legs: 'push'
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

  var SWAP_GROUPS = {
    horizontal_press: ['Bench Press', 'Incline Bench Press', 'Close-Grip Bench Press', 'Machine Chest Press', 'DB Bench Press', 'Incline DB Press', 'DB Floor Press', 'Neutral-Grip DB Press', 'Deficit Push-ups', 'Push-ups', 'Decline Push-ups', 'Hand-Release Push-ups', 'Diamond Push-ups'],
    vertical_press: ['Overhead Press', 'Seated DB Shoulder Press', 'Arnold Press', 'DB Shoulder Press', 'Half-Kneeling DB Press', 'Pike Push-ups'],
    chest_isolation: ['Cable Fly', 'DB Fly'],
    triceps: ['Tricep Pushdown', 'Skull Crushers', 'Overhead Rope Extension', 'DB Tricep Extension', 'DB Kickback', 'Overhead DB Extension', 'Weighted Dips', 'Chair Dips', 'Chair Tricep Dip'],
    lateral_delts: ['Lateral Raises', 'Lean-Away Raise', 'DB Lateral Raise', 'Lean Lateral Raise'],
    hinge: ['Deadlift', 'Rack Pull', 'Trap Bar Deadlift', 'Romanian Deadlift', 'Good Morning', 'DB Romanian Deadlift', 'Staggered-Stance RDL', 'Single-Leg RDL'],
    vertical_pull: ['Weighted Pull-ups', 'Lat Pulldown', 'Neutral-Grip Pulldown', 'Pull-ups or Rows', 'Chin-ups or Inverted Rows'],
    row: ['Barbell Row', 'Chest-Supported Row', 'One-Arm Cable Row', 'One-Arm DB Row', 'Chest-Supported DB Row', 'Bent-Over DB Row', 'Renegade Row', 'Towel Row', 'Superman Row'],
    rear_delts: ['Face Pulls', 'Rear Delt Fly', 'Cable Face Pull', 'DB Rear Delt Fly', 'Reverse Fly'],
    biceps: ['Hammer Curl', 'EZ-Bar Curl', 'Incline DB Curl', 'DB Curl', 'Zottman Curl'],
    squat: ['Back Squat', 'Front Squat', 'Hack Squat', 'Goblet Squat', 'Front Rack DB Squat', 'Tempo Goblet Squat'],
    single_leg: ['Leg Press', 'Walking Lunge', 'Bulgarian Split Squat', 'DB Split Squat', 'Reverse Lunge', 'DB Step-Up'],
    glutes: ['Barbell Hip Thrust', 'DB Hip Thrust', 'Glute Bridge', 'Single-Leg Hip Bridge', 'Glute Bridge March'],
    hamstrings: ['Leg Curl', 'Lying Leg Curl'],
    quads: ['Leg Extension'],
    calves: ['Calf Raises', 'Seated Calf Raise', 'Standing Calf Raise', 'Single-Leg Calf Raise'],
    core: ['Plank', 'Hollow Hold', 'Side Plank', 'Mountain Climbers'],
    mobility: ['Hip Flexor Stretch', 'Cat-Cow', 'Worlds Greatest Stretch', 'Thoracic Rotation', 'Box Breathing', 'Couch Stretch', 'Child Pose to Cobra', '90/90 Switch', 'Wall Slide', 'Nasal Breathing Walk']
  };

  var EXERCISE_GROUP = {};
  Object.keys(SWAP_GROUPS).forEach(function(group){
    SWAP_GROUPS[group].forEach(function(name){
      EXERCISE_GROUP[name] = group;
    });
  });

  var _exerciseLibraryCache = null;
  var EXTRA_LIBRARY = [
    { name: 'Smith Machine Bench Press', sets: 4, reps: '6-8', restSeconds: 120, note: 'Touch low on the chest and drive up smoothly.', swapGroup: 'horizontal_press' },
    { name: 'Paused Bench Press', sets: 4, reps: '4-6', restSeconds: 180, note: 'Pause for a full count on the chest before pressing.', swapGroup: 'horizontal_press' },
    { name: 'Low Incline DB Press', sets: 3, reps: '8-10', restSeconds: 90, note: 'Keep the incline low to bias chest over shoulders.', swapGroup: 'horizontal_press' },
    { name: 'Landmine Press', sets: 3, reps: '8-10', restSeconds: 75, note: 'Drive up and slightly forward with stacked ribs.', swapGroup: 'vertical_press' },
    { name: 'Machine Shoulder Press', sets: 3, reps: '8-10', restSeconds: 90, note: 'Stay braced and press through the full path.', swapGroup: 'vertical_press' },
    { name: 'Cable Lateral Raise', sets: 3, reps: '12-15', restSeconds: 45, note: 'Smooth arc and constant tension the whole time.', swapGroup: 'lateral_delts' },
    { name: 'Pec Deck Fly', sets: 3, reps: '12-15', restSeconds: 60, note: 'Pause in the squeeze without shrugging up.', swapGroup: 'chest_isolation' },
    { name: 'JM Press', sets: 3, reps: '8-10', restSeconds: 75, note: 'Control the descent and keep elbows tucked.', swapGroup: 'triceps' },
    { name: 'Cable Overhead Extension', sets: 3, reps: '12-15', restSeconds: 60, note: 'Get a long stretch and full triceps lockout.', swapGroup: 'triceps' },
    { name: 'Weighted Push-up', sets: 4, reps: '8-12', restSeconds: 90, note: 'Stay rigid through the torso and hit full depth.', swapGroup: 'horizontal_press' },
    { name: 'T-Bar Row', sets: 4, reps: '6-8', restSeconds: 120, note: 'Row to the lower chest with no torso bounce.', swapGroup: 'row' },
    { name: 'Seal Row', sets: 4, reps: '8-10', restSeconds: 90, note: 'Let the lats stretch and pull from a dead stop.', swapGroup: 'row' },
    { name: 'Meadows Row', sets: 3, reps: '10-12', restSeconds: 90, note: 'Drive the elbow back and keep the torso braced.', swapGroup: 'row' },
    { name: 'Cable Row', sets: 3, reps: '10-12', restSeconds: 75, note: 'Reach fully forward, then finish tight to the torso.', swapGroup: 'row' },
    { name: 'Straight-Arm Pulldown', sets: 3, reps: '12-15', restSeconds: 60, note: 'Keep elbows soft and drive hands to hips.', swapGroup: 'vertical_pull' },
    { name: 'Assisted Pull-up', sets: 4, reps: '8-10', restSeconds: 90, note: 'Use the assist only enough to keep clean reps.', swapGroup: 'vertical_pull' },
    { name: 'Single-Arm Lat Pulldown', sets: 3, reps: '10-12', restSeconds: 75, note: 'Pull elbow to hip and stay square.', swapGroup: 'vertical_pull' },
    { name: 'Preacher Curl', sets: 3, reps: '10-12', restSeconds: 60, note: 'Start from a full stretch without swinging.', swapGroup: 'biceps' },
    { name: 'Cable Curl', sets: 3, reps: '12-15', restSeconds: 60, note: 'Keep elbows pinned and tension constant.', swapGroup: 'biceps' },
    { name: 'Bayesian Curl', sets: 3, reps: '12-15', restSeconds: 60, note: 'Stay long in the stretch and curl through the pinky.', swapGroup: 'biceps' },
    { name: 'Barbell Shrug', sets: 3, reps: '10-12', restSeconds: 60, note: 'Straight up and down with a pause at the top.', swapGroup: 'rear_delts' },
    { name: 'Machine Row', sets: 3, reps: '8-10', restSeconds: 90, note: 'Brace hard into the pad and pull evenly.', swapGroup: 'row' },
    { name: 'Safety Bar Squat', sets: 4, reps: '5-6', restSeconds: 180, note: 'Brace hard and keep the torso stacked.', swapGroup: 'squat' },
    { name: 'Box Squat', sets: 4, reps: '4-6', restSeconds: 180, note: 'Sit back under control and explode up.', swapGroup: 'squat' },
    { name: 'Zercher Squat', sets: 3, reps: '6-8', restSeconds: 120, note: 'Stay tall and lock the bar close to the torso.', swapGroup: 'squat' },
    { name: 'Leg Press Calf Raise', sets: 4, reps: '12-15', restSeconds: 45, note: 'Full stretch at the bottom and hard lockout.', swapGroup: 'calves' },
    { name: 'Pendulum Squat', sets: 4, reps: '8-10', restSeconds: 120, note: 'Drive knees forward and keep the brace tight.', swapGroup: 'squat' },
    { name: 'Smith Machine Split Squat', sets: 3, reps: '10 ea', restSeconds: 75, note: 'Stay centered and lower straight down.', swapGroup: 'single_leg' },
    { name: 'Step-Up', sets: 3, reps: '10 ea', restSeconds: 75, note: 'Drive through the full foot and control the way down.', swapGroup: 'single_leg' },
    { name: 'Cable Pull-Through', sets: 3, reps: '12-15', restSeconds: 60, note: 'Hinge cleanly and squeeze the glutes hard.', swapGroup: 'glutes' },
    { name: 'Glute Ham Raise', sets: 3, reps: '8-10', restSeconds: 90, note: 'Control the lower phase and finish with hips extended.', swapGroup: 'hamstrings' },
    { name: 'Nordic Curl', sets: 3, reps: '5-8', restSeconds: 90, note: 'Fight the eccentric as long as possible.', swapGroup: 'hamstrings' },
    { name: 'Sissy Squat', sets: 3, reps: '10-12', restSeconds: 60, note: 'Stay balanced and keep tension on the quads.', swapGroup: 'quads' },
    { name: 'Ab Wheel Rollout', sets: 3, reps: '8-12', restSeconds: 45, note: 'Keep ribs tucked and control the return.', swapGroup: 'core' },
    { name: 'Cable Crunch', sets: 3, reps: '12-15', restSeconds: 45, note: 'Round down hard and exhale fully.', swapGroup: 'core' },
    { name: 'Hanging Leg Raise', sets: 3, reps: '10-15', restSeconds: 45, note: 'Lift from the abs, not from momentum.', swapGroup: 'core' },
    { name: 'Pallof Press', sets: 3, reps: '12 ea', restSeconds: 30, note: 'Stay square and resist rotation the whole time.', swapGroup: 'core' },
    { name: 'Farmer Carry', sets: 3, reps: '30 sec', restSeconds: 60, note: 'Walk tall and keep the shoulders packed down.', swapGroup: 'core' },
    { name: 'Cable Kickback', sets: 3, reps: '15-20', restSeconds: 45, note: 'Finish long through the glute without arching.', swapGroup: 'glutes' },
    { name: 'Reverse Hyper', sets: 3, reps: '12-15', restSeconds: 60, note: 'Swing only enough to keep smooth glute tension.', swapGroup: 'glutes' },
    { name: 'Smith Machine RDL', sets: 3, reps: '8-10', restSeconds: 90, note: 'Keep the hinge tight and stretch the hamstrings.', swapGroup: 'hinge' },
    { name: 'Cable Upright Row', sets: 3, reps: '10-12', restSeconds: 60, note: 'Stop before shoulder discomfort and lead with elbows.', swapGroup: 'lateral_delts' }
  ];

  function decorateExercise(ex) {
    var item = Object.assign({}, ex);
    item.restSeconds = Math.max(0, parseInt(item.restSeconds, 10) || 0);
    item.rest = item.rest || formatRest(item.restSeconds);
    item.swapGroup = item.swapGroup || EXERCISE_GROUP[item.name] || '';
    return item;
  }

  function cloneExercises(list) {
    return list.map(function(ex) {
      return decorateExercise(ex);
    });
  }

  function getExerciseLibrary() {
    if (_exerciseLibraryCache) {
      return _exerciseLibraryCache.slice();
    }
    var seen = {};
    var list = [];
    Object.keys(LIB).forEach(function(key){
      (LIB[key] || []).forEach(function(variant){
        (variant || []).forEach(function(exercise){
          if (!seen[exercise.name]) {
            seen[exercise.name] = true;
            list.push(decorateExercise(exercise));
          }
        });
      });
    });
    EXTRA_LIBRARY.forEach(function(exercise) {
      if (!seen[exercise.name]) {
        seen[exercise.name] = true;
        list.push(decorateExercise(exercise));
      }
    });
    list.sort(function(a, b){
      return a.name.localeCompare(b.name);
    });
    _exerciseLibraryCache = list;
    return list.slice();
  }

  function getExerciseDefinition(name) {
    var match = getExerciseLibrary().find(function(exercise){
      return exercise.name === name;
    });
    return match ? decorateExercise(match) : decorateExercise({
      name: name || 'Exercise',
      sets: 3,
      reps: '8-10',
      restSeconds: 90,
      note: ''
    });
  }

  function getSwapOptions(exercise, limit) {
    var current = typeof exercise === 'string' ? getExerciseDefinition(exercise) : decorateExercise(exercise);
    if (!current.swapGroup) {
      return [];
    }
    return getExerciseLibrary().filter(function(option){
      return option.swapGroup === current.swapGroup && option.name !== current.name;
    }).slice(0, limit || 6);
  }

  function getSelectedCustomWorkout() {
    if (!TF.Store.getWorkoutSelection || !TF.Store.getCustomWorkouts) {
      return null;
    }
    var selection = TF.Store.getWorkoutSelection(TF.Store.todayKey());
    if (!selection || selection.mode !== 'custom' || !selection.workoutId) {
      return null;
    }
    return TF.Store.getCustomWorkouts().find(function(workout){
      return workout.id === selection.workoutId;
    }) || null;
  }

  function getSelectedGeneratedOverride() {
    if (!TF.Store.getWorkoutSelection) {
      return null;
    }
    var selection = TF.Store.getWorkoutSelection(TF.Store.todayKey());
    if (!selection || selection.mode !== 'generated' || VALID_GENERATED_SPLITS.indexOf(selection.splitKey) === -1) {
      return null;
    }
    return selection;
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

  function parseKeyDate(key) {
    var parts = String(key || '').split('-').map(function(part){
      return parseInt(part, 10);
    });
    if (parts.length !== 3 || !isFinite(parts[0]) || !isFinite(parts[1]) || !isFinite(parts[2])) {
      return null;
    }
    return Date.UTC(parts[0], parts[1] - 1, parts[2]);
  }

  function daysBetweenKeys(fromKey, toKey) {
    var from = parseKeyDate(fromKey);
    var to = parseKeyDate(toKey);
    if (from == null || to == null) {
      return 0;
    }
    return Math.max(0, Math.round((to - from) / 86400000));
  }

  function hasCompletedWorkout(day) {
    if (!day) {
      return false;
    }
    if (day.finishedAt) {
      return true;
    }
    return Object.keys(day.exercises || {}).some(function(name){
      return (day.exercises[name] || []).some(function(set){
        return set && set.done && set.type !== 'warmup';
      });
    });
  }

  function inferSplitFromLog(day) {
    var name = String(day && day.workoutName || '').toLowerCase();
    if (VALID_GENERATED_SPLITS.indexOf(day && day.splitKey) !== -1) {
      return day.splitKey;
    }
    if (name.indexOf('push') !== -1) {
      return 'push';
    }
    if (name.indexOf('pull') !== -1) {
      return 'pull';
    }
    if (name.indexOf('leg') !== -1) {
      return 'legs';
    }
    if (name.indexOf('recovery') !== -1 || name.indexOf('rest') !== -1) {
      return 'recovery';
    }
    if (name.indexOf('bodyweight') !== -1 || name.indexOf('full-body') !== -1 || name.indexOf('full body') !== -1) {
      return 'bodyweight';
    }
    return null;
  }

  function getLastCompletedWorkout(todayKey) {
    if (!TF.Store.getAllWorkoutLogs) {
      return null;
    }
    var logs = TF.Store.getAllWorkoutLogs();
    var keys = Object.keys(logs || {}).filter(function(key){
      return key < todayKey;
    }).sort().reverse();
    for (var i = 0; i < keys.length; i += 1) {
      if (hasCompletedWorkout(logs[keys[i]])) {
        return {
          date: keys[i],
          day: logs[keys[i]],
          splitKey: inferSplitFromLog(logs[keys[i]]),
          daysAgo: daysBetweenKeys(keys[i], todayKey)
        };
      }
    }
    return null;
  }

  function splitTitle(splitKey) {
    return TITLES[splitKey] || TITLES.bodyweight;
  }

  function getScheduledSplit(profile, recovery) {
    var schedule = chooseSchedule(profile);
    var scheduledSplit = schedule[new Date().getDay()];
    if (!scheduledSplit) {
      return recovery < 58 ? 'recovery' : 'bodyweight';
    }
    return scheduledSplit;
  }

  function splitWarning(splitKey, lastWorkout) {
    if (!lastWorkout || !lastWorkout.splitKey || lastWorkout.daysAgo > 3) {
      return null;
    }
    if (splitKey === lastWorkout.splitKey && NEXT_SPLIT[splitKey]) {
      return splitTitle(splitKey) + ' again may be rough. You trained it ' + lastWorkout.daysAgo + ' day' + (lastWorkout.daysAgo === 1 ? '' : 's') + ' ago.';
    }
    return null;
  }

  function resolveGeneratedSplit(profile, recovery) {
    var today = TF.Store.todayKey ? TF.Store.todayKey() : null;
    var override = getSelectedGeneratedOverride();
    var scheduledSplit;
    var lastWorkout;
    var nextSplit;

    lastWorkout = today ? getLastCompletedWorkout(today) : null;

    if (override) {
      if (override.reason === 'comeback') {
        return {
          split: 'bodyweight',
          title: 'Return Session',
          focus: 'Comeback mode keeps the first session back controlled, full-body, and easy to finish.',
          note: 'Comeback mode active. Volume is capped so you restart without trying to repay missed workouts.',
          selectionMode: 'manual',
          overrideReason: 'comeback',
          availableMinutes: override.availableMinutes || 30,
          lastWorkout: lastWorkout
        };
      }
      if (override.reason === 'noGym') {
        return {
          split: 'bodyweight',
          title: 'No-Gym Session',
          focus: 'Bodyweight work for the days when equipment is not available.',
          note: 'No gym today. The session was switched to bodyweight and tuned for minimal setup.',
          selectionMode: 'manual',
          overrideReason: 'noGym',
          equipmentOverride: 'none',
          lastWorkout: lastWorkout
        };
      }
      if (override.reason === 'sore') {
        return {
          split: 'recovery',
          title: 'Soreness Recovery',
          focus: 'Mobility, breathing, and easy movement to reduce stiffness without adding fatigue.',
          note: 'Soreness mode active. Today is recovery instead of forcing the calendar.',
          selectionMode: 'manual',
          overrideReason: 'sore',
          availableMinutes: override.availableMinutes || 25,
          lastWorkout: lastWorkout
        };
      }
      return {
        split: override.splitKey,
        title: override.reason === 'short' ? 'Short ' + splitTitle(override.splitKey) : null,
        focus: override.reason === 'short' ? 'Compressed session for a tight window. Prioritize crisp working sets and skip extra fluff.' : null,
        note: override.reason === 'short'
          ? 'Short-time mode active. The session is capped to fit a tight window.'
          : 'Manual choice active for today. Use Smart auto if you want the algorithm back.',
        selectionMode: 'manual',
        overrideReason: override.reason || null,
        availableMinutes: override.availableMinutes || null,
        equipmentOverride: override.equipmentOverride || null,
        lastWorkout: lastWorkout
      };
    }

    if (recovery < 32) {
      return {
        split: 'recovery',
        title: TITLES.recovery,
        focus: FOCUS_LABELS.recovery,
        note: 'Recovery score is very low, so today was moved to active recovery.',
        selectionMode: 'smart',
        lastWorkout: lastWorkout
      };
    }

    scheduledSplit = getScheduledSplit(profile, recovery);

    if (scheduledSplit === 'recovery' && recovery < 58) {
      return {
        split: 'recovery',
        title: 'Rest Day',
        focus: 'Scheduled rest with a short recovery flow.',
        note: 'Scheduled rest plus lower recovery, so the app kept this light.',
        selectionMode: 'smart',
        scheduledSplit: scheduledSplit,
        lastWorkout: lastWorkout
      };
    }

    if (lastWorkout && lastWorkout.daysAgo >= 7 && scheduledSplit !== 'recovery') {
      return {
        split: 'bodyweight',
        title: 'Return Session',
        focus: 'First session back after time away. Full-body work gets momentum back without forcing the calendar.',
        note: 'Eased you back in after ' + lastWorkout.daysAgo + ' days away from logged workouts.',
        selectionMode: 'smart',
        scheduledSplit: scheduledSplit,
        lastWorkoutGapDays: lastWorkout.daysAgo,
        lastWorkout: lastWorkout,
        availableMinutes: 35
      };
    }

    if (lastWorkout && lastWorkout.daysAgo <= 3 && lastWorkout.splitKey === scheduledSplit && NEXT_SPLIT[scheduledSplit]) {
      nextSplit = NEXT_SPLIT[scheduledSplit];
      return {
        split: nextSplit,
        note: 'Avoided repeating ' + TITLES[scheduledSplit].toLowerCase() + ' after your last logged workout.',
        selectionMode: 'smart',
        scheduledSplit: scheduledSplit,
        adjustedFrom: scheduledSplit,
        lastWorkout: lastWorkout
      };
    }

    return {
      split: scheduledSplit,
      selectionMode: 'smart',
      scheduledSplit: scheduledSplit,
      lastWorkout: lastWorkout
    };
  }

  function getTodayContext(profile, input) {
    var recovery = input ? TF.Score.recovery(input) : 68;
    var resolved;
    var lastWorkout;
    profile = profile || TF.Store.getProfile();
    resolved = resolveGeneratedSplit(profile, recovery);
    lastWorkout = resolved.lastWorkout || null;
    return {
      recovery: recovery,
      scheduledSplit: resolved.scheduledSplit || getScheduledSplit(profile, recovery),
      recommendedSplit: resolved.split || 'bodyweight',
      selectedTitle: resolved.title || splitTitle(resolved.split),
      note: resolved.note || 'Smart auto chose this from today\'s schedule, recovery, equipment, and recent training.',
      selectionMode: resolved.selectionMode || 'smart',
      overrideReason: resolved.overrideReason || null,
      lastWorkout: lastWorkout,
      warnings: {
        push: splitWarning('push', lastWorkout),
        pull: splitWarning('pull', lastWorkout),
        legs: splitWarning('legs', lastWorkout),
        bodyweight: null,
        recovery: null
      }
    };
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

  function buildPlan(profile, title, focus, splitKey, exercises, recovery, meta) {
    var details = meta || {};
    var decoratedExercises = exercises.map(decorateExercise);
    return {
      title: title,
      focus: focus,
      splitKey: splitKey,
      exercises: decoratedExercises,
      estimatedMinutes: estimateMinutes(decoratedExercises, profile.availableMinutes || 45),
      intensity: intensityLabel(recovery),
      recoveryScore: recovery,
      volumeNote: volumeNote(profile, recovery, decoratedExercises.length),
      motivational: MOTIVATIONAL[splitKey] || MOTIVATIONAL.bodyweight,
      image: IMAGES[splitKey] || TF.Config.Images.workoutHero,
      sourceType: details.sourceType || 'generated',
      workoutId: details.workoutId || null,
      workoutName: details.workoutName || title,
      scheduleNote: details.scheduleNote || null,
      selectionMode: details.selectionMode || 'smart',
      adjustedFrom: details.adjustedFrom || null,
      lastWorkoutGapDays: details.lastWorkoutGapDays || null,
      scheduledSplit: details.scheduledSplit || null,
      overrideReason: details.overrideReason || null,
      lastWorkout: details.lastWorkout || null
    };
  }

  function getToday(profile, input) {
    var recovery = input ? TF.Score.recovery(input) : 68;
    var split;
    var poolKey;
    var selected;
    var resolved;
    var effectiveProfile;

    profile = profile || TF.Store.getProfile();

    var customWorkout = getSelectedCustomWorkout();
    if (customWorkout && customWorkout.exercises && customWorkout.exercises.length) {
      return buildPlan(
        profile,
        customWorkout.name,
        'Custom workout template built from your own exercise library choices.',
        'custom',
        customWorkout.exercises,
        recovery,
        {
          sourceType: 'custom',
          workoutId: customWorkout.id,
          workoutName: customWorkout.name
        }
      );
    }

    resolved = resolveGeneratedSplit(profile, recovery);
    split = resolved.split || 'bodyweight';
    effectiveProfile = Object.assign({}, profile);
    if (resolved.availableMinutes) {
      effectiveProfile.availableMinutes = Math.min(profile.availableMinutes || 45, resolved.availableMinutes);
    }
    if (resolved.equipmentOverride) {
      effectiveProfile.equipment = resolved.equipmentOverride;
    }

    poolKey = selectPoolKey(split, effectiveProfile.equipment);
    selected = tuneExercises(chooseVariant(effectiveProfile, poolKey, recovery), effectiveProfile, recovery);

    return buildPlan(
      effectiveProfile,
      resolved.title || TITLES[split] || TITLES.bodyweight,
      resolved.focus || focusLabel(split, poolKey, effectiveProfile),
      split === 'bodyweight' ? 'bodyweight' : split,
      selected,
      recovery,
      {
        scheduleNote: resolved.note || null,
        selectionMode: resolved.selectionMode || 'smart',
        adjustedFrom: resolved.adjustedFrom || null,
        lastWorkoutGapDays: resolved.lastWorkoutGapDays || null,
        scheduledSplit: resolved.scheduledSplit || null,
        overrideReason: resolved.overrideReason || null,
        lastWorkout: resolved.lastWorkout || null
      }
    );
  }

  return {
    getToday: getToday,
    LIB: LIB,
    getExerciseLibrary: getExerciseLibrary,
    getExerciseDefinition: getExerciseDefinition,
    getSwapOptions: getSwapOptions,
    getTodayContext: getTodayContext
  };
})();
