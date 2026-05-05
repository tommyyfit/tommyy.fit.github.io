(function(){
  'use strict';

  var TF = window.TF = window.TF || {};
  var nativeSetItem = Storage.prototype.setItem;
  var nativeRemoveItem = Storage.prototype.removeItem;
  var internalWriteDepth = 0;
  var runtimeState = {
    state: 'local-only',
    lastError: null
  };

  var SYNC_CFG = Object.assign({
    queueKey: 'tf_sync_queue',
    migratedKey: 'tf_cloud_migrated',
    metaKey: 'tf_schema_meta'
  }, TF.Config && TF.Config.Sync || {});

  var STORAGE_KEYS = {
    PROFILE: 'tf_profile',
    INPUTS: 'tf_inputs',
    MISSIONS: 'tf_missions',
    NUTRITION: 'tf_nutrition',
    WEIGHT: 'tf_weight',
    QUOTES: 'tf_quotes_cache',
    WORKOUT_LOG: 'tf_workout_log',
    CUSTOM_WORKOUTS: 'tf_custom_workouts',
    WORKOUT_SELECTION: 'tf_workout_selection',
    OVERLOAD: 'tf_overload',
    MEASUREMENTS: 'tf_measurements',
    BODY_METRICS: 'tf_body_metrics',
    ACHIEVEMENTS: 'tf_achievements',
    SHIELDS: 'tf_shields',
    THEME: 'tf_theme',
    SETTINGS: 'tf_settings',
    HABITS: 'tf_habits',
    HABIT_STREAKS: 'tf_habit_streaks',
    PRS: 'tf_prs',
    ONBOARDED_STATE: 'tf_onboarded',
    SCHEMA_META: SYNC_CFG.metaKey,
    SYNC_QUEUE: SYNC_CFG.queueKey
  };

  var SECTION_LABELS = {
    PROFILE: 'Profile',
    INPUTS: 'Check-ins',
    MISSIONS: 'Missions',
    NUTRITION: 'Nutrition',
    WEIGHT: 'Weight Log',
    QUOTES: 'Quotes Cache',
    WORKOUT_LOG: 'Workout History',
    CUSTOM_WORKOUTS: 'Custom Workouts',
    WORKOUT_SELECTION: 'Workout Selection',
    OVERLOAD: 'Progressive Overload',
    MEASUREMENTS: 'Measurements',
    BODY_METRICS: 'Body Metrics',
    ACHIEVEMENTS: 'Achievements',
    SHIELDS: 'Shields',
    THEME: 'Theme',
    SETTINGS: 'Settings',
    HABITS: 'Habits',
    HABIT_STREAKS: 'Habit Streaks',
    PRS: 'PR History',
    ONBOARDED_STATE: 'Onboarding State',
    SCHEMA_META: 'Sync Metadata',
    SYNC_QUEUE: 'Pending Sync Queue'
  };

  function nowIso(){
    return new Date().toISOString();
  }

  function withInternalWrite(fn){
    internalWriteDepth += 1;
    try {
      return fn();
    } finally {
      internalWriteDepth -= 1;
    }
  }

  function safeParse(raw, fallback){
    if (raw == null) {
      return fallback;
    }
    try {
      return JSON.parse(raw);
    } catch (_error) {
      return fallback;
    }
  }

  function readQueue(){
    var queue = safeParse(localStorage.getItem(SYNC_CFG.queueKey), []);
    return Array.isArray(queue) ? queue : [];
  }

  function writeQueue(queue){
    withInternalWrite(function(){
      nativeSetItem.call(localStorage, SYNC_CFG.queueKey, JSON.stringify(queue || []));
    });
    dispatchQueueChange();
    return queue || [];
  }

  function isMigrated(){
    return localStorage.getItem(SYNC_CFG.migratedKey) === 'true';
  }

  function setMigrated(value){
    withInternalWrite(function(){
      if (value) {
        nativeSetItem.call(localStorage, SYNC_CFG.migratedKey, 'true');
      } else {
        nativeRemoveItem.call(localStorage, SYNC_CFG.migratedKey);
      }
    });
    writeSchemaMeta({
      cloudMigrated: !!value
    });
  }

  function readSchemaMeta(){
    var fallback = {
      schemaVersion: TF.Config && TF.Config.SchemaVersion || 2,
      cloudMigrated: isMigrated(),
      lastPushAt: null,
      lastPullAt: null,
      lastSyncAt: null,
      lastDrainAt: null,
      lastError: null
    };
    return Object.assign({}, fallback, safeParse(localStorage.getItem(SYNC_CFG.metaKey), {}));
  }

  function writeSchemaMeta(patch){
    var next = Object.assign({}, readSchemaMeta(), patch || {}, {
      schemaVersion: TF.Config && TF.Config.SchemaVersion || 2,
      cloudMigrated: isMigrated()
    });
    withInternalWrite(function(){
      nativeSetItem.call(localStorage, SYNC_CFG.metaKey, JSON.stringify(next));
    });
    return next;
  }

  function getPendingCount(){
    return readQueue().length;
  }

  function getPendingKeys(){
    return readQueue().map(function(item){
      return item.key;
    });
  }

  function deriveState(){
    if (!navigator.onLine) {
      return 'offline';
    }
    if (runtimeState.state === 'syncing') {
      return 'syncing';
    }
    if (runtimeState.lastError) {
      return 'error';
    }
    if (getPendingCount() > 0) {
      return 'local-only';
    }
    if (readSchemaMeta().lastSyncAt) {
      return 'synced';
    }
    return 'local-only';
  }

  function statusLabel(state){
    if (state === 'syncing') {
      return 'Syncing...';
    }
    if (state === 'synced') {
      return 'Synced';
    }
    if (state === 'offline') {
      return 'Offline';
    }
    if (state === 'error') {
      return 'Sync error';
    }
    return 'Local only';
  }

  function getSyncStatus(){
    var meta = readSchemaMeta();
    var state = deriveState();
    return {
      pending: getPendingCount(),
      pendingKeys: getPendingKeys(),
      isOnline: navigator.onLine,
      lastPushAt: meta.lastPushAt || null,
      lastPullAt: meta.lastPullAt || null,
      lastDrainAt: meta.lastDrainAt || null,
      lastSyncAt: meta.lastSyncAt || null,
      lastError: runtimeState.lastError || meta.lastError || null,
      state: state,
      statusLabel: statusLabel(state)
    };
  }

  function dispatchQueueChange(){
    window.dispatchEvent(new CustomEvent('tf:queuechange', {
      detail: {
        pending: getPendingCount()
      }
    }));
  }

  function dispatchSync(detail){
    window.dispatchEvent(new CustomEvent('tf:sync', {
      detail: detail || {}
    }));
  }

  function setRuntimeState(nextState, patch){
    runtimeState.state = nextState;
    if (patch && Object.prototype.hasOwnProperty.call(patch, 'lastError')) {
      runtimeState.lastError = patch.lastError;
    }
    if (patch && patch.persistError) {
      writeSchemaMeta({ lastError: runtimeState.lastError });
    }
  }

  function writeLocal(key, value){
    withInternalWrite(function(){
      if (value == null) {
        nativeRemoveItem.call(localStorage, key);
        return;
      }
      nativeSetItem.call(localStorage, key, TF.API.dataToStorageValue(key, value));
    });
  }

  function enqueueFailedPush(key, data, reason){
    var queue = readQueue();
    var next = {
      id: 'sync_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
      key: key,
      data: data == null ? null : JSON.parse(JSON.stringify(data)),
      queuedAt: nowIso(),
      attempts: 0,
      reason: reason || 'Cloud push failed'
    };
    var existingIndex = queue.findIndex(function(item){
      return item.key === key;
    });
    if (existingIndex >= 0) {
      queue.splice(existingIndex, 1, Object.assign({}, queue[existingIndex], next));
    } else {
      queue.push(next);
    }
    writeQueue(queue);
    setRuntimeState(navigator.onLine ? 'error' : 'offline', {
      lastError: reason || 'Cloud push failed',
      persistError: true
    });
    return next;
  }

  function pushSingleKey(key, data, options){
    var settings = Object.assign({
      queueOnFailure: true,
      silent: false
    }, options || {});

    if (!TF.API || !TF.API.isLoggedIn || !TF.API.isLoggedIn()) {
      return Promise.resolve({
        success: false,
        skipped: true,
        reason: 'not_logged_in'
      });
    }

    if (!navigator.onLine) {
      if (settings.queueOnFailure) {
        enqueueFailedPush(key, data, 'Offline');
      }
      return Promise.resolve({
        success: false,
        queued: true,
        reason: 'offline'
      });
    }

    setRuntimeState('syncing', { lastError: null, persistError: true });
    if (!settings.silent) {
      dispatchSync({ state: 'syncing', key: key });
    }

    return TF.API.push(key, data).then(function(result){
      if (result && result.success !== false) {
        var stamp = nowIso();
        writeSchemaMeta({
          lastPushAt: stamp,
          lastSyncAt: stamp,
          lastError: null
        });
        setRuntimeState('synced', { lastError: null, persistError: true });
        if (!settings.silent) {
          dispatchSync({ ok: true, key: key, syncedAt: stamp });
        }
        return {
          success: true,
          key: key
        };
      }

      if (settings.queueOnFailure) {
        enqueueFailedPush(key, data, result && result.error || 'Cloud push failed');
      }
      return {
        success: false,
        key: key,
        error: result && result.error || 'Cloud push failed'
      };
    }).catch(function(error){
      var message = error && error.message || 'Cloud push failed';
      console.warn('[Sync] Push failed for "' + key + '". Local data kept.', error);
      if (settings.queueOnFailure) {
        enqueueFailedPush(key, data, message);
      }
      return {
        success: false,
        key: key,
        error: message
      };
    });
  }

  function drainQueue(options){
    var settings = Object.assign({
      force: false,
      silent: false
    }, options || {});
    var queue = readQueue();
    var pushed = 0;
    var lastError = null;

    if (!TF.API.isLoggedIn()) {
      return Promise.resolve({
        ok: false,
        skipped: true,
        reason: 'not_logged_in',
        pushed: 0,
        remaining: queue.length,
        status: getSyncStatus()
      });
    }

    if (!queue.length) {
      return Promise.resolve({
        ok: true,
        skipped: true,
        reason: 'empty',
        pushed: 0,
        remaining: 0,
        status: getSyncStatus()
      });
    }

    if (!navigator.onLine && !settings.force) {
      setRuntimeState('offline', { lastError: 'Offline', persistError: true });
      return Promise.resolve({
        ok: false,
        skipped: true,
        reason: 'offline',
        pushed: 0,
        remaining: queue.length,
        status: getSyncStatus()
      });
    }

    setRuntimeState('syncing', { lastError: null, persistError: true });
    if (!settings.silent) {
      dispatchSync({ state: 'syncing', queue: queue.length });
    }

    return queue.reduce(function(chain, item){
      return chain.then(function(nextQueue){
        return TF.API.push(item.key, item.data).then(function(result){
          if (result && result.success !== false) {
            pushed += 1;
            return nextQueue;
          }

          lastError = result && result.error || 'Cloud push failed';
          item.attempts = (item.attempts || 0) + 1;
          item.reason = lastError;
          nextQueue.push(item);
          return nextQueue;
        }).catch(function(error){
          lastError = error && error.message || 'Cloud push failed';
          item.attempts = (item.attempts || 0) + 1;
          item.reason = lastError;
          nextQueue.push(item);
          return nextQueue;
        });
      });
    }, Promise.resolve([])).then(function(remainingQueue){
      var stamp = nowIso();
      writeQueue(remainingQueue);
      writeSchemaMeta({
        lastDrainAt: stamp,
        lastSyncAt: pushed > 0 ? stamp : readSchemaMeta().lastSyncAt,
        lastPushAt: pushed > 0 ? stamp : readSchemaMeta().lastPushAt,
        lastError: remainingQueue.length ? lastError : null
      });

      if (remainingQueue.length) {
        setRuntimeState(navigator.onLine ? 'error' : 'offline', {
          lastError: lastError,
          persistError: true
        });
      } else {
        setRuntimeState('synced', {
          lastError: null,
          persistError: true
        });
      }

      if (!settings.silent) {
        dispatchSync({
          ok: remainingQueue.length === 0,
          pushed: pushed,
          remaining: remainingQueue.length,
          error: lastError || null
        });
      }

      return {
        ok: remainingQueue.length === 0,
        skipped: false,
        pushed: pushed,
        remaining: remainingQueue.length,
        error: lastError || null,
        status: getSyncStatus()
      };
    });
  }

  function handleStorageMutation(op, key, rawValue){
    if (internalWriteDepth || !TF.API.isSyncableKey(key) || !TF.API.isLoggedIn()) {
      return;
    }
    var data = op === 'remove' ? null : TF.API.storageValueToData(key, String(rawValue));
    pushSingleKey(key, data, {
      queueOnFailure: true,
      silent: true
    });
  }

  function patchLocalStorage(){
    if (Storage.prototype.__tfV60SyncPatched) {
      return;
    }

    Storage.prototype.setItem = function(key, value){
      var previous = this === localStorage ? this.getItem(key) : null;
      var result = nativeSetItem.apply(this, arguments);
      if (this === localStorage && !internalWriteDepth && previous !== String(value)) {
        handleStorageMutation('set', key, value);
      }
      return result;
    };

    Storage.prototype.removeItem = function(key){
      var previous = this === localStorage ? this.getItem(key) : null;
      var result = nativeRemoveItem.apply(this, arguments);
      if (this === localStorage && !internalWriteDepth && previous !== null) {
        handleStorageMutation('remove', key);
      }
      return result;
    };

    Storage.prototype.__tfV60SyncPatched = true;
  }

  function buildBackupSnapshot(){
    return TF.StoreBackup.buildExportSnapshot(STORAGE_KEYS, TF.Config.version, {
      onboarded: localStorage.getItem(STORAGE_KEYS.ONBOARDED_STATE) === '1',
      cloudMigrated: isMigrated()
    });
  }

  function createBackupFileParts(){
    var snapshot = buildBackupSnapshot();
    var text = JSON.stringify(snapshot, null, 2);
    var fileName = 'tommyy-backup-' + TF.Store.todayKey() + '.json';
    var blob = new Blob([text], { type: 'application/json' });
    return {
      snapshot: snapshot,
      text: text,
      blob: blob,
      fileName: fileName
    };
  }

  function previewImport(jsonStr){
    var snapshot = TF.StoreBackup.normaliseSnapshot(JSON.parse(jsonStr), STORAGE_KEYS);
    var availableSections = Object.keys(STORAGE_KEYS).filter(function(name){
      return snapshot.data[name] !== undefined && snapshot.data[name] !== null;
    }).map(function(name){
      var value = snapshot.data[name];
      var count = 0;
      if (Array.isArray(value)) {
        count = value.length;
      } else if (value && typeof value === 'object') {
        count = Object.keys(value).length;
      } else if (value != null) {
        count = 1;
      }
      return {
        key: name,
        label: SECTION_LABELS[name] || name,
        count: count
      };
    });

    return {
      snapshot: snapshot,
      sections: availableSections
    };
  }

  function importData(jsonStr, selectedSections){
    var preview = previewImport(jsonStr);
    var wanted = Array.isArray(selectedSections) && selectedSections.length
      ? selectedSections.slice()
      : preview.sections.map(function(section){ return section.key; });

    wanted.forEach(function(name){
      var storageKey = STORAGE_KEYS[name];
      var value = preview.snapshot.data[name];

      if (!storageKey) {
        return;
      }

      if (value == null) {
        localStorage.removeItem(storageKey);
        return;
      }

      if (storageKey === STORAGE_KEYS.ONBOARDED_STATE) {
        localStorage.setItem(storageKey, String(value));
      } else {
        localStorage.setItem(storageKey, JSON.stringify(value));
      }
    });

    if (preview.snapshot.meta && preview.snapshot.meta.onboarded) {
      localStorage.setItem(STORAGE_KEYS.ONBOARDED_STATE, '1');
    }

    return true;
  }

  function clearAllData(){
    Object.keys(STORAGE_KEYS).forEach(function(name){
      localStorage.removeItem(STORAGE_KEYS[name]);
    });
    localStorage.removeItem(SYNC_CFG.migratedKey);
  }

  function restoreIfLoggedIn(options){
    var settings = Object.assign({
      rerender: false
    }, options || {});

    if (!TF.API.isLoggedIn()) {
      return Promise.resolve({
        success: false,
        skipped: true,
        reason: 'not_logged_in',
        pulled: 0
      });
    }

    setRuntimeState('syncing', { lastError: null, persistError: true });
    dispatchSync({ state: 'syncing', phase: 'pull' });

    return TF.API.restoreCloudToLocalStorage().then(function(pulled){
      var stamp = nowIso();
      if (pulled > 0) {
        writeSchemaMeta({
          lastPullAt: stamp,
          lastSyncAt: stamp,
          lastError: null
        });
        setMigrated(true);
        setRuntimeState('synced', { lastError: null, persistError: true });
      } else if (navigator.onLine && !isMigrated() && Object.keys(TF.API.readLocalSnapshot()).length > 0) {
        return migrateLocalData({ silent: true }).then(function(migration){
          setRuntimeState(migration.success ? 'synced' : 'local-only', {
            lastError: migration.success ? null : (migration.error || null),
            persistError: true
          });
          if (settings.rerender && TF.Router && TF.Router.current && TF.Router.current()) {
            TF.Router.navigate(TF.Router.current(), true);
          }
          dispatchSync({
            ok: migration.success,
            pulled: 0,
            pushed: migration.pushed || 0
          });
          return {
            success: migration.success,
            pulled: 0,
            pushed: migration.pushed || 0
          };
        });
      } else {
        setRuntimeState(getPendingCount() ? 'local-only' : 'synced', {
          lastError: null,
          persistError: true
        });
      }

      if (settings.rerender && TF.Router && TF.Router.current && TF.Router.current()) {
        TF.Router.navigate(TF.Router.current(), true);
      }

      dispatchSync({
        ok: true,
        pulled: pulled,
        pushed: 0
      });

      return {
        success: true,
        pulled: pulled,
        pushed: 0
      };
    }).catch(function(error){
      var message = error && error.message || 'Cloud restore failed';
      console.warn('[Sync] Cloud restore failed.', error);
      setRuntimeState(navigator.onLine ? 'error' : 'offline', {
        lastError: message,
        persistError: true
      });
      dispatchSync({
        ok: false,
        error: message
      });
      return {
        success: false,
        pulled: 0,
        error: message
      };
    });
  }

  function migrateLocalData(options){
    var settings = Object.assign({
      silent: false
    }, options || {});

    if (!TF.API.isLoggedIn()) {
      return Promise.resolve({
        success: false,
        skipped: true,
        reason: 'not_logged_in',
        pushed: 0
      });
    }

    setRuntimeState('syncing', { lastError: null, persistError: true });
    return TF.API.pushAllLocalStorageToCloud().then(function(summary){
      var stamp = nowIso();
      if (summary.success) {
        setMigrated(true);
        writeSchemaMeta({
          lastPushAt: stamp,
          lastSyncAt: stamp,
          lastError: null
        });
        setRuntimeState('synced', { lastError: null, persistError: true });
      } else {
        writeSchemaMeta({
          lastError: 'Some local data could not be migrated yet.'
        });
        setRuntimeState('local-only', {
          lastError: 'Some local data could not be migrated yet.',
          persistError: true
        });
      }

      if (!settings.silent) {
        dispatchSync({
          ok: summary.success,
          pushed: summary.pushed,
          failed: summary.failed
        });
      }

      return summary;
    });
  }

  function handleAuthenticatedSession(){
    return restoreIfLoggedIn({ rerender: false }).then(function(result){
      return drainQueue({ silent: true }).then(function(queueResult){
        return {
          restored: result && result.pulled || 0,
          queuedPushed: queueResult && queueResult.pushed || 0
        };
      });
    });
  }

  function syncNow(){
    if (!TF.API.isLoggedIn()) {
      return Promise.resolve({
        pushed: 0,
        pulled: 0,
        success: false,
        reason: 'not_logged_in'
      });
    }

    return TF.API.syncNow().then(function(summary){
      var stamp = nowIso();
      if (summary.success) {
        setMigrated(true);
        writeSchemaMeta({
          lastPushAt: stamp,
          lastPullAt: stamp,
          lastDrainAt: stamp,
          lastSyncAt: stamp,
          lastError: null
        });
        setRuntimeState('synced', { lastError: null, persistError: true });
      } else {
        setRuntimeState('local-only', {
          lastError: summary.reason || 'Sync incomplete',
          persistError: true
        });
      }
      dispatchSync(summary);
      dispatchQueueChange();
      return summary;
    }).catch(function(error){
      var message = error && error.message || 'Sync failed';
      console.warn('[Sync] syncNow failed.', error);
      setRuntimeState(navigator.onLine ? 'error' : 'offline', {
        lastError: message,
        persistError: true
      });
      dispatchSync({
        ok: false,
        error: message
      });
      return {
        pushed: 0,
        pulled: 0,
        success: false,
        error: message
      };
    });
  }

  patchLocalStorage();
  writeSchemaMeta({});
  dispatchQueueChange();

  window.addEventListener('online', function(){
    setRuntimeState('local-only', { lastError: null, persistError: true });
    drainQueue({ silent: true });
  });

  window.addEventListener('offline', function(){
    setRuntimeState('offline', { lastError: 'Offline', persistError: true });
    dispatchSync({ ok: false, reason: 'offline' });
  });

  TF.CloudSync = {
    syncNow: syncNow
  };

  TF.Sync = {
    getStatus: getSyncStatus,
    writeLocal: writeLocal,
    enqueueFailedPush: enqueueFailedPush,
    drainQueue: drainQueue,
    restoreIfLoggedIn: restoreIfLoggedIn,
    migrateLocalData: migrateLocalData,
    handleAuthenticatedSession: handleAuthenticatedSession,
    syncNow: syncNow
  };

  TF.Store.getSchemaInfo = function(){
    return readSchemaMeta();
  };
  TF.Store.getRecordMeta = function(){
    return {};
  };
  TF.Store.getActionQueue = function(){
    return readQueue();
  };
  TF.Store.getSyncStatus = getSyncStatus;
  TF.Store.drainActionQueue = drainQueue;
  TF.Store.buildBackupSnapshot = buildBackupSnapshot;
  TF.Store.createBackupFileParts = createBackupFileParts;
  TF.Store.previewImport = previewImport;
  TF.Store.importData = importData;
  TF.Store.exportAllData = function(){
    var parts = createBackupFileParts();
    var url = URL.createObjectURL(parts.blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = parts.fileName;
    link.click();
    TF.Store.markBackupExported();
    setTimeout(function(){
      URL.revokeObjectURL(url);
    }, 1000);
    return parts;
  };
  TF.Store.clearAllData = clearAllData;
})();
