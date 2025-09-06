// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { logoutUser, onAuthStateChange } from "../firebase/firebase";

// Create the auth context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [currentUser, setCurrentUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [authError, setAuthError] = useState(null);

	useEffect(() => {
		console.log("Setting up auth state listener");
		// Use the exported onAuthStateChange function
		const unsubscribe = onAuthStateChange((user) => {
			console.log(
				"Auth state changed:",
				user ? `User logged in: ${user.uid}` : "No user"
			);
			setCurrentUser(user);
			setLoading(false);
		});

		// Cleanup subscription on unmount
		return () => {
			console.log("Cleaning up auth state listener");
			unsubscribe();
		};
	}, []);

	// Logout function with improved error handling
	const logout = async () => {
		try {
			setAuthError(null);
			console.log("Attempting to log out user");
			const { success, error } = await logoutUser();
			if (!success) {
				console.error("Logout error:", error);
				setAuthError(error);
				return { success, error };
			} else {
				console.log("User logged out successfully");
				return { success: true, error: null };
			}
		} catch (err) {
			console.error("Exception during logout:", err);
			setAuthError(err.message);
			return { success: false, error: err.message };
		}
	};

	const value = {
		currentUser,
		isAuthenticated: !!currentUser,
		loading,
		authError,
		logout,
	};

	return (
		<AuthContext.Provider value={value}>
			{!loading ? (
				children
			) : (
				<div className="min-h-screen flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
						<p className="mt-3">Loading authentication...</p>
					</div>
				</div>
			)}
		</AuthContext.Provider>
	);
};

// Custom hook to use the auth context
export const useAuth = () => {
	return useContext(AuthContext);
};
