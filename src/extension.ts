import * as vscode from "vscode";
import { generateColors } from "./utils/colors";
import { triggerUpdate } from "./utils/debounce";
import {
  createDecorations,
  initScopeDecorations,
} from "./decorations/decorations";

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
  // changelog on update
  const currentVersion = context.extension.packageJSON.version;
  const previousVersion = context.globalState.get<string>(
    "prismbrackets.version",
  );

  if (previousVersion !== currentVersion) {
    context.globalState.update("prismbrackets.version", currentVersion);

    vscode.window
      .showInformationMessage(
        `Prism Brackets updated to v${currentVersion}`,
        "View Changelog",
      )
      .then((selection) => {
        if (selection === "View Changelog") {
          const changelogPath = vscode.Uri.file(
            context.asAbsolutePath("CHANGELOG.md"),
          );

          vscode.commands.executeCommand("markdown.showPreview", changelogPath);
        }
      });
  }
  // ----------------------------------------

  let colors = generateColors(60);

  // initialize decorations
  createDecorations(colors);
  initScopeDecorations();

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

  // statusbar
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );

  function updateStatusBar() {
    statusBar.text = isEnabled ? "🌈 PB: ON" : "⚫ PB: OFF";

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
    setTimeout(() => {
      runHeavy(editor);
      runLight(editor);
    }, 50);
  }

  // editor switch
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        setTimeout(() => {
          runHeavy(editor);
          runLight(editor);
        }, 50);
      }
    }),
  );

  // document change
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && event.document === editor.document) {
        runHeavy(editor);
      }
    }),
  );

  // cursor move
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((event) => {
      runLight(event.textEditor);
    }),
  );

  // new file open
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((doc) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && editor.document === doc) {
        runHeavy(editor);
        runLight(editor);
      }
    }),
  );

  // visible range
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorVisibleRanges((event) => {
      runHeavy(event.textEditor);
    }),
  );

  // theme change
  context.subscriptions.push(
    vscode.window.onDidChangeActiveColorTheme(() => {
      colors = generateColors(60);

      createDecorations(colors);
      initScopeDecorations();

      const editor = vscode.window.activeTextEditor;
      if (editor) {
        runHeavy(editor);
        runLight(editor);
      }
    }),
  );

  // tooltip
  registerTooltip(context);

  // commands
  registerCommands(context, runHeavy, updateStatusBar);
}

export function deactivate() {}
