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

  // heavy operations (debounced)
  const runHeavy = (editor: vscode.TextEditor) => {
    if (!isEnabled) {
      return;
    }

    triggerUpdate(editor, (e: vscode.TextEditor) => {
      colorizeBrackets(e, colors);
      highlightBracketErrors(e);
    });
  };

  // lightweight operations (instant)
  const runLight = (editor: vscode.TextEditor) => {
    if (!isEnabled) {
      return;
    }

    highlightMatchingBracket(editor);
    highlightScope(editor);
    applyFocusMode(editor);
    highlightHoverPair(editor);
  };

  // status bar
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

  // initial run
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    runHeavy(editor);
    runLight(editor);
  }

  // editor switch
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        runHeavy(editor);
        runLight(editor);
      }
    }),
  );

  // document changes → heavy
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && event.document === editor.document) {
        runHeavy(editor);
      }
    }),
  );

  // cursor movement → light only
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((event) => {
      runLight(event.textEditor);
    }),
  );

  // theme change
  context.subscriptions.push(
    vscode.window.onDidChangeActiveColorTheme(() => {
      colors = generateColors(60);
      createDecorations(colors);

      const editor = vscode.window.activeTextEditor;
      if (editor) {
        runHeavy(editor);
        runLight(editor);
      }
    }),
  );

  // hover tooltip
  registerTooltip(context);

  // commands
  registerCommands(context, runHeavy, updateStatusBar);
}

export function deactivate() {}
