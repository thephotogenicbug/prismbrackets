import * as vscode from "vscode";
import { focusDecoration } from "../decorations/decorations";

export function applyFocusMode(editor: vscode.TextEditor) {
  const doc = editor.document;

  const visibleRange = editor.visibleRanges[0];
  const startOffset = doc.offsetAt(visibleRange.start);
  const endOffset = doc.offsetAt(visibleRange.end);

  const text = doc.getText(
    new vscode.Range(doc.positionAt(startOffset), doc.positionAt(endOffset)),
  );

  const cursorOffset = doc.offsetAt(editor.selection.active) - startOffset;

  const pairs: Record<string, string> = {
    "{": "}",
    "[": "]",
    "(": ")",
  };

  const reverse: Record<string, string> = {
    "}": "{",
    "]": "[",
    ")": "(",
  };

  const stack: { char: string; index: number }[] = [];
  const scopes: { start: number; end: number }[] = [];

  // Build scopes inside visible range
  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (pairs[char]) {
      stack.push({ char, index: i });
    } else if (reverse[char]) {
      const last = stack[stack.length - 1];

      if (last && last.char === reverse[char]) {
        stack.pop();
        scopes.push({ start: last.index, end: i });
      }
    }
  }

  // Find closest (innermost) scope
  let target: { start: number; end: number } | null = null;

  for (const s of scopes) {
    if (cursorOffset >= s.start && cursorOffset <= s.end) {
      if (!target || (s.start >= target.start && s.end <= target.end)) {
        target = s;
      }
    }
  }

  // Apply dimming
  if (!target) {
    editor.setDecorations(focusDecoration, []);
    return;
  }

  const absoluteStart = target.start + startOffset;
  const absoluteEnd = target.end + startOffset;

  const ranges: vscode.Range[] = [];

  // before scope
  if (absoluteStart > 0) {
    ranges.push(
      new vscode.Range(doc.positionAt(0), doc.positionAt(absoluteStart)),
    );
  }

  // after scope
  if (absoluteEnd < doc.getText().length) {
    ranges.push(
      new vscode.Range(
        doc.positionAt(absoluteEnd + 1),
        doc.positionAt(doc.getText().length),
      ),
    );
  }

  editor.setDecorations(focusDecoration, ranges);
}
