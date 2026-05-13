import React, { useMemo, useCallback } from "react";
import { usePerformance } from "../../providers/PerformanceProvider";

interface PerformanceDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

// Performance monitoring dashboard component
const PerformanceDashboard = React.memo(
  ({ isOpen, onClose }: PerformanceDashboardProps) => {
    const {
      metrics,
      isProfilingEnabled,
      isMemoizationEnabled,
      isVirtualizationEnabled,
      toggleProfiling,
      toggleMemoization,
      toggleVirtualization,
      clearMetrics,
      getSlowComponents,
      getAverageRenderTime,
    } = usePerformance();

    // Calculate performance statistics
    const stats = useMemo(() => {
      const slowComponents = getSlowComponents(16);
      const averageRenderTime = getAverageRenderTime();
      const totalRenders = metrics.reduce(
        (sum, metric) => sum + metric.renderCount,
        0
      );
      const uniqueComponents = new Set(metrics.map((m) => m.componentName))
        .size;

      return {
        slowComponents: slowComponents.length,
        averageRenderTime: averageRenderTime.toFixed(2),
        totalRenders,
        uniqueComponents,
        totalMetrics: metrics.length,
      };
    }, [metrics, getSlowComponents, getAverageRenderTime]);

    // Get top slow components
    const topSlowComponents = useMemo(() => {
      return getSlowComponents(16)
        .sort((a, b) => b.renderTime - a.renderTime)
        .slice(0, 10)
        .map((metric) => ({
          name: metric.componentName,
          renderTime: metric.renderTime.toFixed(2),
          renderCount: metric.renderCount,
        }));
    }, [getSlowComponents]);

    // Handle toggle profiling
    const handleToggleProfiling = useCallback(() => {
      toggleProfiling();
    }, [toggleProfiling]);

    // Handle toggle memoization
    const handleToggleMemoization = useCallback(() => {
      toggleMemoization();
    }, [toggleMemoization]);

    // Handle toggle virtualization
    const handleToggleVirtualization = useCallback(() => {
      toggleVirtualization();
    }, [toggleVirtualization]);

    // Handle clear metrics
    const handleClearMetrics = useCallback(() => {
      clearMetrics();
    }, [clearMetrics]);

    if (!isOpen) return null;

    return (
      <div className="performance-dashboard-overlay" onClick={onClose}>
        <div
          className="performance-dashboard"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="performance-dashboard-header">
            <h3>Performance Dashboard</h3>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          <div className="performance-dashboard-content">
            {/* Performance Statistics */}
            <div className="performance-stats">
              <h4>Performance Statistics</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Average Render Time</span>
                  <span className="stat-value">
                    {stats.averageRenderTime}ms
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Slow Components</span>
                  <span className="stat-value">{stats.slowComponents}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Renders</span>
                  <span className="stat-value">{stats.totalRenders}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Unique Components</span>
                  <span className="stat-value">{stats.uniqueComponents}</span>
                </div>
              </div>
            </div>

            {/* Performance Controls */}
            <div className="performance-controls">
              <h4>Performance Controls</h4>
              <div className="control-item">
                <label className="form-check-label">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={isProfilingEnabled}
                    onChange={handleToggleProfiling}
                  />
                  Enable Profiling
                </label>
              </div>
              <div className="control-item">
                <label className="form-check-label">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={isMemoizationEnabled}
                    onChange={handleToggleMemoization}
                  />
                  Enable Memoization
                </label>
              </div>
              <div className="control-item">
                <label className="form-check-label">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={isVirtualizationEnabled}
                    onChange={handleToggleVirtualization}
                  />
                  Enable Virtualization
                </label>
              </div>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={handleClearMetrics}
              >
                Clear Metrics
              </button>
            </div>

            {/* Top Slow Components */}
            {topSlowComponents.length > 0 && (
              <div className="slow-components">
                <h4>Top Slow Components</h4>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Component</th>
                        <th>Render Time (ms)</th>
                        <th>Render Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topSlowComponents.map((component, index) => (
                        <tr key={index}>
                          <td>{component.name}</td>
                          <td>{component.renderTime}</td>
                          <td>{component.renderCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

PerformanceDashboard.displayName = "PerformanceDashboard";

export default PerformanceDashboard;
