import * as vscode from "vscode";
import { scopeDecoration } from "../decorations/decorations";

export function highlightScope(editor: vscode.TextEditor) {
  const doc = editor.document;
  const pos = editor.selection.active;
  const text = doc.getText();

  let stack: number[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === "{") {
      stack.push(i);
    }

    if (char === "}") {
      const start = stack.pop();

      if (start !== undefined) {
        const startPos = doc.positionAt(start);
        const endPos = doc.positionAt(i + 1);

        if (pos.isAfterOrEqual(startPos) && pos.isBeforeOrEqual(endPos)) {
          const range = new vscode.Range(startPos, endPos);
          editor.setDecorations(scopeDecoration, [range]);
          return;
        }
      }
    }
  }

  editor.setDecorations(scopeDecoration, []);
}
