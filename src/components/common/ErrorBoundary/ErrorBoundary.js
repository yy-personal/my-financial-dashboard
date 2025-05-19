import React, { Component } from "react";
import PropTypes from "prop-types";

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 * 
 * @extends {Component}
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
    
    // You could send this error to a logging service like Sentry
    // if (process.env.NODE_ENV === 'production') {
    //   logErrorToService(error, errorInfo);
    // }
  }

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { fallback, children, showDetails = false } = this.props;

    if (hasError) {
      // You can render any custom fallback UI
      if (fallback) {
        return fallback(error, errorInfo);
      }

      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <svg 
              className="w-6 h-6 text-red-500 mr-3" 
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
            <h2 className="text-lg font-medium text-red-800">
              Something went wrong
            </h2>
          </div>

          <p className="text-sm text-red-700 mb-4">
            There was an error with this component. Please try refreshing the page or contact support if the problem persists.
          </p>

          {showDetails && (
            <div className="mt-4">
              <details className="bg-white p-3 rounded-md border border-red-200">
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

          {this.props.resetAction && (
            <button 
              onClick={this.props.resetAction}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors duration-150"
            >
              Try Again
            </button>
          )}
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
  resetAction: PropTypes.func,
  showDetails: PropTypes.bool
};

export default ErrorBoundary;