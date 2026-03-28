import * as vscode from "vscode";
import { hoverPairDecoration } from "../decorations/decorations";

export function highlightHoverPair(editor: vscode.TextEditor) {
  const doc = editor.document;
  const pos = editor.selection.active;
  const text = doc.getText();
  const offset = doc.offsetAt(pos);

  const char = text[offset];

  const pairs: Record<string, string> = {
    "(": ")",
    "{": "}",
    "[": "]",
  };

  const reverse: Record<string, string> = {
    ")": "(",
    "}": "{",
    "]": "[",
  };

  if (!pairs[char] && !reverse[char]) {
    editor.setDecorations(hoverPairDecoration, []);
    return;
  }

  let matchIndex: number | null = null;

  if (pairs[char]) {
    let depth = 0;
    for (let i = offset; i < text.length; i++) {
      if (text[i] === char) {
        depth++;
      } else if (text[i] === pairs[char]) {
        depth--;
      }

      if (depth === 0) {
        matchIndex = i;
        break;
      }
    }
  } else {
    let depth = 0;
    for (let i = offset; i >= 0; i--) {
      if (text[i] === char) {
        depth++;
      } else if (text[i] === reverse[char]) {
        depth--;
      }

      if (depth === 0) {
        matchIndex = i;
        break;
      }
    }
  }

  if (matchIndex !== null) {
    const ranges = [
      new vscode.Range(pos, pos.translate(0, 1)),
      new vscode.Range(
        doc.positionAt(matchIndex),
        doc.positionAt(matchIndex + 1),
      ),
    ];

    editor.setDecorations(hoverPairDecoration, ranges);
  } else {
    editor.setDecorations(hoverPairDecoration, []);
  }
}
