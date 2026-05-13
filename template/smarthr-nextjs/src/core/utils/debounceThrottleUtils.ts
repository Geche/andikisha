// Utility functions for debouncing and throttling

// Debounce function
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  } = {}
): ((...args: Parameters<T>) => void) => {
  const { leading = false, trailing = true, maxWait } = options;
  let timeoutId: NodeJS.Timeout | undefined;
  let lastCallTime = 0;
  let lastArgs: Parameters<T> | undefined;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    const shouldCallLeading = leading && timeSinceLastCall >= delay;

    lastArgs = args;

    // Handle leading call
    if (shouldCallLeading) {
      func(...args);
      lastCallTime = now;
      return;
    }

    // Cancel existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set up new timeout
    timeoutId = setTimeout(() => {
      if (trailing && lastArgs) {
        func(...lastArgs);
        lastCallTime = Date.now();
      }
    }, delay);

    // Handle maxWait
    if (maxWait && timeSinceLastCall >= maxWait) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      func(...args);
      lastCallTime = now;
    }
  };
};

// Throttle function
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
  } = {}
): ((...args: Parameters<T>) => void) => {
  const { leading = true, trailing = true } = options;
  let lastRun = 0;
  let timeoutId: NodeJS.Timeout | undefined;
  let lastArgs: Parameters<T> | undefined;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRun;

    lastArgs = args;

    // Handle leading call
    if (leading && timeSinceLastRun >= delay) {
      func(...args);
      lastRun = now;
      return;
    }

    // Handle trailing call
    if (trailing && !timeoutId) {
      timeoutId = setTimeout(() => {
        if (lastArgs) {
          func(...lastArgs);
          lastRun = Date.now();
        }
        timeoutId = undefined;
      }, delay - timeSinceLastRun);
    }
  };
};

// Search debounce utility
export const createSearchDebounce = (
  searchFunction: (term: string) => void,
  delay: number = 300,
  minLength: number = 2
) => {
  let timeoutId: NodeJS.Timeout | undefined;

  return (searchTerm: string) => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Don't search if term is too short
    if (searchTerm.length < minLength) {
      return;
    }

    // Set new timeout
    timeoutId = setTimeout(() => {
      searchFunction(searchTerm);
    }, delay);
  };
};

// Scroll throttle utility
export const createScrollThrottle = (
  scrollFunction: (event: Event) => void,
  delay: number = 16
) => {
  let lastRun = 0;
  let timeoutId: NodeJS.Timeout | undefined;

  return (event: Event) => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRun;

    if (timeSinceLastRun >= delay) {
      scrollFunction(event);
      lastRun = now;
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        scrollFunction(event);
        lastRun = Date.now();
        timeoutId = undefined;
      }, delay - timeSinceLastRun);
    }
  };
};

// Resize throttle utility
export const createResizeThrottle = (
  resizeFunction: (dimensions: { width: number; height: number }) => void,
  delay: number = 100
) => {
  let lastRun = 0;
  let timeoutId: NodeJS.Timeout | undefined;

  return () => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRun;

    if (timeSinceLastRun >= delay) {
      resizeFunction({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      lastRun = now;
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        resizeFunction({
          width: window.innerWidth,
          height: window.innerHeight,
        });
        lastRun = Date.now();
        timeoutId = undefined;
      }, delay - timeSinceLastRun);
    }
  };
};

// API call debounce utility
export const createApiDebounce = <T>(
  apiCall: (value: T) => Promise<unknown>,
  delay: number = 500,
  options: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  } = {}
) => {
  const { leading = false, trailing = true, maxWait } = options;
  let timeoutId: NodeJS.Timeout | undefined;
  let lastCallTime = 0;
  let lastValue: T | undefined;

  return async (value: T) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    const shouldCallLeading = leading && timeSinceLastCall >= delay;

    lastValue = value;

    // Handle leading call
    if (shouldCallLeading) {
      const result = await apiCall(value);
      lastCallTime = now;
      return result;
    }

    // Cancel existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set up new timeout
    timeoutId = setTimeout(async () => {
      if (trailing && lastValue !== undefined) {
        const result = await apiCall(lastValue);
        lastCallTime = Date.now();
        return result;
      }
    }, delay);

    // Handle maxWait
    if (maxWait && timeSinceLastCall >= maxWait) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const result = await apiCall(value);
      lastCallTime = now;
      return result;
    }

    // Return undefined for trailing calls that are queued
    return undefined;
  };
};

