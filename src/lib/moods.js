// The 8 moods used across SoulSpace.
// `score` is a rough "heavier (1) to brighter (5)" scale used only for
// charts and trends. It's not a judgement: every mood is valid.
export const MOODS = [
  { emoji: '😊', label: 'Happy', color: '#FFD700', ocean: 'happy', score: 5 },
  { emoji: '😔', label: 'Sad', color: '#4A90D9', ocean: 'sad', score: 1 },
  { emoji: '😰', label: 'Anxious', color: '#7B68EE', ocean: 'anxious', score: 2 },
  { emoji: '😤', label: 'Angry', color: '#FF4500', ocean: 'angry', score: 1.5 },
  { emoji: '😴', label: 'Tired', color: '#708090', ocean: 'tired', score: 2.5 },
  { emoji: '🥰', label: 'Grateful', color: '#FF69B4', ocean: 'grateful', score: 4.5 },
  { emoji: '😌', label: 'Peaceful', color: '#20B2AA', ocean: 'peaceful', score: 4 },
  { emoji: '🤗', label: 'Excited', color: '#FF8C00', ocean: 'excited', score: 5 },
];

export function findMood(label) {
  return MOODS.find((m) => m.label === label) || null;
}

export function moodScore(label) {
  return findMood(label)?.score ?? 3;
}

// The mood whose score is closest to an average, for showing "your week felt like 😌".
export function moodForScore(score) {
  return MOODS.reduce((best, m) => (Math.abs(m.score - score) < Math.abs(best.score - score) ? m : best));
}
