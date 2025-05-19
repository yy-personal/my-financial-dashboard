# Error Handling System Documentation

## Overview

This document provides an overview of the error handling system implemented in the Financial Dashboard application. The system is designed to provide graceful error recovery, meaningful error messages, and a consistent user experience when errors occur.

## Key Components

### 1. Error Utilities (`ErrorUtils.js`)

The Error Utilities module provides a set of helper functions for error handling:

- `logError`: Logs errors to the console and optionally to an error tracking service
- `formatFinancialError`: Formats financial calculation errors in a user-friendly way
- `createFinancialError`: Creates error objects with specific error codes
- `safeParseNumber`: Safely parses numeric values with fallbacks
- `safeDivide`: Performs division with protection against divide-by-zero errors
- `safeGet`: Safely accesses nested properties in objects
- `validateFinancialData`: Validates financial data for completeness and correctness

### 2. Error Boundary Component

The enhanced `ErrorBoundary` component catches JavaScript errors in its child component tree and displays fallback UIs. Key features:

- Support for different error severity levels
- Customizable fallback UI
- Error reset functionality
- Special handling for financial components
- Error counting and max retry limits
- Detailed error reporting for development mode

### 3. Specialized Error Fallbacks

Specialized error fallback components for different parts of the application:

- `FinancialCalculationErrorFallback`: For financial calculation errors
- `ChartErrorFallback`: For chart rendering errors
- `ProjectionErrorFallback`: For projection calculation errors
- `CriticalErrorFallback`: For critical application errors

### 4. Custom Error Hook (`useErrorHandler`)

A custom React hook for managing errors within components and other hooks:

- Error state management
- Error logging functionality
- Try-catch wrappers for functions
- Async error handling

## Error Handling Strategy

### Granular Error Boundaries

The application uses multiple error boundaries at different levels:

1. **Root Level**: Captures application-wide errors and prevents the entire app from crashing
2. **Page Level**: Each route has its own error boundary
3. **Section Level**: Critical dashboard sections have their own error boundaries
4. **Component Level**: Individual complex components have specialized error boundaries

### Safe Data Access and Calculations

Financial calculations are wrapped with safety mechanisms:

- Null/undefined checks
- Type checking and conversion
- Division-by-zero protection
- Data validation before calculations

### Graceful Degradation

When errors occur, the system:

1. Displays user-friendly error messages
2. Provides context-specific guidance
3. Offers retry options where appropriate
4. Falls back to default values when possible
5. Continues to render the rest of the application

## Usage Examples

### Using the ErrorBoundary Component

```jsx
// Basic usage
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary 
  fallback={(error, errorInfo, resetFn) => (
    <CustomErrorDisplay 
      error={error} 
      onReset={resetFn} 
    />
  )}
>
  <MyComponent />
</ErrorBoundary>

// For financial components
<ErrorBoundary 
  isFinancialComponent={true}
  componentName="AssetAllocation"
  showDetails={process.env.NODE_ENV !== "production"}
>
  <AssetAllocationChart data={assetData} />
</ErrorBoundary>
```

### Using the Error Hook

```jsx
// In a custom hook
const useMyHook = () => {
  const { 
    error, 
    hasError, 
    handleError, 
    clearError, 
    tryCatch 
  } = useErrorHandler('useMyHook');
  
  // Safe calculation using tryCatch
  const calculateResult = () => {
    return tryCatch(() => {
      // Complex calculation that might throw errors
      const result = someComplexCalculation();
      return result;
    }, [], { additionalContext: 'some info' });
  };
  
  // Return error state along with other hook results
  return {
    error,
    hasError,
    clearError,
    // other values...
  };
};
```

### Safe Data Handling

```jsx
// Safe property access
const userName = safeGet(userData, 'profile.name', 'Unknown User');

// Safe division
const percentage = safeDivide(completedItems, totalItems, 0) * 100;

// Safe number parsing
const amount = safeParseNumber(inputValue, 0);
```

## Testing Error Handling

The error handling system includes comprehensive tests:

- ErrorBoundary component tests
- Error fallback component tests
- useErrorHandler hook tests
- Validation function tests

## Error Codes

Common error codes used in the application:

| Code | Description |
|------|-------------|
| `dividend_by_zero` | Attempted division by zero |
| `negative_value` | Negative values where not allowed |
| `invalid_date` | Invalid date provided |
| `missing_data` | Required financial data is missing |
| `calculation_overflow` | Calculation resulted in too large a value |
| `invalid_parameter` | Invalid parameter provided |

## Future Improvements

Potential enhancements to the error handling system:

1. Integration with an error tracking service (e.g., Sentry)
2. Error analytics to identify common user issues
3. More advanced self-healing mechanisms
4. Enhanced error prediction and prevention
5. Guided recovery workflows for complex errors