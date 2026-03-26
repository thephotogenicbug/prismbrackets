import * as vscode from "vscode";

// debounce
let timeout: ReturnType<typeof setTimeout> | undefined;

function triggerUpdate(editor: vscode.TextEditor) {
  if (!editor) {
    return;
  }

  if (timeout) {
    clearTimeout(timeout);
  }

  timeout = setTimeout(() => {
    colorizeBrackets(editor);
  }, 80);
}

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

// decorations
const decorationTypes = colors.map((color) =>
  vscode.window.createTextEditorDecorationType({
    color,
    fontWeight: "bold",
    textDecoration: "0 0 8px currentColor",
  }),
);

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

  // dispose decorations
  decorationTypes.forEach((d) => context.subscriptions.push(d));
  context.subscriptions.push(matchDecoration);

  // initial run
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    triggerUpdate(editor);
  }

  // events
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {
      triggerUpdate(editor);
    }
  });

  vscode.workspace.onDidChangeTextDocument((event) => {
    if (!event.contentChanges.length) {
      return;
    }

    const editor = vscode.window.activeTextEditor;
    if (editor && event.document === editor.document) {
      triggerUpdate(editor);
    }
  });

  vscode.window.onDidChangeTextEditorSelection((event) => {
    highlightMatchingBracket(event.textEditor);
  });
}

// main logic
function colorizeBrackets(editor: vscode.TextEditor) {
  const doc = editor.document;
  const fullText = doc.getText();

  const decorations: vscode.DecorationOptions[][] = colors.map(() => []);

  // proper stack with validation
  let stack: { char: string; index: number }[] = [];
  const depthMap: number[] = [];

  const pairs: Record<string, string> = {
    "(": ")",
    "{": "}",
    "[": "]",
  };

  for (let i = 0; i < fullText.length; i++) {
    const char = fullText[i];

    if ("({[".includes(char)) {
      stack.push({ char, index: i });
      depthMap[i] = stack.length - 1;
    } else if (")}]".includes(char)) {
      const last = stack[stack.length - 1];

      if (last && pairs[last.char] === char) {
        depthMap[i] = stack.length - 1;
        stack.pop();
      } else {
        depthMap[i] = 0; // invalid pair fallback
      }
    }
  }

  // render only visible
  for (const range of editor.visibleRanges) {
    const start = doc.offsetAt(range.start);
    const end = doc.offsetAt(range.end);

    for (let i = start; i < end; i++) {
      const char = fullText[i];

      if ("(){}[]".includes(char)) {
        const depth = (depthMap[i] ?? 0) % colors.length;

        decorations[depth].push({
          range: new vscode.Range(doc.positionAt(i), doc.positionAt(i + 1)),
        });
      }
    }
  }

  decorationTypes.forEach((decorationType, i) => {
    editor.setDecorations(decorationType, decorations[i]);
  });
}

// matching highlight
function highlightMatchingBracket(editor: vscode.TextEditor) {
  const doc = editor.document;
  const pos = editor.selection.active;
  const text = doc.getText();

  let index = doc.offsetAt(pos);
  let char = text[index];

  if (!"(){}[]".includes(char) && index > 0) {
    index = index - 1;
    char = text[index];
  }

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
      if (text[i] === char) {
        stack++;
      } else if (text[i] === matchChar) {
        if (stack === 0) {
          applyMatch(editor, index, i);
          return;
        }
        stack--;
      }
    }
  } else {
    for (let i = index - 1; i >= 0; i--) {
      if (text[i] === char) {
        stack++;
      } else if (text[i] === matchChar) {
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
