import * as vscode from "vscode";
import { errorDecoration } from "../decorations/decorations";
import { getIgnoreMap } from "../utils/parserCache";

export function highlightBracketErrors(editor: vscode.TextEditor) {
  const doc = editor.document;

  // full document parsing
  const text = doc.getText();
  const { ignore } = getIgnoreMap(text, doc.languageId);

  const stack: { char: string; index: number }[] = [];
  const errorIndices: number[] = [];

  const pairs: Record<string, string> = {
    "(": ")",
    "{": "}",
    "[": "]",
  };

  const closing = Object.values(pairs);

  for (let i = 0; i < text.length; i++) {
    if (ignore[i]) {
      continue;
    }

    const char = text[i];

    if (pairs[char]) {
      stack.push({ char, index: i });
    } else if (closing.includes(char)) {
      const last = stack[stack.length - 1];

      if (!last || pairs[last.char] !== char) {
        errorIndices.push(i);
      } else {
        stack.pop();
      }
    }
  }

  // unmatched openings
  for (const item of stack) {
    errorIndices.push(item.index);
  }

  // filter only visible  range
  const visible = editor.visibleRanges[0];
  if (!visible) {
    return;
  }

  const start = doc.offsetAt(visible.start);
  const end = doc.offsetAt(visible.end);

  const errorRanges: vscode.Range[] = [];

  for (const i of errorIndices) {
    if (i >= start && i <= end) {
      errorRanges.push(
        new vscode.Range(doc.positionAt(i), doc.positionAt(i + 1)),
      );
    }
  }

  editor.setDecorations(errorDecoration, errorRanges);
}