// Input debounce utility
export const createInputDebounce = <T>(
  inputFunction: (value: T) => void,
  delay: number = 300,
  options: {
    leading?: boolean;
    trailing?: boolean;
    validate?: (value: T) => boolean;
  } = {}
) => {
  const { leading = false, trailing = true, validate } = options;
  let timeoutId: NodeJS.Timeout | undefined;
  let lastCallTime = 0;
  let lastValue: T | undefined;

  return (value: T) => {
    // Validate if validator is provided
    if (validate && !validate(value)) {
      return;
    }

    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    const shouldCallLeading = leading && timeSinceLastCall >= delay;

    lastValue = value;

    // Handle leading call
    if (shouldCallLeading) {
      inputFunction(value);
      lastCallTime = now;
      return;
    }

    // Cancel existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set up new timeout
    timeoutId = setTimeout(() => {
      if (trailing && lastValue !== undefined) {
        inputFunction(lastValue);
        lastCallTime = Date.now();
      }
    }, delay);
  };
};

// Batch update utility
export const createBatchUpdate = <T>(
  updateFunction: (values: T[]) => void,
  delay: number = 100
) => {
  let timeoutId: NodeJS.Timeout | undefined;
  let batch: T[] = [];

  return (value: T) => {
    batch.push(value);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      if (batch.length > 0) {
        updateFunction([...batch]);
        batch = [];
      }
    }, delay);
  };
};

// Rate limiting utility
export const createRateLimit = <T extends (...args: unknown[]) => unknown>(
  func: T,
  maxCalls: number,
  timeWindow: number
): ((...args: Parameters<T>) => void) => {
  let calls: number[] = [];

  return (...args: Parameters<T>) => {
    const now = Date.now();

    // Remove calls outside the time window
    calls = calls.filter((time) => now - time < timeWindow);

    if (calls.length < maxCalls) {
      calls.push(now);
      func(...args);
    }
  };
};

// Debounce decorator for class methods
export const debounceMethod = (
  delay: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  } = {}
) => {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const debouncedMethod = debounce(originalMethod, delay, options);

    descriptor.value = function (...args: unknown[]) {
      return debouncedMethod.apply(this, args);
    };

    return descriptor;
  };
};

// Throttle decorator for class methods
export const throttleMethod = (
  delay: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
  } = {}
) => {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const throttledMethod = throttle(originalMethod, delay, options);

    descriptor.value = function (...args: unknown[]) {
      return throttledMethod.apply(this, args);
    };

    return descriptor;
  };
};

// Performance monitoring for debounced/throttled functions
export const createMonitoredDebounce = <
  T extends (...args: unknown[]) => unknown
>(
  func: T,
  delay: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
    onPerformance?: (metrics: { calls: number; avgTime: number }) => void;
  } = {}
) => {
  const { onPerformance, ...debounceOptions } = options;
  let callCount = 0;
  let totalTime = 0;

  const monitoredFunc = (...args: Parameters<T>) => {
    const startTime = performance.now();
    const result = func(...args);
    const endTime = performance.now();

    callCount++;
    totalTime += endTime - startTime;

    if (onPerformance && callCount % 10 === 0) {
      onPerformance({
        calls: callCount,
        avgTime: totalTime / callCount,
      });
    }

    return result;
  };

  return debounce(
    monitoredFunc as (...args: unknown[]) => unknown,
    delay,
    debounceOptions
  );
};

// Utility to cancel all pending debounced/throttled functions
export class DebounceThrottleManager {
  private timeouts: Set<NodeJS.Timeout> = new Set();

  addTimeout(timeout: NodeJS.Timeout) {
    this.timeouts.add(timeout);
  }

  removeTimeout(timeout: NodeJS.Timeout) {
    this.timeouts.delete(timeout);
  }

  cancelAll() {
    this.timeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.timeouts.clear();
  }

  getPendingCount() {
    return this.timeouts.size;
  }
}

// Global manager instance
export const globalDebounceManager = new DebounceThrottleManager();
