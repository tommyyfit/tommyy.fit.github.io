var TF_CACHE = 'tf-v6-0-alpha-shell';
var APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon.svg',
  './css/variables.css',
  './css/layout.css',
  './css/base.css',
  './css/components.css',
  './js/config.js',
  './js/api.js',
  './js/auth.js',
  './js/store/backup.js',
  './js/store.js',
  './js/data-layer.js',
  './js/router.js',
  './js/pwa.js',
  './js/engine/score.js',
  './js/engine/workout.js',
  './js/engine/missions.js',
  './js/engine/quotes.js',
  './js/engine/achievements.js',
  './js/engine/overload.js',
  './js/engine/habits.js',
  './js/engine/celebrations.js',
  './js/engine/trends.js',
  './js/engine/rewards.js',
  './js/components/icons.js',
  './js/components/ui.js',
  './js/components/charts.js',
  './js/screens/auth.js',
  './js/screens/onboarding.js',
  './js/screens/dashboard.js',
  './js/screens/checkin.js',
  './js/screens/missions.js',
  './js/screens/workout.helpers.js',
  './js/screens/workout.js',
  './js/screens/habits.js',
  './js/screens/nutrition.js',
  './js/screens/progress.js',
  './js/screens/history.js',
  './js/screens/custom-workouts.js',
  './js/screens/measurements.js',
  './js/screens/body-metrics.helpers.js',
  './js/screens/body-metrics.js',
  './js/screens/weekly-review.js',
  './js/screens/achievements.js',
  './js/screens/coach.js',
  './js/screens/pr-history.js',
  './js/screens/habit-heatmap.js',
  './js/screens/report-card.js',
  './js/screens/profile.js',
  './js/screens/more.js',
  './js/notifications.js',
  './js/app.js'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(TF_CACHE).then(function(cache){
      return cache.addAll(APP_SHELL);
    }).then(function(){
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(key){
        if (key !== TF_CACHE) {
          return caches.delete(key);
        }
      }));
    }).then(function(){
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event){
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(cached){
      if (cached) {
        return cached;
      }

      return fetch(event.request).then(function(response){
        if (!response || response.status >= 400) {
          return response;
        }

        var copy = response.clone();
        caches.open(TF_CACHE).then(function(cache){
          cache.put(event.request, copy);
        });
        return response;
      }).catch(function(){
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return caches.match(event.request);
      });
    })
  );
});
