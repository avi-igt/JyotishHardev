export interface TilColor {
  color: string;
  hex: string;
  sanskrit: string;
  meaning: string;
  planet: string;
  quality: 'auspicious' | 'challenging' | 'neutral' | 'mixed';
}

export const COLORS: TilColor[] = [
  {
    color: 'Honey / Golden',
    hex: '#c9a84c',
    sanskrit: 'Madhu Varna',
    meaning: 'Wealth, intelligence, and good fortune. Indicates a blessed life with material and spiritual success.',
    planet: 'Jupiter (Guru)',
    quality: 'auspicious',
  },
  {
    color: 'Red / Reddish-Brown',
    hex: '#9b4435',
    sanskrit: 'Rakta Varna',
    meaning: 'Courage, ambition, and strong vital energy. Can bring success through effort and boldness.',
    planet: 'Mars (Mangal)',
    quality: 'auspicious',
  },
  {
    color: 'White / Cream',
    hex: '#f5f0e8',
    sanskrit: 'Shukla Varna',
    meaning: 'Extremely rare and highly auspicious. Purity, divine grace, spiritual gifts, and lasting prosperity.',
    planet: 'Moon (Chandra) / Venus (Shukra)',
    quality: 'auspicious',
  },
  {
    color: 'Black',
    hex: '#2a2a3a',
    sanskrit: 'Krishna Varna',
    meaning: 'Karmic weight and intensity. Can indicate challenges, obstacles, or powerful destiny — results depend heavily on location and size.',
    planet: 'Saturn (Shani) / Rahu',
    quality: 'mixed',
  },
  {
    color: 'Blue / Blue-Grey',
    hex: '#5a6a8a',
    sanskrit: 'Nila Varna',
    meaning: 'Hardship, delay, and struggle. Often indicates a person who must work hard to overcome obstacles. Spiritual growth through difficulty.',
    planet: 'Saturn (Shani)',
    quality: 'challenging',
  },
  {
    color: 'Green',
    hex: '#4a7a5a',
    sanskrit: 'Harita Varna',
    meaning: 'Growth, creativity, and healing gifts. Uncommon — often indicates artistic or medical talents.',
    planet: 'Mercury (Budha)',
    quality: 'auspicious',
  },
  {
    color: 'Dark Brown',
    hex: '#6b4226',
    sanskrit: 'Shyama Varna',
    meaning: 'Moderate results — neither strongly auspicious nor challenging. Steadiness and persistence.',
    planet: 'Earth (Prithvi tatva)',
    quality: 'neutral',
  },
];
