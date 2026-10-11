// The Monaco editor is loaded at runtime from jsdelivr by @monaco-editor/loader. Pin the version
// here rather than taking the loader's default (0.55.1 for loader 1.7.0), which bundles a
// DOMPurify with known advisories. Keep the `monaco-editor` entry in package.json (types, and the
// stand-in copy check-static.mjs serves when jsdelivr is blocked) on the same version.
import { loader } from "@monaco-editor/react";

export const MONACO_VERSION = "0.57.0";

loader.config({ paths: { vs: `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/vs` } });
