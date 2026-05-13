import { useEffect, useRef } from "react";

interface PerformanceMetrics {
  componentName: string;
  loadTime: number;
  timestamp: number;
  route: string;
}

interface UsePerformanceMonitorProps {
  componentName: string;
  route?: string;
}

export const usePerformanceMonitor = ({
  componentName,
  route,
}: UsePerformanceMonitorProps) => {
  const startTime = useRef<number>(performance.now());
  const metricsRef = useRef<PerformanceMetrics | null>(null);

  useEffect(() => {
    const loadTime = performance.now() - startTime.current;

    metricsRef.current = {
      componentName,
      loadTime,
      timestamp: Date.now(),
      route: route || window.location.pathname,
    };

    // Log performance metrics
    console.log(`🚀 ${componentName} loaded in ${loadTime.toFixed(2)}ms`);

    // Store metrics in localStorage for analysis
    const existingMetrics = JSON.parse(
      localStorage.getItem("performance-metrics") || "[]"
    );
    existingMetrics.push(metricsRef.current);

    // Keep only last 100 metrics
    if (existingMetrics.length > 100) {
      existingMetrics.splice(0, existingMetrics.length - 100);
    }

    localStorage.setItem(
      "performance-metrics",
      JSON.stringify(existingMetrics)
    );

    // Send to analytics if available
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "component_load", {
        component_name: componentName,
        load_time: loadTime,
        route: route || window.location.pathname,
      });
    }

    return () => {
      // Cleanup if needed
    };
  }, [componentName, route]);

  const getMetrics = () => metricsRef.current;

  const getAverageLoadTime = () => {
    const metrics = JSON.parse(
      localStorage.getItem("performance-metrics") || "[]"
    );
    if (metrics.length === 0) return 0;

    const totalLoadTime = metrics.reduce(
      (sum: number, metric: PerformanceMetrics) => sum + metric.loadTime,
      0
    );
    return totalLoadTime / metrics.length;
  };

  const getSlowComponents = (threshold = 1000) => {
    const metrics = JSON.parse(
      localStorage.getItem("performance-metrics") || "[]"
    );
    return metrics.filter(
      (metric: PerformanceMetrics) => metric.loadTime > threshold
    );
  };

  const clearMetrics = () => {
    localStorage.removeItem("performance-metrics");
  };

  return {
    getMetrics,
    getAverageLoadTime,
    getSlowComponents,
    clearMetrics,
  };
};
