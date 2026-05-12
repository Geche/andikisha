import React, {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState,
} from "react";

// Performance context
export const PerformanceContext = React.createContext<{
  trackRender: (componentName: string, renderTime: number) => void;
  trackInteraction: (componentName: string, interactionType: string) => void;
}>({
  trackRender: () => {},
  trackInteraction: () => {},
});

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const currentTime = performance.now();
    const renderTime = currentTime - lastRenderTime.current;

    // Log slow renders in development
    if (process.env.NODE_ENV === "development" && renderTime > 16) {
      console.warn(
        `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
      );
    }

    lastRenderTime.current = currentTime;

    // Track performance metrics
    if (window.performanceMetrics) {
      window.performanceMetrics.trackRender(componentName, renderTime);
    }
  });

  return {
    renderCount: renderCount.current,
    lastRenderTime: lastRenderTime.current,
  };
};

// Debounce hook for search and filtering
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for scroll and resize events
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCall = useRef(0);
  const lastCallTimer = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: any[]) => {
      const now = Date.now();

      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      } else {
        if (lastCallTimer.current) {
          clearTimeout(lastCallTimer.current);
        }

        lastCallTimer.current = setTimeout(() => {
          lastCall.current = Date.now();
          callback(...args);
        }, delay - (now - lastCall.current));
      }
    }) as T,
    [callback, delay]
  );
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options, hasIntersected]);

  return { elementRef, isIntersecting, hasIntersected };
};

// Virtual scrolling hook
export const useVirtualScrolling = <T,>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    containerRef,
    handleScroll,
    visibleItems,
    offsetY,
    totalHeight,
    startIndex,
    endIndex,
  };
};

// Memory optimization hook for large lists
export const useListOptimization = <T,>(
  items: T[],
  maxVisibleItems: number = 100
) => {
  const [visibleCount, setVisibleCount] = useState(maxVisibleItems);
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = items.length > visibleCount;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + maxVisibleItems, items.length));
  }, [items.length, maxVisibleItems]);

  const expandAll = useCallback(() => {
    setVisibleCount(items.length);
    setIsExpanded(true);
  }, [items.length]);

  const collapse = useCallback(() => {
    setVisibleCount(maxVisibleItems);
    setIsExpanded(false);
  }, [maxVisibleItems]);

  return {
    visibleItems,
    hasMore,
    isExpanded,
    loadMore,
    expandAll,
    collapse,
    totalCount: items.length,
    visibleCount,
  };
};

// Image lazy loading hook
export const useLazyImage = (src: string, alt: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const { elementRef } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "50px",
  });

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    elementRef.current = img;

    if (isInView && !isLoaded) {
      img.src = src;
      img.alt = alt;
    }
  }, [src, alt, isInView, isLoaded, elementRef]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    console.error(`Failed to load image: ${src}`);
  }, [src]);

  return {
    imgRef,
    isLoaded,
    isInView,
    handleLoad,
    handleError,
  };
};

// Form optimization hook
export const useFormOptimization = <T extends Record<string, any>>(
  initialValues: T
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const setFieldValue = useCallback(
    (field: keyof T, value: T[keyof T]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      setIsDirty(true);

      // Clear field error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
    setIsDirty(false);
  }, [initialValues]);

  const validateForm = useCallback(
    (validationSchema?: any) => {
      // Add validation logic here
      return Object.keys(errors).length === 0;
    },
    [errors]
  );

  return {
    values,
    errors,
    isSubmitting,
    isDirty,
    setFieldValue,
    setFieldError,
    setValues,
    setIsSubmitting,
    resetForm,
    validateForm,
  };
};

// API call optimization hook
export const useApiOptimization = <T, P = void>(
  apiCall: (params: P) => Promise<T>,
  options: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    retryCount?: number;
    retryDelay?: number;
  } = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const maxRetries = options.retryCount || 3;
  const retryDelay = options.retryDelay || 1000;

  const execute = useCallback(
    async (params: P) => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiCall(params);
        setData(result);
        setRetryCount(0);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("API call failed");
        setError(error);

        if (retryCount < maxRetries) {
          setRetryCount((prev) => prev + 1);
          setTimeout(() => execute(params), retryDelay);
        } else {
          options.onError?.(error);
        }

        throw error;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, options, retryCount, maxRetries, retryDelay]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
    setRetryCount(0);
  }, []);

  return {
    data,
    loading,
    error,
    retryCount,
    execute,
    reset,
  };
};

// Window resize optimization hook
export const useWindowResizeOptimization = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const handleResize = useThrottle(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, 100);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  return windowSize;
};

// Scroll optimization hook
export const useScrollOptimization = () => {
  const [scrollPosition, setScrollPosition] = useState({
    x: window.pageXOffset,
    y: window.pageYOffset,
  });

  const handleScroll = useThrottle(() => {
    setScrollPosition({
      x: window.pageXOffset,
      y: window.pageYOffset,
    });
  }, 16); // ~60fps

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return scrollPosition;
};

// Keyboard shortcut optimization hook
export const useKeyboardShortcutOptimization = (
  key: string,
  callback: (event: KeyboardEvent) => void,
  options: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
  } = {}
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        !!event.ctrlKey === !!options.ctrl &&
        !!event.altKey === !!options.alt &&
        !!event.shiftKey === !!options.shift &&
        !!event.metaKey === !!options.meta
      ) {
        event.preventDefault();
        callback(event);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, options]);
};

// Click outside optimization hook
export const useClickOutsideOptimization = (
  ref: React.RefObject<HTMLElement>,
  callback: () => void
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, callback]);
};

// Previous value optimization hook
export const usePreviousOptimization = <T,>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

// Mounted state optimization hook
export const useMountedOptimization = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted;
};

// Loading timeout optimization hook
export const useLoadingTimeoutOptimization = (timeout = 5000) => {
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    setLoading(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setLoading(false);
    }, timeout);
  }, [timeout]);

  const stopLoading = useCallback(() => {
    setLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    loading,
    startLoading,
    stopLoading,
  };
};

// Declare global performance metrics interface
declare global {
  interface Window {
    performanceMetrics?: {
      trackRender: (componentName: string, renderTime: number) => void;
    };
  }
}
