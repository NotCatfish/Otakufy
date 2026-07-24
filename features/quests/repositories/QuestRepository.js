import BaseRepository from '../../core/repositories/BaseRepository';

class QuestRepository extends BaseRepository {
  constructor() {
    super('user_active_quests');
  }

  /**
   * Fetch a user's active quests for a specific date, including the pool details.
   * @param {string} userId 
   * @param {string} dateString 
   * @returns {Promise<{data: any, error: any}>}
   */
  async getActiveQuestsForDate(userId, dateString) {
    return this.client
      .from(this.tableName)
      .select(`
        id, current_progress, is_completed, is_claimed,
        daily_quests_pool ( id, title, description, target_amount, xp_reward, difficulty )
      `)
      .eq('user_id', userId)
      .eq('assigned_date', dateString);
  }
  
  /**
   * Fetch limited details of a user's active quests for updating progress.
   * @param {string} userId 
   * @param {string} dateString 
   * @returns {Promise<{data: any, error: any}>}
   */
  async getActiveQuestsForProgress(userId, dateString) {
    return this.client
      .from(this.tableName)
      .select(`id, current_progress, daily_quests_pool ( id, quest_type )`)
      .eq('user_id', userId)
      .eq('assigned_date', dateString);
  }

  /**
   * Update quest progress.
   * @param {string} questId 
   * @param {number} newProgress 
   * @returns {Promise<{data: any, error: any}>}
   */
  async updateProgress(questId, newProgress) {
    return this.update(questId, { current_progress: newProgress });
  }

  /**
   * Fetch all quests from the master pool.
   * @returns {Promise<{data: any, error: any}>}
   */
  async getQuestPool() {
    return this.client.from('daily_quests_pool').select('*');
  }

  /**
   * Assign new quests to a user.
   * @param {Object[]} questsToInsert 
   * @returns {Promise<{error: any}>}
   */
  async assignQuests(questsToInsert) {
    return this.insert(questsToInsert);
  }

  /**
   * Claim the reward for a completed quest using the secure RPC.
   * @param {string} activeQuestId 
   * @returns {Promise<{data: any, error: any}>}
   */
  async claimReward(activeQuestId) {
    return this.client.rpc('claim_quest_reward', {
      p_active_quest_id: activeQuestId
    });
  }
}

export default new QuestRepository();
