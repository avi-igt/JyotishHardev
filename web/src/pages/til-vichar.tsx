/**
 * /til-vichar — Til (Mole) Vichar: Vedic science of moles (Samudrika Shastra).
 * 9 sections: Introduction, Color Guide, Shape Guide, Body Map,
 * Planetary Chart, Nakshatra Link, Combinations, Remedies, Ethics
 */
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import PublicNav from '@/components/PublicNav';
import { FOUNDATIONS } from '@/data/til/foundations';
import { COLORS } from '@/data/til/colors';
import { SHAPES } from '@/data/til/shapes';
import { BODY_ZONES } from '@/data/til/bodyMap';
import { PLANETARY_TILS } from '@/data/til/planetary';
import { NAKSHATRA_TILS, RASHI_TILS } from '@/data/til/nakshatraRashi';
import { COMBINATIONS } from '@/data/til/combinations';
import { REMEDIES } from '@/data/til/remedies';
import { ETHICS } from '@/data/til/ethics';

// ─── Design tokens ───────────────────────────────────────────────────────────
const C = {
  bg:       '#f5f0e8',
  surface:  '#ffffff',
  card:     '#f5f0e8',
  cardHover:'#ede8df',
  border:   'rgba(27,31,74,0.12)',
  gold:     '#c9a84c',
  rose:     '#8b2252',
  roseLight:'#b83070',
  text:     '#1a1a2e',
  textMid:  '#6b6b8a',
  textDim:  'rgba(27,31,74,0.4)',
  white:    '#ffffff',
  good:     '#1e6640',
  goodBg:   'rgba(30,102,64,0.08)',
  bad:      '#8b1a1a',
  badBg:    'rgba(139,26,26,0.08)',
  mixed:    '#7a5c00',
  mixedBg:  'rgba(122,92,0,0.08)',
  neutral:  '#3a4a6a',
  neutralBg:'rgba(58,74,106,0.08)',
};

const TABS = [
  { key: 'intro',       label: 'Introduction' },
  { key: 'colors',      label: 'Color Guide' },
  { key: 'shapes',      label: 'Shape Guide' },
  { key: 'bodymap',     label: 'Body Map' },
  { key: 'planetary',   label: 'Planetary' },
  { key: 'nakshatra',   label: 'Nakshatra Link' },
  { key: 'combos',      label: 'Combinations' },
  { key: 'remedies',    label: 'Remedies' },
  { key: 'ethics',      label: 'Ethics' },
];

// ─── Shared styles ───────────────────────────────────────────────────────────
const sectionTitle: React.CSSProperties = {
  fontFamily: "'Tiro Devanagari Hindi', Georgia, serif",
  fontSize: 26, fontWeight: 700, color: C.text,
  marginBottom: 8, lineHeight: 1.2,
};
const sectionSub: React.CSSProperties = {
  fontSize: 14, color: C.roseLight, fontWeight: 600,
  letterSpacing: '1.4px', textTransform: 'uppercase',
  marginBottom: 14,
};
const bodyText: React.CSSProperties = {
  fontSize: 15, color: C.textMid, lineHeight: 1.8, marginBottom: 14,
};
const card: React.CSSProperties = {
  background: C.card, border: `1px solid ${C.border}`,
  borderRadius: 12, padding: '20px 22px', marginBottom: 16,
};

// ─── Quality helpers ─────────────────────────────────────────────────────────
function qualityBadge(q: string) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    auspicious: { label: 'Auspicious', color: C.good,    bg: C.goodBg },
    challenging: { label: 'Challenging', color: '#c05a3a', bg: C.badBg },
    neutral:    { label: 'Neutral',    color: C.neutral, bg: C.neutralBg },
    mixed:      { label: 'Mixed',      color: C.mixed,   bg: C.mixedBg },
  };
  const s = map[q] ?? map.neutral;
  return (
    <span style={{
      display: 'inline-block', fontSize: 11, fontWeight: 700,
      letterSpacing: '0.8px', textTransform: 'uppercase',
      color: s.color, background: s.bg,
      padding: '3px 8px', borderRadius: 4,
    }}>{s.label}</span>
  );
}

