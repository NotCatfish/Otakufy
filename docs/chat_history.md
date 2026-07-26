# 🏯 Otakufy: Chronological Feature State & Master Sync Log

**Purpose:** A strict chronological inventory of implemented features across Otakufy's evolution from Phase 1 (Core Architecture) to Phase 10 (Master Security Suite & Vault Hardening). In accordance with the `antigravityrule.txt` Documentation Sync protocol, this file tracks our structural state and points to atomic feature files inside `/master_readme/features/`.

---

## 📅 Chronological Implementation Index

### [PHASE 01: Authentication & Identity Architecture]
- **Documentation**: /docs/feature_archive.md
- **State**: Multi-modal auth (`LoginForm.js`) supporting standard email/password, instant Google OAuth linking (`signInWithOAuth`), and mandatory recovery modals on `?reset=true`. Hydrates sessions on the server via `@supabase/ssr` (`app/page.js`) before DOM mount. Profile updates require re-authentication verification (`ProfileSettings.js`). To strictly protect PII and prevent email prefix exposure, the Postgres `handle_new_user()` trigger automatically generates gamified `Adjective + Noun` Japanese/Anime usernames (`SakuraRonin#4821`, `CyberKitsune#9102`) for all new accounts.

### [PHASE 02: Quiz Engine & Spaced Repetition (SRS) State Machine]
- **Documentation**: /docs/feature_archive.md
- **State**: Native multi-stage SPA flow (`useQuizEngine.js` & `FlashcardView.jsx`). Enforces strict JLPT pedagogical rules where Furigana (`{}`) is dynamically masked during testing. Includes automatic `sessionStorage` recovery if refreshed mid-quiz, multiple `localStorage` custom save slots, and fractional accuracy badges (`mastered / total_pool`). Enforces cache key `v9` to prevent IndexedDB stale limits. The pre-quiz setup screen (`QuizSetup.jsx`) is now fully integrated with the Phase 4 UI design system, utilizing staggered `RevealText` and `SmoothFade` animations to maintain cinematic consistency with the main dashboard.

### [PHASE 03: PostgreSQL Schema & Scalable Data Pipeline]
- **Documentation**: /docs/feature_archive.md
- **State**: 16 tables across `public` (`profiles`, `kanji_cards`, `grammar_cards`, `vocabulary_cards`, `suggestions`, `user_friends`, `leaderboard_cache`, etc.), all protected by Row Level Security. Eradicated slow `ORDER BY random()` and legacy `.range()` queries, replacing them with `get_random_deck` CTE slice queries capable of shuffling **14,187+** questions in milliseconds. Seed files sanitized of rogue characters and zero-trash hygiene enforced.

### [PHASE 04: UI Design System, 5-Season Dynamic Themes & Official JLPT Typography]
- **Documentation**: /docs/feature_archive.md
- **State**: Developer Matte dark palette (`#0a0a0a` base, `#1c1c1c` borders) and a fully dynamic **5-Season Japanese Light Theme System** featuring adaptive glassmorphism (`backdrop-filter: blur(12px)`, dynamic `--theme-rgb` opacity shadows, and `0.08` background alpha). The UI leverages a unified seasonal clock (0-indexed months) to automatically transition between: (1) **Spring / Sakura** (Mar-May, `#D94676`), (2) **Early Summer / Tsuyu** (Jun, `#0EA5E9`), (3) **Late Summer / Natsu** (Jul-Aug, `#10B981`), (4) **Autumn / Aki** (Sep-Nov, `#F59E0B`), and (5) **Winter / Fuyu** (Dec-Feb, `#8B5CF6`). In Light Mode, text remains a sharp calligraphy ink (`#26161C`) across all seasons to maintain textbook clarity, while accents, rings, and glowing glass borders adapt to the season. The dashboard natively integrates `DynamicSeasonalAnimation.jsx`, rendering a highly optimized `<canvas>` background that overlays season-specific particles (falling Sakura, glowing Matsuri Lanterns, Sun Shower rain, Bamboo leaves, and Day Snow) synced perfectly to the active theme CSS class. On initial load, particles wait 1 second and gradually fall from off-screen, and strictly fade-out gradually via hardware-accelerated alpha interpolation upon entering active drill modes (`FlashcardView.jsx`). Uses `Noto Serif JP` and `Noto Sans JP` alongside `Yu Mincho` / `MS Mincho` to replicate official Japanese Ministry of Education textbook standards (`公式 JLPT 試験体 / 教科書体`). SPA history overrides (`/dashboard` trapped root) prevent accidental exits. Features a highly-cinematic, staggered component fade (`SmoothFade.jsx`) combined with character-by-character blur reveals (`RevealText.jsx`) on the dashboard and setup screens. Includes Focus/Drill modes to disable animations for instant zero-latency drills. Governed by Rule 11 (Regression Prevention) to strictly maintain pre-existing functionality and animations during updates.

