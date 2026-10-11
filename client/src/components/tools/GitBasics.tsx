import { useState } from "react";

type FileStatus = "clean" | "modified" | "staged";

interface TrackedFile {
  name: string;
  status: FileStatus;
}

interface Commit {
  id: string;
  message: string;
}

const INITIAL_FILES: TrackedFile[] = [
  { name: "index.html", status: "clean" },
  { name: "styles.css", status: "clean" },
  { name: "app.js", status: "clean" },
];

export function GitBasics() {
  const [files, setFiles] = useState<TrackedFile[]>(INITIAL_FILES);
  const [commits, setCommits] = useState<Commit[]>([{ id: "a1b2c3d", message: "Initial commit" }]);

  const editFile = (name: string) => {
    setFiles((prev) => prev.map((f) => (f.name === name ? { ...f, status: "modified" } : f)));
  };

  const stageFile = (name: string) => {
    setFiles((prev) => prev.map((f) => (f.name === name ? { ...f, status: "staged" } : f)));
  };

  const commit = () => {
    const staged = files.filter((f) => f.status === "staged");
    if (staged.length === 0) return;
    const id = Math.random().toString(16).slice(2, 9);
    setCommits((prev) => [...prev, { id, message: `Update ${staged.map((f) => f.name).join(", ")}` }]);
    setFiles((prev) => prev.map((f) => (f.status === "staged" ? { ...f, status: "clean" } : f)));
  };

  const stagedCount = files.filter((f) => f.status === "staged").length;

  return (
    <div className="tool-widget">
      <div className="git-areas">
        <div className="git-area">
          <h3>Working Directory</h3>
          {files.map((f) => (
            <div className="git-file-row" key={f.name}>
              <span className={`hash-chip git-chip-${f.status}`}>{f.name}</span>
              {f.status === "clean" && (
                <button onClick={() => editFile(f.name)}>edit</button>
              )}
              {f.status === "modified" && (
                <button onClick={() => stageFile(f.name)}>git add</button>
              )}
              {f.status === "staged" && <span className="gate-note">staged</span>}
            </div>
          ))}
        </div>

        <div className="git-area">
          <h3>Staging Area</h3>
          {stagedCount === 0 && <p className="gate-note">Nothing staged yet.</p>}
          {files
            .filter((f) => f.status === "staged")
            .map((f) => (
              <div className="git-file-row" key={f.name}>
                <span className="hash-chip git-chip-staged">{f.name}</span>
              </div>
            ))}
          <div className="darr-actions">
            <button onClick={commit} disabled={stagedCount === 0}>
              git commit
            </button>
          </div>
        </div>

        <div className="git-area">
          <h3>Repository</h3>
          <ul className="git-commit-log">
            {[...commits].reverse().map((c) => (
              <li key={c.id}>
                <span className="mono">{c.id}</span> {c.message}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="gate-note">
        Edit a file, stage it with "git add," then "git commit" to seal it into history -- watch each
        file move Working Directory → Staging Area → Repository.
      </p>
    </div>
  );
}
