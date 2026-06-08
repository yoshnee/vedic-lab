/* ============================================================
   panel.data.js — content for the Planet Detail Panel demo.
   ONE data object per planet drives the whole component. Houses
   & nakshatras referenced by the placement links resolve against
   FLASHCARDS so a tap opens the real flashcard in place.

   Demo chart: Aries ascendant (Lagna), matching the identity preview.
     H1 Aries(Mars) H2 Tau(Ven) H3 Gem(Mer) H4 Can(Moon) H5 Leo(Sun)
     H6 Vir(Mer) H7 Lib(Ven) H8 Sco(Mars) H9 Sag(Jup) H10 Cap(Sat)
     H11 Aqu(Sat) H12 Pis(Jup)
   Running daśā: Sun (Mahā) → Mercury (Antar) → Venus (Pratyantar).
   ============================================================ */
(function () {

  /* ---------- PLANET PANELS ----------
     Schema (every field optional except key/name):
       key, name, sanskrit
       dignity : 'neutral'|'exalted'|'debilitated'|'own'  (icon variant)
       retro   : bool                                       (icon "R")
       dasha   : ['maha'|'antar', ...]  -> header pills
       rules   : [houseNumbers]         -> rulership links
       house   : houseNumber            -> placement link
       degree, sign, signAbbr
       nakshatra : flashcard id for the nakshatra link
       aspectedBy : [{ planet, aspect }]
       conjunct   : [planetKeys]
       combust    : { on:bool, note? }
       yogas      : [strings]  (empty -> placeholder)
       extraRows  : [ ...open-ended row descriptors ]   <-- extensibility
  */
  var PLANETS = [
    {
      key: 'sun', name: 'Sun', sanskrit: 'Surya',
      dignity: 'exalted', retro: false,
      dasha: ['maha'],
      rules: [5],
      house: 1,
      degree: '10\u00b006\u2032', sign: 'Aries', signAbbr: 'Ar',
      nakshatra: 'ashwini',
      aspectedBy: [{ planet: 'saturn', aspect: '3rd' }, { planet: 'jupiter', aspect: '5th' }],
      conjunct: ['mercury'],
      combust: { on: false, note: 'The Sun is the source of combustion \u2014 it is never itself combust.' },
      yogas: [],
      extraRows: []
    },
    {
      key: 'mercury', name: 'Mercury', sanskrit: 'Budha',
      dignity: 'neutral', retro: false,
      dasha: ['antar'],
      rules: [3, 6],
      house: 1,
      degree: '13\u00b048\u2032', sign: 'Aries', signAbbr: 'Ar',
      nakshatra: 'bharani',
      aspectedBy: [{ planet: 'saturn', aspect: '3rd' }, { planet: 'jupiter', aspect: '5th' }],
      conjunct: ['sun'],
      combust: { on: true, note: 'Within 14\u00b0 of the Sun \u2014 budha\u0101ditya in close embrace. Its significations are absorbed into the Sun\u2019s glare.' },
      yogas: [],
      extraRows: []
    },
    {
      key: 'saturn', name: 'Saturn', sanskrit: 'Shani',
      dignity: 'own', retro: true,
      dasha: [],
      rules: [10, 11],
      house: 11,
      degree: '28\u00b010\u2032', sign: 'Aquarius', signAbbr: 'Aq',
      nakshatra: 'purvabhadrapada',
      aspectedBy: [{ planet: 'mars', aspect: '8th' }],
      conjunct: [],
      combust: { on: false },
      yogas: [],
      /* --- the open-ended slot: Saturn carries a row the others don't --- */
      extraRows: [
        {
          type: 'sadesati',
          label: 'Sade Sati', sanskrit: 'Sa\u1e0de S\u0101t\u012b',
          phaseIndex: 1,            // 0=rising, 1=peak, 2=setting (active)
          phases: ['Rising', 'Peak', 'Setting'],
          moonSign: 'Aquarius', moonHouse: 11,
          note: 'Transit Saturn is over your natal Moon in {moon} \u2014 the peak (janma) phase of the seven-and-a-half-year cycle. Derived from Saturn\u2019s position over time, not the birth snapshot.'
        }
      ]
    }
  ];

  /* ---------- VIM\u015aOTTAR\u012a DA\u015a\u0100 (nested drill) ----------
     Only the running chain is fully expanded for the demo; sibling
     periods are listed with dates but not drillable. */
  var DASHA = {
    running: ['sun', 'mercury', 'venus'],
    maha: [
      { planet: 'ketu', from: '2008', to: '2015' },
      { planet: 'venus', from: '2015', to: '2021' },
      {
        planet: 'sun', from: '2021', to: '2027', running: true,
        antar: [
          { planet: 'sun', from: 'Mar 2021', to: 'Jun 2021' },
          { planet: 'moon', from: 'Jun 2021', to: 'Jan 2022' },
          { planet: 'mars', from: 'Jan 2022', to: 'May 2022' },
          { planet: 'rahu', from: 'May 2022', to: 'Apr 2023' },
          { planet: 'jupiter', from: 'Apr 2023', to: 'Feb 2024' },
          { planet: 'saturn', from: 'Feb 2024', to: 'Jan 2025' },
          {
            planet: 'mercury', from: 'Jan 2025', to: 'Nov 2025', running: true,
            pratyantar: [
              { planet: 'mercury', from: 'Jan 2025', to: 'Mar 2025' },
              { planet: 'ketu', from: 'Mar 2025', to: 'May 2025' },
              { planet: 'venus', from: 'May 2025', to: 'Aug 2025', running: true },
              { planet: 'sun', from: 'Aug 2025', to: 'Aug 2025' },
              { planet: 'moon', from: 'Aug 2025', to: 'Sep 2025' },
              { planet: 'mars', from: 'Sep 2025', to: 'Oct 2025' },
              { planet: 'rahu', from: 'Oct 2025', to: 'Nov 2025' }
            ]
          },
          { planet: 'ketu', from: 'Nov 2025', to: 'Mar 2026' },
          { planet: 'venus', from: 'Mar 2026', to: 'Mar 2027' }
        ]
      },
      { planet: 'moon', from: '2027', to: '2037' }
    ]
  };

  /* ---------- FLASHCARDS (link targets) ----------
     Houses reuse the app's deck content; nakshatras are new. Each is a
     card: { id, kind, title, sanskrit?, badge?, body, icon } where icon
     matches the app's CardIcon contract. */
  var HOUSE = function (n, title, sk, body) {
    return { id: 'house-' + n, kind: 'House', title: title, sanskrit: sk, badge: String(n).padStart(2, '0'),
      body: body, icon: { kind: 'house', n: n } };
  };
  var NAK = function (id, title, sk, ruler, body) {
    return { id: id, kind: 'Nak\u1e63atra', title: title, sanskrit: sk, badge: ruler,
      body: body, icon: { kind: 'planet', id: rulerKey(ruler) } };
  };
  function rulerKey(label) {
    var m = { Ketu: 'ketu', Venus: 'venus', Sun: 'sun', Moon: 'moon', Mars: 'mars',
      Rahu: 'rahu', Jupiter: 'jupiter', Saturn: 'saturn', Mercury: 'mercury' };
    return m[label] || 'sun';
  }

  var FLASHCARDS = {
    'house-1': HOUSE(1, '1st House', 'Tanu Bh\u0101va',
      'The self \u2014 body, appearance, vitality, temperament and the overall trajectory of life. The Lagna (ascendant) sits here; it colours the whole chart.'),
    'house-3': HOUSE(3, '3rd House', 'Sahaja Bh\u0101va',
      'Courage, initiative and effort. Younger siblings, short journeys, skills of the hands, and communication.'),
    'house-5': HOUSE(5, '5th House', 'Putra Bh\u0101va',
      'Intelligence, creativity and children. Romance, speculation, and p\u016brva pu\u1e47ya \u2014 merit carried from past lives.'),
    'house-6': HOUSE(6, '6th House', 'Ari Bh\u0101va',
      'Obstacles overcome \u2014 enemies, debts, disease and daily service. A house of effort and resilience.'),
    'house-10': HOUSE(10, '10th House', 'Karma Bh\u0101va',
      'Career, status and public action. The most visible angle of the chart \u2014 reputation and one\u2019s mark on the world.'),
    'house-11': HOUSE(11, '11th House', 'L\u0101bha Bh\u0101va',
      'Gains and income, networks and friends, elder siblings, and the fulfilment of desires and aspirations.'),

    'ashwini': NAK('ashwini', 'Ashwin\u012b', 'Aries 00\u00b0\u201313\u00b020\u2032', 'Ketu',
      'The first nak\u1e63atra \u2014 the horsemen, swift twin healers. Speed, fresh starts, pioneering energy and the impulse to begin. Ruled by Ketu; deity, the A\u015bvins.'),
    'bharani': NAK('bharani', 'Bhara\u1e47\u012b', 'Aries 13\u00b020\u2032\u201326\u00b040\u2032', 'Venus',
      'The bearer \u2014 the womb that holds and ripens. Restraint, creative force, and the friction of transformation. Ruled by Venus; deity, Yama, lord of dharma and death.'),
    'purvabhadrapada': NAK('purvabhadrapada', 'P\u016brva Bh\u0101drapad\u0101', 'Aquarius 20\u00b0\u2013Pisces 03\u00b020\u2032', 'Jupiter',
      'The former \u201cscorching pair\u201d \u2014 the fire of the funeral pyre, intensity and idealism. Penance, otherworldly vision, and transformation. Ruled by Jupiter; deity, Aja Ekap\u0101da.')
  };

  window.PANEL_PLANETS = PLANETS;
  window.PANEL_DASHA = DASHA;
  window.PANEL_FLASHCARDS = FLASHCARDS;
})();
