import * as vscode from "vscode";

// color palette
const colors = [
  "#ff0000", 
  "#ffff00", 
  "#00ff00",
  "#00ffff",
  "#ff00ff",
  "#ff8800",
  "#00ff88",
  "#0088ff",
  "#aa00ff",
  "#ff0088",
];

// Create decorations once
const decorationTypes = colors.map((color) =>
  vscode.window.createTextEditorDecorationType({
    color,
    fontWeight: "bold",
    textDecoration: "0 0 8px currentColor",
  }),
);

export function activate(context: vscode.ExtensionContext) {
  const hasShown = context.globalState.get("prismbrackets.welcomeShown");

  if (!hasShown) {
    vscode.window.showInformationMessage("PrismBrackets activated ✨");
    context.globalState.update("prismbrackets.welcomeShown", true);
  }

  // Status bar
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );

  statusBar.text = "🌈 PrismBrackets";
  statusBar.tooltip = "PrismBrackets is active";
  statusBar.show();

  context.subscriptions.push(statusBar);

  // Run immediately
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    colorizeBrackets(editor);
  }

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {
      colorizeBrackets(editor);
    }
  });

  vscode.workspace.onDidChangeTextDocument((event) => {
    const editor = vscode.window.activeTextEditor;
    if (editor && event.document === editor.document) {
      colorizeBrackets(editor);
    }
  });
}

function colorizeBrackets(editor: vscode.TextEditor) {
  const text = editor.document.getText();

  let stack: string[] = [];

  const decorations: vscode.DecorationOptions[][] = colors.map(() => []);

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // Opening
    if ("({[".includes(char)) {
      stack.push(char);
      const depth = (stack.length - 1) % colors.length;

      decorations[depth].push({
        range: new vscode.Range(
          editor.document.positionAt(i),
          editor.document.positionAt(i + 1),
        ),
      });
    }

    // Closing
    else if (")}]".includes(char)) {
      const depth = (stack.length - 1) % colors.length;

      decorations[depth].push({
        range: new vscode.Range(
          editor.document.positionAt(i),
          editor.document.positionAt(i + 1),
        ),
      });

      stack.pop();
    }
  }

  // Apply (reuse decorations)
  decorationTypes.forEach((decorationType, i) => {
    editor.setDecorations(decorationType, decorations[i]);
  });
}

export function deactivate() {}
