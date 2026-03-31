export interface TilShape {
  shape: string;
  sanskrit: string;
  meaning: string;
  quality: 'auspicious' | 'challenging' | 'neutral' | 'mixed';
  icon: string;
}

export const SHAPES: TilShape[] = [
  {
    shape: 'Round / Circular',
    sanskrit: 'Vritta',
    meaning: 'Completeness, prosperity, and good fortune. The best shape for a mole — indicates a well-rounded life with few serious obstacles.',
    quality: 'auspicious',
    icon: '●',
  },
  {
    shape: 'Oval',
    sanskrit: 'Dirgha Vritta',
    meaning: 'Similar to round but slightly more elongated energy. Steady prosperity and a calm temperament.',
    quality: 'auspicious',
    icon: '⬭',
  },
  {
    shape: 'Square / Rectangular',
    sanskrit: 'Chaturbhuja',
    meaning: 'Discipline, structure, and hard-earned success. Indicates a methodical person who builds slowly but securely.',
    quality: 'neutral',
    icon: '■',
  },
  {
    shape: 'Triangular',
    sanskrit: 'Tribhuja',
    meaning: 'Ambiguous results — the person may experience both great success and notable setbacks in the same life domain.',
    quality: 'mixed',
    icon: '▲',
  },
  {
    shape: 'Irregular / Jagged',
    sanskrit: 'Vishama',
    meaning: 'Unstable energy in that area of life. Frequent changes, unpredictability, and potential health sensitivity at the site.',
    quality: 'challenging',
    icon: '⬟',
  },
  {
    shape: 'Star-shaped / Radiating',
    sanskrit: 'Tara Akara',
    meaning: 'Very rare. Exceptional talent and recognition — the person may achieve fame or great distinction.',
    quality: 'auspicious',
    icon: '★',
  },
  {
    shape: 'Elongated / Linear',
    sanskrit: 'Rekha',
    meaning: 'More a line than a mole. Indicates a narrow but intense focus — success in one specific area, at the cost of others.',
    quality: 'mixed',
    icon: '▬',
  },
  {
    shape: 'Paired / Clustered',
    sanskrit: 'Yugma',
    meaning: 'Two or more moles close together. Doubles the effect — both blessings and challenges in the indicated domain are amplified.',
    quality: 'mixed',
    icon: '⠿',
  },
];
