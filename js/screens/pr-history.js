/* ================================================================
   PR HISTORY SCREEN v5.8 — All PRs by exercise, filterable by split
   Data from localStorage — no new store
   ================================================================ */
TF.Screens['pr-history'] = function (root) {
  'use strict';

  /* ── Exercise → split mapping (Pull/Push/Legs/Other) ── */
  var SPLIT_MAP = (function () {
    var push = [
      'bench press','incline bench press','close-grip bench press','db bench press','incline db press',
      'overhead press','seated db shoulder press','arnold press','machine chest press','db shoulder press',
      'db incline press','cable fly','weighted dips','skull crushers','overhead rope extension',
      'tricep pushdown','tricep extension','db tricep extension','lean-away raise','lateral raises',
      'db lateral raise','front raise','chest fly','pec deck','machine fly','push-up','dip',
      'incline chest press','push press'
    ];
    var pull = [
      'deadlift','rack pull','trap bar deadlift','barbell row','chest-supported row','lat pulldown',
      'neutral-grip pulldown','one-arm cable row','weighted pull-ups','pull-up','pullup','chin-up',
      'chinup','face pulls','cable face pull','rear delt fly','hammer curl','ez-bar curl',
      'incline db curl','barbell curl','preacher curl','cable curl','db curl','row','pendlay row',
      't-bar row','seated cable row','single-arm row','inverted row','chest-supported db row',
      'cable row','pull down','hyperextension','back extension','superman row'
    ];
    var legs = [
      'back squat','front squat','hack squat','goblet squat','belt squat','pause squat',
      'romanian deadlift','rdl','good morning','barbell hip thrust','hip thrust',
      'leg press','walking lunge','bulgarian split squat','split squat','lunge',
      'leg curl','lying leg curl','seated leg curl','leg extension','calf raises',
      'seated calf raise','standing calf raise','step-up','glute bridge','sumo deadlift',
      'smith machine squat','box squat','sissy squat','nordic curl','glute ham raise'
    ];
    return function (name) {
      var n = (name || '').toLowerCase();
      if (push.some(function (k) { return n.includes(k); })) return 'push';
      if (pull.some(function (k) { return n.includes(k); })) return 'pull';
      if (legs.some(function (k) { return n.includes(k); })) return 'legs';
      return 'other';
    };
  })();

  var state = { filter: 'all' };

  function getPRList() {
    var prs = TF.Store.getPRs ? TF.Store.getPRs() : {};
    return Object.keys(prs).sort().map(function (name) {
      var pr = prs[name];
      return {
        name: name,
        weight: pr.weight,
        reps: pr.reps,
        date: pr.date,
        est1RM: pr.est1RM,
        split: SPLIT_MAP(name)
      };
    });
  }

  function formatDate(key) {
    if (!key) return '—';
    try {
      var d = new Date(key + 'T12:00:00');
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) { return key; }
  }

  function splitColor(split) {
    if (split === 'push') return 'var(--blue)';
    if (split === 'pull') return 'var(--amber)';
    if (split === 'legs') return 'var(--lime)';
    return 'var(--txt-3)';
  }

  function splitBg(split) {
    if (split === 'push') return 'var(--blue-dim)';
    if (split === 'pull') return 'var(--amber-dim)';
    if (split === 'legs') return 'var(--lime-dim)';
    return 'var(--bg-3)';
  }

  function renderList() {
    var listEl = root.querySelector('#pr-list');
    if (!listEl) return;

    var all = getPRList();
    var filtered = state.filter === 'all'
      ? all
      : all.filter(function (pr) { return pr.split === state.filter; });

    if (!filtered.length) {
      listEl.innerHTML = '<div style="padding:32px;text-align:center;color:var(--txt-3)">' +
        '<div style="font-size:32px;margin-bottom:8px">🏆</div>' +
        '<div style="font-weight:600;margin-bottom:6px">No PRs logged yet</div>' +
        '<div style="font-size:12px">Complete workouts and mark sets as done<br>to automatically track personal records.</div>' +
      '</div>';
      return;
    }

    listEl.innerHTML = filtered.map(function (pr) {
      var col = splitColor(pr.split);
      var bg  = splitBg(pr.split);
      var splitLabel = pr.split.charAt(0).toUpperCase() + pr.split.slice(1);
      return '<div class="card card-sm" style="margin-bottom:10px;display:flex;align-items:center;gap:12px">' +
        '<div style="width:40px;height:40px;border-radius:10px;background:' + bg + ';border:1px solid ' + col + '55;display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
          '<span style="font-size:18px">🏆</span>' +
        '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-weight:700;font-size:14px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + TF.UI.escapeHTML(pr.name) + '</div>' +
          '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
            '<span style="font-family:var(--font-m);font-size:13px;color:var(--lime);font-weight:700">' + (pr.weight || '—') + ' kg × ' + (pr.reps || '—') + '</span>' +
            '<span class="t-hint">' + formatDate(pr.date) + '</span>' +
          '</div>' +
          (pr.est1RM ? '<div class="t-hint" style="margin-top:2px">Est. 1RM: <span style="color:var(--txt-1);font-weight:600">' + Math.round(pr.est1RM) + ' kg</span></div>' : '') +
        '</div>' +
        '<div style="padding:4px 8px;border-radius:20px;background:' + bg + ';border:1px solid ' + col + '44;font-size:10px;font-weight:700;color:' + col + ';text-transform:uppercase;letter-spacing:.5px;flex-shrink:0">' +
          splitLabel +
        '</div>' +
      '</div>';
    }).join('');
  }

  function render() {
    var all = getPRList();
    var pushCount  = all.filter(function (p) { return p.split === 'push'; }).length;
    var pullCount  = all.filter(function (p) { return p.split === 'pull'; }).length;
    var legsCount  = all.filter(function (p) { return p.split === 'legs'; }).length;

    root.innerHTML = '<div class="screen">' +

      '<div class="t-headline" style="margin-bottom:4px">PR History</div>' +
      '<div class="t-hint" style="margin-bottom:16px">' + all.length + ' personal record' + (all.length !== 1 ? 's' : '') + ' across all exercises</div>' +

      /* Summary stats */
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">' +
        '<div class="card card-sm" style="text-align:center;border-color:var(--blue)44">' +
          '<div style="font-family:var(--font-d);font-size:22px;font-weight:900;color:var(--blue)">' + pushCount + '</div>' +
          '<div class="t-hint" style="font-size:10px;text-transform:uppercase;letter-spacing:.5px">Push</div>' +
        '</div>' +
        '<div class="card card-sm" style="text-align:center;border-color:var(--amber)44">' +
          '<div style="font-family:var(--font-d);font-size:22px;font-weight:900;color:var(--amber)">' + pullCount + '</div>' +
          '<div class="t-hint" style="font-size:10px;text-transform:uppercase;letter-spacing:.5px">Pull</div>' +
        '</div>' +
        '<div class="card card-sm" style="text-align:center;border-color:var(--lime)44">' +
          '<div style="font-family:var(--font-d);font-size:22px;font-weight:900;color:var(--lime)">' + legsCount + '</div>' +
          '<div class="t-hint" style="font-size:10px;text-transform:uppercase;letter-spacing:.5px">Legs</div>' +
        '</div>' +
      '</div>' +

      /* Filter chips */
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px" id="pr-filters">' +
        [
          { key: 'all',  label: 'All', n: all.length },
          { key: 'push', label: 'Push', n: pushCount },
          { key: 'pull', label: 'Pull', n: pullCount },
          { key: 'legs', label: 'Legs', n: legsCount }
        ].map(function (f) {
          var active = state.filter === f.key;
          return '<button class="toggle-chip' + (active ? ' on' : '') + '" data-filter="' + f.key + '" type="button" style="width:auto;padding:6px 14px">' +
            f.label + ' <span style="opacity:.6">(' + f.n + ')</span>' +
          '</button>';
        }).join('') +
      '</div>' +

      /* PR list */
      '<div id="pr-list"></div>' +

      '<div style="height:8px"></div>' +
    '</div>';

    renderList();

    root.querySelectorAll('#pr-filters .toggle-chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        root.querySelectorAll('#pr-filters .toggle-chip').forEach(function (b) { b.classList.remove('on'); });
        btn.classList.add('on');
        state.filter = btn.dataset.filter;
        renderList();
      });
    });
  }

  render();
};
