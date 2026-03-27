import * as vscode from "vscode";
import { errorDecoration } from "../decorations/decorations";

export function highlightBracketErrors(editor: vscode.TextEditor) {
  const doc = editor.document;
  const text = doc.getText();

  const stack: { char: string; index: number }[] = [];
  const errorRanges: vscode.Range[] = [];

  const pairs: Record<string, string> = {
    "(": ")",
    "{": "}",
    "[": "]",
  };

  const closing = Object.values(pairs);

  let inString: string | null = null;
  let inSingleLineComment = false;
  let inMultiLineComment = false;

  // string characters
  const stringChars = ["'", '"', "`"];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    // --- Handle comments ---
    if (!inString) {
      // single-line comment
      if (!inMultiLineComment && char === "/" && next === "/") {
        inSingleLineComment = true;
      }

      // multi-line comment start
      if (!inSingleLineComment && char === "/" && next === "*") {
        inMultiLineComment = true;
        i++;
        continue;
      }

      // multi-line comment end
      if (inMultiLineComment && char === "*" && next === "/") {
        inMultiLineComment = false;
        i++;
        continue;
      }
    }

    // end single-line comment
    if (inSingleLineComment && char === "\n") {
      inSingleLineComment = false;
    }

    // skip if inside comment
    if (inSingleLineComment || inMultiLineComment) continue;

    // --- Handle strings ---
    if (!inString && stringChars.includes(char)) {
      inString = char;
      continue;
    }

    if (inString) {
      if (char === "\\" && next) {
        i++; // skip escaped character
        continue;
      }
      if (char === inString) {
        inString = null;
      }
      continue;
    }

    // --- Bracket logic ---
    if (pairs[char]) {
      stack.push({ char, index: i });
    } else if (closing.includes(char)) {
      const last = stack[stack.length - 1];

      if (!last || pairs[last.char] !== char) {
        const range = safeRange(doc, i, i + 1);
        if (range) errorRanges.push(range);
      } else {
        stack.pop();
      }
    }
  }

  // unmatched opening
  for (const item of stack) {
    const range = safeRange(doc, item.index, item.index + 1);
    if (range) errorRanges.push(range);
  }

  editor.setDecorations(errorDecoration, errorRanges);
}

// Safe range helper 
function safeRange(
  doc: vscode.TextDocument,
  start: number,
  end: number,
): vscode.Range | null {
  const max = doc.getText().length;

  if (start < 0 || end > max) return null;

  return new vscode.Range(doc.positionAt(start), doc.positionAt(end));
}
