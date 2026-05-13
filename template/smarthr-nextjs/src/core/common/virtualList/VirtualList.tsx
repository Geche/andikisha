import React, { useMemo, useCallback, useState, useRef } from "react";

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (
    item: T,
    index: number,
    style: React.CSSProperties
  ) => React.ReactNode;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  overscan?: number;
}

// Virtual scrolling list component for performance optimization
const VirtualList = React.memo(
  <T,>({
    items,
    itemHeight,
    containerHeight,
    renderItem,
    className = "",
    onScroll,
    overscan = 5,
  }: VirtualListProps<T>) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);

    // Calculate visible range with overscan
    const visibleRange = useMemo(() => {
      const startIndex = Math.max(
        0,
        Math.floor(scrollTop / itemHeight) - overscan
      );
      const endIndex = Math.min(
        items.length - 1,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
      );
      return { startIndex, endIndex };
    }, [scrollTop, containerHeight, itemHeight, items.length, overscan]);

    // Get visible items
    const visibleItems = useMemo(() => {
      const { startIndex, endIndex } = visibleRange;
      return items.slice(startIndex, endIndex + 1).map((item, index) => ({
        item,
        index: startIndex + index,
        style: {
          position: "absolute" as const,
          top: (startIndex + index) * itemHeight,
          height: itemHeight,
          width: "100%",
        },
      }));
    }, [items, visibleRange, itemHeight]);

    // Calculate total height
    const totalHeight = items.length * itemHeight;

    // Handle scroll events
    const handleScroll = useCallback(
      (e: React.UIEvent<HTMLDivElement>) => {
        const newScrollTop = e.currentTarget.scrollTop;
        setScrollTop(newScrollTop);
        onScroll?.(newScrollTop);
      },
      [onScroll]
    );

    // Memoize the container style
    const containerStyle = useMemo(
      () => ({
        height: containerHeight,
        overflow: "auto" as const,
        position: "relative" as const,
      }),
      [containerHeight]
    );

    // Memoize the inner container style
    const innerStyle = useMemo(
      () => ({
        height: totalHeight,
        position: "relative" as const,
      }),
      [totalHeight]
    );

    // Memoize the scroll container
    const scrollContainer = useMemo(
      () => (
        <div
          ref={containerRef}
          className={`virtual-list-container ${className}`}
          style={containerStyle}
          onScroll={handleScroll}
        >
          <div style={innerStyle}>
            {visibleItems.map(({ item, index, style }) =>
              renderItem(item, index, style)
            )}
          </div>
        </div>
      ),
      [
        containerRef,
        className,
        containerStyle,
        innerStyle,
        handleScroll,
        visibleItems,
        renderItem,
      ]
    );

    return scrollContainer;
  }
);

VirtualList.displayName = "VirtualList";

export default VirtualList;
