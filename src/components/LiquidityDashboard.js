// src/components/LiquidityDashboard.js
import React, { useContext, useState } from "react";
import { FinancialContext } from "../context/FinancialContext";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  // LineChart,
  // Line,
  AreaChart,
  Area
} from "recharts";

const LiquidityDashboard = () => {
  const { financialData } = useContext(FinancialContext);
  const [viewMode, setViewMode] = useState("summary"); // "summary", "projection", "analysis"

  // Format numbers as currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: "SGD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format numbers as percentage
  const formatPercent = (value) => {
    return new Intl.NumberFormat("en-SG", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value);
  };

  // Calculate asset types and totals
  const liquidAssets = financialData.personalInfo.currentSavings || 0;
  const cpfAssets = financialData.personalInfo.currentCpfBalance || 0;
  const totalLiabilities = financialData.personalInfo.remainingLoan || 0;
  
  const totalAssets = liquidAssets + cpfAssets;
  const totalLiquidNetWorth = liquidAssets - totalLiabilities;
  const totalNetWorth = totalAssets - totalLiabilities;
  
  const liquidityRatio = totalAssets > 0 ? (liquidAssets / totalAssets) : 0;
  
  // Fixed liquidity ratio calculation - handle negative net worth properly
  const calculateLiquidityMessage = () => {
    if (totalNetWorth <= 0) {
      return {
        ratio: null,
        message: `You currently have negative net worth (${formatCurrency(totalNetWorth)}). Your liquid assets of ${formatCurrency(liquidAssets)} can help cover ${formatPercent(Math.abs(liquidAssets / totalLiabilities))} of your debt. Focus on debt reduction and building emergency savings.`,
        type: "negative_net_worth"
      };
    }
    
    const liquidNetWorthRatio = totalLiquidNetWorth / totalNetWorth;
    
    let message;
    if (liquidNetWorthRatio < 0.3) {
      message = "This is quite low - most of your wealth is locked in CPF.";
    } else if (liquidNetWorthRatio < 0.6) {
      message = "This is moderate - a balanced mix of available and locked funds.";
    } else {
      message = "This is good - most of your wealth is accessible when needed.";
    }
    
    return {
      ratio: liquidNetWorthRatio,
      message: `${formatPercent(liquidNetWorthRatio)} of your net worth is actually available to use. ${message}`,
      type: "positive_net_worth"
    };
  };
  
  const liquidityAnalysis = calculateLiquidityMessage();
  
  // Asset breakdown data for charts
  const assetBreakdownData = [
    { name: "Liquid Cash (Available)", value: liquidAssets },
    { name: "CPF (Restricted)", value: cpfAssets },
    { name: "Liabilities", value: totalLiabilities > 0 ? totalLiabilities : 0 }
  ];
  
  // Net worth comparison data for charts
  const netWorthComparisonData = [
    { name: "With CPF", value: totalNetWorth },
    { name: "Without CPF", value: totalLiquidNetWorth }
  ];

  // Monthly income & expenses data
  const monthlyIncome = financialData.income.currentSalary || 0;
  const cpfContribution = monthlyIncome * (financialData.income.cpfRate / 100) || 0;
  const takeHomePay = monthlyIncome - cpfContribution;
  const monthlyExpenses = financialData.expenses.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  const loanPayment = financialData.personalInfo.monthlyRepayment || 0;
  const monthlySavings = takeHomePay - monthlyExpenses - loanPayment;
  
  const monthlyBreakdownData = [
    { name: "Total Income", value: monthlyIncome },
    { name: "Take-Home Pay", value: takeHomePay },
    { name: "Living Expenses", value: monthlyExpenses },
    { name: "Loan Payment", value: loanPayment },
    { name: "Available for Savings", value: monthlySavings },
    { name: "CPF Contribution (Restricted)", value: cpfContribution }
  ];
  
  // Simplified projection data (next 12 months)
  const generateProjectionData = () => {
    let projection = [];
    let currentLiquidAssets = liquidAssets;
    let currentCpfAssets = cpfAssets;
    let currentLoanBalance = totalLiabilities;
    
    // Monthly interest rate (assuming 4% annual rate for calculation)
    const loanInterestRate = (financialData.personalInfo.interestRate || 4) / 100 / 12;
    
    for (let i = 0; i < 12; i++) {
      // Calculate loan payment and interest
      let interestPayment = currentLoanBalance * loanInterestRate;
      let principalPayment = Math.min(currentLoanBalance, loanPayment - interestPayment);
      
      if (currentLoanBalance <= 0) {
        interestPayment = 0;
        principalPayment = 0;
        currentLoanBalance = 0;
      } else {
        currentLoanBalance = Math.max(0, currentLoanBalance - principalPayment);
      }
      
      // Update assets
      currentLiquidAssets += monthlySavings;
      currentCpfAssets += cpfContribution;
      
      const month = new Date();
      month.setMonth(month.getMonth() + i);
      const monthName = month.toLocaleString('default', { month: 'short' });
      
      projection.push({
        month: `${monthName} ${month.getFullYear()}`,
        liquidAssets: currentLiquidAssets,
        cpfAssets: currentCpfAssets,
        loanBalance: currentLoanBalance,
        liquidNetWorth: currentLiquidAssets - currentLoanBalance,
        totalNetWorth: currentLiquidAssets + currentCpfAssets - currentLoanBalance
      });
    }
    
    return projection;
  };
  
  const projectionData = generateProjectionData();
  
  // Asset distribution colors
  const COLORS = ["#4ade80", "#a855f7", "#ef4444"];
  const NET_WORTH_COLORS = ["#3b82f6", "#22c55e"];

  // Custom card component
  const Card = ({ title, children, className = "" }) => (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>}
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Title and Tab Navigation */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold">Liquidity Dashboard</h2>
        <p className="text-blue-100 mt-1">Clearly see what assets you can actually use</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto mb-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          className={`py-3 px-4 font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
            viewMode === "summary"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          }`}
          onClick={() => setViewMode("summary")}
        >
          Summary
        </button>
        <button
          className={`py-3 px-4 font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
            viewMode === "projection"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          }`}
          onClick={() => setViewMode("projection")}
        >
          Projection
        </button>
        <button
          className={`py-3 px-4 font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
            viewMode === "analysis"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          }`}
          onClick={() => setViewMode("analysis")}
        >
          Analysis
        </button>
      </div>
      
      {/* Summary View */}
      {viewMode === "summary" && (
        <>
          {/* Financial Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Available Money */}
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Available Money</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(liquidAssets)}</p>
                  <p className="text-xs text-gray-500">Cash you can actually use</p>
                </div>
              </div>
            </div>
            
            {/* Liquid Net Worth */}
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Liquid Net Worth</p>
                  <p className={`text-2xl font-bold ${totalLiquidNetWorth >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatCurrency(totalLiquidNetWorth)}
                  </p>
                  <p className="text-xs text-gray-500">Assets you can use minus debts</p>
                </div>
              </div>
            </div>
            
            {/* Liquidity Ratio */}
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Liquidity Ratio</p>
                  <p className="text-2xl font-bold text-purple-600">{formatPercent(liquidityRatio)}</p>
                  <p className="text-xs text-gray-500">Percentage of your assets that are accessible</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Net Worth Comparison */}
          <Card title="Net Worth Comparison (With vs Without CPF)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-medium">Total Net Worth (with CPF):</span>
                  <span className={`font-bold ${totalNetWorth >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatCurrency(totalNetWorth)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-medium">Liquid Net Worth (without CPF):</span>
                  <span className={`font-bold ${totalLiquidNetWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totalLiquidNetWorth)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-600 font-medium">CPF Balance (Restricted):</span>
                  <span className="font-bold text-purple-600">{formatCurrency(cpfAssets)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-600 font-medium">Total Liabilities:</span>
                  <span className="font-bold text-red-600">{formatCurrency(totalLiabilities)}</span>
                </div>
                
                <div className={`mt-4 p-4 rounded-lg ${
                  liquidityAnalysis.type === "negative_net_worth" 
                    ? "bg-red-50 border border-red-200" 
                    : "bg-blue-50"
                }`}>
                  <h4 className={`font-medium mb-2 ${
                    liquidityAnalysis.type === "negative_net_worth" 
                      ? "text-red-700" 
                      : "text-blue-700"
                  }`}>
                    {liquidityAnalysis.type === "negative_net_worth" 
                      ? "Financial Status Alert" 
                      : "Liquid Net Worth Ratio"}
                  </h4>
                  <p className="text-sm text-gray-700">
                    {liquidityAnalysis.message}
                  </p>
                  {liquidityAnalysis.type === "negative_net_worth" && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        <strong>Priority:</strong> Focus on paying down debt and building an emergency fund. 
                        Your liquid assets can cover {formatPercent(Math.abs(liquidAssets / totalLiabilities))} of your current debt.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={netWorthComparisonData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="value" name="Net Worth">
                      {netWorthComparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          entry.value >= 0 
                            ? NET_WORTH_COLORS[index % NET_WORTH_COLORS.length]
                            : "#ef4444" // Red for negative values
                        } />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
          
          {/* Asset Distribution */}
          <Card title="Asset Distribution">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-medium">Liquid Cash (Available):</span>
                  <span className="font-bold">{formatCurrency(liquidAssets)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-500 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, (liquidAssets / (totalAssets + totalLiabilities)) * 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-purple-600 font-medium">CPF (Restricted):</span>
                  <span className="font-bold">{formatCurrency(cpfAssets)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-purple-500 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, (cpfAssets / (totalAssets + totalLiabilities)) * 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-red-600 font-medium">Liabilities:</span>
                  <span className="font-bold">{formatCurrency(totalLiabilities)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-red-500 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, (totalLiabilities / (totalAssets + totalLiabilities)) * 100)}%` }}
                  ></div>
                </div>
                
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-700 mb-2">Key Financial Metrics</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">Liquidity Ratio:</div>
                    <div className="text-sm font-medium">{formatPercent(liquidityRatio)}</div>
                    
                    <div className="text-sm">Debt-to-Asset Ratio:</div>
                    <div className="text-sm font-medium">{formatPercent(totalAssets > 0 ? totalLiabilities / totalAssets : 0)}</div>
                    
                    <div className="text-sm">Liquid Net Worth:</div>
                    <div className={`text-sm font-medium ${totalLiquidNetWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(totalLiquidNetWorth)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {assetBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
          
          {/* Monthly Liquidity Analysis */}
          <Card title="Monthly Liquidity Analysis">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700 mb-3">Monthly Cash Flow</h4>
                
                <div className="flex justify-between items-center text-sm">
                  <span>Total Income:</span>
                  <span className="font-medium">{formatCurrency(monthlyIncome)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>CPF Contribution (Restricted):</span>
                  <span className="font-medium text-purple-600">- {formatCurrency(cpfContribution)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>Take-Home Pay:</span>
                  <span className="text-green-600">{formatCurrency(takeHomePay)}</span>
                </div>
                
                <div className="border-t border-gray-200 my-2"></div>
                
                <div className="flex justify-between items-center text-sm">
                  <span>Living Expenses:</span>
                  <span className="font-medium text-red-600">- {formatCurrency(monthlyExpenses)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Loan Payment:</span>
                  <span className="font-medium text-red-600">- {formatCurrency(loanPayment)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>Available for Savings:</span>
                  <span className={monthlySavings >= 0 ? "text-green-600" : "text-red-600"}>
                    {formatCurrency(monthlySavings)}
                  </span>
                </div>
                
                <div className="border-t border-gray-200 my-2"></div>
                
                <div className={`p-4 rounded-lg mt-2 ${
                  monthlySavings >= 0 ? "bg-blue-50" : "bg-red-50 border border-red-200"
                }`}>
                  <h4 className={`font-medium mb-2 ${
                    monthlySavings >= 0 ? "text-blue-700" : "text-red-700"
                  }`}>
                    Cash Flow Analysis
                  </h4>
                  <p className="text-sm">
                    {monthlySavings > 0 
                      ? `You have ${formatCurrency(monthlySavings)} available each month to save or invest.`
                      : `You have a monthly cash flow deficit of ${formatCurrency(Math.abs(monthlySavings))}. Consider reducing expenses or increasing income.`}
                  </p>
                  <p className="text-sm mt-2">
                    {cpfContribution > 0 
                      ? `Additionally, ${formatCurrency(cpfContribution)} goes to your CPF monthly (restricted access).`
                      : ''}
                  </p>
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyBreakdownData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                    <YAxis type="category" width={130} dataKey="name" />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </>
      )}
      
      {/* Projection View */}
      {viewMode === "projection" && (
        <>
          <Card title="12-Month Liquid vs. Total Net Worth Projection">
            <div className="h-72 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={projectionData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="totalNetWorth"
                    name="Total Net Worth (with CPF)"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="liquidNetWorth"
                    name="Liquid Net Worth (without CPF)"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={projectionData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="liquidAssets"
                    name="Liquid Assets (Cash)"
                    stroke="#4ade80"
                    fill="#4ade80"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="cpfAssets"
                    name="CPF Assets (Restricted)"
                    stroke="#a855f7"
                    fill="#a855f7"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="loanBalance"
                    name="Loan Balance"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-700 mb-2">Projection Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm mb-2">In 12 months, your financial position is projected to be:</p>
                  <ul className="space-y-1 text-sm">
                    <li>Liquid Assets: {formatCurrency(projectionData[11].liquidAssets)}</li>
                    <li>CPF Balance: {formatCurrency(projectionData[11].cpfAssets)}</li>
                    <li>Loan Balance: {formatCurrency(projectionData[11].loanBalance)}</li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm mb-2">Net worth comparison after 12 months:</p>
                  <ul className="space-y-1 text-sm">
                    <li>Total Net Worth (with CPF): {formatCurrency(projectionData[11].totalNetWorth)}</li>
                    <li>Liquid Net Worth (without CPF): {formatCurrency(projectionData[11].liquidNetWorth)}</li>
                    <li>Increase in Liquid Net Worth: {formatCurrency(projectionData[11].liquidNetWorth - totalLiquidNetWorth)}</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
          
          <Card title="12-Month Projection Data">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Liquid Assets
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CPF Balance
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loan Balance
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Liquid Net Worth
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Net Worth
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projectionData.map((entry, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {formatCurrency(entry.liquidAssets)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600">
                        {formatCurrency(entry.cpfAssets)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {formatCurrency(entry.loanBalance)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        entry.liquidNetWorth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(entry.liquidNetWorth)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        entry.totalNetWorth >= 0 ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(entry.totalNetWorth)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
      
      {/* Analysis View */}
      {viewMode === "analysis" && (
        <>
          <Card title="Liquidity Analysis">
            <div className="space-y-6">
              <div className={`p-4 rounded-lg border ${
                liquidityAnalysis.type === "negative_net_worth" 
                  ? "bg-red-50 border-red-200" 
                  : "bg-blue-50 border-blue-200"
              }`}>
                <h4 className={`font-medium mb-2 ${
                  liquidityAnalysis.type === "negative_net_worth" 
                    ? "text-red-700" 
                    : "text-blue-700"
                }`}>
                  {liquidityAnalysis.type === "negative_net_worth" 
                    ? "Financial Recovery Status" 
                    : "Your Liquidity Score"}
                </h4>
                
                {liquidityAnalysis.type === "positive_net_worth" && (
                  <>
                    <div className="flex items-center mb-3">
                      <div className="flex-grow bg-gray-200 rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full ${
                            liquidityAnalysis.ratio < 0.3 ? 'bg-red-500' : 
                            liquidityAnalysis.ratio < 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                          }`} 
                          style={{ width: `${liquidityAnalysis.ratio * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-3 font-medium">{(liquidityAnalysis.ratio * 100).toFixed(0)}%</span>
                    </div>
                  </>
                )}
                
                <p className="text-sm">
                  {liquidityAnalysis.message}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-700 mb-2">Liquid Assets Analysis</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>You have {formatCurrency(liquidAssets)} in liquid assets that you can use immediately.</span>
                    </li>
                    <li className="flex items-start">
                      <svg className={`h-5 w-5 mr-2 mt-0.5 flex-shrink-0 ${
                        totalLiquidNetWorth >= 0 ? 'text-green-500' : 'text-red-500'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d={totalLiquidNetWorth >= 0 
                            ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                          }>
                        </path>
                      </svg>
                      <span>Your liquid net worth is {formatCurrency(totalLiquidNetWorth)}.</span>
                    </li>
                    <li className="flex items-start">
                      <svg className={`h-5 w-5 mr-2 mt-0.5 flex-shrink-0 ${
                        monthlySavings >= 0 ? 'text-green-500' : 'text-red-500'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d={monthlySavings >= 0 
                            ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                          }>
                        </path>
                      </svg>
                      <span>
                        {monthlySavings >= 0 
                          ? `You're saving approximately ${formatCurrency(monthlySavings)} in liquid assets monthly.`
                          : `You have a monthly deficit of ${formatCurrency(Math.abs(monthlySavings))}.`}
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-700 mb-2">CPF Analysis</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>You have {formatCurrency(cpfAssets)} in CPF (restricted access).</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>Contributing {formatCurrency(cpfContribution)} to CPF monthly.</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>CPF makes up {formatPercent(totalAssets > 0 ? cpfAssets / totalAssets : 0)} of your total assets.</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-700 mb-2">Recommendations</h4>
                <ul className="space-y-2 text-sm">
                  {liquidityAnalysis.type === "negative_net_worth" && (
                    <>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span><strong>Priority 1:</strong> Focus on debt reduction. Your debt ({formatCurrency(totalLiabilities)}) exceeds your assets ({formatCurrency(totalAssets)}).</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span><strong>Priority 2:</strong> {monthlySavings < 0 ? 'Reduce expenses or increase income to stop the monthly deficit.' : 'Continue saving to build emergency fund.'}</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span><strong>Priority 3:</strong> Build at least $1,000 emergency fund before focusing on investments.</span>
                      </li>
                    </>
                  )}
                  
                  {liquidityAnalysis.type === "positive_net_worth" && (
                    <>
                      {liquidityAnalysis.ratio < 0.3 && (
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span>Focus on building liquid assets to improve financial flexibility.</span>
                        </li>
                      )}
                      
                      {monthlySavings < (takeHomePay * 0.2) && (
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span>Consider increasing your liquid savings rate to at least 20% of take-home pay.</span>
                        </li>
                      )}
                      
                      {liquidAssets < (monthlyExpenses * 3) && (
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span>Build an emergency fund of at least 3-6 months of expenses in liquid assets.</span>
                        </li>
                      )}
                      
                      {totalLiabilities > 0 && totalLiabilities > (liquidAssets * 0.5) && (
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span>Consider accelerating debt payoff to improve your liquid net worth.</span>
                        </li>
                      )}
                      
                      {liquidAssets > (monthlyExpenses * 6) && (
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span>Consider investing some of your excess liquid assets for better long-term growth.</span>
                        </li>
                      )}
                    </>
                  )}
                  
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Track your liquidity ratio over time to ensure it aligns with your financial goals.</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default LiquidityDashboard;