import React, { Component, type ReactNode } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?:
    | ReactNode
    | ((
        error: Error,
        errorInfo: React.ErrorInfo,
        resetError: () => void
      ) => ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
  errorReportingService?: {
    reportError: (
      error: Error,
      errorInfo: React.ErrorInfo,
      errorId: string
    ) => void;
  };
  retryCount?: number;
  maxRetries?: number;
}

class EnhancedErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryCount: number;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
    this.retryCount = 0;
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error Boundary caught an error:", error, errorInfo);
    }

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error to external service
    if (this.props.errorReportingService && this.state.errorId) {
      try {
        this.props.errorReportingService.reportError(
          error,
          errorInfo,
          this.state.errorId
        );
      } catch (reportingError) {
        console.error("Failed to report error:", reportingError);
      }
    }

    // Store error in localStorage for debugging
    this.storeErrorForDebugging(error, errorInfo);
  }

  private storeErrorForDebugging(error: Error, errorInfo: React.ErrorInfo) {
    try {
      const errorData = {
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        errorInfo: {
          componentStack: errorInfo.componentStack,
        },
        userAgent: navigator.userAgent,
        url: window.location.href,
        errorId: this.state.errorId,
      };

      const existingErrors = JSON.parse(
        localStorage.getItem("app-errors") || "[]"
      );
      existingErrors.push(errorData);

      // Keep only last 10 errors
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10);
      }

      localStorage.setItem("app-errors", JSON.stringify(existingErrors));
    } catch (storageError) {
      console.error("Failed to store error for debugging:", storageError);
    }
  }

  private resetError = () => {
    const maxRetries = this.props.maxRetries || 3;

    if (this.retryCount < maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
      });

      if (this.props.onReset) {
        this.props.onReset();
      }
    } else {
      // If max retries reached, reload the page
      window.location.reload();
    }
  };

  private getErrorDetails() {
    const { error, errorInfo, errorId } = this.state;

    if (!error) return null;

    return {
      errorId,
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      componentStack: errorInfo?.componentStack,
    };
  }

  private renderDefaultFallback() {
    const errorDetails = this.getErrorDetails();
    const maxRetries = this.props.maxRetries || 3;
    const remainingRetries = maxRetries - this.retryCount;

    return (
      <div className="error-boundary-fallback">
        <div className="error-boundary-content">
          <div className="error-boundary-icon">
            <i className="ti ti-alert-triangle" />
          </div>

          <h2 className="error-boundary-title">Something went wrong</h2>

          <p className="error-boundary-message">
            We're sorry, but something unexpected happened. Our team has been
            notified.
          </p>

          {errorDetails && (
            <details className="error-boundary-details">
              <summary>Error Details</summary>
              <div className="error-details-content">
                <p>
                  <strong>Error ID:</strong> {errorDetails.errorId}
                </p>
                <p>
                  <strong>Error:</strong> {errorDetails.errorName}
                </p>
                <p>
                  <strong>Message:</strong> {errorDetails.errorMessage}
                </p>
                {process.env.NODE_ENV === "development" && (
                  <>
                    <p>
                      <strong>Stack:</strong>
                    </p>
                    <pre className="error-stack">{errorDetails.errorStack}</pre>
                    <p>
                      <strong>Component Stack:</strong>
                    </p>
                    <pre className="error-stack">
                      {errorDetails.componentStack}
                    </pre>
                  </>
                )}
              </div>
            </details>
          )}

          <div className="error-boundary-actions">
            {remainingRetries > 0 ? (
              <button className="btn btn-primary" onClick={this.resetError}>
                Try Again ({remainingRetries} attempts left)
              </button>
            ) : (
              <button
                className="btn btn-secondary"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
            )}

            <button
              className="btn btn-outline-secondary"
              onClick={() => window.history.back()}
            >
              Go Back
            </button>
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="error-boundary-debug">
              <p>
                <strong>Debug Info:</strong> This error boundary has caught{" "}
                {this.retryCount} errors. Check the console for more details.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      const { error, errorInfo } = this.state;

      if (typeof fallback === "function") {
        return fallback(error!, errorInfo!, this.resetError);
      }

      if (fallback) {
        return fallback;
      }

      return this.renderDefaultFallback();
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;
