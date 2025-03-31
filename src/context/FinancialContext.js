import React, { createContext, useState, useEffect } from "react";

// Create the context
export const FinancialContext = createContext();

export const FinancialProvider = ({ children }) => {
	// Initialize state with default values or load from localStorage
	const initialState = {
		personalInfo: {
			birthday: "September 1996",
			currentAge: "28 (as of March 2025)",
			employmentStart: "August 2024",
			projectionStart: "March 2025",
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
		expenses: {
			rental: 700,
			food: 600,
			transportation: 228,
			entertainment: 200,
		},
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

	// Calculate total expenses
	const totalExpenses =
		financialData.expenses.rental +
		financialData.expenses.food +
		financialData.expenses.transportation +
		financialData.expenses.entertainment;

	// Provide the context value
	return (
		<FinancialContext.Provider
			value={{
				financialData,
				updateFinancialData,
				totalExpenses,
			}}
		>
			{children}
		</FinancialContext.Provider>
	);
};
