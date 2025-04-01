// src/context/FinancialContext.js - Updated version with Firebase integration
import React, { createContext, useState, useEffect, useContext } from "react";
import { saveFinancialData, loadFinancialData } from "../firebase/firebase";
import { useAuth } from "./AuthContext";

// Create the context
export const FinancialContext = createContext();

export const FinancialProvider = ({ children }) => {
	const { currentUser } = useAuth();
	const [isLoading, setIsLoading] = useState(true);

	// Initialize state with default values
	const initialState = {
		personalInfo: {
			birthday: {
				month: 9, // September
				year: 1996,
			},
			employmentStart: {
				month: 8, // August
				year: 2024,
			},
			projectionStart: {
				month: 3, // March
				year: 2025,
			},
			currentSavings: 11000,
			currentCpfBalance: 15000, // Added initial CPF balance field
			remainingLoan: 26848,
			interestRate: 4.75,
			monthlyRepayment: 900,
		},
		income: {
			currentSalary: 4800,
			futureSalary: 5100,
			salaryAdjustmentMonth: 7, // July
			salaryAdjustmentYear: 2025,
			cpfRate: 20, // percentage
			employerCpfRate: 17, // percentage
		},
		// Changed from fixed keys to an array of expense objects
		expenses: [
			{ id: 1, name: "Rental", amount: 700 },
			{ id: 2, name: "Food", amount: 600 },
			{ id: 3, name: "Transportation", amount: 228 },
			{ id: 4, name: "Entertainment", amount: 200 },
		],
	};

	// Function to migrate old data format to new format
	const migrateData = (oldData) => {
		// Check if we need to migrate the expenses format from object to array
		if (oldData && oldData.expenses && !Array.isArray(oldData.expenses)) {
			console.log("Migrating expenses from object to array format");

			// Create array of expense objects from the old format
			const migratedExpenses = [];

			// Handle old format with rental, food, transportation, entertainment as direct properties
			if (typeof oldData.expenses.rental === "number") {
				migratedExpenses.push({
					id: 1,
					name: "Rental",
					amount: oldData.expenses.rental,
				});
			}
			if (typeof oldData.expenses.food === "number") {
				migratedExpenses.push({
					id: 2,
					name: "Food",
					amount: oldData.expenses.food,
				});
			}
			if (typeof oldData.expenses.transportation === "number") {
				migratedExpenses.push({
					id: 3,
					name: "Transportation",
					amount: oldData.expenses.transportation,
				});
			}
			if (typeof oldData.expenses.entertainment === "number") {
				migratedExpenses.push({
					id: 4,
					name: "Entertainment",
					amount: oldData.expenses.entertainment,
				});
			}

			// Update the expenses property with the new array format
			oldData.expenses =
				migratedExpenses.length > 0
					? migratedExpenses
					: initialState.expenses;
		}

		// Add currentCpfBalance if it doesn't exist
		if (
			oldData &&
			oldData.personalInfo &&
			typeof oldData.personalInfo.currentCpfBalance === "undefined"
		) {
			oldData.personalInfo.currentCpfBalance =
				initialState.personalInfo.currentCpfBalance;
		}

		// Ensure personalInfo date fields are objects with month and year
		if (oldData && oldData.personalInfo) {
			// Birthday
			if (
				oldData.personalInfo.birthday &&
				typeof oldData.personalInfo.birthday === "string"
			) {
				try {
					// Try to extract month and year if it's a string in format "Month Year"
					const parts = oldData.personalInfo.birthday.split(" ");
					if (parts.length === 2) {
						const month = getMonthNumber(parts[0]);
						const year = parseInt(parts[1]);
						if (!isNaN(month) && !isNaN(year)) {
							oldData.personalInfo.birthday = { month, year };
						} else {
							oldData.personalInfo.birthday =
								initialState.personalInfo.birthday;
						}
					} else {
						oldData.personalInfo.birthday =
							initialState.personalInfo.birthday;
					}
				} catch (e) {
					oldData.personalInfo.birthday =
						initialState.personalInfo.birthday;
				}
			} else if (!oldData.personalInfo.birthday) {
				oldData.personalInfo.birthday =
					initialState.personalInfo.birthday;
			}

			// Employment Start
			if (
				oldData.personalInfo.employmentStart &&
				typeof oldData.personalInfo.employmentStart === "string"
			) {
				try {
					const parts =
						oldData.personalInfo.employmentStart.split(" ");
					if (parts.length === 2) {
						const month = getMonthNumber(parts[0]);
						const year = parseInt(parts[1]);
						if (!isNaN(month) && !isNaN(year)) {
							oldData.personalInfo.employmentStart = {
								month,
								year,
							};
						} else {
							oldData.personalInfo.employmentStart =
								initialState.personalInfo.employmentStart;
						}
					} else {
						oldData.personalInfo.employmentStart =
							initialState.personalInfo.employmentStart;
					}
				} catch (e) {
					oldData.personalInfo.employmentStart =
						initialState.personalInfo.employmentStart;
				}
			} else if (!oldData.personalInfo.employmentStart) {
				oldData.personalInfo.employmentStart =
					initialState.personalInfo.employmentStart;
			}

			// Projection Start
			if (
				oldData.personalInfo.projectionStart &&
				typeof oldData.personalInfo.projectionStart === "string"
			) {
				try {
					const parts =
						oldData.personalInfo.projectionStart.split(" ");
					if (parts.length === 2) {
						const month = getMonthNumber(parts[0]);
						const year = parseInt(parts[1]);
						if (!isNaN(month) && !isNaN(year)) {
							oldData.personalInfo.projectionStart = {
								month,
								year,
							};
						} else {
							oldData.personalInfo.projectionStart =
								initialState.personalInfo.projectionStart;
						}
					} else {
						oldData.personalInfo.projectionStart =
							initialState.personalInfo.projectionStart;
					}
				} catch (e) {
					oldData.personalInfo.projectionStart =
						initialState.personalInfo.projectionStart;
				}
			} else if (!oldData.personalInfo.projectionStart) {
				oldData.personalInfo.projectionStart =
					initialState.personalInfo.projectionStart;
			}
		}

		return oldData;
	};

	// Get month number from month name
	const getMonthNumber = (monthName) => {
		const months = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		];
		return (
			months.findIndex((m) =>
				monthName.toLowerCase().startsWith(m.toLowerCase())
			) + 1 || 1
		);
	};

	// Load data from Firebase or localStorage depending on authentication state
	const loadSavedData = async () => {
		try {
			// First check if we're authenticated
			if (currentUser) {
				// Try to load from Firebase
				const { data, error } = await loadFinancialData(
					currentUser.uid
				);
				if (data) {
					return migrateData(data);
				} else if (error) {
					console.warn("Error loading from Firebase:", error);
					// Fall back to localStorage
					const localData = localStorage.getItem("financialData");
					if (localData) {
						const parsedData = JSON.parse(localData);
						// Save the local data to Firebase for future use
						await saveFinancialData(currentUser.uid, parsedData);
						return migrateData(parsedData);
					}
				}
			} else {
				// Not authenticated, use localStorage
				const savedData = localStorage.getItem("financialData");
				if (savedData) {
					return migrateData(JSON.parse(savedData));
				}
			}

			// If nothing found or error occurred, use initialState
			return initialState;
		} catch (error) {
			console.error("Error loading saved data:", error);
			// Clear potentially corrupted data
			localStorage.removeItem("financialData");
			return initialState;
		} finally {
			setIsLoading(false);
		}
	};

	const [financialData, setFinancialData] = useState(initialState);

	// Load data when component mounts or user changes
	useEffect(() => {
		setIsLoading(true);
		loadSavedData().then((data) => {
			setFinancialData(data);
		});
	}, [currentUser]);

	// Save data whenever it changes
	useEffect(() => {
		const saveData = async () => {
			// Always save to localStorage as a fallback
			localStorage.setItem(
				"financialData",
				JSON.stringify(financialData)
			);

			// If authenticated, also save to Firebase
			if (currentUser && !isLoading) {
				try {
					await saveFinancialData(currentUser.uid, financialData);
				} catch (error) {
					console.error("Error saving to Firebase:", error);
				}
			}
		};

		if (!isLoading) {
			saveData();
		}
	}, [financialData, currentUser, isLoading]);

	// Function to update financial data
	const updateFinancialData = (newData) => {
		setFinancialData((prev) => ({
			...prev,
			...newData,
		}));
	};

	// Calculate total expenses from the expenses array
	const totalExpenses = Array.isArray(financialData.expenses)
		? financialData.expenses.reduce(
				(total, expense) => total + expense.amount,
				0
		  )
		: 0;

	// Calculate current age based on birthday
	const calculateAge = () => {
		const today = new Date();
		const birthMonth = financialData.personalInfo.birthday.month;
		const birthYear = financialData.personalInfo.birthday.year;

		let age = today.getFullYear() - birthYear;

		// Adjust age if birthday hasn't occurred yet this year
		if (
			today.getMonth() + 1 < birthMonth ||
			(today.getMonth() + 1 === birthMonth && today.getDate() < 15)
		) {
			age--;
		}

		return age;
	};

	// Function to add a new expense category
	const addExpense = (name, amount) => {
		const newExpense = {
			id: Date.now(), // Use timestamp as unique ID
			name,
			amount: parseFloat(amount) || 0,
		};

		setFinancialData((prev) => ({
			...prev,
			expenses: Array.isArray(prev.expenses)
				? [...prev.expenses, newExpense]
				: [newExpense],
		}));
	};

	// Function to remove an expense category
	const removeExpense = (id) => {
		setFinancialData((prev) => ({
			...prev,
			expenses: Array.isArray(prev.expenses)
				? prev.expenses.filter((expense) => expense.id !== id)
				: [],
		}));
	};

	// Function to update an existing expense
	const updateExpense = (id, updates) => {
		setFinancialData((prev) => ({
			...prev,
			expenses: Array.isArray(prev.expenses)
				? prev.expenses.map((expense) =>
						expense.id === id ? { ...expense, ...updates } : expense
				  )
				: [],
		}));
	};

	// Get month name
	const getMonthName = (monthNumber) => {
		const months = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		];
		return months[monthNumber - 1] || "January";
	};

	// Format a date object as a string
	const formatDate = (dateObj) => {
		return `${getMonthName(dateObj.month)} ${dateObj.year}`;
	};

	// Reset data to initial state (for troubleshooting)
	const resetData = () => {
		localStorage.removeItem("financialData");
		setFinancialData(initialState);

		if (currentUser) {
			saveFinancialData(currentUser.uid, initialState);
		}
	};

	// Provide the context value
	return (
		<FinancialContext.Provider
			value={{
				financialData,
				updateFinancialData,
				totalExpenses,
				calculateAge,
				addExpense,
				removeExpense,
				updateExpense,
				getMonthName,
				formatDate,
				resetData,
				isLoading,
			}}
		>
			{children}
		</FinancialContext.Provider>
	);
};

// Custom hook to use the financial context
export const useFinancial = () => {
	return useContext(FinancialContext);
};
