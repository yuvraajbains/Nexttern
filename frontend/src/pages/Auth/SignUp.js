import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle, Mail, Lock } from 'lucide-react';
import { supabase } from '../../api/supabaseClient';
import { motion } from 'framer-motion';
import zxcvbn from 'zxcvbn';
import validator from 'validator';

export default function SignUp({ onNavigateToSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const passwordStrength = zxcvbn(password);
  const isStrong = passwordStrength.score >= 3;

  const validateForm = () => {
    const errors = {};
    if (!email) errors.email = 'Email is required';
    else if (!validator.isEmail(email)) errors.email = 'Please enter a valid email address';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters long';
    else if (!isStrong) errors.password = 'Password is too weak. Try adding numbers or symbols.';
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const showNotificationMsg = (message, type = 'error') => setNotification({ message, type });

  const handleError = (error) => {
    const errorMessages = {
      'User already registered': 'An account with this email already exists.',
      'Email rate limit exceeded': 'You are trying to sign up too frequently. Please wait a moment.',
    };
    const userMessage = errorMessages[error.message] || 'An error occurred. Please try again.';
    showNotificationMsg(userMessage, 'error');
    if (process.env.NODE_ENV === 'development') {
      // console.error('Auth error:', error);
    }
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setNotification(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        handleError(error);
      } else {
        // Insert default profile with avatar if user object exists
        const user = data?.user;
        if (user) {
          await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
            avatar_url: '/defaultprofilepic.jpg',
          });
        }
        showNotificationMsg('Success! Check your email for a confirmation link.', 'success');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
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
          <p className="text-white/80 text-lg mt-4">Create your account</p>
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
          onSubmit={handleSignUp}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400/70 pointer-events-none" />
              <motion.input
                whileFocus={{ boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)' }}
                id="email" type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} disabled={loading}
                className={`w-full pl-11 pr-4 py-3 border bg-white/10 rounded-lg focus:outline-none focus:border-blue-400 disabled:bg-black/20 disabled:cursor-not-allowed transition-all ${validationErrors.email ? 'border-red-500/50' : 'border-white/20'} text-white placeholder-white/40`}
                autoComplete="email"
              />
            </div>
            {validationErrors.email && <p className="mt-1.5 text-xs text-red-400">{validationErrors.email}</p>}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400/70 pointer-events-none" />
              <motion.input
                whileFocus={{ boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)' }}
                id="password" type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" value={password}
                onChange={e => setPassword(e.target.value)} disabled={loading}
                className={`w-full pl-11 pr-12 py-3 border bg-white/10 rounded-lg focus:outline-none focus:border-blue-400 disabled:bg-black/20 disabled:cursor-not-allowed transition-all ${validationErrors.password ? 'border-red-500/50' : 'border-white/20'} text-white placeholder-white/40`}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading} className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/60 hover:text-blue-400 disabled:cursor-not-allowed transition-colors" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full rounded-full transition-colors ${
                        passwordStrength.score <= 1 ? 'bg-red-500' :
                        passwordStrength.score === 2 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength.score + 1) * 25}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-xs font-medium text-white/70">
                    {passwordStrength.score <= 1 ? 'Weak' : passwordStrength.score === 2 ? 'Fair' : 'Strong'}
                  </span>
                </div>
              </div>
            )}
            {validationErrors.password && <p className="mt-1.5 text-xs text-red-400">{validationErrors.password}</p>}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400/70 pointer-events-none" />
              <motion.input
                whileFocus={{ boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)' }}
                id="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Confirm your password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)} disabled={loading}
                className={`w-full pl-11 pr-4 py-3 border bg-white/10 rounded-lg focus:outline-none focus:border-blue-400 disabled:bg-black/20 disabled:cursor-not-allowed transition-all ${validationErrors.confirmPassword ? 'border-red-500/50' : 'border-white/20'} text-white placeholder-white/40`}
                autoComplete="new-password"
              />
            </div>
            {validationErrors.confirmPassword && <p className="mt-1.5 text-xs text-red-400">{validationErrors.confirmPassword}</p>}
          </div>
          
          <div className="pt-2 space-y-4">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-bold text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0a174a] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />Creating Account...</>) : ('Create Account')}
            </motion.button>
            
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-white/40 text-sm">Or</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} type="button" disabled={loading}
              onClick={() => { window.location.href = '/signin'; }}
              className="w-full bg-white/10 border border-white/20 text-white py-3 rounded-lg font-bold text-base shadow-lg hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[#0a174a] transition-all disabled:opacity-70"
            >
              Sign In Instead
            </motion.button>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}