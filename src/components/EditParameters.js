import React, { useContext, useState } from "react";
import { FinancialContext } from "../context/FinancialContext";
import { useNavigate } from "react-router-dom";

const EditParameters = () => {
	const { financialData, updateFinancialData } = useContext(FinancialContext);
	const navigate = useNavigate();

	// Create a state copy of the financial data for the form
	const [formData, setFormData] = useState({
		personalInfo: { ...financialData.personalInfo },
		income: { ...financialData.income },
		expenses: { ...financialData.expenses },
	});

	// Handle form input changes
	const handlePersonalInfoChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			personalInfo: {
				...prev.personalInfo,
				[name]:
					name === "birthday" ||
					name === "currentAge" ||
					name === "employmentStart" ||
					name === "projectionStart"
						? value
						: parseFloat(value) || 0,
			},
		}));
	};

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

	const handleExpensesChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			expenses: {
				...prev.expenses,
				[name]: parseFloat(value) || 0,
			},
		}));
	};

	// Handle form submission
	const handleSubmit = (e) => {
		e.preventDefault();
		updateFinancialData(formData);
		navigate("/");
	};

	// Create form input field with label
	const FormField = ({
		label,
		name,
		value,
		onChange,
		type = "text",
		step = "0.01",
		section,
	}) => {
		const handleChange = (e) => {
			switch (section) {
				case "personalInfo":
					handlePersonalInfoChange(e);
					break;
				case "income":
					handleIncomeChange(e);
					break;
				case "expenses":
					handleExpensesChange(e);
					break;
				default:
					break;
			}
		};

		return (
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
					onChange={handleChange}
					step={step}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>
		);
	};

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
						<FormField
							label="Birthday"
							name="birthday"
							value={formData.personalInfo.birthday}
							section="personalInfo"
						/>
						<FormField
							label="Current Age"
							name="currentAge"
							value={formData.personalInfo.currentAge}
							section="personalInfo"
						/>
						<FormField
							label="Employment Start"
							name="employmentStart"
							value={formData.personalInfo.employmentStart}
							section="personalInfo"
						/>
						<FormField
							label="Projection Start"
							name="projectionStart"
							value={formData.personalInfo.projectionStart}
							section="personalInfo"
						/>
						<FormField
							label="Current Savings (SGD)"
							name="currentSavings"
							value={formData.personalInfo.currentSavings}
							section="personalInfo"
							type="number"
						/>
						<FormField
							label="Remaining Loan (SGD)"
							name="remainingLoan"
							value={formData.personalInfo.remainingLoan}
							section="personalInfo"
							type="number"
						/>
						<FormField
							label="Loan Interest Rate (%)"
							name="interestRate"
							value={formData.personalInfo.interestRate}
							section="personalInfo"
							type="number"
							step="0.01"
						/>
						<FormField
							label="Monthly Loan Repayment (SGD)"
							name="monthlyRepayment"
							value={formData.personalInfo.monthlyRepayment}
							section="personalInfo"
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
							section="income"
							type="number"
						/>
						<FormField
							label="Future Monthly Salary (SGD)"
							name="futureSalary"
							value={formData.income.futureSalary}
							section="income"
							type="number"
						/>
						<FormField
							label="Salary Adjustment Month (1-12)"
							name="salaryAdjustmentMonth"
							value={formData.income.salaryAdjustmentMonth}
							section="income"
							type="number"
							step="1"
						/>
						<FormField
							label="Salary Adjustment Year"
							name="salaryAdjustmentYear"
							value={formData.income.salaryAdjustmentYear}
							section="income"
							type="number"
							step="1"
						/>
						<FormField
							label="CPF Contribution Rate (%)"
							name="cpfRate"
							value={formData.income.cpfRate}
							section="income"
							type="number"
							step="0.1"
						/>
						<FormField
							label="Employer CPF Contribution Rate (%)"
							name="employerCpfRate"
							value={formData.income.employerCpfRate}
							section="income"
							type="number"
							step="0.1"
						/>
					</div>
				</div>

				<div className="bg-blue-50 p-4 rounded-md mb-6">
					<h2 className="text-xl font-semibold mb-4 text-blue-700">
						Monthly Expenses
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							label="Rental (SGD)"
							name="rental"
							value={formData.expenses.rental}
							section="expenses"
							type="number"
						/>
						<FormField
							label="Food (SGD)"
							name="food"
							value={formData.expenses.food}
							section="expenses"
							type="number"
						/>
						<FormField
							label="Transportation (SGD)"
							name="transportation"
							value={formData.expenses.transportation}
							section="expenses"
							type="number"
						/>
						<FormField
							label="Entertainment (SGD)"
							name="entertainment"
							value={formData.expenses.entertainment}
							section="expenses"
							type="number"
						/>
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
