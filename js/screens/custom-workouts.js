/* ================================================================
   CUSTOM WORKOUTS v1
   ================================================================ */
TF.Screens['custom-workouts'] = function(root) {
  'use strict';

  var library = TF.Workout.getExerciseLibrary();
  var todayKey = TF.Store.todayKey();
  var SWITCH_UNDO_KEY = 'tf_workout_switch_undo';
  var state = {
    id: null,
    name: '',
    exercises: [],
    picker: library.length ? library[0].name : '',
    search: '',
    dragIndex: null,
    undoDelete: null
  };

  function cloneTemplate(template) {
    return JSON.parse(JSON.stringify(template || {}));
  }

  function saveSwitchUndo(payload) {
    sessionStorage.setItem(SWITCH_UNDO_KEY, JSON.stringify(Object.assign({
      dateKey: todayKey,
      createdAt: new Date().toISOString()
    }, payload || {})));
  }

  function hasWorkoutActivity(day) {
    if (!day) {
      return false;
    }
    if (String(day.notes || '').trim() || String(day.bodyweightKg || '').trim()) {
      return true;
    }
    return Object.keys(day.exercises || {}).some(function(name) {
      return (day.exercises[name] || []).some(function(set) {
        return !!(set.done || set.weight || set.reps || set.rpe);
      });
    });
  }

  function getFilteredLibrary() {
    var query = String(state.search || '').trim().toLowerCase();
    var filtered = !query ? library.slice() : library.filter(function(exercise) {
      return exercise.name.toLowerCase().indexOf(query) >= 0;
        });
    if (!filtered.some(function(exercise) { return exercise.name === state.picker; })) {
      state.picker = filtered.length ? filtered[0].name : '';
    }
    return filtered;
  }

  function moveExercise(fromIndex, toIndex) {
    var moved;
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= state.exercises.length || toIndex >= state.exercises.length) {
      return;
    }
    moved = state.exercises.splice(fromIndex, 1)[0];
    state.exercises.splice(toIndex, 0, moved);
  }

  function loadTemplate(template) {
    state.id = template.id || null;
    state.name = template.name || '';
    state.exercises = (template.exercises || []).map(function(exercise) {
      return {
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        restSeconds: exercise.restSeconds,
        note: exercise.note || '',
        swapGroup: exercise.swapGroup || ''
      };
    });
    state.search = '';
    state.picker = library.length ? library[0].name : '';
  }

  function resetForm() {
    loadTemplate({ id: null, name: '', exercises: [] });
  }

  function saveTemplate() {
    var trimmedName = (state.name || '').trim();
    if (!trimmedName) {
      TF.UI.toast('Give your custom workout a name.', 'error');
      return;
    }
    if (!state.exercises.length) {
      TF.UI.toast('Add at least one exercise to the workout.', 'error');
      return;
    }

    TF.Store.saveCustomWorkout({
      id: state.id,
      name: trimmedName,
      exercises: state.exercises
    });
    state.undoDelete = null;
    TF.UI.haptic(40);
    TF.UI.toast('Custom workout saved.', 'success');
    resetForm();
    render();
  }

  function addExerciseFromPicker() {
    if (!state.picker) {
      return;
    }
    if (state.exercises.some(function(exercise) { return exercise.name === state.picker; })) {
      TF.UI.toast('That exercise is already in this template.', 'error');
      return;
    }
    var definition = TF.Workout.getExerciseDefinition(state.picker);
    state.exercises.push({
      name: definition.name,
      sets: definition.sets,
      reps: definition.reps,
      restSeconds: definition.restSeconds,
      note: definition.note || '',
      swapGroup: definition.swapGroup || ''
    });
    state.search = '';
    render();
  }

  function startTemplate(templateId) {
    var template = TF.Store.getCustomWorkouts().find(function(item) {
      return item.id === templateId;
    });
    var day = TF.Store.getWorkoutDay(todayKey);
    var selected = TF.Store.getWorkoutSelection(todayKey);
    function performStart() {
      saveSwitchUndo({
        message: 'Custom workout "' + template.name + '" loaded for today. Undo is available if you switched by mistake.',
        previousDay: cloneTemplate(day),
        previousSelection: selected
      });
      TF.Store.selectWorkoutForDate(templateId, todayKey);
      TF.Store.saveWorkoutDay({
        date: todayKey,
        exercises: {},
        notes: '',
        bodyweightKg: '',
        sourceType: 'custom',
        workoutId: template.id,
        workoutName: template.name,
        planSnapshot: template.exercises,
        startedAt: new Date().toISOString(),
        finishedAt: null
      }, todayKey);
      TF.UI.toast('Custom workout loaded for today.', 'success');
      TF.Router.navigate('workout');
    }
    if (!template) {
      TF.UI.toast('Template not found.', 'error');
      return;
    }
    if (selected && selected.workoutId === templateId && day.sourceType === 'custom' && day.workoutId === templateId) {
      TF.Router.navigate('workout');
      return;
    }
    if (hasWorkoutActivity(day)) {
      TF.UI.modal({
        icon: 'alert-triangle',
        title: 'Replace today\'s workout?',
        copy: 'Starting "' + template.name + '" will replace today\'s current logged session. You can undo the switch right after.',
        cancelText: 'Keep current',
        confirmText: 'Load custom',
        onConfirm: performStart
      });
      return;
    }
    performStart();
  }

  function renderTemplateList() {
    var templates = TF.Store.getCustomWorkouts();
    var selected = TF.Store.getWorkoutSelection(todayKey);
    if (!templates.length) {
      return '<div class="card card-sm t-hint" style="text-align:center">No custom workouts saved yet. Build one below and start it from here anytime.</div>';
    }
    return templates.map(function(template) {
      var isActive = selected && selected.workoutId === template.id;
      return '<div class="card card-sm custom-template-card">' +
        '<div class="custom-template-head">' +
          '<div>' +
            '<div class="t-title">' + TF.UI.escapeHTML(template.name) + '</div>' +
            '<div class="t-hint">' + template.exercises.length + ' exercises' + (isActive ? ' . Active today' : '') + '</div>' +
          '</div>' +
          (isActive ? '<span class="chip chip-lime">Today</span>' : '') +
        '</div>' +
        '<div class="custom-template-list">' +
          template.exercises.map(function(exercise, index) {
            return '<div class="custom-template-line">' + (index + 1) + '. ' + TF.UI.escapeHTML(exercise.name) + ' - ' + exercise.sets + ' x ' + TF.UI.escapeHTML(exercise.reps) + '</div>';
          }).join('') +
        '</div>' +
        '<div class="session-link-row" style="margin-top:12px">' +
          '<button class="btn btn-primary btn-sm" type="button" data-start-template="' + template.id + '">Start today</button>' +
          '<button class="btn btn-ghost btn-sm" type="button" data-edit-template="' + template.id + '">Edit</button>' +
          '<button class="btn btn-ghost btn-sm" type="button" data-delete-template="' + template.id + '">Delete</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function renderBuilderExercises() {
    if (!state.exercises.length) {
      return '<div class="card card-sm t-hint" style="text-align:center">Add exercises from the library to build your template.</div>';
    }
    return state.exercises.map(function(exercise, index) {
      return '<div class="card card-sm custom-builder-row" draggable="true" data-drag-index="' + index + '" data-drop-index="' + index + '">' +
        '<div class="custom-builder-row-head">' +
          '<div class="custom-builder-title">' +
            '<span class="custom-drag-handle" aria-hidden="true">' + TF.Icon('dots', 11) + '</span>' +
            '<div class="t-title">' + TF.UI.escapeHTML(exercise.name) + '</div>' +
          '</div>' +
          '<div class="session-link-row">' +
            '<button class="btn btn-ghost btn-sm" type="button" data-move-builder-up="' + index + '">' + TF.Icon('chevron-left', 11) + '</button>' +
            '<button class="btn btn-ghost btn-sm" type="button" data-move-builder-down="' + index + '">' + TF.Icon('chevron-right', 11) + '</button>' +
            '<button class="btn btn-ghost btn-sm" type="button" data-remove-builder="' + index + '">' + TF.Icon('trash', 11) + ' Remove</button>' +
          '</div>' +
        '</div>' +
        '<div class="measure-input-grid">' +
          '<div class="field-group">' +
            '<div class="field-label">Sets</div>' +
            '<input class="field" type="number" min="1" max="12" value="' + exercise.sets + '" data-builder-index="' + index + '" data-builder-field="sets">' +
          '</div>' +
          '<div class="field-group">' +
            '<div class="field-label">Reps</div>' +
            '<input class="field" type="text" value="' + TF.UI.escapeAttr(exercise.reps) + '" data-builder-index="' + index + '" data-builder-field="reps">' +
          '</div>' +
          '<div class="field-group">' +
            '<div class="field-label">Rest (sec)</div>' +
            '<input class="field" type="number" min="0" max="600" value="' + exercise.restSeconds + '" data-builder-index="' + index + '" data-builder-field="restSeconds">' +
          '</div>' +
          '<div class="field-group">' +
            '<div class="field-label">Note</div>' +
            '<input class="field" type="text" value="' + TF.UI.escapeAttr(exercise.note || '') + '" data-builder-index="' + index + '" data-builder-field="note">' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function renderUndoDeleteBanner() {
    if (!state.undoDelete) {
      return '';
    }
    return '<div class="card card-sm workout-undo-card" style="margin-bottom:12px">' +
      '<div><div class="t-title">Template deleted</div><div class="t-hint">' + TF.UI.escapeHTML(state.undoDelete.template.name) + ' can be restored.</div></div>' +
      '<div class="session-link-row">' +
        '<button class="btn btn-ghost btn-sm" id="btn-undo-delete-template" type="button">Undo</button>' +
        '<button class="btn btn-ghost btn-sm" id="btn-dismiss-delete-template" type="button">Dismiss</button>' +
      '</div>' +
    '</div>';
  }

  function render() {
    var filteredLibrary = getFilteredLibrary();
    root.innerHTML = '<div class="screen">' +
      '<div class="t-headline" style="margin-bottom:4px">' + TF.Icon('dumbbell', 20) + ' Custom Workouts</div>' +
      '<div class="t-hint" style="margin-bottom:18px">Build your own templates from the exercise library, set your own sets/reps/rest, and load one into today\'s training session.</div>' +
      renderUndoDeleteBanner() +

      '<div class="section">' +
        TF.UI.secHdr('Saved Templates') +
        renderTemplateList() +
      '</div>' +

      '<div class="section">' +
        TF.UI.secHdr(state.id ? 'Edit Template' : 'Build New Template') +
        '<div class="card" style="margin-bottom:12px">' +
          '<div class="field-group" style="margin-bottom:12px">' +
            '<div class="field-label">Workout name</div>' +
            '<input id="builder-name" class="field" type="text" placeholder="My Monday Push" value="' + TF.UI.escapeAttr(state.name || '') + '">' +
          '</div>' +
          '<div class="field-group">' +
            '<div class="field-label">Search exercise library</div>' +
            '<input id="builder-search" class="field" type="text" placeholder="Search bench, row, squat..." value="' + TF.UI.escapeAttr(state.search || '') + '">' +
          '</div>' +
          '<div class="field-group">' +
            '<div class="field-label">Exercise library</div>' +
            '<div class="session-inline-field">' +
              '<select id="builder-picker" class="field session-compact-input">' +
                filteredLibrary.map(function(exercise) {
                  return '<option value="' + TF.UI.escapeAttr(exercise.name) + '"' + (state.picker === exercise.name ? ' selected' : '') + '>' + TF.UI.escapeHTML(exercise.name) + '</option>';
                }).join('') +
              '</select>' +
              '<button class="btn btn-primary btn-sm" id="btn-add-builder-exercise" type="button">Add exercise</button>' +
            '</div>' +
            (!filteredLibrary.length ? '<div class="field-hint">No exercises matched that search.</div>' : '') +
          '</div>' +
        '</div>' +

        renderBuilderExercises() +

        '<div class="session-link-row" style="margin-top:12px">' +
          '<button class="btn btn-primary" id="btn-save-template" type="button">' + TF.Icon('save', 13) + ' Save template</button>' +
          '<button class="btn btn-secondary" id="btn-reset-template" type="button">Reset</button>' +
        '</div>' +
      '</div>' +
      '<div style="height:8px"></div>' +
    '</div>';

    bindEvents();
  }

  function bindEvents() {
    var nameEl = root.querySelector('#builder-name');
    if (nameEl) {
      nameEl.addEventListener('input', function() {
        state.name = nameEl.value;
      });
    }

    var searchEl = root.querySelector('#builder-search');
    if (searchEl) {
      searchEl.addEventListener('input', function() {
        state.search = searchEl.value;
        render();
      });
    }

    var pickerEl = root.querySelector('#builder-picker');
    if (pickerEl) {
      pickerEl.addEventListener('change', function() {
        state.picker = pickerEl.value;
      });
    }

    var addExerciseBtn = root.querySelector('#btn-add-builder-exercise');
    if (addExerciseBtn) {
      addExerciseBtn.addEventListener('click', addExerciseFromPicker);
    }

    var saveBtn = root.querySelector('#btn-save-template');
    if (saveBtn) {
      saveBtn.addEventListener('click', saveTemplate);
    }

    var resetBtn = root.querySelector('#btn-reset-template');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        resetForm();
        render();
      });
    }

    root.querySelectorAll('[data-builder-index]').forEach(function(inputEl) {
      inputEl.addEventListener('change', function() {
        var index = parseInt(inputEl.dataset.builderIndex, 10);
        var field = inputEl.dataset.builderField;
        if (!state.exercises[index]) {
          return;
        }
        if (field === 'sets' || field === 'restSeconds') {
          state.exercises[index][field] = Math.max(field === 'sets' ? 1 : 0, parseInt(inputEl.value, 10) || 0);
        } else {
          state.exercises[index][field] = inputEl.value;
        }
      });
    });

    root.querySelectorAll('[data-remove-builder]').forEach(function(button) {
      button.addEventListener('click', function() {
        state.exercises.splice(parseInt(button.dataset.removeBuilder, 10), 1);
        render();
      });
    });

    root.querySelectorAll('[data-move-builder-up]').forEach(function(button) {
      button.addEventListener('click', function() {
        moveExercise(parseInt(button.dataset.moveBuilderUp, 10), Math.max(0, parseInt(button.dataset.moveBuilderUp, 10) - 1));
        render();
      });
    });

    root.querySelectorAll('[data-move-builder-down]').forEach(function(button) {
      button.addEventListener('click', function() {
        var index = parseInt(button.dataset.moveBuilderDown, 10);
        moveExercise(index, Math.min(state.exercises.length - 1, index + 1));
        render();
      });
    });

    root.querySelectorAll('[data-drag-index]').forEach(function(row) {
      row.addEventListener('dragstart', function() {
        state.dragIndex = parseInt(row.dataset.dragIndex, 10);
      });
      row.addEventListener('dragover', function(event) {
        event.preventDefault();
      });
      row.addEventListener('drop', function(event) {
        var dropIndex;
        event.preventDefault();
        dropIndex = parseInt(row.dataset.dropIndex, 10);
        if (isFinite(state.dragIndex) && isFinite(dropIndex)) {
          moveExercise(state.dragIndex, dropIndex);
          state.dragIndex = null;
          render();
        }
      });
      row.addEventListener('dragend', function() {
        state.dragIndex = null;
      });
    });

    root.querySelectorAll('[data-start-template]').forEach(function(button) {
      button.addEventListener('click', function() {
        startTemplate(button.dataset.startTemplate);
      });
    });

    root.querySelectorAll('[data-edit-template]').forEach(function(button) {
      button.addEventListener('click', function() {
        var template = TF.Store.getCustomWorkouts().find(function(item) {
          return item.id === button.dataset.editTemplate;
        });
        if (!template) {
          return;
        }
        loadTemplate(template);
        render();
      });
    });

    root.querySelectorAll('[data-delete-template]').forEach(function(button) {
      button.addEventListener('click', function() {
        var template = TF.Store.getCustomWorkouts().find(function(item) {
          return item.id === button.dataset.deleteTemplate;
        });
        if (!template) {
          return;
        }
        TF.UI.modal({
          icon: 'trash',
          title: 'Delete template?',
          copy: 'Delete "' + template.name + '" from your saved workouts?',
          cancelText: 'Keep it',
          confirmText: 'Delete',
          onConfirm: function() {
            var wasActive = TF.Store.getWorkoutSelection(todayKey);
            TF.Store.deleteCustomWorkout(template.id);
            if (state.id === template.id) {
              resetForm();
            }
            state.undoDelete = {
              template: cloneTemplate(template),
              previousSelection: wasActive && wasActive.workoutId === template.id ? wasActive : null
            };
            TF.UI.toast('Template deleted.', 'success');
            render();
          }
        });
      });
    });

    var undoDeleteBtn = root.querySelector('#btn-undo-delete-template');
    if (undoDeleteBtn) {
      undoDeleteBtn.addEventListener('click', function() {
        var restored;
        if (!state.undoDelete) {
          return;
        }
        restored = TF.Store.saveCustomWorkout(state.undoDelete.template);
        if (state.undoDelete.previousSelection && state.undoDelete.previousSelection.workoutId === restored.id) {
          TF.Store.selectWorkoutForDate(restored.id, todayKey);
        }
        state.undoDelete = null;
        TF.UI.toast('Template restored.', 'success');
        render();
      });
    }

    var dismissDeleteBtn = root.querySelector('#btn-dismiss-delete-template');
    if (dismissDeleteBtn) {
      dismissDeleteBtn.addEventListener('click', function() {
        state.undoDelete = null;
        render();
      });
    }
  }

  resetForm();
  render();
};
