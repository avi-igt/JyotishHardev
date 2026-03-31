export interface TilCombination {
  name: string;
  description: string;
  result: string;
  type: 'wealth' | 'wisdom' | 'karma' | 'health' | 'relationships' | 'spiritual';
}

export const COMBINATIONS: TilCombination[] = [
  {
    name: 'Lakshmi Yoga',
    description: 'A golden or honey-coloured mole on the right hand or right palm.',
    result: 'Exceptional financial prosperity throughout life. The person accumulates wealth through skill and grace.',
    type: 'wealth',
  },
  {
    name: 'Saraswati Yoga',
    description: 'A light-coloured mole on the tongue or near the lips, combined with a mole near the right ear.',
    result: 'Extraordinary eloquence, artistic or academic excellence. May become a teacher, writer, or orator of distinction.',
    type: 'wisdom',
  },
  {
    name: 'Raja Yoga',
    description: 'A round, raised, reddish mole at the centre of the forehead (between the brows).',
    result: 'Marks a person of high authority. Leadership comes naturally. Associated with government, administration, and public recognition.',
    type: 'wealth',
  },
  {
    name: 'Mangal Dosha Indicator',
    description: 'A dark or black mole on the left side of the chin combined with one on the right shoulder (for men).',
    result: 'Potential for marital friction. Suggests the need for careful partner selection and possible remedies before marriage.',
    type: 'relationships',
  },
  {
    name: 'Gyana Yoga',
    description: 'A mole on the right eyebrow combined with one near the navel.',
    result: 'Deep philosophical intelligence and spiritual wisdom. The person is sought for guidance; may become a spiritual teacher.',
    type: 'wisdom',
  },
  {
    name: 'Karma Bandhan',
    description: 'Multiple small black moles clustering on the back (especially upper back).',
    result: 'Heavy karmic weight from past lives. Life carries significant responsibilities and tests. Spiritual practice is strongly advised.',
    type: 'karma',
  },
  {
    name: 'Dhana Yoga',
    description: 'A mole on the right thigh, golden or reddish, combined with one near the navel.',
    result: 'Abundance through righteous effort. Wealth accumulated in the second half of life. Often inherits property.',
    type: 'wealth',
  },
  {
    name: 'Vyana Vata Indicator',
    description: 'Several blue-grey moles on the limbs (arms or legs).',
    result: 'Possible circulatory or nervous system sensitivity. Health vigilance is recommended, especially in cold climates.',
    type: 'health',
  },
  {
    name: 'Moksha Yoga',
    description: 'A white or very pale mole at the sole of the right foot (for men) or left foot (for women).',
    result: 'A soul inclined toward liberation. Spiritual seeking drives life choices. May renounce the world or live semi-ascetically.',
    type: 'spiritual',
  },
  {
    name: 'Pitra Dosha Indicator',
    description: 'A dark mole on the right shoulder combined with one on the left ankle.',
    result: 'Suggests ancestral karma that needs attention. Pitru Paksha rituals and ancestor reverence are recommended.',
    type: 'karma',
  },
  {
    name: 'Vivah Sukha Yoga',
    description: 'A honey or reddish mole on the right cheek (for men) or left cheek (for women).',
    result: 'A happy and harmonious marriage. The person is warmly loved by their partner and has a stable family life.',
    type: 'relationships',
  },
  {
    name: 'Vak Siddhi',
    description: 'A small, clean mole right on the tongue.',
    result: 'Extremely rare. Indicates that the person\'s words carry unusual power — promises made come true, blessings given have effect.',
    type: 'spiritual',
  },
];
