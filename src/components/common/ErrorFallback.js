import React from 'react';
import PropTypes from 'prop-types';

/**
 * A collection of specialized error fallback components for different dashboard sections
 */

/**
 * Generic error fallback component that can be customized for different sections
 * 
 * @param {Object} props - Component props
 * @returns {JSX.Element} Fallback UI
 */
export const ErrorFallback = ({ 
  title, 
  message, 
  icon, 
  onRetry, 
  showRetry = true,
  severity = 'error',
  children 
}) => {
  // Configure styles based on severity
  const styles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      titleColor: 'text-red-800',
      textColor: 'text-red-700',
      iconColor: 'text-red-500',
      buttonBg: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      titleColor: 'text-amber-800',
      textColor: 'text-amber-700',
      iconColor: 'text-amber-500',
      buttonBg: 'bg-amber-600 hover:bg-amber-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      titleColor: 'text-blue-800',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-500',
      buttonBg: 'bg-blue-600 hover:bg-blue-700'
    },
    critical: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      titleColor: 'text-purple-800',
      textColor: 'text-purple-700',
      iconColor: 'text-purple-500',
      buttonBg: 'bg-purple-600 hover:bg-purple-700'
    }
  };

  const style = styles[severity] || styles.error;

  // Default icon if none provided
  const defaultIcon = (
    <svg 
      className={`w-6 h-6 ${style.iconColor} mr-3 flex-shrink-0`}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2" 
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
      />
    </svg>
  );

  return (
    <div className={`p-4 ${style.bg} border ${style.border} rounded-lg shadow-sm`}>
      <div className="flex items-center mb-3">
        {icon || defaultIcon}
        <h3 className={`text-base font-medium ${style.titleColor}`}>
          {title}
        </h3>
      </div>

      <p className={`text-sm ${style.textColor} mb-4`}>
        {message}
      </p>

      {children}

      {showRetry && onRetry && (
        <button 
          onClick={onRetry}
          className={`mt-3 ${style.buttonBg} text-white py-1.5 px-3 text-sm rounded transition-colors duration-150`}
        >
          Try Again
        </button>
      )}
    </div>
  );
};

ErrorFallback.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  icon: PropTypes.node,
  onRetry: PropTypes.func,
  showRetry: PropTypes.bool,
  severity: PropTypes.oneOf(['error', 'warning', 'info', 'critical']),
  children: PropTypes.node
};

/**
 * Specialized fallback for financial calculations
 */
export const FinancialCalculationErrorFallback = ({ onRetry, error }) => {
  return (
    <ErrorFallback
      title="Financial Calculation Error"
      message="There was a problem calculating your financial metrics. This might be due to invalid data or missing information."
      onRetry={onRetry}
      severity="warning"
      icon={
        <svg 
          className="w-6 h-6 text-amber-500 mr-3 flex-shrink-0"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
          />
        </svg>
      }
    >
      <div className="text-xs text-amber-600 mt-1 mb-2">
        {error && error.message ? (
          <span>Error details: {error.message}</span>
        ) : (
          <span>Check your input values and try again. If the problem persists, you may need to reset your data or contact support.</span>
        )}
      </div>
    </ErrorFallback>
  );
};

/**
 * Specialized fallback for Chart components
 */
export const ChartErrorFallback = ({ onRetry, chartType }) => {
  return (
    <ErrorFallback
      title={`Chart Error: ${chartType || 'Visualization'}`}
      message="We couldn't display this chart. There might be an issue with the data format or values."
      onRetry={onRetry}
      severity="info"
      icon={
        <svg 
          className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
          />
        </svg>
      }
    />
  );
};

/**
 * Specialized fallback for Projection components
 */
export const ProjectionErrorFallback = ({ onRetry }) => {
  return (
    <ErrorFallback
      title="Projection Calculation Error"
      message="We encountered a problem while calculating your financial projections."
      onRetry={onRetry}
      severity="warning"
      icon={
        <svg 
          className="w-6 h-6 text-amber-500 mr-3 flex-shrink-0"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      }
    >
      <div className="text-xs text-amber-600 mt-1 mb-2">
        This could be due to invalid projection parameters or unusual values in your financial data.
        Try adjusting your financial inputs or projection settings.
      </div>
    </ErrorFallback>
  );
};

/**
 * Critical application error fallback
 */
export const CriticalErrorFallback = ({ onRetry, error, errorInfo }) => {
  return (
    <ErrorFallback
      title="Critical Application Error"
      message="A serious error has occurred that prevents the application from functioning correctly."
      onRetry={onRetry}
      severity="critical"
      icon={
        <svg
          className="w-6 h-6 text-purple-500 mr-3 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      }
    >
      <div className="bg-white p-3 rounded-md border border-purple-200 text-xs text-gray-700 mt-2">
        <p className="font-medium mb-1">Please try the following:</p>
        <ol className="list-decimal list-inside">
          <li className="mb-1">Refresh the page</li>
          <li className="mb-1">Clear your browser cache</li>
          <li className="mb-1">Try again later</li>
          <li>If the problem persists, contact support with error code: {error?.code || 'UNKNOWN'}</li>
        </ol>
      </div>
    </ErrorFallback>
  );
};

export default {
  ErrorFallback,
  FinancialCalculationErrorFallback,
  ChartErrorFallback,
  ProjectionErrorFallback,
  CriticalErrorFallback
};