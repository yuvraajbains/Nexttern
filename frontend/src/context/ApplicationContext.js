import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApplicationsService } from '../api/applications';

// Create context
const ApplicationContext = createContext();

/**
 * Provider component for application data
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.userId - The user's ID
 * @returns {JSX.Element} Context provider
 */
export const ApplicationProvider = ({ children, userId }) => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch applications
  const fetchApplications = React.useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await ApplicationsService.getApplications(userId);
      setApplications(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching applications:', err);
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
    if (userId) {
      fetchApplications();
    }
  }, [userId, fetchApplications]);

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        isLoading,
        error,
        fetchApplications,
        updateStatus,
        updateNotes,
        deleteApplication
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

/**
 * Hook to use the application context
 * @returns {Object} Application context
 */
export const useApplicationContext = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplicationContext must be used within an ApplicationProvider');
  }
  return context;
};
