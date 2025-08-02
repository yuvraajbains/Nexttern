import React, { useState, useEffect, useMemo } from 'react';
import { useSessionInternshipCache } from '../../hooks/useSessionInternshipCache';
import { useQuery } from '@tanstack/react-query';
import PageLayout from '../../components/layout/PageLayout';
import { supabase } from '../../api/supabaseClient';
import { Search, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Constants ---
const ITEMS_PER_PAGE = 10; // Number of internships to show per page

export default function Internships({ session }) {
  const { saveCache, loadCache, clearCache } = useSessionInternshipCache();
  // --- State Management ---
  // Controlled input states
  const [searchInput, setSearchInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [dateSearchInput, setDateSearchInput] = useState('');
  // Actual filter states (only update on search)
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [dateSearch, setDateSearch] = useState('');
  const [searchState, setSearchState] = useState('idle'); // idle, processing, retrieving, complete
  const [hasSearched, setHasSearched] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState({ show: false, message: '', type: '' });
  const [trackedInternships, setTrackedInternships] = useState(new Set());
  // Restore search state from session cache on mount (if logged in)
  useEffect(() => {
    if (session?.user?.id) {
      const cache = loadCache();
      if (cache && cache.sessionUserId === session.user.id) {
        setSearchInput(cache.searchInput || '');
        setLocationInput(cache.locationInput || '');
        setDateSearchInput(cache.dateSearchInput || '');
        setSearch(cache.search || '');
        setLocation(cache.location || '');
        setDateSearch(cache.dateSearch || '');
        setSearchState(cache.searchState || 'complete');
        setHasSearched(cache.hasSearched || false);
        setCurrentPage(cache.currentPage || 1);
      }
    }
  }, [session, loadCache]);
  
  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);

  // Always scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // --- Helper function to format dates nicely ---
  // This function remains unchanged but is crucial for data presentation.
  const formatPostedDate = (dateString) => {
    if (!dateString) return null;
    if (typeof dateString === 'string' && dateString.toLowerCase().includes('from github')) {
      return null;
    }
    const now = new Date();
    let date = null;
    if (typeof dateString === 'string') {
      const lower = dateString.toLowerCase().trim();
      let match = lower.match(/(\d+)\s*([a-z]+)(?:\s*ago)?/);
      if (match) {
        const value = parseInt(match[1], 10);
        const unit = match[2];
        let days = 0;
        if (unit.startsWith('day')) days = value;
        else if (unit.startsWith('week')) days = value * 7;
        else if (unit.startsWith('month')) days = value * 30;
        else if (unit.startsWith('hour')) days = value / 24;
        else if (unit.startsWith('minute')) days = value / (24 * 60);
        else if (unit === 'd') days = value;
        if (days > 0) {
          date = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        }
      }
    }
    if (!date) {
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-').map(Number);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[month-1]} ${day}, ${year}`;
      } else {
        date = new Date(dateString);
      }
    }
    if (!date || isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // --- Data Fetching Effects ---
  // Always fetch internships from /internships/search with current search criteria
  const { data: internships = [] } = useQuery({
    queryKey: ['internships', search, location, dateSearch],
    queryFn: async () => {
      // Build query params for backend
      const params = new URLSearchParams();
      if (search) params.append('keyword', search);
      if (location) params.append('location', location);
      // Note: dateSearch is not supported by backend, so only keyword/location
      const url = `${process.env.REACT_APP_API_URL}/internships/search${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      let data = await response.json();
      const unwantedPatterns = [
        /README/i, /CONTRIBUTING/i, /archived/i, /.md$/i, /season/i,
        /^https:\/\/github\.com.*\/(README|CONTRIBUTING)/i, /license/i,
        /CODE_OF_CONDUCT/i, /SECURITY/i, /ISSUE_TEMPLATE/i,
        /PULL_REQUEST_TEMPLATE/i, /.github/i, /.gitignore/i, /.git/i,
        /config\.yml/i, /.gitattributes/i
      ];
      const unwantedPhrases = [
        '.github', '.gitignore', 'config', 'workflow', 'template', 'docs/',
        '.git/', 'dependabot', 'actions', 'hooks', 'renovate', 'husky',
        'circleci', 'travis', 'publish', 'docker', 'linting', 'testing',
        'jest.config', 'webpack', 'babel', 'eslint', 'prettier', 'ci.yml',
        'github-', 'repo', 'settings', 'releases', 'tags', 'stale',
        'codeowners', 'funding', 'package.json', 'npm', 'setup',
        'CODEOWNERS', 'scripts', 'modules', 'node_modules', 'build'
      ];
      data = data.filter(internship => {
        if (!internship.title || !internship.company || !internship.url) return false;
        const titleLower = internship.title.toLowerCase();
        const urlLower = internship.url.toLowerCase();
        if (unwantedPatterns.some(p => p.test(urlLower) || p.test(titleLower))) return false;
        if (unwantedPhrases.some(phrase => urlLower.includes(phrase) || titleLower.includes(phrase))) return false;
        if (titleLower.includes('/') || titleLower.startsWith('.') || /\.(js|py|java|json|yaml|yml)$/i.test(titleLower) || titleLower.includes('changelog') || titleLower.includes('install')) {
            return false;
        }
        if (internship.source === 'GitHub') {
            const githubSpecificPatterns = [
                /^\./, /^\d{4}$/, /^\d{4}-\d{4}$/, /^archived\//i, /^archived-/i,
                /off-season/i, /^wiki/i, /^year-/i, /^page-/i, /^list-/i,
                /^index/i, /^future/i, /^past/i
            ];
            if (githubSpecificPatterns.some(p => p.test(titleLower))) return false;
            if (/^\d{4}$/.test(titleLower) || titleLower.endsWith('/')) return false;
        }
        return true;
      });
      // Format posted date
      return data.map(internship => ({
        ...internship,
        formattedPostedDate: formatPostedDate(internship.postedDate) || 'Unknown'
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Still fetch tracked internships for the user
  useEffect(() => {
    if (session?.user?.id) {
      fetchTrackedInternships();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // --- API Functions ---
  const fetchTrackedInternships = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('internship_id')
        .eq('user_id', session.user.id);
      if (error) throw error;
      const trackedIds = new Set(data.map(app => app.internship_id));
      setTrackedInternships(trackedIds);
    } catch (error) {
      // console.error('Error fetching tracked internships:', error);
    }
  };



  // --- Memoized Filtering Logic ---
  // Only show internships after user has searched or entered criteria; otherwise, show motivational message
  const filteredInternships = useMemo(() => {
    const searchLower = search.toLowerCase();
    const locationLower = location.toLowerCase();
    const dateLower = dateSearch.toLowerCase();
    // If user hasn't searched and all criteria are empty, return empty array to trigger motivational message
    if (!hasSearched && !searchLower && !locationLower && !dateLower) {
      return [];
    }
    // If user has searched and all criteria are empty, show all internships
    if (hasSearched && !searchLower && !locationLower && !dateLower) {
      return internships;
    }
    // Otherwise, filter
    return internships.filter((internship) => {
      const matchesSearch = !searchLower || (
        (internship.title?.toLowerCase().includes(searchLower)) ||
        (internship.company?.toLowerCase().includes(searchLower)) ||
        (internship.description?.toLowerCase().includes(searchLower))
      );
      const matchesLocation = !locationLower || (internship.location?.toLowerCase().includes(locationLower));
      const matchesDate = !dateLower || (
        (internship.postedDate?.toLowerCase().includes(dateLower)) ||
        (internship.formattedPostedDate?.toLowerCase().includes(dateLower))
      );
      return matchesSearch && matchesLocation && matchesDate;
    });
  }, [search, location, dateSearch, internships, hasSearched]);

  // --- Pagination Calculations ---
  const totalPages = Math.ceil(filteredInternships.length / ITEMS_PER_PAGE);
  const paginatedInternships = useMemo(() => {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      return filteredInternships.slice(startIndex, endIndex);
  }, [filteredInternships, currentPage]);


  // --- Event Handlers ---
  const handleSearch = () => {
    setSearch(searchInput);
    setLocation(locationInput);
    setDateSearch(dateSearchInput);
    setSearchState('processing');
    setCurrentPage(1); // Reset to first page on new search
    setHasSearched(true);

    setTimeout(() => {
      setSearchState('retrieving');
      setTimeout(() => {
        setSearchState('complete');
        // Save to session cache after search completes, using latest search criteria and results
        if (session?.user?.id) {
          saveCache({
            searchInput,
            locationInput,
            dateSearchInput,
            search: searchInput,
            location: locationInput,
            dateSearch: dateSearchInput,
            searchState: 'complete',
            hasSearched: true,
            currentPage: 1,
            sessionUserId: session.user.id,
          });
        }
      }, 500);
    }, 500);
  };

  const handleTrackInternship = async (internship, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    // Check if already tracked to prevent duplicate API calls
    if (trackedInternships.has(internship.id)) {
        setTrackingStatus({ show: true, message: 'This internship is already in your tracker!', type: 'info' });
        setTimeout(() => setTrackingStatus({ show: false, message: '', type: '' }), 3000);
        return;
    }

    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          user_id: session.user.id,
          internship_id: internship.id,
          title: internship.title || 'Untitled Position',
          company: internship.company || 'Unknown Company',
          location: internship.location || 'Remote/Various',
          description: internship.description || '',
          url: internship.url,
          status: 'Saved',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      if (error) throw error;
      
      setTrackedInternships(prev => new Set(prev).add(internship.id));
      setTrackingStatus({ show: true, message: 'Internship added to your tracker!', type: 'success' });
    } catch (error) {
      // console.error('Error tracking internship:', error);
      setTrackingStatus({ show: true, message: 'Failed to track internship. Please try again.', type: 'error' });
    } finally {
        setTimeout(() => setTrackingStatus({ show: false, message: '', type: '' }), 3000);
    }
  };
  
  const handleLogout = async () => {
    clearCache();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Find Internships', href: '/internships' },
    { label: 'My Applications', href: '/applications' },
    { label: 'My Alerts', href: '/alerts' },
    { label: 'Custom Projects', href: '/projects'},
    { label: 'Resources', href: '/resources' },
  ];

  // --- Render ---
  return (
    <PageLayout onLogout={handleLogout} navLinks={navLinks}>
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050c2e] via-[#1a2151] to-[#0f1635]" />
        <motion.div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }} />
        <motion.div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 1 }} />
      </div>

      <div className="relative min-h-screen">
        {/* Hero Section */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="pt-20 pb-12 text-center">
          <motion.h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-green-400">Find Your Next</span>
            <br />
            <span className="text-white">Internship</span>
          </motion.h1>
          <motion.div className="h-1.5 w-32 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 mx-auto rounded-full mb-8" initial={{ width: 0 }} animate={{ width: 128 }} transition={{ delay: 0.8, duration: 0.8 }} />
          <motion.p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>
            Search and track top tech internships, all in one place.
          </motion.p>
        </motion.section>

        {/* Search Section */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="mb-12 px-4">
          <motion.div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl" whileHover={{ scale: 1.01 }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="internshipSearch"
                  type="text"
                  autoComplete="off"
                  placeholder="Title, company, keyword..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
              </div>
              {/* Location Input */}
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="internshipLocation"
                  type="text"
                  autoComplete="address-level2"
                  placeholder="Location (e.g. Toronto, ON)"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={locationInput}
                  onChange={e => setLocationInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
              </div>
              {/* Date Input */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400">📅</span>
                <input
                  id="internshipDate"
                  type="text"
                  autoComplete="off"
                  placeholder="Date (e.g. 2025-07-15)"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  value={dateSearchInput}
                  onChange={e => setDateSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className="text-center">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={handleSearch} disabled={searchState === 'processing' || searchState === 'retrieving'} className="px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 min-w-[200px] group">
                {(searchState === 'processing' || searchState === 'retrieving') ? (
                  <div className="flex items-center justify-center"><motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-3" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} />Searching...</div>
                ) : (
                  <div className="flex items-center justify-center"><Search className="w-5 h-5 mr-2 group-hover:animate-pulse" />Search Internships</div>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.section>

        {/* Status Toast */}
        <AnimatePresence>
          {trackingStatus.show && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`fixed top-20 right-4 p-4 rounded-xl shadow-2xl z-50 border backdrop-blur-md ${trackingStatus.type === 'success' ? 'bg-green-500/90 border-green-400/30' : trackingStatus.type === 'error' ? 'bg-red-500/90 border-red-400/30' : 'bg-blue-500/90 border-blue-400/30'}`}>
              <div className="flex items-center text-white font-medium">
                {trackingStatus.type === 'success' && <span className="mr-2">✔️</span>}
                {trackingStatus.type === 'error' && <span className="mr-2">❌</span>}
                {trackingStatus.type === 'info' && <span className="mr-2">ℹ️</span>}
                {trackingStatus.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="mb-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-8">
                {/* Motivational message: only show if user has never searched (hasSearched is false) */}
                {!hasSearched && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                    <motion.div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-6" animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}><Search className="w-12 h-12 text-white" /></motion.div>
                    <h3 className="text-2xl font-bold text-white mb-4">Ready to Find Your Dream Internship?</h3>
                    <p className="text-gray-300 text-lg">Enter your search criteria above and discover amazing opportunities.</p>
                  </motion.div>
                )}
                
                {/* Loading/Status States */}
                {(searchState === 'processing' || searchState === 'retrieving') && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                     <motion.div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-6" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}><div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" /></motion.div>
                     <h3 className="text-2xl font-bold text-green-300 mb-4">{searchState === 'processing' ? 'Processing Your Search' : 'Finding Perfect Matches'}</h3>
                     <p className="text-gray-400">{searchState === 'processing' ? 'Analyzing your criteria...' : 'Discovering opportunities...'}</p>
                  </motion.div>
                )}

                {/* Results Display */}
                {searchState === 'complete' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {filteredInternships.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6"><Search className="w-12 h-12 text-white" /></div>
                        <h3 className="text-2xl font-bold text-white mb-4">No Results Found</h3>
                        <p className="text-gray-300 text-lg">Try adjusting your search criteria.</p>
                      </div>
                    ) : (
                      <>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full border border-green-400/30 backdrop-blur-sm">
                            <span className="text-green-300 font-bold text-lg">Found {filteredInternships.length} {filteredInternships.length === 1 ? 'Match' : 'Matches'}</span>
                          </div>
                        </motion.div>
                        
                        {/* List of Internships */}
                        <div className="space-y-4">
                          <AnimatePresence>
                            {paginatedInternships.map((internship) => (
                              <motion.div key={internship.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="group bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10" whileHover={{ scale: 1.015, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.15)' }}>
                                <div className="flex items-start justify-between flex-col md:flex-row gap-4">
                                  <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">{internship.title}</h3>
                                    <div className="flex flex-wrap items-center text-gray-300 mt-3 mb-3 gap-x-4 gap-y-2">
                                      <div className="flex items-center"><Briefcase className="w-4 h-4 mr-2 text-blue-400" /><span className="font-medium">{internship.company}</span></div>
                                      <div className="flex items-center"><span className="w-4 h-4 mr-2 text-green-400">📍</span><span>{internship.location}</span></div>
                                      <div className="flex items-center"><span className="w-4 h-4 mr-2 text-purple-400">📅</span><span>{internship.formattedPostedDate}</span></div>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">{internship.description}</p>
                                  </div>
                                  <div className="flex flex-col space-y-2 md:items-end flex-shrink-0">
                                    <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} onClick={(e) => handleTrackInternship(internship, e)} className={`p-3 rounded-xl transition-all duration-200 ${trackedInternships.has(internship.id) ? 'bg-green-500/20 border border-green-400/30 text-green-400' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`} title={trackedInternships.has(internship.id) ? 'Already tracked' : 'Track this internship'}>
                                      {trackedInternships.has(internship.id) ? <span className="w-5 h-5">✔️</span> : <span className="w-5 h-5">🔖</span>}
                                    </motion.button>
                                    <motion.a whileHover={{ scale: 1.06 }} href={internship.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-green-400 text-white rounded-full font-semibold shadow hover:from-blue-600 hover:to-green-500 transition whitespace-nowrap flex items-center justify-center mt-2">
                                      <span>Apply</span><span className="w-4 h-4 ml-1">↗️</span>
                                    </motion.a>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center pt-8 space-x-4">
                                <motion.button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-6 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Previous
                                </motion.button>
                                <span className="text-white font-medium">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <motion.button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-6 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Next
                                </motion.button>
                            </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </PageLayout>
  );
}