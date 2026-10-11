// A small Structured Text (IEC 61131-3) interpreter for the PLC programming track.
//
// Subset: BOOL, INT (16 bit), DINT (32 bit), REAL (32 bit float) and TIME variables;
// optional PROGRAM wrapper and VAR / VAR CONSTANT blocks; assignment, IF/ELSIF/ELSE,
// CASE (values, lists and ranges), FOR, WHILE, REPEAT, EXIT and RETURN; arithmetic,
// comparison and boolean operators; a few standard functions (ABS, MIN, MAX, LIMIT, SEL,
// SQRT and type conversions); and instances of the standard function blocks TON, TOF, TP,
// CTU, CTD, CTUD, R_TRIG, F_TRIG, SR and RS with IEC semantics (see stdFbs.ts).
//
// Pipeline: lex -> parse (throws StError on the first syntax error) -> check (types,
// names, writability; collects several errors) -> run one scan at a time on a Runtime.
// Typing is deliberately strict, like real IEC compilers: no implicit INT to REAL, no
// numbers where a BOOL is expected. Every message carries a line number.
//
// No enums or parameter properties here: Node runs this file directly (type stripping)
// from scripts/check-plc-st.mjs.

import { FB_DEFS, newFbState, runFb, type FbState, type FbType } from "./stdFbs.ts";

export type ElemType = "BOOL" | "INT" | "DINT" | "REAL" | "TIME";
export type Value = boolean | number;
export type { FbType } from "./stdFbs.ts";

export interface IoDecl {
  name: string;
  type: ElemType;
  dir: "in" | "out";
  init?: Value;
}

export class StError extends Error {
  line: number;
  col: number;
  constructor(message: string, line: number, col = 0) {
    super(message);
    this.line = line;
    this.col = col;
  }
}

export const INT_MIN = -32768;
export const INT_MAX = 32767;
const DINT_MIN = -2147483648;
const DINT_MAX = 2147483647;
export const MAX_LOOP_ITERATIONS = 10000;

// ---------------------------------------------------------------------------
// Lexer

type TokKind = "id" | "kw" | "int" | "real" | "time" | "op" | "eof";
interface Tok {
  t: TokKind;
  v: string; // keyword and identifier text upper-cased for kw; original for id
  n?: number;
  line: number;
  col: number;
}

const KEYWORDS = new Set([
  "PROGRAM", "END_PROGRAM", "VAR", "END_VAR", "CONSTANT", "IF", "THEN", "ELSIF", "ELSE", "END_IF",
  "CASE", "OF", "END_CASE", "FOR", "TO", "BY", "DO", "END_FOR", "WHILE", "END_WHILE", "REPEAT", "UNTIL",
  "END_REPEAT", "EXIT", "RETURN", "AND", "OR", "XOR", "NOT", "MOD", "TRUE", "FALSE",
]);

const UNSUPPORTED_KW: Record<string, string> = {
  FUNCTION_BLOCK: "Writing your own function blocks isn't part of this simulator's subset. Use the standard ones (TON, CTU, R_TRIG and so on).",
  FUNCTION: "Writing your own functions isn't part of this simulator's subset.",
  VAR_INPUT: "Use a plain VAR block here. The exercise already declares the inputs and outputs for you.",
  VAR_OUTPUT: "Use a plain VAR block here. The exercise already declares the inputs and outputs for you.",
  VAR_GLOBAL: "Use a plain VAR block here. The exercise already declares the inputs and outputs for you.",
  ARRAY: "Arrays aren't part of this simulator's subset.",
  STRUCT: "Structures aren't part of this simulator's subset.",
  STRING: "Strings aren't part of this simulator's subset.",
  POINTER: "Pointers aren't part of this simulator's subset.",
  REF_TO: "References aren't part of this simulator's subset.",
  JMP: "Jumps aren't part of this simulator's subset (and are best avoided in ST anyway).",
};

function parseTimeLiteral(body: string, line: number, col: number): number {
  const s = body.replace(/_/g, "").toLowerCase();
  if (!s) throw new StError("Empty TIME literal. Write it like T#500ms, T#2s or T#1m30s.", line, col);
  const re = /(\d+(?:\.\d+)?)(ms|d|h|m|s)/y;
  let pos = 0;
  let total = 0;
  while (pos < s.length) {
    re.lastIndex = pos;
    const m = re.exec(s);
    if (!m) throw new StError(`Can't read the TIME literal "T#${body}". Write it like T#500ms, T#2s or T#1m30s.`, line, col);
    const n = parseFloat(m[1]);
    const unit = m[2];
    total += n * (unit === "d" ? 86400000 : unit === "h" ? 3600000 : unit === "m" ? 60000 : unit === "s" ? 1000 : 1);
    pos = re.lastIndex;
  }
  return Math.round(total);
}

function lex(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  let line = 1;
  let lineStart = 0;
  const col = () => i - lineStart + 1;
  while (i < src.length) {
    const c = src[i];
    if (c === "\n") {
      i++;
      line++;
      lineStart = i;
      continue;
    }
    if (c === " " || c === "\t" || c === "\r") {
      i++;
      continue;
    }
    if (c === "(" && src[i + 1] === "*") {
      const startLine = line;
      const startCol = col();
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === ")")) {
        if (src[i] === "\n") {
          line++;
          lineStart = i + 1;
        }
        i++;
      }
      if (i >= src.length) throw new StError("This comment is never closed. End it with *).", startLine, startCol);
      i += 2;
      continue;
    }
    if (c === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      const start = i;
      const startCol = col();
      while (i < src.length && /[A-Za-z0-9_]/.test(src[i])) i++;
      const word = src.slice(start, i);
      const up = word.toUpperCase();
      if ((up === "T" || up === "TIME") && src[i] === "#") {
        i++;
        const bodyStart = i;
        while (i < src.length && /[A-Za-z0-9_.]/.test(src[i])) i++;
        const ms = parseTimeLiteral(src.slice(bodyStart, i), line, startCol);
        toks.push({ t: "time", v: src.slice(start, i), n: ms, line, col: startCol });
        continue;
      }
      if (src[i] === "#") throw new StError(`Typed literals like ${word}#... aren't supported here. Write the plain value.`, line, startCol);
      if (UNSUPPORTED_KW[up]) throw new StError(UNSUPPORTED_KW[up], line, startCol);
      toks.push(KEYWORDS.has(up) ? { t: "kw", v: up, line, col: startCol } : { t: "id", v: word, line, col: startCol });
      continue;
    }
    if (/[0-9]/.test(c)) {
      const start = i;
      const startCol = col();
      while (i < src.length && /[0-9_]/.test(src[i])) i++;
      if (src[i] === "#") {
        const base = parseInt(src.slice(start, i).replace(/_/g, ""), 10);
        if (base !== 2 && base !== 8 && base !== 16) throw new StError(`Number base ${base} isn't valid. Use 2#, 8# or 16#.`, line, startCol);
        i++;
        const ds = i;
        while (i < src.length && /[0-9A-Fa-f_]/.test(src[i])) i++;
        const digits = src.slice(ds, i).replace(/_/g, "");
        const n = parseInt(digits, base);
        if (!digits || Number.isNaN(n) || !new RegExp(base === 16 ? "^[0-9a-f]+$" : base === 8 ? "^[0-7]+$" : "^[01]+$", "i").test(digits))
          throw new StError(`"${src.slice(start, i)}" isn't a valid base ${base} number.`, line, startCol);
        toks.push({ t: "int", v: src.slice(start, i), n, line, col: startCol });
        continue;
      }
      let isReal = false;
      if (src[i] === "." && /[0-9]/.test(src[i + 1] ?? "")) {
        isReal = true;
        i++;
        while (i < src.length && /[0-9_]/.test(src[i])) i++;
      }
      if ((src[i] === "e" || src[i] === "E") && /[0-9+-]/.test(src[i + 1] ?? "")) {
        isReal = true;
        i++;
        if (src[i] === "+" || src[i] === "-") i++;
        while (i < src.length && /[0-9]/.test(src[i])) i++;
      }
      const text = src.slice(start, i);
      const n = Number(text.replace(/_/g, ""));
      toks.push({ t: isReal ? "real" : "int", v: text, n, line, col: startCol });
      continue;
    }
    if (c === "'" || c === '"') throw new StError("Strings aren't part of this simulator's subset.", line, col());
    const two = src.slice(i, i + 2);
    if ([":=", "=>", "<=", ">=", "<>", "..", "**"].includes(two)) {
      if (two === "**") throw new StError("The ** (power) operator isn't supported here. Multiply instead, or use SQRT.", line, col());
      toks.push({ t: "op", v: two, line, col: col() });
      i += 2;
      continue;
    }
    if ("+-*/(),;:.=<>&".includes(c)) {
      toks.push({ t: "op", v: c, line, col: col() });
      i++;
      continue;
    }
    if (c === "[" || c === "]") throw new StError("Arrays aren't part of this simulator's subset.", line, col());
    throw new StError(`Unexpected character "${c}".`, line, col());
  }
  toks.push({ t: "eof", v: "end of program", line, col: col() });
  return toks;
}

