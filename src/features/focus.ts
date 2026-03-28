import * as vscode from "vscode";
import { focusDecoration } from "../decorations/decorations";

export function applyFocusMode(editor: vscode.TextEditor) {
  const doc = editor.document;

  // Clear previous focus
  editor.setDecorations(focusDecoration, []);

  const visible = editor.visibleRanges[0];
  if (!visible) {return;}

  const text = doc.getText(visible);
  const baseOffset = doc.offsetAt(visible.start);
  const cursorOffset = doc.offsetAt(editor.selection.active) - baseOffset;

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

  // Build scopes
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

  // Find innermost scope
  let target: { start: number; end: number } | null = null;

  for (const s of scopes) {
    if (cursorOffset >= s.start && cursorOffset <= s.end) {
      if (!target || (s.start >= target.start && s.end <= target.end)) {
        target = s;
      }
    }
  }

  if (!target) {return;}

  const absStart = target.start + baseOffset;
  const absEnd = target.end + baseOffset;

  const ranges: vscode.Range[] = [];

  // Before scope
  if (absStart > baseOffset) {
    ranges.push(new vscode.Range(visible.start, doc.positionAt(absStart)));
  }

  // After scope
  if (absEnd < doc.offsetAt(visible.end)) {
    ranges.push(new vscode.Range(doc.positionAt(absEnd + 1), visible.end));
  }

  editor.setDecorations(focusDecoration, ranges);
}
