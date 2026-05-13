import React, { useState, useCallback, useMemo } from "react";
import { useIntersectionObserver } from "../../hooks/usePerformanceOptimizations";

interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
}

// Lazy loading image component with performance optimizations
const LazyImage = React.memo(
  ({
    src,
    alt,
    placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%23f0f0f0'/%3E%3C/svg%3E",
    className = "",
    width,
    height,
    onLoad,
    onError,
    threshold = 0.1,
    rootMargin = "50px",
  }: LazyImageProps) => {
    const [imageSrc, setImageSrc] = useState<string>(placeholder);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Use intersection observer to detect when image is about to be visible
    const { elementRef, hasIntersected } = useIntersectionObserver({
      threshold,
      rootMargin,
    });

    // Load the actual image when it becomes visible
    const loadImage = useCallback(() => {
      if (hasIntersected && !isLoaded && !hasError) {
        const img = new Image();
        img.onload = () => {
          setImageSrc(src);
          setIsLoaded(true);
          onLoad?.();
        };
        img.onerror = () => {
          setHasError(true);
          onError?.();
        };
        img.src = src;
      }
    }, [hasIntersected, isLoaded, hasError, src, onLoad, onError]);

    // Trigger image loading when intersection is detected
    React.useEffect(() => {
      loadImage();
    }, [loadImage]);

    // Memoize the image style
    const imageStyle = useMemo(
      () => ({
        width,
        height,
        opacity: isLoaded ? 1 : 0.3,
        transition: "opacity 0.3s ease-in-out",
      }),
      [width, height, isLoaded]
    );

    // Memoize the container style
    const containerStyle = useMemo(
      () => ({
        width,
        height,
        backgroundColor: "#f0f0f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }),
      [width, height]
    );

    // Memoize the image element
    const imageElement = useMemo(
      () => (
        <img
          ref={elementRef as React.Ref<HTMLImageElement>}
          src={imageSrc}
          alt={alt}
          className={`lazy-image ${className}`}
          style={imageStyle}
          loading="lazy"
        />
      ),
      [elementRef, imageSrc, alt, className, imageStyle]
    );

    // Show loading state while image is not loaded
    if (!isLoaded && !hasError) {
      return (
        <div
          className={`lazy-image-container ${className}`}
          style={containerStyle}
        >
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    // Show error state if image failed to load
    if (hasError) {
      return (
        <div className={`lazy-image-error ${className}`} style={containerStyle}>
          <i
            className="ti ti-photo-off"
            style={{ fontSize: "2rem", color: "#ccc" }}
          />
          <span className="ms-2 text-muted">Failed to load image</span>
        </div>
      );
    }

    return imageElement;
  }
);

LazyImage.displayName = "LazyImage";

export default LazyImage;
