import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../api/supabaseClient'; // Real Supabase client
import PageLayout from '../../components/layout/PageLayout'; // Real PageLayout component
import { useAuth } from '../../hooks/useAuth'; // Real Auth hook
import { BookOpen, Search, Bookmark, BookmarkPlus, ExternalLink, AlertCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Constants ---

// Resource types with updated styling
const RESOURCE_TYPES = {
  ARTICLE: { label: 'Article', icon: <BookOpen className="h-4 w-4" />, color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  VIDEO: { label: 'Video', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  TOOL: { label: 'Interactive Tool', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  REPO: { label: 'GitHub Repo', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>, color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
  COURSE: { label: 'Course', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>, color: 'bg-green-500/20 text-green-300 border-green-500/30' }
};

const CATEGORIES = [
  { id: 'resume', name: 'Resume & CV Crafting', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'technical', name: 'Technical Preparation', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
  { id: 'system', name: 'System Design', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' },
  { id: 'behavioral', name: 'Behavioral Interviews', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z' },
  { id: 'negotiation', name: 'Offer Negotiation', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];

// Original mock data for development fallback


// --- Components ---

const Notification = ({ message, onClear }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClear();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message, onClear]);

    if (!message) return null;
    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            {message}
        </div>
    );
};

const ResourceCard = ({ resource, isFavorite, onToggleFavorite }) => {
  const resourceType = RESOURCE_TYPES[resource.type] || RESOURCE_TYPES.ARTICLE;
  
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 group overflow-hidden flex flex-col">
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${resourceType.color} flex items-center gap-1.5`}>
            {resourceType.icon}
            {resourceType.label}
          </span>
          <button
            onClick={() => onToggleFavorite(resource.id)}
            className={`p-2 rounded-lg transition-all duration-300 ${
              isFavorite
                ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="mb-6 flex-grow">
          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors line-clamp-2">
            {resource.title}
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
            {resource.description}
          </p>
        </div>
        
        {/* Removed rating/views UI */}

        <div className="flex items-center justify-between">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white rounded-lg hover:from-blue-500/40 hover:to-purple-500/40 transition-all duration-300 font-medium text-sm"
          >
            <span>View Resource</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

const SuggestionModal = ({ show, onClose, onSubmit, formState, setFormState }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  if (!show) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800/80 border border-white/20 rounded-2xl w-full max-w-lg p-8 shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white mb-6">Suggest a Resource</h2>
        <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input type="text" name="title" id="title" value={formState.title} onChange={handleInputChange} required className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-1">URL</label>
                <input type="url" name="url" id="url" value={formState.url} onChange={handleInputChange} required className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea name="description" id="description" rows="3" value={formState.description} onChange={handleInputChange} required className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                  <select name="category" id="category" value={formState.category} onChange={handleInputChange} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {CATEGORIES.map(cat => <option key={cat.id} value={cat.id} className="text-black">{cat.name}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                  <select name="type" id="type" value={formState.type} onChange={handleInputChange} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {Object.entries(RESOURCE_TYPES).map(([key, { label }]) => <option key={key} value={key} className="text-black">{label}</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg">Submit Suggestion</button>
              </div>
            </form>
          </div>
        </div>
      );
};


// --- Main App Component ---

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('resume');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [notification, setNotification] = useState('');
  const { session } = useAuth();
  const [suggestionForm, setSuggestionForm] = useState({
    title: '', url: '', description: '', category: 'resume', type: 'ARTICLE'
  });

  useEffect(() => {
    async function fetchResources() {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('resources').select('*');
        if (error) throw error;
        setResources(data || []);
        if (session && session.user) {
          const { data: favData, error: favError } = await supabase.from('saved_resources').select('resource_id').eq('user_id', session.user.id);
          if (favError) throw favError;
          if (favData) {
            setFavorites(favData.map(fav => fav.resource_id));
          }
        }
      } catch (err) {
        // console.error('Error fetching resources:', err);
        setError('Failed to load resources. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, [session]);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Redirect to landing page after successful sign out
      window.location.href = '/';
    } catch (error) {
      // console.error('Error signing out:', error);
      setNotification('Failed to sign out.');
    }
  };
  
  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const categoryMatch = resource.category === selectedCategory;
      const searchMatch = searchQuery === '' || 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase());
      const favoriteMatch = !showOnlyFavorites || favorites.includes(resource.id);
      return categoryMatch && searchMatch && favoriteMatch;
    });
  }, [resources, selectedCategory, searchQuery, favorites, showOnlyFavorites]);
  
  const toggleFavorite = async (resourceId) => {
    if (!session || !session.user) {
      setNotification("Please log in to save favorites");
      return;
    }
    
    const isFavorited = favorites.includes(resourceId);
    try {
      if (isFavorited) {
        await supabase.from('saved_resources').delete().match({ user_id: session.user.id, resource_id: resourceId });
        setFavorites(favorites.filter(id => id !== resourceId));
        setNotification("Removed from favorites.");
      } else {
        await supabase.from('saved_resources').insert([{ user_id: session.user.id, resource_id: resourceId }]);
        setFavorites([...favorites, resourceId]);
        setNotification("Added to favorites!");
      }
    } catch (err) {
      // console.error('Error updating favorites:', err);
      setNotification("Could not update favorites.");
    }
  };
  
  const handleSuggestionSubmit = async (e) => {
    e.preventDefault();
    if (!session || !session.user) {
      setNotification("Please log in to suggest resources");
      return;
    }
    
    try {
      await supabase.from('resource_suggestions').insert([{ ...suggestionForm, user_id: session.user.id, status: 'pending' }]);
      setSuggestionForm({ title: '', url: '', description: '', category: 'resume', type: 'ARTICLE' });
      setShowSuggestionModal(false);
      setNotification('Thank you! Your suggestion has been submitted for review.');
    } catch (err) {
      // console.error('Error submitting suggestion:', err);
      setNotification('Failed to submit suggestion. Please try again.');
    }
  };
  
  const navLinks = [
    { label: 'Dashboard', href: '/dashboard' }, { label: 'Find Internships', href: '/internships' },
    { label: 'My Applications', href: '/applications' }, { label: 'My Alerts', href: '/alerts' },   { label: 'Custom Projects', href: '/projects' },
    { label: 'Resources', href: '/resources' },
  ];

  return (
    <PageLayout onLogout={handleLogout} navLinks={navLinks}>
        <Notification message={notification} onClear={() => setNotification('')} />
        <div className="fixed inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-[#050c2e] via-[#1a2151] to-[#0f1635]" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

      <div className="relative min-h-screen">
        <section className="pt-20 pb-16 text-center">
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-green-400">Career Resources </span>
            <span className="text-white">Hub</span>
          </motion.h1>
          <div className="h-1.5 w-32 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 mx-auto rounded-full mb-8" />
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Everything you need to land your dream internship - from resume templates to interview guides.
          </p>
        </section>

        <section className="max-w-7xl mx-auto px-4 pb-20">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 w-full md:max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                  <label htmlFor="resourceSearch" className="sr-only">Search resources</label>
                  <input
                    id="resourceSearch"
                    name="resourceSearch"
                    type="text"
                    autoComplete="off"
                    placeholder="Search resources..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${showOnlyFavorites ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'}`}
                  >
                    <Bookmark className="h-4 w-4" />
                    <span className="hidden sm:inline">Favorites</span>
                  </button>
                    <button
                      onClick={() => setShowSuggestionModal(true)}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2 shadow-lg"
                    >
                      <BookmarkPlus className="h-4 w-4" />
                      <span className="hidden sm:inline">Suggest</span>
                    </button>
                </div>
              </div>
            </div>
          
            <div className="flex flex-col lg:flex-row">
              <aside className="lg:w-72 p-6 lg:border-r border-white/10 bg-white/5">
                <h2 className="font-semibold text-white/90 mb-4 text-lg">Categories</h2>
                <nav className="space-y-2">
                  {CATEGORIES.map((category) => (
                    <button key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${selectedCategory === category.id ? 'bg-blue-500/30 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={category.icon} /></svg>
                      <span className="font-medium">{category.name}</span>
                    </button>
                  ))}
                </nav>
              </aside>
              
              <div className="flex-1 p-6 min-h-[500px]">
                <div className="max-h-[70vh] overflow-y-auto pr-2">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                      <p className="mt-4 text-white/70 text-lg">Loading resources...</p>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
                      <h3 className="text-xl font-semibold text-red-300 mb-2">Something went wrong</h3>
                      <p className="text-red-300/80 mb-4">{error}</p>
                      <button className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl font-medium" onClick={() => window.location.reload()}>Try Again</button>
                    </div>
                  ) : filteredResources.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center bg-white/5 rounded-xl p-6">
                      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                        <Search className="h-10 w-10 text-white/40" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">No Resources Found</h3>
                      <p className="text-white/60 max-w-sm">Try adjusting your search query or category, or disable the favorites filter.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredResources.map(resource => (
                        <ResourceCard 
                          key={resource.id} 
                          resource={resource} 
                          isFavorite={favorites.includes(resource.id)}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <SuggestionModal 
        show={showSuggestionModal}
        onClose={() => setShowSuggestionModal(false)}
        onSubmit={handleSuggestionSubmit}
        formState={suggestionForm}
        setFormState={setSuggestionForm}
      />
    </PageLayout>
  );
}
