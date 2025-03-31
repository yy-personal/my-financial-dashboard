import React, { createContext, useState, useEffect } from "react";

// Create the context
export const FinancialContext = createContext();

export const FinancialProvider = ({ children }) => {
	// Initialize state with default values or load from localStorage
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

	// Try to load saved data from localStorage
	const loadSavedData = () => {
		try {
			const savedData = localStorage.getItem("financialData");
			return savedData ? JSON.parse(savedData) : initialState;
		} catch (error) {
			console.error("Error loading saved data:", error);
			return initialState;
		}
	};

	const [financialData, setFinancialData] = useState(loadSavedData);

	// Save data to localStorage whenever it changes
	useEffect(() => {
		localStorage.setItem("financialData", JSON.stringify(financialData));
	}, [financialData]);

	// Function to update financial data
	const updateFinancialData = (newData) => {
		setFinancialData((prev) => ({
			...prev,
			...newData,
		}));
	};

	// Calculate total expenses from the expenses array
	const totalExpenses = financialData.expenses.reduce(
		(total, expense) => total + expense.amount,
		0
	);

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
			expenses: [...prev.expenses, newExpense],
		}));
	};

	// Function to remove an expense category
	const removeExpense = (id) => {
		setFinancialData((prev) => ({
			...prev,
			expenses: prev.expenses.filter((expense) => expense.id !== id),
		}));
	};

	// Function to update an existing expense
	const updateExpense = (id, updates) => {
		setFinancialData((prev) => ({
			...prev,
			expenses: prev.expenses.map((expense) =>
				expense.id === id ? { ...expense, ...updates } : expense
			),
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
		return months[monthNumber - 1];
	};

	// Format a date object as a string
	const formatDate = (dateObj) => {
		return `${getMonthName(dateObj.month)} ${dateObj.year}`;
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
			}}
		>
			{children}
		</FinancialContext.Provider>
	);
};
