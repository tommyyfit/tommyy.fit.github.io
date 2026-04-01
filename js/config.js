/* ================================================================
   CONFIG v4 - tommyy.fit
   ================================================================ */
var TF = window.TF || {};
window.TF = TF;
TF.Screens = TF.Screens || {};

TF.Config = {
  version: 'v4.0',
  brand: 'tommyy.fit',
  brandUrl: 'https://beacons.ai/tommyy.fit',
  appName: 'TOMMYY.FIT',
  Images: {
    loader: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800',
    dashboard: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800',
    checkin: 'https://images.pexels.com/photos/317155/pexels-photo-317155.jpeg?auto=compress&cs=tinysrgb&w=800',
    missions: 'https://images.pexels.com/photos/3253501/pexels-photo-3253501.jpeg?auto=compress&cs=tinysrgb&w=800',
    workoutHero: 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=800',
    push: 'https://images.pexels.com/photos/3837781/pexels-photo-3837781.jpeg?auto=compress&cs=tinysrgb&w=800',
    pull: 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=800',
    legs: 'https://images.pexels.com/photos/1865131/pexels-photo-1865131.jpeg?auto=compress&cs=tinysrgb&w=800',
    nutrition: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    progress: 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=800',
    mindset: 'https://images.pexels.com/photos/3253501/pexels-photo-3253501.jpeg?auto=compress&cs=tinysrgb&w=800',
    habits: 'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  QuoteAPI: {
    stoic: 'https://stoic-quotes.com/api/quote'
  },
  FoodAPI: 'https://world.openfoodfacts.org/cgi/search.pl',
  BackupReminderOptions: [3, 7],
  ScoreThresholds: { elite: 88, sharp: 74, solid: 58, low: 42 },
  XP: { perLevel: 500 },
  WarriorTitles: ['', 'Recruit', 'Soldier', 'Fighter', 'Warrior', 'Champion', 'Gladiator', 'Spartan', 'Viking', 'Warlord', 'Berserker', 'Legend'],
  PPLSchedule: { 1: 'push', 2: 'pull', 3: 'legs', 4: null, 5: 'push', 6: 'pull', 0: 'legs' },
  OverloadKg: { compound: 2.5, isolation: 1.25 },
  CalorieMultipliers: { muscle: 36, fatLoss: 29, discipline: 33, maintenance: 33 },
  ProteinPerKg: { muscle: 2.0, fatLoss: 2.2, discipline: 1.8 },
  DataRetentionDays: 90,
  DefaultHabits: [
    { id: 'no_alcohol', emoji: '\u{1F6AB}', label: 'No alcohol', xp: 15 },
    { id: 'cold_shower', emoji: '\u{1F6BF}', label: 'Cold shower', xp: 20 },
    { id: 'meditation', emoji: '\u{1F9D8}', label: 'Meditation / breathwork', xp: 15 },
    { id: 'no_junk_food', emoji: '\u{1F355}', label: 'No junk food', xp: 15 },
    { id: 'read', emoji: '\u{1F4DA}', label: 'Read 30+ min', xp: 10 },
    { id: 'early_bed', emoji: '\u{1F319}', label: 'Lights out by 22:00', xp: 15 },
    { id: 'morning_walk', emoji: '\u{1F6B6}', label: 'Morning walk / sunlight', xp: 10 },
    { id: 'gratitude', emoji: '\u{1F64F}', label: 'Gratitude journal', xp: 10 }
  ]
};
