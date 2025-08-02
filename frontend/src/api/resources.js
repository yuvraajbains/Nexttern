import { supabase } from './supabaseClient';

// Resource types and categories
export const RESOURCE_TYPES = {
  ARTICLE: 'ARTICLE',
  VIDEO: 'VIDEO',
  TOOL: 'TOOL',
  REPO: 'REPO',
  COURSE: 'COURSE'
};

export const RESOURCE_CATEGORIES = {
  RESUME: 'resume',
  TECHNICAL: 'technical',
  SYSTEM: 'system',
  BEHAVIORAL: 'behavioral',
  NEGOTIATION: 'negotiation'
};

// Base API URL for backend requests
const API_URL = process.env.REACT_APP_API_URL;

/**
 * Get all resources
 */
export async function getAllResources() {
  try {
    // Try to fetch from Spring backend first
    try {
      const response = await fetch(`${API_URL}/resources`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Backend API not available, falling back to Supabase');
    }
    
    // Fall back to direct Supabase query if backend is not available
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    // console.error('Error fetching resources:', error);
    throw error;
  }
}

/**
 * Get resources by category
 */
export async function getResourcesByCategory(category) {
  try {
    // Try to fetch from Spring backend first
    try {
      const response = await fetch(`${API_URL}/resources/category?category=${category}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Backend API not available, falling back to Supabase');
    }
    
    // Fall back to direct Supabase query if backend is not available
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    // console.error(`Error fetching resources for category ${category}:`, error);
    throw error;
  }
}

/**
 * Search resources by title or description
 */
export async function searchResources(query) {
  try {
    // Try to fetch from Spring backend first
    try {
      const response = await fetch(`${API_URL}/resources/search?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Backend API not available, falling back to Supabase');
    }
    
    // Fall back to direct Supabase query if backend is not available
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    // console.error(`Error searching resources for "${query}":`, error);
    throw error;
  }
}

/**
 * Get user's favorite resources
 */
export async function getFavoriteResources(userId) {
  try {
    // Try to fetch from Spring backend first
    try {
      const response = await fetch(`${API_URL}/resources/favorites?userId=${userId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Backend API not available, falling back to Supabase');
    }
    
    // Fall back to direct Supabase query if backend is not available
    const { data, error } = await supabase
      .from('saved_resources')
      .select('resource_id')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    // If no favorites, return empty array
    if (!data || data.length === 0) return [];
    
    // Get the actual resources
    const resourceIds = data.map(item => item.resource_id);
    const { data: resources, error: resourcesError } = await supabase
      .from('resources')
      .select('*')
      .in('id', resourceIds)
      .order('created_at', { ascending: false });
      
    if (resourcesError) throw resourcesError;
    return resources;
  } catch (error) {
    // console.error('Error fetching favorite resources:', error);
    throw error;
  }
}

/**
 * Toggle favorite status of a resource
 */
export async function toggleFavorite(resourceId, userId, isFavorite) {
  try {
    // Try to update via Spring backend first
    try {
      const response = await fetch(`${API_URL}/resources/favorites/toggle?resourceId=${resourceId}&userId=${userId}&isFavorite=${isFavorite}`, {
        method: 'POST'
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Backend API not available, falling back to Supabase');
    }
    
    // Fall back to direct Supabase mutation if backend is not available
    if (isFavorite) {
      // Add to favorites
      const { error } = await supabase
        .from('saved_resources')
        .insert([
          { user_id: userId, resource_id: resourceId }
        ]);
      
      if (error) throw error;
    } else {
      // Remove from favorites
      const { error } = await supabase
        .from('saved_resources')
        .delete()
        .eq('user_id', userId)
        .eq('resource_id', resourceId);
      
      if (error) throw error;
    }
    
    return { success: true, isFavorite };
  } catch (error) {
    // console.error('Error toggling favorite status:', error);
    throw error;
  }
}

/**
 * Submit a resource suggestion
 */
export async function suggestResource(userId, title, url, description, category, type) {
  try {
    // Try to submit via Spring backend first
    try {
      const params = new URLSearchParams({
        userId,
        title,
        url,
        description,
        category,
        type
      }).toString();
      
      const response = await fetch(`${API_URL}/resources/suggest?${params}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Backend API not available, falling back to Supabase');
    }
    
    // Fall back to direct Supabase insertion if backend is not available
    const { data, error } = await supabase
      .from('resource_suggestions')
      .insert([
        {
          user_id: userId,
          title,
          url,
          description,
          category,
          type,
          status: 'pending'
        }
      ])
      .select();
    
    if (error) throw error;
    return { success: true, suggestionId: data[0].id };
  } catch (error) {
    // console.error('Error suggesting resource:', error);
    throw error;
  }
}

/**
 * Get user's resource suggestions
 */
export async function getUserSuggestions(userId) {
  try {
    const { data, error } = await supabase
      .from('resource_suggestions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    // console.error('Error fetching user suggestions:', error);
    throw error;
  }
}
