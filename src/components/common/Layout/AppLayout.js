import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useFinancial } from "../../../context/FinancialContext";
import SyncStatusIndicator from "../../common/SyncStatusIndicator";

/**
 * AppLayout component for consistent layout across pages
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content
 * @returns {JSX.Element}
 */
const AppLayout = ({ children }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { syncStatus } = useFinancial();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
  };

  // If on login page, show only login component
  if (location.pathname.endsWith("/login")) {
    return children;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Responsive Navigation */}
      <nav className="bg-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4">
          {/* Desktop Navigation */}
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold">
              Financial Dashboard
            </h1>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-4">
              <Link
                to="/"
                className={`px-4 py-2 rounded-md transition-colors ${
                  location.pathname === "/" || location.pathname === ""
                    ? "bg-blue-900"
                    : "hover:bg-blue-800"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/liquidity"
                className={`px-4 py-2 rounded-md transition-colors ${
                  location.pathname.endsWith("/liquidity")
                    ? "bg-blue-900"
                    : "hover:bg-blue-800"
                }`}
              >
                Liquidity
              </Link>
              <Link
                to="/retirement"
                className={`px-4 py-2 rounded-md transition-colors ${
                  location.pathname.endsWith("/retirement")
                    ? "bg-blue-900"
                    : "hover:bg-blue-800"
                }`}
              >
                Retirement
              </Link>
              <Link
                to="/cpf"
                className={`px-4 py-2 rounded-md transition-colors ${
                  location.pathname.endsWith("/cpf")
                    ? "bg-blue-900"
                    : "hover:bg-blue-800"
                }`}
              >
                CPF Dashboard
              </Link>
              <Link
                to="/edit"
                className={`px-4 py-2 rounded-md transition-colors ${
                  location.pathname.endsWith("/edit")
                    ? "bg-blue-900"
                    : "hover:bg-blue-800"
                }`}
              >
                Edit Parameters
              </Link>
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md transition-colors hover:bg-blue-800"
                >
                  Logout
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="flex items-center p-2 rounded-md hover:bg-blue-800"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={
                      mobileMenuOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-2 pb-4">
              <Link
                to="/"
                className={`block px-4 py-2 my-1 rounded-md ${
                  location.pathname === "/" ||
                  location.pathname === ""
                    ? "bg-blue-900"
                    : "hover:bg-blue-800"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>

              <Link
                to="/liquidity"
                className={`block px-4 py-2 my-1 rounded-md ${
                  location.pathname.endsWith("/liquidity")
                    ? "bg-blue-900"
                    : "hover:bg-blue-800"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Liquidity
              </Link>

              <Link
                to="/retirement"
                className={`block px-4 py-2 my-1 rounded-md ${
                  location.pathname.endsWith("/retirement")
                    ? "bg-blue-900"
                    : "hover:bg-blue-800"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Retirement
              </Link>
              
              <Link
                to="/cpf"
                className={`block px-4 py-2 my-1 rounded-md ${
                  location.pathname.endsWith("/cpf")
                    ? "bg-blue-900"
                    : "hover:bg-blue-800"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                CPF Dashboard
              </Link>
              
              <Link
                to="/edit"
                className={`block px-4 py-2 my-1 rounded-md ${
                  location.pathname.endsWith("/edit")
                    ? "bg-blue-900"
                    : "hover:bg-blue-800"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Edit Parameters
              </Link>
              {isAuthenticated && (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 my-1 rounded-md hover:bg-blue-800"
                >
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Sync Status Banner */}
      {isAuthenticated && (
        <div className="bg-gray-100 py-2 px-4 flex justify-center items-center border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-sm mr-2">Data Status:</span>
            <SyncStatusIndicator />
          </div>
        </div>
      )}

      {/* Auth Status Banner - Show when not logged in */}
      {!isAuthenticated && (
        <div className="bg-yellow-100 py-2 px-4 flex justify-center items-center border-b border-yellow-200">
          <div className="flex items-center text-yellow-800">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
            <span className="font-medium">
              You are not logged in.{" "}
            </span>
            <Link to="/login" className="ml-2 underline">
              Sign in to sync your data across devices
            </Link>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="bg-gray-200 p-4 text-center text-gray-600 mt-8">
        <p>Personal Financial Dashboard © {new Date().getFullYear()}</p>
        {isAuthenticated && (
          <div className="text-xs text-gray-500 mt-1">
            <p>Logged in as: {currentUser?.email}</p>
            {syncStatus && syncStatus.status === "synced" && (
              <p className="text-green-600">
                Your data is synced across all your devices
              </p>
            )}
            {syncStatus && syncStatus.status === "local" && (
              <p className="text-yellow-600">
                Your data is only stored on this device
              </p>
            )}
          </div>
        )}
      </footer>
    </div>
  );
};

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppLayout;