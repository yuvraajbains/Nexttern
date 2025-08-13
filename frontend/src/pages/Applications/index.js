import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../api/supabaseClient';
import PageLayout from '../../components/layout/PageLayout';
import { motion, AnimatePresence } from 'framer-motion';

// Define the application status options
const ApplicationStatus = {
  SAVED: 'Saved',
  APPLIED: 'Applied',
  ASSESSMENT: 'Assessment',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected'
};

export default function Applications({ session }) {
  const [applications, setApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [deleteConfirmApplication, setDeleteConfirmApplication] = useState(null);
  const [notes, setNotes] = useState('');
  // State for creating a custom application (creation uses same modal as editing)
  const [isCreating, setIsCreating] = useState(false);
  const [customApp, setCustomApp] = useState({
    title: '',
    company: '',
    location: '',
    url: '',
    status: ApplicationStatus.APPLIED,
    notes: ''
  });
  const [creationError, setCreationError] = useState(null);
  const [isSavingNew, setIsSavingNew] = useState(false);

  // Handle custom application input change
  const handleCustomAppChange = (e) => {
    const { name, value } = e.target;
    setCustomApp((prev) => ({ ...prev, [name]: value }));
  };

  // Handle custom application status change
  const handleCustomAppStatus = (status) => {
    setCustomApp((prev) => ({ ...prev, status }));
  };

  // Save new custom application
  const saveNewCustomApplication = async () => {
    if (!customApp.title.trim() || !customApp.company.trim()) return;
    setCreationError(null);
    setIsSavingNew(true);
    try {
      const now = new Date().toISOString();
      // internship_id is NOT NULL in schema; generate synthetic ID for custom apps
      const internshipId = (window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : 'custom-' + Date.now());
      const { data, error } = await supabase
        .from('applications')
        .insert([
          {
            user_id: session.user.id,
            internship_id: `custom-${internshipId}`,
            title: customApp.title.trim(),
            company: customApp.company.trim(),
            location: customApp.location.trim() || null,
            url: customApp.url.trim() || null,
            status: customApp.status,
            notes: customApp.notes.trim() || null,
            created_at: now,
            updated_at: now
          }
        ])
        .select();
      if (error) throw error;
      const newApp = data[0];
      setApplications(prev => [newApp, ...prev]);
      // Close modal & reset
      setIsCreating(false);
      setCustomApp({
        title: '',
        company: '',
        location: '',
        url: '',
        status: ApplicationStatus.APPLIED,
        notes: ''
      });
    } catch (err) {
      setCreationError(err.message || 'Failed to add application.');
    } finally {
      setIsSavingNew(false);
    }
  };
  
  // Define configuration for status buttons
  const statusConfig = {
    [ApplicationStatus.SAVED]: {
      title: 'Saved',
      description: 'Internships you want to apply to',
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )
    },
    [ApplicationStatus.APPLIED]: {
      title: 'Applied',
      description: 'Applications you have submitted',
      color: 'bg-purple-500',
      textColor: 'text-purple-500',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    [ApplicationStatus.ASSESSMENT]: {
      title: 'Assessment',
      description: 'Coding challenges & OAs',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    [ApplicationStatus.INTERVIEW]: {
      title: 'Interview',
      description: 'Interview process in progress',
      color: 'bg-orange-500',
      textColor: 'text-orange-500',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    [ApplicationStatus.OFFER]: {
      title: 'Offer',
      description: 'Received an offer',
      color: 'bg-green-500',
      textColor: 'text-green-500',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    [ApplicationStatus.REJECTED]: {
      title: 'Rejected',
      description: 'Unsuccessful applications',
      color: 'bg-red-500',
      textColor: 'text-red-500',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };
  
  // Fetch applications from Supabase
  const fetchApplications = React.useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Query the applications table for this user
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', session.user.id);
        
      if (error) {
        throw error;
      }
      
      setApplications(data || []);
    } catch (error) {
      // console.error('Error fetching applications:', error);
      // If the table doesn't exist yet, we'll just show an empty state
    } finally {
      setIsLoading(false);
    }
  }, [session]);
  
  useEffect(() => {
    if (session) {
      fetchApplications();
    }
  }, [session, fetchApplications]);
  
  // Reset notes when selectedApplication changes
  useEffect(() => {
    if (selectedApplication) {
      // If an application is selected, set notes to that application's notes
      setNotes(selectedApplication.notes || '');
    } else {
      // If modal is closed, reset notes to empty string
      setNotes('');
    }
  }, [selectedApplication]);
  
  // Handle updating application status
  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      // First update in Supabase
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);
        
      if (error) throw error;
      
      // Then update local state
      setApplications(applications.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus, updated_at: new Date().toISOString() } 
          : app
      ));
    } catch (error) {
      // console.error('Error updating application status:', error);
    }
  };
  
  // Handle saving notes
  const saveNotes = async () => {
    if (!selectedApplication) return;
    
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('applications')
        .update({ 
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedApplication.id);
        
      if (error) throw error;
      
      // Update local state
      setApplications(applications.map(app => 
        app.id === selectedApplication.id 
          ? { ...app, notes: notes, updated_at: new Date().toISOString() } 
          : app
      ));
      
      // Close modal
      setSelectedApplication(null);
    } catch (error) {
      // console.error('Error saving notes:', error);
    }
  };
  
  // Show delete confirmation modal
  const showDeleteConfirmation = (application) => {
    setDeleteConfirmApplication(application);
  };

  // Handle deleting an application
  const deleteApplication = async (applicationId) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId);
        
      if (error) throw error;
      
      // Update local state
      setApplications(applications.filter(app => app.id !== applicationId));
      
      // Close modals if open
      if (selectedApplication && selectedApplication.id === applicationId) {
        setSelectedApplication(null);
      }
      setDeleteConfirmApplication(null);
    } catch (error) {
      // console.error('Error deleting application:', error);
    }
  };
  
  // Filter applications based on search query and status filter
  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchQuery === '' || 
      app.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      // Redirect to landing page after successful sign out
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  // Define nav links
  const navLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Find Internships', href: '/internships' },
    { label: 'My Applications', href: '/applications' },
    { label: 'My Alerts', href: '/alerts' },
    { label: 'Custom Projects', href: '/projects' },
    { label: 'Resources', href: '/resources' }
  ];

  return (
    <PageLayout onLogout={handleLogout} navLinks={navLinks}>
      {/* Dashboard-style Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050c2e] via-[#1a2151] to-[#0f1635]" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 1 }}
        />
      </div>
      <div className="flex flex-col relative min-h-screen">
        <main className="flex-1 flex flex-col items-center px-4 py-8 w-full">
          <section className="w-full max-w-7xl mx-auto">
            <div className="flex flex-col items-center mb-6 gap-4 w-full">
              <motion.h1
                className="text-5xl md:text-6xl font-extrabold leading-tight text-center drop-shadow-lg w-full"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-green-400">
                  My Applications
                </span>
              </motion.h1>
              <button
                className="w-full md:w-auto px-6 py-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-lg font-semibold shadow transition-all duration-200 backdrop-blur-sm"
                style={{ maxWidth: 320 }}
                onClick={() => {
                  setIsCreating(true);
                  setSelectedApplication(null);
                  setCustomApp({
                    title: '', company: '', location: '', url: '', status: ApplicationStatus.APPLIED, notes: ''
                  });
                }}
              >
                ＋ Add Custom Application
              </button>
            </div>
            {/* Search and Filter Bar */}
            <motion.div
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/10 shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="searchQuery" className="sr-only">Search by title or company</label>
                  <input
                    id="searchQuery"
                    name="searchQuery"
                    type="text"
                    autoComplete="off"
                    placeholder="Search by title or company..."
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2 md:gap-2 scrollbar-hide">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                      statusFilter === 'all'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    All
                  </motion.button>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.97 }}
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center whitespace-nowrap ${
                        statusFilter === status
                          ? `${config.color} text-white`
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      <span className="mr-1">{config.icon}</span>
                      {config.title}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
            {/* Loading State */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.6 }}
                  className="text-center py-12"
                >
                  <motion.div
                    className="mx-auto mb-4"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                  >
                    <div className="h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full" />
                  </motion.div>
                  <p className="text-white text-lg">Loading your applications...</p>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Empty State */}
            <AnimatePresence>
              {!isLoading && applications.length === 0 && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl text-center"
                >
                  <div className="text-white text-xl font-semibold mb-4">No applications tracked yet</div>
                  <p className="text-gray-300 mb-6">
                    Start by visiting the internships page and clicking "Track" on any internship you're interested in.
                  </p>
                  <Link
                    to="/internships"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-400 text-white rounded-full font-semibold shadow hover:from-blue-600 hover:to-green-500 transition"
                  >
                    Find Internships to Track
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Applications List */}
            <AnimatePresence>
              {!isLoading && applications.length > 0 && (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                >
                  {/* Applications List Header */}
                  <div className="bg-white/10 p-4 border-b border-white/10 text-white flex justify-between items-center">
                    <div className="text-lg font-bold">All Applications ({filteredApplications.length})</div>
                    <div className="text-sm text-gray-400">Last updated: {applications.length > 0 ? formatDate(applications.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0].updated_at) : 'Never'}</div>
                  </div>
  {/* Custom application creation now reuses the main details modal */}
                  {/* Applications List Body with custom scrollbar */}
                  <div
                    className="divide-y divide-white/10 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/40 scrollbar-track-transparent hover:scrollbar-thumb-blue-500/60 transition-all duration-300"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#3b82f6 #0000' }}
                  >
                    <AnimatePresence>
                      {filteredApplications.length === 0 ? (
                        <motion.div
                          key="nofilter"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.6 }}
                          className="p-8 text-center text-gray-400"
                        >
                          <p>No applications match your filter criteria</p>
                        </motion.div>
                      ) : (
                        filteredApplications.map(application => (
                          <motion.div
                            key={application.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.4 }}
                            className="hover:bg-white/10 transition-colors"
                          >
                            <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center">
                              {/* Application Info (Left Side) */}
                              <div className="flex-1 mb-4 md:mb-0 pr-4">
                                <motion.h3
                                  className="font-bold text-white text-lg mb-1"
                                  title={application.title}
                                  whileHover={{ scale: 1.04 }}
                                >
                                  {application.title}
                                </motion.h3>
                                <div className="text-gray-300 mb-1">{application.company}</div>
                                {application.location && (
                                  <div className="text-sm text-gray-400 flex items-center mb-2">
                                    <span className="mr-1">📍</span>
                                    {application.location}
                                  </div>
                                )}
                                <div className="flex items-center gap-4">
                                  <div className="text-xs text-gray-400">
                                    Added: {formatDate(application.created_at)}
                                  </div>
                                  <div className="flex items-center">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${statusConfig[application.status].color}`}>
                                      {application.status}
                                    </span>
                                  </div>
                                  <a
                                    href={application.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                                  >
                                    View Posting
                                    <span className="h-3 w-3 ml-1">↗️</span>
                                  </a>
                                </div>
                              </div>
                              {/* Status Buttons (Right Side) */}
                              <div className="flex flex-wrap gap-2 justify-end">
                                <motion.button
                                  whileHover={{ scale: 1.08 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setSelectedApplication(application)}
                                  className="px-3 py-1.5 bg-white/10 text-white rounded hover:bg-white/20 transition-colors text-sm"
                                >
                                  ✏️
                                </motion.button>
                                {Object.entries(statusConfig).map(([status, config]) => (
                                  <motion.button
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.95 }}
                                    key={status}
                                    onClick={() => updateApplicationStatus(application.id, status)}
                                    className={`px-3 py-1.5 rounded text-sm flex items-center ${
                                      application.status === status
                                        ? `${config.color} text-white`
                                        : 'bg-white/10 hover:bg-white/20 text-gray-300'
                                    }`}
                                  >
                                    <span className="mr-1">{config.icon}</span>
                                    {config.title}
                                  </motion.button>
                                ))}
                                <motion.button
                                  whileHover={{ scale: 1.08 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => showDeleteConfirmation(application)}
                                  className="px-3 py-1.5 bg-red-900/40 text-red-400 rounded hover:bg-red-900/60 hover:text-red-300 transition-colors text-sm"
                                >
                                  🗑️
                                </motion.button>
                              </div>
                            </div>
                            {/* Notes Preview (if available) */}
                            {application.notes && (
                              <div className="px-5 pb-4 -mt-1">
                                <div className="border-t border-white/10 pt-3 text-sm text-gray-400">
                                  <div className="font-medium text-xs text-gray-500 mb-1">Notes:</div>
                                  <div className="italic">
                                    {application.notes}
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </main>
        {/* Application Details / Create Modal */}
        <AnimatePresence>
          {(selectedApplication || isCreating) && (
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white/10 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-xl"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-white">{isCreating ? 'Add Custom Application' : selectedApplication.title}</h2>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setSelectedApplication(null); setIsCreating(false); }}
                      className="text-gray-400 hover:text-white"
                    >
                      ✖️
                    </motion.button>
                  </div>
                  {!isCreating && selectedApplication && (
                    <div className="mb-6">
                      <div className="text-lg font-semibold text-gray-300">{selectedApplication.company}</div>
                      {selectedApplication.location && (
                        <div className="text-gray-400">{selectedApplication.location}</div>
                      )}
                      <div className="mt-3 flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[selectedApplication.status]?.color}`}>
                          {selectedApplication.status}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          Last updated: {formatDate(selectedApplication.updated_at)}
                        </span>
                      </div>
                      {selectedApplication.url && (
                        <div className="mt-4">
                          <a
                            href={selectedApplication.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            View Original Posting ↗️
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  {isCreating && (
                    <div className="mb-6 grid gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Position / Title</label>
                        <input
                          type="text"
                          name="title"
                          value={customApp.title}
                          onChange={handleCustomAppChange}
                          className="w-full px-3 py-2 bg-white/10 text-gray-200 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                        <input
                          type="text"
                          name="company"
                          value={customApp.company}
                          onChange={handleCustomAppChange}
                          className="w-full px-3 py-2 bg-white/10 text-gray-200 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                        <input
                          type="text"
                          name="location"
                          value={customApp.location}
                          onChange={handleCustomAppChange}
                          className="w-full px-3 py-2 bg-white/10 text-gray-200 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Link to Posting (optional)</label>
                        <input
                          type="url"
                          name="url"
                          value={customApp.url}
                          onChange={handleCustomAppChange}
                          className="w-full px-3 py-2 bg-white/10 text-gray-200 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                  {/* Status Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Application Status
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(statusConfig).map(([status, config]) => (
                        <motion.button
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.97 }}
                          key={status}
                          onClick={() => {
                            if (isCreating) {
                              handleCustomAppStatus(status);
                            } else {
                              updateApplicationStatus(selectedApplication.id, status);
                            }
                          }}
                          className={`px-3 py-2 rounded text-sm flex items-center justify-center ${
                            (isCreating ? customApp.status === status : selectedApplication.status === status)
                              ? `${config.color} text-white`
                              : 'bg-white/10 hover:bg-white/20 text-gray-300'
                          }`}
                        >
                          <span className="mr-1.5">{config.icon}</span>
                          {config.title}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                    <textarea
                      id="notes"
                      rows={isCreating ? 4 : 6}
                      className="w-full px-3 py-2 bg-white/10 text-gray-200 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add notes about this application, interview details, contacts, or follow-ups..."
                      value={isCreating ? customApp.notes : notes}
                      onChange={(e) => {
                        if (isCreating) {
                          setCustomApp(prev => ({ ...prev, notes: e.target.value }));
                        } else {
                          setNotes(e.target.value);
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-between">
                    {!isCreating ? (
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => showDeleteConfirmation(selectedApplication)}
                        className="px-4 py-2 bg-red-900/40 text-red-400 rounded-lg hover:bg-red-900/60 hover:text-red-300 transition"
                      >
                        Delete
                      </motion.button>
                    ) : <div />}
                    <div className="space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setSelectedApplication(null); setIsCreating(false); }}
                        className="px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { isCreating ? saveNewCustomApplication() : saveNotes(); }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        {isCreating ? (isSavingNew ? 'Adding...' : 'Add') : 'Save'}
                      </motion.button>
                    </div>
                  </div>
                  {isCreating && creationError && (
                    <div className="mt-4 text-sm text-red-400">{creationError}</div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirmApplication && (
            <motion.div
              key="delete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white/10 rounded-xl max-w-md w-full border border-white/20 shadow-xl"
              >
                <div className="p-6">
                  <div className="flex items-center justify-center mb-6 text-red-500">
                    <span className="h-16 w-16 text-5xl">🗑️</span>
                  </div>
                  <h3 className="text-xl font-bold text-white text-center mb-2">Confirm Deletion</h3>
                  <p className="text-gray-300 text-center mb-6">
                    Are you sure you want to delete the application for <span className="text-white font-medium">{deleteConfirmApplication.title}</span> at <span className="text-white font-medium">{deleteConfirmApplication.company}</span>? This action cannot be undone.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDeleteConfirmApplication(null)}
                      className="px-5 py-2.5 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition font-medium"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => deleteApplication(deleteConfirmApplication.id)}
                      className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                    >
                      Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}
