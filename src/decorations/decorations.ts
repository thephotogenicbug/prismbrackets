import * as vscode from "vscode";
import { glowEnabled } from "../state";

export let decorationTypes: vscode.TextEditorDecorationType[] = [];

// Matching bracket highlight
export const matchDecoration = vscode.window.createTextEditorDecorationType({
  border: "1px solid currentColor",
  textDecoration: "0 0 12px currentColor",
  fontWeight: "bold",
});

// Error - unmatched brackets
export const errorDecoration = vscode.window.createTextEditorDecorationType({
  color: "#ff5555",
  fontWeight: "bold",
  textDecoration: "underline wavy #ff5555",
});

// Create rainbow decorations
export function createDecorations(colors: string[]) {
  // dispose old
  decorationTypes.forEach((d) => d.dispose());

  // create new
  decorationTypes = colors.map((color) =>
    vscode.window.createTextEditorDecorationType({
      color,
      fontWeight: "bold",
      textDecoration: glowEnabled ? "0 0 8px currentColor" : "none",
    }),
  );
}

export const scopeDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "rgba(255,255,255,0.05)",
});

export const focusDecoration = vscode.window.createTextEditorDecorationType({
  opacity: "0.25",
});
export const hoverPairDecoration = vscode.window.createTextEditorDecorationType(
  {
    border: "1px solid currentColor",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
);
// Clear all decorations
export function clearAll(editor: vscode.TextEditor) {
  // clear rainbow brackets
  decorationTypes.forEach((d) => editor.setDecorations(d, []));

  // clear match highlight
  editor.setDecorations(matchDecoration, []);

  // clear error highlights
  editor.setDecorations(errorDecoration, []);
}
