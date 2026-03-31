export interface PlanetaryTil {
  planet: string;
  sanskrit: string;
  color: string;
  colorHex: string;
  quality: string;
  bodyAreas: string[];
  generalEffect: string;
  auspiciousResult: string;
  challengingResult: string;
}

export const PLANETARY_TILS: PlanetaryTil[] = [
  {
    planet: 'Sun',
    sanskrit: 'Surya',
    color: 'Reddish / Copper',
    colorHex: '#b5651d',
    quality: 'Royal, authoritative',
    bodyAreas: ['Forehead centre', 'Right chest', 'Back of head'],
    generalEffect: 'Moles ruled by the Sun relate to status, authority, vitality, and public image.',
    auspiciousResult: 'Leadership positions, fame, strong constitution, government connections.',
    challengingResult: 'Arrogance, eye or heart issues, conflict with authority figures.',
  },
  {
    planet: 'Moon',
    sanskrit: 'Chandra',
    color: 'White / Pale / Silver',
    colorHex: '#d0ccc0',
    quality: 'Fluid, emotional, reflective',
    bodyAreas: ['Left chest', 'Chin', 'Left foot', 'Belly'],
    generalEffect: 'Moon moles relate to emotions, the mind, mother, fluids in the body, and travel.',
    auspiciousResult: 'Emotional intelligence, nurturing nature, successful travels, fruitful relationship with mother.',
    challengingResult: 'Mental restlessness, water-related health concerns, troubled relationship with mother.',
  },
  {
    planet: 'Mars',
    sanskrit: 'Mangal',
    color: 'Red / Dark Red',
    colorHex: '#8b2222',
    quality: 'Energetic, aggressive, courageous',
    bodyAreas: ['Right temple', 'Right arm', 'Thighs', 'Ankles'],
    generalEffect: 'Mars moles relate to courage, vitality, aggression, siblings, and physical energy.',
    auspiciousResult: 'Courage in adversity, success in competitive fields, athletic ability.',
    challengingResult: 'Anger issues, accidents, conflict with brothers, blood-related concerns.',
  },
  {
    planet: 'Mercury',
    sanskrit: 'Budha',
    color: 'Green / Light',
    colorHex: '#4a7a4a',
    quality: 'Communicative, intelligent, flexible',
    bodyAreas: ['Right wrist', 'Neck', 'Shoulders', 'Fingers'],
    generalEffect: 'Mercury moles relate to communication, commerce, learning, and quick intelligence.',
    auspiciousResult: 'Eloquence, business acumen, writing or speaking talent, successful trading.',
    challengingResult: 'Scattered thinking, deception in communication, nervous system sensitivity.',
  },
  {
    planet: 'Jupiter',
    sanskrit: 'Guru / Brihaspati',
    color: 'Yellow / Honey / Golden',
    colorHex: '#c9a84c',
    quality: 'Expansive, wise, generous, dharmic',
    bodyAreas: ['Right eyebrow', 'Navel', 'Right thigh', 'Right foot'],
    generalEffect: 'Jupiter moles are among the most auspicious — they relate to wisdom, prosperity, spirituality, and blessings.',
    auspiciousResult: 'Higher wisdom, financial prosperity, spiritual growth, excellent teachers or guides.',
    challengingResult: 'Over-expansion, liver or digestion issues, religious dogmatism.',
  },
  {
    planet: 'Venus',
    sanskrit: 'Shukra',
    color: 'White / Pink / Light Red',
    colorHex: '#e8a0a0',
    quality: 'Sensual, artistic, pleasure-loving',
    bodyAreas: ['Nose', 'Lips', 'Right cheek', 'Lower back'],
    generalEffect: 'Venus moles relate to love, beauty, luxury, creativity, and pleasures of life.',
    auspiciousResult: 'Artistic gifts, charming personality, romantic success, material comforts.',
    challengingResult: 'Overindulgence, unstable relationships, kidney or reproductive health concerns.',
  },
  {
    planet: 'Saturn',
    sanskrit: 'Shani',
    color: 'Black / Dark Blue',
    colorHex: '#2a3a5a',
    quality: 'Disciplined, karmic, slow, enduring',
    bodyAreas: ['Left shoulder', 'Upper back', 'Left knee', 'Soles'],
    generalEffect: 'Saturn moles are deeply karmic — they indicate lessons, burdens, and eventual wisdom through hardship.',
    auspiciousResult: 'Extraordinary discipline and endurance, success in law or service, long-lasting achievements.',
    challengingResult: 'Chronic health issues, delays, loneliness, problems with servants or employees.',
  },
  {
    planet: 'Rahu (North Node)',
    sanskrit: 'Rahu',
    color: 'Black / Dark Smoky',
    colorHex: '#1a1a2e',
    quality: 'Shadowy, karmic, unconventional',
    bodyAreas: ['Crown of head', 'Unusual body locations', 'Hidden areas'],
    generalEffect: 'Rahu moles are unusual in placement or appearance. They indicate strong karmic pull toward unconventional paths.',
    auspiciousResult: 'Exceptional rise in life through unconventional means; foreign connections and sudden fortunes.',
    challengingResult: 'Obsession, deception, confusion, and sudden reversals of fortune.',
  },
  {
    planet: 'Ketu (South Node)',
    sanskrit: 'Ketu',
    color: 'Ash / Grey / Smoky Red',
    colorHex: '#7a6a5a',
    quality: 'Spiritualizing, detaching, past-karmic',
    bodyAreas: ['Base of spine', 'Feet', 'Below navel'],
    generalEffect: 'Ketu moles relate to past-life karma, spiritual gifts, and a tendency toward detachment from material life.',
    auspiciousResult: 'Deep spiritual insight, healing gifts, psychic sensitivity, liberation-oriented life.',
    challengingResult: 'Detachment from worldly success, mysterious ailments, difficulty in family relationships.',
  },
];
