import React, { lazy, Suspense, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AppLayout from "./components/common/Layout";
import Login from "./components/auth/Login";
import ErrorBoundary from "./components/common/ErrorBoundary/ErrorBoundary";
import { CriticalErrorFallback } from "./components/common/ErrorFallback";

// Lazy load page components for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const EditParameters = lazy(() => import("./components/EditParameters"));
const RetirementPlanner = lazy(() => import("./components/RetirementPlanner"));
const LiquidityDashboard = lazy(() => import("./components/LiquidityDashboard"));

// Loading component for suspense fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <div className="text-blue-600 animate-spin rounded-full border-t-2 border-b-2 border-blue-600 h-12 w-12 mx-auto"></div>
      <p className="mt-3 text-gray-700">Loading...</p>
    </div>
  </div>
);

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  // State for application-level errors
  const [appError, setAppError] = useState(null);

  // Handle application-level error reset
  const handleAppErrorReset = () => {
    setAppError(null);
    // Optionally reload the application or perform other recovery actions
    // window.location.reload();
  };

  // Custom error handler for the top-level ErrorBoundary
  const handleAppError = (error, errorInfo) => {
    console.error("Critical application error:", error);
    console.error("Component stack:", errorInfo?.componentStack);
    
    // Set the app error state
    setAppError({ error, errorInfo });
    
    // You could also log to an error tracking service here
    // if (process.env.NODE_ENV === 'production') {
    //   logErrorToService(error, errorInfo);
    // }
  };

  return (
    <ErrorBoundary 
      showDetails={process.env.NODE_ENV !== "production"}
      componentName="RootApp"
      fallback={(error, errorInfo, resetFn) => (
        <CriticalErrorFallback 
          onRetry={resetFn} 
          error={error} 
          errorInfo={errorInfo} 
        />
      )}
      resetAction={handleAppErrorReset}
      maxRetries={3}
    >
      <AppLayout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ErrorBoundary 
                    componentName="Dashboard"
                    showDetails={process.env.NODE_ENV !== "production"}
                  >
                    <Dashboard />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/liquidity"
              element={
                <ProtectedRoute>
                  <ErrorBoundary 
                    componentName="LiquidityDashboard"
                    showDetails={process.env.NODE_ENV !== "production"}
                  >
                    <LiquidityDashboard />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/retirement"
              element={
                <ProtectedRoute>
                  <ErrorBoundary 
                    componentName="RetirementPlanner"
                    showDetails={process.env.NODE_ENV !== "production"}
                  >
                    <RetirementPlanner />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit"
              element={
                <ProtectedRoute>
                  <ErrorBoundary 
                    componentName="EditParameters"
                    showDetails={process.env.NODE_ENV !== "production"}
                  >
                    <EditParameters />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppLayout>
    </ErrorBoundary>
  );
}

export default App;