"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  endsAt: string | Date;
  className?: string;
}

function computeRemaining(endsAt: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
} {
  const diff = endsAt.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    expired: false,
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function CountdownTimer({ endsAt, className = "" }: CountdownTimerProps) {
  const end = endsAt instanceof Date ? endsAt : new Date(endsAt);
  const [remaining, setRemaining] = useState(() => computeRemaining(end));

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(computeRemaining(end));
    }, 1000);
    return () => clearInterval(id);
  }, [end]);

  if (remaining.expired) {
    return (
      <span className={`text-red-400 font-semibold text-sm ${className}`}>
        Ended
      </span>
    );
  }

  if (remaining.days > 0) {
    return (
      <span className={`font-mono text-sm text-text-primary ${className}`}>
        {remaining.days}d {pad(remaining.hours)}h {pad(remaining.minutes)}m
      </span>
    );
  }

  return (
    <span
      className={`font-mono text-sm ${
        remaining.hours === 0 && remaining.minutes < 10
          ? "text-red-400"
          : "text-text-primary"
      } ${className}`}
    >
      {pad(remaining.hours)}:{pad(remaining.minutes)}:{pad(remaining.seconds)}
    </span>
  );
}
