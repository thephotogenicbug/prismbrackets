import * as vscode from "vscode";
import { isEnabled, glowEnabled, setEnabled, setGlow } from "../state";
import { clearAll, createDecorations } from "../decorations/decorations";
import { generateColors } from "../utils/colors";

export function registerCommands(
  context: vscode.ExtensionContext,
  update: Function,
  updateStatusBar: Function,
) {
  const toggleEnable = vscode.commands.registerCommand(
    "prismbrackets.toggleEnable",
    () => {
      setEnabled(!isEnabled);

      const editor = vscode.window.activeTextEditor;

      if (editor) {
        clearAll(editor);
        if (isEnabled) update(editor);
      }

      updateStatusBar();
    },
  );

  const toggleGlow = vscode.commands.registerCommand(
    "prismbrackets.toggleGlow",
    () => {
      setGlow(!glowEnabled);

      const colors = generateColors(24);
      createDecorations(colors);

      const editor = vscode.window.activeTextEditor;

      if (editor) {
        clearAll(editor);
        update(editor);
      }
    },
  );

  context.subscriptions.push(toggleEnable, toggleGlow);
}
