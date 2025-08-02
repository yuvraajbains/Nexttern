import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabaseClient';
import { SubscriptionService } from '../../api/subscriptions';
import PageLayout from '../../components/layout/PageLayout';
import { motion, AnimatePresence } from 'framer-motion';

export default function Alerts({ session }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState({ show: false, message: '', type: '' });

  const fetchSubscriptions = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await SubscriptionService.getUserSubscriptions(session.user.id);
      setSubscriptions(data);
    } catch (error) {
      // console.error('Error fetching subscriptions:', error);
      showAlert('Error loading your alert subscriptions', 'error');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchSubscriptions();
    }
  }, [session, fetchSubscriptions]);

  const handleAddSubscription = async (e) => {
    e.preventDefault();
    
    if (!newKeyword.trim()) {
      showAlert('Please enter a keyword', 'error');
      return;
    }
    
    // Check if user has reached the maximum allowed alerts (10)
    if (subscriptions.length >= 10) {
      showAlert('You have reached the maximum limit of 10 alerts', 'error');
      return;
    }
    
    try {
      setLoading(true);
      await SubscriptionService.addSubscription(session.user.id, newKeyword);
      setNewKeyword('');
      await fetchSubscriptions();
      showAlert('Keyword alert added successfully!', 'success');
    } catch (error) {
      // console.error('Error adding subscription:', error);
      showAlert('Failed to add keyword alert', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscription = async (subscriptionId) => {
    try {
      setLoading(true);
      await SubscriptionService.deleteSubscription(subscriptionId);
      await fetchSubscriptions();
      showAlert('Keyword alert removed', 'success');
    } catch (error) {
      // console.error('Error deleting subscription:', error);
      showAlert('Failed to remove keyword alert', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type) => {
    setAlertMessage({
      show: true,
      message,
      type
    });
    
    setTimeout(() => {
      setAlertMessage({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleLogout = async () => {
    try {
      // Redirect to landing page after successful sign out
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      // console.error('Error signing out:', error);
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
      <div className="flex-1 flex flex-col items-center w-full relative min-h-screen">
      <section className="w-full max-w-4xl mx-auto mb-24">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-center drop-shadow-lg"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-green-400">
            My Alert Subscriptions
          </span>
        </motion.h1>

          {/* Alert Message Toast */}
          <AnimatePresence>
            {alertMessage.show && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className={`fixed top-20 right-4 p-4 rounded-xl shadow-2xl z-50 border backdrop-blur-md transition-all duration-300 ${
                  alertMessage.type === 'success' ? 'bg-green-500/90 border-green-400/30' :
                  alertMessage.type === 'error' ? 'bg-red-500/90 border-red-400/30' :
                  'bg-blue-500/90 border-blue-400/30'
                }`}
              >
                <div className="flex items-center text-white">
                  {alertMessage.type === 'success' && <span className="mr-2">✔️</span>}
                  {alertMessage.type === 'error' && <span className="mr-2">❌</span>}
                  {alertMessage.type === 'info' && <span className="mr-2">ℹ️</span>}
                  <span className="font-medium">{alertMessage.message}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add New Keyword Alert Card */}
          <motion.div
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Add New Keyword Alert</h2>
              <div className="text-sm text-gray-300">
                <span className={subscriptions.length >= 10 ? "text-red-400" : "text-blue-400"}>
                  {subscriptions.length}
                </span>
                <span>/10 alerts used</span>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Get weekly email digests with all new internships matching your keywords.
            </p>
            <form onSubmit={handleAddSubscription} className="flex flex-col sm:flex-row gap-4">
              <label htmlFor="alertKeyword" className="sr-only">Keyword</label>
              <input
                id="alertKeyword"
                name="alertKeyword"
                type="text"
                autoComplete="off"
                placeholder="Enter keyword (e.g., Software Engineer, Toronto, React)"
                className="flex-1 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                value={newKeyword}
                onChange={e => setNewKeyword(e.target.value)}
                disabled={loading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading || subscriptions.length >= 10}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-400 text-white rounded-xl font-semibold shadow hover:from-blue-600 hover:to-green-500 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <motion.span
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    >⏳</motion.span>
                    Processing...
                  </>
                ) : (
                  'Add Alert'
                )}
              </motion.button>
            </form>
            {subscriptions.length >= 10 && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-sm text-red-300">
                <div className="flex items-start">
                  <span className="h-5 w-5 mr-2 flex-shrink-0">⚠️</span>
                  <span>
                    You've reached the maximum limit of 10 alerts. Please delete some existing alerts to add new ones.
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Active Alerts Card */}
          <motion.div
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            whileHover={{ scale: 1.01 }}
          >
            <h2 className="text-xl font-bold text-white mb-4">My Active Alerts</h2>
            <AnimatePresence>
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.6 }}
                  className="text-center py-8"
                >
                  <motion.span
                    className="animate-spin h-10 w-10 text-blue-400 mx-auto"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                  >🔄</motion.span>
                  <p className="text-gray-300 mt-4">Loading your alerts...</p>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {!loading && subscriptions.length === 0 && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.6 }}
                  className="text-center py-8 border border-dashed border-white/20 rounded-lg"
                >
                  <span className="h-16 w-16 text-5xl mx-auto mb-4">🔔</span>
                  <p className="text-gray-300 mb-2">You don't have any keyword alerts yet.</p>
                  <p className="text-gray-400 text-sm">Add keywords above to get notified when matching internships are added.</p>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {!loading && subscriptions.length > 0 && (
                <motion.ul
                  key="list"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-3"
                >
                  {subscriptions.map((subscription) => (
                    <motion.li
                      key={subscription.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.4 }}
                      className="flex justify-between items-center bg-white/10 rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors"
                      whileHover={{ scale: 1.01, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.10)' }}
                    >
                      <div className="flex items-center">
                        <span className="h-5 w-5 text-blue-400 mr-3">🔔</span>
                        <div>
                          <div className="text-white font-semibold capitalize">{subscription.keyword}</div>
                          <div className="text-gray-400 text-xs">
                            Added {new Date(subscription.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteSubscription(subscription.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        disabled={loading}
                      >
                        🗑️
                      </motion.button>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
            <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
              <h3 className="text-lg font-semibold text-blue-300 flex items-center">
                <span className="h-5 w-5 mr-2">ℹ️</span>
                How It Works
              </h3>
              <p className="text-gray-300 mt-2 text-sm">
                Every Sunday at 8:00 PM, you'll receive a weekly digest email with all new internships matching your keywords that were added during the week, with direct links to apply. Keywords can be job titles, companies, locations, or skills.
              </p>
            </div>
          </motion.div>
        </section>
      </div>
    </PageLayout>
  );
}
