/* ============================================================
   decks.data.js — ALL flashcard content lives here.
   To add a deck: append an object to DECKS. No component changes.

   Deck  : { id, title, subtitle?, motif, accent, cards:[] }
   Card  : { title, sanskrit?, body, badge?, accentColor?, icon?, cloud? }
           icon: { kind:'planet', id:'sun' }  -> celestial body
                 { kind:'house',  n:1 }        -> diamond medallion
                 (omit for no icon)
           cloud: significations word-cloud back face (houses).
                 { terms: [{ label, weight }] }-- weight: 'big'|'medium'|'small'
                 When present it replaces `body` on the card back.
                 body stays as fallback / plain-text summary.
   ============================================================ */
(function () {
  var HOUSES = {
    id: 'houses',
    title: 'The Twelve Houses',
    subtitle: 'Bhāva',
    motif: 'diamond',
    accent: '#E4C257',
    cards: [
      { title: '1st House', sanskrit: 'Tanu Bhāva', badge: '01', icon: { kind: 'house', n: 1 },
        body: 'The self — body, appearance, vitality, temperament and the overall trajectory of life. The Lagna (ascendant) sits here; it colours the whole chart.' },
      { title: '2nd House', sanskrit: 'Dhana Bhāva', badge: '02', icon: { kind: 'house', n: 2 },
        body: 'Wealth and resources, speech, the face, family lineage and what one consumes — food, values, accumulated assets.' },
      { title: '3rd House', sanskrit: 'Sahaja Bhāva', badge: '03', icon: { kind: 'house', n: 3 },
        body: 'Courage, initiative and effort. Younger siblings, short journeys, skills of the hands, and communication.' },
      { title: '4th House', sanskrit: 'Sukha Bhāva', badge: '04', icon: { kind: 'house', n: 4 },
        body: 'Inner happiness and the heart. Mother, home, land and property, vehicles, and emotional foundations.',
        cloud: {
          terms: [
            { label: 'Mother', weight: 'big' },
            { label: 'Home', weight: 'big' },
            { label: 'Inner Peace', weight: 'big' },
            { label: 'Happiness & Contentment', weight: 'big' },
            { label: 'Emotional Strength', weight: 'medium' },
            { label: 'Vehicles & Conveyances', weight: 'medium' },
            { label: 'Land & Property', weight: 'medium' },
            { label: 'Nurturing', weight: 'medium' },
            { label: 'Comforts & Luxuries', weight: 'medium' },
            { label: 'Vulnerability', weight: 'small' },
            { label: 'Family Bonds', weight: 'small' },
            { label: 'Ease & Belonging', weight: 'small' },
            { label: 'Pets', weight: 'small' },
            { label: 'Escapism', weight: 'small' },
            { label: 'Fixed Assets', weight: 'small' },
            { label: 'Academic Education', weight: 'small' }
          ]
        } },
      { title: '5th House', sanskrit: 'Putra Bhāva', badge: '05', icon: { kind: 'house', n: 5 },
        body: 'Intelligence, creativity and children. Romance, speculation, and pūrva puṇya — merit carried from past lives.' },
      { title: '6th House', sanskrit: 'Ari Bhāva', badge: '06', icon: { kind: 'house', n: 6 },
        body: 'Obstacles overcome — enemies, debts, disease and daily service. A house of effort and resilience.' },
      { title: '7th House', sanskrit: 'Kalatra Bhāva', badge: '07', icon: { kind: 'house', n: 7 },
        body: 'The partner and marriage, business partnerships, contracts and open dealings with others. Directly opposite the self.' },
      { title: '8th House', sanskrit: 'Randhra Bhāva', badge: '08', icon: { kind: 'house', n: 8 },
        body: 'Transformation, longevity and the hidden. Inheritance and shared resources, crises, research and the occult.' },
      { title: '9th House', sanskrit: 'Dharma Bhāva', badge: '09', icon: { kind: 'house', n: 9 },
        body: 'Fortune and higher purpose. The guru and father, philosophy, long journeys, pilgrimage and grace (bhāgya).' },
      { title: '10th House', sanskrit: 'Karma Bhāva', badge: '10', icon: { kind: 'house', n: 10 },
        body: 'Career, status and public action. The most visible angle of the chart — reputation and one\u2019s mark on the world.' },
      { title: '11th House', sanskrit: 'Lābha Bhāva', badge: '11', icon: { kind: 'house', n: 11 },
        body: 'Gains and income, networks and friends, elder siblings, and the fulfilment of desires and aspirations.' },
      { title: '12th House', sanskrit: 'Vyaya Bhāva', badge: '12', icon: { kind: 'house', n: 12 },
        body: 'Loss and expenditure, but also release — mokṣa, the bed, foreign lands, retreat, and what is left behind.' }
    ]
  };

  var c = window.Celestial ? window.Celestial.colors : {};
  var PLANETS = {
    id: 'planets',
    title: 'The Navagraha',
    subtitle: 'Nine Grahas',
    motif: 'diamond',
    accent: '#E4C257',
    cards: [
      { title: 'Sun', sanskrit: 'Surya', badge: 'Rules Leo', accentColor: c.sun, icon: { kind: 'planet', id: 'sun' },
        body: 'The soul, ego and vitality; the father and authority. Exalted in Aries, debilitated in Libra. Moves through one sign a month.' },
      { title: 'Moon', sanskrit: 'Chandra', badge: 'Rules Cancer', accentColor: c.moon, icon: { kind: 'planet', id: 'moon' },
        body: 'The mind, emotions and receptivity; the mother and comfort. Exalted in Taurus, debilitated in Scorpio. The fastest graha.' },
      { title: 'Mars', sanskrit: 'Mangala', badge: 'Aries · Scorpio', accentColor: c.mars, icon: { kind: 'planet', id: 'mars' },
        body: 'Energy, courage, drive and conflict; the warrior and sibling. Exalted in Capricorn, debilitated in Cancer.' },
      { title: 'Mercury', sanskrit: 'Budha', badge: 'Gemini · Virgo', accentColor: c.mercury, icon: { kind: 'planet', id: 'mercury' },
        body: 'Intellect, speech, logic and commerce. Exalted in Virgo (its own sign), debilitated in Pisces. Quick and adaptable.' },
      { title: 'Jupiter', sanskrit: 'Guru', badge: 'Sagittarius · Pisces', accentColor: c.jupiter, icon: { kind: 'planet', id: 'jupiter' },
        body: 'Wisdom, expansion, dharma and fortune; the teacher. Exalted in Cancer, debilitated in Capricorn. The great benefic.' },
      { title: 'Venus', sanskrit: 'Shukra', badge: 'Taurus · Libra', accentColor: c.venus, icon: { kind: 'planet', id: 'venus' },
        body: 'Love, beauty, art and pleasure; relationships and luxury. Exalted in Pisces, debilitated in Virgo.' },
      { title: 'Saturn', sanskrit: 'Shani', badge: 'Capricorn · Aquarius', accentColor: c.saturn, icon: { kind: 'planet', id: 'saturn' },
        body: 'Discipline, time, karma and limitation; the patient teacher of hard lessons. Exalted in Libra, debilitated in Aries. The slowest graha.' },
      { title: 'Rahu', sanskrit: 'North Node', badge: 'Shadow node', accentColor: c.rahu, icon: { kind: 'planet', id: 'rahu' },
        body: 'The point of insatiable desire and obsession — the unconventional, the foreign, eclipses. A chāyā (shadow) graha; it rules no sign.' },
      { title: 'Ketu', sanskrit: 'South Node', badge: 'Shadow node', accentColor: c.ketu, icon: { kind: 'planet', id: 'ketu' },
        body: 'The point of detachment and release — spirituality, past karma, mokṣa. The other shadow graha, opposite Rahu; it rules no sign.' }
    ]
  };

  window.DECKS = [HOUSES, PLANETS];
})();
