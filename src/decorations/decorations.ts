import * as vscode from "vscode";
import { glowEnabled } from "../state";

export let decorationTypes: vscode.TextEditorDecorationType[] = [];

export const matchDecoration = vscode.window.createTextEditorDecorationType({
  border: "1px solid currentColor",
  textDecoration: "0 0 12px currentColor",
  fontWeight: "bold",
});

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

export function clearAll(editor: vscode.TextEditor) {
  decorationTypes.forEach((d) => editor.setDecorations(d, []));
  editor.setDecorations(matchDecoration, []);
}
