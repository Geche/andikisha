import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { useScrollThrottle } from "../../hooks/useDebounceThrottle";

interface ThrottledScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  onScroll?: (scrollData: {
    scrollTop: number;
    scrollLeft: number;
    scrollHeight: number;
    scrollWidth: number;
    clientHeight: number;
    clientWidth: number;
  }) => void;
  onScrollTop?: (scrollTop: number) => void;
  onScrollBottom?: () => void;
  onScrollLeft?: (scrollLeft: number) => void;
  onScrollRight?: () => void;
  threshold?: number;
  showScrollIndicator?: boolean;
  autoScrollToBottom?: boolean;
  scrollBehavior?: "auto" | "smooth";
  height?: string | number;
  maxHeight?: string | number;
  overflow?: "auto" | "scroll" | "hidden";
}

const ThrottledScrollContainer: React.FC<ThrottledScrollContainerProps> = ({
  children,
  className = "",
  style = {},
  delay = 16,
  onScroll,
  onScrollTop,
  onScrollBottom,
  onScrollLeft,
  onScrollRight,
  threshold = 50,
  showScrollIndicator = false,
  autoScrollToBottom = false,
  scrollBehavior = "auto",
  height,
  maxHeight,
  overflow = "auto",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);
  const lastScrollLeftRef = useRef(0);

  // Use the scroll throttle hook
  const { scrollData, handleScroll, isScrolling } = useScrollThrottle(delay);

  // Memoize the scroll handler
  const handleScrollEvent = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const scrollTop = target.scrollTop;
      const scrollLeft = target.scrollLeft;
      const scrollHeight = target.scrollHeight;
      const scrollWidth = target.scrollWidth;
      const clientHeight = target.clientHeight;
      const clientWidth = target.clientWidth;

      // Call the throttled scroll handler
      handleScroll(e);

      // Check for scroll direction changes
      if (scrollTop !== lastScrollTopRef.current) {
        // Vertical scroll
        onScrollTop?.(scrollTop);

        // Check if scrolled to bottom
        if (scrollTop + clientHeight >= scrollHeight - threshold) {
          onScrollBottom?.();
        }

        lastScrollTopRef.current = scrollTop;
      }

      if (scrollLeft !== lastScrollLeftRef.current) {
        // Horizontal scroll
        onScrollLeft?.(scrollLeft);

        // Check if scrolled to right
        if (scrollLeft + clientWidth >= scrollWidth - threshold) {
          onScrollRight?.();
        }

        lastScrollLeftRef.current = scrollLeft;
      }

      // Call the general scroll handler
      onScroll?.({
        scrollTop,
        scrollLeft,
        scrollHeight,
        scrollWidth,
        clientHeight,
        clientWidth,
      });
    },
    [
      handleScroll,
      onScroll,
      onScrollTop,
      onScrollBottom,
      onScrollLeft,
      onScrollRight,
      threshold,
    ]
  );

  // Auto scroll to bottom effect
  useEffect(() => {
    if (autoScrollToBottom && containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: scrollBehavior,
      });
    }
  }, [autoScrollToBottom, scrollBehavior, children]);

  // Memoize the container styles
  const containerStyles = useMemo(
    () => ({
      height,
      maxHeight,
      overflow,
      ...style,
    }),
    [height, maxHeight, overflow, style]
  );

  // Memoize the scroll indicator
  const scrollIndicator = useMemo(() => {
    if (!showScrollIndicator) return null;

    const { scrollTop, scrollHeight, clientHeight } = scrollData;
    const scrollPercentage =
      scrollHeight > clientHeight
        ? (scrollTop / (scrollHeight - clientHeight)) * 100
        : 0;

    return (
      <div className="scroll-indicator">
        <div
          className="scroll-progress"
          style={{ width: `${scrollPercentage}%` }}
        />
      </div>
    );
  }, [showScrollIndicator, scrollData]);

  return (
    <div className={`throttled-scroll-container ${className}`}>
      <div
        ref={containerRef}
        className="scroll-content"
        style={containerStyles}
        onScroll={handleScrollEvent}
      >
        {children}
      </div>
      {scrollIndicator}
      {isScrolling && showScrollIndicator && (
        <div className="scroll-status">
          <small>Scrolling...</small>
        </div>
      )}
    </div>
  );
};

export default React.memo(ThrottledScrollContainer);
