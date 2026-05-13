import { useCallback, useRef, useEffect, useState } from "react";

// Advanced debounce hook with leading/trailing options
export const useAdvancedDebounce = <T,>(
  value: T,
  delay: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  } = {}
) => {
  const { leading = false, trailing = true, maxWait } = options;
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastCallTimeRef = useRef<number>(0);
  const lastValueRef = useRef<T>(value);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      setDebouncedValue(lastValueRef.current);
      cancel();
    }
  }, [cancel]);

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTimeRef.current;
    const shouldCallLeading = leading && timeSinceLastCall >= delay;

    // Update last value
    lastValueRef.current = value;

    // Handle leading call
    if (shouldCallLeading) {
      setDebouncedValue(value);
      lastCallTimeRef.current = now;
      return;
    }

    // Cancel existing timeout
    cancel();

    // Set up new timeout
    timeoutRef.current = setTimeout(() => {
      if (trailing) {
        setDebouncedValue(value);
        lastCallTimeRef.current = Date.now();
      }
    }, delay);

    // Handle maxWait
    if (maxWait && timeSinceLastCall >= maxWait) {
      flush();
    }

    return cancel;
  }, [value, delay, leading, trailing, maxWait, cancel, flush]);

  return {
    value: debouncedValue,
    cancel,
    flush,
    isPending: !!timeoutRef.current,
  };
};

// Advanced throttle hook with leading/trailing options
export const useAdvancedThrottle = <T,>(
  value: T,
  delay: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
  } = {}
) => {
  const { leading = true, trailing = true } = options;
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastValueRef = useRef<T>(value);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      setThrottledValue(lastValueRef.current);
      cancel();
    }
  }, [cancel]);

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRunRef.current;

    // Update last value
    lastValueRef.current = value;

    // Handle leading call
    if (leading && timeSinceLastRun >= delay) {
      setThrottledValue(value);
      lastRunRef.current = now;
      return;
    }

    // Handle trailing call
    if (trailing && !timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        setThrottledValue(value);
        lastRunRef.current = Date.now();
        timeoutRef.current = undefined;
      }, delay - timeSinceLastRun);
    }

    return cancel;
  }, [value, delay, leading, trailing, cancel]);

  return {
    value: throttledValue,
    cancel,
    flush,
    isPending: !!timeoutRef.current,
  };
};

// Search debounce hook specifically for search inputs
export const useSearchDebounce = (
  searchTerm: string,
  delay: number = 300,
  minLength: number = 2
) => {
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't search if term is too short
    if (searchTerm.length < minLength) {
      setDebouncedSearch("");
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setIsSearching(false);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm, delay, minLength]);

  const cancelSearch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    setIsSearching(false);
  }, []);

  return {
    searchTerm: debouncedSearch,
    isSearching,
    cancelSearch,
    hasValidSearch: debouncedSearch.length >= minLength,
  };
};

// Scroll throttle hook for scroll events
export const useScrollThrottle = (
  delay: number = 16, // ~60fps
  options: {
    leading?: boolean;
    trailing?: boolean;
  } = {}
) => {
  const { leading = true, trailing = true } = options;
  const [scrollData, setScrollData] = useState({
    scrollTop: 0,
    scrollLeft: 0,
    scrollHeight: 0,
    scrollWidth: 0,
    clientHeight: 0,
    clientWidth: 0,
  });
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLElement> | Event) => {
      const target = e.target as HTMLElement;
      const now = Date.now();
      const timeSinceLastRun = now - lastRunRef.current;

      const newScrollData = {
        scrollTop: target.scrollTop || 0,
        scrollLeft: target.scrollLeft || 0,
        scrollHeight: target.scrollHeight || 0,
        scrollWidth: target.scrollWidth || 0,
        clientHeight: target.clientHeight || 0,
        clientWidth: target.clientWidth || 0,
      };

      // Handle leading call
      if (leading && timeSinceLastRun >= delay) {
        setScrollData(newScrollData);
        lastRunRef.current = now;
        return;
      }

      // Handle trailing call
      if (trailing && !timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          setScrollData(newScrollData);
          lastRunRef.current = Date.now();
          timeoutRef.current = undefined;
        }, delay - timeSinceLastRun);
      }
    },
    [delay, leading, trailing]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  return {
    scrollData,
    handleScroll,
    cancel,
    isScrolling: !!timeoutRef.current,
  };
};

