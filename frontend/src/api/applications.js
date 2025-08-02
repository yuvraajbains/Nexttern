import { supabase } from './supabaseClient';

/**
 * Service for handling application-related API calls
 */
export const ApplicationsService = {
  /**
   * Get all applications for the current user
   * @param {string} userId - The user's ID
   * @returns {Promise<Array>} List of applications
   */
  getApplications: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },
  
  /**
   * Update an application's status
   * @param {string} applicationId - The application ID
   * @param {string} newStatus - The new status
   * @returns {Promise<Object>} Updated application
   */
  updateStatus: async (applicationId, newStatus) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },
  
  /**
   * Update application notes
   * @param {string} applicationId - The application ID
   * @param {string} notes - The notes content
   * @returns {Promise<Object>} Updated application
   */
  updateNotes: async (applicationId, notes) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .update({ 
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating application notes:', error);
      throw error;
    }
  },
  
  /**
   * Delete an application
   * @param {string} applicationId - The application ID
   * @returns {Promise<void>}
   */
  deleteApplication: async (applicationId) => {
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  }
};
