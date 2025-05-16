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
	ComposedChart,
	ReferenceLine,
} from "recharts";

const Dashboard = () => {
	const {
		financialData,
		totalExpenses,
		calculateAge,
		getMonthName,
		formatDate,
	} = useContext(FinancialContext);

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

	// Calculate financial projection
	const calculateProjection = () => {
		const projection = [];

		// Extract values from context
		const { personalInfo, income, expenses } = financialData;

		// Initial values
		let currentSavings = personalInfo.currentSavings;
		let loanRemaining = personalInfo.remainingLoan;
		let cpfBalance = personalInfo.currentCpfBalance || 0; // Use user-provided CPF balance
		const birthYear = personalInfo.birthday.year;
		const birthMonth = personalInfo.birthday.month;

		// Parameters
		let currentSalary = income.currentSalary;
		const cpfRate = income.cpfRate / 100;
		const employerCpfRate = income.employerCpfRate / 100;
		const monthlyExpenses = totalExpenses;
		const loanPayment = personalInfo.monthlyRepayment;
		const annualInterestRate = personalInfo.interestRate / 100;
		const monthlyInterestRate = annualInterestRate / 12;

		// Calculate months
		let startMonth = personalInfo.projectionStart.month;
		let startYear = personalInfo.projectionStart.year;

		// Get salary adjustments if available, or create from legacy data
		const salaryAdjustments = income.salaryAdjustments || [];

		// If using legacy format, convert to array format for compatibility
		if (!income.salaryAdjustments && income.futureSalary) {
			salaryAdjustments.push({
				month: income.salaryAdjustmentMonth,
				year: income.salaryAdjustmentYear,
				newSalary: income.futureSalary,
			});
		}

		// Sort salary adjustments by date
		const sortedAdjustments = [...salaryAdjustments].sort((a, b) => {
			if (a.year !== b.year) return a.year - b.year;
			return a.month - b.month;
		});

		// Track milestones
		let loanPaidOffMonth = null;
		let savingsGoalReachedMonth = null; // This will now track only cash savings (excluding CPF)

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

			// Check for salary adjustments
			for (const adjustment of sortedAdjustments) {
				if (
					currentMonth === adjustment.month &&
					currentYear === adjustment.year
				) {
					currentSalary = adjustment.newSalary;
					break;
				}
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
			const totalNetWorth = currentSavings + cpfBalance;

			// Record savings goal milestone - now only for cash savings (excluding CPF)
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
				cpfContribution: cpfContribution,
				employerCpfContribution: employerCpf,
				totalCpfContribution: cpfContribution + employerCpf,
				cpfBalance: cpfBalance,
				cashSavings: currentSavings,
				totalNetWorth: totalNetWorth,
				milestone:
					month === loanPaidOffMonth
						? "Loan Paid Off"
						: month === savingsGoalReachedMonth
						? "100K Cash Savings Goal"
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
		...financialData.expenses.map((expense) => ({
			name: expense.name,
			value: expense.amount,
		})),
		{
			name: "Loan Payment",
			value: financialData.personalInfo.monthlyRepayment,
		},
	];

	// Colors for pie chart
	const COLORS = [
		"#0088FE",
		"#00C49F",
		"#FFBB28",
		"#FF8042",
		"#8884d8",
		"#82ca9d",
		"#ffc658",
		"#ff7300",
		"#ff0000",
		"#B10DC9",
		"#FF851B",
		"#85144b",
		"#3D9970",
		"#2ECC40",
		"#01FF70",
	];

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
	const cpfContribution =
		currentSalary * (financialData.income.cpfRate / 100);
	const employerCpfContribution =
		currentSalary * (financialData.income.employerCpfRate / 100);
	const takeHomePay = currentSalary - cpfContribution;
	const monthlyExpenses = totalExpenses;
	const loanPayment = financialData.personalInfo.monthlyRepayment;
	const monthlySavings = takeHomePay - monthlyExpenses - loanPayment;
	const savingsRate = monthlySavings / takeHomePay;
	const totalMonthlyIncome = currentSalary + employerCpfContribution;

	// Filtered data for charts (every 3 months)
	const chartData = projection.filter((item, index) => index % 3 === 0);

	// Custom card component for consistency
	const Card = ({ children, title, className = "" }) => (
		<div
			className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
		>
			{title && (
				<div className="bg-blue-600 px-4 py-3">
					<h2 className="text-lg font-semibold text-white">
						{title}
					</h2>
				</div>
			)}
			<div className="p-4">{children}</div>
		</div>
	);

	// InfoItem component for consistent display of key-value pairs
	const InfoItem = ({ label, value, highlighted = false }) => (
		<div
			className={`py-2 flex justify-between items-center border-b ${
				highlighted ? "bg-blue-50" : ""
			}`}
		>
			<span className="text-gray-700">{label}</span>
			<span
				className={`font-medium ${highlighted ? "text-blue-700" : ""}`}
			>
				{value}
			</span>
		</div>
	);

	return (
		<div className="bg-gray-50 rounded-lg max-w-6xl mx-auto">
			{/* Header */}
			<div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-4 rounded-lg mb-6 shadow-md">
				<h1 className="text-xl md:text-2xl font-bold text-center">
					PERSONAL FINANCIAL PROJECTION
				</h1>
			</div>

			{/* Mobile-friendly Navigation Tabs */}
			<div className="flex overflow-x-auto mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
				<button
					className={`py-3 px-4 font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
						activeTab === "summary"
							? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
							: "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
					}`}
					onClick={() => setActiveTab("summary")}
				>
					Summary
				</button>
				<button
					className={`py-3 px-4 font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
						activeTab === "milestones"
							? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
							: "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
					}`}
					onClick={() => setActiveTab("milestones")}
				>
					Milestones
				</button>
				<button
					className={`py-3 px-4 font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
						activeTab === "charts"
							? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
							: "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
					}`}
					onClick={() => setActiveTab("charts")}
				>
					Charts
				</button>
				<button
					className={`py-3 px-4 font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
						activeTab === "projection"
							? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
							: "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
					}`}
					onClick={() => setActiveTab("projection")}
				>
					Projection
				</button>
			</div>

			{/* Summary Tab */}
			{activeTab === "summary" && (
				<div className="space-y-6">
					{/* Financial Overview Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
							<p className="text-sm text-gray-500">
								Cash Savings
							</p>
							<p className="text-2xl font-bold text-blue-700">
								{formatCurrency(
									financialData.personalInfo.currentSavings
								)}
							</p>
						</div>

						<div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
							<p className="text-sm text-gray-500">CPF Balance</p>
							<p className="text-2xl font-bold text-purple-700">
								{formatCurrency(
									financialData.personalInfo
										.currentCpfBalance || 0
								)}
							</p>
							<p className="text-xs text-gray-500">
								Locked until retirement
							</p>
						</div>

						<div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
							<p className="text-sm text-gray-500">
								Remaining Loan
							</p>
							<p className="text-2xl font-bold text-red-700">
								{formatCurrency(
									financialData.personalInfo.remainingLoan
								)}
							</p>
						</div>

						<div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
							<p className="text-sm text-gray-500">
								Monthly Cash Savings
							</p>
							<p className="text-2xl font-bold text-green-700">
								{formatCurrency(monthlySavings)}
							</p>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Personal Information */}
						<Card title="Personal Information">
							<div className="space-y-1">
								<InfoItem
									label="Birthday"
									value={`${getMonthName(
										financialData.personalInfo.birthday
											.month
									)} ${
										financialData.personalInfo.birthday.year
									}`}
								/>
								<InfoItem
									label="Current Age"
									value={`${calculateAge()} years old`}
									highlighted={true}
								/>
								<InfoItem
									label="Employment Start"
									value={`${getMonthName(
										financialData.personalInfo
											.employmentStart.month
									)} ${
										financialData.personalInfo
											.employmentStart.year
									}`}
								/>
								<InfoItem
									label="Projection Start"
									value={`${getMonthName(
										financialData.personalInfo
											.projectionStart.month
									)} ${
										financialData.personalInfo
											.projectionStart.year
									}`}
								/>
							</div>
						</Card>

						{/* Financial Snapshot */}
						<Card title="Current Financial Snapshot">
							<div className="space-y-1">
								<InfoItem
									label="Current Savings"
									value={formatCurrency(
										financialData.personalInfo
											.currentSavings
									)}
								/>
								<InfoItem
									label="Remaining Loan"
									value={formatCurrency(
										financialData.personalInfo.remainingLoan
									)}
								/>
								<InfoItem
									label="Loan Interest Rate"
									value={`${financialData.personalInfo.interestRate}%`}
								/>
								<InfoItem
									label="Monthly Repayment"
									value={formatCurrency(
										financialData.personalInfo
											.monthlyRepayment
									)}
									highlighted={true}
								/>
							</div>
						</Card>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Income & Expenses */}
						<Card
							title="Monthly Income & Expenses"
							className="overflow-visible"
						>
							<div className="space-y-4">
								{/* Income Breakdown */}
								<div className="bg-blue-50 p-3 rounded-lg">
									<h3 className="font-medium text-blue-800 mb-2">
										Income
									</h3>
									<div className="space-y-1">
										<InfoItem
											label="Gross Monthly Salary"
											value={formatCurrency(
												financialData.income
													.currentSalary
											)}
											highlighted={true}
										/>
										<InfoItem
											label="Employee CPF Contribution"
											value={`${formatCurrency(
												cpfContribution
											)} (${
												financialData.income.cpfRate
											}%)`}
										/>
										<InfoItem
											label="Take-Home Pay"
											value={formatCurrency(takeHomePay)}
											highlighted={true}
										/>
										<InfoItem
											label="Employer CPF Contribution"
											value={`${formatCurrency(
												employerCpfContribution
											)} (${
												financialData.income
													.employerCpfRate
											}%)`}
										/>
										<InfoItem
											label="Total Monthly Income"
											value={formatCurrency(
												totalMonthlyIncome
											)}
										/>
									</div>
								</div>

								{/* Future Salary Adjustments (New) */}
								{financialData.income.salaryAdjustments &&
									financialData.income.salaryAdjustments
										.length > 0 && (
										<div className="bg-yellow-50 p-3 rounded-lg">
											<h3 className="font-medium text-yellow-800 mb-2">
												Future Salary Adjustments
											</h3>
											<div className="space-y-1">
												{financialData.income.salaryAdjustments
													.sort((a, b) =>
														a.year !== b.year
															? a.year - b.year
															: a.month - b.month
													)
													.map(
														(adjustment, index) => (
															<InfoItem
																key={index}
																label={`From ${getMonthName(
																	adjustment.month
																)} ${
																	adjustment.year
																}`}
																value={formatCurrency(
																	adjustment.newSalary
																)}
															/>
														)
													)}
											</div>
										</div>
									)}

								{/* Legacy Salary Adjustment (Backward Compatibility) */}
								{!financialData.income.salaryAdjustments &&
									financialData.income.futureSalary && (
										<div className="bg-yellow-50 p-3 rounded-lg">
											<h3 className="font-medium text-yellow-800 mb-2">
												Future Salary Adjustment
											</h3>
											<div className="space-y-1">
												<InfoItem
													label={`From ${getMonthName(
														financialData.income
															.salaryAdjustmentMonth
													)} ${
														financialData.income
															.salaryAdjustmentYear
													}`}
													value={formatCurrency(
														financialData.income
															.futureSalary
													)}
												/>
												<InfoItem
													label="Estimated Take-Home After Adjustment"
													value={formatCurrency(
														financialData.income
															.futureSalary *
															(1 -
																financialData
																	.income
																	.cpfRate /
																	100)
													)}
												/>
											</div>
										</div>
									)}

								{/* Expense Breakdown */}
								<div className="bg-red-50 p-3 rounded-lg">
									<h3 className="font-medium text-red-800 mb-2">
										Expenses
									</h3>
									<div className="space-y-1">
										<InfoItem
											label="Living Expenses"
											value={formatCurrency(
												totalExpenses
											)}
										/>
										<InfoItem
											label="Loan Repayment"
											value={formatCurrency(
												financialData.personalInfo
													.monthlyRepayment
											)}
										/>
										<InfoItem
											label="Total Monthly Expenses"
											value={formatCurrency(
												totalExpenses +
													financialData.personalInfo
														.monthlyRepayment
											)}
											highlighted={true}
										/>
									</div>
								</div>

								{/* Savings Breakdown */}
								<div className="bg-green-50 p-3 rounded-lg">
									<h3 className="font-medium text-green-800 mb-2">
										Monthly Savings
									</h3>
									<div className="space-y-1">
										<InfoItem
											label="Cash Savings"
											value={formatCurrency(
												monthlySavings
											)}
											highlighted={true}
										/>
										<InfoItem
											label="CPF Contributions"
											value={formatCurrency(
												cpfContribution +
													employerCpfContribution
											)}
										/>
										<InfoItem
											label="Total Monthly Added to Net Worth"
											value={formatCurrency(
												monthlySavings +
													cpfContribution +
													employerCpfContribution
											)}
											highlighted={true}
										/>
										<InfoItem
											label="Cash Savings Rate (% of Take-Home)"
											value={formatPercent(savingsRate)}
										/>
									</div>
								</div>
							</div>
						</Card>

						{/* Key Timeframes */}
						<Card title="Key Timeframes">
							<div className="space-y-1">
								<InfoItem
									label="Time to Pay Off Loan"
									value={timeToPayLoan}
								/>
								<InfoItem
									label="Expected Loan Payoff Date"
									value={
										loanPaidOffMonth
											? loanPaidOffMonth.date
											: "Not within projection"
									}
									highlighted={true}
								/>
								<InfoItem
									label="Time to $100K Savings"
									value={timeToSavingsGoal}
								/>
								<InfoItem
									label="Expected $100K Date"
									value={
										savingsGoalReachedMonth
											? savingsGoalReachedMonth.date
											: "Not within projection"
									}
									highlighted={true}
								/>
							</div>
						</Card>
					</div>

					{/* Expense Breakdown */}
					<Card title="Monthly Expense Breakdown">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200">
									<thead>
										<tr className="bg-gray-50">
											<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Category
											</th>
											<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
												Amount
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{financialData.expenses.map(
											(expense) => (
												<tr
													key={expense.id}
													className="hover:bg-gray-50"
												>
													<td className="px-4 py-3 text-sm text-gray-700">
														{expense.name}
													</td>
													<td className="px-4 py-3 text-sm text-gray-700 text-right">
														{formatCurrency(
															expense.amount
														)}
													</td>
												</tr>
											)
										)}
										<tr className="hover:bg-gray-50">
											<td className="px-4 py-3 text-sm text-gray-700">
												Loan Payment
											</td>
											<td className="px-4 py-3 text-sm text-gray-700 text-right">
												{formatCurrency(
													financialData.personalInfo
														.monthlyRepayment
												)}
											</td>
										</tr>
										<tr className="bg-blue-50">
											<td className="px-4 py-3 text-sm font-medium text-blue-700">
												Total
											</td>
											<td className="px-4 py-3 text-sm font-medium text-blue-700 text-right">
												{formatCurrency(
													totalExpenses +
														financialData
															.personalInfo
															.monthlyRepayment
												)}
											</td>
										</tr>
									</tbody>
								</table>
							</div>
							<div className="h-64 md:h-80">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={expenseData}
											dataKey="value"
											nameKey="name"
											cx="50%"
											cy="50%"
											outerRadius="70%"
											fill="#8884d8"
											labelLine={false}
											label={({ name, percent }) =>
												`${name}: ${(
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
									</PieChart>
								</ResponsiveContainer>
							</div>
						</div>
					</Card>

					{/* Recommendations */}
					<Card title="Financial Recommendations">
						<ul className="space-y-3 text-gray-700">
							<li className="flex items-start">
								<svg
									className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
								<span>
									Continue with your current loan repayment
									plan of{" "}
									<strong>
										{formatCurrency(
											financialData.personalInfo
												.monthlyRepayment
										)}
									</strong>
									/month to achieve debt freedom by{" "}
									<strong>
										{loanPaidOffMonth
											? loanPaidOffMonth.date
											: "the projected date"}
									</strong>
								</span>
							</li>
							<li className="flex items-start">
								<svg
									className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
								<span>
									After your salary adjustments, consider
									increasing your loan payment to accelerate
									debt repayment
								</span>
							</li>
							<li className="flex items-start">
								<svg
									className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
								<span>
									Once your loan is paid off, redirect that{" "}
									<strong>
										{formatCurrency(
											financialData.personalInfo
												.monthlyRepayment
										)}
									</strong>{" "}
									to boost your savings rate further
								</span>
							</li>
							<li className="flex items-start">
								<svg
									className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
								<span>
									Maintain your current expense level even
									after salary increases to accelerate savings
								</span>
							</li>
							<li className="flex items-start">
								<svg
									className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
								<span>
									Consider diversifying your savings into
									investments once you pass $50,000 in cash
									savings
								</span>
							</li>
						</ul>
					</Card>
				</div>
			)}

			{/* Milestones Tab */}
			{activeTab === "milestones" && (
				<div className="space-y-6">
					<Card title="Key Financial Milestones">
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead>
									<tr className="bg-gray-50">
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Milestone
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Date
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Time to Achieve
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Age
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Savings at Milestone
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									<tr className="hover:bg-gray-50">
										<td className="px-4 py-3 text-sm text-gray-700 font-medium">
											Student Loan Paid Off
										</td>
										<td className="px-4 py-3 text-sm text-gray-700">
											{loanPaidOffMonth
												? loanPaidOffMonth.date
												: "Not within projection"}
										</td>
										<td className="px-4 py-3 text-sm text-gray-700">
											{timeToPayLoan}
										</td>
										<td className="px-4 py-3 text-sm text-gray-700">
											{loanPaidOffMonth
												? loanPaidOffMonth.age
												: "-"}
										</td>
										<td className="px-4 py-3 text-sm text-gray-700">
											{loanPaidOffMonth
												? formatCurrency(
														loanPaidOffMonth.cashSavings
												  )
												: "-"}
										</td>
									</tr>
									<tr className="hover:bg-gray-50">
										<td className="px-4 py-3 text-sm text-gray-700 font-medium">
											$100,000 Savings Achieved
										</td>
										<td className="px-4 py-3 text-sm text-gray-700">
											{savingsGoalReachedMonth
												? savingsGoalReachedMonth.date
												: "Not within projection"}
										</td>
										<td className="px-4 py-3 text-sm text-gray-700">
											{timeToSavingsGoal}
										</td>
										<td className="px-4 py-3 text-sm text-gray-700">
											{savingsGoalReachedMonth
												? savingsGoalReachedMonth.age
												: "-"}
										</td>
										<td className="px-4 py-3 text-sm text-gray-700">
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
					</Card>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Progress Towards Loan Payment */}
						<Card title="Progress Towards Loan Payment">
							{loanPaidOffMonth && (
								<div className="space-y-4">
									<div className="flex justify-between text-sm mb-1">
										<span className="text-gray-600">
											Original Loan:{" "}
											<span className="font-medium">
												{formatCurrency(
													financialData.personalInfo
														.remainingLoan
												)}
											</span>
										</span>
										<span className="text-gray-600">
											Remaining:{" "}
											<span className="font-medium text-green-600">
												{formatCurrency(
													financialData.personalInfo
														.remainingLoan > 0
														? projection[0]
																.loanRemaining
														: 0
												)}
											</span>
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
										<div
											className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-out"
											style={{
												width: `${Math.max(
													0,
													Math.min(
														100,
														((financialData
															.personalInfo
															.remainingLoan -
															projection[0]
																.loanRemaining) /
															financialData
																.personalInfo
																.remainingLoan) *
															100
													)
												)}%`,
											}}
										></div>
									</div>
									<div className="p-4 bg-green-50 rounded-lg border border-green-200 mt-4">
										<div className="flex items-start">
											<svg
												className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
												></path>
											</svg>
											<div>
												<p className="text-green-800 font-medium">
													Congratulations! You'll be
													debt-free by{" "}
													<span className="font-bold">
														{loanPaidOffMonth.date}
													</span>{" "}
													at age{" "}
													{loanPaidOffMonth.age}.
												</p>
												<p className="mt-1 text-green-700">
													Total repayment period:{" "}
													{timeToPayLoan} from{" "}
													{getMonthName(
														financialData
															.personalInfo
															.projectionStart
															.month
													)}{" "}
													{
														financialData
															.personalInfo
															.projectionStart
															.year
													}
												</p>
											</div>
										</div>
									</div>
								</div>
							)}
							{!loanPaidOffMonth && (
								<div className="space-y-4">
									<div className="flex justify-between text-sm mb-1">
										<span className="text-gray-600">
											Original Loan:{" "}
											<span className="font-medium">
												{formatCurrency(
													financialData.personalInfo
														.remainingLoan
												)}
											</span>
										</span>
										<span className="text-gray-600">
											Remaining:{" "}
											<span className="font-medium text-red-600">
												{formatCurrency(
													projection[
														projection.length - 1
													].loanRemaining
												)}
											</span>
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
										<div
											className="bg-blue-500 h-4 rounded-full transition-all duration-500 ease-out"
											style={{
												width: `${Math.max(
													0,
													Math.min(
														100,
														(1 -
															projection[
																projection.length -
																	1
															].loanRemaining /
																financialData
																	.personalInfo
																	.remainingLoan) *
															100
													)
												)}%`,
											}}
										></div>
									</div>
									<div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mt-4">
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
											<div>
												<p className="text-blue-800 font-medium">
													You're making progress, but
													your loan won't be fully
													paid within the 5-year
													projection period.
												</p>
												<p className="mt-1 text-blue-700">
													Consider increasing your
													monthly payments to
													accelerate debt payoff.
												</p>
											</div>
										</div>
									</div>
								</div>
							)}
						</Card>

						{/* Progress Towards Savings Goal */}
						<Card title="Progress Towards $100K Cash Savings">
							{savingsGoalReachedMonth && (
								<div className="space-y-4">
									<div className="flex justify-between text-sm mb-1">
										<span className="text-gray-600">
											Starting Cash:{" "}
											<span className="font-medium">
												{formatCurrency(
													financialData.personalInfo
														.currentSavings
												)}
											</span>
										</span>
										<span className="text-gray-600">
											Goal:{" "}
											<span className="font-medium text-green-600">
												{formatCurrency(100000)}
											</span>
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
										<div
											className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-out"
											style={{
												width: `${Math.min(
													100,
													(financialData.personalInfo
														.currentSavings /
														100000) *
														100
												)}%`,
											}}
										></div>
									</div>
									<div className="p-4 bg-green-50 rounded-lg border border-green-200 mt-4">
										<div className="flex items-start">
											<svg
												className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
												></path>
											</svg>
											<div>
												<p className="text-green-800 font-medium">
													Congratulations! You'll
													reach $100,000 in cash
													savings by{" "}
													<span className="font-bold">
														{
															savingsGoalReachedMonth.date
														}
													</span>{" "}
													at age{" "}
													{
														savingsGoalReachedMonth.age
													}
													.
												</p>
												<p className="mt-1 text-green-700">
													Total savings period:{" "}
													{timeToSavingsGoal} from{" "}
													{getMonthName(
														financialData
															.personalInfo
															.projectionStart
															.month
													)}{" "}
													{
														financialData
															.personalInfo
															.projectionStart
															.year
													}
												</p>
											</div>
										</div>
									</div>
								</div>
							)}
							{!savingsGoalReachedMonth && (
								<div className="space-y-4">
									<div className="flex justify-between text-sm mb-1">
										<span className="text-gray-600">
											Starting Cash:{" "}
											<span className="font-medium">
												{formatCurrency(
													financialData.personalInfo
														.currentSavings
												)}
											</span>
										</span>
										<span className="text-gray-600">
											Current:{" "}
											<span className="font-medium text-blue-600">
												{formatCurrency(
													projection[
														projection.length - 1
													].cashSavings
												)}
											</span>
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
										<div
											className="bg-blue-500 h-4 rounded-full transition-all duration-500 ease-out"
											style={{
												width: `${Math.max(
													0,
													Math.min(
														100,
														(financialData
															.personalInfo
															.currentSavings /
															100000) *
															100
													)
												)}%`,
											}}
										></div>
									</div>
									<div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mt-4">
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
											<div>
												<p className="text-blue-800 font-medium">
													You're making progress, but
													you won't reach the $100,000
													cash savings goal within the
													5-year projection period.
												</p>
												<p className="mt-1 text-blue-700">
													Consider increasing your
													savings rate after paying
													off your loan to accelerate
													progress.
												</p>
											</div>
										</div>
									</div>
								</div>
							)}
						</Card>
					</div>
				</div>
			)}

			{/* Charts Tab */}
			{activeTab === "charts" && (
				<div className="space-y-6">
					<div className="grid grid-cols-1 gap-6">
						{/* Combined Savings Growth and Loan Repayment Chart */}
						<Card title="Financial Progress Over Time">
							<div className="h-80">
								<ResponsiveContainer width="100%" height="100%">
									<ComposedChart
										data={chartData}
										margin={{
											top: 10,
											right: 10,
											left: 0,
											bottom: 20,
										}}
									>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis
											dataKey="date"
											angle={-45}
											textAnchor="end"
											height={60}
											tick={{ fontSize: 12 }}
										/>
										<YAxis
											yAxisId="left"
											tickFormatter={(value) =>
												formatCurrency(value)
											}
											width={70}
											label={{
												value: "Savings",
												angle: -90,
												position: "insideLeft",
												offset: 10,
											}}
										/>
										<YAxis
											yAxisId="right"
											orientation="right"
											tickFormatter={(value) =>
												formatCurrency(value)
											}
											width={70}
											label={{
												value: "Loan Remaining",
												angle: 90,
												position: "insideRight",
												offset: 10,
											}}
										/>
										<Tooltip
											formatter={(value) =>
												formatCurrency(value)
											}
										/>
										<Legend />
										<Area
											yAxisId="left"
											type="monotone"
											dataKey="cashSavings"
											name="Cash Savings"
											stroke="#8884d8"
											fill="#8884d8"
											fillOpacity={0.3}
											activeDot={{ r: 6 }}
										/>
										<Area
											yAxisId="left"
											type="monotone"
											dataKey="cpfBalance"
											name="CPF Balance (Locked)"
											stroke="#82ca9d"
											fill="#82ca9d"
											fillOpacity={0.3}
											activeDot={{ r: 6 }}
										/>
										<Line
											yAxisId="right"
											type="monotone"
											dataKey="loanRemaining"
											name="Remaining Loan"
											stroke="#ff7300"
											strokeWidth={2}
											dot={{ r: 3 }}
											activeDot={{ r: 6 }}
										/>
										{loanPaidOffMonth && (
											<ReferenceLine
												yAxisId="right"
												x={loanPaidOffMonth.date}
												stroke="green"
												strokeDasharray="3 3"
												label={{
													value: "Loan Paid Off",
													position: "top",
													fill: "green",
												}}
											/>
										)}
										{savingsGoalReachedMonth && (
											<ReferenceLine
												yAxisId="left"
												x={savingsGoalReachedMonth.date}
												stroke="blue"
												strokeDasharray="3 3"
												label={{
													value: "$100K Savings",
													position: "top",
													fill: "blue",
												}}
											/>
										)}
									</ComposedChart>
								</ResponsiveContainer>
							</div>
							<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="bg-blue-50 p-3 rounded-lg">
									<h3 className="font-medium text-blue-800 mb-2">
										Savings Growth
									</h3>
									<p className="text-sm">
										{savingsGoalReachedMonth
											? `You'll reach $100K in cash savings by ${savingsGoalReachedMonth.date}`
											: `Your cash savings will grow to ${formatCurrency(
													projection[
														projection.length - 1
													].cashSavings
											  )} in 5 years`}
									</p>
								</div>
								<div className="bg-orange-50 p-3 rounded-lg">
									<h3 className="font-medium text-orange-800 mb-2">
										Loan Repayment
									</h3>
									<p className="text-sm">
										{loanPaidOffMonth
											? `You'll be debt-free by ${loanPaidOffMonth.date}`
											: `Your loan will decrease to ${formatCurrency(
													projection[
														projection.length - 1
													].loanRemaining
											  )} in 5 years`}
									</p>
								</div>
							</div>
						</Card>

						{/* Monthly Expenses Breakdown */}
						<Card title="Monthly Expense Breakdown">
							<div className="h-72">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={expenseData}
											dataKey="value"
											nameKey="name"
											cx="50%"
											cy="50%"
											outerRadius="70%"
											fill="#8884d8"
											labelLine={false}
											label={({ name, percent }) =>
												`${name}: ${(
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
										<Legend
											layout="vertical"
											align="right"
											verticalAlign="middle"
										/>
									</PieChart>
								</ResponsiveContainer>
							</div>
						</Card>

						{/* Monthly Cash Flow */}
						<Card title="Monthly Cash Flow">
							<div className="h-72">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={chartData.slice(0, 6)}
										margin={{
											top: 10,
											right: 10,
											left: 0,
											bottom: 20,
										}}
									>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis
											dataKey="date"
											angle={-45}
											textAnchor="end"
											height={60}
											tick={{ fontSize: 12 }}
										/>
										<YAxis
											tickFormatter={(value) =>
												formatCurrency(value)
											}
											width={70}
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
											name="Living Expenses"
											fill="#ff7300"
										/>
										<Bar
											dataKey="loanPayment"
											name="Loan Payment"
											fill="#ff0000"
										/>
										<Bar
											dataKey="monthlySavings"
											name="Cash Savings"
											fill="#82ca9d"
										/>
										<Bar
											dataKey="totalCpfContribution"
											name="CPF Contributions (Locked)"
											fill="#9370DB"
										/>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</Card>
					</div>
				</div>
			)}

			{/* Projection Table Tab */}
			{activeTab === "projection" && (
				<Card title="Monthly Financial Projection">
					<div className="overflow-x-auto -mx-4">
						<div className="inline-block min-w-full align-middle p-4">
							<table className="min-w-full divide-y divide-gray-200">
								<thead>
									<tr className="bg-gray-50">
										<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
											Month
										</th>
										<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
											Date
										</th>
										<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
											Take-Home
										</th>
										<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
											Expenses
										</th>
										<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
											Loan Payment
										</th>
										<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
											Loan Remaining
										</th>
										<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
											Monthly Savings
										</th>
										<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
											Cash Savings
										</th>
										<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
											CPF Balance
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{projection
										.slice(0, 60) // Show all 60 months of projection
										.map((month, index) => (
											<tr
												key={index}
												className={`${
													month.milestone
														? "bg-green-50"
														: index % 2 === 0
														? "bg-gray-50"
														: ""
												} hover:bg-blue-50 transition-colors`}
											>
												<td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">
													{month.month}
												</td>
												<td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">
													{month.date}
												</td>
												<td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap font-medium text-green-600">
													{formatCurrency(
														month.takeHomePay
													)}
												</td>
												<td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap font-medium text-orange-600">
													{formatCurrency(
														month.expenses
													)}
												</td>
												<td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap font-medium text-red-600">
													{formatCurrency(
														month.loanPayment
													)}
												</td>
												<td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap font-medium text-red-600">
													{formatCurrency(
														month.loanRemaining
													)}
												</td>
												<td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap font-medium text-green-600">
													{formatCurrency(
														month.monthlySavings
													)}
												</td>
												<td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap font-medium text-green-600">
													{formatCurrency(
														month.cashSavings
													)}
												</td>
												<td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap font-medium text-purple-600">
													{formatCurrency(
														month.cpfBalance
													)}
												</td>
											</tr>
										))}
								</tbody>
							</table>
						</div>
					</div>

					{/* Show milestone information if available */}
					{(loanPaidOffMonth || savingsGoalReachedMonth) && (
						<div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
							<h3 className="font-medium text-blue-700 mb-2">
								Key Milestones:
							</h3>
							<ul className="space-y-2">
								{loanPaidOffMonth && (
									<li className="flex items-start">
										<svg
											className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
											></path>
										</svg>
										<span>
											<span className="font-medium">
												Loan Paid Off:
											</span>{" "}
											{loanPaidOffMonth.date} (Month{" "}
											{loanPaidOffMonth.month})
										</span>
									</li>
								)}
								{savingsGoalReachedMonth && (
									<li className="flex items-start">
										<svg
											className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
											></path>
										</svg>
										<span>
											<span className="font-medium">
												$100K Savings Reached:
											</span>{" "}
											{savingsGoalReachedMonth.date}{" "}
											(Month{" "}
											{savingsGoalReachedMonth.month})
										</span>
									</li>
								)}
							</ul>
						</div>
					)}
				</Card>
			)}
		</div>
	);
};

export default Dashboard;
