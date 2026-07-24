# 06: Frontend Optimization & Feature Redundancy Refactoring

**Implementation Phase:** Phase 12
**Core Objective:** Aggressively reduce code bloat, extract state logic into custom hooks, and optimize React rendering loops across the frontend.

## 1. Auth & Quests Optimization
- **`AuthUIHelpers.jsx`:** Created a shared UI hub for recurring presentation components such as `<AlertError>`, `<AlertSuccess>`, `<EyeOpenIcon>`, and `<EyeClosedIcon>`.
- **`LoginForm.js`:** Stripped inline SVGs and migrated to the centralized helpers.
- **`DailyObjectives.jsx`:** Lifted the heavy `toKanji` parsing dictionary outside of the component's render loop to prevent re-instantiation on every render, drastically improving SPA performance during active quests.

## 2. Profile & Suggestions Modularity
- **`SocialHub.js`:** Identified identical local list filtering logic and abstracted it into a unified `filterUsers()` method.
- **`SuggestionsBoard.jsx`:** This component was carrying massive data fetching overhead. Extracted the entire Supabase API fetching, sorting, caching, and optimistic voting logic into a brand new custom hook: `hooks/useSuggestions.js`. The resulting component is purely presentational and reduced from 292 lines to just 138 lines.

## 3. Practice Core Loop Refactoring
- **`validationUtils.js`:** The core quiz state machine (`useQuizEngine.js`) contained embedded logic for parsing and validating user answers (removing punctuation, mapping kanji strings, and semantic matching). This pure logic was extracted into `validationUtils.js` to preserve the strict JLPT pedagogical functionality while unburdening the React hook.
- **`FuriganaText.jsx`:** Extracted the DOM parsing logic for injecting pedagogical ruby text (Furigana) out of the massive 750+ line `FlashcardView.jsx` component.
- **`SaveProgressModal.jsx`:** Decoupled the overlay modal UI that handles `localStorage` state saving from the main practice loop.
