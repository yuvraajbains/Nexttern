import { supabase } from './supabaseClient';

/**
 * Service for handling internship-related API calls
 */
export const InternshipsService = {
  /**
   * Get all internships
   * @param {Object} filters - Optional filters for the query
   * @returns {Promise<Array>} List of internships
   */
  getInternships: async (filters = {}) => {
    try {
      let query = supabase.from('internships').select('*');
      
      // Apply filters if provided
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }
      
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      
      const { data, error } = await query;
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching internships:', error);
      throw error;
    }
  },
  
  /**
   * Track an internship (add to applications)
   * @param {Object} internship - Internship data
   * @param {string} userId - The user's ID
   * @returns {Promise<Object>} Created application
   */
  trackInternship: async (internship, userId) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          user_id: userId,
          internship_id: internship.id,
          title: internship.title,
          company: internship.company,
          location: internship.location,
          description: internship.description,
          url: internship.url,
          status: 'Saved'
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error tracking internship:', error);
      throw error;
    }
  }
};
