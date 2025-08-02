import React, { useRef } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import '../../styles/layout.css';
import { useAuthContext } from '../../context/AuthContext';
import { useProfileContext } from '../../context/ProfileContext';

/**
 * PageLayout component for consistent styling across pages
 * This ensures all pages have the same background gradient and styling
 */
export default function PageLayout({ children, navLinks, onLogout, customProfile }) {
  const { user } = useAuthContext();
  const { profile, loading } = useProfileContext();
  // Keep last known user and profile in refs
  const lastUserRef = useRef(user);
  const lastProfileRef = useRef(profile);
  if (user) lastUserRef.current = user;
  if (profile) lastProfileRef.current = profile;

  // Use custom profile if provided, otherwise use last known user/profile
  const u = lastUserRef.current;
  const p = lastProfileRef.current;
  const profileData = customProfile || (u && p ? {
    name: p.username || u.email.split('@')[0],
    email: u.email,
    avatarUrl: p.avatar_url || '/defaultprofilepic.jpg',
    username: p.username
  } : null);

  // Compute isAuthenticated: true if last known user exists (even if loading)
  const isAuthenticated = !!u;

  if (loading || !u || !p) {
    // Show a full-page loading spinner while restoring session/profile
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#050c2e] to-[#1a2151]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-32 bg-gradient-to-r from-blue-400 to-green-400 rounded mb-3"></div>
          <div className="h-2 w-24 bg-white/30 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-background flex flex-col">
      <Navbar
        navLinks={navLinks}
        profile={profileData}
        isAuthenticated={isAuthenticated}
        loading={loading}
        onLogout={onLogout}
      />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
