import React, { useContext, useState, useEffect } from "react";
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
	const {
		financialData,
		totalExpenses,
		calculateAge,
		getMonthName,
		formatDate,
	} = useContext(FinancialContext);

	const [activeTab, setActiveTab] = useState("summary");
	const [isMobile, setIsMobile] = useState(false);

	// Check if viewing on mobile device
	useEffect(() => {
		const checkIfMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		// Initial check
		checkIfMobile();

		// Add event listener for window resize
		window.addEventListener("resize", checkIfMobile);

		// Clean up
		return () => window.removeEventListener("resize", checkIfMobile);
	}, []);

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
		let cpfBalance = 0; // Starting CPF balance
		const birthYear = personalInfo.birthday.year;
		const birthMonth = personalInfo.birthday.month;

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
		let startMonth = personalInfo.projectionStart.month;
		let startYear = personalInfo.projectionStart.year;

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

	// Expense breakdown for pie chart - now uses the dynamic expenses array
	// Also include loan payment in the expenses
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

	// Colors for pie chart - expanded to accommodate more expense categories
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
	const takeHomePay =
		currentSalary * (1 - financialData.income.cpfRate / 100);
	const monthlyExpenses = totalExpenses;
	const loanPayment = financialData.personalInfo.monthlyRepayment;
	const monthlySavings = takeHomePay - monthlyExpenses - loanPayment;
	const savingsRate = monthlySavings / takeHomePay;

	// Filtered data for charts (every 3 months on mobile, every 2 months on desktop)
	const chartData = projection.filter((item, index) =>
		isMobile ? index % 3 === 0 : index % 2 === 0
	);

	// Mobile Tab Selector Component
	const MobileTabSelector = () => (
		<div className="mb-4">
			<label className="block text-gray-700 font-medium mb-2">View</label>
			<select
				className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 touch-target"
				value={activeTab}
				onChange={(e) => setActiveTab(e.target.value)}
			>
				<option value="summary">Summary</option>
				<option value="milestones">Milestones</option>
				<option value="charts">Charts</option>
				<option value="projection">Projection Table</option>
			</select>
		</div>
	);

	// ResponsiveCard Component
	const ResponsiveCard = ({ title, children }) => (
		<div className="bg-white p-3 sm:p-4 rounded-lg shadow mb-4 sm:mb-6">
			<h2 className="text-lg font-semibold mb-3 sm:mb-4 text-blue-700">
				{title}
			</h2>
			{children}
		</div>
	);

	// Create a more mobile-friendly data table
	const ResponsiveDataTable = ({ title, headers, rows, formatters = {} }) => {
		return (
			<div className="bg-white p-3 sm:p-4 rounded-lg shadow mb-4 sm:mb-6">
				<h2 className="text-lg font-semibold mb-3 sm:mb-4 text-blue-700">
					{title}
				</h2>

				{/* Desktop view */}
				<div className="hidden md:block overflow-x-auto">
					<table className="min-w-full bg-white">
						<thead className="bg-blue-100">
							<tr>
								{headers.map((header, index) => (
									<th
										key={index}
										className="py-2 px-3 border-b text-left"
									>
										{header.label}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{rows.map((row, rowIndex) => (
								<tr
									key={rowIndex}
									className={`${
										row.highlight
											? "bg-green-50"
											: rowIndex % 2 === 0
											? "bg-gray-50"
											: ""
									} hover:bg-blue-50`}
								>
									{headers.map((header, colIndex) => (
										<td
											key={colIndex}
											className="py-2 px-3 border-b"
										>
											{formatters[header.key]
												? formatters[header.key](
														row[header.key]
												  )
												: row[header.key]}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Mobile view - cards instead of table */}
				<div className="md:hidden space-y-3">
					{rows.map((row, rowIndex) => (
						<div
							key={rowIndex}
							className={`p-3 border rounded-lg ${
								row.highlight
									? "bg-green-50 border-green-200"
									: "bg-white border-gray-200"
							}`}
						>
							{headers.map((header, colIndex) => (
								<div
									key={colIndex}
									className="flex justify-between py-1 border-b border-gray-100 last:border-b-0"
								>
									<span className="font-medium text-gray-600">
										{header.label}:
									</span>
									<span className="text-right">
										{formatters[header.key]
											? formatters[header.key](
													row[header.key]
											  )
											: row[header.key]}
									</span>
								</div>
							))}
						</div>
					))}
				</div>
			</div>
		);
	};

	return (
		<div className="bg-gray-50 p-3 sm:p-6 rounded-lg shadow-lg max-w-6xl mx-auto">
			{/* Header */}
			<div className="bg-blue-700 text-white p-3 sm:p-4 rounded-t-lg mb-4 sm:mb-6">
				<h1 className="text-xl sm:text-2xl font-bold text-center">
					PERSONAL FINANCIAL PROJECTION
				</h1>
			</div>

			{/* Mobile Tab Selector (only shown on mobile) */}
			<div className="md:hidden">
				<MobileTabSelector />
			</div>

			{/* Navigation Tabs (hidden on mobile) */}
			<div className="hidden md:flex border-b border-gray-200 mb-6">
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
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
						{/* Personal Information */}
						<ResponsiveCard title="Personal Information">
							<div className="grid grid-cols-2 gap-2">
								<p className="text-gray-600">Birthday:</p>
								<p className="font-medium">
									{getMonthName(
										financialData.personalInfo.birthday
											.month
									)}{" "}
									{financialData.personalInfo.birthday.year}
								</p>
								<p className="text-gray-600">Current Age:</p>
								<p className="font-medium">
									{calculateAge()} years old
								</p>
								<p className="text-gray-600">
									Employment Start:
								</p>
								<p className="font-medium">
									{getMonthName(
										financialData.personalInfo
											.employmentStart.month
									)}{" "}
									{
										financialData.personalInfo
											.employmentStart.year
									}
								</p>
								<p className="text-gray-600">
									Projection Start:
								</p>
								<p className="font-medium">
									{getMonthName(
										financialData.personalInfo
											.projectionStart.month
									)}{" "}
									{
										financialData.personalInfo
											.projectionStart.year
									}
								</p>
							</div>
						</ResponsiveCard>

						{/* Financial Snapshot */}
						<ResponsiveCard title="Current Financial Snapshot">
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
						</ResponsiveCard>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
						{/* Income & Expenses */}
						<ResponsiveCard title="Monthly Income & Expenses">
							<div className="grid grid-cols-2 gap-2">
								<p className="text-gray-600">Current Salary:</p>
								<p className="font-medium">
									{formatCurrency(
										financialData.income.currentSalary
									)}
								</p>
								<p className="text-gray-600">
									Salary After{" "}
									{getMonthName(
										financialData.income
											.salaryAdjustmentMonth
									)}{" "}
									{financialData.income.salaryAdjustmentYear}:
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
						</ResponsiveCard>

						{/* Key Timeframes */}
						<ResponsiveCard title="Key Timeframes">
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
						</ResponsiveCard>
					</div>

					{/* Expense Breakdown */}
					<ResponsiveCard title="Monthly Expense Breakdown">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<div className="overflow-y-auto max-h-64">
									{/* Desktop expense table */}
									<div className="hidden md:block">
										<table className="min-w-full bg-white">
											<thead className="bg-blue-100">
												<tr>
													<th className="py-2 px-4 border-b text-left">
														Category
													</th>
													<th className="py-2 px-4 border-b text-right">
														Amount
													</th>
												</tr>
											</thead>
											<tbody>
												{financialData.expenses.map(
													(expense, index) => (
														<tr
															key={expense.id}
															className={
																index % 2 === 0
																	? "bg-gray-50"
																	: ""
															}
														>
															<td className="py-2 px-4 border-b">
																{expense.name}
															</td>
															<td className="py-2 px-4 border-b text-right">
																{formatCurrency(
																	expense.amount
																)}
															</td>
														</tr>
													)
												)}
												<tr
													className={
														financialData.expenses
															.length %
															2 ===
														0
															? "bg-gray-50"
															: ""
													}
												>
													<td className="py-2 px-4 border-b">
														Loan Payment
													</td>
													<td className="py-2 px-4 border-b text-right">
														{formatCurrency(
															financialData
																.personalInfo
																.monthlyRepayment
														)}
													</td>
												</tr>
												<tr className="bg-blue-50 font-semibold">
													<td className="py-2 px-4 border-b">
														Total
													</td>
													<td className="py-2 px-4 border-b text-right">
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

									{/* Mobile expense cards */}
									<div className="md:hidden space-y-2">
										{financialData.expenses.map(
											(expense) => (
												<div
													key={expense.id}
													className="flex justify-between p-2 border-b"
												>
													<span>{expense.name}</span>
													<span>
														{formatCurrency(
															expense.amount
														)}
													</span>
												</div>
											)
										)}
										<div className="flex justify-between p-2 border-b">
											<span>Loan Payment</span>
											<span>
												{formatCurrency(
													financialData.personalInfo
														.monthlyRepayment
												)}
											</span>
										</div>
										<div className="flex justify-between p-2 bg-blue-50 font-semibold">
											<span>Total</span>
											<span>
												{formatCurrency(
													totalExpenses +
														financialData
															.personalInfo
															.monthlyRepayment
												)}
											</span>
										</div>
									</div>
								</div>
							</div>
							<div className="h-64 md:h-auto">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={expenseData}
											dataKey="value"
											nameKey="name"
											cx="50%"
											cy="50%"
											outerRadius={isMobile ? 60 : 80}
											fill="#8884d8"
											label={({ name, percent }) =>
												isMobile
													? `${(
															percent * 100
													  ).toFixed(0)}%`
													: `${name} ${(
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
											layout={
												isMobile
													? "horizontal"
													: "vertical"
											}
										/>
									</PieChart>
								</ResponsiveContainer>
							</div>
						</div>
					</ResponsiveCard>

					{/* Recommendations */}
					<ResponsiveCard title="Financial Recommendations">
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
								After your salary adjustment in{" "}
								{getMonthName(
									financialData.income.salaryAdjustmentMonth
								)}{" "}
								{financialData.income.salaryAdjustmentYear},
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
					</ResponsiveCard>
				</div>
			)}

			{/* Milestones Tab */}
			{activeTab === "milestones" && (
				<div>
					{/* Key Milestones Table */}
					<ResponsiveDataTable
						title="Key Financial Milestones"
						headers={[
							{ key: "milestone", label: "Milestone" },
							{ key: "date", label: "Date" },
							{ key: "timeToAchieve", label: "Time to Achieve" },
							{ key: "age", label: "Age" },
							{ key: "savings", label: "Savings at Milestone" },
						]}
						rows={[
							{
								milestone: "Student Loan Paid Off",
								date: loanPaidOffMonth
									? loanPaidOffMonth.date
									: "Not within projection",
								timeToAchieve: timeToPayLoan,
								age: loanPaidOffMonth
									? loanPaidOffMonth.age
									: "-",
								savings: loanPaidOffMonth
									? loanPaidOffMonth.cashSavings
									: null,
								highlight: loanPaidOffMonth !== null,
							},
							{
								milestone: "$100,000 Savings Achieved",
								date: savingsGoalReachedMonth
									? savingsGoalReachedMonth.date
									: "Not within projection",
								timeToAchieve: timeToSavingsGoal,
								age: savingsGoalReachedMonth
									? savingsGoalReachedMonth.age
									: "-",
								savings: savingsGoalReachedMonth
									? savingsGoalReachedMonth.cashSavings
									: null,
								highlight: savingsGoalReachedMonth !== null,
							},
						]}
						formatters={{
							savings: (value) =>
								value ? formatCurrency(value) : "-",
						}}
					/>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
						{/* Progress Towards Loan Payment */}
						<ResponsiveCard title="Progress Towards Loan Payment">
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
											{getMonthName(
												financialData.personalInfo
													.projectionStart.month
											)}{" "}
											{
												financialData.personalInfo
													.projectionStart.year
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
						</ResponsiveCard>

						{/* Progress Towards Savings Goal */}
						<ResponsiveCard title="Progress Towards $100K Savings">
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
											{getMonthName(
												financialData.personalInfo
													.projectionStart.month
											)}{" "}
											{
												financialData.personalInfo
													.projectionStart.year
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
						</ResponsiveCard>
					</div>
				</div>
			)}

			{/* Charts Tab */}
			{activeTab === "charts" && (
				<div>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
						{/* Savings Growth Chart */}
						<ResponsiveCard title="Savings Growth Over Time">
							<div className="h-72">
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
						</ResponsiveCard>

						{/* Loan Repayment Chart */}
						<ResponsiveCard title="Loan Repayment Progress">
							<div className="h-72">
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
											strokeWidth={2}
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						</ResponsiveCard>

						{/* Monthly Expenses Breakdown */}
						<ResponsiveCard title="Monthly Expense Breakdown">
							<div className="h-72">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={expenseData}
											dataKey="value"
											nameKey="name"
											cx="50%"
											cy="50%"
											outerRadius={isMobile ? 70 : 90}
											fill="#8884d8"
											label={({ name, percent }) =>
												isMobile
													? `${(
															percent * 100
													  ).toFixed(0)}%`
													: `${name} ${(
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
											layout={
												isMobile
													? "horizontal"
													: "vertical"
											}
										/>
									</PieChart>
								</ResponsiveContainer>
							</div>
						</ResponsiveCard>

						{/* Monthly Cash Flow */}
						<ResponsiveCard title="Monthly Cash Flow">
							<div className="h-72">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={chartData.slice(
											0,
											isMobile ? 5 : 8
										)}
									>
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
						</ResponsiveCard>
					</div>
				</div>
			)}

			{/* Projection Table Tab */}
			{activeTab === "projection" && (
				<ResponsiveCard title="Monthly Financial Projection">
					{/* Desktop table view */}
					<div className="hidden md:block overflow-x-auto">
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

					{/* Mobile view - card layout */}
					<div className="md:hidden space-y-4">
						{projection.slice(0, 12).map((month, index) => (
							<div
								key={index}
								className={`p-3 border rounded-lg ${
									month.milestone
										? "bg-green-50 border-green-200"
										: "bg-white border-gray-200"
								}`}
							>
								<div className="flex justify-between font-bold mb-2 border-b pb-1">
									<span>
										Month {month.month}: {month.date}
									</span>
									{month.milestone && (
										<span className="text-green-600">
											{month.milestone}
										</span>
									)}
								</div>
								<div className="grid grid-cols-2 gap-y-1">
									<span className="text-gray-600">
										Take-Home:
									</span>
									<span className="text-right">
										{formatCurrency(month.takeHomePay)}
									</span>

									<span className="text-gray-600">
										Expenses:
									</span>
									<span className="text-right">
										{formatCurrency(month.expenses)}
									</span>

									<span className="text-gray-600">
										Loan Payment:
									</span>
									<span className="text-right">
										{formatCurrency(month.loanPayment)}
									</span>

									<span className="text-gray-600">
										Loan Remaining:
									</span>
									<span className="text-right">
										{formatCurrency(month.loanRemaining)}
									</span>

									<span className="text-gray-600">
										Monthly Savings:
									</span>
									<span className="text-right">
										{formatCurrency(month.monthlySavings)}
									</span>

									<span className="text-gray-600 font-medium">
										Cash Savings:
									</span>
									<span className="text-right font-medium">
										{formatCurrency(month.cashSavings)}
									</span>
								</div>
							</div>
						))}
						<div className="text-center text-blue-600">
							<button
								className="font-medium"
								onClick={() =>
									alert(
										"Full projection available in desktop view"
									)
								}
							>
								View more months in desktop view
							</button>
						</div>
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
				</ResponsiveCard>
			)}
		</div>
	);
};

export default Dashboard;
