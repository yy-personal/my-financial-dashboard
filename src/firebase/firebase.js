// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
	getAuth,
	signInWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
	setPersistence,
	browserLocalPersistence,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// Replace this with your own Firebase config
// You'll get this from the Firebase console when you create a project
const firebaseConfig = {
	apiKey: "AIzaSyCJBejSqneTV8yBP-9ku6P2sZBPmDTobCA",
	authDomain: "my-financial-dashboard-fbc33.firebaseapp.com",
	projectId: "my-financial-dashboard-fbc33",
	storageBucket: "my-financial-dashboard-fbc33.firebasestorage.app",
	messagingSenderId: "138354317822",
	appId: "1:138354317822:web:0c44b4ada398aa073e88af",
	measurementId: "G-P9F5FEFD4X",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// const analytics = getAnalytics(app);
const db = getFirestore(app);

// Set persistence to LOCAL to maintain the user session across page refreshes
// This helps ensure the user stays logged in
setPersistence(auth, browserLocalPersistence).catch((error) => {
	console.error("Error setting auth persistence:", error);
});

// Authentication functions with improved error handling
export const loginWithEmail = async (email, password) => {
	try {
		const userCredential = await signInWithEmailAndPassword(
			auth,
			email,
			password
		);
		console.log("Login successful:", userCredential.user.uid);
		return { user: userCredential.user, error: null };
	} catch (error) {
		console.error("Login error:", error.code, error.message);
		return { user: null, error: error.message };
	}
};

export const logoutUser = async () => {
	try {
		await signOut(auth);
		console.log("Logout successful");
		return { success: true, error: null };
	} catch (error) {
		console.error("Logout error:", error);
		return { success: false, error: error.message };
	}
};

// Data persistence functions with improved error handling and logging
export const saveFinancialData = async (userId, data) => {
	try {
		console.log(`Saving data for user ${userId}`);
		await setDoc(doc(db, "userData", userId), { financialData: data });
		console.log("Data saved successfully to Firebase");
		return { success: true, error: null };
	} catch (error) {
		console.error("Error saving data to Firebase:", error);
		return { success: false, error: error.message };
	}
};

export const loadFinancialData = async (userId) => {
	try {
		console.log(`Loading data for user ${userId}`);
		const docRef = doc(db, "userData", userId);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			console.log("Data loaded successfully from Firebase");
			return { data: docSnap.data().financialData, error: null };
		} else {
			console.log("No data found in Firebase");
			return { data: null, error: "No data found" };
		}
	} catch (error) {
		console.error("Error loading data from Firebase:", error);
		return { data: null, error: error.message };
	}
};

// Export auth status listener for external use
export const onAuthStateChange = (callback) => {
	return onAuthStateChanged(auth, callback);
};

export { auth, db };
export default app;