// ---------------------------------------------------------------------------
// AST

export type Expr =
  | { k: "lit"; ty: ElemType; value: Value; line: number; intLit?: boolean }
  | { k: "var"; name: string; line: number; col: number; ty?: ElemType }
  | { k: "member"; inst: string; member: string; line: number; col: number; ty?: ElemType }
  | { k: "un"; op: "-" | "NOT"; e: Expr; line: number; ty?: ElemType }
  | { k: "bin"; op: string; a: Expr; b: Expr; line: number; ty?: ElemType; operandTy?: ElemType }
  | { k: "call"; fn: string; args: Expr[]; line: number; col: number; ty?: ElemType };

interface Target {
  name: string;
  member?: string;
  line: number;
  col: number;
}

export type Stmt =
  | { k: "assign"; target: Target; e: Expr; line: number }
  | { k: "fbcall"; inst: string; ins: { name: string; e: Expr; line: number }[]; outs: { name: string; target: Target; line: number }[]; line: number; col: number }
  | { k: "if"; arms: { cond: Expr; body: Stmt[] }[]; els?: Stmt[]; line: number }
  | { k: "case"; sel: Expr; arms: { labels: CaseLabel[]; body: Stmt[]; line: number }[]; els?: Stmt[]; line: number }
  | { k: "for"; v: Target; from: Expr; to: Expr; by?: Expr; body: Stmt[]; line: number }
  | { k: "while"; cond: Expr; body: Stmt[]; line: number }
  | { k: "repeat"; body: Stmt[]; cond: Expr; line: number }
  | { k: "exit"; line: number }
  | { k: "return"; line: number };

type CaseLabel = { lo: LabelValue; hi: LabelValue; line: number };
type LabelValue = { n: number } | { name: string; col: number };

interface RawDecl {
  names: { name: string; line: number; col: number }[];
  typeName: string;
  typeLine: number;
  typeCol: number;
  init?: Expr;
  constant: boolean;
}

// ---------------------------------------------------------------------------
// Parser

const ELEM_TYPES: ElemType[] = ["BOOL", "INT", "DINT", "REAL", "TIME"];
const OTHER_TYPES: Record<string, string> = {
  SINT: "SINT isn't supported here; use INT.",
  USINT: "USINT isn't supported here; use INT.",
  UINT: "UINT isn't supported here; use INT or DINT.",
  UDINT: "UDINT isn't supported here; use DINT.",
  LINT: "LINT isn't supported here; use DINT.",
  LREAL: "LREAL isn't supported here; use REAL.",
  BYTE: "BYTE isn't supported here; use INT, or BOOL for single bits.",
  WORD: "WORD isn't supported here; use INT, or BOOL for single bits.",
  DWORD: "DWORD isn't supported here; use DINT.",
  STRING: "Strings aren't part of this simulator's subset.",
  CTU_DINT: "Use CTU here (its count is an INT).",
  TOF_LTIME: "Use TOF here.",
};

class Parser {
  toks: Tok[];
  p = 0;
  constructor(toks: Tok[]) {
    this.toks = toks;
  }
  peek(o = 0): Tok {
    return this.toks[Math.min(this.p + o, this.toks.length - 1)];
  }
  next(): Tok {
    return this.toks[this.p++];
  }
  isOp(v: string, o = 0) {
    const t = this.peek(o);
    return t.t === "op" && t.v === v;
  }
  isKw(v: string, o = 0) {
    const t = this.peek(o);
    return t.t === "kw" && t.v === v;
  }
  describe(t: Tok) {
    if (t.t === "eof") return "the end of the program";
    return `"${t.v}"`;
  }
  expectOp(v: string, context: string): Tok {
    const t = this.peek();
    if (t.t === "op" && t.v === v) return this.next();
    if (v === ";") {
      const prev = this.toks[this.p - 1];
      throw new StError(`Missing ";" ${context}.`, prev?.line ?? t.line, prev?.col ?? t.col);
    }
    throw new StError(`Expected "${v}" ${context}, but found ${this.describe(t)}.`, t.line, t.col);
  }
  expectKw(v: string, context: string): Tok {
    const t = this.peek();
    if (t.t === "kw" && t.v === v) return this.next();
    throw new StError(`Expected ${v} ${context}, but found ${this.describe(t)}.`, t.line, t.col);
  }
  expectId(context: string): Tok {
    const t = this.peek();
    if (t.t === "id") return this.next();
    if (t.t === "kw") throw new StError(`"${t.v}" is a reserved word and can't be used ${context}.`, t.line, t.col);
    throw new StError(`Expected a name ${context}, but found ${this.describe(t)}.`, t.line, t.col);
  }

  program(): { decls: RawDecl[]; body: Stmt[] } {
    let wrapped = false;
    if (this.isKw("PROGRAM")) {
      this.next();
      this.expectId("after PROGRAM");
      wrapped = true;
    }
    const decls: RawDecl[] = [];
    while (this.isKw("VAR")) decls.push(...this.varBlock());
    const stop = wrapped ? ["END_PROGRAM"] : [];
    const body = this.statements(stop);
    if (wrapped) {
      this.expectKw("END_PROGRAM", "to close PROGRAM");
      if (this.isOp(";")) this.next();
    }
    const t = this.peek();
    if (t.t !== "eof") {
      if (t.t === "kw" && t.v === "VAR") throw new StError("VAR blocks must come before the first statement.", t.line, t.col);
      throw new StError(`Unexpected ${this.describe(t)}. Is there an extra END_ or a missing IF/CASE/FOR above it?`, t.line, t.col);
    }
    return { decls, body };
  }

  varBlock(): RawDecl[] {
    this.next(); // VAR
    let constant = false;
    if (this.isKw("CONSTANT")) {
      this.next();
      constant = true;
    } else if (this.peek().t === "id" && this.peek().v.toUpperCase() === "RETAIN") {
      this.next(); // accepted and ignored: everything in the simulator keeps its value between scans
    }
    const out: RawDecl[] = [];
    while (!this.isKw("END_VAR")) {
      const t = this.peek();
      if (t.t === "eof") throw new StError("This VAR block is never closed. End it with END_VAR.", t.line, t.col);
      const names = [this.expectId("for a variable")];
      while (this.isOp(",")) {
        this.next();
        names.push(this.expectId("for a variable"));
      }
      this.expectOp(":", "between the variable name and its type");
      const typeTok = this.peek();
      if (typeTok.t !== "id") throw new StError(`Expected a type such as BOOL, INT, REAL, TIME or TON, but found ${this.describe(typeTok)}.`, typeTok.line, typeTok.col);
      this.next();
      let init: Expr | undefined;
      if (this.isOp(":=")) {
        this.next();
        init = this.expr();
      }
      this.expectOp(";", `after the declaration of ${names.map((n) => n.v).join(", ")}`);
      out.push({
        names: names.map((n) => ({ name: n.v, line: n.line, col: n.col })),
        typeName: typeTok.v,
        typeLine: typeTok.line,
        typeCol: typeTok.col,
        init,
        constant,
      });
    }
    this.next(); // END_VAR
    if (this.isOp(";")) this.next();
    return out;
  }

  // Parses statements until one of the stop keywords (not consumed).
  statements(stop: string[]): Stmt[] {
    const out: Stmt[] = [];
    for (;;) {
      const t = this.peek();
      if (t.t === "eof") return out;
      if (t.t === "kw" && stop.includes(t.v)) return out;
      if (stop.includes("@caselabel") && this.atCaseLabel()) return out;
      if (this.isOp(";")) {
        this.next();
        continue;
      }
      out.push(this.statement(stop));
    }
  }

  atCaseLabel(): boolean {
    const t = this.peek();
    if (t.t === "int") return true;
    if (t.t === "op" && t.v === "-" && this.peek(1).t === "int") return true;
    if (t.t === "id") {
      const n = this.peek(1);
      return n.t === "op" && (n.v === ":" || n.v === "," || n.v === "..");
    }
    return false;
  }

