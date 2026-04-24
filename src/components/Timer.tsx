"use client";

import { useState, useEffect } from "react";
import { Play, Square } from "lucide-react";

export function Timer({ duration, label }: { duration: number; label: string }) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [running, timeLeft]);

  const toggle = () => {
    if (timeLeft === 0) setTimeLeft(duration * 60);
    setRunning(!running);
  };

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const secs = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <button 
      onClick={toggle}
      className={`mt-4 btn-brutal flex items-center gap-4 text-2xl w-full md:w-auto ${
        running ? "bg-accent-orange text-white" : "bg-accent-mint text-black"
      }`}
    >
      {running ? <Square strokeWidth={4} /> : <Play strokeWidth={4} />}
      <span className="font-mono font-black">{mins}:{secs}</span>
      <span>{label}</span>
    </button>
  );
}
