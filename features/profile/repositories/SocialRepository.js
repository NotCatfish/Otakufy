import BaseRepository from '../../core/repositories/BaseRepository';

class SocialRepository extends BaseRepository {
  constructor() {
    super('friendships');
  }

  /**
   * Fetch a user's friends (using the get_friends RPC).
   * @param {string} userId
   * @returns {Promise<{data: any, error: any}>}
   */
  async getFriends(userId) {
    return this.client.rpc('get_friends', { current_user_id: userId });
  }

  /**
   * Fetch a user's pending incoming friend requests (using the get_pending_requests RPC).
   * @param {string} userId
   * @returns {Promise<{data: any, error: any}>}
   */
  async getPendingRequests(userId) {
    return this.client.rpc('get_pending_requests', { current_user_id: userId });
  }

  /**
   * Fetch a user's outgoing friend requests.
   * @param {string} userId
   * @returns {Promise<{data: any, error: any}>}
   */
  async getOutgoingRequests(userId) {
    return this.client
      .from(this.tableName)
      .select('id, addressee_id, created_at')
      .eq('requester_id', userId)
      .eq('status', 'pending');
  }

  /**
   * Fetch profiles by a list of IDs.
   * @param {string[]} ids
   * @returns {Promise<{data: any, error: any}>}
   */
  async getProfilesByIds(ids) {
    return this.client
      .from('profiles')
      .select('id, username, discriminator, avatar_url, level, xp')
      .in('id', ids);
  }

  /**
   * Exact search for a user by username and discriminator.
   * @param {string} username 
   * @param {string} discriminator 
   * @param {string} currentUserId 
   * @returns {Promise<{data: any, error: any}>}
   */
  async searchUserExact(username, discriminator, currentUserId) {
    return this.client
      .from('profiles')
      .select('id, username, discriminator, avatar_url, level, xp')
      .ilike('username', username)
      .eq('discriminator', discriminator)
      .neq('id', currentUserId)
      .limit(1);
  }

  /**
   * Check friendship status between two users.
   * @param {string} userA 
   * @param {string} userB 
   * @returns {Promise<{data: any, error: any}>}
   */
  async checkFriendshipStatus(userA, userB) {
    return this.client
      .from(this.tableName)
      .select('status, requester_id')
      .or(`and(requester_id.eq.${userA},addressee_id.eq.${userB}),and(requester_id.eq.${userB},addressee_id.eq.${userA})`)
      .limit(1);
  }

  /**
   * Send a friend request.
   * @param {string} requesterId 
   * @param {string} addresseeId 
   * @returns {Promise<{error: any}>}
   */
  async sendFriendRequest(requesterId, addresseeId) {
    return this.insert({
      requester_id: requesterId,
      addressee_id: addresseeId,
      status: 'pending'
    });
  }

  /**
   * Accept a friend request.
   * @param {string} friendshipId 
   * @returns {Promise<{error: any}>}
   */
  async acceptFriendRequest(friendshipId) {
    return this.update(friendshipId, { status: 'accepted' });
  }

  /**
   * Remove a friendship (or decline/withdraw a request).
   * @param {string} friendshipId 
   * @returns {Promise<{error: any}>}
   */
  async removeFriendshipById(friendshipId) {
    return this.delete(friendshipId);
  }

  /**
   * Unfriend a user by both IDs.
   * @param {string} userA 
   * @param {string} userB 
   * @returns {Promise<{error: any}>}
   */
  async unfriend(userA, userB) {
    return this.client
      .from(this.tableName)
      .delete()
      .or(`and(requester_id.eq.${userA},addressee_id.eq.${userB}),and(requester_id.eq.${userB},addressee_id.eq.${userA})`);
  }
}

export default new SocialRepository();
