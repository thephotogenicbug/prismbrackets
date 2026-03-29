import * as vscode from "vscode";
import { matchDecoration } from "../decorations/decorations";
import { getIgnoreMap } from "../utils/parserCache";

export function highlightMatchingBracket(editor: vscode.TextEditor) {
  const doc = editor.document;
  const visible = editor.visibleRanges[0];
  if (!visible) {
    return;
  }

  const text = doc.getText(visible);
  const baseOffset = doc.offsetAt(visible.start);

  const { ignore } = getIgnoreMap(text, doc.languageId);

  let index = doc.offsetAt(editor.selection.active) - baseOffset;

  if (index < 0 || index >= text.length) {
    return;
  }

  let char = text[index];

  if (!"(){}[]".includes(char) && index > 0) {
    index--;
    char = text[index];
  }

  if (ignore[index]) {
    editor.setDecorations(matchDecoration, []);
    return;
  }

  const pairs: Record<string, string> = {
    "(": ")",
    "{": "}",
    "[": "]",
    ")": "(",
    "}": "{",
    "]": "[",
  };

  if (!pairs[char]) {
    return;
  }

  const isOpen = "({[".includes(char);
  const match = pairs[char];

  let stack = 0;

  if (isOpen) {
    for (let i = index + 1; i < text.length; i++) {
      if (ignore[i]) {
        continue;
      }

      if (text[i] === char) {
        stack++;
      } else if (text[i] === match) {
        if (stack === 0) {
          return apply(editor, baseOffset, index, i);
        }
        stack--;
      }
    }
  } else {
    for (let i = index - 1; i >= 0; i--) {
      if (ignore[i]) {
        continue;
      }

      if (text[i] === char) {
        stack++;
      } else if (text[i] === match) {
        if (stack === 0) {
          return apply(editor, baseOffset, i, index);
        }
        stack--;
      }
    }
  }

  editor.setDecorations(matchDecoration, []);
}

function apply(editor: vscode.TextEditor, base: number, s: number, e: number) {
  const doc = editor.document;

  editor.setDecorations(matchDecoration, [
    {
      range: new vscode.Range(
        doc.positionAt(base + s),
        doc.positionAt(base + s + 1),
      ),
    },
    {
      range: new vscode.Range(
        doc.positionAt(base + e),
        doc.positionAt(base + e + 1),
      ),
    },
  ]);
}
