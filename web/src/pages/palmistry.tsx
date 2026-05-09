/**
 * /palmistry — Hasta Samudrika Shastra reference.
 * 8 tabbed sections: Overview, Mounts, Major Lines, Minor Lines,
 * Fingers & Nails, Hand Types, Marks & Signs, Timing.
 */
import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import PublicNav from '@/components/PublicNav';

// ─── Colour tokens ────────────────────────────────────────────────────────────
const C = {
  bg:       '#f5f0e8',
  surface:  '#ffffff',
  card:     '#f5f0e8',
  border:   'rgba(27,31,74,0.12)',
  gold:     '#c9a84c',
  goldDim:  'rgba(201,168,76,0.7)',
  crimson:  '#9b2335',
  crimsonD: 'rgba(155,35,53,0.1)',
  text:     '#1a1a2e',
  muted:    '#3a3a5c',
  faint:    'rgba(27,31,74,0.35)',
};

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { key: 'overview',   label: 'Overview'       },
  { key: 'mounts',     label: 'Mounts'         },
  { key: 'major',      label: 'Major Lines'    },
  { key: 'minor',      label: 'Minor Lines'    },
  { key: 'fingers',    label: 'Fingers & Nails'},
  { key: 'handtypes',  label: 'Hand Types'     },
  { key: 'marks',      label: 'Marks & Signs'  },
  { key: 'timing',     label: 'Timing'         },
];

// ─── Data ─────────────────────────────────────────────────────────────────────

const MOUNTS = [
  {
    name: 'Jupiter (Guru)',
    location: 'Base of index finger',
    planet: 'Guru ♃',
    color: C.gold,
    qualities: ['Leadership', 'Ambition', 'Spiritual aspiration', 'Generosity', 'Dharma'],
    excess: 'Pride, over-ambition, religious fanaticism',
    deficient: 'Lack of confidence, no spiritual inclination',
    jyotish: 'Strong mount amplifies the benefic qualities of Jupiter — wisdom, teaching ability, and righteous authority.',
  },
  {
    name: 'Saturn (Shani)',
    location: 'Base of middle finger',
    planet: 'Shani ♄',
    color: '#6b7db3',
    qualities: ['Discipline', 'Responsibility', 'Perseverance', 'Introspection', 'Karma'],
    excess: 'Gloom, misanthropy, fatalism',
    deficient: 'Frivolity, irresponsibility, no sense of karma',
    jyotish: 'Reflects Saturn\'s role as karmic judge. A well-formed mount indicates patience and mastery through sustained effort.',
  },
  {
    name: 'Sun / Apollo (Surya)',
    location: 'Base of ring finger',
    planet: 'Surya ☉',
    color: '#e8a030',
    qualities: ['Creativity', 'Fame', 'Vitality', 'Artistry', 'Charisma'],
    excess: 'Vanity, love of luxury, superficiality',
    deficient: 'Lack of aesthetic sense, low self-expression',
    jyotish: 'Sun mount governs soul (Atmakaraka energy). Prominent mount indicates those meant to shine publicly — artists, rulers, healers.',
  },
  {
    name: 'Mercury (Budha)',
    location: 'Base of little finger',
    planet: 'Budha ☿',
    color: '#7dbb8a',
    qualities: ['Intelligence', 'Communication', 'Commerce', 'Wit', 'Healing'],
    excess: 'Cunning, dishonesty, restlessness',
    deficient: 'Poor communication, difficulty with business',
    jyotish: 'Mercury governs the discriminative intellect. Strong mount favours those in trade, medicine, astrology, and oratory.',
  },
  {
    name: 'Upper Mars (Mangal Uccha)',
    location: 'Below Mercury, above Lunar mount',
    planet: 'Mangal ♂ (higher)',
    color: '#c94c4c',
    qualities: ['Moral courage', 'Endurance', 'Resistance', 'Calmness under pressure'],
    excess: 'Aggression, cruelty, love of violence',
    deficient: 'Cowardice, no staying power',
    jyotish: 'Represents Mars\'s capacity for patient courage — the warrior who endures. Contrasts with Lower Mars\'s active aggression.',
  },
  {
    name: 'Lower Mars (Mangal Neecha)',
    location: 'Between Jupiter and Venus',
    planet: 'Mangal ♂ (lower)',
    color: '#c94c4c',
    qualities: ['Physical courage', 'Energy', 'Drive', 'Initiative', 'Assertion'],
    excess: 'Hot temper, violence, quarrelsomeness',
    deficient: 'Timidity, physical weakness, lack of initiative',
    jyotish: 'Reflects the Kshatriya spirit — the courage to act and fight. Strong in those with prominent Mars in their natal chart.',
  },
  {
    name: 'Venus (Shukra)',
    location: 'Base of thumb (thenar eminence)',
    planet: 'Shukra ♀',
    color: '#d4879e',
    qualities: ['Love', 'Sensuality', 'Vitality', 'Beauty', 'Compassion', 'Life force'],
    excess: 'Licentiousness, excess sensual pleasure, indulgence',
    deficient: 'Cold nature, low vitality, aversion to beauty',
    jyotish: 'Venus mount is the largest and carries the most life force. In Jyotish it reflects Shukra\'s domain: love, art, pleasure, and physical constitution.',
  },
  {
    name: 'Moon / Lunar (Chandra)',
    location: 'Lower percussion side of palm',
    planet: 'Chandra ☽',
    color: '#a0b8d8',
    qualities: ['Imagination', 'Intuition', 'Emotion', 'Creativity', 'Travel', 'Psychic sensitivity'],
    excess: 'Moodiness, fantasy, over-emotionalism',
    deficient: 'Dry imagination, cold practicality',
    jyotish: 'Moon mount governs the mind (Manas). A full, rounded Lunar mount is prized in Jyotish — it indicates a receptive, reflective intelligence.',
  },
  {
    name: 'Rahu / Plain of Mars',
    location: 'Centre of the palm',
    planet: 'Rahu / Ketu',
    color: '#8a6bbf',
    qualities: ['Balance', 'Restraint', 'Inner equilibrium'],
    excess: 'If hollow: worry, unfulfilled desires. If raised: explosive temper',
    deficient: 'Flat, unremarkable plain indicates an ordinary, uneventful life',
    jyotish: 'The plain carries the shadow planet energy of Rahu — the insatiable desire that drives karma. Its texture reflects worldly ambition.',
  },
];

