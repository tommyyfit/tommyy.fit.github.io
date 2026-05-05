(function(){
  'use strict';

  var TF = window.TF = window.TF || {};

  function clone(value){
    if (value == null) {
      return value;
    }
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (_error) {
      return value;
    }
  }

  function authUserIdKey(){
    return TF.Config && TF.Config.Auth ? TF.Config.Auth.userIdKey : 'tf_user_id';
  }

  function authUserEmailKey(){
    return TF.Config && TF.Config.Auth ? TF.Config.Auth.userEmailKey : 'tf_user_email';
  }

  function syncConfig(){
    return Object.assign({
      rawStringKeys: ['tf_onboarded'],
      ignoredKeys: []
    }, TF.Config && TF.Config.Sync || {});
  }

  function normaliseEmail(email){
    return String(email || '').trim().toLowerCase();
  }

  function safeParse(raw){
    if (raw == null) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch (_error) {
      return raw;
    }
  }

  function isRawStringKey(key){
    return syncConfig().rawStringKeys.indexOf(key) >= 0;
  }

  function dataToStorageValue(key, value){
    if (value == null) {
      return null;
    }
    if (isRawStringKey(key)) {
      return String(value);
    }
    return JSON.stringify(value);
  }

  function storageValueToData(key, rawValue){
    if (rawValue == null) {
      return null;
    }
    if (isRawStringKey(key)) {
      return String(rawValue);
    }
    return safeParse(rawValue);
  }

  function isSyncableKey(key){
    var ignoredKeys = syncConfig().ignoredKeys || [];
    if (!key || ignoredKeys.indexOf(key) >= 0) {
      return false;
    }
    return /^tf_/.test(key);
  }

  function readLocalSnapshot(){
    var snapshot = {};
    Object.keys(localStorage).sort().forEach(function(key){
      if (!isSyncableKey(key)) {
        return;
      }
      snapshot[key] = storageValueToData(key, localStorage.getItem(key));
    });
    return snapshot;
  }

  function buildUrl(path){
    var baseUrl = (TF.Config && TF.Config.API && TF.Config.API.baseUrl) || '';
    return baseUrl.replace(/\/$/, '') + path;
  }

  function buildRequestInit(method, options){
    var settings = Object.assign({
      body: null,
      headers: null
    }, options || {});
    return {
      method: method,
      headers: Object.assign({
        'Content-Type': 'application/json'
      }, settings.headers || {}),
      body: settings.body == null ? null : JSON.stringify(settings.body)
    };
  }

  function buildErrorFromResponse(response, payload, fallback){
    var message = payload && (payload.error || payload.message || payload.detail);
    return new Error(message || fallback || ('API request failed with status ' + response.status));
  }

  function buildFetchError(error){
    var message = error && error.message ? error.message : 'Network request failed.';
    if (/Failed to fetch|NetworkError|Load failed/i.test(message)) {
      message = 'Network request failed. If you are online, the Cloudflare Worker may be missing CORS headers.';
    }
    return new Error(message);
  }

  function request(method, path, options){
    var requestUrl = buildUrl(path);
    return fetch(requestUrl, buildRequestInit(method, options)).then(function(response){
      return response.text().then(function(text){
        var payload = text ? safeParse(text) : null;
        if (!response.ok) {
          throw buildErrorFromResponse(response, payload, 'API request failed with status ' + response.status);
        }
        return payload;
      });
    }).catch(function(error){
      throw buildFetchError(error);
    });
  }

  /* TODO: backend should hash passwords before storing them. */
  function register(email, password){
    return request('POST', '/auth/register', {
      body: {
        email: normaliseEmail(email),
        password: String(password || '')
      }
    });
  }

  /* TODO: replace this MVP local user_id storage with a real session/JWT flow later. */
  function login(email, password){
    var normalisedEmail = normaliseEmail(email);
    return request('POST', '/auth/login', {
      body: {
        email: normalisedEmail,
        password: String(password || '')
      }
    }).then(function(result){
      if (!result || !result.user_id) {
        throw new Error('Login failed: missing user_id');
      }
      localStorage.setItem(authUserIdKey(), result.user_id);
      localStorage.setItem(authUserEmailKey(), normalisedEmail);
      return result;
    });
  }

  function logout(){
    localStorage.removeItem(authUserIdKey());
    localStorage.removeItem(authUserEmailKey());
  }

  function isLoggedIn(){
    return !!localStorage.getItem(authUserIdKey());
  }

  function getUserId(){
    return localStorage.getItem(authUserIdKey());
  }

  function push(key, data){
    if (!isLoggedIn()) {
      return Promise.resolve({
        success: false,
        skipped: true,
        reason: 'not_logged_in'
      });
    }

    return request('POST', '/sync/push', {
      body: {
        user_id: getUserId(),
        key: key,
        data: clone(data)
      }
    }).then(function(result){
      return Object.assign({
        success: true,
        key: key
      }, result || {});
    }).catch(function(error){
      console.warn('[TF.API] Cloud push failed for "' + key + '". Local data is still safe.', error);
      return {
        success: false,
        key: key,
        error: error.message || String(error)
      };
    });
  }

  function pull(){
    if (!isLoggedIn()) {
      return Promise.resolve([]);
    }

    return request('GET', '/sync/pull?user_id=' + encodeURIComponent(getUserId())).then(function(result){
      return Array.isArray(result) ? result : [];
    }).catch(function(error){
      console.warn('[TF.API] Cloud pull failed. Local cache remains available.', error);
      return [];
    });
  }

  function writeCloudItemToLocal(item){
    if (!item || !item.storage_key) {
      return false;
    }
    var value = item.data_json == null ? null : safeParse(item.data_json);
    if (TF.Sync && typeof TF.Sync.writeLocal === 'function') {
      TF.Sync.writeLocal(item.storage_key, value);
      return true;
    }
    if (value == null) {
      localStorage.removeItem(item.storage_key);
      return true;
    }
    localStorage.setItem(item.storage_key, dataToStorageValue(item.storage_key, value));
    return true;
  }

  function restoreCloudToLocalStorage(){
    return pull().then(function(items){
      var restored = 0;
      items.forEach(function(item){
        if (writeCloudItemToLocal(item)) {
          restored += 1;
        }
      });
      return restored;
    });
  }

  function pushAllLocalStorageToCloud(){
    var snapshot = readLocalSnapshot();
    var keys = Object.keys(snapshot);
    var pushed = 0;
    var failed = 0;

    return keys.reduce(function(chain, key){
      return chain.then(function(){
        return push(key, snapshot[key]).then(function(result){
          if (result && result.success !== false) {
            pushed += 1;
          } else {
            failed += 1;
            if (TF.Sync && typeof TF.Sync.enqueueFailedPush === 'function') {
              TF.Sync.enqueueFailedPush(key, snapshot[key], result && result.error || 'Cloud push failed');
            }
          }
        });
      });
    }, Promise.resolve()).then(function(){
      return {
        success: failed === 0,
        pushed: pushed,
        failed: failed,
        total: keys.length
      };
    });
  }

  function syncNow(){
    if (!isLoggedIn()) {
      return Promise.resolve({
        pushed: 0,
        pulled: 0,
        success: false,
        reason: 'not_logged_in'
      });
    }

    var queuedPushed = 0;
    var pulled = 0;
    return Promise.resolve().then(function(){
      if (TF.Sync && typeof TF.Sync.drainQueue === 'function') {
        return TF.Sync.drainQueue({ force: true, silent: true }).then(function(result){
          queuedPushed = result && result.pushed || 0;
          return result;
        });
      }
      return null;
    }).then(function(){
      return pushAllLocalStorageToCloud();
    }).then(function(pushSummary){
      return restoreCloudToLocalStorage().then(function(restored){
        pulled = restored;
        return {
          pushed: queuedPushed + (pushSummary && pushSummary.pushed || 0),
          pulled: pulled,
          success: !!(pushSummary && pushSummary.success)
        };
      });
    });
  }

  TF.API = {
    request: request,
    get: function(path, options){ return request('GET', path, options); },
    post: function(path, body, options){ return request('POST', path, Object.assign({}, options || {}, { body: body })); },
    register: register,
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
    getUserId: getUserId,
    push: push,
    pull: pull,
    restoreCloudToLocalStorage: restoreCloudToLocalStorage,
    pushAllLocalStorageToCloud: pushAllLocalStorageToCloud,
    syncNow: syncNow,
    readLocalSnapshot: readLocalSnapshot,
    isSyncableKey: isSyncableKey,
    storageValueToData: storageValueToData,
    dataToStorageValue: dataToStorageValue
  };
})();
