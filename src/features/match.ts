import * as vscode from "vscode";
import { matchDecoration } from "../decorations/decorations";

export function highlightMatchingBracket(editor: vscode.TextEditor) {
  const doc = editor.document;
  const text = doc.getText();

  let index = doc.offsetAt(editor.selection.active);
  let char = text[index];

  if (!"(){}[]".includes(char) && index > 0) {
    index--;
    char = text[index];
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
    editor.setDecorations(matchDecoration, []);
    return;
  }

  const isOpen = "({[".includes(char);
  const match = pairs[char];

  let stack = 0;

  if (isOpen) {
    for (let i = index + 1; i < text.length; i++) {
      if (text[i] === char) stack++;
      else if (text[i] === match) {
        if (stack === 0) return applyMatch(editor, index, i);
        stack--;
      }
    }
  } else {
    for (let i = index - 1; i >= 0; i--) {
      if (text[i] === char) stack++;
      else if (text[i] === match) {
        if (stack === 0) return applyMatch(editor, i, index);
        stack--;
      }
    }
  }

  editor.setDecorations(matchDecoration, []);
}

function applyMatch(editor: vscode.TextEditor, s: number, e: number) {
  const doc = editor.document;

  editor.setDecorations(matchDecoration, [
    { range: new vscode.Range(doc.positionAt(s), doc.positionAt(s + 1)) },
    { range: new vscode.Range(doc.positionAt(e), doc.positionAt(e + 1)) },
  ]);
}