### [PHASES 06–10: Full-Stack Security, Anti-Cheat & Vault Hardening]
- **Documentation**: /docs/feature_archive.md
- **State (30/30 Master Verification Tests Passed)**:
  1. **Enterprise Edge Headers (`proxy.js`)**: Attach `Content-Security-Policy`, `Strict-Transport-Security` (`HSTS`), `X-Frame-Options: DENY`, and `X-Content-Type-Options: nosniff`. Sentry observability configured.
  2. **RLS & Anti-Cheat Triggers**: `16/16` tables enforce RLS. `tr_protect_profile_fields` blocks XP spoofing and time manipulation. Insecure `run_raw_sql` dropped.
  3. **IDOR & Auth Hardening**: `get_friends`, `search_users`, and `get_leaderboard_state` strictly check `auth.uid()`. GoTrue password policies enforce min length $\ge 8$ and re-authentication on update.
  4. **Strict Sanitation & Anti-DoS**: Triggers (`tr_sanitize_profiles`, `tr_sanitize_suggestions`) and frontend utility (`lib/sanitize.js`) strip HTML/script tags. All dictionary search APIs enforce hard `LIMIT` bounds (`100–200`).
  5. **Deep Hardening & OOM Protection**: `bulk_update_kanji_data` restricted to admin/service role. Ungated `award_quiz_xp(integer)` dropped and 15-second cooldown enforced on `award_quiz_xp(uuid, integer)`. In-memory rate limiter (`lib/rateLimit.js`) includes LRU size clamping (`store.size > 5000`) and 5-minute sweeps against IP spoofing.
  6. **Sanitized Vault (`sensitivedata`)**: Consolidated all secrets, project URLs, and credentials into `c:/Users/lenovo/Desktop/otakufy/sensitivedata` and local `.env` files. Root and web `.gitignore` strictly ignore `.env*`, `sensitivedata*`, `client_secret_*.json`, and `*.credentials.json`. 0 traces of hardcoded secrets or admin UUIDs remain across source code.
  8. **Keep-Alive Auto-Ping & Production Purge (`Pre-Deployment`)**: Built multi-layer keep-alive architecture (`web/src/app/api/cron/keepalive/route.js`, `vercel.json`, and `.github/workflows/keepalive.yml`) to prevent Supabase Free-Tier pause. Wiped 100% of test users (`auth.users = 0 rows`) and user tables while verifying 100% integrity of all 14,247+ curriculum cards (`kanji_data`, `vocabulary_questions`, etc.).

### [PHASE 11: Atomic Row Locking & Day Streak Sync]
- **Documentation**: /docs/feature_archive.md
- **State**: Upgraded `award_quiz_xp` and `claim_quest_reward` with Postgres `FOR UPDATE` row-level locking to eliminate double-spending and race conditions. Added real-time Day Streak Badge (`🔥 {streak} Day Streak`) directly to main dashboard (`DashboardClient.jsx`).

### [PHASE 12: Frontend Optimization & Feature Redundancy Refactoring]
- **Documentation**: /docs/feature_archive.md
- **State**: Executed a 3-Phase aggressive DRY refactoring sprint across the `/features` folder to reduce bloat, improve maintainability, and abstract state logic:
  1. **Auth & Quests**: Extracted repetitive inline SVGs and alert banners into `AuthUIHelpers.jsx`. Optimized `DailyObjectives.jsx` by lifting heavy `toKanji` utility functions outside the render loop, drastically improving React render cycles.
  2. **Profile & Suggestions**: Consolidated list filtering in `SocialHub.js`. Completely stripped API and sorting logic from `SuggestionsBoard.jsx` (292 lines → 138 lines) into a standalone custom hook (`hooks/useSuggestions.js`).
  3. **Practice Core Loop**: Extracted the pure quiz validation logic from the massive `useQuizEngine.js` into `validationUtils.js` to preserve strict JLPT punctuation stripping rules. Decoupled `FlashcardView.jsx` by migrating the `FuriganaText` DOM parser and the `SaveProgressModal` into dedicated standalone components.

### [PHASE 13: UX Polish & API DRY Refactoring]
- **Documentation**: /docs/feature_archive.md
- **State**: 
  1. **Animation State Tracking**: Implemented `sessionVisitCounter.js` (Map-based with `sessionStorage` fallback) to track visited sub-pages (e.g., Kanji > N5). Created `PageAnimationGate` context provider to dynamically bypass entrance animations (`skipAnimation`) for previously visited screens within the same active session, ensuring a snappy SPA feel.
  2. **Transition Engine Optimization**: Solved the massive "blank screen" navigation delay. Stripped hardcoded `2500ms` delays from practice modules, globally reduced `triggerExitTransition` from `1500ms` to `800ms`, and forced instant `isExiting = false` resets exactly as the Promise resolves to eliminate invisible stutter frames.
  3. **API DRY Refactoring**: Cleaned the `api/src/routers` folder. Extracted highly repetitive security dependencies (`verify_csrf_token` and `extract_unverified_jwt_token`) across `submission.py` and `upload.py` into a highly-compact shared `SECURE_DEPS` tuple in `security.py`, drastically reducing visual clutter on endpoints without expanding line counts.
