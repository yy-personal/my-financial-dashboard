// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { auth, logoutUser } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";

// Create the auth context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [currentUser, setCurrentUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		console.log("Setting up auth state listener");
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			console.log(
				"Auth state changed:",
				user ? "User logged in" : "No user"
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

	// Logout function
	const logout = async () => {
		try {
			console.log("Attempting to log out user");
			const { success, error } = await logoutUser();
			if (!success) {
				console.error("Logout error:", error);
			} else {
				console.log("User logged out successfully");
			}
			return { success, error };
		} catch (err) {
			console.error("Exception during logout:", err);
			return { success: false, error: err.message };
		}
	};

	const value = {
		currentUser,
		isAuthenticated: !!currentUser,
		loading,
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