  statement(stop: string[]): Stmt {
    const t = this.peek();
    if (t.t === "kw") {
      switch (t.v) {
        case "IF":
          return this.ifStmt();
        case "CASE":
          return this.caseStmt();
        case "FOR":
          return this.forStmt();
        case "WHILE":
          return this.whileStmt();
        case "REPEAT":
          return this.repeatStmt();
        case "EXIT":
          this.next();
          this.expectOp(";", "after EXIT");
          return { k: "exit", line: t.line };
        case "RETURN":
          this.next();
          this.expectOp(";", "after RETURN");
          return { k: "return", line: t.line };
        case "VAR":
          throw new StError("VAR blocks must come before the first statement.", t.line, t.col);
        case "ELSIF":
        case "ELSE":
        case "END_IF":
          throw new StError(`${t.v} without a matching IF.`, t.line, t.col);
        case "END_CASE":
          throw new StError("END_CASE without a matching CASE.", t.line, t.col);
        case "END_FOR":
        case "END_WHILE":
        case "END_REPEAT":
        case "UNTIL":
          throw new StError(`${t.v} without a matching loop.`, t.line, t.col);
        default:
          if (stop.length && stop[0] !== "@caselabel")
            throw new StError(`Unexpected ${t.v}. Expected a statement or ${stop.filter((s) => !s.startsWith("@")).join(" / ")}.`, t.line, t.col);
          throw new StError(`A statement can't start with ${t.v}.`, t.line, t.col);
      }
    }
    if (t.t !== "id") {
      if (t.t === "int" && !stop.includes("@caselabel"))
        throw new StError(`A statement can't start with a number. (Case labels like "${t.v}:" only go inside CASE ... END_CASE.)`, t.line, t.col);
      throw new StError(`A statement can't start with ${this.describe(t)}.`, t.line, t.col);
    }
    this.next();
    // FB call: name(...)
    if (this.isOp("(")) {
      this.next();
      const ins: { name: string; e: Expr; line: number }[] = [];
      const outs: { name: string; target: Target; line: number }[] = [];
      if (!this.isOp(")")) {
        for (;;) {
          const a = this.peek();
          if (a.t !== "id" || !(this.isOp(":=", 1) || this.isOp("=>", 1)))
            throw new StError(`Name each input when calling ${t.v}, like ${t.v}(IN := Start, PT := T#2s).`, a.line, a.col);
          this.next();
          if (this.isOp(":=")) {
            this.next();
            ins.push({ name: a.v, e: this.expr(), line: a.line });
          } else {
            this.next();
            const tgt = this.expectId(`to receive output ${a.v}`);
            let member: string | undefined;
            if (this.isOp(".")) {
              this.next();
              member = this.expectId("after the dot").v;
            }
            outs.push({ name: a.v, target: { name: tgt.v, member, line: tgt.line, col: tgt.col }, line: a.line });
          }
          if (this.isOp(",")) {
            this.next();
            continue;
          }
          break;
        }
      }
      this.expectOp(")", `to close the call to ${t.v}`);
      this.expectOp(";", `after the call to ${t.v}(...)`);
      return { k: "fbcall", inst: t.v, ins, outs, line: t.line, col: t.col };
    }
    let member: string | undefined;
    if (this.isOp(".")) {
      this.next();
      member = this.expectId("after the dot").v;
    }
    if (this.isOp("=")) {
      const e = this.peek();
      throw new StError(`Use := to assign a value in ST. A single = compares two values.`, e.line, e.col);
    }
    if (!this.isOp(":=")) {
      const e = this.peek();
      throw new StError(`Expected := after ${member ? `${t.v}.${member}` : t.v}, but found ${this.describe(e)}.`, e.line, e.col);
    }
    this.next();
    const e = this.expr();
    this.expectOp(";", `at the end of the assignment to ${member ? `${t.v}.${member}` : t.v}`);
    return { k: "assign", target: { name: t.v, member, line: t.line, col: t.col }, e, line: t.line };
  }

  ifStmt(): Stmt {
    const start = this.next();
    const arms: { cond: Expr; body: Stmt[] }[] = [];
    const cond = this.expr();
    this.expectKw("THEN", "after the IF condition");
    arms.push({ cond, body: this.statements(["ELSIF", "ELSE", "END_IF"]) });
    let els: Stmt[] | undefined;
    for (;;) {
      if (this.isKw("ELSIF")) {
        this.next();
        const c = this.expr();
        this.expectKw("THEN", "after the ELSIF condition");
        arms.push({ cond: c, body: this.statements(["ELSIF", "ELSE", "END_IF"]) });
        continue;
      }
      if (this.isKw("ELSE")) {
        this.next();
        els = this.statements(["END_IF", "ELSIF", "ELSE"]);
        if (!this.isKw("END_IF")) {
          const t = this.peek();
          throw new StError(`Expected END_IF to close the IF on line ${start.line}, but found ${this.describe(t)}.`, t.line, t.col);
        }
      }
      break;
    }
    if (!this.isKw("END_IF")) {
      const t = this.peek();
      throw new StError(`Expected END_IF to close the IF on line ${start.line}, but found ${this.describe(t)}.`, t.line, t.col);
    }
    this.next();
    this.expectOp(";", "after END_IF");
    return { k: "if", arms, els, line: start.line };
  }

  labelValue(): LabelValue {
    const t = this.peek();
    if (t.t === "op" && t.v === "-" && this.peek(1).t === "int") {
      this.next();
      return { n: -(this.next().n ?? 0) };
    }
    if (t.t === "int") return { n: this.next().n ?? 0 };
    if (t.t === "id") {
      this.next();
      return { name: t.v, col: t.col };
    }
    throw new StError(`Expected a case label (a whole number, or a constant), but found ${this.describe(t)}.`, t.line, t.col);
  }

  caseStmt(): Stmt {
    const start = this.next();
    const sel = this.expr();
    this.expectKw("OF", "after the CASE selector");
    const arms: { labels: CaseLabel[]; body: Stmt[]; line: number }[] = [];
    let els: Stmt[] | undefined;
    for (;;) {
      const t = this.peek();
      if (t.t === "kw" && t.v === "END_CASE") break;
      if (t.t === "kw" && t.v === "ELSE") {
        this.next();
        els = this.statements(["END_CASE"]);
        break;
      }
      if (t.t === "eof") throw new StError(`This CASE (line ${start.line}) is never closed. End it with END_CASE;`, t.line, t.col);
      if (!this.atCaseLabel()) throw new StError(`Expected a case label like "1:" or END_CASE, but found ${this.describe(t)}.`, t.line, t.col);
      const labels: CaseLabel[] = [];
      for (;;) {
        const lt = this.peek();
        const lo = this.labelValue();
        let hi = lo;
        if (this.isOp("..")) {
          this.next();
          hi = this.labelValue();
        }
        labels.push({ lo, hi, line: lt.line });
        if (this.isOp(",")) {
          this.next();
          continue;
        }
        break;
      }
      this.expectOp(":", "after the case label");
      arms.push({ labels, body: this.statements(["END_CASE", "ELSE", "@caselabel"]), line: t.line });
    }
    this.expectKw("END_CASE", `to close the CASE on line ${start.line}`);
    this.expectOp(";", "after END_CASE");
    return { k: "case", sel, arms, els, line: start.line };
  }

  forStmt(): Stmt {
    const start = this.next();
    const v = this.expectId("for the FOR loop counter");
    this.expectOp(":=", "after the FOR loop counter");
    const from = this.expr();
    this.expectKw("TO", "in the FOR loop");
    const to = this.expr();
    let by: Expr | undefined;
    if (this.isKw("BY")) {
      this.next();
      by = this.expr();
    }
    this.expectKw("DO", "in the FOR loop");
    const body = this.statements(["END_FOR"]);
    this.expectKw("END_FOR", `to close the FOR on line ${start.line}`);
    this.expectOp(";", "after END_FOR");
    return { k: "for", v: { name: v.v, line: v.line, col: v.col }, from, to, by, body, line: start.line };
  }

  whileStmt(): Stmt {
    const start = this.next();
    const cond = this.expr();
    this.expectKw("DO", "after the WHILE condition");
    const body = this.statements(["END_WHILE"]);
    this.expectKw("END_WHILE", `to close the WHILE on line ${start.line}`);
    this.expectOp(";", "after END_WHILE");
    return { k: "while", cond, body, line: start.line };
  }

