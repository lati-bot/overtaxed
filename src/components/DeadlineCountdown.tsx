"use client";

import { useEffect, useState } from "react";

export default function DeadlineCountdown() {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const deadline = new Date("2026-05-15T23:59:59-05:00");
    const now = new Date();
    const diff = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    setDaysLeft(diff > 0 ? diff : -1);
  }, []);

  if (daysLeft === null || daysLeft < 0) return null;

  return (
    <div className="bg-[#1a6b5a] text-white text-center py-2.5 px-4 text-sm font-medium tracking-wide">
      ⏰ Texas protest deadline: May 15, 2026 — <span className="font-bold">{daysLeft} days left</span>
    </div>
  );
}
