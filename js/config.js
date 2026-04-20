/* ================================================================
   CONFIG v5.7 - tommyy.fit
   ================================================================ */
var TF = window.TF || {};
window.TF = TF;
TF.Screens = TF.Screens || {};

TF.Config = {
  version: 'v5.7',
  brand: 'tommyy.fit',
  brandUrl: 'https://beacons.ai/tommyy.fit',
  appName: 'TOMMYY.FIT',
  Images: {
    loader: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1600&dpr=2',
    dashboard: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1600&dpr=2',
    checkin: 'https://images.pexels.com/photos/317155/pexels-photo-317155.jpeg?auto=compress&cs=tinysrgb&w=1600&dpr=2',
    missions: 'https://images.pexels.com/photos/3253501/pexels-photo-3253501.jpeg?auto=compress&cs=tinysrgb&w=1600&dpr=2',
    workoutHero: 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=1600&dpr=2',
    push: 'https://images.pexels.com/photos/3837781/pexels-photo-3837781.jpeg?auto=compress&cs=tinysrgb&w=1600&dpr=2',
    pull: 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=1600&dpr=2',
    legs: 'https://images.pexels.com/photos/1865131/pexels-photo-1865131.jpeg?auto=compress&cs=tinysrgb&w=1600&dpr=2',
    nutrition: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1600&dpr=2',
    progress: 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=1600&dpr=2',
    mindset: 'https://images.pexels.com/photos/3253501/pexels-photo-3253501.jpeg?auto=compress&cs=tinysrgb&w=1600&dpr=2',
    habits: 'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=1600&dpr=2'
  },
  QuoteAPI: { stoic: 'https://stoic-quotes.com/api/quote' },
  FoodAPI: 'https://world.openfoodfacts.org/cgi/search.pl',
  BackupReminderOptions: [3, 7, 14, 30],
  ScoreThresholds: { elite: 88, sharp: 74, solid: 58, low: 42 },
  XP: { perLevel: 500 },
  WarriorTitles: ['', 'Recruit', 'Soldier', 'Fighter', 'Warrior', 'Champion', 'Gladiator', 'Spartan', 'Viking', 'Warlord', 'Berserker', 'Legend'],
  PPLSchedule: { 1: 'push', 2: 'pull', 3: 'legs', 4: null, 5: 'push', 6: 'pull', 0: 'legs' },
  OverloadKg: { compound: 2.5, isolation: 1.25 },
  CalorieMultipliers: { muscle: 36, fatLoss: 29, discipline: 33, maintenance: 33 },
  ProteinPerKg: { muscle: 2.0, fatLoss: 2.2, discipline: 1.8 },
  DataRetentionDays: 90,
  /* Compound exercise keywords for smart rest timer auto-detection */
  CompoundKeywords: ['squat', 'deadlift', 'bench press', 'overhead press', 'row', 'pull-up', 'pullup', 'chin-up', 'chinup', 'dip', 'press', 'clean', 'snatch', 'lunge', 'hip thrust', 'rdl', 'sumo', 'trap bar'],
  DefaultHabits: [
    { id: 'no_alcohol', emoji: '\u{1F6AB}', label: 'No alcohol', xp: 15 },
    { id: 'cold_shower', emoji: '\u{1F6BF}', label: 'Cold shower', xp: 20 },
    { id: 'meditation', emoji: '\u{1F9D8}', label: 'Meditation / breathwork', xp: 15 },
    { id: 'no_junk_food', emoji: '\u{1F355}', label: 'No junk food', xp: 15 },
    { id: 'read', emoji: '\u{1F4DA}', label: 'Read 30+ min', xp: 10 },
    { id: 'early_bed', emoji: '\u{1F319}', label: 'Lights out by 22:00', xp: 15 },
    { id: 'morning_walk', emoji: '\u{1F6B6}', label: 'Morning walk / sunlight', xp: 10 },
    { id: 'gratitude', emoji: '\u{1F64F}', label: 'Gratitude journal', xp: 10 },
    { id: 'hydrate_3l', emoji: '\u{1F4A7}', label: 'Drink 3L water', xp: 10 },
    { id: 'protein_target', emoji: '\u{1F357}', label: 'Hit protein target', xp: 15 },
    { id: 'mobility', emoji: '\u{1F938}', label: '10 min mobility', xp: 10 },
    { id: 'make_bed', emoji: '\u{1F6CF}', label: 'Make your bed', xp: 5 },
    { id: 'no_phone_morning', emoji: '\u{1F4F5}', label: 'No phone first hour', xp: 15 },
    { id: 'plan_tomorrow', emoji: '\u{1F4C5}', label: 'Plan tomorrow', xp: 10 },
    { id: 'no_screens_bed', emoji: '\u{1F4F4}', label: 'No screens 1h before bed', xp: 15 },
    { id: 'journal_5min', emoji: '\u{1F58A}', label: '5 min journaling', xp: 10 }
  ]
};
