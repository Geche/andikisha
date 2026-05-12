import React, { useCallback, useRef, useEffect, useState } from "react";
import {
  useIntersectionObserver,
  useThrottle,
} from "../../hooks/usePerformanceOptimizations";

interface InfiniteScrollProps {
  children: React.ReactNode;
  onLoadMore: () => void | Promise<void>;
  hasMore: boolean;
  loading?: boolean;
  threshold?: number;
  className?: string;
  loadingComponent?: React.ReactNode;
  endMessage?: React.ReactNode;
}

// Infinite scroll component with performance optimizations
const InfiniteScroll = React.memo(
  ({
    children,
    onLoadMore,
    hasMore,
    loading = false,
    threshold = 0.8,
    className = "",
    loadingComponent,
    endMessage,
  }: InfiniteScrollProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const loadingRef = useRef<HTMLDivElement>(null);

    // Use intersection observer to detect when loading element is visible
    const { elementRef, isIntersecting } = useIntersectionObserver({
      threshold,
      rootMargin: "100px",
    });

    // Throttle the load more function to prevent excessive calls
    const throttledLoadMore = useThrottle(onLoadMore, 500);

    // Handle loading more content
    const handleLoadMore = useCallback(async () => {
      if (loading || isLoading || !hasMore) return;

      setIsLoading(true);
      try {
        await throttledLoadMore();
      } catch (error) {
        console.error("Error loading more content:", error);
      } finally {
        setIsLoading(false);
      }
    }, [loading, isLoading, hasMore, throttledLoadMore]);

    // Trigger load more when intersection observer detects loading element
    useEffect(() => {
      if (isIntersecting && hasMore && !loading && !isLoading) {
        handleLoadMore();
      }
    }, [isIntersecting, hasMore, loading, isLoading, handleLoadMore]);

    // Set up the loading element ref
    useEffect(() => {
      if (loadingRef.current) {
        elementRef.current = loadingRef.current;
      }
    }, [elementRef]);

    // Memoize the loading component
    const loadingElement = React.useMemo(() => {
      if (!hasMore) {
        return (
          endMessage || <div className="text-center p-3">No more content</div>
        );
      }

      if (loading || isLoading) {
        return (
          loadingComponent || (
            <div className="text-center p-3">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="ms-2">Loading more...</span>
            </div>
          )
        );
      }

      return null;
    }, [hasMore, loading, isLoading, loadingComponent, endMessage]);

    return (
      <div className={`infinite-scroll-container ${className}`}>
        {children}
        <div ref={loadingRef} className="infinite-scroll-loading">
          {loadingElement}
        </div>
      </div>
    );
  }
);

InfiniteScroll.displayName = "InfiniteScroll";

export default InfiniteScroll;
