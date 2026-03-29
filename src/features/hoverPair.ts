import * as vscode from "vscode";
import { hoverPairDecoration } from "../decorations/decorations";
import { getIgnoreMap } from "../utils/parserCache";

export function highlightHoverPair(editor: vscode.TextEditor) {
  const doc = editor.document;
  const visible = editor.visibleRanges[0];
  if (!visible) {
    return;
  }

  const text = doc.getText(visible);
  const baseOffset = doc.offsetAt(visible.start);

  const { ignore } = getIgnoreMap(text, doc.languageId);

  const pos = editor.selection.active;
  const offset = doc.offsetAt(pos) - baseOffset;

  if (offset < 0 || offset >= text.length) {
    editor.setDecorations(hoverPairDecoration, []);
    return;
  }

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

  if ((!pairs[char] && !reverse[char]) || ignore[offset]) {
    editor.setDecorations(hoverPairDecoration, []);
    return;
  }

  let matchIndex: number | null = null;

  if (pairs[char]) {
    let depth = 0;
    for (let i = offset; i < text.length; i++) {
      if (ignore[i]) {
        continue;
      }
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
      if (ignore[i]) {
        continue;
      }
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
    editor.setDecorations(hoverPairDecoration, [
      new vscode.Range(pos, pos.translate(0, 1)),
      new vscode.Range(
        doc.positionAt(baseOffset + matchIndex),
        doc.positionAt(baseOffset + matchIndex + 1),
      ),
    ]);
  } else {
    editor.setDecorations(hoverPairDecoration, []);
  }
}
