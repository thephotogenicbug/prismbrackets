import * as vscode from "vscode";
import {
  scopeDecoration,
  getScopeBorderDecoration,
  getScopeLineDecoration,
} from "../decorations/decorations";

export function highlightScope(editor: vscode.TextEditor) {
  const doc = editor.document;
  const visibleRanges = editor.visibleRanges;

  const cursorOffset = doc.offsetAt(editor.selection.active);

  const scopeBorderDecoration = getScopeBorderDecoration();
  const scopeLineDecoration = getScopeLineDecoration();

  // ]clear ALL decorations first
  editor.setDecorations(scopeDecoration, []);
  editor.setDecorations(scopeBorderDecoration, []);
  editor.setDecorations(scopeLineDecoration, []);

  for (const visible of visibleRanges) {
    const text = doc.getText(visible);
    const baseOffset = doc.offsetAt(visible.start);

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

          // skip tiny scopes
          if (absEnd - absStart < 20) {
            continue;
          }

          if (cursorOffset >= absStart && cursorOffset <= absEnd) {
            const startPos = doc.positionAt(absStart);
            const endPos = doc.positionAt(absEnd + 1);

            const range = new vscode.Range(startPos, endPos);

            // apply scope highlight
            editor.setDecorations(scopeDecoration, [range]);
            editor.setDecorations(scopeBorderDecoration, [range]);

            // vertical guide lines
            const lines: vscode.Range[] = [];

            for (let l = startPos.line; l <= endPos.line; l++) {
              const lineStart = doc.lineAt(l).range.start;
              lines.push(new vscode.Range(lineStart, lineStart));
            }

            editor.setDecorations(scopeLineDecoration, lines);

            return;
          }
        }
      }
    }
  }
}
