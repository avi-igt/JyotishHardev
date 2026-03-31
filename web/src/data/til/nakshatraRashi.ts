export interface NakshatraTil {
  nakshatra: string;
  number: number;
  lord: string;
  tilMeaning: string;
  auspiciousArea: string;
}

export const NAKSHATRA_TILS: NakshatraTil[] = [
  { nakshatra: 'Ashwini', number: 1, lord: 'Ketu', tilMeaning: 'Moles at the temples or nose indicate healing gifts and a swift, pioneering nature.', auspiciousArea: 'Head, temples' },
  { nakshatra: 'Bharani', number: 2, lord: 'Venus', tilMeaning: 'Moles near the brow or throat reveal intensity of feeling, creative power, and karmic depth.', auspiciousArea: 'Forehead, throat' },
  { nakshatra: 'Krittika', number: 3, lord: 'Sun', tilMeaning: 'Moles at the neck or right shoulder indicate cutting intellect and strong determination.', auspiciousArea: 'Neck, shoulders' },
  { nakshatra: 'Rohini', number: 4, lord: 'Moon', tilMeaning: 'Moles on the throat, chin, or left cheek suggest charm, artistic ability, and material prosperity.', auspiciousArea: 'Throat, chin' },
  { nakshatra: 'Mrigashira', number: 5, lord: 'Mars', tilMeaning: 'Moles on the arms or chest indicate restless seeking, curiosity, and versatile intelligence.', auspiciousArea: 'Arms, chest' },
  { nakshatra: 'Ardra', number: 6, lord: 'Rahu', tilMeaning: 'Moles near the eyes or on the shoulders indicate storm-weathering resilience and intense emotional depth.', auspiciousArea: 'Eyes, shoulders' },
  { nakshatra: 'Punarvasu', number: 7, lord: 'Jupiter', tilMeaning: 'Moles on the chest or right hand indicate renewal, hope, and blessed returns after hardship.', auspiciousArea: 'Chest, hands' },
  { nakshatra: 'Pushya', number: 8, lord: 'Saturn', tilMeaning: 'Moles on the chest or mouth indicate nourishing, protective qualities and service orientation.', auspiciousArea: 'Chest, mouth' },
  { nakshatra: 'Ashlesha', number: 9, lord: 'Mercury', tilMeaning: 'Moles near the neck or on the left hand indicate shrewdness, mystical knowledge, and a penetrating mind.', auspiciousArea: 'Neck, hands' },
  { nakshatra: 'Magha', number: 10, lord: 'Ketu', tilMeaning: 'Moles on the right shoulder or chest indicate ancestral power, leadership, and royal bearing.', auspiciousArea: 'Chest, right shoulder' },
  { nakshatra: 'Purva Phalguni', number: 11, lord: 'Venus', tilMeaning: 'Moles on the right thigh or lower back indicate pleasure-seeking, creative gifts, and romantic success.', auspiciousArea: 'Thighs, lower back' },
  { nakshatra: 'Uttara Phalguni', number: 12, lord: 'Sun', tilMeaning: 'Moles on the right arm or upper back indicate contracts, partnerships, and steady achievement.', auspiciousArea: 'Arms, upper back' },
  { nakshatra: 'Hasta', number: 13, lord: 'Moon', tilMeaning: 'Moles on the hands or fingers indicate skilled craftsmanship, healing touch, and dexterity.', auspiciousArea: 'Hands, fingers' },
  { nakshatra: 'Chitra', number: 14, lord: 'Mars', tilMeaning: 'Moles near the navel or chest indicate brilliant artistry, architectural sense, and beauty consciousness.', auspiciousArea: 'Navel, chest' },
  { nakshatra: 'Swati', number: 15, lord: 'Rahu', tilMeaning: 'Moles on the left arm or chest indicate independence, diplomatic skill, and adaptability to change.', auspiciousArea: 'Arms, chest' },
  { nakshatra: 'Vishakha', number: 16, lord: 'Jupiter', tilMeaning: 'Moles at the left eyebrow or abdomen indicate intense focus, ambition, and eventual triumph.', auspiciousArea: 'Eyebrow, abdomen' },
  { nakshatra: 'Anuradha', number: 17, lord: 'Saturn', tilMeaning: 'Moles on the chest or right knee indicate devotion, friendship, and patience under pressure.', auspiciousArea: 'Chest, knee' },
  { nakshatra: 'Jyeshtha', number: 18, lord: 'Mercury', tilMeaning: 'Moles on the neck or left shoulder indicate protective strength, elder responsibility, and hidden authority.', auspiciousArea: 'Neck, shoulders' },
  { nakshatra: 'Mula', number: 19, lord: 'Ketu', tilMeaning: 'Moles at the base of the spine or feet indicate deep root-seeking, philosophical questioning, and transformation.', auspiciousArea: 'Lower back, feet' },
  { nakshatra: 'Purva Ashadha', number: 20, lord: 'Venus', tilMeaning: 'Moles on the thighs or lower back indicate invincibility of spirit, creative wealth, and water-related fortune.', auspiciousArea: 'Thighs, lower back' },
  { nakshatra: 'Uttara Ashadha', number: 21, lord: 'Sun', tilMeaning: 'Moles on the right knee or upper back indicate final victory through perseverance and ethical conduct.', auspiciousArea: 'Knees, back' },
  { nakshatra: 'Shravana', number: 22, lord: 'Moon', tilMeaning: 'Moles on the ears or left foot indicate a great listener, knowledge seeker, and one who learns through receptivity.', auspiciousArea: 'Ears, feet' },
  { nakshatra: 'Dhanishtha', number: 23, lord: 'Mars', tilMeaning: 'Moles on the right ankle or lower leg indicate rhythm, music, and swift accumulation of wealth.', auspiciousArea: 'Ankles, lower legs' },
  { nakshatra: 'Shatabhisha', number: 24, lord: 'Rahu', tilMeaning: 'Moles on the right ankle or calf indicate healing power, solitude, and esoteric knowledge.', auspiciousArea: 'Calves, ankles' },
  { nakshatra: 'Purva Bhadrapada', number: 25, lord: 'Jupiter', tilMeaning: 'Moles near the left thigh or lower back indicate dual nature, intensity, and eventual spiritual purification.', auspiciousArea: 'Thighs, lower back' },
  { nakshatra: 'Uttara Bhadrapada', number: 26, lord: 'Saturn', tilMeaning: 'Moles on the left foot or sole indicate deep compassion, spiritual depth, and mastery over inner demons.', auspiciousArea: 'Feet, soles' },
  { nakshatra: 'Revati', number: 27, lord: 'Mercury', tilMeaning: 'Moles on the feet or soles indicate a soul completing a cycle — prosperous, nurturing, and spiritually blessed.', auspiciousArea: 'Feet, toes' },
];

export interface RashiTil {
  rashi: string;
  sign: string;
  lord: string;
  bodyPart: string;
  tilMeaning: string;
}

export const RASHI_TILS: RashiTil[] = [
  { rashi: 'Mesha (Aries)', sign: '♈', lord: 'Mars', bodyPart: 'Head, face, forehead', tilMeaning: 'Moles in the face/head region carry Aries energy — initiative, leadership, and possible rashness.' },
  { rashi: 'Vrishabha (Taurus)', sign: '♉', lord: 'Venus', bodyPart: 'Throat, neck, lower face', tilMeaning: 'Moles at the throat or neck carry Taurus energy — sensuality, stubbornness, and material gifts.' },
  { rashi: 'Mithuna (Gemini)', sign: '♊', lord: 'Mercury', bodyPart: 'Shoulders, arms, hands', tilMeaning: 'Moles on shoulders/arms carry Gemini energy — duality, communication, and versatility.' },
  { rashi: 'Karka (Cancer)', sign: '♋', lord: 'Moon', bodyPart: 'Chest, breasts, stomach', tilMeaning: 'Moles on the chest/stomach carry Cancer energy — nurturing, emotional sensitivity, and home ties.' },
  { rashi: 'Simha (Leo)', sign: '♌', lord: 'Sun', bodyPart: 'Heart, upper back, spine', tilMeaning: 'Moles on the back/upper chest carry Leo energy — pride, generosity, and a love of recognition.' },
  { rashi: 'Kanya (Virgo)', sign: '♍', lord: 'Mercury', bodyPart: 'Abdomen, intestines, lower torso', tilMeaning: 'Moles near the navel/abdomen carry Virgo energy — precision, health consciousness, and service.' },
  { rashi: 'Tula (Libra)', sign: '♎', lord: 'Venus', bodyPart: 'Lower back, kidneys, hips', tilMeaning: 'Moles at the lower back/hips carry Libra energy — balance-seeking, relationship focus, and beauty.' },
  { rashi: 'Vrishchika (Scorpio)', sign: '♏', lord: 'Mars/Ketu', bodyPart: 'Genitals, reproductive area, colon', tilMeaning: 'Moles in the pelvic area carry Scorpio energy — intensity, transformation, and hidden power.' },
  { rashi: 'Dhanu (Sagittarius)', sign: '♐', lord: 'Jupiter', bodyPart: 'Thighs, hips, sciatic nerve', tilMeaning: 'Moles on the thighs carry Sagittarius energy — philosophy, travel, and expansive fortune.' },
  { rashi: 'Makara (Capricorn)', sign: '♑', lord: 'Saturn', bodyPart: 'Knees, skin, skeletal system', tilMeaning: 'Moles on/near the knees carry Capricorn energy — discipline, ambition, and karmic duty.' },
  { rashi: 'Kumbha (Aquarius)', sign: '♒', lord: 'Saturn/Rahu', bodyPart: 'Calves, ankles, circulatory', tilMeaning: 'Moles on the calves/ankles carry Aquarius energy — humanitarianism, eccentricity, and reform.' },
  { rashi: 'Meena (Pisces)', sign: '♓', lord: 'Jupiter/Ketu', bodyPart: 'Feet, toes, lymphatic system', tilMeaning: 'Moles on the feet carry Pisces energy — spirituality, compassion, and dissolution of ego.' },
];