const MAJOR_LINES = [
  {
    name: 'Life Line (Ayu Rekha)',
    sanskrit: 'आयु रेखा',
    start: 'Between thumb and index finger',
    end: 'Curves around the Venus mount to the wrist',
    meanings: [
      'Vitality and physical constitution, not length of life',
      'Major events and changes in life direction',
      'Energy reserves and stamina',
      'Quality of experience rather than quantity of years',
    ],
    vedic: 'In Samudrika Shastra, a deep, long, and unbroken line indicates robust health and a stable life. Breaks indicate changes in residence, lifestyle, or health challenges. Islands point to periods of illness. Forks at the end indicate travel or a divided life between two places.',
    auspicious: 'Deep, clear, rose-coloured, free of breaks and islands',
    inauspicious: 'Chained, broad, pale, broken, or absent',
  },
  {
    name: 'Head Line (Buddhi Rekha)',
    sanskrit: 'बुद्धि रेखा',
    start: 'Just above the Life Line, between thumb and index finger',
    end: 'Across the palm, direction varies',
    meanings: [
      'Intellect, reasoning capacity, and mental approach',
      'Concentration and depth of thought',
      'Career inclinations and mental talents',
      'Relationship between thinking and material vs. spiritual pursuits',
    ],
    vedic: 'A straight Head Line inclines toward practical, analytical thinking. A sloping line toward the Lunar mount reveals imagination and intuition. When joined to the Life Line at the start, the person is cautious and influenced by family. A wide separation indicates boldness and independence — sometimes rashness.',
    auspicious: 'Deep, clear, well-defined, gently curving',
    inauspicious: 'Chained, short, absent, broken, or drooping sharply',
  },
  {
    name: 'Heart Line (Hridaya Rekha)',
    sanskrit: 'हृदय रेखा',
    start: 'Below the Mercury mount',
    end: 'Across to Jupiter or Saturn mount',
    meanings: [
      'Emotional life, love nature, and relationships',
      'Physical heart health',
      'Idealism and romantic expression',
      'Depth of feeling and capacity for attachment',
    ],
    vedic: 'Ending under Jupiter mount: idealistic, loyal lover, seeks a partner of quality. Ending under Saturn: sensual, passionate, sometimes jealous. A long, curved Heart Line reaching the index finger indicates a generous heart. A short or straight line suggests emotional reserve or practicality in love.',
    auspicious: 'Long, curved, clear, rose-coloured, reaching Jupiter',
    inauspicious: 'Chained, pale, broken, absent, or ending in a fork under Saturn',
  },
  {
    name: 'Fate Line (Bhagya Rekha)',
    sanskrit: 'भाग्य रेखा',
    start: 'Wrist (Rascette) or Lunar mount',
    end: 'Toward Saturn mount (middle finger)',
    meanings: [
      'Career path and public destiny',
      'The degree to which fate vs. free will governs one\'s life',
      'Timing of major career changes',
      'Inherited karma (Sanchita) in professional life',
    ],
    vedic: 'One of the most studied lines in Samudrika Shastra. Starting from the wrist: life shaped by karma from birth. Starting from Lunar mount: career influenced by others or public. Starting mid-palm: fate begins after early struggles. Absence does not indicate bad fate — some self-made individuals have very faint Fate Lines.',
    auspicious: 'Deep, clear, unbroken, running straight to Saturn mount',
    inauspicious: 'Absent, broken, deflected, starting and stopping',
  },
  {
    name: 'Sun Line (Surya Rekha)',
    sanskrit: 'सूर्य रेखा',
    start: 'Anywhere between wrist and Heart Line',
    end: 'Sun / Apollo mount (base of ring finger)',
    meanings: [
      'Fame, recognition, and creative success',
      'Brilliance of personality and public esteem',
      'Artistic or scholarly achievement',
      'Fortune and material reward for talent',
    ],
    vedic: 'Called the "Line of Success" in classical texts. Its presence amplifies the Fate Line. Those without a Sun Line can still succeed, but with less public recognition. Starting from the Head Line: success after intellectual effort. Starting from the Heart Line: fame after midlife through love or art.',
    auspicious: 'Deep, long, single, reaching Apollo mount',
    inauspicious: 'Multiple fragmented lines, absent, or ending before Heart Line',
  },
  {
    name: 'Mercury / Health Line (Svasthya Rekha)',
    sanskrit: 'स्वास्थ्य रेखा',
    start: 'Venus or Life Line base',
    end: 'Mercury mount (below little finger)',
    meanings: [
      'Physical health and digestive constitution',
      'Business acumen and financial instinct',
      'Communication gifts',
      'Medical or healing talents',
    ],
    vedic: 'Absence is considered positive — it means robust health. Its presence and quality indicate how health may ebb and flow. A wavy Health Line suggests nervous disorders or digestive issues. A clean, straight line indicates good health and business ability. In Ayurveda correlations, the line reflects the state of Agni (digestive fire).',
    auspicious: 'Absent (best) or clear, straight, unbroken',
    inauspicious: 'Wavy, chained, broken, or crossing the Life Line',
  },
  {
    name: 'Marriage / Union Lines (Vivah Rekha)',
    sanskrit: 'विवाह रेखा',
    start: 'Percussion side of palm',
    end: 'Toward Mercury mount, above Heart Line',
    meanings: [
      'Significant romantic unions and partnerships',
      'Depth and timing of committed relationships',
      'Quality of the marital bond',
      'Divorce or separation indicators',
    ],
    vedic: 'Each line represents a significant emotional union. Length indicates depth of attachment. A line that turns upward at its end indicates a happy union. Turning downward: the partner may predecease or the union ends. A fork indicates separation. A line cutting the Sun Line: the relationship may damage reputation or career.',
    auspicious: 'Long, clear, straight, or slightly curving upward',
    inauspicious: 'Short, broken, forked, or curving sharply downward',
  },
];

