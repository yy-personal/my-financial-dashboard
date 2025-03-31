import React, { useContext, useState } from "react";
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

	// Create a local form state for all form fields
	const [formData, setFormData] = useState({
		personalInfo: {
			...financialData.personalInfo,
			currentSavings: String(financialData.personalInfo.currentSavings),
			remainingLoan: String(financialData.personalInfo.remainingLoan),
			interestRate: String(financialData.personalInfo.interestRate),
			monthlyRepayment: String(
				financialData.personalInfo.monthlyRepayment
			),
		},
		income: {
			...financialData.income,
			currentSalary: String(financialData.income.currentSalary),
			futureSalary: String(financialData.income.futureSalary),
			cpfRate: String(financialData.income.cpfRate),
			employerCpfRate: String(financialData.income.employerCpfRate),
		},
	});

	// State for new expense
	const [newExpense, setNewExpense] = useState({ name: "", amount: "" });

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

	// Handle form input changes for personal info
	const handlePersonalInfoChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			personalInfo: {
				...prev.personalInfo,
				[name]: value,
			},
		}));
	};

	// Handle date changes (birthday, employmentStart, projectionStart)
	const handleDateChange = (dateType, field, value) => {
		setFormData((prev) => ({
			...prev,
			personalInfo: {
				...prev.personalInfo,
				[dateType]: {
					...prev.personalInfo[dateType],
					[field]: parseInt(value) || 0,
				},
			},
		}));
	};

	// Handle form input changes for income
	const handleIncomeChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			income: {
				...prev.income,
				[name]: value,
			},
		}));
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

		// Create a copy of the form data for processing
		const processedData = {
			personalInfo: { ...formData.personalInfo },
			income: { ...formData.income },
		};

		// Convert numeric string values to actual numbers
		const numericFields = [
			"currentSavings",
			"remainingLoan",
			"interestRate",
			"monthlyRepayment",
		];
		numericFields.forEach((field) => {
			processedData.personalInfo[field] =
				parseFloat(processedData.personalInfo[field]) || 0;
		});

		// Convert income numeric values
		const incomeNumericFields = [
			"currentSalary",
			"futureSalary",
			"cpfRate",
			"employerCpfRate",
		];
		incomeNumericFields.forEach((field) => {
			processedData.income[field] =
				parseFloat(processedData.income[field]) || 0;
		});

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

	// Create a date dropdown component
	const DateDropdowns = ({ dateType, label }) => (
		<div className="mb-4">
			<label className="block text-gray-700 font-medium mb-2">
				{label}
			</label>
			<div className="grid grid-cols-2 gap-2">
				<div>
					<select
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

	return (
		<div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold mb-6 text-blue-700">
				Edit Financial Parameters
			</h1>

			<form onSubmit={handleSubmit}>
				<div className="bg-blue-50 p-4 rounded-md mb-6">
					<h2 className="text-xl font-semibold mb-4 text-blue-700">
						Personal Information
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<DateDropdowns dateType="birthday" label="Birthday" />

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

						<div className="mb-4">
							<label
								htmlFor="currentSavings"
								className="block text-gray-700 font-medium mb-2"
							>
								Current Savings (SGD)
							</label>
							<input
								type="text"
								id="currentSavings"
								name="currentSavings"
								value={formData.personalInfo.currentSavings}
								onChange={handlePersonalInfoChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div className="mb-4">
							<label
								htmlFor="remainingLoan"
								className="block text-gray-700 font-medium mb-2"
							>
								Remaining Loan (SGD)
							</label>
							<input
								type="text"
								id="remainingLoan"
								name="remainingLoan"
								value={formData.personalInfo.remainingLoan}
								onChange={handlePersonalInfoChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div className="mb-4">
							<label
								htmlFor="interestRate"
								className="block text-gray-700 font-medium mb-2"
							>
								Loan Interest Rate (%)
							</label>
							<input
								type="text"
								id="interestRate"
								name="interestRate"
								value={formData.personalInfo.interestRate}
								onChange={handlePersonalInfoChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div className="mb-4">
							<label
								htmlFor="monthlyRepayment"
								className="block text-gray-700 font-medium mb-2"
							>
								Monthly Loan Repayment (SGD)
							</label>
							<input
								type="text"
								id="monthlyRepayment"
								name="monthlyRepayment"
								value={formData.personalInfo.monthlyRepayment}
								onChange={handlePersonalInfoChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>
				</div>

				<div className="bg-blue-50 p-4 rounded-md mb-6">
					<h2 className="text-xl font-semibold mb-4 text-blue-700">
						Income Parameters
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="mb-4">
							<label
								htmlFor="currentSalary"
								className="block text-gray-700 font-medium mb-2"
							>
								Current Monthly Salary (SGD)
							</label>
							<input
								type="text"
								id="currentSalary"
								name="currentSalary"
								value={formData.income.currentSalary}
								onChange={handleIncomeChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div className="mb-4">
							<label
								htmlFor="futureSalary"
								className="block text-gray-700 font-medium mb-2"
							>
								Future Monthly Salary (SGD)
							</label>
							<input
								type="text"
								id="futureSalary"
								name="futureSalary"
								value={formData.income.futureSalary}
								onChange={handleIncomeChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

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
								value={formData.income.salaryAdjustmentMonth}
								onChange={handleIncomeChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
								value={formData.income.salaryAdjustmentYear}
								onChange={handleIncomeChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								{yearOptions.map((year) => (
									<option key={year} value={year}>
										{year}
									</option>
								))}
							</select>
						</div>

						<div className="mb-4">
							<label
								htmlFor="cpfRate"
								className="block text-gray-700 font-medium mb-2"
							>
								CPF Contribution Rate (%)
							</label>
							<input
								type="text"
								id="cpfRate"
								name="cpfRate"
								value={formData.income.cpfRate}
								onChange={handleIncomeChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div className="mb-4">
							<label
								htmlFor="employerCpfRate"
								className="block text-gray-700 font-medium mb-2"
							>
								Employer CPF Contribution Rate (%)
							</label>
							<input
								type="text"
								id="employerCpfRate"
								name="employerCpfRate"
								value={formData.income.employerCpfRate}
								onChange={handleIncomeChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>
				</div>

				<div className="bg-blue-50 p-4 rounded-md mb-6">
					<h2 className="text-xl font-semibold mb-4 text-blue-700">
						Monthly Expenses
					</h2>

					{/* Existing expenses list */}
					<div className="mb-4">
						<table className="w-full border-collapse">
							<thead>
								<tr className="bg-blue-100">
									<th className="px-4 py-2 text-left">
										Category
									</th>
									<th className="px-4 py-2 text-left">
										Amount (SGD)
									</th>
									<th className="px-4 py-2 text-left">
										Actions
									</th>
								</tr>
							</thead>
							<tbody>
								{expenses.map((expense, index) => (
									<tr
										key={expense.id}
										className="border-b hover:bg-gray-50"
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
												className="w-full px-2 py-1 border border-gray-300 rounded"
											/>
										</td>
										<td className="px-4 py-2">
											<input
												type="text"
												value={expense.amount}
												onChange={(e) =>
													handleExpenseChange(
														index,
														"amount",
														e.target.value
													)
												}
												className="w-full px-2 py-1 border border-gray-300 rounded"
											/>
										</td>
										<td className="px-4 py-2">
											<button
												type="button"
												onClick={() =>
													handleRemoveExpense(
														expense.id
													)
												}
												className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
											>
												Remove
											</button>
										</td>
									</tr>
								))}
							</tbody>
							<tfoot>
								<tr className="bg-gray-100 font-bold">
									<td className="px-4 py-2">Total</td>
									<td className="px-4 py-2">
										SGD{" "}
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
					<div className="bg-white p-3 rounded border border-gray-200 mb-4">
						<h3 className="font-semibold mb-2">
							Add New Expense Category
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-2">
							<input
								type="text"
								name="name"
								value={newExpense.name}
								onChange={handleNewExpenseChange}
								placeholder="Category Name"
								className="px-3 py-2 border border-gray-300 rounded-md"
							/>
							<input
								type="text"
								name="amount"
								value={newExpense.amount}
								onChange={handleNewExpenseChange}
								placeholder="Amount (SGD)"
								className="px-3 py-2 border border-gray-300 rounded-md"
							/>
							<button
								type="button"
								onClick={handleAddExpense}
								className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
							>
								Add Category
							</button>
						</div>
					</div>
				</div>

				<div className="flex justify-end space-x-4">
					<button
						type="button"
						onClick={() => navigate("/")}
						className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
					>
						Cancel
					</button>
					<button
						type="submit"
						className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
					>
						Save Changes
					</button>
				</div>
			</form>
		</div>
	);
};

export default EditParameters;
