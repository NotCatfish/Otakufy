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
