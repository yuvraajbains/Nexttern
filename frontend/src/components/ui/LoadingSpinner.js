import React from 'react';

/**
 * Loading spinner component
 * @returns {JSX.Element} Loading spinner
 */
const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#232526] via-[#414345] to-[#e96443]">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
