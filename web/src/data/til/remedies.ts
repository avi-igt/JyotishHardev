export interface TilRemedy {
  planet: string;
  forMoles: string;
  mantra: string;
  gemstone: string;
  charity: string;
  ritual: string;
  dayOfWeek: string;
}

export const REMEDIES: TilRemedy[] = [
  {
    planet: 'Sun (Surya)',
    forMoles: 'Reddish moles causing ego conflicts, eye or heart concerns, or difficulties with authority.',
    mantra: 'Om Hraam Hreem Hraum Sah Suryaya Namah (108 times at sunrise)',
    gemstone: 'Ruby (Manikya) in gold, worn on ring finger of right hand',
    charity: 'Donate wheat, red cloth, jaggery, or copper items to a brahmin on Sunday',
    ritual: 'Offer water with red sandalwood and flowers to the rising Sun. Recite Aditya Hridayam.',
    dayOfWeek: 'Sunday',
  },
  {
    planet: 'Moon (Chandra)',
    forMoles: 'White or pale moles causing emotional instability, mental unrest, or water-related health concerns.',
    mantra: 'Om Shraam Shreem Shraum Sah Chandraya Namah (108 times on Monday evening)',
    gemstone: 'Pearl (Moti) in silver, worn on little finger of right hand',
    charity: 'Donate white rice, milk, white clothes, or silver to a brahmin on Monday',
    ritual: 'Fast on Mondays. Offer raw milk and white flowers to Lord Shiva. Worship the Moon on Purnima.',
    dayOfWeek: 'Monday',
  },
  {
    planet: 'Mars (Mangal)',
    forMoles: 'Red or dark moles causing anger, accidents, sibling conflict, or blood-related concerns.',
    mantra: 'Om Kraam Kreem Kraum Sah Bhaumaya Namah (108 times on Tuesday)',
    gemstone: 'Red Coral (Moonga) in copper or gold, worn on ring finger of right hand',
    charity: 'Donate red lentils, red cloth, or copper items on Tuesday. Feed monkeys.',
    ritual: 'Visit Hanuman temple on Tuesdays. Recite Hanuman Chalisa. Offer sindoor to Hanuman.',
    dayOfWeek: 'Tuesday',
  },
  {
    planet: 'Mercury (Budha)',
    forMoles: 'Green or mixed moles causing communication problems, nervous concerns, or business obstacles.',
    mantra: 'Om Braam Breem Braum Sah Budhaya Namah (108 times on Wednesday)',
    gemstone: 'Emerald (Panna) in gold, worn on little finger of right hand',
    charity: 'Donate green vegetables, green cloth, or books on Wednesday. Feed birds.',
    ritual: 'Worship Lord Vishnu on Wednesdays. Recite Vishnu Sahasranama.',
    dayOfWeek: 'Wednesday',
  },
  {
    planet: 'Jupiter (Guru)',
    forMoles: 'Golden or yellow moles causing spiritual stagnation, liver concerns, or issues with teachers.',
    mantra: 'Om Graam Greem Graum Sah Gurave Namah (108 times on Thursday)',
    gemstone: 'Yellow Sapphire (Pukhraj) in gold, worn on index finger of right hand',
    charity: 'Donate yellow cloth, chana dal, turmeric, or gold on Thursday. Respect teachers.',
    ritual: 'Fast on Thursdays. Worship Lord Vishnu or Brihaspati. Offer yellow flowers.',
    dayOfWeek: 'Thursday',
  },
  {
    planet: 'Venus (Shukra)',
    forMoles: 'Light or pink moles causing relationship difficulties, kidney concerns, or over-indulgence.',
    mantra: 'Om Draam Dreem Draum Sah Shukraya Namah (108 times on Friday)',
    gemstone: 'Diamond (Heera) or White Sapphire in silver, worn on ring finger of right hand',
    charity: 'Donate white sweets, white rice, white cloth, or silver on Friday. Respect women.',
    ritual: 'Worship Goddess Lakshmi on Fridays. Offer white flowers and light a ghee lamp.',
    dayOfWeek: 'Friday',
  },
  {
    planet: 'Saturn (Shani)',
    forMoles: 'Black or blue moles causing chronic difficulties, delays, or karmic burdens.',
    mantra: 'Om Praam Preem Praum Sah Shanaischaraya Namah (108 times on Saturday)',
    gemstone: 'Blue Sapphire (Neelam) in iron or gold, worn on middle finger — always test for 3 days first',
    charity: 'Donate black sesame seeds, iron, black cloth, or oil on Saturday. Feed crows. Serve labourers.',
    ritual: 'Light sesame oil lamp under a Peepal tree on Saturday evenings. Recite Shani Stotra.',
    dayOfWeek: 'Saturday',
  },
  {
    planet: 'Rahu',
    forMoles: 'Dark smoky moles causing confusion, obsession, or sudden reversals.',
    mantra: 'Om Raam Rahave Namah (108 times on Saturday or at dusk)',
    gemstone: 'Hessonite (Gomed) in silver or gold, worn on middle finger',
    charity: 'Donate black or blue items on Saturday. Feed dark-coloured grains (urad dal).',
    ritual: 'Worship Durga or Kali. Recite Rahu Stotra. Donate to those of foreign origin.',
    dayOfWeek: 'Saturday',
  },
  {
    planet: 'Ketu',
    forMoles: 'Grey or ash moles causing spiritual confusion, mysterious ailments, or family disharmony.',
    mantra: 'Om Straam Streem Straum Sah Ketave Namah (108 times on Tuesday or Saturday)',
    gemstone: 'Cat\'s Eye (Lehsunia) in gold, worn on little finger — always consult an astrologer first',
    charity: 'Donate sesame, multi-coloured blankets, or dog food on Tuesday. Feed street dogs.',
    ritual: 'Worship Lord Ganesha or Skanda (Kartikeya). Recite Ketu Stotra. Perform Ketu Homa.',
    dayOfWeek: 'Tuesday / Saturday',
  },
];
