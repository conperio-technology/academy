import { Fragment, type ReactNode } from "react";

// Renders `backticked` spans in plain content strings as inline code (used by the
// design patterns track, whose prose lives in designPatternsData.ts).
export function withInlineCode(text: string): ReactNode {
  return text.split("`").map((part, i) => (i % 2 === 1 ? <code key={i}>{part}</code> : <Fragment key={i}>{part}</Fragment>));
}