  repeatStmt(): Stmt {
    const start = this.next();
    const body = this.statements(["UNTIL"]);
    this.expectKw("UNTIL", `to finish the REPEAT on line ${start.line}`);
    const cond = this.expr();
    this.expectKw("END_REPEAT", `to close the REPEAT on line ${start.line}`);
    this.expectOp(";", "after END_REPEAT");
    return { k: "repeat", body, cond, line: start.line };
  }

  // Precedence, lowest first: OR, XOR, AND/&, = <>, < > <= >=, + -, * / MOD, unary - NOT.
  expr(): Expr {
    return this.binLevel(0);
  }

  binLevel(level: number): Expr {
    const LEVELS: string[][] = [["OR"], ["XOR"], ["AND", "&"], ["=", "<>"], ["<", ">", "<=", ">="], ["+", "-"], ["*", "/", "MOD"]];
    if (level >= LEVELS.length) return this.unary();
    let a = this.binLevel(level + 1);
    for (;;) {
      const t = this.peek();
      const op = t.t === "kw" || t.t === "op" ? t.v : "";
      if (!LEVELS[level].includes(op)) return a;
      this.next();
      const b = this.binLevel(level + 1);
      a = { k: "bin", op: op === "&" ? "AND" : op, a, b, line: t.line };
    }
  }

  unary(): Expr {
    const t = this.peek();
    if (t.t === "kw" && t.v === "NOT") {
      this.next();
      return { k: "un", op: "NOT", e: this.unary(), line: t.line };
    }
    if (t.t === "op" && t.v === "-") {
      this.next();
      const n = this.peek();
      if (n.t === "int" || n.t === "real") {
        this.next();
        return n.t === "int"
          ? { k: "lit", ty: litIntType(-(n.n ?? 0)), value: -(n.n ?? 0), line: t.line, intLit: true }
          : { k: "lit", ty: "REAL", value: Math.fround(-(n.n ?? 0)), line: t.line };
      }
      return { k: "un", op: "-", e: this.unary(), line: t.line };
    }
    if (t.t === "op" && t.v === "+") {
      this.next();
      return this.unary();
    }
    return this.primary();
  }

  primary(): Expr {
    const t = this.next();
    switch (t.t) {
      case "int":
        return { k: "lit", ty: litIntType(t.n ?? 0), value: t.n ?? 0, line: t.line, intLit: true };
      case "real":
        return { k: "lit", ty: "REAL", value: Math.fround(t.n ?? 0), line: t.line };
      case "time":
        return { k: "lit", ty: "TIME", value: t.n ?? 0, line: t.line };
      case "kw":
        if (t.v === "TRUE" || t.v === "FALSE") return { k: "lit", ty: "BOOL", value: t.v === "TRUE", line: t.line };
        throw new StError(`Expected a value, but found ${t.v}.`, t.line, t.col);
      case "id": {
        if (this.isOp("(")) {
          this.next();
          const args: Expr[] = [];
          if (!this.isOp(")")) {
            for (;;) {
              if (this.peek().t === "id" && (this.isOp(":=", 1) || this.isOp("=>", 1)))
                throw new StError(`${t.v}(...) looks like a function block call. Call function blocks as their own statement, then read their outputs, like t1.Q.`, t.line, t.col);
              args.push(this.expr());
              if (this.isOp(",")) {
                this.next();
                continue;
              }
              break;
            }
          }
          this.expectOp(")", `to close the call to ${t.v}`);
          return { k: "call", fn: t.v, args, line: t.line, col: t.col };
        }
        if (this.isOp(".")) {
          this.next();
          const m = this.peek();
          if (m.t === "int") throw new StError(`Bit access like ${t.v}.${m.v} isn't supported here. Use a BOOL variable.`, m.line, m.col);
          const mem = this.expectId("after the dot");
          return { k: "member", inst: t.v, member: mem.v, line: t.line, col: t.col };
        }
        return { k: "var", name: t.v, line: t.line, col: t.col };
      }
      case "op":
        if (t.v === "(") {
          const e = this.expr();
          this.expectOp(")", "to close the bracket");
          return e;
        }
        if (t.v === ":=") throw new StError(`Unexpected ":=". Comparisons use a single "=".`, t.line, t.col);
        throw new StError(`Expected a value, but found "${t.v}".`, t.line, t.col);
      default:
        throw new StError(`Expected a value, but found ${this.describe(t)}.`, t.line, t.col);
    }
  }
}

function litIntType(n: number): ElemType {
  return n >= INT_MIN && n <= INT_MAX ? "INT" : "DINT";
}

// ---------------------------------------------------------------------------
// Symbols and type checking

export type VarKind = "input" | "output" | "local" | "constant";

export interface VarInfo {
  key: string; // upper-case lookup key (ST names are case-insensitive)
  name: string; // as declared
  type: ElemType | FbType;
  kind: VarKind;
  init: Value;
  line?: number;
}

export interface Program {
  vars: VarInfo[];
  byKey: Map<string, VarInfo>;
  body: Stmt[];
}

function isFbType(t: string): t is FbType {
  return t in FB_DEFS;
}

const isInt = (t: ElemType) => t === "INT" || t === "DINT";
const isNum = (t: ElemType) => t === "INT" || t === "DINT" || t === "REAL";

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

function suggest(word: string, options: string[]): string {
  let best = "";
  let bestD = Infinity;
  for (const o of options) {
    const d = levenshtein(word.toUpperCase(), o.toUpperCase());
    if (d < bestD) {
      bestD = d;
      best = o;
    }
  }
  return bestD <= Math.max(1, Math.floor(word.length / 3)) ? ` Did you mean ${best}?` : "";
}

// Whether a value of type `from` (optionally an integer literal with value n) may be
// stored into `to`. INT widens to DINT; nothing converts implicitly to or from REAL.
function assignable(to: ElemType, from: ElemType, lit?: { n: number }): boolean {
  if (to === from) return true;
  if (to === "DINT" && from === "INT") return true;
  if (to === "INT" && from === "DINT" && lit && lit.n >= INT_MIN && lit.n <= INT_MAX) return true;
  return false;
}

function mismatchHint(to: ElemType, from: ElemType): string {
  if (to === "REAL" && isInt(from)) return ` Convert it with ${from}_TO_REAL(...), or write a REAL literal such as 5.0.`;
  if (isInt(to) && from === "REAL") return ` Convert it with REAL_TO_${to}(...).`;
  if (to === "INT" && from === "DINT") return " Convert it with DINT_TO_INT(...) if you're sure it fits.";
  if (to === "BOOL" && isNum(from)) return " Compare it instead, for example x <> 0.";
  if (isNum(to) && from === "BOOL") return " Use BOOL_TO_INT(...) or an IF.";
  if (to === "TIME" && isInt(from)) return " Write a TIME literal like T#2s, or convert with DINT_TO_TIME(...) (milliseconds).";
  if (isInt(to) && from === "TIME") return " Convert with TIME_TO_DINT(...) (milliseconds).";
  return "";
}

const FUNCS: Record<string, { args: number; doc: string }> = {
  ABS: { args: 1, doc: "ABS(x)" },
  MIN: { args: 2, doc: "MIN(a, b)" },
  MAX: { args: 2, doc: "MAX(a, b)" },
  LIMIT: { args: 3, doc: "LIMIT(MN, IN, MX)" },
  SEL: { args: 3, doc: "SEL(G, IN0, IN1)" },
  SQRT: { args: 1, doc: "SQRT(x)" },
  INT_TO_REAL: { args: 1, doc: "INT_TO_REAL(x)" },
  DINT_TO_REAL: { args: 1, doc: "DINT_TO_REAL(x)" },
  REAL_TO_INT: { args: 1, doc: "REAL_TO_INT(x)" },
  REAL_TO_DINT: { args: 1, doc: "REAL_TO_DINT(x)" },
  INT_TO_DINT: { args: 1, doc: "INT_TO_DINT(x)" },
  DINT_TO_INT: { args: 1, doc: "DINT_TO_INT(x)" },
  BOOL_TO_INT: { args: 1, doc: "BOOL_TO_INT(x)" },
  TIME_TO_DINT: { args: 1, doc: "TIME_TO_DINT(t)" },
  DINT_TO_TIME: { args: 1, doc: "DINT_TO_TIME(ms)" },
};
const CONV_IN: Record<string, ElemType> = {
  INT_TO_REAL: "INT", DINT_TO_REAL: "DINT", REAL_TO_INT: "REAL", REAL_TO_DINT: "REAL", INT_TO_DINT: "INT",
  DINT_TO_INT: "DINT", BOOL_TO_INT: "BOOL", TIME_TO_DINT: "TIME", DINT_TO_TIME: "DINT",
};
const CONV_OUT: Record<string, ElemType> = {
  INT_TO_REAL: "REAL", DINT_TO_REAL: "REAL", REAL_TO_INT: "INT", REAL_TO_DINT: "DINT", INT_TO_DINT: "DINT",
  DINT_TO_INT: "INT", BOOL_TO_INT: "INT", TIME_TO_DINT: "DINT", DINT_TO_TIME: "TIME",
};

