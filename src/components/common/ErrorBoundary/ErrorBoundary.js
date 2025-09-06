import React, { Component } from "react";
import PropTypes from "prop-types";
import { logError } from "../../../utils/errors/ErrorUtils";

/**
 * Enhanced ErrorBoundary Component
 * Catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 * Now with improved error reporting, recovery options, and support for
 * different fallback components based on error types.
 * 
 * @extends {Component}
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Increment error count
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));
    
    // Log the error to console and potentially to an error reporting service
    logError(error, this.props.componentName || 'ErrorBoundary', {
      componentStack: errorInfo.componentStack,
      props: this.filterSensitiveProps(this.props),
      errorCount: this.state.errorCount + 1
    });
  }

  /**
   * Filter out sensitive props that shouldn't be logged
   * @param {Object} props - Component props
   * @returns {Object} Filtered props
   */
  filterSensitiveProps(props) {
    // Create a shallow copy to work with
    const filteredProps = { ...props };
    
    // Remove children as they can be complex and large
    delete filteredProps.children;
    
    // Remove any props that might contain sensitive data
    const sensitiveKeys = ['password', 'token', 'secret', 'auth', 'key', 'private'];
    Object.keys(filteredProps).forEach(key => {
      if (sensitiveKeys.some(sensitiveKey => key.toLowerCase().includes(sensitiveKey))) {
        filteredProps[key] = '[REDACTED]';
      }
    });
    
    return filteredProps;
  }

  /**
   * Handle error reset
   */
  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Call the custom reset action if provided
    if (this.props.resetAction) {
      this.props.resetAction();
    }
  }

  /**
   * Determine if max retries has been exceeded
   */
  hasExceededMaxRetries() {
    return this.props.maxRetries !== undefined && 
           this.state.errorCount >= this.props.maxRetries;
  }

  /**
   * Get error context for fallback components
   */
  getErrorContext() {
    return {
      error: this.state.error,
      errorInfo: this.state.errorInfo,
      errorCount: this.state.errorCount,
      hasExceededMaxRetries: this.hasExceededMaxRetries(),
      reset: this.handleReset
    };
  }

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { 
      fallback, 
      fallbackSeverity,
      children, 
      showDetails = false,
      isFinancialComponent = false,
      // maxRetries
    } = this.props;

    if (hasError) {
      // Check for max retries exceeded
      const hasExceededRetries = this.hasExceededMaxRetries();
      
      // Determine severity level
      const severity = hasExceededRetries 
        ? 'critical' 
        : (fallbackSeverity || 'error');
      
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, errorInfo, this.handleReset, severity);
      }

      // Financial Error Styling
      const bgColor = isFinancialComponent ? 'bg-orange-50' : 'bg-red-50';
      const borderColor = isFinancialComponent ? 'border-orange-200' : 'border-red-200';
      const textColor = isFinancialComponent ? 'text-orange-800' : 'text-red-800';
      const textDescription = isFinancialComponent ? 'text-orange-700' : 'text-red-700';
      const buttonColor = isFinancialComponent 
        ? 'bg-orange-600 hover:bg-orange-700' 
        : 'bg-red-600 hover:bg-red-700';
      
      // Provide helpful message for financial components
      const errorMessage = isFinancialComponent
        ? "There was an error with the financial calculations. This could be due to invalid data inputs or missing information."
        : "There was an error with this component. Please try refreshing the page or contact support if the problem persists.";
        
      // Default fallback UI
      return (
        <div className={`p-6 ${bgColor} border ${borderColor} rounded-lg shadow-sm`}>
          <div className="flex items-center mb-4">
            <svg 
              className={`w-6 h-6 ${isFinancialComponent ? 'text-orange-500' : 'text-red-500'} mr-3`}
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
            <h2 className={`text-lg font-medium ${textColor}`}>
              {isFinancialComponent 
                ? "Financial Calculation Error" 
                : "Something went wrong"}
            </h2>
          </div>

          <p className={`text-sm ${textDescription} mb-4`}>
            {errorMessage}
          </p>

          {hasExceededRetries && (
            <div className="mt-4 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-700">
                Multiple attempts to load this component have failed. You may need to refresh the entire page or check your data inputs.
              </p>
            </div>
          )}

          {showDetails && (
            <div className="mt-4">
              <details className="bg-white p-3 rounded-md border border-gray-200">
                <summary className="font-medium cursor-pointer">
                  Technical Details
                </summary>
                <div className="mt-2">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {error && error.toString()}
                  </p>
                  {errorInfo && (
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-xs">
                      <code>
                        {errorInfo.componentStack}
                      </code>
                    </pre>
                  )}
                </div>
              </details>
            </div>
          )}

          <button 
            onClick={this.handleReset}
            className={`mt-4 ${buttonColor} text-white py-2 px-4 rounded transition-colors duration-150`}
          >
            Try Again
          </button>
        </div>
      );
    }

    // Render children if there's no error
    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func,
  fallbackSeverity: PropTypes.oneOf(['error', 'warning', 'critical', 'info']),
  resetAction: PropTypes.func,
  showDetails: PropTypes.bool,
  componentName: PropTypes.string,
  isFinancialComponent: PropTypes.bool,
  maxRetries: PropTypes.number
};

export default ErrorBoundary;