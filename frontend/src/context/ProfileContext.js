import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../api/supabaseClient';
import axios from '../api/axiosConfig';
import { useAuth } from '../hooks/useAuth';

// Create context
const ProfileContext = createContext();

// Rate limiting utility
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) { // 10 requests per minute
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }
  
  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
  
  getTimeUntilReset() {
    if (this.requests.length === 0) return 0;
    const oldestRequest = Math.min(...this.requests);
    return Math.max(0, this.windowMs - (Date.now() - oldestRequest));
  }
}

// Input validation utilities
const validateProfileData = (data) => {
  const errors = {};
  
  if (data.first_name && data.first_name.length > 50) {
    errors.first_name = 'First name must be less than 50 characters';
  }
  
  if (data.last_name && data.last_name.length > 50) {
    errors.last_name = 'Last name must be less than 50 characters';
  }
  
  if (data.username) {
    if (data.username.length > 30) {
      errors.username = 'Username must be less than 30 characters';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
      errors.username = 'Username can only contain letters, numbers, hyphens, and underscores';
    }
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
};

const validateAvatarFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File must be a JPEG, PNG, GIF, or WebP image' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }
  
  return { isValid: true };
};

// Debounce utility
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Provider component for user profile data
 */
export const ProfileProvider = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rateLimiter] = useState(new RateLimiter(10, 60000));
  
  // Use refs to track mounted state and prevent memory leaks
  const isMounted = useRef(true);
  const abortController = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  // Check rate limit before making requests
  const checkRateLimit = useCallback(() => {
    if (!rateLimiter.canMakeRequest()) {
      const resetTime = Math.ceil(rateLimiter.getTimeUntilReset() / 1000);
      throw new Error(`Rate limit exceeded. Try again in ${resetTime} seconds.`);
    }
  }, [rateLimiter]);

  // Fetch profile data with improved error handling
  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      if (isMounted.current) {
        setLoading(false);
        setProfile(null);
        setError(null);
      }
      return;
    }
    
    if (isMounted.current) {
      setLoading(true);
      setError(null);
    }
    
    // Cancel any existing request
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('Authentication token not available');
      }
      
      checkRateLimit();
      
      // Try to fetch from your API first
      let profileData = null;
      try {
        const response = await axios.get('/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 10000,
          signal: abortController.current.signal
        });
        
        if (response.status === 200 && response.data) {
          profileData = {
            first_name: response.data.firstName || '',
            last_name: response.data.lastName || '',
            username: response.data.username || '',
            avatar_url: response.data.avatarUrl || null,
            email: user.email
          };
        }
      } catch (apiError) {
        console.warn('API fetch failed, falling back to Supabase:', apiError.message);
        
        // Fallback to Supabase direct query
        const { data: supabaseProfile, error: supabaseError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (supabaseError) {
          // If profile doesn't exist, create one
          if (supabaseError.code === 'PGRST116') {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: user.id,
                  first_name: '',
                  last_name: '',
                  username: user.email?.split('@')[0] || '',
                  avatar_url: null,
                  email: user.email
                }
              ])
              .select()
              .single();
            
            if (createError) {
              throw createError;
            }
            
            profileData = newProfile;
          } else {
            throw supabaseError;
          }
        } else {
          profileData = supabaseProfile;
        }
      }
      
      if (isMounted.current && profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      if (error.name === 'AbortError' || !isMounted.current) {
        return; // Request was cancelled or component unmounted
      }
      
      console.error('Error fetching profile:', error);
      if (isMounted.current) {
        setError(error.message || 'Failed to load profile. Please try again later.');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [user, checkRateLimit]);

  // Update profile data with validation and rate limiting
  const updateProfile = useCallback(
    async (profileData) => {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      try {
        checkRateLimit();
        
        // Validate input data
        const validation = validateProfileData(profileData);
        if (!validation.isValid) {
          const errorMessage = `Validation error: ${Object.values(validation.errors).join(', ')}`;
          if (isMounted.current) {
            setError(errorMessage);
          }
          return { success: false, error: 'Invalid profile data' };
        }
        
        if (isMounted.current) {
          setLoading(true);
          setError(null);
        }
        
        // Get the JWT token from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        let updateResult = null;
        
        if (token) {
          // Try API first
          try {
            const backendProfileData = {
              firstName: profileData.first_name,
              lastName: profileData.last_name,
              username: profileData.username,
              avatarUrl: profileData.avatar_url
            };
            
            const response = await axios.put('/api/profile', backendProfileData, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              timeout: 10000
            });
            
            if (response.status === 200) {
              updateResult = { success: true };
            }
          } catch (apiError) {
            console.warn('API update failed, falling back to Supabase:', apiError.message);
          }
        }
        
        // Fallback to direct Supabase update if API failed
        if (!updateResult) {
          const { error: supabaseError } = await supabase
            .from('profiles')
            .update({
              first_name: profileData.first_name,
              last_name: profileData.last_name,
              username: profileData.username,
              avatar_url: profileData.avatar_url
            })
            .eq('id', user.id);
          
          if (supabaseError) {
            throw supabaseError;
          }
          
          updateResult = { success: true };
        }
        
        if (updateResult.success && isMounted.current) {
          setProfile(prevProfile => ({
            ...prevProfile,
            ...profileData
          }));
        }
        
        return updateResult;
      } catch (error) {
        console.error('Error updating profile:', error);
        const errorMessage = error.message || 'Failed to update profile. Please try again.';
        if (isMounted.current) {
          setError(errorMessage);
        }
        return { success: false, error: errorMessage };
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [checkRateLimit, user]
  );

  // Debounced version of updateProfile
  const debouncedUpdateProfile = useCallback(
    debounce(updateProfile, 500),
    [updateProfile]
  );

  // Upload avatar with validation
  const uploadAvatar = useCallback(async (file) => {
    if (!user?.id) {
      const error = 'User not authenticated';
      if (isMounted.current) {
        setError(error);
      }
      return { success: false, error };
    }

    // Validate file
    const validation = validateAvatarFile(file);
    if (!validation.isValid) {
      if (isMounted.current) {
        setError(validation.error);
      }
      return { success: false, error: validation.error };
    }

    if (isMounted.current) {
      setLoading(true);
      setError(null);
    }

    try {
      checkRateLimit();

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const updatedProfile = {
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        username: profile?.username || '',
        avatar_url: publicUrl,
        email: profile?.email || user?.email || ''
      };

      const result = await updateProfile(updatedProfile);
      if (result.success) {
        return { success: true, avatarUrl: publicUrl };
      } else {
        throw new Error(result.error || 'Failed to update profile with new avatar');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      const errorMessage = error.message || 'Failed to upload avatar. Please try again.';
      if (isMounted.current) {
        setError(errorMessage);
      }
      return { success: false, error: errorMessage };
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [user, profile, checkRateLimit, updateProfile]);

  // Clear error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        if (isMounted.current) {
          setError(null);
        }
      }, 10000); // Clear error after 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Only fetch profile when user ID changes
  const prevUserIdRef = useRef();
  useEffect(() => {
    if (user?.id && prevUserIdRef.current !== user.id) {
      fetchProfile();
      prevUserIdRef.current = user.id;
    } else if (!user) {
      // Clear profile when user logs out
      if (isMounted.current) {
        setProfile(null);
        setLoading(false);
        setError(null);
      }
      prevUserIdRef.current = null;
    }
  }, [user, fetchProfile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        fetchProfile,
        updateProfile,
        debouncedUpdateProfile,
        uploadAvatar,
        clearError: () => isMounted.current && setError(null)
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

// Hook for using the profile context
export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
};