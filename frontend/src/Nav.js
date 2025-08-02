import React, { useState } from 'react';
import SignIn from './SignIn';
import SignUp from './SignUp';

export default function Nav() {
  const [screen, setScreen] = useState('signin');

  return (
    <>
      {screen === 'signin' && (
        <SignIn onNavigateToSignUp={() => setScreen('signup')} />
      )}
      {screen === 'signup' && (
        <SignUp onNavigateToSignIn={() => setScreen('signin')} />
      )}
    </>
  );
}