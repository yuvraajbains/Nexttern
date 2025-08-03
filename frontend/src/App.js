import React, { Suspense, lazy, useEffect } from 'react';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { usePreventTabRefresh } from './hooks/usePreventTabRefresh';
import { ProfileProvider } from './context/ProfileContext';
import { supabase } from './api/supabaseClient';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Internships = lazy(() => import('./pages/Internships'));
const Applications = lazy(() => import('./pages/Applications'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Resources = lazy(() => import('./pages/Resources'));
const Profile = lazy(() => import('./pages/profile'));
// const Settings = lazy(() => import('./pages/Settings'));
const SignIn = lazy(() => import('./pages/Auth/SignIn'));
const SignUp = lazy(() => import('./pages/Auth/SignUp'));
const UpdatePassword = lazy(() => import('./pages/Auth/UpdatePassword'));
const LandingPage = lazy(() => import('./pages/Landing'));
const Projects = lazy(() => import('./pages/Projects'));
const PrivacyPolicy = lazy(() => import('./pages/Legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/Legal/TermsOfService'));
const FAQ = lazy(() => import('./pages/Legal/FAQ'));


// Move ProtectedRoute outside AppRoutes to avoid re-creation on every render
function ProtectedRoute({ component: Component, session, loading, isPasswordRecovery }) {
  if (!loading && session && !isPasswordRecovery) {
    return <Component session={session} />;
  } else if (!loading && !session) {
    return <Navigate to="/signin" replace />;
  } else {
    return null;
  }
}

function AppRoutes() {
  const { session, loading } = useAuthContext();
  const [isPasswordRecovery, setIsPasswordRecovery] = React.useState(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');
    return type === 'recovery' && accessToken;
  });
  const [recoverySessionSet, setRecoverySessionSet] = React.useState(false);
  const location = useLocation();
  
  const navigate = useNavigate();

  React.useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    if (type === 'recovery' && accessToken && refreshToken && !recoverySessionSet) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(() => setRecoverySessionSet(true));
    } else if (type === 'recovery' && accessToken && !refreshToken && !recoverySessionSet) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: '' })
        .then(() => setRecoverySessionSet(true));
    } else {
      setRecoverySessionSet(true);
    }
  }, [recoverySessionSet]);

  usePreventTabRefresh();

  React.useEffect(() => {
    const checkPasswordRecovery = () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      const accessToken = hashParams.get('access_token');
      if (type === 'recovery' && accessToken) {
        setIsPasswordRecovery(true);
        window.history.replaceState(null, '', window.location.pathname);
        return true;
      }
      return false;
    };
    checkPasswordRecovery();
    const handleHashChange = () => checkPasswordRecovery();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [session]);

  const handlePasswordUpdated = () => {
    setIsPasswordRecovery(false);
  };

  if (loading || (isPasswordRecovery && !recoverySessionSet)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#050c2e] to-[#1a2151]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-32 bg-gradient-to-r from-blue-400 to-green-400 rounded mb-3"></div>
          <div className="h-2 w-24 bg-white/30 rounded"></div>
        </div>
      </div>
    );
  }

  if (isPasswordRecovery && location.pathname !== '/update-password') {
    return <Navigate to="/update-password" replace />;
  }
  if (isPasswordRecovery && location.pathname === '/update-password') {
    return <UpdatePassword onPasswordUpdated={() => setIsPasswordRecovery(false)} />;
  }

  return (
    <div className="global-main min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#050c2e] to-[#1a2151]">
            <div className="animate-pulse flex flex-col items-center global-section">
              <div className="h-4 w-32 bg-gradient-to-r from-blue-400 to-green-400 rounded mb-3"></div>
              <div className="h-2 w-24 bg-white/30 rounded"></div>
            </div>
          </div>
        }>
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} session={session} loading={loading} isPasswordRecovery={isPasswordRecovery} />} />
            <Route path="/internships" element={<ProtectedRoute component={Internships} session={session} loading={loading} isPasswordRecovery={isPasswordRecovery} />} />
            <Route path="/applications" element={<ProtectedRoute component={Applications} session={session} loading={loading} isPasswordRecovery={isPasswordRecovery} />} />
            <Route path="/alerts" element={<ProtectedRoute component={Alerts} session={session} loading={loading} isPasswordRecovery={isPasswordRecovery} />} />
            <Route path="/resources" element={<ProtectedRoute component={Resources} session={session} loading={loading} isPasswordRecovery={isPasswordRecovery} />} />
            <Route path="/profile" element={<ProtectedRoute component={Profile} session={session} loading={loading} isPasswordRecovery={isPasswordRecovery} />} />
            <Route path="/projects" element={<ProtectedRoute component={Projects} session={session} loading={loading} isPasswordRecovery={isPasswordRecovery} />} />
            {/* <Route path="/settings" element={<ProtectedRoute component={Settings} session={session} loading={loading} isPasswordRecovery={isPasswordRecovery} />} /> */}

            {/* Legal Pages */}
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/faq" element={<FAQ />} />

            <Route path="/signin" element={
              session && !isPasswordRecovery
                ? <Navigate to="/dashboard" replace />
                : <AuthWrapper><div className="global-btn-group"><SignIn onNavigateToSignUp={() => navigate('/signup')} /></div></AuthWrapper>
            } />
            <Route path="/signup" element={
              session && !isPasswordRecovery
                ? <Navigate to="/dashboard" replace />
                : <AuthWrapper><div className="global-btn-group"><SignUp onNavigateToSignIn={() => navigate('/signin')} /></div></AuthWrapper>
            } />
            <Route path="/update-password" element={
              <UpdatePassword onPasswordUpdated={handlePasswordUpdated} />
            } />
            <Route path="/" element={
              session && !isPasswordRecovery
                ? <Navigate to="/dashboard" replace />
                : isPasswordRecovery
                  ? <Navigate to="/update-password" replace />
                  : <LandingPage />
            } />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

// AuthWrapper is used in the routes, so we need to define it or import it if not already
function AuthWrapper({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#050c2e] to-[#1a2151]">
      {children}
    </div>
  );
}


function App() {
  useEffect(() => {
    window.supabase = supabase;
  }, []);
  return (
    <AuthProvider>
      <ProfileProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App;