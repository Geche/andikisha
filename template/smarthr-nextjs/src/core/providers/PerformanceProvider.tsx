import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { PerformanceContext } from "../hooks/usePerformanceOptimizations";

interface PerformanceProviderProps {
  children: React.ReactNode;
  enableProfiling?: boolean;
  enableMemoization?: boolean;
  enableVirtualization?: boolean;
}

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  renderCount: number;
  timestamp: number;
}

interface PerformanceState {
  metrics: PerformanceMetrics[];
  isProfilingEnabled: boolean;
  isMemoizationEnabled: boolean;
  isVirtualizationEnabled: boolean;
}

interface PerformanceActions {
  toggleProfiling: () => void;
  toggleMemoization: () => void;
  toggleVirtualization: () => void;
  clearMetrics: () => void;
  addMetric: (metric: PerformanceMetrics) => void;
  getSlowComponents: (threshold?: number) => PerformanceMetrics[];
  getAverageRenderTime: () => number;
}

const PerformanceStateContext = createContext<PerformanceState | null>(null);
const PerformanceActionsContext = createContext<PerformanceActions | null>(
  null
);

// Performance provider component
export const PerformanceProvider = React.memo(
  ({
    children,
    enableProfiling = false,
    enableMemoization = true,
    enableVirtualization = true,
  }: PerformanceProviderProps) => {
    const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
    const [isProfilingEnabled, setIsProfilingEnabled] =
      useState(enableProfiling);
    const [isMemoizationEnabled, setIsMemoizationEnabled] =
      useState(enableMemoization);
    const [isVirtualizationEnabled, setIsVirtualizationEnabled] =
      useState(enableVirtualization);

    // Toggle profiling
    const toggleProfiling = useCallback(() => {
      setIsProfilingEnabled((prev) => !prev);
    }, []);

    // Toggle memoization
    const toggleMemoization = useCallback(() => {
      setIsMemoizationEnabled((prev) => !prev);
    }, []);

    // Toggle virtualization
    const toggleVirtualization = useCallback(() => {
      setIsVirtualizationEnabled((prev) => !prev);
    }, []);

    // Clear metrics
    const clearMetrics = useCallback(() => {
      setMetrics([]);
    }, []);

    // Add metric
    const addMetric = useCallback((metric: PerformanceMetrics) => {
      setMetrics((prev) => {
        const newMetrics = [...prev, metric];
        // Keep only last 1000 metrics to prevent memory issues
        if (newMetrics.length > 1000) {
          return newMetrics.slice(-1000);
        }
        return newMetrics;
      });
    }, []);

    // Get slow components
    const getSlowComponents = useCallback(
      (threshold = 16) => {
        return metrics.filter((metric) => metric.renderTime > threshold);
      },
      [metrics]
    );

    // Get average render time
    const getAverageRenderTime = useCallback(() => {
      if (metrics.length === 0) return 0;
      const totalTime = metrics.reduce(
        (sum, metric) => sum + metric.renderTime,
        0
      );
      return totalTime / metrics.length;
    }, [metrics]);

    // Memoize the state
    const state = useMemo(
      () => ({
        metrics,
        isProfilingEnabled,
        isMemoizationEnabled,
        isVirtualizationEnabled,
      }),
      [
        metrics,
        isProfilingEnabled,
        isMemoizationEnabled,
        isVirtualizationEnabled,
      ]
    );

    // Memoize the actions
    const actions = useMemo(
      () => ({
        toggleProfiling,
        toggleMemoization,
        toggleVirtualization,
        clearMetrics,
        addMetric,
        getSlowComponents,
        getAverageRenderTime,
      }),
      [
        toggleProfiling,
        toggleMemoization,
        toggleVirtualization,
        clearMetrics,
        addMetric,
        getSlowComponents,
        getAverageRenderTime,
      ]
    );

    // Track render function
    const trackRender = useCallback(
      (componentName: string, renderTime: number) => {
        if (isProfilingEnabled) {
          addMetric({
            componentName,
            renderTime,
            renderCount: 1,
            timestamp: Date.now(),
          });
        }
      },
      [isProfilingEnabled, addMetric]
    );

    // Track interaction function
    const trackInteraction = useCallback(
      (componentName: string, interactionType: string) => {
        if (isProfilingEnabled) {
          console.log(
            `Interaction tracked: ${componentName} - ${interactionType}`
          );
        }
      },
      [isProfilingEnabled]
    );

    // Memoize the context value
    const contextValue = useMemo(
      () => ({
        trackRender,
        trackInteraction,
      }),
      [trackRender, trackInteraction]
    );

    return (
      <PerformanceStateContext.Provider value={state}>
        <PerformanceActionsContext.Provider value={actions}>
          <PerformanceContext.Provider value={contextValue}>
            {children}
          </PerformanceContext.Provider>
        </PerformanceActionsContext.Provider>
      </PerformanceStateContext.Provider>
    );
  }
);

PerformanceProvider.displayName = "PerformanceProvider";

// Hook to use performance state
export const usePerformanceState = () => {
  const context = useContext(PerformanceStateContext);
  if (!context) {
    throw new Error(
      "usePerformanceState must be used within a PerformanceProvider"
    );
  }
  return context;
};

// Hook to use performance actions
export const usePerformanceActions = () => {
  const context = useContext(PerformanceActionsContext);
  if (!context) {
    throw new Error(
      "usePerformanceActions must be used within a PerformanceProvider"
    );
  }
  return context;
};

// Hook to use both state and actions
export const usePerformance = () => {
  const state = usePerformanceState();
  const actions = usePerformanceActions();
  return { ...state, ...actions };
};
