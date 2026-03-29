import * as vscode from "vscode";
import { scopeDecoration } from "../decorations/decorations";

export function highlightScope(editor: vscode.TextEditor) {
  const doc = editor.document;
  const visibleRanges = editor.visibleRanges;

  for (const visible of visibleRanges) {
    const text = doc.getText(visible);
    const baseOffset = doc.offsetAt(visible.start);

    const pos = editor.selection.active;
    const cursorOffset = doc.offsetAt(pos);

    let stack: number[] = [];

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (char === "{") {
        stack.push(i);
      }

      if (char === "}") {
        const start = stack.pop();

        if (start !== undefined) {
          const absStart = baseOffset + start;
          const absEnd = baseOffset + i;

          if (cursorOffset >= absStart && cursorOffset <= absEnd) {
            editor.setDecorations(scopeDecoration, [
              new vscode.Range(
                doc.positionAt(absStart),
                doc.positionAt(absEnd + 1),
              ),
            ]);
            return;
          }
        }
      }
    }
  }

  editor.setDecorations(scopeDecoration, []);
}
