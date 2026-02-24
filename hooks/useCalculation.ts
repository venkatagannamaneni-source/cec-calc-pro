// Generic calculation state handler hook
import { useState, useCallback } from 'react';

interface CalculationState<T> {
  result: T | null;
  error: string | null;
  isCalculating: boolean;
}

export function useCalculation<TInput, TResult>(
  calculationFn: (input: TInput) => TResult | { error: string },
) {
  const [state, setState] = useState<CalculationState<TResult>>({
    result: null,
    error: null,
    isCalculating: false,
  });

  const calculate = useCallback(
    (input: TInput) => {
      setState({ result: null, error: null, isCalculating: true });

      try {
        const result = calculationFn(input);

        if (result && typeof result === 'object' && 'error' in result) {
          setState({ result: null, error: (result as { error: string }).error, isCalculating: false });
        } else {
          setState({ result: result as TResult, error: null, isCalculating: false });
        }
      } catch (e) {
        setState({
          result: null,
          error: e instanceof Error ? e.message : 'Calculation failed',
          isCalculating: false,
        });
      }
    },
    [calculationFn],
  );

  const reset = useCallback(() => {
    setState({ result: null, error: null, isCalculating: false });
  }, []);

  return { ...state, calculate, reset };
}
