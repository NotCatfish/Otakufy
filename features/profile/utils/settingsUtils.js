/**
 * Centralized settings keys and LocalStorage access utility.
 * DRY Principle: Extracted from settings/page.js, dictionary/page.js, useQuizEngine.js, and FlashcardView.jsx
 */

export const SETTINGS_KEYS = {
  XP_GOAL: 'otakufy_xp_goal',
  SHOW_FURIGANA: 'otakufy_show_furigana',
  AUTO_AUDIO: 'otakufy_auto_audio',
  SHOW_ROMAJI: 'otakufy_show_romaji',
  DISABLE_UI_ANIMATIONS: 'otakufy_disable_ui_anim',
  DISABLE_PARTICLES: 'otakufy_disable_particles',
};

// Internal helper to get current Supabase user ID synchronously from localStorage
const getUserId = () => {
  if (typeof window === 'undefined') return 'guest';
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) {
        const session = JSON.parse(localStorage.getItem(k));
        if (session && session.user && session.user.id) {
          return session.user.id;
        }
      }
    }
  } catch (e) {
    // Ignore parse errors
  }
  return 'guest';
};

const getScopedKey = (key) => `${key}_${getUserId()}`;

export const getSetting = (key, defaultValue = false) => {
  if (typeof window === 'undefined') return defaultValue;
  const scopedKey = getScopedKey(key);
  const val = localStorage.getItem(scopedKey);
  
  // Fallback to global setting if scoped one doesn't exist yet (migration)
  if (val === null) {
      const globalVal = localStorage.getItem(key);
      if (globalVal !== null) {
          saveSetting(key, globalVal); // save it to the scoped key
          if (typeof defaultValue === 'boolean') return globalVal === 'true';
          if (typeof defaultValue === 'number') return Number(globalVal) || defaultValue;
          return globalVal;
      }
      return defaultValue;
  }
  
  if (typeof defaultValue === 'boolean') return val === 'true';
  if (typeof defaultValue === 'number') return Number(val) || defaultValue;
  return val;
};

export const saveSetting = (key, value) => {
  if (typeof window === 'undefined') return;
  const scopedKey = getScopedKey(key);
  localStorage.setItem(scopedKey, value.toString());
};
