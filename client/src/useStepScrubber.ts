import { useEffect, useRef, useState } from "react";

// Generic play/pause/step controller over any array of steps. Concept-specific
// renderers (ArrayVisualizer today, LinkedListVisualizer/TreeVisualizer/... later)
// all sit on top of this instead of re-implementing scrubbing.
export function useStepScrubber<T>(steps: T[]) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [steps]);

  useEffect(() => {
    if (!playing) return;
    intervalRef.current = window.setInterval(() => {
      setIndex((i) => {
        if (i >= steps.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 900);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [playing, steps.length]);

  return {
    index,
    step: steps[index],
    isFirst: index === 0,
    isLast: index === steps.length - 1,
    playing,
    play: () => setPlaying(true),
    pause: () => setPlaying(false),
    next: () => setIndex((i) => Math.min(i + 1, steps.length - 1)),
    prev: () => setIndex((i) => Math.max(i - 1, 0)),
    reset: () => {
      setIndex(0);
      setPlaying(false);
    },
  };
}
