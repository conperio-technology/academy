// Autocomplete for the C# editors, answered by Roslyn in the in-browser C# worker
// (csharpWasmRunner.ts completeCSharp, wasm-csharp/Program.cs Complete). Monaco has no C#
// completion of its own, only word-based suggestions. This is the cheap version: the
// symbols in scope at the caret, or the members after "expr.", filtered by CodePolicy.
// When the runtime isn't available (server mode, not built) it returns nothing and Monaco
// keeps its word-based suggestions.
import type { Monaco, OnMount } from "@monaco-editor/react";
import type { editor as MonacoEditor, Position } from "monaco-editor";
import { completeCSharp } from "./csharpWasmRunner";

type Editor = Parameters<OnMount>[0];

// Per editor model: the lesson's hidden preamble (its helper types show up in the list).
const preambles = new Map<string, string | null>();
let registered = false;

export function attachCSharpCompletion(editor: Editor, monaco: Monaco, preamble: string | null) {
  const model = editor.getModel();
  if (!model) return;
  const key = model.uri.toString();
  preambles.set(key, preamble);
  editor.onDidDispose(() => preambles.delete(key));
  if (registered) return;
  registered = true;

  const K = monaco.languages.CompletionItemKind;
  const kinds: Record<string, number> = {
    method: K.Method,
    extension: K.Method,
    property: K.Property,
    field: K.Field,
    constant: K.Constant,
    event: K.Event,
    variable: K.Variable,
    namespace: K.Module,
    interface: K.Interface,
    enum: K.Enum,
    struct: K.Struct,
    class: K.Class,
    keyword: K.Keyword,
  };

  monaco.languages.registerCompletionItemProvider("csharp", {
    triggerCharacters: ["."],
    async provideCompletionItems(model: MonacoEditor.ITextModel, position: Position) {
      const key = model.uri.toString();
      if (!preambles.has(key)) return { suggestions: [] };
      const items = await completeCSharp(preambles.get(key) ?? null, model.getValue(), model.getOffsetAt(position));
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      return {
        suggestions: items.map((item) => ({
          label: item.label,
          kind: kinds[item.kind] ?? K.Text,
          detail: item.detail,
          insertText: item.label,
          // Keywords after everything else.
          sortText: (item.kind === "keyword" ? "1" : "0") + item.label,
          range,
        })),
      };
    },
  });
}
