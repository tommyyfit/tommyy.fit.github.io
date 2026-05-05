(function(){
  'use strict';

  var TF = window.TF = window.TF || {};
  var session = null;
  var pendingProfile = null;

  function normaliseEmail(email){
    return String(email || '').trim().toLowerCase();
  }

  function authUserIdKey(){
    return TF.Config && TF.Config.Auth ? TF.Config.Auth.userIdKey : 'tf_user_id';
  }

  function authUserEmailKey(){
    return TF.Config && TF.Config.Auth ? TF.Config.Auth.userEmailKey : 'tf_user_email';
  }

  function evaluatePassword(password){
    var value = String(password || '');
    var checks = {
      length: value.length >= 6,
      mixedCase: /[a-z]/.test(value) && /[A-Z]/.test(value),
      number: /\d/.test(value),
      symbol: /[^A-Za-z0-9]/.test(value)
    };
    var score = Object.keys(checks).reduce(function(total, key){
      return total + (checks[key] ? 1 : 0);
    }, 0);
    var label = score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Strong' : 'Excellent';

    return {
      value: value,
      score: score,
      pct: Math.max(8, score * 25),
      label: label,
      checks: checks
    };
  }

  function setSession(nextSession){
    session = nextSession ? Object.assign({}, nextSession) : null;
    if (session && session.user && session.user.id) {
      localStorage.setItem(authUserIdKey(), session.user.id);
    }
    if (session && session.user && session.user.email) {
      localStorage.setItem(authUserEmailKey(), session.user.email);
    }
    return session;
  }

  function getSession(){
    if (session) {
      return Object.assign({}, session);
    }

    var userId = localStorage.getItem(authUserIdKey());
    var email = localStorage.getItem(authUserEmailKey());
    if (!userId) {
      return null;
    }

    return {
      token: null,
      user: {
        id: userId,
        email: email || ''
      },
      mode: 'cloudflare-worker',
      expiresAt: null
    };
  }

  function setPendingProfile(profile){
    pendingProfile = profile ? Object.assign({}, profile) : null;
    return pendingProfile;
  }

  function getPendingProfile(){
    return pendingProfile ? Object.assign({}, pendingProfile) : null;
  }

  function clearPendingProfile(){
    pendingProfile = null;
  }

  function afterAuthSuccess(){
    if (TF.Sync && typeof TF.Sync.handleAuthenticatedSession === 'function') {
      return TF.Sync.handleAuthenticatedSession().then(function(){
        return getSession();
      });
    }
    return Promise.resolve(getSession());
  }

  function login(payload){
    var email = normaliseEmail(payload && payload.email);
    var password = String(payload && payload.password || '');

    return TF.API.login(email, password).then(function(result){
      setSession({
        token: null,
        user: {
          id: result.user_id,
          email: email
        },
        mode: 'cloudflare-worker',
        expiresAt: null
      });
      return afterAuthSuccess();
    });
  }

  function register(payload){
    var name = String(payload && payload.name || '').trim();
    var email = normaliseEmail(payload && payload.email);
    var password = String(payload && payload.password || '');

    return TF.API.register(email, password).then(function(){
      setPendingProfile({
        name: name,
        email: email
      });
      return TF.API.login(email, password);
    }).then(function(result){
      setSession({
        token: null,
        user: {
          id: result.user_id,
          email: email,
          name: name
        },
        mode: 'cloudflare-worker',
        expiresAt: null
      });
      return afterAuthSuccess().then(function(nextSession){
        return {
          session: nextSession,
          pendingProfile: getPendingProfile()
        };
      });
    });
  }

  function logout(){
    session = null;
    pendingProfile = null;
    if (TF.API && typeof TF.API.logout === 'function') {
      TF.API.logout();
    } else {
      localStorage.removeItem(authUserIdKey());
      localStorage.removeItem(authUserEmailKey());
    }
  }

  TF.Auth = {
    evaluatePassword: evaluatePassword,
    getSession: getSession,
    isAuthenticated: function(){
      return !!getSession();
    },
    setPendingProfile: setPendingProfile,
    getPendingProfile: getPendingProfile,
    clearPendingProfile: clearPendingProfile,
    login: login,
    register: register,
    logout: logout
  };
})();
