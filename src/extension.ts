import * as vscode from "vscode";
import { generateColors } from "./utils/colors";
import { triggerUpdate } from "./utils/debounce";
import { createDecorations } from "./decorations/decorations";
import { colorizeBrackets } from "./features/colorize";
import { highlightMatchingBracket } from "./features/match";
import { registerCommands } from "./commands/toggle";
import { isEnabled } from "./state";
import { highlightBracketErrors } from "./features/errors";
import { highlightScope } from "./features/scope";
import { registerTooltip } from "./features/tooltip";
import { applyFocusMode } from "./features/focus";
import { highlightHoverPair } from "./features/hoverPair";

export function activate(context: vscode.ExtensionContext) {
  let colors = generateColors(60);
  createDecorations(colors);

  const run = (editor: vscode.TextEditor) => {
    triggerUpdate(editor, (e: vscode.TextEditor) => {
      colorizeBrackets(e, colors);
      highlightBracketErrors(e);
    });
  };

  // Status bar
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
  if (editor) run(editor);

  // Editor change
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) run(editor);
    }),
  );

  // Document change
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && event.document === editor.document) {
        run(editor);
      }
    }),
  );

  // Theme change
  context.subscriptions.push(
    vscode.window.onDidChangeActiveColorTheme(() => {
      colors = generateColors(60);
      createDecorations(colors);

      const editor = vscode.window.activeTextEditor;
      if (editor) run(editor);
    }),
  );

  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((event) => {
      const editor = event.textEditor;

      highlightMatchingBracket(editor);
      highlightScope(editor);

      const pos = editor.selection.active;
      const char = editor.document.getText(
        new vscode.Range(pos, pos.translate(0, 1)),
      );

      // always apply focus
      applyFocusMode(editor);

      // apply hover (on top)
      if ("(){}[]".includes(char)) {
        highlightHoverPair(editor);
      } else {
        highlightHoverPair(editor); // clears
      }
    }),
  );

  registerTooltip(context);
  registerCommands(context, run, updateStatusBar);
}

export function deactivate() {}
