// 1. First, install Firebase:
// Run this in your project directory:
// npm install firebase

// 2. Create src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
	getAuth,
	signInWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
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
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Authentication functions
export const loginWithEmail = async (email, password) => {
	try {
		const userCredential = await signInWithEmailAndPassword(
			auth,
			email,
			password
		);
		return { user: userCredential.user, error: null };
	} catch (error) {
		return { user: null, error: error.message };
	}
};

export const logoutUser = async () => {
	try {
		await signOut(auth);
		return { success: true, error: null };
	} catch (error) {
		return { success: false, error: error.message };
	}
};

// Data persistence functions
export const saveFinancialData = async (userId, data) => {
	try {
		await setDoc(doc(db, "userData", userId), { financialData: data });
		return { success: true, error: null };
	} catch (error) {
		console.error("Error saving data:", error);
		return { success: false, error: error.message };
	}
};

export const loadFinancialData = async (userId) => {
	try {
		const docRef = doc(db, "userData", userId);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			return { data: docSnap.data().financialData, error: null };
		} else {
			return { data: null, error: "No data found" };
		}
	} catch (error) {
		console.error("Error loading data:", error);
		return { data: null, error: error.message };
	}
};

export { auth, db };
export default app;