const MINOR_LINES = [
  { name: 'Girdle of Venus', location: 'Curved line above Heart Line between Saturn and Mercury mounts', meaning: 'Heightened emotional sensitivity, artistic temperament. If broken: nervous excitability, over-sensitivity.' },
  { name: 'Via Lasciva', location: 'Horizontal line on Lunar mount', meaning: 'Restlessness, desire for travel and adventure. In excess: addiction tendencies, escapism.' },
  { name: 'Line of Intuition', location: 'Curved line on Lunar mount side', meaning: 'Strong psychic sensitivity, mediumistic capacity, and precognitive dreams. Common in Jyotishis and healers.' },
  { name: 'Travel Lines', location: 'Horizontal lines on Lunar mount', meaning: 'Each line represents a significant journey. Deep lines: transformative travels. Faint: leisure trips.' },
  { name: 'Rascettes / Bracelets', location: 'Three horizontal lines at the wrist', meaning: 'Each complete, deep bracelet = approximately 25-30 years of healthy life. Three complete bracelets: 90 years. First bracelet curving into the palm (women): reproductive health concerns in classical texts.' },
  { name: 'Ring of Solomon', location: 'Small curved line below index finger', meaning: 'Gift for leadership, wisdom, occult knowledge. Common in teachers, judges, and spiritual guides. Enhances Jupiter mount qualities.' },
  { name: 'Ring of Saturn', location: 'Curved line encircling middle finger base', meaning: 'Isolating tendencies, difficulty completing things, introspective to the point of isolation. Rare and considered restrictive.' },
  { name: 'Children Lines', location: 'Vertical lines above Marriage Lines', meaning: 'Indicate significant children or creative projects. Depth shows the strength of the bond. Faint lines: possible miscarriage or estranged children in classical readings.' },
  { name: 'Opposition Lines', location: 'Short horizontal lines on Venus mount', meaning: 'Represent opposition or interference from others. Multiple lines indicate an adversarial environment.' },
  { name: 'Line of Mars', location: 'Inside Life Line, on Venus mount', meaning: 'A second Life Line — greatly enhances vitality and provides protection. Common in soldiers and athletes. Indicates a powerful guardian presence.' },
  { name: 'Loyalty / Commitment Line', location: 'Horizontal line inside Life Line', meaning: 'Deep loyalty to family and tradition. Strong sense of duty and attachment to lineage. Rare but highly valued in Samudrika Shastra.' },
  { name: 'Teacher\'s Square', location: 'Small square below index finger on Jupiter mount', meaning: 'The gift of teaching, explaining, and transmitting knowledge. Indicates a dharmic duty to share wisdom.' },
];

const FINGER_SECTIONS = [
  {
    title: 'Thumb — Will and Logic',
    content: 'The thumb is the most important digit in Samudrika Shastra. Its length, flexibility, and set reveal character fundamentally. A long thumb: strong willpower and leadership. Short: dependent nature. High-set thumb: acquisitive, practical. Low-set: flexible and liberal. The angle the thumb makes with the palm when relaxed shows generosity: 90° = very generous, 45° or less = economical to a fault.',
    phalanges: ['First phalange (nail): Willpower and determination', 'Second phalange (middle): Logical reasoning and judgment'],
  },
  {
    title: 'Index Finger (Jupiter) — Ambition',
    content: 'Governs ambition, leadership, ego, and spiritual aspiration. Longer than the ring finger: natural leader, ambitious. Equal to ring finger: balanced. Shorter: self-doubt, or prefers creative/artistic pursuits over power.',
    phalanges: ['First: Administrative ability and command', 'Second: Pride, self-respect, religious tendency', 'Third: Love of good food, comfort, and material pleasure'],
  },
  {
    title: 'Middle Finger (Saturn) — Responsibility',
    content: 'The pillar of the hand. Governs discipline, karma, introspection, and caution. An overly long Saturn finger relative to others: morbid, over-serious personality. Balanced: responsible, reliable. Leaning toward Jupiter: ambition tempered by caution. Leaning toward Apollo: creativity given structure.',
    phalanges: ['First: Occult studies, introspection, research', 'Second: Agriculture, land, practical skills', 'Third: Materialism, attachment to security'],
  },
  {
    title: 'Ring Finger (Apollo / Sun) — Creativity',
    content: 'Governs artistic ability, love of beauty, and desire for fame. Longer than the index finger: strong creative drive, comfort with risk. This ratio correlates in modern research with prenatal testosterone exposure. In Jyotish: a prominent Apollo finger indicates strong Surya energy — the soul expressed through creative output.',
    phalanges: ['First: Artistic genius, love of form and colour', 'Second: Business of the arts, practical creativity', 'Third: Desire for luxury, physical beauty, ostentation'],
  },
  {
    title: 'Little Finger (Mercury) — Communication',
    content: 'Governs communication, healing, commerce, and sexuality. A long Mercury finger (reaching the joint of the top phalange of Apollo): exceptional communication gifts. Set low on the hand: emotional immaturity in one area. Crooked or bent: diplomatic to the point of cunning — may bend the truth.',
    phalanges: ['First: Eloquence, writing, language gifts', 'Second: Science, analysis, medical ability', 'Third: Commerce, sexuality, material cunning'],
  },
  {
    title: 'Nails — Health Indicators',
    content: '',
    nails: [
      { shape: 'Long, narrow', meaning: 'Respiratory weakness, spinal sensitivity' },
      { shape: 'Short, wide', meaning: 'Critical nature, heart and circulation focus' },
      { shape: 'Almond-shaped', meaning: 'Gentle, idealistic — soft constitution' },
      { shape: 'Fan-shaped (widening)', meaning: 'Nervous tension, stress-related illness' },
      { shape: 'Clubbed', meaning: 'Respiratory or cardiac concerns in classical readings' },
      { shape: 'Very pale', meaning: 'Anaemia, low vitality, Vata excess' },
      { shape: 'Blue tinge', meaning: 'Circulatory concerns, Kapha-Vata imbalance' },
      { shape: 'Ridged vertically', meaning: 'Nutritional absorption issues, stress' },
      { shape: 'Ridged horizontally (Beau\'s lines)', meaning: 'Past illness or trauma — lines across mark the time' },
      { shape: 'White spots', meaning: 'In Ayurveda: calcium imbalance or Vata disturbance' },
    ],
  },
  {
    title: 'Finger Spacing — Character Indicators',
    content: '',
    spacing: [
      'Wide gap between index and middle fingers: independent thinker, challenges authority',
      'Wide gap between middle and ring fingers: carefree attitude toward the future, lives in the present',
      'Wide gap between ring and little fingers: acts impulsively, independent in thought',
      'Fingers held tightly together when shown palm-down: cautious, reserved, secretive nature',
      'Index finger leaning away from others: independent, self-reliant leader',
      'Little finger set low or angled away: emotional vulnerability, relationship sensitivity',
    ],
  },
];

