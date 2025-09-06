import React, { useState } from "react";
// import PropTypes from "prop-types";
import { useFinancial } from "../../../context/FinancialContext";
import { useAuth } from "../../../context/AuthContext";

/**
 * SyncStatusIndicator component displays the current sync status of the user's data
 * and provides a button to manually trigger synchronization
 * 
 * @returns {JSX.Element}
 */
const SyncStatusIndicator = () => {
  const { syncStatus, forceSyncWithFirebase } = useFinancial();
  const { isAuthenticated } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");

  /**
   * Handle manual synchronization
   */
  const handleSync = async () => {
    if (!isAuthenticated) {
      setMessage("You must be logged in to sync data");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setSyncing(true);
    try {
      const result = await forceSyncWithFirebase();
      if (result.success) {
        setMessage("Sync successful!");
      } else {
        setMessage(`Sync failed: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error during sync: ${error.message}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  /**
   * Get status icon and color based on the current sync status
   * 
   * @returns {Object} Contains icon, color, and text for the status
   */
  const getStatusDetails = () => {
    switch (syncStatus.status) {
      case "synced":
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          ),
          color: "text-green-500",
          text: "Synced",
        };
      case "saving":
        return {
          icon: (
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          ),
          color: "text-blue-500",
          text: "Syncing...",
        };
      case "local":
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path>
            </svg>
          ),
          color: "text-yellow-500",
          text: "Local Only",
        };
      case "error":
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          ),
          color: "text-red-500",
          text: "Sync Error",
        };
      case "loading":
        return {
          icon: (
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ),
          color: "text-blue-500",
          text: "Loading...",
        };
      default:
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          ),
          color: "text-gray-500",
          text: "Unknown",
        };
    }
  };

  const statusDetails = getStatusDetails();
  const formattedTime = syncStatus.lastSync 
    ? new Date(syncStatus.lastSync).toLocaleTimeString() 
    : "";

  return (
    <div className="flex flex-col items-center">
      <div className={`flex items-center ${statusDetails.color}`}>
        {statusDetails.icon}
        <span className="ml-1 text-sm">{statusDetails.text}</span>
        {syncStatus.lastSync && (
          <span className="ml-2 text-xs text-gray-500">
            {formattedTime}
          </span>
        )}
      </div>
      
      {message && (
        <div className={`text-xs mt-1 ${
          message.includes("fail") || message.includes("Error") 
            ? "text-red-500" 
            : "text-green-500"
        }`}>
          {message}
        </div>
      )}
      
      {isAuthenticated && (
        <button
          onClick={handleSync}
          disabled={syncing || syncStatus.status === "saving" || syncStatus.status === "loading"}
          className={`mt-2 text-xs px-2 py-1 rounded ${
            syncing || syncStatus.status === "saving" || syncStatus.status === "loading"
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {syncing ? "Syncing..." : "Sync Now"}
        </button>
      )}
    </div>
  );
};

export default SyncStatusIndicator;
