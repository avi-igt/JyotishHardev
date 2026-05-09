/**
 * /nakshatras/[slug] — Individual nakshatra detail pages (SSG).
 */
import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NakshatraData {
  slug: string;
  name: string;
  symbol: string;
  ruling_planet: string;
  deity: string;
  element: string;
  rashi: string;
  pada: string;
  traits: string[];
  strengths: string;
  challenges: string;
  compatible: string[];
  compatible_slugs: string[];
  general: string;
}

// ─── Static data for all 27 Nakshatras ───────────────────────────────────────

const NAKSHATRAS: Record<string, NakshatraData> = {
  ashwini: {
    slug: 'ashwini',
    name: 'Ashwini',
    symbol: "Horse's head",
    ruling_planet: 'Ketu',
    deity: 'Ashwini Kumaras',
    element: 'Fire',
    rashi: 'Mesha',
    pada: '1–4 (0°–13°20\' Mesha)',
    traits: ['Swift', 'Pioneering', 'Healing', 'Impulsive', 'Courageous'],
    strengths: 'Ashwini natives possess extraordinary speed of action and natural healing ability. They are among the first to respond in any crisis and carry an innate vitality that revitalises those around them. Leadership comes naturally, driven by enthusiasm rather than ego.',
    challenges: 'Impulsiveness can lead to poor decisions made in haste. Ashwini people often start many things and struggle to see them through, moving to the next excitement before completion. Learning patience and follow-through is the lifelong lesson.',
    compatible: ['Bharani', 'Hasta', 'Swati'],
    compatible_slugs: ['bharani', 'hasta', 'swati'],
    general: 'The first nakshatra, Ashwini marks the dawn of a new cycle. Its twin divine physicians symbolise the dual nature of healing — both swift relief and deep cure.',
  },
  bharani: {
    slug: 'bharani',
    name: 'Bharani',
    symbol: 'Yoni (vulva)',
    ruling_planet: 'Venus',
    deity: 'Yama',
    element: 'Earth',
    rashi: 'Mesha',
    pada: '5–7 (13°20\'–26°40\' Mesha)',
    traits: ['Creative', 'Disciplined', 'Intense', 'Responsible', 'Sensual'],
    strengths: 'Bharani natives carry tremendous creative and reproductive energy — they excel at bringing ideas, projects, and life itself into being. They are highly disciplined once committed and can shoulder immense responsibility. Their connection to life and death gives them unusual depth.',
    challenges: 'The influence of Yama, lord of death, can create difficulty with endings, guilt, and the burden of carrying others\' weight. Bharani people may struggle with extremes — overindulgence followed by severe restriction. Finding the middle path is essential.',
    compatible: ['Ashwini', 'Rohini', 'Anuradha'],
    compatible_slugs: ['ashwini', 'rohini', 'anuradha'],
    general: 'Bharani represents the transition between life and death, the womb that holds creation. It is associated with both fertile creativity and Yama\'s stern discipline over consequence.',
  },
  krittika: {
    slug: 'krittika',
    name: 'Krittika',
    symbol: 'Razor / flame',
    ruling_planet: 'Sun',
    deity: 'Agni',
    element: 'Fire',
    rashi: 'Vrishabha',
    pada: '8–10 (26°40\' Mesha – 10° Vrishabha)',
    traits: ['Sharp', 'Purifying', 'Ambitious', 'Determined', 'Critical'],
    strengths: 'Krittika natives are blessed with a razor-sharp intellect and the capacity to cut through deception and illusion. They are natural leaders with strong moral codes, driven by Agni\'s purifying fire to burn away the inessential. Their determination, once set, is formidable.',
    challenges: 'Agni\'s flame can burn indiscriminately. Krittika people may be overly critical of self and others, creating harshness in relationships. The tendency to see flaws clearly can lead to perfectionism that isolates. Cultivating warmth alongside sharpness is essential.',
    compatible: ['Rohini', 'Punarvasu', 'Uttara Phalguni'],
    compatible_slugs: ['rohini', 'punarvasu', 'uttara-phalguni'],
    general: 'The six sisters of the Pleiades, Krittika is the nakshatra that raised Karttikeya, the divine warrior. Fire here is both creative and destructive — always purposeful.',
  },
  rohini: {
    slug: 'rohini',
    name: 'Rohini',
    symbol: 'Cart / chariot',
    ruling_planet: 'Moon',
    deity: 'Brahma',
    element: 'Earth',
    rashi: 'Vrishabha',
    pada: '11–14 (10°–23°20\' Vrishabha)',
    traits: ['Fertile', 'Beautiful', 'Magnetic', 'Steady', 'Sensual'],
    strengths: 'Rohini is considered the most exalted of nakshatras and the favourite of the Moon. Natives have exceptional beauty, charm, and magnetic appeal. They excel in arts, agriculture, and anything involving growth and material abundance. Their calm steadiness makes them deeply trustworthy.',
    challenges: 'Rohini\'s love of beauty and comfort can tip into attachment and possessiveness. The Moon\'s favourite has a tendency to be spoiled or overly dependent on pleasures. Jealousy and over-attachment in relationships are patterns to address.',
    compatible: ['Mrigashira', 'Hasta', 'Shravana'],
    compatible_slugs: ['mrigashira', 'hasta', 'shravana'],
    general: 'The Moon is at home in Rohini, making it the most fruitful and auspicious of all nakshatras. Brahma chose Rohini from the 27 wives of the Moon as his eternal beloved.',
  },
  mrigashira: {
    slug: 'mrigashira',
    name: 'Mrigashira',
    symbol: "Deer's head",
    ruling_planet: 'Mars',
    deity: 'Soma',
    element: 'Air',
    rashi: 'Mithuna',
    pada: '15–17 (23°20\' Vrishabha – 6°40\' Mithuna)',
    traits: ['Gentle', 'Curious', 'Searching', 'Restless', 'Perceptive'],
    strengths: 'Mrigashira natives have beautiful, gentle minds always in search of the sublime. They are gifted with sensitivity and a poetic, wandering intelligence that makes them excellent researchers, writers, and spiritual seekers. Their restlessness drives discovery.',
    challenges: 'The eternal search of the deer means Mrigashira people often cannot settle — in relationships, careers, or beliefs. Anxiety and inability to rest in the present moment are recurring patterns. Learning that the destination is within, not ahead, is transformative.',
    compatible: ['Rohini', 'Chitra', 'Dhanishtha'],
    compatible_slugs: ['rohini', 'chitra', 'dhanishtha'],
    general: 'The head of the deer searches eternally for Soma, the divine nectar. This nakshatra is associated with seeking, beauty, and the bittersweet nature of longing.',
  },
  ardra: {
    slug: 'ardra',
    name: 'Ardra',
    symbol: 'Teardrop / diamond',
    ruling_planet: 'Rahu',
    deity: 'Rudra',
    element: 'Air',
    rashi: 'Mithuna',
    pada: '18–20 (6°40\'–20° Mithuna)',
    traits: ['Intense', 'Transformative', 'Analytical', 'Stormy', 'Empathetic'],
    strengths: 'Ardra natives are forged in storms — they have extraordinary resilience and the unique ability to rebuild after catastrophe. Their analytical mind powered by Rahu\'s expansiveness gives them unusual problem-solving skills. Deep empathy comes from having weathered their own tears.',
    challenges: 'The storm of Rudra can make Ardra natives destructive, either to themselves or their environments when under pressure. Emotional turbulence and difficulty controlling the mind during crises are recurring themes. Grounding practices are essential.',
    compatible: ['Punarvasu', 'Swati', 'Shatabhisha'],
    compatible_slugs: ['punarvasu', 'swati', 'shatabhisha'],
    general: 'Ardra\'s teardrop holds both grief and the diamond clarity that comes after — Rudra\'s tempest clears the old to make way for the completely new.',
  },
  punarvasu: {
    slug: 'punarvasu',
    name: 'Punarvasu',
    symbol: 'Quiver of arrows',
    ruling_planet: 'Jupiter',
    deity: 'Aditi',
    element: 'Water',
    rashi: 'Karka',
    pada: '21–24 (20° Mithuna – 3°20\' Karka)',
    traits: ['Philosophical', 'Benevolent', 'Resilient', 'Optimistic', 'Spiritual'],
    strengths: 'Punarvasu embodies the capacity for renewal and return to goodness. Jupiter\'s wisdom and Aditi\'s boundless motherly grace give these natives a remarkable ability to bounce back and find the light after any darkness. They are natural teachers and optimistic guides.',
    challenges: 'The expansiveness of Jupiter in Punarvasu can lead to overcommitment and scattering of energy. These natives may promise more than they deliver, not from dishonesty but from an abundance of enthusiasm that exceeds capacity. Focus and follow-through need cultivation.',
    compatible: ['Krittika', 'Ardra', 'Vishakha'],
    compatible_slugs: ['krittika', 'ardra', 'vishakha'],
    general: 'Punar means "again" and vasu means "good" — this is the nakshatra of return to goodness, hosted by Aditi, the infinite mother of all gods.',
  },
  pushya: {
    slug: 'pushya',
    name: 'Pushya',
    symbol: 'Flower / circle',
    ruling_planet: 'Saturn',
    deity: 'Brihaspati',
    element: 'Water',
    rashi: 'Karka',
    pada: '25–27 (3°20\'–16°40\' Karka)',
    traits: ['Nourishing', 'Devoted', 'Wise', 'Patient', 'Generous'],
    strengths: 'Pushya is considered the most auspicious nakshatra in all of Jyotish. Its natives carry an extraordinary capacity for nourishment — they feed the world with food, knowledge, and love. Saturn\'s discipline combined with Brihaspati\'s wisdom creates patient, principled individuals who build lasting legacies.',
    challenges: 'Pushya\'s tendency toward self-sacrifice can tip into martyrdom. These natives must guard against giving so much that nothing remains for themselves. Saturn\'s influence can also create excessive caution and resistance to necessary change.',
    compatible: ['Rohini', 'Punarvasu', 'Anuradha'],
    compatible_slugs: ['rohini', 'punarvasu', 'anuradha'],
    general: 'Pushya means "to nourish" — it is the flower of the zodiac, blooming with abundance and spiritual sustenance. Brihaspati, teacher of the gods, presides here.',
  },
  ashlesha: {
    slug: 'ashlesha',
    name: 'Ashlesha',
    symbol: 'Coiled serpent',
    ruling_planet: 'Mercury',
    deity: 'Naga',
    element: 'Water',
    rashi: 'Karka',
    pada: '28–30 (16°40\'–30° Karka)',
    traits: ['Mystical', 'Perceptive', 'Penetrating', 'Secretive', 'Hypnotic'],
    strengths: 'Ashlesha natives possess an almost supernatural perceptiveness — they read people and situations with uncanny accuracy. Their serpentine wisdom gives access to hidden knowledge, making them excellent healers, researchers, and psychologists. When they trust and deploy their gift, it is unparalleled.',
    challenges: 'The serpent\'s embrace can become a stranglehold. Ashlesha people may struggle with manipulation, either receiving or unconsciously giving it. Jealousy, possessiveness, and secretiveness can undermine relationships. Transparency is the antidote.',
    compatible: ['Punarvasu', 'Jyeshtha', 'Revati'],
    compatible_slugs: ['punarvasu', 'jyeshtha', 'revati'],
    general: 'The coiled serpent of Ashlesha holds the kundalini energy — dormant power that can either poison or enlighten. The Nagas are guardians of hidden wisdom.',
  },
  magha: {
    slug: 'magha',
    name: 'Magha',
    symbol: 'Throne / palanquin',
    ruling_planet: 'Ketu',
    deity: 'Pitras',
    element: 'Fire',
    rashi: 'Simha',
    pada: '1–4 (0°–13°20\' Simha)',
    traits: ['Regal', 'Authoritative', 'Traditional', 'Proud', 'Ancestral'],
    strengths: 'Magha natives carry the power of lineage and ancestral memory. They command authority naturally, as if born to the throne, and excel in positions of leadership, politics, and governance. Deep respect for tradition gives them a moral anchor that inspires loyalty in others.',
    challenges: 'The pride of royalty can become arrogance, making Magha people unwilling to accept criticism or change. An excessive focus on legacy and tradition may blind them to necessary innovation. Learning humility within greatness is the central challenge.',
    compatible: ['Purva Phalguni', 'Uttara Phalguni', 'Vishakha'],
    compatible_slugs: ['purva-phalguni', 'uttara-phalguni', 'vishakha'],
    general: 'Magha\'s throne is inherited from the ancestors — the Pitras (forebears) preside here, reminding us that we stand on the shoulders of those who came before.',
  },
  'purva-phalguni': {
    slug: 'purva-phalguni',
    name: 'Purva Phalguni',
    symbol: 'Hammock / bed',
    ruling_planet: 'Venus',
    deity: 'Bhaga',
    element: 'Fire',
    rashi: 'Simha',
    pada: '5–8 (13°20\'–26°40\' Simha)',
    traits: ['Creative', 'Pleasure-seeking', 'Romantic', 'Artistic', 'Generous'],
    strengths: 'Purva Phalguni natives are endowed with extraordinary creative gifts and a magnetic, pleasure-loving nature. They attract abundance, admirers, and artistic recognition naturally. Their generosity and warmth make them beloved. Bhaga\'s blessings manifest as material prosperity and romantic fulfilment.',
    challenges: 'Indulgence is the primary pitfall — these natives can overdo pleasure, luxury, and romance to the point of neglect of responsibilities. Laziness, hedonism, and avoidance of difficult work are patterns to overcome. Discipline applied to their gifts yields spectacular results.',
    compatible: ['Magha', 'Swati', 'Purva Ashadha'],
    compatible_slugs: ['magha', 'swati', 'purva-ashadha'],
    general: 'The hammock of Bhaga invites rest, pleasure, and creative recharge — Purva Phalguni is the middle pause before striving, the sweet exhale of creative satisfaction.',
  },
  'uttara-phalguni': {
    slug: 'uttara-phalguni',
    name: 'Uttara Phalguni',
    symbol: 'Four legs of a bed',
    ruling_planet: 'Sun',
    deity: 'Aryaman',
    element: 'Earth',
    rashi: 'Kanya',
    pada: '9–12 (26°40\' Simha – 10° Kanya)',
    traits: ['Loyal', 'Social', 'Helpful', 'Principled', 'Responsible'],
    strengths: 'Uttara Phalguni natives make extraordinary friends, partners, and community leaders. Aryaman\'s patronage of unions and social contracts makes them gifted at building lasting relationships — in marriage, business, and governance. Their sense of duty and generosity is unwavering.',
    challenges: 'The deep desire for partnership can lead to co-dependency or fear of solitude. Uttara Phalguni people may neglect their own needs in service to others. Learning to stand independently before uniting is an important developmental step.',
    compatible: ['Krittika', 'Hasta', 'Chitra'],
    compatible_slugs: ['krittika', 'hasta', 'chitra'],
    general: 'Where Purva Phalguni rests, Uttara Phalguni rises to serve. Aryaman, patron of friendship and social bonds, presides over unions and their sacred obligations.',
  },
  hasta: {
    slug: 'hasta',
    name: 'Hasta',
    symbol: 'Hand',
    ruling_planet: 'Moon',
    deity: 'Savitar',
    element: 'Earth',
    rashi: 'Kanya',
    pada: '13–15 (10°–23°20\' Kanya)',
    traits: ['Skilled', 'Dexterous', 'Charming', 'Clever', 'Healing'],
    strengths: 'Hasta is the hand of the Sun god Savitar — natives are blessed with extraordinary manual dexterity and practical intelligence. They excel at any craft requiring skill and precision. Their charm and wit make them socially adept, and their healing touch can manifest literally as gifted therapists, surgeons, or artists.',
    challenges: 'Hasta\'s cleverness can shade into manipulation when insecure. These natives may use their dexterity and wit to trick or avoid rather than engage honestly. Emotional instability (lunar influence) needs grounding through regular creative practice.',
    compatible: ['Rohini', 'Uttara Phalguni', 'Anuradha'],
    compatible_slugs: ['rohini', 'uttara-phalguni', 'anuradha'],
    general: 'Savitar\'s golden hand blesses Hasta with the power to create and heal. The five fingers represent the five elements that craft holds in mastery.',
  },
  chitra: {
    slug: 'chitra',
    name: 'Chitra',
    symbol: 'Pearl / bright jewel',
    ruling_planet: 'Mars',
    deity: 'Vishvakarma',
    element: 'Air',
    rashi: 'Tula',
    pada: '16–19 (23°20\' Kanya – 6°40\' Tula)',
    traits: ['Creative', 'Beautiful', 'Perceptive', 'Ambitious', 'Perfectionist'],
    strengths: 'Vishvakarma, the divine architect, gifts Chitra natives with exceptional aesthetic sense and creative brilliance. They see beauty in everything and have the talent to manifest it into reality. Architecture, design, jewellery, film, and any visual art call strongly to them. Their drive for perfection produces luminous work.',
    challenges: 'The pursuit of the brilliant ideal can lead to perfectionist paralysis or pride in one\'s own creations. Chitra natives may be overly focused on surface beauty at the expense of depth. Relationships can suffer if admiration replaces genuine connection.',
    compatible: ['Mrigashira', 'Uttara Phalguni', 'Swati'],
    compatible_slugs: ['mrigashira', 'uttara-phalguni', 'swati'],
    general: 'The bright jewel of Chitra is the star Spica — one of the most luminous in the sky. Vishvakarma crafts the very universe, and Chitra natives carry that architect\'s eye.',
  },
  swati: {
    slug: 'swati',
    name: 'Swati',
    symbol: 'Sword / coral',
    ruling_planet: 'Rahu',
    deity: 'Vayu',
    element: 'Air',
    rashi: 'Tula',
    pada: '20–23 (6°40\'–20° Tula)',
    traits: ['Independent', 'Diplomatic', 'Flexible', 'Communicative', 'Wandering'],
    strengths: 'Swati\'s single star trembles gently like a sapling in the wind — and the tree that bends does not break. These natives are remarkably adaptable, charming, and independent. Their diplomatic intelligence and love of freedom make them natural traders, negotiators, and explorers. Vayu\'s breath carries their ideas far.',
    challenges: 'Swati\'s independence can tip into restlessness and commitment-avoidance. Rahu\'s influence amplifies ambition but can create ethical grey areas in pursuit of success. Grounding the airy Swati nature in discipline and loyalty deepens its full potential.',
    compatible: ['Ashwini', 'Ardra', 'Purva Phalguni'],
    compatible_slugs: ['ashwini', 'ardra', 'purva-phalguni'],
    general: 'The wind god Vayu governs Swati — the breath of life that moves between worlds. This nakshatra is associated with trade, travel, and the freedom to move independently.',
  },
  vishakha: {
    slug: 'vishakha',
    name: 'Vishakha',
    symbol: "Potter's wheel / triumphal arch",
    ruling_planet: 'Jupiter',
    deity: 'Indra-Agni',
    element: 'Water',
    rashi: 'Vrishchika',
    pada: '24–27 (20° Tula – 3°20\' Vrishchika)',
    traits: ['Purposeful', 'Determined', 'Dual-natured', 'Ambitious', 'Spiritual'],
    strengths: 'Vishakha natives have extraordinary focus and determination, striving toward their chosen goal with the patience of Jupiter and the fire of Indra-Agni combined. They can work for years on a single aspiration without losing heart. Spiritual and material ambitions coexist in their nature, making them unusually complete.',
    challenges: 'The dual rulership of Indra and Agni creates an internal conflict between material ambition and spiritual aspiration that must be consciously balanced. Vishakha people can become obsessive in pursuit, alienating others. The end must justify the means examination is important.',
    compatible: ['Punarvasu', 'Magha', 'Purva Phalguni'],
    compatible_slugs: ['punarvasu', 'magha', 'purva-phalguni'],
    general: 'The triumphal arch of Vishakha is built over years of patient effort. The twin deities Indra and Agni give both the fuel to strive and the wisdom to know what to strive for.',
  },
  anuradha: {
    slug: 'anuradha',
    name: 'Anuradha',
    symbol: 'Lotus flower',
    ruling_planet: 'Saturn',
    deity: 'Mitra',
    element: 'Water',
    rashi: 'Vrishchika',
    pada: '28–30 (3°20\'–16°40\' Vrishchika)',
    traits: ['Devoted', 'Friendly', 'Cooperative', 'Disciplined', 'Spiritual'],
    strengths: 'Anuradha is the nakshatra of devoted friendship. Mitra, the divine friend, blesses these natives with an unusual depth of loyalty and the capacity to build lasting alliances across all barriers. They combine Saturn\'s discipline with genuine warmth, creating tireless workers in service to their relationships and values.',
    challenges: 'The depth of devotion can lead to dependency or difficulty releasing relationships and situations that no longer serve growth. Saturn\'s heaviness in Vrishchika\'s depth can create periods of melancholy and isolation. Regular spiritual practice lifts these cycles considerably.',
    compatible: ['Bharani', 'Pushya', 'Hasta'],
    compatible_slugs: ['bharani', 'pushya', 'hasta'],
    general: 'Anuradha\'s lotus blooms in the darkest waters of Vrishchika — beauty and devotion arising from depth and challenge. Mitra means "friend" — this nakshatra values covenant above all.',
  },
  jyeshtha: {
    slug: 'jyeshtha',
    name: 'Jyeshtha',
    symbol: 'Circular amulet / umbrella',
    ruling_planet: 'Mercury',
    deity: 'Indra',
    element: 'Water',
    rashi: 'Vrishchika',
    pada: '31–33 (16°40\'–30° Vrishchika)',
    traits: ['Senior', 'Protective', 'Authoritative', 'Intelligent', 'Proud'],
    strengths: 'Jyeshtha means "eldest" — these natives carry the authority of the chief. Indra\'s protection gives them courage and command in any situation. Their intelligence (Mercury) combined with Scorpionic depth makes them formidable investigators, leaders, and protectors. People naturally look to them in times of crisis.',
    challenges: 'The pride of the eldest can become domineering. Jyeshtha natives may resist acknowledging others\' authority or accepting guidance. Jealousy of rivals and the burden of always needing to be the strongest can create significant stress and isolation.',
    compatible: ['Ashlesha', 'Vishakha', 'Revati'],
    compatible_slugs: ['ashlesha', 'vishakha', 'revati'],
    general: 'Indra, king of the gods, rules here — Jyeshtha holds the star Antares, heart of the scorpion, one of the four royal stars of the ancient sky. Authority and aloneness are intertwined.',
  },
  mula: {
    slug: 'mula',
    name: 'Mula',
    symbol: 'Tied bunch of roots',
    ruling_planet: 'Ketu',
    deity: 'Nirriti',
    element: 'Fire',
    rashi: 'Dhanu',
    pada: '1–4 (0°–13°20\' Dhanu)',
    traits: ['Investigative', 'Philosophical', 'Intense', 'Destructive', 'Rooted'],
    strengths: 'Mula\'s tied roots descend to the very core of existence — these natives have an extraordinary drive to understand origins, causes, and ultimate truths. Philosophically brilliant and fearless in their investigations, they make great researchers, physicians, scientists, and spiritual teachers. Ketu gives them access to profound past-life wisdom.',
    challenges: 'Nirriti, goddess of dissolution and calamity, brings significant challenges — Mula people may experience sudden uprooting events that force radical transformation. Destructive tendencies must be channelled toward what deserves to end rather than what nourishes. Attachment issues run deep.',
    compatible: ['Purva Ashadha', 'Uttara Ashadha', 'Jyeshtha'],
    compatible_slugs: ['purva-ashadha', 'uttara-ashadha', 'jyeshtha'],
    general: 'Mula is the galactic centre — the nakshatra through which our galaxy\'s heart is viewed. It represents the divine dissolution that enables a more fundamental rebirth.',
  },
  'purva-ashadha': {
    slug: 'purva-ashadha',
    name: 'Purva Ashadha',
    symbol: 'Elephant tusk / fan',
    ruling_planet: 'Venus',
    deity: 'Apah',
    element: 'Fire',
    rashi: 'Dhanu',
    pada: '5–8 (13°20\'–26°40\' Dhanu)',
    traits: ['Invincible', 'Bold', 'Expressive', 'Purifying', 'Confident'],
    strengths: 'Purva Ashadha means "early victory" — these natives are endowed with a natural charisma and invincible quality that helps them win even before the battle is fully joined. Apah\'s purifying waters grant them a fresh, optimistic clarity. Venus gives beauty of speech and artistic flair that moves others deeply.',
    challenges: 'The confidence of early victory can become arrogance, making these natives underestimate opponents and miss important preparation steps. Purva Ashadha people can be stubborn in their positions to a fault. Learning to absorb feedback without deflecting it takes conscious practice.',
    compatible: ['Purva Phalguni', 'Mula', 'Uttara Ashadha'],
    compatible_slugs: ['purva-phalguni', 'mula', 'uttara-ashadha'],
    general: 'Apah, the god of waters, brings purification and the early tide of victory. Purva Ashadha people move with the confidence of one who has already won in their heart.',
  },
  'uttara-ashadha': {
    slug: 'uttara-ashadha',
    name: 'Uttara Ashadha',
    symbol: 'Elephant tusk',
    ruling_planet: 'Sun',
    deity: 'Vishvadevas',
    element: 'Fire',
    rashi: 'Makara',
    pada: '9–12 (26°40\' Dhanu – 10° Makara)',
    traits: ['Victorious', 'Principled', 'Patient', 'Universal', 'Dharmic'],
    strengths: 'The ten Vishvadevas — universal gods — preside over Uttara Ashadha, giving these natives an exceptionally broad moral vision and sense of universal dharma. Their victories are final and enduring because they are built on right action rather than expedience. The combination of solar strength and Capricornian patience creates builders of empires.',
    challenges: 'Uttara Ashadha natives can be inflexible in their moral positions, making compromise in complex situations difficult. Their broad vision sometimes makes them poor at relating to specific individual needs. The weight of universal responsibility can become isolating.',
    compatible: ['Purva Ashadha', 'Shravana', 'Dhanishtha'],
    compatible_slugs: ['purva-ashadha', 'shravana', 'dhanishtha'],
    general: 'Where Purva Ashadha wins the first battle, Uttara Ashadha secures the final, lasting victory. The Vishvadevas govern the cosmic moral order that gives this victory its permanence.',
  },
  shravana: {
    slug: 'shravana',
    name: 'Shravana',
    symbol: 'Ear / three footprints of Vishnu',
    ruling_planet: 'Moon',
    deity: 'Vishnu',
    element: 'Earth',
    rashi: 'Makara',
    pada: '13–15 (10°–23°20\' Makara)',
    traits: ['Receptive', 'Learned', 'Connected', 'Compassionate', 'Generous'],
    strengths: 'Shravana means "to hear" — these natives have extraordinary receptivity and learning ability, absorbing wisdom from every source. Vishnu\'s preserving grace makes them natural connectors who hold communities together. They are compassionate listeners and generous teachers who use knowledge in service.',
    challenges: 'The receptive quality can become passive — Shravana people may struggle to form and assert their own opinions when they have absorbed so many. Gossip or spreading information without discernment is a negative expression of this listening nature. Boundaries around information are important.',
    compatible: ['Rohini', 'Uttara Ashadha', 'Revati'],
    compatible_slugs: ['rohini', 'uttara-ashadha', 'revati'],
    general: 'Vishnu\'s three cosmic strides mark the boundaries of the universe — Shravana natives hear the divine signal within all sounds and serve as bridges between the cosmic and the human.',
  },
  dhanishtha: {
    slug: 'dhanishtha',
    name: 'Dhanishtha',
    symbol: 'Drum / flute',
    ruling_planet: 'Mars',
    deity: 'Ashta Vasus',
    element: 'Air',
    rashi: 'Kumbha',
    pada: '16–19 (23°20\' Makara – 6°40\' Kumbha)',
    traits: ['Rhythmic', 'Wealthy', 'Communal', 'Energetic', 'Musical'],
    strengths: 'Dhanishtha means "most famous" or "the wealthiest" — these natives excel at creating abundance through community and collective action. The eight Vasus gift them with an extraordinary sense of rhythm, making them natural musicians, athletes, and community organisers. Mars gives the energy to execute what Jupiter\'s groups envision.',
    challenges: 'The gregarious nature of Dhanishtha can create difficulty with intimacy — these natives are often more comfortable in groups than in one-on-one depth. Materialism and the chase for wealth or fame can crowd out deeper spiritual development. Learning to value stillness amidst the rhythm is important.',
    compatible: ['Mrigashira', 'Uttara Ashadha', 'Shravana'],
    compatible_slugs: ['mrigashira', 'uttara-ashadha', 'shravana'],
    general: 'The drum beats of the Ashta Vasus create the rhythm of the cosmos — Dhanishtha people carry this collective heartbeat and broadcast it through community and abundance.',
  },
  shatabhisha: {
    slug: 'shatabhisha',
    name: 'Shatabhisha',
    symbol: 'Empty circle',
    ruling_planet: 'Rahu',
    deity: 'Varuna',
    element: 'Air',
    rashi: 'Kumbha',
    pada: '20–23 (6°40\'–20° Kumbha)',
    traits: ['Mystical', 'Healing', 'Solitary', 'Scientific', 'Independent'],
    strengths: 'Shatabhisha means "a hundred physicians" — these natives carry an innate healing intelligence that spans both the scientific and the mystical. Varuna, god of cosmic order and the ocean depths, gives them access to hidden laws of the universe. They are often brilliant in medicine, astrology, technology, and metaphysical systems.',
    challenges: 'Shatabhisha\'s empty circle represents a tendency toward isolation and secrecy that can become pathological. These natives may struggle to connect emotionally, preferring intellectual or abstract engagement. Rahu\'s influence amplifies obsessive patterns that need conscious monitoring.',
    compatible: ['Ardra', 'Swati', 'Purva Bhadrapada'],
    compatible_slugs: ['ardra', 'swati', 'purva-bhadrapada'],
    general: 'Varuna\'s domain is the cosmic ocean of consciousness — Shatabhisha is the great healer who enters that ocean alone and returns with cures for the world\'s thousand ailments.',
  },
  'purva-bhadrapada': {
    slug: 'purva-bhadrapada',
    name: 'Purva Bhadrapada',
    symbol: 'Sword / front of funeral cot',
    ruling_planet: 'Jupiter',
    deity: 'Aja Ekapada',
    element: 'Water',
    rashi: 'Meena',
    pada: '24–27 (20° Kumbha – 3°20\' Meena)',
    traits: ['Fiery', 'Transformative', 'Intense', 'Idealistic', 'Detached'],
    strengths: 'Purva Bhadrapada\'s fire burns in the waters of Meena — creating the paradox of intense spiritual transformation expressed through compassionate action. Aja Ekapada, the one-footed cosmic serpent, grants these natives the power of focused transformation. When aligned with higher purpose, they are formidable spiritual warriors.',
    challenges: 'The intensity of Aja Ekapada\'s fire can make these natives extreme, oscillating between fierce aspiration and bitter disappointment. They can be prone to sudden, irrational decisions when the idealistic vision collides with reality. Grounding this visionary fire in practical compassion is the central work.',
    compatible: ['Shatabhisha', 'Uttara Bhadrapada', 'Revati'],
    compatible_slugs: ['shatabhisha', 'uttara-bhadrapada', 'revati'],
    general: 'The two stars of Purva Bhadrapada are the front legs of the funeral cot — this nakshatra carries us across the threshold between the ordinary and the sacred, through fire.',
  },
  'uttara-bhadrapada': {
    slug: 'uttara-bhadrapada',
    name: 'Uttara Bhadrapada',
    symbol: 'Twins / back of funeral cot',
    ruling_planet: 'Saturn',
    deity: 'Ahir Budhnya',
    element: 'Water',
    rashi: 'Meena',
    pada: '28–30 (3°20\'–16°40\' Meena)',
    traits: ['Deep', 'Wise', 'Serene', 'Protective', 'Spiritual'],
    strengths: 'Uttara Bhadrapada natives carry the deep wisdom of the cosmic serpent Ahir Budhnya who lives in the depths of the ocean. Saturn\'s discipline combined with Piscean depth creates individuals of extraordinary patience, wisdom, and compassion. They are natural protectors and teachers of the highest spiritual truths.',
    challenges: 'The depth of Uttara Bhadrapada can manifest as an inability to engage with the surface world — procrastination, withdrawal, and difficulty in practical matters. Saturn here can create heavy karmic lessons that feel isolating. Regular engagement with community prevents excessive withdrawal.',
    compatible: ['Purva Bhadrapada', 'Revati', 'Anuradha'],
    compatible_slugs: ['purva-bhadrapada', 'revati', 'anuradha'],
    general: 'Ahir Budhnya, the serpent of the deep, brings wisdom from beneath the floor of the cosmic ocean. Uttara Bhadrapada completes the journey across the cot — the final wisdom before Revati\'s liberation.',
  },
  revati: {
    slug: 'revati',
    name: 'Revati',
    symbol: 'Fish / drum',
    ruling_planet: 'Mercury',
    deity: 'Pushan',
    element: 'Water',
    rashi: 'Meena',
    pada: '31–33 (16°40\'–30° Meena)',
    traits: ['Compassionate', 'Nourishing', 'Completing', 'Spiritual', 'Protective'],
    strengths: 'Revati is the final nakshatra — it carries the accumulated wisdom of all 27 and the compassionate grace of Pushan, the nourishing guide of souls. Mercury gives clarity and communication skill, while Piscean depth grants spiritual sensitivity. These natives are natural caretakers, guides, and healers at the end of journeys.',
    challenges: 'Completion energy can make Revati natives prone to endings — relationships, projects, and life phases may all feel impermanent. Excessive sensitivity and absorbing others\' emotions without adequate boundaries creates depletion. Learning to receive care, not only give it, is essential.',
    compatible: ['Ashlesha', 'Jyeshtha', 'Uttara Bhadrapada'],
    compatible_slugs: ['ashlesha', 'jyeshtha', 'uttara-bhadrapada'],
    general: 'Pushan, the nourishing guide, leads souls on their final journey. Revati is the loving shepherd who lights the path\'s end — the 27th nakshatra that completes and blesses the entire cycle.',
  },
};

