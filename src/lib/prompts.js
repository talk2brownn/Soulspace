// Writing prompts, matched to how you checked in today.
export const PROMPTS = {
  Happy: [
    'What made today feel good? Try to remember the small details.',
    'Who or what would you like to thank for today?',
    "How can you bring a little of today's energy into tomorrow?",
  ],
  Excited: [
    "What are you looking forward to, and why does it matter to you?",
    'Describe the moment the excitement started.',
    "What's one step you can take this week toward it?",
  ],
  Grateful: [
    'List three things you are grateful for, and why each one matters.',
    'Write a short thank-you note to someone (you never have to send it).',
    'What is something ordinary you would miss if it were gone?',
  ],
  Peaceful: [
    'What helped you feel settled today?',
    "Describe where you are right now using all five senses.",
    'What would you like to remember about this calm?',
  ],
  Tired: [
    'What took the most energy today?',
    'What is one thing you can let go of tomorrow?',
    'What would real rest look like for you this week?',
  ],
  Anxious: [
    "What's on your mind? Write it all down, then circle what you can control.",
    "What's the worst that could happen, and how would you cope with it?",
    'What has helped you get through a worry like this before?',
  ],
  Sad: [
    "What's weighing on you? You don't need to fix it, just name it.",
    'What would you say to a friend who felt the way you do?',
    'What is one small, kind thing you could do for yourself today?',
  ],
  Angry: [
    'What happened, and what did it make you feel underneath the anger?',
    'What boundary or need does this anger point to?',
    "Write what you'd like to say, unfiltered. Nobody else will read it.",
  ],
  default: [
    "What's taking up the most space in your mind today?",
    'What is one thing you learned about yourself this week?',
    'Describe today in three words, then explain each one.',
    "What's something you're proud of, however small?",
  ],
};

export function promptsFor(moodLabel) {
  return PROMPTS[moodLabel] || PROMPTS.default;
}
