# Custom Hooks Documentation

This document provides detailed information about the custom React hooks used in the Financial Dashboard application. These hooks encapsulate complex logic and state management to make components cleaner and more focused on their UI responsibilities.

## Table of Contents

1. [useFinancialCalculations](#usefinancialcalculations)
2. [useProjection](#useprojection)
3. [useMilestones](#usemilestones)
4. [useUIPreferences](#useuipreferences)

## useFinancialCalculations

The central hook that provides financial calculations and data processing capabilities.

### Purpose

This hook processes raw financial data and calculates various financial metrics, formats data for charts, and integrates with other specialized hooks like `useProjection` and `useMilestones`.

### Usage

```jsx
import useFinancialCalculations from '../hooks/useFinancialCalculations';

function MyComponent() {
  const {
    // Financial metrics
    currentSalary,
    cpfContribution,
    employerCpfContribution,
    takeHomePay,
    monthlyExpenses,
    loanPayment,
    monthlySavings,
    savingsRate,
    totalMonthlyIncome,
    
    // Assets and allocation
    liquidCash,
    cpfSavings,
    totalAssets,
    liquidCashPercentage,
    cpfPercentage,
    assetAllocationData,
    
    // Projection data
    projection,
    chartData,
    loanPaidOffMonth,
    savingsGoalReachedMonth,
    timeToPayLoan,
    timeToSavingsGoal,
    
    // Other formatted data
    expenseData,
    upcomingEvents,
    
    // Settings and update functions
    projectionSettings,
    updateProjectionSettings
  } = useFinancialCalculations();
  
  // Use the data in your component...
}
```

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `currentSalary` | number | Current monthly salary |
| `cpfContribution` | number | Employee CPF contribution |
| `employerCpfContribution` | number | Employer CPF contribution |
| `takeHomePay` | number | Monthly take-home pay (after CPF) |
| `monthlyExpenses` | number | Total monthly expenses |
| `monthlySavings` | number | Monthly savings amount |
| `savingsRate` | number | Savings as percentage of take-home pay |
| `totalMonthlyIncome` | number | Total monthly income including employer CPF |
| `liquidCash` | number | Current liquid cash assets |
| `cpfSavings` | number | Current CPF balance |
| `totalAssets` | number | Total assets value |
| `liquidCashPercentage` | number | Percentage of assets in liquid cash |
| `cpfPercentage` | number | Percentage of assets in CPF |
| `assetAllocationData` | Array | Data for asset allocation charts |
| `projection` | Array | Complete financial projection data |
| `chartData` | Array | Filtered data for charts (first 5 years) |
| `savingsGoalReachedMonth` | Object | Month when savings goal will be reached |
| `timeToSavingsGoal` | number | Months to reach savings goal |
| `expenseData` | Array | Data for expense breakdown |
| `upcomingEvents` | Array | Upcoming financial events |
| `projectionSettings` | Object | Current projection settings |
| `updateProjectionSettings` | Function | Function to update projection settings |

### Dependencies

- `useFinancial` context
- `useProjection` hook
- `useMilestones` hook

## useProjection

Generates financial projections based on current financial data and settings.

### Purpose

This hook handles the complex calculations needed to project future financial states based on current financial data and customizable growth/return parameters.

### Usage

```jsx
import useProjection from '../hooks/useProjection';

function MyComponent() {
  // Current financial data
  const initialData = {
    liquidCash: 50000,
    cpfBalance: 100000,
    salary: 6000,
    monthlyExpenses: 2000,
    cpfContributionRate: 20,
    employerCpfContributionRate: 17
  };
  
  // Projection settings
  const initialSettings = {
    annualSalaryIncrease: 3.0,
    annualExpenseIncrease: 2.0,
    annualInvestmentReturn: 4.0,
    annualCpfInterestRate: 2.5,
    projectionYears: 30,
    bonusMonths: 2,
    bonusAmount: 6000
  };
  
  const {
    projectionData,
    savingsGoalReachedMonth,
    timeToSavingsGoal,
    settings,
    updateSettings,
    generateProjection
  } = useProjection(initialData, initialSettings);
  
  // Use the projection data...
}
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `initialData` | Object | Current financial data |
| `initialSettings` | Object | Initial projection settings |

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `projectionData` | Array | Array of monthly financial projections |
| `savingsGoalReachedMonth` | Object | Month when savings goal will be reached |
| `timeToSavingsGoal` | number | Months to reach savings goal |
| `settings` | Object | Current projection settings |
| `updateSettings` | Function | Function to update settings |
| `generateProjection` | Function | Function to manually regenerate projection |

### Projection Data Structure

Each item in the `projectionData` array has the following properties:

```javascript
{
  date: "Jan 2023",            // Formatted date
  monthlyIncome: 6000,         // Monthly income
  takeHomePay: 4800,           // Take-home pay after CPF
  monthlyExpenses: 2000,       // Monthly expenses
  monthlySavings: 1800,        // Monthly savings
  cashSavings: 51800,          // Cumulative cash savings
  cpfBalance: 101020,          // CPF balance
  totalNetWorth: 51800,        // Net worth
  employeeCpfContribution: 1200,// Employee CPF contribution
  employerCpfContribution: 1020,// Employer CPF contribution
  totalCpfContribution: 2220,  // Total CPF contribution
  bonusAmount: 0,              // Bonus amount (if any)
  isBonus: false               // Whether this is a bonus month
}
```

## useMilestones

Manages financial milestones and goals.

### Purpose

This hook manages the tracking, filtering, and manipulation of financial milestones, both system-generated and custom.

### Usage

```jsx
import useMilestones from '../hooks/useMilestones';

function MyComponent() {
  // Initial milestones (if any)
  const initialMilestones = [];
  
  // Projection data
  const projectionData = {
    savingsGoalReachedMonth: { date: 'Jun 2025' },
    timeToSavingsGoal: 36,
    currentLiquidCash: 20000,
    currentAge: 30
  };
  
  const {
    milestones,
    milestoneTypes,
    addMilestone,
    editMilestone,
    deleteMilestone,
    toggleMilestoneType
  } = useMilestones(initialMilestones, projectionData);
  
  // Use the milestones data and functions...
}
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `initialMilestones` | Array | Initial custom milestones |
| `projectionData` | Object | Financial projection data |

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `milestones` | Array | Filtered list of milestones |
| `milestoneTypes` | Array | List of milestone types for filtering |
| `addMilestone` | Function | Function to add a custom milestone |
| `editMilestone` | Function | Function to edit a milestone |
| `deleteMilestone` | Function | Function to delete a milestone |
| `toggleMilestoneType` | Function | Function to toggle milestone type filters |

### Milestone Structure

Each milestone has the following structure:

```javascript
{
  id: "milestone-1",           // Unique ID
  title: "Savings Goal",       // Title
  description: "...",          // Description
  date: "Jun 2025",            // Target date
  timeRemaining: 36,           // Months remaining
  complete: false,             // Whether completed
  progress: 25,                // Completion percentage
  type: "savings",             // Milestone type
  custom: false,               // Whether custom or system
  system: true                 // Whether system-generated
}
```

## useUIPreferences

Manages UI preferences including theme, chart colors, and display settings.

### Purpose

This hook manages user interface preferences and provides utility functions for formatting data consistently according to user preferences.

### Usage

```jsx
import useUIPreferences from '../hooks/useUIPreferences';

function MyComponent() {
  const {
    theme,
    chartColors,
    compactMode,
    currencyFormat,
    dateFormat,
    toggleTheme,
    updateChartColor,
    resetChartColors,
    toggleCompactMode,
    updateCurrencyFormat,
    updateDateFormat,
    getChartColorPalette,
    formatCurrency,
    isDarkMode
  } = useUIPreferences();
  
  // Use UI preferences in your component...
}
```

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `theme` | string | Current theme ('light' or 'dark') |
| `chartColors` | Object | Current chart color settings |
| `compactMode` | boolean | Whether compact mode is enabled |
| `currencyFormat` | string | Currency format code (e.g., 'USD') |
| `dateFormat` | string | Date format string |
| `toggleTheme` | Function | Function to toggle theme |
| `updateChartColor` | Function | Function to update a specific chart color |
| `resetChartColors` | Function | Function to reset chart colors to defaults |
| `toggleCompactMode` | Function | Function to toggle compact mode |
| `updateCurrencyFormat` | Function | Function to update currency format |
| `updateDateFormat` | Function | Function to update date format |
| `getChartColorPalette` | Function | Function to get complete color palette for charts |
| `formatCurrency` | Function | Function to format currency values |
| `isDarkMode` | boolean | Whether dark mode is enabled |

### Storage

This hook uses `localStorage` to persist user preferences between sessions.

### Chart Colors Object Structure

```javascript
{
  primary: "#0088FE",
  secondary: "#00C49F",
  tertiary: "#FFBB28",
  quaternary: "#FF8042",
  danger: "#FF0000",
  success: "#00C853",
  warning: "#FFB300"
}
```

## Best Practices for Using These Hooks

1. **Single Responsibility**
   - Each hook should focus on a single area of functionality
   - Avoid adding unrelated functionality to existing hooks

2. **Dependency Management**
   - Clearly document dependencies between hooks
   - Minimize circular dependencies

3. **Performance Considerations**
   - Use memoization for expensive calculations
   - Avoid unnecessary re-renders
   - Use proper dependency arrays in effects

4. **Testing**
   - Write unit tests for each hook
   - Test edge cases and error handling
   - Mock dependencies for isolated testing

5. **Documentation**
   - Document the purpose, parameters, and return values
   - Include usage examples
   - Keep documentation updated as hooks evolve