import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import Card from "../common/Card";

/**
 * YearlyExpenseBreakdown Component
 * Displays breakdown of yearly expenses by category
 * Shows both recurring and one-time yearly expenses
 */
const YearlyExpenseBreakdown = ({
	yearlyExpenses = [],
	selectedYear = new Date().getFullYear(),
}) => {
	// Filter and prepare yearly expenses for selected year
	const expensesData = useMemo(() => {
		if (!Array.isArray(yearlyExpenses) || yearlyExpenses.length === 0) {
			return [];
		}

		// Filter expenses that apply to the selected year
		const applicableExpenses = yearlyExpenses.filter((expense) => {
			const startsBeforeOrDuring = expense.startYear <= selectedYear;
			const endsAfterOrDuring =
				!expense.endYear || expense.endYear >= selectedYear;

			return startsBeforeOrDuring && endsAfterOrDuring;
		});

		// Group by category and sum amounts
		return applicableExpenses.map((expense) => ({
			name: expense.name,
			value: parseFloat(expense.amount) || 0,
			type: expense.endYear && expense.endYear > 0 ? "One-time" : "Recurring",
			month: expense.month,
			description: expense.description || "",
		}));
	}, [yearlyExpenses, selectedYear]);

	const totalYearlyExpenses = useMemo(() => {
		return expensesData.reduce((sum, item) => sum + item.value, 0);
	}, [expensesData]);

	const averageMonthly = useMemo(() => {
		return totalYearlyExpenses / 12;
	}, [totalYearlyExpenses]);

	// Colors for pie chart
	const COLORS = [
		"#ef4444", // red
		"#f97316", // orange
		"#eab308", // yellow
		"#84cc16", // lime
		"#22c55e", // green
		"#10b981", // emerald
		"#14b8a6", // teal
		"#06b6d4", // cyan
		"#0ea5e9", // sky
		"#3b82f6", // blue
		"#6366f1", // indigo
		"#8b5cf6", // violet
	];

	const monthNames = [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun",
		"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
	];

	if (!expensesData || expensesData.length === 0) {
		return (
			<Card className="p-6">
				<div className="text-center py-8">
					<svg
						className="mx-auto h-12 w-12 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
						/>
					</svg>
					<h3 className="mt-2 text-sm font-medium text-gray-900">
						No yearly expenses
					</h3>
					<p className="mt-1 text-sm text-gray-500">
						Add yearly expenses to see them here
					</p>
				</div>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Total Yearly</p>
							<p className="text-2xl font-bold text-gray-900 mt-2">
								${totalYearlyExpenses.toLocaleString("en-US", {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</p>
						</div>
						<svg
							className="h-12 w-12 text-red-500 opacity-20"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
				</Card>

				<Card className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">
								Average Monthly Impact
							</p>
							<p className="text-2xl font-bold text-gray-900 mt-2">
								${averageMonthly.toLocaleString("en-US", {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</p>
						</div>
						<svg
							className="h-12 w-12 text-blue-500 opacity-20"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
							/>
						</svg>
					</div>
				</Card>

				<Card className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">
								Number of Expenses
							</p>
							<p className="text-2xl font-bold text-gray-900 mt-2">
								{expensesData.length}
							</p>
						</div>
						<svg
							className="h-12 w-12 text-purple-500 opacity-20"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
				</Card>
			</div>

			{/* Pie Chart */}
			{expensesData.length > 0 && (
				<Card className="p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						Expense Breakdown for {selectedYear}
					</h3>
					<ResponsiveContainer width="100%" height={300}>
						<PieChart>
							<Pie
								data={expensesData}
								cx="50%"
								cy="50%"
								labelLine={false}
								label={({ name, value }) =>
									`${name}: $${value.toLocaleString("en-US", {
										minimumFractionDigits: 0,
										maximumFractionDigits: 0,
									})}`
								}
								outerRadius={80}
								fill="#8884d8"
								dataKey="value"
							>
								{expensesData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
								))}
							</Pie>
							<Tooltip
								formatter={(value) =>
									`$${value.toLocaleString("en-US", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}`
								}
							/>
							<Legend />
						</PieChart>
					</ResponsiveContainer>
				</Card>
			)}

			{/* Detailed List */}
			<Card className="p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">
					Yearly Expenses for {selectedYear}
				</h3>
				<div className="overflow-x-auto">
					<table className="min-w-full">
						<thead>
							<tr className="border-b border-gray-200">
								<th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
									Expense
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
									Month
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
									Type
								</th>
								<th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
									Amount
								</th>
								<th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
									Monthly Avg
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{expensesData.map((expense, index) => (
								<tr key={index} className="hover:bg-gray-50">
									<td className="px-4 py-3">
										<div>
											<p className="text-sm font-medium text-gray-900">
												{expense.name}
											</p>
											{expense.description && (
												<p className="text-xs text-gray-500">
													{expense.description}
												</p>
											)}
										</div>
									</td>
									<td className="px-4 py-3 text-sm text-gray-900">
										{monthNames[expense.month - 1]}
									</td>
									<td className="px-4 py-3">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												expense.type === "Recurring"
													? "bg-green-100 text-green-800"
													: "bg-amber-100 text-amber-800"
											}`}
										>
											{expense.type}
										</span>
									</td>
									<td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
										${expense.value.toLocaleString("en-US", {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}
									</td>
									<td className="px-4 py-3 text-right text-sm text-gray-600">
										${(expense.value / 12).toLocaleString("en-US", {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}
									</td>
								</tr>
							))}
							<tr className="bg-gray-50 font-semibold">
								<td colSpan="3" className="px-4 py-3 text-sm text-gray-900">
									Total
								</td>
								<td className="px-4 py-3 text-right text-sm text-gray-900">
									${totalYearlyExpenses.toLocaleString("en-US", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</td>
								<td className="px-4 py-3 text-right text-sm text-gray-600">
									${averageMonthly.toLocaleString("en-US", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	);
};

export default YearlyExpenseBreakdown;
