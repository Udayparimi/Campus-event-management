import { useEffect, useState } from "react";

const getTimeLeft = (targetDate) => {
  const total = new Date(targetDate).getTime() - Date.now();
  if (Number.isNaN(total)) return null;

  const clamped = Math.max(total, 0);
  const days = Math.floor(clamped / (1000 * 60 * 60 * 24));
  const hours = Math.floor((clamped / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((clamped / (1000 * 60)) % 60);
  const seconds = Math.floor((clamped / 1000) % 60);

  return { total, days, hours, minutes, seconds };
};

const pad = (n) => String(n).padStart(2, "0");

/**
 * Live countdown to an event's start time.
 * - compact: small inline text version (for cards)
 * - default: full segmented digit-block version (for the details page)
 */
const CountdownTimer = ({ targetDate, status, compact = false }) => {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) return null;

  const isClosedStatus = status === "Completed" || status === "Cancelled";
  const hasStarted = timeLeft.total <= 0;

  if (isClosedStatus) {
    return (
      <span className={compact ? "text-xs text-gray-400" : "text-sm text-gray-400"}>
        {status === "Cancelled" ? "Event cancelled" : "Event has ended"}
      </span>
    );
  }

  if (hasStarted) {
    return (
      <span
        className={
          compact
            ? "text-xs font-semibold text-glow-500 animate-pulse-glow rounded px-1.5 py-0.5"
            : "text-sm font-semibold text-glow-500"
        }
      >
        🔴 Happening now
      </span>
    );
  }

  if (compact) {
    return (
      <span className="text-xs font-medium text-primary-600">
        ⏳ {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}
        {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)} left
      </span>
    );
  }

  const segments = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center gap-2">
      {segments.map((seg) => (
        <div
          key={seg.label}
          className="bg-gray-900 text-white rounded-lg px-3 py-2 min-w-[3.25rem] text-center shadow-glow"
        >
          <div className="text-lg font-bold tabular-nums leading-none">{pad(seg.value)}</div>
          <div className="text-[10px] uppercase tracking-wide text-gray-300 mt-1">{seg.label}</div>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
