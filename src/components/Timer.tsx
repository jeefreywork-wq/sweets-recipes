"use client";

import { useState, useEffect } from "react";
import { Play, Square } from "lucide-react";

export function Timer({ duration, label }: { duration: number; label: string }) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
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
      className={`mt-4 flex items-center gap-3 px-5 py-3 rounded-full text-sm font-semibold transition-all shadow-sm ${
        running
          ? "bg-orange-50 text-orange-400 border border-orange-200"
          : "bg-sky-50 text-sky-500 border border-sky-200"
      }`}
    >
      {running ? <Square size={16} /> : <Play size={16} />}
      <span className="font-mono font-bold text-base">{mins}:{secs}</span>
      <span>{label}</span>
    </button>
  );
}