class Checker {
  prog: Program;
  errors: StError[] = [];
  loopVars: string[] = [];
  loopDepth = 0;
  constructor(prog: Program) {
    this.prog = prog;
  }
  err(msg: string, line: number, col = 0) {
    if (this.errors.length < 12) this.errors.push(new StError(msg, line, col));
  }

  lookup(name: string, line: number, col: number): VarInfo | null {
    const v = this.prog.byKey.get(name.toUpperCase());
    if (!v) {
      const upper = name.toUpperCase();
      if (upper in FUNCS) this.err(`${upper} is a function; call it with brackets, like ${FUNCS[upper].doc}.`, line, col);
      else if (isFbType(upper)) this.err(`${upper} is a function block type. Declare an instance in a VAR block (for example  t1 : ${upper};) and use that.`, line, col);
      else this.err(`Unknown variable "${name}".${suggest(name, this.prog.vars.map((x) => x.name))} Declare it in a VAR block or check the spelling.`, line, col);
      return null;
    }
    return v;
  }

  // Returns the expression's type, or null after reporting an error.
  expr(e: Expr): ElemType | null {
    const ty = this.exprInner(e);
    if (ty && e.k !== "lit") e.ty = ty;
    return ty;
  }

  exprInner(e: Expr): ElemType | null {
    switch (e.k) {
      case "lit":
        return e.ty;
      case "var": {
        const v = this.lookup(e.name, e.line, e.col);
        if (!v) return null;
        if (isFbType(v.type)) {
          const def = FB_DEFS[v.type];
          this.err(`${v.name} is a ${v.type} instance, not a value. Read one of its outputs instead, such as ${v.name}.${def.outputs[0][0]}.`, e.line, e.col);
          return null;
        }
        return v.type;
      }
      case "member": {
        const v = this.lookup(e.inst, e.line, e.col);
        if (!v) return null;
        if (!isFbType(v.type)) {
          this.err(`${v.name} is a ${v.type}, so it has no .${e.member}. Only function block instances (like a TON) have members.`, e.line, e.col);
          return null;
        }
        const def = FB_DEFS[v.type];
        const all = [...def.inputs, ...def.outputs];
        const m = all.find(([n]) => n === e.member.toUpperCase());
        if (!m) {
          this.err(`A ${v.type} has no member "${e.member}". It has ${all.map(([n]) => n).join(", ")}.`, e.line, e.col);
          return null;
        }
        return m[1];
      }
      case "un": {
        const t = this.expr(e.e);
        if (!t) return null;
        if (e.op === "NOT") {
          if (t !== "BOOL") {
            this.err(`NOT needs a BOOL, but this is ${t}.${t === "INT" || t === "DINT" ? " (Bitwise NOT on numbers isn't supported here.)" : ""}`, e.line);
            return null;
          }
          return "BOOL";
        }
        if (!isNum(t) && t !== "TIME") {
          this.err(`Can't negate a ${t}.`, e.line);
          return null;
        }
        return t;
      }
      case "bin":
        return this.binary(e);
      case "call":
        return this.call(e);
    }
  }

  binary(e: Extract<Expr, { k: "bin" }>): ElemType | null {
    const ta = this.expr(e.a);
    const tb = this.expr(e.b);
    if (!ta || !tb) return null;
    const op = e.op;
    const litA = e.a.k === "lit" && e.a.intLit ? { n: e.a.value as number } : undefined;
    const litB = e.b.k === "lit" && e.b.intLit ? { n: e.b.value as number } : undefined;
    // The common type of two operands for arithmetic or comparison, or null.
    const unify = (): ElemType | null => {
      if (ta === tb) return ta;
      if (isInt(ta) && isInt(tb)) {
        // INT op small literal stays INT; anything else involving DINT is DINT.
        if (ta === "INT" && litB && litB.n >= INT_MIN && litB.n <= INT_MAX) return "INT";
        if (tb === "INT" && litA && litA.n >= INT_MIN && litA.n <= INT_MAX) return "INT";
        return "DINT";
      }
      return null;
    };
    if (op === "AND" || op === "OR" || op === "XOR") {
      if (ta !== "BOOL" || tb !== "BOOL") {
        this.err(`${op} needs BOOL on both sides, but got ${ta} ${op} ${tb}.${ta !== "BOOL" && tb !== "BOOL" ? " (Bitwise logic on numbers isn't supported here.)" : " Did you mean to compare, for example x > 0?"}`, e.line);
        return null;
      }
      return "BOOL";
    }
    if (op === "=" || op === "<>" || op === "<" || op === ">" || op === "<=" || op === ">=") {
      const u = unify();
      if (!u) {
        this.err(`Can't compare ${ta} with ${tb}.${mismatchHint(ta, tb)}`, e.line);
        return null;
      }
      if (u === "BOOL" && op !== "=" && op !== "<>") {
        this.err(`${op} doesn't apply to BOOL values. Use = or <>.`, e.line);
        return null;
      }
      e.operandTy = u;
      return "BOOL";
    }
    // Arithmetic
    if (ta === "TIME" || tb === "TIME") {
      if ((op === "+" || op === "-") && ta === "TIME" && tb === "TIME") return "TIME";
      if ((op === "*" || op === "/") && ta === "TIME" && isInt(tb)) return "TIME";
      if (op === "*" && isInt(ta) && tb === "TIME") return "TIME";
      this.err(`Can't do ${ta} ${op} ${tb}. TIME values can be added to or subtracted from other TIME values, or multiplied or divided by a whole number.`, e.line);
      return null;
    }
    if (ta === "BOOL" || tb === "BOOL") {
      this.err(`Can't do arithmetic (${op}) on BOOL values.${op === "+" ? " For OR, write OR." : op === "*" ? " For AND, write AND." : ""}`, e.line);
      return null;
    }
    const u = unify();
    if (!u) {
      this.err(`Can't mix ${ta} and ${tb} in arithmetic. ST doesn't convert between whole numbers and REAL by itself: convert one side, for example INT_TO_REAL(x), or write REAL literals like 10.0.`, e.line);
      return null;
    }
    if (op === "MOD" && u === "REAL") {
      this.err("MOD works on whole numbers (INT, DINT) only.", e.line);
      return null;
    }
    return u;
  }

  call(e: Extract<Expr, { k: "call" }>): ElemType | null {
    const fn = e.fn.toUpperCase();
    const v = this.prog.byKey.get(fn);
    if (v && isFbType(v.type)) {
      this.err(`${v.name} is a function block instance. Call it as its own statement, like ${v.name}(...); and then read ${v.name}.${FB_DEFS[v.type].outputs[0][0]}.`, e.line, e.col);
      return null;
    }
    if (isFbType(fn)) {
      this.err(`${fn} is a function block type, not a function. Declare an instance (t1 : ${fn};), call t1(...); as a statement, then read its outputs.`, e.line, e.col);
      return null;
    }
    const f = FUNCS[fn];
    if (!f) {
      this.err(`Unknown function "${e.fn}".${suggest(e.fn, Object.keys(FUNCS))} Supported: ${Object.keys(FUNCS).join(", ")}.`, e.line, e.col);
      return null;
    }
    if (e.args.length !== f.args) {
      this.err(`${fn} takes ${f.args} argument${f.args === 1 ? "" : "s"}: ${f.doc}.`, e.line, e.col);
      return null;
    }
    const ts = e.args.map((a) => this.expr(a));
    if (ts.some((t) => !t)) return null;
    const types = ts as ElemType[];
    if (fn in CONV_IN) {
      const want = CONV_IN[fn];
      if (!assignable(want, types[0], e.args[0].k === "lit" && e.args[0].intLit ? { n: e.args[0].value as number } : undefined)) {
        this.err(`${fn} expects a ${want}, but got ${types[0]}.`, e.line, e.col);
        return null;
      }
      return CONV_OUT[fn];
    }
    if (fn === "ABS") {
      if (!isNum(types[0])) {
        this.err(`ABS needs a number, but got ${types[0]}.`, e.line, e.col);
        return null;
      }
      return types[0];
    }
    if (fn === "SQRT") {
      if (types[0] !== "REAL") {
        this.err(`SQRT needs a REAL, but got ${types[0]}.${mismatchHint("REAL", types[0])}`, e.line, e.col);
        return null;
      }
      return "REAL";
    }
    if (fn === "SEL") {
      if (types[0] !== "BOOL") {
        this.err(`SEL's first argument (G) must be a BOOL.`, e.line, e.col);
        return null;
      }
      return this.common(fn, [types[1], types[2]], [e.args[1], e.args[2]], e);
    }
    // MIN, MAX, LIMIT
    return this.common(fn, types, e.args, e);
  }

