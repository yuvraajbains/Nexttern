import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { useAuthContext } from '../../context/AuthContext';
import { useProfileContext } from '../../context/ProfileContext';
import PageLayout from '../../components/layout/PageLayout';
import zxcvbn from 'zxcvbn';

export default function Profile() {
  const { user } = useAuth();
  const { deleteAccount } = useAuthContext();
  const { profile, loading: profileLoading, updateProfile: updateProfileContext, uploadAvatar: uploadAvatarContext, fetchProfile } = useProfileContext();
  
  const [updating, setUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    avatar_url: null
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [message, setMessage] = useState({ text: '', type: '' });
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000); // 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [message]);
  
  // Update password strength on new password change
  useEffect(() => {
    if (passwordData.newPassword) {
      const strength = zxcvbn(passwordData.newPassword).score;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [passwordData.newPassword]);
  
  // Update local profileData from context profile
  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        username: profile.username || '',
        avatar_url: profile.avatar_url
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      
      // Use the ProfileContext to update the profile
      const result = await updateProfileContext({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        username: profileData.username,
        avatar_url: profileData.avatar_url
      });
      
      if (result.success) {
        setMessage({ text: 'Profile updated successfully', type: 'success' });
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      // console.error('Error updating profile:', error);
      setMessage({ 
        text: 'Failed to update profile. Please try again.',
        type: 'error' 
      });
    } finally {
      setUpdating(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    
    // Password validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters', type: 'error' });
      return;
    }
    
    if (!passwordData.currentPassword) {
      setMessage({ text: 'Current password is required', type: 'error' });
      return;
    }
    
    try {
      setUpdating(true);
      
      // First verify the current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.currentPassword
      });
      
      if (signInError) {
        setMessage({ text: 'Current password is incorrect', type: 'error' });
        setUpdating(false);
        return;
      }
      
      // If current password is correct, update to the new password
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) throw error;
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setMessage({ text: 'Password updated successfully', type: 'success' });
    } catch (error) {
      // console.error('Error updating password:', error);
      setMessage({ text: 'Error updating password. Please try again.', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const uploadAvatar = async (e) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = e.target.files[0];
      const fileSize = file.size / 1024 / 1024; // Convert to MB
      
      // Check file size (limit to 5MB)
      if (fileSize > 5) {
        throw new Error('File size too large. Please select an image under 5MB.');
      }
      
      // Check file type
      if (!file.type.match('image.*')) {
        throw new Error('Please select an image file (jpg, png, etc).');
      }

      setUploadingAvatar(true);
      
      // Use the ProfileContext to upload the avatar
      const result = await uploadAvatarContext(file);
      
      if (result.success) {
        setMessage({ text: 'Avatar updated successfully', type: 'success' });
      } else {
        throw new Error(result.error || 'Failed to upload avatar');
      }
    } catch (error) {
      // console.error('Error uploading avatar:', error);
      setMessage({ 
        text: error.message || 'Failed to upload avatar. Please try again.',
        type: 'error' 
      });
    } finally {
      setUploadingAvatar(false);
    }
  };



  const handleDeleteConfirm = async () => {
    if (deleteConfirmText.toLowerCase() === 'delete my account') {
      setDeleting(true);
      try {
        await deleteAccount();
        setMessage({ text: 'Account deleted successfully. Redirecting...', type: 'success' });
        // Sign out and redirect to landing page
        setTimeout(async () => {
          if (window.supabase && window.supabase.auth) {
            await window.supabase.auth.signOut();
          }
          window.location.href = '/';
        }, 1500);
      } catch (error) {
        setMessage({ text: error.message || 'Failed to delete account. Please try again.', type: 'error' });
      } finally {
        setDeleting(false);
        setShowDeleteConfirm(false);
        setDeleteConfirmText('');
      }
    } else {
      setMessage({ 
        text: 'Please type "delete my account" exactly to confirm.',
        type: 'error' 
      });
    }
  };

  // Handle navigation links
  const navLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Find Internships', href: '/internships' },
    { label: 'My Applications', href: '/applications' },
    { label: 'My Alerts', href: '/alerts' },
    { label: 'Custom Projects', href: '/projects'},
    { label: 'Resources', href: '/resources' },
  ];
  
  // Handle logout
  const handleLogout = async (_event) => {
    try {
      console.log('Logout clicked');
      await supabase.auth.signOut();
    } catch (error) {
      // console.error('Error signing out:', error);
    } finally {
      // Always redirect, even if signOut fails
      window.location.href = '/';
    }
  };

  return (
    <PageLayout
      onLogout={handleLogout}
      navLinks={navLinks}
      customProfile={{
        name: profileData.username || user?.email?.split('@')[0] || 'User',
        email: user?.email || '',
        avatarUrl: profileData.avatar_url || '/defaultprofilepic.jpg',
        username: profileData.username
      }}
    >
      <div className="flex-1 flex flex-col items-center px-4 w-full">
        <section className="w-full max-w-4xl mx-auto mt-20 mb-24">
          <h1 className="text-4xl font-extrabold text-white mb-8 text-center drop-shadow-lg">
            My Profile
          </h1>
          
          {/* Alert Messages */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-600/50 text-white' : 'bg-red-600/50 text-white'
            } flex justify-between items-center`}>
              <span>{message.text}</span>
              {message.type === 'error' && (
                <button 
                  onClick={fetchProfile} 
                  className="ml-3 bg-white/20 px-3 py-1 rounded hover:bg-white/30 transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          )}
          
          {profileLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Picture Section */}
              <div className="lg:col-span-1">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl p-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white/30">
                      <img 
                        src={profileData.avatar_url || '/defaultprofilepic.jpg'} 
                        alt="Profile Avatar" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = '/defaultprofilepic.jpg'; }}
                      />
                    </div>
                    
                    <label className="cursor-pointer">
                      <span className="bg-blue-600 hover:bg-blue-700 transition text-white py-2 px-4 rounded-lg inline-block">
                        {uploadingAvatar ? 'Uploading...' : 'Change Picture'}
                      </span>
                      <input 
                        id="avatarUpload"
                        name="avatarUpload"
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={uploadAvatar}
                        disabled={uploadingAvatar} 
                        aria-label="Profile Picture Upload"
                      />
                    </label>
                    
                    <div className="text-white/70 text-sm text-center mt-2">
                      JPG, PNG or GIF. Max size 5MB.
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Profile Information Section */}
              <div className="lg:col-span-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Profile Information</h2>
                  
                  <form onSubmit={updateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="first_name" className="block text-white/80 text-sm font-medium mb-1">First Name</label>
                        <input 
                          id="first_name"
                          type="text" 
                          name="first_name"
                          autoComplete="given-name"
                          value={profileData.first_name} 
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="Your first name"
                        />
                      </div>
                      <div>
                        <label htmlFor="last_name" className="block text-white/80 text-sm font-medium mb-1">Last Name</label>
                        <input 
                          id="last_name"
                          type="text" 
                          name="last_name"
                          autoComplete="family-name"
                          value={profileData.last_name} 
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="Your last name"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="username" className="block text-white/80 text-sm font-medium mb-1">Username</label>
                      <input 
                        id="username"
                        type="text" 
                        name="username"
                        autoComplete="username"
                        value={profileData.username} 
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Choose a username"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-white/80 text-sm font-medium mb-1">Email Address</label>
                      <input 
                        id="email"
                        type="email" 
                        name="email"
                        autoComplete="email"
                        value={user?.email || ''} 
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-gray-400 focus:outline-none"
                        readOnly 
                      />
                      <p className="text-xs text-white/50 mt-1">Email cannot be changed</p>
                    </div>
                    
                    <button 
                      type="submit" 
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                      disabled={updating}
                    >
                      {updating ? 'Updating...' : 'Update Profile'}
                    </button>
                  </form>
                </div>
                
                {/* Password Change Section */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl p-6 mt-6">
                  <h2 className="text-xl font-bold text-white mb-4">Change Password</h2>
                  
                  <form onSubmit={changePassword} className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-white/80 text-sm font-medium mb-1">Current Password</label>
                      <input 
                        id="currentPassword"
                        type="password" 
                        name="currentPassword"
                        autoComplete="current-password"
                        value={passwordData.currentPassword} 
                        onChange={handlePasswordChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Enter current password"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="newPassword" className="block text-white/80 text-sm font-medium mb-1">New Password</label>
                      <input 
                        id="newPassword"
                        type="password" 
                        name="newPassword"
                        autoComplete="new-password"
                        value={passwordData.newPassword} 
                        onChange={handlePasswordChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Enter new password"
                      />
                      
                      {/* Password strength indicator */}
                      {passwordData.newPassword && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${
                                  passwordStrength === 0 ? 'bg-red-500' :
                                  passwordStrength === 1 ? 'bg-orange-500' :
                                  passwordStrength === 2 ? 'bg-yellow-500' :
                                  passwordStrength === 3 ? 'bg-green-500' : 'bg-green-400'
                                }`}
                                style={{ width: `${(passwordStrength + 1) * 20}%` }}
                              />
                            </div>
                            <span className="text-xs text-white/70">
                              {passwordStrength <= 1 ? 'Weak' : 
                               passwordStrength === 2 ? 'Fair' :
                               passwordStrength === 3 ? 'Good' : 'Strong'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-white/80 text-sm font-medium mb-1">Confirm New Password</label>
                      <input 
                        id="confirmPassword"
                        type="password" 
                        name="confirmPassword"
                        autoComplete="new-password"
                        value={passwordData.confirmPassword} 
                        onChange={handlePasswordChange}
                        className={`w-full bg-white/5 border ${
                          passwordData.newPassword && 
                          passwordData.confirmPassword && 
                          passwordData.newPassword !== passwordData.confirmPassword 
                            ? 'border-red-500' 
                            : 'border-white/10'
                        } rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                        placeholder="Confirm new password"
                      />
                      
                      {/* Passwords do not match message */}
                      {passwordData.newPassword && 
                       passwordData.confirmPassword && 
                       passwordData.newPassword !== passwordData.confirmPassword && (
                        <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
                      )}
                    </div>
                    
                    <button 
                      type="submit" 
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                      disabled={updating}
                    >
                      {updating ? 'Updating...' : 'Change Password'}
                    </button>
                  </form>
                </div>

                {/* Delete Account Section */}
                <div className="bg-red-900/20 backdrop-blur-sm rounded-xl border border-red-500/30 shadow-xl p-6 mt-6">
                  <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Danger Zone
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-4">
                      <h3 className="text-white font-semibold mb-2">Delete Account</h3>
                      <p className="text-white/70 text-sm mb-4">
                        Once you delete your account, there is no going back. This will permanently delete your profile, applications, saved resources, and all associated data.
                      </p>
                      
                      {!showDeleteConfirm ? (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 text-sm"
                          disabled={deleting}
                        >
                          Delete My Account
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-red-950/50 border border-red-500/30 rounded-lg p-4">
                            <p className="text-white/90 font-medium mb-3">
                              Are you absolutely sure? This action cannot be undone.
                            </p>
                            <p className="text-white/70 text-sm mb-3">
                              Type <span className="font-mono bg-red-900/50 px-2 py-1 rounded">delete my account</span> below to confirm:
                            </p>
                            <input
                              type="text"
                              value={deleteConfirmText}
                              onChange={(e) => setDeleteConfirmText(e.target.value)}
                              className="w-full bg-white/5 border border-red-500/30 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500/50 mb-4"
                              placeholder="Type 'delete my account' to confirm"
                              disabled={deleting}
                            />
                            <div className="flex gap-3">
                              <button
                                onClick={handleDeleteConfirm}
                                disabled={deleting || deleteConfirmText.toLowerCase() !== 'delete my account'}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 text-sm"
                              >
                                {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                              </button>
                              <button
                                onClick={() => {
                                  setShowDeleteConfirm(false);
                                  setDeleteConfirmText('');
                                }}
                                disabled={deleting}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  );
}