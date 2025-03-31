import React, { useContext, useState } from "react";
import { FinancialContext } from "../context/FinancialContext";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	AreaChart,
	Area,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
} from "recharts";

const Dashboard = () => {
	const { financialData, totalExpenses } = useContext(FinancialContext);
	const [activeTab, setActiveTab] = useState("summary");

	// Format number as currency
	const formatCurrency = (value) => {
		return new Intl.NumberFormat("en-SG", {
			style: "currency",
			currency: "SGD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	};

	// Format number as percentage
	const formatPercent = (value) => {
		return new Intl.NumberFormat("en-SG", {
			style: "percent",
			minimumFractionDigits: 1,
			maximumFractionDigits: 1,
		}).format(value);
	};

	// Get month name
	function getMonthName(monthNumber) {
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
	}

	// Calculate financial projection
	const calculateProjection = () => {
		const projection = [];

		// Extract values from context
		const { personalInfo, income, expenses } = financialData;

		// Initial values
		let currentSavings = personalInfo.currentSavings;
		let loanRemaining = personalInfo.remainingLoan;
		let cpfBalance = 0; // Starting CPF balance
		const birthYear = 1996;
		const birthMonth = 9; // September

		// Parameters
		let currentSalary = income.currentSalary;
		const salaryAdjustmentMonth = income.salaryAdjustmentMonth;
		const salaryAdjustmentYear = income.salaryAdjustmentYear;
		const newSalary = income.futureSalary;

		const cpfRate = income.cpfRate / 100;
		const employerCpfRate = income.employerCpfRate / 100;
		const monthlyExpenses = totalExpenses;
		const loanPayment = personalInfo.monthlyRepayment;
		const annualInterestRate = personalInfo.interestRate / 100;
		const monthlyInterestRate = annualInterestRate / 12;

		// Calculate months
		let startMonth = 3; // March
		let startYear = 2025;

		// Track milestones
		let loanPaidOffMonth = null;
		let savingsGoalReachedMonth = null;

		// Generate projection for 60 months (5 years)
		for (let month = 0; month < 60; month++) {
			const currentMonth = ((startMonth + month - 1) % 12) + 1;
			const currentYear =
				startYear + Math.floor((startMonth + month - 1) / 12);
			const monthYearStr = `${getMonthName(currentMonth).substring(
				0,
				3
			)} ${currentYear}`;

			// Calculate age
			let ageYears = currentYear - birthYear;
			let ageMonths = currentMonth - birthMonth;
			if (ageMonths < 0) {
				ageYears--;
				ageMonths += 12;
			}
			const ageStr = `${ageYears}y ${ageMonths}m`;

			// Update salary if adjustment month is reached
			if (
				currentMonth === salaryAdjustmentMonth &&
				currentYear === salaryAdjustmentYear
			) {
				currentSalary = newSalary;
			}

			// Calculate take-home pay
			const cpfContribution = currentSalary * cpfRate;
			const employerCpf = currentSalary * employerCpfRate;
			const takeHomePay = currentSalary - cpfContribution;

			// Calculate loan payment and remaining balance
			let actualLoanPayment = loanPayment;
			let interestForMonth = loanRemaining * monthlyInterestRate;
			let principalPayment = Math.min(
				loanRemaining,
				loanPayment - interestForMonth
			);

			if (loanRemaining <= 0) {
				interestForMonth = 0;
				principalPayment = 0;
				actualLoanPayment = 0;
				loanRemaining = 0;
			} else {
				loanRemaining = Math.max(0, loanRemaining - principalPayment);
			}

			// Record loan paid off milestone
			if (loanRemaining === 0 && loanPaidOffMonth === null) {
				loanPaidOffMonth = month;
			}

			// Calculate monthly savings
			const monthlySavings =
				takeHomePay - monthlyExpenses - actualLoanPayment;

			// Update balances
			cpfBalance += cpfContribution + employerCpf;
			currentSavings += monthlySavings;
			const totalSavings = currentSavings + cpfBalance;

			// Record savings goal milestone
			if (currentSavings >= 100000 && savingsGoalReachedMonth === null) {
				savingsGoalReachedMonth = month;
			}

			// Create data point
			projection.push({
				month: month + 1,
				date: monthYearStr,
				age: ageStr,
				monthlySalary: currentSalary,
				takeHomePay: takeHomePay,
				expenses: monthlyExpenses,
				loanPayment: actualLoanPayment,
				loanRemaining: loanRemaining,
				monthlySavings: monthlySavings,
				cpfContribution: cpfContribution + employerCpf,
				cpfBalance: cpfBalance,
				cashSavings: currentSavings,
				totalSavings: totalSavings,
				milestone:
					month === loanPaidOffMonth
						? "Loan Paid Off"
						: month === savingsGoalReachedMonth
						? "100K Savings Goal"
						: null,
			});
		}

		return {
			projection,
			loanPaidOffMonth:
				loanPaidOffMonth !== null ? projection[loanPaidOffMonth] : null,
			savingsGoalReachedMonth:
				savingsGoalReachedMonth !== null
					? projection[savingsGoalReachedMonth]
					: null,
		};
	};

	const { projection, loanPaidOffMonth, savingsGoalReachedMonth } =
		calculateProjection();

	// Expense breakdown for pie chart
	const expenseData = [
		{ name: "Rental", value: financialData.expenses.rental },
		{ name: "Food", value: financialData.expenses.food },
		{
			name: "Transportation",
			value: financialData.expenses.transportation,
		},
		{ name: "Entertainment", value: financialData.expenses.entertainment },
		{
			name: "Loan Payment",
			value: financialData.personalInfo.monthlyRepayment,
		},
	];

	// Colors for pie chart
	const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

	// Extract summary data
	const timeToPayLoan = loanPaidOffMonth
		? `${Math.floor(loanPaidOffMonth.month / 12)} years ${
				loanPaidOffMonth.month % 12
		  } months`
		: "Not within projection";

	const timeToSavingsGoal = savingsGoalReachedMonth
		? `${Math.floor(savingsGoalReachedMonth.month / 12)} years ${
				savingsGoalReachedMonth.month % 12
		  } months`
		: "Not within projection";

	// Current monthly income & expenses breakdown
	const currentSalary = financialData.income.currentSalary;
	const takeHomePay =
		currentSalary * (1 - financialData.income.cpfRate / 100);
	const monthlyExpenses = totalExpenses;
	const loanPayment = financialData.personalInfo.monthlyRepayment;
	const monthlySavings = takeHomePay - monthlyExpenses - loanPayment;
	const savingsRate = monthlySavings / takeHomePay;

	// Filtered data for charts (every 3 months)
	const chartData = projection.filter((item, index) => index % 3 === 0);

	return (
		<div className="bg-gray-50 p-6 rounded-lg shadow-lg max-w-6xl mx-auto">
			{/* Header */}
			<div className="bg-blue-700 text-white p-4 rounded-t-lg mb-6">
				<h1 className="text-2xl font-bold text-center">
					PERSONAL FINANCIAL PROJECTION
				</h1>
			</div>

			{/* Navigation Tabs */}
			<div className="flex border-b border-gray-200 mb-6">
				<button
					className={`py-2 px-4 font-medium ${
						activeTab === "summary"
							? "text-blue-600 border-b-2 border-blue-600"
							: "text-gray-500 hover:text-gray-700"
					}`}
					onClick={() => setActiveTab("summary")}
				>
					Summary
				</button>
				<button
					className={`py-2 px-4 font-medium ${
						activeTab === "milestones"
							? "text-blue-600 border-b-2 border-blue-600"
							: "text-gray-500 hover:text-gray-700"
					}`}
					onClick={() => setActiveTab("milestones")}
				>
					Milestones
				</button>
				<button
					className={`py-2 px-4 font-medium ${
						activeTab === "charts"
							? "text-blue-600 border-b-2 border-blue-600"
							: "text-gray-500 hover:text-gray-700"
					}`}
					onClick={() => setActiveTab("charts")}
				>
					Charts
				</button>
				<button
					className={`py-2 px-4 font-medium ${
						activeTab === "projection"
							? "text-blue-600 border-b-2 border-blue-600"
							: "text-gray-500 hover:text-gray-700"
					}`}
					onClick={() => setActiveTab("projection")}
				>
					Projection Table
				</button>
			</div>

			{/* Summary Tab */}
			{activeTab === "summary" && (
				<div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
						{/* Personal Information */}
						<div className="bg-white p-4 rounded-lg shadow">
							<h2 className="text-lg font-semibold mb-4 text-blue-700">
								Personal Information
							</h2>
							<div className="grid grid-cols-2 gap-2">
								<p className="text-gray-600">Birthday:</p>
								<p className="font-medium">
									{financialData.personalInfo.birthday}
								</p>
								<p className="text-gray-600">Current Age:</p>
								<p className="font-medium">
									{financialData.personalInfo.currentAge}
								</p>
								<p className="text-gray-600">
									Employment Start:
								</p>
								<p className="font-medium">
									{financialData.personalInfo.employmentStart}
								</p>
								<p className="text-gray-600">
									Projection Start:
								</p>
								<p className="font-medium">
									{financialData.personalInfo.projectionStart}
								</p>
							</div>
						</div>

						{/* Financial Snapshot */}
						<div className="bg-white p-4 rounded-lg shadow">
							<h2 className="text-lg font-semibold mb-4 text-blue-700">
								Current Financial Snapshot
							</h2>
							<div className="grid grid-cols-2 gap-2">
								<p className="text-gray-600">
									Current Savings:
								</p>
								<p className="font-medium">
									{formatCurrency(
										financialData.personalInfo
											.currentSavings
									)}
								</p>
								<p className="text-gray-600">Remaining Loan:</p>
								<p className="font-medium">
									{formatCurrency(
										financialData.personalInfo.remainingLoan
									)}
								</p>
								<p className="text-gray-600">
									Loan Interest Rate:
								</p>
								<p className="font-medium">
									{financialData.personalInfo.interestRate}%
								</p>
								<p className="text-gray-600">
									Monthly Repayment:
								</p>
								<p className="font-medium">
									{formatCurrency(
										financialData.personalInfo
											.monthlyRepayment
									)}
								</p>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
						{/* Income & Expenses */}
						<div className="bg-white p-4 rounded-lg shadow">
							<h2 className="text-lg font-semibold mb-4 text-blue-700">
								Monthly Income & Expenses
							</h2>
							<div className="grid grid-cols-2 gap-2">
								<p className="text-gray-600">Current Salary:</p>
								<p className="font-medium">
									{formatCurrency(
										financialData.income.currentSalary
									)}
								</p>
								<p className="text-gray-600">
									Salary After July 2025:
								</p>
								<p className="font-medium">
									{formatCurrency(
										financialData.income.futureSalary
									)}
								</p>
								<p className="text-gray-600">
									Monthly Expenses:
								</p>
								<p className="font-medium">
									{formatCurrency(totalExpenses)}
								</p>
								<p className="text-gray-600">Loan Payment:</p>
								<p className="font-medium">
									{formatCurrency(
										financialData.personalInfo
											.monthlyRepayment
									)}
								</p>
								<p className="text-gray-600">
									Current Savings Rate:
								</p>
								<p className="font-medium">
									{formatPercent(savingsRate)}
								</p>
							</div>
						</div>

						{/* Key Timeframes */}
						<div className="bg-white p-4 rounded-lg shadow">
							<h2 className="text-lg font-semibold mb-4 text-blue-700">
								Key Timeframes
							</h2>
							<div className="grid grid-cols-2 gap-2">
								<p className="text-gray-600">
									Time to Pay Off Loan:
								</p>
								<p className="font-medium">{timeToPayLoan}</p>
								<p className="text-gray-600">
									Expected Loan Payoff Date:
								</p>
								<p className="font-medium">
									{loanPaidOffMonth
										? loanPaidOffMonth.date
										: "Not within projection"}
								</p>
								<p className="text-gray-600">
									Time to $100K Savings:
								</p>
								<p className="font-medium">
									{timeToSavingsGoal}
								</p>
								<p className="text-gray-600">
									Expected $100K Date:
								</p>
								<p className="font-medium">
									{savingsGoalReachedMonth
										? savingsGoalReachedMonth.date
										: "Not within projection"}
								</p>
							</div>
						</div>
					</div>

					{/* Expense Breakdown */}
					<div className="bg-white p-4 rounded-lg shadow mb-6">
						<h2 className="text-lg font-semibold mb-4 text-blue-700">
							Monthly Expense Breakdown
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<div className="grid grid-cols-2 gap-2">
									<p className="text-gray-600">Rental:</p>
									<p className="font-medium">
										{formatCurrency(
											financialData.expenses.rental
										)}
									</p>
									<p className="text-gray-600">Food:</p>
									<p className="font-medium">
										{formatCurrency(
											financialData.expenses.food
										)}
									</p>
									<p className="text-gray-600">
										Transportation:
									</p>
									<p className="font-medium">
										{formatCurrency(
											financialData.expenses
												.transportation
										)}
									</p>
									<p className="text-gray-600">
										Entertainment:
									</p>
									<p className="font-medium">
										{formatCurrency(
											financialData.expenses.entertainment
										)}
									</p>
									<p className="text-gray-600">
										Loan Payment:
									</p>
									<p className="font-medium">
										{formatCurrency(
											financialData.personalInfo
												.monthlyRepayment
										)}
									</p>
									<p className="text-gray-600 font-semibold">
										Total:
									</p>
									<p className="font-semibold">
										{formatCurrency(
											totalExpenses +
												financialData.personalInfo
													.monthlyRepayment
										)}
									</p>
								</div>
							</div>
							<div className="h-64">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={expenseData}
											dataKey="value"
											nameKey="name"
											cx="50%"
											cy="50%"
											outerRadius={80}
											fill="#8884d8"
											label={({ name, percent }) =>
												`${name} ${(
													percent * 100
												).toFixed(0)}%`
											}
										>
											{expenseData.map((entry, index) => (
												<Cell
													key={`cell-${index}`}
													fill={
														COLORS[
															index %
																COLORS.length
														]
													}
												/>
											))}
										</Pie>
										<Tooltip
											formatter={(value) =>
												formatCurrency(value)
											}
										/>
										<Legend />
									</PieChart>
								</ResponsiveContainer>
							</div>
						</div>
					</div>

					{/* Recommendations */}
					<div className="bg-white p-4 rounded-lg shadow">
						<h2 className="text-lg font-semibold mb-4 text-blue-700">
							Financial Recommendations
						</h2>
						<ul className="list-disc pl-5 space-y-2">
							<li>
								Continue with your current loan repayment plan
								of{" "}
								{formatCurrency(
									financialData.personalInfo.monthlyRepayment
								)}
								/month to achieve debt freedom by{" "}
								{loanPaidOffMonth
									? loanPaidOffMonth.date
									: "the projected date"}
							</li>
							<li>
								After your salary adjustment in July 2025,
								consider increasing your loan payment to
								accelerate debt repayment
							</li>
							<li>
								Once your loan is paid off, redirect that{" "}
								{formatCurrency(
									financialData.personalInfo.monthlyRepayment
								)}{" "}
								to boost your savings rate further
							</li>
							<li>
								Maintain your current expense level even after
								salary increases to accelerate savings
							</li>
							<li>
								Consider diversifying your savings into
								investments once you pass $50,000 in cash
								savings
							</li>
						</ul>
					</div>
				</div>
			)}

			{/* Milestones Tab */}
			{activeTab === "milestones" && (
				<div>
					<div className="bg-white p-4 rounded-lg shadow mb-6">
						<h2 className="text-lg font-semibold mb-4 text-blue-700">
							Key Financial Milestones
						</h2>
						<div className="overflow-x-auto">
							<table className="min-w-full bg-white">
								<thead className="bg-blue-100">
									<tr>
										<th className="py-2 px-4 border-b text-left">
											Milestone
										</th>
										<th className="py-2 px-4 border-b text-left">
											Date
										</th>
										<th className="py-2 px-4 border-b text-left">
											Time to Achieve
										</th>
										<th className="py-2 px-4 border-b text-left">
											Age
										</th>
										<th className="py-2 px-4 border-b text-left">
											Savings at Milestone
										</th>
									</tr>
								</thead>
								<tbody>
									<tr className="hover:bg-gray-50">
										<td className="py-2 px-4 border-b">
											Student Loan Paid Off
										</td>
										<td className="py-2 px-4 border-b">
											{loanPaidOffMonth
												? loanPaidOffMonth.date
												: "Not within projection"}
										</td>
										<td className="py-2 px-4 border-b">
											{timeToPayLoan}
										</td>
										<td className="py-2 px-4 border-b">
											{loanPaidOffMonth
												? loanPaidOffMonth.age
												: "-"}
										</td>
										<td className="py-2 px-4 border-b">
											{loanPaidOffMonth
												? formatCurrency(
														loanPaidOffMonth.cashSavings
												  )
												: "-"}
										</td>
									</tr>
									<tr className="hover:bg-gray-50">
										<td className="py-2 px-4 border-b">
											$100,000 Savings Achieved
										</td>
										<td className="py-2 px-4 border-b">
											{savingsGoalReachedMonth
												? savingsGoalReachedMonth.date
												: "Not within projection"}
										</td>
										<td className="py-2 px-4 border-b">
											{timeToSavingsGoal}
										</td>
										<td className="py-2 px-4 border-b">
											{savingsGoalReachedMonth
												? savingsGoalReachedMonth.age
												: "-"}
										</td>
										<td className="py-2 px-4 border-b">
											{savingsGoalReachedMonth
												? formatCurrency(
														savingsGoalReachedMonth.cashSavings
												  )
												: "-"}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Progress Towards Loan Payment */}
						<div className="bg-white p-4 rounded-lg shadow">
							<h2 className="text-lg font-semibold mb-4 text-blue-700">
								Progress Towards Loan Payment
							</h2>
							{loanPaidOffMonth && (
								<div>
									<div className="mb-2 flex justify-between">
										<span>
											Original Loan:{" "}
											{formatCurrency(
												financialData.personalInfo
													.remainingLoan
											)}
										</span>
										<span>
											Remaining: {formatCurrency(0)}
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-4">
										<div
											className="bg-green-600 h-4 rounded-full"
											style={{ width: "100%" }}
										></div>
									</div>
									<div className="mt-4">
										<p>
											Congratulations! You'll be debt-free
											by {loanPaidOffMonth.date} at age{" "}
											{loanPaidOffMonth.age}.
										</p>
										<p className="mt-2">
											Total repayment period:{" "}
											{timeToPayLoan} from{" "}
											{
												financialData.personalInfo
													.projectionStart
											}
										</p>
									</div>
								</div>
							)}
							{!loanPaidOffMonth && (
								<div>
									<div className="mb-2 flex justify-between">
										<span>
											Original Loan:{" "}
											{formatCurrency(
												financialData.personalInfo
													.remainingLoan
											)}
										</span>
										<span>
											Remaining:{" "}
											{formatCurrency(
												projection[
													projection.length - 1
												].loanRemaining
											)}
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-4">
										<div
											className="bg-green-600 h-4 rounded-full"
											style={{
												width: `${
													(1 -
														projection[
															projection.length -
																1
														].loanRemaining /
															financialData
																.personalInfo
																.remainingLoan) *
													100
												}%`,
											}}
										></div>
									</div>
									<div className="mt-4">
										<p>
											You're making progress, but your
											loan won't be fully paid within the
											5-year projection period.
										</p>
										<p className="mt-2">
											Consider increasing your monthly
											payments to accelerate debt payoff.
										</p>
									</div>
								</div>
							)}
						</div>

						{/* Progress Towards Savings Goal */}
						<div className="bg-white p-4 rounded-lg shadow">
							<h2 className="text-lg font-semibold mb-4 text-blue-700">
								Progress Towards $100K Savings
							</h2>
							{savingsGoalReachedMonth && (
								<div>
									<div className="mb-2 flex justify-between">
										<span>
											Starting:{" "}
											{formatCurrency(
												financialData.personalInfo
													.currentSavings
											)}
										</span>
										<span>
											Goal: {formatCurrency(100000)}
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-4">
										<div
											className="bg-blue-600 h-4 rounded-full"
											style={{ width: "100%" }}
										></div>
									</div>
									<div className="mt-4">
										<p>
											Congratulations! You'll reach
											$100,000 in savings by{" "}
											{savingsGoalReachedMonth.date} at
											age {savingsGoalReachedMonth.age}.
										</p>
										<p className="mt-2">
											Total savings period:{" "}
											{timeToSavingsGoal} from{" "}
											{
												financialData.personalInfo
													.projectionStart
											}
										</p>
									</div>
								</div>
							)}
							{!savingsGoalReachedMonth && (
								<div>
									<div className="mb-2 flex justify-between">
										<span>
											Starting:{" "}
											{formatCurrency(
												financialData.personalInfo
													.currentSavings
											)}
										</span>
										<span>
											Current:{" "}
											{formatCurrency(
												projection[
													projection.length - 1
												].cashSavings
											)}
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-4">
										<div
											className="bg-blue-600 h-4 rounded-full"
											style={{
												width: `${Math.min(
													100,
													(projection[
														projection.length - 1
													].cashSavings /
														100000) *
														100
												)}%`,
											}}
										></div>
									</div>
									<div className="mt-4">
										<p>
											You're making progress, but you
											won't reach the $100,000 savings
											goal within the 5-year projection
											period.
										</p>
										<p className="mt-2">
											Consider increasing your savings
											rate after paying off your loan to
											accelerate progress.
										</p>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Charts Tab */}
			{activeTab === "charts" && (
				<div>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Savings Growth Chart */}
						<div className="bg-white p-4 rounded-lg shadow">
							<h2 className="text-lg font-semibold mb-4 text-blue-700">
								Savings Growth Over Time
							</h2>
							<div className="h-64">
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={chartData}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="date" />
										<YAxis
											tickFormatter={(value) =>
												formatCurrency(value)
											}
										/>
										<Tooltip
											formatter={(value) =>
												formatCurrency(value)
											}
										/>
										<Legend />
										<Area
											type="monotone"
											dataKey="cashSavings"
											name="Cash Savings"
											stroke="#8884d8"
											fill="#8884d8"
											fillOpacity={0.3}
										/>
										<Area
											type="monotone"
											dataKey="cpfBalance"
											name="CPF Balance"
											stroke="#82ca9d"
											fill="#82ca9d"
											fillOpacity={0.3}
										/>
										<Area
											type="monotone"
											dataKey="totalSavings"
											name="Total Savings"
											stroke="#ffc658"
											fill="#ffc658"
											fillOpacity={0.3}
										/>
									</AreaChart>
								</ResponsiveContainer>
							</div>
						</div>

						{/* Loan Repayment Chart */}
						<div className="bg-white p-4 rounded-lg shadow">
							<h2 className="text-lg font-semibold mb-4 text-blue-700">
								Loan Repayment Progress
							</h2>
							<div className="h-64">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={chartData}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="date" />
										<YAxis
											tickFormatter={(value) =>
												formatCurrency(value)
											}
										/>
										<Tooltip
											formatter={(value) =>
												formatCurrency(value)
											}
										/>
										<Legend />
										<Line
											type="monotone"
											dataKey="loanRemaining"
											name="Remaining Loan"
											stroke="#ff7300"
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						</div>

						{/* Monthly Expenses Breakdown */}
						<div className="bg-white p-4 rounded-lg shadow">
							<h2 className="text-lg font-semibold mb-4 text-blue-700">
								Monthly Expense Breakdown
							</h2>
							<div className="h-64">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={expenseData}
											dataKey="value"
											nameKey="name"
											cx="50%"
											cy="50%"
											outerRadius={80}
											fill="#8884d8"
											label={({ name, percent }) =>
												`${name} ${(
													percent * 100
												).toFixed(0)}%`
											}
										>
											{expenseData.map((entry, index) => (
												<Cell
													key={`cell-${index}`}
													fill={
														COLORS[
															index %
																COLORS.length
														]
													}
												/>
											))}
										</Pie>
										<Tooltip
											formatter={(value) =>
												formatCurrency(value)
											}
										/>
										<Legend />
									</PieChart>
								</ResponsiveContainer>
							</div>
						</div>

						{/* Monthly Cash Flow */}
						<div className="bg-white p-4 rounded-lg shadow">
							<h2 className="text-lg font-semibold mb-4 text-blue-700">
								Monthly Cash Flow
							</h2>
							<div className="h-64">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={chartData.slice(0, 8)}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="date" />
										<YAxis
											tickFormatter={(value) =>
												formatCurrency(value)
											}
										/>
										<Tooltip
											formatter={(value) =>
												formatCurrency(value)
											}
										/>
										<Legend />
										<Bar
											dataKey="takeHomePay"
											name="Take-Home Pay"
											fill="#8884d8"
										/>
										<Bar
											dataKey="expenses"
											name="Expenses"
											fill="#ff7300"
										/>
										<Bar
											dataKey="loanPayment"
											name="Loan Payment"
											fill="#ff0000"
										/>
										<Bar
											dataKey="monthlySavings"
											name="Monthly Savings"
											fill="#82ca9d"
										/>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Projection Table Tab */}
			{activeTab === "projection" && (
				<div className="bg-white p-4 rounded-lg shadow">
					<h2 className="text-lg font-semibold mb-4 text-blue-700">
						Monthly Financial Projection
					</h2>
					<div className="overflow-x-auto">
						<table className="min-w-full bg-white">
							<thead className="bg-blue-100">
								<tr>
									<th className="py-2 px-3 border-b text-left">
										Month
									</th>
									<th className="py-2 px-3 border-b text-left">
										Date
									</th>
									<th className="py-2 px-3 border-b text-left">
										Take-Home Pay
									</th>
									<th className="py-2 px-3 border-b text-left">
										Expenses
									</th>
									<th className="py-2 px-3 border-b text-left">
										Loan Payment
									</th>
									<th className="py-2 px-3 border-b text-left">
										Loan Remaining
									</th>
									<th className="py-2 px-3 border-b text-left">
										Monthly Savings
									</th>
									<th className="py-2 px-3 border-b text-left">
										Cash Savings
									</th>
								</tr>
							</thead>
							<tbody>
								{projection.slice(0, 24).map((month, index) => (
									<tr
										key={index}
										className={`${
											month.milestone
												? "bg-green-50"
												: index % 2 === 0
												? "bg-gray-50"
												: ""
										} hover:bg-blue-50`}
									>
										<td className="py-2 px-3 border-b">
											{month.month}
										</td>
										<td className="py-2 px-3 border-b">
											{month.date}
										</td>
										<td className="py-2 px-3 border-b">
											{formatCurrency(month.takeHomePay)}
										</td>
										<td className="py-2 px-3 border-b">
											{formatCurrency(month.expenses)}
										</td>
										<td className="py-2 px-3 border-b">
											{formatCurrency(month.loanPayment)}
										</td>
										<td className="py-2 px-3 border-b">
											{formatCurrency(
												month.loanRemaining
											)}
										</td>
										<td className="py-2 px-3 border-b">
											{formatCurrency(
												month.monthlySavings
											)}
										</td>
										<td className="py-2 px-3 border-b">
											{formatCurrency(month.cashSavings)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					{/* Show milestone information if available */}
					{(loanPaidOffMonth || savingsGoalReachedMonth) && (
						<div className="mt-4">
							<h3 className="font-semibold text-blue-700">
								Key Milestones:
							</h3>
							<ul className="list-disc pl-5 mt-2">
								{loanPaidOffMonth && (
									<li>
										<span className="font-medium">
											Loan Paid Off:
										</span>{" "}
										{loanPaidOffMonth.date} (Month{" "}
										{loanPaidOffMonth.month})
									</li>
								)}
								{savingsGoalReachedMonth && (
									<li>
										<span className="font-medium">
											$100K Savings Reached:
										</span>{" "}
										{savingsGoalReachedMonth.date} (Month{" "}
										{savingsGoalReachedMonth.month})
									</li>
								)}
							</ul>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default Dashboard;
