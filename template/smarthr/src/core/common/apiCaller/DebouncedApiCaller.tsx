import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useApiDebounce } from "../../hooks/useDebounceThrottle";

interface ApiCallerProps<T> {
  apiCall: (value: T) => Promise<unknown>;
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
  onSuccess?: (result: unknown) => void;
  onError?: (error: Error) => void;
  onLoadingChange?: (loading: boolean) => void;
  children: (props: {
    call: (value: T) => void;
    isLoading: boolean;
    lastResult: unknown;
    error: Error | null;
    cancel: () => void;
    flush: () => void;
    isPending: boolean;
  }) => React.ReactNode;
  autoCall?: boolean;
  initialValue?: T;
  retryCount?: number;
  retryDelay?: number;
}

const DebouncedApiCaller = <T,>({
  apiCall,
  delay = 500,
  leading = false,
  trailing = true,
  maxWait,
  onSuccess,
  onError,
  onLoadingChange,
  children,
  autoCall = false,
  initialValue,
  retryCount = 0,
  retryDelay = 1000,
}: ApiCallerProps<T>) => {
  const [lastError, setLastError] = useState<Error | null>(null);

  // Enhanced API call with retry logic
  const enhancedApiCall = useCallback(
    async (value: T): Promise<unknown> => {
      let attempts = 0;

      while (attempts <= retryCount) {
        try {
          const result = await apiCall(value);
          setLastError(null);
          onSuccess?.(result);
          return result;
        } catch (error) {
          attempts++;
          const errorObj =
            error instanceof Error ? error : new Error("API call failed");
          setLastError(errorObj);

          if (attempts <= retryCount) {
            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          } else {
            onError?.(errorObj);
            throw errorObj;
          }
        }
      }

      // This should never be reached, but TypeScript needs it
      throw new Error("Unexpected end of retry loop");
    },
    [apiCall, retryCount, retryDelay, onSuccess, onError]
  );

  // Use the API debounce hook
  const {
    debouncedCall,
    isLoading,
    lastResult,
    error,
    cancel,
    flush,
    isPending,
  } = useApiDebounce(enhancedApiCall, delay, {
    leading,
    trailing,
    maxWait,
  });

  // Notify loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  // Auto call effect
  useEffect(() => {
    if (autoCall && initialValue !== undefined) {
      debouncedCall(initialValue);
    }
  }, [autoCall, initialValue, debouncedCall]);

  // Memoize the children props
  const childrenProps = useMemo(
    () => ({
      call: debouncedCall,
      isLoading,
      lastResult,
      error: error || lastError,
      cancel,
      flush,
      isPending,
    }),
    [
      debouncedCall,
      isLoading,
      lastResult,
      error,
      lastError,
      cancel,
      flush,
      isPending,
    ]
  );

  return <>{children(childrenProps)}</>;
};

export default React.memo(DebouncedApiCaller) as <T>(
  props: ApiCallerProps<T>
) => React.ReactElement;
