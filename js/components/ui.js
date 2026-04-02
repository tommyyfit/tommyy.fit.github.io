/* ================================================================
   UI HELPERS v2 — haptics, confetti, score animation, validation, image skeleton
   ================================================================ */
TF.UI = (function () {
  'use strict';

  var ESCAPE_LOOKUP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;'
  };
  var _modalCleanup = null;

  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"'`]/g, function (ch) {
      return ESCAPE_LOOKUP[ch];
    });
  }

  function escapeAttr(value) {
    return escapeHTML(value);
  }

  function renderRichText(value) {
    return escapeHTML(value)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var el = document.createElement('textarea');
        el.value = text;
        el.setAttribute('readonly', 'readonly');
        el.style.position = 'fixed';
        el.style.top = '-9999px';
        document.body.appendChild(el);
        el.focus();
        el.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(el);
        if (ok) resolve();
        else reject(new Error('Copy command failed.'));
      } catch (err) {
        reject(err);
      }
    });
  }

  function notify(title, options) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return false;
    }
    try {
      new Notification(title, options || {});
      return true;
    } catch (e) {
      return false;
    }
  }

  function buildLevelGuide() {
    var profile = TF.Store.getProfile();
    var level = TF.Store.getLevel(profile);
    var title = TF.Store.getWarriorTitle(level);

    var perLevel = TF.Config.XP.perLevel;
    var titles = TF.Config.WarriorTitles.slice(1);
    var maxNamedLevel = titles.length;

    var summaryCopy = level >= maxNamedLevel
      ? 'You are at the top visible rank track with ' + profile.xp + ' XP total.'
      : profile.xp + ' XP total. ' + TF.Store.getXPToNext(profile) + ' XP to reach the next level.';

    return '<div class="level-guide">' +
      '<div class="level-guide-summary">' +
      '<div class="level-guide-summary-label">Current Rank</div>' +
      '<div class="level-guide-summary-title">Lv.' + level + ' ' + TF.UI.escapeHTML(title) + '</div>' +
      '<div class="level-guide-summary-copy">' + TF.UI.escapeHTML(summaryCopy) + '</div>' +
      '</div>' +
      '<div class="level-guide-list">' +
      titles.map(function (rank, idx) {
        var lvl = idx + 1;
        var isLast = lvl === titles.length;
        var isActive = isLast ? level >= lvl : level === lvl;
        var range = isLast
          ? ((lvl - 1) * perLevel) + '+ XP'
          : ((lvl - 1) * perLevel) + ' - ' + ((lvl * perLevel) - 1) + ' XP';

        return '<div class="level-guide-row' + (isActive ? ' active' : '') + '">' +
          '<div>' +
          '<div class="level-guide-name">Lv.' + lvl + (isLast ? '+' : '') + ' ' + TF.UI.escapeHTML(rank) + '</div>' +
          '<div class="level-guide-range">' + range + '</div>' +
          '</div>' +
          '<div class="level-guide-badge">' + (isActive ? 'Current' : '') + '</div>' +
          '</div>';
      }).join('') +
      '</div>' +
      '</div>';
  }

  /* ── Haptic feedback ── */
  function haptic(ms) { try { navigator.vibrate(ms || 50); } catch (e) { } }

  /* ── Toast ── */
  function toast(msg, type, ms) {
    ms = ms || 2800;
    var root = document.getElementById('toast-root');
    if (!root) return;
    var el = document.createElement('div');
    el.className = 'toast' + (type ? ' toast-' + type : '');
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, ms);
  }

  function closeModal() {
    var root = document.getElementById('modal-root');
    if (!root) return;
    if (typeof _modalCleanup === 'function') {
      try { _modalCleanup(); } catch (e) { }
    }
    _modalCleanup = null;
    root.innerHTML = '';
  }

  function modal(opts) {
    var root = document.getElementById('modal-root');
    var title, copy, cancelText, confirmText, backdrop, cancelBtn, confirmBtn, bodyHtml;
    function onKeydown(e) {
      if (e.key === 'Escape') {
        closeModal();
      }
    }

    if (!root) return;
    closeModal();

    title = escapeHTML((opts && opts.title) || '');
    copy = escapeHTML((opts && opts.copy) || '').replace(/\n/g, '<br>');
    cancelText = escapeHTML((opts && opts.cancelText) || 'Close');
    confirmText = escapeHTML((opts && opts.confirmText) || 'Continue');
    bodyHtml = opts && typeof opts.html === 'string'
      ? '<div class="modal-body">' + opts.html + '</div>'
      : '<div class="modal-copy">' + copy + '</div>';

    root.innerHTML =
      '<div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
      '<div class="modal-card">' +
      '<div class="modal-icon">' + TF.Icon((opts && opts.icon) || 'user', 26) + '</div>' +
      '<div class="modal-title" id="modal-title">' + title + '</div>' +
      bodyHtml +
      '<div class="modal-actions">' +
      '<button class="btn btn-ghost" type="button" data-modal-cancel>' + cancelText + '</button>' +
      '<button class="btn btn-primary" type="button" data-modal-confirm>' + confirmText + '</button>' +
      '</div>' +
      '</div>' +
      '</div>';

    backdrop = root.querySelector('.modal-backdrop');
    cancelBtn = root.querySelector('[data-modal-cancel]');
    confirmBtn = root.querySelector('[data-modal-confirm]');

    if (backdrop) {
      backdrop.addEventListener('click', function (e) {
        if (e.target === backdrop) {
          closeModal();
        }
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', function () {
        closeModal();
        if (opts && typeof opts.onCancel === 'function') {
          opts.onCancel();
        }
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', function () {
        closeModal();
        if (opts && typeof opts.onConfirm === 'function') {
          opts.onConfirm();
        }
      });
    }

    document.addEventListener('keydown', onKeydown);
    _modalCleanup = function () {
      document.removeEventListener('keydown', onKeydown);
    };

    requestAnimationFrame(function () {
      if (confirmBtn) {
        confirmBtn.focus();
      }
    });
  }

  function promptAccountRequired() {
    if (document.querySelector('#modal-root .modal-backdrop')) {
      return;
    }
    haptic(40);
    modal({
      icon: 'user',
      title: 'Create your account first',
      copy: 'Create an account before you can do this. Finish the onboarding steps first, then the rest of the app will unlock.',
      cancelText: 'Not now',
      confirmText: 'Create account',
      onConfirm: function () {
        var nameField;
        if (TF.Router && TF.Router.current && TF.Router.current() !== 'onboarding') {
          TF.Router.navigate('onboarding', true);
          return;
        }
        nameField = document.getElementById('ob-name');
        if (nameField) {
          nameField.focus();
        }
      }
    });
  }

  /* ── Confetti burst ── */
  function confetti(opts) {
    try {
      if (window.confetti) {
        window.confetti(Object.assign({
          particleCount: 80, spread: 70, origin: { y: .6 },
          colors: ['#C8FF00', '#FFB83D', '#4EBFF5', '#FFFFFF'],
          disableForReducedMotion: true
        }, opts || {}));
      }
    } catch (e) { }
  }

  /* ── Animated score counter ── */
  function animateScore(el, target, color) {
    if (!el) return;
    var current = 0, steps = 40, ms = 600 / steps;
    el.style.color = color || 'var(--lime)';
    var interval = setInterval(function () {
      current = Math.min(current + target / steps, target);
      el.textContent = Math.round(current);
      if (current >= target) clearInterval(interval);
    }, ms);
  }

  /* ── Progress bar ── */
  function bar(pct, color, lg) {
    pct = Math.min(Math.max(pct || 0, 0), 1);
    var cls = lg ? 'bar-track bar-track-lg' : 'bar-track';
    var fCls = lg ? 'bar-fill bar-fill-lg' : 'bar-fill';
    return '<div class="' + cls + '"><div class="' + fCls + '" style="width:' + Math.round(pct * 100) + '%;background:' + color + '"></div></div>';
  }

  /* ── Ring SVG ── */
  function ring(pct, color, label, size) {
    size = size || 72; pct = Math.min(Math.max(pct || 0, 0), 1);
    var r = (size - 10) / 2, circ = 2 * Math.PI * r, cx = size / 2, offset = circ - pct * circ;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" style="transform:rotate(-90deg)">' +
      '<circle fill="none" cx="' + cx + '" cy="' + cx + '" r="' + r + '" stroke="var(--bg-5)" stroke-width="6"/>' +
      '<circle fill="none" cx="' + cx + '" cy="' + cx + '" r="' + r + '" stroke="' + color + '" stroke-width="6" ' +
      'stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + offset.toFixed(1) + '" stroke-linecap="round" style="transition:stroke-dashoffset .7s cubic-bezier(.4,0,.2,1)"/>' +
      '</svg><div class="ring-val" style="color:' + color + '">' + label + '</div>';
  }

  /* ── Insight card ── */
  function insightCard(ins) {
    var S = { success: { border: 'var(--lime)', bg: 'rgba(200,255,0,.05)', title: 'var(--lime)' }, info: { border: 'var(--blue)', bg: 'rgba(78,191,245,.05)', title: 'var(--blue)' }, warning: { border: 'var(--amber)', bg: 'rgba(255,184,61,.05)', title: 'var(--amber)' }, danger: { border: 'var(--red)', bg: 'rgba(255,92,92,.05)', title: 'var(--red)' } };
    var s = S[ins.level] || S.info;
    return '<div class="insight-card" style="border-color:' + s.border + ';background:' + s.bg + '">' +
      '<div class="insight-icon">' + ins.icon + '</div>' +
      '<div><div class="insight-title" style="color:' + s.title + '">' + ins.title + '</div>' +
      '<div class="insight-body">' + ins.body + '</div></div></div>';
  }

  /* ── Section header ── */
  function secHdr(title, extra) { return '<div class="section-header"><span class="t-label">' + title + '</span>' + (extra || '') + '</div>'; }

  /* ── Hero image with skeleton ── */
  function heroImg(imgUrl, content) {
    return '<div class="hero-img-card" id="hi-' + Date.now() + '" style="background-color:var(--bg-3)">' +
      '<div style="position:absolute;inset:0;animation:shimmer 1.4s infinite;background:linear-gradient(90deg,var(--bg-3) 25%,var(--bg-4) 50%,var(--bg-3) 75%);background-size:200% 100%" id="hi-skel-' + Date.now() + '"></div>' +
      '<div class="hero-img-card-content">' + content + '</div>' +
      '</div>' +
      '<script>' +
      '(function(){' +
      'var img=new Image();' +
      'img.onload=function(){' +
      'var cards=document.querySelectorAll(".hero-img-card");' +
      'cards.forEach(function(c){if(!c.style.backgroundImage){c.style.backgroundImage="url(\'"+img.src+"\')"; var sk=c.querySelector("[id^=hi-skel]");if(sk)sk.remove();}});' +
      '};' +
      'img.src="' + imgUrl + '";' +
      '})();' +
      '<\/script>';
  }

  /* ── Simpler hero image (used in screens where we can set after render) ── */
  function setHeroImg(el, url) {
    if (!el) return;
    var img = new Image();
    img.onload = function () {
      el.style.backgroundImage = "url('" + url + "')";
      var skel = el.querySelector('.skeleton');
      if (skel) skel.remove();
    };
    img.src = url;
  }

  /* ── XP row ── */
  function xpRow(profile) {
    var p = profile || TF.Store.getProfile();
    var level = TF.Store.getLevel(p),
      prog = TF.Store.getXPProgress(p),
      toNext = TF.Store.getXPToNext(p);

    var shields = TF.Store.getShields();

    return '<div class="xp-row" id="more-level-card" style="cursor:pointer">' +
      '<div class="xp-level-badge">' + level + '</div>' +
      '<div class="xp-details">' +
        '<div class="xp-top">' +
          '<span class="xp-name">Lv.' + level + ' · ' + TF.Store.getWarriorTitle(level) + '</span>' +
          '<span class="xp-pts t-mono">' + p.xp + ' XP</span>' +
        '</div>' +
        bar(prog, 'var(--lime)') +
        '<div class="t-hint mt-1">' +
          toNext + ' XP to level ' + (level + 1) +
          (shields > 0
            ? ' &nbsp;·&nbsp; <span style="color:var(--blue)">🛡 ' + shields + ' shield' + (shields > 1 ? 's' : '') + '</span>'
            : ''
          ) +
        '</div>' +
      '</div>' +
      '<div class="streak-box">' +
        '<div class="streak-num">' + (p.streakDays || 0) + '</div>' +
        '<div class="streak-label">streak</div>' +
      '</div>' +
    '</div>';
  }

  /* ── Date/time helpers ── */
  function formatDate(ds) { try { return new Date(ds + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }); } catch (e) { return ds; } }
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function dayLabel(ds) { try { return DAYS[new Date(ds + 'T12:00:00').getDay()]; } catch (e) { return ''; } }

  /* ── Toggle init ── */
  function initToggle(root, groupId) {
    root.querySelectorAll('#' + groupId + ' .toggle-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        root.querySelectorAll('#' + groupId + ' .toggle-chip').forEach(function (c) { c.classList.remove('on'); });
        chip.classList.add('on');
      });
    });
  }

  /* ── Input validation ── */
  function validateField(input, rules) {
    var val = parseFloat(input.value);
    var str = (input.value || '').trim();
    var err = '';
    if (rules.required && !str) { err = 'Required.'; }
    else if (rules.min !== undefined && !isNaN(val) && val < rules.min) { err = 'Minimum is ' + rules.min + '.'; }
    else if (rules.max !== undefined && !isNaN(val) && val > rules.max) { err = 'Maximum is ' + rules.max + '.'; }
    else if (rules.minLen && str.length < rules.minLen) { err = 'Too short (min ' + rules.minLen + ' chars).'; }
    else if (rules.maxLen && str.length > rules.maxLen) { err = 'Too long (max ' + rules.maxLen + ' chars).'; }
    else if (rules.integer && val !== Math.floor(val)) { err = 'Must be a whole number.'; }
    var hint = input.closest('.field-group') && input.closest('.field-group').querySelector('.field-error');
    input.classList.toggle('error', !!err);
    if (hint) { hint.textContent = err; }
    return !err;
  }

  /* ── Spinner ── */
  function spinner() { return '<div style="display:flex;justify-content:center;padding:32px"><div class="spinner"></div></div>'; }

  /* ── Rest timer ── */
  var _timerInterval = null, _timerStart = null, _timerDuration = null;
  function startRestTimer(seconds, onDone) {
    if (!seconds || seconds <= 0) return;
    _timerDuration = seconds; _timerStart = Date.now();
    var overlay = document.getElementById('rest-timer-overlay');
    var numEl = document.getElementById('rt-num');
    var barEl = document.getElementById('rt-bar');
    var labelEl = document.getElementById('rt-label');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    clearInterval(_timerInterval);

    // Beep at end via Web Audio
    function beep() {
      try {
        var ctx = new (window.AudioContext || window.webkitAudioContext)();
        var osc = ctx.createOscillator(); var gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 880; osc.type = 'sine';
        gain.gain.setValueAtTime(.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + 0.6);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.6);
      } catch (e) { }
    }

    _timerInterval = setInterval(function () {
      var elapsed = (Date.now() - _timerStart) / 1000;
      var remaining = Math.max(0, seconds - elapsed);
      if (numEl) numEl.textContent = Math.ceil(remaining);
      if (barEl) barEl.style.width = (remaining / seconds * 100) + '%';
      if (labelEl) labelEl.textContent = remaining > 0 ? 'seconds remaining' : 'done!';
      if (barEl) { barEl.style.background = remaining < 10 ? 'var(--red)' : remaining < 30 ? 'var(--amber)' : 'var(--lime)'; }
      if (numEl) { numEl.style.color = remaining < 10 ? 'var(--red)' : remaining < 30 ? 'var(--amber)' : 'var(--lime)'; }
      if (remaining <= 0) {
        clearInterval(_timerInterval);
        beep(); haptic(200);
        if (onDone) onDone();
        setTimeout(function () { overlay.classList.add('hidden'); }, 1500);
      }
    }, 200);
  }
  function stopRestTimer() {
    clearInterval(_timerInterval);
    var overlay = document.getElementById('rest-timer-overlay');
    if (overlay) overlay.classList.add('hidden');
  }

  /* ── Achievement toast ── */
  function achievementToast(achId) {
    var def = TF.Achievements.getDef(achId);
    if (!def) return;
    haptic(100);
    confetti({ particleCount: 60, spread: 50, origin: { y: .7 } });
    toast(def.icon + ' Achievement unlocked: ' + def.name, 'success', 3500);
  }

  /* ── Storage warning ── */
  function checkStorageAndWarn() {
    if (TF.Store.isStorageNearLimit()) {
      toast('⚠ Storage almost full. Export your data in Profile.', null, 5000);
    }
  }

  return {
    haptic: haptic, toast: toast, confetti: confetti, animateScore: animateScore,
    bar: bar, ring: ring, insightCard: insightCard, secHdr: secHdr,
    heroImg: heroImg, setHeroImg: setHeroImg,
    xpRow: xpRow, formatDate: formatDate, dayLabel: dayLabel,
    initToggle: initToggle, validateField: validateField,
    spinner: spinner, startRestTimer: startRestTimer, stopRestTimer: stopRestTimer,
    achievementToast: achievementToast, checkStorageAndWarn: checkStorageAndWarn,
    escapeHTML: escapeHTML, escapeAttr: escapeAttr, renderRichText: renderRichText,
    copyText: copyText, notify: notify,
    modal: modal, closeModal: closeModal, promptAccountRequired: promptAccountRequired,
    buildLevelGuide: buildLevelGuide
  };
})();