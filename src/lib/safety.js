// Crisis-language detection for SoulSpace.
// This runs BEFORE any other chat reply, and after journal/mood saves.
// It errs on the side of caution: showing support to someone who didn't
// need it costs little; missing someone who did need it costs a lot.

const CRISIS_PHRASES = [
  'suicide', 'suicidal', 'kill myself', 'killing myself',
  'end my life', 'ending my life', 'end it all', 'take my own life', 'take my life',
  'want to die', 'wanna die', 'want to be dead', 'wish i was dead', 'wish i were dead',
  'better off dead', 'better off without me', 'no reason to live', 'nothing to live for',
  'dont want to live', 'dont want to be alive', 'dont want to wake up',
  'dont want to be here anymore', 'not want to be here anymore',
  'cant go on', 'cant do this anymore', 'no way out',
  'hurt myself', 'hurting myself', 'harm myself', 'self harm', 'selfharm',
  'cut myself', 'cutting myself', 'overdose', 'jump off',
];

// Lowercase, remove apostrophes ("don't" -> "dont"), turn other punctuation
// into spaces, and collapse repeated spaces, so phrasing variations still match.
export function normalize(text) {
  return ` ${String(text || '')
    .toLowerCase()
    .replace(/[\u2019'`]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()} `;
}

// Whole-word / whole-phrase match, so "skill" never matches "kill".
export function containsPhrase(text, phrase) {
  return normalize(text).includes(` ${phrase} `);
}

export function detectCrisis(text) {
  return CRISIS_PHRASES.some((phrase) => containsPhrase(text, phrase));
}

// Verified Nov 2026 via Find A Helpline (findahelpline.com), a directory
// maintained by ThroughLine. Numbers can change: re-check periodically.
export const CRISIS_RESOURCES = {
  checked: 'November 2026',
  nigeria: {
    name: 'SURPIN — Suicide Research and Prevention Initiative',
    description: '24-hour helpline offering counselling, support and referrals across Nigeria.',
    lines: [
      { label: 'MTN', number: '+234 903 440 0009' },
      { label: '9mobile', number: '+234 908 021 7555' },
      { label: 'Hausa', number: '+234 814 224 1007' },
    ],
  },
  emergency: { label: 'Emergency (Nigeria)', number: '112' },
  directory: {
    name: 'Find A Helpline',
    url: 'https://findahelpline.com',
    description: 'Free, confidential helplines in over 100 countries.',
  },
};

export function telHref(number) {
  return `tel:${number.replace(/[^\d+]/g, '')}`;
}
