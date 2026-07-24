/**
 * Centralized utility for XP and Level calculations.
 * DRY Principle: Extracted from page.js and ProfileSettings.js
 * 
 * @param {number} totalXp - The total experience points of the user
 * @returns {Object} Level stats including calculated level, current level xp, etc.
 */
export function calculateLevelStats(totalXp = 0) {
  const calculatedLevel = Math.floor(Math.sqrt(totalXp / 500)) + 1;
  const xpBaseForCurrent = 500 * Math.pow(calculatedLevel - 1, 2);
  const xpBaseForNext = 500 * Math.pow(calculatedLevel, 2);
  
  const currentLevelXp = Math.floor(totalXp - xpBaseForCurrent);
  const xpForNext = Math.floor(xpBaseForNext - xpBaseForCurrent);
  const xpPercent = Math.min(100, Math.max(0, (currentLevelXp / xpForNext) * 100));

  return {
    calculatedLevel,
    currentLevelXp,
    xpForNext,
    xpPercent,
    totalXp
  };
}

/**
 * Calculates recommended JLPT tier based on numerical player level.
 * DRY Principle: Extracted from DashboardClient.jsx
 */
export function getAutoJlptLevel(lvl = 1) {
  if (lvl <= 20) return 'N5';
  if (lvl <= 40) return 'N4';
  if (lvl <= 60) return 'N3';
  if (lvl <= 80) return 'N2';
  return 'N1';
}
