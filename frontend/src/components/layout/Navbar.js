import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

//navigation links
const navigationLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Find Internships', href: '/internships' },
  { label: 'My Applications', href: '/applications' },
  { label: 'My Alerts', href: '/alerts' },
  { label: 'Custom Projects', href: '/projects'},
  { label: 'Resources', href: '/resources' }
];

export default function Navbar({ navLinks = navigationLinks, profile, onLogout, isAuthenticated = false }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Always show profile dropdown if authenticated, using last known profile
  // Only show Sign In if not authenticated
  let rightContent;
  if (isAuthenticated && profile) {
    rightContent = (
      <div className="flex items-center space-x-3">
        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/5 transition-all duration-300 group"
        >
          <div className="relative">
            <img
              src={profile?.avatarUrl || '/defaultprofilepic.jpg'}
              alt="Profile"
              className="w-8 h-8 rounded-full border-2 border-white/20 object-cover"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800"></div>
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium text-white/90">
              {profile?.username || profile?.name || 'User'}
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-white/70 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Enhanced Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 top-12 w-64 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
            {/* Profile Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={profile?.avatarUrl || '/defaultprofilepic.jpg'}
                    alt="Profile"
                    className="w-12 h-12 rounded-full border-2 border-white/20 object-cover"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-800"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">
                    {profile?.username || profile?.name || 'User'}
                  </div>
                  <div className="text-sm text-white/60 truncate">
                    {profile?.email || 'user@example.com'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Menu Items */}
            <div className="py-2">
              <Link 
                to="/profile" 
                className="flex items-center px-4 py-3 text-white/90 hover:text-white hover:bg-white/5 transition-all duration-200 group"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mr-3 group-hover:bg-blue-500/30 transition-colors">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
                <span className="font-medium">Profile</span>
              </Link>
              
              <div className="border-t border-white/10 my-2"></div>
              
              <button 
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout && onLogout();
                }}
                className="flex items-center w-full px-4 py-3 text-white/90 hover:text-white hover:bg-red-500/10 transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center mr-3 group-hover:bg-red-500/30 transition-colors">
                  <LogOut className="w-4 h-4 text-red-400" />
                </div>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  } else {
    rightContent = (
      <Link 
        to="/signin" 
        className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
      >
        Sign In
      </Link>
    );
  }

  return (
    <nav className="w-full relative z-50">
      {/* Glassmorphic navbar background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-indigo-900/20 to-purple-900/20 backdrop-blur-xl border-b border-white/10"></div>
      
      <div className="relative flex items-center justify-between px-6 lg:px-10 py-4">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-blue-500/25">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
              Nexttern
            </span>
          </Link>
        </div>

        {/* Navigation Links - Only show when authenticated */}
        {isAuthenticated && profile && (
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks?.map(link => (
              <div key={link.label} className="relative group">
                <Link
                  to={link.href}
                  className="text-white/90 hover:text-white font-medium transition-all duration-300 relative py-2 px-3 rounded-lg hover:bg-white/5"
                >
                  {link.label}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Right Side - Profile/Auth Section */}
        <div className="flex items-center space-x-4">
          <div className="relative" ref={dropdownRef}>
            {rightContent}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Export the navigation links for use in other components if needed
export { navigationLinks };