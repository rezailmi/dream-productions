import { AnySleepData, WhoopSleepData, SleepSession } from '../types';

export interface UserProfile {
  age?: number;
  nationality?: string;
  gender?: string; // man | woman | nonbinary (free text tolerated)
}

export type Category =
  | 'Wealth'
  | 'Love'
  | 'Career'
  | 'Danger'
  | 'Health'
  | 'Family'
  | 'Animals'
  | 'Water'
  | 'Food'
  | 'Travel'
  | 'Spiritual'
  | 'Death';

type TemplateOptions = {
  category?: Category;
  profile?: UserProfile;
};

const COLOR_PALETTES = [
  'grays, desaturated blues, institutional beige',
  'muted browns, cool grays, washed whites',
  'cold whites, steel gray, concrete tones',
  'faded beiges, dusty colors, neutral tones',
];

const PRIMARY_PALETTES = [
  'institutional grays, muted blues, neutral beiges',
  'desaturated browns, cool whites, concrete tones',
];

const EMOTIONAL_COLOR = [
  'Emotionally cold and detached',
  'Clinically neutral',
  'Numbly institutional',
];

const LIGHTING_LIST = [
  'Office fluorescents, window light, lamp glow, screen glow, dusk, ambient',
];

const LIGHTING = [
  'Fluorescent lights humming overhead',
  'Late afternoon light through window',
  'Dim lamp glow',
  'Cold bathroom light',
  'Screen glow in dark room',
  'Morning light filtering in',
];

const AMBIENT_SOUNDS = [
  'Quiet hum',
  'Distant traffic',
  'Fluorescent buzz',
  'Complete silence',
  'Soft echo',
  'Muted city sounds',
];

const BODY_PARTS = ['hand', 'hands', 'fingers', 'feet', 'arms'];
const FRAME_POSITIONS = ['bottom of frame', 'edge of frame', 'sides', 'at bottom'];
const ACTION_STATES = [
  'resting on surface, not moving',
  'hovering over object, not touching',
  'visible but completely still',
  'at sides, motionless',
  'just present, no action',
];

const LOCATIONS = [
  'OFFICE HALLWAY',
  'APARTMENT CORNER',
  'BATHROOM SINK',
  'PARKING LOT',
  'STAIRWELL',
  'KITCHEN COUNTER',
  'BED CORNER',
  'WINDOW VIEW',
  'DESK SURFACE',
  'ELEVATOR INTERIOR',
  'EMPTY ROOM',
  'CORRIDOR',
];

const CATEGORY_SYMBOLS: Record<Category, string[]> = {
  Wealth: ['coin on floor', 'ATM screen', 'empty wallet', 'receipt pile'],
  Love: ['empty chair', 'phone screen', 'second toothbrush', 'unused pillow'],
  Career: ['elevator buttons', 'conference table', 'desk lamp', 'parking pass'],
  Danger: ['locked door', 'exit sign', 'flickering light', 'empty hallway'],
  Health: ['medicine cabinet', 'bathroom mirror', 'appointment card', 'pill bottle'],
  Family: ['old photograph', 'dining table', 'childhood toy', 'family portrait'],
  Animals: ['pet bowl', 'claw marks', 'fur on couch', 'empty cage'],
  Water: ['wet floor', 'dripping faucet', 'rain on window', 'puddle reflection'],
  Food: ['empty plate', 'refrigerator light', 'unwashed dishes', 'takeout container'],
  Travel: ['suitcase corner', 'ticket stub', 'map on wall', 'passport on table'],
  Spiritual: ['prayer mat', 'incense holder', 'meditation cushion', 'religious text'],
  Death: ['wilted flower', 'stopped clock', 'empty frame', 'closed door'],
};

const COLOR_TRANSITIONS = [
  'drain: grays → silver → soft white',
  'progressively desaturate to white',
];

const MOOD_PROGRESSIONS = [
  'Quiet waiting → hesitant presence → numb routine → passive observation → detached distance → ambiguous dissolution',
  'Still observation → minimal movement → quiet hesitation → present absence → distant contemplation → unclear boundary',
];

const pick = <T,>(arr: T[], indexSeed: number): T => arr[Math.abs(indexSeed) % arr.length];

