# 03. Database Schema & Data Pipeline (Chronological Phase 3)

## PostgreSQL Schema Structure (`public`)
- **Tables (`16/16` with RLS)**: `profiles`, `user_decks`, `user_card_progress`, `quiz_sessions`, `suggestions`, `suggestion_votes`, `kanji_cards`, `grammar_cards`, `vocabulary_cards`, `user_friends`, `friend_requests`, `leaderboard_cache`, etc.
- **Anti-DoS Scalable Shuffling (`get_random_deck`)**: Replaced slow `ORDER BY random()` and legacy `.range()` queries with CTE indexed slice queries capable of shuffling **14,187+** total N5–N1 questions in milliseconds.

## Data Pipeline & Seeds (`data_pipeline/`)
- **Master Seed Files**: Strictly organized under `vocabulary/`, `kanji/`, `grammar/`, and `comprehension/`.
- **Sanitation Rules**: All strings and arrays across the SQL seed files have been stripped of rogue characters (`~` tildes) and malformed UTF-8 symbols.
- **Zero-Trash Hygiene**: All temporary patch scripts (`patch_100.js`, `DatabasePatcher.js`) have been purged immediately after execution.
