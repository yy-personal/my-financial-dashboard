import { renderHook, act } from '@testing-library/react-hooks';
import useErrorHandler from '../hooks/useErrorHandler';

describe('useErrorHandler', () => {
  test('initializes with no error', () => {
    const { result } = renderHook(() => useErrorHandler('TestComponent'));
    
    expect(result.current.error).toBeNull();
    expect(result.current.hasError).toBe(false);
  });

  test('handleError sets error state', () => {
    const { result } = renderHook(() => useErrorHandler('TestComponent'));
    const testError = new Error('Test error');
    
    act(() => {
      result.current.handleError(testError);
    });
    
    expect(result.current.error).toBe(testError);
    expect(result.current.hasError).toBe(true);
  });

  test('clearError resets error state', () => {
    const { result } = renderHook(() => useErrorHandler('TestComponent'));
    const testError = new Error('Test error');
    
    act(() => {
      result.current.handleError(testError);
    });
    
    expect(result.current.hasError).toBe(true);
    
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBeNull();
    expect(result.current.hasError).toBe(false);
  });

  test('tryCatch executes function and returns result', () => {
    const { result } = renderHook(() => useErrorHandler('TestComponent'));
    
    const testFn = (a, b) => a + b;
    
    let sum;
    act(() => {
      sum = result.current.tryCatch(testFn, [2, 3]);
    });
    
    expect(sum).toBe(5);
    expect(result.current.hasError).toBe(false);
  });

  test('tryCatch catches errors and sets error state', () => {
    const { result } = renderHook(() => useErrorHandler('TestComponent'));
    
    const errorFn = () => {
      throw new Error('Function error');
    };
    
    let returnValue;
    act(() => {
      returnValue = result.current.tryCatch(errorFn);
    });
    
    expect(returnValue).toBeUndefined();
    expect(result.current.hasError).toBe(true);
    expect(result.current.error.message).toBe('Function error');
  });

  test('withErrorHandling creates a function that handles errors', async () => {
    const { result } = renderHook(() => useErrorHandler('TestComponent'));
    
    const asyncErrorFn = async () => {
      throw new Error('Async error');
    };
    
    let wrappedFn;
    act(() => {
      wrappedFn = result.current.withErrorHandling(asyncErrorFn);
    });
    
    let returnValue;
    await act(async () => {
      returnValue = await wrappedFn();
    });
    
    expect(returnValue).toBeUndefined();
    expect(result.current.hasError).toBe(true);
    expect(result.current.error.message).toBe('Async error');
  });

  test('withErrorHandling returns function result for successful execution', async () => {
    const { result } = renderHook(() => useErrorHandler('TestComponent'));
    
    const asyncSuccessFn = async (value) => {
      return value * 2;
    };
    
    let wrappedFn;
    act(() => {
      wrappedFn = result.current.withErrorHandling(asyncSuccessFn);
    });
    
    let returnValue;
    await act(async () => {
      returnValue = await wrappedFn(5);
    });
    
    expect(returnValue).toBe(10);
    expect(result.current.hasError).toBe(false);
  });
});