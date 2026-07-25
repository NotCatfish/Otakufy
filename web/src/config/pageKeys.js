/**
 * Unique page/section keys for session-based animation tracking.
 * 
 * Each key identifies a distinct view the user can land on.
 * Used to check if the user has already visited a page/section
 * so we can skip entrance animations on repeat visits within the same session.
 * 
 * Naming convention: pg<number>_<descriptive_name>
 */

export const PAGE_KEYS = {
  // ─── Top-Level Routes ──────────────────────────────────
  DASHBOARD:          'pg1_dashboard',
  DICTIONARY:         'pg2_dictionary',
  LEADERBOARD:        'pg3_leaderboard',
  SETTINGS:           'pg4_settings',
  HELP:               'pg5_help',
  LOGIN:              'pg6_login',
  PROFILE:            'pg7_profile',
  FRIENDS:            'pg8_friends',
  SUGGESTIONS:        'pg9_suggestions',

  // ─── Practice > Category Level Selectors ───────────────
  KANJI_LEVELS:       'pg10_kanji_levels',
  VOCAB_LEVELS:       'pg11_vocab_levels',
  GRAMMAR_LEVELS:     'pg12_grammar_levels',
  COMPREHENSION_LEVELS: 'pg13_comprehension_levels',
  LISTENING_LEVELS:   'pg14_listening_levels',
  RANDOM_LEVELS:      'pg15_random_levels',

  // ─── Practice > Kanji > JLPT Level Sub-views ──────────
  KANJI_N5:           'pg16_kanji_n5',
  KANJI_N4:           'pg17_kanji_n4',
  KANJI_N3:           'pg18_kanji_n3',
  KANJI_N2:           'pg19_kanji_n2',
  KANJI_N1:           'pg20_kanji_n1',
  KANJI_SRS:          'pg21_kanji_srs',

  // ─── Practice > Vocabulary > JLPT Level Sub-views ─────
  VOCAB_N5:           'pg22_vocab_n5',
  VOCAB_N4:           'pg23_vocab_n4',
  VOCAB_N3:           'pg24_vocab_n3',
  VOCAB_N2:           'pg25_vocab_n2',
  VOCAB_N1:           'pg26_vocab_n1',
  VOCAB_SRS:          'pg27_vocab_srs',

  // ─── Practice > Vocabulary > Vocab Type Selectors ─────
  VOCAB_N5_TYPES:     'pg28_vocab_n5_types',
  VOCAB_N4_TYPES:     'pg29_vocab_n4_types',
  VOCAB_N3_TYPES:     'pg30_vocab_n3_types',
  VOCAB_N2_TYPES:     'pg31_vocab_n2_types',
  VOCAB_N1_TYPES:     'pg32_vocab_n1_types',

  // ─── Practice > Grammar > JLPT Level Sub-views ────────
  GRAMMAR_N5:         'pg33_grammar_n5',
  GRAMMAR_N4:         'pg34_grammar_n4',
  GRAMMAR_N3:         'pg35_grammar_n3',
  GRAMMAR_N2:         'pg36_grammar_n2',
  GRAMMAR_N1:         'pg37_grammar_n1',
  GRAMMAR_SRS:        'pg38_grammar_srs',

  // ─── Practice > Grammar > Grammar Type Selectors ──────
  GRAMMAR_N5_TYPES:   'pg39_grammar_n5_types',
  GRAMMAR_N4_TYPES:   'pg40_grammar_n4_types',
  GRAMMAR_N3_TYPES:   'pg41_grammar_n3_types',
  GRAMMAR_N2_TYPES:   'pg42_grammar_n2_types',
  GRAMMAR_N1_TYPES:   'pg43_grammar_n1_types',

  // ─── Practice > Quiz Setup (pre-game config screen) ───
  KANJI_SETUP:        'pg44_kanji_setup',
  VOCAB_SETUP:        'pg45_vocab_setup',
  GRAMMAR_SETUP:      'pg46_grammar_setup',
  COMPREHENSION_SETUP: 'pg47_comprehension_setup',
  LISTENING_SETUP:    'pg48_listening_setup',
  RANDOM_SETUP:       'pg49_random_setup',

  // ─── Practice > Playing (active quiz) ─────────────────
  KANJI_PLAYING:      'pg50_kanji_playing',
  VOCAB_PLAYING:      'pg51_vocab_playing',
  GRAMMAR_PLAYING:    'pg52_grammar_playing',
  COMPREHENSION_PLAYING: 'pg53_comprehension_playing',
  LISTENING_PLAYING:  'pg54_listening_playing',
  RANDOM_PLAYING:     'pg55_random_playing',

  // ─── Practice > Session Summary (post-game results) ───
  KANJI_FINISHED:     'pg56_kanji_finished',
  VOCAB_FINISHED:     'pg57_vocab_finished',
  GRAMMAR_FINISHED:   'pg58_grammar_finished',
  COMPREHENSION_FINISHED: 'pg59_comprehension_finished',
  LISTENING_FINISHED: 'pg60_listening_finished',
  RANDOM_FINISHED:    'pg61_random_finished',
};

/**
 * Helper: Given a practice category + appState + optional level,
 * returns the correct PAGE_KEY.
 * 
 * Usage:
 *   getQuizPageKey('kanji', 'select_level')          → 'pg10_kanji_levels'
 *   getQuizPageKey('kanji', 'select_level', 'N1')    → 'pg20_kanji_n1'  (level selector → specific level)
 *   getQuizPageKey('vocabulary', 'select_vocab_type', 'N3') → 'pg30_vocab_n3_types'
 *   getQuizPageKey('kanji', 'setup')                 → 'pg44_kanji_setup'
 *   getQuizPageKey('kanji', 'playing')               → 'pg50_kanji_playing'
 *   getQuizPageKey('kanji', 'finished')              → 'pg56_kanji_finished'
 */
export function getQuizPageKey(category, appState, level) {
  const cat = category?.toLowerCase();

  // Map category names to their short prefix used in the keys
  const catPrefix = {
    kanji: 'KANJI',
    vocabulary: 'VOCAB',
    grammar: 'GRAMMAR',
    comprehension: 'COMPREHENSION',
    listening: 'LISTENING',
    random: 'RANDOM',
  }[cat];

  if (!catPrefix) return null;

  // If we have a specific JLPT level, return the level-specific key
  if (level && appState === 'select_level') {
    const lvl = level.toUpperCase();
    const key = `${catPrefix}_${lvl}`;
    return PAGE_KEYS[key] || null;
  }

  // Vocab type selector screen
  if (level && appState === 'select_vocab_type') {
    const lvl = level.toUpperCase();
    const key = `${catPrefix}_${lvl}_TYPES`;
    return PAGE_KEYS[key] || null;
  }

  // Map appState to the right key suffix
  const stateMap = {
    select_level:      `${catPrefix}_LEVELS`,
    setup:             `${catPrefix}_SETUP`,
    playing:           `${catPrefix}_PLAYING`,
    finished:          `${catPrefix}_FINISHED`,
  };

  const keyName = stateMap[appState];
  return keyName ? (PAGE_KEYS[keyName] || null) : null;
}