function asWhoop(data: AnySleepData): data is WhoopSleepData {
  return (data as WhoopSleepData).score !== undefined;
}

function deriveMetrics(data: AnySleepData) {
  if (asWhoop(data)) {
    const s = data.score;
    const sum = s?.stage_summary;
    return {
      totalMinutes: sum ? Math.round(sum.total_in_bed_time_milli / 60000) : undefined,
      remMinutes: sum ? Math.round(sum.total_rem_sleep_time_milli / 60000) : undefined,
      deepMinutes: sum ? Math.round(sum.total_slow_wave_sleep_time_milli / 60000) : undefined,
      cycles: sum?.sleep_cycle_count,
      wakeUps: sum?.disturbance_count,
      performance: s?.sleep_performance_percentage,
      respiratory: s?.respiratory_rate,
      startISO: data.start,
    };
  } else {
    const sess = data as SleepSession;
    const remMinutes = sess.stages.filter(st => st.type === 'REM').reduce((a, b) => a + b.durationMinutes, 0);
    const deepMinutes = sess.stages.filter(st => st.type === 'Deep').reduce((a, b) => a + b.durationMinutes, 0);
    return {
      totalMinutes: sess.totalDurationMinutes,
      remMinutes,
      deepMinutes,
      cycles: sess.remCycles.length,
      wakeUps: sess.wakeUps,
      performance: { poor: 60, fair: 75, good: 85, excellent: 95 }[sess.sleepQuality] ?? 75,
      respiratory: Math.round((sess.heartRateData.averageBPM || 60) / 4),
      startISO: `${sess.date}T${sess.startTime}Z`,
    };
  }
}

function inferSpaceTypeByTime(startISO?: string): string {
  if (!startISO) return 'domestic spaces';
  try {
    const hour = new Date(startISO).getUTCHours();
    if (hour >= 1 && hour < 3) return 'work environments';
    if (hour >= 3 && hour < 5) return 'private spaces';
    return 'liminal spaces';
  } catch {
    return 'domestic spaces';
  }
}

function minimalMovement(respiratory?: number): string[] {
  if (respiratory == null) return [
    'Standing still',
    'Hand resting',
    'Not moving',
    'Just present',
    'Completely still',
    'Motionless',
  ];
  if (respiratory > 17) return [
    'Walking forward',
    'Moving hand',
    'Shifting position',
    'Subtle reposition',
    'Finger twitches slightly',
    'Weight shifts imperceptibly',
  ];
  return [
    'Standing still',
    'Hand resting',
    'Not moving',
    'Just present',
    'Completely still',
    'Motionless',
  ];
}

function colorPrimary(performance?: number) {
  if (performance == null) return PRIMARY_PALETTES[0];
  if (performance >= 85) return PRIMARY_PALETTES[0];
  if (performance >= 70) return PRIMARY_PALETTES[0];
  return PRIMARY_PALETTES[1];
}

function colorTransition(performance?: number) {
  return performance != null && performance < 70 ? COLOR_TRANSITIONS[1] : COLOR_TRANSITIONS[0];
}

function chooseCategoryExplicitOrDefault(category?: Category): Category {
  return category ?? 'Health';
}

