import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { supabase } from '../../api/supabaseClient';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import zxcvbn from 'zxcvbn';

export default function UpdatePassword({ onPasswordUpdated }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Password strength
  const passwordStrength = zxcvbn(password);
  const isStrong = passwordStrength.score >= 3;

  // Basic form validation
  const validateForm = () => {
    const errors = {};
    if (!password) errors.password = 'New password is required';
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters';
    else if (!isStrong) errors.password = 'Password is too weak. Try adding numbers or symbols.';

    if (!confirmPassword) errors.confirmPassword = 'Please confirm your new password';
    else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const showNotificationMsg = (message, type = 'error') => {
    setNotification({ message, type });
  };
  
  // Handle password update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const firstError = Object.values(validationErrors)[0];
      if (firstError) showNotificationMsg(firstError, 'error');
      return;
    }
    
    setLoading(true);
    setNotification(null);
    
    try {
      // Update the password
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      showNotificationMsg('Password updated successfully! Redirecting to login...', 'success');
      
      // Sign out from all sessions
      await supabase.auth.signOut({ scope: 'global' });
      
      // Notify parent component that password has been updated
      if (onPasswordUpdated) {
        onPasswordUpdated();
      }
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
      
    } catch (error) {
      // console.error('Password update error:', error);
      showNotificationMsg(
        error.message || 'Failed to update password. Please try again.', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleBackToSignIn = () => {
    navigate('/signin');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050c2e]/80 to-[#1a2151]/80 z-10"></div>
        <img 
          src="/images/background.png" 
          alt="Digital Network" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 max-w-md w-full backdrop-blur-lg bg-white/5 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/10 p-8">
        <div className="text-center mb-8">
          <motion.h1
            className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400 mb-2 tracking-tight"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Nexttern
          </motion.h1>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-400 to-green-400 mx-auto rounded-full" />
          <p className="text-white/80 text-lg mt-4">Update Your Password</p>
        </div>
        
        {notification && (
          <div
            className={`mb-6 p-3 rounded-md flex items-center gap-2 transition-all ${
              notification.type === 'success'
                ? 'bg-green-900/40 text-green-200 border border-green-500/30'
                : 'bg-red-900/40 text-red-200 border border-red-500/30'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm">{notification.message}</span>
          </div>
        )}
        
        <form 
          className="space-y-5" 
          onSubmit={handleUpdatePassword} 
          autoComplete="off"
        >
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-1">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400/70" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                aria-label="New Password"
                placeholder="Enter new password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                className={`w-full pl-11 pr-12 py-3 border bg-white/5 rounded-lg focus:outline-none focus:border-blue-400 disabled:bg-black/20 disabled:cursor-not-allowed transition ${
                  validationErrors.password ? 'border-red-500/50' : 'border-white/10'
                } text-white placeholder-white/30`}
                autoComplete="new-password"
                maxLength={128}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-blue-400 disabled:cursor-not-allowed transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-colors ${
                        passwordStrength.score <= 1 ? 'bg-red-500' :
                        passwordStrength.score === 2 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.score + 1) * 25}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-white/70">
                    {passwordStrength.score <= 1 ? 'Weak' : passwordStrength.score === 2 ? 'Fair' : 'Strong'}
                  </span>
                </div>
              </div>
            )}
            {validationErrors.password && (
              <p className="mt-1 text-xs text-red-400">{validationErrors.password}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400/70" />
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                aria-label="Confirm New Password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={loading}
                className={`w-full pl-11 pr-4 py-3 border bg-white/5 rounded-lg focus:outline-none focus:border-blue-400 disabled:bg-black/20 disabled:cursor-not-allowed transition ${
                  validationErrors.confirmPassword ? 'border-red-500/50' : 'border-white/10'
                } text-white placeholder-white/30`}
                autoComplete="new-password"
                maxLength={128}
              />
            </div>
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-400">{validationErrors.confirmPassword}</p>
            )}
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 rounded-lg font-bold text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0a174a] transition-all flex items-center justify-center gap-2 mb-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating Password...
                </>
              ) : (
                'Update Password'
              )}
            </button>
            <button
              type="button"
              onClick={handleBackToSignIn}
              disabled={loading}
              className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[#0a174a] transition-all"
            >
              Back to Sign In
            </button>
          </div>
        </form>
        <div className="mt-8 text-center flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
          <p className="text-xs text-white/50">
            Your data is protected with industry-standard encryption
          </p>
        </div>
      </div>
    </div>
  );
}