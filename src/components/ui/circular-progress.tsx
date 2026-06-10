"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  className,
}: CircularProgressProps) {
  const [currentValue, setCurrentValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (currentValue / 100) * circumference;

  useEffect(() => {
    const timeout = setTimeout(() => setCurrentValue(value), 100);
    return () => clearTimeout(timeout);
  }, [value]);

  // Determine color based on score
  const getColor = (val: number) => {
    if (val >= 80) return "text-emerald-500";
    if (val >= 60) return "text-yellow-500";
    return "text-destructive";
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {/* Background Circle */}
      <svg className="absolute transform -rotate-90" width={size} height={size}>
        <circle
          className="text-muted/50 stroke-current"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Circle */}
        <motion.circle
          className={cn("stroke-current transition-colors duration-500", getColor(currentValue))}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      {/* Percentage Text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tracking-tighter">{currentValue}</span>
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Score</span>
      </div>
    </div>
  );
}
