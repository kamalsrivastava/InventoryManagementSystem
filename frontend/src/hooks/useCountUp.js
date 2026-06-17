import { useEffect, useRef, useState } from "react";

/** Animate a number from 0 to `target` over `duration` ms (ease-out). */
export function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const frame = useRef();

  useEffect(() => {
    const end = Number(target) || 0;
    let start;
    const step = (ts) => {
      if (start === undefined) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.round(eased * end));
      if (progress < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);

  return value;
}
