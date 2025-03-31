import React, { useContext, useState } from "react";
import { FinancialContext } from "../context/FinancialContext";
import { useNavigate } from "react-router-dom";

const EditParameters = () => {
	const {
		financialData,
		updateFinancialData,
		addExpense,
		removeExpense,
		updateExpense,
		getMonthName,
		calculateAge,
	} = useContext(FinancialContext);

	const navigate = useNavigate();

	// Create a state copy of the financial data for the form
	const [formData, setFormData] = useState({
		personalInfo: { ...financialData.personalInfo },
		income: { ...financialData.income },
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
				[name]: parseFloat(value) || 0,
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
				[name]:
					name === "salaryAdjustmentMonth" ||
					name === "salaryAdjustmentYear"
						? parseInt(value) || 0
						: parseFloat(value) || 0,
			},
		}));
	};

	// Handle expense field changes
	const handleExpenseChange = (id, field, value) => {
		if (field === "amount") {
			value = parseFloat(value) || 0;
		}
		updateExpense(id, { [field]: value });
	};

	// Handle form submission
	const handleSubmit = (e) => {
		e.preventDefault();
		updateFinancialData(formData);
		navigate("/");
	};

	// Handle adding a new expense
	const handleAddExpense = (e) => {
		e.preventDefault();
		if (newExpense.name.trim() && newExpense.amount) {
			addExpense(newExpense.name.trim(), newExpense.amount);
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

	// Create form input field with label
	const FormField = ({
		label,
		name,
		value,
		onChange,
		type = "text",
		step = "0.01",
	}) => (
		<div className="mb-4">
			<label
				htmlFor={name}
				className="block text-gray-700 font-medium mb-2"
			>
				{label}
			</label>
			<input
				type={type}
				id={name}
				name={name}
				value={value}
				onChange={onChange}
				step={step}
				className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
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

						<FormField
							label="Current Savings (SGD)"
							name="currentSavings"
							value={formData.personalInfo.currentSavings}
							onChange={handlePersonalInfoChange}
							type="number"
						/>

						<FormField
							label="Remaining Loan (SGD)"
							name="remainingLoan"
							value={formData.personalInfo.remainingLoan}
							onChange={handlePersonalInfoChange}
							type="number"
						/>

						<FormField
							label="Loan Interest Rate (%)"
							name="interestRate"
							value={formData.personalInfo.interestRate}
							onChange={handlePersonalInfoChange}
							type="number"
							step="0.01"
						/>

						<FormField
							label="Monthly Loan Repayment (SGD)"
							name="monthlyRepayment"
							value={formData.personalInfo.monthlyRepayment}
							onChange={handlePersonalInfoChange}
							type="number"
						/>
					</div>
				</div>

				<div className="bg-blue-50 p-4 rounded-md mb-6">
					<h2 className="text-xl font-semibold mb-4 text-blue-700">
						Income Parameters
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							label="Current Monthly Salary (SGD)"
							name="currentSalary"
							value={formData.income.currentSalary}
							onChange={handleIncomeChange}
							type="number"
						/>

						<FormField
							label="Future Monthly Salary (SGD)"
							name="futureSalary"
							value={formData.income.futureSalary}
							onChange={handleIncomeChange}
							type="number"
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

						<FormField
							label="Salary Adjustment Year"
							name="salaryAdjustmentYear"
							value={formData.income.salaryAdjustmentYear}
							onChange={handleIncomeChange}
							type="number"
							step="1"
						/>

						<FormField
							label="CPF Contribution Rate (%)"
							name="cpfRate"
							value={formData.income.cpfRate}
							onChange={handleIncomeChange}
							type="number"
							step="0.1"
						/>

						<FormField
							label="Employer CPF Contribution Rate (%)"
							name="employerCpfRate"
							value={formData.income.employerCpfRate}
							onChange={handleIncomeChange}
							type="number"
							step="0.1"
						/>
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
								{financialData.expenses.map((expense) => (
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
														expense.id,
														"name",
														e.target.value
													)
												}
												className="w-full px-2 py-1 border border-gray-300 rounded"
											/>
										</td>
										<td className="px-4 py-2">
											<input
												type="number"
												value={expense.amount}
												onChange={(e) =>
													handleExpenseChange(
														expense.id,
														"amount",
														e.target.value
													)
												}
												step="0.01"
												className="w-full px-2 py-1 border border-gray-300 rounded"
											/>
										</td>
										<td className="px-4 py-2">
											<button
												type="button"
												onClick={() =>
													removeExpense(expense.id)
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
										{financialData.expenses
											.reduce(
												(sum, expense) =>
													sum + expense.amount,
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
								type="number"
								name="amount"
								value={newExpense.amount}
								onChange={handleNewExpenseChange}
								placeholder="Amount (SGD)"
								step="0.01"
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
