import { useState, useCallback, useEffect } from 'react';
import { ProfileService } from '../api/profile';
import { useAuth } from './useAuth';

/**
 * Custom hook for managing user profile data
 * @returns {Object} Profile state and functions
 */
export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * Fetch the user's profile
   */
  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const { success, data, error } = await ProfileService.getProfile();
      
      if (success && data) {
        setProfile(data);
      } else {
        setError(error || 'Failed to load profile');
      }
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Update the user's profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Result with success status
   */
  const updateProfile = async (profileData) => {
    try {
      setUpdating(true);
      setError(null);
      
      const { success, error } = await ProfileService.updateProfile(profileData);
      
      if (success) {
        setProfile({
          ...profile,
          ...profileData
        });
        return { success: true };
      } else {
        setError(error || 'Failed to update profile');
        return { success: false, error };
      }
    } catch (err) {
      console.error('Error in updateProfile:', err);
      setError(err.message || 'An unexpected error occurred');
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  };
  
  /**
   * Upload an avatar
   * @param {File} file - The image file to upload
   * @returns {Promise<Object>} Result with success status and avatar URL
   */
  const uploadAvatar = async (file) => {
    try {
      setUpdating(true);
      setError(null);
      
      const { success, avatarUrl, error } = await ProfileService.uploadAvatar(file);
      
      if (success && avatarUrl) {
        setProfile({
          ...profile,
          avatar_url: avatarUrl
        });
        return { success: true, avatarUrl };
      } else {
        setError(error || 'Failed to upload avatar');
        return { success: false, error };
      }
    } catch (err) {
      console.error('Error in uploadAvatar:', err);
      setError(err.message || 'An unexpected error occurred');
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Change password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Result with success status
   */
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setUpdating(true);
      setError(null);
      
      const { success, error } = await ProfileService.changePassword(currentPassword, newPassword);
      
      if (success) {
        return { success: true };
      } else {
        setError(error || 'Failed to change password');
        return { success: false, error };
      }
    } catch (err) {
      console.error('Error in changePassword:', err);
      setError(err.message || 'An unexpected error occurred');
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  };
  
  // Fetch profile when user changes
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  
  return {
    profile,
    loading,
    updating,
    error,
    updateProfile,
    uploadAvatar,
    changePassword,
    refreshProfile: fetchProfile
  };
};
