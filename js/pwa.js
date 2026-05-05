(function(){
  'use strict';

  var TF = window.TF = window.TF || {};
  var deferredInstallPrompt = null;
  var loadedScripts = {};

  function syncStatusText(){
    var status = TF.Sync && TF.Sync.getStatus ? TF.Sync.getStatus() : null;
    if (!status) {
      return 'Sync unavailable';
    }
    if (status.state === 'offline') {
      return 'Offline';
    }
    if (status.state === 'syncing') {
      return 'Syncing...';
    }
    if (status.state === 'error') {
      return 'Sync error';
    }
    if (status.state === 'synced' && status.lastSyncAt) {
      return 'Synced ' + new Date(status.lastSyncAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }
    return status.pending > 0 ? 'Local only (' + status.pending + ')' : 'Local only';
  }

  function updateSyncSurface(){
    var status = TF.Sync && TF.Sync.getStatus ? TF.Sync.getStatus() : { pending: 0 };

    document.querySelectorAll('[data-sync-status]').forEach(function(node){
      node.textContent = syncStatusText();
    });

    document.querySelectorAll('[data-sync-pending]').forEach(function(node){
      node.textContent = String(status.pending || 0);
    });

    var banner = document.getElementById('offline-banner');
    if (banner) {
      banner.innerHTML =
        TF.Icon('wifi-off', 16) +
        '<span>' + (navigator.onLine ? 'CONNECTED - ' + syncStatusText().toUpperCase() : 'NO CONNECTION - OFFLINE') + '</span>';
      banner.classList.toggle('visible', !navigator.onLine);
    }

    var splash = document.getElementById('offline-splash');
    if (splash) {
      splash.classList.toggle('visible', !navigator.onLine);
      splash.setAttribute('aria-hidden', navigator.onLine ? 'true' : 'false');
    }
  }

  function ensureInstallPrompt(){
    if (document.getElementById('install-app-btn')) {
      return;
    }

    var button = document.createElement('button');
    button.id = 'install-app-btn';
    button.className = 'install-app-btn hidden';
    button.type = 'button';
    button.innerHTML = TF.Icon('download', 14) + '<span>Install app</span>';
    button.addEventListener('click', function(){
      if (!deferredInstallPrompt) {
        TF.UI.toast('Install prompt is not available in this browser.');
        return;
      }
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.finally(function(){
        deferredInstallPrompt = null;
        button.classList.add('hidden');
      });
    });
    document.body.appendChild(button);
  }

  function registerServiceWorker(){
    if (!('serviceWorker' in navigator) || window.location.protocol === 'file:') {
      return;
    }

    navigator.serviceWorker.register('./sw.js').catch(function(error){
      console.warn('[PWA] Service worker registration failed:', error);
    });
  }

  function loadScript(url){
    if (loadedScripts[url]) {
      return loadedScripts[url];
    }

    loadedScripts[url] = new Promise(function(resolve, reject){
      var existing = document.querySelector('script[data-dynamic-src="' + url + '"]');
      if (existing) {
        resolve();
        return;
      }

      var script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.dataset.dynamicSrc = url;
      script.onload = function(){ resolve(); };
      script.onerror = function(){ reject(new Error('Failed to load ' + url)); };
      document.body.appendChild(script);
    });

    return loadedScripts[url];
  }

  function init(){
    ensureInstallPrompt();
    registerServiceWorker();
    updateSyncSurface();

    window.addEventListener('beforeinstallprompt', function(event){
      event.preventDefault();
      deferredInstallPrompt = event;
      var button = document.getElementById('install-app-btn');
      if (button) {
        button.classList.remove('hidden');
      }
    });

    window.addEventListener('online', function(){
      updateSyncSurface();
      if (TF.Sync && TF.Sync.drainQueue) {
        TF.Sync.drainQueue();
      }
    });
    window.addEventListener('offline', updateSyncSurface);
    window.addEventListener('tf:queuechange', updateSyncSurface);
    window.addEventListener('tf:sync', updateSyncSurface);
  }

  TF.Assets = TF.Assets || {};
  TF.Assets.loadScript = loadScript;
  TF.PWA = {
    init: init,
    updateSyncSurface: updateSyncSurface
  };
})();