const NAKSHATRA_ORDER = [
  'ashwini', 'bharani', 'krittika', 'rohini', 'mrigashira', 'ardra',
  'punarvasu', 'pushya', 'ashlesha', 'magha', 'purva-phalguni', 'uttara-phalguni',
  'hasta', 'chitra', 'swati', 'vishakha', 'anuradha', 'jyeshtha',
  'mula', 'purva-ashadha', 'uttara-ashadha', 'shravana', 'dhanishtha',
  'shatabhisha', 'purva-bhadrapada', 'uttara-bhadrapada', 'revati',
];

// ─── Static generation ────────────────────────────────────────────────────────

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: NAKSHATRA_ORDER.map(slug => ({ params: { slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const nakshatra = NAKSHATRAS[slug];
  if (!nakshatra) return { notFound: true };
  const idx = NAKSHATRA_ORDER.indexOf(slug);
  const prevSlug = idx > 0 ? NAKSHATRA_ORDER[idx - 1] : null;
  const nextSlug = idx < NAKSHATRA_ORDER.length - 1 ? NAKSHATRA_ORDER[idx + 1] : null;
  return {
    props: {
      nakshatra,
      prevNakshatra: prevSlug ? { slug: prevSlug, name: NAKSHATRAS[prevSlug].name } : null,
      nextNakshatra: nextSlug ? { slug: nextSlug, name: NAKSHATRAS[nextSlug].name } : null,
      number: idx + 1,
    },
  };
};

// ─── Page component ───────────────────────────────────────────────────────────

interface PageProps {
  nakshatra: NakshatraData;
  prevNakshatra: { slug: string; name: string } | null;
  nextNakshatra: { slug: string; name: string } | null;
  number: number;
}

const NakshatraPage: NextPage<PageProps> = ({ nakshatra, prevNakshatra, nextNakshatra, number }) => {
  return (
    <>
      <Head>
        <title>{nakshatra.name} Nakshatra — Meaning, Traits & Compatibility · JyotishHardev</title>
        <meta name="description" content={`${nakshatra.name} nakshatra — ruled by ${nakshatra.ruling_planet}, deity ${nakshatra.deity}. Symbol: ${nakshatra.symbol}. ${nakshatra.general}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={`https://jyotishhardev.com/nakshatras/${nakshatra.name.toLowerCase().replace(/\s+/g, '-')}`} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="JyotishHardev" />
        <meta property="og:url" content={`https://jyotishhardev.com/nakshatras/${nakshatra.name.toLowerCase().replace(/\s+/g, '-')}`} />
        <meta property="og:title" content={`${nakshatra.name} Nakshatra — Meaning, Traits & Compatibility · JyotishHardev`} />
        <meta property="og:description" content={`${nakshatra.name} nakshatra — ruled by ${nakshatra.ruling_planet}, deity ${nakshatra.deity}. Symbol: ${nakshatra.symbol}. ${nakshatra.general}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${nakshatra.name} Nakshatra · JyotishHardev`} />
        <meta name="twitter:description" content={`${nakshatra.name} nakshatra — ruled by ${nakshatra.ruling_planet}, deity ${nakshatra.deity}. Symbol: ${nakshatra.symbol}.`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="page">
        <PublicNav activePage="library" />

        <div className="container">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <Link href="/library" className="bc-link">Library</Link>
            <span className="bc-sep">›</span>
            <Link href="/library" className="bc-link">Nakshatras</Link>
            <span className="bc-sep">›</span>
            <span className="bc-current">{nakshatra.name}</span>
          </nav>

          {/* Hero */}
          <div className="hero">
            <div className="hero-number">Nakshatra {number} of 27</div>
            <h1 className="hero-title">{nakshatra.name}</h1>
            <div className="hero-meta">
              <span className="meta-chip">{nakshatra.symbol}</span>
              <span className="meta-chip">Ruled by {nakshatra.ruling_planet}</span>
              <span className="meta-chip">Deity: {nakshatra.deity}</span>
              <span className="meta-chip">{nakshatra.element} · {nakshatra.rashi}</span>
            </div>
            <p className="hero-sub">{nakshatra.general}</p>
          </div>

          {/* Traits */}
          <div className="section">
            <h2 className="section-title">Key Traits</h2>
            <div className="traits-row">
              {nakshatra.traits.map(t => (
                <span key={t} className="trait-chip">{t}</span>
              ))}
            </div>
          </div>

          {/* Strengths & Challenges */}
          <div className="two-col">
            <div className="info-card strengths-card">
              <h2 className="info-title">Strengths</h2>
              <p className="info-text">{nakshatra.strengths}</p>
            </div>
            <div className="info-card challenges-card">
              <h2 className="info-title">Challenges</h2>
              <p className="info-text">{nakshatra.challenges}</p>
            </div>
          </div>

          {/* Compatible nakshatras */}
          <div className="section">
            <h2 className="section-title">Compatible Nakshatras</h2>
            <div className="traits-row">
              {nakshatra.compatible.map((name, i) => (
                <Link key={name} href={`/nakshatras/${nakshatra.compatible_slugs[i]}`} className="compat-chip">
                  {name}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="cta-card">
            <h2 className="cta-heading">Find your Nakshatra free →</h2>
            <p className="cta-body">Generate your Vedic birth chart and discover your Moon nakshatra, Lagna, and personalised reading.</p>
            <Link href="/" className="cta-btn">Generate free Kundli</Link>
          </div>

          {/* Prev / Next */}
          <div className="nav-row">
            {prevNakshatra ? (
              <Link href={`/nakshatras/${prevNakshatra.slug}`} className="nav-prev">
                ← {prevNakshatra.name}
              </Link>
            ) : <span />}
            {nextNakshatra ? (
              <Link href={`/nakshatras/${nextNakshatra.slug}`} className="nav-next">
                {nextNakshatra.name} →
              </Link>
            ) : <span />}
          </div>
        </div>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f5f0e8;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1a1a2e;
        }

        .container {
          max-width: 780px;
          margin: 0 auto;
          padding: 32px 16px 80px;
        }

        /* Breadcrumb */
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          margin-bottom: 24px;
        }

        .bc-link {
          color: #c9a84c;
          text-decoration: none;
        }

        .bc-link:hover { text-decoration: underline; }

        .bc-sep { color: #9b9bb0; }

        .bc-current { color: #6b6b8a; }

        /* Hero */
        .hero {
          text-align: center;
          margin-bottom: 36px;
        }

        .hero-number {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #c9a84c;
          margin-bottom: 8px;
        }

        .hero-title {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 42px;
          color: #1b1f4a;
          margin: 0 0 16px;
          line-height: 1.1;
        }

        .hero-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-bottom: 16px;
        }

        .meta-chip {
          font-size: 12px;
          font-weight: 500;
          color: #1b1f4a;
          background: #e8e0d0;
          padding: 4px 10px;
          border-radius: 12px;
        }

        .hero-sub {
          font-size: 15px;
          color: #4a4a6a;
          line-height: 1.7;
          max-width: 580px;
          margin: 0 auto;
          font-style: italic;
        }

        /* Sections */
        .section {
          margin-bottom: 28px;
        }

        .section-title {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 20px;
          color: #1b1f4a;
          margin: 0 0 12px;
        }

        .traits-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .trait-chip {
          font-size: 13px;
          font-weight: 500;
          color: #1b1f4a;
          background: #ffffff;
          border: 1px solid #d8d0c0;
          padding: 6px 14px;
          border-radius: 20px;
        }

        .compat-chip {
          font-size: 13px;
          font-weight: 500;
          color: #c9a84c;
          background: #ffffff;
          border: 1px solid #c9a84c;
          padding: 6px 14px;
          border-radius: 20px;
          text-decoration: none;
          transition: background 150ms, color 150ms;
        }

        .compat-chip:hover {
          background: #c9a84c;
          color: #1b1f4a;
        }

        /* Two column */
        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 28px;
        }

        .info-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(27,31,74,0.08);
        }

        .strengths-card { border-top: 4px solid #4caf82; }
        .challenges-card { border-top: 4px solid #c9a84c; }

        .info-title {
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin: 0 0 10px;
        }

        .strengths-card .info-title { color: #2e7d55; }
        .challenges-card .info-title { color: #a07820; }

        .info-text {
          font-size: 14px;
          color: #3a3a5c;
          line-height: 1.7;
          margin: 0;
        }

        /* CTA */
        .cta-card {
          background: #1b1f4a;
          border-radius: 12px;
          padding: 28px;
          text-align: center;
          margin-bottom: 28px;
        }

        .cta-heading {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 22px;
          color: #c9a84c;
          margin: 0 0 8px;
        }

        .cta-body {
          font-size: 14px;
          color: rgba(255,255,255,0.75);
          line-height: 1.6;
          margin: 0 0 18px;
        }

        .cta-btn {
          display: inline-block;
          background: #c9a84c;
          color: #1b1f4a;
          font-weight: 700;
          font-size: 14px;
          padding: 10px 24px;
          border-radius: 22px;
          text-decoration: none;
          transition: opacity 150ms;
        }

        .cta-btn:hover { opacity: 0.88; }

        /* Prev/Next */
        .nav-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-prev, .nav-next {
          font-size: 14px;
          font-weight: 600;
          color: #1b1f4a;
          text-decoration: none;
          padding: 8px 16px;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(27,31,74,0.08);
          transition: box-shadow 150ms;
        }

        .nav-prev:hover, .nav-next:hover {
          box-shadow: 0 2px 8px rgba(27,31,74,0.15);
        }

        @media (max-width: 580px) {
          .two-col { grid-template-columns: 1fr; }
          .hero-title { font-size: 32px; }
        }
      `}</style>
    </>
  );
};

export default NakshatraPage;
