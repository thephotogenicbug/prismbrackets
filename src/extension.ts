import * as vscode from "vscode";
import { generateColors } from "./utils/colors";
import { triggerUpdate } from "./utils/debounce";
import { createDecorations } from "./decorations/decorations";
import { colorizeBrackets } from "./features/colorize";
import { highlightMatchingBracket } from "./features/match";
import { registerCommands } from "./commands/toggle";
import { isEnabled } from "./state";

export function activate(context: vscode.ExtensionContext) {
  const colors = generateColors(24);
  createDecorations(colors);

  const run = (editor: vscode.TextEditor) => {
    triggerUpdate(editor, (e: vscode.TextEditor) =>
      colorizeBrackets(e, colors),
    );
  };

  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );

  function updateStatusBar() {
    statusBar.text = isEnabled ? "🌈 PrismBrackets" : "⚫ PrismBrackets OFF";

    statusBar.tooltip = isEnabled
      ? "Click to disable PrismBrackets"
      : "Click to enable PrismBrackets";

    statusBar.command = "prismbrackets.toggleEnable";
  }

  updateStatusBar();
  statusBar.show();

  context.subscriptions.push(statusBar);

const editor = vscode.window.activeTextEditor;

if (editor) {
  run(editor);
}

vscode.window.onDidChangeActiveTextEditor((editor) => {
  if (editor) {
    run(editor);
  }
});

vscode.workspace.onDidChangeTextDocument((event) => {
  const editor = vscode.window.activeTextEditor;
  if (editor && event.document === editor.document) {
    run(editor);
  }
});

vscode.window.onDidChangeTextEditorSelection((event) => {
  highlightMatchingBracket(event.textEditor);
});

registerCommands(context, run, updateStatusBar);
}

export function deactivate() {}
