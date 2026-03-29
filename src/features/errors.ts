import * as vscode from "vscode";
import { errorDecoration } from "../decorations/decorations";
import { buildIgnoreMap } from "../utils/parser";

export function highlightBracketErrors(editor: vscode.TextEditor) {
  const doc = editor.document;
  const visible = editor.visibleRanges[0];
  if (!visible) {
    return;
  }

  const text = doc.getText(visible);
  const baseOffset = doc.offsetAt(visible.start);

  const { ignore } = buildIgnoreMap(text, doc.languageId);

  const stack: { char: string; index: number }[] = [];
  const errorRanges: vscode.Range[] = [];

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
        errorRanges.push(
          new vscode.Range(
            doc.positionAt(baseOffset + i),
            doc.positionAt(baseOffset + i + 1),
          ),
        );
      } else {
        stack.pop();
      }
    }
  }

  // unmatched opening brackets
  for (const item of stack) {
    errorRanges.push(
      new vscode.Range(
        doc.positionAt(baseOffset + item.index),
        doc.positionAt(baseOffset + item.index + 1),
      ),
    );
  }

  editor.setDecorations(errorDecoration, errorRanges);
}
