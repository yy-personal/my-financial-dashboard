import React, { useContext, useState, useRef } from "react";
import { FinancialContext } from "../context/FinancialContext";
import { useNavigate } from "react-router-dom";

const EditParameters = () => {
	const {
		financialData,
		updateFinancialData,
		getMonthName,
		calculateAge,
	} = useContext(FinancialContext);

	const navigate = useNavigate();

	// Use useRef to keep track of next id for salary adjustments
	const nextSalaryAdjustmentId = useRef(1);

	// Use useRef to keep track of next id for yearly bonuses
	const nextYearlyBonusId = useRef(1);

	// Use useRef to keep track of next id for upcoming spending
	const nextUpcomingSpendingId = useRef(1);

	// Initialize formData with proper structure for salary adjustments and yearly bonuses
	const initializeFormData = () => {
		// Check if there are salary adjustments in the context
		const salaryAdjustments = financialData.income.salaryAdjustments || [];

		// If no salary adjustments but there's the old format data, migrate it
		if (
			salaryAdjustments.length === 0 &&
			financialData.income.futureSalary
		) {
			salaryAdjustments.push({
				id: nextSalaryAdjustmentId.current++,
				month: financialData.income.salaryAdjustmentMonth || 1,
				year:
					financialData.income.salaryAdjustmentYear ||
					new Date().getFullYear() + 1,
				newSalary: financialData.income.futureSalary,
			});
		}

		// Find the largest ID for salary adjustments to update the ref
		if (salaryAdjustments.length > 0) {
			const maxId = Math.max(...salaryAdjustments.map((adj) => adj.id));
			nextSalaryAdjustmentId.current = maxId + 1;
		}

		// Check if there are yearly bonuses in the context
		const yearlyBonuses = financialData.yearlyBonuses || [];

		// Find the largest ID for yearly bonuses to update the ref
		if (yearlyBonuses.length > 0) {
			const maxBonusId = Math.max(
				...yearlyBonuses.map((bonus) => bonus.id)
			);
			nextYearlyBonusId.current = maxBonusId + 1;
		}

		// Check if there are upcoming spending items in the context
		const upcomingSpending = financialData.upcomingSpending || [];

		// Find the largest ID for upcoming spending to update the ref
		if (upcomingSpending.length > 0) {
			const maxSpendingId = Math.max(
				...upcomingSpending.map((spending) => spending.id)
			);
			nextUpcomingSpendingId.current = maxSpendingId + 1;
		}

		return {
			personalInfo: {
				...financialData.personalInfo,
				currentSavings: String(
					financialData.personalInfo.currentSavings
				),
				currentCpfBalance: String(
					financialData.personalInfo.currentCpfBalance || 0
				),
				remainingLoan: String(financialData.personalInfo.remainingLoan),
				interestRate: String(financialData.personalInfo.interestRate),
				monthlyRepayment: String(
					financialData.personalInfo.monthlyRepayment
				),
				birthday: { ...financialData.personalInfo.birthday },
				// Add savings timeframe setting
			},
			income: {
				...financialData.income,
				currentSalary: String(financialData.income.currentSalary),
				cpfRate: String(financialData.income.cpfRate),
				employerCpfRate: String(financialData.income.employerCpfRate),
				salaryDay: String(financialData.income.salaryDay || 25),
				salaryAdjustments: salaryAdjustments.map((adj) => ({
					...adj,
					newSalary: String(adj.newSalary),
				})),
			},
			expenses: financialData.expenses.map((expense) => ({
				...expense,
				amount: String(expense.amount),
				dueDay: String(expense.dueDay || 15), // Default to 15th if not set
			})),
			yearlyBonuses: yearlyBonuses.map((bonus) => ({
				...bonus,
				amount: String(bonus.amount),
			})),
			upcomingSpending: upcomingSpending.map((spending) => ({
				...spending,
				amount: String(spending.amount),
				day: String(spending.day || 15),
			})),
			newExpense: { name: "", amount: "", dueDay: "15" },
			newSalaryAdjustment: {
				month: new Date().getMonth() + 1,
				year: new Date().getFullYear() + 1,
				newSalary: "",
			},
			newYearlyBonus: {
				month: 12, // Default to December
				year: new Date().getFullYear(),
				amount: "",
				description: "Year End Bonus",
			},
			newUpcomingSpending: {
				name: "",
				amount: "",
				day: "15",
				month: new Date().getMonth() + 1,
				year: new Date().getFullYear(),
				description: "",
			},
		};
	};

	// Use a single state object for all form data to prevent re-renders
	const [formData, setFormData] = useState(initializeFormData);

	// State for active section (for mobile accordion view)
	const [activeSection, setActiveSection] = useState("personal");

	// Toggle section visibility for mobile
	const toggleSection = (section) => {
		setActiveSection(activeSection === section ? "" : section);
	};


	// Generate year options for dropdowns
	const currentYear = new Date().getFullYear();
	const yearOptions = [];
	for (let year = currentYear; year <= currentYear + 10; year++) {
		yearOptions.push(year);
	}

	// Generate month options
	const monthOptions = Array.from({ length: 12 }, (_, i) => ({
		value: i + 1,
		label: getMonthName(i + 1),
	}));

	// Direct input change handler with optimized focus retention
	// const handleDirectInputChange = (e) => {
	// 	const { name, value } = e.target;
	// 	const [section, field] = name.split(".");
	//
	// 	if (section && field) {
	// 		setFormData((prevData) => {
	// 			// Create a deep copy to avoid unintended references
	// 			const newData = JSON.parse(JSON.stringify(prevData));
	// 			// Update only the specific field that changed
	// 			newData[section][field] = value;
	// 			return newData;
	// 		});
	// 	}
	// };

	// Handle nested date changes (birthday)
	const handleDateChange = (dateType, field, value) => {
		setFormData((prevData) => {
			const newData = { ...prevData };
			newData.personalInfo = {
				...newData.personalInfo,
				[dateType]: {
					...newData.personalInfo[dateType],
					[field]: parseInt(value) || 0,
				},
			};
			return newData;
		});
	};

	// Handle expense field changes
	const handleExpenseChange = (index, field, value) => {
		setFormData((prevData) => {
			const newData = { ...prevData };
			const updatedExpenses = [...newData.expenses];
			updatedExpenses[index] = {
				...updatedExpenses[index],
				[field]: value,
			};
			newData.expenses = updatedExpenses;
			return newData;
		});
	};

	// Handle salary adjustment field changes
	const handleSalaryAdjustmentChange = (index, field, value) => {
		setFormData((prevData) => {
			const newData = { ...prevData };
			const updatedAdjustments = [...newData.income.salaryAdjustments];
			updatedAdjustments[index] = {
				...updatedAdjustments[index],
				[field]: value,
			};
			newData.income.salaryAdjustments = updatedAdjustments;
			return newData;
		});
	};

	// Handle changes to new salary adjustment form
	const handleNewSalaryAdjustmentChange = (field, value) => {
		setFormData((prevData) => {
			const newData = { ...prevData };
			newData.newSalaryAdjustment = {
				...newData.newSalaryAdjustment,
				[field]: value,
			};
			return newData;
		});
	};

	// Handle adding a new salary adjustment
	const handleAddSalaryAdjustment = (e) => {
		e.preventDefault();

		const { month, year, newSalary } = formData.newSalaryAdjustment;

		if (newSalary) {
			const newAdjustment = {
				id: nextSalaryAdjustmentId.current++,
				month: parseInt(month),
				year: parseInt(year),
				newSalary: newSalary,
			};

			setFormData((prevData) => {
				const newData = { ...prevData };
				newData.income.salaryAdjustments = [
					...newData.income.salaryAdjustments,
					newAdjustment,
				];
				// Reset the new adjustment form
				newData.newSalaryAdjustment = {
					month: new Date().getMonth() + 1,
					year: new Date().getFullYear() + 1,
					newSalary: "",
				};
				return newData;
			});
		}
	};

	// Handle removing a salary adjustment
	const handleRemoveSalaryAdjustment = (id) => {
		setFormData((prevData) => {
			const newData = { ...prevData };
			newData.income.salaryAdjustments =
				newData.income.salaryAdjustments.filter(
					(adjustment) => adjustment.id !== id
				);
			return newData;
		});
	};

	// Handle yearly bonus field changes
	const handleYearlyBonusChange = (index, field, value) => {
		setFormData((prevData) => {
			const newData = { ...prevData };
			const updatedBonuses = [...newData.yearlyBonuses];
			updatedBonuses[index] = {
				...updatedBonuses[index],
				[field]: value,
			};
			newData.yearlyBonuses = updatedBonuses;
			return newData;
		});
	};

	// Handle changes to new yearly bonus form
	const handleNewYearlyBonusChange = (field, value) => {
		setFormData((prevData) => {
			const newData = { ...prevData };
			newData.newYearlyBonus = {
				...newData.newYearlyBonus,
				[field]: value,
			};
			return newData;
		});
	};

	// Handle adding a new yearly bonus
	const handleAddYearlyBonus = (e) => {
		e.preventDefault();

		const { month, year, amount, description } = formData.newYearlyBonus;

		if (amount) {
			const newBonus = {
				id: nextYearlyBonusId.current++,
				month: parseInt(month),
				year: parseInt(year),
				amount: amount,
				description: description || "Bonus",
			};

			setFormData((prevData) => {
				const newData = { ...prevData };
				newData.yearlyBonuses = [...newData.yearlyBonuses, newBonus];
				// Reset the new bonus form
				newData.newYearlyBonus = {
					month: 12,
					year: new Date().getFullYear(),
					amount: "",
					description: "Year End Bonus",
				};
				return newData;
			});
		}
	};

	// Handle removing a yearly bonus
	const handleRemoveYearlyBonus = (id) => {
		setFormData((prevData) => {
			const newData = { ...prevData };
			newData.yearlyBonuses = newData.yearlyBonuses.filter(
				(bonus) => bonus.id !== id
			);
			return newData;
		});
	};

	// Handle upcoming spending field changes
	const handleUpcomingSpendingChange = (index, field, value) => {
		setFormData((prevData) => {
			const newData = { ...prevData };
			const updatedSpending = [...newData.upcomingSpending];
			updatedSpending[index] = {
				...updatedSpending[index],
				[field]: value,
			};
			newData.upcomingSpending = updatedSpending;
			return newData;
		});
	};

	// Handle changes to new upcoming spending form
	const handleNewUpcomingSpendingChange = (field, value) => {
		setFormData((prevData) => {
			const newData = { ...prevData };
			newData.newUpcomingSpending = {
				...newData.newUpcomingSpending,
				[field]: value,
			};
			return newData;
		});
	};

	// Handle adding a new upcoming spending
	const handleAddUpcomingSpending = () => {
		if (
			formData.newUpcomingSpending.name &&
			formData.newUpcomingSpending.amount
		) {
			const newSpending = {
				id: nextUpcomingSpendingId.current++,
				name: formData.newUpcomingSpending.name,
				amount: formData.newUpcomingSpending.amount,
				day: parseInt(formData.newUpcomingSpending.day) || 15,
				month: parseInt(formData.newUpcomingSpending.month),
				year: parseInt(formData.newUpcomingSpending.year),
				description: formData.newUpcomingSpending.description,
			};

			setFormData((prevData) => {
				const newData = { ...prevData };
				newData.upcomingSpending = [...newData.upcomingSpending, newSpending];
				// Reset the new spending form
				newData.newUpcomingSpending = {
					name: "",
					amount: "",
					day: "15",
					month: new Date().getMonth() + 1,
					year: new Date().getFullYear(),
					description: "",
				};
				return newData;
			});
		}
	};

	// Handle removing an upcoming spending
	const handleRemoveUpcomingSpending = (id) => {
		setFormData((prevData) => {
			const newData = { ...prevData };
			newData.upcomingSpending = newData.upcomingSpending.filter(
				(spending) => spending.id !== id
			);
			return newData;
		});
	};

	// Handle removing an expense
	const handleRemoveExpense = (id) => {
		setFormData((prevData) => {
			const newData = { ...prevData };
			newData.expenses = newData.expenses.filter(
				(expense) => expense.id !== id
			);
			return newData;
		});
	};

	// Handle new expense input changes
	const handleNewExpenseChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevData) => {
			const newData = { ...prevData };
			newData.newExpense = {
				...newData.newExpense,
				[name]: value,
			};
			return newData;
		});
	};

	// Handle adding a new expense
	const handleAddExpense = (e) => {
		e.preventDefault();
		if (formData.newExpense.name.trim() && formData.newExpense.amount) {
			const newExpenseItem = {
				id: Date.now(), // Use timestamp as a unique identifier
				name: formData.newExpense.name.trim(),
				amount: formData.newExpense.amount,
				dueDay: formData.newExpense.dueDay,
			};

			setFormData((prevData) => {
				const newData = { ...prevData };
				newData.expenses = [...newData.expenses, newExpenseItem];
				newData.newExpense = { name: "", amount: "", dueDay: "15" };
				return newData;
			});
		}
	};

	// Handle form submission
	const handleSubmit = (e) => {
		e.preventDefault();

		// Reconstruct the data structure expected by the context
		const processedData = {
			personalInfo: {
				...formData.personalInfo,
				currentSavings:
					parseFloat(formData.personalInfo.currentSavings) || 0,
				currentCpfBalance:
					parseFloat(formData.personalInfo.currentCpfBalance) || 0,
				remainingLoan:
					parseFloat(formData.personalInfo.remainingLoan) || 0,
				interestRate:
					parseFloat(formData.personalInfo.interestRate) || 0,
				monthlyRepayment:
					parseFloat(formData.personalInfo.monthlyRepayment) || 0,
				// Include savings timeframe setting
			},
			income: {
				...formData.income,
				currentSalary: parseFloat(formData.income.currentSalary) || 0,
				cpfRate: parseFloat(formData.income.cpfRate) || 0,
				employerCpfRate:
					parseFloat(formData.income.employerCpfRate) || 0,
				salaryDay: parseInt(formData.income.salaryDay) || 25,
				// Process salary adjustments
				salaryAdjustments: formData.income.salaryAdjustments.map(
					(adj) => ({
						...adj,
						newSalary: parseFloat(adj.newSalary) || 0,
					})
				),
			},
		};

		// Process expenses - convert amount strings to numbers and dueDay to int
		const processedExpenses = formData.expenses.map((expense) => ({
			...expense,
			amount: parseFloat(expense.amount) || 0,
			dueDay: parseInt(expense.dueDay) || 15,
		}));

		// Process yearly bonuses - convert strings to proper types
		const processedBonuses = formData.yearlyBonuses.map((bonus) => ({
			...bonus,
			amount: parseFloat(bonus.amount) || 0,
			year: parseInt(bonus.year) || new Date().getFullYear(),
			month: parseInt(bonus.month) || 12,
		}));

		// Process upcoming spending - convert strings to proper types
		const processedUpcomingSpending = formData.upcomingSpending.map((spending) => ({
			...spending,
			amount: parseFloat(spending.amount) || 0,
			day: parseInt(spending.day) || 15,
			month: parseInt(spending.month) || 1,
			year: parseInt(spending.year) || new Date().getFullYear(),
		}));

		// Update the financial data with properly converted values
		updateFinancialData({
			...processedData,
			expenses: processedExpenses,
			yearlyBonuses: processedBonuses,
			upcomingSpending: processedUpcomingSpending,
		});

		navigate("/");
	};

	// Create a modern form input component with better focus handling
	// const FormInput = ({
	// 	label,
	// 	id,
	// 	name,
	// 	value,
	// 	onChange,
	// 	type = "text",
	// 	placeholder = "",
	// 	prefix = "",
	// 	suffix = "",
	// 	className = "",
	// }) => {
	// 	// Create a unique stable key for this input
	// 	const inputKey = `${id}-${name}`;
	//
	// 	return (
	// 		<div className={`mb-4 ${className}`}>
	// 			<label
	// 				htmlFor={id}
	// 				className="block text-gray-700 font-medium mb-2"
	// 			>
	// 				{label}
	// 			</label>
	// 			<div className="relative">
	// 				{prefix && (
	// 					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
	// 						<span className="text-gray-500">{prefix}</span>
	// 					</div>
	// 				)}
	// 				<input
	// 					key={inputKey}
	// 					type={type}
	// 					id={id}
	// 					name={name}
	// 					value={value}
	// 					onChange={onChange}
	// 					placeholder={placeholder}
	// 					className={`w-full px-3 py-2 ${prefix ? "pl-8" : ""} ${
	// 						suffix ? "pr-8" : ""
	// 					} border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
	// 				/>
	// 				{suffix && (
	// 					<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
	// 						<span className="text-gray-500">{suffix}</span>
	// 					</div>
	// 				)}
	// 			</div>
	// 		</div>
	// 	);
	// };

	// Create a date dropdown component
	const DateDropdowns = ({ dateType, label, className = "" }) => (
		<div className={`mb-4 ${className}`}>
			<label className="block text-gray-700 font-medium mb-2">
				{label}
			</label>
			<div className="grid grid-cols-2 gap-2">
				<div>
					<select
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
						value={formData.personalInfo[dateType].month}
						onChange={(e) =>
							handleDateChange(dateType, "month", e.target.value)
						}
					>
						{monthOptions.map((month) => (
							<option key={month.value} value={month.value}>
								{month.label}
							</option>
						))}
					</select>
				</div>
				<div>
					<select
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
						value={formData.personalInfo[dateType].year}
						onChange={(e) =>
							handleDateChange(dateType, "year", e.target.value)
						}
					>
						{yearOptions.map((year) => (
							<option key={year} value={year}>
								{year}
							</option>
						))}
					</select>
				</div>
			</div>
		</div>
	);

	// Section header component
	const SectionHeader = ({ title, section, icon }) => (
		<div
			className={`flex justify-between items-center cursor-pointer p-4 ${
				activeSection === section
					? "bg-blue-600 text-white"
					: "bg-blue-100 text-blue-700"
			} rounded-t-lg transition-colors`}
			onClick={() => toggleSection(section)}
		>
			<h2 className="text-lg font-semibold flex items-center">
				{icon && <span className="mr-2">{icon}</span>}
				{title}
			</h2>
			<svg
				className={`w-5 h-5 transition-transform ${
					activeSection === section ? "transform rotate-180" : ""
				}`}
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					d="M19 9l-7 7-7-7"
				/>
			</svg>
		</div>
	);

	return (
		<div className="bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
			<div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-6 rounded-t-lg">
				<h1 className="text-xl md:text-2xl font-bold">
					Edit Financial Parameters
				</h1>
				<p className="text-blue-100 mt-2">
					Customize your financial dashboard settings
				</p>
			</div>

			<form onSubmit={handleSubmit} className="p-6">
				{/* Personal Information Section */}
				<div className="mb-8 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
					<SectionHeader
						title="Personal Information"
						section="personal"
						icon={
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
						}
					/>

					{activeSection === "personal" && (
						<div className="p-6 bg-white">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								<DateDropdowns
									dateType="birthday"
									label="Birthday"
								/>

								<div className="mb-4">
									<label className="block text-gray-700 font-medium mb-2">
										Current Age
									</label>
									<div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
										{calculateAge()} years old
									</div>
									<p className="text-xs text-gray-500 mt-1">
										Auto-calculated from birthday
									</p>
								</div>


								{/* Projection Start removed - now auto-detected from current month */}
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
									<div className="flex items-center">
										<svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										<div>
											<h4 className="text-blue-800 font-medium">Projection Start</h4>
											<p className="text-blue-700 text-sm">Automatically starts from current month for accurate projections</p>
										</div>
									</div>
								</div>

								{/* Personal Information inputs - Simple version like expenses */}
								<div className="mb-4">
									<label className="block text-gray-700 font-medium mb-2">
										Current Savings (SGD)
									</label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<span className="text-gray-500">
												$
											</span>
										</div>
										<input
											type="text"
											value={
												formData.personalInfo
													.currentSavings
											}
											onChange={(e) => {
												const updatedData = {
													...formData,
												};
												updatedData.personalInfo.currentSavings =
													e.target.value;
												setFormData(updatedData);
											}}
											className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
										/>
									</div>
								</div>

								<div className="mb-4">
									<label className="block text-gray-700 font-medium mb-2">
										Remaining Loan (SGD)
									</label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<span className="text-gray-500">
												$
											</span>
										</div>
										<input
											type="text"
											value={
												formData.personalInfo
													.remainingLoan
											}
											onChange={(e) => {
												const updatedData = {
													...formData,
												};
												updatedData.personalInfo.remainingLoan =
													e.target.value;
												setFormData(updatedData);
											}}
											className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
										/>
									</div>
								</div>

								<div className="mb-4">
									<label className="block text-gray-700 font-medium mb-2">
										Loan Interest Rate (%)
									</label>
									<div className="relative">
										<input
											type="text"
											value={
												formData.personalInfo
													.interestRate
											}
											onChange={(e) => {
												const updatedData = {
													...formData,
												};
												updatedData.personalInfo.interestRate =
													e.target.value;
												setFormData(updatedData);
											}}
											className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
										/>
										<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
											<span className="text-gray-500">
												%
											</span>
										</div>
									</div>
								</div>

								<div className="mb-4">
									<label className="block text-gray-700 font-medium mb-2">
										Monthly Loan Repayment (SGD)
									</label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<span className="text-gray-500">
												$
											</span>
										</div>
										<input
											type="text"
											value={
												formData.personalInfo
													.monthlyRepayment
											}
											onChange={(e) => {
												const updatedData = {
													...formData,
												};
												updatedData.personalInfo.monthlyRepayment =
													e.target.value;
												setFormData(updatedData);
											}}
											className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
										/>
									</div>
								</div>
							</div>

						</div>
					)}
				</div>

				{/* Combined Income & CPF Section */}
				<div className="mb-8 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
					<SectionHeader
						title="Income & CPF Management"
						section="income-cpf"
						icon={
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						}
					/>

					{activeSection === "income-cpf" && (
						<div className="p-6 bg-white">
							{/* Income Section */}
							<div className="mb-6">
								<h3 className="text-lg font-semibold mb-4 text-blue-700 border-b pb-2">
									Income Information
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{/* Current Monthly Salary input - simple version */}
									<div className="mb-4">
										<label className="block text-gray-700 font-medium mb-2">
											Current Monthly Salary (SGD)
										</label>
										<div className="relative">
											<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
												<span className="text-gray-500">
													$
												</span>
											</div>
											<input
												type="text"
												value={
													formData.income
														.currentSalary
												}
												onChange={(e) => {
													const updatedData = {
														...formData,
													};
													updatedData.income.currentSalary =
														e.target.value;
													setFormData(updatedData);
												}}
												className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
											/>
										</div>
									</div>

									{/* Salary Adjustments Section */}
									<div className="md:col-span-2 mt-4">
										<h4 className="font-medium text-blue-700 mb-3">
											Future Salary Adjustments
										</h4>

										{/* Existing Salary Adjustments */}
										{formData.income.salaryAdjustments &&
										formData.income.salaryAdjustments
											.length > 0 ? (
											<div className="mb-4 overflow-x-auto">
												<table className="w-full border-collapse">
													<thead>
														<tr className="bg-gray-50">
															<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
																Date
															</th>
															<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
																New Salary (SGD)
															</th>
															<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
																Actions
															</th>
														</tr>
													</thead>
													<tbody className="bg-white divide-y divide-gray-200">
														{formData.income.salaryAdjustments.map(
															(
																adjustment,
																index
															) => (
																<tr
																	key={
																		adjustment.id
																	}
																	className="hover:bg-gray-50"
																>
																	<td className="px-4 py-2">
																		<div className="flex space-x-2">
																			<select
																				value={
																					adjustment.month
																				}
																				onChange={(
																					e
																				) =>
																					handleSalaryAdjustmentChange(
																						index,
																						"month",
																						parseInt(
																							e
																								.target
																								.value
																						)
																					)
																				}
																				className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
																			>
																				{monthOptions.map(
																					(
																						month
																					) => (
																						<option
																							key={
																								month.value
																							}
																							value={
																								month.value
																							}
																						>
																							{
																								month.label
																							}
																						</option>
																					)
																				)}
																			</select>
																			<select
																				value={
																					adjustment.year
																				}
																				onChange={(
																					e
																				) =>
																					handleSalaryAdjustmentChange(
																						index,
																						"year",
																						parseInt(
																							e
																								.target
																								.value
																						)
																					)
																				}
																				className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
																			>
																				{yearOptions.map(
																					(
																						year
																					) => (
																						<option
																							key={
																								year
																							}
																							value={
																								year
																							}
																						>
																							{
																								year
																							}
																						</option>
																					)
																				)}
																			</select>
																		</div>
																	</td>
																	<td className="px-4 py-2 whitespace-nowrap">
																		<div className="relative">
																			<div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
																				<span className="text-gray-500">
																					$
																				</span>
																			</div>
																			<input
																				type="text"
																				value={
																					adjustment.newSalary
																				}
																				onChange={(
																					e
																				) =>
																					handleSalaryAdjustmentChange(
																						index,
																						"newSalary",
																						e
																							.target
																							.value
																					)
																				}
																				className="w-full pl-6 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
																			/>
																		</div>
																	</td>
																	<td className="px-4 py-2">
																		<button
																			type="button"
																			onClick={() =>
																				handleRemoveSalaryAdjustment(
																					adjustment.id
																				)
																			}
																			className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
																		>
																			<span className="md:hidden">
																				✕
																			</span>
																			<span className="hidden md:inline">
																				Remove
																			</span>
																		</button>
																	</td>
																</tr>
															)
														)}
													</tbody>
												</table>
											</div>
										) : (
											<p className="text-sm text-gray-600 mb-4">
												No future salary adjustments
												added yet.
											</p>
										)}

										{/* Add New Salary Adjustment */}
										<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
											<h5 className="font-medium text-gray-700 mb-3">
												Add New Salary Adjustment
											</h5>
											<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
												<div className="grid grid-cols-2 gap-2 md:col-span-2">
													<select
														value={
															formData
																.newSalaryAdjustment
																.month
														}
														onChange={(e) =>
															handleNewSalaryAdjustmentChange(
																"month",
																parseInt(
																	e.target
																		.value
																)
															)
														}
														className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
													>
														{monthOptions.map(
															(month) => (
																<option
																	key={
																		month.value
																	}
																	value={
																		month.value
																	}
																>
																	{
																		month.label
																	}
																</option>
															)
														)}
													</select>
													<select
														value={
															formData
																.newSalaryAdjustment
																.year
														}
														onChange={(e) =>
															handleNewSalaryAdjustmentChange(
																"year",
																parseInt(
																	e.target
																		.value
																)
															)
														}
														className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
													>
														{yearOptions.map(
															(year) => (
																<option
																	key={year}
																	value={year}
																>
																	{year}
																</option>
															)
														)}
													</select>
												</div>
												<div className="relative">
													<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
														<span className="text-gray-500">
															$
														</span>
													</div>
													<input
														type="text"
														placeholder="New Salary"
														value={
															formData
																.newSalaryAdjustment
																.newSalary
														}
														onChange={(e) =>
															handleNewSalaryAdjustmentChange(
																"newSalary",
																e.target.value
															)
														}
														className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
													/>
												</div>
												<button
													type="button"
													onClick={
														handleAddSalaryAdjustment
													}
													className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center md:col-span-3"
												>
													<svg
														className="w-4 h-4 mr-1"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2"
															d="M12 6v6m0 0v6m0-6h6m-6 0H6"
														/>
													</svg>
													Add Salary Adjustment
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Yearly Bonuses Section - NEW */}
							<div className="mb-6">
								<h3 className="text-lg font-semibold mb-4 text-green-700 border-b pb-2">
									Yearly Bonuses
								</h3>

								{/* Existing Yearly Bonuses */}
								{formData.yearlyBonuses &&
								formData.yearlyBonuses.length > 0 ? (
									<div className="mb-4 overflow-x-auto">
										<table className="w-full border-collapse">
											<thead>
												<tr className="bg-gray-50">
													<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Date
													</th>
													<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Description
													</th>
													<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Amount (SGD)
													</th>
													<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Actions
													</th>
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{formData.yearlyBonuses.map(
													(bonus, index) => (
														<tr
															key={bonus.id}
															className="hover:bg-gray-50"
														>
															<td className="px-4 py-2">
																<div className="flex space-x-2">
																	<select
																		value={
																			bonus.month
																		}
																		onChange={(
																			e
																		) =>
																			handleYearlyBonusChange(
																				index,
																				"month",
																				parseInt(
																					e
																						.target
																						.value
																				)
																			)
																		}
																		className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
																	>
																		{monthOptions.map(
																			(
																				month
																			) => (
																				<option
																					key={
																						month.value
																					}
																					value={
																						month.value
																					}
																				>
																					{
																						month.label
																					}
																				</option>
																			)
																		)}
																	</select>
																	<select
																		value={
																			bonus.year
																		}
																		onChange={(
																			e
																		) =>
																			handleYearlyBonusChange(
																				index,
																				"year",
																				parseInt(
																					e
																						.target
																						.value
																				)
																			)
																		}
																		className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
																	>
																		{yearOptions.map(
																			(
																				year
																			) => (
																				<option
																					key={
																						year
																					}
																					value={
																						year
																					}
																				>
																					{
																						year
																					}
																				</option>
																			)
																		)}
																	</select>
																</div>
															</td>
															<td className="px-4 py-2 whitespace-nowrap">
																<input
																	type="text"
																	value={
																		bonus.description
																	}
																	onChange={(
																		e
																	) =>
																		handleYearlyBonusChange(
																			index,
																			"description",
																			e
																				.target
																				.value
																		)
																	}
																	className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
																/>
															</td>
															<td className="px-4 py-2 whitespace-nowrap">
																<div className="relative">
																	<div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
																		<span className="text-gray-500">
																			$
																		</span>
																	</div>
																	<input
																		type="text"
																		value={
																			bonus.amount
																		}
																		onChange={(
																			e
																		) =>
																			handleYearlyBonusChange(
																				index,
																				"amount",
																				e
																					.target
																					.value
																			)
																		}
																		className="w-full pl-6 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
																	/>
																</div>
															</td>
															<td className="px-4 py-2">
																<button
																	type="button"
																	onClick={() =>
																		handleRemoveYearlyBonus(
																			bonus.id
																		)
																	}
																	className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
																>
																	<span className="md:hidden">
																		✕
																	</span>
																	<span className="hidden md:inline">
																		Remove
																	</span>
																</button>
															</td>
														</tr>
													)
												)}
											</tbody>
										</table>
									</div>
								) : (
									<p className="text-sm text-gray-600 mb-4">
										No yearly bonuses added yet.
									</p>
								)}

								{/* Add New Yearly Bonus */}
								<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
									<h5 className="font-medium text-gray-700 mb-3">
										Add New Yearly Bonus
									</h5>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
										<div className="grid grid-cols-2 gap-2 md:col-span-2">
											<select
												value={
													formData.newYearlyBonus
														.month
												}
												onChange={(e) =>
													handleNewYearlyBonusChange(
														"month",
														parseInt(e.target.value)
													)
												}
												className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
											>
												{monthOptions.map((month) => (
													<option
														key={month.value}
														value={month.value}
													>
														{month.label}
													</option>
												))}
											</select>
											<select
												value={
													formData.newYearlyBonus.year
												}
												onChange={(e) =>
													handleNewYearlyBonusChange(
														"year",
														parseInt(e.target.value)
													)
												}
												className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
											>
												{yearOptions.map((year) => (
													<option
														key={year}
														value={year}
													>
														{year}
													</option>
												))}
											</select>
										</div>
										<div className="relative md:col-span-3">
											<input
												type="text"
												placeholder="Bonus Description"
												value={
													formData.newYearlyBonus
														.description
												}
												onChange={(e) =>
													handleNewYearlyBonusChange(
														"description",
														e.target.value
													)
												}
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors mb-3"
											/>
										</div>
										<div className="relative md:col-span-3">
											<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
												<span className="text-gray-500">
													$
												</span>
											</div>
											<input
												type="text"
												placeholder="Bonus Amount"
												value={
													formData.newYearlyBonus
														.amount
												}
												onChange={(e) =>
													handleNewYearlyBonusChange(
														"amount",
														e.target.value
													)
												}
												className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors mb-3"
											/>
										</div>
										<button
											type="button"
											onClick={handleAddYearlyBonus}
											className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center md:col-span-3"
										>
											<svg
												className="w-4 h-4 mr-1"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M12 6v6m0 0v6m0-6h6m-6 0H6"
												/>
											</svg>
											Add Yearly Bonus
										</button>
									</div>
								</div>
							</div>

							{/* CPF Section */}
							<div>
								<h3 className="text-lg font-semibold mb-4 text-purple-700 border-b pb-2">
									CPF Information
								</h3>

								<div className="mb-6 bg-purple-50 p-4 rounded-lg">
									<h4 className="font-medium text-purple-800 mb-3">
										About CPF Accounts
									</h4>
									<p className="text-sm text-gray-700 mb-2">
										Your CPF consists of three main
										accounts:
									</p>
									<ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
										<li>
											<span className="font-medium">
												Ordinary Account (OA)
											</span>{" "}
											- Used for housing, education,
											investment, and insurance.
										</li>
										<li>
											<span className="font-medium">
												Special Account (SA)
											</span>{" "}
											- For retirement-related financial
											products and investments.
										</li>
										<li>
											<span className="font-medium">
												MediSave Account (MA)
											</span>{" "}
											- For healthcare expenses and
											approved medical insurance.
										</li>
									</ul>
									<p className="text-sm text-gray-700 mt-3">
										For simplicity, this dashboard tracks
										your total CPF balance as a single
										amount. Monthly contributions from you
										and your employer will be added to this
										total.
									</p>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{/* Current CPF Balance input - simple version */}
									<div className="mb-4">
										<label className="block text-gray-700 font-medium mb-2">
											Current CPF Balance (SGD)
										</label>
										<div className="relative">
											<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
												<span className="text-gray-500">
													$
												</span>
											</div>
											<input
												type="text"
												value={
													formData.personalInfo
														.currentCpfBalance
												}
												onChange={(e) => {
													const updatedData = {
														...formData,
													};
													updatedData.personalInfo.currentCpfBalance =
														e.target.value;
													setFormData(updatedData);
												}}
												className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
											/>
										</div>
									</div>

									<div className="mb-4">
										{/* CPF Rate input - simple version */}
										<label className="block text-gray-700 font-medium mb-2">
											Your Monthly CPF Contribution (%)
										</label>
										<div className="relative">
											<input
												type="text"
												value={formData.income.cpfRate}
												onChange={(e) => {
													const updatedData = {
														...formData,
													};
													updatedData.income.cpfRate =
														e.target.value;
													setFormData(updatedData);
												}}
												className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
											/>
											<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
												<span className="text-gray-500">
													%
												</span>
											</div>
										</div>
										<p className="text-xs text-gray-500 mt-1">
											Standard employee contribution rate
											is 20%
										</p>
									</div>

									<div className="mb-4">
										{/* Employer CPF Rate input - simple version */}
										<label className="block text-gray-700 font-medium mb-2">
											Employer CPF Contribution (%)
										</label>
										<div className="relative">
											<input
												type="text"
												value={
													formData.income
														.employerCpfRate
												}
												onChange={(e) => {
													const updatedData = {
														...formData,
													};
													updatedData.income.employerCpfRate =
														e.target.value;
													setFormData(updatedData);
												}}
												className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
											/>
											<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
												<span className="text-gray-500">
													%
												</span>
											</div>
										</div>
										<p className="text-xs text-gray-500 mt-1">
											Standard employer contribution rate
											is 17%
										</p>
									</div>

									{/* Salary Day input */}
									<div className="mb-4">
										<label className="block text-gray-700 font-medium mb-2">
											Salary Payment Day
										</label>
										<select
											value={formData.income.salaryDay}
											onChange={(e) => {
												const updatedData = { ...formData };
												updatedData.income.salaryDay = e.target.value;
												setFormData(updatedData);
											}}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
										>
											{[...Array(31)].map((_, i) => {
												const day = i + 1;
												return (
													<option key={day} value={day}>
														{day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of the month
													</option>
												);
											})}
										</select>
										<p className="text-xs text-gray-500 mt-1">
											Day of month when you typically receive your salary
										</p>
									</div>

									<div className="md:col-span-2">
										<div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
											<div className="flex items-start">
												<svg
													className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth="2"
														d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
													></path>
												</svg>
												<p className="text-sm text-blue-700">
													Your CPF balance is
													considered part of your net
													worth in projections, but is
													shown separately since it
													can only be used for
													specific purposes and is not
													available as cash.
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Monthly Expenses Section */}
				<div className="mb-8 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
					<SectionHeader
						title="Monthly Expenses"
						section="expenses"
						icon={
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
								/>
							</svg>
						}
					/>

					{activeSection === "expenses" && (
						<div className="p-6 bg-white">
							{/* Existing expenses list */}
							<div className="mb-4 overflow-x-auto">
								<table className="w-full border-collapse">
									<thead>
										<tr className="bg-gray-50">
											<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Category
											</th>
											<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Amount (SGD)
											</th>
											<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Due Day
											</th>
											<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{formData.expenses.map(
											(expense, index) => (
												<tr
													key={expense.id}
													className="hover:bg-gray-50"
												>
													<td className="px-4 py-2">
														<input
															type="text"
															value={expense.name}
															onChange={(e) =>
																handleExpenseChange(
																	index,
																	"name",
																	e.target
																		.value
																)
															}
															className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
														/>
													</td>
													<td className="px-4 py-2 whitespace-nowrap">
														<div className="relative">
															<div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
																<span className="text-gray-500">
																	$
																</span>
															</div>
															<input
																type="text"
																value={
																	expense.amount
																}
																onChange={(e) =>
																	handleExpenseChange(
																		index,
																		"amount",
																		e.target
																			.value
																	)
																}
																className="w-full pl-6 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
															/>
														</div>
													</td>
													<td className="px-4 py-2 whitespace-nowrap">
														<select
															value={expense.dueDay}
															onChange={(e) =>
																handleExpenseChange(
																	index,
																	"dueDay",
																	e.target.value
																)
															}
															className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
														>
															{[...Array(31)].map((_, i) => {
																const day = i + 1;
																return (
																	<option key={day} value={day}>
																		{day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'}
																	</option>
																);
															})}
														</select>
													</td>
													<td className="px-4 py-2">
														<button
															type="button"
															onClick={() =>
																handleRemoveExpense(
																	expense.id
																)
															}
															className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
														>
															<span className="md:hidden">
																✕
															</span>
															<span className="hidden md:inline">
																Remove
															</span>
														</button>
													</td>
												</tr>
											)
										)}
									</tbody>
									<tfoot>
										<tr className="bg-blue-50 font-medium">
											<td className="px-4 py-2 text-blue-700">
												Total
											</td>
											<td className="px-4 py-2 text-blue-700">
												${" "}
												{formData.expenses
													.reduce(
														(sum, expense) =>
															sum +
															(parseFloat(
																expense.amount
															) || 0),
														0
													)
													.toFixed(2)}
											</td>
											<td></td>
										</tr>
									</tfoot>
								</table>
							</div>

							{/* Add new expense form */}
							<div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
								<h3 className="font-medium text-gray-700 mb-3">
									Add New Expense Category
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-4 gap-3">
									<input
										type="text"
										name="name"
										value={formData.newExpense.name}
										onChange={handleNewExpenseChange}
										placeholder="Category Name"
										className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
									/>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<span className="text-gray-500">
												$
											</span>
										</div>
										<input
											type="text"
											name="amount"
											value={formData.newExpense.amount}
											onChange={handleNewExpenseChange}
											placeholder="Amount"
											className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
										/>
									</div>
									<select
										name="dueDay"
										value={formData.newExpense.dueDay}
										onChange={handleNewExpenseChange}
										className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
									>
										{[...Array(31)].map((_, i) => {
											const day = i + 1;
											return (
												<option key={day} value={day}>
													{day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of month
												</option>
											);
										})}
									</select>
									<button
										type="button"
										onClick={handleAddExpense}
										className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
									>
										<svg
											className="w-4 h-4 mr-1"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M12 6v6m0 0v6m0-6h6m-6 0H6"
											/>
										</svg>
										Add Category
									</button>
								</div>

								{/* Upcoming One-Time Spending */}
								<div className="mt-8">
									<h4 className="text-lg font-semibold mb-4 text-purple-700 border-b border-purple-200 pb-2">
										Upcoming One-Time Spending
									</h4>
									<p className="text-sm text-gray-600 mb-4">
										Plan future one-time purchases and see their impact on your finances.
									</p>

									{/* Existing Upcoming Spending */}
									{formData.upcomingSpending &&
									formData.upcomingSpending.length > 0 ? (
										<div className="mb-4 overflow-x-auto">
											<table className="w-full border-collapse">
												<thead>
													<tr className="bg-gray-50">
														<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
															Date
														</th>
														<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
															Name
														</th>
														<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
															Description
														</th>
														<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
															Amount (SGD)
														</th>
														<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
															Actions
														</th>
													</tr>
												</thead>
												<tbody className="bg-white divide-y divide-gray-200">
													{formData.upcomingSpending.map(
														(spending, index) => (
															<tr
																key={spending.id}
																className="hover:bg-gray-50"
															>
																<td className="px-4 py-2">
																	<div className="grid grid-cols-3 gap-1 text-xs">
																		<select
																			value={
																				spending.day
																			}
																			onChange={(
																				e
																			) =>
																				handleUpcomingSpendingChange(
																					index,
																					"day",
																					e
																						.target
																						.value
																				)
																			}
																			className="w-full px-1 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-colors"
																		>
																			{Array.from(
																				{
																					length: 31,
																				},
																				(
																					_,
																					i
																				) => (
																					<option
																						key={
																							i +
																							1
																						}
																						value={
																							i +
																							1
																						}
																					>
																						{i +
																							1}
																					</option>
																				)
																			)}
																		</select>
																		<select
																			value={
																				spending.month
																			}
																			onChange={(
																				e
																			) =>
																				handleUpcomingSpendingChange(
																					index,
																					"month",
																					parseInt(
																						e
																							.target
																							.value
																					)
																				)
																			}
																			className="w-full px-1 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-colors"
																		>
																			{monthOptions.map(
																				(
																					month
																				) => (
																					<option
																						key={
																							month.value
																						}
																						value={
																							month.value
																						}
																					>
																						{month.label.substring(
																							0,
																							3
																						)}
																					</option>
																				)
																			)}
																		</select>
																		<select
																			value={
																				spending.year
																			}
																			onChange={(
																				e
																			) =>
																				handleUpcomingSpendingChange(
																					index,
																					"year",
																					parseInt(
																						e
																							.target
																							.value
																					)
																				)
																			}
																			className="w-full px-1 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-colors"
																		>
																			{yearOptions.map(
																				(
																					year
																				) => (
																					<option
																						key={
																							year
																						}
																						value={
																							year
																						}
																					>
																						{year}
																					</option>
																				)
																			)}
																		</select>
																	</div>
																</td>
																<td className="px-4 py-2">
																	<input
																		type="text"
																		value={
																			spending.name
																		}
																		onChange={(
																			e
																		) =>
																			handleUpcomingSpendingChange(
																				index,
																				"name",
																				e
																					.target
																					.value
																			)
																		}
																		className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-colors"
																	/>
																</td>
																<td className="px-4 py-2">
																	<input
																		type="text"
																		value={
																			spending.description
																		}
																		onChange={(
																			e
																		) =>
																			handleUpcomingSpendingChange(
																				index,
																				"description",
																				e
																					.target
																					.value
																			)
																		}
																		className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-colors"
																	/>
																</td>
																<td className="px-4 py-2">
																	<div className="relative">
																		<span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
																			$
																		</span>
																		<input
																			type="number"
																			step="0.01"
																			min="0"
																			value={
																				spending.amount
																			}
																			onChange={(
																				e
																			) =>
																				handleUpcomingSpendingChange(
																					index,
																					"amount",
																					e
																						.target
																						.value
																				)
																			}
																			className="w-full pl-6 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-colors"
																		/>
																	</div>
																</td>
																<td className="px-4 py-2">
																	<button
																		type="button"
																		onClick={() =>
																			handleRemoveUpcomingSpending(
																				spending.id
																			)
																		}
																		className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
																	>
																		<span className="md:hidden">
																			✕
																		</span>
																		<span className="hidden md:inline">
																			Remove
																		</span>
																	</button>
																</td>
															</tr>
														)
													)}
												</tbody>
											</table>
										</div>
									) : (
										<p className="text-sm text-gray-600 mb-4">
											No upcoming spending planned yet.
										</p>
									)}

									{/* Add New Upcoming Spending */}
									<div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
										<h5 className="font-medium text-purple-700 mb-3">
											Add New One-Time Spending
										</h5>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Item Name *
												</label>
												<input
													type="text"
													value={
														formData.newUpcomingSpending
															.name
													}
													onChange={(e) =>
														handleNewUpcomingSpendingChange(
															"name",
															e.target.value
														)
													}
													placeholder="e.g., New Laptop"
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Amount (SGD) *
												</label>
												<div className="relative">
													<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
														$
													</span>
													<input
														type="number"
														step="0.01"
														min="0"
														value={
															formData
																.newUpcomingSpending
																.amount
														}
														onChange={(e) =>
															handleNewUpcomingSpendingChange(
																"amount",
																e.target.value
															)
														}
														placeholder="2000"
														className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
													/>
												</div>
											</div>
											<div className="grid grid-cols-3 gap-2">
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1">
														Day
													</label>
													<select
														value={
															formData
																.newUpcomingSpending
																.day
														}
														onChange={(e) =>
															handleNewUpcomingSpendingChange(
																"day",
																e.target.value
															)
														}
														className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
													>
														{Array.from(
															{ length: 31 },
															(_, i) => (
																<option
																	key={i + 1}
																	value={i + 1}
																>
																	{i + 1}
																</option>
															)
														)}
													</select>
												</div>
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1">
														Month *
													</label>
													<select
														value={
															formData
																.newUpcomingSpending
																.month
														}
														onChange={(e) =>
															handleNewUpcomingSpendingChange(
																"month",
																parseInt(
																	e.target.value
																)
															)
														}
														className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
													>
														{monthOptions.map(
															(month) => (
																<option
																	key={
																		month.value
																	}
																	value={
																		month.value
																	}
																>
																	{month.label}
																</option>
															)
														)}
													</select>
												</div>
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1">
														Year *
													</label>
													<select
														value={
															formData
																.newUpcomingSpending
																.year
														}
														onChange={(e) =>
															handleNewUpcomingSpendingChange(
																"year",
																parseInt(
																	e.target.value
																)
															)
														}
														className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
													>
														{yearOptions.map((year) => (
															<option
																key={year}
																value={year}
															>
																{year}
															</option>
														))}
													</select>
												</div>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Description
												</label>
												<input
													type="text"
													value={
														formData.newUpcomingSpending
															.description
													}
													onChange={(e) =>
														handleNewUpcomingSpendingChange(
															"description",
															e.target.value
														)
													}
													placeholder="Optional details"
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
												/>
											</div>
											<button
												type="button"
												onClick={handleAddUpcomingSpending}
												className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center md:col-span-2"
											>
												<svg
													className="w-4 h-4 mr-1"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth="2"
														d="M12 6v6m0 0v6m0-6h6m-6 0H6"
													/>
												</svg>
												Add One-Time Spending
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

				<div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-8 pt-6 border-t border-gray-200">
					<button
						type="button"
						onClick={() => navigate("/")}
						className="px-6 py-3 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors font-medium"
					>
						Cancel
					</button>
					<button
						type="submit"
						className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
					>
						<svg
							className="w-4 h-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
						Save Changes
					</button>
				</div>
			</form>
		</div>
	);
};

export default EditParameters;
