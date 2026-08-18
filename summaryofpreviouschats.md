# Summary of Previous Chats

## Flashcard Practice (Reading Input)
- **Feature Overview**: The reading input for flashcard practice captures user input (romaji) and instantly converts it to Kana using `wanakana.toKana()`. 
- **Recent Update**: The input field was enhanced to explicitly disable mobile auto-capitalization (`autoCapitalize="none"`, `autoComplete="off"`, `autoCorrect="off"`, `spellCheck="false"`) and all input values are strictly cast to `.toLowerCase()` before Wanakana conversion. This ensures that the output is strictly Hiragana, preventing unexpected Katakana conversions that occur when mobile keyboards automatically send uppercase characters.