// ─── Tab: Introduction ───────────────────────────────────────────────────────
function TabIntro() {
  return (
    <div>
      <p style={sectionSub}>Sharir Par Til Ka Phala</p>
      <h2 style={sectionTitle}>{FOUNDATIONS.title}</h2>
      <div style={{ width: 48, height: 2, background: C.rose, marginBottom: 28, opacity: 0.7 }} />
      {FOUNDATIONS.intro.split('\n\n').map((p, i) => (
        <p key={i} style={bodyText}>{p}</p>
      ))}

      <h3 style={{
        fontFamily: "'Tiro Devanagari Hindi', Georgia, serif",
        fontSize: 20, fontWeight: 700, color: C.gold,
        marginTop: 36, marginBottom: 20,
      }}>Core Reading Rules</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {FOUNDATIONS.rules.map((r) => (
          <div key={r.rule} style={card}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.roseLight, marginBottom: 8 }}>{r.rule}</div>
            <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.7, margin: 0 }}>{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Color Guide ────────────────────────────────────────────────────────
function TabColors() {
  return (
    <div>
      <p style={sectionSub}>Varna Vichar</p>
      <h2 style={sectionTitle}>Color Guide</h2>
      <div style={{ width: 48, height: 2, background: C.rose, marginBottom: 28, opacity: 0.7 }} />
      <p style={bodyText}>The color of a mole is its first and most visible quality. Read it in natural light whenever possible — artificial lighting can shift darker moles toward blue or moles with warm undertones toward black.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {COLORS.map((c) => (
          <div key={c.color} style={{ ...card, borderLeft: `4px solid ${c.hex}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: c.hex,
                border: '2px solid rgba(255,255,255,0.15)',
                flexShrink: 0,
              }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{c.color}</div>
                <div style={{ fontSize: 12, color: C.textDim }}>{c.sanskrit}</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>{qualityBadge(c.quality)}</div>
            </div>
            <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7, margin: '0 0 8px' }}>{c.meaning}</p>
            <div style={{ fontSize: 12, color: C.textDim }}>Ruling planet: <span style={{ color: C.gold }}>{c.planet}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Shape Guide ────────────────────────────────────────────────────────
function TabShapes() {
  return (
    <div>
      <p style={sectionSub}>Akara Vichar</p>
      <h2 style={sectionTitle}>Shape Guide</h2>
      <div style={{ width: 48, height: 2, background: C.rose, marginBottom: 28, opacity: 0.7 }} />
      <p style={bodyText}>Shape refines and modulates the meaning given by color and location. A round golden mole is far more fortunate than an irregular golden mole in the same position.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {SHAPES.map((s) => (
          <div key={s.shape} style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'rgba(139,34,82,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, color: C.roseLight, flexShrink: 0,
              }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{s.shape}</div>
                <div style={{ fontSize: 12, color: C.textDim }}>{s.sanskrit}</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>{qualityBadge(s.quality)}</div>
            </div>
            <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7, margin: 0 }}>{s.meaning}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Body Map ────────────────────────────────────────────────────────────
function TabBodyMap() {
  const [gender, setGender] = useState<'purush' | 'stri'>('purush');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const selected = BODY_ZONES.find(z => z.id === selectedZone) ?? null;
  const result = selected
    ? (gender === 'purush' ? selected.purushResult : selected.striResult)
    : null;

  // Group zones by region for the list panel
  const regions = Array.from(new Set(BODY_ZONES.map(z => z.region)));

  return (
    <div>
      <p style={sectionSub}>Sharir Rekha Vichar</p>
      <h2 style={sectionTitle}>Body Map</h2>
      <div style={{ width: 48, height: 2, background: C.rose, marginBottom: 20, opacity: 0.7 }} />

      {/* Gender toggle */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28, width: 'fit-content', borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.border}` }}>
        {(['purush', 'stri'] as const).map((g) => (
          <button
            key={g}
            onClick={() => setGender(g)}
            style={{
              padding: '9px 24px', fontSize: 13, fontWeight: 700,
              border: 'none', cursor: 'pointer',
              background: gender === g ? C.rose : 'transparent',
              color: gender === g ? C.white : C.textMid,
              letterSpacing: '0.5px',
              transition: 'all 0.15s',
            }}
          >
            {g === 'purush' ? 'Purush (Male)' : 'Stri (Female)'}
          </button>
        ))}
      </div>

      <p style={{ ...bodyText, marginBottom: 24 }}>
        {gender === 'purush'
          ? 'For men: RIGHT side moles are generally auspicious, LEFT side challenging.'
          : 'For women (Vaam-Dakshina Niyama reversed): LEFT side moles are auspicious, RIGHT side challenging.'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 240px', gap: 24, alignItems: 'start' }}>
        {/* SVG body silhouette */}
        <div>
          <svg
            viewBox="0 0 200 420"
            style={{ width: '100%', maxWidth: 320, display: 'block', margin: '0 auto' }}
          >
            {/* Body silhouette paths */}
            {/* Head */}
            <ellipse cx="100" cy="38" rx="22" ry="26" fill="#1b1f4a" stroke={C.border} strokeWidth="1" />
            {/* Neck */}
            <rect x="91" y="62" width="18" height="16" fill="#1b1f4a" stroke={C.border} strokeWidth="1" />
            {/* Torso */}
            <path d="M62 78 Q68 74 91 78 L91 215 Q76 217 62 215 Q54 200 54 165 Q52 130 62 78Z" fill="#1b1f4a" stroke={C.border} strokeWidth="1" />
            <path d="M138 78 Q132 74 109 78 L109 215 Q124 217 138 215 Q146 200 146 165 Q148 130 138 78Z" fill="#1b1f4a" stroke={C.border} strokeWidth="1" />
            <rect x="91" y="78" width="18" height="137" fill="#1b1f4a" />
            {/* Left arm (viewer's left = person's right) */}
            <path d="M62 78 Q46 90 42 130 Q40 165 46 220 L54 218 Q52 168 54 130 Q58 96 70 86Z" fill="#1b1f4a" stroke={C.border} strokeWidth="1" />
            {/* Right arm */}
            <path d="M138 78 Q154 90 158 130 Q160 165 154 220 L146 218 Q148 168 146 130 Q142 96 130 86Z" fill="#1b1f4a" stroke={C.border} strokeWidth="1" />
            {/* Hands */}
            <ellipse cx="49" cy="225" rx="8" ry="10" fill="#1b1f4a" stroke={C.border} strokeWidth="1" />
            <ellipse cx="151" cy="225" rx="8" ry="10" fill="#1b1f4a" stroke={C.border} strokeWidth="1" />
            {/* Pelvis / hips */}
            <path d="M75 215 Q65 220 64 240 L136 240 Q135 220 125 215Z" fill="#1b1f4a" stroke={C.border} strokeWidth="1" />
            {/* Left leg */}
            <path d="M75 238 Q70 250 72 310 Q72 340 75 380 L90 380 Q88 340 89 310 Q91 250 91 238Z" fill="#1b1f4a" stroke={C.border} strokeWidth="1" />
            {/* Right leg */}
            <path d="M125 238 Q130 250 128 310 Q128 340 125 380 L110 380 Q112 340 111 310 Q109 250 109 238Z" fill="#1b1f4a" stroke={C.border} strokeWidth="1" />
            {/* Feet */}
            <ellipse cx="83" cy="385" rx="10" ry="7" fill="#1b1f4a" stroke={C.border} strokeWidth="1" />
            <ellipse cx="117" cy="385" rx="10" ry="7" fill="#1b1f4a" stroke={C.border} strokeWidth="1" />

            {/* Clickable zone circles */}
            {BODY_ZONES.map((zone) => {
              const isSelected = selectedZone === zone.id;
              const isRightSide = zone.id.startsWith('right-');
              const isLeftSide = zone.id.startsWith('left-');
              const auspicious =
                (gender === 'purush' && isRightSide) ||
                (gender === 'stri' && isLeftSide);
              const isNeutral = !isRightSide && !isLeftSide;

              const fill = isSelected
                ? C.rose
                : isNeutral
                  ? 'rgba(201,168,76,0.5)'
                  : auspicious
                    ? 'rgba(74,122,90,0.6)'
                    : 'rgba(122,58,42,0.6)';

              const stroke = isSelected ? C.roseLight : 'rgba(255,255,255,0.3)';

              return (
                <circle
                  key={zone.id}
                  cx={zone.cx}
                  cy={zone.cy}
                  r={zone.r}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isSelected ? 2 : 1}
                  style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                  onClick={() => setSelectedZone(isSelected ? null : zone.id)}
                />
              );
            })}
          </svg>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
            {[
              { color: 'rgba(74,122,90,0.6)', label: 'Auspicious side' },
              { color: 'rgba(122,58,42,0.6)', label: 'Challenging side' },
              { color: 'rgba(201,168,76,0.5)', label: 'Centre (neutral)' },
              { color: C.rose, label: 'Selected' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: l.color, border: '1px solid rgba(255,255,255,0.2)' }} />
                <span style={{ fontSize: 12, color: C.textDim }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div>
          {selected ? (
            <div style={{ ...card, borderColor: C.rose }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.rose, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>{selected.region}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 4 }}>{selected.label}</div>
              <div style={{ fontSize: 12, color: C.textDim, marginBottom: 12 }}>Ruling: <span style={{ color: C.gold }}>{selected.planet}</span></div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Domain</div>
              <div style={{ fontSize: 13, color: C.textMid, marginBottom: 16 }}>{selected.domain}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>
                Reading for {gender === 'purush' ? 'Purush (Male)' : 'Stri (Female)'}
              </div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{result}</div>
            </div>
          ) : (
            <div style={{ ...card, textAlign: 'center', padding: '32px 20px' }}>
              <div style={{ fontSize: 28, marginBottom: 12, opacity: 0.5 }}>◉</div>
              <div style={{ fontSize: 14, color: C.textDim, lineHeight: 1.6 }}>
                Tap any circle on the body map to read its significance.
              </div>
            </div>
          )}

          {/* Quick list by region */}
          <div style={{ marginTop: 16 }}>
            {regions.map(region => (
              <div key={region} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.rose, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>{region}</div>
                {BODY_ZONES.filter(z => z.region === region).map(z => (
                  <div
                    key={z.id}
                    onClick={() => setSelectedZone(z.id === selectedZone ? null : z.id)}
                    style={{
                      fontSize: 12, padding: '5px 8px', borderRadius: 6,
                      cursor: 'pointer', marginBottom: 2,
                      background: z.id === selectedZone ? 'rgba(139,34,82,0.2)' : 'transparent',
                      color: z.id === selectedZone ? C.rose : C.textMid,
                      transition: 'all 0.1s',
                    }}
                  >{z.label}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Planetary ──────────────────────────────────────────────────────────
function TabPlanetary() {
  const [selected, setSelected] = useState(PLANETARY_TILS[0].planet);
  const planet = PLANETARY_TILS.find(p => p.planet === selected)!;

  return (
    <div>
      <p style={sectionSub}>Graha Til Phala</p>
      <h2 style={sectionTitle}>Planetary Chart</h2>
      <div style={{ width: 48, height: 2, background: C.rose, marginBottom: 28, opacity: 0.7 }} />
      <p style={bodyText}>Each mole is governed by a planet. The planet's nature amplifies the mole's qualities — and its remedies can be applied when the mole indicates difficulty.</p>

      {/* Planet selector */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
        {PLANETARY_TILS.map(p => (
          <button
            key={p.planet}
            onClick={() => setSelected(p.planet)}
            style={{
              padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              border: `1px solid ${selected === p.planet ? C.rose : C.border}`,
              background: selected === p.planet ? 'rgba(139,34,82,0.25)' : 'transparent',
              color: selected === p.planet ? C.rose : C.textMid,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >{p.planet} / {p.sanskrit}</button>
        ))}
      </div>

      {planet && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          <div style={{ ...card, gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: planet.colorHex,
                border: '2px solid rgba(255,255,255,0.2)',
                flexShrink: 0,
              }} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{planet.planet} — {planet.sanskrit}</div>
                <div style={{ fontSize: 13, color: C.textDim }}>{planet.color} moles · {planet.quality}</div>
              </div>
            </div>
            <p style={{ ...bodyText, marginBottom: 16 }}>{planet.generalEffect}</p>
          </div>

          <div style={card}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.good, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Auspicious Result</div>
            <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.7, margin: 0 }}>{planet.auspiciousResult}</p>
          </div>

          <div style={card}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#c05a3a', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Challenging Result</div>
            <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.7, margin: 0 }}>{planet.challengingResult}</p>
          </div>

          <div style={{ ...card, gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Primary Body Areas</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {planet.bodyAreas.map(a => (
                <span key={a} style={{
                  fontSize: 13, padding: '4px 12px', borderRadius: 16,
                  background: 'rgba(201,168,76,0.12)', color: C.gold,
                  border: '1px solid rgba(201,168,76,0.3)',
                }}>{a}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Nakshatra Link ─────────────────────────────────────────────────────
function TabNakshatra() {
  const [view, setView] = useState<'nakshatra' | 'rashi'>('nakshatra');

  return (
    <div>
      <p style={sectionSub}>Nakshatra aur Rashi Sambandh</p>
      <h2 style={sectionTitle}>Nakshatra & Rashi Link</h2>
      <div style={{ width: 48, height: 2, background: C.rose, marginBottom: 20, opacity: 0.7 }} />
      <p style={bodyText}>The nakshatra in which the Moon was placed at birth, and the rashi (sign) of the Lagna or Moon, can indicate where moles on the body carry the most significance. A mole in the body region ruled by your Moon's nakshatra is often particularly meaningful.</p>

      <div style={{ display: 'flex', gap: 0, marginBottom: 24, width: 'fit-content', borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.border}` }}>
        {(['nakshatra', 'rashi'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: '8px 20px', fontSize: 13, fontWeight: 700,
              border: 'none', cursor: 'pointer',
              background: view === v ? C.rose : 'transparent',
              color: view === v ? C.white : C.textMid,
              transition: 'all 0.15s',
            }}
          >{v === 'nakshatra' ? '27 Nakshatras' : '12 Rashis'}</button>
        ))}
      </div>

      {view === 'nakshatra' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {NAKSHATRA_TILS.map((n) => (
            <div key={n.nakshatra} style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(139,34,82,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: C.roseLight, flexShrink: 0,
                }}>{n.number}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{n.nakshatra}</div>
                  <div style={{ fontSize: 11, color: C.textDim }}>Lord: {n.lord}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: C.gold, marginBottom: 6 }}>{n.auspiciousArea}</div>
              <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.65, margin: 0 }}>{n.tilMeaning}</p>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {RASHI_TILS.map((r) => (
            <div key={r.rashi} style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: 'rgba(201,168,76,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0,
                }}>{r.sign}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{r.rashi}</div>
                  <div style={{ fontSize: 11, color: C.textDim }}>Lord: {r.lord} · {r.bodyPart}</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.65, margin: 0 }}>{r.tilMeaning}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Combinations ───────────────────────────────────────────────────────
function TabCombinations() {
  const typeColors: Record<string, string> = {
    wealth: '#c9a84c',
    wisdom: '#6a9abf',
    karma: '#9b6a9b',
    health: '#4a9b6a',
    relationships: '#b8607a',
    spiritual: '#7a8abf',
  };

  return (
    <div>
      <p style={sectionSub}>Til Yoga Phala</p>
      <h2 style={sectionTitle}>Notable Combinations</h2>
      <div style={{ width: 48, height: 2, background: C.rose, marginBottom: 28, opacity: 0.7 }} />
      <p style={bodyText}>When two or more moles appear in specific combinations — or when a single mole has exceptional qualities — classical texts describe named yogas with pronounced effects. These are among the most discussed in Samudrika Shastra.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {COMBINATIONS.map((c) => {
          const tc = typeColors[c.type] ?? C.gold;
          return (
            <div key={c.name} style={{ ...card, borderLeft: `4px solid ${tc}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{c.name}</div>
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.8px', color: tc,
                  background: `${tc}18`, padding: '2px 7px', borderRadius: 4, whiteSpace: 'nowrap',
                }}>{c.type}</span>
              </div>
              <div style={{ fontSize: 12, color: C.textDim, marginBottom: 10, lineHeight: 1.6 }}>{c.description}</div>
              <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7 }}>{c.result}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab: Remedies ───────────────────────────────────────────────────────────
function TabRemedies() {
  const [selected, setSelected] = useState(REMEDIES[0].planet);
  const remedy = REMEDIES.find(r => r.planet === selected)!;

  return (
    <div>
      <p style={sectionSub}>Til Dosha Nivaran</p>
      <h2 style={sectionTitle}>Planetary Remedies</h2>
      <div style={{ width: 48, height: 2, background: C.rose, marginBottom: 20, opacity: 0.7 }} />
      <p style={bodyText}>When a mole indicates challenging planetary influence, traditional remedies help harmonise that energy. These are not medical treatments — they are spiritual practices to work with planetary forces consciously.</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
        {REMEDIES.map(r => (
          <button
            key={r.planet}
            onClick={() => setSelected(r.planet)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              border: `1px solid ${selected === r.planet ? C.rose : C.border}`,
              background: selected === r.planet ? 'rgba(139,34,82,0.25)' : 'transparent',
              color: selected === r.planet ? C.rose : C.textMid,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >{r.planet}</button>
        ))}
      </div>

      {remedy && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          <div style={{ ...card, gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>When to Apply</div>
            <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.7, margin: 0 }}>{remedy.forMoles}</p>
          </div>
          <div style={card}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.roseLight, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Mantra</div>
            <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7, margin: 0 }}>{remedy.mantra}</p>
          </div>
          <div style={card}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Gemstone</div>
            <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7, margin: 0 }}>{remedy.gemstone}</p>
          </div>
          <div style={card}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#7abf9a', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Charity · Dana</div>
            <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7, margin: 0 }}>{remedy.charity}</p>
          </div>
          <div style={card}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#9ab0cf', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Ritual Practice</div>
            <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7, margin: 0 }}>{remedy.ritual}</p>
          </div>
          <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 30, flexShrink: 0 }}>📅</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>Best Day</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{remedy.dayOfWeek}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Ethics ─────────────────────────────────────────────────────────────
function TabEthics() {
  return (
    <div>
      <p style={sectionSub}>Gyaan Aur Dayitva</p>
      <h2 style={sectionTitle}>{ETHICS.title}</h2>
      <div style={{ width: 48, height: 2, background: C.rose, marginBottom: 12, opacity: 0.7 }} />
      <p style={{ fontSize: 14, color: C.roseLight, marginBottom: 32 }}>{ETHICS.subtitle}</p>

      {ETHICS.sections.map((s) => (
        <div key={s.heading} style={{ marginBottom: 40 }}>
          <h3 style={{
            fontFamily: "'Tiro Devanagari Hindi', Georgia, serif",
            fontSize: 19, fontWeight: 700, color: C.gold,
            marginBottom: 14,
          }}>{s.heading}</h3>
          {s.body.split('\n\n').map((p, i) => (
            <p key={i} style={bodyText}>{p}</p>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
const TilVicharPage: NextPage = () => {
  const [activeTab, setActiveTab] = useState('intro');

  const renderTab = () => {
    switch (activeTab) {
      case 'intro':     return <TabIntro />;
      case 'colors':    return <TabColors />;
      case 'shapes':    return <TabShapes />;
      case 'bodymap':   return <TabBodyMap />;
      case 'planetary': return <TabPlanetary />;
      case 'nakshatra': return <TabNakshatra />;
      case 'combos':    return <TabCombinations />;
      case 'remedies':  return <TabRemedies />;
      case 'ethics':    return <TabEthics />;
      default:          return <TabIntro />;
    }
  };

  return (
    <>
      <Head>
        <title>Til Vichar — Mole Reading · JyotishHardev</title>
        <meta name="description" content="Vedic science of moles (Samudrika Shastra). Decode the meaning of moles by color, shape, and body location according to classical Til Vichar traditions." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://jyotishhardev.com/til-vichar" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="JyotishHardev" />
        <meta property="og:url" content="https://jyotishhardev.com/til-vichar" />
        <meta property="og:title" content="Til Vichar — Mole Reading · JyotishHardev" />
        <meta property="og:description" content="Vedic science of moles (Samudrika Shastra). Decode the meaning of moles by color, shape, and body location according to classical Til Vichar traditions." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Til Vichar — Mole Reading · JyotishHardev" />
        <meta name="twitter:description" content="Vedic science of moles (Samudrika Shastra). Decode the meaning of moles by color, shape, and body location according to classical Til Vichar traditions." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <PublicNav activePage="til-vichar" />

        {/* Page header */}
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '40px 24px 32px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: C.rose, marginBottom: 12 }}>
              Samudrika Shastra
            </p>
            <h1 style={{
              fontFamily: "'Tiro Devanagari Hindi', Georgia, serif",
              fontSize: 36, fontWeight: 700, color: C.text,
              lineHeight: 1.2, marginBottom: 12,
            }}>
              Til Vichar
            </h1>
            <p style={{ fontSize: 16, color: C.textMid, maxWidth: 580, lineHeight: 1.7, margin: 0 }}>
              The Vedic art of reading moles — their color, shape, and placement on the body — as windows into karma, character, and destiny.
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{
          background: C.surface,
          borderBottom: `1px solid ${C.border}`,
          position: 'sticky', top: 52, zIndex: 50,
          overflowX: 'auto',
        }}>
          <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', gap: 0 }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '13px 18px',
                  fontSize: 13, fontWeight: 600,
                  whiteSpace: 'nowrap',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: activeTab === tab.key ? C.rose : C.textMid,
                  borderBottom: activeTab === tab.key ? `2px solid ${C.rose}` : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >{tab.label}</button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px 80px' }}>
          {renderTab()}
        </div>

        {/* CTA */}
        <div style={{ background: C.surface, borderTop: `1px solid ${C.border}`, padding: '48px 24px' }}>
          <div style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{
              fontFamily: "'Tiro Devanagari Hindi', Georgia, serif",
              fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 12,
            }}>
              See How Your Moles Connect to Your Chart
            </h2>
            <p style={{ fontSize: 15, color: C.textMid, lineHeight: 1.7, marginBottom: 28 }}>
              Til Vichar becomes most powerful when read alongside your birth chart. Generate your free Kundli to see both together.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/" style={{
                display: 'inline-block',
                background: C.rose, color: C.white,
                fontWeight: 700, fontSize: 15,
                padding: '13px 32px', borderRadius: 28,
                textDecoration: 'none',
              }}>
                Generate free Kundli →
              </Link>
              <Link href="/palmistry" style={{
                display: 'inline-block',
                border: `1px solid ${C.border}`, color: C.textMid,
                fontWeight: 600, fontSize: 14,
                padding: '13px 28px', borderRadius: 28,
                textDecoration: 'none',
              }}>
                Explore Palmistry →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TilVicharPage;
