# 04. UI Design System & Official JLPT Typography (Chronological Phase 4)

## Developer Matte & Official Japanese Fonts (`globals.css` & `layout.js`)
- **Palette**: Solid `#0a0a0a` matte background with `#1c1c1c` crisp border tokens. Zero drop-shadows or blurry glows to maintain razor-sharp optical contrast.
- **Official JLPT Examination Stack**: Global typography prioritizes `Noto Serif JP` (`--font-noto-serif`) and `Noto Sans JP` (`--font-noto-sans`) alongside fallback to `Yu Mincho`, `MS Mincho`, `Yu Gothic`, replicating official Japanese Ministry of Education textbook standards (`公式 JLPT 試験体 / 教科書体`).
- **Title Case Formatting**: Top bar navigation (`Otakufy`, `Dashboard`, `Dictionary`, `Leaderboard`, `Profile`, `Settings`, `Suggestions`) strictly enforces human-readable Title Case.

## SPA Navigation & Trapped Root Hierarchy (`PageContainer.jsx` & History API)
- **Trapped Dashboard Root (`/dashboard`)**: Prevents accidental application exits by overriding standard browser history popstate events.
- **Escape / Return Interception**: Pressing Escape or clicking back buttons programmatically traverses the internal app state hierarchy rather than kicking the user out of the site.
- **DRY Page Layouts**: Every route wraps content using the shared `PageContainer.jsx` component for unified responsive widths (`max-w-7xl`).
