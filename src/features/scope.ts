import * as vscode from "vscode";
import {
  scopeDecoration,
  createScopeBorderDecoration,
  scopeLineDecoration,
} from "../decorations/decorations";

export function highlightScope(editor: vscode.TextEditor) {
  const doc = editor.document;
  const visibleRanges = editor.visibleRanges;

  const cursorOffset = doc.offsetAt(editor.selection.active);

  // create dynamic border (theme-aware)
  const scopeBorderDecoration = createScopeBorderDecoration();

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

            const fullRange = new vscode.Range(startPos, endPos);

            // background highlight
            editor.setDecorations(scopeDecoration, [fullRange]);

            // border glow
            editor.setDecorations(scopeBorderDecoration, [fullRange]);

            // vertical guide line
            const lineRanges: vscode.Range[] = [];

            for (let line = startPos.line; line <= endPos.line; line++) {
              const lineStart = doc.lineAt(line).range.start;
              lineRanges.push(new vscode.Range(lineStart, lineStart));
            }

            editor.setDecorations(scopeLineDecoration, lineRanges);

            return;
          }
        }
      }
    }
  }

  // clear all when no scope
  editor.setDecorations(scopeDecoration, []);
  editor.setDecorations(scopeLineDecoration, []);
}
