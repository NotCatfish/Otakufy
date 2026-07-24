import BaseRepository from '../../core/repositories/BaseRepository';

class PracticeRepository extends BaseRepository {
  constructor() {
    super('srs_reviews'); // Default, but methods take table name
  }

  /**
   * Get raw client for complex dynamic queries.
   * This is a pragmatic escape hatch for massive 1000+ line hooks.
   * @returns {any} Supabase client
   */
  get clientInstance() {
    return this.client;
  }

  /**
   * Start a quiz session
   * @param {number} finalAmount 
   * @returns {Promise<{data: any, error: any}>}
   */
  async startQuizSession(finalAmount) {
    return this.client.rpc('start_quiz_session', { p_card_amount: finalAmount });
  }

  /**
   * Submit an SRS review
   * @param {Object} payload 
   * @returns {Promise<{error: any}>}
   */
  async submitReview(payload) {
    return this.client.rpc('submit_review', payload);
  }

  /**
   * Batch insert new SRS reviews (e.g. from SessionSummary "Add to SRS")
   * @param {Object[]} payloads 
   * @returns {Promise<{data: any, error: any}>}
   */
  async addBatchSrsReviews(payloads) {
    return this.insert(payloads);
  }

  /**
   * Award Quiz XP
   * @param {number} xpAmount 
   * @param {string} sessionId 
   * @returns {Promise<{data: any, error: any}>}
   */
  async awardQuizXp(xpAmount, sessionId) {
    return this.client.rpc('award_quiz_xp', { 
        p_xp_amount: xpAmount,
        p_session_id: sessionId || null
    });
  }

  /**
   * Check and award badges
   * @returns {Promise<{data: any, error: any}>}
   */
  async checkAndAwardBadges() {
    return this.client.rpc('check_and_award_badges');
  }
}

export default new PracticeRepository();
