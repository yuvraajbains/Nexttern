import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLayout from '../../components/layout/PageLayout';
import { useAuth } from '../../hooks/useAuth';
import { Search, Briefcase, Bell, BookOpen, TrendingUp, Users, Target, Zap } from 'lucide-react';

export default function Dashboard({ session }) {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Find Internships', href: '/internships' },
    { label: 'My Applications', href: '/applications' },
    { label: 'My Alerts', href: '/alerts' },
    { label: 'Custom Projects', href: '/projects' },
    { label: 'Resources', href: '/resources' },
  ];

  const primaryActions = [
    {
      title: 'Find Internships',
      description: 'Discover opportunities from top tech companies worldwide',
      icon: Search,
      href: '/internships',
      gradient: 'from-blue-500 via-blue-600 to-purple-600',
      glowColor: 'shadow-blue-500/25',
      hoverGlow: 'hover:shadow-blue-500/40',
      stats: '5,000+ opportunities'
    },
    {
      title: 'Application Tracker',
      description: 'Manage and track your internship applications effortlessly',
      icon: Briefcase,
      href: '/applications',
      gradient: 'from-purple-500 via-indigo-600 to-pink-600',
      glowColor: 'shadow-purple-500/25',
      hoverGlow: 'hover:shadow-purple-500/40',
      stats: 'Smart tracking',
      badge: 'NEW!'
    }
  ];

  const secondaryActions = [
    {
      title: 'Smart Alerts',
      description: 'Get notified about new opportunities',
      icon: Bell,
      href: '/alerts',
      color: 'from-green-400 to-emerald-600'
    },
    {
      title: 'Resources',
      description: 'Resume templates, interview guides & more',
      icon: BookOpen,
      href: '/resources',
      color: 'from-orange-400 to-red-600'
    }
  ];

  const stats = [
    { label: 'Active Internships', value: '1000+', icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Companies', value: '400+', icon: Users, color: 'text-purple-400' },
    { label: 'Applications Tracked', value: '10,000+', icon: Target, color: 'text-green-400' },
    { label: 'Trusted Sources', value: '100%', icon: Zap, color: 'text-orange-400' }
  ];

  return (
    <PageLayout onLogout={handleLogout} navLinks={navLinks}>
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050c2e] via-[#1a2151] to-[#0f1635]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
      </div>

      <div className="relative min-h-screen">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="pt-20 pb-16 text-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-green-400">
                Your Tech Career
              </span>
              <br />
              <span className="text-white">Starts Here</span>
            </h1>
            <motion.div 
              className="h-1.5 w-32 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 mx-auto rounded-full mb-8"
              initial={{ width: 0 }}
              animate={{ width: 128 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            />
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              Connect with top tech companies, track your applications, and land your dream internship with our all-inclusive platform.
            </p>
          </motion.div>
        </motion.section>

        {/* Stats Section */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto px-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`w-6 h-6 ${stat.color} group-hover:scale-110 transition-transform`} />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                    className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                  />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Primary Actions */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mb-16 px-4"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {primaryActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.2, duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={action.href}
                  onClick={() => {
                    setTimeout(() => {
                      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    }, 0);
                  }}
                  className={`relative block group overflow-hidden rounded-2xl bg-gradient-to-br ${action.gradient} p-8 shadow-2xl ${action.glowColor} ${action.hoverGlow} hover:shadow-2xl transition-all duration-500`}
                >
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl group-hover:bg-white/20 transition-all duration-300">
                        <action.icon className="w-8 h-8 text-white" />
                      </div>
                      {action.badge && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1.2, duration: 0.4 }}
                          className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-white/30"
                        >
                          {action.badge}
                        </motion.span>
                      )}
                    </div>
                    
                    <h3 className="text-3xl font-bold text-white mb-3 group-hover:text-blue-50 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-white/80 text-lg mb-4 leading-relaxed">
                      {action.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm font-medium">
                        {action.stats}
                      </span>
                      <motion.div
                        className="flex items-center text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all duration-300"
                        whileHover={{ x: 4 }}
                      >
                        <span className="text-sm font-medium mr-2">Explore</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Secondary Actions */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          className="mb-16 px-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {secondaryActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={action.href}
                  onClick={() => {
                    setTimeout(() => {
                      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    }, 0);
                  }}
                  className="group block bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-50 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                        {action.description}
                      </p>
                    </div>
                    <motion.div
                      className="text-white/50 group-hover:text-white/80 group-hover:translate-x-1 transition-all duration-300"
                      whileHover={{ x: 4 }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Footer CTA */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="text-center pb-20"
        >
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Launch Your Career?</h2>
              <p className="text-gray-300 mb-6">Join thousands of students who've landed their dream internships through Nexttern.</p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/internships"
                  onClick={() => {
                    // Scroll to top after navigation
                    setTimeout(() => {
                      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    }, 0);
                  }}
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Start Your Journey
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </div>
    </PageLayout>
  );
}