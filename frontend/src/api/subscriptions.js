import { supabase } from './supabaseClient';

/**
 * Service for handling keyword subscription alerts
 */
export const SubscriptionService = {
  /**
   * Get all keyword subscriptions for the current user
   * @param {string} userId - The user's ID
   * @returns {Promise<Array>} List of keyword subscriptions
   */
  getUserSubscriptions: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  },
  
  /**
   * Add a new keyword subscription for the user
   * @param {string} userId - The user's ID
   * @param {string} keyword - The keyword to subscribe to
   * @returns {Promise<Object>} The created subscription
   */
  addSubscription: async (userId, keyword) => {
    try {
      // Check if this subscription already exists
      const { data: existing, error: checkError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('keyword', keyword.trim().toLowerCase());
        
      if (checkError) throw checkError;
      
      // If subscription already exists, return it
      if (existing && existing.length > 0) {
        return existing[0];
      }
      
      // Create the new subscription
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          keyword: keyword.trim().toLowerCase(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding subscription:', error);
      throw error;
    }
  },
  
  /**
   * Delete a keyword subscription
   * @param {string} subscriptionId - The subscription ID to delete
   * @returns {Promise<void>}
   */
  deleteSubscription: async (subscriptionId) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', subscriptionId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting subscription:', error);
      throw error;
    }
  }
};
