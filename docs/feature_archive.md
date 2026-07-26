# Otakufy Master Feature Archive

This document is a consolidated archive of all phase-specific feature documentation.


---

<!-- SOURCE: phase_01_auth_and_identity/auth_and_identity.md -->

# 01. Authentication & Identity Architecture (Chronological Phase 1)

## Frontend Implementation (`features/auth/`)
- **Supabase Client (`supabaseClient.js`)**: Initializes `@supabase/supabase-js` using environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- **Login Modal & Form (`LoginForm.js`)**: Supports multi-modal authentication:
  - Standard Email / Password (`signInWithPassword`).
  - Instant Google OAuth linking (`signInWithOAuth({ provider: 'google' })`).
  - Automatic URL token listener (`onAuthStateChange`) detecting `PASSWORD_RECOVERY` or `?reset=true` to display a mandatory password setup modal.
- **SSR & Middleware Auth**: Uses `@supabase/ssr` to hydrate user sessions on the server before DOM mount (`web/src/app/page.js`), eliminating client-side layout shifts.

## Backend & Database Identity Rules
- **RLS Enforcement**: Every user identity (`profiles`) is protected by Postgres Row Level Security (`auth.uid() = id`).
- **Gamified Adjective+Noun Username Generator (`handle_new_user`)**: To strictly prevent PII or email prefix leakage on sign-up, the Postgres `on_auth_user_created` trigger (`handle_new_user()`) automatically assigns new accounts a randomized Japanese/Anime gamified handle (`Adjective + Noun` such as `SakuraRonin#4821` or `CyberKitsune#9102`) unless an explicit custom handle is provided.
- **Dual-Auth Identity Upgrade**: Google OAuth accounts without passwords can attach a secure password inside `ProfileSettings.js` (`updateUser({ password })`), turning their account into a hybrid dual-auth identity.
- **Secure Email Change (`ProfileSettings.js`)**: Requires mandatory re-authentication verification before issuing email change requests via `change-email` API endpoints.


---

<!-- SOURCE: phase_02_quiz_and_srs_engine/quiz_engine.md -->

# 02. Quiz Engine & SRS State Machine (Chronological Phase 2)

## Frontend UI (`FlashcardView.jsx` & `useQuizEngine.js`)
- **State Machine Flow**: `select_level` -> `select_vocab_type` -> `setup` -> `practice_card` -> `summary`.
- **Furigana Masking (`renderVocabText`)**: Enforces strict JLPT pedagogical rules where ruby characters (`{}`) are dynamically hidden during active testing and restored during review phase without leaking hints.
- **Client-Side Caching (`v9`)**: Hard cache invalidation (`sessionStorage` and IndexedDB/localForage) prevents stale legacy limits (`LIMIT 1000`) from clipping active card pools.

## State Persistence & Accuracy Metrics
- **Auto-Save & Recovery**: Automatic `sessionStorage` checkpoints save the active card queue every card transition, allowing instant recovery if the user hits F5/Refresh.
- **Manual Save Slots**: LocalStorage slots allow saving multiple custom deck configurations.
- **SRS Fractional Progress**: Accuracy calculation binds exact Spaced Repetition System graduation thresholds to a fractional UI badge (`mastered / total_pool`), decoupling progress from consecutive failure cycling.


---

<!-- SOURCE: phase_03_database_and_pipeline/database_and_pipeline.md -->

# 03. Database Schema & Data Pipeline (Chronological Phase 3)

## PostgreSQL Schema Structure (`public`)
- **Tables (`16/16` with RLS)**: `profiles`, `user_decks`, `user_card_progress`, `quiz_sessions`, `suggestions`, `suggestion_votes`, `kanji_cards`, `grammar_cards`, `vocabulary_cards`, `user_friends`, `friend_requests`, `leaderboard_cache`, etc.
- **Anti-DoS Scalable Shuffling (`get_random_deck`)**: Replaced slow `ORDER BY random()` and legacy `.range()` queries with CTE indexed slice queries capable of shuffling **14,187+** total N5–N1 questions in milliseconds.

## Data Pipeline & Seeds (`data_pipeline/`)
- **Master Seed Files**: Strictly organized under `vocabulary/`, `kanji/`, `grammar/`, and `comprehension/`.
- **Sanitation Rules**: All strings and arrays across the SQL seed files have been stripped of rogue characters (`~` tildes) and malformed UTF-8 symbols.
- **Zero-Trash Hygiene**: All temporary patch scripts (`patch_100.js`, `DatabasePatcher.js`) have been purged immediately after execution.


---

<!-- SOURCE: phase_04_ui_and_jlpt_typography/ui_and_typography.md -->

# 04. UI Design System & Official JLPT Typography (Chronological Phase 4)

