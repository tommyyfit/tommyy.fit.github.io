TF.Screens.login = function(root) {
  renderAuthShell(root, 'login');
};

TF.Screens.register = function(root) {
  renderAuthShell(root, 'register');
};

function renderAuthShell(root, mode) {
  var isRegister = mode === 'register';
  var pending = TF.Auth.getPendingProfile ? TF.Auth.getPendingProfile() : null;
  var state = {
    name: pending && pending.name || '',
    email: pending && pending.email || '',
    password: '',
    confirmPassword: ''
  };

  function emailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
  }

  function updateStrength() {
    var result = TF.Auth.evaluatePassword(state.password);
    var fill = root.querySelector('[data-password-fill]');
    var label = root.querySelector('[data-password-label]');
    var hint = root.querySelector('[data-password-hint]');

    if (fill) {
      fill.style.width = result.pct + '%';
      fill.style.background = result.score <= 1 ? 'var(--red)' : result.score === 2 ? 'var(--amber)' : 'var(--lime)';
    }
    if (label) {
      label.textContent = result.label;
      label.style.color = result.score <= 1 ? 'var(--red)' : result.score === 2 ? 'var(--amber)' : 'var(--lime)';
    }
    if (hint) {
      hint.textContent = '6+ chars works for the MVP backend. Stronger is still better.';
    }
  }

  function showFieldError(id, message) {
    var el = root.querySelector('[data-error-for="' + id + '"]');
    if (el) {
      el.textContent = message || '';
    }
  }

  function clearErrors() {
    root.querySelectorAll('[data-error-for]').forEach(function(node){
      node.textContent = '';
    });
  }

  function validate() {
    var valid = true;
    clearErrors();

    if (isRegister && !state.name.trim()) {
      showFieldError('name', 'Name is required.');
      valid = false;
    }
    if (!emailValid(state.email)) {
      showFieldError('email', 'Enter a valid email address.');
      valid = false;
    }
    if (state.password.length < 6) {
      showFieldError('password', 'Password must be at least 6 characters.');
      valid = false;
    }
    if (isRegister && state.password !== state.confirmPassword) {
      showFieldError('confirm', 'Passwords do not match.');
      valid = false;
    }
    return valid;
  }

  function render() {
    root.innerHTML = '' +
      '<div class="screen-full auth-shell">' +
        '<div class="auth-shell-bg"></div>' +
        '<div class="auth-shell-card">' +
          '<div class="auth-shell-head">' +
            '<div class="auth-shell-brand">TOMMYY<span>.FIT</span></div>' +
            '<div class="auth-shell-kicker">v6.0-alpha cloud auth</div>' +
            '<div class="auth-shell-title">' + (isRegister ? 'Register' : 'Login') + '</div>' +
            '<div class="auth-shell-copy">' +
              (isRegister
                ? 'Create your cloud account, keep local backups, and migrate this device into sync.'
                : 'Sign into your TOMMYY.FIT cloud account and restore your synced data on this device.') +
            '</div>' +
          '</div>' +
          '<div class="auth-tabs">' +
            '<button class="auth-tab' + (!isRegister ? ' is-active' : '') + '" type="button" data-auth-route="login">Login</button>' +
            '<button class="auth-tab' + (isRegister ? ' is-active' : '') + '" type="button" data-auth-route="register">Register</button>' +
          '</div>' +
          '<div class="card" style="margin-bottom:14px">' +
            (isRegister ? '' +
              '<div class="field-group" style="margin-bottom:12px">' +
                '<div class="field-label">Name</div>' +
                '<input class="field" id="auth-name" type="text" maxlength="30" value="' + TF.UI.escapeAttr(state.name) + '" autocomplete="name" placeholder="Tommy or Warrior">' +
                '<div class="field-error" data-error-for="name"></div>' +
              '</div>' : '') +
            '<div class="field-group" style="margin-bottom:12px">' +
              '<div class="field-label">Email</div>' +
              '<input class="field" id="auth-email" type="email" value="' + TF.UI.escapeAttr(state.email) + '" autocomplete="email" placeholder="you@example.com">' +
              '<div class="field-error" data-error-for="email"></div>' +
            '</div>' +
            '<div class="field-group" style="margin-bottom:12px">' +
              '<div class="field-label">Password</div>' +
              '<input class="field" id="auth-password" type="password" autocomplete="' + (isRegister ? 'new-password' : 'current-password') + '" placeholder="At least 6 characters">' +
              '<div class="field-error" data-error-for="password"></div>' +
            '</div>' +
            '<div class="password-meter" style="margin-bottom:12px">' +
              '<div class="password-meter-bar"><div class="password-meter-fill" data-password-fill></div></div>' +
              '<div class="password-meter-meta">' +
                '<span>Password strength</span>' +
                '<strong data-password-label>Weak</strong>' +
              '</div>' +
              '<div class="t-hint" data-password-hint>6+ chars works for the MVP backend. Stronger is still better.</div>' +
            '</div>' +
            (isRegister ? '' +
              '<div class="field-group">' +
                '<div class="field-label">Confirm password</div>' +
                '<input class="field" id="auth-confirm" type="password" autocomplete="new-password" placeholder="Repeat your password">' +
                '<div class="field-error" data-error-for="confirm"></div>' +
              '</div>' : '') +
          '</div>' +
          '<button class="btn btn-primary" id="auth-submit">' + TF.Icon(isRegister ? 'user-plus' : 'log-in', 14) + ' ' + (isRegister ? 'CREATE CLOUD ACCOUNT' : 'LOGIN TO CLOUD') + '</button>' +
          '<button class="btn btn-ghost" id="auth-bypass" style="margin-top:10px">' + TF.Icon('arrow-right', 14) + ' CONTINUE TO LOCAL SETUP</button>' +
          '<div class="auth-footnote">Your browser still keeps a local backup. Cloud sync should never block your training log.</div>' +
        '</div>' +
      '</div>';

    root.querySelectorAll('[data-auth-route]').forEach(function(button){
      button.addEventListener('click', function(){
        if (button.dataset.authRoute !== mode) {
          TF.Router.navigate(button.dataset.authRoute, true);
        }
      });
    });

    root.querySelector('#auth-email').addEventListener('input', function(){
      state.email = this.value;
    });

    root.querySelector('#auth-password').addEventListener('input', function(){
      state.password = this.value;
      updateStrength();
    });

    if (isRegister) {
      root.querySelector('#auth-name').addEventListener('input', function(){
        state.name = this.value;
      });
      root.querySelector('#auth-confirm').addEventListener('input', function(){
        state.confirmPassword = this.value;
      });
    }

    root.querySelector('#auth-bypass').addEventListener('click', function(){
      if (isRegister && state.name.trim()) {
        TF.Auth.setPendingProfile({
          name: state.name.trim(),
          email: state.email.trim()
        });
      }
      TF.Router.navigate('onboarding', true);
    });

    root.querySelector('#auth-submit').addEventListener('click', function(){
      if (!validate()) {
        TF.UI.toast('Check the highlighted fields first.', 'error');
        return;
      }

      var submitButton = this;
      submitButton.disabled = true;
      submitButton.textContent = isRegister ? 'CREATING ACCOUNT...' : 'LOGGING IN...';

      var action = isRegister
        ? TF.Auth.register({
            name: state.name.trim(),
            email: state.email.trim(),
            password: state.password
          })
        : TF.Auth.login({
            email: state.email.trim(),
            password: state.password
          });

      action.then(function(){
        TF.UI.toast(isRegister ? 'Cloud account created. Sync is live on this device.' : 'Cloud login complete. Data restored if available.', 'success');
        TF.Router.navigate(TF.Store.isAccountReady() ? 'dashboard' : 'onboarding', true);
      }).catch(function(error){
        submitButton.disabled = false;
        submitButton.innerHTML = TF.Icon(isRegister ? 'user-plus' : 'log-in', 14) + ' ' + (isRegister ? 'CREATE CLOUD ACCOUNT' : 'LOGIN TO CLOUD');
        TF.UI.toast(error && error.message || 'Cloud auth failed to start.', 'error');
      });
    });

    updateStrength();
  }

  render();
}