const HAND_TYPES = [
  {
    type: 'Earth Hand',
    element: 'Prithvi',
    description: 'Square palm, short fingers. Thick, firm skin. Often rough or calloused.',
    character: 'Practical, reliable, grounded, stubborn. Lives through the senses. Slow to change but immovable once committed. Excellent with their hands — artisans, farmers, builders.',
    strengths: ['Physical endurance', 'Reliability', 'Practical wisdom', 'Connection to nature'],
    challenges: 'Resistance to change, materialism, bluntness',
    jyotish: 'Associated with strong Taurus or Virgo influence (earth signs). Saturn and Venus prominent.',
    dosha: 'Kapha dominant',
  },
  {
    type: 'Air Hand',
    element: 'Vayu',
    description: 'Square palm, long fingers. Dry, often with prominent knuckles. Thin skin.',
    character: 'Intellectual, communicative, curious, restless. Lives through ideas and concepts. Excels in writing, teaching, analysis, and social coordination.',
    strengths: ['Adaptability', 'Intellectual agility', 'Communication', 'Social intelligence'],
    challenges: 'Anxiety, lack of follow-through, over-analysis',
    jyotish: 'Gemini, Libra, Aquarius energy. Mercury and Rahu prominent.',
    dosha: 'Vata dominant',
  },
  {
    type: 'Fire Hand',
    element: 'Agni',
    description: 'Oblong or rectangular palm, short fingers. Pink or reddish skin. Energetic feel.',
    character: 'Passionate, intuitive, creative, impatient. Lives through action and inspiration. Natural leaders and entrepreneurs. Burns brightly but may burn out.',
    strengths: ['Enthusiasm', 'Leadership', 'Courage', 'Creative spark'],
    challenges: 'Impulsiveness, impatience, self-absorption',
    jyotish: 'Aries, Leo, Sagittarius energy. Sun and Mars prominent.',
    dosha: 'Pitta dominant',
  },
  {
    type: 'Water Hand',
    element: 'Jala',
    description: 'Oblong palm, long flexible fingers. Soft, sometimes moist skin. Conic or pointed fingertips.',
    character: 'Sensitive, empathic, artistic, emotionally fluid. Lives through feeling and intuition. Healers, poets, musicians, mystics. Absorbs others\' emotions easily.',
    strengths: ['Empathy', 'Artistic sensitivity', 'Intuition', 'Healing capacity'],
    challenges: 'Over-sensitivity, moodiness, poor boundaries',
    jyotish: 'Cancer, Scorpio, Pisces energy. Moon and Ketu prominent.',
    dosha: 'Vata-Kapha, or Kapha dominant',
  },
  {
    type: 'Psychic / Pointed Hand',
    element: 'Akasha',
    description: 'Long narrow palm, very long tapering fingers with conic or pointed tips. Often fragile looking.',
    character: 'Highly intuitive, idealistic, spiritually oriented but often impractical. Visionary capacity. Rare in its pure form. Lives in the world of spirit and beauty — may struggle with material demands.',
    strengths: ['Spiritual insight', 'Artistic vision', 'Psychic sensitivity', 'Inspiration'],
    challenges: 'Impracticality, susceptibility, escapism',
    jyotish: 'Neptune-Ketu energy. Strong 12th house emphasis in the chart.',
    dosha: 'Vata — highly elevated, sometimes Vata-Pitta',
  },
];

const MARKS = [
  { name: 'Star (Tara ✦)', locations: 'On mounts or lines', meaning: 'A sudden, brilliant event — positive or negative depending on location. On Jupiter: great honour. On Saturn: infamous event. On Sun: sudden fame. On Fate Line: a critical turning point. On Head Line: danger to mental health.' },
  { name: 'Trident (Trishul ψ)', locations: 'Top of Sun, Jupiter, or Mercury mount', meaning: 'The most auspicious mark in Hasta Samudrika Shastra. Indicates triple blessings — wealth, wisdom, and fame together. On Sun mount: the greatest creative success. On Jupiter: spiritual eminence. On Mercury: brilliance in communication and healing.' },
  { name: 'Fish (Matsya ᚾ)', locations: 'Base of palm, end of Life Line, or wrist', meaning: 'Indicates great fortune, spiritual merit from past lives, and worldly abundance. One of the Ashta Mangala (eight auspicious signs). A fish mark near the wrist indicates the person will be renowned and prosperous. Very rare and highly prized.' },
  { name: 'Lotus (Kamal)', locations: 'Centre of palm (Plain of Mars)', meaning: 'Extreme rarity. Marks a soul of exceptional spiritual purity and karmic merit. The tradition holds that those born with a lotus mark are destined for great spiritual achievement or leadership of high moral standing.' },
  { name: 'Conch (Shankha ☸)', locations: 'Thumb, Venus mount, or base of palm', meaning: 'Marks of learning, oratory, and sacred knowledge. Multiple conchs suggest a teacher of sacred subjects. In Puranic tradition, holding the conch is a sign of divine authority.' },
  { name: 'Triangle (Tribhuj △)', locations: 'On any mount or major line', meaning: 'Well-directed mental energy in the sphere of the mount where it appears. On Jupiter: diplomatic ability. On Moon: gift for occult sciences. On a line: protection and focus. More auspicious when formed by three separate lines rather than marked alone.' },
  { name: 'Square (Chaturkona □)', locations: 'On any line or mount', meaning: 'Protection and preservation. A square on a break in a line repairs the break\'s negative influence. On mounts: bounds and controls excessive qualities. Called the "mark of the teacher" when on Jupiter — ability to protect students.' },
  { name: 'Cross (Katarika +)', locations: 'On mount or on lines', meaning: 'Challenges and obstacles in the sphere it occupies — unless on Jupiter (where it marks a great love or spiritual union). On Head Line: danger of accidents. On Fate Line: period of reversal. On Heart Line: emotional difficulty. On Jupiter: famous exception — the "Mystic Cross" between Head and Heart Lines indicates occult gifts.' },
  { name: 'Circle (Chakra ○)', locations: 'On Sun mount most auspiciously', meaning: 'On the Sun mount: rare mark of great fame and success. On the Moon mount: danger from water in classical texts. On Life Line: health challenges at the point it touches. Circles on the Head Line indicate eye problems in traditional interpretation.' },
  { name: 'Island (Dvipa)', locations: 'On any major line', meaning: 'Period of weakness, division of energy, or difficulty. On Life Line: illness at the corresponding age. On Head Line: mental stress or concentration issues. On Fate Line: career split or period of indecision. On Heart Line: emotional division or secret relationship.' },
  { name: 'Grille (Jaala ⊞)', locations: 'On any mount', meaning: 'Dissipation of the mount\'s energy — talent present but unfocused. On Venus: many loves, none deep. On Jupiter: ambition without direction. On Moon: restless imagination without creative output. Generally considered a negative marking that scatters potential.' },
  { name: 'Spot or Dot', locations: 'On any line', meaning: 'A warning mark at the point it appears. Black or dark spot: obstacle or illness at that age/period. White spot: sometimes indicates a success point. Red spot: fever or inflammation in classical texts. The shade and clarity matter greatly in reading.' },
];

