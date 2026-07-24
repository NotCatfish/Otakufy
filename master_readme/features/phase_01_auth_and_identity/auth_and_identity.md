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
