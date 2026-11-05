import { detectCrisis, containsPhrase } from './safety';

describe('detectCrisis', () => {
  it.each([
    'I want to kill myself',
    "I don't want to live anymore",
    'i dont want to wake up tomorrow',
    'Thinking about ending my life.',
    "I've been cutting myself again",
    'everyone would be better off without me',
    'SUICIDE',
    "I can't do this anymore",
  ])('flags: %s', (text) => {
    expect(detectCrisis(text)).toBe(true);
  });

  it.each([
    'I had a great day at the park',
    'I want to build a new skill',
    'This killer workout destroyed me',
    'I feel a bit sad today',
    '',
  ])('does not flag: %s', (text) => {
    expect(detectCrisis(text)).toBe(false);
  });
});

describe('containsPhrase', () => {
  it('matches whole words only', () => {
    expect(containsPhrase('I made dinner', 'mad')).toBe(false);
    expect(containsPhrase('I am so mad', 'mad')).toBe(true);
  });
});
