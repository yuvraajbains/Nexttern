import axios from './axiosConfig';
import { supabase } from './supabaseClient';

/**
 * Service for handling profile-related API calls
 */
export const ProfileService = {
  /**
   * Get the current user's profile
   * @returns {Promise<Object>} Profile data
   */
  getProfile: async () => {
    try {
      // Get the JWT token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Call our backend API
      const response = await axios.get('/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return {
        success: true,
        data: {
          first_name: response.data.firstName || '',
          last_name: response.data.lastName || '',
          username: response.data.username || '',
          avatar_url: response.data.avatarUrl || null
        }
      };
    } catch (error) {
      console.error('Error getting profile:', error);
      
      // Try to get directly from Supabase as fallback
      try {
        const { user } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        const { data, error: supabaseError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (supabaseError) throw supabaseError;
        
        return {
          success: true,
          data
        };
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return {
          success: false,
          error: error.message
        };
      }
    }
  },
  
  /**
   * Update the current user's profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Result
   */
  updateProfile: async (profileData) => {
    try {
      // Get the JWT token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Convert frontend format to backend format
      const backendProfileData = {
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        username: profileData.username,
        avatarUrl: profileData.avatar_url
      };
      
      // Call our backend API
      await axios.put('/api/profile', backendProfileData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Try to update directly via Supabase as fallback
      try {
        const { user } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        // Prepare profile data
        const updates = {
          id: user.id,
          ...profileData,
          updated_at: new Date()
        };
        
        // Update or insert the profile
        const { error: supabaseError } = await supabase
          .from('profiles')
          .upsert(updates, { 
            onConflict: 'id',
            returning: 'minimal'
          });
          
        if (supabaseError) throw supabaseError;
        
        return {
          success: true
        };
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return {
          success: false,
          error: error.message
        };
      }
    }
  },
  
  /**
   * Upload avatar to Supabase storage and update profile
   * @param {File} file - The image file to upload
   * @returns {Promise<Object>} Result
   */
  uploadAvatar: async (file) => {
    try {
      if (!file) throw new Error('No file provided');
      
      const { user } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      // Update the profile with the new avatar URL
      const result = await ProfileService.updateProfile({
        avatar_url: publicUrl
      });
      
      if (!result.success) throw new Error('Failed to update profile with avatar URL');
      
      return {
        success: true,
        avatarUrl: publicUrl
      };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Change the user's password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Result
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};
