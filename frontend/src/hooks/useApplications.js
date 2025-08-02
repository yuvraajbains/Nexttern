import { useState, useEffect, useCallback } from 'react';
import { ApplicationsService } from '../api/applications';

/**
 * Custom hook for managing applications data and operations
 * @param {string} userId - The user's ID
 * @returns {Object} Applications data and functions
 */
export const useApplications = (userId) => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await ApplicationsService.getApplications(userId);
      setApplications(data);
    } catch (err) {
      setError(err.message);
      console.error('Error in useApplications hook:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Update application status
  const updateStatus = async (applicationId, newStatus) => {
    try {
      await ApplicationsService.updateStatus(applicationId, newStatus);
      
      // Update local state
      setApplications(apps => 
        apps.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus, updated_at: new Date().toISOString() } 
            : app
        )
      );
      
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error updating status:', err);
      return false;
    }
  };

  // Update application notes
  const updateNotes = async (applicationId, notes) => {
    try {
      await ApplicationsService.updateNotes(applicationId, notes);
      
      // Update local state
      setApplications(apps => 
        apps.map(app => 
          app.id === applicationId 
            ? { ...app, notes, updated_at: new Date().toISOString() } 
            : app
        )
      );
      
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error updating notes:', err);
      return false;
    }
  };

  // Delete application
  const deleteApplication = async (applicationId) => {
    try {
      await ApplicationsService.deleteApplication(applicationId);
      
      // Update local state
      setApplications(apps => apps.filter(app => app.id !== applicationId));
      
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error deleting application:', err);
      return false;
    }
  };

  // Load applications on initial render
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    isLoading,
    error,
    fetchApplications,
    updateStatus,
    updateNotes,
    deleteApplication
  };
};
