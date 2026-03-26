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

// create decorations once
const decorationTypes = colors.map((color) =>
  vscode.window.createTextEditorDecorationType({
    color,
    fontWeight: "bold",
    textDecoration: "0 0 8px currentColor",
  }),
);

// matching bracket decoration
const matchDecoration = vscode.window.createTextEditorDecorationType({
  border: "1px solid currentColor",
  textDecoration: "0 0 12px currentColor",
  fontWeight: "bold",
});

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

  // events
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

  // matching bracket listener 
  vscode.window.onDidChangeTextEditorSelection((event) => {
    highlightMatchingBracket(event.textEditor);
  });
}

// bracket coloring
function colorizeBrackets(editor: vscode.TextEditor) {
  const text = editor.document.getText();

  let stack: string[] = [];
  const decorations: vscode.DecorationOptions[][] = colors.map(() => []);

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // opening
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

    // closing
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

  // apply colors
  decorationTypes.forEach((decorationType, i) => {
    editor.setDecorations(decorationType, decorations[i]);
  });
}

// highlight matching brackets
function highlightMatchingBracket(editor: vscode.TextEditor) {
  const doc = editor.document;
  const pos = editor.selection.active;
  const text = doc.getText();

  const index = doc.offsetAt(pos);
  const char = text[index];

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

  const isOpening = "({[".includes(char);
  const matchChar = pairs[char];

  let stack = 0;

  if (isOpening) {
    for (let i = index + 1; i < text.length; i++) {
      if (text[i] === char) {stack++;}
      else if (text[i] === matchChar) {
        if (stack === 0) {
          applyMatch(editor, index, i);
          return;
        }
        stack--;
      }
    }
  } else {
    for (let i = index - 1; i >= 0; i--) {
      if (text[i] === char) {stack++;}
      else if (text[i] === matchChar) {
        if (stack === 0) {
          applyMatch(editor, i, index);
          return;
        }
        stack--;
      }
    }
  }

  editor.setDecorations(matchDecoration, []);
}

// apply highlight
function applyMatch(editor: vscode.TextEditor, start: number, end: number) {
  const doc = editor.document;

  editor.setDecorations(matchDecoration, [
    {
      range: new vscode.Range(doc.positionAt(start), doc.positionAt(start + 1)),
    },
    {
      range: new vscode.Range(doc.positionAt(end), doc.positionAt(end + 1)),
    },
  ]);
}

export function deactivate() {}
