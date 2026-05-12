"use client";

import React, { useEffect, useRef, useState } from 'react';

interface CircleProgressProps {
  value: number;
}

const CircleProgress: React.FC<CircleProgressProps> = ({ value }) => {
  const [borderClass, setBorderClass] = useState<string>('');
  const circleRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLSpanElement>(null);
  const rightRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (circleRef.current && leftRef.current && rightRef.current) {
      const percentageToDegrees = (percentage: number): number => (percentage / 100) * 360;

      if (value > 0) {
        if (value <= 50) {
          rightRef.current.style.transform = `rotate(${percentageToDegrees(value)}deg)`;
          leftRef.current.style.transform = 'rotate(0deg)';
        } else {
          rightRef.current.style.transform = 'rotate(180deg)';
          leftRef.current.style.transform = `rotate(${percentageToDegrees(value - 50)}deg)`;
        }
      } else {
        rightRef.current.style.transform = 'rotate(0deg)';
        leftRef.current.style.transform = 'rotate(0deg)';
      }
    }
    if (value >= 80) {
      setBorderClass('border-success');
    } else if (value >= 50) {
      setBorderClass('border-info');
    } else if (value >= 25) {
      setBorderClass('border-warning');
    } else {
      setBorderClass('border-danger');
    }
  }, [value]);

  return (
    <div className="circle-progress mb-3" data-value={value} ref={circleRef}>
      <span className="progress-left">
        <span className={`progress-bar ${borderClass}`} ref={leftRef} />
      </span>
      <span className="progress-right">
        <span className={`progress-bar ${borderClass}`} ref={rightRef} />
      </span>
      <div className="progress-value">{value}%</div>
    </div>
  );
};

export default CircleProgress;
