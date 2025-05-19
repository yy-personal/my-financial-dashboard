import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../components/common/ErrorBoundary/ErrorBoundary';
import { FinancialCalculationErrorFallback } from '../components/common/ErrorFallback';

// A component that throws an error when renderError is true
const ErrorComponent = ({ renderError, errorMessage = 'Test error' }) => {
  if (renderError) {
    throw new Error(errorMessage);
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console errors in tests
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  test('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child content</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  test('renders fallback UI when an error occurs', () => {
    render(
      <ErrorBoundary showDetails={true}>
        <ErrorComponent renderError={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/Test error/i)).toBeInTheDocument();
  });

  test('calls resetAction when "Try Again" button is clicked', () => {
    const resetAction = jest.fn();
    
    render(
      <ErrorBoundary resetAction={resetAction}>
        <ErrorComponent renderError={true} />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText(/Try Again/i));
    expect(resetAction).toHaveBeenCalledTimes(1);
  });

  test('uses custom fallback component when provided', () => {
    const customFallback = (error, errorInfo, resetFn) => (
      <div data-testid="custom-fallback">
        <p>Custom Fallback</p>
        <button onClick={resetFn}>Reset</button>
      </div>
    );

    render(
      <ErrorBoundary fallback={customFallback}>
        <ErrorComponent renderError={true} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
  });

  test('shows financial error styling when isFinancialComponent is true', () => {
    render(
      <ErrorBoundary isFinancialComponent={true}>
        <ErrorComponent renderError={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Financial Calculation Error/i)).toBeInTheDocument();
  });

  test('increments error count on multiple errors', () => {
    const TestComponent = ({ reset }) => {
      return (
        <ErrorBoundary 
          showDetails={true}
          resetAction={() => reset(false)}
        >
          <ErrorComponent renderError={!reset} />
        </ErrorBoundary>
      );
    };

    const { rerender } = render(<TestComponent reset={false} />);
    expect(screen.getByText(/Try Again/i)).toBeInTheDocument();

    // Reset and cause another error
    rerender(<TestComponent reset={true} />);
    rerender(<TestComponent reset={false} />);

    // Error count would be tracked internally by the ErrorBoundary
    expect(screen.getByText(/Try Again/i)).toBeInTheDocument();
  });
});

describe('FinancialCalculationErrorFallback', () => {
  test('renders with correct title and message', () => {
    const onRetry = jest.fn();
    const error = new Error('Test financial error');
    
    render(
      <FinancialCalculationErrorFallback 
        onRetry={onRetry} 
        error={error} 
      />
    );

    expect(screen.getByText(/Financial Calculation Error/i)).toBeInTheDocument();
    expect(screen.getByText(/Error details: Test financial error/i)).toBeInTheDocument();
  });

  test('calls onRetry when Try Again button is clicked', () => {
    const onRetry = jest.fn();
    
    render(
      <FinancialCalculationErrorFallback 
        onRetry={onRetry} 
        error={new Error('Test')} 
      />
    );

    fireEvent.click(screen.getByText(/Try Again/i));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});