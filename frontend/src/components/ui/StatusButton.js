import React from 'react';

/**
 * Status button component for the application tracker
 * @param {Object} props - Component props
 * @param {string} props.status - Current status
 * @param {string} props.targetStatus - Target status for this button
 * @param {Object} props.config - Status configuration object
 * @param {Function} props.onClick - Click handler
 * @returns {JSX.Element} Status button
 */
const StatusButton = ({ status, targetStatus, config, onClick }) => {
  const isActive = status === targetStatus;
  
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded text-sm flex items-center ${
        isActive 
          ? `${config.color} text-white` 
          : 'bg-[#1a1b1c] hover:bg-[#2a2c2d] text-gray-300'
      }`}
    >
      <span className="mr-1">{config.icon}</span>
      {config.title}
    </button>
  );
};

export default StatusButton;
