TF.Screens.nutrition = function(root) {
  var MEALS = [
    {name:'Chicken breast + jasmine rice + broccoli',      macros:'~680 kcal · 58g protein · 12g fat',  tag:'BULK',  cls:'chip-lime'},
    {name:'Greek yogurt + oats + berries + honey',          macros:'~450 kcal · 32g protein · 6g fat',   tag:'QUICK', cls:'chip-blue'},
    {name:'3 eggs + 2 whites + avocado toast',              macros:'~510 kcal · 26g protein · 24g fat',  tag:'QUICK', cls:'chip-blue'},
    {name:'Tuna (tin) + whole-wheat pasta + olive oil',     macros:'~590 kcal · 46g protein · 14g fat',  tag:'CHEAP', cls:'chip-amber'},
    {name:'90% lean beef + sweet potato mash',              macros:'~660 kcal · 52g protein · 18g fat',  tag:'BULK',  cls:'chip-lime'},
    {name:'Cottage cheese + berries + walnuts',             macros:'~390 kcal · 34g protein · 12g fat',  tag:'QUICK', cls:'chip-blue'},
    {name:'Sardines (tin) + rice cakes + avocado',          macros:'~360 kcal · 30g protein · 18g fat',  tag:'CHEAP', cls:'chip-amber'},
    {name:'Whey shake + banana + peanut butter',            macros:'~490 kcal · 42g protein · 16g fat',  tag:'QUICK', cls:'chip-blue'},
    {name:'Atlantic salmon + quinoa + spinach',             macros:'~580 kcal · 49g protein · 22g fat',  tag:'BULK',  cls:'chip-lime'},
    {name:'Turkey mince stir fry + basmati rice',           macros:'~560 kcal · 44g protein · 10g fat',  tag:'CHEAP', cls:'chip-amber'},
    {name:'Lentil soup + whole-grain bread + olive oil',    macros:'~520 kcal · 26g protein · 12g fat',  tag:'CHEAP', cls:'chip-amber'},
    {name:'Sirloin steak (200g) + roasted veg',             macros:'~620 kcal · 56g protein · 26g fat',  tag:'BULK',  cls:'chip-lime'}
  ];

  var _searchTimeout = null;

  function draw(){
    var profile = TF.Store.getProfile();
    var logged  = TF.Store.getTodayNutrition();
    var calPct  = profile.targetCalories ? logged.calories/profile.targetCalories : 0;
    var protPct = profile.targetProtein  ? logged.protein/profile.targetProtein   : 0;
    var watPct  = logged.water/3.0;
    /* v4: fat target ~0.8–1g/kg */
    var fatTarget = Math.round(profile.bodyWeightKg * 0.9);
    var fatPct  = fatTarget>0 ? (logged.fat||0)/fatTarget : 0;

    root.innerHTML = '<div class="screen">'+
      '<div class="hero-img-card" id="nu-hero">'+
        '<div class="skeleton" style="position:absolute;inset:0;border-radius:var(--r-lg)"></div>'+
        '<div class="hero-img-card-content">'+
          '<div class="t-label" style="color:var(--lime);margin-bottom:5px">DAILY FUEL</div>'+
          '<div class="t-headline" style="font-size:24px">Track your fuel.<br>Build the physique.</div>'+
        '</div>'+
      '</div>'+

      /* v4: 4-macro rings */
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:18px">'+
        '<div class="macro-tile"><div class="ring-wrap">'+TF.UI.ring(calPct,'var(--lime)',logged.calories>0?Math.round(calPct*100)+'%':'—')+'</div><div class="macro-name">Cal</div><div class="macro-target">'+logged.calories+'/'+profile.targetCalories+'</div></div>'+
        '<div class="macro-tile"><div class="ring-wrap">'+TF.UI.ring(protPct,'var(--blue)',logged.protein>0?logged.protein+'g':'—')+'</div><div class="macro-name">Protein</div><div class="macro-target">'+logged.protein+'/'+profile.targetProtein+'g</div></div>'+
        '<div class="macro-tile"><div class="ring-wrap">'+TF.UI.ring(fatPct,'var(--amber)',(logged.fat||0)>0?(logged.fat||0)+'g':'—')+'</div><div class="macro-name">Fat</div><div class="macro-target">'+(logged.fat||0)+'/'+fatTarget+'g</div></div>'+
        '<div class="macro-tile"><div class="ring-wrap">'+TF.UI.ring(watPct,'var(--teal)',logged.water>0?logged.water.toFixed(1)+'L':'—')+'</div><div class="macro-name">Water</div><div class="macro-target">'+logged.water.toFixed(1)+'/3.0L</div></div>'+
      '</div>'+

      /* Food search */
      '<div class="card" style="margin-bottom:14px">'+
        '<div class="t-title" style="margin-bottom:12px">'+TF.Icon('search',14)+' Food Search</div>'+
        '<div class="food-search-wrap">'+
          '<div class="food-search-icon">'+TF.Icon('search',15)+'</div>'+
          '<input class="food-search-input" id="food-search" type="text" placeholder="Search food (e.g. chicken breast)" autocomplete="off">'+
        '</div>'+
        '<div id="food-results"></div>'+
      '</div>'+

      /* Manual log — v4: adds fat */
      '<div class="card" style="margin-bottom:14px">'+
        '<div class="t-title" style="margin-bottom:12px">Log manually</div>'+
        '<div class="n-strip"><div class="n-strip-bar" style="background:var(--lime)"></div><div class="n-strip-inner"><div class="n-strip-label">Calories</div><input class="n-strip-input" id="in-cal" type="number" placeholder="'+(logged.calories||0)+'" inputmode="numeric" min="0" max="9999"></div><div class="n-strip-unit">kcal</div></div>'+
        '<div class="n-strip"><div class="n-strip-bar" style="background:var(--blue)"></div><div class="n-strip-inner"><div class="n-strip-label">Protein</div><input class="n-strip-input" id="in-prot" type="number" placeholder="'+(logged.protein||0)+'" inputmode="numeric" min="0" max="500"></div><div class="n-strip-unit">g</div></div>'+
        '<div class="n-strip"><div class="n-strip-bar" style="background:var(--amber)"></div><div class="n-strip-inner"><div class="n-strip-label">Fat</div><input class="n-strip-input" id="in-fat" type="number" placeholder="'+(logged.fat||0)+'" inputmode="numeric" min="0" max="300"></div><div class="n-strip-unit">g</div></div>'+
        '<div class="n-strip" style="margin-bottom:0"><div class="n-strip-bar" style="background:var(--teal)"></div><div class="n-strip-inner"><div class="n-strip-label">Water</div><input class="n-strip-input" id="in-wat" type="number" placeholder="'+(logged.water||0)+'" inputmode="decimal" step="0.1" min="0" max="15"></div><div class="n-strip-unit">L</div></div>'+
        '<button class="btn btn-primary" id="btn-save" style="margin-top:14px">'+TF.Icon('save',13)+' SAVE NUTRITION</button>'+
      '</div>'+

      /* Meal ideas */
      TF.UI.secHdr('Quick Meal Ideas','<span class="t-hint">Swipe →</span>')+
      '<div class="swiper swiper-meal" id="meal-swiper">'+
        '<div class="swiper-wrapper">'+
          MEALS.map(function(m){
            return '<div class="swiper-slide" style="width:280px">'+
              '<div class="meal-swiper-card">'+
                '<div class="flex-between"><span class="chip '+m.cls+'">'+m.tag+'</span></div>'+
                '<div class="meal-name" style="margin-top:8px">'+m.name+'</div>'+
                '<div class="meal-macros">'+m.macros+'</div>'+
              '</div></div>';
          }).join('')+
        '</div>'+
        '<div class="swiper-pagination"></div>'+
      '</div>'+

      '<div style="height:8px"></div></div>';

    TF.UI.setHeroImg(root.querySelector('#nu-hero'), TF.Config.Images.nutrition);

    setTimeout(function(){
      if(window.Swiper){ new Swiper('#meal-swiper',{slidesPerView:'auto',spaceBetween:12,pagination:{el:'.swiper-pagination',clickable:true},grabCursor:true}); }
    },50);

    root.querySelector('#food-search').addEventListener('input', function(){
      var q = this.value.trim();
      clearTimeout(_searchTimeout);
      var resEl = root.querySelector('#food-results');
      if(!q){resEl.innerHTML='';return;}
      resEl.innerHTML = TF.UI.spinner();
      _searchTimeout = setTimeout(function(){ searchFood(q,resEl); },500);
    });

    root.querySelector('#btn-save').addEventListener('click', function(){
      var cal  = parseFloat(root.querySelector('#in-cal').value);
      var prot = parseFloat(root.querySelector('#in-prot').value);
      var fat  = parseFloat(root.querySelector('#in-fat').value);
      var wat  = parseFloat(root.querySelector('#in-wat').value);
      var upd = {}, valid = true;
      if(!isNaN(cal)  && cal>=0  && cal<10000)  upd.calories = cal;
      else if(root.querySelector('#in-cal').value){ TF.UI.toast('Invalid calorie value.','error'); valid=false; }
      if(!isNaN(prot) && prot>=0 && prot<500)   upd.protein  = prot;
      else if(root.querySelector('#in-prot').value&&valid){ TF.UI.toast('Invalid protein value.','error'); valid=false; }
      if(!isNaN(fat)  && fat>=0  && fat<300)    upd.fat      = fat;
      if(!isNaN(wat)  && wat>=0  && wat<20)     upd.water    = wat;
      if(!valid||!Object.keys(upd).length){if(valid)TF.UI.toast('Enter at least one value.'); return;}
      TF.Store.saveTodayNutrition(upd);
      TF.UI.haptic(50);
      TF.UI.toast('Nutrition saved ✓','success');
      var unlocked=TF.Achievements.check({type:'nutrition'});
      unlocked.forEach(function(id){setTimeout(function(){TF.UI.achievementToast(id);},800);});
      draw();
    });
  }

  function searchFood(query, resEl){
    var url = TF.Config.FoodAPI+'?search_terms='+encodeURIComponent(query)+'&search_simple=1&action=process&json=1&page_size=6&fields=product_name,nutriments,serving_size';
    fetch(url)
      .then(function(r){return r.json();})
      .then(function(data){
        var products = (data.products||[]).filter(function(p){
          return p.product_name && p.nutriments && p.nutriments['energy-kcal_100g'];
        }).slice(0,6);
        if(!products.length){resEl.innerHTML='<div class="food-search-empty">No results. Try a simpler term.</div>';return;}
        resEl.innerHTML='<div class="food-results">'+products.map(function(p){
          var kcal = Math.round(p.nutriments['energy-kcal_100g']||0);
          var prot = Math.round(p.nutriments['proteins_100g']||0);
          var fat  = Math.round(p.nutriments['fat_100g']||0);
          var carb = Math.round(p.nutriments['carbohydrates_100g']||0);
          var name = p.product_name.substring(0,50);
          return '<div class="food-result-item" data-kcal="'+kcal+'" data-prot="'+prot+'" data-fat="'+fat+'" data-name="'+TF.UI.escapeAttr(name)+'">'+
            '<div><div class="food-result-name">'+TF.UI.escapeHTML(name)+'</div>'+
            '<div class="food-result-macros">per 100g: '+kcal+' kcal · '+prot+'g prot · '+fat+'g fat · '+carb+'g carbs</div></div>'+
            '<div class="chip chip-lime">ADD</div></div>';
        }).join('')+'</div>';
        resEl.querySelectorAll('.food-result-item').forEach(function(item){
          item.addEventListener('click', function(){
            var kcal=parseInt(item.dataset.kcal)||0, prot=parseInt(item.dataset.prot)||0, fat=parseInt(item.dataset.fat)||0;
            var cur = TF.Store.getTodayNutrition();
            TF.Store.saveTodayNutrition({ calories:cur.calories+kcal, protein:cur.protein+prot, fat:(cur.fat||0)+fat });
            TF.UI.toast('Added: '+item.dataset.name.substring(0,30),'success');
            TF.UI.haptic(50);
            draw();
          });
        });
      })
      .catch(function(){resEl.innerHTML='<div class="food-search-empty">Search unavailable.</div>';});
  }

  draw();
};
