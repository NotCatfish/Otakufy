import * as wanakana from 'wanakana';

export const validateField = (input, correctList, isReading = false) => {
  let normalizedInput = input
    .replace(/[.,;:\!\?\/\\\-_()\[\]{}|~～]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
    
  if (!normalizedInput) return false;

  if (isReading) {
    normalizedInput = wanakana.toKana(normalizedInput);
  }

  const validAnswers = correctList.flatMap(ans => 
      ans.split(',').map(a => a.replace(/[.,;:\!\?\/\\\-_()\[\]{}|~～]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase())
  ).filter(a => a.length > 0);

  if (validAnswers.includes(normalizedInput)) return true;

  const ignoredWords = ['to', 'a', 'an', 'the', 'some', 'something', 'someone'];
  const userTokens = normalizedInput.split(' ').filter(t => !ignoredWords.includes(t) && t.length > 0);
  
  for (const validAns of validAnswers) {
      const ansTokens = validAns.split(' ').filter(t => !ignoredWords.includes(t) && t.length > 0);
      
      // Exact match after ignoring articles
      if (userTokens.length === ansTokens.length && userTokens.every(t => ansTokens.includes(t))) {
          return true;
      }
  }

  return false;
};
