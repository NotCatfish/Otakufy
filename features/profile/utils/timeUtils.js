/**
 * Centralized time and date utility functions.
 * DRY Principle: Extracted from useQuests.js, useQuizEngine.js, and SuggestionCard.jsx
 */

export function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

export function getRelativeTime(dateString) {
  const diff = new Date() - new Date(dateString);
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
