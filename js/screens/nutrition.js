TF.Screens.nutrition = function(root) {
  'use strict';

  var MEALS = [
    { name: 'Chicken breast + jasmine rice + broccoli', macros: '~680 kcal | 58g protein | 12g fat', tag: 'BULK', cls: 'chip-lime' },
    { name: 'Greek yogurt + oats + berries + honey', macros: '~450 kcal | 32g protein | 6g fat', tag: 'QUICK', cls: 'chip-blue' },
    { name: '3 eggs + 2 whites + avocado toast', macros: '~510 kcal | 26g protein | 24g fat', tag: 'QUICK', cls: 'chip-blue' },
    { name: 'Tuna + whole-wheat pasta + olive oil', macros: '~590 kcal | 46g protein | 14g fat', tag: 'CHEAP', cls: 'chip-amber' },
    { name: '90% lean beef + sweet potato mash', macros: '~660 kcal | 52g protein | 18g fat', tag: 'BULK', cls: 'chip-lime' },
    { name: 'Cottage cheese + berries + walnuts', macros: '~390 kcal | 34g protein | 12g fat', tag: 'QUICK', cls: 'chip-blue' },
    { name: 'Sardines + rice cakes + avocado', macros: '~360 kcal | 30g protein | 18g fat', tag: 'CHEAP', cls: 'chip-amber' },
    { name: 'Whey shake + banana + peanut butter', macros: '~490 kcal | 42g protein | 16g fat', tag: 'QUICK', cls: 'chip-blue' },
    { name: 'Atlantic salmon + quinoa + spinach', macros: '~580 kcal | 49g protein | 22g fat', tag: 'BULK', cls: 'chip-lime' },
    { name: 'Turkey mince stir fry + basmati rice', macros: '~560 kcal | 44g protein | 10g fat', tag: 'CHEAP', cls: 'chip-amber' },
    { name: 'Lentil soup + whole-grain bread + olive oil', macros: '~520 kcal | 26g protein | 12g fat', tag: 'CHEAP', cls: 'chip-amber' },
    { name: 'Sirloin steak + roasted veg', macros: '~620 kcal | 56g protein | 26g fat', tag: 'BULK', cls: 'chip-lime' }
  ];

  var FALLBACK_FOODS = [
    { name: 'Chicken Breast', brand: 'Fallback library', servingText: '100 g', servingGrams: 100, quantity: '', image: '', macros: { kcal: 165, protein: 31, carbs: 0, fat: 3.6 } },
    { name: 'Cooked White Rice', brand: 'Fallback library', servingText: '100 g', servingGrams: 100, quantity: '', image: '', macros: { kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 } },
    { name: 'Oats', brand: 'Fallback library', servingText: '100 g', servingGrams: 100, quantity: '', image: '', macros: { kcal: 389, protein: 16.9, carbs: 66.3, fat: 6.9 } },
    { name: 'Greek Yogurt', brand: 'Fallback library', servingText: '170 g', servingGrams: 170, quantity: '', image: '', macros: { kcal: 59, protein: 10, carbs: 3.6, fat: 0.4 } },
    { name: 'Whole Milk', brand: 'Fallback library', servingText: '250 g', servingGrams: 250, quantity: '', image: '', macros: { kcal: 61, protein: 3.2, carbs: 4.8, fat: 3.3 } },
    { name: 'Eggs', brand: 'Fallback library', servingText: '100 g', servingGrams: 100, quantity: '', image: '', macros: { kcal: 143, protein: 12.6, carbs: 0.7, fat: 9.5 } },
    { name: 'Banana', brand: 'Fallback library', servingText: '118 g', servingGrams: 118, quantity: '', image: '', macros: { kcal: 89, protein: 1.1, carbs: 22.8, fat: 0.3 } },
    { name: 'Peanut Butter', brand: 'Fallback library', servingText: '32 g', servingGrams: 32, quantity: '', image: '', macros: { kcal: 588, protein: 25, carbs: 20, fat: 50 } },
    { name: 'Whey Protein', brand: 'Fallback library', servingText: '30 g', servingGrams: 30, quantity: '', image: '', macros: { kcal: 400, protein: 80, carbs: 8, fat: 7 } },
    { name: 'Atlantic Salmon', brand: 'Fallback library', servingText: '100 g', servingGrams: 100, quantity: '', image: '', macros: { kcal: 208, protein: 20, carbs: 0, fat: 13 } },
    { name: 'Ground Beef 90%', brand: 'Fallback library', servingText: '100 g', servingGrams: 100, quantity: '', image: '', macros: { kcal: 176, protein: 20, carbs: 0, fat: 10 } },
    { name: 'Avocado', brand: 'Fallback library', servingText: '100 g', servingGrams: 100, quantity: '', image: '', macros: { kcal: 160, protein: 2, carbs: 8.5, fat: 14.7 } }
  ];

  var _searchToken = 0;
  var _searchDebounce = null;

  function currentNutrition() {
    var logged = Object.assign({
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      searchAdds: 0
    }, TF.Store.getTodayNutrition());
    delete logged.water;
    return logged;
  }

  function roundMetric(value) {
    return Math.round((parseFloat(value) || 0) * 10) / 10;
  }

  function parseServingGrams(serving) {
    var match;
    if (!serving) {
      return null;
    }
    match = String(serving).match(/(\d+(?:[.,]\d+)?)\s*g/i);
    return match ? parseFloat(match[1].replace(',', '.')) : null;
  }

  function nutrientValue(nutriments, baseKey, servingGrams) {
    var direct = nutriments[baseKey + '_100g'];
    var serving = nutriments[baseKey + '_serving'];
    var generic = nutriments[baseKey + '_value'];
    if (direct != null && direct !== '') {
      return roundMetric(direct);
    }
    if (serving != null && serving !== '' && servingGrams) {
      return roundMetric((parseFloat(serving) || 0) * (100 / servingGrams));
    }
    if (generic != null && generic !== '') {
      return roundMetric(generic);
    }
    return 0;
  }

  function productToMacros(product) {
    var nutriments = product.nutriments || {};
    var servingGrams = parseServingGrams(product.serving_size);
    return {
      kcal: nutrientValue(nutriments, 'energy-kcal', servingGrams),
      protein: nutrientValue(nutriments, 'proteins', servingGrams),
      fat: nutrientValue(nutriments, 'fat', servingGrams),
      carbs: nutrientValue(nutriments, 'carbohydrates', servingGrams)
    };
  }

  function computePortion(macrosPer100, grams) {
    var ratio = (parseFloat(grams) || 0) / 100;
    return {
      grams: Math.round((parseFloat(grams) || 0) * 10) / 10,
      calories: Math.round((macrosPer100.kcal || 0) * ratio),
      protein: Math.round((macrosPer100.protein || 0) * ratio),
      fat: Math.round((macrosPer100.fat || 0) * ratio),
      carbs: Math.round((macrosPer100.carbs || 0) * ratio)
    };
  }

  function addFood(productName, portion) {
    var cur = currentNutrition();
    TF.Store.saveTodayNutrition({
      calories: cur.calories + portion.calories,
      protein: cur.protein + portion.protein,
      fat: cur.fat + portion.fat,
      carbs: cur.carbs + portion.carbs,
      searchAdds: (cur.searchAdds || 0) + 1
    });
    TF.UI.haptic(40);
    TF.UI.toast('Added ' + portion.grams + 'g of ' + productName + ' (' + portion.calories + ' kcal)', 'success');
    var unlocked = TF.Achievements.check({ type: 'nutrition' });
    unlocked.forEach(function(id, index) {
      setTimeout(function() { TF.UI.achievementToast(id); }, 700 + index * 260);
    });
    refreshSummary();
    syncManualPlaceholders();
  }

  function searchFallbackFoods(query) {
    var q = String(query || '').trim().toLowerCase();
    return FALLBACK_FOODS.filter(function(item) {
      return item.name.toLowerCase().indexOf(q) !== -1 || item.brand.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 8);
  }

  function drawResults(resEl, results, query, sourceLabel) {
    if (!resEl) {
      return;
    }
    if (!results.length) {
      resEl.innerHTML = '<div class="food-search-empty">No Open Food Facts matches for "' + TF.UI.escapeHTML(query) + '". Try a simpler term.</div>';
      return;
    }

    resEl.innerHTML =
      '<div class="food-results food-results-grid">' +
      (sourceLabel ? '<div class="food-search-source">' + TF.UI.escapeHTML(sourceLabel) + '</div>' : '') +
      results.map(function(item, index) {
        var portion100 = computePortion(item.macros, 100);
        return (
          '<div class="food-result-item food-result-card" data-food-index="' + index + '">' +
            '<div class="food-result-head">' +
              (item.image ? '<img class="food-result-thumb" src="' + TF.UI.escapeAttr(item.image) + '" alt="">' : '<div class="food-result-thumb food-result-thumb-empty">' + TF.Icon('search', 16) + '</div>') +
              '<div style="flex:1;min-width:0">' +
                '<div class="food-result-name">' + TF.UI.escapeHTML(item.name) + '</div>' +
                '<div class="food-result-meta">' + TF.UI.escapeHTML(item.brand || 'Open Food Facts result') + '</div>' +
                '<div class="food-result-macros">Per 100g: ' + portion100.calories + ' kcal | ' + portion100.protein + 'P | ' + portion100.carbs + 'C | ' + portion100.fat + 'F</div>' +
              '</div>' +
            '</div>' +
            '<div class="food-portion-row">' +
              '<div class="food-portion-chip">' + (item.servingText ? 'Serving: ' + TF.UI.escapeHTML(item.servingText) : 'Serving not listed') + '</div>' +
              (item.quantity ? '<div class="food-portion-chip">Pack: ' + TF.UI.escapeHTML(item.quantity) + '</div>' : '') +
            '</div>' +
            '<div class="food-portion-controls">' +
              '<label class="food-grams-label">Grams</label>' +
              '<input class="field food-grams-input" type="number" value="' + (item.servingGrams || 100) + '" min="1" max="2000" inputmode="decimal">' +
              '<button class="btn btn-ghost btn-sm" type="button" data-food-quick="100">+100g</button>' +
              (item.servingGrams ? '<button class="btn btn-ghost btn-sm" type="button" data-food-quick="serving">+serving</button>' : '') +
            '</div>' +
            '<div class="food-portion-preview" data-food-preview="' + index + '">' +
              renderPortionPreview(computePortion(item.macros, item.servingGrams || 100)) +
            '</div>' +
            '<button class="btn btn-primary" type="button" data-food-add="' + index + '">' + TF.Icon('plus', 12) + ' Add to today</button>' +
          '</div>'
        );
      }).join('') +
      '</div>';

    resEl.querySelectorAll('[data-food-index]').forEach(function(card) {
      var index = parseInt(card.getAttribute('data-food-index'), 10);
      var item = results[index];
      var gramsInput = card.querySelector('.food-grams-input');
      var preview = card.querySelector('[data-food-preview]');
      var updatePreview = function(nextGrams) {
        preview.innerHTML = renderPortionPreview(computePortion(item.macros, nextGrams));
      };

      if (gramsInput) {
        gramsInput.addEventListener('input', function() {
          updatePreview(Math.max(1, parseFloat(gramsInput.value) || 0));
        });
      }

      card.querySelectorAll('[data-food-quick]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var current = Math.max(0, parseFloat(gramsInput.value) || 0);
          if (btn.getAttribute('data-food-quick') === 'serving' && item.servingGrams) {
            gramsInput.value = current + item.servingGrams;
          } else {
            gramsInput.value = current + 100;
          }
          updatePreview(parseFloat(gramsInput.value) || 100);
        });
      });

      card.querySelector('[data-food-add]').addEventListener('click', function() {
        var grams = Math.max(1, parseFloat(gramsInput.value) || 0);
        addFood(item.name, computePortion(item.macros, grams));
      });
    });
  }

  function renderPortionPreview(portion) {
    return (
      '<div class="finish-summary-inline">' +
        '<div class="finish-summary-pill"><span class="finish-summary-label">Calories</span><strong>' + portion.calories + '</strong></div>' +
        '<div class="finish-summary-pill"><span class="finish-summary-label">Protein</span><strong>' + portion.protein + 'g</strong></div>' +
        '<div class="finish-summary-pill"><span class="finish-summary-label">Carbs / Fat</span><strong>' + portion.carbs + 'g / ' + portion.fat + 'g</strong></div>' +
      '</div>'
    );
  }

  function runSearch(query, resEl) {
    var url;
    var token = ++_searchToken;
    if (!resEl) {
      return;
    }
    if (!query || query.length < 3) {
      resEl.innerHTML = '<div class="food-search-empty">Enter at least 3 letters to search the Open Food Facts database.</div>';
      return;
    }

    resEl.innerHTML = TF.UI.spinner();
    url = TF.Config.FoodAPI +
      '?search_terms=' + encodeURIComponent(query) +
      '&search_simple=1&action=process&json=1&page_size=8&nocache=1' +
      '&fields=product_name,brands,image_front_small_url,quantity,serving_size,nutriments';

    fetch(url)
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        var products;
        if (token !== _searchToken) {
          return;
        }
        products = (data.products || []).map(function(product) {
          var name = String(product.product_name || '').trim();
          var macros = productToMacros(product);
          if (!name) {
            return null;
          }
          if (!(macros.kcal || macros.protein || macros.fat || macros.carbs)) {
            return null;
          }
          return {
            name: name.length > 64 ? name.slice(0, 64) + '...' : name,
            brand: String(product.brands || '').split(',')[0].trim(),
            image: product.image_front_small_url || '',
            quantity: product.quantity || '',
            servingText: product.serving_size || '',
            servingGrams: parseServingGrams(product.serving_size),
            macros: macros
          };
        }).filter(Boolean).slice(0, 8);
        if (!products.length) {
          products = searchFallbackFoods(query);
          drawResults(resEl, products, query, products.length ? 'Fallback library used because no API nutrition matches were returned.' : '');
          return;
        }
        drawResults(resEl, products, query, 'Source: Open Food Facts');
      })
      .catch(function() {
        if (token !== _searchToken) {
          return;
        }
        drawResults(resEl, searchFallbackFoods(query), query, 'Open Food Facts is unavailable right now, so fallback foods are shown.');
      });
  }

  function buildSearchCard() {
    return (
      '<div class="card" style="margin-bottom:14px">' +
        '<div class="flex-between" style="align-items:flex-start;gap:10px;margin-bottom:12px">' +
          '<div>' +
            '<div class="t-title" style="margin-bottom:4px">' + TF.Icon('search', 14) + ' Food Search</div>' +
            '<div class="field-hint">Powered by Open Food Facts. If their search is down, the app falls back to common foods.</div>' +
          '</div>' +
          '<span class="chip chip-blue">LIVE DB</span>' +
        '</div>' +
        '<div class="food-search-action-row">' +
          '<div class="food-search-wrap">' +
            '<input class="food-search-input" id="food-search" type="text" placeholder="Search product name or brand..." autocomplete="off">' +
            '<div class="food-search-icon">' + TF.Icon('search', 15) + '</div>' +
          '</div>' +
          '<button class="btn btn-primary" id="btn-food-search" type="button" style="display:none">' + TF.Icon('search', 13) + ' Search</button>' +
        '</div>' +
        '<div class="field-hint" style="margin-top:8px">Best for packaged foods, drinks, dairy, snacks, and branded products.</div>' +
        '<div id="food-results"></div>' +
      '</div>'
    );
  }

  function getTargets(profile) {
    var fatTarget = Math.max(40, Math.round(profile.bodyWeightKg * 0.9));
    var carbTarget = Math.round((profile.targetCalories - (profile.targetProtein * 4) - (fatTarget * 9)) / 4);
    return {
      fatTarget: fatTarget,
      carbTarget: Math.max(carbTarget, 50)
    };
  }

  function buildMacroGrid(profile, logged) {
    var targets = getTargets(profile);
    var calPct = profile.targetCalories ? logged.calories / profile.targetCalories : 0;
    var protPct = profile.targetProtein ? logged.protein / profile.targetProtein : 0;
    var fatPct = targets.fatTarget > 0 ? (logged.fat || 0) / targets.fatTarget : 0;
    var carbPct = targets.carbTarget > 0 ? (logged.carbs || 0) / targets.carbTarget : 0;

    return '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:18px">' +
      '<div class="macro-tile"><div class="ring-wrap">' + TF.UI.ring(calPct, 'var(--lime)', logged.calories > 0 ? Math.round(calPct * 100) + '%' : '--') + '</div><div class="macro-name">Cal</div><div class="macro-target">' + logged.calories + '/' + profile.targetCalories + '</div></div>' +
      '<div class="macro-tile"><div class="ring-wrap">' + TF.UI.ring(protPct, 'var(--blue)', logged.protein > 0 ? logged.protein + 'g' : '--') + '</div><div class="macro-name">Protein</div><div class="macro-target">' + logged.protein + '/' + profile.targetProtein + 'g</div></div>' +
      '<div class="macro-tile"><div class="ring-wrap">' + TF.UI.ring(fatPct, 'var(--amber)', logged.fat > 0 ? logged.fat + 'g' : '--') + '</div><div class="macro-name">Fat</div><div class="macro-target">' + logged.fat + '/' + targets.fatTarget + 'g</div></div>' +
      '<div class="macro-tile"><div class="ring-wrap">' + TF.UI.ring(carbPct, 'var(--purple)', logged.carbs > 0 ? logged.carbs + 'g' : '--') + '</div><div class="macro-name">Carbs</div><div class="macro-target">' + logged.carbs + '/' + targets.carbTarget + 'g</div></div>' +
    '</div>';
  }

  function buildStarterGuide(logged) {
    var hasData = logged.calories || logged.protein || logged.fat || logged.carbs || logged.searchAdds;
    if (hasData) {
      return '';
    }
    return '<div class="starter-guide">' +
      '<div class="starter-guide-kicker">FIRST FUEL LOG</div>' +
      '<div class="starter-guide-title">Start with one protein-focused entry</div>' +
      '<div class="starter-guide-copy">Search for one food you actually ate today or enter a quick manual log. Once the first meal is in, the macro rings start telling a much better story.</div>' +
      '<div class="starter-guide-list">' +
        '<div class="starter-guide-step"><div class="starter-guide-num">1</div><div><strong>Search a food</strong> if it has a label or brand.</div></div>' +
        '<div class="starter-guide-step"><div class="starter-guide-num">2</div><div><strong>Use manual log</strong> when you just want quick daily totals.</div></div>' +
        '<div class="starter-guide-step"><div class="starter-guide-num">3</div><div><strong>Hit protein first</strong> and let calories/carbs follow.</div></div>' +
      '</div>' +
    '</div>';
  }

  function renderSummary() {
    var profile = TF.Store.getProfile();
    var logged = currentNutrition();
    return buildMacroGrid(profile, logged) + buildStarterGuide(logged);
  }

  function refreshSummary() {
    var summary = root.querySelector('#nu-summary');
    if (summary) {
      summary.innerHTML = renderSummary();
    }
  }

  function syncManualPlaceholders() {
    var logged = currentNutrition();
    var placeholders = {
      '#in-cal': logged.calories || 0,
      '#in-prot': logged.protein || 0,
      '#in-fat': logged.fat || 0,
      '#in-carb': logged.carbs || 0
    };
    Object.keys(placeholders).forEach(function(selector) {
      var el = root.querySelector(selector);
      if (el) {
        el.placeholder = String(placeholders[selector]);
      }
    });
  }

  function clearManualInputs() {
    ['#in-cal', '#in-prot', '#in-fat', '#in-carb'].forEach(function(selector) {
      var el = root.querySelector(selector);
      if (el) {
        el.value = '';
      }
    });
  }

  function draw() {
    var profile = TF.Store.getProfile();
    var logged = currentNutrition();
    var targets = getTargets(profile);

    root.innerHTML =
      '<div class="screen">' +
        '<div class="hero-img-card" id="nu-hero">' +
          '<div class="skeleton" style="position:absolute;inset:0;border-radius:var(--r-lg)"></div>' +
          '<div class="hero-img-card-content">' +
            '<div class="t-label">DAILY FUEL</div>' +
            '<div class="t-headline">Track your fuel.<br>Build the physique.</div>' +
          '</div>' +
        '</div>' +

        '<div id="nu-summary">' + renderSummary() + '</div>' +

        buildSearchCard() +

        '<div class="card" style="margin-bottom:14px">' +
          '<div class="t-title" style="margin-bottom:12px">' + TF.Icon('save', 14) + ' Manual Log</div>' +
          '<div class="n-strip"><div class="n-strip-bar" style="background:var(--lime)"></div><div class="n-strip-inner"><div class="n-strip-label">Calories</div><input class="n-strip-input" id="in-cal" type="number" placeholder="' + (logged.calories || 0) + '" inputmode="numeric" min="0" max="9999"></div><div class="n-strip-unit">kcal</div></div>' +
          '<div class="n-strip"><div class="n-strip-bar" style="background:var(--blue)"></div><div class="n-strip-inner"><div class="n-strip-label">Protein</div><input class="n-strip-input" id="in-prot" type="number" placeholder="' + (logged.protein || 0) + '" inputmode="numeric" min="0" max="500"></div><div class="n-strip-unit">g</div></div>' +
          '<div class="n-strip"><div class="n-strip-bar" style="background:var(--amber)"></div><div class="n-strip-inner"><div class="n-strip-label">Fat</div><input class="n-strip-input" id="in-fat" type="number" placeholder="' + (logged.fat || 0) + '" inputmode="numeric" min="0" max="300"></div><div class="n-strip-unit">g / ' + targets.fatTarget + '</div></div>' +
          '<div class="n-strip" style="margin-bottom:0"><div class="n-strip-bar" style="background:var(--purple)"></div><div class="n-strip-inner"><div class="n-strip-label">Carbs</div><input class="n-strip-input" id="in-carb" type="number" placeholder="' + (logged.carbs || 0) + '" inputmode="numeric" min="0" max="800"></div><div class="n-strip-unit">g / ' + targets.carbTarget + '</div></div>' +
          '<button class="btn btn-primary" id="btn-save" style="margin-top:14px">' + TF.Icon('save', 13) + ' Save nutrition</button>' +
        '</div>' +

        TF.UI.secHdr('Quick Meal Ideas', '<span class="t-hint">Swipe - simple meal ideas</span>') +
        '<div class="swiper swiper-meal" id="meal-swiper">' +
          '<div class="swiper-wrapper">' +
            MEALS.map(function(meal) {
              return (
                '<div class="swiper-slide" style="width:280px">' +
                  '<div class="meal-swiper-card">' +
                    '<div class="flex-between"><span class="chip ' + meal.cls + '">' + meal.tag + '</span></div>' +
                    '<div class="meal-name" style="margin-top:8px">' + meal.name + '</div>' +
                    '<div class="meal-macros">' + meal.macros + '</div>' +
                  '</div>' +
                '</div>'
              );
            }).join('') +
          '</div>' +
          '<div class="swiper-pagination"></div>' +
        '</div>' +
        '<div style="height:8px"></div>' +
      '</div>';

    TF.UI.setHeroImg(root.querySelector('#nu-hero'), TF.Config.Images.nutrition);

    setTimeout(function() {
      if (window.Swiper) {
        new Swiper('#meal-swiper', {
          slidesPerView: 'auto',
          spaceBetween: 12,
          pagination: { el: '.swiper-pagination', clickable: true },
          grabCursor: true
        });
      }
    }, 50);

    root.querySelector('#btn-food-search').addEventListener('click', function() {
      clearTimeout(_searchDebounce);
      runSearch((root.querySelector('#food-search').value || '').trim(), root.querySelector('#food-results'));
    });

    root.querySelector('#food-search').addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        clearTimeout(_searchDebounce);
        runSearch((event.target.value || '').trim(), root.querySelector('#food-results'));
      }
    });

    root.querySelector('#food-search').addEventListener('input', function(event) {
      var query = (event.target.value || '').trim();
      clearTimeout(_searchDebounce);
      if (!query) {
        root.querySelector('#food-results').innerHTML = '';
        return;
      }
      if (query.length < 3) {
        root.querySelector('#food-results').innerHTML = '<div class="food-search-empty">Type at least 3 letters to search.</div>';
      } else {
        _searchDebounce = setTimeout(function() {
          runSearch(query, root.querySelector('#food-results'));
        }, 250);
      }
    });

    root.querySelector('#btn-save').addEventListener('click', function() {
      var cal = parseFloat(root.querySelector('#in-cal').value);
      var prot = parseFloat(root.querySelector('#in-prot').value);
      var fat = parseFloat(root.querySelector('#in-fat').value);
      var carb = parseFloat(root.querySelector('#in-carb').value);
      var upd = {};
      var valid = true;

      if (root.querySelector('#in-cal').value && !isNaN(cal) && cal >= 0 && cal < 10000) upd.calories = cal;
      else if (root.querySelector('#in-cal').value) { TF.UI.toast('Calories must be 0-9999.', 'error'); valid = false; }

      if (valid && root.querySelector('#in-prot').value && !isNaN(prot) && prot >= 0 && prot < 500) upd.protein = prot;
      else if (valid && root.querySelector('#in-prot').value) { TF.UI.toast('Protein must be 0-500g.', 'error'); valid = false; }

      if (valid && root.querySelector('#in-fat').value && !isNaN(fat) && fat >= 0 && fat < 300) upd.fat = fat;
      else if (valid && root.querySelector('#in-fat').value) { TF.UI.toast('Fat must be 0-300g.', 'error'); valid = false; }

      if (valid && root.querySelector('#in-carb').value && !isNaN(carb) && carb >= 0 && carb < 800) upd.carbs = carb;
      else if (valid && root.querySelector('#in-carb').value) { TF.UI.toast('Carbs must be 0-800g.', 'error'); valid = false; }

      if (!valid || !Object.keys(upd).length) {
        if (valid) {
          TF.UI.toast('Enter at least one value.', 'error');
        }
        return;
      }

      TF.Store.saveTodayNutrition(upd);
      TF.UI.haptic(50);
      TF.UI.toast('Nutrition saved.', 'success');
      TF.Achievements.check({ type: 'nutrition' }).forEach(function(id, index) {
        setTimeout(function() { TF.UI.achievementToast(id); }, 700 + index * 260);
      });
      clearManualInputs();
      refreshSummary();
      syncManualPlaceholders();
    });

    root._screenCleanup = function() {
      clearTimeout(_searchDebounce);
      _searchDebounce = null;
      _searchToken += 1;
    };
  }

  draw();
};
