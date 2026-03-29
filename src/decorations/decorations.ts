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
  decorationTypes.forEach((d) => d.dispose());

  decorationTypes = colors.map((color) =>
    vscode.window.createTextEditorDecorationType({
      color,
      fontWeight: "bold",
      textDecoration: glowEnabled ? "0 0 8px currentColor" : "none",
    }),
  );
}

// Scope background
export const scopeDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "rgba(255,255,255,0.05)",
});

// Dynamic scope border (theme-aware)
let scopeBorderDecoration: vscode.TextEditorDecorationType;

export function createScopeBorderDecoration() {
  if (scopeBorderDecoration) {
    scopeBorderDecoration.dispose();
  }

  const isDark =
    vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;

  scopeBorderDecoration = vscode.window.createTextEditorDecorationType({
    border: isDark
      ? "1px solid rgba(255,255,255,0.15)"
      : "1px solid rgba(0,0,0,0.2)",
    backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.04)",
    borderRadius: "4px",
  });

  return scopeBorderDecoration;
}

// Vertical scope guide
export const scopeLineDecoration = vscode.window.createTextEditorDecorationType(
  {
    border: "none",
    borderWidth: "0 0 0 2px",
    borderStyle: "solid",
    borderColor: "rgba(255,255,255,0.15)",
  },
);

// Focus mode
export const focusDecoration = vscode.window.createTextEditorDecorationType({
  opacity: "0.8",
});

// Hover pair
export const hoverPairDecoration = vscode.window.createTextEditorDecorationType(
  {
    border: "1px solid currentColor",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
);

// Clear all decorations
export function clearAll(editor: vscode.TextEditor) {
  decorationTypes.forEach((d) => editor.setDecorations(d, []));
  editor.setDecorations(matchDecoration, []);
  editor.setDecorations(errorDecoration, []);
}