  common(fn: string, types: ElemType[], args: Expr[], e: { line: number; col: number }): ElemType | null {
    if (types.every((t) => isInt(t))) {
      // Mixed INT and DINT: DINT, unless the only DINTs are literals that fit in an INT.
      const lit = (i: number) => args[i].k === "lit" && (args[i] as { intLit?: boolean }).intLit;
      const fits = (i: number) => Math.abs((args[i] as { value: number }).value) <= INT_MAX;
      if (types.some((t, i) => t === "DINT" && !(lit(i) && fits(i)))) return "DINT";
      return "INT";
    }
    if (types.some((t) => t !== types[0])) {
      const other = types.find((t) => t !== types[0])!;
      this.err(`${fn} needs all its values to be the same type, but got ${types.join(", ")}.${mismatchHint(types[0], other)}`, e.line, e.col);
      return null;
    }
    if (types[0] === "BOOL" && fn !== "SEL") {
      this.err(`${fn} needs numbers or TIME values, not BOOL.`, e.line, e.col);
      return null;
    }
    return types[0];
  }

  // Checks a write target and returns its type.
  target(t: Target, viaCallOutput = false): ElemType | null {
    const v = this.lookup(t.name, t.line, t.col);
    if (!v) return null;
    if (t.member) {
      if (!isFbType(v.type)) {
        this.err(`${v.name} is a ${v.type}, so it has no .${t.member}.`, t.line, t.col);
        return null;
      }
      const def = FB_DEFS[v.type];
      const m = t.member.toUpperCase();
      const inp = def.inputs.find(([n]) => n === m);
      if (inp) return inp[1];
      if (def.outputs.some(([n]) => n === m)) {
        this.err(`${v.name}.${m} is an output of the ${v.type}, so only the block itself writes it. You can set its inputs (${def.inputs.map(([n]) => n).join(", ")}).`, t.line, t.col);
        return null;
      }
      this.err(`A ${v.type} has no member "${t.member}". It has ${[...def.inputs, ...def.outputs].map(([n]) => n).join(", ")}.`, t.line, t.col);
      return null;
    }
    if (isFbType(v.type)) {
      this.err(`${v.name} is a ${v.type} instance; you can't assign to it. ${viaCallOutput ? "" : `To run it, call it: ${v.name}(...);`}`, t.line, t.col);
      return null;
    }
    if (v.kind === "input") {
      this.err(`${v.name} is an input. The program reads inputs from the input image but can't write them; use an internal variable instead.`, t.line, t.col);
      return null;
    }
    if (v.kind === "constant") {
      this.err(`${v.name} is a constant (VAR CONSTANT), so it can't be assigned.`, t.line, t.col);
      return null;
    }
    if (this.loopVars.includes(v.key)) {
      this.err(`Don't assign to the FOR loop counter ${v.name} inside its own loop.`, t.line, t.col);
      return null;
    }
    return v.type as ElemType;
  }

  checkAssign(to: ElemType, e: Expr, line: number, what: string) {
    const from = this.expr(e);
    if (!from) return;
    const lit = e.k === "lit" && e.intLit ? { n: e.value as number } : undefined;
    if (!assignable(to, from, lit)) {
      if (lit && to === "INT" && isInt(from)) this.err(`${lit.n} doesn't fit in an INT (${INT_MIN} to ${INT_MAX}). Use a DINT.`, line);
      else this.err(`Type mismatch: ${what} is ${to}, but the value is ${from}.${mismatchHint(to, from)}`, line);
    }
  }

  cond(e: Expr, what: string, line: number) {
    const t = this.expr(e);
    if (t && t !== "BOOL") this.err(`The ${what} condition must be a BOOL, but this is ${t}.${isNum(t) ? " Compare it, for example x > 0." : ""}`, line);
  }

  stmts(list: Stmt[]) {
    for (const s of list) this.stmt(s);
  }

  stmt(s: Stmt) {
    switch (s.k) {
      case "assign": {
        const to = this.target(s.target);
        if (!to) {
          this.expr(s.e);
          return;
        }
        this.checkAssign(to, s.e, s.line, s.target.member ? `${s.target.name}.${s.target.member.toUpperCase()}` : s.target.name);
        return;
      }
      case "fbcall": {
        const v = this.prog.byKey.get(s.inst.toUpperCase());
        const upper = s.inst.toUpperCase();
        if (!v) {
          if (isFbType(upper)) this.err(`${upper} is a function block type. Declare an instance (for example  t1 : ${upper};) and call that: t1(...);`, s.line, s.col);
          else if (upper in FUNCS) this.err(`${upper} returns a value; use it in an expression, like x := ${FUNCS[upper].doc};`, s.line, s.col);
          else this.lookup(s.inst, s.line, s.col);
          return;
        }
        if (!isFbType(v.type)) {
          this.err(`${v.name} is a ${v.type}, not a function block, so it can't be called.`, s.line, s.col);
          return;
        }
        const def = FB_DEFS[v.type];
        const seen = new Set<string>();
        for (const a of s.ins) {
          const n = a.name.toUpperCase();
          if (seen.has(n)) this.err(`${n} is given twice in this call.`, a.line);
          seen.add(n);
          const inp = def.inputs.find(([x]) => x === n);
          if (!inp) {
            const isOut = def.outputs.some(([x]) => x === n);
            this.err(
              isOut
                ? `${n} is an output of ${v.type}. Read it afterwards as ${v.name}.${n}, or capture it in the call with ${n} => someVariable.`
                : `A ${v.type} has no input "${a.name}". Its inputs are ${def.inputs.map(([x]) => x).join(", ")}.${suggest(a.name, def.inputs.map(([x]) => x))}`,
              a.line,
            );
            this.expr(a.e);
            continue;
          }
          this.checkAssign(inp[1], a.e, a.line, `${v.name}.${n}`);
        }
        for (const o of s.outs) {
          const n = o.name.toUpperCase();
          const out = def.outputs.find(([x]) => x === n);
          if (!out) {
            this.err(`A ${v.type} has no output "${o.name}". Its outputs are ${def.outputs.map(([x]) => x).join(", ")}.`, o.line);
            continue;
          }
          const to = this.target(o.target, true);
          if (to && !assignable(to, out[1])) this.err(`Type mismatch: ${v.name}.${n} is ${out[1]}, but ${o.target.name} is ${to}.`, o.line);
        }
        return;
      }
      case "if":
        for (const a of s.arms) {
          this.cond(a.cond, "IF", a.cond.line);
          this.stmts(a.body);
        }
        if (s.els) this.stmts(s.els);
        return;
      case "case": {
        const t = this.expr(s.sel);
        if (t && !isInt(t)) this.err(`The CASE selector must be a whole number (INT or DINT), but this is ${t}.${t === "BOOL" ? " Use IF for BOOL decisions." : ""}`, s.line);
        const seen: [number, number, number][] = [];
        for (const arm of s.arms) {
          for (const l of arm.labels) {
            const lo = this.labelNum(l.lo, l.line);
            const hi = this.labelNum(l.hi, l.line);
            if (lo === null || hi === null) continue;
            if (hi < lo) this.err(`The case range ${lo}..${hi} is empty; write the smaller number first.`, l.line);
            for (const [a, b, ln] of seen)
              if (lo <= b && hi >= a) this.err(`Case label ${lo === hi ? lo : `${lo}..${hi}`} overlaps a label on line ${ln}.`, l.line);
            seen.push([lo, hi, l.line]);
            (l as { loN?: number }).loN = lo;
            (l as { hiN?: number }).hiN = hi;
          }
          this.stmts(arm.body);
        }
        if (s.els) this.stmts(s.els);
        return;
      }
      case "for": {
        const t = this.target(s.v);
        if (t && !isInt(t)) this.err(`The FOR loop counter must be an INT or DINT, but ${s.v.name} is ${t}.`, s.line);
        for (const [e, what] of [[s.from, "start"], [s.to, "end"], [s.by, "step"]] as const) {
          if (!e) continue;
          const te = this.expr(e);
          if (te && !isInt(te)) this.err(`The FOR loop ${what} value must be a whole number, but it is ${te}.`, s.line);
        }
        const v = this.prog.byKey.get(s.v.name.toUpperCase());
        this.loopVars.push(v?.key ?? "");
        this.loopDepth++;
        this.stmts(s.body);
        this.loopDepth--;
        this.loopVars.pop();
        return;
      }
      case "while":
        this.cond(s.cond, "WHILE", s.line);
        this.loopDepth++;
        this.stmts(s.body);
        this.loopDepth--;
        return;
      case "repeat":
        this.loopDepth++;
        this.stmts(s.body);
        this.loopDepth--;
        this.cond(s.cond, "UNTIL", s.cond.line);
        return;
      case "exit":
        if (this.loopDepth === 0) this.err("EXIT only makes sense inside a FOR, WHILE or REPEAT loop.", s.line);
        return;
      case "return":
        return;
    }
  }

