import { supabase } from '../../auth/frontend/supabaseClient';

/**
 * Base abstract repository class for standardizing Supabase data access.
 * Implements DRY principles by providing generic CRUD methods.
 */
export default class BaseRepository {
  constructor(tableName) {
    if (new.target === BaseRepository) {
      throw new TypeError("Cannot construct Abstract instances directly");
    }
    this.tableName = tableName;
    this.client = supabase;
  }

  /**
   * Retrieves all rows from the table.
   * @param {string} select - The columns to select, defaults to '*'
   * @returns {Promise<{data: any, error: any}>}
   */
  async getAll(select = '*') {
    return this.client.from(this.tableName).select(select);
  }

  /**
   * Retrieves a single row by ID.
   * @param {string|number} id - The ID to filter by
   * @param {string} select - The columns to select, defaults to '*'
   * @returns {Promise<{data: any, error: any}>}
   */
  async getById(id, select = '*') {
    return this.client.from(this.tableName).select(select).eq('id', id).single();
  }

  /**
   * Inserts one or more rows.
   * @param {Object|Object[]} payload - Data to insert
   * @returns {Promise<{data: any, error: any}>}
   */
  async insert(payload) {
    return this.client.from(this.tableName).insert(payload);
  }

  /**
   * Updates a row by ID.
   * @param {string|number} id - The ID of the row to update
   * @param {Object} payload - Data to update
   * @returns {Promise<{data: any, error: any}>}
   */
  async update(id, payload) {
    return this.client.from(this.tableName).update(payload).eq('id', id);
  }

  /**
   * Deletes a row by ID.
   * @param {string|number} id - The ID of the row to delete
   * @returns {Promise<{data: any, error: any}>}
   */
  async delete(id) {
    return this.client.from(this.tableName).delete().eq('id', id);
  }
}
