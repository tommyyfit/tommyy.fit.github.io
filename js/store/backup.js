TF.StoreBackup = (function(){
  'use strict';

  var SCHEMA_VERSION = 1;
  var VALUE_SHAPES = {
    PROFILE: 'object',
    INPUTS: 'object',
    MISSIONS: 'object',
    NUTRITION: 'object',
    WEIGHT: 'array',
    QUOTES: 'object',
    WORKOUT_LOG: 'object',
    CUSTOM_WORKOUTS: 'array',
    WORKOUT_SELECTION: 'object',
    OVERLOAD: 'object',
    MEASUREMENTS: 'array',
    BODY_METRICS: 'array',
    ACHIEVEMENTS: 'object',
    SHIELDS: 'number',
    THEME: 'string',
    SETTINGS: 'object',
    HABITS: 'object',
    HABIT_STREAKS: 'object',
    PRS: 'object'
  };

  function isPlainObject(value){
    return !!value && Object.prototype.toString.call(value) === '[object Object]';
  }

  function matchesShape(name, value){
    var shape = VALUE_SHAPES[name];
    if (value === null) {
      return true;
    }
    if (shape === 'array') {
      return Array.isArray(value);
    }
    if (shape === 'object') {
      return isPlainObject(value);
    }
    if (shape === 'number') {
      return typeof value === 'number' && isFinite(value);
    }
    if (shape === 'string') {
      return typeof value === 'string';
    }
    return true;
  }

  function migrateLegacySnapshot(snapshot){
    return {
      schemaVersion: SCHEMA_VERSION,
      version: snapshot.version || null,
      exportedAt: snapshot.exportedAt || null,
      meta: isPlainObject(snapshot.meta) ? snapshot.meta : {},
      data: isPlainObject(snapshot.data) ? snapshot.data : {}
    };
  }

  function migrateSnapshot(snapshot){
    var schemaVersion;
    if (!isPlainObject(snapshot)) {
      throw new Error('Invalid backup file');
    }

    schemaVersion = snapshot.schemaVersion == null ? 0 : parseInt(snapshot.schemaVersion, 10);
    if (!isFinite(schemaVersion) || schemaVersion < 0) {
      throw new Error('Invalid backup schema');
    }
    if (schemaVersion > SCHEMA_VERSION) {
      throw new Error('Backup was created by a newer app version');
    }

    if (schemaVersion === 0) {
      snapshot = migrateLegacySnapshot(snapshot);
    }

    return snapshot;
  }

  function normaliseSnapshot(snapshot, keys){
    var migrated = migrateSnapshot(snapshot);
    var data = migrated.data;

    if (!isPlainObject(data)) {
      throw new Error('Invalid backup payload');
    }

    Object.keys(data).forEach(function(name){
      if (!Object.prototype.hasOwnProperty.call(keys, name)) {
        return;
      }
      if (!matchesShape(name, data[name])) {
        throw new Error('Invalid backup value for ' + name);
      }
    });

    return {
      schemaVersion: SCHEMA_VERSION,
      version: migrated.version || (TF.Config && TF.Config.version) || null,
      exportedAt: migrated.exportedAt || null,
      meta: isPlainObject(migrated.meta) ? migrated.meta : {},
      data: data
    };
  }

  function buildExportSnapshot(keys, version, meta){
    var snapshot = {
      schemaVersion: SCHEMA_VERSION,
      version: version || null,
      exportedAt: new Date().toISOString(),
      meta: isPlainObject(meta) ? meta : {},
      data: {}
    };

    Object.entries(keys).forEach(function(entry){
      try{
        snapshot.data[entry[0]] = JSON.parse(localStorage.getItem(entry[1]) || 'null');
      }catch(_){}
    });

    return snapshot;
  }

  return {
    buildExportSnapshot: buildExportSnapshot,
    normaliseSnapshot: normaliseSnapshot,
    schemaVersion: SCHEMA_VERSION
  };
})();
