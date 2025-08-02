import React from 'react';
import { formatDate } from '../../utils/formatting';
import StatusButton from './StatusButton';

/**
 * Application card component
 * @param {Object} props - Component props
 * @param {Object} props.application - Application data
 * @param {Object} props.statusConfig - Status configuration object
 * @param {Function} props.onStatusChange - Status change handler
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 * @returns {JSX.Element} Application card
 */
const ApplicationCard = ({ 
  application, 
  statusConfig, 
  onStatusChange, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="hover:bg-[#2a2c2d]/30 transition-colors">
      <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center">
        {/* Application Info (Left Side) */}
        <div className="flex-1 mb-4 md:mb-0 pr-4">
          <h3 className="font-bold text-white text-lg mb-1" title={application.title}>
            {application.title}
          </h3>
          <div className="text-gray-300 mb-1">{application.company}</div>
          
          {application.location && (
            <div className="text-sm text-gray-400 flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {application.location}
            </div>
          )}
          
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-400">
              Added: {formatDate(application.created_at)}
            </div>
            
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${statusConfig[application.status].color}`}>
                {application.status}
              </span>
            </div>
            
            <a 
              href={application.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
            >
              View Posting
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
        
        {/* Status Buttons (Right Side) */}
        <div className="flex flex-wrap gap-2 justify-end">
          <button 
            onClick={() => onEdit(application)}
            className="px-3 py-1.5 bg-[#414345] text-white rounded hover:bg-[#4a4c4e] transition-colors text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          
          {Object.entries(statusConfig).map(([status, config]) => (
            <StatusButton
              key={status}
              status={application.status}
              targetStatus={status}
              config={config}
              onClick={() => onStatusChange(application.id, status)}
            />
          ))}
          
          <button 
            onClick={() => onDelete(application)}
            className="px-3 py-1.5 bg-red-900/40 text-red-400 rounded hover:bg-red-900/60 hover:text-red-300 transition-colors text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Notes Preview (if available) */}
      {application.notes && (
        <div className="px-5 pb-4 -mt-1">
          <div className="border-t border-[#414345]/30 pt-3 text-sm text-gray-400">
            <div className="font-medium text-xs text-gray-500 mb-1">Notes:</div>
            <div className="italic">
              {application.notes}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationCard;