export function buildVeoPromptFromWhoop(data: AnySleepData, opts: TemplateOptions = {}): string {
  const metrics = deriveMetrics(data);
  const category = chooseCategoryExplicitOrDefault(opts.category);
  const symbols = CATEGORY_SYMBOLS[category];
  const spaceType = inferSpaceTypeByTime(metrics.startISO);
  const movement = minimalMovement(metrics.respiratory);

  const seed = (metrics.totalMinutes ?? 0) + (metrics.remMinutes ?? 0) + (metrics.wakeUps ?? 0);

  const p0 = pick(COLOR_PALETTES, seed + 1);
  const p1 = pick(COLOR_PALETTES, seed + 2);
  const p2 = pick(COLOR_PALETTES, seed + 3);
  const primary = colorPrimary(metrics.performance);
  const emoColor = pick(EMOTIONAL_COLOR, seed + 4);
  const lighting0 = pick(LIGHTING, seed + 5);
  const lighting1 = pick(LIGHTING, seed + 6);
  const lighting2 = pick(LIGHTING, seed + 7);
  const body0 = pick(BODY_PARTS, seed + 8);
  const body1 = pick(BODY_PARTS, seed + 9);
  const body2 = pick(BODY_PARTS, seed + 10);
  const frame0 = pick(FRAME_POSITIONS, seed + 11);
  const frame1 = pick(FRAME_POSITIONS, seed + 12);
  const frame2 = pick(FRAME_POSITIONS, seed + 13);
  const action0 = pick(ACTION_STATES, seed + 14);
  const action1 = pick(ACTION_STATES, seed + 15);
  const action2 = pick(ACTION_STATES, seed + 16);
  const loc0 = pick(LOCATIONS, seed + 17);
  const loc1 = pick(LOCATIONS, seed + 18);
  const loc2 = pick(LOCATIONS, seed + 19);
  const loc3 = pick(LOCATIONS, seed + 20);
  const loc4 = pick(LOCATIONS, seed + 21);
  const loc5 = pick(LOCATIONS, seed + 22);
  const sym0 = symbols[0];
  const sym1 = symbols[1];
  const sym2 = symbols[2];
  const sym3 = symbols[3];
  const sound0 = pick(AMBIENT_SOUNDS, seed + 23);
  const sound1 = pick(AMBIENT_SOUNDS, seed + 24);
  const sound2 = pick(AMBIENT_SOUNDS, seed + 25);
  const sound3 = pick(AMBIENT_SOUNDS, seed + 26);
  const sound4 = pick(AMBIENT_SOUNDS, seed + 27);
  const sound5 = pick(AMBIENT_SOUNDS, seed + 28);
  const colorTrans = colorTransition(metrics.performance);
  const moodProg = pick(MOOD_PROGRESSIONS, seed + 29);

  const who = opts.profile?.age && opts.profile?.nationality && opts.profile?.gender
    ? `${opts.profile.age}-year-old ${opts.profile.nationality} ${opts.profile.gender}`
    : 'viewer';

  return (
`4-second restrained memory fragment. FIRST-PERSON perspective throughout - ${who}'s point of view. Quiet, grounded, emotionally detached. JUMP CUTS between spaces without explanation. CRITICAL: NO UI elements whatsoever - no timestamps, no frame counters, no progress bars, no percentage indicators, no loading screens, no overlays. Clean cinematic output only. Subtle vignette (40% opacity) throughout. VERTICAL 9:16 format.

[0-1s] ${loc0}
Static first-person view. Looking at ${sym0} in ${loc0.toLowerCase()}. ${lighting0}. Viewer's ${body0} visible at ${frame0}, ${action0}. Muted ${p0}. ${sound0}. Detached presence.

[1-2s] JUMP CUT - ${loc1}
Abrupt JUMP CUT - now in ${loc1.toLowerCase()}. Looking at ${sym1}. Viewer's ${body1} visible at ${frame1}, ${action1}. ${lighting1}. Desaturated ${p1}. ${sound1}. Passive witnessing.

[2-3s] JUMP CUT - ${loc2}
JUMP CUT - now in ${loc2.toLowerCase()}. Looking at ${sym2}. Viewer's ${body2} ${action2}. ${lighting2}. ${p2}. ${sound2}. Emotionally distant.

[3-4s] JUMP CUT - ${loc3}
JUMP CUT - ${loc3.toLowerCase()}. Looking at ${sym0}. Viewer's ${body0} ${movement[3]}. Colors ${colorTrans}. Fade to white. Ambiguous emptiness.

TRANSITIONS: Abrupt JUMP CUTS between disconnected ${spaceType}. Fragments of ${category.toLowerCase()}. No narrative - just emotional residue.

COLORS: Desaturated throughout - ${primary}. No warmth. ${emoColor}.

LIGHTING: Natural, muted. ${LIGHTING_LIST[0]}. Never dramatic.

STYLE: "Severance" institutional minimalism meets "Eternal Sunshine" memory fragmentation. Minimal observation of absence. Restrained non-narrative.

FIRST-PERSON POV throughout. ABSOLUTELY NO surreal elements - no fantasy, no glowing. Only grounded, quiet spaces that hint at ${category.toLowerCase()} through minimal details: ${sym0}, ${sym1}, ${sym2}, ${sym3}.

MOOD: ${moodProg}. Each JUMP CUT fragments ${category.toLowerCase()} awareness.`
  );
}


