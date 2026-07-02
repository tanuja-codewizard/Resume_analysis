"use client";

import { useEffect, useRef, useState } from "react";

function useCountUp(end: number, duration: number = 2000, isVisible: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isVisible]);

  return count;
}

const MetricItem = ({ 
  end, 
  suffix = "", 
  label, 
  isVisible 
}: { 
  end: number; 
  suffix?: string; 
  label: string; 
  isVisible: boolean 
}) => {
  const count = useCountUp(end, 2000, isVisible);
  const formattedCount = new Intl.NumberFormat('en-US').format(count);

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tighter mb-2 flex items-baseline justify-center">
        {formattedCount}
        <span className="text-primary text-3xl md:text-4xl ml-1">{suffix}</span>
      </div>
      <div className="text-sm md:text-base text-muted-foreground font-medium">
        {label}
      </div>
    </div>
  );
};

export function Metrics() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (sectionRef.current) observer.unobserve(sectionRef.current);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="py-12 border-y border-border/40 bg-muted/30"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0">
          <div className="md:border-r border-border/40">
            <MetricItem end={10000} suffix="+" label="Resumes Analyzed" isVisible={isVisible} />
          </div>
          <div className="md:border-r border-border/40">
            <MetricItem end={89} suffix="%" label="ATS Pass Rate" isVisible={isVisible} />
          </div>
          <div className="md:border-r border-border/40">
            <MetricItem end={3} suffix="x" label="More Interviews" isVisible={isVisible} />
          </div>
          <div>
            <MetricItem end={50} suffix="+" label="Industries Covered" isVisible={isVisible} />
          </div>
        </div>
      </div>
    </section>
  );
}