## Developer Matte & Official Japanese Fonts (`globals.css` & `layout.js`)
- **Palette**: Solid `#0a0a0a` matte background with `#1c1c1c` crisp border tokens. Zero drop-shadows or blurry glows to maintain razor-sharp optical contrast.
- **Official JLPT Examination Stack**: Global typography prioritizes `Noto Serif JP` (`--font-noto-serif`) and `Noto Sans JP` (`--font-noto-sans`) alongside fallback to `Yu Mincho`, `MS Mincho`, `Yu Gothic`, replicating official Japanese Ministry of Education textbook standards (`公式 JLPT 試験体 / 教科書体`).
- **Title Case Formatting**: Top bar navigation (`Otakufy`, `Dashboard`, `Dictionary`, `Leaderboard`, `Profile`, `Settings`, `Suggestions`) strictly enforces human-readable Title Case.

## SPA Navigation & Trapped Root Hierarchy (`PageContainer.jsx` & History API)
- **Trapped Dashboard Root (`/dashboard`)**: Prevents accidental application exits by overriding standard browser history popstate events.
- **Escape / Return Interception**: Pressing Escape or clicking back buttons programmatically traverses the internal app state hierarchy rather than kicking the user out of the site.
- **DRY Page Layouts**: Every route wraps content using the shared `PageContainer.jsx` component for unified responsive widths (`max-w-7xl`).


---

<!-- SOURCE: phase_06_to_10_security_and_anti_cheat/security_and_anti_cheat.md -->

# 05. Full-Stack Security & Anti-Cheat Suite (Chronological Phases 6–10)

## Security Hardening Verification (30/30 Checks Passed)
- **Phase 6 (Edge Proxy & Observability)**: `web/src/proxy.js` attaches strict `Content-Security-Policy`, `Strict-Transport-Security` (`HSTS`), and `X-Frame-Options: DENY` headers. Sentry error monitoring active across client, server, and edge.
- **Phase 7 (RLS & Anti-Cheat Profile Triggers)**: 100% of tables (`16/16`) enforce Row Level Security. `run_raw_sql` dropped. `tr_protect_profile_fields` blocks client-side XP manipulation and time spoofing.
- **Phase 8 (API Auth & GoTrue Policies)**: IDOR guards inside `get_friends`, `search_users`, and `get_pending_requests`. GoTrue enforces minimum 8-character password lengths and mandatory re-authentication before sensitive modifications.
- **Phase 9 (Strict Input Sanitation & Anti-DoS)**: Postgres triggers (`tr_sanitize_profiles`, `tr_sanitize_suggestions`) and frontend utility (`lib/sanitize.js`) strip HTML/script injection. All dictionary search queries (`search_kanji_cards`, `search_grammar_cards`, etc.) enforce hard query pagination bounds (`LIMIT 100-200`).
- **Phase 10 (Deep Hardening & OOM Protection)**: `bulk_update_kanji_data` locked to `service_role`/admin only. Ungated `award_quiz_xp(integer)` dropped and 15-second cooldown enforced on `award_quiz_xp(uuid, integer)`. In-memory rate limiter (`lib/rateLimit.js`) includes LRU size clamping (`store.size > 5000`) and 5-minute cleanup intervals against IP spoofing DoS attacks.

## Consolidated Vault Management (`sensitivedata`)
- **Vault Location**: `c:/Users/lenovo/Desktop/otakufy/sensitivedata` (and `.env` / `.env.local`).
- **Sanitized Codebase**: All source code (`web/src/`, `features/`, `data_pipeline/`) is 100% sanitized of hardcoded strings, API keys, DSN URLs, and Admin UUIDs.
- **Strict Git Exclusions (`.gitignore`)**: Root and web `.gitignore` files strictly ignore `.env*`, `sensitivedata*`, `client_secret_*.json`, and `*.credentials.json` to prevent accidental credential leakage upon deployment.


---

<!-- SOURCE: phase_11_atomic_row_locking/atomic_locks.md -->

# 🔒 Atomic Row Locking & Double-Spend Prevention

**Phase 11 Implementation**

To eliminate race conditions and API double-spending when users submit high-frequency requests, we upgraded our critical transaction paths to use PostgreSQL `FOR UPDATE` row-level locking.

## 1. Context & Vulnerability
In a highly concurrent environment, a user rapidly clicking the "Claim Reward" or "Submit Quiz" button could theoretically bypass application-level validations. By the time Node.js validated their state, another concurrent request could also pass validation before the database actually deducted or updated the user's XP/Streak.

## 2. Row-Level Locking Implementation
We refactored `award_quiz_xp` and `claim_quest_reward` stored procedures to lock the user's profile row instantly during the transaction:

```sql
SELECT xp, current_streak, last_activity 
INTO user_xp, user_streak, user_last_activity 
FROM profiles 
WHERE id = user_uuid 
FOR UPDATE; -- Explicit row lock prevents concurrent modifications until commit
```

## 3. UI Synchronization
The frontend was updated to immediately reflect the true database state of these locks:
- Added a real-time Day Streak Badge (`🔥 {streak} Day Streak`) directly to the main dashboard (`DashboardClient.jsx`).
- State mutations are heavily debounced and blocked if a pending request is already flying to the backend.


---

<!-- SOURCE: phase_12_frontend_optimization/dry_architecture.md -->

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
