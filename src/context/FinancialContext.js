// src/context/FinancialContext.js - Modified for better Firebase syncing
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { saveFinancialData, loadFinancialData } from "../firebase/firebase";
import { useAuth } from "./AuthContext";

// Create the context
export const FinancialContext = createContext();

export const FinancialProvider = ({ children }) => {
	const { currentUser } = useAuth();
	const [isLoading, setIsLoading] = useState(true);
	const [syncStatus, setSyncStatus] = useState({
		status: "idle",
		lastSync: null,
	});

	// Initialize state with default values
	const initialState = {
		personalInfo: {
			birthday: {
				month: 9, // September
				year: 1996,
			},
			currentSavings: 11000,
			currentCpfBalance: 15000, // Added initial CPF balance field
			remainingLoan: 26848,
			interestRate: 4.75,
			monthlyRepayment: 900,
		},
		income: {
			currentSalary: 4800,
			cpfRate: 20, // percentage
			employerCpfRate: 17, // percentage
			employeeType: 'singaporean', // CPF employee type
			salaryDay: 25, // Day of month when salary is received (23-25th)
		},
		expenses: [
			{ id: 1, name: "Rental", amount: 700, dueDay: 1 }, // Due on 1st of month
			{ id: 2, name: "Food", amount: 600, dueDay: 15 }, // Spread throughout month, assume mid-month
			{ id: 3, name: "Transportation", amount: 228, dueDay: 10 }, // Assume early month
			{ id: 4, name: "Entertainment", amount: 200, dueDay: 20 }, // Assume later in month
		],
		yearlyBonuses: [
			{
				id: 1,
				year: 2025,
				month: 12,
				amount: 5000,
				description: "Year End Bonus",
			},
		],
		upcomingSpending: [],
		projectionSettings: {
			rowsToDisplay: 36, // Default to 36 months (3 years)
			enableIntraMonthAnalysis: true, // Enable detailed cash flow timing
			minimumCashBuffer: 1000, // Minimum cash to maintain before salary
		},
	};

	// Function to migrate old data format to new format
	const migrateData = (oldData) => {
		if (!oldData) return initialState;

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

		// Add yearlyBonuses if it doesn't exist
		if (!oldData.yearlyBonuses) {
			oldData.yearlyBonuses = initialState.yearlyBonuses;
		}

		// Add upcomingSpending if it doesn't exist
		if (!oldData.upcomingSpending) {
			oldData.upcomingSpending = initialState.upcomingSpending;
		}

		// Add projectionSettings if it doesn't exist
		if (!oldData.projectionSettings) {
			oldData.projectionSettings = initialState.projectionSettings;
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
		
		// Add employeeType if it doesn't exist
		if (
			oldData &&
			oldData.income &&
			typeof oldData.income.employeeType === "undefined"
		) {
			oldData.income.employeeType = initialState.income.employeeType;
		}

		// Remove legacy salary adjustment fields (cleanup)
		if (oldData && oldData.income) {
			if (oldData.income.futureSalary !== undefined) {
				delete oldData.income.futureSalary;
			}
			if (oldData.income.salaryAdjustmentMonth !== undefined) {
				delete oldData.income.salaryAdjustmentMonth;
			}
			if (oldData.income.salaryAdjustmentYear !== undefined) {
				delete oldData.income.salaryAdjustmentYear;
			}
			
			// Add salaryDay if it doesn't exist
			if (typeof oldData.income.salaryDay === "undefined") {
				oldData.income.salaryDay = initialState.income.salaryDay;
			}
		}

		// Migrate expenses to include dueDay if missing
		if (oldData && oldData.expenses && Array.isArray(oldData.expenses)) {
			oldData.expenses = oldData.expenses.map((expense, index) => ({
				...expense,
				dueDay: expense.dueDay !== undefined ? expense.dueDay : 
					(initialState.expenses[index]?.dueDay || 15) // Default to mid-month
			}));
		}

		// Add new projection settings if missing
		if (oldData && oldData.projectionSettings) {
			if (typeof oldData.projectionSettings.enableIntraMonthAnalysis === "undefined") {
				oldData.projectionSettings.enableIntraMonthAnalysis = initialState.projectionSettings.enableIntraMonthAnalysis;
			}
			if (typeof oldData.projectionSettings.minimumCashBuffer === "undefined") {
				oldData.projectionSettings.minimumCashBuffer = initialState.projectionSettings.minimumCashBuffer;
			}
		} else if (oldData) {
			// Initialize projectionSettings if it doesn't exist
			oldData.projectionSettings = initialState.projectionSettings;
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

			// Remove employmentStart field if it exists (cleanup)
			if (oldData.personalInfo.employmentStart !== undefined) {
				delete oldData.personalInfo.employmentStart;
			}

			// Remove projectionStart field if it exists (cleanup - now auto-detected)
			if (oldData.personalInfo.projectionStart !== undefined) {
				delete oldData.personalInfo.projectionStart;
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
	const loadSavedData = useCallback(async () => {
		try {
			setSyncStatus({ status: "loading", lastSync: null });
			// First check if we're authenticated
			if (currentUser) {
				console.log(
					"User is authenticated, trying to load from Firebase"
				);
				// Try to load from Firebase
				const { data, error } = await loadFinancialData(
					currentUser.uid
				);
				if (data) {
					console.log("Successfully loaded data from Firebase");
					setSyncStatus({
						status: "synced",
						lastSync: new Date().toISOString(),
					});
					return migrateData(data);
				} else if (error) {
					console.warn("Error loading from Firebase:", error);
					// Fall back to localStorage
					const localData = localStorage.getItem("financialData");
					if (localData) {
						console.log(
							"Using localStorage data and syncing to Firebase"
						);
						const parsedData = JSON.parse(localData);
						// Save the local data to Firebase for future use
						await saveFinancialData(currentUser.uid, parsedData);
						setSyncStatus({
							status: "synced",
							lastSync: new Date().toISOString(),
						});
						return migrateData(parsedData);
					} else {
						setSyncStatus({ status: "error", lastSync: null });
					}
				}
			} else {
				console.log("User not authenticated, using localStorage");
				// Not authenticated, use localStorage
				const savedData = localStorage.getItem("financialData");
				if (savedData) {
					setSyncStatus({ status: "local", lastSync: null });
					return migrateData(JSON.parse(savedData));
				}
			}

			// If nothing found or error occurred, use initialState
			console.log("No saved data found, using initial state");
			setSyncStatus({ status: "new", lastSync: null });
			return initialState;
		} catch (error) {
			console.error("Error loading saved data:", error);
			// Clear potentially corrupted data
			localStorage.removeItem("financialData");
			setSyncStatus({ status: "error", lastSync: null });
			return initialState;
		} finally {
			setIsLoading(false);
		}
	}, [currentUser, initialState, migrateData]);

	const [financialData, setFinancialData] = useState(initialState);

	// Load data when component mounts or user changes
	useEffect(() => {
		console.log("FinancialContext: User status changed, reloading data");
		setIsLoading(true);
		loadSavedData().then((data) => {
			setFinancialData(data);
		});
	}, [currentUser, loadSavedData]); // This will reload data whenever the user changes

	// Save data whenever it changes
	useEffect(() => {
		const saveData = async () => {
			// Always save to localStorage as a fallback
			localStorage.setItem(
				"financialData",
				JSON.stringify(financialData)
			);
			console.log("Saved data to localStorage");

			// If authenticated, also save to Firebase
			if (currentUser && !isLoading) {
				try {
					console.log("Saving data to Firebase");
					setSyncStatus({
						status: "saving",
						lastSync: syncStatus.lastSync,
					});
					await saveFinancialData(currentUser.uid, financialData);
					console.log("Successfully saved data to Firebase");
					setSyncStatus({
						status: "synced",
						lastSync: new Date().toISOString(),
					});
				} catch (error) {
					console.error("Error saving to Firebase:", error);
					setSyncStatus({
						status: "error",
						lastSync: syncStatus.lastSync,
					});
				}
			} else if (!currentUser) {
				console.log("User not authenticated, data only saved locally");
				setSyncStatus({ status: "local", lastSync: null });
			}
		};

		if (!isLoading) {
			saveData();
		}
	}, [financialData, currentUser, isLoading, syncStatus.lastSync]);

	// Function to update financial data
	const updateFinancialData = (newData) => {
		setFinancialData((prev) => ({
			...prev,
			...newData,
		}));
	};

	// Function to update projection settings
	const updateProjectionSettings = (settings) => {
		setFinancialData((prev) => ({
			...prev,
			projectionSettings: {
				...prev.projectionSettings,
				...settings,
			},
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
	const addExpense = (name, amount, dueDay = 15) => {
		const newExpense = {
			id: Date.now(), // Use timestamp as unique ID
			name,
			amount: parseFloat(amount) || 0,
			dueDay: parseInt(dueDay) || 15, // Default to mid-month
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

	// Function to add a new yearly bonus
	const addYearlyBonus = (year, month, amount, description) => {
		const newBonus = {
			id: Date.now(), // Use timestamp as unique ID
			year: parseInt(year),
			month: parseInt(month),
			amount: parseFloat(amount) || 0,
			description,
		};

		setFinancialData((prev) => ({
			...prev,
			yearlyBonuses: Array.isArray(prev.yearlyBonuses)
				? [...prev.yearlyBonuses, newBonus]
				: [newBonus],
		}));
	};

	// Function to remove a yearly bonus
	const removeYearlyBonus = (id) => {
		setFinancialData((prev) => ({
			...prev,
			yearlyBonuses: Array.isArray(prev.yearlyBonuses)
				? prev.yearlyBonuses.filter((bonus) => bonus.id !== id)
				: [],
		}));
	};

	// Function to update an existing yearly bonus
	const updateYearlyBonus = (id, updates) => {
		setFinancialData((prev) => ({
			...prev,
			yearlyBonuses: Array.isArray(prev.yearlyBonuses)
				? prev.yearlyBonuses.map((bonus) =>
						bonus.id === id ? { ...bonus, ...updates } : bonus
				  )
				: [],
		}));
	};

	// Function to add a new upcoming spending
	const addUpcomingSpending = (name, amount, day, month, year, description) => {
		const newSpending = {
			id: Date.now(),
			name,
			amount: parseFloat(amount) || 0,
			day: parseInt(day) || 15,
			month: parseInt(month),
			year: parseInt(year),
			description: description || "",
		};

		setFinancialData((prev) => ({
			...prev,
			upcomingSpending: Array.isArray(prev.upcomingSpending)
				? [...prev.upcomingSpending, newSpending]
				: [newSpending],
		}));
	};

	// Function to remove an upcoming spending
	const removeUpcomingSpending = (id) => {
		setFinancialData((prev) => ({
			...prev,
			upcomingSpending: Array.isArray(prev.upcomingSpending)
				? prev.upcomingSpending.filter((spending) => spending.id !== id)
				: [],
		}));
	};

	// Function to update an existing upcoming spending
	const updateUpcomingSpending = (id, updates) => {
		setFinancialData((prev) => ({
			...prev,
			upcomingSpending: Array.isArray(prev.upcomingSpending)
				? prev.upcomingSpending.map((spending) =>
						spending.id === id ? { ...spending, ...updates } : spending
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
			saveFinancialData(currentUser.uid, initialState)
				.then(() => {
					console.log("Data reset successful");
					setSyncStatus({
						status: "synced",
						lastSync: new Date().toISOString(),
					});
				})
				.catch((error) => {
					console.error("Error resetting data:", error);
					setSyncStatus({ status: "error", lastSync: null });
				});
		}
	};

	// Force sync with Firebase (for manual sync button)
	const forceSyncWithFirebase = async () => {
		if (!currentUser) {
			console.warn("Cannot sync: User not authenticated");
			return { success: false, error: "Not authenticated" };
		}

		try {
			setSyncStatus({ status: "saving", lastSync: syncStatus.lastSync });
			await saveFinancialData(currentUser.uid, financialData);
			setSyncStatus({
				status: "synced",
				lastSync: new Date().toISOString(),
			});
			return { success: true, error: null };
		} catch (error) {
			console.error("Force sync error:", error);
			setSyncStatus({ status: "error", lastSync: syncStatus.lastSync });
			return { success: false, error: error.message };
		}
	};

	// Provide the context value
	return (
		<FinancialContext.Provider
			value={{
				financialData,
				updateFinancialData,
				updateProjectionSettings,
				totalExpenses,
				calculateAge,
				addExpense,
				removeExpense,
				updateExpense,
				addYearlyBonus,
				removeYearlyBonus,
				updateYearlyBonus,
				addUpcomingSpending,
				removeUpcomingSpending,
				updateUpcomingSpending,
				getMonthName,
				formatDate,
				resetData,
				isLoading,
				syncStatus,
				forceSyncWithFirebase,
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