  labelNum(l: LabelValue, line: number): number | null {
    if ("n" in l) return l.n;
    const v = this.prog.byKey.get(l.name.toUpperCase());
    if (!v) {
      this.err(`Unknown case label "${l.name}".${suggest(l.name, this.prog.vars.filter((x) => x.kind === "constant").map((x) => x.name))} Case labels must be numbers or VAR CONSTANT names.`, line, l.col);
      return null;
    }
    if (v.kind !== "constant" || !isInt(v.type as ElemType)) {
      this.err(`Case label ${v.name} must be an INT or DINT constant (declared in VAR CONSTANT).`, line, l.col);
      return null;
    }
    return v.init as number;
  }
}

function defaultValue(t: ElemType): Value {
  return t === "BOOL" ? false : 0;
}

export interface CompileResult {
  program?: Program;
  errors: StError[];
}

export function compile(source: string, io: IoDecl[]): CompileResult {
  let parsed: { decls: RawDecl[]; body: Stmt[] };
  try {
    parsed = new Parser(lex(source)).program();
  } catch (e) {
    if (e instanceof StError) return { errors: [e] };
    throw e;
  }
  const prog: Program = { vars: [], byKey: new Map(), body: parsed.body };
  const errors: StError[] = [];
  const add = (v: VarInfo) => {
    prog.vars.push(v);
    prog.byKey.set(v.key, v);
  };
  for (const d of io) {
    add({ key: d.name.toUpperCase(), name: d.name, type: d.type, kind: d.dir === "in" ? "input" : "output", init: d.init ?? defaultValue(d.type) });
  }
  const checker = new Checker(prog);
  for (const d of parsed.decls) {
    const up = d.typeName.toUpperCase();
    let type: ElemType | FbType | null = null;
    if ((ELEM_TYPES as string[]).includes(up)) type = up as ElemType;
    else if (isFbType(up)) type = up;
    else if (OTHER_TYPES[up]) errors.push(new StError(OTHER_TYPES[up], d.typeLine, d.typeCol));
    else
      errors.push(
        new StError(
          `Unknown type "${d.typeName}".${suggest(d.typeName, [...ELEM_TYPES, ...Object.keys(FB_DEFS)])} Supported: ${[...ELEM_TYPES, ...Object.keys(FB_DEFS)].join(", ")}.`,
          d.typeLine,
          d.typeCol,
        ),
      );
    let init: Value | undefined;
    if (type && d.init) {
      if (isFbType(type)) errors.push(new StError(`A ${type} instance can't have an initial value.`, d.typeLine));
      else {
        const e = d.init;
        const neg = e.k === "un" && e.op === "-" && e.e.k === "lit";
        const lit = e.k === "lit" ? e : neg ? (e as { e: Extract<Expr, { k: "lit" }> }).e : null;
        if (!lit) errors.push(new StError("Initial values must be plain literals (like 0, 10.0, TRUE or T#2s), or a named constant's value written out.", e.line));
        else {
          const v = neg ? -(lit.value as number) : lit.value;
          if (!assignable(type, lit.ty, lit.intLit ? { n: v as number } : undefined))
            errors.push(new StError(`Initial value type mismatch: ${d.names[0].name} is ${type}, but the value is ${lit.ty}.${mismatchHint(type, lit.ty)}`, e.line));
          else init = type === "REAL" ? Math.fround(v as number) : v;
        }
      }
    }
    if (d.constant && type && !isFbType(type) && init === undefined && !d.init)
      errors.push(new StError(`Constant ${d.names[0].name} needs a value, like ${d.names[0].name} : ${type} := 10;`, d.typeLine));
    if (d.constant && type && isFbType(type)) errors.push(new StError("Function block instances can't be constants.", d.typeLine));
    for (const n of d.names) {
      const key = n.name.toUpperCase();
      const existing = prog.byKey.get(key);
      if (existing) {
        errors.push(
          new StError(
            existing.kind === "input" || existing.kind === "output"
              ? `${n.name} is already declared as an ${existing.kind} of this exercise, so don't declare it again.`
              : `${n.name} is declared twice (first on line ${existing.line}).`,
            n.line,
            n.col,
          ),
        );
        continue;
      }
      if (key in FUNCS || isFbType(key) || (ELEM_TYPES as string[]).includes(key)) {
        errors.push(new StError(`"${n.name}" is the name of a standard type or function; pick another name.`, n.line, n.col));
        continue;
      }
      if (!type) continue;
      add({
        key,
        name: n.name,
        type,
        kind: d.constant ? "constant" : "local",
        init: isFbType(type) ? false : init ?? defaultValue(type),
        line: n.line,
      });
    }
  }
  checker.stmts(prog.body);
  errors.push(...checker.errors);
  errors.sort((a, b) => a.line - b.line);
  if (errors.length) return { errors };
  return { program: prog, errors: [] };
}

