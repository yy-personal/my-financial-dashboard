import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Dashboard from '../Dashboard';
import { FinancialProvider } from '../../../context/FinancialContext';

// Mock all child components
jest.mock('../../../components/dashboard/FinancialSummary', () => {
  return function MockFinancialSummary(props) {
    return <div data-testid="financial-summary">Financial Summary Component</div>;
  };
});

jest.mock('../../../components/dashboard/AssetAllocation', () => {
  return function MockAssetAllocation(props) {
    return <div data-testid="asset-allocation">Asset Allocation Component</div>;
  };
});

jest.mock('../../../components/dashboard/ExpenseBreakdown', () => {
  return function MockExpenseBreakdown(props) {
    return <div data-testid="expense-breakdown">Expense Breakdown Component</div>;
  };
});

jest.mock('../../../components/dashboard/MonthlyCashFlow', () => {
  return function MockMonthlyCashFlow(props) {
    return <div data-testid="monthly-cash-flow">Monthly Cash Flow Component</div>;
  };
});

jest.mock('../../../components/dashboard/UpcomingEvents', () => {
  return function MockUpcomingEvents(props) {
    return <div data-testid="upcoming-events">Upcoming Events Component</div>;
  };
});

jest.mock('../../../components/dashboard/MilestonesDashboard', () => {
  return function MockMilestonesDashboard(props) {
    return <div data-testid="milestones-dashboard">Milestones Dashboard Component</div>;
  };
});

jest.mock('../../../components/dashboard/ProjectionDashboard', () => {
  return function MockProjectionDashboard(props) {
    return <div data-testid="projection-dashboard">Projection Dashboard Component</div>;
  };
});

jest.mock('../../../components/dashboard/charts', () => ({
  NetWorthChart: () => <div data-testid="net-worth-chart">Net Worth Chart</div>,
  SavingsGrowthChart: () => <div data-testid="savings-growth-chart">Savings Growth Chart</div>,
  CashFlowChart: () => <div data-testid="cash-flow-chart">Cash Flow Chart</div>,
}));

// Mock hooks
jest.mock('../../../hooks/useFinancialCalculations', () => {
  return jest.fn(() => ({
    currentSalary: 5000,
    cpfContribution: 1000,
    employerCpfContribution: 850,
    takeHomePay: 4000,
    monthlyExpenses: 2000,
    loanPayment: 1000,
    monthlySavings: 1000,
    savingsRate: 25,
    totalMonthlyIncome: 5850,
    projection: [{ date: 'Jan 2023', cashSavings: 10000 }],
    chartData: [{ date: 'Jan 2023', cashSavings: 10000 }],
    loanPaidOffMonth: { date: 'Dec 2030' },
    savingsGoalReachedMonth: { date: 'Jun 2025' },
    timeToPayLoan: 120,
    timeToSavingsGoal: 36,
    liquidCash: 20000,
    cpfSavings: 50000,
    totalAssets: 70000,
    liquidCashPercentage: 28.57,
    cpfPercentage: 71.43,
    assetAllocationData: [
      { name: 'Liquid Cash', value: 20000 },
      { name: 'CPF Savings', value: 50000 }
    ],
    expenseData: [
      { name: 'Housing', value: 1000 },
      { name: 'Food', value: 500 },
      { name: 'Transport', value: 300 },
      { name: 'Others', value: 200 }
    ],
    upcomingEvents: [
      { id: 1, title: 'Loan Paid Off', date: 'Dec 2030' },
      { id: 2, title: 'Savings Goal Reached', date: 'Jun 2025' }
    ],
    projectionSettings: {
      annualSalaryIncrease: 3,
      annualExpenseIncrease: 2
    },
    updateProjectionSettings: jest.fn()
  }));
});

// Mock FinancialContext
const mockFinancialContextValue = {
  financialData: {
    personalInfo: {
      name: 'John Doe',
      age: 30,
      monthlySalary: 5000,
      monthlyRepayment: 1000
    },
    financialInfo: {
      liquidCash: 20000,
      cpfOrdinaryAccount: 50000,
      housingLoanRemaining: 200000,
      monthlyExpenses: 2000
    }
  },
  calculateAge: () => 30,
  syncStatus: 'synced',
  updateProjectionSettings: jest.fn()
};

// Wrap component with context provider
const renderWithContext = (ui, contextValue = mockFinancialContextValue) => {
  return render(
    <FinancialProvider value={contextValue}>
      {ui}
    </FinancialProvider>
  );
};

describe('Dashboard Component', () => {
  it('renders the dashboard with summary tab by default', () => {
    renderWithContext(<Dashboard />);
    
    // Check if summary tab components are rendered
    expect(screen.getByTestId('financial-summary')).toBeInTheDocument();
    expect(screen.getByTestId('asset-allocation')).toBeInTheDocument();
    expect(screen.getByTestId('expense-breakdown')).toBeInTheDocument();
    expect(screen.getByTestId('monthly-cash-flow')).toBeInTheDocument();
    expect(screen.getByTestId('upcoming-events')).toBeInTheDocument();
  });

  it('switches tabs when clicked', async () => {
    renderWithContext(<Dashboard />);
    
    // Click on Charts tab
    fireEvent.click(screen.getByText('Charts'));
    
    // Wait for charts to appear
    await waitFor(() => {
      expect(screen.getByTestId('net-worth-chart')).toBeInTheDocument();
      expect(screen.getByTestId('savings-growth-chart')).toBeInTheDocument();
      expect(screen.getByTestId('cash-flow-chart')).toBeInTheDocument();
    });

    // Click on Milestones tab
    fireEvent.click(screen.getByText('Milestones'));
    
    // Wait for milestones dashboard to appear
    await waitFor(() => {
      expect(screen.getByTestId('milestones-dashboard')).toBeInTheDocument();
    });

    // Click on Projection tab
    fireEvent.click(screen.getByText('Projection'));
    
    // Wait for projection dashboard to appear
    await waitFor(() => {
      expect(screen.getByTestId('projection-dashboard')).toBeInTheDocument();
    });

    // Go back to Summary tab
    fireEvent.click(screen.getByText('Summary'));
    
    // Check if we're back to summary view
    await waitFor(() => {
      expect(screen.getByTestId('financial-summary')).toBeInTheDocument();
    });
  });

  it('displays status indicator correctly', () => {
    renderWithContext(<Dashboard />);
    
    // Look for the header
    const header = screen.getByText('PERSONAL FINANCIAL DASHBOARD');
    expect(header).toBeInTheDocument();
    
    // Check for status information
    expect(screen.getByText('Last Updated')).toBeInTheDocument();
  });

  it('handles empty or loading state', () => {
    // Render with empty context data
    renderWithContext(<Dashboard />, {
      financialData: null,
      calculateAge: () => null,
      syncStatus: 'loading'
    });
    
    // Dashboard should still render without crashing
    expect(screen.getByText('PERSONAL FINANCIAL DASHBOARD')).toBeInTheDocument();
  });
});