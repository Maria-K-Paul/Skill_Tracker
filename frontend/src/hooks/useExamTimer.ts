import { useState, useEffect } from "react";

export function useExamTimer(endTimeStr: string, onExpire: () => void) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const endTime = new Date(endTimeStr).getTime();
    
    const tick = () => {
      const now = new Date().getTime();
      const difference = endTime - now;
      if (difference <= 0) {
        setTimeLeft(0);
        onExpire();
      } else {
        setTimeLeft(Math.floor(difference / 1000));
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endTimeStr, onExpire]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return { timeLeft, formatted, isCritical: timeLeft < 300 }; // Critical if < 5 mins
}