// Resize throttle hook for window resize events
export const useResizeThrottle = (
  delay: number = 100,
  options: {
    leading?: boolean;
    trailing?: boolean;
  } = {}
) => {
  const { leading = true, trailing = true } = options;
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleResize = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRunRef.current;

    const newDimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Handle leading call
    if (leading && timeSinceLastRun >= delay) {
      setDimensions(newDimensions);
      lastRunRef.current = now;
      return;
    }

    // Handle trailing call
    if (trailing && !timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        setDimensions(newDimensions);
        lastRunRef.current = Date.now();
        timeoutRef.current = undefined;
      }, delay - timeSinceLastRun);
    }
  }, [delay, leading, trailing]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleResize]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  return {
    dimensions,
    cancel,
    isResizing: !!timeoutRef.current,
  };
};

// API call debounce hook for preventing excessive API calls
export const useApiDebounce = <T,>(
  apiCall: (value: T) => Promise<any>,
  delay: number = 500,
  options: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  } = {}
) => {
  const { leading = false, trailing = true, maxWait } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastCallTimeRef = useRef<number>(0);
  const lastValueRef = useRef<T | null>(null);

  const executeCall = useCallback(
    async (value: T) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await apiCall(value);
        setLastResult(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("API call failed");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [apiCall]
  );

  const debouncedCall = useCallback(
    (value: T) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTimeRef.current;
      const shouldCallLeading = leading && timeSinceLastCall >= delay;

      // Update last value
      lastValueRef.current = value;

      // Handle leading call
      if (shouldCallLeading) {
        executeCall(value);
        lastCallTimeRef.current = now;
        return;
      }

      // Cancel existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set up new timeout
      timeoutRef.current = setTimeout(() => {
        if (trailing && lastValueRef.current !== null) {
          executeCall(lastValueRef.current);
          lastCallTimeRef.current = Date.now();
        }
      }, delay);

      // Handle maxWait
      if (maxWait && timeSinceLastCall >= maxWait) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        executeCall(value);
        lastCallTimeRef.current = now;
      }
    },
    [delay, leading, trailing, maxWait, executeCall]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current && lastValueRef.current !== null) {
      executeCall(lastValueRef.current);
      cancel();
    }
  }, [executeCall, cancel]);

  return {
    debouncedCall,
    isLoading,
    lastResult,
    error,
    cancel,
    flush,
    isPending: !!timeoutRef.current,
  };
};

// Input debounce hook for form inputs
export const useInputDebounce = <T,>(
  initialValue: T,
  delay: number = 300,
  options: {
    leading?: boolean;
    trailing?: boolean;
    validate?: (value: T) => boolean;
  } = {}
) => {
  const { leading = false, trailing = true, validate } = options;
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const [isValid, setIsValid] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastCallTimeRef = useRef<number>(0);

  const updateValue = useCallback(
    (newValue: T) => {
      setValue(newValue);

      // Validate if validator is provided
      if (validate) {
        setIsValid(validate(newValue));
      }

      const now = Date.now();
      const timeSinceLastCall = now - lastCallTimeRef.current;
      const shouldCallLeading = leading && timeSinceLastCall >= delay;

      // Handle leading call
      if (shouldCallLeading) {
        setDebouncedValue(newValue);
        lastCallTimeRef.current = now;
        return;
      }

      // Cancel existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set up new timeout
      timeoutRef.current = setTimeout(() => {
        if (trailing) {
          setDebouncedValue(newValue);
          lastCallTimeRef.current = Date.now();
        }
      }, delay);
    },
    [delay, leading, trailing, validate]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      setDebouncedValue(value);
      cancel();
    }
  }, [value, cancel]);

  return {
    value,
    debouncedValue,
    isValid,
    updateValue,
    cancel,
    flush,
    isPending: !!timeoutRef.current,
  };
};
