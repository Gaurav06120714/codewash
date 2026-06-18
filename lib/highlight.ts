/**
 * Lightweight line tokenizer for syntax highlighting. Splits a line into
 * colored spans. Good enough for the editor surface; swap for Shiki if richer
 * highlighting is desired.
 */
export interface Span {
  text: string;
  color: string;
}

const COLORS = {
  keyword: "#7d97b8",
  string: "#9aab86",
  comment: "#5c636e",
  number: "#c8a06a",
  jsx: "#86a0b8",
  plain: "#c8cdd6",
  punct: "#737b87",
};

const KEYWORDS = new Set([
  "import", "from", "export", "const", "let", "var", "function", "return",
  "if", "else", "for", "while", "try", "catch", "await", "async", "new",
  "interface", "type", "extends", "implements", "void", "null", "undefined",
  "true", "false", "this", "class", "of", "in",
]);

const TOKEN_RE =
  /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+\b)|([A-Za-z_$][A-Za-z0-9_$]*)|(\s+)|([^\sA-Za-z0-9_$]+)/g;

export function tokenizeLine(line: string): Span[] {
  const spans: Span[] = [];
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(line)) !== null) {
    const [text, comment, str, num, ident, ws, punct] = m;
    if (comment) spans.push({ text, color: COLORS.comment });
    else if (str) spans.push({ text, color: COLORS.string });
    else if (num) spans.push({ text, color: COLORS.number });
    else if (ident)
      spans.push({
        text,
        color: KEYWORDS.has(ident)
          ? COLORS.keyword
          : /^[A-Z]/.test(ident)
            ? COLORS.jsx
            : COLORS.plain,
      });
    else if (ws) spans.push({ text, color: COLORS.plain });
    else if (punct) spans.push({ text, color: COLORS.punct });
  }
  return spans;
}
