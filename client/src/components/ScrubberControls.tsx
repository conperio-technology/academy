interface Props {
  index: number;
  total: number;
  isFirst: boolean;
  isLast: boolean;
  playing: boolean;
  onReset: () => void;
  onPrev: () => void;
  onNext: () => void;
  onPlay: () => void;
  onPause: () => void;
}

// Shared play/pause/step-scrubber UI -- every concept-specific visualizer (Array,
// LinkedList, and whatever comes next) renders its own state, but they all drive the
// same controls, so the controls live here once instead of being copy-pasted per
// renderer.
export function ScrubberControls({
  index,
  total,
  isFirst,
  isLast,
  playing,
  onReset,
  onPrev,
  onNext,
  onPlay,
  onPause,
}: Props) {
  return (
    <div className="visualizer-controls">
      <button onClick={onReset} disabled={isFirst}>
        ⏮ reset
      </button>
      <button onClick={onPrev} disabled={isFirst}>
        ◀ prev
      </button>
      {playing ? (
        <button onClick={onPause}>⏸ pause</button>
      ) : (
        <button onClick={onPlay} disabled={isLast}>
          ▶ play
        </button>
      )}
      <button onClick={onNext} disabled={isLast}>
        next ▶
      </button>
      <span className="visualizer-step-count">
        step {index + 1} / {total}
      </span>
    </div>
  );
}
