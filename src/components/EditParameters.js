import React, { useContext, useState, useRef } from "react";
import { FinancialContext } from "../context/FinancialContext";
import { useNavigate } from "react-router-dom";

const EditParameters = () => {
	const {
		financialData,
		updateFinancialData,
		addExpense,
		removeExpense,
		getMonthName,
		calculateAge,
	} = useContext(FinancialContext);

	const navigate = useNavigate();

	// Create a local state copy for ALL expenses to prevent focus issues
	const [expenses, setExpenses] = useState(
		financialData.expenses.map((expense) => ({
			...expense,
			amount: String(expense.amount),
		}))
	);

	// Create separate state variables for personal info fields to maintain focus
	const [currentSavings, setCurrentSavings] = useState(
		String(financialData.personalInfo.currentSavings)
	);
	const [currentCpfBalance, setCurrentCpfBalance] = useState(
		String(financialData.personalInfo.currentCpfBalance || 0)
	);
	const [remainingLoan, setRemainingLoan] = useState(
		String(financialData.personalInfo.remainingLoan)
	);
	const [interestRate, setInterestRate] = useState(
		String(financialData.personalInfo.interestRate)
	);
	const [monthlyRepayment, setMonthlyRepayment] = useState(
		String(financialData.personalInfo.monthlyRepayment)
	);

	// Create separate state variables for income fields to maintain focus
	const [currentSalary, setCurrentSalary] = useState(
		String(financialData.income.currentSalary)
	);
	const [futureSalary, setFutureSalary] = useState(
		String(financialData.income.futureSalary)
	);
	const [cpfRate, setCpfRate] = useState(
		String(financialData.income.cpfRate)
	);
	const [employerCpfRate, setEmployerCpfRate] = useState(
		String(financialData.income.employerCpfRate)
	);
	const [salaryAdjustmentMonth, setSalaryAdjustmentMonth] = useState(
		financialData.income.salaryAdjustmentMonth
	);
	const [salaryAdjustmentYear, setSalaryAdjustmentYear] = useState(
		financialData.income.salaryAdjustmentYear
	);

	// Create a local form state for date fields only (which don't have focus issues)
	const [dateFields, setDateFields] = useState({
		birthday: { ...financialData.personalInfo.birthday },
		employmentStart: { ...financialData.personalInfo.employmentStart },
		projectionStart: { ...financialData.personalInfo.projectionStart },
	});

	// State for new expense
	const [newExpense, setNewExpense] = useState({ name: "", amount: "" });

	// State for active section (for mobile accordion view)
	const [activeSection, setActiveSection] = useState("personal");

	// Toggle section visibility for mobile
	const toggleSection = (section) => {
		setActiveSection(activeSection === section ? "" : section);
	};

	// Generate year options for dropdowns
	const currentYear = new Date().getFullYear();
	const yearOptions = [];
	for (let year = currentYear - 50; year <= currentYear + 10; year++) {
		yearOptions.push(year);
	}

	// Generate month options
	const monthOptions = Array.from({ length: 12 }, (_, i) => ({
		value: i + 1,
		label: getMonthName(i + 1),
	}));

	// Handle date changes (birthday, employmentStart, projectionStart)
	const handleDateChange = (dateType, field, value) => {
		setDateFields((prev) => ({
			...prev,
			[dateType]: {
				...prev[dateType],
				[field]: parseInt(value) || 0,
			},
		}));
	};

	// Handle select dropdown changes for income - no focus issues with selects
	const handleSalaryAdjustmentChange = (e) => {
		const { name, value } = e.target;
		if (name === "salaryAdjustmentMonth") {
			setSalaryAdjustmentMonth(parseInt(value));
		} else if (name === "salaryAdjustmentYear") {
			setSalaryAdjustmentYear(parseInt(value));
		}
	};

	// Handle expense field changes
	const handleExpenseChange = (index, field, value) => {
		const updatedExpenses = [...expenses];
		updatedExpenses[index] = {
			...updatedExpenses[index],
			[field]: value,
		};
		setExpenses(updatedExpenses);
	};

	// Handle removing an expense
	const handleRemoveExpense = (id) => {
		setExpenses(expenses.filter((expense) => expense.id !== id));
	};

	// Handle adding a new expense
	const handleAddExpense = (e) => {
		e.preventDefault();
		if (newExpense.name.trim() && newExpense.amount) {
			const newExpenseItem = {
				id: Date.now(), // Use timestamp as a unique identifier
				name: newExpense.name.trim(),
				amount: newExpense.amount,
			};
			setExpenses([...expenses, newExpenseItem]);
			setNewExpense({ name: "", amount: "" });
		}
	};

	// Handle new expense input changes
	const handleNewExpenseChange = (e) => {
		const { name, value } = e.target;
		setNewExpense((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// Handle form submission
	const handleSubmit = (e) => {
		e.preventDefault();

		// Reconstruct the data structure expected by the context
		const processedData = {
			personalInfo: {
				...financialData.personalInfo,
				birthday: dateFields.birthday,
				employmentStart: dateFields.employmentStart,
				projectionStart: dateFields.projectionStart,
				currentSavings: parseFloat(currentSavings) || 0,
				currentCpfBalance: parseFloat(currentCpfBalance) || 0,
				remainingLoan: parseFloat(remainingLoan) || 0,
				interestRate: parseFloat(interestRate) || 0,
				monthlyRepayment: parseFloat(monthlyRepayment) || 0,
			},
			income: {
				...financialData.income,
				currentSalary: parseFloat(currentSalary) || 0,
				futureSalary: parseFloat(futureSalary) || 0,
				cpfRate: parseFloat(cpfRate) || 0,
				employerCpfRate: parseFloat(employerCpfRate) || 0,
				salaryAdjustmentMonth: salaryAdjustmentMonth,
				salaryAdjustmentYear: salaryAdjustmentYear,
			},
		};

		// Process expenses - convert amount strings to numbers
		const processedExpenses = expenses.map((expense) => ({
			...expense,
			amount: parseFloat(expense.amount) || 0,
		}));

		// Update the financial data with properly converted values
		updateFinancialData({
			...processedData,
			expenses: processedExpenses,
		});

		navigate("/");
	};

	// Create a modern form input component
	const FormInput = ({
		label,
		id,
		name,
		value,
		onChange,
		type = "text",
		placeholder = "",
		prefix = "",
		suffix = "",
		className = "",
	}) => (
		<div className={`mb-4 ${className}`}>
			<label
				htmlFor={id}
				className="block text-gray-700 font-medium mb-2"
			>
				{label}
			</label>
			<div className="relative">
				{prefix && (
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<span className="text-gray-500">{prefix}</span>
					</div>
				)}
				<input
					type={type}
					id={id}
					name={name}
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					className={`w-full px-3 py-2 ${prefix ? "pl-8" : ""} ${
						suffix ? "pr-8" : ""
					} border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
				/>
				{suffix && (
					<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
						<span className="text-gray-500">{suffix}</span>
					</div>
				)}
			</div>
		</div>
	);

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
						value={dateFields[dateType].month}
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
						value={dateFields[dateType].year}
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
		<div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
			<div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-4 rounded-t-lg">
				<h1 className="text-xl md:text-2xl font-bold">
					Edit Financial Parameters
				</h1>
				<p className="text-blue-100 mt-1">
					Customize your financial dashboard settings
				</p>
			</div>

			<form onSubmit={handleSubmit} className="p-4">
				{/* Personal Information Section */}
				<div className="mb-6 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
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
						<div className="p-4 bg-white">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

								<DateDropdowns
									dateType="employmentStart"
									label="Employment Start"
								/>

								<DateDropdowns
									dateType="projectionStart"
									label="Projection Start"
								/>

								<FormInput
									label="Current Savings (SGD)"
									id="currentSavings"
									name="currentSavings"
									value={currentSavings}
									onChange={(e) =>
										setCurrentSavings(e.target.value)
									}
									prefix="$"
								/>

								<FormInput
									label="Remaining Loan (SGD)"
									id="remainingLoan"
									name="remainingLoan"
									value={remainingLoan}
									onChange={(e) =>
										setRemainingLoan(e.target.value)
									}
									prefix="$"
								/>

								<FormInput
									label="Loan Interest Rate (%)"
									id="interestRate"
									name="interestRate"
									value={interestRate}
									onChange={(e) =>
										setInterestRate(e.target.value)
									}
									suffix="%"
								/>

								<FormInput
									label="Monthly Loan Repayment (SGD)"
									id="monthlyRepayment"
									name="monthlyRepayment"
									value={monthlyRepayment}
									onChange={(e) =>
										setMonthlyRepayment(e.target.value)
									}
									prefix="$"
								/>
							</div>
						</div>
					)}
				</div>

				{/* Combined Income & CPF Section */}
				<div className="mb-6 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
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
						<div className="p-4 bg-white">
							{/* Income Section */}
							<div className="mb-6">
								<h3 className="text-lg font-semibold mb-4 text-blue-700 border-b pb-2">
									Income Information
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormInput
										label="Current Monthly Salary (SGD)"
										id="currentSalary"
										name="currentSalary"
										value={currentSalary}
										onChange={(e) =>
											setCurrentSalary(e.target.value)
										}
										prefix="$"
									/>

									<FormInput
										label="Future Monthly Salary (SGD)"
										id="futureSalary"
										name="futureSalary"
										value={futureSalary}
										onChange={(e) =>
											setFutureSalary(e.target.value)
										}
										prefix="$"
									/>

									<div className="mb-4">
										<label
											htmlFor="salaryAdjustmentMonth"
											className="block text-gray-700 font-medium mb-2"
										>
											Salary Adjustment Month
										</label>
										<select
											id="salaryAdjustmentMonth"
											name="salaryAdjustmentMonth"
											value={salaryAdjustmentMonth}
											onChange={
												handleSalaryAdjustmentChange
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
									</div>

									<div className="mb-4">
										<label
											htmlFor="salaryAdjustmentYear"
											className="block text-gray-700 font-medium mb-2"
										>
											Salary Adjustment Year
										</label>
										<select
											id="salaryAdjustmentYear"
											name="salaryAdjustmentYear"
											value={salaryAdjustmentYear}
											onChange={
												handleSalaryAdjustmentChange
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormInput
										label="Current CPF Balance (SGD)"
										id="currentCpfBalance"
										name="currentCpfBalance"
										value={currentCpfBalance}
										onChange={(e) =>
											setCurrentCpfBalance(e.target.value)
										}
										prefix="$"
									/>

									<div className="mb-4">
										<label
											htmlFor="monthlyCPFContribution"
											className="block text-gray-700 font-medium mb-2"
										>
											Your Monthly CPF Contribution (%)
										</label>
										<div className="relative">
											<input
												type="text"
												id="monthlyCPFContribution"
												value={cpfRate}
												onChange={(e) =>
													setCpfRate(e.target.value)
												}
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
										<label
											htmlFor="employerCPFContribution"
											className="block text-gray-700 font-medium mb-2"
										>
											Employer CPF Contribution (%)
										</label>
										<div className="relative">
											<input
												type="text"
												id="employerCPFContribution"
												value={employerCpfRate}
												onChange={(e) =>
													setEmployerCpfRate(
														e.target.value
													)
												}
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
				<div className="mb-6 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
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
						<div className="p-4 bg-white">
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
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{expenses.map((expense, index) => (
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
																e.target.value
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
										))}
									</tbody>
									<tfoot>
										<tr className="bg-blue-50 font-medium">
											<td className="px-4 py-2 text-blue-700">
												Total
											</td>
											<td className="px-4 py-2 text-blue-700">
												${" "}
												{expenses
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
								<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
									<input
										type="text"
										name="name"
										value={newExpense.name}
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
											value={newExpense.amount}
											onChange={handleNewExpenseChange}
											placeholder="Amount"
											className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
										/>
									</div>
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
							</div>
						</div>
					)}
				</div>

				<div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
					<button
						type="button"
						onClick={() => navigate("/")}
						className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
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
