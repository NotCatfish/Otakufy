import BaseRepository from '../../core/repositories/BaseRepository';

class ProfileRepository extends BaseRepository {
  constructor() {
    super('profiles');
  }

  /**
   * Upload an avatar image to the 'avatars' storage bucket.
   * @param {string} filePath 
   * @param {File} file 
   * @returns {Promise<{data: any, error: any}>}
   */
  async uploadAvatar(filePath, file) {
    return this.client.storage
      .from('avatars')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true
      });
  }

  /**
   * Get the public URL for an avatar.
   * @param {string} filePath 
   * @returns {string} publicUrl
   */
  getAvatarPublicUrl(filePath) {
    const { data } = this.client.storage
      .from('avatars')
      .getPublicUrl(filePath);
    return data.publicUrl;
  }
}

export default new ProfileRepository();
