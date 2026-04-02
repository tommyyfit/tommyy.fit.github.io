TF.Quotes = (function(){
  'use strict';

  var QUOTES = [
    { text: 'The obstacle is the way.', author: 'Marcus Aurelius', cat: 'stoic' },
    { text: 'We suffer more in imagination than in reality.', author: 'Seneca', cat: 'stoic' },
    { text: 'Waste no more time arguing about what a good man should be. Be one.', author: 'Marcus Aurelius', cat: 'stoic' },
    { text: 'You have power over your mind, not outside events. Realise this and you will find strength.', author: 'Marcus Aurelius', cat: 'stoic' },
    { text: 'What stands in the way becomes the way.', author: 'Marcus Aurelius', cat: 'stoic' },
    { text: 'If it is not right, do not do it. If it is not true, do not say it.', author: 'Marcus Aurelius', cat: 'stoic' },
    { text: 'Difficulties strengthen the mind, as labour does the body.', author: 'Seneca', cat: 'stoic' },
    { text: 'No man is more unhappy than he who never faces adversity.', author: 'Seneca', cat: 'stoic' },
    { text: 'First say to yourself what you would be; and then do what you have to do.', author: 'Epictetus', cat: 'stoic' },
    { text: 'He who fears death will never do anything worthy of a man who is alive.', author: 'Seneca', cat: 'stoic' },
    { text: 'No person has the power to have everything they want, but it is in their power not to want what they do not have.', author: 'Seneca', cat: 'stoic' },
    { text: 'It is not death that a man should fear, but never beginning to live.', author: 'Marcus Aurelius', cat: 'stoic' },
    { text: 'How long are you going to wait before you demand the best for yourself?', author: 'Epictetus', cat: 'stoic' },
    { text: 'Luck is what happens when preparation meets opportunity.', author: 'Seneca', cat: 'stoic' },
    { text: 'If anyone can refute me, show me I am making a mistake, I will gladly change.', author: 'Marcus Aurelius', cat: 'stoic' },
    { text: "Don't explain your philosophy. Embody it.", author: 'Epictetus', cat: 'stoic' },
    { text: 'The body follows the standard the mind accepts.', author: 'Strength Code', cat: 'strength' },
    { text: 'The warrior is forged in ordinary mornings, not glorious moments.', author: 'Warrior Code', cat: 'warrior' },
    { text: 'Cold air, clear mind, hard work.', author: 'Northfire', cat: 'viking' },
    { text: 'Discipline is the bridge between the man you are and the force you can become.', author: 'Iron Discipline', cat: 'discipline' },
    { text: 'Train so well that doubt has nowhere to stand.', author: 'Strength Code', cat: 'strength' },
    { text: 'The strong do not wait for fire; they carry their own spark.', author: 'Warrior Code', cat: 'warrior' },
    { text: 'Calm is a weapon when the day becomes violent.', author: 'Northfire', cat: 'viking' },
    { text: 'Build a back that can carry pressure and a mind that can carry silence.', author: 'Iron Discipline', cat: 'discipline' },
    { text: 'Great physiques are carved by boring consistency.', author: 'Strength Code', cat: 'strength' },
    { text: 'When comfort speaks, answer with action.', author: 'Warrior Code', cat: 'warrior' },
    { text: 'Heavy weight reveals light excuses.', author: 'Iron Discipline', cat: 'discipline' },
    { text: 'One more rep is often one more layer of character.', author: 'Strength Code', cat: 'strength' },
    { text: 'Power is quiet before it is seen.', author: 'Warrior Code', cat: 'warrior' },
    { text: 'The storm respects the one who keeps rowing.', author: 'Northfire', cat: 'viking' },
    { text: 'Muscles grow where excuses die.', author: 'Strength Code', cat: 'strength' },
    { text: 'A warrior\'s first victory is over hesitation.', author: 'Warrior Code', cat: 'warrior' },
    { text: 'Stand tall, lift clean, speak less.', author: 'Iron Discipline', cat: 'discipline' },
    { text: 'Your future strength is hiding inside today\'s discipline.', author: 'Strength Code', cat: 'strength' },
    { text: 'The bar does not care about mood; lift anyway.', author: 'Warrior Code', cat: 'warrior' },
    { text: 'Hunger for progress should be louder than fear of effort.', author: 'Iron Discipline', cat: 'discipline' },
    { text: 'The mind must harden before the body can.', author: 'Strength Code', cat: 'strength' },
    { text: 'The wolf survives winter because it moves, not because it wishes.', author: 'Northfire', cat: 'viking' },
    { text: 'Endurance is pride that learned patience.', author: 'Warrior Code', cat: 'warrior' },
    { text: 'Sharp habits beat loud motivation.', author: 'Iron Discipline', cat: 'discipline' },
    { text: 'If you want a savage physique, keep a civilized routine.', author: 'Strength Code', cat: 'strength' },
    { text: 'Courage is often just the next set started on time.', author: 'Warrior Code', cat: 'warrior' },
    { text: 'The mirror rewards the ones who return.', author: 'Strength Code', cat: 'strength' },
    { text: 'Lift with fury, recover with wisdom.', author: 'Iron Discipline', cat: 'discipline' },
    { text: 'The north does not fear harsh seasons; it prepares for them.', author: 'Northfire', cat: 'viking' },
    { text: 'A disciplined man looks like luck from the outside.', author: 'Warrior Code', cat: 'warrior' },
    { text: 'Sweat is the tax paid on becoming harder to break.', author: 'Strength Code', cat: 'strength' },
    { text: 'When the legs burn, the spirit gets a chance to speak.', author: 'Warrior Code', cat: 'warrior' },
    { text: 'Strength is not a mood. It is a practice.', author: 'Iron Discipline', cat: 'discipline' },
    { text: 'The cleanest confidence comes from promises kept in private.', author: 'Strength Code', cat: 'strength' },
    { text: 'The iron will always tell you the truth.', author: 'Warrior Code', cat: 'warrior' },
    { text: 'Train your posture like a king and your work ethic like a farmer.', author: 'Iron Discipline', cat: 'discipline' },
    { text: 'A hard session can rescue a soft day.', author: 'Strength Code', cat: 'strength' },
    { text: 'Win the first hour and the rest of the day kneels.', author: 'Warrior Code', cat: 'warrior' },
    { text: 'The shield is built before the battle.', author: 'Northfire', cat: 'viking' },
    { text: 'Strong people make peace with repetition.', author: 'Iron Discipline', cat: 'discipline' },
    { text: 'The body remembers what the mouth only plans.', author: 'Strength Code', cat: 'strength' },
    { text: 'No throne is earned by sleeping through dawn.', author: 'Northfire', cat: 'viking' },
    { text: 'Be so consistent that motivation becomes irrelevant.', author: 'Iron Discipline', cat: 'discipline' },
    { text: 'The brave are not always loud; sometimes they are just early.', author: 'Warrior Code', cat: 'warrior' },
    { text: 'Grind quietly enough to hear your standards getting higher.', author: 'Strength Code', cat: 'strength' },
    { text: 'Pain is not the goal; growth is. But growth rarely arrives without strain.', author: 'Iron Discipline', cat: 'discipline' },
    { text: 'The disciplined man is dangerous because he can command himself.', author: 'Warrior Code', cat: 'warrior' },
    { text: 'Make your habits so strong that bad days still obey them.', author: 'Strength Code', cat: 'strength' }
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

  function hashKey(key){
    var hash = 0;
    for (var i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function quoteForMinute(key){
    var bucket = key || minuteKey();
    return normalise(QUOTES[hashKey(bucket) % QUOTES.length]);
  }

  function getCurrent(forceRefresh){
    var key = minuteKey();
    if (!forceRefresh && currentQuote && currentMinuteKey === key) {
      return Promise.resolve(currentQuote);
    }

    currentQuote = quoteForMinute(key);
    currentMinuteKey = key;
    return Promise.resolve(currentQuote);
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
    return currentQuote || quoteForMinute(minuteKey());
  }

  return {
    load: load,
    getToday: getToday,
    getCurrent: getCurrent,
    normalise: normalise,
    QUOTES: QUOTES
  };
})();
