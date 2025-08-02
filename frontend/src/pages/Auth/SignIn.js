import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle, Mail, Lock } from 'lucide-react';
import { supabase } from '../../api/supabaseClient';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';

export default function SignIn({ onNavigateToSignUp }) {
  // Google sign-in handler
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error) {
      showNotificationMsg('Google sign-in failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const errors = {};
    if (!email) errors.email = 'Email is required';
    else if (!validateEmail(email)) errors.email = 'Please enter a valid email address';
    if (!isResetMode && !password) errors.password = 'Password is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const showNotificationMsg = (message, type = 'error') => setNotification({ message, type });

  const handleError = (error) => {
    const errorMessages = {
      'Invalid login credentials': 'Invalid email or password.',
      'Invalid email': 'Invalid email or password.',
    };
    const userMessage = errorMessages[error.message] || 'An error occurred. Please try again.';
    showNotificationMsg(userMessage, 'error');
    if (process.env.NODE_ENV === 'development') {
      // console.error('Auth error:', error);
    }
  };
  
  const handleForgotPassword = async () => {
    if (!email || !validateEmail(email)) {
      setValidationErrors({ email: 'Please enter a valid email address' });
      showNotificationMsg('Please enter a valid email address to reset your password', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/update-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: redirectUrl,
      });
      
      if (error) throw error;
      
      showNotificationMsg(
        'If an account exists with this email, a password reset link will be sent shortly.', 
        'success'
      );
    } catch (error) {
      showNotificationMsg(
        'If an account exists with this email, a password reset link will be sent shortly.', 
        'success'
      );
      if (process.env.NODE_ENV === 'development') {
        // console.error('Password reset error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setNotification(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      
      if (error) {
        handleError(error);
      } else {
        showNotificationMsg('Success! Welcome back.', 'success');
        // No need to clear fields, as a redirect will happen
      }
    } catch (error) {
      handleError({ message: 'Network error. Please check your connection.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background from resources page */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050c2e] via-[#1a2151] to-[#0f1635]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md w-full bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl p-8"
      >
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 mb-2 tracking-tight">
            Nexttern
          </h1>
          <motion.div 
            className="h-1 w-24 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 mx-auto rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          />
          <p className="text-white/80 text-lg mt-4">
            {isResetMode ? 'Reset Your Password' : 'Sign in to your account'}
          </p>
        </motion.div>
        
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-3 rounded-lg flex items-center gap-2 transition-all ${
              notification.type === 'success'
                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </motion.div>
        )}
        
        <motion.form 
          className="space-y-5" 
          onSubmit={isResetMode ? (e => { e.preventDefault(); handleForgotPassword(); }) : handleSignIn} 
          autoComplete="off"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400/70 pointer-events-none" />
              <motion.input
                whileFocus={{ boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)' }}
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                className={`w-full pl-11 pr-4 py-3 border bg-white/10 rounded-lg focus:outline-none focus:border-blue-400 disabled:bg-black/20 disabled:cursor-not-allowed transition-all ${
                  validationErrors.email ? 'border-red-500/50' : 'border-white/20'
                } text-white placeholder-white/40`}
                autoComplete="username"
              />
            </div>
            {validationErrors.email && (
              <p className="mt-1.5 text-xs text-red-400">{validationErrors.email}</p>
            )}
          </div>
          
          {!isResetMode && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400/70 pointer-events-none" />
                <motion.input
                  whileFocus={{ boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)' }}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  className={`w-full pl-11 pr-12 py-3 border bg-white/10 rounded-lg focus:outline-none focus:border-blue-400 disabled:bg-black/20 disabled:cursor-not-allowed transition-all ${
                    validationErrors.password ? 'border-red-500/50' : 'border-white/20'
                  } text-white placeholder-white/40`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/60 hover:text-blue-400 disabled:cursor-not-allowed transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1.5 text-xs text-red-400">{validationErrors.password}</p>
              )}
              <div className="flex justify-end mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsResetMode(true)}
                  className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </div>
          )}
          
          <div className="pt-2 space-y-4">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-bold text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0a174a] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isResetMode ? 'Sending Link...' : 'Signing In...'}
                </>
              ) : (
                isResetMode ? 'Send Reset Link' : 'Sign In'
              )}
            </motion.button>
            
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-white/40 text-sm">Or</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={isResetMode ? () => setIsResetMode(false) : onNavigateToSignUp}
              disabled={loading}
              className="w-full bg-white/10 border border-white/20 text-white py-3 rounded-lg font-bold text-base shadow-lg hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[#0a174a] transition-all disabled:opacity-70"
            >
              {isResetMode ? 'Back to Sign In' : 'Create an Account'}
            </motion.button>
          </div>
          {/* Google Sign In Button */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 mt-2 py-3 rounded-lg font-bold text-base bg-white text-gray-800 shadow-lg hover:bg-gray-100 transition-all border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0a174a] disabled:opacity-70"
            style={{ letterSpacing: 0.2 }}
          >
            <FcGoogle className="w-6 h-6" />
            <span>Sign in with Google</span>
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
}