const TIMING = [
  {
    line: 'Life Line',
    method: 'The Life Line is divided from start (near index finger) to end (near wrist). Measure the line and divide into segments. The traditional method: the point directly below the Saturn finger = age 35. The point below Apollo finger = age 49. The wrist = approximately age 70-75.',
    markers: [
      { age: '~10-15', position: 'First third of the line from the start' },
      { age: '~20-25', position: 'Where the line begins to curve away from the thumb' },
      { age: '~35', position: 'Directly below the middle (Saturn) finger' },
      { age: '~49', position: 'Directly below the ring (Apollo) finger' },
      { age: '~60', position: 'Two-thirds down the arc of the line' },
      { age: '~70-80', position: 'Near the wrist' },
    ],
    dashaNote: 'Mark significant Dasha changes on the Life Line to correlate planetary periods with life events. A change in line quality at a Dasha boundary confirms the period\'s influence on vitality and direction.',
  },
  {
    line: 'Fate Line',
    method: 'Starting from the wrist (birth) to where the Heart Line crosses = approximately age 35. From the Heart Line to the finger root = ages 35-70+. The Heart Line crossing point is the key benchmark.',
    markers: [
      { age: '~7-14', position: 'Very low on the line, just above the wrist' },
      { age: '~21', position: 'One-third up from the wrist' },
      { age: '~35', position: 'Where the Heart Line crosses' },
      { age: '~49', position: 'Midway between Heart Line and Head Line' },
      { age: '~56-60', position: 'Near the Head Line' },
      { age: '~70+', position: 'Above the Head Line toward Saturn mount' },
    ],
    dashaNote: 'The Fate Line is particularly useful for tracking Sade Sati (Saturn\'s 7.5-year transit) and major Dasha lord changes. A break or deflection in the Fate Line correlates strongly with Rahu-Ketu transits over the natal lagna.',
  },
  {
    line: 'Heart Line',
    method: 'The Heart Line is read from the percussion side (below Mercury) toward Jupiter. It shows emotional development over time, read from outside inward (youth to maturity) or inside out depending on tradition.',
    markers: [
      { age: 'Youth', position: 'Outer edge under Mercury — early emotional experiences' },
      { age: 'Mid-life', position: 'Below Saturn mount — karmic emotional lessons' },
      { age: 'Maturity', position: 'Ending under Jupiter — the quality of love in later life' },
    ],
    dashaNote: 'Events on the Heart Line correlate with Venus, Moon, and Jupiter Dashas. A break during a Venus Dasha almost always accompanies a significant relationship change. An island during a Moon Dasha often marks emotional turbulence.',
  },
];

// ─── Shared components ────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '1.6px',
      textTransform: 'uppercase', color: C.goldDim, marginBottom: 20,
    }}>
      {children}
    </p>
  );
}

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: '24px 24px',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Palm SVG Diagram ─────────────────────────────────────────────────────────

function PalmDiagram({ activeMount }: { activeMount: string | null }) {
  const mLabel = (x: number, y: number, name: string, abbr: string, active: boolean) => (
    <g key={name}>
      <circle cx={x} cy={y} r={active ? 22 : 18}
        fill={active ? C.gold : 'rgba(201,168,76,0.15)'}
        stroke={active ? C.gold : C.border}
        strokeWidth={active ? 2 : 1}
        style={{ transition: 'all 0.2s' }}
      />
      <text x={x} y={y + 4} textAnchor="middle"
        fontSize={active ? 9 : 8}
        fill={active ? C.bg : C.goldDim}
        fontWeight={active ? 700 : 400}
      >
        {abbr}
      </text>
    </g>
  );

  const isActive = (name: string) =>
    activeMount !== null && activeMount.toLowerCase().includes(name.toLowerCase());

  return (
    <svg viewBox="0 0 260 340" style={{ width: '100%', maxWidth: 260, display: 'block', margin: '0 auto' }}>
      {/* Palm body */}
      <ellipse cx={130} cy={210} rx={85} ry={105}
        fill="rgba(201,168,76,0.05)" stroke={C.border} strokeWidth={1.5} />

      {/* Thumb */}
      <ellipse cx={52} cy={178} rx={24} ry={42}
        fill="rgba(201,168,76,0.05)" stroke={C.border} strokeWidth={1.5}
        transform="rotate(-20 52 178)" />

      {/* Fingers */}
      {[
        { cx: 79,  label: 'I'   },
        { cx: 109, label: 'II'  },
        { cx: 139, label: 'III' },
        { cx: 168, label: 'IV'  },
      ].map(f => (
        <ellipse key={f.cx} cx={f.cx} cy={95} rx={16} ry={45}
          fill="rgba(201,168,76,0.05)" stroke={C.border} strokeWidth={1.5} />
      ))}

      {/* Mounts */}
      {mLabel(79,  148, 'Jupiter',      'Jup',  isActive('jupiter'))}
      {mLabel(109, 145, 'Saturn',       'Sat',  isActive('saturn'))}
      {mLabel(139, 148, 'Sun',          'Sun',  isActive('sun'))}
      {mLabel(168, 152, 'Mercury',      'Mer',  isActive('mercury'))}
      {mLabel(185, 210, 'Upper Mars',   'M↑',   isActive('upper mars'))}
      {mLabel(75,  210, 'Lower Mars',   'M↓',   isActive('lower mars'))}
      {mLabel(68,  268, 'Venus',        'Ven',  isActive('venus'))}
      {mLabel(185, 275, 'Moon',         'Mon',  isActive('moon'))}
      {mLabel(130, 230, 'Plain/Rahu',   'Rahu', isActive('rahu'))}

      {/* Labels */}
      <text x={130} y={320} textAnchor="middle" fontSize={9} fill={C.faint}>
        Right hand shown · Hasta Samudrika Shastra
      </text>
    </svg>
  );
}