// Compiles a single expression against an existing program's symbols (used by the
// ladder view to evaluate comparison boxes). Returns null if it doesn't check.
export function compileExpr(source: string, prog: Program): Expr | null {
  try {
    const p = new Parser(lex(source));
    const e = p.expr();
    if (p.peek().t !== "eof") return null;
    const c = new Checker(prog);
    const t = c.expr(e);
    return t && c.errors.length === 0 ? e : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Runtime

export class StRuntimeError extends Error {
  line: number;
  constructor(message: string, line: number) {
    super(message);
    this.line = line;
  }
}

function wrap16(n: number) {
  return ((((n + 32768) % 65536) + 65536) % 65536) - 32768;
}

function toType(ty: ElemType, n: number): number {
  if (ty === "INT") return wrap16(n);
  if (ty === "DINT") return n | 0;
  if (ty === "REAL") return Math.fround(n);
  return Math.trunc(n); // TIME, whole milliseconds
}

function roundHalfAway(n: number) {
  return n < 0 ? -Math.round(-n) : Math.round(n);
}

export class Runtime {
  prog: Program;
  vals = new Map<string, Value>();
  fbs = new Map<string, FbState>();
  now = 0;
  loopCount = 0;
  constructor(prog: Program) {
    this.prog = prog;
    this.reset();
  }

  reset() {
    this.vals.clear();
    this.fbs.clear();
    for (const v of this.prog.vars) {
      if (isFbType(v.type)) this.fbs.set(v.key, newFbState(v.type));
      else this.vals.set(v.key, v.init);
    }
  }

  get(name: string): Value | undefined {
    return this.vals.get(name.toUpperCase());
  }

  set(name: string, value: Value) {
    this.vals.set(name.toUpperCase(), value);
  }

  // Runs the program body once (the "execute program" phase of one scan) at time nowMs.
  scan(nowMs: number) {
    this.now = nowMs;
    this.loopCount = 0;
    this.block(this.prog.body);
  }

  // 0 = normal, 1 = EXIT, 2 = RETURN
  block(list: Stmt[]): number {
    for (const s of list) {
      const r = this.stmt(s);
      if (r) return r;
    }
    return 0;
  }

  tick(line: number) {
    if (++this.loopCount > MAX_LOOP_ITERATIONS)
      throw new StRuntimeError(
        `Loop guard tripped: more than ${MAX_LOOP_ITERATIONS.toLocaleString("en-US")} loop iterations in one scan (line ${line}). A loop that waits for something to change never ends, because inputs only update between scans. A real PLC's watchdog would fault the controller here.`,
        line,
      );
  }

  writeTarget(t: Target, value: Value) {
    if (t.member) {
      const fb = this.fbs.get(t.name.toUpperCase())!;
      fb.inputs[t.member.toUpperCase()] = value;
    } else this.vals.set(t.name.toUpperCase(), value);
  }

  stmt(s: Stmt): number {
    switch (s.k) {
      case "assign":
        this.writeTarget(s.target, this.eval(s.e));
        return 0;
      case "fbcall": {
        const fb = this.fbs.get(s.inst.toUpperCase())!;
        for (const a of s.ins) fb.inputs[a.name.toUpperCase()] = this.eval(a.e);
        runFb(fb, this.now);
        for (const o of s.outs) this.writeTarget(o.target, fb.outputs[o.name.toUpperCase()]);
        return 0;
      }
      case "if":
        for (const a of s.arms) if (this.eval(a.cond)) return this.block(a.body);
        return s.els ? this.block(s.els) : 0;
      case "case": {
        const n = this.eval(s.sel) as number;
        for (const arm of s.arms)
          for (const l of arm.labels) {
            const lo = (l as { loN?: number }).loN!;
            const hi = (l as { hiN?: number }).hiN!;
            if (n >= lo && n <= hi) return this.block(arm.body);
          }
        return s.els ? this.block(s.els) : 0;
      }
      case "for": {
        const key = s.v.name.toUpperCase();
        const ty = this.prog.byKey.get(key)!.type as ElemType;
        const from = this.eval(s.from) as number;
        const to = this.eval(s.to) as number;
        const by = s.by ? (this.eval(s.by) as number) : 1;
        if (by === 0) throw new StRuntimeError(`FOR loop step is 0 (line ${s.line}), so it would never finish.`, s.line);
        let i = from;
        this.vals.set(key, toType(ty, i));
        while (by > 0 ? i <= to : i >= to) {
          this.tick(s.line);
          const r = this.block(s.body);
          if (r === 2) return 2;
          if (r === 1) break;
          i += by;
          this.vals.set(key, toType(ty, i));
          if (toType(ty, i) !== i) break; // counter would overflow its type
        }
        return 0;
      }
      case "while":
        while (this.eval(s.cond)) {
          this.tick(s.line);
          const r = this.block(s.body);
          if (r === 2) return 2;
          if (r === 1) break;
        }
        return 0;
      case "repeat":
        for (;;) {
          this.tick(s.line);
          const r = this.block(s.body);
          if (r === 2) return 2;
          if (r === 1) break;
          if (this.eval(s.cond)) break;
        }
        return 0;
      case "exit":
        return 1;
      case "return":
        return 2;
    }
  }

  eval(e: Expr): Value {
    switch (e.k) {
      case "lit":
        return e.value;
      case "var":
        return this.vals.get(e.name.toUpperCase())!;
      case "member": {
        const fb = this.fbs.get(e.inst.toUpperCase())!;
        const m = e.member.toUpperCase();
        return m in fb.outputs ? fb.outputs[m] : fb.inputs[m];
      }
      case "un": {
        const v = this.eval(e.e);
        if (e.op === "NOT") return !v;
        return toType(e.ty!, -(v as number));
      }
      case "bin":
        return this.binary(e);
      case "call":
        return this.call(e);
    }
  }

  binary(e: Extract<Expr, { k: "bin" }>): Value {
    const op = e.op;
    if (op === "AND") return (this.eval(e.a) as boolean) && (this.eval(e.b) as boolean);
    if (op === "OR") return (this.eval(e.a) as boolean) || (this.eval(e.b) as boolean);
    const a = this.eval(e.a);
    const b = this.eval(e.b);
    switch (op) {
      case "XOR":
        return a !== b;
      case "=":
        return a === b;
      case "<>":
        return a !== b;
      case "<":
        return a < b;
      case ">":
        return a > b;
      case "<=":
        return a <= b;
      case ">=":
        return a >= b;
    }
    const x = a as number;
    const y = b as number;
    const ty = e.ty!;
    switch (op) {
      case "+":
        return toType(ty, x + y);
      case "-":
        return toType(ty, x - y);
      case "*":
        if (ty === "INT" || ty === "DINT") return toType(ty, Math.imul(x, y));
        return toType(ty, x * y);
      case "/":
        if (y === 0) throw new StRuntimeError(`Division by zero on line ${e.line}. A real PLC would raise a fault or a math error flag here; guard the division with an IF.`, e.line);
        if (ty === "REAL") return Math.fround(x / y);
        return toType(ty, Math.trunc(x / y));
      case "MOD":
        if (y === 0) throw new StRuntimeError(`MOD by zero on line ${e.line}. Guard it with an IF.`, e.line);
        return toType(ty, x % y);
    }
    throw new StRuntimeError(`Unknown operator ${op}`, e.line);
  }

  call(e: Extract<Expr, { k: "call" }>): Value {
    const fn = e.fn.toUpperCase();
    const args = e.args.map((a) => this.eval(a));
    const ty = e.ty!;
    const n = args[0] as number;
    const range = (lo: number, hi: number, name: string) => {
      const r = roundHalfAway(n);
      if (r < lo || r > hi) throw new StRuntimeError(`${fn} on line ${e.line}: ${n} doesn't fit in ${name} (${lo} to ${hi}).`, e.line);
      return r;
    };
    switch (fn) {
      case "ABS":
        return toType(ty, Math.abs(n));
      case "MIN":
        return Math.min(n, args[1] as number);
      case "MAX":
        return Math.max(n, args[1] as number);
      case "LIMIT":
        return Math.min(Math.max(args[1] as number, n), args[2] as number);
      case "SEL":
        return args[0] ? args[2] : args[1];
      case "SQRT":
        if (n < 0) throw new StRuntimeError(`SQRT of a negative number (${n}) on line ${e.line}.`, e.line);
        return Math.fround(Math.sqrt(n));
      case "INT_TO_REAL":
      case "DINT_TO_REAL":
        return Math.fround(n);
      case "REAL_TO_INT":
        return range(INT_MIN, INT_MAX, "an INT");
      case "REAL_TO_DINT":
        return range(DINT_MIN, DINT_MAX, "a DINT");
      case "INT_TO_DINT":
        return n;
      case "DINT_TO_INT":
        return range(INT_MIN, INT_MAX, "an INT");
      case "BOOL_TO_INT":
        return args[0] ? 1 : 0;
      case "TIME_TO_DINT":
      case "DINT_TO_TIME":
        return Math.trunc(n);
    }
    throw new StRuntimeError(`Unknown function ${fn}`, e.line);
  }

  // Every variable and function block member, for watch tables.
  snapshot(): { name: string; type: string; value: Value; kind: VarKind | "fb" }[] {
    const out: { name: string; type: string; value: Value; kind: VarKind | "fb" }[] = [];
    for (const v of this.prog.vars) {
      if (isFbType(v.type)) {
        const fb = this.fbs.get(v.key)!;
        const def = FB_DEFS[v.type];
        for (const [m, t] of def.inputs) out.push({ name: `${v.name}.${m}`, type: t, value: fb.inputs[m], kind: "fb" });
        for (const [m, t] of def.outputs) out.push({ name: `${v.name}.${m}`, type: t, value: fb.outputs[m], kind: "fb" });
      } else out.push({ name: v.name, type: v.type, value: this.vals.get(v.key)!, kind: v.kind });
    }
    return out;
  }

  // Reads a variable or an FB member ("t1.Q") by name; undefined if it doesn't exist.
  read(path: string): Value | undefined {
    const [a, b] = path.toUpperCase().split(".");
    if (b) {
      const fb = this.fbs.get(a);
      if (!fb) return undefined;
      return b in fb.outputs ? fb.outputs[b] : fb.inputs[b];
    }
    return this.vals.get(a);
  }
}

// ---------------------------------------------------------------------------
// Formatting

export function formatTime(ms: number): string {
  if (ms === 0) return "T#0ms";
  const neg = ms < 0;
  let r = Math.abs(ms);
  const parts: string[] = [];
  const units: [number, string][] = [[86400000, "d"], [3600000, "h"], [60000, "m"], [1000, "s"], [1, "ms"]];
  for (const [size, u] of units) {
    const q = Math.floor(r / size);
    if (q) {
      parts.push(`${q}${u}`);
      r -= q * size;
    }
  }
  return `T#${neg ? "-" : ""}${parts.join("")}`;
}

export function formatValue(v: Value | undefined, type: string): string {
  if (v === undefined) return "?";
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  if (type === "TIME") return formatTime(v);
  if (type === "REAL") {
    const s = String(Number(v.toPrecision(6)));
    return s.includes(".") || s.includes("e") ? s : `${s}.0`;
  }
  return String(v);
}
