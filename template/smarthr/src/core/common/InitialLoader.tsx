"use client";
import { useEffect, useState } from "react";

export default function InitialLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 1000); // 1 second timeout

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1300); // 1s + 300ms fade animation

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      id="global-loader"
      style={{
        opacity: isFading ? 0 : 1,
        transition: "opacity 0.3s ease-out",
      }}
    >
      <div className="page-loader"></div>
    </div>
  );
}

