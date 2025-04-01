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
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setCurrentUser(user);
			setLoading(false);
		});

		// Cleanup subscription on unmount
		return () => unsubscribe();
	}, []);

	// Logout function
	const logout = async () => {
		const { success, error } = await logoutUser();
		if (!success) {
			console.error("Logout error:", error);
		}
		return { success, error };
	};

	const value = {
		currentUser,
		isAuthenticated: !!currentUser,
		loading,
		logout,
	};

	return (
		<AuthContext.Provider value={value}>
			{!loading && children}
		</AuthContext.Provider>
	);
};

// Custom hook to use the auth context
export const useAuth = () => {
	return useContext(AuthContext);
};
