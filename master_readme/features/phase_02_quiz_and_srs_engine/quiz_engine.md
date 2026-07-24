# 02. Quiz Engine & SRS State Machine (Chronological Phase 2)

## Frontend UI (`FlashcardView.jsx` & `useQuizEngine.js`)
- **State Machine Flow**: `select_level` -> `select_vocab_type` -> `setup` -> `practice_card` -> `summary`.
- **Furigana Masking (`renderVocabText`)**: Enforces strict JLPT pedagogical rules where ruby characters (`{}`) are dynamically hidden during active testing and restored during review phase without leaking hints.
- **Client-Side Caching (`v9`)**: Hard cache invalidation (`sessionStorage` and IndexedDB/localForage) prevents stale legacy limits (`LIMIT 1000`) from clipping active card pools.

## State Persistence & Accuracy Metrics
- **Auto-Save & Recovery**: Automatic `sessionStorage` checkpoints save the active card queue every card transition, allowing instant recovery if the user hits F5/Refresh.
- **Manual Save Slots**: LocalStorage slots allow saving multiple custom deck configurations.
- **SRS Fractional Progress**: Accuracy calculation binds exact Spaced Repetition System graduation thresholds to a fractional UI badge (`mastered / total_pool`), decoupling progress from consecutive failure cycling.
