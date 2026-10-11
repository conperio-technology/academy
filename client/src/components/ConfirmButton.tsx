import { useState } from "react";

interface Props {
  label: string;
  confirmLabel?: string;
  onConfirm: () => void;
  className?: string;
}

// A destructive action that needs one extra click before it fires -- click once to
// arm ("Reset progress" -> "Are you sure? Yes / Cancel"), click again to confirm.
// Avoids native window.confirm() (awkward inside an embedded preview) while still
// requiring deliberate intent for something that can't be undone.
export function ConfirmButton({ label, confirmLabel = "Are you sure?", onConfirm, className }: Props) {
  const [armed, setArmed] = useState(false);

  if (armed) {
    return (
      <span className="reset-confirm">
        {confirmLabel}{" "}
        <button
          className="confirm-danger"
          onClick={() => {
            setArmed(false);
            onConfirm();
          }}
        >
          Yes, reset
        </button>{" "}
        <button onClick={() => setArmed(false)}>Cancel</button>
      </span>
    );
  }

  return (
    <button className={className ?? "reset-link"} onClick={() => setArmed(true)}>
      {label}
    </button>
  );
}
