import BaseRepository from '../../core/repositories/BaseRepository';

class SuggestionRepository extends BaseRepository {
  constructor() {
    super('public_suggestions_view');
  }

  /**
   * Fetch suggestions filtered by the active tab.
   * @param {string} activeTab 
   * @returns {Promise<{data: any, error: any}>}
   */
  async getSuggestionsByTab(activeTab) {
    let query = this.client.from(this.tableName).select('*');

    if (activeTab === 'board') {
        query = query.in('status', ['new', 'under_review']);
    } else if (activeTab === 'roadmap') {
        query = query.eq('status', 'planned');
    } else if (activeTab === 'shipped') {
        query = query.eq('status', 'shipped');
    } else if (activeTab === 'rejected') {
        query = query.eq('status', 'rejected');
    }

    return query;
  }

  /**
   * Fetch all suggestion votes for the current user.
   * @returns {Promise<{data: any, error: any}>}
   */
  async getUserVotes() {
    return this.client
      .from('user_suggestion_votes_view')
      .select('suggestion_id, vote_value');
  }

  /**
   * Cast a vote on a suggestion.
   * @param {string} suggestionId 
   * @param {number} voteValue 
   * @returns {Promise<{data: any, error: any}>}
   */
  async castVote(suggestionId, voteValue) {
    return this.client.rpc('cast_suggestion_vote', {
        p_suggestion_id: suggestionId,
        p_vote_value: voteValue
    });
  }

  /**
   * Submit a new suggestion.
   * @param {string} title 
   * @param {string} description 
   * @param {boolean} isAnonymous 
   * @returns {Promise<{data: any, error: any}>}
   */
  async submitSuggestion(title, description, isAnonymous) {
    return this.client.rpc('submit_suggestion', {
        p_title: title,
        p_description: description,
        p_is_anonymous: isAnonymous
    });
  }

  /**
   * Update the status of a suggestion (Admin only).
   * @param {string} suggestionId 
   * @param {string} status 
   * @returns {Promise<{data: any, error: any}>}
   */
  async updateStatus(suggestionId, status) {
    return this.client.rpc('admin_update_suggestion_status', {
        p_suggestion_id: suggestionId,
        p_status: status
    });
  }
}

export default new SuggestionRepository();
