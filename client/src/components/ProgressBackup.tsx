import { useRef, useState } from "react";
import { exportProgress, importProgress } from "../localBackend";
import { storageKind } from "../progressStore";

interface Props {
  // Called after an import replaced the progress, so the app reloads lists and views.
  onImported: () => void;
}

// Progress lives in this browser, so the dashboard offers a file to keep it, move it to
// another browser, or bring it back after clearing site data.
export function ProgressBackup({ onImported }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  async function handleExport() {
    try {
      const json = await exportProgress();
      const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `academy-progress-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage({ text: "Saved a progress file. Keep it somewhere safe.", error: false });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Export failed.", error: true });
    }
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!window.confirm("Replace the progress in this browser with the file's? This can't be undone.")) return;
    try {
      const { entries } = await importProgress(await file.text());
      setMessage({ text: `Imported ${entries} progress entr${entries === 1 ? "y" : "ies"}.`, error: false });
      onImported();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Import failed.", error: true });
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div className="progress-backup">
      <h2>Your progress</h2>
      <p className="gate-note">
        Your progress is saved in this browser only
        {storageKind() === "memory" ? " (and this browser isn't keeping it, so it lasts until you close the tab)" : ""}.
        Clearing site data or switching browsers loses it, so export it now and then.
      </p>
      <div className="progress-backup-actions">
        <button onClick={handleExport}>Export progress</button>
        <button onClick={() => fileInput.current?.click()}>Import progress</button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          aria-label="Progress file to import"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {message && <p className={`gate-note${message.error ? " error" : ""}`}>{message.text}</p>}
    </div>
  );
}
