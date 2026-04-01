TF.Quotes = (function(){
  'use strict';

  var FALLBACK = [
    { text: 'The obstacle is the way.', author: 'Marcus Aurelius', cat: 'stoic' },
    { text: 'We suffer more in imagination than in reality.', author: 'Seneca', cat: 'stoic' },
    { text: 'Waste no more time arguing about what a good man should be. Be one.', author: 'Marcus Aurelius', cat: 'stoic' },
    { text: 'You have power over your mind, not outside events. Realise this and you will find strength.', author: 'Marcus Aurelius', cat: 'stoic' },
    { text: 'What stands in the way becomes the way.', author: 'Marcus Aurelius', cat: 'stoic' },
    { text: 'If it is not right, do not do it. If it is not true, do not say it.', author: 'Marcus Aurelius', cat: 'stoic' },
    { text: 'Difficulties strengthen the mind, as labour does the body.', author: 'Seneca', cat: 'stoic' },
    { text: 'No man is more unhappy than he who never faces adversity.', author: 'Seneca', cat: 'stoic' }
  ];

  var currentQuote = null;
  var currentMinuteKey = null;

  function minuteKey(){
    var now = new Date();
    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0')
    ].join('-');
  }

  function normalise(quote){
    return {
      text: quote.text || quote.content || '',
      author: quote.author || 'Unknown',
      cat: quote.cat || (quote.tags && quote.tags[0]) || 'stoic'
    };
  }

  function fallbackForMinute(key){
    var bucket = key || minuteKey();
    var hash = 0;
    for (var i = 0; i < bucket.length; i++) {
      hash = ((hash << 5) - hash) + bucket.charCodeAt(i);
      hash |= 0;
    }
    return normalise(FALLBACK[Math.abs(hash) % FALLBACK.length]);
  }

  function fetchLiveStoicQuote(){
    var controller;
    try { controller = new AbortController(); } catch (e) {}
    var options = controller ? { signal: controller.signal } : {};
    if (controller) {
      setTimeout(function(){
        try { controller.abort(); } catch (_) {}
      }, 5000);
    }

    return fetch(TF.Config.QuoteAPI.stoic + '?t=' + Date.now(), options)
      .then(function(response){
        if (!response.ok) {
          throw new Error('Quote API failed: ' + response.status);
        }
        return response.json();
      })
      .then(function(data){
        return normalise({
          text: data.text,
          author: data.author,
          cat: 'stoic'
        });
      });
  }

  function getCurrent(forceRefresh){
    var key = minuteKey();
    if (!forceRefresh && currentQuote && currentMinuteKey === key) {
      return Promise.resolve(currentQuote);
    }

    return fetchLiveStoicQuote().then(function(quote){
      currentQuote = quote;
      currentMinuteKey = key;
      return currentQuote;
    }).catch(function(){
      currentQuote = fallbackForMinute(key);
      currentMinuteKey = key;
      return currentQuote;
    });
  }

  function load(){
    return getCurrent(false).then(function(quote){
      return [quote];
    });
  }

  function getToday(quotes){
    if (quotes && quotes.length) {
      return normalise(quotes[0]);
    }
    return currentQuote || fallbackForMinute(minuteKey());
  }

  return {
    load: load,
    getToday: getToday,
    getCurrent: getCurrent,
    normalise: normalise,
    FALLBACK: FALLBACK
  };
})();
