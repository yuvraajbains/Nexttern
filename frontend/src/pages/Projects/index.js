import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabaseClient';
import { generateProject } from '../../api/projects';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Copy, Download, RefreshCw, BookOpen, Lightbulb, Target, Zap } from 'lucide-react';
// Duplicate import removed
import PageLayout from '../../components/layout/PageLayout';

const LOADING_MESSAGES = [
  'Analyzing requirements...',
  'Crafting your project...',
  'Adding creative touches...',
  'Finalizing details...'
];

const PROJECT_EXAMPLES = [
  {
    title: "E-commerce Platform",
    description: "Full-stack developer role building scalable web applications",
    icon: <Target className="w-5 h-5" />
  },
  {
    title: "Data Analytics Dashboard",
    description: "Data scientist position analyzing user behavior patterns",
    icon: <BookOpen className="w-5 h-5" />
  },
  {
    title: "Mobile App Development",
    description: "iOS developer creating user-friendly mobile experiences",
    icon: <Zap className="w-5 h-5" />
  }
];

// Removed duplicate import of generateProject

export default function Projects() {
  const [projectCount, setProjectCount] = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [jobDescription, setJobDescription] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [showModal, setShowModal] = useState(false);
  // Track how many projects generated this session (for UI only)
  const [generationCount, setGenerationCount] = useState(0);
  const [error, setError] = useState('');
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  // Project history state
  const [projectHistory, setProjectHistory] = useState([]);
  const [selectedHistoryIdx, setSelectedHistoryIdx] = useState(null);
  const [userId, setUserId] = useState(null);


  // Fetch project_count from Supabase on mount
  useEffect(() => {
    const fetchProjectCountAndHistory = async () => {
      setProfileLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        setProjectCount(0);
        setProfileLoading(false);
        setUserId(null);
        setProjectHistory([]);
        return;
      }
      setUserId(user.id);
      // Project count
      const { data, error } = await supabase
        .from('profiles')
        .select('project_count')
        .eq('id', user.id)
        .single();
      if (error || !data) {
        setProjectCount(0);
      } else {
        setProjectCount(data.project_count);
      }
      setProfileLoading(false);
      // Load project history from localStorage
      const historyRaw = localStorage.getItem(`projectHistory_${user.id}`);
      if (historyRaw) {
        try {
          setProjectHistory(JSON.parse(historyRaw));
        } catch {
          setProjectHistory([]);
        }
      } else {
        setProjectHistory([]);
      }
    };
    fetchProjectCountAndHistory();
  }, []);

  const wordCount = jobDescription.trim().split(/\s+/).filter(Boolean).length;
  const maxWords = 250;

  const handleGenerate = async () => {
    if (wordCount === 0 || wordCount > maxWords || projectsGenerated >= maxProjects) return;
    setIsLoading(true);
    setOutput('');
    setError('');
    setLoadingStep(0);
    setSelectedHistoryIdx(null);
    const interval = setInterval(() => {
      setLoadingStep((s) => (s + 1) % LOADING_MESSAGES.length);
    }, 1000);
    try {
      const resultText = await generateProject(jobDescription);
      setOutput(resultText);
      // Save to localStorage project history
      if (userId) {
        const newEntry = {
          timestamp: Date.now(),
          jobDescription,
          output: resultText
        };
        let updatedHistory = [newEntry, ...projectHistory];
        // Limit to 10 most recent
        if (updatedHistory.length > 10) updatedHistory = updatedHistory.slice(0, 10);
        setProjectHistory(updatedHistory);
        localStorage.setItem(`projectHistory_${userId}`, JSON.stringify(updatedHistory));
      }
      // Increment project_count in Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .update({ project_count: (projectsGenerated || 0) + 1 })
          .eq('id', user.id)
          .select('project_count')
          .single();
        if (!error && data) {
          setProjectCount(data.project_count);
        } else {
          setProjectCount((c) => (c || 0) + 1);
        }
      }
      setShowLimitModal(true);
      if (generationCount === 0) setShowModal(true);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to generate project. Please try again.');
    } finally {
      clearInterval(interval);
      setIsLoading(false);
      setGenerationCount((c) => c + 1);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-generated-project.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExampleClick = (example) => {
    setJobDescription(example.description);
  };

  // Standard navLinks for main pages
  const navLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Find Internships', href: '/internships' },
    { label: 'My Applications', href: '/applications' },
    { label: 'My Alerts', href: '/alerts' },
    { label: 'Custom Projects', href: '/projects' },
    { label: 'Resources', href: '/resources' },
  ];

  // Calculate remaining and generated
  const maxProjects = 5;
  const projectsGenerated = typeof projectCount === 'number' ? projectCount : 0;
  const remainingToday = maxProjects - projectsGenerated;

  return (
    <PageLayout navLinks={navLinks}>
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050c2e] via-[#1a2151] to-[#0f1635]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-green-500/5 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="relative pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 rounded-2xl flex items-center justify-center mr-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-green-400">
                DNA Project Extractor
              </h1>
            </div>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Transform any job description into a portfolio-worthy project that showcases your skills and stands out to employers.
            </p>
            
            {/* Stats Row */}
            <div className="flex justify-center space-x-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">5K+</div>
                <div className="text-sm text-gray-400">Projects Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">95%</div>
                <div className="text-sm text-gray-400">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">30+</div>
                <div className="text-sm text-gray-400">Tech Stacks</div>
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input & History Section - Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-2 space-y-8"
            >
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 p-8">
              {/* Previous Projects History */}
              {projectHistory.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-400" />
                    Previous Projects
                  </h3>
                  <div className="space-y-2">
                    {projectHistory.map((proj, idx) => (
                      <button
                        key={proj.timestamp}
                        className={`w-full text-left p-3 rounded-lg border border-white/10 bg-white/10 hover:bg-white/20 transition-all duration-200 ${selectedHistoryIdx === idx ? 'ring-2 ring-blue-400' : ''}`}
                        onClick={() => {
                          setOutput(proj.output);
                          setJobDescription(proj.jobDescription);
                          setSelectedHistoryIdx(idx);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-white font-mono text-xs truncate max-w-xs">{proj.jobDescription.slice(0, 60)}{proj.jobDescription.length > 60 ? '...' : ''}</span>
                          <span className="text-gray-400 text-xs ml-2">{new Date(proj.timestamp).toLocaleString()}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Lightbulb className="w-6 h-6 mr-2 text-yellow-400" />
                  Describe Your Dream Role
                </h2>
                
                <textarea
                  className="w-full h-40 rounded-xl p-4 bg-white/10 text-white border border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none resize-none mb-4 text-base font-medium transition-all duration-300 placeholder-gray-400"
                  placeholder="Paste a job description or describe your ideal internship/job role. Include technologies, responsibilities, and company type..."
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value.slice(0, 2000))}
                  maxLength={2000}
                  disabled={isLoading}
                />
                
                <div className="flex items-center justify-between mb-6">
                  <span className={`text-sm font-medium ${
                    wordCount > maxWords ? 'text-red-400' : 
                    wordCount > maxWords * 0.8 ? 'text-yellow-400' : 'text-gray-400'
                  }`}>
                    {wordCount} / {maxWords} words
                  </span>
                  <div className="flex space-x-3">
                    <button
                      className="px-4 py-2 rounded-lg font-medium text-gray-300 bg-white/10 border border-white/10 hover:bg-white/20 transition-all duration-300 flex items-center"
                      onClick={() => setJobDescription('')}
                      disabled={isLoading}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Clear
                    </button>
                    <button
                      className={`px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-purple-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center`}
                      onClick={handleGenerate}
                      disabled={isLoading || wordCount === 0 || wordCount > maxWords || projectsGenerated >= maxProjects || profileLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : projectsGenerated >= maxProjects && !profileLoading ? (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Limit Reached
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate Project
                        </>
                      )}
                    </button>
        {/* Project Limit Modal */}
        <AnimatePresence>
          {showLimitModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Project Generation Limit</h2>
                <p className="text-gray-700 mb-6">
                  {projectCount === 1
                    ? 'You have 1 project generation left.'
                    : projectCount === 0
                    ? 'You have reached your project generation limit. Upgrade or contact support to unlock more.'
                    : `You have ${projectCount} project generations left.`}
                </p>
                <button
                  className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                  onClick={() => setShowLimitModal(false)}
                >
                  OK
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
                  </div>
                </div>

                {/* Loading Animation */}
                <AnimatePresence>
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex flex-col items-center justify-center py-12 border-t border-white/10"
                    >
                      <div className="relative mb-6">
                        <div className="w-20 h-20 border-4 border-blue-400/20 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-400 rounded-full animate-spin"></div>
                        <Sparkles className="absolute inset-0 w-8 h-8 text-blue-400 m-auto" />
                      </div>
                      <motion.div
                        key={loadingStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-lg font-semibold text-blue-200"
                      >
                        {LOADING_MESSAGES[loadingStep]}
                      </motion.div>
                      <div className="flex space-x-2 mt-4">
                        {LOADING_MESSAGES.map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              i === loadingStep ? 'bg-blue-400' : 'bg-white/20'
                            }`}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error Display */}
                <AnimatePresence>
                  {error && !isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mt-6 p-4 rounded-xl bg-red-900/30 border border-red-500/30 text-red-400 font-medium"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Examples Section - Right Column */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-green-400" />
                  Common Themes
                </h3>
                <div className="space-y-3">
                  {PROJECT_EXAMPLES.map((example, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full text-left p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 transition-all duration-300"
                      onClick={() => handleExampleClick(example)}
                      disabled={isLoading}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          {example.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">{example.title}</div>
                          <div className="text-xs text-gray-400 mt-1">{example.description}</div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Usage Stats */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Your Usage</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Projects Generated</span>
                    <span className="text-white font-semibold">{projectsGenerated}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Remaining</span>
                    <span className={`font-semibold ${remainingToday === 0 ? 'text-red-400' : remainingToday === 1 ? 'text-yellow-400' : 'text-green-400'}`}>{remainingToday}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Output Section */}
          <AnimatePresence>
            {output && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="mt-8"
              >
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                  {/* Output Header */}
                  <div className="bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-purple-900/30 p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-white flex items-center">
                        <Sparkles className="w-6 h-6 mr-2 text-yellow-400" />
                        Your Custom Project
                      </h3>
                      <div className="flex space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 rounded-lg font-medium text-white bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-300 flex items-center"
                          onClick={handleCopy}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          {showCopySuccess ? 'Copied!' : 'Copy'}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center"
                          onClick={handleDownload}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </motion.button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Output Content */}
                  <div className="p-6">
                    <div className="text-white text-base leading-relaxed whitespace-pre-line font-mono bg-black/20 rounded-xl p-6 max-h-96 overflow-y-auto">
                      {output}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal for generation limit */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Great job!</h2>
                <p className="text-gray-700 mb-6">
                  You've generated your first project! Keep exploring different job descriptions to build an amazing portfolio.
                </p>
                <button
                  className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                  onClick={() => setShowModal(false)}
                >
                  Continue Creating
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}