/**
 * Utility functions for input sanitation across the Otakufy frontend.
 * Pre-cleans strings before API/database submission to prevent XSS and formatting issues.
 */

/**
 * Strips HTML tags and script elements from a string.
 * @param {string} input - The raw input text.
 * @returns {string} - The sanitized text without HTML tags.
 */
export function stripHtml(input) {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/<[^>]*>?/gm, '').trim();
}

/**
 * Sanitizes a text field by stripping HTML tags and truncating to a maximum length.
 * @param {string} input - The raw input text.
 * @param {number} maxLength - Maximum allowed character length.
 * @returns {string} - Cleaned and bounded string.
 */
export function sanitizeText(input, maxLength = 500) {
  if (!input || typeof input !== 'string') return '';
  const cleaned = stripHtml(input);
  return cleaned.slice(0, maxLength);
}

/**
 * Validates whether a username meets safe alphanumeric/Japanese character standards.
 * @param {string} username - The username to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function isValidUsername(username) {
  if (!username || typeof username !== 'string') return false;
  const cleaned = username.trim();
  if (cleaned.length < 2 || cleaned.length > 30) return false;
  // Allow alphanumeric, underscores, hyphens, and standard Japanese Kanji/Kana characters
  const validPattern = /^[a-zA-Z0-9_\-\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s]+$/;
  return validPattern.test(cleaned);
}