// ─── Tab Content Components ────────────────────────────────────────────────────

function TabOverview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <SectionLabel>Origins</SectionLabel>
        <p style={{ fontSize: 16, color: C.text, lineHeight: 1.8, marginBottom: 16 }}>
          <strong style={{ color: C.gold }}>Hasta Samudrika Shastra</strong> — literally "the science of reading the ocean of the hand" — is one of the oldest branches of Vedic knowledge, with roots in texts dating back over 3,000 years. It is part of the broader discipline of <em>Samudrika Shastra</em> (the science of bodily signs), which holds that the outer form of a person perfectly reflects the inner reality of their karma, constitution, and soul trajectory.
        </p>
        <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8 }}>
          Classical texts such as the <em>Hasta Sanjeevan</em> and references in the <em>Brihat Parashara Hora Shastra</em> integrate palmistry with Jyotish — recognising that the nine planets inscribe their influence not only in the sky at birth, but in the very lines and mounts of the human hand.
        </p>
      </div>

      <Card>
        <SectionLabel>Left Hand vs Right Hand</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            { hand: 'Left Hand', sub: 'Passive · Karma Hasta', desc: 'Represents the karma you were born with — your inherited qualities, past-life impressions (Samskaras), and the blueprint of your soul. The raw potential. What the soul brought into this life.' },
            { hand: 'Right Hand', sub: 'Active · Karma Phala Hasta', desc: 'Represents what you are doing with your inherited karma — the choices made, efforts applied, and karmic fruits being expressed in this lifetime. The right hand tells the story of this life as it is being lived.' },
          ].map(h => (
            <div key={h.hand} style={{ background: C.surface, borderRadius: 10, padding: 20, border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: C.gold, marginBottom: 4 }}>{h.hand}</p>
              <p style={{ fontSize: 11, color: C.muted, marginBottom: 12, letterSpacing: '0.5px' }}>{h.sub}</p>
              <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7 }}>{h.desc}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, color: C.faint, marginTop: 16, fontStyle: 'italic' }}>
          Note: For left-handed individuals, some traditions reverse this reading. Hardev follows the dominant-hand-as-active convention.
        </p>
      </Card>

      <Card>
        <SectionLabel>Jyotish Integration</SectionLabel>
        <p style={{ fontSize: 15, color: C.text, lineHeight: 1.8, marginBottom: 16 }}>
          The nine planetary mounts on the palm directly correspond to the nine Grahas of Vedic Astrology. A mount's prominence — whether developed, flat, or displaced — modulates the planet's expression in exactly the same way a sign or house placement does in the natal chart.
        </p>
        <p style={{ fontSize: 15, color: C.text, lineHeight: 1.8, marginBottom: 16 }}>
          Reading the hand alongside the birth chart gives the Jyotishi two perspectives on the same soul: the chart shows what is cosmically indicated; the hand shows how that energy has manifested through this specific body and set of choices. Where they agree, the reading gains certainty. Where they diverge, deeper investigation is warranted.
        </p>
        <div style={{ background: C.crimsonD, borderLeft: `3px solid ${C.crimson}`, padding: '14px 18px', borderRadius: 8 }}>
          <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7 }}>
            <strong style={{ color: '#e06070' }}>Key principle:</strong> The birth chart is fixed at the moment of first breath. The hand continues to change throughout life — reflecting how karma is being worked out in real time. This is why palmistry and Jyotish are most powerful when used together.
          </p>
        </div>
      </Card>

      <Card>
        <SectionLabel>Reading Protocol</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { n: '1', t: 'Observe the overall hand', d: 'Before examining lines, note the hand type, skin quality, flexibility, and general vitality. The hand as a whole reveals constitution.' },
            { n: '2', t: 'Assess the mounts', d: 'Identify which mounts are most developed — these are the dominant planetary energies in the person\'s life. Note any displaced mounts.' },
            { n: '3', t: 'Read the major lines', d: 'In order: Life Line (vitality), Head Line (mind), Heart Line (emotion), Fate Line (destiny), Sun Line (success). Note depth, length, and any markings.' },
            { n: '4', t: 'Examine minor lines and marks', d: 'Secondary lines refine the reading. Special marks like tridents, fish, or stars carry significant weight.' },
            { n: '5', t: 'Integrate with Jyotish', d: 'Cross-reference with the natal chart. Correlate mount strength with planetary placements. Map line markings to Dasha periods.' },
            { n: '6', t: 'Compare both hands', d: 'Note where left and right hands differ significantly — this reveals the gap between inherited potential and current expression.' },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.gold, color: C.bg, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {s.n}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{s.t}</p>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function TabMounts() {
  const [active, setActive] = useState<number>(0);
  const m = MOUNTS[active];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
      {/* Left: diagram + mount list */}
      <div>
        <SectionLabel>Palm Diagram</SectionLabel>
        <PalmDiagram activeMount={m.name} />
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {MOUNTS.map((mount, i) => (
            <button key={mount.name} onClick={() => setActive(i)} style={{
              textAlign: 'left', background: i === active ? C.gold : 'transparent',
              color: i === active ? C.bg : C.text,
              border: `1px solid ${i === active ? C.gold : C.border}`,
              borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
              fontSize: 13, fontWeight: i === active ? 600 : 400,
              transition: 'all 0.15s',
            }}>
              {mount.name}
            </button>
          ))}
        </div>
      </div>

      {/* Right: details */}
      <div>
        <SectionLabel>Mount Details</SectionLabel>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: m.color, marginBottom: 4 }}>{m.name}</h3>
              <p style={{ fontSize: 12, color: C.muted }}>{m.planet} · {m.location}</p>
            </div>
          </div>

          <p style={{ fontSize: 11, color: C.goldDim, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 10 }}>Qualities when well-developed</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {m.qualities.map(q => (
              <span key={q} style={{ fontSize: 12, background: 'rgba(201,168,76,0.12)', color: C.gold, padding: '4px 10px', borderRadius: 20, border: `1px solid ${C.border}` }}>
                {q}
              </span>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ background: 'rgba(155,35,53,0.15)', borderRadius: 8, padding: 14, border: `1px solid ${C.crimsonD}` }}>
              <p style={{ fontSize: 11, color: '#e06070', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>Excess</p>
              <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{m.excess}</p>
            </div>
            <div style={{ background: 'rgba(100,100,200,0.1)', borderRadius: 8, padding: 14, border: '1px solid rgba(100,100,200,0.2)' }}>
              <p style={{ fontSize: 11, color: '#8898cc', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>Deficient</p>
              <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{m.deficient}</p>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
            <p style={{ fontSize: 11, color: C.goldDim, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 8 }}>Jyotish Integration</p>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75 }}>{m.jyotish}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function TabMajorLines() {
  const [active, setActive] = useState(0);
  const l = MAJOR_LINES[active];
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        {MAJOR_LINES.map((line, i) => (
          <button key={line.name} onClick={() => setActive(i)} style={{
            background: i === active ? C.gold : 'transparent',
            color: i === active ? C.bg : C.text,
            border: `1px solid ${i === active ? C.gold : C.border}`,
            borderRadius: 20, padding: '7px 16px', cursor: 'pointer',
            fontSize: 13, fontWeight: i === active ? 600 : 400,
            transition: 'all 0.15s',
          }}>
            {line.name.split(' (')[0]}
          </button>
        ))}
      </div>

      <Card>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: C.gold, marginBottom: 4 }}>{l.name}</h3>
          <p style={{ fontSize: 16, color: C.muted, fontStyle: 'italic' }}>{l.sanskrit}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {[{ label: 'Starts', val: l.start }, { label: 'Ends', val: l.end }].map(d => (
            <div key={d.label} style={{ background: C.surface, borderRadius: 8, padding: '12px 16px', border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 11, color: C.goldDim, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>{d.label}</p>
              <p style={{ fontSize: 13, color: C.text }}>{d.val}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, color: C.goldDim, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 12 }}>What it indicates</p>
        <ul style={{ paddingLeft: 0, listStyle: 'none', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {l.meanings.map(m => (
            <li key={m} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: C.gold, fontSize: 16, flexShrink: 0, lineHeight: 1.4 }}>◈</span>
              <span style={{ fontSize: 14, color: C.text, lineHeight: 1.7 }}>{m}</span>
            </li>
          ))}
        </ul>

        <div style={{ background: 'rgba(201,168,76,0.07)', borderRadius: 10, padding: 20, marginBottom: 20, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 11, color: C.goldDim, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 10 }}>Vedic Interpretation</p>
          <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>{l.vedic}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: 'rgba(50,180,80,0.1)', borderRadius: 8, padding: 14, border: '1px solid rgba(50,180,80,0.2)' }}>
            <p style={{ fontSize: 11, color: '#6dcf8a', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>Auspicious form</p>
            <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{l.auspicious}</p>
          </div>
          <div style={{ background: C.crimsonD, borderRadius: 8, padding: 14, border: `1px solid ${C.crimsonD}` }}>
            <p style={{ fontSize: 11, color: '#e06070', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>Inauspicious form</p>
            <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{l.inauspicious}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function TabMinorLines() {
  return (
    <div>
      <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8, marginBottom: 28 }}>
        Secondary lines appear on many hands but not all. Their presence adds nuance to the reading. Unlike major lines, their absence is rarely significant — but their presence always is.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {MINOR_LINES.map(line => (
          <Card key={line.name}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18, color: C.gold, flexShrink: 0, marginTop: 2 }}>◉</span>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: C.gold, marginBottom: 4 }}>{line.name}</p>
                <p style={{ fontSize: 12, color: C.muted, marginBottom: 10, fontStyle: 'italic' }}>{line.location}</p>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.75 }}>{line.meaning}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TabFingers() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {FINGER_SECTIONS.map(section => (
        <Card key={section.title}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: C.gold, marginBottom: 12 }}>{section.title}</h3>
          {section.content && (
            <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: section.phalanges ? 16 : 0 }}>
              {section.content}
            </p>
          )}
          {section.phalanges && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
              <p style={{ fontSize: 11, color: C.goldDim, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 6 }}>Phalanges</p>
              {section.phalanges.map(p => (
                <div key={p} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: C.gold, fontSize: 14, flexShrink: 0 }}>›</span>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{p}</p>
                </div>
              ))}
            </div>
          )}
          {section.nails && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {section.nails.map(n => (
                <div key={n.shape} style={{ background: C.surface, borderRadius: 8, padding: '10px 14px', border: `1px solid ${C.border}` }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.gold, marginBottom: 4 }}>{n.shape}</p>
                  <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{n.meaning}</p>
                </div>
              ))}
            </div>
          )}
          {section.spacing && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {section.spacing.map(s => (
                <div key={s} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: C.gold, fontSize: 14, flexShrink: 0 }}>›</span>
                  <p style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>{s}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function TabHandTypes() {
  const [active, setActive] = useState(0);
  const h = HAND_TYPES[active];
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        {HAND_TYPES.map((ht, i) => (
          <button key={ht.type} onClick={() => setActive(i)} style={{
            background: i === active ? C.gold : 'transparent',
            color: i === active ? C.bg : C.text,
            border: `1px solid ${i === active ? C.gold : C.border}`,
            borderRadius: 20, padding: '7px 16px', cursor: 'pointer',
            fontSize: 13, fontWeight: i === active ? 600 : 400,
            transition: 'all 0.15s',
          }}>
            {ht.type}
          </button>
        ))}
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: C.gold, marginBottom: 4 }}>{h.type}</h3>
            <p style={{ fontSize: 13, color: C.muted }}>Element: <strong style={{ color: C.text }}>{h.element}</strong> · Dosha: <strong style={{ color: C.text }}>{h.dosha}</strong></p>
          </div>
        </div>

        <div style={{ background: C.surface, borderRadius: 10, padding: '14px 18px', marginBottom: 20, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 11, color: C.goldDim, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>Physical Form</p>
          <p style={{ fontSize: 14, color: C.text }}>{h.description}</p>
        </div>

        <p style={{ fontSize: 15, color: C.text, lineHeight: 1.8, marginBottom: 20 }}>{h.character}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          <div style={{ background: 'rgba(50,180,80,0.08)', borderRadius: 10, padding: 16, border: '1px solid rgba(50,180,80,0.15)' }}>
            <p style={{ fontSize: 11, color: '#6dcf8a', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>Natural Strengths</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {h.strengths.map(s => (
                <div key={s} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: '#6dcf8a', fontSize: 12 }}>✓</span>
                  <p style={{ fontSize: 13, color: C.text }}>{s}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: C.crimsonD, borderRadius: 10, padding: 16, border: `1px solid ${C.crimsonD}` }}>
            <p style={{ fontSize: 11, color: '#e06070', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>Challenges</p>
            <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{h.challenges}</p>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
          <p style={{ fontSize: 11, color: C.goldDim, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 8 }}>Jyotish Correlation</p>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75 }}>{h.jyotish}</p>
        </div>
      </Card>
    </div>
  );
}

function TabMarks() {
  return (
    <div>
      <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8, marginBottom: 28 }}>
        Special marks on the palm carry concentrated meaning. In Samudrika Shastra, these signs are considered <em>Shubha Lakshanas</em> (auspicious signs) or <em>Ashubha Lakshanas</em> (inauspicious signs) depending on their form and location. Their interpretation always depends on context.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {MARKS.map(mark => (
          <Card key={mark.name}>
            <p style={{ fontSize: 16, fontWeight: 700, color: C.gold, marginBottom: 6 }}>{mark.name}</p>
            <p style={{ fontSize: 11, color: C.muted, marginBottom: 12, fontStyle: 'italic' }}>Location: {mark.locations}</p>
            <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{mark.meaning}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TabTiming() {
  const [active, setActive] = useState(0);
  const t = TIMING[active];
  return (
    <div>
      <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8, marginBottom: 28 }}>
        Timing on the palm is one of the most advanced — and most misused — aspects of palmistry. The goal is not to predict exact dates, but to identify <em>windows of karmic activity</em> that can then be cross-referenced with Dasha periods for confirmation.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {TIMING.map((t, i) => (
          <button key={t.line} onClick={() => setActive(i)} style={{
            background: i === active ? C.gold : 'transparent',
            color: i === active ? C.bg : C.text,
            border: `1px solid ${i === active ? C.gold : C.border}`,
            borderRadius: 20, padding: '7px 16px', cursor: 'pointer',
            fontSize: 13, fontWeight: i === active ? 600 : 400,
            transition: 'all 0.15s',
          }}>
            {t.line.split(' /')[0].split(' (')[0]}
          </button>
        ))}
      </div>

      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: C.gold, marginBottom: 16 }}>{t.line}</h3>
        <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: 24 }}>{t.method}</p>

        <p style={{ fontSize: 11, color: C.goldDim, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 14 }}>Age Markers</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {t.markers.map(m => (
            <div key={m.age} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: C.surface, borderRadius: 8, padding: '10px 16px', border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.gold, flexShrink: 0, minWidth: 44 }}>{m.age}</span>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{m.position}</p>
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(201,168,76,0.07)', borderRadius: 10, padding: 20, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 11, color: C.goldDim, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 10 }}>Dasha Integration</p>
          <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>{t.dashaNote}</p>
        </div>
      </Card>

      <Card>
        <p style={{ fontSize: 11, color: C.goldDim, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 14 }}>Principles of Palmistry Timing</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            'Lines that deepen or become clearer over time indicate growing strength in that area — not a fixed prediction.',
            'A fork at the end of a line indicates a choice or division, not necessarily decline.',
            'Marks closer to the fingers (top of the palm) generally relate to later life; marks near the wrist relate to earlier life.',
            'The size of the hand affects scale — a small palm compresses the timeline; a large palm stretches it.',
            'Always confirm timing against at least two lines and the corresponding Dasha period before drawing conclusions.',
          ].map(p => (
            <div key={p} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ color: C.gold, fontSize: 16, flexShrink: 0 }}>◈</span>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>{p}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PalmistryPage: NextPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <>
      <Head>
        <title>Palmistry — Hasta Samudrika Shastra · Jyotish Hardev</title>
        <meta name="description" content="Complete Hasta Samudrika Shastra reference — mounts, major and minor lines, hand types, auspicious marks, and Dasha-integrated timing." />
      </Head>

      <PublicNav activePage="palmistry" />

      <main style={{ background: C.bg, minHeight: '100vh', color: C.text }}>
        {/* Header */}
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '40px 24px 0' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <p style={{ fontSize: 12, color: C.goldDim, letterSpacing: '1.6px', textTransform: 'uppercase', marginBottom: 10 }}>
              Hasta Samudrika Shastra
            </p>
            <h1 style={{
              fontFamily: "'Tiro Devanagari Hindi', Georgia, serif",
              fontSize: 34, fontWeight: 700, color: '#ffffff',
              marginBottom: 10, lineHeight: 1.2,
            }}>
              Palmistry Reference
            </h1>
            <p style={{ fontSize: 15, color: C.muted, marginBottom: 32, maxWidth: 580, lineHeight: 1.7 }}>
              The complete Vedic science of the hand — eight sections covering every aspect of Hasta Samudrika Shastra, integrated with Jyotish planetary correspondences.
            </p>

            {/* Tab bar */}
            <div style={{ display: 'flex', gap: 0, overflowX: 'auto', borderBottom: 'none' }}>
              {TABS.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                  padding: '10px 18px',
                  background: 'transparent',
                  color: activeTab === tab.key ? C.gold : C.muted,
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === tab.key ? C.gold : 'transparent'}`,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
          {activeTab === 'overview'  && <TabOverview />}
          {activeTab === 'mounts'    && <TabMounts />}
          {activeTab === 'major'     && <TabMajorLines />}
          {activeTab === 'minor'     && <TabMinorLines />}
          {activeTab === 'fingers'   && <TabFingers />}
          {activeTab === 'handtypes' && <TabHandTypes />}
          {activeTab === 'marks'     && <TabMarks />}
          {activeTab === 'timing'    && <TabTiming />}
        </div>
      </main>
    </>
  );
};

export default PalmistryPage;
